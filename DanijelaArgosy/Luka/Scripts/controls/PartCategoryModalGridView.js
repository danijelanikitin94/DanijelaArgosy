function PartCategoryModalGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch({});
}

PartCategoryModalGridView.prototype.options = {};

PartCategoryModalGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=PartCategoryModalGridView]",
};
PartCategoryModalGridView.prototype.searchCriteria = {
    Sku: null,
};

PartCategoryModalGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

PartCategoryModalGridView.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            groupable: false,
            exportToExcel: false,
            sortable: true,
            selectable: "multiple, row",

            pageable: {
                refresh: that.options.adminGridView ? true : false,
                pageSizes: that.options.adminGridView ? [50, 100, 500] : false,
                buttonCount: that.options.adminGridView ? 5 : 1
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

PartCategoryModalGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 5;
    
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetUserAvailablePartCategories",
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

PartCategoryModalGridView.prototype.dataSourceOpts = {};
