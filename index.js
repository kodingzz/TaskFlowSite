"use strict";
//** Notion 이름짓기 */
// const propMsg = "노션방 이름을 지어주세요.";
// const result = window.prompt(propMsg, "");
// console.log(result);
// const title = document.getElementById("notionTitle");
// title.textContent = `${result || "아무개"}의 Notion`;

const aEls = document.querySelectorAll("a");
aEls.forEach((aEl) =>
  aEl.addEventListener("click", function (e) {
    e.preventDefault();
    const id = e.currentTarget.dataset.url;
    history.pushState({ page: id }, "", `/documents/${id}`);
  })
);

window.addEventListener("popstate", function (event) {
  const page = event.state?.page || "home";
  console.dir(event.state?.page || "home");
  console.log("뒤로가기 또는 앞으로 가기가 눌렸음");
});
