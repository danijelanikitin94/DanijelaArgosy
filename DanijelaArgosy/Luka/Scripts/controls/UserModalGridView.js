function UserModalGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);

    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch({});
}

UserModalGridView.prototype.options = {};

UserModalGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=UserModalGridView]",
};

UserModalGridView.prototype.searchCriteria = {
    Username: null
};

UserModalGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

UserModalGridView.prototype.setupGrid = function () {
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
                refresh: false,
                pageSizes: false,
                buttonCount: 1
            },
            columns: [
            {
                title: "Username",
                field: "Username",
                width: "100px"
            },
            {
                title: "<div class='text-center'>Active</div>",
                field: "Active",
                template: "<div class='bold text-center'>#if (Active == true) {#<span>YES</span>#} else {#<span>NO</span>#}#</div>"
            },
            {
                title: "Name",
                field: "LastName",
                template: "${FirstName} ${LastName}",
                width: "200px"
            }, {
                title: "<div class='text-center'>Admin</div>",
                field: "AdminAccess",
                template: "<div class='text-center'>#if (AdminAccess == true) {#<span>YES</span>#} else {#<span>NO</span>#}#</div>"
            }],
            checkboxes: true,
            dataBinding: function (e) {
            },
            dataBound: function (e) {
            },
            search: [
                { name: "Keyword", type: "text", placeholder: "Search by First/Last Name or Username", toolbar: true },
                {
                    name: "Active", type: "select", placeholder: "-- Status --", toolbar: true, data:
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

UserModalGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);

    that.dataSourceOpts.pageSize = 5;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {};
            // can't reference that.searchCriteria the other way
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

UserModalGridView.prototype.dataSourceOpts = {};
