var GlobalUploadControl = (
    getFunctions = function() {
        return {
            configureControl: function (opts) {
                this.options = {};
                this.baseOptions = {
                    acceptedFormats: ".pdf,.eps,.jpg,.tif,.tiff,.gif,.png",
                    thumbnail: null,
                    title: null,
                    description: "You will be allowed to crop and resize after you upload a file.",
                    allowCrop: true,
                    allowResize: true,
                    onUploadComplete: function(e) {
                    },
                    maxFileSize: 1024 * 1024 * 1024,
                    uploadSuccessEvent: "EVENT_UPLOAD_SUCCESS",
                    uploadFailedEvent: "EVENT_UPLOAD_FAILED"
                };
                this.fileTypes = [
                    { extension: ".tif", text: "PC or Mac TIFF files" },
                    { extension: ".pdf", text: "Adobe PDF" },
                    { extension: ".eps", text: "Composite Postscript files" },
                    { extension: ".jpg", text: "JPEG image" },
                    { extension: ".tiff", text: "PC or Mac TIFF files" },
                    { extension: ".gif", text: "GIF image" },
                    { extension: ".png", text: "PNG image" }
                ];
                this.options.uploadSuccessEvent = opts.uuid + this.options.uploadSuccessEvent;
                this.options.uploadFailedEvent = opts.uuid + this.options.uploadFailedEvent;
                $.extend(true, this.options, this.baseOptions, opts);
                this.element = $("*[data-argosy-uuid=" + this.options.uuid + "]");
            },
            buildUploadControl: function() {
                var that = this;

                that.element.append(that.buildVisibleControl());
                that.element.append(that.buildModalControl());

                that.uploader = new ChunkedUploader("*[data-argosy-uuid=" + that.options.uuid + "] .chunked-uploader", that.getAccceptedFormatsString(), that.options.maxFileSize, false);
                that.uploader.EVENT_FILE_SUCCESS = that.options.uploadSuccessEvent;
                that.uploader.EVENT_FILE_FAIL = that.options.uploadFailedEvent;
                $(that.uploader).bind(that.options.uploadSuccessEvent, function(e, file) {
                    //$(document).trigger(that.options.uploadSuccessEvent, file);
                    $(".global-upload-continue-button").show();
                });
                $(that.uploader).bind(that.options.uploadFailedEvent, function(e, file) {
                    //$(document).trigger(that.options.uploadFailedEvent, file);
                    $(".global-upload-continue-button").hide();
                });
                var modalLauncher = that.element.find(".fa-cloud-upload").closest("a");
                modalLauncher.unbind("click");
                modalLauncher.click(function(e) {
                    //var uid = $(e.currentTarget).closest("div[data-argosy-uuid]").attr("data-argosy-uuid");
                    //var event = $(e.currentTarget).closest("div[data-argosy-uuid]").attr("data-argosy-options-upload-success-event");
                    $.fancybox({
                        href: "#" + that.options.uuid + "-modal",
                        afterShow: function (a) {
                            $(".fancybox-inner").find(".col-sm-6").css("min-height", $(".fancybox-inner").find(".col-sm-4").height() + "px");
                        },
                        beforeShow: function(b) {
                            that.uploader.clearFiles();
                            var continueButton = $(".fancybox-inner").find(".global-upload-continue-button");
                            continueButton.hide();
                            continueButton.unbind("click");
                            continueButton.click(function (e) {
                                $(document).trigger(that.options.uploadSuccessEvent, that.uploader.getFiles());
                            });
                        }
                    });
                });
                that.element.find("img").css("max-width", "215px");
            },
            buildVisibleControl: function() {
                var that = this;
                var visibleControl = $("<div class='w100'/>");
                var title = that.options.title == null ? "Upload Image" : that.options.title;
                visibleControl.append('<a><i title="' + title + '" class="fa fa-cloud-upload"></i> ' + title + '</a>');
                var thumbnailUrl = that.options.thumbnail != null ? that.options.thumbnail : "";
                visibleControl.append('<img class="information img-responsive" src="' + thumbnailUrl + '" alt="">');
                return visibleControl;
            },
            buildModalControl: function() {
                var that = this;
                var modalControl = $("<div />", {
                    'class': "hide modalUploadControl",
                    'id': that.options.uuid + "-modal"
                });
                var contentWrapperControl = $("<div />", {
                    'class': "w100 row"
                });

                modalControl.append($("<h3>" + that.options.title + "</h3>"));
                modalControl.append($("<p class='padb10'>" + that.options.description + "</p>"));
                contentWrapperControl.append(that.buildModalThumbnailControl());
                contentWrapperControl.append(that.buildModalUploadControl());
                contentWrapperControl.append(that.buildModalAllowedTypesControl());
                modalControl.append(contentWrapperControl);

                return modalControl;
            },
            buildModalUploadControl: function() {
                var that = this;
                var uploadControl = $("<div>", {
                    'class': "chunked-uploader col-sm-6 padl10"
                });
                return uploadControl;
            },
            buildModalAllowedTypesControl: function() {
                var that = this;
                var allowedTypesElement = $("<div>", {
                    'class': "col-sm-4 padl10"
                });
                allowedTypesElement.append('<p><b>Allowed File Formats</b></p>');
                $(that.getAllowedFormats()).each(function(i) {
                    var format = that.getFormatInfo(this);
                    allowedTypesElement.append('<p>(*' + format.extension + ') - ' + format.text + '</p>');
                });
                allowedTypesElement.append($('<div class="hide bottom-right clear pull-right global-upload-continue-button"><a class="btn btn-default">Continue</a></div>'));
                return allowedTypesElement;
            },
            buildModalThumbnailControl: function() {
                var that = this;
                var thumbnailElement = $("<div>", {
                    'class': "padr10 col-sm-2"
                });
                thumbnailElement.append('<p class="small_txt">Current Image:</p>');
                var thumbnailUrl = that.options.thumbnail != null ? that.options.thumbnail : "";
                thumbnailElement.append('<img class="information img-responsive padb10" title="Enlarge Image" src="' + thumbnailUrl + '" />');
                return thumbnailElement;
            },
            getFormatInfo: function(format) {
                var that = this;
                var type = { extension: format, text: "No information found." }
                $(that.fileTypes).each(function(i) {
                    if (this.extension == format) {
                        type = this;
                    }
                });
                return type;
            },
            getAllowedFormats: function() {
                var that = this;
                if ($.type(that.options.acceptedFormats) === "string") {
                    return that.options.acceptedFormats.split(",");
                } else if ($.isArray(that.options.acceptedFormats)) {
                    return that.options.acceptedFormats;
                }
                return [];
            },
            getAccceptedFormatsString: function() {
                var that = this;
                if ($.type(that.options.acceptedFormats) === "string") {
                    return that.options.acceptedFormats;
                } else if ($.isArray(that.options.acceptedFormats)) {
                    return that.options.acceptedFormats.join();
                }
                return "";
            }
        };
    },
    // constructure has to be last function in the object
    function(opts) {
        this.fn = getFunctions();
        this.fn.configureControl(opts);
        this.fn.buildUploadControl();
    }
);