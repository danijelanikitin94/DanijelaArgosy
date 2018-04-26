function OrderApprovalGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch({});

}

OrderApprovalGridView.prototype.options = {};

OrderApprovalGridView.prototype.baseOptions = {
    IncludeOrderTotal: true,
    gridViewSelector: "div[data-argosy-view=OrderApprovalGridView]",
};
OrderApprovalGridView.prototype.searchCriteria = {
    IsApprovalSearch: true
};

OrderApprovalGridView.prototype.refineSearch = function (data) {
    var that = this;
    data.IsApprovalSearch = true;
    that.searchCriteria = data;
    that.setupGrid();
};

OrderApprovalGridView.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            selectable: "multiple, row",
            pageable: {
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 5
            },
            columns: [
            {
                title: "~{OrderNumber}~",
                field: "OrderNumber",
                template: "<a href='/Account/OrderApprovals/Edit/${OrderNumber}'>${OrderNumber}</a>"
            },
            {
                title: "~{OrderDate}~",
                template: "${kendo.toString(kendo.parseDate(OrderDate),\"MM/dd/yyyy\")}"
            },
            {
                title: "~{User}~",
                template: "${FirstName} ${LastName}"
            },
            {
                title: "~{Approver}~",
                template: "${OrderApprover}",
                hidden: userSettings.IsApprovalWorkflow
            },
            {
                title: "~{ShippingInformation}~",
                template: "<div>${Address1}</div><div>${Address2}</div><div>${Address3}</div><div>${City}, ${StateName} ${Zip}</div>"
            },
            {
                title: "<span class='floatr textr'>~{Total}~</span>",
                field: "OrderTotal",
                template: "<div class='grid-price'>#:kendo.toString(OrderTotal,'c')#</div>",
                hidden: !userSettings.IsPriceInformationVisible
            }
            ],
            checkboxes: true,
            dataBinding: function (e) {
            },
            dataBound: function (e) {
                var gridElement = $(e.sender.element);
                var approveButton = gridElement.find(".k-button.k-button-icontext.k-grid-aprove");
                var rejectButton = gridElement.find(".k-button.k-button-icontext.k-grid-reject");

                approveButton.unbind("click");
                rejectButton.unbind("click");

                approveButton.click(function (clickEvent) {
                    that.showUpdatePartStateModal(that.getSelectedRecords(), "Approve");
                });
                rejectButton.click(function (clickEvent) {
                    that.showUpdatePartStateModal(that.getSelectedRecords(), "Reject");
                });
                $("div[data-argosy-view=OrderApprovalGridView] th:eq(3) ,div[data-argosy-view=OrderApprovalGridView]  tr td:nth-child(4)").addClass("hidden-xs");
                $("div[data-argosy-view=OrderApprovalGridView] th:eq(4) ,div[data-argosy-view=OrderApprovalGridView]  tr td:nth-child(5)").addClass(" hidden-xs");
            },
            toolbar: [
                { name: "reject", text: "~{Reject}~" },
                { name: "aprove", text: "~{Approve}~" },
            ],
            search: [
                { name: "Keyword", type: "text", placeholder: "~{SearchByOrderNumberUser}~", toolbar: true }
            ],
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

OrderApprovalGridView.prototype.showUpdatePartStateModal = function (orders, appovalOption) {
    var that = this;
    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function (e) {
            that.updateOrderState(orders, appovalOption);
        }
    };

    if (appovalOption == "Approve") {
        message.question = "~{WantToApproveOrder}~";
        message.description = "~{ApprovedOrdersIgnored}~";
        message.button = "~{Approve}~";
    } else {
        message.question = "~{WantToDenyOrder}~";
        message.description = "~{DeniedOrdersIgnored}~";
        message.button = "~{Reject}~";
    }
    prompt.alert(message);
};
OrderApprovalGridView.prototype.updateOrderState = function (orders, appovalOption) {
    var that = this;
    var params = { orderNumbers: orders, approvalOption: appovalOption, comments: "", overrideAll: false };
    $.ajax({
        url: '/Admin/Orders/ChangeOrderStatusByNumber',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            var grid = $(that.options.gridViewSelector).getKendoGrid();
            if (result.ReturnCode == ReturnCode.Success) {
                $(result.Records).each(function () {
                    prompt.notify({
                        question: result.Message != null && result.Message != "Success" ? result.Message : "Order " + this.Key + " has successfully changed its Status.",
                        type: (!this.Value ? "success" : "error")
                    });
                });
            } else {
                prompt.clientResponseError(result);
            }
            grid.dataSource.read();
        }
    });
    $.fancybox.close();
};
OrderApprovalGridView.prototype.getSelectedRecords = function () {
    var that = this;
    var selectedRecords = [];
    var item = "";
    var kendoGrid = $(that.options.gridViewSelector).getKendoGrid();

    $(kendoGrid.select()).each(function (i) {
        var data = kendoGrid.dataItem(this);
        item = data.OrderNumber;
        selectedRecords.push(item);  // when method modified to receive n items uncomment this line. selectedRecords will be array of strings.
    });
    return selectedRecords;
};

OrderApprovalGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetOrders",
                dataType: "json",
                data: search,
                success: function (result) {
                    if (result.ReturnCode == ReturnCode.Failed) {
                        handleDataSourceException(result);
                    } else {
                        options.success(result);
                    }
                },
                error: function (e) {
                }
            });
        }
    };
    return new kendo.data.DataSource(that.dataSourceOpts);
};

OrderApprovalGridView.prototype.dataSourceOpts = {};
