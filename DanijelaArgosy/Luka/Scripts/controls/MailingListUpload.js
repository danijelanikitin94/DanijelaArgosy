function MailingListUpload(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();
    controlLoader.loadTemplate("MailingListUpload", function (template) {
        $(document.body).append(template);
        that.initialize();
    });
}

MailingListUpload.prototype.options = {};

MailingListUpload.prototype.baseOptions = {
    dataSource: null,
    uploadOnly: false,
    templates: {
        contentTemplate: "#_MailingListUploadTemplate"
    }
};

MailingListUpload.prototype.initialize = function () {
    var that = this;
    $(document).bind(argosyEvents.KENDO_EDITOR_IMAGE_UPLOADED, function (e, data) {
        that.verifySpreadsheet(data);
    });
    that.getElement().append(kendo.template($(that.options.templates.contentTemplate).html())({
        AllowedExtensions: [".xls", ".xlsx", ".csv"],
        CustomizationState: null,
        Sku: getQuerystring("sku"),
        Name: that.options.displayName
    }));
    kendo.bind(that.getElement());
};



MailingListUpload.prototype.verifySpreadsheet = function (data) {
    var that = this;
    $.ajax({
        url: "/Tools/Mailing/VerifySpreadsheet/?file=" + data.response.UploadFileUrl + "&hasHeaders=" + $("#listHasHeaders")[0].checked,
        dataType: "json",
        success: function (result) {
            if (result.ReturnCode === ReturnCode.Success) {
                if (that.options.uploadOnly) {
                    $.submitAsForm("/Tools/Mailing/UploadOnly?Sku=" + getQuerystring("sku") + "&customizationStateId=" + getQuerystring("customizationStateId"), data.response, "fileData");
                } else {
                    $.submitAsForm("/Tools/Mailing/Mapper?Sku=" + getQuerystring("sku") + "&customizationStateId=" + getQuerystring("customizationStateId"), data.response, "fileData");
                }
            } else {
                prompt.alert({
                    question: result.Message,
                    description: "",
                    type: "warning"
                });
            }
        }
    });
}

MailingListUpload.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};

MailingListUpload.prototype.isAdvancedUpload = function () {
    var that = this,
        div = document.createElement("div");
    return (("draggable" in div) || ("ondragstart" in div && "ondrop" in div)) &&
        "FormData" in window &&
        "FileReader" in window;
};