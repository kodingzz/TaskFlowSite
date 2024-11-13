// 검색 기능
const searchBtn = document.querySelector(".sidebar-search");
const modalOverlay = document.querySelector(".modal-overlay");
const modal = document.querySelector(".modal");
const scrollDiv = document.querySelector(".modal-contents");
// a태그
// const a = document.createElement("a");
// a.href = `/documents/${doc.id}`;
// a.dataset.url = doc.id;
// a.textContent = doc.title;

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

scrollDiv.addEventListener("scroll", (e) => {
  e.target.classList.contains("modal-content");
});

//링크 클릭 시 새로운 페이지 로드 처리
scrollDiv.addEventListener("click", (e) => {
  e.preventDefault();
  const id = e.currentTarget.dataset.url;
  history.pushState({ page: id }, "", `/documents/${id}`);
  loadTextEditor(id);
  //테스트용 - 완성시 제거
  console.log("ok or not");
});

// URL에 맞는 콘텐츠 로드 (동적으로 콘텐츠를 로드하는 함수)
function loadTextEditor(id) {
  const content = id
    ? `
     <div class="text-block" contenteditable="true">
        <h1>새 페이지</h1>
     </div>
  `
    : "<h1>페이지를 찾을 수 없습니다.</h1>";
  editor.innerHTML = content;
}
