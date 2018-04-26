function MailingListLeadsPlease(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();/*
    $.getScript(window.location.protocol + "//www.leadsplease.com/lp_widget_1.5.js", function(e) {
    });*/

    controlLoader.loadTemplate("MailingListLeadsPlease", function (template) {
        $(document.body).append(template);
        that.initialize();
    });
}

MailingListLeadsPlease.prototype.options = {};

MailingListLeadsPlease.prototype.baseOptions = {
    dataSource: null,
    templates: {
        contentTemplate: "#_MailingListLeadsPleaseTemplate"
    }
};

MailingListLeadsPlease.prototype.initialize = function () {
    var that = this;
    var sku = that.options.sku === null ? getQuerystring("sku") : that.options.sku;
    var customizationStateId = that.options.customizationStateId === null ? getQuerystring("customizationStateId") : that.options.customizationStateId;
    var content = kendo.Template.compile($(that.options.templates.contentTemplate).html())({
        Sku: sku,
        CustomizationStateId: customizationStateId,
        Name: that.options.displayName
    });
    that.getElement().append(content);
    that.setupLeadsPlease();
};

MailingListLeadsPlease.prototype.setupLeadsPlease = function () {
    var that = this;
    if (window.LeadsPlease !== null) {
        $.ajax({
            url: "/Tools/Mailing/GetDataProviderConfig/?dataProvider=Leads Please",
            dataType: "json",
            method: "POST",
            success: function (result) {
                var config = {
                    widgetid: 'leadsPleaseWidget',
                    affiliatecode: result.affiliatecode,
                    callback: function (e) {
                        $.submitAsForm("/Tools/Mailing/DeliveryOptions?Sku=" + getQuerystring("sku") + "&customizationStateId=" + getQuerystring("customizationStateId"),
                        {
                            PurchaseListId: e.criteriaid,
                            DataProviderConfigId: result.dataProviderConfigId,
                            Type: e.listtype === "consumer" ? "Consumer" : "Business",
                            Provider: "LeadsPlease",
                            Price: e.price,
                            TotalCount: e.qtycount,
                            RequestedCount: e.qtydesired
                        }, "leadsPleaseData");
                    },
                    skin: {
                        buylistbtn: "Continue"
                    },
                    conclusionurl: 'https://portal.mypropago.com/',
                    sessionid: userId
                };

                that.leadsPlease = new LeadsPlease.Widget(config);
            }
        });

    } else {
        setTimeout(that.setupLeadsPlease, 500);
    }
};

MailingListLeadsPlease.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};