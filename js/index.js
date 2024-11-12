"use strict";
import { handleGetAllDocs } from "./client.js";

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
  console.log("뒤로가기 또는 앞으로 가기가 눌렸음", page);
});
www;

document.addEventListener("DOMContentLoaded", () => {
  async function getAllList() {
    const data = await handleGetAllDocs();
    console.log(data);
  }
  getAllList();

  document
    .getElementById("createDocBtn")
    .addEventListener("click", async () => {});
});

//** Notion 이름짓기 */
const propMsg = "노션방 이름을 지어주세요.";
const result = window.prompt(propMsg, "");
console.log(result);
const title = document.getElementById("notionTitle");
title.textContent = `${result || "아무개"}의 Notion`;
