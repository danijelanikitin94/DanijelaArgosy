function ToggleSwitch(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.element = $("*[data-argosy-uuid=" + that.options.uuid + "]");
    that.hiddenElement = that.element.parent().find("input[type=hidden]");
    that.setupToggleSwitchView();
    that.element.data["toggleSwitch"] = that;
}

ToggleSwitch.prototype.options = {};

ToggleSwitch.prototype.baseOptions = {
    checked: false,
    propertyName: "",
    displayName: "",
    onChange: function(toggle) {
        $(document).trigger(argosyEvents.TOGGLE_SWITCH_CHANGE, toggle);
    }
};

ToggleSwitch.prototype.isChecked = function () {
    var that = this;
    return that.element.hasClass("toggle-switch-checked");
}

ToggleSwitch.prototype.setupToggleSwitchView = function() {
    var that = this;
    that.element.addClass("toggle-switch");
    that.element.addClass("toggle-switch-wrapper");
    if (that.options.checked) {
        that.element.addClass("toggle-switch-checked");
    }
    that.element.append('<label class="toggle-switch toggle-switch-on" for="' + that.options.propertyName + '">' + that.options.displayName + '</label>');
    that.element.append('<label class="toggle-switch toggle-switch-off" for="' + that.options.propertyName + '">' + that.options.displayName + '</label>');
    that.element.append('<label class="toggle-switch toggle-switch-slider" for="' + that.options.propertyName + '"></label>');

    that.element.find(".toggle-switch-on").click(function (e) {
        that.off();
    });
    that.element.find(".toggle-switch-off").click(function (e) {
        that.on();
    });
    that.element.find(".toggle-switch-slider").click(function (e) {
        if (that.element.hasClass("toggle-switch-checked")) {
            that.off();
        } else {
            that.on();
        }
    });
};

ToggleSwitch.prototype.on = function () {
    var that = this;
    that.element.addClass("toggle-switch-checked");
    if (that.hiddenElement) {
        that.hiddenElement.val("true");
    }
    if (that.options.onChange != null) {
        that.options.onChange(that);
    }
}
ToggleSwitch.prototype.off = function () {
    var that = this;
    that.element.removeClass("toggle-switch-checked");
    if (that.hiddenElement) {
        that.hiddenElement.val("false");
    }
    if (that.options.onChange != null) {
        that.options.onChange(that);
    }
}