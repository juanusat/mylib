#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para probar la corrección del manejo de UTF-8 BOM en archivos CSV
"""

import csv
import io
import os

def test_bom_handling():
    """Prueba el manejo de archivos CSV con y sin BOM"""
    
    # Contenido CSV de prueba
    csv_content = '''Authors,Title,DOI,Year
"Test Author","Test Title","10.1000/test",2025
"Another Author","Another Title","10.1000/another",2024'''
    
    print("=== Prueba de manejo de BOM en archivos CSV ===\n")
    
    # Prueba 1: CSV sin BOM (UTF-8 normal)
    print("1. Probando CSV con UTF-8 normal (sin BOM):")
    content_utf8 = csv_content.encode('utf-8')
    
    try:
        decoded_content = content_utf8.decode('utf-8-sig')
        stream = io.StringIO(decoded_content, newline=None)
        reader = csv.DictReader(stream)
        rows = list(reader)
        print(f"   ✓ Archivo leído correctamente")
        print(f"   ✓ Headers: {reader.fieldnames}")
        print(f"   ✓ Número de filas: {len(rows)}")
        print(f"   ✓ Primer DOI: {rows[0]['DOI']}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    print()
    
    # Prueba 2: CSV con BOM (UTF-8 with BOM)
    print("2. Probando CSV con UTF-8 BOM:")
    content_utf8_bom = csv_content.encode('utf-8-sig')  # Esto agrega el BOM
    
    try:
        decoded_content = content_utf8_bom.decode('utf-8-sig')
        stream = io.StringIO(decoded_content, newline=None)
        reader = csv.DictReader(stream)
        rows = list(reader)
        print(f"   ✓ Archivo leído correctamente")
        print(f"   ✓ Headers: {reader.fieldnames}")
        print(f"   ✓ Número de filas: {len(rows)}")
        print(f"   ✓ Primer DOI: {rows[0]['DOI']}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    print()
    
    # Prueba 3: Comparación del comportamiento anterior vs nuevo
    print("3. Comparando comportamiento anterior vs nuevo:")
    
    # Comportamiento anterior (problemático con BOM)
    print("   Método anterior:")
    try:
        old_decoded = content_utf8_bom.decode('UTF8')  # Método anterior
        old_stream = io.StringIO(old_decoded, newline=None)
        old_reader = csv.DictReader(old_stream)
        old_headers = old_reader.fieldnames
        print(f"   - Headers con método anterior: {old_headers}")
        if old_headers and old_headers[0].startswith('\ufeff'):
            print(f"   ⚠ PROBLEMA: El primer header contiene BOM: '{old_headers[0]}'")
        else:
            print(f"   ✓ Sin problemas detectados")
    except Exception as e:
        print(f"   ✗ Error con método anterior: {e}")
    
    # Comportamiento nuevo (corregido)
    print("   Método nuevo:")
    try:
        new_decoded = content_utf8_bom.decode('utf-8-sig')  # Método nuevo
        new_stream = io.StringIO(new_decoded, newline=None)
        new_reader = csv.DictReader(new_stream)
        new_headers = new_reader.fieldnames
        print(f"   - Headers con método nuevo: {new_headers}")
        if new_headers and not new_headers[0].startswith('\ufeff'):
            print(f"   ✓ CORRECTO: Sin BOM en los headers")
        else:
            print(f"   ⚠ Aún hay problemas con BOM")
    except Exception as e:
        print(f"   ✗ Error con método nuevo: {e}")

if __name__ == "__main__":
    test_bom_handling()