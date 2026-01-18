// Links diretos do Google Drive (convertidos)
const images = [
  "https://drive.google.com/uc?export=view&id=13dcxn4CQBbtMYVZ-dTJemHrydBYoH2gZ",
  "https://drive.google.com/uc?export=view&id=1RwR525NGVVn7kmevhPgE6GcgJmwmHQLK",
  "https://drive.google.com/uc?export=view&id=10qdbXxFIYZgzG2zNTyAVCocvuPUX47Re",
  "https://drive.google.com/uc?export=view&id=1CHwZ7aSmwJAYlSs_v966gHZ-5QsY2Ic3",
  "https://drive.google.com/uc?export=view&id=1lCVuI86W9GcnHBq_WuHoCLFVPjpcPiuV"
];

const bookElement = document.getElementById("book");
const indicator = document.getElementById("page-indicator");

// Função para criar as páginas do álbum
function createPages() {
  bookElement.innerHTML = "";

  images.forEach(src => {
    const page = document.createElement("div");
    page.className = "page";

    const img = document.createElement("img");
    img.src = src;
    img.loading = "lazy";
    img.alt = "Foto do álbum";

    // Fallback visual caso a imagem falhe
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

// Carregar páginas no PageFlip
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
