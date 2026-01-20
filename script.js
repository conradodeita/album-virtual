let pages = [];
let current = 0;
let isAnimating = false;
let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Elementos DOM
const leftImg = document.getElementById('leftImg');
const rightImg = document.getElementById('rightImg');
const flipImg = document.getElementById('flipImg');
const flipPage = document.getElementById('flipPage');
const counter = document.getElementById('pageCounter');
const btnNext = document.querySelector('.nav.next');
const btnPrev = document.querySelector('.nav.prev');
const swipeHint = document.getElementById('swipeHint');

// Carregar páginas
fetch('album.json', { cache: 'no-store' })
  .then(r => r.json())
  .then(data => {
    pages = data;
    render();
    updateButtons();
    setupMobile();
  });

function render() {
  leftImg.src = pages[current]?.image || '';
  leftImg.style.opacity = '1';
  
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
  counter.textContent = `Página ${currentPage} de ${totalPages}`;
}

function updateButtons() {
  btnPrev.disabled = current <= 0 || isAnimating;
  btnNext.disabled = current + 2 >= pages.length || isAnimating;
}

function flipNext() {
  if (isAnimating || current + 2 >= pages.length) return;
  
  isAnimating = true;
  updateButtons();
  
  const flipDuration = isMobile ? 800 : 1200;
  
  flipImg.src = pages[current + 1].image;
  flipPage.style.display = 'flex';
  flipPage.style.transform = 'rotateY(0deg)';
  rightImg.style.opacity = '0';
  
  setTimeout(() => {
    flipPage.style.transition = `transform ${flipDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    flipPage.style.transform = 'rotateY(-180deg)';
  }, 50);
  
  setTimeout(() => {
    current += 2;
    flipPage.style.transition = 'none';
    flipPage.style.transform = 'rotateY(0deg)';
    flipPage.style.display = 'none';
    render();
    isAnimating = false;
    updateButtons();
    hideSwipeHint();
  }, flipDuration + 50);
}

function flipPrev() {
  if (isAnimating || current <= 0) return;
  
  isAnimating = true;
  updateButtons();
  
  const flipDuration = isMobile ? 800 : 1200;
  current -= 2;
  
  flipImg.src = pages[current + 1]?.image || '';
  flipPage.style.display = 'flex';
  flipPage.style.transform = 'rotateY(-180deg)';
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
    render();
    isAnimating = false;
    updateButtons();
    hideSwipeHint();
  }, flipDuration + 50);
}

// Configurações específicas para mobile
function setupMobile() {
  if (!isMobile) return;
  
  // Forçar redimensionamento inicial
  window.dispatchEvent(new Event('resize'));
  
  // Ajustar tamanho do texto para mobile
  document.body.style.fontSize = '16px';
  
  // Remover hint após 5 segundos
  setTimeout(hideSwipeHint, 5000);
}

function hideSwipeHint() {
  if (swipeHint) {
    swipeHint.style.opacity = '0';
    swipeHint.style.transition = 'opacity 0.5s';
    setTimeout(() => {
      if (swipeHint.parentNode) {
        swipeHint.parentNode.removeChild(swipeHint);
      }
    }, 500);
  }
}

// Event listeners
btnNext.onclick = flipNext;
btnPrev.onclick = flipPrev;

// Teclado
document.addEventListener('keydown', (e) => {
  if (isAnimating) return;
  if (e.key === 'ArrowRight' || e.key === ' ') flipNext();
  else if (e.key === 'ArrowLeft') flipPrev();
});

// Touch events otimizados para mobile
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

document.addEventListener('touchstart', (e) => {
  if (e.touches.length > 1) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  touchStartTime = Date.now();
  e.preventDefault();
}, { passive: false });

document.addEventListener('touchmove', (e) => {
  if (e.touches.length > 1) return;
  e.preventDefault();
}, { passive: false });

document.addEventListener('touchend', (e) => {
  if (isAnimating || e.changedTouches.length > 1) return;
  
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const touchEndTime = Date.now();
  
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  const deltaTime = touchEndTime - touchStartTime;
  
  // Ignorar toques muito longos ou arrastos verticais
  if (deltaTime > 500 || Math.abs(deltaY) > 50) return;
  
  // Limiar mais sensível para mobile
  const threshold = Math.min(window.innerWidth * 0.1, 50);
  
  if (Math.abs(deltaX) > threshold) {
    if (deltaX > 0) {
      // Swipe para direita
      flipPrev();
    } else {
      // Swipe para esquerda
      flipNext();
    }
    e.preventDefault();
  }
});

// Prevenir zoom com dois dedos
document.addEventListener('gesturestart', (e) => {
  e.preventDefault();
});

// Redimensionamento
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    updateButtons();
    
    // Ajustar para mobile em tempo real
    isMobile = window.innerWidth <= 768;
    
    // Ajustar tamanho do contador em landscape
    if (window.innerHeight < window.innerWidth) {
      counter.style.fontSize = '13px';
      counter.style.padding = '8px 16px';
    }
  }, 250);
});

// Verificar imagens
function checkImages() {
  pages.forEach(page => {
    const img = new Image();
    img.onerror = () => console.warn(`Imagem não encontrada: ${page.image}`);
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
