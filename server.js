const express = require('express');
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Helper function to format numbers with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Helper function to get Roblox avatar headshot URL
function getRobloxHeadshotUrl(userId) {
  return `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=420&height=420&format=png`;
}

// Helper function to fetch Roblox username from userId
async function getRobloxUsername(userId) {
  try {
    const response = await axios.post('https://users.roblox.com/v1/users', {
      userIds: [userId],
      excludeBannedUsers: false
    });
    
    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data.data[0].name;
    }
    return null;
  } catch (error) {
    console.warn(`Failed to fetch username for userId ${userId}:`, error.message);
    return null;
  }
}

// Helper function to format date
function formatDate() {
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[now.getMonth()];
  const day = now.getDate();
  const year = now.getFullYear();
  
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  
  return `${month} ${day}, ${year} • ${hours}:${minutes} ${ampm}`;
}

// Helper function to wrap text
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

// Generate donation image
async function generateDonationImage(donorName, donorUserId, recipientName, recipientUserId, amount, message) {
  // Canvas dimensions - taller to accommodate message box and date
  const width = 1400;
  const height = message ? 550 : 450;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background - gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Load avatar images
  let donorAvatar, recipientAvatar;
  
  try {
    donorAvatar = await loadImage(getRobloxHeadshotUrl(donorUserId));
  } catch (error) {
    console.warn('Failed to load donor avatar, using placeholder');
  }
  
  try {
    recipientAvatar = await loadImage(getRobloxHeadshotUrl(recipientUserId));
  } catch (error) {
    console.warn('Failed to load recipient avatar, using placeholder');
  }
  
  // Draw donor avatar (left side)
  if (donorAvatar) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(220, 180, 110, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(donorAvatar, 110, 70, 220, 220);
    ctx.restore();
    
    // Pink circle border
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(220, 180, 110, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // Placeholder circle
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(220, 180, 110, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 8;
    ctx.stroke();
  }
  
  // Draw recipient avatar (right side)
  if (recipientAvatar) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(1180, 180, 110, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(recipientAvatar, 1070, 70, 220, 220);
    ctx.restore();
    
    // Pink circle border
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(1180, 180, 110, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // Placeholder circle
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(1180, 180, 110, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 8;
    ctx.stroke();
  }
  
  // Draw Robux icon
  ctx.fillStyle = '#ff00ff';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('◈', 700, 90);
  
  // Draw amount with stroke effect
  const formattedAmount = formatNumber(amount);
  ctx.font = 'bold 100px Arial';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 10;
  ctx.strokeText(formattedAmount, 700, 140);
  ctx.fillStyle = '#ff00ff';
  ctx.fillText(formattedAmount, 700, 140);
  
  // Draw "donated to" text
  ctx.font = 'bold 60px Arial';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 6;
  ctx.strokeText('donated to', 700, 210);
  ctx.fillStyle = '#fff';
  ctx.fillText('donated to', 700, 210);
  
  // Draw donor name with @ prefix
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 5;
  ctx.strokeText(`@${donorName}`, 220, 320);
  ctx.fillStyle = '#fff';
  ctx.fillText(`@${donorName}`, 220, 320);
  
  // Draw recipient name with @ prefix
  ctx.strokeText(`@${recipientName}`, 1180, 320);
  ctx.fillStyle = '#fff';
  ctx.fillText(`@${recipientName}`, 1180, 320);
  
  // Draw message box if message provided
  if (message && message.trim()) {
    const boxY = 360;
    const boxHeight = 100;
    const boxPadding = 30;
    
    // Draw message box background (rounded rectangle)
    ctx.fillStyle = 'rgba(40, 40, 50, 0.8)';
    ctx.beginPath();
    ctx.roundRect(100, boxY, width - 200, boxHeight, 15);
    ctx.fill();
    
    // Draw message text
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    
    const lines = wrapText(ctx, message, width - 260);
    const lineHeight = 32;
    const textStartY = boxY + boxPadding + 10;
    
    lines.slice(0, 2).forEach((line, i) => { // Max 2 lines
      ctx.fillText(line, 130, textStartY + (i * lineHeight));
    });
  }
  
  // Draw "Donated on •" text at the very bottom
  const dateText = `Donated on • ${formatDate()}`;
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#888';
  ctx.fillText(dateText, width / 2, height - 20);
  
  return canvas.toBuffer('image/png');
}

// Donation logging endpoint
app.post('/api/donation', async (req, res) => {
  try {
    const { 
      playerName, 
      userId, 
      recipientName, 
      recipientUserId,
      amount, 
      message, 
      timestamp 
    } = req.body;

    // Validate required fields
    if (!playerName || !userId || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields: playerName, userId, amount' 
      });
    }

    // Validate Discord webhook is configured
    if (!DISCORD_WEBHOOK_URL) {
      console.error('Discord webhook URL not configured');
      return res.status(500).json({ error: 'Server misconfigured' });
    }

    console.log(`Generating donation image: ${playerName} → ${recipientName || 'Game'} - ${amount} Robux`);

    // Fetch usernames from Roblox API to ensure accuracy
    let donorUsername = playerName;
    let recipientUsername = recipientName || 'Game';
    
    try {
      const fetchedDonorName = await getRobloxUsername(userId);
      if (fetchedDonorName) donorUsername = fetchedDonorName;
      
      if (recipientUserId) {
        const fetchedRecipientName = await getRobloxUsername(recipientUserId);
        if (fetchedRecipientName) recipientUsername = fetchedRecipientName;
      }
    } catch (error) {
      console.warn('Failed to fetch some usernames, using provided names');
    }

    // Generate the donation image
    const imageBuffer = await generateDonationImage(
      donorUsername,
      userId,
      recipientUsername,
      recipientUserId || userId,
      amount,
      message
    );

    // Create form data for Discord
    const formData = new FormData();
    
    // Add the image
    formData.append('file', imageBuffer, {
      filename: 'donation.png',
      contentType: 'image/png'
    });

    // Add embed instead of simple content
    const embed = {
      color: 0xff00ff, // Pink color
      description: `💰 **${donorUsername}** donated **${formatNumber(amount)} Robux** to **${recipientUsername}**!`,
      image: {
        url: 'attachment://donation.png'
      }
    };

    const payload = {
      embeds: [embed]
    };
    
    formData.append('payload_json', JSON.stringify(payload));

    // Send to Discord
    await axios.post(DISCORD_WEBHOOK_URL, formData, {
      headers: formData.getHeaders()
    });

    console.log(`✅ Donation logged: ${donorUsername} (${userId}) → ${recipientUsername} - ${amount} Robux`);
    res.json({ success: true, message: 'Donation logged successfully' });

  } catch (error) {
    console.error('Error logging donation:', error.message);
    
    if (error.response) {
      console.error('Discord API error:', error.response.data);
    }
    
    res.status(500).json({ 
      error: 'Failed to log donation',
      details: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Donation Logger API running on port ${PORT}`);
  console.log(`📡 Endpoint: http://localhost:${PORT}/api/donation`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🎨 Image generation enabled with Roblox profile fetching`);
  
  if (!DISCORD_WEBHOOK_URL) {
    console.warn('⚠️  WARNING: DISCORD_WEBHOOK_URL not set in .env file');
  }
});
