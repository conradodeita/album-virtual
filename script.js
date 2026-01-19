let album = [];
let index = 0;

const book = document.getElementById('book');
const coverImg = document.getElementById('coverImg');
const leftImg = document.getElementById('leftImg');
const rightImg = document.getElementById('rightImg');
const counter = document.getElementById('pageCounter');

const leftPage = document.querySelector('.page.left');
const rightPage = document.querySelector('.page.right');

let startX = 0;
let dragging = false;

fetch('album.json', { cache: 'no-store' })
  .then(r => r.json())
  .then(data => {
    album = data;
    render();
  });

function setImg(el, src) {
  el.src = src ? encodeURI(src) : '';
}

function render() {
  const page = album[index];

  leftPage.classList.remove('turning');
  rightPage.classList.remove('turning');

  if (page.type === 'capa' || page.type === 'contracapa') {
    book.className = 'book closed';
    setImg(coverImg, page.image);
    counter.innerText = page.type.toUpperCase();
    return;
  }

  book.className = 'book open';

  setImg(leftImg, page.image);
  setImg(rightImg, album[index + 1]?.image);

  counter.innerText = `Páginas ${index + 1} – ${index + 2}`;
}

function turn(dir) {
  const page = dir === 'next' ? rightPage : leftPage;

  page.classList.add('turning');
  page.style.setProperty('--angle', dir === 'next' ? '-18deg' : '18deg');
  page.style.setProperty('--skew', dir === 'next' ? '-2deg' : '2deg');
  page.style.setProperty('--scale', '0.96');
  page.style.setProperty('--shadow-x', dir === 'next' ? '-40px' : '40px');
  page.style.setProperty('--shadow', '0.45');

  setTimeout(() => {
    index += dir === 'next'
      ? (index === 0 ? 1 : 2)
      : (index <= 1 ? -1 : -2);

    index = Math.max(0, Math.min(index, album.length - 1));
    render();
  }, 420);
}

/* BOTÕES */
document.querySelector('.next').onclick = () => turn('next');
document.querySelector('.prev').onclick = () => turn('prev');

/* ARRASTE */
book.addEventListener('pointerdown', e => {
  startX = e.clientX;
  dragging = true;
});

book.addEventListener('pointerup', e => {
  if (!dragging) return;
  dragging = false;
  const delta = e.clientX - startX;

  if (delta < -60) turn('next');
  if (delta > 60) turn('prev');
});
