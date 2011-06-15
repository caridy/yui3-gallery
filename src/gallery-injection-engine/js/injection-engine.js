/**
 * Injection Engine for Plug and Play widgets. This class is a phanton class for a 
 * Bootstrap Engine (gallery-bootstrap-engine). It facilitates the instantiation
 * of a bootstrap object in an iframe sandbox and provides an easy way to set properties and 
 * capture events from the bootstrap object.
 *
 * @module gallery-injection-engine
 * @requires node, base-base
 * @class Y.InjectionEngine
 * @param config {Object} Configuration object
 * @extends Y.Base
 * @constructor
 */

///////////////////////////////////////////////////////////////////////////
//
// Private shorthands, constants and variables
//
///////////////////////////////////////////////////////////////////////////

var config,
    global_yui_config,
    custom_yui_config,
    documentElem = Y.config.doc.documentElement,
    script = 'script',
    regexUrlDetection = /^(http[s]?:\/\/|\/\/[\w\d]+)/; // supporting http://domain..., https://domain... and //domain...

///////////////////////////////////////////////////////////////////////////
//
// Class definition
//
///////////////////////////////////////////////////////////////////////////

function InjectionEngine () {
    InjectionEngine.superclass.constructor.apply(this, arguments);
}

Y.mix(InjectionEngine, {

    /**
     * The identity of the class.
     * @property NAME
     * @type string
     * @static
     * @final
     * @readOnly
     * @default 'injection'
     */
    NAME: 'injection',

    /**
     * Static property used to define the default attribute configuration of
     * the class.
     * @property InjectionEngine.ATTRS
     * @type Object
     * @protected
     * @static
     */
    ATTRS: {
        // other injection specific parameters.
        /**
         * @attribute bootstrap
         * @type {Object}
         * @writeOnce
         * @description A reference to the bootstrap engine. This attribute will be set after the
         * bootstrap engine execute the callback method to connect with the injection engine.
         */
        bootstrap: {
            readOnly: true
        },
        /**
         * @attribute html
         * @type {String}
         * @writeOnce
         * @description The HTML fragment that will be injected at the top of the Body element in the iframe.
         */
         // there is not need to have an actual "html" attribute explicitely here, let's use the config object instead.
        /**
         * @attribute css
         * @type {String|Array}
         * @writeOnce
         * @description One or more style blocks or urls. e.g., ['http://full/path/is/required/script.js', 'https://secure/path/also/works/script.js', 'function(){ return 1; }', {url: 'relative/path.js'}]
         */
        css: {
            getter: '_buildCSS'
        },
        /**
         * @attribute js
         * @type {String|Array}
         * @writeOnce
         * @description One or more js blocks or urls. e.g., ['http://full/path/is/required/style.css', 'https://secure/path/also/works/style.css', 'inline{css:property;}', {url: 'relative/path.css'}]
         */
        js: {
            getter: '_buildJS'
        },
        /**
         * @attribute dir
         * @type {String}
         * @writeOnce
         * @description The HTML DIR attribute specifies the base direction (LTR, RTL) of text in the tray. 
         * @default document.documentElement.dir
         */
        dir: {
            value: documentElem.dir || 'ltr'
        },
        /**
         * @attribute lang
         * @type {String}
         * @default document.documentElement.lang
         * @writeOnce
         * @description The HTML lang attribute can be used to declare the language of the tray.
         */
        lang: {
            value: documentElem.lang || 'en'
        },
        /**
         * @attribute container
         * @type {String}
         * @writeOnce
         * @description selector for the container element
         */
        container: {
            setter: function (n) {
                return Y.one(n);
            }
        },
        /**
         * @attribute dynamicAttrs
         * @type {Array}
         * @writeOnce
         * @description Collection of attributes that will be in sycn between the phantom and the bootstrap object
         */
        dynamicAttrs: {
            value: []
        },
        /**
         * @attribute dynamicEvents
         * @type {Array}
         * @writeOnce
         * @description Collection of events that will be propagated from the bootstrap object into the
         * injection engine. Each element in the collection could be an string (event name), or an 
         * liternal object like this: {name: 'abc', rename: 'xyz', fn: function (ev, name, o) {} }
         * to faciliate the event transformation if needed. In this defintion, "rename" will become
         * the name of the event fired on the injection engine, and fn will be used to analyze the event
         * and avoid firing it if needed (return false to avoid firing the event locally).
         */
        dynamicEvents: {
            value: []
        }
    }

});

Y.extend(InjectionEngine, Y.Base, {

    /**
     * Construction logic executed during Injection Engine instantiation.
     *
     * @method initializer
     * @protected
     */
    initializer: function (cfg, ycfg) {
        var instance = this,
            guid = Y.guid();

        Y.log ('Initialization', 'info', 'injection');

        // storing the injection configuration. This will be passed into the bootstrap engine on ready
        config = cfg || {};

        // storing the custom YUI_config for the iframe sandbox, usually for debug mode hacking
        global_yui_config = ycfg || {};

        // creating dynamic attributes for the sync up
        Y.each(instance.get('dynamicAttrs'), function(name) {
            // creating the new dynamic attribute
            instance.addAttr(name, {value: config[name]}, false);
            // removing them from config to avoid sending and initial data to bootstrap
            delete config[name];
        });

        // setting the minimal required yui configuration for the iframe
        custom_yui_config = {
            lang: instance.get('lang'),
            guid: guid // instance stamp
        };

        // defining the pipeline to connect bootstrap with injection
        // once the bootstrap finishes the initialization. This is a way to 
        // connect both objects.
        YUI.Env[guid] = Y.bind(instance._connect, instance);

        // finishing the initialization process async to facilitate 
        // addons to hook into _init/_bind if needed.
        // YUI.Env.yui_3_3_0_1_130429815869015 will be a callback method
        Y.later(0, instance, function() {
            instance._init();
        });
    },

    /**
     * Preload any asset before the boot process. Good for performance. By default it will 
     * preload the css and js files produced by those attributes.
     *
     * @method preload
     * @param files {string|array} custom files to preload. If specified, it will not load the default ones.
     * @return this for chaining
     */
    preload: function (files) {
        var instance = this,
            node = instance.get('container'),
            ie = Y.UA.ie,
            fn = function (f) {
                if ((f = instance._testFullURL(f)) && (f = f.url)) {
                    Y.log("Preloading asset: " + f, "info", "injection");
                    if (ie) {
                        (new Image()).src = f;
                    } else {
                        node.append('<object data="'+f+'" width="0" tabindex="-1" height="0" style="display:none;left:-9999px;position:absolute;"></object>');
                    }
                }
            };

        Y.log ('method: preload', 'info', 'injection');

        files = ( Y.Lang.isArray(files) ? files : Y.Array(arguments, 0, true));

        if (files.length > 0) {
            Y.log("Preloading custom assets (arguments):", "info", "injection");
            Y.each(files, fn);
        } else {
            Y.log("Preloading JS assets:", "info", "injection");
            Y.each(instance.get('js'), fn);
            Y.log("Preloading CSS assets:", "info", "injection");
            Y.each(instance.get('css'), fn);
        }
        return instance;
    },

    /**
     * Boot the system, creating the sandbox, injecting the css and the js into the iframe, 
     * waiting for the bootstrap to gets ready, then continueing with the workflow.
     *
     * @method boot
     * @return this for chaining
     */
    boot: function () {
        var instance = this;
        Y.log ('Boot', 'info', 'injection');
        instance._createSandbox ( config );
        return instance; // chaining on public methods
    },

    /**
     * Connects the injection engine with the bootstrap running in the iframe. This method 
     * defines the hand-shake process between them. This method is meant to be called by
     * the bootstrap engine in the sandbox to start the connection.
     *
     * @method _connect
     * @param bootstrap {Object} Reference to the bootstrap engine object.
     */
    _connect: function (bootstrap) {
        var instance = this;

        Y.log ('Connect', 'info', 'injection');
        // setting an internal attribute to keep a reference to the bootstrap engine (just in case)
        instance._set ('bootstrap', bootstrap);

        // storing a reference to the tray
        bootstrap.setAttrs(config);

        // syncing up attributes between injection and bootstrap now that the bootstrap is ready
        Y.each(instance.get('dynamicAttrs'), function(name) {
            var v = instance.get(name);
            Y.log ('Initializating dynamic attribute: '+name, 'info', 'injection');
            if (!Y.Lang.isUndefined(v)) {
                Y.log ('Initial attribute sync up: '+name+'='+v, 'info', 'injection');
                bootstrap.set(name, instance.get(name));
            }
            instance.on(name+'Change', function (e) {
                Y.log ('Setting new value for attribute: '+e.attrName+'='+e.newVal, 'info', 'injection');
                bootstrap.set(e.attrName, e.newVal);
            });
        });

        // syncing up attributes between injection and bootstrap now that the bootstrap is ready
        Y.each(instance.get('dynamicEvents'), function(ev) {
            ev = ( Y.Lang.isObject(ev) ? ev : { name: ev } );
            Y.log ('Initializating dynamic event: ' + ev.name, 'info', 'injection');
            if (ev.name) {
                bootstrap.on(ev.name, Y.bind( instance._onEvent, instance, ev ));
            }
        });

        // removing the preload placeholders if needed
        if (!Y.UA.ie) {
            Y.log('Removing pre-load placeholders: ' + instance.get('container').all('object'), 'info', 'ura-injection');
            instance.get('container').all('object').remove();
        }

        Y.log('Bootstrap is ready.', 'info', 'injection');
        return this._ready();
    },

    /**
     * Basic initialization routine, binding events.
     *
     * @method _bind
     * @protected
     */
    _init: function () {
        // binding some extra events
        Y.log ('Init', 'info', 'injection');
        this._bind();
    },

    /**
     * Defines the binding logic for the injection engine, listening for some attributes 
     * that might change.
     *
     * @method _bind
     * @protected
     */
    _bind: function() {
        Y.log ('Bind', 'info', 'injection');
    },

    /**
     * Defines the moment when the bootstrap engine gets ready to be used.
     *
     * @method _ready
     * @protected
     * @return {boolean} use this to control the state of the initialization on the bootstrap engine since it might 
     * take some time to load the stuff in the iframe, and the user might interact with the page
     * invalidating the initialization routine. If return true, the _ready method in the bootstrap will be called at
     * the end of the initialization.
     */
    _ready: function() {
        Y.log ('Ready', 'info', 'injection');
    },

    /**
     * Handler for any dynamic event from the bootstrap. By default, renames the event 
     * if needed, calls a custom function if needed, and broadcasts the event if needed.
     *
     * @method _onEvent
     * @param o {Object} dynamic event object from the "dynamicEvents" collection.
     * @param e {Object} event object from the bootstrap engine.
     * @protected
     */
    _onEvent: function (o, e) {
        var instance = this,
            name = o.rename || o.name;
        Y.log ('Catching an event from the bootstrap engine: ' + o.name, 'info', 'injection');
        if ( ( o.fn ? o.fn.apply(instance, [e, name, o]) : true ) ) {
            Y.log ('Triggering the corresponding local event: ' + name, 'info', 'injection');
            instance.fire(name);
        }
    },

    /**
     * Getter method for the attribute called js.
     *
     * @method _buildJS
     * @param url {String|Array} One or more js blocks or urls.
     * @protected
     * @return {Array} Collection of urls or inline scripts to be inserted as script tags the body of the iframe.
     */
    _buildJS: function (url) {
        return Y.Array( (url || []) );
    },

    /**
     * Getter method for the attribute called css.
     *
     * @method _buildCSS
     * @param url {String|Array} One or more style blocks or urls.
     * @protected
     * @return {Array} Collection of urls or inline styles to be inserted as link or style tags the head of the iframe.
     */
    _buildCSS: function (url) {
        return Y.Array( (url || []) );
    },

    /**
     * Build the basic meta tags for the iframe document. By default, it adds the content-type as text/html and
     * charset as utf-8.
     *
     * @method _buildMeta
     * @param config {Object} Literal object with the initial configuration from the injection engine.
     * @protected
     * @return {string} HTML Fragment to be inserted at the top of the header.
     */
    _buildMeta: function (config) {
        return '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>';
    },

    /**
     * Build the basic html content for the iframe's body. By default, it adds the required YUI_config structure.
     * If JSON is available, the custom yui config and the global yui config will be mixed and stringified.
     *
     * @method _buildBody
     * @param config {Object} Literal object with the initial configuration from the injection engine.
     * @protected
     * @return {Array} Collection of HTML Fragments to be inserted at the body of the iframe.
     */
    _buildBody: function (config) {
        var b = [(config.html ? config.html : '<br>')],
            J = Y.JSON || (Y.config.win || {}).JSON,
            yui_config;

        // global_yui_config will be transformed into a custom YUI_config object as part of the iframe body, but 
        // it requires JSON to stringify the configuration. Since this is usually a debug trick, we 
        // decided not to have JSON as a dependency, but as an option.
        // Also, custom_yui_config contains the basic configuration that is required by the bootstrap engine.
        if (J) {
            yui_config = J.stringify( Y.mix( global_yui_config, custom_yui_config ) );
        } else {
        // if JSON is not available, we will create a minimum required configuration using string only
            yui_config = [];
            Y.each (Y.Object.keys(custom_yui_config), function (name) {
                yui_config.push( name + ':"' +  custom_yui_config[name] + '"');
            });
            yui_config = '{' + yui_config.join(',') + '}';
        }
        Y.log ('Setting initial YUI_config=' + yui_config, 'info', 'injection');
        b.push('<', script, '>YUI_config=', yui_config, ';</', script, '>');

        return b;
    },

    /**
     * Creates an iframe using a custom configuration. It uses the [js] and [css] attributes
     * within the iframe scope.
     *
     * @method _createSandbox
     * @param config {Object} The configuration object
     * @protected
     */
    _createSandbox: function (config) {
        var instance = this,
            iframe = Y.Node.create('<iframe frameborder="0"></iframe>'),
            container = instance.get('container'),
            CSS = instance.get('css'),
            JS = instance.get('js'),
            META = instance._buildMeta(config),
            BODY = instance._buildBody(config),
            doc;

        // setting the timestamp 0 right before starting the injection process (just in case you want to do some perf)
        custom_yui_config.t0 = new Date().getTime();

        // setting the bootstrap engine css (usually a full rollout)
        Y.each (CSS, function (value, indx) {
            value = instance._testFullURL(value);
            CSS[indx] = ( value && Y.Lang.isObject(value) ?
                            '<link rel="stylesheet" type="text/css" href="' + value.url + '"/>' :
                            '<style>' + value + '</style>'
                        );
        });
        // setting the bootstrap engine js (usually a full rollout)
        Y.each (JS, function (value, indx) {
            value = instance._testFullURL(value);
            JS[indx] = ( value && Y.Lang.isObject(value) ?
                            '<' + script + ' src="' + value.url + '"></' + script + '>' :
                            '<' + script + '>' + value + '</' + script + '>'
                       );
        });

        // setting up the iframe src to avoid warnings
        iframe.set('src', 'javascript' + ((Y.UA.ie) ? ':false' : ':') + ';');
        // injecting the structure into the container
        container.append( iframe );
        // setting the content of the iframe
        doc = iframe._node.contentWindow.document;
        doc.open().write('<!doctype html><html dir="' + instance.get('dir') + '" lang="' + instance.get('lang') + '"><head>' + META + CSS.join('') + '</head><body>' + BODY.join('') + JS.join('') + '</body></html>');
        doc.close();
    },

    /**
     * Detect an url pattern on a string value to decide if the string is a full url.
     *
     * @method _testFullURL
     * @param value {String} string to be confirmed as a full url.
     * @protected
     * @return {String|Object} If the value is an url, returns an object {url: value}, if not, returns the value.
     */
    _testFullURL: function (value) {
        if (Y.Lang.isString(value)) {
            value =  ( regexUrlDetection.test(value) ? {url: value} : value );
        }
        return ( Y.Lang.isObject(value) && !value.url ? null: value );
    }

});

Y.InjectionEngine = InjectionEngine;
