// 검색 기능
const searchBtn = document.querySelector(".sidebar-search");
const modalOverlay = document.querySelector(".modal-overlay");
const modal = document.querySelector(".modal");

searchBtn.addEventListener("click", () => {
  modalOverlay.style.display = "block";
  modal.style.display = "flex";
});

modalOverlay.addEventListener("click", () => {
  modalOverlay.style.display = "none";
  modal.style.display = "none";
});

modal.addEventListener("click", (e) => {
  e.stopPropagation();
});
