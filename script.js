let album = [];
let spreads = [];
let index = 0;

const book = document.getElementById('book');
const coverImg = document.getElementById('coverImg');
const leftImg = document.getElementById('leftImg');
const rightImg = document.getElementById('rightImg');
const counter = document.getElementById('pageCounter');

const leftPage = document.querySelector('.page.left');
const rightPage = document.querySelector('.page.right');

let dragging = false;
let startX = 0;
let currentX = 0;
let activePage = null;
let direction = null;

/* LOAD */
fetch('album.json')
  .then(r => r.json())
  .then(data => {
    album = data;
    build();
    render();
  });

function build() {
  const capa = album.find(p => p.type === 'capa');
  const contra = album.find(p => p.type === 'contracapa');
  const pages = album.filter(p => p !== capa && p !== contra);

  spreads.push({ type: 'capa', image: capa.image });

  for (let i = 0; i < pages.length; i += 2) {
    spreads.push({
      type: 'spread',
      left: pages[i]?.image,
      right: pages[i + 1]?.image
    });
  }

  spreads.push({ type: 'contracapa', image: contra.image });
}

function render() {
  const s = spreads[index];

  if (s.type === 'capa' || s.type === 'contracapa') {
    book.classList.remove('open');
    coverImg.src = s.image;
    counter.innerText = s.type.toUpperCase();
    return;
  }

  book.classList.add('open');
  leftImg.src = s.left || '';
  rightImg.src = s.right || '';
  counter.innerText = `PÁGINAS ${index} / ${spreads.length - 2}`;
}

/* INTERAÇÃO */
book.addEventListener('pointerdown', e => {
  if (!book.classList.contains('open')) {
    index++;
    render();
    return;
  }

  dragging = true;
  startX = e.clientX;

  const rect = book.getBoundingClientRect();
  const center = rect.left + rect.width / 2;

  if (e.clientX > center) {
    activePage = rightPage;
    direction = 'next';
  } else {
    activePage = leftPage;
    direction = 'prev';
  }
});

book.addEventListener('pointermove', e => {
  if (!dragging || !activePage) return;

  currentX = e.clientX;
  const delta = currentX - startX;
  const width = book.offsetWidth / 2;
  const progress = Math.max(-1, Math.min(1, delta / width));

  const angle = progress * 180;
  const shadow = Math.abs(progress) * 0.6;

  activePage.style.transform = `rotateY(${angle}deg)`;
  activePage.style.boxShadow =
    `${-angle}px 0 60px rgba(0,0,0,${shadow})`;
});

book.addEventListener('pointerup', () => {
  if (!dragging) return;
  dragging = false;

  if (Math.abs(currentX - startX) > 120) {
    direction === 'next' ? index++ : index--;
    render();
  }

  activePage.style.transform = '';
  activePage.style.boxShadow = '';
  activePage = null;
});

/* BOTÕES */
document.querySelector('.next').onclick = () => {
  if (index < spreads.length - 1) {
    index++;
    render();
  }
};

document.querySelector('.prev').onclick = () => {
  if (index > 0) {
    index--;
    render();
  }
};
