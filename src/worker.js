self.addEventListener('install', install);
self.addEventListener('activate', activate);
self.addEventListener('fetch', fetch);

function install(event) {
    console.log('installed');
}

function activate(event) {
    console.log('activate');
}

function fetch(event) {
    console.log('fetch');
}
