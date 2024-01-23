
window.registerCssLibrary({
    "bootstrap": "/assets/bootstrap/bootstrap.min.css",
    "my": "/assets/css/my.css",
    "bytemd": "/assets/bytemd/bytemd.css",
    "github-markdown": "/assets/bytemd/github-markdown.css",
    "bytemd-highlight": "/assets/bytemd/highlight.css",
})

//window.addJsFile("jquery", "/assets/js/jquery.js", 1)
window.registerJSLibrary({
    "vue": "/assets/js/vue.global.js",
    "jquery": "/assets/js/jquery.js",
    "util": "/assets/js/util.js",
    "axios": "/assets/js/axios.min.js",
    "dayjs": "/assets/js/dayjs.min.js",
    "bytemd": "/assets/bytemd/bytemd.umd.js",
    "bootstrap5": "/assets/bootstrap/bootstrap.bundle.min.js",
    "bootbox": "/assets/bootstrap/bootbox.js",
    "bytemd-plugin-gfm": "/assets/bytemd/bytemd-plugin-gfm.js",
    "bytemd-plugin-highlight": "/assets/bytemd/plugin-highlight.js",
    "monaco-editor": "/assets/monaco-editor/min/vs/loader.js",
})

window.quickStart(['bootstrap', 'my', 'bytemd', 'github-markdown', 'bytemd-highlight'], {
    'vue' : 1,
    'jquery' : 2,
    'bootstrap5' : 3,
    'bootbox' : 3,
    'axios' : 4,
    "dayjs" : 5,
    'util': 6,
    "bytemd" : 7,
    "bytemd-plugin-gfm": 8,
    "bytemd-plugin-highlight" : 9,
    "monaco-editor" : 10
}, async () => {
    await loadNavigation()
    await getLoginUser()
})


async function loadNavigation() {
    let result = await fetch("/framework.html")
    let header = await result.text()
    if(window.hideHeader != undefined ) {
        header = '<div id="app"></div>'
    }
    $('body').prepend(header)
    let parts = window.location.pathname.split('/')
    $('a[id="' + parts[1] + '-a"]').parent().addClass('active')
}


async function getLoginUser() {
    if (window.location.pathname.indexOf('login.html') > -1 || window.location.pathname.indexOf('share.html') > -1) {
        return
    }

    let result = await axios.get('/user')
    let data = result.data;
    if (data.code === 0 && data.data != null && data.data.name != undefined) {
        window.USER = data.data
        $('#username').html(window.USER.name + '<span class="caret"></span>')
    }
}


