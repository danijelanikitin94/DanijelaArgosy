(function ($) {
    // shorten references to variables. this is better for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget;

    var Textbox = Widget.extend({
        init: function (element, options) {
            var that = this;
            // base call to initialize widget
            Widget.fn.init.call(this, element, options);
            // initialize or create dataSource
            that._initialize();
        },
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "Textbox",
            value: ""
        },
        _initialize: function () {
            $(this.element).addClass("k-textbox");
        },
        value: function (value) {
            var that = this;
            if (value !== undefined) {
                $(this.element).val(value);
            } else {
                return $(this.element).val();
            }
        }
    });
    ui.plugin(Textbox);
})(jQuery);