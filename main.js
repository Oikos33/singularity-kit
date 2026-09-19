// Pricing Toggle
function showPricing(mode) {
  const one = document.getElementById('pricing-one');
  const annual = document.getElementById('pricing-annual');
  const togOne = document.getElementById('tog-one');
  const togAnnual = document.getElementById('tog-annual');
  if (mode === 'onetime') {
    one.classList.remove('hidden');
    annual.classList.add('hidden');
    togOne.classList.add('active');
    togAnnual.classList.remove('active');
  } else {
    one.classList.add('hidden');
    annual.classList.remove('hidden');
    togOne.classList.remove('active');
    togAnnual.classList.add('active');
  }
}
window.showPricing = showPricing;

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.style.background = window.scrollY > 40
    ? 'rgba(8,13,24,0.95)'
    : 'rgba(8,13,24,0.7)';
});

// Hamburger mobile menu
const hamburger = document.getElementById('hamburger');
let mobileMenuOpen = false;
let mobileMenu = null;

hamburger.addEventListener('click', () => {
  if (mobileMenuOpen) {
    mobileMenu && mobileMenu.remove();
    mobileMenuOpen = false;
    return;
  }
  mobileMenu = document.createElement('div');
  mobileMenu.id = 'mobile-menu';
  mobileMenu.style.cssText = [
    'position:fixed;top:64px;left:0;right:0;',
    'background:rgba(8,13,24,0.98);backdrop-filter:blur(20px);',
    'border-bottom:1px solid rgba(74,158,255,0.12);',
    'padding:16px 24px 24px;z-index:99;',
    'display:flex;flex-direction:column;gap:16px;'
  ].join('');

  // Gather nav links from the page itself
  document.querySelectorAll('.nav-links a').forEach(link => {
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    a.textContent = link.textContent;
    a.style.cssText = 'color:#8899bb;font-size:1rem;font-weight:500;padding:8px 0;border-bottom:1px solid rgba(74,158,255,0.08);';
    a.addEventListener('click', () => { mobileMenu.remove(); mobileMenuOpen = false; });
    mobileMenu.appendChild(a);
  });

  document.body.appendChild(mobileMenu);
  mobileMenuOpen = true;
});

document.addEventListener('click', (e) => {
  if (mobileMenuOpen && !hamburger.contains(e.target) && mobileMenu && !mobileMenu.contains(e.target)) {
    mobileMenu.remove();
    mobileMenuOpen = false;
  }
});

// Scroll reveal
const revealEls = document.querySelectorAll('.feature-card, .tier-card, .step, .price-card, .faq-item');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// Active nav link tracking
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + current ? '#e8edf5' : '';
  });
}, { passive: true });

// Waitlist Form (English page - JA/ES pages have their own inline handler)
const wlForm = document.getElementById('waitlist-form');
if (wlForm && !wlForm.dataset.handled) {
  wlForm.dataset.handled = '1';
  wlForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email   = document.getElementById('wl-email').value.trim();
    const name    = document.getElementById('wl-name').value.trim();
    const tier    = document.getElementById('wl-tier').value;
    const message = document.getElementById('wl-msg').value.trim();
    const submit  = document.getElementById('wl-submit');
    const btnText = document.getElementById('wl-btn-text');
    const spinner = document.getElementById('wl-spinner');
    const feedback= document.getElementById('wl-feedback');

    if (!email || !email.includes('@')) {
      showFeedback(feedback, 'Please enter a valid email address.', 'error');
      return;
    }
    submit.disabled = true;
    btnText.textContent = 'Sending\u2026';
    spinner.classList.remove('hidden');
    feedback.classList.add('hidden');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, tier, message })
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback(feedback, '\u2713 You are on the list. We will notify you first.', 'success');
        wlForm.reset();
      } else {
        showFeedback(feedback, data.error || 'Something went wrong. Please try again.', 'error');
      }
    } catch (err) {
      showFeedback(feedback, 'Network error. Please try again later.', 'error');
    } finally {
      submit.disabled = false;
      btnText.textContent = 'Join Waitlist';
      spinner.classList.add('hidden');
    }
  });
}

function showFeedback(el, msg, type) {
  el.textContent = msg;
  el.className = 'form-feedback ' + type;
}