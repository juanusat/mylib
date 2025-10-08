export function viewDocument(filename, alternateFilename, rowNumber, articleTitle, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    if (!filename) {
        console.error('No filename provided');
        return;
    }
    
    const url = `/api/documents/${filename}`;
    
    if (event && (event.ctrlKey || event.metaKey)) {
        window.open(url, '_blank');
        return;
    }
    
    openDocumentSidebar(url, filename, alternateFilename, rowNumber, articleTitle);
}

export function openDocumentSidebar(url, filename, alternateFilename, rowNumber, articleTitle) {
    let sidebar = document.getElementById('documentSidebar');
    if (!sidebar) {
        sidebar = createDocumentSidebar();
    }
    
    const iframe = sidebar.querySelector('#documentIframe');
    const articleTitleElement = sidebar.querySelector('#articleTitle');
    const documentTitleElement = sidebar.querySelector('#documentTitle');
    const toggleButton = sidebar.querySelector('#toggleLanguageButton');
    
    iframe.src = url;
    
    if (articleTitleElement && rowNumber && articleTitle) {
        articleTitleElement.textContent = `${rowNumber}. ${articleTitle}`;
    }
    
    if (documentTitleElement) {
        documentTitleElement.textContent = filename;
    }
    
    if (alternateFilename && alternateFilename.trim() !== '') {
        toggleButton.style.display = 'block';
        toggleButton.onclick = () => switchDocument(alternateFilename, filename, rowNumber, articleTitle);
        
        const isSpanish = filename.includes('-SPANISH');
        toggleButton.innerHTML = isSpanish 
            ? '<i class="fas fa-language"></i> EN'
            : '<i class="fas fa-language"></i> ES';
        toggleButton.title = isSpanish 
            ? 'Ver en inglés'
            : 'Ver en español';
    } else {
        toggleButton.style.display = 'none';
    }
    
    sidebar.classList.remove('hidden');
    sidebar.classList.add('flex');
    document.body.classList.add('sidebar-open');
}

export function createDocumentSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'documentSidebar';
    sidebar.className = 'fixed top-0 right-0 h-full w-1/2 bg-white shadow-2xl z-50 hidden flex-col border-l border-gray-300';
    
    sidebar.innerHTML = `
        <div class="flex items-center justify-between py-2 px-4 border-b bg-gray-50">
            <div class="flex flex-col flex-1 min-w-0">
                <div class="flex items-center space-x-2 mb-1">
                    <i class="fas fa-file-pdf text-red-500"></i>
                    <span id="articleTitle" class="font-medium text-gray-800 truncate"></span>
                </div>
                <span id="documentTitle" class="text-sm text-gray-500 truncate ml-5"></span>
            </div>
            <div class="flex space-x-2 ml-2">
                <button id="toggleLanguageButton" 
                        class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm" 
                        style="display: none;"
                        title="Alternar idioma">
                    <i class="fas fa-language"></i>
                </button>
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
        if (e.key === 'Escape') {
            closeDocumentSidebar();
        }
    });
    
    return sidebar;
}

export function closeDocumentSidebar() {
    const sidebar = document.getElementById('documentSidebar');
    if (sidebar) {
        sidebar.classList.add('hidden');
        sidebar.classList.remove('flex');
        document.body.classList.remove('sidebar-open');
        
        // Clear iframe src to stop loading
        const iframe = sidebar.querySelector('#documentIframe');
        if (iframe) {
            iframe.src = '';
        }
    }
}

export function openInNewTab() {
    const iframe = document.querySelector('#documentIframe');
    if (iframe && iframe.src) {
        window.open(iframe.src, '_blank');
    }
}

export function toggleFullscreen() {
    const sidebar = document.getElementById('documentSidebar');
    if (!sidebar) return;
    
    const expandIcon = sidebar.querySelector('.fa-expand, .fa-compress');
    
    if (sidebar.classList.contains('w-1/2')) {
        sidebar.classList.remove('w-1/2');
        sidebar.classList.add('w-full');
        if (expandIcon) {
            expandIcon.classList.remove('fa-expand');
            expandIcon.classList.add('fa-compress');
        }
    } else {
        sidebar.classList.remove('w-full');
        sidebar.classList.add('w-1/2');
        if (expandIcon) {
            expandIcon.classList.remove('fa-compress');
            expandIcon.classList.add('fa-expand');
        }
    }
}

export function getDocumentByType(documentos, type) {
    if (!documentos || !Array.isArray(documentos)) return null;

    const candidates = [];
    
    for (const doc of documentos) {
        if (type === 'original' && doc.nombre_archivo_original) {
            candidates.push(doc);
        } else if (type === 'translated' && doc.nombre_archivo_traducido) {
            candidates.push(doc);
        }
    }
    
    if (candidates.length === 0) return null;
    
    if (candidates.length === 1) return candidates[0];
    
    if (type === 'original') {
        const originalOnly = candidates.find(doc => !doc.nombre_archivo_traducido);
        return originalOnly || candidates[0];
    } else {
        const withOriginal = candidates.find(doc => doc.nombre_archivo_original);
        return withOriginal || candidates[0];
    }
}

export function renderDocumentSections(article) {
    renderDocumentSection('originalDocSection', article, 'original');
    renderDocumentSection('translatedDocSection', article, 'translated');
}

export function renderDocumentSection(sectionId, article, docType) {
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
        section.innerHTML = `
            <div class="space-y-3">
                <div class="p-3 ${bgClass} border rounded-md">
                    <div class="flex items-center justify-between min-w-0">
                        <div class="flex items-center space-x-2 min-w-0 flex-1">
                            <i class="fas fa-file-pdf ${colorClass} flex-shrink-0"></i>
                            <span class="font-medium text-gray-800 truncate">${filename}</span>
                        </div>
                        <div class="flex space-x-1 flex-shrink-0 ml-2">
                            <button onclick="event.preventDefault(); event.stopPropagation(); viewDocument('${filename}', event)" 
                                    class="bg-green-500 hover:bg-green-600 text-white px-1 py-1 rounded text-xs" 
                                    title="Ver documento"
                                    type="button">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="deleteDocument(${article.id}, '${docType}')" 
                                    class="bg-red-500 hover:bg-red-600 text-white px-1 py-1 rounded text-xs" 
                                    title="Eliminar documento"
                                    type="button">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        section.innerHTML = `
            <div class="space-y-3">
                <div class="p-3 bg-gray-50 border border-dashed border-gray-300 rounded-md text-center">
                    <p class="text-gray-500 text-sm mb-2">No hay documento ${typeLabel}</p>
                    <button onclick="showUploadForm('${sectionId}', ${article.id}, '${docType}')" 
                            class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                        <i class="fas fa-upload"></i> Subir ${typeLabel}
                    </button>
                </div>
            </div>
        `;
    }
}

export function showUploadForm(sectionId, articleId, docType) {
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
                        class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm flex-1"
                        type="button">
                    <i class="fas fa-upload"></i> Subir
                </button>
                <button onclick="cancelUpload('${sectionId}', ${articleId}, '${docType}')" 
                        class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm flex-1"
                        type="button">
                    Cancelar
                </button>
            </div>
        </div>
    `;
}

export async function cancelUpload(sectionId, articleId, docType) {
    const response = await fetch(`/api/articles/${articleId}`);
    const article = await response.json();
    renderDocumentSection(sectionId, article, docType);
}

function switchDocument(newFilename, alternateFilename, rowNumber, articleTitle) {
    const url = `/api/documents/${newFilename}`;
    const sidebar = document.getElementById('documentSidebar');
    const iframe = sidebar.querySelector('#documentIframe');
    const documentTitleElement = sidebar.querySelector('#documentTitle');
    const toggleButton = sidebar.querySelector('#toggleLanguageButton');
    
    iframe.src = url;
    documentTitleElement.textContent = newFilename;
    
    toggleButton.onclick = () => switchDocument(alternateFilename, newFilename, rowNumber, articleTitle);
    
    const isSpanish = newFilename.includes('-SPANISH');
    toggleButton.innerHTML = isSpanish 
        ? '<i class="fas fa-language"></i> EN'
        : '<i class="fas fa-language"></i> ES';
    toggleButton.title = isSpanish 
        ? 'Ver en inglés'
        : 'Ver en español';
}