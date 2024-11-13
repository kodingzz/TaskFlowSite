"use strict";

import {
  handleCreateDoc,
  handleDeleteDoc,
  handleGetAllDocs,
  handleGetDocById,
} from "./client.js";

const sidebarItems = document.querySelector(".sidebar-nav ul");
const addDocBtn = document.querySelector("#createDocBtn");
const editor = document.querySelector("#editor");
const aEls = document.querySelectorAll(".sidebar-item-content a");

async function loadSidebarDocs() {
  // 기존 문서 항목 모두 제거
  sidebarItems.innerHTML = "";

  // 모든 문서를 가져와 사이드바에 추가

  const documents = await handleGetAllDocs();

  // 문서를 순회하며 사이드바에 추가
  documents.forEach((doc) => {
    console.log(doc);

    addDoc(doc);
  });
}

async function addDoc(doc) {
  // 문서 객체 생성
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
  sidebarItems.appendChild(li);

  // 링크 클릭 시 새로운 페이지 로드 처리
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const id = e.currentTarget.dataset.url;
    history.pushState({ page: id }, "", `/documents/${id}`);
    loadTextEditor(id);
  });
}

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

// 뒤로 가기/앞으로 가기 시 페이지 로드 처리
window.addEventListener("popstate", function (event) {
  const id = event.state?.page || "Content";
  loadTextEditor(id); // ID값에 맞는 콘텐츠 로드
});

// 부모 문서 추가 (문서 추가 시 사이드바에 표시)
addDocBtn.addEventListener("click", async () => {
  const data = await handleCreateDoc(
    JSON.stringify({ title: "새 페이지", parent: null })
  );
  loadSidebarDocs(); // 모든 문서 다시 로드
});

// 페이지 로드 시 문서들을 가져오는 코드
window.onload = loadSidebarDocs();

sidebarItems.addEventListener("click", async (e) => {
  const subDocItems = e.currentTarget.firstElementChild.lastElementChild;
  const parentId =
    e.target.parentElement.parentElement.firstElementChild.dataset.url;

  // 하위 문서 추가
  if (e.target.classList.contains("sidebar-item-add")) {
    const data = await handleCreateDoc(
      JSON.stringify({ title: "하위 페이지", parent: parentId })
    );

    loadSidebarDocs(); // 모든 문서 다시 로드

    //  문서 삭제
  } else if (e.target.classList.contains("sidebar-item-remove")) {
    const data = await handleDeleteDoc(parentId);
    loadSidebarDocs(); // 모든 문서 다시 로드
  }
});
