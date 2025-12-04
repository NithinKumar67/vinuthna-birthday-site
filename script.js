// ========== CONFIG ==========
const API_URL = "https://birthday-backend-en92.onrender.com"; 
// change when you host backend

// ========== IMAGE SLIDER ==========
const slides = document.querySelectorAll(".slide");
const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");
const dotsContainer = document.querySelector(".slider-dots");

let currentIndex = 0;

if (slides.length > 0 && prevBtn && nextBtn && dotsContainer) {
  // Create dots
  slides.forEach((_, idx) => {
    const dot = document.createElement("div");
    dot.classList.add("dot");
    if (idx === 0) dot.classList.add("active");
    dot.addEventListener("click", () => goToSlide(idx));
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll(".slider-dots .dot");

  function updateSlider() {
    slides.forEach((slide, idx) => {
      slide.classList.toggle("active", idx === currentIndex);
    });
    dots.forEach((dot, idx) => {
      dot.classList.toggle("active", idx === currentIndex);
    });
  }

  function goToSlide(index) {
    if (index < 0) {
      currentIndex = slides.length - 1;
    } else if (index >= slides.length) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }
    updateSlider();
  }

  prevBtn.addEventListener("click", () => goToSlide(currentIndex - 1));
  nextBtn.addEventListener("click", () => goToSlide(currentIndex + 1));

  // Auto-play
  let autoPlay = setInterval(() => goToSlide(currentIndex + 1), 5000);

  const slider = document.querySelector(".slider");
  slider.addEventListener("mouseenter", () => clearInterval(autoPlay));
  slider.addEventListener("mouseleave", () => {
    autoPlay = setInterval(() => goToSlide(currentIndex + 1), 5000);
  });
}

// ========== FADE-IN ON SCROLL ==========
const fadeEls = document.querySelectorAll(".fade-in");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

fadeEls.forEach((el) => observer.observe(el));

// ========== MUSIC TOGGLE ==========
const music = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");
let isPlaying = false;

if (musicToggle && music) {
  musicToggle.addEventListener("click", async () => {
    try {
      if (!isPlaying) {
        await music.play();
        isPlaying = true;
        musicToggle.textContent = "Pause Music ⏸";
      } else {
        music.pause();
        isPlaying = false;
        musicToggle.textContent = "Play Music ▶️";
      }
    } catch (err) {
      console.error("Playback error:", err);
    }
  });
}

// ========== WISHES FRONTEND + WISH SLIDER ==========
const nameInput = document.getElementById("wish-name");
const messageInput = document.getElementById("wish-message");
const submitBtn = document.getElementById("wish-submit-btn");
const statusEl = document.getElementById("wish-status");
const allWishesContainer = document.getElementById("all-wishes");
const wishSliderInner = document.getElementById("wish-slider-inner");

let wishSlides = [];
let wishSlideIndex = 0;
let wishSliderInterval = null;

async function loadWishes() {
  if (!allWishesContainer || !wishSliderInner) return;

  try {
    const res = await fetch(`${API_URL}/api/wishes`);
    const wishes = await res.json();

    // render all wishes list
    allWishesContainer.innerHTML = "";
    wishes.forEach((w) => {
      const card = document.createElement("div");
      card.className = "wish-card";
      card.innerHTML = `
        <h4>${escapeHtml(w.name)}</h4>
        <p>${escapeHtml(w.message)}</p>
      `;
      allWishesContainer.appendChild(card);
    });

    // slider
    wishSliderInner.innerHTML = "";
    wishes.slice(0, 10).forEach((w, idx) => {
      const slide = document.createElement("div");
      slide.className = "wish-slide" + (idx === 0 ? " active" : "");
      slide.innerHTML = `
        <div><strong>${escapeHtml(w.name)}</strong> says:</div>
        <div>${escapeHtml(w.message)}</div>
      `;
      wishSliderInner.appendChild(slide);
    });

    wishSlides = Array.from(document.querySelectorAll(".wish-slide"));
    wishSlideIndex = 0;
    if (wishSliderInterval) clearInterval(wishSliderInterval);
    if (wishSlides.length > 1) {
      wishSliderInterval = setInterval(() => rotateWishSlide(), 4000);
    }
  } catch (err) {
    console.error("Error loading wishes:", err);
  }
}

function rotateWishSlide() {
  if (wishSlides.length === 0) return;
  wishSlides.forEach((slide, idx) => {
    slide.classList.toggle("active", idx === wishSlideIndex);
  });
  wishSlideIndex = (wishSlideIndex + 1) % wishSlides.length;
}

async function sendWish() {
  if (!nameInput || !messageInput || !statusEl) return;

  const name = nameInput.value.trim();
  const message = messageInput.value.trim();

  if (!name || !message) {
    statusEl.textContent = "Please fill both name and message.";
    return;
  }

  statusEl.textContent = "Sending...";
  try {
    const res = await fetch(`${API_URL}/api/wishes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed");
    }

    statusEl.textContent = "Wish sent 🎉";
    nameInput.value = "";
    messageInput.value = "";
    loadWishes();
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error sending wish. Try again.";
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

if (submitBtn) submitBtn.addEventListener("click", sendWish);

// Load wishes on start
loadWishes();

// ========== Floating hearts animation ==========
function createHeart() {
  const heart = document.createElement("div");
  heart.className = "floating-heart";
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.top = "100vh";
  heart.style.animationDuration = 3 + Math.random() * 3 + "s";
  document.getElementById("hearts-container").appendChild(heart);
  setTimeout(() => heart.remove(), 6000);
}

function createBalloon() {
  const balloon = document.createElement("div");
  balloon.className = "balloon";
  balloon.style.left = Math.random() * 100 + "vw";
  balloon.style.animationDuration = 4 + Math.random() * 4 + "s";
  document.body.appendChild(balloon);
  setTimeout(() => balloon.remove(), 8000);
}
setInterval(createBalloon, 1500);
setInterval(createHeart, 1200);

// ========== Fireworks Background ==========
console.log("Canvas:", document.getElementById("fireworks"));
const canvasFW = document.getElementById("fireworks");
const ctxFW = canvasFW.getContext("2d");

function resizeFW() {
  canvasFW.width = window.innerWidth;
  canvasFW.height = window.innerHeight;
}
resizeFW();
window.addEventListener("resize", resizeFW);

class Particle {
  constructor(x, y, color, velocity) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
    this.friction = 0.98;
    this.gravity = 0.015;
  }
  update() {
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    this.velocity.y += this.gravity;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.015;
  }
  draw() {
    ctxFW.save();
    ctxFW.globalAlpha = this.alpha;
    ctxFW.beginPath();
    ctxFW.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctxFW.fillStyle = this.color;
    ctxFW.fill();
    ctxFW.restore();
  }
}

let particles = [];

function explode(x, y) {
  const count = 80;
  const angleStep = (Math.PI * 2) / count;
  for (let i = 0; i < count; i++) {
    particles.push(
      new Particle(x, y,
        `hsl(${Math.random() * 360}, 70%, 60%)`,
        {
          x: Math.cos(angleStep * i) * (Math.random() * 4 + 2),
          y: Math.sin(angleStep * i) * (Math.random() * 4 + 2)
        }
      )
    );
  }
}

function animateFW() {
  requestAnimationFrame(animateFW);
  ctxFW.clearRect(0, 0, canvasFW.width, canvasFW.height);
  particles.forEach((p, index) => {
    if (p.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      p.update();
      p.draw();
    }
  });
}

animateFW();

setInterval(() => {
  explode(Math.random() * canvasFW.width, Math.random() * canvasFW.height / 2);
}, 800);

// ========== Music popup ==========
const musicPopup = document.getElementById("music-popup");
const musicYes = document.getElementById("music-yes");
const musicNo = document.getElementById("music-no");

window.addEventListener("load", () => {
  if (!musicPopup) return;
  setTimeout(() => {
    musicPopup.classList.remove("hidden");
  }, 600);
});

if (musicYes && music && musicPopup) {
  musicYes.onclick = () => {
    music.play();
    musicPopup.classList.add("hidden");
    isPlaying = true;
    if (musicToggle) musicToggle.textContent = "Pause Music ⏸";
  };
}

if (musicNo && music && musicPopup) {
  musicNo.onclick = () => {
    music.pause();
    musicPopup.classList.add("hidden");
    isPlaying = false;
    if (musicToggle) musicToggle.textContent = "Play Music ▶️";
  };
}

// ========== Countdown Timer ==========
function countdownTimer() {
  const countdownEl = document.getElementById("countdown");
  if (!countdownEl) return;

  const eventDay = new Date("dec 5, 2025 00:00:00").getTime();
  const now = new Date().getTime();
  const diff = eventDay - now;

  if (diff <= 0) {
    countdownEl.innerHTML = "🎉 Happy Birthday Princess! 🎉";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  countdownEl.innerHTML =
    `⏳ ${days}d ${hours}h ${minutes}m ${seconds}s until Birthday 💖`;
}

setInterval(countdownTimer, 1000);
countdownTimer();

// ========== Typing animation ==========
const typingElement = document.getElementById("typing-text");
const phrases = [
  "Today the world shines brighter ✨",
  "Our beautiful princess turns 19 👑",
  "You are loved more than words 💖"
];

let phraseIndex = 0;
let charIndex = 0;
let deleting = false;

function typeEffect() {
  if (!typingElement) return;

  const currentPhrase = phrases[phraseIndex];

  if (!deleting) {
    typingElement.textContent = currentPhrase.slice(0, charIndex + 1);
    charIndex++;

    if (charIndex === currentPhrase.length) {
      deleting = true;
      setTimeout(typeEffect, 1600);
      return;
    }
  } else {
    typingElement.textContent = currentPhrase.slice(0, charIndex - 1);
    charIndex--;

    if (charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  }

  setTimeout(typeEffect, deleting ? 60 : 90);
}

typeEffect();

