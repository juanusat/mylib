from flask import Flask
from dotenv import load_dotenv

def create_app():
    load_dotenv()
    
    app = Flask(__name__, 
                static_folder='../static',
                template_folder='../templates')
    app.config['SECRET_KEY'] = 'your-secret-key-here'
    
    from app.routes import main_bp
    app.register_blueprint(main_bp)
    
    return app