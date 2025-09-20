import { readonlyFields } from './config.js';

export function setFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.value = value || '';
    }
}

// Function to remove double asterisks from pasted text
export function cleanPastedText(text) {
    return text.replace(/\*\*/g, '');
}

// Function to add paste event listeners to modal fields
export function addPasteEventListeners() {
    // Array of all field IDs in the edit modal
    const modalFieldIds = [
        'edit_autor', 'edit_anio', 'edit_base_datos', 'edit_doi', 'edit_eid',
        'edit_nombre_revista', 'edit_quartil_revista', 'edit_titulo_original',
        'titulo_espanol', 'edit_abstract', 'resumen', 'edit_keywords_autor',
        'edit_keywords_indexed', 'problema_articulo', 'pregunta_investigacion',
        'tipo_investigacion', 'edit_datos_estadisticos', 'edit_objetivo_original',
        'objetivo_espanol', 'objetivo_reescrito', 'justificacion', 'hipotesis',
        'edit_estudios_previos', 'edit_poblacion_muestra_datos', 'edit_recoleccion_datos',
        'resultados', 'conclusiones', 'edit_discusion', 'edit_trabajos_futuros',
        'edit_enlace'
    ];

    modalFieldIds.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            // Remove any existing paste event listeners to avoid duplicates
            field.removeEventListener('paste', handlePasteEvent);
            
            // Add the paste event listener
            field.addEventListener('paste', handlePasteEvent);
        }
    });
}

// Separate handler function to avoid duplicates and improve performance
function handlePasteEvent(event) {
    // Prevent default paste behavior and stop propagation
    event.preventDefault();
    event.stopPropagation();
    
    try {
        const pastedText = (event.clipboardData || window.clipboardData).getData('text');
        
        const cleanedText = cleanPastedText(pastedText);
        
        const field = event.target;
        const startPos = field.selectionStart || 0;
        const endPos = field.selectionEnd || 0;
        const currentValue = field.value || '';
        
        field.value = currentValue.substring(0, startPos) + cleanedText + currentValue.substring(endPos);
        
        const newCursorPos = startPos + cleanedText.length;
        field.setSelectionRange(newCursorPos, newCursorPos);
        
        field.dispatchEvent(new Event('input', { bubbles: true }));
        
    } catch (error) {
        console.error('Error handling paste event:', error);
        event.target.value = event.target.value;
    }
}

export function getFieldValue(fieldId) {
    const field = document.getElementById(fieldId);
    return field ? field.value : '';
}

export function configureReadonlyFields() {
    // Map of database column names to form field IDs
    const fieldMapping = {
        'autor': 'edit_autor',
        'nombre_revista': 'edit_nombre_revista',
        'quartil_revista': 'edit_quartil_revista',
        'anio': 'edit_anio',
        'doi': 'edit_doi',
        'titulo_original': 'edit_titulo_original',
        'base_datos': 'edit_base_datos',
        'abstract': 'edit_abstract',
        'keywords_autor': 'edit_keywords_autor',
        'keywords_indexed': 'edit_keywords_indexed',
        'enlace': 'edit_enlace',
        'eid': 'edit_eid'
    };
    
    // Configure all fields as editable first
    Object.values(fieldMapping).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.remove('scopus-imported-field');
            field.disabled = false;
        }
    });
    
    // Make readonly fields non-editable and style them
    readonlyFields.forEach(columnName => {
        const fieldId = fieldMapping[columnName];
        if (fieldId) {
            const field = document.getElementById(fieldId);
            if (field) {
                field.classList.add('scopus-imported-field');
                // Keep them editable but visually marked
            }
        }
    });
}