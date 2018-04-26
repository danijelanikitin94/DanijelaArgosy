(function ($) {
    // shorten references to variables. this is better for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget;

    var LoadedImage = Widget.extend({
        init: function (element, options) {
            // base call to initialize widget
            Widget.fn.init.call(this, element, options);
            this._initialize();
        },
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "LoadedImage",
            getUrl: null,
            width: 250,
            height: 250
        },
        _initialize: function () {
            var that = this;
            that.element.src = "/LoadingImage";
            $.ajax({
                url: that.options.getUrl,
                dataType: "json",
                method: "GET",
                success: function (result) {
                    that.element.src = result + "?w=" + that.options.width + "&h=" + that.options.height;
                }
            });
        },
    });
    ui.plugin(LoadedImage);
})(jQuery);