import os
from flask import Blueprint, render_template, request, jsonify, send_file
from app.models import Article, ColumnMetadata
from app.services import CSVService, ExcelService, DocumentService

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    return render_template('index.html')

@main_bp.route('/api/articles', methods=['GET'])
def get_articles():
    try:
        articles = Article.get_all_with_documents()
        return jsonify(articles)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/articles/<int:article_id>', methods=['GET'])
def get_article(article_id):
    try:
        article = Article.get_by_id(article_id)
        if not article:
            return jsonify({'error': 'Article not found'}), 404
        
        return jsonify(Article.to_dict_with_documents(article))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/articles/<int:article_id>', methods=['PUT'])
def update_article(article_id):
    try:
        data = request.json
        Article.update(article_id, data)
        return jsonify({'message': 'Article updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/check-csv', methods=['POST'])
def check_csv():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        result = CSVService.validate_csv_file(file)
        return jsonify(result)
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/field-metadata', methods=['GET'])
def get_field_metadata():
    try:
        readonly_fields = ColumnMetadata.get_readonly_fields()
        metadata = ColumnMetadata.get_all_metadata()
        return jsonify({
            'readonly_fields': readonly_fields,
            'columns': metadata
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/column-metadata', methods=['GET'])
def get_column_metadata():
    try:
        metadata = ColumnMetadata.get_all_metadata()
        return jsonify({'metadata': metadata})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/import-csv', methods=['POST'])
def import_csv():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        force_import = request.form.get('force_import', 'false').lower() == 'true'
        
        result = CSVService.import_csv_file(file, force_import)
        return jsonify(result)
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/export-excel', methods=['GET'])
def export_excel():
    try:
        temp_file_path, filename = ExcelService.create_excel_export()
        
        return send_file(
            temp_file_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        
    except Exception as e:
        return jsonify({'error': f'Error al exportar Excel: {str(e)}'}), 500

@main_bp.route('/api/export-excel-bookmarks', methods=['GET'])
def export_excel_bookmarks():
    try:
        temp_file_path, filename = ExcelService.create_excel_export_bookmarks()
        
        return send_file(
            temp_file_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        
    except Exception as e:
        return jsonify({'error': f'Error al exportar Excel de marcadores: {str(e)}'}), 500

@main_bp.route('/api/articles/<int:article_id>/documents', methods=['POST'])
def upload_document(article_id):
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No se ha proporcionado ningún archivo'}), 400
        
        file = request.files['file']
        doc_type = request.form.get('doc_type', 'original')  # 'original' o 'translated'
        
        if doc_type not in ['original', 'translated']:
            return jsonify({'error': 'Tipo de documento inválido'}), 400
        
        result = DocumentService.upload_document(file, article_id, doc_type)
        return jsonify(result)
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Error al subir documento: {str(e)}'}), 500

@main_bp.route('/api/articles/<int:article_id>/documents/<doc_type>', methods=['DELETE'])
def delete_document(article_id, doc_type):
    try:
        if doc_type not in ['original', 'translated']:
            return jsonify({'error': 'Tipo de documento inválido'}), 400
        
        result = DocumentService.delete_document(article_id, doc_type)
        return jsonify(result)
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Error al eliminar documento: {str(e)}'}), 500

@main_bp.route('/api/documents/<filename>')
def view_document(filename):
    try:
        file_path = DocumentService.get_document_path(filename)
        if not os.path.exists(file_path):
            return jsonify({'error': 'Documento no encontrado'}), 404
        
        return send_file(
            file_path,
            mimetype='application/pdf',
            as_attachment=False
        )
        
    except Exception as e:
        return jsonify({'error': f'Error al mostrar documento: {str(e)}'}), 500