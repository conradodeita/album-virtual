// Imagens locais (coloque na mesma pasta do HTML)
const images = [
  "CAS00742.jpg",
  "CAS00743.jpg",
  "CAS00744.jpg",
  "CAS01018.jpg",
  "CAS02101.jpg"
];

const bookElement = document.getElementById("book");
const indicator = document.getElementById("page-indicator");

// Cria páginas do álbum
function createPages() {
  bookElement.innerHTML = "";

  // Primeira página diferenciada (capa)
  const coverPage = document.createElement("div");
  coverPage.className = "page";
  coverPage.style.background = "#333";
  coverPage.style.color = "#fff";
  coverPage.style.fontSize = "2rem";
  coverPage.style.display = "flex";
  coverPage.style.alignItems = "center";
  coverPage.style.justifyContent = "center";
  coverPage.innerText = "Meu Álbum Virtual";
  bookElement.appendChild(coverPage);

  // Adiciona imagens
  images.forEach(src => {
    const page = document.createElement("div");
    page.className = "page";

    const img = document.createElement("img");
    img.src = src;
    img.loading = "lazy";
    img.alt = "Foto do álbum";

    img.onerror = () => {
      img.alt = "Imagem indisponível";
      img.style.objectFit = "contain";
      img.style.background = "#eee";
    };

    page.appendChild(img);
    bookElement.appendChild(page);
  });

  // Última página diferenciada (contra-capa)
  const backCover = document.createElement("div");
  backCover.className = "page";
  backCover.style.background = "#333";
  backCover.style.color = "#fff";
  backCover.style.fontSize = "1.5rem";
  backCover.style.display = "flex";
  backCover.style.alignItems = "center";
  backCover.style.justifyContent = "center";
  backCover.innerText = "Fim do Álbum";
  bookElement.appendChild(backCover);
}

createPages();

// Inicializa PageFlip
const pageFlip = new St.PageFlip(bookElement, {
  width: 600,
  height: 450,
  size: "stretch",
  showCover: true,
  maxShadowOpacity: 0.6,
  mobileScrollSupport: true,
  useMouseEvents: true,
  animationDuration: 800 // virar página suave
});

// Carrega páginas no PageFlip
pageFlip.loadFromHTML(document.querySelectorAll(".page"));

// Botões de navegação
document.getElementById("next").onclick = () => pageFlip.flipNext();
document.getElementById("prev").onclick = () => pageFlip.flipPrev();

// Indicador de página
pageFlip.on("flip", e => {
  const page = e.data + 1;
  const total = pageFlip.getPageCount();
  indicator.innerText = `${page} / ${total}`;
});
