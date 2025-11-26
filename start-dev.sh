#!/bin/bash

echo "🚀 Starting GoalNet Backend..."
echo ""

# Check if MongoDB is running
echo "1️⃣  Checking MongoDB..."
if nc -z localhost 27017 2>/dev/null; then
    echo "   ✅ MongoDB is already running"
else
    echo "   ⚠️  MongoDB is not running"
    echo "   Starting MongoDB..."
    
    # Try to start MongoDB using brew services
    if command -v brew &> /dev/null; then
        brew services start mongodb-community 2>/dev/null || \
        brew services start mongodb/brew/mongodb-community 2>/dev/null || \
        echo "   ❌ Failed to start MongoDB. Please start it manually:"
        echo "      brew services start mongodb-community"
        echo "      OR run: mongod --config /opt/homebrew/etc/mongod.conf"
    else
        echo "   ❌ Homebrew not found. Please start MongoDB manually:"
        echo "      mongod"
    fi
    
    echo "   Waiting for MongoDB to start..."
    sleep 3
fi

echo ""
echo "2️⃣  Checking Email Configuration..."
if grep -q "YOUR_16_CHAR_APP_PASSWORD_HERE" .env; then
    echo "   ⚠️  Gmail App Password not set!"
    echo "   📧 Email will fallback to console logging (development mode)"
    echo ""
    echo "   To enable email:"
    echo "   1. Visit: https://myaccount.google.com/apppasswords"
    echo "   2. Generate an App Password"
    echo "   3. Update SMTP_PASSWORD in .env"
    echo ""
else
    echo "   ✅ Gmail configured"
fi

echo ""
echo "3️⃣  Starting Development Server..."
echo ""

# Start the development server
./node_modules/.bin/ts-node-dev --respawn --transpile-only src/server.ts
