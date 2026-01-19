let album = [];
let index = 0;

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
    render();
    preload();
  });

function setImg(el, src) {
  el.src = src ? encodeURI(src) : '';
}

/* ===============================
   PRELOAD INTELIGENTE
================================ */
function preload() {
  const candidates = [
    index - 2,
    index - 1,
    index,
    index + 1,
    index + 2,
    index + 3
  ];

  candidates.forEach(i => {
    if (album[i]?.image) {
      const img = new Image();
      img.src = encodeURI(album[i].image);
    }
  });
}

/* ===============================
   RENDER
================================ */
function render() {
  const page = album[index];

  // reset visual
  [leftPage, rightPage].forEach(p => {
    p.style.transform = '';
    p.style.boxShadow = '';
    p.style.transition = '';
  });

  /* CAPA / CONTRACAPA */
  if (page.type === 'capa' || page.type === 'contracapa') {
    book.className = 'book closed';
    setImg(coverImg, page.image);
    counter.innerText = page.type.toUpperCase();
    return;
  }

  /* MIOLO */
  book.className = 'book open';

  setImg(leftImg, album[index]?.image);
  setImg(rightImg, album[index + 1]?.image);

  counter.innerText = `Páginas ${index + 1} – ${index + 2}`;
  preload();
}

/* ===============================
   PAGINAÇÃO SEGURA
================================ */
function nextIndex() {
  // capa → primeira dupla
  if (index === 0) return 1;

  // miolo → avança 2
  if (index + 2 < album.length - 1) return index + 2;

  // última dupla → contracapa
  return album.length - 1;
}

function prevIndex() {
  // contracapa → última dupla
  if (index === album.length - 1) return album.length - 3;

  // miolo → volta 2
  if (index - 2 >= 1) return index - 2;

  // volta para capa
  return 0;
}

/* ===============================
   ARRASTE CONTÍNUO
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
  activePage.style.transition = 'transform .4s ease';
  activePage.style.transform = '';
  activePage.style.boxShadow = '';
}

function finalize(direction) {
  activePage.style.transition = 'transform .35s ease';

  activePage.style.transform =
    direction === 'next'
      ? 'rotateY(-160deg)'
      : 'rotateY(160deg)';

  setTimeout(() => {
    index =
      direction === 'next'
        ? nextIndex()
        : prevIndex();

    activePage.style.transition = '';
    activePage.style.transform = '';
    activePage.style.boxShadow = '';

    render();
  }, 360);
}

/* ===============================
   BOTÕES
================================ */
document.querySelector('.next').onclick = () => finalize('next');
document.querySelector('.prev').onclick = () => finalize('prev');
