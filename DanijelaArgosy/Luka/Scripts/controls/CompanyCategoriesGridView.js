function CompanyCategoriesGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch({});
}
CompanyCategoriesGridView.prototype.options = {};
CompanyCategoriesGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=CompanyCategoriesGridView]",
    showActiveOnly: false
};
CompanyCategoriesGridView.prototype.searchCriteria = {
    PartId:null
};

CompanyCategoriesGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

CompanyCategoriesGridView.prototype.setupGrid = function () {
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
                pageSizes: [50, 100, 500],
                buttonCount: 5
            },
            columns: [
                {
                    title: "~{Name}~",
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

CompanyCategoriesGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 5;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            if (that.options.showActiveOnly) {
                that.searchCriteria.IsActive = true;
            }
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetAllCompanyPartCategories",
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

CompanyCategoriesGridView.prototype.dataSourceOpts = {};
