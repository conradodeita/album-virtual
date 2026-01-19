let album = [];
let spreads = [];
let index = 0;

const book = document.getElementById('book');
const leftImg = document.getElementById('leftImg');
const rightImg = document.getElementById('rightImg');
const counter = document.getElementById('pageCounter');

const btnNext = document.querySelector('.nav.next');
const btnPrev = document.querySelector('.nav.prev');

/* ===============================
   AUTO FOLHEAR (DESKTOP)
================================ */
let autoFlipTimer = null;
let autoFlipActive = false;

const isDesktop = () =>
  window.matchMedia('(pointer: fine)').matches &&
  window.innerWidth > 900;

function startAutoFlip() {
  if (!isDesktop() || autoFlipActive) return;

  autoFlipActive = true;

  autoFlipTimer = setInterval(() => {
    if (index < spreads.length - 1) {
      index++;
      render();
    } else {
      stopAutoFlip();
    }
  }, 2600); // tempo entre viradas
}

function stopAutoFlip() {
  autoFlipActive = false;
  clearInterval(autoFlipTimer);
}

/* ===============================
   LOAD
================================ */
fetch('album.json', { cache: 'no-store' })
  .then(r => r.json())
  .then(data => {
    album = data;
    buildSpreads();
    render();

    // inicia automático após alguns segundos
    setTimeout(startAutoFlip, 3000);
  });

function buildSpreads() {
  const capa = album.find(p => p.type === 'capa');
  const contra = album.find(p => p.type === 'contracapa');
  const pages = album.filter(p => p !== capa && p !== contra);

  spreads = [];

  // CAPA
  spreads.push({ left: null, right: capa.image, type: 'capa' });

  // MIOLO
  for (let i = 0; i < pages.length; i += 2) {
    spreads.push({
      left: pages[i]?.image || null,
      right: pages[i + 1]?.image || null,
      type: 'spread'
    });
  }

  // CONTRACAPA
  spreads.push({ left: null, right: contra.image, type: 'contracapa' });
}

function render() {
  const s = spreads[index];
  if (!s) return;

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
   BOTÕES (INTERAÇÃO PARA AUTO)
================================ */
btnNext.onclick = () => {
  stopAutoFlip();
  if (index < spreads.length - 1) {
    index++;
    render();
  }
};

btnPrev.onclick = () => {
  stopAutoFlip();
  if (index > 0) {
    index--;
    render();
  }
};

/* ===============================
   QUALQUER INTERAÇÃO CANCELA AUTO
================================ */
['pointerdown', 'wheel', 'keydown'].forEach(evt => {
  window.addEventListener(evt, stopAutoFlip, { once: true });
});
