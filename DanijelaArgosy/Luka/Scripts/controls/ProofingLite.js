function ProofingLite(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();
    that.setupEventListeners();
    controlLoader.loadTemplate("ProofingLite", function (template) {
        $(document.body).append(template);
        that.initialize(that.getDataSource());
        $(document).trigger(that.EVENT_TEMPLATE_LOADED);
    });
}

ProofingLite.prototype.options = {};

ProofingLite.prototype.baseOptions = {
    dataSource: null,
    layoutSelector: "#_ProofingLiteLayout",
};

ProofingLite.prototype.EVENT_TEMPLATE_LOADED = "TEMPLATE_PROOFING_LITE_LOADED";
ProofingLite.prototype.EVENT_LISTENERS_LOADED = "PROOFING_LITE_LISTENERS_LOADED";

ProofingLite.prototype.initialize = function(data) {
    var that = this;
    that.data = data;
    var layout = that.generateTemplateContent(that.options.layoutSelector, that.data);
    that.getElement().append(layout);
};

ProofingLite.prototype.setupEventListeners = function () {
    var that = this;
};

ProofingLite.prototype.getDataSource = function () {
    var that = this;
    return window[that.options.dataSource];
};

ProofingLite.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};

ProofingLite.prototype.generateTemplateContent = function(selector, data) {
    var that = this;
    var html = $(selector).html();
    var template = kendo.template(html);
    return template(data);
}