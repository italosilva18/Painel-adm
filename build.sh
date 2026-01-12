#!/bin/bash
# Build script for MARGEM Admin Panel

set -e

echo "🚀 Building MARGEM Admin Panel..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

# Parse arguments
BUILD_TYPE=${1:-prod}
VERSION=${2:-latest}

echo -e "${YELLOW}📦 Build Type: $BUILD_TYPE${NC}"
echo -e "${YELLOW}🏷️  Version: $VERSION${NC}"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/

# Build based on type
if [ "$BUILD_TYPE" = "dev" ]; then
    echo -e "${GREEN}🔧 Building development container...${NC}"
    docker build -f Dockerfile.dev -t margem-admin:dev .
    echo -e "${GREEN}✅ Development build complete!${NC}"
    echo -e "${YELLOW}Run: docker-compose up margem-admin-dev${NC}"

elif [ "$BUILD_TYPE" = "prod" ]; then
    echo -e "${GREEN}🏗️  Building production container...${NC}"

    # Build production image
    docker build -t margem-admin:$VERSION .
    docker tag margem-admin:$VERSION margem-admin:latest

    echo -e "${GREEN}✅ Production build complete!${NC}"
    echo -e "${YELLOW}Run: docker-compose up margem-admin-prod -d${NC}"

elif [ "$BUILD_TYPE" = "local" ]; then
    echo -e "${GREEN}💻 Building locally...${NC}"

    # Install dependencies
    npm install

    # Build production bundle
    npm run build

    echo -e "${GREEN}✅ Local build complete!${NC}"
    echo -e "${YELLOW}Files in ./dist directory${NC}"

else
    echo -e "${RED}❌ Unknown build type: $BUILD_TYPE${NC}"
    echo "Usage: ./build.sh [dev|prod|local] [version]"
    exit 1
fi

# Show build info
echo ""
echo "📊 Build Information:"
echo "--------------------"
docker images | grep margem-admin || true
echo ""
echo -e "${GREEN}🎉 Build successful!${NC}"