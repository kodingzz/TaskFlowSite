import { handleGetAllDocs, handleGetDocById } from "./client.js";

let docLists = await handleGetAllDocs();

const EDITOR_TEMP = ` <div class="editor-content">
<div class="title-container">
  <input
    id="title-input"
    class="title-input"
    placeholder="제목"
  ></input>
</div>
<div id="text-container">
<div class="text-block" contenteditable="true"></div>
</div>
</div>
`;

export function loadEditorScript() {
  const id = `editor-script`;
  if (!document.getElementById(id)) {
    const newScript = document.createElement("script");
    newScript.id = id;
    newScript.src = `/js/editor.js`;
    document.body.appendChild(newScript);
  }
}

export async function loadTextEditor(id) {
  let dirContent = '<a href="/">Home</a>';
  let paths = [];
  if (id && id !== "Content") {
    paths = await pathfromRoot(id, docLists);
  }
  paths.forEach((item) => {
    dirContent += `<span>/</span><a href="/documents/${item.id}" data-url="${item.id}">${item.title}</a>`;
  });

  const content =
    id === "Content"
      ? `
      <div class="editor-top">
    <div class="editor-dir">${dirContent}</div>
  </div>
      <div class="intro">Hello World</div>`
      : id
      ? `
    <div class="editor-top">
    <div class="editor-dir">${dirContent}</div>
  </div>
 ${EDITOR_TEMP}
  `
      : "<h1>페이지를 찾을 수 없습니다.</h1>";
  editor.innerHTML = content;

  // 경로 읽기
  document.querySelector(".editor-dir").addEventListener("click", (e) => {
    e.preventDefault();

    const id = e.target.dataset.url;

    if (!id) {
      history.pushState({ page: "/" }, "", `/`); // root로 이동
      loadTextEditor("Content");
    } else {
      history.pushState({ page: id }, "", `/documents/${id}`);
      loadTextEditor(id);
    }
  });
  loadEditorScript();
  const isMenuClose = localStorage.getItem("isMenuClose");
  console.log("isMenuClose", isMenuClose);
  if (isMenuClose === "true") makeOpenSidebarBtn();
}

export async function pathfromRoot(docId, docList) {
  const path = [];
  let currentDoc = await handleGetDocById(docId);

  // 최상위 문서 도달할때까지 반복
  while (currentDoc) {
    path.unshift(currentDoc);
    currentDoc = findParentDoc(currentDoc.id, docList);
  }

  return path;
}

// 재귀적으로 부모 문서 찾기
export function findParentDoc(childId, docs) {
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
