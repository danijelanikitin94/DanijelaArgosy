function AddUserGroupToAdjustment(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID,
        function (e, data) {
            debugger;
            that.refineSearch(data);
        });
    that.refineSearch({});
}

AddUserGroupToAdjustment.prototype.options = {
    excludeUserGroupIds: []
};

AddUserGroupToAdjustment.prototype.searchCriteria = {};

AddUserGroupToAdjustment.prototype.refineSearch = function(data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

AddUserGroupToAdjustment.prototype.setupGrid = function() {
    var that = this,
        grid = $("div[data-argosy-view='AddUserGroupToAdjustment']").data("kendoGrid");
    if (grid == null) {
        var opts = {
            scrollable: false,
            dataSource: that.getDataSource({}),
            sortable: true,
            exportToExcel: false,
            autoBind: true,
            selectable: "multiple, row",
            pageable: true,
            columns: [
                {
                    title: "~{UserGroup}~",
                    field: "GroupName",
                    width: "500px"
                }
            ],
            checkboxes: true,
            search: [
                { name: "Keyword", type: "text", placeholder: "Search by UserGroup Name or Description", toolbar: true }
            ]
        };
        $("div[data-argosy-view='AddUserGroupToAdjustment']").kendoArgosyGrid(opts);
    } else {
        grid.dataSource.read();
    };
};

AddUserGroupToAdjustment.prototype.getDataSource = function() {
    var that = this;
    return new kendo.data.DataSource({
        transport: {
            read: {
                url: "/DataView/GetUserGroups",
                dataType: "json"
            },
            parameterMap: function (data) {
                data.Keyword = that.searchCriteria.Keyword;
                data.Active = true;
                data.excludeUserGroupIds = that.options.excludeUserGroupIds;
                return data;
            }
        },
        schema: {
            data: function (response) {
                return response.Records;
            },
            total: function (response) {
                return response.TotalRecords;
            }
        },
        serverFiltering: true,
        serverSorting: true,
        serverPaging: true,
        pageSize: 10
    });
};