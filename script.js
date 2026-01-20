let pages = [];
let current = 0;
let isAnimating = false;
let isCoverMode = true; // Começa com capa única

// Elementos DOM
const coverPage = document.getElementById('coverPage');
const coverImg = document.getElementById('coverImg');
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
  });

// Renderizar página atual
function render() {
  if (isCoverMode) {
    // MODO CAPA: Mostrar apenas a capa centralizada
    coverPage.style.display = 'flex';
    leftImg.parentElement.style.display = 'none';
    rightImg.parentElement.style.display = 'none';
    
    coverImg.src = pages[0]?.image || '';
    coverImg.style.opacity = '1';
    
    // Atualizar contador para capa
    counter.textContent = 'Capa';
  } else {
    // MODO PÁGINAS DUPLAS
    coverPage.style.display = 'none';
    leftImg.parentElement.style.display = 'flex';
    rightImg.parentElement.style.display = 'flex';
    
    // Índices ajustados: pular a capa (índice 0)
    const leftIndex = 1 + (current * 2);
    const rightIndex = leftIndex + 1;
    
    leftImg.src = pages[leftIndex]?.image || '';
    leftImg.style.opacity = '1';
    
    if (pages[rightIndex]) {
      rightImg.src = pages[rightIndex].image;
      rightImg.style.opacity = '1';
      rightImg.style.display = 'block';
    } else {
      rightImg.style.display = 'none';
    }
    
    // Atualizar contador para páginas duplas
    const totalDoublePages = Math.ceil((pages.length - 1) / 2);
    counter.textContent = `Páginas ${current + 1}-${current + 2} de ${totalDoublePages * 2}`;
  }
}

// Atualizar estado dos botões
function updateButtons() {
  if (isCoverMode) {
    // Na capa: botão anterior desabilitado, próximo habilitado
    btnPrev.disabled = true;
    btnNext.disabled = false;
  } else {
    // Nas páginas duplas
    const totalDoublePages = Math.ceil((pages.length - 1) / 2);
    
    // Botão anterior: habilitado se não estiver na primeira página dupla
    btnPrev.disabled = current <= 0 || isAnimating;
    
    // Botão próximo: habilitado se não estiver na última página dupla
    btnNext.disabled = current >= totalDoublePages - 1 || isAnimating;
  }
}

// Próxima página
function nextPage() {
  if (isAnimating) return;
  
  if (isCoverMode) {
    // Transição da capa para a primeira página dupla
    isCoverMode = false;
    current = 0;
    isAnimating = true;
    
    // Animação de transição
    coverPage.style.transition = 'opacity 0.5s ease';
    coverPage.style.opacity = '0';
    
    setTimeout(() => {
      render();
      coverPage.style.opacity = '1';
      coverPage.style.transition = '';
      isAnimating = false;
      updateButtons();
    }, 500);
  } else {
    // Páginas duplas: animação de flip
    flipToNextDoublePage();
  }
}

// Página anterior
function prevPage() {
  if (isAnimating) return;
  
  if (current === 0 && !isCoverMode) {
    // Voltar da primeira página dupla para a capa
    isCoverMode = true;
    isAnimating = true;
    
    // Animação de transição
    leftImg.parentElement.style.transition = 'opacity 0.5s ease';
    rightImg.parentElement.style.transition = 'opacity 0.5s ease';
    leftImg.parentElement.style.opacity = '0';
    rightImg.parentElement.style.opacity = '0';
    
    setTimeout(() => {
      render();
      leftImg.parentElement.style.opacity = '1';
      rightImg.parentElement.style.opacity = '1';
      leftImg.parentElement.style.transition = '';
      rightImg.parentElement.style.transition = '';
      isAnimating = false;
      updateButtons();
    }, 500);
  } else if (!isCoverMode && current > 0) {
    // Páginas duplas: animação de flip reverso
    flipToPrevDoublePage();
  }
}

// Flip para próxima página dupla
function flipToNextDoublePage() {
  const totalDoublePages = Math.ceil((pages.length - 1) / 2);
  if (current >= totalDoublePages - 1) return;
  
  isAnimating = true;
  updateButtons();
  
  const rightIndex = 2 + (current * 2);
  flipImg.src = pages[rightIndex]?.image || '';
  flipPage.style.display = 'flex';
  flipPage.style.transform = 'rotateY(0deg)';
  rightImg.style.opacity = '0';
  
  setTimeout(() => {
    flipPage.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)';
    flipPage.style.transform = 'rotateY(-180deg)';
  }, 50);
  
  setTimeout(() => {
    current++;
    flipPage.style.transition = 'none';
    flipPage.style.transform = 'rotateY(0deg)';
    flipPage.style.display = 'none';
    render();
    isAnimating = false;
    updateButtons();
  }, 1050);
}

// Flip para página dupla anterior
function flipToPrevDoublePage() {
  if (current <= 0) return;
  
  isAnimating = true;
  updateButtons();
  
  current--;
  
  const rightIndex = 2 + (current * 2);
  flipImg.src = pages[rightIndex]?.image || '';
  flipPage.style.display = 'flex';
  flipPage.style.transform = 'rotateY(-180deg)';
  leftImg.style.opacity = '0.5';
  rightImg.style.opacity = '0';
  
  setTimeout(() => {
    flipPage.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)';
    flipPage.style.transform = 'rotateY(0deg)';
  }, 50);
  
  setTimeout(() => {
    flipPage.style.transition = 'none';
    flipPage.style.transform = 'rotateY(0deg)';
    flipPage.style.display = 'none';
    render();
    isAnimating = false;
    updateButtons();
  }, 1050);
}

// Event listeners
btnNext.addEventListener('click', nextPage);
btnPrev.addEventListener('click', prevPage);

// Navegação por teclado
document.addEventListener('keydown', (e) => {
  if (isAnimating) return;
  
  if (e.key === 'ArrowRight' || e.key === ' ') {
    nextPage();
  } else if (e.key === 'ArrowLeft') {
    prevPage();
  }
});

// Swipe para mobile
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
  if (isAnimating) return;
  
  touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  
  // Ignorar swipes verticais
  if (Math.abs(deltaY) > Math.abs(deltaX)) return;
  
  // Limiar para swipe
  const threshold = Math.min(window.innerWidth * 0.1, 50);
  
  if (Math.abs(deltaX) > threshold) {
    if (deltaX > 0) {
      // Swipe para direita: página anterior
      prevPage();
    } else {
      // Swipe para esquerda: próxima página
      nextPage();
    }
  }
});

// Prevenir zoom com dois dedos
document.addEventListener('gesturestart', (e) => {
  e.preventDefault();
});

// Ajustar ao redimensionar a janela
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

// Função para debug
window.debugAlbum = {
  goToPage: (page) => {
    if (page === 0) {
      isCoverMode = true;
      current = 0;
    } else {
      isCoverMode = false;
      current = Math.floor((page - 1) / 2);
    }
    render();
    updateButtons();
  },
  currentState: () => ({
    isCoverMode,
    current,
    totalPages: pages.length
  })
};
