"use strict";

import {
  handleCreateDoc,
  handleDeleteDoc,
  handleGetAllDocs,
  handleGetDocById,
} from "./client.js";

import {
  loadTextEditor,
  loadSidebarDocs,
  loadEditorScript,
  openModal,
  showRemoveDocModal,
} from "./utils.js";

const sidebarItems = document.querySelector(".sidebar-nav ul");
const addDocBtn = document.querySelector("#createDocBtn");

// 뒤로 가기/앞으로 가기 시 페이지 로드 처리
window.addEventListener("popstate", function (event) {
  const id = event.state?.page || "Content";
  loadTextEditor(id); // ID값에 맞는 콘텐츠 로드
});

// 부모 문서 추가
addDocBtn.addEventListener("click", async () => {
  await handleCreateDoc(JSON.stringify({ title: "", parent: null }));
  const allDocs = await handleGetAllDocs();
  const newId = allDocs.pop().id;
  loadSidebarDocs();
  history.pushState({ page: newId }, "", `/documents/${newId}`);
  loadTextEditor(newId);
});

// 페이지 로드 시 문서들을 가져오는 코드
window.onload = async function () {
  await loadSidebarDocs();
};

//  localstorage의 닫힘상태 문서들 최신화
const updateLocalStorageArray = (closeDocStr, id, isClosed) => {
  // 토글이 닫혀있는 문서가 담긴 문자열을 가져옴
  const storedDoc = localStorage.getItem(closeDocStr);
  // 문자열을 객체로 parse  , 없으면 빈 배열
  const docArray = storedDoc ? JSON.parse(storedDoc) : [];
  // 닫힘유무에 따른 해당문서 추가,삭제
  const updatedArray = isClosed
    ? [...docArray, id]
    : docArray.filter((item) => item !== id);

  localStorage.setItem(closeDocStr, JSON.stringify(updatedArray));
};

// 핸들러: 토글 버튼 클릭
const handleToggleClick = (li, parentId) => {
  li.classList.toggle("close");
  const isClosed = li.classList.contains("close");
  updateLocalStorageArray("closeArr", parentId, isClosed);
};

// 핸들러: 하위 페이지 추가
const handleAddClick = async (parentId) => {
  await handleCreateDoc(JSON.stringify({ title: "", parent: parentId }));
  const parentDocs = await handleGetDocById(parentId);
  const newId = parentDocs.documents.pop().id;

  loadSidebarDocs(); // 모든 문서 다시 로드

  history.pushState({ page: newId }, "", `/documents/${newId}`);
  loadTextEditor(newId);
};

// 핸들러: 페이지 삭제
// const handleRemoveClick = async (parentId) => {
//   await handleDeleteDoc(parentId);
//   loadSidebarDocs(); // 모든 문서 다시 로드
// };

// 문서 이벤트 위임
sidebarItems.addEventListener("click", async (e) => {
  e.preventDefault();
  const target = e.target;
  const li = target.closest("li");
  const parentLink = li.querySelector("a");
  const parentId = parentLink ? parentLink.dataset.url : null;

  if (!parentId) return;
  if (target.classList.contains("sidebar-item-toggle")) {
    handleToggleClick(li, parentId);
  } else if (target.classList.contains("sidebar-item-add")) {
    await handleAddClick(parentId);
  } else if (target.classList.contains("sidebar-item-remove")) {
    showRemoveDocModal(parentId);
  } else if (target.tagName === "A") {
    const id = target.dataset.url;
    history.pushState({ page: id }, "", `/documents/${id}`);
    loadTextEditor(id);
  }
});

const modalDeleteOverlay = document.querySelector(".modal-delete-overlay");
const modalDelete = document.querySelector(".modal-delete");

// 전체 문서 제거 함수
async function deleteAllDocs(documents) {
  for (const doc of documents) {
    const currentId = doc.id;
    if (doc.documents) {
      await deleteAllDocs(doc.documents); // 재귀적으로 자식 문서 삭제
    }
    await handleDeleteDoc(currentId); // 현재 문서 삭제
  }
}

// 전체 문서 삭제 모달창
function showRemoveAllDocModal() {
  modalDeleteOverlay.style.display = "block";
  modalDelete.style.display = "flex";
  openModal("<span>전체 문서를 삭제하시겠습니까?</span>", async () => {
    const documents = await handleGetAllDocs();
    await deleteAllDocs(documents);

    history.pushState({ page: "/" }, "", `/`); // root로 이동
    loadTextEditor("Content");
    await loadSidebarDocs(); // 모든 문서 다시 로드
    alert("모든 문서가 삭제되었습니다.");
  });
}

// 전체 문서 삭제
const deleteAllBtn = document.querySelector("#deleteDocAllBtn");

deleteAllBtn.addEventListener("click", () => {
  showRemoveAllDocModal();
});
