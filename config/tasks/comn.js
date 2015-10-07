var comn = require("comn"),
    path = require("file_path"),
    fileUtils = require("file_utils");


function compile(options, callback) {
    try{
        fileUtils.writeFileSync(options.out, comn(options.index, options));
        callback();
    } catch(e) {
        callback(e);
    }
}

module.exports = function(config) {
    return function(done) {
        compile({
            index: config.paths.js_src,
            out: config.paths.js_out
        }, done);
    };
};
