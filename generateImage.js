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

// Generate donation image with transparent background and gradient fade
async function generateDonationImage(donorName, donorUserId, recipientName, recipientUserId, amount, message) {
  // Clean usernames
  const cleanDonor = donorName.replace('@', '');
  const cleanRecipient = recipientName.replace('@', '');
  
  // Canvas dimensions
  const width = 1400;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // IMPORTANT: Start with transparent background
  ctx.clearRect(0, 0, width, height);
  
  // Create gradient fade from bottom (pink) to top (transparent)
  const gradient = ctx.createLinearGradient(0, height, 0, 0);
  gradient.addColorStop(0, '#ff69b4');                     // Solid hot pink at bottom
  gradient.addColorStop(0.25, '#ff8dc4');                  // Lighter pink
  gradient.addColorStop(0.5, 'rgba(255, 182, 217, 0.7)');  // Semi-transparent
  gradient.addColorStop(0.75, 'rgba(255, 192, 203, 0.3)'); // Very transparent
  gradient.addColorStop(1, 'rgba(255, 192, 203, 0)');      // Fully transparent at top
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Helper function for perfect text with white fill and black outline
  const drawPerfectText = (text, x, y, size, align = 'center', stroke = 6) => {
    ctx.font = `bold ${size}px Arial, sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    
    // Black outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = stroke;
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
  
  // Draw donor avatar (left side)
  const avatarSize = 100;
  const leftAvatarX = 200;
  const avatarY = 130;
  
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
  
  // Pink border for donor avatar
  ctx.strokeStyle = '#ff1493';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(leftAvatarX, avatarY, avatarSize, 0, Math.PI * 2);
  ctx.stroke();
  
  // Draw recipient avatar (right side)
  const rightAvatarX = 1200;
  
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
  
  // Pink border for recipient avatar
  ctx.strokeStyle = '#ff1493';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(rightAvatarX, avatarY, avatarSize, 0, Math.PI * 2);
  ctx.stroke();
  
  // Draw hexagon icon
  ctx.save();
  ctx.translate(700, 80);
  
  // Black outline
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 8;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = 40 * Math.cos(angle);
    const y = 40 * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  
  // Pink fill
  ctx.fillStyle = '#ff1493';
  ctx.fill();
  ctx.restore();
  
  // Draw amount with pink fill and black outline
  const amountText = formatNumber(amount);
  ctx.font = 'bold 100px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  
  // Black outline
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 10;
  ctx.strokeText(amountText, 850, 130);
  
  // Pink fill
  ctx.fillStyle = '#ff1493';
  ctx.fillText(amountText, 850, 130);
  
  // Draw "donated to" text (white with black outline)
  drawPerfectText('donated to', 700, 210, 50, 'center', 6);
  
  // Draw donor name
  drawPerfectText(`@${cleanDonor}`, leftAvatarX, 270, 32, 'center', 5);
  
  // Draw recipient name
  drawPerfectText(`@${cleanRecipient}`, rightAvatarX, 270, 32, 'center', 5);
  
  // Draw timestamp at the bottom
  const dateText = `Donated on ${formatDate()}`;
  drawPerfectText(dateText, width / 2, height - 30, 22, 'center', 4);
  
  return canvas.toBuffer('image/png');
}

module.exports = { generateDonationImage };
