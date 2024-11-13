"use strict";

import {
  handleCreateDoc,
  handleGetAllDocs,
  handleGetDocById,
} from "./client.js";

const sidebarItems = document.querySelector(".sidebar-nav ul");
const addDocBtn = document.querySelector("#createDocBtn");
const editor = document.querySelector("#editor");
const aEls = document.querySelectorAll("a");

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

  divBtns.appendChild(btnAdd);
  divBtns.appendChild(btnRemove);

  divContent.appendChild(a);
  divContent.appendChild(divBtns);

  li.appendChild(divContent);
  sidebarItems.appendChild(li);

  // 링크 클릭 시 새로운 페이지 로드 처리
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const id = e.currentTarget.dataset.url;
    history.pushState({ page: id }, "", `/documents/${id}`);
    loadTextEditor(id);
  });
}

// 링크 클릭 시 이벤트 핸들러
aEls.forEach((aEl) =>
  aEl.addEventListener("click", function (e) {
    e.preventDefault();

    const id = e.currentTarget.dataset.url;
    history.pushState({ page: id }, "", `/documents/${id}`);
    loadTextEditor(id);
  })
);

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
  let headersList = {
    Accept: "*/*",
    "User-Agent": "Thunder Client (https://www.thunderclient.com)",
    "x-username": "HW-5",
    "Content-Type": "application/json",
  };

  let bodyContent = JSON.stringify({
    title: "새 페이지",
    parent: null,
  });

  let response = await fetch("https://kdt-api.fe.dev-cos.com/documents", {
    method: "POST",
    body: bodyContent,
    headers: headersList,
  });

  const data = response.json();
  addDoc(data);
});

// 페이지 로드 시 문서들을 가져오는 코드
window.onload = async function () {
  let headersList = {
    Accept: "*/*",
    "User-Agent": "Thunder Client (https://www.thunderclient.com)",
    "x-username": "HW-5",
  };

  const response = await fetch("https://kdt-api.fe.dev-cos.com/documents", {
    method: "GET",
    headers: headersList,
  });

  const documents = await response.json();

  // 문서 데이터 가져오기 및 사이드바에 추가
  documents.forEach((doc) => {
    addDoc(doc);
  });
};

// 하위 문서 추가 ( li,button 태그가 동적으로 생성되서 이벤트 할당이 안되는 issue)
sidebarItems.addEventListener("click", async (e) => {
  if (e.target.classList.contains("sidebar-item-add")) {
    const parentId =
      e.target.parentElement.parentElement.firstElementChild.dataset.url;
    let headersList = {
      Accept: "*/*",
      "User-Agent": "Thunder Client (https://www.thunderclient.com)",
      "x-username": "HW-5",
      "Content-Type": "application/json",
    };

    let bodyContent = JSON.stringify({
      title: "하위 페이지",
      parent: parentId,
    });

    let response = await fetch("https://kdt-api.fe.dev-cos.com/documents", {
      method: "POST",
      body: bodyContent,
      headers: headersList,
    });
  }
});
