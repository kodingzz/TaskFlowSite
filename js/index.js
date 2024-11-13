"use strict";
// ** Notion 이름짓기 */
// const propMsg = "노션방 이름을 지어주세요.";
// const result = window.prompt(propMsg, "");
// console.log(result);
// const title = document.getElementById("logo");
// title.textContent = `${result || "아무개"}의 Notion`;

//사이드바 닫힘 & 펼침
document.addEventListener("DOMContentLoaded", () => {
  // hidden 토글
  document.getElementById("toggleSidebar").addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.add("hidden"); // 사이드바 접기/펼치기
    const editorTop = document.querySelector(".editor-top");
    const openBtn = document.createElement("button");
    openBtn.classList.add("sidebar-btn");
    openBtn.classList.add("openBtn");
    openBtn.id = "sidebarOpenBtn";
    openBtn.addEventListener("click", function () {
      sidebar.classList.remove("hidden");
      this.remove();
    });
    editorTop.prepend(openBtn);
  });
});
