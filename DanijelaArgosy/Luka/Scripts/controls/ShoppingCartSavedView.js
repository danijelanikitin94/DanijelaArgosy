function ShoppingCartSavedView(opts) {
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
    //Removed: tmittelstadt double binding with shoppingcartview
    //controlLoader.loadControl("ModalPartConfiguration", {}, function (control) {
    //    that.productConfigurationControl = control;
    //});
    that.setupEventListeners();
    controlLoader.loadTemplate("ShoppingCartSavedView", function (template) {
        $(document.body).append(template);
        var html = $(that.options.ShoppingCartSavedViewTemplate).html();
        var kendoTemplate = kendo.template(html);
        var result = kendoTemplate({
            isMailingList: false,
            isThirdPartyList: false,
            mailingListCost: 0,
            mailingListCostText: "",
            thirdPartyListCost: 0,
            thirdPartyListCostText: "",
            isDiscount: false,
            discountCost: 0,
            discountCostText: ""
        });
        $("*[data-argosy-uuid='" + that.options.uuid + "']").append(result);
        that.setupLoadingAttributes();
        that.setupEvents();
        that.initialze();
        that.loaded = true;
        $(document).trigger(that.EVENT_TEMPLATE_LOADED);
    });
}

ShoppingCartSavedView.prototype.options = {};

ShoppingCartSavedView.prototype.baseOptions = {
    shoppingCartBuilderView: "div[data-argosy-control=ShoppingCartSavedView]",
    ShoppingCartSavedViewTemplate: "#_ShoppingCartSavedViewTemplate",
    shoppingCartBindSection: "#_SavedShopingCartBindSection",
    shoppingCartGridHref: "#_SavedShoppingCartGrid",
    shoppingCartGridRowTempalte: "#_SavedShoppingCartRowViewTemplate",
    cartContainer: "#_savedCartContainer",
    emptyCartSelector: ".empty-cart-parent-saved",
    
};

ShoppingCartSavedView.prototype.EVENT_TEMPLATE_LOADED = "TEMPLATE_SAVED_SHOPPING_CART_VIEW_LOADED";
ShoppingCartSavedView.prototype.productDetailControl = null;
ShoppingCartSavedView.prototype.cartViewModel = null;
ShoppingCartSavedView.prototype.setupLoadingAttributes = function () {
    var that = this;
    var mainElement = $("*[data-argosy-uuid='" + that.options.uuid + "']");
    appendLoadingAttribute(mainElement, that.constructor.name);
    mainElement.attr("data-argosy-loading-message", "~{MsgUpdadingSavedCart}~");

};
ShoppingCartSavedView.prototype.setupEvents = function () {
    var that = this;

    $(document).bind(argosyEvents.EVENT_CARTLINE_SAVED_FOR_LATER, function (e) {
        if ($(that.options.emptyCartSelector).hasClass("hidden")) {
            that.cartViewModel.cartSource.read();
        } else {
            that.initialze();
        }
        
    });
    $(document).bind(argosyEvents.SHOW_PART_USAGE_MODAL, function (e, data) {
        if (that.productUsageControl != null) {
            that.productUsageControl.show(parseInt(data.partId));
            $(that.options.historyTitleElment).html(data.partName + " - ~{PartHistory}~");
        }
    });

    $(document).bind(argosyEvents.SHOW_VIEWING_RIGHTS_MODAL, function (e, data) {
        if (that.productViewingRightsControl != null) {
            that.productViewingRightsControl.init(data);
        }
    });
    //Removed: tmittelstadt double binding with shoppingcartview
    //$(document).bind(argosyEvents.SHOW_PART_CONFIGURATION_MODAL, function (e, partId) {
    //    if (that.productConfigurationControl != null) {
    //        var part = that.getPart(partId);
    //        that.productConfigurationControl.show(part);
    //    }
    //});
    $(document).bind(argosyEvents.SHOW_PART_QUANTITY_MODAL, function (e, partId) {
        var part = that.getPart(partId);
        showPartQuantityModal(part);
    });
}
ShoppingCartSavedView.prototype.parts = [];

ShoppingCartSavedView.prototype.getPart = function (partId) {
    var that = this,
        part = null;

    if (that.parts != null) {
        var length = that.parts.length;
        for (var i = 0; i < length; i++) {
            var item = that.parts[i];
            if (item.PartId === partId) {
                part = item;
                break;
            }
        }
    }
    return part;
};

ShoppingCartSavedView.prototype.initialze = function () {
    var that = this,
        cartSource = new kendo.data.DataSource({
            error: function (e) {
                console.log("Error in datasource see below:");
                console.log(e);
            },
            schema: {
                data: function (response) {
                    return response.CartLines;
                },
                total: function (response) {
                    if (response.CartLines == null) return 0;
                    return response.CartLines.length;
                }
            },
            transport: {
                read: {
                    url: "/store/cart/GetCartLines?isSaveForLater=" + true,
                    dataType: "json"
                }
            },
            requestEnd: function (e) {

                if (e.hasOwnProperty('response')) {
                    var partIds = [],
                        parentPartIds = [];
                    if (e.response.CartLines.length > 0) {
                        $(document).trigger(argosyEvents.START_LOADING, {
                            name: that.constructor.name
                        });
                        that.cartViewModel.showWarningAboutApprovalWorkflow = e.response.ShowWarningAboutApprovalWorkflow;
                        that.cartViewModel.approvalWorkflowWarningMsg = e.response.ApprovalWarningMessage;
                        that.cartViewModel.accountingUnits = (e.response.ShowAccountingUnits ? e.response.AccountingUnits : []);
                        that.cartViewModel.defaultAccountUnit = (e.response.ShowAccountingUnits ? e.response.DefaultAccountingUnit : null);
                        userSettings.SaveAccountingUnitsToOrderLine = userSettings.SaveAccountingUnitsToOrderLine && e.response.ShowAccountingUnits;
                        $.each(e.response.CartLines, function() {
                            var line = this,
                                foundQtyInDiscounts = false;
                            that.parts.push(line.Part);
                            if (line.ParentPartId > 0 && $.grep(parentPartIds, function(parentPartId) { return parentPartId === line.ParentPartId}).length === 0) {
                                parentPartIds.push(line.ParentPartId);
                            }
                            partIds.push(line.PartId);
                            if (line.Part.IsEdeliveryOnly) {
                                line.IsEdelivery = true;
                            }
                            if (line.Part.IsLimitPartOrderQuantity && !line.IsMailingList) {
                                $.each(line.Part.Discounts,
                                    function(e) {
                                        var discount = this;
                                        if (discount.Quantity === line.Quantity) {
                                            foundQtyInDiscounts = true;
                                            return false;
                                        }
                                    });

                                if (foundQtyInDiscounts === false && line.Part.Discounts.length > 0) {
                                    line.Quantity = line.Part.Discounts[0].Quantity;
                                }
                            }
                            line.ConfiguredParts = [];
                        });


                        if (parentPartIds.length > 0) {
                            that.cartViewModel.getRemoteParts(parentPartIds,
                                function(parts) {
                                    $(parts)
                                        .each(function(i, part) {
                                            that.parts.push(part);
                                            partIds.push(part.PartId);
                                            var configuredParts = $.grep(e.response.CartLines,
                                                function(line) {
                                                    return line.ParentPartId === part.PartId;
                                                });

                                            function sortByPartId(a, b) {
                                                return ((a.PartId < b.PartId) ? -1 : ((a.PartId > b.PartId) ? 1 : 0));
                                            }

                                            configuredParts.sort(sortByPartId);
                                            var parentCartLine = $.extend({},
                                                configuredParts[0],
                                                {
                                                    Part: part,
                                                    CartId: 0,
                                                    PartId: part.PartId,
                                                    IsKit: false,
                                                    Quantity: 0,
                                                    Price: 0,
                                                    UnitPrice: 0,
                                                    ParentPartId: 0,
                                                    ConfiguredParts: configuredParts,
                                                    TotalConfiguredParts: 0
                                                });
                                            $(configuredParts)
                                                .each(function(x, line) {
                                                    parentCartLine.Price += line.Price;
                                                    parentCartLine.TotalConfiguredParts += line.Quantity;
                                                });

                                            e.response.CartLines = $.grep(e.response.CartLines,
                                                function(line) {
                                                    return line.ParentPartId !== part.PartId;
                                                });
                                            e.response.CartLines.push(parentCartLine);
                                        });
                                    that.cartViewModel.onDataProcessComplete(e.response.CartLines, partIds);
                                });
                        } else {
                            that.cartViewModel.onDataProcessComplete(e.response.CartLines, partIds);
                        }
                       
                    } else {
                        that.cartViewModel.onDataProcessComplete(e.response.CartLines, partIds);
                    }
                }
            }
        });

    that.cartViewModel = kendo.observable({
        showWarningAboutApprovalWorkflow: false,
        approvalWorkflowWarningMsg: "",
        partIds: [],
        cartLines: [],
        accountingUnits: [],
        cartSource: cartSource,
        lines: [],
        isMailingList: false,
        mailingListCost: 0,
        mailingListCostText: "",
        thirdPartyListCost: 0,
        thirdPartyListCostText: "",
        subTotalText: "",
        isDiscount: false,
        discountCost: 0,
        discountCostText: "",
        updateSubtotal: function () {
            var subTotalSelector = $(that.options.cartSubTotalSelector),
                subTotal = 0,
                kendoObj = this;

            subTotalSelector.html("Loading...");
            block(subTotalSelector, "", true);
            subTotal = kendoObj.subTotal();
            subTotalSelector.html(subTotal);
            $(subTotalSelector).unblock();
        },
        getTotalConfiguredParts: function (data) {
            var parentLines = $.grep(this.cartLines, function (line) {
                return line.PartId === data.ParentPartId;
            });
            var totalParts = 0;
            $(parentLines).each(function (e) {
                $(this.ConfiguredParts).each(function (i) {
                    totalParts += this.Quantity;
                });
            });
            return totalParts;
        },
        onDataProcessComplete: function (data, partIds) {
            that.showCartIf(partIds.length);
            that.cartViewModel.partIds = partIds;
            setTimeout(function (e) {
                that.cartViewModel.setCartLines(data, true);
                /*if (userSettings.SaveAccountingUnitsToOrderLine) {
                    that.cartViewModel.getAccountingUnits();
                }*/
                // hack to ensure the page has rendered before this is fired.
                addArgosyActions();
                $(document).trigger(argosyEvents.END_LOADING, {
                    name: that.constructor.name
                });
            }, 250);
        },
        getRemoteParts: function (partIds, callback) {
            $.ajax({
                url: "/Store/Part/GetPartsById/",
                data: {
                    ids: partIds
                },
                type: "GET",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (p) {
                    callback(p);
                }
            });
        },
        getConfiguredPartName: function (e) {
            var name = e.Part.PartName.replace(e.parent().parent().Part.PartName, "").trim();
            if (name.indexOf("-") === 0) {
                name = name.substring(1, name.length);
            }
            return name;
        },
        getFormatedUnitPrice: function (e) {
            return kendo.toString(e.UnitPrice, "C");
        },
        getFormatedPrice: function (e) {
            return kendo.toString(e.Price, "C");
        },
        getFormatedDiscount: function (e) {
            return "-" + kendo.toString(e.Discount, "C");
        },
        isDiscounted: function (e) {
            return e.Discount > 0;
        },
        subTotal: function () {
            var kendoObj = this,
                cartLines = kendoObj.get("cartLines"),
                subTotal = 0;
            $(cartLines).each(function () {
                var line = this;
                subTotal += line.Price;
            });
            subTotal += kendoObj.mailingListCost;
            subTotal += kendoObj.thirdPartyListCost;
            subTotal -= kendoObj.discountCost;
            return kendo.toString(subTotal, "C");
        },
        userSettings: that.getUserSettings(),
        setEdelivery: function (e) {
            var kendoObj = this;
            e.data.IsEdelivery = true;
            e.data.PreviousQuantity = e.data.Quantity;
            e.data.Quantity = 1;
            kendoObj.updateLine(e);

        },
        removeEdelivery: function (e) {
            var kendoObj = this;
            e.data.IsEdelivery = false;
            if (e.data.PreviousQuantity != null) {
                e.data.Quantity = e.data.PreviousQuantity;
                e.data.PreviousQuantity = null;
            }
            kendoObj.updateLine(e);
        },
        notAllConfiguredParts: function (data) {
            return $.grep(this.cartLines, function (line) {
                return line.ConfiguredParts != null && line.ConfiguredParts.length > 0
            }).length !== this.cartLines.length;
        },
        hasAccountingUnits: function (data) {
            return userSettings.SaveAccountingUnitsToOrderLine;
        },
        showToolTip: function (e) {
            var tooltip = $(e.currentTarget).getKendoTooltip(),
                part = e.data.Part,
                template = kendo.Template.compile($('#_PriceBreakGridViewtemplate').html())(part.Discounts);
            if (tooltip == null) {
                tooltip = $(e.currentTarget).kendoTooltip({
                    autoHide: false,
                    content: template,
                    position: "right",
                    showOn: "click",
                    show: function (e) {
                        if (part.showHighlight) {
                            var rowToSelect = null;
                            var rows = $(e.sender.popup.element).find("table tbody tr");
                            $(rows).each(function (i, row) {
                                row = $(row);
                                var minVal = row.attr("data-min-value");
                                var maxVal = row.attr("data-max-value");
                                if (minVal < maxVal && part.highlightQuantity >= minVal && part.highlightQuantity <= maxVal) {
                                    rowToSelect = row;
                                } else if (minVal <= part.highlightQuantity) {
                                    rowToSelect = row;
                                }
                            });
                            rowToSelect.addClass("k-state-selected");
                        }
                    }
                }).data("kendoTooltip");
                tooltip.show();
            }
        },
        priceBreakSelectedValue: function (line) {
            var currentQty = line.Quantity,
                kendoObj = this,
                foundQtyInDiscounts = false;

            $.each(line.Part.Discounts, function (e) {
                var discount = this;
                if (discount.Quantity === currentQty) {
                    foundQtyInDiscounts = true;
                    return false;
                }
            });
            if (foundQtyInDiscounts === false) {
                line.Quantity = line.Part.Discounts[0].Quantity;
            }

            return line.Quantity;
        },
        priceBreakDataBound: function (e) {
            var $dropDown = $(e.sender.element),
                containerWidth = 70;
            $dropDown.data("kendoDropDownList").list.width("auto");
            $dropDown.closest(".k-widget").width(containerWidth);
        },
        getUnitPriceFromPriceBreaks: function (discounts, qty) {
            var foundDiscount = 0;
            $(discounts).each(function () {
                var priceBreak = this;

                if (qty <= priceBreak.Quantity) {
                    foundDiscount = priceBreak.Discount;
                    return false;
                }
            });
            if (foundDiscount === 0) {
                foundDiscount = discounts[discounts.length - 1].Discount;
            }
            return foundDiscount;
        },
        dateCleaner: function (date) {
            try {
                date = new Date(parseInt(date.replace(/\/Date\((.*?)\)\//gi, "$1")));
            } catch (ex) { }
            return date;
        },
        priceBreakDropdownChange: function (e) {
            var kendoObj = this,
                cartLines = kendoObj.get("cartLines"),
                cartLine = e.data;

            if (cartLine.Part.IsLimitPartOrderQuantity && !cartLine.IsEdelivery && cartLine.Part.Discounts != null && cartLine.Part.Discounts.length > 0) {
                var qty = $('#priceBreakDropDown' + cartLine.CartId).getKendoDropDownList().value();
                cartLine.Quantity = parseInt(qty);
            }
            kendoObj.setCartLines(cartLines);
        },
        updateConfiguredPartQuantity: function (partId, quantity, cartId) {
            var that = this,
                cartLines = that.get("cartLines"),
                lineToUpdate = null;
            $.each(cartLines, function (e, cartLine) {
                if (cartLine.CartId === cartId) {
                    lineToUpdate = cartLine;
                } else {
                    $(cartLine.ConfiguredParts).each(function (i, childCartLine) {
                        if (childCartLine.CartId === cartId) {
                            lineToUpdate = childCartLine;
                        }
                    });
                }
            });
            if (lineToUpdate != null) {
                lineToUpdate.Quantity = quantity;
                if (lineToUpdate.Part.Discounts.length > 0) {
                    lineToUpdate.UnitPrice = that.getUnitPriceFromPriceBreaks(lineToUpdate.Part.Discounts, lineToUpdate.Quantity);
                }
                lineToUpdate.Price = lineToUpdate.UnitPrice * lineToUpdate.Quantity;
            }
            
        },
        updateLine: function (e) {
            var kendoObj = this,
                cartLines = kendoObj.get("cartLines"),
                cartLine = e.data;

            cartLine.DateCreated = kendoObj.dateCleaner(cartLine.DateCreated);

            var ddl = $('#priceBreakDropDown' + cartLine.CartId);
            if (cartLine.Part.IsLimitPartOrderQuantity && !cartLine.IsEdelivery && cartLine.Part.Discounts != null && cartLine.Part.Discounts.length > 0 && ddl.length > 0) {
                var qty = ddl.getKendoDropDownList().value();
                cartLine.Quantity = parseInt(qty);
            }
            if (cartLine.Part.Discounts.length > 0) {
                cartLine.UnitPrice = kendoObj.getUnitPriceFromPriceBreaks(cartLine.Part.Discounts, cartLine.Quantity);
                $('[data-cartline-id="' + cartLine.CartId + '"]').text(kendo.toString(cartLine.UnitPrice, "c"));
            }

            cartLine.Price = cartLine.UnitPrice * cartLine.Quantity;

            kendoObj.setCartLines(cartLines, true);
            
        },
        checkForEedlivery: function (e) {
            if (e.IsEdelivery) {
                return true;
            } else {
                return false;
            }
        },
        checkForPhysicalDelivery: function (e) {
            if (e.IsEdelivery) {
                return false;
            } else {
                return true;
            }
        },
        hiddenIfEdeliveryNotAllowed: function (e) {
            if (e.Part.IsEdeliveryOnly) {
                return true;
            } else if (e.Part.IsEdeliveryAllowed) {
                return false;
            } else {
                return true;
            }
        },
        hiddenIfKitWithoutPersonalizedItems: function (e) {
            if (e.PersonalizedPartsInKit !== undefined && e.PersonalizedPartsInKit !== null && e.PersonalizedPartsInKit.length > 0) {
                return false;
            } else {
                return true;
            }
        },
        isConfiguredPart: function (e) {
            return e.ConfiguredParts.length > 0;
        },
        isNotConfiguredPart: function (e) {
            return e.ConfiguredParts.length === 0;
        },
        hideOverPartLimitMessage: function (e) {
            var kendoObj = this,
                overPartLimit = kendoObj.overPartLimit(e);
            if (overPartLimit) {
                return false;
            } else {
                return true;
            }
        },
        hideMaxOrderQty: function (e) {
            var kendoObj = this,
                userSettings = kendoObj.get("userSettings");
            if (userSettings.IsMaxOrderQtyVisible) {
                return false;
            }
            return true;
        },
        hideInventory: function (e) {
            var kendoObj = this,
                userSettings = kendoObj.get("userSettings");
            if (userSettings.IsInventoryInformationVisible || e.ConfiguredParts.length > 0) {
                return false;
            }
            return true;
        },
        overPartLimit: function (e) {
            var kendoObj = this,
                settings = kendoObj.get("userSettings"),
                cartLine = e,
                overLimit = false,
                orderLimit = null;
            if (cartLine.CurrentPartLimits != null) {
                orderLimit = cartLine.CurrentPartLimits.OrderedPartLimit;
            }

            if (settings.ShowPartLimits) {
                if (orderLimit != null) {
                    if (orderLimit.LimitQty - orderLimit.TotalOrdered <= 0) {
                        overLimit = true;
                    }
                }
            }
            return overLimit;
        },
        noEdeliveryItems: function (e) {
            var kendoObj = this,
                cartLine = e,
                isEdelivery = false;
            if (cartLine == null) {
                // header column 
                $.each(kendoObj.cartLines, function (i) {
                    if (!isEdelivery) {
                        isEdelivery = this.Part.IsEdeliveryAllowed || this.Part.IsEdeliveryOnly;
                    }
                });
            } else {
                // cartline column
                isEdelivery = cartLine.Part.IsEdeliveryAllowed || cartLine.Part.IsEdeliveryOnly;
            }
            return !isEdelivery;
        },
        emptyCart: function () {
            var kendoObj = this,
                message = {
                    question: "You are about to remove all items in your cart, are you sure you want to continue?",
                    description: "",
                    button: "Clear Cart",
                    type: "warning",
                    yes: function (e) {
                        $.fancybox.close();
                        $.ajax({
                            url: "/store/cart/ClearCart",
                            dataType: "json",
                            type: "POST",
                            contentType: "application/json; charset=utf-8",
                            success: function (e) {
                                $(that.options.cartSubTotalSelector).html('');
                                that.showCartIf(false);
                                $(document).trigger(argosyEvents.ITEM_DELETED_FROM_CART);
                            },
                            error: function () {
                                var promptData = {
                                    message: "Unable to clear item(s), please contact support.",
                                    type: "error"
                                };
                                $(document).trigger(argosyEvents.PROMPT_NOTIFY, promptData);
                            }
                        });
                    }
                };
            prompt.alert(message);
        },
        addSavedToCart:function(line) {
            var kendoObj = this,
                cartLine = line.data;
            var cartLines = [cartLine]
            if (cartLine.ConfiguredParts != null && cartLine.ConfiguredParts.length > 0) {
                cartLines = cartLine.ConfiguredParts;
            }
            $.ajax({
                url: "/store/cart/MoveSavedCartlineToCart",
                dataType: "json",
                type: "POST",
                data: JSON.stringify({
                    lines: cartLines
                }),
                contentType: "application/json; charset=utf-8",
                complete: function (e) {
                    that.cartViewModel.cartSource.read();
                    $(document).trigger(argosyEvents.EVENT_SAVED_CARTLINE_ADDED_TO_SHOPPING_CART);
                }
            });
        },
        deleteLine: function (line) {
            var kendoObj = line.data.ParentPartId > 0 ? line.data.parent().parent().parent().parent() : this,
                cartLine = line.data,
                dataSource = kendoObj.get("cartLines");

            var index = dataSource.indexOf(cartLine);

            if (cartLine.ParentPartId > 0) {
                var parentLine = line.data.parent().parent();
                var childIndex = parentLine.ConfiguredParts.indexOf(cartLine);
                index = dataSource.indexOf(parentLine);
                if (childIndex >= 0) {
                    dataSource[index].ConfiguredParts.splice(childIndex, 1);
                    dataSource[index].Price -= cartLine.Price;
                }
                if (dataSource[index].ConfiguredParts.length !== 0) {
                    index = -1;
                }
            }

            if (index >= 0) {
                dataSource.splice(index, 1);
            }
            kendoObj.setCartLines(dataSource, true);

            $.ajax({
                url: "/store/cart/DeleteCartLine",
                dataType: "json",
                data: JSON.stringify(cartLine),
                type: "POST",
                contentType: "application/json; charset=utf-8",
                success: function (e) {
                    var success = e.ReturnCode === ReturnCode.Success,
                        message = "Item deleted.",
                        type = "success";

                    if (!success) {
                        message = e.Message;
                        type = "error";
                    }
                    var promptData = {
                        message: message,
                        type: type
                    };
                    $(document).trigger(argosyEvents.ITEM_DELETED_FROM_CART);
                    $(document).trigger(argosyEvents.PROMPT_NOTIFY, promptData);
                    kendoObj.updateSubtotal();
                },
                error: function () {
                    var promptData = {
                        message: "Unable to delete item, please contact support.",
                        type: "error"
                    };
                    $(document).trigger(argosyEvents.PROMPT_NOTIFY, promptData);
                }
            });
        },
        goShopping: function () {
            window.location = $("#logo_header").attr('href');
        },
        personalizedKitItems: [],
        setCartLines: function (lines, rebind) {
            var kendoObj = this,
                mailingListCost = 0,
                thirdPartyListCost = 0,
                discountTotal = 0;
            kendoObj.set("cartLines", lines);
            $(lines).each(function (i, line) {
                if (line.IsMailingList) {
                    mailingListCost += line.MailingListCost;
                }
                if (line.IsThirdPartyList) {
                    thirdPartyListCost += line.ThirdPartListCost;
                }
                if (line.Discount > 0) {
                    discountTotal += line.Discount;
                }
            });
            kendoObj.set("isMailingList", mailingListCost > 0);
            kendoObj.set("mailingListCostText", kendo.toString(mailingListCost, "c"));
            kendoObj.set("mailingListCost", mailingListCost);
            kendoObj.set("isThirdPartyList", thirdPartyListCost > 0);
            kendoObj.set("isDiscount", discountTotal > 0);
            kendoObj.set("discountCost", discountTotal);
            kendoObj.set("discountCostText", "-" + kendo.toString(discountTotal, "c"));
            kendoObj.set("thirdPartyListCostText", kendo.toString(thirdPartyListCost, "c"));
            kendoObj.set("thirdPartyListCost", thirdPartyListCost);
            if (rebind) {
                kendo.unbind($(that.options.shoppingCartBindSection));
                kendo.bind($(that.options.shoppingCartBindSection), kendoObj);
            }
            kendoObj.set("subTotalText", kendoObj.subTotal());
            addArgosyActions();
        },
        loadPartLimits: function () {
            var kendoObj = this,
                cartLines = kendoObj.get("cartLines"),
                partIds = kendoObj.get("partIds");

            if (partIds.length > 0) {
                $.ajax({
                    url: "/store/cart/GetPartLimits",
                    dataType: "text json",
                    data: JSON.stringify(partIds),
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    success: function (e) {
                        var rebind = false;
                        $.each(e, function () {
                            var currentPartLimit = this,
                                partId = currentPartLimit.PartId;
                            $.each(cartLines, function () {
                                var line = this;
                                if (line.PartId === partId) {
                                    rebind = true;
                                    line.CurrentPartLimits = new kendo.data.ObservableObject(currentPartLimit);
                                }
                            });
                        });
                        if (rebind === true) {
                            kendoObj.setCartLines(cartLines);
                        }
                    }
                });
            }
        },
        getAccountingUnits: function () {
        },
        accountingUnitsChange: function (e) {
            var kendoObj = this,
                cartLines = kendoObj.get("cartLines"),
                dropDown = e.sender,
                cartId = dropDown.element.data("cartId"),
                unit = dropDown.value();

            $.each(cartLines, function (e, cartline) {
                if (cartline.CartId === cartId) {
                    cartline.AccountingUnitId = unit;
                    cartline.ChildCartLines = ((cartline.ConfiguredParts != null && cartline.ConfiguredParts.length > 0) ? cartline.ConfiguredParts : cartline.ChildCartLines);
                    $.ajax({
                        url: "/store/cart/UpdateCartAccountingUnit",
                        dataType: "text json",
                        data: JSON.stringify(cartline),
                        type: "POST",
                        contentType: "application/json; charset=utf-8",
                        success: function (e) {
                        }
                    });
                    return false;
                }
            });
            kendoObj.setCartLines(cartLines);
        },
        accountingUnitsDataBound: function (e) {
            var kendoObj = this,
                dropDown = e.sender,
                cartLines = kendoObj.get("cartLines"),
                cartId = dropDown.element.data("cartId");

            var result = $.grep(cartLines, function (line) {
                return line.CartId === cartId;
            });
            if (result.length > 0 && result[0].AccountingUnitId !== null) {
                dropDown.value(result[0].AccountingUnitId);
            } else if (dropDown.select() === -1) {
                dropDown.select(0);
            }
        },
        showProductDetails: function (e) {
            if (that.productDetailControl != null) {
                that.productDetailControl.show(e.data);
                addArgosyActions();
            }
        },
        addProductToCart: function (e) {
            var partToAdd = {
                qty: 1,
                partId: e.data.PartId
            };
            sendPartToCart(partToAdd, e.data.PartName);
        },
        getPart: function (partId) {
            var kendoObj = this,
                cartLines = kendoObj.get("cartLines"),
                part = null;
            if (cartLines.length > 0) {
                $.each(cartLines, function (e) {
                    if (this.PartId === partId) {
                        part = this.Part;
                        return false;
                    }
                });
            }
            return part;
        },
        flattenCartLines: function (cartLines) {
            var submitLines = [];
            $(cartLines).each(function (e) {
                if (this.ConfiguredParts.length === 0) {
                    submitLines.push(this);
                } else {
                    $(this.ConfiguredParts).each(function (e) {
                        submitLines.push(this);
                    });
                }
            });
            return submitLines;
        },
        updateCartLines: function (cartLines, returnedLines, ignorePricing) {
            var that = this;
            var parentPrice = 0;
            if (ignorePricing == null) {
                ignorePricing = false;
            }
            $.each(cartLines, function (e, line) {
                var children = line.ConfiguredParts;
                if (children.length > 0) {
                    line.Price = ignorePricing ? line.Price : that.updateCartLines(children, returnedLines);
                    var childLines = $.grep(returnedLines, function (childLine) {
                        return childLine.ParentPartId === line.PartId;
                    });
                    if (childLines != null && childLines.length > 0) {
                        line.CartStatus = childLines[0].CartStatus;
                        line.CartStatusMessage = childLines[0].CartStatusMessage;
                    }
                } else {
                    var result = $.grep(returnedLines, function (returnedLine) {
                        return returnedLine.CartId === line.CartId;
                    });

                    if (result && result.length > 0) {
                        if (!ignorePricing) {
                            line.UnitPrice = result[0].UnitPrice;
                            line.Price = result[0].Price;
                            line.Discount = result[0].Discount;
                            line.DiscountId = result[0].DiscountId;
                            line.DiscountName = result[0].DiscountName;
                            parentPrice += line.Price;
                        }
                        line.CartStatus = result[0].CartStatus;
                        line.CartStatusMessage = result[0].CartStatusMessage;
                        line.ShowOverrideMessage = result[0].ShowOverrideMessage;
                        line.OverrideCartMessage = result[0].OverrideCartMessage;
                    }
                }
            });
            return parentPrice;
        }
    });

    $(document).bind(argosyEvents.EVENT_PART_INPUT_QTY_CHANGED, function (e, data) {
        that.cartViewModel.updateConfiguredPartQuantity(data.partId, data.value, data.cartId);
    });

    cartSource.read();
};
ShoppingCartSavedView.prototype.showCartIf = function (show) {
    var that = this;
    if (show) {
        $(that.options.shoppingCartBindSection).removeClass('hidden');
        $(that.options.emptyCartSelector).addClass('hidden');
    } else {
        $(that.options.shoppingCartBindSection).addClass('hidden');
        $(that.options.emptyCartSelector).removeClass('hidden');
    }
};
ShoppingCartSavedView.prototype.getUserSettings = function () {
    var that = this;
    return new kendo.data.ObservableObject(window[that.options.userSettings]);
};
ShoppingCartSavedView.prototype.setupEventListeners = function () {
    var that = this;
    $(document).bind(argosyEvents.SHOW_KIT_INVENTORY_DETAILS_MODAL, function (e, partId) {
        if (that.productDetailControl != null) {
            var part = that.cartViewModel.getPart(parseInt(partId));
            $(document).trigger(argosyEvents.START_LOADING, {
                name: that.constructor.name
            });
            that.productDetailControl.show(part, true, true);
        }
    });
    $(document).bind(argosyEvents.PART_ADDED_TO_CART, function (e, data) {
        $.fancybox.close();
        that.cartViewModel.cartSource.read();
    });
    $(document).bind(argosyEvents.SHOW_PART_QUANTITY_MODAL, function (e, partId) {

        var part = that.cartViewModel.getPart(partId);
        if (part === null) {
            var search = {
                Take: 1,
                Skip: 0,
                PartId: partId
            };

            $.ajax({
                url: "/DataView/GetParts",
                dataType: "json",
                data: search,
                success: function (result) {
                    if (result.ReturnCode == ReturnCode.Failed) {
                        handleDataSourceException(result);
                    } else {
                        showPartQuantityModal(result.Records[0]);
                    }
                }
            });
        } else {
            showPartQuantityModal(part);
        }
    });
};