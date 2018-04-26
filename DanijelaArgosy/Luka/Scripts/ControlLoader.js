function ControlLoader(loadPageControls) {
    var that = this;
    if (loadPageControls == null) {
        loadPageControls = false;
    }
    // initialize attribute defined controls
    if (loadPageControls) {
        that.loadControls($(document));
    }
}

ControlLoader.prototype.BASE_SCRIPT_PATH = "/scripts/controls/";
ControlLoader.prototype.BASE_TEMPLATE_PATH = "/scripts/controls/templates/";
ControlLoader.prototype.EVENT_SCRIPT_CONTROL_LOADED = "SCRIPT_CONTROL_LOADED";
ControlLoader.prototype.EVENT_SCRIPT_TEMPLATE_LOADED = "SCRIPT_TEMPLATE_LOADED";
ControlLoader.prototype.controls = {};
ControlLoader.prototype.loadedControls = {};
ControlLoader.prototype.loadingControls = {};
ControlLoader.prototype.loadedTemplates = {};

ControlLoader.prototype.loadControls = function (element) {
    var that = this,
        element = element.parent().length ? element.parent() : element,
        controls = element.find("*[data-argosy-control]");
    controls.each(function (i) {
        that.processControlElement(this);
    });
}

ControlLoader.prototype.processControlElement = function (element, callback) {
    var that = this;
    if ($(element).attr("data-argosy-uuid") == null) {
        var controlType = $(element).attr("data-argosy-control");
        var options = that.parseControlOptions(element);
        options.uuid = that.addUniqueIdentifier($(element));
        that.loadControl(controlType, options, function (control) {
            alert(controlType);
            if (that.controls[controlType] == null) {
                that.controls[controlType] = [];
            }
            that.controls[controlType].push(control);
            if (callback != null && callback != undefined) {
                callback(control);
            }
        });
    }
};

/// this is very buggy, do not use!!!! acormier
ControlLoader.prototype.findControl = function (uuid) {
    var that = this;
    var control = null;
    for (var property in that.controls) {
        if (that.controls.hasOwnProperty(property)) {
            $(that.controls[property]).each(function (i) {
                if (this.options.uuid == uuid) {
                    control = this;
                }
            });
        }
    }
    return control;
}

ControlLoader.prototype.addUniqueIdentifier = function (element) {
    var that = this;
    var guid = $.getGuid();
    element.attr("data-argosy-uuid", guid);
    return guid;
};

ControlLoader.prototype.isControlLoaded = function (controlName) {
    var that = this;
    return that.loadedControls[controlName] != null && that.loadedControls[controlName];
};


ControlLoader.prototype.isControlLoading = function (controlName) {
    var that = this;
    return that.loadingControls[controlName] != null && that.loadingControls[controlName];
};

ControlLoader.prototype.parseControlOptions = function (element) {
    var that = this;
    var options = {};
    $(element.attributes).each(function (e) {
        if (this.name.indexOf("data-argosy-options-") > -1) {
           
            var property = $.camelCase(this.name.replace("data-argosy-options-", ""));
            var value = this.value;

            if (value.toLowerCase() == "true") {
                value = true;
            } else if (value.toLowerCase() == "false") {
                value = false;
            } else if (value.toLowerCase() == "null") {
                value = null;
            } else if (!isNaN(value)) {
                if (value.indexOf(".") > -1) {
                    value = parseFloat(value);
                } else {
                    value = parseInt(value);
                }
            }

            options[property] = value;
        }
    });
    return options;
};

ControlLoader.prototype.addScriptWithPath = function (scriptName, path) {
    var that = this;
    if (app_Version_Num) {
        scriptName = scriptName + "?v=" + app_Version_Num;
    }
    that.loadingControls[scriptName] = true;
    $.noCacheScript(path + scriptName, function (e) {
        $(that).trigger(that.EVENT_SCRIPT_CONTROL_LOADED + scriptName);
    });
};

ControlLoader.prototype.loadControl = function(controlType, opts, callback) {
    var that = this;
    var onLoadFunction = function (e) {
        jsConsole.log(e.type);
        that.loadedControls[controlType] = true;
        that.loadingControls[controlType] = false;
        if (callback != undefined && callback != null) {
            callback(that.initScript(controlType, opts));
        } else if (controlType.defaultCallback != undefined && controlType.defaultCallback != null) {
            controlType.defaultCallback(that.initScript(controlType, opts));
        }
    };
    if (controlType !== null) {
        onLoadFunction({});
    }
};

ControlLoader.prototype.loadTemplate = function (controlType, callback) {
    var that = this;
    var extension = window.location.host.indexOf("dev-") === -1 ? ".html" : ".html";
    var templatePath = controlType.replace(/\./, "/") + extension;
    var options = {
        method: "GET",
        cache: true,
        url: that.BASE_TEMPLATE_PATH + templatePath + "?r=" + sessionToken,
        success: function (template) {
            alert("da");
            jsConsole.log(that.EVENT_SCRIPT_TEMPLATE_LOADED + controlType.replace(/\./, "/"));
            $(that).trigger(that.EVENT_SCRIPT_TEMPLATE_LOADED + controlType.replace(/\./, "/"));
            callback(template);
        },
        error: function (error) {
            alert("ne");
        }
    };
    jQuery.ajax(options);
};

ControlLoader.prototype.initScript = function (controlType, opts) {
    var scriptConstructor = "new " + controlType + "(" + JSON.stringify(opts) + ");";
    return eval(scriptConstructor);
};
