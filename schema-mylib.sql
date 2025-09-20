CREATE TABLE articulos (
    id SERIAL PRIMARY KEY,
    autor varchar(4000),
    nombre_revista varchar(500),
    quartil_revista varchar(50),
    anio INTEGER,
    doi varchar(300),
    titulo_original varchar(4000),
    titulo_espanol varchar(4000),
    base_datos varchar(100),
    abstract varchar(4000),
    resumen varchar(4000),
    keywords_autor varchar(4000),
    keywords_indexed varchar(4000),
    problema_articulo varchar(4000),
    datos_estadisticos varchar(4000),
    pregunta_investigacion varchar(4000),
    objetivo_original varchar(4000),
    objetivo_espanol varchar(4000),
    objetivo_reescrito varchar(4000),
    justificacion varchar(4000),
    hipotesis varchar(4000),
    tipo_investigacion varchar(500),
    estudios_previos varchar(4000),
    poblacion_muestra_datos varchar(4000),
    recoleccion_datos varchar(4000),
    resultados varchar(4000),
    conclusiones varchar(4000),
    discusion varchar(4000),
    trabajos_futuros varchar(4000),
    enlace varchar(500),
    eid varchar(100),
    seleccionado BOOLEAN DEFAULT FALSE
);

CREATE TABLE articulo_documentos (
    id SERIAL PRIMARY KEY,
    articulo_id INTEGER REFERENCES articulos(id) ON DELETE CASCADE,
    nombre_archivo_original VARCHAR(500),
    nombre_archivo_traducido VARCHAR(500)
);

CREATE TABLE metadata_columnas (
    id SERIAL PRIMARY KEY,
    nro_columna INTEGER,
    columna varchar(500),
    explicacion varchar(4000),
    dato_fijo varchar(500),
    formato varchar(100),
    idioma_deseado_redactar varchar(100),
    id_from_backup varchar(200),
    max INTEGER
);