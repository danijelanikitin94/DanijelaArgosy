function KitBuilder(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();
    controlLoader.loadControl("ModalProductDetail", {}, function (control) {
        that.productDetailControl = control;
    });
    controlLoader.loadControl("ModalProductUsage", {}, function (control) {
        that.productUsageControl = control;
    });
    controlLoader.loadControl("ModalProductViewingRights", {}, function (control) {
        that.productViewingRightsControl = control;
    });
    that.setupEventListeners();
    controlLoader.loadTemplate("KitBuilder", function (template) {
        $(document.body).append(template);
        that.initialize();
        that.updatePricing(0, 0);
        $(document).trigger(that.EVENT_TEMPLATE_LOADED);
    });
}

KitBuilder.prototype.options = {};

KitBuilder.prototype.baseOptions = {
    kitBuilderView: "div[data-argosy-control=KitBuilder]",
    kitBuilderPartList: "div[data-argosy-view=KitBuilderPartsList]",
    kitBuilderTemplate: "#_KitBuilderTemplate",
    kitBuilderStaticTemplate: "#_KitBuilderStaticTemplate",
    kitBuilderPersonalizedTemplate: "#_KitBuilderPersonalizedTemplate",
    kitBuilderPartListTemplate: "#_KitBuilderPartListTemplate",
    kitBuilderApproveProofTemplate: "#_ProofingApproveProofTemplate",
    approvalProofInitial: "#approvalProofInitial",
    approvalProofName: "#approvalProofName",
    approvalProofModalHref: "#divApproveProof",
    approvalProofAcceptButton: "#approvalProofAcceptButton",
    kitTerm: "Kit"
};

KitBuilder.prototype.EVENT_TEMPLATE_LOADED = "TEMPLATE_KIT_BUILDER_LOADED";
KitBuilder.prototype.EVENT_LISTENERS_LOADED = "KIT_BUILDER_LISTENERS_LOADED";
KitBuilder.prototype.kitViewModel = null;
KitBuilder.prototype.kitDataSource = {};
KitBuilder.prototype.GroupData = null;
KitBuilder.prototype.IsBuildAKit = null;
KitBuilder.prototype.refreshGroupData = function (data) {
    var that = this,
        groupData = [],
        isBundle = (that.data.KitState != null && that.data.KitState.length > 0);
    var group;
    if (data.GroupNames.length > 0) {
        for (var i = 0; i < data.GroupNames.length; i++) {
            var id = data.GroupNames[i].replace(/[^a-z0-9]/ig, '');
            group = {
                id: id,
                name: data.GroupNames[i],
                items: data.Groups[data.GroupNames[i]],
                showGroupName: true,
                isBundle: isBundle,
                IsBuildAKit: that.IsBuildAKit
            };
            groupData.push(group);
        }
    } else {
        group = {
            id: "noNameGroup",
            name: "",
            items: data.KitParts,
            showGroupName: false,
            isBundle: isBundle,
            IsBuildAKit: that.IsBuildAKit
        };
        groupData.push(group);
    }
    $(groupData).each(function(i, group) {
        $(group.items).each(function(a, item) {
            item.isBundle = isBundle;
            if (item.ProofingThumbnailFile == undefined) {
                item.ProofingThumbnailFile = null;
            }
        });
    });
    return groupData;
};
KitBuilder.prototype.getViewModel = function (data) {
    var globals = KitBuilder.prototype;
    var that = this,
        groupData = that.refreshGroupData(data);
    return kendo.observable({
        kitTerm: that.options.kitTerm,
        pendingProofCount: 0,
        kitData: data,
        groupData: globals.GroupData == null ? groupData : globals.GroupData,
        allParts: data.KitParts,
        enablePartInSource: function (partId, dataSource, quantity) {
            $(dataSource)
                .each(function () {
                    if (this.ChildPart.PartId === partId) {
                        this.Disabled = false;
                        this.Quantity = quantity;
                    }
                });
            return dataSource;
        },
        enablePart: function (e) {
            var kendoObj = this,
                kitPart = e.data,
                dataSource = kendoObj.get("groupData"),
                currentQty = 0;

            //kendoObj.addToCurrentlyInKit(kitPart);
            
            $(dataSource)
                .each(function () {
                    $(this.items)
                        .each(function (e, item) {
                            if (item.ChildPart.PartId === kitPart.ChildPartId) {
                                item.Quantity = this.Quantity;
                                item.ChildPart.Quantity = this.Quantity;
                                item.Disabled = false;
                                currentQty = this.Quantity;
                            }
                        });
                });
            that.kitViewModel.kitData.kitParts = kendoObj
                .enablePartInSource(kitPart.ChildPartId, that.kitViewModel.kitData.KitParts, currentQty);
            kendoObj.set("kitData", that.kitViewModel.kitData);
            kendoObj.set("groupData", dataSource);
            kendoObj.reBind();
            that.updatePricing(kitPart.ChildPartId, currentQty);
        },
        getKitData: function () {
            var kendoObj = this,
                kitData = kendoObj.get("kitData");
            return kitData;
        },
        addToCurrentlyInKit: function (kitPart) {
            var kendoObj = this,
                allParts = kendoObj.get("allParts");
            allParts.push(kitPart);
            kendoObj.set("allParts", allParts);
        },
        removeFromCurrentlyInKit: function (kitPart) {
            var kendoObj = this,
                allParts = kendoObj.get("allParts");
            var index = $.map(allParts,
                function (obj, foundIndex) {
                    if (obj.ChildPartId === kitPart.ChildPartId) {
                        return foundIndex;
                    }
                });
            allParts.splice(index[0], 1);
            kendoObj.set("allParts", allParts);
        },
        disablePartInSource: function (partId, dataSource) {
            $(dataSource)
                .each(function (e, item) {
                    if (item.ChildPart.PartId === partId) {
                        item.Disabled = true;
                        //item.Hidden = true;
                    }
                });
            return dataSource;
        },
        disablePartGroupInSource: function (partId, dataSource) {
            $(dataSource)
                .each(function () {
                    $(this.items)
                        .each(function (e, item) {
                            if (item.ChildPart.PartId === partId) {
                                item.Disabled = true;
                                //item.Hidden = true;
                            }
                        });
                });
            return dataSource;
        },
        editVariables: function(e) {
            $(document).trigger(argosyEvents.EVENT_SHOW_PROOFING_FORM, {});
        },
        disablePart: function (e) {
            var kendoObj = this,
                kitPart = e.data,
                dataSource = kendoObj.get("groupData"),
                kitData = kendoObj.get("kitData");
            //kendoObj.removeFromCurrentlyInKit(kitPart);
            dataSource = kendoObj.disablePartGroupInSource(kitPart.ChildPartId, dataSource);
            kitData.kitParts = kendoObj.disablePartInSource(kitPart.ChildPartId, kitData.KitParts);
            kendoObj.set("kitData", kitData);
            kendoObj.set("groupData", dataSource);
            kendoObj.reBind();
            that.updatePricing(kitPart.ChildPartId, 0);
        },
        reBind: function () {
            var kendoObj = this,
                groupData = kendoObj.get("groupData");
            kendo.unbind($('#_kitContainer'));
            that.kitViewModel = that.getViewModel(kendoObj.get("kitData"));
            kendo.bind($('#_kitContainer'), that.kitViewModel);

            setTimeout(function (e) {
                addArgosyActions(that.options.kitBuilderPartList);
                $(groupData)
                    .each(function (e, item) {
                        addArgosyActions("div[data-argosy-view=KitBuilder" + item.id + "]");
                    });
            }, 500);

            var componentCount = 0;
            $(that.kitViewModel.kitData.KitParts)
                .each(function (index, kitPart) {
                    if (!kitPart.Disabled) {
                        componentCount++;
                    }
                });
            if (that.IsBuildAKit) {
                if (that.kitViewModel.kitData.Kit.Options.ComponentMinCount != undefined &&
                    that.kitViewModel.kitData.Kit.Options.ComponentMinCount > 0 && componentCount < that.kitViewModel.kitData.Kit.Options.ComponentMinCount) {
                    $(".buildValidationMin").text("Select at least " + that.kitViewModel.kitData.Kit.Options.ComponentMinCount + " products ");
                    $(".buildValidationMin").show();
                } else if ((that.kitViewModel.kitData.Kit.Options.ComponentMinCount == undefined || that.kitViewModel.kitData.Kit.Options.ComponentMinCount == 0)
                    && componentCount == 0) {
                    $(".buildValidationMin").text("Select at least 1 product ");
                    $(".buildValidationMin").show();
                } else {
                    $(".buildValidationMin").hide();
                }
                if (that.kitViewModel.kitData.Kit.Options.ComponentMaxCount != undefined &&
                    that.kitViewModel.kitData.Kit.Options.ComponentMaxCount > 0 && componentCount > that.kitViewModel.kitData.Kit.Options.ComponentMaxCount) {
                    $(".buildValidationMax").text("Select at most " + that.kitViewModel.kitData.Kit.Options.ComponentMaxCount + " products");
                    $(".buildValidationMax").show();
                } else {
                    $(".buildValidationMax").hide();
                }
                if (!$(".buildValidationMax").is(":hidden") || !$(".buildValidationMin").is(":hidden")) {
                    $(".btn-addtocart").attr("disabled", true);
                    $(".btn-addtocart").removeAttr("onclick");
                } else {
                    $(".btn-addtocart").attr("disabled", false);
                    $(".btn-addtocart").attr("onclick", "KitBuilder.prototype.kitViewModel.addToCart()");
                }
            }
        },
        priceBreakDataBound: function (e) {
            var $dropDown = $(e.sender.element),
                containerWidth = 70;
            $dropDown.data("kendoDropDownList").list.width("auto");
            $dropDown.closest(".k-widget").width(containerWidth);
        },
        variables: window["variables"],
        approveProofs: function (e) {
            var model = this;
            var approvalDiv = $(that.options.approvalProofModalHref);
            if (approvalDiv.length == 0) {
                var html = kendo.template($(that.options.kitBuilderApproveProofTemplate).html())({});
                $(document.body).append(html);
                var proofName = Proofing.prototype.getProofName(model.variables);
                $(that.options.approvalProofModalHref).find("#approvalProofName").val(proofName);
                if (userSettings.IsProofNameLocked) {
                    $("#approvalProofName").prop("disabled", true);
                };
                $(that.options.approvalProofAcceptButton).click(function (e) {
                    var initial = $(that.options.approvalProofInitial).val();
                    if (initial.length > 0) {
                        that.saveCustomizationSignature(model, initial);
                    } else {
                        prompt.alert({
                            question: "You must enter your initials to continue.  Please try again.",
                            description: "",
                            type: "warning",
                            yes: function (e) {
                                $.fancybox({
                                    href: that.options.approvalProofModalHref
                                });
                            }
                        });
                    }
                });
            }
            $.fancybox({
                href: that.options.approvalProofModalHref
            });
        },
        addToCart: function (e) {
            var modelToSend = {},
                kitParts = [],
                kendoObj = this,
                kitData = kendoObj.get("kitData"),
                kitPartsToAdd = kitData.KitParts;
            if (e != null) {
                e.preventDefault();
                block(e.sender, "", true);
            } else {
                block(null, "~{MsgAddingToCart}~");
            }
            $(kitPartsToAdd)
                .each(function (index, kitPart) {
                    if (!kitPart.Disabled) {
                        kitParts.push(kitPart);
                    }
                });
            modelToSend.partId = kitData.Kit.PartId;
            modelToSend.attributePartId = 0;
            modelToSend.parentPartId = 0;
            modelToSend.rank = 0;
            modelToSend.part = kitData.Kit;
            modelToSend.qty = 1;
            modelToSend.kitParts = kitParts;
            sendPartToCart(modelToSend, kitData.Kit.PartName);
        },
        partListDataBound: function (e) {
            addArgosyActions(that.options.kitBuilderPartList);
        },
        showKitItemTypeComponents: function (e) {
            ModalProductView.prototype.baseOptions.searchTerm = kitData.Kit.Options.ComponentItemType;
            ModalProductView.prototype.baseOptions.ExcludedKitIds = [kitData.Kit.PartId];
            ModalProductView.prototype.baseOptions.ExcludeKit = true;
            ModalProductView.prototype.baseOptions.ExcludeAttributeParts = true;
            ModalProductView.prototype.baseOptions.ExcludeConfiguredParts = true;
            ModalProductView.prototype.setupListView();
        }
    });
}
KitBuilder.prototype.initialize = function() {
    var that = KitBuilder.prototype;

    that.data = that.getDataSource();
    that.kitViewModel = that.getViewModel(that.data);
    that.GroupData = that.kitViewModel.groupData;

    var html = $(that.options.kitBuilderTemplate).html();
    var kendoTemplate = kendo.template(html);
    var result = kendoTemplate(that.data);
    $("*[data-argosy-uuid='" + that.options.uuid + "']").append(result);
    kendo.bind($('#_kitContainer'), that.kitViewModel);
    setTimeout(function(e) {
        addArgosyActions(that.options.kitBuilderPartList);
        $(that.GroupData).each(function(e, item) {
            addArgosyActions("div[data-argosy-view=KitBuilder" + item.id + "]");
        });
        that.checkProofingStatus(that.kitViewModel);
        that.kitViewModel.reBind();
        showKitBuilderContainer("KitBuilder" + that.GroupData[0].id + "Container");
    }, 500);
};

KitBuilder.prototype.saveCustomizationSignature = function (model, signature) {
    var that = this;
    block(null, "~{MsgSavingSignature}~");
    var customizationStateIds = [];
    $(model.kitData.KitParts).each(function(i) {
        if (this.CustomizationStateId != null && this.CustomizationStateId > 0) {
            customizationStateIds.push(this.CustomizationStateId);
        } 
    });
    $.ajax({
        url: "/Store/Proofing/UpdateProofSignatures",
        dataType: "jsonp",
        data: {
            customizationStateIds: customizationStateIds,
            signature: signature
        },
        method: "POST"
    });
    model.addToCart(null);
};
KitBuilder.prototype.checkProofingStatus = function (kitViewModel) {
    var that = this;
    if (!kitViewModel.kitData.isProofingComplete) {
        $(kitViewModel.kitData.KitParts).each(function (i) {
            that.checkProofStatus(kitViewModel, this);
        });
    }
};

KitBuilder.prototype.checkProofStatus = function (kitViewModel, kitPart) {
    var that = this;
    if (kitPart.CustomizationStateId != null && kitPart.CustomizationStateId > 0) {
        kitViewModel.pendingProofCount++;
        $.ajax({
            url: "/Store/Proofing/GetKitProofImage/" + kitPart.CustomizationStateId,
            method: "GET",
            success: function (result) {
                if (result == null || result === "") {
                    that.checkProofStatus(kitViewModel, kitPart);
                } else {
                    var image = $(document).find("img[data-customization-state-id=" + kitPart.CustomizationStateId + "]");
                    //image.attr("src", result);
                    image.attr("data-loaded", true);
                    image.parent().attr("data-argosy-datahref", result);
                    kitPart.ChildPart.ProofingThumbnailFile = result;
                    kitPart.ChildPart.LargeThumbnailFile = result;
                    for (var key in kitViewModel.kitData.Groups) {
                        if (kitViewModel.kitData.Groups.hasOwnProperty(key)) {
                            for (var key2 in kitViewModel.kitData.Groups[key]){
                                var element = kitViewModel.kitData.Groups[key][key2];
                                if (element.Id == kitPart.Id) {
                                    element.ChildPart.ProofingThumbnailFile = result;
                                    element.ChildPart.LargeThumbnailFile = result;
                                }
                            };
                        }
                    };
                    kitViewModel.pendingProofCount--;
                    var unloadedImages = that.getElement().find("img[data-loaded=false]");
                    if (unloadedImages.length == 0) {
                        KitBuilder.prototype.GroupData = null;
                        kitViewModel.kitData.isProofingComplete = true;
                        that.getElement().find(".btn-addtocart").removeAttr("disabled");
                        kitViewModel.reBind();
                    }
                }
            }
        });
    }
};

KitBuilder.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};

KitBuilder.prototype.setupEventListeners = function () {
    var that = this;
    $(document).bind(argosyEvents.SHOW_PART_USAGE_MODAL, function (e, partId) {
        if (that.productUsageControl != null) {
            that.productUsageControl.show(parseInt(partId));
        }
    });

    $(document).bind(argosyEvents.SHOW_VIEWING_RIGHTS_MODAL, function (e, data) {
        if (that.productViewingRightsControl != null) {
            that.productViewingRightsControl.init(data);
        }
    });

    $(document).bind(argosyEvents.UPDATE_PART_QUANTITIES, function (e, obj) {
        $(that.kitViewModel.kitData.KitParts).each(function (i) {
            if (this.ChildPart.PartId == obj.partId) {
                if (this.Quantity != obj.value) {
                    this.Quantity = obj.value;
                }
            }
        });
        $(that.kitViewModel.groupData).each(function (i) {
            $(this.items).each(function (j) {
                if (this.ChildPart.PartId == obj.partId) {
                    if (this.Quantity != obj.value) {
                        this.Quantity = obj.value;
                    }
                }
            });
        });
        that.updatePricing(obj.partId, obj.value);
    });
    $(document).bind(argosyEvents.PART_ADDED_TO_CART, function (e, data) {
        window.location = "/Store/Cart/";
    });
};

KitBuilder.prototype.updatePricing = function (partId, quantity) {
    var that = this;
    var partPricingClass = ".part-price-wrapper-" + partId.toString();
    var kitPricingClass = ".kit-price-wrapper-" + that.kitViewModel.kitData.Kit.PartId.toString();

    $(partPricingClass).each(function () {
        $(this).html("Loading...");
        block(this, "", true);
    });
    $(kitPricingClass).each(function () {
        $(this).html("Loading...");
        block(this, "", true);
    });

    pricingManager.getKitPricing(that.kitViewModel.kitData, 1, function (response) {
        $(kitPricingClass).each(function (i) {
            $(this).html(kendo.toString(response.KitPrice, "C"));
        });
        if (response.Parts[partId] != undefined) {
            $(partPricingClass).html(kendo.toString(response.Parts[partId], "C"))
        } else {
            $(that.kitViewModel.kitData.KitParts).each(function (i, childPart) {
                if (childPart.ChildPartId == partId) {
                    $(partPricingClass).html(kendo.toString(childPart.ChildPart.Price, "C"))
                }
            });
        }

        unblock();
    });
}

KitBuilder.prototype.getPart = function (partId) {
    var that = this;
    var part = null;
    var length = that.kitViewModel.kitData.KitParts.length;
    for (var i = 0; i < length; i++) {
        var item = that.kitViewModel.kitData.KitParts[i];
        if (item.ChildPart.PartId === parseInt(partId)) {
            part = item.ChildPart;
            part.Price = item.StartingPrice;
            break;
        }
    }
    return part;
};

KitBuilder.prototype.updateView = function (showGrid, showList, showMasonry) {
    var that = this;
}

KitBuilder.prototype.updatePartStates = function (dataSource) {
    $(dataSource.KitState).each(function (i) {
        this.Part.CustomizationStateId = this.CustomizationStateId;
        this.Part.CartId = this.CartId;
        this.Part.ChildPart.CustomizationStateId = this.CustomizationStateId;
        this.Part.ChildPart.CartId = this.CartId;
        dataSource.KitParts.push(this.Part);
    });
}



KitBuilder.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    var dataSource = window[that.options.dataSource];

    // added so you pass prefetched data to maintain state between controls.
    // named bundledata since currently it's for bundles.
    if (dataSource != null && dataSource.KitState != null) {
        that.updatePartStates(dataSource);
        dataSource.isProofingComplete = false;
    } else if (dataSource != null) {
        dataSource.isProofingComplete = true;
        dataSource.KitState = null;
    }
    that.IsBuildAKit = dataSource.Kit.IsBuildAKit;
    return dataSource;
};

KitBuilder.prototype.dataSourceOpts = {
    pageSize: 20
};

KitBuilder.prototype.newProductId = -1;
KitBuilder.prototype.componentsAddedToKit = [];
KitBuilder.prototype.AddComponentToKit = function (partId) {
    var that = this,
        globals = KitBuilder.prototype;
    if ($.inArray(partId, globals.componentsAddedToKit) == -1) {
        var partTemplate = $.extend({}, globals.GroupData[0].items[0]);
        var kit = globals.kitViewModel;
        var partToBeAdded = ModalProductView.prototype.listView.dataSource.get(partId);
        partTemplate.ChildPart = partToBeAdded;
        partTemplate.ChildPartDescription = partToBeAdded.Description;
        partTemplate.ChildPartId = partToBeAdded.PartId;
        partTemplate.ChildPartName = partToBeAdded.PartName.trim() != "" ? partToBeAdded.PartName : partToBeAdded.Sku;
        partTemplate.ChildPartOffered = true;
        partTemplate.ChildPartSku = partToBeAdded.Sku;
        partTemplate.Quantity = partToBeAdded.MinCartQty;
        partTemplate.StartingPrice = partToBeAdded.MinPrice;
        partTemplate.IsRequired = false;
        partTemplate.Disabled = false;
        partTemplate.GroupName = "Components Added To Kit";
        partTemplate.Id = globals.newProductId;
        globals.newProductId = globals.newProductId - 1;
        var ungroupedExists = false;
        var ungroupedIndex = 0;
        $.each(globals.GroupData, function (index, element) {
            if (element.id == "ComponentsAddedToKit") {
                ungroupedExists = true;
                ungroupedIndex = index;
            }
        });
        if (!ungroupedExists) {
            globals.GroupData.push({
                id: "ComponentsAddedToKit",
                items: [partTemplate],
                name: "Components Added To Kit",
                showGroupName: true,
                isBundle: false,
                IsBuildAKit: false
            });
            globals.kitViewModel.kitData.GroupNames.push("Components Added To Kit");
            globals.kitViewModel.kitData.Groups['Components Added To Kit'] = { 0: partTemplate };
            ungroupedIndex = globals.GroupData.length - 1;
        } else {
            globals.GroupData[ungroupedIndex].items.push(partTemplate);
            globals.kitViewModel.kitData.Groups['Components Added To Kit'][globals.kitViewModel.kitData.Groups['Components Added To Kit'].length] = partTemplate;
        }
        globals.componentsAddedToKit.push(partId);
        globals.kitViewModel.kitData.KitParts.push(partTemplate);
        globals.kitViewModel.reBind();
        that.updatePricing(partTemplate.ChildPartId, partTemplate.MinCartQty);
        prompt.notify({
            question: "Items(s) were successfully added.",
            type: "success"
        });
    }
}