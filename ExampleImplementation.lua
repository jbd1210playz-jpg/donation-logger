--[[
	Example Implementation - Updated for Two-Player Donations
--]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

local DonationLogger = require(script.Parent.DonationLogger)

-- Configure the API URL
DonationLogger:SetAPIUrl("https://your-server-url.com/api/donation")

-- 💰 Process a donation between two players
local function processDonation(donorPlayer, recipientPlayer, amount, message)
	print(donorPlayer.Name, "donated", amount, "Robux to", recipientPlayer.Name)
	
	-- Your game logic here
	-- Give rewards, play effects, etc.
	
	-- Log to Discord with custom image
	local success, result = DonationLogger:LogDonation(donorPlayer, recipientPlayer, amount, message)
	
	if success then
		print("✅ Donation logged to Discord with custom image!")
	else
		warn("⚠️ Failed to log donation:", result)
	end
end

-- 🎮 Create RemoteEvent for donations
local donationEvent = Instance.new("RemoteEvent")
donationEvent.Name = "DonationEvent"
donationEvent.Parent = ReplicatedStorage

-- Handle donation requests
-- Client sends: donationEvent:FireServer(recipientPlayer, amount, message)
donationEvent.OnServerEvent:Connect(function(donorPlayer, recipientPlayer, amount, message)
	-- Validate donor
	if not donorPlayer or not donorPlayer:IsA("Player") then
		warn("Invalid donor")
		return
	end
	
	-- Validate recipient
	if not recipientPlayer or not recipientPlayer:IsA("Player") then
		warn("Invalid recipient")
		return
	end
	
	-- Validate amount
	if typeof(amount) ~= "number" or amount <= 0 then
		warn(donorPlayer.Name, "tried to donate invalid amount:", amount)
		return
	end
	
	-- Prevent self-donations (optional)
	if donorPlayer == recipientPlayer then
		warn(donorPlayer.Name, "tried to donate to themselves")
		return
	end
	
	-- Process the donation
	processDonation(donorPlayer, recipientPlayer, amount, message)
end)

-- 🧪 Test with two players
Players.PlayerAdded:Connect(function(player)
	task.wait(5)
	
	-- Example: First player donates to second player
	local players = Players:GetPlayers()
	if #players >= 2 then
		local donor = players[1]
		local recipient = players[2]
		
		-- Uncomment to test:
		-- DonationLogger:TestConnection(donor, recipient)
	end
end)

print("💰 Donation system initialized (with custom images)!")
