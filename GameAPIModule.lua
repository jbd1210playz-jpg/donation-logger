local API = {}

local HttpService = game:GetService("HttpService")

-- ⚙️ CONFIGURATION
local IMAGE_API_URL = "http://localhost:3000/api/donation"  -- ⚠️ CHANGE THIS TO YOUR PUBLIC URL
local WEBHOOK = "https://discord.com/api/webhooks/1486493175924261035/ixdzicHQ_zHsA1PTyRIx70zUjfkCkyaiGnY8lZFNm0ia4WSVE0UVtD_J1rKx5RyMfZBh"

-- Helper function to send embed (for non-donation logs)
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
		HttpService:PostAsync(
			WEBHOOK,
			HttpService:JSONEncode(data),
			Enum.HttpContentType.ApplicationJson
		)
	end)
	
	if not success then
		warn("[API] Failed to send embed:", result)
	end
end

-- Helper function to send donation with custom image
local function sendDonationImage(donatorName, donatorId, raiserName, raiserId, amount, message)
	local data = {
		playerName = donatorName,
		userId = donatorId,
		recipientName = raiserName,
		recipientUserId = raiserId,
		amount = amount,
		message = message or "",
		timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ")
	}
	
	local success, result = pcall(function()
		return HttpService:RequestAsync({
			Url = IMAGE_API_URL,
			Method = "POST",
			Headers = {
				["Content-Type"] = "application/json"
			},
			Body = HttpService:JSONEncode(data)
		})
	end)
	
	if success then
		if result.Success and result.StatusCode == 200 then
			print("[API] ✅ Donation logged with custom image!")
			return true
		else
			warn("[API] ❌ API error:", result.StatusCode, result.StatusMessage)
			-- Fallback to embed if API fails
			return false
		end
	else
		warn("[API] ❌ Failed to send donation image:", result)
		return false
	end
end

-- Exploit Log
function API._exploitlog(message)
	sendEmbed("Exploit Log", message, 0xff0000)
end

-- Chat Log
function API._chatlog(message)
	sendEmbed("Chat Log", message, 0x00ffff)
end

-- Report Logs
function API._reportlogs(message)
	sendEmbed("Report Log", message, 0xffaa00)
end

-- Fake Donation Log
function API._fakedonologs(message)
	sendEmbed("Fake Donation", message, 0xff0000)
end

-- Big Donation Log (simple embed)
function API._bigdonos(message)
	sendEmbed("Big Donation", message, 0x00ff00)
end

-- Main Donation Logger with Custom Image
function API._ulitiesdonation(info, amount)
	-- Only log donations >= 100,000 Robux
	if amount < 100_000 then
		return
	end

	local donatorName = tostring(info.donatorName)
	local raiserName = tostring(info.raiserName)
	local donatorId = tonumber(info.donatorId)
	local raiserId = tonumber(info.raiserId)

	-- Determine emoji based on amount
	local emoji
	if amount >= 10_000_000 then
		emoji = "<:starfall:1466700883097157755>"
	elseif amount >= 1_000_000 then
		emoji = "<:smite:1466700843293216914>"
	else
		emoji = "<:nuke:1466700817275949067>"
	end

	-- Create message with emoji
	local message = emoji .. " donation"

	print("[API] Logging donation:", donatorName, "→", raiserName, "-", amount, "Robux")

	-- Try to send with custom image
	local success = sendDonationImage(donatorName, donatorId, raiserName, raiserId, amount, message)

	-- Fallback to embed if image API fails
	if not success then
		warn("[API] Image API failed, using fallback embed")
		
		local color
		if amount >= 10_000_000 then
			color = 0xff0000
		elseif amount >= 1_000_000 then
			color = 0xff66cc
		else
			color = 0x9966ff
		end

		local avatar = "https://www.roblox.com/headshot-thumbnail/image?userId="
			.. donatorId .. "&width=420&height=420&format=png"

		sendEmbed(
			emoji .. " " .. tostring(amount) .. " Robux donated",
			"**" .. donatorName .. "** donated to **" .. raiserName .. "**",
			color,
			avatar
		)
	end
end

return API
