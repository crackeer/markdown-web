function getQuery(key, value) {
    let url = new URLSearchParams(window.location.search)
    return url.get(key) || value
}

function pushStateWith(query) {
    let newURL = window.location.pathname + "?" + httpBuildQuery(query)
    window.history.pushState(null, "", newURL)
}

function nanoid(t) {
    return crypto.getRandomValues(new Uint8Array(t)).reduce(((t, e) => t += (e &= 63) < 36 ? e.toString(36) : e < 62 ? (e - 26).toString(36).toUpperCase() : e > 62 ? "-" : "_"), "")
}

function windowReload() {
    window.location.reload()
}

function reloadWith(query) {
    window.location.href = window.location.pathname + '?' + httpBuildQuery(query)
}

function jump(path, query) {
    window.location.href = path + '?' + httpBuildQuery(query)
}

function httpBuildQuery(query) {
    let params = new URLSearchParams("")
    Object.keys(query).forEach(k => {
        params.append(k, query[k])
    })
    return params.toString()
}

function cloneObject(data) {
    let raws = JSON.stringify(data)
    return JSON.parse(raws)
}

async function uploadFile(files) {
    let retData = []
    for (var i in files) {
        let formData = new FormData();
        formData.append('file', files[i])
        let config = getImageUploadConfig(files[i])
        let dest = config.dir + "/" + config.name
        let data = await axios.put(dest, formData, {
            headers: {
                'proxy': 'upload2dir'
            }
        });
        if (data.status != 200) {
            return new Promise((_, reject) => {
                resolve(data.statusText)
            })
        }
        retData.push({
            url: dest,
            title: config.name,
        })
    }

    return new Promise((resolve, _) => {
        resolve(retData)
    })
}

function getImageUploadConfig(file) {
    let parts = file.type.split('/')
    let ext = ''
    if (parts.length > 1) {
        ext = parts[1]
    }
    let fileName = dayjs().format('HH-mm-ss@') + nanoid(3)
    if (ext.length > 0) {
        fileName = fileName + '.' + ext
    }
    return {
        dir: '/assets/upload/' + dayjs().format('YYYY-MM-DD'),
        name: fileName,
    }
}


function saveFile(data, name) {
    //Blob为js的一个对象，表示一个不可变的, 原始数据的类似文件对象，这是创建文件中不可缺少的！
    var urlObject = window.URL || window.webkitURL || window;
    var export_blob = new Blob([data]);
    var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
    save_link.href = urlObject.createObjectURL(export_blob);
    save_link.download = name;
    save_link.click();
}

//js 读取文件
function readFiles(file) {
    var reader = new FileReader();//new一个FileReader实例
    if (/text+/.test(file.type)) {//判断文件类型，是不是text类型
        reader.onload = function (result) {
            console.log(result)
        }
        reader.readAsText(file);
    } else if (/image+/.test(file.type)) {//判断文件是不是imgage类型
        reader.onload = function (result) {
            console.log(result)
        }
        reader.readAsDataURL(file);
    }
}

function initMarkdownEditor(target, value, callback) {
    if (window.byteEditor != undefined) {
        window.byteEditor.$set({ value: value });
        return
    }
   
    setTimeout(() => {
        window.byteEditor = new bytemd.Editor({
            target: document.getElementById(target),
            props: {
                value: value,
                plugins: [
                    bytemdPluginGfm(), bytemdPluginHighlight()
                ],
            },
        });
       
        window.byteEditor.$on('change', (e) => {
            console.log(e.detail.value)
            window.byteEditor.$set({ value: e.detail.value });
            callback && callback(e.detail.value)
            window.byteEditorValue = e.detail.value;
        });
    }, 200)

}
function getMarkdownValue() {
    return window.byteEditorValue
}

function initMarkdownPreview(target, value) {
    new bytemd.Viewer({
        target: document.getElementById(target),
        props: {
            value: value,
            plugins: [
                bytemdPluginGfm(), bytemdPluginHighlight()
            ]
        },
    });
}


function initCodeEditor(target, lang, value) {
    document.getElementById(target).style.height = getCodeEditorHeight() + 'px'
    require.config({ paths: { vs: '/assets/monaco-editor/min/vs' } });
    require(['vs/editor/editor.main'], function () {
        window.codeEditor = monaco.editor.create(document.getElementById(target), {
            value: value,
            language: lang,
            theme: "vs-dark",
            formatOnPaste: true, //是否粘贴自动格式化
            automaticLayout: true,
        });
    });
}

function getCodeEditorHeight() {
    return window.screen.height - 300
}

function formatUnixTime(ts) {
    return dayjs.unix(ts).format('YYYY-MM-DD HH:mm:ss')
}