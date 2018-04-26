function CompanyPartsGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch({});
}
CompanyPartsGridView.prototype.options = {};
CompanyPartsGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=CompanyPartsGridView]",
};
CompanyPartsGridView.prototype.searchCriteria = {
    PartId: null
};

CompanyPartsGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

CompanyPartsGridView.prototype.setupGrid = function () {
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
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 5
            },
            columns: [
                {
                    title: "~{SKU}~",
                    field: "Sku",
                    template: "<div><a href='/Admin/Parts/Edit/${PartId}'>#= Sku #</a></div>"
                },
                {
                    title: "~{Name}~",
                    field: "PartName",
                    template: "<div> #if (PartName != null && PartName.trim().length > 0) {#   #= PartName # #}else{# #= Sku # #}# </div>",
                    encoded: false
                },
                {
                    title: "~{Description}~",
                    template: "#=Description#"
                }
            ],
            checkboxes: true,
            search: [
                { name: "Keyword", type: "text", placeholder: "~{SearchSkuProductDescription}~", toolbar: true }
            ],
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

CompanyPartsGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 5;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetParts",
                dataType: "json",
                data: search,
                success: function (result) {
                    if (result.ReturnCode === ReturnCode.Failed) {
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

CompanyPartsGridView.prototype.dataSourceOpts = {};
