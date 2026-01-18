/* ===============================
   ÁLBUM VIRTUAL – SCRIPT PRINCIPAL
   =============================== */

let album = [];
let index = 0;

// Elementos
const leftPage   = document.getElementById('left');
const rightPage  = document.getElementById('right');
const btnNext    = document.getElementById('next');
const btnPrev    = document.getElementById('prev');
const counter    = document.getElementById('counter');

/* ===============================
   CARREGA ESTRUTURA DO ÁLBUM
   =============================== */

fetch('album.json')
  .then(response => response.json())
  .then(data => {
    album = data;
    preloadNearby();
    render();
  })
  .catch(err => {
    console.error('Erro ao carregar album.json', err);
  });

/* ===============================
   PRÉ-CARREGAMENTO INTELIGENTE
   =============================== */

function preloadNearby() {
  const toLoad = [index - 2, index, index + 2, index + 4];

  toLoad.forEach(i => {
    if (album[i] && album[i].image) {
      const img = new Image();
      img.src = album[i].image;
    }
  });
}

/* ===============================
   APLICA BACKGROUND COM SEGURANÇA
   =============================== */

function applyBackground(element, src) {
  if (!src) {
    element.style.backgroundImage = 'none';
    return;
  }

  const img = new Image();
  img.onload = () => {
    element.style.backgroundImage = `url(${src})`;
  };
  img.src = src;
}

/* ===============================
   RENDERIZA PÁGINAS
   =============================== */

function render() {
  const current = album[index];

  leftPage.className  = 'page left';
  rightPage.className = 'page right';

  if (!current) return;

  // CAPA / CONTRACAPA
  if (current.type === 'capa' || current.type === 'contracapa') {
    applyBackground(leftPage, current.image);
    applyBackground(rightPage, null);
    counter.innerText = current.type.toUpperCase();
    preloadNearby();
    return;
  }

  // DUPLA (SPREAD)
  if (current.type === 'spread') {
    applyBackground(leftPage, current.image);
    applyBackground(rightPage, current.image);

    leftPage.classList.add('spread');
    rightPage.classList.add('spread');

    counter.innerText = `Páginas ${index + 1}–${index + 2}`;
    preloadNearby();
    return;
  }

  // PÁGINAS NORMAIS
  const next = album[index + 1];

  applyBackground(leftPage, current.image);
  applyBackground(rightPage, next ? next.image : null);

  counter.innerText = `Páginas ${index + 1}–${index + 2}`;
  preloadNearby();
}

/* ===============================
   CONTROLES DE NAVEGAÇÃO
   =============================== */

function nextPage() {
  if (index >= album.length - 1) return;

  rightPage.classList.add('turning');

  setTimeout(() => {
    index += 2;
    render();
    rightPage.classList.remove('turning');
  }, 650);
}

function prevPage() {
  if (index <= 0) return;

  leftPage.classList.add('turning');

  setTimeout(() => {
    index -= 2;
    render();
    leftPage.classList.remove('turning');
  }, 650);
}

/* ===============================
   EVENTOS
   =============================== */

rightPage.addEventListener('click', nextPage);
leftPage.addEventListener('click', prevPage);

btnNext.addEventListener('click', nextPage);
btnPrev.addEventListener('click', prevPage);
