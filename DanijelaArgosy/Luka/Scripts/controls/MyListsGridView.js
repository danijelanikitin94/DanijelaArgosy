function MyListsGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch({});
}
MyListsGridView.prototype.options = {};
MyListsGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=MyListsGridView]",
};
MyListsGridView.prototype.searchCriteria = {

};
MyListsGridView.prototype.dataSourceOpts = {

};
MyListsGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

MyListsGridView.prototype.setupGrid = function () {
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
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 5
            },
            columns: [
                {
                    title: "~{DateCreated}~",
                    field: "DateCreated",
                    template: "${kendo.toString(kendo.parseDate(DateCreated),\"MM/dd/yyyy\")}"
                },
                {
                    title: "~{Name}~",
                    field: "Name"
                }, {
                    title: "~{Status}~",
                    sortable: true,
                    field: "Status"
                }, {
                    title: "<div class='text-center'>~{NumberOfRecords}~</div>",
                    field: "TotalRecords",
                    template: "<div class='bold text-center'>${TotalRecords}</div>"
                }
            ],
            
            dataBound: function (e) {
                var gridElement = $(e.sender.element);
                var exportExcelButton = gridElement.find(".k-button.k-button-icontext.k-grid-excel");
                exportExcelButton.unbind("click");

                exportExcelButton.click(function (clickEvent) {
                    that.showExportStateModal();
                });
            },
            toolbar: [
                { name: "excel", text: "<i class='fa la fa-file-excel-o'></i>" }
            ],
            search: [
            
            { name: "Keyword", type: "text", placeholder: "~{SearchByListNameStatus}~", toolbar: true }
            ]
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};


MyListsGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetMailLists",
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

MyListsGridView.prototype.dataSourceOpts = {};