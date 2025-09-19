import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')

    DATABASE_CONFIG = {
        'host': os.getenv('PG_HOST'),
        'port': os.getenv('PG_PORT'),
        'database': os.getenv('PG_DATABASE'),
        'user': os.getenv('PG_USER'), 
        'password': os.getenv('PG_PASSWORD')
    }

    HOST = '0.0.0.0'
    PORT = 4350
    DEBUG = True