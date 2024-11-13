import { handleGetAllDocs, handleGetDocById } from "./client.js";

let docLists = await handleGetAllDocs();

export function loadEditorScript() {
  const id = `editor-script`;
  if (!document.getElementById(id)) {
    const newScript = document.createElement("script");
    newScript.id = id;
    newScript.src = `/js/editor.js`;
    document.body.appendChild(newScript);
  }
}

export async function loadTextEditor(id) {
  let dirContent = '<a href="/">Home</a>';
  let paths = [];
  if (id && id !== "Content") {
    paths = await pathfromRoot(id, docLists);
  }
  paths.forEach((item) => {
    dirContent += `<span>/</span><a href="/documents/${item.id}" data-url="${item.id}">${item.title}</a>`;
  });
}

export async function pathfromRoot(docId, docList) {
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
export function findParentDoc(childId, docs) {
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
