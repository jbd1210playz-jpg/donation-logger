--[[
	Donation Logger Module - Updated for Image Generation
	
	Now includes recipient information for custom donation images!
	
	Usage:
		local DonationLogger = require(game.ServerScriptService.DonationLogger)
		DonationLogger:LogDonation(donorPlayer, recipientPlayer, amount, optionalMessage)
--]]

local HttpService = game:GetService("HttpService")

local DonationLogger = {}

-- ⚙️ CONFIGURATION
DonationLogger.API_URL = "http://localhost:3000/api/donation"  -- ⚠️ CHANGE THIS!
DonationLogger.DebugMode = true
DonationLogger.Timeout = 10

-- 📝 Internal logging function
local function log(...)
	if DonationLogger.DebugMode then
		print("[DonationLogger]", ...)
	end
end

local function warn_log(...)
	warn("[DonationLogger]", ...)
end

-- 📤 Main function to log a donation
function DonationLogger:LogDonation(donorPlayer, recipientPlayer, amount, message)
	-- Validate donor
	if not donorPlayer or not donorPlayer:IsA("Player") then
		warn_log("Invalid donor player object provided")
		return false, "Invalid donor"
	end
	
	-- Validate recipient (can be nil for generic donations)
	local recipientName = nil
	local recipientUserId = nil
	
	if recipientPlayer and recipientPlayer:IsA("Player") then
		recipientName = recipientPlayer.Name
		recipientUserId = recipientPlayer.UserId
	end
	
	-- Validate amount
	if type(amount) ~= "number" or amount <= 0 then
		warn_log("Invalid donation amount:", amount)
		return false, "Invalid amount"
	end
	
	-- Sanitize message
	if message then
		if type(message) ~= "string" then
			message = tostring(message)
		end
		if #message > 200 then
			message = string.sub(message, 1, 197) .. "..."
		end
	end
	
	-- Build request data
	local data = {
		playerName = donorPlayer.Name,
		userId = donorPlayer.UserId,
		recipientName = recipientName,
		recipientUserId = recipientUserId,
		amount = amount,
		message = message or "",
		timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ")
	}
	
	log("Logging donation:", donorPlayer.Name, "→", recipientName or "Game", "-", amount, "Robux")
	
	-- Send HTTP request
	local success, result = pcall(function()
		local response = HttpService:RequestAsync({
			Url = self.API_URL,
			Method = "POST",
			Headers = {
				["Content-Type"] = "application/json"
			},
			Body = HttpService:JSONEncode(data)
		})
		
		return response
	end)
	
	if success then
		if result.Success and result.StatusCode == 200 then
			log("✅ Donation logged successfully!")
			return true, "Success"
		else
			warn_log("❌ API returned error:", result.StatusCode, result.StatusMessage)
			return false, "API error: " .. tostring(result.StatusCode)
		end
	else
		warn_log("❌ HTTP request failed:", result)
		return false, "Request failed: " .. tostring(result)
	end
end

-- 📊 Test function
function DonationLogger:TestConnection(donorPlayer, recipientPlayer)
	log("Testing connection...")
	return self:LogDonation(donorPlayer, recipientPlayer, 100000, "🧪 Test donation - System working!")
end

-- 🔧 Set custom API URL
function DonationLogger:SetAPIUrl(url)
	if type(url) == "string" and (url:match("^http://") or url:match("^https://")) then
		self.API_URL = url
		log("API URL updated to:", url)
		return true
	else
		warn_log("Invalid URL format:", url)
		return false
	end
end

return DonationLogger
