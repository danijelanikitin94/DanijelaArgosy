function OrderShippingInfoGridView(opts) {
    var that = this;

    $.extend(true, that.options, that.baseOptions, opts);
    that.setupGrid({});
}

OrderShippingInfoGridView.prototype.options = {};

OrderShippingInfoGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=OrderShippingInfoGridView]",

};

OrderShippingInfoGridView.prototype.searchCriteria = {
};

OrderShippingInfoGridView.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            scrollable: false,
            pageable: {
                refresh: false,
                pageSizes: false,
                buttonCount: 1
            },
            columns: [
                {
                    title: "Date",
                    template: "${kendo.toString(kendo.parseDate(ShipDate),\"MM/dd/yy\")}",
                    width: "25%"
                },
                {
                    title: "Packlist #",
                    field: "ShipmentId",
                    width: "35%"
                },
                {
                    title: "<div>Tracking # /<br/>Carrier</div>",
                    template: "<div>#if (Url == '') {#${TrackingNumber}#} else {#<a href='${Url}'>${TrackingNumber}</a>#}#</div><div>${CarrierName}</div>",
                    width: "40%"
                }
               ],
            title: "Shipping Information",
        };
        $(that.options.gridViewSelector).kendoCollapseGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

OrderShippingInfoGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 5;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetShipmentDetails",
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

OrderShippingInfoGridView.prototype.dataSourceOpts = {};