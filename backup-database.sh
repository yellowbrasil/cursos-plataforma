#!/bin/bash

# Script de Backup Automático - AI PRO ACADEMY
# Executa diariamente às 2:00 AM via cronjob
# Mantém 30 dias de backups com rotação automática

set -e

# Configuração
BACKUP_DIR="/backups/cursos_academy"
DB_NAME="cursos_academy"
DB_USER="cursos"
DB_HOST="localhost"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Criar diretório se não existir
mkdir -p "$BACKUP_DIR"

# Executar backup
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando backup do banco: $DB_NAME"

pg_dump \
  --host="$DB_HOST" \
  --username="$DB_USER" \
  --format=plain \
  --no-password \
  "$DB_NAME" > "$BACKUP_FILE"

# Validar backup
if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Backup concluído: $BACKUP_FILE"

  # Remover backups antigos (manter apenas 30 dias)
  find "$BACKUP_DIR" -name "backup_*.sql" -type f -mtime +$RETENTION_DAYS -delete
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🗑️ Limpeza de backups antigos concluída"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ ERRO: Backup falhou!"
  exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Processo de backup finalizado com sucesso"
