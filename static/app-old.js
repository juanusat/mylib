import { setAllArticles, setFilteredArticles } from './config.js';
import { loadFieldMetadata, loadArticles, checkCSV, importCSV, editArticle, saveArticle, toggleSelection, exportExcelAll, exportExcelBookmarks, uploadDocument, deleteDocument, refreshArticleInModal, loadColumnMetadata } from './api.js';
import { renderTable, goToPage, changeItemsPerPage, filterArticles, updateColumns, toggleColumnSettings, toggleExportDropdown, downloadExcelFile, exportExcel } from './table.js';
import { viewDocument, openDocumentSidebar, createDocumentSidebar, closeDocumentSidebar, openInNewTab, toggleFullscreen, getDocumentByType, renderDocumentSections, renderDocumentSection, showUploadForm, cancelUpload } from './documents.js';
import { showDuplicateConfirmation, closeConfirmModal, proceedWithImport, forceImport, setFieldValue, configureReadonlyFields, getFieldValue, closeModal, showMessage, openInstructionsModal, generateInstructionsPrompt, regenerateInstructions, copyInstructions, closeInstructionsModal } from './modals.js';

// Load articles on page load
document.addEventListener('DOMContentLoaded', function() {
    loadFieldMetadata();
    loadArticles();
    updateColumns();
    
    // Initialize filtered articles
    loadArticles().then(() => {
        setFilteredArticles([...allArticles]);
        renderTable();
    });
});

// Cerrar dropdown cuando se hace clic fuera
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('exportDropdown');
    const button = document.getElementById('exportButton');
    
    if (dropdown && button && !dropdown.contains(event.target) && !button.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});

// Make functions globally available for onclick handlers
window.checkCSV = checkCSV;
window.importCSV = importCSV;
window.editArticle = editArticle;
window.saveArticle = saveArticle;
window.toggleSelection = toggleSelection;
window.exportExcelAll = exportExcelAll;
window.exportExcelBookmarks = exportExcelBookmarks;
window.exportExcel = exportExcel;
window.goToPage = goToPage;
window.changeItemsPerPage = changeItemsPerPage;
window.filterArticles = filterArticles;
window.updateColumns = updateColumns;
window.toggleColumnSettings = toggleColumnSettings;
window.toggleExportDropdown = toggleExportDropdown;
window.viewDocument = viewDocument;
window.openInNewTab = openInNewTab;
window.toggleFullscreen = toggleFullscreen;
window.closeDocumentSidebar = closeDocumentSidebar;
window.uploadDocument = uploadDocument;
window.deleteDocument = deleteDocument;
window.showUploadForm = showUploadForm;
window.cancelUpload = cancelUpload;
window.showDuplicateConfirmation = showDuplicateConfirmation;
window.closeConfirmModal = closeConfirmModal;
window.proceedWithImport = proceedWithImport;
window.forceImport = forceImport;
window.closeModal = closeModal;
window.openInstructionsModal = openInstructionsModal;
window.regenerateInstructions = regenerateInstructions;
window.copyInstructions = copyInstructions;
window.closeInstructionsModal = closeInstructionsModal;
    const tbody = document.getElementById('articlesTable');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageArticles = filteredArticles.slice(startIndex, endIndex);

    tbody.innerHTML = pageArticles.map(article => {
        const cells = [];
        
        if (visibleColumns.id) {
            cells.push(`<td class="border border-gray-300 px-4 py-2">${article.id}</td>`);
        }
        
        if (visibleColumns.titulo_original) {
            const titulo = article.titulo_original || 'Sin título';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${titulo}">${titulo}</td>`);
        }
        
        if (visibleColumns.titulo_espanol) {
            const titulo = article.titulo_espanol || '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${titulo}">${titulo}</td>`);
        }
        
        if (visibleColumns.autor) {
            const autor = article.autor || 'Sin autor';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${autor}">${autor}</td>`);
        }
        
        if (visibleColumns.anio) {
            cells.push(`<td class="border border-gray-300 px-4 py-2">${article.anio || ''}</td>`);
        }
        
        if (visibleColumns.nombre_revista) {
            const revista = article.nombre_revista || '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${revista}">${revista}</td>`);
        }
        
        if (visibleColumns.quartil_revista) {
            cells.push(`<td class="border border-gray-300 px-4 py-2">${article.quartil_revista || ''}</td>`);
        }
        
        if (visibleColumns.doi) {
            const doi = article.doi || '';
            const doiLink = doi ? `<a href="https://doi.org/${doi}" target="_blank" class="text-blue-600 hover:underline">${doi}</a>` : '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate">${doiLink}</td>`);
        }
        
        if (visibleColumns.base_datos) {
            cells.push(`<td class="border border-gray-300 px-4 py-2">${article.base_datos || ''}</td>`);
        }
        
        if (visibleColumns.abstract) {
            const abstract = article.abstract || '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${abstract}">${abstract}</td>`);
        }
        
        if (visibleColumns.resumen) {
            const resumen = article.resumen || '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${resumen}">${resumen}</td>`);
        }
        
        if (visibleColumns.keywords_autor) {
            const keywords = article.keywords_autor || '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${keywords}">${keywords}</td>`);
        }
        
        if (visibleColumns.keywords_indexed) {
            const keywords = article.keywords_indexed || '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${keywords}">${keywords}</td>`);
        }
        
        if (visibleColumns.problema_articulo) {
            const problema = article.problema_articulo || '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${problema}">${problema}</td>`);
        }
        
        if (visibleColumns.datos_estadisticos) {
            const datos = article.datos_estadisticos || '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${datos}">${datos}</td>`);
        }
        
        if (visibleColumns.pregunta_investigacion) {
            const pregunta = article.pregunta_investigacion || '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${pregunta}">${pregunta}</td>`);
        }
        
        if (visibleColumns.objetivo_original) {
            const objetivo = article.objetivo_original || '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${objetivo}">${objetivo}</td>`);
        }
        
        if (visibleColumns.objetivo_espanol) {
            const objetivo = article.objetivo_espanol || '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${objetivo}">${objetivo}</td>`);
        }
        
        if (visibleColumns.objetivo_reescrito) {
            const objetivo = article.objetivo_reescrito || '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${objetivo}">${objetivo}</td>`);
        }
        
        if (visibleColumns.justificacion) {
            const justificacion = article.justificacion || '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${justificacion}">${justificacion}</td>`);
        }
        
        if (visibleColumns.hipotesis) {
            const hipotesis = article.hipotesis || '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${hipotesis}">${hipotesis}</td>`);
        }
        
        if (visibleColumns.tipo_investigacion) {
            cells.push(`<td class="border border-gray-300 px-4 py-2">${article.tipo_investigacion || ''}</td>`);
        }
        
        if (visibleColumns.estudios_previos) {
            const estudios = article.estudios_previos || '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${estudios}">${estudios}</td>`);
        }
        
        if (visibleColumns.poblacion_muestra_datos) {
            const poblacion = article.poblacion_muestra_datos || '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${poblacion}">${poblacion}</td>`);
        }
        
        if (visibleColumns.recoleccion_datos) {
            const recoleccion = article.recoleccion_datos || '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${recoleccion}">${recoleccion}</td>`);
        }
        
        if (visibleColumns.resultados) {
            const resultados = article.resultados || '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${resultados}">${resultados}</td>`);
        }
        
        if (visibleColumns.conclusiones) {
            const conclusiones = article.conclusiones || '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${conclusiones}">${conclusiones}</td>`);
        }
        
        if (visibleColumns.discusion) {
            const discusion = article.discusion || '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${discusion}">${discusion}</td>`);
        }
        
        if (visibleColumns.trabajos_futuros) {
            const trabajos = article.trabajos_futuros || '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${trabajos}">${trabajos}</td>`);
        }
        
        if (visibleColumns.enlace) {
            const enlace = article.enlace || '';
            const enlaceLink = enlace ? `<a href="${enlace}" target="_blank" class="text-blue-600 hover:underline"><i class="fas fa-external-link-alt"></i></a>` : '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 text-center">${enlaceLink}</td>`);
        }
        
        if (visibleColumns.eid) {
            cells.push(`<td class="border border-gray-300 px-4 py-2">${article.eid || ''}</td>`);
        }
        
        if (visibleColumns.seleccionado) {
            const badge = article.seleccionado ? 
                '<span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Sí</span>' : 
                '<span class="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">No</span>';
            cells.push(`<td class="border border-gray-300 px-4 py-2 text-center">${badge}</td>`);
        }
        
        // Actions column (always visible)
        const isSelected = article.seleccionado ? 'checked' : '';
        
        // Botones de documentos
        const originalDoc = getDocumentByType(article.documentos, 'original');
        const translatedDoc = getDocumentByType(article.documentos, 'translated');
        
        const originalButton = originalDoc ? 
            `<button onclick="viewDocument('${originalDoc.nombre_archivo_original}', event)" 
                     class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs mr-1" 
                     title="Ver documento original">
                <i class="fas fa-file-pdf"></i> Leer
            </button>` : '';
            
        const translatedButton = translatedDoc ? 
            `<button onclick="viewDocument('${translatedDoc.nombre_archivo_traducido}', event)" 
                     class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs mr-1" 
                     title="Ver documento en español">
                <i class="fas fa-file-pdf"></i> VE
            </button>` : '';
        
        cells.push(`<td class="border border-gray-300 px-4 py-2 text-center">
            <div class="flex items-center justify-center space-x-1 flex-wrap">
                <input type="checkbox" ${isSelected} onchange="toggleSelection(${article.id})" 
                       class="mr-2" title="Marcar como seleccionado">
                ${originalButton}
                ${translatedButton}
                <button onclick="editArticle(${article.id})" class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs">
                    <i class="fas fa-edit"></i> Editar
                </button>
            </div>
        </td>`);

        return `<tr class="hover:bg-gray-50">${cells.join('')}</tr>`;
    }).join('');
}

function renderPagination() {
    const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredArticles.length);

    // Pagination info
    document.getElementById('paginationInfo').textContent = 
        `Mostrando ${startItem}-${endItem} de ${filteredArticles.length} artículos`;

    // Pagination controls
    const controls = document.getElementById('paginationControls');
    let buttons = [];

    // Previous button
    if (currentPage > 1) {
        buttons.push(`<button onclick="goToPage(${currentPage - 1})" class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded">Anterior</button>`);
    }

    // Page numbers
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        const activeClass = i === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300';
        buttons.push(`<button onclick="goToPage(${i})" class="px-3 py-1 ${activeClass} rounded">${i}</button>`);
    }

    // Next button
    if (currentPage < totalPages) {
        buttons.push(`<button onclick="goToPage(${currentPage + 1})" class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded">Siguiente</button>`);
    }

    controls.innerHTML = buttons.join('');
}

function goToPage(page) {
    currentPage = page;
    renderTable();
}

function changeItemsPerPage() {
    itemsPerPage = parseInt(document.getElementById('itemsPerPage').value);
    currentPage = 1;
    renderTable();
}

function filterArticles() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectionFilter = document.getElementById('selectionFilter').value;
    
    filteredArticles = allArticles.filter(article => {
        // Search filter
        const titleMatch = (article.titulo_original || '').toLowerCase().includes(searchTerm);
        
        // Selection filter
        let selectionMatch = true;
        if (selectionFilter === 'SEL:V') {
            selectionMatch = article.seleccionado === true;
        } else if (selectionFilter === 'SEL:F') {
            selectionMatch = article.seleccionado === false;
        }
        
        return titleMatch && selectionMatch;
    });
    
    currentPage = 1;
    renderTable();
}

function toggleColumnSettings() {
    const panel = document.getElementById('columnSettings');
    panel.classList.toggle('hidden');
}

function updateColumns() {
    visibleColumns = {
        id: document.getElementById('col-id').checked,
        titulo_original: document.getElementById('col-titulo_original').checked,
        titulo_espanol: document.getElementById('col-titulo_espanol').checked,
        autor: document.getElementById('col-autor').checked,
        anio: document.getElementById('col-anio').checked,
        nombre_revista: document.getElementById('col-nombre_revista').checked,
        quartil_revista: document.getElementById('col-quartil_revista').checked,
        doi: document.getElementById('col-doi').checked,
        base_datos: document.getElementById('col-base_datos').checked,
        abstract: document.getElementById('col-abstract').checked,
        resumen: document.getElementById('col-resumen').checked,
        keywords_autor: document.getElementById('col-keywords_autor').checked,
        keywords_indexed: document.getElementById('col-keywords_indexed').checked,
        problema_articulo: document.getElementById('col-problema_articulo').checked,
        datos_estadisticos: document.getElementById('col-datos_estadisticos').checked,
        pregunta_investigacion: document.getElementById('col-pregunta_investigacion').checked,
        objetivo_original: document.getElementById('col-objetivo_original').checked,
        objetivo_espanol: document.getElementById('col-objetivo_espanol').checked,
        objetivo_reescrito: document.getElementById('col-objetivo_reescrito').checked,
        justificacion: document.getElementById('col-justificacion').checked,
        hipotesis: document.getElementById('col-hipotesis').checked,
        tipo_investigacion: document.getElementById('col-tipo_investigacion').checked,
        estudios_previos: document.getElementById('col-estudios_previos').checked,
        poblacion_muestra_datos: document.getElementById('col-poblacion_muestra_datos').checked,
        recoleccion_datos: document.getElementById('col-recoleccion_datos').checked,
        resultados: document.getElementById('col-resultados').checked,
        conclusiones: document.getElementById('col-conclusiones').checked,
        discusion: document.getElementById('col-discusion').checked,
        trabajos_futuros: document.getElementById('col-trabajos_futuros').checked,
        enlace: document.getElementById('col-enlace').checked,
        eid: document.getElementById('col-eid').checked,
        seleccionado: document.getElementById('col-seleccionado').checked
    };
    renderTable();
}

async function checkCSV() {
    const fileInput = document.getElementById('csvFile');
    
    if (!fileInput.files[0]) {
        showMessage('Por favor selecciona un archivo CSV', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        const response = await fetch('/api/check-csv', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            if (result.has_duplicates) {
                showDuplicateConfirmation(result);
            } else {
                // No duplicates, proceed with import
                importCSV(false);
            }
        } else {
            showMessage(result.error, 'error');
        }
    } catch (error) {
        showMessage('Error al verificar el archivo', 'error');
        console.error('Error:', error);
    }
}

function showDuplicateConfirmation(data) {
    const modal = document.getElementById('confirmModal');
    const duplicateInfo = document.getElementById('duplicateInfo');
    
    // Update counts
    document.getElementById('totalCount').textContent = data.total_in_csv;
    document.getElementById('existingCount').textContent = data.existing_count;
    document.getElementById('newCount').textContent = data.new_count;
    
    // Show existing articles
    if (data.existing_articles.length > 0) {
        const existingList = data.existing_articles.map(article => 
            `<div class="border-l-4 border-orange-400 pl-3 py-2">
                <p class="font-medium text-sm">${article.titulo || 'Sin título'}</p>
                <p class="text-xs text-gray-600">DOI: ${article.doi}</p>
            </div>`
        ).join('');
        
        duplicateInfo.innerHTML = `
            <div>
                <h4 class="font-semibold text-orange-600 mb-3">Artículos ya registrados (${data.existing_count}):</h4>
                <div class="space-y-2 max-h-40 overflow-y-auto">
                    ${existingList}
                </div>
            </div>
        `;
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function proceedWithImport() {
    closeConfirmModal();
    importCSV(false);
}

function forceImport() {
    closeConfirmModal();
    importCSV(true);
}

async function importCSV(forceImport = false) {
    const fileInput = document.getElementById('csvFile');
    
    if (!fileInput.files[0]) {
        showMessage('Por favor selecciona un archivo CSV', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    if (forceImport) {
        formData.append('force_import', 'true');
    }

    try {
        const response = await fetch('/api/import-csv', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage(result.message, 'success');
            loadArticles();
            // Clear file input
            fileInput.value = '';
        } else {
            showMessage(result.error, 'error');
        }
    } catch (error) {
        showMessage('Error al importar el archivo', 'error');
        console.error('Error:', error);
    }
}

async function editArticle(id) {
    try {
        const response = await fetch(`/api/articles/${id}`);
        const article = await response.json();
        
        // Populate all fields
        document.getElementById('articleId').value = article.id;
        
        // Basic information
        setFieldValue('edit_id', article.id);
        setFieldValue('edit_autor', article.autor);
        setFieldValue('edit_anio', article.anio);
        setFieldValue('edit_base_datos', article.base_datos);
        setFieldValue('edit_doi', article.doi);
        setFieldValue('edit_eid', article.eid);
        
        // Journal
        setFieldValue('edit_nombre_revista', article.nombre_revista);
        setFieldValue('edit_quartil_revista', article.quartil_revista);
        
        // Titles
        setFieldValue('edit_titulo_original', article.titulo_original);
        setFieldValue('titulo_espanol', article.titulo_espanol);
        
        // Abstracts
        setFieldValue('edit_abstract', article.abstract);
        setFieldValue('resumen', article.resumen);
        
        // Keywords
        setFieldValue('edit_keywords_autor', article.keywords_autor);
        setFieldValue('edit_keywords_indexed', article.keywords_indexed);
        
        // Research
        setFieldValue('problema_articulo', article.problema_articulo);
        setFieldValue('pregunta_investigacion', article.pregunta_investigacion);
        setFieldValue('tipo_investigacion', article.tipo_investigacion);
        setFieldValue('edit_datos_estadisticos', article.datos_estadisticos);
        
        // Objectives
        setFieldValue('edit_objetivo_original', article.objetivo_original);
        setFieldValue('objetivo_espanol', article.objetivo_espanol);
        setFieldValue('objetivo_reescrito', article.objetivo_reescrito);
        
        // Methodology
        setFieldValue('justificacion', article.justificacion);
        setFieldValue('hipotesis', article.hipotesis);
        setFieldValue('edit_estudios_previos', article.estudios_previos);
        setFieldValue('edit_poblacion_muestra_datos', article.poblacion_muestra_datos);
        setFieldValue('edit_recoleccion_datos', article.recoleccion_datos);
        
        // Results and conclusions
        setFieldValue('resultados', article.resultados);
        setFieldValue('conclusiones', article.conclusiones);
        setFieldValue('edit_discusion', article.discusion);
        setFieldValue('edit_trabajos_futuros', article.trabajos_futuros);
        
        // Links and status
        setFieldValue('edit_enlace', article.enlace);
        document.getElementById('seleccionado').checked = article.seleccionado || false;
        
        // Configure readonly fields
        configureReadonlyFields();
        
        // Render document sections
        renderDocumentSections(article);
        
        // Show modal and prevent body scroll
        document.getElementById('editModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error loading article:', error);
    }
}

function setFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.value = value || '';
    }
}

function configureReadonlyFields() {
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
            field.readOnly = false;
            field.classList.remove('bg-gray-100', 'cursor-not-allowed');
            field.classList.add('bg-white');
        }
    });
    
    // Make readonly fields non-editable and style them
    readonlyFields.forEach(columnName => {
        const fieldId = fieldMapping[columnName];
        if (fieldId) {
            const field = document.getElementById(fieldId);
            if (field) {
                field.readOnly = true;
                field.classList.remove('bg-white');
                field.classList.add('bg-gray-100', 'cursor-not-allowed');
                field.title = 'Campo importado desde Scopus (solo lectura)';
            }
        }
    });
}

async function saveArticle() {
    const id = document.getElementById('articleId').value;
    
    // Collect all editable field values
    const data = {
        // Basic information (only non-readonly fields)
        autor: getFieldValue('edit_autor'),
        anio: getFieldValue('edit_anio') ? parseInt(getFieldValue('edit_anio')) : null,
        base_datos: getFieldValue('edit_base_datos'),
        doi: getFieldValue('edit_doi'),
        eid: getFieldValue('edit_eid'),
        
        // Journal
        nombre_revista: getFieldValue('edit_nombre_revista'),
        quartil_revista: getFieldValue('edit_quartil_revista'),
        
        // Titles
        titulo_original: getFieldValue('edit_titulo_original'),
        titulo_espanol: getFieldValue('titulo_espanol'),
        
        // Abstracts
        abstract: getFieldValue('edit_abstract'),
        resumen: getFieldValue('resumen'),
        
        // Keywords
        keywords_autor: getFieldValue('edit_keywords_autor'),
        keywords_indexed: getFieldValue('edit_keywords_indexed'),
        
        // Research
        problema_articulo: getFieldValue('problema_articulo'),
        pregunta_investigacion: getFieldValue('pregunta_investigacion'),
        tipo_investigacion: getFieldValue('tipo_investigacion'),
        datos_estadisticos: getFieldValue('edit_datos_estadisticos'),
        
        // Objectives
        objetivo_original: getFieldValue('edit_objetivo_original'),
        objetivo_espanol: getFieldValue('objetivo_espanol'),
        objetivo_reescrito: getFieldValue('objetivo_reescrito'),
        
        // Methodology
        justificacion: getFieldValue('justificacion'),
        hipotesis: getFieldValue('hipotesis'),
        estudios_previos: getFieldValue('edit_estudios_previos'),
        poblacion_muestra_datos: getFieldValue('edit_poblacion_muestra_datos'),
        recoleccion_datos: getFieldValue('edit_recoleccion_datos'),
        
        // Results and conclusions
        resultados: getFieldValue('resultados'),
        conclusiones: getFieldValue('conclusiones'),
        discusion: getFieldValue('edit_discusion'),
        trabajos_futuros: getFieldValue('edit_trabajos_futuros'),
        
        // Links and status
        enlace: getFieldValue('edit_enlace'),
        seleccionado: document.getElementById('seleccionado').checked
    };

    try {
        const response = await fetch(`/api/articles/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeModal();
            loadArticles();
            showMessage('Artículo actualizado correctamente', 'success');
        } else {
            showMessage('Error al actualizar el artículo', 'error');
        }
    } catch (error) {
        showMessage('Error al guardar', 'error');
        console.error('Error:', error);
    }
}

function getFieldValue(fieldId) {
    const field = document.getElementById(fieldId);
    return field ? field.value : '';
}

function closeModal() {
    document.getElementById('editModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('importMessage');
    messageDiv.className = `mt-4 p-3 rounded ${type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`;
    messageDiv.textContent = message;
    messageDiv.classList.remove('hidden');
    
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 5000);
}

async function toggleSelection(id) {
    try {
        const article = allArticles.find(a => a.id === id);
        const newSelectionState = !article.seleccionado;
        
        const response = await fetch(`/api/articles/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ seleccionado: newSelectionState })
        });

        if (response.ok) {
            // Update local data
            article.seleccionado = newSelectionState;
            // Update filtered articles too
            const filteredArticle = filteredArticles.find(a => a.id === id);
            if (filteredArticle) {
                filteredArticle.seleccionado = newSelectionState;
            }
            renderTable();
        } else {
            showMessage('Error al actualizar la selección', 'error');
            // Revert checkbox state
            const checkbox = document.querySelector(`input[onchange="toggleSelection(${id})"]`);
            if (checkbox) {
                checkbox.checked = article.seleccionado;
            }
        }
    } catch (error) {
        showMessage('Error al actualizar la selección', 'error');
        console.error('Error:', error);
    }
}

function toggleExportDropdown() {
    const dropdown = document.getElementById('exportDropdown');
    dropdown.classList.toggle('hidden');
}

// Cerrar dropdown cuando se hace clic fuera
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('exportDropdown');
    const button = document.getElementById('exportButton');
    
    if (dropdown && button && !dropdown.contains(event.target) && !button.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});

function exportExcelAll() {
    // Cerrar dropdown
    document.getElementById('exportDropdown').classList.add('hidden');
    
    // Mostrar mensaje de procesamiento
    showMessage('Generando archivo Excel con todos los artículos...', 'info');
    
    fetch('/api/export-excel')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la exportación: ${response.status}`);
            }
            return response.blob();
        })
        .then(blob => {
            downloadExcelFile(blob, 'matriz-analisis-completa');
            showMessage('Archivo Excel exportado exitosamente (todos los artículos)', 'success');
        })
        .catch(error => {
            console.error('Error al exportar Excel:', error);
            showMessage('Error al exportar el archivo Excel', 'error');
        });
}

function exportExcelBookmarks() {
    // Cerrar dropdown
    document.getElementById('exportDropdown').classList.add('hidden');
    
    // Mostrar mensaje de procesamiento
    showMessage('Generando archivo Excel con marcadores...', 'info');
    
    fetch('/api/export-excel-bookmarks')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la exportación: ${response.status}`);
            }
            return response.blob();
        })
        .then(blob => {
            downloadExcelFile(blob, 'matriz-analisis-marcadores');
            showMessage('Archivo Excel exportado exitosamente (solo marcadores)', 'success');
        })
        .catch(error => {
            console.error('Error al exportar Excel de marcadores:', error);
            showMessage('Error al exportar el archivo Excel de marcadores', 'error');
        });
}

function downloadExcelFile(blob, baseName) {
    // Crear URL temporal para el blob
    const url = window.URL.createObjectURL(blob);
    
    // Crear elemento de descarga temporal
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    
    // Generar nombre del archivo con timestamp en hora local
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timestamp = `${year}-${month}-${day}--${hours}-${minutes}-${seconds}`;
    a.download = `${baseName}-${timestamp}.xlsx`;
    
    document.body.appendChild(a);
    a.click();
    
    // Limpiar
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function exportExcel() {
    // Mantener compatibilidad con la función original por si se llama desde algún lugar
    exportExcelAll();
}

// ================== GESTIÓN DE DOCUMENTOS ==================
function viewDocument(filename, event) {
    if (!filename) {
        showMessage('No se encontró el archivo para visualizar', 'error');
        return;
    }
    
    const url = `/api/documents/${filename}`;
    
    if (event && (event.ctrlKey || event.metaKey)) {
        window.open(url, '_blank');
        return;
    }
    
    openDocumentSidebar(url, filename);
}
function openDocumentSidebar(url, filename) {
    let sidebar = document.getElementById('documentSidebar');
    if (!sidebar) {
        sidebar = createDocumentSidebar();
    }
    
    const iframe = sidebar.querySelector('#documentIframe');
    const titleElement = sidebar.querySelector('#documentTitle');
    
    iframe.src = url;
    titleElement.textContent = filename;
    
    sidebar.classList.remove('hidden');
    sidebar.classList.add('flex');
    document.body.classList.add('sidebar-open');
}

function createDocumentSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'documentSidebar';
    sidebar.className = 'fixed top-0 right-0 h-full w-1/2 bg-white shadow-2xl z-50 hidden flex-col border-l border-gray-300';
    
    sidebar.innerHTML = `
        <div class="flex items-center justify-between p-4 border-b bg-gray-50">
            <div class="flex items-center space-x-2 flex-1 min-w-0">
                <i class="fas fa-file-pdf text-red-500"></i>
                <span id="documentTitle" class="font-medium text-gray-800 truncate"></span>
            </div>
            <div class="flex space-x-2 ml-2">
                <button onclick="openInNewTab()" 
                        class="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm" 
                        title="Abrir en nueva pestaña">
                    <i class="fas fa-external-link-alt"></i>
                </button>
                <button onclick="toggleFullscreen()" 
                        class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm" 
                        title="Pantalla completa">
                    <i class="fas fa-expand"></i>
                </button>
                <button onclick="closeDocumentSidebar()" 
                        class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm" 
                        title="Cerrar (Esc)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        <div class="flex-1 relative">
            <iframe id="documentIframe" 
                    class="w-full h-full border-0" 
                    src="">
            </iframe>
        </div>
    `;
    
    document.body.appendChild(sidebar);
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !sidebar.classList.contains('hidden')) {
            closeDocumentSidebar();
        }
    });
    
    return sidebar;
}

function closeDocumentSidebar() {
    const sidebar = document.getElementById('documentSidebar');
    if (sidebar) {
        sidebar.classList.add('hidden');
        sidebar.classList.remove('flex');
        document.body.classList.remove('sidebar-open');
        
        // Limpiar iframe
        const iframe = sidebar.querySelector('#documentIframe');
        if (iframe) {
            iframe.src = '';
        }
    }
}

function openInNewTab() {
    const iframe = document.querySelector('#documentIframe');
    if (iframe && iframe.src) {
        window.open(iframe.src, '_blank');
    }
}

function toggleFullscreen() {
    const sidebar = document.getElementById('documentSidebar');
    if (!sidebar) return;
    
    const expandIcon = sidebar.querySelector('.fa-expand, .fa-compress');
    
    if (sidebar.classList.contains('w-1/2')) {
        // Expandir a pantalla completa
        sidebar.classList.remove('w-1/2');
        sidebar.classList.add('w-full');
        expandIcon.classList.remove('fa-expand');
        expandIcon.classList.add('fa-compress');
    } else {
        // Reducir a la mitad
        sidebar.classList.remove('w-full');
        sidebar.classList.add('w-1/2');
        expandIcon.classList.remove('fa-compress');
        expandIcon.classList.add('fa-expand');
    }
}

function getDocumentByType(documentos, type) {
    if (!documentos || !Array.isArray(documentos)) return null;
    
    for (const doc of documentos) {
        if (type === 'original' && doc.nombre_archivo_original) {
            return doc;
        } else if (type === 'translated' && doc.nombre_archivo_traducido) {
            return doc;
        }
    }
    return null;
}

function renderDocumentSections(article) {
    renderDocumentSection('originalDocSection', article, 'original');
    renderDocumentSection('translatedDocSection', article, 'translated');
}

function renderDocumentSection(sectionId, article, docType) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const documents = article.documentos || [];
    const docRecord = getDocumentByType(documents, docType);
    
    const isOriginal = docType === 'original';
    const filename = isOriginal ? 
        (docRecord ? docRecord.nombre_archivo_original : null) :
        (docRecord ? docRecord.nombre_archivo_traducido : null);
    
    const typeLabel = isOriginal ? 'original' : 'traducido';
    const colorClass = isOriginal ? 'text-red-600' : 'text-blue-600';
    const bgClass = isOriginal ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200';
    
    if (filename) {
        // Documento existe - mostrar nombre del archivo y botón de eliminar
        section.innerHTML = `
            <div class="space-y-2">
                <div class="p-2 ${bgClass} border rounded-md">
                    <div class="flex items-start justify-between gap-2">
                        <div class="flex flex-col min-w-0 flex-1">
                            <span class="text-sm ${colorClass} font-medium">
                                <i class="fas fa-file-pdf"></i> Documento subido
                            </span>
                            <span class="text-xs text-gray-600 truncate" title="${filename}">
                                ${filename}
                            </span>
                        </div>
                        <button onclick="deleteDocument(${article.id}, '${docType}')" 
                                class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs flex-shrink-0" 
                                title="Eliminar documento">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <button onclick="showUploadForm('${sectionId}', ${article.id}, '${docType}')" 
                        class="w-full bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm">
                    <i class="fas fa-upload"></i> Reemplazar documento
                </button>
            </div>
        `;
    } else {
        // No hay documento - mostrar botón de subir
        section.innerHTML = `
            <div class="text-center">
                <div class="p-4 border-2 border-dashed border-gray-300 rounded-md">
                    <i class="fas fa-cloud-upload-alt text-gray-400 text-2xl mb-2"></i>
                    <p class="text-sm text-gray-500 mb-3">No hay documento ${typeLabel}</p>
                    <button onclick="showUploadForm('${sectionId}', ${article.id}, '${docType}')" 
                            class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm">
                        <i class="fas fa-upload"></i> Subir documento
                    </button>
                </div>
            </div>
        `;
    }
}

function showUploadForm(sectionId, articleId, docType) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const typeLabel = docType === 'original' ? 'original' : 'en español';
    
    section.innerHTML = `
        <div class="space-y-3">
            <div class="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h6 class="font-medium text-blue-800 mb-2">Subir documento ${typeLabel}</h6>
                <input type="file" 
                       id="fileInput_${sectionId}" 
                       accept=".pdf" 
                       class="w-full p-2 border border-gray-300 rounded text-sm">
                <p class="text-xs text-gray-600 mt-1">Solo archivos PDF, máximo 16MB</p>
            </div>
            <div class="flex space-x-2">
                <button onclick="uploadDocument('${sectionId}', ${articleId}, '${docType}')" 
                        class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm flex-1">
                    <i class="fas fa-upload"></i> Subir
                </button>
                <button onclick="cancelUpload('${sectionId}', ${articleId}, '${docType}')" 
                        class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm flex-1">
                    Cancelar
                </button>
            </div>
        </div>
    `;
}

async function uploadDocument(sectionId, articleId, docType) {
    const fileInput = document.getElementById(`fileInput_${sectionId}`);
    if (!fileInput || !fileInput.files[0]) {
        showMessage('Por favor selecciona un archivo', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    
    // Validaciones
    if (file.type !== 'application/pdf') {
        showMessage('Solo se permiten archivos PDF', 'error');
        return;
    }
    
    if (file.size > 16 * 1024 * 1024) { // 16MB
        showMessage('El archivo es demasiado grande (máximo 16MB)', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);
    
    try {
        showMessage('Subiendo documento...', 'info');
        
        const response = await fetch(`/api/articles/${articleId}/documents`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage(result.message, 'success');
            // Recargar el artículo para actualizar la información de documentos
            await refreshArticleInModal(articleId);
        } else {
            throw new Error(result.error || 'Error al subir documento');
        }
        
    } catch (error) {
        console.error('Error uploading document:', error);
        showMessage('Error al subir el documento: ' + error.message, 'error');
    }
}

async function cancelUpload(sectionId, articleId, docType) {
    // Recargar la sección de documentos
    const response = await fetch(`/api/articles/${articleId}`);
    const article = await response.json();
    renderDocumentSection(sectionId, article, docType);
}

async function deleteDocument(articleId, docType) {
    if (!confirm(`¿Estás seguro de que quieres eliminar el documento ${docType === 'original' ? 'original' : 'en español'}?`)) {
        return;
    }
    
    try {
        showMessage('Eliminando documento...', 'info');
        
        const response = await fetch(`/api/articles/${articleId}/documents/${docType}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage(result.message, 'success');
            await refreshArticleInModal(articleId);
        } else {
            throw new Error(result.error || 'Error al eliminar documento');
        }
        
    } catch (error) {
        console.error('Error deleting document:', error);
        showMessage('Error al eliminar el documento: ' + error.message, 'error');
    }
}

async function refreshArticleInModal(articleId) {
    try {
        const response = await fetch(`/api/articles/${articleId}`);
        const article = await response.json();
        
        renderDocumentSections(article);
        
        const index = allArticles.findIndex(a => a.id === articleId);
        if (index !== -1) {
            allArticles[index] = article;
            const filteredIndex = filteredArticles.findIndex(a => a.id === articleId);
            if (filteredIndex !== -1) {
                filteredArticles[filteredIndex] = article;
            }
            renderTable();
        }
        
    } catch (error) {
        console.error('Error refreshing article:', error);
    }
}

let columnMetadata = [];

async function openInstructionsModal() {
    try {
        if (columnMetadata.length === 0) {
            await loadColumnMetadata();
        }
        
        const instructions = generateInstructionsPrompt();
        
        document.getElementById('instructionsModal').classList.remove('hidden');
        document.getElementById('instructionsText').value = instructions;
        
    } catch (error) {
        console.error('Error opening instructions modal:', error);
        showMessage('Error al generar las instrucciones: ' + error.message, 'error');
    }
}

async function loadColumnMetadata() {
    try {
        const response = await fetch('/api/column-metadata');
        const data = await response.json();
        
        if (response.ok) {
            columnMetadata = data.metadata;
        } else {
            throw new Error(data.error || 'Error al cargar metadatos');
        }
        
    } catch (error) {
        console.error('Error loading column metadata:', error);
        throw error;
    }
}

function generateInstructionsPrompt() {
    const currentDate = new Date().toLocaleDateString('es-ES');
    
    let prompt = `# INSTRUCCIONES PARA ANÁLISIS DE ARTÍCULO CIENTÍFICO
Por favor, complete los siguientes campos basándose en la lectura cuidadosa del artículo científico. Para cada campo, siga las instrucciones específicas proporcionadas:
---
`;

    // Group fields by categories for better organization
    const categories = {
        'Información Básica': [1, 2, 3, 4, 5, 6, 7, 8, 29, 30, 31],
        'Contenido y Palabras Clave': [9, 10, 11, 12],
        'Problema e Investigación': [13, 14, 15, 16, 17, 18, 19, 20, 21],
        'Metodología': [22, 23, 24],
        'Resultados y Análisis': [25, 26, 27, 28]
    };

    for (const [categoryName, columnNumbers] of Object.entries(categories)) {
        prompt += `## ${categoryName}\n\n`;
        
        columnNumbers.forEach(colNum => {
            const metadata = columnMetadata.find(m => m.nro_columna === colNum);
            if (metadata) {
                prompt += `### ${colNum}. ${metadata.columna}\n`;
                
                if (metadata.explicacion && metadata.explicacion.trim()) {
                    prompt += `**Instrucciones:** ${metadata.explicacion}\n`;
                }
                
                if (metadata.formato && metadata.formato.trim()) {
                    prompt += `**Formato esperado:** ${metadata.formato}\n`;
                }
                
                if (metadata.dato_fijo && metadata.dato_fijo.trim()) {
                    prompt += `**Valor fijo:** ${metadata.dato_fijo}\n`;
                }
                
                if (metadata.idioma_deseado_redactar && metadata.idioma_deseado_redactar.trim()) {
                    prompt += `**Idioma:** ${metadata.idioma_deseado_redactar}\n`;
                }
                
                if (metadata.id_from_backup && metadata.id_from_backup.trim()) {
                    prompt += `**Nota:** Este campo corresponde a "${metadata.id_from_backup}" en el CSV original de Scopus.\n`;
                }
                
                prompt += `\n---\n\n`;
            }
        });
    }

    prompt += `## NOTAS IMPORTANTES

1. **Campos en español**: Cuando se especifica "español" como idioma, redacte la respuesta en español claro y académico.

2. **Campos originales**: Los campos marcados como "original" deben conservar el contenido tal como aparece en el artículo.

3. **Formato de lista**: Cuando se especifica formato "lista", use viñetas o numeración para organizar la información.

4. **Formato de prosa**: Cuando se especifica formato "prosa", redacte en párrafos coherentes.

5. **Valores por defecto**: Algunos campos tienen valores fijos (como "Scopus" para base de datos).

6. **Campos vacíos**: Si el artículo no presenta información para un campo específico, indique claramente "No presenta [tipo de información]".

## RECOMENDACIONES PARA EL ANÁLISIS

- Lea el artículo completo antes de comenzar el análisis
- Preste especial atención al abstract, introducción, metodología, resultados y conclusiones
- Sea preciso y objetivo en sus respuestas
- Mantenga la coherencia en el estilo de redacción
- Verifique que toda la información esté correctamente categorizada

---

**¡Recuerde revisar cada campo cuidadosamente antes de finalizar el análisis!**`;

    return prompt;
}

async function regenerateInstructions() {
    try {
        const instructions = generateInstructionsPrompt();
        document.getElementById('instructionsText').value = instructions;
        showMessage('Instrucciones regeneradas exitosamente', 'success');
    } catch (error) {
        console.error('Error regenerating instructions:', error);
        showMessage('Error al regenerar las instrucciones', 'error');
    }
}

async function copyInstructions() {
    try {
        const textarea = document.getElementById('instructionsText');
        
        // Select all text
        textarea.select();
        textarea.setSelectionRange(0, 99999); // For mobile devices
        
        // Copy to clipboard
        await navigator.clipboard.writeText(textarea.value);
        
        showMessage('Instrucciones copiadas al portapapeles', 'success');
        
    } catch (error) {
        console.error('Error copying instructions:', error);
        
        // Fallback for older browsers
        try {
            const textarea = document.getElementById('instructionsText');
            textarea.select();
            document.execCommand('copy');
            showMessage('Instrucciones copiadas al portapapeles', 'success');
        } catch (fallbackError) {
            showMessage('Error al copiar al portapapeles. Use Ctrl+A y Ctrl+C manualmente.', 'error');
        }
    }
}

function closeInstructionsModal() {
    document.getElementById('instructionsModal').classList.add('hidden');
}