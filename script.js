let album = [];
let spreads = [];
let index = 0;

const book = document.getElementById('book');
const leftImg = document.getElementById('leftImg');
const rightImg = document.getElementById('rightImg');
const counter = document.getElementById('pageCounter');

const leftPage = document.querySelector('.page.left');
const rightPage = document.querySelector('.page.right');

const btnNext = document.querySelector('.nav.next');
const btnPrev = document.querySelector('.nav.prev');

/* LOAD */
fetch('album.json', { cache: 'no-store' })
.then(r => r.json())
.then(data => {
album = data;
buildSpreads();
render();
autoFlip();
});

/* BUILD */
function buildSpreads() {
const capa = album.find(p => p.type === 'capa');
const contra = album.find(p => p.type === 'contracapa');
const pages = album.filter(p => p.type === 'pagina');

spreads = [];

// Capa no lado direito, esquerdo vazio
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

/* RENDER */
function render() {
const s = spreads[index];
if (!s) return;

leftImg.src = s.left || '';
rightImg.src = s.right || '';

leftImg.style.visibility = s.left ? 'visible' : 'hidden';

counter.innerText =
s.type === 'capa'
? 'CAPA'
: s.type === 'contracapa'
? 'CONTRACAPA'
: `PÁGINAS ${index} / ${spreads.length - 2}`;
}

/* FLIP NEXT (CORRETO) */
function flipNext() {
if (index >= spreads.length - 1) return;

rightPage.style.transition =
'transform 1.6s cubic-bezier(.22,.61,.36,1), box-shadow 1.6s ease';

rightPage.style.boxShadow =
'-60px 0 80px rgba(0,0,0,.45)';

rightPage.style.transform = `     rotateZ(-14deg)
    translateX(-45%)
    rotateY(-155deg)
  `;

setTimeout(() => {
rightPage.style.transition = '';
rightPage.style.transform = '';
rightPage.style.boxShadow = '';
index++;
render();
}, 1600);
}

/* FLIP PREV */
function flipPrev() {
if (index <= 0) return;

index--;
render();
}

/* BOTÕES */
btnNext.onclick = flipNext;
btnPrev.onclick = flipPrev;

/* AUTO LOOP (DESKTOP) */
function autoFlip() {
if (window.innerWidth < 900) return;

setInterval(() => {
if (index >= spreads.length - 1) {
index = 0;
render();
} else {
flipNext();
}
}, 4200);
}
