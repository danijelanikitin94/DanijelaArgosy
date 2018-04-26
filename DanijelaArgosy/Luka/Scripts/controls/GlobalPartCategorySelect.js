/// <reference path="GlobalPartCategorySelect.js" />
function GlobalPartCategorySelect(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.search();
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
}

GlobalPartCategorySelect.prototype.options = {};

GlobalPartCategorySelect.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=GlobalPartCategorySelect]",
};
GlobalPartCategorySelect.prototype.searchCriteria = {
    Sku: null
};

GlobalPartCategorySelect.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    var grid = $(that.options.gridViewSelector).getKendoGrid();
    grid.dataSource.read();
    grid.refresh();
};

GlobalPartCategorySelect.prototype.search = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: false,
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            selectable: true,
            pageable: {
                refresh: true,
                //pageSizes: true,
                buttonCount: 5
            },
            columns: [
            {
                title: "Category Name",
                field: "GroupName"
            },
            {
                title: "Description",
                field: "GroupDescrip"
            }],
            checkboxes: true,
            dataBinding: function (e) {
            },
            dataBound: function (e) {
            },
            toolbar: [
            ],
            search: [
                { name: "Keyword", type: "text", placeholder: "Search by Category Name or Description", toolbar: true }
            ],
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};




GlobalPartCategorySelect.prototype.getSelectedRecords = function () {
    var that = this;
    var selectedRecords = [];
    var kendoGrid = $(that.options.gridViewSelector).getKendoGrid();

    $(kendoGrid.select()).each(function (i) {
        selectedRecords.push(kendoGrid.dataItem(this));
    });

    return selectedRecords;
};

GlobalPartCategorySelect.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 10
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {};
            // can't reference that.searchCriteria the other way
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetPartCategories",
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

GlobalPartCategorySelect.prototype.dataSourceOpts = {};
