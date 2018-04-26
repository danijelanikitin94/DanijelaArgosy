function ModalParts(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.search();
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
}
//This
ModalParts.prototype.options = {};

ModalParts.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=ModalParts]",
};
ModalParts.prototype.searchCriteria = {
    Sku: null
};

ModalParts.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    var grid = $(that.options.gridViewSelector).getKendoGrid();
    grid.dataSource.read();
    grid.refresh();
};

ModalParts.prototype.search = function () {
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
                pageSize:10,
                pageSizes: [10,50, 100, 500],
                buttonCount: 5
            },
            columns: [
                {
                    title: "SKU",
                    field: "Sku"
                },
                {
                    title: "Product",
                    template: "<div><a href='/Admin/Parts/Edit/${Sku}'> #if (PartName != null && PartName.trim().length > 0) {#   #= PartName # #}else{# #= Sku # #}#     </a></div>",
                    width: "20%"
                },
                {
                    title: "Description",
                    field: "Description",
                    width: "20%"
                }
            ],
            checkboxes: true,
            search: [
                { name: "Keyword", type: "text", placeholder: "Search by Product, SKU or Description", toolbar: true }
            ],
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};


ModalParts.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 10,
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {};
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetParts",
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

ModalParts.prototype.dataSourceOpts = {};
