import os
import sys
import shutil
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv
import columns2db
from contextlib import contextmanager

class ProjectInitializer:
    def __init__(self):
        self.env_file = '.env'
        self.example_env_file = 'example.env'
        self.schema_file = 'schema-mylib.sql'
        self.required_env_vars = [
            'PG_HOST', 'PG_PORT', 'PG_USER', 
            'PG_PASSWORD', 'PG_DATABASE'
        ]
    
    def _print_error_and_exit_instructions(self, error_msg):
        print(f"\n{error_msg}")
        print(f"Ejecuta 'python {__file__}' para intentar resolver el problema.")
        return False
    
    @contextmanager
    def _get_postgres_connection(self, database='postgres'):
        conn = None
        cursor = None
        try:
            conn = psycopg2.connect(
                host=os.getenv('PG_HOST'),
                port=os.getenv('PG_PORT'),
                user=os.getenv('PG_USER'),
                password=os.getenv('PG_PASSWORD'),
                database=database
            )
            conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            cursor = conn.cursor()
            yield cursor
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
    
    def _execute_db_operation(self, operation_name, operation_func, *args, **kwargs):
        try:
            return operation_func(*args, **kwargs)
        except Exception as e:
            print(f"Error {operation_name}: {e}")
            return False
    
    def initialize(self):
        print("Inicializando proyecto...")
        
        try:
            if not self._ensure_env_file():
                return self._print_error_and_exit_instructions("Configuración incompleta.")
            
            load_dotenv()
            
            if not self._validate_and_setup_database():
                return self._print_error_and_exit_instructions("Error en la configuración de base de datos.")
            
            if not self._validate_and_setup_schema():
                return self._print_error_and_exit_instructions("Error en la configuración del esquema de base de datos.")
            
            if not self._validate_and_setup_data():
                return self._print_error_and_exit_instructions("Error en la configuración de datos iniciales.")
            
            print("\nProyecto inicializado correctamente y listo para ejecutar el servidor web.")
            return True
            
        except Exception as e:
            return self._print_error_and_exit_instructions(f"Error durante la inicialización: {e}")
    
    def _ensure_env_file(self):
        print("Verificando archivo de configuración (.env)...")
        
        if os.path.exists(self.env_file):
            print("Archivo .env encontrado.")
            
            load_dotenv()
            missing_vars = []
            for var in self.required_env_vars:
                if not os.getenv(var):
                    missing_vars.append(var)
            
            if missing_vars:
                print(f"Variables faltantes en .env: {', '.join(missing_vars)}")
                return self._configure_env_variables()
            
            return True
        else:
            print("Archivo .env no encontrado.")
            return self._create_env_from_example()
    
    def _create_env_from_example(self):
        if not os.path.exists(self.example_env_file):
            print(f"No se encontró el archivo {self.example_env_file}")
            print("   Por favor, crea manualmente el archivo .env con las variables de base de datos.")
            return False
        
        print(f"Copiando {self.example_env_file} a {self.env_file}...")
        try:
            shutil.copy2(self.example_env_file, self.env_file)
            print("Archivo .env creado desde example.env")
            
            return self._configure_env_variables()
            
        except Exception as e:
            print(f"Error copiando archivo: {e}")
            return False
    
    def _configure_env_variables(self):
        print("\nConfigurando variables de base de datos...")
        print("Presiona Enter para mantener el valor actual entre [corchetes]")
        
        env_content = {}
        if os.path.exists(self.env_file):
            with open(self.env_file, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if '=' in line and not line.startswith('#'):
                        key, value = line.split('=', 1)
                        key = key.strip()
                        value = value.strip().strip('"').strip("'")
                        env_content[key] = value
        
        config_map = {
            'PG_HOST': 'Host de PostgreSQL',
            'PG_PORT': 'Puerto de PostgreSQL',
            'PG_USER': 'Usuario de PostgreSQL',
            'PG_PASSWORD': 'Contraseña de PostgreSQL',
            'PG_DATABASE': 'Nombre de la base de datos'
        }
        
        for var, description in config_map.items():
            current_value = env_content.get(var, '')
            if var == 'PG_PASSWORD' and current_value in ['<your_password_here>', '']:
                current_value = ''
            
            if current_value:
                if var == 'PG_PASSWORD':
                    prompt = f"{description} [****]: "
                else:
                    prompt = f"{description} [{current_value}]: "
            else:
                prompt = f"{description}: "
            
            new_value = input(prompt).strip()
            
            if new_value:
                env_content[var] = new_value
            elif not current_value:
                print(f"Variable {description} es requerida.")
                return False
        
        try:
            with open(self.env_file, 'w', encoding='utf-8') as f:
                for var in self.required_env_vars:
                    f.write(f'{var} = "{env_content[var]}"\n')
            
            print("Configuración guardada en .env")
            
            load_dotenv()
            return True
            
        except Exception as e:
            print(f"Error guardando configuración: {e}")
            return False
    
    def _validate_and_setup_database(self):
        print("Verificando base de datos...")
        
        target_db = os.getenv('PG_DATABASE')
        
        if self._database_exists(target_db):
            print(f"Base de datos '{target_db}' ya existe")
            return True
        
        print(f"Creando base de datos '{target_db}'...")
        return self._create_database(target_db)
    
    def _database_exists(self, database_name):
        def check_existence():
            with self._get_postgres_connection() as cursor:
                cursor.execute(
                    "SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s",
                    (database_name,)
                )
                return cursor.fetchone() is not None
        
        return self._execute_db_operation("verificando existencia de BD", check_existence)
    
    def _create_database(self, database_name):
        def create_db():
            with self._get_postgres_connection() as cursor:
                cursor.execute(f'CREATE DATABASE "{database_name}"')
            print(f"Base de datos '{database_name}' creada exitosamente")
            return True
        
        return self._execute_db_operation("creando base de datos", create_db)
    
    def _validate_and_setup_schema(self):
        print("Verificando esquema de base de datos...")
        
        if self._schema_exists():
            print("Esquema de base de datos ya existe")
            return True
        
        print("Creando esquema de base de datos...")
        return self._create_schema()
    
    def _schema_exists(self):
        def check_schema():
            with self._get_postgres_connection(os.getenv('PG_DATABASE')) as cursor:
                tables_to_check = ['articulos', 'articulo_documentos', 'metadata_columnas']
                
                for table in tables_to_check:
                    cursor.execute("""
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_name = %s
                        )
                    """, (table,))
                    
                    if not cursor.fetchone()[0]:
                        return False
                return True
        
        return self._execute_db_operation("verificando esquema", check_schema)
    
    def _create_schema(self):
        def create_schema():
            if not os.path.exists(self.schema_file):
                print(f"No se encontró el archivo {self.schema_file}")
                return False
            
            with open(self.schema_file, 'r', encoding='utf-8') as file:
                schema_sql = file.read()
            
            with self._get_postgres_connection(os.getenv('PG_DATABASE')) as cursor:
                cursor.execute(schema_sql)
            
            print("Esquema creado exitosamente")
            return True
        
        return self._execute_db_operation("creando esquema", create_schema)
    
    def _validate_and_setup_data(self):
        print("Verificando datos en metadata_columnas...")
        
        if self._data_exists():
            print("Datos en metadata_columnas ya existen")
            return True
        
        print("Poblando datos en metadata_columnas...")
        return self._populate_data()
    
    def _data_exists(self):
        def check_data():
            with self._get_postgres_connection(os.getenv('PG_DATABASE')) as cursor:
                cursor.execute("SELECT COUNT(*) FROM metadata_columnas")
                count = cursor.fetchone()[0]
                return count > 0
        
        return self._execute_db_operation("verificando datos", check_data)
    
    def _populate_data(self):
        def populate():
            if not os.path.exists('columnas-analisis.md'):
                print("No se encontró el archivo columnas-analisis.md")
                return False
            
            markdown_file = "columnas-analisis.md"
            headers, rows = columns2db.parse_markdown_table(markdown_file)
            
            if headers is None or rows is None:
                print("No se pudo procesar el archivo markdown")
                return False
            
            with self._get_postgres_connection(os.getenv('PG_DATABASE')) as cursor:
                columns2db.reset_table(cursor)
                columns2db.insert_column_data(cursor, rows)
            
            print("Datos poblados exitosamente")
            return True
        
        return self._execute_db_operation("poblando datos", populate)
    

def is_ready_to_run():
    initializer = ProjectInitializer()
    return initializer.initialize()


def run_app():
    if is_ready_to_run():
        print("\nIniciando servidor web...")
        from app import create_app
        app = create_app()
        app.run(host='0.0.0.0', port=4350, debug=True)
    else:
        print("\nEl proyecto necesita configuración antes de ejecutar el servidor.")
        sys.exit(1)


if __name__ == "__main__":
    run_app()