/**
 * Chef Marcos Mena — Official Website Interaction Script
 * Minimalist Luxury Slider, 3D Flip Card Support & WhatsApp Booking
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Navigation & Header Scroll State
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      mobileToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
    });

    // Close menu when clicking link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileToggle.textContent = '☰';
      });
    });
  }

  // 2. Hero Media Slider (Videos sequentially -> Photos auto-cycling -> loop)
  const slides = document.querySelectorAll('.hero-slider-section .slide-item');
  const dots = document.querySelectorAll('.slider-indicators .indicator-dot');
  const btnPrev = document.querySelector('.slider-prev');
  const btnNext = document.querySelector('.slider-next');

  if (slides.length > 0) {
    let currentSlide = 0;
    let photoTimer = null;
    const PHOTO_DURATION = 4500; // 4.5 seconds per photo

    function showSlide(index) {
      if (photoTimer) {
        clearTimeout(photoTimer);
        photoTimer = null;
      }

      slides.forEach((s, idx) => {
        s.classList.toggle('active', idx === index);
        const vid = s.querySelector('video');
        if (vid) {
          vid.pause();
        }
      });

      dots.forEach((d, idx) => {
        d.classList.toggle('active', idx === index);
      });

      currentSlide = index;
      const activeSlide = slides[currentSlide];
      const video = activeSlide.querySelector('video');

      if (video) {
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // If autoplay was blocked with audio, ensure muted and retry
            video.muted = true;
            video.play().catch(() => {});
          });
        }

        // Listen for video end
        video.onended = () => {
          nextSlide();
        };

        // Fallback in case video metadata or onended event doesn't fire
        const maxVideoTime = (video.duration && !isNaN(video.duration) && video.duration > 0)
          ? (video.duration + 1) * 1000
          : 12000;
        photoTimer = setTimeout(() => {
          if (currentSlide === index && slides[index].querySelector('video')) {
            nextSlide();
          }
        }, maxVideoTime);

      } else {
        // It's a photo slide - auto advance after PHOTO_DURATION
        photoTimer = setTimeout(() => {
          nextSlide();
        }, PHOTO_DURATION);
      }
    }

    function nextSlide() {
      const nextIndex = (currentSlide + 1) % slides.length;
      showSlide(nextIndex);
    }

    function prevSlide() {
      const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(prevIndex);
    }

    if (btnNext) btnNext.addEventListener('click', nextSlide);
    if (btnPrev) btnPrev.addEventListener('click', prevSlide);

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        showSlide(idx);
      });
    });

    // Start with slide 0 (first fire video)
    showSlide(0);
  }

  // 3. Touch support for 3D Card Flip
  const cardWrappers = document.querySelectorAll('.service-card-wrapper');
  cardWrappers.forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't toggle if clicking the direct "MORE +" button
      if (e.target.closest('.btn-card-more')) return;
      card.classList.toggle('flipped');
    });
  });

  // 4. FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close siblings
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // 5. Back to top button
  const backToTopBtn = document.querySelector('.back-to-top-btn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 6. Reservation Form to WhatsApp serializer
  const reserveForm = document.getElementById('reservationForm');
  if (reserveForm) {
    reserveForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('clientName')?.value.trim();
      const phone = document.getElementById('clientPhone')?.value.trim();
      const email = document.getElementById('clientEmail')?.value.trim();
      const villa = document.getElementById('villaLocation')?.value.trim();
      const dates = document.getElementById('serviceDates')?.value.trim();
      const adults = document.getElementById('adultsCount')?.value.trim() || '0';
      const children = document.getElementById('childrenCount')?.value.trim() || '0';
      const dietary = document.getElementById('dietaryNotes')?.value.trim() || 'None reported';
      const comments = document.getElementById('specialRequests')?.value.trim() || 'None';

      // Gather checked services
      const serviceCheckboxes = document.querySelectorAll('input[name="services"]:checked');
      const selectedServices = Array.from(serviceCheckboxes).map(cb => cb.value);
      const servicesText = selectedServices.length > 0 ? selectedServices.join(', ') : 'Custom Dining Experience';

      if (!name || !phone || !villa || !dates) {
        alert('Please fill in the required fields (Name, Phone/WhatsApp, Villa Location, and Dates).');
        return;
      }

      // Build structured WhatsApp message
      const message = 
`🌟 *NEW PRIVATE CHEF RESERVATION INQUIRY* 🌟

👤 *Client:* ${name}
📱 *Phone / WhatsApp:* ${phone}
📧 *Email:* ${email || 'Not provided'}
🏡 *Villa / Location:* ${villa}
📅 *Service Date(s):* ${dates}
🍽️ *Service Requested:* ${servicesText}
👥 *Number of Guests:* ${adults} Adults, ${children} Children
🥗 *Dietary Restrictions / Allergies:* ${dietary}
📝 *Special Requests / Notes:* ${comments}

✨ _Sent via Chef Marcos Mena Official Website_`;

      const chefWhatsApp = '50660811676';
      const encodedMsg = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${chefWhatsApp}?text=${encodedMsg}`;

      // Open WhatsApp in new window/tab
      window.open(whatsappUrl, '_blank');
    });
  }
});

// Suppress Netlify Injected Promo Badges, Drawers & "Powered by Netlify"
(function() {
  const killNetlify = function() {
    document.querySelectorAll('#nl-badge-frame, #nl-hud-frame, iframe[id^="nl-"], iframe[title*="Netlify"], iframe[title*="Powered by Netlify"], [class*="netlify-badge"], [id*="netlify"], div[data-netlify-badge], a[href*="netlify.com"][class*="badge"]').forEach(function(el) {
      try {
        el.remove();
      } catch (err) {}
    });
  };
  killNetlify();
  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(killNetlify).observe(document.documentElement, { childList: true, subtree: true });
  }
  window.addEventListener('DOMContentLoaded', killNetlify);
  window.addEventListener('load', killNetlify);
  setInterval(killNetlify, 400);
})();
