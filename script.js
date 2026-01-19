let album = [];
let spreads = [];
let spreadIndex = 0;

/* ELEMENTOS */
const book = document.getElementById('book');
const coverImg = document.getElementById('coverImg');
const leftImg = document.getElementById('leftImg');
const rightImg = document.getElementById('rightImg');
const counter = document.getElementById('pageCounter');

const leftPage = document.querySelector('.page.left');
const rightPage = document.querySelector('.page.right');

let startX = 0;
let currentX = 0;
let dragging = false;
let activePage = null;

/* ===============================
   LOAD
================================ */
fetch('album.json', { cache: 'no-store' })
  .then(r => r.json())
  .then(data => {
    album = data;
    buildSpreads();
    render();
    preload();
  });

/* ===============================
   BUILD SPREADS (CHAVE!)
================================ */
function buildSpreads() {
  spreads = [];

  // capa
  spreads.push({ type: 'capa', image: album[0].image });

  // miolo (pares)
  for (let i = 1; i < album.length - 1; i += 2) {
    spreads.push({
      type: 'spread',
      left: album[i]?.image,
      right: album[i + 1]?.image
    });
  }

  // contracapa
  spreads.push({
    type: 'contracapa',
    image: album[album.length - 1].image
  });
}

/* ===============================
   UTIL
================================ */
function setImg(el, src) {
  el.src = src ? encodeURI(src) : '';
}

/* ===============================
   PRELOAD
================================ */
function preload() {
  [-1, 0, 1].forEach(offset => {
    const s = spreads[spreadIndex + offset];
    if (!s) return;

    if (s.left) new Image().src = encodeURI(s.left);
    if (s.right) new Image().src = encodeURI(s.right);
    if (s.image) new Image().src = encodeURI(s.image);
  });
}

/* ===============================
   RENDER
================================ */
function render() {
  const s = spreads[spreadIndex];

  [leftPage, rightPage].forEach(p => {
    p.style.transform = '';
    p.style.boxShadow = '';
    p.style.transition = '';
  });

  if (s.type === 'capa' || s.type === 'contracapa') {
    book.className = 'book closed';
    setImg(coverImg, s.image);
    counter.innerText = s.type.toUpperCase();
    return;
  }

  book.className = 'book open';
  setImg(leftImg, s.left);
  setImg(rightImg, s.right);

  counter.innerText = `SPREAD ${spreadIndex}`;
  preload();
}

/* ===============================
   NAVEGAÇÃO
================================ */
function nextSpread() {
  if (spreadIndex < spreads.length - 1) {
    spreadIndex++;
    render();
  }
}

function prevSpread() {
  if (spreadIndex > 0) {
    spreadIndex--;
    render();
  }
}

/* ===============================
   ARRASTE FÍSICO
================================ */
book.addEventListener('pointerdown', e => {
  startX = e.clientX;
  currentX = startX;
  dragging = true;

  activePage =
    e.clientX > window.innerWidth / 2
      ? rightPage
      : leftPage;
});

book.addEventListener('pointermove', e => {
  if (!dragging || !activePage) return;

  currentX = e.clientX;
  const delta = currentX - startX;
  const progress = Math.max(-1, Math.min(1, delta / 280));

  const angle = progress * 35;
  const scale = 1 - Math.abs(progress) * 0.05;
  const shadow = Math.abs(progress) * 0.5;

  activePage.style.transform =
    `rotateY(${angle}deg) scaleX(${scale})`;

  activePage.style.boxShadow =
    `${-angle * 2}px 0 45px rgba(0,0,0,${shadow})`;
});

book.addEventListener('pointerup', () => {
  if (!dragging) return;
  dragging = false;

  const delta = currentX - startX;

  if (delta < -120) finalize('next');
  else if (delta > 120) finalize('prev');
  else resetPage();
});

/* ===============================
   FINALIZAÇÃO
================================ */
function resetPage() {
  activePage.style.transition = 'transform .35s ease';
  activePage.style.transform = '';
  activePage.style.boxShadow = '';
}

function finalize(direction) {
  activePage.style.transition = 'transform .3s ease';
  activePage.style.transform =
    direction === 'next'
      ? 'rotateY(-160deg)'
      : 'rotateY(160deg)';

  setTimeout(() => {
    activePage.style.transition = '';
    activePage.style.transform = '';
    activePage.style.boxShadow = '';

    direction === 'next'
      ? nextSpread()
      : prevSpread();

  }, 320);
}

/* ===============================
   BOTÕES
================================ */
document.querySelector('.next').onclick = () => finalize('next');
document.querySelector('.prev').onclick = () => finalize('prev');
