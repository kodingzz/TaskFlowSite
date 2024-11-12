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
