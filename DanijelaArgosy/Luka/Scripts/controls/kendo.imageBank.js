(function ($) {
    // shorten references to variables. this is better for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget;

    var ImageBank = Widget.extend({
        init: function (element, options) {
            var that = this;
            // base call to initialize widget
            Widget.fn.init.call(this, element, options);
            that.template = kendo.template(that.options.template || that.templates.wrapper);
            // initialize or create dataSource
            that._initialize();
        },
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "ImageBank",
            value: []
        },
        templates: {
            wrapper: "<div class='row'><h2>~{SelectImage}~</h2><div class='col-md-12'>#for (var i = 0; i < data; i++) {#<div class='col-md-2'><img src='${data[i]}' /></div>#}#</div></div>"
        },
        _initialize: function () {
            var that = this;
            
        },
        value: function (value) {
            var that = this;
            if (value !== undefined) {
                that.options.value = value;
            } else {
                return that.options.value;
            }
        }
    });
    ui.plugin(ImageBank);
})(jQuery);