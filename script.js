const images = [
  "CAS00742.jpg",
  "CAS00743.jpg",
  "CAS00744.jpg",
  "CAS01018.jpg",
  "CAS02101.jpg"
];

const bookElement = document.getElementById("book");
const indicator = document.getElementById("page-indicator");

function createPages() {
  bookElement.innerHTML = "";

  images.forEach(src => {
    const page = document.createElement("div");
    page.className = "page";

    const img = document.createElement("img");
    img.src = src;
    img.loading = "lazy";
    img.alt = "Foto do álbum";

    // Debug visual se imagem falhar
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

const pageFlip = new St.PageFlip(bookElement, {
  width: 450,
  height: 450,
  size: "stretch",
  showCover: true,
  maxShadowOpacity: 0.5,
  mobileScrollSupport: true,
  useMouseEvents: true
});

pageFlip.loadFromHTML(document.querySelectorAll(".page"));

/* Botões */
document.getElementById("next").onclick = () => pageFlip.flipNext();
document.getElementById("prev").onclick = () => pageFlip.flipPrev();

/* Indicador */
pageFlip.on("flip", e => {
  const page = e.data + 1;
  const total = pageFlip.getPageCount();
  indicator.innerText = `${page} / ${total}`;
});
