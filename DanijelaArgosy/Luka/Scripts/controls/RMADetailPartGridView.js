function RMADetailPartGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.search({});
    });
    that.search({});
}
RMADetailPartGridView.prototype.options = {};
RMADetailPartGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=RMADetailPartGridView]"
};
RMADetailPartGridView.prototype.search = function () {
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
                title: "SKU",
                field: "Sku"
            },
            {
                title: "Description",
                field: "PartName",
                encoded: false
            },
            {
                title: "Serial",
                field: "RMASerial"
            },
            {
                title: "Custom Identifier",
                field: "Custom01",
                width: "15%"
            },
            {
                title: "<span class='floatr textr'>Shipped Qty</span>",
                field: "ShippedQty",
                template: "<div class='textr'>${ShippedQty}</div>"
            },
            {
                title: "<span class='floatr textr'>Recv. Qty</span>",
                field: "ReceivedQty",
                template: "<div class='textr'>${ReceivedQty}</div>",
                width: "15%"
            },
            {
                title: "Recv. Date",
                field: "ReceivedDate",
                template: "${kendo.toString(kendo.parseDate(ReceivedDate),\"MM/dd/yyyy\")}"
            }],
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

RMADetailPartGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetParts",
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

RMADetailPartGridView.prototype.dataSourceOpts = {};

RMADetailPartGridView.prototype.getStatus = function () {
};