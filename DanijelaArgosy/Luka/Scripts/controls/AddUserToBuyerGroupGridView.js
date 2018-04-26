function AddUserToBuyerGroupGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch({});
}

AddUserToBuyerGroupGridView.prototype.options = {};

AddUserToBuyerGroupGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=AddUserToBuyerGroupGridView]"
};

AddUserToBuyerGroupGridView.prototype.searchCriteria = {};

AddUserToBuyerGroupGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

AddUserToBuyerGroupGridView.prototype.setupGrid = function () {
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
            selectable: "multiple, row",
            pageable: {
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 2
            },
            columns: [
            {
                title: "~{UserName}~",
                field: "Username",
                width: "300px"
            },

            {
                title: "~{Name}~",
                field: "LastName",
                template: "${FirstName} ${LastName}",
                width: "500px"
            }],
            checkboxes: true,
            dataBinding: function () {
            },
            search: [
                { name: "Keyword", type: "text", placeholder: "~{SearchByUsernameFirstLast}~", toolbar: true }
            ]
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        grid.dataSource.read();
    }
};

AddUserToBuyerGroupGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 10;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetusersAvailableForBuyerGroup",
                dataType: "json",
                data: search,
                success: function (result) {
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

AddUserToBuyerGroupGridView.prototype.dataSourceOpts = {};
