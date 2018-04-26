function OrderCustomFieldsGridView(opts) {
    var that = this;

    $.extend(true, that.options, that.baseOptions, opts);
    that.setupGrid({});
}

OrderCustomFieldsGridView.prototype.options = {};

OrderCustomFieldsGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=OrderCustomFieldsGridView]"
};

OrderCustomFieldsGridView.prototype.searchCriteria = {
};

OrderCustomFieldsGridView.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: false,
            scrollable: false,
            pageable: false,
            exportToExcel: false,
            columns: [
                {
                    title:"Field",
                    template: "<b>${Field}</b>",
                    width: "20%"
                    //headerAttributes: { style: "display:none" }
                },
                {
                    title: "Value",
                    template: "${Value}"
                    //headerAttributes: { style: "display:none" }
                }]
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

OrderCustomFieldsGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 10;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetOrderCustomFields",
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

OrderCustomFieldsGridView.prototype.dataSourceOpts = {};