let pages = [];
let current = 0;
let isAnimating = false;
let isCoverMode = true;

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

// Função para verificar se um par de páginas é duplo
function isDoublePagePair(pageIndex) {
  // Lógica: páginas 7-8, 15-16, 23-24, 31-32, 39-40, 47-48 são duplas
  // pageIndex começa em 1 (página 1) após a capa
  
  // Converter para número da página real (1-indexed)
  const pageNumber = pageIndex + 1;
  
  // Verificar se está na sequência: 7-8, 15-16, 23-24, etc.
  // Padrão: 7 + 8n até 8 + 8n (n = 0,1,2,3,4,5)
  for (let n = 0; n <= 5; n++) {
    const startPage = 7 + (8 * n);
    const endPage = 8 + (8 * n);
    if (pageNumber >= startPage && pageNumber <= endPage) {
      return true;
    }
  }
  return false;
}

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
    // MODO CAPA
    coverPage.style.display = 'flex';
    leftImg.parentElement.style.display = 'none';
    rightImg.parentElement.style.display = 'none';
    
    coverImg.src = pages[0]?.image || '';
    coverImg.style.opacity = '1';
    
    counter.textContent = 'Capa';
  } else {
    // MODO PÁGINAS DUPLAS
    coverPage.style.display = 'none';
    leftImg.parentElement.style.display = 'flex';
    rightImg.parentElement.style.display = 'flex';
    
    // Índices ajustados: pular a capa (índice 0)
    const leftIndex = 1 + (current * 2);
    const rightIndex = leftIndex + 1;
    
    // Verificar se é uma página dupla
    const isDoublePage = isDoublePagePair(current * 2);
    
    if (isDoublePage) {
      // PÁGINA DUPLA: usar nomes específicos
      const pageNumber = current * 2 + 1; // 1-indexed
      const baseName = `pagina${String(pageNumber).padStart(2, '0')}`;
      
      leftImg.src = `${baseName}_esq.jpg` || '';
      rightImg.src = `${baseName}_dir.jpg` || '';
    } else {
      // PÁGINA SIMPLES: nomes padrão
      leftImg.src = pages[leftIndex]?.image || '';
      if (pages[rightIndex]) {
        rightImg.src = pages[rightIndex].image || '';
        rightImg.style.display = 'block';
      } else {
        rightImg.style.display = 'none';
      }
    }
    
    leftImg.style.opacity = '1';
    rightImg.style.opacity = '1';
    
    // Atualizar contador
    updateCounter();
  }
}

// Atualizar contador
function updateCounter() {
  if (!isCoverMode) {
    const totalPages = Math.floor((pages.length - 1) / 2) * 2; // Total de páginas internas (pares)
    const currentPageStart = (current * 2) + 1;
    const currentPageEnd = currentPageStart + 1;
    const isDoublePage = isDoublePagePair(current * 2);
    
    let counterText = `Páginas ${currentPageStart}-${currentPageEnd}`;
    if (isDoublePage) {
      counterText += " (Página Dupla)";
    }
    counter.textContent = counterText;
  }
}

// Atualizar botões
function updateButtons() {
  if (isCoverMode) {
    btnPrev.disabled = true;
    btnNext.disabled = false;
  } else {
    const totalDoublePages = Math.floor((pages.length - 1) / 2);
    btnPrev.disabled = current <= 0 || isAnimating;
    btnNext.disabled = current >= totalDoublePages - 1 || isAnimating;
  }
}

// Próxima página
function nextPage() {
  if (isAnimating) return;
  
  if (isCoverMode) {
    // Da capa para primeira página dupla
    isCoverMode = false;
    current = 0;
    isAnimating = true;
    
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
    flipToNextDoublePage();
  }
}

// Página anterior
function prevPage() {
  if (isAnimating) return;
  
  if (current === 0 && !isCoverMode) {
    // Da primeira página dupla para capa
    isCoverMode = true;
    isAnimating = true;
    
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
    flipToPrevDoublePage();
  }
}

// Flip para próxima página
function flipToNextDoublePage() {
  const totalDoublePages = Math.floor((pages.length - 1) / 2);
  if (current >= totalDoublePages - 1) return;
  
  isAnimating = true;
  updateButtons();
  
  const isDoublePage = isDoublePagePair(current * 2 + 2);
  const nextPageNumber = current * 2 + 3;
  const baseName = `pagina${String(nextPageNumber).padStart(2, '0')}`;
  
  // Preparar imagem para flip
  if (isDoublePage) {
    flipImg.src = `${baseName}_esq.jpg`;
  } else {
    const rightIndex = 2 + (current * 2);
    flipImg.src = pages[rightIndex]?.image || '';
  }
  
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

// Flip para página anterior
function flipToPrevDoublePage() {
  if (current <= 0) return;
  
  isAnimating = true;
  updateButtons();
  
  current--;
  
  const isDoublePage = isDoublePagePair(current * 2 + 2);
  const nextPageNumber = current * 2 + 3;
  const baseName = `pagina${String(nextPageNumber).padStart(2, '0')}`;
  
  // Preparar imagem para flip
  if (isDoublePage) {
    flipImg.src = `${baseName}_esq.jpg`;
  } else {
    const rightIndex = 2 + (current * 2);
    flipImg.src = pages[rightIndex]?.image || '';
  }
  
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

// Teclado
document.addEventListener('keydown', (e) => {
  if (isAnimating) return;
  if (e.key === 'ArrowRight' || e.key === ' ') nextPage();
  else if (e.key === 'ArrowLeft') prevPage();
});

// Swipe
let touchStartX = 0;
document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
});

document.addEventListener('touchend', (e) => {
  if (isAnimating) return;
  const touchEndX = e.changedTouches[0].clientX;
  const deltaX = touchEndX - touchStartX;
  const threshold = Math.min(window.innerWidth * 0.1, 50);
  if (Math.abs(deltaX) > threshold) {
    if (deltaX > 0) prevPage();
    else nextPage();
  }
});

// Inicializar
fetch('album.json')
  .then(r => r.json())
  .then(data => {
    pages = data;
  });
