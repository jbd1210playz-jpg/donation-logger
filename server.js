const express = require('express');
const axios = require('axios');
const { createCanvas, loadImage, registerFont } = require('canvas');
const FormData = require('form-data');
require('dotenv').config();

// Register a proper font that supports all characters  
try {
  registerFont('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', { family: 'DejaVu Sans', weight: 'bold' });
  registerFont('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', { family: 'DejaVu Sans' });
  console.log('✅ Fonts registered successfully');
} catch (error) {
  // Try alternative paths
  try {
    registerFont('/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf', { family: 'DejaVu Sans', weight: 'bold' });
    registerFont('/usr/share/fonts/dejavu/DejaVuSans.ttf', { family: 'DejaVu Sans' });
    console.log('✅ Fonts registered from alternative path');
  } catch (error2) {
    console.warn('⚠️ Fonts not available, using system default');
  }
}

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
async function getRobloxHeadshotUrl(userId) {
  try {
    const response = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data.data[0].imageUrl;
    }
  } catch (error) {
    console.warn(`Failed to fetch avatar URL for user ${userId}:`, error.message);
  }
  return null;
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
  // Determine tier based on amount
  const tier = amount >= 10000000 ? 'legendary' : amount >= 1000000 ? 'epic' : 'common';
  
  // Tier-specific colors
  const colors = {
    common: {
      bgStart: '#e8d4f2',
      bgEnd: '#f5e6ff',
      border: '#ff00ff',
      amountFill: '#ff00ff',
      amountStroke: '#000'
    },
    epic: {
      bgStart: '#ffd6e8',
      bgEnd: '#ffe6f0',
      border: '#ff1493',
      amountFill: '#ff1493',
      amountStroke: '#000'
    },
    legendary: {
      bgStart: '#ffcccc',
      bgEnd: '#ffe6e6',
      border: '#ff0000',
      amountFill: '#ff0000',
      amountStroke: '#000'
    }
  };
  
  const theme = colors[tier];
  
  // Canvas dimensions
  const width = 1600;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background - light gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, theme.bgStart);
  gradient.addColorStop(1, theme.bgEnd);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Load avatar images
  let donorAvatar, recipientAvatar;
  
  try {
    const donorAvatarUrl = await getRobloxHeadshotUrl(donorUserId);
    if (donorAvatarUrl) {
      donorAvatar = await loadImage(donorAvatarUrl);
    }
  } catch (error) {
    console.warn('Failed to load donor avatar');
  }
  
  try {
    const recipientAvatarUrl = await getRobloxHeadshotUrl(recipientUserId);
    if (recipientAvatarUrl) {
      recipientAvatar = await loadImage(recipientAvatarUrl);
    }
  } catch (error) {
    console.warn('Failed to load recipient avatar');
  }
  
  // Draw donor avatar (left side)
  const avatarSize = 180;
  const avatarY = 100;
  
  if (donorAvatar) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(300, avatarY, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(donorAvatar, 300 - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize);
    ctx.restore();
  } else {
    ctx.fillStyle = '#ccc';
    ctx.beginPath();
    ctx.arc(300, avatarY, avatarSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Donor avatar border
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(300, avatarY, avatarSize / 2, 0, Math.PI * 2);
  ctx.stroke();
  
  // Draw recipient avatar (right side)
  if (recipientAvatar) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(1300, avatarY, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(recipientAvatar, 1300 - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize);
    ctx.restore();
  } else {
    ctx.fillStyle = '#ccc';
    ctx.beginPath();
    ctx.arc(1300, avatarY, avatarSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Recipient avatar border
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(1300, avatarY, avatarSize / 2, 0, Math.PI * 2);
  ctx.stroke();
  
  // Draw Robux icon and amount
  ctx.font = 'bold 90px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = theme.amountStroke;
  ctx.fillText('◈', 800, 120);
  
  const formattedAmount = formatNumber(amount);
  ctx.font = 'bold 110px Arial';
  
  // Amount with thick black stroke
  ctx.strokeStyle = theme.amountStroke;
  ctx.lineWidth = 18;
  ctx.strokeText(formattedAmount, 800, 120);
  
  // Amount fill
  ctx.fillStyle = theme.amountFill;
  ctx.fillText(formattedAmount, 800, 120);
  
  // Draw "donated to" text
  ctx.font = 'bold 70px Arial';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 14;
  ctx.strokeText('donated to', 800, 210);
  ctx.fillStyle = '#000';
  ctx.fillText('donated to', 800, 210);
  
  // Draw donor username
  ctx.font = 'bold 50px Arial';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 8;
  ctx.strokeText(`@${donorName}`, 300, 310);
  ctx.fillStyle = '#000';
  ctx.fillText(`@${donorName}`, 300, 310);
  
  // Draw recipient username
  ctx.strokeStyle = '#fff';
  ctx.strokeText(`@${recipientName}`, 1300, 310);
  ctx.fillStyle = '#000';
  ctx.fillText(`@${recipientName}`, 1300, 310);
  
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
