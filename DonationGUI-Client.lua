--[[
	Simple Donation GUI Client Script
	
	This is a basic example of a donation GUI that connects to the server.
	Place this in a ScreenGui → LocalScript
	
	Structure:
	ScreenGui
	└── Frame (DonationFrame)
	    ├── TextLabel (Title)
	    ├── TextBox (AmountInput)
	    ├── TextBox (MessageInput)
	    └── TextButton (DonateButton)
--]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

local player = Players.LocalPlayer

-- Wait for RemoteEvent to exist
local donationEvent = ReplicatedStorage:WaitForChild("DonationEvent")

-- Get GUI elements (adjust paths to match your GUI structure)
local gui = script.Parent
local amountInput = gui:WaitForChild("AmountInput")
local messageInput = gui:WaitForChild("MessageInput")
local donateButton = gui:WaitForChild("DonateButton")

-- 💰 Handle donation button click
donateButton.MouseButton1Click:Connect(function()
	-- Get amount from input
	local amount = tonumber(amountInput.Text)
	
	-- Validate amount
	if not amount or amount <= 0 then
		warn("Invalid donation amount!")
		-- TODO: Show error message to player
		return
	end
	
	-- Get optional message
	local message = messageInput.Text
	if message == "" then
		message = nil
	end
	
	print("Sending donation:", amount, "Robux")
	
	-- Send to server
	donationEvent:FireServer(amount, message)
	
	-- TODO: Show success message, play sound, etc.
	-- TODO: Close GUI or reset inputs
	
	-- Reset inputs
	amountInput.Text = ""
	messageInput.Text = ""
end)

print("Donation GUI initialized")
