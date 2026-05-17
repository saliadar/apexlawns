/* =========================================
   APEX LAWN & MAINTENANCE — Main JS
   =========================================

   EMAILJS SETUP (required for contact form):
   1. Go to https://www.emailjs.com and create a free account
   2. Add a Gmail service and note the Service ID
   3. Create an email template with these variables:
        {{from_name}}, {{from_phone}}, {{from_email}}, {{service}}, {{message}}
      Set the "To Email" in the template to: Apexlawngroup@gmail.com
   4. Copy your Public Key from Account > API Keys
   5. Replace the three placeholder values below
   ========================================= */

const EMAILJS_PUBLIC_KEY  = 'dK_PzFL8tZ4arIVgk';
const EMAILJS_SERVICE_ID  = 'service_oqelb48';
const EMAILJS_TEMPLATE_ID = 'template_r1oii5d';

/* ── Init EmailJS ── */
(function () {
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }
})();


/* ── Navbar: scroll shadow + active state ── */
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});


/* ── Mobile menu toggle ── */
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


/* ── Smooth scroll for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ── Fade-up scroll animations ── */
const fadeEls = document.querySelectorAll(
  '.service-card, .why-card, .gallery-item, .contact-item'
);
fadeEls.forEach(el => el.classList.add('fade-up'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings in the same grid
        const siblings = [...entry.target.parentElement.children];
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${idx * 80}ms`;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);
fadeEls.forEach(el => observer.observe(el));


/* ── Contact Form ── */
const contactForm = document.getElementById('contactForm');
const submitBtn   = document.getElementById('submitBtn');
const formStatus  = document.getElementById('formStatus');

contactForm.addEventListener('submit', function (e) {
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

  const templateParams = {
    from_name:  name,
    from_phone: phone,
    from_email: email,
    service:    service || 'Not specified',
    message:    message,
  };

  if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
    // Dev mode: simulate send so layout can be tested without real credentials
    setTimeout(() => {
      setLoading(false);
      showStatus(
        '✓ Your enquiry has been sent! Jamel will be in touch shortly.',
        'success'
      );
      contactForm.reset();
    }, 1200);
    return;
  }

  emailjs
    .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
    .then(() => {
      showStatus(
        '✓ Thank you! Your enquiry has been sent. We\'ll be in touch shortly.',
        'success'
      );
      contactForm.reset();
    })
    .catch((err) => {
      console.error('EmailJS error:', err);
      showStatus(
        'Something went wrong. Please call us on 0402 723 634 or email Apexlawngroup@gmail.com directly.',
        'error'
      );
    })
    .finally(() => {
      setLoading(false);
    });
});

function setLoading(loading) {
  submitBtn.disabled = loading;
  submitBtn.innerHTML = loading
    ? '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>'
    : '<span>Send Enquiry</span><i class="fas fa-paper-plane"></i>';
}

function showStatus(msg, type) {
  formStatus.textContent = msg;
  formStatus.className = 'form-status ' + type;
}

function clearStatus() {
  formStatus.textContent = '';
  formStatus.className = 'form-status';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

