const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

// Format number with commas
function formatNumber(num) {
  return num.toLocaleString();
}

// Format date
function formatDate() {
  const now = new Date();
  const month = now.toLocaleString('en-US', { month: 'short' });
  const day = now.getDate();
  const year = now.getFullYear();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  
  return `${month} ${day}, ${year} at ${hour12}:${minutes} ${ampm}`;
}

// Get Roblox headshot URL
async function getRobloxHeadshotUrl(userId) {
  try {
    const response = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`);
    const data = response.data;
    if (data.data && data.data[0] && data.data[0].imageUrl) {
      return data.data[0].imageUrl;
    }
  } catch (error) {
    console.error('Error fetching Roblox headshot:', error);
  }
  return null;
}

async function fetchImage(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  return await loadImage(Buffer.from(res.data));
}

// Generate donation image
async function generateDonationImage(donorName, donorUserId, recipientName, recipientUserId, amount, message) {
  // Clean usernames
  const cleanDonor = donorName.replace('@', '');
  const cleanRecipient = recipientName.replace('@', '');
  
  // Canvas dimensions - shorter height like the template
  const width = 1400;
  const height = 200;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Red/pink gradient background from left to right
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#ff6b6b');      // Red-pink on left
  gradient.addColorStop(0.5, '#ffb3ba');    // Light pink in middle
  gradient.addColorStop(1, '#ff6b6b');      // Red-pink on right
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Helper function for text with white fill and black outline
  const drawText = (text, x, y, size, align = 'center') => {
    ctx.font = `bold ${size}px Arial, sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    
    // Black outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeText(text, x, y);
    
    // White fill
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(text, x, y);
  };
  
  // Load avatar images
  let donorAvatar, recipientAvatar;
  
  try {
    const donorAvatarUrl = await getRobloxHeadshotUrl(donorUserId);
    if (donorAvatarUrl) {
      donorAvatar = await fetchImage(donorAvatarUrl);
    }
  } catch (error) {
    console.warn('Failed to load donor avatar:', error);
  }
  
  try {
    const recipientAvatarUrl = await getRobloxHeadshotUrl(recipientUserId);
    if (recipientAvatarUrl) {
      recipientAvatar = await fetchImage(recipientAvatarUrl);
    }
  } catch (error) {
    console.warn('Failed to load recipient avatar:', error);
  }
  
  // Avatar settings
  const avatarSize = 60;
  const avatarY = 70;
  const leftAvatarX = 80;
  const rightAvatarX = 1320;
  
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
  
  // Red border for donor avatar
  ctx.strokeStyle = '#cc0000';
  ctx.lineWidth = 8;
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
  
  // Red border for recipient avatar
  ctx.strokeStyle = '#cc0000';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(rightAvatarX, avatarY, avatarSize, 0, Math.PI * 2);
  ctx.stroke();
  
  // Draw Robux icon (circle with R)
  const iconX = 200;
  const iconY = 50;
  const iconRadius = 25;
  
  // Red circle
  ctx.fillStyle = '#cc0000';
  ctx.beginPath();
  ctx.arc(iconX, iconY, iconRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // White R
  ctx.font = 'bold 30px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('R', iconX, iconY);
  
  // Draw amount next to icon
  const amountText = formatNumber(amount);
  ctx.font = 'bold 50px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  
  // Black outline
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 5;
  ctx.strokeText(amountText, 240, 50);
  
  // White fill
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(amountText, 240, 50);
  
  // Draw "donated to" text
  drawText('donated to', 700, 100, 40, 'center');
  
  // Draw donor name below left avatar
  drawText(`@${cleanDonor}`, leftAvatarX, 160, 20, 'center');
  
  // Draw recipient name below right avatar
  drawText(`@${cleanRecipient}`, rightAvatarX, 160, 20, 'center');
  
  return canvas.toBuffer('image/png');
}

module.exports = { generateDonationImage };
