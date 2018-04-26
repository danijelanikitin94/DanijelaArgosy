function ConsumerOrdersGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.setupGrid({});
}
ConsumerOrdersGridView.prototype.options = {};
ConsumerOrdersGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=ConsumerOrdersGridView]",
};
ConsumerOrdersGridView.prototype.searchCriteria = {
    //Sku: null
};

ConsumerOrdersGridView.prototype.setupGrid = function () {
    var that = this;
    if (that.kendoGrid == null) {
        var opts = {
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            scrollable: false,
            exportToExcel: false,
            pageable: {
                refresh: true,
                pageSizes: false,
                buttonCount: 1
            },
            columns: [
                {
                    title: "~{OrderNumber}~",
                    field: "OrderNumber",
                    template: "<a href='/Account/Orders/Edit/${OrderNumber}'>${OrderNumber}</a>",
                },
                {
                    title: "~{OrderDate}~",
                    field: "OrderDate",
                    template: "${kendo.toString(kendo.parseDate(OrderDate),\"MM/dd/yyyy\")}",
                    width: "200px"
                },
                {
                    title: "<div>~{Status}~</div>",
                    field: "Status",
                    template: "<span class='bold'>${Status}</span>"
                }
            ],
            title: "~{ConsumerOrders}~"
        };
        $(that.options.gridViewSelector).kendoCollapseGrid(opts);
        that.kendoGrid = $(that.options.gridViewSelector).getKendoCollapseGrid().getKendoGrid();
    } else {
        that.kendoGrid.dataSource.read();
        that.kendoGrid.refresh();
    }
};

ConsumerOrdersGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 5;
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
                }
            });
        }
    };
    return new kendo.data.DataSource(that.dataSourceOpts);
};

ConsumerOrdersGridView.prototype.dataSourceOpts = {};
