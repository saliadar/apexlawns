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
  '.service-card, .why-card, .carousel-wrapper, .contact-item'
);
fadeEls.forEach(el => el.classList.add('fade-up'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
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
const contactForm     = document.getElementById('contactForm');
const submitBtn       = document.getElementById('submitBtn');
const formStatus      = document.getElementById('formStatus');
const fileInput       = document.getElementById('photos');
const filePreview     = document.getElementById('filePreview');
const fileUploadLabel = document.getElementById('fileUploadLabel');

/* File preview management */
let selectedFiles = [];

function updateFileInput() {
  const dt = new DataTransfer();
  selectedFiles.forEach(f => dt.items.add(f));
  fileInput.files = dt.files;
}

function renderPreviews() {
  filePreview.innerHTML = '';
  selectedFiles.forEach((file, idx) => {
    const item = document.createElement('div');
    item.className = 'file-preview-item';
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.alt = file.name;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'file-preview-remove';
    btn.innerHTML = '&times;';
    btn.setAttribute('aria-label', 'Remove photo');
    btn.addEventListener('click', () => {
      URL.revokeObjectURL(img.src);
      selectedFiles.splice(idx, 1);
      updateFileInput();
      renderPreviews();
    });
    item.appendChild(img);
    item.appendChild(btn);
    filePreview.appendChild(item);
  });
}

function addFiles(newFiles) {
  const MAX = 5;
  Array.from(newFiles).forEach(f => {
    if (selectedFiles.length < MAX && f.type.startsWith('image/')) {
      selectedFiles.push(f);
    }
  });
  updateFileInput();
  renderPreviews();
}

fileInput.addEventListener('change', () => addFiles(fileInput.files));

fileUploadLabel.addEventListener('dragover', e => {
  e.preventDefault();
  fileUploadLabel.classList.add('dragover');
});
fileUploadLabel.addEventListener('dragleave', () => fileUploadLabel.classList.remove('dragover'));
fileUploadLabel.addEventListener('drop', e => {
  e.preventDefault();
  fileUploadLabel.classList.remove('dragover');
  addFiles(e.dataTransfer.files);
});


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

  if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
    setTimeout(() => {
      setLoading(false);
      showStatus(
        '✓ Your enquiry has been sent! Jamel will be in touch shortly.',
        'success'
      );
      contactForm.reset();
      selectedFiles = [];
      renderPreviews();
    }, 1200);
    return;
  }

  const photoCount = selectedFiles.length;
  const photoNote  = photoCount > 0
    ? `\n\n[${photoCount} photo${photoCount > 1 ? 's' : ''} attached]`
    : '';

  const templateParams = {
    from_name:  name,
    from_phone: phone,
    from_email: email,
    service:    service || 'Not specified',
    message:    message + photoNote,
  };

  /* Send email with any attached photos via sendForm (handles file inputs natively) */
  emailjs
    .sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, contactForm, EMAILJS_PUBLIC_KEY)
    .catch(() =>
      /* Fallback: send without attachments if sendForm fails */
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
    )
    .then(() => {
      showStatus(
        '✓ Thank you! Your enquiry has been sent. We\'ll be in touch shortly.',
        'success'
      );
      contactForm.reset();
      selectedFiles = [];
      renderPreviews();
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
    : '<span>Claim 20% OFF — Send Enquiry</span><i class="fas fa-paper-plane"></i>';
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


/* ── Gallery Carousel ── */
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

  const wrapper = track.closest('.carousel-wrapper');
  wrapper.addEventListener('mouseenter', () => clearInterval(timer));
  wrapper.addEventListener('mouseleave', () => startTimer());

  let touchX = 0;
  track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = touchX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) { dx > 0 ? goTo(current + 1) : goTo(current - 1); resetTimer(); }
  }, { passive: true });

  startTimer();
})();
