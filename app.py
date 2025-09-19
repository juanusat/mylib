from flask import Flask, render_template, request, jsonify, send_file
import psycopg2
import csv
import io
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'

# Database configuration
DATABASE_CONFIG = {
    'host': os.getenv('PG_HOST'),
    'port': os.getenv('PG_PORT'),
    'database': os.getenv('PG_DATABASE'),
    'user': os.getenv('PG_USER'), 
    'password': os.getenv('PG_PASSWORD')
}

def get_db_connection():
    return psycopg2.connect(**DATABASE_CONFIG)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/articles', methods=['GET'])
def get_articles():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM articulos ORDER BY id DESC')
    articles = cur.fetchall()
    cur.close()
    conn.close()
    
    return jsonify([{
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
    } for row in articles])

@app.route('/api/articles/<int:article_id>', methods=['GET'])
def get_article(article_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM articulos WHERE id = %s', (article_id,))
    article = cur.fetchone()
    cur.close()
    conn.close()
    
    if not article:
        return jsonify({'error': 'Article not found'}), 404
    
    return jsonify({
        'id': article[0],
        'autor': article[1],
        'nombre_revista': article[2],
        'quartil_revista': article[3],
        'anio': article[4],
        'doi': article[5],
        'titulo_original': article[6],
        'titulo_espanol': article[7],
        'base_datos': article[8],
        'abstract': article[9],
        'resumen': article[10],
        'keywords_autor': article[11],
        'keywords_indexed': article[12],
        'problema_articulo': article[13],
        'datos_estadisticos': article[14],
        'pregunta_investigacion': article[15],
        'objetivo_original': article[16],
        'objetivo_espanol': article[17],
        'objetivo_reescrito': article[18],
        'justificacion': article[19],
        'hipotesis': article[20],
        'tipo_investigacion': article[21],
        'estudios_previos': article[22],
        'poblacion_muestra_datos': article[23],
        'recoleccion_datos': article[24],
        'resultados': article[25],
        'conclusiones': article[26],
        'discusion': article[27],
        'trabajos_futuros': article[28],
        'enlace': article[29],
        'eid': article[30],
        'seleccionado': article[31]
    })

@app.route('/api/articles/<int:article_id>', methods=['PUT'])
def update_article(article_id):
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute('''
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
    ''', (
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
    ))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return jsonify({'message': 'Article updated successfully'})

@app.route('/api/check-csv', methods=['POST'])
def check_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Invalid file format'}), 400
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Read CSV
    stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
    csv_reader = csv.DictReader(stream)
    
    dois_in_csv = []
    existing_articles = []
    new_articles = []
    
    for row in csv_reader:
        doi = row.get('DOI', '').strip()
        if doi:
            dois_in_csv.append(doi)
    
    if dois_in_csv:
        # Check which DOIs already exist
        format_strings = ','.join(['%s'] * len(dois_in_csv))
        cur.execute(f'SELECT doi, titulo_original FROM articulos WHERE doi IN ({format_strings})', dois_in_csv)
        existing_results = cur.fetchall()
        
        existing_dois = {row[0]: row[1] for row in existing_results}
        
        for doi in dois_in_csv:
            if doi in existing_dois:
                existing_articles.append({
                    'doi': doi,
                    'titulo': existing_dois[doi]
                })
            else:
                new_articles.append({'doi': doi})
    
    cur.close()
    conn.close()
    
    return jsonify({
        'total_in_csv': len(dois_in_csv),
        'existing_count': len(existing_articles),
        'new_count': len(new_articles),
        'existing_articles': existing_articles,
        'has_duplicates': len(existing_articles) > 0
    })

@app.route('/api/field-metadata', methods=['GET'])
def get_field_metadata():
    """Get metadata about which fields are read-only (imported from Scopus)"""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT columna, id_from_backup FROM metadata_columnas WHERE id_from_backup IS NOT NULL AND id_from_backup != \'\'')
    readonly_fields = cur.fetchall()
    cur.close()
    conn.close()
    
    return jsonify({
        'readonly_fields': [row[0] for row in readonly_fields]
    })

@app.route('/api/import-csv', methods=['POST'])
def import_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Invalid file format'}), 400
    
    force_import = request.form.get('force_import', 'false').lower() == 'true'
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Read CSV
    stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
    csv_reader = csv.DictReader(stream)
    
    imported_count = 0
    skipped_count = 0
    
    for row in csv_reader:
        doi = row.get('DOI', '').strip()
        
        # Check if article already exists (only if not forcing import)
        if not force_import and doi:
            cur.execute('SELECT id FROM articulos WHERE doi = %s', (doi,))
            if cur.fetchone():
                skipped_count += 1
                continue
        
        try:
            cur.execute('''
                INSERT INTO articulos (
                    autor, nombre_revista, anio, doi, titulo_original, 
                    base_datos, abstract, keywords_autor, keywords_indexed, enlace, eid
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ''', (
                row.get('Authors', ''),
                row.get('Source title', ''),
                int(row.get('Year', 0)) if row.get('Year') else None,
                doi,
                row.get('Title', ''),
                'Scopus',
                row.get('Abstract', ''),
                row.get('Author Keywords', ''),
                row.get('Index Keywords', ''),
                row.get('Link', ''),
                row.get('EID', '')
            ))
            imported_count += 1
        except Exception as e:
            print(f"Error importing row: {e}")
    
    conn.commit()
    cur.close()
    conn.close()
    
    message = f'{imported_count} artículos importados'
    if skipped_count > 0:
        message += f', {skipped_count} omitidos (ya existían)'
    
    return jsonify({'message': message})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4350, debug=True)