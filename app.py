from app import create_app
from app.config import Config

app = create_app()

if __name__ == '__main__':
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)
    app.run(host='0.0.0.0', port=4350, debug=True)