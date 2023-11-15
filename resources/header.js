var header = `
<nav class="navbar navbar-default">
    <div class="container-fluid">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse"
                data-target="#navbar-collapse-1" aria-expanded="false">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="/">
                <img src="/assets/images/logo.svg" alt="" />
            </a>
        </div>
        <div class="collapse navbar-collapse" id="navbar-collapse-1">
            <ul class="nav navbar-nav">
                <li><a href="/markdown/list.html">文档</a></li>
                <li><a href="/bookmark/list.html">书签</a></li>
                <li><a href="/code/list.html">代码</a></li>
            </ul>
        </div>
    </div>
</nav>
`

var styleFiles = [
    "/assets/css/bootstrap3.4.min.css",
    "/assets/css/my.css",
    "/assets/bytemd/bytemd.css",
    "/assets/bytemd/github-markdown.css",
    "/assets/bytemd/highlight.css",
]
var vipJsFiles = [
    "/assets/js/jquery.js",
    "/assets/js/vue.global.js",
    "/assets/js/util.js",
    "/assets/js/axios.min.js",
    "/assets/js/dayjs.min.js",
    "/assets/bytemd/bytemd.umd.js",
]
var jsFiles = [
    "/assets/js/bootstrap.min.js",
    "/assets/js/bootbox.min.js",
    "/assets/bytemd/bytemd-plugin-gfm.js",
    "/assets/bytemd/plugin-highlight.js",
]

document.addEventListener("DOMContentLoaded", async () => {
    loadStyles(styleFiles)
    await loadJs(vipJsFiles)
    await sleep(200)
    await loadJs(jsFiles)
    await sleep(300)
    startWork()
    $('body').prepend(header)
    $('a[href="' + window.location.pathname + '"]').parent().addClass('active')
}, false);
/*
$(document).ready(function () {
    $('body').prepend(header)
    $('a[href="' + window.location.pathname + '"]').parent().addClass('active')
    loadStyles(styleFiles)
    loadJs(jsFiles)
})*/

async function loadStyles(urls) {
    var head = document.getElementsByTagName("head")[0];
    for (var i = 0; i < urls.length; i++) {
        head.appendChild(createStyleNode(urls[i]));
    }
}

function createStyleNode(url) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    return link
}

async function loadJs(urls) {
    var head = document.getElementsByTagName("head")[0];
    for (var i = 0; i < urls.length; i++) {
        head.appendChild(createJsNode(urls[i]));
    }
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