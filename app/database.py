import psycopg2
from app.config import Config

def get_db_connection():
    return psycopg2.connect(**Config.DATABASE_CONFIG)

class DatabaseManager:
    @staticmethod
    def execute_query(query, params=None, fetch_all=False, fetch_one=False):
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            cur.execute(query, params)
            
            if fetch_all:
                result = cur.fetchall()
            elif fetch_one:
                result = cur.fetchone()
            else:
                result = None
                
            conn.commit()
            return result
            
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cur.close()
            conn.close()
    
    @staticmethod
    def execute_many(query, params_list):
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            cur.executemany(query, params_list)
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cur.close()
            conn.close()