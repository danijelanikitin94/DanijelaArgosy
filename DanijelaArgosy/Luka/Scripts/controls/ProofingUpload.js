function ProofingUpload(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.controlLoader = new ControlLoader();
    that.controlLoader.loadTemplate("ProofingUpload", function (template) {
        $(document.body).append(template);
        that.init();
    });
}

ProofingUpload.prototype.options = {};

ProofingUpload.prototype.baseOptions = {
    dataSource: null,
    proofingUploadTemplateHref: "#_ProofingUploadTemplate",
    proofingUploadHiddenInputHref: "#proofingUploadImage",
    proofingUploadImageControlHref: "#proofingUploadImageControl"
};


ProofingUpload.prototype.init = function () {
    var that = this;
    that.data = that.getDataSource();
    that.data.Name = that.options.displayName;
    that.data.UpdateButton = (that.options.updateButton == null ? "~{UpdateCart}~": that.options.updateButton);
    that.data.SkipButton = (that.options.skipButton == null ? "~{SkipToCart}~": that.options.skipButton);
    var template = kendo.template($(that.options.proofingUploadTemplateHref).html());
    that.getElement().append(template(that.data));
    kendo.bind(that.getElement());
    $(document).bind(argosyEvents.ADD_UPLOAD_TO_CART, function (e) {
        that.addUploadToCart();
    }).bind(argosyEvents.KENDO_EDITOR_IMAGE_UPLOADED, function (e, data) {
        that.imageSwap(e, data);
    }).bind(argosyEvents.KENDO_EDITOR_IMAGE_REMOVED, function (e, data) {
        that.imageSwap(e, data);
    });
    $.waitFor(that.options.proofingUploadImageControlHref, function (element) {
        var parent = that;
        parent.controlLoader.loadControls(element);
    }, 250);
}

ProofingUpload.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    return window[that.options.dataSource];
};

ProofingUpload.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};

ProofingUpload.prototype.addUploadToCart = function() {
    var that = this;
    var upload = that.getElement().find(that.options.proofingUploadImageControlHref).getKendoImageEditor(),
        uploadFileUrl = null, 
        previewFileUrl = null;
    if (upload.response != null) {
        uploadFileUrl = upload.response.UploadFileUrl;
        previewFileUrl = upload.response.PreviewFileUrl;
    };
    if (that.data.Part.IsUploadRequired && (uploadFileUrl == null || uploadFileUrl.length == 0)) {
        prompt.alert({
            question: "This product requires an upload to be added to your cart.",
            description: "",
            type: "warning",
            yes: function(e) {
                $.fancybox.close();
            }
        });
    } else {
        var customizationStateId = null;
        if (that.data.CustomizationState != null) {
            customizationStateId = that.data.CustomizationState.CustomizationStateId;
        }
        that.addToCart(uploadFileUrl, previewFileUrl, customizationStateId, that.data.CartId, that.data.OrderLineId);
    }
};

ProofingUpload.prototype.imageSwap = function(e, data) {
    var divArtworkReq = $("#divArtworkReq"),
        divPreview = $("#divPreview"),
        resultPreviewImage = divPreview.find("img"),
        pdfPreview = $("#previewPagesDiv"),
        pdfPreviewLink = $("#previewPagesDiv").find("a");
    resultPreviewImage.attr("src", "");
    if (e.type === "EVENT_KENDO_EDITOR_IMAGE_UPLOADED") {
        if (data != null) {
            if (data.response != null) {
                data = data.response;
            };
            if (data.Extension != null) {
                
                var previewExtensions = [".jpg", ".jpeg", ".png", ".jpg", ".tiff", ".tif", ".gif", ".pdf", ".eps"],
                    extension = data.Extension,
                    previewFileUrl = data.PreviewFileUrl;
                if ($.inArray(extension, previewExtensions) > -1) {
                    if (userSettings.IsAssetUploadRestricted) {
                        divArtworkReq.hide();
                    };
                    if (data.Extension == ".pdf") {
                        previewFileUrl += "?h=800&w=600&format=jpg";
                        if (data.PageCount > 1) {
                            pdfPreview.show();
                            pdfPreviewLink.click(function () {
                                var pages = [];
                                for (var i = 0; i < data.PageCount; i++) {
                                    pages.push({
                                        href: data.PreviewFileUrl + "?h=800&w=600&format=jpg&page=" + (i+1),
                                        title: "Page " + (i+1)
                                    });
                                }
                                $.fancybox.open(pages, {type: "image"});
                            });
                        }
                    }
                    resultPreviewImage.attr("src", previewFileUrl);
                    //$(resultPreviewImage).bind("error", function (e) {
                    //    $(this).attr('src', previewFileUrl + "?t=" + Math.random());
                    //});
                } else {
                    if (userSettings.IsAssetUploadRestricted) {
                        divArtworkReq.show();
                    };
                };
            };
        };
    };
};

ProofingUpload.prototype.addToCart = function (uploadPath, thumbnailPath, customizationStateId, cartId, orderLineId, isUploadRequired) {
    var that = this;
    block(null, "~{MsgAddingToCart}~");
    $.ajax({
        url: "/Store/Proofing/AddUploadToCart",
        dataType: "json",
        data: {
            partId: that.data.Part.PartId,
            customizationStateId: customizationStateId,
            uploadPath: uploadPath,
            orderLineId: orderLineId,
            thumbnailPath: thumbnailPath,
            cartId: cartId,
            isUploadRequired: isUploadRequired
        },
        method: "POST",
        success: function (result) {
            if (result.ReturnCode === ReturnCode.Success) {
                var cartPath = "/Store/Cart";
                if (result.ReturnResponse != null &&
                    result.ReturnResponse.ReturnUrl != null &&
                    result.ReturnResponse.ReturnUrl.length > 0) {
                    cartPath = result.ReturnResponse.ReturnUrl;
                }
                window.location = cartPath;
            } else {
                unblock();
                prompt.alert({
                    question: result.Message,
                    description: "Ref: " + result.Guid,
                    type: "warning",
                    yes: function (e) {
                        $.fancybox.close();
                    }
                });
            }
        }
    });
};