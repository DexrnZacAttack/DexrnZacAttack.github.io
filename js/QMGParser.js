// Dexrn -----
// It is currently 10/20/2023 4:25 AM (PST) at the time of writing this.
// Saw that vlOd made a header parser in C# and decided to make one in JS so that people who don't run Windows can run this straight in their browser.
// This script is JANK.



document.getElementById('fileInput').addEventListener('change', onfileselected);

function onfileselected(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const data = new Uint8Array(event.target.result);
            readfile(data, file.name); 
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
            const data = new Uint8Array(event.target.result);
            readfile(data, file.name);
            const fileInput = document.getElementById('fileInput');
            fileInput.dispatchEvent(new Event('change'));
        };
        reader.readAsArrayBuffer(file);
    }
});


function readfile(data, filename) {
    console.log(`File: ${filename}`)
    console.log(`Parsing started...`)
    // if the file doesn't have at least 12 bytes, it can't even fit the header lmao
    if (data.length < 12) {
        console.log(`The parser encountered an error: Invalid file: File is too small, Must be atleast 12 bytes in length. File size was ${data.length}`);
        document.getElementById('output').textContent = `Invalid file: File is too small, Must be atleast 12 bytes in length.\n` +
        `File size was ${data.length}`;
        throw new Error("Invalid file: File is too small")
    }

    // Check if the first 2 bytes are QM or QG or one of the unknown ones
    console.log(`Checking magic...`)
    const magic = String.fromCharCode(data[0], data[1]);
    const magicraw = data[0].toString(16).padStart(2, '0') + ' ' + data[1].toString(16).padStart(2, '0');
    if (magic !== 'QM' && magic !== 'QG' && magic !== 'IM' && magic !== 'QC' && magicraw !== '14 00' && magic !== 'QW') {
        console.log(`The parser encountered an error: Invalid file: Invalid magic. Expected one of: QM, QG, IM, QC, '14 00', got "${magic}" (${magicraw}) instead.`);
        document.getElementById('output').textContent = `Invalid file: Invalid magic.\n` +
        `Expected one of: QM, QG, IM, QC, QW, '14 00', got "${magic}" (${magicraw}) instead.`;
        throw new Error("Invalid file: Invalid magic")
    }
    console.log(`Magic is ${magic}`)
    console.log(`Magic (raw) is ${magicraw}`)

    // THE JANKNESS STARTS HERE!
    // parse
    let majorversion, minorversion, revision;
    let offset = 0;
    let zlibstreamcount = 0;
    let zliboffset = 0; 
    if (magic != "QM") {
        console.log(`Looking for ZLib streams`);
        for (let i = 0; i < data.length - 1; i++) {
            if (data[i] === 0x78 && data[i + 1] === 0xDA) {
                zlibstreamcount++;
                console.log(`ZLib stream found at offset ${zliboffset}`);
            }
            zliboffset++;
        }
        console.log(`ZLib Stream Count: ${zlibstreamcount}`);
    }
    

    console.log(`Setting variables...`)
    if (magic === 'QG' || magic === 'IM' || magic === 'QC' || magicraw === '14 00' || magic === 'QW') {
        flags = data[5].toString(16).padStart(2, '0');
        console.log(`flags: ${flags}`)
        qual = data[6];
        console.log(`qual: ${qual}`)
        majorversion = data[2];
        console.log(`majorversion: ${majorversion}`)
        minorversion = data[3];
        console.log(`minorversion: ${minorversion}`)
        revision = data[4];
        console.log(`revision: ${revision}`)
    } else if (magic === 'QM') {
        // this is jank
        flag1 = data[4].toString(16).padStart(2, '0');
        console.log(`flag1: ${flag1}`)
        flag1noraw = data[4];
        flag2 = data[5].toString(16).padStart(2, '0');
        console.log(`flag2: ${flag2}`)
        majorversion = data[2];
        console.log(`majorversion: ${majorversion}`)
        offset = -1; // Offset because I originally had this and don't want to redo this yet.
        console.log(`offset (for the parser): ${offset}`)
    }   

    if (magic != "QG") {
        animated = (flag1noraw >> 7) != 0;
        console.log(`animated: ${animated}`)
    } else {
        animated = 0;  
    }

    const type = data[3];
    const format = magic;
    const width = (data[7 + offset] | (data[8 + offset] << 8));
    const height = (data[9 + offset] | (data[10 + offset] << 8));
    const framecount = (data[16] | (data[17] << 8));
    const currentFramecount = (data[18] | (data[19] << 8));
    const delayTime = (data[20] | (data[21] << 8));
    const noRepeat = data[22];
    const padding = (data[10]);
    const encmode = data[5].toString(16).padStart(2, '0');



    // console.log((flag1noraw >> 7));
    // console.log((flag1noraw & 128) != 0);
    // console.log((flag1noraw >> 7) != 0);
    // console.log(`animated == ${animated}`);
    // console.log(`currentFramecount == ${currentFramecount}`);
    // console.log(`majorversion == ${majorversion}`);
    // console.log(`flag1noraw == ${flag1noraw}`);
    // console.log(`flag1test == ${flag1test}`);
    // console.log(`flag1 == ${flag1}`);


    // Dexrn: this might not work...
    console.log(`Checking version... (to see if we have to offset alphapos)`)
    if (majorversion > 11 && animated != 0 && currentFramecount <= 2) {
        console.log(`offset alphapos`)
        alphapos = (data[12] | (data[13] << 8)) << 2;
        console.log(`alphapos: ${alphapos}`)
        // alphaposver12 = true;
    } else {
        console.log(`don't offset alphapos`)
        alphapos = (data[12] | (data[13] << 8));
        console.log(`alphapos: ${alphapos}`)
        // alphaposver12 = false;
    }

    // console.log(`alphaposver12 == ${alphaposver12}`);


    // Dexrn: pixel format detection
    console.log(`Detecting image pixel format...`)
    switch (type) {
        case 0:
            console.log(`case 0`)
            pixelformat = "RGB565";
            transparency = "false";
            bpp = "0x10";
            raw_type = "QM_RAW_RGB565";
            break;
        case 1:
            console.log(`case 1`)
            pixelformat = "RGB888";
            transparency = "false";
            bpp = "0x18";
            raw_type = "QM_RAW_RGB888";
            break;
        case 2:
            console.log(`case 2`)
            pixelformat = "BGR888";
            transparency = "false";
            bpp = "0x18";
            raw_type = "QM_RAW_BGR888";
            break;
        case 3:
            console.log(`case 3`)
            pixelformat = "RGBA5658";
            transparency = "true";
            bpp = "0x18";
            raw_type = "QM_RAW_RGBA5658";
            break;
        case 4:
            console.log(`case 4`)
            pixelformat = "ARGB8565";
            transparency = "true";
            bpp = "0x18";
            raw_type = "QM_RAW_ARGB8565";
            break;
        case 5:
            console.log(`case 5`)
            pixelformat = "ARGB8888";
            transparency = "true";
            bpp = "0x20";
            raw_type = "QM_RAW_ARGB8888";
            break;
        case 6:
            console.log(`case 6`)
            pixelformat = "RGBA8888";
            transparency = "true";
            bpp = "0x20";
            raw_type = "QM_RAW_RGBA8888";
            break;
        case 7:
            console.log(`case 7`)
            pixelformat = "BGRA8888";
            transparency = "true";
            bpp = "0x20";
            raw_type = "QM_RAW_BGRA8888";
            break;
        default:
            console.log(`unknown`)
            pixelformat = "Unknown";
            transparency = "Unknown";
            bpp = "Unknown";
            raw_type = "Unknown";
    }
    
    // show data, if it is QG, do not show frame count cuz it ain't animation
    const version = `${majorversion}.${minorversion}.${revision}`;
    if (magic === 'QG') {
        document.getElementById('output').textContent =
            `Format: ${format}\n` +
            `Version: ${version}\n` +
            `Flags (raw): ${flags}\n` +
            `Quality: ${qual}\n` +
            `Width: ${width}\n` +
            `Height: ${height}\n` +
            `ZLib stream count: ${zlibstreamcount}`
    } else if (magic === 'QM') {
        document.getElementById('output').textContent =
            `Format: ${format} (appears to be an animation)\n` +
            `Version: ${majorversion}\n` +
            `Pixel Format: ${pixelformat}\n` +
            `Transparent: ${transparency}\n` +
            `Bits Per Pixel (BPP): ${bpp}\n` +
            `Raw Type: ${raw_type}\n` +
            `Flag 1 (raw): ${flag1}\n` +
            `Flag 2 (raw): ${flag2}\n` +
            `Width: ${width}\n` +
            `Height: ${height}\n` +
            `Padding: ${padding}\n` +
            `Alpha Position(?): ${alphapos}\n` +
            `Encoder Mode (raw): ${encmode}\n` +
            `Frame Count: ${framecount}\n` +
            `Current Frame Count: ${currentFramecount}\n` +
            `Delay Time: ${delayTime}\n` +
            `noRepeat: ${noRepeat}\n`;
    } else if (magic === 'QM' && animated != 1) {
        document.getElementById('output').textContent =
            `Format: ${format} (appears to be a static image)\n` +
            `Version: ${majorversion}\n` +
            `Pixel Format: ${pixelformat}\n` +
            `Transparent: ${transparency}\n` +
            `Bits Per Pixel (BPP): ${bpp}\n` +
            `Raw Type: ${raw_type}\n` +
            `Flag 1 (raw): ${flag1}\n` +
            `Flag 2 (raw): ${flag2}\n` +
            `Width: ${width}\n` +
            `Height: ${height}\n` +
            `Padding: ${padding}\n` +
            `Alpha Position(?): ${alphapos}\n` +
            `Encoder Mode (raw): ${encmode}\n` +
            `ZLib stream count: ${zlibstreamcount}`;
    } else if (magic === 'IM' || magic === 'QC' || magic === 'QW') {
        document.getElementById('output').textContent =
            `You have an unknown version of the QMG format, please contact dexrn on Discord, as we currently don't have this version yet.\n` +
            `This also means we know nothing about it, Since this file will be treated as a QMG, most if not all information shown WILL be inaccurate.\n` +
            `Format: ${format} (Unknown)\n` +
            `Version: ${version}\n` +
            `Type: ${type}\n` +
            `Pixel Format: ${pixelformat}\n` +
            `Transparent: ${transparency}\n` +
            `Bits Per Pixel (BPP): ${bpp}\n` +
            `Raw Type: ${raw_type}\n` +
            `Flags (raw): ${flags}\n` +
            `Quality: ${qual}\n` +
            `Width: ${width}\n` +
            `Height: ${height}\n` +
            `Alpha Position(?): ${alphapos}\n` +
            `Encoder Mode (raw): ${encmode}\n` +
            `Frame Count: ${framecount}\n` +
            `Current Frame Count: ${currentFramecount}\n` +
            `Delay Time: ${delayTime}\n` +
            `noRepeat: ${noRepeat}\n`;
    } else if (magicraw === '14 00') {
    document.getElementById('output').textContent =
        `This is an SPI file, Not too much is known about this format.\n` +
        `Since this file will be treated as a QMG, most if not all information shown WILL be inaccurate.\n` +
        `Format: SPI\n` +
        `Version: ${version}\n` +
        `Type: ${type}\n` +
        `Pixel Format: ${pixelformat}\n` +
        `Transparent: ${transparency}\n` +
        `Bits Per Pixel (BPP): ${bpp}\n` +
        `Raw Type: ${raw_type}\n` +
        `Flags (raw): ${flags}\n` +
        `Quality: ${qual}\n` +
        `Width: ${width}\n` +
        `Height: ${height}\n` +
        `Alpha Position(?): ${alphapos}\n` +
        `Encoder Mode (raw): ${encmode}\n` +
        `Frame Count: ${framecount}\n`;
        `Current Frame Count: ${currentFramecount}\n` +
        `Delay Time: ${delayTime}\n` +
        `noRepeat: ${noRepeat}\n`;
}


}
