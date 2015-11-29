(function(dependencies, chunks, undefined, global) {
    
    var cache = [];
    

    function Module() {
        this.id = null;
        this.filename = null;
        this.dirname = null;
        this.exports = {};
        this.loaded = false;
    }

    Module.prototype.require = require;

    function require(index) {
        var module = cache[index],
            callback, exports;

        if (module !== undefined) {
            return module.exports;
        } else {
            callback = dependencies[index];

            cache[index] = module = new Module();
            exports = module.exports;

            callback.call(exports, require, exports, module, undefined, global);
            module.loaded = true;

            return module.exports;
        }
    }

    require.resolve = function(path) {
        return path;
    };

    

    require.async = function async(index, callback) {
        callback(require(index));
    };

    

    if (typeof(define) === "function" && define.amd) {
        define([], function() {
            return require(0);
        });
    } else if (typeof(module) !== "undefined" && module.exports) {
        module.exports = require(0);
    } else {
        
        require(0);
        
    }
}([
function(require, exports, module, undefined, global) {
/* index.js */

var virt = require(1),
    virtDOM = require(2),
    environment = require(3),
    eventListener = require(4),
    app = require(5),
    config = require(6);


eventListener.on(environment.window, "load DOMContentLoaded", function() {
    app.init(config);
    virtDOM.render(virt.createView(app.Component), environment.document.getElementById("app"));
});


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/index.js */

var View = require(7);


var virt = exports;


virt.Root = require(8);

virt.Component = require(9);

virt.View = View;
virt.cloneView = View.clone;
virt.createView = View.create;
virt.createFactory = View.createFactory;

virt.consts = require(10);

virt.getChildKey = require(11);
virt.getRootIdFromId = require(12);

virt.traverseAncestors = require(13);
virt.traverseDescendants = require(14);
virt.traverseTwoPhase = require(15);

virt.context = require(16);
virt.owner = require(17);


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/index.js */

var renderString = require(75),
    nativeDOMComponents = require(76),
    nativeDOMHandlers = require(77);


var virtDOM = exports;


virtDOM.virt = require(1);

virtDOM.addNativeComponent = function(type, constructor) {
    nativeDOMComponents[type] = constructor;
};
virtDOM.addNativeHandler = function(name, fn) {
    nativeDOMHandlers[name] = fn;
};

virtDOM.render = require(78);
virtDOM.unmount = require(79);

virtDOM.renderString = function(view, id) {
    return renderString(view, null, id || ".0");
};

virtDOM.findDOMNode = require(80);
virtDOM.findRoot = require(81);
virtDOM.findEventHandler = require(82);

virtDOM.createWorkerRender = require(83);
virtDOM.renderWorker = require(84);

virtDOM.createWebSocketRender = require(85);
virtDOM.renderWebSocket = require(86);


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/environment/src/index.js */

var environment = exports,

    hasWindow = typeof(window) !== "undefined",
    userAgent = hasWindow ? window.navigator.userAgent : "";


environment.worker = typeof(importScripts) !== "undefined";

environment.browser = environment.worker || !!(
    hasWindow &&
    typeof(navigator) !== "undefined" &&
    window.document
);

environment.node = !environment.worker && !environment.browser;

environment.mobile = environment.browser && /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());

environment.window = (
    hasWindow ? window :
    typeof(global) !== "undefined" ? global :
    typeof(self) !== "undefined" ? self : {}
);

environment.pixelRatio = environment.window.devicePixelRatio || 1;

environment.document = typeof(document) !== "undefined" ? document : {};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/event_listener/src/index.js */

var process = require(60);
var isObject = require(33),
    isFunction = require(19),
    environment = require(3),
    eventTable = require(132);


var eventListener = module.exports,

    reSpliter = /[\s]+/,

    window = environment.window,
    document = environment.document,

    listenToEvent, captureEvent, removeEvent, dispatchEvent;


window.Event = window.Event || function EmptyEvent() {};


eventListener.on = function(target, eventType, callback) {
    var eventTypes = eventType.split(reSpliter),
        i = eventTypes.length;

    while (i--) {
        listenToEvent(target, eventTypes[i], callback);
    }
};

eventListener.capture = function(target, eventType, callback) {
    var eventTypes = eventType.split(reSpliter),
        i = eventTypes.length;

    while (i--) {
        captureEvent(target, eventTypes[i], callback);
    }
};

eventListener.off = function(target, eventType, callback) {
    var eventTypes = eventType.split(reSpliter),
        i = eventTypes.length;

    while (i--) {
        removeEvent(target, eventTypes[i], callback);
    }
};

eventListener.emit = function(target, eventType, event) {

    return dispatchEvent(target, eventType, isObject(event) ? event : {});
};

eventListener.getEventConstructor = function(target, eventType) {
    var getter = eventTable[eventType];
    return isFunction(getter) ? getter(target) : window.Event;
};


if (isFunction(document.addEventListener)) {

    listenToEvent = function(target, eventType, callback) {

        target.addEventListener(eventType, callback, false);
    };

    captureEvent = function(target, eventType, callback) {

        target.addEventListener(eventType, callback, true);
    };

    removeEvent = function(target, eventType, callback) {

        target.removeEventListener(eventType, callback, false);
    };

    dispatchEvent = function(target, eventType, event) {
        var getter = eventTable[eventType],
            EventType = isFunction(getter) ? getter(target) : window.Event;

        return !!target.dispatchEvent(new EventType(eventType, event));
    };
} else if (isFunction(document.attachEvent)) {

    listenToEvent = function(target, eventType, callback) {

        target.attachEvent("on" + eventType, callback);
    };

    captureEvent = function() {
        if (process.env.NODE_ENV === "development") {
            throw new Error(
                "Attempted to listen to events during the capture phase on a " +
                "browser that does not support the capture phase. Your application " +
                "will not receive some events."
            );
        }
    };

    removeEvent = function(target, eventType, callback) {

        target.detachEvent("on" + eventType, callback);
    };

    dispatchEvent = function(target, eventType, event) {
        var doc = target.ownerDocument || document;

        return !!target.fireEvent("on" + eventType, doc.createEventObject(event));
    };
} else {

    listenToEvent = function(target, eventType, callback) {

        target["on" + eventType] = callback;
        return target;
    };

    captureEvent = function() {
        if (process.env.NODE_ENV === "development") {
            throw new Error(
                "Attempted to listen to events during the capture phase on a " +
                "browser that does not support the capture phase. Your application " +
                "will not receive some events."
            );
        }
    };

    removeEvent = function(target, eventType) {

        target["on" + eventType] = null;
        return true;
    };

    dispatchEvent = function(target, eventType, event) {
        var onType = "on" + eventType;

        if (isFunction(target[onType])) {
            event.type = eventType;
            return !!target[onType](event);
        }

        return false;
    };
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/index.js */

var EventEmitter = require(178),
    page = require(179),
    extend = require(27),
    virtModal = require(180),
    objectMap = require(40),
    request = require(181),
    i18n = require(182),

    dispatcher = require(183),
    router = require(184),

    i18nBound, App, RouteStore, UserStore;


var app = new EventEmitter(-1),
    pages = {},
    modals = {};


module.exports = app;


i18nBound = require(185);
App = require(186);
RouteStore = require(187);
UserStore = require(188);

app.config = null;
app.Component = App;
app.page = page;
app.i18n = i18nBound;
app.dispatcher = dispatcher;
app.router = router;


app.init = function(config) {
    var dispatcher = app.dispatcher,
        page = app.page;

    app.config = config;

    request.defaults.headers["Content-Type"] = "application/json";
    request.defaults.withCredentials = true;

    page.on("request", function onRequest(ctx) {
        dispatcher.handleViewAction({
            actionType: RouteStore.consts.ROUTE_CHANGE,
            ctx: ctx
        });
    });

    dispatcher.register(virtModal.ModalStore.registerCallback);

    UserStore.on("changeLocale", function onChangeLocale() {
        page.reload();
    });

    i18n.flatMode(config.flatLocaleMode);
    i18n.throwMissingError(config.throwMissingTranslationError);
    page.html5Mode(config.html5Mode);

    app.emit("init");

    page.init();
};

app.registerPage = function(name, render) {
    pages[name] = render;
};

app.registerModal = function(name, render, onClose) {
    modals[name] = {
        name: name,
        render: render,
        onClose: onClose
    };
};

app.getPage = function(name) {
    return pages[name];
};

app.getModals = function(ctx) {
    return objectMap(modals, function eachModal(m) {
        var result = extend({}, m),
            modalRender = m.render,
            modalOnClose = m.onClose;

        result.render = function(modal) {
            return modalRender(modal, ctx);
        };

        result.onClose = function(modal) {
            return modalOnClose(modal, ctx);
        };

        return result;
    });
};

require(189);
require(190);


},
function(require, exports, module, undefined, global) {
/* config.js */

module.exports = {
    "env": "development",
    "locales": [
        "en"
    ],
    "flatLocaleMode": false,
    "throwMissingTranslationError": false,
    "html5Mode": false
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/View.js */

var isPrimitive = require(18),
    isFunction = require(19),
    isArray = require(20),
    isString = require(21),
    isObjectLike = require(22),
    isNullOrUndefined = require(23),
    isNumber = require(24),
    has = require(25),
    map = require(26),
    extend = require(27),
    propsToJSON = require(28),
    owner = require(17),
    context = require(16);


var ViewPrototype;


module.exports = View;


function View(type, key, ref, props, children, owner, context) {
    this.__owner = owner;
    this.__context = context;
    this.type = type;
    this.key = key;
    this.ref = ref;
    this.props = props;
    this.children = children;
}

ViewPrototype = View.prototype;

ViewPrototype.__View__ = true;

ViewPrototype.copy = function(view) {
    this.__owner = view.__owner;
    this.__context = view.__context;
    this.type = view.type;
    this.key = view.key;
    this.ref = view.ref;
    this.props = view.props;
    this.children = view.children;
    return this;
};

ViewPrototype.clone = function() {
    return new View(this.type, this.key, this.ref, this.props, this.children, this.__owner, this.__context);
};

ViewPrototype.toJSON = function() {
    return toJSON(this);
};

View.isView = isView;
View.isPrimitiveView = isPrimitiveView;
View.isViewComponent = isViewComponent;
View.isViewJSON = isViewJSON;
View.toJSON = toJSON;

View.clone = function(view, config, children) {
    var props = extend({}, view.props),
        key = view.key,
        ref = view.ref,
        viewOwner = view.__owner,
        childrenLength = arguments.length - 2,
        propName, childArray, i, il;

    if (config) {
        if (config.ref) {
            ref = config.ref;
            viewOwner = owner.current;
        }
        if (config.key) {
            key = config.key;
        }

        for (propName in config) {
            if (has(config, propName)) {
                if (!(propName === "key" || propName === "ref")) {
                    props[propName] = config[propName];
                }
            }
        }
    }

    if (childrenLength === 1 && !isArray(children)) {
        children = [children];
    } else if (childrenLength > 1) {
        childArray = new Array(childrenLength);
        i = -1;
        il = childrenLength - 1;
        while (i++ < il) {
            childArray[i] = arguments[i + 2];
        }
        children = childArray;
    } else {
        children = view.children;
    }

    return new View(view.type, key, ref, props, ensureValidChildren(children), viewOwner, context.current);
};

View.create = function(type, config, children) {
    var isConfigArray = isArray(config),
        argumentsLength = arguments.length;

    if (isChild(config) || isConfigArray) {
        if (isConfigArray) {
            children = config;
        } else if (argumentsLength > 1) {
            children = extractChildren(arguments, 1);
        }
        config = null;
    } else if (children) {
        if (isArray(children)) {
            children = children;
        } else if (argumentsLength > 2) {
            children = extractChildren(arguments, 2);
        }
    }

    return construct(type, config, children);
};

View.createFactory = function(type) {
    return function factory(config, children) {
        var isConfigArray = isArray(config),
            argumentsLength = arguments.length;

        if (isChild(config) || isConfigArray) {
            if (isConfigArray) {
                children = config;
            } else if (config && argumentsLength > 0) {
                children = extractChildren(arguments, 0);
            }
            config = null;
        } else if (children) {
            if (isArray(children)) {
                children = children;
            } else if (argumentsLength > 1) {
                children = extractChildren(arguments, 1);
            }
        }

        return construct(type, config, children);
    };
};

function construct(type, config, children) {
    var props = {},
        key = null,
        ref = null,
        propName, defaultProps;

    if (config) {
        key = config.key != null ? config.key : null;
        ref = config.ref != null ? config.ref : null;

        for (propName in config) {
            if (has(config, propName)) {
                if (!(propName === "key" || propName === "ref")) {
                    props[propName] = config[propName];
                }
            }
        }
    }

    if (type && type.defaultProps) {
        defaultProps = type.defaultProps;

        for (propName in defaultProps) {
            if (has(defaultProps, propName)) {
                if (isNullOrUndefined(props[propName])) {
                    props[propName] = defaultProps[propName];
                }
            }
        }
    }

    return new View(type, key, ref, props, ensureValidChildren(children), owner.current, context.current);
}

function toJSON(view) {
    if (isPrimitive(view)) {
        return view;
    } else {
        return {
            type: view.type,
            key: view.key,
            ref: view.ref,
            props: propsToJSON(view.props),
            children: map(view.children, toJSON)
        };
    }
}

function isView(obj) {
    return isObjectLike(obj) && obj.__View__ === true;
}

function isViewComponent(obj) {
    return isView(obj) && isFunction(obj.type);
}

function isViewJSON(obj) {
    return (
        isObjectLike(obj) &&
        isString(obj.type) &&
        isObjectLike(obj.props) &&
        isArray(obj.children)
    );
}

function isPrimitiveView(object) {
    return isString(object) || isNumber(object);
}

function isChild(object) {
    return isView(object) || isPrimitiveView(object);
}

function extractChildren(args, offset) {
    var children = [],
        i = offset - 1,
        il = args.length - 1,
        j = 0,
        arg;

    while (i++ < il) {
        arg = args[i];
        if (!isNullOrUndefined(arg) && arg !== "" && !isArray(arg)) {
            children[j++] = arg;
        }
    }

    return children;
}

function ensureValidChildren(children) {
    var i, il;

    if (isArray(children)) {
        i = -1;
        il = children.length - 1;

        while (i++ < il) {
            if (!isChild(children[i])) {
                throw new TypeError("child of a View must be a String, Number or a View");
            }
        }
    } else {
        children = [];
    }

    return children;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/Root.js */

var isFunction = require(19),
    emptyFunction = require(42),
    Transaction = require(43),
    diffProps = require(44),
    shouldUpdate = require(45),
    EventManager = require(46),
    Node = require(47);


var RootPrototype,
    ROOT_ID = 0;


module.exports = Root;


function Root() {

    this.id = "." + (ROOT_ID++).toString(36);
    this.childHash = {};

    this.eventManager = new EventManager();

    this.nativeComponents = {};
    this.diffProps = diffProps;
    this.adapter = null;

    this.__transactions = [];
    this.__transactionCallbacks = [];
    this.__currentTransaction = null;
}
RootPrototype = Root.prototype;

RootPrototype.registerNativeComponent = function(type, constructor) {
    this.nativeComponents[type] = constructor;
};

RootPrototype.appendNode = function(node) {
    var id = node.id,
        childHash = this.childHash;

    if (childHash[id] === undefined) {
        node.root = this;
        childHash[id] = node;
    } else {
        throw new Error("Root appendNode(node) trying to override node at " + id);
    }
};

RootPrototype.removeNode = function(node) {
    var id = node.id,
        childHash = this.childHash;

    if (childHash[id] !== undefined) {
        node.root = null;
        delete childHash[id];
    } else {
        throw new Error("Root removeNode(node) trying to remove node that does not exists with id " + id);
    }
};

RootPrototype.__processTransaction = function() {
    var _this = this,
        transactions = this.__transactions,
        transactionCallbacks = this.__transactionCallbacks,
        transaction, callback;

    if (this.__currentTransaction === null && transactions.length !== 0) {
        this.__currentTransaction = transaction = transactions[0];
        callback = transactionCallbacks[0];

        this.adapter.handle(transaction, function onHandle() {
            transactions.splice(0, 1);
            transactionCallbacks.splice(0, 1);

            transaction.queue.notifyAll();
            transaction.destroy();

            _this.__currentTransaction = null;

            callback();

            if (transactions.length !== 0) {
                _this.__processTransaction();
            }
        });
    }
};

RootPrototype.__enqueueTransaction = function(transaction, callback) {
    var transactions = this.__transactions,
        index = transactions.length;

    transactions[index] = transaction;
    this.__transactionCallbacks[index] = isFunction(callback) ? callback : emptyFunction;
    this.__processTransaction();
};

RootPrototype.unmount = function(callback) {
    var node = this.childHash[this.id],
        transaction;

    if (node) {
        transaction = Transaction.create();

        transaction.unmount(this.id);
        node.__unmount(transaction);

        this.__enqueueTransaction(transaction, callback);
    }
};

RootPrototype.update = function(node, callback) {
    var transaction = Transaction.create();

    node.update(node.currentView, transaction);

    this.__enqueueTransaction(transaction, callback);
};

RootPrototype.render = function(nextView, id, callback) {
    var transaction = Transaction.create(),
        node;

    if (isFunction(id)) {
        callback = id;
        id = null;
    }

    id = id || this.id;
    node = this.childHash[id];

    if (node) {
        if (shouldUpdate(node.currentView, nextView)) {

            node.update(nextView, transaction);
            this.__enqueueTransaction(transaction, callback);

            return this;
        } else {
            if (this.id === id) {
                node.__unmount(transaction);
                transaction.unmount(id);
            } else {
                node.unmount(transaction);
            }
        }
    }

    node = new Node(this.id, id, nextView);
    this.appendNode(node);
    node.mount(transaction);

    this.__enqueueTransaction(transaction, callback);

    return this;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/Component.js */

var inherits = require(68),
    extend = require(27),
    componentState = require(62);


var ComponentPrototype;


module.exports = Component;


function Component(props, children, context) {
    this.__node = null;
    this.__mountState = componentState.UNMOUNTED;
    this.__nextState = null;
    this.props = props;
    this.children = children;
    this.context = context;
    this.state = null;
    this.refs = {};
}

ComponentPrototype = Component.prototype;

Component.extend = function(child, displayName) {
    inherits(child, this);
    child.displayName = child.prototype.displayName = displayName || ComponentPrototype.displayName;
    return child;
};

ComponentPrototype.displayName = "Component";

ComponentPrototype.render = function() {
    throw new Error("render() render must be defined on Components");
};

ComponentPrototype.setState = function(state, callback) {
    var node = this.__node;

    this.__nextState = extend({}, this.state, state);

    if (this.__mountState === componentState.MOUNTED) {
        node.root.update(node, callback);
    }
};

ComponentPrototype.forceUpdate = function(callback) {
    var node = this.__node;

    if (this.__mountState === componentState.MOUNTED) {
        node.root.update(node, callback);
    }
};

ComponentPrototype.isMounted = function() {
    return this.__mountState === componentState.MOUNTED;
};

ComponentPrototype.getInternalId = function() {
    return this.__node.id;
};

ComponentPrototype.emitMessage = function(name, data, callback) {
    this.__node.root.adapter.messenger.emit(name, data, callback);
};

ComponentPrototype.sendMessage = ComponentPrototype.emitMessage;

ComponentPrototype.onMessage = function(name, callback) {
    this.__node.root.adapter.messenger.on(name, callback);
};

ComponentPrototype.offMessage = function(name, callback) {
    this.__node.root.adapter.messenger.off(name, callback);
};

ComponentPrototype.getChildContext = function() {};

ComponentPrototype.componentDidMount = function() {};

ComponentPrototype.componentDidUpdate = function( /* previousProps, previousChildren, previousState, previousContext */ ) {};

ComponentPrototype.componentWillMount = function() {};

ComponentPrototype.componentWillUnmount = function() {};

ComponentPrototype.componentWillReceiveProps = function( /* nextProps, nextChildren, nextContext */ ) {};

ComponentPrototype.componentWillUpdate = function( /* nextProps, nextChildren, nextState, nextContext */ ) {};

ComponentPrototype.shouldComponentUpdate = function( /* nextProps, nextChildren, nextState, nextContext */ ) {
    return true;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/Transaction/consts.js */

var keyMirror = require(59);


module.exports = keyMirror([
    "TEXT",
    "REPLACE",
    "PROPS",
    "ORDER",
    "INSERT",
    "REMOVE",
    "MOUNT",
    "UNMOUNT"
]);


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/utils/getChildKey.js */

var getViewKey = require(71);


module.exports = getChildKey;


function getChildKey(parentId, child, index) {
    return parentId + "." + getViewKey(child, index);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/utils/getRootIdFromId.js */

module.exports = getRootIdFromId;


function getRootIdFromId(id) {
    var index;

    if (id && id.charAt(0) === "." && id.length > 1) {
        index = id.indexOf(".", 1);
        return index > -1 ? id.substr(0, index) : id;
    } else {
        return null;
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/utils/traverseAncestors.js */

var traversePath = require(72);


module.exports = traverseAncestors;


function traverseAncestors(id, callback) {
    traversePath("", id, callback, true, false);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/utils/traverseDescendants.js */

var traversePath = require(72);


module.exports = traverseDescendant;


function traverseDescendant(id, callback) {
    traversePath(id, "", callback, false, true);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/utils/traverseTwoPhase.js */

var traversePath = require(72);


module.exports = traverseTwoPhase;


function traverseTwoPhase(id, callback) {
    if (id) {
        traversePath("", id, callback, true, false);
        traversePath(id, "", callback, false, true);
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/context.js */

var context = exports;


context.current = null;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/owner.js */

var owner = exports;


owner.current = null;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_primitive/src/index.js */

var isNullOrUndefined = require(23);


module.exports = isPrimitive;


function isPrimitive(obj) {
    var typeStr;
    return isNullOrUndefined(obj) || ((typeStr = typeof(obj)) !== "object" && typeStr !== "function") || false;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_function/src/index.js */

var objectToString = Object.prototype.toString,
    isFunction;


if (objectToString.call(function() {}) === "[object Object]") {
    isFunction = function isFunction(value) {
        return value instanceof Function;
    };
} else if (typeof(/./) === "function" || (typeof(Uint8Array) !== "undefined" && typeof(Uint8Array) !== "function")) {
    isFunction = function isFunction(value) {
        return objectToString.call(value) === "[object Function]";
    };
} else {
    isFunction = function isFunction(value) {
        return typeof(value) === "function" || false;
    };
}


module.exports = isFunction;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_array/src/index.js */

var isNative = require(31),
    isLength = require(32),
    isObject = require(33);


var objectToString = Object.prototype.toString,
    nativeIsArray = Array.isArray,
    isArray;


if (isNative(nativeIsArray)) {
    isArray = nativeIsArray;
} else {
    isArray = function isArray(value) {
        return (
            isObject(value) &&
            isLength(value.length) &&
            objectToString.call(value) === "[object Array]"
        ) || false;
    };
}


module.exports = isArray;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_string/src/index.js */

module.exports = isString;


function isString(value) {
    return typeof(value) === "string" || false;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_object_like/src/index.js */

var isNullOrUndefined = require(23);


module.exports = isObjectLike;


function isObjectLike(value) {
    return (!isNullOrUndefined(value) && typeof(value) === "object") || false;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_null_or_undefined/src/index.js */

var isNull = require(29),
    isUndefined = require(30);


module.exports = isNullOrUndefined;

/**
  isNullOrUndefined accepts any value and returns true
  if the value is null or undefined. For all other values
  false is returned.
  
  @param {Any}        any value to test
  @returns {Boolean}  the boolean result of testing value

  @example
    isNullOrUndefined(null);   // returns true
    isNullOrUndefined(undefined);   // returns true
    isNullOrUndefined("string");    // returns false
**/
function isNullOrUndefined(value) {
    return isNull(value) || isUndefined(value);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/node_modules/is_number/src/index.js */

module.exports = isNumber;


function isNumber(value) {
    return typeof(value) === "number" || false;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/has/src/index.js */

var isNative = require(31),
    getPrototypeOf = require(36),
    isNullOrUndefined = require(23);


var nativeHasOwnProp = Object.prototype.hasOwnProperty,
    baseHas;


module.exports = has;


function has(object, key) {
    if (isNullOrUndefined(object)) {
        return false;
    } else {
        return baseHas(object, key);
    }
}

if (isNative(nativeHasOwnProp)) {
    baseHas = function baseHas(object, key) {
        return nativeHasOwnProp.call(object, key);
    };
} else {
    baseHas = function baseHas(object, key) {
        var proto = getPrototypeOf(object);

        if (isNullOrUndefined(proto)) {
            return key in object;
        } else {
            return (key in object) && (!(key in proto) || proto[key] !== object[key]);
        }
    };
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/map/src/index.js */

var isArrayLike = require(37),
    isNullOrUndefined = require(23),
    fastBindThis = require(38),
    arrayMap = require(39),
    objectMap = require(40);


module.exports = map;


function map(value, callback, thisArg) {
    callback = isNullOrUndefined(thisArg) ? callback : fastBindThis(callback, thisArg, 3);
    return isArrayLike(value) ?
        arrayMap(value, callback) :
        objectMap(value, callback);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/extend/src/index.js */

var keys = require(41);


module.exports = extend;


function extend(out) {
    var i = 0,
        il = arguments.length - 1;

    while (i++ < il) {
        baseExtend(out, arguments[i]);
    }

    return out;
}

function baseExtend(a, b) {
    var objectKeys = keys(b),
        i = -1,
        il = objectKeys.length - 1,
        key;

    while (i++ < il) {
        key = objectKeys[i];
        a[key] = b[key];
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/utils/propsToJSON.js */

var has = require(25),
    isPrimitive = require(18);


module.exports = propsToJSON;


function propsToJSON(props) {
    return toJSON(props, {});
}

function toJSON(props, json) {
    var key, value;

    for (key in props) {
        if (has(props, key)) {
            value = props[key];

            if (isPrimitive(value)) {
                json = json === null ? {} : json;
                json[key] = value;
            } else {
                value = toJSON(value, null);
                if (value !== null) {
                    json = json === null ? {} : json;
                    json[key] = value;
                }
            }
        }
    }

    return json;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_null/src/index.js */

module.exports = isNull;


function isNull(value) {
    return value === null;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_undefined/src/index.js */

module.exports = isUndefined;


function isUndefined(value) {
    return value === void(0);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_array/node_modules/is_native/src/index.js */

var isFunction = require(19),
    isNullOrUndefined = require(23),
    escapeRegExp = require(34);


var reHostCtor = /^\[object .+?Constructor\]$/,

    functionToString = Function.prototype.toString,

    reNative = RegExp("^" +
        escapeRegExp(Object.prototype.toString)
        .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    ),

    isHostObject;


module.exports = isNative;


function isNative(value) {
    return !isNullOrUndefined(value) && (
        isFunction(value) ?
        reNative.test(functionToString.call(value)) : (
            typeof(value) === "object" && (
                (isHostObject(value) ? reNative : reHostCtor).test(value) || false
            )
        )
    ) || false;
}

try {
    String({
        "toString": 0
    } + "");
} catch (e) {
    isHostObject = function isHostObject() {
        return false;
    };
}

isHostObject = function isHostObject(value) {
    return !isFunction(value.toString) && typeof(value + "") === "string";
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_length/src/index.js */

var isNumber = require(24);


var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;


module.exports = isLength;


function isLength(value) {
    return isNumber(value) && value > -1 && value % 1 === 0 && value <= MAX_SAFE_INTEGER;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_array/node_modules/is_object/src/index.js */

var isNull = require(29);


module.exports = isObject;


function isObject(value) {
    var type = typeof(value);
    return type === "function" || (!isNull(value) && type === "object") || false;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/escape_regexp/src/index.js */

var toString = require(35);


var reRegExpChars = /[.*+?\^${}()|\[\]\/\\]/g,
    reHasRegExpChars = new RegExp(reRegExpChars.source);


module.exports = escapeRegExp;


function escapeRegExp(string) {
    string = toString(string);
    return (
        (string && reHasRegExpChars.test(string)) ?
        string.replace(reRegExpChars, "\\$&") :
        string
    );
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/to_string/src/index.js */

var isString = require(21),
    isNullOrUndefined = require(23);


module.exports = toString;


function toString(value) {
    if (isString(value)) {
        return value;
    } else if (isNullOrUndefined(value)) {
        return "";
    } else {
        return value + "";
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/get_prototype_of/src/index.js */

var isObject = require(33),
    isNative = require(31),
    isNullOrUndefined = require(23);


var nativeGetPrototypeOf = Object.getPrototypeOf,
    baseGetPrototypeOf;


module.exports = getPrototypeOf;


function getPrototypeOf(value) {
    if (isNullOrUndefined(value)) {
        return null;
    } else {
        return baseGetPrototypeOf(value);
    }
}

if (isNative(nativeGetPrototypeOf)) {
    baseGetPrototypeOf = function baseGetPrototypeOf(value) {
        return nativeGetPrototypeOf(isObject(value) ? value : Object(value)) || null;
    };
} else {
    if ("".__proto__ === String.prototype) {
        baseGetPrototypeOf = function baseGetPrototypeOf(value) {
            return value.__proto__ || null;
        };
    } else {
        baseGetPrototypeOf = function baseGetPrototypeOf(value) {
            return value.constructor ? value.constructor.prototype : null;
        };
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_array_like/src/index.js */

var isLength = require(32),
    isFunction = require(19),
    isObject = require(33);


module.exports = isArrayLike;


function isArrayLike(value) {
    return !isFunction(value) && isObject(value) && isLength(value.length);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/fast_bind_this/src/index.js */

var isNumber = require(24);


module.exports = fastBindThis;


function fastBindThis(callback, thisArg, length) {
    switch (isNumber(length) ? length : (callback.length || -1)) {
        case 0:
            return function bound() {
                return callback.call(thisArg);
            };
        case 1:
            return function bound(a1) {
                return callback.call(thisArg, a1);
            };
        case 2:
            return function bound(a1, a2) {
                return callback.call(thisArg, a1, a2);
            };
        case 3:
            return function bound(a1, a2, a3) {
                return callback.call(thisArg, a1, a2, a3);
            };
        case 4:
            return function bound(a1, a2, a3, a4) {
                return callback.call(thisArg, a1, a2, a3, a4);
            };
        default:
            return function bound() {
                return callback.apply(thisArg, arguments);
            };
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/array-map/src/index.js */

module.exports = arrayMap;


function arrayMap(array, callback) {
    var length = array.length,
        i = -1,
        il = length - 1,
        results = new Array(length);

    while (i++ < il) {
        results[i] = callback(array[i], i, array);
    }

    return results;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/object-map/src/index.js */

var keys = require(41);


module.exports = objectMap;


function objectMap(object, callback) {
    var objectKeys = keys(object),
        length = objectKeys.length,
        i = -1,
        il = length - 1,
        results = {},
        key;

    while (i++ < il) {
        key = objectKeys[i];
        results[key] = callback(object[key], key, object);
    }

    return results;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/keys/src/index.js */

var has = require(25),
    isNative = require(31),
    isNullOrUndefined = require(23),
    isObject = require(33);


var nativeKeys = Object.keys;


module.exports = keys;


function keys(value) {
    if (isNullOrUndefined(value)) {
        return [];
    } else {
        return nativeKeys(isObject(value) ? value : Object(value));
    }
}

if (!isNative(nativeKeys)) {
    nativeKeys = function(value) {
        var localHas = has,
            out = [],
            i = 0,
            key;

        for (key in value) {
            if (localHas(value, key)) {
                out[i++] = key;
            }
        }

        return out;
    };
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/empty_function/src/index.js */

module.exports = emptyFunction;


function emptyFunction() {}

function makeEmptyFunction(value) {
    return function() {
        return value;
    };
}

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function() {
    return this;
};
emptyFunction.thatReturnsArgument = function(argument) {
    return argument;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/Transaction/index.js */

var createPool = require(48),
    Queue = require(49),
    has = require(25),
    consts = require(10),
    InsertPatch = require(50),
    MountPatch = require(51),
    UnmountPatch = require(52),
    OrderPatch = require(53),
    PropsPatch = require(54),
    RemovePatch = require(55),
    ReplacePatch = require(56),
    TextPatch = require(57);


var TransactionPrototype;


module.exports = Transaction;


function Transaction() {

    this.queue = Queue.getPooled();

    this.removes = {};
    this.patches = {};

    this.events = {};
    this.eventsRemove = {};
}
createPool(Transaction);
Transaction.consts = consts;
TransactionPrototype = Transaction.prototype;

Transaction.create = function() {
    return Transaction.getPooled();
};

TransactionPrototype.destroy = function() {
    Transaction.release(this);
};

function clearPatches(hash) {
    var localHas = has,
        id, array, j, jl;

    for (id in hash) {
        if (localHas(hash, id)) {
            array = hash[id];
            j = -1;
            jl = array.length - 1;

            while (j++ < jl) {
                array[j].destroy();
            }

            delete hash[id];
        }
    }
}

function clearHash(hash) {
    var localHas = has,
        id;

    for (id in hash) {
        if (localHas(hash, id)) {
            delete hash[id];
        }
    }
}

TransactionPrototype.destructor = function() {
    clearPatches(this.patches);
    clearPatches(this.removes);
    clearHash(this.events);
    clearHash(this.eventsRemove);
    return this;
};

TransactionPrototype.mount = function(id, next) {
    this.append(MountPatch.create(id, next));
};

TransactionPrototype.unmount = function(id) {
    this.append(UnmountPatch.create(id));
};

TransactionPrototype.insert = function(id, childId, index, next) {
    this.append(InsertPatch.create(id, childId, index, next));
};

TransactionPrototype.order = function(id, order) {
    this.append(OrderPatch.create(id, order));
};

TransactionPrototype.props = function(id, previous, props) {
    this.append(PropsPatch.create(id, previous, props));
};

TransactionPrototype.replace = function(id, childId, index, next) {
    this.append(ReplacePatch.create(id, childId, index, next));
};

TransactionPrototype.text = function(id, index, next, props) {
    this.append(TextPatch.create(id, index, next, props));
};

TransactionPrototype.remove = function(id, childId, index) {
    this.appendRemove(RemovePatch.create(id, childId, index));
};

TransactionPrototype.event = function(id, type) {
    var events = this.events,
        eventArray = events[id] || (events[id] = []);

    eventArray[eventArray.length] = type;
};

TransactionPrototype.removeEvent = function(id, type) {
    var eventsRemove = this.eventsRemove,
        eventArray = eventsRemove[id] || (eventsRemove[id] = []);

    eventArray[eventArray.length] = type;
};

function append(hash, value) {
    var id = value.id,
        patchArray = hash[id] || (hash[id] = []);

    patchArray[patchArray.length] = value;
}

TransactionPrototype.append = function(value) {
    append(this.patches, value);
};

TransactionPrototype.appendRemove = function(value) {
    append(this.removes, value);
};

TransactionPrototype.toJSON = function() {
    return {
        removes: this.removes,
        patches: this.patches,

        events: this.events,
        eventsRemove: this.eventsRemove
    };
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/utils/diffProps.js */

var has = require(25),
    isObject = require(33),
    getPrototypeOf = require(36),
    isNullOrUndefined = require(23);


module.exports = diffProps;


function diffProps(id, eventManager, transaction, previous, next) {
    var result = null,
        localHas = has,
        propNameToTopLevel = eventManager.propNameToTopLevel,
        key, previousValue, nextValue, propsDiff;

    for (key in previous) {
        nextValue = next[key];

        if (isNullOrUndefined(nextValue)) {
            result = result || {};
            result[key] = undefined;

            if (localHas(propNameToTopLevel, key)) {
                eventManager.off(id, propNameToTopLevel[key], transaction);
            }
        } else {
            previousValue = previous[key];

            if (previousValue === nextValue) {
                continue;
            } else if (isObject(previousValue) && isObject(nextValue)) {
                if (getPrototypeOf(previousValue) !== getPrototypeOf(nextValue)) {
                    result = result || {};
                    result[key] = nextValue;
                } else {
                    propsDiff = diffProps(id, eventManager, transaction, previousValue, nextValue);
                    if (propsDiff !== null) {
                        result = result || {};
                        result[key] = propsDiff;
                    }
                }
            } else {
                result = result || {};
                result[key] = nextValue;
            }
        }
    }

    for (key in next) {
        if (isNullOrUndefined(previous[key])) {
            nextValue = next[key];

            result = result || {};
            result[key] = nextValue;

            if (localHas(propNameToTopLevel, key)) {
                eventManager.on(id, propNameToTopLevel[key], nextValue, transaction);
            }
        }
    }

    return result;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/utils/shouldUpdate.js */

var isString = require(21),
    isNumber = require(24),
    isNullOrUndefined = require(23);


module.exports = shouldUpdate;


function shouldUpdate(previous, next) {
    if (isNullOrUndefined(previous) || isNullOrUndefined(next)) {
        return false;
    } else {
        if (isString(previous) || isNumber(previous)) {
            return isString(next) || isNumber(next);
        } else {
            return (
                previous.type === next.type &&
                previous.key === next.key
            );
        }
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/EventManager.js */

var EventManagerPrototype;


module.exports = EventManager;


function EventManager() {
    this.propNameToTopLevel = {};
    this.events = {};
}

EventManagerPrototype = EventManager.prototype;

EventManagerPrototype.on = function(id, topLevelType, listener, transaction) {
    var events = this.events,
        event = events[topLevelType] || (events[topLevelType] = {});

    event[id] = listener;
    transaction.event(id, topLevelType);
};

EventManagerPrototype.off = function(id, topLevelType, transaction) {
    var events = this.events,
        event = events[topLevelType];

    if (event[id] !== undefined) {
        delete event[id];
        transaction.removeEvent(id, topLevelType);
    }
};

EventManagerPrototype.allOff = function(id, transaction) {
    var events = this.events,
        event, topLevelType;

    for (topLevelType in events) {
        if ((event = events[topLevelType])[id] !== undefined) {
            delete event[id];
            transaction.removeEvent(id, topLevelType);
        }
    }
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/Node.js */

var process = require(60);
var has = require(25),
    map = require(26),
    indexOf = require(61),
    isString = require(21),
    isArray = require(20),
    isFunction = require(19),
    extend = require(27),
    owner = require(17),
    context = require(16),
    shouldUpdate = require(45),
    componentState = require(62),
    getComponentClassForType = require(63),
    View = require(7),
    getChildKey = require(11),
    emptyObject = require(64),
    diffChildren;


var NodePrototype,
    isPrimitiveView = View.isPrimitiveView;


module.exports = Node;


diffChildren = require(65);


function Node(parentId, id, currentView) {

    this.parent = null;
    this.parentId = parentId;
    this.id = id;

    this.context = null;

    this.root = null;

    this.ComponentClass = null;
    this.component = null;

    this.isBottomLevel = true;
    this.isTopLevel = false;

    this.renderedNode = null;
    this.renderedChildren = null;

    this.currentView = currentView;
}

NodePrototype = Node.prototype;

NodePrototype.appendNode = function(node) {
    var renderedChildren = this.renderedChildren;

    this.root.appendNode(node);
    node.parent = this;

    renderedChildren[renderedChildren.length] = node;
};

NodePrototype.removeNode = function(node) {
    var renderedChildren = this.renderedChildren,
        index;

    node.parent = null;

    index = indexOf(renderedChildren, node);
    if (index !== -1) {
        renderedChildren.splice(index, 1);
    }
};

NodePrototype.mountComponent = function() {
    var currentView = this.currentView,
        ComponentClass, component, props, children, context;

    if (isFunction(currentView.type)) {
        this.ComponentClass = ComponentClass = currentView.type;
    } else {
        this.ComponentClass = ComponentClass = getComponentClassForType(currentView.type, this.root.nativeComponents);
        this.isTopLevel = true;
    }

    props = this.__processProps(currentView.props);
    children = currentView.children;
    context = this.__processContext(currentView.__context);

    component = new ComponentClass(props, children, context);

    this.component = component;

    component.__node = this;
    component.props = component.props || props;
    component.children = component.children || children;
    component.context = component.context || context;
};

NodePrototype.mount = function(transaction) {
    transaction.mount(this.id, this.__mount(transaction));
};

NodePrototype.__mount = function(transaction) {
    var component, renderedView, renderedNode;

    this.context = context.current;
    this.mountComponent();

    renderedView = this.renderView();

    if (this.isTopLevel !== true) {
        renderedNode = this.renderedNode = new Node(this.parentId, this.id, renderedView);
        renderedNode.root = this.root;
        renderedNode.isBottomLevel = false;
        renderedView = renderedNode.__mount(transaction);
    } else {
        mountEvents(this.id, renderedView.props, this.root.eventManager, transaction);
        this.__mountChildren(renderedView, transaction);
    }

    component = this.component;
    component.__mountState = componentState.MOUNTING;
    component.componentWillMount();

    transaction.queue.enqueue(function onMount() {
        component.__mountState = componentState.MOUNTED;
        if (component.componentDidMount) {
            component.componentDidMount();
        }
    });

    this.__attachRefs();

    return renderedView;
};

NodePrototype.__mountChildren = function(renderedView, transaction) {
    var _this = this,
        parentId = this.id,
        renderedChildren = [];

    this.renderedChildren = renderedChildren;

    renderedView.children = map(renderedView.children, function(child, index) {
        var node, id;

        if (isPrimitiveView(child)) {
            return child;
        } else {
            id = getChildKey(parentId, child, index);
            node = new Node(parentId, id, child);
            _this.appendNode(node);
            return node.__mount(transaction);
        }
    });
};

NodePrototype.unmount = function(transaction) {
    this.__unmount(transaction);
    transaction.remove(this.parentId, this.id, 0);
};

NodePrototype.__unmount = function(transaction) {
    var component = this.component;

    if (this.isTopLevel !== true) {
        this.renderedNode.__unmount(transaction);
        this.renderedNode = null;
    } else {
        this.__unmountChildren(transaction);
        this.root.eventManager.allOff(this.id, transaction);
        this.renderedChildren = null;
    }

    component.__mountState = componentState.UNMOUNTING;

    if (component.componentWillUnmount) {
        component.componentWillUnmount();
    }

    if (this.isBottomLevel !== false) {
        this.root.removeNode(this);
    }

    this.__detachRefs();

    this.context = null;
    this.component = null;
    this.currentView = null;

    transaction.queue.enqueue(function onUnmount() {
        component.__mountState = componentState.UNMOUNTED;
    });
};

NodePrototype.__unmountChildren = function(transaction) {
    var renderedChildren = this.renderedChildren,
        i = -1,
        il = renderedChildren.length - 1;

    while (i++ < il) {
        renderedChildren[i].__unmount(transaction);
    }
};

NodePrototype.update = function(nextView, transaction) {
    this.receiveView(nextView, nextView.__context, transaction);
};

NodePrototype.receiveView = function(nextView, nextContext, transaction) {
    var prevView = this.currentView,
        prevContext = this.context;

    this.updateComponent(
        prevView,
        nextView,
        prevContext,
        nextContext,
        transaction
    );
};

NodePrototype.updateComponent = function(
    prevParentView, nextParentView, prevUnmaskedContext, nextUnmaskedContext, transaction
) {
    var component = this.component,

        nextProps = component.props,
        nextChildren = component.children,
        nextContext = component.context,

        nextState;

    component.__mountState = componentState.UPDATING;

    if (prevParentView !== nextParentView) {
        nextProps = this.__processProps(nextParentView.props);
        nextChildren = nextParentView.children;
        nextContext = this.__processContext(nextParentView.__context);

        if (component.componentWillReceiveProps) {
            component.componentWillReceiveProps(nextProps, nextChildren, nextContext);
        }
    }

    nextState = component.__nextState || component.state;

    if (component.shouldComponentUpdate ? component.shouldComponentUpdate(nextProps, nextChildren, nextState, nextContext) : true) {
        this.__updateComponent(
            nextParentView, nextProps, nextChildren, nextState, nextContext, nextUnmaskedContext, transaction
        );
    } else {
        this.currentView = nextParentView;
        this.context = nextUnmaskedContext;

        component.props = nextProps;
        component.children = nextChildren;
        component.state = nextState;
        component.context = nextContext;

        component.__mountState = componentState.MOUNTED;
    }
};

NodePrototype.__updateComponent = function(
    nextParentView, nextProps, nextChildren, nextState, nextContext, unmaskedContext, transaction
) {
    var component = this.component,

        prevProps = component.props,
        prevChildren = component.children,
        prevState = component.__previousState,
        prevContext = component.context,

        prevParentView;

    if (component.componentWillUpdate) {
        component.componentWillUpdate(nextProps, nextChildren, nextState, nextContext);
    }

    component.props = nextProps;
    component.children = nextChildren;
    component.state = nextState;
    component.context = nextContext;

    this.context = unmaskedContext;

    if (this.isTopLevel !== true) {
        this.currentView = nextParentView;
        this.__updateRenderedNode(unmaskedContext, transaction);
    } else {
        prevParentView = this.currentView;
        this.currentView = nextParentView;
        this.__updateRenderedView(prevParentView, unmaskedContext, transaction);
    }

    transaction.queue.enqueue(function onUpdate() {
        component.__mountState = componentState.UPDATED;
        if (component.componentDidUpdate) {
            component.componentDidUpdate(prevProps, prevChildren, prevState, prevContext);
        }
        component.__mountState = componentState.MOUNTED;
    });
};

NodePrototype.__updateRenderedNode = function(context, transaction) {
    var prevNode = this.renderedNode,
        prevRenderedView = prevNode.currentView,
        nextRenderedView = this.renderView(),
        renderedNode;

    if (shouldUpdate(prevRenderedView, nextRenderedView)) {
        prevNode.receiveView(nextRenderedView, this.__processChildContext(context), transaction);
    } else {
        prevNode.__unmount(transaction);

        renderedNode = this.renderedNode = new Node(this.parentId, this.id, nextRenderedView);
        renderedNode.root = this.root;
        renderedNode.isBottomLevel = false;

        transaction.replace(this.parentId, this.id, 0, renderedNode.__mount(transaction));
    }

    this.__attachRefs();
};

NodePrototype.__updateRenderedView = function(prevRenderedView, context, transaction) {
    var id = this.id,
        root = this.root,
        nextRenderedView = this.renderView(),
        propsDiff = root.diffProps(id, root.eventManager, transaction, prevRenderedView.props, nextRenderedView.props);

    if (propsDiff !== null) {
        transaction.props(id, prevRenderedView.props, propsDiff);
    }

    diffChildren(this, prevRenderedView, nextRenderedView, transaction);
};

NodePrototype.renderView = function() {
    var currentView = this.currentView,
        previousContext = context.current,
        renderedView;

    context.current = this.__processChildContext(currentView.__context);
    owner.current = this.component;

    renderedView = this.component.render();

    renderedView.ref = currentView.ref;
    renderedView.key = currentView.key;

    context.current = previousContext;
    owner.current = null;

    return renderedView;
};

function warnError(error) {
    var i, il;

    if (isArray(error)) {
        i = -1;
        il = error.length - 1;
        while (i++ < il) {
            warnError(error[i]);
        }
    } else {
        console.warn(error);
    }
}

NodePrototype.__checkTypes = function(propTypes, props) {
    var localHas = has,
        displayName = this.__getName(),
        propName, error;

    if (propTypes) {
        for (propName in propTypes) {
            if (localHas(propTypes, propName)) {
                error = propTypes[propName](props, propName, displayName);
                if (error) {
                    warnError(error);
                }
            }
        }
    }
};

NodePrototype.__processProps = function(props) {
    var ComponentClass = this.ComponentClass,
        propTypes;

    if (process.env.NODE_ENV !== "production") {
        propTypes = ComponentClass.propTypes;

        if (propTypes) {
            this.__checkTypes(propTypes, props);
        }
    }

    return props;
};

NodePrototype.__maskContext = function(context) {
    var maskedContext = null,
        contextTypes, contextName, localHas;

    if (isString(this.ComponentClass)) {
        return emptyObject;
    } else {
        contextTypes = this.ComponentClass.contextTypes;

        if (contextTypes) {
            maskedContext = {};
            localHas = has;

            for (contextName in contextTypes) {
                if (localHas(contextTypes, contextName)) {
                    maskedContext[contextName] = context[contextName];
                }
            }
        }

        return maskedContext;
    }
};

NodePrototype.__processContext = function(context) {
    var maskedContext = this.__maskContext(context),
        contextTypes;

    if (process.env.NODE_ENV !== "production") {
        contextTypes = this.ComponentClass.contextTypes;

        if (contextTypes) {
            this.__checkTypes(contextTypes, maskedContext);
        }
    }

    return maskedContext;
};

NodePrototype.__processChildContext = function(currentContext) {
    var component = this.component,
        childContext = isFunction(component.getChildContext) ? component.getChildContext() : null,
        childContextTypes, localHas, contextName, displayName;

    if (childContext) {
        childContextTypes = this.ComponentClass.childContextTypes;

        if (process.env.NODE_ENV !== "production") {
            if (childContextTypes) {
                this.__checkTypes(childContextTypes, childContext);
            }
        }

        if (childContextTypes) {
            localHas = has;
            displayName = this.__getName();

            for (contextName in childContext) {
                if (!localHas(childContextTypes, contextName)) {
                    console.warn(new Error(
                        displayName + " getChildContext(): key " + contextName + " is not defined in childContextTypes"
                    ));
                }
            }
        }

        return extend({}, currentContext, childContext);
    } else {
        return currentContext;
    }
};

NodePrototype.__attachRefs = function() {
    var view = this.currentView,
        ref = view.ref;

    if (isString(ref)) {
        attachRef(this.component, ref, view.__owner);
    }
};

NodePrototype.__detachRefs = function() {
    var view = this.currentView,
        ref = view.ref;

    if (isString(ref)) {
        detachRef(ref, view.__owner);
    }
};

NodePrototype.__getName = function() {
    var type = this.currentView.type,
        constructor;

    if (isString(type)) {
        return type;
    } else {
        constructor = this.component && this.component.constructor;
        return type.displayName || (constructor && constructor.displayName) || null;
    }
};

function attachRef(component, ref, owner) {
    if (isString(ref)) {
        if (owner) {
            owner.refs[ref] = component;
        } else {
            throw new Error("cannot add ref to view without owner");
        }

    }
}

function detachRef(ref, owner) {
    var refs = owner.refs;
    delete refs[ref];
}

function mountEvents(id, props, eventManager, transaction) {
    var propNameToTopLevel = eventManager.propNameToTopLevel,
        localHas = has,
        key;

    for (key in props) {
        if (localHas(propNameToTopLevel, key)) {
            eventManager.on(id, propNameToTopLevel[key], props[key], transaction);
        }
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/create_pool/src/index.js */

var isFunction = require(19),
    isNumber = require(24),
    defineProperty = require(58);


var descriptor = {
    configurable: false,
    enumerable: false,
    writable: false,
    value: null
};


module.exports = createPool;


function createPool(Constructor, poolSize) {

    addProperty(Constructor, "instancePool", []);
    addProperty(Constructor, "getPooled", createPooler(Constructor));
    addProperty(Constructor, "release", createReleaser(Constructor));

    poolSize = poolSize || Constructor.poolSize;
    Constructor.poolSize = isNumber(poolSize) ? (poolSize < -1 ? -1 : poolSize) : -1;

    return Constructor;
}

function addProperty(object, name, value) {
    descriptor.value = value;
    defineProperty(object, name, descriptor);
    descriptor.value = null;
}

function createPooler(Constructor) {
    switch (Constructor.length) {
        case 0:
            return createNoArgumentPooler(Constructor);
        case 1:
            return createOneArgumentPooler(Constructor);
        case 2:
            return createTwoArgumentsPooler(Constructor);
        case 3:
            return createThreeArgumentsPooler(Constructor);
        case 4:
            return createFourArgumentsPooler(Constructor);
        case 5:
            return createFiveArgumentsPooler(Constructor);
        default:
            return createApplyPooler(Constructor);
    }
}

function createNoArgumentPooler(Constructor) {
    return function pooler() {
        var instancePool = Constructor.instancePool,
            instance;

        if (instancePool.length) {
            instance = instancePool.pop();
            return instance;
        } else {
            return new Constructor();
        }
    };
}

function createOneArgumentPooler(Constructor) {
    return function pooler(a0) {
        var instancePool = Constructor.instancePool,
            instance;

        if (instancePool.length) {
            instance = instancePool.pop();
            Constructor.call(instance, a0);
            return instance;
        } else {
            return new Constructor(a0);
        }
    };
}

function createTwoArgumentsPooler(Constructor) {
    return function pooler(a0, a1) {
        var instancePool = Constructor.instancePool,
            instance;

        if (instancePool.length) {
            instance = instancePool.pop();
            Constructor.call(instance, a0, a1);
            return instance;
        } else {
            return new Constructor(a0, a1);
        }
    };
}

function createThreeArgumentsPooler(Constructor) {
    return function pooler(a0, a1, a2) {
        var instancePool = Constructor.instancePool,
            instance;

        if (instancePool.length) {
            instance = instancePool.pop();
            Constructor.call(instance, a0, a1, a2);
            return instance;
        } else {
            return new Constructor(a0, a1, a2);
        }
    };
}

function createFourArgumentsPooler(Constructor) {
    return function pooler(a0, a1, a2, a3) {
        var instancePool = Constructor.instancePool,
            instance;

        if (instancePool.length) {
            instance = instancePool.pop();
            Constructor.call(instance, a0, a1, a2, a3);
            return instance;
        } else {
            return new Constructor(a0, a1, a2, a3);
        }
    };
}

function createFiveArgumentsPooler(Constructor) {
    return function pooler(a0, a1, a2, a3, a4) {
        var instancePool = Constructor.instancePool,
            instance;

        if (instancePool.length) {
            instance = instancePool.pop();
            Constructor.call(instance, a0, a1, a2, a3, a4);
            return instance;
        } else {
            return new Constructor(a0, a1, a2, a3, a4);
        }
    };
}

function createApplyConstructor(Constructor) {
    function F(args) {
        return Constructor.apply(this, args);
    }
    F.prototype = Constructor.prototype;

    return function applyConstructor(args) {
        return new F(args);
    };
}

function createApplyPooler(Constructor) {
    var applyConstructor = createApplyConstructor(Constructor);

    return function pooler() {
        var instancePool = Constructor.instancePool,
            instance;

        if (instancePool.length) {
            instance = instancePool.pop();
            Constructor.apply(instance, arguments);
            return instance;
        } else {
            return applyConstructor(arguments);
        }
    };
}

function createReleaser(Constructor) {
    return function releaser(instance) {
        var instancePool = Constructor.instancePool;

        if (isFunction(instance.destructor)) {
            instance.destructor();
        }
        if (Constructor.poolSize === -1 || instancePool.length < Constructor.poolSize) {
            instancePool[instancePool.length] = instance;
        }
    };
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/queue/src/index.js */

var createPool = require(48);


module.exports = Queue;


function Queue() {
    this.__callbacks = [];
}

createPool(Queue);

Queue.prototype.enqueue = function(callback) {
    var callbacks = this.__callbacks;
    callbacks[callbacks.length] = callback;
    return this;
};

Queue.prototype.notifyAll = function() {
    var callbacks = this.__callbacks,
        i = -1,
        il = callbacks.length - 1;

    while (i++ < il) {
        callbacks[i]();
    }
    callbacks.length = 0;

    return this;
};

Queue.prototype.destructor = function() {
    this.__callbacks.length = 0;
    return this;
};

Queue.prototype.reset = Queue.prototype.destructor;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/Transaction/InsertPatch.js */

var createPool = require(48),
    consts = require(10);


var InsertPatchPrototype;


module.exports = InsertPatch;


function InsertPatch() {
    this.type = consts.INSERT;
    this.id = null;
    this.childId = null;
    this.index = null;
    this.next = null;
}
createPool(InsertPatch);
InsertPatchPrototype = InsertPatch.prototype;

InsertPatch.create = function(id, childId, index, next) {
    var patch = InsertPatch.getPooled();
    patch.id = id;
    patch.childId = childId;
    patch.index = index;
    patch.next = next;
    return patch;
};

InsertPatchPrototype.destructor = function() {
    this.id = null;
    this.childId = null;
    this.index = null;
    this.next = null;
    return this;
};

InsertPatchPrototype.destroy = function() {
    return InsertPatch.release(this);
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/Transaction/MountPatch.js */

var createPool = require(48),
    consts = require(10);


var MountPatchPrototype;


module.exports = MountPatch;


function MountPatch() {
    this.type = consts.MOUNT;
    this.id = null;
    this.next = null;
}
createPool(MountPatch);
MountPatchPrototype = MountPatch.prototype;

MountPatch.create = function(id, next) {
    var patch = MountPatch.getPooled();
    patch.id = id;
    patch.next = next;
    return patch;
};

MountPatchPrototype.destructor = function() {
    this.id = null;
    this.next = null;
    return this;
};

MountPatchPrototype.destroy = function() {
    return MountPatch.release(this);
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/Transaction/UnmountPatch.js */

var createPool = require(48),
    consts = require(10);


var UnmountPatchPrototype;


module.exports = UnmountPatch;


function UnmountPatch() {
    this.type = consts.UNMOUNT;
    this.id = null;
}
createPool(UnmountPatch);
UnmountPatchPrototype = UnmountPatch.prototype;

UnmountPatch.create = function(id) {
    var patch = UnmountPatch.getPooled();
    patch.id = id;
    return patch;
};

UnmountPatchPrototype.destructor = function() {
    this.id = null;
    return this;
};

UnmountPatchPrototype.destroy = function() {
    return UnmountPatch.release(this);
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/Transaction/OrderPatch.js */

var createPool = require(48),
    consts = require(10);


var OrderPatchPrototype;


module.exports = OrderPatch;


function OrderPatch() {
    this.type = consts.ORDER;
    this.id = null;
    this.order = null;
}
createPool(OrderPatch);
OrderPatchPrototype = OrderPatch.prototype;

OrderPatch.create = function(id, order) {
    var patch = OrderPatch.getPooled();
    patch.id = id;
    patch.order = order;
    return patch;
};

OrderPatchPrototype.destructor = function() {
    this.id = null;
    this.order = null;
    return this;
};

OrderPatchPrototype.destroy = function() {
    return OrderPatch.release(this);
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/Transaction/PropsPatch.js */

var createPool = require(48),
    consts = require(10);


var PropsPatchPrototype;


module.exports = PropsPatch;


function PropsPatch() {
    this.type = consts.PROPS;
    this.id = null;
    this.previous = null;
    this.next = null;
}
createPool(PropsPatch);
PropsPatchPrototype = PropsPatch.prototype;

PropsPatch.create = function(id, previous, next) {
    var patch = PropsPatch.getPooled();
    patch.id = id;
    patch.previous = previous;
    patch.next = next;
    return patch;
};

PropsPatchPrototype.destructor = function() {
    this.id = null;
    this.previous = null;
    this.next = null;
    return this;
};

PropsPatchPrototype.destroy = function() {
    return PropsPatch.release(this);
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/Transaction/RemovePatch.js */

var createPool = require(48),
    consts = require(10);


var RemovePatchPrototype;


module.exports = RemovePatch;


function RemovePatch() {
    this.type = consts.REMOVE;
    this.id = null;
    this.childId = null;
    this.index = null;
}
createPool(RemovePatch);
RemovePatchPrototype = RemovePatch.prototype;

RemovePatch.create = function(id, childId, index) {
    var patch = RemovePatch.getPooled();
    patch.id = id;
    patch.childId = childId;
    patch.index = index;
    return patch;
};

RemovePatchPrototype.destructor = function() {
    this.id = null;
    this.childId = null;
    this.index = null;
    return this;
};

RemovePatchPrototype.destroy = function() {
    return RemovePatch.release(this);
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/Transaction/ReplacePatch.js */

var createPool = require(48),
    consts = require(10);


var ReplacePatchPrototype;


module.exports = ReplacePatch;


function ReplacePatch() {
    this.type = consts.REPLACE;
    this.id = null;
    this.childId = null;
    this.index = null;
    this.next = null;
}
createPool(ReplacePatch);
ReplacePatchPrototype = ReplacePatch.prototype;

ReplacePatch.create = function(id, childId, index, next) {
    var patch = ReplacePatch.getPooled();
    patch.id = id;
    patch.childId = childId;
    patch.index = index;
    patch.next = next;
    return patch;
};

ReplacePatchPrototype.destructor = function() {
    this.id = null;
    this.childId = null;
    this.index = null;
    this.next = null;
    return this;
};

ReplacePatchPrototype.destroy = function() {
    return ReplacePatch.release(this);
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/Transaction/TextPatch.js */

var createPool = require(48),
    propsToJSON = require(28),
    consts = require(10);


var TextPatchPrototype;


module.exports = TextPatch;


function TextPatch() {
    this.type = consts.TEXT;
    this.id = null;
    this.index = null;
    this.next = null;
    this.props = null;
}
createPool(TextPatch);
TextPatchPrototype = TextPatch.prototype;

TextPatch.create = function(id, index, next, props) {
    var patch = TextPatch.getPooled();
    patch.id = id;
    patch.index = index;
    patch.next = next;
    patch.props = props;
    return patch;
};

TextPatchPrototype.destructor = function() {
    this.id = null;
    this.index = null;
    this.next = null;
    this.props = null;
    return this;
};

TextPatchPrototype.destroy = function() {
    return TextPatch.release(this);
};

TextPatchPrototype.toJSON = function() {
    return {
        type: this.type,
        id: this.id,
        index: this.index,
        next: this.next,
        props: propsToJSON(this.props)
    };
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/define_property/src/index.js */

var isObject = require(33),
    isFunction = require(19),
    isPrimitive = require(18),
    isNative = require(31),
    has = require(25);


var nativeDefineProperty = Object.defineProperty;


module.exports = defineProperty;


function defineProperty(object, name, descriptor) {
    if (isPrimitive(descriptor) || isFunction(descriptor)) {
        descriptor = {
            value: descriptor
        };
    }
    return nativeDefineProperty(object, name, descriptor);
}

defineProperty.hasGettersSetters = true;

if (!isNative(nativeDefineProperty) || !(function() {
        var object = {},
            value = {};

        try {
            nativeDefineProperty(object, "key", {
                value: value
            });
            if (has(object, "key") && object.key === value) {
                return true;
            } else {
                return false;
            }
        } catch (e) {}

        return false;
    }())) {

    defineProperty.hasGettersSetters = false;

    nativeDefineProperty = function defineProperty(object, name, descriptor) {
        if (!isObject(object)) {
            throw new TypeError("defineProperty(object, name, descriptor) called on non-object");
        }
        if (has(descriptor, "get") || has(descriptor, "set")) {
            throw new TypeError("defineProperty(object, name, descriptor) this environment does not support getters or setters");
        }
        object[name] = descriptor.value;
    };
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/key_mirror/src/index.js */

var keys = require(41),
    isArrayLike = require(37);


module.exports = keyMirror;


function keyMirror(object) {
    return isArrayLike(object) ? keyMirrorArray(object) : keyMirrorObject(Object(object));
}

function keyMirrorArray(array) {
    var i = array.length,
        results = {},
        key;

    while (i--) {
        key = array[i];
        results[key] = array[i];
    }

    return results;
}

function keyMirrorObject(object) {
    var objectKeys = keys(object),
        i = -1,
        il = objectKeys.length - 1,
        results = {},
        key;

    while (i++ < il) {
        key = objectKeys[i];
        results[key] = key;
    }

    return results;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/process/browser.js */

// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/index_of/src/index.js */

var isEqual = require(66);


module.exports = indexOf;


function indexOf(array, value, fromIndex) {
    var i = (fromIndex || 0) - 1,
        il = array.length - 1;

    while (i++ < il) {
        if (isEqual(array[i], value)) {
            return i;
        }
    }

    return -1;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/utils/componentState.js */

var keyMirror = require(59);


module.exports = keyMirror([
    "MOUNTING",
    "MOUNTED",
    "UPDATING",
    "UPDATED",
    "UNMOUNTING",
    "UNMOUNTED"
]);


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/utils/getComponentClassForType.js */

var createNativeComponentForType = require(67);


module.exports = getComponentClassForType;


function getComponentClassForType(type, rootNativeComponents) {
    var Class = rootNativeComponents[type];

    if (Class) {
        return Class;
    } else {
        Class = createNativeComponentForType(type);
        rootNativeComponents[type] = Class;
        return Class;
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/utils/emptyObject.js */




},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/utils/diffChildren.js */

var isNullOrUndefined = require(23),
    getChildKey = require(11),
    shouldUpdate = require(45),
    View = require(7),
    Node;


var isPrimitiveView = View.isPrimitiveView;


module.exports = diffChildren;


Node = require(47);


function diffChildren(node, previous, next, transaction) {
    var root = node.root,
        previousChildren = previous.children,
        nextChildren = reorder(previousChildren, next.children),
        previousLength = previousChildren.length,
        nextLength = nextChildren.length,
        parentId = node.id,
        i = -1,
        il = (previousLength > nextLength ? previousLength : nextLength) - 1;

    while (i++ < il) {
        diffChild(root, node, previous, next, previousChildren[i], nextChildren[i], parentId, i, transaction);
    }

    if (nextChildren.moves) {
        transaction.order(parentId, nextChildren.moves);
    }
}

function diffChild(root, parentNode, previous, next, previousChild, nextChild, parentId, index, transaction) {
    var node, id;

    if (previousChild !== nextChild) {
        if (isNullOrUndefined(previousChild)) {
            if (isPrimitiveView(nextChild)) {
                transaction.insert(parentId, null, index, nextChild);
            } else {
                id = getChildKey(parentId, nextChild, index);
                node = new Node(parentId, id, nextChild);
                parentNode.appendNode(node);
                transaction.insert(parentId, id, index, node.__mount(transaction));
            }
        } else if (isPrimitiveView(previousChild)) {
            if (isNullOrUndefined(nextChild)) {
                transaction.remove(parentId, null, index);
            } else if (isPrimitiveView(nextChild)) {
                transaction.text(parentId, index, nextChild, next.props);
            } else {
                id = getChildKey(parentId, nextChild, index);
                node = new Node(parentId, id, nextChild);
                parentNode.appendNode(node);
                transaction.replace(parentId, id, index, node.__mount(transaction));
            }
        } else {
            if (isNullOrUndefined(nextChild)) {
                id = getChildKey(parentId, previousChild, index);
                node = root.childHash[id];
                if (node) {
                    node.unmount(transaction);
                    parentNode.removeNode(node);
                }
            } else if (isPrimitiveView(nextChild)) {
                transaction.replace(parentId, null, index, nextChild);
            } else {
                id = getChildKey(parentId, previousChild, index);
                node = root.childHash[id];

                if (node) {
                    if (shouldUpdate(previousChild, nextChild)) {
                        node.update(nextChild, transaction);
                    } else {
                        node.__unmount(transaction);
                        parentNode.removeNode(node);

                        id = getChildKey(parentId, nextChild, index);
                        node = new Node(parentId, id, nextChild);
                        parentNode.appendNode(node);
                        transaction.replace(parentId, id, index, node.__mount(transaction));
                    }
                } else {
                    id = getChildKey(parentId, nextChild, index);
                    node = new Node(parentId, id, nextChild);
                    parentNode.appendNode(node);
                    transaction.insert(parentId, id, index, node.__mount(transaction));
                }
            }
        }
    }
}

function reorder(previousChildren, nextChildren) {
    var previousKeys, nextKeys, previousMatch, nextMatch, key, previousLength, nextLength,
        length, shuffle, freeIndex, i, moveIndex, moves, removes, reverse, hasMoves, move, freeChild;

    nextKeys = keyIndex(nextChildren);
    if (nextKeys === null) {
        return nextChildren;
    }

    previousKeys = keyIndex(previousChildren);
    if (previousKeys === null) {
        return nextChildren;
    }

    nextMatch = {};
    previousMatch = {};

    for (key in nextKeys) {
        nextMatch[nextKeys[key]] = previousKeys[key];
    }

    for (key in previousKeys) {
        previousMatch[previousKeys[key]] = nextKeys[key];
    }

    previousLength = previousChildren.length;
    nextLength = nextChildren.length;
    length = previousLength > nextLength ? previousLength : nextLength;
    shuffle = [];
    freeIndex = 0;
    i = 0;
    moveIndex = 0;
    moves = {};
    removes = moves.removes = {};
    reverse = moves.reverse = {};
    hasMoves = false;

    while (freeIndex < length) {
        move = previousMatch[i];

        if (move !== undefined) {
            shuffle[i] = nextChildren[move];

            if (move !== moveIndex) {
                moves[move] = moveIndex;
                reverse[moveIndex] = move;
                hasMoves = true;
            }

            moveIndex++;
        } else if (i in previousMatch) {
            shuffle[i] = undefined;
            removes[i] = moveIndex++;
            hasMoves = true;
        } else {
            while (nextMatch[freeIndex] !== undefined) {
                freeIndex++;
            }

            if (freeIndex < length) {
                freeChild = nextChildren[freeIndex];

                if (freeChild) {
                    shuffle[i] = freeChild;
                    if (freeIndex !== moveIndex) {
                        hasMoves = true;
                        moves[freeIndex] = moveIndex;
                        reverse[moveIndex] = freeIndex;
                    }
                    moveIndex++;
                }
                freeIndex++;
            }
        }
        i++;
    }

    if (hasMoves) {
        shuffle.moves = moves;
    }

    return shuffle;
}

function keyIndex(children) {
    var i = -1,
        il = children.length - 1,
        keys = null,
        child;

    while (i++ < il) {
        child = children[i];

        if (!isNullOrUndefined(child.key)) {
            keys = keys || {};
            keys[child.key] = i;
        }
    }

    return keys;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_equal/src/index.js */

module.exports = isEqual;


function isEqual(a, b) {
    return !(a !== b && !(a !== a && b !== b));
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/utils/createNativeComponentForType.js */

var View = require(7),
    Component = require(9);


module.exports = createNativeComponentForType;


function createNativeComponentForType(type) {

    function NativeComponent(props, children) {
        Component.call(this, props, children);
    }
    Component.extend(NativeComponent, type);

    NativeComponent.prototype.render = function() {
        return new View(type, null, null, this.props, this.children, null, null);
    };

    return NativeComponent;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/inherits/src/index.js */

var create = require(69),
    extend = require(27),
    mixin = require(70),
    defineProperty = require(58);


var descriptor = {
    configurable: true,
    enumerable: false,
    writable: true,
    value: null
};


module.exports = inherits;


function inherits(child, parent) {

    mixin(child, parent);

    if (child.__super) {
        child.prototype = extend(create(parent.prototype), child.__super, child.prototype);
    } else {
        child.prototype = extend(create(parent.prototype), child.prototype);
    }

    defineNonEnumerableProperty(child, "__super", parent.prototype);
    defineNonEnumerableProperty(child.prototype, "constructor", child);

    child.defineStatic = defineStatic;
    child.super_ = parent;

    return child;
}
inherits.defineProperty = defineNonEnumerableProperty;

function defineNonEnumerableProperty(object, name, value) {
    descriptor.value = value;
    defineProperty(object, name, descriptor);
    descriptor.value = null;
}

function defineStatic(name, value) {
    defineNonEnumerableProperty(this, name, value);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/create/src/index.js */

var isNull = require(29),
    isNative = require(31),
    isPrimitive = require(18);


var nativeCreate = Object.create;


module.exports = create;


function create(object) {
    return nativeCreate(isPrimitive(object) ? null : object);
}

if (!isNative(nativeCreate)) {
    nativeCreate = function nativeCreate(object) {
        var newObject;

        function F() {
            this.constructor = F;
        }

        if (isNull(object)) {
            newObject = new F();
            newObject.constructor = newObject.__proto__ = null;
            delete newObject.__proto__;
            return newObject;
        } else {
            F.prototype = object;
            return new F();
        }
    };
}


module.exports = create;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/mixin/src/index.js */

var keys = require(41),
    isNullOrUndefined = require(23);


module.exports = mixin;


function mixin(out) {
    var i = 0,
        il = arguments.length - 1;

    while (i++ < il) {
        baseMixin(out, arguments[i]);
    }

    return out;
}

function baseMixin(a, b) {
    var objectKeys = keys(b),
        i = -1,
        il = objectKeys.length - 1,
        key, value;

    while (i++ < il) {
        key = objectKeys[i];

        if (isNullOrUndefined(a[key]) && !isNullOrUndefined((value = b[key]))) {
            a[key] = value;
        }
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/utils/getViewKey.js */

var isNullOrUndefined = require(23);


var reEscape = /[=.:]/g;


module.exports = getViewKey;


function getViewKey(view, index) {
    var key = view.key;

    if (isNullOrUndefined(key)) {
        return index.toString(36);
    } else {
        return "$" + escapeKey(key);
    }
}

function escapeKey(key) {
    return (key + "").replace(reEscape, "$");
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/utils/traversePath.js */

var isBoundary = require(73),
    isAncestorIdOf = require(74);


module.exports = traversePath;


function traversePath(start, stop, callback, skipFirst, skipLast) {
    var traverseUp = isAncestorIdOf(stop, start),
        traverse = traverseUp ? getParentID : getNextDescendantID,
        id = start,
        ret;

    while (true) {
        if ((!skipFirst || id !== start) && (!skipLast || id !== stop)) {
            ret = callback(id, traverseUp);
        }
        if (ret === false || id === stop) {
            break;
        }

        id = traverse(id, stop);
    }
}

function getNextDescendantID(ancestorID, destinationID) {
    var start, i, il;

    if (ancestorID === destinationID) {
        return ancestorID;
    } else {
        start = ancestorID.length + 1;
        i = start - 1;
        il = destinationID.length - 1;

        while (i++ < il) {
            if (isBoundary(destinationID, i)) {
                break;
            }
        }

        return destinationID.substr(0, i);
    }
}

function getParentID(id) {
    return id ? id.substr(0, id.lastIndexOf(".")) : "";
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/utils/isBoundary.js */

module.exports = isBoundary;


function isBoundary(id, index) {
    return id.charAt(index) === "." || index === id.length;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt/src/utils/isAncestorIdOf.js */

var isBoundary = require(73);


module.exports = isAncestorIdOf;


function isAncestorIdOf(ancestorID, descendantID) {
    return (
        descendantID.indexOf(ancestorID) === 0 &&
        isBoundary(descendantID, ancestorID.length)
    );
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/utils/renderString.js */

var virt = require(1),

    isFunction = require(19),
    isString = require(21),
    isObject = require(33),
    isNullOrUndefined = require(23),

    hyphenateStyleName = require(87),
    renderMarkup = require(88),
    DOM_ID_NAME = require(89);


var View = virt.View,
    isPrimitiveView = View.isPrimitiveView,

    closedTags = {
        area: true,
        base: true,
        br: true,
        col: true,
        command: true,
        embed: true,
        hr: true,
        img: true,
        input: true,
        keygen: true,
        link: true,
        meta: true,
        param: true,
        source: true,
        track: true,
        wbr: true
    };


module.exports = render;


var renderChildrenString = require(90);


function render(view, parentProps, id) {
    var type, props;

    if (isPrimitiveView(view)) {
        return isString(view) ? renderMarkup(view, parentProps) : view + "";
    } else {
        type = view.type;
        props = view.props;

        return (
            closedTags[type] !== true ?
            contentTag(type, renderChildrenString(view.children, props, id), id, props) :
            closedTag(type, id, view.props)
        );
    }
}

function styleTag(props) {
    var attributes = "",
        key;

    for (key in props) {
        attributes += hyphenateStyleName(key) + ':' + props[key] + ';';
    }

    return attributes;
}

function baseTagOptions(props) {
    var attributes = "",
        key, value;

    for (key in props) {
        if (key !== "dangerouslySetInnerHTML") {
            value = props[key];

            if (!isNullOrUndefined(value) && !isFunction(value)) {
                if (key === "className") {
                    key = "class";
                }

                if (key === "style") {
                    attributes += 'style="' + styleTag(value) + '"';
                } else {
                    if (isObject(value)) {
                        attributes += baseTagOptions(value);
                    } else {
                        attributes += key + '="' + value + '" ';
                    }
                }
            }
        }
    }

    return attributes;
}

function tagOptions(id, props) {
    var attributes = baseTagOptions(props);
    return attributes !== "" ? " " + attributes : attributes;
}

function dataId(id) {
    return ' ' + DOM_ID_NAME + '="' + id + '"';
}

function closedTag(type, id, props) {
    return "<" + type + (isObject(props) ? tagOptions(id, props) : "") + dataId(id) + "/>";
}

function contentTag(type, content, id, props) {
    return (
        "<" + type + (isObject(props) ? tagOptions(id, props) : "") + dataId(id) + ">" +
        (isString(content) ? content : "") +
        "</" + type + ">"
    );
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/nativeDOM/components.js */

var components = exports;


components.button = require(92);
components.img = require(93);
components.input = require(94);
components.textarea = require(95);


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/nativeDOM/handlers.js */

var extend = require(27);


var handlers = extend({},
    require(96),
    require(97),
    require(98),
    require(99)
);


module.exports = handlers;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/render.js */

var virt = require(1),
    Adapter = require(115),
    rootsById = require(116),
    getRootNodeId = require(117);


var Root = virt.Root;


module.exports = render;


function render(nextView, containerDOMNode, callback) {
    var id = getRootNodeId(containerDOMNode),
        root;

    if (id === null || rootsById[id] === undefined) {
        root = new Root();
        root.adapter = new Adapter(root, containerDOMNode);
        id = root.id;
        rootsById[id] = root;
    } else {
        root = rootsById[id];
    }

    root.render(nextView, id, callback);

    return root;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/unmount.js */

var rootsById = require(116),
    getRootNodeInContainer = require(173),
    getNodeId = require(172);


module.exports = unmount;


function unmount(containerDOMNode) {
    var rootDOMNode = getRootNodeInContainer(containerDOMNode),
        id = getNodeId(rootDOMNode),
        root = rootsById[id];

    if (root !== undefined) {
        root.unmount();
        delete rootsById[id];
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/utils/findDOMNode.js */

var isString = require(21),
    getNodeById = require(108);


module.exports = findDOMNode;


function findDOMNode(value) {
    if (isString(value)) {
        return getNodeById(value);
    } else if (value && value.__node) {
        return getNodeById(value.__node.id);
    } else if (value && value.id) {
        return getNodeById(value.id);
    } else {
        return null;
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/utils/findRoot.js */

var virt = require(1),
    isString = require(21),
    rootsById = require(116);


var getRootIdFromId = virt.getRootIdFromId;


module.exports = findRoot;


function findRoot(value) {
    if (isString(value)) {
        return rootsById[getRootIdFromId(value)];
    } else {
        return null;
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/utils/findEventHandler.js */

var virt = require(1),
    isString = require(21),
    eventHandlersById = require(114);


var getRootIdFromId = virt.getRootIdFromId;


module.exports = findDOMNode;


function findDOMNode(value) {
    if (isString(value)) {
        return eventHandlersById[getRootIdFromId(value)];
    } else {
        return null;
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/worker/createWorkerRender.js */

var Messenger = require(118),
    MessengerWorkerAdapter = require(174),
    eventHandlersById = require(114),
    nativeDOMHandlers = require(77),
    eventHandlersById = require(114),
    getRootNodeId = require(117),
    registerNativeComponentHandlers = require(122),
    getWindow = require(120),
    nativeEventToJSON = require(146),
    EventHandler = require(123),
    applyEvents = require(125),
    applyPatches = require(126);


module.exports = createWorkerRender;


function createWorkerRender(url, containerDOMNode) {
    var document = containerDOMNode.ownerDocument,
        window = getWindow(document),

        eventHandler = new EventHandler(document, window),
        viewport = eventHandler.viewport,

        messenger = new Messenger(new MessengerWorkerAdapter(url)),

        rootId = null;

    messenger.on("virt.dom.handleTransaction", function handleTransaction(transaction, callback) {

        applyPatches(transaction.patches, containerDOMNode, document);
        applyEvents(transaction.events, eventHandler);
        applyPatches(transaction.removes, containerDOMNode, document);

        if (rootId === null) {
            rootId = getRootNodeId(containerDOMNode);
            eventHandlersById[rootId] = eventHandler;
        }

        callback();
    });

    eventHandler.handleDispatch = function(topLevelType, nativeEvent, targetId) {
        if (targetId) {
            nativeEvent.preventDefault();
        }

        messenger.emit("virt.dom.handleEventDispatch", {
            currentScrollLeft: viewport.currentScrollLeft,
            currentScrollTop: viewport.currentScrollTop,
            topLevelType: topLevelType,
            nativeEvent: nativeEventToJSON(nativeEvent),
            targetId: targetId
        });
    };

    eventHandler.handleResize = function handleDispatch(data) {
        messenger.emit("virt.resize", data);
    };

    messenger.on("virt.getDeviceDimensions", function getDeviceDimensions(data, callback) {
        callback(undefined, eventHandler.getDimensions());
    });

    registerNativeComponentHandlers(messenger, nativeDOMHandlers);

    return messenger;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/worker/renderWorker.js */

var virt = require(1),
    rootsById = require(116),
    WorkerAdapter = require(175);


var root = null;


module.exports = render;


function render(nextView, callback) {
    if (root === null) {
        root = new virt.Root();
        root.adapter = new WorkerAdapter(root);
        rootsById[root.id] = root;
    }

    root.render(nextView, callback);
}

render.unmount = function() {
    if (root !== null) {
        delete rootsById[root.id];
        root.unmount();
        root = null;
    }
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/websocket/createWebSocketRender.js */

var Messenger = require(118),
    MessengerWebSocketAdapter = require(176),
    eventHandlersById = require(114),
    getRootNodeId = require(117),
    nativeDOMHandlers = require(77),
    registerNativeComponentHandlers = require(122),
    getWindow = require(120),
    nativeEventToJSON = require(146),
    EventHandler = require(123),
    applyEvents = require(125),
    applyPatches = require(126);


module.exports = createWebSocketRender;


function createWebSocketRender(containerDOMNode, socket, attachMessage, sendMessage) {
    var document = containerDOMNode.ownerDocument,
        window = getWindow(document),

        eventHandler = new EventHandler(document, window),
        viewport = eventHandler.viewport,

        messenger = new Messenger(new MessengerWebSocketAdapter(socket, attachMessage, sendMessage)),

        rootId = null;

    messenger.on("virt.dom.handleTransaction", function handleTransaction(transaction, callback) {

        applyPatches(transaction.patches, containerDOMNode, document);
        applyEvents(transaction.events, eventHandler);
        applyPatches(transaction.removes, containerDOMNode, document);

        if (rootId === null) {
            rootId = getRootNodeId(containerDOMNode);
            eventHandlersById[rootId] = eventHandler;
        }

        callback();
    });

    eventHandler.handleDispatch = function(topLevelType, nativeEvent, targetId) {
        if (targetId) {
            nativeEvent.preventDefault();
        }

        messenger.emit("virt.dom.handleEventDispatch", {
            currentScrollLeft: viewport.currentScrollLeft,
            currentScrollTop: viewport.currentScrollTop,
            topLevelType: topLevelType,
            nativeEvent: nativeEventToJSON(nativeEvent),
            targetId: targetId
        });
    };

    eventHandler.handleResize = function handleDispatch(data) {
        messenger.emit("virt.resize", data);
    };

    messenger.on("virt.getDeviceDimensions", function getDeviceDimensions(data, callback) {
        callback(undefined, eventHandler.getDimensions());
    });

    registerNativeComponentHandlers(messenger, nativeDOMHandlers);

    return messenger;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/websocket/renderWebSocket.js */

var virt = require(1),
    rootsById = require(116),
    WebSocketAdapter = require(177);


module.exports = render;


function render(nextView, socket, attachMessage, sendMessage, callback) {
    var root = new virt.Root();
    root.adapter = new WebSocketAdapter(root, socket, attachMessage, sendMessage);
    rootsById[root.id] = root;
    root.render(nextView, callback);
    return root;
}

render.unmount = function(root) {
    if (root && rootsById[root.id]) {
        delete rootsById[root.id];
        root.unmount();
        root = null;
    }
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/utils/hyphenateStyleName.js */

var reUppercasePattern = /([A-Z])/g,
    reMS = /^ms-/;


module.exports = hyphenateStyleName;


function hyphenateStyleName(str) {
    return str.replace(reUppercasePattern, "-$1").toLowerCase().replace(reMS, "-ms-");
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/utils/renderMarkup.js */

var escapeTextContent = require(91);


module.exports = renderMarkup;


function renderMarkup(markup, props) {
    if (props && props.dangerouslySetInnerHTML !== true) {
        return escapeTextContent(markup);
    } else {
        return markup;
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/DOM_ID_NAME.js */

module.exports = "data-virtid";


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/utils/renderChildrenString.js */

var virt = require(1);


var getChildKey = virt.getChildKey;


module.exports = renderChildrenString;


var renderString = require(75);


function renderChildrenString(children, parentProps, id) {
    var out = "",
        i = -1,
        il = children.length - 1,
        child;

    while (i++ < il) {
        child = children[i];
        out += renderString(child, parentProps, getChildKey(id, child, i));
    }

    return out;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/escape_text_content/src/index.js */

var reEscape = /[&><"']/g;


module.exports = escapeTextContent;


function escapeTextContent(text) {
    return (text + "").replace(reEscape, escaper);
}

function escaper(match) {
    switch (match) {
        case "&":
            return "&amp;";
        case ">":
            return "&gt;";
        case "<":
            return "&lt;";
        case "\"":
            return "&quot;";
        case "'":
            return "&#x27;";
        default:
            return match;
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/nativeDOM/Button.js */

var virt = require(1),
    indexOf = require(61),
    has = require(25);


var View = virt.View,
    Component = virt.Component,

    mouseListenerNames = [
        "onClick",
        "onDoubleClick",
        "onMouseDown",
        "onMouseMove",
        "onMouseUp"
    ],

    ButtonPrototype;


module.exports = Button;


function Button(props, children, context) {
    var _this = this;

    Component.call(this, props, children, context);

    this.focus = function(e) {
        return _this.__focus(e);
    };
    this.blur = function(e) {
        return _this.__blur(e);
    };
}
Component.extend(Button, "button");
ButtonPrototype = Button.prototype;

ButtonPrototype.componentDidMount = function() {
    if (this.props.autoFocus) {
        this.__focus();
    }
};

ButtonPrototype.__focus = function(callback) {
    this.emitMessage("virt.dom.Button.focus", {
        id: this.getInternalId()
    }, callback);
};

ButtonPrototype.__blur = function(callback) {
    this.emitMessage("virt.dom.Button.blur", {
        id: this.getInternalId()
    }, callback);
};

ButtonPrototype.__getRenderProps = function() {
    var props = this.props,
        localHas = has,
        renderProps = {},
        key;

    if (props.disabled) {
        for (key in props) {
            if (localHas(props, key) && indexOf(mouseListenerNames, key) === -1) {
                renderProps[key] = props[key];
            }
        }

        renderProps.disabled = true;
    } else {
        for (key in props) {
            if (localHas(props, key) && key !== "disabled") {
                renderProps[key] = props[key];
            }
        }
    }

    return renderProps;
};

ButtonPrototype.render = function() {
    return new View("button", null, null, this.__getRenderProps(), this.children, null, null);
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/nativeDOM/Image.js */

var process = require(60);
var virt = require(1),
    has = require(25),
    extend = require(27),
    emptyFunction = require(42);


var View = virt.View,
    Component = virt.Component,
    ImagePrototype;


module.exports = Image;


function Image(props, children, context) {
    if (process.env.NODE_ENV !== "production") {
        if (children.length > 0) {
            throw new Error("Image: img can not have children");
        }
    }

    Component.call(this, props, children, context);

    this.__hasEvents = !!(props.onLoad || props.onError);
}
Component.extend(Image, "img");
ImagePrototype = Image.prototype;

ImagePrototype.componentDidMount = function() {
    this.emitMessage("virt.dom.Image.mount", {
        id: this.getInternalId(),
        src: this.props.src
    });
};

ImagePrototype.componentDidUpdate = function() {
    this.emitMessage("virt.dom.Image.setSrc", {
        id: this.getInternalId(),
        src: this.props.src
    });
};

ImagePrototype.__getRenderProps = function() {
    var props = this.props,
        localHas, renderProps, key;


    if (!this.__hasEvents || this.isMounted()) {
        return extend({
            onLoad: emptyFunction,
            onError: emptyFunction
        }, props);
    } else {
        localHas = has;
        renderProps = {
            onLoad: emptyFunction,
            onError: emptyFunction
        };

        for (key in props) {
            if (localHas(props, key) && key !== "src") {
                renderProps[key] = props[key];
            }
        }

        return renderProps;
    }
};

ImagePrototype.render = function() {
    return new View("img", null, null, this.__getRenderProps(), this.children, null, null);
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/nativeDOM/Input.js */

var process = require(60);
var virt = require(1),
    has = require(25),
    isFunction = require(19),
    isNullOrUndefined = require(23);


var View = virt.View,
    Component = virt.Component,
    InputPrototype;


module.exports = Input;


function Input(props, children, context) {
    var _this = this;

    if (process.env.NODE_ENV !== "production") {
        if (children.length > 0) {
            throw new Error("Input: input can't have children");
        }
    }

    Component.call(this, props, children, context);

    this.onInput = function(e) {
        return _this.__onInput(e);
    };
    this.onChange = function(e) {
        return _this.__onChange(e);
    };
    this.setChecked = function(checked, callback) {
        return _this.__setChecked(checked, callback);
    };
    this.getValue = function(callback) {
        return _this.__getValue(callback);
    };
    this.setValue = function(value, callback) {
        return _this.__setValue(value, callback);
    };
    this.getSelection = function(callback) {
        return _this.__getSelection(callback);
    };
    this.setSelection = function(start, end, callback) {
        return _this.__setSelection(start, end, callback);
    };
    this.focus = function(callback) {
        return _this.__focus(callback);
    };
    this.blur = function(callback) {
        return _this.__blur(callback);
    };

}
Component.extend(Input, "input");
InputPrototype = Input.prototype;

Input.getDefaultProps = function() {
    return {
        type: "text"
    };
};

InputPrototype.componentDidMount = function() {
    if (this.props.autoFocus) {
        this.__focus();
    }
};

InputPrototype.componentDidUpdate = function(previousProps) {
    var value = this.props.value,
        previousValue = previousProps.value;

    if (!isNullOrUndefined(value) && value === previousValue) {
        this.__setValue(value);
    }
};

InputPrototype.__onInput = function(e) {
    this.__onChange(e, true);
};

InputPrototype.__onChange = function(e, fromInput) {
    var props = this.props;

    if (fromInput && props.onInput) {
        props.onInput(e);
    }
    if (props.onChange) {
        props.onChange(e);
    }

    this.forceUpdate();
};

InputPrototype.__setChecked = function(checked, callback) {
    this.emitMessage("virt.dom.Input.setChecked", {
        id: this.getInternalId(),
        checked: !!checked
    }, callback);
};

InputPrototype.__getValue = function(callback) {
    this.emitMessage("virt.dom.Input.getValue", {
        id: this.getInternalId()
    }, callback);
};

InputPrototype.__setValue = function(value, callback) {
    this.emitMessage("virt.dom.Input.setValue", {
        id: this.getInternalId(),
        value: value
    }, callback);
};

InputPrototype.__getSelection = function(callback) {
    this.emitMessage("virt.dom.Input.getSelection", {
        id: this.getInternalId()
    }, callback);
};

InputPrototype.__setSelection = function(start, end, callback) {
    if (isFunction(end)) {
        callback = end;
        end = start;
    }
    this.emitMessage("virt.dom.Input.setSelection", {
        id: this.getInternalId(),
        start: start,
        end: end
    }, callback);
};

InputPrototype.__focus = function(callback) {
    this.emitMessage("virt.dom.Input.focus", {
        id: this.getInternalId()
    }, callback);
};

InputPrototype.__blur = function(callback) {
    this.emitMessage("virt.dom.Input.blur", {
        id: this.getInternalId()
    }, callback);
};

InputPrototype.__getRenderProps = function() {
    var props = this.props,

        value = props.value,
        checked = props.checked,

        defaultValue = props.defaultValue,

        initialValue = defaultValue != null ? defaultValue : null,
        initialChecked = props.defaultChecked || false,

        renderProps = {},

        key;

    for (key in props) {
        if (has(props, key) && key !== "checked") {
            renderProps[key] = props[key];
        }
    }

    if (checked != null ? checked : initialChecked) {
        renderProps.checked = true;
    }

    renderProps.defaultChecked = undefined;
    renderProps.defaultValue = undefined;
    renderProps.value = value != null ? value : initialValue;

    renderProps.onInput = this.onInput;
    renderProps.onChange = this.onChange;

    return renderProps;
};

InputPrototype.render = function() {
    return new View("input", null, null, this.__getRenderProps(), this.children, null, null);
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/nativeDOM/TextArea.js */

var process = require(60);
var virt = require(1),
    has = require(25),
    isFunction = require(19);


var View = virt.View,
    Component = virt.Component,
    TextAreaPrototype;


module.exports = TextArea;


function TextArea(props, children, context) {
    var _this = this;

    if (process.env.NODE_ENV !== "production") {
        if (children.length > 0) {
            throw new Error("TextArea: textarea can't have children, set prop.value instead");
        }
    }

    Component.call(this, props, children, context);

    this.onInput = function(e) {
        return _this.__onInput(e);
    };
    this.onChange = function(e) {
        return _this.__onChange(e);
    };
    this.getValue = function(callback) {
        return _this.__getValue(callback);
    };
    this.setValue = function(value, callback) {
        return _this.__setValue(value, callback);
    };
    this.getSelection = function(callback) {
        return _this.__getSelection(callback);
    };
    this.setSelection = function(start, end, callback) {
        return _this.__setSelection(start, end, callback);
    };
    this.focus = function(callback) {
        return _this.__focus(callback);
    };
    this.blur = function(callback) {
        return _this.__blur(callback);
    };
}
Component.extend(TextArea, "textarea");
TextAreaPrototype = TextArea.prototype;

TextAreaPrototype.componentDidMount = function() {
    if (this.props.autoFocus) {
        this.__focus();
    }
};

TextAreaPrototype.componentDidUpdate = function(previousProps) {
    var value = this.props.value,
        previousValue = previousProps.value;

    if (value != null && value === previousValue) {
        this.__setValue(value);
    }
};

TextAreaPrototype.__onInput = function(e) {
    this.__onChange(e, true);
};

TextAreaPrototype.__onChange = function(e, fromInput) {
    var props = this.props;

    if (fromInput && props.onInput) {
        props.onInput(e);
    }
    if (props.onChange) {
        props.onChange(e);
    }

    this.forceUpdate();
};

TextAreaPrototype.__getValue = function(callback) {
    this.emitMessage("virt.dom.TextArea.getValue", {
        id: this.getInternalId()
    }, callback);
};

TextAreaPrototype.__setValue = function(value, callback) {
    this.emitMessage("virt.dom.TextArea.setValue", {
        id: this.getInternalId(),
        value: value
    }, callback);
};

TextAreaPrototype.__getSelection = function(callback) {
    this.emitMessage("virt.dom.TextArea.getSelection", {
        id: this.getInternalId()
    }, callback);
};

TextAreaPrototype.__setSelection = function(start, end, callback) {
    if (isFunction(end)) {
        callback = end;
        end = start;
    }
    this.emitMessage("virt.dom.TextArea.setSelection", {
        id: this.getInternalId(),
        start: start,
        end: end
    }, callback);
};

TextAreaPrototype.__focus = function(callback) {
    this.emitMessage("virt.dom.TextArea.focus", {
        id: this.getInternalId()
    }, callback);
};

TextAreaPrototype.__blur = function(callback) {
    this.emitMessage("virt.dom.TextArea.blur", {
        id: this.getInternalId()
    }, callback);
};

TextAreaPrototype.__getRenderProps = function() {
    var props = this.props,

        value = props.value,
        defaultValue = props.defaultValue,
        initialValue = defaultValue != null ? defaultValue : null,

        renderProps = {},
        key;

    for (key in props) {
        if (has(props, key)) {
            renderProps[key] = props[key];
        }
    }

    renderProps.defaultValue = undefined;
    renderProps.value = value != null ? value : initialValue;

    renderProps.onChange = this.onChange;
    renderProps.onInput = this.onInput;

    return renderProps;
};

TextAreaPrototype.render = function() {
    return new View("textarea", null, null, this.__getRenderProps(), this.children, null, null);
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/nativeDOM/buttonHandlers.js */

var sharedHandlers = require(100);


var buttonHandlers = exports;


buttonHandlers["virt.dom.Button.focus"] = sharedHandlers.focus;
buttonHandlers["virt.dom.Button.blur"] = sharedHandlers.blur;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/nativeDOM/imageHandlers.js */

var consts = require(110),
    findEventHandler = require(82),
    findDOMNode = require(80);


var topLevelTypes = consts.topLevelTypes,
    topLevelToEvent = consts.topLevelToEvent,
    imageHandlers = exports;


imageHandlers["virt.dom.Image.mount"] = function(data, callback) {
    var id = data.id,
        eventHandler = findEventHandler(id),
        node = findDOMNode(id),
        src;

    if (eventHandler && node) {
        eventHandler.addBubbledEvent(topLevelTypes.topLoad, topLevelToEvent.topLoad, node);
        eventHandler.addBubbledEvent(topLevelTypes.topError, topLevelToEvent.topError, node);

        src = data.src;
        if (node.src !== src) {
            node.src = src;
        }

        callback();
    } else {
        callback(new Error("events(data, callback): No DOM node found with id " + data.id));
    }
};

imageHandlers["virt.dom.Image.setSrc"] = function(data, callback) {
    var id = data.id,
        node = findDOMNode(id),
        src;

    if (node) {
        src = data.src;

        if (node.src !== src) {
            node.src = src;
        }
        callback();
    } else {
        callback(new Error("events(data, callback): No DOM node found with id " + data.id));
    }
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/nativeDOM/inputHandlers.js */

var findDOMNode = require(80),
    sharedHandlers = require(100);


var inputHandlers = exports;


inputHandlers["virt.dom.Input.getValue"] = sharedHandlers.getValue;
inputHandlers["virt.dom.Input.setValue"] = sharedHandlers.setValue;
inputHandlers["virt.dom.Input.getSelection"] = sharedHandlers.getSelection;
inputHandlers["virt.dom.Input.setSelection"] = sharedHandlers.setSelection;
inputHandlers["virt.dom.Input.focus"] = sharedHandlers.focus;
inputHandlers["virt.dom.Input.blur"] = sharedHandlers.blur;


inputHandlers["virt.dom.Input.setChecked"] = function(data, callback) {
    var node = findDOMNode(data.id);

    if (node) {
        if (data.checked) {
            node.setAttribute("checked", true);
        } else {
            node.removeAttribute("checked");
        }
        callback();
    } else {
        callback(new Error("setChecked(value, callback): No DOM node found with id " + data.id));
    }
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/nativeDOM/textareaHandlers.js */

var sharedHandlers = require(100);


var textareaHandlers = exports;


textareaHandlers["virt.dom.TextArea.getValue"] = sharedHandlers.getValue;
textareaHandlers["virt.dom.TextArea.setValue"] = sharedHandlers.setValue;
textareaHandlers["virt.dom.TextArea.getSelection"] = sharedHandlers.getSelection;
textareaHandlers["virt.dom.TextArea.setSelection"] = sharedHandlers.setSelection;
textareaHandlers["virt.dom.TextArea.focus"] = sharedHandlers.focus;
textareaHandlers["virt.dom.TextArea.blur"] = sharedHandlers.blur;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/nativeDOM/sharedHandlers.js */

var domCaret = require(101),
    blurNode = require(102),
    focusNode = require(103),
    findDOMNode = require(80);


var sharedInputHandlers = exports;


sharedInputHandlers.getValue = function(data, callback) {
    var node = findDOMNode(data.id);

    if (node) {
        callback(undefined, node.value);
    } else {
        callback(new Error("getValue(callback): No DOM node found with id " + data.id));
    }
};

sharedInputHandlers.setValue = function(data, callback) {
    var node = findDOMNode(data.id);

    if (node) {
        node.value = data.value || "";
        callback();
    } else {
        callback(new Error("setValue(data, callback): No DOM node found with id " + data.id));
    }
};

sharedInputHandlers.getSelection = function(data, callback) {
    var node = findDOMNode(data.id);

    if (node) {
        callback(undefined, domCaret.get(node));
    } else {
        callback(new Error("getSelection(callback): No DOM node found with id " + data.id));
    }
};

sharedInputHandlers.setSelection = function(data, callback) {
    var node = findDOMNode(data.id);

    if (node) {
        domCaret.set(node, data.start, data.end);
        callback();
    } else {
        callback(new Error("setSelection(data, callback): No DOM node found with id " + data.id));
    }
};

sharedInputHandlers.focus = function(data, callback) {
    var node = findDOMNode(data.id);

    if (node) {
        focusNode(node);
        callback();
    } else {
        callback(new Error("focus(callback): No DOM node found with id " + data.id));
    }
};

sharedInputHandlers.blur = function(data, callback) {
    var node = findDOMNode(data.id);

    if (node) {
        blurNode(node);
        callback();
    } else {
        callback(new Error("blur(callback): No DOM node found with id " + data.id));
    }
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/dom_caret/src/index.js */

var environment = require(3),
    focusNode = require(103),
    blurNode = require(102),
    getActiveElement = require(104),
    isTextInputElement = require(105);


var domCaret = exports,

    window = environment.window,
    document = environment.document,

    getNodeCaretPosition, setNodeCaretPosition;



domCaret.get = function(node) {
    var activeElement = getActiveElement(),
        isFocused = activeElement === node,
        selection;

    if (isTextInputElement(node)) {
        if (!isFocused) {
            focusNode(node);
        }
        selection = getNodeCaretPosition(node);
        if (!isFocused) {
            blurNode(node);
            focusNode(activeElement);
        }
        return selection;
    } else {
        return {
            start: 0,
            end: 0
        };
    }
};

domCaret.set = function(node, start, end) {
    if (isTextInputElement(node)) {
        if (getActiveElement() !== node) {
            focusNode(node);
        }
        setNodeCaretPosition(node, start, end === undefined ? start : end);
    }
};

if (!!window.getSelection) {
    getNodeCaretPosition = function getNodeCaretPosition(node) {
        return {
            start: node.selectionStart,
            end: node.selectionEnd
        };
    };
    setNodeCaretPosition = function setNodeCaretPosition(node, start, end) {
        node.setSelectionRange(start, end);
    };
} else if (document.selection && document.selection.createRange) {
    getNodeCaretPosition = function getNodeCaretPosition(node) {
        var range = document.selection.createRange();
        range.moveStart("character", -node.value.length);
        return range.text.length;
    };
    setNodeCaretPosition = function setNodeCaretPosition(node, start, end) {
        var range = ctrl.createTextRange();
        range.collapse(true);
        range.moveStart("character", start);
        range.moveEnd("character", end);
        range.select();
    };
} else {
    getNodeCaretPosition = function getNodeCaretPosition() {
        return {
            start: 0,
            end: 0
        };
    };
    setNodeCaretPosition = function setNodeCaretPosition() {};
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/blur_node/src/index.js */

var isNode = require(106);


module.exports = blurNode;


function blurNode(node) {
    if (isNode(node) && node.blur) {
        try {
            node.blur();
        } catch (e) {}
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/focus_node/src/index.js */

var isNode = require(106);


module.exports = focusNode;


function focusNode(node) {
    if (isNode(node) && node.focus) {
        try {
            node.focus();
        } catch (e) {}
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/get_active_element/src/index.js */

var isDocument = require(107),
    environment = require(3);


var document = environment.document;


module.exports = getActiveElement;


function getActiveElement(ownerDocument) {
    ownerDocument = isDocument(ownerDocument) ? ownerDocument : document;

    try {
        return ownerDocument.activeElement || ownerDocument.body;
    } catch (e) {
        return ownerDocument.body;
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_text_input_element/src/index.js */

var isNullOrUndefined = require(23);


var reIsSupportedInputType = new RegExp("^\\b(" + [
    "color", "date", "datetime", "datetime-local", "email", "month", "number",
    "password", "range", "search", "tel", "text", "time", "url", "week"
].join("|") + ")\\b$");


module.exports = isTextInputElement;


function isTextInputElement(value) {
    return !isNullOrUndefined(value) && (
        (value.nodeName === "INPUT" && reIsSupportedInputType.test(value.type)) ||
        value.nodeName === "TEXTAREA"
    );
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_node/src/index.js */

var isString = require(21),
    isNullOrUndefined = require(23),
    isNumber = require(24),
    isFunction = require(19);


var isNode;


if (typeof(Node) !== "undefined" && isFunction(Node)) {
    isNode = function isNode(value) {
        return value instanceof Node;
    };
} else {
    isNode = function isNode(value) {
        return (!isNullOrUndefined(value) &&
            isNumber(value.nodeType) &&
            isString(value.nodeName)
        );
    };
}


module.exports = isNode;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_document/src/index.js */

var isNode = require(106);


module.exports = isDocument;


function isDocument(value) {
    return isNode(value) && value.nodeType === 9;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/utils/getNodeById.js */

var nodeCache = require(109);


module.exports = getNodeById;


function getNodeById(id) {
    return nodeCache[id];
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/utils/nodeCache.js */




},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/consts.js */

var map = require(26),
    forEach = require(111),
    keyMirror = require(59);


var consts = exports,

    topLevelToEvent = consts.topLevelToEvent = {},
    propNameToTopLevel = consts.propNameToTopLevel = {},

    eventTypes = [
        "topBlur",
        "topChange",
        "topClick",
        "topCompositionEnd",
        "topCompositionStart",
        "topCompositionUpdate",
        "topContextMenu",
        "topCopy",
        "topCut",
        "topDoubleClick",
        "topDrag",
        "topDragEnd",
        "topDragEnter",
        "topDragExit",
        "topDragLeave",
        "topDragOver",
        "topDragStart",
        "topDrop",
        "topError",
        "topFocus",
        "topInput",
        "topKeyDown",
        "topKeyPress",
        "topKeyUp",
        "topLoad",
        "topMouseDown",
        "topMouseMove",
        "topMouseOut",
        "topMouseOver",
        "topMouseEnter",
        "topMouseUp",
        "topOrientationChange",
        "topPaste",
        "topReset",
        "topResize",
        "topScroll",
        "topSelectionChange",
        "topSubmit",
        "topTextInput",
        "topTouchCancel",
        "topTouchEnd",
        "topTouchMove",
        "topTouchStart",
        "topWheel",
        "topRateChange",
        "topScroll",
        "topSeeked",
        "topSeeking",
        "topSelectionChange",
        "topStalled",
        "topSuspend",
        "topTextInput",
        "topTimeUpdate",
        "topTouchCancel",
        "topTouchEnd",
        "topTouchMove",
        "topTouchStart",
        "topVolumeChange",
        "topWaiting",
        "topWheel"
    ];

consts.phases = keyMirror([
    "bubbled",
    "captured"
]);

consts.topLevelTypes = keyMirror(eventTypes);

consts.propNames = map(eventTypes, replaceTopWithOn);

forEach(eventTypes, function(str) {
    propNameToTopLevel[replaceTopWithOn(str)] = str;
});

forEach(eventTypes, function(str) {
    topLevelToEvent[str] = removeTop(str).toLowerCase();
});

function replaceTopWithOn(str) {
    return str.replace(/^top/, "on");
}

function removeTop(str) {
    return str.replace(/^top/, "");
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/for_each/src/index.js */

var isArrayLike = require(37),
    isNullOrUndefined = require(23),
    fastBindThis = require(38),
    arrayForEach = require(112),
    objectForEach = require(113);


module.exports = forEach;


function forEach(value, callback, thisArg) {
    callback = isNullOrUndefined(thisArg) ? callback : fastBindThis(callback, thisArg, 3);
    return isArrayLike(value) ?
        arrayForEach(value, callback) :
        objectForEach(value, callback);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/array-for_each/src/index.js */

module.exports = arrayForEach;


function arrayForEach(array, callback) {
    var i = -1,
        il = array.length - 1;

    while (i++ < il) {
        if (callback(array[i], i, array) === false) {
            break;
        }
    }

    return array;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/object-for_each/src/index.js */

var keys = require(41);


module.exports = objectForEach;


function objectForEach(object, callback) {
    var objectKeys = keys(object),
        i = -1,
        il = objectKeys.length - 1,
        key;

    while (i++ < il) {
        key = objectKeys[i];

        if (callback(object[key], key, object) === false) {
            break;
        }
    }

    return object;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/eventHandlersById.js */




},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/Adapter.js */

var virt = require(1),
    Messenger = require(118),
    createMessengerAdapter = require(119),
    eventHandlersById = require(114),
    getWindow = require(120),
    nativeDOMComponents = require(76),
    nativeDOMHandlers = require(77),
    registerNativeComponents = require(121),
    registerNativeComponentHandlers = require(122),
    getNodeById = require(108),
    consts = require(110),
    EventHandler = require(123),
    eventClassMap = require(124),
    applyEvents = require(125),
    applyPatches = require(126);


var traverseAncestors = virt.traverseAncestors;


module.exports = Adapter;


function Adapter(root, containerDOMNode) {
    var socket = createMessengerAdapter(),
        messengerClient = new Messenger(socket.client),
        messengerServer = new Messenger(socket.server),

        document = containerDOMNode.ownerDocument,
        window = getWindow(document),
        eventManager = root.eventManager,
        events = eventManager.events,
        eventHandler = new EventHandler(document, window);

    eventHandlersById[root.id] = eventHandler;

    this.messenger = messengerServer;
    this.messengerClient = messengerClient;

    this.root = root;
    this.containerDOMNode = containerDOMNode;

    this.document = document;
    this.window = getWindow(document);

    this.eventHandler = eventHandler;

    this.handle = function(transaction, callback) {
        messengerServer.emit("virt.dom.handleTransaction", transaction, callback);
    };

    messengerClient.on("virt.dom.handleTransaction", function onHandleTransaction(transaction, callback) {
        applyPatches(transaction.patches, containerDOMNode, document);
        applyEvents(transaction.events, eventHandler);
        applyPatches(transaction.removes, containerDOMNode, document);
        callback();
    });

    eventManager.propNameToTopLevel = consts.propNameToTopLevel;

    eventHandler.handleDispatch = function handleDispatch(topLevelType, nativeEvent, targetId) {
        messengerServer.emit("virt.dom.handleEventDispatch", {
            topLevelType: topLevelType,
            nativeEvent: nativeEvent,
            targetId: targetId
        });
    };

    messengerClient.on("virt.dom.handleEventDispatch", function onHandleEventDispatch(data, callback) {
        var childHash = root.childHash,
            topLevelType = data.topLevelType,
            nativeEvent = data.nativeEvent,
            targetId = data.targetId,
            eventType = events[topLevelType],
            target = childHash[targetId],
            event;

        if (target) {
            target = target.component;
        } else {
            target = null;
        }

        traverseAncestors(targetId, function traverseAncestor(currentTargetId) {
            if (eventType[currentTargetId]) {
                event = event || eventClassMap[topLevelType].getPooled(nativeEvent, eventHandler);
                event.currentTarget = getNodeById(currentTargetId);
                event.componentTarget = target;
                event.currentComponentTarget = childHash[currentTargetId].component;
                eventType[currentTargetId](event);
                return event.returnValue;
            } else {
                return true;
            }
        });

        if (event && event.isPersistent !== true) {
            event.destroy();
        }

        callback();
    });

    eventHandler.handleResize = function handleDispatch(data) {
        messengerClient.emit("virt.resize", data);
    };

    messengerClient.on("virt.getDeviceDimensions", function getDeviceDimensions(data, callback) {
        callback(undefined, eventHandler.getDimensions());
    });

    registerNativeComponents(root, nativeDOMComponents);
    registerNativeComponentHandlers(messengerClient, nativeDOMHandlers);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/rootsById.js */




},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/utils/getRootNodeId.js */

var getRootNodeInContainer = require(173),
    getNodeId = require(172);


module.exports = getRootNodeId;


function getRootNodeId(containerDOMNode) {
    return getNodeId(getRootNodeInContainer(containerDOMNode));
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/messenger/src/index.js */

var MESSENGER_ID = 0,
    MessengerPrototype;


module.exports = Messenger;


function Messenger(adapter) {
    var _this = this;

    this.__id = (MESSENGER_ID++).toString(36);
    this.__messageId = 0;
    this.__callbacks = {};
    this.__listeners = {};

    this.__adapter = adapter;

    adapter.addMessageListener(function onMessage(data) {
        _this.onMessage(data);
    });
}
MessengerPrototype = Messenger.prototype;

MessengerPrototype.onMessage = function(message) {
    var id = message.id,
        name = message.name,
        callbacks = this.__callbacks,
        callback = callbacks[id],
        listeners, adapter;

    if (name) {
        listeners = this.__listeners;
        adapter = this.__adapter;

        if (listeners[name]) {
            Messenger_emit(this, listeners[name], message.data, function emitCallback(error, data) {
                adapter.postMessage({
                    id: id,
                    error: error || undefined,
                    data: data
                });
            });
        }
    } else {
        if (callback && isMatch(id, this.__id)) {
            callback(message.error, message.data, this);
            delete callbacks[id];
        }
    }
};

MessengerPrototype.emit = function(name, data, callback) {
    var id = this.__id + "-" + (this.__messageId++).toString(36);

    if (callback) {
        this.__callbacks[id] = callback;
    }

    this.__adapter.postMessage({
        id: id,
        name: name,
        data: data
    });
};

MessengerPrototype.send = MessengerPrototype.emit;

MessengerPrototype.on = function(name, callback) {
    var listeners = this.__listeners,
        listener = listeners[name] || (listeners[name] = []);

    listener[listener.length] = callback;
};

MessengerPrototype.off = function(name, callback) {
    var listeners = this.__listeners,
        listener = listeners[name],
        i;

    if (listener) {
        i = listener.length;

        while (i--) {
            if (listener[i] === callback) {
                listener.splice(i, 1);
            }
        }

        if (listener.length === 0) {
            delete listeners[name];
        }
    }
};

function Messenger_emit(_this, listeners, data, callback) {
    var index = 0,
        length = listeners.length,
        called = false;

    function done(error, data) {
        if (called === false) {
            called = true;
            callback(error, data);
        }
    }

    function next(error, data) {
        if (error || index === length) {
            done(error, data);
        } else {
            listeners[index++](data, next, _this);
        }
    }

    next(undefined, data);
}

function isMatch(messageId, id) {
    return messageId.split("-")[0] === id;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/messenger_adapter/src/index.js */

var MessengerAdapterPrototype;


module.exports = createMessengerAdapter;


function createMessengerAdapter() {
    var client = new MessengerAdapter(),
        server = new MessengerAdapter();

    client.socket = server;
    server.socket = client;

    return {
        client: client,
        server: server
    };
}

function MessengerAdapter() {
    this.socket = null;
    this.__listeners = [];
}
MessengerAdapterPrototype = MessengerAdapter.prototype;

MessengerAdapterPrototype.addMessageListener = function(callback) {
    var listeners = this.__listeners;
    listeners[listeners.length] = callback;
};

MessengerAdapterPrototype.onMessage = function(data) {
    var listeners = this.__listeners,
        i = -1,
        il = listeners.length - 1;

    while (i++ < il) {
        listeners[i](data);
    }
};

MessengerAdapterPrototype.postMessage = function(data) {
    this.socket.onMessage(data);
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/utils/getWindow.js */

module.exports = getWindow;


function getWindow(document) {
    var scriptElement, parentElement;

    if (document.parentWindow) {
        return document.parentWindow;
    } else {
        if (!document.defaultView) {
            scriptElement = document.createElement("script");
            scriptElement.innerHTML = "document.parentWindow=window;";

            parentElement = document.documentElement;
            parentElement.appendChild(scriptElement);
            parentElement.removeChild(scriptElement);

            return document.parentWindow;
        } else {
            return document.defaultView;
        }
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/utils/registerNativeComponents.js */

var has = require(25);


module.exports = registerNativeComponents;


function registerNativeComponents(root, nativeDOMComponents) {
    var localHas = has,
        name;

    for (name in nativeDOMComponents) {
        if (localHas(nativeDOMComponents, name)) {
            root.registerNativeComponent(name, nativeDOMComponents[name]);
        }
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/utils/registerNativeComponentHandlers.js */

var has = require(25);


module.exports = registerNativeComponentHandlers;


function registerNativeComponentHandlers(messenger, nativeDOMHandlers) {
    var localHas = has,
        key;

    for (key in nativeDOMHandlers) {
        if (localHas(nativeDOMHandlers, key)) {
            messenger.on(key, nativeDOMHandlers[key]);
        }
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/EventHandler.js */

var has = require(25),
    eventListener = require(4),
    consts = require(110),
    getWindowWidth = require(127),
    getWindowHeight = require(128),
    getEventTarget = require(129),
    getNodeAttributeId = require(130),
    isEventSupported = require(131);


var topLevelTypes = consts.topLevelTypes,
    topLevelToEvent = consts.topLevelToEvent,
    EventHandlerPrototype;


module.exports = EventHandler;


function EventHandler(document, window) {
    var _this = this,
        documentElement = document.documentElement ? document.documentElement : document.body,
        viewport = {
            currentScrollLeft: 0,
            currentScrollTop: 0
        };

    this.document = document;
    this.documentElement = documentElement;
    this.window = window;
    this.viewport = viewport;
    this.handleDispatch = null;
    this.handleResize = null;

    this.__isListening = {};
    this.__listening = {};

    function onViewport() {
        viewport.currentScrollLeft = window.pageXOffset || documentElement.scrollLeft;
        viewport.currentScrollTop = window.pageYOffset || documentElement.scrollTop;
    }
    this.__onViewport = onViewport;
    eventListener.on(window, "scroll resize orientationchange", onViewport);

    function onResize() {
        _this.handleResize(_this.getDimensions());
    }
    this.__onResize = onResize;
    eventListener.on(window, "resize orientationchange", onResize);
}
EventHandlerPrototype = EventHandler.prototype;

EventHandlerPrototype.getDimensions = function() {
    var viewport = this.viewport,
        window = this.window,
        documentElement = this.documentElement,
        document = this.document;

    return {
        scrollLeft: viewport.currentScrollLeft,
        scrollTop: viewport.currentScrollTop,
        width: getWindowWidth(window, documentElement, document),
        height: getWindowHeight(window, documentElement, document)
    };
};

EventHandlerPrototype.clear = function() {
    var window = this.window,
        listening = this.__listening,
        isListening = this.__isListening,
        localHas = has,
        topLevelType;

    for (topLevelType in listening) {
        if (localHas(listening, topLevelType)) {
            listening[topLevelType]();
            delete listening[topLevelType];
            delete isListening[topLevelType];
        }
    }

    eventListener.off(window, "scroll resize orientationchange", this.__onViewport);
    eventListener.off(window, "resize orientationchange", this.__onResize);
};

EventHandlerPrototype.listenTo = function(id, topLevelType) {
    var document = this.document,
        window = this.window,
        isListening = this.__isListening;

    if (!isListening[topLevelType]) {
        if (topLevelType === topLevelTypes.topWheel) {
            if (isEventSupported("wheel")) {
                this.trapBubbledEvent(topLevelTypes.topWheel, "wheel", document);
            } else if (isEventSupported("mousewheel")) {
                this.trapBubbledEvent(topLevelTypes.topWheel, "mousewheel", document);
            } else {
                this.trapBubbledEvent(topLevelTypes.topWheel, "DOMMouseScroll", document);
            }
        } else if (topLevelType === topLevelTypes.topScroll) {
            if (isEventSupported("scroll", true)) {
                this.trapCapturedEvent(topLevelTypes.topScroll, "scroll", document);
            } else {
                this.trapBubbledEvent(topLevelTypes.topScroll, "scroll", window);
            }
        } else if (
            topLevelType === topLevelTypes.topFocus ||
            topLevelType === topLevelTypes.topBlur
        ) {
            if (isEventSupported("focus", true)) {
                this.trapCapturedEvent(topLevelTypes.topFocus, "focus", document);
                this.trapCapturedEvent(topLevelTypes.topBlur, "blur", document);
            } else if (isEventSupported("focusin")) {
                this.trapBubbledEvent(topLevelTypes.topFocus, "focusin", document);
                this.trapBubbledEvent(topLevelTypes.topBlur, "focusout", document);
            }

            isListening[topLevelTypes.topFocus] = true;
            isListening[topLevelTypes.topBlur] = true;
        } else {
            this.trapBubbledEvent(topLevelType, topLevelToEvent[topLevelType], this.document);
        }

        isListening[topLevelType] = true;
    }
};

EventHandlerPrototype.addBubbledEvent = function(topLevelType, type, element) {
    var _this = this;

    function handler(nativeEvent) {
        _this.dispatchEvent(topLevelType, nativeEvent);
    }

    eventListener.on(element, type, handler);

    function removeBubbledEvent() {
        eventListener.off(element, type, handler);
    }

    return removeBubbledEvent;
};

EventHandlerPrototype.addCapturedEvent = function(topLevelType, type, element) {
    var _this = this;

    function handler(nativeEvent) {
        _this.dispatchEvent(topLevelType, nativeEvent);
    }

    eventListener.capture(element, type, handler);

    function removeCapturedEvent() {
        eventListener.off(element, type, handler);
    }

    return removeCapturedEvent;
};

EventHandlerPrototype.trapBubbledEvent = function(topLevelType, type, element) {
    var removeBubbledEvent = this.addBubbledEvent(topLevelType, type, element);
    this.__listening[topLevelType] = removeBubbledEvent;
    return removeBubbledEvent;
};

EventHandlerPrototype.trapCapturedEvent = function(topLevelType, type, element) {
    var removeCapturedEvent = this.addCapturedEvent(topLevelType, type, element);
    this.__listening[topLevelType] = removeCapturedEvent;
    return removeCapturedEvent;
};

EventHandlerPrototype.dispatchEvent = function(topLevelType, nativeEvent) {
    this.handleDispatch(topLevelType, nativeEvent, getNodeAttributeId(getEventTarget(nativeEvent, this.window)));
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/eventClassMap.js */

var SyntheticClipboardEvent = require(134),
    SyntheticCompositionEvent = require(135),
    SyntheticDragEvent = require(136),
    SyntheticEvent = require(137),
    SyntheticFocusEvent = require(138),
    SyntheticInputEvent = require(139),
    SyntheticKeyboardEvent = require(140),
    SyntheticMouseEvent = require(141),
    SyntheticTouchEvent = require(142),
    SyntheticUIEvent = require(143),
    SyntheticWheelEvent = require(144);


module.exports = {
    topBlur: SyntheticFocusEvent,
    topChange: SyntheticInputEvent,
    topClick: SyntheticMouseEvent,

    topCompositionEnd: SyntheticCompositionEvent,
    topCompositionStart: SyntheticCompositionEvent,
    topCompositionUpdate: SyntheticCompositionEvent,

    topContextMenu: SyntheticMouseEvent,

    topCopy: SyntheticClipboardEvent,
    topCut: SyntheticClipboardEvent,

    topDoubleClick: SyntheticMouseEvent,

    topDrag: SyntheticDragEvent,
    topDragEnd: SyntheticDragEvent,
    topDragEnter: SyntheticDragEvent,
    topDragExit: SyntheticDragEvent,
    topDragLeave: SyntheticDragEvent,
    topDragOver: SyntheticDragEvent,
    topDragStart: SyntheticDragEvent,
    topDrop: SyntheticDragEvent,

    topError: SyntheticUIEvent,
    topFocus: SyntheticFocusEvent,
    topInput: SyntheticInputEvent,

    topKeyDown: SyntheticKeyboardEvent,
    topKeyPress: SyntheticKeyboardEvent,
    topKeyUp: SyntheticKeyboardEvent,

    topLoad: SyntheticUIEvent,

    topMouseDown: SyntheticMouseEvent,
    topMouseMove: SyntheticMouseEvent,
    topMouseOut: SyntheticMouseEvent,
    topMouseOver: SyntheticMouseEvent,
    topMouseEnter: SyntheticMouseEvent,
    topMouseUp: SyntheticMouseEvent,

    topOrientationChange: SyntheticEvent,

    topPaste: SyntheticClipboardEvent,
    topReset: SyntheticEvent,
    topResize: SyntheticUIEvent,
    topScroll: SyntheticUIEvent,

    topSelectionChange: SyntheticEvent,

    topSubmit: SyntheticEvent,

    topTextInput: SyntheticInputEvent,

    topTouchCancel: SyntheticTouchEvent,
    topTouchEnd: SyntheticTouchEvent,
    topTouchMove: SyntheticTouchEvent,
    topTouchStart: SyntheticTouchEvent,

    topWheel: SyntheticWheelEvent,

    topRateChange: SyntheticEvent,
    topSeeked: SyntheticEvent,
    topSeeking: SyntheticEvent,
    topStalled: SyntheticEvent,
    topSuspend: SyntheticEvent,
    topTimeUpdate: SyntheticEvent,
    topVolumeChange: SyntheticEvent,
    topWaiting: SyntheticEvent
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/applyEvents.js */

var has = require(25);


module.exports = applyEvents;


function applyEvents(events, eventHandler) {
    var localHas = has,
        id, eventArray, i, il;

    for (id in events) {
        if (localHas(events, id)) {
            eventArray = events[id];
            i = -1;
            il = eventArray.length - 1;

            while (i++ < il) {
                eventHandler.listenTo(id, eventArray[i]);
            }
        }
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/applyPatches.js */

var getNodeById = require(108),
    applyPatch = require(165);


module.exports = applyPatches;


function applyPatches(hash, rootDOMNode, document) {
    var id;

    for (id in hash) {
        if (hash[id] !== undefined) {
            applyPatchIndices(getNodeById(id), hash[id], id, document, rootDOMNode);
        }
    }
}

function applyPatchIndices(DOMNode, patchArray, id, document, rootDOMNode) {
    var i = -1,
        length = patchArray.length - 1;

    while (i++ < length) {
        applyPatch(patchArray[i], DOMNode, id, document, rootDOMNode);
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/getters/getWindowWidth.js */

module.exports = getWindowWidth;


function getWindowWidth(window, document, documentElement) {
    return window.innerWidth || document.clientWidth || documentElement.clientWidth;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/getters/getWindowHeight.js */

module.exports = getWindowHeight;


function getWindowHeight(window, document, documentElement) {
    return window.innerHeight || document.clientHeight || documentElement.clientHeight;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/getters/getEventTarget.js */

module.exports = getEventTarget;


function getEventTarget(nativeEvent, window) {
    var target = nativeEvent.target || nativeEvent.srcElement || window;
    return target.nodeType === 3 ? target.parentNode : target;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/utils/getNodeAttributeId.js */

var DOM_ID_NAME = require(89);


module.exports = getNodeAttributeId;


function getNodeAttributeId(node) {
    return node && node.getAttribute && node.getAttribute(DOM_ID_NAME) || "";
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/isEventSupported.js */

var isFunction = require(19),
    has = require(25),
    supports = require(133),
    environment = require(3);


var document = environment.document,

    useHasFeature = (
        document.implementation &&
        document.implementation.hasFeature &&
        document.implementation.hasFeature("", "") !== true
    );


module.exports = isEventSupported;


function isEventSupported(eventNameSuffix, capture) {
    var isSupported, eventName, element;

    if (!supports.dom || capture && document.addEventListener == null) {
        return false;
    } else {
        eventName = "on" + eventNameSuffix;
        isSupported = has(document, eventName);

        if (!isSupported) {
            element = document.createElement("div");
            element.setAttribute(eventName, "return;");
            isSupported = isFunction(element[eventName]);
        }

        if (!isSupported && useHasFeature && eventNameSuffix === "wheel") {
            isSupported = document.implementation.hasFeature("Events.wheel", "3.0");
        }

        return isSupported;
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/event_listener/src/event_table.js */

var isNode = require(106),
    environment = require(3);


var window = environment.window,

    XMLHttpRequest = window.XMLHttpRequest,
    OfflineAudioContext = window.OfflineAudioContext;


function returnEvent() {
    return window.Event;
}


module.exports = {
    abort: function(target) {
        if (XMLHttpRequest && target instanceof XMLHttpRequest) {
            return window.ProgressEvent || window.Event;
        } else {
            return window.UIEvent || window.Event;
        }
    },

    afterprint: returnEvent,

    animationend: function() {
        return window.AnimationEvent || window.Event;
    },
    animationiteration: function() {
        return window.AnimationEvent || window.Event;
    },
    animationstart: function() {
        return window.AnimationEvent || window.Event;
    },

    audioprocess: function() {
        return window.AudioProcessingEvent || window.Event;
    },

    beforeprint: returnEvent,
    beforeunload: function() {
        return window.BeforeUnloadEvent || window.Event;
    },
    beginevent: function() {
        return window.TimeEvent || window.Event;
    },

    blocked: returnEvent,
    blur: function() {
        return window.FocusEvent || window.Event;
    },

    cached: returnEvent,
    canplay: returnEvent,
    canplaythrough: returnEvent,
    chargingchange: returnEvent,
    chargingtimechange: returnEvent,
    checking: returnEvent,

    click: function() {
        return window.MouseEvent || window.Event;
    },

    close: returnEvent,
    compassneedscalibration: function() {
        return window.SensorEvent || window.Event;
    },
    complete: function(target) {
        if (OfflineAudioContext && target instanceof OfflineAudioContext) {
            return window.OfflineAudioCompletionEvent || window.Event;
        } else {
            return window.Event;
        }
    },

    compositionend: function() {
        return window.CompositionEvent || window.Event;
    },
    compositionstart: function() {
        return window.CompositionEvent || window.Event;
    },
    compositionupdate: function() {
        return window.CompositionEvent || window.Event;
    },

    contextmenu: function() {
        return window.MouseEvent || window.Event;
    },
    copy: function() {
        return window.ClipboardEvent || window.Event;
    },
    cut: function() {
        return window.ClipboardEvent || window.Event;
    },

    dblclick: function() {
        return window.MouseEvent || window.Event;
    },
    devicelight: function() {
        return window.DeviceLightEvent || window.Event;
    },
    devicemotion: function() {
        return window.DeviceMotionEvent || window.Event;
    },
    deviceorientation: function() {
        return window.DeviceOrientationEvent || window.Event;
    },
    deviceproximity: function() {
        return window.DeviceProximityEvent || window.Event;
    },

    dischargingtimechange: returnEvent,

    DOMActivate: function() {
        return window.UIEvent || window.Event;
    },
    DOMAttributeNameChanged: function() {
        return window.MutationNameEvent || window.Event;
    },
    DOMAttrModified: function() {
        return window.MutationEvent || window.Event;
    },
    DOMCharacterDataModified: function() {
        return window.MutationEvent || window.Event;
    },
    DOMContentLoaded: returnEvent,
    DOMElementNameChanged: function() {
        return window.MutationNameEvent || window.Event;
    },
    DOMFocusIn: function() {
        return window.FocusEvent || window.Event;
    },
    DOMFocusOut: function() {
        return window.FocusEvent || window.Event;
    },
    DOMNodeInserted: function() {
        return window.MutationEvent || window.Event;
    },
    DOMNodeInsertedIntoDocument: function() {
        return window.MutationEvent || window.Event;
    },
    DOMNodeRemoved: function() {
        return window.MutationEvent || window.Event;
    },
    DOMNodeRemovedFromDocument: function() {
        return window.MutationEvent || window.Event;
    },
    DOMSubtreeModified: function() {
        return window.FocusEvent || window.Event;
    },
    downloading: returnEvent,

    drag: function() {
        return window.DragEvent || window.Event;
    },
    dragend: function() {
        return window.DragEvent || window.Event;
    },
    dragenter: function() {
        return window.DragEvent || window.Event;
    },
    dragleave: function() {
        return window.DragEvent || window.Event;
    },
    dragover: function() {
        return window.DragEvent || window.Event;
    },
    dragstart: function() {
        return window.DragEvent || window.Event;
    },
    drop: function() {
        return window.DragEvent || window.Event;
    },

    durationchange: returnEvent,
    ended: returnEvent,

    endEvent: function() {
        return window.TimeEvent || window.Event;
    },
    error: function(target) {
        if (XMLHttpRequest && target instanceof XMLHttpRequest) {
            return window.ProgressEvent || window.Event;
        } else if (isNode(target)) {
            return window.UIEvent || window.Event;
        } else {
            return window.Event;
        }
    },
    focus: function() {
        return window.FocusEvent || window.Event;
    },
    focusin: function() {
        return window.FocusEvent || window.Event;
    },
    focusout: function() {
        return window.FocusEvent || window.Event;
    },

    fullscreenchange: returnEvent,
    fullscreenerror: returnEvent,

    gamepadconnected: function() {
        return window.GamepadEvent || window.Event;
    },
    gamepaddisconnected: function() {
        return window.GamepadEvent || window.Event;
    },

    hashchange: function() {
        return window.HashChangeEvent || window.Event;
    },

    input: returnEvent,
    invalid: returnEvent,

    keydown: function() {
        return window.KeyboardEvent || window.Event;
    },
    keyup: function() {
        return window.KeyboardEvent || window.Event;
    },
    keypress: function() {
        return window.KeyboardEvent || window.Event;
    },

    languagechange: returnEvent,
    levelchange: returnEvent,

    load: function(target) {
        if (XMLHttpRequest && target instanceof XMLHttpRequest) {
            return window.ProgressEvent || window.Event;
        } else {
            return window.UIEvent || window.Event;
        }
    },

    loadeddata: returnEvent,
    loadedmetadata: returnEvent,

    loadend: function() {
        return window.ProgressEvent || window.Event;
    },
    loadstart: function() {
        return window.ProgressEvent || window.Event;
    },

    message: function() {
        return window.MessageEvent || window.Event;
    },

    mousedown: function() {
        return window.MouseEvent || window.Event;
    },
    mouseenter: function() {
        return window.MouseEvent || window.Event;
    },
    mouseleave: function() {
        return window.MouseEvent || window.Event;
    },
    mousemove: function() {
        return window.MouseEvent || window.Event;
    },
    mouseout: function() {
        return window.MouseEvent || window.Event;
    },
    mouseover: function() {
        return window.MouseEvent || window.Event;
    },
    mouseup: function() {
        return window.MouseEvent || window.Event;
    },

    noupdate: returnEvent,
    obsolete: returnEvent,
    offline: returnEvent,
    online: returnEvent,
    open: returnEvent,
    orientationchange: returnEvent,

    pagehide: function() {
        return window.PageTransitionEvent || window.Event;
    },
    pageshow: function() {
        return window.PageTransitionEvent || window.Event;
    },

    paste: function() {
        return window.ClipboardEvent || window.Event;
    },
    pause: returnEvent,
    pointerlockchange: returnEvent,
    pointerlockerror: returnEvent,
    play: returnEvent,
    playing: returnEvent,

    popstate: function() {
        return window.PopStateEvent || window.Event;
    },
    progress: function() {
        return window.ProgressEvent || window.Event;
    },

    ratechange: returnEvent,
    readystatechange: returnEvent,

    repeatevent: function() {
        return window.TimeEvent || window.Event;
    },

    reset: returnEvent,

    resize: function() {
        return window.UIEvent || window.Event;
    },
    scroll: function() {
        return window.UIEvent || window.Event;
    },

    seeked: returnEvent,
    seeking: returnEvent,

    select: function() {
        return window.UIEvent || window.Event;
    },
    show: function() {
        return window.MouseEvent || window.Event;
    },
    stalled: returnEvent,
    storage: function() {
        return window.StorageEvent || window.Event;
    },
    submit: returnEvent,
    success: returnEvent,
    suspend: returnEvent,

    SVGAbort: function() {
        return window.SVGEvent || window.Event;
    },
    SVGError: function() {
        return window.SVGEvent || window.Event;
    },
    SVGLoad: function() {
        return window.SVGEvent || window.Event;
    },
    SVGResize: function() {
        return window.SVGEvent || window.Event;
    },
    SVGScroll: function() {
        return window.SVGEvent || window.Event;
    },
    SVGUnload: function() {
        return window.SVGEvent || window.Event;
    },
    SVGZoom: function() {
        return window.SVGEvent || window.Event;
    },
    timeout: function() {
        return window.ProgressEvent || window.Event;
    },

    timeupdate: returnEvent,

    touchcancel: function() {
        return window.TouchEvent || window.Event;
    },
    touchend: function() {
        return window.TouchEvent || window.Event;
    },
    touchenter: function() {
        return window.TouchEvent || window.Event;
    },
    touchleave: function() {
        return window.TouchEvent || window.Event;
    },
    touchmove: function() {
        return window.TouchEvent || window.Event;
    },
    touchstart: function() {
        return window.TouchEvent || window.Event;
    },

    transitionend: function() {
        return window.TransitionEvent || window.Event;
    },
    unload: function() {
        return window.UIEvent || window.Event;
    },

    updateready: returnEvent,
    upgradeneeded: returnEvent,

    userproximity: function() {
        return window.SensorEvent || window.Event;
    },

    visibilitychange: returnEvent,
    volumechange: returnEvent,
    waiting: returnEvent,

    wheel: function() {
        return window.WheelEvent || window.Event;
    }
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/supports/src/index.js */

var environment = require(3);


var supports = module.exports;


supports.dom = !!(typeof(window) !== "undefined" && window.document && window.document.createElement);
supports.workers = typeof(Worker) !== "undefined";

supports.eventListeners = supports.dom && !!environment.window.addEventListener;
supports.attachEvents = supports.dom && !!environment.window.attachEvent;

supports.viewport = supports.dom && !!environment.window.screen;
supports.touch = supports.dom && "ontouchstart" in environment.window;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/syntheticEvents/SyntheticClipboardEvent.js */

var getClipboardEvent = require(145),
    SyntheticEvent = require(137);


var SyntheticEventPrototype = SyntheticEvent.prototype,
    SyntheticClipboardEventPrototype;


module.exports = SyntheticClipboardEvent;


function SyntheticClipboardEvent(nativeEvent, eventHandler) {

    SyntheticEvent.call(this, nativeEvent, eventHandler);

    getClipboardEvent(this, nativeEvent, eventHandler);
}
SyntheticEvent.extend(SyntheticClipboardEvent);
SyntheticClipboardEventPrototype = SyntheticClipboardEvent.prototype;

SyntheticClipboardEventPrototype.destructor = function() {

    SyntheticEventPrototype.destructor.call(this);

    this.clipboardData = null;
};

SyntheticClipboardEventPrototype.toJSON = function(json) {

    json = SyntheticEventPrototype.toJSON.call(this, json);

    json.clipboardData = this.clipboardData;

    return json;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/syntheticEvents/SyntheticCompositionEvent.js */

var getCompositionEvent = require(149),
    SyntheticEvent = require(137);


var SyntheticEventPrototype = SyntheticEvent.prototype,
    SyntheticCompositionEventPrototype;


module.exports = SyntheticCompositionEvent;


function SyntheticCompositionEvent(nativeEvent, eventHandler) {

    SyntheticEvent.call(this, nativeEvent, eventHandler);

    getCompositionEvent(this, nativeEvent, eventHandler);
}
SyntheticEvent.extend(SyntheticCompositionEvent);
SyntheticCompositionEventPrototype = SyntheticCompositionEvent.prototype;

SyntheticCompositionEventPrototype.destructor = function() {

    SyntheticEventPrototype.destructor.call(this);

    this.data = null;
};

SyntheticCompositionEventPrototype.toJSON = function(json) {

    json = SyntheticEventPrototype.toJSON.call(this, json);

    json.data = this.data;

    return json;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/syntheticEvents/SyntheticDragEvent.js */

var getDragEvent = require(150),
    SyntheticMouseEvent = require(141);


var SyntheticMouseEventPrototype = SyntheticMouseEvent.prototype,
    SyntheticDragEventPrototype;


module.exports = SyntheticDragEvent;


function SyntheticDragEvent(nativeEvent, eventHandler) {

    SyntheticMouseEvent.call(this, nativeEvent, eventHandler);

    getDragEvent(this, nativeEvent, eventHandler);
}
SyntheticMouseEvent.extend(SyntheticDragEvent);
SyntheticDragEventPrototype = SyntheticDragEvent.prototype;

SyntheticDragEventPrototype.destructor = function() {

    SyntheticMouseEventPrototype.destructor.call(this);

    this.dataTransfer = null;
};

SyntheticDragEventPrototype.toJSON = function(json) {

    json = SyntheticMouseEventPrototype.toJSON.call(this, json);

    json.dataTransfer = this.dataTransfer;

    return json;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/syntheticEvents/SyntheticEvent.js */

var inherits = require(68),
    createPool = require(48),
    nativeEventToJSON = require(146),
    getEvent = require(147);


var SyntheticEventPrototype;


module.exports = SyntheticEvent;


function SyntheticEvent(nativeEvent, eventHandler) {
    getEvent(this, nativeEvent, eventHandler);
}
createPool(SyntheticEvent);
SyntheticEventPrototype = SyntheticEvent.prototype;

SyntheticEvent.extend = function(child) {
    inherits(child, this);
    createPool(child);
    return child;
};

SyntheticEvent.create = function create(nativeTouch, eventHandler) {
    return this.getPooled(nativeTouch, eventHandler);
};

SyntheticEventPrototype.destructor = function() {
    this.nativeEvent = null;
    this.type = null;
    this.target = null;
    this.currentTarget = null;
    this.componentTarget = null;
    this.currentComponentTarget = null;
    this.eventPhase = null;
    this.bubbles = null;
    this.cancelable = null;
    this.timeStamp = null;
    this.defaultPrevented = null;
    this.propagationStopped = null;
    this.isTrusted = null;
};

SyntheticEventPrototype.destroy = function() {
    this.constructor.release(this);
};

SyntheticEventPrototype.preventDefault = function() {
    var event = this.nativeEvent;

    if (event.preventDefault) {
        event.preventDefault();
    } else {
        event.returnValue = false;
    }

    this.defaultPrevented = true;
};

SyntheticEventPrototype.stopPropagation = function() {
    var event = this.nativeEvent;

    if (event.stopPropagation) {
        event.stopPropagation();
    } else {
        event.cancelBubble = false;
    }

    this.propagationStopped = true;
};

SyntheticEventPrototype.persist = function() {
    this.isPersistent = true;
};

SyntheticEventPrototype.stopImmediatePropagation = SyntheticEventPrototype.stopPropagation;

SyntheticEventPrototype.toJSON = function(json) {
    json = json || {};

    json.nativeEvent = nativeEventToJSON(this.nativeEvent);
    json.type = this.type;
    json.target = null;
    json.currentTarget = this.currentTarget;
    json.eventPhase = this.eventPhase;
    json.bubbles = this.bubbles;
    json.cancelable = this.cancelable;
    json.timeStamp = this.timeStamp;
    json.defaultPrevented = this.defaultPrevented;
    json.propagationStopped = this.propagationStopped;
    json.isTrusted = this.isTrusted;

    return json;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/syntheticEvents/SyntheticFocusEvent.js */

var getFocusEvent = require(156),
    SyntheticUIEvent = require(143);


var SyntheticUIEventPrototype = SyntheticUIEvent.prototype,
    SyntheticFocusEventPrototype;


module.exports = SyntheticFocusEvent;


function SyntheticFocusEvent(nativeEvent, eventHandler) {

    SyntheticUIEvent.call(this, nativeEvent, eventHandler);

    getFocusEvent(this, nativeEvent, eventHandler);
}
SyntheticUIEvent.extend(SyntheticFocusEvent);
SyntheticFocusEventPrototype = SyntheticFocusEvent.prototype;

SyntheticFocusEventPrototype.destructor = function() {

    SyntheticUIEventPrototype.destructor.call(this);

    this.relatedTarget = null;
};

SyntheticFocusEventPrototype.toJSON = function(json) {

    json = SyntheticUIEventPrototype.toJSON.call(this, json);

    json.relatedTarget = this.relatedTarget;

    return json;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/syntheticEvents/SyntheticInputEvent.js */

var getInputEvent = require(157),
    SyntheticEvent = require(137);


var SyntheticEventPrototype = SyntheticEvent.prototype,
    SyntheticInputEventPrototype;


module.exports = SyntheticInputEvent;


function SyntheticInputEvent(nativeEvent, eventHandler) {

    SyntheticEvent.call(this, nativeEvent, eventHandler);

    getInputEvent(this, nativeEvent, eventHandler);
}
SyntheticEvent.extend(SyntheticInputEvent);
SyntheticInputEventPrototype = SyntheticInputEvent.prototype;

SyntheticInputEventPrototype.destructor = function() {

    SyntheticEventPrototype.destructor.call(this);

    this.data = null;
};

SyntheticInputEventPrototype.toJSON = function(json) {

    json = SyntheticEventPrototype.toJSON.call(this, json);

    json.data = this.data;

    return json;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/syntheticEvents/SyntheticKeyboardEvent.js */

var getKeyboardEvent = require(158),
    SyntheticUIEvent = require(143);


var SyntheticUIEventPrototype = SyntheticUIEvent.prototype,
    SynthetiKeyboardEventPrototype;


module.exports = SynthetiKeyboardEvent;


function SynthetiKeyboardEvent(nativeEvent, eventHandler) {

    SyntheticUIEvent.call(this, nativeEvent, eventHandler);

    getKeyboardEvent(this, nativeEvent, eventHandler);
}
SyntheticUIEvent.extend(SynthetiKeyboardEvent);
SynthetiKeyboardEventPrototype = SynthetiKeyboardEvent.prototype;

SynthetiKeyboardEventPrototype.getModifierState = require(152);

SynthetiKeyboardEventPrototype.destructor = function() {

    SyntheticUIEventPrototype.destructor.call(this);

    this.key = null;
    this.location = null;
    this.ctrlKey = null;
    this.shiftKey = null;
    this.altKey = null;
    this.metaKey = null;
    this.repeat = null;
    this.locale = null;
    this.charCode = null;
    this.keyCode = null;
    this.which = null;
};

SynthetiKeyboardEventPrototype.toJSON = function(json) {

    json = SyntheticUIEventPrototype.toJSON.call(this, json);

    json.key = this.key;
    json.location = this.location;
    json.ctrlKey = this.ctrlKey;
    json.shiftKey = this.shiftKey;
    json.altKey = this.altKey;
    json.metaKey = this.metaKey;
    json.repeat = this.repeat;
    json.locale = this.locale;
    json.charCode = this.charCode;
    json.keyCode = this.keyCode;
    json.which = this.which;

    return json;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/syntheticEvents/SyntheticMouseEvent.js */

var getMouseEvent = require(151),
    SyntheticUIEvent = require(143);


var SyntheticUIEventPrototype = SyntheticUIEvent.prototype,
    SyntheticMouseEventPrototype;


module.exports = SyntheticMouseEvent;


function SyntheticMouseEvent(nativeEvent, eventHandler) {

    SyntheticUIEvent.call(this, nativeEvent, eventHandler);

    getMouseEvent(this, nativeEvent, eventHandler);
}
SyntheticUIEvent.extend(SyntheticMouseEvent);
SyntheticMouseEventPrototype = SyntheticMouseEvent.prototype;

SyntheticMouseEventPrototype.getModifierState = require(152);

SyntheticMouseEventPrototype.destructor = function() {

    SyntheticUIEventPrototype.destructor.call(this);

    this.screenX = null;
    this.screenY = null;
    this.clientX = null;
    this.clientY = null;
    this.ctrlKey = null;
    this.shiftKey = null;
    this.altKey = null;
    this.metaKey = null;
    this.button = null;
    this.buttons = null;
    this.relatedTarget = null;
    this.pageX = null;
    this.pageY = null;
};

SyntheticMouseEventPrototype.toJSON = function(json) {

    json = SyntheticUIEventPrototype.toJSON.call(this, json);

    json.screenX = this.screenX;
    json.screenY = this.screenY;
    json.clientX = this.clientX;
    json.clientY = this.clientY;
    json.ctrlKey = this.ctrlKey;
    json.shiftKey = this.shiftKey;
    json.altKey = this.altKey;
    json.metaKey = this.metaKey;
    json.button = this.button;
    json.buttons = this.buttons;
    json.relatedTarget = this.relatedTarget;
    json.pageX = this.pageX;
    json.pageY = this.pageY;

    return json;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/syntheticEvents/SyntheticTouchEvent.js */

var getTouchEvent = require(161),
    SyntheticUIEvent = require(143),
    SyntheticTouch = require(162);


var SyntheticUIEventPrototype = SyntheticUIEvent.prototype,
    SyntheticTouchEventPrototype;


module.exports = SyntheticTouchEvent;


function SyntheticTouchEvent(nativeEvent, eventHandler) {

    SyntheticUIEvent.call(this, nativeEvent, eventHandler);

    this.touches = createTouches(this.touches || [], nativeEvent.touches, eventHandler);
    this.targetTouches = createTouches(this.targetTouches || [], nativeEvent.targetTouches, eventHandler);
    this.changedTouches = createTouches(this.changedTouches || [], nativeEvent.changedTouches, eventHandler);

    getTouchEvent(this, nativeEvent, eventHandler);
}
SyntheticUIEvent.extend(SyntheticTouchEvent);
SyntheticTouchEventPrototype = SyntheticTouchEvent.prototype;

SyntheticTouchEventPrototype.getModifierState = require(152);

SyntheticTouchEventPrototype.destructor = function() {

    SyntheticUIEventPrototype.destructor.call(this);

    destroyTouches(this.touches);
    destroyTouches(this.targetTouches);
    destroyTouches(this.changedTouches);

    this.altKey = null;
    this.metaKey = null;
    this.ctrlKey = null;
    this.shiftKey = null;
};

SyntheticTouchEventPrototype.toJSON = function(json) {

    json = SyntheticUIEventPrototype.toJSON.call(this, json);

    json.touches = this.touches || [];
    json.targetTouches = this.targetTouches || [];
    json.changedTouches = this.changedTouches || [];
    json.ctrlKey = this.ctrlKey;
    json.shiftKey = this.shiftKey;
    json.altKey = this.altKey;
    json.metaKey = this.metaKey;

    return json;
};

function createTouches(touches, nativeTouches, eventHandler) {
    var i = -1,
        il = nativeTouches.length - 1;

    while (i++ < il) {
        touches[i] = SyntheticTouch.create(nativeTouches[i], eventHandler);
    }

    return touches;
}

function destroyTouches(touches) {
    var i;

    while (i--) {
        touches[i].destroy();
    }
    touches.length = 0;

    return touches;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/syntheticEvents/SyntheticUIEvent.js */

var getUIEvent = require(155),
    SyntheticEvent = require(137);


var SyntheticEventPrototype = SyntheticEvent.prototype,
    SyntheticUIEventPrototype;


module.exports = SyntheticUIEvent;


function SyntheticUIEvent(nativeEvent, eventHandler) {

    SyntheticEvent.call(this, nativeEvent, eventHandler);

    getUIEvent(this, nativeEvent, eventHandler);
}
SyntheticEvent.extend(SyntheticUIEvent);
SyntheticUIEventPrototype = SyntheticUIEvent.prototype;

SyntheticUIEventPrototype.destructor = function() {

    SyntheticEventPrototype.destructor.call(this);

    this.view = null;
    this.detail = null;
};

SyntheticUIEventPrototype.toJSON = function(json) {

    json = SyntheticEventPrototype.toJSON.call(this, json);

    json.view = null;
    json.detail = this.detail;

    return json;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/syntheticEvents/SyntheticWheelEvent.js */

var getWheelEvent = require(164),
    SyntheticMouseEvent = require(141);


var SyntheticMouseEventPrototype = SyntheticMouseEvent.prototype,
    SyntheticWheelEventPrototype;


module.exports = SyntheticWheelEvent;


function SyntheticWheelEvent(nativeEvent, eventHandler) {

    SyntheticMouseEvent.call(this, nativeEvent, eventHandler);

    getWheelEvent(this, nativeEvent, eventHandler);
}
SyntheticMouseEvent.extend(SyntheticWheelEvent);
SyntheticWheelEventPrototype = SyntheticWheelEvent.prototype;

SyntheticWheelEventPrototype.destructor = function() {

    SyntheticMouseEventPrototype.destructor.call(this);

    this.deltaX = null;
    this.deltaY = null;
    this.deltaZ = null;
    this.deltaMode = null;
};

SyntheticWheelEventPrototype.toJSON = function(json) {

    json = SyntheticMouseEventPrototype.toJSON.call(this, json);

    json.deltaX = this.deltaX;
    json.deltaY = this.deltaY;
    json.deltaZ = this.deltaZ;
    json.deltaMode = this.deltaMode;

    return json;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/getters/getClipboardEvent.js */

module.exports = getClipboardEvent;


function getClipboardEvent(obj, nativeEvent, eventHandler) {
    obj.clipboardData = getClipboardData(nativeEvent, eventHandler.window);
}

function getClipboardData(nativeEvent, window) {
    return nativeEvent.clipboardData != null ? nativeEvent.clipboardData : window.clipboardData;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/utils/nativeEventToJSON.js */

var indexOf = require(61),
    isNode = require(106),
    isFunction = require(19),
    ignoreNativeEventProp = require(148);


module.exports = nativeEventToJSON;


function nativeEventToJSON(nativeEvent) {
    var json = {},
        key, value;

    for (key in nativeEvent) {
        value = nativeEvent[key];

        if (!(isFunction(value) || isNode(value) || indexOf(ignoreNativeEventProp, key) !== -1)) {
            json[key] = value;
        }
    }

    return json;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/getters/getEvent.js */

var getEventTarget = require(129);


module.exports = getEvent;


function getEvent(obj, nativeEvent, eventHandler) {
    obj.nativeEvent = nativeEvent;
    obj.type = nativeEvent.type;
    obj.target = getEventTarget(nativeEvent, eventHandler.window);
    obj.currentTarget = nativeEvent.currentTarget;
    obj.eventPhase = nativeEvent.eventPhase;
    obj.bubbles = nativeEvent.bubbles;
    obj.cancelable = nativeEvent.cancelable;
    obj.timeStamp = nativeEvent.timeStamp;
    obj.defaultPrevented = (
        nativeEvent.defaultPrevented != null ? nativeEvent.defaultPrevented : nativeEvent.returnValue === false
    );
    obj.propagationStopped = false;
    obj.isTrusted = nativeEvent.isTrusted;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/utils/ignoreNativeEventProp.js */

module.exports = [
    "view", "target", "currentTarget", "path", "srcElement",
    "cancelBubble", "stopPropagation", "stopImmediatePropagation", "preventDefault", "initEvent",
    "NONE", "CAPTURING_PHASE", "AT_TARGET", "BUBBLING_PHASE", "MOUSEDOWN", "MOUSEUP",
    "MOUSEOVER", "MOUSEOUT", "MOUSEMOVE", "MOUSEDRAG", "CLICK", "DBLCLICK", "KEYDOWN",
    "KEYUP", "KEYPRESS", "DRAGDROP", "FOCUS", "BLUR", "SELECT", "CHANGE"
];


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/getters/getCompositionEvent.js */

module.exports = getCompositionEvent;


function getCompositionEvent(obj, nativeEvent) {
    obj.data = nativeEvent.data;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/getters/getDragEvent.js */

module.exports = getDragEvent;


function getDragEvent(obj, nativeEvent) {
    obj.dataTransfer = nativeEvent.dataTransfer;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/getters/getMouseEvent.js */

var getPageX = require(153),
    getPageY = require(154);


module.exports = getMouseEvent;


function getMouseEvent(obj, nativeEvent, eventHandler) {
    obj.screenX = nativeEvent.screenX;
    obj.screenY = nativeEvent.screenY;
    obj.clientX = nativeEvent.clientX;
    obj.clientY = nativeEvent.clientY;
    obj.ctrlKey = nativeEvent.ctrlKey;
    obj.shiftKey = nativeEvent.shiftKey;
    obj.altKey = nativeEvent.altKey;
    obj.metaKey = nativeEvent.metaKey;
    obj.button = getButton(nativeEvent);
    obj.buttons = nativeEvent.buttons;
    obj.relatedTarget = getRelatedTarget(nativeEvent);
    obj.pageX = getPageX(nativeEvent, eventHandler.viewport);
    obj.pageY = getPageY(nativeEvent, eventHandler.viewport);
}

function getRelatedTarget(nativeEvent) {
    return nativeEvent.relatedTarget || (
        nativeEvent.fromElement === nativeEvent.srcElement ? nativeEvent.toElement : nativeEvent.fromElement
    );
}

function getButton(nativeEvent) {
    var button = nativeEvent.button;

    return (
        nativeEvent.which != null ? button : (
            button === 2 ? 2 : button === 4 ? 1 : 0
        )
    );
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/getters/getEventModifierState.js */

var modifierKeyToProp = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey"
};


module.exports = getEventModifierState;


function getEventModifierState(keyArg) {
    var nativeEvent = this.nativeEvent,
        keyProp;

    if (nativeEvent.getModifierState != null) {
        return nativeEvent.getModifierState(keyArg);
    } else {
        keyProp = modifierKeyToProp[keyArg];
        return keyProp ? !!nativeEvent[keyProp] : false;
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/getters/getPageX.js */

module.exports = getPageX;


function getPageX(nativeEvent, viewport) {
    return nativeEvent.pageX != null ? nativeEvent.pageX : nativeEvent.clientX + viewport.currentScrollLeft;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/getters/getPageY.js */

module.exports = getPageY;


function getPageY(nativeEvent, viewport) {
    return nativeEvent.pageY != null ? nativeEvent.pageY : nativeEvent.clientY + viewport.currentScrollTop;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/getters/getUIEvent.js */

var getWindow = require(120),
    getEventTarget = require(129);


module.exports = getUIEvent;


function getUIEvent(obj, nativeEvent, eventHandler) {
    obj.view = getView(nativeEvent, eventHandler);
    obj.detail = nativeEvent.detail || 0;
}

function getView(nativeEvent, eventHandler) {
    var target, document;

    if (nativeEvent.view) {
        return nativeEvent.view;
    } else {
        target = getEventTarget(nativeEvent, eventHandler.window);

        if (target != null && target.window === target) {
            return target;
        } else {
            document = target.ownerDocument;

            if (document) {
                return getWindow(document);
            } else {
                return eventHandler.window;
            }
        }
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/getters/getFocusEvent.js */

module.exports = getFocusEvent;


function getFocusEvent(obj, nativeEvent) {
    obj.relatedTarget = nativeEvent.relatedTarget;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/getters/getInputEvent.js */

module.exports = getInputEvent;


function getInputEvent(obj, nativeEvent) {
    obj.data = nativeEvent.data;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/getters/getKeyboardEvent.js */

var getEventKey = require(159),
    getEventCharCode = require(160);


module.exports = getKeyboardEvent;


function getKeyboardEvent(obj, nativeEvent) {
    obj.key = getEventKey(nativeEvent);
    obj.location = nativeEvent.location;
    obj.ctrlKey = nativeEvent.ctrlKey;
    obj.shiftKey = nativeEvent.shiftKey;
    obj.altKey = nativeEvent.altKey;
    obj.metaKey = nativeEvent.metaKey;
    obj.repeat = nativeEvent.repeat;
    obj.locale = nativeEvent.locale;
    obj.charCode = getCharCode(nativeEvent);
    obj.keyCode = getKeyCode(nativeEvent);
    obj.which = getWhich(nativeEvent);
}

function getCharCode(nativeEvent) {
    return nativeEvent.type === "keypress" ? getEventCharCode(nativeEvent) : 0;
}

function getKeyCode(nativeEvent) {
    var type = nativeEvent.type;

    return type === "keydown" || type === "keyup" ? nativeEvent.keyCode : 0;
}

function getWhich(nativeEvent) {
    var type = nativeEvent.type;

    return type === "keypress" ? getEventCharCode(event) : (
        type === "keydown" || type === "keyup" ? nativeEvent.keyCode : 0
    );
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/getters/getEventKey.js */

var getEventCharCode = require(160);


var normalizeKey, translateToKey;


module.exports = getEventKey;


normalizeKey = {
    "Esc": "Escape",
    "Spacebar": " ",
    "Left": "ArrowLeft",
    "Up": "ArrowUp",
    "Right": "ArrowRight",
    "Down": "ArrowDown",
    "Del": "Delete",
    "Win": "OS",
    "Menu": "ContextMenu",
    "Apps": "ContextMenu",
    "Scroll": "ScrollLock",
    "MozPrintableKey": "Unidentified"
};

translateToKey = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
};


function getEventKey(nativeEvent) {
    var key, charCode;

    if (nativeEvent.key) {
        key = normalizeKey[nativeEvent.key] || nativeEvent.key;

        if (key !== "Unidentified") {
            return key;
        }
    }

    if (nativeEvent.type === "keypress") {
        charCode = getEventCharCode(nativeEvent);

        return charCode === 13 ? "Enter" : String.fromCharCode(charCode);
    }
    if (nativeEvent.type === "keydown" || nativeEvent.type === "keyup") {
        return translateToKey[nativeEvent.keyCode] || "Unidentified";
    }

    return "";
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/getters/getEventCharCode.js */

module.exports = getEventCharCode;


function getEventCharCode(nativeEvent) {
    var keyCode = nativeEvent.keyCode,
        charCode;

    if (nativeEvent.charCode != null) {
        charCode = nativeEvent.charCode;

        if (charCode === 0 && keyCode === 13) {
            charCode = 13;
        }
    } else {
        charCode = keyCode;
    }

    if (charCode >= 32 || charCode === 13) {
        return charCode;
    } else {
        return 0;
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/getters/getTouchEvent.js */

module.exports = getTouchEvent;


function getTouchEvent(obj, nativeEvent) {
    obj.altKey = nativeEvent.altKey;
    obj.metaKey = nativeEvent.metaKey;
    obj.ctrlKey = nativeEvent.ctrlKey;
    obj.shiftKey = nativeEvent.shiftKey;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/syntheticEvents/SyntheticTouch.js */

var getTouch = require(163),
    nativeEventToJSON = require(146),
    createPool = require(48);


var SyntheticTouchPrototype;


module.exports = SyntheticTouch;


function SyntheticTouch(nativeTouch, eventHandler) {
    getTouch(this, nativeTouch, eventHandler);
}
createPool(SyntheticTouch);
SyntheticTouchPrototype = SyntheticTouch.prototype;

SyntheticTouch.create = function(nativeTouch, eventHandler) {
    return this.getPooled(nativeTouch, eventHandler);
};

SyntheticTouchPrototype.destroy = function(instance) {
    SyntheticTouch.release(instance);
};

SyntheticTouchPrototype.destructor = function() {
    this.nativeTouch = null;
    this.identifier = null;
    this.screenX = null;
    this.screenY = null;
    this.clientX = null;
    this.clientY = null;
    this.pageX = null;
    this.pageY = null;
    this.radiusX = null;
    this.radiusY = null;
    this.rotationAngle = null;
    this.force = null;
    this.target = null;
};

SyntheticTouchPrototype.toJSON = function(json) {
    json = json || {};

    json.nativeTouch = nativeEventToJSON(this.nativeTouch);
    json.identifier = this.identifier;
    json.screenX = this.screenX;
    json.screenY = this.screenY;
    json.clientX = this.clientX;
    json.clientY = this.clientY;
    json.pageX = this.pageX;
    json.pageY = this.pageY;
    json.radiusX = this.radiusX;
    json.radiusY = this.radiusY;
    json.rotationAngle = this.rotationAngle;
    json.force = this.force;
    json.target = null;

    return json;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/getters/getTouch.js */

module.exports = getTouch;


function getTouch(obj, nativeTouch, eventHandler) {
    obj.nativeTouch = nativeTouch;
    obj.identifier = nativeTouch.identifier;
    obj.screenX = nativeTouch.screenX;
    obj.screenY = nativeTouch.screenY;
    obj.clientX = nativeTouch.clientX;
    obj.clientY = nativeTouch.clientY;
    obj.pageX = getPageX(nativeTouch, eventHandler.viewport);
    obj.pageY = getPageY(nativeTouch, eventHandler.viewport);
    obj.radiusX = getRadiusX(nativeTouch);
    obj.radiusY = getRadiusY(nativeTouch);
    obj.rotationAngle = getRotationAngle(nativeTouch);
    obj.force = getForce(nativeTouch);
    obj.target = nativeTouch.target;
}

function getPageX(nativeTouch, viewport) {
    return nativeTouch.pageX != null ? nativeTouch.pageX : nativeTouch.clientX + viewport.currentScrollLeft;
}

function getPageY(nativeTouch, viewport) {
    return nativeTouch.pageX != null ? nativeTouch.pageY : nativeTouch.clientY + viewport.currentScrollTop;
}

function getRadiusX(nativeTouch) {
    return (
        nativeTouch.radiusX != null ? nativeTouch.radiusX :
        nativeTouch.webkitRadiusX != null ? nativeTouch.webkitRadiusX :
        nativeTouch.mozRadiusX != null ? nativeTouch.mozRadiusX :
        nativeTouch.msRadiusX != null ? nativeTouch.msRadiusX :
        nativeTouch.oRadiusX != null ? nativeTouch.oRadiusX :
        0
    );
}

function getRadiusY(nativeTouch) {
    return (
        nativeTouch.radiusY != null ? nativeTouch.radiusY :
        nativeTouch.webkitRadiusY != null ? nativeTouch.webkitRadiusY :
        nativeTouch.mozRadiusY != null ? nativeTouch.mozRadiusY :
        nativeTouch.msRadiusY != null ? nativeTouch.msRadiusY :
        nativeTouch.oRadiusY != null ? nativeTouch.oRadiusY :
        0
    );
}

function getRotationAngle(nativeTouch) {
    return (
        nativeTouch.rotationAngle != null ? nativeTouch.rotationAngle :
        nativeTouch.webkitRotationAngle != null ? nativeTouch.webkitRotationAngle :
        nativeTouch.mozRotationAngle != null ? nativeTouch.mozRotationAngle :
        nativeTouch.msRotationAngle != null ? nativeTouch.msRotationAngle :
        nativeTouch.oRotationAngle != null ? nativeTouch.oRotationAngle :
        0
    );
}

function getForce(nativeTouch) {
    return (
        nativeTouch.force != null ? nativeTouch.force :
        nativeTouch.webkitForce != null ? nativeTouch.webkitForce :
        nativeTouch.mozForce != null ? nativeTouch.mozForce :
        nativeTouch.msForce != null ? nativeTouch.msForce :
        nativeTouch.oForce != null ? nativeTouch.oForce :
        1
    );
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/events/getters/getWheelEvent.js */

module.exports = getWheelEvent;


function getWheelEvent(obj, nativeEvent) {
    obj.deltaX = getDeltaX(nativeEvent);
    obj.deltaY = getDeltaY(nativeEvent);
    obj.deltaZ = nativeEvent.deltaZ;
    obj.deltaMode = nativeEvent.deltaMode;
}

function getDeltaX(nativeEvent) {
    return nativeEvent.deltaX != null ? nativeEvent.deltaX : (
        nativeEvent.wheelDeltaX != null ? -nativeEvent.wheelDeltaX : 0
    );
}

function getDeltaY(nativeEvent) {
    return nativeEvent.deltaY != null ? nativeEvent.deltaY : (
        nativeEvent.wheelDeltaY != null ? -nativeEvent.wheelDeltaY : (
            nativeEvent.wheelDelta != null ? -nativeEvent.wheelDelta : 0
        )
    );
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/applyPatch.js */

var virt = require(1),
    createDOMElement = require(166),
    renderMarkup = require(88),
    renderString = require(75),
    renderChildrenString = require(90),
    addDOMNodes = require(167),
    removeDOMNode = require(168),
    removeDOMNodes = require(169),
    getNodeById = require(108),
    applyProperties = require(170);


var consts = virt.consts;


module.exports = applyPatch;


function applyPatch(patch, DOMNode, id, document, rootDOMNode) {
    switch (patch.type) {
        case consts.MOUNT:
            mount(rootDOMNode, patch.next, id);
            break;
        case consts.UNMOUNT:
            unmount(rootDOMNode);
            break;
        case consts.INSERT:
            insert(DOMNode, patch.childId, patch.index, patch.next, document);
            break;
        case consts.REMOVE:
            remove(DOMNode, patch.childId, patch.index);
            break;
        case consts.REPLACE:
            replace(DOMNode, patch.childId, patch.index, patch.next, document);
            break;
        case consts.TEXT:
            text(DOMNode, patch.index, patch.next, patch.props);
            break;
        case consts.ORDER:
            order(DOMNode, patch.order);
            break;
        case consts.PROPS:
            applyProperties(DOMNode, patch.id, patch.next, patch.previous);
            break;
    }
}

function remove(parentNode, id, index) {
    var node;

    if (id === null) {
        node = parentNode.childNodes[index];
    } else {
        node = getNodeById(id);
        removeDOMNode(node);
    }

    parentNode.removeChild(node);
}

function mount(rootDOMNode, view, id) {
    rootDOMNode.innerHTML = renderString(view, null, id);
    addDOMNodes(rootDOMNode.childNodes);
}

function unmount(rootDOMNode) {
    removeDOMNodes(rootDOMNode.childNodes);
    rootDOMNode.innerHTML = "";
}

function insert(parentNode, id, index, view, document) {
    var node = createDOMElement(view, id, document);

    if (view.children) {
        node.innerHTML = renderChildrenString(view.children, view.props, id);
        addDOMNodes(node.childNodes);
    }

    parentNode.appendChild(node);
}

function text(parentNode, index, value, props) {
    var textNode = parentNode.childNodes[index];

    if (textNode) {
        if (textNode.nodeType === 3) {
            textNode.nodeValue = value;
        } else {
            textNode.innerHTML = renderMarkup(value, props);
        }
    }
}

function replace(parentNode, id, index, view, document) {
    var node = createDOMElement(view, id, document);

    if (view.children) {
        node.innerHTML = renderChildrenString(view.children, view.props, id);
        addDOMNodes(node.childNodes);
    }

    parentNode.replaceChild(node, parentNode.childNodes[index]);
}

var order_children = [];

function order(parentNode, orderIndex) {
    var children = order_children,
        childNodes = parentNode.childNodes,
        reverseIndex = orderIndex.reverse,
        removes = orderIndex.removes,
        insertOffset = 0,
        i = -1,
        length = childNodes.length - 1,
        move, node, insertNode;

    children.length = length;
    while (i++ < length) {
        children[i] = childNodes[i];
    }

    i = -1;
    while (i++ < length) {
        move = orderIndex[i];

        if (move !== undefined && move !== i) {
            if (reverseIndex[i] > i) {
                insertOffset++;
            }

            node = children[move];
            insertNode = childNodes[i + insertOffset] || null;

            if (node !== insertNode) {
                parentNode.insertBefore(node, insertNode);
            }

            if (move < i) {
                insertOffset--;
            }
        }

        if (removes[i] != null) {
            insertOffset++;
        }
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/utils/createDOMElement.js */

var virt = require(1),
    isString = require(21),

    DOM_ID_NAME = require(89),
    nodeCache = require(109),

    applyProperties = require(170);


var View = virt.View,
    isPrimitiveView = View.isPrimitiveView;


module.exports = createDOMElement;


function createDOMElement(view, id, document) {
    var node;

    if (isPrimitiveView(view)) {
        return document.createTextNode(view);
    } else if (isString(view.type)) {
        node = document.createElement(view.type);

        applyProperties(node, id, view.props, undefined);

        node.setAttribute(DOM_ID_NAME, id);
        nodeCache[id] = node;

        return node;
    } else {
        throw new TypeError("Arguments is not a valid view");
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/utils/addDOMNodes.js */

var isElement = require(171),
    getNodeId = require(172);


module.exports = addDOMNodes;


function addDOMNodes(nodes) {
    var i = -1,
        il = nodes.length - 1;

    while (i++ < il) {
        addDOMNode(nodes[i]);
    }
}

function addDOMNode(node) {
    if (isElement(node)) {
        getNodeId(node);
        addDOMNodes(node.childNodes);
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/utils/removeDOMNode.js */

var isElement = require(171),
    nodeCache = require(109),
    getNodeAttributeId = require(130);


module.exports = removeDOMNode;


var removeDOMNodes = require(169);


function removeDOMNode(node) {
    if (isElement(node)) {
        delete nodeCache[getNodeAttributeId(node)];
        removeDOMNodes(node.childNodes);
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/utils/removeDOMNodes.js */

module.exports = removeDOMNodes;


var removeDOMNode = require(168);


function removeDOMNodes(nodes) {
    var i = -1,
        il = nodes.length - 1;

    while (i++ < il) {
        removeDOMNode(nodes[i]);
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/applyProperties.js */

var isString = require(21),
    isObject = require(33),
    isFunction = require(19),
    getPrototypeOf = require(36);


module.exports = applyProperties;


function applyProperties(node, id, props, previous) {
    var propKey, propValue;

    for (propKey in props) {
        propValue = props[propKey];

        if (propKey !== "dangerouslySetInnerHTML" && !isFunction(propValue)) {
            if (propValue == null && previous != null) {
                removeProperty(node, id, previous, propKey);
            } else if (isObject(propValue)) {
                applyObject(node, previous, propKey, propValue);
            } else if (propValue != null && (!previous || previous[propKey] !== propValue)) {
                applyProperty(node, id, propKey, propValue);
            }
        }
    }
}

function applyProperty(node, id, propKey, propValue) {
    if (propKey !== "className" && node.setAttribute) {
        node.setAttribute(propKey, propValue);
    } else {
        node[propKey] = propValue;
    }
}

function removeProperty(node, id, previous, propKey) {
    var canRemoveAttribute = !!node.removeAttribute,
        previousValue = previous[propKey],
        keyName, style;

    if (propKey === "attributes") {
        for (keyName in previousValue) {
            if (canRemoveAttribute) {
                node.removeAttribute(keyName);
            } else {
                node[keyName] = isString(previousValue[keyName]) ? "" : null;
            }
        }
    } else if (propKey === "style") {
        style = node.style;

        for (keyName in previousValue) {
            style[keyName] = "";
        }
    } else {
        if (propKey !== "className" && canRemoveAttribute) {
            node.removeAttribute(propKey);
        } else {
            node[propKey] = isString(previousValue) ? "" : null;
        }
    }
}

function applyObject(node, previous, propKey, propValues) {
    var previousValue, key, value, nodeProps, replacer;

    if (propKey === "attributes") {
        for (key in propValues) {
            value = propValues[key];

            if (value === undefined) {
                node.removeAttribute(key);
            } else {
                node.setAttribute(key, value);
            }
        }

        return;
    }

    previousValue = previous ? previous[propKey] : undefined;

    if (
        previousValue != null &&
        isObject(previousValue) &&
        getPrototypeOf(previousValue) !== getPrototypeOf(propValues)
    ) {
        node[propKey] = propValues;
        return;
    }

    nodeProps = node[propKey];

    if (!isObject(nodeProps)) {
        nodeProps = node[propKey] = {};
    }

    replacer = propKey === "style" ? "" : undefined;

    for (key in propValues) {
        value = propValues[key];
        nodeProps[key] = (value === undefined) ? replacer : value;
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_element/src/index.js */

var isNode = require(106);


module.exports = isElement;


function isElement(value) {
    return isNode(value) && value.nodeType === 1;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/utils/getNodeId.js */

var has = require(25),
    nodeCache = require(109),
    getNodeAttributeId = require(130);


module.exports = getNodeId;


function getNodeId(node) {
    return node && getId(node);
}

function getId(node) {
    var id = getNodeAttributeId(node),
        localNodeCache, cached;

    if (id) {
        localNodeCache = nodeCache;

        if (has(localNodeCache, id)) {
            cached = localNodeCache[id];

            if (cached !== node) {
                localNodeCache[id] = node;
            }
        } else {
            localNodeCache[id] = node;
        }
    }

    return id;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/utils/getRootNodeInContainer.js */

module.exports = getRootNodeInContainer;


function getRootNodeInContainer(containerNode) {
    if (!containerNode) {
        return null;
    } else {
        if (containerNode.nodeType === 9) {
            return containerNode.documentElement;
        } else {
            return containerNode.firstChild;
        }
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/messenger_worker_adapter/src/index.js */

var isString = require(21),
    environment = require(3);


var MessengerWorkerAdapterPrototype,
    globalWorker;


if (environment.worker) {
    globalWorker = self;
}


module.exports = MessengerWorkerAdapter;


function MessengerWorkerAdapter(url) {
    this.__worker = environment.worker ? globalWorker : (isString(url) ? new Worker(url) : url);
}
MessengerWorkerAdapterPrototype = MessengerWorkerAdapter.prototype;

MessengerWorkerAdapterPrototype.addMessageListener = function(callback) {
    this.__worker.addEventListener("message", function onMessage(e) {
        callback(JSON.parse(e.data));
    });
};

MessengerWorkerAdapterPrototype.postMessage = function(data) {
    this.__worker.postMessage(JSON.stringify(data));
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/worker/WorkerAdapter.js */

var virt = require(1),
    Messenger = require(118),
    MessengerWorkerAdapter = require(174),
    nativeDOMComponents = require(76),
    registerNativeComponents = require(121),
    consts = require(110),
    eventClassMap = require(124);


var traverseAncestors = virt.traverseAncestors;


module.exports = WorkerAdapter;


function WorkerAdapter(root) {
    var messenger = new Messenger(new MessengerWorkerAdapter()),
        eventManager = root.eventManager,
        viewport = {
            currentScrollLeft: 0,
            currentScrollTop: 0
        },
        eventHandler = {
            window: global,
            document: global,
            viewport: viewport
        },
        events = eventManager.events;

    this.root = root;
    this.messenger = messenger;

    eventManager.propNameToTopLevel = consts.propNameToTopLevel;

    messenger.on("virt.dom.handleEventDispatch", function(data, callback) {
        var childHash = root.childHash,
            topLevelType = data.topLevelType,
            nativeEvent = data.nativeEvent,
            targetId = data.targetId,
            eventType = events[topLevelType],
            target = childHash[targetId],
            event;

        if (target) {
            target = target.component;
        } else {
            target = null;
        }

        viewport.currentScrollLeft = data.currentScrollLeft;
        viewport.currentScrollTop = data.currentScrollTop;

        traverseAncestors(targetId, function(currentTargetId) {
            if (eventType[currentTargetId]) {
                event = event || eventClassMap[topLevelType].getPooled(nativeEvent, eventHandler);
                event.target = event.componentTarget = target;
                event.currentTarget = event.currentComponentTarget = childHash[currentTargetId].component;
                eventType[currentTargetId](event);
                return event.returnValue;
            } else {
                return true;
            }
        });

        if (event && event.isPersistent !== true) {
            event.destroy();
        }

        callback();
    });

    this.handle = function(transaction, callback) {
        messenger.emit("virt.dom.handleTransaction", transaction, callback);
    };

    registerNativeComponents(root, nativeDOMComponents);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/messenger_websocket_adapter/src/index.js */

var MessengerWebSocketAdapterPrototype;


module.exports = MessengerWebSocketAdapter;


function MessengerWebSocketAdapter(socket, attachMessage, sendMessage) {
    this.__socket = socket;

    this.__attachMessage = attachMessage || defaultAttachMessage;
    this.__sendMessage = sendMessage || defaultSendMessage;
}
MessengerWebSocketAdapterPrototype = MessengerWebSocketAdapter.prototype;

MessengerWebSocketAdapterPrototype.addMessageListener = function(callback) {
    this.__attachMessage(this.__socket, callback);
};

MessengerWebSocketAdapterPrototype.postMessage = function(data) {
    this.__sendMessage(this.__socket, data);
};

function defaultAttachMessage(socket, callback) {
    socket.onmessage = function onMessage(e) {
        callback(JSON.parse(e.data));
    };
}

function defaultSendMessage(socket, data) {
    socket.send(JSON.stringify(data));
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/virt-dom/src/websocket/WebSocketAdapter.js */

var virt = require(1),
    Messenger = require(118),
    MessengerWebSocketAdapter = require(176),
    nativeDOMComponents = require(76),
    registerNativeComponents = require(121),
    consts = require(110),
    eventClassMap = require(124);


var traverseAncestors = virt.traverseAncestors;


module.exports = WebSocketAdapter;


function WebSocketAdapter(root, socket, attachMessage, sendMessage) {
    var messenger = new Messenger(new MessengerWebSocketAdapter(socket, attachMessage, sendMessage)),
        eventManager = root.eventManager,
        viewport = {
            currentScrollLeft: 0,
            currentScrollTop: 0
        },
        eventHandler = {
            window: global,
            document: global,
            viewport: viewport
        },
        events = eventManager.events;

    this.root = root;
    this.messenger = messenger;

    eventManager.propNameToTopLevel = consts.propNameToTopLevel;

    messenger.on("virt.dom.handleEventDispatch", function(data, callback) {
        var childHash = root.childHash,
            topLevelType = data.topLevelType,
            nativeEvent = data.nativeEvent,
            targetId = data.targetId,
            eventType = events[topLevelType],
            target = childHash[targetId],
            event;

        if (target) {
            target = target.component;
        } else {
            target = null;
        }

        viewport.currentScrollLeft = data.currentScrollLeft;
        viewport.currentScrollTop = data.currentScrollTop;

        traverseAncestors(targetId, function(currentTargetId) {
            if (eventType[currentTargetId]) {
                event = event || eventClassMap[topLevelType].getPooled(nativeEvent, eventHandler);
                event.target = event.componentTarget = target;
                event.currentTarget = event.currentComponentTarget = childHash[currentTargetId].component;
                eventType[currentTargetId](event);
                return event.returnValue;
            } else {
                return true;
            }
        });

        if (event && event.isPersistent !== true) {
            event.destroy();
        }

        callback();
    });

    this.handle = function(transaction, callback) {
        messenger.emit("virt.dom.handleTransaction", transaction, callback);
    };

    registerNativeComponents(root, nativeDOMComponents);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/event_emitter/src/index.js */

var isFunction = require(19),
    inherits = require(68),
    fastSlice = require(191),
    keys = require(41),
    isNullOrUndefined = require(23);


var EventEmitterPrototype;


module.exports = EventEmitter;


function EventEmitter(maxListeners) {
    this.__events = {};
    this.__maxListeners = isNullOrUndefined(maxListeners) ? +maxListeners : EventEmitter.defaultMaxListeners;
}
EventEmitterPrototype = EventEmitter.prototype;

EventEmitterPrototype.on = function(name, listener) {
    var events, eventList, maxListeners;

    if (!isFunction(listener)) {
        throw new TypeError("EventEmitter.on(name, listener) listener must be a function");
    }

    events = this.__events || (this.__events = {});
    eventList = (events[name] || (events[name] = []));
    maxListeners = this.__maxListeners || -1;

    eventList[eventList.length] = listener;

    if (maxListeners !== -1 && eventList.length > maxListeners) {
        console.error(
            "EventEmitter.on(type, listener) possible EventEmitter memory leak detected. " + maxListeners + " listeners added"
        );
    }

    return this;
};

EventEmitterPrototype.addEventListener = EventEmitterPrototype.addListener = EventEmitterPrototype.on;

EventEmitterPrototype.once = function(name, listener) {
    var _this = this;

    function once() {

        _this.off(name, once);

        switch (arguments.length) {
            case 0:
                return listener();
            case 1:
                return listener(arguments[0]);
            case 2:
                return listener(arguments[0], arguments[1]);
            case 3:
                return listener(arguments[0], arguments[1], arguments[2]);
            case 4:
                return listener(arguments[0], arguments[1], arguments[2], arguments[3]);
            default:
                return listener.apply(null, arguments);
        }
    }

    this.on(name, once);

    return once;
};

EventEmitterPrototype.listenTo = function(value, name) {
    var _this = this;

    if (!value || !(isFunction(value.on) || isFunction(value.addListener))) {
        throw new TypeError("EventEmitter.listenTo(value, name) value must have a on function taking (name, listener[, ctx])");
    }

    function handler() {
        _this.emitArgs(name, arguments);
    }

    value.on(name, handler);

    return handler;
};

EventEmitterPrototype.off = function(name, listener) {
    var events = this.__events || (this.__events = {}),
        eventList, event, i;

    eventList = events[name];
    if (!eventList) {
        return this;
    }

    if (!listener) {
        i = eventList.length;

        while (i--) {
            this.emit("removeListener", name, eventList[i]);
        }
        eventList.length = 0;
        delete events[name];
    } else {
        i = eventList.length;

        while (i--) {
            event = eventList[i];

            if (event === listener) {
                this.emit("removeListener", name, event);
                eventList.splice(i, 1);
            }
        }

        if (eventList.length === 0) {
            delete events[name];
        }
    }

    return this;
};

EventEmitterPrototype.removeEventListener = EventEmitterPrototype.removeListener = EventEmitterPrototype.off;

EventEmitterPrototype.removeAllListeners = function() {
    var events = this.__events || (this.__events = {}),
        objectKeys = keys(events),
        i = -1,
        il = objectKeys.length - 1,
        key, eventList, j;

    while (i++ < il) {
        key = objectKeys[i];
        eventList = events[key];

        if (eventList) {
            j = eventList.length;

            while (j--) {
                this.emit("removeListener", key, eventList[j]);
                eventList.splice(j, 1);
            }
        }

        delete events[key];
    }

    return this;
};

function emit(eventList, args) {
    var a1, a2, a3, a4, a5,
        length = eventList.length - 1,
        i = -1,
        event;

    switch (args.length) {
        case 0:
            while (i++ < length) {
                if ((event = eventList[i])) {
                    event();
                }
            }
            break;
        case 1:
            a1 = args[0];
            while (i++ < length) {
                if ((event = eventList[i])) {
                    event(a1);
                }
            }
            break;
        case 2:
            a1 = args[0];
            a2 = args[1];
            while (i++ < length) {
                if ((event = eventList[i])) {
                    event(a1, a2);
                }
            }
            break;
        case 3:
            a1 = args[0];
            a2 = args[1];
            a3 = args[2];
            while (i++ < length) {
                if ((event = eventList[i])) {
                    event(a1, a2, a3);
                }
            }
            break;
        case 4:
            a1 = args[0];
            a2 = args[1];
            a3 = args[2];
            a4 = args[3];
            while (i++ < length) {
                if ((event = eventList[i])) {
                    event(a1, a2, a3, a4);
                }
            }
            break;
        case 5:
            a1 = args[0];
            a2 = args[1];
            a3 = args[2];
            a4 = args[3];
            a5 = args[4];
            while (i++ < length) {
                if ((event = eventList[i])) {
                    event(a1, a2, a3, a4, a5);
                }
            }
            break;
        default:
            while (i++ < length) {
                if ((event = eventList[i])) {
                    event.apply(null, args);
                }
            }
            break;
    }
}

EventEmitterPrototype.emitArgs = function(name, args) {
    var eventList = (this.__events || (this.__events = {}))[name];

    if (!eventList || !eventList.length) {
        return this;
    }

    emit(eventList, args);

    return this;
};

EventEmitterPrototype.emit = function(name) {
    return this.emitArgs(name, fastSlice(arguments, 1));
};

function createFunctionCaller(args) {
    switch (args.length) {
        case 0:
            return function functionCaller(fn) {
                return fn();
            };
        case 1:
            return function functionCaller(fn) {
                return fn(args[0]);
            };
        case 2:
            return function functionCaller(fn) {
                return fn(args[0], args[1]);
            };
        case 3:
            return function functionCaller(fn) {
                return fn(args[0], args[1], args[2]);
            };
        case 4:
            return function functionCaller(fn) {
                return fn(args[0], args[1], args[2], args[3]);
            };
        case 5:
            return function functionCaller(fn) {
                return fn(args[0], args[1], args[2], args[3], args[4]);
            };
        default:
            return function functionCaller(fn) {
                return fn.apply(null, args);
            };
    }
}

function emitAsync(eventList, args, callback) {
    var length = eventList.length,
        index = 0,
        called = false,
        functionCaller;

    function next(err) {
        if (called !== true) {
            if (err || index === length) {
                called = true;
                callback(err);
            } else {
                functionCaller(eventList[index++]);
            }
        }
    }

    args[args.length] = next;
    functionCaller = createFunctionCaller(args);
    next();
}

EventEmitterPrototype.emitAsync = function(name, args, callback) {
    var eventList = (this.__events || (this.__events = {}))[name];

    args = fastSlice(arguments, 1);
    callback = args.pop();

    if (!isFunction(callback)) {
        throw new TypeError("EventEmitter.emitAsync(name [, ...args], callback) callback must be a function");
    }

    if (!eventList || !eventList.length) {
        callback();
    } else {
        emitAsync(eventList, args, callback);
    }

    return this;
};

EventEmitterPrototype.listeners = function(name) {
    var eventList = (this.__events || (this.__events = {}))[name];
    return eventList ? eventList.slice() : [];
};

EventEmitterPrototype.listenerCount = function(name) {
    var eventList = (this.__events || (this.__events = {}))[name];
    return eventList ? eventList.length : 0;
};

EventEmitterPrototype.setMaxListeners = function(value) {
    if ((value = +value) !== value) {
        throw new TypeError("EventEmitter.setMaxListeners(value) value must be a number");
    }

    this.__maxListeners = value < 0 ? -1 : value;
    return this;
};

inherits.defineProperty(EventEmitter, "defaultMaxListeners", 10);

inherits.defineProperty(EventEmitter, "listeners", function(value, name) {
    var eventList;

    if (isNullOrUndefined(value)) {
        throw new TypeError("EventEmitter.listeners(value, name) value required");
    }
    eventList = value.__events && value.__events[name];

    return eventList ? eventList.slice() : [];
});

inherits.defineProperty(EventEmitter, "listenerCount", function(value, name) {
    var eventList;

    if (isNullOrUndefined(value)) {
        throw new TypeError("EventEmitter.listenerCount(value, name) value required");
    }
    eventList = value.__events && value.__events[name];

    return eventList ? eventList.length : 0;
});

inherits.defineProperty(EventEmitter, "setMaxListeners", function(value) {
    if ((value = +value) !== value) {
        throw new TypeError("EventEmitter.setMaxListeners(value) value must be a number");
    }

    EventEmitter.defaultMaxListeners = value < 0 ? -1 : value;
    return value;
});

EventEmitter.extend = function(child) {
    inherits(child, this);
    return child;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/page/src/index.js */

var urls = require(193),
    urlPath = require(194),
    sameOrigin = require(195),
    isString = require(21),
    EventEmitter = require(178),
    eventListener = require(4),
    environment = require(3);


var page = new EventEmitter(),

    window = environment.window,
    document = environment.document,

    location = window.location || {},
    navigator = window.navigator || {},
    history = window.history,

    pageTitle = document.title || "",
    pageListening = false,
    pageHtml5Mode = false,
    pageOrigin = location.origin,
    pageBase = "/",
    pageCurrentPath = location.pathname,
    pageHistory = [],

    supportsHtml5Mode = (function() {
        var userAgent = navigator.userAgent || "";
        if (
            (userAgent.indexOf("Android 2.") !== -1 || userAgent.indexOf("Android 4.0") !== -1) &&
            userAgent.indexOf("Mobile Safari") !== -1 &&
            userAgent.indexOf("Chrome") === -1
        ) {
            return false;
        }

        return (history && history.pushState != null);
    }());


page.init = page.listen = function() {
    if (pageListening === false) {
        pageListening = true;

        eventListener.on(window, "click", onclick);
        eventListener.on(window, "popstate", onpopstate);
        eventListener.on(window, "hashchange", onhashchange);

        page.emit("listen");
        page.go((pageHtml5Mode ? urlPath.relative(pageBase, location.pathname + location.search) : location.hash.slice(1)) || "/");
    }

    return page;
};

page.close = function() {
    if (pageListening === true) {
        pageListening = false;

        eventListener.off(window, "click", onclick);
        eventListener.off(window, "popstate", onpopstate);
        eventListener.off(window, "hashchange", onhashchange);

        page.emit("close");
    }

    return page;
};

page.html5Mode = function(value) {
    if (value != null && supportsHtml5Mode) {
        pageHtml5Mode = !!value;
    }
    return pageHtml5Mode;
};

page.base = function(value) {
    if (isString(value)) {
        pageBase = value;
    }
    return pageBase;
};

page.go = function(path) {
    var ctx = buildContext(path);

    replaceState(ctx, ctx.fullUrl.path);
    page.emit("request", ctx);

    return page;
};

page.titleBase = function(value) {
    if (isString(value)) {
        pageTitle = value;
    }
    return pageTitle;
};

page.title = function(value) {
    if (isString(value)) {
        value = pageTitle + value;
        document.title = value;
    } else {
        value = document.title;
    }
    return value;
};

page.hasHistory = function() {
    return pageHistory.length !== 0;
};

page.back = function(fallback) {
    var historyCache = pageHistory,
        currentPath = pageCurrentPath,
        i = historyCache.length,
        path;

    while (i--) {
        path = historyCache[i];

        if (path !== currentPath) {
            historyCache.length = i + 1;
            return page.go(path);
        }
    }

    if (isString(fallback)) {
        return page.go(fallback);
    } else {
        return false;
    }
};

page.reload = function() {
    var ctx = buildContext(pageCurrentPath);
    page.emit("request", ctx);
    return page;
};

function buildContext(path) {
    var ctx = {},
        fullUrl = urls.parse(pageOrigin + path, true),
        pathname = fullUrl.pathname;

    ctx.fullUrl = fullUrl;
    ctx.pathname = pathname;
    ctx.query = fullUrl.query;

    return ctx;
}

function replaceState(ctx, path) {
    pageHistory.push(pageCurrentPath);
    pageCurrentPath = path;
    setState(ctx, path);
}

function setState(ctx, path) {
    if (pageHtml5Mode) {
        history.replaceState({
            path: ctx.path
        }, ctx.fullUrl.path, urlPath.join(pageBase, path));
    } else {
        location.hash = path;
    }
}

function onpopstate(e) {
    if (pageHtml5Mode && e.state) {
        page.go(e.state.fullUrl.path);
    }
}

function onhashchange() {
    var path = location.hash.slice(1) || "/";

    if (!pageHtml5Mode && pageCurrentPath !== path) {
        page.go(path);
    }
}

function onclick(e) {
    var el, link;

    if (
        which(e) !== 1 ||
        e.metaKey || e.ctrlKey || e.shiftKey ||
        e.defaultPrevented
    ) {
        return;
    }

    el = e.target;
    while (el && el.nodeName !== "A") {
        el = el.parentNode;
    }

    if (!el || "A" !== el.nodeName ||
        el.getAttribute("download") || el.getAttribute("rel") === "external"
    ) {
        return;
    }

    link = el.getAttribute("href") || el.href;

    if (!link || el.target) {
        return;
    }

    link = link[0] === "#" ? link.slice(1) : link;

    if (link && (link.indexOf("mailto:") > -1 || link.indexOf("tel:") > -1)) {
        return;
    }

    if (
        el.href && !sameOrigin.browser(el.href) ||
        (urlPath.isAbsoluteURL(link) && !sameOrigin.browser(link))
    ) {
        return;
    }

    e.preventDefault();
    page.go(urls.parse(link).path);
}

function which(e) {
    e = e || window.event;
    return e.which == null ? +e.button : +e.which;
}


module.exports = page;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/virt-modal/src/index.js */

var modal = exports;


modal.Modal = require(204);
modal.Modals = require(205);
modal.ModalStore = require(206);


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/request/src/browser.js */

module.exports = require(234)(require(235));


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/i18n/src/index.js */

var isArray = require(20),
    isString = require(21),
    isObject = require(33),
    format = require(233),
    fastSlice = require(191),
    has = require(25),
    defineProperty = require(58);


var translationCache = global.__I18N_TRANSLATIONS__;


if (!translationCache) {
    translationCache = {};
    defineProperty(global, "__I18N_TRANSLATIONS__", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: translationCache
    });
}


module.exports = create(false, false);


function create(flatMode, throwMissingError) {

    flatMode = !!flatMode;
    throwMissingError = !!throwMissingError;


    function i18n(locale, key) {
        return i18n.translate(locale, key, fastSlice(arguments, 2));
    }

    i18n.create = create;

    i18n.translate = function(locale, key, args) {
        var translations = translationCache[locale] || null;

        if (translations === null) {
            throw new Error("i18n(key[, locale[, ...args]]) no translations for " + locale + " locale");
        }
        if (!isString(key)) {
            throw new TypeError("i18n(key[, locale[, ...args]]) key must be a String");
        }

        args = isArray(args) ? args : [];

        if (flatMode === true) {
            return translateFlat(key, translations, args);
        } else {
            return translate(key, translations, args);
        }
    };

    i18n.flatMode = function(value) {
        flatMode = !!value;
    };

    i18n.throwMissingError = function(value) {
        throwMissingError = !!value;
    };

    i18n.reset = function() {
        flatMode = false;
        throwMissingError = false;
    };

    i18n.has = function(locale, key) {
        if (has(translationCache[locale], key)) {
            return true;
        } else {
            return false;
        }
    };

    i18n.add = function(locale, object) {
        var translations = translationCache[locale] || (translationCache[locale] = {}),
            localHas, key;

        if (isObject(object)) {
            localHas = has;

            for (key in object) {
                if (localHas(object, key)) {
                    if (localHas(translations, key)) {
                        throw new TypeError("i18n.add(locale, object) cannot override " + locale + " translation with key " + key);
                    } else {
                        translations[key] = object[key];
                    }
                }
            }
        } else {
            throw new TypeError("i18n.add(locale, object) object must be an Object");
        }
    };

    function missingTranslation(key) {
        if (throwMissingError) {
            throw new Error("i18n(locale, key) missing translation for key " + key);
        } else {
            return "--" + key + "--";
        }
    }

    function translate(key, translations, args) {
        var origKey = key,
            keys = key.split("."),
            length = keys.length - 1,
            i = 0,
            value = translations[keys[i]];


        while (i++ < length) {
            key = keys[i];

            if (isObject(value)) {
                value = value[key];

                if (value == null) {
                    return missingTranslation(origKey);
                }
            } else {
                return missingTranslation(origKey);
            }
        }

        if (value == null || isObject(value)) {
            return missingTranslation(origKey);
        } else {
            return args.length !== 0 ? format.array(value, args) : value;
        }
    }

    function translateFlat(key, translations, args) {
        var value = translations[key];

        if (value == null || isObject(value)) {
            return missingTranslation(key);
        } else {
            return args.length !== 0 ? format.array(value, args) : value;
        }
    }

    return i18n;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/dispatcher.js */

var EventEmitter = require(178);


var DispatcherPrototype,

    DISPATCH = "dispatch",
    VIEW_ACTION = "VIEW_ACTION",
    SERVER_ACTION = "SERVER_ACTION";


function Dispatcher() {
    EventEmitter.call(this, -1);
}
EventEmitter.extend(Dispatcher);
DispatcherPrototype = Dispatcher.prototype;

DispatcherPrototype.register = function(callback) {
    return this.on(DISPATCH, callback);
};

DispatcherPrototype.unregister = function(callback) {
    return this.off(DISPATCH, callback);
};

DispatcherPrototype.dispatch = function(payload) {
    return this.emit(DISPATCH, payload);
};

DispatcherPrototype.handleViewAction = function(action) {
    this.dispatch({
        source: VIEW_ACTION,
        action: action
    });
};

DispatcherPrototype.handleServerAction = function(action) {
    this.dispatch({
        source: SERVER_ACTION,
        action: action
    });
};


module.exports = new Dispatcher();


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/router.js */

var layers = require(248);


module.exports = new layers.Router();


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/utils/i18n.js */

var i18n = require(182),
    fastSlice = require(191),
    UserStore = require(188);


module.exports = i18nBound;


function i18nBound(key) {
    return i18n(UserStore.user.locale, key, fastSlice(arguments, 1));
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/components/App.js */

var virt = require(1),
    propTypes = require(208),
    app = require(5),
    Theme = require(267),
    RouteStore = require(187);


var AppPrototype;


module.exports = App;


function App(props, children, context) {
    var _this = this;

    virt.Component.call(this, props, children, context);

    this.theme = new Theme();
    this.size = null;

    this.state = {
        render: null
    };

    this.onChange = function() {
        return _this.__onChange();
    };

    this.onResize = function(data, next, messenger) {
        return _this.__onResize(data, next, messenger);
    };
}
virt.Component.extend(App, "App");
AppPrototype = App.prototype;

App.childContextTypes = {
    theme: propTypes.object.isRequired,
    size: propTypes.object
};

AppPrototype.getChildContext = function() {
    return {
        theme: this.theme,
        size: this.size
    };
};

AppPrototype.__onChange = function() {
    var pageState = RouteStore.getState(),
        renderPage = app.getPage(pageState);

    if (renderPage) {
        this.setState({
            ctx: RouteStore.getContext(),
            render: renderPage
        });
    } else {
        throw new Error("App onChange no page state found named " + pageState);
    }
};

AppPrototype.__onResize = function(data, next) {
    this.size = data;
    this.forceUpdate();
    next();
};

AppPrototype.componentDidMount = function() {
    var _this = this;

    RouteStore.addChangeListener(this.onChange);
    this.onMessage("virt.resize", this.onResize);

    this.emitMessage("virt.getDeviceDimensions", null, function(error, data) {
        if (!error) {
            _this.size = data;
        }
    });
};

AppPrototype.componentWillUnmount = function() {
    RouteStore.removeChangeListener(this.onChange);
    this.offMessage("virt.resize", this.onResize);
};

AppPrototype.render = function() {
    if (this.state.render) {
        return (
            virt.createView("div", {
                className: "App"
            }, this.state.render(this.state.ctx))
        );
    } else {
        return (
            virt.createView("div", {
                className: "App"
            })
        );
    }
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/stores/RouteStore.js */

var Store = require(265),
    app = require(5);


var RouteStore = module.exports = new Store(),

    _route = {
        context: {},
        state: null
    },

    consts = RouteStore.setConsts([
        "ROUTE_CHANGE",
        "ROUTE_UPDATE"
    ]);


function update(ctx, state) {
    var context = _route.context;

    context.fullUrl = ctx.fullUrl;
    context.pathname = ctx.pathname;
    context.query = ctx.query;
    context.params = ctx.params;

    _route.state = state;
}

function handleContext(ctx) {
    app.router.handler(ctx, function(error) {
        if (error) {
            throw error;
        }
    });
}

RouteStore.getState = function() {
    return _route.state;
};

RouteStore.getContext = function() {
    return _route.context;
};

RouteStore.toJSON = function() {
    return _route;
};

RouteStore.fromJSON = function(json) {
    _route = json;
};

RouteStore.register(function onRoutePayload(payload) {
    var action = payload.action;

    if (action.actionType === consts.ROUTE_CHANGE) {
        handleContext(action.ctx);
    } else if (action.actionType === consts.ROUTE_UPDATE) {
        update(action.ctx, action.state);
        RouteStore.emitChange();
    }
});


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/stores/UserStore.js */

var cookies = require(264),
    indexOf = require(61),
    emptyFunction = require(42),
    app = require(5),
    Store = require(265);


var UserStore = module.exports = new Store(),

    LOCALE_KEY = "X-BomontFlooring-User.Locale",

    consts = UserStore.setConsts([
        "USER_CHANGE_LOCALE"
    ]),

    navigatorLanguage = (
        navigator.language ||
        (navigator.userLanguage && navigator.userLanguage.replace(/-[a-z]{2}$/, String.prototype.toUpperCase)) ||
        "en"
    ),

    defaultLocale;


app.on("init", function() {
    defaultLocale = indexOf(app.config.locales, navigatorLanguage) !== -1 ? navigatorLanguage : app.config.locales[0];
    setLocale(defaultLocale);
});


UserStore.user = {
    locale: null
};

UserStore.toJSON = function() {
    return {
        user: UserStore.user
    };
};

UserStore.fromJSON = function(json) {
    UserStore.user.locale = json.locale || defaultLocale;
};

UserStore.setLocale = function(value, callback) {
    var changed = setLocale(value);
    (callback || emptyFunction)();
    return changed;
};

function setLocale(value) {
    var last = UserStore.user.locale;

    value = indexOf(app.config.locales, value) === -1 ? app.config.locales[0] : value;

    if (last !== value) {
        UserStore.user.locale = value;
        cookies.set(LOCALE_KEY, value);
        return true;
    } else {
        return false;
    }
}

UserStore.register(function onUserPayload(payload) {
    var action = payload.action;

    switch (action.actionType) {
        case consts.USER_CHANGE_LOCALE:
            if (UserStore.setLocale(action.locale)) {
                UserStore.emit("changeLocale");
            }
            break;
    }
});


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/views/index.js */

require(269);
require(270);
require(271);
require(272);
require(273);
require(274);
require(275);
require(276);


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/routes/index.js */

var app = require(5);


app.router.use(
    require(301)
);

require(302);
require(303);
require(304);
require(305);
require(306);
require(307);
require(308);
require(309);


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/fast_slice/src/index.js */

var clamp = require(192),
    isNumber = require(24);


module.exports = fastSlice;


function fastSlice(array, offset) {
    var length = array.length,
        newLength, i, il, result, j;

    offset = clamp(isNumber(offset) ? offset : 0, 0, length);
    i = offset - 1;
    il = length - 1;
    newLength = length - offset;
    result = new Array(newLength);
    j = 0;

    while (i++ < il) {
        result[j++] = array[i];
    }

    return result;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/clamp/src/index.js */

module.exports = clamp;


function clamp(x, min, max) {
    if (x < min) {
        return min;
    } else if (x > max) {
        return max;
    } else {
        return x;
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/urls/src/index.js */

var isObject = require(33),
    isString = require(21),
    isNullOrUndefined = require(23),
    isNull = require(29),
    punycode = require(196),
    qs = require(197);


var urls = module.exports,

    protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,
    delims = ["<", ">", '"', "`", " ", "\r", "\n", "	"],
    unwise = ["{", "}", "|", "\\", "^", "`"].concat(delims),
    autoEscape = ["'"].concat(unwise),
    nonHostChars = ["%", "/", "?", ";", "#"].concat(autoEscape),
    hostEndingChars = ["/", "?", "#"],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
    unsafeProtocol = {
        javascript: true,
        "javascript:": true
    },
    hostlessProtocol = {
        javascript: true,
        "javascript:": true
    },
    slashedProtocol = {
        http: true,
        https: true,
        ftp: true,
        gopher: true,
        file: true,
        "http:": true,
        "https:": true,
        "ftp:": true,
        "gopher:": true,
        "file:": true
    };


function Url() {
    this.protocol = null;
    this.slashes = null;
    this.auth = null;
    this.host = null;
    this.port = null;
    this.hostname = null;
    this.hash = null;
    this.search = null;
    this.query = null;
    this.pathname = null;
    this.path = null;
    this.href = null;
}

function urlParse(url, parseQueryString, slashesDenoteHost) {
    if (url && isObject(url) && url instanceof Url) {
        return url;
    }
    var u = new Url();
    u.parse(url, parseQueryString, slashesDenoteHost);
    return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
    var hashSplit, rest, simplePath, proto, lowerProto, slashes, hostEnd, i, hec, auth, atSign, ipv6Hostname, hostparts, l, part, newpart, j, k, validParts, notHost, bit, p, h, ae, esc, hash, qm, s;
    if (!isString(url)) {
        throw new TypeError("Parameter 'url' must be a string, not " + typeof(url));
    }
    hashSplit = url.split("#");
    hashSplit[0] = hashSplit[0].replace(/\\/g, "/");
    url = hashSplit.join("#");
    rest = url;
    rest = rest.trim();
    if (!slashesDenoteHost && 1 === hashSplit.length) {
        simplePath = simplePathPattern.exec(rest);
        if (simplePath) {
            this.path = rest;
            this.href = rest;
            this.pathname = simplePath[1];
            if (simplePath[2]) {
                this.search = simplePath[2];
                this.query = parseQueryString ? qs.parse(this.search.substr(1)) : this.search.substr(1);
            }
            return this;
        }
    }
    proto = protocolPattern.exec(rest);
    if (proto) {
        proto = proto[0];
        lowerProto = proto.toLowerCase();
        this.protocol = lowerProto;
        rest = rest.substr(proto.length);
    }
    if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
        slashes = "//" === rest.substr(0, 2);
        if (slashes && !(proto && hostlessProtocol[proto])) {
            rest = rest.substr(2);
            this.slashes = true;
        }
    }
    if (!hostlessProtocol[proto] && (slashes || proto && !slashedProtocol[proto])) {
        hostEnd = -1;
        for (i = 0; i < hostEndingChars.length; i++) {
            hec = rest.indexOf(hostEndingChars[i]); - 1 === hec || -1 !== hostEnd && hec >= hostEnd || (hostEnd = hec);
        }
        atSign = -1 === hostEnd ? rest.lastIndexOf("@") : rest.lastIndexOf("@", hostEnd);
        if (-1 !== atSign) {
            auth = rest.slice(0, atSign);
            rest = rest.slice(atSign + 1);
            this.auth = decodeURIComponent(auth);
        }
        hostEnd = -1;
        for (i = 0; i < nonHostChars.length; i++) {
            hec = rest.indexOf(nonHostChars[i]); - 1 === hec || -1 !== hostEnd && hec >= hostEnd || (hostEnd = hec);
        } - 1 === hostEnd && (hostEnd = rest.length);
        this.host = rest.slice(0, hostEnd);
        rest = rest.slice(hostEnd);
        this.parseHost();
        this.hostname = this.hostname || "";
        ipv6Hostname = "[" === this.hostname[0] && "]" === this.hostname[this.hostname.length - 1];
        if (!ipv6Hostname) {
            hostparts = this.hostname.split(/\./);
            for (i = 0, l = hostparts.length; l > i; i++) {
                part = hostparts[i];
                if (part && !part.match(hostnamePartPattern)) {
                    newpart = "";
                    for (j = 0, k = part.length; k > j; j++) {
                        newpart += part.charCodeAt(j) > 127 ? "x" : part[j];
                    }
                    if (!newpart.match(hostnamePartPattern)) {
                        validParts = hostparts.slice(0, i);
                        notHost = hostparts.slice(i + 1);
                        bit = part.match(hostnamePartStart);
                        if (bit) {
                            validParts.push(bit[1]);
                            notHost.unshift(bit[2]);
                        }
                        notHost.length && (rest = "/" + notHost.join(".") + rest);
                        this.hostname = validParts.join(".");
                        break;
                    }
                }
            }
        }
        this.hostname = this.hostname.length > hostnameMaxLen ? "" : this.hostname.toLowerCase();
        ipv6Hostname || (this.hostname = punycode.toASCII(this.hostname));
        p = this.port ? ":" + this.port : "";
        h = this.hostname || "";
        this.host = h + p;
        this.href += this.host;
        if (ipv6Hostname) {
            this.hostname = this.hostname.substr(1, this.hostname.length - 2);
            "/" !== rest[0] && (rest = "/" + rest);
        }
    }
    if (!unsafeProtocol[lowerProto]) {
        for (i = 0, l = autoEscape.length; l > i; i++) {
            ae = autoEscape[i];
            esc = encodeURIComponent(ae);
            esc === ae && (esc = escape(ae));
            rest = rest.split(ae).join(esc);
        }
    }
    hash = rest.indexOf("#");
    if (-1 !== hash) {
        this.hash = rest.substr(hash);
        rest = rest.slice(0, hash);
    }
    qm = rest.indexOf("?");
    if (-1 !== qm) {
        this.search = rest.substr(qm);
        this.query = rest.substr(qm + 1);
        parseQueryString && (this.query = qs.parse(this.query));
        rest = rest.slice(0, qm);
    } else {
        if (parseQueryString) {
            this.search = "";
            this.query = {};
        }
    }
    rest && (this.pathname = rest);
    slashedProtocol[lowerProto] && this.hostname && !this.pathname && (this.pathname = "/");
    if (this.pathname || this.search) {
        p = this.pathname || "";
        s = this.search || "";
        this.path = p + s;
    }
    this.href = this.format();
    return this;
};

function urlFormat(obj) {
    isString(obj) && (obj = urlParse(obj));
    return obj instanceof Url ? obj.format() : Url.prototype.format.call(obj);
}

Url.prototype.format = function() {
    var protocol, pathname, hash, host, query, search, auth = this.auth || "";
    if (auth) {
        auth = encodeURIComponent(auth);
        auth = auth.replace(/%3A/i, ":");
        auth += "@";
    }
    protocol = this.protocol || "", pathname = this.pathname || "", hash = this.hash || "", host = false, query = "";
    if (this.host) {
        host = auth + this.host;
    } else {
        if (this.hostname) {
            host = auth + (-1 === this.hostname.indexOf(":") ? this.hostname : "[" + this.hostname + "]");
            this.port && (host += ":" + this.port);
        }
    }
    this.query && isObject(this.query) && Object.keys(this.query).length && (query = qs.stringify(this.query));
    search = this.search || query && "?" + query || "";
    protocol && ":" !== protocol.substr(-1) && (protocol += ":");
    if (this.slashes || (!protocol || slashedProtocol[protocol]) && false !== host) {
        host = "//" + (host || "");
        pathname && "/" !== pathname.charAt(0) && (pathname = "/" + pathname);
    } else {
        host || (host = "");
    }
    hash && "#" !== hash.charAt(0) && (hash = "#" + hash);
    search && "?" !== search.charAt(0) && (search = "?" + search);
    pathname = pathname.replace(/[?#]/g, function(match) {
        return encodeURIComponent(match);
    });
    search = search.replace("#", "%23");
    return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
    return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
    return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
    return source ? urlParse(source, false, true).resolveObject(relative) : relative;
}

Url.prototype.resolveObject = function(relative) {
    var rel, result, tkeys, tk, tkey, rkeys, rk, rkey, keys, v, k, relPath, p, s, isSourceAbs, isRelAbs, mustEndAbs, removeAllDots, srcPath, psychotic, authInHost, last, hasTrailingSlash, up, i, isAbsolute;
    if (isString(relative)) {
        rel = new Url();
        rel.parse(relative, false, true);
        relative = rel;
    }
    result = new Url();
    tkeys = Object.keys(this);
    for (tk = 0; tk < tkeys.length; tk++) {
        tkey = tkeys[tk];
        result[tkey] = this[tkey];
    }
    result.hash = relative.hash;
    if ("" === relative.href) {
        result.href = result.format();
        return result;
    }
    if (relative.slashes && !relative.protocol) {
        rkeys = Object.keys(relative);
        for (rk = 0; rk < rkeys.length; rk++) {
            rkey = rkeys[rk];
            "protocol" !== rkey && (result[rkey] = relative[rkey]);
        }
        slashedProtocol[result.protocol] && result.hostname && !result.pathname && (result.path = result.pathname = "/");
        result.href = result.format();
        return result;
    }
    if (relative.protocol && relative.protocol !== result.protocol) {
        if (!slashedProtocol[relative.protocol]) {
            keys = Object.keys(relative);
            for (v = 0; v < keys.length; v++) {
                k = keys[v];
                result[k] = relative[k];
            }
            result.href = result.format();
            return result;
        }
        result.protocol = relative.protocol;
        if (relative.host || hostlessProtocol[relative.protocol]) {
            result.pathname = relative.pathname;
        } else {
            relPath = (relative.pathname || "").split("/");
            for (; relPath.length && !(relative.host = relPath.shift());) {}
            relative.host || (relative.host = "");
            relative.hostname || (relative.hostname = "");
            "" !== relPath[0] && relPath.unshift("");
            relPath.length < 2 && relPath.unshift("");
            result.pathname = relPath.join("/");
        }
        result.search = relative.search;
        result.query = relative.query;
        result.host = relative.host || "";
        result.auth = relative.auth;
        result.hostname = relative.hostname || relative.host;
        result.port = relative.port;
        if (result.pathname || result.search) {
            p = result.pathname || "";
            s = result.search || "";
            result.path = p + s;
        }
        result.slashes = result.slashes || relative.slashes;
        result.href = result.format();
        return result;
    }
    isSourceAbs = result.pathname && "/" === result.pathname.charAt(0), isRelAbs = relative.host || relative.pathname && "/" === relative.pathname.charAt(0),
        mustEndAbs = isRelAbs || isSourceAbs || result.host && relative.pathname, removeAllDots = mustEndAbs, srcPath = result.pathname && result.pathname.split("/") || [],
        relPath = relative.pathname && relative.pathname.split("/") || [], psychotic = result.protocol && !slashedProtocol[result.protocol];
    if (psychotic) {
        result.hostname = "";
        result.port = null;
        result.host && ("" === srcPath[0] ? srcPath[0] = result.host : srcPath.unshift(result.host));
        result.host = "";
        if (relative.protocol) {
            relative.hostname = null;
            relative.port = null;
            relative.host && ("" === relPath[0] ? relPath[0] = relative.host : relPath.unshift(relative.host));
            relative.host = null;
        }
        mustEndAbs = mustEndAbs && ("" === relPath[0] || "" === srcPath[0]);
    }
    if (isRelAbs) {
        result.host = relative.host || "" === relative.host ? relative.host : result.host;
        result.hostname = relative.hostname || "" === relative.hostname ? relative.hostname : result.hostname;
        result.search = relative.search;
        result.query = relative.query;
        srcPath = relPath;
    } else {
        if (relPath.length) {
            srcPath || (srcPath = []);
            srcPath.pop();
            srcPath = srcPath.concat(relPath);
            result.search = relative.search;
            result.query = relative.query;
        } else {
            if (!isNullOrUndefined(relative.search)) {
                if (psychotic) {
                    result.hostname = result.host = srcPath.shift();
                    authInHost = result.host && result.host.indexOf("@") > 0 ? result.host.split("@") : false;
                    if (authInHost) {
                        result.auth = authInHost.shift();
                        result.host = result.hostname = authInHost.shift();
                    }
                }
                result.search = relative.search;
                result.query = relative.query;
                isNull(result.pathname) && isNull(result.search) || (result.path = (result.pathname ? result.pathname : "") + (result.search ? result.search : ""));
                result.href = result.format();
                return result;
            }
        }
    }
    if (!srcPath.length) {
        result.pathname = null;
        result.path = result.search ? "/" + result.search : null;
        result.href = result.format();
        return result;
    }
    last = srcPath.slice(-1)[0];
    hasTrailingSlash = (result.host || relative.host) && ("." === last || ".." === last) || "" === last;
    up = 0;
    for (i = srcPath.length; i >= 0; i--) {
        last = srcPath[i];
        if ("." === last) {
            srcPath.splice(i, 1);
        } else {
            if (".." === last) {
                srcPath.splice(i, 1);
                up++;
            } else {
                if (up) {
                    srcPath.splice(i, 1);
                    up--;
                }
            }
        }
    }
    if (!mustEndAbs && !removeAllDots) {
        for (; up--; up) {
            srcPath.unshift("..");
        }
    }

    !mustEndAbs || "" === srcPath[0] || srcPath[0] && "/" === srcPath[0].charAt(0) || srcPath.unshift("");
    hasTrailingSlash && "/" !== srcPath.join("/").substr(-1) && srcPath.push("");
    isAbsolute = "" === srcPath[0] || srcPath[0] && "/" === srcPath[0].charAt(0);

    if (psychotic) {
        result.hostname = result.host = isAbsolute ? "" : srcPath.length ? srcPath.shift() : "";
        authInHost = result.host && result.host.indexOf("@") > 0 ? result.host.split("@") : false;
        if (authInHost) {
            result.auth = authInHost.shift();
            result.host = result.hostname = authInHost.shift();
        }
    }
    mustEndAbs = mustEndAbs || result.host && srcPath.length;
    mustEndAbs && !isAbsolute && srcPath.unshift("");
    if (srcPath.length) {
        result.pathname = srcPath.join("/");
    } else {
        result.pathname = null;
        result.path = null;
    }
    isNull(result.pathname) && isNull(result.search) || (result.path = (result.pathname ? result.pathname : "") + (result.search ? result.search : ""));
    result.auth = relative.auth || result.auth;
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
};

Url.prototype.parseHost = function() {
    var host = this.host,
        port = portPattern.exec(host);
    if (port) {
        port = port[0];
        ":" !== port && (this.port = port.substr(1));
        host = host.substr(0, host.length - port.length);
    }
    host && (this.hostname = host);
};


urls.parse = urlParse;
urls.resolve = urlResolve;
urls.resolveObject = urlResolveObject;
urls.format = urlFormat;
urls.Url = Url;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/url_path/src/index.js */

var process = require(60);
var pathUtils = require(203);


var urlPath = module.exports,
    IS_URL = /^(?:[a-z]+:)?\/\//i;


urlPath.isAbsolute = function(str) {
    return str[0] === "/" || IS_URL.test(str);
};

urlPath.isAbsoluteURL = function(str) {
    return IS_URL.test(str);
};

urlPath.isURL = urlPath.isAbsoluteURL;

urlPath.normalize = function(str) {
    var isAbs = urlPath.isAbsolute(str),
        trailingSlash = str[str.length - 1] === "/",
        segments = str.split("/"),
        nonEmptySegments = [],
        i;

    for (i = 0; i < segments.length; i++) {
        if (segments[i]) {
            nonEmptySegments.push(segments[i]);
        }
    }
    str = pathUtils.normalizeArray(nonEmptySegments, !isAbs).join("/");

    if (!str && !isAbs) {
        str = ".";
    }
    if (str && trailingSlash) {
        str += "/";
    }

    return (isAbs ? "/" : "") + str;
};

urlPath.resolve = function() {
    var resolvedPath = "",
        resolvedAbsolute = false,
        i, str;

    for (i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
        str = (i >= 0) ? arguments[i] : process.cwd();

        if (typeof(str) !== "string") {
            throw new TypeError("Arguments to resolve must be strings");
        } else if (!str) {
            continue;
        }

        resolvedPath = str + "/" + resolvedPath;
        resolvedAbsolute = str.charAt(0) === "/";
    }

    resolvedPath = pathUtils.normalizeArray(pathUtils.removeEmpties(resolvedPath.split("/")), !resolvedAbsolute).join("/");
    return ((resolvedAbsolute ? "/" : "") + resolvedPath) || ".";
};

urlPath.relative = function(from, to) {
    from = urlPath.resolve(from).substr(1);
    to = urlPath.resolve(to).substr(1);

    var fromParts = pathUtils.trim(from.split("/")),
        toParts = pathUtils.trim(to.split("/")),

        length = Math.min(fromParts.length, toParts.length),
        samePartsLength = length,
        outputParts, i, il;

    for (i = 0; i < length; i++) {
        if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
        }
    }

    outputParts = [];
    for (i = samePartsLength, il = fromParts.length; i < il; i++) {
        outputParts.push("..");
    }
    outputParts = outputParts.concat(toParts.slice(samePartsLength));

    return outputParts.join("/");
};

urlPath.join = function() {
    var str = "",
        segment,
        i, il;

    for (i = 0, il = arguments.length; i < il; i++) {
        segment = arguments[i];

        if (typeof(segment) !== "string") {
            throw new TypeError("Arguments to join must be strings");
        }
        if (segment) {
            if (!str) {
                str += segment;
            } else {
                str += "/" + segment;
            }
        }
    }

    return urlPath.normalize(str);
};

urlPath.dir = function(str) {
    str = str.substring(0, str.lastIndexOf("/") + 1);
    return str ? str.substr(0, str.length - 1) : ".";
};

urlPath.dirname = urlPath.dir;

urlPath.base = function(str, ext) {
    str = str.substring(str.lastIndexOf("/") + 1);

    if (ext && str.substr(-ext.length) === ext) {
        str = str.substr(0, str.length - ext.length);
    }

    return str || "";
};

urlPath.basename = urlPath.base;

urlPath.ext = function(str) {
    var index = str.lastIndexOf(".");
    return index > -1 ? str.substring(index) : "";
};

urlPath.extname = urlPath.ext;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/same_origin/src/index.js */

var urlPath = require(194),
    environment = require(3);


var reURL = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,
    browserOriginParts;


module.exports = sameOrigin;


function sameOrigin(url, origin) {
    var parts, originParts;

    if (!urlPath.isAbsoluteURL(url)) {
        return true;
    } else {
        parts = reURL.exec(url.toLowerCase());

        if (!parts) {
            return false;
        } else {
            originParts = reURL.exec(origin.toLowerCase());

            if (!originParts) {
                return false;
            } else {
                return campare(parts, originParts);
            }
        }
    }
}

if (environment.browser) {
    browserOriginParts = reURL.exec(location.origin.toLowerCase()) || [];

    sameOrigin.browser = function sameOriginBrowser(url) {
        var parts;

        if (!urlPath.isAbsoluteURL(url)) {
            return true;
        } else {
            parts = reURL.exec(url.toLowerCase());

            if (!parts) {
                return false;
            } else {
                return campare(parts, browserOriginParts);
            }
        }
    };
}

function campare(a, b) {
    var aPort = a[3],
        bPort = b[3];

    return !(
        (a[1] !== b[1]) ||
        (a[2] !== b[2]) || !(
            (aPort === bPort) ||
            (!aPort && (bPort === "80" || bPort === "443")) ||
            (!bPort && (aPort === "80" || aPort === "443"))
        )
    );
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/punycode/punycode.js */

var process = require(60);
/*! https://mths.be/punycode v1.3.2 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.3.2',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/qs/src/index.js */

var Buffer = require(198).Buffer;
var indexOf = require(61),
    has = require(25),
    keys = require(41),
    isPrimitive = require(18),
    isArrayLike = require(37),
    isNaNShim = require(199),
    isObject = require(33);


var qs = module.exports,

    ObjectPrototype = Object.prototype,

    reDecode = /\+/g,
    reParseKeysParent = /^([^\[\]]*)/,
    reParseKeysChild = /(\[[^\[\]]*\])/g,
    reParseKeysReplacer = /\[|\]/g;


function mergeArrays(a, b) {
    var i = -1,
        length = b.length - 1,
        offset = a.length;

    while (i++ < length) {
        a[offset + i] = b[i];
    }

    return a;
}

function stringify(obj, prefix) {
    var key, values, i, length;

    obj = Buffer.isBuffer(obj) ? obj.toString() : obj instanceof Date ? obj.toISOString() : obj != null ? obj : "";

    if (isPrimitive(obj)) {
        return [encodeURIComponent(prefix) + "=" + encodeURIComponent(obj)];
    }

    values = [];

    if (isArrayLike(obj)) {
        i = -1;
        length = obj.length - 1;

        while (i++ < length) {
            mergeArrays(values, stringify(obj[i], prefix + "[" + i + "]"));
        }
    } else {
        for (key in obj) {
            if (has(obj, key)) {
                mergeArrays(values, stringify(obj[key], prefix + "[" + key + "]"));
            }
        }
    }

    return values;
}

qs.stringify = function(obj, options) {
    var keys = [],
        delimiter, key;

    delimiter = options && typeof(options.delimiter) !== "undefined" ? options.delimiter : "&";

    for (key in obj) {
        if (has(obj, key)) {
            mergeArrays(keys, stringify(obj[key], key));
        }
    }

    return keys.join(delimiter);
};

function decode(str) {
    var value, num;

    try {
        value = decodeURIComponent(str.replace(reDecode, " "));
        num = +value;
        return num !== num ? value : num;
    } catch (e) {
        return str;
    }
}

function parseValues(str, options) {
    var obj = {},
        parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit),
        i = -1,
        il = parts.length - 1,
        part, index, pos, key, val;

    while (i++ < il) {
        part = parts[i];
        index = part.indexOf("]=");
        pos = index === -1 ? part.indexOf("=") : index + 1;

        if (pos === -1) {
            obj[decode(part)] = "";
        } else {
            key = decode(part.slice(0, pos));
            val = decode(part.slice(pos + 1));

            obj[key] = has(obj, key) ? [obj[key], val] : val;
        }
    }

    return obj;
}

function parseObject(chain, val, options) {
    var root, obj, cleanRoot, index;

    if (!chain.length) {
        return val;
    }

    root = chain.shift();

    if (root === "[]") {
        obj = [parseObject(chain, val, options)];
    } else {
        cleanRoot = "[" === root[0] && "]" === root[root.length - 1] ? root.slice(1, root.length - 1) : root;
        index = +cleanRoot;

        if (!isNaNShim(index) && root !== cleanRoot && index <= options.arrayLimit) {
            obj = [];
            obj[index] = parseObject(chain, val, options);
        } else {
            obj = {};
            obj[cleanRoot] = parseObject(chain, val, options);
        }
    }

    return obj;
}

function parseKeys(key, val, options) {
    var parent = reParseKeysParent,
        child = reParseKeysChild,
        segment, keys, i;

    if (!key) {
        return undefined;
    }

    segment = parent.exec(key);

    if (has(ObjectPrototype, segment[1])) {
        return undefined;
    }

    keys = [];
    segment[1] && (keys[keys.length] = segment[1]);

    i = 0;
    while (null !== (segment = child.exec(key)) && i < options.depth) {
        if (!has(ObjectPrototype, segment[1].replace(reParseKeysReplacer, ""))) {
            keys[keys.length] = segment[1];
        }
        i++;
    }

    segment && (keys[keys.length] = "[" + key.slice(segment.index) + "]");

    return parseObject(keys, val, options);
}

function compact(obj, refs) {
    var lookup, compacted, i, length, objectKeys, key, value;

    if (!isObject(obj)) {
        return obj;
    }

    refs = refs || [];
    lookup = indexOf(refs, obj);

    if (lookup !== -1) {
        return refs[lookup];
    }

    refs[refs.length] = obj;

    if (isArrayLike(obj)) {
        compacted = [];

        i = -1;
        length = obj.length - 1;

        while (i++ < length) {
            value = obj[i];

            if (value != null) {
                compacted[compacted.length] = value;
            }
        }

        return compacted;
    }

    objectKeys = keys(obj);
    i = -1;
    length = objectKeys.length - 1;

    while (i++ < length) {
        key = objectKeys[i];
        obj[key] = compact(obj[key], refs);
    }

    return obj;
}

function arrayToObject(array) {
    var obj = {},
        i = -1,
        length = array.length - 1,
        value;

    while (i++ < length) {
        value = array[i];

        if (value != null) {
            obj[i] = value;
        }
    }

    return obj;
}

function merge(target, source) {
    var objectKeys, i, il, k, kl, key, value;

    if (!source) {
        return target;
    }

    if (isArrayLike(source)) {
        i = -1;
        il = source.length - 1;

        while (i++ < il) {
            key = target[i];
            value = source[i];

            if (value != null) {
                if (isObject(key)) {
                    target[i] = merge(key, value);
                } else {
                    target[i] = value;
                }
            }
        }

        return target;
    }

    if (isArrayLike(target)) {
        if (typeof(source) !== "object") {
            target[target.length] = source;
            return target;
        } else {
            target = arrayToObject(target);
        }
    }

    objectKeys = keys(source);
    k = -1;
    kl = objectKeys.length - 1;

    while (k++ < kl) {
        key = objectKeys[k];
        value = source[key];

        if (value && typeof(value) === "object") {
            if (target[key] == null) {
                target[key] = value;
            } else {
                target[key] = merge(target[key], value);
            }
        } else {
            target[key] = value;
        }
    }

    return target;
}

qs.parse = function(str, options) {
    var obj = {},
        tempObj, objectKeys, i, il, key, newObj;

    if (str === "" || str == null) {
        return obj;
    }

    options || (options = {});
    options.delimiter = typeof(options.delimiter) === "string" || (options.delimiter instanceof RegExp) ? options.delimiter : "&";
    options.depth = typeof(options.depth) === "number" ? options.depth : 5;
    options.arrayLimit = typeof(options.arrayLimit) === "number" ? options.arrayLimit : 20;
    options.parameterLimit = typeof(options.parameterLimit) === "number" ? options.parameterLimit : 1e3;

    tempObj = typeof(str) === "string" ? parseValues(str, options) : str;

    objectKeys = keys(tempObj);
    i = -1;
    il = objectKeys.length - 1;

    while (i++ < il) {
        key = objectKeys[i];
        newObj = parseKeys(key, tempObj[key], options);
        obj = merge(obj, newObj);
    }

    return compact(obj);
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/buffer/index.js */

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

var base64 = require(200)
var ieee754 = require(201)
var isArray = require(202)

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
 *     on objects.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

function typedArraySupport () {
  function Bar () {}
  try {
    var arr = new Uint8Array(1)
    arr.foo = function () { return 42 }
    arr.constructor = Bar
    return arr.foo() === 42 && // typed array instances can be augmented
        arr.constructor === Bar && // constructor can be set
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  this.length = 0
  this.parent = undefined

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg)
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
  }

  // Unusual.
  return fromObject(this, arg)
}

function fromNumber (that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0
    }
  }
  return that
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0
  that = allocate(that, length)

  that.write(string, encoding)
  return that
}

function fromObject (that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

  if (isArray(object)) return fromArray(that, object)

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (typeof ArrayBuffer !== 'undefined') {
    if (object.buffer instanceof ArrayBuffer) {
      return fromTypedArray(that, object)
    }
    if (object instanceof ArrayBuffer) {
      return fromArrayBuffer(that, object)
    }
  }

  if (object.length) return fromArrayLike(that, object)

  return fromJsonObject(that, object)
}

function fromBuffer (that, buffer) {
  var length = checked(buffer.length) | 0
  that = allocate(that, length)
  buffer.copy(that, 0, 0, length)
  return that
}

function fromArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    array.byteLength
    that = Buffer._augment(new Uint8Array(array))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromTypedArray(that, new Uint8Array(array))
  }
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject (that, object) {
  var array
  var length = 0

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data
    length = checked(array.length) | 0
  }
  that = allocate(that, length)

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
}

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = Buffer._augment(new Uint8Array(length))
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
    that._isBuffer = true
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
  if (fromPool) that.parent = rootParent

  return that
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  var i = 0
  var len = Math.min(x, y)
  while (i < len) {
    if (a[i] !== b[i]) break

    ++i
  }

  if (i !== len) {
    x = a[i]
    y = b[i]
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buf = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

function byteLength (string, encoding) {
  if (typeof string !== 'string') string = '' + string

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

function slowToString (encoding, start, end) {
  var loweredCase = false

  start = start | 0
  end = end === undefined || end === Infinity ? this.length : end | 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` is deprecated
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` is deprecated
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding
    encoding = offset
    offset = length | 0
    length = swap
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), targetStart)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/is_nan/src/index.js */

var isNumber = require(24);


module.exports = Number.isNaN || function isNaN(value) {
    return isNumber(value) && value !== value;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/base64-js/lib/b64.js */

var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/ieee754/index.js */

exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is-array/index.js */


/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/path_utils/src/index.js */

var pathUtils = module.exports;


pathUtils.removeEmpties = function(parts) {
    var i = parts.length;

    while (i--) {
        if (!parts[i]) {
            parts.splice(i, 1);
        }
    }

    return parts;
};

pathUtils.trim = function(parts) {
    var length = parts.length,
        start = -1,
        end = length - 1;

    while (start++ < end) {
        if (parts[start] !== "") {
            break;
        }
    }

    end = length;
    while (end--) {
        if (parts[end] !== "") {
            break;
        }
    }

    if (start > end) {
        return [];
    }

    return parts.slice(start, end + 1);
};

pathUtils.normalizeArray = function(parts, allowAboveRoot) {
    var i = parts.length,
        up = 0,
        last;

    while (i--) {
        last = parts[i];

        if (last === ".") {
            parts.splice(i, 1);
        } else if (last === "..") {
            parts.splice(i, 1);
            up++;
        } else if (up !== 0) {
            parts.splice(i, 1);
            up--;
        }
    }

    if (allowAboveRoot) {
        while (up--) {
            parts.unshift("..");
        }
    }

    return parts;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/virt-modal/src/Modal.js */

var virt = require(1),
    virtDOM = require(2),
    css = require(207),
    extend = require(27),
    propTypes = require(208),
    eventListener = require(4),
    environment = require(3),
    isNumber = require(24);


var window = environment.window,
    document = environment.document,

    ModalPrototype;


module.exports = Modal;


function Modal(props, children, context) {
    var _this = this;

    virt.Component.call(this, props, children, context);

    this.onResize = function(e) {
        return _this.__onResize(e);
    };
}
virt.Component.extend(Modal, "Modal");
ModalPrototype = Modal.prototype;

Modal.propsTypes = {
    style: propTypes.object,
    backdropStyle: propTypes.object,
    dialogStyle: propTypes.object,
    contentStyle: propTypes.object,
    index: propTypes.number.isRequired,
    size: propTypes.string.isRequired,
    className: propTypes.string.isRequired,
    close: propTypes.func.isRequired
};

ModalPrototype.componentDidMount = function() {
    eventListener.on(window, "resize ondeviceorientation", this.onResize);
    this.onResize();
};

ModalPrototype.componentWillUnmount = function() {
    eventListener.off(window, "resize ondeviceorientation", this.onResize);
};

ModalPrototype.__onResize = function() {
    var body = document.body,
        html = document.documentElement,
        height;

    if (isNumber(document.height)) {
        height = document.height;
    } else {
        height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    }

    virtDOM.findDOMNode(this.refs.backdrop).style.height = height + "px";
};

ModalPrototype.getStyles = function() {
    var props = this.props,
        styles = {
            root: extend({
                zIndex: 1000 + props.index,
                position: "absolute",
                top: "0",
                left: "0",
                "-webkit-overflow-scrolling": "touch",
                outline: "0"
            }, props.style),
            backdrop: extend({
                position: "fixed",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
                backgroundColor: "#000"
            }, props.backdrop),
            dialog: extend({
                position: "relative"
            }, props.dialog)
        };

    css.opacity(styles.backdrop, 0.5);

    return styles;
};

ModalPrototype.render = function() {
    var styles = this.getStyles(),
        props = this.props;

    return (
        virt.createView("div", {
                className: "Modal" + props.className,
                style: styles.root
            },
            virt.createView("div", {
                onClick: props.close,
                ref: "backdrop",
                className: "Modal-backdrop",
                style: styles.backdrop
            }),
            virt.createView("div", {
                    className: "Modal-dialog" + props.size,
                    style: styles.dialog
                },
                this.children
            )
        )
    );
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/virt-modal/src/Modals.js */

var virt = require(1),
    map = require(26),
    extend = require(27),
    isFunction = require(19),
    propTypes = require(208),
    ModalStore = require(206),
    Modal = require(204);


var ModalsPrototype = Modals.prototype;


module.exports = Modals;


function Modals(props, children, context) {
    var _this = this;

    virt.Component.call(this, props, children, context);

    this.state = {
        modals: []
    };

    this.onChange = function() {
        return _this.__onChange();
    };
}
virt.Component.extend(Modals, "Modals");
ModalsPrototype = Modals.prototype;

Modals.propTypes = {
    style: propTypes.object,
    modalStyle: propTypes.object,
    modalBackdrop: propTypes.object,
    modalDialog: propTypes.object,
    modalContent: propTypes.object,
    modals: propTypes.object.isRequired
};

ModalsPrototype.componentDidMount = function() {
    ModalStore.addChangeListener(this.onChange);
    this.__onChange();
};

ModalsPrototype.componentWillUnmount = function() {
    ModalStore.removeChangeListener(this.onChange);
};

ModalsPrototype.__onChange = function() {
    var _this = this,
        modalProps = this.props.modals;

    ModalStore.all(function(error, modals) {
        _this.setState({
            modals: map(modals, function(modal) {
                var modalProp = modalProps[modal.name],
                    renderModal = extend({}, modal),
                    render, onClose;

                if (!modalProp) {
                    throw new Error("no modal name " + modal.name);
                }

                render = modalProp.render;
                if (!isFunction(render)) {
                    throw new Error("modal at index " + modal.index + " name " + modal.name + " invalid render function");
                }

                onClose = modalProp.onClose;
                if (!isFunction(onClose)) {
                    throw new Error("modal at index " + modal.index + " name " + modal.name + " invalid onClose function");
                }

                renderModal.close = function() {
                    onClose(renderModal);
                };
                renderModal.render = render;

                return renderModal;
            })
        });
    });
};

ModalsPrototype.render = function() {
    var props = this.props;

    return (
        virt.createView("div", {
                className: "Modals"
            },
            map(this.state.modals, function(modal) {
                return (
                    virt.createView(Modal, {
                        key: modal.id,
                        index: modal.index,
                        size: modal.size,
                        className: modal.className,
                        close: modal.close,
                        style: modal.style || props.style,
                        backdropStyle: modal.backdropStyle || props.backdrop,
                        dialogStyle: modal.dialogStyle || props.dialog
                    }, modal.render(modal))
                );
            })
        )
    );
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/virt-modal/src/ModalStore.js */

var EventEmitter = require(178),
    isString = require(21),
    keyMirror = require(59);


var ModalStore = module.exports = new EventEmitter(-1),

    EVENT_CHANGE = "change",

    consts = ModalStore.consts = keyMirror([
        "MODAL_OPEN",
        "MODAL_CLOSE"
    ]),

    _id = 1,
    _modals = [];


function create(options) {
    var modals = _modals,
        index = modals.length,
        modal;

    modal = {};

    modal.id = _id++;
    modal.index = index;
    modal.name = options.name;
    modal.data = options.data;
    modal.size = isString(options.size) ? " " + options.size : " md";
    modal.className = isString(options.className) ? " " + options.className : "";
    modal.style = options.style;
    modal.backdrop = options.backdrop;
    modal.dialog = options.dialog;

    modals[index] = modal;
}

function destroy(id) {
    var modals = _modals,
        i = -1,
        il = modals.length - 1,
        index = -1,
        modal;

    while (i++ < il) {
        modal = modals[i];

        if (modal.id === id) {
            index = i;
            break;
        }
    }

    if (index !== -1) {
        modals.splice(index, 1);
    }
}

ModalStore.toJSON = function() {
    return _modals.slice();
};

ModalStore.fromJSON = function(json) {
    _modals = json;
};

ModalStore.all = function(callback) {
    callback(undefined, _modals.slice());
};

ModalStore.addChangeListener = function(callback) {
    this.on(EVENT_CHANGE, callback);
};

ModalStore.removeChangeListener = function(callback) {
    this.off(EVENT_CHANGE, callback);
};

ModalStore.emitChange = function() {
    this.emit(EVENT_CHANGE);
};

ModalStore.registerCallback = function(payload) {
    var action = payload.action;

    switch (action.actionType) {
        case consts.MODAL_OPEN:
            create(action);
            ModalStore.emitChange();
            break;
        case consts.MODAL_CLOSE:
            destroy(action.id);
            ModalStore.emitChange();
            break;
    }
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/css/src/index.js */

var forEach = require(111),
    indexOf = require(61),
    fastSlice = require(191),
    prefix = require(209),
    properties = require(210),
    transition = require(211),
    textShadow = require(212),
    nonPrefixProperties = require(213);


var css = exports;


forEach(properties, function(key) {
    if (indexOf(nonPrefixProperties, key) === -1) {
        css[key] = function(styles, value) {
            return prefix(styles, key, value, null, css.stopPrefix);
        };
    } else {
        css[key] = function(styles, value) {
            styles[key] = value;
            return styles;
        };
    }
});

css.opacity = require(214);

css.transition = function(styles) {
    return transition(styles, fastSlice(arguments, 1));
};
css.textShadow = function(styles) {
    return textShadow(styles, fastSlice(arguments, 1));
};

css.stopPrefix = false;
css.prefixes = require(215);
css.properties = properties;

css.colors = require(216);
css.Styles = require(217);

css.darken = require(218);
css.fade = require(219);
css.lighten = require(220);


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/prop_types/src/index.js */

var i18n = require(182),
    isArray = require(20),
    isRegExp = require(231),
    isNullOrUndefined = require(23),
    emptyFunction = require(42),
    isFunction = require(19),
    has = require(25),
    indexOf = require(61);


var propTypes = exports,
    defaultLocale = "en";


i18n = i18n.create(true, true);


if (!i18n.has("en", "prop_types.anonymous")) {
    i18n.add("en", require(232));
}


propTypes.createTypeChecker = createTypeChecker;

function createTypeChecker(validate) {

    function checkType(props, propName, callerName, locale) {
        if (isNullOrUndefined(props[propName])) {
            return null;
        } else {
            return validate(props, propName, callerName || ("<<" + i18n(locale || defaultLocale, "prop_types.anonymous") + ">>"), locale || defaultLocale);
        }
    }

    checkType.isRequired = function checkIsRequired(props, propName, callerName, locale) {
        callerName = callerName || ("<<" + i18n(locale || defaultLocale, "prop_types.anonymous") + ">>");

        if (isNullOrUndefined(props[propName])) {
            return new TypeError(i18n(locale || defaultLocale, "prop_types.is_required", propName, callerName));
        } else {
            return validate(props, propName, callerName, locale || defaultLocale);
        }
    };

    return checkType;
}

propTypes.array = createPrimitiveTypeChecker("array");
propTypes.bool = createPrimitiveTypeChecker("boolean");
propTypes["boolean"] = propTypes.bool;
propTypes.func = createPrimitiveTypeChecker("function");
propTypes["function"] = propTypes.func;
propTypes.number = createPrimitiveTypeChecker("number");
propTypes.object = createPrimitiveTypeChecker("object");
propTypes.string = createPrimitiveTypeChecker("string");

propTypes.regexp = createTypeChecker(function validateRegExp(props, propName, callerName, locale) {
    var propValue = props[propName];

    if (isRegExp(propValue)) {
        return null;
    } else {
        return new TypeError(i18n(locale || defaultLocale, "prop_types.regexp", propName, propValue, callerName));
    }
});

propTypes.instanceOf = function createInstanceOfCheck(expectedClass) {
    return createTypeChecker(function validateInstanceOf(props, propName, callerName, locale) {
        var propValue = props[propName],
            expectedClassName;

        if (propValue instanceof expectedClass) {
            return null;
        } else {
            expectedClassName = expectedClass.name || ("<<" + i18n(locale || defaultLocale, "prop_types.anonymous") + ">>");

            return new TypeError(
                i18n(locale || defaultLocale, "prop_types.instance_of", propName, getPreciseType(propValue), callerName, expectedClassName)
            );
        }
    });
};

propTypes.any = createTypeChecker(emptyFunction.thatReturnsNull);

propTypes.oneOf = function createOneOfCheck(expectedValues) {
    return createTypeChecker(function validateOneOf(props, propName, callerName, locale) {
        var propValue = props[propName];

        if (indexOf(expectedValues, propValue) !== -1) {
            return null;
        } else {
            return new TypeError(
                i18n(locale || defaultLocale, "prop_types.one_of", propName, propValue, callerName, JSON.stringify(expectedValues))
            );
        }
    });
};

propTypes.implement = function createImplementCheck(expectedInterface) {
    var key;

    for (key in expectedInterface) {
        if (has(expectedInterface, key) && !isFunction(expectedInterface[key])) {
            throw new TypeError(
                "Invalid Function Interface for " + key + ", must be functions " +
                "Function(props: Object, propName: String, callerName: String, locale) return Error or null."
            );
        }
    }

    return createTypeChecker(function validateImplement(props, propName, callerName, locale) {
        var results = null,
            localHas = has,
            propInterface = props[propName],
            propKey, propValidate, result;

        for (propKey in expectedInterface) {
            if (localHas(expectedInterface, propKey)) {
                propValidate = expectedInterface[propKey];
                result = propValidate(propInterface, propKey, callerName + "." + propKey, locale || defaultLocale);

                if (result) {
                    results = results || [];
                    results[results.length] = result;
                }
            }
        }

        return results;
    });
};

function createPrimitiveTypeChecker(expectedType) {
    return createTypeChecker(function validatePrimitive(props, propName, callerName, locale) {
        var propValue = props[propName],
            type = getPropType(propValue);

        if (type !== expectedType) {
            callerName = callerName || ("<<" + i18n(locale || defaultLocale, "prop_types.anonymous") + ">>");

            return new TypeError(
                i18n(locale || defaultLocale, "prop_types.primitive", propName, getPreciseType(propValue), callerName, expectedType)
            );
        } else {
            return null;
        }
    });
}

function getPropType(value) {
    var propType = typeof(value);

    if (isArray(value)) {
        return "array";
    } else if (value instanceof RegExp) {
        return "object";
    } else {
        return propType;
    }
}

function getPreciseType(propValue) {
    var propType = getPropType(propValue);

    if (propType === "object") {
        if (propValue instanceof Date) {
            return "date";
        } else if (propValue instanceof RegExp) {
            return "regexp";
        } else {
            return propType;
        }
    } else {
        return propType;
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/css/src/prefix.js */

var prefixes = require(215),
    capitalizeString = require(221);


module.exports = prefix;


function prefix(styles, key, value, prefixValue, stopPrefix) {
    var i, il, pre;

    if (stopPrefix !== true) {
        prefixValue = prefixValue === true;
        i = -1;
        il = prefixes.length - 1;

        while (i++ < il) {
            pre = prefixes[i];
            styles[pre.js + capitalizeString(key)] = prefixValue ? pre.css + value : value;
        }
    }

    styles[key] = value;

    return styles;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/css/src/properties.js */

module.exports = [
    "parentRule",
    "length",
    "cssText",
    "alignContent",
    "alignItems",
    "alignSelf",
    "alignmentBaseline",
    "all",
    "animation",
    "animationDelay",
    "animationDirection",
    "animationDuration",
    "animationFillMode",
    "animationIterationCount",
    "animationName",
    "animationPlayState",
    "animationTimingFunction",
    "backfaceVisibility",
    "background",
    "backgroundAttachment",
    "backgroundBlendMode",
    "backgroundClip",
    "backgroundColor",
    "backgroundImage",
    "backgroundOrigin",
    "backgroundPosition",
    "backgroundPositionX",
    "backgroundPositionY",
    "backgroundRepeat",
    "backgroundRepeatX",
    "backgroundRepeatY",
    "backgroundSize",
    "baselineShift",
    "border",
    "borderBottom",
    "borderBottomColor",
    "borderBottomLeftRadius",
    "borderBottomRightRadius",
    "borderBottomStyle",
    "borderBottomWidth",
    "borderCollapse",
    "borderColor",
    "borderImage",
    "borderImageOutset",
    "borderImageRepeat",
    "borderImageSlice",
    "borderImageSource",
    "borderImageWidth",
    "borderLeft",
    "borderLeftColor",
    "borderLeftStyle",
    "borderLeftWidth",
    "borderRadius",
    "borderRight",
    "borderRightColor",
    "borderRightStyle",
    "borderRightWidth",
    "borderSpacing",
    "borderStyle",
    "borderTop",
    "borderTopColor",
    "borderTopLeftRadius",
    "borderTopRightRadius",
    "borderTopStyle",
    "borderTopWidth",
    "borderWidth",
    "bottom",
    "boxShadow",
    "boxSizing",
    "bufferedRendering",
    "captionSide",
    "clear",
    "clip",
    "clipPath",
    "clipRule",
    "color",
    "colorInterpolation",
    "colorInterpolationFilters",
    "colorRendering",
    "content",
    "counterIncrement",
    "counterReset",
    "cursor",
    "cx",
    "cy",
    "direction",
    "display",
    "dominantBaseline",
    "emptyCells",
    "enableBackground",
    "fill",
    "fillOpacity",
    "fillRule",
    "filter",
    "flex",
    "flexBasis",
    "flexDirection",
    "flexFlow",
    "flexGrow",
    "flexShrink",
    "flexWrap",
    "float",
    "floodColor",
    "floodOpacity",
    "font",
    "fontFamily",
    "fontKerning",
    "fontSize",
    "fontStretch",
    "fontStyle",
    "fontVariant",
    "fontVariantLigatures",
    "fontWeight",
    "glyphOrientationHorizontal",
    "glyphOrientationVertical",
    "height",
    "imageRendering",
    "isolation",
    "justifyContent",
    "left",
    "letterSpacing",
    "lightingColor",
    "lineHeight",
    "listStyle",
    "listStyleImage",
    "listStylePosition",
    "listStyleType",
    "margin",
    "marginBottom",
    "marginLeft",
    "marginRight",
    "marginTop",
    "marker",
    "markerEnd",
    "markerMid",
    "markerStart",
    "mask",
    "maskType",
    "maxHeight",
    "maxWidth",
    "maxZoom",
    "minHeight",
    "minWidth",
    "minZoom",
    "mixBlendMode",
    "objectFit",
    "objectPosition",
    "opacity",
    "order",
    "orientation",
    "orphans",
    "outline",
    "outlineColor",
    "outlineOffset",
    "outlineStyle",
    "outlineWidth",
    "overflow",
    "overflowWrap",
    "overflowX",
    "overflowY",
    "padding",
    "paddingBottom",
    "paddingLeft",
    "paddingRight",
    "paddingTop",
    "page",
    "pageBreakAfter",
    "pageBreakBefore",
    "pageBreakInside",
    "paintOrder",
    "perspective",
    "perspectiveOrigin",
    "pointerEvents",
    "position",
    "quotes",
    "r",
    "resize",
    "right",
    "rx",
    "ry",
    "shapeImageThreshold",
    "shapeMargin",
    "shapeOutside",
    "shapeRendering",
    "size",
    "speak",
    "src",
    "stopColor",
    "stopOpacity",
    "stroke",
    "strokeDasharray",
    "strokeDashoffset",
    "strokeLinecap",
    "strokeLinejoin",
    "strokeMiterlimit",
    "strokeOpacity",
    "strokeWidth",
    "tabSize",
    "tableLayout",
    "textAlign",
    "textAnchor",
    "textDecoration",
    "textIndent",
    "textOverflow",
    "textRendering",
    "textShadow",
    "textTransform",
    "top",
    "touchAction",
    "transform",
    "transformOrigin",
    "transformStyle",
    "transition",
    "transitionDelay",
    "transitionDuration",
    "transitionProperty",
    "transitionTimingFunction",
    "unicodeBidi",
    "unicodeRange",
    "userZoom",
    "userSelect",
    "vectorEffect",
    "verticalAlign",
    "visibility",
    "whiteSpace",
    "widows",
    "width",
    "willChange",
    "wordBreak",
    "wordSpacing",
    "wordWrap",
    "writingMode",
    "x",
    "y",
    "zIndex",
    "zoom"
];


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/css/src/transition.js */

var prefixes = require(215),
    prefixArray = require(225);


module.exports = transition;


var css = require(207);


function transition(styles, transitions) {
    var i, il, prefix;

    if (css.stopPrefix !== true) {
        i = -1;
        il = prefixes.length - 1;

        while (i++ < il) {
            prefix = prefixes[i];
            styles[prefix.js + "Transition"] = prefixArray(prefix.css, transitions).join(", ");
        }
    }

    styles.transition = transitions.join(", ");

    return styles;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/css/src/textShadow.js */

var prefixes = require(215);


module.exports = textShadow;


var css = require(207);


function textShadow(styles, textShadows) {
    var i, il, prefix;

    if (css.stopPrefix !== true) {
        i = -1;
        il = prefixes.length - 1;

        while (i++ < il) {
            prefix = prefixes[i];
            styles[prefix.js + "TextShadow"] = textShadows.join(", ");
        }
    }

    styles.textShadow = textShadows.join(", ");

    return styles;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/css/src/nonPrefixProperties.js */

module.exports = [
    "parentRule",
    "length",
    "cssText",
    "backfaceVisibility",
    "background",
    "backgroundAttachment",
    "backgroundBlendMode",
    "backgroundClip",
    "backgroundColor",
    "backgroundImage",
    "backgroundOrigin",
    "backgroundPosition",
    "backgroundPositionX",
    "backgroundPositionY",
    "backgroundRepeat",
    "backgroundRepeatX",
    "backgroundRepeatY",
    "baselineShift",
    "border",
    "borderBottom",
    "borderBottomColor",
    "borderBottomStyle",
    "borderBottomWidth",
    "borderCollapse",
    "borderColor",
    "borderImage",
    "borderImageOutset",
    "borderImageRepeat",
    "borderImageSlice",
    "borderImageSource",
    "borderImageWidth",
    "borderLeft",
    "borderLeftColor",
    "borderLeftStyle",
    "borderLeftWidth",
    "borderRight",
    "borderRightColor",
    "borderRightStyle",
    "borderRightWidth",
    "borderSpacing",
    "borderStyle",
    "borderTop",
    "borderTopColor",
    "borderTopStyle",
    "borderTopWidth",
    "borderWidth",
    "bottom",
    "bufferedRendering",
    "captionSide",
    "clear",
    "clip",
    "clipPath",
    "clipRule",
    "color",
    "colorInterpolation",
    "colorInterpolationFilters",
    "colorRendering",
    "content",
    "counterIncrement",
    "counterReset",
    "cursor",
    "cx",
    "cy",
    "direction",
    "display",
    "dominantBaseline",
    "emptyCells",
    "enableBackground",
    "fill",
    "fillOpacity",
    "fillRule",
    "filter",
    "float",
    "floodColor",
    "floodOpacity",
    "font",
    "fontFamily",
    "fontKerning",
    "fontSize",
    "fontStretch",
    "fontStyle",
    "fontVariant",
    "fontVariantLigatures",
    "fontWeight",
    "glyphOrientationHorizontal",
    "glyphOrientationVertical",
    "height",
    "imageRendering",
    "isolation",
    "justifyContent",
    "left",
    "letterSpacing",
    "lightingColor",
    "lineHeight",
    "listStyle",
    "listStyleImage",
    "listStylePosition",
    "listStyleType",
    "margin",
    "marginBottom",
    "marginLeft",
    "marginRight",
    "marginTop",
    "marker",
    "markerEnd",
    "markerMid",
    "markerStart",
    "mask",
    "maskType",
    "maxHeight",
    "maxWidth",
    "maxZoom",
    "minHeight",
    "minWidth",
    "minZoom",
    "mixBlendMode",
    "objectFit",
    "objectPosition",
    "opacity",
    "order",
    "orientation",
    "orphans",
    "outline",
    "outlineColor",
    "outlineOffset",
    "outlineStyle",
    "outlineWidth",
    "overflow",
    "overflowWrap",
    "overflowX",
    "overflowY",
    "padding",
    "paddingBottom",
    "paddingLeft",
    "paddingRight",
    "paddingTop",
    "page",
    "pageBreakAfter",
    "pageBreakBefore",
    "pageBreakInside",
    "paintOrder",
    "perspective",
    "perspectiveOrigin",
    "pointerEvents",
    "position",
    "quotes",
    "r",
    "resize",
    "right",
    "rx",
    "ry",
    "shapeImageThreshold",
    "shapeMargin",
    "shapeOutside",
    "shapeRendering",
    "size",
    "speak",
    "src",
    "stopColor",
    "stopOpacity",
    "stroke",
    "strokeDasharray",
    "strokeDashoffset",
    "strokeLinecap",
    "strokeLinejoin",
    "strokeMiterlimit",
    "strokeOpacity",
    "strokeWidth",
    "tabSize",
    "tableLayout",
    "textAlign",
    "textAnchor",
    "textDecoration",
    "textIndent",
    "textOverflow",
    "textRendering",
    "textShadow",
    "textTransform",
    "top",
    "touchAction",
    "unicodeBidi",
    "unicodeRange",
    "userZoom",
    "vectorEffect",
    "verticalAlign",
    "visibility",
    "whiteSpace",
    "widows",
    "width",
    "willChange",
    "wordBreak",
    "wordSpacing",
    "wordWrap",
    "writingMode",
    "x",
    "y",
    "zIndex",
    "zoom"
];


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/css/src/opacity.js */

var prefix = require(209);


module.exports = opacity;


var css = require(207);


function opacity(styles, value) {
    styles["-ms-filter"] = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + value + ")";
    styles.filter = "alpha(opacity=" + value + ")";
    return prefix(styles, "opacity", value, null, css.stopPrefix);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/css/src/prefixes/index.js */

var environment = require(3);


if (environment.browser) {
    module.exports = require(222);
} else {
    module.exports = require(223);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/css/src/colors.js */

module.exports = {
    red50: "#ffebee",
    red100: "#ffcdd2",
    red200: "#ef9a9a",
    red300: "#e57373",
    red400: "#ef5350",
    red500: "#f44336",
    red600: "#e53935",
    red700: "#d32f2f",
    red800: "#c62828",
    red900: "#b71c1c",
    redA100: "#ff8a80",
    redA200: "#ff5252",
    redA400: "#ff1744",
    redA700: "#d50000",

    pink50: "#fce4ec",
    pink100: "#f8bbd0",
    pink200: "#f48fb1",
    pink300: "#f06292",
    pink400: "#ec407a",
    pink500: "#e91e63",
    pink600: "#d81b60",
    pink700: "#c2185b",
    pink800: "#ad1457",
    pink900: "#880e4f",
    pinkA100: "#ff80ab",
    pinkA200: "#ff4081",
    pinkA400: "#f50057",
    pinkA700: "#c51162",

    purple50: "#f3e5f5",
    purple100: "#e1bee7",
    purple200: "#ce93d8",
    purple300: "#ba68c8",
    purple400: "#ab47bc",
    purple500: "#9c27b0",
    purple600: "#8e24aa",
    purple700: "#7b1fa2",
    purple800: "#6a1b9a",
    purple900: "#4a148c",
    purpleA100: "#ea80fc",
    purpleA200: "#e040fb",
    purpleA400: "#d500f9",
    purpleA700: "#aa00ff",

    deepPurple50: "#ede7f6",
    deepPurple100: "#d1c4e9",
    deepPurple200: "#b39ddb",
    deepPurple300: "#9575cd",
    deepPurple400: "#7e57c2",
    deepPurple500: "#673ab7",
    deepPurple600: "#5e35b1",
    deepPurple700: "#512da8",
    deepPurple800: "#4527a0",
    deepPurple900: "#311b92",
    deepPurpleA100: "#b388ff",
    deepPurpleA200: "#7c4dff",
    deepPurpleA400: "#651fff",
    deepPurpleA700: "#6200ea",

    indigo50: "#e8eaf6",
    indigo100: "#c5cae9",
    indigo200: "#9fa8da",
    indigo300: "#7986cb",
    indigo400: "#5c6bc0",
    indigo500: "#3f51b5",
    indigo600: "#3949ab",
    indigo700: "#303f9f",
    indigo800: "#283593",
    indigo900: "#1a237e",
    indigoA100: "#8c9eff",
    indigoA200: "#536dfe",
    indigoA400: "#3d5afe",
    indigoA700: "#304ffe",

    blue50: "#e3f2fd",
    blue100: "#bbdefb",
    blue200: "#90caf9",
    blue300: "#64b5f6",
    blue400: "#42a5f5",
    blue500: "#2196f3",
    blue600: "#1e88e5",
    blue700: "#1976d2",
    blue800: "#1565c0",
    blue900: "#0d47a1",
    blueA100: "#82b1ff",
    blueA200: "#448aff",
    blueA400: "#2979ff",
    blueA700: "#2962ff",

    lightBlue50: "#e1f5fe",
    lightBlue100: "#b3e5fc",
    lightBlue200: "#81d4fa",
    lightBlue300: "#4fc3f7",
    lightBlue400: "#29b6f6",
    lightBlue500: "#03a9f4",
    lightBlue600: "#039be5",
    lightBlue700: "#0288d1",
    lightBlue800: "#0277bd",
    lightBlue900: "#01579b",
    lightBlueA100: "#80d8ff",
    lightBlueA200: "#40c4ff",
    lightBlueA400: "#00b0ff",
    lightBlueA700: "#0091ea",

    cyan50: "#e0f7fa",
    cyan100: "#b2ebf2",
    cyan200: "#80deea",
    cyan300: "#4dd0e1",
    cyan400: "#26c6da",
    cyan500: "#00bcd4",
    cyan600: "#00acc1",
    cyan700: "#0097a7",
    cyan800: "#00838f",
    cyan900: "#006064",
    cyanA100: "#84ffff",
    cyanA200: "#18ffff",
    cyanA400: "#00e5ff",
    cyanA700: "#00b8d4",

    teal50: "#e0f2f1",
    teal100: "#b2dfdb",
    teal200: "#80cbc4",
    teal300: "#4db6ac",
    teal400: "#26a69a",
    teal500: "#009688",
    teal600: "#00897b",
    teal700: "#00796b",
    teal800: "#00695c",
    teal900: "#004d40",
    tealA100: "#a7ffeb",
    tealA200: "#64ffda",
    tealA400: "#1de9b6",
    tealA700: "#00bfa5",

    green50: "#e8f5e9",
    green100: "#c8e6c9",
    green200: "#a5d6a7",
    green300: "#81c784",
    green400: "#66bb6a",
    green500: "#4caf50",
    green600: "#43a047",
    green700: "#388e3c",
    green800: "#2e7d32",
    green900: "#1b5e20",
    greenA100: "#b9f6ca",
    greenA200: "#69f0ae",
    greenA400: "#00e676",
    greenA700: "#00c853",

    lightGreen50: "#f1f8e9",
    lightGreen100: "#dcedc8",
    lightGreen200: "#c5e1a5",
    lightGreen300: "#aed581",
    lightGreen400: "#9ccc65",
    lightGreen500: "#8bc34a",
    lightGreen600: "#7cb342",
    lightGreen700: "#689f38",
    lightGreen800: "#558b2f",
    lightGreen900: "#33691e",
    lightGreenA100: "#ccff90",
    lightGreenA200: "#b2ff59",
    lightGreenA400: "#76ff03",
    lightGreenA700: "#64dd17",

    lime50: "#f9fbe7",
    lime100: "#f0f4c3",
    lime200: "#e6ee9c",
    lime300: "#dce775",
    lime400: "#d4e157",
    lime500: "#cddc39",
    lime600: "#c0ca33",
    lime700: "#afb42b",
    lime800: "#9e9d24",
    lime900: "#827717",
    limeA100: "#f4ff81",
    limeA200: "#eeff41",
    limeA400: "#c6ff00",
    limeA700: "#aeea00",

    yellow50: "#fffde7",
    yellow100: "#fff9c4",
    yellow200: "#fff59d",
    yellow300: "#fff176",
    yellow400: "#ffee58",
    yellow500: "#ffeb3b",
    yellow600: "#fdd835",
    yellow700: "#fbc02d",
    yellow800: "#f9a825",
    yellow900: "#f57f17",
    yellowA100: "#ffff8d",
    yellowA200: "#ffff00",
    yellowA400: "#ffea00",
    yellowA700: "#ffd600",

    amber50: "#fff8e1",
    amber100: "#ffecb3",
    amber200: "#ffe082",
    amber300: "#ffd54f",
    amber400: "#ffca28",
    amber500: "#ffc107",
    amber600: "#ffb300",
    amber700: "#ffa000",
    amber800: "#ff8f00",
    amber900: "#ff6f00",
    amberA100: "#ffe57f",
    amberA200: "#ffd740",
    amberA400: "#ffc400",
    amberA700: "#ffab00",

    orange50: "#fff3e0",
    orange100: "#ffe0b2",
    orange200: "#ffcc80",
    orange300: "#ffb74d",
    orange400: "#ffa726",
    orange500: "#ff9800",
    orange600: "#fb8c00",
    orange700: "#f57c00",
    orange800: "#ef6c00",
    orange900: "#e65100",
    orangeA100: "#ffd180",
    orangeA200: "#ffab40",
    orangeA400: "#ff9100",
    orangeA700: "#ff6d00",

    deepOrange50: "#fbe9e7",
    deepOrange100: "#ffccbc",
    deepOrange200: "#ffab91",
    deepOrange300: "#ff8a65",
    deepOrange400: "#ff7043",
    deepOrange500: "#ff5722",
    deepOrange600: "#f4511e",
    deepOrange700: "#e64a19",
    deepOrange800: "#d84315",
    deepOrange900: "#bf360c",
    deepOrangeA100: "#ff9e80",
    deepOrangeA200: "#ff6e40",
    deepOrangeA400: "#ff3d00",
    deepOrangeA700: "#dd2c00",

    brown50: "#efebe9",
    brown100: "#d7ccc8",
    brown200: "#bcaaa4",
    brown300: "#a1887f",
    brown400: "#8d6e63",
    brown500: "#795548",
    brown600: "#6d4c41",
    brown700: "#5d4037",
    brown800: "#4e342e",
    brown900: "#3e2723",

    blueGrey50: "#eceff1",
    blueGrey100: "#cfd8dc",
    blueGrey200: "#b0bec5",
    blueGrey300: "#90a4ae",
    blueGrey400: "#78909c",
    blueGrey500: "#607d8b",
    blueGrey600: "#546e7a",
    blueGrey700: "#455a64",
    blueGrey800: "#37474f",
    blueGrey900: "#263238",

    grey50: "#fafafa",
    grey100: "#f5f5f5",
    grey200: "#eeeeee",
    grey300: "#e0e0e0",
    grey400: "#bdbdbd",
    grey500: "#9e9e9e",
    grey600: "#757575",
    grey700: "#616161",
    grey800: "#424242",
    grey900: "#212121",

    black: "#000000",
    white: "#ffffff",

    transparent: "rgba(0, 0, 0, 0)",
    fullBlack: "rgba(0, 0, 0, 1)",
    darkBlack: "rgba(0, 0, 0, 0.87)",
    lightBlack: "rgba(0, 0, 0, 0.54)",
    minBlack: "rgba(0, 0, 0, 0.26)",
    faintBlack: "rgba(0, 0, 0, 0.12)",
    fullWhite: "rgba(255, 255, 255, 1)",
    darkWhite: "rgba(255, 255, 255, 0.87)",
    lightWhite: "rgba(255, 255, 255, 0.54)"

};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/css/src/Styles.js */

var forEach = require(111),
    indexOf = require(61),
    capitalizeString = require(221),
    transition = require(211),
    textShadow = require(212),
    properties = require(210),
    nonPrefixProperties = require(213),
    prefix = require(209);


var Array_slice = Array.prototype.slice,
    StylesPrototype;


module.exports = Styles;


var css = require(207);


function Styles() {}
StylesPrototype = Styles.prototype;

forEach(properties, function(key) {
    if (indexOf(nonPrefixProperties, key) === -1) {
        StylesPrototype["set" + capitalizeString(key)] = function(value) {
            return prefix(this, key, value, null, css.stopPrefix);
        };
    } else {
        StylesPrototype["set" + capitalizeString(key)] = function(value) {
            this[key] = value;
            return this;
        };
    }
});

StylesPrototype.setTransition = function() {
    return transition(this, Array_slice.call(arguments));
};

StylesPrototype.setTextShadow = function() {
    return textShadow(this, Array_slice.call(arguments));
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/css/src/manipulators/darken.js */

var color = require(226),
    toStyle = require(227);


var darken_color = color.create();


module.exports = darken;


function darken(style, amount) {
    var value = darken_color,
        alpha;
    color.fromStyle(value, style);
    alpha = value[3];
    color.smul(value, value, 1 - amount);
    color.cnormalize(value, value);
    value[3] = alpha;
    return toStyle(value);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/css/src/manipulators/fade.js */

var color = require(226),
    toStyle = require(227);


var fade_color = color.create();


module.exports = fade;


function fade(style, amount) {
    var value = fade_color;
    color.fromStyle(value, style);
    value[3] *= amount;
    return toStyle(value);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/css/src/manipulators/lighten.js */

var color = require(226),
    toStyle = require(227);


var lighten_color = color.create();


module.exports = lighten;


function lighten(style, amount) {
    var value = lighten_color,
        alpha;
    color.fromStyle(value, style);
    alpha = value[3];
    color.smul(value, value, 1 + amount);
    color.cnormalize(value, value);
    value[3] = alpha;
    return toStyle(value);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/capitalize_string/src/index.js */

module.exports = capitalizeString;


function capitalizeString(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/css/src/prefixes/browser.js */

var environment = require(3),
    createPrefix = require(224);


var win = environment.window,
    doc = environment.document,

    styles = win.getComputedStyle(doc.documentElement, ""),

    pre = (
        Array.prototype.slice.call(styles).join("").match(/-(moz|webkit|ms)-/) ||
        (styles.OLink === "" && ["", "0"])
    )[1],

    dom = ("WebKit|Moz|MS|O").match(new RegExp("(" + pre + ")", "i"))[1];


module.exports = [createPrefix(dom, pre)];


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/css/src/prefixes/node.js */

var forEach = require(111),
    createPrefix = require(224);


var prefixes = module.exports = [];


forEach([
    ["WebKit", "webkit"],
    ["Moz", "moz"],
    ["MS", "ms"],
    ["O", "o"]
], function(value) {
    prefixes[prefixes.length] = createPrefix(value[0], value[1]);
});


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/css/src/prefixes/createPrefix.js */

var capitalizeString = require(221);


module.exports = createPrefix;


function createPrefix(dom, pre) {
    return {
        dom: dom,
        lowercase: pre,
        css: "-" + pre + "-",
        js: capitalizeString(pre)
    };
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/css/src/prefixArray.js */

module.exports = prefixArray;


function prefixArray(prefix, array) {
    var length = array.length,
        i = -1,
        il = length - 1,
        out = new Array(length);

    while (i++ < il) {
        out[i] = prefix + array[i];
    }

    return out;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/color/src/index.js */

var mathf = require(228),
    vec3 = require(229),
    vec4 = require(230),
    isNumber = require(24);


var color = exports;


color.ArrayType = typeof(Float32Array) !== "undefined" ? Float32Array : mathf.ArrayType;


color.create = function(r, g, b, a) {
    var out = new color.ArrayType(4);

    out[0] = r !== undefined ? r : 0;
    out[1] = g !== undefined ? g : 0;
    out[2] = b !== undefined ? b : 0;
    out[3] = a !== undefined ? a : 1;

    return out;
};

color.copy = vec4.copy;

color.clone = function(a) {
    var out = new color.ArrayType(4);

    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];

    return out;
};

color.setRGB = vec3.set;
color.setRGBA = vec4.set;

color.add = vec4.add;
color.sub = vec4.sub;

color.mul = vec4.mul;
color.div = vec4.div;

color.sadd = vec4.sadd;
color.ssub = vec4.ssub;

color.smul = vec4.smul;
color.sdiv = vec4.sdiv;

color.lengthSqValues = vec4.lengthSqValues;
color.lengthValues = vec4.lengthValues;
color.invLengthValues = vec4.invLengthValues;

color.dot = vec4.dot;

color.lengthSq = vec4.lengthSq;

color.length = vec4.length;

color.invLength = vec4.invLength;

color.setLength = vec4.setLength;

color.normalize = vec4.normalize;

color.lerp = vec4.lerp;

color.min = vec4.min;

color.max = vec4.max;

color.clamp = vec4.clamp;

color.equal = vec4.equal;

color.notEqual = vec4.notEqual;


var cmin = color.create(0, 0, 0, 0),
    cmax = color.create(1, 1, 1, 1);

color.cnormalize = function(out, a) {
    return color.clamp(out, a, cmin, cmax);
};

color.str = function(out) {
    return "Color(" + out[0] + ", " + out[1] + ", " + out[2] + ", " + out[3] + ")";
};

color.set = function(out, r, g, b, a) {
    var type = typeof(r);

    if (type === "number") {
        out[0] = r !== undefined ? r : 0;
        out[1] = g !== undefined ? g : 0;
        out[2] = b !== undefined ? b : 0;
        out[3] = a !== undefined ? a : 1;
    } else if (type === "string") {
        color.fromStyle(out, r);
    } else if (r.length === +r.length) {
        out[0] = r[0] || 0;
        out[1] = r[1] || 0;
        out[2] = r[2] || 0;
        out[3] = r[3] || 1;
    }

    return out;
};

function to256(value) {
    return (value * 255) | 0;
}

color.toRGB = function(out, alpha) {
    if (isNumber(alpha)) {
        return "rgba(" + to256(out[0]) + "," + to256(out[1]) + "," + to256(out[2]) + "," + (mathf.clamp01(alpha) || 0) + ")";
    } else {
        return "rgb(" + to256(out[0]) + "," + to256(out[1]) + "," + to256(out[2]) + ")";
    }
};

color.toRGBA = function(out) {
    return "rgba(" + to256(out[0]) + "," + to256(out[1]) + "," + to256(out[2]) + "," + (mathf.clamp01(out[3]) || 0) + ")";
};

function toHEX(value) {
    value = mathf.clamp(value * 255, 0, 255) | 0;

    if (value < 16) {
        return "0" + value.toString(16);
    } else if (value < 255) {
        return value.toString(16);
    } else {
        return "ff";
    }
}

color.toHEX = function(out) {
    return "#" + toHEX(out[0]) + toHEX(out[1]) + toHEX(out[2]);
};

var rgb255 = /^rgb\((\d+),(?:\s+)?(\d+),(?:\s+)?(\d+)\)$/i,
    inv255 = 1 / 255;
color.fromRGB = function(out, style) {
    var values = rgb255.exec(style);
    out[0] = mathf.min(255, Number(values[1])) * inv255;
    out[1] = mathf.min(255, Number(values[2])) * inv255;
    out[2] = mathf.min(255, Number(values[3])) * inv255;
    out[3] = 1;
    return out;
};

var rgba255 = /^rgba\((\d+),(?:\s+)?(\d+),(?:\s+)?(\d+),(?:\s+)?((?:\.)?\d+(?:\.\d+)?)\)$/i;
color.fromRGBA = function(out, style) {
    var values = rgba255.exec(style);
    out[0] = mathf.min(255, Number(values[1])) * inv255;
    out[1] = mathf.min(255, Number(values[2])) * inv255;
    out[2] = mathf.min(255, Number(values[3])) * inv255;
    out[3] = mathf.min(1, Number(values[4]));
    return out;
};

var rgb100 = /^rgb\((\d+)\%,(?:\s+)?(\d+)\%,(?:\s+)?(\d+)\%\)$/i,
    inv100 = 1 / 100;
color.fromRGB100 = function(out, style) {
    var values = rgb100.exec(style);
    out[0] = mathf.min(100, Number(values[1])) * inv100;
    out[1] = mathf.min(100, Number(values[2])) * inv100;
    out[2] = mathf.min(100, Number(values[3])) * inv100;
    out[3] = 1;
    return out;
};

color.fromHEX = function(out, style) {
    out[0] = parseInt(style.substr(1, 2), 16) * inv255;
    out[1] = parseInt(style.substr(3, 2), 16) * inv255;
    out[2] = parseInt(style.substr(5, 2), 16) * inv255;
    out[3] = 1;
    return out;
};

var hex3to6 = /#(.)(.)(.)/,
    hex3to6String = "#$1$1$2$2$3$3";
color.fromHEX3 = function(out, style) {
    style = style.replace(hex3to6, hex3to6String);
    out[0] = parseInt(style.substr(1, 2), 16) * inv255;
    out[1] = parseInt(style.substr(3, 2), 16) * inv255;
    out[2] = parseInt(style.substr(5, 2), 16) * inv255;
    out[3] = 1;
    return out;
};

color.fromColorName = function(out, style) {
    return color.fromHEX(out, colorNames[style.toLowerCase()]);
};

var hex6 = /^\#([0.0-9a-f]{6})$/i,
    hex3 = /^\#([0.0-9a-f])([0.0-9a-f])([0.0-9a-f])$/i,
    colorName = /^(\w+)$/i;
color.fromStyle = function(out, style) {
    if (rgb255.test(style)) {
        return color.fromRGB(out, style);
    } else if (rgba255.test(style)) {
        return color.fromRGBA(out, style);
    } else if (rgb100.test(style)) {
        return color.fromRGB100(out, style);
    } else if (hex6.test(style)) {
        return color.fromHEX(out, style);
    } else if (hex3.test(style)) {
        return color.fromHEX3(out, style);
    } else if (colorName.test(style)) {
        return color.fromColorName(out, style);
    } else {
        return out;
    }
};

var colorNames = color.colorNames = {
    aliceblue: "#f0f8ff",
    antiquewhite: "#faebd7",
    aqua: "#00ffff",
    aquamarine: "#7fffd4",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    bisque: "#ffe4c4",
    black: "#000000",
    blanchedalmond: "#ffebcd",
    blue: "#0000ff",
    blueviolet: "#8a2be2",
    brown: "#a52a2a",
    burlywood: "#deb887",
    cadetblue: "#5f9ea0",
    chartreuse: "#7fff00",
    chocolate: "#d2691e",
    coral: "#ff7f50",
    cornflowerblue: "#6495ed",
    cornsilk: "#fff8dc",
    crimson: "#dc143c",
    cyan: "#00ffff",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgoldenrod: "#b8860b",
    darkgray: "#a9a9a9",
    darkgreen: "#006400",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkseagreen: "#8fbc8f",
    darkslateblue: "#483d8b",
    darkslategray: "#2f4f4f",
    darkturquoise: "#00ced1",
    darkviolet: "#9400d3",
    deeppink: "#ff1493",
    deepskyblue: "#00bfff",
    dimgray: "#696969",
    dodgerblue: "#1e90ff",
    firebrick: "#b22222",
    floralwhite: "#fffaf0",
    forestgreen: "#228b22",
    fuchsia: "#ff00ff",
    gainsboro: "#dcdcdc",
    ghostwhite: "#f8f8ff",
    gold: "#ffd700",
    goldenrod: "#daa520",
    gray: "#808080",
    green: "#008000",
    greenyellow: "#adff2f",
    grey: "#808080",
    honeydew: "#f0fff0",
    hotpink: "#ff69b4",
    indianred: "#cd5c5c",
    indigo: "#4b0082",
    ivory: "#fffff0",
    khaki: "#f0e68c",
    lavender: "#e6e6fa",
    lavenderblush: "#fff0f5",
    lawngreen: "#7cfc00",
    lemonchiffon: "#fffacd",
    lightblue: "#add8e6",
    lightcoral: "#f08080",
    lightcyan: "#e0ffff",
    lightgoldenrodyellow: "#fafad2",
    lightgrey: "#d3d3d3",
    lightgreen: "#90ee90",
    lightpink: "#ffb6c1",
    lightsalmon: "#ffa07a",
    lightseagreen: "#20b2aa",
    lightskyblue: "#87cefa",
    lightslategray: "#778899",
    lightsteelblue: "#b0c4de",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    limegreen: "#32cd32",
    linen: "#faf0e6",
    magenta: "#ff00ff",
    maroon: "#800000",
    mediumaquamarine: "#66cdaa",
    mediumblue: "#0000cd",
    mediumorchid: "#ba55d3",
    mediumpurple: "#9370d8",
    mediumseagreen: "#3cb371",
    mediumslateblue: "#7b68ee",
    mediumspringgreen: "#00fa9a",
    mediumturquoise: "#48d1cc",
    mediumvioletred: "#c71585",
    midnightblue: "#191970",
    mintcream: "#f5fffa",
    mistyrose: "#ffe4e1",
    moccasin: "#ffe4b5",
    navajowhite: "#ffdead",
    navy: "#000080",
    oldlace: "#fdf5e6",
    olive: "#808000",
    olivedrab: "#6b8e23",
    orange: "#ffa500",
    orangered: "#ff4500",
    orchid: "#da70d6",
    palegoldenrod: "#eee8aa",
    palegreen: "#98fb98",
    paleturquoise: "#afeeee",
    palevioletred: "#d87093",
    papayawhip: "#ffefd5",
    peachpuff: "#ffdab9",
    peru: "#cd853f",
    pink: "#ffc0cb",
    plum: "#dda0dd",
    powderblue: "#b0e0e6",
    purple: "#800080",
    red: "#ff0000",
    rosybrown: "#bc8f8f",
    royalblue: "#4169e1",
    saddlebrown: "#8b4513",
    salmon: "#fa8072",
    sandybrown: "#f4a460",
    seagreen: "#2e8b57",
    seashell: "#fff5ee",
    sienna: "#a0522d",
    silver: "#c0c0c0",
    skyblue: "#87ceeb",
    slateblue: "#6a5acd",
    slategray: "#708090",
    snow: "#fffafa",
    springgreen: "#00ff7f",
    steelblue: "#4682b4",
    tan: "#d2b48c",
    teal: "#008080",
    thistle: "#d8bfd8",
    tomato: "#ff6347",
    turquoise: "#40e0d0",
    violet: "#ee82ee",
    wheat: "#f5deb3",
    white: "#ffffff",
    whitesmoke: "#f5f5f5",
    yellow: "#ffff00",
    yellowgreen: "#9acd32"
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/css/src/manipulators/toStyle.js */

var color = require(226);


module.exports = toStyle;


function toStyle(value) {
    if (value[3] === 1) {
        return color.toHEX(value);
    } else {
        return color.toRGBA(value);
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/mathf/src/index.js */

/*jshint -W079 */
var keys = require(41),
    isNaN = require(199);


var mathf = exports,

    NativeMath = global.Math,

    NativeFloat32Array = typeof(Float32Array) !== "undefined" ? Float32Array : Array;


mathf.ArrayType = NativeFloat32Array;

mathf.PI = NativeMath.PI;
mathf.TAU = mathf.PI * 2;
mathf.TWO_PI = mathf.TAU;
mathf.HALF_PI = mathf.PI * 0.5;
mathf.FOURTH_PI = mathf.PI * 0.25;

mathf.EPSILON = Number.EPSILON || NativeMath.pow(2, -52);

mathf.TO_RADS = mathf.PI / 180;
mathf.TO_DEGS = 180 / mathf.PI;

mathf.E = NativeMath.E;
mathf.LN2 = NativeMath.LN2;
mathf.LN10 = NativeMath.LN10;
mathf.LOG2E = NativeMath.LOG2E;
mathf.LOG10E = NativeMath.LOG10E;
mathf.SQRT1_2 = NativeMath.SQRT1_2;
mathf.SQRT2 = NativeMath.SQRT2;

mathf.abs = NativeMath.abs;

mathf.acos = NativeMath.acos;
mathf.acosh = NativeMath.acosh || (NativeMath.acosh = function acosh(x) {
    return mathf.log(x + mathf.sqrt(x * x - 1));
});
mathf.asin = NativeMath.asin;
mathf.asinh = NativeMath.asinh || (NativeMath.asinh = function asinh(x) {
    if (x === -Infinity) {
        return x;
    } else {
        return mathf.log(x + mathf.sqrt(x * x + 1));
    }
});
mathf.atan = NativeMath.atan;
mathf.atan2 = NativeMath.atan2;
mathf.atanh = NativeMath.atanh || (NativeMath.atanh = function atanh(x) {
    return mathf.log((1 + x) / (1 - x)) / 2;
});

mathf.cbrt = NativeMath.cbrt || (NativeMath.cbrt = function cbrt(x) {
    var y = mathf.pow(mathf.abs(x), 1 / 3);
    return x < 0 ? -y : y;
});

mathf.ceil = NativeMath.ceil;

mathf.clz32 = NativeMath.clz32 || (NativeMath.clz32 = function clz32(value) {
    value = +value >>> 0;
    return value ? 32 - value.toString(2).length : 32;
});

mathf.cos = NativeMath.cos;
mathf.cosh = NativeMath.cosh || (NativeMath.cosh = function cosh(x) {
    return (mathf.exp(x) + mathf.exp(-x)) / 2;
});

mathf.exp = NativeMath.exp;

mathf.expm1 = NativeMath.expm1 || (NativeMath.expm1 = function expm1(x) {
    return mathf.exp(x) - 1;
});

mathf.floor = NativeMath.floor;
mathf.fround = NativeMath.fround || (NativeMath.fround = function fround(x) {
    return new NativeFloat32Array([x])[0];
});

mathf.hypot = NativeMath.hypot || (NativeMath.hypot = function hypot() {
    var y = 0,
        i = -1,
        il = arguments.length - 1,
        value;

    while (i++ < il) {
        value = arguments[i];

        if (value === Infinity || value === -Infinity) {
            return Infinity;
        } else {
            y += value * value;
        }
    }

    return mathf.sqrt(y);
});

mathf.imul = NativeMath.imul || (NativeMath.imul = function imul(a, b) {
    var ah = (a >>> 16) & 0xffff,
        al = a & 0xffff,
        bh = (b >>> 16) & 0xffff,
        bl = b & 0xffff;

    return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
});

mathf.log = NativeMath.log;

mathf.log1p = NativeMath.log1p || (NativeMath.log1p = function log1p(x) {
    return mathf.log(1 + x);
});

mathf.log10 = NativeMath.log10 || (NativeMath.log10 = function log10(x) {
    return mathf.log(x) / mathf.LN10;
});

mathf.log2 = NativeMath.log2 || (NativeMath.log2 = function log2(x) {
    return mathf.log(x) / mathf.LN2;
});

mathf.max = NativeMath.max;
mathf.min = NativeMath.min;

mathf.pow = NativeMath.pow;

mathf.random = NativeMath.random;
mathf.round = NativeMath.round;

mathf.sign = NativeMath.sign || (NativeMath.sign = function sign(x) {
    x = +x;
    if (x === 0 || isNaN(x)) {
        return x;
    } else {
        return x > 0 ? 1 : -1;
    }
});

mathf.sin = NativeMath.sin;
mathf.sinh = NativeMath.sinh || (NativeMath.sinh = function sinh(x) {
    return (mathf.exp(x) - mathf.exp(-x)) / 2;
});
mathf.sqrt = NativeMath.sqrt;

mathf.tan = NativeMath.tan;
mathf.tanh = NativeMath.tanh || (NativeMath.tanh = function tanh(x) {
    if (x === Infinity) {
        return 1;
    } else if (x === -Infinity) {
        return -1;
    } else {
        return (mathf.exp(x) - mathf.exp(-x)) / (mathf.exp(x) + mathf.exp(-x));
    }
});

mathf.trunc = NativeMath.trunc || (NativeMath.trunc = function trunc(x) {
    return x < 0 ? mathf.ceil(x) : mathf.floor(x);
});

mathf.equals = function(a, b, e) {
    return mathf.abs(a - b) < (e !== void 0 ? e : mathf.EPSILON);
};

mathf.modulo = function(a, b) {
    var r = a % b;

    return (r * b < 0) ? r + b : r;
};

mathf.standardRadian = function(x) {
    return mathf.modulo(x, mathf.TWO_PI);
};

mathf.standardAngle = function(x) {
    return mathf.modulo(x, 360);
};

mathf.snap = function(x, y) {
    var m = x % y;
    return m < (y * 0.5) ? x - m : x + y - m;
};

mathf.clamp = function(x, min, max) {
    return x < min ? min : x > max ? max : x;
};

mathf.clampBottom = function(x, min) {
    return x < min ? min : x;
};

mathf.clampTop = function(x, max) {
    return x > max ? max : x;
};

mathf.clamp01 = function(x) {
    return x < 0 ? 0 : x > 1 ? 1 : x;
};

mathf.truncate = function(x, n) {
    var p = mathf.pow(10, n),
        num = x * p;

    return (num < 0 ? mathf.ceil(num) : mathf.floor(num)) / p;
};

mathf.lerp = function(a, b, x) {
    return a + (b - a) * x;
};

mathf.lerpRadian = function(a, b, x) {
    return mathf.standardRadian(a + (b - a) * x);
};

mathf.lerpAngle = function(a, b, x) {
    return mathf.standardAngle(a + (b - a) * x);
};

mathf.lerpCos = function(a, b, x) {
    var ft = x * mathf.PI,
        f = (1 - mathf.cos(ft)) * 0.5;

    return a * (1 - f) + b * f;
};

mathf.lerpCubic = function(v0, v1, v2, v3, x) {
    var P, Q, R, S, Px, Qx, Rx;

    v0 = v0 || v1;
    v3 = v3 || v2;

    P = (v3 - v2) - (v0 - v1);
    Q = (v0 - v1) - P;
    R = v2 - v0;
    S = v1;

    Px = P * x;
    Qx = Q * x;
    Rx = R * x;

    return (Px * Px * Px) + (Qx * Qx) + Rx + S;
};

mathf.smoothStep = function(x, min, max) {
    if (x <= min) {
        return 0;
    } else {
        if (x >= max) {
            return 1;
        } else {
            x = (x - min) / (max - min);
            return x * x * (3 - 2 * x);
        }
    }
};

mathf.smootherStep = function(x, min, max) {
    if (x <= min) {
        return 0;
    } else {
        if (x >= max) {
            return 1;
        } else {
            x = (x - min) / (max - min);
            return x * x * x * (x * (x * 6 - 15) + 10);
        }
    }
};

mathf.pingPong = function(x, length) {
    length = +length || 1;
    return length - mathf.abs(x % (2 * length) - length);
};

mathf.degsToRads = function(x) {
    return mathf.standardRadian(x * mathf.TO_RADS);
};

mathf.radsToDegs = function(x) {
    return mathf.standardAngle(x * mathf.TO_DEGS);
};

mathf.randInt = function(min, max) {
    return mathf.round(min + (mathf.random() * (max - min)));
};

mathf.randFloat = function(min, max) {
    return min + (mathf.random() * (max - min));
};

mathf.randSign = function() {
    return mathf.random() < 0.5 ? 1 : -1;
};

mathf.shuffle = function(array) {
    var i = array.length,
        j, x;

    while (i) {
        j = (mathf.random() * i--) | 0;
        x = array[i];
        array[i] = array[j];
        array[j] = x;
    }

    return array;
};

mathf.randArg = function() {
    return arguments[(mathf.random() * arguments.length) | 0];
};

mathf.randChoice = function(array) {
    return array[(mathf.random() * array.length) | 0];
};

mathf.randChoiceObject = function(object) {
    var objectKeys = keys(object);
    return object[objectKeys[(mathf.random() * objectKeys.length) | 0]];
};

mathf.isPowerOfTwo = function(x) {
    return (x & -x) === x;
};

mathf.floorPowerOfTwo = function(x) {
    var i = 2,
        prev;

    while (i < x) {
        prev = i;
        i *= 2;
    }

    return prev;
};

mathf.ceilPowerOfTwo = function(x) {
    var i = 2;

    while (i < x) {
        i *= 2;
    }

    return i;
};

var n225 = 0.39269908169872414,
    n675 = 1.1780972450961724,
    n1125 = 1.9634954084936207,
    n1575 = 2.748893571891069,
    n2025 = 3.5342917352885173,
    n2475 = 4.319689898685966,
    n2925 = 5.105088062083414,
    n3375 = 5.8904862254808625,

    RIGHT = "right",
    UP_RIGHT = "up_right",
    UP = "up",
    UP_LEFT = "up_left",
    LEFT = "left",
    DOWN_LEFT = "down_left",
    DOWN = "down",
    DOWN_RIGHT = "down_right";

mathf.directionAngle = function(a) {
    a = mathf.standardRadian(a);

    return (
        (a >= n225 && a < n675) ? UP_RIGHT :
        (a >= n675 && a < n1125) ? UP :
        (a >= n1125 && a < n1575) ? UP_LEFT :
        (a >= n1575 && a < n2025) ? LEFT :
        (a >= n2025 && a < n2475) ? DOWN_LEFT :
        (a >= n2475 && a < n2925) ? DOWN :
        (a >= n2925 && a < n3375) ? DOWN_RIGHT :
        RIGHT
    );
};

mathf.direction = function(x, y) {
    var a = mathf.standardRadian(mathf.atan2(y, x));

    return (
        (a >= n225 && a < n675) ? UP_RIGHT :
        (a >= n675 && a < n1125) ? UP :
        (a >= n1125 && a < n1575) ? UP_LEFT :
        (a >= n1575 && a < n2025) ? LEFT :
        (a >= n2025 && a < n2475) ? DOWN_LEFT :
        (a >= n2475 && a < n2925) ? DOWN :
        (a >= n2925 && a < n3375) ? DOWN_RIGHT :
        RIGHT
    );
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/vec3/src/index.js */

var mathf = require(228);


var vec3 = exports;


vec3.ArrayType = typeof(Float32Array) !== "undefined" ? Float32Array : mathf.ArrayType;


vec3.create = function(x, y, z) {
    var out = new vec3.ArrayType(3);

    out[0] = x !== undefined ? x : 0;
    out[1] = y !== undefined ? y : 0;
    out[2] = z !== undefined ? z : 0;

    return out;
};

vec3.copy = function(out, a) {

    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];

    return out;
};

vec3.clone = function(a) {
    var out = new vec3.ArrayType(3);

    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];

    return out;
};

vec3.set = function(out, x, y, z) {

    out[0] = x !== undefined ? x : 0;
    out[1] = y !== undefined ? y : 0;
    out[2] = z !== undefined ? z : 0;

    return out;
};

vec3.add = function(out, a, b) {

    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];

    return out;
};

vec3.sub = function(out, a, b) {

    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];

    return out;
};

vec3.mul = function(out, a, b) {

    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];

    return out;
};

vec3.div = function(out, a, b) {
    var bx = b[0],
        by = b[1],
        bz = b[2];

    out[0] = a[0] * (bx !== 0 ? 1 / bx : bx);
    out[1] = a[1] * (by !== 0 ? 1 / by : by);
    out[2] = a[2] * (bz !== 0 ? 1 / bz : bz);

    return out;
};

vec3.sadd = function(out, a, s) {

    out[0] = a[0] + s;
    out[1] = a[1] + s;
    out[2] = a[2] + s;

    return out;
};

vec3.ssub = function(out, a, s) {

    out[0] = a[0] - s;
    out[1] = a[1] - s;
    out[2] = a[2] - s;

    return out;
};

vec3.smul = function(out, a, s) {

    out[0] = a[0] * s;
    out[1] = a[1] * s;
    out[2] = a[2] * s;

    return out;
};

vec3.sdiv = function(out, a, s) {
    s = s !== 0 ? 1 / s : s;

    out[0] = a[0] * s;
    out[1] = a[1] * s;
    out[2] = a[2] * s;

    return out;
};

vec3.lengthSqValues = function(x, y, z) {

    return x * x + y * y + z * z;
};

vec3.lengthValues = function(x, y, z) {
    var lsq = vec3.lengthSqValues(x, y, z);

    return lsq !== 0 ? mathf.sqrt(lsq) : lsq;
};

vec3.invLengthValues = function(x, y, z) {
    var lsq = vec3.lengthSqValues(x, y, z);

    return lsq !== 0 ? 1 / mathf.sqrt(lsq) : lsq;
};

vec3.cross = function(out, a, b) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        bx = b[0],
        by = b[1],
        bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;

    return out;
};

vec3.dot = function(a, b) {

    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
};

vec3.lengthSq = function(a) {

    return vec3.dot(a, a);
};

vec3.length = function(a) {
    var lsq = vec3.lengthSq(a);

    return lsq !== 0 ? mathf.sqrt(lsq) : lsq;
};

vec3.invLength = function(a) {
    var lsq = vec3.lengthSq(a);

    return lsq !== 0 ? 1 / mathf.sqrt(lsq) : lsq;
};

vec3.setLength = function(out, a, length) {
    var x = a[0],
        y = a[1],
        z = a[2],
        s = length * vec3.invLengthValues(x, y, z);

    out[0] = x * s;
    out[1] = y * s;
    out[2] = z * s;

    return out;
};

vec3.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        invlsq = vec3.invLengthValues(x, y, z);

    out[0] = x * invlsq;
    out[1] = y * invlsq;
    out[2] = z * invlsq;

    return out;
};

vec3.inverse = function(out, a) {

    out[0] = a[0] * -1;
    out[1] = a[1] * -1;
    out[2] = a[2] * -1;

    return out;
};

vec3.lerp = function(out, a, b, x) {
    var lerp = mathf.lerp;

    out[0] = lerp(a[0], b[0], x);
    out[1] = lerp(a[1], b[1], x);
    out[2] = lerp(a[2], b[2], x);

    return out;
};

vec3.min = function(out, a, b) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        bx = b[0],
        by = b[1],
        bz = b[2];

    out[0] = bx < ax ? bx : ax;
    out[1] = by < ay ? by : ay;
    out[2] = bz < az ? bz : az;

    return out;
};

vec3.max = function(out, a, b) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        bx = b[0],
        by = b[1],
        bz = b[2];

    out[0] = bx > ax ? bx : ax;
    out[1] = by > ay ? by : ay;
    out[2] = bz > az ? bz : az;

    return out;
};

vec3.clamp = function(out, a, min, max) {
    var x = a[0],
        y = a[1],
        z = a[2],
        minx = min[0],
        miny = min[1],
        minz = min[2],
        maxx = max[0],
        maxy = max[1],
        maxz = max[2];

    out[0] = x < minx ? minx : x > maxx ? maxx : x;
    out[1] = y < miny ? miny : y > maxy ? maxy : y;
    out[2] = z < minz ? minz : z > maxz ? maxz : z;

    return out;
};

vec3.transformMat3 = function(out, a, m) {
    var x = a[0],
        y = a[1],
        z = a[2];

    out[0] = x * m[0] + y * m[3] + z * m[6];
    out[1] = x * m[1] + y * m[4] + z * m[7];
    out[2] = x * m[2] + y * m[5] + z * m[8];

    return out;
};

vec3.transformMat4 = function(out, a, m) {
    var x = a[0],
        y = a[1],
        z = a[2];

    out[0] = x * m[0] + y * m[4] + z * m[8] + m[12];
    out[1] = x * m[1] + y * m[5] + z * m[9] + m[13];
    out[2] = x * m[2] + y * m[6] + z * m[10] + m[14];

    return out;
};

vec3.transformMat4Rotation = function(out, a, m) {
    var x = a[0],
        y = a[1],
        z = a[2];

    out[0] = x * m[0] + y * m[4] + z * m[8];
    out[1] = x * m[1] + y * m[5] + z * m[9];
    out[2] = x * m[2] + y * m[6] + z * m[10];

    return out;
};

vec3.transformProjection = function(out, a, m) {
    var x = a[0],
        y = a[1],
        z = a[2],
        d = x * m[3] + y * m[7] + z * m[11] + m[15];

    d = d !== 0 ? 1 / d : d;

    out[0] = (x * m[0] + y * m[4] + z * m[8] + m[12]) * d;
    out[1] = (x * m[1] + y * m[5] + z * m[9] + m[13]) * d;
    out[2] = (x * m[2] + y * m[6] + z * m[10] + m[14]) * d;

    return out;
};

vec3.transformProjectionNoPosition = function(out, a, m) {
    var x = a[0],
        y = a[1],
        z = a[2],
        d = x * m[3] + y * m[7] + z * m[11] + m[15];

    d = d !== 0 ? 1 / d : d;

    out[0] = (x * m[0] + y * m[4] + z * m[8]) * d;
    out[1] = (x * m[1] + y * m[5] + z * m[9]) * d;
    out[2] = (x * m[2] + y * m[6] + z * m[10]) * d;

    return out;
};

vec3.transformQuat = function(out, a, q) {
    var x = a[0],
        y = a[1],
        z = a[2],
        qx = q[0],
        qy = q[1],
        qz = q[2],
        qw = q[3],

        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;

    return out;
};

vec3.positionFromMat4 = function(out, m) {

    out[0] = m[12];
    out[1] = m[13];
    out[2] = m[14];

    return out;
};

vec3.scaleFromMat3 = function(out, m) {

    out[0] = vec3.lengthValues(m[0], m[3], m[6]);
    out[1] = vec3.lengthValues(m[1], m[4], m[7]);
    out[2] = vec3.lengthValues(m[2], m[5], m[8]);

    return out;
};

vec3.scaleFromMat4 = function(out, m) {

    out[0] = vec3.lengthValues(m[0], m[4], m[8]);
    out[1] = vec3.lengthValues(m[1], m[5], m[9]);
    out[2] = vec3.lengthValues(m[2], m[6], m[10]);

    return out;
};

vec3.equal = function(a, b) {
    return !(
        a[0] !== b[0] ||
        a[1] !== b[1] ||
        a[2] !== b[2]
    );
};

vec3.notEqual = function(a, b) {
    return (
        a[0] !== b[0] ||
        a[1] !== b[1] ||
        a[2] !== b[2]
    );
};

vec3.str = function(out) {

    return "Vec3(" + out[0] + ", " + out[1] + ", " + out[2] + ")";
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/vec4/src/index.js */

var mathf = require(228);


var vec4 = exports;


vec4.ArrayType = typeof(Float32Array) !== "undefined" ? Float32Array : mathf.ArrayType;


vec4.create = function(x, y, z, w) {
    var out = new vec4.ArrayType(4);

    out[0] = x !== undefined ? x : 0;
    out[1] = y !== undefined ? y : 0;
    out[2] = z !== undefined ? z : 0;
    out[3] = w !== undefined ? w : 1;

    return out;
};

vec4.copy = function(out, a) {

    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];

    return out;
};

vec4.clone = function(a) {
    var out = new vec4.ArrayType(4);

    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];

    return out;
};

vec4.set = function(out, x, y, z, w) {

    out[0] = x !== undefined ? x : 0;
    out[1] = y !== undefined ? y : 0;
    out[2] = z !== undefined ? z : 0;
    out[3] = w !== undefined ? w : 0;

    return out;
};

vec4.add = function(out, a, b) {

    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];

    return out;
};

vec4.sub = function(out, a, b) {

    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];

    return out;
};

vec4.mul = function(out, a, b) {

    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    out[3] = a[3] * b[3];

    return out;
};

vec4.div = function(out, a, b) {
    var bx = b[0],
        by = b[1],
        bz = b[2],
        bw = b[3];

    out[0] = a[0] * (bx !== 0 ? 1 / bx : bx);
    out[1] = a[1] * (by !== 0 ? 1 / by : by);
    out[2] = a[2] * (bz !== 0 ? 1 / bz : bz);
    out[3] = a[3] * (bw !== 0 ? 1 / bw : bw);

    return out;
};

vec4.sadd = function(out, a, s) {

    out[0] = a[0] + s;
    out[1] = a[1] + s;
    out[2] = a[2] + s;
    out[3] = a[3] + s;

    return out;
};

vec4.ssub = function(out, a, s) {

    out[0] = a[0] - s;
    out[1] = a[1] - s;
    out[2] = a[2] - s;
    out[3] = a[3] - s;

    return out;
};

vec4.smul = function(out, a, s) {

    out[0] = a[0] * s;
    out[1] = a[1] * s;
    out[2] = a[2] * s;
    out[3] = a[3] * s;

    return out;
};

vec4.sdiv = function(out, a, s) {
    s = s !== 0 ? 1 / s : s;

    out[0] = a[0] * s;
    out[1] = a[1] * s;
    out[2] = a[2] * s;
    out[3] = a[3] * s;

    return out;
};

vec4.lengthSqValues = function(x, y, z, w) {

    return x * x + y * y + z * z + w * w;
};

vec4.lengthValues = function(x, y, z, w) {
    var lsq = vec4.lengthSqValues(x, y, z, w);

    return lsq !== 0 ? mathf.sqrt(lsq) : lsq;
};

vec4.invLengthValues = function(x, y, z, w) {
    var lsq = vec4.lengthSqValues(x, y, z, w);

    return lsq !== 0 ? 1 / mathf.sqrt(lsq) : lsq;
};

vec4.dot = function(a, b) {

    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
};

vec4.lengthSq = function(a) {

    return vec4.dot(a, a);
};

vec4.length = function(a) {
    var lsq = vec4.lengthSq(a);

    return lsq !== 0 ? mathf.sqrt(lsq) : lsq;
};

vec4.invLength = function(a) {
    var lsq = vec4.lengthSq(a);

    return lsq !== 0 ? 1 / mathf.sqrt(lsq) : lsq;
};

vec4.setLength = function(out, a, length) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3],
        s = length * vec4.invLengthValues(x, y, z, w);

    out[0] = x * s;
    out[1] = y * s;
    out[2] = z * s;
    out[3] = w * s;

    return out;
};

vec4.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3],
        lsq = vec4.invLengthValues(x, y, z, w);

    out[0] = x * lsq;
    out[1] = y * lsq;
    out[2] = z * lsq;
    out[3] = w * lsq;

    return out;
};

vec4.inverse = function(out, a) {

    out[0] = a[0] * -1;
    out[1] = a[1] * -1;
    out[2] = a[2] * -1;
    out[3] = a[3] * -1;

    return out;
};

vec4.lerp = function(out, a, b, x) {
    var lerp = mathf.lerp;

    out[0] = lerp(a[0], b[0], x);
    out[1] = lerp(a[1], b[1], x);
    out[2] = lerp(a[2], b[2], x);
    out[3] = lerp(a[3], b[3], x);

    return out;
};

vec4.min = function(out, a, b) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3],
        bx = b[0],
        by = b[1],
        bz = b[2],
        bw = b[3];

    out[0] = bx < ax ? bx : ax;
    out[1] = by < ay ? by : ay;
    out[2] = bz < az ? bz : az;
    out[3] = bw < aw ? bw : aw;

    return out;
};

vec4.max = function(out, a, b) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3],
        bx = b[0],
        by = b[1],
        bz = b[2],
        bw = b[3];

    out[0] = bx > ax ? bx : ax;
    out[1] = by > ay ? by : ay;
    out[2] = bz > az ? bz : az;
    out[3] = bw > aw ? bw : aw;

    return out;
};

vec4.clamp = function(out, a, min, max) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3],
        minx = min[0],
        miny = min[1],
        minz = min[2],
        minw = min[3],
        maxx = max[0],
        maxy = max[1],
        maxz = max[2],
        maxw = max[3];

    out[0] = x < minx ? minx : x > maxx ? maxx : x;
    out[1] = y < miny ? miny : y > maxy ? maxy : y;
    out[2] = z < minz ? minz : z > maxz ? maxz : z;
    out[3] = w < minw ? minw : w > maxw ? maxw : w;

    return out;
};

vec4.transformMat4 = function(out, a, m) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];

    out[0] = x * m[0] + y * m[4] + z * m[8] + w * m[12];
    out[1] = x * m[1] + y * m[5] + z * m[9] + w * m[13];
    out[2] = x * m[2] + y * m[6] + z * m[10] + w * m[14];
    out[3] = x * m[3] + y * m[7] + z * m[11] + w * m[15];

    return out;
};

vec4.transformProjection = function(out, a, m) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3],
        d = x * m[3] + y * m[7] + z * m[11] + w * m[15];

    d = d !== 0 ? 1 / d : d;

    out[0] = (x * m[0] + y * m[4] + z * m[8] + w * m[12]) * d;
    out[1] = (x * m[1] + y * m[5] + z * m[9] + w * m[13]) * d;
    out[2] = (x * m[2] + y * m[6] + z * m[10] + w * m[14]) * d;
    out[3] = (x * m[3] + y * m[7] + z * m[11] + w * m[15]) * d;

    return out;
};

vec4.positionFromMat4 = function(out, m) {

    out[0] = m[12];
    out[1] = m[13];
    out[2] = m[14];
    out[3] = m[15];

    return out;
};

vec4.scaleFromMat4 = function(out, m) {

    out[0] = vec4.lengthValues(m[0], m[4], m[8], m[12]);
    out[1] = vec4.lengthValues(m[1], m[5], m[9], m[13]);
    out[2] = vec4.lengthValues(m[2], m[6], m[10], m[14]);
    out[3] = vec4.lengthValues(m[3], m[7], m[11], m[15]);

    return out;
};

vec4.equal = function(a, b) {
    return !(
        a[0] !== b[0] ||
        a[1] !== b[1] ||
        a[2] !== b[2] ||
        a[3] !== b[3]
    );
};

vec4.notEqual = function(a, b) {
    return (
        a[0] !== b[0] ||
        a[1] !== b[1] ||
        a[2] !== b[2] ||
        a[3] !== b[3]
    );
};

vec4.str = function(out) {

    return "Vec4(" + out[0] + ", " + out[1] + ", " + out[2] + ", " + out[3] + ")";
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/is_regexp/src/index.js */

var isObject = require(33);


var objectToString = Object.prototype.toString;


module.exports = isRegExp;

/**
   isRegExp takes a value and returns true if the value is a RegExp.
   All other values return false

   @param {Any} any primitive or object
   @returns {Boolean}

   @example
     isRegExp(/regex/); // returns true
     isRegExp(null);    // returns false
     isRegExp({});      // returns false
*/
function isRegExp(value) {
    return (
        isObject(value) &&
        objectToString.call(value) === "[object RegExp]"
    ) || false;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/prop_types/src/en.js */

module.exports = {
    "prop_types.regexp": "Invalid %s of value %s supplied to %s, expected RexExp.",
    "prop_types.instance_of": "Invalid %s of type %s supplied to %s, expected instance of %s.",
    "prop_types.one_of": "Invalid %s of value %s supplied to %s, expected one of %s.",
    "prop_types.is_required": "Required %s was not specified in %s.",
    "prop_types.primitive": "Invalid %s of type %s supplied to %s expected %s.",
    "prop_types.anonymous": "anonymous"
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/format/src/index.js */

var isString = require(21),
    isObject = require(33),
    isPrimitive = require(18),
    isArrayLike = require(37),
    isFunction = require(19),
    indexOf = require(61),
    fastSlice = require(191);


var reFormat = /%([a-z%])/g,
    toString = Object.prototype.toString;


module.exports = format;


function format(str) {
    return baseFormat(str, fastSlice(arguments, 1));
}

format.array = baseFormat;

function baseFormat(str, args) {
    var i = 0,
        length = args ? args.length : 0;

    return (isString(str) ? str + "" : "").replace(reFormat, function(match, s) {
        var value, formatter;

        if (match === "%%") {
            return "%";
        }
        if (i >= length) {
            return "";
        }

        formatter = format[s];
        value = args[i++];

        return value != null && isFunction(formatter) ? formatter(value) : "";
    });
}

format.s = function(value) {
    return String(value);
};

format.d = function(value) {
    return Number(value);
};

format.j = function(value) {
    try {
        return JSON.stringify(value);
    } catch (e) {
        return "[Circular]";
    }
};

function inspectObject(value, inspected, depth, maxDepth) {
    var out, i, il, keys, key;

    if (indexOf(inspected, value) !== -1) {
        return toString.call(value);
    }

    inspected[inspected.length] = value;

    if (isFunction(value) || depth >= maxDepth) {
        return toString.call(value);
    }

    if (isArrayLike(value) && value !== global) {
        depth++;
        out = [];

        i = -1;
        il = value.length - 1;
        while (i++ < il) {
            out[i] = inspect(value[i], inspected, depth, maxDepth);
        }

        return out;
    } else if (isObject(value)) {
        depth++;
        out = {};
        keys = utils.keys(value);

        i = -1;
        il = keys.length - 1;
        while (i++ < il) {
            key = keys[i];
            out[key] = inspect(value[key], inspected, depth, maxDepth);
        }

        return out;
    }

    return isFunction(value.toString) ? value.toString() : value + "";
}

function inspectPrimitive(value) {
    return isNumber(value) ? Number(value) : String(value);
}

function inspect(value, inspected, depth, maxDepth) {
    return isPrimitive(value) ? inspectPrimitive(value) : inspectObject(value, inspected, depth, maxDepth);
}

format.o = function(value) {
    try {
        return JSON.stringify(inspect(value, [], 0, 5), null, 2);
    } catch (e) {
        return "[Circular]";
    }
};

format.inspect = format.o;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/request/src/create.js */

var methods = require(236),
    arrayForEach = require(112),
    EventEmitter = require(178),
    defaults = require(237);


module.exports = function createRequest(request) {
    arrayForEach(methods, function(method) {
        var upper = method.toUpperCase();

        request[method] = function(url, options) {
            options = options || {};

            options.url = url;
            options.method = upper;

            return request(options);
        };
    });
    request.mSearch = request["m-search"];

    arrayForEach(["post", "patch", "put"], function(method) {
        var upper = method.toUpperCase();

        request[method] = function(url, data, options) {
            options = options || {};

            options.url = url;
            options.data = data;
            options.method = upper;

            return request(options);
        };
    });

    request.defaults = defaults.values;
    request.plugins = new EventEmitter(-1);

    return request;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/request/src/requestBrowser.js */

var PromisePolyfill = require(238),
    XMLHttpRequestPolyfill = require(239),
    isFunction = require(19),
    isString = require(21),
    objectForEach = require(113),
    trim = require(240),
    extend = require(27),
    Response = require(241),
    defaults = require(237),
    camelcaseHeader = require(242),
    parseContentType = require(243);


var supportsFormData = typeof(FormData) !== "undefined";


defaults.values.XMLHttpRequest = XMLHttpRequestPolyfill;


function parseResponseHeaders(responseHeaders) {
    var headers = {},
        raw = responseHeaders.split("\n");

    objectForEach(raw, function(header) {
        var tmp = header.split(":"),
            key = tmp[0],
            value = tmp[1];

        if (key && value) {
            key = camelcaseHeader(key);
            value = trim(value);

            if (key === "Content-Length") {
                value = +value;
            }

            headers[key] = value;
        }
    });

    return headers;
}


function addEventListener(xhr, event, listener) {
    if (isFunction(xhr.addEventListener)) {
        xhr.addEventListener(event, listener, false);
    } else if (isFunction(xhr.attachEvent)) {
        xhr.attachEvent("on" + event, listener);
    } else {
        xhr["on" + event] = listener;
    }
}

function request(options) {
    var xhr = new defaults.values.XMLHttpRequest(),
        plugins = request.plugins,
        canSetRequestHeader = isFunction(xhr.setRequestHeader),
        canOverrideMimeType = isFunction(xhr.overrideMimeType),
        isFormData, defer;

    options = defaults(options);

    plugins.emit("before", xhr, options);

    isFormData = (supportsFormData && options.data instanceof FormData);

    if (options.isPromise) {
        defer = PromisePolyfill.defer();
    }

    function onSuccess(response) {
        plugins.emit("response", response, xhr, options);
        plugins.emit("load", response, xhr, options);

        if (options.isPromise) {
            defer.resolve(response);
        } else {
            if (options.success) {
                options.success(response);
            }
        }
    }

    function onError(response) {
        plugins.emit("response", response, xhr, options);
        plugins.emit("error", response, xhr, options);

        if (options.isPromise) {
            defer.reject(response);
        } else {
            if (options.error) {
                options.error(response);
            }
        }
    }

    function onComplete() {
        var statusCode = +xhr.status,
            responseText = xhr.responseText,
            response = new Response();

        response.url = xhr.responseURL || options.url;
        response.method = options.method;

        response.statusCode = statusCode;

        response.responseHeaders = xhr.getAllResponseHeaders ? parseResponseHeaders(xhr.getAllResponseHeaders()) : {};
        response.requestHeaders = options.headers ? extend({}, options.headers) : {};

        response.data = null;

        if (responseText) {
            if (options.transformResponse) {
                response.data = options.transformResponse(responseText);
            } else {
                if (parseContentType(response.responseHeaders["Content-Type"]) === "application/json") {
                    try {
                        response.data = JSON.parse(responseText);
                    } catch (e) {
                        response.data = e;
                        onError(response);
                        return;
                    }
                } else if (responseText) {
                    response.data = responseText;
                }
            }
        }

        if ((statusCode > 199 && statusCode < 301) || statusCode === 304) {
            onSuccess(response);
        } else {
            onError(response);
        }
    }

    function onReadyStateChange() {
        switch (+xhr.readyState) {
            case 1:
                plugins.emit("request", xhr, options);
                break;
            case 4:
                onComplete();
                break;
        }
    }

    addEventListener(xhr, "readystatechange", onReadyStateChange);

    if (options.withCredentials && options.async) {
        xhr.withCredentials = options.withCredentials;
    }

    xhr.open(
        options.method,
        options.url,
        options.async,
        options.username,
        options.password
    );

    if (canSetRequestHeader) {
        objectForEach(options.headers, function(value, key) {
            if (isString(value)) {
                if (key === "Content-Type" && canOverrideMimeType) {
                    xhr.overrideMimeType(value);
                }
                xhr.setRequestHeader(key, value);
            }
        });
    }

    if (options.transformRequest) {
        options.data = options.transformRequest(options.data);
    } else {
        if (!isString(options.data) && !isFormData) {
            if (options.headers["Content-Type"] === "application/json") {
                options.data = JSON.stringify(options.data);
            } else {
                options.data = options.data + "";
            }
        }
    }

    xhr.send(options.data);

    return defer ? defer.promise : undefined;
}


module.exports = request;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/methods/src/browser.js */

module.exports = [
    "checkout",
    "connect",
    "copy",
    "delete",
    "get",
    "head",
    "lock",
    "m-search",
    "merge",
    "mkactivity",
    "mkcalendar",
    "mkcol",
    "move",
    "notify",
    "options",
    "patch",
    "post",
    "propfind",
    "proppatch",
    "purge",
    "put",
    "report",
    "search",
    "subscribe",
    "trace",
    "unlock",
    "unsubscribe"
];


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/request/src/defaults.js */

var extend = require(27),
    isString = require(21),
    isFunction = require(19);


function defaults(options) {
    options = extend({}, defaults.values, options);

    options.url = isString(options.url || (options.url = options.src)) ? options.url : null;
    options.method = isString(options.method) ? options.method.toUpperCase() : "GET";

    options.data = options.data;

    options.transformRequest = isFunction(options.transformRequest) ? options.transformRequest : null;
    options.transformResponse = isFunction(options.transformResponse) ? options.transformResponse : null;

    options.withCredentials = options.withCredentials != null ? !!options.withCredentials : false;
    options.headers = extend({}, defaults.values.headers, options.headers);
    options.async = options.async != null ? !!options.async : true;

    options.success = isFunction(options.success) ? options.success : null;
    options.error = isFunction(options.error) ? options.error : null;
    options.isPromise = !isFunction(options.success) && !isFunction(options.error);

    options.user = isString(options.user) ? options.user : undefined;
    options.password = isString(options.password) ? options.password : undefined;

    return options;
}

defaults.values = {
    url: "",
    method: "GET",
    headers: {
        Accept: "*/*",
        "X-Requested-With": "XMLHttpRequest"
    }
};


module.exports = defaults;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/promise_polyfill/src/index.js */

var process = require(60);
var isNull = require(29),
    isArray = require(20),
    isObject = require(33),
    isFunction = require(19),
    WeakMapPolyfill = require(244),
    fastSlice = require(191);


var PromisePolyfill, PromisePolyfillPrototype, PrivatePromise;


if (
    typeof(Promise) !== "undefined" &&
    (function isValidPromise() {
        try {
            new Promise(function resolver(resolve) {
                resolve(true);
            }).then(function onThen() {});
            return true;
        } catch (e) {
            return false;
        }
    }())
) {
    PromisePolyfill = Promise;
    PromisePolyfillPrototype = PromisePolyfill.prototype;
} else {
    PrivatePromise = (function createPrivatePromise() {

        function PrivatePromise(resolver) {
            var _this = this;

            this.handlers = [];
            this.state = null;
            this.value = null;

            handleResolve(
                resolver,
                function resolve(newValue) {
                    resolveValue(_this, newValue);
                },
                function reject(newValue) {
                    rejectValue(_this, newValue);
                }
            );
        }

        PrivatePromise.store = new WeakMapPolyfill();

        PrivatePromise.handle = function(_this, onFulfilled, onRejected, resolve, reject) {
            handle(_this, new Handler(onFulfilled, onRejected, resolve, reject));
        };

        function Handler(onFulfilled, onRejected, resolve, reject) {
            this.onFulfilled = isFunction(onFulfilled) ? onFulfilled : null;
            this.onRejected = isFunction(onRejected) ? onRejected : null;
            this.resolve = resolve;
            this.reject = reject;
        }

        function handleResolve(resolver, onFulfilled, onRejected) {
            var done = false;

            try {
                resolver(
                    function(value) {
                        if (!done) {
                            done = true;
                            onFulfilled(value);
                        }
                    },
                    function(reason) {
                        if (!done) {
                            done = true;
                            onRejected(reason);
                        }
                    }
                );
            } catch (err) {
                if (!done) {
                    done = true;
                    onRejected(err);
                }
            }
        }

        function resolveValue(_this, newValue) {
            try {
                if (newValue === _this) {
                    throw new TypeError("A promise cannot be resolved with itself");
                } else {
                    if (newValue && (isObject(newValue) || isFunction(newValue))) {
                        if (isFunction(newValue.then)) {
                            handleResolve(
                                function resolver(resolve, reject) {
                                    newValue.then(resolve, reject);
                                },
                                function resolve(newValue) {
                                    resolveValue(_this, newValue);
                                },
                                function reject(newValue) {
                                    rejectValue(_this, newValue);
                                }
                            );
                            return;
                        }
                    }
                    _this.state = true;
                    _this.value = newValue;
                    finale(_this);
                }
            } catch (error) {
                rejectValue(_this, error);
            }
        }

        function rejectValue(_this, newValue) {
            _this.state = false;
            _this.value = newValue;
            finale(_this);
        }

        function finale(_this) {
            var handlers = _this.handlers,
                i = -1,
                il = handlers.length - 1;

            while (i++ < il) {
                handle(_this, handlers[i]);
            }

            handlers.length = 0;
        }

        function handle(_this, handler) {
            var state = _this.state;

            if (isNull(_this.state)) {
                _this.handlers.push(handler);
            } else {
                process.nextTick(function onNextTick() {
                    var callback = state ? handler.onFulfilled : handler.onRejected,
                        value = _this.value,
                        out;

                    if (isNull(callback)) {
                        if (state) {
                            handler.resolve(value);
                        } else {
                            handler.reject(value);
                        }
                    } else {
                        try {
                            out = callback(value);
                            handler.resolve(out);
                        } catch (err) {
                            handler.reject(err);
                        }
                    }
                });
            }
        }

        return PrivatePromise;
    }());

    PromisePolyfill = function Promise(resolver) {

        if (!isFunction(resolver)) {
            throw new TypeError("Promise(resolver) You must pass a resolver function as the first argument to the promise constructor");
        }

        PrivatePromise.store.set(this, new PrivatePromise(resolver));
    };

    PromisePolyfillPrototype = PromisePolyfill.prototype;

    PromisePolyfillPrototype.then = function(onFulfilled, onRejected) {
        var _this = PrivatePromise.store.get(this);

        return new PromisePolyfill(function resolver(resolve, reject) {
            PrivatePromise.handle(_this, onFulfilled, onRejected, resolve, reject);
        });
    };
}

if (!isFunction(PromisePolyfillPrototype["catch"])) {
    PromisePolyfillPrototype["catch"] = function(reject) {
        return this.then(null, reject);
    };
}

if (!isFunction(PromisePolyfill.resolve)) {
    PromisePolyfill.resolve = function(value) {
        if (value instanceof PromisePolyfill) {
            return value;
        }

        return new PromisePolyfill(function resolver(resolve) {
            resolve(value);
        });
    };
}

if (!isFunction(PromisePolyfill.reject)) {
    PromisePolyfill.reject = function(value) {
        return new PromisePolyfill(function resolver(resolve, reject) {
            reject(value);
        });
    };
}

if (!isFunction(PromisePolyfill.defer)) {
    PromisePolyfill.defer = function() {
        var deferred = {};

        deferred.promise = new PromisePolyfill(function resolver(resolve, reject) {
            deferred.resolve = resolve;
            deferred.reject = reject;
        });

        return deferred;
    };
}

if (!isFunction(PromisePolyfill.all)) {
    PromisePolyfill.all = function(value) {
        var args = (arguments.length === 1 && isArray(value)) ? value : fastSlice(arguments);

        return new PromisePolyfill(function resolver(resolve, reject) {
            var length = args.length,
                i = -1,
                il = length - 1;

            if (length === 0) {
                resolve([]);
                return;
            }

            function resolveValue(index, value) {
                try {
                    if (value && (isObject(value) || isFunction(value)) && isFunction(value.then)) {
                        value.then(function(v) {
                            resolveValue(index, v);
                        }, reject);
                        return;
                    }
                    if (--length === 0) {
                        resolve(args);
                    }
                } catch (e) {
                    reject(e);
                }
            }

            while (i++ < il) {
                resolveValue(i, args[i]);
            }
        });
    };
}

if (!isFunction(PromisePolyfill.race)) {
    PromisePolyfill.race = function(values) {
        return new PromisePolyfill(function resolver(resolve, reject) {
            var i = -1,
                il = values.length - 1,
                value;

            while (i++ < il) {
                value = values[i];

                if (value && (isObject(value) || isFunction(value)) && isFunction(value.then)) {
                    value.then(resolve, reject);
                }
            }
        });
    };
}


module.exports = PromisePolyfill;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/xmlhttprequest_polyfill/src/index.js */

var extend = require(27),
    environment = require(3),
    emptyFunction = require(42),
    createXMLHttpRequest = require(246),
    toUint8Array = require(247);


var window = environment.window,

    NativeXMLHttpRequest = window.XMLHttpRequest,
    NativeActiveXObject = window.ActiveXObject,

    XMLHttpRequestPolyfill = (
        NativeXMLHttpRequest ||
        (function getRequestObject(types) {
            var i = -1,
                il = types.length - 1,
                instance, type;

            while (i++ < il) {
                try {
                    type = types[i];
                    instance = new NativeActiveXObject(type);
                    break;
                } catch (e) {}
                type = null;
            }

            if (!type) {
                throw new Error("XMLHttpRequest not supported by this browser");
            }

            return createXMLHttpRequest(function createNativeObject() {
                return new NativeActiveXObject(type);
            });
        }([
            "Msxml2.XMLHTTP",
            "Msxml3.XMLHTTP",
            "Microsoft.XMLHTTP"
        ]))
    ),

    XMLHttpRequestPolyfillPrototype = XMLHttpRequestPolyfill.prototype;


if (!(XMLHttpRequestPolyfillPrototype.addEventListener || XMLHttpRequestPolyfillPrototype.attachEvent)) {
    XMLHttpRequestPolyfill = createXMLHttpRequest(function createNativeObject() {
        return new NativeXMLHttpRequest();
    });
    XMLHttpRequestPolyfillPrototype = XMLHttpRequestPolyfill.prototype;
}

XMLHttpRequestPolyfillPrototype.nativeSetRequestHeader = XMLHttpRequestPolyfillPrototype.setRequestHeader || emptyFunction;

XMLHttpRequestPolyfillPrototype.setRequestHeader = function(key, value) {
    (this.__requestHeaders || (this.__requestHeaders = {}))[key] = value;
    this.nativeSetRequestHeader(key, value);
};

XMLHttpRequestPolyfillPrototype.getRequestHeader = function(key) {
    return (this.__requestHeaders || (this.__requestHeaders = {}))[key];
};

XMLHttpRequestPolyfillPrototype.getRequestHeaders = function() {
    return extend({}, this.__requestHeaders);
};

if (!XMLHttpRequestPolyfillPrototype.setTimeout) {
    XMLHttpRequestPolyfillPrototype.setTimeout = function(ms) {
        this.timeout = ms;
    };
}

if (!XMLHttpRequestPolyfillPrototype.setWithCredentials) {
    XMLHttpRequestPolyfillPrototype.setWithCredentials = function(value) {
        this.withCredentials = !!value;
    };
}

if (!XMLHttpRequestPolyfillPrototype.sendAsBinary) {
    XMLHttpRequestPolyfillPrototype.sendAsBinary = function(str) {
        return this.send(toUint8Array(str));
    };
}


module.exports = XMLHttpRequestPolyfill;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/trim/src/index.js */

var isNative = require(31),
    toString = require(35);


var StringPrototype = String.prototype,

    reTrim = /^[\s\xA0]+|[\s\xA0]+$/g,
    reTrimLeft = /^[\s\xA0]+/g,
    reTrimRight = /[\s\xA0]+$/g,

    baseTrim, baseTrimLeft, baseTrimRight;


module.exports = trim;


if (isNative(StringPrototype.trim)) {
    baseTrim = function baseTrim(str) {
        return str.trim();
    };
} else {
    baseTrim = function baseTrim(str) {
        return str.replace(reTrim, "");
    };
}

if (isNative(StringPrototype.trimLeft)) {
    baseTrimLeft = function baseTrimLeft(str) {
        return str.trimLeft();
    };
} else {
    baseTrimLeft = function baseTrimLeft(str) {
        return str.replace(reTrimLeft, "");
    };
}

if (isNative(StringPrototype.trimRight)) {
    baseTrimRight = function baseTrimRight(str) {
        return str.trimRight();
    };
} else {
    baseTrimRight = function baseTrimRight(str) {
        return str.replace(reTrimRight, "");
    };
}


function trim(str) {
    return baseTrim(toString(str));
}

trim.left = function trimLeft(str) {
    return baseTrimLeft(toString(str));
};

trim.right = function trimRight(str) {
    return baseTrimRight(toString(str));
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/request/src/Response.js */

module.exports = Response;


function Response() {
    this.data = null;
    this.method = null;
    this.requestHeaders = null;
    this.responseHeaders = null;
    this.statusCode = null;
    this.url = null;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/request/src/camelcaseHeader.js */

var arrayMap = require(39),
    capitalizeString = require(221);


module.exports = function camelcaseHeader(str) {
    return arrayMap(str.split("-"), capitalizeString).join("-");
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/request/src/parseContentType.js */

module.exports = function parseContentType(str) {
    var index;

    if (str) {
        if ((index = str.indexOf(";")) !== -1) {
            str = str.substring(0, index);
        }
        if ((index = str.indexOf(",")) !== -1) {
            return str.substring(0, index);
        }

        return str;
    }

    return "application/octet-stream";
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/weak_map_polyfill/src/index.js */

var isNative = require(31),
    isPrimitive = require(18),
    createStore = require(245);


var NativeWeakMap = typeof(WeakMap) !== "undefined" ? WeakMap : null,
    WeakMapPolyfill, WeakMapPolyfillPrototype;


if (isNative(NativeWeakMap)) {
    WeakMapPolyfill = NativeWeakMap;
    WeakMapPolyfillPrototype = WeakMapPolyfill.prototype;
} else {
    WeakMapPolyfill = function WeakMap() {
        this.__store = createStore();
    };
    WeakMapPolyfillPrototype = WeakMapPolyfill.prototype;
    WeakMapPolyfillPrototype.constructor = WeakMapPolyfill;

    WeakMapPolyfillPrototype.get = function(key) {
        return this.__store.get(key);
    };

    WeakMapPolyfillPrototype.set = function(key, value) {
        if (isPrimitive(key)) {
            throw new TypeError("Invalid value used as key");
        } else {
            this.__store.set(key, value);
        }
    };

    WeakMapPolyfillPrototype.has = function(key) {
        return this.__store.has(key);
    };

    WeakMapPolyfillPrototype["delete"] = function(key) {
        return this.__store.remove(key);
    };

    WeakMapPolyfillPrototype.length = 0;
}

WeakMapPolyfillPrototype.remove = WeakMapPolyfillPrototype["delete"];


module.exports = WeakMapPolyfill;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/create_store/src/index.js */

var has = require(25),
    defineProperty = require(58),
    isPrimitive = require(18);


var emptyStore = {
        value: undefined
    },
    ObjectPrototype = Object.prototype;


module.exports = createStore;


function createStore() {
    var privateKey = {},
        size = 0;


    function get(key) {
        var store;

        if (isPrimitive(key)) {
            throw new TypeError("Invalid value used as key");
        } else {
            store = key.valueOf(privateKey);

            if (!store || store.identity !== privateKey) {
                store = emptyStore;
            }

            return store;
        }
    }

    function set(key) {
        var store;

        if (isPrimitive(key)) {
            throw new TypeError("Invalid value used as key");
        } else {
            store = key.valueOf(privateKey);

            if (!store || store.identity !== privateKey) {
                store = privateStore(key, privateKey);
                size += 1;
            }

            return store;
        }
    }

    return {
        get: function(key) {
            return get(key).value;
        },
        set: function(key, value) {
            set(key).value = value;
        },
        has: function(key) {
            var store = get(key);
            return store !== emptyStore ? has(store, "value") : false;
        },
        remove: function(key) {
            var store = get(key);

            if (store !== emptyStore) {
                size -= 1;
                return store.remove();
            } else {
                return false;
            }
        },
        clear: function() {
            privateKey = {};
            size = 0;
        },
        size: function() {
            return size;
        }
    };
}

function privateStore(key, privateKey) {
    var keyValueOf = key.valueOf || ObjectPrototype.valueOf,
        store = {
            identity: privateKey,
            remove: function remove() {
                if (key.valueOf === valueOf) {
                    key.valueOf = keyValueOf;
                }
                return delete store.value;
            }
        };

    function valueOf(value) {
        if (value !== privateKey) {
            return keyValueOf.apply(this, arguments);
        } else {
            return store;
        }
    }

    defineProperty(key, "valueOf", {
        value: valueOf,
        configurable: true,
        enumerable: false,
        writable: true
    });

    return store;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/xmlhttprequest_polyfill/src/createXMLHttpRequest.js */

var EventEmitter = require(178),
    toUint8Array = require(247);


module.exports = createXMLHttpRequest;


function createXMLHttpRequest(createNativeObject) {
    var XMLHttpRequestPrototype;


    function XMLHttpRequest() {
        var _this = this,
            nativeObject = createNativeObject();

        EventEmitter.call(this, -1);

        this.__requestHeaders = {};
        this.__nativeObject = nativeObject;

        this.onabort = null;
        this.onerror = null;
        this.onload = null;
        this.onloadend = null;
        this.onloadstart = null;
        this.onprogress = null;
        this.onreadystatechange = null;
        this.ontimeout = null;
        this.readyState = 0;
        this.response = "";
        this.responseText = "";
        this.responseType = "";
        this.responseURL = "";
        this.responseXML = null;
        this.status = 0;
        this.statusText = "";
        this.timeout = 0;
        this.withCredentials = false;

        nativeObject.onreadystatechange = function(e) {
            return XMLHttpRequest_onReadyStateChange(_this, e);
        };

        nativeObject.ontimeout = function(e) {
            if (_this.ontimeout) {
                _this.ontimeout(e);
            }
            _this.emit("timeout");
        };

        nativeObject.onerror = function(e) {
            if (_this.onerror) {
                _this.onerror(e);
            }
            _this.emit("error");
        };
    }
    EventEmitter.extend(XMLHttpRequest);
    XMLHttpRequestPrototype = XMLHttpRequest.prototype;

    function XMLHttpRequest_onReadyStateChange(_this, e) {
        var nativeObject = _this.__nativeObject,
            response;

        _this.readyState = nativeObject.readyState;

        if (_this.onreadystatechange) {
            _this.onreadystatechange(e);
        }
        _this.emit("readystatechange", e);

        switch (nativeObject.readyState) {
            case 3:
                if (_this.onprogress) {
                    _this.onprogress();
                }
                _this.emit("progress", e);
                break;
            case 4:
                response = nativeObject.response || "";

                if (_this.responseType === "arraybuffer") {
                    response = toUint8Array(response);
                }

                _this.response = response;
                _this.responseText = nativeObject.responseText || _this.response;
                _this.responseType = nativeObject.responseType || "";
                _this.responseURL = nativeObject.responseURL || "";
                _this.responseXML = nativeObject.responseXML || _this.response;
                _this.status = nativeObject.status || 0;
                _this.statusText = nativeObject.statusText || "";

                if (_this.onload) {
                    _this.onload();
                }
                _this.emit("load", e);
                if (_this.onloadend) {
                    _this.onloadend();
                }
                _this.emit("loadend", e);
                break;
        }

        return _this;
    }

    XMLHttpRequestPrototype.attachEvent = function(type, fn) {
        return this.on(type.slice(2), fn);
    };
    XMLHttpRequestPrototype.detachEvent = function(type, fn) {
        return this.off(type.slice(2), fn);
    };

    XMLHttpRequestPrototype.addEventListener = XMLHttpRequestPrototype.on;
    XMLHttpRequestPrototype.removeEventListener = XMLHttpRequestPrototype.off;

    XMLHttpRequestPrototype.dispatchEvent = function(event) {
        return this.emit(event.type, event);
    };

    XMLHttpRequestPrototype.fireEvent = function(type, event) {
        return this.emit("on" + type, event);
    };

    XMLHttpRequestPrototype.abort = function() {
        try {
            if (this.onabort) {
                this.onabort();
            }
            _this.emit("abort", {});
            this.__nativeObject.abort();
        } catch (e) {}
    };

    XMLHttpRequestPrototype.setTimeout = function(ms) {
        this.timeout = ms;
        try {
            this.__nativeObject.timeout = ms;
        } catch (e) {}
    };

    XMLHttpRequestPrototype.setWithCredentials = function(value) {
        value = !!value;
        this.withCredentials = value;
        try {
            this.__nativeObject.withCredentials = value;
        } catch (e) {}
    };

    XMLHttpRequestPrototype.getAllResponseHeaders = function() {
        try {
            return this.__nativeObject.getAllResponseHeaders();
        } catch (e) {
            return null;
        }
    };

    XMLHttpRequestPrototype.getResponseHeader = function(header) {
        try {
            return this.__nativeObject.getResponseHeader(header);
        } catch (e) {
            return null;
        }
    };

    XMLHttpRequestPrototype.getResponseHeader = function(header) {
        try {
            return this.__nativeObject.getResponseHeader(header);
        } catch (e) {
            return null;
        }
    };

    XMLHttpRequestPrototype.open = function(method, url, async, user, password) {
        if (this.readyState === 0) {
            this.readyState = 1;
            return this.__nativeObject.open(method, url, async, user, password);
        } else {
            return undefined;
        }
    };

    XMLHttpRequestPrototype.overrideMimeType = function(mimetype) {
        try {
            return this.__nativeObject.overrideMimeType(mimetype);
        } catch (e) {}
    };

    XMLHttpRequestPrototype.send = function(data) {
        try {
            return this.__nativeObject.send(data);
        } catch (e) {}
    };

    XMLHttpRequestPrototype.setRequestHeader = function(key, value) {
        try {
            return this.__nativeObject.setRequestHeader(key, value);
        } catch (e) {}
    };

    return XMLHttpRequest;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/xmlhttprequest_polyfill/src/toUint8Array.js */

var environment = require(3);


var Uint8Array = environment.window.Uint8Array || Array;


module.exports = toUint8Array;


function toUint8Array(str) {
    var length = str.length,
        ui8 = new Uint8Array(length),
        i = -1,
        il = length - 1;

    while (i++ < il) {
        ui8[i] = str.charCodeAt(i) & 0xff;
    }

    return ui8;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/layers_browser/src/index.js */

var layers = exports;


layers.Layer = require(249);
layers.Route = require(250);
layers.Router = require(251);

layers.filterParams = require(252);


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/layers_browser/src/Layer.js */

var EventEmitter = require(178),
    pathToRegExp = require(253),
    isString = require(21),
    arrayMap = require(39),
    filterParams = require(252),
    cleanPath = require(254),
    buildPath = require(255);


var LayerPrototype;


module.exports = Layer;


function Layer(path, parent, end) {

    EventEmitter.call(this, -1);

    this.construct(path, parent, end);
}
EventEmitter.extend(Layer);
LayerPrototype = Layer.prototype;

Layer.create = function(path, parent, end) {
    return (new Layer(path, parent, end));
};

LayerPrototype.construct = function(path, parent, end) {

    this.__parent = parent;
    this.__regexp = null;
    this.__params = [];

    this.__end = !!end;
    this.__relativePath = null;
    this.__path = null;

    this.setPath(isString(path) ? path : "/");

    return this;
};

LayerPrototype.destructor = function() {

    this.__parent = null;
    this.__regexp = null;
    this.__params = null;

    this.__end = null;
    this.__relativePath = null;
    this.__path = null;

    return this;
};

LayerPrototype.setPath = function(path) {

    this.__relativePath = cleanPath(path);
    this.__path = buildPath(this.__parent, this.__relativePath);
    this.compile();

    return this;
};

LayerPrototype.match = function(path) {
    return filterParams(this.__regexp, this.__params, path);
};

LayerPrototype.format = function() {
    return pathToRegExp.format(this.__path);
};

LayerPrototype.recompile = function() {
    return this.setPath(this.__relativePath);
};

LayerPrototype.compile = function() {
    this.__regexp = pathToRegExp(this.__path, this.__params, this.__end);
    return this;
};

LayerPrototype.toJSON = function(json) {

    json = json || {};

    json.path = this.__path;

    json.params = arrayMap(this.__params, function(param) {
        return param.toJSON();
    });

    return json;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/layers_browser/src/Route.js */

var isArray = require(20),
    mount = require(258),
    unmount = require(259),
    LayerData = require(260),
    Layer = require(249);


var LayerPrototype = Layer.prototype,
    RoutePrototype;


module.exports = Route;


function Route(path, parent, end) {
    Layer.call(this, path, parent, end);
}
Layer.extend(Route);
RoutePrototype = Route.prototype;

Route.create = function(path, parent, end) {
    return new Route(path, parent, end);
};

RoutePrototype.__isRoute__ = true;

RoutePrototype.construct = function(path, parent, end) {

    LayerPrototype.construct.call(this, path, parent, end);

    this.__stack = [];
    this.__isMiddleware__ = false;

    return this;
};

RoutePrototype.destructor = function() {

    LayerPrototype.destructor.call(this);

    this.__stack = null;

    return this;
};

RoutePrototype.enqueue = function(queue, parentData /*, pathname */ ) {
    var stack = this.__stack,
        i = -1,
        il = stack.length - 1;

    while (i++ < il) {
        queue[queue.length] = new LayerData(stack[i], parentData);
    }
};

RoutePrototype.mount = function(handlers) {
    mount(this.__stack, isArray(handlers) ? handlers : arguments);
    return this;
};

RoutePrototype.unmount = function(handlers) {
    unmount(this.__stack, isArray(handlers) ? handlers : arguments);
    return this;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/layers_browser/src/Router.js */

var isFunction = require(19),
    isObject = require(33),
    isString = require(21),
    indexOf = require(61),
    arrayForEach = require(112),
    fastSlice = require(191),
    urls = require(193),
    HttpError = require(261),

    cleanPath = require(254),
    Data = require(262),
    Route = require(250),
    Layer = require(249);


var LayerPrototype = Layer.prototype,
    RouterPrototype;


module.exports = Router;


function Router(path, parent) {
    Layer.call(this, path, parent, false);
}
Layer.extend(Router);
RouterPrototype = Router.prototype;

Router.create = function(path, parent) {
    return new Router(path, parent);
};

RouterPrototype.__isRouter__ = true;

RouterPrototype.construct = function(path, parent) {

    this.__layers = [];

    this.Route = Route;
    this.Middleware = Route;
    this.Scope = Router;

    LayerPrototype.construct.call(this, path, parent, false);

    return this;
};

RouterPrototype.destructor = function() {

    LayerPrototype.destructor.call(this);

    this.__layers = null;

    this.Route = null;
    this.Middleware = null;
    this.Scope = null;

    return this;
};

RouterPrototype.enqueue = function(queue, parentData, pathname) {
    var layers = this.__layers,
        i = -1,
        il = layers.length - 1,
        layer, params, data;

    while (i++ < il) {
        layer = layers[i];

        if ((params = layer.match(pathname))) {
            data = new Data(layer, params);

            if (layer.__isRouter__) {
                data.router = layer;
                layer.enqueue(queue, data, pathname);
            } else {
                if (layer.__isMiddleware__) {
                    data.middleware = layer;
                } else {
                    data.route = layer;
                }
                layer.enqueue(queue, data, pathname);
            }
        }
    }
};

function Router_final(_this, ctx, error, callback) {
    if (ctx.forceEnd && !error) {
        if (isFunction(callback)) {
            callback(undefined, ctx);
        }
        _this.emit("end", undefined, ctx);
    } else {
        error = error || new HttpError(404);
        ctx.statusCode = error.statusCode || error.status || error.code || 500;

        if (isFunction(callback)) {
            callback(error, ctx);
        } else {
            console.error(error);
        }
        _this.emit("end", error, ctx);
    }
}

function end() {
    this.forceEnd = true;
    return this;
}

RouterPrototype.handler = function(ctx, callback) {
    var _this = this,
        queue = [],
        pathname = ctx.pathname || (ctx.pathname = urls.parse(ctx.url).pathname),
        index = 0,
        queueLength;

    ctx.end = end;
    ctx.forceEnd = false;

    this.enqueue(queue, null, pathname);
    queueLength = queue.length;

    (function next(error) {
        var layer, fn, data, length;

        if (ctx.forceEnd || index >= queueLength) {
            Router_final(_this, ctx, error, callback);
        } else {
            layer = queue[index++];
            fn = layer.fn;
            length = fn.length;
            data = layer.data;

            ctx.params = data.params;
            ctx.layer = data.layer;
            ctx.middleware = data.middleware;
            ctx.route = data.route;
            ctx.next = next;

            try {
                if (length >= 3) {
                    fn(error, ctx, next);
                } else {
                    if (!error) {
                        fn(ctx, next);
                    } else {
                        next(error);
                    }
                }
            } catch (e) {
                next(e);
            }
        }
    }());
};

RouterPrototype.find = function(path, type) {
    var layers = this.__layers,
        i = layers.length,
        layer;

    type = type || "route";
    path = cleanPath(path);

    while (i--) {
        layer = layers[i];

        if (!layer || path.indexOf(layer.__path) === -1) {
            continue;
        } else if (type === "middleware" && layer.__isMiddleware__) {
            return layer;
        } else if (type === "route" && layer.__isRoute__) {
            return layer;
        } else if (layer.__isRouter__) {
            if (type === "scope" || type === "router") {
                return layer;
            } else {
                return layer.find(path, type);
            }
        }
    }

    return undefined;
};

RouterPrototype.setPath = function(path) {
    var layers = this.__layers,
        i = -1,
        il = layers.length - 1;

    LayerPrototype.setPath.call(this, path);

    while (i++ < il) {
        layers[i].recompile();
    }

    return this;
};

RouterPrototype.unmount = function(path, type) {
    var layer = this.find(path, type || (type = "route")),
        scope, layers, index;

    if (layer) {
        scope = layer.parent || this;
        layers = scope.layers;

        if ((index = indexOf(layers, layer))) {
            layers.splice(index, 1);
        }
    } else {
        throw new Error("Router.unmount(path[, type]) no layer found with type " + type + " at path " + path);
    }

    return this;
};

RouterPrototype.use = function(path) {
    var _this = this,
        layers = this.__layers,
        middleware, middlewareStack, stack;

    if (isString(path)) {
        stack = fastSlice(arguments, 1);
    } else {
        stack = fastSlice(arguments);
        path = "/";
    }

    middlewareStack = [];

    arrayForEach(stack, function(handler) {
        var mw;

        if (isFunction(handler)) {
            middlewareStack[middlewareStack.length] = handler;
        } else if (handler.__isRouter__) {
            _this.scope(handler);
        } else if (isObject(handler)) {
            if (isFunction(handler.middleware)) {
                mw = handler.middleware;

                if (mw.length >= 3) {
                    middlewareStack[middlewareStack.length] = function(err, ctx, next) {
                        handler.middleware(err, ctx, next);
                    };
                } else {
                    middlewareStack[middlewareStack.length] = function(ctx, next) {
                        handler.middleware(ctx, next);
                    };
                }
            } else {
                throw new Error("use(handlers...) handler middleware must be a function");
            }
        } else {
            throw new Error("use(handlers...) handlers must be functions or objects with a middleware function");
        }
    });

    if (middlewareStack.length !== 0) {
        middleware = new this.Middleware(path, this, false);
        middleware.__isMiddleware__ = true;
        layers[layers.length] = middleware;
        middleware.mount(middlewareStack);
    }

    return this;
};

RouterPrototype.route = function(path) {
    var layers = this.__layers,
        route, stack;

    if (isString(path)) {
        stack = fastSlice(arguments, 1);
    } else {
        stack = fastSlice(arguments);
        path = "/";
    }

    route = new this.Route(path, this, true);
    layers[layers.length] = route;

    if (stack.length !== 0) {
        route.mount(stack);
    }

    return route;
};

RouterPrototype.scope = function(path) {
    var layers = this.__layers,
        router;

    if (path.__isRouter__) {
        router = path;
        path = router.__relativePath;

        router.__parent = this;
        router.setPath(path);

        if (indexOf(this.__layers, router) !== -1) {
            return router;
        }
    } else {
        path = cleanPath(path);
    }

    if (!router) {
        router = new this.Scope(path, this);
        router.Route = this.Route;
        router.Middleware = this.Middleware;
        router.Scope = this.Scope;
    }

    layers[layers.length] = router;

    return router;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/layers_browser/src/utils/filterParams.js */

var parseURIComponent = require(257),
    isNullOrUndefined = require(23);


module.exports = filterParams;


function filterParams(regexp, params, path) {
    var ctxults = regexp.exec(path),
        filteredParams, ctxult, i, il, length;

    if (!ctxults) {
        return false;
    } else {
        filteredParams = {};

        il = params.length;
        if (il === 0) {
            return filteredParams;
        }

        i = -1;
        il = il - 1;
        length = ctxults.length;

        while (i++ < il) {
            if (i < length) {
                ctxult = ctxults[i + 1];

                if (!isNullOrUndefined(ctxult)) {
                    filteredParams[params[i].name] = parseURIComponent(ctxult);
                }
            }
        }

        return filteredParams;
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/path_to_regexp/src/index.js */

var isArray = require(20),
    isBoolean = require(256);


var rePartsMatcher = /\.\w+|\.\:\w+|\/+\w+|\/\:\w+(\[.+?\])?|\:\w+(\[.+?\])?|\(.+?\)/g,
    rePartMatcher = /\:?\w+|\[.+?\]/g,
    rePartReplacer = /[\(\)]|\[.+?\]/g;


module.exports = pathToRegExp;


function pathToRegExp(path, params, end) {
    var parts = (path + "").match(rePartsMatcher) || [],
        i = -1,
        length = parts.length - 1,
        pattern, part, subParts, subRegexp, regexp;

    if (isArray(params)) {
        end = !!end;
        params.length = 0;
    } else if (isBoolean(params)) {
        end = params;
        params = [];
    } else {
        end = false;
        params = [];
    }

    pattern = "^";

    while (i++ < length) {
        part = parts[i];

        if (part.length !== 0) {
            if (part[0] === "(") {
                if (part[1] === "/" || part[1] === ".") {
                    pattern += "(?:\\" + part[1];
                }
                subParts = part.match(rePartMatcher);
                part = subParts[0];

                if (part[0] === ":") {
                    subRegexp = subParts[1] || "[a-zA-Z0-9-_]";
                    pattern += "(" + subRegexp + "+?)";
                    params[params.length] = new Param(part.slice(1), subRegexp, false);
                } else {
                    pattern += part;
                }

                pattern += ")?";
            } else {
                if (part[0] === "/" || part[0] === ".") {
                    pattern += "\\" + part[0] + "+";
                }
                subParts = part.match(rePartMatcher);
                part = subParts[0];

                if (part[0] === ":") {
                    subRegexp = subParts[1] || "[a-zA-Z0-9-_]";
                    pattern += "(" + subRegexp + "+)";
                    params[params.length] = new Param(part.slice(1), subRegexp, true);
                } else {
                    pattern += part;
                }
            }
        }
    }

    if (end === true) {
        pattern += "\\/?$";
    } else {
        pattern += "(?=\\/|$)";
    }

    regexp = new RegExp(pattern, "i");
    regexp.params = params;

    return regexp;
}

pathToRegExp.format = function(path) {
    var parts = path.match(rePartsMatcher) || [],
        i = -1,
        length = parts.length - 1,
        fmt = "",
        part, optional;

    while (i++ < length) {
        part = parts[i];

        if (part) {
            optional = false;
            if (part[0] === "(") {
                optional = true;
            }

            part = part.replace(rePartReplacer, "");

            if (part[1] === ":") {
                fmt += (optional ? "" : part[0]) + "%s";
            } else {
                fmt += part;
            }
        }
    }

    return fmt || "/";
};

pathToRegExp.Param = Param;

function Param(name, regexp, required) {
    this.name = name;
    this.regexp = regexp;
    this.required = required;
}

Param.prototype.toJSON = function(json) {
    json = json || {};

    json.name = this.name;
    json.regexp = this.regexp;
    json.required = this.required;

    return json;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/layers_browser/src/utils/cleanPath.js */

var isString = require(21),
    urlPath = require(194);


module.exports = cleanPath;


function cleanPath(path) {
    if (!isString(path) || !path || path === "/") {
        return "/";
    }

    if (path[0] !== "/") {
        path = "/" + path;
    }
    if (path[path.length - 1] === "/") {
        path = path.slice(0, -1);
    }

    return urlPath.normalize(path);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/layers_browser/src/utils/buildPath.js */

var isString = require(21),
    urlPath = require(194);


module.exports = buildPath;


function buildPath(parent, path) {
    if (!isString(path) || !path || (!parent && path === "/")) {
        return "/";
    }

    if (path[0] === "/") {
        path = path.slice(1);
    }
    if (path[path.length - 1] === "/") {
        path = path.slice(0, -1);
    }

    if (parent) {
        path = urlPath.resolve(parent.__path, path);
    } else {
        if (path[0] !== "/") {
            path = "/" + path;
        }
    }

    return urlPath.normalize(path);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/is_boolean/src/index.js */

module.exports = isBoolean;


function isBoolean(value) {
    return typeof(value) === "boolean" || false;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/layers_browser/src/utils/parseURIComponent.js */

module.exports = parseURIComponent;


function parseURIComponent(value) {
    var num;
    value = decodeURIComponent(value);
    num = +value;
    return num !== num ? value : num;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/layers_browser/src/utils/mount.js */

var isObject = require(33),
    isFunction = require(19),
    arrayForEach = require(112);


module.exports = mount;


function mount(stack, handlers) {
    arrayForEach(handlers, function(handler) {
        var mw;

        if (isFunction(handler)) {
            stack[stack.length] = handler;
        } else if (isObject(handler)) {
            if (isFunction(handler.middleware)) {
                mw = handler.middleware;

                if (mw.length >= 3) {
                    stack[stack.length] = function(err, ctx, next) {
                        handler.middleware(err, ctx, next);
                    };
                } else if (mw.length <= 2) {
                    stack[stack.length] = function(ctx, next) {
                        handler.middleware(ctx, next);
                    };
                } else {
                    throw new Error("handler middleware invalid arguments, handler([err ,]ctx, next");
                }
            } else {
                throw new Error("handler.middleware must be a function");
            }
        } else {
            throw new Error("handlers must be functions or objects with a middleware function");
        }
    });
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/layers_browser/src/utils/unmount.js */

var isObject = require(33),
    isFunction = require(19),
    indexOf = require(61),
    arrayForEach = require(112);


module.exports = unmount;


function unmount(stack, handlers) {
    arrayForEach(handlers, function(handler) {
        var value = null,
            index;

        if (isFunction(handler)) {
            value = handler;
        } else if (isObject(handler)) {
            if (isFunction(handler.middleware)) {
                value = handler.middleware;
            } else {
                throw new Error("unmount(handlers[, ...]) handlers must be functions or objects with a middleware function");
            }
        }

        if ((index = indexOf(stack, value)) === -1) {
            throw new Error("unmount(handlers[, ...]) stack does not contain handler");
        }

        stack.splice(index, 1);
    });
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/layers_browser/src/LayerData.js */

module.exports = LayerData;


function LayerData(fn, data) {
    this.fn = fn;
    this.data = data;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/http_error/src/index.js */

var objectForEach = require(113),
    inherits = require(68),
    STATUS_CODES = require(263);


var STATUS_NAMES = {},
    STATUS_STRINGS = {},
    HttpErrorPrototype;


module.exports = HttpError;


objectForEach(STATUS_CODES, function eachStatus(status, statusCode) {
    var name;

    if (statusCode < 400) {
        return;
    }

    name = status.replace(/\s+/g, "");

    if (!(/\w+Error$/.test(name))) {
        name += "Error";
    }

    STATUS_NAMES[statusCode] = name;
    STATUS_STRINGS[statusCode] = status;
});


function HttpError(statusCode, message, fileName, lineNumber) {
    if (message instanceof Error) {
        message = message.message;
    }

    if (statusCode instanceof Error) {
        message = statusCode.message;
        statusCode = 500;
    } else if (typeof(statusCode) === "string") {
        message = statusCode;
        statusCode = 500;
    } else {
        statusCode = statusCode || 500;
    }

    Error.call(this, message, fileName, lineNumber);

    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
    }

    this.name = STATUS_NAMES[statusCode] || "UnknownHttpError";
    this.statusCode = statusCode;
    this.message = this.name + ": " + statusCode + " " + (message || STATUS_STRINGS[statusCode]);
}
inherits(HttpError, Error);
HttpErrorPrototype = HttpError.prototype;

HttpErrorPrototype.toString = function() {
    return this.message;
};

HttpErrorPrototype.toJSON = function(json) {
    json = json || {};

    json.name = this.name;
    json.statusCode = this.statusCode;
    json.message = this.message;

    return json;
};

HttpErrorPrototype.fromJSON = function(json) {

    this.name = json.name;
    this.statusCode = json.statusCode;
    this.message = json.message;

    return this;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/layers_browser/src/Data.js */

module.exports = Data;


function Data(layer, params) {
    this.layer = layer;
    this.params = params;
    this.middleware = null;
    this.route = null;
    this.router = null;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/status_codes/src/browser.js */

module.exports = {
    100: "Continue",
    101: "Switching Protocols",
    102: "Processing",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    208: "Already Reported",
    226: "IM Used",
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I\"m a teapot",
    421: "Misdirected Request",
    422: "Unprocessable Entity",
    423: "Locked",
    424: "Failed Dependency",
    425: "Unordered Collection",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    509: "Bandwidth Limit Exceeded",
    510: "Not Extended",
    511: "Network Authentication Required"
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/cookies/src/index.js */

var isString = require(21),
    isNumber = require(24),
    isDate = require(266),
    isObject = require(33),
    environment = require(3);


var cookies = exports,
    document = environment.document,
    reReplacer = /[\-\.\+\*]/g,
    reKeys = /((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g,
    reValues = /\s*(?:\=[^;]*)?;\s*/,
    reSet = /^(?:expires|max\-age|path|domain|secure)$/i;


function parseJSON(value) {
    try {
        value = JSON.parse(value);
    } catch (e) {}

    return value;
}

if (!isString(document.cookie)) {
    document.cookie = "";
}


cookies.get = function(key) {
    var value;

    if (!key) {
        return null;
    }

    value = (
        decodeURIComponent(
            document.cookie.replace(
                new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(key).replace(reReplacer, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1"
            )
        ) || null
    );

    return value != null && value !== "undefined" && value !== "null" ? parseJSON(value) : null;
};

cookies.set = function(key, value, end, path, domain, secure) {
    var expires;

    if (!key || reSet.test(key)) {
        return false;
    }

    expires = "";

    if (isNumber(end)) {
        expires = end === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + end;
    } else if (isString(end)) {
        expires = "; expires=" + end;
    } else if (isDate(end)) {
        expires = "; expires=" + end.toUTCString();
    }

    if (isObject(value)) {
        value = JSON.stringify(value);
    } else {
        value = value + "";
    }

    document.cookie = encodeURIComponent(key) + "=" + (
        encodeURIComponent(value) +
        expires +
        (domain ? "; domain=" + domain : "") +
        (path ? "; path=" + sPath : "") +
        (secure ? "; secure" : "")
    );

    return true;
};

cookies.has = function(key) {
    if (!key) {
        return false;
    }
    return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(key).replace(reReplacer, "\\$&") + "\\s*\\=")).test(document.cookie);

};

cookies.keys = function() {
    var keys = document.cookie.replace(reKeys, "").split(reValues),
        length = keys.length - 1,
        i = -1;

    while (i++ < length) {
        keys[i] = decodeURIComponent(keys[i]);
    }

    return keys;
};

cookies.remove = function(key, path, domain) {
    if (!cookies.has(key)) {
        return false;
    }
    document.cookie = encodeURIComponent(key) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (
        (domain ? "; domain=" + domain : "") + (path ? "; path=" + path : "")
    );
    return true;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/stores/Store.js */

var keyMirror = require(59),
    dispatcher = require(183),
    EventEmitter = require(178);


var EVENT_CHANGE = "change";


module.exports = Store;


function Store() {

    EventEmitter.call(this, -1);

    this.consts = null;
}
EventEmitter.extend(Store);

Store.prototype.setConsts = function(object) {
    return (this.consts = keyMirror(object));
};

Store.prototype.emitChange = function() {
    this.emit(EVENT_CHANGE);
};

Store.prototype.addChangeListener = function(callback) {
    this.on(EVENT_CHANGE, callback);
};

Store.prototype.removeChangeListener = function(callback) {
    this.off(EVENT_CHANGE, callback);
};

Store.prototype.register = function(callback) {
    dispatcher.register(callback);
    return this;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/is_date/src/index.js */

var isObject = require(33);


var objectToString = Object.prototype.toString;


module.exports = isDate;


function isDate(value) {
    return (
        isObject(value) &&
        objectToString.call(value) === "[object Date]"
    ) || false;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/theme.js */

var Theme = require(268),
    css = require(207);


var BomontFlooringThemePrototype;


module.exports = BomontFlooringTheme;


function BomontFlooringTheme() {

    Theme.call(this);

    this.fontFamily = "Roboto, sans-serif";
}
Theme.extend(BomontFlooringTheme, "BomontFlooringTheme");
BomontFlooringThemePrototype = BomontFlooringTheme.prototype;

BomontFlooringThemePrototype.getSpacing = function() {
    return {
        iconSize: 24,
        desktopGutter: 24,
        desktopGutterMore: 32,
        desktopGutterLess: 16,
        desktopGutterMini: 8,
        desktopKeylineIncrement: 64,
        desktopDropDownMenuItemHeight: 32,
        desktopDropDownMenuFontSize: 15,
        desktopLeftNavMenuItemHeight: 48,
        desktopSubheaderHeight: 48,
        desktopToolbarHeight: 56
    };
};

BomontFlooringThemePrototype.getPalette = function() {
    return {
        primary1Color: "#ff002d",
        primary2Color: "#dedede",
        accent1Color: "#363636",
        accent2Color: "#2a2a2a",
        textColor: "rgba(0, 0, 0, 0.87)",
        canvasColor: css.colors.white,
        borderColor: "#dedede",
        disabledColor: "rgba(0, 0, 0, 0.262)"
    };
};

BomontFlooringThemePrototype.getStyles = function(palette /*, spacing */ ) {
    var styles = {
        link: {
            color: palette.canvasColor,
            hoverColor: palette.primary1Color,
            focusColor: palette.primary1Color,
            downColor: palette.primary1Color
        },
        boxShadow: "1px 2px 8px 0px " + palette.disabledColor
    };
    return styles;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/theme/src/index.js */

var extend = require(27),
    inherits = require(68);


var ThemePrototype;


module.exports = Theme;


function Theme() {
    this.fontFamily = "Arial, Helvetica, sans-serif";
    this.spacing = this.getSpacing();
    this.palette = this.getPalette();
    this.styles = this.getStyles(this.palette, this.spacing);
}
ThemePrototype = Theme.prototype;

Theme.extend = function extend(child, displayName) {
    inherits(child, this);
    child.prototype.displayName = displayName || "Theme";
    child.extend = extend;
    return child;
};

ThemePrototype.displayName = "Theme";

ThemePrototype.setSpacing = function(newSpacing) {
    extend(this.spacing, newSpacing);
    extend(this.styles, this.getStyles(this.palette, this.spacing));
    return this;
};

ThemePrototype.getSpacing = function() {
    return {};
};

ThemePrototype.setPalette = function(newPalette) {
    extend(this.palette, newPalette);
    extend(this.styles, this.getStyles(this.palette, this.spacing));
    return this;
};

ThemePrototype.getPalette = function() {
    return {};
};

ThemePrototype.setStyle = function(styles) {
    extend(this.styles, styles);
    return this;
};

ThemePrototype.getStyles = function( /* palette, spacing */ ) {
    return {};
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/views/about_us.js */

var virt = require(1),
    app = require(5),
    AboutUs = require(277),
    LayoutApp = require(278);


app.registerPage("about_us", function renderAboutUsPage(ctx) {
    return (
        virt.createView(LayoutApp, {
            ctx: ctx,
            i18n: app.i18n,
            render: function render() {
                return virt.createView(AboutUs);
            }
        })
    );
});


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/views/contact_us.js */

var virt = require(1),
    app = require(5),
    ContactUs = require(284),
    LayoutApp = require(278);


app.registerPage("contact_us", function renderContactUsPage(ctx) {
    return (
        virt.createView(LayoutApp, {
            ctx: ctx,
            i18n: app.i18n,
            render: function render() {
                return virt.createView(ContactUs);
            }
        })
    );
});


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/views/home.js */

var virt = require(1),
    app = require(5),
    Home = require(285),
    LayoutApp = require(278);


app.registerPage("home", function renderHomePage(ctx) {
    return (
        virt.createView(LayoutApp, {
            ctx: ctx,
            i18n: app.i18n,
            render: function render() {
                return virt.createView(Home);
            }
        })
    );
});


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/views/services.js */

var virt = require(1),
    app = require(5),
    Services = require(286),
    LayoutApp = require(278);


app.registerPage("services", function renderServicesPage(ctx) {
    return (
        virt.createView(LayoutApp, {
            ctx: ctx,
            i18n: app.i18n,
            render: function render() {
                return virt.createView(Services);
            }
        })
    );
});


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/views/testimonials.js */

var virt = require(1),
    app = require(5),
    Testimonials = require(287),
    LayoutApp = require(278);


app.registerPage("testimonials", function renderTestimonialsPage(ctx) {
    return (
        virt.createView(LayoutApp, {
            ctx: ctx,
            i18n: app.i18n,
            render: function render() {
                return virt.createView(Testimonials);
            }
        })
    );
});


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/views/residential_gallery.js */

var virt = require(1),
    app = require(5),
    ResidentialGallery = require(291),
    LayoutApp = require(278);


app.registerPage("residential_gallery", function renderResidentialGalleryPage(ctx) {
    return (
        virt.createView(LayoutApp, {
            ctx: ctx,
            i18n: app.i18n,
            render: function render() {
                return virt.createView(ResidentialGallery);
            }
        })
    );
});


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/views/residential_gallery-viewer.js */

var virt = require(1),
    virtModal = require(180),
    Modal = require(299),
    ImageView = require(300),
    app = require(5);


app.registerModal(
    "residential_gallery-viewer",
    function renderResidentialGalleryImageViewModal(modal, ctx) {
        return (
            virt.createView(Modal, {
                ctx: ctx,
                i18n: app.i18n,
                modal: modal,
                render: function render() {
                    return virt.createView(ImageView, {
                        modal: modal,
                        id: ctx.params.id
                    });
                }
            })
        );
    },
    function onCloseResidentialGalleryImageView(modal /*, ctx */ ) {
        app.dispatcher.handleViewAction({
            actionType: virtModal.ModalStore.consts.MODAL_CLOSE,
            id: modal.id
        });
        app.page.go("/residential_gallery");
    }
);


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/views/not_found.js */

var virt = require(1),
    app = require(5),
    LayoutApp = require(278);


app.registerPage("not_found", function renderNotFoundPage(ctx) {
    return (
        virt.createView(LayoutApp, {
            ctx: ctx,
            i18n: app.i18n,
            render: function() {
                return (
                    virt.createView("div", {
                            className: "wrap"
                        },
                        virt.createView("div", {
                                className: "page not-found"
                            },
                            virt.createView("h1", app.i18n("errors.not_found"))
                        )
                    )
                );
            }
        })
    );
});


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/components/AboutUs.js */

var virt = require(1),
    css = require(207),
    propTypes = require(208),
    Link = require(279);


var AboutUsPrototype;


module.exports = AboutUs;


function AboutUs(props, children, context) {
    virt.Component.call(this, props, children, context);
}
virt.Component.extend(AboutUs, "AboutUs");

AboutUsPrototype = AboutUs.prototype;

AboutUs.contextTypes = {
    i18n: propTypes.func.isRequired,
    theme: propTypes.object.isRequired,
    size: propTypes.object.isRequired
};

AboutUsPrototype.getStyles = function() {
    var context = this.context,
        size = context.size,
        theme = context.theme,
        styles = {
            root: {
                padding: "48px 0",
                background: theme.palette.primary2Color
            },
            imgHeader: {
                position: "relative"
            },
            over: {
                textAlign: "center",
                position: "absolute",
                height: "100%",
                width: "100%"
            },
            imgOver: {
                paddingTop: "5%"
            },
            img: {
                minHeight: "96px",
                width: "100%"
            },
            milestoneloans: {
                width: "100%"
            },
            header: {
                textTransform: "uppercase",
                zIndex: "1000",
                background: theme.palette.primary1Color,
                color: theme.palette.canvasColor,
                position: "absolute",
                padding: "4px 64px 4px 48px",
                minWidth: "256px",
                margin: "0",
                left: "-16px"
            },
            body: {
                zIndex: "999",
                position: "relative",
                fontSize: "1.175em",
                background: theme.palette.canvasColor,
                margin: "0 32px",
                padding: "32px"
            },
            bodyImgWrap0: {
                "float": "left",
                padding: "24px 22px 22px 0"
            },
            bodyImg0: {
                zIndex: "1001",
                border: "3px solid " + theme.palette.canvasColor
            },
            bodyImgWrap1: {
                "float": "right",
                padding: "24px 0 22px 22px"
            },
            bodyImg1: {
                zIndex: "1001",
                border: "3px solid " + theme.palette.canvasColor
            },
            text0: {
                paddingTop: "48px",
                marginBottom: "0"
            },
            text1: {
                marginTop: "0"
            },
            text2: {
                marginTop: "24px",
                marginBottom: "0"
            },
            text3: {
                marginTop: "0"
            },
            clear: {
                clear: "both"
            }
        };

    css.boxShadow(styles.header, theme.styles.boxShadow);

    css.boxShadow(styles.bodyImg0, theme.styles.boxShadow);
    css.transform(styles.bodyImg0, "rotate(-6deg)");

    css.boxShadow(styles.bodyImg1, theme.styles.boxShadow);
    css.transform(styles.bodyImg1, "rotate(6deg)");

    if (size.width < 480) {
        styles.bodyImgWrap0["float"] = "none";
        styles.bodyImgWrap1["float"] = "none";
    }

    return styles;
};

AboutUsPrototype.render = function() {
    var i18n = this.context.i18n,
        styles = this.getStyles();

    return (
        virt.createView("div", {
                className: "AboutUs",
                style: styles.root
            },
            virt.createView("div", {
                    style: styles.imgHeader
                },
                virt.createView("div", {
                        style: styles.over,
                        src: "img/floor_covering.png"
                    },
                    virt.createView("img", {
                        style: styles.imgOver,
                        src: "img/floor_covering.png"
                    })
                ),
                virt.createView("img", {
                    style: styles.img,
                    src: "img/fourfloors.jpg"
                })
            ),
            virt.createView("div", {
                    style: styles.body
                },
                virt.createView("h3", {
                        style: styles.header
                    },
                    i18n("about_us.header")
                ),
                virt.createView("p", {
                    style: styles.text0
                }, i18n("about_us.body0")),
                virt.createView("div", {
                        style: styles.bodyImgWrap0
                    },
                    virt.createView("img", {
                        style: styles.bodyImg0,
                        src: "img/dining.jpg"
                    })
                ),
                virt.createView("p", {
                    style: styles.text1
                }, i18n("about_us.body1")),
                virt.createView("div", {
                    style: styles.clear
                }),
                virt.createView("p", {
                    style: styles.text2
                }, i18n("about_us.body2")),
                virt.createView("div", {
                        style: styles.bodyImgWrap1
                    },
                    virt.createView("img", {
                        style: styles.bodyImg1,
                        src: "img/room.jpg"
                    })
                ),
                virt.createView("p", {
                    style: styles.text3
                }, i18n("about_us.body3")),
                virt.createView("div", {
                    style: styles.clear
                })
            ),
            virt.createView(Link, {
                    style: styles.milestoneloans,
                    target: "_blank",
                    href: "http://milestoneloans.net",
                    src: "img/fourfloors.jpg"
                },
                virt.createView("img", {
                    style: styles.milestoneloans,
                    src: "img/milestoneloans.jpg"
                })
            ),
            virt.createView("img", {
                style: styles.img,
                src: "img/fourfloors.jpg"
            })
        )
    );
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/components/layouts/LayoutApp.js */

var virt = require(1),
    css = require(207),
    virtModal = require(180),
    propTypes = require(208),
    app = require(5),
    Header = require(280),
    Footer = require(281);


var LayoutAppPrototype;


module.exports = LayoutApp;


function LayoutApp(props, children, context) {
    virt.Component.call(this, props, children, context);
}
virt.Component.extend(LayoutApp, "LayoutApp");
LayoutAppPrototype = LayoutApp.prototype;

LayoutApp.propTypes = {
    ctx: propTypes.object.isRequired,
    i18n: propTypes.func.isRequired,
    render: propTypes.func.isRequired
};

LayoutApp.contextTypes = {
    theme: propTypes.object.isRequired
};

LayoutApp.childContextTypes = {
    ctx: propTypes.object.isRequired,
    i18n: propTypes.func.isRequired
};

LayoutAppPrototype.getChildContext = function() {
    return {
        ctx: this.props.ctx,
        i18n: this.props.i18n
    };
};

LayoutAppPrototype.getStyles = function() {
    var theme = this.context.theme,
        styles = {
            background: {
                background: theme.palette.canvasColor
            },
            content: {
                margin: "0 auto",
                maxWidth: "768px"
            }
        };

    css.boxShadow(styles.content, "0px -8px 32px 0px " + theme.palette.accent1Color);

    return styles;
};

LayoutAppPrototype.render = function() {
    var styles = this.getStyles();

    return (
        virt.createView("div", {
                className: "Layout",
                style: styles.background
            },
            virt.createView("div", {
                    style: styles.content
                },
                virt.createView(Header),
                this.props.render(this.props.ctx),
                virt.createView(Footer),
                virt.createView(virtModal.Modals, {
                    modals: app.getModals(this.props.ctx)
                })
            )
        )
    );
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/components/Link.js */

var virt = require(1),
    css = require(207),
    propTypes = require(208),
    extend = require(27);


var LinkPrototype;


module.exports = Link;


function Link(props, children, context) {
    var _this = this;

    virt.Component.call(this, props, children, context);

    this.state = {
        focus: false,
        hover: false,
        down: false
    };

    this.onMouseOver = function(e) {
        return _this.__onMouseOver(e);
    };
    this.onMouseOut = function(e) {
        return _this.__onMouseOut(e);
    };
    this.onMouseDown = function(e) {
        return _this.__onMouseDown(e);
    };
    this.onMouseUp = function(e) {
        return _this.__onMouseUp(e);
    };
    this.onFocus = function(e) {
        return _this.__onFocus(e);
    };
    this.onBlur = function(e) {
        return _this.__onBlur(e);
    };
}
virt.Component.extend(Link, "Link");

LinkPrototype = Link.prototype;

Link.contextTypes = {
    theme: propTypes.object.isRequired
};

LinkPrototype.__onMouseOver = function(e) {
    if (this.props.onMouseOver) {
        this.props.onMouseOver(e);
    }

    this.setState({
        hover: true
    });
};

LinkPrototype.__onMouseOut = function(e) {
    if (this.props.onMouseOut) {
        this.props.onMouseOut(e);
    }

    this.setState({
        hover: false,
        down: false
    });
};

LinkPrototype.__onMouseDown = function(e) {
    if (this.props.onMouseDown) {
        this.props.onMouseDown(e);
    }

    this.setState({
        down: true
    });
};

LinkPrototype.__onMouseUp = function(e) {
    if (this.props.onMouseUp) {
        this.props.onMouseUp(e);
    }

    this.setState({
        down: false
    });
};

LinkPrototype.__onFocus = function(e) {
    if (this.props.onFocus) {
        this.props.onFocus(e);
    }

    this.setState({
        focus: true
    });
};

LinkPrototype.__onBlur = function(e) {
    if (this.props.onBlur) {
        this.props.onBlur(e);
    }

    this.setState({
        focus: false
    });
};

LinkPrototype.getStyle = function() {
    var props = this.props,
        theme = this.context.theme.styles.link,
        state = this.state,
        styles = {
            color: props.color || theme.color,
            textDecoration: "none"
        };

    if (state.hover) {
        styles.color = props.hoverColor || theme.hoverColor || theme.color;
        if (props.hoverOpacity) {
            css.opacity(styles, props.hoverOpacity);
        }
    }
    if (state.focus) {
        styles.color = props.focusColor || theme.focusColor || theme.color;
    }
    if (state.down) {
        styles.color = props.downColor || theme.downColor || theme.color;
    }
    if (props.active) {
        styles.color = props.activeColor || theme.activeColor || theme.color;
    }

    return styles;
};

LinkPrototype.render = function() {
    var props = extend({}, this.props);

    props.className = "Link";
    props.style = extend(this.getStyle(), props.style);
    props.onMouseOver = this.onMouseOver;
    props.onMouseOut = this.onMouseOut;
    props.onMouseDown = this.onMouseDown;
    props.onMouseUp = this.onMouseUp;
    props.onFocus = this.onFocus;
    props.onBlur = this.onBlur;

    if (this.state.hover) {
        if (props.hoverBackgroundColor) {
            props.style.background = props.hoverBackgroundColor;
        }
    }

    return virt.createView("a", props, this.children);
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/components/Header/index.js */

var virt = require(1),
    propTypes = require(208),
    HeaderNav = require(282);


var HeaderPrototype;


module.exports = Header;


function Header(props, children, context) {
    virt.Component.call(this, props, children, context);
}
virt.Component.extend(Header, "Header");

Header.contextTypes = {
    i18n: propTypes.func.isRequired,
    theme: propTypes.object.isRequired,
    size: propTypes.object.isRequired
};

HeaderPrototype = Header.prototype;

HeaderPrototype.getStyles = function() {
    var context = this.context,
        theme = context.theme,
        size = context.size,
        styles = {
            top: {
                color: theme.palette.primary2Color,
                padding: "16px"
            },
            headerRight: {
                textAlign: size.width < 768 ? "center" : "right"
            },
            headerLeft: {
                textAlign: size.width < 768 ? "center" : "left"
            },
            dot: {
                textAlign: "center"
            },
            logo: {
                padding: "16px 0",
                textAlign: "center"
            },
            nav: {

            },
            ul: {
                textAlign: "center"
            },
            link: {
                fontSize: "2em",
                display: "inline-block",
                margin: "0 4px",
                padding: "12px 20px"
            },
            linkA: {
                color: theme.palette.accent2Color
            }
        };

    if (size.width > 768) {
        styles.top.paddingBottom = "16px";
        styles.logo.padding = "32px 0";
    }

    return styles;
};

HeaderPrototype.render = function() {
    var i18n = this.context.i18n,
        styles = this.getStyles();

    return (
        virt.createView("div", {
                className: "Header"
            },
            virt.createView("div", {
                    style: styles.top
                },
                virt.createView("div", {
                        className: "grid"
                    },
                    virt.createView("h2", {
                        className: "col-xs-12 col-sm-12 col-md-6 col-lg-6",
                        style: styles.headerLeft
                    }, i18n("header.commercial")),
                    virt.createView("h2", {
                        className: "hidden-max-sm col-md-1 col-lg-1"
                    }, "·"),
                    virt.createView("h2", {
                        className: "col-xs-12 col-sm-12 col-md-5 col-lg-5",
                        style: styles.headerRight
                    }, i18n("header.licensed"))
                )
            ),
            virt.createView("div", {
                    style: styles.logo
                },
                virt.createView("img", {
                    src: "img/logo.png"
                })
            ),
            virt.createView(HeaderNav)
        )
    );
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/components/Footer.js */

var virt = require(1),
    propTypes = require(208),
    arrayMap = require(39),
    extend = require(27),
    Link = require(279),
    links = require(283);


var FooterPrototype,
    ICON_LINKS = [{
        id: "facebook",
        src: "img/icon-facebook.png",
        href: "https://www.facebook.com/bomontflooring"
    }];


module.exports = Footer;


function Footer(props, children, context) {
    virt.Component.call(this, props, children, context);
}
virt.Component.extend(Footer, "Footer");

Footer.contextTypes = {
    i18n: propTypes.func.isRequired,
    ctx: propTypes.object.isRequired,
    theme: propTypes.object.isRequired,
    size: propTypes.object.isRequired
};

FooterPrototype = Footer.prototype;

FooterPrototype.getStyles = function() {
    var context = this.context,
        theme = context.theme,
        size = context.size,
        styles = {
            footerTop: {
                padding: "16px 64px",
                color: theme.palette.canvasColor,
                background: theme.palette.accent1Color
            },
            topLeft: {
                textAlign: "center"
            },
            footerLogo: {
                paddingTop: "24px"
            },
            address: {
                width: size.width < 768 ? "inherit" : "180px",
                textAlign: size.width < 768 ? "center" : "left"
            },
            phone: {
                marginTop: size.width < 768 ? "0" : "1.66em",
                textAlign: size.width < 768 ? "center" : "right"
            },
            footerBottom: {
                padding: "16px 64px",
                color: theme.palette.canvasColor,
                background: theme.palette.accent2Color
            },
            copyright: {
                textAlign: "left"
            },
            designedby: {
                textAlign: "right"
            },
            ul: {
                marginTop: "24px",
                textAlign: "center"
            },
            li: {
                display: "inline-block",
                marginLeft: "4px",
                marginTop: "4px"
            },
            link: {
                fontSize: "1em",
                fontWeight: "bold",
                background: theme.palette.primary1Color,
                padding: "8px 10px"
            },
            iconLinks: {
                textAlign: "left"
            },
            iconLink: {
                width: "32px",
                height: "32px",
                display: "inline-block"
            }
        };

    if (size.width < 768) {
        styles.copyright.textAlign = "center";
        styles.designedby.textAlign = "center";
        styles.iconLinks.textAlign = "center";
    }

    if (size.width < 640) {
        styles.footerTop.padding = styles.footerBottom.padding = "16px 32px";
    }

    return styles;
};

FooterPrototype.render = function() {
    var context = this.context,
        i18n = context.i18n,
        theme = context.theme,
        pathname = context.ctx.pathname,
        styles = this.getStyles();

    return (
        virt.createView("div", {
                className: "Footer"
            },
            virt.createView("div", {
                    style: styles.footerTop
                },
                virt.createView("div", {
                        className: "grid"
                    },
                    virt.createView("div", {
                            className: "col-xs-12 col-sm-12 col-md-4 col-lg-4",
                            style: styles.topLeft
                        },
                        virt.createView("img", {
                            style: styles.footerLogo,
                            src: "img/logo.png"
                        })
                    ),
                    virt.createView("div", {
                            className: "push-md-1 push-lg-1 col-xs-12 col-sm-12 col-md-7 col-lg-7",
                            style: styles.topRight
                        },
                        virt.createView("div", {
                                className: "grid"
                            },
                            virt.createView("div", {
                                className: "col-xs-12 col-sm-12 col-md-6 col-lg-6"
                            }, virt.createView("h2", {
                                style: styles.address
                            }, i18n("app.address"))),
                            virt.createView("div", {
                                className: "col-xs-12 col-sm-12 col-md-6 col-lg-6"
                            }, virt.createView("h2", {
                                style: styles.phone
                            }, i18n("app.phone")))
                        )
                    )
                ),
                virt.createView("ul", {
                        style: styles.ul
                    },
                    arrayMap(links, function(link, index) {
                        var active = pathname === link.path,
                            overrideStyles = {},
                            style = extend({}, styles.link);

                        if (index === 0) {
                            overrideStyles.marginLeft = "0px";
                        }

                        if (active) {
                            style.color = theme.palette.primary1Color;
                            style.background = theme.palette.canvasColor;
                        }

                        return virt.createView("li", {
                                style: extend({}, styles.li, overrideStyles)
                            },
                            virt.createView(Link, {
                                style: style,
                                active: active,
                                hoverColor: theme.palette.primary1Color,
                                hoverBackgroundColor: theme.palette.canvasColor,
                                href: link.path
                            }, i18n(link.name))
                        );
                    })
                )
            ),
            virt.createView("div", {
                    className: "grid",
                    style: styles.footerBottom
                },
                virt.createView("ul", {
                        className: "col-xs-12 col-sm-12 col-md-12 col-lg-12",
                        style: styles.iconLinks
                    },
                    arrayMap(ICON_LINKS, function(link) {
                        return (
                            virt.createView("li", {
                                    key: link.id,
                                    style: styles.iconLink
                                },
                                virt.createView(Link, {
                                        href: link.href,
                                        target: "_blank",
                                        hoverOpacity: 0.5
                                    },
                                    virt.createView("img", {
                                        src: link.src
                                    })
                                )
                            )
                        );
                    })
                ),
                virt.createView("div", {
                        className: "col-xs-12 col-sm-12 col-md-6 col-lg-6",
                        style: styles.copyright
                    },
                    virt.createView("p", i18n("footer.copyright"))
                ),
                virt.createView("div", {
                        className: "col-xs-12 col-sm-12 col-md-6 col-lg-6",
                        style: styles.designedby
                    },
                    virt.createView("p",
                        virt.createView("span", "© "),
                        virt.createView("span", i18n("footer.designedby")),
                        virt.createView(Link, {
                            target: "_blank",
                            href: "http://www.thinkitdesign.com"
                        }, i18n("footer.thinkit"))
                    )
                )
            )
        )
    );
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/components/Header/HeaderNav.js */

var virt = require(1),
    css = require(207),
    propTypes = require(208),
    arrayMap = require(39),
    extend = require(27),
    Link = require(279),
    links = require(283);


var HeaderNavPrototype;


module.exports = HeaderNav;


function HeaderNav(props, children, context) {
    var _this = this;

    virt.Component.call(this, props, children, context);

    this.state = {
        opened: false
    };

    this.onClickMenu = function(e) {
        return _this.__onClickMenu(e);
    };
}
virt.Component.extend(HeaderNav, "HeaderNav");

HeaderNav.contextTypes = {
    i18n: propTypes.func.isRequired,
    ctx: propTypes.object.isRequired,
    theme: propTypes.object.isRequired,
    size: propTypes.object.isRequired
};

HeaderNavPrototype = HeaderNav.prototype;

HeaderNavPrototype.__onClickMenu = function() {
    this.setState({
        opened: !this.state.opened
    });
};

HeaderNavPrototype.getStyles = function() {
    var context = this.context,
        size = context.size,
        theme = context.theme,
        styles = {
            root: {
                textAlign: "center"
            },
            ul: {
                overflow: "hidden",
                textAlign: "center"
            },
            li: {
                display: "inline-block"
            },
            link: {
                fontSize: "1.25em",
                color: theme.palette.accent2Color,
                padding: "12px 16px"
            },
            menu: {
                padding: "8px 0px 16px",
                display: "none"
            }
        };

    css.transition(styles.ul, "max-height 200ms cubic-bezier(0.445, 0.05, 0.55, 0.95)");

    if (size.width < 640) {
        styles.li.display = "block";

        if (this.state.opened) {
            styles.ul.maxHeight = "1024px";
        } else {
            styles.ul.maxHeight = "0";
        }

        delete styles.menu.display;
    }

    return styles;
};

HeaderNavPrototype.render = function() {
    var context = this.context,
        theme = context.theme,
        pathname = context.ctx.pathname,
        i18n = context.i18n,
        styles = this.getStyles();

    return (
        virt.createView("div", {
                className: "HeaderNav",
                style: styles.root
            },
            virt.createView("ul", {
                    style: styles.ul
                },
                arrayMap(links, function(link) {
                    var active = pathname === link.path,
                        style = extend({}, styles.link);

                    if (active) {
                        style.background = theme.palette.primary2Color;
                    }

                    return virt.createView("li", {
                            style: styles.li
                        },
                        virt.createView(Link, {
                            style: style,
                            active: active,
                            href: link.path
                        }, i18n(link.name))
                    );
                })
            ),
            virt.createView(Link, {
                    style: styles.menu,
                    onClick: this.onClickMenu,
                    hoverOpacity: 0.5
                },
                virt.createView("img", {
                    src: "img/menu.png"
                })
            )
        )
    );
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/utils/links.js */

module.exports = [{
    path: "/",
    name: "nav.home"
}, {
    path: "/about_us",
    name: "nav.about_us"
}, {
    path: "/services",
    name: "nav.services"
}, {
    path: "/contact_us",
    name: "nav.contact_us"
}, {
    path: "/testimonials",
    name: "nav.testimonials"
}, {
    path: "/residential_gallery",
    name: "nav.residential_gallery"
}];


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/components/ContactUs.js */

var virt = require(1),
    css = require(207),
    propTypes = require(208),
    Link = require(279);


var ContactUsPrototype;


module.exports = ContactUs;


function ContactUs(props, children, context) {
    var _this = this;

    virt.Component.call(this, props, children, context);

    this.state = {
        name: "",
        email: "",
        subject: "",
        message: ""
    };

    this.onSubmit = function(e) {
        return _this.__onSubmit(e);
    };

    this.onInput = function(e) {
        return _this.__onInput(e);
    };
}
virt.Component.extend(ContactUs, "ContactUs");

ContactUsPrototype = ContactUs.prototype;

ContactUs.contextTypes = {
    i18n: propTypes.func.isRequired,
    theme: propTypes.object.isRequired
};

ContactUsPrototype.__onInput = function(e) {
    var _this = this,
        componentTarget = e.componentTarget,
        name = componentTarget.props.name;

    componentTarget.getValue(function(error, value) {
        var state;

        if (!error) {
            state = {};
            state[name] = value;
            _this.setState(state);
        }
    });
};

ContactUsPrototype.getStyles = function() {
    var context = this.context,
        theme = context.theme,
        styles = {
            root: {
                padding: "48px 0",
                background: theme.palette.primary2Color
            },
            img: {
                minHeight: "96px",
                width: "100%"
            },
            milestoneloans: {
                width: "100%"
            },
            header: {
                textAlign: "center",
                margin: "0 32px",
                padding: "32px 16px",
                background: theme.palette.canvasColor
            },
            headerImg: {
                width: "100%",
                border: "3px solid " + theme.palette.canvasColor
            },
            formHeader: {
                textTransform: "uppercase",
                zIndex: "1000",
                background: theme.palette.primary1Color,
                color: theme.palette.canvasColor,
                position: "absolute",
                top: "-20px",
                padding: "4px 64px 4px 48px",
                minWidth: "256px",
                margin: "0",
                left: "-16px"
            },
            body: {
                position: "relative",
                margin: "0 32px",
                padding: "32px 16px",
                background: theme.palette.canvasColor
            },
            formLabel: {
                display: "block",
                marginBottom: "4px",
                fontSize: "1.5em",
                fontWeight: "bold"
            },
            formInput: {
                padding: "8px",
                marginBottom: "8px",
                border: "2px solid " + theme.palette.accent2Color
            },
            formTextArea: {
                minHeight: "256px",
                resize: "vertical",
                padding: "8px",
                marginBottom: "32px",
                border: "2px solid " + theme.palette.accent2Color
            },
            formSubmit: {
                display: "block",
                width: "inherit",
                fontWeight: "bold",
                fontSize: "1.17em",
                textTransform: "uppercase",
                background: theme.palette.primary1Color,
                color: theme.palette.canvasColor,
                padding: "4px 16px"
            }
        };

    css.boxShadow(styles.formSubmit, theme.styles.boxShadow);
    css.boxShadow(styles.formHeader, theme.styles.boxShadow);
    css.boxShadow(styles.headerImg, theme.styles.boxShadow);

    css.borderRadius(styles.formSubmit, "0px");
    css.borderRadius(styles.formInput, "0px");
    css.borderRadius(styles.formTextArea, "0px");

    return styles;
};

ContactUsPrototype.render = function() {
    var state = this.state,
        i18n = this.context.i18n,
        styles = this.getStyles();

    return (
        virt.createView("div", {
                className: "ContactUs",
                style: styles.root
            },
            virt.createView("div", {
                    style: styles.header
                },
                virt.createView("div", {
                        className: "grid"
                    },
                    virt.createView("div", {
                            className: "col-xs-12 col-sm-12 col-md-6 col-lg-6"
                        },
                        virt.createView("h3", i18n("app.name")),
                        virt.createView("h4", i18n("app.address")),
                        virt.createView("h4", i18n("app.phone"))
                    ),
                    virt.createView("div", {
                            className: "col-xs-12 col-sm-12 col-md-6 col-lg-6"
                        },
                        virt.createView("img", {
                            style: styles.headerImg,
                            src: "img/google_map.jpg"
                        })
                    )
                )
            ),
            virt.createView("div", {
                    style: styles.body
                },
                virt.createView("h3", {
                    style: styles.formHeader
                }, i18n("contact_us.form.header")),
                virt.createView("form", {
                        style: styles.form,
                        method: "POST",
                        action: "email.php"
                    },
                    virt.createView("label", {
                        style: styles.formLabel,
                        "for": "name"
                    }, i18n("contact_us.form.name")),
                    virt.createView("input", {
                        name: "name",
                        onInput: this.onInput,
                        style: styles.formInput,
                        value: state.name,
                        type: "text"
                    }),
                    virt.createView("label", {
                        style: styles.formLabel,
                        "for": "email"
                    }, i18n("contact_us.form.email")),
                    virt.createView("input", {
                        name: "email",
                        onInput: this.onInput,
                        style: styles.formInput,
                        value: state.email,
                        type: "email"
                    }),
                    virt.createView("label", {
                        style: styles.formLabel,
                        "for": "subject"
                    }, i18n("contact_us.form.subject")),
                    virt.createView("input", {
                        name: "subject",
                        onInput: this.onInput,
                        style: styles.formInput,
                        value: state.subject,
                        type: "text"
                    }),
                    virt.createView("label", {
                        style: styles.formLabel,
                        "for": "message"
                    }, i18n("contact_us.form.message")),
                    virt.createView("textarea", {
                        name: "message",
                        onInput: this.onInput,
                        style: styles.formTextArea,
                        value: state.message
                    }),
                    virt.createView("input", {
                        style: styles.formSubmit,
                        value: i18n("contact_us.form.submit"),
                        type: "submit"
                    })
                )
            ),
            virt.createView(Link, {
                    style: styles.milestoneloans,
                    target: "_blank",
                    href: "http://milestoneloans.net",
                    src: "img/fourfloors.jpg"
                },
                virt.createView("img", {
                    style: styles.milestoneloans,
                    src: "img/milestoneloans.jpg"
                })
            ),
            virt.createView("img", {
                style: styles.img,
                src: "img/fourfloors.jpg"
            })
        )
    );
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/components/Home.js */

var virt = require(1),
    css = require(207),
    propTypes = require(208),
    Link = require(279);


var HomePrototype;


module.exports = Home;


function Home(props, children, context) {
    virt.Component.call(this, props, children, context);
}
virt.Component.extend(Home, "Home");

HomePrototype = Home.prototype;

Home.contextTypes = {
    i18n: propTypes.func.isRequired,
    theme: propTypes.object.isRequired,
    size: propTypes.object.isRequired
};

HomePrototype.getStyles = function() {
    var context = this.context,
        theme = context.theme,
        size = context.size,
        styles = {
            root: {
                padding: "48px 0",
                background: theme.palette.primary2Color
            },
            imgHeader: {
                position: "relative"
            },
            over: {
                textAlign: "center",
                position: "absolute",
                height: "100%",
                width: "100%"
            },
            imgOver: {
                paddingTop: "5%"
            },
            img: {
                minHeight: "96px",
                width: "100%"
            },
            milestoneloans: {
                width: "100%"
            },
            body: {},
            intro: {
                padding: "8px 24px"
            },
            introHeader: {
                fontWeight: "100",
                fontStyle: "italic"
            },
            introImgs: {
                textAlign: "center",
                padding: "4px 0"
            },
            introImg: {
                margin: "0px 2%",
                border: "3px solid " + theme.palette.canvasColor
            },
            sec: {
                position: "relative",
                margin: "32px 16px 64px"
            },
            secHeader: {
                textTransform: "uppercase",
                zIndex: "1000",
                background: theme.palette.primary1Color,
                color: theme.palette.canvasColor,
                position: "absolute",
                top: "-20px",
                padding: "4px 64px 4px 48px",
                minWidth: "256px",
                margin: "0"
            },
            secBody: {
                zIndex: "999",
                position: "relative",
                fontSize: "1.25em",
                background: theme.palette.canvasColor,
                margin: "0 0 0 32px",
                padding: "32px 16px 16px"
            },
            qualityImg: {
                zIndex: "1001",
                position: "absolute",
                top: "-32px",
                right: "-24px",
                border: "3px solid " + theme.palette.canvasColor
            },
            halfText: {
                width: "60%"
            },
            clear: {
                clear: "both"
            }
        };

    if (size.width < 768) {
        styles.qualityImg.position = "inherit";
        styles.qualityImg.top = "inherit";
        styles.qualityImg.right = "inherit";
        styles.qualityImg.width = "inherit";
        styles.halfText.width = "inherit";
    }

    if (size.width < 480) {
        styles.qualityImg.width = "100%";
    }

    if (size.width < 640) {
        styles.introImg.margin = "4px 25%";
        styles.introImg.width = "50%";
    }

    css.boxShadow(styles.introImg, theme.styles.boxShadow);
    css.boxShadow(styles.secHeader, theme.styles.boxShadow);
    css.boxShadow(styles.secBody, theme.styles.boxShadow);
    css.boxShadow(styles.qualityImg, theme.styles.boxShadow);
    css.transform(styles.qualityImg, "rotate(6deg)");

    return styles;
};

HomePrototype.render = function() {
    var context = this.context,
        i18n = context.i18n,
        theme = context.theme,
        styles = this.getStyles();

    return (
        virt.createView("div", {
                className: "Home",
                style: styles.root
            },
            virt.createView("div", {
                    style: styles.imgHeader
                },
                virt.createView("div", {
                        style: styles.over,
                        src: "img/floor_covering.png"
                    },
                    virt.createView("img", {
                        style: styles.imgOver,
                        src: "img/floor_covering.png"
                    })
                ),
                virt.createView("img", {
                    style: styles.img,
                    src: "img/fourfloors.jpg"
                })
            ),
            virt.createView("div", {
                    style: styles.body
                },
                virt.createView("div", {
                        style: styles.intro
                    },
                    virt.createView("h2", {
                        style: styles.introHeader
                    }, i18n("home.intro")),
                    virt.createView("div", {
                            style: styles.introImgs
                        },
                        virt.createView("img", {
                            style: styles.introImg,
                            src: "img/dining.jpg"
                        }),
                        virt.createView("img", {
                            style: styles.introImg,
                            src: "img/pool_room.jpg"
                        }),
                        virt.createView("img", {
                            style: styles.introImg,
                            src: "img/bedroom.jpg"
                        })
                    )
                ),
                virt.createView("div", {
                        style: styles.sec
                    },
                    virt.createView("h3", {
                        style: styles.secHeader
                    }, i18n("home.commitment")),
                    virt.createView("p", {
                            style: styles.secBody
                        },
                        i18n("home.commitment_body"),
                        virt.createView(Link, {
                            color: theme.palette.primary1Color,
                            hoverColor: theme.palette.accent2Color,
                            href: "/about_us"
                        }, i18n("home.commitment_body_here")),
                        "."
                    )
                ),
                virt.createView("div", {
                        style: styles.sec
                    },
                    virt.createView("h3", {
                        style: styles.secHeader
                    }, i18n("home.quality")),
                    virt.createView("div", {
                            style: styles.secBody
                        },
                        virt.createView("p", {
                            style: styles.halfText
                        }, i18n("home.quality_body")),
                        virt.createView("img", {
                            style: styles.qualityImg,
                            src: "img/room.jpg"
                        }),
                        virt.createView("div", {
                            style: styles.clear
                        })
                    )
                ),
                virt.createView("div", {
                        style: styles.sec
                    },
                    virt.createView("h3", {
                        style: styles.secHeader
                    }, i18n("home.timely")),
                    virt.createView("p", {
                        style: styles.secBody
                    }, i18n("home.timely_body"))
                )
            ),
            virt.createView(Link, {
                    style: styles.milestoneloans,
                    target: "_blank",
                    href: "http://milestoneloans.net",
                    src: "img/fourfloors.jpg"
                },
                virt.createView("img", {
                    style: styles.milestoneloans,
                    src: "img/milestoneloans.jpg"
                })
            ),
            virt.createView("img", {
                style: styles.img,
                src: "img/fourfloors.jpg"
            })
        )
    );
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/components/Services.js */

var virt = require(1),
    css = require(207),
    extend = require(27),
    propTypes = require(208),
    Link = require(279);


var ServicesPrototype;


module.exports = Services;


function Services(props, children, context) {
    virt.Component.call(this, props, children, context);
}
virt.Component.extend(Services, "Services");

ServicesPrototype = Services.prototype;

Services.contextTypes = {
    i18n: propTypes.func.isRequired,
    theme: propTypes.object.isRequired,
    size: propTypes.object.isRequired
};

ServicesPrototype.getStyles = function() {
    var context = this.context,
        size = context.size,
        theme = context.theme,
        styles = {
            root: {
                padding: "48px 0",
                background: theme.palette.primary2Color
            },
            img: {
                minHeight: "96px",
                width: "100%"
            },
            milestoneloans: {
                width: "100%"
            },
            header: {
                paddingBottom: "48px"
            },
            headerImgWrap: {
                textAlign: "center",
                padding: "0 16px"
            },
            headerImg: {
                width: "100%"
            },
            headerText: {
                margin: "0",
                padding: "16px 8px 0 8px",
                minHeight: "72px",
                color: theme.palette.canvasColor,
                background: theme.palette.primary1Color
            },
            ul: {
                paddingTop: "48px",
                textAlign: "center"
            },
            li: {
                fontWeight: "500",
                textTransform: "uppercase",
                fontSize: "1.65em",
                padding: "0 16px",
                display: "inline-block",
                borderRight: "2px solid " + theme.palette.accent2Color
            },
            body: {
                zIndex: "999",
                position: "relative",
                fontSize: "1.175em",
                background: theme.palette.canvasColor,
                margin: "0 32px",
                padding: "16px 32px 32px"
            },
            sec: {
                position: "relative"
            },
            secHeader: {
                textTransform: "uppercase",
                zIndex: "1000",
                background: theme.palette.primary1Color,
                color: theme.palette.canvasColor,
                padding: "4px 64px 4px 48px",
                minWidth: "256px",
                margin: "0",
                position: "absolute",
                left: "-48px"
            },
            secBody: {
                paddingTop: "48px",
                paddingBottom: "16px"
            },
            secBodyTop: {
                paddingTop: "48px"
            },
            secBodyBottom: {
                paddingBottom: "16px"
            }
        };

    css.boxShadow(styles.secHeader, theme.styles.boxShadow);

    styles.liEnd = extend({}, styles.li);
    delete styles.liEnd.borderRight;

    if (size.width < 480) {
        styles.li.display = "block";
        delete styles.li.borderRight;
    }

    return styles;
};

ServicesPrototype.render = function() {
    var i18n = this.context.i18n,
        styles = this.getStyles();

    return (
        virt.createView("div", {
                className: "Services",
                style: styles.root
            },
            virt.createView("div", {
                    style: styles.header
                },
                virt.createView("div", {
                        className: "grid"
                    },
                    virt.createView("div", {
                            style: styles.headerImgWrap,
                            className: "col-xs-12 col-sm-12 col-md-4 col-lg-4"
                        },
                        virt.createView("img", {
                            style: styles.headerImg,
                            src: "img/entry_room.jpg"
                        }),
                        virt.createView("h3", {
                            style: styles.headerText
                        }, i18n("services.header.new_construction"))
                    ),
                    virt.createView("div", {
                            style: styles.headerImgWrap,
                            className: "col-xs-12 col-sm-12 col-md-4 col-lg-4"
                        },
                        virt.createView("img", {
                            style: styles.headerImg,
                            src: "img/small_bedroom.jpg"
                        }),
                        virt.createView("h3", {
                            style: styles.headerText
                        }, i18n("services.header.repairs_remediation"))
                    ),
                    virt.createView("div", {
                            style: styles.headerImgWrap,
                            className: "col-xs-12 col-sm-12 col-md-4 col-lg-4"
                        },
                        virt.createView("img", {
                            style: styles.headerImg,
                            src: "img/living_room.jpg"
                        }),
                        virt.createView("h3", {
                            style: styles.headerText
                        }, i18n("services.header.commerical_residential"))
                    )
                ),
                virt.createView("ul", {
                        style: styles.ul
                    },
                    virt.createView("li", {
                        style: styles.li
                    }, i18n("services.header.carpet")),
                    virt.createView("li", {
                        style: styles.li
                    }, i18n("services.header.carpet_tile")),
                    virt.createView("li", {
                        style: styles.li
                    }, i18n("services.header.vinyl")),
                    virt.createView("li", {
                        style: styles.liEnd
                    }, i18n("services.header.hardwood"))
                )
            ),
            virt.createView("div", {
                    style: styles.body
                },

                virt.createView("div", {
                        style: styles.sec
                    },
                    virt.createView("h3", {
                        style: styles.secHeader
                    }, i18n("services.residential_header")),
                    virt.createView("p", {
                        style: styles.secBodyTop
                    }, i18n("services.residential_body0")),
                    virt.createView("p", {
                        style: styles.secBodyBottom
                    }, i18n("services.residential_body1"))
                ),

                virt.createView("div", {
                        style: styles.sec
                    },
                    virt.createView("h3", {
                        style: styles.secHeader
                    }, i18n("services.corporate_header")),
                    virt.createView("p", {
                        style: styles.secBody
                    }, i18n("services.corporate_body"))
                ),

                virt.createView("div", {
                        style: styles.sec
                    },
                    virt.createView("h3", {
                        style: styles.secHeader
                    }, i18n("services.senior_header")),
                    virt.createView("p", {
                        style: styles.secBody
                    }, i18n("services.senior_body"))
                ),

                virt.createView("div", {
                        style: styles.sec
                    },
                    virt.createView("h3", {
                        style: styles.secHeader
                    }, i18n("services.retail_header")),
                    virt.createView("p", {
                        style: styles.secBody
                    }, i18n("services.retail_body"))
                ),


                virt.createView("div", {
                        style: styles.sec
                    },
                    virt.createView("h3", {
                        style: styles.secHeader
                    }, i18n("services.hospitality_header")),
                    virt.createView("p", {
                        style: styles.secBody
                    }, i18n("services.hospitality_body"))
                )
            ),
            virt.createView(Link, {
                    style: styles.milestoneloans,
                    target: "_blank",
                    href: "http://milestoneloans.net",
                    src: "img/fourfloors.jpg"
                },
                virt.createView("img", {
                    style: styles.milestoneloans,
                    src: "img/milestoneloans.jpg"
                })
            ),
            virt.createView("img", {
                style: styles.img,
                src: "img/fourfloors.jpg"
            })
        )
    );
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/components/Testimonials/index.js */

var virt = require(1),
    css = require(207),
    propTypes = require(208),
    arrayMap = require(39),
    Testimonial = require(288),
    Link = require(279),
    TestimonialStore = require(289);


var TestimonialsPrototype;


module.exports = Testimonials;


function Testimonials(props, children, context) {
    var _this = this;

    virt.Component.call(this, props, children, context);

    this.state = {
        testimonials: []
    };

    this.onChange = function() {
        return _this.__onChange();
    };
}
virt.Component.extend(Testimonials, "Testimonials");

TestimonialsPrototype = Testimonials.prototype;

Testimonials.contextTypes = {
    i18n: propTypes.func.isRequired,
    theme: propTypes.object.isRequired,
    size: propTypes.object.isRequired
};

TestimonialsPrototype.componentDidMount = function() {
    TestimonialStore.addChangeListener(this.onChange);
    this.__onChange();
};

TestimonialsPrototype.componentWillUnmount = function() {
    TestimonialStore.removeChangeListener(this.onChange);
};

TestimonialsPrototype.__onChange = function() {
    var _this = this;

    TestimonialStore.all(function(error, testimonials) {
        if (!error) {
            _this.setState({
                testimonials: testimonials
            });
        }
    });
};

TestimonialsPrototype.getStyles = function() {
    var context = this.context,
        theme = context.theme,
        size = context.size,
        styles = {
            root: {
                padding: "48px 0",
                background: theme.palette.primary2Color
            },
            imgHeader: {
                position: "relative"
            },
            over: {
                textAlign: "center",
                position: "absolute",
                height: "100%",
                width: "100%"
            },
            imgOver: {
                paddingTop: "5%"
            },
            img: {
                minHeight: "96px",
                width: "100%"
            },
            milestoneloans: {
                width: "100%"
            },
            body: {
                zIndex: "999",
                position: "relative",
                fontSize: "1.175em",
                background: theme.palette.canvasColor,
                margin: "0 32px",
                padding: "32px"
            },
            header: {
                textTransform: "uppercase",
                zIndex: "1000",
                background: theme.palette.primary1Color,
                color: theme.palette.canvasColor,
                position: "absolute",
                padding: "4px 64px 4px 48px",
                minWidth: "256px",
                margin: "0",
                left: "-16px"
            },
            ul: {
                background: theme.palette.canvasColor,
                margin: "0 32px",
                padding: "32px"
            },
            li: {

            }
        };

    css.boxShadow(styles.header, theme.styles.boxShadow);

    if (size.width < 640) {
        styles.ul.padding = "32px 0";
        styles.ul.margin = "0px";
    }

    return styles;
};

TestimonialsPrototype.render = function() {
    var i18n = this.context.i18n,
        styles = this.getStyles();

    return (
        virt.createView("div", {
                className: "Testimonials",
                style: styles.root
            },
            virt.createView("div", {
                    style: styles.imgHeader
                },
                virt.createView("div", {
                        style: styles.over,
                        src: "img/floor_covering.png"
                    },
                    virt.createView("img", {
                        style: styles.imgOver,
                        src: "img/floor_covering.png"
                    })
                ),
                virt.createView("img", {
                    style: styles.img,
                    src: "img/fourfloors.jpg"
                })
            ),
            virt.createView("div", {
                    style: styles.body
                },
                virt.createView("h3", {
                        style: styles.header
                    },
                    i18n("testimonials.header")
                ),
                virt.createView("ul", {
                        style: styles.ul
                    },
                    arrayMap(this.state.testimonials, function(testimonial) {
                        return (
                            virt.createView("li", {
                                    key: testimonial.id,
                                    style: styles.li
                                },
                                virt.createView(Testimonial, {
                                    testimonial: testimonial
                                })
                            )
                        );
                    })
                )
            ),
            virt.createView(Link, {
                    style: styles.milestoneloans,
                    target: "_blank",
                    href: "http://milestoneloans.net",
                    src: "img/fourfloors.jpg"
                },
                virt.createView("img", {
                    style: styles.milestoneloans,
                    src: "img/milestoneloans.jpg"
                })
            ),
            virt.createView("img", {
                style: styles.img,
                src: "img/fourfloors.jpg"
            })
        )
    );
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/components/Testimonials/Testimonial.js */

var virt = require(1),
    propTypes = require(208);


var TestimonialPrototype;


module.exports = Testimonial;


function Testimonial(props, children, context) {
    virt.Component.call(this, props, children, context);
}
virt.Component.extend(Testimonial, "Testimonial");

TestimonialPrototype = Testimonial.prototype;

Testimonial.propTypes = {
    testimonial: propTypes.object.isRequired
};

TestimonialPrototype.getStyles = function() {
    var styles = {
        root: {
            paddingBottom: "16px"
        },
        text: {
            fontSize: "1em",
            fontStyle: "italic"
        },
        author: {
            fontSize: "0.85em",
            fontWeight: "bold",
            marginTop: "1em",
            marginBottom: "0em"
        },
        location: {
            fontSize: "0.85em",
            fontWeight: "bold",
            marginTop: "0em",
            marginBottom: "0em"
        }
    };

    return styles;
};

TestimonialPrototype.render = function() {
    var styles = this.getStyles(),
        testimonial = this.props.testimonial;

    return (
        virt.createView("div", {
                className: "Testimonial",
                style: styles.root
            },
            virt.createView("p", {
                    style: styles.text
                },
                virt.createView("q", {
                        dangerouslySetInnerHTML: true
                    },
                    testimonial.text
                )
            ),
            virt.createView("p", {
                style: styles.author
            }, testimonial.author),
            virt.createView("p", {
                style: styles.location
            }, testimonial.location)
        )
    );
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/stores/TestimonialStore.js */

var values = require(290),
    Store = require(265);


var TestimonialStore = module.exports = new Store(),

    _testimonials = {
        1: {
            id: 1,
            text: (
                "I just wanted to let you know how much we love our carpet!  It was the easiest part of our remodel by far. " +
                "The installers arrived on time, and got right to work. No waiting around for the morning water cooler talk here! " +
                "Both Scott and Bobby worked diligently to pull up our existing carpet, cutting it so my trash collectors would take " +
                "it for disposal. 150 yards of pad & carpet were removed and reinstalled in 1-1/2 days!!! Including moving all heavy " +
                "the furniture out and back into place (3 br, living room, dining room, family room)." +
                "<br/><br/>" +
                "I would highly recommend Bomont Flooring to anyone who wants spectacular, fast service with fabulous friendly installers." +
                "Now, my shutter installers on the other hand, well that's another story."
            ),
            author: "PK Stransky",
            location: "Fort Myers, Florida"
        },
        2: {
            id: 2,
            text: (
                "Working with Bomont Flooring has been the BEST experience!  Their team is knowledgeable about products and helped us " +
                "find a flooring solution for us that meet all of our needs.  The service is impeccable; they arrived on time each visit and " +
                "completed the work in a timely manner.  On top of that they are always professional."
            ),
            author: "Amy Wilkie",
            location: "Analyst, Customer Experience"
        }
    };


TestimonialStore.all = function(callback) {
    callback(undefined, values(_testimonials));
};

TestimonialStore.get = function(id, callback) {
    callback(undefined, _testimonials[id]);
};

TestimonialStore.toJSON = function() {
    return _testimonials;
};

TestimonialStore.fromJSON = function(json) {
    _testimonials = json;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/values/src/index.js */

var keys = require(41);


module.exports = values;


function values(object) {
    return objectValues(object, keys(object));
}

values.objectValues = objectValues;

function objectValues(object, objectKeys) {
    var length = objectKeys.length,
        results = new Array(length),
        i = -1,
        il = length - 1;

    while (i++ < il) {
        results[i] = object[objectKeys[i]];
    }

    return results;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/components/ResidentialGallery/index.js */

var virt = require(1),
    css = require(207),
    propTypes = require(208),
    arrayMap = require(39),
    Item = require(292),
    Link = require(279),
    ResidentialGalleryStore = require(293);


var ResidentialGalleryPrototype;


module.exports = ResidentialGallery;


function ResidentialGallery(props, children, context) {
    var _this = this;

    virt.Component.call(this, props, children, context);

    this.state = {
        items: []
    };

    this.onChange = function() {
        return _this.__onChange();
    };
}
virt.Component.extend(ResidentialGallery, "ResidentialGallery");

ResidentialGalleryPrototype = ResidentialGallery.prototype;

ResidentialGallery.contextTypes = {
    i18n: propTypes.func.isRequired,
    size: propTypes.object.isRequired,
    theme: propTypes.object.isRequired
};

ResidentialGalleryPrototype.componentDidMount = function() {
    ResidentialGalleryStore.addChangeListener(this.onChange);
    this.__onChange();
};

ResidentialGalleryPrototype.componentWillUnmount = function() {
    ResidentialGalleryStore.removeChangeListener(this.onChange);
};

ResidentialGalleryPrototype.__onChange = function() {
    var _this = this;

    ResidentialGalleryStore.all(function(error, items) {
        if (!error) {
            _this.setState({
                items: items
            });
        }
    });
};

ResidentialGalleryPrototype.getStyles = function() {
    var context = this.context,
        theme = context.theme,
        size = context.size,
        styles = {
            root: {
                padding: "48px 0",
                background: theme.palette.primary2Color
            },
            imgHeader: {
                position: "relative"
            },
            over: {
                textAlign: "center",
                position: "absolute",
                height: "100%",
                width: "100%"
            },
            imgOver: {
                paddingTop: "5%"
            },
            img: {
                minHeight: "96px",
                width: "100%"
            },
            milestoneloans: {
                width: "100%"
            },
            body: {
                zIndex: "999",
                position: "relative",
                fontSize: "1.175em",
                background: theme.palette.canvasColor,
                margin: "0 32px",
                padding: "32px"
            },
            header: {
                textTransform: "uppercase",
                zIndex: "1000",
                background: theme.palette.primary1Color,
                color: theme.palette.canvasColor,
                position: "absolute",
                padding: "4px 64px 4px 48px",
                minWidth: "256px",
                margin: "0",
                left: "-16px"
            },
            ul: {
                background: theme.palette.canvasColor,
                margin: "0",
                padding: "48px 0 32px"
            },
            li: {
                display: "inline-block",
                padding: "0.999%",
                width: "33.333%"
            }
        };

    if (size.width < 480) {
        styles.li.width = "100%";
        styles.ul.textAlign = "center";
    }

    css.boxShadow(styles.header, theme.styles.boxShadow);

    return styles;
};

ResidentialGalleryPrototype.render = function() {
    var i18n = this.context.i18n,
        styles = this.getStyles();

    return (
        virt.createView("div", {
                className: "ResidentialGallery",
                style: styles.root
            },
            virt.createView("div", {
                    style: styles.imgHeader
                },
                virt.createView("div", {
                        style: styles.over,
                        src: "img/floor_covering.png"
                    },
                    virt.createView("img", {
                        style: styles.imgOver,
                        src: "img/floor_covering.png"
                    })
                ),
                virt.createView("img", {
                    style: styles.img,
                    src: "img/fourfloors.jpg"
                })
            ),
            virt.createView("div", {
                    style: styles.body
                },
                virt.createView("h3", {
                        style: styles.header
                    },
                    i18n("residential_gallery.header")
                ),
                virt.createView("ul", {
                        style: styles.ul
                    },
                    arrayMap(this.state.items, function(item) {
                        return (
                            virt.createView("li", {
                                    key: item.id,
                                    style: styles.li
                                },
                                virt.createView(Item, {
                                    height: 160,
                                    item: item
                                })
                            )
                        );
                    })
                )
            ),
            virt.createView(Link, {
                    style: styles.milestoneloans,
                    target: "_blank",
                    href: "http://milestoneloans.net",
                    src: "img/fourfloors.jpg"
                },
                virt.createView("img", {
                    style: styles.milestoneloans,
                    src: "img/milestoneloans.jpg"
                })
            ),
            virt.createView("img", {
                style: styles.img,
                src: "img/fourfloors.jpg"
            })
        )
    );
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/components/ResidentialGallery/Item.js */

var virt = require(1),
    virtDOM = require(2),
    css = require(207),
    propTypes = require(208),
    domDimensions = require(294),
    getImageDimensions = require(295);


var ItemPrototype;


module.exports = Item;


function Item(props, children, context) {
    var _this = this;

    virt.Component.call(this, props, children, context);

    this.state = {
        loaded: false,
        ratio: 1,
        width: 0,
        height: 0,
        top: 0,
        left: 0
    };

    this.onMouseOver = function(e) {
        return _this.__onMouseOver(e);
    };
    this.onMouseOut = function(e) {
        return _this.__onMouseOut(e);
    };
    this.onClick = function(e) {
        return _this.__onClick(e);
    };
    this.onLoad = function(e) {
        return _this.__onLoad(e);
    };
}
virt.Component.extend(Item, "Item");

ItemPrototype = Item.prototype;

Item.propTypes = {
    item: propTypes.object.isRequired,
    height: propTypes.number.isRequired
};

Item.contextTypes = {
    theme: propTypes.object.isRequired
};

ItemPrototype.__onLoad = function() {
    if (!this.state.loaded) {
        this.getImageDimensions();
    }
};

ItemPrototype.__onMouseOver = function() {
    this.setState({
        hover: true
    });
};

ItemPrototype.__onMouseOut = function() {
    this.setState({
        hover: false
    });
};

ItemPrototype.getImageDimensions = function() {
    var node = virtDOM.findDOMNode(this),
        dims = getImageDimensions(
            virtDOM.findDOMNode(this.refs.img),
            domDimensions.width(node),
            domDimensions.height(node)
        );

    this.setState({
        loaded: true,
        width: dims.width,
        height: dims.height,
        top: -dims.top,
        left: -dims.left
    });
};

ItemPrototype.getStyles = function() {
    var context = this.context,
        theme = context.theme,
        state = this.state,
        props = this.props,
        styles = {
            root: {
                position: "relative",
                height: props.height + "px",
                overflow: "hidden"
            },
            hover: {
                zIndex: 1,
                display: "block",
                cursor: "pointer",
                position: "absolute",
                width: "100%",
                height: props.height + "px",
                background: theme.palette.accent2Color // theme.palette.canvasColor
            },
            imgWrap: {
                zIndex: 0,
                position: "relative"
            },
            img: {
                position: "absolute",
                maxWidth: "inherit",
                top: state.top + "px",
                left: state.left + "px",
                width: state.loaded ? state.width + "px" : "inherit",
                height: state.loaded ? state.height + "px" : "inherit"
            }
        };

    css.transition(styles.hover, "opacity 300ms cubic-bezier(.25,.8,.25,1)");

    if (state.hover) {
        css.opacity(styles.hover, 0.5);
    } else {
        css.opacity(styles.hover, 0);
    }

    return styles;
};

ItemPrototype.render = function() {
    var styles = this.getStyles(),
        item = this.props.item;

    return (
        virt.createView("div", {
                className: "Item",
                style: styles.root
            },
            virt.createView("a", {
                onMouseOver: this.onMouseOver,
                onMouseOut: this.onMouseOut,
                href: "/residential_gallery/" + this.props.item.id,
                style: styles.hover
            }),
            virt.createView("div", {
                    style: styles.imgWrap
                },
                virt.createView("img", {
                    onLoad: this.onLoad,
                    style: styles.img,
                    ref: "img",
                    src: item.thumbnail
                })
            )
        )
    );
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/stores/ResidentialGalleryStore.js */

var values = require(290),
    Store = require(265);


var ResidentialGalleryStore = module.exports = new Store(),

    _items = {
        1: {
            id: 1,
            thumbnail: "img/gallery/Guest complete.jpg",
            image: "img/gallery/GuestRoom.jpg"
        },
        2: {
            id: 2,
            thumbnail: "img/gallery/living complete.jpg",
            image: "img/gallery/livingroom.jpg"
        },
        3: {
            id: 3,
            thumbnail: "img/gallery/master complete.jpg",
            image: "img/gallery/masterbed.jpg"
        }
    };


ResidentialGalleryStore.all = function(callback) {
    callback(undefined, values(_items));
};

ResidentialGalleryStore.get = function(id, callback) {
    callback(undefined, _items[id]);
};

ResidentialGalleryStore.toJSON = function() {
    return _items;
};

ResidentialGalleryStore.fromJSON = function(json) {
    _items = json;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/dom_dimensions/src/index.js */

var getCurrentStyle = require(296),
    isElement = require(171);


var domDimensions = exports;


domDimensions.top = function(node) {
    if (isElement(node)) {
        return node.getBoundingClientRect().top;
    } else {
        return 0;
    }
};

domDimensions.right = function(node) {
    if (isElement(node)) {
        return domDimensions.left(node) + node.offsetWidth;
    } else {
        return 0;
    }
};

domDimensions.bottom = function(node) {
    if (isElement(node)) {
        return domDimensions.top(node) + node.offsetHeight;
    } else {
        return 0;
    }
};

domDimensions.left = function(node) {
    if (isElement(node)) {
        return node.getBoundingClientRect().left;
    } else {
        return 0;
    }
};

domDimensions.width = function(node) {
    if (isElement(node)) {
        return domDimensions.right(node) - domDimensions.left(node);
    } else {
        return 0;
    }
};

domDimensions.height = function(node) {
    if (isElement(node)) {
        return domDimensions.bottom(node) - domDimensions.top(node);
    } else {
        return 0;
    }
};

domDimensions.marginTop = function(node) {
    if (isElement(node)) {
        return parseInt(getCurrentStyle(node, "marginTop"), 10);
    } else {
        return 0;
    }
};

domDimensions.marginRight = function(node) {
    if (isElement(node)) {
        return parseInt(getCurrentStyle(node, "marginRight"), 10);
    } else {
        return 0;
    }
};

domDimensions.marginBottom = function(node) {
    if (isElement(node)) {
        return parseInt(getCurrentStyle(node, "marginRight"), 10);
    } else {
        return 0;
    }
};

domDimensions.marginLeft = function(node) {
    if (isElement(node)) {
        return parseInt(getCurrentStyle(node, "marginLeft"), 10);
    } else {
        return 0;
    }
};

domDimensions.outerWidth = function(node) {
    if (isElement(node)) {
        return domDimensions.width(node) + domDimensions.marginLeft(node) + domDimensions.marginRight(node);
    } else {
        return 0;
    }
};

domDimensions.outerHeight = function(node) {
    if (isElement(node)) {
        return domDimensions.height(node) + domDimensions.marginTop(node) + domDimensions.marginBottom(node);
    } else {
        return 0;
    }
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/utils/getImageDimensions.js */

module.exports = getImageDimensions;


function getImageDimensions(node, maxWidth, maxHeight, noBiggerThanSize) {
    var width = node.naturalWidth || node.width || 0,
        height = node.naturalHeight || node.height || 0,
        ratio = width / height,
        w = 0,
        h = 0,
        t = 0,
        l = 0;

    if (noBiggerThanSize) {
        if ((maxWidth / maxHeight) > 1) {
            if (maxHeight > height) {
                maxHeight = height;
            }

            h = maxHeight;
            w = maxHeight * ratio;
        } else {
            if (maxWidth > width) {
                maxWidth = width;
            }

            w = maxWidth;
            h = maxWidth / ratio;
        }
    } else {
        if (ratio > 1) {
            h = maxHeight;
            w = maxHeight * ratio;
            l = (w - maxWidth) * 0.5;
        } else {
            w = maxWidth;
            h = maxWidth / ratio;
            t = (h - maxHeight) * 0.5;
        }
    }

    return {
        width: w,
        height: h,
        top: t,
        left: l
    };
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/get_current_style/src/index.js */

var supports = require(133),
    environment = require(3),
    isElement = require(171),
    isString = require(21),
    camelize = require(297);


var baseGetCurrentStyle;


module.exports = getCurrentStyle;


function getCurrentStyle(node, style) {
    if (isElement(node) && isString(style)) {
        return baseGetCurrentStyle(node, style);
    } else {
        return "";
    }
}


if (supports.dom && environment.document.defaultView) {
    baseGetCurrentStyle = function(node, style) {
        return node.ownerDocument.defaultView.getComputedStyle(node, "")[camelize(style)] || "";
    };
} else {
    baseGetCurrentStyle = function(node, style) {
        if (node.currentStyle) {
            return node.currentStyle[camelize(style)] || "";
        } else {
            return node.style[camelize(style)] || "";
        }
    };
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/camelize/src/index.js */

var reInflect = require(298),
    capitalizeString = require(221);


module.exports = camelize;


function camelize(string, lowFirstLetter) {
    var parts, part, i, il;

    lowFirstLetter = lowFirstLetter !== false;
    parts = string.match(reInflect);
    i = lowFirstLetter ? 0 : -1;
    il = parts.length - 1;

    while (i++ < il) {
        parts[i] = capitalizeString(parts[i]);
    }

    if (lowFirstLetter && (part = parts[0])) {
        parts[0] = part.charAt(0).toLowerCase() + part.slice(1);
    }

    return parts.join("");
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/re_inflect/src/index.js */

module.exports = /[^A-Z-_ ]+|[A-Z][^A-Z-_ ]+|[^a-z-_ ]+/g;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/components/Modal.js */

var virt = require(1),
    propTypes = require(208),
    app = require(5);


var ModalPrototype;


module.exports = Modal;


function Modal(props, children, context) {
    virt.Component.call(this, props, children, context);
}
virt.Component.extend(Modal, "Modal");

Modal.propTypes = {
    render: propTypes.func.isRequired,
    modal: propTypes.object.isRequired,
    ctx: propTypes.object.isRequired,
    i18n: propTypes.func.isRequired
};

Modal.childContextTypes = {
    ctx: propTypes.object.isRequired,
    modal: propTypes.object.isRequired,
    i18n: propTypes.func.isRequired
};

Modal.getChildContext = function() {
    return {
        ctx: this.props.ctx,
        modal: this.props.modal,
        i18n: this.props.i18n
    };
};

ModalPrototype = Modal.prototype;

ModalPrototype.componentDidMount = function() {
    app.page.on("request", this.props.modal.close);
};

ModalPrototype.componentWillUnmount = function() {
    app.page.off("request", this.props.modal.close);
};

ModalPrototype.getStyles = function() {
    var styles = {
        root: {
            position: "relative"
        }
    };

    return styles;
};

ModalPrototype.render = function() {
    var props = this.props,
        styles = this.getStyles();

    return (
        virt.createView("div", {
                className: "Modal",
                style: styles.root
            },
            props.render(props.ctx)
        )
    );
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/components/ResidentialGallery/ImageView.js */

var virt = require(1),
    virtDOM = require(2),
    css = require(207),
    propTypes = require(208),
    Link = require(279),
    ResidentialGalleryStore = require(293),
    getImageDimensions = require(295);


var ImageViewPrototype;


module.exports = ImageView;


function ImageView(props, children, context) {
    var _this = this;

    virt.Component.call(this, props, children, context);

    this.state = {
        image: null,
        loaded: false
    };

    this.onChange = function() {
        return _this.__onChange();
    };
    this.onLoad = function(e) {
        return _this.__onLoad(e);
    };
}
virt.Component.extend(ImageView, "ImageView");

ImageViewPrototype = ImageView.prototype;

ImageView.propTypes = {
    id: propTypes.number.isRequired,
    modal: propTypes.object.isRequired
};

ImageView.contextTypes = {
    theme: propTypes.object.isRequired,
    size: propTypes.object.isRequired
};

ImageViewPrototype.componentDidMount = function() {
    ResidentialGalleryStore.addChangeListener(this.onChange);
    this.__onChange();
};

ImageViewPrototype.componentWillUnmount = function() {
    ResidentialGalleryStore.removeChangeListener(this.onChange);
};

ImageViewPrototype.__onChange = function() {
    var _this = this;

    ResidentialGalleryStore.get(this.props.id, function onGet(error, item) {
        if (!error) {
            _this.setState({
                image: item.image,
                loaded: false
            });
        }
    });
};

ImageViewPrototype.getImageDimensions = function() {
    var size = this.context.size,
        node = virtDOM.findDOMNode(this.refs.img);

    return getImageDimensions(node, size.width * 0.75, size.height * 0.75, true);
};

ImageViewPrototype.__onLoad = function() {
    if (!this.state.loaded) {
        this.setState({
            loaded: true
        });
    }
};

ImageViewPrototype.getStyles = function() {
    var state = this.state,
        context = this.context,
        size = context.size,
        root = {
            zIndex: 1,
            position: "fixed"
        },
        styles = {
            root: root,
            close: {
                position: "absolute",
                top: "-16px",
                right: "-16px",
                background: context.theme.palette.canvasColor,
                fontFamily: "'Helvetica', 'Arial', sans-serif",
                fontSize: "2em",
                lineHeight: "1em",
                fontWeight: "bold",
                textAlign: "center",
                width: "32px",
                height: "32px"
            }
        };

    css.transition(styles.root, "opacity 200ms cubic-bezier(0.445, 0.05, 0.55, 0.95)");

    if (state.loaded) {
        dims = this.getImageDimensions();
        root.width = (dims.width | 0) + "px";
        root.height = (dims.height | 0) + "px";
        root.top = (((size.height * 0.5) - (dims.height * 0.5)) | 0) + "px";
        root.left = (((size.width * 0.5) - (dims.width * 0.5)) | 0) + "px";
        css.opacity(styles.root, 1);
    } else {
        css.opacity(styles.root, 0);
    }

    return styles;
};

ImageViewPrototype.render = function() {
    var styles = this.getStyles(),
        image = this.state.image;

    if (image) {
        return (
            virt.createView("div", {
                    className: "ImageView",
                    style: styles.root
                },
                virt.createView("img", {
                    ref: "img",
                    src: image,
                    onLoad: this.onLoad,
                    style: styles.img
                }),
                virt.createView(Link, {
                    onClick: this.props.modal.close,
                    color: this.context.theme.palette.accent2Color,
                    style: styles.close
                }, "x")
            )
        );
    } else {
        return (
            virt.createView("div", {
                className: "ImageView",
                style: styles.root
            })
        );
    }
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/routes/middleware/i18n.js */

var i18n = require(182),
    request = require(181),
    isString = require(21),
    UserStore = require(188);


var cache = {};


module.exports = i18nMiddleware;


function i18nMiddleware(ctx, next) {
    var locale = UserStore.user.locale;

    if (cache[locale] === true) {
        next();
    } else {
        request.get("locale/" + locale + ".json", {
            success: function(response) {
                cache[locale] = true;
                if (isString(response.data)) {
                    response.data = JSON.parse(response.data);
                }
                i18n.add(locale, response.data);
                next();
            },
            error: function(response) {
                next(response.data);
            }
        });
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/routes/about_us.js */

var RouteStore = require(187),
    scrollToTop = require(310),
    app = require(5);


app.router.route(
    "/about_us",
    function handleRoot(ctx, next) {
        app.dispatcher.handleViewAction({
            actionType: RouteStore.consts.ROUTE_UPDATE,
            state: "about_us",
            ctx: ctx
        });
        scrollToTop();
        ctx.end();
        next();
    }
);


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/routes/contact_us.js */

var RouteStore = require(187),
    scrollToTop = require(310),
    app = require(5);


app.router.route(
    "/contact_us",
    function handleRoot(ctx, next) {
        app.dispatcher.handleViewAction({
            actionType: RouteStore.consts.ROUTE_UPDATE,
            state: "contact_us",
            ctx: ctx
        });
        scrollToTop();
        ctx.end();
        next();
    }
);


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/routes/home.js */

var RouteStore = require(187),
    scrollToTop = require(310),
    app = require(5);


app.router.route(
    "/",
    function handleRoot(ctx, next) {
        app.dispatcher.handleViewAction({
            actionType: RouteStore.consts.ROUTE_UPDATE,
            state: "home",
            ctx: ctx
        });
        scrollToTop();
        ctx.end();
        next();
    }
);


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/routes/services.js */

var RouteStore = require(187),
    scrollToTop = require(310),
    app = require(5);


app.router.route(
    "/services",
    function handleRoot(ctx, next) {
        app.dispatcher.handleViewAction({
            actionType: RouteStore.consts.ROUTE_UPDATE,
            state: "services",
            ctx: ctx
        });
        scrollToTop();
        ctx.end();
        next();
    }
);


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/routes/testimonials.js */

var RouteStore = require(187),
    scrollToTop = require(310),
    app = require(5);


app.router.route(
    "/testimonials",
    function handleRoot(ctx, next) {
        app.dispatcher.handleViewAction({
            actionType: RouteStore.consts.ROUTE_UPDATE,
            state: "testimonials",
            ctx: ctx
        });
        scrollToTop();
        ctx.end();
        next();
    }
);


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/routes/residential_gallery.js */

var RouteStore = require(187),
    app = require(5);


app.router.route(
    "/residential_gallery",
    function handleRoot(ctx, next) {
        app.dispatcher.handleViewAction({
            actionType: RouteStore.consts.ROUTE_UPDATE,
            state: "residential_gallery",
            ctx: ctx
        });
        ctx.end();
        next();
    }
);


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/routes/residential_gallery-viewer.js */

var virtModal = require(180),
    RouteStore = require(187),
    scrollTo = require(312),
    app = require(5);


app.router.route(
    "/residential_gallery/:id[0-9]",
    function handleRoot(ctx, next) {
        app.dispatcher.handleViewAction({
            actionType: RouteStore.consts.ROUTE_UPDATE,
            state: "residential_gallery",
            ctx: ctx
        });
        app.dispatcher.handleViewAction({
            actionType: virtModal.ModalStore.consts.MODAL_OPEN,
            name: "residential_gallery-viewer",
            modalDialog: {
                margin: "0px",
                width: "100%"
            },
            modalStyle: {
                overflow: "auto"
            },
            data: {
                id: ctx.params.id
            }
        });
        scrollTo(0, window.scrollY + 1);
        ctx.end();
        next();
    }
);


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/routes/not_found.js */

var RouteStore = require(187),
    scrollToTop = require(310),
    app = require(5);


app.router.use(
    function handleNotFound(ctx, next) {
        if (ctx.route) {
            next();
        } else {
            app.dispatcher.handleViewAction({
                actionType: RouteStore.consts.ROUTE_UPDATE,
                state: "not_found",
                ctx: ctx
            });
            scrollToTop();
            ctx.end();
            next();
        }
    }
);


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/utils/scrollToTop.js */

var requestAnimationFrame = require(311),
    scrollTo = require(312);


var DELTA_TIME = 1000 / 60;


module.exports = scrollToTop;


function scrollToTop() {
    var lastTime = 0,
        scrollY = window.scrollY,
        delta = -scrollY;

    function scroll(ms) {
        var dt;

        dt = ms - (lastTime || -DELTA_TIME);
        lastTime = ms;

        if (scrollY > 0) {
            scrollY += delta / dt;
            scrollTo(0, scrollY);
            requestAnimationFrame(scroll);
        } else {
            scrollTo(0, 0);
        }
    }

    requestAnimationFrame(scroll);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/request_animation_frame/src/index.js */

var environment = require(3),
    emptyFunction = require(42),
    now = require(313);


var window = environment.window,
    requestAnimationFrame, lastTime;


window.requestAnimationFrame = (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame
);

window.cancelRequestAnimationFrame = (
    window.cancelAnimationFrame ||
    window.cancelRequestAnimationFrame ||

    window.webkitCancelAnimationFrame ||
    window.webkitCancelRequestAnimationFrame ||

    window.mozCancelAnimationFrame ||
    window.mozCancelRequestAnimationFrame ||

    window.oCancelAnimationFrame ||
    window.oCancelRequestAnimationFrame ||

    window.msCancelAnimationFrame ||
    window.msCancelRequestAnimationFrame
);


if (window.requestAnimationFrame) {
    requestAnimationFrame = function requestAnimationFrame(callback, element) {
        return window.requestAnimationFrame(callback, element);
    };
} else {
    lastTime = 0;

    requestAnimationFrame = function requestAnimationFrame(callback) {
        var current = now(),
            timeToCall = Math.max(0, 16 - (current - lastTime)),
            id = global.setTimeout(
                function runCallback() {
                    callback(current + timeToCall);
                },
                timeToCall
            );

        lastTime = current + timeToCall;
        return id;
    };
}


if (window.cancelRequestAnimationFrame && window.requestAnimationFrame) {
    requestAnimationFrame.cancel = function(id) {
        return window.cancelRequestAnimationFrame(id);
    };
} else {
    requestAnimationFrame.cancel = function(id) {
        return global.clearTimeout(id);
    };
}


requestAnimationFrame(emptyFunction);


module.exports = requestAnimationFrame;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/js/utils/scrollTo.js */

module.exports = scrollTo;


function scrollTo(x, y) {
    try {
        window.scrollTo(x, y);
    } catch (e) {}
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/bomont_flooring/node_modules/now/src/browser.js */

var Date_now = Date.now || function Date_now() {
        return (new Date()).getTime();
    },
    START_TIME = Date_now(),
    performance = global.performance || {};


function now() {
    return performance.now();
}

performance.now = (
    performance.now ||
    performance.webkitNow ||
    performance.mozNow ||
    performance.msNow ||
    performance.oNow ||
    function now() {
        return Date_now() - START_TIME;
    }
);

now.getStartTime = function getStartTime() {
    return START_TIME;
};


START_TIME -= now();


module.exports = now;


}], null, void(0), (new Function("return this;"))()));
