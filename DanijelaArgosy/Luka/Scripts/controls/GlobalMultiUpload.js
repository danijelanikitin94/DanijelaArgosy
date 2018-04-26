function GlobalMultiUpload(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.files = new Array();
    var controlLoader = new ControlLoader();
    controlLoader.loadTemplate("DamFileUpload", function (template) {
        $(document.body).append(template);
        that.init();
        that.setupEventListers();
        $(document).trigger(that.EVENT_TEMPLATE_LOADED);
    });
}

GlobalMultiUpload.prototype.options = {};

GlobalMultiUpload.prototype.baseOptions = {
    finalUploadEvent: argosyEvents.EVENT_GLOBAL_MULTI_UPLOAD_COMPLETE,
    showUploadEvent: argosyEvents.EVENT_SHOW_GLOBAL_MULTI_UPLOAD
};

GlobalMultiUpload.prototype.EVENT_TEMPLATE_LOADED = "TEMPLATE_DAM_FILE_UPLOAD_LOADED";
GlobalMultiUpload.prototype.EVENT_DATABOUND = "EVENT_DAM_FILE_UPLOAD_DATABOUND";

GlobalMultiUpload.prototype.setupEventListers = function () {
    var that = this;
    $(document).bind(that.options.showUploadEvent, function (e) {
        $.fancybox({
            href: "#GlobalMultiUpload",
            beforeClose: function(e) {
                that.getElement().find("table tbody.files").empty();
            }
        });
    });
}

GlobalMultiUpload.prototype.init = function () {
    var that = this;
    var formTemplate = $("#upload-template-form").html();
    that.fileCounter = 0;
    var firstRun = true;
    that.getElement().append(formTemplate);
    // Initialize the jQuery File Upload widget:
    that.getElement().fileupload({
        // Uncomment the following to send cross-domain cookies:
        //xhrFields: {withCredentials: true},
        method: "POST",
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
            }
        },
        done: function (e, data) {
            if (e.type == "fileuploaddone") {
                that.files.push(data.files[0].name);
                that.fileCounter--;
            }
            if (that.fileCounter == 0 && !firstRun) {
                $(document).trigger(that.options.finalUploadEvent, { files: that.files });
                prompt.notify("Your files have been uploaded.");
            }
            if (firstRun) {
                firstRun = false;
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
        method: "POST",
        url: that.getElement().fileupload('option', 'url'),
        dataType: 'json',
        context: that.getElement()[0]
    }).always(function () {
        $(this).removeClass('fileupload-processing');
    }).done(function (result) {
        $(this).fileupload('option', 'done').call(this, $.Event('done'), { result: result });
    });
};

GlobalMultiUpload.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};
