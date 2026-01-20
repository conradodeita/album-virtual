let pages = [];
let current = 0;
let isAnimating = false;
let isMobileView = window.innerWidth <= 768;

// Elementos DOM
const leftImg = document.getElementById('leftImg');
const rightImg = document.getElementById('rightImg');
const singleImg = document.getElementById('singleImg');
const flipImg = document.getElementById('flipImg');
const flipPage = document.getElementById('flipPage');
const singlePage = document.getElementById('singlePage');
const counter = document.getElementById('pageCounter');
const btnNext = document.querySelector('.nav.next');
const btnPrev = document.querySelector('.nav.prev');
const pageDots = document.getElementById('pageDots');
const toggleView = document.getElementById('toggleView');

// Detectar se é mobile
function checkMobileView() {
  const wasMobile = isMobileView;
  isMobileView = window.innerWidth <= 768;
  
  if (wasMobile !== isMobileView) {
    // Se mudou de desktop para mobile ou vice-versa, ajustar current
    if (isMobileView) {
      // No mobile, cada item do array é uma página única
      // Mantemos o mesmo índice, pois agora cada página é independente
    } else {
      // No desktop, voltamos para índice par (para mostrar duas páginas)
      if (current % 2 !== 0) {
        current = Math.max(0, current - 1);
      }
    }
    render();
    updateButtons();
    updatePageDots();
  }
}

// Carregar páginas do JSON
fetch('album.json', { cache: 'no-store' })
  .then(r => r.json())
  .then(data => {
    pages = data;
    render();
    updateButtons();
    updatePageDots();
  });

// Renderizar página atual
function render() {
  if (isMobileView) {
    // MODO MOBILE - Uma página por vez
    const page = pages[current];
    singleImg.src = page?.image || '';
    singleImg.style.opacity = '1';
    
    // Verificar se é parte de página dupla e mostrar alerta visual
    if (page?.image && (page.image.includes('_esq') || page.image.includes('_dir'))) {
      // Página dupla - mostrar como única
      singlePage.classList.add('double-page-mobile');
    } else {
      singlePage.classList.remove('double-page-mobile');
    }
    
    // Esconder páginas duplas (desktop view)
    leftImg.style.display = 'none';
    rightImg.style.display = 'none';
    flipPage.style.display = 'none';
    
    // Mostrar página única
    singlePage.style.display = 'flex';
  } else {
    // MODO DESKTOP - Duas páginas lado a lado
    singlePage.style.display = 'none';
    singlePage.classList.remove('double-page-mobile');
    
    // Mostrar página esquerda
    leftImg.src = pages[current]?.image || '';
    leftImg.style.opacity = '1';
    leftImg.style.display = 'block';
    
    // Mostrar página direita (se existir)
    if (pages[current + 1]) {
      rightImg.src = pages[current + 1].image;
      rightImg.style.opacity = '1';
      rightImg.style.display = 'block';
    } else {
      rightImg.style.display = 'none';
    }
  }
  
  updateCounter();
  updatePageDots();
}

// Atualizar contador
function updateCounter() {
  const total = pages.length;
  
  if (isMobileView) {
    // No mobile: mostrar página atual/total
    const currentPage = current + 1;
    counter.textContent = `Página ${currentPage} de ${total}`;
    
    // Adicionar indicador se for parte de página dupla
    const page = pages[current];
    if (page?.image && (page.image.includes('_esq') || page.image.includes('_dir'))) {
      counter.textContent += " (Página Dupla)";
    }
  } else {
    // No desktop: mostrar par de páginas
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
}

// Atualizar botões
function updateButtons() {
  if (isMobileView) {
    btnPrev.disabled = current <= 0 || isAnimating;
    btnNext.disabled = current >= pages.length - 1 || isAnimating;
  } else {
    btnPrev.disabled = current <= 0 || isAnimating;
    btnNext.disabled = current + 2 >= pages.length || isAnimating;
  }
}

// Atualizar pontos de navegação (mobile)
function updatePageDots() {
  if (!isMobileView) {
    pageDots.innerHTML = '';
    return;
  }
  
  let dotsHTML = '';
  for (let i = 0; i < pages.length; i++) {
    const activeClass = i === current ? 'active' : '';
    const page = pages[i];
    let tooltip = '';
    
    // Adicionar tooltip para páginas duplas
    if (page.image.includes('_esq')) {
      tooltip = 'title="Parte esquerda da página dupla"';
    } else if (page.image.includes('_dir')) {
      tooltip = 'title="Parte direita da página dupla"';
    }
    
    dotsHTML += `<div class="page-dot ${activeClass}" data-index="${i}" ${tooltip}></div>`;
  }
  
  pageDots.innerHTML = dotsHTML;
  
  // Adicionar event listeners aos pontos
  document.querySelectorAll('.page-dot').forEach(dot => {
    dot.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      goToPage(index);
    });
  });
}

// Navegar para página específica
function goToPage(index) {
  if (isAnimating || index === current || index < 0 || index >= pages.length) return;
  
  const direction = index > current ? 'right' : 'left';
  current = index;
  
  if (isMobileView) {
    // Animação de slide no mobile
    isAnimating = true;
    singlePage.classList.remove('slide-right', 'slide-left');
    singlePage.classList.add(`slide-${direction}`);
    
    setTimeout(() => {
      render();
      isAnimating = false;
      updateButtons();
    }, 300);
  } else {
    // Ajustar para índice par no desktop
    if (current % 2 !== 0) {
      current = Math.max(0, current - 1);
    }
    render();
    updateButtons();
  }
}

// Próxima página
function nextPage() {
  if (isAnimating) return;
  
  if (isMobileView) {
    if (current < pages.length - 1) {
      goToPage(current + 1);
    }
  } else {
    flipNext();
  }
}

// Página anterior
function prevPage() {
  if (isAnimating) return;
  
  if (isMobileView) {
    if (current > 0) {
      goToPage(current - 1);
    }
  } else {
    flipPrev();
  }
}

// Flip para desktop (mantido do código original)
function flipNext() {
  if (isAnimating || current + 2 >= pages.length) return;
  
  isAnimating = true;
  updateButtons();
  
  flipImg.src = pages[current + 1].image;
  flipPage.style.display = 'flex';
  flipPage.style.transform = 'rotateY(0deg)';
  rightImg.style.opacity = '0';
  
  setTimeout(() => {
    flipPage.style.transition = 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
    flipPage.style.transform = 'rotateY(-180deg)';
    flipPage.style.boxShadow = '-30px 0 50px rgba(0,0,0,0.3), inset -5px 0 10px rgba(0,0,0,0.1)';
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
  }, 1250);
}

function flipPrev() {
  if (isAnimating || current <= 0) return;
  
  isAnimating = true;
  updateButtons();
  current -= 2;
  
  flipImg.src = pages[current + 1]?.image || '';
  flipPage.style.display = 'flex';
  flipPage.style.transform = 'rotateY(-180deg)';
  flipPage.style.boxShadow = '-30px 0 50px rgba(0,0,0,0.3), inset -5px 0 10px rgba(0,0,0,0.1)';
  leftImg.style.opacity = '0.5';
  rightImg.style.opacity = '0';
  
  setTimeout(() => {
    flipPage.style.transition = 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
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
  }, 1250);
}

// EVENT LISTENERS
btnNext.onclick = nextPage;
btnPrev.onclick = prevPage;

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
let touchStartY = 0;
let touchEndX = 0;
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
  
  // Ignorar swipes verticais
  if (Math.abs(deltaY) > Math.abs(deltaX)) return;
  
  // Limiar para considerar swipe
  if (Math.abs(deltaX) < 50) return;
  
  if (deltaX > 0) {
    // Swipe para direita → página anterior
    prevPage();
  } else {
    // Swipe para esquerda → próxima página
    nextPage();
  }
});

// Alternar visualização (mobile/desktop)
toggleView.addEventListener('click', () => {
  if (isMobileView) {
    // Forçar modo desktop - ajustar para índice par
    if (current % 2 !== 0) {
      current = Math.max(0, current - 1);
    }
    isMobileView = false;
  } else {
    // Forçar modo mobile
    isMobileView = true;
  }
  
  render();
  updateButtons();
  updatePageDots();
});

// Redimensionamento da janela
window.addEventListener('resize', () => {
  checkMobileView();
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
    checkMobileView();
  });

// Expor funções para debug
window.debugAlbum = {
  goToPage,
  current: () => current,
  isMobile: () => isMobileView,
  totalPages: () => pages.length
};
