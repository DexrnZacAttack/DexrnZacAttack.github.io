// Dexrn: THIS IS CURSED AND IN PROGRESS ITS 2 AM AAAAAAAAAAAAAAA

/*
Copyright 2024 Dexrn ZacAttack

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/** @type {"big" | "little"} */
let endianness;
/** @type {boolean} */
let littleEndian;

/** @type {boolean} */
let vita = false;

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
      readFile(data);
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
      readFile(data);
    };
    reader.readAsArrayBuffer(file);
  }
});

/** @type {number} */
let inByteIndex = 0;

/**
 * Fills a portion of an array with a specified value.
 * @param {Uint8Array} array
 * @param {number} value
 * @param {number} start
 * @param {number} length
 */
function memset(array, value, start, length) {
  for (let i = start; i < start + length; i++) {
    array[i] = value;
  }
}

/**
 * @param {Uint8Array} dataIn - The array
 * @param {number} offset - how far to seek
 * @returns {Uint8Array} - the array after seeking
 */
function seek(dataIn, offset) {
  return dataIn.slice(offset);
}

/**
 * @param {Uint8Array} dataIn - The data
 * @returns {number} - The byte.
 */
function readByte(dataIn) {
  return dataIn[inByteIndex++];
}

/**
 * @param {Uint8Array} data - The compressed data
 * @returns {Uint8Array} - The size of the decompressed data.
 */
/*
 * This is Zugebot (jerrinth3glitch)'s code ported to JS (mostly complete but not working!!!)
 * https://github.com/zugebot/LegacyEditor
 */
// Big thanks to Offroaders for helping out with this, would've been barely possible without them!
function runLengthDecode(data) {
    const compressedLength = data.byteLength;
    const result = [];
    let readOffset = 0;
    let writeOffset = 0;
  
    while (readOffset < compressedLength){
      const suspectedTag = data[readOffset];
      readOffset++;
  
      if (suspectedTag !== 0){
        result[writeOffset] = suspectedTag;
        writeOffset++;
      } else {
        const length = data[readOffset];
        readOffset++;
        for (let i = 0; i < length; i++){
          result.push(0);
          writeOffset++;
        }
      }
    }
  
    return new Uint8Array(result);
  }

let compressionMode = "none";

/**
 * @param {0 | 1 | 2} mode
 * @returns {void}
 */
function switchCompressionMode(mode) {
  switch (mode) {
    case 0:
      document.getElementById("CompModeBtn").innerText =
        "Save type: Wii U, PS3, Decompressed Xbox 360";
      endianness = "big";
      vita = false;
      break;
    case 1:
      document.getElementById("CompModeBtn").innerText =
        "Save type: Switch, PS4";
      endianness = "little";
      vita = false;
      break;
    case 2:
      document.getElementById("CompModeBtn").innerText = "Save type: Vita";
      endianness = "little";
      vita = true;
      break;
  }
}

/**
 * @param {Uint8Array} data
 * @returns {void}
 */
function readFile(data) {
  try {
    document.getElementById("output").textContent = "";
    document.getElementById("files").innerHTML = "";
    document.getElementById("files").style.display = "none";
    let decompressedData = null;

    if (!endianness) endianness = "big";

    if (endianness == "little") {
      littleEndian = true;
    } else {
      littleEndian = false;
    }
    let offsetToRead;
    if (data) {
      if (vita !== true) {
        try {
          let dataToDecompress = seek(data, 8);
          if (endianness == "little") {
            decompressedData = pako.inflate(dataToDecompress, {
              endian: "little",
            });
          } else {
            decompressedData = pako.inflate(dataToDecompress, {
              endian: "big",
            });
          }

          if (decompressedData) data = decompressedData;
          console.log("This is ZLib/Deflate compressed.");
          console.log(decompressedData);
        } catch {
          console.log("This is not ZLib compressed.");
        }
      } else {
        /** @type {Uint8Array} */
        data = runLengthDecode(data.slice(8));
      }
    } else {
      console.error("No data received...");
    }

    // there is no error handling LMAO
    let offset, count;
    if (endianness === "little") {
      offset = (data[3] << 24) | (data[2] << 16) | (data[1] << 8) | data[0];
      count = (data[7] << 24) | (data[6] << 16) | (data[5] << 8) | data[4];
    } else {
      offset = (data[0] << 24) | (data[1] << 16) | (data[2] << 8) | data[3];
      count = (data[4] << 24) | (data[5] << 16) | (data[6] << 8) | data[7];
    }
    var lceRoot = document.createElement("div");
    lceRoot.id = "lceRoot";
    document.getElementById("files").appendChild(lceRoot);
    while (offset + 144 <= data.byteLength) {
      const bytes = data.slice(offset, offset + 144);
      offset += 144;

      const line = new TextDecoder().decode(bytes);
      var fileNameFromSaveGame = line.substring(0, 80).replace(/\x00/g, "");
      if (fileNameFromSaveGame === "")
        fileNameFromSaveGame = "Corrupted or unreadable";
      const filelength = new DataView(bytes.buffer, 128, 4).getInt32(
        0,
        littleEndian
      );
      const fileoffset = new DataView(bytes.buffer, 132, 4).getInt32(
        0,
        littleEndian
      );

    const sgBlob = new Blob(
        new Array(data.slice(fileoffset, fileoffset + filelength))
        );
      const blobUrl = URL.createObjectURL(sgBlob);
      var file = document.createElement("a");
      file.className = "LCEFile";
      file.href = blobUrl;
      file.download = fileNameFromSaveGame;
      if (fileNameFromSaveGame.includes("/")) {
        // split the name between folder and filename
        let newName = fileNameFromSaveGame.split("/");
        console.log(newName);
        // create an element with filename (notice the 1)
        file.innerText = newName[1];
        // create a div to hold the files in their respective folders
        var lceFolder = document.createElement("div");
        // create a header with the foldername (newName[0])
        var folderName = document.createElement("h3");
        folderName.innerText = newName[0];
        folderName.className = "LCEFolderName";
        if (!document.getElementById("LCEFolder_" + newName[0])) {
          // add the folderName to the lceFolder if it doesn't already exist(god this is so weird)
          lceFolder.appendChild(folderName);
          lceFolder.className = "LCEFolder";
          lceFolder.id = "LCEFolder_" + newName[0];
        }

        // add the folder into the upper files div
        document.getElementById("files").appendChild(lceFolder);
        if (!document.getElementById("LCEFolder_" + newName[0]))
          lceFolder.appendChild(file);
        else
          document.getElementById("LCEFolder_" + newName[0]).appendChild(file);
        // line break because yes
        if (!document.getElementById("LCEFolder_" + newName[0])) {
          var lineBreak = document.createElement("br");
          document.getElementById("lceFolder").appendChild(lineBreak);
        } else {
          var lineBreak = document.createElement("br");
          document
            .getElementById("LCEFolder_" + newName[0])
            .appendChild(lineBreak);
        }
      } else {
        file.innerText = fileNameFromSaveGame;
        document.getElementById("lceRoot").appendChild(file);
        var lineBreak = document.createElement("br");
        document.getElementById("lceRoot").appendChild(lineBreak);
      }
      document.getElementById("files").style.display = "block";
    }
  } catch (e) {
    document.getElementById("output").textContent = `${e}`;
    console.error(e);
  }
}