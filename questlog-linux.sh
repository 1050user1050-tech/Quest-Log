#!/bin/bash
# QuestLog Production Launcher for Linux

# Check if node exists
if ! command -v node &> /dev/null
then
    echo "Node.js is not installed. Please install it: sudo apt install nodejs npm"
    read -p "Press enter to exit..."
    exit 1
fi

# Navigate to project directory
cd "$(dirname "$0")"

# Install dependencies if missing
if [ ! -d "node_modules" ]; then
    echo "First time setup: Installing dependencies..."
    npm install
fi

# Build the application if dist is missing
if [ ! -d "dist" ]; then
    echo "Building QuestLog for production..."
    npm run build
fi

# Run using the start script
echo "Launching QuestLog..."
npm start &
SERVER_PID=$!

sleep 3
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v google-chrome &> /dev/null; then
    google-chrome http://localhost:3000
elif command -v firefox &> /dev/null; then
    firefox http://localhost:3000
fi

# Keep script alive to manage process
echo "------------------------------------------------"
echo "QuestLog is running at http://localhost:3000"
echo "Close this terminal or press Ctrl+C to stop."
echo "------------------------------------------------"
wait $SERVER_PID
