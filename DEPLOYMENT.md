# Deploy Your Donation API (Free Options)

Your API is currently running locally on port 3000. To make it accessible by Roblox, you need to deploy it to a public server with HTTPS. Here are your best **FREE** options:

---

## 🚀 Option 1: Railway.app (Recommended - Easiest)

**Why Railway?**
- ✅ Free tier with 500 hours/month
- ✅ Automatic HTTPS
- ✅ Easy GitHub deployment
- ✅ One-click setup

### Steps:

1. **Create a GitHub Repository**
   ```bash
   cd /home/ubuntu/.openclaw/workspace/donation-logger
   git init
   git add .
   git commit -m "Initial commit"
   ```
   
2. **Push to GitHub**
   - Create a new repository on github.com
   - Follow their instructions to push your code

3. **Deploy to Railway**
   - Go to https://railway.app
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your donation-logger repository
   - Add environment variable:
     - Key: `DISCORD_WEBHOOK_URL`
     - Value: `https://discord.com/api/webhooks/1486493175924261035/ixdzicHQ_zHsA1PTyRIx70zUjfkCkyaiGnY8lZFNm0ia4WSVE0UVtD_J1rKx5RyMfZBh`
   - Railway will auto-detect Node.js and deploy!
   - Copy your app URL (e.g., `https://your-app.up.railway.app`)

**Your API will be live at:** `https://your-app.up.railway.app/api/donation`

---

## 🔷 Option 2: Render.com (Also Great)

**Why Render?**
- ✅ Completely free tier
- ✅ Automatic HTTPS
- ✅ GitHub integration

### Steps:

1. **Push to GitHub** (same as Railway)

2. **Deploy to Render**
   - Go to https://render.com
   - Sign up with GitHub
   - Click "New" → "Web Service"
   - Connect your GitHub repo
   - Settings:
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`
   - Add environment variable:
     - Key: `DISCORD_WEBHOOK_URL`
     - Value: Your webhook URL
   - Click "Create Web Service"
   - Copy your URL (e.g., `https://your-app.onrender.com`)

**Your API will be live at:** `https://your-app.onrender.com/api/donation`

---

## 🟢 Option 3: Vercel (Serverless)

**Why Vercel?**
- ✅ Completely free
- ✅ Super fast deployment
- ✅ Automatic HTTPS

### Steps:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Create vercel.json**
   ```bash
   cd /home/ubuntu/.openclaw/workspace/donation-logger
   cat > vercel.json << 'EOF'
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/server.js"
       }
     ]
   }
   EOF
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```
   - Login with GitHub
   - Follow prompts
   - Add environment variable in Vercel dashboard
   - Copy your URL

---

## 📱 Option 4: ngrok (Quick Testing Only)

**For temporary testing** (requires sign up):

1. Sign up at https://dashboard.ngrok.com/signup (free)
2. Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken
3. Run:
   ```bash
   ngrok config add-authtoken YOUR_TOKEN_HERE
   ngrok http 3000
   ```
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

**⚠️ Warning:** ngrok URLs change every time you restart, so only use for testing!

---

## 🎯 Recommended Approach

**For your game, I recommend Railway or Render** because:
- ✅ Permanent URLs (don't change)
- ✅ Automatic restarts if server crashes
- ✅ Free forever (with reasonable limits)
- ✅ Professional and reliable
- ✅ HTTPS included (required by Roblox)

---

## 📝 After Deployment

Once you have your public URL:

1. **Update your Roblox script** (`ServerDonationScript.lua`):
   ```lua
   local API_URL = "https://your-app.railway.app/api/donation"
   ```

2. **Test it**:
   ```bash
   curl -X POST https://your-app.railway.app/api/donation \
     -H "Content-Type: application/json" \
     -d '{
       "playerName": "TestPlayer",
       "userId": 123456789,
       "recipientName": "RecipientPlayer",
       "recipientUserId": 987654321,
       "amount": 50000,
       "message": "Test from Roblox!"
     }'
   ```

3. **Check Discord** - you should see the donation!

4. **Use in Roblox** - Your game can now reach your API via HTTPS!

---

## 🔒 Security Notes

- Your Discord webhook URL is already in the `.env` file
- Make sure `.env` is in `.gitignore` (already done)
- When deploying, add the webhook URL as an environment variable in the platform's dashboard
- Never commit `.env` to GitHub!

---

## 💡 Need Help?

I can help you with any of these deployment options! Just let me know which one you'd like to use and I'll guide you through it step by step.

**My recommendation: Start with Railway.app - it's the easiest!**
