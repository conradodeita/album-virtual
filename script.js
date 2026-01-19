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

// Carregar todas as páginas do JSON
fetch('album.json', { cache: 'no-store' })
  .then(r => r.json())
  .then(data => {
    pages = data;
    render();
    updateButtons();
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
  
  // Atualizar contador
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
  
  // Preparar a página que será virada
  flipImg.src = pages[current + 1].image;
  flipPage.style.display = 'flex';
  flipPage.style.transform = 'rotateY(0deg)';
  
  // Esconder a página direita original
  rightImg.style.opacity = '0';
  
  // Animação de flip
  setTimeout(() => {
    flipPage.style.transition = 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
    flipPage.style.transform = 'rotateY(-180deg)';
    
    // Sombras durante a animação
    flipPage.style.boxShadow = 
      '-30px 0 50px rgba(0,0,0,0.3), ' +
      'inset -5px 0 10px rgba(0,0,0,0.1)';
  }, 50);
  
  // Após animação, atualizar páginas
  setTimeout(() => {
    // Avançar para as próximas páginas
    current += 2;
    
    // Resetar animação
    flipPage.style.transition = 'none';
    flipPage.style.transform = 'rotateY(0deg)';
    flipPage.style.display = 'none';
    flipPage.style.boxShadow = 'none';
    
    // Atualizar display
    render();
    isAnimating = false;
    updateButtons();
  }, 1250);
}

function flipPrev() {
  if (isAnimating || current <= 0) return;
  
  isAnimating = true;
  updateButtons();
  
  // Voltar para páginas anteriores
  current -= 2;
  
  // Preparar animação reversa
  flipImg.src = pages[current + 1]?.image || '';
  flipPage.style.display = 'flex';
  flipPage.style.transform = 'rotateY(-180deg)';
  flipPage.style.boxShadow = 
    '-30px 0 50px rgba(0,0,0,0.3), ' +
    'inset -5px 0 10px rgba(0,0,0,0.1)';
  
  // Esconder páginas atuais temporariamente
  leftImg.style.opacity = '0.5';
  rightImg.style.opacity = '0';
  
  // Animação reversa
  setTimeout(() => {
    flipPage.style.transition = 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
    flipPage.style.transform = 'rotateY(0deg)';
  }, 50);
  
  // Após animação, atualizar páginas
  setTimeout(() => {
    // Resetar animação
    flipPage.style.transition = 'none';
    flipPage.style.transform = 'rotateY(0deg)';
    flipPage.style.display = 'none';
    flipPage.style.boxShadow = 'none';
    
    // Atualizar display
    render();
    isAnimating = false;
    updateButtons();
  }, 1250);
}

// Event listeners
btnNext.onclick = flipNext;
btnPrev.onclick = flipPrev;

// Navegação por teclado
document.addEventListener('keydown', (e) => {
  if (isAnimating) return;
  
  if (e.key === 'ArrowRight') {
    flipNext();
  } else if (e.key === 'ArrowLeft') {
    flipPrev();
  }
});

// Suporte a toque em dispositivos móveis
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
  if (isAnimating) return;
  
  touchEndX = e.changedTouches[0].screenX;
  const swipeDistance = touchEndX - touchStartX;
  
  // Limiar para considerar como swipe
  if (Math.abs(swipeDistance) < 50) return;
  
  if (swipeDistance > 0) {
    // Swipe para direita - página anterior
    flipPrev();
  } else {
    // Swipe para esquerda - próxima página
    flipNext();
  }
});
