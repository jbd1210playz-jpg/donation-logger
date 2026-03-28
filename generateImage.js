const { createCanvas, loadImage } = require('canvas');

// Format number with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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

// Wrap text to fit width
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

// Get Roblox headshot URL
async function getRobloxHeadshotUrl(userId) {
  try {
    const response = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`);
    const data = await response.json();
    if (data.data && data.data[0] && data.data[0].imageUrl) {
      return data.data[0].imageUrl;
    }
  } catch (error) {
    console.error('Error fetching Roblox headshot:', error);
  }
  return null;
}

// Generate donation image with transparent background and gradient fade
async function generateDonationImage(donorName, donorUserId, recipientName, recipientUserId, amount, message) {
  // Canvas dimensions
  const width = 1400;
  const height = 450;
  
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
  
  // Load avatar images
  let donorAvatar, recipientAvatar;
  
  try {
    const donorAvatarUrl = await getRobloxHeadshotUrl(donorUserId);
    if (donorAvatarUrl) {
      donorAvatar = await loadImage(donorAvatarUrl);
    }
  } catch (error) {
    console.warn('Failed to load donor avatar:', error);
  }
  
  try {
    const recipientAvatarUrl = await getRobloxHeadshotUrl(recipientUserId);
    if (recipientAvatarUrl) {
      recipientAvatar = await loadImage(recipientAvatarUrl);
    }
  } catch (error) {
    console.warn('Failed to load recipient avatar:', error);
  }
  
  // Draw donor avatar (left side)
  const avatarSize = 110;
  const leftAvatarX = 220;
  const avatarY = 180;
  
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
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(leftAvatarX, avatarY, avatarSize, 0, Math.PI * 2);
  ctx.stroke();
  
  // Draw recipient avatar (right side)
  const rightAvatarX = 1180;
  
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
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(rightAvatarX, avatarY, avatarSize, 0, Math.PI * 2);
  ctx.stroke();
  
  // Draw Robux icon (hexagon)
  ctx.save();
  ctx.translate(700, 60);
  ctx.fillStyle = '#ff1493';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = 30 * Math.cos(angle);
    const y = 30 * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  
  // Draw amount with white text and black stroke
  const formattedAmount = formatNumber(amount);
  ctx.font = 'bold 90px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Black stroke
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 8;
  ctx.strokeText(formattedAmount, 700, 150);
  
  // White fill
  ctx.fillStyle = '#fff';
  ctx.fillText(formattedAmount, 700, 150);
  
  // Draw "donated to" text
  ctx.font = 'bold 50px Arial, sans-serif';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 6;
  ctx.strokeText('donated to', 700, 220);
  ctx.fillStyle = '#fff';
  ctx.fillText('donated to', 700, 220);
  
  // Draw donor name
  ctx.font = 'bold 40px Arial, sans-serif';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 5;
  ctx.strokeText(`@${donorName}`, leftAvatarX, 320);
  ctx.fillStyle = '#fff';
  ctx.fillText(`@${donorName}`, leftAvatarX, 320);
  
  // Draw recipient name
  ctx.strokeText(`@${recipientName}`, rightAvatarX, 320);
  ctx.fillStyle = '#fff';
  ctx.fillText(`@${recipientName}`, rightAvatarX, 320);
  
  // Draw timestamp at the bottom with high visibility
  const dateText = `Donated on ${formatDate()}`;
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.strokeText(dateText, width / 2, height - 30);
  ctx.fillStyle = '#fff';
  ctx.fillText(dateText, width / 2, height - 30);
  
  return canvas.toBuffer('image/png');
}

module.exports = { generateDonationImage };
