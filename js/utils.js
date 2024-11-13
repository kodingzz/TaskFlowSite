export function loadEditorScript() {
  const id = `editor-script`;
  if (!document.getElementById(id)) {
    const newScript = document.createElement("script");
    newScript.id = id;
    newScript.src = `/js/editor.js`;
    document.body.appendChild(newScript);
  }
}
