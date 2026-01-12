#!/bin/bash
# Deployment script for MARGEM Admin Panel

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🚀 MARGEM Admin Panel Deployment Script"
echo "======================================="

# Parse arguments
ENVIRONMENT=${1:-local}
VERSION=${2:-latest}

echo -e "${BLUE}📍 Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}🏷️  Version: $VERSION${NC}"

# Function to check service health
check_health() {
    local service=$1
    local port=$2
    local max_attempts=30
    local attempt=1

    echo -e "${YELLOW}🔍 Checking $service health...${NC}"

    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:$port/health &> /dev/null; then
            echo -e "${GREEN}✅ $service is healthy${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    echo -e "${RED}❌ $service failed to start${NC}"
    return 1
}

# Deploy based on environment
case $ENVIRONMENT in
    local)
        echo -e "${GREEN}🏠 Deploying locally with Docker Compose...${NC}"

        # Stop existing containers
        docker-compose down

        # Build and start containers
        docker-compose up -d margem-admin-prod margem-api-admin

        # Check health
        check_health "Admin Panel" 3000
        check_health "Admin API" 5001

        echo -e "${GREEN}✅ Local deployment complete!${NC}"
        echo -e "${YELLOW}Access panel at: http://localhost:3000${NC}"
        ;;

    dev)
        echo -e "${GREEN}🔧 Deploying development environment...${NC}"

        # Stop existing containers
        docker-compose down

        # Start development container
        docker-compose up -d margem-admin-dev

        echo -e "${GREEN}✅ Development deployment complete!${NC}"
        echo -e "${YELLOW}Access panel at: http://localhost:5173${NC}"
        echo -e "${YELLOW}Hot reload is enabled${NC}"
        ;;

    staging)
        echo -e "${GREEN}🎭 Deploying to staging...${NC}"

        # Build production image
        ./build.sh prod $VERSION

        # Tag for registry
        docker tag margem-admin:$VERSION registry.mpontom.com.br/margem-admin:$VERSION
        docker tag margem-admin:$VERSION registry.mpontom.com.br/margem-admin:staging

        # Push to registry
        docker push registry.mpontom.com.br/margem-admin:$VERSION
        docker push registry.mpontom.com.br/margem-admin:staging

        # Deploy to K3s staging
        kubectl set image deployment/margem-admin-staging \
            margem-admin=registry.mpontom.com.br/margem-admin:$VERSION \
            -n margem-staging

        # Wait for rollout
        kubectl rollout status deployment/margem-admin-staging -n margem-staging

        echo -e "${GREEN}✅ Staging deployment complete!${NC}"
        echo -e "${YELLOW}Access at: https://admin-staging.mpmsuite.com.br${NC}"
        ;;

    production)
        echo -e "${RED}⚠️  PRODUCTION DEPLOYMENT${NC}"
        echo -n "Are you sure? (yes/no): "
        read confirmation

        if [ "$confirmation" != "yes" ]; then
            echo "Deployment cancelled"
            exit 0
        fi

        echo -e "${GREEN}🚀 Deploying to production...${NC}"

        # Build production image
        ./build.sh prod $VERSION

        # Tag for registry
        docker tag margem-admin:$VERSION gisctech/margem-admin:$VERSION
        docker tag margem-admin:$VERSION gisctech/margem-admin:latest

        # Push to DockerHub
        echo "Logging into DockerHub..."
        docker login --username gisctech

        docker push gisctech/margem-admin:$VERSION
        docker push gisctech/margem-admin:latest

        # Deploy to K3s production
        kubectl set image deployment/margem-admin \
            margem-admin=gisctech/margem-admin:$VERSION \
            -n margem

        # Wait for rollout
        kubectl rollout status deployment/margem-admin -n margem

        echo -e "${GREEN}✅ Production deployment complete!${NC}"
        echo -e "${YELLOW}Access at: https://admin.mpmsuite.com.br${NC}"
        ;;

    *)
        echo -e "${RED}❌ Unknown environment: $ENVIRONMENT${NC}"
        echo "Usage: ./deploy.sh [local|dev|staging|production] [version]"
        exit 1
        ;;
esac

# Show deployment info
echo ""
echo "📊 Deployment Summary:"
echo "----------------------"
echo "Environment: $ENVIRONMENT"
echo "Version: $VERSION"
echo "Timestamp: $(date)"
echo ""

# Show running containers
echo "🐳 Running Containers:"
docker ps | grep margem || echo "No containers running"

echo ""
echo -e "${GREEN}🎉 Deployment successful!${NC}"