local API = {}

local HttpService = game:GetService("HttpService")

local WEBHOOK = "https://discord.com/api/webhooks/1486493175924261035/ixdzicHQ_zHsA1PTyRIx70zUjfkCkyaiGnY8lZFNm0ia4WSVE0UVtD_J1rKx5RyMfZBh"
local DONATION_API = "https://donation-logger-production.up.railway.app/api/donation"

-- Helper function to send simple embeds to Discord
local function sendEmbed(title, description, color, thumbnailUrl)
	local embed = {
		title = title,
		description = description,
		color = color,
		footer = {
			text = "Donation Logger"
		}
	}

	if thumbnailUrl then
		embed.thumbnail = { url = thumbnailUrl }
	end

	local data = { embeds = { embed } }

	local success, result = pcall(function()
		return HttpService:PostAsync(
			WEBHOOK,
			HttpService:JSONEncode(data),
			Enum.HttpContentType.ApplicationJson
		)
	end)

	if not success then
		warn("[API] Failed to send embed:", result)
	end
end

-- Exploit logging
function API._exploitlog(message)
	sendEmbed("⚠️ Exploit Log", message, 0xff0000)
end

-- Chat logging
function API._chatlog(message)
	sendEmbed("💬 Chat Log", message, 0x00ffff)
end

-- Report logging
function API._reportlogs(message)
	sendEmbed("📝 Report Log", message, 0xffaa00)
end

-- Fake donation logging
function API._fakedonologs(message)
	sendEmbed("🚫 Fake Donation", message, 0xff0000)
end

-- Big donation logging (simple)
function API._bigdonos(message)
	sendEmbed("💰 Big Donation", message, 0x00ff00)
end

-- Main donation logger with custom image generation
function API._ulitiesdonation(info, amount)
	-- Only log donations above 100k
	if amount < 100000 then
		return
	end

	-- Extract and validate data
	local donatorName = tostring(info.donatorName or "Unknown")
	local raiserName = tostring(info.raiserName or "Unknown")
	local donatorId = tonumber(info.donatorId) or 0
	local raiserId = tonumber(info.raiserId) or 0
	local message = tostring(info.message or "")

	-- Build donation data for the API
	local donationData = {
		playerName = donatorName,
		userId = donatorId,
		recipientName = raiserName,
		recipientUserId = raiserId,
		amount = amount,
		message = message,
		timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ")
	}

	-- Send to donation API (with custom image generation)
	local success, result = pcall(function()
		return HttpService:RequestAsync({
			Url = DONATION_API,
			Method = "POST",
			Headers = {
				["Content-Type"] = "application/json"
			},
			Body = HttpService:JSONEncode(donationData)
		})
	end)

	if success then
		if result.Success and result.StatusCode == 200 then
			print("[API] ✅ Donation logged successfully:", donatorName, "→", raiserName, "-", amount, "Robux")
		else
			warn("[API] ❌ API error:", result.StatusCode, result.StatusMessage)
		end
	else
		warn("[API] ❌ Failed to log donation:", result)
	end
end

-- Alternative function with proper parameter names
function API.logDonation(donorPlayer, recipientPlayer, amount, message)
	if not donorPlayer or not recipientPlayer then
		warn("[API] Invalid players provided")
		return
	end

	local info = {
		donatorName = donorPlayer.Name,
		donatorId = donorPlayer.UserId,
		raiserName = recipientPlayer.Name,
		raiserId = recipientPlayer.UserId,
		message = message
	}

	API._ulitiesdonation(info, amount)
end

return API
