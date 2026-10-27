#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost"
API_URL="$BASE_URL/api"

# Test counter
PASS=0
FAIL=0

# Function to run tests with colored output
test_endpoint() {
  local method=$1
  local endpoint=$2
  local expected_status=$3
  local body=$4
  local description=$5
  
  echo -e "${YELLOW}Testing: ${description}${NC}"
  echo "  $method $endpoint"
  
  if [ -n "$body" ]; then
    response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$body")
  else
    response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body_response=$(echo "$response" | sed '$d')
  
  if [ "$http_code" = "$expected_status" ]; then
    echo -e "  ${GREEN}✓ Status $http_code (expected $expected_status)${NC}"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗ Status $http_code (expected $expected_status)${NC}"
    echo "  Response: $body_response"
    FAIL=$((FAIL + 1))
  fi
  
  echo ""
}

echo -e "${YELLOW}🧪 LipariBank Smoke Test Suite${NC}\n"

# ========== Step 1: Register ==========
echo -e "${YELLOW}1️⃣  Auth Flow${NC}"
test_endpoint "POST" "/auth/register" "201" \
  '{"email":"test@liparibank.it","password":"TestPassword123"}' \
  "Register new user"

# ========== Step 2: Login ==========
test_endpoint "POST" "/auth/login" "200" \
  '{"email":"test@liparibank.it","password":"TestPassword123"}' \
  "Login user"

# ========== Step 3: Create Customer ==========
echo -e "${YELLOW}2️⃣  Customer & Account Setup${NC}"
test_endpoint "POST" "/customers" "201" \
  '{
    "firstName":"Marco",
    "lastName":"Rossi",
    "email":"test@liparibank.it",
    "phoneNumber":"+39 320 123 4567",
    "birthDate":"1985-05-15",
    "nationality":"IT",
    "taxId":"RSSMRC85E15H501Z"
  }' \
  "Create customer"

# Store customer ID from response (in real test, parse JSON)
CUSTOMER_ID="test-customer-id"

# ========== Step 4: Create Account 1 ==========
test_endpoint "POST" "/accounts" "201" \
  '{
    "accountType":"CORRENTE",
    "currency":"EUR",
    "initialBalance":10000
  }' \
  "Create first account"

# ========== Step 5: Create Account 2 ==========
test_endpoint "POST" "/accounts" "201" \
  '{
    "accountType":"CORRENTE",
    "currency":"EUR",
    "initialBalance":5000
  }' \
  "Create second account (for transfer)"

# ========== Step 6: Create Transfer ==========
echo -e "${YELLOW}3️⃣  Transfers${NC}"
test_endpoint "POST" "/transfers" "201" \
  '{
    "fromAccountId":"account-1",
    "toAccountId":"account-2",
    "amount":500,
    "description":"Bonifico test"
  }' \
  "Create transfer"

# ========== Step 7: List Transfers ==========
test_endpoint "GET" "/transfers?limit=20" "200" "" \
  "List transfers with pagination"

# ========== Step 8: KYC Upload ==========
echo -e "${YELLOW}4️⃣  KYC Documents${NC}"
echo -e "${YELLOW}Testing: KYC document upload${NC}"
echo "  POST /customers/:id/kyc"
# Note: In real scenario, would upload actual file
echo -e "  ${YELLOW}⊙ Skipped (requires file upload)${NC}\n"

# ========== Step 9: AI Stream ==========
echo -e "${YELLOW}5️⃣  AI Streaming${NC}"
echo -e "${YELLOW}Testing: SSE streaming endpoint${NC}"
echo "  GET /ai/stream?q=ciao"
echo -e "  ${YELLOW}⊙ Skipped (requires curl -N for streaming)${NC}"
echo ""

# ========== Step 10: Reports (ADMIN) ==========
echo -e "${YELLOW}6️⃣  Reports${NC}"
test_endpoint "GET" "/reports/balance-by-customer" "200" "" \
  "Get balance report (admin)"

# ========== Step 11: Health Check ==========
echo -e "${YELLOW}7️⃣  Health & Readiness${NC}"
test_endpoint "GET" "/health" "200" "" \
  "Health check (liveness)"

test_endpoint "GET" "/ready" "200" "" \
  "Readiness check (database)"

# ========== Step 12: Logout ==========
echo -e "${YELLOW}8️⃣  Logout${NC}"
test_endpoint "POST" "/auth/logout" "204" "" \
  "User logout"

# ========== Results ==========
echo -e "\n${YELLOW}📊 Test Results:${NC}"
echo -e "  ${GREEN}✓ Passed: $PASS${NC}"
echo -e "  ${RED}✗ Failed: $FAIL${NC}"

if [ $FAIL -eq 0 ]; then
  echo -e "\n${GREEN}✅ All smoke tests passed!${NC}\n"
  exit 0
else
  echo -e "\n${RED}❌ Some tests failed${NC}\n"
  exit 1
fi
