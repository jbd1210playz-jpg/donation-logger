# 🚀 Making Your API Fetchable by Roblox

Your donation API is ready! Here's how to make it accessible to your Roblox game.

## Current Status

✅ API Server running locally on port 3000
✅ Discord webhook configured
✅ Custom image generation working
✅ Roblox scripts ready

❌ **Not yet accessible by Roblox** (needs public HTTPS URL)

---

## 🎯 Next Steps - Choose Your Path:

### Path A: Railway (Recommended - 5 minutes)

**Easiest and most reliable for production use.**

1. **Create GitHub repo** (if you don't have one):
   - Go to https://github.com/new
   - Name it `donation-logger`
   - Don't initialize with README (we have files already)

2. **Push your code**:
   ```bash
   cd /home/ubuntu/.openclaw/workspace/donation-logger
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_URL
   git branch -M main
   git push -u origin main
   ```

3. **Deploy on Railway**:
   - Go to https://railway.app
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Choose `donation-logger`
   - Railway auto-detects everything!
   - Add environment variable:
     - Name: `DISCORD_WEBHOOK_URL`
     - Value: `https://discord.com/api/webhooks/1486493175924261035/ixdzicHQ_zHsA1PTyRIx70zUjfkCkyaiGnY8lZFNm0ia4WSVE0UVtD_J1rKx5RyMfZBh`
   - Click "Deploy"

4. **Get your URL**:
   - Railway gives you: `https://donation-logger-production-xxxx.up.railway.app`
   - Copy this URL!

5. **Update Roblox script**:
   ```lua
   local API_URL = "https://donation-logger-production-xxxx.up.railway.app/api/donation"
   ```

**Done! Your API is now live and accessible by Roblox! 🎉**

---

### Path B: Render.com (Alternative - Also Free)

1. Push to GitHub (same as Railway)

2. **Deploy on Render**:
   - Go to https://render.com
   - New → Web Service
   - Connect GitHub repo
   - Name: `donation-logger`
   - Environment: `Node`
   - Build: `npm install`
   - Start: `npm start`
   - Add environment variable (same as Railway)
   - Create Web Service

3. Get URL: `https://donation-logger.onrender.com`

4. Update Roblox script with new URL

---

### Path C: Vercel (Serverless Option)

```bash
cd /home/ubuntu/.openclaw/workspace/donation-logger
npm install -g vercel
vercel --prod
```

Follow prompts, add environment variable in dashboard.

---

## 🧪 Testing Your Deployed API

Once deployed, test it:

```bash
./test-api.sh https://your-app.railway.app
```

Or manually:

```bash
curl -X POST https://your-app.railway.app/api/donation \
  -H "Content-Type: application/json" \
  -d '{
    "playerName": "TestPlayer",
    "userId": 123456789,
    "recipientName": "RecipientPlayer",
    "recipientUserId": 987654321,
    "amount": 50000,
    "message": "Testing from production!"
  }'
```

Check Discord - you should see the donation! ✅

---

## 📝 Update Your Roblox Game

Once your API is live:

1. Open Roblox Studio
2. Go to ServerScriptService → DonationSystem
3. Update line 12:
   ```lua
   local API_URL = "https://YOUR-ACTUAL-URL.com/api/donation"
   ```
4. Save and publish your game
5. Test in-game!

---

## ⚡ Quick Commands

**Run deploy helper:**
```bash
cd /home/ubuntu/.openclaw/workspace/donation-logger
./deploy.sh
```

**Test API locally:**
```bash
./test-api.sh
```

**Test deployed API:**
```bash
./test-api.sh https://your-app.railway.app
```

---

## 🔍 Troubleshooting

**"HTTP 404" from Roblox:**
- Check your API URL is correct
- Make sure it ends with `/api/donation`
- Verify the API is actually running (visit `/health` endpoint)

**"SSL Certificate Error":**
- Make sure you're using HTTPS (not HTTP)
- Railway/Render provide HTTPS automatically

**"Connection Timeout":**
- Render free tier may sleep after inactivity (takes 30s to wake)
- Railway doesn't have this issue
- Consider adding a keep-alive service

**Discord webhook not working:**
- Check environment variable is set correctly in platform dashboard
- Don't include quotes around the webhook URL

---

## 💡 My Recommendation

**Use Railway.app** because:
- ✅ Easiest setup (5 minutes)
- ✅ No cold starts (unlike Render)
- ✅ Generous free tier (500 hours/month)
- ✅ Automatic HTTPS
- ✅ Great for game servers
- ✅ Simple dashboard

---

## 🎯 Final Checklist

Before going live:

- [ ] API deployed to Railway/Render/Vercel
- [ ] Environment variable (DISCORD_WEBHOOK_URL) set
- [ ] Tested API with curl or test-api.sh
- [ ] Checked Discord received test donation
- [ ] Updated Roblox script with production URL
- [ ] Enabled HTTP requests in Roblox Game Settings
- [ ] Tested donation in-game with 2+ players

---

## 📞 Need Help?

I can guide you through:
- Creating a GitHub account
- Setting up Railway/Render
- Troubleshooting deployment issues
- Testing your API
- Updating Roblox scripts

**Your donation system is 99% complete - just deploy it! 🚀**

---

## 📦 What You Have

- ✅ Complete Node.js API server
- ✅ Discord webhook integration
- ✅ Custom image generation with Roblox profiles
- ✅ Server-side Roblox script
- ✅ Client-side donation GUI
- ✅ Deployment configs for Railway/Render
- ✅ Test scripts
- ✅ Full documentation

**Everything is ready - just choose a hosting platform and deploy!**
