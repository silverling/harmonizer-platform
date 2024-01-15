import emitter from "./emitter";

export function uploadImage(e) {
  const file = e.target.files[0];
  console.log(e);
  const reader = new FileReader();
  reader.onload = e => emitter.emit("uploadImage", { name: basenameWithoutExt(file.name), dataUrl: e.target.result });
  reader.readAsDataURL(file);
}

export function uploadModel(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = e => emitter.emit("uploadModel", { name: basenameWithoutExt(file.name), dataUrl: e.target.result });
  reader.readAsArrayBuffer(file);
}

function basenameWithoutExt(path) {
  return path.substring(0, path.lastIndexOf("."));
}

export function saveBlob(blob, fileName) {
  const url = window.URL.createObjectURL(blob);
  saveDataUrl(url);
}

export function saveDataUrl(dataUrl, fileName) {
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style.display = "none";
  a.href = dataUrl;
  a.download = fileName;
  a.click();
  document.body.removeChild(a);
}

export async function postData(url, data) {
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify(data),
  });
  return response.json();
}
