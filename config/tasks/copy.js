var vfs = require("vinyl-fs");


module.exports = function(config) {
    return function () {
        return vfs.src([
            config.paths.fonts + "**/*",
            config.paths.img + "**/*",
            config.paths.app + "/email.php"
        ]).pipe(vfs.dest(config.paths.build));
    };
};
