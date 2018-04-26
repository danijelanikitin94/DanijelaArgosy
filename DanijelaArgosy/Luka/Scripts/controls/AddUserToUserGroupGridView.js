function AddUserToUserGroupGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);

    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch({});
}

AddUserToUserGroupGridView.prototype.options = {};

AddUserToUserGroupGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=AddUserToUserGroupGridView]",
};

AddUserToUserGroupGridView.prototype.searchCriteria = {
    Username: null
};

AddUserToUserGroupGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

AddUserToUserGroupGridView.prototype.setupGrid = function () {
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
            dataBinding: function (e) {
            },
            search: [
                { name: "Keyword", type: "text", placeholder: "~{SearchByUserFirstLastUsername}~", toolbar: true },
                {
                    name: "Active", type: "select", toolbar: true, data:
                      [
                          { value: "Y", text: "Active", selected: true },
                          { value: "N", text: "Inactive" },
                          { value: "", text: "All" }
                      ]
                }
            ],
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

AddUserToUserGroupGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 10;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
           // can't reference that.searchCriteria the other way
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetUsersToAdd",
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

AddUserToUserGroupGridView.prototype.dataSourceOpts = {};
