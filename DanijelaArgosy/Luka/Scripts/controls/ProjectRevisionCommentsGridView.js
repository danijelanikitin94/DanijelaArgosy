function ProjectRevisionCommentsGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });

    $(document).bind(argosyEvents.PROJECT_REVISION_CHANGE, function (e, data) {
        that.options.revisionId = data;
        if (that.options.revisionId != null && that.options.revisionId != "") {
            that.refineSearch(data);
        }
    });
    that.refineSearch({});
}
ProjectRevisionCommentsGridView.prototype.options = {};

ProjectRevisionCommentsGridView.prototype.baseOptions = {
    gridViewSelector: "table[data-argosy-view=ProjectRevisionCommentsGridView]"
};

ProjectRevisionCommentsGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

ProjectRevisionCommentsGridView.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            exportToExcel: false,
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

ProjectRevisionCommentsGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = { RevisionId: that.options.revisionId };
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetProjectRevisionComments",
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

ProjectRevisionCommentsGridView.prototype.dataSourceOpts = {};

ProjectRevisionCommentsGridView.prototype.getStatus = function () {
};
