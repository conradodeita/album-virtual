/* ==============================
ÁLBUM VIRTUAL – CARREGAMENTO
============================== */

let album = [];
let index = 0;

// Elementos do DOM
const leftPage  = document.getElementById('left');
const rightPage = document.getElementById('right');
const nextBtn   = document.getElementById('next');
const prevBtn   = document.getElementById('prev');
const counter   = document.getElementById('counter');

/* ==============================
CARREGA O JSON DO ÁLBUM
============================== */

fetch('album.json', { cache: 'no-store' })
.then(res => {
if (!res.ok) throw new Error('Falha ao carregar album.json');
return res.json();
})
.then(data => {
album = data;
preloadImages();
render();
})
.catch(err => console.error(err));

/* ==============================
PRÉ-CARREGAMENTO SEGURO
============================== */

function preloadImages() {
[index, index + 1, index + 2].forEach(i => {
if (album[i] && album[i].image) {
const img = new Image();
img.src = encodeURI(album[i].image);
}
});
}

/* ==============================
APLICA IMAGEM COM encodeURI
============================== */

function applyBackground(element, src) {
if (!src) {
element.style.backgroundImage = 'none';
return;
}

const safeSrc = encodeURI(src);
const img = new Image();

img.onload = () => {
element.style.backgroundImage = `url("${safeSrc}")`;
};

img.onerror = () => {
console.error('Erro ao carregar imagem:', safeSrc);
element.style.backgroundImage = 'none';
};

img.src = safeSrc;
}

/* ==============================
RENDERIZAÇÃO DAS PÁGINAS
============================== */

function render() {
const current = album[index];
const next = album[index + 1];

leftPage.className  = 'page left';
rightPage.className = 'page right';

if (!current) return;

// Capa ou contracapa
if (current.type === 'capa' || current.type === 'contracapa') {
applyBackground(leftPage, current.image);
applyBackground(rightPage, null);
counter.innerText = current.type.toUpperCase();
preloadImages();
return;
}

// Spread (imagem dupla)
if (current.type === 'spread') {
applyBackground(leftPage, current.image);
applyBackground(rightPage, current.image);
counter.innerText = `Páginas ${index + 1}–${index + 2}`;
preloadImages();
return;
}

// Páginas normais
applyBackground(leftPage, current.image);
applyBackground(rightPage, next ? next.image : null);
counter.innerText = `Páginas ${index + 1}–${index + 2}`;
preloadImages();
}

/* ==============================
NAVEGAÇÃO
============================== */

function nextPage() {
if (index < album.length - 1) {
index += 2;
render();
}
}

function prevPage() {
if (index > 0) {
index -= 2;
render();
}
}

nextBtn.addEventListener('click', nextPage);
prevBtn.addEventListener('click', prevPage);

rightPage.addEventListener('click', nextPage);
leftPage.addEventListener('click', prevPage);
