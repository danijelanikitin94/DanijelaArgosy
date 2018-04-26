function RMAOrdersGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);

    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch({});
}

RMAOrdersGridView.prototype.options = {};

RMAOrdersGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=RMAOrdersGridView]",
};

RMAOrdersGridView.prototype.searchCriteria = {
    //UserId: null
};

RMAOrdersGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

RMAOrdersGridView.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            dataBound: function (e) {
               
                $("div[data-argosy-view=RMAOrdersGridView] th:eq(3) ,div[data-argosy-view=RMAOrdersGridView]  tr td:nth-child(4)").addClass("hidden-sm hidden-xs");
                $("div[data-argosy-view=RMAOrdersGridView] th:eq(4),div[data-argosy-view=RMAOrdersGridView]  tr td:nth-child(5)").addClass("hidden-sm hidden-xs");
                $("div[data-argosy-view=RMAOrdersGridView] th:eq(6),div[data-argosy-view=RMAOrdersGridView]  tr td:nth-child(7)").addClass("hidden-sm hidden-xs");
            },
            groupable: false,
            sortable: true,
            pageable: {
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 5
            },
            columns: [
                {
                    title: "~{RMANumber}~",
                    field: "RMANumber",
                    template: "<a href='/Admin/RMA/Edit/${RMANumber}'>${RMANumber}</a>",
                },
                {
                    title: "~{RMADate}~",
                    field: "ReceivedDate",
                    template: "${kendo.toString(kendo.parseDate(ReceivedDate),\"MM/dd/yyyy\")}",
                },  {
                    title: "~{OrderNumber}~",
                    field: "OrderNumber",
                }, {
                    title: "~{User}~",
                    field:"OrderUserFullName"
                }, {
                    title: "~{Status}~",
                    field: "Status",
                    template: "<span class='bold'>${Status}</span>"
                }, {
                    title: "~{Carrier}~",
                    field: "CarrierName"
                }
                ],
            search: [
                { name: "Keyword", type: "text", placeholder: "~{SearchByRMANumberStatus}~", toolbar: true },
                {
                    name: "StatusId", type: "select", toolbar: true, data: RMAStatuses
                }
            ],
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

RMAOrdersGridView.prototype.getSelectedRecords = function () {
    var that = this;
    var selectedRecords = [];
    var kendoGrid = $(that.options.gridViewSelector).getKendoGrid();

    $(kendoGrid.select()).each(function (i) {
        selectedRecords.push(kendoGrid.dataItem(this));
    });

    return selectedRecords;
};

RMAOrdersGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {};
            // can't reference that.searchCriteria the other way
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetRMAOrders",
                dataType: "json",
                data: search,
                success: function (result) {
                    if (result.ReturnCode == ReturnCode.Failed) {
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

RMAOrdersGridView.prototype.dataSourceOpts = {};