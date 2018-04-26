function GlobalProfileUploads(opts) {
    var that = this;
    that.globalFormsStructId = opts.globalFormsStructId;
    that.globalFormsProfileId = opts.globalFormsProfileId;
    $.extend(true, that.options, that.baseOptions, opts);
    that.element = $("*[data-argosy-uuid=" + that.options.uuid + "]");
    that.setupGrid({});
    that.setupEvents();
}

GlobalProfileUploads.prototype.options = {
};

GlobalProfileUploads.prototype.baseOptions = {
    globalProfileThumbnailEvent: "EVENT_GLOBAL_PROFILE_IMAGE_UPLOADED"
};

GlobalProfileUploads.prototype.setupEvents = function () {
    var that = this;
    $(document).bind("EVENT_GLOBAL_PROFILE_IMAGE_UPLOADED", function (e, file) {
        that.handleUserImageUploaded(file);
    });
}

GlobalProfileUploads.prototype.handleGlobalProfileImageUploaded = function (file) {
    var that = this;
    if (file != "" && file != null) {
        var params = { userId: that.userId, filePath: file.uploadPath };
        $.ajax({
            url: '/DataView/UpdateGlobalProfileImage',
            type: "POST",
            data: JSON.stringify(params),
            dataType: "json",
            traditional: true,
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                if (!result.IsError) {
                    prompt.notify({
                        question: "User profile image successfully updated.",
                        type: ("success")
                    });
                    $.fancybox.close();
                } else {
                    prompt.clientResponseError(result.Message);
                    $.fancybox.close();
                }
                //var grid = $(that.element).find(".k-collapse-grid").getKendoGrid();
                //grid.dataSource.read();
                //grid.refresh(true);
                //Not finding grid until then refershing page.
                location.reload();
            }
        });
    } else {
        prompt.notify({
            question: "Please select and upload global profile image",
            type: "error"
        });
    }
}

GlobalProfileUploads.prototype.setupGrid = function () {
    var that = this;
    if ($(that.element).getKendoGrid() == null) {
        var opts = {
            dataSource: [
            {
                title: "Upload " + that.options.title,
                globalFormsStructId: that.options.globalFormsStructId,
                globalFormsProfileId: that.options.globalFormsProfileId,
                thumbnail: that.options.thumbnail,
                event: "EVENT_GLOBAL_PROFILE_IMAGE_UPLOADED"
            }
            ],
            exportToExcel: false,
            groupable: false,
            sortable: false,
            scrollable: false,
            template: '<div class="col-sm-6" data-argosy-control="GlobalUploadControl" data-argosy-options-title="${title}" data-argosy-options-global-forms-struct-id="${globalFormsStructId}" data-argosy-options-global-forms-profile-id="${globalFormsProfileId}" data-argosy-options-thumbnail="${thumbnail}" data-argosy-options-upload-success-event="${event}"></div>'
        };
       
        $(that.element).kendoGrid(opts);
        
    }
}