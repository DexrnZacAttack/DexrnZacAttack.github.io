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

export type CurrentTab = 1 | 2;

export let curTab: CurrentTab;
let height: number;

export function setCurTab(newValueOrSetter: CurrentTab | ((previous: CurrentTab) => CurrentTab)): CurrentTab {
    if (typeof newValueOrSetter === "number"){
        curTab = newValueOrSetter;
        return newValueOrSetter;
    }
    const previous = curTab;
    return newValueOrSetter(previous);
}

// Currently, this is used globally within event handlers inlined in `index.html`
globalThis.changeMainCard = changeMainCard;

type ChangeMainCard = typeof changeMainCard;

declare global {
    var changeMainCard: ChangeMainCard;
}

export function changeMainCard(whatToChangeTo: "Discord" | "Blog"): void {

switch (whatToChangeTo) {
    case "Discord":
        curTab = 1;
        if (document.getElementById('dcbutton')!.className !== 'tabbuttonclicked') {
            document.getElementById('dcbutton')!.className = 'tabbuttonclicked';
            document.getElementById('bbutton')!.className = 'tabbutton';
            document.getElementById('mainCard')!.style.display = 'block';
            document.getElementById('activityCard')!.style.display = 'block';
            document.getElementById('aboutCard')!.style.display = 'block';
            document.getElementById('linksCard')!.style.display = 'block';
            document.getElementById('blogCard')!.style.display = 'none';
        }
        break;
    case "Blog":
        curTab = 2;
        if (document.getElementById('bbutton')!.className !== 'tabbuttonclicked') {
            height = document.getElementById('mainCard')!.offsetHeight + 12;
            height += document.getElementById('activityCard')!.offsetHeight + 12;
            height += document.getElementById('aboutCard')!.offsetHeight + 5;
            height += document.getElementById('linksCard')!.offsetHeight;
            document.getElementById('blogCard')!.style.height = height + 'px';
            document.getElementById('bbutton')!.className = 'tabbuttonclicked';
            document.getElementById('dcbutton')!.className = 'tabbutton';
            document.getElementById('mainCard')!.style.display = 'none';
            document.getElementById('activityCard')!.style.display = 'none';
            document.getElementById('aboutCard')!.style.display = 'none';
            document.getElementById('linksCard')!.style.display = 'none';
            document.getElementById('blogCard')!.style.display = 'block';
        }
        break;
    default:
        break;
}}