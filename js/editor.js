// 타이틀 에디터

const titleDisplay = document.getElementById("title-display");
const titleInput = document.getElementById("title-input");
//const contentInput = document.getElementById("content-input");

function saveTitle() {
  const title = titleInput.value.trim();
  if (title) {
    titleDisplay.textContent = title;
    titleInput.style.display = "none";
    titleDisplay.style.display = "block";
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

titleDisplay.addEventListener("click", function () {
  editTitle();
});

// 텍스트 에디터
document.addEventListener("DOMContentLoaded", () => {
  const editor = document.getElementById("editor");

  // 기본 텍스트 블록 생성
  const initialBlock = document.createElement("div");
  initialBlock.classList.add("text-block");
  initialBlock.contentEditable = "true";
  initialBlock.ariaPlaceholder = "여기에 내용을 입력하세요...";
  editor.appendChild(initialBlock);
  initialBlock.focus();
});

// 텍스트 블록에 대한 키보드 입력 처리
document.getElementById("editor").addEventListener("keydown", function (e) {
  const currentBlock = document.activeElement;

  // Enter 키를 눌렀을 때
  if (e.key === "Enter") {
    e.preventDefault(); // 기본 Enter 동작 방지

    // 텍스트 블록이 비어 있지 않으면 새 블록 생성
    const newTextBlock = document.createElement("div");
    newTextBlock.classList.add("text-block");
    newTextBlock.contentEditable = "true";

    // 리스트 항목에서 Enter 후 새로운 항목 추가
    if (
      currentBlock.tagName === "LI" &&
      currentBlock.textContent.trim() !== ""
    ) {
      const newListItem = document.createElement("li");
      newListItem.contentEditable = "true";
      currentBlock.parentNode.appendChild(newListItem);
      newListItem.focus();
    } else if (
      currentBlock.classList.contains("text-block") &&
      currentBlock.textContent.trim() !== ""
    ) {
      // 텍스트 블록에서 Enter 후 새 블록 추가
      currentBlock.parentNode.insertBefore(
        newTextBlock,
        currentBlock.nextSibling
      );
      newTextBlock.focus();
    } else if (
      currentBlock.tagName === "EM" &&
      currentBlock.textContent.trim() !== ""
    ) {
      // 이태릭 블록에서 Enter 후 새로운 기본 블록 추가
      const newBasicBlock = document.createElement("div");
      newBasicBlock.classList.add("text-block");
      newBasicBlock.contentEditable = "true";
      currentBlock.parentNode.insertBefore(
        newBasicBlock,
        currentBlock.nextSibling
      );
      newBasicBlock.focus();
    }
  }

  // Delete 키를 눌렀을 때
  if (e.key === "Delete" || e.key === "Backspace") {
    if (
      currentBlock.textContent.trim() === "" && // 현재 블록이 비어있으면
      currentBlock.previousElementSibling // 이전 블록이 존재하면
    ) {
      const previousBlock = currentBlock.previousElementSibling;

      // 현재 빈 블록 삭제
      currentBlock.remove();

      // 이전 블록으로 포커스 이동하고, 끝으로 커서 이동
      previousBlock.focus();
      setCaretToEnd(previousBlock); // 커서를 마지막에 위치시킴
    }

    // 리스트 항목이 비어있으면 텍스트 블록으로 변환
    if (
      currentBlock.tagName === "LI" &&
      currentBlock.textContent.trim() === ""
    ) {
      const newTextBlock = document.createElement("div");
      newTextBlock.classList.add("text-block");
      newTextBlock.contentEditable = "true";

      currentBlock.replaceWith(newTextBlock); // 리스트 항목을 텍스트 블록으로 대체
      newTextBlock.focus();
    }
  }

  // Arrow Up 키: 위쪽 블록으로 포커스 이동
  if (e.key === "ArrowUp") {
    if (currentBlock.previousElementSibling) {
      currentBlock.previousElementSibling.focus();
    }
  }

  // Arrow Down 키: 아래쪽 블록으로 포커스 이동
  if (e.key === "ArrowDown") {
    if (currentBlock.nextElementSibling) {
      currentBlock.nextElementSibling.focus();
    }
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

// 텍스트 입력 처리
document.getElementById("editor").addEventListener("input", function (e) {
  const currentBlock = document.activeElement;
  console.log(e.data);
  // 텍스트 블록 내에서만 처리
  if (currentBlock && currentBlock.classList.contains("text-block")) {
    const textContent = currentBlock.textContent;

    // Markdown 체크 후 변환
    if (e.data === " ") {
      if (textContent.startsWith("###") && textContent.length > 4) {
        createHeaderBlock(currentBlock, "h3", 4); // '### ' -> h3
      } else if (textContent.startsWith("##") && textContent.length > 3) {
        createHeaderBlock(currentBlock, "h2", 3); // '## ' -> h2
      } else if (textContent.startsWith("#") && textContent.length > 2) {
        createHeaderBlock(currentBlock, "h1", 2); // '# ' -> h1
      }
    }
    // 다른 마크다운 처리
    else if (textContent.startsWith("> ")) {
      createBlockquote(currentBlock); // Blockquote 처리
    } else if (
      textContent.startsWith("* ") ||
      textContent.startsWith("- ") ||
      textContent.startsWith("+ ")
    ) {
      createListItem(currentBlock); // Unordered list 처리
    } else if (/^\d+\./.test(textContent.trim())) {
      createOrderedListItem(currentBlock); // Ordered list 처리
    } else if (textContent.startsWith("**") && textContent.endsWith("**")) {
      createBoldText(currentBlock); // Bold 처리
    } else if (textContent.startsWith("*") && textContent.endsWith("*")) {
      createItalicText(currentBlock); // Italic 처리
    }
  }
});

// 블록 생성 함수들 (헤더, 블록 인용, 리스트 항목 등)
function createHeaderBlock(block, headerTag, sliceLength) {
  const remainingText = block.textContent.slice(sliceLength); // Markdown 기호 제거
  const headerBlock = document.createElement(headerTag);
  headerBlock.textContent = remainingText;
  headerBlock.classList.add("text-block");

  block.replaceWith(headerBlock);
  headerBlock.contentEditable = "true";
  headerBlock.focus();
}

function createBlockquote(block) {
  const blockquote = document.createElement("blockquote");
  blockquote.textContent = block.textContent.slice(2);
  blockquote.classList.add("text-block");

  block.replaceWith(blockquote);
  blockquote.contentEditable = "true";
  blockquote.focus();
}

function createListItem(block) {
  // 현재 텍스트 블록이 리스트 항목이면, 새로운 항목을 추가합니다.
  const listItem = document.createElement("li");
  listItem.textContent = block.textContent.trim().slice(2);
  const ul = block.closest("ul") || document.createElement("ul");

  ul.appendChild(listItem);
  block.replaceWith(ul); // 기존 블록을 <ul>로 대체
  listItem.contentEditable = "true";
  listItem.focus();
}

function createOrderedListItem(block) {
  const listItem = document.createElement("li");
  listItem.textContent = block.textContent
    .trim()
    .slice(block.textContent.indexOf(".") + 1)
    .trim();
  const ol = block.closest("ol") || document.createElement("ol");

  ol.appendChild(listItem);
  block.replaceWith(ol); // 기존 블록을 <ol>로 대체
  listItem.contentEditable = "true";
  listItem.focus();
}

function createBoldText(block) {
  const remainingText = block.textContent.slice(2, -2); // ** 로 둘러싸인 텍스트 제거
  const boldText = document.createElement("strong");
  boldText.textContent = remainingText;
  block.replaceWith(boldText);
  boldText.contentEditable = "true";
  boldText.focus();
}

function createItalicText(block) {
  const remainingText = block.textContent.slice(1, -1); // * 로 둘러싸인 텍스트 제거
  const italicText = document.createElement("em");
  italicText.textContent = remainingText;
  block.replaceWith(italicText);
  italicText.contentEditable = "true";
  italicText.focus();
}
