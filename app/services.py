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
    # Configuración común para todas las exportaciones
    HEADERS = [
        'Autor', 'Nombre revista', 'Quartil revista', 'Fecha', 'DOI',
        'Título (original)', 'Título (español)', 'Base de datos', 'Abstract', 'Resumen',
        'Keywords autor', 'Keywords indexados', 'Problema a solucionar', 'Datos estadísticos',
        'Pregunta de investigación', 'Objetivo (original)', 'Objetivo (español)', 
        'Objetivo reescrito', 'Justificación', 'Hipótesis', 'Tipo investigación',
        'Estudios previos', 'Población/muestra/datos', 'Recolección datos',
        'Resultados', 'Conclusiones', 'Discusión', 'Trabajos futuros',
        'Enlace', 'EID', 'Seleccionado'
    ]
    
    COLUMN_WIDTHS = {
        1: 25,  # Autor
        2: 20,  # Revista
        3: 10,  # Quartil
        4: 8,   # Año
        5: 15,  # DOI
        6: 30,  # Título original
        7: 30,  # Título español
        8: 12,  # Base de datos
        9: 40,  # Abstract
        10: 40, # Resumen
        11: 20, # Keywords autor
        12: 20, # Keywords indexados
        13: 25, # Problema
        14: 20, # Datos estadísticos
        15: 25, # Pregunta investigación
        16: 25, # Objetivo original
        17: 25, # Objetivo español
        18: 25, # Objetivo reescrito
        19: 25, # Justificación
        20: 20, # Hipótesis
        21: 18, # Tipo investigación
        22: 25, # Estudios previos
        23: 25, # Población/muestra
        24: 25, # Recolección datos
        25: 30, # Resultados
        26: 30, # Conclusiones
        27: 30, # Discusión
        28: 25, # Trabajos futuros
        29: 25, # Enlace
        30: 15, # EID
        31: 12  # Seleccionado
    }
    
    # Columnas que requieren ajuste de texto (títulos, abstract, resumen)
    TEXT_WRAP_COLUMNS = [6, 7, 9, 10]
    
    @staticmethod
    def _get_local_timestamp():
        local_time = datetime.now()
        return local_time.strftime('%Y-%m-%d--%H-%M-%S')
    
    @staticmethod
    def _setup_header(ws, header_color='366092'):
        """Configura el encabezado del worksheet con estilo"""
        header_font = Font(bold=True, color='FFFFFF')
        header_fill = PatternFill(start_color=header_color, end_color=header_color, fill_type='solid')
        header_alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
        
        for col, header in enumerate(ExcelService.HEADERS, 1):
            cell = ws.cell(row=1, column=col, value=header)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = header_alignment
    
    @staticmethod
    def _populate_data(ws, articles):
        """Llena el worksheet con los datos de los artículos"""
        for row_idx, article in enumerate(articles, 2):
            for col_idx, value in enumerate(article, 1):
                cell = ws.cell(row=row_idx, column=col_idx, value=value)
                # Ajustar texto para campos largos
                if col_idx in ExcelService.TEXT_WRAP_COLUMNS:
                    cell.alignment = Alignment(wrap_text=True, vertical='top')
    
    @staticmethod
    def _set_column_widths(ws):
        """Configura los anchos de columna"""
        for col, width in ExcelService.COLUMN_WIDTHS.items():
            ws.column_dimensions[ws.cell(row=1, column=col).column_letter].width = width
    
    @staticmethod
    def _save_workbook(wb, base_filename):
        """Guarda el workbook y retorna el path y filename"""
        timestamp = ExcelService._get_local_timestamp()
        filename = f'{base_filename}-{timestamp}.xlsx'
        
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx')
        wb.save(temp_file.name)
        temp_file.close()
        
        return temp_file.name, filename
    
    @staticmethod
    def _create_empty_bookmarks_sheet(ws):
        """Crea una hoja para marcadores vacía con mensaje informativo"""
        ws.title = "Marcadores (Vacío)"
        ExcelService._setup_header(ws)
        
        # Agregar mensaje informativo
        ws.cell(row=2, column=1, value="No hay artículos marcados como favoritos")
        ws.merge_cells('A2:AE2')
        
        # Centrar y estilizar el mensaje
        message_cell = ws.cell(row=2, column=1)
        message_cell.alignment = Alignment(horizontal='center', vertical='center')
        message_cell.font = Font(italic=True, color='666666')
    
    @staticmethod
    def create_excel_export():
        """Crea exportación Excel con todos los artículos"""
        articles = Article.get_all_for_export()
        
        wb = Workbook()
        ws = wb.active
        ws.title = "Análisis de Artículos"
        
        ExcelService._setup_header(ws)
        ExcelService._populate_data(ws, articles)
        ExcelService._set_column_widths(ws)
        
        return ExcelService._save_workbook(wb, 'matriz-analisis')
    
    @staticmethod
    def create_excel_export_bookmarks():
        """Crea exportación Excel solo con artículos marcados como favoritos"""
        articles = Article.get_bookmarks_for_export()
        
        wb = Workbook()
        ws = wb.active
        
        if not articles:
            # Crear hoja vacía con mensaje informativo
            ExcelService._create_empty_bookmarks_sheet(ws)
        else:
            # Crear hoja con datos de marcadores
            ws.title = "Marcadores - Análisis"
            ExcelService._setup_header(ws, header_color='1F4E79')  # Azul más oscuro para marcadores
            ExcelService._populate_data(ws, articles)
        
        ExcelService._set_column_widths(ws)
        return ExcelService._save_workbook(wb, 'matriz-marcadores')