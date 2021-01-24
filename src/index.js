import { vow } from 'batboy.mente';
// import Hammer from './vendor/hammer';

var activePanel = 0;
let nextPanel;
let panels = [];
let isSwitching = false;
let eventTimestamp = Date.now();
const DIRECTION = {
    UP: 'up',
    DOWN: 'down'
};

(async function main(){
    buildLoader();
    var [res, error] = await vow(fetch('https://us-central1-parallel-site.cloudfunctions.net/cms-get?type=all'));

    if (res?.ok) {
        var { data } = await res.json();

        disableTrackPadEvents();

        initSite({ siteData: data.pages, settings: data.settings, teamData: data.team })
    }
 })();

function initSite({siteData, settings, teamData}) {
    var parallel = document.querySelector('#parallel');
    var template = document.querySelector('#panel-item');

    panels = [
        { name: 'home', color: 'purple' },
        { name: 'what-we-do', color: 'orange' },
        { name: 'who-we-are', color: 'pink' },
        { name: 'opportunities', color: 'purple' }
    ];

    panels.forEach(function createPanel({name, color}, index) {
        const panel = document.importNode(template.content, true).firstElementChild;

        if (index == 0) {
            panel.classList.add('active');
            panel.addEventListener('wheel', onWheel);

            {
                let template = document.querySelector('#wordmark-item');
                let wordmark = document.importNode(template.content, true);
                panel.querySelector('.content').prepend(wordmark);
            }
        }

        panel.classList.add(color);
        panel.querySelector('.up').addEventListener('click', onUpArrowClick);
        panel.querySelector('.down').addEventListener('click', onDownArrowClick);
        panel.setAttribute('id', name);
        panel.querySelector('.title').textContent = siteData[name].title;
        panel.querySelector('.body').innerHTML = siteData[name].html;
        parallel.append(panel);
    })

    createTopNav(settings.navigation);
    createSideNav(settings.navigation);
    createHamburgerNav(settings.navigation);
    createTeam(teamData, '#who-we-are');

    window.addEventListener('keyup', onPress);

    removeLoader();
}

function buildLoader() {
    var loading = document.querySelector('#loading');
    var template = document.querySelector('#wordmark-item');
    var wordmark = document.importNode(template.content, true);

    loading.append(wordmark);
}

function removeLoader() {
    var loading = document.querySelector('#loading');
    var pane = loading.querySelector('.pane');

    function onLoadingExit(event) {
        loading.removeEventListener('animationend', onLoadingExit);


        setTimeout( () => document.querySelector('#parallel').removeChild(loading), 250);
    }

    pane.style.animationIterationCount = 1;
    pane.addEventListener('animationend', function onExitAnimationEnd(event) {
        loading.classList.add('exit');
        pane.removeEventListener('animationend', onExitAnimationEnd);
        loading.addEventListener('animationend', onLoadingExit);
    })
}

function createTeam(teamData, panelId) {
    var memberTemplate = document.querySelector('#team-item');
    var teamTemplate = document.querySelector('#team-container-item');
    var panel = document.querySelector(panelId);
    var team = document.importNode(teamTemplate.content, true);
    var arrows = panel.querySelector('.arrows');
    var title = panel.querySelector('.title');
    var body = panel.querySelector('.body');

    teamData.forEach(function createMember({slug, name, title, html}) {
        var member = document.importNode(memberTemplate.content, true);

        member.querySelector('.member-name').textContent = name;
        member.querySelector('.member-title').textContent = title;
        member.querySelector('section').innerHTML = html;
        member.querySelector('header').addEventListener('click', onTeamClick);
        member.firstElementChild.id = slug;
        team.firstElementChild.append(member);
    });

    // panel.querySelector('.content').replaceChildren(title, body, team, arrows);
    panel.querySelector('.content').append(team);

}

function createTopNav(navData) {
    var nav = document.querySelector('#top-nav ul');
    var template = document.querySelector('#nav-item');

    navData.forEach(function createTopNavItem({label, url}, index) {
        const item = document.importNode(template.content, true);
        const aTag = item.querySelector('a');

        aTag.textContent = label;
        aTag.setAttribute('href', url.replaceAll('/', ''));
        aTag.setAttribute('data-page-index', index);
        aTag.addEventListener('click', onNavClick);
        nav.append(item);
    });
}

function createSideNav(navData) {
    var nav = document.querySelector('#side-nav ul');
    var template = document.querySelector('#nav-item');

    navData.forEach(function createSideNavItem({label, url}, index) {
        const item = document.importNode(template.content, true);
        const aTag = item.querySelector('a');

        aTag.setAttribute('href', url.replaceAll('/', ''));
        aTag.setAttribute('data-page-index', index);
        aTag.addEventListener('click', onNavClick);
        nav.append(item);
    });

    {
        let template = document.querySelector('#wordmark-item');
        let nav = document.querySelector('#side-nav');
        let wordmark = document.importNode(template.content, true);

        wordmark.firstElementChild.setAttribute('data-page-index', 0);
        wordmark.firstElementChild.addEventListener('click', onNavClick);
        nav.append(wordmark);
    }
}

function createHamburgerNav(navData) {
    var nav = document.querySelector('#hamburger-nav ul');
    var navButton = document.querySelector('#hamburger-nav-button');
    var template = document.querySelector('#nav-item');

    navButton.addEventListener('click', onHamburgerClick);

    navData.forEach(function createSideNavItem({label, url}, index) {
        const item = document.importNode(template.content, true);
        const aTag = item.querySelector('a');

        aTag.setAttribute('href', url.replaceAll('/', ''));
        aTag.setAttribute('data-page-index', index);
        aTag.addEventListener('click', onNavClick);

        if (url != '/') {
            aTag.textContent = label;
        } else {
            let template = document.querySelector('#wordmark-item');

            aTag.append(document.importNode(template.content, true));
        }

        nav.append(item);
    });
}

function getNextPanel(newIndex) {
    if (newIndex > panels.length - 1) return 0;
    if (newIndex < 0) return panels.length - 1;
    return newIndex;
}

function movePanels(direction) {
    var current = document.querySelector(`#${panels[activePanel].name}`);
    var next = document.querySelector(`#${panels[nextPanel].name}`);

    document.querySelector('#parallel').setAttribute('data-active-panel', nextPanel);
    next.scroll(0, 0);

    current.addEventListener('animationend', function onCurrentAnimationEnd(event) {
        current.classList.remove('ani-dn-out', 'ani-up-out', 'active');
        current.removeEventListener('animationend', onCurrentAnimationEnd);

        setSwitchingFalse()
    })

    next.addEventListener('animationend', function onNextAnimationEnd(event) {
        next.classList.remove('ani-dn-in', 'ani-up-in');
        next.classList.add('active');
        next.removeEventListener('animationend', onNextAnimationEnd);
        next.addEventListener('wheel', onWheel);

        setSwitchingFalse()
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
    if (nextPanel == activePanel) return setSwitchingFalse();
    movePanels(direction);
    activePanel = nextPanel;
}

function onNavClick(event) {
    event.preventDefault();
    if (isSwitching == true) return;
    isSwitching = true;

    document.querySelector('#hamburger-nav').classList.remove('open');
    document.querySelector('#hamburger-nav-button').classList.remove('open');
    var pageIndex = Number(event.currentTarget.getAttribute('data-page-index'));
    changePanelIndex(DIRECTION.DOWN, pageIndex);
}

function onHamburgerClick(event) {
    event.preventDefault();
    event.stopPropagation();

    document.querySelector('#hamburger-nav').classList.toggle('open');
    document.querySelector('#hamburger-nav-button').classList.toggle('open');
}

function onTeamClick(event) {
    var current = event.currentTarget.closest('.team-member');
    var members = document.querySelector('.team').querySelectorAll('.team-member');

    members.forEach(function removeClass(member) {
        if (member.id != current.id) {
            member.classList.remove('open');
        }
    });

    current.classList.toggle('open');
}

function onWheel(event) {
    if (isSwitching) return;
    if (!wheelThrottlePass(60)) return;

    if (event.deltaY <= -1) {
        isSwitching = true;
        event.currentTarget.removeEventListener('wheel', onWheel);
        return changePanelIndex(DIRECTION.UP, activePanel - 1);
    }
    if (event.deltaY >= 1) {
        isSwitching = true;
        event.currentTarget.removeEventListener('wheel', onWheel);
        return changePanelIndex(DIRECTION.DOWN, activePanel + 1);
    }
}

function onPress(event) {
    if (event.key != 'ArrowDown' && event.key != 'ArrowUp') return;
    if (isSwitching == true) return;

    isSwitching = true;

    if (event.key == 'ArrowDown') return changePanelIndex(DIRECTION.DOWN, activePanel + 1);
    if (event.key == 'ArrowUp') return changePanelIndex(DIRECTION.UP, activePanel - 1);
}

function onUpArrowClick(event) {
    if (isSwitching == true) return;

    isSwitching = true;

    return changePanelIndex(DIRECTION.UP, activePanel - 1);
}

function onDownArrowClick(event) {
    if (isSwitching == true) return;

    isSwitching = true;

    return changePanelIndex(DIRECTION.DOWN, activePanel + 1);
}

function wheelThrottlePass(throttle = 500) {
    let elapsed = Date.now() - eventTimestamp;
    let passed = elapsed >= throttle;
    eventTimestamp = Date.now();

    return passed;
}

function setSwitchingFalse(amount = 1000) {
    isSwitching = false;
    eventTimestamp = Date.now();
}

function disableTrackPadEvents() {
    window.addEventListener('wheel', event => {
        event.preventDefault();
        return false;
    }, {passive: false, capture: false})
}
