function ModalShareAsset(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);

    var controlLoader = new ControlLoader();
    controlLoader.loadTemplate("ModalShareAsset", function (template) {
        if ($(that.options.fancyboxHref).length === 0) {
            $(document.body).append(template);
        }
        $(that).trigger(that.EVENT_TEMPLATE_LOADED);
    });
}

ModalShareAsset.prototype.options = {
};

ModalShareAsset.prototype.baseOptions = {
    fancyboxHref: "div[data-argosy-modal=ModalShareAsset]",
    shareAssetTemplateHref: "#_ModalShareAssetTemplate",
    emailContainer: "#_modalShareEmailContainer",
    assetId: null
};

ModalShareAsset.prototype.EVENT_TEMPLATE_LOADED = "TEMPLATE_MODAL_SHARE_ASSET_LOADED";

ModalShareAsset.prototype.setupEmailMultiSelect = function() {
    var that = this;
    var select = $.fancybox.wrap.find("select");
    var isEmail = function(email) {
        var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    select.kendoMultiSelect({
        placeholder: "Enter email(s) here...",
        autoBind: false,
        dataSource: {
            type: "odata",
            serverFiltering: true,
            schema: {
                data: function (response) {
                    return response.Records;
                },
                total: function (response) {
                    return response.TotalRecords;
                }
            },
            transport: {
                read: function (options) {
                    var filter = options.data.filter;
                    var result = {
                        Records: [],
                        TotalRecords: 0
                    };
                    var startsWith = (filter == null || filter.filters == null || filter.filters.length == 0 ? "" : filter.filters[0].value);
                    if (isEmail(startsWith)) {
                        result.Records.push(startsWith);
                        result.TotalRecords = result.Records.Length;
                        options.success(result);
                    } else {
                        options.success(result);
                    }
                }
            }
        },
        dataBound: function (e) {
            $.fancybox.update();
        }
    });
};

ModalShareAsset.prototype.getBindHandlers = function () {
    var that = this;
    var viewModel = kendo.observable({
        showMsgToUser:false,
        onSendFile: function (e) {
            var kendoObj = this,
                newRecipients = [],
                hasRecipients = false,
                select = $.fancybox.wrap.find("select").getKendoMultiSelect();
            newRecipients = select.value();
            hasRecipients = newRecipients.length > 0;
            kendoObj.set("recipients", newRecipients);
            kendoObj.set("showMsgToUser", !hasRecipients);

            if (hasRecipients) {
                that.sendEmail(newRecipients);
            }
        },
        onAddRecipient: function (e) {
            var kendoObj = this;

            kendoObj.get("recipients").push({
                email: "", hasError: false
            });
            kendoObj.set("showMsgToUser", false);
        },
        onRemoveRecipient: function (e) {
            var recipient = e.data;
            var recipients = this.get("recipients");

            var index = recipients.indexOf(recipient);
            recipients.splice(index, 1);
        },
        getErrorMsgText: function (e) {
            var kendoObj = this,
                recipients = kendoObj.get("recipients"),
                msg = "Please correct or remove highlighted emails.";
            if (recipients.length > 0) {
                return msg;
            }
            return "Click + sign to add a recipient.";

        },
        getErrorClass: function (e) {
            return this.get("showMsgToUser") ? "field-validation-error" : "hide";
        },
        doesInputHaveError: function (e) {
            return e.hasError ? "input-has-error" : "";
        },
        recipients: []
    });
    return viewModel;

};

ModalShareAsset.prototype.sendEmail = function (email) {
    var that = this;
    $.ajax({
        url: "/Tools/DigitalAssets/ShareAsset",
        dataType: "json",
        data: { emails: email, assetId: that.options.assetId },
        type: "POST",
        complete: function (result) {
            prompt.alert({
                question: "Your file has been shared.",
                description: "",
                type: "success",
                yes: function (e) {
                    $.fancybox.close();
                }
            });
        }
    });
};

ModalShareAsset.prototype.show = function (asset) {
    var that = this;
    that.options.assetId = asset.Id;
    $(that.options.fancyboxHref).html();
    var modal = kendo.Template.compile($(that.options.shareAssetTemplateHref).html())(asset);
    $.fancybox({
        content: modal,
        scrolling: "no",
        afterShow: function (e) {
            that.setupEmailMultiSelect();
            kendo.bind($.fancybox.wrap, that.getBindHandlers());
        }
    });

};