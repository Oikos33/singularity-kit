// ─── Pricing Toggle ───────────────────────────────────────
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

// ─── Navbar scroll effect ──────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.style.background = 'rgba(8,13,24,0.95)';
  } else {
    navbar.style.background = 'rgba(8,13,24,0.7)';
  }
});

// ─── Hamburger menu ───────────────────────────────────────
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
  mobileMenu.style.cssText = `
    position: fixed; top: 64px; left: 0; right: 0;
    background: rgba(8,13,24,0.98); backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(74,158,255,0.12);
    padding: 16px 24px 24px; z-index: 99;
    display: flex; flex-direction: column; gap: 16px;
  `;
  const links = [
    ['#what','nav_what'],['#tiers','nav_tiers'],
    ['#service','nav_service'],['#pricing','nav_pricing'],['#faq','nav_faq']
  ];
  const t = window.translations && window.translations[window.currentLang || 'en'];
  links.forEach(([href, key]) => {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = t ? (t[key] || key) : key;
    a.style.cssText = 'color: #8899bb; font-size: 1rem; font-weight: 500; padding: 8px 0; border-bottom: 1px solid rgba(74,158,255,0.08);';
    a.addEventListener('click', () => { mobileMenu.remove(); mobileMenuOpen = false; });
    mobileMenu.appendChild(a);
  });
  // Lang switcher in mobile
  const langRow = document.createElement('div');
  langRow.style.cssText = 'display: flex; gap: 8px; padding-top: 8px;';
  ['en','ja','es','zh'].forEach(lang => {
    const btn = document.createElement('button');
    btn.textContent = lang === 'en' ? 'EN' : lang === 'ja' ? '日本語' : lang === 'es' ? 'ES' : '中文';
    btn.style.cssText = 'background: rgba(74,158,255,0.1); border: 1px solid rgba(74,158,255,0.2); color: #4A9EFF; font-size: 0.8rem; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-family: inherit;';
    btn.addEventListener('click', () => { window.setLang(lang); mobileMenu.remove(); mobileMenuOpen = false; });
    langRow.appendChild(btn);
  });
  mobileMenu.appendChild(langRow);
  document.body.appendChild(mobileMenu);
  mobileMenuOpen = true;
});

// Close mobile menu on outside click
document.addEventListener('click', (e) => {
  if (mobileMenuOpen && !hamburger.contains(e.target) && mobileMenu && !mobileMenu.contains(e.target)) {
    mobileMenu.remove();
    mobileMenuOpen = false;
  }
});

// ─── Scroll reveal ────────────────────────────────────────
const revealElements = document.querySelectorAll('.feature-card, .tier-card, .step, .price-card, .faq-item');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

revealElements.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// ─── Smooth active link in nav ────────────────────────────
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

// expose for i18n
window.currentLang = 'en';
const origSetLang = window.setLang;
window.setLang = function(lang) {
  window.currentLang = lang;
  origSetLang(lang);
};

// ─── Waitlist Form ─────────────────────────────────────────
const wlForm = document.getElementById('waitlist-form');
if (wlForm) {
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

    // Loading state
    submit.disabled = true;
    btnText.textContent = 'Sending…';
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
        if (data.message === 'already_registered') {
          showFeedback(feedback, '✓ You are already on the list — we will be in touch!', 'success');
        } else {
          showFeedback(feedback, '✓ You are on the list. We will notify you first.', 'success');
          wlForm.reset();
        }
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
