// ===== THEME =====
function initTheme() {
  const html = document.documentElement;
  const saved = localStorage.getItem('site-theme');
  if (saved === 'dark' || saved === 'light') {
    html.dataset.theme = saved;
  }
  syncThemeButton();
}

function syncThemeButton() {
  const html = document.documentElement;
  const btn = document.getElementById('themeBtn');
  if (!btn) return;
  if (html.dataset.theme === 'dark') {
    btn.innerHTML = '<i class="fa fa-sun"></i> Light';
  } else {
    btn.innerHTML = '<i class="fa fa-moon"></i> Dark';
  }
}

function toggleTheme() {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('site-theme', html.dataset.theme);
  syncThemeButton();
}

// ===== NAV STATE =====
function syncNavState() {
  const page = (document.body.dataset.page || '').toLowerCase();
  const servicePages = ['aws', 'development', 'ai-agents', 'hiring', 'consulting', 'devsecops'];

  document.querySelectorAll('.nav-link, .dropdown-item').forEach(link => {
    link.classList.remove('active-nav');
    link.removeAttribute('aria-current');
  });

  const servicesToggle = document.querySelector('.nav-link[data-nav="services"]');

  if (servicePages.includes(page)) {
    if (servicesToggle) {
      servicesToggle.classList.add('active-nav');
      servicesToggle.setAttribute('aria-current', 'page');
    }

    const subLink = document.querySelector(`.dropdown-item[data-nav="${page}"]`);
    if (subLink) {
      subLink.classList.add('active-nav');
      subLink.setAttribute('aria-current', 'location');
    }
    return;
  }

  const pageLink = document.querySelector(`.nav-link[data-nav="${page}"]`);
  if (pageLink) {
    pageLink.classList.add('active-nav');
    pageLink.setAttribute('aria-current', 'page');
  }
}

// ===== CONTACT FORM =====
async function submitForm(event) {
  if (event) event.preventDefault();

  const nameInput = document.getElementById('cName');
  const emailInput = document.getElementById('cEmail');
  const msgInput = document.getElementById('cMsg');
  const form = document.getElementById('contactForm');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const msg = msgInput.value.trim();

  if (!name || !email || !msg) {
    alert('Please fill in your name, email, and message.');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  // Disable button and show sending state
  let originalBtnContent = '';
  if (submitBtn) {
    originalBtnContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin me-2"></i>Sending...';
  }

  try {
    const response = await fetch('https://formspree.io/f/xvzjjykd', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        email: email,
        message: msg
      })
    });

    if (response.ok) {
      // Clear form
      nameInput.value = '';
      emailInput.value = '';
      msgInput.value = '';

      // Hide form fields, show success message
      const formSuccess = document.getElementById('formSuccess');

      if (form && formSuccess) {
        form.style.display = 'none';
        formSuccess.style.display = 'block';

        // Auto-hide the contact drawer after 3 seconds
        setTimeout(() => {
          const closeBtn = document.querySelector('[data-contact-close]');
          if (closeBtn) closeBtn.click();

          // Reset drawer state for next open (after the slide-out animation finishes)
          setTimeout(() => {
            form.style.display = '';
            formSuccess.style.display = 'none';
          }, 500);
        }, 3000);
      }
    } else {
      const data = await response.json();
      if (data && data.errors) {
        alert(data.errors.map(err => err.message).join(', '));
      } else {
        alert('Oops! There was a problem submitting your form. Please try again.');
      }
    }
  } catch (error) {
    alert('Oops! There was a problem submitting your form. Please check your connection and try again.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnContent;
    }
  }
}

// ===== CONTACT DRAWER =====
function initContactSlider() {
  ensureContactDrawer();

  const openButtons = document.querySelectorAll('[data-contact-open]');
  const closeBtn = document.querySelector('[data-contact-close]');
  const overlay = document.querySelector('[data-contact-overlay]');
  const drawer = document.querySelector('.contact-drawer');

  if (!drawer || !openButtons.length || !closeBtn || !overlay) return;

  const openDrawer = () => {
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');
  };

  const closeDrawer = () => {
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-open');
  };

  openButtons.forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      openDrawer();
    });
  });
  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDrawer();
  });
}

function copyEmailToClipboard() {
  const email = 'reach@tskilllab.com';
  navigator.clipboard.writeText(email).then(() => {
    const btn = document.querySelector('.contact-email-pill');
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<span><i class="fa fa-check me-2"></i>Copied!</span>';
    btn.style.borderColor = 'var(--g-green)';
    setTimeout(() => {
      btn.innerHTML = originalContent;
      btn.style.borderColor = '';
    }, 2000);
  });
}

function ensureContactDrawer() {
  if (document.querySelector('.contact-drawer')) return;

  const drawerHtml = `
    <div class="contact-overlay" data-contact-overlay></div>
    <aside class="contact-drawer" aria-hidden="true">
      <div class="contact-drawer-top">
        <div>
          <div class="contact-drawer-kicker">Get in touch</div>
          <h3>Contact us</h3>
        </div>
        <button class="contact-drawer-close" type="button" data-contact-close aria-label="Close contact drawer">
          <i class="fa fa-xmark"></i>
        </button>
      </div>
      <div class="contact-drawer-body">
        <div class="contact-email-wrapper mb-4">
          <div style="font-size:0.85rem;font-weight:700;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Email Us</div>
          <a href="javascript:void(0)" class="contact-email-pill" onclick="copyEmailToClipboard()" title="Click to copy email">
            <span><i class="fa fa-envelope me-2"></i>reach@tskilllab.com</span>
            <i class="fa fa-copy"></i>
          </a>
        </div>
        
        <div class="contact-separator mb-4" style="display:flex;align-items:center;gap:15px;">
          <div style="flex:1;height:1px;background:var(--border);"></div>
          <div style="font-size:0.8rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;">OR Send Us a Message</div>
          <div style="flex:1;height:1px;background:var(--border);"></div>
        </div>

        <div id="formSuccess" class="contact-success" style="display:none;">
          <i class="fa fa-check-circle me-2"></i>Thank you! Your message has been received.
        </div>
        <form class="drawer-form-grid" id="contactForm" action="https://formspree.io/f/xnjyorvq" method="POST" onsubmit="submitForm(event)">
          <div class="form-field">
            <input type="text" class="contact-input" id="cName" name="name" placeholder="Name :" required />
          </div>
          <div class="form-field">
            <input type="email" class="contact-input" id="cEmail" name="email" placeholder="Email :" required />
          </div>
          <div class="form-field">
            <textarea class="contact-input drawer-textarea" id="cMsg" name="message" rows="4" placeholder="Message :" required></textarea>
          </div>
          <button type="submit" class="btn-primary-custom w-100 mt-2" style="text-align:center;">
            <i class="fa fa-paper-plane me-2"></i>Send Message
          </button>
        </form>
      </div>
    </aside>
  `;

  document.body.insertAdjacentHTML('beforeend', drawerHtml);
}

// ===== SCROLL ANIMATIONS =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
      // For elements using the old inline styles
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translate(0,0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.01, rootMargin: '0px 0px -20px 0px' });

function initAnimations() {
  const sel = '.card-custom, .svc-card, .why-card, .testi-card, .process-step, .project-card, .hero-svc-card, .contact-info-card, .path-step, .tech-pill, .feature-li, .horiz-step, .stat-col, .section-label:not(.hero .section-label, .service-hero .section-label)';
  document.querySelectorAll(sel).forEach((el, i) => {
    if (el.dataset.animated) return;
    el.dataset.animated = '1';
    
    // Only set default transform if no directional classes are present
    if (!el.classList.contains('anim-left') && !el.classList.contains('anim-right')) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
    } else {
      // Directional classes are handled via CSS (.anim-left, .anim-right)
      // but we still ensure opacity 0 for the observer to trigger
      el.style.opacity = '0';
    }
    
    // Dynamic delay based on element type and index
    let delay = Math.min(i, 8) * 0.05;
    if (el.classList.contains('tech-pill') || el.classList.contains('feature-li')) {
      delay = (i % 6) * 0.03; // Faster staggering for pills/list items
    }
    
    el.style.transition = `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s, border-color 0.28s, box-shadow 0.28s`;
    observer.observe(el);
  });

  // Fallback: force-show all animated elements after 3s in case observer doesn't fire (e.g. on some mobile browsers)
  setTimeout(() => {
    document.querySelectorAll('[data-animated]').forEach(el => {
      if (!el.classList.contains('animate-in')) {
        el.classList.add('animate-in');
        el.style.opacity = '1';
        el.style.transform = 'translate(0,0)';
      }
    });
  }, 3000);
}

function initHeroAnimation() {
  const hero = document.querySelector('.hero, .service-hero');
  if (!hero) return;

  const triggerAnimation = () => {
    hero.classList.add('animate-trigger');
  };

  // 1. Start after splash logo arrives (on fresh load)
  document.addEventListener('logoArrived', () => {
    triggerAnimation();
  });

  // 2. Handle pages without preloader (direct landing or simple navigation)
  if (!document.getElementById('preloader')) {
    setTimeout(triggerAnimation, 100);
  }

  // 3. Handle re-triggering when scrolling back to top
  window.addEventListener('scroll', () => {
    if (window.scrollY < 10) {
      triggerAnimation();
    }
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  syncNavState();
  initContactSlider();
  initAnimations();
  initHeroAnimation();
});

window.addEventListener('hashchange', syncNavState);
