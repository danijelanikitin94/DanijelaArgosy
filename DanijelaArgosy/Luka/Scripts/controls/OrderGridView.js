function OrderGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID,
        function(e, data) {
            that.refineSearch(data);
        });
    that.refineSearch({});
}

OrderGridView.prototype.options = {};

OrderGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=OrderGridView]",
    adminGridView: false
};

OrderGridView.prototype.searchCriteria = {
    Username: null,
    Keyword: null,
    OrderTag: null,
    OrderNumber: null,
    ProofName: null,
    StatusId: null,
    OrderDateStart: null,
    OrderDateEnd: null,
    UserGroup: null,
    UserId: null,
    PartName: null,
    SKU: null,
    PurchaseOrderNumber: null,
    Custom01: null,
    Country: null,
    State: null,
    City: null,
    Zip: null,
    Phone: null,
};

OrderGridView.prototype.refineSearch = function(data) {
    var that = this;
    $.extend(true, that.searchCriteria, data);
    that.setupGrid();
};

OrderGridView.prototype.setupGrid = function() {
    var that = this,
        grid = $(that.options.gridViewSelector).getKendoGrid();
    if (grid == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            dataBound: function() {
                $("div[data-role='countries']").data("kendoCountries").value(219);
                $("div[data-argosy-view=OrderGridView] th:eq(3),div[data-argosy-view=OrderGridView]  tr td:nth-child(4)")
                    .addClass("hidden-sm hidden-xs");
                $("div[data-argosy-view=OrderGridView] th:eq(5),div[data-argosy-view=OrderGridView]  tr td:nth-child(6)")
                   .addClass("hidden-sm hidden-xs");
                $("div[data-argosy-view=OrderGridView] th:eq(7),div[data-argosy-view=OrderGridView]  tr td:nth-child(8)")
                    .addClass("hidden-sm hidden-xs");
                $("div[data-argosy-view=OrderGridView] th:eq(8),div[data-argosy-view=OrderGridView]  tr td:nth-child(9)")
                    .addClass("hidden-sm hidden-xs");
            },
            pageable: {
                refresh: true,
                pageSizes: [50, 100, 200],
                buttonCount: 3
            },
            columns: [
                {
                    title: "~{OrderNumber}~",
                    field: "OrderNumber",
                    template: "<a href='/" +
                        (that.options.adminGridView ? "Admin" : "Account") +
                        "/Orders/Edit/${OrderNumber}'>${OrderNumber}</a>"
                },
                {
                    title: "~{Date}~",
                    field: "OrderDate",
                    template: "${kendo.toString(kendo.parseDate(OrderDate),\"MM/dd/yyyy\")}"
                },
                {
                    title: "~{User}~",
                    template: kendo.Template.compile($("#_OrderUserName").html())({ FirstName: "${FirstName}", LastName: "${LastName}"})
                },
                {
                    title: "~{OrderTag}~",
                    field: "OrderTag"
                },
                {
                    title: "~{Status}~",
                    field: "Status",
                    template: "<span class='bold'>#=renderOrderStatus(Status)#</span>"
                },
                {
                    title: "~{Carrier}~",
                    field: "CarrierName"
                },
                {
                    title: "<span class='floatr'>Total</span>",
                    field: "OrderTotal",
                    template: "<div class='grid-price'>${OrderTotal > 0 ?kendo.toString(OrderTotal,'c'):kendo.toString(0,'c')}</div>",
                    hidden: !userSettings.IsPriceInformationVisible
                }
            ],
            search: [
                { name: "OrderTag", type: "text", placeholder: "~{OrderTag}~", toolbar: false },
                { name: "OrderNumber", type: "text", placeholder: "~{OrderNumber}~", toolbar: false },
                { name: "Keyword", type: "text", placeholder: "~{SearchByOrderNumberUserTagsStatus}~", toolbar: true },
                { name: "ProofName", type: "text", placeholder: "~{ProofName}~", toolbar: false },
                { name: "StatusId", type: "select", toolbar: true, data: MaskedOrderStatuses },
                { name: "OrderDateStart", type: "date", placeholder: "~{From}~", toolbar: false },
                { name: "OrderDateEnd", type: "date", placeholder: "~{To}~", toolbar: false },
                { name: "UserGroup", type: "argosy", 'data-argosy-control': "GlobalUserGroupDropDown" },
                { name: "UserId", type: "argosy", 'data-argosy-control': "GlobalUserDropDown" },
                { name: "PartName", type: "text", placeholder: "~{Product}~", toolbar: false },
                { name: "SKU", type: "text", placeholder: "~{SKU}~", toolbar: false },
                { name: "PurchaseOrderNumber", type: "text", placeholder: "~{PONumber}~", toolbar: false },
                { name: "Custom01", type: "text", placeholder: "~{Custom}~", toolbar: false },
                { type: "div", name: "Country", 'data-role': "countries" },
                { type: "div", name: "State", 'data-role': "states" },
                { name: "City", type: "text", placeholder: "~{City}~", toolbar: false },
                { name: "Zip", type: "text", placeholder: "~{ZipCode}~", toolbar: false },
                { name: "Phone", type: "text", placeholder: "~{Phone}~", toolbar: false },
                { name: "ShipTo", type: "text", placeholder: "Ship To", toolbar: false }
            ]
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        grid.dataSource.read();
    }
};

OrderGridView.prototype.getCountries = function(dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function(options) {
            var search = {};
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetCountries",
                dataType: "json",
                data: (search),
                success: function(result) {
                    if (result.ReturnCode === ReturnCode.Failed) {
                        handleDataSourceException(result);
                    } else {
                        result.Records.forEach(function(record) {
                            if (record.CountryCode === "US") {
                                var index = result.Records.indexOf(record);
                                result.Records.splice(index, 1);
                                result.Records.splice(0, 1, record);
                            }
                        });
                        options.success(result);
                    }
                }
            });
        }
    };
    that.dataSourceOpts.pageSize = 1000;
    return that.dataSourceOpts;
};

OrderGridView.prototype.getDataSource = function(dataSourceOpts) {
    var that = this;
    $(document).trigger(argosyEvents.START_LOADING);
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function(options) {
            var search = {
                ShowUserOrdersOnly: !that.options.adminGridView,
                IsIndex: true
            };
            // can't reference that.searchCriteria the other way
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetOrders",
                dataType: "json",
                data: search,
                success: function(result) {
                    $(document).trigger(argosyEvents.END_LOADING);
                    if (result.ReturnCode === ReturnCode.Failed) {
                        handleDataSourceException(result);
                    } else {
                        options.success(result);
                    }
                }
            });
        }
    };
    return new kendo.data.DataSource(that.dataSourceOpts);
};

OrderGridView.prototype.getStatus = function() {
};

OrderGridView.prototype.dataSourceOpts = {};