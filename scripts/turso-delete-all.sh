#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# 🗑️ ELIMINAR REGISTROS TURSO - CHRONOS INFINITY 2026
# ═══════════════════════════════════════════════════════════════════════════

echo "🗑️  Eliminando registros de Turso DB..."
echo ""

# URL y token de Turso
DATABASE_URL="libsql://chronos-infinity-2026-zoro488.aws-us-west-2.turso.io"
DATABASE_AUTH_TOKEN="eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3Njg0ODAwNjcsImlkIjoiZWYyMGY1NTItZDE2OC00MDA0LWI5NjYtMmZlZTUwYTA3NTRkIiwicmlkIjoiODQxZDgwOTctMGEwNC00MTI4LWJhNDUtYjA0OGIyYjQ2NTk2In0.oB9N5IL20VxnnRVlVKBW-e6BwYFQu1yPY0A9nRbTKYDhomUr7Ygrd_NIhD6_UyQVCe5SjwzWxTKnMgHxd_PmDA"

# SQL para eliminar registros (mantener estructura)
SQL_DELETE="
DELETE FROM salida_almacen;
DELETE FROM entrada_almacen;
DELETE FROM movimientos;
DELETE FROM ventas;
DELETE FROM ordenes_compra;
DELETE FROM almacen;
DELETE FROM clientes;
DELETE FROM distribuidores;
UPDATE bancos SET 
  capitalActual = 0,
  historicoIngresos = 0,
  historicoGastos = 0
WHERE 1=1;
"

# Ejecutar con curl (Turso HTTP API)
curl -X POST "https://chronos-infinity-2026-zoro488.aws-us-west-2.turso.io/v2/pipeline" \
  -H "Authorization: Bearer $DATABASE_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"requests\": [
      {\"type\": \"execute\", \"stmt\": {\"sql\": \"DELETE FROM salida_almacen\"}},
      {\"type\": \"execute\", \"stmt\": {\"sql\": \"DELETE FROM entrada_almacen\"}},
      {\"type\": \"execute\", \"stmt\": {\"sql\": \"DELETE FROM movimientos\"}},
      {\"type\": \"execute\", \"stmt\": {\"sql\": \"DELETE FROM ventas\"}},
      {\"type\": \"execute\", \"stmt\": {\"sql\": \"DELETE FROM ordenes_compra\"}},
      {\"type\": \"execute\", \"stmt\": {\"sql\": \"DELETE FROM almacen\"}},
      {\"type\": \"execute\", \"stmt\": {\"sql\": \"DELETE FROM clientes\"}},
      {\"type\": \"execute\", \"stmt\": {\"sql\": \"DELETE FROM distribuidores\"}},
      {\"type\": \"execute\", \"stmt\": {\"sql\": \"UPDATE bancos SET capital_actual=0, historico_ingresos=0, historico_gastos=0\"}}
    ]
  }"

echo ""
echo "✅ Registros eliminados de Turso"
echo ""
echo "🔄 Ahora ejecuta en servidor:"
echo "   npx tsx database/seed-bancos.ts"
echo ""
