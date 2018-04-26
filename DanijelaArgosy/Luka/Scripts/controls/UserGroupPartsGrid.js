function UserGroupPartsGrid(opts) {
    var that = this;

    $.extend(true, that.options, that.baseOptions, opts);
    that.setupGrid({});
}

UserGroupPartsGrid.prototype.options = {};

UserGroupPartsGrid.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=UserGroupPartsGrid]",
    
};

UserGroupPartsGrid.prototype.searchCriteria = {
};

UserGroupPartsGrid.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            scrollable: false,
            pageable: {
                refresh: false,
                pageSizes: false,
                buttonCount: 1
            },
            columns: [
                {
                    template: "<i class='fa la fa-times'></i>",
                    width: "10%"
                },
                {
                    title: "Product",
                    template: "<div>#if (PartName != null && PartName.trim().length > 0) {#   #= PartName # #}else{# #= Sku # #}#</div>",
                    width: "15%"
                },
                {
                    title: "SKU",
                    field: "Sku",
                    width: "30%"
                },
                {
                    title: "Description",
                    field: "Description",
                    //width: "30%"
                }],
            title: "Parts",
            toolbar: [
                { name: "addedit", text: " Add/Edit", 'class': "fa fa-plus" }
            ],
            dataBinding: function (e) {
            },
            dataBound: function (e) {
                var gridElement = $(e.sender.element);
                var grid = gridElement.getKendoGrid();

                gridElement.find("tbody tr[role=row]").each(function () {
                    var data = grid.dataItem(this);
                    var deleteBtn = $(this).find(".fa.la.fa-times").parent();
                    deleteBtn.unbind("click");
                    deleteBtn.click(function () {
                        that.DeletePartsFromUserGroup([data]);
                    });
                });
            }
        };
        $(that.options.gridViewSelector).kendoCollapseGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

UserGroupPartsGrid.prototype.getDataSource = function (dataSourceOpts) {
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

UserGroupPartsGrid.prototype.DeletePartsFromUserGroup = function (part) {
    //alert(part);
};

UserGroupPartsGrid.prototype.dataSourceOpts = {};