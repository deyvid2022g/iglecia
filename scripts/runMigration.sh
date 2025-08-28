#!/bin/bash

echo "==================================================="
echo "Proceso de Migración a Supabase"
echo "==================================================="
echo 

# Verificar si existe la carpeta data
if [ ! -d "../data" ]; then
    echo "Creando carpeta data..."
    mkdir -p ../data
    echo "Carpeta data creada."
else
    echo "Carpeta data ya existe."
fi

echo 
echo "==================================================="
echo "PASO 1: Verificar estructura de Supabase"
echo "==================================================="
echo 

node checkSupabaseSchema.js

echo 
echo "==================================================="
echo "PASO 2: Exportar datos de localStorage"
echo "==================================================="
echo 

echo "Para exportar los datos de localStorage, sigue estos pasos:"
echo "1. Abre la aplicación en el navegador"
echo "2. Abre la consola del desarrollador (F12)"
echo "3. Copia y pega el contenido del archivo exportLocalStorageData.js"
echo "4. Mueve los archivos JSON descargados a la carpeta 'data'"
echo 
read -p "Presiona Enter cuando hayas completado este paso..."

echo 
echo "==================================================="
echo "PASO 3: Ejecutar migración"
echo "==================================================="
echo 

node migrateToSupabaseImproved.js --migrate

echo 
echo "==================================================="
echo "Proceso de migración completado"
echo "==================================================="
echo 
echo "Para más información, consulta el archivo README_MIGRACION.md"
echo 

read -p "Presiona Enter para salir..."