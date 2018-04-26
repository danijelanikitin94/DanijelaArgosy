function AddPartCategoryToUserGroupGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);

    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch({});
};

AddPartCategoryToUserGroupGridView.prototype.options = {};

AddPartCategoryToUserGroupGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=AddPartCategoryToUserGroupGridView]",
};
AddPartCategoryToUserGroupGridView.prototype.searchCriteria = {
};

AddPartCategoryToUserGroupGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

AddPartCategoryToUserGroupGridView.prototype.setupGrid = function () {
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
                refresh: false,
                pageSizes: false,
                buttonCount: 1
            },
            columns: [
                {
                    title: "~{CategoryName}~",
                    field: "GroupName"
                },
                {
                    title: "~{Description}~",
                    field: "GroupDescrip"
                }
            ],
            checkboxes: true,
            search: [
                { name: "Keyword", type: "text", placeholder: "~{SearchCategoryNameDescription}~", toolbar: true }
            ],
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

AddPartCategoryToUserGroupGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 5;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetUserGroupAvailablePartCategories",
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

AddPartCategoryToUserGroupGridView.prototype.dataSourceOpts = {};
