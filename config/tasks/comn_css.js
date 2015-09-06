var config = require("../application"),
    comnCss = require("comn_css"),
    path = require("file_path"),
    less = require("less"),
    fileUtils = require("file_utils");


function compile(options, done) {
    var str;

    try{
        str = comnCss(options.index, options);
    } catch(e) {
        done(e);
        return;
    }

    less.render(str, options.less, function(err, out) {
        if (err) {
            done(err);
        } else {
            fileUtils.writeFile(options.out, out.css, done);
        }
    });
}

module.exports = function(config) {
    return function(done) {
        compile({
            index: config.paths.css_src,
            out: config.paths.css_out,
            less: {
                compress: config.env === "production",
                optimization: 0,
                ieCompat: true
            }
        }, done);
    };
};
