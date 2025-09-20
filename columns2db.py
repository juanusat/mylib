import os
import re
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv

load_dotenv()

def connect_to_database():
    try:
        conn = psycopg2.connect(
            host=os.getenv('PG_HOST'),
            port=os.getenv('PG_PORT'),
            user=os.getenv('PG_USER'),
            password=os.getenv('PG_PASSWORD'),
            database=os.getenv('PG_DATABASE')
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        return conn
    except Exception as e:
        print(f"Error conectando a la base de datos: {e}")
        return None

def parse_markdown_table(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        lines = content.strip().split('\n')
        
        header_line = None
        separator_line = None
        data_start = None
        
        for i, line in enumerate(lines):
            if '|nro_columna|' in line:
                header_line = i
                separator_line = i + 1
                data_start = i + 2
                break
        
        if header_line is None:
            raise ValueError("No se encontró la tabla en el archivo")
        
        headers = [col.strip() for col in lines[header_line].split('|') if col.strip()]
        
        rows = []
        for i in range(data_start, len(lines)):
            line = lines[i].strip()
            if not line or not line.startswith('|'):
                continue
            
            columns = [col.strip() for col in line.split('|')]
            if columns and columns[0] == '':
                columns = columns[1:]
            if columns and columns[-1] == '':
                columns = columns[:-1]
            
            if len(columns) >= 7:
                rows.append(columns)
        
        return headers, rows
    
    except Exception as e:
        print(f"Error leyendo el archivo markdown: {e}")
        return None, None

def reset_table(cursor):
    """Reinicia la tabla metadata_columnas (elimina datos y reinicia secuencias)"""
    try:
        cursor.execute("DELETE FROM metadata_columnas;")
        cursor.execute("ALTER SEQUENCE metadata_columnas_id_seq RESTART WITH 1;")
        
        print("Tabla metadata_columnas reiniciada correctamente")
        
    except Exception as e:
        print(f"Error reiniciando la tabla: {e}")
        raise

def insert_column_data(cursor, rows):
    try:
        insert_query = """
        INSERT INTO metadata_columnas 
        (nro_columna, columna, explicacion, formato, dato_fijo, idioma_deseado_redactar, id_from_backup, max)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        inserted_count = 0
        
        for row in rows:
            nro_columna = None
            columna = ""
            explicacion = ""
            formato = ""
            dato_fijo = ""
            idioma_deseado = ""
            id_from_backup = ""
            max_value = None
            
            try:
                if len(row) > 0 and row[0].isdigit():
                    nro_columna = int(row[0])
                
                if len(row) > 1:
                    columna = row[1]
                
                if len(row) > 2:
                    explicacion = row[2]
                
                if len(row) > 3:
                    formato = row[3]
                
                if len(row) > 4:
                    dato_fijo = row[4]
                
                if len(row) > 5:
                    idioma_deseado = row[5]
                
                if len(row) > 6:
                    id_from_backup = row[6]
                
                if len(row) > 9 and row[9] and row[9].isdigit():
                    max_value = int(row[9])
                
                if nro_columna is not None and columna:
                    cursor.execute(insert_query, (
                        nro_columna,
                        columna,
                        explicacion,
                        formato,
                        dato_fijo,
                        idioma_deseado,
                        id_from_backup,
                        max_value
                    ))
                    inserted_count += 1
                    print(f"  - Insertada fila {inserted_count}: {nro_columna} - {columna}")
                
            except Exception as e:
                print(f"Error procesando fila {row}: {e}")
                continue
        
        print(f"Total de filas insertadas: {inserted_count}")
        
    except Exception as e:
        print(f"Error insertando datos: {e}")
        raise

def main():
    print("=== Script columns2db.py ===")
    print("Procesando columnas-analisis.md -> tabla metadata_columnas")
    
    markdown_file = "columnas-analisis.md"
    
    if not os.path.exists(markdown_file):
        print(f"Error: No se encontró el archivo {markdown_file}")
        return
    
    print(f"Leyendo archivo: {markdown_file}")
    headers, rows = parse_markdown_table(markdown_file)
    
    if headers is None or rows is None:
        print("Error: No se pudo procesar el archivo markdown")
        return
    
    print(f"Headers encontrados: {headers}")
    print(f"Filas de datos encontradas: {len(rows)}")
    
    print("Conectando a la base de datos...")
    conn = connect_to_database()
    
    if conn is None:
        print("Error: No se pudo conectar a la base de datos")
        return
    
    try:
        cursor = conn.cursor()
        
        print("Reiniciando tabla metadata_columnas...")
        reset_table(cursor)
        
        print("Insertando datos...")
        insert_column_data(cursor, rows)
        
        print("> Proceso completado exitosamente")
        
    except Exception as e:
        print(f"Error durante el proceso: {e}")
        
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    main()