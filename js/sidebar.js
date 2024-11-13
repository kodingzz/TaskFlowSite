"use strict";

import {
  handleCreateDoc,
  handleGetAllDocs,
  handleGetDocById,
} from "./client.js";

const sidebarItems = document.querySelector(".sidebar-nav ul");
const addDocBtn = document.querySelector("#createDocBtn");
const editor = document.querySelector("#editor");

// 전체 문서 트리를 렌더링하는 함수
async function renderDocumentTree() {
  sidebarItems.innerHTML = ""; // 기존 항목 초기화

  const headersList = {
    Accept: "*/*",
    "User-Agent": "Thunder Client (https://www.thunderclient.com)",
    "x-username": "HW-5",
  };

  const response = await fetch("https://kdt-api.fe.dev-cos.com/documents", {
    method: "GET",
    headers: headersList,
  });

  const documents = await response.json();
  console.log(documents);

  // 최상위 문서부터 트리 구조로 사이드바에 추가
  documents.forEach((doc) => {
    if (!doc.parent) {
      addDoc(doc, sidebarItems, documents);
    }
  });
}

// 문서를 트리에 추가하는 함수 (재귀적으로 하위 문서 처리)
function addDoc(doc, parentElement, allDocuments) {
  const li = document.createElement("li");
  li.classList.add("sidebar-item");

  const divContent = document.createElement("div");
  divContent.classList.add("sidebar-item-content");

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

  const subDocItems = document.createElement("ul");

  divBtns.appendChild(btnAdd);
  divBtns.appendChild(btnRemove);

  divContent.appendChild(a);
  divContent.appendChild(divBtns);

  li.appendChild(divContent);
  li.appendChild(subDocItems);
  parentElement.appendChild(li);

  // 링크 클릭 시 페이지 로드
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const id = e.currentTarget.dataset.url;
    history.pushState({ page: id }, "", `/documents/${id}`);
    loadTextEditor(id);
  });

  // 재귀적으로 하위 문서 추가
  allDocuments
    .filter((childDoc) => childDoc.parent === doc.id)
    .forEach((childDoc) => addDoc(childDoc, subDocItems, allDocuments));
}

// URL에 맞는 콘텐츠 로드
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

// 뒤로 가기/앞으로 가기 시 페이지 로드 처리
window.addEventListener("popstate", function (event) {
  const id = event.state?.page || "Content";
  loadTextEditor(id);
});

// 부모 문서 추가 버튼 처리
addDocBtn.addEventListener("click", async () => {
  const headersList = {
    Accept: "*/*",
    "User-Agent": "Thunder Client (https://www.thunderclient.com)",
    "x-username": "HW-5",
    "Content-Type": "application/json",
  };

  const bodyContent = JSON.stringify({
    title: "새 페이지",
    parent: null,
  });

  // 문서 생성 요청
  await fetch("https://kdt-api.fe.dev-cos.com/documents", {
    method: "POST",
    body: bodyContent,
    headers: headersList,
  });

  // 전체 문서 목록을 다시 불러와 트리 갱신
  renderDocumentTree();
});

// 페이지 로드 시 문서 트리 초기화
window.onload = renderDocumentTree;

// 하위 문서 추가 버튼 처리 (이벤트 위임 사용)
sidebarItems.addEventListener("click", async (e) => {
  if (e.target.classList.contains("sidebar-item-add")) {
    const subDocItems = e.target.closest(".sidebar-item").querySelector("ul");
    const parentId = e.target.closest(".sidebar-item").querySelector("a")
      .dataset.url;

    const headersList = {
      Accept: "*/*",
      "User-Agent": "Thunder Client (https://www.thunderclient.com)",
      "x-username": "HW-5",
      "Content-Type": "application/json",
    };

    const bodyContent = JSON.stringify({
      title: "하위 페이지",
      parent: parentId,
    });

    // 하위 문서 생성 요청
    await fetch("https://kdt-api.fe.dev-cos.com/documents", {
      method: "POST",
      body: bodyContent,
      headers: headersList,
    });

    // 전체 문서 목록을 다시 불러와 트리 갱신
    renderDocumentTree();
  }
});
