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
   AUTO FOLHEAR (DESKTOP LOOP)
================================ */
let autoFlipTimer = null;
let autoFlipActive = false;
let autoDirection = 'forward';

const isDesktop = () =>
  window.matchMedia('(pointer: fine)').matches &&
  window.innerWidth > 900;

function startAutoFlip() {
  if (!isDesktop() || autoFlipActive) return;
  autoFlipActive = true;
  autoFlipTimer = setTimeout(autoFlipStep, 3800);
}

function stopAutoFlip() {
  autoFlipActive = false;
  clearTimeout(autoFlipTimer);
}

function autoFlipStep() {
  if (!autoFlipActive) return;

  // FINAL → voltar para capa
  if (index >= spreads.length - 1) {
    autoCloseAndRestart();
    return;
  }

  autoFlipAnimation(() => {
    index++;
    render();
    autoFlipTimer = setTimeout(autoFlipStep, 3800);
  });
}

/* ===============================
   FECHA E RECOMEÇA
================================ */
function autoCloseAndRestart() {
  // pequena pausa na contracapa
  setTimeout(() => {
    book.classList.add('closed');

    // delay visual de “fechar”
    setTimeout(() => {
      index = 0;
      render();

      // pausa na capa
      setTimeout(() => {
        book.classList.remove('closed');
        autoFlipTimer = setTimeout(autoFlipStep, 3600);
      }, 2200);

    }, 1200);
  }, 2200);
}

/* ===============================
   ANIMAÇÃO DE FOLHEAR
================================ */
function autoFlipAnimation(done) {
  const page = rightPage;

  // antecipação
  page.style.transition = 'transform .6s cubic-bezier(.25,0,.3,1)';
  page.style.transform = 'rotateY(-14deg)';
  page.style.boxShadow = '-22px 0 45px rgba(0,0,0,.25)';

  setTimeout(() => {
    // virada principal
    page.style.transition = 'transform 1.2s cubic-bezier(.4,0,.2,1)';
    page.style.transform = 'rotateY(-168deg)';
    page.style.boxShadow = '-70px 0 90px rgba(0,0,0,.38)';

    setTimeout(() => {
      page.style.transition = '';
      page.style.transform = '';
      page.style.boxShadow = '';

      done && done();
    }, 1250);
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

    // inicia automático
    setTimeout(startAutoFlip, 4200);
  });

function buildSpreads() {
  const capa = album.find(p => p.type === 'capa');
  const contra = album.find(p => p.type === 'contracapa');
  const pages = album.filter(p => p !== capa && p !== contra);

  spreads = [];

  // CAPA (lado direito apenas)
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

/* ===============================
   RENDER
================================ */
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
   BOTÕES (CANCELA AUTO)
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
