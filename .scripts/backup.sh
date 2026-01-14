#!/bin/bash
# PostgreSQL backup script
# Runs daily via cron to backup the database

BACKUP_DIR="/opt/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"
RETENTION_DAYS=7

# Create backup directory
mkdir -p $BACKUP_DIR

# Run pg_dump inside the postgres container, compress output
docker exec postgres-db pg_dump -U app_user app_db | gzip > $BACKUP_FILE

# Check if backup was successful
if [ $? -eq 0 ] && [ -s $BACKUP_FILE ]; then
    echo "$(date): Backup successful: $BACKUP_FILE"
else
    echo "$(date): Backup FAILED!"
    exit 1
fi

# Delete backups older than retention period
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "$(date): Cleaned up backups older than $RETENTION_DAYS days"
