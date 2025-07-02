#!/bin/bash
echo "🌐 Starting Web Tests..."
cd packages/web
npm run dev &
WEB_PID=$!
sleep 5
echo "Web app started at http://localhost:5173"
echo "Press Ctrl+C to stop"
wait $WEB_PID
