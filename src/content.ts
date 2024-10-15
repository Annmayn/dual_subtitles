import youtubeEntryPoint from "./site/yt";

export const domainFuncMap: Record<string, (lang1: string, lang2?: string) => void> = {
    youtube: youtubeEntryPoint,
}

let lang1 = '';
let lang2 = '';


export function run(lang1: string, lang2: string) {
    const domain = window.location.hostname.split('.')[1];
    domainFuncMap[domain](lang1, lang2);
}

run(lang1, lang2);

browser.runtime.onMessage.addListener((request: { lang1: string, lang2: string }) => {
    run(request.lang1, request.lang2);
})
