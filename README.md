# Donation Logger API

A Node.js API that receives donation events from Roblox games and logs them to Discord with custom generated images.

## Features

- 💰 Custom donation images with player avatars
- 📊 Automatic Roblox profile fetching
- 🎨 Beautiful Discord embeds
- ✅ Input validation and error handling
- 🔒 Secure webhook handling

## Quick Start

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file:

```env
DISCORD_WEBHOOK_URL=your_webhook_url_here
PORT=3000
```

### Run

```bash
npm start
```

The API will be available at `http://localhost:3000`

## API Endpoints

### POST /api/donation

Logs a donation to Discord.

**Request Body:**
```json
{
  "playerName": "PlayerName",
  "userId": 123456789,
  "recipientName": "RecipientName",
  "recipientUserId": 987654321,
  "amount": 100000,
  "message": "Optional message"
}
```

**Required Fields:**
- `playerName` (string) - Donor's username
- `userId` (number) - Donor's Roblox user ID
- `amount` (number) - Donation amount

**Optional Fields:**
- `recipientName` (string) - Recipient's username
- `recipientUserId` (number) - Recipient's Roblox user ID
- `message` (string) - Optional message (max 200 chars)
- `timestamp` (string) - ISO 8601 timestamp

**Response:**
```json
{
  "success": true,
  "message": "Donation logged successfully"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-03-27T16:05:00Z"
}
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

Recommended platforms:
- Railway.app (easiest)
- Render.com
- Vercel

## Roblox Integration

See the included Roblox scripts:
- `ServerDonationScript.lua` - Server-side handler
- `ClientDonationGUI.lua` - Player GUI

Update the `API_URL` in the server script with your deployed API URL.

## Environment Variables

- `DISCORD_WEBHOOK_URL` - Your Discord webhook URL (required)
- `PORT` - Server port (default: 3000)

## License

MIT
