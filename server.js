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
  // Canvas dimensions - proper height
  const width = 1400;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Transparent background with fade starting at bottom, fully transparent at usernames
  ctx.clearRect(0, 0, width, height);
  
  // Create gradient fade - solid pink at bottom (400), fade up, fully transparent at username level (310)
  const usernameY = 310;
  const gradient = ctx.createLinearGradient(0, height, 0, 0);
  gradient.addColorStop(0, '#ff69b4');                     // Solid hot pink at bottom (y=400)
  gradient.addColorStop(0.2, '#ff8dc4');                   // Start fading
  gradient.addColorStop(0.4, 'rgba(255, 182, 217, 0.7)');  // More transparent
  gradient.addColorStop(0.6, 'rgba(255, 192, 203, 0.3)');  // Very transparent
  gradient.addColorStop((height - usernameY) / height, 'rgba(255, 192, 203, 0)'); // Fully transparent at username level (y=310)
  gradient.addColorStop(1, 'rgba(255, 192, 203, 0)');      // Stay transparent to top
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Helper function for text with pink fill and black outline
  const drawText = (text, x, y, size, fillColor, align = 'center', strokeWidth = 8) => {
    ctx.font = `bold ${size}px Arial`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    
    // Black outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = strokeWidth;
    ctx.strokeText(text, x, y);
    
    // Fill color
    ctx.fillStyle = fillColor;
    ctx.fillText(text, x, y);
  };
  
  // Load avatar images and custom emoji
  let donorAvatar, recipientAvatar, customEmoji;
  
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
  
  // Load custom Discord emoji
  try {
    const emojiUrl = 'https://cdn.discordapp.com/emojis/1333681854098636861.png';
    customEmoji = await loadImage(emojiUrl);
  } catch (error) {
    console.warn('Failed to load custom emoji');
  }
  
  // Avatar settings - larger avatars
  const avatarSize = 110;
  const avatarY = 140;
  const leftAvatarX = 220;
  const rightAvatarX = 1180;
  
  // Draw donor avatar (left side)
  if (donorAvatar) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(leftAvatarX, avatarY, avatarSize, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(donorAvatar, leftAvatarX - avatarSize, avatarY - avatarSize, avatarSize * 2, avatarSize * 2);
    ctx.restore();
  } else {
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(leftAvatarX, avatarY, avatarSize, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Hot pink border for donor avatar
  ctx.strokeStyle = '#ff1493';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(leftAvatarX, avatarY, avatarSize, 0, Math.PI * 2);
  ctx.stroke();
  
  // Draw recipient avatar (right side)
  if (recipientAvatar) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(rightAvatarX, avatarY, avatarSize, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(recipientAvatar, rightAvatarX - avatarSize, avatarY - avatarSize, avatarSize * 2, avatarSize * 2);
    ctx.restore();
  } else {
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(rightAvatarX, avatarY, avatarSize, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Hot pink border for recipient avatar
  ctx.strokeStyle = '#ff1493';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(rightAvatarX, avatarY, avatarSize, 0, Math.PI * 2);
  ctx.stroke();
  
  // Draw custom Discord emoji at the beginning
  const iconX = 560;
  const iconY = 120;
  const iconSize = 80;
  
  if (customEmoji) {
    ctx.drawImage(customEmoji, iconX, iconY - iconSize / 2, iconSize, iconSize);
  } else {
    // Fallback: draw hexagon if emoji fails to load
    ctx.save();
    ctx.translate(iconX + iconSize / 2, iconY);
    
    const hexSize = 40;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 8;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const x = hexSize * Math.cos(angle);
      const y = hexSize * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = '#ff1493';
    ctx.fill();
    ctx.restore();
  }
  
  // Draw amount with hot pink fill and black outline
  const formattedAmount = formatNumber(amount);
  drawText(formattedAmount, 850, 120, 100, '#ff1493', 'center', 10);
  
  // Draw "donated to" text (white with black outline)
  drawText('donated to', 700, 230, 60, '#FFFFFF', 'center', 8);
  
  // Draw donor name below left avatar (white with black outline)
  drawText(`@${donorName}`, leftAvatarX, 310, 36, '#FFFFFF', 'center', 6);
  
  // Draw recipient name below right avatar (white with black outline)
  drawText(`@${recipientName}`, rightAvatarX, 310, 36, '#FFFFFF', 'center', 6);
  
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
