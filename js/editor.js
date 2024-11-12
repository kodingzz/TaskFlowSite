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

  // Enter 키를 누르면 새 텍스트 블록 생성
  if (e.key === "Enter") {
    e.preventDefault(); // 기본 Enter 키 동작 방지

    // 새 텍스트 블록 생성
    const newTextBlock = document.createElement("div");
    newTextBlock.classList.add("text-block");
    newTextBlock.contentEditable = "true";

    // 현재 포커스가 있는 블록 뒤에 새 블록 추가
    if (
      currentBlock.classList.contains("text-block") &&
      currentBlock.textContent.trim() !== ""
    ) {
      currentBlock.parentNode.insertBefore(
        newTextBlock,
        currentBlock.nextSibling
      );
      newTextBlock.focus();
    }
  }

  // Delete 키를 누르면 현재 블록이 비어 있으면 이전 블록으로 이동
  if (e.key === "Delete") {
    if (
      currentBlock.textContent.trim() === "" &&
      currentBlock.previousElementSibling
    ) {
      // 현재 블록이 비어 있으면 이전 블록으로 포커스 이동
      currentBlock.previousElementSibling.focus();
      currentBlock.remove(); // 현재 빈 블록 삭제
    }
  }

  // Arrow Up 키: 위쪽 블록으로 포커스 이동
  if (e.key === "ArrowUp") {
    if (currentBlock.previousElementSibling) {
      // 위쪽 블록으로 포커스 이동
      currentBlock.previousElementSibling.focus();
    }
  }

  // Arrow Down 키: 아래쪽 블록으로 포커스 이동
  if (e.key === "ArrowDown") {
    if (currentBlock.nextElementSibling) {
      // 아래쪽 블록으로 포커스 이동
      currentBlock.nextElementSibling.focus();
    }
  }
});

// 키 이벤트 및 입력 처리
document.getElementById("editor").addEventListener("input", function (e) {
  const currentBlock = document.activeElement;

  // 텍스트 블록 내에서만 처리
  if (currentBlock && currentBlock.classList.contains("text-block")) {
    const textContent = currentBlock.textContent;

    // Markdown 체크 후 변환
    if (textContent.startsWith("### ") && textContent.length > 4) {
      createHeaderBlock(currentBlock, "h3", 4); // '### ' -> h3
    } else if (textContent.startsWith("## ") && textContent.length > 3) {
      createHeaderBlock(currentBlock, "h2", 3); // '## ' -> h2
    } else if (textContent.startsWith("# ") && textContent.length > 2) {
      createHeaderBlock(currentBlock, "h1", 2); // '# ' -> h1
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

// 제목 블록 생성 함수
function createHeaderBlock(block, headerTag, sliceLength) {
  const remainingText = block.textContent.slice(sliceLength).trim(); // Markdown 기호 제거
  const headerBlock = document.createElement(headerTag);
  headerBlock.textContent = remainingText;
  headerBlock.classList.add("text-block");

  // 블록 교체
  block.replaceWith(headerBlock);

  // 새 블록에 포커스 설정
  headerBlock.contentEditable = "true";
  headerBlock.focus();
}

// Blockquote 처리
function createBlockquote(block) {
  const blockquote = document.createElement("blockquote");
  blockquote.textContent = block.textContent.slice(2).trim();
  blockquote.classList.add("text-block");

  block.replaceWith(blockquote);
  blockquote.contentEditable = "true";
  blockquote.focus();
}

// Unordered list 처리
function createListItem(block) {
  const listItem = document.createElement("li");
  listItem.textContent = block.textContent.trim().slice(2).trim();
  const ul = document.createElement("ul");
  ul.appendChild(listItem);

  block.replaceWith(ul);
  listItem.contentEditable = "true";
  listItem.focus();
}

// Ordered list 처리
function createOrderedListItem(block) {
  const listItem = document.createElement("li");
  listItem.textContent = block.textContent
    .trim()
    .slice(block.textContent.indexOf(".") + 1)
    .trim();
  const ol = document.createElement("ol");
  ol.appendChild(listItem);

  block.replaceWith(ol);
  listItem.contentEditable = "true";
  listItem.focus();
}

// Bold 처리
function createBoldText(block) {
  const remainingText = block.textContent.slice(2, -2); // ** 로 둘러싸인 텍스트 제거
  const boldText = document.createElement("strong");
  boldText.textContent = remainingText;
  block.replaceWith(boldText);
  boldText.contentEditable = "true";
  boldText.focus();
}

// Italic 처리
function createItalicText(block) {
  const remainingText = block.textContent.slice(1, -1); // * 로 둘러싸인 텍스트 제거
  const italicText = document.createElement("em");
  italicText.textContent = remainingText;
  block.replaceWith(italicText);
  italicText.contentEditable = "true";
  italicText.focus();
}
