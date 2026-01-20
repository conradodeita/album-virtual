let pages = [];
let current = 0;
let isAnimating = false;

const leftImg = document.getElementById('leftImg');
const rightImg = document.getElementById('rightImg');
const flipImg = document.getElementById('flipImg');
const flipPage = document.getElementById('flipPage');
const counter = document.getElementById('pageCounter');
const btnNext = document.querySelector('.nav.next');
const btnPrev = document.querySelector('.nav.prev');

// Carregar páginas do JSON
fetch('album.json', { cache: 'no-store' })
  .then(r => r.json())
  .then(data => {
    pages = data;
    render();
    updateButtons();
    if (window.innerWidth <= 768) addSwipeHint();
  });

function render() {
  // Mostrar página esquerda
  leftImg.src = pages[current]?.image || '';
  leftImg.style.opacity = '1';
  
  // Mostrar página direita (se existir)
  if (pages[current + 1]) {
    rightImg.src = pages[current + 1].image;
    rightImg.style.opacity = '1';
    rightImg.style.display = 'block';
  } else {
    rightImg.style.display = 'none';
  }
  
  updateCounter();
}

function updateCounter() {
  const total = pages.length;
  const currentPage = Math.floor(current / 2) + 1;
  const totalPages = Math.ceil(total / 2);
  
  const leftPage = pages[current];
  const rightPage = pages[current + 1];
  const isDoublePage = leftPage && rightPage && 
                      (leftPage.image.includes('_esq') && rightPage.image.includes('_dir'));
  
  let text = `Página ${currentPage} de ${totalPages}`;
  if (isDoublePage) text += " (Página Dupla)";
  counter.textContent = text;
}

function updateButtons() {
  btnPrev.disabled = current <= 0 || isAnimating;
  btnNext.disabled = current + 2 >= pages.length || isAnimating;
}

function flipNext() {
  if (isAnimating || current + 2 >= pages.length) return;
  
  isAnimating = true;
  updateButtons();
  
  const isMobile = window.innerWidth <= 768;
  const flipDuration = isMobile ? 800 : 1200;
  
  flipImg.src = pages[current + 1].image;
  flipPage.style.display = 'flex';
  flipPage.style.transform = 'rotateY(0deg)';
  rightImg.style.opacity = '0';
  
  setTimeout(() => {
    flipPage.style.transition = `transform ${flipDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    flipPage.style.transform = 'rotateY(-180deg)';
    
    if (isMobile) {
      flipPage.style.boxShadow = '-15px 0 30px rgba(0,0,0,0.2), inset -3px 0 5px rgba(0,0,0,0.1)';
    } else {
      flipPage.style.boxShadow = '-30px 0 50px rgba(0,0,0,0.3), inset -5px 0 10px rgba(0,0,0,0.1)';
    }
  }, 50);
  
  setTimeout(() => {
    current += 2;
    flipPage.style.transition = 'none';
    flipPage.style.transform = 'rotateY(0deg)';
    flipPage.style.display = 'none';
    flipPage.style.boxShadow = 'none';
    render();
    isAnimating = false;
    updateButtons();
    removeSwipeHint();
  }, flipDuration + 50);
}

function flipPrev() {
  if (isAnimating || current <= 0) return;
  
  isAnimating = true;
  updateButtons();
  
  const isMobile = window.innerWidth <= 768;
  const flipDuration = isMobile ? 800 : 1200;
  
  current -= 2;
  flipImg.src = pages[current + 1]?.image || '';
  flipPage.style.display = 'flex';
  flipPage.style.transform = 'rotateY(-180deg)';
  
  if (isMobile) {
    flipPage.style.boxShadow = '-15px 0 30px rgba(0,0,0,0.2), inset -3px 0 5px rgba(0,0,0,0.1)';
  } else {
    flipPage.style.boxShadow = '-30px 0 50px rgba(0,0,0,0.3), inset -5px 0 10px rgba(0,0,0,0.1)';
  }
  
  leftImg.style.opacity = '0.5';
  rightImg.style.opacity = '0';
  
  setTimeout(() => {
    flipPage.style.transition = `transform ${flipDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    flipPage.style.transform = 'rotateY(0deg)';
  }, 50);
  
  setTimeout(() => {
    flipPage.style.transition = 'none';
    flipPage.style.transform = 'rotateY(0deg)';
    flipPage.style.display = 'none';
    flipPage.style.boxShadow = 'none';
    render();
    isAnimating = false;
    updateButtons();
    removeSwipeHint();
  }, flipDuration + 50);
}

function addSwipeHint() {
  const existingHint = document.querySelector('.swipe-hint');
  if (existingHint) return;
  
  const hint = document.createElement('div');
  hint.className = 'swipe-hint';
  hint.innerHTML = '← Deslize para navegar →';
  document.body.appendChild(hint);
  
  setTimeout(removeSwipeHint, 10000);
}

function removeSwipeHint() {
  const hint = document.querySelector('.swipe-hint');
  if (hint) {
    hint.style.transition = 'opacity 0.5s';
    hint.style.opacity = '0';
    setTimeout(() => hint.remove(), 500);
  }
}

// Event listeners
btnNext.onclick = flipNext;
btnPrev.onclick = flipPrev;

// Navegação por teclado
document.addEventListener('keydown', (e) => {
  if (isAnimating) return;
  if (e.key === 'ArrowRight' || e.key === ' ') flipNext();
  else if (e.key === 'ArrowLeft') flipPrev();
});

// Swipe para mobile
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', (e) => {
  if (isAnimating) return;
  
  touchEndX = e.changedTouches[0].screenX;
  touchEndY = e.changedTouches[0].screenY;
  
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  
  if (Math.abs(deltaY) > 100) return;
  
  const threshold = window.innerWidth <= 768 ? 40 : 50;
  if (Math.abs(deltaX) < threshold) return;
  
  if (deltaX > 0) flipPrev();
  else flipNext();
});

// Ajustar ao redimensionar
window.addEventListener('resize', () => {
  updateButtons();
});

// Verificar imagens
function checkImages() {
  pages.forEach(page => {
    const img = new Image();
    img.onerror = function() {
      console.warn(`Imagem não encontrada: ${page.image}`);
    };
    img.src = page.image;
  });
}

// Inicializar
fetch('album.json')
  .then(r => r.json())
  .then(data => {
    pages = data;
    checkImages();
  });
