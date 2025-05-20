document.addEventListener('DOMContentLoaded', () => {
  // Font cycle for looping typewriter effect
  const fonts = [
    'Courier Prime',
    'IBM Plex Mono',
    'VT323',
    'Source Code Pro'
  ];

  // Typewriter effect for .typing-text elements
  const typingElements = document.querySelectorAll('.typing-text');
  typingElements.forEach(element => {
    const text = element.getAttribute('data-title');
    let fontIndex = parseInt(element.getAttribute('data-font-index')) || 0;
    const isLooping = element.closest('#spline-lower') !== null;

    function typeWriter(index = 0, typing = true) {
      if (isLooping) {
        if (typing) {
          if (index <= text.length) {
            element.textContent = text.slice(0, index);
            setTimeout(() => typeWriter(index + 1, true), 150);
          } else {
            setTimeout(() => typeWriter(index, false), 2000);
          }
        } else {
          if (index >= 0) {
            element.textContent = text.slice(0, index);
            setTimeout(() => typeWriter(index - 1, false), 75);
          } else {
            fontIndex = (fontIndex + 1) % fonts.length;
            element.setAttribute('data-font-index', fontIndex);
            element.style.fontFamily = fonts[fontIndex];
            setTimeout(() => typeWriter(0, true), 200);
          }
        }
      } else {
        if (index <= text.length) {
          element.textContent = text.slice(0, index);
          setTimeout(() => typeWriter(index + 1, true), 150);
        } else {
          element.classList.add('static');
        }
      }
    }
    typeWriter();
  });

  // Theme Toggle and Spline URLs
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  const splineViewers = document.querySelectorAll('spline-viewer');
  const lightUrl = 'https://prod.spline.design/QF93hExmWxJjAxAW/scene.splinecode';
  const darkUrl = 'https://prod.spline.design/bPYHfwyVwULNcZok/scene.splinecode';

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.classList.add('dark');
    body.classList.remove('bg-white', 'text-black');
    body.classList.add('bg-gray-900', 'text-white');
  }
  updateSplineViewers();

  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark');
    const isDark = body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    body.classList.toggle('bg-white', !isDark);
    body.classList.toggle('text-black', !isDark);
    body.classList.toggle('bg-gray-900', isDark);
    body.classList.toggle('text-white', isDark);
    location.reload();
  });

  function updateSplineViewers() {
    const isDark = body.classList.contains('dark');
    splineViewers.forEach((viewer, index) => {
      viewer.setAttribute('url', isDark ? darkUrl : lightUrl);
      console.log(`Viewer ${index + 1} URL set to ${isDark ? 'dark' : 'light'} mode`);
    });
  }

  splineViewers.forEach((viewer, index) => {
    viewer.addEventListener('error', () => {
      console.error(`Spline viewer ${index + 1} failed to load`);
      const fallback = viewer.parentElement.querySelector('.fallback-image');
      if (fallback) fallback.classList.remove('hidden');
    });
  });

  // Starfield Animation
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    initStars();
  }

  function initStars() {
    stars = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 1.5 + 1.5,
        speed: Math.random() * 0.5 + 0.5,
        alpha: Math.random() * 0.3 + 0.7
      });
    }
  }

  function drawStar(x, y, radius, alpha) {
    ctx.save();
    ctx.beginPath();
    ctx.lineJoin = 'miter';
    const spikes = 5;
    const outerRadius = radius;
    const innerRadius = radius * 0.4;
    const isDark = document.body.classList.contains('dark');
    ctx.fillStyle = isDark
      ? `rgba(255, 255, 255, ${alpha})`
      : `rgba(0, 0, 0, ${alpha})`;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI / spikes) * i - Math.PI / 2;
      ctx.lineTo(
        x + r * Math.cos(angle),
        y + r * Math.sin(angle)
      );
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => {
      drawStar(star.x, star.y, star.radius, star.alpha);
      star.y += star.speed;
      if (star.y > window.innerHeight) star.y = 0;
    });
    requestAnimationFrame(animateStars);
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  animateStars();

  // Date, Time, and Weather
  const dateTimeWeather = document.getElementById('datetime-weather');
  async function updateDateTimeWeather() {
    const now = new Date();
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    const dateTime = now.toLocaleString('en-US', options);
    
    const apiKey = 'ad645f36d47c020a1a0c38b4ec97719d';
    const fallbackLocation = 'lat=40.7128&lon=-74.0060';
    let weatherData = null;

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      const { latitude, longitude } = position.coords;
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
      const response = await fetch(weatherUrl);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      weatherData = await response.json();
      console.log('Weather fetched for geolocation:', weatherData);
    } catch (geoError) {
      console.warn('Geolocation failed, falling back to NYC:', geoError.message);
      try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?${fallbackLocation}&appid=${apiKey}&units=metric`;
        const response = await fetch(weatherUrl);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        weatherData = await response.json();
        console.log('Weather fetched for NYC:', weatherData);
      } catch (weatherError) {
        console.error('Weather fetch failed:', weatherError.message);
        dateTimeWeather.textContent = `${dateTime} | Weather unavailable`;
        return;
      }
    }

    if (weatherData) {
      const city = weatherData.name;
      const temp = Math.round(weatherData.main.temp);
      const description = weatherData.weather[0].description;
      dateTimeWeather.textContent = `${dateTime} | ${city}, ${temp}°C, ${description}`;
    }
  }

  updateDateTimeWeather().catch((err) => {
    console.error('Initial weather update failed:', err);
    dateTimeWeather.textContent = `Time: ${new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })} | Weather unavailable`;
  });

  setInterval(() => {
    updateDateTimeWeather().catch((err) => {
      console.error('Periodic weather update failed:', err);
      dateTimeWeather.textContent = `Time: ${new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })} | Weather unavailable`;
    });
  }, 60000);

  // Smooth Scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Fade-In Animation
  const sections = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('opacity-100', 'translate-y-0');
        entry.target.classList.remove('opacity-0', 'translate-y-5');
      }
    });
  }, { threshold: 0.1 });
  sections.forEach(section => {
    section.classList.add('opacity-0', 'translate-y-5', 'transition', 'duration-600');
    observer.observe(section);
  });

  // Interactive Elements
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      button.classList.add('scale-95');
      setTimeout(() => button.classList.remove('scale-95'), 200);
    });
  });

  // Text Bubble Popups
  const textBubbles = document.querySelectorAll('.text-bubble, .service-item, .success-item, .team-item, .resource-item');
  textBubbles.forEach(bubble => {
    bubble.addEventListener('mouseenter', () => {
      const popup = bubble.querySelector('.bubble-popup');
      if (popup) {
        popup.classList.remove('hidden');
        console.log('Popup shown for', bubble.textContent);
      }
    });
    bubble.addEventListener('mouseleave', () => {
      const popup = bubble.querySelector('.bubble-popup');
      if (popup) popup.classList.add('hidden');
    });
    bubble.addEventListener('click', () => {
      const href = bubble.getAttribute('href') || bubble.querySelector('a')?.getAttribute('href');
      if (href) window.location.href = href;
    });
    bubble.addEventListener('keypress', e => {
      if (e.key === 'Enter') bubble.click();
    });
  });

  // Scroll-Based Overlay Adjustment
  const splineSections = document.querySelectorAll('#home, #subscribe, #spline-lower');
  window.addEventListener('scroll', () => {
    splineSections.forEach(section => {
      const overlay = section.querySelector('.spline-overlay');
      if (overlay) {
        const rect = section.getBoundingClientRect();
        const opacity = section.id === 'subscribe' ? 0.4 : 0.3;
        overlay.style.opacity = rect.top < window.innerHeight / 2 ? opacity + 0.2 : opacity;
        console.log(`${section.id} overlay opacity set to ${overlay.style.opacity}`);
      }
    });
  });

  // Form Submission Handling
  const forms = document.querySelectorAll('#subscribe .btn.signup-btn, #contact .btn:not([type="button"][textContent="Cancel"])');
  forms.forEach(button => {
    button.addEventListener('click', () => {
      const form = button.closest('.flex') || button.closest('.max-w-md');
      const email = form.querySelector('input[type="email"]').value;
      const name = form.querySelector('input[type="text"]')?.value;
      const message = form.querySelector('textarea')?.value;
      if (email && (!name || name) && (!message || message)) {
        console.log('Form submitted:', { name, email, message });
        alert('Form submitted successfully!'); // Replace with actual backend call
      } else {
        console.error('Form validation failed');
        alert('Please fill all required fields.');
      }
    });
  });

  // Leaflet Map
  const map = L.map('map').setView([40.7128, -74.0060], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  L.marker([40.7128, -74.0060]).addTo(map)
    .bindPopup('Stellar Consults<br>One World Trade Center')
    .openPopup();
});
