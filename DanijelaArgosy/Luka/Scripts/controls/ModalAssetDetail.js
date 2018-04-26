function ModalAssetDetail(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);

    var controlLoader = new ControlLoader();
    controlLoader.loadTemplate("ModalAssetDetail", function (template) {
        that.TEMPLATE = $(template);
        $(that).trigger(that.EVENT_TEMPLATE_LOADED);
    });
}

ModalAssetDetail.prototype.options = {
    asset: {}
};

ModalAssetDetail.prototype.baseOptions = {
    templateSelector: "#_ModalAssetDetail",
    folderImageUpload: "#assetThumbnail"
};

ModalAssetDetail.prototype.EVENT_TEMPLATE_LOADED = "TEMPLATE_MODAL_ASSET_DETAIL_LOADED";
ModalAssetDetail.prototype.TEMPLATE = null;

ModalAssetDetail.prototype.show = function (asset, userRoleId) {
    var that = this;
    var template = kendo.template(that.TEMPLATE.html());
    if (userRoleId == null) {
        userRoleId = 0;
    }
    asset.UserRoleId = userRoleId;
    that.Asset = asset;
    ModalAssetDetail.prototype.options.Asset = asset;
    var permissions = $.grep(that.Asset.Permissions, function(assetPermission) {
        return assetPermission.RoleId === userRoleId;
    }),
        permission = permissions[0],
        isAdmin = permission.IsAdmin;
    
    $.fancybox({
        content: template(asset),
        afterShow: function () {
            var fancybox = this.wrap;
            that.setupNameEdit(fancybox);
            that.setupTagsEdit(fancybox);
            that.setupDescEdit(fancybox);
            addArgosyActions(fancybox);
        }
    });
};
ModalAssetDetail.prototype.setupNameEdit = function (fancybox) {
    var that = this;
    var editor = fancybox.find("#nameViewEditor");
    var view = fancybox.find("#nameViewWrapper");
    var editButton = view.find("a");
    var saveButton = editor.find("a");
    var input = editor.find("input");
    var text = view.find("div.col_five_sixth");
    editor.hide();
    view.show();
    editButton.unbind("click");
    saveButton.unbind("click");
    editButton.bind("click", function (e) {
        view.hide();
        editor.show();
    });
    saveButton.bind("click", function (e) {
        var previousName = that.Asset.Name;
        var newName = input.val();
        if (previousName != newName) {
            $.ajax({
                url: "/Tools/DigitalAssets/SaveAssetName",
                data: {
                    assetId: that.Asset.Id,
                    name: newName
                },
                dataType: "json",
                success: function (result) {
                    if (result.ReturnCode != "200") {
                        prompt.notify({
                            question: "There was an error saving your name! Ref: " + result.Guid,
                            type: "error"
                        });
                    } else {
                        prompt.notify({
                            question: "Your name was updated successfully!",
                            type: "success"
                        });
                        var listView = $("div[data-argosy-view='MvcAssetListView']").data("kendoListView"),
                            grid = $("div[data-argosy-view='MvcAssetGridView']").data("kendoGrid");
                        listView.dataSource.read();
                        grid.dataSource.read();

                        text.html(newName);
                        view.show();
                        editor.hide();
                    }
                }
            });
        } else {
            view.show();
            editor.hide();
        }
    });
};
ModalAssetDetail.prototype.setupDescEdit = function (fancybox) {
    var that = this;
    var editor = fancybox.find("#descViewEditor");
    var view = fancybox.find("#descViewWrapper");
    var editButton = view.find("a");
    var saveButton = editor.find("a");
    var input = editor.find("textarea");
    var text = view.find("div.col_five_sixth");
    editor.hide();
    view.show();
    editButton.unbind("click");
    saveButton.unbind("click");
    editButton.bind("click", function (e) {
        view.hide();
        editor.show();
    });
    saveButton.bind("click", function (e) {
        var previousDesc = that.Asset.Description;
        var newDesc = input.val();
        if (previousDesc != newDesc) {
            $.ajax({
                url: "/Tools/DigitalAssets/SaveAssetDescription",
                data: {
                    assetId: that.Asset.Id,
                    description: newDesc
                },
                dataType: "json",
                success: function (result) {
                    if (result.ReturnCode != "200") {
                        prompt.notify({
                            question: "There was an error saving your description! Ref: " + result.Guid,
                            type: "error"
                        });
                    } else {
                        prompt.notify({
                            question: "Your description was updated successfully!",
                            type: "success"
                        });
                        jQuery("div[data-argosy-view='MvcAssetListView']")
                            .data("kendoListView").dataSource.read();
                        text.html(newDesc);
                        view.show();
                        editor.hide();
                    }
                }
            });
        } else {
            view.show();
            editor.hide();
        }
    });
};
ModalAssetDetail.prototype.setupTagsEdit = function (fancybox) {
    var that = this;
    var input = fancybox.find("#tagsWrapper").find("input");
    var save = fancybox.find("#tagsWrapper").find(".fa-save");
    var inclusionInput = fancybox.find("#inclusionTagsWrapper").find("input");
    var inclusionSave = fancybox.find("#inclusionTagsWrapper").find(".fa-save");
    var exclusionInput = fancybox.find("#exlusionTagsWrapper").find("input");
    var exclusionSave = fancybox.find("#exlusionTagsWrapper").find(".fa-save");
    that.setupAssetTagMultiSelect(input, "/Tools/DigitalAssets/GetAssetTags/?tagPrefix=");
    that.setupAssetTagMultiSelect(inclusionInput, "/Tools/DigitalAssets/GetInclusionTags/?tagPrefix=");
    that.setupAssetTagMultiSelect(exclusionInput, "/Tools/DigitalAssets/GetExclusionTags/?tagPrefix=");
    that.setupSaveAssetTags(save, input, "/Tools/DigitalAssets/SaveAssetTags");
    that.setupSaveAssetTags(inclusionSave, inclusionInput, "/Tools/DigitalAssets/SaveInclusionTags", "inclusion");
    that.setupSaveAssetTags(exclusionSave, exclusionInput, "/Tools/DigitalAssets/SaveExclusionTags", "exclusion");
};
ModalAssetDetail.prototype.setupSaveAssetTags = function (element, input, url, type) {
    var that = this;
    element = $(element);
    input = $(input).getKendoMultiSelect();
    element.click(function(e) {
        var values = input.value();
        $.ajax({
            url: url,
            data: {
                assetId: that.Asset.Id,
                assetTags: values
            },
            dataType: "json",
            success: function (result) {
                if (result.ReturnCode != "200") {
                    prompt.notify({
                        question: "There was an error saving your tags! Ref: " + result.Guid,
                        type: "error"
                    });
                } else {
                    prompt.notify({
                        question: "Your tags were updated successfully!",
                        type: "success"
                    });
                    $(document).trigger(argosyEvents.UPDATE_ASSET_TAGS, {
                        assetId: that.Asset.Id,
                        json: result.Records,
                        type: type
                    });
                }
            }
        });
    });
};

ModalAssetDetail.prototype.setupAssetTagMultiSelect = function (element, url) {
    var that = this;
    element = $(element);
    var cleanValues = [];
    var attribute = element.attr("data-argosy-tags");
    if (attribute != null && attribute.length > 0) {
        var values = eval(attribute);
        if (values != null) {
            $(values).each(function(i) {
                cleanValues.push(htmlDecode(this));
            });
        }
    }
    element.kendoMultiSelect({
        placeholder: "Start entering tags and hit save...",
        autoBind: false,
        delay: 250,
        dataSource: {
            type: "odata",
            serverFiltering: true,
            schema: {
                data: function(response) {
                    return response.Records;
                },
                total: function(response) {
                    return response.TotalRecords;
                }
            },
            transport: {
                read: function (options) {
                    var filter = options.data.filter;
                    var startsWith = (filter == null || filter.filters == null || filter.filters.length == 0 ? "" : filter.filters[0].value);
                    $.ajax({
                        url: url + startsWith,
                        dataType: "json",
                        success: function (result) {
                            if (startsWith !== "") {
                                result.Records.push(startsWith);
                            }
                            if (result.Records[0] === "") {
                                result.Records.splice(0, 1);
                            }
                            options.success(result);
                        },
                        error: function(result) {
                            options.error(result);
                        }
                    });
                }
            }
        },
        dataBound: function(e) {
            $.fancybox.update();
        },
        value: cleanValues
    });

};

ModalAssetDetail.prototype.SaveAssetThumbnail = function () {
    var that = this;
    if ($(that.baseOptions.folderImageUpload).get(0).files[0] != undefined) {
        var formData = new FormData();
        formData.append("assetId", that.options.Asset.Id);
        formData.append("file", $(that.baseOptions.folderImageUpload).get(0).files[0], $(that.baseOptions.folderImageUpload).get(0).files[0].name);
        $.ajax({
            url: "/Tools/DigitalAssets/UpdateAssetThumbnail",
            contentType: false,
            processData: false,
            method: "POST",
            data: formData,
            success: function (response) {
                if (response.ReturnCode == 200) {
                    prompt.notify({
                        question: "Asset thumbnail updated succesfully.",
                        type: "success"
                    });
                    $(document).trigger(argosyEvents.REFRESH_ASSET_DIRECTORY);
                    setTimeout(function () {
                        $(document).trigger(argosyEvents.SHOW_ASSET_DETAILS_MODAL, ModalAssetDetail.prototype.options.Asset.Id);
                    }, 5000);
                    
                } else {
                    prompt.notify({
                        question: "There was an error saving your asset! Ref: " + response.Guid,
                        type: "error"
                    });
                }
            }

        });
    }
}