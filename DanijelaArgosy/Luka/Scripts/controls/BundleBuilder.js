function BundleBuilder(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.ControlLoader = new ControlLoader();
    that.ControlLoader.loadTemplate("BundleBuilder", function (template) {
        $(document.body).append(template);
        $(document).trigger(that.EVENT_TEMPLATE_LOADED);
        that.initialize();
        that.setupEvents();
    });
}
BundleBuilder.prototype.options = {};

BundleBuilder.prototype.baseOptions = {
    dataSource: {}
};
BundleBuilder.prototype.templates = {
    proofingFormTemplate: "#_BundleBuilderProofingFormTemplate",
    productDisplayTemplate: "#_BundleBuilderProductDisplayTemplate",
};

BundleBuilder.prototype.EVENT_TEMPLATE_LOADED = "BUNDLE_BUILDER_TEMPLATES_LOADED";

BundleBuilder.prototype.initialize = function () {
    var that = this,
        element = that.getElement();
    that.options.dataSource = that.getDataSource();
    that.createBaseWrapper(element);
    kendo.bind(element, {});
    that.taskHub = new TaskHub(function (e) {
        that.update(e);
    }, function (e) {
        that.complete(e);
    }, function (e) {
        that.error(e);
    });
};

BundleBuilder.prototype.setupEvents = function () {
    var that = this;
    $(document).bind(argosyEvents.EVENT_SHOW_PROOFING_FORM, function (e, data) {
        that.getElement().find("[data-role=proofingvariables]").show();
        that.getElement().find("[data-argosy-control=KitBuilder]").hide();
    });
    $(document).bind(argosyEvents.EVENT_BUILD_PROOF,function(e, data) {
        if (data.isValid) {
            that.options.dataSource.variables = data.variables;
            var proofName = Proofing.prototype.getProofName(that.options.dataSource.variables);
            that.taskHub.generateBundles(data.part.Sku, data.variables, userSettings.PriceListId, proofName);
        } else {
            prompt.alert({
                question: "You are missing required fields to generate this bundle.",
                description: "Please update the form and continue.",
                type: "warning"
            });
        }
    });
};

BundleBuilder.prototype.showKitBuilder = function () {
    var that = this;
    KitBuilder.prototype.options.dataSource = "bundleKitData;"
    window["bundleKitData"] = that.options.dataSource.kitData;
    window["variables"] = that.options.dataSource.variables;
    that.getVariablesElement().hide();
    var kitBuilderElement = that.getKitBuilderElement();
    if (kitBuilderElement.length != 0) {
        kitBuilderElement.remove();
    }
    that.getElement().append($(that.templates.productDisplayTemplate).html());
    kitBuilderElement = that.getKitBuilderElement();
    that.ControlLoader.processControlElement(kitBuilderElement[0], function (e) {
    });
};

BundleBuilder.prototype.createBaseWrapper = function (element) {
    var that = this;
    element = element == null ? that.getElement() : element;
    element.append($(that.templates.proofingFormTemplate).html());
};

BundleBuilder.prototype.getKitBuilderElement = function () {
    var that = this;
    return that.getElement().find("[data-argosy-control=KitBuilder]");
};

BundleBuilder.prototype.getVariablesElement = function () {
    var that = this;
    return that.getElement().find("[data-role=proofingvariables]");
};

BundleBuilder.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};

BundleBuilder.prototype.getDataSource = function () {
    var that = this;
    return window[that.options.dataSource];
};

BundleBuilder.prototype.update = function (task) {
    this.task = task;
};

BundleBuilder.prototype.complete = function (task) {
    var that = this;
    that.task = task;
    if (task.ErrorGuid != null) {
        // leave the error modal visible
    } else {
        that.options.dataSource.proofingResponse = JSON.parse(task.Data["bundle"]);
        that.options.dataSource.Groups = JSON.parse(task.Data["Groups"]);
        that.options.dataSource.GroupNames = JSON.parse(task.Data["GroupNames"]);
        that.options.dataSource.kitData = {
            GroupNames: that.options.dataSource.GroupNames,
            Groups: that.options.dataSource.Groups,
            Kit: that.options.dataSource.Part,
            KitParts: [],
            KitState: that.options.dataSource.proofingResponse
        };
        $.fancybox.close();
        that.showKitBuilder();
    };
};

BundleBuilder.prototype.error = function (task) {
    this.task = task;
};
