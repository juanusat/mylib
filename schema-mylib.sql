CREATE TABLE articulos (
    id SERIAL PRIMARY KEY,
    autor varchar(2000),
    nombre_revista varchar(500),
    quartil_revista varchar(50),
    anio INTEGER,
    doi varchar(300),
    titulo_original varchar(1000),
    titulo_espanol varchar(1000),
    base_datos varchar(100),
    abstract varchar(4000),
    resumen varchar(4000),
    keywords_autor varchar(2000),
    keywords_indexed varchar(2000),
    problema_articulo varchar(2000),
    datos_estadisticos varchar(2000),
    pregunta_investigacion varchar(1000),
    objetivo_original varchar(1000),
    objetivo_espanol varchar(1000),
    objetivo_reescrito varchar(1000),
    justificacion varchar(1000),
    hipotesis varchar(1000),
    tipo_investigacion varchar(500),
    estudios_previos varchar(2000),
    poblacion_muestra_datos varchar(1000),
    recoleccion_datos varchar(1000),
    resultados varchar(2000),
    conclusiones varchar(2000),
    discusion varchar(2000),
    trabajos_futuros varchar(1000),
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
    explicacion varchar(2000),
    dato_fijo varchar(500),
    formato varchar(100),
    idioma_deseado_redactar varchar(100),
    id_from_backup varchar(200),
    max INTEGER
);