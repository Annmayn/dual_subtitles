document.getElementById("setLanguages")?.addEventListener('click', () => {
    const lang1 = (document.getElementById('lang1') as HTMLInputElement).value;
    const lang2 = (document.getElementById('lang2') as HTMLInputElement).value;
    browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
        if (tabs[0].id !== undefined) browser.tabs.sendMessage(tabs[0].id, {lang1: lang1, lang2: lang2});
    })
})