from app import create_app
from app.config import Config
from setup_validator import validate_environment
import sys

print("Iniciando validación del entorno...")
if not validate_environment():
    print("No se puede iniciar el servidor. Entorno no válido.")
    sys.exit(1)

print("Entorno validado. Creando aplicación...")
app = create_app()

if __name__ == '__main__':
    print("Iniciando servidor web...")
    app.run(host='0.0.0.0', port=4350, debug=True)