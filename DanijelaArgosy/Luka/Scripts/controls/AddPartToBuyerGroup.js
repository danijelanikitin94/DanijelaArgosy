function AddPartToBuyerGroup(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch({});
};

AddPartToBuyerGroup.prototype.options = {};
AddPartToBuyerGroup.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=AddPartToBuyerGroup]"
};

AddPartToBuyerGroup.prototype.searchCriteria = {};
AddPartToBuyerGroup.prototype.refineSearch = function(data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

AddPartToBuyerGroup.prototype.setupGrid = function() {
    var that = this,
        grid = $(that.options.gridViewSelector).getKendoGrid();
    if (grid == null) {
        var opts = {
            dataSource: that.getDataSource({}),
            scrollable: false,
            editable: false,
            autoBind: true,
            groupable: false,
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
                    field: "Sku"
                },
                {
                    title: "~{Product}~",
                    template: "<div> #if (PartName != null && PartName.trim().length > 0) {#   #= PartName # #}else{# #= Sku # #}#    </div>"
                },
                {
                    title: "~{Description}~",
                    field: "Description",
                    width: "20%"
                }
                ],
            checkboxes: true,
            dataBinding: function () {
            },
            search: [
                { name: "Keyword", type: "text", placeholder: "~{SearchSkuProductDescription}~", toolbar: true }
            ]
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        grid.dataSource.read();
    }
};


AddPartToBuyerGroup.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 10,
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetBuyerGroupAvailableParts",
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

AddPartToBuyerGroup.prototype.dataSourceOpts = {};