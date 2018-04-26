function DamDirectoryView(opts) {
    var that = this,
        controlLoader = new ControlLoader();
    $.extend(true, that.options, that.baseOptions, opts);
    that.setupEventListeners();
    controlLoader.loadTemplate("DamDirectoryView", function (template) {
        $(document.body).append(template);
        that.init();
    });
}

DamDirectoryView.prototype.options = {
    viewModel: null,
    dropTarget: null,
    enableDragAndDrop: true
};

DamDirectoryView.prototype.setupEventListeners = function () {
    $(document).bind(argosyEvents.ASSET_DIRECTORY_CREATED, function (e, result) {
        DamDirectoryView.prototype.options.viewModel.directories.read();
    });
}

DamDirectoryView.prototype.init = function() {
    var that = this;
    if (that.options.viewModel == null) {
        that.options.viewModel = new kendo.data.ObservableObject({
            directories: new kendo.data.HierarchicalDataSource({
                transport: {
                    read: {
                        url: "/Tools/DigitalAssets/GetDirectories"
                    }
                },
                schema: {
                    model: {
                        id: "ID",
                        hasChildren: "HasChildren"
                    },
                    data: "Records",
                    total: "Records.length"
                }
            }),
            change: function (e) {

                var folderRights = DamFolderRights.prototype,
                    viewModel = null;
                if (folderRights != null) {
                    viewModel = folderRights.options.viewModel;
                };
                if (e.sender.select().length > 0) {
                    var item = e.sender.select()[0],
                        dataItem = e.sender.dataItem(item);
                    e.sender.expand(item);
                    if (dataItem.hasChildren && (dataItem.children.data() == null || dataItem.children.data().length === 0)) {
                        dataItem.load();
                    };
                    if (dataItem.ID > 0) {
                        $("div[data-id='damListView'], #divDAMResults").show();
                        $("div[data-id='addFolder']").hide();
                        var currentAssetGroup;
                        if (viewModel != null) {
                            currentAssetGroup = viewModel.get("currentAssetGroup");
                            if (currentAssetGroup != null) {
                                if (currentAssetGroup.dirty) {
                                    prompt.alert({
                                        question: "You have unsaved changes.",
                                        description: "Are you sure you want to continue?",
                                        type: "warning",
                                        button: "Save Changes",
                                        buttonNo: "Continue",
                                        buttonNoHidden: false,
                                        yes: function () {
                                            viewModel.assetGroupSource.sync();
                                            $.fancybox.close();
                                        },
                                        no: function () {
                                            viewModel.assetGroupSource.read();
                                            $.fancybox.close();
                                        }
                                    });
                                } else if (currentAssetGroup.ID !== dataItem.Id) {
                                    viewModel.assetGroupSource.read();
                                };
                            } else {
                                viewModel.assetGroupSource.read();
                            };
                        } else {
                            $(document).trigger(argosyEvents.ASSET_DIRECTORY_CHANGED,
                                {
                                    Id: dataItem.ID,
                                    Name: dataItem.Text,
                                    Description: dataItem.Description,
                                    uid: dataItem.uid
                                });
                        };
                    } else if (dataItem.ID === 0) {
                        if (MvcAssetView.prototype != null) {
                            MvcAssetView.prototype.options.includeFolders = true;
                        };
                        //$("div[data-id='damListView'], #divDAMResults").hide();
                        $("div[data-id='addFolder']").show();
                        _.forEach(dataItem.children.data(), function (child) {
                            var treeItem = e.sender.findByUid(child.uid);
                            e.sender.collapse(treeItem);
                        });
                        $(document).trigger(argosyEvents.ASSET_DIRECTORY_CHANGED,
                            {
                                Id: dataItem.ID,
                                Name: dataItem.Text,
                                Description: dataItem.Description,
                                uid: dataItem.uid
                            });
                    };
                };
            },
            dataBound: function (e) {
                $.each(e.sender.items(), function (i, item) {
                    if (i === 0) {
                        e.sender.expand(item);
                    };
                    if (that.options.enableDragAndDrop) {
                        $(item).kendoDropTarget({
                            drop: function (f) {
                                var listView = $("div[data-argosy-view='MvcAssetListView']").data("kendoListView"),
                                    grid = $("div[data-argosy-view='MvcAssetGridView']").data("kendoGrid"),
                                    listSource = listView.dataItem(f.draggable.currentTarget),
                                    gridSource = grid.dataItem(f.draggable.currentTarget),
                                    treeView = $("ul[data-argosy-control='DamDirectoryView']").data("kendoTreeView"),
                                    source = null, assetType = null,
                                    destination = treeView.dataItem(f.dropTarget);
                                if (listSource != null) {
                                    assetType = listSource.AssetItemType;
                                    source = treeView.dataSource.get(listSource.AssetGroupId);
                                } else if (gridSource != null) {
                                    assetType = gridSource.AssetItemType;
                                    source = treeView.dataSource.get(gridSource.AssetGroupId);
                                };
                                switch (assetType) {
                                    case "File":
                                        $(document).trigger(argosyEvents.MOVE_ASSETS_TO_FOLDER, destination);
                                        break;
                                    case "Folder":
                                        that.options.viewModel.moveAssetFolder(destination, source);
                                        break;
                                };
                            }
                        });
                    }
                });
                if (e.sender.select().length === 0) {
                    var folderRights = DamFolderRights.prototype,
                        viewModel = null,
                        currentAssetGroup = null;
                    if (folderRights != null) {
                        viewModel = folderRights.options.viewModel;
                    };
                    if (viewModel != null) {
                        currentAssetGroup = viewModel.get("currentAssetGroup");
                    };
                    if (currentAssetGroup != null) {
                        var dataItem = e.sender.dataSource.get(currentAssetGroup.get("ID")),
                            item = null;
                        if (dataItem != null) {
                            item = e.sender.findByUid(dataItem.uid);
                        };
                        if (item != null) {
                            e.sender.select(item);
                        };
                    } else {
                        e.sender.select(e.sender.items()[0]);
                    };
                };
            },
            treeView: null,
            drop: function (e) {
                if (DamDirectoryView.prototype.options.enableDragAndDrop) {
                    DamDirectoryView.prototype.options.dropTarget = $.extend(true, e);
                    var message = {
                        question: "Do you want to move this asset?",
                        description: "",
                        button: "Confirm",
                        buttonNo: "Cancel",
                        buttonNoHidden: false,
                        type: "warning",
                        yes: function (e) {
                            if (typeof (e.preventDefault) === "function") {
                                var that = DamDirectoryView.prototype.options;
                                var f = that.dropTarget;
                                var source = f.sender.dataItem(f.sourceNode),
                                    destination = f.sender.dataItem(f.destinationNode);
                                f.data.moveAssetFolder(destination, source);
                            }
                        },
                        no: function (e) {
                            DamDirectoryView.prototype.options.dropTarget.preventDefault();
                            DamDirectoryView.prototype.options.viewModel.directories.read();
                            $.fancybox.close();
                        }

                    };
                    prompt.alert(message);
                } else {
                    e.preventDefault();
                }

            },
            moveAssetFolder: function (targetDirectory, directory) {
                $(document).trigger(argosyEvents.START_LOADING);
                $.ajax({
                    url: "/tools/digitalassets/MoveAssetFolder",
                    dataType: "json",
                    method: "POST",
                    data: {
                        parentAssetGroupId: targetDirectory.ID,
                        assetGroupId: directory.ID
                    },
                    success: function (result) {
                        if (result.ReturnCode !== "200") {
                            prompt.clientResponseError(result);
                        } else {
                            prompt.notify({
                                question: "Your folder was moved successfully!",
                                type: "success"
                            });
                        };
                    },
                    error: function (result) {
                        options.error(result);
                    },
                    complete: function () {
                        $(document).trigger(argosyEvents.END_LOADING);
                    }
                });
            },
            addFolder: function () {
                if (MvcAssetView.prototype != null) {
                    MvcAssetView.prototype.addFolder();
                };
            }
        });
        kendo.bind($("div[data-id='damTreeView'], div[data-id='addFolder']"), that.options.viewModel);
    }

};