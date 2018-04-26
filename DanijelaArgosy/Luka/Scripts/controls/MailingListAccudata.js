function MailingListAccudata(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.controlLoader = new ControlLoader();

    that.controlLoader.loadTemplate("MailingListAccudata", function (template) {
        $(document.body).append(template);
        that.initialize();
    });
}

MailingListAccudata.prototype.options = {};

MailingListAccudata.prototype.baseOptions = {
    dataSource: null,
    templates: {
        contentTemplate: "#_MailingListAccudataTemplate",
        variablesTemplate: "#_MailingListAccudataVariablesTemplate",
        countTemplate: "#_mailingListAccudataCountTemplate"
    }
};

MailingListAccudata.prototype.initialize = function () {
    var that = this;
    that.sku = that.options.sku == null ? getQuerystring("sku") : that.options.sku;
    that.customizationStateId = that.options.customizationStateId == null ? getQuerystring("customizationStateId") : that.options.customizationStateId;

    var content = kendo.Template.compile($(that.options.templates.contentTemplate).html())({
        Sku: that.sku,
        CustomizationStateId: that.customizationStateId,
        Name: that.options.displayName
    });
    that.getElement().append(content);
    that.getConfig();
};

MailingListAccudata.prototype.config = null;
MailingListAccudata.prototype.variables = null;

MailingListAccudata.prototype.getConfig = function () {
    var that = this;
    $(document).trigger(argosyEvents.START_LOADING);
    $.ajax({
        url: "/Tools/Mailing/GetDataProviderConfig?dataProvider=Accudata",
        dataType: "json",
        method: "POST",
        success: function (result) {
            that.config = result;
            that.getVariables();
        }
    });
};

MailingListAccudata.prototype.getVariables = function () {
    var that = this;
    $.ajax({
        url: "/Tools/Mailing/GetDataProviderConfigVariables?dataProvider=Accudata&product=" + that.config.product,
        dataType: "json",
        method: "POST",
        success: function (result) {
            that.variables = result.variables;
            that.groups = result.groups;
            $.each(that.variables, function (i, variable) {
                this.IsUserVariable = true;
            });
            getPartBySku(getQuerystring("sku"), function (part) {
                that.part = part;
                that.setup();
                var data = { variables: null, zeroCountRequest: true, isValid: true};
                $(document).trigger(argosyEvents.EVENT_BUILD_PROOF, data);
            });
        }
    });
};
MailingListAccudata.prototype.updateCountData = function () {
    var that = this;
    var countTemplate = $(that.getElement()).find(that.options.templates.countTemplate);
    countTemplate.empty();
    window.accudataResponse = that.result.ListData;
    //$(document).unbind("EVENT_ADD_LIST_TO_CART");
    //$(document).bind("EVENT_ADD_LIST_TO_CART", function (e, data) {
    //});
    countTemplate.append($("<div />", {
        "data-argosy-control": "MailingListShippingOptions",
        "data-argosy-options-data-source": "accudataResponse",
        "data-argosy-options-hide-title": "true",
        "data-argosy-options-error-message": (that.result.Response != null ? that.result.Response.ErrorMessage : ""),
        "data-argosy-options-horizontal": "true",
        "data-argosy-options-display-name": that.options.displayName,
        "data-argosy-options-data-provider-config-id": that.config.dataProviderConfigId,
        "data-argosy-options-can-override-count": true,
        "data-argosy-options-show-multi-use-option": true,
        "data-argosy-options-single-use-cost": that.config.perListCost,
        "data-argosy-options-multi-use-cost": that.config.perListCostMultiUse,
        "data-argosy-options-single-per-record-cost": that.config.perRecordCost,
        "data-argosy-options-multi-per-record-cost": that.config.perRecordCostMultiUse
        //"data-argosy-options-add-to-cart-event": "EVENT_ADD_LIST_TO_CART"
    }));
    controlLoader.processControlElement(countTemplate.find("[data-argosy-control=MailingListShippingOptions]")[0])
}

MailingListAccudata.prototype.setup = function () {
    var that = this;
    var variableTemplate = $(that.getElement()).find(that.options.templates.variablesTemplate);

    $(document).bind(argosyEvents.EVENT_BUILD_PROOF, function (e, data) {
        if (data.isValid) {
            var queryString = "dataProvider=Accudata&product=" + that.config.product + 
                                "&sku=" + that.sku + 
                                "&customizationStateId=" + that.customizationStateId + 
                                "&zeroCountRequest=" + (data.zeroCountRequest ? true : false);
            $(document).trigger(argosyEvents.START_LOADING);
            $.ajax({
                url: "/Tools/Mailing/GetDataProviderCount?" + queryString,
                dataType: "json",
                method: "POST",
                data: {
                    variables: data.variables != null ? JSON.stringify(data.variables) : ""
                },
                success: function (result) {
                    that.result = result;
                    that.updateCountData();
                    if (that.result.Response != null && that.result.Response.IsError) {
                        prompt.error(that.result.Response.ErrorMessage);
                    }
                    $(document).trigger(argosyEvents.END_LOADING);
                }
            });
        }
    });
    that.variablesControl = variableTemplate.kendoProofingVariables({
        dataSource: {
            Variables: that.variables,
            Part: that.part,
            Profiles: [],
            VariableGroups: that.groups,
            GlobalProfiles: [],
            DesignTemplates: [],
            GroupColumnCount: 1
        },
        title: "",
        personalizeMessage: "",
        proofText: "Count",
        actionText: "Generate"
    });
};

MailingListAccudata.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};