let album = [];
let spreads = [];
let index = 0;

const book = document.getElementById('book');
const leftImg = document.getElementById('leftImg');
const rightImg = document.getElementById('rightImg');
const counter = document.getElementById('pageCounter');

const btnNext = document.querySelector('.nav.next');
const btnPrev = document.querySelector('.nav.prev');

const rightPage = document.querySelector('.page.right');
const shadow = document.querySelector('.shadow');

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

  book.classList.toggle('closed', index === 0);

  leftImg.src = s.left || '';
  rightImg.src = s.right || '';

  counter.innerText =
    s.type === 'capa'
      ? 'CAPA'
      : s.type === 'contracapa'
        ? 'CONTRACAPA'
        : `PÁGINAS ${index}`;
}

/* ===============================
   FLIP NEXT — DIAGONAL
================================ */
function flipNext() {
  if (index >= spreads.length - 1) return;

  rightPage.style.transition =
    'transform 1.2s cubic-bezier(.4,.0,.2,1)';
  shadow.style.transition = 'opacity 1.2s ease';

  shadow.style.opacity = 1;
  rightPage.style.transform =
    'rotateZ(-8deg) rotateY(-140deg)';

  setTimeout(() => {
    rightPage.style.transition = '';
    rightPage.style.transform = '';
    shadow.style.opacity = 0;

    index++;
    render();
  }, 1200);
}

/* ===============================
   FLIP PREV — SIMÉTRICO
================================ */
function flipPrev() {
  if (index <= 0) return;

  index--;
  render();

  rightPage.style.transform =
    'rotateZ(8deg) rotateY(140deg)';
  shadow.style.opacity = 1;

  setTimeout(() => {
    rightPage.style.transform = '';
    shadow.style.opacity = 0;
  }, 800);
}

btnNext.onclick = flipNext;
btnPrev.onclick = flipPrev;
