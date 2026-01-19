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
const curl = document.querySelector('.curl');

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

  if (index === 0) book.classList.add('closed');
  else book.classList.remove('closed');

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
   PAGE CURL NEXT
================================ */
function flipNext() {
  if (index >= spreads.length - 1) return;

  curl.style.transition = 'width 0.9s ease';
  curl.style.width = '55%';

  rightPage.style.transition = 'transform 0.9s ease';
  rightPage.style.transform = 'translateX(-50%)';

  setTimeout(() => {
    curl.style.transition = '';
    curl.style.width = '0%';

    rightPage.style.transition = '';
    rightPage.style.transform = '';

    index++;
    render();
  }, 900);
}

/* ===============================
   PAGE CURL PREV
================================ */
function flipPrev() {
  if (index <= 0) return;

  index--;
  render();

  curl.style.width = '55%';
  rightPage.style.transform = 'translateX(50%)';

  setTimeout(() => {
    curl.style.width = '0%';
    rightPage.style.transform = '';
  }, 600);
}

btnNext.onclick = flipNext;
btnPrev.onclick = flipPrev;
