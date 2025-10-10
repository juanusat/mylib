import { readonlyFields, columnMetadata, setColumnMetadata } from './config.js';
import { renderDocumentSections } from './documents.js';
import { setFieldValue, configureReadonlyFields, getFieldValue, cleanPastedText, updateCharacterCounter, autoResizeTextarea } from './utils.js';

export function preserveTableSelection() {
    const highlightedRow = document.querySelector('tr.row-highlight');
    const highlightedCell = document.querySelector('td.cell-highlight');
    
    if (!highlightedRow || !highlightedCell) return null;
    
    const rowIndex = Array.from(highlightedRow.parentNode.children).indexOf(highlightedRow);
    const cellIndex = Array.from(highlightedRow.children).indexOf(highlightedCell);
    
    return { rowIndex, cellIndex };
}

export function restoreTableSelection(selectionState) {
    if (!selectionState) return;
    
    const tbody = document.getElementById('articlesTable');
    if (!tbody) return;
    
    const targetRow = tbody.children[selectionState.rowIndex];
    if (!targetRow) return;
    
    const targetCell = targetRow.children[selectionState.cellIndex];
    if (!targetCell) return;
    
    document.querySelectorAll('td.cell-highlight').forEach(cell => {
        cell.classList.remove('cell-highlight');
    });
    document.querySelectorAll('tr.row-highlight').forEach(row => {
        row.classList.remove('row-highlight');
    });
    
    targetCell.classList.add('cell-highlight');
    targetRow.classList.add('row-highlight');
}

// Función para resetear el estado del botón de importación
function resetImportButtonState() {
    const button = document.getElementById('importButton');
    const textSpan = document.getElementById('importButtonText');
    const loadingSpan = document.getElementById('importButtonLoading');
    
    if (button && textSpan && loadingSpan) {
        button.disabled = false;
        textSpan.classList.remove('hidden');
    }
}

export function showDuplicateConfirmation(data) {
    const modal = document.getElementById('confirmModal');
    const duplicateInfo = document.getElementById('duplicateInfo');
    
    // Update counts
    document.getElementById('totalCount').textContent = data.total_in_csv;
    document.getElementById('existingCount').textContent = data.existing_count;
    document.getElementById('newCount').textContent = data.new_count;
    
    // Show existing articles
    if (data.existing_articles.length > 0) {
        const articlesList = data.existing_articles.map(article => 
            `<div class="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <strong>ID ${article.id}:</strong> ${article.titulo_original || 'Sin título'}
                <br><span class="text-gray-600">DOI: ${article.doi || 'N/A'}</span>
            </div>`
        ).join('');
        
        duplicateInfo.innerHTML = `
            <div class="mb-4">
                <h4 class="font-semibold text-orange-600 mb-2">Artículos ya registrados:</h4>
                <div class="space-y-2 max-h-32 overflow-y-auto">
                    ${articlesList}
                </div>
            </div>
        `;
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

export function closeConfirmModal() {
    document.getElementById('confirmModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
    // Resetear el estado del botón si se cancela
    resetImportButtonState();
}

export function proceedWithImport() {
    closeConfirmModal();
    importCSV(false);
}

export function forceImport() {
    closeConfirmModal();
    importCSV(true);
}

export function closeModal() {
    const selectionState = preserveTableSelection();
    
    document.getElementById('editModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    import('./table.js').then(module => {
        module.renderTable();
        setTimeout(() => restoreTableSelection(selectionState), 50);
    }).catch(error => {
        console.error('Error re-rendering table after modal close:', error);
    });
}

export function showMessage(message, type) {
    const messageDiv = document.getElementById('importMessage');
    messageDiv.className = `mt-4 p-3 rounded ${type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`;
    messageDiv.textContent = message;
    messageDiv.classList.remove('hidden');
    
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 5000);
}

export function showModalMessage(message, type) {
    const messageDiv = document.getElementById('modalMessage');
    if (messageDiv) {
        messageDiv.className = `p-3 rounded ${type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`;
        messageDiv.textContent = message;
        messageDiv.classList.remove('hidden');
        
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 5000);
    } else {
        // Fallback a showMessage si no existe modalMessage
        showMessage(message, type);
    }
}

export function clearModalMessage() {
    const messageDiv = document.getElementById('modalMessage');
    if (messageDiv) {
        messageDiv.classList.add('hidden');
    }
}
export function showInstructionsMessage(message, type) {
    const messageDiv = document.getElementById('instructionsMessage');
    messageDiv.className = `p-3 rounded ${type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 
                                        type === 'info' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
                                        'bg-red-100 text-red-700 border border-red-200'}`;
    messageDiv.textContent = message;
    messageDiv.classList.remove('hidden');
    
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 4000);
}

export async function openInstructionsModal() {
    try {
        await loadColumnMetadata();
        
        const instructionsText = generateInstructionsPrompt();
        document.getElementById('instructionsText').value = instructionsText;
        
        const instructionsTextJSON = generateInstructionsPromptJSON();
        document.getElementById('instructionsTextJSON').value = instructionsTextJSON;
        
        // Clear JSON input area and set up paste listener
        const jsonInputArea = document.getElementById('jsonInputArea');
        if (jsonInputArea) {
            jsonInputArea.value = '';
            
            // Remove existing paste listener to avoid duplicates
            jsonInputArea.removeEventListener('paste', handleJSONAreaPaste);
            // Add paste listener for auto-cleanup
            jsonInputArea.addEventListener('paste', handleJSONAreaPaste);
            
            // Remove existing dblclick listener to avoid duplicates
            jsonInputArea.removeEventListener('dblclick', handleJSONAreaDoubleClick);
            // Add dblclick listener to allow manual cleaning with Alt key
            jsonInputArea.addEventListener('dblclick', handleJSONAreaDoubleClick);
        }
        
        document.getElementById('instructionsModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error in openInstructionsModal:', error);
        showMessage('Error al generar las instrucciones: ' + error.message, 'error');
    }
}

export function generateInstructionsPrompt() {
    const currentDate = new Date().toLocaleDateString('es-ES');
    
    let prompt = `# INSTRUCCIONES PARA ANÁLISIS DE ARTÍCULO CIENTÍFICO

Por favor, complete los siguientes campos basándose en la lectura cuidadosa del artículo científico. Los campos están listados en formato YAML para facilitar la comprensión y completado.

---

`;

    // Check if columnMetadata is available
    if (!columnMetadata || !Array.isArray(columnMetadata) || columnMetadata.length === 0) {
        prompt += `\nNo se pudieron cargar los metadatos de las columnas. Por favor, recargue la página e intente nuevamente.\n`;
        return prompt;
    }

    const fieldsToComplete = columnMetadata.filter(col => {
        // Excluir campos que tienen valor en id_from_backup (importados del CSV)
        if (col.id_from_backup && col.id_from_backup.trim() !== '') return false;
        if (col.dato_fijo && col.dato_fijo.trim() !== '') return false;
        const excludeWords = ['quartil', 'seleccionado'];
        if (col.columna && excludeWords.some(word => col.columna.toLowerCase().includes(word))) return false;
        return true;
    });

    // Generate YAML format
    prompt += `\`\`\`yaml
# CAMPOS A COMPLETAR
campos_analisis:
`;

    for (const column of fieldsToComplete) {
        prompt += `  - campo: "${column.columna}"\n`;
        if (column.idioma_deseado_redactar) prompt += `    idioma: "${column.idioma_deseado_redactar}"\n`;
        if (column.explicacion) prompt += `    descripcion: "${column.explicacion}"\n`;
        if (column.formato) prompt += `    formato: "${column.formato}"\n`;
        if (column.max && column.max > 0) prompt += `    maximo_caracteres: ${column.max}\n`;
        prompt += `\n`;
    }

    prompt += '```\n\n---\n\n';

    prompt += `## INSTRUCCIONES GENERALES:\n\n`;
    prompt += `1. **Lectura completa**: Lea todo el artículo antes de comenzar el análisis\n`;
    prompt += `2. **Precisión**: Sea específico y preciso en sus respuestas\n`;
    prompt += `3. **Límites de caracteres**: Respete el número máximo de caracteres indicado para cada campo cuando esté especificado\n`;
    prompt += `4. **Información faltante**: Si alguna información no está disponible, indique "No especificado" o "No disponible"\n`;
    prompt += `5. **Objetividad**: Base sus respuestas únicamente en el contenido del artículo\n`;
    prompt += `6. **Traducciones**: Para campos de traducción, mantenga el sentido original pero use español claro y académico\n`;
    prompt += `7. **Realismo**: Se penaliza si completa información que el documento no mencione, es preferible indicar que no hay información al respecto en vez de inventarla.\n`;
    prompt += `8. **Redacción**: Use un lenguaje no tan técnico, debe ser comprensible, manteniendo un tono académico. Las respuestas se dan en bloques de código de texto plano. IMPORTANTE: NADA DE FORMATO.\n`;
    prompt += `9. **Citas**: Puedes mencionar al autor y año si el caso lo amerita, pero no coloques el número de página como parte de ninguna referencia.\n\n`;

    prompt += `## FORMATO DE RESPUESTA:\nPara cada campo listado arriba, proporcione su respuesta en el siguiente formato:\n"""\n**<Nombre del campo exacto>:**\n\n\`\`\`\n<Su respuesta aquí>\n\`\`\`\n"""\n\n`;

    return prompt;
}

export function generateInstructionsPromptJSON() {
    const currentDate = new Date().toLocaleDateString('es-ES');
    
    let prompt = `# INSTRUCCIONES PARA ANÁLISIS DE ARTÍCULO CIENTÍFICO - FORMATO JSON

Por favor, complete los siguientes campos basándose en la lectura cuidadosa del artículo científico. 

**IMPORTANTE: Debe entregar su respuesta como un ARRAY JSON dentro de un bloque de código markdown.**

---

`;

    // Check if columnMetadata is available
    if (!columnMetadata || !Array.isArray(columnMetadata) || columnMetadata.length === 0) {
        prompt += `\nNo se pudieron cargar los metadatos de las columnas. Por favor, recargue la página e intente nuevamente.\n`;
        return prompt;
    }

    const fieldsToComplete = columnMetadata.filter(col => {
        // Excluir campos que tienen valor en id_from_backup (importados del CSV)
        if (col.id_from_backup && col.id_from_backup.trim() !== '') {
            return false;
        }
        
        if (col.dato_fijo && col.dato_fijo.trim() !== '') {
            return false;
        }
        
        const excludeWords = ['quartil', 'seleccionado'];
        if (
            col.columna &&
            excludeWords.some(word => col.columna.toLowerCase().includes(word))
        ) {
            return false;
        }
        return true;
    });

    // Generate YAML format for reference
    prompt += `## CAMPOS A COMPLETAR (EN ORDEN):\n\n\`\`\`yaml
`;

    fieldsToComplete.forEach((column, index) => {
        prompt += `${index + 1}. campo: "${column.columna}"\n`;
        if (column.idioma_deseado_redactar) {
            prompt += `   idioma: "${column.idioma_deseado_redactar}"\n`;
        }
        if (column.explicacion) {
            prompt += `   descripcion: "${column.explicacion}"\n`;
        }
        if (column.formato) {
            prompt += `   formato: "${column.formato}"\n`;
        }
        if (column.max && column.max > 0) {
            prompt += `   maximo_caracteres: ${column.max}\n`;
        }
        prompt += `\n`;
    });

    prompt += `\`\`\`

---

## INSTRUCCIONES GENERALES:

1. **Lectura completa**: Lea todo el artículo antes de comenzar el análisis
2. **Precisión**: Sea específico y preciso en sus respuestas
3. **Límites de caracteres**: Respete el número máximo de caracteres indicado para cada campo cuando esté especificado
4. **Información faltante**: Si alguna información no está disponible, indique "No especificado" o "No disponible"
5. **Objetividad**: Base sus respuestas únicamente en el contenido del artículo
6. **Traducciones**: Para campos de traducción, mantenga el sentido original pero use español claro y académico
7. **Realismo**: Se penaliza si completa información que el documento no mencione, es preferible indicar que no hay información al respecto en vez de inventarla.
8. **Redacción**: Use un lenguaje no tan técnico, debe ser comprensible, manteniendo un tono académico. Las respuestas son texto plano sin formato.
9. **Citas**: Puedes mencionar al autor y año si el caso lo amerita, pero no coloques el número de página como parte de ninguna referencia.

---

## FORMATO DE RESPUESTA REQUERIDO:

**DEBE entregar su respuesta como un ARRAY JSON con objetos en el MISMO ORDEN que se presentan arriba:**

\`\`\`json
[
`;

    // Generate example JSON structure
    fieldsToComplete.forEach((column, index) => {
        const comma = index < fieldsToComplete.length - 1 ? ',' : '';
        prompt += `  {\n`;
        prompt += `    "atributo": "${column.columna}",\n`;
        prompt += `    "contenido": "Su respuesta aquí"\n`;
        prompt += `  }${comma}\n`;
    });

        prompt += `]
\`\`\`

**IMPORTANTE:**
- Debe ser un ARRAY (corchetes []) de objetos
- Cada objeto debe tener las propiedades "atributo" y "contenido"
- La propiedad "contenido" DEBE ser una CADENA ÚNICA (string). No devuelva objetos ni arrays dentro de "contenido".
- Si su modelo produce naturalmente múltiples párrafos o una lista (array), concaténelos en una sola cadena usando un salto de línea "\\n" entre elementos.
- Debe respetar el MISMO ORDEN en que se presentan los campos arriba
- La propiedad "atributo" es REFERENCIAL (puede usar nombres simplificados si lo desea)
- El sistema asignará los valores por POSICIÓN en el array, no por el nombre del atributo
- Use comillas dobles para las propiedades y valores
- Asegúrese de que el JSON sea válido
- No incluya comentarios dentro del JSON
- Si un valor contiene comillas, escápelas con \\

**EJEMPLO DE FORMATO CORRECTO:**
\`\`\`json
[
    {
        "atributo": "Título",
        "contenido": "Análisis de deep learning en imágenes médicas"
    },
    {
        "atributo": "Resumen",
        "contenido": "Este artículo presenta un estudio sobre..."
    }
]
\`\`\`

`;
    return prompt;
}

export async function regenerateInstructions() {
    try {
        await loadColumnMetadata();
        const instructionsText = generateInstructionsPrompt();
        document.getElementById('instructionsText').value = instructionsText;
        showInstructionsMessage('Instrucciones regeneradas', 'success');
    } catch (error) {
        console.error('Error regenerating instructions:', error);
        showInstructionsMessage('Error al regenerar las instrucciones', 'error');
    }
}

export async function regenerateInstructionsJSON() {
    try {
        await loadColumnMetadata();
        const instructionsText = generateInstructionsPromptJSON();
        document.getElementById('instructionsTextJSON').value = instructionsText;
        showInstructionsMessage('Instrucciones JSON regeneradas', 'success');
    } catch (error) {
        console.error('Error regenerating JSON instructions:', error);
        showInstructionsMessage('Error al regenerar las instrucciones JSON', 'error');
    }
}

export async function copyInstructions(event) {
    const textArea = document.getElementById('instructionsText');
    const button = event?.target || document.querySelector('button[onclick="copyInstructions(event)"]');
    
    // Check if clipboard API is available
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(textArea.value);
            
            // Visual feedback
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i> Copiado';
                button.classList.remove('bg-green-600', 'hover:bg-green-700');
                button.classList.add('bg-green-800');
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('bg-green-800');
                    button.classList.add('bg-green-600', 'hover:bg-green-700');
                }, 2000);
            }
            return;
        } catch (err) {
            console.error('Error copying to clipboard:', err);
        }
    }
    
    // Fallback: try the older document.execCommand method
    try {
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, textArea.value.length);
        
        const successful = document.execCommand('copy');
        if (successful) {
            showInstructionsMessage('Texto copiado al portapapeles', 'success');
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i> Copiado';
                button.classList.remove('bg-green-600', 'hover:bg-green-700');
                button.classList.add('bg-green-800');
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('bg-green-800');
                    button.classList.add('bg-green-600', 'hover:bg-green-700');
                }, 2000);
            }
        } else {
            throw new Error('execCommand failed');
        }
    } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
        
        // Final fallback: just select the text
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, textArea.value.length);
        showInstructionsMessage('Texto seleccionado. Use Ctrl+C para copiar manualmente', 'info');
    }
}

export async function copyInstructionsJSON(event) {
    const textArea = document.getElementById('instructionsTextJSON');
    const button = event?.target || document.querySelector('button[onclick="copyInstructionsJSON(event)"]');
    
    // Check if clipboard API is available
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(textArea.value);
            
            // Visual feedback
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i> Copiado';
                button.classList.remove('bg-green-600', 'hover:bg-green-700');
                button.classList.add('bg-green-800');
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('bg-green-800');
                    button.classList.add('bg-green-600', 'hover:bg-green-700');
                }, 2000);
            }
            return;
        } catch (err) {
            console.error('Error copying to clipboard:', err);
        }
    }
    
    // Fallback: try the older document.execCommand method
    try {
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, textArea.value.length);
        
        const successful = document.execCommand('copy');
        if (successful) {
            showInstructionsMessage('Texto copiado al portapapeles', 'success');
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i> Copiado';
                button.classList.remove('bg-green-600', 'hover:bg-green-700');
                button.classList.add('bg-green-800');
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('bg-green-800');
                    button.classList.add('bg-green-600', 'hover:bg-green-700');
                }, 2000);
            }
        } else {
            throw new Error('execCommand failed');
        }
    } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
        
        // Final fallback: just select the text
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, textArea.value.length);
        showInstructionsMessage('Texto seleccionado. Use Ctrl+C para copiar manualmente', 'info');
    }
}

export function validateAndApplyJSON() {
    const jsonTextarea = document.getElementById('jsonInputArea');
    const jsonText = jsonTextarea.value.trim();
    
    if (!jsonText) {
        showInstructionsMessage('Por favor, pegue un JSON en el área de texto', 'error');
        return;
    }
    
    try {
        // Try to extract JSON from markdown code block
        let jsonContent = jsonText;
        const codeBlockMatch = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        
        if (codeBlockMatch) {
            jsonContent = codeBlockMatch[1].trim();
        }
        
        // Parse JSON
        const data = JSON.parse(jsonContent);
        
        // Validate that it's an array
        if (!Array.isArray(data)) {
            throw new Error('El JSON debe ser un array de objetos, no un objeto u otro tipo');
        }
        
        // Validate array structure
        if (data.length === 0) {
            throw new Error('El array está vacío');
        }
        
        // Validate each element has the required structure
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if (typeof item !== 'object' || item === null) {
                throw new Error(`Elemento ${i + 1}: debe ser un objeto`);
            }
            if (!item.hasOwnProperty('atributo')) {
                throw new Error(`Elemento ${i + 1}: falta la propiedad "atributo"`);
            }
            if (!item.hasOwnProperty('contenido')) {
                throw new Error(`Elemento ${i + 1}: falta la propiedad "contenido"`);
            }
            
            // If contenido is an array, concatenate with line breaks
            if (Array.isArray(item.contenido)) {
                item.contenido = item.contenido.join('\n');
            }
        }
        
        // Show validation success
        showInstructionsMessage(`✓ JSON válido con ${data.length} elementos. Aplicando datos a los campos...`, 'success');
        
        // Apply data to fields
        setTimeout(() => {
            applyJSONToFields(data);
        }, 500);
        
    } catch (error) {
        console.error('Error validating JSON:', error);
        showInstructionsMessage('Error: JSON inválido - ' + error.message, 'error');
    }
}

// Array ordenado que mapea posición del JSON → ID del campo HTML
// Este orden corresponde EXACTAMENTE al orden en que se generan los campos en generateInstructionsPromptJSON()
// Basado en el debug log de fieldsToComplete
function getFieldIdsByOrder() {
    return [
        'titulo_espanol',             // 0: Título (español)
        'resumen',                    // 1: Resumen
        'problema_articulo',          // 2: Problema a solucionar en el artículo
        'edit_datos_estadisticos',    // 3: Datos estadísticos
        'pregunta_investigacion',     // 4: Pregunta de investigación
        'edit_objetivo_original',     // 5: Objetivo(s) (original) - TIENE id_from_backup pero aparece en la lista
        'objetivo_espanol',           // 6: Objetivo(s) (español)
        'objetivo_reescrito',         // 7: Objetivo reescrito
        'justificacion',              // 8: Justificación
        'hipotesis',                  // 9: Hipótesis
        'tipo_investigacion',         // 10: Tipo de investigacion
        'edit_estudios_previos',      // 11: Estudios previos
        'edit_poblacion_muestra_datos', // 12: Población/muestra/datos
        'edit_recoleccion_datos',     // 13: Recolección de datos
        'resultados',                 // 14: Resultados
        'conclusiones',               // 15: Conclusiones
        'edit_discusion',             // 16: Discución
        'edit_trabajos_futuros'       // 17: Trabajos futuros
    ];
}

export function applyJSONToFields(dataArray) {
    let appliedCount = 0;
    let skippedCount = 0;
    const skippedFields = [];
    
    // Get ordered array of field IDs
    const orderedFieldIds = getFieldIdsByOrder();
    
    // Get the fields from metadata in the same order they were presented
    const fieldsToComplete = columnMetadata.filter(col => {
        if (col.id_from_backup && col.id_from_backup.trim() !== '') {
            return false;
        }
        if (col.dato_fijo && col.dato_fijo.trim() !== '') {
            return false;
        }
        const excludeWords = ['quartil', 'seleccionado'];
        if (col.columna && excludeWords.some(word => col.columna.toLowerCase().includes(word))) {
            return false;
        }
        return true;
    });
    
    // Debug: log the expected fields
    console.log('=== DEBUG: Campos esperados ===');
    fieldsToComplete.forEach((field, idx) => {
        console.log(`${idx}: ${field.columna} (idioma: ${field.idioma_deseado_redactar || 'N/A'})`);
    });
    console.log('=== FIN DEBUG ===');
    
    // Apply values by position in the array
    const maxItems = Math.min(dataArray.length, orderedFieldIds.length);
    
    for (let i = 0; i < maxItems; i++) {
        const item = dataArray[i];
        const fieldId = orderedFieldIds[i];
        const metadataName = fieldsToComplete[i] ? fieldsToComplete[i].columna : `Posición ${i}`;
        
        if (!fieldId) {
            console.warn(`Posición ${i}: Campo nulo/undefined en orderedFieldIds (saltando)`);
            skippedFields.push(`Pos ${i}: ${item.atributo} (no mapeado)`);
            skippedCount++;
            continue;
        }
        
        try {
            // Find the input field by ID
            const input = document.getElementById(fieldId);
            
            if (!input) {
                console.warn(`Posición ${i}: Campo no encontrado en el formulario: ${fieldId} (metadata: "${metadataName}")`);
                skippedFields.push(`Pos ${i}: ${metadataName} (${fieldId} no encontrado)`);
                skippedCount++;
                continue;
            }
            
            // Check if field is readonly (imported from Scopus)
            if (input.hasAttribute('readonly') || input.classList.contains('scopus-imported-field')) {
                console.log(`Posición ${i}: Campo de solo lectura omitido: ${fieldId} (metadata: "${metadataName}")`);
                skippedFields.push(`Pos ${i}: ${metadataName} (solo lectura)`);
                skippedCount++;
                continue;
            }
            
            // Set the value using the contenido property
            setFieldValue(fieldId, item.contenido);
            appliedCount++;
            
            console.log(`✓ Posición ${i} aplicada: ${fieldId} = "${item.atributo}" (${item.contenido.length} caracteres)`);
            
        } catch (error) {
            console.error(`Error aplicando posición ${i} (${fieldId}):`, error);
            skippedFields.push(`Pos ${i}: ${fieldId}`);
            skippedCount++;
        }
    }
    
    // Show summary message
    let message = `✓ Datos aplicados: ${appliedCount} campos actualizados`;
    
    if (dataArray.length > orderedFieldIds.length) {
        message += `. Advertencia: El JSON tiene ${dataArray.length - orderedFieldIds.length} elementos extra que fueron ignorados`;
    } else if (dataArray.length < orderedFieldIds.length) {
        message += `. Nota: Faltan ${orderedFieldIds.length - dataArray.length} campos por completar`;
    }
    
    if (skippedCount > 0) {
        message += `. ${skippedCount} campos omitidos`;
        if (skippedFields.length > 0) {
            console.warn('Campos omitidos:', skippedFields);
        }
    }
    
    showInstructionsMessage(message, appliedCount > 0 ? 'success' : 'error');
    
    // Close modal after successful application (wait 5 seconds)
    if (appliedCount > 0) {
        setTimeout(() => {
            closeInstructionsModal();
        }, 5000);
    }
}

// Handler for paste event in JSON input area
function handleJSONAreaPaste(event) {
    setTimeout(() => {
        const textarea = event.target;
        let text = textarea.value;
        
        // Clean markdown code blocks
        const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        if (codeBlockMatch) {
            text = codeBlockMatch[1].trim();
            textarea.value = text;
        }
    }, 300);
}

// Handler for manual cleaning on Alt + double click inside the JSON textarea
function handleJSONAreaDoubleClick(event) {
    try {
        if (!event.altKey) return;

        const textarea = event.target;
        if (!textarea) return;

        const original = textarea.value || '';

        const codeBlockMatch = original.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        let content = original;
        if (codeBlockMatch) {
            content = codeBlockMatch[1].trim();
        }

        const cleaned = cleanPastedText(content);
        if (cleaned === original) return;
        textarea.value = cleaned;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        showInstructionsMessage('Texto limpiado', 'success');

    } catch (error) {
        console.error('Error en Alt+doubleclick JSON cleaner:', error);
    }
}

export function closeInstructionsModal() {
    document.getElementById('instructionsModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

export async function loadColumnMetadata() {
    try {
        const response = await fetch('/api/field-metadata');
        const data = await response.json();
        const metadata = data.columns || data;
        setColumnMetadata(metadata);
        return metadata;
    } catch (error) {
        console.error('Error loading column metadata:', error);
        return [];
    }
}

// Function to remove AI-generated syntax from all editable fields
export function removeSyntaxFromFields() {
    // Array of all field IDs in the edit modal (excluding readonly)
    const editableFieldIds = [
        'edit_base_datos', 'edit_quartil_revista',
        'titulo_espanol', 'resumen',
        'problema_articulo', 'pregunta_investigacion',
        'tipo_investigacion', 'edit_datos_estadisticos',
        'objetivo_espanol', 'objetivo_reescrito', 'justificacion', 'hipotesis',
        'edit_estudios_previos', 'edit_poblacion_muestra_datos', 'edit_recoleccion_datos',
        'resultados', 'conclusiones', 'edit_discusion', 'edit_trabajos_futuros',
        'edit_enlace'
    ];
    
    // Add objective_original only if it's not readonly
    const objectiveField = document.getElementById('edit_objetivo_original');
    if (objectiveField && !objectiveField.hasAttribute('readonly') && !objectiveField.classList.contains('scopus-imported-field')) {
        editableFieldIds.push('edit_objetivo_original');
    }
    
    let totalReplacements = 0;
    
    editableFieldIds.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        
        // Skip if field doesn't exist or is readonly
        if (!field || field.hasAttribute('readonly') || field.classList.contains('scopus-imported-field')) {
            return;
        }
        
        const originalValue = field.value || '';
        if (!originalValue.trim()) return; // Skip empty fields
        
        // Use cleanPastedText function to clean the text
        const cleanedValue = cleanPastedText(originalValue);
        
        // Count the number of changes
        if (cleanedValue !== originalValue) {
            // Count replacements by comparing lengths and patterns
            const citePatternsRemoved = (originalValue.match(/\[cite[^\]]*\]/g) || []).length;
            const asterisksRemoved = (originalValue.match(/\*\*/g) || []).length;
            const bulletPointsChanged = (originalValue.match(/^(\s*)\* /gm) || []).length;
            const semicolonSpacesRemoved = (originalValue.match(/\s+;\s+/g) || []).length;
            const trailingSpacesRemoved = (originalValue.match(/\.\s+$/gm) || []).length;
            
            const fieldReplacements = citePatternsRemoved + asterisksRemoved + bulletPointsChanged + semicolonSpacesRemoved + trailingSpacesRemoved;
            totalReplacements += fieldReplacements;
            
            // Update field value
            field.value = cleanedValue;
            
            // Update character counter if exists
            updateCharacterCounter(fieldId);
            
            // Auto-resize textarea if it's a textarea element
            if (field.tagName.toLowerCase() === 'textarea') {
                autoResizeTextarea(field);
            }
            
            // Trigger input event for any listeners
            field.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
    
    // Show alert with number of replacements
    if (totalReplacements > 0) {
        alert(`✓ Se realizaron ${totalReplacements} reemplazo(s) de sintaxis en los campos editables.\n\nSe removieron:\n- Referencias [cite:]\n- Asteriscos de formato\n- Espacios alrededor de punto y coma\n- Espacios al final de líneas que terminan con punto\n- Viñetas convertidas a guiones`);
    } else {
        alert('No se encontró sintaxis para remover en los campos editables.');
    }
}