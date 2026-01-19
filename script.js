let album = [];
let spreads = [];
let index = 0;

const book = document.getElementById('book');
const leftImg = document.getElementById('leftImg');
const rightImg = document.getElementById('rightImg');
const flipPage = document.getElementById('flipPage');
const flipImg = document.getElementById('flipImg');
const counter = document.getElementById('pageCounter');

const btnNext = document.querySelector('.nav.next');
const btnPrev = document.querySelector('.nav.prev');

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
   VIRADA CORRETA (NEXT)
================================ */
function flipNext() {
  if (index >= spreads.length - 1) return;

  // página fantasma nasce no lado direito
  flipImg.src = rightImg.src;
  flipPage.style.display = 'block';
  flipPage.style.right = '0';
  flipPage.style.left = 'auto';
  flipPage.style.transformOrigin = 'right center';
  flipPage.style.transform = 'rotateY(0deg)';

  flipPage.animate(
    [
      { transform: 'rotateY(0deg)' },
      { transform: 'rotateY(180deg)' }
    ],
    {
      duration: 1500,
      easing: 'cubic-bezier(.4,0,.2,1)',
      fill: 'forwards'
    }
  );

  setTimeout(() => {
    flipPage.style.display = 'none';
    index++;
    render();
  }, 1500);
}

/* ===============================
   VOLTAR (SEM ANIMAÇÃO AINDA)
================================ */
btnPrev.onclick = () => {
  if (index > 0) {
    index--;
    render();
  }
};

btnNext.onclick = flipNext;
