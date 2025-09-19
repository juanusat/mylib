import { allArticles, filteredArticles, currentPage, itemsPerPage, visibleColumns, setFilteredArticles, setCurrentPage, setItemsPerPage, setVisibleColumns } from './config.js';
import { loadArticles } from './api.js';

export function renderTable() {
    renderTableHeader();
    renderTableBody();
    renderPagination();
}

export function renderTableHeader() {
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
        { key: 'seleccionado', label: 'Sel.', visible: visibleColumns.seleccionado },
        { key: 'acciones', label: 'Acciones', visible: true }
    ];

    header.innerHTML = columns
        .filter(col => col.visible)
        .map(col => `<th class="border border-gray-300 px-4 py-2 text-left font-semibold">${col.label}</th>`)
        .join('');
}

export function renderTableBody() {
    const tbody = document.getElementById('articlesTable');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageArticles = filteredArticles.slice(startIndex, endIndex);

    tbody.innerHTML = pageArticles.map(article => {
        const cells = [];
        
        if (visibleColumns.id) cells.push(`<td class="border border-gray-300 px-4 py-2">${article.id}</td>`);
        if (visibleColumns.titulo_original) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-md overflow-hidden text-ellipsis" title="${article.titulo_original || ''}">${article.titulo_original || ''}</td>`);
        if (visibleColumns.titulo_espanol) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-md overflow-hidden text-ellipsis" title="${article.titulo_espanol || ''}">${article.titulo_espanol || ''}</td>`);
        if (visibleColumns.autor) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs overflow-hidden text-ellipsis" title="${article.autor || ''}">${article.autor || ''}</td>`);
        if (visibleColumns.anio) cells.push(`<td class="border border-gray-300 px-4 py-2">${article.anio || ''}</td>`);
        if (visibleColumns.nombre_revista) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs overflow-hidden text-ellipsis" title="${article.nombre_revista || ''}">${article.nombre_revista || ''}</td>`);
        if (visibleColumns.quartil_revista) cells.push(`<td class="border border-gray-300 px-4 py-2">${article.quartil_revista || ''}</td>`);
        if (visibleColumns.doi) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs overflow-hidden text-ellipsis" title="${article.doi || ''}">${article.doi || ''}</td>`);
        if (visibleColumns.base_datos) cells.push(`<td class="border border-gray-300 px-4 py-2">${article.base_datos || ''}</td>`);
        if (visibleColumns.abstract) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-md overflow-hidden text-ellipsis" title="${article.abstract || ''}">${article.abstract || ''}</td>`);
        if (visibleColumns.resumen) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-md overflow-hidden text-ellipsis" title="${article.resumen || ''}">${article.resumen || ''}</td>`);
        if (visibleColumns.keywords_autor) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs overflow-hidden text-ellipsis" title="${article.keywords_autor || ''}">${article.keywords_autor || ''}</td>`);
        if (visibleColumns.keywords_indexed) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs overflow-hidden text-ellipsis" title="${article.keywords_indexed || ''}">${article.keywords_indexed || ''}</td>`);
        if (visibleColumns.problema_articulo) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-md overflow-hidden text-ellipsis" title="${article.problema_articulo || ''}">${article.problema_articulo || ''}</td>`);
        if (visibleColumns.datos_estadisticos) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-md overflow-hidden text-ellipsis" title="${article.datos_estadisticos || ''}">${article.datos_estadisticos || ''}</td>`);
        if (visibleColumns.pregunta_investigacion) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-md overflow-hidden text-ellipsis" title="${article.pregunta_investigacion || ''}">${article.pregunta_investigacion || ''}</td>`);
        if (visibleColumns.objetivo_original) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-md overflow-hidden text-ellipsis" title="${article.objetivo_original || ''}">${article.objetivo_original || ''}</td>`);
        if (visibleColumns.objetivo_espanol) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-md overflow-hidden text-ellipsis" title="${article.objetivo_espanol || ''}">${article.objetivo_espanol || ''}</td>`);
        if (visibleColumns.objetivo_reescrito) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-md overflow-hidden text-ellipsis" title="${article.objetivo_reescrito || ''}">${article.objetivo_reescrito || ''}</td>`);
        if (visibleColumns.justificacion) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-md overflow-hidden text-ellipsis" title="${article.justificacion || ''}">${article.justificacion || ''}</td>`);
        if (visibleColumns.hipotesis) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-md overflow-hidden text-ellipsis" title="${article.hipotesis || ''}">${article.hipotesis || ''}</td>`);
        if (visibleColumns.tipo_investigacion) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs overflow-hidden text-ellipsis" title="${article.tipo_investigacion || ''}">${article.tipo_investigacion || ''}</td>`);
        if (visibleColumns.estudios_previos) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-md overflow-hidden text-ellipsis" title="${article.estudios_previos || ''}">${article.estudios_previos || ''}</td>`);
        if (visibleColumns.poblacion_muestra_datos) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-md overflow-hidden text-ellipsis" title="${article.poblacion_muestra_datos || ''}">${article.poblacion_muestra_datos || ''}</td>`);
        if (visibleColumns.recoleccion_datos) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-md overflow-hidden text-ellipsis" title="${article.recoleccion_datos || ''}">${article.recoleccion_datos || ''}</td>`);
        if (visibleColumns.resultados) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-md overflow-hidden text-ellipsis" title="${article.resultados || ''}">${article.resultados || ''}</td>`);
        if (visibleColumns.conclusiones) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-md overflow-hidden text-ellipsis" title="${article.conclusiones || ''}">${article.conclusiones || ''}</td>`);
        if (visibleColumns.discusion) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-md overflow-hidden text-ellipsis" title="${article.discusion || ''}">${article.discusion || ''}</td>`);
        if (visibleColumns.trabajos_futuros) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-md overflow-hidden text-ellipsis" title="${article.trabajos_futuros || ''}">${article.trabajos_futuros || ''}</td>`);
        if (visibleColumns.enlace) {
            const linkCell = article.enlace ? 
                `<a href="${article.enlace}" target="_blank" class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm">Link</a>` : 
                '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 text-center">${linkCell}</td>`);
        }
        if (visibleColumns.eid) cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs overflow-hidden text-ellipsis" title="${article.eid || ''}">${article.eid || ''}</td>`);
        if (visibleColumns.seleccionado) {
            cells.push(`<td class="border border-gray-300 px-4 py-2 text-center">
                <input type="checkbox" 
                       ${article.seleccionado ? 'checked' : ''} 
                       data-id="${article.id}"
                       onchange="toggleSelection(${article.id})"
                       class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">
            </td>`);
        }
        
        // Actions column
        const documentsInfo = getDocumentsInfo(article);
        cells.push(`
            <td class="border border-gray-300 px-4 py-2">
                <div class="flex space-x-2">
                    <button onclick="editArticle(${article.id})" 
                            class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm" 
                            title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${documentsInfo}
                </div>
            </td>
        `);
        
        return `<tr>${cells.join('')}</tr>`;
    }).join('');
}

export function renderPagination() {
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
        buttons.push(`<button onclick="goToPage(${currentPage - 1})" class="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded">Anterior</button>`);
    }

    // Page numbers
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        const activeClass = i === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300';
        buttons.push(`<button onclick="goToPage(${i})" class="${activeClass} px-3 py-1 rounded">${i}</button>`);
    }

    // Next button
    if (currentPage < totalPages) {
        buttons.push(`<button onclick="goToPage(${currentPage + 1})" class="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded">Siguiente</button>`);
    }

    controls.innerHTML = buttons.join('');
}

export function goToPage(page) {
    setCurrentPage(page);
    renderTable();
}

export function changeItemsPerPage() {
    setItemsPerPage(parseInt(document.getElementById('itemsPerPage').value));
    setCurrentPage(1);
    renderTable();
}

export function filterArticles() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectionFilter = document.getElementById('selectionFilter').value;
    
    const filtered = allArticles.filter(article => {
        const matchesSearch = !searchTerm || 
            (article.titulo_original && article.titulo_original.toLowerCase().includes(searchTerm)) ||
            (article.titulo_espanol && article.titulo_espanol.toLowerCase().includes(searchTerm)) ||
            (article.autor && article.autor.toLowerCase().includes(searchTerm));
        
        const matchesSelection = !selectionFilter || 
            (selectionFilter === 'SEL:V' && article.seleccionado) ||
            (selectionFilter === 'SEL:F' && !article.seleccionado);
        
        return matchesSearch && matchesSelection;
    });
    
    setFilteredArticles(filtered);
    setCurrentPage(1);
    renderTable();
}

export function updateColumns() {
    const newVisibleColumns = {
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
    setVisibleColumns(newVisibleColumns);
    renderTable();
}

export function toggleColumnSettings() {
    const panel = document.getElementById('columnSettings');
    panel.classList.toggle('hidden');
}

export function toggleExportDropdown() {
    const dropdown = document.getElementById('exportDropdown');
    dropdown.classList.toggle('hidden');
}

function getDocumentsInfo(article) {
    if (!article.documentos || article.documentos.length === 0) {
        return '';
    }
    
    let buttons = [];
    
    for (const doc of article.documentos) {
        if (doc.nombre_archivo_original) {
            buttons.push(`
                <button onclick="viewDocument('${doc.nombre_archivo_original}', event)" 
                        class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs" 
                        title="Ver documento original">
                    <i class="fas fa-file-pdf"></i>
                </button>
            `);
        }
        
        if (doc.nombre_archivo_traducido) {
            buttons.push(`
                <button onclick="viewDocument('${doc.nombre_archivo_traducido}', event)" 
                        class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs" 
                        title="Ver documento en español">
                    <i class="fas fa-file-pdf"></i>
                </button>
            `);
        }
    }
    
    return buttons.join('');
}

export function downloadExcelFile(blob, baseName) {
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

export function exportExcel() {
    // Mantener compatibilidad con la función original por si se llama desde algún lugar
    exportExcelAll();
}