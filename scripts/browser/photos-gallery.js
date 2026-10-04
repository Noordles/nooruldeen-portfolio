const photoViewer = document.querySelector("[data-photo-viewer]");
const photoLinks = Array.from(document.querySelectorAll("[data-photo-open]"));

if (photoViewer && photoLinks.length && typeof photoViewer.showModal === "function") {
  const viewerImage = photoViewer.querySelector("[data-viewer-image]");
  const viewerCount = photoViewer.querySelector("[data-viewer-count]");
  const viewerCaption = photoViewer.querySelector("[data-viewer-caption]");
  const viewerDownload = photoViewer.querySelector("[data-viewer-download]");
  let activeIndex = 0;

  const showPhoto = (index) => {
    activeIndex = (index + photoLinks.length) % photoLinks.length;
    const link = photoLinks[activeIndex];
    viewerImage.src = link.href;
    viewerImage.alt = link.dataset.alt || "Photo from Noor’s photography collection.";
    viewerCount.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(photoLinks.length).padStart(2, "0")}`;
    viewerCaption.textContent = link.dataset.caption || `Photo ${activeIndex + 1}`;

    viewerDownload.href = link.href;
    viewerDownload.download = link.href.split("/").pop().split("?")[0];

    [activeIndex - 1, activeIndex + 1].forEach((neighbour) => {
      const target = photoLinks[(neighbour + photoLinks.length) % photoLinks.length];
      const preload = new Image();
      preload.src = target.href;
    });
  };

  photoLinks.forEach((link, index) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showPhoto(index);
      photoViewer.showModal();
    });
  });

  photoViewer.querySelector("[data-viewer-close]").addEventListener("click", () => photoViewer.close());
  photoViewer.querySelector("[data-viewer-previous]").addEventListener("click", () => showPhoto(activeIndex - 1));
  photoViewer.querySelector("[data-viewer-next]").addEventListener("click", () => showPhoto(activeIndex + 1));
  photoViewer.addEventListener("click", (event) => {
    if (event.target === photoViewer) photoViewer.close();
  });
  photoViewer.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPhoto(activeIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showPhoto(activeIndex + 1);
    }
  });
}
