--[[
	Donation GUI Client Script
	
	This creates a simple donation interface for players.
	Place this in StarterPlayerScripts or StarterGui as a LocalScript.
	
	Features:
	- Select recipient from server players
	- Enter donation amount
	- Add optional message
	- Send donation to server
--]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService = game:GetService("UserInputService")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- Wait for RemoteEvent
local donationEvent = ReplicatedStorage:WaitForChild("DonationEvent", 10)

if not donationEvent then
	warn("[DonationGUI] Failed to find DonationEvent!")
	return
end

-- Create GUI
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "DonationGUI"
screenGui.ResetOnSpawn = false
screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
screenGui.Parent = playerGui

-- Main Frame
local mainFrame = Instance.new("Frame")
mainFrame.Name = "MainFrame"
mainFrame.Size = UDim2.new(0, 400, 0, 500)
mainFrame.Position = UDim2.new(0.5, -200, 0.5, -250)
mainFrame.BackgroundColor3 = Color3.fromRGB(25, 25, 35)
mainFrame.BorderSizePixel = 0
mainFrame.Visible = false
mainFrame.Parent = screenGui

-- Add corner radius
local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 12)
corner.Parent = mainFrame

-- Title
local title = Instance.new("TextLabel")
title.Name = "Title"
title.Size = UDim2.new(1, 0, 0, 60)
title.BackgroundColor3 = Color3.fromRGB(255, 0, 255)
title.BorderSizePixel = 0
title.Font = Enum.Font.GothamBold
title.Text = "💰 Donate Robux"
title.TextColor3 = Color3.fromRGB(255, 255, 255)
title.TextSize = 24
title.Parent = mainFrame

local titleCorner = Instance.new("UICorner")
titleCorner.CornerRadius = UDim.new(0, 12)
titleCorner.Parent = title

-- Recipient Label
local recipientLabel = Instance.new("TextLabel")
recipientLabel.Size = UDim2.new(1, -40, 0, 30)
recipientLabel.Position = UDim2.new(0, 20, 0, 80)
recipientLabel.BackgroundTransparency = 1
recipientLabel.Font = Enum.Font.Gotham
recipientLabel.Text = "Select Recipient:"
recipientLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
recipientLabel.TextSize = 16
recipientLabel.TextXAlignment = Enum.TextXAlignment.Left
recipientLabel.Parent = mainFrame

-- Recipient Dropdown (ScrollingFrame with player buttons)
local recipientScroll = Instance.new("ScrollingFrame")
recipientScroll.Size = UDim2.new(1, -40, 0, 120)
recipientScroll.Position = UDim2.new(0, 20, 0, 115)
recipientScroll.BackgroundColor3 = Color3.fromRGB(40, 40, 50)
recipientScroll.BorderSizePixel = 0
recipientScroll.ScrollBarThickness = 6
recipientScroll.CanvasSize = UDim2.new(0, 0, 0, 0)
recipientScroll.Parent = mainFrame

local recipientCorner = Instance.new("UICorner")
recipientCorner.CornerRadius = UDim.new(0, 8)
recipientCorner.Parent = recipientScroll

local recipientList = Instance.new("UIListLayout")
recipientList.SortOrder = Enum.SortOrder.Name
recipientList.Padding = UDim.new(0, 4)
recipientList.Parent = recipientScroll

local selectedRecipient = nil

-- Amount Label
local amountLabel = Instance.new("TextLabel")
amountLabel.Size = UDim2.new(1, -40, 0, 30)
amountLabel.Position = UDim2.new(0, 20, 0, 250)
amountLabel.BackgroundTransparency = 1
amountLabel.Font = Enum.Font.Gotham
amountLabel.Text = "Amount (Robux):"
amountLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
amountLabel.TextSize = 16
amountLabel.TextXAlignment = Enum.TextXAlignment.Left
amountLabel.Parent = mainFrame

-- Amount Input
local amountInput = Instance.new("TextBox")
amountInput.Name = "AmountInput"
amountInput.Size = UDim2.new(1, -40, 0, 40)
amountInput.Position = UDim2.new(0, 20, 0, 285)
amountInput.BackgroundColor3 = Color3.fromRGB(40, 40, 50)
amountInput.BorderSizePixel = 0
amountInput.Font = Enum.Font.Gotham
amountInput.PlaceholderText = "Enter amount..."
amountInput.Text = ""
amountInput.TextColor3 = Color3.fromRGB(255, 255, 255)
amountInput.TextSize = 18
amountInput.ClearTextOnFocus = false
amountInput.Parent = mainFrame

local amountCorner = Instance.new("UICorner")
amountCorner.CornerRadius = UDim.new(0, 8)
amountCorner.Parent = amountInput

-- Message Input
local messageInput = Instance.new("TextBox")
messageInput.Name = "MessageInput"
messageInput.Size = UDim2.new(1, -40, 0, 60)
messageInput.Position = UDim2.new(0, 20, 0, 340)
messageInput.BackgroundColor3 = Color3.fromRGB(40, 40, 50)
messageInput.BorderSizePixel = 0
messageInput.Font = Enum.Font.Gotham
messageInput.PlaceholderText = "Optional message..."
messageInput.Text = ""
messageInput.TextColor3 = Color3.fromRGB(255, 255, 255)
messageInput.TextSize = 14
messageInput.TextWrapped = true
messageInput.TextXAlignment = Enum.TextXAlignment.Left
messageInput.TextYAlignment = Enum.TextYAlignment.Top
messageInput.ClearTextOnFocus = false
messageInput.MultiLine = true
messageInput.Parent = mainFrame

local messageCorner = Instance.new("UICorner")
messageCorner.CornerRadius = UDim.new(0, 8)
messageCorner.Parent = messageInput

-- Donate Button
local donateButton = Instance.new("TextButton")
donateButton.Name = "DonateButton"
donateButton.Size = UDim2.new(1, -40, 0, 50)
donateButton.Position = UDim2.new(0, 20, 0, 420)
donateButton.BackgroundColor3 = Color3.fromRGB(255, 0, 255)
donateButton.BorderSizePixel = 0
donateButton.Font = Enum.Font.GothamBold
donateButton.Text = "💰 DONATE"
donateButton.TextColor3 = Color3.fromRGB(255, 255, 255)
donateButton.TextSize = 20
donateButton.Parent = mainFrame

local buttonCorner = Instance.new("UICorner")
buttonCorner.CornerRadius = UDim.new(0, 8)
buttonCorner.Parent = donateButton

-- Close Button
local closeButton = Instance.new("TextButton")
closeButton.Size = UDim2.new(0, 40, 0, 40)
closeButton.Position = UDim2.new(1, -50, 0, 10)
closeButton.BackgroundColor3 = Color3.fromRGB(200, 0, 0)
closeButton.BorderSizePixel = 0
closeButton.Font = Enum.Font.GothamBold
closeButton.Text = "X"
closeButton.TextColor3 = Color3.fromRGB(255, 255, 255)
closeButton.TextSize = 20
closeButton.Parent = mainFrame

local closeCorner = Instance.new("UICorner")
closeCorner.CornerRadius = UDim.new(0, 8)
closeCorner.Parent = closeButton

-- Function to update player list
local function updatePlayerList()
	for _, child in pairs(recipientScroll:GetChildren()) do
		if child:IsA("TextButton") then
			child:Destroy()
		end
	end
	
	local ySize = 0
	
	for _, otherPlayer in pairs(Players:GetPlayers()) do
		if otherPlayer ~= player then
			local playerButton = Instance.new("TextButton")
			playerButton.Size = UDim2.new(1, -12, 0, 30)
			playerButton.BackgroundColor3 = Color3.fromRGB(60, 60, 70)
			playerButton.BorderSizePixel = 0
			playerButton.Font = Enum.Font.Gotham
			playerButton.Text = otherPlayer.Name
			playerButton.TextColor3 = Color3.fromRGB(255, 255, 255)
			playerButton.TextSize = 14
			playerButton.Parent = recipientScroll
			
			local btnCorner = Instance.new("UICorner")
			btnCorner.CornerRadius = UDim.new(0, 6)
			btnCorner.Parent = playerButton
			
			playerButton.MouseButton1Click:Connect(function()
				selectedRecipient = otherPlayer
				
				-- Update all buttons
				for _, btn in pairs(recipientScroll:GetChildren()) do
					if btn:IsA("TextButton") then
						btn.BackgroundColor3 = Color3.fromRGB(60, 60, 70)
					end
				end
				
				playerButton.BackgroundColor3 = Color3.fromRGB(255, 0, 255)
			end)
			
			ySize = ySize + 34
		end
	end
	
	recipientScroll.CanvasSize = UDim2.new(0, 0, 0, ySize)
end

-- Handle donate button
donateButton.MouseButton1Click:Connect(function()
	if not selectedRecipient then
		warn("[DonationGUI] No recipient selected!")
		donateButton.Text = "⚠️ Select a recipient!"
		task.wait(2)
		donateButton.Text = "💰 DONATE"
		return
	end
	
	local amount = tonumber(amountInput.Text)
	
	if not amount or amount <= 0 then
		warn("[DonationGUI] Invalid amount!")
		donateButton.Text = "⚠️ Invalid amount!"
		task.wait(2)
		donateButton.Text = "💰 DONATE"
		return
	end
	
	local message = messageInput.Text
	if message == "" then
		message = nil
	end
	
	print("[DonationGUI] Sending donation:", selectedRecipient.Name, amount, message)
	
	donationEvent:FireServer(selectedRecipient, amount, message)
	
	donateButton.Text = "✅ Donation sent!"
	task.wait(1)
	donateButton.Text = "💰 DONATE"
	
	-- Reset form
	amountInput.Text = ""
	messageInput.Text = ""
	selectedRecipient = nil
	updatePlayerList()
end)

-- Handle close button
closeButton.MouseButton1Click:Connect(function()
	mainFrame.Visible = false
end)

-- Toggle GUI with key press (default: G)
UserInputService.InputBegan:Connect(function(input, gameProcessed)
	if gameProcessed then return end
	
	if input.KeyCode == Enum.KeyCode.G then
		mainFrame.Visible = not mainFrame.Visible
		
		if mainFrame.Visible then
			updatePlayerList()
		end
	end
end)

-- Update player list when players join/leave
Players.PlayerAdded:Connect(updatePlayerList)
Players.PlayerRemoving:Connect(updatePlayerList)

-- Initial update
updatePlayerList()

print("[DonationGUI] Initialized! Press 'G' to open donation menu.")
