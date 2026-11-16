(() => {
  const d = SITE_DATA;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const message = encodeURIComponent(d.message);

  $$('[data-wa]').forEach(link => { link.href = `${d.whatsapp}?text=${message}`; });
  $$('[data-ig]').forEach(link => { link.href = d.instagram; link.target = '_blank'; link.rel = 'noopener noreferrer'; });
  $$('[data-google]').forEach(link => { link.href = d.reviewsUrl; link.target = '_blank'; link.rel = 'noopener noreferrer'; });
  $$('[data-phone]').forEach(link => { link.href = `tel:+${d.phone}`; link.textContent = d.phoneDisplay; });
  $$('[data-address]').forEach(el => { el.textContent = d.address; });

  const maps = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(d.address)}`;
  $$('[data-route]').forEach(link => { link.href = maps; link.target = '_blank'; link.rel = 'noopener noreferrer'; });
  const map = $('[data-map]');
  map.src = `https://www.google.com/maps?q=${encodeURIComponent(d.address)}&output=embed`;
  $('#year').textContent = new Date().getFullYear();

  $('#schema').textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: d.name,
    telephone: `+${d.phone}`,
    address: {
      '@type': 'PostalAddress', streetAddress: 'Rua Rio Carboris, 41',
      addressLocality: 'Manaus', addressRegion: 'AM', postalCode: '69098-272', addressCountry: 'BR'
    },
    areaServed: { '@type': 'City', name: 'Manaus' },
    sameAs: [d.instagram]
  });

  d.services.forEach(([name, category, description], index) => {
    const card = document.createElement('article');
    card.className = 'service-card reveal';
    card.style.setProperty('--card-index', index % 5);
    const title = document.createElement('h3');
    title.textContent = name;
    const group = document.createElement('small');
    group.className = 'service-category';
    group.textContent = category;
    const detail = document.createElement('p');
    detail.textContent = description;
    const link = document.createElement('a');
    link.className = 'under';
    link.href = `${d.whatsapp}?text=${encodeURIComponent(`Olá, Daniela! Gostaria de saber mais sobre ${name}.`)}`;
    link.textContent = 'Consultar serviço ↗';
    card.append(group, title, detail, link);
    $('#services').append(card);
  });

  const categories = ['Todos', 'Lábios', 'Sobrancelhas', 'Capilar', 'Studio'];
  let activeCategory = 'Todos';
  categories.forEach((category, index) => {
    const button = document.createElement('button');
    button.className = 'filter';
    button.type = 'button';
    button.textContent = category;
    button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => {
      activeCategory = category;
      $$('.filter').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      $$('.portfolio-card').forEach(card => {
        card.hidden = category !== 'Todos' && card.dataset.cat !== category;
      });
      const empty = $('#portfolio-empty');
      empty.hidden = category !== 'Studio' || d.portfolio.some(([, itemCategory]) => itemCategory === 'Studio');
    });
    $('#filters').append(button);
  });

  d.portfolio.forEach(([name, category, src, width, height], index) => {
    const figure = document.createElement('figure');
    figure.className = 'portfolio-card reveal';
    figure.dataset.cat = category;
    figure.style.setProperty('--card-index', index % 5);
    const image = document.createElement('img');
    image.className = 'portfolio-image';
    image.src = src;
    image.alt = `${name} — fotografia da categoria ${category}`;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = width;
    image.height = height;
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', `Ampliar imagem: ${name}`);
    const caption = document.createElement('figcaption');
    caption.textContent = name;
    figure.append(image, caption);
    $('#portfolio').append(figure);
  });
  const empty = document.createElement('p');
  empty.id = 'portfolio-empty';
  empty.className = 'portfolio-empty';
  empty.textContent = 'Nenhuma imagem disponível nesta aba.';
  empty.hidden = true;
  $('#portfolio').after(empty);

  const header = $('#header');
  const nav = $('#nav');
  const menu = $('.menu');
  const setMenu = open => {
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.textContent = open ? '×' : '☰';
    nav.classList.toggle('open', open);
    header.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
  };
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menu.focus();
    }
  });
  $$('#nav a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  window.addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 24), { passive: true });

  const lightbox = document.createElement('dialog');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('aria-label', 'Visualização de imagem do portfólio');
  lightbox.innerHTML = '<button class="lb-close" type="button" aria-label="Fechar imagem">×</button><button class="lb-prev" type="button" aria-label="Imagem anterior">‹</button><img alt=""><button class="lb-next" type="button" aria-label="Próxima imagem">›</button><p></p>';
  document.body.append(lightbox);
  let photoIndex = 0;
  let previousFocus = null;
  const visiblePhotos = () => $$('.portfolio-card:not([hidden]) .portfolio-image');
  const showPhoto = index => {
    const photos = visiblePhotos();
    if (!photos.length) return;
    photoIndex = (index + photos.length) % photos.length;
    const photo = photos[photoIndex];
    $('img', lightbox).src = photo.src;
    $('img', lightbox).alt = photo.alt;
    $('p', lightbox).textContent = photo.closest('figure').querySelector('figcaption').textContent;
  };
  const openImage = image => {
    previousFocus = image;
    photoIndex = visiblePhotos().indexOf(image);
    showPhoto(photoIndex);
    lightbox.showModal();
  };
  $('#portfolio').addEventListener('click', event => {
    const image = event.target.closest('.portfolio-image');
    if (image) openImage(image);
  });
  $('#portfolio').addEventListener('keydown', event => {
    const image = event.target.closest('.portfolio-image');
    if (image && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); openImage(image); }
  });
  $('.lb-close', lightbox).addEventListener('click', () => lightbox.close());
  $('.lb-prev', lightbox).addEventListener('click', () => showPhoto(photoIndex - 1));
  $('.lb-next', lightbox).addEventListener('click', () => showPhoto(photoIndex + 1));
  lightbox.addEventListener('close', () => previousFocus?.focus());
  lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  lightbox.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') showPhoto(photoIndex - 1);
    if (event.key === 'ArrowRight') showPhoto(photoIndex + 1);
  });
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', event => {
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 45) showPhoto(photoIndex + (delta < 0 ? 1 : -1));
  }, { passive: true });

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const video = $('.deferred-video');
  if (video && !reducedMotion.matches && 'IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      const current = entry.target;
      if (entry.isIntersecting) {
        const source = $('source', current);
        if (!source.src) { source.src = source.dataset.src; current.load(); }
        current.play().catch(() => {});
      } else current.pause();
    }), { rootMargin: '120px' });
    videoObserver.observe(video);
  }

  const floatButton = $('.wa-float');
  const floatZones = new Map([['hero', $('#inicio')], ['final', $('.final')], ['footer', $('footer')]]);
  const hiddenFloatZones = new Set();
  floatButton.classList.add('is-hidden');
  if ('IntersectionObserver' in window) {
    const floatObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const key = [...floatZones].find(([, element]) => element === entry.target)?.[0];
        if (entry.isIntersecting) hiddenFloatZones.add(key);
        else hiddenFloatZones.delete(key);
      });
      floatButton.classList.toggle('is-hidden', hiddenFloatZones.size > 0);
    });
    floatZones.forEach(element => floatObserver.observe(element));
  } else {
    const updateFloat = () => {
      const heroDone = $('#inicio').getBoundingClientRect().bottom <= 0;
      const finalVisible = $('.final').getBoundingClientRect().top < innerHeight;
      const footerVisible = $('footer').getBoundingClientRect().top < innerHeight;
      floatButton.classList.toggle('is-hidden', !heroDone || finalVisible || footerVisible);
    };
    window.addEventListener('scroll', updateFloat, { passive: true });
    updateFloat();
  }

  document.documentElement.classList.add('js');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }), { threshold: 0.12 });
    $$('.reveal').forEach(element => revealObserver.observe(element));
  } else $$('.reveal').forEach(element => element.classList.add('is-visible'));
})();
