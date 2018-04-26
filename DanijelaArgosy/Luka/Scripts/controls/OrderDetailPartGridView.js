function OrderDetailPartGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);

    var controlLoader = new ControlLoader();
    that.setupBindEvents();
    controlLoader.loadTemplate("OrderDetailPartGridView", function (template) {
        $(document.body).append(template);
        that.search({});
    });
}
OrderDetailPartGridView.prototype.options = {};
OrderDetailPartGridView.prototype.setupBindEvents = function () {
    var that = this;
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        if ($(that.options.gridViewSelector).getKendoGrid() == null) {
            setTimeout(function () {
                $(document).trigger(argosyEvents.SEARCH_PAGE_GRID, data);
            }, 500);
        } else {
            that.search({});
        }
    });
};
OrderDetailPartGridView.prototype.baseOptions = {
    isEditable: false,
    userId: null,
    parts:[],
    gridViewSelector: "div[data-argosy-view=OrderDetailPartGridView]"
};
OrderDetailPartGridView.prototype.orderSummary = null;
OrderDetailPartGridView.prototype.search = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: false,
            dataSource: that.getDataSource({}),
            dataBound: function (e) {
                if ($(that.options.gridViewSelector).data('kendoGrid').dataSource._group.length > 0) {
                    $(that.options.gridViewSelector + ' .k-grouping-row').filter(function (index) {
                        return ($(this).find("p")[0].textContent.trim() == "");
                    }).hide();
                    $(that.options.gridViewSelector + 'table tbody tr.k-grouping-row').parent().hide();
                } else {
                    $(that.options.gridViewSelector + 'table tbody tr.k-grouping-row').parent().show();
                }
                $(that.options.gridViewSelector).find("span.toggleRow").each(function (i, element) {
                    $(element).click(function (e) {
                        var parent = $(this).parents("tr");
                        var action = $(this).attr("action");
                        var currentLine = $(that.options.gridViewSelector).getKendoGrid().dataItem($(this).closest("tr"));
                        var quantity;
                        
                        if (action === "remove") {
                            parent.addClass("disabledInput");
                            quantity = 0;
                        } else {
                            parent.removeClass("disabledInput");
                            quantity = 1;
                        }
                        $(this).parents("tr").find("input.orderQuantity").each(function (index, element) {
                            $(element).val(quantity);
                        });
                        currentLine.OrderQty = quantity;
                        $(element).siblings("span.toggleRow").removeClass("hidden");
                        $(element).addClass("hidden");
                        $(document).trigger(argosyEvents.EVENT_UPDATE_ORDER_CALCULATION, {
                            orderLine: {
                                "Id": currentLine.LineId,
                                "CompanyUserId": that.options.userId,
                                "PartId": currentLine.PartId,
                                "BucketId":currentLine.BucketId,
                                "Quantity": currentLine.OrderQty,
                                "PartKitQuantity": 0,
                                "PromotionId": 0,
                                "UnitPrice": currentLine.UnitPrice,
                                "ChildItems": null,
                                "CustomizationState": null,
                                "DiscountAppliedQuantity": null,
                                "DiscountId": null,
                                "Discount": currentLine.Discount,
                                "ParentPartId": 0,
                                "PriceAggregateId": 42,
                                "IsEdelivery": currentLine.IsEdelivery,
                                "IsPriceAggregate": true,
                                "IsKit": false,
                                "IsMailingList": false,
                                "IsThirdPartyList": false,
                                "IsCustomized": false,
                                "MailingListCost": 0,
                                "ThirdPartListCost": 0,
                                "PrePressCharge": 0,
                                "DynamicSourceKey": null,
                                "ItemKey": null,
                                "Price": 0
                            }
                        });
                    });
                }),
                    $(that.options.gridViewSelector).find("input[type=number]").kendoNumericTextBox({
                        min: 0,
                        spinners: false,
                        step: 1,
                        format: "n0",
                        change: function (e) {
                            var element = $(e.sender.element),
                                currentLine = $(that.options.gridViewSelector).getKendoGrid().dataItem(element.closest("tr")),
                                newQty = e.sender.value(),
                                isOk = that.checkPartForMinMax(currentLine.PartId, newQty);
                            
                            if (isOk === true) {
                                currentLine.OrderQty = newQty;
                                $(document).trigger(argosyEvents.EVENT_UPDATE_ORDER_CALCULATION,
                                    {
                                        orderLine: {
                                            "Id": currentLine.LineId,
                                            "CompanyUserId": that.options.userId,
                                            "PartId": currentLine.PartId,
                                            "BucketId": currentLine.BucketId,
                                            "Quantity": currentLine.OrderQty,
                                            "PartKitQuantity": 0,
                                            "PromotionId": 0,
                                            "UnitPrice": currentLine.UnitPrice,
                                            "ChildItems": null,
                                            "CustomizationState": null,
                                            "DiscountAppliedQuantity": null,
                                            "DiscountId": null,
                                            "Discount": currentLine.Discount,
                                            "ParentPartId": 0,
                                            "PriceAggregateId": 42,
                                            "IsEdelivery": currentLine.IsEdelivery,
                                            "IsPriceAggregate": true,
                                            "IsKit": false,
                                            "IsMailingList": false,
                                            "IsThirdPartyList": false,
                                            "IsCustomized": false,
                                            "MailingListCost": 0,
                                            "ThirdPartListCost": 0,
                                            "PrePressCharge": 0,
                                            "DynamicSourceKey": null,
                                            "ItemKey": null,
                                            "Price": 0
                                        }
                                    });
                            } else {
                                e.sender.value(currentLine.OrderQty);
                            }
                        }
                    });
                $("div[data-argosy-view=OrderDetailPartGridView] th:eq(1),div[data-argosy-view=OrderDetailPartGridView]  tr td:nth-child(2)").addClass("hidden-xs");
                $("div[data-argosy-view=OrderDetailPartGridView] th:eq(4),div[data-argosy-view=OrderDetailPartGridView]  tr td:nth-child(5)").addClass("hidden-sm hidden-xs");
                $("div[data-argosy-view=OrderDetailPartGridView] th:eq(5),div[data-argosy-view=OrderDetailPartGridView]  tr td:nth-child(6)").addClass("hidden-sm hidden-xs");
                $("div[data-argosy-view=OrderDetailPartGridView] th:eq(8),div[data-argosy-view=OrderDetailPartGridView]  tr td:nth-child(9)").addClass("columnStatus");
                $("div[data-argosy-view=OrderDetailPartGridView] th:eq(9),div[data-argosy-view=OrderDetailPartGridView]  tr td:nth-child(10)").addClass("hidden-xs");
                
                kendo.bind($(that.options.gridViewSelector), {});
            },
            groupable: false,
            sortable: false,
            selectable: false,
            exportToExcel: false,
            columns: [
                {
                    title: "",
                    template: "<div class='textr'>${LineNo}</div>",
                    width: "20px"
                },
                {
                    field: "KitName",
                    hidden: true,
                    groupHeaderTemplate: "#if(value != null) { # ~{KitName}~: #= value # # } else {##}  # "
                },
                {
                    title: "~{Product}~",
                    field: "PartName",
                    encoded: false,
                    template: $("#_OrderDetailPartGridViewPartNameTemplate").html()
                },
                {
                    title: "<span class='floatr textr'>~{Qty}~</span>",
                    template: $("#_OrderDetailPartGridViewQuantityTemplate").html()
                },
                {
                    title: "<span class='floatr textr'>~{Shipped}~</span>",
                    template: $("#_OrderDetailPartGridViewShippedTemplate").html()
                },
                {
                    title: "<span class='globals-qtyavailable floatr textr'>~{Avail}~</span>",
                    template: $("#_OrderDetailPartGridViewAvailQtyTemplate").html(),
                    hidden: !that.options.showInventory
                },
                {
                    title: "<span class='floatr textr'>~{Subtotal}~</span>",
                    field: "OrderSubTotal",
                    template: $("#_OrderDetailPartGridViewSubtotalTemplate").html(),
                    hidden: !that.options.showPricing
                },
                {
                    title: "~{Status}~",
                    template: "<span class='bold'>${Status}</span>"
                },
                {
                    template: $("#_OrderDetailPartGridViewFlagsTemplate").html()
                }
            ]
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
        that.refreshGrid();
    } else {
        that.refreshGrid();
    }
};
OrderDetailPartGridView.prototype.checkPartForMinMax = function (partId,qty) {
    var that = this,
        foundPart = _.find(that.options.parts, function(o) { return o.PartId === partId; }),
        isOk = true;

    if (foundPart !== undefined) {
        isOk = checkBeforeAddingToCart(foundPart, qty, $(".test"));
        
    } else {
        $.ajax({
            url: "/Store/Part/GetPartById/" + partId,
            type: "GET",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            async: false,
            success: function(p) {
                that.options.parts.push(p);
                isOk = checkBeforeAddingToCart(p, qty, $(".test"));
            }
        });
    }
    return isOk;
};
OrderDetailPartGridView.prototype.refreshGrid = function () {
    var that = this;
    var grid = $(that.options.gridViewSelector).getKendoGrid();
    grid.dataSource.read();
    grid.refresh();
};


OrderDetailPartGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.group =
        {
            field: "KitName"
        };
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetOrderItems",
                dataType: "json",
                data: search,
                success: function (result) {
                    if (result.ReturnCode == ReturnCode.Failed) {
                        handleDataSourceException(result);
                    } else {
                        var numItems = $(result.Records).length;
                        $(result.Records).each(function (i, orderLine) {
                            orderLine.orderNumber = that.options.orderNumber;
                            orderLine.isAdmin = that.options.isAdmin;
                            orderLine.isEditable = that.options.isEditable;
                            orderLine.numItems = numItems;
                        });
                        options.success(result);
                    }
                }
            });
        }
    };
    return new kendo.data.DataSource(that.dataSourceOpts);
};

OrderDetailPartGridView.prototype.toggleRow = function (e, action) {
    var that = this;
    var currentLine = $(that.options.gridViewSelector).getKendoGrid().dataItem($(e.sender.element).closest("tr"));
}

OrderDetailPartGridView.prototype.dataSourceOpts = {};

OrderDetailPartGridView.prototype.getStatus = function () { };