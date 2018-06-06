(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        //Allow using this built library as an AMD module
        //in another project. That other project will only
        //see this AMD call, not the internal modules in
        //the closure below.
        define(factory);
    } else {
        //Browser globals case. Just assign the
        //result to a property on the global.
        var oldOData = {}, oldDatajs = {}, isProcessed = false;

        /* cloning function */
        function processObjWithRef(obj, result){
            if(obj==null || typeof obj != 'object'){
                //nothing really to do here - you're going to lose the reference to result if you try an assignment
            }
            if(obj instanceof Array) {
                for(var i=0; i<obj.length; i++){
                    result.push();
                    processObjWithRef(obj[i], result[i]);
                }
            }
            if(obj instanceof Object){
                for(var k in obj){
                    var count=0;
                    if(obj[k]==null || typeof obj[k] != 'object'){
                        result[k] = obj[k];
                    }else if(obj[k] instanceof Array) {
                        result[k] = [];
                        processObjWithRef(obj[k], result[k]);
                    }else if(obj[k] instanceof Object){
                        result[k] = {};
                        for( var attr in obj[k]){
                            processObjWithRef(obj[k], result[k]);
                        }
                    }
                }
            }
        }

        /** check if odata already global -
        * means someone use oData somewhere else
        */
        if (window.OData && window.datajs) {
            isProcessed = true;
            processObjWithRef(window.OData, oldOData);
            processObjWithRef(window.datajs, oldDatajs);
        }

        root.annService = factory();

        if (isProcessed) {
            window.OData = oldOData;
            window.datajs = oldDatajs;
        } else {
            if(window.OData){
                window.OData = undefined;

                // WSi 20140211: we use try-catch as a fix for IE8 that doesn't like deleting window's properties
                try {
                    delete window.OData;
                } catch(e) {}
            }
            if(window.datajs){
                window.datajs = undefined;
                try {
                    delete window.datajs;
                } catch(e) {}
            }
        }
    }
}(this, function () {
    //almond, and your modules will be inlined here


/**
 * almond 0.2.5 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        if (config.deps) {
            req(config.deps, config.callback);
        }
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("almond", function(){});

//(function(){var n=this,t=n._,r={},e=Array.prototype,u=Object.prototype,i=Function.prototype,a=e.push,o=e.slice,c=e.concat,l=u.toString,f=u.hasOwnProperty,s=e.forEach,p=e.map,h=e.reduce,v=e.reduceRight,d=e.filter,g=e.every,m=e.some,y=e.indexOf,b=e.lastIndexOf,x=Array.isArray,_=Object.keys,j=i.bind,w=function(n){return n instanceof w?n:this instanceof w?(this._wrapped=n,void 0):new w(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=w),exports._=w):n._=w,w.VERSION="1.4.4";var A=w.each=w.forEach=function(n,t,e){if(null!=n)if(s&&n.forEach===s)n.forEach(t,e);else if(n.length===+n.length){for(var u=0,i=n.length;i>u;u++)if(t.call(e,n[u],u,n)===r)return}else for(var a in n)if(w.has(n,a)&&t.call(e,n[a],a,n)===r)return};w.map=w.collect=function(n,t,r){var e=[];return null==n?e:p&&n.map===p?n.map(t,r):(A(n,function(n,u,i){e[e.length]=t.call(r,n,u,i)}),e)};var O="Reduce of empty array with no initial value";w.reduce=w.foldl=w.inject=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),h&&n.reduce===h)return e&&(t=w.bind(t,e)),u?n.reduce(t,r):n.reduce(t);if(A(n,function(n,i,a){u?r=t.call(e,r,n,i,a):(r=n,u=!0)}),!u)throw new TypeError(O);return r},w.reduceRight=w.foldr=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),v&&n.reduceRight===v)return e&&(t=w.bind(t,e)),u?n.reduceRight(t,r):n.reduceRight(t);var i=n.length;if(i!==+i){var a=w.keys(n);i=a.length}if(A(n,function(o,c,l){c=a?a[--i]:--i,u?r=t.call(e,r,n[c],c,l):(r=n[c],u=!0)}),!u)throw new TypeError(O);return r},w.find=w.detect=function(n,t,r){var e;return E(n,function(n,u,i){return t.call(r,n,u,i)?(e=n,!0):void 0}),e},w.filter=w.select=function(n,t,r){var e=[];return null==n?e:d&&n.filter===d?n.filter(t,r):(A(n,function(n,u,i){t.call(r,n,u,i)&&(e[e.length]=n)}),e)},w.reject=function(n,t,r){return w.filter(n,function(n,e,u){return!t.call(r,n,e,u)},r)},w.every=w.all=function(n,t,e){t||(t=w.identity);var u=!0;return null==n?u:g&&n.every===g?n.every(t,e):(A(n,function(n,i,a){return(u=u&&t.call(e,n,i,a))?void 0:r}),!!u)};var E=w.some=w.any=function(n,t,e){t||(t=w.identity);var u=!1;return null==n?u:m&&n.some===m?n.some(t,e):(A(n,function(n,i,a){return u||(u=t.call(e,n,i,a))?r:void 0}),!!u)};w.contains=w.include=function(n,t){return null==n?!1:y&&n.indexOf===y?n.indexOf(t)!=-1:E(n,function(n){return n===t})},w.invoke=function(n,t){var r=o.call(arguments,2),e=w.isFunction(t);return w.map(n,function(n){return(e?t:n[t]).apply(n,r)})},w.pluck=function(n,t){return w.map(n,function(n){return n[t]})},w.where=function(n,t,r){return w.isEmpty(t)?r?null:[]:w[r?"find":"filter"](n,function(n){for(var r in t)if(t[r]!==n[r])return!1;return!0})},w.findWhere=function(n,t){return w.where(n,t,!0)},w.max=function(n,t,r){if(!t&&w.isArray(n)&&n[0]===+n[0]&&65535>n.length)return Math.max.apply(Math,n);if(!t&&w.isEmpty(n))return-1/0;var e={computed:-1/0,value:-1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a>=e.computed&&(e={value:n,computed:a})}),e.value},w.min=function(n,t,r){if(!t&&w.isArray(n)&&n[0]===+n[0]&&65535>n.length)return Math.min.apply(Math,n);if(!t&&w.isEmpty(n))return 1/0;var e={computed:1/0,value:1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;e.computed>a&&(e={value:n,computed:a})}),e.value},w.shuffle=function(n){var t,r=0,e=[];return A(n,function(n){t=w.random(r++),e[r-1]=e[t],e[t]=n}),e};var k=function(n){return w.isFunction(n)?n:function(t){return t[n]}};w.sortBy=function(n,t,r){var e=k(t);return w.pluck(w.map(n,function(n,t,u){return{value:n,index:t,criteria:e.call(r,n,t,u)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index<t.index?-1:1}),"value")};var F=function(n,t,r,e){var u={},i=k(t||w.identity);return A(n,function(t,a){var o=i.call(r,t,a,n);e(u,o,t)}),u};w.groupBy=function(n,t,r){return F(n,t,r,function(n,t,r){(w.has(n,t)?n[t]:n[t]=[]).push(r)})},w.countBy=function(n,t,r){return F(n,t,r,function(n,t){w.has(n,t)||(n[t]=0),n[t]++})},w.sortedIndex=function(n,t,r,e){r=null==r?w.identity:k(r);for(var u=r.call(e,t),i=0,a=n.length;a>i;){var o=i+a>>>1;u>r.call(e,n[o])?i=o+1:a=o}return i},w.toArray=function(n){return n?w.isArray(n)?o.call(n):n.length===+n.length?w.map(n,w.identity):w.values(n):[]},w.size=function(n){return null==n?0:n.length===+n.length?n.length:w.keys(n).length},w.first=w.head=w.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:o.call(n,0,t)},w.initial=function(n,t,r){return o.call(n,0,n.length-(null==t||r?1:t))},w.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:o.call(n,Math.max(n.length-t,0))},w.rest=w.tail=w.drop=function(n,t,r){return o.call(n,null==t||r?1:t)},w.compact=function(n){return w.filter(n,w.identity)};var R=function(n,t,r){return A(n,function(n){w.isArray(n)?t?a.apply(r,n):R(n,t,r):r.push(n)}),r};w.flatten=function(n,t){return R(n,t,[])},w.without=function(n){return w.difference(n,o.call(arguments,1))},w.uniq=w.unique=function(n,t,r,e){w.isFunction(t)&&(e=r,r=t,t=!1);var u=r?w.map(n,r,e):n,i=[],a=[];return A(u,function(r,e){(t?e&&a[a.length-1]===r:w.contains(a,r))||(a.push(r),i.push(n[e]))}),i},w.union=function(){return w.uniq(c.apply(e,arguments))},w.intersection=function(n){var t=o.call(arguments,1);return w.filter(w.uniq(n),function(n){return w.every(t,function(t){return w.indexOf(t,n)>=0})})},w.difference=function(n){var t=c.apply(e,o.call(arguments,1));return w.filter(n,function(n){return!w.contains(t,n)})},w.zip=function(){for(var n=o.call(arguments),t=w.max(w.pluck(n,"length")),r=Array(t),e=0;t>e;e++)r[e]=w.pluck(n,""+e);return r},w.object=function(n,t){if(null==n)return{};for(var r={},e=0,u=n.length;u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},w.indexOf=function(n,t,r){if(null==n)return-1;var e=0,u=n.length;if(r){if("number"!=typeof r)return e=w.sortedIndex(n,t),n[e]===t?e:-1;e=0>r?Math.max(0,u+r):r}if(y&&n.indexOf===y)return n.indexOf(t,r);for(;u>e;e++)if(n[e]===t)return e;return-1},w.lastIndexOf=function(n,t,r){if(null==n)return-1;var e=null!=r;if(b&&n.lastIndexOf===b)return e?n.lastIndexOf(t,r):n.lastIndexOf(t);for(var u=e?r:n.length;u--;)if(n[u]===t)return u;return-1},w.range=function(n,t,r){1>=arguments.length&&(t=n||0,n=0),r=arguments[2]||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=0,i=Array(e);e>u;)i[u++]=n,n+=r;return i},w.bind=function(n,t){if(n.bind===j&&j)return j.apply(n,o.call(arguments,1));var r=o.call(arguments,2);return function(){return n.apply(t,r.concat(o.call(arguments)))}},w.partial=function(n){var t=o.call(arguments,1);return function(){return n.apply(this,t.concat(o.call(arguments)))}},w.bindAll=function(n){var t=o.call(arguments,1);return 0===t.length&&(t=w.functions(n)),A(t,function(t){n[t]=w.bind(n[t],n)}),n},w.memoize=function(n,t){var r={};return t||(t=w.identity),function(){var e=t.apply(this,arguments);return w.has(r,e)?r[e]:r[e]=n.apply(this,arguments)}},w.delay=function(n,t){var r=o.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},w.defer=function(n){return w.delay.apply(w,[n,1].concat(o.call(arguments,1)))},w.throttle=function(n,t){var r,e,u,i,a=0,o=function(){a=new Date,u=null,i=n.apply(r,e)};return function(){var c=new Date,l=t-(c-a);return r=this,e=arguments,0>=l?(clearTimeout(u),u=null,a=c,i=n.apply(r,e)):u||(u=setTimeout(o,l)),i}},w.debounce=function(n,t,r){var e,u;return function(){var i=this,a=arguments,o=function(){e=null,r||(u=n.apply(i,a))},c=r&&!e;return clearTimeout(e),e=setTimeout(o,t),c&&(u=n.apply(i,a)),u}},w.once=function(n){var t,r=!1;return function(){return r?t:(r=!0,t=n.apply(this,arguments),n=null,t)}},w.wrap=function(n,t){return function(){var r=[n];return a.apply(r,arguments),t.apply(this,r)}},w.compose=function(){var n=arguments;return function(){for(var t=arguments,r=n.length-1;r>=0;r--)t=[n[r].apply(this,t)];return t[0]}},w.after=function(n,t){return 0>=n?t():function(){return 1>--n?t.apply(this,arguments):void 0}},w.keys=_||function(n){if(n!==Object(n))throw new TypeError("Invalid object");var t=[];for(var r in n)w.has(n,r)&&(t[t.length]=r);return t},w.values=function(n){var t=[];for(var r in n)w.has(n,r)&&t.push(n[r]);return t},w.pairs=function(n){var t=[];for(var r in n)w.has(n,r)&&t.push([r,n[r]]);return t},w.invert=function(n){var t={};for(var r in n)w.has(n,r)&&(t[n[r]]=r);return t},w.functions=w.methods=function(n){var t=[];for(var r in n)w.isFunction(n[r])&&t.push(r);return t.sort()},w.extend=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]=t[r]}),n},w.pick=function(n){var t={},r=c.apply(e,o.call(arguments,1));return A(r,function(r){r in n&&(t[r]=n[r])}),t},w.omit=function(n){var t={},r=c.apply(e,o.call(arguments,1));for(var u in n)w.contains(r,u)||(t[u]=n[u]);return t},w.defaults=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)null==n[r]&&(n[r]=t[r])}),n},w.clone=function(n){return w.isObject(n)?w.isArray(n)?n.slice():w.extend({},n):n},w.tap=function(n,t){return t(n),n};var I=function(n,t,r,e){if(n===t)return 0!==n||1/n==1/t;if(null==n||null==t)return n===t;n instanceof w&&(n=n._wrapped),t instanceof w&&(t=t._wrapped);var u=l.call(n);if(u!=l.call(t))return!1;switch(u){case"[object String]":return n==t+"";case"[object Number]":return n!=+n?t!=+t:0==n?1/n==1/t:n==+t;case"[object Date]":case"[object Boolean]":return+n==+t;case"[object RegExp]":return n.source==t.source&&n.global==t.global&&n.multiline==t.multiline&&n.ignoreCase==t.ignoreCase}if("object"!=typeof n||"object"!=typeof t)return!1;for(var i=r.length;i--;)if(r[i]==n)return e[i]==t;r.push(n),e.push(t);var a=0,o=!0;if("[object Array]"==u){if(a=n.length,o=a==t.length)for(;a--&&(o=I(n[a],t[a],r,e)););}else{var c=n.constructor,f=t.constructor;if(c!==f&&!(w.isFunction(c)&&c instanceof c&&w.isFunction(f)&&f instanceof f))return!1;for(var s in n)if(w.has(n,s)&&(a++,!(o=w.has(t,s)&&I(n[s],t[s],r,e))))break;if(o){for(s in t)if(w.has(t,s)&&!a--)break;o=!a}}return r.pop(),e.pop(),o};w.isEqual=function(n,t){return I(n,t,[],[])},w.isEmpty=function(n){if(null==n)return!0;if(w.isArray(n)||w.isString(n))return 0===n.length;for(var t in n)if(w.has(n,t))return!1;return!0},w.isElement=function(n){return!(!n||1!==n.nodeType)},w.isArray=x||function(n){return"[object Array]"==l.call(n)},w.isObject=function(n){return n===Object(n)},A(["Arguments","Function","String","Number","Date","RegExp"],function(n){w["is"+n]=function(t){return l.call(t)=="[object "+n+"]"}}),w.isArguments(arguments)||(w.isArguments=function(n){return!(!n||!w.has(n,"callee"))}),"function"!=typeof/./&&(w.isFunction=function(n){return"function"==typeof n}),w.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},w.isNaN=function(n){return w.isNumber(n)&&n!=+n},w.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"==l.call(n)},w.isNull=function(n){return null===n},w.isUndefined=function(n){return n===void 0},w.has=function(n,t){return f.call(n,t)},w.noConflict=function(){return n._=t,this},w.identity=function(n){return n},w.times=function(n,t,r){for(var e=Array(n),u=0;n>u;u++)e[u]=t.call(r,u);return e},w.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))};var M={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","/":"&#x2F;"}};M.unescape=w.invert(M.escape);var S={escape:RegExp("["+w.keys(M.escape).join("")+"]","g"),unescape:RegExp("("+w.keys(M.unescape).join("|")+")","g")};w.each(["escape","unescape"],function(n){w[n]=function(t){return null==t?"":(""+t).replace(S[n],function(t){return M[n][t]})}}),w.result=function(n,t){if(null==n)return null;var r=n[t];return w.isFunction(r)?r.call(n):r},w.mixin=function(n){A(w.functions(n),function(t){var r=w[t]=n[t];w.prototype[t]=function(){var n=[this._wrapped];return a.apply(n,arguments),D.call(this,r.apply(w,n))}})};var N=0;w.uniqueId=function(n){var t=++N+"";return n?n+t:t},w.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var T=/(.)^/,q={"'":"'","\\":"\\","\r":"r","\n":"n","	":"t","\u2028":"u2028","\u2029":"u2029"},B=/\\|'|\r|\n|\t|\u2028|\u2029/g;w.template=function(n,t,r){var e;r=w.defaults({},r,w.templateSettings);var u=RegExp([(r.escape||T).source,(r.interpolate||T).source,(r.evaluate||T).source].join("|")+"|$","g"),i=0,a="__p+='";n.replace(u,function(t,r,e,u,o){return a+=n.slice(i,o).replace(B,function(n){return"\\"+q[n]}),r&&(a+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'"),e&&(a+="'+\n((__t=("+e+"))==null?'':__t)+\n'"),u&&(a+="';\n"+u+"\n__p+='"),i=o+t.length,t}),a+="';\n",r.variable||(a="with(obj||{}){\n"+a+"}\n"),a="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{e=Function(r.variable||"obj","_",a)}catch(o){throw o.source=a,o}if(t)return e(t,w);var c=function(n){return e.call(this,n,w)};return c.source="function("+(r.variable||"obj")+"){\n"+a+"}",c},w.chain=function(n){return w(n).chain()};var D=function(n){return this._chain?w(n).chain():n};w.mixin(w),A(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=e[n];w.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!=n&&"splice"!=n||0!==r.length||delete r[0],D.call(this,r)}}),A(["concat","join","slice"],function(n){var t=e[n];w.prototype[n]=function(){return D.call(this,t.apply(this._wrapped,arguments))}}),w.extend(w.prototype,{chain:function(){return this._chain=!0,this},value:function(){return this._wrapped}})}).call(this);

//     Underscore.js 1.6.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.6.0';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return obj;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
    return obj;
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    any(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(predicate, context);
    each(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, function(value, index, list) {
      return !predicate.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(predicate, context);
    each(obj, function(value, index, list) {
      if (!(result = result && predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
    each(obj, function(value, index, list) {
      if (result || (result = predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    var result = -Infinity, lastComputed = -Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed > lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    var result = Infinity, lastComputed = Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed < lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Shuffle an array, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return value;
    return _.property(value);
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    iterator = lookupIterator(iterator);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iterator, context) {
      var result = {};
      iterator = lookupIterator(iterator);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    _.has(result, key) ? result[key].push(value) : result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    for (var i = 0, length = input.length; i < length; i++) {
      var value = input[i];
      if (!_.isArray(value) && !_.isArguments(value)) {
        if (!strict) output.push(value);
      } else if (shallow) {
        push.apply(output, value);
      } else {
        flatten(value, shallow, strict, output);
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Split an array into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = lookupIterator(predicate);
    var pass = [], fail = [];
    each(obj, function(elem) {
      (predicate.call(context, elem) ? pass : fail).push(elem);
    });
    return [pass, fail];
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (array == null) return [];
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var result = [];
    var seen = [];
    for (var i = 0, length = array.length; i < length; i++) {
      var value = array[i];
      if (iterator) value = iterator.call(context, value, i, array);
      if (isSorted ? (!i || seen !== value) : !_.contains(seen, value)) {
        if (isSorted) seen = value;
        else seen.push(value);
        result.push(array[i]);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true, []));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.contains(other, item);
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(slice.call(arguments, 1), true, true, []);
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, 'length').concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error('bindAll must be passed function names');
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;
      if (last < wait) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function () {
      return value;
    };
  };

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    return function(obj) {
      if (obj === attrs) return true; //avoid comparing an object to itself.
      for (var key in attrs) {
        if (attrs[key] !== obj[key])
          return false;
      }
      return true;
    }
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() { return new Date().getTime(); };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // // JavaScript micro-templating, similar to John Resig's implementation.
  // // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // // and correctly escapes quotes within interpolated code.
  // _.template = function(text, data, settings) {
  //   var render;
  //   settings = _.defaults({}, settings, _.templateSettings);

  //   // Combine delimiters into one regular expression via alternation.
  //   var matcher = new RegExp([
  //     (settings.escape || noMatch).source,
  //     (settings.interpolate || noMatch).source,
  //     (settings.evaluate || noMatch).source
  //   ].join('|') + '|$', 'g');

  //   // Compile the template source, escaping string literals appropriately.
  //   var index = 0;
  //   var source = "__p+='";
  //   text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
  //     source += text.slice(index, offset)
  //       .replace(escaper, function(match) { return '\\' + escapes[match]; });

  //     if (escape) {
  //       source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
  //     }
  //     if (interpolate) {
  //       source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
  //     }
  //     if (evaluate) {
  //       source += "';\n" + evaluate + "\n__p+='";
  //     }
  //     index = offset + match.length;
  //     return match;
  //   });
  //   source += "';\n";

  //   // If a variable is not specified, place data values in local scope.
  //   if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

  //   source = "var __t,__p='',__j=Array.prototype.join," +
  //     "print=function(){__p+=__j.call(arguments,'');};\n" +
  //     source + "return __p;\n";

  //   try {
  //     render = new Function(settings.variable || 'obj', '_', source);
  //   } catch (e) {
  //     e.source = source;
  //     throw e;
  //   }

  //   if (data) return render(data, _);
  //   var template = function(data) {
  //     return render.call(this, data, _);
  //   };

  //   // Provide the compiled function source as a convenience for precompilation.
  //   template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

  //   return template;
  // };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}).call(this);

define('underscorenc', ['underscore'], function (_) {
    // WSi 20140815: this looks like a good place for underscore extentions...

    // deep extending and deep clonning of objects
    _.mixin({
        deepExtend: function (obj) {
            _.each(Array.prototype.slice.call(arguments, 1), function (source) {
                var s, d;
                for (var prop in source) {
                    s = source[prop];
                    if (_.isObject(s) && (s.constructor === Object || s.constructor === Array)) {
                        d = obj[prop] = obj[prop] || new s.constructor();
                        _.deepExtend(d, s);
                    }
                    else if (source.hasOwnProperty(prop)) obj[prop] = s;
                }
            });
            return obj;
        },

        deepClone: function (obj) {
            return _.deepExtend({}, obj);
        },

        /*
         Usage: _.isArrayOf(['tag1', {value: 'tag2'}], _.isString, _.isObject);
         Above passes as array contains both sting and objects.

         Usage: _.isArrayOf(['tag1', {value: 'tag2'}], _.isString, _.isNumber);
         Above fails as array contains object and we accept only string or numbers
         */
        isArrayOf: function (arr, validationFunctions) {
            var valFuns = Array.prototype.slice.call(arguments, 1);
            if (valFuns.length === 0 || !_.every(valFuns, function (valFun) {
                    return _.isFunction(valFun);
                })) {
                throw "This method takes an array and one or more validation functions.";
            }

            return _.isArray(arr) &&
                arr.length > 0 &&
                _.every(arr, function (item) {
                        return _.some(valFuns, function (valFun) {
                            return valFun(item);
                        });
                    }
                );
        },

        isArrayOfStrings: function (arr) {
            // return  _.isArray(obj) &&
            //         obj.length > 0 &&
            //         _.every(obj, function(item) {return _.isString(item);});
            return _.isArrayOf(arr, _.isString);
        },

        isObjectNotArray: function (obj) {
            return _.isObject(obj) && !_.isArray(obj);
        },

        isNullUndef: function (obj) {
            return _.isNull(obj) || _.isUndefined(obj);
        },

        isFalsy: function (obj) {
            return _.isNullUndef(obj) || obj === false || obj === 0 || _.isEmpty(obj);
        },

        // example use:
        // _.getFirstIndex(request.sub, function(item) {return item.head.isMain;});
        // above finds if any of the elements in the sub array meets the condition in the
        // functions passed as a second argument
        getFirstIndex: function (arr, fun) {
            if (!_.isArray(arr)) return null;
            if (!_.isFunction(fun))
                throw "Callback with predicate is required, i.e. function(item) {return item.isMain;}";
            var idx = null;
            _.some(arr, function (item, i) {
                if (fun(item)) {
                    idx = i;
                    return true;
                }
                return false;
            });
            return idx;
        },

        // _.wrapInto("name", "\"") // gives '"name"' (the \" is just escape in this example)
        wrapInto: function (string, character) {
            if (_.isNullUndef(string) || _.isNullUndef(character)) {
                throw "string and char are required";
            }
            return character.toString() + string.toString() + character.toString();
        },

        isNonEmptyString: function (string) {
            return _.isString(string) && string.length > 0;
        },

        isNonEmptyArray: function (array) {
            return _.isArray(array) && !_.isEmpty(array);
        },

        reorderArray: function (orderArray, inputArray) {
            var ret = [], i;
            for (i = 0; i < orderArray.length; i++) {
                ret[i] = inputArray[orderArray[i]];
            }
            for (i = 0; i < inputArray.length; i++) {
                if (orderArray.indexOf(i) === -1) {
                    ret.push(inputArray[i]);
                }
            }
            return ret;
        },

        getStringOfLen: function (len, ch) {
            return _.map(_.range(len), function () {
                return ch || ' ';
            }).join('');
        }

    });

    return _.noConflict();
});
define(
    'namedMaps', [],

    function () {

        /* common used maps */
        var namedMaps = {
            'object': function (index) {
                index = index || 1;
                return {argIndex: index, c: ["object"]};
            },

            'error': function (index) {
                index = index || 2;

                return {
                    argIndex: index,
                    p: 'errorHandler',
                    c: [{"len": 3}, "function"]
                };
            },

            'success': function (index) {
                index = index || 1;

                return {
                    argIndex: index,
                    p: 'successHandler',
                    c: ["function"]
                };
            }
        };

        return namedMaps;
    });
define(
    'namedValidators', [],

    function () {

        /* common used maps */
        var namedValidators = {
            'handlers': {p: ['successHandler', 'errorHandler'], c: ["function"]}
        };

        return namedValidators;
    });

//IC - leaving it separate from other defaults because it can become pure JSON at some point
define('metadata', [],function (){
    return {
        "Annotation": {
            "navigationProperties": {
                "Annotation_parent_Source": {
                    "navigationProperty": "parent",
                    "field": "parent_id"
                },
                "Annotation_createdByTool_Source": {
                    "navigationProperty": "createdByTool",
                    "field": "created_by_tool_id"
                },
                "Annotation_container_Source": {
                    "navigationProperty": "container",
                    "field": "container_id"
                },
                "Tag_annotation_Target": {
                    "navigationProperty": "tags"
                },
                "AnnotationSharedWith_annotation_Target": {
                    "navigationProperty": "shared_with"
                }
            },
            "fields": [
                {
                    "name": "annotation_id",
                    "type": "Number",
                    "nullable": "false"
                },
                {
                    "name": "annotator_id",
                    "type": "Number",
                    "nullable": "false"
                },
                {
                    "name": "content_id",
                    "maxLength": "60",
                    "type": "String",
                    "nullable": "false"
                },
                {
                    "name": "object_id",
                    "maxLength": "32",
                    "type": "String"
                },
                {
                    "name": "type_id",
                    "type": "Number",
                    "nullable": "false"
                },
                {
                    "name": "l0",
                    "maxLength": "10",
                    "type": "String"
                },
                {
                    "name": "l1",
                    "maxLength": "10",
                    "type": "String"
                },
                {
                    "name": "l2",
                    "maxLength": "10",
                    "type": "String"
                },
                {
                    "name": "l3",
                    "maxLength": "10",
                    "type": "String"
                },
                {
                    "name": "l4",
                    "maxLength": "10",
                    "type": "String"
                },
                {
                    "name": "l5",
                    "maxLength": "10",
                    "type": "String"
                },
                {
                    "name": "l6",
                    "maxLength": "10",
                    "type": "String"
                },
                {
                    "name": "title",
                    "maxLength": "300",
                    "type": "String"
                },
                {
                    "name": "body_text",
                    "maxLength": "10000",
                    "type": "String"
                },
                {
                    "name": "body_url",
                    "maxLength": "500",
                    "type": "String"
                },
                {
                    "name": "start_pos",
                    "type": "Number",
                    "nullable": "false"
                },
                {
                    "name": "end_pos",
                    "type": "Number",
                    "nullable": "false"
                },
                {
                    "name": "coord_x",
                    "type": "Number",
                    "nullable": "false"
                },
                {
                    "name": "coord_y",
                    "type": "Number",
                    "nullable": "false"
                },
                {
                    "name": "style",
                    "maxLength": "500",
                    "type": "String"
                },
                {
                    "name": "color",
                    "maxLength": "10",
                    "type": "String"
                },
                {
                    "name": "parent_id",
                    "type": "Number"
                },
                {
                    "name": "visibility_id",
                    "type": "Number",
                    "nullable": "false"
                },
                {
                    "name": "created_by_tool_id",
                    "type": "Number",
                    "nullable": "false"
                },
                {
                    "name": "container_id",
                    "type": "Number"
                },
                {
                    "name": "path",
                    "maxLength": "500",
                    "type": "String"
                },
                {
                    "name": "flag_id",
                    "type": "Number",
                    "nullable": "false"
                },
                {
                    "name": "data",
                    "maxLength": "10000",
                    "type": "String"
                },
                {
                    "name": "created_date",
                    "type": "Date"
                },
                {
                    "name": "updated_date",
                    "type": "Date"
                },
                {
                    "name": "deleted_date",
                    "type": "Date"
                },
                {
                    "name": "Version",
                    "maxLength": "8",
                    "type": "Edm.Binary",
                    "nullable": "false"
                },
                {
                    "name": "hmh_id",
                    "maxLength": "32",
                    "type": "String"
                }
            ],
            "keyField": "annotation_id"
        },
        "Tag": {
            "navigationProperties": {
                "Tag_annotation_Source": {
                    "navigationProperty": "annotation",
                    "field": "annotation_id"
                }
            },
            "fields": [
                {
                    "name": "tag_id",
                    "type": "Number",
                    "nullable": "false"
                },
                {
                    "name": "annotation_id",
                    "type": "Number",
                    "nullable": "false"
                },
                {
                    "name": "annotator_id",
                    "type": "Number",
                    "nullable": "false"
                },
                {
                    "name": "content_id",
                    "maxLength": "60",
                    "type": "String"
                },
                {
                    "name": "value",
                    "maxLength": "60",
                    "type": "String",
                    "nullable": "false"
                },
                {
                    "name": "Version",
                    "maxLength": "8",
                    "type": "Edm.Binary",
                    "nullable": "false"
                }
            ],
            "keyField": "tag_id"
        },
        "Container": {
            "navigationProperties": {
                "Container_parent_Source": {
                    "navigationProperty": "parent",
                    "field": "parent_id"
                }
            },
            "fields": [
                {
                    "name": "id",
                    "type": "Number",
                    "nullable": "false"
                },
                {
                    "name": "annotator_id",
                    "type": "Number",
                    "nullable": "false"
                },
                {
                    "name": "parent_id",
                    "type": "Number"
                },
                {
                    "name": "created_date",
                    "type": "Date",
                    "nullable": "false"
                },
                {
                    "name": "title",
                    "maxLength": "50",
                    "type": "String"
                },
                {
                    "name": "summary_text",
                    "maxLength": "50",
                    "type": "String"
                },
                {
                    "name": "order_number",
                    "type": "Number"
                },
                {
                    "name": "Version",
                    "maxLength": "8",
                    "type": "Edm.Binary",
                    "nullable": "false"
                },
                {
                    "name": "submitted_for_annotator_id",
                    "type": "Number"
                },
                {
                    "name": "submitted_status",
                    "type": "Number",
                    "nullable": "false"
                },
                {
                    "name": "submitted_date",
                    "type": "Date"
                }
            ],
            "keyField": "id"
        },
        "AnnotationSharedWith": {
            "navigationProperties": {
                "AnnotationSharedWith_annotation_Source": {
                    "navigationProperty": "annotation",
                    "field": "annotation_id"
                }
            },
            "fields": [
                {
                    "name": "id",
                    "type": "Number",
                    "nullable": "false"
                },
                {
                    "name": "annotation_id",
                    "type": "Number",
                    "nullable": "false"
                },
                {
                    "name": "annotator_id",
                    "type": "Number",
                    "nullable": "false"
                },
                {
                    "name": "annotation_annotator_id",
                    "type": "Number",
                    "nullable": "false"
                },
                {
                    "name": "created_date",
                    "type": "Date"
                },
                {
                    "name": "Version",
                    "maxLength": "8",
                    "type": "Edm.Binary",
                    "nullable": "false"
                }
            ],
            "keyField": "id"
        }
    };
});
/*
 * IC: In my opinion, config and defaults (or whatever is name we choose) 
 * should be completely separated, and a bunch of things should go here (not just service settings)
 * 
 * Example: ERROR_DOCUMENTATION_URL: 'http://dubconf.hmhpub.com:8080/display/DP2/Error+handling'...
 * 
 * This is not just because of the esthetic reasons: constants are arriving to JS soon
 * (already supported in latest versions of Chrome, FF and IE)
 * and at some point ie8 won't have to be supported, so this would be more future proof
 * solution :)
 * 
 */
define('defaults', ['metadata'], function (metadata) {
    return {
        AnnotationTypes: [
            {
                'id': 1,
                'name': 'Bookmark'
            },
            {
                'id': 2,
                'name': 'Highlight'
            },
            {
                'id': 3,
                'name': 'Static Note'
            },
            {
                'id': 4,
                'name': 'Interactive Note'
            },
            {
                'id': 5,
                'name': 'HighlightMX'
            },
            {
                'id': 6,
                'name': 'StaticNoteMX'
            },
            {
                'id': 7,
                'name': 'TeacherComment'
            },
            {
                'id': 8,
                'name': 'Automatic Bookmark'
            },
            {
                'id': 9,
                'name': 'eBook Answer'
            },
            {
                'id': 10,
                'name': 'Student Cover Note'
            },
            {
                'id': 11,
                'name': 'Teacher Cover Note'
            },
            {
                id: 12,
                name: "Graphic Organizer"
            },
            {
                id: 13,
                name: "Maps Wizard"
            },
            {
                id: 14,
                name: "Config Data"
            },
            {
                id: 15,
                name: "Reporting"
            },
            {
                id: 16,
                name: "Enhanced Answer"
            }
        ],
        AppSettings: {
            AWSMaxLenghtUploadedFileKB: "20481",
            AWSMaxObjectsClonable: "50",
            ETagMaxLengthInChars: "23", // former ETAG_CHAR_LENGTH
            MaxChangesetCount: "50", // former ODATA_BATCH_LIMIT
            MaxCountOnInsert: "50",
            MaxExpandCount: "3",
            MaxExpandDepth: "3",
            MaxResults: "50", // former MAX_RESULTS_NO
            UrlExpirySeconds: "1800"
        },
        ClientTools: {
            'Undefined': 0,
            'eBook': 1,
            'Notebook': 2,
            'MX': 4,
            'Portfolio': 8,
            'DLO': 16
        },
        FieldsSettableOnCreationOnly: {
            Annotations: ["type_id", "created_by_tool_id"]
        },
        Metadata: metadata,
        ReadOnlyFields: {
            Annotations: ["annotation_id", "annotator_id", "created_date", "updated_date"],
            Containers: ["id", "annotator_id", "created_date"],
            Tags: ["tag_id", "annotator_id"]
        },
        RequiredFields: {
            Annotations: ["type_id", "content_id"],
            Tags: ["value", "annotation_id"]
        },
        ContainerStatus: {
            'NotSubmitted': 0,
            'Submitted': 1,
            'Returned': 2
        }
    };
});
/** @module config */
define(
    'config', ['namedMaps', 'namedValidators', 'defaults'],
    function (namedMaps, namedValidators, defaults) {
        /*
         * Contains all commonly used values and settings
         * @name config
         * @requires 'namedMaps', 'namedValidators', 'metadata'
         * @returns config Object
         */

        var undefNum = -1,
            queryParams = {
                userId: 'user_id',
                userIds: 'user_ids',
                userGuid: 'user_guid',
                submittedForUserId: 'submitted_for_user_id',
                contentId: 'content_id',
                objectId: 'object_id',
                typeId: 'type_id',
                clientId: 'client_id',
                containerId: 'container_id',
                recursive: 'recursive',
                submitTo: 'submitTo',
                option: 'option',
                classId: 'class_id',
                text: 'text',
                annotationId: 'annotation_id',
                visibility_id: 'visibility_id'
            };

        return {
            API_VERSION: { client: "2.5.3", service: 'Service version is not available.' },
            UNDEF_NUM: undefNum,
            DEBUG_MODE_ON: true,

            SERVER_URL: "/",
            //SERVER_URL        : "http://dubv-dpdiweb01.dubeng.local/", // <---- DEV
            //SERVER_URL        : "http://dubv-dpqaweb01.dubeng.local/", // <---- QA
            //SERVER_URL        : "http://107.23.243.236/",              // <---- INT

            SERVICE_PREFIX: "api/data/",
            SERVICE_DPS: "services/",
            SERVICE_APP_SETTINGS: "AppSettings",
            //Map widget endpoints
            ACTION_STORAGE_UPLOAD_URL: 'action/storage/upload',
            ACTION_DOWNLOAD_GET_URL: 'action/download/geturl/?annotation_id=',
            ACTION_UPDATE_URL: 'action/update/UpdateObjectAndAnnotationByAnnotationId/?annotation_id=',
            ACTION_DELETE_URL: 'action/delete/RemoveObjectAndAnnotationByAnnotationId/?annotation_id=',

            INTERNAL_DEFAULTS: {
                SERVER_URL: "/",
                USE_POST_TUNNELING: true, // Default is to use post tunneling (for prod environments)
                TOKEN_AUTHN: null, // If set, the token with user information will be passed along in headers of each request (for dev only)
                FORCE_ODATA_VERSION: undefined,
                CORS: false,
                SUPPRESS_VALIDATION: false,
                REQUEST_TIMEOUT: 20000, // After this timout API will return the timeout error to the client app
                NEXT_LINK_DOMAIN_STRIPPING: true,
                CLIENT_ID: undefNum,
                USE_CAS_V2: false,

                DEFAULT_PARSE_DATE: false, // If false then date is returned as /Date.toString()/ string, if true date returned as JS Date object.
                PLATFORM_KEEPALIVE_DEFAULT_DELAY: 840000
            },

            // consts defs
            REQ_TYPE_GET: "GET",
            REQ_TYPE_POST: "POST",
            REQ_TYPE_PUT: "PUT",
            REQ_TYPE_MERGE: "MERGE",
            REQ_TYPE_DELETE: "DELETE",

            ANNO2_WITH_NO_SHARED: 0,
            ANNO2_WITH_SHARED_ONLY: 1,
            ANNO2_WITH_SHARED: 2,
            ANNO2_MY_NOT_SHARED_TO_OTHERS: 3,

            TRANSPORT_NAMES: {
                ODATA: 'oData',
                AJAX: 'ajax'
            },

            NAMED_MAPS: namedMaps,
            NAMED_VALIDATORS: namedValidators,
            CRUD: {
                create: 'create',
                update: 'update',
                remove: 'remove',
                find: 'find',
                findOne: 'findOne'
            },

            CUSTOM_ENDPOINTS: {
                FIND_COMMENTS: 'findComments',
                DISTINCT_TAGS: 'getDistinctTags',
                FIND_ALL_ANNOTATIONS_BY_TEXT: 'findAllAnnotationsByText',
                GET_SUBMITTED: 'getSubmitted',
                GET_USERS_FOR_ANNOTATION_ID: 'getUsersForAnnotationId',
                FIND_COMMENTED_ANNOTATIONS: 'findCommentedAnnotations',
                //Map widget names
                CREATE_IMAGE: 'createImage',
                FIND_IMAGE: 'findImage',
                UPDATE_IMAGE: 'updateImage',
                REMOVE_IMAGE: 'removeImage'
            },

            COLLECTIONS: {
                annotations: {
                    name: 'annotations',
                    entity: 'Annotation',
                    nameUppercase: 'Annotations',
                    expandName: 'annotation'
                },
                tags: {name: 'tags', entity: 'Tag', nameUppercase: 'Tags', expandName: 'tags'},
                containers: {
                    name: 'containers',
                    entity: 'Container',
                    nameUppercase: 'Containers',
                    expandName: 'container'
                },
                clientIDs: {name: 'client_tools', entity: 'ClientTool', nameUppercase: 'ClientTools'},
                annotationSharedWith: {
                    name: 'annotationSharedWith',
                    entity: 'AnnotationSharedWith',
                    nameUppercase: 'AnnotationSharedWith',
                    expandName: 'shared_with'
                },
                entityless: {name: 'entityless', entity: 'entityless', nameUppercase: 'entityless'}
            },

            QUERY_PARAMS: queryParams,
            QUERY_PARAMS_ASSIGNMENTS: {
                getDistinctTags: [
                    queryParams.content_id,
                    queryParams.client_id,
                    queryParams.container_id,
                    queryParams.recursive
                ]
            },

            FORCE_ODATA_VERSION: undefined,
            FORCE_DEFAULT_SERVICE_SETTINGS: false,
            ERROR_DOCUMENTATION_URL: 'http://dubconf.hmhpub.com:8080/display/DP2/Error+handling',
            ERROR_DOCUMENTATION_ANCHOR: '#Errorhandling-',
            EXPAND: '$expand=',

            EXPANDING_METHODS: {
                mySharedToOthers: 'mySharedToOthers',
                withTags: 'withTags',
                withShared: 'withShared',
                withSharedOnly: 'withSharedOnly',
                withSharedAnnotations: 'withSharedAnnotations'
            },

            CONFLICTED_METHODS: {
                //list of methods divided by operations that cannot be called along with stated methods
                find: {
                    myNotSharedToOthers: {
                        name: 'myNotSharedToOthers',
                        methods: ['getFileUrl', 'findImage', 'mySharedToOthers', 'withShared', 'withSharedOnly']
                    },
                    mySharedToOthers: {
                        name: 'mySharedToOthers',
                        methods: ['getFileUrl', 'findImage', 'myNotSharedToOthers', 'withShared', 'withSharedOnly']
                    },
                    withShared: {
                        name: 'withShared',
                        methods: ['getFileUrl', 'findImage', 'myNotSharedToOthers', 'mySharedToOthers', 'withSharedOnly']
                    },
                    withSharedOnly: {
                        name: 'withSharedOnly',
                        methods: ['getFileUrl', 'findImage', 'myNotSharedToOthers', 'withShared', 'mySharedToOthers']
                    },
                    findImage: {
                        name: 'findImage',
                        methods: ['withTags', 'myNotSharedToOthers', 'mySharedToOthers', 'withShared', 'withSharedOnly']
                    },
                    getFileUrl: {
                        name: 'getFileUrl',
                        methods: ['withTags', 'myNotSharedToOthers', 'mySharedToOthers', 'withShared', 'withSharedOnly']
                    },
                    withTags: {
                        name: 'withTags',
                        methods: ['getFileUrl', 'findImage']
                    }
                },
                create: {
                    createImage: {
                        name: 'createImage',
                        methods: ['tags', 'childAnnotations']

                    },
                    createWithFile: {
                        name: 'createWithFile',
                        methods: ['tags', 'childAnnotations']

                    },
                    tags: {
                        name: 'tags',
                        methods: ['createImage', 'createWithFile']
                    },
                    childAnnotations: {
                        name: 'childAnnotations',
                        methods: ['createImage', 'createWithFile']
                    }
                }

            },

            //will be populated either from the service or from the default values in default.js
            SETTINGS: {
                //maybe we'll want to add helper method to convert names:  AppSettings -> APP_SETTINGS
                AnnotationTypes: [],
                AppSettings: {},
                ClientTools: {},
                FieldsSettableOnCreationOnly: {},
                Metadata: {},
                ReadOnlyFields: {},
                RequiredFields: {},
                ContainerStatus: {},
                //Internal settings
                ExcludeNonServiceSettingsProperties: ['Version'], // we don't need service version
                ExcludeFromServiceSettingsParsing: ['AnnotationTypes', 'ClientTools', 'Metadata'],
                Source: '',
                serviceSettingsStatuses: []
            },
            SETTINGS_SOURCES: {
                CLIENT_DEFAULTS: 'client_defaults',
                SERVICE_WITH_CLIENT_DEFAULTS: 'service_with_client_defaults',
                SERVICE: 'service',
                FORCED_CLIENT_DEFAULTS: 'forced_client_defaults'
            },

            DEFAULTS: defaults,

            API_INITIALIZED: false
        };
    });

define('errorList', [],function() {
    return [
          { 'code': 'API_ERR_AJAX_1', 'error': 'method {0} expects {1} parameters {2}' } //e
        , { 'code': 'API_ERR_AJAX_2', 'error': '{0} is required to use {1}' } //e
        , { 'code': 'API_ERR_AJAX_3', 'error': '{0} is already running, stop it with {1} first!' } //e
        , { 'code': 'API_ERR_GENERAL_1', 'error': 'param {0} for method {1} must be {2}, but it is {3} instead' } //e
        , { 'code': 'API_ERR_GENERAL_2', 'error': 'The {0} provided: "{1}" is not supported by data persistence!' } //e
        , { 'code': 'API_ERR_GENERAL_3', 'error': 'Missing required parameter {0} when calling {1}.' }
        , { 'code': 'API_ERR_GENERAL_4', 'error': 'The {0} endpoint is not available when using CAS V2.' }

        //,{ 'code': 'API_ERR_API_HELPERS_1', 'error': 'FindAPI: Find methods accepts only (filters) object.'}
        //,{ 'code': 'API_ERR_API_HELPERS_2', 'error': 'FindAPI: Fields method accepts only string or array of strings representing field names that will be returned as response.'}
        //,{ 'code': 'API_ERR_API_HELPERS_3', 'error': 'FindAPI: limit method takes limitFrom as first argument and it should be a number.'}
        //,{ 'code': 'API_ERR_API_HELPERS_4', 'error': 'FindAPI: limit method takes limitCount as second argument and it should be a number.'}
        //,{ 'code': 'API_ERR_API_HELPERS_5', 'error': 'FindAPI: order method takes a string or array of strings representing field names.'}
        //,{ 'code': 'API_ERR_API_HELPERS_6', 'error': 'FindAPI: done method accepts only functions.'}
        //,{ 'code': 'API_ERR_API_HELPERS_7', 'error': 'FindAPI: fail method accepts only functions.'}

        //,{ 'code': 'API_ERR_ARGUMENTS_MAPPER_1', 'error': 'ArgumentsMapper: condition {0} is not defined in conditionsMap'}
        //,{ 'code': 'API_ERR_ARGUMENTS_MAPPER_2', 'error': 'ArgumentsMapper["{0}"]: is not defined'}
        //,{ 'code': 'API_ERR_ARGUMENTS_MAPPER_3', 'error': 'ArgumentsMapper["{0}"]: should be an array'}
        //,{ 'code': 'API_ERR_ARGUMENTS_MAPPER_4', 'error': 'ArgumentsMapper["{0}"]: no mapping rules specified for function arguments'}
        //,{ 'code': 'API_ERR_ARGUMENTS_MAPPER_5', 'error': 'ArgumentsMapper["{0}"]: rules with index="{1}" should be an array'}

        //,{ 'code': 'API_ERR_ARGUMENTS_VALIDATOR_1', 'error': 'argumentsProcessor: [prevalidate, map, validate] called before function name is set'}
        //,{ 'code': 'API_ERR_ARGUMENTS_VALIDATOR_2', 'error': '{0} is not defined in argumentsValidator'}
        //,{ 'code': 'API_ERR_ARGUMENTS_VALIDATOR_3', 'error': 'No {0} specified for {1}'}
        //,{ 'code': 'API_ERR_ARGUMENTS_VALIDATOR_4', 'error': 'throw result.message'}

        //,{ 'code': 'API_ERR_ANY_1', 'error': 'run: using Collection() is required when using Any!'}
        , { 'code': 'API_ERR_QUERY_API_1', 'error': '{0}: method {1} must be called empty or with {2} (type {3})' } //e
        , { 'code': 'API_ERR_QUERY_API_2', 'error': '{0}: param {1} is required when method {2} is used with {3}' }
        , { 'code': 'API_ERR_QUERY_API_3', 'error': '{0}: param {1} for method {2} must be {3}, but it is {4} instead' } //e
        , { 'code': 'API_ERR_QUERY_API_4', 'error': '{0}: method {1} expects {2}' } //e
        , { 'code': 'API_ERR_QUERY_API_5', 'error': '{0}: {1} method can be used only with {2} operation(s)' } //e
        , { 'code': 'API_ERR_QUERY_API_6', 'error': '{0}: {1} method cannot be used with multiple {2} passed' } //e
        , { 'code': 'API_ERR_QUERY_API_7', 'error': '{0}: {1} field is populated automatically, so {1} : {2} is invalid and it cannot be used in {3} method' } //e
        , { 'code': 'API_ERR_QUERY_API_8', 'error': 'queryAPI: {0}: operation already set, check if you mixed CRUD operations in single query' } //e
        , { 'code': 'API_ERR_QUERY_API_9', 'error': 'fields [{0}] are not allowed' }
        , { 'code': 'API_ERR_QUERY_API_10', 'error': '{0}: {1} is not a function' } //e
        , { 'code': 'API_ERR_QUERY_API_11', 'error': '{0}: {1} field is not allowed in {2} operation' } //e
        , { 'code': 'API_ERR_QUERY_API_12', 'error': 'Length of field {0} exceeds maximum allowed length (length: {1}, allowed: {2})' }
        , { 'code': 'API_ERR_QUERY_API_13', 'error': 'Annotation service API isn\'t initialized or annService.init method hasn\'t finished' }
        , { 'code': 'API_ERR_QUERY_API_14', 'error': 'method {0} can be used only with {1}' } //e
        , { 'code': 'API_ERR_QUERY_API_15', 'error': 'Operation must be set in order to call {0} function' } //e
        , { 'code': 'API_ERR_QUERY_API_16', 'error': 'method {0} can be only called once' } //e
        , { 'code': 'API_ERR_QUERY_API_17', 'error': 'fields {0} for object {1} are required' } //e
        , { 'code': 'API_ERR_QUERY_API_18', 'error': 'In batch operations, number of items in {0} and number of {1} has to be the same' } //e
        , { 'code': 'API_ERR_QUERY_API_19', 'error': 'etags: etag with value {0} and length {1} is not the right length (expected less than {2} and greater than 0)' } //e
        , { 'code': 'API_ERR_QUERY_API_20', 'error': '{0}: {1} method cannot be used with any of the following methods: {2}' } //e
        , { 'code': 'API_ERR_QUERY_API_21', 'error': 'In batch operations, number of items in {0} method has to match a numer of subrequests' } //e
        , { 'code': 'API_ERR_TRANSPORT_1', 'error': 'oDataTransport: number of batch request items have exceeded the server side imposed limit of {0}' } //e
        , { 'code': 'API_ERR_TRANSPORT_2', 'error': 'filtersParser: validate: key "{0}" is not one of valid operators: {1}' } //e
        , { 'code': 'API_ERR_TRANSPORT_3', 'error': 'filtersParser: buildComparator: could not find compare operation for key "{0}". Valid keys: {1}' } //e

    ];
});
define(
    'resetManager', ['underscorenc'],

    function (_) {

        var subscribersList = [];

        //////////////////////////////////////////////////////////////////////////////////////
        //
        // PRIVATE API
        //
        //////////////////////////////////////////////////////////////////////////////////////

        function resetSubscribers() {
            _.each(subscribersList, function (fun) {
                fun();
            });
        }

        function addSubscriber(fun) {
            if (!_.isFunction(fun)) {
                throw "ResetManager:addSubscriber: Metdhod accepts only functions.";
            }
            subscribersList.push(fun);
        }

        //////////////////////////////////////////////////////////////////////////////////////
        //
        // PUBLIC API
        //
        //////////////////////////////////////////////////////////////////////////////////////

        var resetManager = {
            resetLib: resetSubscribers,
            subscribe: addSubscriber
        };

        return resetManager;
    });
define(
    'errorManager', ['underscorenc', 'errorList', 'config', 'resetManager'],
    function(_, errors, config, resMan) {

        var errorManager = {};

        //solution seen on http://www.codeproject.com/Tips/201899/String-Format-in-JavaScript
        var renderString = function(val, args) {
            var str = val + '';
            var regex = new RegExp("{-?[0-9]+}", "g");
            return str.replace(regex, function(item) {
                var intVal = parseInt(item.substring(1, item.length - 1));
                var replace;
                if (intVal >= 0) {
                    replace = args[intVal];
                } else if (intVal === -1) {
                    replace = "{";
                } else if (intVal === -2) {
                    replace = "}";
                } else {
                    replace = "";
                }
                return replace;
            });
        };

        // WSi: no need for this after refactoring...
        // //adds request object to error manager, so it could reset all the requests
        // //for example annotations and tags for scenarios where multiple contexts are in place
        // errorManager.addRequestObject = function (request) {

        //     if (_.isArray(request) || !_.isObject(request) ||
        //         _.isUndefined(request) || _.isNull(request) || !_.has(request, 'reset')) {
        //         throw "Request object is not in right format";
        //     }

        //     if (_.isEmpty(requestObject)) {
        //         requestObject = request;
        //     }

        //     else {
        //         throw "Request object already added";
        //     }
        // };

        // errorManager.emptyRequestObject = function() {
        //     //this is called in queryAPI.run, to clear regular request, in case when there was no error
        //     requestObject = {};
        // };


        errorManager.throwError = function(code, params, index) {
            if (config.SUPPRESS_VALIDATION) {
                return;
            }

            var error = _.find(errors, function(err) {
                return err.code === code;
            });


            // _.each(resetSubscribersList, function(obj) {
            //     obj['reset'] && obj['reset'](obj);
            // });

            resMan.resetLib();
            var errorTemplate = "Code: {0} Message: {1}, Help page: {2}";

            if(_.isNumber(index)){
                errorTemplate = "Code: {0} Message: (for sub-query index " + index + ") {1}, Help page: {2}";
            }

            if (!_.isUndefined(error)) {
                var message = renderString(error.error, params);
                //throw renderString("Code: {0} Message: {1}, Help page: {2}",
                throw renderString(errorTemplate,
                [error.code, message, config.ERROR_DOCUMENTATION_URL + config.ERROR_DOCUMENTATION_ANCHOR + error.code]);
            } else {
                throw "Code not found in error messages";
            }
        };
        // errorManager.subscribeToReset = function(obj) {
        //     resetSubscribersList.push(obj);
        // };


        return errorManager;
    });
/* let's make helper for sake of work */
/* TODO: remove jquery dep, since $ used only once in "parseJSON" */
define(
    'helpers', ['underscorenc', 'config', 'errorManager'],
    function (_, config, errorManager) {

        //
        //totally internal functions
        //

        function encodeUrlString(val) {
            return encodeURIComponent(val.replace(/'/g, '%27'));
        }

        function throwError(msg, fname) {
            if (config.DEBUG_MODE_ON) throw new Error("Error in '" + fname + "': " + msg);
        }

        //
        //end internal functions
        //

        //
        //start public part
        //
        var helpers = {};

        helpers.encodeUrlString = encodeUrlString;

        helpers.isUserTokenSet = function () {
            return config.TOKEN_AUTHN != undefined;
        };

        helpers.isServiceReady = function () {

            if (!config.API_INITIALIZED && !config.SUPPRESS_VALIDATION) {
                //Annotation service API isn\'t initialized or annService.init method hasn\'t called success or error callbacks
                this.throwQueryError('API_ERR_QUERY_API_13', null);
            }
            // temporarily removing a check here to get the cookies going...
            //return isUserTokenSet();
            //if (!tokenCheck) alert("User Token not set. Call init(utoken, urole, uplatform) before doing OData calls!");
            return true;
        };

        helpers.debugContainsAnnotationsId = function (field, fieldsValues, action, msg) {
            if (!config.DEBUG_MODE_ON) return;
            msg = msg || "";
            var check = false;
            check = fieldsValues[field] !== undefined;
            if (check) alert(field + " found in fieldsValues for " + action + ". " + msg);
            return check;
        };

        helpers.debugParseResults = function (data) {
            var result = "",
                i;
            if (data.hasOwnProperty("results")) {
                for (i = 0; i < data.results.length; i++) {
                    result += debugParseResultObj(data.results[i]);
                }
            } else {
                result += debugParseResultObj(data);
            }
            return result;
        };

        function debugParseResultObj(obj) {
            var result = "", key;
            if (_.isObject(obj)) {
                for (key in obj) {
                    result += "[" + key + ": \"" + obj[key] + "\"]";
                }
            } else {
                result += obj;
            }

            return result;
        }

        helpers.getEmptyParams = function () {
            /*
             * @param {Object}          [param]                 Optional parameters.
             * @param {String|Array}    param.visibility        Set a visibility for an annotation, supports array or string ['eBook', 'notebook'] / 'notebook'.
             * @param {Object}          param.filters:          Object with name-value pairs {contentID: "13245", objectID: "aabbcc23454"}.
             * @param {String[]}        param.fields:           Array of strings representing fields in a returned records i.e. ['title', 'body_text', 'updated_date'].
             * @param {Number}          param.limitFrom:        Integer representing the starting point (the first top record is 0) or null for zero.
             * @param {Number}          param.limitCount:       Integer representing number of records to be returned or null for all.
             * @param {String[]}        param.orderBy:          Array of strings representing fields for ordering, example ["updated_date", "title"] or null or empty array if no ordering is required.
             * @param {Boolean}         param.orderDesc:        Default is false.
             * @param {Boolean}         param.getCount:         Gets count instead of records. Default is false.
             * @param {Boolean}         param.parseDate         If set to true, default OData date string /Date()/ will be converted to JS Date object.
             * @param {Function}        param.successHandler    successHandler(data) callback. Data is a list of annotation objects.
             * @param {Function}        param.errorHandler      errorHandler(err) callback.
             */

            return {
                successHandler: null,
                errorHandler: null,
                visibility: null,
                visibilityId: null,
                contentId: null,
                fields: null,
                filters: null,
                orderBy: null,
                orderDesc: false,
                getCount: false,
                orderAscending: null,
                limitFrom: null,
                limitCount: null,
                parseDate: null
            };
        };

        helpers.getHeader = function (method, customHeaders) {

            // In case method is not passed but only customHeader
            if (!_.isString(method)) customHeaders = method;

            var headers = {};

            // HERE PUT HEADER ENTRIES THAT CAN BE OVERRIDEN BY CUSTOMHEADER

            // WSi DP-2373: Default Accept header passed by dataJS doesn't suit us as it expects
            // Atomsvc+xml as a prefferred choice but service doesn't support it and we want json to
            // be the preffered format. Here is what dataJS sents by default:
            // "Accept:application/atomsvc+xml;q=0.8, application/json;odata=fullmetadata;q=0.7, application/json;q=0.5, */*;q=0.1"
            // We override that with the following (server suports regular Atom xml but we still want json fullmetadata to be preferred):
            headers['Accept'] = "application/json;odata=fullmetadata;q=0.8, application/atom+xml;q=0.7, application/json;q=0.5, */*;q=0.1";

            // Here we override the default headers with customHeaders
            _.extend(headers, customHeaders);

            // HERE PUT HEADERS THAT SHOULD BE ENFORCED AND WON'T BE OVERRIDEN BY CUSTOMHEADER

            if (helpers.isUserTokenSet()) {
                headers["Authorization"] = config.TOKEN_AUTHN;
            }

            // POST tunneling for MERGE calls
            if ((config.USE_POST_TUNNELING || undefined == [].indexOf)
                && method === config.REQ_TYPE_MERGE) {
                headers["X-HTTP-Method"] = method;
            }

            //Dealing with OData date format
            if (!_.isUndefined(config.FORCE_ODATA_VERSION)) {
                headers["DataServiceVersion"] = config.FORCE_ODATA_VERSION;
                headers["MaxDataServiceVersion"] = config.FORCE_ODATA_VERSION;
            }

            return headers;
        };

        helpers.getHTTPMethod = function (method) {
            if ((config.USE_POST_TUNNELING || undefined == [].indexOf) &&
                method === config.REQ_TYPE_MERGE) {
                return config.REQ_TYPE_POST;
            }
            return method;
        };

        var typeMap = {
            "function": _.isFunction,
            "number": _.isNumber,
            "array": _.isArray,
            "object": _.isObject,
            "string": _.isString,
            "boolean": _.isBoolean
        };

        helpers.areArgsValidType = function (args, fname) {
            // o = object, t = type
            // checking if objects are of specific types
            // args = [{o: [someVar], t: ['function']}] // checks if someVar is of type function

            var i, o, t, check;

            for (i = 0; i < args.length; i++) {
                for (o = 0; o < args[i].o.length; o++) {
                    if (args[i].o[o] === undefined || args[i].o[o] === null) break;
                    check = false;
                    for (t = 0; t < args[i].t.length; t++) {

                        //if (!typeMap[args[i].t[t]]) throwError('Type ' + args[i].t[t] + ' is not defined in typeMap', 'helpers.areArgsValidType');

                        if (!typeMap[args[i].t[t]]) throw (args[i].t[t] + " is not defined in typeMap.");
                        check = typeMap[args[i].t[t]](args[i].o[o]);
                        if (check) break;
                    }
                    //if (!check) throwError("Incorrect argument passed: '" + args[i].o[o] + "' is not " + args[i].t + "!", fname);
                    if (!check) errorManager.throwError('API_ERR_GENERAL_1', ['', '', args[i].t, args[i].o[o]]);

                }
            }
        };

        helpers.setParams = function (params, reqParams, otherParams, fname) {
            var i;

            params = params || {};
            reqParams = reqParams || [];
            fname = fname || "(unknown)";

            for (i = 0; i < reqParams.length; i++) {
                params[reqParams[i]] = (params[reqParams[i]] == undefined) ? null : params[reqParams[i]];

                if (!params[reqParams[i]]) {
                    //Missing required parameter {0} when calling {1}.
                    errorManager.throwError('API_ERR_GENERAL_3', [reqParams[i], fname]);
                }
            }

            if (otherParams) {
                for (i = 0; i < otherParams.length; i++) {
                    params[otherParams[i]] = params[otherParams[i]] == undefined ? null : params[otherParams[i]];
                }
            }

            return params;
        };

        //helpers.parseJSON = function(data) {
        //    return _.isString(data) && data.length > 0 ? ($ ? $.parseJSON(data) : JSON.parse(data)) : data;
        //};

        helpers.consoleLog = function () {
            if (config.DEBUG_MODE_ON && console && console.log) {
                if (console.log.apply) {
                    console.log.apply(console, arguments);
                } else {
                    Array.prototype.slice.call(arguments);
                }
            }
        };

        helpers.defSuccessCb = function (data) {
            helpers.consoleLog(
                '---------* Results: *---------\n',
                data,
                '\n------------------------------'
            );
        };

        helpers.defErrorCb = function (err) {
            // var msg = "";
            // if (_.isObject(err)) {
            //     _.each(err, function(v, k){
            //         msg += k + ': ' + v + '\n';
            //     });
            // }
            // msg = msg || err;

            helpers.consoleLog(
                '----------! ERROR !-----------\n',
                err,
                '\n------------------------------'
            );
        };

        helpers.getRequestURL = function (tail, isWebApi) {
            // //VV refactored method to allow usage of empty string as a service
            // if (_.isUndefined(service) || _.isNull(service)) {
            //     service = config.SERVICE_DPS;
            // }

            return config.SERVER_URL +
                (config.SERVICE_PREFIX + (config.USE_CAS_V2 ? 'v2/' : '')) +
                (isWebApi ? '' : config.SERVICE_DPS) +
                tail;
        };

        helpers.checkLength = function (dto) {
            var length = dto['len'],
                comparator = dto['com'];

            return function (args) {
                return !!(args.length === length);
            };
        };

        helpers.throwError = throwError;

        // WSi 22/05/2014: Leaving below in case we ever need to come back to the old AtomXML Metadata
        // var oldmetaToObject = function (elementName, context) {
        //     var result = {},
        //     types = {
        //         'Edm.DateTime': 'Date',
        //         'Edm.Int32': 'Number',
        //         'Edm.String': 'String'
        //     };

        //     //context = $(context);
        //     var root = context && context.dataServices && context.dataServices.schema && context.dataServices.schema[0];

        //     if (!root) {
        //         return result;
        //     }

        //     var element = _.find(root.entityType, function (ent) {
        //         return !!(ent && ent.name == elementName);
        //     });

        //     result.fields = _.map(element.property, function (prop) {
        //         /** type names fix */
        //         prop['type'] = types[prop['type']] || prop['type'];

        //         return _.pick(prop, ['name', 'maxLength', 'type', 'nullable']);
        //     });

        //     result.keyField = element.key && element.key.propertyRef && element.key.propertyRef[0].name;

        //     return result;
        // };

        var metaToObject = function (elementName, context) {
            var result = {
                    navigationProperties: {}
                },
                types = {
                    'Edm.DateTime': 'Date',
                    'Edm.Int32': 'Number',
                    'Edm.String': 'String'
                };
            var metadata = _.findWhere(config.SETTINGS.serviceSettingsStatuses, {'name': 'Metadata'});

            //context = $(context);
            var root = context &&
                context['edmx:Edmx'] &&
                context['edmx:Edmx']['edmx:DataServices'] &&
                context['edmx:Edmx']['edmx:DataServices']['Schema'] &&
                context['edmx:Edmx']['edmx:DataServices']['Schema']['EntityType'];

            var association = context &&
                context['edmx:Edmx'] &&
                context['edmx:Edmx']['edmx:DataServices'] &&
                context['edmx:Edmx']['edmx:DataServices']['Schema'] &&
                context['edmx:Edmx']['edmx:DataServices']['Schema']['Association'];

            if (!root || !_.isArray(root) || !_.contains(_.pluck(root, '@Name'), elementName)) {
                helpers.consoleLog("* Can't parse metadata for entity: " + elementName + ". Using the default value.");
                return config.DEFAULTS.Metadata[elementName];
            }

            metadata.received = true;
            metadata.correctFormat = true;

            if (!association || !_.isArray(association)) {

                helpers.consoleLog("* Can't navigation properties for entity: " + elementName + ". Using the default value.");
                return config.DEFAULTS.Metadata[elementName]['navigationProperties'];

            }

            var element = _.find(root, function (ent) {
                if (_.isUndefined(ent['Property']) || !_.isArray(ent['Property'])) {
                    return undefined;
                }

                if (_.isUndefined(ent['NavigationProperty']) ||
                    (!_.isArray(ent['NavigationProperty']) && !_.isObject(ent['NavigationProperty']))) {
                    //ClientTool doesn't have  NavigationProperties
                    return undefined;
                }
                return !!(ent && ent['@Name'] == elementName);
            });

            if (!_.isUndefined(element)) {
                result.fields = _.map(element['Property'], function (prop) {
                    // convert keys in the prop obj from @Names into names
                    prop = _.object(_.map(prop, function (val, key) {
                        return [key.charAt(1).toLowerCase() + key.slice(2), val];
                    }));
                    prop['type'] = types[prop['type']] || prop['type'];

                    return _.pick(prop, ['name', 'maxLength', 'type', 'nullable']);
                });

                //CI Navigation propertes for annotations are in form of array
                // and for other entities are currently only objects
                // let's convert them to 1 element arrays as well

                if (!_.isArray(element['NavigationProperty'])) element['NavigationProperty'] = [element['NavigationProperty']];

                _.each(element['NavigationProperty'], function (prop) {

                    // we want to have this format in config:

                    /*
                     *         "navigationProperties": {
                     "Annotation_parent_Source": {
                     "navigationProperty": "parent",
                     "field": "parent_id"
                     },...
                     },
                     *
                     */
                    result.navigationProperties[prop['@FromRole']] = {};

                    //we need a value of the @Name property stored as navigationProperty
                    //values returns array, so thus the _.first
                    result.navigationProperties[prop['@FromRole']].navigationProperty = _.first(_.values(_.pick(prop, '@Name')));

                    _.each(association, function (item) {

                        //if '@FromRole is matching Dependent @Name, use
                        //PropertyRef['@Name'] as field property - look at the example code above
                        if (_.contains(item.ReferentialConstraint.Dependent, prop['@FromRole'])) {
                            result.navigationProperties[prop['@FromRole']].field = item.ReferentialConstraint.Dependent.PropertyRef['@Name'];

                        }

                        //if (_.contains(_.first(item.End), prop['@ToRole'])) {
                        //    //we're forming out entityName - not sure if we actually need this part anymore
                        //    var entityName = _.first(item.End)['@Type'].split(".")[3];
                        //    //we're getting name from collections which matches the entity we're providing
                        //    navProp['entityName'] = _.first(_.filter(config.COLLECTIONS, _.matches({ entity: entityName })))['name'];
                        //}

                    });
                    //annotations have two nav props which are of no use to us
                    //if (!_.isEmpty(result.navigationProperties[prop['@FromRole']]) && result.navigationProperties[prop['@FromRole']].navigationProperty &&
                    //     result.navigationProperties[prop['@FromRole']].field) {
                    //    return navProp;
                    //}
                    ////so let's set them to udefined
                    //return undefined;

                });

                //and then remove undefined properties from object

                //result.navigationProperties = _.reject(result.navigationProperties, function (prop) {
                //    return prop === undefined;
                //});

                result.keyField = element['Key'] &&
                    element['Key']['PropertyRef'] &&
                    element['Key']['PropertyRef']['@Name'];
                return result;
            } else {
                return config.DEFAULTS.Metadata[elementName];
            }

        };

        helpers.parseMetadata = function (metadata) {
            var ret = {};
            var meta = _.findWhere(config.SETTINGS.serviceSettingsStatuses, {'name': 'Metadata'});
            ret[config.COLLECTIONS.annotations.entity] = metaToObject(config.COLLECTIONS.annotations.entity, metadata);
            ret[config.COLLECTIONS.tags.entity] = metaToObject(config.COLLECTIONS.tags.entity, metadata);
            ret[config.COLLECTIONS.containers.entity] = metaToObject(config.COLLECTIONS.containers.entity, metadata);
            ret[config.COLLECTIONS.annotationSharedWith.entity] = metaToObject(config.COLLECTIONS.annotationSharedWith.entity, metadata);
            //TODO: not sure what this meant
            // if (_.isEqual(ret, config.DEFAULTS.Metadata)) meta.upToDate = true;
            meta.upToDate = meta !== undefined;
            return ret;
        };

        helpers.getArrayLengthIE8 = function (collection) {
            var i = collection.length;
            while (!collection.hasOwnProperty(--i)) {
            }
            ++i;
            return i;
        };

        helpers.templatify = function (tpl) {
            return function (data) {
                var rx = /<%= (.+?) %>/g,
                    out = tpl,
                    match;
                while (match = rx.exec(tpl)) {
                    out = out.replace(match[0], data[match[1]]);
                }
                return out;
            };
        };

        helpers.getResponseAdditionalData = function (response) {
            var responseAdditionalData = {};
            var headerKeys = _.keys(response.headers);
            responseAdditionalData.headers = {};

            _.each(headerKeys, function (k) {
                responseAdditionalData.headers[k] = response.headers[k];
            });

            responseAdditionalData.statusCode = response.statusCode;
            responseAdditionalData.statusText = response.statusText;

            if (response && response.data && response.data.__count) {
                responseAdditionalData.totalCount = response.data.__count;
            }

            return responseAdditionalData;
        };

        helpers.getAjaxResponseAdditionalData = function (response) {
            var responseAdditionalData = {};
            if (response && response.getAllResponseHeaders) {
                responseAdditionalData.headers = helpers.parseAjaxResponseHeaders(response.getAllResponseHeaders());
            } else {
                responseAdditionalData.headers = response.headers;
            }
            if (typeof (response.statusCode) != "function") {
                responseAdditionalData.statusCode = response.statusCode;
            } else {
                responseAdditionalData.statusCode = response.status;
            }
            if (typeof (response.statusText) != "function") {
                responseAdditionalData.statusText = response.statusText;
            } else {
                responseAdditionalData.statusText = response.status;
            }

            return responseAdditionalData;
        };

        /**
         * XmlHttpRequest's getAllResponseHeaders() method returns a string of response
         * headers according to the format described here:
         * http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders-method
         * This method parses that string into a user-friendly key/value pair object.
         *
         * Implementation took from https://gist.github.com/monsur/706839
         */
        helpers.parseAjaxResponseHeaders = function parseResponseHeaders(headerStr) {
            var headers = {};
            if (!headerStr) {
                return headers;
            }
            var headerPairs = headerStr.split('\u000d\u000a');
            for (var i = 0; i < headerPairs.length; i++) {
                var headerPair = headerPairs[i];
                // Can't use split() here because it does the wrong thing
                // if the header value has the string ": " in it.
                var index = headerPair.indexOf('\u003a\u0020');
                if (index > 0) {
                    var key = headerPair.substring(0, index);
                    var val = headerPair.substring(index + 2);
                    headers[key] = val;
                }
            }
            return headers;
        };

        helpers.getPropertyValueCaseInsensitive = function (containerObject, propertyName) {
            var returnVal;
            propertyName = (propertyName + "").toLowerCase();
            if (!_.isUndefined(containerObject) && _.isObject(containerObject)
            ) {
                returnVal = containerObject[_.find(_.keys(containerObject),
                    function (singlekey) {
                        return singlekey.toLowerCase() === propertyName;
                    })];
            }
            return returnVal;
        };

        /**
         * Updates current visibility_id by adding or removing client_ids bitwise.
         * Example testing:
         * annService.convertClientIdToClientNames(
         *     annService.updateVisibilityIdByClientNames({
     *          previousVisibility_id: annService.convertClientNamesToClientId(['Notebook', 'Portfolio']),
     *          includeClients: ['MX', 'eBook'],
     *          excludeClients: ['Portfolio']
     *     })
         * );
         *
         * @param {Object}              [params]
         * @param {Number}              params.currentVisibilityId:        Number representing current visibility_id.
         * @param {String[] / String}   params.includeClients:              String or array of strings representing clients to include ['Notebook', 'MX'].
         * @param {String[] / String}   params.excludeClients:              String or array of strings representing clients to include ['eBook', 'Portfolio'].
         */
            // WSi TODO 20140821: This is a duplicate of the method present in the client.js
            // Do we really need a duplication?!
        helpers.updateVisibilityIdByNames = function (params, entityName) {
            var fname = 'updateVisibilityIdByClientNames';

            helpers.areArgsValidType(
                [
                    {o: [params.previousVisibility_id], t: ["number"]},
                    {o: [params.includeClients, params.excludeClients], t: ["array", "string"]}
                ],
                fname
            );

            // VV moved checking of individual visibility include/exclude values to helpers
            // it looks like this check isn't needed, as convertNamesToID is checking each value
            //CI - removed
            //if (!_.isUndefined(params)) {
            //    if (_.has(params, 'includeClients')) {
            //        if (_.isArray(params.includeClients)
            //            && _.some(params.includeClients, function (singleVisibilityInclude) {
            //                return !_.isString(singleVisibilityInclude);
            //            })) {
            //            //{0}: {1} must be called with array of strings representing client names.
            //            errorManager.throwError('API_ERR_ANNOTATION_ENTITY_3', [entityName, "visibilityInclude"]);
            //        }

            //    }

            //    if (_.has(params, 'excludeClients')) {
            //        if (_.isArray(params.excludeClients)
            //            && _.some(params.excludeClients, function (singleVisibilityExclude) {
            //                return !_.isString(singleVisibilityExclude);
            //        })) {
            //            //{0}: {1} must be called with array of strings representing client names.
            //            errorManager.throwError('API_ERR_ANNOTATION_ENTITY_3', entityName, "visibilityExclude");
            //        }

            //    }
            //}

            if (params.currentVisibilityId === undefined || (params.includeClients === undefined && params.excludeClients === undefined)) {
                //params.currentVisibilityId and params.includeClients or params.excludeClients are required
                errorManager.throwError('API_ERR_CLIENT_2', [fname]);
            }

            var visibility = params.currentVisibilityId,
                includeClients = params.includeClients ? helpers.convertNamesToID(params.includeClients) : null,
                excludeClients = params.excludeClients ? helpers.convertNamesToID(params.excludeClients) : null;

            if (includeClients) visibility |= includeClients;
            if (excludeClients) visibility &= ~excludeClients;

            return visibility;
        };

        /**
         * Accepts a string or an array of strings with client ids
         */
        helpers.convertNamesToID = function (clientNames) {
            var i, combinedClientIds = 0;

            clientNames = _.isString(clientNames) ? [clientNames] : clientNames;

            for (i = 0; i < clientNames.length; i++) {
                if (config.SETTINGS.ClientTools[clientNames[i]] === undefined) {
                    //The client_id provided is not supported by data persistence!
                    errorManager.throwError('API_ERR_GENERAL_2', ['client_id', clientNames[i]]);
                } else {
                    combinedClientIds |= config.SETTINGS.ClientTools[clientNames[i]];
                }
            }
            return combinedClientIds;
        };

        helpers.concatenateStrings = function (prefix, stringCollection, connectingString) {
            if (!_.isArray(stringCollection)) {
                throw "concatenateStrings: stringCollection must be an array";
            }

            var that = this;

            //cleaning collection of unwanted items
            stringCollection = _.reject(stringCollection, function (item) {
                return _.isNull(item) || _.isUndefined(item) || (_.isString(item) && that.trim(item) === '');
            });

            prefix = stringCollection.length > 0 ? (_.isString(prefix) ? prefix : "") : "";
            connectingString = _.isString(connectingString) ? connectingString : "";
            return prefix + stringCollection.join(connectingString);
        };

        // WSi: this is to be used by all function switches, i.e. inlineCount(), withTags() etc
        // Returns true when fun is called without args or when the truthy condition is passed
        helpers.isFunSwitchEnabled = function (args) {
            return args.length === 0 || !!args[0];
        };

        // TODO this is a temp hack until we sort everything up with config.COLLECTIONS
        helpers.tempAndUglyGetEntityName = function (nameUppercase) {
            var ref;
            _.some(config.COLLECTIONS, function (item) {
                if (item.nameUppercase === nameUppercase) {
                    ref = item.entity;
                    return true;
                }
                return false;
            });
            return ref;
        };

        helpers.trim = function (stringVal) {
            if (typeof String.prototype.trim !== 'function') {
                return stringVal.replace(/^\s+|\s+$/g, '');
            }
            return stringVal.trim();
        };

        helpers.makeFirstLetterLowercase = function (stringVal) {
            if (_.isString(stringVal)) {
                return stringVal.substr(0, 1).toLowerCase() + stringVal.substr(1);
            }
        };

        helpers.getMetadataByEntityName = function (entityName) {
            if (_.isString(entityName)) {
                var collectionObject = _.find(config.COLLECTIONS, function (collectionItem) {
                    return entityName.toLowerCase() === collectionItem.name.toLowerCase();
                });
                if (collectionObject) {
                    return config.SETTINGS.Metadata[collectionObject.entity];
                }
            }
        };

        helpers.toType = function (obj) {
            // seen on: http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/

            //IC 20150126 - added dummy check because of phantomjs' bug in webkit implementation
            if (_.isNull(obj)) return 'null';

            if (_.isUndefined(obj)) return 'undefined';

            return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
        };

        helpers.ServiceSettingsStatus = function (name) {
            this.name = name,
                //all statuses are initially set to false
                this.received = false,
                this.correctFormat = false,
                this.upToDate = false,
                this.unknown = false,
                this.forced = false;
        };

        return helpers;

    });

define(
    'client', ['underscorenc', 'config', 'helpers', 'errorManager'],

    function (_, config, helpers, errorManager) {

        var client = {
            init: function () {
                return this;
            }

        };

        var CLIENT_ID = config.UNDEF_NUM;
        /* default client id (if -1 then will not be used when creating new annotations) */

        client.getID = function () {
            return CLIENT_ID;
        };

        client._parseClientIds = function (data) {
            if (data) {

                var clientTools = _.findWhere(config.SETTINGS.serviceSettingsStatuses, {'name': 'ClientTools'});
                clientTools.received = true;

                if (data.length && _.isArray(data)) {
                    clientTools.correctFormat = true;
                    var clientList = {};
                    _.each(data, function (item) {
                        if (!_.isUndefined(item.client_tool_description) && !_.isUndefined(item.client_tool_id)) {
                            clientList[item.client_tool_description] = item.client_tool_id;
                        }
                    });
                    if (_.size(clientList) > 0) {
                        if (_.isEqual(clientList, config.DEFAULTS.ClientTools)) {
                            clientTools.upToDate = true;
                        }
                        config.SETTINGS.ClientTools = clientList;
                        return;
                    }
                } else {
                    config.SETTINGS.ClientTools = config.DEFAULTS.ClientTools;
                }
            }

        };

        /**
         * Accepts a string or an array of strings with client ids
         */
        client.convertNamesToID = function (clientNames) {
            var i, combinedClientIds = 0;

            clientNames = _.isString(clientNames) ? [clientNames] : clientNames;

            for (i = 0; i < clientNames.length; i++) {
                if (config.SETTINGS.ClientTools[clientNames[i]] === undefined) {
                    //The client_id provided is not supported by data persistence!

                    errorManager.throwError('API_ERR_GENERAL_2', ['client_id', clientNames[i]]);
                } else {
                    combinedClientIds |= config.SETTINGS.ClientTools[clientNames[i]];
                }
            }
            return combinedClientIds;
        };

        client.convertIDToNames = function (clientId) {
            var clientName, results = [];

            for (clientName in config.SETTINGS.ClientTools) {
                if (config.SETTINGS.ClientTools[clientName] & clientId) {
                    results.push(clientName);
                }
            }

            return results;
        };

        client.setID = function (clientID) {
            CLIENT_ID = client.convertNamesToID(clientID) || config.UNDEF_NUM;
        };

        client.isSet = function () {
            return (CLIENT_ID !== config.UNDEF_NUM);
        };

        /**
         * Updates current visibility_id by adding or removing client_ids bitwise.
         * Example testing:
         * annService.convertClientIdToClientNames(
         *     annService.updateVisibilityIdByClientNames({
     *          previousVisibility_id: annService.convertClientNamesToClientId(['Notebook', 'Portfolio']),
     *          includeClients: ['MX', 'eBook'],
     *          excludeClients: ['Portfolio']
     *     })
         * );
         *
         * @param {Object}              [params]
         * @param {Number}              params.currentVisibilityId:        Number representing current visibility_id.
         * @param {String[] / String}   params.includeClients:              String or array of strings representing clients to include ['Notebook', 'MX'].
         * @param {String[] / String}   params.excludeClients:              String or array of strings representing clients to include ['eBook', 'Portfolio'].
         */
        client.updateVisibilityIdByNames = function (params) {
            var fname = 'updateVisibilityIdByClientNames';

            helpers.areArgsValidType(
                [
                    {o: [params.previousVisibility_id], t: ["number"]},
                    {o: [params.includeClients, params.excludeClients], t: ["array", "string"]}
                ],
                fname
            );

            if (params.currentVisibilityId === undefined || (params.includeClients === undefined && params.excludeClients === undefined)) {
                //{0}: method {1} expects {2}

                errorManager.throwError('API_ERR_QUERY_API_4', [fname, 'currentVisibilityId and includeClients or excludeClients']);

            }

            var visibility = params.currentVisibilityId,
                includeClients = params.includeClients ? client.convertNamesToID(params.includeClients) : null,
                excludeClients = params.excludeClients ? client.convertNamesToID(params.excludeClients) : null;

            if (includeClients) {
                visibility |= includeClients;
            }
            if (excludeClients) {
                visibility &= ~excludeClients;
            }

            return visibility;
        };

        /**
         * Utility function - converts client names to visibility ids
         * Example call:
         * annService.convertClientNamesToVisibilityIds(["eBook", "Notebook"], "or"));
         */
        client.convertNamesToVisibilityIds = function (clientNames, andOrOrCriteria) {
            var clientIdsLength = _.keys(config.SETTINGS.ClientTools).length - 1;
            var result = [];
            var annotationVisibilityIds = [];
            for (var i = 0; i < Math.pow(clientIdsLength, 2); i++) {
                annotationVisibilityIds.push(i);
            }

            clientNames = _.isString(clientNames) ? [clientNames] : clientNames;

            if (clientNames && clientNames.length > 0) {
                if (andOrOrCriteria && andOrOrCriteria.length === 0) {
                    andOrOrCriteria = "or";
                }
                if (andOrOrCriteria === "and") {
                    result.push(client.convertNamesToID(clientNames));
                } else {
                    for (i = 0; i < annotationVisibilityIds.length; i++) {
                        for (var j = 0; j < clientNames.length; j++) {
                            _.each(clientNames, function () {

                                if (config.SETTINGS.ClientTools[clientNames[j]] === undefined) {
                                    //The client_id provided is not supported by data persistence!

                                    errorManager.throwError('API_ERR_GENERAL_2', ['client_id', clientNames[i]]);
                                }

                                if (config.SETTINGS.ClientTools[clientNames[j]] & annotationVisibilityIds[i]) {
                                    if (_.indexOf(annotationVisibilityIds[i], result) === -1) {
                                        result.push(annotationVisibilityIds[i]);
                                    }
                                }
                            });
                        }
                    }
                }
            }

            return result;
        };

        client.convertNamesToVisibilityIdsForGet = function (clientNames) {
            var clientIds = [];
            if (_.isString(clientNames)) {
                clientNames = [clientNames];
            }

            _.each(clientNames, function (clientName) {
                if (config.SETTINGS.ClientTools[clientName]) {
                    clientIds.push(config.SETTINGS.ClientTools[clientName]);
                } else {
                    errorManager.throwError('API_ERR_GENERAL_2', ['client_id', clientName]);
                }
            });
            return clientIds;
        };

        return client.init();
    });
// Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
// files (the "Software"), to deal  in the Software without restriction, including without limitation the rights  to use, copy,
// modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  IMPLIED, INCLUDING BUT NOT LIMITED TO THE
// WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
// ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// datajs.js

(function (window, undefined) {

    var datajs = window.datajs || {};
    var odata = window.OData || {};

    // AMD support
    // WSi 06/01/2014: removing AMD support due to issues with it as per DP-654
    //if (typeof define === 'function' && define.amd) {
    //    define('datajs', datajs);
    //    define('OData', odata);
    //} else {
    //    window.datajs = datajs;
    //    window.OData = odata;
    //}

    window.datajs = datajs;
    window.OData = odata;

    datajs.version = {
        major: 1,
        minor: 1,
        build: 1
    };


    var activeXObject = function (progId) {
        /// <summary>Creates a new ActiveXObject from the given progId.</summary>
        /// <param name="progId" type="String" mayBeNull="false" optional="false">
        ///    ProgId string of the desired ActiveXObject.
        /// </param>
        /// <remarks>
        ///    This function throws whatever exception might occur during the creation
        ///    of the ActiveXObject.
        /// </remarks>
        /// <returns type="Object">
        ///     The ActiveXObject instance. Null if ActiveX is not supported by the
        ///     browser.
        /// </returns>
        if (window.ActiveXObject) {
            return new window.ActiveXObject(progId);
        }
        return null;
    };

    var assigned = function (value) {
        /// <summary>Checks whether the specified value is different from null and undefined.</summary>
        /// <param name="value" mayBeNull="true" optional="true">Value to check.</param>
        /// <returns type="Boolean">true if the value is assigned; false otherwise.</returns>
        return value !== null && value !== undefined;
    };

    var contains = function (arr, item) {
        /// <summary>Checks whether the specified item is in the array.</summary>
        /// <param name="arr" type="Array" optional="false" mayBeNull="false">Array to check in.</param>
        /// <param name="item">Item to look for.</param>
        /// <returns type="Boolean">true if the item is contained, false otherwise.</returns>

        var i, len;
        for (i = 0, len = arr.length; i < len; i++) {
            if (arr[i] === item) {
                return true;
            }
        }

        return false;
    };

    var defined = function (a, b) {
        /// <summary>Given two values, picks the first one that is not undefined.</summary>
        /// <param name="a">First value.</param>
        /// <param name="b">Second value.</param>
        /// <returns>a if it's a defined value; else b.</returns>
        return (a !== undefined) ? a : b;
    };

    var delay = function (callback) {
        /// <summary>Delays the invocation of the specified function until execution unwinds.</summary>
        /// <param name="callback" type="Function">Callback function.</param>
        if (arguments.length === 1) {
            window.setTimeout(callback, 0);
            return;
        }

        var args = Array.prototype.slice.call(arguments, 1);
        window.setTimeout(function () {
            callback.apply(this, args);
        }, 0);
    };


    var extend = function (target, values) {
        /// <summary>Extends the target with the specified values.</summary>
        /// <param name="target" type="Object">Object to add properties to.</param>
        /// <param name="values" type="Object">Object with properties to add into target.</param>
        /// <returns type="Object">The target object.</returns>

        for (var name in values) {
            target[name] = values[name];
        }

        return target;
    };

    var find = function (arr, callback) {
        /// <summary>Returns the first item in the array that makes the callback function true.</summary>
        /// <param name="arr" type="Array" optional="false" mayBeNull="true">Array to check in.</param>
        /// <param name="callback" type="Function">Callback function to invoke once per item in the array.</param>
        /// <returns>The first item that makes the callback return true; null otherwise or if the array is null.</returns>

        if (arr) {
            var i, len;
            for (i = 0, len = arr.length; i < len; i++) {
                if (callback(arr[i])) {
                    return arr[i];
                }
            }
        }
        return null;
    };

    var isArray = function (value) {
        /// <summary>Checks whether the specified value is an array object.</summary>
        /// <param name="value">Value to check.</param>
        /// <returns type="Boolean">true if the value is an array object; false otherwise.</returns>

        return Object.prototype.toString.call(value) === "[object Array]";
    };

    var isDate = function (value) {
        /// <summary>Checks whether the specified value is a Date object.</summary>
        /// <param name="value">Value to check.</param>
        /// <returns type="Boolean">true if the value is a Date object; false otherwise.</returns>

        return Object.prototype.toString.call(value) === "[object Date]";
    };

    var isObject = function (value) {
        /// <summary>Tests whether a value is an object.</summary>
        /// <param name="value">Value to test.</param>
        /// <remarks>
        ///     Per javascript rules, null and array values are objects and will cause this function to return true.
        /// </remarks>
        /// <returns type="Boolean">True is the value is an object; false otherwise.</returns>

        return typeof value === "object";
    };

    var parseInt10 = function (value) {
        /// <summary>Parses a value in base 10.</summary>
        /// <param name="value" type="String">String value to parse.</param>
        /// <returns type="Number">The parsed value, NaN if not a valid value.</returns>

        return parseInt(value, 10);
    };

    var renameProperty = function (obj, oldName, newName) {
        /// <summary>Renames a property in an object.</summary>
        /// <param name="obj" type="Object">Object in which the property will be renamed.</param>
        /// <param name="oldName" type="String">Name of the property that will be renamed.</param>
        /// <param name="newName" type="String">New name of the property.</param>
        /// <remarks>
        ///    This function will not do anything if the object doesn't own a property with the specified old name.
        /// </remarks>

        if (obj.hasOwnProperty(oldName)) {
            obj[newName] = obj[oldName];
            delete obj[oldName];
        }
    };

    var throwErrorCallback = function (error) {
        /// <summary>Default error handler.</summary>
        /// <param name="error" type="Object">Error to handle.</param>
        throw error;
    };

    var trimString = function (str) {
        /// <summary>Removes leading and trailing whitespaces from a string.</summary>
        /// <param name="str" type="String" optional="false" mayBeNull="false">String to trim</param>
        /// <returns type="String">The string with no leading or trailing whitespace.</returns>

        if (str.trim) {
            return str.trim();
        }

        return str.replace(/^\s+|\s+$/g, '');
    };

    var undefinedDefault = function (value, defaultValue) {
        /// <summary>Returns a default value in place of undefined.</summary>
        /// <param name="value" mayBeNull="true" optional="true">Value to check.</param>
        /// <param name="defaultValue">Value to return if value is undefined.</param>
        /// <returns>value if it's defined; defaultValue otherwise.</returns>
        /// <remarks>
        /// This should only be used for cases where falsy values are valid;
        /// otherwise the pattern should be 'x = (value) ? value : defaultValue;'.
        /// </remarks>
        return (value !== undefined) ? value : defaultValue;
    };

    // Regular expression that splits a uri into its components:
    // 0 - is the matched string.
    // 1 - is the scheme.
    // 2 - is the authority.
    // 3 - is the path.
    // 4 - is the query.
    // 5 - is the fragment.
    var uriRegEx = /^([^:\/?#]+:)?(\/\/[^\/?#]*)?([^?#:]+)?(\?[^#]*)?(#.*)?/;
    var uriPartNames = ["scheme", "authority", "path", "query", "fragment"];

    var getURIInfo = function (uri) {
        /// <summary>Gets information about the components of the specified URI.</summary>
        /// <param name="uri" type="String">URI to get information from.</param>
        /// <returns type="Object">
        /// An object with an isAbsolute flag and part names (scheme, authority, etc.) if available.
        /// </returns>

        var result = { isAbsolute: false };

        if (uri) {
            var matches = uriRegEx.exec(uri);
            if (matches) {
                var i, len;
                for (i = 0, len = uriPartNames.length; i < len; i++) {
                    if (matches[i + 1]) {
                        result[uriPartNames[i]] = matches[i + 1];
                    }
                }
            }
            if (result.scheme) {
                result.isAbsolute = true;
            }
        }

        return result;
    };

    var getURIFromInfo = function (uriInfo) {
        /// <summary>Builds a URI string from its components.</summary>
        /// <param name="uriInfo" type="Object"> An object with uri parts (scheme, authority, etc.).</param>
        /// <returns type="String">URI string.</returns>

        return "".concat(
            uriInfo.scheme || "",
            uriInfo.authority || "",
            uriInfo.path || "",
            uriInfo.query || "",
            uriInfo.fragment || "");
    };

    // Regular expression that splits a uri authority into its subcomponents:
    // 0 - is the matched string.
    // 1 - is the userinfo subcomponent.
    // 2 - is the host subcomponent.
    // 3 - is the port component.
    var uriAuthorityRegEx = /^\/{0,2}(?:([^@]*)@)?([^:]+)(?::{1}(\d+))?/;

    // Regular expression that matches percentage enconded octects (i.e %20 or %3A);
    var pctEncodingRegEx = /%[0-9A-F]{2}/ig;

    var normalizeURICase = function (uri) {
        /// <summary>Normalizes the casing of a URI.</summary>
        /// <param name="uri" type="String">URI to normalize, absolute or relative.</param>
        /// <returns type="String">The URI normalized to lower case.</returns>

        var uriInfo = getURIInfo(uri);
        var scheme = uriInfo.scheme;
        var authority = uriInfo.authority;

        if (scheme) {
            uriInfo.scheme = scheme.toLowerCase();
            if (authority) {
                var matches = uriAuthorityRegEx.exec(authority);
                if (matches) {
                    uriInfo.authority = "//" +
                    (matches[1] ? matches[1] + "@" : "") +
                    (matches[2].toLowerCase()) +
                    (matches[3] ? ":" + matches[3] : "");
                }
            }
        }

        uri = getURIFromInfo(uriInfo);

        return uri.replace(pctEncodingRegEx, function (str) {
            return str.toLowerCase();
        });
    };

    var normalizeURI = function (uri, base) {
        /// <summary>Normalizes a possibly relative URI with a base URI.</summary>
        /// <param name="uri" type="String">URI to normalize, absolute or relative.</param>
        /// <param name="base" type="String" mayBeNull="true">Base URI to compose with.</param>
        /// <returns type="String">The composed URI if relative; the original one if absolute.</returns>

        if (!base) {
            return uri;
        }

        var uriInfo = getURIInfo(uri);
        if (uriInfo.isAbsolute) {
            return uri;
        }

        var baseInfo = getURIInfo(base);
        var normInfo = {};
        var path;

        if (uriInfo.authority) {
            normInfo.authority = uriInfo.authority;
            path = uriInfo.path;
            normInfo.query = uriInfo.query;
        } else {
            if (!uriInfo.path) {
                path = baseInfo.path;
                normInfo.query = uriInfo.query || baseInfo.query;
            } else {
                if (uriInfo.path.charAt(0) === '/') {
                    path = uriInfo.path;
                } else {
                    path = mergeUriPathWithBase(uriInfo.path, baseInfo.path);
                }
                normInfo.query = uriInfo.query;
            }
            normInfo.authority = baseInfo.authority;
        }

        normInfo.path = removeDotsFromPath(path);

        normInfo.scheme = baseInfo.scheme;
        normInfo.fragment = uriInfo.fragment;

        return getURIFromInfo(normInfo);
    };

    var mergeUriPathWithBase = function (uriPath, basePath) {
        /// <summary>Merges the path of a relative URI and a base URI.</summary>
        /// <param name="uriPath" type="String>Relative URI path.</param>
        /// <param name="basePath" type="String">Base URI path.</param>
        /// <returns type="String">A string with the merged path.</returns>

        var path = "/";
        var end;

        if (basePath) {
            end = basePath.lastIndexOf("/");
            path = basePath.substring(0, end);

            if (path.charAt(path.length - 1) !== "/") {
                path = path + "/";
            }
        }

        return path + uriPath;
    };

    var removeDotsFromPath = function (path) {
        /// <summary>Removes the special folders . and .. from a URI's path.</summary>
        /// <param name="path" type="string">URI path component.</param>
        /// <returns type="String">Path without any . and .. folders.</returns>

        var result = "";
        var segment = "";
        var end;

        while (path) {
            if (path.indexOf("..") === 0 || path.indexOf(".") === 0) {
                path = path.replace(/^\.\.?\/?/g, "");
            } else if (path.indexOf("/..") === 0) {
                path = path.replace(/^\/\..\/?/g, "/");
                end = result.lastIndexOf("/");
                if (end === -1) {
                    result = "";
                } else {
                    result = result.substring(0, end);
                }
            } else if (path.indexOf("/.") === 0) {
                path = path.replace(/^\/\.\/?/g, "/");
            } else {
                segment = path;
                end = path.indexOf("/", 1);
                if (end !== -1) {
                    segment = path.substring(0, end);
                }
                result = result + segment;
                path = path.replace(segment, "");
            }
        }
        return result;
    };

    var convertByteArrayToHexString = function (str) {
        var arr = [];
        if (window.atob === undefined) {
            arr = decodeBase64(str);
        } else {
            var binaryStr = window.atob(str);
            for (var i = 0; i < binaryStr.length; i++) {
                arr.push(binaryStr.charCodeAt(i));
            }
        }
        var hexValue = "";
        var hexValues = "0123456789ABCDEF";
        for (var j = 0; j < arr.length; j++) {
            var t = arr[j];
            hexValue += hexValues[t >> 4];
            hexValue += hexValues[t & 0x0F];
        }
        return hexValue;
    };

    var decodeBase64 = function (str) {
        var binaryString = "";
        for (var i = 0; i < str.length; i++) {
            var base65IndexValue = getBase64IndexValue(str[i]);
            var binaryValue = "";
            if (base65IndexValue !== null) {
                binaryValue = base65IndexValue.toString(2);
                binaryString += addBase64Padding(binaryValue);
            }
        }
        var byteArray = [];
        var numberOfBytes = parseInt(binaryString.length / 8, 10);
        for (i = 0; i < numberOfBytes; i++) {
            var intValue = parseInt(binaryString.substring(i * 8, (i + 1) * 8), 2);
            byteArray.push(intValue);
        }
        return byteArray;
    };

    var getBase64IndexValue = function (character) {
        var asciiCode = character.charCodeAt(0);
        var asciiOfA = 65;
        var differenceBetweenZanda = 6;
        if (asciiCode >= 65 && asciiCode <= 90) {           // between "A" and "Z" inclusive
            return asciiCode - asciiOfA;
        } else if (asciiCode >= 97 && asciiCode <= 122) {   // between 'a' and 'z' inclusive
            return asciiCode - asciiOfA - differenceBetweenZanda;
        } else if (asciiCode >= 48 && asciiCode <= 57) {    // between '0' and '9' inclusive
            return asciiCode + 4;
        } else if (character == "+") {
            return 62;
        } else if (character == "/") {
            return 63;
        } else {
            return null;
        }
    };

    var addBase64Padding = function (binaryString) {
        while (binaryString.length < 6) {
            binaryString = "0" + binaryString;
        }
        return binaryString;
    };


    // URI prefixes to generate smaller code.
    var http = "http://";
    var w3org = http + "www.w3.org/";               // http://www.w3.org/

    var xhtmlNS = w3org + "1999/xhtml";             // http://www.w3.org/1999/xhtml
    var xmlnsNS = w3org + "2000/xmlns/";            // http://www.w3.org/2000/xmlns/
    var xmlNS = w3org + "XML/1998/namespace";       // http://www.w3.org/XML/1998/namespace

    var mozillaParserErroNS = http + "www.mozilla.org/newlayout/xml/parsererror.xml";

    var hasLeadingOrTrailingWhitespace = function (text) {
        /// <summary>Checks whether the specified string has leading or trailing spaces.</summary>
        /// <param name="text" type="String">String to check.</param>
        /// <returns type="Boolean">true if text has any leading or trailing whitespace; false otherwise.</returns>

        var re = /(^\s)|(\s$)/;
        return re.test(text);
    };

    var isWhitespace = function (text) {
        /// <summary>Determines whether the specified text is empty or whitespace.</summary>
        /// <param name="text" type="String">Value to inspect.</param>
        /// <returns type="Boolean">true if the text value is empty or all whitespace; false otherwise.</returns>

        var ws = /^\s*$/;
        return text === null || ws.test(text);
    };

    var isWhitespacePreserveContext = function (domElement) {
        /// <summary>Determines whether the specified element has xml:space='preserve' applied.</summary>
        /// <param name="domElement">Element to inspect.</param>
        /// <returns type="Boolean">Whether xml:space='preserve' is in effect.</returns>

        while (domElement !== null && domElement.nodeType === 1) {
            var val = xmlAttributeValue(domElement, "space", xmlNS);
            if (val === "preserve") {
                return true;
            } else if (val === "default") {
                break;
            } else {
                domElement = domElement.parentNode;
            }
        }

        return false;
    };

    var isXmlNSDeclaration = function (domAttribute) {
        /// <summary>Determines whether the attribute is a XML namespace declaration.</summary>
        /// <param name="domAttribute">Element to inspect.</param>
        /// <returns type="Boolean">
        ///    True if the attribute is a namespace declaration (its name is 'xmlns' or starts with 'xmlns:'; false otherwise.
        /// </returns>

        var nodeName = domAttribute.nodeName;
        return nodeName == "xmlns" || nodeName.indexOf("xmlns:") === 0;
    };

    var safeSetProperty = function (obj, name, value) {
        /// <summary>Safely set as property in an object by invoking obj.setProperty.</summary>
        /// <param name="obj">Object that exposes a setProperty method.</param>
        /// <param name="name" type="String" mayBeNull="false">Property name.</param>
        /// <param name="value">Property value.</param>

        try {
            obj.setProperty(name, value);
        } catch (_) { }
    };

    var msXmlDom3 = function () {
        /// <summary>Creates an configures new MSXML 3.0 ActiveX object.</summary>
        /// <remakrs>
        ///    This function throws any exception that occurs during the creation
        ///    of the MSXML 3.0 ActiveX object.
        /// <returns type="Object">New MSXML 3.0 ActiveX object.</returns>

        var msxml3 = activeXObject("Msxml2.DOMDocument.3.0");
        if (msxml3) {
            safeSetProperty(msxml3, "ProhibitDTD", true);
            safeSetProperty(msxml3, "MaxElementDepth", 256);
            safeSetProperty(msxml3, "AllowDocumentFunction", false);
            safeSetProperty(msxml3, "AllowXsltScript", false);
        }
        return msxml3;
    };

    var msXmlDom = function () {
        /// <summary>Creates an configures new MSXML 6.0 or MSXML 3.0 ActiveX object.</summary>
        /// <remakrs>
        ///    This function will try to create a new MSXML 6.0 ActiveX object. If it fails then
        ///    it will fallback to create a new MSXML 3.0 ActiveX object. Any exception that
        ///    happens during the creation of the MSXML 6.0 will be handled by the function while
        ///    the ones that happend during the creation of the MSXML 3.0 will be thrown.
        /// <returns type="Object">New MSXML 3.0 ActiveX object.</returns>

        try {
            var msxml = activeXObject("Msxml2.DOMDocument.6.0");
            if (msxml) {
                msxml.async = true;
            }
            return msxml;
        } catch (_) {
            return msXmlDom3();
        }
    };

    var msXmlParse = function (text) {
        /// <summary>Parses an XML string using the MSXML DOM.</summary>
        /// <remakrs>
        ///    This function throws any exception that occurs during the creation
        ///    of the MSXML ActiveX object.  It also will throw an exception
        ///    in case of a parsing error.
        /// <returns type="Object">New MSXML DOMDocument node representing the parsed XML string.</returns>

        var dom = msXmlDom();
        if (!dom) {
            return null;
        }

        dom.loadXML(text);
        var parseError = dom.parseError;
        if (parseError.errorCode !== 0) {
            xmlThrowParserError(parseError.reason, parseError.srcText, text);
        }
        return dom;
    };

    var xmlThrowParserError = function (exceptionOrReason, srcText, errorXmlText) {
        /// <summary>Throws a new exception containing XML parsing error information.</summary>
        /// <param name="exceptionOrReason">
        ///    String indicatin the reason of the parsing failure or
        ///    Object detailing the parsing error.
        /// </param>
        /// <param name="srcText" type="String">
        ///    String indicating the part of the XML string that caused the parsing error.
        /// </param>
        /// <param name="errorXmlText" type="String">XML string for wich the parsing failed.</param>

        if (typeof exceptionOrReason === "string") {
            exceptionOrReason = { message: exceptionOrReason };
        }
        throw extend(exceptionOrReason, { srcText: srcText || "", errorXmlText: errorXmlText || "" });
    };

    var xmlParse = function (text) {
        /// <summary>Returns an XML DOM document from the specified text.</summary>
        /// <param name="text" type="String">Document text.</param>
        /// <returns>XML DOM document.</returns>
        /// <remarks>This function will throw an exception in case of a parse error.</remarks>

        var domParser = window.DOMParser && new window.DOMParser();
        var dom;

        if (!domParser) {
            dom = msXmlParse(text);
            if (!dom) {
                xmlThrowParserError("XML DOM parser not supported");
            }
            return dom;
        }

        try {
            dom = domParser.parseFromString(text, "text/xml");
        } catch (e) {
            xmlThrowParserError(e, "", text);
        }

        var element = dom.documentElement;
        var nsURI = element.namespaceURI;
        var localName = xmlLocalName(element);

        // Firefox reports errors by returing the DOM for an xml document describing the problem.
        if (localName === "parsererror" && nsURI === mozillaParserErroNS) {
            var srcTextElement = xmlFirstChildElement(element, mozillaParserErroNS, "sourcetext");
            var srcText = srcTextElement ? xmlNodeValue(srcTextElement) : "";
            xmlThrowParserError(xmlInnerText(element) || "", srcText, text);
        }

        // Chrome (and maybe other webkit based browsers) report errors by injecting a header with an error message.
        // The error may be localized, so instead we simply check for a header as the
        // top element or descendant child of the document.
        if (localName === "h3" && nsURI === xhtmlNS || xmlFirstDescendantElement(element, xhtmlNS, "h3")) {
            var reason = "";
            var siblings = [];
            var cursor = element.firstChild;
            while (cursor) {
                if (cursor.nodeType === 1) {
                    reason += xmlInnerText(cursor) || "";
                }
                siblings.push(cursor.nextSibling);
                cursor = cursor.firstChild || siblings.shift();
            }
            reason += xmlInnerText(element) || "";
            xmlThrowParserError(reason, "", text);
        }

        return dom;
    };

    var xmlQualifiedName = function (prefix, name) {
        /// <summary>Builds a XML qualified name string in the form of "prefix:name".</summary>
        /// <param name="prefix" type="String" maybeNull="true">Prefix string.</param>
        /// <param name="name" type="String">Name string to qualify with the prefix.</param>
        /// <returns type="String">Qualified name.</returns>

        return prefix ? prefix + ":" + name : name;
    };

    var xmlAppendText = function (domNode, textNode) {
        /// <summary>Appends a text node into the specified DOM element node.</summary>
        /// <param name="domNode">DOM node for the element.</param>
        /// <param name="text" type="String" mayBeNull="false">Text to append as a child of element.</param>
        if (hasLeadingOrTrailingWhitespace(textNode.data)) {
            var attr = xmlAttributeNode(domNode, xmlNS, "space");
            if (!attr) {
                attr = xmlNewAttribute(domNode.ownerDocument, xmlNS, xmlQualifiedName("xml", "space"));
                xmlAppendChild(domNode, attr);
            }
            attr.value = "preserve";
        }
        domNode.appendChild(textNode);
        return domNode;
    };

    var xmlAttributes = function (element, onAttributeCallback) {
        /// <summary>Iterates through the XML element's attributes and invokes the callback function for each one.</summary>
        /// <param name="element">Wrapped element to iterate over.</param>
        /// <param name="onAttributeCallback" type="Function">Callback function to invoke with wrapped attribute nodes.</param>

        var attributes = element.attributes;
        var i, len;
        for (i = 0, len = attributes.length; i < len; i++) {
            onAttributeCallback(attributes.item(i));
        }
    };

    var xmlAttributeValue = function (domNode, localName, nsURI) {
        /// <summary>Returns the value of a DOM element's attribute.</summary>
        /// <param name="domNode">DOM node for the owning element.</param>
        /// <param name="localName" type="String">Local name of the attribute.</param>
        /// <param name="nsURI" type="String">Namespace URI of the attribute.</param>
        /// <returns type="String" maybeNull="true">The attribute value, null if not found.</returns>

        var attribute = xmlAttributeNode(domNode, localName, nsURI);
        return attribute ? xmlNodeValue(attribute) : null;
    };

    var xmlAttributeNode = function (domNode, localName, nsURI) {
        /// <summary>Gets an attribute node from a DOM element.</summary>
        /// <param name="domNode">DOM node for the owning element.</param>
        /// <param name="localName" type="String">Local name of the attribute.</param>
        /// <param name="nsURI" type="String">Namespace URI of the attribute.</param>
        /// <returns>The attribute node, null if not found.</returns>

        var attributes = domNode.attributes;
        if (attributes.getNamedItemNS) {
            return attributes.getNamedItemNS(nsURI || null, localName);
        }

        return attributes.getQualifiedItem(localName, nsURI) || null;
    };

    var xmlBaseURI = function (domNode, baseURI) {
        /// <summary>Gets the value of the xml:base attribute on the specified element.</summary>
        /// <param name="domNode">Element to get xml:base attribute value from.</param>
        /// <param name="baseURI" mayBeNull="true" optional="true">Base URI used to normalize the value of the xml:base attribute.</param>
        /// <returns type="String">Value of the xml:base attribute if found; the baseURI or null otherwise.</returns>

        var base = xmlAttributeNode(domNode, "base", xmlNS);
        return (base ? normalizeURI(base.value, baseURI) : baseURI) || null;
    };


    var xmlChildElements = function (domNode, onElementCallback) {
        /// <summary>Iterates through the XML element's child DOM elements and invokes the callback function for each one.</summary>
        /// <param name="element">DOM Node containing the DOM elements to iterate over.</param>
        /// <param name="onElementCallback" type="Function">Callback function to invoke for each child DOM element.</param>

        xmlTraverse(domNode, /*recursive*/false, function (child) {
            if (child.nodeType === 1) {
                onElementCallback(child);
            }
            // continue traversing.
            return true;
        });
    };

    var xmlFindElementByPath = function (root, namespaceURI, path) {
        /// <summary>Gets the descendant element under root that corresponds to the specified path and namespace URI.</summary>
        /// <param name="root">DOM element node from which to get the descendant element.</param>
        /// <param name="namespaceURI" type="String">The namespace URI of the element to match.</param>
        /// <param name="path" type="String">Path to the desired descendant element.</param>
        /// <returns>The element specified by path and namespace URI.</returns>
        /// <remarks>
        ///     All the elements in the path are matched against namespaceURI.
        ///     The function will stop searching on the first element that doesn't match the namespace and the path.
        /// </remarks>

        var parts = path.split("/");
        var i, len;
        for (i = 0, len = parts.length; i < len; i++) {
            root = root && xmlFirstChildElement(root, namespaceURI, parts[i]);
        }
        return root || null;
    };

    var xmlFindNodeByPath = function (root, namespaceURI, path) {
        /// <summary>Gets the DOM element or DOM attribute node under root that corresponds to the specified path and namespace URI.</summary>
        /// <param name="root">DOM element node from which to get the descendant node.</param>
        /// <param name="namespaceURI" type="String">The namespace URI of the node to match.</param>
        /// <param name="path" type="String">Path to the desired descendant node.</param>
        /// <returns>The node specified by path and namespace URI.</returns>
        /// <remarks>
        ///     This function will traverse the path and match each node associated to a path segement against the namespace URI.
        ///     The traversal stops when the whole path has been exahusted or a node that doesn't belogong the specified namespace is encountered.
        ///
        ///     The last segment of the path may be decorated with a starting @ character to indicate that the desired node is a DOM attribute.
        /// </remarks>

        var lastSegmentStart = path.lastIndexOf("/");
        var nodePath = path.substring(lastSegmentStart + 1);
        var parentPath = path.substring(0, lastSegmentStart);

        var node = parentPath ? xmlFindElementByPath(root, namespaceURI, parentPath) : root;
        if (node) {
            if (nodePath.charAt(0) === "@") {
                return xmlAttributeNode(node, nodePath.substring(1), namespaceURI);
            }
            return xmlFirstChildElement(node, namespaceURI, nodePath);
        }
        return null;
    };

    var xmlFirstChildElement = function (domNode, namespaceURI, localName) {
        /// <summary>Returns the first child DOM element under the specified DOM node that matches the specified namespace URI and local name.</summary>
        /// <param name="domNode">DOM node from which the child DOM element is going to be retrieved.</param>
        /// <param name="namespaceURI" type="String" optional="true">The namespace URI of the element to match.</param>
        /// <param name="localName" type="String" optional="true">Name of the element to match.</param>
        /// <returns>The node's first child DOM element that matches the specified namespace URI and local name; null otherwise.</returns>

        return xmlFirstElementMaybeRecursive(domNode, namespaceURI, localName, /*recursive*/false);
    };

    var xmlFirstDescendantElement = function (domNode, namespaceURI, localName) {
        /// <summary>Returns the first descendant DOM element under the specified DOM node that matches the specified namespace URI and local name.</summary>
        /// <param name="domNode">DOM node from which the descendant DOM element is going to be retrieved.</param>
        /// <param name="namespaceURI" type="String" optional="true">The namespace URI of the element to match.</param>
        /// <param name="localName" type="String" optional="true">Name of the element to match.</param>
        /// <returns>The node's first descendant DOM element that matches the specified namespace URI and local name; null otherwise.</returns>

        if (domNode.getElementsByTagNameNS) {
            var result = domNode.getElementsByTagNameNS(namespaceURI, localName);
            return result.length > 0 ? result[0] : null;
        }
        return xmlFirstElementMaybeRecursive(domNode, namespaceURI, localName, /*recursive*/true);
    };

    var xmlFirstElementMaybeRecursive = function (domNode, namespaceURI, localName, recursive) {
        /// <summary>Returns the first descendant DOM element under the specified DOM node that matches the specified namespace URI and local name.</summary>
        /// <param name="domNode">DOM node from which the descendant DOM element is going to be retrieved.</param>
        /// <param name="namespaceURI" type="String" optional="true">The namespace URI of the element to match.</param>
        /// <param name="localName" type="String" optional="true">Name of the element to match.</param>
        /// <param name="recursive" type="Boolean">
        ///     True if the search should include all the descendants of the DOM node.
        ///     False if the search should be scoped only to the direct children of the DOM node.
        /// </param>
        /// <returns>The node's first descendant DOM element that matches the specified namespace URI and local name; null otherwise.</returns>

        var firstElement = null;
        xmlTraverse(domNode, recursive, function (child) {
            if (child.nodeType === 1) {
                var isExpectedNamespace = !namespaceURI || xmlNamespaceURI(child) === namespaceURI;
                var isExpectedNodeName = !localName || xmlLocalName(child) === localName;

                if (isExpectedNamespace && isExpectedNodeName) {
                    firstElement = child;
                }
            }
            return firstElement === null;
        });
        return firstElement;
    };

    var xmlInnerText = function (xmlElement) {
        /// <summary>Gets the concatenated value of all immediate child text and CDATA nodes for the specified element.</summary>
        /// <param name="domElement">Element to get values for.</param>
        /// <returns type="String">Text for all direct children.</returns>

        var result = null;
        var root = (xmlElement.nodeType === 9 && xmlElement.documentElement) ? xmlElement.documentElement : xmlElement;
        var whitespaceAlreadyRemoved = root.ownerDocument.preserveWhiteSpace === false;
        var whitespacePreserveContext;

        xmlTraverse(root, false, function (child) {
            if (child.nodeType === 3 || child.nodeType === 4) {
                // isElementContentWhitespace indicates that this is 'ignorable whitespace',
                // but it's not defined by all browsers, and does not honor xml:space='preserve'
                // in some implementations.
                //
                // If we can't tell either way, we walk up the tree to figure out whether
                // xml:space is set to preserve; otherwise we discard pure-whitespace.
                //
                // For example <a>  <b>1</b></a>. The space between <a> and <b> is usually 'ignorable'.
                var text = xmlNodeValue(child);
                var shouldInclude = whitespaceAlreadyRemoved || !isWhitespace(text);
                if (!shouldInclude) {
                    // Walk up the tree to figure out whether we are in xml:space='preserve' context
                    // for the cursor (needs to happen only once).
                    if (whitespacePreserveContext === undefined) {
                        whitespacePreserveContext = isWhitespacePreserveContext(root);
                    }

                    shouldInclude = whitespacePreserveContext;
                }

                if (shouldInclude) {
                    if (!result) {
                        result = text;
                    } else {
                        result += text;
                    }
                }
            }
            // Continue traversing?
            return true;
        });
        return result;
    };

    var xmlLocalName = function (domNode) {
        /// <summary>Returns the localName of a XML node.</summary>
        /// <param name="domNode">DOM node to get the value from.</param>
        /// <returns type="String">localName of domNode.</returns>

        return domNode.localName || domNode.baseName;
    };

    var xmlNamespaceURI = function (domNode) {
        /// <summary>Returns the namespace URI of a XML node.</summary>
        /// <param name="node">DOM node to get the value from.</param>
        /// <returns type="String">Namespace URI of domNode.</returns>

        return domNode.namespaceURI || null;
    };

    var xmlNodeValue = function (domNode) {
        /// <summary>Returns the value or the inner text of a XML node.</summary>
        /// <param name="node">DOM node to get the value from.</param>
        /// <returns>Value of the domNode or the inner text if domNode represents a DOM element node.</returns>
        
        if (domNode.nodeType === 1) {
            return xmlInnerText(domNode);
        }
        return domNode.nodeValue;
    };

    var xmlTraverse = function (domNode, recursive, onChildCallback) {
        /// <summary>Walks through the descendants of the domNode and invokes a callback for each node.</summary>
        /// <param name="domNode">DOM node whose descendants are going to be traversed.</param>
        /// <param name="recursive" type="Boolean">
        ///    True if the traversal should include all the descenants of the DOM node.
        ///    False if the traversal should be scoped only to the direct children of the DOM node.
        /// </param>
        /// <returns type="String">Namespace URI of node.</returns>

        var subtrees = [];
        var child = domNode.firstChild;
        var proceed = true;
        while (child && proceed) {
            proceed = onChildCallback(child);
            if (proceed) {
                if (recursive && child.firstChild) {
                    subtrees.push(child.firstChild);
                }
                child = child.nextSibling || subtrees.shift();
            }
        }
    };

    var xmlSiblingElement = function (domNode, namespaceURI, localName) {
        /// <summary>Returns the next sibling DOM element of the specified DOM node.</summary>
        /// <param name="domNode">DOM node from which the next sibling is going to be retrieved.</param>
        /// <param name="namespaceURI" type="String" optional="true">The namespace URI of the element to match.</param>
        /// <param name="localName" type="String" optional="true">Name of the element to match.</param>
        /// <returns>The node's next sibling DOM element, null if there is none.</returns>

        var sibling = domNode.nextSibling;
        while (sibling) {
            if (sibling.nodeType === 1) {
                var isExpectedNamespace = !namespaceURI || xmlNamespaceURI(sibling) === namespaceURI;
                var isExpectedNodeName = !localName || xmlLocalName(sibling) === localName;

                if (isExpectedNamespace && isExpectedNodeName) {
                    return sibling;
                }
            }
            sibling = sibling.nextSibling;
        }
        return null;
    };

    var xmlDom = function () {
        /// <summary>Creates a new empty DOM document node.</summary>
        /// <returns>New DOM document node.</returns>
        /// <remarks>
        ///    This function will first try to create a native DOM document using
        ///    the browsers createDocument function.  If the browser doesn't
        ///    support this but supports ActiveXObject, then an attempt to create
        ///    an MSXML 6.0 DOM will be made. If this attempt fails too, then an attempt
        ///    for creating an MXSML 3.0 DOM will be made.  If this last attemp fails or
        ///    the browser doesn't support ActiveXObject then an exception will be thrown.
        /// </remarks>

        var implementation = window.document.implementation;
        return (implementation && implementation.createDocument) ?
           implementation.createDocument(null, null, null) :
           msXmlDom();
    };

    var xmlAppendChildren = function (parent, children) {
        /// <summary>Appends a collection of child nodes or string values to a parent DOM node.</summary>
        /// <param name="parent">DOM node to which the children will be appended.</param>
        /// <param name="children" type="Array">Array containing DOM nodes or string values that will be appended to the parent.</param>
        /// <returns>The parent with the appended children or string values.</returns>
        /// <remarks>
        ///    If a value in the children collection is a string, then a new DOM text node is going to be created
        ///    for it and then appended to the parent.
        /// </remarks>

        if (!isArray(children)) {
            return xmlAppendChild(parent, children);
        }

        var i, len;
        for (i = 0, len = children.length; i < len; i++) {
            children[i] && xmlAppendChild(parent, children[i]);
        }
        return parent;
    };

    var xmlAppendChild = function (parent, child) {
        /// <summary>Appends a child node or a string value to a parent DOM node.</summary>
        /// <param name="parent">DOM node to which the child will be appended.</param>
        /// <param name="child">Child DOM node or string value to append to the parent.</param>
        /// <returns>The parent with the appended child or string value.</returns>
        /// <remarks>
        ///    If child is a string value, then a new DOM text node is going to be created
        ///    for it and then appended to the parent.
        /// </remarks>

        if (child) {
            if (typeof child === "string") {
                return xmlAppendText(parent, xmlNewText(parent.ownerDocument, child));
            }
            if (child.nodeType === 2) {
                parent.setAttributeNodeNS ? parent.setAttributeNodeNS(child) : parent.setAttributeNode(child);
            } else {
                parent.appendChild(child);
            }
        }
        return parent;
    };

    var xmlNewAttribute = function (dom, namespaceURI, qualifiedName, value) {
        /// <summary>Creates a new DOM attribute node.</summary>
        /// <param name="dom">DOM document used to create the attribute.</param>
        /// <param name="prefix" type="String">Namespace prefix.</param>
        /// <param name="namespaceURI" type="String">Namespace URI.</param>
        /// <returns>DOM attribute node for the namespace declaration.</returns>

        var attribute =
            dom.createAttributeNS && dom.createAttributeNS(namespaceURI, qualifiedName) ||
            dom.createNode(2, qualifiedName, namespaceURI || undefined);

        attribute.value = value || "";
        return attribute;
    };

    var xmlNewElement = function (dom, nampespaceURI, qualifiedName, children) {
        /// <summary>Creates a new DOM element node.</summary>
        /// <param name="dom">DOM document used to create the DOM element.</param>
        /// <param name="namespaceURI" type="String">Namespace URI of the new DOM element.</param>
        /// <param name="qualifiedName" type="String">Qualified name in the form of "prefix:name" of the new DOM element.</param>
        /// <param name="children" type="Array" optional="true">
        ///     Collection of child DOM nodes or string values that are going to be appended to the new DOM element.
        /// </param>
        /// <returns>New DOM element.</returns>
        /// <remarks>
        ///    If a value in the children collection is a string, then a new DOM text node is going to be created
        ///    for it and then appended to the new DOM element.
        /// </remarks>

        var element =
            dom.createElementNS && dom.createElementNS(nampespaceURI, qualifiedName) ||
            dom.createNode(1, qualifiedName, nampespaceURI || undefined);

        return xmlAppendChildren(element, children || []);
    };

    var xmlNewNSDeclaration = function (dom, namespaceURI, prefix) {
        /// <summary>Creates a namespace declaration attribute.</summary>
        /// <param name="dom">DOM document used to create the attribute.</param>
        /// <param name="namespaceURI" type="String">Namespace URI.</param>
        /// <param name="prefix" type="String">Namespace prefix.</param>
        /// <returns>DOM attribute node for the namespace declaration.</returns>

        return xmlNewAttribute(dom, xmlnsNS, xmlQualifiedName("xmlns", prefix), namespaceURI);
    };

    var xmlNewFragment = function (dom, text) {
        /// <summary>Creates a new DOM document fragment node for the specified xml text.</summary>
        /// <param name="dom">DOM document from which the fragment node is going to be created.</param>
        /// <param name="text" type="String" mayBeNull="false">XML text to be represented by the XmlFragment.</param>
        /// <returns>New DOM document fragment object.</returns>

        var value = "<c>" + text + "</c>";
        var tempDom = xmlParse(value);
        var tempRoot = tempDom.documentElement;
        var imported = ("importNode" in dom) ? dom.importNode(tempRoot, true) : tempRoot;
        var fragment = dom.createDocumentFragment();

        var importedChild = imported.firstChild;
        while (importedChild) {
            fragment.appendChild(importedChild);
            importedChild = importedChild.nextSibling;
        }
        return fragment;
    };

    var xmlNewText = function (dom, text) {
        /// <summary>Creates new DOM text node.</summary>
        /// <param name="dom">DOM document used to create the text node.</param>
        /// <param name="text" type="String">Text value for the DOM text node.</param>
        /// <returns>DOM text node.</returns>

        return dom.createTextNode(text);
    };

    var xmlNewNodeByPath = function (dom, root, namespaceURI, prefix, path) {
        /// <summary>Creates a new DOM element or DOM attribute node as specified by path and appends it to the DOM tree pointed by root.</summary>
        /// <param name="dom">DOM document used to create the new node.</param>
        /// <param name="root">DOM element node used as root of the subtree on which the new nodes are going to be created.</param>
        /// <param name="namespaceURI" type="String">Namespace URI of the new DOM element or attribute.</param>
        /// <param name="namespacePrefix" type="String">Prefix used to qualify the name of the new DOM element or attribute.</param>
        /// <param name="Path" type="String">Path string describing the location of the new DOM element or attribute from the root element.</param>
        /// <returns>DOM element or attribute node for the last segment of the path.</returns>
        /// <remarks>
        ///     This function will traverse the path and will create a new DOM element with the specified namespace URI and prefix
        ///     for each segment that doesn't have a matching element under root.
        ///
        ///     The last segment of the path may be decorated with a starting @ character. In this case a new DOM attribute node
        ///     will be created.
        /// </remarks>

        var name = "";
        var parts = path.split("/");
        var xmlFindNode = xmlFirstChildElement;
        var xmlNewNode = xmlNewElement;
        var xmlNode = root;

        var i, len;
        for (i = 0, len = parts.length; i < len; i++) {
            name = parts[i];
            if (name.charAt(0) === "@") {
                name = name.substring(1);
                xmlFindNode = xmlAttributeNode;
                xmlNewNode = xmlNewAttribute;
            }

            var childNode = xmlFindNode(xmlNode, namespaceURI, name);
            if (!childNode) {
                childNode = xmlNewNode(dom, namespaceURI, xmlQualifiedName(prefix, name));
                xmlAppendChild(xmlNode, childNode);
            }
            xmlNode = childNode;
        }
        return xmlNode;
    };

    var xmlSerialize = function (domNode) {
        /// <summary>
        /// Returns the text representation of the document to which the specified node belongs.
        /// </summary>
        /// <param name="root">Wrapped element in the document to serialize.</param>
        /// <returns type="String">Serialized document.</returns>

        var xmlSerializer = window.XMLSerializer;
        if (xmlSerializer) {
            var serializer = new xmlSerializer();
            return serializer.serializeToString(domNode);
        }

        if (domNode.xml) {
            return domNode.xml;
        }

        throw { message: "XML serialization unsupported" };
    };

    var xmlSerializeDescendants = function (domNode) {
        /// <summary>Returns the XML representation of the all the descendants of the node.</summary>
        /// <param name="domNode" optional="false" mayBeNull="false">Node to serialize.</param>
        /// <returns type="String">The XML representation of all the descendants of the node.</returns>

        var children = domNode.childNodes;
        var i, len = children.length;
        if (len === 0) {
            return "";
        }

        // Some implementations of the XMLSerializer don't deal very well with fragments that
        // don't have a DOMElement as their first child. The work around is to wrap all the
        // nodes in a dummy root node named "c", serialize it and then just extract the text between
        // the <c> and the </c> substrings.

        var dom = domNode.ownerDocument;
        var fragment = dom.createDocumentFragment();
        var fragmentRoot = dom.createElement("c");

        fragment.appendChild(fragmentRoot);
        // Move the children to the fragment tree.
        for (i = 0; i < len; i++) {
            fragmentRoot.appendChild(children[i]);
        }

        var xml = xmlSerialize(fragment);
        xml = xml.substr(3, xml.length - 7);

        // Move the children back to the original dom tree.
        for (i = 0; i < len; i++) {
            domNode.appendChild(fragmentRoot.childNodes[i]);
        }

        return xml;
    };

    var xmlSerializeNode = function (domNode) {
        /// <summary>Returns the XML representation of the node and all its descendants.</summary>
        /// <param name="domNode" optional="false" mayBeNull="false">Node to serialize.</param>
        /// <returns type="String">The XML representation of the node and all its descendants.</returns>

        var xml = domNode.xml;
        if (xml !== undefined) {
            return xml;
        }

        if (window.XMLSerializer) {
            var serializer = new window.XMLSerializer();
            return serializer.serializeToString(domNode);
        }

        throw { message: "XML serialization unsupported" };
    };




    var forwardCall = function (thisValue, name, returnValue) {
        /// <summary>Creates a new function to forward a call.</summary>
        /// <param name="thisValue" type="Object">Value to use as the 'this' object.</param>
        /// <param name="name" type="String">Name of function to forward to.</param>
        /// <param name="returnValue" type="Object">Return value for the forward call (helps keep identity when chaining calls).</param>
        /// <returns type="Function">A new function that will forward a call.</returns>

        return function () {
            thisValue[name].apply(thisValue, arguments);
            return returnValue;
        };
    };

    var DjsDeferred = function () {
        /// <summary>Initializes a new DjsDeferred object.</summary>
        /// <remarks>
        /// Compability Note A - Ordering of callbacks through chained 'then' invocations
        ///
        /// The Wiki entry at http://wiki.commonjs.org/wiki/Promises/A
        /// implies that .then() returns a distinct object.
        ////
        /// For compatibility with http://api.jquery.com/category/deferred-object/
        /// we return this same object. This affects ordering, as
        /// the jQuery version will fire callbacks in registration
        /// order regardless of whether they occur on the result
        /// or the original object.
        ///
        /// Compability Note B - Fulfillment value
        ///
        /// The Wiki entry at http://wiki.commonjs.org/wiki/Promises/A
        /// implies that the result of a success callback is the
        /// fulfillment value of the object and is received by
        /// other success callbacks that are chained.
        ///
        /// For compatibility with http://api.jquery.com/category/deferred-object/
        /// we disregard this value instead.
        /// </remarks>

        this._arguments = undefined;
        this._done = undefined;
        this._fail = undefined;
        this._resolved = false;
        this._rejected = false;
    };

    DjsDeferred.prototype = {
        then: function (fulfilledHandler, errorHandler /*, progressHandler */) {
            /// <summary>Adds success and error callbacks for this deferred object.</summary>
            /// <param name="fulfilledHandler" type="Function" mayBeNull="true" optional="true">Success callback.</param>
            /// <param name="errorHandler" type="Function" mayBeNull="true" optional="true">Error callback.</param>
            /// <remarks>See Compatibility Note A.</remarks>

            if (fulfilledHandler) {
                if (!this._done) {
                    this._done = [fulfilledHandler];
                } else {
                    this._done.push(fulfilledHandler);
                }
            }

            if (errorHandler) {
                if (!this._fail) {
                    this._fail = [errorHandler];
                } else {
                    this._fail.push(errorHandler);
                }
            }

            //// See Compatibility Note A in the DjsDeferred constructor.
            //// if (!this._next) {
            ////    this._next = createDeferred();
            //// }
            //// return this._next.promise();

            if (this._resolved) {
                this.resolve.apply(this, this._arguments);
            } else if (this._rejected) {
                this.reject.apply(this, this._arguments);
            }

            return this;
        },

        resolve: function (/* args */) {
            /// <summary>Invokes success callbacks for this deferred object.</summary>
            /// <remarks>All arguments are forwarded to success callbacks.</remarks>


            if (this._done) {
                var i, len;
                for (i = 0, len = this._done.length; i < len; i++) {
                    //// See Compability Note B - Fulfillment value.
                    //// var nextValue =
                    this._done[i].apply(null, arguments);
                }

                //// See Compatibility Note A in the DjsDeferred constructor.
                //// this._next.resolve(nextValue);
                //// delete this._next;

                this._done = undefined;
                this._resolved = false;
                this._arguments = undefined;
            } else {
                this._resolved = true;
                this._arguments = arguments;
            }
        },

        reject: function (/* args */) {
            /// <summary>Invokes error callbacks for this deferred object.</summary>
            /// <remarks>All arguments are forwarded to error callbacks.</remarks>
            if (this._fail) {
                var i, len;
                for (i = 0, len = this._fail.length; i < len; i++) {
                    this._fail[i].apply(null, arguments);
                }

                this._fail = undefined;
                this._rejected = false;
                this._arguments = undefined;
            } else {
                this._rejected = true;
                this._arguments = arguments;
            }
        },

        promise: function () {
            /// <summary>Returns a version of this object that has only the read-only methods available.</summary>
            /// <returns>An object with only the promise object.</returns>

            var result = {};
            result.then = forwardCall(this, "then", result);
            return result;
        }
    };

    var createDeferred = function () {
        /// <summary>Creates a deferred object.</summary>
        /// <returns type="DjsDeferred">
        /// A new deferred object. If jQuery is installed, then a jQuery
        /// Deferred object is returned, which provides a superset of features.
        /// </returns>

        if (window.jQuery && window.jQuery.Deferred) {
            return new window.jQuery.Deferred();
        } else {
            return new DjsDeferred();
        }
    };




    var dataItemTypeName = function (value, metadata) {
        /// <summary>Gets the type name of a data item value that belongs to a feed, an entry, a complex type property, or a collection property.</summary>
        /// <param name="value">Value of the data item from which the type name is going to be retrieved.</param>
        /// <param name="metadata" type="object" optional="true">Object containing metadata about the data tiem.</param>
        /// <remarks>
        ///    This function will first try to get the type name from the data item's value itself if it is an object with a __metadata property; otherwise
        ///    it will try to recover it from the metadata.  If both attempts fail, it will return null.
        /// </remarks>
        /// <returns type="String">Data item type name; null if the type name cannot be found within the value or the metadata</returns>

        var valueTypeName = ((value && value.__metadata) || {}).type;
        return valueTypeName || (metadata ? metadata.type : null);
    };

    var EDM = "Edm.";
    var EDM_BINARY = EDM + "Binary";
    var EDM_BOOLEAN = EDM + "Boolean";
    var EDM_BYTE = EDM + "Byte";
    var EDM_DATETIME = EDM + "DateTime";
    var EDM_DATETIMEOFFSET = EDM + "DateTimeOffset";
    var EDM_DECIMAL = EDM + "Decimal";
    var EDM_DOUBLE = EDM + "Double";
    var EDM_GUID = EDM + "Guid";
    var EDM_INT16 = EDM + "Int16";
    var EDM_INT32 = EDM + "Int32";
    var EDM_INT64 = EDM + "Int64";
    var EDM_SBYTE = EDM + "SByte";
    var EDM_SINGLE = EDM + "Single";
    var EDM_STRING = EDM + "String";
    var EDM_TIME = EDM + "Time";

    var EDM_GEOGRAPHY = EDM + "Geography";
    var EDM_GEOGRAPHY_POINT = EDM_GEOGRAPHY + "Point";
    var EDM_GEOGRAPHY_LINESTRING = EDM_GEOGRAPHY + "LineString";
    var EDM_GEOGRAPHY_POLYGON = EDM_GEOGRAPHY + "Polygon";
    var EDM_GEOGRAPHY_COLLECTION = EDM_GEOGRAPHY + "Collection";
    var EDM_GEOGRAPHY_MULTIPOLYGON = EDM_GEOGRAPHY + "MultiPolygon";
    var EDM_GEOGRAPHY_MULTILINESTRING = EDM_GEOGRAPHY + "MultiLineString";
    var EDM_GEOGRAPHY_MULTIPOINT = EDM_GEOGRAPHY + "MultiPoint";

    var EDM_GEOMETRY = EDM + "Geometry";
    var EDM_GEOMETRY_POINT = EDM_GEOMETRY + "Point";
    var EDM_GEOMETRY_LINESTRING = EDM_GEOMETRY + "LineString";
    var EDM_GEOMETRY_POLYGON = EDM_GEOMETRY + "Polygon";
    var EDM_GEOMETRY_COLLECTION = EDM_GEOMETRY + "Collection";
    var EDM_GEOMETRY_MULTIPOLYGON = EDM_GEOMETRY + "MultiPolygon";
    var EDM_GEOMETRY_MULTILINESTRING = EDM_GEOMETRY + "MultiLineString";
    var EDM_GEOMETRY_MULTIPOINT = EDM_GEOMETRY + "MultiPoint";

    var GEOJSON_POINT = "Point";
    var GEOJSON_LINESTRING = "LineString";
    var GEOJSON_POLYGON = "Polygon";
    var GEOJSON_MULTIPOINT = "MultiPoint";
    var GEOJSON_MULTILINESTRING = "MultiLineString";
    var GEOJSON_MULTIPOLYGON = "MultiPolygon";
    var GEOJSON_GEOMETRYCOLLECTION = "GeometryCollection";

    var primitiveEdmTypes = [
        EDM_STRING,
        EDM_INT32,
        EDM_INT64,
        EDM_BOOLEAN,
        EDM_DOUBLE,
        EDM_SINGLE,
        EDM_DATETIME,
        EDM_DATETIMEOFFSET,
        EDM_TIME,
        EDM_DECIMAL,
        EDM_GUID,
        EDM_BYTE,
        EDM_INT16,
        EDM_SBYTE,
        EDM_BINARY
    ];

    var geometryEdmTypes = [
        EDM_GEOMETRY,
        EDM_GEOMETRY_POINT,
        EDM_GEOMETRY_LINESTRING,
        EDM_GEOMETRY_POLYGON,
        EDM_GEOMETRY_COLLECTION,
        EDM_GEOMETRY_MULTIPOLYGON,
        EDM_GEOMETRY_MULTILINESTRING,
        EDM_GEOMETRY_MULTIPOINT
    ];

    var geographyEdmTypes = [
        EDM_GEOGRAPHY,
        EDM_GEOGRAPHY_POINT,
        EDM_GEOGRAPHY_LINESTRING,
        EDM_GEOGRAPHY_POLYGON,
        EDM_GEOGRAPHY_COLLECTION,
        EDM_GEOGRAPHY_MULTIPOLYGON,
        EDM_GEOGRAPHY_MULTILINESTRING,
        EDM_GEOGRAPHY_MULTIPOINT
    ];

    var forEachSchema = function (metadata, callback) {
        /// <summary>Invokes a function once per schema in metadata.</summary>
        /// <param name="metadata">Metadata store; one of edmx, schema, or an array of any of them.</param>
        /// <param name="callback" type="Function">Callback function to invoke once per schema.</param>
        /// <returns>
        /// The first truthy value to be returned from the callback; null or the last falsy value otherwise.
        /// </returns>

        if (!metadata) {
            return null;
        }

        if (isArray(metadata)) {
            var i, len, result;
            for (i = 0, len = metadata.length; i < len; i++) {
                result = forEachSchema(metadata[i], callback);
                if (result) {
                    return result;
                }
            }

            return null;
        } else {
            if (metadata.dataServices) {
                return forEachSchema(metadata.dataServices.schema, callback);
            }

            return callback(metadata);
        }
    };

    var formatMilliseconds = function (ms, ns) {
        /// <summary>Formats a millisecond and a nanosecond value into a single string.</summary>
        /// <param name="ms" type="Number" mayBeNull="false">Number of milliseconds to format.</param>
        /// <param name="ns" type="Number" mayBeNull="false">Number of nanoseconds to format.</param>
        /// <returns type="String">Formatted text.</returns>
        /// <remarks>If the value is already as string it's returned as-is.</remarks>

        // Avoid generating milliseconds if not necessary.
        if (ms === 0) {
            ms = "";
        } else {
            ms = "." + formatNumberWidth(ms.toString(), 3);
        }
        if (ns > 0) {
            if (ms === "") {
                ms = ".000";
            }
            ms += formatNumberWidth(ns.toString(), 4);
        }
        return ms;
    };

    var formatDateTimeOffset = function (value) {
        /// <summary>Formats a DateTime or DateTimeOffset value a string.</summary>
        /// <param name="value" type="Date" mayBeNull="false">Value to format.</param>
        /// <returns type="String">Formatted text.</returns>
        /// <remarks>If the value is already as string it's returned as-is.</remarks>

        if (typeof value === "string") {
            return value;
        }

        var hasOffset = isDateTimeOffset(value);
        var offset = getCanonicalTimezone(value.__offset);
        if (hasOffset && offset !== "Z") {
            // We're about to change the value, so make a copy.
            value = new Date(value.valueOf());

            var timezone = parseTimezone(offset);
            var hours = value.getUTCHours() + (timezone.d * timezone.h);
            var minutes = value.getUTCMinutes() + (timezone.d * timezone.m);

            value.setUTCHours(hours, minutes);
        } else if (!hasOffset) {
            // Don't suffix a 'Z' for Edm.DateTime values.
            offset = "";
        }

        var year = value.getUTCFullYear();
        var month = value.getUTCMonth() + 1;
        var sign = "";
        if (year <= 0) {
            year = -(year - 1);
            sign = "-";
        }

        var ms = formatMilliseconds(value.getUTCMilliseconds(), value.__ns);

        return sign +
            formatNumberWidth(year, 4) + "-" +
            formatNumberWidth(month, 2) + "-" +
            formatNumberWidth(value.getUTCDate(), 2) + "T" +
            formatNumberWidth(value.getUTCHours(), 2) + ":" +
            formatNumberWidth(value.getUTCMinutes(), 2) + ":" +
            formatNumberWidth(value.getUTCSeconds(), 2) +
            ms + offset;
    };

    var formatDuration = function (value) {
        /// <summary>Converts a duration to a string in xsd:duration format.</summary>
        /// <param name="value" type="Object">Object with ms and __edmType properties.</param>
        /// <returns type="String">String representation of the time object in xsd:duration format.</returns>

        var ms = value.ms;

        var sign = "";
        if (ms < 0) {
            sign = "-";
            ms = -ms;
        }

        var days = Math.floor(ms / 86400000);
        ms -= 86400000 * days;
        var hours = Math.floor(ms / 3600000);
        ms -= 3600000 * hours;
        var minutes = Math.floor(ms / 60000);
        ms -= 60000 * minutes;
        var seconds = Math.floor(ms / 1000);
        ms -= seconds * 1000;

        return sign + "P" +
               formatNumberWidth(days, 2) + "DT" +
               formatNumberWidth(hours, 2) + "H" +
               formatNumberWidth(minutes, 2) + "M" +
               formatNumberWidth(seconds, 2) +
               formatMilliseconds(ms, value.ns) + "S";
    };

    var formatNumberWidth = function (value, width, append) {
        /// <summary>Formats the specified value to the given width.</summary>
        /// <param name="value" type="Number">Number to format (non-negative).</param>
        /// <param name="width" type="Number">Minimum width for number.</param>
        /// <param name="append" type="Boolean">Flag indicating if the value is padded at the beginning (false) or at the end (true).</param>
        /// <returns type="String">Text representation.</returns>
        var result = value.toString(10);
        while (result.length < width) {
            if (append) {
                result += "0";
            } else {
                result = "0" + result;
            }
        }

        return result;
    };

    var getCanonicalTimezone = function (timezone) {
        /// <summary>Gets the canonical timezone representation.</summary>
        /// <param name="timezone" type="String">Timezone representation.</param>
        /// <returns type="String">An 'Z' string if the timezone is absent or 0; the timezone otherwise.</returns>

        return (!timezone || timezone === "Z" || timezone === "+00:00" || timezone === "-00:00") ? "Z" : timezone;
    };

    var getCollectionType = function (typeName) {
        /// <summary>Gets the type of a collection type name.</summary>
        /// <param name="typeName" type="String">Type name of the collection.</param>
        /// <returns type="String">Type of the collection; null if the type name is not a collection type.</returns>

        if (typeof typeName === "string") {
            var end = typeName.indexOf(")", 10);
            if (typeName.indexOf("Collection(") === 0 && end > 0) {
                return typeName.substring(11, end);
            }
        }
        return null;
    };

    var invokeRequest = function (request, success, error, handler, httpClient, context) {
        /// <summary>Sends a request containing OData payload to a server.</summary>
        /// <param name="request">Object that represents the request to be sent..</param>
        /// <param name="success">Callback for a successful read operation.</param>
        /// <param name="error">Callback for handling errors.</param>
        /// <param name="handler">Handler for data serialization.</param>
        /// <param name="httpClient">HTTP client layer.</param>
        /// <param name="context">Context used for processing the request</param>

        return httpClient.request(request, function (response) {
            try {
                if (response.headers) {
                    normalizeHeaders(response.headers);
                }

                if (response.data === undefined && response.statusCode !== 204) {
                    handler.read(response, context);
                }
            } catch (err) {
                if (err.request === undefined) {
                    err.request = request;
                }
                if (err.response === undefined) {
                    err.response = response;
                }
                error(err);
                return;
            }

            success(response.data, response);
        }, error);
    };

    var isBatch = function (value) {
        /// <summary>Tests whether a value is a batch object in the library's internal representation.</summary>
        /// <param name="value">Value to test.</param>
        /// <returns type="Boolean">True is the value is a batch object; false otherwise.</returns>

        return isComplex(value) && isArray(value.__batchRequests);
    };

    // Regular expression used for testing and parsing for a collection type.
    var collectionTypeRE = /Collection\((.*)\)/;

    var isCollection = function (value, typeName) {
        /// <summary>Tests whether a value is a collection value in the library's internal representation.</summary>
        /// <param name="value">Value to test.</param>
        /// <param name="typeName" type="Sting">Type name of the value. This is used to disambiguate from a collection property value.</param>
        /// <returns type="Boolean">True is the value is a feed value; false otherwise.</returns>

        var colData = value && value.results || value;
        return !!colData &&
            (isCollectionType(typeName)) ||
            (!typeName && isArray(colData) && !isComplex(colData[0]));
    };

    var isCollectionType = function (typeName) {
        /// <summary>Checks whether the specified type name is a collection type.</summary>
        /// <param name="typeName" type="String">Name of type to check.</param>
        /// <returns type="Boolean">True if the type is the name of a collection type; false otherwise.</returns>
        return collectionTypeRE.test(typeName);
    };

    var isComplex = function (value) {
        /// <summary>Tests whether a value is a complex type value in the library's internal representation.</summary>
        /// <param name="value">Value to test.</param>
        /// <returns type="Boolean">True is the value is a complex type value; false otherwise.</returns>

        return !!value &&
            isObject(value) &&
            !isArray(value) &&
            !isDate(value);
    };

    var isDateTimeOffset = function (value) {
        /// <summary>Checks whether a Date object is DateTimeOffset value</summary>
        /// <param name="value" type="Date" mayBeNull="false">Value to check.</param>
        /// <returns type="Boolean">true if the value is a DateTimeOffset, false otherwise.</returns>
        return (value.__edmType === "Edm.DateTimeOffset" || (!value.__edmType && value.__offset));
    };

    var isDeferred = function (value) {
        /// <summary>Tests whether a value is a deferred navigation property in the library's internal representation.</summary>
        /// <param name="value">Value to test.</param>
        /// <returns type="Boolean">True is the value is a deferred navigation property; false otherwise.</returns>

        if (!value && !isComplex(value)) {
            return false;
        }
        var metadata = value.__metadata || {};
        var deferred = value.__deferred || {};
        return !metadata.type && !!deferred.uri;
    };

    var isEntry = function (value) {
        /// <summary>Tests whether a value is an entry object in the library's internal representation.</summary>
        /// <param name="value">Value to test.</param>
        /// <returns type="Boolean">True is the value is an entry object; false otherwise.</returns>

        return isComplex(value) && value.__metadata && "uri" in value.__metadata;
    };

    var isFeed = function (value, typeName) {
        /// <summary>Tests whether a value is a feed value in the library's internal representation.</summary>
        /// <param name="value">Value to test.</param>
        /// <param name="typeName" type="Sting">Type name of the value. This is used to disambiguate from a collection property value.</param>
        /// <returns type="Boolean">True is the value is a feed value; false otherwise.</returns>

        var feedData = value && value.results || value;
        return isArray(feedData) && (
            (!isCollectionType(typeName)) &&
            (isComplex(feedData[0]))
        );
    };

    var isGeographyEdmType = function (typeName) {
        /// <summary>Checks whether the specified type name is a geography EDM type.</summary>
        /// <param name="typeName" type="String">Name of type to check.</param>
        /// <returns type="Boolean">True if the type is a geography EDM type; false otherwise.</returns>

        return contains(geographyEdmTypes, typeName);
    };

    var isGeometryEdmType = function (typeName) {
        /// <summary>Checks whether the specified type name is a geometry EDM type.</summary>
        /// <param name="typeName" type="String">Name of type to check.</param>
        /// <returns type="Boolean">True if the type is a geometry EDM type; false otherwise.</returns>

        return contains(geometryEdmTypes, typeName);
    };

    var isNamedStream = function (value) {
        /// <summary>Tests whether a value is a named stream value in the library's internal representation.</summary>
        /// <param name="value">Value to test.</param>
        /// <returns type="Boolean">True is the value is a named stream; false otherwise.</returns>

        if (!value && !isComplex(value)) {
            return false;
        }
        var metadata = value.__metadata;
        var mediaResource = value.__mediaresource;
        return !metadata && !!mediaResource && !!mediaResource.media_src;
    };

    var isPrimitive = function (value) {
        /// <summary>Tests whether a value is a primitive type value in the library's internal representation.</summary>
        /// <param name="value">Value to test.</param>
        /// <remarks>
        ///    Date objects are considered primitive types by the library.
        /// </remarks>
        /// <returns type="Boolean">True is the value is a primitive type value.</returns>

        return isDate(value) ||
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean";
    };

    var isPrimitiveEdmType = function (typeName) {
        /// <summary>Checks whether the specified type name is a primitive EDM type.</summary>
        /// <param name="typeName" type="String">Name of type to check.</param>
        /// <returns type="Boolean">True if the type is a primitive EDM type; false otherwise.</returns>

        return contains(primitiveEdmTypes, typeName);
    };

    var navigationPropertyKind = function (value, propertyModel) {
        /// <summary>Gets the kind of a navigation property value.</summary>
        /// <param name="value">Value of the navigation property.</param>
        /// <param name="propertyModel" type="Object" optional="true">
        ///     Object that describes the navigation property in an OData conceptual schema.
        /// </param>
        /// <remarks>
        ///     The returned string is as follows
        /// </remarks>
        /// <returns type="String">String value describing the kind of the navigation property; null if the kind cannot be determined.</returns>

        if (isDeferred(value)) {
            return "deferred";
        }
        if (isEntry(value)) {
            return "entry";
        }
        if (isFeed(value)) {
            return "feed";
        }
        if (propertyModel && propertyModel.relationship) {
            if (value === null || value === undefined || !isFeed(value)) {
                return "entry";
            }
            return "feed";
        }
        return null;
    };

    var lookupProperty = function (properties, name) {
        /// <summary>Looks up a property by name.</summary>
        /// <param name="properties" type="Array" mayBeNull="true">Array of property objects as per EDM metadata.</param>
        /// <param name="name" type="String">Name to look for.</param>
        /// <returns type="Object">The property object; null if not found.</returns>

        return find(properties, function (property) {
            return property.name === name;
        });
    };

    var lookupInMetadata = function (name, metadata, kind) {
        /// <summary>Looks up a type object by name.</summary>
        /// <param name="name" type="String">Name, possibly null or empty.</param>
        /// <param name="metadata">Metadata store; one of edmx, schema, or an array of any of them.</param>
        /// <param name="kind" type="String">Kind of object to look for as per EDM metadata.</param>
        /// <returns>An type description if the name is found; null otherwise.</returns>

        return (name) ? forEachSchema(metadata, function (schema) {
            return lookupInSchema(name, schema, kind);
        }) : null;
    };

    var lookupEntitySet = function (entitySets, name) {
        /// <summary>Looks up a entity set by name.</summary>
        /// <param name="properties" type="Array" mayBeNull="true">Array of entity set objects as per EDM metadata.</param>
        /// <param name="name" type="String">Name to look for.</param>
        /// <returns type="Object">The entity set object; null if not found.</returns>

        return find(entitySets, function (entitySet) {
            return entitySet.name === name;
        });
    };

    var lookupComplexType = function (name, metadata) {
        /// <summary>Looks up a complex type object by name.</summary>
        /// <param name="name" type="String">Name, possibly null or empty.</param>
        /// <param name="metadata">Metadata store; one of edmx, schema, or an array of any of them.</param>
        /// <returns>A complex type description if the name is found; null otherwise.</returns>

        return lookupInMetadata(name, metadata, "complexType");
    };

    var lookupEntityType = function (name, metadata) {
        /// <summary>Looks up an entity type object by name.</summary>
        /// <param name="name" type="String">Name, possibly null or empty.</param>
        /// <param name="metadata">Metadata store; one of edmx, schema, or an array of any of them.</param>
        /// <returns>An entity type description if the name is found; null otherwise.</returns>

        return lookupInMetadata(name, metadata, "entityType");
    };

    var lookupDefaultEntityContainer = function (metadata) {
        /// <summary>Looks up an</summary>
        /// <param name="name" type="String">Name, possibly null or empty.</param>
        /// <param name="metadata">Metadata store; one of edmx, schema, or an array of any of them.</param>
        /// <returns>An entity container description if the name is found; null otherwise.</returns>

        return forEachSchema(metadata, function (schema) {
            return find(schema.entityContainer, function (container) {
                return parseBool(container.isDefaultEntityContainer);
            });
        });
    };

    var lookupEntityContainer = function (name, metadata) {
        /// <summary>Looks up an entity container object by name.</summary>
        /// <param name="name" type="String">Name, possibly null or empty.</param>
        /// <param name="metadata">Metadata store; one of edmx, schema, or an array of any of them.</param>
        /// <returns>An entity container description if the name is found; null otherwise.</returns>

        return lookupInMetadata(name, metadata, "entityContainer");
    };

    var lookupFunctionImport = function (functionImports, name) {
        /// <summary>Looks up a function import by name.</summary>
        /// <param name="properties" type="Array" mayBeNull="true">Array of function import objects as per EDM metadata.</param>
        /// <param name="name" type="String">Name to look for.</param>
        /// <returns type="Object">The entity set object; null if not found.</returns>

        return find(functionImports, function (functionImport) {
            return functionImport.name === name;
        });
    };

    var lookupNavigationPropertyType = function (navigationProperty, metadata) {
        /// <summary>Looks up the target entity type for a navigation property.</summary>
        /// <param name="navigationProperty" type="Object"></param>
        /// <param name="metadata" type="Object"></param>
        /// <returns type="String">The entity type name for the specified property, null if not found.</returns>

        var result = null;
        if (navigationProperty) {
            var rel = navigationProperty.relationship;
            var association = forEachSchema(metadata, function (schema) {
                // The name should be the namespace qualified name in 'ns'.'type' format.
                var nameOnly = removeNamespace(schema["namespace"], rel);
                var associations = schema.association;
                if (nameOnly && associations) {
                    var i, len;
                    for (i = 0, len = associations.length; i < len; i++) {
                        if (associations[i].name === nameOnly) {
                            return associations[i];
                        }
                    }
                }
                return null;
            });

            if (association) {
                var end = association.end[0];
                if (end.role !== navigationProperty.toRole) {
                    end = association.end[1];
                    // For metadata to be valid, end.role === navigationProperty.toRole now.
                }
                result = end.type;
            }
        }
        return result;
    };

    var lookupNavigationPropertyEntitySet = function (navigationProperty, sourceEntitySetName, metadata) {
        /// <summary>Looks up the target entityset name for a navigation property.</summary>
        /// <param name="navigationProperty" type="Object"></param>
        /// <param name="metadata" type="Object"></param>
        /// <returns type="String">The entityset name for the specified property, null if not found.</returns>

        if (navigationProperty) {
            var rel = navigationProperty.relationship;
            var associationSet = forEachSchema(metadata, function (schema) {
                var containers = schema.entityContainer;
                for (var i = 0; i < containers.length; i++) {
                    var associationSets = containers[i].associationSet;
                    if (associationSets) {
                        for (var j = 0; j < associationSets.length; j++) {
                            if (associationSets[j].association == rel) {
                                return associationSets[j];
                            }
                        }
                    }
                }
                return null;
            });
            if (associationSet && associationSet.end[0] && associationSet.end[1]) {
                return (associationSet.end[0].entitySet == sourceEntitySetName) ? associationSet.end[1].entitySet : associationSet.end[0].entitySet;
            }
        }
        return null;
    };

    var getEntitySetInfo = function (entitySetName, metadata) {
        /// <summary>Gets the entitySet info, container name and functionImports for an entitySet</summary>
        /// <param name="navigationProperty" type="Object"></param>
        /// <param name="metadata" type="Object"></param>
        /// <returns type="Object">The info about the entitySet.</returns>

        var info = forEachSchema(metadata, function (schema) {
            var containers = schema.entityContainer;
            for (var i = 0; i < containers.length; i++) {
                var entitySets = containers[i].entitySet;
                if (entitySets) {
                    for (var j = 0; j < entitySets.length; j++) {
                        if (entitySets[j].name == entitySetName) {
                            return { entitySet: entitySets[j], containerName: containers[i].name, functionImport: containers[i].functionImport };
                        }
                    }
                }
            }
            return null;
        });

        return info;
    };

    var removeNamespace = function (ns, fullName) {
        /// <summary>Given an expected namespace prefix, removes it from a full name.</summary>
        /// <param name="ns" type="String">Expected namespace.</param>
        /// <param name="fullName" type="String">Full name in 'ns'.'name' form.</param>
        /// <returns type="String">The local name, null if it isn't found in the expected namespace.</returns>

        if (fullName.indexOf(ns) === 0 && fullName.charAt(ns.length) === ".") {
            return fullName.substr(ns.length + 1);
        }

        return null;
    };

    var lookupInSchema = function (name, schema, kind) {
        /// <summary>Looks up a schema object by name.</summary>
        /// <param name="name" type="String">Name (assigned).</param>
        /// <param name="schema">Schema object as per EDM metadata.</param>
        /// <param name="kind" type="String">Kind of object to look for as per EDM metadata.</param>
        /// <returns>An entity type description if the name is found; null otherwise.</returns>

        if (name && schema) {
            // The name should be the namespace qualified name in 'ns'.'type' format.
            var nameOnly = removeNamespace(schema["namespace"], name);
            if (nameOnly) {
                return find(schema[kind], function (item) {
                    return item.name === nameOnly;
                });
            }
        }
        return null;
    };

    var maxVersion = function (left, right) {
        /// <summary>Compares to version strings and returns the higher one.</summary>
        /// <param name="left" type="String">Version string in the form "major.minor.rev"</param>
        /// <param name="right" type="String">Version string in the form "major.minor.rev"</param>
        /// <returns type="String">The higher version string.</returns>

        if (left === right) {
            return left;
        }

        var leftParts = left.split(".");
        var rightParts = right.split(".");

        var len = (leftParts.length >= rightParts.length) ?
            leftParts.length :
            rightParts.length;

        for (var i = 0; i < len; i++) {
            var leftVersion = leftParts[i] && parseInt10(leftParts[i]);
            var rightVersion = rightParts[i] && parseInt10(rightParts[i]);
            if (leftVersion > rightVersion) {
                return left;
            }
            if (leftVersion < rightVersion) {
                return right;
            }
        }
    };

    var normalHeaders = {
        "accept": "Accept",
        "content-type": "Content-Type",
        "dataserviceversion": "DataServiceVersion",
        "maxdataserviceversion": "MaxDataServiceVersion"
    };

    var normalizeHeaders = function (headers) {
        /// <summary>Normalizes headers so they can be found with consistent casing.</summary>
        /// <param name="headers" type="Object">Dictionary of name/value pairs.</param>

        for (var name in headers) {
            var lowerName = name.toLowerCase();
            var normalName = normalHeaders[lowerName];
            if (normalName && name !== normalName) {
                var val = headers[name];
                delete headers[name];
                headers[normalName] = val;
            }
        }
    };

    var parseBool = function (propertyValue) {
        /// <summary>Parses a string into a boolean value.</summary>
        /// <param name="propertyValue">Value to parse.</param>
        /// <returns type="Boolean">true if the property value is 'true'; false otherwise.</returns>

        if (typeof propertyValue === "boolean") {
            return propertyValue;
        }

        return typeof propertyValue === "string" && propertyValue.toLowerCase() === "true";
    };


    // The captured indices for this expression are:
    // 0     - complete input
    // 1,2,3 - year with optional minus sign, month, day
    // 4,5,6 - hours, minutes, seconds
    // 7     - optional milliseconds
    // 8     - everything else (presumably offset information)
    var parseDateTimeRE = /^(-?\d{4,})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d+))?(.*)$/;

    var parseDateTimeMaybeOffset = function (value, withOffset, nullOnError) {
        /// <summary>Parses a string into a DateTime value.</summary>
        /// <param name="value" type="String">Value to parse.</param>
        /// <param name="withOffset" type="Boolean">Whether offset is expected.</param>
        /// <returns type="Date">The parsed value.</returns>

        // We cannot parse this in cases of failure to match or if offset information is specified.
        var parts = parseDateTimeRE.exec(value);
        var offset = (parts) ? getCanonicalTimezone(parts[8]) : null;

        if (!parts || (!withOffset && offset !== "Z")) {
            if (nullOnError) {
                return null;
            }
            throw { message: "Invalid date/time value" };
        }

        // Pre-parse years, account for year '0' being invalid in dateTime.
        var year = parseInt10(parts[1]);
        if (year <= 0) {
            year++;
        }

        // Pre-parse optional milliseconds, fill in default. Fail if value is too precise.
        var ms = parts[7];
        var ns = 0;
        if (!ms) {
            ms = 0;
        } else {
            if (ms.length > 7) {
                if (nullOnError) {
                    return null;
                }
                throw { message: "Cannot parse date/time value to given precision." };
            }

            ns = formatNumberWidth(ms.substring(3), 4, true);
            ms = formatNumberWidth(ms.substring(0, 3), 3, true);

            ms = parseInt10(ms);
            ns = parseInt10(ns);
        }

        // Pre-parse other time components and offset them if necessary.
        var hours = parseInt10(parts[4]);
        var minutes = parseInt10(parts[5]);
        var seconds = parseInt10(parts[6]) || 0;
        if (offset !== "Z") {
            // The offset is reversed to get back the UTC date, which is
            // what the API will eventually have.
            var timezone = parseTimezone(offset);
            var direction = -(timezone.d);
            hours += timezone.h * direction;
            minutes += timezone.m * direction;
        }

        // Set the date and time separately with setFullYear, so years 0-99 aren't biased like in Date.UTC.
        var result = new Date();
        result.setUTCFullYear(
            year,                       // Year.
            parseInt10(parts[2]) - 1,   // Month (zero-based for Date.UTC and setFullYear).
            parseInt10(parts[3])        // Date.
            );
        result.setUTCHours(hours, minutes, seconds, ms);

        if (isNaN(result.valueOf())) {
            if (nullOnError) {
                return null;
            }
            throw { message: "Invalid date/time value" };
        }

        if (withOffset) {
            result.__edmType = "Edm.DateTimeOffset";
            result.__offset = offset;
        }

        if (ns) {
            result.__ns = ns;
        }

        return result;
    };

    var parseDateTime = function (propertyValue, nullOnError) {
        /// <summary>Parses a string into a DateTime value.</summary>
        /// <param name="propertyValue" type="String">Value to parse.</param>
        /// <returns type="Date">The parsed value.</returns>

        return parseDateTimeMaybeOffset(propertyValue, false, nullOnError);
    };

    var parseDateTimeOffset = function (propertyValue, nullOnError) {
        /// <summary>Parses a string into a DateTimeOffset value.</summary>
        /// <param name="propertyValue" type="String">Value to parse.</param>
        /// <returns type="Date">The parsed value.</returns>
        /// <remarks>
        /// The resulting object is annotated with an __edmType property and
        /// an __offset property reflecting the original intended offset of
        /// the value. The time is adjusted for UTC time, as the current
        /// timezone-aware Date APIs will only work with the local timezone.
        /// </remarks>

        return parseDateTimeMaybeOffset(propertyValue, true, nullOnError);
    };

    // The captured indices for this expression are:
    // 0       - complete input
    // 1       - direction
    // 2,3,4   - years, months, days
    // 5,6,7,8 - hours, minutes, seconds, miliseconds

    var parseTimeRE = /^([+-])?P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)(?:\.(\d+))?S)?)?/;

    var isEdmDurationValue = function(value) {
        parseTimeRE.test(value);
    };

    var parseDuration = function (duration) {
        /// <summary>Parses a string in xsd:duration format.</summary>
        /// <param name="duration" type="String">Duration value.</param>
        /// <remarks>
        /// This method will throw an exception if the input string has a year or a month component.
        /// </remarks>
        /// <returns type="Object">Object representing the time</returns>

        var parts = parseTimeRE.exec(duration);

        if (parts === null) {
            throw { message: "Invalid duration value." };
        }

        var years = parts[2] || "0";
        var months = parts[3] || "0";
        var days = parseInt10(parts[4] || 0);
        var hours = parseInt10(parts[5] || 0);
        var minutes = parseInt10(parts[6] || 0);
        var seconds = parseFloat(parts[7] || 0);

        if (years !== "0" || months !== "0") {
            throw { message: "Unsupported duration value." };
        }

        var ms = parts[8];
        var ns = 0;
        if (!ms) {
            ms = 0;
        } else {
            if (ms.length > 7) {
                throw { message: "Cannot parse duration value to given precision." };
            }

            ns = formatNumberWidth(ms.substring(3), 4, true);
            ms = formatNumberWidth(ms.substring(0, 3), 3, true);

            ms = parseInt10(ms);
            ns = parseInt10(ns);
        }

        ms += seconds * 1000 + minutes * 60000 + hours * 3600000 + days * 86400000;

        if (parts[1] === "-") {
            ms = -ms;
        }

        var result = { ms: ms, __edmType: "Edm.Time" };

        if (ns) {
            result.ns = ns;
        }
        return result;
    };

    var parseTimezone = function (timezone) {
        /// <summary>Parses a timezone description in (+|-)nn:nn format.</summary>
        /// <param name="timezone" type="String">Timezone offset.</param>
        /// <returns type="Object">
        /// An object with a (d)irection property of 1 for + and -1 for -,
        /// offset (h)ours and offset (m)inutes.
        /// </returns>

        var direction = timezone.substring(0, 1);
        direction = (direction === "+") ? 1 : -1;

        var offsetHours = parseInt10(timezone.substring(1));
        var offsetMinutes = parseInt10(timezone.substring(timezone.indexOf(":") + 1));
        return { d: direction, h: offsetHours, m: offsetMinutes };
    };

    var prepareRequest = function (request, handler, context) {
        /// <summary>Prepares a request object so that it can be sent through the network.</summary>
        /// <param name="request">Object that represents the request to be sent.</param>
        /// <param name="handler">Handler for data serialization</param>
        /// <param name="context">Context used for preparing the request</param>

        // Default to GET if no method has been specified.
        if (!request.method) {
            request.method = "GET";
        }

        if (!request.headers) {
            request.headers = {};
        } else {
            normalizeHeaders(request.headers);
        }

        if (request.headers.Accept === undefined) {
            request.headers.Accept = handler.accept;
        }

        if (assigned(request.data) && request.body === undefined) {
            handler.write(request, context);
        }

        if (!assigned(request.headers.MaxDataServiceVersion)) {
            request.headers.MaxDataServiceVersion = handler.maxDataServiceVersion || "1.0";
        }
    };

    var traverseInternal = function (item, owner, callback) {
        /// <summary>Traverses a tree of objects invoking callback for every value.</summary>
        /// <param name="item" type="Object">Object or array to traverse.</param>
        /// <param name="callback" type="Function">
        /// Callback function with key and value, similar to JSON.parse reviver.
        /// </param>
        /// <returns type="Object">The object with traversed properties.</returns>
        /// <remarks>Unlike the JSON reviver, this won't delete null members.</remarks>

        if (item && typeof item === "object") {
            for (var name in item) {
                var value = item[name];
                var result = traverseInternal(value, name, callback);
                result = callback(name, result, owner);
                if (result !== value) {
                    if (value === undefined) {
                        delete item[name];
                    } else {
                        item[name] = result;
                    }
                }
            }
        }

        return item;
    };

    var traverse = function (item, callback) {
        /// <summary>Traverses a tree of objects invoking callback for every value.</summary>
        /// <param name="item" type="Object">Object or array to traverse.</param>
        /// <param name="callback" type="Function">
        /// Callback function with key and value, similar to JSON.parse reviver.
        /// </param>
        /// <returns type="Object">The traversed object.</returns>
        /// <remarks>Unlike the JSON reviver, this won't delete null members.</remarks>

        return callback("", traverseInternal(item, "", callback));
    };


    var ticks = 0;

    var canUseJSONP = function (request) {
        /// <summary>
        /// Checks whether the specified request can be satisfied with a JSONP request.
        /// </summary>
        /// <param name="request">Request object to check.</param>
        /// <returns type="Boolean">true if the request can be satisfied; false otherwise.</returns>

        // Requests that 'degrade' without changing their meaning by going through JSONP
        // are considered usable.
        //
        // We allow data to come in a different format, as the servers SHOULD honor the Accept
        // request but may in practice return content with a different MIME type.
        if (request.method && request.method !== "GET") {
            return false;
        }

        return true;
    };

    var createIFrame = function (url) {
        /// <summary>Creates an IFRAME tag for loading the JSONP script</summary>
        /// <param name="url" type="String">The source URL of the script</param>
        /// <returns type="HTMLElement">The IFRAME tag</returns>
        var iframe = window.document.createElement("IFRAME");
        iframe.style.display = "none";

        var attributeEncodedUrl = url.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/\</g, "&lt;");
        var html = "<html><head><script type=\"text/javascript\" src=\"" + attributeEncodedUrl + "\"><\/script><\/head><body><\/body><\/html>";

        var body = window.document.getElementsByTagName("BODY")[0];
        body.appendChild(iframe);

        writeHtmlToIFrame(iframe, html);
        return iframe;
    };

    var createXmlHttpRequest = function () {
        /// <summary>Creates a XmlHttpRequest object.</summary>
        /// <returns type="XmlHttpRequest">XmlHttpRequest object.</returns>
        if (window.XMLHttpRequest) {
            return new window.XMLHttpRequest();
        }
        var exception;
        if (window.ActiveXObject) {
            try {
                return new window.ActiveXObject("Msxml2.XMLHTTP.6.0");
            } catch (_) {
                try {
                    return new window.ActiveXObject("Msxml2.XMLHTTP.3.0");
                } catch (e) {
                    exception = e;
                }
            }
        } else {
            exception = {message: "XMLHttpRequest not supported"};
        }
        throw exception;
    };

    var isAbsoluteUrl = function (url) {
        /// <summary>Checks whether the specified URL is an absolute URL.</summary>
        /// <param name="url" type="String">URL to check.</param>
        /// <returns type="Boolean">true if the url is an absolute URL; false otherwise.</returns>

        return url.indexOf("http://") === 0 ||
            url.indexOf("https://") === 0 ||
            url.indexOf("file://") === 0;
    };

    var isLocalUrl = function (url) {
        /// <summary>Checks whether the specified URL is local to the current context.</summary>
        /// <param name="url" type="String">URL to check.</param>
        /// <returns type="Boolean">true if the url is a local URL; false otherwise.</returns>

        if (!isAbsoluteUrl(url)) {
            return true;
        }

        // URL-embedded username and password will not be recognized as same-origin URLs.
        var location = window.location;
        var locationDomain = location.protocol + "//" + location.host + "/";
        return (url.indexOf(locationDomain) === 0);
    };

    var removeCallback = function (name, tick) {
        /// <summary>Removes a callback used for a JSONP request.</summary>
        /// <param name="name" type="String">Function name to remove.</param>
        /// <param name="tick" type="Number">Tick count used on the callback.</param>
        try {
            delete window[name];
        } catch (err) {
            window[name] = undefined;
            if (tick === ticks - 1) {
                ticks -= 1;
            }
        }
    };

    var removeIFrame = function (iframe) {
        /// <summary>Removes an iframe.</summary>
        /// <param name="iframe" type="Object">The iframe to remove.</param>
        /// <returns type="Object">Null value to be assigned to iframe reference.</returns>
        if (iframe) {
            writeHtmlToIFrame(iframe, "");
            iframe.parentNode.removeChild(iframe);
        }

        return null;
    };

    var readResponseHeaders = function (xhr, headers) {
        /// <summary>Reads response headers into array.</summary>
        /// <param name="xhr" type="XMLHttpRequest">HTTP request with response available.</param>
        /// <param name="headers" type="Array">Target array to fill with name/value pairs.</param>

        var responseHeaders = xhr.getAllResponseHeaders().split(/\r?\n/);
        var i, len;

        for (i = 0, len = responseHeaders.length; i < len; i++) {
            if (responseHeaders[i]) {
                var header = responseHeaders[i].split(": ");
                headers[header[0]] = header[1];
            }
        }

        // WSi 09/01/2014 fix to handle Firefox CORS bug as per: DP-654
        var requiredHeaders = [
            'Content-Type'
            , 'DataServiceVersion'

            /*, 'Content-Length'
             , 'Cache-Control'
             , 'Access-Control-Expose-Headers'
             , 'X-Content-Type-Options'
             , 'Date'*/
        ];

        for (i = 0; i < requiredHeaders.length; i++) {
            if (headers[requiredHeaders[i]] === undefined &&
                xhr.getResponseHeader(requiredHeaders[i])) {
                headers[requiredHeaders[i]] = xhr.getResponseHeader(requiredHeaders[i]);
            }
        }
    };

    var writeHtmlToIFrame = function (iframe, html) {
        /// <summary>Writes HTML to an IFRAME document.</summary>
        /// <param name="iframe" type="HTMLElement">The IFRAME element to write to.</param>
        /// <param name="html" type="String">The HTML to write.</param>
        var frameDocument = (iframe.contentWindow) ? iframe.contentWindow.document : iframe.contentDocument.document;
        frameDocument.open();
        frameDocument.write(html);
        frameDocument.close();
    };

    odata.defaultHttpClient = {
        callbackParameterName: "$callback",

        formatQueryString: "$format=json",

        enableJsonpCallback: false,

        request: function (request, success, error) {
            /// <summary>Performs a network request.</summary>
            /// <param name="request" type="Object">Request description.</request>
            /// <param name="success" type="Function">Success callback with the response object.</param>
            /// <param name="error" type="Function">Error callback with an error object.</param>
            /// <returns type="Object">Object with an 'abort' method for the operation.</returns>

            var result = {};
            var xhr = null;
            var done = false;
            var iframe;

            var processResponse = function (url, statusCode, statusText, body) {
                // Workaround for XHR behavior on IE.
                // ref: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
                if (statusCode === 1223) {
                    statusCode = 204;
                    statusText = "No Content";
                }

                var headers = [];
                readResponseHeaders(xhr, headers);

                var response = {
                    requestUri: url,
                    statusCode: statusCode,
                    statusText: statusText,
                    headers: headers,
                    body: body
                };

                done = true;
                xhr = null;

                return response;
            };

            result.abort = function () {
                iframe = removeIFrame(iframe);
                if (done) {
                    return;
                }

                done = true;
                if (xhr) {
                    xhr.abort();
                    xhr = null;
                }

                error({message: "Request aborted"});
            };

            var handleTimeout = function () {
                iframe = removeIFrame(iframe);

                if (done || xhr === null) {
                    return;
                }

                var response = processResponse(url, 598, 'Request timed out', [], xhr.responseText);

                error({message: 'Request timed out', request: request, response: response});
            };

            var name;
            var url = request.requestUri;
            var enableJsonpCallback = defined(request.enableJsonpCallback, this.enableJsonpCallback);
            var callbackParameterName = defined(request.callbackParameterName, this.callbackParameterName);
            var formatQueryString = defined(request.formatQueryString, this.formatQueryString);
            if (!enableJsonpCallback || isLocalUrl(url)) {

                xhr = createXmlHttpRequest();

                xhr.onload = function () {
                    //NT TODO: ?
                    if (done || xhr === null) {
                        return;
                    }

                    var response = processResponse(url, xhr.status, xhr.statusText, xhr.responseText);

                    if (response.statusCode >= 200 && response.statusCode <= 299) {
                        success(response);
                    } else {
                        error({message: "HTTP request failed", request: request, response: response});
                    }
                };

                xhr.onerror = function () {
                    //NT TODO: ?
                    if (done || xhr === null) {
                        return;
                    }

                    var response = processResponse(url, xhr.status, xhr.statusText, xhr.responseText);

                    error({message: "HTTP request failed", request: request, response: response});
                };

                xhr.open(request.method || "GET", url, true, request.user, request.password);

                // Set the name/value pairs.
                if (request.headers) {
                    for (name in request.headers) {
                        xhr.setRequestHeader(name, request.headers[name]);
                    }
                }

                // Set the timeout if available.
                if (request.timeoutMS) {
                    xhr.timeout = request.timeoutMS;
                    xhr.ontimeout = handleTimeout;
                }

                xhr.send(request.body);
            } else {
                if (!canUseJSONP(request)) {
                    throw {message: "Request is not local and cannot be done through JSONP."};
                }

                var tick = ticks;
                ticks += 1;
                var tickText = tick.toString();
                var succeeded = false;
                var timeoutId;
                name = "handleJSONP_" + tickText;
                window[name] = function (data) {
                    iframe = removeIFrame(iframe);
                    if (!done) {
                        succeeded = true;
                        window.clearTimeout(timeoutId);
                        removeCallback(name, tick);

                        // Workaround for IE8 and IE10 below where trying to access data.constructor after the IFRAME has been removed
                        // throws an "unknown exception"
                        if (window.ActiveXObject) {
                            data = window.JSON.parse(window.JSON.stringify(data));
                        }

                        var headers;
                        // Adding dataServiceVersion in case of json light ( data.d doesn't exist )
                        if (data.d === undefined) {
                            headers = {
                                "Content-Type": "application/json;odata=minimalmetadata",
                                dataServiceVersion: "3.0"
                            };
                        } else {
                            headers = {"Content-Type": "application/json"};
                        }
                        // Call the success callback in the context of the parent window, instead of the IFRAME
                        delay(function () {
                            removeIFrame(iframe);
                            success({body: data, statusCode: 200, headers: headers});
                        });
                    }
                };

                // Default to two minutes before timing out, 1000 ms * 60 * 2 = 120000.
                var timeoutMS = (request.timeoutMS) ? request.timeoutMS : 120000;
                timeoutId = window.setTimeout(handleTimeout, timeoutMS);

                var queryStringParams = callbackParameterName + "=parent." + name;
                if (this.formatQueryString) {
                    queryStringParams += "&" + formatQueryString;
                }

                var qIndex = url.indexOf("?");
                if (qIndex === -1) {
                    url = url + "?" + queryStringParams;
                } else if (qIndex === url.length - 1) {
                    url = url + queryStringParams;
                } else {
                    url = url + "&" + queryStringParams;
                }

                iframe = createIFrame(url);
            }

            return result;
        }
    };



    var MAX_DATA_SERVICE_VERSION = "3.0";

    var contentType = function (str) {
        /// <summary>Parses a string into an object with media type and properties.</summary>
        /// <param name="str" type="String">String with media type to parse.</param>
        /// <returns>null if the string is empty; an object with 'mediaType' and a 'properties' dictionary otherwise.</returns>

        if (!str) {
            return null;
        }

        var contentTypeParts = str.split(";");
        var properties = {};

        var i, len;
        for (i = 1, len = contentTypeParts.length; i < len; i++) {
            var contentTypeParams = contentTypeParts[i].split("=");
            properties[trimString(contentTypeParams[0])] = contentTypeParams[1];
        }

        return { mediaType: trimString(contentTypeParts[0]), properties: properties };
    };

    var contentTypeToString = function (contentType) {
        /// <summary>Serializes an object with media type and properties dictionary into a string.</summary>
        /// <param name="contentType">Object with media type and properties dictionary to serialize.</param>
        /// <returns>String representation of the media type object; undefined if contentType is null or undefined.</returns>

        if (!contentType) {
            return undefined;
        }

        var result = contentType.mediaType;
        var property;
        for (property in contentType.properties) {
            result += ";" + property + "=" + contentType.properties[property];
        }
        return result;
    };

    var createReadWriteContext = function (contentType, dataServiceVersion, context, handler) {
        /// <summary>Creates an object that is going to be used as the context for the handler's parser and serializer.</summary>
        /// <param name="contentType">Object with media type and properties dictionary.</param>
        /// <param name="dataServiceVersion" type="String">String indicating the version of the protocol to use.</param>
        /// <param name="context">Operation context.</param>
        /// <param name="handler">Handler object that is processing a resquest or response.</param>
        /// <returns>Context object.</returns>

        var rwContext = {};
        extend(rwContext, context);
        extend(rwContext, {
            contentType: contentType,
            dataServiceVersion: dataServiceVersion,
            handler: handler
        });

        return rwContext;
    };

    var fixRequestHeader = function (request, name, value) {
        /// <summary>Sets a request header's value. If the header has already a value other than undefined, null or empty string, then this method does nothing.</summary>
        /// <param name="request">Request object on which the header will be set.</param>
        /// <param name="name" type="String">Header name.</param>
        /// <param name="value" type="String">Header value.</param>
        if (!request) {
            return;
        }

        var headers = request.headers;
        if (!headers[name]) {
            headers[name] = value;
        }
    };

    var fixDataServiceVersionHeader = function (request, version) {
        /// <summary>Sets the DataServiceVersion header of the request if its value is not yet defined or of a lower version.</summary>
        /// <param name="request">Request object on which the header will be set.</param>
        /// <param name="version" type="String">Version value.</param>
        /// <remarks>
        /// If the request has already a version value higher than the one supplied the this function does nothing.
        /// </remarks>

        if (request) {
            var headers = request.headers;
            var dsv = headers["DataServiceVersion"];
            headers["DataServiceVersion"] = dsv ? maxVersion(dsv, version) : version;
        }
    };

    var getRequestOrResponseHeader = function (requestOrResponse, name) {
        /// <summary>Gets the value of a request or response header.</summary>
        /// <param name="requestOrResponse">Object representing a request or a response.</param>
        /// <param name="name" type="String">Name of the header to retrieve.</param>
        /// <returns type="String">String value of the header; undefined if the header cannot be found.</returns>

        var headers = requestOrResponse.headers;
        return (headers && headers[name]) || undefined;
    };

    var getContentType = function (requestOrResponse) {
        /// <summary>Gets the value of the Content-Type header from a request or response.</summary>
        /// <param name="requestOrResponse">Object representing a request or a response.</param>
        /// <returns type="Object">Object with 'mediaType' and a 'properties' dictionary; null in case that the header is not found or doesn't have a value.</returns>

        return contentType(getRequestOrResponseHeader(requestOrResponse, "Content-Type"));
    };

    var versionRE = /^\s?(\d+\.\d+);?.*$/;
    var getDataServiceVersion = function (requestOrResponse) {
        /// <summary>Gets the value of the DataServiceVersion header from a request or response.</summary>
        /// <param name="requestOrResponse">Object representing a request or a response.</param>
        /// <returns type="String">Data service version; undefined if the header cannot be found.</returns>

        var value = getRequestOrResponseHeader(requestOrResponse, "DataServiceVersion");
        if (value) {
            var matches = versionRE.exec(value);
            if (matches && matches.length) {
                return matches[1];
            }
        }

        // Fall through and return undefined.
    };

    var handlerAccepts = function (handler, cType) {
        /// <summary>Checks that a handler can process a particular mime type.</summary>
        /// <param name="handler">Handler object that is processing a resquest or response.</param>
        /// <param name="cType">Object with 'mediaType' and a 'properties' dictionary.</param>
        /// <returns type="Boolean">True if the handler can process the mime type; false otherwise.</returns>

        // The following check isn't as strict because if cType.mediaType = application/; it will match an accept value of "application/xml";
        // however in practice we don't not expect to see such "suffixed" mimeTypes for the handlers.
        return handler.accept.indexOf(cType.mediaType) >= 0;
    };

    var handlerRead = function (handler, parseCallback, response, context) {
        /// <summary>Invokes the parser associated with a handler for reading the payload of a HTTP response.</summary>
        /// <param name="handler">Handler object that is processing the response.</param>
        /// <param name="parseCallback" type="Function">Parser function that will process the response payload.</param>
        /// <param name="response">HTTP response whose payload is going to be processed.</param>
        /// <param name="context">Object used as the context for processing the response.</param>
        /// <returns type="Boolean">True if the handler processed the response payload and the response.data property was set; false otherwise.</returns>

        if (!response || !response.headers) {
            return false;
        }

        var cType = getContentType(response);
        var version = getDataServiceVersion(response) || "";
        var body = response.body;

        if (!assigned(body)) {
            return false;
        }

        if (handlerAccepts(handler, cType)) {
            var readContext = createReadWriteContext(cType, version, context, handler);
            readContext.response = response;
            response.data = parseCallback(handler, body, readContext);
            return response.data !== undefined;
        }

        return false;
    };

    var handlerWrite = function (handler, serializeCallback, request, context) {
        /// <summary>Invokes the serializer associated with a handler for generating the payload of a HTTP request.</summary>
        /// <param name="handler">Handler object that is processing the request.</param>
        /// <param name="serializeCallback" type="Function">Serializer function that will generate the request payload.</param>
        /// <param name="response">HTTP request whose payload is going to be generated.</param>
        /// <param name="context">Object used as the context for serializing the request.</param>
        /// <returns type="Boolean">True if the handler serialized the request payload and the request.body property was set; false otherwise.</returns>
        if (!request || !request.headers) {
            return false;
        }

        var cType = getContentType(request);
        var version = getDataServiceVersion(request);

        if (!cType || handlerAccepts(handler, cType)) {
            var writeContext = createReadWriteContext(cType, version, context, handler);
            writeContext.request = request;

            request.body = serializeCallback(handler, request.data, writeContext);

            if (request.body !== undefined) {
                fixDataServiceVersionHeader(request, writeContext.dataServiceVersion || "1.0");

                fixRequestHeader(request, "Content-Type", contentTypeToString(writeContext.contentType));
                fixRequestHeader(request, "MaxDataServiceVersion", handler.maxDataServiceVersion);
                return true;
            }
        }

        return false;
    };

    var handler = function (parseCallback, serializeCallback, accept, maxDataServiceVersion) {
        /// <summary>Creates a handler object for processing HTTP requests and responses.</summary>
        /// <param name="parseCallback" type="Function">Parser function that will process the response payload.</param>
        /// <param name="serializeCallback" type="Function">Serializer function that will generate the request payload.</param>
        /// <param name="accept" type="String">String containing a comma separated list of the mime types that this handler can work with.</param>
        /// <param name="maxDataServiceVersion" type="String">String indicating the highest version of the protocol that this handler can work with.</param>
        /// <returns type="Object">Handler object.</returns>

        return {
            accept: accept,
            maxDataServiceVersion: maxDataServiceVersion,

            read: function (response, context) {
                return handlerRead(this, parseCallback, response, context);
            },

            write: function (request, context) {
                return handlerWrite(this, serializeCallback, request, context);
            }
        };
    };

    var textParse = function (handler, body /*, context */) {
        return body;
    };

    var textSerialize = function (handler, data /*, context */) {
        if (assigned(data)) {
            return data.toString();
        } else {
            return undefined;
        }
    };

    odata.textHandler = handler(textParse, textSerialize, "text/plain", MAX_DATA_SERVICE_VERSION);


    var gmlOpenGis = http + "www.opengis.net";           // http://www.opengis.net
    var gmlXmlNs = gmlOpenGis + "/gml";                 // http://www.opengis.net/gml
    var gmlSrsPrefix = gmlOpenGis + "/def/crs/EPSG/0/"; // http://www.opengis.net/def/crs/EPSG/0/

    var gmlPrefix = "gml";

    var gmlCreateGeoJSONOBject = function (type, member, data) {
        /// <summary>Creates a GeoJSON object with the specified type, member and value.</summary>
        /// <param name="type" type="String">GeoJSON object type.</param>
        /// <param name="member" type="String">Name for the data member in the GeoJSON object.</param>
        /// <param name="data">Data to be contained by the GeoJSON object.</param>
        /// <returns type="Object">GeoJSON object.</returns>

        var result = { type: type };
        result[member] = data;
        return result;
    };

    var gmlSwapLatLong = function (coordinates) {
        /// <summary>Swaps the longitude and latitude in the coordinates array.</summary>
        /// <param name="coordinates" type="Array">Array of doubles descrbing a set of coordinates.</param>
        /// <returns type="Array">Array of doubles with the latitude and longitude components swapped.</returns>

        if (isArray(coordinates) && coordinates.length >= 2) {
            var tmp = coordinates[0];
            coordinates[0] = coordinates[1];
            coordinates[1] = tmp;
        }
        return coordinates;
    };

    var gmlReadODataMultiItem = function (domElement, type, member, members, valueReader, isGeography) {
        /// <summary>
        ///    Reads a GML DOM element that represents a composite structure like a multi-point or a
        ///    multi-geometry returnig its GeoJSON representation.
        /// </summary>
        /// <param name="domElement">GML DOM element.</param>
        /// <param name="type" type="String">GeoJSON object type.</param>
        /// <param name="member" type="String">Name for the child element representing a single item in the composite structure.</param>
        /// <param name="members" type="String">Name for the child element representing a collection of items in the composite structure.</param>
        /// <param name="valueReader" type="Function">Callback function invoked to get the coordinates of each item in the comoposite structure.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Object">GeoJSON object.</returns>

        var coordinates = gmlReadODataMultiItemValue(domElement, member, members, valueReader, isGeography);
        return gmlCreateGeoJSONOBject(type, "coordinates", coordinates);
    };

    var gmlReadODataMultiItemValue = function (domElement, member, members, valueReader, isGeography) {
        /// <summary>
        ///    Reads the value of a GML DOM element that represents a composite structure like a multi-point or a
        ///    multi-geometry returnig its items.
        /// </summary>
        /// <param name="domElement">GML DOM element.</param>
        /// <param name="type" type="String">GeoJSON object type.</param>
        /// <param name="member" type="String">Name for the child element representing a single item in the composite structure.</param>
        /// <param name="members" type="String">Name for the child element representing a collection of items in the composite structure.</param>
        /// <param name="valueReader" type="Function">Callback function invoked to get the transformed value of each item in the comoposite structure.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Array">Array containing the transformed value of each item in the multi-item.</returns>

        var items = [];

        xmlChildElements(domElement, function (child) {
            if (xmlNamespaceURI(child) !== gmlXmlNs) {
                return;
            }

            var localName = xmlLocalName(child);

            if (localName === member) {
                var valueElement = xmlFirstChildElement(child, gmlXmlNs);
                if (valueElement) {
                    var value = valueReader(valueElement, isGeography);
                    if (value) {
                        items.push(value);
                    }
                }
                return;
            }

            if (localName === members) {
                xmlChildElements(child, function (valueElement) {
                    if (xmlNamespaceURI(valueElement) !== gmlXmlNs) {
                        return;
                    }

                    var value = valueReader(valueElement, isGeography);
                    if (value) {
                        items.push(value);
                    }
                });
            }
        });
        return items;
    };

    var gmlReadODataCollection = function (domElement, isGeography) {
        /// <summary>Reads a GML DOM element representing a multi-geometry returning its GeoJSON representation.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Object">MultiGeometry object in GeoJSON format.</returns>

        var geometries = gmlReadODataMultiItemValue(domElement, "geometryMember", "geometryMembers", gmlReadODataSpatialValue, isGeography);
        return gmlCreateGeoJSONOBject(GEOJSON_GEOMETRYCOLLECTION, "geometries", geometries);
    };

    var gmlReadODataLineString = function (domElement, isGeography) {
        /// <summary>Reads a GML DOM element representing a line string returning its GeoJSON representation.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Object">LineString object in GeoJSON format.</returns>

        return gmlCreateGeoJSONOBject(GEOJSON_LINESTRING, "coordinates", gmlReadODataLineValue(domElement, isGeography));
    };

    var gmlReadODataMultiLineString = function (domElement, isGeography) {
        /// <summary>Reads a GML DOM element representing a multi-line string returning its GeoJSON representation.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Object">MultiLineString object in GeoJSON format.</returns>

        return gmlReadODataMultiItem(domElement, GEOJSON_MULTILINESTRING, "curveMember", "curveMembers", gmlReadODataLineValue, isGeography);
    };

    var gmlReadODataMultiPoint = function (domElement, isGeography) {
        /// <summary>Reads a GML DOM element representing a multi-point returning its GeoJSON representation.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Object">MultiPoint object in GeoJSON format.</returns>

        return gmlReadODataMultiItem(domElement, GEOJSON_MULTIPOINT, "pointMember", "pointMembers", gmlReadODataPointValue, isGeography);
    };

    var gmlReadODataMultiPolygon = function (domElement, isGeography) {
        /// <summary>Reads a GML DOM element representing a multi-polygon returning its GeoJSON representation.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Object">MultiPolygon object in GeoJSON format.</returns>

        return gmlReadODataMultiItem(domElement, GEOJSON_MULTIPOLYGON, "surfaceMember", "surfaceMembers", gmlReadODataPolygonValue, isGeography);
    };

    var gmlReadODataPoint = function (domElement, isGeography) {
        /// <summary>Reads a GML DOM element representing a point returning its GeoJSON representation.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Object">Point object in GeoJSON format.</returns>

        return gmlCreateGeoJSONOBject(GEOJSON_POINT, "coordinates", gmlReadODataPointValue(domElement, isGeography));
    };

    var gmlReadODataPolygon = function (domElement, isGeography) {
        /// <summary>Reads a GML DOM element representing a polygon returning its GeoJSON representation.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Object">Polygon object in GeoJSON format.</returns>

        return gmlCreateGeoJSONOBject(GEOJSON_POLYGON, "coordinates", gmlReadODataPolygonValue(domElement, isGeography));
    };

    var gmlReadODataLineValue = function (domElement, isGeography) {
        /// <summary>Reads the value of a GML DOM element representing a line returning its set of coordinates.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Array">Array containing an array of doubles for each coordinate of the line.</returns>

        var coordinates = [];

        xmlChildElements(domElement, function (child) {
            var nsURI = xmlNamespaceURI(child);

            if (nsURI !== gmlXmlNs) {
                return;
            }

            var localName = xmlLocalName(child);

            if (localName === "posList") {
                coordinates = gmlReadODataPosListValue(child, isGeography);
                return;
            }
            if (localName === "pointProperty") {
                coordinates.push(gmlReadODataPointWrapperValue(child, isGeography));
                return;
            }
            if (localName === "pos") {
                coordinates.push(gmlReadODataPosValue(child, isGeography));
                return;
            }
        });

        return coordinates;
    };

    var gmlReadODataPointValue = function (domElement, isGeography) {
        /// <summary>Reads the value of a GML DOM element representing a point returning its coordinates.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Array">Array of doubles containing the point coordinates.</returns>

        var pos = xmlFirstChildElement(domElement, gmlXmlNs, "pos");
        return pos ? gmlReadODataPosValue(pos, isGeography) : [];
    };

    var gmlReadODataPointWrapperValue = function (domElement, isGeography) {
        /// <summary>Reads the value of a GML DOM element wrapping an element representing a point returning its coordinates.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Array">Array of doubles containing the point coordinates.</returns>

        var point = xmlFirstChildElement(domElement, gmlXmlNs, "Point");
        return point ? gmlReadODataPointValue(point, isGeography) : [];
    };

    var gmlReadODataPolygonValue = function (domElement, isGeography) {
        /// <summary>Reads the value of a GML DOM element representing a polygon returning its set of coordinates.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Array">Array containing an array of array of doubles for each ring of the polygon.</returns>

        var coordinates = [];
        var exteriorFound = false;
        xmlChildElements(domElement, function (child) {
            if (xmlNamespaceURI(child) !== gmlXmlNs) {
                return;
            }

            // Only the exterior and the interior rings are interesting
            var localName = xmlLocalName(child);
            if (localName === "exterior") {
                exteriorFound = true;
                coordinates.unshift(gmlReadODataPolygonRingValue(child, isGeography));
                return;
            }
            if (localName === "interior") {
                coordinates.push(gmlReadODataPolygonRingValue(child, isGeography));
                return;
            }
        });

        if (!exteriorFound && coordinates.length > 0) {
            // Push an empty exterior ring.
            coordinates.unshift([[]]);
        }

        return coordinates;
    };

    var gmlReadODataPolygonRingValue = function (domElement, isGeography) {
        /// <summary>Reads the value of a GML DOM element representing a linear ring in a GML Polygon element.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Array">Array containing an array of doubles for each coordinate of the linear ring.</returns>

        var value = [];
        xmlChildElements(domElement, function (child) {
            if (xmlNamespaceURI(child) !== gmlXmlNs || xmlLocalName(child) !== "LinearRing") {
                return;
            }
            value = gmlReadODataLineValue(child, isGeography);
        });
        return value;
    };

    var gmlReadODataPosListValue = function (domElement, isGeography) {
        /// <summary>Reads the value of a GML DOM element representing a list of positions retruning its set of coordinates.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        ///
        ///    The positions described by the list are assumed to be 2D, so 
        ///    an exception will be thrown if the list has an odd number elements.
        /// </remarks>
        /// <returns type="Array">Array containing an array of doubles for each coordinate in the list.</returns>

        var coordinates = gmlReadODataPosValue(domElement, false);
        var len = coordinates.length;

        if (len % 2 !== 0) {
            throw { message: "GML posList element has an uneven number of numeric values" };
        }

        var value = [];
        for (var i = 0; i < len; i += 2) {
            var pos = coordinates.slice(i, i + 2);
            value.push(isGeography ? gmlSwapLatLong(pos) : pos);
        }
        return value;
    };

    var gmlReadODataPosValue = function (domElement, isGeography) {
        /// <summary>Reads the value of a GML element describing a position or a set of coordinates in an OData spatial property value.</summary>
        /// <param name="property">DOM element for the GML element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns type="Array">Array of doubles containing the coordinates.</returns>

        var value = [];
        var delims = " \t\r\n";
        var text = xmlInnerText(domElement);

        if (text) {
            var len = text.length;
            var start = 0;
            var end = 0;

            while (end <= len) {
                if (delims.indexOf(text.charAt(end)) !== -1) {
                    var coord = text.substring(start, end);
                    if (coord) {
                        value.push(parseFloat(coord));
                    }
                    start = end + 1;
                }
                end++;
            }
        }

        return isGeography ? gmlSwapLatLong(value) : value;
    };

    var gmlReadODataSpatialValue = function (domElement, isGeography) {
        /// <summary>Reads the value of a GML DOM element a spatial value in an OData XML document.</summary>
        /// <param name="domElement">DOM element.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each position coordinates in the resulting GeoJSON object.
        /// </remarks>
        /// <returns type="Array">Array containing an array of doubles for each coordinate of the polygon.</returns>

        var localName = xmlLocalName(domElement);
        var reader;

        switch (localName) {
            case "Point":
                reader = gmlReadODataPoint;
                break;
            case "Polygon":
                reader = gmlReadODataPolygon;
                break;
            case "LineString":
                reader = gmlReadODataLineString;
                break;
            case "MultiPoint":
                reader = gmlReadODataMultiPoint;
                break;
            case "MultiCurve":
                reader = gmlReadODataMultiLineString;
                break;
            case "MultiSurface":
                reader = gmlReadODataMultiPolygon;
                break;
            case "MultiGeometry":
                reader = gmlReadODataCollection;
                break;
            default:
                throw { message: "Unsupported element: " + localName, element: domElement };
        }

        var value = reader(domElement, isGeography);
        // Read the CRS
        // WCF Data Services qualifies the srsName attribute withing the GML namespace; however
        // other end points might no do this as per the standard.

        var srsName = xmlAttributeValue(domElement, "srsName", gmlXmlNs) ||
                      xmlAttributeValue(domElement, "srsName");

        if (srsName) {
            if (srsName.indexOf(gmlSrsPrefix) !== 0) {
                throw { message: "Unsupported srs name: " + srsName, element: domElement };
            }

            var crsId = srsName.substring(gmlSrsPrefix.length);
            if (crsId) {
                value.crs = {
                    type: "name",
                    properties: {
                        name: "EPSG:" + crsId
                    }
                };
            }
        }
        return value;
    };

    var gmlNewODataSpatialValue = function (dom, value, type, isGeography) {
        /// <summary>Creates a new GML DOM element for the value of an OData spatial property or GeoJSON object.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="value" type="Object">Spatial property value in GeoJSON format.</param>
        /// <param name="type" type="String">String indicating the GeoJSON type of the value to serialize.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in the GeoJSON value is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace for the spatial value. </returns>

        var gmlWriter;

        switch (type) {
            case GEOJSON_POINT:
                gmlWriter = gmlNewODataPoint;
                break;
            case GEOJSON_LINESTRING:
                gmlWriter = gmlNewODataLineString;
                break;
            case GEOJSON_POLYGON:
                gmlWriter = gmlNewODataPolygon;
                break;
            case GEOJSON_MULTIPOINT:
                gmlWriter = gmlNewODataMultiPoint;
                break;
            case GEOJSON_MULTILINESTRING:
                gmlWriter = gmlNewODataMultiLineString;
                break;
            case GEOJSON_MULTIPOLYGON:
                gmlWriter = gmlNewODataMultiPolygon;
                break;
            case GEOJSON_GEOMETRYCOLLECTION:
                gmlWriter = gmlNewODataGeometryCollection;
                break;
            default:
                return null;
        }

        var gml = gmlWriter(dom, value, isGeography);

        // Set the srsName attribute if applicable.
        var crs = value.crs;
        if (crs) {
            if (crs.type === "name") {
                var properties = crs.properties;
                var name = properties && properties.name;
                if (name && name.indexOf("ESPG:") === 0 && name.length > 5) {
                    var crsId = name.substring(5);
                    var srsName = xmlNewAttribute(dom, null, "srsName", gmlPrefix + crsId);
                    xmlAppendChild(gml, srsName);
                }
            }
        }

        return gml;
    };

    var gmlNewODataElement = function (dom, name, children) {
        /// <summary>Creates a new DOM element in the GML namespace.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Local name of the GML element to create.</param>
        /// <param name="children" type="Array">Array containing DOM nodes or string values that will be added as children of the new DOM element.</param>
        /// <returns>New DOM element in the GML namespace.</returns>
        /// <remarks>
        ///    If a value in the children collection is a string, then a new DOM text node is going to be created
        ///    for it and then appended as a child of the new DOM Element.
        /// </remarks>

        return xmlNewElement(dom, gmlXmlNs, xmlQualifiedName(gmlPrefix, name), children);
    };

    var gmlNewODataPosElement = function (dom, coordinates, isGeography) {
        /// <summary>Creates a new GML pos DOM element.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="coordinates" type="Array">Array of doubles describing the coordinates of the pos element.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the coordinates use a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first coordinate is the Longitude and
        ///    will be serialized as the second component of the <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New pos DOM element in the GML namespace.</returns>

        var posValue = isArray(coordinates) ? coordinates : [];

        // If using a geographic reference system, then the first coordinate is the longitude and it has to
        // swapped with the latitude.
        posValue = isGeography ? gmlSwapLatLong(posValue) : posValue;

        return gmlNewODataElement(dom, "pos", posValue.join(" "));
    };

    var gmlNewODataLineElement = function (dom, name, coordinates, isGeography) {
        /// <summary>Creates a new GML DOM element representing a line.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Name of the element to create.</param>
        /// <param name="coordinates" type="Array">Array of array of doubles describing the coordinates of the line element.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the coordinates use a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace.</returns>

        var element = gmlNewODataElement(dom, name);
        if (isArray(coordinates)) {
            var i, len;
            for (i = 0, len = coordinates.length; i < len; i++) {
                xmlAppendChild(element, gmlNewODataPosElement(dom, coordinates[i], isGeography));
            }

            if (len === 0) {
                xmlAppendChild(element, gmlNewODataElement(dom, "posList"));
            }
        }
        return element;
    };

    var gmlNewODataPointElement = function (dom, coordinates, isGeography) {
        /// <summary>Creates a new GML Point DOM element.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="value" type="Object">GeoJSON Point object.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in the GeoJSON value is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace for the GeoJSON Point.</returns>

        return gmlNewODataElement(dom, "Point", gmlNewODataPosElement(dom, coordinates, isGeography));
    };

    var gmlNewODataLineStringElement = function (dom, coordinates, isGeography) {
        /// <summary>Creates a new GML LineString DOM element.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="coordinates" type="Array">Array of array of doubles describing the coordinates of the line element.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in the GeoJSON value is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace for the GeoJSON LineString.</returns>

        return gmlNewODataLineElement(dom, "LineString", coordinates, isGeography);
    };

    var gmlNewODataPolygonRingElement = function (dom, name, coordinates, isGeography) {
        /// <summary>Creates a new GML DOM element representing a polygon ring.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Name of the element to create.</param>
        /// <param name="coordinates" type="Array">Array of array of doubles describing the coordinates of the polygon ring.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the coordinates use a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace.</returns>

        var ringElement = gmlNewODataElement(dom, name);
        if (isArray(coordinates) && coordinates.length > 0) {
            var linearRing = gmlNewODataLineElement(dom, "LinearRing", coordinates, isGeography);
            xmlAppendChild(ringElement, linearRing);
        }
        return ringElement;
    };

    var gmlNewODataPolygonElement = function (dom, coordinates, isGeography) {
        /// <summary>Creates a new GML Polygon DOM element for a GeoJSON Polygon object.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="coordinates" type="Array">Array of array of array of doubles describing the coordinates of the polygon.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in the GeoJSON value is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace.</returns>

        var len = coordinates && coordinates.length;
        var element = gmlNewODataElement(dom, "Polygon");

        if (isArray(coordinates) && len > 0) {
            xmlAppendChild(element, gmlNewODataPolygonRingElement(dom, "exterior", coordinates[0], isGeography));

            var i;
            for (i = 1; i < len; i++) {
                xmlAppendChild(element, gmlNewODataPolygonRingElement(dom, "interior", coordinates[i], isGeography));
            }
        }
        return element;
    };

    var gmlNewODataPoint = function (dom, value, isGeography) {
        /// <summary>Creates a new GML Point DOM element for a GeoJSON Point object.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="value" type="Object">GeoJSON Point object.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in the GeoJSON value is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace for the GeoJSON Point.</returns>

        return gmlNewODataPointElement(dom, value.coordinates, isGeography);
    };

    var gmlNewODataLineString = function (dom, value, isGeography) {
        /// <summary>Creates a new GML LineString DOM element for a GeoJSON LineString object.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="value" type="Object">GeoJSON LineString object.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in the GeoJSON value is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace for the GeoJSON LineString.</returns>

        return gmlNewODataLineStringElement(dom, value.coordinates, isGeography);
    };

    var gmlNewODataPolygon = function (dom, value, isGeography) {
        /// <summary>Creates a new GML Polygon DOM element for a GeoJSON Polygon object.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="value" type="Object">GeoJSON Polygon object.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in the GeoJSON value is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace for the GeoJSON Polygon.</returns>

        return gmlNewODataPolygonElement(dom, value.coordinates, isGeography);
    };

    var gmlNewODataMultiItem = function (dom, name, members, items, itemWriter, isGeography) {
        /// <summary>Creates a new GML DOM element for a composite structure like a multi-point or a multi-geometry.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Name of the element to create.</param>
        /// <param name="items" type="Array">Array of items in the composite structure.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the multi-item uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each of the items is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace.</returns>

        var len = items && items.length;
        var element = gmlNewODataElement(dom, name);

        if (isArray(items) && len > 0) {
            var membersElement = gmlNewODataElement(dom, members);
            var i;
            for (i = 0; i < len; i++) {
                xmlAppendChild(membersElement, itemWriter(dom, items[i], isGeography));
            }
            xmlAppendChild(element, membersElement);
        }
        return element;
    };

    var gmlNewODataMultiPoint = function (dom, value, isGeography) {
        /// <summary>Creates a new GML MultiPoint DOM element for a GeoJSON MultiPoint object.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="value" type="Object">GeoJSON MultiPoint object.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in the GeoJSON value is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace for the GeoJSON MultiPoint.</returns>

        return gmlNewODataMultiItem(dom, "MultiPoint", "pointMembers", value.coordinates, gmlNewODataPointElement, isGeography);
    };

    var gmlNewODataMultiLineString = function (dom, value, isGeography) {
        /// <summary>Creates a new GML MultiCurve DOM element for a GeoJSON MultiLineString object.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="value" type="Object">GeoJSON MultiLineString object.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in the GeoJSON value is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace for the GeoJSON MultiLineString.</returns>

        return gmlNewODataMultiItem(dom, "MultiCurve", "curveMembers", value.coordinates, gmlNewODataLineStringElement, isGeography);
    };

    var gmlNewODataMultiPolygon = function (dom, value, isGeography) {
        /// <summary>Creates a new GML MultiSurface DOM element for a GeoJSON MultiPolygon object.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="value" type="Object">GeoJSON MultiPolygon object.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in the GeoJSON value is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace for the GeoJSON MultiPolygon.</returns>

        return gmlNewODataMultiItem(dom, "MultiSurface", "surfaceMembers", value.coordinates, gmlNewODataPolygonElement, isGeography);
    };

    var gmlNewODataGeometryCollectionItem = function (dom, value, isGeography) {
        /// <summary>Creates a new GML element for an item in a geometry collection object.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="item" type="Object">GeoJSON object in the geometry collection.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in the GeoJSON value is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace.</returns>

        return gmlNewODataSpatialValue(dom, value, value.type, isGeography);
    };

    var gmlNewODataGeometryCollection = function (dom, value, isGeography) {
        /// <summary>Creates a new GML MultiGeometry DOM element for a GeoJSON GeometryCollection object.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="value" type="Object">GeoJSON GeometryCollection object.</param>
        /// <param name="isGeography" type="Boolean">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in the GeoJSON value is the Longitude and
        ///    will be serialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace for the GeoJSON GeometryCollection.</returns>

        return gmlNewODataMultiItem(dom, "MultiGeometry", "geometryMembers", value.geometries, gmlNewODataGeometryCollectionItem, isGeography);
    };



    var xmlMediaType = "application/xml";

    var ado = http + "schemas.microsoft.com/ado/";      // http://schemas.microsoft.com/ado/
    var adoDs = ado + "2007/08/dataservices";           // http://schemas.microsoft.com/ado/2007/08/dataservices

    var edmxNs = ado + "2007/06/edmx";                  // http://schemas.microsoft.com/ado/2007/06/edmx
    var edmNs1 = ado + "2006/04/edm";                   // http://schemas.microsoft.com/ado/2006/04/edm
    var edmNs1_1 = ado + "2007/05/edm";                 // http://schemas.microsoft.com/ado/2007/05/edm
    var edmNs1_2 = ado + "2008/01/edm";                 // http://schemas.microsoft.com/ado/2008/01/edm

    // There are two valid namespaces for Edm 2.0
    var edmNs2a = ado + "2008/09/edm";                  // http://schemas.microsoft.com/ado/2008/09/edm
    var edmNs2b = ado + "2009/08/edm";                  // http://schemas.microsoft.com/ado/2009/08/edm

    var edmNs3 = ado + "2009/11/edm";                   // http://schemas.microsoft.com/ado/2009/11/edm

    var odataXmlNs = adoDs;                             // http://schemas.microsoft.com/ado/2007/08/dataservices
    var odataMetaXmlNs = adoDs + "/metadata";           // http://schemas.microsoft.com/ado/2007/08/dataservices/metadata
    var odataRelatedPrefix = adoDs + "/related/";       // http://schemas.microsoft.com/ado/2007/08/dataservices/related
    var odataScheme = adoDs + "/scheme";                // http://schemas.microsoft.com/ado/2007/08/dataservices/scheme

    var odataPrefix = "d";
    var odataMetaPrefix = "m";

    var createAttributeExtension = function (domNode, useNamespaceURI) {
        /// <summary>Creates an extension object for the specified attribute.</summary>
        /// <param name="domNode">DOM node for the attribute.</param>
        /// <param name="useNamespaceURI" type="Boolean">Flag indicating if the namespaceURI property should be added to the extension object instead of the namespace property.</param>
        /// <remarks>
        ///    The useNamespaceURI flag is used to prevent a breaking change from older versions of datajs in which extension
        ///    objects created for Atom extension attributes have the namespaceURI property instead of the namespace one.
        ///    
        ///    This flag and the namespaceURI property should be deprecated in future major versions of the library.
        /// </remarks>
        /// <returns type="Object">The new extension object.</returns>

        var extension = { name: xmlLocalName(domNode), value: domNode.value };
        extension[useNamespaceURI ? "namespaceURI" : "namespace"] = xmlNamespaceURI(domNode);

        return extension;
    };

    var createElementExtension = function (domNode, useNamespaceURI) {
        /// <summary>Creates an extension object for the specified element.</summary>
        /// <param name="domNode">DOM node for the element.</param>
        /// <param name="useNamespaceURI" type="Boolean">Flag indicating if the namespaceURI property should be added to the extension object instead of the namespace property.</param>
        /// <remarks>
        ///    The useNamespaceURI flag is used to prevent a breaking change from older versions of datajs in which extension
        ///    objects created for Atom extension attributes have the namespaceURI property instead of the namespace one.
        ///    
        ///    This flag and the namespaceURI property should be deprecated in future major versions of the library.
        /// </remarks>
        /// <returns type="Object">The new extension object.</returns>


        var attributeExtensions = [];
        var childrenExtensions = [];

        var i, len;
        var attributes = domNode.attributes;
        for (i = 0, len = attributes.length; i < len; i++) {
            var attr = attributes[i];
            if (xmlNamespaceURI(attr) !== xmlnsNS) {
                attributeExtensions.push(createAttributeExtension(attr, useNamespaceURI));
            }
        }

        var child = domNode.firstChild;
        while (child != null) {
            if (child.nodeType === 1) {
                childrenExtensions.push(createElementExtension(child, useNamespaceURI));
            }
            child = child.nextSibling;
        }

        var extension = {
            name: xmlLocalName(domNode),
            value: xmlInnerText(domNode),
            attributes: attributeExtensions,
            children: childrenExtensions
        };

        extension[useNamespaceURI ? "namespaceURI" : "namespace"] = xmlNamespaceURI(domNode);
        return extension;
    };

    var isCollectionItemElement = function (domElement) {
        /// <summary>Checks whether the domElement is a collection item.</summary>
        /// <param name="domElement">DOM element possibliy represnting a collection item.</param>
        /// <returns type="Boolean">True if the domeElement belongs to the OData metadata namespace and its local name is "element"; false otherwise.</returns>

        return xmlNamespaceURI(domElement) === odataXmlNs && xmlLocalName(domElement) === "element";
    };

    var makePropertyMetadata = function (type, extensions) {
        /// <summary>Creates an object containing property metadata.</summary>
        /// <param type="String" name="type">Property type name.</param>
        /// <param type="Array" name="extensions">Array of attribute extension objects.</param>
        /// <returns type="Object">Property metadata object cotaining type and extensions fields.</returns>

        return { type: type, extensions: extensions };
    };

    var odataInferTypeFromPropertyXmlDom = function (domElement) {
        /// <summary>Infers type of a property based on its xml DOM tree.</summary>
        /// <param name="domElement">DOM element for the property.</param>
        /// <returns type="String">Inferred type name; null if the type cannot be determined.</returns>

        if (xmlFirstChildElement(domElement, gmlXmlNs)) {
            return EDM_GEOMETRY;
        }

        var firstChild = xmlFirstChildElement(domElement, odataXmlNs);
        if (!firstChild) {
            return EDM_STRING;
        }

        if (isCollectionItemElement(firstChild)) {
            var sibling = xmlSiblingElement(firstChild, odataXmlNs);
            if (sibling && isCollectionItemElement(sibling)) {
                // More than one <element> tag have been found, it can be safely assumed that this is a collection property.
                return "Collection()";
            }
        }

        return null;
    };

    var xmlReadODataPropertyAttributes = function (domElement) {
        /// <summary>Reads the attributes of a property DOM element in an OData XML document.</summary>
        /// <param name="domElement">DOM element for the property.</param>
        /// <returns type="Object">Object containing the property type, if it is null, and its attribute extensions.</returns>

        var type = null;
        var isNull = false;
        var extensions = [];

        xmlAttributes(domElement, function (attribute) {
            var nsURI = xmlNamespaceURI(attribute);
            var localName = xmlLocalName(attribute);
            var value = xmlNodeValue(attribute);

            if (nsURI === odataMetaXmlNs) {
                if (localName === "null") {
                    isNull = (value.toLowerCase() === "true");
                    return;
                }

                if (localName === "type") {
                    type = value;
                    return;
                }
            }

            if (nsURI !== xmlNS && nsURI !== xmlnsNS) {
                extensions.push(createAttributeExtension(attribute, true));
                return;
            }
        });

        return { type: (!type && isNull ? EDM_STRING : type), isNull: isNull, extensions: extensions };
    };

    var xmlReadODataProperty = function (domElement) {
        /// <summary>Reads a property DOM element in an OData XML document.</summary>
        /// <param name="domElement">DOM element for the property.</param>
        /// <returns type="Object">Object with name, value, and metadata for the property.</returns>

        if (xmlNamespaceURI(domElement) !== odataXmlNs) {
            // domElement is not a proprety element because it is not in the odata xml namespace.
            return null;
        }

        var propertyName = xmlLocalName(domElement);
        var propertyAttributes = xmlReadODataPropertyAttributes(domElement);

        var propertyIsNull = propertyAttributes.isNull;
        var propertyType = propertyAttributes.type;

        var propertyMetadata = makePropertyMetadata(propertyType, propertyAttributes.extensions);
        var propertyValue = propertyIsNull ? null : xmlReadODataPropertyValue(domElement, propertyType, propertyMetadata);

        return { name: propertyName, value: propertyValue, metadata: propertyMetadata };
    };

    var xmlReadODataPropertyValue = function (domElement, propertyType, propertyMetadata) {
        /// <summary>Reads the value of a property in an OData XML document.</summary>
        /// <param name="domElement">DOM element for the property.</param>
        /// <param name="propertyType" type="String">Property type name.</param>
        /// <param name="propertyMetadata" type="Object">Object that will store metadata about the property.</param>
        /// <returns>Property value.</returns>

        if (!propertyType) {
            propertyType = odataInferTypeFromPropertyXmlDom(domElement);
            propertyMetadata.type = propertyType;
        }

        var isGeograhpyType = isGeographyEdmType(propertyType);
        if (isGeograhpyType || isGeometryEdmType(propertyType)) {
            return xmlReadODataSpatialPropertyValue(domElement, propertyType, isGeograhpyType);
        }

        if (isPrimitiveEdmType(propertyType)) {
            return xmlReadODataEdmPropertyValue(domElement, propertyType);
        }

        if (isCollectionType(propertyType)) {
            return xmlReadODataCollectionPropertyValue(domElement, propertyType, propertyMetadata);
        }

        return xmlReadODataComplexPropertyValue(domElement, propertyType, propertyMetadata);
    };

    var xmlReadODataSpatialPropertyValue = function (domElement, propertyType, isGeography) {
        /// <summary>Reads the value of an spatial property in an OData XML document.</summary>
        /// <param name="property">DOM element for the spatial property.</param>
        /// <param name="propertyType" type="String">Property type name.</param>
        /// <param name="isGeography" type="Boolean" Optional="True">Flag indicating if the value uses a geographic reference system or not.<param>
        /// <remarks>
        ///    When using a geographic reference system, the first component of all the coordinates in each <pos> element in the GML DOM tree is the Latitude and
        ///    will be deserialized as the second component of each <pos> element in the GML DOM tree.
        /// </remarks>
        /// <returns>Spatial property value in GeoJSON format.</returns>

        var gmlRoot = xmlFirstChildElement(domElement, gmlXmlNs);

        var value = gmlReadODataSpatialValue(gmlRoot, isGeography);
        value.__metadata = { type: propertyType };
        return value;
    };

    var xmlReadODataEdmPropertyValue = function (domNode, propertyType) {
        /// <summary>Reads the value of an EDM property in an OData XML document.</summary>
        /// <param name="donNode">DOM node for the EDM property.</param>
        /// <param name="propertyType" type="String">Property type name.</param>
        /// <returns>EDM property value.</returns>

        var propertyValue = xmlNodeValue(domNode) || "";

        switch (propertyType) {
            case EDM_BOOLEAN:
                return parseBool(propertyValue);
            case EDM_BINARY:
            case EDM_DECIMAL:
            case EDM_GUID:
            case EDM_INT64:
            case EDM_STRING:
                return propertyValue;
            case EDM_BYTE:
            case EDM_INT16:
            case EDM_INT32:
            case EDM_SBYTE:
                return parseInt10(propertyValue);
            case EDM_DOUBLE:
            case EDM_SINGLE:
                return parseFloat(propertyValue);
            case EDM_TIME:
                return parseDuration(propertyValue);
            case EDM_DATETIME:
                return parseDateTime(propertyValue);
            case EDM_DATETIMEOFFSET:
                return parseDateTimeOffset(propertyValue);
        }

        return propertyValue;
    };

    var xmlReadODataComplexPropertyValue = function(domElement, propertyType, propertyMetadata) {
        /// <summary>Reads the value of a complex type property in an OData XML document.</summary>
        /// <param name="property">DOM element for the complex type property.</param>
        /// <param name="propertyType" type="String">Property type name.</param>
        /// <param name="propertyMetadata" type="Object">Object that will store metadata about the property.</param>
        /// <returns type="Object">Complex type property value.</returns>

        var propertyValue = { __metadata: { type: propertyType } };
        xmlChildElements(domElement, function(child) {
            var childProperty = xmlReadODataProperty(child);
            var childPropertyName = childProperty.name;

            propertyMetadata.properties = propertyMetadata.properties || {};
            propertyMetadata.properties[childPropertyName] = childProperty.metadata;
            propertyValue[childPropertyName] = childProperty.value;
        });

        return propertyValue;
    };

    var xmlReadODataCollectionPropertyValue = function (domElement, propertyType, propertyMetadata) {
        /// <summary>Reads the value of a collection property in an OData XML document.</summary>
        /// <param name="property">DOM element for the collection property.</param>
        /// <param name="propertyType" type="String">Property type name.</param>
        /// <param name="propertyMetadata" type="Object">Object that will store metadata about the property.</param>
        /// <returns type="Object">Collection property value.</returns>

        var items = [];
        var itemsMetadata = propertyMetadata.elements = [];
        var collectionType = getCollectionType(propertyType);

        xmlChildElements(domElement, function (child) {
            if (isCollectionItemElement(child)) {
                var itemAttributes = xmlReadODataPropertyAttributes(child);
                var itemExtensions = itemAttributes.extensions;
                var itemType = itemAttributes.type || collectionType;
                var itemMetadata = makePropertyMetadata(itemType, itemExtensions);

                var item = xmlReadODataPropertyValue(child, itemType, itemMetadata);

                items.push(item);
                itemsMetadata.push(itemMetadata);
            }
        });

        return { __metadata: { type: propertyType === "Collection()" ? null : propertyType }, results: items };
    };

    var readODataXmlDocument = function (xmlRoot, baseURI) {
        /// <summary>Reads an OData link(s) producing an object model in return.</summary>
        /// <param name="xmlRoot">Top-level element to read.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the XML payload.</param>
        /// <returns type="Object">The object model representing the specified element.</returns>

        if (xmlNamespaceURI(xmlRoot) === odataXmlNs) {
            baseURI = xmlBaseURI(xmlRoot, baseURI);
            var localName = xmlLocalName(xmlRoot);

            if (localName === "links") {
                return readLinks(xmlRoot, baseURI);
            }
            if (localName === "uri") {
                return readUri(xmlRoot, baseURI);
            }
        }
        return undefined;
    };

    var readLinks = function (linksElement, baseURI) {
        /// <summary>Deserializes an OData XML links element.</summary>
        /// <param name="linksElement">XML links element.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the XML payload.</param>
        /// <returns type="Object">A new object representing the links collection.</returns>

        var uris = [];

        xmlChildElements(linksElement, function (child) {
            if (xmlLocalName(child) === "uri" && xmlNamespaceURI(child) === odataXmlNs) {
                uris.push(readUri(child, baseURI));
            }
        });

        return { results: uris };
    };

    var readUri = function (uriElement, baseURI) {
        /// <summary>Deserializes an OData XML uri element.</summary>
        /// <param name="uriElement">XML uri element.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the XML payload.</param>
        /// <returns type="Object">A new object representing the uri.</returns>

        var uri = xmlInnerText(uriElement) || "";
        return { uri: normalizeURI(uri, baseURI) };
    };

    var xmlODataInferSpatialValueGeoJsonType = function (value, edmType) {
        /// <summary>Infers the GeoJSON type from the spatial property value and the edm type name.</summary>
        /// <param name="value" type="Object">Spatial property value in GeoJSON format.</param>
        /// <param name="edmType" type="String" mayBeNull="true" optional="true">Spatial property edm type.<param>
        /// <remarks>
        ///   If the edmType parameter is null, undefined, "Edm.Geometry" or "Edm.Geography", then the function returns
        ///   the GeoJSON type indicated by the value's type property.
        ///
        ///   If the edmType parameter is specified or is not one of the base spatial types, then it is used to
        ///   determine the GeoJSON type and the value's type property is ignored.
        /// </remarks>
        /// <returns>New DOM element in the GML namespace for the spatial value. </returns>

        if (edmType === EDM_GEOMETRY || edmType === EDM_GEOGRAPHY) {
            return value && value.type;
        }

        if (edmType === EDM_GEOMETRY_POINT || edmType === EDM_GEOGRAPHY_POINT) {
            return GEOJSON_POINT;
        }

        if (edmType === EDM_GEOMETRY_LINESTRING || edmType === EDM_GEOGRAPHY_LINESTRING) {
            return GEOJSON_LINESTRING;
        }

        if (edmType === EDM_GEOMETRY_POLYGON || edmType === EDM_GEOGRAPHY_POLYGON) {
            return GEOJSON_POLYGON;
        }

        if (edmType === EDM_GEOMETRY_COLLECTION || edmType === EDM_GEOGRAPHY_COLLECTION) {
            return GEOJSON_GEOMETRYCOLLECTION;
        }

        if (edmType === EDM_GEOMETRY_MULTIPOLYGON || edmType === EDM_GEOGRAPHY_MULTIPOLYGON) {
            return GEOJSON_MULTIPOLYGON;
        }

        if (edmType === EDM_GEOMETRY_MULTILINESTRING || edmType === EDM_GEOGRAPHY_MULTILINESTRING) {
            return GEOJSON_MULTILINESTRING;
        }

        if (edmType === EDM_GEOMETRY_MULTIPOINT || edmType === EDM_GEOGRAPHY_MULTIPOINT) {
            return GEOJSON_MULTIPOINT;
        }

        return null;
    };

    var xmlNewODataMetaElement = function (dom, name, children) {
        /// <summary>Creates a new DOM element in the OData metadata namespace.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Local name of the OData metadata element to create.</param>
        /// <param name="children" type="Array">Array containing DOM nodes or string values that will be added as children of the new DOM element.</param>
        /// <returns>New DOM element in the OData metadata namespace.</returns>
        /// <remarks>
        ///    If a value in the children collection is a string, then a new DOM text node is going to be created
        ///    for it and then appended as a child of the new DOM Element.
        /// </remarks>

        return xmlNewElement(dom, odataMetaXmlNs, xmlQualifiedName(odataMetaPrefix, name), children);
    };

    var xmlNewODataMetaAttribute = function (dom, name, value) {
        /// <summary>Creates a new DOM attribute in the odata namespace.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Local name of the OData attribute to create.</param>
        /// <param name="value">Attribute value.</param>
        /// <returns>New DOM attribute in the odata namespace.</returns>

        return xmlNewAttribute(dom, odataMetaXmlNs, xmlQualifiedName(odataMetaPrefix, name), value);
    };

    var xmlNewODataElement = function (dom, name, children) {
        /// <summary>Creates a new DOM element in the OData namespace.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Local name of the OData element to create.</param>
        /// <param name="children" type="Array">Array containing DOM nodes or string values that will be added as children of the new DOM element.</param>
        /// <returns>New DOM element in the OData namespace.</returns>
        /// <remarks>
        ///    If a value in the children collection is a string, then a new DOM text node is going to be created
        ///    for it and then appended as a child of the new DOM Element.
        /// </remarks>

        return xmlNewElement(dom, odataXmlNs, xmlQualifiedName(odataPrefix, name), children);
    };

    var xmlNewODataPrimitiveValue = function (value, typeName) {
        /// <summary>Returns the string representation of primitive value for an OData XML document.</summary>
        /// <param name="value">Primivite value to format.</param>
        /// <param name="typeName" type="String" optional="true">Type name of the primitive value.</param>
        /// <returns type="String">Formatted primitive value.</returns>

        if (typeName === EDM_DATETIME || typeName === EDM_DATETIMEOFFSET || isDate(value)) {
            return formatDateTimeOffset(value);
        }
        if (typeName === EDM_TIME) {
            return formatDuration(value);
        }
        return value.toString();
    };

    var xmlNewODataElementInfo = function (domElement, dataServiceVersion) {
        /// <summary>Creates an object that represents a new DOM element for an OData XML document and the data service version it requires.</summary>
        /// <param name="domElement">New DOM element for an OData XML document.</param>
        /// <param name="dataServiceVersion" type="String">Required data service version by the new DOM element.</param>
        /// <returns type="Object">Object containing new DOM element and its required data service version.</returns>

        return { element: domElement, dsv: dataServiceVersion };
    };

    var xmlNewODataProperty = function (dom, name, typeName, children) {
        /// <summary>Creates a new DOM element for an entry property in an OData XML document.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Property name.</param>
        /// <param name="typeName" type="String" optional="true">Property type name.</param>
        /// <param name="children" type="Array">Array containing DOM nodes or string values that will be added as children of the new DOM element.</param>
        /// <remarks>
        ///    If a value in the children collection is a string, then a new DOM text node is going to be created
        ///    for it and then appended as a child of the new DOM Element.
        /// </remarks>
        /// <returns>New DOM element in the OData namespace for the entry property.</returns>

        var typeAttribute = typeName ? xmlNewODataMetaAttribute(dom, "type", typeName) : null;
        var property = xmlNewODataElement(dom, name, typeAttribute);
        return xmlAppendChildren(property, children);
    };

    var xmlNewODataEdmProperty = function (dom, name, value, typeName) {
        /// <summary>Creates a new DOM element for an EDM property in an OData XML document.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Property name.</param>
        /// <param name="value">Property value.</param>
        /// <param name="typeName" type="String" optional="true">Property type name.</param>
        /// <returns type="Object">
        ///     Object containing the new DOM element in the OData namespace for the EDM property and the
        ///     required data service version for this property.
        /// </returns>

        var propertyValue = xmlNewODataPrimitiveValue(value, typeName);
        var property = xmlNewODataProperty(dom, name, typeName, propertyValue);
        return xmlNewODataElementInfo(property, /*dataServiceVersion*/"1.0");
    };

    var xmlNewODataNullProperty = function (dom, name, typeName, model) {
        /// <summary>Creates a new DOM element for a null property in an OData XML document.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Property name.</param>
        /// <param name="typeName" type="String" optional="true">Property type name.</param>
        /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
        /// <remarks>
        ///     If no typeName is specified, then it will be assumed that this is a primitive type property.
        /// </remarks>
        /// <returns type="Object">
        ///     Object containing the new DOM element in the OData namespace for the null property and the 
        ///     required data service version for this property.
        /// </returns>

        var nullAttribute = xmlNewODataMetaAttribute(dom, "null", "true");
        var property = xmlNewODataProperty(dom, name, typeName, nullAttribute);
        var dataServiceVersion = lookupComplexType(typeName, model) ? "2.0" : "1.0";

        return xmlNewODataElementInfo(property, dataServiceVersion);
    };

    var xmlNewODataCollectionProperty = function (dom, name, value, typeName, collectionMetadata, collectionModel, model) {
        /// <summary>Creates a new DOM element for a collection property in an OData XML document.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Property name.</param>
        /// <param name="value">Property value either as an array or an object representing a collection in the library's internal representation.</param>
        /// <param name="typeName" type="String" optional="true">Property type name.</param>
        /// <param name="collectionMetadata" type="Object" optional="true">Object containing metadata about the collection property.</param>
        /// <param name="collectionModel" type="Object" optional="true">Object describing the collection property in an OData conceptual schema.</param>
        /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
        /// <returns type="Object">
        ///     Object containing the new DOM element in the OData namespace for the collection property and the
        ///     required data service version for this property.
        /// </returns>

        var itemTypeName = getCollectionType(typeName);
        var items = isArray(value) ? value : value.results;
        var itemMetadata = typeName ? { type: itemTypeName} : {};
        itemMetadata.properties = collectionMetadata.properties;

        var xmlProperty = xmlNewODataProperty(dom, name, itemTypeName ? typeName : null);

        var i, len;
        for (i = 0, len = items.length; i < len; i++) {
            var itemValue = items[i];
            var item = xmlNewODataDataElement(dom, "element", itemValue, itemMetadata, collectionModel, model);

            xmlAppendChild(xmlProperty, item.element);
        }
        return xmlNewODataElementInfo(xmlProperty, /*dataServiceVersion*/"3.0");
    };

    var xmlNewODataComplexProperty = function (dom, name, value, typeName, propertyMetadata, propertyModel, model) {
        /// <summary>Creates a new DOM element for a complex type property in an OData XML document.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Property name.</param>
        /// <param name="value">Property value as an object in the library's internal representation.</param>
        /// <param name="typeName" type="String" optional="true">Property type name.</param>
        /// <param name="propertyMetadata" type="Object" optional="true">Object containing metadata about the complex type property.</param>
        /// <param name="propertyModel" type="Object" optional="true">Object describing the complex type property in an OData conceptual schema.</param>
        /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
        /// <returns type="Object">
        ///     Object containing the new DOM element in the OData namespace for the complex type property and the
        ///     required data service version for this property.
        /// </returns>

        var xmlProperty = xmlNewODataProperty(dom, name, typeName);
        var complexTypePropertiesMetadata = propertyMetadata.properties || {};
        var complexTypeModel = lookupComplexType(typeName, model) || {};

        var dataServiceVersion = "1.0";

        for (var key in value) {
            if (key !== "__metadata") {
                var memberValue = value[key];
                var memberModel = lookupProperty(complexTypeModel.property, key);
                var memberMetadata = complexTypePropertiesMetadata[key] || {};
                var member = xmlNewODataDataElement(dom, key, memberValue, memberMetadata, memberModel, model);

                dataServiceVersion = maxVersion(dataServiceVersion, member.dsv);
                xmlAppendChild(xmlProperty, member.element);
            }
        }
        return xmlNewODataElementInfo(xmlProperty, dataServiceVersion);
    };

    var xmlNewODataSpatialProperty = function (dom, name, value, typeName, isGeography) {
        /// <summary>Creates a new DOM element for an EDM spatial property in an OData XML document.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Property name.</param>
        /// <param name="value" type="Object">GeoJSON object containing the property value.</param>
        /// <param name="typeName" type="String" optional="true">Property type name.</param>
        /// <returns type="Object">
        ///     Object containing the new DOM element in the OData namespace for the EDM property and the
        ///     required data service version for this property.
        /// </returns>

        var geoJsonType = xmlODataInferSpatialValueGeoJsonType(value, typeName);

        var gmlRoot = gmlNewODataSpatialValue(dom, value, geoJsonType, isGeography);
        var xmlProperty = xmlNewODataProperty(dom, name, typeName, gmlRoot);

        return xmlNewODataElementInfo(xmlProperty, "3.0");
    };

    var xmlNewODataDataElement = function (dom, name, value, dataItemMetadata, dataItemModel, model) {
        /// <summary>Creates a new DOM element for a data item in an entry, complex property, or collection property.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Data item name.</param>
        /// <param name="value" optional="true" mayBeNull="true">Value of the data item, if any.</param>
        /// <param name="dataItemMetadata" type="Object" optional="true">Object containing metadata about the data item.</param>
        /// <param name="dataItemModel" type="Object" optional="true">Object describing the data item in an OData conceptual schema.</param>
        /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
        /// <returns type="Object">
        ///     Object containing the new DOM element in the appropriate namespace for the data item and the
        ///     required data service version for it.
        /// </returns>

        var typeName = dataItemTypeName(value, dataItemMetadata, dataItemModel);
        if (isPrimitive(value)) {
            return xmlNewODataEdmProperty(dom, name, value, typeName || EDM_STRING);
        }

        var isGeography = isGeographyEdmType(typeName);
        if (isGeography || isGeometryEdmType(typeName)) {
            return xmlNewODataSpatialProperty(dom, name, value, typeName, isGeography);
        }

        if (isCollection(value, typeName)) {
            return xmlNewODataCollectionProperty(dom, name, value, typeName, dataItemMetadata, dataItemModel, model);
        }

        if (isNamedStream(value)) {
            return null;
        }

        // This may be a navigation property.
        var navPropKind = navigationPropertyKind(value, dataItemModel);
        if (navPropKind !== null) {
            return null;
        }

        if (value === null) {
            return xmlNewODataNullProperty(dom, name, typeName);
        }

        return xmlNewODataComplexProperty(dom, name, value, typeName, dataItemMetadata, dataItemModel, model);
    };

    var odataNewLinkDocument = function (data) {
        /// <summary>Writes the specified data into an OData XML document.</summary>
        /// <param name="data">Data to write.</param>
        /// <returns>The root of the DOM tree built.</returns>

        if (data && isObject(data)) {
            var dom = xmlDom();
            return xmlAppendChild(dom, xmlNewODataElement(dom, "uri", data.uri));
        }
        // Allow for undefined to be returned.
    };

    var xmlParser = function (handler, text) {
        /// <summary>Parses an OData XML document.</summary>
        /// <param name="handler">This handler.</param>
        /// <param name="text" type="String">Document text.</param>
        /// <returns>An object representation of the document; undefined if not applicable.</returns>

        if (text) {
            var doc = xmlParse(text);
            var root = xmlFirstChildElement(doc);
            if (root) {
                return readODataXmlDocument(root);
            }
        }

        // Allow for undefined to be returned.
    };

    var xmlSerializer = function (handler, data, context) {
        /// <summary>Serializes an OData XML object into a document.</summary>
        /// <param name="handler">This handler.</param>
        /// <param name="data" type="Object">Representation of feed or entry.</param>
        /// <param name="context" type="Object">Object with parsing context.</param>
        /// <returns>A text representation of the data object; undefined if not applicable.</returns>

        var cType = context.contentType = context.contentType || contentType(xmlMediaType);
        if (cType && cType.mediaType === xmlMediaType) {
            return xmlSerialize(odataNewLinkDocument(data));
        }
        return undefined;
    };

    odata.xmlHandler = handler(xmlParser, xmlSerializer, xmlMediaType, MAX_DATA_SERVICE_VERSION);



    var atomPrefix = "a";

    var atomXmlNs = w3org + "2005/Atom";                    // http://www.w3.org/2005/Atom
    var appXmlNs = w3org + "2007/app";                      // http://www.w3.org/2007/app

    var odataEditMediaPrefix = adoDs + "/edit-media/";        // http://schemas.microsoft.com/ado/2007/08/dataservices/edit-media
    var odataMediaResourcePrefix = adoDs + "/mediaresource/"; // http://schemas.microsoft.com/ado/2007/08/dataservices/mediaresource
    var odataRelatedLinksPrefix = adoDs + "/relatedlinks/";   // http://schemas.microsoft.com/ado/2007/08/dataservices/relatedlinks

    var atomAcceptTypes = ["application/atom+xml", "application/atomsvc+xml", "application/xml"];
    var atomMediaType = atomAcceptTypes[0];

    // These are the namespaces that are not considered ATOM extension namespaces.
    var nonExtensionNamepaces = [atomXmlNs, appXmlNs, xmlNS, xmlnsNS];

    // These are entity property mapping paths that have well-known paths.
    var knownCustomizationPaths = {
        SyndicationAuthorEmail: "author/email",
        SyndicationAuthorName: "author/name",
        SyndicationAuthorUri: "author/uri",
        SyndicationContributorEmail: "contributor/email",
        SyndicationContributorName: "contributor/name",
        SyndicationContributorUri: "contributor/uri",
        SyndicationPublished: "published",
        SyndicationRights: "rights",
        SyndicationSummary: "summary",
        SyndicationTitle: "title",
        SyndicationUpdated: "updated"
    };

    var expandedFeedCustomizationPath = function (path) {
        /// <summary>Returns an expanded customization path if it's well-known.</summary>
        /// <param name="path" type="String">Path to expand.</param>
        /// <returns type="String">Expanded path or just 'path' otherwise.</returns>

        return knownCustomizationPaths[path] || path;
    };

    var isExtensionNs = function (nsURI) {
        /// <summary>Checks whether the specified namespace is an extension namespace to ATOM.</summary>
        /// <param type="String" name="nsURI">Namespace to check.</param>
        /// <returns type="Boolean">true if nsURI is an extension namespace to ATOM; false otherwise.</returns>

        return !(contains(nonExtensionNamepaces, nsURI));
    };

    var atomFeedCustomization = function (customizationModel, entityType, model, propertyName, suffix) {
        /// <summary>Creates an object describing a feed customization that was delcared in an OData conceptual schema.</summary>
        /// <param name="customizationModel" type="Object">Object describing the customization delcared in the conceptual schema.</param>
        /// <param name="entityType" type="Object">Object describing the entity type that owns the customization in an OData conceputal schema.</param>
        /// <param name="model" type="Object">Object describing an OData conceptual schema.</param>
        /// <param name="propertyName" type="String" optional="true">Name of the property to which this customization applies.</param>
        /// <param name="suffix" type="String" optional="true">Suffix to feed customization properties in the conceptual schema.</param>
        /// <returns type="Object">Object that describes an applicable feed customization.</returns>

        suffix = suffix || "";
        var targetPath = customizationModel["FC_TargetPath" + suffix];
        if (!targetPath) {
            return null;
        }

        var sourcePath = customizationModel["FC_SourcePath" + suffix];
        var targetXmlPath = expandedFeedCustomizationPath(targetPath);

        var propertyPath = propertyName ? propertyName + (sourcePath ? "/" + sourcePath : "") : sourcePath;
        var propertyType = propertyPath && lookupPropertyType(model, entityType, propertyPath);
        var nsURI = customizationModel["FC_NsUri" + suffix] || null;
        var nsPrefix = customizationModel["FC_NsPrefix" + suffix] || null;
        var keepinContent = customizationModel["FC_KeepInContent" + suffix] || "";

        if (targetPath !== targetXmlPath) {
            nsURI = atomXmlNs;
            nsPrefix = atomPrefix;
        }

        return {
            contentKind: customizationModel["FC_ContentKind" + suffix],
            keepInContent: keepinContent.toLowerCase() === "true",
            nsPrefix: nsPrefix,
            nsURI: nsURI,
            propertyPath: propertyPath,
            propertyType: propertyType,
            entryPath: targetXmlPath
        };
    };

    var atomApplyAllFeedCustomizations = function (entityType, model, callback) {
        /// <summary>Gets all the feed customizations that have to be applied to an entry as per the enity type declared in an OData conceptual schema.</summary>
        /// <param name="entityType" type="Object">Object describing an entity type in a conceptual schema.</param>
        /// <param name="model" type="Object">Object describing an OData conceptual schema.</param>
        /// <param name="callback" type="Function">Callback function to be invoked for each feed customization that needs to be applied.</param>

        var customizations = [];
        while (entityType) {
            var sourcePath = entityType.FC_SourcePath;
            var customization = atomFeedCustomization(entityType, entityType, model);
            if (customization) {
                callback(customization);
            }

            var properties = entityType.property || [];
            var i, len;
            for (i = 0, len = properties.length; i < len; i++) {
                var property = properties[i];
                var suffixCounter = 0;
                var suffix = "";

                while (customization = atomFeedCustomization(property, entityType, model, property.name, suffix)) {
                    callback(customization);
                    suffixCounter++;
                    suffix = "_" + suffixCounter;
                }
            }
            entityType = lookupEntityType(entityType.baseType, model);
        }
        return customizations;
    };

    var atomReadExtensionAttributes = function (domElement) {
        /// <summary>Reads ATOM extension attributes (any attribute not in the Atom namespace) from a DOM element.</summary>
        /// <param name="domElement">DOM element with zero or more extension attributes.</param>
        /// <returns type="Array">An array of extension attribute representations.</returns>

        var extensions = [];
        xmlAttributes(domElement, function (attribute) {
            var nsURI = xmlNamespaceURI(attribute);
            if (isExtensionNs(nsURI)) {
                extensions.push(createAttributeExtension(attribute, true));
            }
        });
        return extensions;
    };

    var atomReadExtensionElement = function (domElement) {
        /// <summary>Reads an ATOM extension element (an element not in the ATOM namespaces).</summary>
        /// <param name="domElement">DOM element not part of the atom namespace.</param>
        /// <returns type="Object">Object representing the extension element.</returns>

        return createElementExtension(domElement, /*addNamespaceURI*/true);
    };

    var atomReadDocument = function (domElement, baseURI, model) {
        /// <summary>Reads an ATOM entry, feed or service document, producing an object model in return.</summary>
        /// <param name="domElement">Top-level ATOM DOM element to read.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the ATOM document.</param>
        /// <param name="model" type="Object">Object that describes the conceptual schema.</param>
        /// <returns type="Object">The object model representing the specified element, undefined if the top-level element is not part of the ATOM specification.</returns>

        var nsURI = xmlNamespaceURI(domElement);
        var localName = xmlLocalName(domElement);

        // Handle service documents.
        if (nsURI === appXmlNs && localName === "service") {
            return atomReadServiceDocument(domElement, baseURI);
        }

        // Handle feed and entry elements.
        if (nsURI === atomXmlNs) {
            if (localName === "feed") {
                return atomReadFeed(domElement, baseURI, model);
            }
            if (localName === "entry") {
                return atomReadEntry(domElement, baseURI, model);
            }
        }

        // Allow undefined to be returned.
    };

    var atomReadAdvertisedActionOrFunction = function (domElement, baseURI) {
        /// <summary>Reads the DOM element for an action or a function in an OData Atom document.</summary>
        /// <param name="domElement">DOM element to read.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing the action or function target url.</param>
        /// <returns type="Object">Object with title, target, and metadata fields.</returns>

        var extensions = [];
        var result = { extensions: extensions };
        xmlAttributes(domElement, function (attribute) {
            var localName = xmlLocalName(attribute);
            var nsURI = xmlNamespaceURI(attribute);
            var value = xmlNodeValue(attribute);

            if (nsURI === null) {
                if (localName === "title" || localName === "metadata") {
                    result[localName] = value;
                    return;
                }
                if (localName === "target") {
                    result.target = normalizeURI(value, xmlBaseURI(domElement, baseURI));
                    return;
                }
            }

            if (isExtensionNs(nsURI)) {
                extensions.push(createAttributeExtension(attribute, true));
            }
        });
        return result;
    };

    var atomReadAdvertisedAction = function (domElement, baseURI, parentMetadata) {
        /// <summary>Reads the DOM element for an action in an OData Atom document.</summary>
        /// <param name="domElement">DOM element to read.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing the action or target url.</param>
        /// <param name="parentMetadata" type="Object">Object to update with the action metadata.</param>

        var actions = parentMetadata.actions = parentMetadata.actions || [];
        actions.push(atomReadAdvertisedActionOrFunction(domElement, baseURI));
    };

    var atomReadAdvertisedFunction = function (domElement, baseURI, parentMetadata) {
        /// <summary>Reads the DOM element for an action in an OData Atom document.</summary>
        /// <param name="domElement">DOM element to read.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing the action or target url.</param>
        /// <param name="parentMetadata" type="Object">Object to update with the action metadata.</param>

        var functions = parentMetadata.functions = parentMetadata.functions || [];
        functions.push(atomReadAdvertisedActionOrFunction(domElement, baseURI));
    };

    var atomReadFeed = function (domElement, baseURI, model) {
        /// <summary>Reads a DOM element for an ATOM feed, producing an object model in return.</summary>
        /// <param name="domElement">ATOM feed DOM element.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the ATOM feed.</param>
        /// <param name="model">Metadata that describes the conceptual schema.</param>
        /// <returns type="Object">A new object representing the feed.</returns>

        var extensions = atomReadExtensionAttributes(domElement);
        var feedMetadata = { feed_extensions: extensions };
        var results = [];

        var feed = { __metadata: feedMetadata, results: results };

        baseURI = xmlBaseURI(domElement, baseURI);

        xmlChildElements(domElement, function (child) {
            var nsURI = xmlNamespaceURI(child);
            var localName = xmlLocalName(child);

            if (nsURI === odataMetaXmlNs) {
                if (localName === "count") {
                    feed.__count = parseInt(xmlInnerText(child), 10);
                    return;
                }
                if (localName === "action") {
                    atomReadAdvertisedAction(child, baseURI, feedMetadata);
                    return;
                }
                if (localName === "function") {
                    atomReadAdvertisedFunction(child, baseURI, feedMetadata);
                    return;
                }
            }

            if (isExtensionNs(nsURI)) {
                extensions.push(createElementExtension(child));
                return;
            }

            // The element should belong to the ATOM namespace.

            if (localName === "entry") {
                results.push(atomReadEntry(child, baseURI, model));
                return;
            }
            if (localName === "link") {
                atomReadFeedLink(child, feed, baseURI);
                return;
            }
            if (localName === "id") {
                feedMetadata.uri = normalizeURI(xmlInnerText(child), baseURI);
                feedMetadata.uri_extensions = atomReadExtensionAttributes(child);
                return;
            }
            if (localName === "title") {
                feedMetadata.title = xmlInnerText(child) || "";
                feedMetadata.title_extensions = atomReadExtensionAttributes(child);
                return;
            }
        });

        return feed;
    };

    var atomReadFeedLink = function (domElement, feed, baseURI) {
        /// <summary>Reads an ATOM link DOM element for a feed.</summary>
        /// <param name="domElement">ATOM link DOM element.</param>
        /// <param name="feed">Feed object to be annotated with the link data.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>

        var link = atomReadLink(domElement, baseURI);
        var href = link.href;
        var rel = link.rel;
        var extensions = link.extensions;
        var metadata = feed.__metadata;

        if (rel === "next") {
            feed.__next = href;
            metadata.next_extensions = extensions;
            return;
        }
        if (rel === "self") {
            metadata.self = href;
            metadata.self_extensions = extensions;
            return;
        }
    };

    var atomReadLink = function (domElement, baseURI) {
        /// <summary>Reads an ATOM link DOM element.</summary>
        /// <param name="linkElement">DOM element to read.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing the link href.</param>
        /// <returns type="Object">A link element representation.</returns>

        baseURI = xmlBaseURI(domElement, baseURI);

        var extensions = [];
        var link = { extensions: extensions, baseURI: baseURI };

        xmlAttributes(domElement, function (attribute) {
            var nsURI = xmlNamespaceURI(attribute);
            var localName = xmlLocalName(attribute);
            var value = attribute.value;

            if (localName === "href") {
                link.href = normalizeURI(value, baseURI);
                return;
            }
            if (localName === "type" || localName === "rel") {
                link[localName] = value;
                return;
            }

            if (isExtensionNs(nsURI)) {
                extensions.push(createAttributeExtension(attribute, true));
            }
        });

        if (!link.href) {
            throw { error: "href attribute missing on link element", element: domElement };
        }

        return link;
    };

    var atomGetObjectValueByPath = function (path, item) {
        /// <summary>Gets a slashed path value from the specified item.</summary>
        /// <param name="path" type="String">Property path to read ('/'-separated).</param>
        /// <param name="item" type="Object">Object to get value from.</param>
        /// <returns>The property value, possibly undefined if any path segment is missing.</returns>

        // Fast path.
        if (path.indexOf('/') === -1) {
            return item[path];
        } else {
            var parts = path.split('/');
            var i, len;
            for (i = 0, len = parts.length; i < len; i++) {
                // Avoid traversing a null object.
                if (item === null) {
                    return undefined;
                }

                item = item[parts[i]];
                if (item === undefined) {
                    return item;
                }
            }

            return item;
        }
    };

    var atomSetEntryValueByPath = function (path, target, value, propertyType) {
        /// <summary>Sets a slashed path value on the specified target.</summary>
        /// <param name="path" type="String">Property path to set ('/'-separated).</param>
        /// <param name="target" type="Object">Object to set value on.</param>
        /// <param name="value">Value to set.</param>
        /// <param name="propertyType" type="String" optional="true">Property type to set in metadata.</param>

        var propertyName;
        if (path.indexOf('/') === -1) {
            target[path] = value;
            propertyName = path;
        } else {
            var parts = path.split('/');
            var i, len;
            for (i = 0, len = (parts.length - 1); i < len; i++) {
                // We construct each step of the way if the property is missing;
                // if it's already initialized to null, we stop further processing.
                var next = target[parts[i]];
                if (next === undefined) {
                    next = {};
                    target[parts[i]] = next;
                } else if (next === null) {
                    return;
                }
                target = next;
            }
            propertyName = parts[i];
            target[propertyName] = value;
        }

        if (propertyType) {
            var metadata = target.__metadata = target.__metadata || {};
            var properties = metadata.properties = metadata.properties || {};
            var property = properties[propertyName] = properties[propertyName] || {};
            property.type = propertyType;
        }
    };

    var atomApplyCustomizationToEntryObject = function (customization, domElement, entry) {
        /// <summary>Applies a specific feed customization item to an object.</summary>
        /// <param name="customization">Object with customization description.</param>
        /// <param name="sourcePath">Property path to set ('source' in the description).</param>
        /// <param name="entryElement">XML element for the entry that corresponds to the object being read.</param>
        /// <param name="entryObject">Object being read.</param>
        /// <param name="propertyType" type="String">Name of property type to set.</param>
        /// <param name="suffix" type="String">Suffix to feed customization properties.</param>

        var propertyPath = customization.propertyPath;
        // If keepInConent equals true or the property value is null we do nothing as this overrides any other customization.
        if (customization.keepInContent || atomGetObjectValueByPath(propertyPath, entry) === null) {
            return;
        }

        var xmlNode = xmlFindNodeByPath(domElement, customization.nsURI, customization.entryPath);

        // If the XML tree does not contain the necessary elements to read the value,
        // then it shouldn't be considered null, but rather ignored at all. This prevents
        // the customization from generating the object path down to the property.
        if (!xmlNode) {
            return;
        }

        var propertyType = customization.propertyType;
        var propertyValue;

        if (customization.contentKind === "xhtml") {
            // Treat per XHTML in http://tools.ietf.org/html/rfc4287#section-3.1.1, including the DIV
            // in the content.
            propertyValue = xmlSerializeDescendants(xmlNode);
        } else {
            propertyValue = xmlReadODataEdmPropertyValue(xmlNode, propertyType || "Edm.String");
        }
        // Set the value on the entry.
        atomSetEntryValueByPath(propertyPath, entry, propertyValue, propertyType);
    };

    var lookupPropertyType = function (metadata, owningType, path) {
        /// <summary>Looks up the type of a property given its path in an entity type.</summary>
        /// <param name="metadata">Metadata in which to search for base and complex types.</param>
        /// <param name="owningType">Type to which property belongs.</param>
        /// <param name="path" type="String" mayBeNull="false">Property path to look at.</param>
        /// <returns type="String">The name of the property type; possibly null.</returns>

        var parts = path.split("/");
        var i, len;
        while (owningType) {
            // Keep track of the type being traversed, necessary for complex types.
            var traversedType = owningType;

            for (i = 0, len = parts.length; i < len; i++) {
                // Traverse down the structure as necessary.
                var properties = traversedType.property;
                if (!properties) {
                    break;
                }

                // Find the property by scanning the property list (might be worth pre-processing).
                var propertyFound = lookupProperty(properties, parts[i]);
                if (!propertyFound) {
                    break;
                }

                var propertyType = propertyFound.type;

                // We could in theory still be missing types, but that would
                // be caused by a malformed path.
                if (!propertyType || isPrimitiveEdmType(propertyType)) {
                    return propertyType || null;
                }

                traversedType = lookupComplexType(propertyType, metadata);
                if (!traversedType) {
                    return null;
                }
            }

            // Traverse up the inheritance chain.
            owningType = lookupEntityType(owningType.baseType, metadata);
        }

        return null;
    };

    var atomReadEntry = function (domElement, baseURI, model) {
        /// <summary>Reads a DOM element for an ATOM entry, producing an object model in return.</summary>
        /// <param name="domElement">ATOM entry DOM element.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the ATOM entry.</param>
        /// <param name="model">Metadata that describes the conceptual schema.</param>
        /// <returns type="Object">A new object representing the entry.</returns>

        var entryMetadata = {};
        var entry = { __metadata: entryMetadata };

        var etag = xmlAttributeValue(domElement, "etag", odataMetaXmlNs);
        if (etag) {
            entryMetadata.etag = etag;
        }

        baseURI = xmlBaseURI(domElement, baseURI);

        xmlChildElements(domElement, function (child) {
            var nsURI = xmlNamespaceURI(child);
            var localName = xmlLocalName(child);

            if (nsURI === atomXmlNs) {
                if (localName === "id") {
                    atomReadEntryId(child, entryMetadata, baseURI);
                    return;
                }
                if (localName === "category") {
                    atomReadEntryType(child, entryMetadata);
                    return;
                }
                if (localName === "content") {
                    atomReadEntryContent(child, entry, entryMetadata, baseURI);
                    return;
                }
                if (localName === "link") {
                    atomReadEntryLink(child, entry, entryMetadata, baseURI, model);
                    return;
                }
                return;
            }

            if (nsURI === odataMetaXmlNs) {
                if (localName === "properties") {
                    atomReadEntryStructuralObject(child, entry, entryMetadata);
                    return;
                }
                if (localName === "action") {
                    atomReadAdvertisedAction(child, baseURI, entryMetadata);
                    return;
                }
                if (localName === "function") {
                    atomReadAdvertisedFunction(child, baseURI, entryMetadata);
                    return;
                }
            }
        });

        // Apply feed customizations if applicable
        var entityType = lookupEntityType(entryMetadata.type, model);
        atomApplyAllFeedCustomizations(entityType, model, function (customization) {
            atomApplyCustomizationToEntryObject(customization, domElement, entry);
        });

        return entry;
    };

    var atomReadEntryId = function (domElement, entryMetadata, baseURI) {
        /// <summary>Reads an ATOM entry id DOM element.</summary>
        /// <param name="domElement">ATOM id DOM element.</param>
        /// <param name="entryMetadata">Entry metadata object to update with the id information.</param>

        entryMetadata.uri = normalizeURI(xmlInnerText(domElement), xmlBaseURI(domElement, baseURI));
        entryMetadata.uri_extensions = atomReadExtensionAttributes(domElement);
    };

    var atomReadEntryType = function (domElement, entryMetadata) {
        /// <summary>Reads type information from an ATOM category DOM element.</summary>
        /// <param name="domElement">ATOM category DOM element.</param>
        /// <param name="entryMetadata">Entry metadata object to update with the type information.</param>

        if (xmlAttributeValue(domElement, "scheme") === odataScheme) {
            if (entryMetadata.type) {
                throw { message: "Invalid AtomPub document: multiple category elements defining the entry type were encounterd withing an entry", element: domElement };
            }

            var typeExtensions = [];
            xmlAttributes(domElement, function (attribute) {
                var nsURI = xmlNamespaceURI(attribute);
                var localName = xmlLocalName(attribute);

                if (!nsURI) {
                    if (localName !== "scheme" && localName !== "term") {
                        typeExtensions.push(createAttributeExtension(attribute, true));
                    }
                    return;
                }

                if (isExtensionNs(nsURI)) {
                    typeExtensions.push(createAttributeExtension(attribute, true));
                }
            });

            entryMetadata.type = xmlAttributeValue(domElement, "term");
            entryMetadata.type_extensions = typeExtensions;
        }
    };

    var atomReadEntryContent = function (domElement, entry, entryMetadata, baseURI) {
        /// <summary>Reads an ATOM content DOM element.</summary>
        /// <param name="domElement">ATOM content DOM element.</param>
        /// <param name="entry">Entry object to update with information.</param>
        /// <param name="entryMetadata">Entry metadata object to update with the content information.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the Atom entry content.</param>

        var src = xmlAttributeValue(domElement, "src");
        var type = xmlAttributeValue(domElement, "type");

        if (src) {
            if (!type) {
                throw {
                    message: "Invalid AtomPub document: content element must specify the type attribute if the src attribute is also specified",
                    element: domElement
                };
            }

            entryMetadata.media_src = normalizeURI(src, xmlBaseURI(domElement, baseURI));
            entryMetadata.content_type = type;
        }

        xmlChildElements(domElement, function (child) {
            if (src) {
                throw { message: "Invalid AtomPub document: content element must not have child elements if the src attribute is specified", element: domElement };
            }

            if (xmlNamespaceURI(child) === odataMetaXmlNs && xmlLocalName(child) === "properties") {
                atomReadEntryStructuralObject(child, entry, entryMetadata);
            }
        });
    };

    var atomReadEntryLink = function (domElement, entry, entryMetadata, baseURI, model) {
        /// <summary>Reads a link element on an entry.</summary>
        /// <param name="atomEntryLink">'link' element on the entry.</param>
        /// <param name="entry" type="Object">Entry object to update with the link data.</param>
        /// <param name="entryMetadata">Entry metadata object to update with the link metadata.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing the link href.</param>
        /// <param name="model" type="Object">Metadata that describes the conceptual schema.</param>

        var link = atomReadLink(domElement, baseURI);

        var rel = link.rel;
        var href = link.href;
        var extensions = link.extensions;

        if (rel === "self") {
            entryMetadata.self = href;
            entryMetadata.self_link_extensions = extensions;
            return;
        }

        if (rel === "edit") {
            entryMetadata.edit = href;
            entryMetadata.edit_link_extensions = extensions;
            return;
        }

        if (rel === "edit-media") {
            entryMetadata.edit_media = link.href;
            entryMetadata.edit_media_extensions = extensions;
            atomReadLinkMediaEtag(link, entryMetadata);
            return;
        }

        // This might be a named stream edit link
        if (rel.indexOf(odataEditMediaPrefix) === 0) {
            atomReadNamedStreamEditLink(link, entry, entryMetadata);
            return;
        }

        // This might be a named stram media resource (read) link
        if (rel.indexOf(odataMediaResourcePrefix) === 0) {
            atomReadNamedStreamSelfLink(link, entry, entryMetadata);
            return;
        }

        // This might be a navigation property
        if (rel.indexOf(odataRelatedPrefix) === 0) {
            atomReadNavPropLink(domElement, link, entry, entryMetadata, model);
            return;
        }

        if (rel.indexOf(odataRelatedLinksPrefix) === 0) {
            atomReadNavPropRelatedLink(link, entryMetadata);
            return;
        }
    };

    var atomReadNavPropRelatedLink = function (link, entryMetadata) {
        /// <summary>Reads a link represnting the links related to a navigation property in an OData Atom document.</summary>
        /// <param name="link" type="Object">Object representing the parsed link DOM element.</param>
        /// <param name="entryMetadata" type="Object">Entry metadata object to update with the related links information.</param>

        var propertyName = link.rel.substring(odataRelatedLinksPrefix.length);

        // Set the extra property information on the entry object metadata.
        entryMetadata.properties = entryMetadata.properties || {};
        var propertyMetadata = entryMetadata.properties[propertyName] = entryMetadata.properties[propertyName] || {};

        propertyMetadata.associationuri = link.href;
        propertyMetadata.associationuri_extensions = link.extensions;
    };

    var atomReadNavPropLink = function (domElement, link, entry, entryMetadata, model) {
        /// <summary>Reads a link representing a navigation property in an OData Atom document.</summary>
        /// <param name="domElement">DOM element for a navigation property in an OData Atom document.</summary>
        /// <param name="link" type="Object">Object representing the parsed link DOM element.</param>
        /// <param name="entry" type="Object">Entry object to update with the navigation property.</param>
        /// <param name="entryMetadata">Entry metadata object to update with the navigation property metadata.</param>
        /// <param name="model" type="Object">Metadata that describes the conceptual schema.</param>

        // Get any inline data.
        var inlineData;
        var inlineElement = xmlFirstChildElement(domElement, odataMetaXmlNs, "inline");
        if (inlineElement) {
            var inlineDocRoot = xmlFirstChildElement(inlineElement);
            var inlineBaseURI = xmlBaseURI(inlineElement, link.baseURI);
            inlineData = inlineDocRoot ? atomReadDocument(inlineDocRoot, inlineBaseURI, model) : null;
        } else {
            // If the link has no inline content, we consider it deferred.
            inlineData = { __deferred: { uri: link.href} };
        }

        var propertyName = link.rel.substring(odataRelatedPrefix.length);

        // Set the property value on the entry object.
        entry[propertyName] = inlineData;

        // Set the extra property information on the entry object metadata.
        entryMetadata.properties = entryMetadata.properties || {};
        var propertyMetadata = entryMetadata.properties[propertyName] = entryMetadata.properties[propertyName] || {};

        propertyMetadata.extensions = link.extensions;
    };

    var atomReadNamedStreamEditLink = function (link, entry, entryMetadata) {
        /// <summary>Reads a link representing the edit-media url of a named stream in an OData Atom document.</summary>
        /// <param name="link" type="Object">Object representing the parsed link DOM element.</param>
        /// <param name="entry" type="Object">Entry object to update with the named stream data.</param>
        /// <param name="entryMetadata">Entry metadata object to update with the named stream metadata.</param>

        var propertyName = link.rel.substring(odataEditMediaPrefix.length);

        var namedStreamMediaResource = atomGetEntryNamedStreamMediaResource(propertyName, entry, entryMetadata);
        var mediaResource = namedStreamMediaResource.value;
        var mediaResourceMetadata = namedStreamMediaResource.metadata;

        var editMedia = link.href;

        mediaResource.edit_media = editMedia;
        mediaResource.content_type = link.type;
        mediaResourceMetadata.edit_media_extensions = link.extensions;

        // If there is only the edit link, make it the media self link as well.
        mediaResource.media_src = mediaResource.media_src || editMedia;
        mediaResourceMetadata.media_src_extensions = mediaResourceMetadata.media_src_extensions || [];

        atomReadLinkMediaEtag(link, mediaResource);
    };

    var atomReadNamedStreamSelfLink = function (link, entry, entryMetadata) {
        /// <summary>Reads a link representing the self url of a named stream in an OData Atom document.</summary>
        /// <param name="link" type="Object">Object representing the parsed link DOM element.</param>
        /// <param name="entry" type="Object">Entry object to update with the named stream data.</param>
        /// <param name="entryMetadata">Entry metadata object to update with the named stream metadata.</param>

        var propertyName = link.rel.substring(odataMediaResourcePrefix.length);

        var namedStreamMediaResource = atomGetEntryNamedStreamMediaResource(propertyName, entry, entryMetadata);
        var mediaResource = namedStreamMediaResource.value;
        var mediaResourceMetadata = namedStreamMediaResource.metadata;

        mediaResource.media_src = link.href;
        mediaResourceMetadata.media_src_extensions = link.extensions;
        mediaResource.content_type = link.type;
    };

    var atomGetEntryNamedStreamMediaResource = function (name, entry, entryMetadata) {
        /// <summary>Gets the media resource object and metadata object for a named stream in an entry object.</summary>
        /// <param name="link" type="Object">Object representing the parsed link DOM element.</param>
        /// <param name="entry" type="Object">Entry object from which the media resource object will be obtained.</param>
        /// <param name="entryMetadata" type="Object">Entry metadata object from which the media resource metadata object will be obtained.</param>
        /// <remarks>
        ///    If the entry doest' have a media resource for the named stream indicated by the name argument, then this function will create a new
        ///    one along with its metadata object.
        /// <remarks>
        /// <returns type="Object"> Object containing the value and metadata of the named stream's media resource. <returns>

        entryMetadata.properties = entryMetadata.properties || {};

        var mediaResourceMetadata = entryMetadata.properties[name];
        var mediaResource = entry[name] && entry[name].__mediaresource;

        if (!mediaResource) {
            mediaResource = {};
            entry[name] = { __mediaresource: mediaResource };
            entryMetadata.properties[name] = mediaResourceMetadata = {};
        }
        return { value: mediaResource, metadata: mediaResourceMetadata };
    };

    var atomReadLinkMediaEtag = function (link, mediaResource) {
        /// <summary>Gets the media etag from the link extensions and updates the media resource object with it.</summary>
        /// <param name="link" type="Object">Object representing the parsed link DOM element.</param>
        /// <param name="mediaResource" type="Object">Object containing media information for an OData Atom entry.</param>
        /// <remarks>
        ///    The function will remove the extension object for the etag if it finds it in the link extensions and will set
        ///    its value under the media_etag property of the mediaResource object.
        /// <remarks>
        /// <returns type="Object"> Object containing the value and metadata of the named stream's media resource. <returns>

        var extensions = link.extensions;
        var i, len;
        for (i = 0, len = extensions.length; i < len; i++) {
            if (extensions[i].namespaceURI === odataMetaXmlNs && extensions[i].name === "etag") {
                mediaResource.media_etag = extensions[i].value;
                extensions.splice(i, 1);
                return;
            }
        }
    };

    var atomReadEntryStructuralObject = function (domElement, parent, parentMetadata) {
        /// <summary>Reads an atom entry's property as a structural object and sets its value in the parent and the metadata in the parentMetadata objects.</summary>
        /// <param name="propertiesElement">XML element for the 'properties' node.</param>
        /// <param name="parent">
        ///     Object that will contain the property value. It can be either an antom entry or
        ///     an atom complex property object.
        /// </param>
        /// <param name="parentMetadata">Object that will contain the property metadata. It can be either an atom entry metadata or a complex property metadata object</param>

        xmlChildElements(domElement, function (child) {
            var property = xmlReadODataProperty(child);
            if (property) {
                var propertyName = property.name;
                var propertiesMetadata = parentMetadata.properties = parentMetadata.properties || {};
                propertiesMetadata[propertyName] = property.metadata;
                parent[propertyName] = property.value;
            }
        });
    };

    var atomReadServiceDocument = function (domElement, baseURI) {
        /// <summary>Reads an AtomPub service document</summary>
        /// <param name="atomServiceDoc">DOM element for the root of an AtomPub service document</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the AtomPub service document.</param>
        /// <returns type="Object">An object that contains the properties of the service document</returns>

        var workspaces = [];
        var extensions = [];

        baseURI = xmlBaseURI(domElement, baseURI);
        // Find all the workspace elements.
        xmlChildElements(domElement, function (child) {
            if (xmlNamespaceURI(child) === appXmlNs && xmlLocalName(child) === "workspace") {
                workspaces.push(atomReadServiceDocumentWorkspace(child, baseURI));
                return;
            }
            extensions.push(createElementExtension(child));
        });

        // AtomPub (RFC 5023 Section 8.3.1) says a service document MUST contain one or
        // more workspaces. Throw if we don't find any.
        if (workspaces.length === 0) {
            throw { message: "Invalid AtomPub service document: No workspace element found.", element: domElement };
        }

        return { workspaces: workspaces, extensions: extensions };
    };

    var atomReadServiceDocumentWorkspace = function (domElement, baseURI) {
        /// <summary>Reads a single workspace element from an AtomPub service document</summary>
        /// <param name="domElement">DOM element that represents a workspace of an AtomPub service document</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the AtomPub service document workspace.</param>
        /// <returns type="Object">An object that contains the properties of the workspace</returns>

        var collections = [];
        var extensions = [];
        var title; // = undefined;

        baseURI = xmlBaseURI(domElement, baseURI);

        xmlChildElements(domElement, function (child) {
            var nsURI = xmlNamespaceURI(child);
            var localName = xmlLocalName(child);

            if (nsURI === atomXmlNs) {
                if (localName === "title") {
                    if (title !== undefined) {
                        throw { message: "Invalid AtomPub service document: workspace has more than one child title element", element: child };
                    }

                    title = xmlInnerText(child);
                    return;
                }
            }

            if (nsURI === appXmlNs) {
                if (localName === "collection") {
                    collections.push(atomReadServiceDocumentCollection(child, baseURI));
                }
                return;
            }
            extensions.push(atomReadExtensionElement(child));
        });

        return { title: title || "", collections: collections, extensions: extensions };
    };

    var atomReadServiceDocumentCollection = function (domElement, baseURI) {
        /// <summary>Reads a service document collection element into an object.</summary>
        /// <param name="domElement">DOM element that represents a collection of an AtomPub service document.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the AtomPub service document collection.</param>
        /// <returns type="Object">An object that contains the properties of the collection.</returns>


        var href = xmlAttributeValue(domElement, "href");

        if (!href) {
            throw { message: "Invalid AtomPub service document: collection has no href attribute", element: domElement };
        }

        baseURI = xmlBaseURI(domElement, baseURI);
        href = normalizeURI(href, xmlBaseURI(domElement, baseURI));
        var extensions = [];
        var title; // = undefined;

        xmlChildElements(domElement, function (child) {
            var nsURI = xmlNamespaceURI(child);
            var localName = xmlLocalName(child);

            if (nsURI === atomXmlNs) {
                if (localName === "title") {
                    if (title !== undefined) {
                        throw { message: "Invalid AtomPub service document: collection has more than one child title element", element: child };
                    }
                    title = xmlInnerText(child);
                }
                return;
            }

            if (nsURI !== appXmlNs) {
                extensions.push(atomReadExtensionElement(domElement));
            }
        });

        // AtomPub (RFC 5023 Section 8.3.3) says the collection element MUST contain
        // a title element. It's likely to be problematic if the service doc doesn't
        // have one so here we throw.
        if (!title) {
            throw { message: "Invalid AtomPub service document: collection has no title element", element: domElement };
        }

        return { title: title, href: href, extensions: extensions };
    };

    var atomNewElement = function (dom, name, children) {
        /// <summary>Creates a new DOM element in the Atom namespace.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Local name of the Atom element to create.</param>
        /// <param name="children" type="Array">Array containing DOM nodes or string values that will be added as children of the new DOM element.</param>
        /// <returns>New DOM element in the Atom namespace.</returns>
        /// <remarks>
        ///    If a value in the children collection is a string, then a new DOM text node is going to be created
        ///    for it and then appended as a child of the new DOM Element.
        /// </remarks>

        return xmlNewElement(dom, atomXmlNs, xmlQualifiedName(atomPrefix, name), children);
    };

    var atomNewAttribute = function (dom, name, value) {
        /// <summary>Creates a new DOM attribute for an Atom element in the default namespace.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Local name of the OData attribute to create.</param>
        /// <param name="value">Attribute value.</param>
        /// <returns>New DOM attribute in the default namespace.</returns>

        return xmlNewAttribute(dom, null, name, value);
    };

    var atomCanRemoveProperty = function (propertyElement) {
        /// <summary>Checks whether the property represented by domElement can be removed from the atom document DOM tree.</summary>
        /// <param name="propertyElement">DOM element for the property to test.</param>
        /// <remarks>
        ///     The property can only be removed if it doens't have any children and only has namespace or type declaration attributes.
        /// </remarks>
        /// <returns type="Boolean">True is the property can be removed; false otherwise.</returns>

        if (propertyElement.childNodes.length > 0) {
            return false;
        }

        var isEmpty = true;
        var attributes = propertyElement.attributes;
        var i, len;
        for (i = 0, len = attributes.length; i < len && isEmpty; i++) {
            var attribute = attributes[i];

            isEmpty = isEmpty && isXmlNSDeclaration(attribute) ||
                 (xmlNamespaceURI(attribute) == odataMetaXmlNs && xmlLocalName(attribute) === "type");
        }
        return isEmpty;
    };

    var atomNewODataNavigationProperty = function (dom, name, kind, value, model) {
        /// <summary>Creates a new Atom link DOM element for a navigation property in an OData Atom document.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Property name.</param>
        /// <param name="kind" type="String">Navigation property kind. Expected values are "deferred", "entry", or "feed".</param>
        /// <param name="value" optional="true" mayBeNull="true">Value of the navigation property, if any.</param>
        /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
        /// <returns type="Object">
        ///     Object containing the new Atom link DOM element for the navigation property and the
        ///     required data service version for this property.
        /// </returns>

        var linkType = null;
        var linkContent = null;
        var linkContentBodyData = null;
        var href = "";

        if (kind !== "deferred") {
            linkType = atomNewAttribute(dom, "type", "application/atom+xml;type=" + kind);
            linkContent = xmlNewODataMetaElement(dom, "inline");

            if (value) {
                href = value.__metadata && value.__metadata.uri || "";
                linkContentBodyData =
                    atomNewODataFeed(dom, value, model) ||
                    atomNewODataEntry(dom, value, model);
                xmlAppendChild(linkContent, linkContentBodyData.element);
            }
        } else {
            href = value.__deferred.uri;
        }

        var navProp = atomNewElement(dom, "link", [
            atomNewAttribute(dom, "href", href),
            atomNewAttribute(dom, "rel", normalizeURI(name, odataRelatedPrefix)),
            linkType,
            linkContent
        ]);

        return xmlNewODataElementInfo(navProp, linkContentBodyData ? linkContentBodyData.dsv : "1.0");
    };

    var atomNewODataEntryDataItem = function (dom, name, value, dataItemMetadata, dataItemModel, model) {
        /// <summary>Creates a new DOM element for a data item in an entry, complex property, or collection property.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="name" type="String">Data item name.</param>
        /// <param name="value" optional="true" mayBeNull="true">Value of the data item, if any.</param>
        /// <param name="dataItemMetadata" type="Object" optional="true">Object containing metadata about the data item.</param>
        /// <param name="dataItemModel" type="Object" optional="true">Object describing the data item in an OData conceptual schema.</param>
        /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
        /// <returns type="Object">
        ///     Object containing the new DOM element in the appropriate namespace for the data item and the
        ///     required data service version for it.
        /// </returns>

        if (isNamedStream(value)) {
            return null;
        }

        var dataElement = xmlNewODataDataElement(dom, name, value, dataItemMetadata, dataItemModel, model);
        if (!dataElement) {
            // This may be a navigation property.
            var navPropKind = navigationPropertyKind(value, dataItemModel);

            dataElement = atomNewODataNavigationProperty(dom, name, navPropKind, value, model);
        }
        return dataElement;
    };

    var atomEntryCustomization = function (dom, entry, entryProperties, customization) {
        /// <summary>Applies a feed customization by transforming an Atom entry DOM element as needed.</summary>
        /// <param name="dom">DOM document used for creating any new DOM nodes required by the customization.</param>
        /// <param name="entry">DOM element for the Atom entry to which the customization is going to be applied.</param>
        /// <param name="entryProperties">DOM element containing the properties of the Atom entry.</param>
        /// <param name="customization" type="Object">Object describing an applicable feed customization.</param>
        /// <remarks>
        ///     Look into the atomfeedCustomization function for a description of the customization object.
        /// </remarks>
        /// <returns type="String">Data service version required by the applied customization</returns>

        var atomProperty = xmlFindElementByPath(entryProperties, odataXmlNs, customization.propertyPath);
        var atomPropertyNullAttribute = atomProperty && xmlAttributeNode(atomProperty, "null", odataMetaXmlNs);
        var atomPropertyValue;
        var dataServiceVersion = "1.0";

        if (atomPropertyNullAttribute && atomPropertyNullAttribute.value === "true") {
            return dataServiceVersion;
        }

        if (atomProperty) {
            atomPropertyValue = xmlInnerText(atomProperty) || "";
            if (!customization.keepInContent) {
                dataServiceVersion = "2.0";
                var parent = atomProperty.parentNode;
                var candidate = parent;

                parent.removeChild(atomProperty);
                while (candidate !== entryProperties && atomCanRemoveProperty(candidate)) {
                    parent = candidate.parentNode;
                    parent.removeChild(candidate);
                    candidate = parent;
                }
            }
        }

        var targetNode = xmlNewNodeByPath(dom, entry,
            customization.nsURI, customization.nsPrefix, customization.entryPath);

        if (targetNode.nodeType === 2) {
            targetNode.value = atomPropertyValue;
            return dataServiceVersion;
        }

        var contentKind = customization.contentKind;
        xmlAppendChildren(targetNode, [
                contentKind && xmlNewAttribute(dom, null, "type", contentKind),
                contentKind === "xhtml" ? xmlNewFragment(dom, atomPropertyValue) : atomPropertyValue
        ]);

        return dataServiceVersion;
    };

    var atomNewODataEntry = function (dom, data, model) {
        /// <summary>Creates a new DOM element for an Atom entry.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="data" type="Object">Entry object in the library's internal representation.</param>
        /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
        /// <returns type="Object">
        ///     Object containing the new DOM element for the Atom entry and the required data service version for it.
        /// </returns>

        var payloadMetadata = data.__metadata || {};
        var propertiesMetadata = payloadMetadata.properties || {};

        var etag = payloadMetadata.etag;
        var uri = payloadMetadata.uri;
        var typeName = payloadMetadata.type;
        var entityType = lookupEntityType(typeName, model);

        var properties = xmlNewODataMetaElement(dom, "properties");
        var entry = atomNewElement(dom, "entry", [
            atomNewElement(dom, "author",
                atomNewElement(dom, "name")
            ),
            etag && xmlNewODataMetaAttribute(dom, "etag", etag),
            uri && atomNewElement(dom, "id", uri),
            typeName && atomNewElement(dom, "category", [
                atomNewAttribute(dom, "term", typeName),
                atomNewAttribute(dom, "scheme", odataScheme)
            ]),
        // TODO: MLE support goes here.
            atomNewElement(dom, "content", [
                atomNewAttribute(dom, "type", "application/xml"),
                properties
            ])
        ]);

        var dataServiceVersion = "1.0";
        for (var name in data) {
            if (name !== "__metadata") {
                var entryDataItemMetadata = propertiesMetadata[name] || {};
                var entryDataItemModel = entityType && (
                    lookupProperty(entityType.property, name) ||
                    lookupProperty(entityType.navigationProperty, name));

                var entryDataItem = atomNewODataEntryDataItem(dom, name, data[name], entryDataItemMetadata, entryDataItemModel, model);
                if (entryDataItem) {
                    var entryElement = entryDataItem.element;
                    var entryElementParent = (xmlNamespaceURI(entryElement) === atomXmlNs) ? entry : properties;

                    xmlAppendChild(entryElementParent, entryElement);
                    dataServiceVersion = maxVersion(dataServiceVersion, entryDataItem.dsv);
                }
            }
        }

        atomApplyAllFeedCustomizations(entityType, model, function (customization) {
            var customizationDsv = atomEntryCustomization(dom, entry, properties, customization);
            dataServiceVersion = maxVersion(dataServiceVersion, customizationDsv);
        });

        return xmlNewODataElementInfo(entry, dataServiceVersion);
    };

    var atomNewODataFeed = function (dom, data, model) {
        /// <summary>Creates a new DOM element for an Atom feed.</summary>
        /// <param name="dom">DOM document used for creating the new DOM Element.</param>
        /// <param name="data" type="Object">Feed object in the library's internal representation.</param>
        /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
        /// <returns type="Object">
        ///     Object containing the new DOM element for the Atom feed and the required data service version for it.
        /// </returns>

        var entries = isArray(data) ? data : data.results;

        if (!entries) {
            return null;
        }

        var dataServiceVersion = "1.0";
        var atomFeed = atomNewElement(dom, "feed");

        var i, len;
        for (i = 0, len = entries.length; i < len; i++) {
            var atomEntryData = atomNewODataEntry(dom, entries[i], model);
            xmlAppendChild(atomFeed, atomEntryData.element);
            dataServiceVersion = maxVersion(dataServiceVersion, atomEntryData.dsv);
        }
        return xmlNewODataElementInfo(atomFeed, dataServiceVersion);
    };

    var atomNewODataDocument = function (data, model) {
        /// <summary>Creates a new OData Atom document.</summary>
        /// <param name="data" type="Object">Feed or entry object in the libary's internal representaion.</param>
        /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
        /// <returns type="Object">
        ///     Object containing the new DOM document for the Atom document and the required data service version for it.
        /// </returns>

        if (data) {
            var atomRootWriter = isFeed(data) && atomNewODataFeed ||
                isObject(data) && atomNewODataEntry;

            if (atomRootWriter) {
                var dom = xmlDom();
                var atomRootData = atomRootWriter(dom, data, model);

                if (atomRootData) {
                    var atomRootElement = atomRootData.element;
                    xmlAppendChildren(atomRootElement, [
                        xmlNewNSDeclaration(dom, odataMetaXmlNs, odataMetaPrefix),
                        xmlNewNSDeclaration(dom, odataXmlNs, odataPrefix)
                    ]);
                    return xmlNewODataElementInfo(xmlAppendChild(dom, atomRootElement), atomRootData.dsv);
                }
            }
        }
        return null;
    };

    var atomParser = function (handler, text, context) {
        /// <summary>Parses an ATOM document (feed, entry or service document).</summary>
        /// <param name="handler">This handler.</param>
        /// <param name="text" type="String">Document text.</param>
        /// <param name="context" type="Object">Object with parsing context.</param>
        /// <returns>An object representation of the document; undefined if not applicable.</returns>

        if (text) {
            var atomDoc = xmlParse(text);
            var atomRoot = xmlFirstChildElement(atomDoc);
            if (atomRoot) {
                return atomReadDocument(atomRoot, null, context.metadata);
            }
        }
    };

    var atomSerializer = function (handler, data, context) {
        /// <summary>Serializes an ATOM object into a document (feed or entry).</summary>
        /// <param name="handler">This handler.</param>
        /// <param name="data" type="Object">Representation of feed or entry.</param>
        /// <param name="context" type="Object">Object with parsing context.</param>
        /// <returns>An text representation of the data object; undefined if not applicable.</returns>

        var cType = context.contentType = context.contentType || contentType(atomMediaType);
        if (cType && cType.mediaType === atomMediaType) {
            var atomDoc = atomNewODataDocument(data, context.metadata);
            if (atomDoc) {
                context.dataServiceVersion = maxVersion(context.dataServiceVersion || "1.0", atomDoc.dsv);
                return xmlSerialize(atomDoc.element);
            }
        }
        // Allow undefined to be returned.
    };

    odata.atomHandler = handler(atomParser, atomSerializer, atomAcceptTypes.join(","), MAX_DATA_SERVICE_VERSION);



    var schemaElement = function (attributes, elements, text, ns) {
        /// <summary>Creates an object that describes an element in an schema.</summary>
        /// <param name="attributes" type="Array">List containing the names of the attributes allowed for this element.</param>
        /// <param name="elements" type="Array">List containing the names of the child elements allowed for this element.</param>
        /// <param name="text" type="Boolean">Flag indicating if the element's text value is of interest or not.</param>
        /// <param name="ns" type="String">Namespace to which the element belongs to.</param>
        /// <remarks>
        ///    If a child element name ends with * then it is understood by the schema that that child element can appear 0 or more times.
        /// </remarks>
        /// <returns type="Object">Object with attributes, elements, text, and ns fields.</returns>

        return {
            attributes: attributes,
            elements: elements,
            text: text || false,
            ns: ns
        };
    };

    // It's assumed that all elements may have Documentation children and Annotation elements.
    // See http://msdn.microsoft.com/en-us/library/bb399292.aspx for a CSDL reference.
    var schema = {
        elements: {
            Annotations: schemaElement(
            /*attributes*/["Target", "Qualifier"],
            /*elements*/["TypeAnnotation*", "ValueAnnotation*"]
            ),
            Association: schemaElement(
            /*attributes*/["Name"],
            /*elements*/["End*", "ReferentialConstraint", "TypeAnnotation*", "ValueAnnotation*"]
            ),
            AssociationSet: schemaElement(
            /*attributes*/["Name", "Association"],
            /*elements*/["End*", "TypeAnnotation*", "ValueAnnotation*"]
            ),
            Binary: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Bool: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Collection: schemaElement(
            /*attributes*/null,
            /*elements*/["String*", "Int*", "Float*", "Decimal*", "Bool*", "DateTime*", "DateTimeOffset*", "Guid*", "Binary*", "Time*", "Collection*", "Record*"]
            ),
            CollectionType: schemaElement(
            /*attributes*/["ElementType", "Nullable", "DefaultValue", "MaxLength", "FixedLength", "Precision", "Scale", "Unicode", "Collation", "SRID"],
            /*elements*/["CollectionType", "ReferenceType", "RowType", "TypeRef"]
            ),
            ComplexType: schemaElement(
            /*attributes*/["Name", "BaseType", "Abstract"],
            /*elements*/["Property*", "TypeAnnotation*", "ValueAnnotation*"]
            ),
            DateTime: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            DateTimeOffset: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Decimal: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            DefiningExpression: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Dependent: schemaElement(
            /*attributes*/["Role"],
            /*elements*/["PropertyRef*"]
            ),
            Documentation: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            End: schemaElement(
            /*attributes*/["Type", "Role", "Multiplicity", "EntitySet"],
            /*elements*/["OnDelete"]
            ),
            EntityContainer: schemaElement(
            /*attributes*/["Name", "Extends"],
            /*elements*/["EntitySet*", "AssociationSet*", "FunctionImport*", "TypeAnnotation*", "ValueAnnotation*"]
            ),
            EntitySet: schemaElement(
            /*attributes*/["Name", "EntityType"],
            /*elements*/["TypeAnnotation*", "ValueAnnotation*"]
            ),
            EntityType: schemaElement(
            /*attributes*/["Name", "BaseType", "Abstract", "OpenType"],
            /*elements*/["Key", "Property*", "NavigationProperty*", "TypeAnnotation*", "ValueAnnotation*"]
            ),
            EnumType: schemaElement(
            /*attributes*/["Name", "UnderlyingType", "IsFlags"],
            /*elements*/["Member*"]
            ),
            Float: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Function: schemaElement(
            /*attributes*/["Name", "ReturnType"],
            /*elements*/["Parameter*", "DefiningExpression", "ReturnType", "TypeAnnotation*", "ValueAnnotation*"]
            ),
            FunctionImport: schemaElement(
            /*attributes*/["Name", "ReturnType", "EntitySet", "IsSideEffecting", "IsComposable", "IsBindable", "EntitySetPath"],
            /*elements*/["Parameter*", "ReturnType", "TypeAnnotation*", "ValueAnnotation*"]
            ),
            Guid: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Int: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Key: schemaElement(
            /*attributes*/null,
            /*elements*/["PropertyRef*"]
            ),
            LabeledElement: schemaElement(
            /*attributes*/["Name"],
            /*elements*/["Path", "String", "Int", "Float", "Decimal", "Bool", "DateTime", "DateTimeOffset", "Guid", "Binary", "Time", "Collection", "Record", "LabeledElement", "Null"]
            ),
            Member: schemaElement(
            /*attributes*/["Name", "Value"]
            ),
            NavigationProperty: schemaElement(
            /*attributes*/["Name", "Relationship", "ToRole", "FromRole", "ContainsTarget"],
            /*elements*/["TypeAnnotation*", "ValueAnnotation*"]
            ),
            Null: schemaElement(
            /*attributes*/null,
            /*elements*/null
            ),
            OnDelete: schemaElement(
            /*attributes*/["Action"]
            ),
            Path: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Parameter: schemaElement(
            /*attributes*/["Name", "Type", "Mode", "Nullable", "DefaultValue", "MaxLength", "FixedLength", "Precision", "Scale", "Unicode", "Collation", "ConcurrencyMode", "SRID"],
            /*elements*/["CollectionType", "ReferenceType", "RowType", "TypeRef", "TypeAnnotation*", "ValueAnnotation*"]
            ),
            Principal: schemaElement(
            /*attributes*/["Role"],
            /*elements*/["PropertyRef*"]
            ),
            Property: schemaElement(
            /*attributes*/["Name", "Type", "Nullable", "DefaultValue", "MaxLength", "FixedLength", "Precision", "Scale", "Unicode", "Collation", "ConcurrencyMode", "CollectionKind", "SRID"],
            /*elements*/["CollectionType", "ReferenceType", "RowType", "TypeAnnotation*", "ValueAnnotation*"]
            ),
            PropertyRef: schemaElement(
            /*attributes*/["Name"]
            ),
            PropertyValue: schemaElement(
            /*attributes*/["Property", "Path", "String", "Int", "Float", "Decimal", "Bool", "DateTime", "DateTimeOffset", "Guid", "Binary", "Time"],
            /*Elements*/["Path", "String", "Int", "Float", "Decimal", "Bool", "DateTime", "DateTimeOffset", "Guid", "Binary", "Time", "Collection", "Record", "LabeledElement", "Null"]
            ),
            ReferenceType: schemaElement(
            /*attributes*/["Type"]
            ),
            ReferentialConstraint: schemaElement(
            /*attributes*/null,
            /*elements*/["Principal", "Dependent"]
            ),
            ReturnType: schemaElement(
            /*attributes*/["ReturnType", "Type", "EntitySet"],
            /*elements*/["CollectionType", "ReferenceType", "RowType"]
            ),
            RowType: schemaElement(
            /*elements*/["Property*"]
            ),
            String: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Schema: schemaElement(
            /*attributes*/["Namespace", "Alias"],
            /*elements*/["Using*", "EntityContainer*", "EntityType*", "Association*", "ComplexType*", "Function*", "ValueTerm*", "Annotations*"]
            ),
            Time: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            TypeAnnotation: schemaElement(
            /*attributes*/["Term", "Qualifier"],
            /*elements*/["PropertyValue*"]
            ),
            TypeRef: schemaElement(
            /*attributes*/["Type", "Nullable", "DefaultValue", "MaxLength", "FixedLength", "Precision", "Scale", "Unicode", "Collation", "SRID"]
            ),
            Using: schemaElement(
            /*attributes*/["Namespace", "Alias"]
            ),
            ValueAnnotation: schemaElement(
            /*attributes*/["Term", "Qualifier", "Path", "String", "Int", "Float", "Decimal", "Bool", "DateTime", "DateTimeOffset", "Guid", "Binary", "Time"],
            /*Elements*/["Path", "String", "Int", "Float", "Decimal", "Bool", "DateTime", "DateTimeOffset", "Guid", "Binary", "Time", "Collection", "Record", "LabeledElement", "Null"]
            ),
            ValueTerm: schemaElement(
            /*attributes*/["Name", "Type"],
            /*elements*/["TypeAnnotation*", "ValueAnnotation*"]
            ),

            // See http://msdn.microsoft.com/en-us/library/dd541238(v=prot.10) for an EDMX reference.
            Edmx: schemaElement(
            /*attributes*/["Version"],
            /*elements*/["DataServices", "Reference*", "AnnotationsReference*"],
            /*text*/false,
            /*ns*/edmxNs
            ),
            DataServices: schemaElement(
            /*attributes*/null,
            /*elements*/["Schema*"],
            /*text*/false,
            /*ns*/edmxNs
            )
        }
    };

    // See http://msdn.microsoft.com/en-us/library/ee373839.aspx for a feed customization reference.
    var customizationAttributes = ["m:FC_ContentKind", "m:FC_KeepInContent", "m:FC_NsPrefix", "m:FC_NsUri", "m:FC_SourcePath", "m:FC_TargetPath"];
    schema.elements.Property.attributes = schema.elements.Property.attributes.concat(customizationAttributes);
    schema.elements.EntityType.attributes = schema.elements.EntityType.attributes.concat(customizationAttributes);

    // See http://msdn.microsoft.com/en-us/library/dd541284(PROT.10).aspx for an EDMX reference.
    schema.elements.Edmx = { attributes: ["Version"], elements: ["DataServices"], ns: edmxNs };
    schema.elements.DataServices = { elements: ["Schema*"], ns: edmxNs };

    // See http://msdn.microsoft.com/en-us/library/dd541233(v=PROT.10) for Conceptual Schema Definition Language Document for Data Services.
    schema.elements.EntityContainer.attributes.push("m:IsDefaultEntityContainer");
    schema.elements.Property.attributes.push("m:MimeType");
    schema.elements.FunctionImport.attributes.push("m:HttpMethod");
    schema.elements.FunctionImport.attributes.push("m:IsAlwaysBindable");
    schema.elements.EntityType.attributes.push("m:HasStream");
    schema.elements.DataServices.attributes = ["m:DataServiceVersion", "m:MaxDataServiceVersion"];

    var scriptCase = function (text) {
        /// <summary>Converts a Pascal-case identifier into a camel-case identifier.</summary>
        /// <param name="text" type="String">Text to convert.</param>
        /// <returns type="String">Converted text.</returns>
        /// <remarks>If the text starts with multiple uppercase characters, it is left as-is.</remarks>

        if (!text) {
            return text;
        }

        if (text.length > 1) {
            var firstTwo = text.substr(0, 2);
            if (firstTwo === firstTwo.toUpperCase()) {
                return text;
            }

            return text.charAt(0).toLowerCase() + text.substr(1);
        }

        return text.charAt(0).toLowerCase();
    };

    var getChildSchema = function (parentSchema, candidateName) {
        /// <summary>Gets the schema node for the specified element.</summary>
        /// <param name="parentSchema" type="Object">Schema of the parent XML node of 'element'.</param>
        /// <param name="candidateName">XML element name to consider.</param>
        /// <returns type="Object">The schema that describes the specified element; null if not found.</returns>

        if (candidateName === "Documentation") {
            return { isArray: true, propertyName: "documentation" };
        }

        var elements = parentSchema.elements;
        if (!elements) {
            return null;
        }

        var i, len;
        for (i = 0, len = elements.length; i < len; i++) {
            var elementName = elements[i];
            var multipleElements = false;
            if (elementName.charAt(elementName.length - 1) === "*") {
                multipleElements = true;
                elementName = elementName.substr(0, elementName.length - 1);
            }

            if (candidateName === elementName) {
                var propertyName = scriptCase(elementName);
                return { isArray: multipleElements, propertyName: propertyName };
            }
        }

        return null;
    };

    // This regular expression is used to detect a feed customization element
    // after we've normalized it into the 'm' prefix. It starts with m:FC_,
    // followed by other characters, and ends with _ and a number.
    // The captures are 0 - whole string, 1 - name as it appears in internal table.
    var isFeedCustomizationNameRE = /^(m:FC_.*)_[0-9]+$/;

    var isEdmNamespace = function (nsURI) {
        /// <summary>Checks whether the specifies namespace URI is one of the known CSDL namespace URIs.</summary>
        /// <param name="nsURI" type="String">Namespace URI to check.</param>
        /// <returns type="Boolean">true if nsURI is a known CSDL namespace; false otherwise.</returns>

        return nsURI === edmNs1 ||
               nsURI === edmNs1_1 ||
               nsURI === edmNs1_2 ||
               nsURI === edmNs2a ||
               nsURI === edmNs2b ||
               nsURI === edmNs3;
    };

    var parseConceptualModelElement = function (element) {
        /// <summary>Parses a CSDL document.</summary>
        /// <param name="element">DOM element to parse.</param>
        /// <returns type="Object">An object describing the parsed element.</returns>

        var localName = xmlLocalName(element);
        var nsURI = xmlNamespaceURI(element);
        var elementSchema = schema.elements[localName];
        if (!elementSchema) {
            return null;
        }

        if (elementSchema.ns) {
            if (nsURI !== elementSchema.ns) {
                return null;
            }
        } else if (!isEdmNamespace(nsURI)) {
            return null;
        }

        var item = {};
        var extensions = [];
        var attributes = elementSchema.attributes || [];
        xmlAttributes(element, function (attribute) {

            var localName = xmlLocalName(attribute);
            var nsURI = xmlNamespaceURI(attribute);
            var value = attribute.value;

            // Don't do anything with xmlns attributes.
            if (nsURI === xmlnsNS) {
                return;
            }

            // Currently, only m: for metadata is supported as a prefix in the internal schema table,
            // un-prefixed element names imply one a CSDL element.
            var schemaName = null;
            var handled = false;
            if (isEdmNamespace(nsURI) || nsURI === null) {
                schemaName = "";
            } else if (nsURI === odataMetaXmlNs) {
                schemaName = "m:";
            }

            if (schemaName !== null) {
                schemaName += localName;

                // Feed customizations for complex types have additional
                // attributes with a suffixed counter starting at '1', so
                // take that into account when doing the lookup.
                var match = isFeedCustomizationNameRE.exec(schemaName);
                if (match) {
                    schemaName = match[1];
                }

                if (contains(attributes, schemaName)) {
                    handled = true;
                    item[scriptCase(localName)] = value;
                }
            }

            if (!handled) {
                extensions.push(createAttributeExtension(attribute));
            }
        });

        xmlChildElements(element, function (child) {
            var localName = xmlLocalName(child);
            var childSchema = getChildSchema(elementSchema, localName);
            if (childSchema) {
                if (childSchema.isArray) {
                    var arr = item[childSchema.propertyName];
                    if (!arr) {
                        arr = [];
                        item[childSchema.propertyName] = arr;
                    }
                    arr.push(parseConceptualModelElement(child));
                } else {
                    item[childSchema.propertyName] = parseConceptualModelElement(child);
                }
            } else {
                extensions.push(createElementExtension(child));
            }
        });

        if (elementSchema.text) {
            item.text = xmlInnerText(element);
        }

        if (extensions.length) {
            item.extensions = extensions;
        }

        return item;
    };

    var metadataParser = function (handler, text) {
        /// <summary>Parses a metadata document.</summary>
        /// <param name="handler">This handler.</param>
        /// <param name="text" type="String">Metadata text.</param>
        /// <returns>An object representation of the conceptual model.</returns>

        var doc = xmlParse(text);
        var root = xmlFirstChildElement(doc);
        return parseConceptualModelElement(root) || undefined;
    };

    odata.metadataHandler = handler(metadataParser, null, xmlMediaType, MAX_DATA_SERVICE_VERSION);



    var PAYLOADTYPE_OBJECT = "o";
    var PAYLOADTYPE_FEED = "f";
    var PAYLOADTYPE_PRIMITIVE = "p";
    var PAYLOADTYPE_COLLECTION = "c";
    var PAYLOADTYPE_SVCDOC = "s";
    var PAYLOADTYPE_LINKS = "l";

    var odataNs = "odata";
    var odataAnnotationPrefix = odataNs + ".";

    var bindAnnotation = "@" + odataAnnotationPrefix + "bind";
    var metadataAnnotation = odataAnnotationPrefix + "metadata";
    var navUrlAnnotation = odataAnnotationPrefix + "navigationLinkUrl";
    var typeAnnotation = odataAnnotationPrefix + "type";

    var jsonLightNameMap = {
        readLink: "self",
        editLink: "edit",
        nextLink: "__next",
        mediaReadLink: "media_src",
        mediaEditLink: "edit_media",
        mediaContentType: "content_type",
        mediaETag: "media_etag",
        count: "__count",
        media_src: "mediaReadLink",
        edit_media: "mediaEditLink",
        content_type: "mediaContentType",
        media_etag: "mediaETag",
        url: "uri"
    };

    var jsonLightAnnotations = {
        metadata: "odata.metadata",
        count: "odata.count",
        next: "odata.nextLink",
        id: "odata.id",
        etag: "odata.etag",
        read: "odata.readLink",
        edit: "odata.editLink",
        mediaRead: "odata.mediaReadLink",
        mediaEdit: "odata.mediaEditLink",
        mediaEtag: "odata.mediaETag",
        mediaContentType: "odata.mediaContentType",
        actions: "odata.actions",
        functions: "odata.functions",
        navigationUrl: "odata.navigationLinkUrl",
        associationUrl: "odata.associationLinkUrl",
        type: "odata.type"
    };

    var jsonLightAnnotationInfo = function (annotation) {
        /// <summary>Gets the name and target of an annotation in a JSON light payload.</summary>
        /// <param name="annotation" type="String">JSON light payload annotation.</param>
        /// <returns type="Object">Object containing the annotation name and the target property name.</param>

        if (annotation.indexOf(".") > 0) {
            var targetEnd = annotation.indexOf("@");
            var target = targetEnd > -1 ? annotation.substring(0, targetEnd) : null;
            var name = annotation.substring(targetEnd + 1);

            return {
                target: target,
                name: name,
                isOData: name.indexOf(odataAnnotationPrefix) === 0
            };
        }
        return null;
    };

    var jsonLightDataItemType = function (name, value, container, dataItemModel, model) {
        /// <summary>Gets the type name of a JSON light data item that belongs to a feed, an entry, a complex type property, or a collection property.</summary>
        /// <param name="name" type="String">Name of the data item for which the type name is going to be retrieved.</param>
        /// <param name="value">Value of the data item.</param>
        /// <param name="container" type="Object">JSON light object that owns the data item.</param>
        /// <param name="dataItemModel" type="Object" optional="true">Object describing the data item in an OData conceptual schema.</param>
        /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
        /// <remarks>
        ///    This function will first try to get the type name from the data item's value itself if it is a JSON light object; otherwise
        ///    it will try to get it from the odata.type annotation applied to the data item in the container. Then, it will fallback to the data item model.
        ///    If all attempts fail, it will return null.
        /// </remarks>
        /// <returns type="String">Data item type name; null if the type name cannot be found.</returns>

        return (isComplex(value) && value[typeAnnotation]) ||
            (container && container[name + "@" + typeAnnotation]) ||
            (dataItemModel && dataItemModel.type) ||
            (lookupNavigationPropertyType(dataItemModel, model)) ||
            null;
    };

    var jsonLightDataItemModel = function (name, containerModel) {
        /// <summary>Gets an object describing a data item in an OData conceptual schema.</summary>
        /// <param name="name" type="String">Name of the data item for which the model is going to be retrieved.</param>
        /// <param name="containerModel" type="Object">Object describing the owner of the data item in an OData conceptual schema.</param>
        /// <returns type="Object">Object describing the data item; null if it cannot be found.</returns>

        if (containerModel) {
            return lookupProperty(containerModel.property, name) ||
                lookupProperty(containerModel.navigationProperty, name);
        }
        return null;
    };

    var jsonLightIsEntry = function (data) {
        /// <summary>Determines whether data represents a JSON light entry object.</summary>
        /// <param name="data" type="Object">JSON light object to test.</param>
        /// <returns type="Boolean">True if the data is JSON light entry object; false otherwise.</returns>

        return isComplex(data) && ((odataAnnotationPrefix + "id") in data);
    };

    var jsonLightIsNavigationProperty = function (name, data, dataItemModel) {
        /// <summary>Determines whether a data item in a JSON light object is a navigation property.</summary>
        /// <param name="name" type="String">Name of the data item to test.</param>
        /// <param name="data" type="Object">JSON light object that owns the data item.</param>
        /// <param name="dataItemModel" type="Object">Object describing the data item in an OData conceptual schema.</param>
        /// <returns type="Boolean">True if the data item is a navigation property; false otherwise.</returns>

        if (!!data[name + "@" + navUrlAnnotation] || (dataItemModel && dataItemModel.relationship)) {
            return true;
        }

        // Sniff the property value.
        var value = isArray(data[name]) ? data[name][0] : data[name];
        return jsonLightIsEntry(value);
    };

    var jsonLightIsPrimitiveType = function (typeName) {
        /// <summary>Determines whether a type name is a primitive type in a JSON light payload.</summary>
        /// <param name="typeName" type="String">Type name to test.</param>
        /// <returns type="Boolean">True if the type name an EDM primitive type or an OData spatial type; false otherwise.</returns>

        return isPrimitiveEdmType(typeName) || isGeographyEdmType(typeName) || isGeometryEdmType(typeName);
    };

    var jsonLightReadDataAnnotations = function (data, obj, baseURI, dataModel, model) {
        /// <summary>Converts annotations found in a JSON light payload object to either properties or metadata.</summary>
        /// <param name="data" type="Object">JSON light payload object containing the annotations to convert.</param>
        /// <param name="obj" type="Object">Object that will store the converted annotations.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>
        /// <param name="dataModel" type="Object">Object describing the JSON light payload in an OData conceptual schema.</param>
        /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
        /// <returns>JSON light payload object with its annotations converted to either properties or metadata.</param>

        for (var name in data) {
            if (name.indexOf(".") > 0 && name.charAt(0) !== "#") {
                var annotationInfo = jsonLightAnnotationInfo(name);
                if (annotationInfo) {
                    var annotationName = annotationInfo.name;
                    var target = annotationInfo.target;
                    var targetModel = null;
                    var targetType = null;

                    if (target) {
                        targetModel = jsonLightDataItemModel(target, dataModel);
                        targetType = jsonLightDataItemType(target, data[target], data, targetModel, model);
                    }

                    if (annotationInfo.isOData) {
                        jsonLightApplyPayloadODataAnnotation(annotationName, target, targetType, data[name], data, obj, baseURI);
                    } else {
                        obj[name] = data[name];
                    }
                }
            }
        }
        return obj;
    };

    var jsonLightApplyPayloadODataAnnotation = function (name, target, targetType, value, data, obj, baseURI) {
        /// <summary>
        ///   Processes a JSON Light payload OData annotation producing either a property, payload metadata, or property metadata on its owner object.
        /// </summary>
        /// <param name="name" type="String">Annotation name.</param>
        /// <param name="target" type="String">Name of the property that is being targeted by the annotation.</param>
        /// <param name="targetType" type="String">Type name of the target property.</param>
        /// <param name="data" type="Object">JSON light object containing the annotation.</param>
        /// <param name="obj" type="Object">Object that will hold properties produced by the annotation.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>

        var annotation = name.substring(odataAnnotationPrefix.length);

        switch (annotation) {
            case "navigationLinkUrl":
                jsonLightApplyNavigationUrlAnnotation(annotation, target, targetType, value, data, obj, baseURI);
                return;
            case "nextLink":
            case "count":
                jsonLightApplyFeedAnnotation(annotation, target, value, obj, baseURI);
                return;
            case "mediaReadLink":
            case "mediaEditLink":
            case "mediaContentType":
            case "mediaETag":
                jsonLightApplyMediaAnnotation(annotation, target, targetType, value, obj, baseURI);
                return;
            default:
                jsonLightApplyMetadataAnnotation(annotation, target, value, obj, baseURI);
                return;
        }
    };

    var jsonLightApplyMetadataAnnotation = function (name, target, value, obj, baseURI) {
        /// <summary>
        ///    Converts a JSON light annotation that applies to entry metadata only (i.e. odata.editLink or odata.readLink) and its value
        ///    into their library's internal representation and saves it back to data.
        /// </summary>
        /// <param name="name" type="String">Annotation name.</param>
        /// <param name="target" type="String">Name of the property on which the annotation should be applied.</param>
        /// <param name="value" type="Object">Annotation value.</param>
        /// <param name="obj" type="Object">Object that will hold properties produced by the annotation.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>

        var metadata = obj.__metadata = obj.__metadata || {};
        var mappedName = jsonLightNameMap[name] || name;

        if (name === "editLink") {
            metadata.uri = normalizeURI(value, baseURI);
            metadata[mappedName] = metadata.uri;
            return;
        }

        if (name === "readLink" || name === "associationLinkUrl") {
            value = normalizeURI(value, baseURI);
        }

        if (target) {
            var propertiesMetadata = metadata.properties = metadata.properties || {};
            var propertyMetadata = propertiesMetadata[target] = propertiesMetadata[target] || {};

            if (name === "type") {
                propertyMetadata[mappedName] = propertyMetadata[mappedName] || value;
                return;
            }
            propertyMetadata[mappedName] = value;
            return;
        }
        metadata[mappedName] = value;
    };

    var jsonLightApplyFeedAnnotation = function (name, target, value, obj, baseURI) {
        /// <summary>
        ///    Converts a JSON light annotation that applies to feeds only (i.e. odata.count or odata.nextlink) and its value
        ///    into their library's internal representation and saves it back to data.
        /// </summary>
        /// <param name="name" type="String">Annotation name.</param>
        /// <param name="target" type="String">Name of the property on which the annotation should be applied.</param>
        /// <param name="value" type="Object">Annotation value.</param>
        /// <param name="obj" type="Object">Object that will hold properties produced by the annotation.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>

        var mappedName = jsonLightNameMap[name];
        var feed = target ? obj[target] : obj;
        feed[mappedName] = (name === "nextLink") ? normalizeURI(value, baseURI) : value;
    };

    var jsonLightApplyMediaAnnotation = function (name, target, targetType, value, obj, baseURI) {
        /// <summary>
        ///    Converts a JSON light media annotation in and its value into their library's internal representation
        ///    and saves it back to data or metadata.
        /// </summary>
        /// <param name="name" type="String">Annotation name.</param>
        /// <param name="target" type="String">Name of the property on which the annotation should be applied.</param>
        /// <param name="targetType" type="String">Type name of the target property.</param>
        /// <param name="value" type="Object">Annotation value.</param>
        /// <param name="obj" type="Object">Object that will hold properties produced by the annotation.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>

        var metadata = obj.__metadata = obj.__metadata || {};
        var mappedName = jsonLightNameMap[name];

        if (name === "mediaReadLink" || name === "mediaEditLink") {
            value = normalizeURI(value, baseURI);
        }

        if (target) {
            var propertiesMetadata = metadata.properties = metadata.properties || {};
            var propertyMetadata = propertiesMetadata[target] = propertiesMetadata[target] || {};
            propertyMetadata.type = propertyMetadata.type || targetType;

            obj.__metadata = metadata;
            obj[target] = obj[target] || { __mediaresource: {} };
            obj[target].__mediaresource[mappedName] = value;
            return;
        }

        metadata[mappedName] = value;
    };

    var jsonLightApplyNavigationUrlAnnotation = function (name, target, targetType, value, data, obj, baseURI) {
        /// <summary>
        ///    Converts a JSON light navigation property annotation and its value into their library's internal representation
        ///    and saves it back to data o metadata.
        /// </summary>
        /// <param name="name" type="String">Annotation name.</param>
        /// <param name="target" type="String">Name of the property on which the annotation should be applied.</param>
        /// <param name="targetType" type="String">Type name of the target property.</param>
        /// <param name="value" type="Object">Annotation value.</param>
        /// <param name="data" type="Object">JSON light object containing the annotation.</param>
        /// <param name="obj" type="Object">Object that will hold properties produced by the annotation.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>

        var metadata = obj.__metadata = obj.__metadata || {};
        var propertiesMetadata = metadata.properties = metadata.properties || {};
        var propertyMetadata = propertiesMetadata[target] = propertiesMetadata[target] || {};
        var uri = normalizeURI(value, baseURI);

        if (data.hasOwnProperty(target)) {
            // The navigation property is inlined in the payload,
            // so the navigation link url should be pushed to the object's
            // property metadata instead.
            propertyMetadata.navigationLinkUrl = uri;
            return;
        }
        obj[target] = { __deferred: { uri: uri} };
        propertyMetadata.type = propertyMetadata.type || targetType;
    };


    var jsonLightReadDataItemValue = function (value, typeName, dataItemMetadata, baseURI, dataItemModel, model, recognizeDates) {
        /// <summary>Converts the value of a data item in a JSON light object to its library representation.</summary>
        /// <param name="value">Data item value to convert.</param>
        /// <param name="typeName" type="String">Type name of the data item.</param>
        /// <param name="dataItemMetadata" type="Object">Object containing metadata about the data item.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>
        /// <param name="dataItemModel" type="Object" optional="true">Object describing the data item in an OData conceptual schema.</param>
        /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
        /// <param name="recognizeDates" type="Boolean" optional="true">Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.</param>
        /// <returns>Data item value in its library representation.</param>

        if (typeof value === "string") {
            return jsonLightReadStringPropertyValue(value, typeName, recognizeDates);
        }

        if (!jsonLightIsPrimitiveType(typeName)) {
            if (isArray(value)) {
                return jsonLightReadCollectionPropertyValue(value, typeName, dataItemMetadata, baseURI, model, recognizeDates);
            }

            if (isComplex(value)) {
                return jsonLightReadComplexPropertyValue(value, typeName, dataItemMetadata, baseURI, model, recognizeDates);
            }
        }
        return value;
    };

    var jsonLightReadStringPropertyValue = function (value, propertyType, recognizeDates) {
        /// <summary>Convertes the value of a string property in a JSON light object to its library representation.</summary>
        /// <param name="value" type="String">String value to convert.</param>
        /// <param name="propertyType" type="String">Type name of the property.</param>
        /// <param name="recognizeDates" type="Boolean" optional="true">Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.</param>
        /// <returns>String property value in its library representation.</returns>

        switch (propertyType) {
            case EDM_TIME:
                return parseDuration(value);
            case EDM_DATETIME:
                return parseDateTime(value, /*nullOnError*/false);
            case EDM_DATETIMEOFFSET:
                return parseDateTimeOffset(value, /*nullOnError*/false);
        }

        if (recognizeDates) {
            return parseDateTime(value, /*nullOnError*/true) ||
                   parseDateTimeOffset(value, /*nullOnError*/true) ||
                   value;
        }
        return value;
    };

    var jsonLightReadCollectionPropertyValue = function (value, propertyType, propertyMetadata, baseURI, model, recognizeDates) {
        /// <summary>Converts the value of a collection property in a JSON light object into its library representation.</summary>
        /// <param name="value" type="Array">Collection property value to convert.</param>
        /// <param name="propertyType" type="String">Property type name.</param>
        /// <param name="propertyMetadata" type="Object">Object containing metadata about the collection property.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>
        /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
        /// <param name="recognizeDates" type="Boolean" optional="true">Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.</param>
        /// <returns type="Object">Collection property value in its library representation.</returns>

        var collectionType = getCollectionType(propertyType);
        var itemsMetadata = [];
        var items = [];

        var i, len;
        for (i = 0, len = value.length; i < len; i++) {
            var itemType = jsonLightDataItemType(null, value[i]) || collectionType;
            var itemMetadata = { type: itemType };
            var item = jsonLightReadDataItemValue(value[i], itemType, itemMetadata, baseURI, null, model, recognizeDates);

            if (!jsonLightIsPrimitiveType(itemType) && !isPrimitive(value[i])) {
                itemsMetadata.push(itemMetadata);
            }
            items.push(item);
        }

        if (itemsMetadata.length > 0) {
            propertyMetadata.elements = itemsMetadata;
        }

        return { __metadata: { type: propertyType }, results: items };
    };

    var jsonLightReadComplexPropertyValue = function (value, propertyType, propertyMetadata, baseURI, model, recognizeDates) {
        /// <summary>Converts the value of a comples property in a JSON light object into its library representation.</summary>
        /// <param name="value" type="Object">Complex property value to convert.</param>
        /// <param name="propertyType" type="String">Property type name.</param>
        /// <param name="propertyMetadata" type="Object">Object containing metadata about the complx type property.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>
        /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
        /// <param name="recognizeDates" type="Boolean" optional="true">Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.</param>
        /// <returns type="Object">Complex property value in its library representation.</returns>

        var complexValue = jsonLightReadObject(value, { type: propertyType }, baseURI, model, recognizeDates);
        var complexMetadata = complexValue.__metadata;
        var complexPropertiesMetadata = complexMetadata.properties;

        if (complexPropertiesMetadata) {
            propertyMetadata.properties = complexPropertiesMetadata;
            delete complexMetadata.properties;
        }
        return complexValue;
    };

    var jsonLightReadNavigationPropertyValue = function (value, propertyInfo, baseURI, model, recognizeDates) {
        /// <summary>Converts the value of a navigation property in a JSON light object into its library representation.</summary>
        /// <param name="value">Navigation property property value to convert.</param>
        /// <param name="propertyInfo" type="String">Information about the property whether it's an entry, feed or complex type.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>
        /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
        /// <param name="recognizeDates" type="Boolean" optional="true">Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.</param>
        /// <returns type="Object">Collection property value in its library representation.</returns>

        if (isArray(value)) {
            return jsonLightReadFeed(value, propertyInfo, baseURI, model, recognizeDates);
        }

        if (isComplex(value)) {
            return jsonLightReadObject(value, propertyInfo, baseURI, model, recognizeDates);
        }
        return null;
    };

    var jsonLightReadObject = function (data, objectInfo, baseURI, model, recognizeDates) {
        /// <summary>Converts a JSON light entry or complex type object into its library representation.</summary>
        /// <param name="data" type="Object">JSON light entry or complex type object to convert.</param>
        /// <param name="objectInfo" type="Object">Information about the entry or complex.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>
        /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
        /// <param name="recognizeDates" type="Boolean" optional="true">Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.</param>
        /// <returns type="Object">Entry or complex type object.</param>

        objectInfo = objectInfo || {};
        var actualType = data[typeAnnotation] || objectInfo.type || null;
        var dataModel = lookupEntityType(actualType, model);
        var isEntry = true;
        if (!dataModel) {
            isEntry = false;
            dataModel = lookupComplexType(actualType, model);
        }

        var metadata = { type: actualType };
        var obj = { __metadata: metadata };
        var propertiesMetadata = {};
        var baseTypeModel;
        if (isEntry && dataModel && objectInfo.entitySet && objectInfo.contentTypeOdata == "minimalmetadata") {
            var serviceURI = baseURI.substring(0, baseURI.lastIndexOf("$metadata"));
            baseTypeModel = null; // check if the key model is in a parent type.
            if (!dataModel.key) {
                baseTypeModel = dataModel;
            }
            while (!!baseTypeModel && !baseTypeModel.key && baseTypeModel.baseType) {
                baseTypeModel = lookupEntityType(baseTypeModel.baseType, model);
            }

            if (dataModel.key || (!!baseTypeModel && baseTypeModel.key)) {
                var entryKey;
                if (dataModel.key) {
                    entryKey = jsonLightGetEntryKey(data, dataModel);
                } else {
                    entryKey = jsonLightGetEntryKey(data, baseTypeModel);
                }
                if (entryKey) {
                    var entryInfo = {
                        key: entryKey,
                        entitySet: objectInfo.entitySet,
                        functionImport: objectInfo.functionImport,
                        containerName: objectInfo.containerName
                    };
                    jsonLightComputeUrisIfMissing(data, entryInfo, actualType, serviceURI, dataModel, baseTypeModel);
                }
            }
        }

        for (var name in data) {
            if (name.indexOf("#") === 0) {
                // This is an advertised function or action.
                jsonLightReadAdvertisedFunctionOrAction(name.substring(1), data[name], obj, baseURI, model);
            } else {
                // Is name NOT an annotation?
                if (name.indexOf(".") === -1) {
                    if (!metadata.properties) {
                        metadata.properties = propertiesMetadata;
                    }

                    var propertyValue = data[name];
                    var propertyModel = propertyModel = jsonLightDataItemModel(name, dataModel);
                    baseTypeModel = dataModel;
                    while (!!dataModel && propertyModel === null && baseTypeModel.baseType) {
                        baseTypeModel = lookupEntityType(baseTypeModel.baseType, model);
                        propertyModel = propertyModel = jsonLightDataItemModel(name, baseTypeModel);
                    }
                    var isNavigationProperty = jsonLightIsNavigationProperty(name, data, propertyModel);
                    var propertyType = jsonLightDataItemType(name, propertyValue, data, propertyModel, model);
                    var propertyMetadata = propertiesMetadata[name] = propertiesMetadata[name] || { type: propertyType };
                    if (isNavigationProperty) {
                        var propertyInfo = {};
                        if (objectInfo.entitySet !== undefined) {
                            var navigationPropertyEntitySetName = lookupNavigationPropertyEntitySet(propertyModel, objectInfo.entitySet.name, model);
                            propertyInfo = getEntitySetInfo(navigationPropertyEntitySetName, model);
                        }
                        propertyInfo.contentTypeOdata = objectInfo.contentTypeOdata;
                        propertyInfo.kind = objectInfo.kind;
                        propertyInfo.type = propertyType;
                        obj[name] = jsonLightReadNavigationPropertyValue(propertyValue, propertyInfo, baseURI, model, recognizeDates);
                    } else {
                        obj[name] = jsonLightReadDataItemValue(propertyValue, propertyType, propertyMetadata, baseURI, propertyModel, model, recognizeDates);
                    }
                }
            }
        }

        return jsonLightReadDataAnnotations(data, obj, baseURI, dataModel, model);
    };

    var jsonLightReadAdvertisedFunctionOrAction = function (name, value, obj, baseURI, model) {
        /// <summary>Converts a JSON light advertised action or function object into its library representation.</summary>
        /// <param name="name" type="String">Advertised action or function name.</param>
        /// <param name="value">Advertised action or function value.</param>
        /// <param name="obj" type="Object">Object that will the converted value of the advertised action or function.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing the action's or function's relative URIs.</param>
        /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
        /// <remarks>
        ///     Actions and functions have the same representation in json light, so to disambiguate them the function uses
        ///     the model object.  If available, the function will look for the functionImport object that describes the
        ///     the action or the function.  If for whatever reason the functionImport can't be retrieved from the model (like
        ///     there is no model available or there is no functionImport within the model), then the value is going to be treated
        ///     as an advertised action and stored under obj.__metadata.actions.
        /// </remarks>

        if (!name || !isArray(value) && !isComplex(value)) {
            return;
        }

        var isFunction = false;
        var nsEnd = name.lastIndexOf(".");
        var simpleName = name.substring(nsEnd + 1);
        var containerName = (nsEnd > -1) ? name.substring(0, nsEnd) : "";

        var container = (simpleName === name || containerName.indexOf(".") === -1) ?
            lookupDefaultEntityContainer(model) :
            lookupEntityContainer(containerName, model);

        if (container) {
            var functionImport = lookupFunctionImport(container.functionImport, simpleName);
            if (functionImport && !!functionImport.isSideEffecting) {
                isFunction = !parseBool(functionImport.isSideEffecting);
            }
        }

        var metadata = obj.__metadata;
        var targetName = isFunction ? "functions" : "actions";
        var metadataURI = normalizeURI(name, baseURI);
        var items = (isArray(value)) ? value : [value];

        var i, len;
        for (i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            if (item) {
                var targetCollection = metadata[targetName] = metadata[targetName] || [];
                var actionOrFunction = { metadata: metadataURI, title: item.title, target: normalizeURI(item.target, baseURI) };
                targetCollection.push(actionOrFunction);
            }
        }
    };

    var jsonLightReadFeed = function (data, feedInfo, baseURI, model, recognizeDates) {
        /// <summary>Converts a JSON light feed or top level collection property object into its library representation.</summary>
        /// <param name="data" type="Object">JSON light feed object to convert.</param>
        /// <param name="typeName" type="String">Type name of the feed or collection items.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>
        /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
        /// <param name="recognizeDates" type="Boolean" optional="true">Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.</param>
        /// <returns type="Object">Feed or top level collection object.</param>

        var items = isArray(data) ? data : data.value;
        var entries = [];
        var i, len, entry;
        for (i = 0, len = items.length; i < len; i++) {
            entry = jsonLightReadObject(items[i], feedInfo, baseURI, model, recognizeDates);
            entries.push(entry);
        }

        var feed = { results: entries };

        if (isComplex(data)) {
            for (var name in data) {
                if (name.indexOf("#") === 0) {
                    // This is an advertised function or action.
                    feed.__metadata = feed.__metadata || {};
                    jsonLightReadAdvertisedFunctionOrAction(name.substring(1), data[name], feed, baseURI, model);
                }
            }
            feed = jsonLightReadDataAnnotations(data, feed, baseURI);
        }
        return feed;
    };

    var jsonLightGetEntryKey = function (data, entityModel) {
        /// <summary>Gets the key of an entry.</summary>
        /// <param name="data" type="Object">JSON light entry.</param>
        /// <param name="entityModel" type="String">Object describing the entry Model</param>
        /// <returns type="string">Entry instance key.</returns>

        var entityInstanceKey;
        var entityKeys = entityModel.key.propertyRef;
        var type;
        entityInstanceKey = "(";
        if (entityKeys.length == 1) {
            type = lookupProperty(entityModel.property, entityKeys[0].name).type;
            entityInstanceKey += formatLiteral(data[entityKeys[0].name], type);
        } else {
            var first = true;
            for (var i = 0; i < entityKeys.length; i++) {
                if (!first) {
                    entityInstanceKey += ",";
                } else {
                    first = false;
                }
                type = lookupProperty(entityModel.property, entityKeys[i].name).type;
                entityInstanceKey += entityKeys[i].name + "=" + formatLiteral(data[entityKeys[i].name], type);
            }
        }
        entityInstanceKey += ")";
        return entityInstanceKey;
    };


    var jsonLightComputeUrisIfMissing = function (data, entryInfo, actualType, serviceURI, entityModel, baseTypeModel) {
        /// <summary>Compute the URI according to OData conventions if it doesn't exist</summary>
        /// <param name="data" type="Object">JSON light entry.</param>
        /// <param name="entryInfo" type="Object">Information about the entry includes type, key, entitySet and entityContainerName.</param>
        /// <param name="actualType" type="String">Type of the entry</param>
        /// <param name="serviceURI" type="String">Base URI the service.</param>
        /// <param name="entityModel" type="Object">Object describing an OData conceptual schema of the entry.</param>
        /// <param name="baseTypeModel" type="Object" optional="true">Object escribing an OData conceptual schema of the baseType if it exists.</param>

        var lastIdSegment = data[jsonLightAnnotations.id] || data[jsonLightAnnotations.read] || data[jsonLightAnnotations.edit] || entryInfo.entitySet.name + entryInfo.key;
        data[jsonLightAnnotations.id] = serviceURI + lastIdSegment;
        if (!data[jsonLightAnnotations.edit]) {
            data[jsonLightAnnotations.edit] = entryInfo.entitySet.name + entryInfo.key;
            if (entryInfo.entitySet.entityType != actualType) {
                data[jsonLightAnnotations.edit] += "/" + actualType;
            }
        }
        data[jsonLightAnnotations.read] = data[jsonLightAnnotations.read] || data[jsonLightAnnotations.edit];
        if (!data[jsonLightAnnotations.etag]) {
            var etag = jsonLightComputeETag(data, entityModel, baseTypeModel);
            if (!!etag) {
                data[jsonLightAnnotations.etag] = etag;
            }
        }

        jsonLightComputeStreamLinks(data, entityModel, baseTypeModel);
        jsonLightComputeNavigationAndAssociationProperties(data, entityModel, baseTypeModel);
        jsonLightComputeFunctionImports(data, entryInfo);
    };

    var jsonLightComputeETag = function (data, entityModel, baseTypeModel) {
        /// <summary>Computes the etag of an entry</summary>
        /// <param name="data" type="Object">JSON light entry.</param>
        /// <param name="entryInfo" type="Object">Object describing the entry model.</param>
        /// <param name="baseTypeModel" type="Object"  optional="true">Object describing an OData conceptual schema of the baseType if it exists.</param>
        /// <returns type="string">Etag value</returns>
        var etag = "";
        var propertyModel;
        for (var i = 0; entityModel.property && i < entityModel.property.length; i++) {
            propertyModel = entityModel.property[i];
            etag = jsonLightAppendValueToEtag(data, etag, propertyModel);

        }
        if (baseTypeModel) {
            for (i = 0; baseTypeModel.property && i < baseTypeModel.property.length; i++) {
                propertyModel = baseTypeModel.property[i];
                etag = jsonLightAppendValueToEtag(data, etag, propertyModel);
            }
        }
        if (etag.length > 0) {
            return etag + "\"";
        }
        return null;
    };

    var jsonLightAppendValueToEtag = function (data, etag, propertyModel) {
        /// <summary>Adds a propery value to the etag after formatting.</summary>
        /// <param name="data" type="Object">JSON light entry.</param>
        /// <param name="etag" type="Object">value of the etag.</param>
        /// <param name="propertyModel" type="Object">Object describing an OData conceptual schema of the property.</param>
        /// <returns type="string">Etag value</returns>

        if (propertyModel.concurrencyMode == "Fixed") {
            if (etag.length > 0) {
                etag += ",";
            } else {
                etag += "W/\"";
            }
            if (data[propertyModel.name] !== null) {
                etag += formatLiteral(data[propertyModel.name], propertyModel.type);
            } else {
                etag += "null";
            }
        }
        return etag;
    };

    var jsonLightComputeNavigationAndAssociationProperties = function (data, entityModel, baseTypeModel) {
        /// <summary>Adds navigation links to the entry metadata</summary>
        /// <param name="data" type="Object">JSON light entry.</param>
        /// <param name="entityModel" type="Object">Object describing the entry model.</param>
        /// <param name="baseTypeModel" type="Object"  optional="true">Object describing an OData conceptual schema of the baseType if it exists.</param>

        var navigationLinkAnnotation = "@odata.navigationLinkUrl";
        var associationLinkAnnotation = "@odata.associationLinkUrl";
        var navigationPropertyName, navigationPropertyAnnotation, associationPropertyAnnotation;
        for (var i = 0; entityModel.navigationProperty && i < entityModel.navigationProperty.length; i++) {
            navigationPropertyName = entityModel.navigationProperty[i].name;
            navigationPropertyAnnotation = navigationPropertyName + navigationLinkAnnotation;
            if (data[navigationPropertyAnnotation] === undefined) {
                data[navigationPropertyAnnotation] = data[jsonLightAnnotations.edit] + "/" + encodeURIComponent(navigationPropertyName);
            }
            associationPropertyAnnotation = navigationPropertyName + associationLinkAnnotation;
            if (data[associationPropertyAnnotation] === undefined) {
                data[associationPropertyAnnotation] = data[jsonLightAnnotations.edit] + "/$links/" + encodeURIComponent(navigationPropertyName);
            }
        }

        if (baseTypeModel && baseTypeModel.navigationProperty) {
            for (i = 0; i < baseTypeModel.navigationProperty.length; i++) {
                navigationPropertyName = baseTypeModel.navigationProperty[i].name;
                navigationPropertyAnnotation = navigationPropertyName + navigationLinkAnnotation;
                if (data[navigationPropertyAnnotation] === undefined) {
                    data[navigationPropertyAnnotation] = data[jsonLightAnnotations.edit] + "/" + encodeURIComponent(navigationPropertyName);
                }
                associationPropertyAnnotation = navigationPropertyName + associationLinkAnnotation;
                if (data[associationPropertyAnnotation] === undefined) {
                    data[associationPropertyAnnotation] = data[jsonLightAnnotations.edit] + "/$links/" + encodeURIComponent(navigationPropertyName);
                }
            }
        }
    };

    var formatLiteral = function (value, type) {
        /// <summary>Formats a value according to Uri literal format</summary>
        /// <param name="value">Value to be formatted.</param>
        /// <param name="type">Edm type of the value</param>
        /// <returns type="string">Value after formatting</returns>

        value = "" + formatRowLiteral(value, type);
        value = encodeURIComponent(value.replace("'", "''"));
        switch ((type)) {
            case "Edm.Binary":
                return "X'" + value + "'";
            case "Edm.DateTime":
                return "datetime" + "'" + value + "'";
            case "Edm.DateTimeOffset":
                return "datetimeoffset" + "'" + value + "'";
            case "Edm.Decimal":
                return value + "M";
            case "Edm.Guid":
                return "guid" + "'" + value + "'";
            case "Edm.Int64":
                return value + "L";
            case "Edm.Float":
                return value + "f";
            case "Edm.Double":
                return value + "D";
            case "Edm.Geography":
                return "geography" + "'" + value + "'";
            case "Edm.Geometry":
                return "geometry" + "'" + value + "'";
            case "Edm.Time":
                return "time" + "'" + value + "'";
            case "Edm.String":
                return "'" + value + "'";
            default:
                return value;
        }
    };


    var formatRowLiteral = function (value, type) {
        switch (type) {
            case "Edm.Binary":
                return convertByteArrayToHexString(value);
            default:
                return value;
        }
    };

    var jsonLightComputeFunctionImports = function (data, entryInfo) {
        /// <summary>Adds functions and actions links to the entry metadata</summary>
        /// <param name="entry" type="Object">JSON light entry.</param>
        /// <param name="entityInfo" type="Object">Object describing the entry</param>

        var functionImport = entryInfo.functionImport || [];
        for (var i = 0; i < functionImport.length; i++) {
            if (functionImport[i].isBindable && functionImport[i].parameter[0] && functionImport[i].parameter[0].type == entryInfo.entitySet.entityType) {
                var functionImportAnnotation = "#" + entryInfo.containerName + "." + functionImport[i].name;
                if (data[functionImportAnnotation] == undefined) {
                    data[functionImportAnnotation] = {
                        title: functionImport[i].name,
                        target: data[jsonLightAnnotations.edit] + "/" + functionImport[i].name
                    };
                }
            }
        }
    };

    var jsonLightComputeStreamLinks = function (data, entityModel, baseTypeModel) {
        /// <summary>Adds stream links to the entry metadata</summary>
        /// <param name="data" type="Object">JSON light entry.</param>
        /// <param name="entityModel" type="Object">Object describing the entry model.</param>
        /// <param name="baseTypeModel" type="Object"  optional="true">Object describing an OData conceptual schema of the baseType if it exists.</param>

        if (entityModel.hasStream || (baseTypeModel && baseTypeModel.hasStream)) {
            data[jsonLightAnnotations.mediaEdit] = data[jsonLightAnnotations.mediaEdit] || data[jsonLightAnnotations.mediaEdit] + "/$value";
            data[jsonLightAnnotations.mediaRead] = data[jsonLightAnnotations.mediaRead] || data[jsonLightAnnotations.mediaEdit];
        }
    };

    var jsonLightReadTopPrimitiveProperty = function (data, typeName, baseURI, recognizeDates) {
        /// <summary>Converts a JSON light top level primitive property object into its library representation.</summary>
        /// <param name="data" type="Object">JSON light feed object to convert.</param>
        /// <param name="typeName" type="String">Type name of the primitive property.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>
        /// <param name="recognizeDates" type="Boolean" optional="true">Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.</param>
        /// <returns type="Object">Top level primitive property object.</param>

        var metadata = { type: typeName };
        var value = jsonLightReadDataItemValue(data.value, typeName, metadata, baseURI, null, null, recognizeDates);
        return jsonLightReadDataAnnotations(data, { __metadata: metadata, value: value }, baseURI);
    };

    var jsonLightReadTopCollectionProperty = function (data, typeName, baseURI, model, recognizeDates) {
        /// <summary>Converts a JSON light top level collection property object into its library representation.</summary>
        /// <param name="data" type="Object">JSON light feed object to convert.</param>
        /// <param name="typeName" type="String">Type name of the collection property.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>
        /// <param name="model" type="Object" optional="true">Object describing an OData conceptual schema.</param>
        /// <param name="recognizeDates" type="Boolean" optional="true">Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.</param>
        /// <returns type="Object">Top level collection property object.</param>

        var propertyMetadata = {};
        var value = jsonLightReadCollectionPropertyValue(data.value, typeName, propertyMetadata, baseURI, model, recognizeDates);
        extend(value.__metadata, propertyMetadata);
        return jsonLightReadDataAnnotations(data, value, baseURI);
    };

    var jsonLightReadLinksDocument = function (data, baseURI) {
        /// <summary>Converts a JSON light links collection object to its library representation.</summary>
        /// <param name="data" type="Object">JSON light link object to convert.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>
        /// <returns type="Object">Links collection object.</param>

        var items = data.value;
        if (!isArray(items)) {
            return jsonLightReadLink(data, baseURI);
        }

        var results = [];
        var i, len;
        for (i = 0, len = items.length; i < len; i++) {
            results.push(jsonLightReadLink(items[i], baseURI));
        }

        var links = { results: results };
        return jsonLightReadDataAnnotations(data, links, baseURI);
    };

    var jsonLightReadLink = function (data, baseURI) {
        /// <summary>Converts a JSON light link object to its library representation.</summary>
        /// <param name="data" type="Object">JSON light link object to convert.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>
        /// <returns type="Object">Link object.</param>

        var link = { uri: normalizeURI(data.url, baseURI) };

        link = jsonLightReadDataAnnotations(data, link, baseURI);
        var metadata = link.__metadata || {};
        var metadataProperties = metadata.properties || {};

        jsonLightRemoveTypePropertyMetadata(metadataProperties.url);
        renameProperty(metadataProperties, "url", "uri");

        return link;
    };

    var jsonLightRemoveTypePropertyMetadata = function (propertyMetadata) {
        /// <summary>Removes the type property from a property metadata object.</summary>
        /// <param name="propertyMetadata" type="Object">Property metadata object.</param>

        if (propertyMetadata) {
            delete propertyMetadata.type;
        }
    };

    var jsonLightReadSvcDocument = function (data, baseURI) {
        /// <summary>Converts a JSON light service document object to its library representation.</summary>
        /// <param name="data" type="Object">JSON light service document object to convert.</param>
        /// <param name="baseURI" type="String">Base URI for normalizing relative URIs found in the payload.</param>
        /// <returns type="Object">Link object.</param>

        var items = data.value;
        var collections = [];
        var workspace = jsonLightReadDataAnnotations(data, { collections: collections }, baseURI);

        var metadata = workspace.__metadata || {};
        var metadataProperties = metadata.properties || {};

        jsonLightRemoveTypePropertyMetadata(metadataProperties.value);
        renameProperty(metadataProperties, "value", "collections");

        var i, len;
        for (i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            var collection = { title: item.name, href: normalizeURI(item.url, baseURI) };

            collection = jsonLightReadDataAnnotations(item, collection, baseURI);
            metadata = collection.__metadata || {};
            metadataProperties = metadata.properties || {};

            jsonLightRemoveTypePropertyMetadata(metadataProperties.name);
            jsonLightRemoveTypePropertyMetadata(metadataProperties.url);

            renameProperty(metadataProperties, "name", "title");
            renameProperty(metadataProperties, "url", "href");

            collections.push(collection);
        }

        return { workspaces: [workspace] };
    };

    var jsonLightMakePayloadInfo = function (kind, type) {
        /// <summary>Creates an object containing information for the json light payload.</summary>
        /// <param name="kind" type="String">JSON light payload kind, one of the PAYLOADTYPE_XXX constant values.</param>
        /// <param name="typeName" type="String">Type name of the JSON light payload.</param>
        /// <returns type="Object">Object with kind and type fields.</returns>

        /// <field name="kind" type="String">Kind of the JSON light payload. One of the PAYLOADTYPE_XXX constant values.</field>
        /// <field name="type" type="String">Data type of the JSON light payload.</field>

        return { kind: kind, type: type || null };
    };

    var jsonLightPayloadInfo = function (data, model, inferFeedAsComplexType) {
        /// <summary>Infers the information describing the JSON light payload from its metadata annotation, structure, and data model.</summary>
        /// <param name="data" type="Object">Json light response payload object.</param>
        /// <param name="model" type="Object">Object describing an OData conceptual schema.</param>
        /// <param name="inferFeedAsComplexType" type="Boolean">True if a JSON light payload that looks like a feed should be treated as a complex type property instead.</param>
        /// <remarks>
        ///     If the arguments passed to the function don't convey enough information about the payload to determine without doubt that the payload is a feed then it
        ///     will try to use the payload object structure instead.  If the payload looks like a feed (has value property that is an array or non-primitive values) then
        ///     the function will report its kind as PAYLOADTYPE_FEED unless the inferFeedAsComplexType flag is set to true. This flag comes from the user request
        ///     and allows the user to control how the library behaves with an ambigous JSON light payload.
        /// </remarks>
        /// <returns type="Object">
        ///     Object with kind and type fields. Null if there is no metadata annotation or the payload info cannot be obtained..
        /// </returns>

        var metadataUri = data[metadataAnnotation];
        if (!metadataUri || typeof metadataUri !== "string") {
            return null;
        }

        var fragmentStart = metadataUri.lastIndexOf("#");
        if (fragmentStart === -1) {
            return jsonLightMakePayloadInfo(PAYLOADTYPE_SVCDOC);
        }

        var elementStart = metadataUri.indexOf("@Element", fragmentStart);
        var fragmentEnd = elementStart - 1;

        if (fragmentEnd < 0) {
            fragmentEnd = metadataUri.indexOf("?", fragmentStart);
            if (fragmentEnd === -1) {
                fragmentEnd = metadataUri.length;
            }
        }

        var fragment = metadataUri.substring(fragmentStart + 1, fragmentEnd);
        if (fragment.indexOf("/$links/") > 0) {
            return jsonLightMakePayloadInfo(PAYLOADTYPE_LINKS);
        }

        var fragmentParts = fragment.split("/");
        if (fragmentParts.length >= 0) {
            var qualifiedName = fragmentParts[0];
            var typeCast = fragmentParts[1];

            if (jsonLightIsPrimitiveType(qualifiedName)) {
                return jsonLightMakePayloadInfo(PAYLOADTYPE_PRIMITIVE, qualifiedName);
            }

            if (isCollectionType(qualifiedName)) {
                return jsonLightMakePayloadInfo(PAYLOADTYPE_COLLECTION, qualifiedName);
            }

            var entityType = typeCast;
            var entitySet, functionImport, containerName;
            if (!typeCast) {
                var nsEnd = qualifiedName.lastIndexOf(".");
                var simpleName = qualifiedName.substring(nsEnd + 1);
                var container = (simpleName === qualifiedName) ?
                    lookupDefaultEntityContainer(model) :
                    lookupEntityContainer(qualifiedName.substring(0, nsEnd), model);

                if (container) {
                    entitySet = lookupEntitySet(container.entitySet, simpleName);
                    functionImport = container.functionImport;
                    containerName = container.name;
                    entityType = !!entitySet ? entitySet.entityType : null;
                }
            }

            var info;
            if (elementStart > 0) {
                info = jsonLightMakePayloadInfo(PAYLOADTYPE_OBJECT, entityType);
                info.entitySet = entitySet;
                info.functionImport = functionImport;
                info.containerName = containerName;
                return info;
            }

            if (entityType) {
                info = jsonLightMakePayloadInfo(PAYLOADTYPE_FEED, entityType);
                info.entitySet = entitySet;
                info.functionImport = functionImport;
                info.containerName = containerName;
                return info;
            }

            if (isArray(data.value) && !lookupComplexType(qualifiedName, model)) {
                var item = data.value[0];
                if (!isPrimitive(item)) {
                    if (jsonLightIsEntry(item) || !inferFeedAsComplexType) {
                        return jsonLightMakePayloadInfo(PAYLOADTYPE_FEED, null);
                    }
                }
            }

            return jsonLightMakePayloadInfo(PAYLOADTYPE_OBJECT, qualifiedName);
        }

        return null;
    };

    var jsonLightReadPayload = function (data, model, recognizeDates, inferFeedAsComplexType, contentTypeOdata) {
        /// <summary>Converts a JSON light response payload object into its library's internal representation.</summary>
        /// <param name="data" type="Object">Json light response payload object.</param>
        /// <param name="model" type="Object">Object describing an OData conceptual schema.</param>
        /// <param name="recognizeDates" type="Boolean" optional="true">Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.</param>
        /// <param name="inferFeedAsComplexType" type="Boolean">True if a JSON light payload that looks like a feed should be reported as a complex type property instead.</param>
        /// <param name="contentTypeOdata" type="string">Includes the type of json ( minimalmetadata, fullmetadata .. etc )</param>
        /// <returns type="Object">Object in the library's representation.</returns>

        if (!isComplex(data)) {
            return data;
        }

        contentTypeOdata = contentTypeOdata || "minimalmetadata";
        var baseURI = data[metadataAnnotation];
        var payloadInfo = jsonLightPayloadInfo(data, model, inferFeedAsComplexType);
        if (assigned(payloadInfo)) {
            payloadInfo.contentTypeOdata = contentTypeOdata;
        }
        var typeName = null;
        if (payloadInfo) {
            delete data[metadataAnnotation];

            typeName = payloadInfo.type;
            switch (payloadInfo.kind) {
                case PAYLOADTYPE_FEED:
                    return jsonLightReadFeed(data, payloadInfo, baseURI, model, recognizeDates);
                case PAYLOADTYPE_COLLECTION:
                    return jsonLightReadTopCollectionProperty(data, typeName, baseURI, model, recognizeDates);
                case PAYLOADTYPE_PRIMITIVE:
                    return jsonLightReadTopPrimitiveProperty(data, typeName, baseURI, recognizeDates);
                case PAYLOADTYPE_SVCDOC:
                    return jsonLightReadSvcDocument(data, baseURI);
                case PAYLOADTYPE_LINKS:
                    return jsonLightReadLinksDocument(data, baseURI);
            }
        }
        return jsonLightReadObject(data, payloadInfo, baseURI, model, recognizeDates);
    };

    var jsonLightSerializableMetadata = ["type", "etag", "media_src", "edit_media", "content_type", "media_etag"];

    var formatJsonLight = function (obj, context) {
        /// <summary>Converts an object in the library's internal representation to its json light representation.</summary>
        /// <param name="obj" type="Object">Object the library's internal representation.</param>
        /// <param name="context" type="Object">Object with the serialization context.</param>
        /// <returns type="Object">Object in its json light representation.</returns>

        // Regular expression used to test that the uri is for a $links document.
        var linksUriRE = /\/\$links\//;
        var data = {};
        var metadata = obj.__metadata;

        var islinks = context && linksUriRE.test(context.request.requestUri);
        formatJsonLightData(obj, (metadata && metadata.properties), data, islinks);
        return data;
    };

    var formatJsonLightMetadata = function (metadata, data) {
        /// <summary>Formats an object's metadata into the appropriate json light annotations and saves them to data.</summary>
        /// <param name="obj" type="Object">Object whose metadata is going to be formatted as annotations.</param>
        /// <param name="data" type="Object">Object on which the annotations are going to be stored.</param>

        if (metadata) {
            var i, len;
            for (i = 0, len = jsonLightSerializableMetadata.length; i < len; i++) {
                // There is only a subset of metadata values that are interesting during update requests.
                var name = jsonLightSerializableMetadata[i];
                var qName = odataAnnotationPrefix + (jsonLightNameMap[name] || name);
                formatJsonLightAnnotation(qName, null, metadata[name], data);
            }
        }
    };

    var formatJsonLightData = function (obj, pMetadata, data, isLinks) {
        /// <summary>Formats an object's data into the appropriate json light values and saves them to data.</summary>
        /// <param name="obj" type="Object">Object whose data is going to be formatted.</param>
        /// <param name="pMetadata" type="Object">Object that contains metadata for the properties that are being formatted.</param>
        /// <param name="data" type="Object">Object on which the formatted values are going to be stored.</param>
        /// <param name="isLinks" type="Boolean">True if a links document is being formatted.  False otherwise.</param>

        for (var key in obj) {
            var value = obj[key];
            if (key === "__metadata") {
                // key is the object metadata.
                formatJsonLightMetadata(value, data);
            } else if (key.indexOf(".") === -1) {
                // key is an regular property or array element.
                if (isLinks && key === "uri") {
                    formatJsonLightEntityLink(value, data);
                } else {
                    formatJsonLightProperty(key, value, pMetadata, data, isLinks);
                }
            } else {
                data[key] = value;
            }
        }
    };

    var formatJsonLightProperty = function (name, value, pMetadata, data) {
        /// <summary>Formats an object's value identified by name to its json light representation and saves it to data.</summary>
        /// <param name="name" type="String">Property name.</param>
        /// <param name="value">Property value.</param>
        /// <param name="pMetadata" type="Object">Object that contains metadata for the property that is being formatted.</param>
        /// <param name="data" type="Object">Object on which the formatted value is going to be stored.</param>

        // Get property type from property metadata
        var propertyMetadata = pMetadata && pMetadata[name] || { properties: undefined, type: undefined };
        var typeName = dataItemTypeName(value, propertyMetadata);

        if (isPrimitive(value) || !value) {
            // It is a primitive value then.
            formatJsonLightAnnotation(typeAnnotation, name, typeName, data);
            data[name] = value;
            return;
        }

        if (isFeed(value, typeName) || isEntry(value)) {
            formatJsonLightInlineProperty(name, value, data);
            return;
        }

        if (!typeName && isDeferred(value)) {
            // It is really a deferred property.
            formatJsonLightDeferredProperty(name, value, data);
            return;
        }

        if (isCollection(value, typeName)) {
            // The thing is a collection, format it as one.
            if (getCollectionType(typeName)) {
                formatJsonLightAnnotation(typeAnnotation, name, typeName, data);
            }
            formatJsonLightCollectionProperty(name, value, data);
            return;
        }


        // Format the complex property value in a new object in data[name].
        data[name] = {};
        formatJsonLightAnnotation(typeAnnotation, null, typeName, data[name]);
        formatJsonLightData(value, propertyMetadata.properties, data[name]);
    };

    var formatJsonLightEntityLink = function (value, data) {
        /// <summary>Formats an entity link in a $links document and saves it into data.</summary>
        /// <param name="value" type="String">Entity link value.</summary>
        /// <param name="data" type="Object">Object on which the formatted value is going to be stored.</param>
        data.url = value;
    };

    var formatJsonLightDeferredProperty = function (name, value, data) {
        /// <summary>Formats the object value's identified by name as an odata.navigalinkurl annotation and saves it to data.</summary>
        /// <param name="name" type="String">Name of the deferred property to be formatted.</param>
        /// <param name="value" type="Object">Deferred property value to be formatted.</param>
        /// <param name="data" type="Object">Object on which the formatted value is going to be stored.</param>

        formatJsonLightAnnotation(navUrlAnnotation, name, value.__deferred.uri, data);
    };

    var formatJsonLightCollectionProperty = function (name, value, data) {
        /// <summary>Formats a collection property in obj identified by name as a json light collection property and saves it to data.</summary>
        /// <param name="name" type="String">Name of the collection property to be formatted.</param>
        /// <param name="value" type="Object">Collection property value to be formatted.</param>
        /// <param name="data" type="Object">Object on which the formatted value is going to be stored.</param>

        data[name] = [];
        var items = isArray(value) ? value : value.results;
        formatJsonLightData(items, null, data[name]);
    };

    var formatJsonLightInlineProperty = function (name, value, data) {
        /// <summary>Formats an inline feed or entry property in obj identified by name as a json light value and saves it to data.</summary>
        /// <param name="name" type="String">Name of the inline feed or entry property to be formatted.</param>
        /// <param name="value" type="Object or Array">Value of the inline feed or entry property.</param>
        /// <param name="data" type="Object">Object on which the formatted value is going to be stored.</param>

        if (isFeed(value)) {
            data[name] = [];
            // Format each of the inline feed entries
            var entries = isArray(value) ? value : value.results;
            var i, len;
            for (i = 0, len = entries.length; i < len; i++) {
                formatJsonLightInlineEntry(name, entries[i], true, data);
            }
            return;
        }
        formatJsonLightInlineEntry(name, value, false, data);
    };

    var formatJsonLightInlineEntry = function (name, value, inFeed, data) {
        /// <summary>Formats an inline entry value in the property identified by name as a json light value and saves it to data.</summary>
        /// <param name="name" type="String">Name of the inline feed or entry property that owns the entry formatted.</param>
        /// <param name="value" type="Object">Inline entry value to be formatted.</param>
        /// <param name="inFeed" type="Boolean">True if the entry is in an inline feed; false otherwise.
        /// <param name="data" type="Object">Object on which the formatted value is going to be stored.</param>

        // This might be a bind instead of a deep insert.
        var uri = value.__metadata && value.__metadata.uri;
        if (uri) {
            formatJsonLightBinding(name, uri, inFeed, data);
            return;
        }

        var entry = formatJsonLight(value);
        if (inFeed) {
            data[name].push(entry);
            return;
        }
        data[name] = entry;
    };

    var formatJsonLightBinding = function (name, uri, inFeed, data) {
        /// <summary>Formats an entry binding in the inline property in obj identified by name as an odata.bind annotation and saves it to data.</summary>
        /// <param name="name" type="String">Name of the inline property that has the binding to be formated.</param>
        /// <param name="uri" type="String">Uri to the bound entry.</param>
        /// <param name="inFeed" type="Boolean">True if the binding is in an inline feed; false otherwise.
        /// <param name="data" type="Object">Object on which the formatted value is going to be stored.</param>

        var bindingName = name + bindAnnotation;
        if (inFeed) {
            // The binding is inside an inline feed, so merge it with whatever other bindings already exist in data.
            data[bindingName] = data[bindingName] || [];
            data[bindingName].push(uri);
            return;
        }
        // The binding is on an inline entry; it can be safely overwritten.
        data[bindingName] = uri;
    };

    var formatJsonLightAnnotation = function (qName, target, value, data) {
        /// <summary>Formats a value as a json light annotation and stores it in data</summary>
        /// <param name="qName" type="String">Qualified name of the annotation.</param>
        /// <param name="target" type="String">Name of the property that the metadata value targets.</param>
        /// <param name="value">Annotation value.</param>
        /// <param name="data" type="Object">Object on which the annotation is going to be stored.</param>

        if (value !== undefined) {
            if(target) {
                data[target + "@" + qName] = value;
            }
            else {
                data[qName] = value;
            }
        }
    };



    var jsonMediaType = "application/json";
    var jsonContentType = contentType(jsonMediaType);

    var jsonReadAdvertisedActionsOrFunctions = function (value) {
        /// <summary>Reads and object containing action or function metadata and maps them into a single array of objects.</summary>
        /// <param name="value" type="Object">Object containing action or function metadata.</param>
        /// <returns type="Array">Array of objects containing metadata for the actions or functions specified in value.</returns>

        var result = [];
        for (var name in value) {
            var i, len;
            for (i = 0, len = value[name].length; i < len; i++) {
                result.push(extend({ metadata: name }, value[name][i]));
            }
        }
        return result;
    };

    var jsonApplyMetadata = function (value, metadata, dateParser, recognizeDates) {
        /// <summary>Applies metadata coming from both the payload and the metadata object to the value.</summary>
        /// <param name="value" type="Object">Data on which the metada is going to be applied.</param>
        /// <param name="metadata">Metadata store; one of edmx, schema, or an array of any of them.</param>
        /// <param name="dateParser" type="function">Function used for parsing datetime values.</param>
        /// <param name="recognizeDates" type="Boolean">
        ///     True if strings formatted as datetime values should be treated as datetime values. False otherwise.
        /// </param>
        /// <returns type="Object">Transformed data.</returns>

        if (value && typeof value === "object") {
            var dataTypeName;
            var valueMetadata = value.__metadata;

            if (valueMetadata) {
                if (valueMetadata.actions) {
                    valueMetadata.actions = jsonReadAdvertisedActionsOrFunctions(valueMetadata.actions);
                }
                if (valueMetadata.functions) {
                    valueMetadata.functions = jsonReadAdvertisedActionsOrFunctions(valueMetadata.functions);
                }
                dataTypeName = valueMetadata && valueMetadata.type;
            }

            var dataType = lookupEntityType(dataTypeName, metadata) || lookupComplexType(dataTypeName, metadata);
            var propertyValue;
            if (dataType) {
                var properties = dataType.property;
                if (properties) {
                    var i, len;
                    for (i = 0, len = properties.length; i < len; i++) {
                        var property = properties[i];
                        var propertyName = property.name;
                        propertyValue = value[propertyName];

                        if (property.type === "Edm.DateTime" || property.type === "Edm.DateTimeOffset") {
                            if (propertyValue) {
                                propertyValue = dateParser(propertyValue);
                                if (!propertyValue) {
                                    throw { message: "Invalid date/time value" };
                                }
                                value[propertyName] = propertyValue;
                            }
                        } else if (property.type === "Edm.Time") {
                            value[propertyName] = parseDuration(propertyValue);
                        }
                    }
                }
            } else if (recognizeDates) {
                for (var name in value) {
                    propertyValue = value[name];
                    if (typeof propertyValue === "string") {
                        value[name] = dateParser(propertyValue) || propertyValue;
                    }
                }
            }
        }
        return value;
    };

    var isJsonLight = function (contentType) {
        /// <summary>Tests where the content type indicates a json light payload.</summary>
        /// <param name="contentType">Object with media type and properties dictionary.</param>
        /// <returns type="Boolean">True is the content type indicates a json light payload. False otherwise.</returns>

        if (contentType) {
            var odata = contentType.properties.odata;
            return odata === "nometadata" || odata === "minimalmetadata" || odata === "fullmetadata";
        }
        return false;
    };

    var normalizeServiceDocument = function (data, baseURI) {
        /// <summary>Normalizes a JSON service document to look like an ATOM service document.</summary>
        /// <param name="data" type="Object">Object representation of service documents as deserialized.</param>
        /// <param name="baseURI" type="String">Base URI to resolve relative URIs.</param>
        /// <returns type="Object">An object representation of the service document.</returns>
        var workspace = { collections: [] };

        var i, len;
        for (i = 0, len = data.EntitySets.length; i < len; i++) {
            var title = data.EntitySets[i];
            var collection = {
                title: title,
                href: normalizeURI(title, baseURI)
            };

            workspace.collections.push(collection);
        }

        return { workspaces: [workspace] };
    };

    // The regular expression corresponds to something like this:
    // /Date(123+60)/
    //
    // This first number is date ticks, the + may be a - and is optional,
    // with the second number indicating a timezone offset in minutes.
    //
    // On the wire, the leading and trailing forward slashes are
    // escaped without being required to so the chance of collisions is reduced;
    // however, by the time we see the objects, the characters already
    // look like regular forward slashes.
    var jsonDateRE = /^\/Date\((-?\d+)(\+|-)?(\d+)?\)\/$/;

    var minutesToOffset = function (minutes) {
        /// <summary>Formats the given minutes into (+/-)hh:mm format.</summary>
        /// <param name="minutes" type="Number">Number of minutes to format.</param>
        /// <returns type="String">The minutes in (+/-)hh:mm format.</returns>

        var sign;
        if (minutes < 0) {
            sign = "-";
            minutes = -minutes;
        } else {
            sign = "+";
        }

        var hours = Math.floor(minutes / 60);
        minutes = minutes - (60 * hours);

        return sign + formatNumberWidth(hours, 2) + ":" + formatNumberWidth(minutes, 2);
    };

    var parseJsonDateString = function (value) {
        /// <summary>Parses the JSON Date representation into a Date object.</summary>
        /// <param name="value" type="String">String value.</param>
        /// <returns type="Date">A Date object if the value matches one; falsy otherwise.</returns>

        var arr = value && jsonDateRE.exec(value);
        if (arr) {
            // 0 - complete results; 1 - ticks; 2 - sign; 3 - minutes
            var result = new Date(parseInt10(arr[1]));
            if (arr[2]) {
                var mins = parseInt10(arr[3]);
                if (arr[2] === "-") {
                    mins = -mins;
                }

                // The offset is reversed to get back the UTC date, which is
                // what the API will eventually have.
                var current = result.getUTCMinutes();
                result.setUTCMinutes(current - mins);
                result.__edmType = "Edm.DateTimeOffset";
                result.__offset = minutesToOffset(mins);
            }
            if (!isNaN(result.valueOf())) {
                return result;
            }
        }

        // Allow undefined to be returned.
    };

    // Some JSON implementations cannot produce the character sequence \/
    // which is needed to format DateTime and DateTimeOffset into the
    // JSON string representation defined by the OData protocol.
    // See the history of this file for a candidate implementation of
    // a 'formatJsonDateString' function.

    var jsonParser = function (handler, text, context) {
        /// <summary>Parses a JSON OData payload.</summary>
        /// <param name="handler">This handler.</param>
        /// <param name="text">Payload text (this parser also handles pre-parsed objects).</param>
        /// <param name="context" type="Object">Object with parsing context.</param>
        /// <returns>An object representation of the OData payload.</returns>

        var recognizeDates = defined(context.recognizeDates, handler.recognizeDates);
        var inferJsonLightFeedAsObject = defined(context.inferJsonLightFeedAsObject, handler.inferJsonLightFeedAsObject);
        var model = context.metadata;
        var dataServiceVersion = context.dataServiceVersion;
        var dateParser = parseJsonDateString;
        var json = (typeof text === "string") ? window.JSON.parse(text) : text;

        if ((maxVersion("3.0", dataServiceVersion) === dataServiceVersion)) {
            if (isJsonLight(context.contentType)) {
                return jsonLightReadPayload(json, model, recognizeDates, inferJsonLightFeedAsObject, context.contentType.properties.odata);
            }
            dateParser = parseDateTime;
        }

        json = traverse(json.d, function (key, value) {
            return jsonApplyMetadata(value, model, dateParser, recognizeDates);
        });

        json = jsonUpdateDataFromVersion(json, context.dataServiceVersion);
        return jsonNormalizeData(json, context.response.requestUri);
    };

    var jsonToString = function (data) {
        /// <summary>Converts the data into a JSON string.</summary>
        /// <param name="data">Data to serialize.</param>
        /// <returns type="String">The JSON string representation of data.</returns>

        var result; // = undefined;
        // Save the current date.toJSON function
        var dateToJSON = Date.prototype.toJSON;
        try {
            // Set our own date.toJSON function
            Date.prototype.toJSON = function () {
                return formatDateTimeOffset(this);
            };
            result = window.JSON.stringify(data, jsonReplacer);
        } finally {
            // Restore the original toJSON function
            Date.prototype.toJSON = dateToJSON;
        }
        return result;
    };

    var jsonSerializer = function (handler, data, context) {
        /// <summary>Serializes the data by returning its string representation.</summary>
        /// <param name="handler">This handler.</param>
        /// <param name="data">Data to serialize.</param>
        /// <param name="context" type="Object">Object with serialization context.</param>
        /// <returns type="String">The string representation of data.</returns>

        var dataServiceVersion = context.dataServiceVersion || "1.0";
        var useJsonLight = defined(context.useJsonLight, handler.useJsonLight);
        var cType = context.contentType = context.contentType || jsonContentType;

        if (cType && cType.mediaType === jsonContentType.mediaType) {
            var json = data;
            if (useJsonLight || isJsonLight(cType)) {
                context.dataServiceVersion = maxVersion(dataServiceVersion, "3.0");
                json = formatJsonLight(data, context);
                return jsonToString(json);
            }
            if (maxVersion("3.0", dataServiceVersion) === dataServiceVersion) {
                cType.properties.odata = "verbose";
                context.contentType = cType;
            }
            return jsonToString(json);
        }
        return undefined;
    };

    var jsonReplacer = function (_, value) {
        /// <summary>JSON replacer function for converting a value to its JSON representation.</summary>
        /// <param value type="Object">Value to convert.</param>
        /// <returns type="String">JSON representation of the input value.</returns>
        /// <remarks>
        ///   This method is used during JSON serialization and invoked only by the JSON.stringify function.
        ///   It should never be called directly.
        /// </remarks>

        if (value && value.__edmType === "Edm.Time") {
            return formatDuration(value);
        } else {
            return value;
        }
    };

    var jsonNormalizeData = function (data, baseURI) {
        /// <summary>
        /// Normalizes the specified data into an intermediate representation.
        /// like the latest supported version.
        /// </summary>
        /// <param name="data" optional="false">Data to update.</param>
        /// <param name="baseURI" optional="false">URI to use as the base for normalizing references.</param>

        var isSvcDoc = isComplex(data) && !data.__metadata && isArray(data.EntitySets);
        return isSvcDoc ? normalizeServiceDocument(data, baseURI) : data;
    };

    var jsonUpdateDataFromVersion = function (data, dataVersion) {
        /// <summary>
        /// Updates the specified data in the specified version to look
        /// like the latest supported version.
        /// </summary>
        /// <param name="data" optional="false">Data to update.</param>
        /// <param name="dataVersion" optional="true" type="String">Version the data is in (possibly unknown).</param>

        // Strip the trailing comma if there.
        if (dataVersion && dataVersion.lastIndexOf(";") === dataVersion.length - 1) {
            dataVersion = dataVersion.substr(0, dataVersion.length - 1);
        }

        if (!dataVersion || dataVersion === "1.0") {
            if (isArray(data)) {
                data = { results: data };
            }
        }

        return data;
    };

    var jsonHandler = handler(jsonParser, jsonSerializer, jsonMediaType, MAX_DATA_SERVICE_VERSION);
    jsonHandler.recognizeDates = false;
    jsonHandler.useJsonLight = false;
    jsonHandler.inferJsonLightFeedAsObject = false;

    odata.jsonHandler = jsonHandler;




    var batchMediaType = "multipart/mixed";
    var responseStatusRegex = /^HTTP\/1\.\d (\d{3}) (.*)$/i;
    var responseHeaderRegex = /^([^()<>@,;:\\"\/[\]?={} \t]+)\s?:\s?(.*)/;

    var hex16 = function () {
        /// <summary>
        /// Calculates a random 16 bit number and returns it in hexadecimal format.
        /// </summary>
        /// <returns type="String">A 16-bit number in hex format.</returns>

        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substr(1);
    };

    var createBoundary = function (prefix) {
        /// <summary>
        /// Creates a string that can be used as a multipart request boundary.
        /// </summary>
        /// <param name="prefix" type="String" optional="true">String to use as the start of the boundary string</param>
        /// <returns type="String">Boundary string of the format: <prefix><hex16>-<hex16>-<hex16></returns>

        return prefix + hex16() + "-" + hex16() + "-" + hex16();
    };

    var partHandler = function (context) {
        /// <summary>
        /// Gets the handler for data serialization of individual requests / responses in a batch.
        /// </summary>
        /// <param name="context">Context used for data serialization.</param>
        /// <returns>Handler object.</returns>

        return context.handler.partHandler;
    };

    var currentBoundary = function (context) {
        /// <summary>
        /// Gets the current boundary used for parsing the body of a multipart response.
        /// </summary>
        /// <param name="context">Context used for parsing a multipart response.</param>
        /// <returns type="String">Boundary string.</returns>

        var boundaries = context.boundaries;
        return boundaries[boundaries.length - 1];
    };

    var batchParser = function (handler, text, context) {
        /// <summary>Parses a batch response.</summary>
        /// <param name="handler">This handler.</param>
        /// <param name="text" type="String">Batch text.</param>
        /// <param name="context" type="Object">Object with parsing context.</param>
        /// <returns>An object representation of the batch.</returns>

        var boundary = context.contentType.properties["boundary"];
        return { __batchResponses: readBatch(text, { boundaries: [boundary], handlerContext: context }) };
    };

    var batchSerializer = function (handler, data, context) {
        /// <summary>Serializes a batch object representation into text.</summary>
        /// <param name="handler">This handler.</param>
        /// <param name="data" type="Object">Representation of a batch.</param>
        /// <param name="context" type="Object">Object with parsing context.</param>
        /// <returns>An text representation of the batch object; undefined if not applicable.</returns>

        var cType = context.contentType = context.contentType || contentType(batchMediaType);
        if (cType.mediaType === batchMediaType) {
            return writeBatch(data, context);
        }
    };

    var readBatch = function (text, context) {
        /// <summary>
        /// Parses a multipart/mixed response body from from the position defined by the context.
        /// </summary>
        /// <param name="text" type="String" optional="false">Body of the multipart/mixed response.</param>
        /// <param name="context">Context used for parsing.</param>
        /// <returns>Array of objects representing the individual responses.</returns>

        var delimiter = "--" + currentBoundary(context);

        // Move beyond the delimiter and read the complete batch
        readTo(text, context, delimiter);

        // Ignore the incoming line
        readLine(text, context);

        // Read the batch parts
        var responses = [];
        var partEnd;

        while (partEnd !== "--" && context.position < text.length) {
            var partHeaders = readHeaders(text, context);
            var partContentType = contentType(partHeaders["Content-Type"]);

            var changeResponses;
            if (partContentType && partContentType.mediaType === batchMediaType) {
                context.boundaries.push(partContentType.properties["boundary"]);
                try {
                    changeResponses = readBatch(text, context);
                } catch (e) {
                    e.response = readResponse(text, context, delimiter);
                    changeResponses = [e];
                }
                responses.push({ __changeResponses: changeResponses });
                context.boundaries.pop();
                readTo(text, context, "--" + currentBoundary(context));
            } else {
                if (!partContentType || partContentType.mediaType !== "application/http") {
                    throw { message: "invalid MIME part type " };
                }
                // Skip empty line
                readLine(text, context);
                // Read the response
                var response = readResponse(text, context, delimiter);
                try {
                    if (response.statusCode >= 200 && response.statusCode <= 299) {
                        partHandler(context.handlerContext).read(response, context.handlerContext);
                    } else {
                        // Keep track of failed responses and continue processing the batch.
                        response = { message: "HTTP request failed", response: response };
                    }
                } catch (e) {
                    response = e;
                }

                responses.push(response);
            }

            partEnd = text.substr(context.position, 2);

            // Ignore the incoming line.
            readLine(text, context);
        }
        return responses;
    };

    var readHeaders = function (text, context) {
        /// <summary>
        /// Parses the http headers in the text from the position defined by the context.
        /// </summary>
        /// <param name="text" type="String" optional="false">Text containing an http response's headers</param>
        /// <param name="context">Context used for parsing.</param>
        /// <returns>Object containing the headers as key value pairs.</returns>
        /// <remarks>
        /// This function doesn't support split headers and it will stop reading when it hits two consecutive line breaks.
        /// </remarks>

        var headers = {};
        var parts;
        var line;
        var pos;

        do {
            pos = context.position;
            line = readLine(text, context);
            parts = responseHeaderRegex.exec(line);
            if (parts !== null) {
                headers[parts[1]] = parts[2];
            } else {
                // Whatever was found is not a header, so reset the context position.
                context.position = pos;
            }
        } while (line && parts);

        normalizeHeaders(headers);

        return headers;
    };

    var readResponse = function (text, context, delimiter) {
        /// <summary>
        /// Parses an HTTP response.
        /// </summary>
        /// <param name="text" type="String" optional="false">Text representing the http response.</param>
        /// <param name="context" optional="false">Context used for parsing.</param>
        /// <param name="delimiter" type="String" optional="false">String used as delimiter of the multipart response parts.</param>
        /// <returns>Object representing the http response.</returns>

        // Read the status line.
        var pos = context.position;
        var match = responseStatusRegex.exec(readLine(text, context));

        var statusCode;
        var statusText;
        var headers;

        if (match) {
            statusCode = match[1];
            statusText = match[2];
            headers = readHeaders(text, context);
            readLine(text, context);
        } else {
            context.position = pos;
        }

        return {
            statusCode: statusCode,
            statusText: statusText,
            headers: headers,
            body: readTo(text, context, "\r\n" + delimiter)
        };
    };

    var readLine = function (text, context) {
        /// <summary>
        /// Returns a substring from the position defined by the context up to the next line break (CRLF).
        /// </summary>
        /// <param name="text" type="String" optional="false">Input string.</param>
        /// <param name="context" optional="false">Context used for reading the input string.</param>
        /// <returns type="String">Substring to the first ocurrence of a line break or null if none can be found. </returns>

        return readTo(text, context, "\r\n");
    };

    var readTo = function (text, context, str) {
        /// <summary>
        /// Returns a substring from the position given by the context up to value defined by the str parameter and increments the position in the context.
        /// </summary>
        /// <param name="text" type="String" optional="false">Input string.</param>
        /// <param name="context" type="Object" optional="false">Context used for reading the input string.</param>
        /// <param name="str" type="String" optional="true">Substring to read up to.</param>
        /// <returns type="String">Substring to the first ocurrence of str or the end of the input string if str is not specified. Null if the marker is not found.</returns>

        var start = context.position || 0;
        var end = text.length;
        if (str) {
            end = text.indexOf(str, start);
            if (end === -1) {
                return null;
            }
            context.position = end + str.length;
        } else {
            context.position = end;
        }

        return text.substring(start, end);
    };

    var writeBatch = function (data, context) {
        /// <summary>
        /// Serializes a batch request object to a string.
        /// </summary>
        /// <param name="data" optional="false">Batch request object in payload representation format</param>
        /// <param name="context" optional="false">Context used for the serialization</param>
        /// <returns type="String">String representing the batch request</returns>

        if (!isBatch(data)) {
            throw { message: "Data is not a batch object." };
        }

        var batchBoundary = createBoundary("batch_");
        var batchParts = data.__batchRequests;
        var batch = "";
        var i, len;
        for (i = 0, len = batchParts.length; i < len; i++) {
            batch += writeBatchPartDelimiter(batchBoundary, false) +
                     writeBatchPart(batchParts[i], context);
        }
        batch += writeBatchPartDelimiter(batchBoundary, true);

        // Register the boundary with the request content type.
        var contentTypeProperties = context.contentType.properties;
        contentTypeProperties.boundary = batchBoundary;

        return batch;
    };

    var writeBatchPartDelimiter = function (boundary, close) {
        /// <summary>
        /// Creates the delimiter that indicates that start or end of an individual request.
        /// </summary>
        /// <param name="boundary" type="String" optional="false">Boundary string used to indicate the start of the request</param>
        /// <param name="close" type="Boolean">Flag indicating that a close delimiter string should be generated</param>
        /// <returns type="String">Delimiter string</returns>

        var result = "\r\n--" + boundary;
        if (close) {
            result += "--";
        }

        return result + "\r\n";
    };

    var writeBatchPart = function (part, context, nested) {
        /// <summary>
        /// Serializes a part of a batch request to a string. A part can be either a GET request or
        /// a change set grouping several CUD (create, update, delete) requests.
        /// </summary>
        /// <param name="part" optional="false">Request or change set object in payload representation format</param>
        /// <param name="context" optional="false">Object containing context information used for the serialization</param>
        /// <param name="nested" type="boolean" optional="true">Flag indicating that the part is nested inside a change set</param>
        /// <returns type="String">String representing the serialized part</returns>
        /// <remarks>
        /// A change set is an array of request objects and they cannot be nested inside other change sets.
        /// </remarks>

        var changeSet = part.__changeRequests;
        var result;
        if (isArray(changeSet)) {
            if (nested) {
                throw { message: "Not Supported: change set nested in other change set" };
            }

            var changeSetBoundary = createBoundary("changeset_");
            result = "Content-Type: " + batchMediaType + "; boundary=" + changeSetBoundary + "\r\n";
            var i, len;
            for (i = 0, len = changeSet.length; i < len; i++) {
                result += writeBatchPartDelimiter(changeSetBoundary, false) +
                     writeBatchPart(changeSet[i], context, true);
            }

            result += writeBatchPartDelimiter(changeSetBoundary, true);
        } else {
            result = "Content-Type: application/http\r\nContent-Transfer-Encoding: binary\r\n\r\n";
            var partContext = extend({}, context);
            partContext.handler = handler;
            partContext.request = part;
            partContext.contentType = null;

            prepareRequest(part, partHandler(context), partContext);
            result += writeRequest(part);
        }

        return result;
    };

    var writeRequest = function (request) {
        /// <summary>
        /// Serializes a request object to a string.
        /// </summary>
        /// <param name="request" optional="false">Request object to serialize</param>
        /// <returns type="String">String representing the serialized request</returns>

        var result = (request.method ? request.method : "GET") + " " + request.requestUri + " HTTP/1.1\r\n";
        for (var name in request.headers) {
            if (request.headers[name]) {
                result = result + name + ": " + request.headers[name] + "\r\n";
            }
        }

        result += "\r\n";

        if (request.body) {
            result += request.body;
        }

        return result;
    };

    odata.batchHandler = handler(batchParser, batchSerializer, batchMediaType, MAX_DATA_SERVICE_VERSION);



    var handlers = [odata.jsonHandler, odata.atomHandler, odata.xmlHandler, odata.textHandler];

    var dispatchHandler = function (handlerMethod, requestOrResponse, context) {
        /// <summary>Dispatches an operation to handlers.</summary>
        /// <param name="handlerMethod" type="String">Name of handler method to invoke.</param>
        /// <param name="requestOrResponse" type="Object">request/response argument for delegated call.</param>
        /// <param name="context" type="Object">context argument for delegated call.</param>

        var i, len;
        for (i = 0, len = handlers.length; i < len && !handlers[i][handlerMethod](requestOrResponse, context); i++) {
        }

        if (i === len) {
            throw { message: "no handler for data" };
        }
    };

    odata.defaultSuccess = function (data) {
        /// <summary>Default success handler for OData.</summary>
        /// <param name="data">Data to process.</param>

        window.alert(window.JSON.stringify(data));
    };

    odata.defaultError = throwErrorCallback;

    odata.defaultHandler = {
        read: function (response, context) {
            /// <summary>Reads the body of the specified response by delegating to JSON and ATOM handlers.</summary>
            /// <param name="response">Response object.</param>
            /// <param name="context">Operation context.</param>

            if (response && assigned(response.body) && response.headers["Content-Type"]) {
                dispatchHandler("read", response, context);
            }
        },

        write: function (request, context) {
            /// <summary>Write the body of the specified request by delegating to JSON and ATOM handlers.</summary>
            /// <param name="request">Reques tobject.</param>
            /// <param name="context">Operation context.</param>

            dispatchHandler("write", request, context);
        },

        maxDataServiceVersion: MAX_DATA_SERVICE_VERSION,
        accept: "application/atomsvc+xml;q=0.8, application/json;odata=fullmetadata;q=0.7, application/json;q=0.5, */*;q=0.1"
    };

    odata.defaultMetadata = [];

    odata.read = function (urlOrRequest, success, error, handler, httpClient, metadata) {
        /// <summary>Reads data from the specified URL.</summary>
        /// <param name="urlOrRequest">URL to read data from.</param>
        /// <param name="success" type="Function" optional="true">Callback for a successful read operation.</param>
        /// <param name="error" type="Function" optional="true">Callback for handling errors.</param>
        /// <param name="handler" type="Object" optional="true">Handler for data serialization.</param>
        /// <param name="httpClient" type="Object" optional="true">HTTP client layer.</param>
        /// <param name="metadata" type="Object" optional="true">Conceptual metadata for this request.</param>

        var request;
        if (urlOrRequest instanceof String || typeof urlOrRequest === "string") {
            request = { requestUri: urlOrRequest };
        } else {
            request = urlOrRequest;
        }

        return odata.request(request, success, error, handler, httpClient, metadata);
    };

    odata.request = function (request, success, error, handler, httpClient, metadata) {
        /// <summary>Sends a request containing OData payload to a server.</summary>
        /// <param name="request" type="Object">Object that represents the request to be sent.</param>
        /// <param name="success" type="Function" optional="true">Callback for a successful read operation.</param>
        /// <param name="error" type="Function" optional="true">Callback for handling errors.</param>
        /// <param name="handler" type="Object" optional="true">Handler for data serialization.</param>
        /// <param name="httpClient" type="Object" optional="true">HTTP client layer.</param>
        /// <param name="metadata" type="Object" optional="true">Conceptual metadata for this request.</param>

        success = success || odata.defaultSuccess;
        error = error || odata.defaultError;
        handler = handler || odata.defaultHandler;
        httpClient = httpClient || odata.defaultHttpClient;
        metadata = metadata || odata.defaultMetadata;

        // Augment the request with additional defaults.
        request.recognizeDates = defined(request.recognizeDates, odata.jsonHandler.recognizeDates);
        request.callbackParameterName = defined(request.callbackParameterName, odata.defaultHttpClient.callbackParameterName);
        request.formatQueryString = defined(request.formatQueryString, odata.defaultHttpClient.formatQueryString);
        request.enableJsonpCallback = defined(request.enableJsonpCallback, odata.defaultHttpClient.enableJsonpCallback);
        request.useJsonLight = defined(request.useJsonLight, odata.jsonHandler.enableJsonpCallback);
        request.inferJsonLightFeedAsObject = defined(request.inferJsonLightFeedAsObject, odata.jsonHandler.inferJsonLightFeedAsObject);

        // Create the base context for read/write operations, also specifying complete settings.
        var context = {
            metadata: metadata,
            recognizeDates: request.recognizeDates,
            callbackParameterName: request.callbackParameterName,
            formatQueryString: request.formatQueryString,
            enableJsonpCallback: request.enableJsonpCallback,
            useJsonLight: request.useJsonLight,
            inferJsonLightFeedAsObject: request.inferJsonLightFeedAsObject
        };

        try {
            prepareRequest(request, handler, context);
            return invokeRequest(request, success, error, handler, httpClient, context);
        } catch (err) {
            error(err);
        }
    };

    odata.parseMetadata = function (csdlMetadataDocument) {
        /// <summary>Parses the csdl metadata to DataJS metatdata format. This method can be used when the metadata is retrieved using something other than DataJS</summary>
        /// <param name="atomMetadata" type="string">A string that represents the entire csdl metadata.</param>
        /// <returns type="Object">An object that has the representation of the metadata in Datajs format.</returns>

        return metadataParser(null, csdlMetadataDocument);
    };

    // Configure the batch handler to use the default handler for the batch parts.
    odata.batchHandler.partHandler = odata.defaultHandler;


})(this);
define("oDataService", (function (global) {
    return function () {
        var ret, fn;
       fn = function () {
                return this.OData;
            };
        ret = fn.apply(global, arguments);
        return ret;
    };
}(this)));

define(
    'transportInterface', [],

    function () {
        var transportInterface = {
            defaults: {
                successHandler: null,
                errorHandler: null,
                //visibility: null,
                //visibilityId: null,
                //contentId: null,
                fields: null,
                filters: null,
                orderBy: null,
                orderDesc: false,
                getCount: false,
                orderAscending: null,
                limitFrom: null,
                limitCount: null,
                parseDate: null
            },

            /* main api */
            create: function () {
                console.log('transportInterface:create :: stub method, have to be implemented');
            },

            find: function () {
                console.log('transportInterface:find :: stub method, have to be implemented');
            },

            findOne: function () {
                console.log('transportInterface:findOne :: stub method, have to be implemented');
            },

            update: function () {
                console.log('transportInterface:update :: stub method, have to be implemented');
            },

            remove: function () {
                console.log('transportInterface:remove :: stub method, have to be implemented');
            }
            /* end main api */

        };

        return transportInterface;
    });
define(
    'filtersParser', ['underscorenc', 'helpers', 'config', 'errorManager'],

    function (_, helpers, config, errorManager) {

        /* moved from queryBuilder */
        var parseValueByType = function (name, val) {
            // filter value is a date
            if (name.indexOf("date") !== -1) {
                return "datetime'" + val + "'";
            }

            // string values should be in quotes
            if (_.isString(val)) {
                return "'" + val + "'";
            }

            // if a value is null then print it as null in odata query string
            if (_.isNull(val)) {
                return 'null';
            }

            return val;
        };

        var alternativeComparators = {
                '$equal': '='
            },
            altenativeOperators = {
                '$and': "&"
            };

        var comparators = {
            '$gte': 'ge', '$gt': 'gt', '$lte': 'le',
            '$lt': 'lt', '$equal': 'eq', '$ne': 'ne',
            '$not': 'not',
            '$in': function (fieldName, values) {
                var res = _.map(values, function (val) {
                    var obj = {};
                    obj[fieldName] = val;
                    return obj;
                });

                return parser.parseFilter({$or: res});
            },
            '$like': function (fieldName, value) {
                /** wrong wrap to 'string' instead of string */
                if (value[0] === "'" && value[value.length - 1] === "'") {
                    value = value.slice(1, -1);
                }

                return "substringof('" + helpers.encodeUrlString(value) + "', " + fieldName + ")";
            },

            /*
             * risky for public use,
             * since there are no validation on inner fields!
             */
            // TODO: WSi 21/01/2014: Is there a way to actually be able to validate these fields?
            '$extend': function (obj) {
                if (!_.isObject(obj)) {
                    return '';
                }

                /** expect to have only one key in extend object */
                var extendName = _.first(_.keys(obj)),
                    value = obj[extendName];

                var result = parser.setKeyPrefix(extendName).parseFilter(value);

                parser.setKeyPrefix('');

                return result;
            },

            '$any': function (obj) {
                if (!_.isObject(obj)) {
                    return '';
                }
                var anyName = _.first(_.keys(obj)),
                    value = obj[anyName],
                    tresult,
                    fresult = '';

                tresult = parser.setKeyPrefix(anyName).parseFilter(value);
                parser.setKeyPrefix('');
                fresult = anyName + '/any(' + anyName + ': ' + tresult + ')';

                return fresult;
            },

            '$sub': function (obj) {
                if (!_.isObject(obj)) {
                    return '';
                }
                var subName = _.first(_.keys(obj)),
                    value = obj[subName],
                    result = '';

                result = parser.setKeyPrefix(subName).parseFilter(value);
                parser.setKeyPrefix('');

                return result;
            }
        };

        var operators = {
            '$or': 'or', '$and': 'and'
        };

        var opsNames = _.keys(operators),
            compareOperations = _.keys(comparators),
            acceptableKeys = _.union(opsNames, compareOperations);

        var parser = {
            comparators: comparators,
            operators: operators,
            opsNames: opsNames,
            compareOperations: compareOperations,
            acceptableKeys: acceptableKeys,

            /** this part is actually allow to use extendFor */
            keyPrefix: '',

            setKeyPrefix: function (name) {
                this.keyPrefix = name;

                return this;
            },

            createKey: function (key) {
                if (!this.keyPrefix) {
                    return key;
                }

                if (key.indexOf(this.keyPrefix + '/') === -1) {
                    return this.keyPrefix + '/' + key;
                }

                return key;
            },

            /** define is there need to wrap rules in () */
            isWrap: true,

            /** bool setter, will reset to default after createFilterString call  */
            setWrap: function (val) {
                this.isWrap = !!(val);

                return this;
            },

            /** string foramtter itself */
            wrap: function (string) {
                if (!this.isWrap) {
                    return string;
                }

                return '(' + string + ')';

            },

            /** force to create oData Custom Query Options, or GET params if you want ,
             * will reset to defaults after createFilterString call
             */
            useAlternativeRules: function () {

                this.comparators = alternativeComparators;
                this.operators = altenativeOperators;
                this.opsNames = _.keys(this.operators);
                this.compareOperations = _.keys(this.comparators);
                this.acceptableKeys = _.union(this.opsNames, this.compareOperations);

                return this;
            },

            restoreRules: function () {

                this.comparators = comparators;
                this.operators = operators;
                this.opsNames = opsNames;
                this.compareOperations = compareOperations;
                this.acceptableKeys = acceptableKeys;

                return this;
            },

            validate: function (key) {
                if (_.isNumber(key) || _.isFunction(key)) {
                    return;
                }

                if (_.contains(this.acceptableKeys, key)) {
                    return;
                }

                /** forgot $ sign for operation */
                var looksLikeOperation = _.some(this.acceptableKeys, function (name) {
                    return (name === ("$" + key));
                });
                if (looksLikeOperation) {
                    //filtersParser: validate: key "{0}" is not one of valid operators: {1}
                    errorManager.throwError('API_ERR_TRANSPORT_2', [key, acceptableKeys]);
                }

                /** check if string starts from $ sign */
                if ('$' !== _.first(key)) {
                    return;
                }
                errorManager.throwError('API_ERR_TRANSPORT_2', [key, acceptableKeys]);
            },

            isComplex: function (filters) {
                var self = this;

                return _.some(filters, function (item, key) {
                    var isAcceptableKey = _.some(self.acceptableKeys, function (name) {
                        return (name === key);
                    });

                    if (isAcceptableKey) {
                        return true;
                    }

                    if (!_.isObject(item)) {
                        return false;
                    }

                    return self.isComplex(item);
                });
            },

            getFields: function (filters) {
                var self = this;

                /** 1) map return array of fileds
                 * 2) due to recursion arrays will be nested if there are complex rule. Use flatten to make it raw
                 * 3) Uniq just remove duplicates
                 */
                return _.compact(_.uniq(_.flatten(_.map(filters, function (item, key) {
                    /**
                     * skip $extend rule since fields in this section
                     * DO NOT belong to current entity
                     */
                    if (key === '$extend' || key === '$any' || key === '$sub') {
                        return;
                    }

                    /** if key is primitive value(STRING) and not one of special keys, add it to result */
                    if (!_.isObject(item) && !_.contains(self.acceptableKeys, key)) {
                        return key;
                    }

                    /** if not special key and iteration walks not through array(key is number if array), then add to result */
                    if (!_.contains(self.acceptableKeys, key) && !_.isNumber(key)) {
                        return key;
                    }

                    /** otherwise look deeper */
                    return self.getFields(item);
                }))));
            },

            mapFilters: function (fieldsValues) {

                //MOVED from annotations.js
                if (!_.isUndefined(fieldsValues.$visibility)) {
                    if ((_.isArray(fieldsValues.$visibility))) {
                        var singleVisibility = _.some(fieldsValues.$visibility, function (singleVisibility) {
                            return !_.isString(singleVisibility);
                        });

                        if (singleVisibility) {
                            // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                            errorManager.throwError('API_ERR_QUERY_API_3',
                                [this.entityName, _.keys(this._filtersObj), '', 'string', 'of incorrect type']);
                        }
                    } else if (!_.isString(fieldsValues.$visibility)) {
                        // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                        errorManager.throwError('API_ERR_QUERY_API_3',
                            [this.entityName, _.keys(this._filtersObj), '', 'string', helpers.toType(fieldsValues.$visibility)]);
                    }
                    //VV Dp-2455 - When annotations are filtered by visibility id,
                    // param needs to be put into query params instead of filter
                    delete fieldsValues.$visibility;
                }

                if (!_.isUndefined(fieldsValues.$client)) {
                    if (!_.isString(fieldsValues.$client)) {
                        // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                        errorManager.throwError('API_ERR_QUERY_API_3',
                            [this.entityName, _.keys(this._filtersObj), '', 'string', helpers.toType(fieldsValues.$client)]);
                    }
                    delete fieldsValues.$client;
                }
            },

            buildComparator: function (expr, fieldName) {
                //var result = '', operation, value, string;

                /** $in comparator has alias - array of values
                 * @example { type_id: [1,2] } is alias to { type_id: {$in: [1,2]} }
                 */
                if (_.isArray(expr)) {
                    return this.comparators.$in(fieldName, expr);
                }

                /** expession is primitive */
                if (!_.isObject(expr)) {
                    operation = this.comparators.$equal;
                    value = expr;
                } else {
                    var firstKey = _.first(_.keys(expr));

                    this.validate(firstKey);

                    operation = this.comparators[firstKey];
                    value = expr[firstKey];
                }

                /**
                 * even if key is formally validate to true [starts from $ sign, and one of acceptable names],
                 * there can be option that operation for that key is not defined.
                 * In this case we can't procceed since we don't want to have guffy query to server in result
                 * @example { content_id: { $or: 20 } }
                 */
                if (_.isUndefined(operation)) {
                    //filtersParser: buildComparator: could not find compare operation for key "{0}". Valid keys: {1}
                    errorManager.throwError('API_ERR_TRANSPORT_3', [firstKey, this.compareOperations]);
                }

                /** format value for query */
                value = parseValueByType(fieldName, value);

                /** format key for query */
                fieldName = this.createKey(fieldName);

                if (_.isFunction(operation)) {
                    string = operation(fieldName, value);
                } else {
                    string = [fieldName, value].join(' ' + operation + ' ');
                }

                return this.wrap(string);
            },

            //.find ( {$or: [{ price:1.99, pric: 1, $or: [ { qty: { $lt: 20 } }, { sale: true },  {$and: [ { qty: { $gt: 20 } }, { sale: false } ] }  ] } ], some: 5 } )
            //"((price eq 1.99) or (pric eq 1) or ((qty lt 20) or (sale eq true) or ((qty gt 20) and (sale eq false)))) and (some eq 5)"
            createFilterString: function (filters) {
                //CI - checked elsewhere, not needed
                //if (!_.isObject(filters)) {
                //    //filtersParser: createFilterString: expect filters to be Object
                //    errorManager.throwError('API_ERR_QUERY_API_3',
                //        ['', '', 'find', 'object', typeof filters]);
                //}

                if (!filters) {
                    return '';
                }

                //IC - In case of batch operations, we need to convert $visibility and $client
                this.mapFilters(filters);

                var result = this.parseFilter(filters);

                this.restoreRules();

                this.isWrap = true;

                this.keyPrefix = '';

                return result;
            },

            parseFilter: function (filter, logicalOperator) {
                var self = this,
                    logicalOperatorEffective = this.operators[logicalOperator || "$and"];

                if (_.isArray(filter)) {
                    var res = _.map(filter, function (item) {
                        return self.parseFilter(item, logicalOperator);
                    }).join(' ' + logicalOperatorEffective + ' ');

                    return this.wrap(res);
                }

                return _.map(filter, function (item, key) {

                    self.validate(key);

                    if (key === '$extend' || key === '$any' || key === '$sub') {
                        return self.comparators[key](item);
                    }

                    var isOperation = _.some(self.opsNames, function (name) {
                        return (name === key);
                    });
                    /** allow to build extend, since it calls parseFilter inside */
                    if (isOperation) {
                        return self.parseFilter(item, key);
                    }

                    return self.buildComparator(item, key);
                }).join(' ' + logicalOperatorEffective + ' ');
            },

            getCustomQueryOptions: function (filters) {
                return this.setWrap(false)
                    .useAlternativeRules()
                    .createFilterString(filters);
            }
        };

        return parser;
    });
define(
    'oDataQueryBuilder', ['underscorenc', 'config', 'filtersParser', 'helpers'],

    function (_, config, filtersParser, helpers) {

        var fieldsToString = function (fields, command, set) {
            var select = "",
                i;
            if (_.isString(fields)) {
                fields = [fields];
            }

            if (fields && fields.length > 0) {
                if (set) {
                    select = "$" + command + "=";
                    for (i = 0; i < fields.length; i++) {
                        select += set + "/" + fields[i];
                        if (i < fields.length - 1) {
                            select += ",";
                        }
                    }
                } else {
                    select = "$" + command + "=" + fields.join(",");
                }
            }
            return select;
        };

        var limitToString = function (limitFrom, limitCount) {
            var limitFromString = '', limitToString = '';

            if (!_.isNullUndef(limitFrom)) {
                limitFromString = "$skip=" + limitFrom;
            }

            if (!_.isNullUndef(limitCount)) {
                limitToString = "$top=" + limitCount;
            }

            return _.compact([limitFromString, limitToString]).join('&');
        };

        function getExpandedOrderString(params, orderByString) {
            var result = '';

            if (!params.orderByExpanded) {
                return result;
            }

            if (orderByString === "") {
                result = fieldsToString(params.orderByExpanded, "orderby", params.expandedFor);
            } else {
                result = "," + fieldsToString(params.orderByExpanded, "", params.expandedFor).substring(3);
            }

            return result;
        }

        function getExpandedForString(reqData) {
            var result = '';

            if (reqData.expandedFor) {
                result = '$expand=' + reqData.expandedFor;
            }

            return result;
        }

        var queryBuilder = {
            filtersParser: filtersParser
        };

        queryBuilder.getExpandedTail = function (params) {

            if (params.count) {
                return this.getCountTail(params);
            }

            var filterString = "",
                selectString = "", orderByString = "", orderByExpandedString = "",
                limitString = "", expandForString = "", tail = "", queryStringParams = '';

            filterString = queryBuilder.getFilterStringSimple(params);

            selectString = fieldsToString(params.fields, "select", params.expandedFor);
            if (params.expandedForFields && params.expandedForFields.length) {
                var additionalSelectString = params.expandedForFields.join(',');
                selectString = _.compact([selectString, additionalSelectString]).join(',');
            }

            orderByString = fieldsToString(params.orderBy, "orderby");

            orderByExpandedString = getExpandedOrderString(params, orderByString);

            if (params.orderDesc && orderByString && !orderByExpandedString) {
                orderByString += " desc ";
            }

            if (params.orderDesc && orderByExpandedString) {
                orderByExpandedString += " desc ";
            }

            if (params.inlineCount) {
                inlineCountString = '$inlinecount=allpages';
            }

            queryStringParams = queryBuilder.addQueryParams(params);

            limitString = limitToString(params.limitFrom, params.limitCount);

            expandForString = getExpandedForString(params);
            tail = helpers.concatenateStrings("?", [queryStringParams, expandForString, filterString, selectString,
                orderByString, orderByExpandedString, limitString], '&');
            //tail = "?" + expandForString + filterStringgetTail +
            //    selectString + orderByString + orderByExpandedString + limitString;

            return tail;
        };

        queryBuilder.getTail = function (req) {

            if (req.data.count) {
                return this.getCountTail(req);
            }

            var filterString = "", selectString = "", orderByString = "", limitString = "",
                tail = "", queryStringParams = "", inlineCountString = "", expandForString = "";

            filterString = queryBuilder.getFilterStringSimple(req.data);

            selectString = fieldsToString(req.data.fields, "select");

            orderByString = fieldsToString(req.data.orderBy, "orderby");

            if (req.data.orderDesc && orderByString) {
                orderByString += " desc ";
            }

            if (req.data.inlineCount) {
                inlineCountString = '$inlinecount=allpages';
            }

            queryStringParams = queryBuilder.addQueryParams(req.head.queryParams);

            expandForString = queryBuilder.expandFor(req.data.expandFor);

            limitString = limitToString(req.data.limitFrom, req.data.limitCount);
            tail = helpers.concatenateStrings("?",
                [
                    queryStringParams,
                    filterString,
                    selectString,
                    orderByString,
                    limitString,
                    inlineCountString,
                    expandForString
                ],
                '&'
            );
            //tail = "?" + forUserString + filterString + selectString + orderByString + limitString + inlineCountString + withTagsString;

            return tail;
        };

        queryBuilder.getCountTail = function (req) {
            var filterString, queryStringParams = "", tail, expandForString = '';

            filterString = queryBuilder.getFilterStringSimple(req.data);
            queryStringParams = queryBuilder.addQueryParams(req.head.queryParams);
            expandForString = getExpandedForString(req.data);

            //tail = helpers.concatenateStrings("$count?", [queryStringParams, expandForString, filterString], '&');
            //tail = "$count?" + forUserString + expandForString + filterString;
            // WSi 20141010 $count requires slash in front unlike other query parameters
            tail = "/$count" + helpers.concatenateStrings(
                    "?",
                    [queryStringParams, expandForString, filterString],
                    '&'
                );

            return tail;
        };

        queryBuilder.getFilterStringSimple = function (reqData) {

            var oDataGETParams = reqData.customFunctionString ? reqData.customFunctionString + "&" : "";

            reqData.filters = reqData.filters || {};

            // WSI TODO not in use i guess, remove...
            // if (params.setFilters && params.setFiltersFilterName) {
            //   var obj  = {};
            //   obj[params.setFiltersFilterName] = params.setFilters;

            //   _.extend(params.filters, obj);
            // }

            // WSI TODO this is a legacy way of extending...
            if (reqData.expandedFor && reqData.expandedForFilters) {
                reqData.filters.$extend = {};
                reqData.filters.$extend[reqData.expandedFor] = reqData.expandedForFilters;
            }

            var filterString = filtersParser.createFilterString(reqData.filters);

            /** 'and' looks pretty hardcoded  */
            //return oDataGETParams + "$filter=" + _.compact([filterString, params.customFilterString]).join(' and ');
            //return helpers.concatenateStrings("$filter=", [oDataGETParams, filterString, params.customFilterString], ' and ');

            return oDataGETParams + helpers.concatenateStrings("$filter=",
                    _.compact([filterString, reqData.customFilterString]), ' and ');
        };

        queryBuilder.addQueryParams = function (qparams) {
            var out = "";
            if (qparams && _.isObject(qparams)) {

                // TODO Wsi the line below should be executed in a diffrent place!
                //wsi if (params.next) out += "&";

                out += _.map(
                    qparams,
                    function (v, k) {
                        //return "" + k + "=" + (_.isString(v) ? "'" + v + "'" : v);
                        return "" + k + "=" + v;
                    }
                ).join('&');
            }
            return out;
        };

        queryBuilder.expandFor = function (exFor) {
            if (exFor && _.isArray(exFor) && exFor.length) {
                return config.EXPAND + exFor.join(',');
            }
            return '';
        };

        queryBuilder.fieldsToString = fieldsToString;
        queryBuilder.limitToString = limitToString;

        return queryBuilder;
    });
define(
    'oDataTransport', ['oDataService', 'transportInterface',
        'helpers', 'underscorenc', 'config', 'oDataQueryBuilder', 'errorManager'],

    function (oData, transportInterface, helpers, _, config, queryBuilder, errMan) {
        var oDataTransport = {
            init: function () {
                var transport = _.extend({}, transportInterface, this);

                // Since we are using CORS we don't need JSONP (anyway it is only read access to OData)
                oData.defaultHttpClient.enableJsonpCallback = false;

                return transport;
            }
        };

        oDataTransport.setCors = function () { /* WSi: Odata.js doesn't have support for cors on/off */
        };

        oDataTransport.getFiltersParser = function () {
            return queryBuilder.filtersParser;
        };

        ///////////////////////////////////////////////////////////////////////////////////////////
        ///
        /// NEW ODATA.JS
        ///
        ///////////////////////////////////////////////////////////////////////////////////////////

        // operation definitions
        var odataRequests = {};

        odataRequests[config.CRUD.findOne] = function (req, isBatch) {
            var oReq = {};

            // batches don't use tunneling
            oReq.method = isBatch ?
                config.REQ_TYPE_GET :
                helpers.getHTTPMethod(config.REQ_TYPE_GET);

            if (!isBatch) {
                oReq.headers = helpers.getHeader();
            }

            oReq.recognizeDates =
                _.isNullUndef(req.head.parseDates) ?
                    config.DEFAULT_PARSE_DATE : req.head.parseDates;

            var reqString = helpers.concatenateStrings(
                '?',
                [
                    queryBuilder.addQueryParams(req.head.queryParams),
                    queryBuilder.fieldsToString(req.data.fields, "select"),
                    queryBuilder.expandFor(req.data.expandFor)
                ],
                '&'
            );

            oReq.requestUri = req.head.baseURL({'id': req.data.id, 'tail': reqString});
            oReq.requestUri = isBatch ?
                oReq.requestUri :
                helpers.getRequestURL(oReq.requestUri, req.head.isWebApi);

            return oReq;
        };

        odataRequests[config.CRUD.find] = function (req, isBatch) {
            var oReq = {};

            // batches don't use tunneling
            oReq.method = isBatch ?
                config.REQ_TYPE_GET :
                helpers.getHTTPMethod(config.REQ_TYPE_GET);

            if (!isBatch) {
                oReq.headers = helpers.getHeader();
            }

            oReq.recognizeDates = _.isNullUndef(req.head.parseDates) ?
                config.DEFAULT_PARSE_DATE : req.head.parseDates;

            var tail = queryBuilder.getTail(req);

            if (req.data.next) {
                var params = queryBuilder.addQueryParams(req.head.queryParams);
                oReq.requestUri = req.data.next;
                oReq.requestUri = params.length > 0 ?
                oReq.requestUri + "&" + params : oReq.requestUri;
            } else {
                oReq.requestUri = req.head.baseURL({'tail': tail});
                oReq.requestUri = isBatch ?
                    oReq.requestUri :
                    helpers.getRequestURL(oReq.requestUri, req.head.isWebApi);

            }

            return oReq;
        };

        odataRequests[config.CRUD.create] = function (req, isBatch) {
            var oReq = {};

            // batches don't use tunneling
            oReq.method = isBatch ?
                config.REQ_TYPE_POST :
                helpers.getHTTPMethod(config.REQ_TYPE_POST);

            oReq.recognizeDates =
                _.isNullUndef(req.head.parseDates) ?
                    config.DEFAULT_PARSE_DATE : req.head.parseDates;

            if (!isBatch) {
                oReq.headers = helpers.getHeader(config.REQ_TYPE_POST);
            } else if (req.head.isMain) {
                // WSi 20140830: in the future we might support multiple main subrequests
                // for dependency relations, in this case we would use counter instead of
                // hardcoded string with number 1.
                oReq.headers = {"Content-ID": "1"};
            }

            oReq.requestUri =
                isBatch ?
                    req.head.baseURL() :
                    helpers.getRequestURL(req.head.baseURL(), req.head.isWebApi);

            oReq.data = req.data.fieldsValues;

            // query params are used in GET and DELETE as query string,
            // POST and PATCH in req's body for single calls, as query string in subbatches
            if (!_.isEmpty(req.head.queryParams)) {
                if (isBatch) {
                    oReq.requestUri += helpers.concatenateStrings(
                        '?',
                        [queryBuilder.addQueryParams(req.head.queryParams)],
                        ''
                    );
                } else {
                    _.extend(oReq.data, req.head.queryParams);
                }
            }

            // Injecting a link to the parent object for dependand batches.
            if (isBatch && !_.isNullUndef(req.data.foreignKeyRef)) {
                oReq.data[req.data.foreignKeyRef.navigationProperty] = {__metadata: {uri: "$1"}};
            }

            return oReq;
        };

        odataRequests[config.CRUD.update] = function (req, isBatch) {
            var oReq = {};
            // batches don't use tunneling

            oReq.method = isBatch ?
                config.REQ_TYPE_MERGE :
                helpers.getHTTPMethod(req.head.reqType || config.REQ_TYPE_MERGE);

            if (!_.isUndefined(req.head.etags)) {
                if (!_.isString(req.head.etags)) {
                    throw "Etag should be string but is " + typeof req.head.etags + ".";
                }
                oReq.headers = isBatch ?
                {"if-match": req.head.etags} :
                    helpers.getHeader(
                        config.REQ_TYPE_MERGE,
                        {"if-match": req.head.etags}
                    );
            } else {
                if (!isBatch) {
                    oReq.headers = helpers.getHeader(config.REQ_TYPE_MERGE);
                }
            }

            oReq.requestUri =
                isBatch ?
                    req.head.baseURL({id: req.data.id}) :
                    helpers.getRequestURL(
                        req.head.baseURL({id: req.data.id}),
                        req.head.isWebApi
                    );

            oReq.data = req.data.fieldsValues;

            // query params are used in GET and DELETE as query string,
            // POST and PATCH in req's body for single calls, as query string in subbatches
            if (!_.isEmpty(req.head.queryParams)) {
                if (isBatch) {
                    oReq.requestUri += helpers.concatenateStrings(
                        '?',
                        [queryBuilder.addQueryParams(req.head.queryParams)],
                        ''
                    );
                } else {
                    _.extend(oReq.data, req.head.queryParams);
                }
            }

            return oReq;
        };

        odataRequests[config.CRUD.remove] = function (req, isBatch) {
            var oReq = {};
            // batches don't use tunneling
            oReq.method = isBatch ?
                config.REQ_TYPE_DELETE :
                helpers.getHTTPMethod(config.REQ_TYPE_DELETE);
            if (!_.isUndefined(req.head.etags)) {
                if (!_.isString(req.head.etags)) {
                    throw "Etag should be string but is " + typeof req.head.etags + ".";
                }
                oReq.headers = isBatch ?
                {"if-match": req.head.etags} :
                    helpers.getHeader(
                        config.REQ_TYPE_DELETE,
                        {"if-match": req.head.etags}
                    );
            } else {
                if (!isBatch) {
                    oReq.headers = helpers.getHeader(config.REQ_TYPE_DELETE);
                }
            }

            oReq.requestUri =
                (isBatch ?
                        req.head.baseURL({id: req.data.id}) :
                        helpers.getRequestURL(
                            req.head.baseURL({id: req.data.id}),
                            req.head.isWebApi
                        )
                ) +
                helpers.concatenateStrings(
                    '?',
                    [queryBuilder.addQueryParams(req.head.queryParams)],
                    ''
                );

            return oReq;
        };

        function getSingleSuccessCallback(req, sub) {
            return function (data, response) {

                if (_.isUndefined(data) && !_.isUndefined(response.body) &&
                    _.isString(response.body) && response.body.length) {
                    //parsing response when creating & finding note with image - Map Widget
                    data = JSON.parse(response.body);
                }
                if (req.successHandler) {
                    var argsList = [];

                    if (sub.head.operation === config.CRUD.find) {
                        argsList.push(sub.data.count ? data : data.results);
                        argsList.push(data.__next);

                    } else if (sub.head.operation === config.CRUD.remove) {
                        // When updating an annotation, the data is null.
                        // The response is just an object with a status code 204, statusText: "No Content".
                        // We are only interested in whether the operation was successful or not.
                        // Therefore we are just calling a callback function without passing any params.

                        if(sub.head.customOperation === config.CUSTOM_ENDPOINTS.REMOVE_IMAGE) {
                            argsList.push(data);
                        }
                    } else if (sub.head.operation === config.CRUD.update) {
                        var responseAdditionalData = helpers.getResponseAdditionalData(response);
                        var udata = {__metadata: {}};
                        if (
                            !_.isUndefined(responseAdditionalData) && !_.isUndefined(responseAdditionalData.headers)
                        ) {
                            var etagVal = helpers.getPropertyValueCaseInsensitive(
                                responseAdditionalData.headers,
                                'etag'
                            );

                            if (!_.isUndefined(etagVal)) {
                                udata.__metadata.etag = etagVal;
                            }
                        }

                        if (sub.head.isCustomHead && sub.head.customOperation === config.CUSTOM_ENDPOINTS.UPDATE_IMAGE) {
                            argsList.push(data);
                        } else {
                            argsList.push(udata);
                        }

                    } else { //config.CRUD.create
                        argsList.push(data);

                    }
                    // this applies for all type of operations:
                    argsList.push(helpers.getResponseAdditionalData(response));

                    req.successHandler.apply(req, argsList);
                } else {
                    //helpers.consoleLog("success - response: " + response);
                    //helpers.consoleLog(helpers.debugParseResults(data));
                    helpers.defSuccessCb(data);
                }
            };
        }

        function getSingleErrorCallback(req) {
            return function (err) {
                if (req.errorHandler) {
                    req.errorHandler(
                        err.message,
                        helpers.getResponseAdditionalData(err.response)
                    );
                } else {
                    helpers.defErrorCb({message: err.message});
                }
            };
        }

        function getBatchSuccessCallback(req) {
            return function (data, response) {

                var parsed = parseBatchResponse(data);

                var isGETBatch = !_.isUndefined(data.__batchResponses)
                    && !(data.__batchResponses.length > 0 && data.__batchResponses[0].__changeResponses);

                if (!isGETBatch) {
                    var batchAdditionalData = helpers.getResponseAdditionalData(response);
                    batchAdditionalData.sub = parsed.responseAdditionalData;

                    if (isBatchResponseError(data)) {
                        if (req.errorHandler) {
                            return req.errorHandler(parsed.error, batchAdditionalData);
                        }

                        //return helpers.defErrorCb(parsed);
                        return helpers.defErrorCb({
                            error: parsed.error,
                            details: batchAdditionalData
                        });
                    }

                    //logic for adding __.metadata.etag value for update calls
                    //since update call don't have the response we need to add it manually
                    if (
                        !_.isUndefined(batchAdditionalData.sub) && !_.isUndefined(batchAdditionalData.sub.length > 0)
                    ) {
                        var idx = 0;
                        if (!parsed.data) {
                            parsed.data = [];
                        }
                        _.each(batchAdditionalData.sub, function (singleAdditionalData) {
                            if (req.sub[idx].head.operation === config.CRUD.update) {
                                var returnedObject = {__metadata: {}};
                                var etagVal = helpers.getPropertyValueCaseInsensitive(
                                    singleAdditionalData.headers,
                                    'etag'
                                );
                                if (!_.isUndefined(etagVal)) {
                                    returnedObject.__metadata.etag = etagVal;
                                }
                                // WSi TODO: maybe we should extend if this in an object
                                parsed.data[idx] = returnedObject;
                            }
                            idx++;
                        });
                    }
                } else {

                }
                if (req.successHandler) {
                    if (isGETBatch) {
                        req.successHandler(parsed);
                    } else {
                        req.successHandler(parsed.data, batchAdditionalData);
                    }
                } else {
                    helpers.defSuccessCb(data);
                }
            };
        }

        var isBatchResponseError = function (data) {
            // taken from:
            // http://datajs.codeplex.com/wikipage?title=OData%20Code%20Snippets&referringTitle=Documentation
            var errorsFound = false, i, j;

            for (i = 0; i < data.__batchResponses.length; i++) {
                var batchResponse = data.__batchResponses[i];
                //VV - for create/update/delete requests __changeResponses object is populated
                //if there is no __changeResponses object error message could be found
                //directly on batchResponse object
                if (batchResponse.__changeResponses) {

                    for (j = 0; j < batchResponse.__changeResponses.length; j++) {
                        var changeResponse = batchResponse.__changeResponses[j];
                        if (changeResponse.message) {
                            errorsFound = true;
                        }
                    }
                } else if (batchResponse.message) {
                    errorsFound = true;
                    return errorsFound;
                }
            }
            return errorsFound;
        };

        var parseBatchResponse = function (data) {
            var response;

            if (!data.__batchResponses || !data.__batchResponses.length) {
                return;
            }

            //VV - GET batch response parsing (__changeResponses is not present)
            if (data.__batchResponses && data.__batchResponses.length && !data.__batchResponses[0].__changeResponses) {
                response = [];
                _.each(data.__batchResponses, function (batchResponse, index) {
                    var result;
                    if (batchResponse.data && batchResponse.data.results) {
                        result = batchResponse.data.results;
                    } else if (_.isString(batchResponse.data)) {
                        if (!isNaN(parseInt(batchResponse.data))) {
                            //for the count, we're returning an int, to maintain 'compatibility'
                            result = parseInt(batchResponse.data);
                        } else {
                            result = batchResponse.data;
                        }
                    } else {
                        result = batchResponse.data;
                    }

                    response.push({
                        //result: batchResponse.data ? batchResponse.data.results : undefined,
                        result: result,
                        next: batchResponse.data ? batchResponse.data.__next : undefined,
                        additionalData: helpers.getResponseAdditionalData(
                            batchResponse.message
                                ? batchResponse.response
                                : batchResponse),
                        responseIndex: index,
                        error: batchResponse.message
                    });
                });
                return response;
            }
            var firstResponse = data.__batchResponses[0];

//vvvvvv

            //    //VV - this condition is met only in get batch requests,
            //    // currently there is only get batch request that returns __count and it might
            //    //be needed to be revisited in some different get batch scenario
            //&& !(firstResponse.data && firstResponse.data.__count)
            //){
            //    return response;
            //}

            response = {};
            /** data is empty on update, remove operations, so you might get empty array in result */

            response.data = _.pluck(firstResponse.__changeResponses, 'data');
            var res = firstResponse.__changeResponses
                ? firstResponse.__changeResponses
                : data.__batchResponses;

            response.responseAdditionalData =
                _.map(res, function (item) {
                    var additionalData;
                    if (!_.isUndefined(item.response)) {
                        additionalData = helpers.getResponseAdditionalData(item.response);
                    } else {
                        additionalData = helpers.getResponseAdditionalData(item);
                    }
                    return additionalData;
                });

            /** map error with details */
            response.error = _.unique(
                _.map(firstResponse.__changeResponses, function (item) {
                    var message = item.message,
                        body = (item.response && item.response.body) ? item.response.body : '[]';

                    if (!item.message) {
                        return '';
                    }

                    return 'Message: ' + message + '; Details: ' + body + ';';
                })
            ).join(". ");

            return response;
        };

        function getSingleOdataRequest(req, isBatch) {
            var oReq = {};
            if (!isBatch) {
                oReq.timeoutMS = config.REQUEST_TIMEOUT;
            }

            // Operation findOne is actually never set, find call should be
            // rerouted if the id is present.
            // TODO, not sure if this is the best and cleanest way
            if (req.head.operation === config.CRUD.find && !_.isNullUndef(req.data.id)) {
                req.head.operation = config.CRUD.findOne;
            }

            if (!_.isFunction(odataRequests[req.head.operation])) {
                throw "Unrecognised operation: " + req.head.operation;
            }

            _.extend(oReq, odataRequests[req.head.operation](req, isBatch));

            // TODO apply global query params somewhere

            if (req.head.customOperation === config.CUSTOM_ENDPOINTS.FIND_IMAGE) {
                oReq.headers = helpers.getHeader({
                    "X-Requested-With": "XMLHttpRequest"
                });
            }

            return oReq;
        }

        function getBatchOdataRequest(req) {
            // https://datajs.codeplex.com/wikipage?title=datajs%20OData%20API
            var batchReq = [], changeReq = [], requestData = {__batchRequests: batchReq};
            _.each(req.sub, function (sub) {
                var subreq = getSingleOdataRequest(sub, true);
                if (subreq.method === config.REQ_TYPE_GET) {
                    batchReq.push(subreq);
                } else {
                    changeReq.push(subreq);
                }
            });
            if (changeReq.length > 0) {
                batchReq.push({__changeRequests: changeReq});
            }

            var oReq = {};
            oReq.requestUri = helpers.getRequestURL("$batch");
            oReq.method = helpers.getHTTPMethod(config.REQ_TYPE_POST);
            oReq.headers = helpers.getHeader(config.REQ_TYPE_POST);
            oReq.timeoutMS = config.REQUEST_TIMEOUT;
            oReq.data = requestData;
            return oReq;
        }

        function getCustomOdataRequest(req) {
            var oReq = {},
                boundary,
                data,
                cr = '\r\n';
            var supportedMimeTypes = {
                svg: 'image/svg+html',
                json: 'application/json',
                png: 'image/png',
            };
            var fileType = req.data.fileName.split('.').pop();

            boundary = "----data-persistence-boundary-" + Math.floor(Math.random() * (new Date().getMilliseconds()));

            data = "--" + boundary + cr;
            data += "Content-Disposition: form-data; name=\"annotation\"" + cr;
            data += "content-type: application/json" + cr + cr;
            data += JSON.stringify(req.data.fieldsValues) + cr;
            data += '--' + boundary + cr;
            data += "Content-Disposition: form-data; name=\"uploadfile\"; filename=\"" + req.data.fileName + "\"" + cr;
            data += "Content-Transfer-Encoding: base64" + cr;
            data += "Content-Type: " + supportedMimeTypes[fileType] + cr + cr;
            data += req.data.base64Image + cr + '--' + boundary + "--" + cr;

            oReq.body = data;
            if (req.head.customOperation === config.CUSTOM_ENDPOINTS.CREATE_IMAGE) {
                oReq.requestUri = helpers.getRequestURL(config.ACTION_STORAGE_UPLOAD_URL, true);
            } else if (req.head.customOperation === config.CUSTOM_ENDPOINTS.UPDATE_IMAGE) {
                oReq.requestUri = helpers.getRequestURL(req.head.baseURL(req.data), true);
            }

            oReq.method = helpers.getHTTPMethod(req.head.reqType || config.REQ_TYPE_POST);
            oReq.headers = helpers.getHeader(config.REQ_TYPE_PUT);
            oReq.headers["Content-Type"] = 'multipart/form-data; boundary=' + boundary;

            return oReq;
        }

        function sendSingleReq(req) {
            if (req.test) {
                req.test(getSingleOdataRequest(req.sub[0]));
            } else if (req.sub[0].head.customOperation === config.CUSTOM_ENDPOINTS.FIND_IMAGE || req.sub[0].head.customOperation === config.CUSTOM_ENDPOINTS.REMOVE_IMAGE) {
                oData.request(
                    getSingleOdataRequest(req.sub[0], false),
                    getSingleSuccessCallback(req, req.sub[0]),
                    getSingleErrorCallback(req),
                    oData.batchHandler
                );
            } else {
                oData.request(
                    getSingleOdataRequest(req.sub[0], false),
                    getSingleSuccessCallback(req, req.sub[0]),
                    getSingleErrorCallback(req)
                );
            }
        }

        function sendBatchReq(req) {
            if (req.test) {
                req.test(getBatchOdataRequest(req));
            } else {
                oData.request(
                    getBatchOdataRequest(req),
                    getBatchSuccessCallback(req),
                    getSingleErrorCallback(req),
                    oData.batchHandler
                );
            }
        }

        function sendCustomReq(req) {
            if (req.test) {
                req.test(getCustomOdataRequest(req.sub[0], false));
            } else {
                oData.request(
                    getCustomOdataRequest(req.sub[0]),
                    getSingleSuccessCallback(req, req.sub[0]),
                    getSingleErrorCallback(req),
                    oData.batchHandler
                );
            }
        }

        oDataTransport.run = function (req) {
            if (!req || !_.isObject(req)) {
                throw ("oDataTransport: run: request is not an object");
            }

            if (!req.sub && !_.isArray(req.sub) &&
                req.sub.length < 1 &&
                _.every(req.sub, function (sub) {
                    return sub.head && sub.data;
                })
            ) {
                throw "odata.js: Invalid request, object doesn't have required properties.";
            }

            //check if number of items for batch request is larger than allowed value
            if (req.sub.length > config.SETTINGS.AppSettings.MaxChangesetCount) {
                //Number of passed items for batch request is greater than maximum allowed (allowed {0})
                errMan.throwError('API_ERR_TRANSPORT_1', [config.SETTINGS.AppSettings.MaxChangesetCount]);
            }

            // TODO print requests to console

            if (req.sub.length === 1) {

                if (req.sub[0].head.isCustomHead) {
                    sendCustomReq(req);
                } else {
                    sendSingleReq(req);
                }

            } else {
                sendBatchReq(req);
            }
        };

        return oDataTransport.init();

    });

define(
    'ajaxTransport', ['underscorenc', 'transportInterface', 'helpers', 'config', 'oDataService'],

    function (_, transportInterface, helpers, config, oData) {
        var ajaxTransport = {
            init: function () {
                //set all mandatory ajax params here

                return _.extend({}, transportInterface, this);
            }
        };

        ajaxTransport.read = function (request, successHandler, errorHandler) {
            var headers;
            if (!request) {
                throw new Error("Ajax.read: request object must be defined");
            }

            if (!request.headers) {
                headers = helpers.getHeader(helpers.getHTTPMethod(request.type || config.REQ_TYPE_POST));
                headers["Content-Type"] = 'application/json';//'application/x-www-form-urlencoded; charset=UTF-8';
            } else {
                headers = request.headers;
            }
            if (!request.url) {
                throw new Error("Ajax.read: request.url is required");
            }

            var body;

            //stringify the body of the request only if content type is JSON
            if (headers["Content-Type"] === 'application/json') {
                body = JSON.stringify(request.data);
            } else {
                body = request.data;
            }

            oData.defaultHttpClient.request(
                {
                    method: helpers.getHTTPMethod(request.type || config.REQ_TYPE_POST),
                    requestUri: request.url,
                    //body: this.jqueryParam(data, true),
                    body: body,
                    headers: headers,
                    timeoutMS: request.timeoutMS

                },
                function (data) {
                    var responseAdditionalData,
                        regEx = /(application\/json)/i;
                    if (successHandler) {
                        if (data) {
                            responseAdditionalData = helpers.getAjaxResponseAdditionalData(data);

                            if (regEx.test(data.headers["Content-Type"])) {
                                //if content type is json, parse the body of the response
                                successHandler(JSON.parse(data.body), responseAdditionalData);
                            } else {
                                //we cannot parse non-json body (html)
                                successHandler(data.body, responseAdditionalData);
                            }
                        } else {
                            helpers.consoleLog("No data received!");
                        }

                    } else {
                        helpers.consoleLog("success");
                        //helpers.consoleLog(helpers.debugParseResults(data));
                    }
                },
                function (jqXHR, testStatus) {
                    if (errorHandler) {
                        var responseAdditionalData = helpers.getAjaxResponseAdditionalData(jqXHR.response);
                        errorHandler(jqXHR.message, responseAdditionalData);
                    } else {
                        helpers.consoleLog("testStatus: " + testStatus + ". error: " + jqXHR.message);
                    }
                });
        };

        ajaxTransport.find = function (request) {

            var requestURL = helpers.getRequestURL(request.baseURL({}), '');

            if (request.operation === config.CRUD.custom) {
                ajaxTransport.read(requestURL, request.fieldsValues, config.REQ_TYPE_GET, request.successHandler, request.errorHandler);
            } else {
                ajaxTransport.read(request.baseURL, request.fieldsValues, config.REQ_TYPE_POST, request.successHandler, request.errorHandler);
            }

        };

        ajaxTransport.run = function (request) {
            if (!request || !_.isObject(request)) {
                throw ("ajax: run: request is not an object");
            }

            if (!request.operation || !request.baseURL) {
                throw ("ajax: run: specify baseUrl and operation");
            }

            if (_.isUndefined(config.CRUD[request.operation])) {
                throw ("ajax: run: undefined operation " + config.CRUD[request.operation]);
            }

            //var tail = helpers.getAjaxTail(request);

            if (request.customOperation) {
                ajaxTransport[request.customOperation.base](request);
            } else {
                ajaxTransport[request.operation](request);
            }

        };

        ajaxTransport.custom = function (req) {
            ajaxTransport[req.customOperation.base](req);
        };

        return ajaxTransport.init();
    });
define(
    'transportManager', ['underscorenc', 'oDataTransport', 'ajaxTransport', 'config'],

    function (_, oDataTransport, ajaxTransport, config) {

        var TRANSPORTS = {},
            isSet = false;

        var transportManager = {
            activeTransport: null,

            init: function () {
                if (isSet) {
                    return this;
                }

                //TODO: ugly? ugly! ugly...
                TRANSPORTS[config.TRANSPORT_NAMES.AJAX] = ajaxTransport;
                TRANSPORTS[config.TRANSPORT_NAMES.ODATA] = oDataTransport;

                isSet = true;

                return this;
            },

            use: function (name) {
                if (!TRANSPORTS[name]) {
                    throw ("transportManager - trying to use bad transport " + name);
                }

                if (_.isEqual(this.activeTransport, TRANSPORTS[name])) {
                    return this.activeTransport;
                }

                this.activeTransport = TRANSPORTS[name];
                this.activeTransport.name = name;

                return this.activeTransport;
            }
        };

        return transportManager.init();
    });
/*{
 successHandler: function,
 errorHandler: function,
 queryParams: Object as in subRequests but global,
 test: function

 sub: [{
 head: {
 operation: config.CRUD[],
 customOperation: config.CRUD[],
 entity: config.ENTITY,
 baseURL: Function,
 isWebApi: Boolean, if false it will append the SERVICE to the URL
 queryParams: Object representing key/value pairs that will be converted into query string,
 etags: String,
 isMain: Boolean,
 parseDates: Boolean
 },

 // data for find
 data: {
 fields: Array of strings representing fields,
 filters: Object that will be converted to string,
 count: Boolean,
 inlineCount: Boolean,
 limitFrom: Number,
 limitCount: Number,
 orderBy: Array of strings representing fields
 orderDesc: Boolean,
 customFilterString: String,
 next: String,
 expandedForFilters: Object - legacy
 expandedForFields: Array of strings - legacy
 expandedFor: Array of strings representing entity names - legacy
 expandFor: Array of strings as above but new
 },

 // data for findOne
 data: {
 id: Number representing id of a record
 parseDates: Boolean,
 fields: Array of strings representing fields
 customFilterString: String,
 expandedForFilters: Object - legacy
 expandedForFields: Array of strings - legacy
 expandedFor: Array of strings representing entity names - legacy
 expandFor: Array of strings as above but new
 },

 // data for delete
 data: {
 id: Number representing record to be deleted
 }

 // data for create
 data: {
 fieldsValues: Object representing fieldsValues,
 foreignKeyRef: Object from config.SETTINGS.Metadata[Entity].navigationProperties
 }

 // data for update
 data: {
 id: Number representing record to be updated,
 fieldsValues: Object representing fieldsValues
 }
 }]
 }*/

define(
    'requestManager', ['underscorenc', 'config'],

    function (_, config) {

        /*  var CONSTS = {
         GLOBAL            : 'GLOBAL',
         SUB               : 'SUB'
         };*/

        /*var TYPES = {
         MAIN              : 'MAIN',
         REGULAR           : 'REGULAR'
         };*/

        var PROPS = {
            // global
            SUCCESS_HANDLER: 'successHandler',
            ERROR_HANDLER: 'errorHandler',
            TEST: 'test',

            // head
            OPERATION: 'operation',
            CUSTOM_OPERATION: 'customOperation',
            REQ_TYPE: 'reqType',
            ENTITY: 'entity',
            IS_MAIN: 'isMain',
            BASE_URL: 'baseURL',
            IS_WEBAPI: 'isWebApi',
            IS_CUSTOM_HEAD: 'isCustomHead',
            CONFLICTING_METHOD: 'conflictingMethod',
            QUERY_PARAMS: 'queryParams',
            ETAGS: 'etags',
            PARSE_DATES: 'parseDates',

            // data
            ID: 'id',
            FIELDS: 'fields',
            FIELDS_VALUES: 'fieldsValues',
            FILTERS: 'filters',
            COUNT: 'count',
            INLINE_COUNT: 'inlineCount',
            LIMIT_FROM: 'limitFrom',
            LIMIT_COUNT: 'limitCount',
            ORDER_BY: 'orderBy',
            ORDER_DESC: 'orderDesc',
            CUSTOM_FILTER_STRING: 'customFilterString',
            NEXT: 'next',
            FOREIGN_KEY_REF: 'foreignKeyRef',
            EXPANDED_FOR: 'expandedFor',
            EXPAND_FOR: 'expandFor',
            BASE_64_IMAGE: 'base64Image',
            FILE_NAME: 'fileName',
        };

        var PROPLOC = {
            GLOBALS: 'globals',
            HEAD: 'head',
            DATA: 'data'
        };

        var request = {
            successHandler: null,
            errorHandler: null,
            sub: []
        };

        var templates = {};

        templates[PROPLOC.GLOBALS] = {
            successHandler: {createOnly: true, required: true, type: _.isFunction},
            errorHandler: {createOnly: true, required: true, type: _.isFunction},
            //Object representing key/value pairs that will be converted into query string,
            queryParams: {type: _.isObjectNotArray, defIn: _.values(config.QUERY_PARAMS)},
            test: {type: _.isFunction} //function(url, headers, body)
        };

        // sub properties located in head
        templates[PROPLOC.HEAD] = {
            operation: {createOnly: true, required: true, type: _.isString, defIn: _.values(config.CRUD)},
            customOperation: {type: _.isString}, //config.CRUD[]
            entity: {
                required: true,
                type: _.isString,
                defIn: _.union(
                    _.map(config.COLLECTIONS, function (i) {
                        return i.nameUppercase;
                    }),
                    ['custom']
                )
            },
            //type            : {required: true, type: _.isString, defIn: _.values(TYPES)}, //request.TYPES,
            isMain: {required: true, type: _.isBoolean},
            baseURL: {required: true, type: _.isFunction}, //String,
            isWebApi: {type: _.isBoolean},
            isCustomHead: {type: _.isBoolean},
            conflictingMethod: {type: _.isString},
            reqType: {type: _.isString}, //String
            queryParams: {type: _.isObjectNotArray, defIn: _.values(config.QUERY_PARAMS)}, //Object representing key/value pairs
            //that will be converted into query string,
            etags: {type: _.isString},
            parseDates: {type: _.isBoolean}
        };

        // sub properties located in data for each type of operation
        templates[PROPLOC.DATA] = {};
        templates[PROPLOC.DATA][config.CRUD.find] = {
            fields: {type: _.isArrayOfStrings}, //Array of strings representing fields,
            filters: {type: _.isObjectNotArray}, //Object that will be converted to string,
            count: {type: _.isBoolean}, // Boolean,
            inlineCount: {type: _.isBoolean}, //Boolean,
            limitFrom: {type: _.isNumber}, //Number,
            limitCount: {type: _.isNumber}, //Number,
            orderBy: {type: _.isArrayOfStrings}, //Array of strings representing fields
            orderDesc: {type: _.isBoolean}, //Boolean,
            //TODO custom filter and function strings appear to be the same thing duplicated by mistake?
            customFilterString: {type: _.isString}, //String,
            customFunctionString: {type: _.isString}, //String,
            next: {type: _.isString}, //String,
            expandedForFilters: {type: _.isObject}, //Object - legacy
            expandedForFields: {type: _.isArrayOfStrings}, // legacy
            expandedFor: {type: _.isArrayOfStrings}, //Array of strings representing entity names - legacy
            expandFor: {type: _.isArrayOfStrings} //Array of strings representing entity names
        };

        templates[PROPLOC.DATA][config.CRUD.findOne] = {
            id: {required: true, type: _.isNumber}, //Number representing id of a record
            fields: {type: _.isArrayOfStrings}, //Array of strings representing fields
            //TODO custom filter and function strings appear to be the same thing duplicated by mistake?
            customFilterString: {type: _.isString}, //String,
            customFunctionString: {type: _.isString}, //String,
            expandedForFilters: {type: _.isObject}, //Object - legacy
            expandedForFields: {type: _.isArrayOfStrings}, // legacy
            expandedFor: {type: _.isArrayOfStrings}, //Array of strings representing entity names - legacy
            expandFor: {type: _.isArrayOfStrings} //Array of strings representing entity names
        };

        templates[PROPLOC.DATA][config.CRUD.remove] = {
            id: {required: true, type: _.isNumber} //Number representing id of a record
        };

        templates[PROPLOC.DATA][config.CRUD.create] = {
            fieldsValues: {required: true, type: _.isObjectNotArray}, //Object representing fieldsValues
            foreignKeyRef: {type: _.isObjectNotArray}, // defIn config.SETTINGS.Metadata[Entity].navigationProperties,
            base64Image: {type: _.isString}, //String
            fileName: {type: _.isString} //String
        };

        templates[PROPLOC.DATA][config.CRUD.update] = {
            id: {required: true, type: _.isNumber}, //Number representing id of a record
            fieldsValues: {required: true, type: _.isObjectNotArray}, //Object representing fieldsValues,
            base64Image: {type: _.isString}, //String
            fileName: {type: _.isString}
        };

        //////////////////////////////////////////////////////////////////////////////////////
        //
        // PRIVATE API
        //
        //////////////////////////////////////////////////////////////////////////////////////

        function resetRequest() {
            request = {
                successHandler: null,
                errorHandler: null,
                sub: []
            };
        }

        function isOperationValid() {
            return !_.contains(_.values(config.CRUD));
        }

        function validateOperation(operation) {
            if (!isOperationValid(operation)) {
                throw "RequestManager: Invalid Operation: " + operation + ".";
            }
        }

        // prop might be in more than one loc so the fun returns array
        // inSub: Boolean - if true it skips check in template.globals
        function getPropertyLocation(key, operation, inSub) {
            validateOperation(operation);
            var loc = [];
            if (!inSub && templates[PROPLOC.GLOBALS][key]) {
                loc.push(PROPLOC.GLOBALS);
            }
            if (templates[PROPLOC.HEAD][key]) {
                loc.push(PROPLOC.HEAD);
            }
            if (templates[PROPLOC.DATA][operation][key]) {
                loc.push(PROPLOC.DATA);
            }
            return loc;
        }

        function isPropertyInOperation(key, operation) {
            return getPropertyLocation(key, operation).length > 0;
        }

        function validatePropertyInOperation(key, operation) {
            if (!isPropertyInOperation(key, operation)) {
                throw "RequestManager: Operation " + operation + " doesn't support property " + key + ".";
            }
        }

        function getPropertyDefinition(key, operation) {
            var loc = getPropertyLocation(key, operation), def;
            if (loc.length > 0) {
                if (loc[0] === PROPLOC.DATA) {
                    def = templates[PROPLOC.DATA][operation][key];
                } else {
                    def = templates[loc[0]][key];
                }
            }
            return def;
        }

        // REDUNDANT?
        function setGlobalProperty(key, val) {
            var def = templates.globals[key];

            // is the subrequest operation supporting this property
            if (!def) {
                throw "ReqMan.setGlobalProperty: operation " + getSubProperty(idx, PROPS.OPERATION) +
                " doesn't support " + key + ".";
            }

            // now it's time to check if value is correct
            if (!def.type(val)) {
                throw "ReqMan.setGlobalProperty: value " + val + " for key " + key +
                " doesn't meet type requirements.";
            }

            // if definition has list of allowed values, check if val is one of them
            if (def.defIn) {
                var vals;
                if (_.isString(val) || _.isNumber(val)) {
                    vals = [val];
                }
                if (_.isObject(val)) {
                    vals = _.keys(val);
                }
                if (!_.every(vals,
                        function (v) {
                            return _.contains(def.defIn, v);
                        })) {
                    throw "ReqMan.setGlobalProperty: value " + vals + " for key " + key +
                    " aren't any of the allowed values: " + def.defIn + ".";
                }
            }
            // if the value is object then instead of overwriting it we _.default's it
            val = (_.isObjectNotArray(request[key])) ? _.defaults(request[key], val) : val;
            // if the value is array then just add more to the current array keeping items unique
            val = (_.isArray(request[key])) ? _.union(request[key], val) : val;
            request[key] = val;
        }

        // Updates all subrequest properties with new values
        // If a subrequest already had a value for this key, it will be _.default-ed
        // (as per the original Vitaliy's implementation).
        // Params:
        //  - operationsFilter: String or [String] representing CRUD definitions in config
        //    if the array is empty, it will update all records.
        //  - key: String
        //  - value: Object
        function updateSubRequests(filter, key, value) {

            // // if value is empty, it means that we don't want to use operation filter
            // // and want to update all subs
            // if (_.isNullUndef(value)) {
            //   value = key;
            //   key = operationsFilter;
            //   operationsFilter = [];
            // }

            // // empty string as operatiosFilter will become empty array
            // operationsFilter = _.isString(operationsFilter) && operationsFilter.length === 0 ?
            //                   [] : operationsFilter;
            // // string as operationsFilter will become [String]
            // operationsFilter = _.isString(operationsFilter) ? [operationsFilter] : operationsFilter;
            // // are there any filters passed that aren't defined in config?
            // var diff = _.difference(operationsFilter, _.values(config.CRUD));
            // if (diff.length > 0) {
            //   throw "ReqMan.updateSubRequests: Invalid operation in the filter: " + diff;
            // }
            // // going through all subrequests
            // for (var i = 0, len = request.sub.length; i < len; i++) {
            //   // if operationsFilter is empty it means we update all operations if the support the prop
            //   // otherwise we only update the subs that match the filter specified
            //   if (operationsFilter.length === 0 ||
            //       _.contains(operationsFilter, getSubProperty(i, PROPS.OPERATION))) {
            //     // set the value for the property for this operation
            //     setSubProperty(i, key, value);
            //   }
            // }
            var matchedSubs = getSubsIdxsMatchingFilter(filter);
            for (var i = 0, len = matchedSubs.length; i < len; i++) {
                setSubProperty(matchedSubs[i], key, value);
            }
        }

        function getSubsIdxsMatchingFilter(filter) {
            var ret = [];
            // we push each requests matching filter to ret array
            for (var i = 0, len = request.sub.length; i < len; i++) {
                if (_.isNull(filter) || isSubMatchingFilter(filter, i)) {
                    ret.push(i);
                }
            }
            return ret;
        }

        // WSi TODO 20131014: this function definately requires some refactoring...
        // Currently supporting only subrequest properties that are:
        // - strings: filter is string or array of strings
        // - booleans
        // - objects: filter is object (exact match) or array of strings (checks if props
        // represented as the names in the array aren't undefined)
        function isSubMatchingFilter(filter, subIdx) {
            return _.every(filter, function (v, k) {
                var propInSub = getSubProperty(subIdx, k);
                // first check if the request has property from filter populated
                if (!_.isNullUndef(propInSub)) {
                    var check = true;

                    // if the prop in the req is string then in the filter it could be sting or
                    // array of strings
                    // use case:
                    // filter: {operation: ['find', 'create']}
                    // sub[i].head.operation: 'find'
                    if (_.isString(propInSub)) {
                        if (!_.isString(v) && !_.isArrayOfStrings(v)) {
                            throw "ReqMan.isSubMatchingFilter: Type mismatch between value in " +
                            "surequest and value in the filter for key: " + k + ".";
                        }
                        var filterVals = _.isString(v) ? [v] : v;
                        check &= _.contains(filterVals, propInSub);
                    } else if (_.isBoolean(propInSub)) {
                        if (!_.isBoolean(v)) {
                            throw "ReqMan.isSubMatchingFilter: Type mismatch between value in " +
                            "surequest and value in the filter for key: " + k + ".";
                        }
                        check &= propInSub === v;
                    } else if (_.isObject(propInSub)) {
                        if (!_.isArray(v) && !_.isObject(v)) {
                            throw "ReqMan.isSubMatchingFilter: Type mismatch between value in " +
                            "surequest and value in the filter for key: " + k + ".";
                        }
                        // checking if any of the names in the array is represented by keys in the object
                        if (_.isArray(v)) {
                            check &= _.every(v, function () {
                                return !_.isUndefined(propInSub[v]);
                            });
                        } else if (_.isObject(v)) {
                            check &= _.isEqual(v, propInSub);
                        }
                    } else {
                        throw "ReqMan.isSubMatchingFilter: Only properties that are strings " +
                        "or booleans are currently supported.";
                    }
                    return check;
                }
                return false;
            });
        }

        function getSubProperty(idx, key) {
            // is there subrequest with this index
            if (!request.sub[idx]) {
                throw "ReqMan.getSubProperty: there is no subrequest with index " + idx + ".";
            }
            return request.sub[idx][PROPLOC.HEAD][key] || request.sub[idx][PROPLOC.DATA][key];
        }

        function getGlobalProperty(key) {
            if (!_.contains(_.keys(templates[PROPLOC.GLOBALS]), key)) {
                throw "ReqMan.getGlobalProperty: unsupported property " + key + ".";
            }
            return request[key];
        }

        // if value for the property already exists and is an object, _.default is applied
        function setSubProperty(idx, key, val) {
            // is there subrequest with this index
            if (!request.sub[idx]) {
                throw "ReqMan.setSubProperty: there is no subrequest with index " + idx + ".";
            }
            // is the subrequest set to any operation
            var operation = getSubProperty(idx, PROPS.OPERATION);
            if (!operation && key === PROPS.OPERATION) {
                operation = val;
            }
            if (!operation) {
                throw "ReqMan.setSubProperty: subrequest with index " + idx +
                " doesn't have operation set.";
            }

            // does the operation support this property
            validatePropertyInOperation(key, operation);

            // get the location and definition for the property in the context of the chosen operation
            var loc = getPropertyLocation(key, operation, true)[0];
            var def = getPropertyDefinition(key, operation);

            // get the current value if it's available
            var curVal = getSubProperty(idx, key, val);

            if (def.createOnly && !_.isUndefined(curVal)) {
                throw "ReqMan.setSubProperty: key " + key +
                " can't be set again for " + PROPS.OPERATION + ".";
            }

            // subrequest exists, and operation supports property
            // now it's time to check if value is correct
            if (!def.type(val)) {
                throw "ReqMan.setSubProperty: value " + val + " for key " + key +
                " doesn't meet type requirements.";
            }

            // if definition has list of allowed values, check if val is one of them
            if (def.defIn) {
                var vals;
                if (_.isString(val) || _.isNumber(val)) {
                    vals = [val];
                }
                if (_.isObjectNotArray(val)) {
                    vals = _.keys(val);
                }
                if (!_.every(vals,
                        function (v) {
                            return _.contains(def.defIn, v);
                        })) {
                    throw "ReqMan.setSubProperty: value " + vals + " for key " + key +
                    " aren't any of the allowed values: " + def.defIn + ".";
                }
            }

            // if the value is object then instead of overwriting it we _.default's it
            if (_.isObjectNotArray(curVal) && !_.isObjectNotArray(val)) {
                throw "ReqMan.setSubProperty: if property " + key +
                " is object then the value should also be object but is: " + typeof val + ".";
            }
            val = (_.isObjectNotArray(curVal)) ? _.defaults(curVal, val) : val;
            // if the value is array then just add more to the current array keeping items unique
            if (_.isArray(curVal) && !_.isArray(val)) {
                val = [val];
            }
            val = (_.isArray(curVal)) ? _.union(curVal, val) : val;

            request.sub[idx][loc][key] = val;
        }

        function isMainRequestSet() {
            return _.getFirstIndex(request.sub, function (item) {
                return item.head.isMain;
            });
        }

        function getMainRequestCount() {
            return request.sub.filter(function (s) {
                return s.head.isMain;
            }).length;
        }

        //////////////////////////////////////////////////////////////////////////////////////
        //
        // PUBLIC API
        //
        //////////////////////////////////////////////////////////////////////////////////////

        var requestManager = {
            //TYPES: TYPES,
            PROPS: PROPS,
            exportRequest: function (orderArray) {
                // TODO validation if all required properties are set

                var returnRequest = _.deepClone(request);
                if (orderArray && _.isArray(orderArray)
                    && returnRequest.sub.length >= orderArray.length) {

                    if (orderArray.length === 0) {
                        throw "passed orderArray param is empty, orderArray must have items " +
                        "in order to reorder the subrequests";
                    }

                    returnRequest.sub = _.reorderArray(orderArray, returnRequest.sub);
                }
                return returnRequest;
            },
            _reset: function () {
                resetRequest();
            },
            // sub requests:
            getLen: function () {
                return request.sub.length;
            },
            getLastIdx: function () {
                var idx = this.getLen() - 1;
                return idx < 0 ? null : idx;
            },
            createSub: function (operation, isMain, entityName) {
                var idx = request.sub.push({
                    head: {}, data: {}
                });
                idx--;
                setSubProperty(idx, PROPS.OPERATION, operation);
                // TODO maybe we could make validation that only one sub in a request may be MAIN
                setSubProperty(idx, PROPS.IS_MAIN, isMain);
                // TODO setSubProperty should be checking if entity is one of defined in the config
                setSubProperty(idx, PROPS.ENTITY, entityName);
                return idx;
            },
            setProp: function (idx, key, value) {
                if (!_.isNumber(idx)) {
                    value = key;
                    key = idx;
                    setGlobalProperty(key, value);
                } else {
                    setSubProperty(idx, key, value);
                }
            },
            getProp: function (idx, key) {
                if (_.isNumber(idx)) {
                    return getSubProperty(idx, key);
                }
                return getGlobalProperty(idx);
            },

            // Updates all subrequests that are matching the filter.
            //
            // The filter is an object with properties representing
            // reqMan.PROPS and values representing values.
            // If the reqMan.PROPS property is:
            // - string: then the filter value could be string or array of strings
            // - boolean: then the filter value could be boolean
            // - object: then the filtet could be an object or array of strings
            // - no other data types are supported at the moment
            // If the filter is not specified (only two values are passed) then all subrequests
            // will be updated.
            // Examples:
            // 1. Update all subrequest with operation find with IS_WEBAPI = true
            //    updateSubs({operation: config.CRUD.find}, reqMan.PROPS.IS_WEBAPI, true);
            // 2. Update all subs with operation find and fineOne and entity Annotation
            //    updateSubs({
            //        operation: [config.CRUD.find, config.CRUD.findOne],
            //        entity: 'Annotations'
            //      }, reqMan.PROPS.IS_WEBAPI, true);
            // 3. Update all subs
            //    updateSubs(reqMan.PROPS.IS_WEBAPI, true);
            // 4. Update subs when queryParam user_id is populated with some non undefined value
            //    updateSubs({queryParams: ['user_ids']}, reqMan.PROPS.IS_WEBAPI, true);
            // 5. Update subs when queryParam user_id is is exactly specified valuethanks
            //    updateSubs({queryParams: {user_ids}}, reqMan.PROPS.IS_WEBAPI, true);
            updateSubs: function (filterObject, key, value) {
                if (_.isUndefined(value)) {
                    updateSubRequests(null, filterObject, key);
                } else {
                    updateSubRequests(filterObject, key, value);
                }
            },
            // Returns array of indexes of all subs matching the filter.
            //
            // Filter works exactly like in updateSubs method.
            getSubIndexesMatchingFilter: function (filterObject) {
                return getSubsIdxsMatchingFilter(filterObject);
            },
            isFind: function (idx) {
                var val = getSubProperty(idx, PROPS.OPERATION);
                return val === config.CRUD.find;
            },
            isFindOne: function (idx) {
                var val = getSubProperty(idx, PROPS.OPERATION);
                return val === config.CRUD.findOne;
            },
            isFindFamily: function (idx) {
                var val = getSubProperty(idx, PROPS.OPERATION);
                return val === config.CRUD.find || val === config.CRUD.findOne;
            },
            isUpdate: function (idx) {
                return getSubProperty(idx, PROPS.OPERATION) === config.CRUD.update;
            },
            isCreate: function (idx) {
                return getSubProperty(idx, PROPS.OPERATION) === config.CRUD.create;
            },
            isDelete: function (idx) {
                return getSubProperty(idx, PROPS.OPERATION) === config.CRUD.remove;
            },

            // Check if subrequest if of specific operation type.
            // Types argument could be a string or array of strings.
            // If idx in not specified, check will be done for all subs.
            areSubsOfTypes: function (types, idx) {
                types = _.isString(types) ? [types] : types;
                if (!_.every(types,
                        function (item) {
                            return _.contains(_.values(config.CRUD), item);
                        })) {
                    throw "ReqMan.areSubsOfType: One of the types " + types + " are not " +
                    "included in config.CRUD definition.";
                }
                // if idx is not provided then the user wants to check all subs
                if (_.isNullUndef(idx)) {
                    return _.reduce(_.range(
                        this.getLen()),
                        function (memo, i) {
                            return memo && _.contains(types, getSubProperty(i, PROPS.OPERATION));
                        },
                        true
                    );
                }

                return _.contains(types, getSubProperty(idx, PROPS.OPERATION));
            },
            isMainSet: function () {
                return isMainRequestSet();
            },
            getCountOfMainRequests: function () {
                return getMainRequestCount();
            }
        };
        return requestManager;
    });
define(
    'queryApiValidators', ['underscorenc', 'config', 'errorManager', 'helpers', 'requestManager'],
    function (_, config, errorManager, helpers, reqMan) {

        var queryApiValidators = {};

        queryApiValidators.validateRequest = function (requestObj) {
            if (config.SUPPRESS_VALIDATION) {
                return;
            }

            if (requestObj && requestObj.sub && requestObj.sub.length > 0) {
                _.each(requestObj.sub, function (subrequest) {
                    if (subrequest.head && subrequest.head.operation) {
                        if (subrequest.head.operation === config.CRUD.create) {
                            queryApiValidators.validateCreate(subrequest);
                        } else if (subrequest.head.operation === config.CRUD.update) {
                            queryApiValidators.validateUpdate(subrequest);
                        }
                    }
                });
            }
        };

        var checkReadonly = function (fields, readonlyFields, subReq) {
            //check if fields for sending are contained in readonly fields

            //if foreignKeyRef is present (dependent items are present)
            //remove key field from parent object from readonly fields validation
            if (subReq.data.foreignKeyRef) {
                readonlyFields = _.reject(readonlyFields, function (field) {
                    return field === subReq.data.foreignKeyRef.field;
                });
            }

            var matchingFields = _.intersection(readonlyFields, fields);
            //removing key field (annotation_id for instance) for validating update method in batch calls
            //CI 20140925 added isMain check to filter our only batch calls
            if (subReq.head.operation === config.CRUD.update &&
                subReq.head.isMain === false) {
                matchingFields = _.without(
                    matchingFields,
                    config.SETTINGS.Metadata[
                        helpers.tempAndUglyGetEntityName(subReq.head.entity)
                        ].keyField
                );
            }
            if (matchingFields && matchingFields.length > 0) {
                //{0}: {1} field is not allowed in {2} operation
                errorManager.throwError('API_ERR_QUERY_API_11',
                    [subReq.head.entity, matchingFields, subReq.head.operation]);
            }
        };

        var checkSettableOnCreateOnly = function (fields, settableOnCreateOnlyFields, subReq) {
            //check if fields for sending are contained in settable on create only fields
            var matchingFields = _.intersection(settableOnCreateOnlyFields, fields);
            if (matchingFields && matchingFields.length > 0) {
                //{0}: {1} field is not allowed in {2} operation
                errorManager.throwError('API_ERR_QUERY_API_11',
                    [subReq.head.entity, matchingFields, subReq.head.operation]);
            }
        };

        queryApiValidators.validateCreate = function (subReq) {

            var readonlyFields;
            //check read only fields
            if (config.SETTINGS.ReadOnlyFields && config.SETTINGS.ReadOnlyFields[subReq.head.entity]) {
                //get readonly fields for selected entity
                readonlyFields = config.SETTINGS.ReadOnlyFields[subReq.head.entity];
                ////get field names for create
                var fieldsForCreate = _.keys(subReq.data.fieldsValues);
                checkReadonly(fieldsForCreate, readonlyFields, subReq);
            }

            this.checkInputData(subReq);
            this.checkAnnotationTypeIds(subReq);
            var requiredFields = config.SETTINGS.RequiredFields[subReq.head.entity];
            //if foreignKeyRef is present (dependent items are present)
            //remove key field from parent object from required fields validation
            if (subReq.data.foreignKeyRef) {
                requiredFields = _.reject(requiredFields, function (field) {
                    return field === subReq.data.foreignKeyRef.field;
                });
            }
            if (requiredFields) {
                var missingRequiredFields = _.difference(requiredFields, _.keys(subReq.data.fieldsValues));
                if (missingRequiredFields.length > 0) {
                    //fields {0} for object {1} are required
                    errorManager.throwError('API_ERR_QUERY_API_17',
                        [missingRequiredFields, subReq.head.entity]);
                }
            }
        };

        queryApiValidators.validateUpdate = function (subReq) {
            //IC 20140926 - added isEmpty check for case like update(123)....
            if (_.isUndefined(subReq) ||
                _.isUndefined(subReq.data) ||
                (  _.isUndefined(subReq.data.fieldsValues) ||
                    _.isEmpty(subReq.data.fieldsValues)
                ) && subReq.head.customOperation !== config.CUSTOM_ENDPOINTS.UPDATE_IMAGE
            ) {
                //{0}: method {1} expects {2}
                errorManager.throwError('API_ERR_QUERY_API_4',
                    [subReq.head.entity, subReq.head.operation, 'fieldsValues{Object} or forVisibility (with visibilityInclude, or visibilityExclude or both)']);
            }

            //check read only fields
            if (config.SETTINGS.ReadOnlyFields && config.SETTINGS.ReadOnlyFields[subReq.head.entity]) {
                //get readonly fields for selected entity
                var readonlyFields = config.SETTINGS.ReadOnlyFields[subReq.head.entity];
                //get readonly fields for selected entity
                var settableOnCreateOnly = config.SETTINGS.FieldsSettableOnCreationOnly[subReq.head.entity];
                ////get field names for create
                var fieldsForUpdate = _.keys(subReq.data.fieldsValues);
                checkReadonly(fieldsForUpdate, readonlyFields, subReq);
                checkSettableOnCreateOnly(fieldsForUpdate, settableOnCreateOnly, subReq);
            }
            this.checkInputData(subReq);
        };

        queryApiValidators.checkInputData = function (subReq) {

            var typeValidators = {
                'function': _.isFunction,
                'number': _.isNumber,
                'array': _.isArray,
                'object': _.isObject,
                'string': _.isString,
                'boolean': _.isBoolean,
                'undefined': _.isUndefined,
                'null': _.isNull
            };

            // WSi: commenting this out as this doesn't work
            // var infoData = config.SETTINGS.Metadata[subReq.head.entity.entity].fields;
            // WSi: made this and it works but toLowerCase is nasty
            //var infoData = config.SETTINGS.Metadata[config.COLLECTIONS[subReq.head.entity.substr(0, 1).toLowerCase() + subReq.head.entity.substr(1)].entity].fields;
            var infoData = helpers.getMetadataByEntityName(subReq.head.entity).fields;
            //var infoData = config.SETTINGS.Metadata[config.COLLECTIONS[subReq.head.entity.toLowerCase()].entity].fields;

            //if (_.isUndefined(objectToSend) || _.isEmpty(objectToSend)) {
            if (_.isUndefined(subReq)) {
                // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                errorManager.throwError('API_ERR_QUERY_API_3',
                    [subReq.head.entity, '', subReq.head.operation, 'object', 'undefined']);
            }
            //if foreignKeyRef is present (dependent items are present)
            //remove key field from parent object from validation
            if (subReq.data.foreignKeyRef) {
                infoData = _.reject(infoData, function (field) {
                    return field.name === subReq.data.foreignKeyRef.field;
                });
                //subReq.infoData = { fields: dependentInfoDataFields };
            }

            if (infoData && subReq.data.fieldsValues) {


                //iterate through fields metadata exposed by server
                _.each(infoData, function (field) {

                    //iterate through fields of object that needs to be sent
                    _.each(subReq.data.fieldsValues, function (val, key) {

                        //undefined check
                        if (_.isUndefined(val)) {
                            // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                            errorManager.throwError('API_ERR_QUERY_API_3',
                                //["undefined", key, subReq.head.entity]);
                                [subReq.head.entity, key, subReq.head.operation, 'of proper type', 'undefined']);
                        }
                        if (key === field.name) {

                            //validate null values
                            // throwing error if field is not nullable and the value is null
                            if (field.nullable === "false" && (_.isNull(val))) {
                                // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                                errorManager.throwError('API_ERR_QUERY_API_3',
                                    //["null", field.name, subReq.head.entity]);
                                    [subReq.head.entity, field.name, subReq.head.operation, field.type, 'null']);
                            }

                            //validate type
                            //nullable field already being checked, we are checking for type
                            //if value of field is not null
                            if (!_.isNull(val) && !typeValidators[field.type.toLowerCase()](val)) {
                                // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                                errorManager.throwError('API_ERR_QUERY_API_3',
                                    [subReq.head.entity, field.name, subReq.head.operation, field.type, helpers.toType(val)]);
                            }

                            //validate length
                            if (field.maxLength && !_.isNull(val) && val.length > field.maxLength) {
                                //Length of field {0} exceeds maximum allowed length (length: {1}, allowed: {2})
                                errorManager.throwError('API_ERR_QUERY_API_12',
                                    [field.name, val.length, field.maxLength]);
                            }

                        }
                    });
                });
            }
        };

        queryApiValidators.checkAnnotationTypeIds = function (subReq) {
            var validTypeIds;

            if (!_.isUndefined(subReq.head) && !_.isUndefined(subReq.head.entity) &&
                subReq.head.entity === config.COLLECTIONS.annotations.nameUppercase) {
                validTypeIds = _.pluck(config.SETTINGS.AnnotationTypes, 'id');

                if (!_.isUndefined(subReq.data.fieldsValues.type_id) && !_.isNull(subReq.data.fieldsValues.type_id) || subReq.data.fieldsValues.type_id === 0) {
                    //added check to see if type_id is equal to 0, because "if(0)" will be interpreted as false

                    //Annotations: param type_id for method deleteAnnotations must be number or array but it is someType instead

                    if (!_.contains(validTypeIds, subReq.data.fieldsValues.type_id)) {
                        // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                        errorManager.throwError('API_ERR_QUERY_API_3',
                            [subReq.head.entity, 'type_id', subReq.head.operation, validTypeIds, subReq.data.fieldsValues.type_id]);
                    }
                }
            }
        };

        queryApiValidators.doEtagCheck = function (etg) {

            if (!_.isNull(etg) && (etg.length > config.SETTINGS.AppSettings.ETagMaxLengthInChars || etg.length === 0)) {

                //etags: etag with value {0} and length {1} is not the right length (expected less than {2} and greater than 0)
                errorManager.throwError('API_ERR_QUERY_API_19', [etg, etg.length, config.SETTINGS.AppSettings.ETagMaxLengthInChars]);
            }
        };

        queryApiValidators.doInitCheck = function () {
            //Annotation service API isn\'t initialized or annService.init method hasn\'t called success or error callbacks
            if (!config.API_INITIALIZED && !(config.SUPPRESS_VALIDATION)) {
                errorManager.throwError('API_ERR_QUERY_API_13', null);
            }
        };

        queryApiValidators.validateFieldsNames = function (fields, allowedFields, entityName) {
            if (config.SUPPRESS_VALIDATION) {
                return;
            }

            // we don't want to check fields for Any entity
            // as we don't know fields in all collections that could be possibly used
            if (entityName === 'Any') {
                return;
            }

            var invalidFields = _.difference(fields, allowedFields);

            if (invalidFields.length) {
                //fields [{0}] are not allowed
                errorManager.throwError('API_ERR_QUERY_API_9', [invalidFields]);
            }
        };

        queryApiValidators.validateMutuallyExclusiveMethods = function (entityName, fname, operation) {

            var idx, i;

            //IC 20151014 - removed this check along with queryParams param

            //if queryParams object is present, and option is set, we're throwing an error
            //more info: https://jira.hmhpub.com/browse/DP-3757
            /*            if (queryParams && _.has(queryParams, config.QUERY_PARAMS.option)) {
             errorManager.throwError('API_ERR_QUERY_API_20',
             [entityName, fname, _.keys(config.CONFLICTED_METHODS[operation])]);
             }*/

            idx = reqMan.getLastIdx();

            for (i = 0; i <= idx; i++) {

                if (_.indexOf(config.CONFLICTED_METHODS[operation][fname].methods, reqMan.getProp(i, reqMan.PROPS.CONFLICTING_METHOD)) > -1) {
                    errorManager.throwError('API_ERR_QUERY_API_20',
                        [entityName, fname, config.CONFLICTED_METHODS[operation][fname].methods]);
                }
            }
            /*
             * IC - this throws:
             *  
             * API_ERR_QUERY_API_20 Message: Annotations: mySharedToOthers method cannot be used 
             * with any of the following methods: myNotSharedToOthers,mySharedToOthers,withShared,withSharedOnly
             * 
             * Once we will have history stack, we could throw a better error, like:
             * method a and method b cannot be used together
             */
        };

        queryApiValidators.validateLimitParam = function (value, fnName, entityName, index) {
            if (_.isObject(value) || _.isBoolean(value) || isNaN(value) || value % 1 !== 0) {
                // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                errorManager.throwError('API_ERR_QUERY_API_3',
                    [entityName, '', fnName, 'number, null or undefined', helpers.toType(value)],
                    index);
                //limitFrom method accepts numerical (integer) value, null or undefined
            }
        };

        //validates the number of items in passed in array against number of subrequests
        queryApiValidators.validateBatchGetItemsNumber = function (parameter, fnName) {
            var paramLength = _.isArray(parameter) ? parameter.length : 1;
            if (paramLength !== reqMan.getLen()) {
                errorManager.throwError('API_ERR_QUERY_API_21', [fnName]);
            }
        };

        queryApiValidators.validateOrderFieldValues = function (fieldNames, entityName) {
            if (!_.isString(fieldNames) && !_.isArrayOfStrings(fieldNames)
            ) {
                // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                errorManager.throwError(
                    'API_ERR_QUERY_API_3',
                    [
                        entityName,
                        '',
                        'order',
                        'string or array of strings representing fields names',
                        helpers.toType(fieldNames)
                    ]
                );
            }
        };

        return queryApiValidators;
    });
define(
    'queryAPI', [
        'underscorenc',
        'config',
        'helpers',
        'filtersParser',
        'errorManager',
        'queryApiValidators',
        'requestManager',
        'resetManager'
    ],

    function (_, config, helpers, parser, errMan, queryApiValidators, reqMan, resMan) {

        /**
         * acceptableFields, urls, _mapFields should be redefined on Entity level
         */
        var _forUserString;
        var _successHandler;
        var _errorHandler;
        var _testFunction;

        var queryAPI = {
            entityName: 'queryAPI',

            _defaultTransport: undefined,
            _transports: {},

            _additionalActions: {},
            _filtersObj: {},

            _urls: {},

            acceptableFields: [],
            keyField: undefined,

            desiredOrder: {},//CI: we may need additional properties in the future, thus the object

            init: function () {
                // errMan.subscribeToReset(this);
                // errMan.subscribeToReset(reqMan);
                return this;
            },

            /////////////////////////////////////////////////////////////////
            // WSI TODO 20140820: make all methods wrapped here privite...

            // We use main request if there is one element only passed to the
            // any of the crud methods, i.e. create().
            // If multiple elements are passed then none of the sub request is marked as main.
            // If any sub request if marked as main, then it might be used as parent
            // to create child objects, i.e. annotation with tags, container with subcontainers.
            _isMainRequestCreated: function () {
                return reqMan.isMainSet() !== null;
            },

            _validateMainRequestCreated: function (funName) {
                if (this._isMainRequestCreated()) {
                    return;
                }

                // err: Operation must be set in order to call run function
                errMan.throwError('API_ERR_QUERY_API_15', [funName]);
            },
            // It is important to know when we are using validateMainRequestCreated
            // and when validateRequestCreated. The former is used in the cases
            // when we need to know only one operation is created, like when using
            // createTags in conjuction with create() for annotations. Or fields() or order()
            // as in this case we expect one operation only (it may change in the future though).
            // We check latter in methods that accept both single or multiple requests like done().
            _validateRequestCreated: function (funName) {
                if (reqMan.getLen() > 0) {
                    return;
                }

                // err: Operation must be set in order to call run function
                errMan.throwError('API_ERR_QUERY_API_15', [funName]);
            },

            _validateNoRequestsCreated: function (funName) {
                if (reqMan.getLen() === 0) {
                    return;
                }
                // 'queryAPI: {0}: operation already set, check if you mixed CRUD
                // operations in single query'
                errMan.throwError('API_ERR_QUERY_API_8', [funName]);
            },

            _validateFindFamily: function (fname, index) {
                if (!_.isNumber(index)) {
                    index = reqMan.getLastIdx();
                }
                if (!reqMan.isFindFamily(index)) {
                    //API_ERR_QUERY_API_5 Message: Annotations: next method can be used only with find operation(s)
                    errMan.throwError('API_ERR_QUERY_API_5', [this.entityName, fname, 'find']);
                }
            },

            //VV - this is not currently being used
            _validateFindOne: function (fname) {
                if (!reqMan.isFindOne(reqMan.getLastIdx())) {
                    // {0}: {1} method can be used only with {2} operation(s)
                    errMan.throwError('API_ERR_QUERY_API_5', [fname, 'findOne']);
                }
            },

            _validateFind: function (fname) {
                if (!reqMan.isFind(reqMan.getLastIdx())) {
                    // {0}: {1} method can be used only with {2} operation(s)
                    errMan.throwError(
                        'API_ERR_QUERY_API_5',
                        [this.entityName, fname, 'find']
                    );
                }
            },

            _getTransport: function () {
                var operation = reqMan.getProp(reqMan.getLastIdx(), reqMan.PROPS.OPERATION);
                var transport = this._transports[operation] || this._defaultTransport;

                if (!transport) {
                    //errMan.throwError('API_ERR_QUERY_API_2', null);
                    //this shouldn't be the user error
                    throw ('run: transport for operation "' + operation + '" is not set!');
                }

                return transport;
            },

            _getBaseURL: function (operation) {
                var baseURL = this._urls[operation].service || undefined;
                if (!baseURL) {
                    throw ('baseURL for operation "{0}" is not set!');
                }
                return baseURL;
            },

            _isComplexFilters: function (filters) {
                var parser = this._getTransport().getFiltersParser();

                return parser.isComplex(filters);
            },

            _setComplexFilters: function (filters, index) {
                var parser = this._getTransport().getFiltersParser();

                this._mapFilters(filters);
                queryApiValidators.validateFieldsNames(
                    parser.getFields(filters),
                    this.acceptableFields,
                    this.entityName);

                var customQuery = parser.createFilterString(filters);
                this._customFilterString(customQuery, index);

                return this;
            },

            // These two methods are extended in the child classes of QueryAPI (i.e. Annotations)
            _mapFields: function (fields) {
                return fields;
            },

            _mapFilters: function (fields) {
                return fields;
            },

            done: function (successHandler) {
                _successHandler = successHandler;
                this._validateRequestCreated('done');
                /** FOR old API: if called without handler, then just skip */
                if (_.isUndefined(successHandler) || _.isNull(successHandler)) {
                    return this;
                }

                if (!_.isFunction(successHandler)) {
                    //queryAPI: done: successHandler is not a function
                    errMan.throwError('API_ERR_QUERY_API_10', ['done', 'successHandler']);
                }

                return this;
            },

            fail: function (errorHandler) {
                _errorHandler = errorHandler;
                this._validateRequestCreated('fail');
                /** FOR old API: if called without handler, then just skip */
                if (_.isUndefined(errorHandler) || _.isNull(errorHandler)) {
                    return this;
                }

                if (!_.isFunction(errorHandler)) {
                    //queryAPI: fail: errorHandler is not a function

                    errMan.throwError('API_ERR_QUERY_API_10', ['fail', 'errorHandler']);
                }

                return this;
            },

            /* Notice: fname != field value(single vs plural) */
            parseDates: function () {
                queryApiValidators.doInitCheck();

                if (helpers.isFunSwitchEnabled(arguments)) {
                    reqMan.updateSubs(reqMan.PROPS.PARSE_DATES, true);
                }

                return this;
            },

            outputFields: function (outputFields) {
                var that = this;
                var fnName = 'outputFields';
                queryApiValidators.doInitCheck();
                this._validateMainRequestCreated();

                var _outputFieldsLogic = function (outFields, index) {
                    that._validateFindFamily('outputFields', index);

                    if (!outFields) {
                        return;
                    }

                    if (!_.isArray(outFields)) {
                        //API_ERR_QUERY_API_3 - Annotations: param outputFields for method provided must be array, but it is string instead
                        errMan.throwError('API_ERR_QUERY_API_3',
                            [that.entityName, 'outputFields', 'provided', 'array', helpers.toType(outFields)],
                            index);
                    }

                    // todo - can this be checked by validator?
                    queryApiValidators.validateFieldsNames(outFields, that.acceptableFields, that.entityName);
                    if (_.isNumber(index)) {
                        reqMan.setProp(index, reqMan.PROPS.FIELDS, outFields);
                    } else {
                        //else update all subrequests
                        reqMan.updateSubs(
                            {
                                operation: [config.CRUD.find, config.CRUD.findOne]
                            },
                            reqMan.PROPS.FIELDS,
                            outputFields);
                    }

                    //if index is present, set property for that subrequest
                };

                //if output fields is array of arrays than this is a batch
                if (_.isArrayOf(outputFields, _.isArray, _.isNull)) {
                    queryApiValidators.validateBatchGetItemsNumber(outputFields, fnName);
                    _.each(outputFields, function (outFields, index) {
                        _outputFieldsLogic(outFields, index);
                    });
                } else {
                    _outputFieldsLogic(outputFields);
                }

                return this;
            },

            // WSI: this is to allow using outputFields as well as fields as an alias
            // The old API used fields method for that purpose and lack of it in the new API was confusing
            fields: function (outputFields) {
                return this.outputFields(outputFields);
            },

            // WSI: review if this is still needed or can be replaced by the validator
            _validateFieldsValues: function (fieldsValues) {
                if (!_.isUndefined(fieldsValues)) {
                    this._mapFields(fieldsValues);
                    queryApiValidators.validateFieldsNames(_.keys(fieldsValues), this.acceptableFields, this.entityName);
                }
                return this;
            },

            commonFields: function (fieldsValues) {
                queryApiValidators.doInitCheck();
                this._validateRequestCreated('commonFields');

                //make sure the request.operation is create or update
                if (!reqMan.isCreate(reqMan.getLastIdx()) && !reqMan.isUpdate(reqMan.getLastIdx())) {
                    //TODO WSi 20140820: make this the errorManager error
                    throw "commonFields is only supported for Create and Update operations.";
                }

                // do we need that?
                this._mapFields(fieldsValues);

                queryApiValidators.validateFieldsNames(_.keys(fieldsValues), this.acceptableFields, this.entityName);

                // we are only updating sub requests that have fieldsValues property
                // so they are CREATE and UPDATE only
                reqMan.updateSubs(
                    {
                        operation: [config.CRUD.update, config.CRUD.create]
                    },
                    reqMan.PROPS.FIELDS_VALUES,
                    fieldsValues
                );

                return this;
            },

            // WSi 23/01/2014 TODO: This should be private method, why is it exposed??
            // WSi TODO 20140821 I don't like this method, need to review it
            _processFilters: function (filters) {
                var that = this;
                //if (this.isComplexFilters(filters)) {
                //    return this.setComplexFilters(filters);
                //}

                if (_.isArray(filters)) {
                    _.each(filters, function (filter, index) {
                        if (that._isComplexFilters(filter)) {
                            that._setComplexFilters(filter, index);
                        } else {
                            that._mapFilters(filter);
                            if (!_.isEmpty(filter)) {
                                queryApiValidators.validateFieldsNames(
                                    _.keys(filter),
                                    that.acceptableFields,
                                    that.entityName);
                            }

                            //if filter object is next link
                            if (_.isString(filter)) {
                                if (config.NEXT_LINK_DOMAIN_STRIPPING) {
                                    filter = filter.replace(/^.*\/\/[^\/]+/, '');
                                }
                                reqMan.setProp(index, reqMan.PROPS.NEXT, filter);
                            } else {
                                if (!_.isEmpty(filter)) {
                                    reqMan.setProp(index, reqMan.PROPS.FILTERS, filter);
                                }
                            }
                        }
                    });
                } else {
                    if (this._isComplexFilters(filters)) {
                        return this._setComplexFilters(filters);
                    }

                    this._mapFilters(filters);

                    // WSI 20140820: shouldn't that be done by Validator?
                    if (!_.isEmpty(filters)) {
                        queryApiValidators.validateFieldsNames(_.keys(filters), this.acceptableFields, this.entityName);
                        reqMan.setProp(reqMan.getLastIdx(), reqMan.PROPS.FILTERS, filters);
                    }

                    return this;
                }

                return this;
            },

            /** find chains */
            count: function (value) {
                //vvvvvvvv
                queryApiValidators.doInitCheck();
                this._validateMainRequestCreated();
                this._validateFind('count');

                this._request.count = value;

                reqMan.updateSubs(
                    {
                        operation: [config.CRUD.find, config.CRUD.findOne]
                    },
                    reqMan.PROPS.COUNT,
                    helpers.isFunSwitchEnabled(arguments)
                );

                return this;
            },

            inlineCount: function () {
                queryApiValidators.doInitCheck();
                this._validateMainRequestCreated('inlineCount');

                this._validateFind('inlineCount');

                reqMan.updateSubs(
                    {
                        operation: [config.CRUD.find, config.CRUD.findOne]
                    },
                    reqMan.PROPS.INLINE_COUNT,
                    helpers.isFunSwitchEnabled(arguments)
                );

                return this;
            },

            limit: function (offset, amount) {
                //IC - making the limit method supporting the batch:

                /*
                 * limit(1,6) - applies limit to all elements of the array
                 * [[1,6], [2,3]] - applies limit to matching elements of the array
                 *
                 * Not all border cases are covered at this point!
                 * limit([[1,6], [2,3], {}]) - ReqMan validation will kick in, which is fine
                 * */
                if (arguments && arguments[0] && _.isArray(arguments[0])) {
                    _.each(arguments[0], function (argument, index) {

                        reqMan.setProp(index, reqMan.PROPS.LIMIT_FROM, argument[0]);
                        reqMan.setProp(index, reqMan.PROPS.LIMIT_COUNT, argument[1]);
                    });
                } else {
                    if (_.isArray(offset)
                        && _.isArray(offset)
                        && offset.length !== amount.length) {
                        errMan.throwError('API_ERR_QUERY_API_18', ['offset', 'amount']);
                    }

                    if (!offset && !amount) {
                        return this;
                    }

                    this.limitFrom(offset);
                    this.limitCount(amount);
                }

                queryApiValidators.doInitCheck();
                this._validateMainRequestCreated('limit');
                this._validateFind('limit');

                return this;
            },

            limitFrom: function (offset) {
                var fnName = 'limitFrom', that = this;
                queryApiValidators.doInitCheck();
                this._validateMainRequestCreated(fnName);
                this._validateFind(fnName);
                if (!offset || (_.isArray(offset) && offset.length === 0)) {
                    return this;
                }
                if (_.isArray(offset)) {
                    queryApiValidators.validateBatchGetItemsNumber(offset, fnName);
                    _.each(offset, function (offsetVal, index) {
                        queryApiValidators.validateLimitParam(offsetVal, fnName, that.entityName, index);
                        //offset[index] = Number(offset[index]);
                        offsetVal = Number(offsetVal);
                        reqMan.setProp(index, reqMan.PROPS.LIMIT_FROM, offsetVal);
                    });
                } else {
                    queryApiValidators.validateLimitParam(offset, fnName, this.entityName);
                    offset = Number(offset);
                    //if there is more than one subrequest, apply the limit to all
                    if (reqMan.getLen() > 1) {
                        reqMan.updateSubs(
                            {
                                operation: [config.CRUD.find]
                            },
                            reqMan.PROPS.LIMIT_FROM,
                            offset
                        );
                    } else {
                        reqMan.setProp(reqMan.getLastIdx(), reqMan.PROPS.LIMIT_FROM, offset);
                    }
                }
                return this;
            },

            limitCount: function (amount) {
                var fnName = 'limitCount', that = this;
                queryApiValidators.doInitCheck();
                this._validateMainRequestCreated('limitCount');
                this._validateFind('limitCount');
                if (!amount || (_.isArray(amount) && amount.length === 0)) {
                    return this;
                }

                if (_.isArray(amount)) {
                    queryApiValidators.validateBatchGetItemsNumber(amount, fnName);
                    _.each(amount, function (amountVal, index) {
                        queryApiValidators.validateLimitParam(amountVal, fnName, that.entityName, index);

                        amountVal = Number(amountVal);
                        reqMan.setProp(index, reqMan.PROPS.LIMIT_COUNT, amountVal);
                    });
                } else {
                    queryApiValidators.validateLimitParam(amount, fnName, this.entityName);
                    amount = Number(amount);
                    //if there is more than one subrequest, apply the limit to all
                    if (reqMan.getLen() > 1) {
                        reqMan.updateSubs(
                            {
                                operation: [config.CRUD.find]
                            },
                            reqMan.PROPS.LIMIT_COUNT,
                            amount
                        );
                    } else {
                        reqMan.setProp(reqMan.getLastIdx(), reqMan.PROPS.LIMIT_COUNT, amount);
                    }
                }

                return this;
            },

            // default direction is desc
            // direction accepts string 'desc' for desc, otherwise asc
            // or number 1 = asc, -1 = desc (as in MongoDB)
            order: function (fieldNames, direction) {
                var _makeArray = function (stringVal) {
                    return _.isString(stringVal) ? [stringVal] : stringVal;
                };

                var parseDirectionValue = function (directionVal) {
                    var isDesc = false;
                    if (_.isString(directionVal)) {
                        isDesc = directionVal.toLowerCase() === 'desc';
                    }
                    if (_.isNumber(directionVal)) {
                        isDesc = directionVal < 0;
                    }
                    return isDesc;
                };
                var that = this;

                var fnName = 'order';
                queryApiValidators.doInitCheck();
                this._validateMainRequestCreated('order');
                this._validateFind('order');

                if (_.isNullUndef(fieldNames) || _.isArray(fieldNames) && fieldNames.length === 0) {
                    return this;
                }

                //if it's a batch request
                if (_.isArrayOf(fieldNames, _.isArray, _.isNull)) {
                    queryApiValidators.validateBatchGetItemsNumber(fieldNames, fnName);
                    _.each(fieldNames, function (fieldNamesValue, index) {
                        _.each(fieldNamesValue, function (name) {
                            queryApiValidators.validateOrderFieldValues(name, that.entityName);
                            reqMan.setProp(index, reqMan.PROPS.ORDER_BY, _makeArray(name));
                        });
                    });
                } else {
                    queryApiValidators.validateOrderFieldValues(fieldNames, this.entityName);
                    //if request is batch, but only one fieldNames object is provided
                    //apply it to all subrequests
                    if (reqMan.getLen() > 1) {
                        reqMan.updateSubs(
                            {
                                operation: [config.CRUD.find]
                            },
                            reqMan.PROPS.ORDER_BY,
                            _makeArray(fieldNames)
                        );
                    } else {
                        reqMan.setProp(reqMan.getLastIdx(), reqMan.PROPS.ORDER_BY, _makeArray(fieldNames));
                    }
                }

                if (_.isArrayOf(direction, _.isString, _.isNumber)) {
                    queryApiValidators.validateBatchGetItemsNumber(direction, fnName);
                    _.each(direction, function (directionValue, index) {
                        directionValue = parseDirectionValue(directionValue);
                        reqMan.setProp(index, reqMan.PROPS.ORDER_DESC, directionValue);
                    });
                } else {
                    direction = parseDirectionValue(direction);
                    if (reqMan.getLen() > 1) {

                        reqMan.updateSubs(
                            {
                                operation: [config.CRUD.find]
                            },
                            reqMan.PROPS.ORDER_DESC,
                            direction
                        );
                    } else {
                        reqMan.setProp(reqMan.getLastIdx(), reqMan.PROPS.ORDER_DESC, direction);
                    }
                }

                return this;
            },

            // TODO WSi 20140820: When do we exactly need it?
            _customFilterString: function (string, index) {
                queryApiValidators.doInitCheck();
                this._validateMainRequestCreated('run');

                //? validateFindFamily('customFilterString');
                if (!_.isString(string)) {
                    return this;
                }
                index = index || reqMan.getLastIdx();
                reqMan.setProp(index, reqMan.PROPS.CUSTOM_FILTER_STRING, string);

                return this;
            },

            //VV - commented out as it is not used
            //extendFor: function(obj) {
            //
            //},

            /** here is the place where router is good */
            next: function (url) {
                var that = this;
                queryApiValidators.doInitCheck();
                this._validateMainRequestCreated('next');
                this._validateFindFamily('next');

                var _nextLogic = function (nextUrl, index) {
                    //that.validateFindFamily('next', index);
                    if (!_.isString(nextUrl)) {
                        return;
                    }

                    /** TODO add at least domain check */
                    // ^ WSI 20140820: regarding the comment from Vitality above: +1
                    // i was thinking that domain check isn't necessary, as we could actually
                    // allow using the next entityless, i.e. annService.next('').blabla.run()
                    // but we have some custom params that need to be used with the next as they
                    // aren't carried over, i.e. all custom params like forUser() etc

                    // fix for DP-3484 - we want to strip out domains from the absolute next links
                    // to make the relative
                    if (config.NEXT_LINK_DOMAIN_STRIPPING) {
                        nextUrl = nextUrl.replace(/^.*\/\/[^\/]+/, '');
                    }

                    if (_.isNumber(index)) {
                        var idx = reqMan.getLastIdx();
                        if (idx < index) {
                            reqMan.createSub(
                                config.CRUD.find,
                                true,
                                that.entityName
                                //config.COLLECTIONS.annotations.nameUppercase
                            );
                            reqMan.setProp(index, reqMan.PROPS.BASE_URL, that._getBaseURL(config.CRUD.find));
                        }

                        reqMan.setProp(index, reqMan.PROPS.NEXT, nextUrl);
                    } else {
                        reqMan.setProp(reqMan.getLastIdx(), reqMan.PROPS.NEXT, nextUrl);
                    }

                };

                //if is batch
                if (_.isArray(url)) {
                    //queryApiValidators.validateBatchGetItemsNumber(url, fnName)
                    _.each(url, function (nextUrl, index) {
                        _nextLogic(nextUrl, index);
                    });
                } else {
                    _nextLogic(url);
                }

                //this.validateFindFamily('next');

                /** TODO add at least domain check */
                // ^ WSI 20140820: regarding the comment from Vitality above: +1
                // i was thinking that domain check isn't necessary, as we could actually
                // allow using the next entityless, i.e. annService.next('').blabla.run()
                // but we have some custom params that need to be used with the next as they
                // aren't carried over, i.e. all custom params like forUser() etc

                // fix for DP-3484 - we want to strip out domains from the absolute next links
                // to make the relative
                //if (config.NEXT_LINK_DOMAIN_STRIPPING) {
                //    url = url.replace(/^.*\/\/[^\/]+/, '');
                //}
                //
                //reqMan.setProp(reqMan.getLastIdx(), reqMan.PROPS.NEXT, url);

                return this;
            },
            /** end find chains */

            run: function () {
                var that = this;

                //VV TODO
                var _findAction = function (index) {
                    if (_.isUndefined(reqMan.getProp(index, reqMan.PROPS.NEXT))) {
                        that._additionalActions.find && that._additionalActions.find(that._filtersObj);
                        that._processFilters(that._filtersObj);
                    } else {
                        if (_forUserString) {
                            that.forUser(_forUserString);
                        }
                    }
                };

                queryApiValidators.doInitCheck();
                this._validateRequestCreated('run');

                var requestLen = reqMan.getLen(),
                    transport = this._getTransport(),
                    idx = reqMan.getLastIdx();

                // WSi: DP-2152: Update to queryAPI module to allow using filter() after find() - this would extend filter object.
                // TODO 30/07/2014 WSi: look again at the this.filtersObj

                //if reqest is batch
                if (requestLen > 1) {

                    var findIndexes = reqMan.getSubIndexesMatchingFilter({operation: [config.CRUD.find]});
                    _.each(findIndexes, function (index) {
                        _findAction(index);
                        //var nextLink = reqMan.getProp(index, reqMan.PROPS.NEXT);
                        //console.log(index, nextLink);
                    });

                } else {
                    if (reqMan.isFind(idx)) {
                        _findAction(idx);
                    }
                }

                // IC 20140929 if no option is set for Annotations, we'll automatically set 0
                // if next link is not available
                // we are doing this so that by default the user will get her own notes only
                // without shared notes.
                if (
                    this.entityName === config.COLLECTIONS.annotations.nameUppercase &&
                    reqMan.isFindFamily(idx) &&
                    _.isUndefined(reqMan.getProp(idx, reqMan.PROPS.CUSTOM_OPERATION)) &&
                    _.isUndefined(reqMan.getProp(idx, reqMan.PROPS.NEXT))

                ) {
                    var param = {};
                    param[config.QUERY_PARAMS.option] = config.ANNO2_WITH_NO_SHARED;

                    //IC - we don't need additional checks, if there is option 1 or 2 set, this will be ignored
                    reqMan.updateSubs(
                        {
                            operation: [config.CRUD.find, config.CRUD.findOne]
                        },
                        reqMan.PROPS.QUERY_PARAMS,
                        param
                    );

                    //reqMan.setProp(idx, reqMan.PROPS.QUERY_PARAMS, param);
                    //IC - we don't need additional checks, if there is option 1 or 2 set, this will be ignored
                }

                // If we specify some output fields by using fields() method and also if we
                // expand on some other entity then we need to add these entity names to the
                // list of output fields (they actually have the same name) to allow users to
                // see the results from the expanded entity.
                // We don't need to do that if the user doesn't specify any fields() as in
                // this case odata returns all fields including these expanded by default.
                if (!_.isUndefined(reqMan.getProp(idx, reqMan.PROPS.FIELDS))) {
                    if (!_.isUndefined(reqMan.getProp(idx, reqMan.PROPS.EXPAND_FOR))) {
                        reqMan.setProp(
                            idx,
                            reqMan.PROPS.FIELDS,
                            reqMan.getProp(idx, reqMan.PROPS.EXPAND_FOR)
                        );
                    }
                }

                if (_errorHandler) {
                    reqMan.setProp(reqMan.PROPS.ERROR_HANDLER, _errorHandler);
                }
                if (_successHandler) {
                    reqMan.setProp(reqMan.PROPS.SUCCESS_HANDLER, _successHandler);
                }
                if (_testFunction) {
                    reqMan.setProp(reqMan.PROPS.TEST, _testFunction);
                }
                _successHandler = _errorHandler = _testFunction = _forUserString = undefined;

                if (this._entityLevelCheck) {
                    this._entityLevelCheck();
                }

                // run entity level run functions
                this._entityRunActions && this._entityRunActions();

                var orderArgs = this.desiredOrder.orderArgs || null;
                //CI - in the future we'll might need logic for this
                var request = reqMan.exportRequest(orderArgs);

                queryApiValidators.validateRequest(request);

                // resetting the queryAPI and it's extendees since we are now exporting
                // the request from the reqMan and sending to transport
                resMan.resetLib();
                transport.run(request);
            },

            create: function (fieldsValues) {
                queryApiValidators.doInitCheck();
                var that = this;

                if (_.isNullUndef(fieldsValues)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'fieldValues', 'create', 'array or object', 'empty']);
                }
                if (!_.isObject(fieldsValues) && !_.isArray(fieldsValues)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'fieldValues', 'create', 'array or object', helpers.toType(fieldsValues)]);
                }

                if (_.isArray(fieldsValues) && fieldsValues.length === 0) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'fieldValues', 'create', 'array or object', 'empty array']);
                }

                //WSI TODO 20180924: the below should be in the queryVladidator not here!
                if (!config.SUPPRESS_VALIDATION && (
                    (_.isObject(fieldsValues) && fieldsValues[this.keyField]) ||
                    (_.isArray(fieldsValues) && _.some(fieldsValues, function (item) {
                        return _.has(item, that.keyField);
                    })))
                ) {
                    //{0}: create: key field {1} is not allowed on create operation
                    errMan.throwError('API_ERR_QUERY_API_11', [this.entityName, this.keyField, 'create']);
                }

                this._additionalActions[config.CRUD.create] &&
                this._additionalActions[config.CRUD.create](fieldsValues);

                if (_.isArray(fieldsValues)) {
                    _.each(fieldsValues, this._validateFieldsValues, this);
                    _.each(fieldsValues,
                        function (item) {
                            var subidx = reqMan.createSub(
                                config.CRUD.create,
                                false,
                                that.entityName
                            );
                            reqMan.setProp(subidx, reqMan.PROPS.FIELDS_VALUES, item);
                            reqMan.setProp(subidx, reqMan.PROPS.BASE_URL, this._getBaseURL(config.CRUD.create));
                        },
                        this);
                } else {
                    this._validateFieldsValues(fieldsValues);

                    this._validateNoRequestsCreated('create');
                    var idx = reqMan.createSub(config.CRUD.create, true, this.entityName);
                    reqMan.setProp(idx, reqMan.PROPS.BASE_URL, this._getBaseURL(config.CRUD.create));
                    reqMan.setProp(idx, reqMan.PROPS.FIELDS_VALUES, fieldsValues);
                }

                return this;
            },

            remove: function (id) {
                queryApiValidators.doInitCheck();
                var that = this;

                if (!_.isNumber(id) && !(_.isArray(id) && id.length)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3', [this.entityName, 'id', 'remove', 'number or array', helpers.toType(id)]);
                }

                this._additionalActions[config.CRUD.remove] &&
                this._additionalActions[config.CRUD.remove](id);

                if (_.isArray(id)) {
                    _.each(id, function (item) {
                        if (!_.isNumber(item)) {
                            item = item[that.keyField];
                        }
                        var subidx = reqMan.createSub(
                            config.CRUD.remove,
                            false,
                            that.entityName
                        );
                        reqMan.setProp(subidx, reqMan.PROPS.ID, item);
                        reqMan.setProp(subidx, reqMan.PROPS.BASE_URL, that._getBaseURL(config.CRUD.remove));
                    });
                } else {
                    this._validateNoRequestsCreated('remove');
                    var idx = reqMan.createSub(config.CRUD.remove, true, this.entityName);
                    reqMan.setProp(idx, reqMan.PROPS.ID, id);
                    reqMan.setProp(idx, reqMan.PROPS.BASE_URL, this._getBaseURL(config.CRUD.remove));
                }

                return this;
            },

            update: function (id, fieldsValues) {
                queryApiValidators.doInitCheck();
                var that = this;

                // id could be only array or a number
                // or if id is array then each itam could only be an number or an object.
                // if it is a number then it will be used in conjunction with commonFields.
                if ((!_.isArray(id) && !_.isNumber(id)) ||
                    (_.isArray(id) && !_.every(id, function (idValue) {
                        return _.isNumber(idValue) || _.isObject(idValue);
                    }))) {

                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, '', 'update', 'nubmer or array of ids', helpers.toType(id)]);
                }

                if (_.isNumber(id) && !_.isObject(fieldsValues) && !_.isUndefined(fieldsValues)) {
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, '', 'update', 'object', helpers.toType(fieldsValues)]);

                }

                this._additionalActions[config.CRUD.update] &&
                this._additionalActions[config.CRUD.update](id, fieldsValues);

                if (_.isArray(id)) {
                    /** add id field for url generation */
                    _.each(id,
                        function (item) {
                            var subidx = reqMan.createSub(
                                config.CRUD.update,
                                false,
                                that.entityName
                            );
                            if (_.isNumber(item)) {

                                reqMan.setProp(subidx, reqMan.PROPS.ID, item);
                            } else {
                                /** check for proper fields in each object */
                                queryApiValidators.validateFieldsNames(_.keys(item), that.acceptableFields, this.entityName);

                                reqMan.setProp(subidx, reqMan.PROPS.ID, item[that.keyField]);
                                delete item[that.keyField];
                                reqMan.setProp(subidx, reqMan.PROPS.FIELDS_VALUES, item);
                            }
                            reqMan.setProp(subidx, reqMan.PROPS.BASE_URL, this._getBaseURL(config.CRUD.update));
                        },
                        this);
                } else {
                    fieldsValues = fieldsValues || {};
                    this._validateFieldsValues(fieldsValues);

                    this._validateNoRequestsCreated('update');
                    var idx = reqMan.createSub(config.CRUD.update, true, this.entityName);
                    reqMan.setProp(idx, reqMan.PROPS.ID, id);
                    reqMan.setProp(idx, reqMan.PROPS.FIELDS_VALUES, fieldsValues);
                    reqMan.setProp(idx, reqMan.PROPS.BASE_URL, this._getBaseURL(config.CRUD.update));
                }

                return this;
            },

            find: function (filters) {
                queryApiValidators.doInitCheck();
                this._validateNoRequestsCreated('find');
                var that = this;

                if (_.isArray(filters)) {
                    _.each(filters, function (filter) {
                        var idx = reqMan.createSub(config.CRUD.find, true, that.entityName);
                        //VV if filter is next link
                        if (_.isString(filter)) {
                            if (config.NEXT_LINK_DOMAIN_STRIPPING) {
                                filter = filter.replace(/^.*\/\/[^\/]+/, '');
                            }
                            reqMan.setProp(idx, reqMan.PROPS.NEXT, filter);
                        } else {
                            reqMan.setProp(idx, reqMan.PROPS.BASE_URL, that._getBaseURL(config.CRUD.find));
                        }
                    });
                } else {
                    /** if next urls passed just return next operation */
                    var idx = reqMan.createSub(config.CRUD.find, true, this.entityName);
                    reqMan.setProp(idx, reqMan.PROPS.BASE_URL, this._getBaseURL(config.CRUD.find));
                    if (_.isString(filters)) {
                        return this.next(filters);
                    }
                }

                this._filtersObj = {};
                this.filters(filters);

                return this;
            },

            filters: function (filters) {
                var that = this;
                queryApiValidators.doInitCheck();
                filters = filters || {};

                if (_.isArray(that._filtersObj)) {
                    if (_.isArray(filters)) {
                        _.each(filters, function (filter, index) {
                            // CI 20140926 - added type validation for filterObject in find
                            // WSi 20141003 - we need to do that everywhere where we use filters, not only
                            if (!_.isObjectNotArray(filter)) {
                                // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                                errMan.throwError(
                                    'API_ERR_QUERY_API_3',
                                    [that.entityName, '', 'find', 'object', helpers.toType(filter)],
                                    index
                                );
                            }
                            that._filtersObj.push(filter);
                        });
                    } else {
                        // CI 20140926 - added type validation for filterObject in find
                        // WSi 20141003 - we need to do that everywhere where we use filters, not only
                        if (!_.isObjectNotArray(filters)) {
                            // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                            errMan.throwError(
                                'API_ERR_QUERY_API_3',
                                [that.entityName, '', 'find', 'object', helpers.toType(filters)]
                            );
                        }
                        that._filtersObj.push(filters);
                    }
                } else if (_.isEmpty(that._filtersObj)) {
                    // CI 20140926 - added type validation for filterObject in find
                    // WSi 20141003 - we need to do that everywhere where we use filters, not only
                    if (!_.isArrayOf(filters, _.isObjectNotArray) && !_.isObjectNotArray(filters)) {
                        // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                        errMan.throwError(
                            'API_ERR_QUERY_API_3',
                            [that.entityName, '', 'find', 'object', helpers.toType(filters)]
                        );
                    }

                    if (reqMan.getCountOfMainRequests() > 1) {
                        //this is a batch get request, apply filter to all requests
                        for (var i = 0; i < reqMan.getCountOfMainRequests(); i++) {

                            if (_.isArray(filters)) {
                                _.each(filters, function (filter, index) {
                                    reqMan.setProp(index, reqMan.PROPS.FILTERS, filter);
                                });
                            } else {
                                reqMan.setProp(i, reqMan.PROPS.FILTERS, filters);
                            }

                        }
                    }

                    that._filtersObj = filters;
                } else {
                    _.extend(that._filtersObj, filters);
                }
                return this;
            },

            filter: function (filters) {
                this.filters(filters);
                return this;
            },

            findOne: function (id) {
                queryApiValidators.doInitCheck();
                this._validateNoRequestsCreated('findOne');
                var idx = reqMan.createSub(config.CRUD.findOne, true, this.entityName);

                if (!_.isNumber(id)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'id', 'findOne', 'number', helpers.toType(id)]);
                }

                this._additionalActions.findOne && this._additionalActions.findOne(id);

                reqMan.setProp(idx, reqMan.PROPS.ID, id);
                reqMan.setProp(idx, reqMan.PROPS.BASE_URL, this._getBaseURL(config.CRUD.findOne));

                return this;
            },

            etags: function (etags) {
                queryApiValidators.doInitCheck();
                // when using etags, all operations must be update or remove
                // this works now, in the future it might be a limitation
                // so we could revisit that.
                if (!reqMan.areSubsOfTypes([config.CRUD.update, config.CRUD.remove])) {
                    //etags: method allowed only with "update" and "delete" operations
                    errMan.throwError('API_ERR_QUERY_API_5', [this.entityName, 'etags()', 'find']);
                }

                //We are allowing etags as strings and nulls
                if ((!_.isArray(etags) && !_.isString(etags) && !_.isNull(etags)) ||
                    (!_.isString(etags) || !_.isNull(etags)) &&
                    (_.isArray(etags) && _.some(etags, function (etag) {
                        return !(_.isNull(etag) || _.isString(etag));
                    }))) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'etags', 'etags', 'string, null or an array', helpers.toType(etags)]);
                }

                //checking matching lenghts of objects and etags
                //WSi 20140925: may need to revesit it as this condition is just taken
                //from the old lib, what if there will be a request with a mix of
                //update and create object, etags are meaningless for the create operation.
                if (_.isArray(etags) && etags.length !== reqMan.getLen()) {
                    //In batch operations, number of items in {} and number of {} has to be the same
                    errMan.throwError('API_ERR_QUERY_API_18', ['remove and update', 'etags']);
                }

                //validate each etag
                if (_.isArray(etags)) {
                    _.each(etags, function (etag, idx) {
                        queryApiValidators.doEtagCheck(etag, this);
                        if (!_.isNull(etag)) {
                            reqMan.setProp(idx, reqMan.PROPS.ETAGS, etag);
                        }
                    });
                } else if (!_.isNull(etags)) {
                    //if single etag is provided, and value is not null
                    queryApiValidators.doEtagCheck(etags, this);
                    reqMan.setProp(reqMan.getLastIdx(), reqMan.PROPS.ETAGS, etags);
                } else {
                    //if single etag is provided, and value is null, return with no changes
                    return this;
                }

                return this;
            },

            forUser: function (userIds) {
                queryApiValidators.doInitCheck();
                var that = this;

                _forUserLogic = function (index, userId) {
                    if (!_.isString(userId) && !_.isNull(userIds)) {
                        // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                        errMan.throwError('API_ERR_QUERY_API_3',
                            [that.entityName, 'userId', 'forUser', 'string or null', helpers.toType(userId)]);
                    }

                    var areSubs = reqMan.areSubsOfTypes([
                        config.CRUD.findOne,
                        config.CRUD.find,
                        config.CRUD.create,
                        config.CRUD.update
                    ], index);

                    if (!areSubs) {
                        //forUser method is available only with find, update and create operations
                        errMan.throwError('API_ERR_QUERY_API_5',
                            [that.entityName, 'forUser', ['find', 'update', 'create'].join(', ')],
                            index);
                    }

                    var param = {};
                    param[config.QUERY_PARAMS.userId] = userId;
                    _forUserString = userId;

                    if (_.isNumber(index)) {
                        if (reqMan.isFindFamily(index) || reqMan.isUpdate(index)) {
                            reqMan.setProp(index, reqMan.PROPS.QUERY_PARAMS, param);
                        }
                    } else {
                        reqMan.updateSubs(
                            {
                                operation: [
                                    config.CRUD.findOne,
                                    config.CRUD.find,
                                    config.CRUD.create,
                                    config.CRUD.update
                                ]
                            },
                            reqMan.PROPS.QUERY_PARAMS,
                            param
                        );
                    }
                };

                if (_.isArray(userIds)) {
                    queryApiValidators.validateBatchGetItemsNumber(userIds, 'forUser');
                    _.each(userIds, function (userId, index) {
                        //if null is passed, the value is valid and skipped
                        if (_.isNull(userId)) {
                            return;
                        }
                        _forUserLogic(index, userId);

                    });
                } else {
                    if (_.isNull(userIds)) {
                        return this;
                    }
                    _forUserLogic(undefined, userIds);
                }

                return this;
            },

            // returns oData req to the callback function instead of making an
            // actual call - useful for tests
            test: function (fun) {

                this._validateRequestCreated('test');
                if (_.isNullUndef(fun)) {
                    fun = function (data) {
                        helpers.consoleLog(data);
                    };
                }

                _testFunction = fun;
                return this;
            },

            // WSi: CustomOperationName should match the URLs key in the entity, i.e. findComments in the annotations.
            // CustomOperationBase is the name of the CRUD operation (like in the config.CRUD)
            // that is the base for the request, i.e. for findComments it is find. This is required for the validation
            // in the odataTransport module.
            _customOperation: function (filters, customOperationName, customOperationBase, entity, isBatch) {
                var that = this;
                queryApiValidators.doInitCheck();

                if (!isBatch) {
                    this._validateNoRequestsCreated(customOperationName);
                }
                var _custOperation = function () {
                    var idx = reqMan.createSub(customOperationBase, true, entity || that.entityName);
                    reqMan.setProp(idx, reqMan.PROPS.BASE_URL, that._getBaseURL(customOperationName));
                    reqMan.setProp(idx, reqMan.PROPS.CUSTOM_OPERATION, customOperationName);
                };

                if (_.isArray(filters)) {
                    _.each(filters, function () {
                        //we're creating the sub for each item in filters
                        //this.filter would handle the assignment of filter values
                        _custOperation();
                    });
                } else {
                    _custOperation();
                }

                if (customOperationBase === config.CRUD.find) {
                    this.filter(filters);
                }

                //return idx;
                return reqMan.getLastIdx();
            },

            //shareTo - used by teacher to share annotations with students when they're being created
            shareTo: function (userIds) {

                //CI: Moved from annotations because we need to call it
                //from Containers as well, and not only from Annotations (but still for that purpose)
                queryApiValidators.doInitCheck();

                if (!helpers.isFunSwitchEnabled(arguments)) {
                    return this;
                }

                if (!reqMan.isCreate(reqMan.getLastIdx())) {
                    //CI: Maybe not best message for this? Docs will emphasize

                    //shareTo method is available only with create operations
                    errMan.throwError('API_ERR_QUERY_API_5', [this.entityName, 'shareTo', 'create']);
                }

                //CI: is entity before the call equal to Annotations
                if (reqMan.getProp(reqMan.getLastIdx(), reqMan.PROPS.ENTITY) !== config.COLLECTIONS.annotations.nameUppercase) {
                    //shareTo can be used only with Annotations
                    errMan.throwError('API_ERR_QUERY_API_14', ['shareTo', config.COLLECTIONS.annotations.nameUppercase]);
                }

                if (!_.isString(userIds) && !_.isArrayOfStrings(userIds)) {

                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'userIds', 'shareTo', 'string or array of strings', helpers.toType(userIds)]);
                }

                if (reqMan.getSubIndexesMatchingFilter({queryParams: [config.QUERY_PARAMS.userIds]}).length !== 0) {
                    //shareTo method can only be used once at a time
                    errMan.throwError('API_ERR_QUERY_API_16', ['shareTo']);
                }

                // If userIds is a string with multiple users we need to split it to array to deduplicate
                if (_.isString(userIds) && userIds.indexOf(';') !== -1) {
                    userIds = userIds.split(';');
                }

                if (_.isArrayOfStrings(userIds)) {
                    userIds = _.uniq(userIds);
                    userIds = userIds.join(';');
                }

                var param = {};
                param[config.QUERY_PARAMS.userIds] = userIds;
                reqMan.updateSubs(
                    {operation: config.CRUD.create, entity: config.COLLECTIONS.annotations.nameUppercase},
                    reqMan.PROPS.QUERY_PARAMS,
                    param
                );

                return this;
            },
            //createAnnotation and updateAnnotation methods in Containers need this
            //because subrequests in payload have to be in specific order
            forceOrder: function (idx) {

                if (_.isUndefined(this.desiredOrder.forceSubReqToTheFirstPosition)) {

                    this.desiredOrder.forceSubReqToTheFirstPosition = idx;
                    this.desiredOrder.orderArgs = [];
                    //CI: We may need this for the future (not only 1 order property)
                    this.desiredOrder.orderArgs.push(idx);

                } else {
                    throw "It is not allowed to force first position multiple times!";
                }
            }
        };

        queryAPI._reset = function () {
            queryAPI._filtersObj = {};
            queryAPI.desiredOrder = {};
        };

        return queryAPI.init();
    });
define(
    'info', ['config', 'helpers', 'underscorenc'],

    function (config, helpers, _) {

        var description = [];

        description.push('keyField: name of ID field, unique. Forbidden for create operation, mandatory for ' +
            '[update, remove] operations');

        description.push('fields: array of acceptable fields. [outputFields, fields, commonFields, filters] ' +
            'methods of entities check arguments to match these fields');

        description.push('Allowed operations: [' + _.values(config.CRUD) + ']');

        var defaultData = {
            'description': description
        };

        var api = {
            infoData: undefined,
            acceptableFields: [],
            keyField: undefined
        };

        api.setInfo = function (data) {
            this.infoData = _.extend({}, defaultData, data, this.entityInfo);

            if (this.infoData.fields) {

                var wordLen = 25,
                    wordEx = _.getStringOfLen(wordLen, ' '),
                    lineEx = _.getStringOfLen(wordLen, '='),
                    fieldsTable = '\n',
                    def = [{name: "Field Name:", type: 'Data Type:', maxLength: 'Max Length:'}],
                    line = [{name: lineEx, type: lineEx, maxLength: lineEx}],
                    printData = _.union(def, line, this.infoData.fields);

                _.each(
                    printData,
                    function (data) {
                        fieldsTable +=
                            data.name + wordEx.substring(0, wordLen - data.name.length) + " | " +
                            data.type + wordEx.substring(0, wordLen - data.type.length) + " | " +
                            (data.maxLength ? data.maxLength : '') + "\n";
                    }
                );
                this.infoData.getFieldsTable = function () {
                    return fieldsTable;
                };
            }

            if (data.fields) {
                this.acceptableFields = _.pluck(data.fields, ['name']);
            }

            if (data.keyField) {
                this.keyField = data.keyField;
            }
        };

        api.info = function () {
            return this.infoData;
        };

        return api;
    });
define(
    'tags', [
        'underscorenc',
        'config',
        'helpers',
        'transportManager',
        'client',
        'queryAPI',
        'info',
        'errorManager',
        'requestManager'
    ],

function (_, config, helpers, transportManager, client, queryAPI, info, errMan, reqMan) {
    var URLS = {
        'remove': {
            'service': helpers.templatify("tags(<%= id %>)")
        },
        'create': {
            'service': helpers.templatify("tags")
        },
        'update': {
            'service': helpers.templatify("tags(<%= id %>)")
        },
        'find': {
            'service': helpers.templatify("tags/<%= tail %>")
        },
        'findOne': {
            'service': helpers.templatify("tags(<%= id %>)<%= tail %>")
        },
        'getDistinctTags': {
            'service': helpers.templatify("Tag/DistinctTags<%= tail %>")
        }
    };

    var Tags = {
        entityName: 'Tags',

        _defaultTransport: transportManager.use(config.TRANSPORT_NAMES.ODATA),
        _transports: {},

        _request: {},

        _additionalActions: {},

        _urls: URLS,

        init: function() {
            _.defaults(this, queryAPI);

            _.extend(this, info);

            //errMan.subscribeToReset(this);

            //errMan.addRequestObject(this.getRequest);

            return this;
        },

        _getRequest: function () {
            return this._request;
        },

        getInfo: function() {
            var returnObject = this.info();

            if (!_.isUndefined(config.SETTINGS.FieldsSettableOnCreationOnly[this.entityName])) {
                returnObject.FieldsSettableOnCreationOnly = config.SETTINGS.FieldsSettableOnCreationOnly[this.entityName];
            }
            if (!_.isUndefined(config.SETTINGS.ReadOnlyFields[this.entityName])) {
                returnObject.ReadOnlyFields = config.SETTINGS.ReadOnlyFields[this.entityName];
            }
            if (!_.isUndefined(config.SETTINGS.RequiredFields[this.entityName])) {
                returnObject.REQUIRED_FIELDS = config.SETTINGS.RequiredFields[this.entityName];
            }

            if (config.FORCE_DEFAULT_SERVICE_SETTINGS) {
                returnObject.SETTINGS_SOURCE = 'client_defaults';
            } else {
                returnObject.SETTINGS_SOURCE = 'service';
            }
            return returnObject;
        },
        tagNamesToValues: function(fieldsValues) {
            if (_.isArray(fieldsValues)) {
                fieldsValues = _.map(fieldsValues, function(fields){
                    if (_.isString(fields)) {
                        return {value: fields};
                    }
                    return fields;
                });
            } else {
                if (_.isString(fieldsValues)) {
                    fieldsValues = {value: fieldsValues};
                }
            }
            return fieldsValues;
        },
        getDistinctTags: function (filters) {

            filters = filters || {};

            filters.client_id = filters.client_id || client.getID();

            var idx = this._customOperation(
                {},
                config.CUSTOM_ENDPOINTS.DISTINCT_TAGS,
                config.CRUD.find,
                this.entityName
            );

            reqMan.setProp(idx, reqMan.PROPS.QUERY_PARAMS, filters);
            reqMan.setProp(idx, reqMan.PROPS.IS_WEBAPI, true);
            return this;
        }
    };

    Tags._reset = function() {
        Tags._filtersObj = {};
        Tags.desiredOrder = {};
    };

    //return _.pick(Tags.init(), _.union(config.CRUD, queryMethods));
    return Tags.init();
});
define(
    'annotations', [
        'underscorenc',
        'config',
        'helpers',
        'transportManager',
        'client',
        'queryAPI',
        'info',
        'tags',
        'errorManager',
        'requestManager',
        'queryApiValidators'
    ],

    function (_, config, helpers, transMan, client, queryAPI, info, tagsEntity, errMan, reqMan,
              queryApiValidators) {
        var URLS = {
            'remove': {
                'service': helpers.templatify("annotations(<%= id %>)")
            },
            'create': {
                'service': helpers.templatify("annotations")
            },
            'update': {
                'service': helpers.templatify("annotations(<%= id %>)")
            },
            'find': {
                'service': helpers.templatify("annotations2<%= tail %>")
            },
            'findOne': {
                'service': helpers.templatify("annotations2(<%= id %>)<%= tail %>")
            },

            // CUSTOM STUFF
            'findComments': {
                'service': helpers.templatify("GetComments<%= tail %>")
            },
            'findAllAnnotationsByText': {
                'service': helpers.templatify("AllAnnotations<%= tail %>")
            },
            'findCommentedAnnotations': {
                'service': helpers.templatify("CommentedAnnotations<%= tail %>")
            },

            // Map widgets stuff
            'createImage': {
                'service': helpers.templatify(config.ACTION_STORAGE_UPLOAD_URL)
            },

            'findImage': {
                'service': helpers.templatify(config.ACTION_DOWNLOAD_GET_URL + "<%= tail %><%= id %>")
            },

            'updateImage': {
                'service': helpers.templatify(config.ACTION_UPDATE_URL + "<%= id %>")
            },

            'removeImage': {
                'service': helpers.templatify(config.ACTION_DELETE_URL + "<%= id %>")
            },

            // MX STUFF - would love to put it in another place...
            'MXGetAnnotationsByStudent': {
                'service': helpers.templatify("GetAnnotationsByStudent<%= tail %>")
            },
            'MXGetTeacherCommentsAsStudent': {
                'service': helpers.templatify("Annotation/Comments<%= tail %>")
            },
            'MXMarkInteractiveNoteAsRead': {
                'service': helpers.templatify("Annotation/InteractiveNoteMarkAsRead<%= tail %>")
            },
            'MXMarkTeacherCommentAsRead': {
                'service': helpers.templatify("annotation/TeacherCommentMarkAsRead<%= tail %>")
            }
        };

        /* This is annotation model object */
        var Annotations = {
            entityName: 'Annotations',

            /* defaultTransport to use if not overrided in transports object */
            _defaultTransport: transMan.use(config.TRANSPORT_NAMES.ODATA),
            /** here we can add transport for specific operation */
            /** @example: {'create': transportManager.use(config.TRANSPORT_NAMES.AJAX)}
             * this will set ajax transport for create operation
             */
            _transports: {},

            _additionalActions: {
                'create': function (fieldsValues) {
                    if (client.isSet()) {
                        if (_.isArray(fieldsValues)) {
                            var clientID = client.getID();
                            _.each(fieldsValues, function (item) {
                                if (!_.isUndefined(item)) {
                                    item.created_by_tool_id = clientID;
                                }
                            });
                        } else {
                            fieldsValues.created_by_tool_id = client.getID();
                        }
                    }
                }
            },

            entityInfo: {
                'AnnotationTypes': config.DEFAULTS.AnnotationTypes
            },

            _entityRunActions: function () {
                this._processVisibilityUpdate();
            },

            _request: {},

            _urls: URLS,

            _supportedUploadFileTypes: ['svg', 'png', 'json'],

            _annotationVisibility: undefined,

            init: function () {
                _.defaults(this, queryAPI);

                _.extend(this, info);

                return this;
            },

            _mapFields: function (fieldsValues) {
                if (fieldsValues.$visibility) {
                    fieldsValues.visibility_id = client.convertNamesToID(fieldsValues.$visibility);
                    delete fieldsValues.$visibility;
                }

                /** exclude-include notation acceptable only for update */
                //if ('update' == this.request.operation &&
                if ((fieldsValues.currentVisibilityId || fieldsValues.currentVisibilityId === 0) &&
                    (fieldsValues.visibilityInclude || fieldsValues.visibilityExclude)) {
                    fieldsValues.visibility_id = client.updateVisibilityIdByNames({
                        currentVisibilityId: fieldsValues.currentVisibilityId,
                        includeClients: fieldsValues.visibilityInclude,
                        excludeClients: fieldsValues.visibilityExclude
                    });

                    delete fieldsValues.currentVisibilityId;
                    delete fieldsValues.visibilityInclude;
                    delete fieldsValues.visibilityExclude;
                }

            },

            /** filters should not accept exclude-include notation, like _mapFields */
            _mapFilters: function (fieldsValues) {

                if (!_.isUndefined(fieldsValues.$visibility)) {
                    if ((_.isArray(fieldsValues.$visibility))) {
                        var singleVisibility = _.some(fieldsValues.$visibility, function (singleVisibility) {
                            return !_.isString(singleVisibility);
                        });

                        if (singleVisibility) {
                            // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                            errMan.throwError('API_ERR_QUERY_API_3',
                                [this.entityName, _.keys(this._filtersObj), '', 'string', 'of incorrect type']);
                        }
                    } else if (!_.isString(fieldsValues.$visibility)) {
                        // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                        errMan.throwError('API_ERR_QUERY_API_3',
                            [this.entityName, _.keys(this._filtersObj), '', 'string', helpers.toType(fieldsValues.$visibility)]);
                    }
                    //VV Dp-2455 - When annotations are filtered by visibility id,
                    // param needs to be put into query params instead of filter
                    var param = {}, len = reqMan.getLastIdx();
                    param[config.QUERY_PARAMS.visibility_id] = client.convertNamesToVisibilityIdsForGet(fieldsValues.$visibility);
                    for (var i = 0; i <= len; i++) {
                        reqMan.setProp(i, reqMan.PROPS.QUERY_PARAMS, param);
                    }

                    delete fieldsValues.$visibility;

                }

                if (!_.isUndefined(fieldsValues.$client)) {
                    if (!_.isString(fieldsValues.$client)) {
                        // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                        errMan.throwError('API_ERR_QUERY_API_3',
                            [this.entityName, _.keys(this._filtersObj), '', 'string', helpers.toType(fieldsValues.$client)]);
                    }
                    //fieldsValues.created_by_tool_id = client.convertNamesToID(fieldsValues.$client);
                    param = {};
                    len = reqMan.getLastIdx();
                    param.created_by_tool_id = client.convertNamesToID(fieldsValues.$client);
                    for (i = 0; i <= len; i++) {
                        reqMan.setProp(i, reqMan.PROPS.FILTERS, param);
                    }
                    delete fieldsValues.$client;
                }
            },

            _parseTypeIds: function (data) {
                if (data) {
                    var annotationTypes = _.findWhere(config.SETTINGS.serviceSettingsStatuses, {'name': 'AnnotationTypes'});
                    annotationTypes.received = true;

                    if (data.length && _.isArray(data)) {
                        annotationTypes.correctFormat = true;

                        var typesList = [];
                        _.each(data, function (item) {
                            if (!_.isUndefined(item.description) && !_.isUndefined(item.annotation_type_id)) {
                                typesList.push({id: item.annotation_type_id, name: item.description});
                            }
                        });
                        if (_.size(typesList) > 0) {
                            if (_.isEqual(typesList, config.DEFAULTS.AnnotationTypes)) {
                                annotationTypes.upToDate = true;
                            }
                            config.SETTINGS.AnnotationTypes = typesList;
                            //return;
                        }
                    } else {
                        config.SETTINGS.AnnotationTypes = config.DEFAULTS.AnnotationTypes;
                    }
                }

            },

            // DP-2942
            // accepts string or tag object or array of strings or objects
            // WSi 20141013: Aliases don't work in the current form on IE. We will revisit
            // them when refactoring queryAPI.
            //createTags: function createTags(fv) {return this.tags(fv);},
            tags: function tags(fieldsValues) {
                var self = this,
                    fname = "tags()";

                if (_.isNullUndef(fieldsValues)) {
                    return this;
                }

                if (!_.isObjectNotArray(fieldsValues) && !_.isString(fieldsValues) && !_.isArrayOf(fieldsValues, _.isObjectNotArray, _.isString)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError(
                        'API_ERR_QUERY_API_3',
                        [
                            self.entityName,
                            '',
                            fname,
                            'string or array of strings representing tag names or ' +
                            'object or array of objects representing tag objects',
                            helpers.toType(fieldsValues)
                        ]
                    );
                }

                // Number of sub reqs can't be 0 because we need MAIN
                // or over one because tags could be used only once currently
                // this however may change in near future
                if (reqMan.getProp(0, reqMan.PROPS.IS_MAIN) !== true) {
                    //tags functionality could not be used with multiple annotations passed
                    errMan.throwError('API_ERR_QUERY_API_6', [self.entityName, fname, 'annotations']);
                }

                // main request has to be created
                if (!reqMan.isCreate(0)) {
                    // Annotations: tags method can be used only with create operation(s)
                    errMan.throwError('API_ERR_QUERY_API_5', [self.entityName, fname, 'create']);
                }

                // in case the passed object is string not an object
                // then we assume this is a tag name that should go to the 'value' field.
                fieldsValues = tagsEntity.tagNamesToValues(fieldsValues);

                tagsEntity._additionalActions.create &&
                this._additionalActions.create(fieldsValues);

                fieldsValues = _.isObjectNotArray(fieldsValues) ? [fieldsValues] : fieldsValues;

                _.each(fieldsValues, function (item) {
                    if (!_.isUndefined(item) && !_.isUndefined(item[config.SETTINGS.Metadata.Tag.navigationProperties.Tag_annotation_Source.field])) {
                        //Tags: annotation_id field is populated populated automatically,
                        //so annotation_id : 1 is invalid and it cannot be used tags() method
                        errMan.throwError(
                            'API_ERR_QUERY_API_7',
                            [
                                'Tags',
                                config.SETTINGS.Metadata.Tag.navigationProperties.Tag_annotation_Source.field,
                                item[config.SETTINGS.Metadata.Tag.navigationProperties.Tag_annotation_Source.field],
                                fname
                            ]
                        );
                    }

                    // VV - populating content_id of each tag, if content_id is not present
                    // queryApiValidator would throw an error for annotation object,
                    // so no validation is needed
                    var contentId = reqMan.getProp(0, reqMan.PROPS.FIELDS_VALUES).content_id;
                    _.each(fieldsValues, function (item) {
                        item.content_id = contentId;
                    });

                    tagsEntity._validateFieldsValues(item);
                    var idx = reqMan.createSub(
                        config.CRUD.create,
                        false,
                        config.COLLECTIONS.tags.nameUppercase
                    );
                    reqMan.setProp(idx, reqMan.PROPS.FIELDS_VALUES, item);
                    reqMan.setProp(
                        idx,
                        reqMan.PROPS.FOREIGN_KEY_REF,
                        config.SETTINGS.Metadata.Tag.navigationProperties.Tag_annotation_Source
                    );
                    reqMan.setProp(
                        idx,
                        reqMan.PROPS.BASE_URL,
                        tagsEntity._getBaseURL(config.CRUD.create)
                    );

                    //Cannot be used with createImage() method
                    queryApiValidators.validateMutuallyExclusiveMethods(self.entityName,
                        config.CONFLICTED_METHODS.create.tags.name,
                        config.CRUD.create);

                    reqMan.setProp(
                        idx,
                        reqMan.PROPS.CONFLICTING_METHOD,
                        config.CONFLICTED_METHODS.create.tags.name);
                });

                return this;
            },

            forVisibility: function (currentVisibilityId) {
                if (!reqMan.isUpdate(reqMan.getLastIdx())) {
                    //'{0}: {1} method allowed only with {2} operation'
                    errMan.throwError('API_ERR_QUERY_API_5', [this.entityName, 'forVisibility', 'update']);
                }
                if (!_.isNumber(currentVisibilityId)) {
                    /*
                     * Annotations: param current_visibility_id for method forVisibility
                     * must be number but it is someType instead
                     */
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'current_visibility_id', 'forVisibility', 'number', helpers.toType(currentVisibilityId)]);
                }

                if (_.isNullUndef(this._annotationVisibility)) {
                    this._annotationVisibility = {};
                }
                this._annotationVisibility.currentVisibilityId = currentVisibilityId;
                return this;
            },

            visibilityInclude: function (visibilityInclude) {
                if (!reqMan.isUpdate(reqMan.getLastIdx())) {
                    //'{0}: {1} method allowed only with {2} operation'
                    errMan.throwError(
                        'API_ERR_QUERY_API_5',
                        [this.entityName, 'visibilityInclude', 'update']
                    );
                }

                if (_.isUndefined(this._annotationVisibility)) {
                    this._annotationVisibility = {};
                }
                this._annotationVisibility.includeClients = visibilityInclude;
                return this;
            },

            visibilityExclude: function (visibilityExclude) {
                if (!reqMan.isUpdate(reqMan.getLastIdx())) {
                    //'{0}: {1} method allowed only with {2} operation'
                    errMan.throwError(
                        'API_ERR_QUERY_API_5',
                        [this.entityName, 'visibilityExclude', 'update']
                    );
                }

                if (_.isUndefined(this._annotationVisibility)) {
                    this._annotationVisibility = {};
                }
                this._annotationVisibility.excludeClients = visibilityExclude;
                return this;
            },

            _processVisibilityUpdate: function () {
                if (_.isNullUndef(this._annotationVisibility)) {
                    return;
                }

                if (reqMan.getLen() > 1) {

                    //IC 20140926 - temporary fix to remove current visibility when error is thrown
                    this._annotationVisibility = undefined;
                    //Annotations: visibility change method cannot be used  with
                    //multiple visibilities passed
                    errMan.throwError('API_ERR_QUERY_API_6', [this.entityName, "'Visibility change", 'visibilities']);
                }

                if (_.isUndefined(this._annotationVisibility.currentVisibilityId) ||
                    (_.isUndefined(this._annotationVisibility.includeClients) &&
                    _.isUndefined(this._annotationVisibility.excludeClients))
                ) {
                    this._annotationVisibility = null;
                    //{0}: method {1} expects {2}
                    errMan.throwError('API_ERR_QUERY_API_4',
                        [this.entityName, 'forVisibility', 'visibilityInclude, visibilityExclude or both']);
                }

                reqMan.setProp(
                    reqMan.getLastIdx(),
                    reqMan.PROPS.FIELDS_VALUES,
                    {
                        visibility_id: helpers
                            .updateVisibilityIdByNames(this._annotationVisibility, this.entityName)
                    }
                );
                this._annotationVisibility = null;
            },

            // WSi 20141013: Aliases don't work in the current form on IE. We will revisit
            // them when refactoring queryAPI.
            //findTags: function findTags() {return this.withTags(helpers.isFunSwitchEnabled(arguments));},
            withTags: function withTags() {

                //fetches tags stored in annotations in a single call
                var fname = "withTags()", idx;

                if (reqMan.getLen() > 0 && !reqMan.isFindFamily(0)) {
                    // Annotations: withTags() method can be used only with find operations
                    errMan.throwError('API_ERR_QUERY_API_5', [this.entityName, fname, 'find']);
                }
                idx = reqMan.getLastIdx();
                if (helpers.isFunSwitchEnabled(arguments) && _.isUndefined(reqMan.getProp(idx, reqMan.PROPS.NEXT))) {

                    reqMan.updateSubs(reqMan.PROPS.EXPAND_FOR, [config.COLLECTIONS.tags.expandName]);

                }

                //cannot be used with findImage() method
                queryApiValidators.validateMutuallyExclusiveMethods(this.entityName,
                    config.CONFLICTED_METHODS.find.withTags.name,
                    config.CRUD.find);

                reqMan.setProp(
                    idx,
                    reqMan.PROPS.CONFLICTING_METHOD,
                    config.CONFLICTED_METHODS.find.withTags.name
                );

                return this;
            },

            withSharedOnly: function () {
                //used by student to get only notes shared to him by teacher
                var idx;

                if (reqMan.getLen() > 0 && !reqMan.isFindFamily(0)) {
                    // Annotations: withSharedOnly method can be used only with find operations
                    errMan.throwError('API_ERR_QUERY_API_5',
                        [this.entityName, config.EXPANDING_METHODS.withSharedOnly, 'find']);
                }

                idx = reqMan.getLastIdx();

                //cannot be used with findImage() method
                queryApiValidators.validateMutuallyExclusiveMethods(this.entityName,
                    config.CONFLICTED_METHODS.find.withSharedOnly.name,
                    config.CRUD.find);

                reqMan.setProp(
                    idx,
                    reqMan.PROPS.CONFLICTING_METHOD,
                    config.CONFLICTED_METHODS.find.withSharedOnly.name
                );

                if (helpers.isFunSwitchEnabled(arguments) && _.isUndefined(reqMan.getProp(idx, reqMan.PROPS.NEXT))) {

                    var param = {};
                    param[config.QUERY_PARAMS.option] = config.ANNO2_WITH_SHARED_ONLY;

                    reqMan.updateSubs(reqMan.PROPS.EXPAND_FOR, [config.COLLECTIONS.annotationSharedWith.expandName]);
                    reqMan.updateSubs(reqMan.PROPS.QUERY_PARAMS, param);

                }

                return this;
            },

            withShared: function () {

                //returns both shared and own annotations
                var idx;

                if (reqMan.getLen() > 0 && !reqMan.isFindFamily(0)) {
                    // Annotations: withShared method can be used only with find operations
                    errMan.throwError('API_ERR_QUERY_API_5',
                        [this.entityName, config.EXPANDING_METHODS.withShared, 'find']);
                }

                idx = reqMan.getLastIdx();

                //cannot be used with findImage() method
                queryApiValidators.validateMutuallyExclusiveMethods(this.entityName,
                    config.CONFLICTED_METHODS.find.withShared.name,
                    config.CRUD.find);

                reqMan.setProp(
                    idx,
                    reqMan.PROPS.CONFLICTING_METHOD,
                    config.CONFLICTED_METHODS.find.withShared.name
                );

                if (helpers.isFunSwitchEnabled(arguments) && _.isUndefined(reqMan.getProp(idx, reqMan.PROPS.NEXT))) {
                    var param = {};

                    param[config.QUERY_PARAMS.option] = config.ANNO2_WITH_SHARED;
                    reqMan.updateSubs(reqMan.PROPS.EXPAND_FOR, [config.COLLECTIONS.annotationSharedWith.expandName]);
                    reqMan.updateSubs(reqMan.PROPS.QUERY_PARAMS, param);

                }

                return this;
            },

            myNotSharedToOthers: function () {
                //Used from teacher role to enable him to find only his own annotations
                //that are not shared with anyone (students)
                var idx;

                if (reqMan.getLen() > 0 && !reqMan.isFindFamily(0)) {
                    // Annotations: myNotSharedToOthers method can be used only with find operations
                    errMan.throwError('API_ERR_QUERY_API_5',
                        [this.entityName, config.EXPANDING_METHODS.myNotSharedToOthers, 'find']);
                }
                idx = reqMan.getLastIdx();

                //cannot be used with findImage() method
                queryApiValidators.validateMutuallyExclusiveMethods(this.entityName,
                    config.CONFLICTED_METHODS.find.myNotSharedToOthers.name,
                    config.CRUD.find);

                reqMan.setProp(
                    idx,
                    reqMan.PROPS.CONFLICTING_METHOD,
                    config.CONFLICTED_METHODS.find.myNotSharedToOthers.name
                );

                if (helpers.isFunSwitchEnabled(arguments) && _.isUndefined(reqMan.getProp(idx, reqMan.PROPS.NEXT))) {
                    var param = {};
                    param[config.QUERY_PARAMS.option] = config.ANNO2_MY_NOT_SHARED_TO_OTHERS;
                    //sets option = 3
                    reqMan.updateSubs(reqMan.PROPS.QUERY_PARAMS, param);
                }

                return this;
            },
            //IC - Used from teacher role to enable him to find only his own annotations
            //that are shared with students
            mySharedToOthers: function () {
                var idx;
                //cannot be used with findOne
                if (reqMan.getLen() > 0 && !reqMan.isFind(0)) {
                    // Annotations: mySharedToOthers method can be used only with find operations
                    errMan.throwError('API_ERR_QUERY_API_5',
                        [this.entityName, config.EXPANDING_METHODS.mySharedToOthers, 'find']);
                }

                idx = reqMan.getLastIdx();

                //cannot be used with findImage() method
                queryApiValidators.validateMutuallyExclusiveMethods(this.entityName,
                    config.CONFLICTED_METHODS.find.mySharedToOthers.name,
                    config.CRUD.find);

                reqMan.setProp(
                    idx,
                    reqMan.PROPS.CONFLICTING_METHOD,
                    config.CONFLICTED_METHODS.find.mySharedToOthers.name
                );

                if (helpers.isFunSwitchEnabled(arguments) && _.isUndefined(reqMan.getProp(idx, reqMan.PROPS.NEXT))) {
                    var param = {};

                    param[config.QUERY_PARAMS.option] = config.ANNO2_WITH_NO_SHARED;
                    //name could be missleading here, it sets option=0, because this is used from
                    //teacher perspective and enables him to find only his annotations (that are shared)
                    reqMan.updateSubs(reqMan.PROPS.EXPAND_FOR, [config.COLLECTIONS.annotationSharedWith.expandName]);
                    reqMan.updateSubs(reqMan.PROPS.QUERY_PARAMS, param);

                    _.extend(this._filtersObj, {$any: {shared_with: {id: {$gt: 0}}}});
                    //creates: annotations2?$expand=shared_with,tags&option=0&$filter=shared_with/any(t:t/id gt 0)
                }

                return this;
            },

            //VV - this function is used to expand annotations with annotationSharedWith entity
            //please notice that option = 0 (displaying only users annotations) is added in queryAPI
            withSharedAnnotations: function () {

                if (reqMan.getLen() > 0 && !reqMan.isFindFamily(0)) {
                    // Annotations: withSharedAnnotations method can be used only with find operations
                    errMan.throwError('API_ERR_QUERY_API_5', [this.entityName, config.EXPANDING_METHODS.withSharedAnnotations, 'find']);
                }

                if (helpers.isFunSwitchEnabled(arguments) && _.isUndefined(reqMan.getProp(reqMan.getLastIdx(), reqMan.PROPS.NEXT))) {
                    reqMan.updateSubs(reqMan.PROPS.EXPAND_FOR, [config.COLLECTIONS.annotationSharedWith.expandName]);
                }

                return this;
            },

            findAllAnnotationsByText: function (findText, filters) {
                var that = this;

                var _findAllAnnotationsByText = function (singleFindText, index) {
                    if (!_.isString(singleFindText)) {

                        // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                        errMan.throwError('API_ERR_QUERY_API_3',
                            [that.entityName, 'text', 'findAllAnnotationsByText', 'string', helpers.toType(singleFindText)], index);
                    }
                    var isBatch = _.isNumber(index);
                    that._customOperation(
                        //filters,
                        null,
                        config.CUSTOM_ENDPOINTS.FIND_ALL_ANNOTATIONS_BY_TEXT,
                        config.CRUD.find,
                        null,
                        isBatch
                    );

                    //CI - Why only a string? Because this sets custom endpoint, so it is in my
                    //opinion pointless to allow falsy values
                    //and do additional logic (close to a hack having our current implementaion
                    //in mind) not to set the URL.

                    // has to be in final format ...text='wrapped_by_quotes'...
                    singleFindText = _.wrapInto(singleFindText, "'");

                    var param = {};
                    param[config.QUERY_PARAMS.text] = singleFindText;
                    if (isBatch) {
                        reqMan.setProp(index, reqMan.PROPS.QUERY_PARAMS, param);
                    } else {
                        reqMan.updateSubs(reqMan.PROPS.QUERY_PARAMS, param);
                    }
                    //reqMan.setProp(0, reqMan.PROPS.QUERY_PARAMS, param);

                };

                if (_.isArray(findText)) {
                    _.each(findText, function (singleFindText, index) {
                        _findAllAnnotationsByText(singleFindText, index);
                    });
                } else {
                    _findAllAnnotationsByText(findText);
                }

                this.filters(filters);

                return this;
            },

            getInfo: function () {
                var returnObject = this.info();

                if (!_.isUndefined(config.SETTINGS.FieldsSettableOnCreationOnly[this.entityName])) {
                    returnObject.FieldsSettableOnCreationOnly = config.SETTINGS.FieldsSettableOnCreationOnly[this.entityName];
                }
                if (!_.isUndefined(config.SETTINGS.ReadOnlyFields[this.entityName])) {
                    returnObject.ReadOnlyFields = config.SETTINGS.ReadOnlyFields[this.entityName];
                }
                if (!_.isUndefined(config.SETTINGS.RequiredFields[this.entityName])) {
                    returnObject.REQUIRED_FIELDS = config.SETTINGS.RequiredFields[this.entityName];
                }
                if (!_.isUndefined(config.SETTINGS.AnnotationTypes)) {
                    returnObject.AnnotationTypes = config.SETTINGS.AnnotationTypes;
                }

                if (config.FORCE_DEFAULT_SERVICE_SETTINGS) {
                    returnObject.SETTINGS_SOURCE = 'client_defaults';
                } else {
                    returnObject.SETTINGS_SOURCE = 'service';
                }
                return returnObject;
            },

            // WSi 20141013: Aliases don't work in the current form on IE. We will revisit
            // them when refactoring queryAPI.
            // createChildAnnotations: function createChildAnnotations(fv) {
            //     return this.childAnnotations(fv);
            // },

            childAnnotations: function childAnnotations(fieldsValues) {
                // WSi TODO 20140908 IMPORTANT
                // Check if main operation is set here and any other similar function
                var self = this,
                    fname = "childAnnotations()";

                if (_.isNullUndef(fieldsValues)) {
                    return this;
                }

                if (!_.isObjectNotArray(fieldsValues) && !_.isArrayOf(fieldsValues, _.isObjectNotArray)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError(
                        'API_ERR_QUERY_API_3',
                        [
                            self.entityName,
                            '',
                            fname,
                            'object or array of objects',
                            helpers.toType(fieldsValues)
                        ]
                    );
                }

                if (reqMan.getProp(0, reqMan.PROPS.IS_MAIN) !== true) {
                    //Annotations: childAnnotations functionality could not be used with multiple annotations passed
                    errMan.throwError('API_ERR_QUERY_API_6', [this.entityName, fname, 'annotations']);
                }

                //if (!this.request.isCreate()) {
                if (!reqMan.isCreate(0)) {
                    // {0}: {1} method can be used only with {2} operation(s)
                    errMan.throwError(
                        'API_ERR_QUERY_API_5',
                        [self.entityName, fname, 'create']
                    );
                }

                this._additionalActions.create && this._additionalActions.create(fieldsValues);

                // it is possible to pass empty object or some other wrong thing and cause a http request failure.
                // dependent items must be validated in the same way as parents are

                fieldsValues = _.isObjectNotArray(fieldsValues) ? [fieldsValues] : fieldsValues;

                _.each(fieldsValues, function (item) {
                    if (!_.isUndefined(item) && !_.isUndefined(item[config.SETTINGS.Metadata.Annotation.navigationProperties.Annotation_parent_Source.field])) {
                        //Annotations: parent_id field is populated automatically, so parent_id : 1 is invalid and it cannot be used here
                        errMan.throwError(
                            'API_ERR_QUERY_API_7',
                            [
                                self.entityName,
                                config.SETTINGS.Metadata.Annotation.navigationProperties.Annotation_parent_Source.field,
                                item[config.SETTINGS.Metadata.Annotation.navigationProperties.Annotation_parent_Source.field],
                                fname
                            ]
                        );
                    }

                    self._validateFieldsValues(item);

                    var idx = reqMan.createSub(
                        config.CRUD.create,
                        false,
                        config.COLLECTIONS.annotations.nameUppercase
                    );

                    //cannot be used with createImage() method
                    queryApiValidators.validateMutuallyExclusiveMethods(self.entityName,
                        config.CONFLICTED_METHODS.create.childAnnotations.name,
                        config.CRUD.create);

                    reqMan.setProp(
                        idx,
                        reqMan.PROPS.CONFLICTING_METHOD,
                        config.CONFLICTED_METHODS.create.childAnnotations.name);

                    reqMan.setProp(idx, reqMan.PROPS.FIELDS_VALUES, item);
                    reqMan.setProp(
                        idx,
                        reqMan.PROPS.FOREIGN_KEY_REF,
                        config.SETTINGS.Metadata.Annotation.navigationProperties.Annotation_parent_Source
                    );
                    reqMan.setProp(idx, reqMan.PROPS.BASE_URL, self._getBaseURL(config.CRUD.create));
                });

                return this;
            },

            findComments: function (filters) {

                //IC 20141001 - disallowing string
                //if (!_.isObjectNotArray(filters) && !_.isUndefined(filters)) {
                if (!_.isObjectNotArray(filters) && !_.isUndefined(filters) && !_.isArrayOf(filters, _.isObject)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, '', 'findComments', 'object, array of objects or undefined', helpers.toType(filters)]);
                }

                this._customOperation(
                    filters,
                    config.CUSTOM_ENDPOINTS.FIND_COMMENTS,
                    config.CRUD.find
                );
                return this;
            },

            forTags: function (tags) {
                var that = this;
                var fnName = 'forTags';
                //var requestLength = reqMan.getLen();

                var _forTags = function (tag, index) {
                    if (!_.isString(tag) && !_.isArrayOfStrings(tag)) {
                        // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                        errMan.throwError('API_ERR_QUERY_API_3', ['Annotations', 'tags', 'forTags', 'string or array of strings'
                                , helpers.toType(tag)],
                            index);
                    }
                    that._validateFind('forTags');
                    //tag = _.isString(tag) ? [tag] : tag;

                    if (_.isNumber(index)) {
                        reqMan.setProp(
                            index,
                            reqMan.PROPS.FILTERS,
                            {$any: {tags: {value: tags}}}
                        );
                    } else {
                        // We are just adding below to the current filter:
                        //$any: {tags: {value: ['tag1', 'tag2']}}
                        reqMan.updateSubs(
                            reqMan.PROPS.FILTERS,
                            {$any: {tags: {value: tags}}}
                        );
                    }

                };

                //if batch
                if (_.isArrayOf(tags, _.isArray, _.isNull)) {
                    queryApiValidators.validateBatchGetItemsNumber(tags, fnName);

                    _.each(tags, function (tag, index) {
                        _forTags(tag, index);
                    });

                } else {
                    _forTags(tags);
                }

                return this.withTags();
            },

            getCountForContainers: function (containerIds) {
                var that = this;

                if (!_.isNumber(containerIds) && !_.isArrayOf(containerIds, _.isNumber)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3', ['Annotations', 'containerIds', 'getCountForContainers', 'number or array of numbers', helpers.toType(containerIds)]);
                }
                containerIds = _.isNumber(containerIds) ? [containerIds] : containerIds;

                _.each(containerIds, function (containerId) {
                    var parentContainerFilter = {};
                    parentContainerFilter[config.COLLECTIONS.containers.expandName + '/parent_id'] = containerId;

                    var param = {
                        $or: [
                            {container_id: containerId},
                            parentContainerFilter]
                    };
                    var subidx = reqMan.createSub(
                        config.CRUD.find,
                        true,
                        config.COLLECTIONS.annotations.nameUppercase
                    );
                    reqMan.setProp(subidx, reqMan.PROPS.EXPAND_FOR, [config.COLLECTIONS.containers.expandName]);
                    reqMan.setProp(subidx, reqMan.PROPS.BASE_URL, that._getBaseURL(config.CRUD.find));
                    reqMan.setProp(subidx, reqMan.PROPS.FILTERS, param);

                    //$top = 0
                    reqMan.setProp(reqMan.getLastIdx(), reqMan.PROPS.LIMIT_COUNT, 0);

                    reqMan.setProp(
                        subidx,
                        reqMan.PROPS.INLINE_COUNT,
                        helpers.isFunSwitchEnabled(arguments)
                    );

                });
                return this;
            },

            forContainer: function (containerId) {
                var that = this;
                var fnName = 'forContainer';
                var container = config.COLLECTIONS.containers.expandName;

                var _forContainer = function (contId, index) {
                    if (!_.isNumber(contId)) {
                        // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                        errMan.throwError('API_ERR_QUERY_API_3',
                            [that.entityName, 'id', 'forContainer', 'number', helpers.toType(containerId)],
                            index);
                    }

                    // can be only used with find at the moment..
                    that._validateFind("forContainer");

                    if (_.isNumber(index)) {
                        if (!that._filtersObj[index].$sub) {
                            that._filtersObj[index].$sub = {};
                        }
                        that._filtersObj[index].$sub[container] = {id: contId};
                    } else {
                        if (!that._filtersObj.$sub) {
                            that._filtersObj.$sub = {};
                        }
                        that._filtersObj.$sub[container] = {id: containerId};
                    }
                };

                if (_.isArray(containerId)) {
                    _.each(containerId, function (contId, index) {
                        queryApiValidators.validateBatchGetItemsNumber(containerId, fnName);
                        if (_.isNull(contId)) {
                            return;
                        }

                        _forContainer(contId, index);
                    });
                } else {
                    _forContainer(containerId);
                }

                return this;
            },

            withChildContainers: function () {
                if (!helpers.isFunSwitchEnabled(arguments)) {
                    return this;
                }

                var container = config.COLLECTIONS.containers.expandName;

                // this can't be run without using forContainer()
                if (!this._filtersObj || !this._filtersObj.$sub || !this._filtersObj.$sub[container] || !this._filtersObj.$sub[container].id) {

                    // method {0} can be used only with {1}
                    errMan.throwError(
                        'API_ERR_QUERY_API_14',
                        ['withChildContainers', 'forContainer']
                    );
                }

                var containerId = this._filtersObj.$sub[container].id;
                this._filtersObj.$sub[container] =
                {$or: [{id: containerId}, {parent_id: containerId}]};

                return this;
            },

            findCommentedAnnotations: function (filters, findText) {

                //we are allowing findText param not to be passed, therefore undefined is allowed
                if (!_.isString(findText) && !_.isUndefined(findText)) {

                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'findText', 'findCommentedAnnotations', 'string', helpers.toType(findText)]);
                }

                if (!_.isObjectNotArray(filters) && !_.isUndefined(filters)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, '', 'findCommentedAnnotations', 'object or undefined', helpers.toType(filters)]);
                }

                this._customOperation(
                    filters,
                    config.CUSTOM_ENDPOINTS.FIND_COMMENTED_ANNOTATIONS,
                    config.CRUD.find
                );
                if (_.isString(findText) && findText.trim() !== '') {
                    // has to be in final format ...text='wrapped_by_quotes'...

                    //VV - copied part of code from findAllAnnotationsByText
                    //CI - Why only a string? Because this sets custom endpoint, so it is in my
                    //opinion pointless to allow falsy values
                    //and do additional logic (close to a hack having our current implementaion
                    //in mind) not to set the URL.

                    findText = _.wrapInto(findText, "'");

                    var param = {};
                    param[config.QUERY_PARAMS.text] = findText;
                    reqMan.setProp(0, reqMan.PROPS.QUERY_PARAMS, param);
                }
                return this;

            },

            createImage: function (fieldsValues, base64image) {

                if (!helpers.isFunSwitchEnabled(arguments)) {
                    return this;
                }

                queryApiValidators.doInitCheck();

                var self = this,
                    fName = "createImage()",
                    re = /data:image\/png;base64,/;

                //fieldValues validation

                if (_.isNullUndef(fieldsValues)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'fieldValues', fName, 'object', 'empty']);
                }
                if (!_.isObjectNotArray(fieldsValues)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'fieldValues', fName, 'object', helpers.toType(fieldsValues)]);
                }

                //base64image validation

                if (_.isNullUndef(base64image)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'base64image', fName, 'base64 encoded image', 'empty']);
                }
                if (!re.test(base64image)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'base64image', fName, 'base64 encoded image', helpers.toType(base64image)]);
                }

                //set created_by_client_id if it is missing

                self._additionalActions.create &&
                self._additionalActions.create(fieldsValues);

                self._validateFieldsValues(fieldsValues);

                self._validateNoRequestsCreated('create');

                self._customOperation(
                    fieldsValues,
                    config.CUSTOM_ENDPOINTS.CREATE_IMAGE,
                    config.CRUD.create
                );

                var idx = reqMan.getLastIdx();

                queryApiValidators.validateMutuallyExclusiveMethods(self.entityName,
                    config.CONFLICTED_METHODS.create.createImage.name,
                    config.CRUD.create);

                reqMan.setProp(
                    idx,
                    reqMan.PROPS.CONFLICTING_METHOD,
                    config.CONFLICTED_METHODS.create.createImage.name);

                reqMan.setProp(idx, reqMan.PROPS.IS_WEBAPI, true);
                reqMan.setProp(idx, reqMan.PROPS.IS_CUSTOM_HEAD, true); // for custom oData call
                reqMan.setProp(idx, reqMan.PROPS.BASE_URL, self._getBaseURL(config.CUSTOM_ENDPOINTS.CREATE_IMAGE, true));
                reqMan.setProp(idx, reqMan.PROPS.FIELDS_VALUES, fieldsValues);
                reqMan.setProp(idx, reqMan.PROPS.BASE_64_IMAGE, base64image); //used in oData
                reqMan.setProp(idx, reqMan.PROPS.FILE_NAME, 'canvas_image.png'); //used in oData

                return self;
            },

            createWithFile: function (fieldValues, fileName, fileContents) {
                var fileExtension = fileName.split('.').pop();

                queryApiValidators.doInitCheck();

                var self = this,
                    fName = "createWithFile()";
                var imageContentsRegex = /data:image\/png;base64,/;

                if (_.isNullUndef(fieldValues)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'fieldValues', fName, 'object', 'empty']);
                }
                if (!_.isObjectNotArray(fieldValues)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'fieldValues', fName, 'object', helpers.toType(fieldValues)]);
                }

                if (_.isNullUndef(fileContents)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'base64image', fName, 'base64 encoded image', 'empty']);
                }

                if (this._supportedUploadFileTypes.indexOf(fileExtension) < 0) {
                    throw new Error(fileExtension + ' is not supported');
                }

                if (fileExtension === 'png' && !imageContentsRegex.test(fileContents)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'base64image', fName, 'base64 encoded image', helpers.toType(base64image)]);
                }

                //set created_by_client_id if it is missing

                self._additionalActions.create &&
                self._additionalActions.create(fieldValues);

                self._validateFieldsValues(fieldValues);

                self._validateNoRequestsCreated('create');

                self._customOperation(
                    fieldValues,
                    config.CUSTOM_ENDPOINTS.CREATE_IMAGE,
                    config.CRUD.create
                );

                var idx = reqMan.getLastIdx();

                queryApiValidators.validateMutuallyExclusiveMethods(self.entityName,
                    config.CONFLICTED_METHODS.create.createWithFile.name,
                    config.CRUD.create);

                reqMan.setProp(
                    idx,
                    reqMan.PROPS.CONFLICTING_METHOD,
                    config.CONFLICTED_METHODS.create.createWithFile.name
                );

                reqMan.setProp(idx, reqMan.PROPS.IS_WEBAPI, true);
                reqMan.setProp(idx, reqMan.PROPS.IS_CUSTOM_HEAD, true); // for custom oData call
                reqMan.setProp(idx, reqMan.PROPS.BASE_URL, self._getBaseURL(config.CUSTOM_ENDPOINTS.CREATE_IMAGE, true));
                reqMan.setProp(idx, reqMan.PROPS.FIELDS_VALUES, fieldValues);
                reqMan.setProp(idx, reqMan.PROPS.BASE_64_IMAGE, fileContents); //used in oData
                reqMan.setProp(idx, reqMan.PROPS.FILE_NAME, fileName); //used in oData

                return self;
            },

            getFileUrl: function (annotationId) {

                var fName = "getFileUrl()";

                //annotationId validation

                if (_.isNullUndef(annotationId)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'annotation_id', fName, 'number', 'empty']);
                }
                if (!_.isNumber(annotationId)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'annotation_id', fName, 'number', helpers.toType(annotationId)]);
                }

                this._customOperation(
                    annotationId,
                    config.CUSTOM_ENDPOINTS.FIND_IMAGE,
                    config.CRUD.findOne
                );

                queryApiValidators.validateMutuallyExclusiveMethods(this.entityName,
                    config.CONFLICTED_METHODS.find.getFileUrl.name,
                    config.CRUD.find);

                var idx = reqMan.getLastIdx();

                reqMan.setProp(
                    idx,
                    reqMan.PROPS.CONFLICTING_METHOD,
                    config.CONFLICTED_METHODS.find.getFileUrl.name
                );
                reqMan.setProp(idx, reqMan.PROPS.IS_WEBAPI, true);
                reqMan.setProp(idx, reqMan.PROPS.ID, annotationId);

                return this;
            },

            updateWithFile: function (annotationId, fieldsValues, fileName, fileContents) {
                var fileExtension = fileName.split('.').pop();

                var self = this,
                    fName = "updateWithFile()";
                var imageContentsRegex = /data:image\/png;base64,/;
                //base64image validation

                if (_.isNullUndef(fileContents)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'base64image', fName, 'base64 encoded image', 'empty']);
                }

                if (fileExtension === 'png' && !imageContentsRegex.test(fileContents)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'base64image', fName, 'base64 encoded image', helpers.toType(fileContents)]);
                }

                if (this._supportedUploadFileTypes.indexOf(fileExtension) < 0) {
                    throw new Error(fileExtension + ' is not supported');
                }

                //set created_by_client_id if it is missing

                self._additionalActions.update &&
                self._additionalActions.update(fieldsValues);

                self._validateNoRequestsCreated('update');

                self._customOperation(
                    annotationId,
                    config.CUSTOM_ENDPOINTS.UPDATE_IMAGE,
                    config.CRUD.update
                );

                var idx = reqMan.getLastIdx();
                reqMan.setProp(idx, reqMan.PROPS.IS_WEBAPI, true);
                reqMan.setProp(idx, reqMan.PROPS.REQ_TYPE, config.REQ_TYPE_PUT);
                reqMan.setProp(idx, reqMan.PROPS.IS_CUSTOM_HEAD, true);
                reqMan.setProp(idx, reqMan.PROPS.FIELDS_VALUES, fieldsValues);
                reqMan.setProp(idx, reqMan.PROPS.BASE_URL, self._getBaseURL(config.CUSTOM_ENDPOINTS.UPDATE_IMAGE));
                reqMan.setProp(idx, reqMan.PROPS.ID, annotationId);
                reqMan.setProp(idx, reqMan.PROPS.BASE_64_IMAGE, fileContents);
                reqMan.setProp(idx, reqMan.PROPS.FILE_NAME, fileName); //used in oData

                return self;

            },

            removeWithFile: function (annotationId) {

                var fName = "removeWithFile()";

                //fieldValues validation

                if (_.isNullUndef(annotationId)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'annotation_id', fName, 'number', 'empty']);
                }
                if (!_.isNumber(annotationId)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'annotation_id', fName, 'number', helpers.toType(annotationId)]);
                }

                this._customOperation(
                    annotationId,
                    config.CUSTOM_ENDPOINTS.REMOVE_IMAGE,
                    config.CRUD.remove
                );

                var idx = reqMan.getLastIdx();
                reqMan.setProp(idx, reqMan.PROPS.IS_WEBAPI, true);
                reqMan.setProp(idx, reqMan.PROPS.ID, annotationId);

                return this;
            },

            findImage: function (annotationId) {

                var fName = "findImage()";

                //annotationId validation

                if (_.isNullUndef(annotationId)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'annotation_id', fName, 'number', 'empty']);
                }
                if (!_.isNumber(annotationId)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'annotation_id', fName, 'number', helpers.toType(annotationId)]);
                }

                this._customOperation(
                    annotationId,
                    config.CUSTOM_ENDPOINTS.FIND_IMAGE,
                    config.CRUD.findOne
                );

                queryApiValidators.validateMutuallyExclusiveMethods(this.entityName,
                    config.CONFLICTED_METHODS.find.findImage.name,
                    config.CRUD.find);

                var idx = reqMan.getLastIdx();

                reqMan.setProp(
                    idx,
                    reqMan.PROPS.CONFLICTING_METHOD,
                    config.CONFLICTED_METHODS.find.findImage.name
                );
                reqMan.setProp(idx, reqMan.PROPS.IS_WEBAPI, true);
                reqMan.setProp(idx, reqMan.PROPS.ID, annotationId);

                return this;
            },

            updateImage: function (annotationId, fieldsValues, base64image) {

                var self = this,
                    fName = "updateImage()",
                    re = /data:image\/png;base64,/;

                //base64image validation

                if (_.isNullUndef(base64image)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'base64image', fName, 'base64 encoded image', 'empty']);
                }
                if (!re.test(base64image)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'base64image', fName, 'base64 encoded image', helpers.toType(base64image)]);
                }

                //set created_by_client_id if it is missing

                self._additionalActions.update &&
                self._additionalActions.update(fieldsValues);

                self._validateNoRequestsCreated('update');

                self._customOperation(
                    annotationId,
                    config.CUSTOM_ENDPOINTS.UPDATE_IMAGE,
                    config.CRUD.update
                );

                var idx = reqMan.getLastIdx();
                reqMan.setProp(idx, reqMan.PROPS.IS_WEBAPI, true);
                reqMan.setProp(idx, reqMan.PROPS.REQ_TYPE, config.REQ_TYPE_PUT);
                reqMan.setProp(idx, reqMan.PROPS.IS_CUSTOM_HEAD, true);
                reqMan.setProp(idx, reqMan.PROPS.FIELDS_VALUES, fieldsValues);
                reqMan.setProp(idx, reqMan.PROPS.BASE_URL, self._getBaseURL(config.CUSTOM_ENDPOINTS.UPDATE_IMAGE));
                reqMan.setProp(idx, reqMan.PROPS.ID, annotationId);
                reqMan.setProp(idx, reqMan.PROPS.BASE_64_IMAGE, base64image);
                reqMan.setProp(idx, reqMan.PROPS.FILE_NAME, 'canvas_image.png'); //used in oData

                return self;

            },

            removeImage: function (annotationId) {

                var fName = "removeImage()";

                //fieldValues validation

                if (_.isNullUndef(annotationId)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'annotation_id', fName, 'number', 'empty']);
                }
                if (!_.isNumber(annotationId)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'annotation_id', fName, 'number', helpers.toType(annotationId)]);
                }

                this._customOperation(
                    annotationId,
                    config.CUSTOM_ENDPOINTS.REMOVE_IMAGE,
                    config.CRUD.remove
                );

                var idx = reqMan.getLastIdx();
                reqMan.setProp(idx, reqMan.PROPS.IS_WEBAPI, true);
                reqMan.setProp(idx, reqMan.PROPS.ID, annotationId);

                return this;
            }
        };

        Annotations._reset = function () {
            Annotations._filtersObj = {};
            Annotations.desiredOrder = {};

            //CI - easy fix - solves the problem with annotation's visibility not being reset
            Annotations._annotationVisibility = null;
        };
        return Annotations.init();
    });
define(
    'containers', [
        'underscorenc',
        'config',
        'helpers',
        'transportManager',
        'client',
        'queryAPI',
        'info',
        'annotations',
        'errorManager',
        'requestManager'
    ],

    function (_, config, helpers, transportManager, client, queryAPI, info, annotationsEntity, errMan, reqMan) {
        var URLS = {
            'remove': {
                'service': helpers.templatify("containers(<%= id %>)")
            },
            'create': {
                'service': helpers.templatify("containers")
            },
            'update': {
                'service': helpers.templatify("containers(<%= id %>)")
            },
            'find': {
                'service': helpers.templatify("containers<%= tail %>")
            },
            'findOne': {
                'service': helpers.templatify("containers(<%= id %>)<%= tail %>")
            },
            'getSubmitted': {
                'service': helpers.templatify("SubmittedFolders<%= tail %>")
            }
        };

        var Containers = {
            entityName: 'Containers',

            _defaultTransport: transportManager.use(config.TRANSPORT_NAMES.ODATA),
            _transports: {},

            _request: {},

            _additionalActions: {},

            _urls: URLS,

            init: function () {
                _.defaults(this, queryAPI);

                _.extend(this, info);

                //errMan.subscribeToReset(this);

                //this.HELPERS.Parent = this;

                return this;
            },

            // WSi 20141013: Aliases don't work in the current form on IE. We will revisit
            // them when refactoring queryAPI.
            // createChildContainers: function createChildContainers(fv) {
            //     return this.childContainers(fv);
            // },
            childContainers: function childContainers(fieldsValues) {
                var self = this,
                    fname = "childContainers()";
                // (
                //     arguments.callee.caller.name === "childContainers" ?
                //     arguments.callee.caller.name : arguments.callee.name
                // ) + "()";

                if (_.isNullUndef(fieldsValues)) {
                    return this;
                }

                if (!_.isObjectNotArray(fieldsValues) && !_.isArrayOf(fieldsValues, _.isObjectNotArray)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError(
                        'API_ERR_QUERY_API_3',
                        [
                            self.entityName,
                            '',
                            fname,
                            'object or array of objects',
                            helpers.toType(fieldsValues)
                        ]
                    );
                }

                if (reqMan.getProp(0, reqMan.PROPS.IS_MAIN) !== true) {
                    //Containers: childContainers method could not be used with multiple annotations passed
                    errMan.throwError('API_ERR_QUERY_API_6', [this.entityName, fname, 'annotations']);
                }

                if (!reqMan.isCreate(0)) {
                    // {0}: {1} method can be used only with {2} operation(s)
                    errMan.throwError(
                        'API_ERR_QUERY_API_5',
                        [self.entityName, fname, 'create']
                    );
                }

                this._additionalActions.create && this._additionalActions.create(fieldsValues);

                fieldsValues = _.isObjectNotArray(fieldsValues) ? [fieldsValues] : fieldsValues;

                _.each(fieldsValues, function (item) {
                    if (!_.isUndefined(item) && !_.isUndefined(item[config.SETTINGS.Metadata.Container.navigationProperties.Container_parent_Source.field])) {
                        //Containers: parent_id field is populated populated automatically, so parent_id : 1 is invalid and it cannot be used here
                        errMan.throwError(
                            'API_ERR_QUERY_API_7', [
                                self.entityName,
                                config.SETTINGS.Metadata.Container.navigationProperties.Container_parent_Source.field,
                                item[config.SETTINGS.Metadata.Container.navigationProperties.Container_parent_Source.field],
                                fname
                            ]
                        );
                    }

                    self._validateFieldsValues(item);
                    var idx = reqMan.createSub(
                        config.CRUD.create,
                        false,
                        config.COLLECTIONS.containers.nameUppercase
                    );
                    reqMan.setProp(idx, reqMan.PROPS.FIELDS_VALUES, item);
                    reqMan.setProp(
                        idx,
                        reqMan.PROPS.FOREIGN_KEY_REF,
                        config.SETTINGS.Metadata.Container.navigationProperties.Container_parent_Source
                    );
                    reqMan.setProp(idx, reqMan.PROPS.BASE_URL, self._getBaseURL(config.CRUD.create));
                });

                return this;
            },

            //used by student to submit folder to a teacher
            submitTo: function (userId) {

                if (!helpers.isFunSwitchEnabled(arguments)) {
                    return this;
                }

                if (!_.isString(userId) && !_.isNull(userId)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [this.entityName, 'userId', 'submitTo', 'string', helpers.toType(userId)]);
                }

                if (!reqMan.isUpdate(reqMan.getLastIdx())) {
                    //CI: Maybe not best message for this? Docs will emphasize

                    //submitTo method is available only with update operations
                    errMan.throwError('API_ERR_QUERY_API_5', [this.entityName, 'submitTo', 'update']);
                }

                if (reqMan.getSubIndexesMatchingFilter({queryParams: [config.QUERY_PARAMS.submittedForUserId]}).length !== 0) {
                    //submitTo method can only be used once at a time
                    errMan.throwError('API_ERR_QUERY_API_16', ['submitTo']);
                }

                /*
                 * CI: as a friendly UX bonus we could also add check if that exact input
                 * has been already added and throw custom err based on that
                 *
                 */

                var param = {};
                param[config.QUERY_PARAMS.submittedForUserId] = userId;
                //CI: we don't need updateSubs here, because we only care to set this for containers
                //which will be first anyway
                reqMan.setProp(0, reqMan.PROPS.QUERY_PARAMS, param);

                return this;
            },
            //teacher gets list of submitted folders
            getSubmitted: function (classId) {
                var that = this;

                var _getSubmitted = function (singleClassId, index) {
                    if (!_.isString(singleClassId)) {

                        // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                        errMan.throwError('API_ERR_QUERY_API_3',
                            [that.entityName, 'classId', 'getSubmitted', 'string', helpers.toType(singleClassId), index]);
                    }
                    var isBatch = _.isNumber(index);
                    var idx = that._customOperation(
                        {},
                        config.CUSTOM_ENDPOINTS.GET_SUBMITTED,
                        config.CRUD.find,
                        //this.entityName,
                        null,
                        isBatch
                    );

                    var param = {};
                    param[config.QUERY_PARAMS.classId] = singleClassId;
                    if (isBatch) {
                        reqMan.setProp(idx, reqMan.PROPS.QUERY_PARAMS, param);
                        reqMan.setProp(idx, reqMan.PROPS.IS_WEBAPI, true);
                    } else {
                        reqMan.updateSubs(reqMan.PROPS.QUERY_PARAMS, param);
                        reqMan.updateSubs(reqMan.PROPS.IS_WEBAPI, true);
                    }

                };

                if (_.isNonEmptyArray(classId)) {
                    _.each(classId, function (singleClassId, index) {
                        _getSubmitted(singleClassId, index);
                    });
                } else {
                    _getSubmitted(classId);
                }

                //if (!_.isString(classId) && !_.isArrayOfStrings(classId)) {
                //
                //    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                //    errMan.throwError('API_ERR_QUERY_API_3',
                //       [this.entityName, 'classId', 'getSubmitted', 'string or array of strings', helpers.toType(classId)]);
                //}

                //CI - Why only a string? Because this sets custom endpoint, so it is in my opinion pointless to allow falsy values
                //and do additional logic (close to a hack having our current implementation in mind) not to set the URL.
                //
                //var isBatch = _.isArray(classId);
                //
                ////var idx = this._customOperation(
                ////   {},
                ////   config.CUSTOM_ENDPOINTS.GET_SUBMITTED,
                ////   config.CRUD.find,
                ////   this.entityName,
                ////   isBatch
                ////);
                //
                //var param = {};
                //
                //param[config.QUERY_PARAMS.classId] = classId;
                //reqMan.setProp(idx, reqMan.PROPS.QUERY_PARAMS, param);
                //reqMan.setProp(idx, reqMan.PROPS.IS_WEBAPI, true);

                return this;
            },

            //student or teacher creating their cover notes on folder submission/return
            createAnnotation: function createAnnotation(fieldsValues) {

                if (!helpers.isFunSwitchEnabled(arguments)) {
                    return this;
                }

                var self = this,
                    fname = "createAnnotation()";

                if (reqMan.getProp(0, reqMan.PROPS.IS_MAIN) !== true) {
                    //Containers: createAnnotation functionality could not be used with multiple containers passed
                    errMan.throwError(
                        'API_ERR_QUERY_API_6',
                        [self.entityName, fname, config.COLLECTIONS.containers.name]
                    );
                }

                if (!reqMan.isUpdate(0)) {
                    // the createAnnotation method can only be used in conjunction with the update method
                    errMan.throwError(
                        'API_ERR_QUERY_API_5',
                        [self.entityName, fname, 'update']
                    );
                }

                if (!_.isObjectNotArray(fieldsValues)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [self.entityName, '', fname, 'object', helpers.toType(fieldsValues)]);
                }

                annotationsEntity._additionalActions.create &&
                annotationsEntity._additionalActions.create(fieldsValues);

                if (!_.isUndefined(fieldsValues) && !_.isUndefined(fieldsValues.container_id)) {
                    /*
                     Annotations: container_id field is populated automatically,
                     so container_id : 1 is invalid and it cannot be used here
                     */
                    errMan.throwError(
                        'API_ERR_QUERY_API_7', [
                            annotationsEntity.entityName,
                            config.QUERY_PARAMS.containerId,
                            fieldsValues.container_id,
                            fname
                        ]
                    );
                }

                fieldsValues.container_id = reqMan.getProp(0, reqMan.PROPS.ID);

                annotationsEntity._validateFieldsValues(fieldsValues);

                var idx = reqMan.createSub(
                    config.CRUD.create,
                    false,
                    config.COLLECTIONS.annotations.nameUppercase
                );
                reqMan.setProp(idx, reqMan.PROPS.FIELDS_VALUES, fieldsValues);
                reqMan.setProp(idx, reqMan.PROPS.BASE_URL, annotationsEntity._getBaseURL(config.CRUD.create));

                this.forceOrder(idx);

                return this;
            },
            //student or teacher updating their cover notes on folder submission/return
            updateAnnotation: function updateAnnotation(id, fieldsValues) {

                if (!helpers.isFunSwitchEnabled(arguments)) {
                    return this;
                }

                var self = this,
                    fname = "updateAnnotation()";

                if (!_.isUndefined() || !_.isNumber(id)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError(
                        'API_ERR_QUERY_API_3',
                        [self.entityName, 'id', fname, 'number', helpers.toType(id)]
                    );
                }

                //CI possible TODO - should we extract shared checks somewhere?

                if (reqMan.getProp(0, reqMan.PROPS.IS_MAIN) !== true) {
                    //Containers: updateAnnotation functionality could not be used with multiple containers passed
                    errMan.throwError(
                        'API_ERR_QUERY_API_6',
                        [self.entityName, fname, config.COLLECTIONS.containers.name]
                    );
                }

                if (!reqMan.isUpdate(0)) {
                    // the createAnnotation method can only be used in conjunction with the update method
                    errMan.throwError(
                        'API_ERR_QUERY_API_5',
                        [self.entityName, fname, 'update']
                    );
                }

                if (!_.isObjectNotArray(fieldsValues)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError('API_ERR_QUERY_API_3',
                        [self.entityName, '', fname, 'object', helpers.toType(fieldsValues)]);
                }
                var idx = reqMan.createSub(
                    config.CRUD.update,
                    false,
                    config.COLLECTIONS.annotations.nameUppercase
                );
                reqMan.setProp(idx, reqMan.PROPS.ID, id);
                reqMan.setProp(idx, reqMan.PROPS.FIELDS_VALUES, fieldsValues);
                reqMan.setProp(idx, reqMan.PROPS.BASE_URL, annotationsEntity._getBaseURL(config.CRUD.update));
                this.forceOrder(idx);

                return this;
            },

            getInfo: function () {
                var returnObject = this.info();

                if (!_.isUndefined(config.SETTINGS.FieldsSettableOnCreationOnly[this.entityName])) {
                    returnObject.FieldsSettableOnCreationOnly = config.SETTINGS.FieldsSettableOnCreationOnly[this.entityName];
                }
                if (!_.isUndefined(config.SETTINGS.ReadOnlyFields[this.entityName])) {
                    returnObject.ReadOnlyFields = config.SETTINGS.ReadOnlyFields[this.entityName];
                }
                if (!_.isUndefined(config.SETTINGS.RequiredFields[this.entityName])) {
                    returnObject.REQUIRED_FIELDS = config.SETTINGS.RequiredFields[this.entityName];
                }

                if (config.FORCE_DEFAULT_SERVICE_SETTINGS) {
                    returnObject.SETTINGS_SOURCE = 'client_defaults';
                } else {
                    returnObject.SETTINGS_SOURCE = 'service';
                }
                return returnObject;
            }
        };

        Containers._reset = function () {
            Containers._filtersObj = {};
            Containers.desiredOrder = {};
        };

        //return _.pick(Tags.init(), _.union(config.CRUD, queryMethods));
        return Containers.init();//{Containers: Containers.init()};
    });
define(
    'any', ['underscorenc', 'config', 'helpers', 'transportManager', 'client', 'queryAPI', 'info', 'errorManager'],

    function (_, config, helpers, transportManager, client, queryAPI, info, errorManager) {

        var currentCollection = "",
            URLS = {
                'remove': {
                    'service': function (p) {
                        return currentCollection + "(" + p.id + ")";
                    }
                    //'service': _.template(currentCollection + "(<%= id %>)")
                },
                'create': {
                    'service': function () {
                        return currentCollection;
                    }
                    //'service': _.template(currentCollection + "")
                },
                'update': {
                    'service': function (p) {
                        return currentCollection + "(" + p.id + ")";
                    }
                    //'service': _.template(currentCollection + "(<%= id %>)")
                },
                'find': {
                    'service': function (p) {
                        return currentCollection + "/" + p.tail;
                    }
                    //'service': _.template(currentCollection + "/<%= tail %>")
                },
                'findOne': {
                    'service': function (p) {
                        return currentCollection + "(" + p.id + ")/" + p.tail;
                    }
                    //'service': _.template(currentCollection + "(<%= id %>)/<%= tail %>")
                }
            };

        var Any = {
            entityName: 'Any',

            _defaultTransport: transportManager.use(config.TRANSPORT_NAMES.ODATA),
            _transports: {},

            _request: {},

            _additionalActions: {},

            _urls: URLS,

            init: function () {
                _.defaults(this, queryAPI);

                _.extend(this, info);

                this.collection("");

                return this;
            },

            collection: function (newCollection) {
                currentCollection = newCollection || "";
                return this;
            },

            run: function () {
                queryAPI.run.apply(this);

                // reset current collection to prevent a user from calling Any without a need to set a collection next time
                currentCollection = "";
            },

            _entityLevelCheck: function () {
                if (currentCollection === "") {
                    //run: using Collection() is required when using Any!
                    errorManager.throwError('API_ERR_ANY_1', null);
                }
            }
        };

        return Any.init();
    });

define(
    'annotationSharedWith', ['underscorenc', 'config', 'helpers', 'transportManager',
        'client', 'queryAPI', 'info', 'errorManager', 'requestManager'],
    function (_, config, helpers, transportManager, client, queryAPI, info, errMan, reqMan) {
        var URLS = {
            'remove': {
                'service': helpers.templatify("annotation_shared_with(<%= id %>)")
            },
            'create': {
                'service': helpers.templatify("annotation_shared_with")
            },
            //'update': {
            //    'service': helpers.templatify("tags(<%= id %>)")
            //},
            'find': {
                'service': helpers.templatify("annotation_shared_with<%= tail %>")
            },
            'findOne': {
                'service': helpers.templatify("tags(<%= id %>)<%= tail %>")
            },
            'addUsersToAnnotation': {
                'service': helpers.templatify("annotation_shared_with")
            }
        };

        var AnnotationSharedWith = {
            entityName: 'AnnotationSharedWith',

            _defaultTransport: transportManager.use(config.TRANSPORT_NAMES.ODATA),
            _transports: {},

            _request: {},

            _additionalActions: {},

            _urls: URLS,

            init: function () {
                _.defaults(this, queryAPI);

                _.extend(this, info);

                //errMan.subscribeToReset(this);

                return this;
            },

            _getRequest: function () {
                return this._request;
            },

            getInfo: function () {
                var returnObject = this.info();

                if (returnObject && returnObject.description && returnObject.description[2]) {
                    returnObject.description[2] = "Allowed operations: [create,remove,find,findOne]";
                }

                if (!_.isUndefined(config.SETTINGS.FieldsSettableOnCreationOnly[this.entityName])) {
                    returnObject.FieldsSettableOnCreationOnly = config.SETTINGS.FieldsSettableOnCreationOnly[this.entityName];
                }
                if (!_.isUndefined(config.SETTINGS.ReadOnlyFields[this.entityName])) {
                    returnObject.ReadOnlyFields = config.SETTINGS.ReadOnlyFields[this.entityName];
                }
                if (!_.isUndefined(config.SETTINGS.RequiredFields[this.entityName])) {
                    returnObject.REQUIRED_FIELDS = config.SETTINGS.RequiredFields[this.entityName];
                }

                if (config.FORCE_DEFAULT_SERVICE_SETTINGS) {
                    returnObject.SETTINGS_SOURCE = 'client_defaults';
                } else {
                    returnObject.SETTINGS_SOURCE = 'service';
                }
                return returnObject;
            },

            addUsersToAnnotation: function (annotationId, userIds) {

                if (!_.isNumber(annotationId)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError(
                        'API_ERR_QUERY_API_3',
                        [this.entityName, 'annotationId', 'addUsersToAnnotation', 'number', helpers.toType(annotationId)]
                    );
                }

                if (!_.isString(userIds) && !_.isArrayOfStrings(userIds)) {
                    // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                    errMan.throwError(
                        'API_ERR_QUERY_API_3',
                        [this.entityName, 'userIds', 'addUsersToAnnotation', 'string or array of strings', helpers.toType(userIds)]
                    );
                }

                //VV - TODO add validation
                //var that = this;

                userIds = _.isString(userIds) ? [userIds] : userIds;
                var createArray = [];

                _.each(userIds, function () {
                    createArray.push({annotation_id: annotationId});
                });

                var qapi = this.create(createArray);

                _.each(userIds, function (userId, i) {
                    // IC: because of the change on service side user_id -> user_ids
                    reqMan.setProp(i, reqMan.PROPS.QUERY_PARAMS, {user_ids: userId});
                });

                return qapi;
            }

        };

        AnnotationSharedWith._reset = function () {
            AnnotationSharedWith._filtersObj = {};
            AnnotationSharedWith.desiredOrder = {};
        };

        return AnnotationSharedWith.init();
    });
// (c) copyright unscriptable.com / John Hann
// License MIT
// For more robust promises, see https://github.com/briancavalier/when.js.

define('tinyPromise', [],function () {
    function Promise() {
        this._thens = [];
    }

    Promise.prototype = {
        /* This is the "front end" API. */

        // then(onResolve, onReject): Code waiting for this promise uses the
        // then() method to be notified when the promise is complete. There
        // are two completion callbacks: onReject and onResolve. A more
        // robust promise implementation will also have an onProgress handler.
        then: function (onResolve, onReject) {
            // capture calls to then()
            this._thens.push({
                resolve: onResolve,
                reject: onReject
            });
        },

        // Some promise implementations also have a cancel() front end API that
        // calls all of the onReject() callbacks (aka a "cancelable promise").
        // cancel: function (reason) {},

        /* This is the "back end" API. */

        // resolve(resolvedValue): The resolve() method is called when a promise
        // is resolved (duh). The resolved value (if any) is passed by the resolver
        // to this method. All waiting onResolve callbacks are called
        // and any future ones are, too, each being passed the resolved value.
        resolve: function (val) {
            this._complete('resolve', val);
        },

        // reject(exception): The reject() method is called when a promise cannot
        // be resolved. Typically, you'd pass an exception as the single parameter,
        // but any other argument, including none at all, is acceptable.
        // All waiting and all future onReject callbacks are called when reject()
        // is called and are passed the exception parameter.
        reject: function (ex) {
            this._complete('reject', ex);
        },

        // Some promises may have a progress handler. The back end API to signal a
        // progress "event" has a single parameter. The contents of this parameter
        // could be just about anything and is specific to your implementation.
        // progress: function (data) {},

        /* "Private" methods. */

        _complete: function (which, arg) {
            // switch over to sync then()
            this.then = which === 'resolve' ?
                function (resolve, reject) {
                    resolve && resolve(arg);
                } :
                function (resolve, reject) {
                    reject && reject(arg);
                };
            // disallow multiple calls to resolve or reject
            this.resolve = this.reject =
                function () {
                    throw new Error('Promise already completed.');
                };
            // complete all waiting (async) then()s
            var aThen, i = 0;
            while (aThen = this._thens[i++]) {
                aThen[which] && aThen[which](arg);
            }
            delete this._thens;
        }
    };

    return Promise;
});

define(
    'basicAPI',
    ['underscorenc', 'config', 'helpers', 'client', 'transportManager', 'annotations',
        'tags', 'containers', 'any', 'errorManager', 'resetManager', 'annotationSharedWith', 'tinyPromise'],
    function (_, config, helpers, client, transportManager, Annotations, Tags,
              Containers, Any, errorManager, resMan, AnnotationSharedWith, Promise) {

        var api = {};

        api.reset = function () {
            try {
                resMan.resetLib();
            } catch (err) {
                return 'Reset failed.' + err;
            }
            return 'Reset OK.';
        };

        api.getCORS = function () {
            return config.CORS;
        };

        api.setCORS = function (cors) {
            /** force bool */
            config.CORS = !!(cors);
            transportManager.use(config.TRANSPORT_NAMES.ODATA).setCors();
        };

        api.getServerURL = function () {
            return config.SERVER_URL;
        };
        api.setServerURL = function (newServerUrl) {
            config.SERVER_URL = newServerUrl;
        };

        api.getPostTunneling = function () {
            return config.USE_POST_TUNNELING;
        };
        api.setPostTunneling = function (postTunneling) {
            config.USE_POST_TUNNELING = postTunneling;
        };

        api.getToken = function () {
            return config.TOKEN_AUTHN;
        };

        api.setToken = function (token) {
            if (_.isNullUndef(token) || (_.isString(token) && token.length)) {
                config.TOKEN_AUTHN = token;
            } else {
                // API_ERR_GENERAL_1 Message: param for method
                //setToken must be string, but it is someType instead

                errorManager.throwError('API_ERR_GENERAL_1',
                    ['', 'setToken', 'string', helpers.toType(token)]);
            }
        };

        api.getNextLinkDomainStripping = function () {
            return config.NEXT_LINK_DOMAIN_STRIPPING;
        };

        api.setNextLinkDomainStripping = function (nextLinkDomainStripping) {
            config.NEXT_LINK_DOMAIN_STRIPPING = nextLinkDomainStripping;
        };

        api.getParseDates = function () {
            return config.DEFAULT_PARSE_DATE;
        };

        api.setParseDates = function (parseDates) {
            config.DEFAULT_PARSE_DATE = parseDates;
        };

        // - if true is passed, then 2.0 will be used by default
        // - if false, null or undefined is passed, it will remove custom header and triger dataJS default 3.0
        // - if a number or string is passed - it will be used instead of default 2.0
        // - if anything else is passed, throw error
        api.setODataVersion = function (val) {

            // if input is string we want to conver it to a number...
            if (_.isString(val)) {
                val = parseInt(val);
            }

            // we should convert number to n.0 string format as this is what service expexts
            if (_.isNumber(val) && !_.isNaN(val)) {
                val = val.toFixed(1).toString();
            }

            if (!_.isNaN(val) || _.isBoolean(val) || _.isUndefined(val) ||
                _.isNull(val) || _.isString(val)) {
                config.FORCE_ODATA_VERSION = val ? '2.0' : undefined;
            } else {
                // API_ERR_GENERAL_1 Message: param requestTimeout for method
                //setODataVersion must be true', 'numeric string', 'int number, but it is undefined instead

                errorManager.throwError('API_ERR_GENERAL_1',
                    ['', 'setODataVersion', ['true', 'numeric string', 'int number'].join(','), val]);
            }
        };

        api.getODataVersion = function () {
            return config.FORCE_ODATA_VERSION;
        };

        api.setUseCasV2 = function (useCasV2) {
            config.USE_CAS_V2 = useCasV2;
        };

        api.getUseCasV2 = function () {
            return config.USE_CAS_V2;
        };

        api.getClientId = client.getID;
        api.setClientId = client.setID;

        api.getVersion = function () {
            return config.API_VERSION;
        };

        api.getSuppressValidation = function () {
            return config.SUPPRESS_VALIDATION;
        };

        //API_ERR_GENERAL_1 Message: param requestTimeout for method setSuppressValidation must be boolean, but it is undefined instead
        api.setSuppressValidation = function (val) {
            if (!_.isBoolean(val)) {
                errorManager.throwError('API_ERR_GENERAL_1',
                    ['', 'setSuppressValidation', 'boolean', helpers.toType(val)]);
            }
            config.SUPPRESS_VALIDATION = val;
        };

        api.getContainerStatuses = function () {
            return config.SETTINGS.ContainerStatus;
        };

        api.convertClientIdToClientNames = client.convertIDToNames;
        api.convertClientNamesToClientId = client.convertNamesToID;

        api.updateVisibilityIdByClientNames = client.updateVisibilityIdByNames;
        api.convertClientNamesToVisibilityIds = client.convertNamesToVisibilityIds;

        var keepaliveInterval = false;

        /**
         * Utiilty method that can be used to keep the authn cooke alive on HMOF or TC platform
         *
         * @param {String}      requestURL          Request url.
         * @param {Function}    delay               Delay in ms. Default is 14mins (840000).
         */
        api.startKeepalive = function (requestURL, delay) {
            //Message: requestURL is required to use startKeepalive
            !requestURL && errorManager.throwError('API_ERR_AJAX_2', ['requestURL', 'startKeepalive']);
            //Message: Keepalive is already running, stop it with stopKeepalive first
            keepaliveInterval && errorManager.throwError('API_ERR_AJAX_3', ['Keepalive', 'stopKeepalive']);

            keepaliveInterval = setInterval(
                function () {
                    transportManager.use(config.TRANSPORT_NAMES.AJAX).read(
                        {
                            url: requestURL,
                            data: {},
                            type: config.REQ_TYPE_GET
                        },
                        function () {
                        },
                        function () {
                        }
                    );
                }, delay || config.PLATFORM_KEEPALIVE_DEFAULT_DELAY);
        };

        api.stopKeepalive = function () {
            if (!keepaliveInterval) {
                return;
            }

            clearInterval(keepaliveInterval);

            /** interval cleared, but interval ID still keeps in variable */
            /** set variable to falsy state for startKeepalive function*/
            keepaliveInterval = false;
        };

        api.getSettingsStatus = function () {
            if (_.isEmpty(config.SETTINGS.serviceSettingsStatuses)) {
                throw 'Error - Status not available';
            }

            return config.SETTINGS.serviceSettingsStatuses;
        };

        var getServiceSettingsData = function (forceDefaultServiceSettings) {
            config.SETTINGS.serviceSettingsStatuses = [];

            _.each(config.DEFAULTS, function (item, propName) {
                //forming array of objects with names and status properties
                config.SETTINGS.serviceSettingsStatuses.push(new helpers.ServiceSettingsStatus(propName));
                //we'll be using this regardless whether we got data or not
                //and if settings are forced to defaults
            });

            function setServiceSettingsStatuses(propName, statusName) {
                //all properties were false by default
                propName = _.findWhere(config.SETTINGS.serviceSettingsStatuses, {'name': propName});
                propName[statusName] = true;
            }

            function useDefaults() {

                for (var propName in config.DEFAULTS) {
                    if (config.DEFAULTS.hasOwnProperty(propName)) {
                        config.SETTINGS[propName] = config.DEFAULTS[propName];

                        if (config.SETTINGS.Source === config.SETTINGS_SOURCES.CLIENT_DEFAULTS) {
                            //when there's no data at all, or in case of error
                            setServiceSettingsStatuses(propName, 'unknown');
                        } else {
                            //when client defaults are forced
                            config.FORCE_DEFAULT_SERVICE_SETTINGS = true;
                            setServiceSettingsStatuses(propName, 'forced');
                        }
                    }
                }

                //for easier visual representation and checking
                config.SETTINGS.serviceSettingsStatuses = _.indexBy(config.SETTINGS.serviceSettingsStatuses, function (currentObject) {
                    return currentObject.name;
                });

                Annotations.setInfo(config.SETTINGS.Metadata.Annotation);
                Tags.setInfo(config.SETTINGS.Metadata.Tag);
                Containers.setInfo(config.SETTINGS.Metadata.Container);
                AnnotationSharedWith.setInfo(config.SETTINGS.Metadata.AnnotationSharedWith);
            }

            //var dfd = q.defer();
            var dfd = new Promise();

            if (!_.isBoolean(forceDefaultServiceSettings)) {
                // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                errorManager.throwError('API_ERR_QUERY_API_3', [
                    '', 'forceDefaultServiceSettings', '',
                    'boolean', helpers.toType(forceDefaultServiceSettings)
                ]);
            }
            var rejectFunction;
            var resolveFunction;

            if (forceDefaultServiceSettings && forceDefaultServiceSettings === true) {

                resolveFunction = function () {
                    useDefaults();
                    helpers.consoleLog('* Default service settings are forced in the init!');
                };
            } else {
                resolveFunction = function (data) {

                    if (data) {
                        var clonedData = _.deepClone(data);

                        var useItemDefaults = function (propName) {
                            //when individual settings are not present or correct in data
                            config.SETTINGS.SETTINGS_SOURCE = config.SETTINGS_SOURCES.SERVICE_WITH_CLIENT_DEFAULTS;
                            config.SETTINGS[propName] = config.DEFAULTS[propName];
                        };

                        if (data.Version && _.isString(data.Version)) {
                            config.API_VERSION.service = data.Version;
                        }

                        //excluding version and properties which have their own checks
                        clonedData = _.omit(clonedData, _.union(config.SETTINGS.ExcludeNonServiceSettingsProperties,
                            config.SETTINGS.ExcludeFromServiceSettingsParsing));

                        _.each(config.DEFAULTS, function (item, propName) {

                            //does every property which we're expecting exists in data?

                            if (!_.isUndefined(clonedData[propName])) {

                                setServiceSettingsStatuses(propName, 'received');

                                //special case for AppSettings
                                if (propName === 'AppSettings') {
                                    clonedData[propName] = clonedData[propName][0];
                                }

                                //does every property of data have the same type as our defaults?
                                if (helpers.toType(clonedData[propName]) === helpers.toType(config.DEFAULTS[propName])) {
                                    setServiceSettingsStatuses(propName, 'correctFormat');

                                    //are our defaults equal to service settings?
                                    if (_.isEqual(clonedData[propName], config.DEFAULTS[propName])) {
                                        setServiceSettingsStatuses(propName, 'upToDate');
                                        //something can be out of date, but valid
                                    }
                                    //everything's ok, set settings
                                    config.SETTINGS[propName] = clonedData[propName];
                                    config.SETTINGS.SETTINGS_SOURCE = config.SETTINGS_SOURCES.SERVICE;
                                } else {
                                    useItemDefaults(propName);
                                }

                            } else {
                                useItemDefaults(propName);
                            }

                            //for easier visual representation and checking
                            config.SETTINGS.serviceSettingsStatuses = _.indexBy(config.SETTINGS.serviceSettingsStatuses, function (currentObject) {
                                return currentObject.name;
                            });

                        });
                        //these require individual checks and parsing
                        client._parseClientIds(data.ClientTools);
                        Annotations._parseTypeIds(data.AnnotationTypes);
                        config.SETTINGS.Metadata = helpers.parseMetadata(data.Metadata);

                        //printing the output
                        _.each(config.SETTINGS.serviceSettingsStatuses, function (item, i) {
                            //+1 or minus -1 for easier spotting
                            var prefix = item.received && item.correctFormat && item.upToDate ? '+' : '-';

                            helpers.consoleLog(prefix + i + ': ', item);
                        });

                    } else {
                        helpers.consoleLog('* Problem receiving service data. Using defaults!');
                        config.SETTINGS.SETTINGS_SOURCE = config.SETTINGS_SOURCES.CLIENT_DEFAULTS;
                        useDefaults();
                    }
                    Annotations.setInfo(config.SETTINGS.Metadata.Annotation);
                    Tags.setInfo(config.SETTINGS.Metadata.Tag);
                    Containers.setInfo(config.SETTINGS.Metadata.Container);
                    AnnotationSharedWith.setInfo(config.SETTINGS.Metadata.AnnotationSharedWith);

                };

                // WSI TODO 21/04/2014: update error handling
                rejectFunction = function (err, addData) {
                    helpers.consoleLog("Error receiving service data: ", err);
                    helpers.consoleLog("Error receiving service data (error additional data): ", addData);
                    helpers.consoleLog('* Problem receiving service data. Using defaults!');

                    useDefaults();

                    return [err, addData];
                };
            }

            if (forceDefaultServiceSettings && forceDefaultServiceSettings === true) {
                //return dfd.done();

                //dfd._complete();
                dfd.resolve(resolveFunction());
            } else {
                transportManager.use(config.TRANSPORT_NAMES.AJAX).read(
                    {
                        url: helpers.getRequestURL(config.SERVICE_APP_SETTINGS, true),
                        data: undefined,
                        type: config.REQ_TYPE_GET, // request type
                        timeoutMS: config.REQUEST_TIMEOUT
                    },
                    function (data) { //success handler
                        dfd.resolve(resolveFunction(data));
                    },
                    function (err, additionalData) { // error handler
                        dfd.reject(rejectFunction(err, additionalData));
                    }
                );
            }

            return dfd;
        };

        // WSi 22/05/2014: Leaving below in case we ever need to come back to the old AtomXML Metadata
        // var isMetaParsed = false;
        // var getMetaInfo = function() {
        //   // WSi DP-2276 25/02/2014: We want metadata to be updated everytime the init is called.
        //   // * parse metadata only once, prevent duplicate calls *
        //   // if (isMetaParsed) {
        //   //   return false;
        //   // }

        //   var dfd = $.Deferred();

        //   dfd.done(function(data){
        //     if (data) {
        //       isMetaParsed = true;
        //     }

        //     var info = helpers.parseMetadata(data);

        //     Annotations.setInfo(info['Annotation']);
        //     Tags.setInfo(info['Tag']);
        //     Containers.setInfo(info['Container']);
        //     helpers.consoleLog('* Received meta data');
        //   });

        //   dfd.fail(function(err) {
        //     helpers.consoleLog(err.message);
        //   });

        //   /** get info from $metadata on init call */
        //   /** standalone call, no connection with CRUD operations */
        //   transportManager.use(config.TRANSPORT_NAMES.ODATA)
        //     .getMetaData({
        //       successHandler: dfd.resolve,
        //       errorHandler: dfd.reject
        //     });

        //   return dfd.promise();
        // };

        var requestedClientId;

        api.init = function (params, successHandler, errorHandler) {
            // set up params

            this.restoreDefaults();

            this.setServerURL(params.serverUrl || params.serverURL || config.INTERNAL_DEFAULTS.SERVER_URL);
            this.setPostTunneling(!_.isUndefined(params.usePostTunneling) ? params.usePostTunneling : config.INTERNAL_DEFAULTS.USE_POST_TUNNELING);
            this.setToken(params.token || config.INTERNAL_DEFAULTS.TOKEN_AUTHN);
            this.setODataVersion(params.forceODataVersion || config.INTERNAL_DEFAULTS.TOKEN_AUTHN);
            this.setCORS(!_.isUndefined(params.cors) ? params.cors : config.INTERNAL_DEFAULTS.CORS);
            this.setSuppressValidation(!_.isUndefined(params.suppressValidation) ? params.suppressValidation : config.INTERNAL_DEFAULTS.SUPPRESS_VALIDATION);
            this.setTimeout(!_.isUndefined(params.requestTimeout) ? params.requestTimeout : config.INTERNAL_DEFAULTS.REQUEST_TIMEOUT);
            this.setNextLinkDomainStripping(!_.isUndefined(params.nextLinkDomainStripping) ? params.nextLinkDomainStripping : config.INTERNAL_DEFAULTS.NEXT_LINK_DOMAIN_STRIPPING);
            this.setParseDates(!_.isUndefined(params.parseDates) ? params.parseDates : config.INTERNAL_DEFAULTS.DEFAULT_PARSE_DATE);
            this.setUseCasV2(params.casV2 === true);

            config.PLATFORM_KEEPALIVE_DEFAULT_DELAY = config.INTERNAL_DEFAULTS.PLATFORM_KEEPALIVE_DEFAULT_DELAY;
            requestedClientId = params.clientId;

            successHandler = successHandler || params.successHandler;
            errorHandler = errorHandler || params.errorHandler;

            //IC 2014/07/02: this will allow null, undefined, 0 and empty string to be passed as false,
            //which I think is ok, because in that way it logically behaves as if forceDefaultServiceSettings is not pressent
            var clientPromise = getServiceSettingsData(params.forceDefaultServiceSettings || false);

            function initializeDone() {
                // WSi: once we got all metadata from the server we can validate and set client_id
                if (requestedClientId !== undefined && requestedClientId !== null) {
                    client.setID(requestedClientId);
                }
                api.setApiInitialized(true);
            }

            //q(clientPromise).then(
            clientPromise.then(
                function () {
                    helpers.consoleLog('* Finished all init tasks.');
                    initializeDone();
                    successHandler && successHandler();
                },
                function (values) {
                    helpers.consoleLog('* Error * Some init tasks failed. Library uses defaults.');
                    initializeDone();
                    errorHandler && errorHandler(values[0], values[1]);
                }
            );
        };

        api.getApiInitialized = function () {
            return config.API_INITIALIZED;
        };

        api.setApiInitialized = function (val) {
            config.API_INITIALIZED = val;
        };

        api.getTimeout = function () {
            return config.REQUEST_TIMEOUT;
        };

        api.setTimeout = function (requestTimeout) {
            if (!requestTimeout || _.isObject(requestTimeout) || _.isNull(requestTimeout) ||
                _.isBoolean(requestTimeout) || isNaN(requestTimeout) || requestTimeout % 1 !== 0) {
                //API_ERR_GENERAL_1 Message: param requestTimeout for method setTimeout must be numeric, but it is undefined instead
                //annService.setTimeout([]), annService.setTimeout({}), annService.setTimeout(true), annService.setTimeout(null)
                //annService.setTimeout(), annService.setTimeout('string'), annService.setTimeout(function(){}), annService.setTimeout(7.6),
                //annService.setTimeout(NaN), annService.setTimeout('')
                errorManager.throwError('API_ERR_GENERAL_1',
                    ['requestTimeout', 'setTimeout', 'numeric', helpers.toType(requestTimeout)]);
            } else if (_.isString(requestTimeout)) {
                config.REQUEST_TIMEOUT = parseInt(requestTimeout);
            } else {
                config.REQUEST_TIMEOUT = requestTimeout;
            }

        };

        api.getInfo = function () {
            var returnValue = {};
            returnValue.APP_SETTINGS = config.SETTINGS.AppSettings;
            returnValue.CLIENT_IDS_LIST = config.SETTINGS.ClientTools;
            returnValue.SETTINGS_SOURCE = config.SETTINGS.SETTINGS_SOURCE;

            return returnValue;
        };

        api.restoreDefaults = function () {
            this.setCORS(config.INTERNAL_DEFAULTS.CORS);
            this.setServerURL(config.INTERNAL_DEFAULTS.SERVER_URL);
            this.setODataVersion(config.INTERNAL_DEFAULTS.FORCE_ODATA_VERSION);
            this.setSuppressValidation(config.INTERNAL_DEFAULTS.SUPPRESS_VALIDATION);
            this.setNextLinkDomainStripping(config.INTERNAL_DEFAULTS.NEXT_LINK_DOMAIN_STRIPPING);
            this.setPostTunneling(config.INTERNAL_DEFAULTS.USE_POST_TUNNELING);
            this.setTimeout(config.INTERNAL_DEFAULTS.REQUEST_TIMEOUT);
            this.setToken(config.INTERNAL_DEFAULTS.TOKEN_AUTHN);
            this.setClientId(config.INTERNAL_DEFAULTS.CLIENT_ID);
            this.setUseCasV2(config.INTERNAL_DEFAULTS.USE_CAS_V2);
        };

        api.getListOfConflictingMethods = function (methodName) {

            if (_.isUndefined(methodName)) {
                // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                errorManager.throwError('API_ERR_QUERY_API_3',
                    ['', 'methodName', 'getListOfConflictingMethods', 'string', 'undefined']);
            }

            var conflictingMethods = 'unknownMethod'; //will be returned if method is not found

            _.each(_.keys(config.CONFLICTED_METHODS), function (item) {

                if (_.has(config.CONFLICTED_METHODS[item], methodName)) {
                    conflictingMethods = config.CONFLICTED_METHODS[item][methodName].methods;

                }

            });

            return conflictingMethods;

        };

        // WSi: Any collection is not required to be public at the moment
        // api.Any = Any;

        return api;
    });
define(
    'parser', ['underscorenc'],
    function (_) {

        var typeValidators = {
            'function': _.isFunction,
            'number': _.isNumber,
            'array': _.isArray,
            'object': _.isObject,
            'string': _.isString,
            'boolean': _.isBoolean,
            'undefined': _.isUndefined,
            'null': _.isNull
        };

        var comparators = {
            '$gte': function (val, expected) {
                return val >= expected;
            },
            '$gt': function (val, expected) {
                return val > expected;
            },
            '$lte': function (val, expected) {
                return val <= expected;
            },
            '$lt': function (val, expected) {
                return val < expected;
            },
            '$equal': function (val, expected) {
                return val === expected;
            },
            '$ne': function (val, expected) {
                return !(val === expected);
            },
            '$in': function (obj, propertyNames) {
                if (!_.isObject(obj)) {
                    return false;
                }

                return _.every(propertyNames, function (propertyName) {
                    return !!(propertyName in obj);
                });
            },
            '$nin': function (obj, propertyNames) {
                if (!_.isObject(obj)) {
                    return false;
                }

                return _.every(propertyNames, function (propertyName) {
                    return !(propertyName in obj);
                });
            }
        };

        /* [arguments, array] length checker */

        function checkLength(dto) {
            var length = dto.len,
                comparatorFunc = comparators[dto.com] || comparators.$equal;

            return function (args) {
                return comparatorFunc(args.length, length);
            };
        }

        function checkProperty(dto) {
            var propertyNames = _.isArray(dto.sp) ? dto.sp : [dto.sp],
                comparatorFunc = comparators[dto.com] || comparators.$in;

            return function (obj) {
                return comparatorFunc(obj, propertyNames);
            };
        }

        var parser = {
            getConditionFunction: function (condition) {
                /* primitive type checker */
                if (!_.isObject(condition)) {
                    return typeValidators[condition];
                }

                return (_.isUndefined(condition.sp)) ? checkLength(condition) : checkProperty(condition);
            },

            getValue: function (condition, args, argIndex) {
                argIndex = argIndex || 0;

                /* arg length checker */
                if (_.isObject(condition)) {
                    return args;
                }

                return args[argIndex];
            }
        };

        return parser;
    });
define(
    'annotationMaps', ['underscorenc', 'config'],

    function (_, config) {

        var maps = {};

        maps.deleteAnnotation = [
            config.NAMED_MAPS.error(),
            [
                config.NAMED_MAPS.success(),
                config.NAMED_MAPS.object()
            ],
            {argIndex: 0, p: 'id', c: ['number']}
        ];

        maps.deleteAnnotations = [
            config.NAMED_MAPS.error(),
            [
                config.NAMED_MAPS.success(),
                config.NAMED_MAPS.object()
            ],
            {argIndex: 0, p: 'annotationIdsList', c: ['array']}
        ];

        maps.updateAnnotation = [
            {argIndex: 3, p: 'errorHandler', c: [{'len': 4}, 'function']},
            [
                {argIndex: 2, p: 'successHandler', c: ['function']},
                {argIndex: 2, c: ['object']}
            ],
            [
                {argIndex: 1, p: 'fieldsValues', c: ['object']},
                {argIndex: 1, p: 'fieldsValues', c: ['null'], force: {}}
            ],
            {argIndex: 0, p: 'id', c: ['number']}
        ];

        maps.createAnnotation = [
            {argIndex: 2, p: 'errorHandler', c: [{'len': 3}, 'function']},
            [
                {argIndex: 1, p: 'successHandler', c: ['function']},
                {argIndex: 1, c: ['object']}
            ],
            {argIndex: 0, p: 'fieldsValues', c: ['object']}
        ];

        maps.getAnnotationsByTextString = [
            {argIndex: 1, c: ['object']},
            {argIndex: 0, p: 'text', c: ['string']}
        ];

        maps.getAnnotationByID = [
            {argIndex: 3, p: 'errorHandler', c: [{'len': 4}, 'function']},
            {argIndex: 2, p: 'successHandler', c: [{'len': 4}, 'function']},
            [
                {argIndex: 1, p: 'fields', c: ['array']},
                {argIndex: 1, c: ['object']}
            ],
            {argIndex: 0, p: 'id', c: ['number']}
        ];

        maps.getAnnotations = [
            {argIndex: 6, p: 'errorHandler', c: [{'len': 7, 'com': '$gte'}, 'function']},
            {argIndex: 5, p: 'successHandler', c: [{'len': 6, 'com': '$gte'}, 'function']},
            {argIndex: 4, p: 'limitCount', c: [{'len': 5, 'com': '$gte'}, 'number']},
            {argIndex: 3, p: 'limitFrom', c: [{'len': 4, 'com': '$gte'}, 'number']},
            {argIndex: 2, p: 'orderBy', c: [{'len': 3, 'com': '$gte'}, 'array']},
            {argIndex: 1, p: 'fields', c: [{'len': 2, 'com': '$gte'}, 'array']},
            [
                {argIndex: 0, p: 'filters', c: [{'len': 1, 'com': '$gt'}, 'object']},
                {argIndex: 0, c: ['object']}
            ]
        ];

        maps.getAnnotationsCount = [
            {argIndex: 2, p: 'errorHandler', c: [{'len': 3, 'com': '$gte'}, 'function']},
            {argIndex: 1, p: 'successHandler', c: [{'len': 2, 'com': '$gte'}, 'function']},
            [
                {argIndex: 0, p: 'filters', c: [{'len': 1, 'com': '$gt'}, 'object']},
                {argIndex: 0, c: ['object']}
            ]
        ];

        return maps;
    });
define(
    'tagsMaps', [],

    function () {

        var maps = {};

        maps.createTagsForAnnotationId = [
            {argIndex: 4, p: 'errorHandler', c: [{"len": 5}, "function"]},
            [
                {argIndex: 3, p: 'successHandler', c: [{"len": 4, "com": "$gte"}, "function"]},
                /* or on false extend params */
                {argIndex: 3, c: [{"len": 4, "com": "$gte"}, "object"]}
            ],
            {argIndex: 0, p: 'annotationId', c: ["number"]},
            {argIndex: 1, p: 'contentId', c: []},
            {argIndex: 2, p: 'tagsList', c: ["array"]}
        ];

        maps.getTagsByAnnotationId = [
            {argIndex: 5, p: 'errorHandler', c: [{"len": 6, "com": "$gte"}, "function"]},
            {argIndex: 4, p: 'successHandler', c: [{"len": 5, "com": "$gte"}, "function"]},
            {argIndex: 3, p: 'limitCount', c: [{"len": 4, "com": "$gte"}, "number"]},
            {argIndex: 2, p: 'limitFrom', c: [{"len": 3, "com": "$gte"}, "number"]},
            [
                {argIndex: 1, p: 'orderBy', c: [{"len": 2, "com": "$gte"}, "array"]},
                {argIndex: 1, c: ["object"]}
            ],
            {argIndex: 0, p: 'annotationId', c: ['number']},
        ];

        maps.createAnnotationAndTags = [
            {argIndex: 3, p: 'errorHandler', c: [{'len': 4}, 'function']},
            [
                {argIndex: 2, p: 'successHandler', c: [{'len': 3, 'com': '$gte'}, 'function']},
                {argIndex: 2, c: [{'len': 3, 'com': '$gte'}, 'object']}
            ],
            {argIndex: 0, p: 'annotationFieldsValues', c: ['object']},
            {argIndex: 1, p: 'tagsList', c: ['array']}
        ];

        maps.deleteTags = [
            {argIndex: 2, p: 'errorHandler', c: [{'len': 3}, 'function']},
            [
                {argIndex: 1, p: 'successHandler', c: [{'len': 1, 'com': '$gte'}, 'function']},
                {argIndex: 1, c: [{'len': 1, 'com': '$gte'}, 'object']}
            ],
            {argIndex: 0, p: 'tagIdsList', c: ['array']}
        ];

        maps.getAnnotationsByTag = [
            {argIndex: 1, c: ['object']},
            {argIndex: 0, p: 'tag', c: ['string']}
        ];

        maps.getTagsByContentId = [
            {argIndex: 5, p: ['errorHandler'], c: ['function']},
            {argIndex: 4, p: ['successHandler'], c: ['function']},
            {argIndex: 3, p: ['limitCount'], c: ['number']},
            {argIndex: 2, p: ['limitFrom'], c: ['number']},
            {argIndex: 1, p: ['orderBy'], c: ['string']},
            {argIndex: 0, p: ['contentId'], c: []}
        ];

        return maps;
    });
define(
    'argumentsMapper', ['underscorenc', 'helpers', 'config', 'parser', 'annotationMaps', 'tagsMaps', 'errorManager'],

    function (_, helpers, config, parser, annotationMaps, tagsMaps, errorManager) {

        /* the MAP */
        var maps = _.extend({}, annotationMaps, tagsMaps);

        /**
         * checking if objects are of specific types
         * argIndex = number, p = propertyName, c - conditions of mapping
         * @example entry = {argIndex : 0, p: 'id', c: ["number"]}
         * return inputs['id'] = args[argIndex] if args[argIndex] is number
         */
        var rulesIterator = function (entry, args, output) {
            var result = {
                passed: false,
                message: ''
            };

            /* all conditions should return true to map argument */
            result.passed = _.every(entry.c, function (condition) {

                var conditionFunc = parser.getConditionFunction(condition);

                if (!_.isFunction(conditionFunc)) {
                    //ArgumentsMapper: condition is not defined in conditionsMap
                    errorManager.throwError('API_ERR_ARGUMENTS_MAPPER_1', [condition]);
                    return false;
                }

                var value = parser.getValue(condition, args, entry.argIndex);

                return conditionFunc(value);
            });

            if (!result.passed) {
                return false;
            }

            var property = entry.p || false;
            if (property) {
                var extObj = {};

                extObj[property] = args[entry.argIndex];

                if (!_.isNull(entry.force) && _.isNull(args[entry.argIndex])) {
                    extObj[property] = entry.force;
                }

                _.extend(output, extObj);
            } else {
                _.extend(output, args[entry.argIndex]);
            }

            return true;
        };

        var argumentsMapper = {

            run: function (args, fname) {

                // console.log(fname);
                // console.log('maps is');
                // console.log(maps[fname]);
                // console.log(maps);

                if (!maps[fname]) {
                    //ArgumentsMapper["{0}"]: is not defined
                    errorManager.throwError('API_ERR_ARGUMENTS_MAPPER_2', [fname]);
                }

                if (!_.isArray(maps[fname])) {
                    //ArgumentsMapper["{0}"]: should be an array
                    errorManager.throwError('API_ERR_ARGUMENTS_MAPPER_3', [fname]);
                }

                if (!maps[fname].length) {
                    //ArgumentsMapper["{0}"]: no mapping rules specified for function arguments
                    errorManager.throwError('API_ERR_ARGUMENTS_MAPPER_4', [fname]);
                }

                var output = {};

                var realRulesLength = helpers.getArrayLengthIE8(maps[fname]);

                for (var i = 0; i < realRulesLength; i++) {

                    // console.log('rules');
                    // console.log(rules);

                    /* ensure proper rules declaration */
                    if (!_.isArray(maps[fname][i]) && !_.isObject(maps[fname][i])) {
                        //ArgumentsMapper["{0}"]: rules with index="{1}" should be an array
                        errorManager.throwError('API_ERR_ARGUMENTS_MAPPER_5', [fname, i]);
                    }

                    if (!_.isArray(maps[fname][i])) {
                        maps[fname][i] = [maps[fname][i]];
                    }

                    /* first passed iterator breaks loop */
                    /* example: rules = [{success}, {never start}] */
                    _.some(maps[fname][i], function (rule) {
                        return rulesIterator(rule, args, output);
                    });
                }

                return output;
            },

            setRules: function (rules, funcname) {
                maps[funcname] = rules;
            }
        };

        return argumentsMapper;
    });

define(
    'annotationValidators', ['underscorenc', 'config'],

    function (_, config) {

        var validators = {};

        validators.deleteAnnotation = {};

        validators.deleteAnnotation.prevalidators = [
            {c: [{'len': 1, 'com': '$gte'}], em: 'annotation_id {Number} is required'}
        ];

        validators.deleteAnnotation.validators = [
            config.NAMED_VALIDATORS.handlers,
            {p: ['id'], c: ['number']}
        ];
        /* end deleteAnnotation set */

        validators.deleteAnnotations = {};

        validators.deleteAnnotations.prevalidators = [
            {c: [{'len': 1, 'com': '$gte'}], em: 'annotationIdsList {Array} is required'}
        ];

        validators.deleteAnnotations.validators = [
            config.NAMED_VALIDATORS.handlers,
            {p: ['annotationIdsList'], c: ['array']}
        ];
        /* end deleteAnnotations set */

        validators.updateAnnotation = {};

        validators.updateAnnotation.prevalidators = [
            {
                c: [{'len': 2, 'com': '$gte'}],
                em: 'annotation_id {Number} and fieldsValues {object} are required arguments.'
            }
        ];

        validators.updateAnnotation.validators = [
            config.NAMED_VALIDATORS.handlers,
            {p: ['id', 'currentVisibilityId'], c: ['number']},
            {p: ['fieldsValues'], c: ['object']},
            /* check that annotation is not in fields */
            {
                p: ['fieldsValues'],
                c: [{'sp': ['annotation_id'], 'com': '$nin'}],
                em: '"annotation_id" should not be passed in fieldsValues.'
            },
            {p: ['visibility', 'visibilityInclude', 'visibilityExclude'], c: ['string', 'array']}
        ];
        /* end updateAnnotation set */

        validators.createAnnotation = {};

        validators.createAnnotation.prevalidators = [
            {
                c: [{'len': 1, 'com': '$gte'}],
                em: 'fieldsValues {object} is required'
            }
        ];

        validators.createAnnotation.validators = [
            config.NAMED_VALIDATORS.handlers,
            {p: ['fieldsValues'], c: ['object']},
            /* check that annotation is not in fields */
            {
                p: ['fieldsValues'],
                c: [{'sp': ['annotation_id', 'annotator_id'], 'com': '$nin'}],
                em: '"annotation_id" and "annotator_id" should not be passed in fieldsValues.'
            },
            {p: ['visibility'], c: ['string', 'array']}
        ];
        /* end createAnnotation set */

        validators.getAnnotationsByTextString = {};

        validators.getAnnotationsByTextString.prevalidators = [
            {
                c: [{'len': 1, 'com': '$gte'}],
                em: 'text {String} is required'
            }
        ];

        validators.getAnnotationsByTextString.validators = [
            config.NAMED_VALIDATORS.handlers,
            {p: ['text'], c: ['string']},
            {p: ['fields'], c: ['array']},
            {p: ['filters'], c: ['object']},
            {p: ['limitFrom', 'limitCount'], c: ['number']},
            {p: ['orderDesc', 'getCount', 'parseDate'], c: ['boolean']},
            {p: ['visibility', 'orderBy'], c: ['string', 'array']}
        ];
        /* end getAnnotationsByTextString set */

        validators.getAnnotationByID = {};

        validators.getAnnotationByID.prevalidators = [
            {
                c: [{'len': 1, 'com': '$gte'}],
                em: 'id {object} is required'
            }
        ];

        validators.getAnnotationByID.validators = [
            config.NAMED_VALIDATORS.handlers,
            {p: ['id'], c: ['number']},
            {p: ['fields'], c: ['array']},
            {p: ['parseDate'], c: ['boolean']}
        ];
        /* end getAnnotationByID set */

        validators.getAnnotations = {};

        validators.getAnnotations.prevalidators = [];

        validators.getAnnotations.validators = [
            config.NAMED_VALIDATORS.handlers,
            {p: ['fields'], c: ['array']},
            {p: ['filters'], c: ['object']},
            {p: ['next'], c: ['string']},
            {p: ['limitFrom', 'limitCount'], c: ['number']},
            {p: ['orderDesc', 'getCount', 'parseDate'], c: ['boolean']},
            {p: ['parseDate'], c: ['boolean']},
            {p: ['visibility', 'orderBy'], c: ['string', 'array']}
        ];
        /* end getAnnotations set */

        validators.getAnnotationsCount = {};

        validators.getAnnotationsCount.prevalidators = [];

        validators.getAnnotationsCount.validators = [
            config.NAMED_VALIDATORS.handlers,
            {p: ['filters'], c: ['object']},
            {p: ['visibility'], c: ['string', 'array']}
        ];
        /* end getAnnotationsCount set */

        return validators;
    });
define(
    'tagsValidators', ['underscorenc', 'config'],

    function (_, config) {

        var validators = {};

        validators.createTagsForAnnotationId = {};

        validators.createTagsForAnnotationId.prevalidators = [
            {c: [{"len": 3, "com": "$gte"}], em: "annotationId, contentId, tagsList are required"}
        ];

        validators.createTagsForAnnotationId.validators = [
            config.NAMED_VALIDATORS.handlers,
            {p: ['annotationId'], c: ["number"]},
            {p: ['contentId'], c: ["string"]},
            {p: ['tagsList'], c: ["array"]}
        ];
        /* end createTagsForAnnotationId set */

        validators.getTagsByAnnotationId = {};

        validators.getTagsByAnnotationId.prevalidators = [
            {c: [{"len": 1, "com": "$gte"}], em: "annotationId {Number} is required"}
        ];

        validators.getTagsByAnnotationId.validators = [
            config.NAMED_VALIDATORS.handlers,
            {p: ['filters'], c: ["object"]},
            {p: ['annotationId', 'limitFrom', 'limitCount'], c: ["number"]},
            {p: ['orderDesc', 'getCount'], c: ["boolean"]},
            {p: ['orderBy'], c: ["string", "array"]}
        ];
        /* end getTagsByAnnotationId set */

        validators.createAnnotationAndTags = {};

        validators.createAnnotationAndTags.prevalidators = [
            {
                c: [{'len': 2, 'com': '$gte'}],
                em: 'annotationFieldsValues {object} and tagsList {string[]} are required'
            }
        ];

        validators.createAnnotationAndTags.validators = [
            config.NAMED_VALIDATORS.handlers,
            /* should be an object */
            {p: ['annotationFieldsValues'], c: ['object']},
            /* should not contain annotation_id, annotator_id */
            {
                p: ['annotationFieldsValues'],
                c: [{'sp': ['annotation_id', 'annotator_id'], 'com': '$nin'}],
                em: 'annotation_id and annotator_id should not be passed in annotationFieldsValues.'
            },
            {p: ['tagsList'], c: ['array']},
            {p: ['visibility'], c: ['string', 'array']}
        ];
        /* end createAnnotationAndTags set */

        validators.deleteTags = {};

        validators.deleteTags.prevalidators = [
            {
                c: [{'len': 1, 'com': '$gte'}],
                em: 'tagIdsList is required'
            }
        ];

        validators.deleteTags.validators = [
            config.NAMED_VALIDATORS.handlers,
            {p: ['tagIdsList'], c: ['array']}
        ];
        /* end deleteTags set */

        validators.getAnnotationsByTag = {};

        validators.getAnnotationsByTag.prevalidators = [
            {
                c: [{'len': 1, 'com': '$gte'}],
                em: 'tag String is required'
            }
        ];

        validators.getAnnotationsByTag.validators = [
            config.NAMED_VALIDATORS.handlers,
            {p: ['fields'], c: ['array']},
            {p: ['tag'], c: ['string']},
            {p: ['filters'], c: ['object']},
            {p: ['limitFrom', 'limitCount'], c: ['number']},
            {p: ['orderDesc', 'parseDate'], c: ['boolean']},
            {p: ['visibility', 'orderByTag', 'orderByAnnotation'], c: ['string', 'array']}
        ];
        /* end getAnnotationsByTag set */

        validators.getTagsByContentId = {};

        validators.getTagsByContentId.prevalidators = [
            {c: [{'len': 6}], em: 'accept 6 params'}
        ];

        validators.getTagsByContentId.validators = [];
        /* end getAnnotationsByTag set */

        return validators;
    });

define(
    'argumentsValidator', ['underscorenc', 'config', 'parser', 'annotationValidators', 'tagsValidators', 'errorManager'],

    function (_, config, parser, annotationValidators, tagsValidators, errorManager) {

        var rulesTypes = ['prevalidators', 'validators'];

        var maps = _.extend({}, annotationValidators, tagsValidators);

        /**
         * checking if objects are of specific types
         * o = object, t = type
         * @example entry = {p: [propertyName], c: ['function']}
         * checks if inputs[propertyName] is of type function
         */
        var validatorsIterator = function (entry, args) {
            var result = {
                passed: false,
                message: '',
                err: ''
            };

            result.passed = _.every(entry.p, function (propertyName) {
                var value = args[propertyName],
                    isOneOfTypes = false;

                /**
                 * TODO: fix this
                 * it assumes, that validator rules contain additional params check
                 * these params can be:
                 * - either undefined or null
                 * - or should be of defined type
                 *
                 * if undefined or null - pass the test!
                 */
                if (_.isUndefined(value) || _.isNull(value)) {
                    return true;
                }

                //if (_.isUndefined(value)) {
                //	result.err = 'ArgumentsValidator: property "' + propertyName + '" is undefined';
                //	return false;
                //}

                /**
                 * propertyName value should be at least one of type, first match picked
                 * lazy logical or( || ) operation
                 */
                isOneOfTypes = _.some(entry.c, function (typeName) {
                    var conditionFunc = parser.getConditionFunction(typeName);

                    if (!_.isFunction(conditionFunc)) {
                        result.err = 'ArgumentsValidator: type "' + typeName + '" is not defined in validatorsMap';
                        return false;
                    }

                    /* primitive type chacks allowed only, so value can be picked directly */
                    return conditionFunc(value);
                });

                if (isOneOfTypes) {
                    return true;
                }

                result.message = 'ArgumentsValidator: "' + propertyName + '" = ' + value + ' is not ' + entry.c + '!';

                return false;
            });

            if (!result.passed) {
                result.message = result.err || entry.em || result.message || '';
            }

            return result;
        };

        var prevalidatorsIterator = function (entry, args) {

            var result = {
                passed: false,
                message: ''
            };

            result.passed = _.every(entry.c, function (condition) {
                var conditionFunc = parser.getConditionFunction(condition);

                if (!_.isFunction(conditionFunc)) {
                    result.message = 'argumentsValidator: prevalidation condition is not a function';
                    return false;
                }

                var value = parser.getValue(condition, args, entry.argIndex);

                return conditionFunc(value);
            });

            if (!result.passed) {
                result.message = result.message || entry.em || '';
            }

            return result;
        };

        var resultFunctions = {
            'prevalidators': prevalidatorsIterator,
            'validators': validatorsIterator
        };

        var start = function (fname, type, args) {
            if (!maps[fname]) {
                //fname is not defined in argumentsValidator
                errorManager.throwError('API_ERR_ARGUMENTS_VALIDATOR_2', [fname]);
            }

            if (!maps[fname][type]) {
                //No type specified for fname
                errorManager.throwError('API_ERR_ARGUMENTS_VALIDATOR_3', [type, fname]);
            }

            var result = {
                passed: false,
                message: ''
            };

            /** all (pre)validators should be successful, throw error on first fail
             *  @example:
             *  [
             *        { p: ['annotationId'], c: ["number"]},
             *        { p: ['contentId'], c: ["string", "number"]},
             *        { p: ['tagsList'], c: ["array"]}
             *  ]
             */
            _.each(maps[fname][type], function (entry) {

                result = resultFunctions[type](entry, args);

                if (!result.passed) {
                    /* break on first error */
                    throw result.message;
                }
            });
        };

        var argumentsValidator = {

            pre: function (args, fname) {
                start(fname, 'prevalidators', args);
            },

            run: function (dto, fname) {
                start(fname, 'validators', dto);
            },

            setRules: function (rules, oftype, funcname) {
                if (!maps[funcname]) {
                    maps[funcname] = {};
                }

                maps[funcname][oftype] = rules;
            },

            getRulesTypes: function () {
                return rulesTypes;
            }
        };

        return argumentsValidator;
    });

define(
    'argumentsProcessor', ['underscorenc', 'config', 'helpers', 'argumentsMapper', 'argumentsValidator'],

function(_, config, helpers, mapper, validator) {

    var fname = '',
        inputArguments = undefined,
        currentObject = {},
        isArgumentsUsed = false,
        isFnameSet = false,
        injectedRules = null;

    function restoreMainParams() {
        fname = '',
        inputArguments = undefined,
        currentObject = {},
        isArgumentsUsed = false,
        isFnameSet = false,
        injectedRules = null;
    }

    function checkFname() {
        if (!isFnameSet) {
            throw "argumentsProcessor: [prevalidate, map, validate] called before function name is set";
        }
    }

    /* NOTICE: this can be public method too, but */
    function setRules(rules, funcname) {
        if (!_.isObject(rules) || !_.isString(funcname)) {
            return;
        }

        if (rules.maps) {
            mapper.setRules(rules.maps, funcname);
        }

        _.each(validator.getRulesTypes(), function(ruleType) {
            if (rules[ruleType]) {
                validator.setRules(rules[ruleType], ruleType, funcname);
            }
        });
    }

    var paramsType = {
        'defaults': helpers.getEmptyParams()
    };

    var argumentsProcessor = {
        init: function() {
            return this;
        },

        start: function() {
            restoreMainParams();

            return this;
        },

        /* NOTICE: run function returns currentObject and breaks chaining */
        run: function() {
            return currentObject;
        },

        /**
        * NOTICE: developer is free to use either arguments or dto
        * in case of dto methods [prevelidate, map] are not working
        * since it is special methods for arguments processing
        *
        * on the other hand 'validate' method can be invoked only after arguments mapping,
        * since it works only with currentObject variable
        */
        set: function(args, rules) {
            rules = rules || null;

            isArgumentsUsed = _.isArguments(args);

            if (isArgumentsUsed) {
                inputArguments = args || [];
            } else  {
                currentObject = args || {};
            }

            injectedRules = rules;

            return this;
        },

        against: function(name) {
            fname = name;

            isFnameSet = true;

            if (!_.isNull(injectedRules)) {
                setRules(injectedRules, fname);
            }

            return this;
        },

        prevalidate: function() {
            /* this works only on arguments */
            if (!isArgumentsUsed) {
                return this;
            }

            checkFname();

            validator.pre(inputArguments, fname);

            return this;
        },

        map: function() {
            /* this works only on arguments */
            if (!isArgumentsUsed) {
                return this;
            }

            checkFname();

            var mappedValues = mapper.run(inputArguments, fname);
            //console.log(mappedValues);

            _.extend(currentObject, mappedValues);
            //console.log(currentObject);

            return this;
        },

        validate: function() {
            checkFname();

            validator.run(currentObject, fname);

            return this;
        },

        useDefaults: function() {
            currentObject = _.extend({}, paramsType.defaults, currentObject);

            return this;
        },

        runFullStack: function(fname, args, rules) {
            rules = rules || [];

            return this.start()
                        .set(args, rules)
                        .against(fname)
                        .prevalidate()
                        .useDefaults()
                        .map()
                        .validate()
                        .run();
        }
    };

    return argumentsProcessor.init();
});
define(
    'annotationAPI', ['helpers', 'underscorenc', 'config', 'client', 'annotations',
        'transportManager', 'argumentsProcessor', 'queryApiValidators'],

    function (helpers, _, config, client, Annotations, transportManager, argumentsProcessor, queryApiValidators) {
        var api = {};

        /**
         * Sends request to delete a specific annotation.
         *
         * @param {Number}      id                      Annotation_id of a annotation to be deleted.
         * @param {Object}      [param]                 Optional parameters.
         * @param {Function}    param.successHandler    successHandler() callback.
         * @param {Function}    param.errorHandler      errorHandler(err) callback.
         *
         * Deprecated signature:
         * @param {number} id Annotation id of a annotation to be deleted
         * @param {function} successHandler (optional) successHandler()
         * @param {function} errorHandler (Optional) errorHandler(err.message)
         */
        api.deleteAnnotation = function () {
            queryApiValidators.doInitCheck();
            var inputs,
                fname = 'deleteAnnotation';

            if (!helpers.isServiceReady()) {
                return;
            }

            inputs = argumentsProcessor.runFullStack(fname, arguments);

            Annotations
                .remove(inputs.id)
                .done(inputs.successHandler)
                .fail(inputs.errorHandler)
                .run();
        };

        /**
         * Sends request to delete a range of annotations. OData sets a limit of up to 20 records in the batch request.
         *
         * @param {Number[]}    annotationIdsList       Array of annotation_ids (integers).
         * @param {Object}      [param]                 Optional parameters.
         * @param {Function}    param.successHandler    successHandler() callback.
         * @param {Function}    param.errorHandler      errorHandler(err) callback.
         *
         * Deprecated signature:
         * @param {array} annotationIdsList, array of annotation_ids (integer)
         * @param {function} successHandler (optional), successHandler()
         * @param {function} errorHandler (optional), errorHandler(err.message)
         */
        api.deleteAnnotations = function () {
            queryApiValidators.doInitCheck();
            var inputs,
                fname = 'deleteAnnotations';

            if (!helpers.isServiceReady()) {
                return;
            }

            inputs = argumentsProcessor.runFullStack(fname, arguments);

            if (!_.isFunction(inputs.successHandler)) {
                inputs.successHandler = function () {
                    helpers.consoleLog('Delete ok');
                };
            }

            Annotations
                .remove(inputs.annotationIdsList)
                .done(inputs.successHandler)
                .fail(inputs.errorHandler)
                .run();
        };

        /**
         * Sends request to update an annotation.
         * params.visibility and params.visibilityInclude or params.visibilityInclude are mutually exclusive. When using the last two, params.currentVisibility is required.
         *
         * @param {Number}          annotation_id
         * @param {object}          fieldsValues                Object with key value pairs where key is a field name in annotations table, example {title: 'Hello World', type_id: 1}.
         * @param {Object}          [param]                     Optional parameters.
         * @param {String|Array}    param.visibility            Set a visibility for an annotation, supports array or string ['eBook', 'notebook'] / 'notebook'.
         * @param {String|Array}    param.visibilityInclude     Includes client ids in a visibility field for an annotation, supports array or string ['eBook', 'notebook'] / 'notebook'.
         * @param {String|Array}    param.visibilityExclude     Excludes client ids in a visibility field for an annotation, supports array or string ['eBook', 'notebook'] / 'notebook'.
         * @param {Number}          param.currentVisibilityId   Required when using visibilityInclude or visibilityExclude, that's a current visibility_id of a reacord that is being updated.
         * @param {Function}        param.successHandler        successHandler() callback.
         * @param {Function}        param.errorHandler          errorHandler(err) callback.
         *
         * Deprecated signature:
         * @param {number} annotation_id
         * @param {object} fieldsValues Object with properties in fieldName: newValue format, example {title: 'Hello World', annotationType_id: 1}
         * @param {function} successHandler Optional, successHandler()
         * @param {function} errorHandler Optional, errorHandler(err.message)
         */
        api.updateAnnotation = function () {
            queryApiValidators.doInitCheck();
            var inputs,
                fname = 'updateAnnotation';

            if (!helpers.isServiceReady()) {
                return;
            }

            inputs = argumentsProcessor.runFullStack(fname, arguments);

            if (inputs.visibility) {
                inputs.fieldsValues.visibility = inputs.visibility;
            }

            if (inputs.currentVisibilityId && (inputs.visibilityInclude || inputs.visibilityExclude)) {
                inputs.fieldsValues.currentVisibilityId = inputs.currentVisibilityId;
                inputs.fieldsValues.visibilityInclude = inputs.visibilityInclude;
                inputs.fieldsValues.visibilityExclude = inputs.visibilityExclude;
            }

            Annotations
                .update(inputs.id, inputs.fieldsValues)
                .done(inputs.successHandler)
                .fail(inputs.errorHandler)
                .run();
        };

        /**
         * Sends request to create a new annotation.
         *
         * @param {object}          fieldsValues            Object with key value pairs where key is a field name in annotations table, example {title: 'Hello World', type_id: 1}.
         * @param {Object}          [param]                 Optional parameters.
         * @param {String|Array}    param.visibility        Set a visibility for an annotation, supports array or string ['eBook', 'notebook'] / 'notebook'.
         * @param {Function}        param.successHandler    successHandler(data) callback. Data is a full annotation object.
         * @param {Function}        param.errorHandler      errorHandler(err) callback.
         *
         * Deprecated signature:
         * @param {object} fieldsValues Object with key value pairs where key is a field name in annotations table, example {title: 'Hello World', type_id: 1}
         * @param {function} successHandler (optional), successHandler(data) where data is an object representing a new record (contains annotation_id)
         * @param {function} errorHandler (optional), errorHandler(err.message)
         */
        api.createAnnotation = function () {
            queryApiValidators.doInitCheck();
            var inputs,
                fname = 'createAnnotation';

            if (!helpers.isServiceReady()) {
                return;
            }

            inputs = argumentsProcessor.runFullStack(fname, arguments);

            if (inputs.visibility) {
                inputs.fieldsValues.$visibility = inputs.visibility;
            }

            Annotations
                .create(inputs.fieldsValues)
                .done(inputs.successHandler)
                .fail(inputs.errorHandler)
                .run();
        };

        /**
         * Sends request to create a new annotation.
         *
         * @param {String}          text                    Search text that will be used to search for annotations by match in title and body_text fields.
         * @param {Object}          [param]                 Optional parameters.
         * @param {Object}          param.filters:          Object with name-value pairs {contentID: "13245", objectID: "aabbcc23454"}.
         * @param {String[]}        param.fields:           Array of strings representing fields in a returned records i.e. ['title', 'body_text', 'updated_date'].
         * @param {Number}          param.limitFrom:        Integer representing the starting point (the first top record is 0) or null for zero.
         * @param {Number}          param.limitCount:       Integer representing number of records to be returned or null for all.
         * @param {String[]}        param.orderBy:          Array of strings representing fields for ordering, example ["updated_date", "title"] or null or empty array if no orderrr4r4r4ing is required.
         * @param {Boolean}         param.orderDesc:        Default is false.
         * @param {String|Array}    param.visibility        Set a visibility for an annotation, supports array or string ['eBook', 'notebook'] / 'notebook'.
         * @param {Boolean}         param.getCount:         Gets count instead of records. Default is false.
         * @param {Boolean}         param.parseDate         If set to true, default OData date string /Date()/ will be converted to JS Date object.
         * @param {Function}        param.successHandler    successHandler(data) callback. Data is a list of annotation objects.
         * @param {Function}        param.errorHandler      errorHandler(err) callback.
         */
        api.getAnnotationsByTextString = function () {
            queryApiValidators.doInitCheck();
            var inputs,
                fname = 'getAnnotationsByTextString';

            if (!helpers.isServiceReady()) {
                return;
            }

            inputs = argumentsProcessor.runFullStack(fname, arguments);

            if (inputs.visibility) {
                inputs.filters = _.extend({}, inputs.filters, {'$visibility': inputs.visibility});
            }

            /* TODO: create custom filters builder as transport level */
            //inputs.customFilterString = "(substringof('" + helpers.encodeUrlString(inputs.text) + "', body_text) or substringof('" + helpers.encodeUrlString(inputs.text) + "', title))";

            inputs.filters.$or = [
                {body_text: {$like: inputs.text}},
                {title: {$like: inputs.text}}
            ];

            Annotations
                .find(inputs.filters)
                //.customFilterString(inputs.customFilterString)
                .outputFields(inputs.fields)
                .limit(inputs.limitFrom, inputs.limitCount)
                .order(inputs.orderBy, inputs.orderDesc)
                .done(inputs.successHandler)
                .fail(inputs.errorHandler)
                .parseDates(inputs.parseDate)
                .count(inputs.getCount)
                .run();
        };

        /**
         * Sends request to get a specific fields (relevant to a functionality) for a specific annotation.
         *
         * @param {number} annotation_id
         * @param {Object}          [param]                 Optional parameters.
         * @param {String[]}        param.fields            Array of strings representing fields in a returned records i.e. ['title', 'body_text', 'updated_date'].
         * @param {Boolean}         param.parseDate         If set to true, default OData date string /Date()/ will be converted to JS Date object.
         * @param {Function}        param.successHandler    successHandler(data) callback. Data is a full annotation object.
         * @param {Function}        param.errorHandler      errorHandler(err) callback.
         *
         * Deprecated signature:
         * @param {number} annotation_id (integer)
         * @param {array} fields Array of strings representing requested fields, example ['title', 'body_text', 'updated_date']
         * @param {function} successHandler Optional, successHandler(data.results)
         * @param {function} errorHandler Optional, errorHandler(err.message)
         */
        api.getAnnotationByID = function () {
            queryApiValidators.doInitCheck();
            var inputs,
                fname = 'getAnnotationByID';

            if (!helpers.isServiceReady()) {
                return;
            }

            inputs = argumentsProcessor.runFullStack(fname, arguments);

            Annotations
                .findOne(inputs.id)
                .outputFields(inputs.fields)
                .done(inputs.successHandler)
                .fail(inputs.errorHandler)
                .parseDates(inputs.parseDate)
                .run();
        };

        /**
         * Sends request to get a specific fields (relevant to a functionality) for annotation matching specified criteria.
         *
         * @param {Object}          [param]                 Optional parameters.
         * @param {Object}          param.filters:          Object with name-value pairs {contentID: "13245", objectID: "aabbcc23454"}.
         * @param {String[]}        param.fields:           Array of strings representing fields in a returned records i.e. ['title', 'body_text', 'updated_date'].
         * @param {Number}          param.limitFrom:        Integer representing the starting point (the first top record is 0) or null for zero.
         * @param {Number}          param.limitCount:       Integer representing number of records to be returned or null for all.
         * @param {String[]}        param.orderBy:          Array of strings representing fields for ordering, example ["updated_date", "title"] or null or empty array if no ordering is required.
         * @param {Boolean}         param.orderDesc:        Default is false meaning that if orderDesc is unspecified results will be returned in ascending order.
         * @param {String|Array}    param.visibility        Set a visibility for an annotation, supports array or string ['eBook', 'notebook'] / 'notebook'.
         * @param {Boolean}         param.getCount:         Gets count instead of records. Default is false.
         * @param {Boolean}         param.parseDate         If set to true, default OData date string /Date()/ will be converted to JS Date object.
         * @param {String}          param.next              Next is an object received in the successHandler in case when there is more results than the limit on the server.
         * @param {Function}        param.successHandler    successHandler(results, next) callback. Results is a list of annotation objects, next is a url to next batch of results.
         * @param {Function}        param.errorHandler      errorHandler(err) callback.
         *
         * Deprecated signature:
         * @param filters Object with name-value pairs {contentID: "13245", objectID: "aabbcc23454"}
         * @param fields Array of strings representing requested fields, example ['title', 'body_text', 'updated_date'] or null or empty array for all fields
         * @param orderby Array of strings representing fields for ordering, example ["updated_date", "title"] or null or empty array if no ordering is required
         * @param limitFrom Integer representing the starting point (the first top record is 0) or null for zero
         * @param limitCount Integer representing number of records to be returned or null for all
         * @param successHandler Optional, successHandler(data.results)
         * @param errorHandler Optional, errorHandler(err.message)
         */
        api.getAnnotations = function () {
            queryApiValidators.doInitCheck();
            var inputs,
                fname = 'getAnnotations';

            if (!helpers.isServiceReady()) {
                return;
            }

            inputs = argumentsProcessor.runFullStack(fname, arguments);

            if (inputs.visibility) {
                inputs.filters = _.extend({}, inputs.filters, {'$visibility': inputs.visibility});
            }

            var exec = Annotations
                .find(inputs.filters)
                .outputFields(inputs.fields)
                .limit(inputs.limitFrom, inputs.limitCount)
                //    .order(inputs.orderBy, inputs.orderDesc)
                .done(inputs.successHandler)
                .fail(inputs.errorHandler)
                .parseDates(inputs.parseDate)
                .count(inputs.getCount)
                .next(inputs.next);

            if (inputs.orderBy) {
                exec.order(inputs.orderBy, inputs.orderDesc);
            }

            exec.run();
        };

        /**
         * Sends request to get a count for annotations matching specified criteria.
         *
         * @param {Object}          [param]                 Optional parameters.
         * @param {Object}          param.filters:          Object with name-value pairs {contentID: "13245", objectID: "aabbcc23454"}.
         * @param {String|Array}    param.visibility        Set a visibility for an annotation, supports array or string ['eBook', 'notebook'] / 'notebook'.
         * @param {Function}        param.successHandler    successHandler(data) callback. Data is a list of annotation objects.
         * @param {Function}        param.errorHandler      errorHandler(err) callback.
         *
         * Deprecated signature:
         * @param filters Object with name-value pairs {contentID: "13245", objectID: "aabbcc23454"}
         * @param successHandler Optional, successHandler(data.results)
         * @param errorHandler Optional, errorHandler(err.message)
         */
        api.getAnnotationsCount = function () {
            queryApiValidators.doInitCheck();
            var inputs,
                fname = 'getAnnotationsCount';

            if (!helpers.isServiceReady()) {
                return;
            }

            inputs = argumentsProcessor.runFullStack(fname, arguments);

            if (inputs.visibility) {
                inputs.filters = _.extend({}, inputs.filters, {'$visibility': inputs.visibility});
            }

            Annotations
                .find(inputs.filters)
                .done(inputs.successHandler)
                .fail(inputs.errorHandler)
                .count()
                .run();
        };

        /* export entity and injected queryAPI to annotaion api */
        api.Annotations = Annotations;

        return api;
    });
define(
    'tagsAPI', ['helpers', 'underscorenc', 'config', 'client', 'annotations', 'tags',
        'transportManager', 'argumentsProcessor', 'errorManager', 'queryApiValidators'],

    function (helpers, _, config, client, Annotations, Tags, transportManager, argumentsProcessor, errorManager, queryApiValidators) {
        var api = {};

        /**
         * Sends request to create a new annotation along with a list of tags.
         * @param {Object}          annotationFieldsValues  Object with key value pairs where key is a field name in annotations table, example {title: 'Hello World', type_id: 1}.
         * @param {String[]}        tagsList                A list of strings representing tags ["nasa", "rocket"] or null if no tags should be created.
         * @param {Object}          [param]                 Optional parameters.
         * @param {String|Array}    param.visibility        Set a visibility for an annotation, supports array or string ['eBook', 'notebook'] / 'notebook'.
         * @param {Function}        param.successHandler    successHandler(data) callback. Data contains annotation object, doesn't contain tags.
         * @param {Function}        param.errorHandler      errorHandler(err) callback.
         *
         * Deprecated signature:
         * @param annotationFieldsValues Object with properties in fieldName: newValue format, example {title: 'Hello World', annotationType_id: 1}
         * @param tagsList, a list of strings representing tags ["nasa", "rocket"] or null if no tags should be created
         * @param successHandler Optional, successHandler(data) - data represents annotation not tags
         * @param errorHandler Optional, errorHandler(err.message)
         */
        api.createAnnotationAndTags = function (annotationFieldsValues, tagsList, params) {
            queryApiValidators.doInitCheck();

            var successHandler, errorHandler;
            if (_.isFunction(params)) {
                successHandler = params;
                errorHandler = arguments[3];
            } else {
                successHandler = params.successHandler;
                errorHandler = params.errorHandler;
            }

            if (!_.isNullUndef(params.visibility)) {
                annotationFieldsValues.$visibility = params.visibility;
            }

            var tags = _.map(tagsList, function (tagName) {
                return {value: tagName, content_id: annotationFieldsValues.content_id};
            });

            Annotations
                .create(annotationFieldsValues)
                .tags(tags)
                .done(function (data) {
                    successHandler(data[0], _.rest(data));
                })
                .fail(errorHandler)
                .run();

            // var inputs,
            //     fname = 'createAnnotationAndTags';

            // if (!helpers.isServiceReady()) return;

            // //console.log(inputs);

            // //check if number of items for batch request is larger than allowed value
            // if (tagsList.length > config.SETTINGS.AppSettings.MaxChangesetCount) {
            //     //Number of passed items for batch request is greater than maximum allowed (allowed {0})
            //     errorManager.throwError('API_ERR_TRANSPORT_1', [config.SETTINGS.AppSettings.MaxChangesetCount]);
            // }
            // inputs = argumentsProcessor.runFullStack(fname, arguments);

            // /* this can be mapped and injected inside annotation object */
            // if (inputs.visibility) inputs.annotationFieldsValues.visibility_id = client.convertNamesToID(inputs.visibility);

            // if (client.isSet()) {
            //     inputs.annotationFieldsValues.created_by_tool_id = client.getID();
            // }
            // /* end this */

            // var i,
            //     key,
            //     changeReq = [],
            //     len = inputs.tagsList.length;

            // changeReq.push({
            //     requestUri: "annotations",
            //     method: config.REQ_TYPE_POST,
            //     headers: {
            //         "Content-ID": "1"
            //     },
            //     data: inputs.annotationFieldsValues
            // });

            // if (inputs.tagsList) {
            //     for (i = 0; i < len; i++) {
            //         changeReq.push({
            //             requestUri: "tags",
            //             method: config.REQ_TYPE_POST,
            //             data: {
            //                 value: inputs.tagsList[i],
            //                 content_id: inputs.annotationFieldsValues.content_id,
            //                 annotation: {
            //                     __metadata: {
            //                         uri: "$1"
            //                     }
            //                 }
            //             }
            //         });
            //     }
            // }

            // transportManager.use(config.TRANSPORT_NAMES.ODATA)
            //     .batch(
            //         changeReq,
            //         function (data, response) {

            //             var retAnn, retTags, batchAdditionalData;

            //             if (data.__batchResponses &&
            //                 data.__batchResponses.length > 0 &&
            //                 data.__batchResponses[0].__changeResponses &&
            //                 data.__batchResponses[0].__changeResponses.length > 0) {

            //                 if (response) {
            //                     batchAdditionalData = helpers.getResponseAdditionalData(response);
            //                     batchAdditionalData.sub = [];
            //                     _.each(data.__batchResponses[0].__changeResponses, function (singleData) {
            //                         batchAdditionalData.sub.push(helpers.getResponseAdditionalData(singleData));
            //                     });
            //                 }

            //                 if (data.__batchResponses[0].__changeResponses[0].data &&
            //                     data.__batchResponses[0].__changeResponses[0].data.annotation_id) {

            //                     retAnn = data.__batchResponses[0].__changeResponses[0].data;
            //                 }

            //                 if (data.__batchResponses[0].__changeResponses.length > 1) {
            //                     retTags = [];

            //                     for (var i = 1; i < data.__batchResponses[0].__changeResponses.length; i++) {
            //                         if (data.__batchResponses[0].__changeResponses[i].data) {
            //                             retTags[retTags.length] = data.__batchResponses[0].__changeResponses[i].data;
            //                         }
            //                     }
            //                 }
            //             }

            //             if (inputs.successHandler) {
            //                 inputs.successHandler(retAnn, retTags, batchAdditionalData);
            //             } else {
            //                 helpers.consoleLog(retAnn, retTags, batchAdditionalData);
            //             }
            //         }, function (err, response) {
            //             if (inputs.errorHandler) {
            //                 batchAdditionalData = helpers.getResponseAdditionalData(response);
            //                 batchAdditionalData.sub = [];

            //                 batchAdditionalData.sub.push(helpers.getResponseAdditionalData(err.response));
            //                 inputs.errorHandler(err.message, batchAdditionalData);
            //             } else {
            //                 helpers.consoleLog(err.message, response);
            //             }
            //     });
        };

        /**
         * Sends request to create multiple tags for a specified annotationId.
         *
         * @param {Number}          annotationId            Annotation_id of an annotation
         * @param {String}          contentId               Should match the contend_id of updated annotation
         * @param {String[]}        tagsList                A list of strings representing tags ["nasa", "rocket"] or null if no tags should be created.
         * @param {Object}          [param]                 Optional parameters.
         * @param {Function}        param.successHandler    successHandler(data) callback. Data contains annotation object, doesn't contain tags.
         * @param {Function}        param.errorHandler      errorHandler(err) callback.
         *
         * Deprecated signature:
         * @param annotationId integer
         * @param contentId string (has to match the contend_id of the annotation with provided annotation_id)
         * @param tagsList. array of strings representing tags ["nasa", "rocket"]
         * @param successHandler Optional, successHandler()
         * @param errorHandler Optional, errorHandler(err.message)
         */
        api.createTagsForAnnotationId = function (annotationId, contentId, tagsList) {
            queryApiValidators.doInitCheck();
            var inputs,
                fname = 'createTagsForAnnotationId';

            if (!helpers.isServiceReady()) {
                return;
            }

            inputs = argumentsProcessor.runFullStack(fname, arguments);

            //check if number of items for batch request is larger than allowed value
            if (tagsList.length > config.SETTINGS.AppSettings.MaxChangesetCount) {
                //Number of passed items for batch request is greater than maximum allowed (allowed {0})
                errorManager.throwError('API_ERR_TRANSPORT_1', [config.SETTINGS.AppSettings.MaxChangesetCount]);
            }

            var tags = _.map(_.uniq(tagsList), function (tag) {
                return {'value': tag};
            });

            Tags
                .create(tags)
                .commonFields({
                    'annotation_id': inputs.annotationId,
                    'content_id': inputs.contentId
                })
                .done(function (data) {
                    // fix for legacy implementatin
                    // in the past even single tag would be created in a batch
                    // so that the returned obj would be single item array
                    if (_.isObjectNotArray(data)) {
                        data = [data];
                    }
                    if (inputs.successHandler) {
                        inputs.successHandler(data);
                    } else {
                        helpers.consoleLog("Create tags OK");
                    }
                })
                .fail(inputs.errorHandler)
                .run();
        };

        /**
         * Sends request to get tags by annotationId.
         *
         * @param {Number}          annotationId            annotation_id of an annotations with tags
         * @param {Object}          [param]                 Optional parameters.
         * @param {Number}          param.limitFrom:        Integer representing the starting point (the first top record is 0) or null for zero.
         * @param {Number}          param.limitCount:       Integer representing number of records to be returned or null for all.
         * @param {String[]}        param.orderBy:          Array of strings representing fields for ordering, example ["updated_date", "title"] or null or empty array if no ordering is required.
         * @param {Boolean}         param.orderDesc:        Default is false meaning that if orderDesc is unspecified results will be returned in ascending order.
         * @param {Boolean}         param.getCount:         Gets count instead of records. Default is false.
         * @param {Function}        param.successHandler    successHandler(data) callback. Data is a list of annotation objects.
         * @param {Function}        param.errorHandler      errorHandler(err) callback.
         *
         * Deprecated signature:
         * @param annotationId integer
         * @param orderby Array of strings representing fields for ordering, example ["updated_date", "title"] or null or empty array if no ordering is required
         * @param limitFrom Integer representing the starting point (the first top record is 0) or null for zero
         * @param limitCount Integer representing number of records to be returned or null for all
         * @param successHandler Optional, successHandler(data.results)
         * @param errorHandler Optional, errorHandler(err.message)
         */
        api.getTagsByAnnotationId = function () {
            queryApiValidators.doInitCheck();
            var inputs,
                fname = 'getTagsByAnnotationId';

            if (!helpers.isServiceReady()) {
                return;
            }

            inputs = argumentsProcessor.runFullStack(fname, arguments);

            var filters = {
                annotation_id: inputs.annotationId
            };

            Tags
                .find(filters)
                .limit(inputs.limitFrom, inputs.limitCount)
                .order(inputs.orderBy, inputs.orderDesc)
                .count(inputs.getCount)
                .fail(inputs.errorHandler)
                .done(inputs.successHandler)
                .run();
        };

        /**
         * Sends request to get tags by contentId (for a whole book).
         * @param contentId string
         * @param orderby Array of strings representing fields for ordering, example ["updated_date", "title"] or null or empty array if no ordering is required
         * @param limitFrom Integer representing the starting point (the first top record is 0) or null for zero
         * @param limitCount Integer representing number of records to be returned or null for all
         * @param successHandler Optional, successHandler(data.results)
         * @param errorHandler Optional, errorHandler(err.message)
         */
        api.getTagsByContentId = function () {
            queryApiValidators.doInitCheck();
            var inputs,
                fname = 'getTagsByContentId';

            if (!helpers.isServiceReady()) {
                return;
            }

            inputs = argumentsProcessor.runFullStack(fname, arguments);

            var filters = {
                content_id: inputs.contentId
            };

            Tags
                .find(filters)
                .limit(inputs.limitFrom, inputs.limitCount)
                .order(inputs.orderBy)
                .fail(inputs.errorHandler)
                .done(inputs.successHandler)
                .run();
        };

        /**
         * Sends request to delete tags by tag_ids.
         *
         * @param {String[]}        tagIdsList              A list of strings representing tags ["nasa", "rocket"].
         * @param {Object}          [param]                 Optional parameters.
         * @param {Function}        param.successHandler    successHandler(data) callback. Data contains annotation object, doesn't contain tags.
         * @param {Function}        param.errorHandler      errorHandler(err) callback.
         *
         * Deprecated signature:
         * @param tagIdsList Array of tag_ids numbers [9, 10, 11]
         * @param successHandler Optional, successHandler()
         * @param errorHandler Optional, errorHandler(err.message)
         */
        api.deleteTags = function () {
            queryApiValidators.doInitCheck();
            var inputs,
                fname = 'deleteTags';

            if (!helpers.isServiceReady()) {
                return;
            }

            inputs = argumentsProcessor.runFullStack(fname, arguments);

            Tags
                .remove(inputs.tagIdsList)
                .done(inputs.successHandler)
                .fail(inputs.errorHandler)
                .run();
        };

        /**
         * Sends request to get annotations for a specified tag.
         *
         * @param {String}          tag                             String representing one tag.
         * @param {Object}          [param]                         Optional parameters.
         * @param {Object}          param.filters:                  Object with name-value pairs {contentID: "13245", objectID: "aabbcc23454"}.
         * @param {String[]}        param.fields:                   Array of strings representing fields in a returned records i.e. ['title', 'body_text', 'updated_date'].
         * @param {Number}          param.limitFrom:                Integer representing the starting point (the first top record is 0) or null for zero.
         * @param {Number}          param.limitCount:               Integer representing number of records to be returned or null for all.
         * @param {String[]}        param.orderByTag:               Array of strings representing fields for ordering in tags table ["annotation_id", "content_id", "value"] or null or empty array if no ordering is required.
         * @param {String[]}        param.orderByAnnotation:        Array of strings representing fields for ordering in annotations table ["updated_date", "title"] or null or empty array if no ordering is required.
         * @param {Boolean}         param.orderDesc:                Default is false meaning that if orderDesc is unspecified results will be returned in ascending order.
         * @param {String|Array}    param.visibility                Set a visibility for an annotation, supports array or string ['eBook', 'notebook'] / 'notebook'.
         * @param {Boolean}         param.parseDate                 If set to true, default OData date string /Date()/ will be converted to JS Date object.
         * @param {Function}        param.successHandler            successHandler(data) callback. Data is a list of annotation objects.
         * @param {Function}        param.errorHandler              errorHandler(err) callback.
         */
        api.getAnnotationsByTag = function () {
            throw "Not implemented.";
            // queryApiValidators.doInitCheck();
            // var inputs,
            //     fname = 'getAnnotationsByTag';

            // if (!helpers.isServiceReady()) return;

            // inputs = argumentsProcessor.runFullStack(fname, arguments);

            // if (inputs.visibility) {
            //     if (!inputs.filters) {
            //         inputs.filters = {};
            //     }

            //     inputs.filters.visibility_id = client.convertNamesToVisibilityIds(inputs.visibility);
            // }

            // var tagFilters = {'value': [inputs.tag]};

            // var baseURL = helpers.templatify("tags/<%= tail %>");

            // transportManager.use(config.TRANSPORT_NAMES.ODATA)
            //     .findExpanded({
            //         baseURL: baseURL,
            //         successHandler: inputs.successHandler,
            //         errorHandler: inputs.errorHandler,
            //         fields: inputs.fields,
            //         orderBy: inputs.orderByTag,
            //         orderDesc: inputs.orderDesc,
            //         limitFrom: inputs.limitFrom,
            //         limitCount: inputs.limitCount,
            //         parseDate: inputs.parseDate,

            //         filters: tagFilters,

            //         expandedFor: "annotation",

            //         // setFilters: [inputs.tag],
            //         // setFiltersFilterName: 'value',

            //         expandedForFilters: inputs.filters,

            //         orderByExpanded: inputs.orderByAnnotation
            //     });
        };

        /**
         * Sends request to get a distinct list of tags.
         *
         *
         * @param {String[]}        tags                     Array of tag name strings ["nasa", "rocket", "sputnik"].
         * @param {Object}          [params]                 Optional parameters.
         * @param {String}          params.contentId         Content_id optionally.
         * @param {String}          params.forUser           Allows impersonating other user.
         * @param {Number}          params.visibilityId      Visibility_id optionally.
         * @param {String[]}        params.visibility        Visibility optionally.
         * @param {Function}        params.successHandler    successHandler(data) callback. Data is a list of tags objects.
         * @param {Function}        params.errorHandler      errorHandler(err) callback.
         */
        api.getDistinctTags = function (params) {
            var fname = 'getDistinctTags';

            if (!helpers.isServiceReady()) {
                return;
            }

            params = params || helpers.getEmptyParams();

            helpers.areArgsValidType(
                [{
                    o: [params.successHandler, params.errorHandler],
                    t: ["function"]
                }, {
                    o: [params.contentId, params.forUser],
                    t: ["string"]
                }, {
                    o: [params.visibilityId],
                    t: ["number"]
                }, {
                    o: [params.visibility],
                    t: ["array", "string"]
                }
                ],
                fname);

            var visibilityId = params.visibilityId;
            if (visibilityId === null || visibilityId === undefined) {
                visibilityId = params.visibility ? client.convertNamesToID(params.visibility) : client.getID();
            }

            this.getDistinctTagsByVisibilityIdAndContentId(
                visibilityId,
                params.contentId ? params.contentId : '',
                params.successHandler,
                params.errorHandler,
                params.forUser ? params.forUser : ''
            );
        };

        api.getDistinctTagsByVisibilityIdAndContentId = function (visibilityId,
                                                                  contentId,
                                                                  successHandler,
                                                                  errorHandler,
                                                                  forUser) {

            if (!helpers.isServiceReady()) {
                return;
            }

            var param = {};
            if (!_.isNullUndef(contentId) && _.isNonEmptyString(contentId)) {
                param.content_id = contentId;
            }
            if (!_.isNullUndef(visibilityId)) {
                param.client_id = visibilityId;
            }

            Tags
                .getDistinctTags(param)
                .forUser(forUser ? forUser : null)
                .done(successHandler)
                .fail(errorHandler)
                .run();

            //   var user = '';
            // if (forUser && !_.isNull(forUser)) {
            //     user = 'user_id=' + forUser + '&';
            //     //when DP-1774 is done, this should be refactored in the similar fashion
            //     //it will also be rewrited to use cascading syntax
            // }
            // var SERVICE = "Tag/DistinctTags",
            //   client = "client_id=" + visibilityId,
            //   content = contentId ? "&content_id=" + contentId : contentId,
            //   requestURL = helpers.getRequestURL("?" + user + client + content, SERVICE);

            // helpers.consoleLog("READ request: " + requestURL);

            // oData.read({
            //   requestUri: requestURL,

            //   // WSi DP-2469: we don't want full metadata here in for getting tags
            //   headers: helpers.getHeader({"Accept": "application/json;odata=minimalmetadata;q=0.8, application/atom+xml;q=0.7, application/json;q=0.5, */*;q=0.1"}),
            //   timeoutMS: config.REQUEST_TIMEOUT
            // }, function(data, response) {

            //   var tags = [];
            //   //data = fixUnparsedServiceData(data, response);

            //   if (data && data.results.length > 0) {
            //     for (i = 0; i < data.results.length; i++) {
            //       tags[i] = {
            //         value: data.results[i].value,
            //         id: data.results[i].id
            //       };
            //     }
            //   }

            //   if (successHandler) {
            //       var responseAdditionalData = helpers.getResponseAdditionalData(response);
            //       successHandler(tags, responseAdditionalData);
            //   }
            //   else {
            //     helpers.consoleLog("success - response: " + tags);
            //     helpers.consoleLog(helpers.debugParseResults(data));
            //   }
            // }, function(err) {
            //     if (errorHandler) {
            //         var responseAdditionalData = helpers.getResponseAdditionalData(err.response);
            //         errorHandler(err.message, responseAdditionalData);
            //     }
            //   else helpers.consoleLog("error: " + err.message);
            // });
        };

        /* export entity and injected queryAPI to tags api */
        api.Tags = Tags;

        return api;
    });
define(
    'customODataAPI', ['helpers', 'underscorenc', 'config', 'client',
        'oDataService', 'transportManager', 'argumentsProcessor', 'requestManager'],

    function (helpers, _, config, client, oData, transportManager, argumentsProcessor, reqMan) {
        var api = {};

        /**
         * Tests whether the data persistence service is up
         *
         * @param {Object}      params
         * @param {Function}    param.successHandler    successHandler(data) callback. Data is a msg that a server may return.
         * @param {Function}    param.errorHandler      errorHandler(err) callback. Err is a msg that a server may return.
         */
        api.testHeartbeat = function (params) {
            var fname = 'testHeartbeat',
                rules = {
                    'validators': [{p: ['successHandler', 'errorHandler'], c: ['function']}]
                };

            params = params || {};

            argumentsProcessor
                .start()
                .set(params, rules)
                .against(fname)
                .validate()
                .run();

            // transportManager.use(config.TRANSPORT_NAMES.ODATA)
            //   .find({
            //     baseURL             : helpers.templatify('client_tools/<%= tail%>'),
            //     filters             : client.isSet() ?  {client_tool_id: client.getID()} : {},
            //     count               : true,
            //     successHandler      : params.successHandler || function(data){helpers.consoleLog('Heartbeat OK.');},
            //     errorHandler        : params.errorHandler || function(err){helpers.consoleLog('Heartbeat fail: ' + err);}
            // });

            var idx = reqMan.createSub(config.CRUD.find, true, config.COLLECTIONS.entityless.nameUppercase);
            reqMan.setProp(idx, reqMan.PROPS.BASE_URL, helpers.templatify('client_tools/<%= tail %>'));
            reqMan.setProp(
                idx,
                reqMan.PROPS.FILTERS,
                (client.isSet() ? {client_tool_id: client.getID()} : {})
            );
            reqMan.setProp(idx, reqMan.PROPS.COUNT, true);
            if (_.isFunction(params.successHandler)) {
                reqMan.setProp(reqMan.PROPS.SUCCESS_HANDLER, params.successHandler);
            }
            if (_.isFunction(params.errorHandler)) {
                reqMan.setProp(reqMan.PROPS.ERROR_HANDLER, params.errorHandler);
            }
            var request = reqMan.exportRequest();
            reqMan._reset();
            transportManager.use(config.TRANSPORT_NAMES.ODATA).run(request);
        };

        /**
         * MX ebook only - Sends request to get student's interactive note from a teacher acount
         * @param userId, string representing a student's user_guid
         * @param filters, Object with name-value pairs {content_id: 'a', flag_id:[1, 2]}
         *          Note that above example will produce filter=content_id eq a and flag_id eq 1 or flag_id eq 2
         *          This is exactly what we want from the MX perspective, notes with flag 1 OR 2 at the same time.
         *          NOTE: The required fields in filters: content_id, object_id, type_id
         * @param fields Array of strings representing requested fields, example ['title', 'body_text', 'updated_date'] or null or empty array for all fields
         * @param orderby Array of strings representing fields for ordering, example ["updated_date", "title"] or null or empty array if no ordering is required
         * @param limitFrom Integer representing the starting point (the first top record is 0) or null for zero
         * @param limitCount Integer representing number of records to be returned or null for all
         * @param {String|Array}    param.visibility        Set a visibility for an annotation, supports array or string ['eBook', 'notebook'] / 'notebook'.
         * @param successHandler Optional, successHandler(data.results)
         * @param errorHandler Optional, errorHandler(err.message)
         */
        api.getAnnotationsByUser = function (userId, filters, fields, orderBy, limitFrom, limitCount, successHandler, errorHandler, visibility) {
            if (!helpers.isServiceReady()) {
                return;
            }

            var customFilters = {
                user_guid: _.wrapInto(userId, "'"),
                content_id: _.wrapInto(filters.content_id, "'"),
                object_id: _.wrapInto(filters.object_id, "'"),
                type_id: filters.type_id
            };

            //var filterParser = transportManager
            //    .use(config.TRANSPORT_NAMES.ODATA)
            //    .getFiltersParser();

            // customFilterString = queryBuilder.filtersToString(
            //   customFilters, {
            //     signOperator: "", signEq: "=", signAnd: "&"
            //   });

            // customFilterString = filterParser.getCustomQueryOptions(customFilters);

            delete filters.content_id;
            delete filters.object_id;
            delete filters.type_id;

            if (visibility) {
                filters.visibility_id = client.convertNamesToVisibilityIds(visibility);
            }

            // transportManager.use(config.TRANSPORT_NAMES.ODATA)
            //   .find({
            //     baseURL: helpers.templatify('GetAnnotationsByStudent/<%= tail %>'),
            //     // set: "GetAnnotationsByStudent",
            //     customFunctionString: customFilterString,
            //     filters: filters,
            //     fields: fields,
            //     orderBy: orderBy,
            //     limitFrom: limitFrom,
            //     limitCount: limitCount,
            //     successHandler: successHandler,
            //     errorHandler: errorHandler
            // });

            var idx = reqMan.createSub(config.CRUD.find, true, config.COLLECTIONS.entityless.nameUppercase);
            reqMan.setProp(
                idx,
                reqMan.PROPS.BASE_URL,
                helpers.templatify('GetAnnotationsByStudent/<%= tail %>')
            );

            // if (customFilterString)
            //   reqMan.setProp(idx, reqMan.PROPS.CUSTOM_FILTER_STRING, customFilterString);
            if (filters) {
                reqMan.setProp(idx, reqMan.PROPS.FILTERS, filters);
            }
            if (fields) {
                reqMan.setProp(idx, reqMan.PROPS.FIELDS, fields);
            }
            if (orderBy) {
                reqMan.setProp(idx, reqMan.PROPS.ORDER_BY, orderBy);
            }
            if (limitFrom) {
                reqMan.setProp(idx, reqMan.PROPS.LIMIT_FROM, limitFrom);
            }
            if (limitCount) {
                reqMan.setProp(idx, reqMan.PROPS.LIMIT_COUNT, limitCount);
            }
            if (successHandler) {
                reqMan.setProp(reqMan.PROPS.SUCCESS_HANDLER, successHandler);
            }
            if (errorHandler) {
                reqMan.setProp(reqMan.PROPS.ERROR_HANDLER, errorHandler);
            }

            reqMan.setProp(idx, reqMan.PROPS.QUERY_PARAMS, customFilters);

            var request = reqMan.exportRequest();
            reqMan._reset();
            transportManager.use(config.TRANSPORT_NAMES.ODATA).run(request);
        };

        /**
         * MX ebook only - Sends request to get a teacher comments
         * (currently parameters marked as (n/a) are not implemented on the service side
         * - they won't have any effect, but they are included for future compatibility)
         * @param annotationId, annotation id of a student's interactive note that teacher comments are linked to
         * @param filters (n/a) Object with name-value pairs {content_id: "13245", object_id: "aabbcc23454"}
         * @param fields (n/a) Array of strings representing requested fields, example ['title', 'body_text', 'updated_date'] or null or empty array for all fields
         * @param orderby (n/a) Array of strings representing fields for ordering, example ["updated_date", "title"] or null or empty array if no ordering is required
         * @param limitFrom (n/a) Integer representing the starting point (the first top record is 0) or null for zero
         * @param limitCount (n/a) Integer representing number of records to be returned or null for all
         * @param successHandler Optional, successHandler(data.results)
         * @param errorHandler Optional, errorHandler(err.message)
         */
        api.getTeacherCommentsAsStudent = function (annotationId, filters, fields, orderBy, limitFrom, limitCount, successHandler, errorHandler) {
            if (!helpers.isServiceReady()) {
                return;
            }

            // not in use at the moment until support for this is implemented on the server side

            //var queryBuilder = transportManager.use(config.TRANSPORT_NAMES.ODATA).getQueryBuilder();
            //var filterString = queryBuilder.filtersToString(filters);
            //var selectString = queryBuilder.fieldsToString(fields, "select", "annotation");
            //var orderByString = queryBuilder.fieldsToString(orderby, "orderby");
            //var limitString = queryBuilder.limitToString(limitFrom, limitCount);

            var SERVICE = "Annotation/Comments?annotation_id=";
            var requestURL = SERVICE + annotationId;//helpers.getRequestURL(annotationId, SERVICE);
            // not implemented on server yet://  + "/?" + filterString + selectString + ",value,annotation_id" + orderByString + limitString;

            helpers.consoleLog("READ request: " + requestURL);
            // oData.read({
            //   requestUri: requestURL,
            //   headers: helpers.getHeader(),
            //   timeoutMS: config.REQUEST_TIMEOUT
            // },

            // function(data, response, status) {
            //     if (successHandler) {
            //         var responseAdditionalData = helpers.getResponseAdditionalData(response);
            //         successHandler(data.results, responseAdditionalData);
            //     }
            //   else {
            //     //helpers.consoleLog("success - data: " + data);
            //     helpers.consoleLog("success - response: " + response);
            //     helpers.consoleLog(helpers.debugParseResults(data));
            //   }
            // },

            // function(err) {
            //     if (errorHandler) {
            //         var responseAdditionalData = helpers.getResponseAdditionalData(err.response);
            //         errorHandler(err.message, responseAdditionalData);
            //     }
            //   else helpers.consoleLog("error: " + err.message);
            // });

            var idx = reqMan.createSub(config.CRUD.find, true, config.COLLECTIONS.entityless.nameUppercase);
            reqMan.setProp(
                idx,
                reqMan.PROPS.BASE_URL,
                helpers.templatify(requestURL)
            );

            if (filters) {
                reqMan.setProp(idx, reqMan.PROPS.FILTERS, filters);
            }
            if (fields) {
                reqMan.setProp(idx, reqMan.PROPS.FIELDS, fields);
            }
            if (orderBy) {
                reqMan.setProp(idx, reqMan.PROPS.ORDER_BY, orderBy);
            }
            if (limitFrom) {
                reqMan.setProp(idx, reqMan.PROPS.LIMIT_FROM, limitFrom);
            }
            if (limitCount) {
                reqMan.setProp(idx, reqMan.PROPS.LIMIT_COUNT, limitCount);
            }
            if (successHandler) {
                reqMan.setProp(reqMan.PROPS.SUCCESS_HANDLER, successHandler);
            }
            if (errorHandler) {
                reqMan.setProp(reqMan.PROPS.ERROR_HANDLER, errorHandler);
            }
            reqMan.setProp(idx, reqMan.PROPS.IS_WEBAPI, true);

            var request = reqMan.exportRequest();
            reqMan._reset();
            transportManager.use(config.TRANSPORT_NAMES.ODATA).run(request);
        };

        /**
         * MX ebook only - Sends request to update intereactive note's flag from 1 to 2 from a teacher account
         * @param annotationId, annotation id of a student's interactive note to mark as read
         * @param successHandler Optional, successHandler(data.results)
         * @param errorHandler Optional, errorHandler(err.message)
         */
        api.markInteractiveNoteAsRead = function (annotationId, successHandler, errorHandler) {
            if (!helpers.isServiceReady()) {
                return;
            }

            var SERVICE = "Annotation/InteractiveNoteMarkAsRead?annotation_id=";
            var requestURL = SERVICE + annotationId;//helpers.getRequestURL(annotationId, SERVICE);

            helpers.consoleLog("READ request: " + requestURL);

            // oData.request({
            //     requestUri: requestURL,
            //     method: helpers.getHTTPMethod(config.REQ_TYPE_POST),
            //     headers: helpers.getHeader(config.REQ_TYPE_POST),
            //     timeoutMS: config.REQUEST_TIMEOUT
            //   },
            //   function (data, response) {
            //       if (successHandler) {
            //           var responseAdditionalData = helpers.getResponseAdditionalData(response);
            //           successHandler(data, responseAdditionalData);
            //       }
            //     else {
            //       //helpers.consoleLog("success - data: " + data);
            //       helpers.consoleLog("success - response: " + response);
            //       helpers.consoleLog(helpers.debugParseResults(data));
            //     }
            //   },

            //   function (err) {
            //       if (errorHandler) {
            //           var responseAdditionalData = helpers.getResponseAdditionalData(err.response);
            //           errorHandler(err.message, responseAdditionalData);
            //       }
            //     else helpers.consoleLog("error: " + err.message);
            // });

            var idx = reqMan.createSub(config.CRUD.create, true, config.COLLECTIONS.entityless.nameUppercase);
            reqMan.setProp(
                idx,
                reqMan.PROPS.BASE_URL,
                helpers.templatify(requestURL)
            );

            if (successHandler) {
                reqMan.setProp(reqMan.PROPS.SUCCESS_HANDLER, successHandler);
            }
            if (errorHandler) {
                reqMan.setProp(reqMan.PROPS.ERROR_HANDLER, errorHandler);
            }
            reqMan.setProp(idx, reqMan.PROPS.IS_WEBAPI, true);

            var request = reqMan.exportRequest();
            reqMan._reset();
            transportManager.use(config.TRANSPORT_NAMES.ODATA).run(request);
        };

        /**
         * Sends request to mark teacher comment as read
         * @param annotationId Int
         * @param successHandler Optional, successHandler(data.results)
         * @param errorHandler Optional, errorHandler(err.message)
         */
        api.markTeacherCommentAsRead = function (annotationId, successHandler, errorHandler) {
            if (!helpers.isServiceReady()) {
                return;
            }

            var SERVICE = "annotation/TeacherCommentMarkAsRead/?annotation_id=";
            var requestURL = SERVICE + annotationId;//helpers.getRequestURL(annotationId, SERVICE);

            helpers.consoleLog("READ request: " + requestURL);

            // oData.request ({
            //     requestUri: requestURL,
            //     method: helpers.getHTTPMethod(config.REQ_TYPE_POST),
            //     headers: helpers.getHeader(config.REQ_TYPE_POST),
            //     timeoutMS: config.REQUEST_TIMEOUT
            //   },
            //   function(data, response) {
            //       if (successHandler) {
            //           var responseAdditionalData = helpers.getResponseAdditionalData(response);
            //           successHandler(data, responseAdditionalData);
            //       }
            //     else {
            //       helpers.consoleLog("success - response: " + response);
            //       helpers.consoleLog(helpers.debugParseResults(data));
            //     }
            //   },

            //   function(err) {
            //       if (errorHandler) {
            //           var responseAdditionalData = helpers.getResponseAdditionalData(err.response);
            //           errorHandler(err.message, responseAdditionalData);
            //       }
            //     else helpers.consoleLog("error: " + err.message);
            // });

            var idx = reqMan.createSub(config.CRUD.create, true, config.COLLECTIONS.entityless.nameUppercase);
            reqMan.setProp(
                idx,
                reqMan.PROPS.BASE_URL,
                helpers.templatify(requestURL)
            );

            if (successHandler) {
                reqMan.setProp(reqMan.PROPS.SUCCESS_HANDLER, successHandler);
            }
            if (errorHandler) {
                reqMan.setProp(reqMan.PROPS.ERROR_HANDLER, errorHandler);
            }
            reqMan.setProp(idx, reqMan.PROPS.IS_WEBAPI, true);

            var request = reqMan.exportRequest();
            reqMan._reset();
            transportManager.use(config.TRANSPORT_NAMES.ODATA).run(request);
        };

        return api;
    });
define(
    'aggregationAPI', ['helpers', 'underscorenc', 'config', 'transportManager', 'errorManager'],

    function (helpers, _, config, transportManager, errorManager) {
        var api = {};

        /**
         * MX ebook only - requires jQuery
         * Sends request to to get number of all and unread interactive notes for a group of studetns for a content_id (page) from a teacher account
         * @param contentId, a string representing content_id
         * @param objectId, a string representing object_id
         * @param userIds, a list of strings representing students' user_ids
         * @param successHandler, successHandler(results) where results is a list of objects where each object is of format:
         *          {Id: user_id, Total: n, UnRead: n } where user_id is a string representing user id and n is an integer
         * @param errorHandler, errorHandler(err.message)
         */
        api.getInteractiveNotesCountsForStudents = function (contentId, objectId, userIds, successHandler, errorHandler) {
            if (!helpers.isServiceReady()) {
                return;
            }

            if (config.USE_CAS_V2 === true) {
                errorManager.throwError('API_ERR_GENERAL_4', ['getInteractiveNotesCountsForStudents']);
            }

            var payload = {};
            payload.ContentId = contentId;
            payload.ObjectId = objectId;
            payload.AnnotationType = 4;
            payload.Ids = userIds;
            payload.QueryType = 'studentlist';

            var SERVICE = "action/Count/StudentNotesCount";
            var requestURL = helpers.getRequestURL(SERVICE, true);

            transportManager.use(config.TRANSPORT_NAMES.AJAX).read(
                {
                    url: requestURL,
                    data: payload,
                    type: config.REQ_TYPE_POST
                },
                successHandler,
                errorHandler
            );
        };

        /**
         * MX ebook only - requires jQuery
         * Sends request to to get number of all and unread interactive notes for a group of object_ids (pages) for a student from a teacher account
         * @param contentId, a string representing content_id
         * @param userId, a string representing a user_id
         * @param objectIds, a list of strings representing object_ids/pages
         * @param successHandler, successHandler(results) where results is a list of objects where each object is of format:
         *          {Id: object_id, Total: n, UnRead: n } where user_id is a string representing user id and n is an integer
         * @param errorHandler, errorHandler(err.message)
         */
        api.getInteractiveNotesCountsForPages = function (contentId, userId, objectIds, successHandler, errorHandler) {
            if (!helpers.isServiceReady()) {
                return;
            }

            if (config.USE_CAS_V2 === true) {
                errorManager.throwError('API_ERR_GENERAL_4', ['getInteractiveNotesCountsForPages']);
            }

            var payload = {};
            payload.ContentId = contentId;
            payload.UserId = userId;
            payload.AnnotationType = 4;
            payload.Ids = objectIds;
            payload.QueryType = 'pagelist';

            var SERVICE = "action/Count/PageNotesCount";
            var requestURL = helpers.getRequestURL(SERVICE, true);

            transportManager.use(config.TRANSPORT_NAMES.AJAX).read(
                {
                    url: requestURL,
                    data: payload,
                    type: config.REQ_TYPE_POST
                },
                successHandler,
                errorHandler
            );
        };

        /**
         * MX ebook only - requires jQuery
         * Sends request to to get number of all and unread interactive notes for a group of object_ids (pages) for a student from a teacher account
         * @param contentId, a string representing content_id
         * @param userId, a list representing representing user_id as strings ['student1', 'student2', 'student3']
         * @param objectIds, a list of strings representing object_ids/pages ['1', '2', '3']
         * @param successHandler, successHandler(results) where results is a list of objects where each object is of format:
         *          {Id: object_id, Total: n, UnRead: n } where id is a string representing object_ids and
         *                                                totals and unread are aggregated for the students provided
         * @param errorHandler, errorHandler(err.message)
         */
        api.getInteractiveNotesCountsForStudentsPages = function (contentId, userIds, objectIds, successHandler, errorHandler) {
            if (!helpers.isServiceReady()) {
                return;
            }

            if (config.USE_CAS_V2 === true) {
                errorManager.throwError('API_ERR_GENERAL_4', ['getInteractiveNotesCountsForStudentsPages']);
            }

            var payload = {};
            payload.ContentId = contentId;
            payload.AnnotationType = 4;
            payload.Ids = objectIds;
            payload.StudentIds = userIds;
            payload.QueryType = 'pagelist';

            var SERVICE = "action/Count/TurnedInCountForPages";
            var requestURL = helpers.getRequestURL(SERVICE, true);

            transportManager.use(config.TRANSPORT_NAMES.AJAX).read(
                {
                    url: requestURL,
                    data: payload,
                    type: config.REQ_TYPE_POST
                },
                successHandler,
                errorHandler
            );
        };

        /**
         * MX ebook only - requires jQuery
         * Sends request to to get number of all interactive notes and teacher comments for a group of object_ids (pages) for a student from a teacher account
         * @param contentId, a string representing content_id
         * @param userId, a string representing a user_id
         * @param objectIds, a list of strings representing object_ids/pages ['1', '2', '3']
         * @param successHandler, successHandler(results) where results is a list of objects where each object is of format:
         *          {Id: object_id, Total: n, UnRead: n } where user_id is a string representing user id and n is an integer
         * @param errorHandler, errorHandler(err.message)
         */
        api.getCountsAsStudentForPages = function (contentId, objectIds, successHandler, errorHandler) {
            if (!helpers.isServiceReady()) {
                return;
            }

            var payload = {};
            payload.ContentId = contentId;
            payload.AnnotationType = 4;
            payload.Ids = objectIds;
            payload.QueryType = 'pagelist';

            var SERVICE = "action/Count/AllNotesCountByPage";
            var requestURL = helpers.getRequestURL(SERVICE, true);

            transportManager.use(config.TRANSPORT_NAMES.AJAX).read(
                {
                    url: requestURL,
                    data: payload,
                    type: config.REQ_TYPE_POST
                },
                successHandler,
                errorHandler
            );
        };

        /**
         * MX ebook only - requires jQuery
         * Sends request to to get number of all interactive notes and teacher comments for a group of lesson_ids (l5 field) for a student from a teacher account
         * @param contentId, a string representing content_id
         * @param lessonIds, a list of strings representing lessons (l5 field) ['1', '2', '3']
         * @param successHandler, successHandler(results) where results is a list of objects where each object is of format:
         *          {Id: object_id, Total: n, UnRead: n } where user_id is a string representing user id and n is an integer
         * @param errorHandler, errorHandler(err.message)
         */
        api.getCountsAsStudentForLessons = function (contentId, lessonIds, successHandler, errorHandler) {
            if (!helpers.isServiceReady()) {
                return;
            }

            var payload = {};
            payload.ContentId = contentId;
            payload.AnnotationType = 4;
            payload.Ids = lessonIds;
            payload.QueryType = 'pagelist';

            var SERVICE = "action/Count/AllNotesCountByLesson";
            var requestURL = helpers.getRequestURL(SERVICE, true);

            transportManager.use(config.TRANSPORT_NAMES.AJAX).read(
                {
                    url: requestURL,
                    data: payload,
                    type: config.REQ_TYPE_POST
                },
                successHandler,
                errorHandler
            );
        };

        /**
         * MX ebook only - requires jQuery
         * Sends request to to get number of all interactive notes and teacher comments for a group of lesson_ids (l5 field) for a student from a teacher account
         * @param contentId, a string representing content_id
         * @param unitId, a string representing a unit (l2 field)
         * @param lessonIds, a list of strings representing lessons (l5 field) ['1', '2', '3']
         * @param successHandler, successHandler(results) where results is a list of objects where each object is of format:
         *          {Id: object_id, Total: n, UnRead: n } where user_id is a string representing user id and n is an integer
         * @param errorHandler, errorHandler(err.message)
         */
        api.getCountsAsStudentForLessonsForUnit = function (contentId, unitId, lessonIds, successHandler, errorHandler) {
            if (!helpers.isServiceReady()) {
                return;
            }

            var payload = {};
            payload.ContentId = contentId;
            payload.UnitId = unitId;
            payload.AnnotationType = 4;
            payload.Ids = lessonIds;
            payload.QueryType = 'pagelist';

            var SERVICE = "action/Count/AllNotesCountByLesson";
            var requestURL = helpers.getRequestURL(SERVICE, true);

            transportManager.use(config.TRANSPORT_NAMES.AJAX).read(
                {
                    url: requestURL,
                    data: payload,
                    type: config.REQ_TYPE_POST
                },
                successHandler,
                errorHandler
            );
        };

        /**
         * MX ebook only - requires jQuery
         * Sends request to to get number of all interactive notes and teacher comments for a group of units for a student from a teacher account
         * @param ids, an array representing unit ids
         * @param contentId, a string representing content_id
         * @param annotationType, a number representing annotation type
         * @param successHandler, successHandler(results) where results is a list of objects where each object is of format:
         *          {Id: object_id, Total: n, UnRead: n }
         * @param errorHandler, errorHandler(err.message)
         */
        api.getCountsAsStudentForUnit = function (ids, contentId, successHandler, errorHandler) {
            var fname = 'getCountsAsStudentForUnit';

            if (!helpers.isServiceReady()) {
                return;
            }

            if (arguments.length <= 3) {
                //method getCountsAsStudentForUnit expects 4 parameters
                errorManager.throwError('API_ERR_AJAX_1', [fname, 4, '']);
            }

            helpers.areArgsValidType(
                [{
                    o: [contentId],
                    t: ["string"]
                }, {
                    o: [ids],
                    t: ["array"]
                }, {
                    o: [successHandler, errorHandler],
                    t: ["function"]
                }
                ],
                fname);

            var payload = {};
            payload.ids = ids;
            payload.contentId = contentId;
            payload.annotationType = 4;

            var SERVICE = "action/count/AllNotesCountByUnit";
            var requestURL = helpers.getRequestURL(SERVICE, true);

            transportManager.use(config.TRANSPORT_NAMES.AJAX).read(
                {
                    url: requestURL,
                    data: payload,
                    type: config.REQ_TYPE_POST
                },
                successHandler,
                errorHandler
            );
        };

        return api;
    });
define(
    'userAPI', ['helpers'],

    function (helpers) {
        var api = {};

        /**
         * MX ebook only
         * Sends request to create a new interactive note with an image.
         * @param fieldsValues Object with properties in fieldName: newValue format, example {title: 'Hello World', annotationType_id: 1}
         * @param base64image String representing base64 encoded image
         * @param successHandler Optional, successHandler(data)
         * @param errorHandler Optional, errorHandler(err.message)
         */
        api.createInteractiveNoteWithImage = function (fieldsValues, base64image, successHandler, errorHandler) {
            annService.Annotations
                .createImage(fieldsValues, base64image)
                .done(function (data, responseAdditionalData) {
                    if (successHandler) {
                        successHandler(data.annotation, responseAdditionalData);
                    } else {
                        helpers.consoleLog("success");
                        helpers.consoleLog(helpers.debugParseResults(data));
                    }
                })
                .fail(function (error, responseAdditionalData) {
                    if (errorHandler) {
                        errorHandler(error, responseAdditionalData);
                    } else {
                        helpers.consoleLog("error: " + error + ". responseAdditionalData: " + responseAdditionalData);
                    }
                })
                .run();
        };

        /**
         * MX ebook only
         * Sends request to update an existing interactive note with an image.
         * @param annotationId, integer
         * @param fieldsValues Object with properties in fieldName: newValue format, example {title: 'Hello World', annotationType_id: 1}
         * @param base64image String representing base64 encoded image
         * @param successHandler Optional, successHandler(data)
         * @param errorHandler Optional, errorHandler(err.message)
         */
        api.updateInteractiveNoteWithImage = function (annotationId, fieldsValues, base64image, successHandler, errorHandler) {
            annService.Annotations
                .updateImage(annotationId, fieldsValues, base64image)
                .done(function (data, responseAdditionalData) {
                    if (successHandler) {
                        successHandler(data.annotation, responseAdditionalData);
                    } else {
                        helpers.consoleLog("success");
                        helpers.consoleLog(helpers.debugParseResults(data));
                    }
                })
                .fail(function (error, responseAdditionalData) {
                    if (errorHandler) {
                        errorHandler(error, responseAdditionalData);
                    } else {
                        helpers.consoleLog("testStatus: " + testStatus + ". error: " + error);
                    }
                })
                .run();
        };

        /**
         * Sends request to get an image linked to a specified interactive note
         * @param annotationId Int
         * @param successHandler Optional, successHandler(data) where data is a string with image url valid for 1.
         * @param errorHandler Optional, errorHandler(err.message)
         */
        api.getInteractiveNoteImageUrl = function (annotationId, successHandler, errorHandler) {
            annService.Annotations
                .findImage(annotationId)
                .done(function (data, responseAdditionalData) {
                    if (successHandler) {
                        successHandler(data.signed_url, responseAdditionalData);
                    } else {
                        helpers.consoleLog("success");
                        helpers.consoleLog(data.signed_url);
                    }
                })
                .fail(function (error, responseAdditionalData) {
                    if (errorHandler) {
                        errorHandler(error, responseAdditionalData);
                    } else {
                        helpers.consoleLog("error: " + error + ". responseAdditionalData: " + responseAdditionalData);
                    }
                })
                .run();
        };

        /**
         * Requires jQuery (used by MX)
         * Sends request to delete an interactive note with image that is linked to it
         * @param annotationId Int
         * @param successHandler Optional, successHandler(data) where data is a annoatation_id of deleted object.
         * @param errorHandler Optional, errorHandler(err.message)
         */
        api.deleteInteractiveNoteWithImage = function (annotationId, successHandler, errorHandler) {
            annService.Annotations
                .removeImage(annotationId)
                .done(function (data, responseAdditionalData) {
                    if (successHandler) {
                        successHandler(data.annotation_id, responseAdditionalData);
                    } else {
                        helpers.consoleLog("success");
                        helpers.consoleLog(data);
                    }
                })
                .fail(function (error, responseAdditionalData) {
                    if (errorHandler) {
                        errorHandler(error, responseAdditionalData);
                    } else {
                        helpers.consoleLog("error: " + error + ". responseAdditionalData: " + responseAdditionalData);
                    }
                })
                .run();
        };

        return api;
    });

define(
    'containersAPI', ['underscorenc', 'helpers', 'config', 'client', 'annotations', 'containers',
                'transportManager', 'argumentsProcessor', 'errorManager', 'queryApiValidators'],

function (_, helpers, config, client, Annotations, Containers, transportManager, argumentsProcessor, errorManager, queryApiValidators) {

    var api = {};

    var forContainer = function (containerId) {
        queryApiValidators.doInitCheck();
        var fc = {},
            recursive = false,
            that = this;

        if (!_.isNumber(containerId) && !_.isNull(containerId) && !_.isUndefined(containerId)) {
            //Containers: method forContainer must be called empty or with container_id (type Number)
            errorManager.throwError('API_ERR_QUERY_API_1',
                [that.entityName, 'forContainer', 'container_id', 'number']);
        }

        function checkContainerIdPresence() {
            queryApiValidators.doInitCheck();
            if (_.isNull(containerId) || _.isUndefined(containerId)) {
                //Containers: param id is required when method forContainer is used with addAnnotations
                errorManager.throwError('API_ERR_QUERY_API_2',
                    [that.entityName, that.keyField, 'forContainer', 'addAnnotations']);
            }
        }

        fc.withChildContainers = function (val) {
            queryApiValidators.doInitCheck();
            recursive = _.isUndefined(val) || _.isNull(val) ? true : !!val;
            return this;
        };

        fc.addAnnotations = function (annotations) {
            queryApiValidators.doInitCheck();
            checkContainerIdPresence('addAnnotations');

            annotations = _.isNumber(annotations) ? [annotations] : annotations;

            return Annotations
            .update(annotations)
            .commonFields({container_id: containerId});
        };

        fc.deleteAnnotations = function (annotationIds) {
            queryApiValidators.doInitCheck();
            if (!_.isArray(annotationIds) && !_.isNumber(annotationIds)) {
                //Containers: param annotation_ids for method deleteAnnotations must be number or array but it is someType instead
                errorManager.throwError('API_ERR_QUERY_API_3',
                    [that.entityName, 'annotation_ids', 'deleteAnnotations', 'number or array', helpers.toType(annotationIds)]);
            }
            if ((_.isNull(annotationIds) || _.isUndefined(annotationIds)) ||
                (_.isArray(annotationIds) && annotationIds.length === 0)) {
                //Containers: method deleteAnnotations expects annotation_id(s)
                errorManager.throwError('API_ERR_QUERY_API_4',
                    [that.entityName, 'deleteAnnotations', 'annotation_id(s)']);
            }


            if (!_.isArray(annotationIds)) {
                annotationIds = [annotationIds];
            }

            return Annotations.update(annotationIds).commonFields({ 'container_id': null });
        };

        fc.findAnnotations = function (filter) {
            queryApiValidators.doInitCheck();
            checkContainerIdPresence('findAnnotations');

            if (!filter) {
                filter = { };
            }

            if (_.isNumber(containerId)) {
                if (recursive) {
                    //subFilter['$sub'].container.parent_id = containerId;
                    filter.$sub = {container: {$or: [{id: containerId}, {parent_id: containerId}]}};
                } else {
                    filter.$sub = {container: {id: containerId}};
                }
            }

            //_.extend(filter, { container_id: containerId });

            return Annotations.find(filter);
        };

        fc.findAnnotationsByText = function (text, filters) {
            queryApiValidators.doInitCheck();
            if (!_.isString(text) && !_.isArray(text)) {
                //Containers: param text for method findAnnotationsByText must be string or array but it is someType instead
                errorManager.throwError('API_ERR_QUERY_API_3',
                   [that.entityName, 'text', 'findAnnotationsByText', 'string or array', helpers.toType(text)]);
            }

            var textContainerFilter = {},
                finalFilter = {};

            // if containerId is not provided, then search will be done in the global context.
            if (_.isNumber(containerId)) {
                if (recursive) {
                    //subFilter['$sub'].container.parent_id = containerId;
                    textContainerFilter.$sub = {container: {$or: [{id: containerId}, {parent_id: containerId}]}};
                } else {
                    textContainerFilter.$sub = {container: {id: containerId}};
                }
            }

            var textFilter;
            if (_.isArray(text)) {
                textFilter = [];
                _.each(text, function(item) {
                    if (!_.isString(item)) {
                        // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                        errorManager.throwError('API_ERR_QUERY_API_3',
                    [that.entityName, 'text', 'findAnnotationsByText', 'string or array', helpers.toType(item)]);
                    }
                    textFilter.push({$like: item});
                });
            } else {
                textFilter = {$like: text};
            }

            textContainerFilter.$or = [{title: textFilter}, {body_text: textFilter}];

            if (_.isObject(filters)) {
                _.extend(finalFilter, filters);
            }

            _.extend(finalFilter, {$and: textContainerFilter});

            return Annotations.find(finalFilter);
        };

        fc.findAllAnnotationsByText = function (text, filters) {
            //utilizes AllAnnotations endpoint
            queryApiValidators.doInitCheck();


            var textContainerFilter = {};

            // if containerId is not provided, then search will be done in the global context.
            if (_.isNumber(containerId)) {
                if (recursive) {
                    textContainerFilter.$sub = { container: { $or: [{ id: containerId }, { parent_id: containerId }] } };
                } else {
                    textContainerFilter.$sub = { container: { id: containerId } };
                }
            }


            if (_.isObject(filters)) {
                _.extend(textContainerFilter, filters);
            }

            return Annotations.findAllAnnotationsByText(text, textContainerFilter);
        };

        fc.findAnnotationsByTags = function (tags, filters) {
            queryApiValidators.doInitCheck();
            var subFilter,
                finalFilter = {};

            if (!_.isArray(tags)) {
                tags = [tags];
            }

            if (_.isObject(filters)) {
                _.extend(finalFilter, filters);
            }

            // if containerId is not provided, then search will be done in the global context.
            if (_.isNumber(containerId)) {
                if (recursive) {
                    //subFilter['$sub'].container.parent_id = containerId;
                    subFilter = {$sub: {container: {$or: [{id: containerId}, {parent_id: containerId}]}}};
                } else {
                    subFilter = {$sub: {container: {id: containerId}}};
                }
            }

            if (_.isArray(tags)) {
                _.extend(finalFilter, {$any: {tags: {value: tags}}});
            }

            _.extend(finalFilter, subFilter);

            return Annotations.find(finalFilter);
        };

        return fc;
    };

    var removeAnnotations = function (annotations) {
        queryApiValidators.doInitCheck();
        if (!_.isArray(annotations)) {
            annotations = [annotations];
        }

        return Annotations.update(annotations).commonFields({container_id: null});
    };

    _.extend(Containers, {
        forContainer: forContainer,
        removeAnnotations: removeAnnotations
    });

    api.Containers = Containers;

    return api;
});
define(
    'experimentalAPI', ['helpers', 'oDataService', 'underscorenc', 'config', 'client', 'transportManager', 'annotations'],

    function (helpers, oData, _, config, client, transportManager, Annotations) {
        var api = {};

        /**
         * Sends request to create multiple annotations.
         * @param fieldsValuesList, array of objects with properties in fieldName: newValue format, example {title: 'Hello World', annotationType_id: 1}
         * @param successHandler Optional, successHandler([annotation_id]) - passes a list of annotation_ids
         * @param errorHandler Optional, errorHandler(err.message)
         */
        api.createAnnotationsBatch = function (fieldsValuesList, successHandler, errorHandler) {
            if (!helpers.isServiceReady()) {
                return;
            }

            Annotations
                .create(fieldsValuesList)
                .done(function (data) {
                    var annIds = _.pluck(data, 'annotation_id');

                    if (successHandler) {
                        successHandler(annIds);
                    } else {
                        helpers.consoleLog(annIds);
                    }
                })
                .fail(errorHandler)
                .run();
        };

        /**
         * Sends request to create a new annotation along with a list of tags and flags.
         * @param annotationFieldsValues Object with properties in fieldName: newValue format, example {title: 'Hello World', annotationType_id: 1}
         * @param tagsList, a list of strings representing tags ["nasa", "rocket"] or null if no tags should be created
         * @param flagsFieldsValuesList, a list of Object with name value pairs, example [{name: 'turnedin', value:'1'}, {name: 'read', value:'0'}] or null if no flags should be created
         * @param successHandler Optional, successHandler(data)
         * @param errorHandler Optional, errorHandler(err.message)
         */
        api.createAnnotationTagsAndFlags = function (/*annotationFieldsValues, tagsList, flagsFieldsValuesList, successHandler, errorHandler*/) {
            throw "Not implemented.";
            //   if (!helpers.isServiceReady()) return;
            //   if (helpers.debugContainsAnnotationsId("annotation_id", annotationFieldsValues, "createAnnotationTagsAndFlags", "annotation_id should be only used for querying!")) return;

            //   if (client.isSet()) annotationFieldsValues.created_by_tool_id = client.getID();

            //   var i, key, changeReq = [];

            //     //check if number of items for batch request is larger than allowed value
            //     // + 1 represents annotationFieldValues that are also sent
            //   if ((tagsList.length || 0) + (flagsFieldsValuesList.length || 0) + 1 > config.SETTINGS.AppSettings.MaxChangesetCount) {
            //       //Number of passed items for batch request is greater than maximum allowed (allowed {0})
            //       errorManager.throwError('API_ERR_TRANSPORT_1', [config.SETTINGS.AppSettings.MaxChangesetCount]);
            //   }

            //   changeReq.push({
            //     requestUri: "annotations",
            //     method: config.REQ_TYPE_POST,
            //     headers: {
            //       "Content-ID": "1"
            //     },
            //     data: annotationFieldsValues
            //   });

            //    if (tagsList) {
            //         for (i = 0; i < tagsList.length; i++)
            //         {
            //             changeReq.push
            //             ({
            //                 requestUri: "tags",
            //                 method: config.REQ_TYPE_POST,
            //                 data: { value: tagsList[i], annotation: { __metadata: { uri: "$1" } } }
            //             });
            //         }
            //     }

            //   if (flagsFieldsValuesList) {
            //     for (i = 0; i < flagsFieldsValuesList.length; i++) {
            //       var flagsFieldsValues = flagsFieldsValuesList[i];
            //       if (!_.isEmpty(flagsFieldsValues)) {
            //         flagsFieldsValues["annotation"] = {
            //           __metadata: {
            //             uri: "$1"
            //           }
            //         }
            //         changeReq.push({
            //           requestUri: "annotation_attributes",
            //           method: config.REQ_TYPE_POST,
            //           data: flagsFieldsValues //annotation_id, name, value
            //         });
            //       }
            //     }
            //   }

            //   transportManager.use(config.TRANSPORT_NAMES.ODATA)
            //     .batch(changeReq, successHandler, errorHandler);
        };

        api.getAnnotationsAndTags = function (/*filters, fields, orderby, limitFrom, limitCount, successHandler, errorHandler*/) {
            throw "Not implemented.";
            // if (!helpers.isServiceReady()) return;

            // var baseURL = helpers.templatify("tags/<%= tail %>");

            // transportManager.use(config.TRANSPORT_NAMES.ODATA)
            //   .findExpanded({
            //     baseURL: baseURL,

            //     expandedFor: "annotation",
            /** TODO fix since, these fields belongs to tags, not annotation */
            //   expandedForFields: ['value','annotation_id'],

            //   'filters': filters,
            //   'fields': fields,
            //   'limitFrom': limitFrom,
            //   'limitCount': limitCount,

            //   successHandler: successHandler,
            //   errorHandler: errorHandler,

            //   orderBy: orderby
            // });
        };

        return api;
    });
define(
    'annotationSharedWithAPI', ['underscorenc', 'helpers', 'config', 'client', 'annotationSharedWith'],

function (_, helpers, config, client, AnnotationSharedWith) {

    var api = {};

    api.AnnotationSharedWith = AnnotationSharedWith;

    return api;
}); 
define(
    'custom', ['underscorenc', 'config', 'helpers', 'transportManager', 'client', 'queryAPI', 'info', 'errorManager', 'requestManager'],

function (_, config, helpers, transportManager, client, queryAPI, info, errorManager, reqMan) {
    var URLS = {
        'getUsersForAnnotationId': {
            'service': helpers.templatify("SharedWithAnnotators<%= tail %>")
        }
    };

    var custom = {
        entityName: 'custom',

        _defaultTransport: transportManager.use(config.TRANSPORT_NAMES.ODATA),

        _transports: {},

        _request: {},

        _additionalActions: {},
        
        _urls: URLS,

        init: function() {
            _.defaults(this, queryAPI);

            _.extend(this, info);

            return this;
        },

        _getRequest: function() {
            return this._request;
        },

        getUsersForAnnotationId: function (annotation_id) {
            if (_.isUndefined(annotation_id) || (_.isObject(annotation_id) && _.isUndefined(annotation_id.annotation_id))) {
                // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                errorManager.throwError('API_ERR_QUERY_API_3',
                    [this.entityName, 'annotation_id', 'getUsersForAnnotationId', 'object', 'undefined']);
            }
            if ((_.isObject(annotation_id) && !_.isNumber(annotation_id.annotation_id)) || !_.isNumber(annotation_id)) {
                // {0}: param {1} for method {2} must be {3}, but it is {4} instead
                errorManager.throwError('API_ERR_QUERY_API_3',
                    [this.entityName, 'annotation_id', 'getUsersForAnnotationId', 'object', helpers.toType(annotation_id)]);
            }

            var param = {};
            param[config.QUERY_PARAMS.annotationId] = annotation_id;

            var idx = this._customOperation(
                {},
                config.CUSTOM_ENDPOINTS.GET_USERS_FOR_ANNOTATION_ID,
                config.CRUD.find,
                this.entityName
            );

            reqMan.setProp(idx, reqMan.PROPS.QUERY_PARAMS, param);
            reqMan.setProp(idx, reqMan.PROPS.IS_WEBAPI, true);
            return this;
        }
    };

    return custom.init();
});
define(
    'customAPI', ['underscorenc', 'helpers', 'config', 'custom'],

function (_, helpers, config, custom) {

    var api = {};

    api.custom = custom;

    return api;
}); 
/**  @module bootstrap */
define(
    'annService',
    ['underscorenc', 'config', 'basicAPI', 'annotationAPI', 'tagsAPI',
        'customODataAPI', 'aggregationAPI', 'userAPI', 'containersAPI', 'experimentalAPI',
        'annotationSharedWithAPI', 'customAPI', 'requestManager', 'resetManager',
        'annotations', 'containers', 'tags', 'annotationSharedWith', 'oDataService', 'queryAPI'],
    function (_, config, basicAPI, annotationAPI, tagsAPI, customODataAPI,
              aggregationAPI, userAPI, containersAPI, experimentalAPI,
              annotationSharedWithAPI, customAPI, reqMan, resMan,
              annotations, containers, tags, annotationSharedWith, oDataService, qapi) {

        /**
         * This is entry point object, it injects API's into single object and return it to global scope
         * @name main
         * @requires basicAPI, annotationAPI, tagsAPI, customODataAPI, aggregationAPI, userAPI, experimentalAPI
         * @return API Object, which assign to annService in global scope
         */
        var main = {
            publicInterface: {},

            /**
             * @constructor
             */
            prepare: function () {

                ///** set global timeout for jquery ajax calls */
                ///** TODO: move in ajax transport when all ajax calls will work through it */
                //$ && $.ajaxSetup({ 'timeout': config.REQUEST_TIMEOUT });

                /** api injects in order of original file flow */
                _.extend(this.publicInterface, basicAPI);
                _.extend(this.publicInterface, annotationAPI);
                _.extend(this.publicInterface, tagsAPI);
                _.extend(this.publicInterface, customODataAPI);
                _.extend(this.publicInterface, aggregationAPI);
                _.extend(this.publicInterface, userAPI);
                _.extend(this.publicInterface, containersAPI);
                _.extend(this.publicInterface, experimentalAPI);
                _.extend(this.publicInterface, annotationSharedWithAPI);
                _.extend(this.publicInterface, customAPI);

                // this is just for hacking... Should be available only in the dev build.
                _.extend(this.publicInterface, {reqMan: reqMan});
                _.extend(this.publicInterface, {odata: oDataService});

                // Subscribing modules that need to be reset on successfull run or in case
                // the user error is thrown
                resMan.subscribe(annotations._reset);
                resMan.subscribe(tags._reset);
                resMan.subscribe(containers._reset);
                resMan.subscribe(annotationSharedWith._reset);
                resMan.subscribe(qapi._reset);
                resMan.subscribe(reqMan._reset);

                return this.publicInterface;
            }
        };

        /** @exports 'main' Object */
        return main.prepare();
    });    //The modules for your project will be inlined above
    //this snippet. Ask almond to synchronously require the
    //module value for 'main' here and return it as the
    //value to use for the public API for the built file.
    return require('annService');
}));