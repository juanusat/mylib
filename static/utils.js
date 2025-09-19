import { readonlyFields } from './config.js';

export function setFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.value = value || '';
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