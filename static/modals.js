import { readonlyFields, columnMetadata, setColumnMetadata } from './config.js';
import { renderDocumentSections } from './documents.js';
import { setFieldValue, configureReadonlyFields, getFieldValue } from './utils.js';

// Función para resetear el estado del botón de importación
function resetImportButtonState() {
    const button = document.getElementById('importButton');
    const textSpan = document.getElementById('importButtonText');
    const loadingSpan = document.getElementById('importButtonLoading');
    
    if (button && textSpan && loadingSpan) {
        button.disabled = false;
        textSpan.classList.remove('hidden');
        loadingSpan.classList.add('hidden');
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
    document.getElementById('editModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
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

    // Generate YAML format
    prompt += `\`\`\`yaml
# CAMPOS A COMPLETAR
campos_analisis:
`;

    for (const column of fieldsToComplete) {
        prompt += `  - campo: "${column.columna}"\n`;
        if (column.idioma_deseado_redactar) {
            prompt += `    idioma: "${column.idioma_deseado_redactar}"\n`;
        }
        if (column.explicacion) {
            prompt += `    descripcion: "${column.explicacion}"\n`;
        }
        if (column.formato) {
            prompt += `    formato: "${column.formato}"\n`;
        }
        if (column.max && column.max > 0) {
            prompt += `    maximo_caracteres: ${column.max}\n`;
        }
        prompt += `\n`;
    }

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
8. **Redacción**: Use un lenguaje no tan técnico, debe ser comprensible, manteniendo un tono académico.

## FORMATO DE RESPUESTA:
Para cada campo listado arriba, proporcione su respuesta en el siguiente formato:
"""
**<Nombre del campo exacto>:**

\`\`\`
<Su respuesta aquí>
\`\`\`
"""

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