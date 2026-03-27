#!/bin/bash

echo "🚀 Donation Logger API - Quick Deploy Helper"
echo "============================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Donation Logger API"
    echo "✅ Git repository initialized!"
    echo ""
fi

echo "Choose your deployment platform:"
echo ""
echo "1. Railway.app (Recommended - Easiest)"
echo "2. Render.com (Also great)"
echo "3. Vercel (Serverless)"
echo "4. Show manual instructions"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚂 Railway Deployment Steps:"
        echo "1. Push your code to GitHub:"
        echo "   - Create a new repo at https://github.com/new"
        echo "   - Run these commands:"
        echo "     git remote add origin YOUR_GITHUB_REPO_URL"
        echo "     git push -u origin main"
        echo ""
        echo "2. Deploy on Railway:"
        echo "   - Go to https://railway.app"
        echo "   - Sign up with GitHub"
        echo "   - Click 'New Project' → 'Deploy from GitHub repo'"
        echo "   - Select your donation-logger repo"
        echo "   - Add environment variable:"
        echo "     DISCORD_WEBHOOK_URL = https://discord.com/api/webhooks/..."
        echo "   - Railway will deploy automatically!"
        echo ""
        echo "3. Copy your app URL from Railway dashboard"
        echo "4. Update your Roblox script with the URL"
        ;;
    2)
        echo ""
        echo "🎨 Render Deployment Steps:"
        echo "1. Push your code to GitHub (same as Railway)"
        echo ""
        echo "2. Deploy on Render:"
        echo "   - Go to https://render.com"
        echo "   - Sign up with GitHub"
        echo "   - Click 'New' → 'Web Service'"
        echo "   - Connect your GitHub repo"
        echo "   - Render will auto-detect settings from render.yaml!"
        echo "   - Add your DISCORD_WEBHOOK_URL in environment variables"
        echo ""
        echo "3. Copy your app URL from Render dashboard"
        echo "4. Update your Roblox script with the URL"
        ;;
    3)
        echo ""
        echo "⚡ Vercel Deployment:"
        echo "Installing Vercel CLI..."
        npm install -g vercel
        echo ""
        echo "Now run: vercel --prod"
        echo "Follow the prompts and add your DISCORD_WEBHOOK_URL"
        ;;
    4)
        echo ""
        echo "📖 Opening deployment guide..."
        cat DEPLOYMENT.md
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        ;;
esac

echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"
echo "💡 Need help? Check the README.md"
