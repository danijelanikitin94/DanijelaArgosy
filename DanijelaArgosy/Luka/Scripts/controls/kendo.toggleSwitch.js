(function ($) {
    // shorten references to variables. this is better for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget;

    var ToggleSwitch = Widget.extend({
        init: function(element, options) {
            // base call to initialize widget
            Widget.fn.init.call(this, element, options);
            this._initialize();
        },
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "ToggleSwitch",
            value: false,
            propertyName: null,
            onLabel: "On",
            offLabel: "Off",
            onChange: function(toggle) {
                $(document).trigger(argosyEvents.TOGGLE_SWITCH_CHANGE, toggle);
            }
        },
        isChecked: function() {
            var that = this;
            return that.element.hasClass("toggle-switch-checked");
        },
        value: function (data) {
            var that = this;
            if (data == null) {
                return that.isChecked();
            } else {
                if (data) {
                    that.on();
                } else {
                    that.off();
                }
            }
        },
        _initialize: function() {
            var that = this;
            if (that.options.propertyName == null) {
                that.options.propertyName = kendo.guid();
            }
            that.element.append($("<input />", {
                "type": "hidden",
                "class": "hidden",
                "value": that.options.value,
                "id": that.options.propertyName
            }));
            that.hiddenElement = that.element.find("input.hidden");
            that.element.addClass("toggle-switch");
            that.element.addClass("toggle-switch-wrapper");
            if (that.options.value) {
                that.element.addClass("toggle-switch-checked");
            }
            that.element.append('<label class="toggle-switch toggle-switch-on" for="' + that.options.propertyName +'">' +that.options.onLabel +'</label>');
            that.element.append('<label class="toggle-switch toggle-switch-off" for="' + that.options.propertyName + '">' + that.options.offLabel + '</label>');
            that.element.append('<label class="toggle-switch toggle-switch-slider" for="' + that.options.propertyName + '"></label>');

            that.element.find(".toggle-switch-on").click(function(e) {
                that.off();
            });
            that.element.find(".toggle-switch-off").click(function(e) {
                that.on();
            });
            that.element.find(".toggle-switch-slider").click(function(e) {
                if (that.element.hasClass("toggle-switch-checked")) {
                    that.off();
                } else {
                    that.on();
                }
            });
        },
        on: function() {
            var that = this;
            that.element.addClass("toggle-switch-checked");
            if (that.hiddenElement) {
                that.hiddenElement.val("true");
            }
            if (that.options.onChange != null) {
                that.options.onChange(that);
            }
        },
        off: function() {
            var that = this;
            that.element.removeClass("toggle-switch-checked");
            if (that.hiddenElement) {
                that.hiddenElement.val("false");
            }
            if (that.options.onChange != null) {
                that.options.onChange(that);
            }
        }
    });
    ui.plugin(ToggleSwitch);
})(jQuery);