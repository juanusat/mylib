import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv
import columns2db

class SetupValidator:
    def __init__(self):
        self.env_file = '.env'
        self.schema_file = 'schema-mylib.sql'
        self.required_env_vars = [
            'PG_HOST', 'PG_PORT', 'PG_USER', 
            'PG_PASSWORD', 'PG_DATABASE'
        ]
    
    def validate_and_setup(self):
        print("Validando entorno de la aplicación")
        
        try:
            if not self._validate_env_file():
                return False
            
            load_dotenv()
            
            if not self._validate_and_setup_database():
                return False
            
            if not self._validate_and_setup_schema():
                return False
            
            if not self._validate_and_setup_data():
                return False
            
            print("Entorno validado y configurado correctamente")
            return True
            
        except Exception as e:
            print(f"Error durante la validación del entorno: {e}")
            return False
    
    def _validate_env_file(self):
        print("Validando archivo .env...")
        
        if not os.path.exists(self.env_file):
            print(f"Error: No se encontró el archivo {self.env_file}")
            print("   Cree el archivo .env con las variables de base de datos necesarias")
            return False
        
        load_dotenv()
        
        missing_vars = []
        for var in self.required_env_vars:
            if not os.getenv(var):
                missing_vars.append(var)
        
        if missing_vars:
            print(f"Error: Variables faltantes en .env: {', '.join(missing_vars)}")
            return False
        
        print("Archivo .env válido")
        return True
    
    def _validate_and_setup_database(self):
        print("Validando base de datos...")
        
        target_db = os.getenv('PG_DATABASE')
        
        if self._database_exists(target_db):
            print(f"Base de datos '{target_db}' ya existe")
            return True
        
        print(f"Creando base de datos '{target_db}'...")
        return self._create_database(target_db)
    
    def _database_exists(self, database_name):
        try:
            conn = psycopg2.connect(
                host=os.getenv('PG_HOST'),
                port=os.getenv('PG_PORT'),
                user=os.getenv('PG_USER'),
                password=os.getenv('PG_PASSWORD'),
                database='postgres'
            )
            conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            
            cursor = conn.cursor()
            cursor.execute(
                "SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s",
                (database_name,)
            )
            exists = cursor.fetchone() is not None
            
            cursor.close()
            conn.close()
            
            return exists
            
        except Exception as e:
            print(f"Error verificando existencia de BD: {e}")
            return False
    
    def _create_database(self, database_name):
        try:
            conn = psycopg2.connect(
                host=os.getenv('PG_HOST'),
                port=os.getenv('PG_PORT'),
                user=os.getenv('PG_USER'),
                password=os.getenv('PG_PASSWORD'),
                database='postgres'
            )
            conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            
            cursor = conn.cursor()
            cursor.execute(f'CREATE DATABASE "{database_name}"')
            
            cursor.close()
            conn.close()
            
            print(f"Base de datos '{database_name}' creada exitosamente")
            return True
            
        except Exception as e:
            print(f"Error creando base de datos: {e}")
            return False
    
    def _validate_and_setup_schema(self):
        print("Validando esquema de base de datos...")
        
        if self._schema_exists():
            print("Esquema de base de datos ya existe")
            return True
        
        print("Creando esquema de base de datos...")
        return self._create_schema()
    
    def _schema_exists(self):
        try:
            conn = self._get_target_db_connection()
            cursor = conn.cursor()
            
            tables_to_check = ['articulos', 'articulo_documentos', 'metadata_columnas']
            
            for table in tables_to_check:
                cursor.execute("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = %s
                    )
                """, (table,))
                
                if not cursor.fetchone()[0]:
                    cursor.close()
                    conn.close()
                    return False
            
            cursor.close()
            conn.close()
            return True
            
        except Exception as e:
            print(f"Error verificando esquema: {e}")
            return False
    
    def _create_schema(self):
        try:
            if not os.path.exists(self.schema_file):
                print(f"Error: No se encontró el archivo {self.schema_file}")
                return False
            
            with open(self.schema_file, 'r', encoding='utf-8') as file:
                schema_sql = file.read()
            
            conn = self._get_target_db_connection()
            cursor = conn.cursor()
            cursor.execute(schema_sql)
            
            cursor.close()
            conn.close()
            
            print("Esquema creado exitosamente")
            return True
            
        except Exception as e:
            print(f"Error creando esquema: {e}")
            return False
    
    def _validate_and_setup_data(self):
        print("Validando datos en metadata_columnas...")
        
        if self._data_exists():
            print("Datos en metadata_columnas ya existen")
            return True
        
        print("Poblando datos en metadata_columnas...")
        return self._populate_data()
    
    def _data_exists(self):
        try:
            conn = self._get_target_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("SELECT COUNT(*) FROM metadata_columnas")
            count = cursor.fetchone()[0]
            
            cursor.close()
            conn.close()
            
            return count > 0
            
        except Exception as e:
            print(f"Error verificando datos: {e}")
            return False
    
    def _populate_data(self):
        try:
            if not os.path.exists('columnas-analisis.md'):
                print("Error: No se encontró el archivo columnas-analisis.md")
                return False
            
            markdown_file = "columnas-analisis.md"
            headers, rows = columns2db.parse_markdown_table(markdown_file)
            
            if headers is None or rows is None:
                print("Error: No se pudo procesar el archivo markdown")
                return False
            
            conn = self._get_target_db_connection()
            if conn is None:
                print("Error: No se pudo conectar a la base de datos")
                return False
            
            cursor = conn.cursor()
            columns2db.reset_table(cursor)
            columns2db.insert_column_data(cursor, rows)
            
            cursor.close()
            conn.close()
            
            print("Datos poblados exitosamente")
            return True
                
        except Exception as e:
            print(f"Error poblando datos: {e}")
            return False
    
    def _get_target_db_connection(self):
        conn = psycopg2.connect(
            host=os.getenv('PG_HOST'),
            port=os.getenv('PG_PORT'),
            user=os.getenv('PG_USER'),
            password=os.getenv('PG_PASSWORD'),
            database=os.getenv('PG_DATABASE')
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        return conn


def validate_environment():
    validator = SetupValidator()
    return validator.validate_and_setup()


if __name__ == "__main__":
    success = validate_environment()
    if success:
        print("Entorno listo para iniciar la aplicación")
        sys.exit(0)
    else:
        print("No se pudo configurar el entorno")
        sys.exit(1)