// Generate donation image with tier-based styling
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
      robuxIcon: '#ff00ff'
    },
    epic: {
      bg1: '#ff69b4',  // Hot pink
      bg2: '#ff1493',  // Deep pink
      border: '#ff00ff',
      text: '#ff00ff',
      robuxIcon: '#ff00ff'
    },
    legendary: {
      bg1: '#ff6347',  // Tomato red
      bg2: '#ff4500',  // Orange red
      border: '#ff0000',
      text: '#ff0000',
      robuxIcon: '#ff0000'
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
  ctx.strokeStyle = tier === 'common' ? '#fff' : '#000';
  ctx.lineWidth = 5;
  ctx.strokeText(`@${donorName}`, 220, 320);
  ctx.fillStyle = '#000';
  ctx.fillText(`@${donorName}`, 220, 320);
  
  // Draw recipient name
  ctx.strokeText(`@${recipientName}`, 1180, 320);
  ctx.fillStyle = '#000';
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
  ctx.fillStyle = '#000';
  ctx.fillText(dateText, width / 2, height - 20);
  
  return canvas.toBuffer('image/png');
}
