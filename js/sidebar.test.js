"use strict";

import {
  handleCreateDoc,
  handleDeleteDoc,
  handleGetAllDocs,
  handleGetDocById,
} from "./client.js";

import { loadEditorScript } from "./utils.js";

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

//사이드바 닫힘 & 펼침
// hidden 토글
document.getElementById("toggleSidebar").addEventListener("click", () => {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.add("hidden"); // 사이드바 접기/펼치기
  localStorage.setItem("isMenuClose", true);
  makeOpenSidebarBtn();
});
function makeOpenSidebarBtn() {
  const editorTop = document.querySelector(".editor-top");
  const openBtn = document.createElement("button");
  openBtn.classList.add("sidebar-btn");
  openBtn.classList.add("openBtn");
  openBtn.id = "sidebarOpenBtn";
  openBtn.addEventListener("click", function () {
    sidebar.classList.remove("hidden");
    localStorage.setItem("isMenuClose", false);
    this.remove();
  });
  editorTop.prepend(openBtn);
}

const sidebarItems = document.querySelector(".sidebar-nav ul");
const addDocBtn = document.querySelector("#createDocBtn");
const editor = document.querySelector("#editor");

let docList = [];
async function loadSidebarDocs() {
  sidebarItems.innerHTML = "";
  const documents = await handleGetAllDocs();
  docList = documents;

  documents.forEach((doc) => {
    addDoc(doc);
  });
}

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
  btnAdd.textContent = "+";

  const btnRemove = document.createElement("button");
  btnRemove.classList.add("sidebar-item-remove");
  btnRemove.textContent = "-";

  // depth가 3이상이면 추가버튼 x
  if (depth < 3) {
    divContent.prepend(btnToggle);
    divBtns.appendChild(btnAdd);
  }
  divBtns.appendChild(btnRemove);

  divContent.appendChild(a);
  divContent.appendChild(divBtns);

  li.appendChild(divContent);

  // 링크 클릭 시 새로운 페이지 로드 처리
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const id = e.currentTarget.dataset.url;
    history.pushState({ page: id }, "", `/documents/${id}`);
    loadTextEditor(id);
  });

  if (doc.documents.length !== 0 && depth < 3) {
    const childList = document.createElement("ul");
    doc.documents.forEach((childDoc) =>
      childList.appendChild(makeItem(childDoc, depth + 1))
    );
    li.appendChild(childList);
  }
  return li;
}

async function addDoc(doc) {
  sidebarItems.appendChild(makeItem(doc));
}

// 현재 문서에서부터 최상위 문서까지 루트 찾기
async function pathfromRoot(docId, docList) {
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

// URL에 맞는 콘텐츠 로드 (동적으로 콘텐츠를 로드하는 함수)
async function loadTextEditor(id) {
  let dirContent = '<a href="/">Home</a>';
  let paths = [];
  if (id && id !== "Content") {
    paths = await pathfromRoot(id, docList);
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

// 뒤로 가기/앞으로 가기 시 페이지 로드 처리
window.addEventListener("popstate", function (event) {
  const id = event.state?.page || "Content";
  loadTextEditor(id); // ID값에 맞는 콘텐츠 로드
});

// 부모 문서 추가 (문서 추가 시 사이드바에 표시)
addDocBtn.addEventListener("click", async () => {
  await handleCreateDoc(JSON.stringify({ title: "새 페이지", parent: null }));
  loadSidebarDocs(); // 모든 문서 다시 로드
});

// 페이지 로드 시 문서들을 가져오는 코드
window.onload = async function () {
  await loadSidebarDocs();
};

// 하위 문서 추가 ( li,button 태그가 동적으로 생성되서 이벤트 할당이 안되는 issue) 및 문서 삭제
sidebarItems.addEventListener("click", async (e) => {
  const parentId =
    e.target.parentElement.parentElement.querySelector("a").dataset.url;

  if (e.target.classList.contains("sidebar-item-toggle")) {
    const li = e.target.parentElement.parentElement;
    li.classList.toggle("close");
    const closeArr = localStorage.getItem("closeArr");
    const convertedCloseArr = closeArr ? JSON.parse(closeArr) : [];
    if (convertedCloseArr.includes(parentId) && !li.classList.contains("close"))
      localStorage.setItem(
        "closeArr",
        JSON.stringify(convertedCloseArr.filter((num) => num !== parentId))
      );
    else
      localStorage.setItem(
        "closeArr",
        JSON.stringify([...convertedCloseArr, parentId])
      );
  } else {
    if (e.target.classList.contains("sidebar-item-add")) {
      await handleCreateDoc(
        JSON.stringify({ title: "하위 페이지", parent: parentId })
      );
      loadSidebarDocs(); // 모든 문서 다시 로드
    } else if (e.target.classList.contains("sidebar-item-remove")) {
      await handleDeleteDoc(parentId);
      loadSidebarDocs(); // 모든 문서 다시 로드
    }
  }
});
