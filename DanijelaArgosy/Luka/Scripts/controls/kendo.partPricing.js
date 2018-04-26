(function ($) {
    // shorten references to variables. this is better for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget,
        CHANGE = "change";

    var PartPricing = Widget.extend({
        init: function (element, options) {
            var that = this;
            // base call to initialize widget
            Widget.fn.init.call(that, element, options);
            that._initialize();
        },
        events: [
            CHANGE
        ],
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "PartPricing",
            partId: null,
            bucketId:null, 
            showPriceSummary: false,
            appendZeroDiscount: false,
            value: null,
            cartId: null,
            rank: 0,
            ignoreFirstChange: true,
            unitPrice:0
        },
        _templates: {
            preFetchTemplate: '<i class="fa fa-spinner fa-pulse fa-1x fa-fw margin-bottom"><span class="sr-only"> Loading...</span></i>',
            partTemplate: '<div>' +
                '#if(!data.IsExpired && (!data.IsExpired && data.FlagOffered) && data.IsAvailable){# ' +
                '<div data-template="_GlobalPricingTemplate" data-bind="source: this"></div>' +
                '#if (showPriceSummary) {#<p class="product-price nowrap">#= renderProductPriceViewTemplate(data, null, true) #</p>#}#' +
                '</div>'+
                ' #} else {#  #if(data.IsExpired) {#  Exp. ${kendo.toString(kendo.parseDate(data.ExpirationDate),"MM/dd/yyyy")}  #} else if(!data.IsAvailable) {# Out of Stock #} else {#   Not offered #}#   #}#'
        },
        value: function (data) {
            var that = this;
            var element = that.element.find("[data-cart-input=true]");
            var input = $.getKendoControl(element);
            if (data == null) {
                if (input != null) {
                    return input.value();
                }
            } else {
                input.value(data);
            }
            return 0;
        },
        _initialize: function () {
            var that = this;
            that.element.append(that._templates.preFetchTemplate);
            if (that.options.partId > 0) {
                getPart(that.options.partId, function (part) {
                    that.updatePart(part);
                });
            } else {
                that.element.empty();
            }
        },
        change: function (data) {
            $(document).trigger(argosyEvents.EVENT_PART_INPUT_QTY_CHANGED, data);
        },
        updatePart: function (part) {
            var that = this;
            var pricing = convertPartToPricing(part, {
                value: (that.options.value == null ? part.DefaultQuantity : (parseInt(that.options.value) === 0 ? null : that.options.value)),
                change: function (e) {
                    var value = 0;
                    switch (e.sender.ns) {
                        case ".kendoDropDownList":
                            value = e.sender.dataItem(e.item).Quantity;
                            break;
                        default:
                            value = e.sender.value();
                            break;
                    }
                    that.change({
                        
                        partId: e.data.part.partId,
                        value: value,
                        cartId: that.options.cartId,
                        bucketId:that.options.bucketId,
                        unitPrice:that.options.unitPrice,
                    });
                },
                spin: function (event) {
                    if (!pricing.options.spinEventTriggered) {
                        pricing.options.spinEventTriggered = true;
                        setTimeout(function (e) {
                            that.change({
                                partId: parseInt($(event.sender.element).attr("data-part-id")),
                                cartId: that.options.cartId,
                                value: event.sender.value()
                            });
                            pricing.options.spinEventTriggered = false;
                        }, 250 );
                    }
                },
                dataBound: function (e) {
                    var $dropDown = $(e.sender.element),
                        containerWidth = 70,
                        model = this;
                    $dropDown.data("kendoDropDownList").list.width("auto");
                    $dropDown.closest(".k-widget").width(containerWidth);
                    if (!that.options.appendZeroDiscount && model.value != null && model.value.toString() !== $dropDown.getKendoDropDownList().value().toString()) {
                        $dropDown.getKendoDropDownList().value(model.value);
                        if (!that.options.ignoreFirstChange) {
                            // weird hack to force fire the change event on first load
                            model.change(e);
                            that.options.ignoreFirstChange = false;
                        }
                    }
                },
                appendZeroDiscount: that.options.appendZeroDiscount,
                cartId: that.options.cartId,
                rank: that.options.rank
            });
            if (part.Options.AllowNegativeDemand != null && (part.Options.AllowNegativeDemand == false && part.QtyAvailable <= 0)){
                part.IsAvailable = false;
            }
            part.showPriceSummary = that.options.showPriceSummary;
            that.options.part = part;
            that.element.empty();
            var template = kendo.Template.compile(that._templates.partTemplate)(that.options.part);
            that.element.append(template);
            kendo.bind(that.element, pricing);

            that.element.find("[data-role=numerictextbox]").focus(function (e) {
                var input = $(this);
                setTimeout(function () { input.select(); });
            });
        },
        items: function () {
            return this.element.children();
        }
    });
    ui.plugin(PartPricing);
})(jQuery);