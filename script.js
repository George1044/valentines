// Fleeing No animation, static Yes, Confetti explosion
const yes = document.getElementById('yes');
const no = document.getElementById('no');
const confettiCanvas = document.getElementById('confetti');
const ctx = confettiCanvas.getContext && confettiCanvas.getContext('2d');

let noMoveCount = 0;
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let yesPos = { x: window.innerWidth * 0.32, y: window.innerHeight * 0.52 };
let noPos = { x: window.innerWidth * 0.68, y: window.innerHeight * 0.52 };
let noIsMoving = false;

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    confettiCanvas.width = Math.round(window.innerWidth * dpr);
    confettiCanvas.height = Math.round(window.innerHeight * dpr);
    confettiCanvas.style.width = window.innerWidth + 'px';
    confettiCanvas.style.height = window.innerHeight + 'px';
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function setPos(el, pos) {
    // clamp so element stays fully inside the viewport
    const halfW = el.offsetWidth / 2;
    const halfH = el.offsetHeight / 2;
    pos.x = clamp(pos.x, halfW + 8, window.innerWidth - halfW - 8);
    pos.y = clamp(pos.y, halfH + 8, window.innerHeight - halfH - 8);
    el.style.left = (pos.x - halfW) + 'px';
    el.style.top = (pos.y - halfH) + 'px';
}

function placeButtonsInit() {
    // use fixed positioning so coordinates are viewport-based
    yes.style.position = 'fixed';
    no.style.position = 'fixed';
    // place in initial spots after layout
    requestAnimationFrame(() => {
        setPos(yes, yesPos);
        setPos(no, noPos);
    });
}

document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function animateNoTo(targetX, targetY, duration = 420) {
    if (noIsMoving) return; // avoid interrupting
    noIsMoving = true;
    const startX = noPos.x, startY = noPos.y;
    const start = performance.now();
    const endX = clamp(targetX, no.offsetWidth / 2 + 8, window.innerWidth - no.offsetWidth / 2 - 8);
    const endY = clamp(targetY, no.offsetHeight / 2 + 8, window.innerHeight - no.offsetHeight / 2 - 8);

    function easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }

    function step(now) {
        const t = clamp((now - start) / duration, 0, 1);
        const eased = easeOutQuad(t);
        noPos.x = startX + (endX - startX) * eased;
        noPos.y = startY + (endY - startY) * eased;
        setPos(no, noPos);
        if (t < 1) requestAnimationFrame(step);
        else { noIsMoving = false; }
    }
    requestAnimationFrame(step);
    noMoveCount++;
    if (noMoveCount >= 5) {
        // show image popup briefly, then remove the No button so only Yes remains
        setTimeout(() => { revealPopupAndRemoveNo(); }, 300);
    }
}

function moveNoAwayFromMouse() {
    // compute vector from mouse to no center
    const rect = no.getBoundingClientRect();
    const noCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    let dx = noCenter.x - mouse.x;
    let dy = noCenter.y - mouse.y;
    if (Math.hypot(dx, dy) < 10) {
        // random direction if overlap
        const a = Math.random() * Math.PI * 2;
        dx = Math.cos(a); dy = Math.sin(a);
    }
    const len = Math.hypot(dx, dy) || 1;
    let dirX = dx / len, dirY = dy / len;

    // if button is close to an edge, prefer moving toward the center so it doesn't try to escape off-screen
    const edgeThreshold = 100; // px
    const distLeft = noCenter.x;
    const distRight = window.innerWidth - noCenter.x;
    const distTop = noCenter.y;
    const distBottom = window.innerHeight - noCenter.y;
    const minDistToEdge = Math.min(distLeft, distRight, distTop, distBottom);
    if (minDistToEdge < edgeThreshold) {
        const centerX = window.innerWidth / 2, centerY = window.innerHeight / 2;
        const toCenterX = centerX - noCenter.x, toCenterY = centerY - noCenter.y;
        const toCenterLen = Math.hypot(toCenterX, toCenterY) || 1;
        // if current direction points away from center (dot < 0), switch to center direction
        const dot = dirX * toCenterX + dirY * toCenterY;
        if (dot < 0) {
            dirX = toCenterX / toCenterLen;
            dirY = toCenterY / toCenterLen;
        }
    }

    const moveDistance = 160 + Math.random() * 140;
    const targetX = noPos.x + dirX * moveDistance;
    const targetY = noPos.y + dirY * moveDistance;
    animateNoTo(targetX, targetY, 420);
}

no.addEventListener('mouseenter', moveNoAwayFromMouse);
no.addEventListener('click', (e) => { e.stopPropagation(); moveNoAwayFromMouse(); });
// also trigger on mousedown for snappier responses
no.addEventListener('mousedown', (e) => { e.stopPropagation(); moveNoAwayFromMouse(); });

yes.addEventListener('click', () => {
    explodeConfetti(mouse.x, mouse.y);
    document.querySelector('.note').textContent = 'Yay! 🎉';
    // remove the Yes button so only the happy gif remains
    try { yes.remove(); } catch (e) { yes.style.display = 'none'; }
    // also remove the No button if present
    try { const n = document.getElementById('no'); if (n) n.remove(); } catch (e) { if (no) no.style.display = 'none'; }
    // show centered happy gif (default file: happy-happy-cat.gif)
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    const img = document.createElement('img');
    img.className = 'popup-image yes-popup-image';
    img.src = window.YES_POPUP_IMAGE_SRC || 'happy-happy-cat.gif';
    img.alt = 'Yay';
    overlay.appendChild(img);
    document.body.appendChild(overlay);
    // remove overlay after a few seconds
    setTimeout(() => { overlay.remove(); }, 4000);
});

function explodeConfetti(x = window.innerWidth / 2, y = window.innerHeight / 2) {
    if (!ctx) return;
    resizeCanvas();
    const colors = ['#ff5c8a', '#ffd166', '#6bc5ff', '#a78bfa', '#ff9f43', '#3de7c9'];
    let particles = [];
    const count = 220;
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 1.2) * 14,
            size: 6 + Math.random() * 8,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 0, ttl: 80 + Math.random() * 80
        });
    }
    let frame = 0;
    function draw() {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        for (let p of particles) {
            p.vy += 0.35; p.vx *= 0.995;
            p.x += p.vx; p.y += p.vy; p.life++;
        }
        for (let p of particles) {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        particles = particles.filter(p => p.life < p.ttl && p.y < window.innerHeight + 50);
        frame++;
        if (particles.length > 0 && frame < 600) requestAnimationFrame(draw);
        else ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
    draw();
}

function revealPopupAndRemoveNo() {
    const existing = document.getElementById('no');
    if (!existing) return;
    // show a local image popup (default to cat_gun.ong), then remove the No button
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    const imgSrc = window.POPUP_IMAGE_SRC || 'cat_gun.png';
    const content = document.createElement('div');
    content.className = 'popup-content';
    const text = document.createElement('div');
    text.className = 'popup-text';
    text.textContent = 'Stop messing with me';
    const img = document.createElement('img');
    img.className = 'popup-image';
    img.src = imgSrc;
    img.alt = 'Surprise';
    content.appendChild(text);
    content.appendChild(img);
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // remove overlay and the No button after a short delay
    setTimeout(() => {
        overlay.remove();
        const n = document.getElementById('no');
        if (n) n.remove();
    }, 2200);
}

window.addEventListener('resize', () => { resizeCanvas(); });
window.addEventListener('load', () => { resizeCanvas(); placeButtonsInit(); });

// keep buttons clamped on resize
window.addEventListener('resize', () => {
    setPos(yes, yesPos);
    setPos(no, noPos);
});
