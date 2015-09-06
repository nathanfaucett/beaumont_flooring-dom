var vfs = require("vinyl-fs");


module.exports = function(config) {
    return function () {
        return vfs.src([
            config.paths.fonts + "**/*",
            config.paths.img + "**/*"
        ]).pipe(vfs.dest(config.paths.build));
    };
};
