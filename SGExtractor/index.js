import "https://cdnjs.cloudflare.com/ajax/libs/ice/3.7.100/Ice.min.js";
import { NBTData, stringify } from "https://cdn.jsdelivr.net/npm/nbtify@1.90.1/dist/index.min.js";

import "../js/settings.js"; // sets theme and lang
import "../js/background.js"; // this sets an 'onload' handler
import "../js/fadeout.js"; // this sets a 'DOMContentLoaded' handler
import "../js/LCEE-Core.js"; // component setup

import { switchCompressionMode } from '../js/LCEE-Core.js';
import { fadeBG } from '../js/background.js';
import { setVer } from '../js/ver.js';
import { readFile } from "../js/LCEE-Core.js";

let i = 0;
function incrementI() {
  // only thing I could think to name it...
  if (i > 1) {
    i = 0;
  } else {
    i++;
  }
  switchCompressionMode(i);
}
document.querySelector('#CompModeBtn').addEventListener('click', incrementI);
document.querySelector('#backNBTBtn').addEventListener('click', hideNBTCard);
fadeBG(true);
setVer("le");


/**
 * @param {NBTData | undefined} data
 */
export function showNBTCard(data) {
    if (data == undefined)
        throw new Error("Data is undefined!");

    if (document.getElementById("nbtCard").style.display == "none") {
        document.getElementById("lceCard").style.display = "none";
        document.getElementById("back").style.display = "none";
        document.getElementById("nbtCard").style.display = "flex";
        document.getElementById("backNBTBtn").style.display = "block";
        document.getElementById("nbtData").innerText = stringify(data, { space: 2 });
    }

}

/**
 * @returns {void}
 */
export function hideNBTCard() {
    if (document.getElementById("nbtCard").style.display !== "none") {
        document.getElementById("back").style.display = "block";
        document.getElementById("backNBTBtn").style.display = "none";
        document.getElementById("lceCard").style.display = "flex";
        document.getElementById("nbtCard").style.display = "none";
    }
}


/** @type {HTMLInputElement} */ (
  document.getElementById("fileInput")
).addEventListener("change", onFileSelected);

/**
 * @this {HTMLInputElement}
 * @param {Event} event
 * @returns {void}
 */
function onFileSelected(event) {
  const file = /** @type {typeof this} */ (event.target).files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const data = new Uint8Array(
        /** @type {ArrayBuffer} */ (event.target.result)
      );
      readFile(data, file.name);
    };
    reader.readAsArrayBuffer(file);
  }
}

document.addEventListener("dragover", (e) => {
  e.preventDefault();
});

document.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const data = new Uint8Array(
        /** @type {ArrayBuffer} */ (event.target.result)
      );
      readFile(data, file.name);
    };
    reader.readAsArrayBuffer(file);
  }
});