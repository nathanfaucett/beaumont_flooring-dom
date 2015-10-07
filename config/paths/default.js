var path = require("file_path");


var root = path.dir(path.dir(__dirname)),
    webRoot = path.join(root, "node_modules", "beaumont_flooring");


module.exports = {

    root: root,

    webRoot: webRoot,

    build: path.join(root, "build"),
    tmp: path.join(root, ".tmp"),

    app: path.join(root, "app"),

    locale: path.join(webRoot, "locale"),
    fonts: path.join(webRoot, "fonts"),
    img: path.join(webRoot, "img"),

    js: path.join(root, "app", "js"),
    css: path.join(root, "app", "css")
};
