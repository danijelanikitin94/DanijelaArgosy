function AddUserGroupToAccountUnitGrid(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch({});
}

AddUserGroupToAccountUnitGrid.prototype.options = {};

AddUserGroupToAccountUnitGrid.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-control=AddUserGroupToAccountUnitGrid]"
};

AddUserGroupToAccountUnitGrid.prototype.searchCriteria = {};

AddUserGroupToAccountUnitGrid.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

AddUserGroupToAccountUnitGrid.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            autoBind: true,
            editable: false,
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            exportToExcel:false,
            selectable: "multiple, row",
            pageable: {
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 2
            },
            columns: [
            {
                title: "Name",
                field: "GroupName"
            }],
            checkboxes: true,
            dataBinding: function (e) {
            },
            search: [
                { name: "Keyword", type: "text", placeholder: "Search by UserGroup name", toolbar: true }
            ]
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

AddUserGroupToAccountUnitGrid.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 10;
    that.dataSourceOpts.serverPaging = true;
    that.dataSourceOpts.serverSorting = true;
    that.dataSourceOpts.serverFiltering = true;
    that.dataSourceOpts.schema = {
        data: function (response) {
            return response.Records;
        },
        total: function(response) {
            return response.TotalRecords;
        }
    };
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetUserGroupsAvailableForAccountingUnit",
                dataType: "json",
                data: search,
                type: "POST",
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

AddUserGroupToAccountUnitGrid.prototype.dataSourceOpts = {};
