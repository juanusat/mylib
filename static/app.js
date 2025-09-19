// Global variables
let allArticles = [];
let filteredArticles = [];
let currentPage = 1;
let itemsPerPage = 25;
let readonlyFields = []; // Fields that are read-only (imported from Scopus)
let visibleColumns = {
    id: true,
    titulo_original: true,
    titulo_espanol: false,
    autor: false,
    anio: false,
    nombre_revista: false,
    quartil_revista: false,
    doi: true,
    base_datos: false,
    abstract: false,
    resumen: false,
    keywords_autor: false,
    keywords_indexed: false,
    problema_articulo: false,
    datos_estadisticos: false,
    pregunta_investigacion: false,
    objetivo_original: false,
    objetivo_espanol: false,
    objetivo_reescrito: false,
    justificacion: false,
    hipotesis: false,
    tipo_investigacion: false,
    estudios_previos: false,
    poblacion_muestra_datos: false,
    recoleccion_datos: false,
    resultados: false,
    conclusiones: false,
    discusion: false,
    trabajos_futuros: false,
    enlace: true,
    eid: false,
    seleccionado: true
};

// Load articles on page load
document.addEventListener('DOMContentLoaded', function() {
    loadFieldMetadata();
    loadArticles();
    updateColumns();
});

async function loadFieldMetadata() {
    try {
        const response = await fetch('/api/field-metadata');
        const data = await response.json();
        readonlyFields = data.readonly_fields;
    } catch (error) {
        console.error('Error loading field metadata:', error);
    }
}

async function loadArticles() {
    try {
        const response = await fetch('/api/articles');
        allArticles = await response.json();
        filteredArticles = [...allArticles];
        renderTable();
    } catch (error) {
        console.error('Error loading articles:', error);
    }
}

function renderTable() {
    renderTableHeader();
    renderTableBody();
    renderPagination();
}

function renderTableHeader() {
    const header = document.getElementById('tableHeader');
    const columns = [
        { key: 'id', label: 'ID', visible: visibleColumns.id },
        { key: 'titulo_original', label: 'Título Original', visible: visibleColumns.titulo_original },
        { key: 'titulo_espanol', label: 'Título Español', visible: visibleColumns.titulo_espanol },
        { key: 'autor', label: 'Autor', visible: visibleColumns.autor },
        { key: 'anio', label: 'Año', visible: visibleColumns.anio },
        { key: 'nombre_revista', label: 'Revista', visible: visibleColumns.nombre_revista },
        { key: 'quartil_revista', label: 'Quartil', visible: visibleColumns.quartil_revista },
        { key: 'doi', label: 'DOI', visible: visibleColumns.doi },
        { key: 'base_datos', label: 'Base de Datos', visible: visibleColumns.base_datos },
        { key: 'abstract', label: 'Abstract', visible: visibleColumns.abstract },
        { key: 'resumen', label: 'Resumen', visible: visibleColumns.resumen },
        { key: 'keywords_autor', label: 'Keywords Autor', visible: visibleColumns.keywords_autor },
        { key: 'keywords_indexed', label: 'Keywords Indexados', visible: visibleColumns.keywords_indexed },
        { key: 'problema_articulo', label: 'Problema', visible: visibleColumns.problema_articulo },
        { key: 'datos_estadisticos', label: 'Datos Estadísticos', visible: visibleColumns.datos_estadisticos },
        { key: 'pregunta_investigacion', label: 'Pregunta Investigación', visible: visibleColumns.pregunta_investigacion },
        { key: 'objetivo_original', label: 'Objetivo Original', visible: visibleColumns.objetivo_original },
        { key: 'objetivo_espanol', label: 'Objetivo Español', visible: visibleColumns.objetivo_espanol },
        { key: 'objetivo_reescrito', label: 'Objetivo Reescrito', visible: visibleColumns.objetivo_reescrito },
        { key: 'justificacion', label: 'Justificación', visible: visibleColumns.justificacion },
        { key: 'hipotesis', label: 'Hipótesis', visible: visibleColumns.hipotesis },
        { key: 'tipo_investigacion', label: 'Tipo Investigación', visible: visibleColumns.tipo_investigacion },
        { key: 'estudios_previos', label: 'Estudios Previos', visible: visibleColumns.estudios_previos },
        { key: 'poblacion_muestra_datos', label: 'Población/Muestra', visible: visibleColumns.poblacion_muestra_datos },
        { key: 'recoleccion_datos', label: 'Recolección Datos', visible: visibleColumns.recoleccion_datos },
        { key: 'resultados', label: 'Resultados', visible: visibleColumns.resultados },
        { key: 'conclusiones', label: 'Conclusiones', visible: visibleColumns.conclusiones },
        { key: 'discusion', label: 'Discusión', visible: visibleColumns.discusion },
        { key: 'trabajos_futuros', label: 'Trabajos Futuros', visible: visibleColumns.trabajos_futuros },
        { key: 'enlace', label: 'Enlace', visible: visibleColumns.enlace },
        { key: 'eid', label: 'EID', visible: visibleColumns.eid },
        { key: 'seleccionado', label: 'Seleccionado', visible: visibleColumns.seleccionado },
        { key: 'acciones', label: 'Acciones', visible: true }
    ];

    header.innerHTML = columns
        .filter(col => col.visible)
        .map(col => `<th class="border border-gray-300 px-4 py-2 text-left font-semibold">${col.label}</th>`)
        .join('');
}

function renderTableBody() {
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
        cells.push(`<td class="border border-gray-300 px-4 py-2 text-center">
            <div class="flex items-center justify-center space-x-2">
                <input type="checkbox" ${isSelected} onchange="toggleSelection(${article.id})" 
                       class="mr-2" title="Marcar como seleccionado">
                <button onclick="editArticle(${article.id})" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
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
    
    // Generar nombre del archivo con timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', '--').replace(/:/g, '-');
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