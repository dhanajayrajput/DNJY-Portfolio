// ── PARTICLE PHYSICS & MASK REVEAL ENGINE ──
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
const hero = document.querySelector('.hero');

let particlesArray = [];
const mouse = { x: null, y: null, radius: 110 };

function resizeCanvas() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

    const heroRect = hero.getBoundingClientRect();
    if (e.clientY >= heroRect.top && e.clientY <= heroRect.bottom) {
        hero.style.setProperty('--mouse-x', `${e.clientX - heroRect.left}px`);
        hero.style.setProperty('--mouse-y', `${e.clientY - heroRect.top}px`);
    }
});

window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.baseSize = Math.random() * 1.1 + 0.6;
        this.size = this.baseSize;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
    }
    draw() {
        const isDark = document.body.classList.contains('dark-theme');
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.14)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
    update() {
        this.baseX += this.vx;
        this.baseY += this.vy;

        if (this.baseX < 0 || this.baseX > canvas.width) this.vx *= -1;
        if (this.baseY < 0 || this.baseY > canvas.height) this.vy *= -1;

        if (mouse.x !== null && mouse.y !== null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.hypot(dx, dy);

            if (distance < mouse.radius) {
                let force = (mouse.radius - distance) / mouse.radius;
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;

                this.x -= forceDirectionX * force * 6;
                this.y -= forceDirectionY * force * 6;
                this.size = this.baseSize + (force * 6.5);
            } else {
                this.x += (this.baseX - this.x) * 0.08;
                this.y += (this.baseY - this.y) * 0.08;
                this.size += (this.baseSize - this.size) * 0.08;
            }
        } else {
            this.x += (this.baseX - this.x) * 0.08;
            this.y += (this.baseY - this.y) * 0.08;
            this.size += (this.baseSize - this.size) * 0.08;
        }
    }
}

function initParticles() {
    particlesArray = [];
    const numberOfParticles = (canvas.width * canvas.height) / 450;
    for (let i = 0; i < numberOfParticles; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        particlesArray.push(new Particle(x, y));
    }
}
initParticles();

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].draw();
        particlesArray[i].update();
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();

// Hollow Ring Cursor Track Interface
const cursor = document.querySelector('.cursor');
document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

document.querySelectorAll('.project-card, .ui-project-card, .btn, .control-circle-btn, .download-btn, .close-panel-btn, .clear-btn').forEach(el => {
    el.addEventListener('mouseenter', () => {
        if (el.classList.contains('project-card') || el.classList.contains('ui-project-card')) {
            cursor.classList.add('active');
            cursor.innerHTML = 'View Work';
        } else {
            cursor.style.transform = 'translate(-50%,-50%) scale(1.4)';
            cursor.style.background = 'rgba(128,128,128,0.15)';
        }
    });
    el.addEventListener('mouseleave', () => {
        cursor.classList.remove('active');
        cursor.innerHTML = '';
        cursor.style.transform = 'translate(-50%,-50%) scale(1)';
        cursor.style.background = 'transparent';
    });
});

// Accordion Control Configurations 
const items = document.querySelectorAll('.accordion-item');
items.forEach(item => {
    item.addEventListener('mouseenter', () => {
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    });
});
document.querySelector('.accordion').addEventListener('mouseleave', () => {
    items.forEach(i => i.classList.remove('active'));
    items[0].classList.add('active');
});

// Theme Switcher System Module
document.getElementById('theme-switch-trigger').addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
});

// Side Panel Interactivity Logic (Resume & Projects)
const resumePanel = document.getElementById('resume-panel-container');
document.getElementById('open-resume-trigger').addEventListener('click', () => {
    resumePanel.classList.add('open');
    document.body.style.overflow = 'hidden';
});
document.getElementById('close-resume-trigger').addEventListener('click', () => {
    resumePanel.classList.remove('open');
    document.body.style.overflow = 'auto';
});

const projectsPanel = document.getElementById('projects-panel-container');
document.getElementById('open-projects-trigger').addEventListener('click', () => {
    projectsPanel.classList.add('open');
    document.body.style.overflow = 'hidden';
});
document.getElementById('close-projects-trigger').addEventListener('click', () => {
    projectsPanel.classList.remove('open');
    document.body.style.overflow = 'auto';
});

// ── INFINITE DECK SHUFFLE ANIMATION MODULE ──
document.querySelectorAll('.ui-project-card').forEach(card => {
    let shuffleInterval;
    const stack = card.querySelector('.card-image-stack');
    const images = Array.from(stack.querySelectorAll('.stack-img'));

    const resetStack = () => {
        images.forEach((img, i) => {
            img.className = `stack-img pos-${i}`;
        });
    };
    resetStack(); // Initial alignment

    card.addEventListener('mouseenter', () => {
        shuffleInterval = setInterval(() => {
            // Loop classes forward (pos-3 becomes pos-0, etc.)
            const currentClasses = images.map(img => img.className);
            const lastClass = currentClasses.pop();
            currentClasses.unshift(lastClass);

            images.forEach((img, i) => {
                img.className = currentClasses[i];
            });
        }, 750); // Shuffle speed timer
    });

    card.addEventListener('mouseleave', () => {
        clearInterval(shuffleInterval);
        resetStack();
    });
});

// ── PROJECT FILTERING MODULE ──
const filterType = document.getElementById('filter-type');
const filterRole = document.getElementById('filter-role');
const filterDuration = document.getElementById('filter-duration');
const projectCards = document.querySelectorAll('.project-card-item');

function applyFilters() {
    const typeVal = filterType.value;
    const roleVal = filterRole.value;
    const durVal = filterDuration.value;

    projectCards.forEach(card => {
        const matchType = typeVal === 'all' || card.getAttribute('data-type') === typeVal;
        const matchRole = roleVal === 'all' || card.getAttribute('data-role') === roleVal;
        const matchDur = durVal === 'all' || card.getAttribute('data-duration') === durVal;

        if (matchType && matchRole && matchDur) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

filterType.addEventListener('change', applyFilters);
filterRole.addEventListener('change', applyFilters);
filterDuration.addEventListener('change', applyFilters);

document.getElementById('clear-filters-btn').addEventListener('click', () => {
    filterType.value = 'all';
    filterRole.value = 'all';
    filterDuration.value = 'all';
    applyFilters();
});
