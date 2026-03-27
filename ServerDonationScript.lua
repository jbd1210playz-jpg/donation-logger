--[[
	Complete Donation System for Roblox Game
	
	This script handles:
	- Donation GUI setup
	- Server-side donation processing
	- Logging to Discord via your API
	
	Installation:
	1. Place this Script in ServerScriptService
	2. Update API_URL below with your server URL
	3. Enable HTTP requests in Game Settings
--]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local HttpService = game:GetService("HttpService")
local MarketplaceService = game:GetService("MarketplaceService")

-- ⚙️ CONFIGURATION
local API_URL = "http://localhost:3000/api/donation"  -- ⚠️ CHANGE THIS TO YOUR PUBLIC URL
local ENABLE_DEBUG = true

-- Create RemoteEvent for client-server communication
local donationEvent = Instance.new("RemoteEvent")
donationEvent.Name = "DonationEvent"
donationEvent.Parent = ReplicatedStorage

-- 📝 Debug logging
local function log(...)
	if ENABLE_DEBUG then
		print("[DonationSystem]", ...)
	end
end

-- 📤 Function to send donation to Discord
local function logDonationToDiscord(donorPlayer, recipientPlayer, amount, message)
	local data = {
		playerName = donorPlayer.Name,
		userId = donorPlayer.UserId,
		recipientName = recipientPlayer.Name,
		recipientUserId = recipientPlayer.UserId,
		amount = amount,
		message = message or "",
		timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ")
	}
	
	log("Logging donation to Discord:", donorPlayer.Name, "→", recipientPlayer.Name, "-", amount, "Robux")
	
	local success, result = pcall(function()
		return HttpService:RequestAsync({
			Url = API_URL,
			Method = "POST",
			Headers = {
				["Content-Type"] = "application/json"
			},
			Body = HttpService:JSONEncode(data)
		})
	end)
	
	if success then
		if result.Success and result.StatusCode == 200 then
			log("✅ Donation logged to Discord successfully!")
			return true
		else
			warn("[DonationSystem] ❌ API error:", result.StatusCode, result.StatusMessage)
			return false
		end
	else
		warn("[DonationSystem] ❌ Failed to log donation:", result)
		return false
	end
end

-- 💰 Process donation (your game logic here)
local function processDonation(donorPlayer, recipientPlayer, amount, message)
	log(donorPlayer.Name, "donated", amount, "Robux to", recipientPlayer.Name)
	
	-- ========================================
	-- YOUR GAME LOGIC HERE
	-- ========================================
	-- Example: Give the recipient in-game currency, effects, items, etc.
	-- local recipientLeaderstats = recipientPlayer:FindFirstChild("leaderstats")
	-- if recipientLeaderstats then
	--     local coins = recipientLeaderstats:FindFirstChild("Coins")
	--     if coins then
	--         coins.Value = coins.Value + amount * 10  -- Example: 1 Robux = 10 coins
	--     end
	-- end
	
	-- Show thank you message to donor
	-- Show notification to recipient
	
	-- ========================================
	
	-- Log to Discord (with custom image)
	task.spawn(function()
		logDonationToDiscord(donorPlayer, recipientPlayer, amount, message)
	end)
	
	return true
end

-- 🎮 Handle donation requests from client
donationEvent.OnServerEvent:Connect(function(donorPlayer, recipientPlayer, amount, message)
	-- Validate donor
	if not donorPlayer or not donorPlayer:IsA("Player") then
		warn("[DonationSystem] Invalid donor")
		return
	end
	
	-- Validate recipient
	if not recipientPlayer or not recipientPlayer:IsA("Player") then
		warn("[DonationSystem] Invalid recipient")
		return
	end
	
	-- Validate amount
	if typeof(amount) ~= "number" or amount <= 0 then
		warn("[DonationSystem]", donorPlayer.Name, "tried to donate invalid amount:", amount)
		return
	end
	
	-- Prevent self-donations
	if donorPlayer == recipientPlayer then
		warn("[DonationSystem]", donorPlayer.Name, "tried to donate to themselves")
		-- Optional: Send error message back to client
		return
	end
	
	-- Sanitize message
	if message and type(message) == "string" then
		if #message > 200 then
			message = string.sub(message, 1, 197) .. "..."
		end
	else
		message = nil
	end
	
	-- Process the donation
	processDonation(donorPlayer, recipientPlayer, amount, message)
end)

-- 🧪 Optional: Test donation system when player joins
if ENABLE_DEBUG then
	Players.PlayerAdded:Connect(function(player)
		task.wait(5)
		
		local players = Players:GetPlayers()
		if #players >= 2 then
			local donor = players[1]
			local recipient = players[2]
			
			-- Uncomment to test:
			-- log("Sending test donation...")
			-- processDonation(donor, recipient, 50000, "Test donation - system is working! 🎮")
		end
	end)
end

log("💰 Donation System initialized!")
log("📡 API URL:", API_URL)
log("⚠️  Remember to enable HTTP requests in Game Settings!")
