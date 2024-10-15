interface Subtitle {
    text: string;
    start: number;
    duration: number;
}

const captionURL = 'http://localhost:8000/yt';
let videoDiv: HTMLVideoElement = document.querySelector('video');
let captionStyle: string | undefined = undefined;
let captionInd: Record<number, number> = {1: -1, 2: -1};

function loadSubtitles(videoId: string, lang1: string, lang2?: string) {
    const fetchTasks = [fetchSubtitles(videoId, lang1), fetchSubtitles(videoId, lang2)];
    Promise.all(fetchTasks).then(([lang1Subtitle, lang2Subtitle]) => {
        videoDiv.removeEventListener('timeupdate', () => syncSubtitles(videoDiv, lang1Subtitle, lang2Subtitle));
        videoDiv.addEventListener('timeupdate', () => syncSubtitles(videoDiv, lang1Subtitle, lang2Subtitle));
    })
}

async function fetchSubtitles(videoId: string, lang: string): Promise<Subtitle[]> {
    if (lang === '') return [];
    const apiUrl = `${captionURL}/${videoId}?lang=${lang}`;
    const response = await fetch(apiUrl);
    return await response.json();
}

function getCaptionWindow(): Element | undefined {
    const subtitleWindows = document.getElementsByClassName('caption-window') as HTMLCollectionOf<HTMLDivElement>;
    if (subtitleWindows.length > 0)
        return subtitleWindows[0];
}

function getCaptionStyle(): undefined {
    const captions = document.getElementsByClassName("ytp-caption-segment") as HTMLCollectionOf<HTMLSpanElement>;
    if (captions.length > 0) {
        captionStyle = captions[0].style.cssText;
    }
}

function insertSubtitle(captionWindow: Element, subtitle: string) {
    const subtitleDiv = document.createElement('span');

    subtitleDiv.style.cssText = captionStyle;
    subtitleDiv.style.marginBottom = '5px';
    subtitleDiv.textContent = subtitle;

    captionWindow.insertBefore(subtitleDiv, captionWindow.firstChild);
}

function syncSubtitles(video: HTMLVideoElement, sub1: Subtitle[], sub2: Subtitle[]) {
    const captionWindow = getCaptionWindow();
    if (captionStyle === undefined) getCaptionStyle();
    let currentTime = video.currentTime;
    const sub1Text = getSubtitleForTime(sub1, currentTime, 1);
    const sub2Text = getSubtitleForTime(sub2, currentTime, 2);
    if (sub1Text !== '') insertSubtitle(captionWindow, sub1Text);
    if (sub2Text !== '') insertSubtitle(captionWindow, sub2Text);
}

function getSubtitleForTime(subtitles: Subtitle[], time: number, id: number): string {
    for (let i = 0; i < subtitles.length; i++) {
        if (time >= subtitles[i].start && time <= subtitles[i].start + subtitles[i].duration) {
            // ignore if subtitle already loaded to DOM before
            if (i == captionInd[id]) return '';  // empty subtitle won't be loaded in DOM
            captionInd[id] = i;
            return subtitles[i].text;
        }
    }
    return '';
}


export default function youtubeEntryPoint(lang1: string, lang2: string) {
    let videoId = new URLSearchParams(window.location.search).get('v');
    if (videoId) {
        loadSubtitles(videoId, lang1, lang2);
    }
}
