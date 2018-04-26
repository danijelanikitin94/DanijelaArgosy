function MvcAssetView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();
    controlLoader.loadControl("ModalAssetDetail", {}, function (control) {
        that.assetDetailControl = control;
    });
    controlLoader.loadControl("ModalAssetUsage", {}, function (control) {
        that.assetUsageControl = control;
    });
    controlLoader.loadControl("ModalShareAsset", {}, function (control) {
        that.assetShareControl = control;
    });
    that.setupEventListeners();
    controlLoader.loadTemplate("MvcAssetView", function (template) {
        $(document.body).append(template);
        $("*[data-argosy-uuid='" + that.options.uuid + "']").append($(that.options.assetViewTemplateHref).html());
        that.dataSource = that.getDataSource();
        that.setupLoadingAttributes();
        that.setupListView();
        that.setupGridView();
        that.setupPagerView();
        that.setupMenuOptions();
        that.setupDefaultOptions();
        that.setupViewButtons();
        that.updateTitle();
        that.read();
        that.loaded = true;
        addArgosyActions($(that.options.actionHref));
        $(document).trigger(that.EVENT_TEMPLATE_LOADED);
    });
}

MvcAssetView.prototype.options = {};

MvcAssetView.prototype.baseOptions = {
    listViewHref: "div[data-argosy-view=MvcAssetListView]",
    gridViewHref: "div[data-argosy-view=MvcAssetGridView]",
    treeViewHref: "ul[data-argosy-control='DamDirectoryView']",
    masonryViewHref: "div[data-argosy-view=MvcAssetMasonryView]",
    availableFormatsHref: "div[data-argosy-view=availableFormatsGrid]",
    pagerHref: "div[data-argosy-view=MvcAssetViewPager]",
    sortBySelector: "select[data-argosy-view=MvcAssetViewSort]",
    filterBySelector: "select[data-argosy-view=MvcAssetViewFilter]",
    sortByTextSelector: "*[data-argosy-view=MvcAssetViewSortText]",
    filterByTextSelector: "*[data-argosy-view=MvcAssetViewFilterText]",
    showGridViewSelector: "a[data-argosy-view=MvcAssetGridViewSelector]",
    showListViewSelector: "a[data-argosy-view=MvcAssetListViewSelector]",
    showMasonryViewSelector: "a[data-argosy-view=MvcAssetMasonryViewSelector]",
    titleHref: "*[data-argosy-view=MvcAssetViewTitle]",
    actionHref: "*[data-argosy-view=MvcAssetViewActions]",
    descriptionHref: "*[data-argosy-view=MvcAssetViewDescription]",
    showDetailsHref: "*[data-argosy-view=MvcAssetViewShowDetails]",
    assetViewTemplateHref: "#_AssetViewTemplate",
    keywordSearchSelector: "input.search",
    historyTitleElment: "[rel='historyTitleElement']",
    createAssetFolderTemplate: "#_MvcAssetViewAddFolder",
    createAssetHref: "*[data-argosy-view='mvcAssetViewAddFolder']",
    assetViewCartStep1Template: "#_MvcAssetViewCartStep1Template",
    assetViewCartStep2Template: "#_MvcAssetViewCartStep2Template",
    assetViewDetailsTemplate: "#_MvcAssetViewDetailsTemplate",
    folderImageUpload: "#folderThumbnail",
    filterByCategory: false,
    assetToggle: "#chDAM",
    category: "",
    initialSortOrder: "relevance",
    initialAssetGroupId: null,
    includeDeleted: false,
    currentView: "list",
    showPricing: true,
    showEstShip: true,
    showTitle: true,
    showActions: true,
    showSort: true,
    showFilter: true,
    showDescription: true,
    includeFolders: null,
    showCompanyLinks: true,
    enableDragDrop: false,
    userRoleId: 0,
    enableEdit: false,
    currentKeywordSearch: "",
    currentSearch: {
        AssetGroupId: 0,
        Keyword: decodeURIComponent(getQuerystring("searchFor", "")),
        Name: "",
        TypeId: "",
        MinDpi: 0,
        MaxDpi: 0,
        IsDeleted: false,
        SortOption: "AssetAsc",
        FilterOption: "All",
        DirectoryName: "Root"
    }
};

MvcAssetView.prototype.EVENT_TEMPLATE_LOADED = "TEMPLATE_ASSET_VIEW_LOADED";
MvcAssetView.prototype.EVENT_LISTENERS_LOADED = "ASSET_VIEW_LISTENERS_LOADED";
MvcAssetView.prototype.EVENT_DATABOUND = "ASSET_VIEW_DATABOUND";
MvcAssetView.prototype.assetDetailControl = null;
MvcAssetView.prototype.assetUsageControl = null;
MvcAssetView.prototype.assetShareControl = null;
MvcAssetView.prototype.loaded = false;

MvcAssetView.prototype.enableFeature = function() {
    var that = this;
    var width = $(window).width();
    if (width <= 760) {
        return false;
    } else {
        return true;
    }
}

MvcAssetView.prototype.addFolder = function () {
    var that = this,
        html = $(that.options.createAssetFolderTemplate).html(),
        kendoTemplate = kendo.template(html),
        result = kendoTemplate({ Name: that.options.currentSearch.DirectoryName });
    $.fancybox({
        content: result
    });
    $(".btn-createFolder").unbind("click").click(function () {
        var name = $(that.options.createAssetHref).find("#folderName").val();
        that.doesFolderExist(name);
    });
};

MvcAssetView.prototype.updateTitle = function () {
    var that = this;
    if (that.options.categoryDesc != null && that.options.categoryDesc.length > 0) {
        $(that.options.descriptionHref).html(decodeURIComponent(that.options.categoryDesc));
        $(that.options.descriptionHref).show();
    } else {
        $(that.options.descriptionHref).hide();
    }
    $(that.options.titleHref).html(decodeURIComponent(that.options.category));
    if (!that.options.showDescription) {
        $(that.options.descriptionHref).hide();
    }
    if (!that.options.showTitle) {
        $(that.options.titleHref).hide();
    }
};

MvcAssetView.prototype.setupDefaultOptions = function () {
    var that = this;
    if (that.options.initialSortOrder != null) {
        that.options.currentSearch.SortOption = that.options.initialSortOrder;
    }
    that.options.currentSearch.AssetGroupId = that.options.initialAssetGroupId;
};

MvcAssetView.prototype.setupLoadingAttributes = function () {
    var that = this;
    var mainElement = $("*[data-argosy-uuid='" + that.options.uuid + "']");
    appendLoadingAttribute(mainElement, that.constructor.name);
    mainElement.attr("data-argosy-loading-message", "~{MsgLoadingYourAssets}~");
    appendLoadingAttribute($("*[data-argosy-control='MvcAssetCategories']"), that.constructor.name);
};

MvcAssetView.prototype.updateGroupPermission = function (permission) {
    var that = this;
    if (permission == null) {
        that.enableUpload(false);
        that.enableDelete(false);
        that.enableEdit(false);
    } else {
        that.enableUpload(permission.CanUpload);
        that.enableEdit(permission.CanEdit);
        that.enableDelete(permission.CanDelete);
    }
};

MvcAssetView.prototype.enableEdit = function (enableEdit) {
    var that = this;
    if (enableEdit == null) {
        enableEdit = false;
    }
    that.options.enableEdit = enableEdit;
};

MvcAssetView.prototype._uploadOption = null;

MvcAssetView.prototype.enableUpload = function (enableUpload) {
    var that = this;
    if (enableUpload == null) {
        enableUpload = false;
    }
    var ddl = $("select[data-argosy-action=asset-action-change]").getKendoDropDownList();
    var uploadIndex = null;
    $(ddl.dataSource.data()).each(function (i) {
        if (this.value.toLowerCase() == "upload") {
            uploadIndex = i;
        }
    });

    if (enableUpload) {
        if (uploadIndex == null) {
            ddl.dataSource.add(that._uploadOption);
        }
    } else {
        that._uploadOption = ddl.dataSource.data()[uploadIndex];
        if (that._uploadOption != null) {
            ddl.dataSource.remove(that._uploadOption);
        };
    }
};

MvcAssetView.prototype._deleteOption = null;

MvcAssetView.prototype.enableDelete = function (enableDelete) {
    var that = this;
    if (enableDelete == null) {
        enableDelete = false;
    }
    var ddl = $("select[data-argosy-action=asset-action-change]").getKendoDropDownList();
    var deleteIndex = null;
    $(ddl.dataSource.data()).each(function(i) {
        if (this.value.toLowerCase() == "delete") {
            deleteIndex = i;
        }
    });
    if (enableDelete) {
        if (deleteIndex == null) {
            ddl.dataSource.add(that._deleteOption);
        }
    } else {
        that._deleteOption = ddl.dataSource.data()[deleteIndex];
        if (that._deleteOption != null) {
            ddl.dataSource.remove(that._deleteOption);
        };
    }
};

MvcAssetView.prototype.setupEventListeners = function () {
    var that = this;
    var isWidth = function (value) {
        return value.indexOf("width") >= 0;
    };
    var isHeight = function (value) {
        return value.indexOf("height") >= 0;
    }
    var isPixel = function (value) {
        return value.indexOf("pixel") >= 0;
    }
    var isInches = function (value) {
        return value.indexOf("inches") >= 0;
    }
    var isDpi = function (value) {
        return value.indexOf("dpi") >= 0;
    }
    var isFormat = function (value) {
        return value.indexOf("format") >= 0;
    }

    $(document).bind(argosyEvents.FULL_TEXT_SEARCH, function (e, search) {
        var control = that;
        control.options.currentSearch = search.currentAssetSearch;
        if (control.loaded) {
            if (search.read) {
                control.read();
            }
        } else {
            $(document).bind(control.EVENT_TEMPLATE_LOADED, function (e) {
                if (search.read) {
                    control.read();
                }
            });
        }
    });
    $(document).bind(argosyEvents.ASSET_DIRECTORY_CHANGED, function (e, directory) {
        that.options.categoryDesc = directory.Description;
        that.updateTitle();
        var previousId = that.options.currentSearch.AssetGroupId;
        var previousName = that.options.currentSearch.DirectoryName;
        var previousDeleted = that.options.currentSearch.IsDeleted;

        that.options.currentSearch.AssetGroupId = directory.Id;
        that.options.currentSearch.DirectoryName = directory.Name;
        if (directory.Name == "Deleted Items") {
            that.options.currentSearch.IsDeleted = null;
        } else {
            that.options.currentSearch.IsDeleted = false;
        }
        $.ajax({
            url: "/tools/digitalassets/GetAssetGroupPermission",
            dataType: "json",
            method: "POST",
            data: {
                assetGroupId: directory.Id,
                assetRoleId: that.options.userRoleId
            },
            success: function (result) {
                if (result.ReturnCode != "200" || !result.Records.CanView) {
                    that.options.currentSearch.AssetGroupId = previousId;
                    that.options.currentSearch.DirectoryName = previousName;
                    that.options.currentSearch.IsDeleted = previousDeleted;
                    if (result.ReturnCode != "200") {
                        prompt.clientResponseError(result);
                    } else {
                        prompt.alert({
                            question: "~{NoPermissionViewFolder}~",
                            description: "~{SelectDifferentDirectoryTryAgain}~",
                            type: "error",
                            yes: function (e) {
                                $.fancybox.close();
                            }
                        });
                    }
                } else {
                    that.updateGroupPermission(result.Records);
                    var treeView = $("ul[data-argosy-control='DamDirectoryView']").data("kendoTreeView"),
                        findDirectory = function (directories) {
                            var foundDirectory;
                            $.each(directories, function (i, directoryItem) {
                                if (foundDirectory == null && directoryItem.ID === parseInt(directory.Id)) {
                                    foundDirectory = directoryItem;
                                };
                                if (foundDirectory == null && directoryItem.hasChildren) {
                                    foundDirectory = findDirectory(directoryItem.children.data());
                                };
                            });
                            return foundDirectory;
                        },
                        folder = findDirectory(treeView.dataItems()),
                        item;
                    if (folder != null) {
                        item = treeView.findByUid(folder.uid);
                        if (treeView.select().length === 0) {
                            treeView.select(item);
                        } else if (treeView.select().length > 0) {
                            var selected = treeView.select()[0],
                                selectedItem = treeView.dataItem(selected);
                            if (selectedItem.ID !== directory.Id) {
                                treeView.select(item);
                            };
                        };
                    } else {
                        var node = new kendo.data.Node({
                            id: directory.Id,
                            ID: directory.Id,
                            Text: directory.Name,
                            SpriteCssClass: directory.IconClass,
                            hasChildren: directory.HasChildren,
                            HasChildren: directory.HasChildren
                        }),
                            nodes = treeView.dataItems()[0].children;

                        nodes.add(node);
                        var deletedItems = nodes.data()[node.index - 1];
                        nodes.remove(deletedItems);
                        nodes.sort({
                            field: "Text",
                            dir: "asc"
                        });
                        nodes.add(deletedItems);
                        item = treeView.findByUid(node.uid);
                        treeView.select(item);
                    };
                    that.read(1);
                }
            },
            error: function (result) {
                options.error(result);
            }
        });
    });

    $(document).bind(argosyEvents.REFRESH_ASSET_DIRECTORY, function (e) {
        that.read(1);
    });

    $(document).bind(argosyEvents.SHOW_ASSET_DETAILS_MODAL, function (e, assetId) {
        var asset = that.getAsset(parseInt(assetId));
        if (that.assetDetailControl != null) {
            that.assetDetailControl.show(asset, that.options.userRoleId);
        }
    });

    $(document).bind(argosyEvents.SHOW_ASSET_USAGE_MODAL, function (e, data) {
        if (that.assetUsageControl != null) {
            that.assetUsageControl.show(parseInt(data.assetId));
            $(that.options.historyTitleElment).html("~{AssetUsage}~");
        }
    });

    $(document).bind(argosyEvents.ADD_ASSET_TO_CART, function (e, assetId) {
        var asset = that.getAsset(parseInt(assetId));
        if (asset != null) {
            var html = $(that.options.assetViewCartStep1Template).html();
            var template = kendo.template(html);
            var result = template(asset);
            $.fancybox({
                content: result
            });
        }
    });

    $(document).bind(argosyEvents.UPDATE_ASSET_TAGS, function (e, asset) {
        that.updateAssetTagJson(parseInt(asset.assetId), asset.json, asset.type);
    }); 

    $(document).bind(argosyEvents.ADD_ASSET_TO_CART_FINAL, function (e, assetId) {
        var fancybox = $.fancybox.wrap;
        var allInputs = fancybox.find("[data-argosy-view=dimensions]");
        var width = 0;
        var height = 0;
        var dpi = 0;
        var formatId = 0;
        $(allInputs).each(function(i) {
            var input = $(this);
            var currentType = input.attr("data-argosy-type");
            if (isPixel(currentType) && isWidth(currentType)) {
                width = input.getKendoNumericTextBox().value();
            } else if (isPixel(currentType) && isHeight(currentType)) {
                height = input.getKendoNumericTextBox().value();
            } else if (isDpi(currentType)) {
                dpi = parseInt(input.val());
            } else if (isFormat(currentType)) {
                formatId = parseInt(input.val());
            }
        });

        if (width > 0 && height > 0 && dpi > 0) {
            that.addAssetToCart(assetId, formatId, width, height, dpi);
        }
    });

    $(document).bind(argosyEvents.ADD_ASSET_TO_CART2, function (e, formatSelection) {
        var asset = that.getAsset(parseInt(formatSelection.assetId));
        asset.format = that.getFormat(asset, parseInt(formatSelection.formatId));
        if (asset != null && formatSelection.formatId > 0) {
            var html = $(that.options.assetViewCartStep2Template).html();
            var template = kendo.template(html);
            var result = template(asset);
            $.fancybox({
                content: result,
                afterShow: function() {
                    var fancybox = this.wrap;
                    kendo.bind(fancybox);
                    fancybox.find("input").keyup(function (e) {
                        var newValue = parseFloat($(e.target).val());
                        var updatedInput = $(e.target).attr("data-argosy-type");
                        var allInputs = fancybox.find("[data-argosy-view=dimensions]");
                        var pixelWidth = null;
                        var pixelHeight = null;
                        if (isInches(updatedInput) && isHeight(updatedInput)) {
                            pixelHeight = asset.format.Dpi * newValue;
                            pixelWidth = pixelHeight * (asset.format.MaxWidth / asset.format.MaxHeight);
                        } else if (isInches(updatedInput) && isWidth(updatedInput)) {
                            pixelWidth = (asset.format.Dpi * newValue);
                            pixelHeight = pixelWidth * (asset.format.MaxHeight / asset.format.MaxWidth);
                        } else if (isPixel(updatedInput) && isHeight(updatedInput)) {
                            pixelHeight = newValue;
                            pixelWidth = pixelHeight * (asset.format.MaxWidth / asset.format.MaxHeight);
                        } else if (isPixel(updatedInput) && isWidth(updatedInput)) {
                            pixelWidth = newValue;
                            pixelHeight = pixelWidth * (asset.format.MaxHeight / asset.format.MaxWidth);
                        }

                        if (asset.format.MaxHeight < pixelHeight || asset.format.MaxWidth < pixelWidth) {
                            e.preventDefault(true);
                        }

                        var inchesWidth = pixelWidth / asset.format.Dpi;
                        var inchesHeight = pixelHeight / asset.format.Dpi;
                        
                            jsConsole.log("inchesWidth:  " + inchesWidth);
                            jsConsole.log("inchesHeight: " + inchesHeight);
                            jsConsole.log("pixelWidth:   " + pixelWidth);
                            jsConsole.log("pixelHeight:  " + pixelHeight);
                        
                        $(allInputs).each(function (e) {
                            var input = $(this);
                            var currentType = input.attr("data-argosy-type");
                            if (currentType != updatedInput) {
                                if (isPixel(currentType) && isHeight(currentType)) {
                                    input.getKendoNumericTextBox().value(pixelHeight);
                                } else if (isPixel(currentType) && isWidth(currentType)) {
                                    input.getKendoNumericTextBox().value(pixelWidth);
                                } else if (isInches(currentType) && isWidth(currentType)) {
                                    input.getKendoNumericTextBox().value(inchesWidth);
                                } else if (isInches(currentType) && isHeight(currentType)) {
                                    input.getKendoNumericTextBox().value(inchesHeight);
                                }
                            }
                        });
                    });
                }
            });
        } else {
            that.addAssetToCart(formatSelection.assetId, 0, asset.Width, asset.Height, asset.Dpi);
        }
    });

    $(document).bind(argosyEvents.DO_ASSET_ACTION, function (e, data) {
        if (that.assetUsageControl != null) {
            var action = data.action.toLowerCase();
            switch(action) {
                case "upload":
                    if (that.options.currentSearch.AssetGroupId > 0) {
                        $(document).trigger(argosyEvents.SHOW_ASSET_UPLOAD_MODAL, that.options.currentSearch.AssetGroupId);
                    } else {
                        prompt.alert({
                            question: "~{CanNotUploadAssetToRootFolder}~",
                            description: "~{SelectDirectoryTryAgain}~",
                            type: "error",
                            yes: function (e) {
                                $.fancybox.close();
                            }
                        });
                    }
                    break;
                case "addfolder":
                    that.addFolder();
                    break;
                case "delete":
                    that.promptFileFolderAction("You are about to delete ", "You have not selected any files or folders to delete.", function (files, folders) {
                        return files == 0 && folders == 0;
                    }, function (e, files, folders, selected) {
                        $.ajax({
                            url: "/tools/digitalassets/DeleteAssetItems",
                            dataType: "json",
                            method: "POST",
                            data: {
                                items: JSON.stringify(selected)
                            },
                            success: function (result) {
                                if (result.ReturnCode != "200") {
                                    prompt.clientResponseError(result);
                                } else {
                                    that.read(1);
                                    prompt.alert({
                                        question: "~{ItemsDeletedSuccessfully}~",
                                        description: "~{TakesMinutesForChangessToAppear}~",
                                        type: "success",
                                        yes: function (e) {
                                            $.fancybox.close();
                                        }
                                    });
                                }
                            },
                            error: function (result) {
                                options.error(result);
                            }
                        });
                    });
                    break;
            }
        }
    });
    $(document).bind(argosyEvents.SELECT_ALL_ASSETS, function (e, data) {
        if (that.listView != null) {
            if (data.isChecked) {
                that.listView.select(that.listView.element.find("*[role='option']"));
            } else {
                that.listView.clearSelection();
            }
        }
        if (that.gridView != null) {
            if (data.isChecked) {
                that.gridView.select(that.gridView.element.children().find("tbody > tr"));
            } else {
                that.gridView.clearSelection();
            }
        }
    }); 

    $(document).bind(argosyEvents.SHOW_SHARE_ASSET_MODAL, function (e, assetId) {
        var asset;
        $(that.dataSource.data()).each(function() {
            var item = this;
            if (item.Id === assetId) {
                asset = item;
            }
        });
        if (asset && that.assetShareControl) {
            that.assetShareControl.show(asset);
        }
    });

    $(document).bind(argosyEvents.MOVE_ASSETS_TO_FOLDER, function (e, assetDirectory) {
        that.promptFileFolderAction("You are about to move ", "You can only move folders to the root directory.", function (files, folders) {
            return files > 0 && assetDirectory.Id == 0;
        }, function (e, files, folders, selected) {
            $.ajax({
                url: "/tools/digitalassets/MoveAssetItems",
                dataType: "json",
                method: "POST",
                data: {
                    assetGroupId: assetDirectory.Id,
                    items: JSON.stringify(selected)
                },
                success: function (result) {
                    if (result.ReturnCode != "200") {
                        prompt.clientResponseError(result);
                    } else {
                        if (folders === 0) {
                            $(document).trigger(argosyEvents.ASSET_DIRECTORY_CHANGED, assetDirectory);
                        };
                        prompt.notify({
                            question: "~{ItemsMovedSuccessfully}~",
                            description: "~{TakesMinutesForChangessToAppear}~",
                            type: "success"
                        });
                        var treeView = $("ul[data-argosy-control='DamDirectoryView']").data("kendoTreeView");
                        $.each(treeView.items(), function (i, item) {
                            var name = $(item).text().trim();
                            if (name === assetDirectory.Name) {
                                treeView.select(item);
                            };
                        });
                        $.fancybox.close();
                    }
                },
                error: function (result) {
                    options.error(result);
                }
            });
        });
    });

    $(document).trigger(that.EVENT_LISTENERS_LOADED);
};

MvcAssetView.prototype.addAssetToCart = function(assetId, downloadFormatId, width, height, dpi) {
    var that = this;
    $.ajax({
        url: "/tools/digitalassets/AddAssetToCart",
        dataType: "json",
        method: "POST",
        data: {
            assetId: assetId,
            downloadFormatId: downloadFormatId,
            height: parseInt(height),
            width: parseInt(width),
            dpi: dpi
        },
        success: function(result) {
            prompt.alert({
                question: "~{AssetsAddedToCart}~",
                description: "Click \"View Order\" for more information.",
                type: "success",
                buttonNo: "~{SelectMoreAssets}~",
                button: "~{Checkout}~",
                buttonNoIcon: "fa-plus",
                buttonNoHidden: false,
                no: function(e) {
                    $.fancybox.close();
                },
                yes: function(e) {
                    window.location = "/Tools/DigitalAssets/Cart";
                }
            });
        },
        error: function(result) {
            prompt.alert({
                question: "~{ErrorAddingAssetToCart}",
                description: "Ref: " + result,
                type: "error",
                yes: function(e) {
                    $.fancybox.close();
                }
            });
        }
    });
};

MvcAssetView.prototype.promptFileFolderAction = function(baseQuestion, failQuestion, failTest, doAction) {
    var that = this;
    var selected = that.getDataItems();
    var question = baseQuestion;
    var files = 0;
    var folders = 0;
    $(selected)
        .each(function(i) {
            if (this.AssetItemType == "Folder") {
                folders++;
            } else {
                files++;
            }
        });
    if (failTest(files, folders)) {
        prompt.alert({
            question: failQuestion,
            description: "",
            type: "warning",
            yes: function(e) {
                $.fancybox.close();
            }
        });
    } else {
        if (folders > 0) {
            question += folders + pluralize(" folder", folders) + (files > 0 ? " and " : "");
        }

        if (files > 0) {
            question += files + pluralize(" file", files);
        }
        question += ".";

        prompt.alert({
            question: question,
            description: "~{TakesMinutesForChangessToAppear}~",
            buttonNoHidden: false,
            buttonNo: "No",
            button: "Yes",
            type: "warning",
            yes: function (e) {
                if (typeof (e.preventDefault) === "function") {
                    doAction(e, files, folders, selected);
                };
            },
            no: function (e) {
                if (typeof (e.preventDefault) === "function") {
                    $.fancybox.close();
                };
            }
        });
    }
};

MvcAssetView.prototype.getDataItems = function() {
    var that = this;
    var dataItems = [];
    switch (that.currentView) {
    case "list":
        $(that.listView.select())
            .each(function(i) {
                dataItems.push(that.listView.dataItem(this));
            });
        break;
    case "grid":
        $(that.gridView.select())
            .each(function(i) {
                dataItems.push(that.gridView.dataItem(this));
            });
        break;
    case "masonry":
        break;
    }
    return dataItems;
};

MvcAssetView.prototype.getSelectedAssets = function() {
    var that = this;
    var selectedElements = null;
    switch (that.currentView) {
    case "list":
        selectedElements = that.listView.select();
        break;
    case "grid":
        selectedElements = that.gridView.select();
        break;
    case "masonry":
        selectedElements = [];
        break;
    }
    return selectedElements;
};

MvcAssetView.prototype.doesFolderExist = function (name) {
    var that = this;
    var parentGroupId = (that.options.currentSearch.AssetGroupId == 0 ? null : that.options.currentSearch.AssetGroupId);
    $.ajax({
        url: "/tools/digitalassets/DoesFolderExist",
        dataType: "json",
        method: "POST",
        data: {
            parentGroupId: parentGroupId,
            name: name
        },
        success: function (result) {
            if (result) {
                prompt.alert({
                    question: "~{FolderAlreadyExists}~",
                    description: "~{TryAnotherName}~",
                    type: "warning",
                    yes: function (e) {
                        $(document).trigger(argosyEvents.DO_ASSET_ACTION, { action: "addfolder" });
                    }
                });
            } else {
                that.createFolder(name, parentGroupId);
            }
        },
        error: function (result) {
            options.error(result);
        }
    });
};

MvcAssetView.prototype.createFolder = function (name, parentGroupId) {
    var that = this;
    var formData = new FormData();
    formData.append("parentAssetGroupId", parentGroupId);
    formData.append("name", name);
    formData.append("userRoleId", that.options.userRoleId);
    formData.append("inheritParentPermissions", $('#useParentPermission').is(':checked'));
    if($(that.baseOptions.folderImageUpload).get(0).files[0] !== undefined){
        formData.append("file", $(that.baseOptions.folderImageUpload).get(0).files[0], $(that.baseOptions.folderImageUpload).get(0).files[0].name);
    }
    $.ajax({
        url: "/tools/digitalassets/CreateAssetFolder",
        contentType: false,
        processData: false,
        method: "POST",
        data:formData,
        success: function (result) {
            if (result==null) {
                prompt.alert({
                    question: "~{ProblemCreatingFolder}~",
                    description: "~{TryAgainLater}~",
                    type: "warning",
                    yes: function (e) {
                        $.fancybox.close();
                    }
                });
            } else {
                $(document).trigger(argosyEvents.ASSET_DIRECTORY_CREATED, result);
                prompt.alert({
                    question: "~{FolderCreatedSuccessfully}~",
                    description: "~{TakesMinutesForChangessToAppear}~",
                    type: "success",
                    yes: function (e) {
                        $.fancybox.close();
                    }
                });
            }
        },
        error: function (result) {
            options.error(result);
        }
    });
    
};

MvcAssetView.prototype.getFormat = function (asset, formatId) {
    var that = this;
    var format = null;
    if (asset.AvailableFormats != null && formatId > 0) {
        for (var i = 0; i < asset.AvailableFormats.length; i++) {
            if (asset.AvailableFormats[i].Id == formatId) {
                format = asset.AvailableFormats[i];
                break;
            }
        }
    } else {
        format = {
            Dpi: asset.Dpi,
            Extension: asset.Extension,
            Id: 0,
            IsActive: true,
            IsSystem: false,
            Name: "Original"
        };
    }
    format.MaxWidth = asset.Width;
    format.MaxHeight = asset.Height;
    return format;

};

MvcAssetView.prototype.getAsset = function (assetId) {
    var that = this;
    var asset = null;
    if (that.dataSource != null) {
        var length = that.dataSource.data().length;
        for (var i = 0; i < length; i++) {
            var item = that.dataSource.data()[i];
            if (item.Id === assetId) {
                asset = item;
                break;
            }
        }
    }
    return asset;
};

MvcAssetView.prototype.updateAssetTagJson = function (assetId, json, type) {
    var that = this;
    if (that.dataSource != null) {
        var length = that.dataSource.data().length;
        for (var i = 0; i < length; i++) {
            var item = that.dataSource.data()[i];
            if (item.Id === assetId) {
                switch (type) {
                    case "inclusion":
                        item.InclusionArray = eval(json);
                        break;
                    case "exclusion":
                        item.ExclusionArray = eval(json);
                        break;
                    default:
                        item.TagsJson = json;
                        break;
                }
                break;
            }
        }
    }
};

MvcAssetView.prototype.setupMenuOptions = function () {
    var that = this;
    var sortSelector = $(that.options.sortBySelector);
    var filterSelector = $(that.options.filterBySelector);
    
    if (that.options.showFilter) {
        filterSelector.change(function (e) {
            var filterBy = $(e.currentTarget[e.currentTarget.selectedIndex]).attr("data-argosy-filter");
            that.options.currentSearch.FilterOption = filterBy;
            that.read();
        });
    } else {
        filterSelector.hide();
        $(that.options.filterByTextSelector).hide();
    }

    if (that.options.showSort) {
        sortSelector.change(function (e) {
            var sortBy = $(e.currentTarget[e.currentTarget.selectedIndex]).attr("data-argosy-sort");
            that.options.currentSearch.SortOption = sortBy;
            that.read();
        });
    } else {
        sortSelector.hide();
        $(that.options.sortByTextSelector).hide();
    }

    if (that.options.showActions) {
        $(that.options.actionHref).show();
    } else {
        $(that.options.actionHref).hide();
    }
};

MvcAssetView.prototype.setupViewButtons = function() {
    var that = this;
    var showListView = $(that.options.showListViewSelector);
    var showGridView = $(that.options.showGridViewSelector);
    var showMasonryView = $(that.options.showMasonryViewSelector);


    showListView.unbind("click");
    showGridView.unbind("click");
    showMasonryView.unbind("click");

    showListView.click(function(e) {
        that.updateView(false, true, false);
    });

    showGridView.click(function(e) {
        that.updateView(true, false, false);
    });

    showMasonryView.click(function(e) {
        that.updateView(false, false, true);
    });


    if (showGridView.hasClass("selected")) {
        that.updateView(true, false, false);
    } else if (showMasonryView.hasClass("selected")) {
        that.updateView(false, false, true);
    } else {
        that.updateView(false, true, false);
    }
};

MvcAssetView.prototype.updateView = function (showGrid, showList, showMasonry) {
    var that = this;
    var gridView = $(that.options.gridViewHref);
    var listView = $(that.options.listViewHref);
    var masonryView = $(that.options.masonryViewHref);
    var showListView = $(that.options.showListViewSelector);
    var showGridView = $(that.options.showGridViewSelector);
    var showMasonryView = $(that.options.showMasonryViewSelector);
    if (showGrid) {
        gridView.show();
        showGridView.addClass("selected");
        that.currentView = "grid";
    } else {
        gridView.hide();
        showGridView.removeClass("selected");
    }
    if (showList) {
        listView.show();
        showListView.addClass("selected");
        that.currentView = "list";
    } else {
        listView.hide();
        showListView.removeClass("selected");
    }
    if (showMasonry) {
        masonryView.show();
        showMasonryView.addClass("selected");
        that.currentView = "masonry";
    } else {
        masonryView.hide();
        showMasonryView.removeClass("selected");
    }
}

MvcAssetView.prototype.sendDataUpdateEvent = function() {
    var that = this;
    $(document).trigger(that.EVENT_DATABOUND, { Count: that.dataSource._total });
};

MvcAssetView.prototype.addDraggable = function(elements) {
    var that = this;
    if (that.options.enableEdit && that.options.enableDragDrop) {
        if (that.enableFeature()) {
            $(elements)
                .kendoDraggable({
                    hint: function(e) {
                        var selectedElements = that.getSelectedAssets();
                        if (selectedElements.length > 1) {
                            return $("<div class='dragdropwrapper'><div><h2 class='dragdroptext'>Moving " +
                                selectedElements.length +
                                " items...</h1>");
                        } else if (selectedElements.length == 0) {
                            // ensure that the current element is selected so we 
                            // can use this for data source on drop.
                            that.listView.select(e);
                        }
                        var image = e.find("img");
                        return $("<img src='" + image.attr("src") + "'>");
                    },
                    dragstart: function(e) {
                        //debugger;
                    },
                    dragend: function(e) {
                        //debugger;
                    },
                    cursorOffset: { top: 10, left: 10 }
                });
        }
    }
};

MvcAssetView.prototype.setupListView = function() {
    var that = this;

    that.listView = $(that.options.listViewHref).kendoListView({
        dataSource: that.dataSource,
        template: $("#_AssetListViewPanelTemplate").html(),
        dataBound: function(e) {
            addArgosyActions(that.options.listViewHref);
            $(".fancybox").fancybox();
            that.addDraggable($(that.options.listViewHref).find(".draggable"));
        },
        change: function() {
            $("#mycheckbox").prop("checked", false);
        },
        autoBind: false,
        selectable: that.enableFeature() ? "multiple" : null
    }).getKendoListView();
};

MvcAssetView.prototype.setupGridView = function() {
    var that = this;
    that.gridView = $(that.options.gridViewHref)
        .kendoGrid({
            dataSource: that.dataSource,
            rowTemplate: kendo.template($("#_AssetGridViewTemplate").html()),
            columns: [
                {
                    title: "",
                },
                {
                    title: "~{Asset}~",
                },
                {
                    title: "~{Size}~",
                    headerAttributes: {
                        "class": "hidden-sm hidden-xs",
                    },
                },
                {
                    title: "",
                    headerAttributes: {
                        "class": "textr",                        
                    },
                  
                }
            ],
            sortable: true,
            scrollable: false,
            selectable: that.enableFeature() ? "multiple" : null,
            dataBound: function(e) {
                $("#mycheckbox").prop("checked", false);
                addArgosyActions(that.options.gridViewHref);
                $(".fancybox").fancybox();
                that.addDraggable($(that.options.gridViewHref).find(".draggable"));
                if (e.sender.dataItems().length > 0) {
                    var index = -1;
                    $.each(e.sender.dataItems(), function(i, folder) {
                        if (index === -1 && folder.Name === "Deleted Items") {
                            index = i;
                        };
                    });
                    if (index >= 0) {
                        var item = e.sender.dataSource.at(index);
                        e.sender.dataSource.remove(item);
                    };
                };
            },
            autoBind: false
        })
        .getKendoGrid();
};

MvcAssetView.prototype.setupPagerView = function() {
    var that = this;
    that.pager = $(that.options.pagerHref)
        .kendoPager({
            dataSource: that.dataSource,
            autoBind: false
        })
        .getKendoPager();
};

MvcAssetView.prototype.read = function (pageNumber) {
    var that = this;
    if (pageNumber != null) {
        that.dataSource.page(pageNumber);
    }
    that.dataSource.read();
    that.gridView.refresh();
    that.listView.refresh();
    that.pager.refresh();
    var treeView = $(that.options.treeViewHref).data("kendoTreeView");
    if (treeView != null && treeView.dataItems().length === 0) {
        treeView.dataSource.read();
    }
};

MvcAssetView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;

    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            $(document).trigger(argosyEvents.START_LOADING, { name: that.constructor.name });
            // can't reference that.searchCriteria the other way
            $.extend(true, that.options.currentSearch, kendoOptionsToObject(options), that.searchCriteria);
            that.options.currentSearch.AssetItemType = (that.options.includeFolders == null || that.options.includeFolders) ? 3 : 1;
            that.options.currentSearch.IsDeleted = that.options.includeDeleted ? null : false;
            $.ajax({
                url: "/api/LuceneSearch/Assets",
                dataType: "json",
                method: "POST",
                data: that.options.currentSearch,
                success: function (result) {
                    $(result.Records).each(function(i) {
                        this.UserRoleId = that.options.userRoleId;
                    });
                    options.success(result);
                    $(document).trigger(argosyEvents.END_LOADING, { name: that.constructor.name });
                    that.sendDataUpdateEvent();
                },
                error: function (result) {
                    options.error(result);
                }
            });
        }
    };
    that.dataSourceOpts.pageSize = 100;
    that.dataSourceOpts.schema = {
        data: function (response) {
            return response.Records;
        },
        total: function (response) {
            return response.TotalRecords;
        },
        model: {
            id: "Id"
        }
    };
    return new kendo.data.DataSource(that.dataSourceOpts);
};

MvcAssetView.prototype.getRandomPrice = function () {
    return Math.round((Math.random() * 100) * (Math.random()));
};

MvcAssetView.prototype.dataSourceOpts = {
    pageSize: 100
};