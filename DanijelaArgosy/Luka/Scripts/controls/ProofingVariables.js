function ProofingVariables() {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();
    controlLoader.loadTemplate("BundleBuilder", function (template) {
        $(document.body).append(template);
        controlLoader.loadTemplate("ProofingVariables", function (template) {
            $(document.body).append(template);
            $(document).trigger(that.EVENT_TEMPLATE_LOADED);
        });
    });
}
ProofingVariables.prototype.options = {};

ProofingVariables.prototype.baseOptions = {
    partId: null,
    partObject: null,
    part: null,

};

ProofingVariables.prototype.EVENT_TEMPLATE_LOADED = "BUNDLE_BUILDER_TEMPLATES_LOADED";