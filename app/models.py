from app.database import DatabaseManager

class Article:
    
    @staticmethod
    def get_all():
        query = 'SELECT * FROM articulos ORDER BY id DESC'
        return DatabaseManager.execute_query(query, fetch_all=True)
    
    @staticmethod
    def get_by_id(article_id):
        query = 'SELECT * FROM articulos WHERE id = %s'
        return DatabaseManager.execute_query(query, (article_id,), fetch_one=True)
    
    @staticmethod
    def update(article_id, data):
        query = '''
            UPDATE articulos SET 
                autor = %s, nombre_revista = %s, quartil_revista = %s, anio = %s, doi = %s,
                titulo_original = %s, titulo_espanol = %s, base_datos = %s, abstract = %s, 
                resumen = %s, keywords_autor = %s, keywords_indexed = %s, problema_articulo = %s,
                datos_estadisticos = %s, pregunta_investigacion = %s, objetivo_original = %s,
                objetivo_espanol = %s, objetivo_reescrito = %s, justificacion = %s,
                hipotesis = %s, tipo_investigacion = %s, estudios_previos = %s,
                poblacion_muestra_datos = %s, recoleccion_datos = %s, resultados = %s,
                conclusiones = %s, discusion = %s, trabajos_futuros = %s, enlace = %s,
                eid = %s, seleccionado = %s
            WHERE id = %s
        '''
        params = (
            data.get('autor'), data.get('nombre_revista'), data.get('quartil_revista'), 
            data.get('anio'), data.get('doi'), data.get('titulo_original'), data.get('titulo_espanol'),
            data.get('base_datos'), data.get('abstract'), data.get('resumen'), 
            data.get('keywords_autor'), data.get('keywords_indexed'), data.get('problema_articulo'),
            data.get('datos_estadisticos'), data.get('pregunta_investigacion'), data.get('objetivo_original'),
            data.get('objetivo_espanol'), data.get('objetivo_reescrito'), data.get('justificacion'),
            data.get('hipotesis'), data.get('tipo_investigacion'), data.get('estudios_previos'),
            data.get('poblacion_muestra_datos'), data.get('recoleccion_datos'), data.get('resultados'),
            data.get('conclusiones'), data.get('discusion'), data.get('trabajos_futuros'),
            data.get('enlace'), data.get('eid'), data.get('seleccionado'), article_id
        )
        DatabaseManager.execute_query(query, params)
    
    @staticmethod
    def create(data):
        query = '''
            INSERT INTO articulos (
                autor, nombre_revista, anio, doi, titulo_original, 
                base_datos, abstract, keywords_autor, keywords_indexed, enlace, eid
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        '''
        params = (
            data.get('autor', ''),
            data.get('nombre_revista', ''),
            int(data.get('anio', 0)) if data.get('anio') else None,
            data.get('doi', ''),
            data.get('titulo_original', ''),
            data.get('base_datos', 'Scopus'),
            data.get('abstract', ''),
            data.get('keywords_autor', ''),
            data.get('keywords_indexed', ''),
            data.get('enlace', ''),
            data.get('eid', '')
        )
        result = DatabaseManager.execute_query(query, params, fetch_one=True)
        return result[0] if result else None
    
    @staticmethod
    def check_doi_exists(doi):
        query = 'SELECT doi, titulo_original FROM articulos WHERE doi = %s'
        return DatabaseManager.execute_query(query, (doi,), fetch_one=True)
    
    @staticmethod
    def check_multiple_dois(dois):
        if not dois:
            return []
            
        format_strings = ','.join(['%s'] * len(dois))
        query = f'SELECT doi, titulo_original FROM articulos WHERE doi IN ({format_strings})'
        return DatabaseManager.execute_query(query, dois, fetch_all=True)
    
    @staticmethod
    def to_dict(row):
        if not row:
            return None
            
        return {
            'id': row[0],
            'autor': row[1],
            'nombre_revista': row[2],
            'quartil_revista': row[3],
            'anio': row[4],
            'doi': row[5],
            'titulo_original': row[6],
            'titulo_espanol': row[7],
            'base_datos': row[8],
            'abstract': row[9],
            'resumen': row[10],
            'keywords_autor': row[11],
            'keywords_indexed': row[12],
            'problema_articulo': row[13],
            'datos_estadisticos': row[14],
            'pregunta_investigacion': row[15],
            'objetivo_original': row[16],
            'objetivo_espanol': row[17],
            'objetivo_reescrito': row[18],
            'justificacion': row[19],
            'hipotesis': row[20],
            'tipo_investigacion': row[21],
            'estudios_previos': row[22],
            'poblacion_muestra_datos': row[23],
            'recoleccion_datos': row[24],
            'resultados': row[25],
            'conclusiones': row[26],
            'discusion': row[27],
            'trabajos_futuros': row[28],
            'enlace': row[29],
            'eid': row[30],
            'seleccionado': row[31]
        }

class ColumnMetadata:
    
    @staticmethod
    def get_readonly_fields():
        query = '''
            SELECT columna, id_from_backup 
            FROM metadata_columnas 
            WHERE id_from_backup IS NOT NULL AND id_from_backup != ''
        '''
        rows = DatabaseManager.execute_query(query, fetch_all=True)
        return [row[0] for row in rows] if rows else []