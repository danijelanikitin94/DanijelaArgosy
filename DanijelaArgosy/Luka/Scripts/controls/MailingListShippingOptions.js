function MailingListShippingOptions(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();
    controlLoader.loadTemplate("MailingListShippingOptions", function (template) {
        $(document.body).append(template);
        that.initialize(that.getDataSource());
    });
}

MailingListShippingOptions.prototype.options = {};

MailingListShippingOptions.prototype.baseOptions = {
    dataProviderConfigId: null,
    dataSource: null,
    errorMessage: null,
    displayName: null,
    addToCartEvent: null,
    hideTitle: false,
    horizontal: false,
    canOverrideCount: false,
    showMultiUseOption: false,
    isMultiUse: false,
    singleUseCost: 0,
    multiUseCost: 0,
    singlePerRecordCost: 0,
    multiPerRecordCost: 0,
    totalsHref: "#_mailingListShippingOptionsTotal",
    templates: {
        contentTemplate: "#_MailingListShippingOptionsTemplate",
        totalsTemplate: "#_MailingListShippingOptionsTotalTemplate"
    }
};

MailingListShippingOptions.prototype.initialize = function (data) {
    var that = this;
    that.data = data;
    that.data.Name = that.options.displayName;
    that.data.hideTitle = that.options.hideTitle;
    that.data.errorMessage = that.options.errorMessage;
    that.data.horizontal = that.options.horizontal;
    that.data.singleUseCost = that.options.singleUseCost;
    that.data.multiUseCost = that.options.multiUseCost;
    that.data.isMultiUse = that.options.isMultiUse;
    that.data.singlePerRecordCost = that.options.singlePerRecordCost;
    that.data.multiPerRecordCost = that.options.multiPerRecordCost;
    that.data.showMultiUseOption = that.options.showMultiUseOption && that.options.multiUseCost != null && that.options.multiUseCost > 0;
    that.data.CanOverrideCount = that.options.canOverrideCount;
    that.data.RequestedCount = that.data.NumberOfRows;
    var content = kendo.Template.compile($(that.options.templates.contentTemplate).html())(that.data);
    that.getElement().append(content);
    var model = new kendo.observable({
        updateShippingOption: function (e) {
            if (that.data.SelectMailingOption != null) {
                var selectedId = parseInt($(e.target).val());
                if (that.data.SelectMailingOption.PartServiceId != selectedId) {
                    $(that.data.MailingOptions)
                        .each(function(i) {
                            if (this.PartServiceId == selectedId) {
                                that.data.SelectMailingOption = this;
                                that.updateTotals();
                            }
                        });
                }
            } else {
                that.data.SelectMailingOption = this;
            }
        },
        regenerate: function(e) {
            $(document).trigger(argosyEvents.EVENT_REGENERATE_VARIABLES);
        },
        updateTotals: function(e) {
            var element = e.sender;
            if (that.data.ThirdPartyList != null) {
                that.data.ThirdPartyList.RequestedCount = element.value();
            }
            that.data.RequestedCount = element.value();
            that.data.PartPrice = that.data.RequestedCount * that.data.Part.Price;
            that.updateTotals();
        },
        updateListUseOption: function (e) {
            that.data.isMultiUse = e.currentTarget.value === "true";
            if (that.data.ThirdPartyList != null) {
                that.data.ThirdPartyList.IsMultiUse = that.data.isMultiUse;
                that.data.ThirdPartyList.PerRecordCost = that.data.isMultiUse ? that.data.multiPerRecordCost: that.data.singlePerRecordCost;
                that.data.ThirdPartyList.PerListCost = that.data.isMultiUse ? that.data.multiUseCost: that.data.singleUseCost;
            }
            that.updateTotals();
        },
        addToCart: function (e) {
            $(document).trigger(argosyEvents.START_LOADING);
            if (that.options.addToCartEvent == null) {
                that.data.Part = null;
                that.data.SuggestedFileName = $("#listSaveName").val();
                that.data.NumberOfRows = that.data.RequestedCount;
                $.submitAsForm("/Tools/Mailing/AddToCart/?Sku=" + getQuerystring("sku") + "&customizationStateId=" + getQuerystring("customizationStateId"), that.data, "data");
            } else {
                $(document).trigger(that.options.addToCartEvent, {
                    sku: getQuerystring("sku"),
                    customizationId: getQuerystring("customizationStateId"),
                    fileName: $("#listSaveName").val(),
                    extraData: that.data
                });
            }
        }
    });
    kendo.bind(that.getElement(), model);
        
    that.updateTotals();
};

MailingListShippingOptions.prototype.updateTotals = function () {
    var that = this;
    var content = kendo.Template.compile($(that.options.templates.totalsTemplate).html())(that.data);
    that.getElement().find(that.options.totalsHref).empty();
    that.getElement().find(that.options.totalsHref).append(content);
};

MailingListShippingOptions.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};

MailingListShippingOptions.prototype.getDataSource = function(dataSourceOpts) {
    var that = this;
    return window[that.options.dataSource];
};