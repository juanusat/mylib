import csv
import io
import tempfile
from datetime import datetime
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

from app.models import Article

class CSVService:
    
    @staticmethod
    def validate_csv_file(file):
        if not file.filename.endswith('.csv'):
            raise ValueError('Formato de archivo inválido')
        
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)
        
        dois_in_csv = []
        for row in csv_reader:
            doi = row.get('DOI', '').strip()
            if doi:
                dois_in_csv.append(doi)
        
        existing_articles = []
        new_articles = []
        
        if dois_in_csv:
            existing_results = Article.check_multiple_dois(dois_in_csv)
            existing_dois = {row[0]: row[1] for row in existing_results}
            
            for doi in dois_in_csv:
                if doi in existing_dois:
                    existing_articles.append({
                        'doi': doi,
                        'titulo': existing_dois[doi]
                    })
                else:
                    new_articles.append({'doi': doi})
        
        return {
            'total_in_csv': len(dois_in_csv),
            'existing_count': len(existing_articles),
            'new_count': len(new_articles),
            'existing_articles': existing_articles,
            'has_duplicates': len(existing_articles) > 0
        }
    
    @staticmethod
    def import_csv_file(file, force_import=False):
        if not file.filename.endswith('.csv'):
            raise ValueError('Formato de archivo inválido')
        
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)
        
        imported_count = 0
        skipped_count = 0
        
        for row in csv_reader:
            doi = row.get('DOI', '').strip()
            
            if not force_import and doi:
                if Article.check_doi_exists(doi):
                    skipped_count += 1
                    continue
            
            try:
                article_data = {
                    'autor': row.get('Authors', ''),
                    'nombre_revista': row.get('Source title', ''),
                    'anio': row.get('Year', ''),
                    'doi': doi,
                    'titulo_original': row.get('Title', ''),
                    'base_datos': 'Scopus',
                    'abstract': row.get('Abstract', ''),
                    'keywords_autor': row.get('Author Keywords', ''),
                    'keywords_indexed': row.get('Index Keywords', ''),
                    'enlace': row.get('Link', ''),
                    'eid': row.get('EID', '')
                }
                
                Article.create(article_data)
                imported_count += 1
                
            except Exception as e:
                print(f"Error importing row: {e}")
        
        message = f'{imported_count} artículos importados'
        if skipped_count > 0:
            message += f', {skipped_count} omitidos (ya existían)'
        
        return {'message': message}

class ExcelService:    
    @staticmethod
    def create_excel_export():
        articles = Article.get_all()

        wb = Workbook()
        ws = wb.active
        ws.title = "Análisis de Artículos"
        
        headers = [
            'ID', 'Autor', 'Nombre Revista', 'Quartil Revista', 'Año', 'DOI',
            'Título Original', 'Título Español', 'Base de Datos', 'Abstract', 'Resumen',
            'Keywords Autor', 'Keywords Indexados', 'Problema Artículo', 'Datos Estadísticos',
            'Pregunta Investigación', 'Objetivo Original', 'Objetivo Español', 
            'Objetivo Reescrito', 'Justificación', 'Hipótesis', 'Tipo Investigación',
            'Estudios Previos', 'Población/Muestra/Datos', 'Recolección Datos',
            'Resultados', 'Conclusiones', 'Discusión', 'Trabajos Futuros',
            'Enlace', 'EID', 'Seleccionado'
        ]
        
        header_font = Font(bold=True, color='FFFFFF')
        header_fill = PatternFill(start_color='366092', end_color='366092', fill_type='solid')
        header_alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
        
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col, value=header)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = header_alignment
        
        for row_idx, article in enumerate(articles, 2):
            for col_idx, value in enumerate(article, 1):
                cell = ws.cell(row=row_idx, column=col_idx, value=value)
                # Ajustar texto para campos largos
                if col_idx in [7, 8, 10, 11]:  # Títulos, abstract, resumen
                    cell.alignment = Alignment(wrap_text=True, vertical='top')
        
        column_widths = {
            1: 8,   # ID
            2: 25,  # Autor
            3: 20,  # Revista
            4: 10,  # Quartil
            5: 8,   # Año
            6: 15,  # DOI
            7: 30,  # Título Original
            8: 30,  # Título Español
            9: 12,  # Base de Datos
            10: 40, # Abstract
            11: 40, # Resumen
            12: 20, # Keywords Autor
            13: 20, # Keywords Indexados
            14: 25, # Problema
            15: 20, # Datos Estadísticos
            16: 25, # Pregunta Investigación
            17: 25, # Objetivo Original
            18: 25, # Objetivo Español
            19: 25, # Objetivo Reescrito
            20: 25, # Justificación
            21: 20, # Hipótesis
            22: 18, # Tipo Investigación
            23: 25, # Estudios Previos
            24: 25, # Población/Muestra
            25: 25, # Recolección Datos
            26: 30, # Resultados
            27: 30, # Conclusiones
            28: 30, # Discusión
            29: 25, # Trabajos Futuros
            30: 25, # Enlace
            31: 15, # EID
            32: 12  # Seleccionado
        }
        
        for col, width in column_widths.items():
            ws.column_dimensions[ws.cell(row=1, column=col).column_letter].width = width
        
        timestamp = datetime.now().strftime('%Y-%m-%d--%H-%M-%S')
        filename = f'matriz-analisis-{timestamp}.xlsx'
        
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx')
        wb.save(temp_file.name)
        temp_file.close()
        
        return temp_file.name, filename