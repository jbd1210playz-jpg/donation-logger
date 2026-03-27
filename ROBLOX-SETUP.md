# Roblox Module Installation Guide

## 📦 What's Included

1. **DonationLogger.lua** - Main module (ModuleScript)
2. **ExampleImplementation.lua** - Server-side implementation example (Script)
3. **DonationGUI-Client.lua** - Client GUI example (LocalScript)

## 🎮 Installation Steps

### Step 1: Create the Module

1. Open Roblox Studio
2. In **ServerScriptService**, create a new **ModuleScript**
3. Rename it to `DonationLogger`
4. Copy the contents of `DonationLogger.lua` into it
5. **Important:** Update the API_URL in the module:
   ```lua
   DonationLogger.API_URL = "https://your-actual-server-url.com/api/donation"
   ```

### Step 2: Enable HTTP Requests

1. Go to **Home** → **Game Settings** (or press Alt+S)
2. Navigate to **Security** tab
3. Enable **Allow HTTP Requests**
4. Click **Save**

### Step 3: Implement in Your Game

#### Option A: Use the Example Implementation

1. In **ServerScriptService**, create a new **Script**
2. Name it something like `DonationHandler`
3. Copy the contents of `ExampleImplementation.lua` into it
4. Update the API URL in the script

#### Option B: Use Your Own Implementation

In any server script where you handle donations:

```lua
local DonationLogger = require(game.ServerScriptService.DonationLogger)

-- Configure the API URL (do this once, usually in your main script)
DonationLogger:SetAPIUrl("https://your-server-url.com/api/donation")

-- When a player donates:
local function onDonation(player, amount, message)
    -- Your donation logic here
    -- Give rewards, play effects, etc.
    
    -- Log to Discord
    local success, result = DonationLogger:LogDonation(player, amount, message)
    
    if not success then
        warn("Failed to log donation:", result)
    end
end
```

### Step 4: Create Donation GUI (Optional)

If you want a GUI for players to donate:

1. In **StarterGui**, create a **ScreenGui**
2. Design your donation interface with:
   - TextBox for amount input (name it `AmountInput`)
   - TextBox for message input (name it `MessageInput`)
   - TextButton for donate button (name it `DonateButton`)
3. Add a **LocalScript** to the GUI
4. Copy the contents of `DonationGUI-Client.lua` into it
5. Adjust the paths to match your GUI structure

## 🧪 Testing

### Test the Module:

```lua
-- In a server script:
local DonationLogger = require(game.ServerScriptService.DonationLogger)
local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)
    wait(2)
    DonationLogger:TestConnection(player)
end)
```

This will send a test donation to Discord when a player joins.

## 📋 Module Functions

### DonationLogger:LogDonation(player, amount, message)
Logs a single donation.
- **player** (Player) - The player who donated
- **amount** (number) - Donation amount in Robux
- **message** (string, optional) - Custom message from player
- **Returns:** success (boolean), message (string)

### DonationLogger:TestConnection(player)
Sends a test donation to verify the API is working.
- **player** (Player) - Any player object for testing
- **Returns:** success (boolean), message (string)

### DonationLogger:SetAPIUrl(url)
Updates the API URL.
- **url** (string) - The new API endpoint
- **Returns:** success (boolean)

### DonationLogger:LogMultipleDonations(donations)
Logs multiple donations at once (useful for batch processing).
- **donations** (array) - Array of {player, amount, message} tables
- **Returns:** results (array) - Array of result objects

## ⚙️ Configuration

In the DonationLogger module, you can adjust:

```lua
-- API endpoint
DonationLogger.API_URL = "https://your-url.com/api/donation"

-- Enable/disable debug messages
DonationLogger.DebugMode = true

-- Request timeout (seconds)
DonationLogger.Timeout = 10
```

## 🔧 Integration with Game Monetization

### Using Game Passes:

```lua
local MarketplaceService = game:GetService("MarketplaceService")
local DonationLogger = require(game.ServerScriptService.DonationLogger)

local DONATION_PASS_ID = 123456789  -- Your game pass ID

MarketplaceService.PromptGamePassPurchaseFinished:Connect(function(player, passId, wasPurchased)
    if wasPurchased and passId == DONATION_PASS_ID then
        local amount = 100  -- Game pass price
        DonationLogger:LogDonation(player, amount, "Game Pass donation")
    end
end)
```

### Using Developer Products:

```lua
local MarketplaceService = game:GetService("MarketplaceService")
local DonationLogger = require(game.ServerScriptService.DonationLogger)

local productDatabase = {
    [123456] = {price = 10, name = "Small Donation"},
    [123457] = {price = 50, name = "Medium Donation"},
    [123458] = {price = 100, name = "Large Donation"}
}

local function processReceipt(receiptInfo)
    local productInfo = productDatabase[receiptInfo.ProductId]
    
    if productInfo then
        local player = Players:GetPlayerByUserId(receiptInfo.PlayerId)
        
        if player then
            DonationLogger:LogDonation(player, productInfo.price, productInfo.name)
        end
    end
    
    return Enum.ProductPurchaseDecision.PurchaseGranted
end

MarketplaceService.ProcessReceipt = processReceipt
```

## 🐛 Troubleshooting

**"HTTP requests are not enabled"**
- Enable HTTP requests in Game Settings → Security

**"Request failed" errors**
- Make sure your API URL is correct and publicly accessible
- Test your API endpoint outside of Roblox first
- Check that your server is running

**"Invalid player" or "Invalid amount" errors**
- Check that you're passing valid parameters
- Enable DebugMode in the module to see detailed logs

**Nothing happens**
- Check the Output window in Studio for error messages
- Make sure the module is in ServerScriptService
- Verify your API URL is set correctly

## 🎨 Customization Ideas

- Add cooldowns to prevent spam
- Create different donation tiers with rewards
- Add visual effects when someone donates
- Show top donors leaderboard
- Add donation goals and progress bars
- Custom Discord embed colors based on amount
- Special roles or perks for donors

## 🔒 Security Notes

- Never trust client input - always validate on the server
- Consider adding rate limiting
- The module automatically caps message length to prevent abuse
- Keep your Discord webhook URL private (it's only in your hosted server, not in Roblox)

## Need Help?

Check the main README.md for API documentation and server setup!
