function RmaOrderDetailGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.search({});
    });
    that.search({});
}
RmaOrderDetailGridView.prototype.options = {};
RmaOrderDetailGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=RmaOrderDetailGridView]"
};
RmaOrderDetailGridView.prototype.search = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: false,
            selectable: false,
            exportToExcel: false,
            columns: [
                               {
                    title: "~{SKU}~",
                    field: "Sku"
                },
                {
                    title: "~{Description}~",
                    field: "Description"
                },
                {
                    title: "~{Serial}~",
                    field: "SerialNumber"
                },
                {
                    title: "<span class='nowrap'>~{CustomIdentifier}~</span>",
                    field: "CustomIdentifier"
                },
                {
                    title: "<span class='floatr textr nowrap'>~{QtyShip}~</span>",
                    template: "<div class='textr'>#:kendo.toString(ShippedQty,'n0')#</div>"
                },
                {
                    title: "<span class='floatr textr nowrap'>~{QtyRec}~</span>",
                    template: "<div class='textr'>${ReceivedQty}</div>"
                },
                {
                    title: "~{DateRec}~",
                    field: "ReceivedDate",
                    template: "${kendo.toString(kendo.parseDate(ReceivedDate),\"MM/dd/yyyy\")}"
                }
            ],
            dataBinding: function (e) {
            },
            dataBound: function (e) {
                var gridElement = $(e.sender.element);
                var grid = gridElement.getKendoGrid();

                gridElement.find("tbody tr[role=row]").each(function () {
                    var descBtn = $(this).find(".fa.la.fa-search").parent();

                    var tooltip = $(this).kendoTooltip({
                        filter: "a",
                        width: 300,
                        position: "top"
                    }).data("kendoTooltip");
                });
                $("div[data-argosy-view=RmaOrderDetailGridView] th:eq(1) ,div[data-argosy-view=RmaOrderDetailGridView]  tr td:nth-child(2)").addClass("hidden-sm hidden-xs");
                $("div[data-argosy-view=RmaOrderDetailGridView] th:eq(2) ,div[data-argosy-view=RmaOrderDetailGridView]  tr td:nth-child(3)").addClass("hidden-sm hidden-xs");
                $("div[data-argosy-view=RmaOrderDetailGridView] th:eq(3) ,div[data-argosy-view=RmaOrderDetailGridView]  tr td:nth-child(4)").addClass("hidden-xs");
                $("div[data-argosy-view=RmaOrderDetailGridView] th:eq(4) ,div[data-argosy-view=RmaOrderDetailGridView]  tr td:nth-child(5)").addClass("hidden-xs");
            }
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

RmaOrderDetailGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetRmaOrderItems",
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

RmaOrderDetailGridView.prototype.dataSourceOpts = {};