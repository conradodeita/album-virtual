let pages = [];
let current = 0;
let isAnimating = false;
let isCoverMode = true;

// Mapeamento de páginas duplas - baseado no JSON fornecido
// Indica quais pares de páginas são duplas (esquerda + direita)
const DOUBLE_PAGES = {
    7: true,   // páginas 7-8 são duplas (pagina07_esq + pagina07_dir)
    15: true   // páginas 15-16 são duplas (pagina15_esq + pagina15_dir)
};

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
const bookElement = document.getElementById('book');

// FUNÇÃO CORRIGIDA: Verifica se o par atual é duplo
function isDoublePagePair(pairIndex) {
    // pairIndex: 0 = páginas 1-2, 1 = páginas 3-4, etc.
    // Verifica no mapeamento se este par é duplo
    return DOUBLE_PAGES[(pairIndex * 2) + 1] === true;
}

// Carregar páginas do JSON
fetch('album.json', { cache: 'no-store' })
    .then(r => r.json())
    .then(data => {
        pages = data;
        render();
        updateButtons();
        console.log('Páginas carregadas:', pages.length);
        console.log('Páginas duplas configuradas:', Object.keys(DOUBLE_PAGES).map(k => `Páginas ${k}-${parseInt(k)+1}`).join(', '));
    })
    .catch(error => {
        console.error('Erro ao carregar o álbum:', error);
        counter.textContent = 'Erro ao carregar o álbum';
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
        counter.className = '';
        
        // Remover indicador de página dupla
        removeDoublePageIndicator();
        bookElement.classList.remove('double-page-mode');
    } else {
        // MODO PÁGINAS DUPLAS
        coverPage.style.display = 'none';
        leftImg.parentElement.style.display = 'flex';
        rightImg.parentElement.style.display = 'flex';
        
        const isDoublePage = isDoublePagePair(current);
        
        if (isDoublePage) {
            // PÁGINA DUPLA: usar imagens específicas esq/dir
            const pageNumber = (current * 2) + 1; // Número da primeira página do par
            const baseName = `pagina${String(pageNumber).padStart(2, '0')}`;
            
            leftImg.src = `${baseName}_esq.jpg`;
            rightImg.src = `${baseName}_dir.jpg`;
            rightImg.style.display = 'block';
            
            // Adicionar indicador visual
            addDoublePageIndicator();
            bookElement.classList.add('double-page-mode');
            
            console.log(`Renderizando página dupla: ${baseName}_esq.jpg + ${baseName}_dir.jpg`);
        } else {
            // PÁGINA SIMPLES: usar imagens padrão do JSON
            const leftIndex = 1 + (current * 2);
            const rightIndex = leftIndex + 1;
            
            leftImg.src = pages[leftIndex]?.image || '';
            
            if (pages[rightIndex] && !DOUBLE_PAGES[rightIndex]) {
                rightImg.src = pages[rightIndex].image || '';
                rightImg.style.display = 'block';
            } else {
                rightImg.style.display = 'none';
            }
            
            // Remover indicador de página dupla
            removeDoublePageIndicator();
            bookElement.classList.remove('double-page-mode');
            
            console.log(`Renderizando página simples: ${pages[leftIndex]?.image} + ${pages[rightIndex]?.image}`);
        }
        
        leftImg.style.opacity = '1';
        rightImg.style.opacity = '1';
        
        updateCounter();
    }
}

// Adicionar indicador de página dupla
function addDoublePageIndicator() {
    removeDoublePageIndicator();
    
    const indicator = document.createElement('div');
    indicator.className = 'double-page-indicator';
    indicator.textContent = 'Página Dupla';
    document.querySelector('.stage').appendChild(indicator);
    
    // Adicionar efeito de união entre as páginas
    const union = document.createElement('div');
    union.className = 'double-page-union';
    bookElement.appendChild(union);
}

// Remover indicador de página dupla
function removeDoublePageIndicator() {
    const existingIndicator = document.querySelector('.double-page-indicator');
    const existingUnion = document.querySelector('.double-page-union');
    
    if (existingIndicator) existingIndicator.remove();
    if (existingUnion) existingUnion.remove();
}

// Atualizar contador
function updateCounter() {
    if (!isCoverMode) {
        const totalPages = pages.length - 1;
        const currentPageStart = (current * 2) + 1;
        const currentPageEnd = Math.min(currentPageStart + 1, totalPages);
        const isDoublePage = isDoublePagePair(current);
        
        let counterText = `Páginas ${currentPageStart}-${currentPageEnd} de ${totalPages}`;
        if (isDoublePage) {
            counterText += " (Página Dupla)";
            counter.className = 'double-page';
        } else {
            counter.className = '';
        }
        counter.textContent = counterText;
    }
}

// Atualizar botões - CORRIGIDO: botão anterior sempre habilitado quando não na capa
function updateButtons() {
    if (isCoverMode) {
        btnPrev.disabled = true;
        btnNext.disabled = false;
        btnNext.focus();
    } else {
        const totalPages = pages.length - 1;
        const totalPairs = Math.ceil(totalPages / 2);
        
        // CORREÇÃO: Botão anterior sempre habilitado quando não está na capa
        // (permite voltar da primeira página para a capa)
        btnPrev.disabled = isAnimating; // Apenas desabilitado durante animação
        
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

// Página anterior - CORRIGIDO: agora funciona da página 1 para a capa
function prevPage() {
    if (isAnimating) return;
    
    // CORREÇÃO: Se está na primeira página dupla (current === 0) e não na capa, voltar para capa
    if (!isCoverMode && current === 0) {
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
        // Páginas internas
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
    rightImg.style.opacity = '0.5';
    
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

// Navegação por teclado (apenas para PC)
document.addEventListener('keydown', (e) => {
    if (isAnimating) return;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        nextPage();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        prevPage();
    } else if (e.key === 'Home') {
        // Ir para capa
        if (!isCoverMode) {
            isCoverMode = true;
            current = 0;
            render();
            updateButtons();
        }
    } else if (e.key === 'End') {
        // Ir para última página
        if (isCoverMode) {
            isCoverMode = false;
        }
        const totalPages = pages.length - 1;
        const totalPairs = Math.ceil(totalPages / 2);
        current = totalPairs - 1;
        render();
        updateButtons();
    }
});

// Clique nas bordas para navegar (apenas para PC)
document.addEventListener('click', (e) => {
    if (isAnimating) return;
    
    const screenWidth = window.innerWidth;
    const clickX = e.clientX;
    
    // Se clicar na borda direita (20% da tela)
    if (clickX > screenWidth * 0.8) {
        nextPage();
    }
    // Se clicar na borda esquerda (20% da tela)
    else if (clickX < screenWidth * 0.2) {
        prevPage();
    }
});

// Log para debug
console.log('Álbum Virtual inicializado - Versão PC');
console.log('Controles (PC):');
console.log('  - Setas ← → ou Espaço/PageDown para navegar');
console.log('  - Clique nas bordas da tela');
console.log('  - Home para capa, End para última página');
