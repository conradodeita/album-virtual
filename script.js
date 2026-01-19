let album = [];
let index = 0;

const albumEl = document.getElementById('album');
const cover   = document.getElementById('cover');
const left    = document.getElementById('left');
const right   = document.getElementById('right');
const counter = document.getElementById('counter');

const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');

fetch('album.json', { cache: 'no-store' })
  .then(r => r.json())
  .then(data => {
    album = data;
    render();
  });

function setBg(el, img) {
  el.style.backgroundImage = img ? `url("${encodeURI(img)}")` : 'none';
}

function render() {
  const page = album[index];

  if (page.type === 'capa' || page.type === 'contracapa') {
    albumEl.className = 'album closed';
    setBg(cover, page.image);
    counter.innerText = page.type.toUpperCase();
    return;
  }

  albumEl.className = 'album open';

  if (page.type === 'spread') {
    setBg(left, page.image);
    setBg(right, page.image);
  } else {
    setBg(left, page.image);
    setBg(right, album[index + 1]?.image);
  }

  counter.innerText = `Páginas ${index + 1} – ${index + 2}`;
}

function nextPage() {
  if (index < album.length - 1) {
    index += index === 0 ? 1 : 2;
    render();
  }
}

function prevPage() {
  if (index > 0) {
    index -= index <= 1 ? 1 : 2;
    render();
  }
}

nextBtn.onclick = nextPage;
prevBtn.onclick = prevPage;
right.onclick = nextPage;
left.onclick = prevPage;
