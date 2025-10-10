import { setAllArticles, setFilteredArticles, allArticles } from './config.js';
import { loadFieldMetadata, loadArticles, checkCSV, importCSV, editArticle, saveArticle, handleToggleSelection, exportExcelAll, exportExcelBookmarks, uploadDocument, deleteDocument, refreshArticleInModal, setImportButtonLoading } from './api.js';
import { renderTable, goToPage, changeItemsPerPage, filterArticles, updateColumns, toggleColumnSettings, toggleExportDropdown, downloadExcelFile, exportExcel } from './table.js';
import { viewDocument, openDocumentSidebar, createDocumentSidebar, closeDocumentSidebar, openInNewTab, toggleFullscreen, getDocumentByType, renderDocumentSections, renderDocumentSection, showUploadForm, cancelUpload } from './documents.js';
import { showDuplicateConfirmation, closeConfirmModal, proceedWithImport, forceImport, closeModal, showMessage, showModalMessage, clearModalMessage, showInstructionsMessage, openInstructionsModal, generateInstructionsPrompt, generateInstructionsPromptJSON, regenerateInstructions, regenerateInstructionsJSON, copyInstructions, copyInstructionsJSON, validateAndApplyJSON, closeInstructionsModal, loadColumnMetadata, removeSyntaxFromFields } from './modals.js';
import { toggleContainerWidth } from './utils.js';

// Load articles on page load
document.addEventListener('DOMContentLoaded', function() {
    loadFieldMetadata();
    // Establecer el filtro SEL:V por defecto
    const selectionFilter = document.getElementById('selectionFilter');
    if (selectionFilter) {
        selectionFilter.value = 'SEL:V';
    }
    loadArticles().then(() => {
        setFilteredArticles([...allArticles].sort((a, b) => a.id - b.id));
        renderTable();
        // Aplicar el filtro después de cargar
        filterArticles();
    });
    updateColumns();
});

// Cerrar dropdown cuando se hace clic fuera
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('exportDropdown');
    const button = document.getElementById('exportButton');
    
    if (dropdown && button && !dropdown.contains(event.target) && !button.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});
document.querySelector('#toggleWidthBtn').addEventListener('click', toggleContainerWidth);

// Global keyboard shortcut for Ctrl+Alt+M to resize textareas
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'm') {
        const editModal = document.getElementById('editModal');
        if (editModal && !editModal.classList.contains('hidden')) {
            event.preventDefault();
            const textareas = document.querySelectorAll('div#editModal textarea');
            textareas.forEach(function(textarea) {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            });
        }
    }
});

// Make functions globally available for onclick handlers
window.checkCSV = checkCSV;
window.importCSV = importCSV;
window.editArticle = editArticle;
window.saveArticle = saveArticle;
window.saveArticle = saveArticle;
window.handleToggleSelection = handleToggleSelection;
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
window.showModalMessage = showModalMessage;
window.clearModalMessage = clearModalMessage;
window.openInstructionsModal = openInstructionsModal;
window.regenerateInstructions = regenerateInstructions;
window.regenerateInstructionsJSON = regenerateInstructionsJSON;
window.copyInstructions = copyInstructions;
window.copyInstructionsJSON = copyInstructionsJSON;
window.validateAndApplyJSON = validateAndApplyJSON;
window.closeInstructionsModal = closeInstructionsModal;
window.removeSyntaxFromFields = removeSyntaxFromFields;
window.setImportButtonLoading = setImportButtonLoading;