function getDarkText(hex) {
  const r = parseInt(hex.slice(1,3),16) * 0.35;
  const g = parseInt(hex.slice(3,5),16) * 0.35;
  const b = parseInt(hex.slice(5,7),16) * 0.35;
  return `rgb(${~~r},${~~g},${~~b})`;
}

const canvas = document.getElementById('wheel-canvas');
const ctx = canvas.getContext('2d');
const displayText = document.getElementById('display-text');
const spinBtn = document.getElementById('spin-btn');

const N = options.length;
const SLICE = (2 * Math.PI) / N;
const CX = 240, CY = 240, R = 226, INNER = 30;

let currentAngle = 0;
let spinning = false;
let lastHighlighted = -1;

function getSliceAtPointer(angle) {
  const norm = (((-Math.PI / 2) - angle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
  return Math.floor(norm / SLICE) % N;
}

function lighten(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgb(${Math.min(255,r+40)},${Math.min(255,g+40)},${Math.min(255,b+40)})`;
}

function drawWheel(angle) {
  ctx.clearRect(0, 0, 480, 480);
  const highlighted = getSliceAtPointer(angle);

  for (let i = 0; i < N; i++) {
    const startA = angle + i * SLICE;
    const endA = startA + SLICE;
    const midA = startA + SLICE / 2;
    const bright = i === highlighted;
    const color = COLORS[i];

    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.arc(CX, CY, R, startA, endA);
    ctx.closePath();
    ctx.fillStyle = bright ? lighten(color) : color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();

    const label = options[i];
    const fontSize = label.length > 13 ? 8.5 : label.length > 10 ? 9.5 : label.length > 7 ? 10.5 : 11.5;

    ctx.save();
    ctx.translate(CX, CY);
    ctx.rotate(midA);
    ctx.font = `500 ${fontSize}px var(--font-sans, sans-serif)`;
    ctx.fillStyle = getDarkText(color);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    // Position text starting near the outer border instead of center
    ctx.fillText(label, R - 10, 0);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(CX, CY, R, 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(200,200,200,0.6)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(CX, CY, INNER, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = 'rgba(180,180,180,0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const pw = 10, ph = 22;
  ctx.save();
  ctx.translate(CX, CY);
  ctx.beginPath();
  ctx.moveTo(0, -(INNER - 2));          
  ctx.lineTo(-pw / 2, -(INNER - 2) + ph); 
  ctx.lineTo( pw / 2, -(INNER - 2) + ph); 
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = 'rgba(160,160,160,0.7)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  ctx.font = '16px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🍽️', CX, CY + 8);

  return highlighted;
}

function updateDisplay(idx) {
  if (idx !== lastHighlighted) {
    displayText.textContent = options[idx];
    lastHighlighted = idx;
  }
}

drawWheel(currentAngle);

spinBtn.addEventListener('click', () => {
  if (spinning) return;
  spinning = true;
  spinBtn.disabled = true;
  displayText.textContent = '...';
  lastHighlighted = -1;

  const extraSpins = 6 + Math.random() * 5;
  const landAngle = Math.random() * 2 * Math.PI;
  const totalRotation = extraSpins * 2 * Math.PI + landAngle;
  const duration = 4500 + Math.random() * 1500;
  const startTime = performance.now();
  const startAngle = currentAngle;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3.5); }

  function frame(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    currentAngle = startAngle + totalRotation * easeOut(t);
    const highlighted = drawWheel(currentAngle);
    updateDisplay(highlighted);

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      currentAngle = startAngle + totalRotation;
      const final = drawWheel(currentAngle);
      displayText.textContent = options[final];
      displayText.style.color = getDarkText(COLORS[final]);
      setTimeout(() => { displayText.style.color = ''; }, 1500);
      spinning = false;
      spinBtn.disabled = false;
    }
  }

  requestAnimationFrame(frame);
});