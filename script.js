let album = [];
let index = 0;

const single = document.getElementById('single');
const left   = document.getElementById('left');
const right  = document.getElementById('right');

const prev = document.getElementById('prev');
const next = document.getElementById('next');
const counter = document.getElementById('counter');

fetch('album.json', { cache: 'no-store' })
  .then(r => r.json())
  .then(data => {
    album = data;
    render();
  });

function setBg(el, src) {
  if (!src) {
    el.style.backgroundImage = 'none';
    return;
  }
  el.style.backgroundImage = `url("${encodeURI(src)}")`;
}

function render() {
  const page = album[index];

  single.style.display = 'none';
  left.style.display = 'block';
  right.style.display = 'block';

  if (page.type === 'capa' || page.type === 'contracapa') {
    single.style.display = 'block';
    left.style.display = 'none';
    right.style.display = 'none';

    setBg(single, page.image);
    counter.innerText = page.type.toUpperCase();
    return;
  }

  if (page.type === 'spread') {
    setBg(left, page.image);
    setBg(right, page.image);
    counter.innerText = `Páginas ${index + 1}–${index + 2}`;
    return;
  }

  setBg(left, page.image);
  setBg(right, album[index + 1]?.image);
  counter.innerText = `Páginas ${index + 1}–${index + 2}`;
}

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

next.onclick = nextPage;
prev.onclick = prevPage;
right.onclick = nextPage;
left.onclick = prevPage;
