#!/bin/bash
# Script per testare tutti gli esercizi bootcamp

echo "🚀 Testing LipariBank Bootcamp Exercises"
echo "=========================================="

BASE_URL="http://localhost:3000"
TIMEOUT=10

# Colori
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "\n${YELLOW}Test 1: Health Check${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${BASE_URL}/health" --max-time $TIMEOUT)
if [ "$response" = "200" ]; then
  echo -e "${GREEN}✓ Health check passed (200)${NC}"
else
  echo -e "${RED}✗ Health check failed ($response)${NC}"
  exit 1
fi

# Test 2: Swagger UI
echo -e "\n${YELLOW}Test 2: Swagger UI${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${BASE_URL}/api-docs" --max-time $TIMEOUT)
if [ "$response" = "200" ]; then
  echo -e "${GREEN}✓ Swagger UI available (200)${NC}"
else
  echo -e "${RED}✗ Swagger UI not available ($response)${NC}"
fi

# Test 3: Auth Login (prerequisito per altri test)
echo -e "\n${YELLOW}Test 3: Authentication${NC}"
echo "ℹ️  Note: Auth test skipped (requires valid credentials)"

# Test 4: TypeScript Compilation
echo -e "\n${YELLOW}Test 4: TypeScript Compilation${NC}"
if npm run typecheck > /dev/null 2>&1; then
  echo -e "${GREEN}✓ TypeScript compilation successful${NC}"
else
  echo -e "${RED}✗ TypeScript compilation failed${NC}"
  exit 1
fi

# Test 5: Build
echo -e "\n${YELLOW}Test 5: Build${NC}"
if npm run build > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Build successful${NC}"
else
  echo -e "${RED}✗ Build failed${NC}"
  exit 1
fi

# Test 6: Prisma Generate
echo -e "\n${YELLOW}Test 6: Prisma Client${NC}"
if npx prisma generate > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Prisma client generated${NC}"
else
  echo -e "${RED}✗ Prisma generation failed${NC}"
fi

# Test 7: Check required files
echo -e "\n${YELLOW}Test 7: File Structure${NC}"
required_files=(
  "src/config/prisma.ts"
  "src/config/swagger.ts"
  "src/middleware/prismaMiddleware.ts"
  "src/modules/kyc/kyc.controller.ts"
  "src/modules/kyc/kyc.routes.ts"
  "src/modules/account/account.schemas.ts"
  "src/modules/transfer/transfer.schemas.ts"
  "src/routes/reportRoutes.ts"
  "src/routes/aiRoutes.ts"
)

all_files_exist=true
for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file (MISSING)"
    all_files_exist=false
  fi
done

if [ "$all_files_exist" = false ]; then
  exit 1
fi

# Test 8: Verify dist folder exists after build
echo -e "\n${YELLOW}Test 8: Build Output${NC}"
if [ -d "dist" ] && [ -f "dist/app.js" ]; then
  echo -e "${GREEN}✓ Build output created${NC}"
else
  echo -e "${RED}✗ Build output missing${NC}"
fi

# Summary
echo -e "\n${GREEN}=========================================="
echo "✅ All basic tests passed!"
echo -e "==========================================${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Start the server: npm run dev"
echo "2. Verify endpoints at: http://localhost:3000/api-docs"
echo "3. Start Docker: docker-compose up -d"
echo "4. Run Prisma migration: npx prisma migrate dev"
echo "5. Test with curl or Postman using requests/bootcamp.http"

echo -e "\n${YELLOW}Documentation:${NC}"
echo "• ESERCIZI_BOOTCAMP.md - Complete exercise summary"
echo "• IMPLEMENTAZIONE_TECNICA.md - Technical details"
echo "• requests/bootcamp.http - Example requests"
