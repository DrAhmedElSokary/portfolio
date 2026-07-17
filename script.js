const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a');
const year = document.getElementById('year');

if (year) {
  year.textContent = new Date().getFullYear();
}

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));

const sections = document.querySelectorAll('main section[id]');
const navItems = document.querySelectorAll('.site-nav a');

const updateActiveLink = () => {
  const scrollPosition = window.scrollY + 120;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;

    if (scrollPosition >= top && scrollPosition < bottom) {
      navItems.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${section.id}`);
      });
    }
  });
};

window.addEventListener('scroll', updateActiveLink);
window.addEventListener('load', () => {
  updateActiveLink();
  initializeAwardModal();
  initializeCopyLinks();
});

function initializeCopyLinks() {
  const copyButtons = document.querySelectorAll('.copy-link');

  copyButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const text = button.dataset.copy;
      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      button.classList.add('copied');
      setTimeout(() => button.classList.remove('copied'), 1400);
    });
  });
}

function initializeAwardModal() {
  const modal = document.getElementById('awardModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const modalDescription = document.getElementById('modalDescription');
  const modalImage = document.getElementById('modalImage');
  const modalImageWrap = document.getElementById('modalImageWrap');
  const modalClose = document.getElementById('modalClose');
  const carouselPrev = document.getElementById('carouselPrev');
  const carouselNext = document.getElementById('carouselNext');
  const carouselThumbs = document.getElementById('carouselThumbs');
  const modalZoom = document.getElementById('modalZoom');
  const modalFullscreen = document.getElementById('modalFullscreen');

  const awardCards = Array.from(document.querySelectorAll('.award-card'));
  let activeImages = [];
  let activeIndex = 0;
  let zoomed = false;

  const awardData = {
    'Allied Health Staff of the Year': [
      'Allied health staff of the year 2025/Allied health staff of the year .jpeg',
      'Allied health staff of the year 2025/Allied health prize .jpeg',
      'WhatsApp Image 2026-07-17 at 8.27.47 PM.jpeg'
    ],
    'Quality Champion Award': [
      'quality champion of the hospital/quality champion of the hospital .jpeg',
      'quality champion of the hospital/quality champion of hospital .jpeg',
      'lab coat photo .jpeg'
    ],
    'Best Pharmacist in the Hospital': [
      'best pharmacist in the world pharmacist day 2025/WhatsApp Image 2026-07-17 at 8.02.04 PM.jpeg',
      'preceptor certificate from dubai medical university 2026/preceptor certificate from DMU .jpeg',
      'medication safety session 2025 & 2026/medication safety session .jpeg'
    ],
    'Arab Health Recognition': [
      'arab health 2023.jpeg',
      'medication safety session 2025 & 2026/medication safety session with nursing .jpeg',
      'Membership in ECPS/ECPS Membership .jpeg'
    ]
  };

  function showModal(card) {
    const title = card.dataset.title;
    const organization = card.dataset.organization;
    const year = card.dataset.year;
    const description = card.dataset.description;
    const dataImage = card.dataset.img;
    const images = dataImage
      ? dataImage.split('|').map((src) => src.trim())
      : awardData[title] || [];

    activeImages = images;
    activeIndex = 0;
    zoomed = false;

    modalTitle.textContent = title;
    modalSubtitle.textContent = `${organization} · ${year}`;
    modalDescription.textContent = description;
    renderImage();
    renderThumbnails();

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleKeyDown);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  function renderImage() {
    if (!activeImages.length) {
      modalImage.src = '';
      modalImage.alt = 'No image available';
      return;
    }

    modalImage.src = activeImages[activeIndex];
    modalImage.alt = `${modalTitle.textContent} image ${activeIndex + 1}`;
    modalImage.dataset.index = String(activeIndex);
    modalImageWrap.scrollTop = 0;
    modalImage.style.transform = zoomed ? 'scale(1.8)' : 'scale(1)';
    modalImage.style.cursor = zoomed ? 'zoom-out' : 'zoom-in';
  }

  function renderThumbnails() {
    carouselThumbs.innerHTML = '';
    activeImages.forEach((src, index) => {
      const thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = 'thumbnail-button';
      thumb.setAttribute('aria-label', `View image ${index + 1}`);
      thumb.innerHTML = `<img src="${src}" alt="Thumbnail ${index + 1}" loading="lazy" />`;
      thumb.addEventListener('click', () => {
        activeIndex = index;
        renderImage();
      });
      carouselThumbs.appendChild(thumb);
    });
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      closeModal();
      return;
    }
    if (event.key === 'ArrowLeft') {
      changeImage(-1);
      return;
    }
    if (event.key === 'ArrowRight') {
      changeImage(1);
      return;
    }
    if (event.key === 'Enter' && document.activeElement.classList.contains('award-card')) {
      showModal(document.activeElement);
      return;
    }
  }

  function changeImage(direction) {
    if (!activeImages.length) return;
    activeIndex = (activeIndex + direction + activeImages.length) % activeImages.length;
    renderImage();
  }

  function toggleZoom() {
    zoomed = !zoomed;
    modalImage.style.transform = zoomed ? 'scale(1.8)' : 'scale(1)';
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }
    const modalPanel = modal.querySelector('.modal-panel');
    if (modalPanel) {
      modalPanel.requestFullscreen().catch(() => {});
    }
  }

  awardCards.forEach((card) => {
    card.addEventListener('click', (event) => {
      const isButton = event.target.closest('button');
      if (isButton || event.currentTarget.classList.contains('award-card')) {
        showModal(card);
      }
    });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        showModal(card);
      }
    });
  });

  modalClose.addEventListener('click', closeModal);
  carouselPrev.addEventListener('click', () => changeImage(-1));
  carouselNext.addEventListener('click', () => changeImage(1));
  modalZoom.addEventListener('click', toggleZoom);
  modalFullscreen.addEventListener('click', toggleFullscreen);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  let touchStartX = 0;
  let touchEndX = 0;

  modalImageWrap.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].screenX;
  });

  modalImageWrap.addEventListener('touchend', (event) => {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipeGesture();
  });

  function handleSwipeGesture() {
    const swipeDistance = touchEndX - touchStartX;
    if (Math.abs(swipeDistance) > 40) {
      if (swipeDistance < 0) {
        changeImage(1);
      } else {
        changeImage(-1);
      }
    }
  }
}
