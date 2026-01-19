let album = [];
let spreads = [];
let index = 0;

const book = document.getElementById('book');
const leftImg = document.getElementById('leftImg');
const rightImg = document.getElementById('rightImg');
const counter = document.getElementById('pageCounter');

const leftPage = document.querySelector('.page.left');
const rightPage = document.querySelector('.page.right');

const btnNext = document.querySelector('.nav.next');
const btnPrev = document.querySelector('.nav.prev');

let dragging = false;
let startX = 0;
let activePage = null;
let direction = null;
let animating = false;

/* LOAD */
fetch('album.json', { cache: 'no-store' })
  .then(r => r.json())
  .then(data => {
    album = data;
    buildSpreads();
    render();
  });

function buildSpreads() {
  const capa = album.find(p => p.type === 'capa');
  const contra = album.find(p => p.type === 'contracapa');
  const pages = album.filter(p => p.type === 'pagina');

  spreads = [];

  // Spread 0: esquerda vazia, direita capa
  spreads.push({
    left: null,
    right: capa.image,
    type: 'capa'
  });

  // Miolo
  for (let i = 0; i < pages.length; i += 2) {
    spreads.push({
      left: pages[i]?.image || null,
      right: pages[i + 1]?.image || null,
      type: 'spread'
    });
  }

  // Último: contracapa à direita
  spreads.push({
    left: null,
    right: contra.image,
    type: 'contracapa'
  });
}

function render() {
  const s = spreads[index];
  if (!s) return;

  // Estado visual do livro
  if (index === 0) {
    book.classList.add('closed');
  } else {
    book.classList.remove('closed');
  }

  leftImg.src = s.left || '';
  rightImg.src = s.right || '';

  counter.innerText =
    s.type === 'capa'
      ? 'CAPA'
      : s.type === 'contracapa'
        ? 'CONTRACAPA'
        : `PÁGINAS ${index} / ${spreads.length - 2}`;
}


/* ===============================
   FUNÇÃO DE VIRADA FÍSICA
================================ */
function flipPage(dir) {
  if (animating) return;
  animating = true;

  const page =
    dir === 'next' ? rightPage : leftPage;

  page.style.transition = 'transform .6s cubic-bezier(.4,0,.2,1)';
  page.style.transform =
    dir === 'next'
      ? 'rotateY(-180deg)'
      : 'rotateY(180deg)';

  setTimeout(() => {
    page.style.transition = '';
    page.style.transform = '';

    index =
      dir === 'next'
        ? Math.min(index + 1, spreads.length - 1)
        : Math.max(index - 1, 0);

    render();
    animating = false;
  }, 620);
}

/* ===============================
   BOTÕES
================================ */
btnNext.addEventListener('click', e => {
  e.stopPropagation();
  if (index < spreads.length - 1) {
    flipPage('next');
  }
});

btnPrev.addEventListener('click', e => {
  e.stopPropagation();
  if (index > 0) {
    flipPage('prev');
  }
});

/* ===============================
   ARRASTE (SWIPE)
================================ */
book.addEventListener('pointerdown', e => {
  if (animating) return;

  dragging = true;
  startX = e.clientX;

  const rect = book.getBoundingClientRect();
  const center = rect.left + rect.width / 2;

  if (e.clientX > center) {
    activePage = rightPage;
    direction = 'next';
  } else {
    activePage = leftPage;
    direction = 'prev';
  }
});

book.addEventListener('pointermove', e => {
  if (!dragging || !activePage || animating) return;

  const delta = e.clientX - startX;
  const width = book.offsetWidth / 2;
  const progress = Math.max(-1, Math.min(1, delta / width));

  const angle = progress * 160;
  const shadow = Math.abs(progress) * 0.5;

  activePage.style.transform = `rotateY(${angle}deg)`;
  activePage.style.boxShadow =
    `${-angle}px 0 60px rgba(0,0,0,${shadow})`;
});

book.addEventListener('pointerup', e => {
  if (!dragging || animating) return;
  dragging = false;

  const delta = e.clientX - startX;

  if (Math.abs(delta) > 120) {
    flipPage(direction);
  } else {
    activePage.style.transition = 'transform .3s ease';
    activePage.style.transform = '';
    activePage.style.boxShadow = '';
  }

  activePage = null;
});
