function DashboardGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch();
};

DashboardGridView.prototype.options = {};
DashboardGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=DashboardGridView]"
};
DashboardGridView.prototype.searchCriteria = {

};
DashboardGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};


DashboardGridView.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoListView() == null) {
        var opts = {
            dataSource: that.getDataSource({}),
            template: kendo.template($("#template").html())
        };
        $(that.options.gridViewSelector).kendoListView(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoListView();
        grid.dataSource.read();
        grid.refresh();
    }
};

DashboardGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 21;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {};
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetDashboards",
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

DashboardGridView.prototype.dataSourceOpts = {};

DashboardGridView.prototype.getStatus = function () {
};
