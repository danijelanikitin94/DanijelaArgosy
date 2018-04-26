function MailingListOptions(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();
    controlLoader.loadTemplate("MailingListOptions", function (template) {
        $(document.body).append(template);
        that.initialize();
    });
}

MailingListOptions.prototype.options = {};

MailingListOptions.prototype.baseOptions = {
    dataSource: null,
    mailingListRequired: false,
    uploadList: false,
    corporateList: false,
    purchaseList: false,
    uploadOnly: false,
    templates: {
        contentTemplate: "#_MailingListOptionsTemplate"
    }
};

MailingListOptions.prototype.initialize = function () {
    var that = this;
    var sku = that.options.sku == null ? getQuerystring("sku") : that.options.sku;
    var customizationStateId = that.options.customizationStateId == null ? getQuerystring("customizationStateId") : that.options.customizationStateId;
    var options = {
        Sku: sku,
        CustomizationStateId: customizationStateId,
        mailingListRequired: that.options.mailingListRequired,
        uploadList: that.options.uploadList,
        corporateList: false,//that.options.corporateList,
        purchaseList: that.options.purchaseList,
        directMail: false,
        Name: that.options.displayName,
        uploadOnly: that.options.uploadOnly
    };
    var counter = function(item) {
        return item ? 1 : 0;
    }
    var count = 0;
    count += counter(options.uploadList);
    count += counter(options.uploadList && !options.uploadOnly);
    count += counter(options.directMail);
    count += counter(options.corporateList);
    count += counter(options.purchaseList);
    switch (count) {
        case 1:
            options.colClass = "col-sm-12";
            break;
        case 2:
            options.colClass = "col-sm-6";
            break;
        case 3:
            options.colClass = "col-sm-4";
            break;
        case 4:
            options.colClass = "col-sm-3";
            break;
        case 5:
            options.colClass = "col-sm-2";
            break;
    }
    var content = kendo.Template.compile($(that.options.templates.contentTemplate).html())(options);
    that.getElement().append(content);
    $(".disabled").each(function (i) {
        disable(this);
    });
    $(".skip-to-cart").click(function (i) {
        $.submitAsForm("/Tools/Mailing/SkipToCart?customizationStateId=" + getQuerystring("customizationStateId"));
    });
};

MailingListOptions.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};