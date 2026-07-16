// Anokhi Cloth Corner — site interactions

document.addEventListener('DOMContentLoaded', () => {
  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('mainNav');

  if (hamburger && mainNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Sticky header shadow on scroll
  const header = document.getElementById('siteHeader');
  const backToTop = document.getElementById('backToTop');

  const onScroll = () => {
    const scrolled = window.scrollY > 20;
    if (header) header.classList.toggle('scrolled', scrolled);
    if (backToTop) backToTop.classList.toggle('show', window.scrollY > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Reveal-on-scroll animation
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  // Animated count-up for hero/about stats
  const counters = document.querySelectorAll('.counter');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.target, 10) || 0;
          const suffix = el.dataset.suffix || '';
          const duration = 1400;
          const start = performance.now();

          const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  }

  // Hero visual mini slideshow — cross-fades through images inside each drape card
  document.querySelectorAll('.hero-slideshow').forEach((card, cardIndex) => {
    const imgs = Array.from(card.querySelectorAll('img'));
    const dots = Array.from(card.querySelectorAll('.hero-dots button'));
    if (imgs.length < 2) return;
    let current = 0;
    setInterval(() => {
      imgs[current].classList.remove('active');
      if (dots[current]) dots[current].classList.remove('active');
      current = (current + 1) % imgs.length;
      imgs[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');
    }, 2600 + cardIndex * 500);
  });

  // Collection gallery slider
  const sliderTrack = document.getElementById('sliderTrack');
  const sliderPrev = document.getElementById('sliderPrev');
  const sliderNext = document.getElementById('sliderNext');
  const sliderDots = document.getElementById('sliderDots');

  if (sliderTrack && sliderPrev && sliderNext && sliderDots) {
    const slides = Array.from(sliderTrack.children);
    let current = 0;
    let autoplayTimer = null;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      sliderDots.appendChild(dot);
    });
    const dots = Array.from(sliderDots.children);

    function render() {
      sliderTrack.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      render();
    }

    function nextSlide() { goTo(current + 1); }
    function prevSlide() { goTo(current - 1); }

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(nextSlide, 5000);
    }
    function stopAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
    }

    sliderNext.addEventListener('click', () => { nextSlide(); startAutoplay(); });
    sliderPrev.addEventListener('click', () => { prevSlide(); startAutoplay(); });

    const sliderEl = document.getElementById('heroSlider');
    sliderEl.addEventListener('mouseenter', stopAutoplay);
    sliderEl.addEventListener('mouseleave', startAutoplay);

    // Touch swipe support
    let touchStartX = 0;
    sliderEl.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      stopAutoplay();
    }, { passive: true });
    sliderEl.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const delta = touchEndX - touchStartX;
      if (delta > 40) prevSlide();
      else if (delta < -40) nextSlide();
      startAutoplay();
    }, { passive: true });

    render();
    startAutoplay();
  }

  // Contact form — client-side only (no backend), hands off to WhatsApp
  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  const WHATSAPP_NUMBER = '918797334740';

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = contactForm.name.value.trim();
      const phone = contactForm.phone.value.trim();
      const message = contactForm.message.value.trim();

      if (!name || !phone || !message) {
        if (formNote) formNote.textContent = 'Please fill in all fields.';
        return;
      }

      const text = `Hi, my name is ${name} (Phone: ${phone}).\n${message}`;
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

      if (formNote) {
        formNote.textContent = 'Thank you! Redirecting you to WhatsApp...';
      }
      contactForm.reset();
      window.open(url, '_blank', 'noopener');
    });
  }
});
