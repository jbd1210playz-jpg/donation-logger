-- Roblox Donation Logger Client
-- Place this in ServerScriptService

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")

-- ⚙️ CONFIGURATION
local API_URL = "http://your-server-url.com/api/donation"  -- Replace with your actual API URL

-- 📤 Function to log donation to Discord
local function logDonation(player, amount, message)
    local data = {
        playerName = player.Name,
        userId = player.UserId,
        amount = amount,
        message = message or "",
        timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ")
    }
    
    local success, result = pcall(function()
        return HttpService:PostAsync(
            API_URL,
            HttpService:JSONEncode(data),
            Enum.HttpContentType.ApplicationJson,
            false  -- Don't compress
        )
    end)
    
    if success then
        print("✅ Donation logged to Discord:", player.Name, "-", amount, "Robux")
        return true
    else
        warn("❌ Failed to log donation to Discord:", result)
        return false
    end
end

-- 💰 Example: Simulate a donation (replace with your actual donation logic)
local function processDonation(player, amount, message)
    print(player.Name, "donated", amount, "Robux!")
    
    -- Your game logic here (give rewards, effects, etc.)
    -- ...
    
    -- Log to Discord
    logDonation(player, amount, message)
end

-- 🎮 Example usage with RemoteEvent (for GUI donation system)
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local donationEvent = Instance.new("RemoteEvent")
donationEvent.Name = "DonationEvent"
donationEvent.Parent = ReplicatedStorage

donationEvent.OnServerEvent:Connect(function(player, amount, message)
    -- Validate the donation
    if typeof(amount) ~= "number" or amount <= 0 then
        warn("Invalid donation amount from", player.Name)
        return
    end
    
    -- Cap message length
    if message and #message > 200 then
        message = string.sub(message, 1, 200) .. "..."
    end
    
    -- Process the donation
    processDonation(player, amount, message)
end)

-- 🧪 Test donation (remove in production)
game:GetService("RunService").Heartbeat:Wait()
wait(5)  -- Wait for game to load

-- Simulate a test donation from first player who joins
Players.PlayerAdded:Connect(function(player)
    wait(3)  -- Wait a bit after player joins
    processDonation(player, 100, "Test donation from " .. player.Name)
end)

print("💰 Donation Logger initialized!")
print("📡 API URL:", API_URL)
print("⚠️  Remember to enable HTTP requests in Game Settings!")
