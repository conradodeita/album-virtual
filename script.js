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

fetch('album.json', { cache: 'no-store' })
  .then(r => r.json())
  .then(data => {
    album = data;
    preload();
    render();
  });

function setImg(el, src) {
  el.src = src ? encodeURI(src) : '';
}

/* PRELOAD */
function preload() {
  [-2, -1, 0, 1, 2].forEach(offset => {
    const p = album[index + offset];
    if (p?.image) {
      const img = new Image();
      img.src = encodeURI(p.image);
    }
  });
}

function render() {
  const page = album[index];

  leftPage.style.transform = '';
  rightPage.style.transform = '';

  if (page.type === 'capa' || page.type === 'contracapa') {
    book.className = 'book closed';
    setImg(coverImg, page.image);
    counter.innerText = page.type.toUpperCase();
    return;
  }

  book.className = 'book open';
  setImg(leftImg, page.image);
  setImg(rightImg, album[index + 1]?.image);

  preload();
  counter.innerText = `Páginas ${index + 1} – ${index + 2}`;
}

/* ===== ARRASTE FÍSICO ===== */
book.addEventListener('pointerdown', e => {
  startX = e.clientX;
  dragging = true;

  activePage = e.clientX > window.innerWidth / 2
    ? rightPage
    : leftPage;
});

book.addEventListener('pointermove', e => {
  if (!dragging) return;

  currentX = e.clientX;
  const delta = currentX - startX;
  const progress = Math.max(-1, Math.min(1, delta / 300));

  const angle = progress * 35;
  const skew = progress * 4;
  const scale = 1 - Math.abs(progress) * 0.06;
  const shadow = Math.abs(progress) * 0.6;

  activePage.style.transform =
    `rotateY(${angle}deg) skewY(${skew}deg) scaleX(${scale})`;
  activePage.style.boxShadow =
    `${-angle * 2}px 0 40px rgba(0,0,0,${shadow})`;
});

book.addEventListener('pointerup', () => {
  if (!dragging) return;
  dragging = false;

  const delta = currentX - startX;

  if (delta < -120) finalize('next');
  else if (delta > 120) finalize('prev');
  else resetPage();
});

function resetPage() {
  activePage.style.transition = 'transform .4s ease';
  activePage.style.transform = '';
  activePage.style.boxShadow = '';
  setTimeout(() => activePage.style.transition = '', 400);
}

function finalize(dir) {
  activePage.style.transition = 'transform .4s ease';
  activePage.style.transform =
    dir === 'next'
      ? 'rotateY(-160deg)'
      : 'rotateY(160deg)';

  setTimeout(() => {
    index += dir === 'next'
      ? (index === 0 ? 1 : 2)
      : (index <= 1 ? -1 : -2);

    index = Math.max(0, Math.min(index, album.length - 1));
    activePage.style.transition = '';
    activePage.style.transform = '';
    activePage.style.boxShadow = '';
    render();
  }, 380);
}

/* BOTÕES */
document.querySelector('.next').onclick = () => finalize('next');
document.querySelector('.prev').onclick = () => finalize('prev');
