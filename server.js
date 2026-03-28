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
      bg1: '#1a1a2e',
      bg2: '#16213e',
      border: '#ff00ff',
      text: '#ff00ff',
      robuxIcon: '#ff00ff',
      username: '#fff'
    },
    epic: {
      bg1: '#ff69b4',  // Hot pink
      bg2: '#ff1493',  // Deep pink
      border: '#ff00ff',
      text: '#ff00ff',
      robuxIcon: '#ff00ff',
      username: '#000'
    },
    legendary: {
      bg1: '#ff6347',  // Tomato red
      bg2: '#ff4500',  // Orange red  
      border: '#ff0000',
      text: '#ff0000',
      robuxIcon: '#ff0000',
      username: '#000'
    }
  };
  
  const theme = colors[tier];
  
  // Canvas dimensions
  const width = 1400;
  const height = message ? 550 : 450;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background - gradient based on tier
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, theme.bg1);
  gradient.addColorStop(1, theme.bg2);
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
  if (donorAvatar) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(220, 180, 110, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(donorAvatar, 110, 70, 220, 220);
    ctx.restore();
    
    // Border color based on tier
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(220, 180, 110, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(220, 180, 110, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 10;
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
    
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(1180, 180, 110, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(1180, 180, 110, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 10;
    ctx.stroke();
  }
  
  // Draw Robux icon
  ctx.fillStyle = theme.robuxIcon;
  ctx.font = 'bold 80px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('◈', 700, 90);
  
  // Draw amount with stroke effect
  const formattedAmount = formatNumber(amount);
  ctx.font = 'bold 100px sans-serif';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 10;
  ctx.strokeText(formattedAmount, 700, 140);
  ctx.fillStyle = theme.text;
  ctx.fillText(formattedAmount, 700, 140);
  
  // Draw "donated to" text
  ctx.font = 'bold 60px sans-serif';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 6;
  ctx.strokeText('donated to', 700, 210);
  ctx.fillStyle = '#000';
  ctx.fillText('donated to', 700, 210);
  
  // Draw donor name
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = theme.username;
  ctx.fillText(`@${donorName}`, 220, 320);
  
  // Draw recipient name
  ctx.fillStyle = theme.username;
  ctx.fillText(`@${recipientName}`, 1180, 320);
  
  // Draw message box if provided
  if (message && message.trim()) {
    const boxY = 360;
    const boxHeight = 100;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(100, boxY, width - 200, boxHeight);
    
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#000';
    
    const lines = wrapText(ctx, message, width - 260);
    lines.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, 130, boxY + 40 + (i * 32));
    });
  }
  
  // Draw timestamp
  const dateText = `Donated on • ${formatDate()}`;
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = tier === 'common' ? '#888' : '#000';
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
