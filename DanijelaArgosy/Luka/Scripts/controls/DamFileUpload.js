function DamFileUpload(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();
    controlLoader.loadTemplate("DamFileUpload", function (template) {
        $(document.body).append(template);
        that.init();
        that.setupEventListers();
        $(document).trigger(that.EVENT_TEMPLATE_LOADED);
    });
}

DamFileUpload.prototype.options = { };

DamFileUpload.prototype.baseOptions = {
};

DamFileUpload.prototype.EVENT_TEMPLATE_LOADED = "TEMPLATE_DAM_FILE_UPLOAD_LOADED";
DamFileUpload.prototype.EVENT_DATABOUND = "EVENT_DAM_FILE_UPLOAD_DATABOUND";

DamFileUpload.prototype.setupEventListers = function () {
    var that = this;
    $(document).bind(argosyEvents.SHOW_ASSET_UPLOAD_MODAL, function (e, assetGroupId) {
        that.options.currentAssetGroupId = assetGroupId;
        $.fancybox({
            href: "#DamFileUpload",
            beforeClose: function(e) {
                $(document).trigger(argosyEvents.REFRESH_ASSET_DIRECTORY);
                that.getElement().find("table tbody.files").empty();
            }
        });
    });
}

DamFileUpload.prototype.init = function () {
    var that = this;
    var formTemplate = $("#upload-template-form").html();
    that.fileCounter = 0;
    that.getElement().append(formTemplate);
    // Initialize the jQuery File Upload widget:
    that.getElement().fileupload({
        // Uncomment the following to send cross-domain cookies:
        //xhrFields: {withCredentials: true},
        autoUpload: true,
        url: "/UploadHandler.ashx?ValidationKey=" + validationKey,
        maxChunkSize: 5000000,
        change: function (result) {
            $.fancybox.update();
            $.fancybox.reposition();
        },
        submit: function (e, data) {
            that.fileCounter++;
        },
        fail: function (e, data) {
            that.fileCounter--;
            if (that.fileCounter == 0) {
                $.fancybox.close();
                prompt.notify("The items uploaded may take up to 5 minutes to appear.");
            }
        },
        done: function (e, data) {
            if (e.type == "fileuploaddone") {
                var files = [];
                files.push(data.files[0].name);
                $.ajax({
                    url: "/tools/digitalassets/CreateAssets",
                    dataType: "json",
                    method: "POST",
                    data: {
                        assetGroupId: that.options.currentAssetGroupId,
                        files: files
                    },
                    success: function (result) {
                        if (result.ReturnCode != "200") {
                            prompt.error(result.Message + "  Code: " + result.Guid);
                        }
                    },
                    error: function (result) {
                        options.error(result);
                    }
                });
                that.fileCounter--;
            }
            if (that.fileCounter == 0) {
                $.fancybox.close();
                prompt.notify("Your files have been uploaded.");
                prompt.notify("The items uploaded may take up to 5 minutes to appear.");
            }
        }
    });

    // Enable iframe cross-domain access via redirect option:
    that.getElement().fileupload(
        'option',
        'redirect',
        window.location.href.replace(
            /\/[^\/]*$/,
            '/cors/result.html?%s'
        )
    );
    // Load existing files:
    that.getElement().addClass('fileupload-processing');
    $.ajax({
        // Uncomment the following to send cross-domain cookies:
        //xhrFields: {withCredentials: true},j
        url: that.getElement().fileupload('option', 'url'),
        dataType: 'json',
        context: that.getElement()[0]
    }).always(function () {
        $(this).removeClass('fileupload-processing');
    }).done(function (result) {
        $(this).fileupload('option', 'done').call(this, $.Event('done'), { result: result });
    });
};

DamFileUpload.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};
