from initialize import is_ready_to_run
from app import create_app
import sys
import os

if __name__ == '__main__':
    # Solo mostrar mensajes detallados si no es un reinicio de Flask
    verbose = os.environ.get('WERKZEUG_RUN_MAIN') != 'true'
    
    if verbose:
        print("Verificando si el proyecto está listo...")
    
    if is_ready_to_run(verbose):
        if verbose:
            print("Iniciando servidor web...")
        app = create_app()
        app.run(host='0.0.0.0', port=4350, debug=True)
    else:
        print("\nEl proyecto necesita configuración.")
        print("Ejecuta 'python initialize.py' para configurar el proyecto.")
        sys.exit(1)