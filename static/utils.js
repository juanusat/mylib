import { readonlyFields } from './config.js';

export function setFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.value = value || '';
        // Update character counter after setting value
        updateCharacterCounter(fieldId);
    }
}

// Character limits based on database schema
export const FIELD_CHARACTER_LIMITS = {
    'edit_autor': 4000,
    'edit_nombre_revista': 500,
    'edit_quartil_revista': 50,
    'edit_titulo_original': 4000,
    'titulo_espanol': 4000,
    'edit_abstract': 4000,
    'resumen': 4000,
    'edit_keywords_autor': 4000,
    'edit_keywords_indexed': 4000,
    'problema_articulo': 4000,
    'edit_datos_estadisticos': 4000,
    'pregunta_investigacion': 4000,
    'edit_objetivo_original': 4000,
    'objetivo_espanol': 4000,
    'objetivo_reescrito': 4000,
    'justificacion': 4000,
    'hipotesis': 4000,
    'tipo_investigacion': 500,
    'edit_estudios_previos': 4000,
    'edit_poblacion_muestra_datos': 4000,
    'edit_recoleccion_datos': 4000,
    'resultados': 4000,
    'conclusiones': 4000,
    'edit_discusion': 4000,
    'edit_trabajos_futuros': 4000,
    'edit_enlace': 500,
    'edit_base_datos': 100,
    'edit_doi': 300,
    'edit_eid': 100,
    'edit_anio': null // numeric field, no character limit
};

// Function to update character counter for a specific field
export function updateCharacterCounter(fieldId) {
    const field = document.getElementById(fieldId);
    const counter = document.getElementById(`${fieldId}_counter`);
    
    if (field && counter) {
        const currentLength = field.value ? field.value.length : 0;
        const maxLength = FIELD_CHARACTER_LIMITS[fieldId];
        
        if (maxLength !== null) {
            counter.textContent = `${currentLength} / ${maxLength}`;
            
            // Add warning class if over limit
            if (currentLength > maxLength) {
                counter.classList.add('over-limit', 'text-red-600', 'font-semibold');
                counter.classList.remove('text-gray-500');
                field.classList.add('field-over-limit', 'border-red-500');
                field.classList.remove('border-gray-300');
            } else {
                counter.classList.remove('over-limit', 'text-red-600', 'font-semibold');
                counter.classList.add('text-gray-500');
                field.classList.remove('field-over-limit', 'border-red-500');
                if (!field.classList.contains('scopus-imported-field')) {
                    field.classList.add('border-gray-300');
                }
            }
        } else {
            counter.textContent = `${currentLength}`;
            counter.classList.add('text-gray-500');
        }
    }
}

// Function to add character counters and input listeners to modal fields
export function addCharacterCounters() {
    Object.keys(FIELD_CHARACTER_LIMITS).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            // Add input event listener for real-time counting
            field.addEventListener('input', () => updateCharacterCounter(fieldId));
            field.addEventListener('keyup', () => updateCharacterCounter(fieldId));
            field.addEventListener('paste', () => {
                // Update counter after paste event is processed
                setTimeout(() => updateCharacterCounter(fieldId), 10);
            });
            
            // Initial counter update
            updateCharacterCounter(fieldId);
        }
    });
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