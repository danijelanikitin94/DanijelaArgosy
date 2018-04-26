function DamFolderRights(opts) {
    var that = this,
        controlLoader = new ControlLoader();
    $.extend(true, that.options, that.baseOptions, opts);
    controlLoader.loadTemplate("DamFolderRights", function (template) {
        $(document.body).append(template);
        that.options.viewModel = that.getViewModel();
        that.initialize();
    });
}

DamFolderRights.prototype.options = {
    viewModel: null,
    isBound: false
};

DamFolderRights.prototype.initialize = function () {
    var that = this,
        button = $(".btn-success");
    button.click(function () {
        var treeView = $("ul[data-role='treeview']").data("kendoTreeView"),
            directory = treeView.select()[0],
            directoryData = treeView.dataItem(directory);
        if (directoryData.hasChildren) {
            prompt.alert({
                question: "Apply changes to all sub directores?",
                type: "warning",
                buttonNoHidden: false,
                buttonNo: "Just this Directory",
                button: "Apply to All",
                yes: function(e) {
                    if (typeof (e.preventDefault) === "function") {
                        that.options.viewModel.set("cascadeChanges", true);
                        that.options.viewModel.assetGroupSource.sync();
                        $.fancybox.close();
                    };
                },
                no: function(e) {
                    if (typeof (e.preventDefault) === "function") {
                        that.options.viewModel.set("cascadeChanges", false);
                        that.options.viewModel.assetGroupSource.sync();
                        $.fancybox.close();
                    };
                }
            });
        } else {
            that.options.viewModel.assetGroupSource.sync();
        };
    });
    
    $(document).bind(argosyEvents.KENDO_EDITOR_IMAGE_UPLOADED, function (e, data, controlId) {
        if (DamFolderRights.prototype.options.viewModel.assetGroupSource.data()[0] != undefined) {
            DamFolderRights.prototype.options.viewModel.assetGroupSource.data()[0].set("IMAGE_FILE_PATH", data.UploadFileUrl);
        }
    });
    $(document).bind(argosyEvents.KENDO_EDITOR_IMAGE_REMOVED, function (e, data, controlId) {
        if (DamFolderRights.prototype.options.viewModel.assetGroupSource.data()[0] != undefined) {
            DamFolderRights.prototype.options.viewModel.assetGroupSource.data()[0].set("IMAGE_FILE_PATH", "");
        }
    });
}

DamFolderRights.prototype.getViewModel = function () {
    var that = this,
        viewModel = kendo.observable({
            click: function (e) {
                var listView = $("tbody[data-id='assetPermissionsListView']").data("kendoListView"),
                    permission = listView.dataSource.get(e.data.RoleId),
                    property = $(e.target).data("property"),
                    enabled = permission[property];
                if (!permission.IsAdmin) {
                    permission.set(property, !enabled);
                    listView.dataSource.sync();
                };
            },
            assetGroupSource: new kendo.data.DataSource({
                transport: {
                    read: {
                        url: "/tools/digitalassets/GetAssetGroup/",
                        dataType: "json",
                        method: "POST",
                        type: "POST",
                        complete: function () {
                            var currentAssetGroup = that.options.viewModel.assetGroupSource.data()[0];
                            that.options.viewModel.set("currentAssetGroup", currentAssetGroup);
                            that.options.viewModel.updateView();
                        }
                    },

                    update: {
                        url: "/tools/digitalassets/UpdateAssetGroupDetails/",
                        dataType: "json",
                        contentType: "application/json",
                        method: "POST",
                        complete: function (response) {
                            if (response.status === 200) {
                                var currentAssetGroup = that.options.viewModel.get("currentAssetGroup"),
                                    treeView = $("ul[data-role='treeview']").data("kendoTreeView");
                                if (currentAssetGroup == null) {
                                    currentAssetGroup = that.options.viewModel.assetGroupSource.data()[0];
                                    that.options.viewModel.set("currentAssetGroup", currentAssetGroup);
                                };
                                currentAssetGroup.dirty = false;
                                that.options.viewModel.assetGroupSource.read();
                                treeView.dataSource.read();
                                
                                prompt.notify({
                                    question: "Access group details updated successfully",
                                    type: "success"
                                });
                            } else {
                                prompt.clientResponseError(result);
                            };
                        }
                    },
                    parameterMap: function (data, type) {
                        if (type === "read") {
                            var treeView = $("ul[data-role='treeview']").data("kendoTreeView"),
                                selectedItem = treeView.select()[0],
                                selectedData = treeView.dataItem(selectedItem);
                            data.id = selectedData.ID;
                        } else {
                            data.assetGroupId = that.options.viewModel.currentAssetGroup.ID;
                            data.cascadeChanges = that.options.viewModel.cascadeChanges;
                            data = kendo.stringify(data);
                        };
                        return data;
                    }
                },
                schema: {
                    data: function (response) {
                        return [response.Records];
                    },
                    total: function (response) {
                        return [response.Records].length;
                    },
                    model: {
                        id: "ID"
                    }
                },
                requestEnd: function (e) {
                }
            }),
            permissionSource: new kendo.data.DataSource({
                transport: {
                    read: {
                        url: "/tools/digitalassets/GetAssetGroupPermissions/",
                        dataType: "json"
                    },
                    update: {
                        url: "/tools/digitalassets/UpdateAssetGroupPermissions/",
                        dataType: "json",
                        contentType: "application/json",
                        method: "POST",
                        complete: function (response) {
                            if (response.status === 200) {
                                prompt.notify({
                                    question: "Access group permission updated successfully",
                                    type: "success"
                                });
                            } else {
                                prompt.clientResponseError(result);
                            };
                        }
                    },
                    parameterMap: function (data, type) {
                        if (type === "read") {
                            var treeViw = $("ul[data-role='treeview']").data("kendoTreeView"),
                                selectedItem = treeViw.select()[0],
                                selectedData = treeViw.dataItem(selectedItem);
                            data.assetGroupId = selectedData.ID;
                        } else {
                            data = kendo.stringify({
                                assetGroupId: that.options.viewModel.currentAssetGroup.ID,
                                permissions: [data],
                                cascadeChanges: that.options.viewModel.cascadeChanges
                            });
                        };
                        return data;
                    }
                },
                schema: {
                    data: function (response) {
                        return response.Records;
                    },
                    total: function (response) {
                        return response.Records.length;
                    },
                    model: {
                        id: "RoleId"
                    }
                }
            }),
            cascadeChanges: false,
            currentAssetGroup: null,
            updateView: function () {
                var assetGroup = that.options.viewModel.get("currentAssetGroup"),
                    listView = $("div[data-id='damListView']"),
                    treeView = $("ul[data-role='treeview']").data("kendoTreeView"),
                    button = $(".btn-success");
                if (assetGroup != null) {
                    if (assetGroup.get("ID") > 0) {
                        listView.empty();
                        listView.append(kendo.Template.compile($("#_assetGroupDetailsTemplate").html())(that.options.viewModel));
                        kendo.bind(listView, that.options.viewModel);
                        that.options.viewModel.permissionSource.read();
                        listView.show();
                        button.show();
                    };
                } else {
                    if (treeView != null && treeView.select().length > 0) {
                        var item = treeView.select()[0],
                            dataItem = treeView.dataItem(item);
                        if (dataItem.Id > 0) {
                            that.options.viewModel.assetGroupSource.read();
                        }
                    };
                    listView.hide();
                    button.hide();
                };
            }
        });
    return viewModel;
}