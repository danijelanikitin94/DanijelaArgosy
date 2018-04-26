function AddUserGroupToGlobalProfile(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch({});
}

AddUserGroupToGlobalProfile.prototype.options = {};

AddUserGroupToGlobalProfile.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=AddUserGroupToGlobalProfile]",
};

AddUserGroupToGlobalProfile.prototype.searchCriteria = {};

AddUserGroupToGlobalProfile.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

AddUserGroupToGlobalProfile.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            exportToExcel: false,
            selectable: "multiple, row",
            pageable: {
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 2
            },
            columns: [
            {
                title: "User Group",
                field: "GroupName",
                width: "300px"
            },

            {
                title: "Description",
                field: "GroupDescription",
                width: "500px"
            }],
            checkboxes: true,
            dataBinding: function (e) {
            },
            search: [
                { name: "Keyword", type: "text", placeholder: "Search by Group Name, Description", toolbar: true }
            ],
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

AddUserGroupToGlobalProfile.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 10;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/Admin/GlobalProfiles/GetUserGroupsAvailableForGlobalProfile",
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

AddUserGroupToGlobalProfile.prototype.dataSourceOpts = {};
