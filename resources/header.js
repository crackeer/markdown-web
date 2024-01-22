var header = `
<nav class="navbar nnavbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
        <a class="navbar-brand" href="/">首页</a>
        <div class="collapse navbar-collapse"  id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                    <a href="/markdown/list.html" id="markdown-a" class="nav-link">文档</a>
                </li>
                <li class="nav-item"><a href="/bookmark/list.html" id="bookmark-a">书签</a></li>
                <li class="nav-item"><a href="/code/list.html" id="code-a">代码</a></li>
            </ul>
            <ul class="nav navbar-nav navbar-right">
                <li class="dropdown">
                    <a href="javascript:;" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false" id="username">暂无<span class="caret"></span></a>
                    <ul class="dropdown-menu" style="z-index:10000">
                        <li><a href="/logout">退出</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</nav>

<nav class="navbar navbar-expand-lg bg-body-tertiary">
  <div class="container-fluid">
    <a class="navbar-brand" href="/">首页</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a href="/markdown/list.html" id="markdown-a" class="nav-link">文档</a>
        </li>
        <li class="nav-item">
            <a href="/bookmark/list.html" id="bookmark-a" class="nav-link">书签</a>
        </li>
        <li class="nav-item">
         <a href="/code/list.html" id="code-a" class="nav-link">代码</a>
        </li>
      </ul>
       <ul class="navbar-nav">
        <li class="dropdown-item">
             <a class="nav-link dropdown-toggle" href="javascript:;" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Dropdown
              </a>
                <ul class="dropdown-menu" style="z-index:10000">
                <li><a class="dropdown-item" href="/logout">Action</a></li>
                    <li><a href="/logout">退出</a></li>
                </ul>
            </li>
        </ul>
        <div class="dropdown">
          <a class="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            Dropdown button
          </a>
          <ul class="dropdown-menu" style="z-index:10000">
            <li><a class="dropdown-item" href="/logout">Action</a></li>
            <li><a class="dropdown-item" href="#">Another action</a></li>
            <li><a class="dropdown-item" href="#">Something else here</a></li>
          </ul>
        </div>
    </div>
  </div>
</nav>
`

var styleFiles = [
    "/assets/bootstrap/bootstrap.min.css",
    "/assets/css/my.css",
    "/assets/bytemd/bytemd.css",
    "/assets/bytemd/github-markdown.css",
    "/assets/bytemd/highlight.css",
]
var jsFile1 = [
    "/assets/js/jquery.js",
    "/assets/js/vue.global.js",
    "/assets/js/util.js",
    "/assets/js/axios.min.js",
    "/assets/js/dayjs.min.js",
    "/assets/bytemd/bytemd.umd.js",
]
var jsFile2 = [
    "/assets/bootstrap/bootstrap.bundle.min.js",
    "/assets/bootstrap/bootbox.js",
    "/assets/bytemd/bytemd-plugin-gfm.js",
    "/assets/bytemd/plugin-highlight.js",

]
var jsFile3 = [
    "/assets/monaco-editor/min/vs/loader.js",
]

document.addEventListener("DOMContentLoaded", async () => {
    loadStyles(styleFiles)
    await loadJs(jsFile1)
    //await sleep(400)
    if (window.hideHeader != undefined && window.hideHeader) {
    } else {
        loadNavigation()
    }

    await loadJs(jsFile2)
    //await sleep(200)
    await loadJs(jsFile3)
    await getLoginUser()
    await sleep(200)
    if (startWork != undefined) {
        startWork()
    }


}, false);

function loadNavigation() {
    $('body').prepend(header)
    let parts = window.location.pathname.split('/')
    console.log(parts[1])
    $('a[id="' + parts[1] + '-a"]').parent().addClass('active')
}


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

async function getLoginUser() {
    if (window.location.pathname.indexOf('login.html') > -1 ||  window.location.pathname.indexOf('share.html') > -1) {
        return
    }

    let result = await axios.get('/user')
    console.log(result);
    let data = result.data;
    if (data.code === 0 && data.data != null && data.data.name !=  undefined) {
        window.USER = data.data
        $('#username').html(window.USER.name + '<span class="caret"></span>')
    }
}


async function loadJs(urls) {
    //var head = document.getElementsByTagName("head")[0];
    for (var i = 0; i < urls.length; i++) {
        await loadJsUrl(urls[i])
    }
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