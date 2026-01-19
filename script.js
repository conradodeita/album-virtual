let album = [];
let index = 0;

const albumEl = document.getElementById('album');
const coverImg = document.getElementById('coverImg');
const leftImg  = document.getElementById('leftImg');
const rightImg = document.getElementById('rightImg');
const counter  = document.getElementById('counter');

const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');

fetch('album.json', { cache: 'no-store' })
  .then(r => r.json())
  .then(data => {
    album = data;
    render();
  });

function setImg(imgEl, src) {
  imgEl.src = src ? encodeURI(src) : '';
}

function clearTurns() {
  leftImg.parentElement.classList.remove('turn-left');
  rightImg.parentElement.classList.remove('turn-right');
}

function render(turn = false) {
  const page = album[index];

  clearTurns();

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

  if (turn) {
    leftImg.parentElement.classList.add('turn-left');
    rightImg.parentElement.classList.add('turn-right');
  }
}

function nextPage() {
  if (index < album.length - 1) {
    index += index === 0 ? 1 : 2;
    render(true);
  }
}

function prevPage() {
  if (index > 0) {
    index -= index <= 1 ? 1 : 2;
    render(true);
  }
}

nextBtn.onclick = nextPage;
prevBtn.onclick = prevPage;
rightImg.onclick = nextPage;
leftImg.onclick = prevPage;
