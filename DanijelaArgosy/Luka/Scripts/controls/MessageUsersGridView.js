function MessageUsersGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);

    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch({});
}

MessageUsersGridView.prototype.options = {};

MessageUsersGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=MessageUsersGridView]",
};

MessageUsersGridView.prototype.searchCriteria = {
    Username: null
};

MessageUsersGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

MessageUsersGridView.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            groupable: false,
            exportToExcel:false,
            sortable: true,
            selectable: "multiple, row",
            pageable: {
                refresh: true,
                pageSizes: false,
                buttonCount: 2
            },
            columns: [
            {
                title: "Username",
                field: "Username",
                width: "30%"
            },
            {
                title: "Name",
                field: "LastName",
                template: "${FirstName} ${LastName}"
            },
            {
                title: "<div class='text-center'>Active</div>",
                field: "Active",
                template: "<div class='text-center'>#if (Active == true) {#<span>YES</span>#} else {#<span>NO</span>#}#</div>",
                width: "10%"
            }],
            checkboxes: true,
            search: [
                { name: "Keyword", type: "text", placeholder: "Search by First/Last Name or Username", toolbar: true },
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

MessageUsersGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 10;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {};
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetUsers",
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

MessageUsersGridView.prototype.dataSourceOpts = {};
