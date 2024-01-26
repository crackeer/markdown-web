
window.VueObject = null
window.VueMount = "#app"

const JS_FILES = [
    '/assets/js/vue.global.js',
    '/assets/js/jquery.js',
    '/assets/bootstrap/bootstrap.bundle.min.js',
    '/assets/bootstrap/bootbox.js',
    '/assets/js/axios.min.js',
    '/assets/js/dayjs.min.js',
    '/assets/js/util.js',
    '/assets/bytemd/bytemd.umd.js',
    '/assets/bytemd/bytemd-plugin-gfm.js',
    '/assets/bytemd/plugin-highlight.js',
    '/assets/monaco-editor/min/vs/loader.js',
]

const HIDE_NAVIGATION_PAGES = [
    '/share.html',
    '/login.html',
]

function loadJsUrl(url) {
    return new Promise((resolve) => {
        let domScript = document.createElement("script");
        domScript.src = url;
        domScript.onload = domScript.onreadystatechange = function () {
            if (!this.readyState || 'loaded' === this.readyState || 'complete' === this.readyState) {
                resolve()
            }
        }
        document.getElementsByTagName('head')[0].appendChild(domScript);
    });
}

async function initialize() {
    // load css
    let result = await fetch("/template/head.html")
    let header = await result.text()
    document.getElementsByTagName('head')[0].insertAdjacentHTML('afterEnd', header)

    if (hideNavigation()) {
        document.getElementsByTagName('body')[0].insertAdjacentHTML('afterBegin', '<div id="app"></div>')
    } else {
        // load nav
        let result = await fetch("/template/nav.html")
        let navigation = await result.text()
        document.getElementsByTagName('body')[0].insertAdjacentHTML('afterBegin', navigation + '<div id="app"></div>')
        getLoginUser()
    }

    // load js
    for (var i = 0; i < JS_FILES.length; i++) {
        await loadJsUrl(JS_FILES[i])
        await sleep(1)
    }

    setTimeout(() => {
        if (window.VueObject != null) {
            window.Vm = mountVueObject(window.VueObject, window.VueMount)
        }
    }, 100)
}

initialize()

function hideNavigation() {
    for (var i in HIDE_NAVIGATION_PAGES) {
        if (window.location.pathname == HIDE_NAVIGATION_PAGES[i]) {
            return true
        }
    }
    return false
}

async function getLoginUser() {
    let result = await fetch('/user')

    let data = await result.json();
    if (data.code === 0 && data.data != null && data.data.name != undefined) {
        window.USER = data.data
        document.getElementById('username').innerHTML = window.USER.name + '<span class="caret"></span>'
    }
}

function mountVueObject(object, element) {
    if (Vue === undefined) {
        console.log('mountVueObject, Vue not defined');
        return
    }
    var vm = Vue.createApp(object)
    vm.mount(element)
    return vm
}

function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}
