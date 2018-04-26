function AddUserToAdjustment(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID,
        function(e, data) {
            that.refineSearch(data);
        });
    that.refineSearch({});
}

AddUserToAdjustment.prototype.options = {
    excludeUserIds: []
};

AddUserToAdjustment.prototype.searchCriteria = {};

AddUserToAdjustment.prototype.refineSearch = function(data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

AddUserToAdjustment.prototype.setupGrid = function() {
    var that = this,
        grid = $("div[data-argosy-view='AddUserToAdjustment']").data("kendoGrid");
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
                    title: "Username",
                    field: "Username",
                    width: "300px"
                }, {
                    title: "Name",
                    field: "LastName",
                    template: "${FirstName} ${LastName}",
                    width: "500px"
                }
            ],
            checkboxes: true,
            search: [
                { name: "Keyword", type: "text", placeholder: "Search by First/Last Name or Username", toolbar: true }
            ]
        };
        $("div[data-argosy-view='AddUserToAdjustment']").kendoArgosyGrid(opts);
    } else {
        grid.dataSource.read();
    };
};

AddUserToAdjustment.prototype.getDataSource = function() {
    var that = this;
    return new kendo.data.DataSource({
        transport: {
            read: {
                url: "/DataView/GetUsers",
                dataType: "json"
            },
            parameterMap: function (data) {
                data.Keyword = that.searchCriteria.Keyword;
                data.Active = true;
                data.ExcludeUserIds = that.options.excludeUserIds;
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