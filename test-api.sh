#!/bin/bash

# Quick test script for your donation API

if [ -z "$1" ]; then
    URL="http://localhost:3000/api/donation"
else
    URL="$1/api/donation"
fi

echo "🧪 Testing Donation API at: $URL"
echo ""

# Test 1: Basic donation
echo "Test 1: Basic donation with message..."
curl -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{
    "playerName": "TestPlayer",
    "userId": 123456789,
    "recipientName": "RecipientPlayer",
    "recipientUserId": 987654321,
    "amount": 50000,
    "message": "Test donation - API is working! 🎮"
  }'
echo -e "\n"

sleep 2

# Test 2: Donation without message
echo "Test 2: Donation without message..."
curl -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{
    "playerName": "AnotherPlayer",
    "userId": 555555555,
    "recipientName": "GameOwner",
    "recipientUserId": 999999999,
    "amount": 100000
  }'
echo -e "\n"

sleep 2

# Test 3: Health check
if [ -z "$1" ]; then
    HEALTH_URL="http://localhost:3000/health"
else
    HEALTH_URL="$1/health"
fi

echo "Test 3: Health check..."
curl -X GET "$HEALTH_URL"
echo -e "\n"

echo ""
echo "✅ Tests complete! Check your Discord channel for donations."
echo ""
echo "Usage: ./test-api.sh [API_URL]"
echo "Example: ./test-api.sh https://your-app.railway.app"
