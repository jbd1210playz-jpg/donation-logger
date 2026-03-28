const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const axios = require('axios');

const ICONS = {
  PURE_PURPLE: "https://cdn.discordapp.com/attachments/1470491771363393778/1472467289151508703/output-onlinepngtools_1.png?ex=69989c46&is=69974ac6&hm=fd761cd52fbda719981d6065d8d6ef198e8d971303c9229c733e6b011e581267",
  SLIGHT_PURPLE: "https://media.discordapp.net/attachments/1470491771363393778/1472500932079128656/output-onlinepngtools_6.png?ex=6998bb9b&is=69976a1b&hm=4e51d99521095414378bcd48eb8d97dcdadcb69124dd7472e8d4e2cf99d626b2&=&format=webp&quality=lossless",
  RED: "https://cdn.discordapp.com/attachments/1470491771363393778/1472467370445639820/output-onlinepngtools_3.png?ex=69989c5a&is=69974ada&hm=5e1f71e8f8b95d1da36b4ace8f3e8f9e394c9b355a167f87b2e218c6763c19a6"
};

const FONT_URL = "https://st.1001fonts.net/download/font/montserrat.medium.ttf";

let fontLoaded = false;

async function setupFonts() {
  if (fontLoaded) return;
  try {
    const response = await axios.get(FONT_URL, { responseType: 'arraybuffer' });
    GlobalFonts.register(Buffer.from(response.data), 'CustomFont');
    console.log("✅ Final Font Loaded");
    fontLoaded = true;
  } catch (e) {
    console.error("Font failed:", e);
  }
}

async function fetchImage(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  return await loadImage(Buffer.from(res.data));
}

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

// Generate donation image with transparent background and gradient fade
async function generateDonationImage(donorName, donorUserId, recipientName, recipientUserId, amount, message) {
  // Ensure fonts are loaded
  await setupFonts();
  
  // Clean usernames
  const cleanDonor = donorName.replace('@', '');
  const cleanRecipient = recipientName.replace('@', '');
  
  // Determine tier and config
  const amt = Number(amount);
  let config = {};
  
  if (amt >= 100000 && amt < 1000000) {
    config = { ringColor: '#DD00FF', textColor: '#DD00FF', icon: ICONS.PURE_PURPLE };
  } else if (amt >= 1000000 && amt < 10000000) {
    config = { ringColor: '#FF00FF', textColor: '#FF00FF', icon: ICONS.SLIGHT_PURPLE };
  } else {
    config = { ringColor: '#FF1414', textColor: '#FF1414', icon: ICONS.RED };
  }
  
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
  
  // Helper function for perfect text
  const drawPerfectText = (text, x, y, color, size, align = 'center', stroke = 4) => {
    ctx.font = `${size}px ${fontLoaded ? 'CustomFont' : 'Arial, sans-serif'}`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = stroke;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  };
  
  // Load avatar images
  let donorAvatar, recipientAvatar, iconImage;
  
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
  
  try {
    iconImage = await fetchImage(config.icon);
  } catch (error) {
    console.warn('Failed to load icon:', error);
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
  
  // Tier-based colored border for donor avatar
  ctx.strokeStyle = config.ringColor;
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
  
  // Tier-based colored border for recipient avatar
  ctx.strokeStyle = config.ringColor;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(rightAvatarX, avatarY, avatarSize, 0, Math.PI * 2);
  ctx.stroke();
  
  // Draw icon above amount
  if (iconImage) {
    const iconSize = 70;
    ctx.drawImage(iconImage, 700 - iconSize / 2, 40, iconSize, iconSize);
  }
  
  // Draw amount with tier-based color
  const amountText = formatNumber(amt);
  drawPerfectText(amountText, 700, 140, config.textColor, 90, 'center', 8);
  
  // Draw "donated to" text
  drawPerfectText('donated to', 700, 220, '#FFFFFF', 50, 'center', 6);
  
  // Draw donor name
  drawPerfectText(`@${cleanDonor}`, leftAvatarX, 320, '#FFFFFF', 40, 'center', 5);
  
  // Draw recipient name
  drawPerfectText(`@${cleanRecipient}`, rightAvatarX, 320, '#FFFFFF', 40, 'center', 5);
  
  // Draw timestamp at the bottom with high visibility
  const dateText = `Donated on ${formatDate()}`;
  drawPerfectText(dateText, width / 2, height - 30, '#FFFFFF', 24, 'center', 4);
  
  return canvas.toBuffer('image/png');
}

module.exports = { generateDonationImage };
