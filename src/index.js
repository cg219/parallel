import { vow } from 'batboy.mente';

let activePanel = 0;
let nextPanel;
let panels = [];
let isSwitching = false;
const DIRECTION = {
    UP: 'up',
    DOWN: 'down'
};

(async function main(){
    var [res, error] = await vow(fetch('https://us-central1-parallel-site.cloudfunctions.net/cms-get?type=pages'));

    if (res?.ok) {
        var { data } = await res.json();

        initSite(data)
    }
 })();

function initSite(siteData) {
    panels = [
        document.getElementById('home'),
        document.getElementById('what-we-do'),
        document.getElementById('who-we-are'),
        document.getElementById('opportunities')
    ];

    panels.forEach(function populatePanel(panel) {
        panel.querySelector('.title').innerHTML = siteData[panel.id].title;
        panel.querySelector('.body').innerHTML = siteData[panel.id].html;
    })

    window.addEventListener('keyup', onPress);
    panels[0].addEventListener('wheel', onWheel);
}

function getNextPanel(newIndex) {
    if (newIndex > panels.length - 1) return 0;
    if (newIndex < 0) return panels.length - 1;
    return newIndex;
}

function movePanels(direction) {
    var current = panels[activePanel];
    var next = panels[nextPanel];

    current.addEventListener('animationend', function onCurrentAnimationEnd(event) {
        current.classList.remove('ani-dn-out', 'ani-up-out', 'active');
        current.removeEventListener('animationend', onCurrentAnimationEnd);

        isSwitching = false;
    })

    next.addEventListener('animationend', function onNextAnimationEnd(event) {
        next.classList.remove('ani-dn-in', 'ani-up-in');
        next.classList.add('active');
        next.removeEventListener('animationend', onNextAnimationEnd);
        next.addEventListener('wheel', onWheel);

        isSwitching = false;
    })

    if (direction == DIRECTION.UP) {
        current.classList.add('ani-dn-out');
        next.classList.add('ani-dn-in');

    }

    if (direction == DIRECTION.DOWN) {
        current.classList.add('ani-up-out');
        next.classList.add('ani-up-in');
    }
}

function changePanelIndex(direction, index) {
    nextPanel = getNextPanel(index);
    movePanels(direction);
    activePanel = nextPanel;
}

function onWheel(event) {
    if (isSwitching) return;

    isSwitching = true;
    event.currentTarget.removeEventListener('wheel', onWheel);

    if (event.deltaY <= -1) return changePanelIndex(DIRECTION.UP, activePanel - 1);
    if (event.deltaY >= 1) return changePanelIndex(DIRECTION.DOWN, activePanel + 1);
}

function onPress(event) {
    if (event.key != 'ArrowDown' && event.key != 'ArrowUp') return;
    if (isSwitching == true) return;

    isSwitching = true;

    if (event.key == 'ArrowDown') return changePanelIndex(DIRECTION.DOWN, activePanel + 1);
    if (event.key == 'ArrowUp') return changePanelIndex(DIRECTION.UP, activePanel - 1);
}
