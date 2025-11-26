#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
TEST_EMAIL="test-$(date +%s)@example.com"

echo -e "${YELLOW}🧪 GoalNet Backend API Test Script${NC}\n"

# Test 1: Health Check
echo -e "${YELLOW}1. Testing health endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s "${BASE_URL}/health")
if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    echo -e "${GREEN}✓ Health check passed${NC}\n"
else
    echo -e "${RED}✗ Health check failed${NC}\n"
    exit 1
fi

# Test 2: Request OTP
echo -e "${YELLOW}2. Requesting OTP for ${TEST_EMAIL}...${NC}"
OTP_REQUEST=$(curl -s -X POST "${BASE_URL}/auth/request-otp" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"${TEST_EMAIL}\"}")

if echo "$OTP_REQUEST" | grep -q "success"; then
    echo -e "${GREEN}✓ OTP request successful${NC}"
    echo -e "${YELLOW}Check your server logs for the OTP code${NC}\n"
else
    echo -e "${RED}✗ OTP request failed${NC}\n"
    exit 1
fi

# Ask user for OTP
echo -e "${YELLOW}Enter the OTP from server logs: ${NC}"
read -r OTP_CODE

# Test 3: Verify OTP
echo -e "\n${YELLOW}3. Verifying OTP...${NC}"
VERIFY_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/verify-otp" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"${TEST_EMAIL}\", \"otp\": \"${OTP_CODE}\"}")

TOKEN=$(echo "$VERIFY_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓ OTP verified successfully${NC}"
    echo -e "${GREEN}✓ JWT Token received${NC}\n"
else
    echo -e "${RED}✗ OTP verification failed${NC}\n"
    echo "$VERIFY_RESPONSE"
    exit 1
fi

# Test 4: Get Profile
echo -e "${YELLOW}4. Getting user profile...${NC}"
PROFILE_RESPONSE=$(curl -s "${BASE_URL}/me" \
    -H "Authorization: Bearer ${TOKEN}")

if echo "$PROFILE_RESPONSE" | grep -q "email"; then
    echo -e "${GREEN}✓ Profile retrieved successfully${NC}\n"
else
    echo -e "${RED}✗ Profile retrieval failed${NC}\n"
    exit 1
fi

# Test 5: Update Profile
echo -e "${YELLOW}5. Updating user profile...${NC}"
UPDATE_RESPONSE=$(curl -s -X PUT "${BASE_URL}/me" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Test User",
        "role": "founder",
        "primaryGoal": "fundraising",
        "company": "Test Startup",
        "location": "Chennai, India"
    }')

if echo "$UPDATE_RESPONSE" | grep -q "Test User"; then
    echo -e "${GREEN}✓ Profile updated successfully${NC}\n"
else
    echo -e "${RED}✗ Profile update failed${NC}\n"
    exit 1
fi

echo -e "${GREEN}✅ All tests passed!${NC}\n"
echo -e "${YELLOW}Your GoalNet backend is working correctly! 🎉${NC}"
