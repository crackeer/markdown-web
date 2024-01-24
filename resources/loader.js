window.JsLibrary = {
    'jquery': 'https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js',
    'bootstrap5': 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.min.js',
    'vue' : 'https://cdn.jsdelivr.net/npm/vue@3.4.15/dist/vue.global.min.js',
    'bootbox': 'https://cdn.jsdelivr.net/npm/bootbox@6.0.0/dist/bootbox.min.js',
    'axios': 'https://cdn.jsdelivr.net/npm/axios@1.6.5/dist/axios.min.js',
    'dayjs' : 'https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js'
}
window.CssLibrary = {
    'bootstrap5' : 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css'
}
window.activeCss = {};
window.activeJs = {};

window.AfterLoad = null
window.VueObject = null
window.VueMount = '#app'
window.Vm = null

window.registerJSLibrary = function (name, file) {
    if (typeof name === 'object') {
        Object.keys(name).forEach(k => {
            window.JsLibrary[k] = name[k]
        })
    }
    if (typeof name === 'string') {
        window.JsLibrary[name] = file
    }
}
window.registerCssLibrary = function (name, file) {
    if (typeof name === 'object') {
        Object.keys(name).forEach(k => {
            window.CssLibrary[k] = name[k]
        })
    }
    if (typeof name === 'string') {
        window.CssLibrary[name] = file
    }
}

window.quickStart = async function (cssNames, jsNames, callback) {
    for (var i in cssNames) {
        window.activeCss[cssNames[i]] = true
    }
    Object.keys(jsNames).forEach(k => {
        window.activeJs[k] = jsNames[k]
    })

    window.AfterLoad = callback
}


document.addEventListener("DOMContentLoaded", async () => {
    let cssNames = Object.keys(window.activeCss)
    var head = document.getElementsByTagName("head")[0];
    for (var i = 0; i < cssNames.length; i++) {
        if (window.CssLibrary[cssNames[i]] !== undefined) {
            head.appendChild(createStyleNode(window.CssLibrary[cssNames[i]]));
        }

    }
    let jsFiles = []
    let names = Object.keys(window.activeJs)
    for (var i = 0; i < names.length; i++) {
        if (window.JsLibrary[names[i]] == undefined) {
            throw "js file `" + k + "` not register"
        }
        jsFiles.push({
            file: window.JsLibrary[names[i]],
            order: window.activeJs[names[i]]
        })
    }

    for (var i = 0; i < jsFiles.length; i++) {
        await loadJsUrl(jsFiles[i].file)
        await sleep(50)
    }
    await sleep(50)
    if (window.AfterLoad != null) {
        await window.AfterLoad()
    }

}, false);


function createStyleNode(url) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    return link
}


function loadJsUrl(url) {
    return new Promise((resolve) => {
        let domScript = createJsNode(url)
        domScript.onload = domScript.onreadystatechange = function () {
            if (!this.readyState || 'loaded' === this.readyState || 'complete' === this.readyState) {
                resolve()
            }
        }
        document.getElementsByTagName('head')[0].appendChild(domScript);
    });
}

function createJsNode(url) {
    var scriptNode = document.createElement("script");
    scriptNode.src = url;
    return scriptNode
}

function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

function mountVueObject(object, element) {
    if (Vue === undefined) {
        console.log('mountVueObject, Vue not defined');
        return
    }

    var vm = Vue.createApp(object)
    vm.mount(element)
    console.log(vm)
    return vm
}