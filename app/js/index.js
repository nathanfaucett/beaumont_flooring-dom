var virt = require("@nathanfaucett/virt"),
    virtDOM = require("@nathanfaucett/virt-dom"),
    environment = require("@nathanfaucett/environment"),
    eventListener = require("@nathanfaucett/event_listener"),
    app = require("bomont_flooring"),
    pageClient = require("@nathanfaucett/page/src/client"),
    config = require("./config");


eventListener.on(environment.window, "load DOMContentLoaded", function() {
    var root = virtDOM.render(virt.createView(app.Component), environment.document.getElementById("app")),
        pageServer = app.page,
        adapter = root.adapter,
        messengerServer = adapter.messenger,
        messengerClient = adapter.messengerClient;

    pageClient.initClient(messengerClient);
    pageServer.initServer(messengerServer);

    pageClient.setHtml5Mode(config.html5Mode, function onSetHtml5Mode() {
        app.init(config);
        pageClient.listen();
    });
});
