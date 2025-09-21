from initialize import is_ready_to_run
from app import create_app
import sys

if __name__ == '__main__':
    print("Verificando si el proyecto está listo...")
    
    if is_ready_to_run():
        print("Iniciando servidor web...")
        app = create_app()
        app.run(host='0.0.0.0', port=4350, debug=True)
    else:
        print("\nEl proyecto necesita configuración.")
        print("Ejecuta 'python initialize.py' para configurar el proyecto.")
        sys.exit(1)