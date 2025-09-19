import { setAllArticles, setFilteredArticles, allArticles } from './config.js';
import { loadFieldMetadata, loadArticles, checkCSV, importCSV, editArticle, saveArticle, toggleSelection, exportExcelAll, exportExcelBookmarks, uploadDocument, deleteDocument, refreshArticleInModal } from './api.js';
import { renderTable, goToPage, changeItemsPerPage, filterArticles, updateColumns, toggleColumnSettings, toggleExportDropdown, downloadExcelFile, exportExcel } from './table.js';
import { viewDocument, openDocumentSidebar, createDocumentSidebar, closeDocumentSidebar, openInNewTab, toggleFullscreen, getDocumentByType, renderDocumentSections, renderDocumentSection, showUploadForm, cancelUpload } from './documents.js';
import { showDuplicateConfirmation, closeConfirmModal, proceedWithImport, forceImport, closeModal, showMessage, openInstructionsModal, generateInstructionsPrompt, regenerateInstructions, copyInstructions, closeInstructionsModal, loadColumnMetadata } from './modals.js';
import { setFieldValue, configureReadonlyFields, getFieldValue } from './utils.js';

// Load articles on page load
document.addEventListener('DOMContentLoaded', function() {
    loadFieldMetadata();
    loadArticles().then(() => {
        setFilteredArticles([...allArticles]);
        renderTable();
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