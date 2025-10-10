import { setAllArticles, setReadonlyFields, setColumnMetadata, allArticles, filteredArticles, setFilteredArticles } from './config.js';
import { renderTable, downloadExcelFile } from './table.js';
import { renderDocumentSections } from './documents.js';
import { showDuplicateConfirmation, showMessage, showModalMessage, clearModalMessage, closeModal } from './modals.js';
import { setFieldValue, configureReadonlyFields, getFieldValue, addPasteEventListeners, addCharacterCounters } from './utils.js';

// Funciones para manejar el estado de carga del botón
export function setImportButtonLoading(loading) {
    const button = document.getElementById('importButton');
    const textSpan = document.getElementById('importButtonText');
    const loadingSpan = document.getElementById('importButtonLoading');
    
    if (loading) {
        button.disabled = true;
        textSpan.classList.add('hidden');
        loadingSpan.classList.remove('hidden');
    } else {
        button.disabled = false;
        textSpan.classList.remove('hidden');
        loadingSpan.classList.add('hidden');
    }
}

export async function loadFieldMetadata() {
    try {
        const response = await fetch('/api/field-metadata');
        const metadata = await response.json();
        setReadonlyFields(metadata.readonly_fields);
        setColumnMetadata(metadata.columns);
    } catch (error) {
        console.error('Error loading field metadata:', error);
    }
}

export async function loadArticles() {
    try {
        const response = await fetch('/api/articles');
        const articles = await response.json();
        setAllArticles(articles);
    } catch (error) {
        console.error('Error loading articles:', error);
    }
}

export async function checkCSV() {
    const fileInput = document.getElementById('csvFile');
    
    if (!fileInput.files[0]) {
        alert('Por favor selecciona un archivo CSV');
        return;
    }

    // Activar estado de carga
    setImportButtonLoading(true);

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        const response = await fetch('/api/check-csv', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.status === 'duplicates_found') {
            setImportButtonLoading(false); // Desactivar carga antes de mostrar modal
            showDuplicateConfirmation(data);
        } else if (data.status === 'ready_to_import') {
            // No desactivar carga aquí, se desactivará en importCSV
            importCSV(false);
        } else {
            setImportButtonLoading(false);
            showMessage(data.message, 'error');
        }
    } catch (error) {
        setImportButtonLoading(false);
        console.error('Error checking CSV:', error);
        showMessage('Error al verificar el archivo CSV', 'error');
    }
}

export async function importCSV(forceImport = false) {
    const fileInput = document.getElementById('csvFile');
    
    if (!fileInput.files[0]) {
        alert('Por favor selecciona un archivo CSV');
        return;
    }

    // Activar estado de carga (por si se llama directamente desde el modal)
    setImportButtonLoading(true);

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    if (forceImport) {
        formData.append('force', 'true');
    }

    try {
        const response = await fetch('/api/import-csv', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.status === 'success') {
            showMessage(data.message, 'success');
            await loadArticles();
            setFilteredArticles([...allArticles].sort((a, b) => a.id - b.id));
            renderTable();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        console.error('Error importing CSV:', error);
        showMessage('Error al importar el archivo CSV', 'error');
    } finally {
        // Siempre desactivar el estado de carga al final
        setImportButtonLoading(false);
    }
}

export async function editArticle(id) {
    try {
        const response = await fetch(`/api/articles/${id}`);
        const article = await response.json();
        
        // Calculate the article index in the current filtered view
        const articleIndex = filteredArticles.findIndex(a => a.id === parseInt(id));
        
        // Update modal title with index
        const modalTitle = document.querySelector('#editModal h3');
        if (modalTitle) {
            const indexText = articleIndex !== -1 ? ` (#${articleIndex})` : '';
            modalTitle.innerHTML = `<i class="fas fa-edit text-blue-600"></i> Editar Artículo${indexText}`;
        }
        
        // Populate form fields
        document.getElementById('articleId').value = article.id;
        setFieldValue('edit_id', article.id);
        setFieldValue('edit_autor', article.autor);
        setFieldValue('edit_anio', article.anio);
        setFieldValue('edit_base_datos', article.base_datos);
        setFieldValue('edit_doi', article.doi);
        setFieldValue('edit_eid', article.eid);
        setFieldValue('edit_nombre_revista', article.nombre_revista);
        setFieldValue('edit_quartil_revista', article.quartil_revista);
        setFieldValue('edit_titulo_original', article.titulo_original);
        setFieldValue('titulo_espanol', article.titulo_espanol);
        setFieldValue('edit_abstract', article.abstract);
        setFieldValue('resumen', article.resumen);
        setFieldValue('edit_keywords_autor', article.keywords_autor);
        setFieldValue('edit_keywords_indexed', article.keywords_indexed);
        setFieldValue('problema_articulo', article.problema_articulo);
        setFieldValue('pregunta_investigacion', article.pregunta_investigacion);
        setFieldValue('tipo_investigacion', article.tipo_investigacion);
        setFieldValue('edit_datos_estadisticos', article.datos_estadisticos);
        setFieldValue('edit_objetivo_original', article.objetivo_original);
        setFieldValue('objetivo_espanol', article.objetivo_espanol);
        setFieldValue('objetivo_reescrito', article.objetivo_reescrito);
        setFieldValue('justificacion', article.justificacion);
        setFieldValue('hipotesis', article.hipotesis);
        setFieldValue('edit_estudios_previos', article.estudios_previos);
        setFieldValue('edit_poblacion_muestra_datos', article.poblacion_muestra_datos);
        setFieldValue('edit_recoleccion_datos', article.recoleccion_datos);
        setFieldValue('resultados', article.resultados);
        setFieldValue('conclusiones', article.conclusiones);
        setFieldValue('edit_discusion', article.discusion);
        setFieldValue('edit_trabajos_futuros', article.trabajos_futuros);
        setFieldValue('edit_enlace', article.enlace);
        document.getElementById('seleccionado').checked = article.seleccionado;
        
        // Ensure metadata is loaded before configuring readonly fields
        await loadFieldMetadata();
        configureReadonlyFields();
        renderDocumentSections(article);
        
        // Add paste event listeners to clean double asterisks
        addPasteEventListeners();
        
        // Add character counters and their event listeners
        addCharacterCounters();
        
        // Auto-resize textareas to fit content
        autoResizeTextareas();
        
        // Clear any previous modal messages
        clearModalMessage();
        
        // Show modal
        document.getElementById('editModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error loading article:', error);
    }
}

// Function to auto-resize all textareas in the modal to fit their content
function autoResizeTextareas() {
    const textareas = document.querySelectorAll('#editModal textarea');
    
    textareas.forEach(textarea => {
        if (textarea.value && textarea.value.trim() !== '') {
            // Reset height to auto to get the correct scrollHeight
            textarea.style.height = 'auto';
            
            // Calculate the needed height
            const scrollHeight = textarea.scrollHeight;
            const minRows = parseInt(textarea.getAttribute('rows') || '2');
            const lineHeight = 20; // Approximate line height in pixels
            const minHeight = minRows * lineHeight + 16; // Add padding
            
            // Set the height to fit content, with a reasonable minimum
            const newHeight = Math.max(scrollHeight + 4, minHeight);
            textarea.style.height = newHeight + 'px';
        }
    });
}

export async function saveArticle() {
    const id = document.getElementById('articleId').value;
    
    // Collect all editable field values
    const data = {
        autor: getFieldValue('edit_autor'),
        anio: getFieldValue('edit_anio') ? parseInt(getFieldValue('edit_anio')) : null,
        base_datos: getFieldValue('edit_base_datos'),
        doi: getFieldValue('edit_doi'),
        eid: getFieldValue('edit_eid'),
        nombre_revista: getFieldValue('edit_nombre_revista'),
        quartil_revista: getFieldValue('edit_quartil_revista'),
        titulo_original: getFieldValue('edit_titulo_original'),
        titulo_espanol: getFieldValue('titulo_espanol'),
        abstract: getFieldValue('edit_abstract'),
        resumen: getFieldValue('resumen'),
        keywords_autor: getFieldValue('edit_keywords_autor'),
        keywords_indexed: getFieldValue('edit_keywords_indexed'),
        problema_articulo: getFieldValue('problema_articulo'),
        pregunta_investigacion: getFieldValue('pregunta_investigacion'),
        tipo_investigacion: getFieldValue('tipo_investigacion'),
        datos_estadisticos: getFieldValue('edit_datos_estadisticos'),
        objetivo_original: getFieldValue('edit_objetivo_original'),
        objetivo_espanol: getFieldValue('objetivo_espanol'),
        objetivo_reescrito: getFieldValue('objetivo_reescrito'),
        justificacion: getFieldValue('justificacion'),
        hipotesis: getFieldValue('hipotesis'),
        estudios_previos: getFieldValue('edit_estudios_previos'),
        poblacion_muestra_datos: getFieldValue('edit_poblacion_muestra_datos'),
        recoleccion_datos: getFieldValue('edit_recoleccion_datos'),
        resultados: getFieldValue('resultados'),
        conclusiones: getFieldValue('conclusiones'),
        discusion: getFieldValue('edit_discusion'),
        trabajos_futuros: getFieldValue('edit_trabajos_futuros'),
        enlace: getFieldValue('edit_enlace'),
        seleccionado: document.getElementById('seleccionado').checked
    };

    try {
        const response = await fetch(`/api/articles/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const updatedArticle = await response.json();
            
            // Update the article in allArticles array immediately
            const articleIndex = allArticles.findIndex(a => a.id === parseInt(id));
            if (articleIndex !== -1) {
                allArticles[articleIndex] = updatedArticle;
            }
            
            // Update the article in filteredArticles array
            const filteredIndex = filteredArticles.findIndex(a => a.id === parseInt(id));
            if (filteredIndex !== -1) {
                filteredArticles[filteredIndex] = updatedArticle;
            }
            
            // Update the table immediately
            renderTable();
            
            showMessage('Artículo actualizado correctamente', 'success');
            closeModal();
        } else {
            showMessage('Error al actualizar el artículo', 'error');
        }
    } catch (error) {
        console.error('Error saving article:', error);
        showMessage('Error al guardar los cambios', 'error');
    }
}

// Función para manejar clicks en botón de selección
export async function handleToggleSelection(id) {
    try {
        // Obtener elementos del botón
        const button = document.getElementById(`toggle-btn-${id}`);
        const icon = document.getElementById(`toggle-icon-${id}`);
        const loading = document.getElementById(`toggle-loading-${id}`);
        
        if (!button || !icon || !loading) {
            throw new Error('No se encontraron los elementos del botón');
        }
        
        // Obtener el estado actual desde los datos en memoria
        const article = allArticles.find(a => a.id === id);
        if (!article) {
            throw new Error('No se encontró el artículo en la lista');
        }
        
        const currentState = article.seleccionado;
        const newSelectionState = !currentState;
        
        // Mostrar estado de carga
        setToggleButtonLoading(id, true);
        
        // Enviar la actualización al servidor
        const response = await fetch(`/api/articles/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...article,
                seleccionado: newSelectionState
            })
        });

        if (response.ok) {
            // Actualizar el estado del botón
            updateToggleButtonState(id, newSelectionState);
            
            // Actualizar el checkbox en el modal si está abierto
            const modalCheckbox = document.getElementById('seleccionado');
            const editModal = document.getElementById('editModal');
            const articleIdInput = document.getElementById('articleId');
            
            if (modalCheckbox && editModal && !editModal.classList.contains('hidden') && 
                articleIdInput && parseInt(articleIdInput.value) === id) {
                modalCheckbox.checked = newSelectionState;
            }
            
            // Confirmar la actualización en los arrays de datos
            const articleInArray = allArticles.find(a => a.id === id);
            if (articleInArray) {
                articleInArray.seleccionado = newSelectionState;
            }
            
            const filteredArticle = filteredArticles.find(a => a.id === id);
            if (filteredArticle) {
                filteredArticle.seleccionado = newSelectionState;
            }
        } else {
            const errorData = await response.json();
            console.error('Error toggling selection:', errorData);
            showMessage('Error al cambiar la selección del artículo', 'error');
        }
    } catch (error) {
        console.error('Error toggling selection:', error);
        showMessage('Error al cambiar la selección del artículo', 'error');
    } finally {
        // Siempre quitar el estado de carga
        setToggleButtonLoading(id, false);
    }
}

// Función para mostrar/ocultar estado de carga en el botón
function setToggleButtonLoading(id, loading) {
    const button = document.getElementById(`toggle-btn-${id}`);
    const icon = document.getElementById(`toggle-icon-${id}`);
    const loadingSpinner = document.getElementById(`toggle-loading-${id}`);
    
    if (button && icon && loadingSpinner) {
        if (loading) {
            button.disabled = true;
            button.classList.add('opacity-75', 'cursor-not-allowed');
            icon.classList.add('hidden');
            loadingSpinner.classList.remove('hidden');
        } else {
            button.disabled = false;
            button.classList.remove('opacity-75', 'cursor-not-allowed');
            icon.classList.remove('hidden');
            loadingSpinner.classList.add('hidden');
        }
    }
}

// Función para actualizar el estado visual del botón
function updateToggleButtonState(id, isSelected) {
    const button = document.getElementById(`toggle-btn-${id}`);
    const icon = document.getElementById(`toggle-icon-${id}`);
    
    if (button && icon) {
        // Remover todas las clases de estado
        button.classList.remove(
            'bg-green-500', 'hover:bg-green-600', 'text-white', 'border-green-500',
            'bg-gray-200', 'hover:bg-gray-300', 'text-gray-600', 'border-gray-300'
        );
        
        if (isSelected) {
            button.classList.add('bg-green-500', 'hover:bg-green-600', 'text-white', 'border-green-500');
            button.title = 'Artículo seleccionado - Click para deseleccionar';
            icon.textContent = '✓';
        } else {
            button.classList.add('bg-gray-200', 'hover:bg-gray-300', 'text-gray-600', 'border-gray-300');
            button.title = 'Artículo no seleccionado - Click para seleccionar';
            icon.textContent = '○';
        }
    }
}

export function exportExcelAll() {
    // Cerrar dropdown
    document.getElementById('exportDropdown').classList.add('hidden');
    
    // Mostrar mensaje de procesamiento
    showMessage('Generando archivo Excel con todos los artículos...', 'info');
    
    fetch('/api/export-excel')
        .then(response => {
            if (!response.ok) throw new Error('Error en la descarga');
            return response.blob();
        })
        .then(blob => {
            downloadExcelFile(blob, 'matriz-analisis-todos');
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Error al generar el archivo Excel', 'error');
        });
}

export function exportExcelBookmarks() {
    // Cerrar dropdown
    document.getElementById('exportDropdown').classList.add('hidden');
    
    // Mostrar mensaje de procesamiento
    showMessage('Generando archivo Excel con marcadores...', 'info');
    
    fetch('/api/export-excel-bookmarks')
        .then(response => {
            if (!response.ok) throw new Error('Error en la descarga');
            return response.blob();
        })
        .then(blob => {
            downloadExcelFile(blob, 'matriz-analisis-marcadores');
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Error al generar el archivo Excel', 'error');
        });
}

export async function uploadDocument(sectionId, articleId, docType) {
    const fileInput = document.getElementById(`fileInput_${sectionId}`);
    if (!fileInput || !fileInput.files[0]) {
        alert('Por favor selecciona un archivo');
        return;
    }
    
    const file = fileInput.files[0];
    
    // Validaciones
    if (file.type !== 'application/pdf') {
        alert('Solo se permiten archivos PDF');
        return;
    }
    
    if (file.size > 16 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 16MB.');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);
    
    try {
        const response = await fetch(`/api/articles/${articleId}/documents`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            showModalMessage('Documento subido correctamente', 'success');
            // Refresh article data in modal and update table
            await refreshArticleInModal(articleId);
        } else {
            const error = await response.json();
            showModalMessage(error.error || 'Error al subir el documento', 'error');
        }
    } catch (error) {
        console.error('Error uploading document:', error);
        showModalMessage('Error al subir el documento', 'error');
    }
}

export async function deleteDocument(articleId, docType) {
    if (!confirm(`¿Estás seguro de que quieres eliminar el documento ${docType === 'original' ? 'original' : 'en español'}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/articles/${articleId}/documents/${docType}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showModalMessage('Documento eliminado correctamente', 'success');
            // Refresh article data in modal and update table
            await refreshArticleInModal(articleId);
        } else {
            const error = await response.json();
            showModalMessage(error.error || 'Error al eliminar el documento', 'error');
        }
    } catch (error) {
        console.error('Error deleting document:', error);
        showModalMessage('Error al eliminar el documento', 'error');
    }
}

export async function refreshArticleInModal(articleId) {
    try {
        const response = await fetch(`/api/articles/${articleId}`);
        const article = await response.json();
        
        // Re-render document sections with updated data
        renderDocumentSections(article);
        
        // Update allArticles array immediately
        const index = allArticles.findIndex(a => a.id === parseInt(articleId));
        if (index !== -1) {
            allArticles[index] = article;
        }
        
        // Update filteredArticles array
        const filteredIndex = filteredArticles.findIndex(a => a.id === parseInt(articleId));
        if (filteredIndex !== -1) {
            filteredArticles[filteredIndex] = article;
        }
        
        // Update the table immediately to reflect changes
        renderTable();
    } catch (error) {
        console.error('Error refreshing article:', error);
    }
}

// Re-export utility functions that need to be available globally
export { setFieldValue, getFieldValue, configureReadonlyFields } from './utils.js';