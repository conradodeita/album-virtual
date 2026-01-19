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
  const pages = album.filter(p => p !== capa && p !== contra);

  spreads = [];

  spreads.push({ left: null, right: capa.image, type: 'capa' });

  for (let i = 0; i < pages.length; i += 2) {
    spreads.push({
      left: pages[i]?.image || null,
      right: pages[i + 1]?.image || null,
      type: 'spread'
    });
  }

  spreads.push({ left: null, right: contra.image, type: 'contracapa' });
}

function render() {
  const s = spreads[index];
  if (!s) return;

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
   BOTÕES (PRIORIDADE)
================================ */
btnNext.addEventListener('click', e => {
  e.stopPropagation();
  if (index < spreads.length - 1) {
    index++;
    render();
  }
});

btnPrev.addEventListener('click', e => {
  e.stopPropagation();
  if (index > 0) {
    index--;
    render();
  }
});

/* ===============================
   ARRASTE (SWIPE)
================================ */
book.addEventListener('pointerdown', e => {
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
  if (!dragging || !activePage) return;

  const delta = e.clientX - startX;
  const width = book.offsetWidth / 2;
  const progress = Math.max(-1, Math.min(1, delta / width));

  const angle = progress * 180;
  const shadow = Math.abs(progress) * 0.6;

  activePage.style.transform = `rotateY(${angle}deg)`;
  activePage.style.boxShadow =
    `${-angle}px 0 60px rgba(0,0,0,${shadow})`;
});

book.addEventListener('pointerup', e => {
  if (!dragging) return;
  dragging = false;

  const delta = e.clientX - startX;

  if (Math.abs(delta) > 120) {
    direction === 'next'
      ? index = Math.min(index + 1, spreads.length - 1)
      : index = Math.max(index - 1, 0);
  }

  if (activePage) {
    activePage.style.transform = '';
    activePage.style.boxShadow = '';
  }

  activePage = null;
  render();
});
