let pages = [];
let current = 0;
let isAnimating = false;
let bookState = 'closed'; // 'closed', 'open', 'end-closed'

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
    // Começa com livro fechado (mostrando apenas a capa)
    bookState = 'closed';
    current = 0;
    render();
    updateButtons();
  });

function render() {
  if (bookState === 'closed') {
    // Livro fechado - mostra apenas a capa
    leftImg.src = pages[0]?.image || '';
    rightImg.style.display = 'none';
    leftImg.style.display = 'block';
    
    counter.textContent = 'Capa';
    
  } else if (bookState === 'end-closed') {
    // Livro fechado no final - mostra apenas a contra-capa
    leftImg.src = pages[pages.length - 1]?.image || '';
    rightImg.style.display = 'none';
    leftImg.style.display = 'block';
    
    counter.textContent = 'Contra-capa';
    
  } else {
    // Livro aberto - mostra duas páginas
    leftImg.src = pages[current]?.image || '';
    
    if (pages[current + 1]) {
      rightImg.src = pages[current + 1].image;
      rightImg.style.display = 'block';
    } else {
      rightImg.style.display = 'none';
    }
    
    leftImg.style.display = 'block';
    
    // Calcular página atual/total (excluindo capa e contra-capa)
    const contentPages = pages.filter(p => p.type === 'pagina');
    const currentContentPage = Math.floor((current - 1) / 2) + 1;
    const totalContentPages = contentPages.length / 2;
    
    counter.textContent = `Página ${currentContentPage} de ${totalContentPages}`;
  }
}

function updateButtons() {
  btnPrev.disabled = isAnimating || 
    (bookState === 'closed' && current === 0) ||
    (bookState === 'end-closed');
  
  btnNext.disabled = isAnimating || 
    (bookState === 'closed' && current === 0 && pages.length <= 1) ||
    (bookState === 'end-closed' && current === pages.length - 1);
}

function openBookFromCover() {
  if (isAnimating) return;
  
  isAnimating = true;
  updateButtons();
  
  // Transição da capa fechada para livro aberto (capa + primeira página)
  bookState = 'open';
  current = 0; // Começa com capa à esquerda
  
  // Animação de abertura do livro
  setTimeout(() => {
    render();
    isAnimating = false;
    updateButtons();
  }, 600);
}

function closeBookToBackCover() {
  if (isAnimating) return;
  
  isAnimating = true;
  updateButtons();
  
  // Transição para livro fechado (contra-capa)
  bookState = 'end-closed';
  current = pages.length - 1;
  
  // Animação de fechamento do livro
  setTimeout(() => {
    render();
    isAnimating = false;
    updateButtons();
  }, 600);
}

function flipNext() {
  if (isAnimating) return;
  
  // Caso especial: capa fechada -> abrir livro
  if (bookState === 'closed') {
    openBookFromCover();
    return;
  }
  
  // Caso especial: última página dupla -> fechar na contra-capa
  if (bookState === 'open' && current + 2 >= pages.length - 1) {
    // Se a próxima página seria a contra-capa, fechamos o livro
    if (current + 2 === pages.length - 1) {
      // Animação de virar para contra-capa
      flipToBackCover();
    } else {
      // Não há mais páginas
      return;
    }
    return;
  }
  
  // Flip normal (duas páginas)
  if (current + 2 < pages.length - 1) { // -1 para não incluir contra-capa no meio
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
      
      flipPage.style.boxShadow = 
        '-30px 0 50px rgba(0,0,0,0.3), ' +
        'inset -5px 0 10px rgba(0,0,0,0.1)';
    }, 50);
    
    // Após animação, atualizar páginas
    setTimeout(() => {
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
}

function flipToBackCover() {
  isAnimating = true;
  updateButtons();
  
  // Preparar animação para contra-capa
  flipImg.src = pages[current + 1]?.image || '';
  flipPage.style.display = 'flex';
  flipPage.style.transform = 'rotateY(0deg)';
  
  rightImg.style.opacity = '0';
  
  // Animação de flip para contra-capa
  setTimeout(() => {
    flipPage.style.transition = 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
    flipPage.style.transform = 'rotateY(-180deg)';
    
    flipPage.style.boxShadow = 
      '-30px 0 50px rgba(0,0,0,0.3), ' +
      'inset -5px 0 10px rgba(0,0,0,0.1)';
  }, 50);
  
  // Após animação, fechar livro
  setTimeout(() => {
    bookState = 'end-closed';
    current = pages.length - 1;
    
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
  if (isAnimating) return;
  
  // Caso especial: contra-capa fechada -> voltar para última página dupla
  if (bookState === 'end-closed') {
    isAnimating = true;
    updateButtons();
    
    // Encontrar última página dupla válida
    let lastDoublePage = pages.length - 3; // -3 porque: -1 contra-capa, -2 página anterior
    
    // Garantir que seja índice par
    if (lastDoublePage % 2 !== 0) {
      lastDoublePage--;
    }
    
    // Garantir que não seja negativo
    lastDoublePage = Math.max(0, lastDoublePage);
    
    bookState = 'open';
    current = lastDoublePage;
    
    setTimeout(() => {
      render();
      isAnimating = false;
      updateButtons();
    }, 600);
    return;
  }
  
  // Caso especial: primeira página dupla -> fechar na capa
  if (bookState === 'open' && current === 0) {
    // Fechar para capa
    isAnimating = true;
    updateButtons();
    
    bookState = 'closed';
    current = 0;
    
    setTimeout(() => {
      render();
      isAnimating = false;
      updateButtons();
    }, 600);
    return;
  }
  
  // Flip reverso normal
  if (current >= 2) {
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
      flipPage.style.transition = 'none';
      flipPage.style.transform = 'rotateY(0deg)';
      flipPage.style.display = 'none';
      flipPage.style.boxShadow = 'none';
      
      render();
      isAnimating = false;
      updateButtons();
    }, 1250);
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
