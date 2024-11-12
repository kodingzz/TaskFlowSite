"use strict";
import { handleGetAllDocs } from "./client.js";

// const aEls = document.querySelectorAll("a");
// aEls.forEach((aEl) =>
//   aEl.addEventListener("click", function (e) {
//     e.preventDefault();
//     const id = e.currentTarget.dataset.url;
//     history.pushState({ page: id }, "", `/documents/${id}`);
//   })
// );

// window.addEventListener("popstate", function (event) {
//   const page = event.state?.page || "home";
//   console.log("뒤로가기 또는 앞으로 가기가 눌렸음", page);
// });


// document.addEventListener("DOMContentLoaded", () => {
//   async function getAllList() {
//     const data = await handleGetAllDocs();
//     console.log(data);
//   }
//   getAllList();

//   document
//     .getElementById("createDocBtn")
//     .addEventListener("click", async () => {});
// });

//사이드바 닫힘 & 펼침
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".sidebar");
  const toggleButton = document.getElementById("toggleSidebar");

  // hidden 토글
  toggleButton.addEventListener("click", () => {
    sidebar.classList.toggle("hidden"); // 사이드바 접기/펼치기
  });
});

// ** Notion 이름짓기 */
// const propMsg = "노션방 이름을 지어주세요.";
// const result = window.prompt(propMsg, "");
// console.log(result);
// const title = document.getElementById("logo");
// title.textContent = `${result || "아무개"}의 Notion`;
