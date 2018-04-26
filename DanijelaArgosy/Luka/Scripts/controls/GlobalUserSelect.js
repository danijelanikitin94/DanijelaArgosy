function GlobalUserSelect(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.search();
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
}

GlobalUserSelect.prototype.options = {};

GlobalUserSelect.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=GlobalUserSelect]",
};

GlobalUserSelect.prototype.searchCriteria = {
};

GlobalUserSelect.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    var grid = $(that.options.gridViewSelector).getKendoGrid();
    grid.dataSource.read();
    grid.refresh();
};

GlobalUserSelect.prototype.search = function () {
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
                    title: "Username",
                    field: "Username",
                    width: "400px"
                }, {
                    title: "Name",
                    //field: "",
                    template: "${FirstName} ${LastName}",
                    width: "400px"
                }, {
                    title: "Email",
                    field: "Email",
                    width: "400px"
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
                { name: "GlobalKeyword", type: "text", placeholder: "Search by First/Last Name, Username or Email", toolbar: true }
            ],
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

GlobalUserSelect.prototype.getSelectedRecords = function () {
    var that = this;
    var selectedRecords = [];
    var kendoGrid = $(that.options.gridViewSelector).getKendoGrid();

    $(kendoGrid.select()).each(function (i) {
        selectedRecords.push(kendoGrid.dataItem(this));
    });

    return selectedRecords;
};

GlobalUserSelect.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 10;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {
                IsActive: true,
                RecordSizeCategory: that.options.recordSizeCategory
            };
            // can't reference that.searchCriteria the other way
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetUsersForDropDownList",
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
        },
    };
    return new kendo.data.DataSource(that.dataSourceOpts);
};

GlobalUserSelect.prototype.dataSourceOpts = {};
