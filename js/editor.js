// 타이틀 에디터
const titleDisplay = document.getElementById("title-display");
const titleInput = document.getElementById("title-input");
function saveTitle() {
  const title = titleInput.value.trim();
  if (title) {
    titleDisplay.textContent = title;
    titleInput.style.visibility = "hidden";
    titleDisplay.style.display = "block";
  }
}
function editTitle() {
  titleInput.style.visibility = "visible";
  titleDisplay.style.display = "none";
  titleInput.value = titleDisplay.textContent.trim();
}

titleInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    saveTitle();
  }
});
titleDisplay.addEventListener("click", function () {
  editTitle();
});

// 텍스트 에디터

// default 텍스트 블록에 대한 키보드 입력 처리
// Enter 키를 누를 때 동작
document.querySelector("#editor").addEventListener("keydown", function (e) {
  const currentBlock = document.activeElement; // 현재 포커스가 있는 블록을 가져옴

  // Enter 키가 눌렸을 때
  if (e.key === "Enter") {
    e.preventDefault(); // 기본 Enter 동작을 막음

    // 현재 블록이 text-block일 경우, 새 블록을 생성
    if (currentBlock.classList.contains("text-block")) {
      createNewBlock(currentBlock);
    }

    // 현재 블록이 li일 경우, 부모 ul의 자식으로 새로운 li를 추가
    if (currentBlock.tagName === "LI") {
      const parentUl = currentBlock.closest("ul"); // 현재 li의 부모 ul을 찾음
      const newListItem = document.createElement("li"); // 새로운 li 생성
      newListItem.contentEditable = "true"; // 새 li를 편집 가능하게 설정
      parentUl.appendChild(newListItem); // ul의 자식으로 새 li를 추가
      newListItem.focus(); // 새 li에 포커스를 이동
    }
  }

  // Handle Delete/Backspace keys
  if (e.key === "Delete" || e.key === "Backspace") {
    // 1. 기본 div 블록이 비어있고 삭제되었을 때, 이전 블록으로 이동.
    if (
      currentBlock.tagName === "DIV" &&
      currentBlock.textContent.trim() === "" &&
      currentBlock.previousElementSibling
    ) {
      const previousBlock = currentBlock.previousElementSibling;
      currentBlock.remove(); // 현재 빈 div 블록 삭제
      previousBlock.focus(); // 이전 블록으로 포커스 이동
      setCaretToEnd(previousBlock); // 이전 블록의 끝으로 커서 이동
    }

    // 2. li 블록이 비어있고 삭제되었을 때, div로 변경하고 ul의 형제 요소로 추가
    if (
      currentBlock.tagName === "LI" &&
      currentBlock.textContent.trim() === ""
    ) {
      const newTextBlock = document.createElement("div"); // 새로운 div 블록 생성
      newTextBlock.classList.add("text-block");
      newTextBlock.contentEditable = "true";

      // 현재 li의 부모 ul 찾기
      const parentUl = currentBlock.closest("ul");
      const nextSibling = parentUl.nextElementSibling; // ul 다음 형제 요소 찾기

      currentBlock.replaceWith(newTextBlock); // li를 div로 교체

      // 만약 ul 안에 li가 더 이상 없다면 ul을 삭제
      if (parentUl.querySelectorAll("li").length === 0) {
        // li가 남아있지 않으면 ul을 삭제
        const previousBlock = parentUl.previousElementSibling; // ul의 이전 형제 요소 찾기
        parentUl.remove(); // ul 삭제

        // 새로 생성된 div를 ul의 형제 요소로 추가
        if (nextSibling) {
          parentUl.parentNode.insertBefore(newTextBlock, nextSibling);
        } else {
          parentUl.parentNode.appendChild(newTextBlock); // 형제 요소가 없으면 ul 뒤에 div 추가
        }

        // 이전 블록으로 포커스를 이동
        if (previousBlock) {
          previousBlock.focus(); // 이전 블록으로 포커스 이동
          setCaretToEnd(previousBlock); // 이전 블록의 끝으로 커서 이동
        }
      } else {
        // li가 남아있으면 div를 그냥 ul의 형제 요소로 추가
        if (nextSibling) {
          parentUl.parentNode.insertBefore(newTextBlock, nextSibling);
        } else {
          parentUl.parentNode.appendChild(newTextBlock); // 형제 요소가 없으면 ul 뒤에 div 추가
        }
      }

      newTextBlock.focus(); // 새로 생성된 div 블록에 포커스 이동
    }
  }

  // 키 업/다운 이동 처리
  if (e.key === "ArrowUp" && currentBlock.previousElementSibling) {
    currentBlock.previousElementSibling.focus();
  }

  if (e.key === "ArrowDown" && currentBlock.nextElementSibling) {
    currentBlock.nextElementSibling.focus();
  }
});

// 커서를 마지막에 위치시키는 함수
function setCaretToEnd(element) {
  const range = document.createRange();
  const selection = window.getSelection();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

// 텍스트 입력 처리시 반응하는 이벤트 리스너
document.querySelector("#editor").addEventListener("input", function (e) {
  const currentBlock = document.activeElement;
  console.log(e.data);

  // 텍스트 블록 내에서만 처리
  if (currentBlock && currentBlock.classList.contains("text-block")) {
    const textContent = currentBlock.textContent;

    // Markdown 인식 (트리거 인식)
    if (e.data === " ") {
      if (textContent.startsWith("###") && textContent.length >= 4) {
        // '### ' -> h3
        convertToHeaderBlock(currentBlock, "h5", 4);
      } else if (textContent.startsWith("##") && textContent.length >= 3) {
        // '## ' -> h2
        convertToHeaderBlock(currentBlock, "h4", 3);
      } else if (textContent.startsWith("#") && textContent.length >= 2) {
        // '# ' -> h1
        convertToHeaderBlock(currentBlock, "h3", 2);
      } else if (/^\d+\./.test(textContent.trim())) {
        // Ordered list 처리
        createNewUlItem(currentBlock);
      } else if (
        textContent.startsWith("*") ||
        textContent.startsWith("-") ||
        textContent.startsWith("+")
      ) {
        // Unordered list 처리
        createNewUlItem(currentBlock);
      }
    }
  }
});

// 새로운 텍스트 블록 생성 함수
function createNewBlock(currentBlock) {
  const newTextBlock = document.createElement("div");
  newTextBlock.classList.add("text-block");
  newTextBlock.contentEditable = "true";

  currentBlock.parentNode.insertBefore(newTextBlock, currentBlock.nextSibling);
  newTextBlock.focus();
}

// 특수 블록일 경우 그 다음 블록도 똑같은 블록 생성
function continueSpecialBlock(previousBlockType) {
  const newListItem = document.createElement(previousBlockType);
  newListItem.contentEditable = "true";
  currentBlock.parentNode.appendChild(newListItem);
  newListItem.focus();
}

// Markdown 형식으로 변환 (트리거 인식후 변환)

function convertToHeaderBlock(block, headerTag, sliceLength) {
  const remainingText = block.textContent.slice(sliceLength); // Markdown 기호 제거
  const headerBlock = document.createElement(headerTag);
  headerBlock.textContent = remainingText;
  headerBlock.classList.add("text-block");

  block.replaceWith(headerBlock);
  headerBlock.contentEditable = "true";
  headerBlock.focus();
}

function createNewUlItem(block) {
  // <li> 태그로 사용할 새로운 목록 항목 생성
  const newListItem = document.createElement("li");
  newListItem.textContent = block.textContent.trim().slice(2); // 기존 텍스트에서 Markdown 기호 제거

  // 새로 생성된 <ul> 태그에 <li> 항목 추가
  const newListhead = document.createElement("ul");
  newListhead.appendChild(newListItem);

  // 기존 블록을 <ul>로 감싸인 <li>로 대체
  block.replaceWith(newListhead);

  // 새 목록 항목을 편집 가능하게 설정하고 포커스 이동
  newListItem.contentEditable = "true";
  newListItem.focus();
}

function createNewOlItem(block) {
  // <ol> 태그를 생성하고 <li> 항목을 추가
  const newListhead = document.createElement("ol");
  const newListItem = document.createElement("li");

  // <ol> 안에 새로운 <li> 항목 추가
  newListhead.appendChild(newListItem);

  // 기존 블록을 <ol>로 감싸인 <li>로 대체
  block.replaceWith(newListhead);

  // 기존 텍스트에서 숫자와 마침표 제거 후 <li>에 텍스트 설정
  newListItem.textContent = block.textContent
    .trim()
    .slice(block.textContent.indexOf(".") + 1)
    .trim();

  // 새 목록 항목을 편집 가능하게 설정하고 포커스 이동
  newListItem.contentEditable = "true";
  newListItem.focus();
}

//
