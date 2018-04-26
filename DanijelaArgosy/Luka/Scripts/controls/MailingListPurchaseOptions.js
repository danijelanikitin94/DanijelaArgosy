/**
 * Created by acormier on 4/27/2017.
 */
function MailingListPurchaseOptions(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.controlLoader = new ControlLoader();
    that.controlLoader.loadTemplate("MailingListPurchaseOptions", function (template) {
        $(document.body).append(template);
        that.initialize();
    });
}

MailingListPurchaseOptions.prototype.options = {};

MailingListPurchaseOptions.prototype.baseOptions = {
    displayName: "",
    showAccudata: false,
    showLeadsPlease: false,
    templates: {
        contentTemplate: "#_MailingListPurchaseOptionsTemplate"
    }
};

MailingListPurchaseOptions.prototype.configureAccudata = function() {
    var that = this,
        element = $("<div />",
        {
            "data-argosy-control": "MailingListAccudata",
            "data-argosy-options-display-name": that.options.displayName
        });
    that.getElement().empty();
    that.getElement().append(element);
    that.controlLoader.processControlElement(that.getElement().find("div")[0], function(e) {
    });
};

MailingListPurchaseOptions.prototype.configureLeadsPlease = function() {
    var that = this,
        element = $("<div />",
        {
            "data-argosy-control": "MailingListLeadsPlease",
            "data-argosy-options-display-name": that.options.displayName
        });
    that.getElement().empty();
    that.getElement().append(element);
    that.controlLoader.processControlElement(that.getElement().find("div")[0], function(e) {
    });
};

MailingListPurchaseOptions.prototype.initialize = function() {
    var that = this;
    if (that.options.showAccudata && !that.options.showLeadsPlease) {
        that.configureAccudata();
    } else if (that.options.showLeadsPlease && !that.options.showAccudata) {
        that.configureLeadsPlease();
    } else {
        var model = kendo.observable({
            name: that.options.displayName,
            showAccudata: that.options.showAccudata,
            showLeadsPlease: that.options.showLeadsPlease,
            selectOption: function(e) {
                switch ($(e.currentTarget).attr("data-option")) {
                case "accudata":
                    that.configureAccudata();
                    break;
                case "leadsplease":
                    that.configureLeadsPlease();
                    break;
                }
                $.fancybox.close();
            }
        });
        var content = $(that.options.templates.contentTemplate).html();
        $.fancybox({
            content: content,
            modal: true,
            beforeShow: function() {
                kendo.bind(this.wrap, model);
            },
            afterShow: function() {
                setTimeout(function() {
                        $.fancybox.update();
                    },
                    250);
            }
        });
    }
};

MailingListPurchaseOptions.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};