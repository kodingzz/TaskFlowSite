"use strict";

import { handleCreateDoc, handleDeleteDoc } from "./client.js";

import { loadTextEditor, loadSidebarDocs } from "./utils.js";

const sidebarItems = document.querySelector(".sidebar-nav ul");
const addDocBtn = document.querySelector("#createDocBtn");

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
//
