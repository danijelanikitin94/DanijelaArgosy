function UserProfileUploads(opts) {
    var that = this;
    that.userId = opts.userId;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();
    controlLoader.loadTemplate("UserProfileUploads", function (template) {
        $(document.body).append(template);
        that.element = $("*[data-argosy-uuid=" + that.options.uuid + "]");
        that.setupGrid({});
        that.setupEvents();
        $(document).trigger(that.EVENT_TEMPLATE_LOADED);
    });
}

UserProfileUploads.prototype.options = {
};

UserProfileUploads.prototype.EVENT_TEMPLATE_LOADED = "TEMPLATE_GLOBAL_FORMS_DATA_STRUCT_LOADED";

UserProfileUploads.prototype.baseOptions = {
    gridRowTemplate: "#_rowTemplate"
};

UserProfileUploads.prototype.addRemoveUserImages = function (controlId, add) {
    var that = this;
    var listView = $(that.element).find(".k-collapse-grid").getKendoListView();
    if (listView != null && listView != undefined && listView.dataSource.data().length > 0) {
        var kendoData = listView.dataSource.data();
        $.each(kendoData, function (i) {
            var imageUpload = $("div[name=userUpload_" + kendoData[i].uid + "]");
            var imageUploadId = $(imageUpload).attr("id");
            if (add){
                if (imageUpload.getKendoImageEditor() != null && imageUpload.getKendoImageEditor() != undefined && imageUpload.getKendoImageEditor().response != undefined &&
                    imageUpload.getKendoImageEditor().response.FileName != "" && imageUpload.getKendoImageEditor().response.FileSize > 0 && $(imageUpload.getKendoImageEditor().hiddenInput).val() != "") {

                    if (kendoData[i].type == "profileImageUpload" && imageUploadId == controlId) {
                        var profileImageUrl = decodeURI($(imageUpload.getKendoImageEditor().hiddenInput).val());
                        that.handleUserImageUploaded(profileImageUrl, "upload");

                    } else if (kendoData[i].type == "logoUpload" && imageUploadId == controlId) {
                        var logoImageUrl = decodeURI($(imageUpload.getKendoImageEditor().hiddenInput).val());
                        that.handleUserLogoUploaded(logoImageUrl, "upload");
                    }
                }
            } else {
                if (kendoData[i].type == "profileImageUpload" && imageUploadId == controlId) {
                    that.handleUserImageUploaded("", "remove");
                } else if (kendoData[i].type == "logoUpload" && imageUploadId == controlId) {
                    that.handleUserLogoUploaded("", "remove");
                }
            }
        });
    }
}

UserProfileUploads.prototype.setupEvents = function () {
    var that = this;
    $(document).bind(argosyEvents.KENDO_EDITOR_IMAGE_UPLOADED, function (e, data, controlId) {
        if (controlId == undefined && data.onSuccess == false) {
            controlId = data.target;
        }
        that.addRemoveUserImages(controlId, true);
    });
    $(document).bind(argosyEvents.KENDO_EDITOR_IMAGE_REMOVED, function (e, data, controlId) {
        if (controlId == undefined && data.onSuccess == false) {
            controlId = data.target;
        }
        that.addRemoveUserImages(controlId, false);
    });

}

UserProfileUploads.prototype.handleUserImageUploaded = function (uploadUrl, action) {
    var that = this;
    if ((uploadUrl != "" && uploadUrl != null && action == "upload") || action == "remove") {
        var params = { userId: that.userId, fileUrl: uploadUrl };
        $.ajax({
            url: '/Account/Details/UpdateUserProfileImage',
            type: "POST",
            data: JSON.stringify(params),
            dataType: "json",
            traditional: true,
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                if (!result.IsError) {
                    prompt.notify({
                        question: "~{UserImageSuccessfullyUpdated﻿}~",
                        type: ("success")
                    });
                    $.fancybox.close();
                } else {
                    prompt.clientResponseError(result.Message);
                    $.fancybox.close();
                }
            }
        });
    } else {
        prompt.notify({
            question: "~{SelectUploadProfileImage}~",
            type: "error"
        });
    }
}

UserProfileUploads.prototype.handleUserLogoUploaded = function (uploadUrl, action) {
    var that = this;
    if ((uploadUrl != "" && uploadUrl != null && action == "upload") || action == "remove") {
        var params = { userId: that.userId, fileUrl: uploadUrl };
        $.ajax({
            url: '/Account/Details/UpdateUserCompanyImage',
            type: "POST",
            data: JSON.stringify(params),
            dataType: "json",
            traditional: true,
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                if (!result.IsError) {
                    prompt.notify({
                        question: "~{CompanyLogoSuccessfullyUpdated}~",
                        type: ("success")
                    });
                    $.fancybox.close();
                } else {
                    prompt.clientResponseError(result.Message);
                    $.fancybox.close();
                }
            }
        });
    } else {
        prompt.notify({
            question: "~{SelectUploadProfileImage}~",
            type: "error"
        });
    }
}


UserProfileUploads.prototype.setupGrid = function () {
    var that = this;
    if ($(that.element).find(".k-collapse-grid").getKendoListView() == null) {
        var opts = {
            dataSource: [
                {
                    title: that.options.profileTitle,
                    type: "profileImageUpload",
                    userId: that.options.userId,
                    thumbnail: that.options.profileThumbnail,
                    event: that.options.profileThumbnailEvent,
                    disabled: that.options.disabled
                }, {
                    title: that.options.logoTitle,
                    type: "logoUpload",
                    userId: that.options.userId,
                    thumbnail: that.options.logoThumbnail,
                    event: that.options.logoThumbnailEvent,
                    disabled: that.options.disabled
                }
            ],
            exportToExcel: false,
            groupable: false,
            sortable: false,
            scrollable: false,
            type: "list",
            title: "~{ProfileImageUploads}~",
            template: kendo.template($(that.options.gridRowTemplate).html()),
            dataBound: function (e) {
                var data = e.sender.dataSource._data;
                $.each(data, function (i) {
                    var imageUpload = $("div[name=userUpload_" + data[i].uid + "]");
                    kendo.bind(imageUpload, data[i]);
                });

            }
        };
        $(that.element).kendoCollapseGrid(opts);
        $(that.element).find(".k-listview").addClass("row");
    }
}
