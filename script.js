let album = [];
let spreads = [];
let index = 0;

const book = document.getElementById('book');
const leftImg = document.getElementById('leftImg');
const rightImg = document.getElementById('rightImg');
const counter = document.getElementById('pageCounter');

const btnNext = document.querySelector('.nav.next');
const btnPrev = document.querySelector('.nav.prev');

const leftPage = document.querySelector('.page.left');
const rightPage = document.querySelector('.page.right');

/* ===============================
   AUTO FOLHEAR (DESKTOP REALISTA)
================================ */
let autoFlipTimer = null;
let autoFlipActive = false;

const isDesktop = () =>
  window.matchMedia('(pointer: fine)').matches &&
  window.innerWidth > 900;

function startAutoFlip() {
  if (!isDesktop() || autoFlipActive) return;
  autoFlipActive = true;

  autoFlipTimer = setTimeout(autoFlipStep, 3200);
}

function stopAutoFlip() {
  autoFlipActive = false;
  clearTimeout(autoFlipTimer);
}

function autoFlipStep() {
  if (!autoFlipActive) return;

  if (index >= spreads.length - 1) {
    stopAutoFlip();
    return;
  }

  autoFlipAnimation(() => {
    index++;
    render();
    autoFlipTimer = setTimeout(autoFlipStep, 3600);
  });
}

/* ===============================
   ANIMAÇÃO DE FOLHEAR
================================ */
function autoFlipAnimation(done) {
  const page = rightPage;

  // Fase 1 – antecipação (folha começa a ceder)
  page.style.transition = 'transform .6s cubic-bezier(.2,0,.3,1)';
  page.style.transform = 'rotateY(-12deg)';
  page.style.boxShadow = '-20px 0 40px rgba(0,0,0,.25)';

  setTimeout(() => {
    // Fase 2 – virada principal
    page.style.transition = 'transform 1.1s cubic-bezier(.4,0,.2,1)';
    page.style.transform = 'rotateY(-165deg)';
    page.style.boxShadow = '-60px 0 80px rgba(0,0,0,.35)';

    setTimeout(() => {
      // Reset visual
      page.style.transition = '';
      page.style.transform = '';
      page.style.boxShadow = '';

      done && done();
    }, 1150);
  }, 650);
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
    setTimeout(startAutoFlip, 4000);
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
   BOTÕES (INTERROMPE AUTO)
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
   QUALQUER INTERAÇÃO PARA AUTO
================================ */
['pointerdown', 'wheel', 'keydown'].forEach(evt => {
  window.addEventListener(evt, stopAutoFlip, { once: true });
});
