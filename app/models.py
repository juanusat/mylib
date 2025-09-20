from app.database import DatabaseManager

class Article:
    
    @staticmethod
    def get_all():
        query = 'SELECT * FROM articulos ORDER BY id DESC'
        return DatabaseManager.execute_query(query, fetch_all=True)
    
    @staticmethod
    def get_all_with_documents():
        """Obtiene todos los artículos con sus documentos de manera optimizada"""
        # Obtener todos los artículos
        articles = Article.get_all()
        
        if not articles:
            return []
        
        # Obtener todos los documentos de una vez
        article_ids = [str(article[0]) for article in articles]
        if article_ids:
            placeholders = ','.join(['%s'] * len(article_ids))
            docs_query = f'''
                SELECT id, articulo_id, nombre_archivo_original, nombre_archivo_traducido 
                FROM articulo_documentos 
                WHERE articulo_id IN ({placeholders})
            '''
            documents = DatabaseManager.execute_query(docs_query, article_ids, fetch_all=True)
            
            # Mapear documentos por artículo
            docs_by_article = {}
            for doc in documents:
                article_id = doc[1]
                if article_id not in docs_by_article:
                    docs_by_article[article_id] = []
                docs_by_article[article_id].append(ArticleDocument.to_dict(doc))
        else:
            docs_by_article = {}
        
        # Combinar artículos con documentos
        result = []
        for article in articles:
            article_dict = Article.to_dict(article)
            article_dict['documentos'] = docs_by_article.get(article[0], [])
            result.append(article_dict)
        
        return result
    
    @staticmethod
    def get_all_for_export():
        query = '''
            SELECT autor, nombre_revista, quartil_revista, anio, doi,
                   titulo_original, titulo_espanol, base_datos, abstract, resumen,
                   keywords_autor, keywords_indexed, problema_articulo, datos_estadisticos,
                   pregunta_investigacion, objetivo_original, objetivo_espanol,
                   objetivo_reescrito, justificacion, hipotesis, tipo_investigacion,
                   estudios_previos, poblacion_muestra_datos, recoleccion_datos,
                   resultados, conclusiones, discusion, trabajos_futuros,
                   enlace, eid, seleccionado
            FROM articulos ORDER BY id DESC
        '''
        return DatabaseManager.execute_query(query, fetch_all=True)
    
    @staticmethod
    def get_bookmarks():
        query = 'SELECT * FROM articulos WHERE seleccionado = true ORDER BY id DESC'
        return DatabaseManager.execute_query(query, fetch_all=True)
    
    @staticmethod
    def get_bookmarks_for_export():
        query = '''
            SELECT autor, nombre_revista, quartil_revista, anio, doi,
                   titulo_original, titulo_espanol, base_datos, abstract, resumen,
                   keywords_autor, keywords_indexed, problema_articulo, datos_estadisticos,
                   pregunta_investigacion, objetivo_original, objetivo_espanol,
                   objetivo_reescrito, justificacion, hipotesis, tipo_investigacion,
                   estudios_previos, poblacion_muestra_datos, recoleccion_datos,
                   resultados, conclusiones, discusion, trabajos_futuros,
                   enlace, eid, seleccionado
            FROM articulos WHERE seleccionado = true ORDER BY id DESC
        '''
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
            'seleccionado': row[31],
            'documentos': []  # Lista vacía por defecto para compatibilidad
        }
    
    @staticmethod
    def to_dict_with_documents(row):
        """Versión que incluye documentos - solo usar cuando sea necesario"""
        if not row:
            return None
            
        article_dict = Article.to_dict(row)
        
        # Agregar información de documentos
        documents = ArticleDocument.get_by_article_id(row[0])
        article_dict['documentos'] = [ArticleDocument.to_dict(doc) for doc in documents] if documents else []
        
        return article_dict

class ArticleDocument:
    
    @staticmethod
    def get_by_article_id(article_id):
        """Obtiene todos los documentos de un artículo específico"""
        query = 'SELECT id, articulo_id, nombre_archivo_original, nombre_archivo_traducido FROM articulo_documentos WHERE articulo_id = %s'
        return DatabaseManager.execute_query(query, (article_id,), fetch_all=True)
    
    @staticmethod
    def create(article_id, original_filename, translated_filename=None):
        """Crea un nuevo documento asociado a un artículo"""
        query = '''
            INSERT INTO articulo_documentos (articulo_id, nombre_archivo_original, nombre_archivo_traducido)
            VALUES (%s, %s, %s)
            RETURNING id
        '''
        params = (article_id, original_filename, translated_filename)
        result = DatabaseManager.execute_query(query, params, fetch_one=True)
        return result[0] if result else None
    
    @staticmethod
    def delete(document_id):
        """Elimina un documento específico"""
        query = 'DELETE FROM articulo_documentos WHERE id = %s'
        DatabaseManager.execute_query(query, (document_id,))
    
    @staticmethod
    def delete_by_article_and_type(article_id, doc_type):
        """Elimina documento por artículo y tipo (original o traducido)"""
        if doc_type == 'original':
            query = 'DELETE FROM articulo_documentos WHERE articulo_id = %s AND nombre_archivo_original IS NOT NULL'
        elif doc_type == 'translated':
            query = 'DELETE FROM articulo_documentos WHERE articulo_id = %s AND nombre_archivo_traducido IS NOT NULL'
        else:
            return
        
        DatabaseManager.execute_query(query, (article_id,))
    
    @staticmethod
    def update_translated_filename(article_id, translated_filename):
        """Actualiza el nombre del archivo traducido"""
        query = '''
            UPDATE articulo_documentos 
            SET nombre_archivo_traducido = %s 
            WHERE articulo_id = %s AND nombre_archivo_original IS NOT NULL
        '''
        DatabaseManager.execute_query(query, (translated_filename, article_id))
    
    @staticmethod
    def to_dict(row):
        """Convierte una fila de documento a diccionario"""
        if not row:
            return None
        
        return {
            'id': row[0],
            'articulo_id': row[1],
            'nombre_archivo_original': row[2],
            'nombre_archivo_traducido': row[3]
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
        
        # Map friendly names to database column names
        friendly_to_db_mapping = {
            'Autor(es)': 'autor',
            'Nombre Revista': 'nombre_revista',
            'Fecha': 'anio',
            'DOI': 'doi',
            'Título': 'titulo_original',
            'Abstract': 'abstract',
            'Keyswords author': 'keywords_autor',
            'Keyswords indexed': 'keywords_indexed',
            'Enlace': 'enlace',
            'EID': 'eid'
        }
        
        readonly_fields = []
        if rows:
            for row in rows:
                friendly_name = row[0]
                db_column_name = friendly_to_db_mapping.get(friendly_name)
                if db_column_name:
                    readonly_fields.append(db_column_name)
        
        return readonly_fields
    
    @staticmethod
    def get_all_metadata():
        query = '''
            SELECT nro_columna, columna, explicacion, formato, dato_fijo, 
                   idioma_deseado_redactar, id_from_backup, max 
            FROM metadata_columnas 
            ORDER BY nro_columna
        '''
        rows = DatabaseManager.execute_query(query, fetch_all=True)
        
        result = []
        for row in rows:
            result.append({
                'nro_columna': row[0],
                'columna': row[1],
                'explicacion': row[2],
                'formato': row[3],
                'dato_fijo': row[4],
                'idioma_deseado_redactar': row[5],
                'id_from_backup': row[6],
                'max': row[7]
            })
        
        return result