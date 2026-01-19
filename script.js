let album = [];
let index = 0;

const albumEl = document.getElementById('album');
const coverImg = document.getElementById('coverImg');
const leftPage = document.querySelector('.left-wrap .page');
const rightPage = document.querySelector('.right-wrap .page');
const leftImg = document.getElementById('leftImg');
const rightImg = document.getElementById('rightImg');
const counter = document.getElementById('counter');

let startX = 0;
let dragging = false;

fetch('album.json', { cache: 'no-store' })
  .then(r => r.json())
  .then(data => {
    album = data;
    render();
  });

function setImg(img, src) {
  img.src = src ? encodeURI(src) : '';
}

function render() {
  const page = album[index];

  leftPage.classList.remove('turn');
  rightPage.classList.remove('turn');

  if (page.type === 'capa' || page.type === 'contracapa') {
    albumEl.className = 'album closed';
    setImg(coverImg, page.image);
    counter.innerText = page.type.toUpperCase();
    return;
  }

  albumEl.className = 'album open';

  if (page.type === 'spread') {
    setImg(leftImg, page.image);
    setImg(rightImg, page.image);
  } else {
    setImg(leftImg, page.image);
    setImg(rightImg, album[index + 1]?.image);
  }

  counter.innerText = `Páginas ${index + 1} – ${index + 2}`;
}

/* ===== VIRADA FÍSICA ===== */
function turn(direction) {
  const page = direction === 'next' ? rightPage : leftPage;
  page.classList.add('turn');

  page.style.setProperty('--angle', direction === 'next' ? '-18deg' : '18deg');
  page.style.setProperty('--skew', direction === 'next' ? '-2deg' : '2deg');
  page.style.setProperty('--scale', '0.96');
  page.style.setProperty('--shadow-x', direction === 'next' ? '-40px' : '40px');
  page.style.setProperty('--shadow-opacity', '0.45');

  setTimeout(() => {
    index += direction === 'next'
      ? (index === 0 ? 1 : 2)
      : (index <= 1 ? -1 : -2);

    index = Math.max(0, Math.min(index, album.length - 1));
    render();
  }, 420);
}

/* BOTÕES */
document.getElementById('next').onclick = () => turn('next');
document.getElementById('prev').onclick = () => turn('prev');

/* ===== ARRASTE (MOBILE + DESKTOP) ===== */
albumEl.addEventListener('pointerdown', e => {
  startX = e.clientX;
  dragging = true;
});

albumEl.addEventListener('pointerup', e => {
  if (!dragging) return;
  const delta = e.clientX - startX;
  dragging = false;

  if (delta < -60) turn('next');
  if (delta > 60) turn('prev');
});
