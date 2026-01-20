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

// FUNÇÃO CORRIGIDA: Verifica se um par de páginas é duplo
function isDoublePagePair(pairIndex) {
  // pairIndex: 0 = páginas 1-2, 1 = páginas 3-4, 2 = páginas 5-6, 3 = páginas 7-8, etc.
  // Páginas duplas: pares 3, 7, 11, 15, 19, 23 (7-8, 15-16, 23-24, 31-32, 39-40, 47-48)
  // Padrão: 3 + 4n (n=0,1,2,3,4,5)
  
  if (pairIndex < 3) return false; // Primeiros 3 pares são simples (1-6)
  
  const n = pairIndex - 3;
  return n % 4 === 0; // A cada 4 pares, começando do par 3
}

// Carregar páginas do JSON
fetch('album.json', { cache: 'no-store' })
  .then(r => r.json())
  .then(data => {
    pages = data;
    render();
    updateButtons();
    console.log('Páginas carregadas:', pages.length);
    console.log('Pares duplos esperados: 7-8, 15-16, 23-24, 31-32, 39-40, 47-48');
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
    
    const isDoublePage = isDoublePagePair(current);
    
    if (isDoublePage) {
      // PÁGINA DUPLA: usar imagens específicas
      const pageNumber = (current * 2) + 1; // Número da primeira página do par
      const baseName = `pagina${String(pageNumber).padStart(2, '0')}`;
      
      leftImg.src = `${baseName}_esq.jpg`;
      rightImg.src = `${baseName}_dir.jpg`;
      
      console.log(`Página dupla: ${baseName}_esq.jpg + ${baseName}_dir.jpg`);
    } else {
      // PÁGINA SIMPLES: usar imagens padrão do JSON
      const leftIndex = 1 + (current * 2);
      const rightIndex = leftIndex + 1;
      
      leftImg.src = pages[leftIndex]?.image || '';
      
      if (pages[rightIndex]) {
        rightImg.src = pages[rightIndex].image || '';
        rightImg.style.display = 'block';
      } else {
        rightImg.style.display = 'none';
      }
      
      console.log(`Página simples: ${pages[leftIndex]?.image} + ${pages[rightIndex]?.image}`);
    }
    
    leftImg.style.opacity = '1';
    rightImg.style.opacity = '1';
    
    updateCounter();
  }
}

// Atualizar contador
function updateCounter() {
  if (!isCoverMode) {
    const totalPages = pages.length - 1; // Exclui capa
    const totalPairs = Math.ceil(totalPages / 2);
    const currentPageStart = (current * 2) + 1;
    const currentPageEnd = Math.min(currentPageStart + 1, totalPages);
    const isDoublePage = isDoublePagePair(current);
    
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
    const totalPages = pages.length - 1;
    const totalPairs = Math.ceil(totalPages / 2);
    btnPrev.disabled = current <= 0 || isAnimating;
    btnNext.disabled = current >= totalPairs - 1 || isAnimating;
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
  const totalPages = pages.length - 1;
  const totalPairs = Math.ceil(totalPages / 2);
  if (current >= totalPairs - 1) return;
  
  isAnimating = true;
  updateButtons();
  
  // Preparar imagem para flip (página direita do próximo par)
  const nextPair = current + 1;
  let nextImage;
  
  if (isDoublePagePair(nextPair)) {
    const pageNumber = (nextPair * 2) + 1;
    const baseName = `pagina${String(pageNumber).padStart(2, '0')}`;
    nextImage = `${baseName}_esq.jpg`;
  } else {
    const nextIndex = 1 + (nextPair * 2);
    nextImage = pages[nextIndex]?.image || '';
  }
  
  flipImg.src = nextImage;
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
  
  // Preparar imagem para flip (página esquerda do par atual)
  let prevImage;
  
  if (isDoublePagePair(current)) {
    const pageNumber = (current * 2) + 1;
    const baseName = `pagina${String(pageNumber).padStart(2, '0')}`;
    prevImage = `${baseName}_esq.jpg`;
  } else {
    const currentIndex = 1 + (current * 2);
    prevImage = pages[currentIndex]?.image || '';
  }
  
  flipImg.src = prevImage;
  flipPage.style.display = 'flex';
  flipPage.style.transform = 'rotateY(-180deg)';
  leftImg.style.opacity = '0.5';
  rightImg.style.opacity = '0';
  
  setTimeout(() => {
    flipPage.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)';
    flipPage.style.transform = 'rotateY(0deg)';
  }, 50);
  
  setTimeout(() => {
    current--;
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

// Debug: testar função isDoublePagePair
console.log('Teste isDoublePagePair:');
for (let i = 0; i < 25; i++) {
  const pageStart = i * 2 + 1;
  const pageEnd = pageStart + 1;
  console.log(`Par ${i} (páginas ${pageStart}-${pageEnd}): ${isDoublePagePair(i) ? 'DUPLO' : 'simples'}`);
}
