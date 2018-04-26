function TicketCommentsGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch({});
}
TicketCommentsGridView.prototype.options = {};

TicketCommentsGridView.prototype.baseOptions = {
    gridViewSelector: "table[data-argosy-view=TicketCommentsGridView]",
    ticketIdGridView: null
};

TicketCommentsGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

TicketCommentsGridView.prototype.setupGrid = function () {
    var that = this;
    var admin = that.options.admin;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            exportToExcel:false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            //pageable: { refresh: true, pageSizes: true, buttonCount: 5 },
            rowTemplate: kendo.template($("#rowTemplate").html()),
            altRowTemplate: kendo.template($("#altRowTemplate").html())
        };
        $(that.options.gridViewSelector).kendoGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

TicketCommentsGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {
                TicketNo: that.options.ticketIdGridView
            };
            // can't reference that.searchCriteria the other way
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetTicketComments",
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
    that.dataSourceOpts.pageSize = 10;
    return new kendo.data.DataSource(that.dataSourceOpts);
};

TicketCommentsGridView.prototype.dataSourceOpts = {};

TicketCommentsGridView.prototype.getStatus = function () {
};
