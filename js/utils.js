import {
  handleDeleteDoc,
  handleGetAllDocs,
  handleGetDocById,
} from "./client.js";
let docList = [];
const sidebarItems = document.querySelector(".sidebar-nav ul");
let currentParentId = null;

// 모든 문서 랜더링
export async function loadSidebarDocs() {
  sidebarItems.innerHTML = "";
  const documents = await handleGetAllDocs();

  docList = documents;

  let items = "";
  documents.forEach(async (doc) => {
    items += makeItem(doc).outerHTML;
  });
  sidebarItems.innerHTML = items;
}

// 문서 구조 생성. 하위문서가 있다면 하위문서도 재귀적으로 생성
function makeItem(doc, depth = 1) {
  const li = document.createElement("li");
  li.classList.add("sidebar-item");

  const closeArr = localStorage.getItem("closeArr");
  const convertedCloseArr = closeArr ? JSON.parse(closeArr) : [];

  if (convertedCloseArr.includes(doc.id.toString())) li.classList.add("close");

  const divContent = document.createElement("div");
  divContent.classList.add("sidebar-item-content");

  const btnToggle = document.createElement("button");
  btnToggle.classList.add("sidebar-item-toggle");

  const a = document.createElement("a");
  a.href = `/documents/${doc.id}`;
  a.dataset.url = doc.id;
  a.textContent = doc.title;

  const divBtns = document.createElement("div");
  divBtns.classList.add("sidebar-item-btns");

  const btnAdd = document.createElement("button");
  btnAdd.classList.add("sidebar-item-add");

  const btnRemove = document.createElement("button");
  btnRemove.classList.add("sidebar-item-remove");

  // depth가 5이상이면 추가버튼 x
  if (depth < 5) {
    divContent.prepend(btnToggle);
    divBtns.appendChild(btnAdd);
  }

  divBtns.appendChild(btnRemove);

  divContent.appendChild(a);
  divContent.appendChild(divBtns);

  li.appendChild(divContent);

  const childList = document.createElement("ul");
  if (doc.documents.length !== 0 && depth < 5) {
    doc.documents.forEach((childDoc) =>
      childList.appendChild(makeItem(childDoc, depth + 1))
    );
    li.appendChild(childList);
  } else if (doc.documents.length === 0) {
    const li2 = document.createElement("li");
    li2.classList.add("sidebar-item");

    const closeArr = localStorage.getItem("closeArr");
    const convertedCloseArr = closeArr ? JSON.parse(closeArr) : [];

    if (convertedCloseArr.includes(doc.id.toString()))
      li2.classList.add("close");

    const divContent = document.createElement("div");
    divContent.classList.add("sidebar-item-base");
    divContent.textContent = "하위 페이지 없음";

    li2.appendChild(divContent);
    childList.appendChild(li2);
    li.appendChild(childList);
  }
  return li;
}

//  editor.js 파일을 동적으로 추가
export function loadEditorScript() {
  const id = `editor-script`;
  if (!document.getElementById(id)) {
    const newScript = document.createElement("script");
    newScript.id = id;
    newScript.src = `/js/editor.js`;
    newScript.type = "module";
    document.body.appendChild(newScript);
  }
}

// URL에 맞는 editor 동적 로드
export async function loadTextEditor(id) {
  let currentDoc = id !== "Content" && (await handleGetDocById(id));

  // 1. editor paths
  const dirContent = await makePath(id);

  // 2. editor contents
  const editorTemp = `
    <input
      id="title-input"
      class="title-input"
      placeholder="제목"
      value="${currentDoc.title === "" ? "" : currentDoc.title}"
    />
    <div id="text-container">
    ${
      currentDoc && currentDoc.content !== null
        ? //  content의 div태그들을 불러옴
          currentDoc.content
        : '<div  class="text-block first-block" contenteditable="true"></div>'
    }
    </div>
`;

  // 3. editor subDocs
  const subDocs = currentDoc?.documents;
  let subDocsLink = "";
  if (subDocs) {
    subDocs.forEach((doc) => {
      subDocsLink += `<a href="/documents/${doc.id}" data-url="${doc.id}">${doc.title}</a>`;
    });
  }

  const editorAllInfo =
    id === "Content"
      ? `
      <div class="editor-top">
        <div class="editor-dir">${dirContent}</div>
      </div>
      <div class="intro">Hi There!🖐</div>`
      : id
      ? `
      <div class="editor-top">
        <div class="editor-dir">${dirContent}</div>
        <div class="editor-top-deletebutton">
            <button id="deleteDocBtn" type="button" class="editor-delete">
              <img src="/assets/images/trash.png" alt="delete icon" />
            </button>
        </div>
      </div>
      <div class="editor-content">
      ${editorTemp}
      </div>
      <div class="editor-bottom">
       ${subDocsLink}
      </div>
  `
      : "<h1>페이지를 찾을 수 없습니다.</h1>";
  document.querySelector("#editor").innerHTML = editorAllInfo;

  // 경로에 있는 문서 클릭시 이동
  document.querySelector(".editor-dir").addEventListener("click", async (e) => {
    e.preventDefault();
    const id = e.target.dataset.url;
    if (!id) {
      history.pushState({ page: "/" }, "", `/`); // root로 이동
      await loadTextEditor("Content");
    } else {
      history.pushState({ page: id }, "", `/documents/${id}`);
      await loadTextEditor(id);
    }
  });

  // 동적 생성된 하위 문서 링크 클릭시 이동
  const editorBottom = document.querySelector(".editor-bottom");
  editorBottom &&
    editorBottom.addEventListener("click", (e) => {
      e.preventDefault();
      if (e.target.tagName === "A") {
        const id = e.target.dataset.url;
        history.pushState({ page: id }, "", `/documents/${id}`);
        loadTextEditor(id);
      }
    });

  loadEditorScript();

  const isMenuClose = localStorage.getItem("isSidebarClose");
  if (isMenuClose === "true") {
    makeOpenSidebarBtn();
    handleMenuClose();
  }

  // 현재 페이지인 문서 active 상태 만들기
  const allLinks = document.querySelectorAll(".sidebar-item-content");
  allLinks.forEach((link) => {
    if (link.querySelector("a").dataset.url === id.toString()) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // 문서 처음 생성후 content 작성시 제목,내용 placeholder로 표시
  const firstBlock = document.querySelector(".first-block");

  if (firstBlock) {
    firstBlock.textContent = "내용을 입력하세요.";

    firstBlock.addEventListener("focus", () => {
      if (firstBlock.classList.contains("first-block")) {
        firstBlock.classList.remove("first-block");
        firstBlock.textContent = "";
      }
    });

    firstBlock.addEventListener("blur", () => {
      if (firstBlock.textContent.trim() === "") {
        firstBlock.classList.add("first-block");
        firstBlock.textContent = "내용을 입력하세요.";
      }
    });
  }
  // 동적 생성된 문서 삭제시 삭제 모달창
  const editorTopDeleteBtn = document.querySelector("#deleteDocBtn");

  editorTopDeleteBtn?.addEventListener("click", () => {
    id && showRemoveDocModal(id);
  });
}

// 특정 문서  삭제 모달창
export function showRemoveDocModal(parentId) {
  currentParentId = parentId;
  modalDeleteOverlay.style.display = "block";
  modalDelete.style.display = "flex";
  openModal("<span>문서를 삭제하시겠습니까?</span>", async () => {
    await handleDeleteDoc(currentParentId);
    history.pushState({ page: "/" }, "", `/`); // root로 이동
    loadTextEditor("Content");
    loadSidebarDocs(); // 모든 문서 다시 로드
  });
}
// 문서 경로 만들기
async function makePath(id) {
  let dirContent = '<a href="/">Home</a>';
  let paths = [];

  if (id && id !== "Content") {
    paths = await pathfromRoot(id, docList);
  }
  paths.forEach((item) => {
    dirContent += `<span>/</span><a href="/documents/${item.id}" data-url="${item.id}">${item.title}</a>`;
  });
  return dirContent;
}

// 현재 문서에서부터 최상위 문서까지 루트 찾기
async function pathfromRoot(currentDocId, docList) {
  const paths = [];
  let currentDoc = await handleGetDocById(currentDocId);

  // 최상위 문서 도달할때까지 반복
  while (currentDoc) {
    paths.unshift(currentDoc);
    currentDoc = findParentDoc(currentDoc.id, docList);
  }

  return paths;
}

// 현재 문서에서 부모 문서 찾기
function findParentDoc(childId, docs) {
  for (const doc of docs) {
    if (doc.documents.some((subDoc) => subDoc.id === childId)) {
      return doc;
    }
    // 하위문서 더 있는 경우
    const parentDoc = findParentDoc(childId, doc.documents);
    if (parentDoc) return parentDoc;
  }
  return null;
}

const modalDeleteOverlay = document.querySelector(".modal-delete-overlay");
const modalDelete = document.querySelector(".modal-delete");
const modalTitle = document.querySelector(".modal-delete-title");
const deleteDocBtn = document.querySelector(".modal-delete-button");
const cancelDocBtn = document.querySelector(".modal-cancel-button");

/**
 * Opens the modal with dynamic content.
 * @param {string} title - Title of the modal.
 * @param {Function} onConfirm - Callback function when confirm is clicked.
 */

// 문서 삭제 모달창 여는 함수
export function openModal(title, onConfirm) {
  modalTitle.innerHTML = title;

  deleteDocBtn.addEventListener(
    "click",
    (e) => {
      if (onConfirm) onConfirm();
      closeModal(e);
    },
    { once: true }
  );
  cancelDocBtn.addEventListener("click", (e) => {
    closeModal(e);
  });
}
export function closeModal(e) {
  e.preventDefault();
  modalDeleteOverlay.style.display = "none";
  modalDelete.style.display = "none";
}

// deleteDocBtn.addEventListener("click", async () => {
//   await handleDeleteDoc(currentParentId);
//   history.pushState({ page: "/" }, "", `/`); // root로 이동
//   loadTextEditor("Content");
//   loadSidebarDocs(); // 모든 문서 다시 로드
// });

// 사이드바 토글 버튼 클릭시 사이드바 접히고 오픈버튼 생성
document.getElementById("toggleSidebar").addEventListener("click", () => {
  handleMenuClose();
  makeOpenSidebarBtn();
});

// 사이드바 접히기
function handleMenuClose() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.add("hidden"); // 사이드바 접기/펼치기
  localStorage.setItem("isSidebarClose", true);
}

// 사이드바 생성 버튼
function makeOpenSidebarBtn() {
  const editorTop = document.querySelector(".editor-top");
  const openBtn = document.createElement("button");
  openBtn.classList.add("sidebar-btn");
  openBtn.classList.add("openBtn");
  openBtn.id = "sidebarOpenBtn";
  editorTop.prepend(openBtn);

  openBtn.addEventListener("click", function () {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.remove("hidden");
    localStorage.setItem("isSidebarClose", false);
    this.remove();
  });
}

// editor.js

export async function makePathDir(id) {
  const dir = document.querySelector(".editor-dir");
  if (dir) dir.innerHTML = await makePath(id);
}
