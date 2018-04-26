function GlobalUserGroupSelect(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.search();
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
}

GlobalUserGroupSelect.prototype.options = {};

GlobalUserGroupSelect.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=GlobalUserGroupSelect]",
};

GlobalUserGroupSelect.prototype.searchCriteria = {
    //Username: null
};

GlobalUserGroupSelect.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    var grid = $(that.options.gridViewSelector).getKendoGrid();
    grid.dataSource.read();
    grid.refresh();
};

GlobalUserGroupSelect.prototype.search = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: false,
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            selectable: "multiple, row",
            pageable: {
                refresh: true,
                //pageSizes: true,
                buttonCount: 5
            },
            columns: [
            {
                title: "Group name",
                field: "GroupName",
                width: "300px"
            }, {
                title: "Description",
                field: "GroupDescription",
                width: "900px"
            }],
            checkboxes: true,
            dataBinding: function (e) {
            },
            dataBound: function (e) {
                $.fancybox.reposition();
            },
            toolbar: [
            ],
            search: [
                { name: "GroupName", type: "text", placeholder: "Search by Group Name", toolbar: true },
            ],
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

GlobalUserGroupSelect.prototype.getSelectedRecords = function () {
    var that = this;
    var selectedRecords = [];
    var kendoGrid = $(that.options.gridViewSelector).getKendoGrid();

    $(kendoGrid.select()).each(function (i) {
        selectedRecords.push(kendoGrid.dataItem(this));
    });

    return selectedRecords;
};

GlobalUserGroupSelect.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 10;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {};
            // can't reference that.searchCriteria the other way
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetUserGroups",
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

GlobalUserGroupSelect.prototype.dataSourceOpts = {};

