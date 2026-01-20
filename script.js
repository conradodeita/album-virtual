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
    
    // Adicionar hint de swipe em mobile
    if (window.innerWidth <= 768) {
      addSwipeHint();
    }
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
  
  // Verificar se é uma página dupla
  const leftPage = pages[current];
  const rightPage = pages[current + 1];
  const isDoublePage = leftPage && rightPage && 
                      (leftPage.image.includes('_esq') && rightPage.image.includes('_dir'));
  
  let text = `Página ${currentPage} de ${totalPages}`;
  if (isDoublePage) {
    text += " (Página Dupla)";
  }
  
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
  
  // Ajustar duração da animação baseado no dispositivo
  const isMobile = window.innerWidth <= 768;
  const flipDuration = isMobile ? 800 : 1200;
  
  // Preparar a página que será virada
  flipImg.src = pages[current + 1].image;
  flipPage.style.display = 'flex';
  flipPage.style.transform = 'rotateY(0deg)';
  rightImg.style.opacity = '0';
  
  // Animação de flip
  setTimeout(() => {
    flipPage.style.transition = `transform ${flipDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    flipPage.style.transform = 'rotateY(-180deg)';
    
    // Sombras durante a animação (mais sutis em mobile)
    if (isMobile) {
      flipPage.style.boxShadow = 
        '-15px 0 30px rgba(0,0,0,0.2), ' +
        'inset -3px 0 5px rgba(0,0,0,0.1)';
    } else {
      flipPage.style.boxShadow = 
        '-30px 0 50px rgba(0,0,0,0.3), ' +
        'inset -5px 0 10px rgba(0,0,0,0.1)';
    }
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
    
    // Remover hint de swipe após primeira interação
    removeSwipeHint();
  }, flipDuration + 50);
}

function flipPrev() {
  if (isAnimating || current <= 0) return;
  
  isAnimating = true;
  updateButtons();
  
  // Ajustar duração da animação baseado no dispositivo
  const isMobile = window.innerWidth <= 768;
  const flipDuration = isMobile ? 800 : 1200;
  
  // Voltar para páginas anteriores
  current -= 2;
  
  // Preparar animação reversa
  flipImg.src = pages[current + 1]?.image || '';
  flipPage.style.display = 'flex';
  flipPage.style.transform = 'rotateY(-180deg)';
  
  // Sombras (mais sutis em mobile)
  if (isMobile) {
    flipPage.style.boxShadow = 
      '-15px 0 30px rgba(0,0,0,0.2), ' +
      'inset -3px 0 5px rgba(0,0,0,0.1)';
  } else {
    flipPage.style.boxShadow = 
      '-30px 0 50px rgba(0,0,0,0.3), ' +
      'inset -5px 0 10px rgba(0,0,0,0.1)';
  }
  
  // Esconder páginas atuais temporariamente
  leftImg.style.opacity = '0.5';
  rightImg.style.opacity = '0';
  
  // Animação reversa
  setTimeout(() => {
    flipPage.style.transition = `transform ${flipDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
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
    
    // Remover hint de swipe após primeira interação
    removeSwipeHint();
  }, flipDuration + 50);
}

// Adicionar hint de swipe em mobile
function addSwipeHint() {
  const existingHint = document.querySelector('.swipe-hint');
  if (existingHint) return;
  
  const hint = document.createElement('div');
  hint.className = 'swipe-hint';
  hint.innerHTML = '← Deslize para navegar →';
  hint.style.cssText = `
    position: fixed;
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    color: rgba(255, 255, 255, 0.8);
    font-size: 13px;
    background: rgba(0, 0, 0, 0.3);
    padding: 8px 16px;
    border-radius: 20px;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 1000;
    animation: pulse 2s infinite;
    pointer-events: none;
  `;
  
  // Adicionar keyframes para pulse
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(hint);
  
  // Auto-remover após 10 segundos ou primeira interação
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
  
  if (e.key === 'ArrowRight' || e.key === ' ') {
    flipNext();
  } else if (e.key === 'ArrowLeft') {
    flipPrev();
  }
});

// Suporte a toque em dispositivos móveis
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
  
  // Ignorar swipes verticais longos (scroll da página)
  if (Math.abs(deltaY) > 100) return;
  
  // Limiar para considerar como swipe (menor em mobile)
  const threshold = window.innerWidth <= 768 ? 40 : 50;
  if (Math.abs(deltaX) < threshold) return;
  
  if (deltaX > 0) {
    // Swipe para direita - página anterior
    flipPrev();
  } else {
    // Swipe para esquerda - próxima página
    flipNext();
  }
});

// Ajustar ao redimensionar a janela
window.addEventListener('resize', () => {
  // Recalcular se necessário
  updateButtons();
});

// Verificar se as imagens existem
function checkImages() {
  pages.forEach(page => {
    const img = new Image();
    img.onerror = function() {
      console.warn(`Imagem não encontrada: ${page.image}`);
    };
    img.src = page.image;
  });
}

// Executar após carregar as páginas
fetch('album.json')
  .then(r => r.json())
  .then(data => {
    pages = data;
    checkImages();
  });
