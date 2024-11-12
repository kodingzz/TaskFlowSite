const titleDisplay = document.getElementById("title-display");
const titleInput = document.getElementById("title-input");
//const contentInput = document.getElementById("content-input");

function saveTitle() {
  const title = titleInput.value.trim();

  if (title) {
    titleDisplay.textContent = title;

    titleInput.style.display = "none";
    titleDisplay.style.diplay = "block";
  }
}

function editTitle() {
  titleInput.style.display = "block";
  titleDisplay.style.display = "none";

  titleInput.value = titleDisplay.textContent.trim();
}

titleInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    saveTitle();
  }
});

titleInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    saveTitle();
  }
});

const output = document.getElementById("output");

titleInput.addEventListener("input", function () {
  // 텍스트 내용 가져오기
  const content = contentInput.value;

  // 마크다운 '/line'을 <hr>로 변환
  const transformedContent = content.replace(/\/line/g, "<hr>");

  // 변환된 텍스트를 HTML로 출력
  output.innerHTML = transformedContent;
});
