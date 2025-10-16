  GNU nano 7.2                                                                                                                update.sh                                                                                                                         

# Define project directory and compose file
PROJECT_DIR="/var/www/indianWedding"
COMPOSE_FILE="docker-compose.prod.yml"
LOG_FILE="$PROJECT_DIR/deploy.log"

# Timestamp for log entries
echo "========================================" | tee -a "$LOG_FILE"
echo "Deployment started at: $(date)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

# Navigate to project directory
cd "$PROJECT_DIR" || { echo "❌ Error: Directory not found."; exit 1; }

# Pull latest images
echo "📦 Pulling latest Docker images..." | tee -a "$LOG_FILE"
docker compose -f "$COMPOSE_FILE" pull 2>&1 | tee -a "$LOG_FILE"

# Recreate and start containers
echo "🚀 Restarting containers..." | tee -a "$LOG_FILE"
docker compose -f "$COMPOSE_FILE" up -d 2>&1 | tee -a "$LOG_FILE"

# Optional: clean up unused images
echo "🧹 Cleaning up old images in background..." | tee -a "$LOG_FILE"
docker image prune -f > /dev/null 2>&1 &

# Show status
echo "✅ Deployment complete. Running containers:" | tee -a "$LOG_FILE"
docker ps | tee -a "$LOG_FILE"

# Check Prisma migrations
echo "🔍 Checking Prisma migrations..." | tee -a "$LOG_FILE"
docker exec indianweddings-backend npx prisma migrate status 2>&1 | tee -a "$LOG_FILE"

echo "========================================" | tee -a "$LOG_FILE"
echo "Deployment finished at: $(date)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
















