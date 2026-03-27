# Complete Roblox Donation System - Setup Guide

## 📦 What You Have

### Server-Side (Node.js API)
- ✅ Custom image generation with player avatars
- ✅ Automatic Roblox profile fetching
- ✅ Discord webhook integration
- ✅ Username display under avatars

### Roblox Scripts
- ✅ **ServerDonationScript.lua** - Server-side donation handler
- ✅ **ClientDonationGUI.lua** - Player-facing GUI

## 🚀 Installation Steps

### Part 1: API Server Setup

#### 1. Get Your Server Online
You need to make your API publicly accessible. Options:

**Option A: Quick Testing with ngrok**
```bash
# Install ngrok from https://ngrok.com/download
# Then run:
ngrok http 3000
```
Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

**Option B: Deploy to Railway (Free)**
1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project from GitHub repo
4. Add environment variable: `DISCORD_WEBHOOK_URL` = your webhook
5. Deploy!

**Option C: Deploy to Heroku**
1. Create account at https://heroku.com
2. Install Heroku CLI
3. Run:
```bash
cd donation-logger
heroku create your-app-name
git init
git add .
git commit -m "Initial commit"
git push heroku main
heroku config:set DISCORD_WEBHOOK_URL="your-webhook-url"
```

### Part 2: Roblox Setup

#### 1. Enable HTTP Requests
1. Open Roblox Studio
2. Go to **Home** → **Game Settings** (or Alt+S)
3. Navigate to **Security** tab
4. Enable **Allow HTTP Requests**
5. Click **Save**

#### 2. Add Server Script
1. In **ServerScriptService**, create a new **Script**
2. Name it `DonationSystem`
3. Copy the contents of `ServerDonationScript.lua` into it
4. **Update line 12**: Replace `API_URL` with your public server URL
   ```lua
   local API_URL = "https://your-server-url.com/api/donation"
   ```

#### 3. Add Client GUI Script
1. In **StarterPlayer** → **StarterPlayerScripts**, create a **LocalScript**
2. Name it `DonationGUI`
3. Copy the contents of `ClientDonationGUI.lua` into it

That's it! 🎉

## 🎮 How to Use In-Game

### For Players:
1. Press **G** to open the donation menu
2. Select a recipient from the player list
3. Enter an amount (Robux)
4. Add an optional message
5. Click **DONATE**

### What Gets Logged to Discord:
- ✅ Custom image with both player avatars
- ✅ Real Roblox usernames (auto-fetched)
- ✅ Donation amount (formatted: 100,000)
- ✅ Optional message from donor
- ✅ Timestamp

## 🎨 The Generated Image Includes:

1. **Donor Avatar** (left) - Circular with pink border
2. **Recipient Avatar** (right) - Circular with pink border
3. **Usernames** - @Username displayed under each avatar
4. **Amount** - Large, formatted number (e.g., "250,000")
5. **Robux Icon** (◈)
6. **"donated to" text**
7. **Optional Message** - Displayed at bottom

## 🔧 Customization

### Change GUI Hotkey
In `ClientDonationGUI.lua`, line ~267:
```lua
if input.KeyCode == Enum.KeyCode.G then  -- Change G to any key
```

### Change Colors
In `ClientDonationGUI.lua`, search for `Color3.fromRGB` and modify:
- Background: `Color3.fromRGB(25, 25, 35)`
- Primary (pink): `Color3.fromRGB(255, 0, 255)`

### Add Reward Logic
In `ServerDonationScript.lua`, around line 67:
```lua
-- YOUR GAME LOGIC HERE
-- Example:
local recipientLeaderstats = recipientPlayer:FindFirstChild("leaderstats")
if recipientLeaderstats then
    local coins = recipientLeaderstats:FindFirstChild("Coins")
    if coins then
        coins.Value = coins.Value + (amount * 10)  -- 1 Robux = 10 coins
    end
end
```

## 📊 Example Data Flow

1. **Player A** opens GUI (presses G)
2. Selects **Player B** as recipient
3. Enters amount: `50000`
4. Adds message: `"Great game!"`
5. Clicks **DONATE**
6. GUI sends to server via RemoteEvent
7. Server validates and processes
8. Server calls your API
9. API fetches both player profiles from Roblox
10. API generates custom image
11. API sends to Discord webhook
12. Discord shows donation notification! 🎉

## 🧪 Testing

### Test the API Server:
```bash
curl -X POST http://localhost:3000/api/donation \
  -H "Content-Type: application/json" \
  -d '{
    "playerName": "TestPlayer",
    "userId": 1,
    "recipientName": "builderman",
    "recipientUserId": 156,
    "amount": 100000,
    "message": "Test donation!"
  }'
```

### Test in Roblox:
1. Enable debug mode in `ServerDonationScript.lua` (line 15):
   ```lua
   local ENABLE_DEBUG = true
   ```
2. Check the Output window for logs
3. Join with 2+ players to test the GUI

## 🔒 Security Tips

- ✅ Validate all donations server-side (already done)
- ✅ Prevent self-donations (already done)
- ✅ Cap message length (already done)
- ✅ Keep Discord webhook URL private
- 🔐 Consider adding rate limiting
- 🔐 Add cooldowns between donations if needed

## ⚡ Performance

- Image generation: ~1-2 seconds
- Roblox profile fetch: ~0.5 seconds
- Discord webhook: ~0.5 seconds
- **Total**: ~2-3 seconds per donation

## 🐛 Troubleshooting

**"HTTP requests are not enabled"**
- Enable in Game Settings → Security → Allow HTTP Requests

**"Failed to log donation"**
- Check API_URL is correct and publicly accessible
- Check server is running
- Look at Roblox Output window for errors

**"No recipient selected"**
- Make sure there are other players in the server
- Click on a player name to select them

**Avatars not loading**
- Roblox API might be slow, placeholders will show
- Check userId is valid

**Discord not receiving messages**
- Verify DISCORD_WEBHOOK_URL is set correctly
- Test webhook URL with curl
- Check webhook hasn't been deleted

## 📞 Support

Check the main `README.md` for more details on the API server!

## 🎯 Next Steps

1. ✅ Deploy your server to a hosting platform
2. ✅ Update API_URL in ServerDonationScript.lua
3. ✅ Test with friends in-game
4. 🎨 Customize the GUI design
5. 💰 Add reward logic for donations
6. 🎉 Launch your donation system!

---

**Your donation system is ready to go!** 🚀
