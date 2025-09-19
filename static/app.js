// Global variables
let allArticles = [];
let filteredArticles = [];
let currentPage = 1;
let itemsPerPage = 25;
let visibleColumns = {
    id: true,
    titulo: true,
    autor: false,
    anio: false,
    revista: false,
    doi: true,
    enlace: true,
    seleccionado: true
};

// Load articles on page load
document.addEventListener('DOMContentLoaded', function() {
    loadArticles();
    updateColumns();
});

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
        { key: 'titulo', label: 'Título', visible: visibleColumns.titulo },
        { key: 'autor', label: 'Autor', visible: visibleColumns.autor },
        { key: 'anio', label: 'Año', visible: visibleColumns.anio },
        { key: 'revista', label: 'Revista', visible: visibleColumns.revista },
        { key: 'doi', label: 'DOI', visible: visibleColumns.doi },
        { key: 'enlace', label: 'Enlace', visible: visibleColumns.enlace },
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
        
        if (visibleColumns.titulo) {
            const titulo = article.titulo_original || 'Sin título';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${titulo}">${titulo}</td>`);
        }
        
        if (visibleColumns.autor) {
            const autor = article.autor || 'Sin autor';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${autor}">${autor}</td>`);
        }
        
        if (visibleColumns.anio) {
            cells.push(`<td class="border border-gray-300 px-4 py-2">${article.anio || ''}</td>`);
        }
        
        if (visibleColumns.revista) {
            const revista = article.nombre_revista || '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate" title="${revista}">${revista}</td>`);
        }
        
        if (visibleColumns.doi) {
            const doi = article.doi || '';
            const doiLink = doi ? `<a href="https://doi.org/${doi}" target="_blank" class="text-blue-600 hover:underline">${doi}</a>` : '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 max-w-xs truncate">${doiLink}</td>`);
        }
        
        if (visibleColumns.enlace) {
            const enlace = article.enlace || '';
            const enlaceLink = enlace ? `<a href="${enlace}" target="_blank" class="text-blue-600 hover:underline"><i class="fas fa-external-link-alt"></i></a>` : '';
            cells.push(`<td class="border border-gray-300 px-4 py-2 text-center">${enlaceLink}</td>`);
        }
        
        if (visibleColumns.seleccionado) {
            const badge = article.seleccionado ? 
                '<span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Sí</span>' : 
                '<span class="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">No</span>';
            cells.push(`<td class="border border-gray-300 px-4 py-2 text-center">${badge}</td>`);
        }
        
        // Actions column (always visible)
        cells.push(`<td class="border border-gray-300 px-4 py-2 text-center">
            <button onclick="editArticle(${article.id})" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                <i class="fas fa-edit"></i> Editar
            </button>
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
    filteredArticles = allArticles.filter(article => 
        (article.titulo_original || '').toLowerCase().includes(searchTerm)
    );
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
        titulo: document.getElementById('col-titulo').checked,
        autor: document.getElementById('col-autor').checked,
        anio: document.getElementById('col-anio').checked,
        revista: document.getElementById('col-revista').checked,
        doi: document.getElementById('col-doi').checked,
        enlace: document.getElementById('col-enlace').checked,
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
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.add('hidden');
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
        
        document.getElementById('articleId').value = article.id;
        document.getElementById('titulo_espanol').value = article.titulo_espanol || '';
        document.getElementById('resumen').value = article.resumen || '';
        document.getElementById('problema_articulo').value = article.problema_articulo || '';
        document.getElementById('pregunta_investigacion').value = article.pregunta_investigacion || '';
        document.getElementById('objetivo_espanol').value = article.objetivo_espanol || '';
        document.getElementById('objetivo_reescrito').value = article.objetivo_reescrito || '';
        document.getElementById('justificacion').value = article.justificacion || '';
        document.getElementById('hipotesis').value = article.hipotesis || '';
        document.getElementById('tipo_investigacion').value = article.tipo_investigacion || '';
        document.getElementById('resultados').value = article.resultados || '';
        document.getElementById('conclusiones').value = article.conclusiones || '';
        document.getElementById('seleccionado').checked = article.seleccionado || false;
        
        document.getElementById('editModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error loading article:', error);
    }
}

async function saveArticle() {
    const id = document.getElementById('articleId').value;
    const data = {
        titulo_espanol: document.getElementById('titulo_espanol').value,
        resumen: document.getElementById('resumen').value,
        problema_articulo: document.getElementById('problema_articulo').value,
        pregunta_investigacion: document.getElementById('pregunta_investigacion').value,
        objetivo_espanol: document.getElementById('objetivo_espanol').value,
        objetivo_reescrito: document.getElementById('objetivo_reescrito').value,
        justificacion: document.getElementById('justificacion').value,
        hipotesis: document.getElementById('hipotesis').value,
        tipo_investigacion: document.getElementById('tipo_investigacion').value,
        resultados: document.getElementById('resultados').value,
        conclusiones: document.getElementById('conclusiones').value,
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

function closeModal() {
    document.getElementById('editModal').classList.add('hidden');
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

function exportExcel() {
    showMessage('Función de exportación en desarrollo', 'info');
}