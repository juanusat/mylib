// Global variables
export let allArticles = [];
export let filteredArticles = [];
export let currentPage = 1;
export let itemsPerPage = 25;
export let readonlyFields = []; // Fields that are read-only (imported from Scopus)
export let visibleColumns = {
    id: true,
    titulo_original: true,
    titulo_espanol: false,
    autor: false,
    anio: false,
    nombre_revista: false,
    quartil_revista: false,
    doi: false,
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

export let columnMetadata = [];

// Setters for mutable state
export function setAllArticles(articles) {
    allArticles = articles;
}

export function setFilteredArticles(articles) {
    filteredArticles = articles;
}

export function setCurrentPage(page) {
    currentPage = page;
}

export function setItemsPerPage(items) {
    itemsPerPage = items;
}

export function setReadonlyFields(fields) {
    readonlyFields = fields;
}

export function setVisibleColumns(columns) {
    visibleColumns = columns;
}

export function setColumnMetadata(metadata) {
    columnMetadata = metadata;
}