--[[
	Example Usage of the API Module
	
	Place this in ServerScriptService to test the API module
--]]

local API = require(script.Parent.YourAPIModuleName)  -- Replace with your module path

-- Example 1: Exploit Log
API._exploitlog("Player123 tried to use speed exploit")

-- Example 2: Chat Log
API._chatlog("Player456: Hello everyone!")

-- Example 3: Report Log
API._reportlogs("Player789 reported Player123 for cheating")

-- Example 4: Fake Donation
API._fakedonologs("Player999 attempted fake donation of 500,000 Robux")

-- Example 5: Big Donation (uses custom image when >= 100k)
local donationInfo = {
	donatorName = "RichPlayer123",
	raiserName = "Streamer456",
	donatorId = 123456789,
	raiserId = 987654321
}

-- Small donation (won't log, < 100k)
API._ulitiesdonation(donationInfo, 50000)

-- Medium donation (will use custom image, >= 100k)
API._ulitiesdonation(donationInfo, 500000)  -- Purple nuke emoji

-- Large donation (will use custom image, >= 1M)
API._ulitiesdonation(donationInfo, 2500000)  -- Pink smite emoji

-- Huge donation (will use custom image, >= 10M)
API._ulitiesdonation(donationInfo, 15000000)  -- Red starfall emoji

print("API tests sent! Check your Discord channel.")
