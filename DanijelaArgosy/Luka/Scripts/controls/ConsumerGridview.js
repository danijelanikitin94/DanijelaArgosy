function ConsumerGridview(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);

    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch({});
}

ConsumerGridview.prototype.options = {};

ConsumerGridview.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=ConsumerGridview]",
};

ConsumerGridview.prototype.searchCriteria = {
};

ConsumerGridview.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

ConsumerGridview.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            dataBound: function (e) {
                var grid = e.sender;
                if (grid.dataSource.total() == 0) {
                    var colCount = grid.columns.length;
                    $(e.sender.wrapper)
                        .find('tbody')
                        .append('<tr class="kendo-data-row"><td colspan="' + colCount + '" class="no-data">' + loadEmptyGridTemplate("There were no consumers returned.") + '</td></tr>');
                };
                $("div[data-argosy-view=ConsumerGridview] th:eq(3) ,div[data-argosy-view=ConsumerGridview]  tr td:nth-child(4)").addClass("hidden-sm hidden-xs");
                $("div[data-argosy-view=ConsumerGridview] th:eq(4) ,div[data-argosy-view=ConsumerGridview]  tr td:nth-child(5)").addClass("hidden-xs");
            },
            pageable: {
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 5
            },
            columns: [
                {
                    title: "~{Name}~",
                    template: "<a href='/Tools/Consumers/Edit/${ConsumerId}'>${ConsumerFirstName} ${ConsumerLastName}<a>",

                }, {
                    title: "~{Company}~",
                    field: "ConsumerCompanyName"
                }, {
                    title: "~{Phone}~",
                    field: "ConsumerPhone"
                }, {
                    title: "~{Email}~",
                    field: "ConsumerEmail"
                }
            ],
            dataBinding: function (e) {
            }
            ,
            search: [
                { name: "Keyword", type: "text", placeholder: "~{SearchByNameCompany}~", toolbar: true },
            ],
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

ConsumerGridview.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {};
            // can't reference that.searchCriteria the other way
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                type: "POST",
                url: "/DataView/GetConsumers",
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

ConsumerGridview.prototype.dataSourceOpts = {};
