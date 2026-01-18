let album = [];
let index = 0;

const left = document.getElementById('left');
const right = document.getElementById('right');
const counter = document.getElementById('counter');

fetch('album.json')
  .then(response => response.json())
  .then(data => {
    album = data;
    render();
  });

function render() {
  const current = album[index];

  left.className = 'page left';
  right.className = 'page right';

  if (!current) return;

  if (current.type === 'capa' || current.type === 'contracapa') {
    left.style.backgroundImage = `url(${current.image})`;
    right.style.backgroundImage = 'none';
    counter.innerText = current.type.toUpperCase();
    return;
  }

  if (current.type === 'spread') {
    left.style.backgroundImage = `url(${current.image})`;
    right.style.backgroundImage = `url(${current.image})`;
    left.classList.add('spread');
    right.classList.add('spread');
    counter.innerText = `Páginas ${index}–${index + 1}`;
    return;
  }

  const next = album[index + 1];

  left.style.backgroundImage = `url(${current.image})`;
  right.style.backgroundImage = next ? `url(${next.image})` : 'none';

  counter.innerText = `Páginas ${index}–${index + 1}`;
}

function nextPage() {
  if (index < album.length - 1) {
    right.classList.add('turning');
    setTimeout(() => {
      index += 2;
      render();
      right.classList.remove('turning');
    }, 650);
  }
}

function prevPage() {
  if (index > 0) {
    left.classList.add('turning');
    setTimeout(() => {
      index -= 2;
      render();
      left.classList.remove('turning');
    }, 650);
  }
}

right.addEventListener('click', nextPage);
left.addEventListener('click', prevPage);

document.getElementById('next').onclick = nextPage;
document.getElementById('prev').onclick = prevPage;
