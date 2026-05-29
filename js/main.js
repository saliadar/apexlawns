/* =========================================
   APEX LAWN & MAINTENANCE — Main JS
   ========================================= */

const WEB3FORMS_KEY = '6c8ed4e6-643b-40e9-91bf-3f99ad593ad3';

const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

navToggle.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', closeMenu);
});

function closeMenu() {
  navMenu.classList.remove('open');
  navToggle.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

const fadeEls = document.querySelectorAll('.service-card, .why-card, .carousel-wrapper, .contact-item');
fadeEls.forEach(el => el.classList.add('fade-up'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const siblings = [...entry.target.parentElement.children];
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${idx * 80}ms`;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
fadeEls.forEach(el => observer.observe(el));

const contactForm = document.getElementById('contactForm');
const submitBtn   = document.getElementById('submitBtn');
const formStatus  = document.getElementById('formStatus');

contactForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const name    = document.getElementById('name').value.trim();
  const phone   = document.getElementById('phone').value.trim();
  const email   = document.getElementById('email').value.trim();
  const service = document.getElementById('service').value;
  const message = document.getElementById('message').value.trim();

  if (!name || !phone || !email || !message) {
    showStatus('Please fill in all required fields.', 'error');
    return;
  }
  if (!isValidEmail(email)) {
    showStatus('Please enter a valid email address.', 'error');
    return;
  }

  setLoading(true);
  clearStatus();

  try {
    const formData = new FormData();
    formData.append('access_key', WEB3FORMS_KEY);
    formData.append('subject', 'New Quote Enquiry from ' + name);
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('email', email);
    formData.append('service', service || 'Not specified');
    formData.append('message', message);

    const res  = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
    const data = await res.json();

    if (data.success) {
      showStatus('✓ Thank you! Your enquiry has been sent. We\'ll be in touch shortly.', 'success');
      contactForm.reset();
    } else {
      throw new Error(data.message || 'Submission failed');
    }
  } catch (err) {
    showStatus('Something went wrong. Please call us on 0402 723 634 or email Apexlawngroup@gmail.com directly.', 'error');
  } finally {
    setLoading(false);
  }
});

function setLoading(loading) {
  submitBtn.disabled = loading;
  submitBtn.innerHTML = loading
    ? '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>'
    : '<span>Claim 20% OFF — Send Enquiry</span><i class="fas fa-paper-plane"></i>';
}
function showStatus(msg, type) { formStatus.textContent = msg; formStatus.className = 'form-status ' + type; }
function clearStatus() { formStatus.textContent = ''; formStatus.className = 'form-status'; }
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

(function () {
  const track    = document.getElementById('carouselTrack');
  const dotsWrap = document.getElementById('carouselDots');
  const prevBtn  = document.getElementById('carouselPrev');
  const nextBtn  = document.getElementById('carouselNext');
  if (!track || !dotsWrap || !prevBtn || !nextBtn) return;

  const slides = Array.from(track.children);
  const total  = slides.length;
  let current  = 0;
  let timer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', () => { goTo(i); resetTimer(); });
    dotsWrap.appendChild(dot);
  });

  function goTo(idx) {
    const dots = dotsWrap.querySelectorAll('.dot');
    dots[current].classList.remove('active');
    current = ((idx % total) + total) % total;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    dots[current].classList.add('active');
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); resetTimer(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); resetTimer(); });

  function startTimer() { timer = setInterval(() => goTo(current + 1), 4500); }
  function resetTimer()  { clearInterval(timer); startTimer(); }

  track.closest('.carousel-wrapper').addEventListener('mouseenter', () => clearInterval(timer));
  track.closest('.carousel-wrapper').addEventListener('mouseleave', () => startTimer());

  let touchX = 0;
  track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = touchX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) { dx > 0 ? goTo(current + 1) : goTo(current - 1); resetTimer(); }
  }, { passive: true });

  startTimer();
})();
