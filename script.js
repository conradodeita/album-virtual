let pages = [];
let current = 0;

const leftImg = document.getElementById('leftImg');
const rightImg = document.getElementById('rightImg');
const rightPage = document.querySelector('.page.right');
const counter = document.getElementById('pageCounter');

const btnNext = document.querySelector('.nav.next');
const btnPrev = document.querySelector('.nav.prev');

/* LOAD */
fetch('album.json', { cache: 'no-store' })
  .then(r => r.json())
  .then(data => {
    pages = data.filter(p => p.type === 'pagina').map(p => p.image);
    render();
  });

/* RENDER */
function render() {
  leftImg.src = pages[current] || '';
  rightImg.src = pages[current + 1] || '';
  counter.innerText = `PÁGINAS ${current + 1} – ${current + 2}`;
}

/* FLIP NEXT — SENTIDO FÍSICO CORRETO */
function flipNext() {
  if (current + 2 >= pages.length) return;

  rightPage.style.transition =
    'transform 1.8s cubic-bezier(.25,.8,.25,1), box-shadow 1.8s ease';

  rightPage.style.boxShadow =
    '-80px 0 100px rgba(0,0,0,.45)';

  /* ⚠️ CHAVE DA CORREÇÃO ⚠️
     rotateY POSITIVO + translateX NEGATIVO
     folha ENTRA no livro
  */
  rightPage.style.transform = `
    rotateZ(-12deg)
    translateX(-55%)
    rotateY(160deg)
  `;

  setTimeout(() => {
    rightPage.style.transition = '';
    rightPage.style.transform = '';
    rightPage.style.boxShadow = '';
    current += 2;
    render();
  }, 1800);
}

/* FLIP PREV */
function flipPrev() {
  if (current <= 0) return;
  current -= 2;
  render();
}

btnNext.onclick = flipNext;
btnPrev.onclick = flipPrev;
