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
  })
  .catch(err => console.error("Erro ao carregar album.json:", err));

/* ===============================
   BUILD SPREADS (CHAVE!)
================================ */
function buildSpreads() {
  spreads = [];
  
  if (album.length === 0) return;

  // Encontrar capa e contracapa
  const capa = album.find(item => item.type === 'capa') || album[0];
  const contracapa = album.find(item => item.type === 'contracapa') || album[album.length - 1];
  
  // Itens do miolo (excluindo o que for explicitamente capa ou contracapa por índice ou tipo)
  const mioloItems = album.filter(item => item !== capa && item !== contracapa);

  // Adicionar capa
  spreads.push({ type: 'capa', image: capa.image });

  // Processar miolo
  let i = 0;
  while (i < mioloItems.length) {
    const current = mioloItems[i];
    
    if (current.type === 'spread') {
      // Se for um spread (imagem única que ocupa as duas páginas)
      spreads.push({
        type: 'spread',
        left: current.image,
        right: current.image,
        isFullSpread: true
      });
      i++;
    } else {
      // Se for página normal, tenta pegar a próxima para formar o par
      const next = mioloItems[i + 1];
      if (next && next.type !== 'spread') {
        spreads.push({
          type: 'spread',
          left: current.image,
          right: next.image
        });
        i += 2;
      } else {
        // Página órfã (sem par ou a próxima é um spread)
        spreads.push({
          type: 'spread',
          left: current.image,
          right: null
        });
        i++;
      }
    }
  }

  // Adicionar contracapa
  spreads.push({
    type: 'contracapa',
    image: contracapa.image
  });
}

/* ===============================
   UTIL
================================ */
function setImg(el, src) {
  if (!src) {
    el.src = '';
    el.style.display = 'none';
  } else {
    el.src = encodeURI(src);
    el.style.display = 'block';
  }
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
  if (spreads.length === 0) return;
  
  const s = spreads[spreadIndex];

  [leftPage, rightPage].forEach(p => {
    p.style.transform = '';
    p.style.boxShadow = '';
    p.style.transition = '';
  });

  if (s.type === 'capa' || s.type === 'contracapa') {
    book.classList.add('closed');
    book.classList.remove('open');
    setImg(coverImg, s.image);
    counter.innerText = s.type.toUpperCase();
    return;
  }

  book.classList.remove('closed');
  book.classList.add('open');
  
  setImg(leftImg, s.left);
  setImg(rightImg, s.right);

  // Ajuste visual para imagens que são 'spread' (ocupam as duas páginas)
  if (s.isFullSpread) {
    leftImg.style.objectPosition = 'left center';
    rightImg.style.objectPosition = 'right center';
    leftImg.style.objectFit = 'cover';
    rightImg.style.objectFit = 'cover';
  } else {
    leftImg.style.objectPosition = 'center';
    rightImg.style.objectPosition = 'center';
    leftImg.style.objectFit = 'contain';
    rightImg.style.objectFit = 'contain';
  }

  counter.innerText = `PÁGINA ${spreadIndex} DE ${spreads.length - 1}`;
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
  if (!activePage) return;
  activePage.style.transition = 'transform .35s ease';
  activePage.style.transform = '';
  activePage.style.boxShadow = '';
}

function finalize(direction) {
  if (!activePage) {
    direction === 'next' ? nextSpread() : prevSpread();
    return;
  }

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
const nextBtn = document.querySelector('.next');
const prevBtn = document.querySelector('.prev');

if (nextBtn) nextBtn.onclick = () => finalize('next');
if (prevBtn) prevBtn.onclick = () => finalize('prev');
