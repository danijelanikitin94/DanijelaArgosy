function MailingListEdit(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();
    controlLoader.loadTemplate("MailingListEdit", function (template) {
        $(document.body).append(template);
        that.initialize();
    });
}

MailingListEdit.prototype.options = {};

MailingListEdit.prototype.baseOptions = {
    dataSource: null,
    templates: {
        contentTemplate: "#_MailingListEditTemplate"
    }
};

MailingListEdit.prototype.initialize = function () {
    var that = this;
    var sku = that.options.sku == null ? getQuerystring("sku") : that.options.sku;
    var customizationStateId = that.options.customizationStateId == null ? getQuerystring("customizationStateId") : that.options.customizationStateId;

    var content = kendo.Template.compile($(that.options.templates.contentTemplate).html())({
        Sku: sku,
        CustomizationStateId: customizationStateId,
        Name: that.options.displayName
    });
    that.getElement().append(content);
};

MailingListEdit.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};