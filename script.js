const images = [
  "CAS00742.jpg"
];

const bookElement = document.getElementById("book");
const indicator = document.getElementById("page-indicator");

// Criar páginas
function createPages() {
  bookElement.innerHTML = "";

  images.forEach(src => {
    const page = document.createElement("div");
    page.className = "page";

    const img = document.createElement("img");
    img.src = src;         // Caminho local
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
}

createPages();

// Inicializar PageFlip
const pageFlip = new St.PageFlip(bookElement, {
  width: 450,
  height: 450,
  size: "stretch",
  showCover: true,
  maxShadowOpacity: 0.5,
  mobileScrollSupport: true,
  useMouseEvents: true
});

// Carregar páginas
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
