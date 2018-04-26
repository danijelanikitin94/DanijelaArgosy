function AccountManagedEmployeesGrid(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.setupGrid({});
}
AccountManagedEmployeesGrid.prototype.options = {
};

AccountManagedEmployeesGrid.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=AccountManagedEmployeesGrid]",
    userManagerGrid: null
};

AccountManagedEmployeesGrid.prototype.searchCriteria = {
};

AccountManagedEmployeesGrid.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
                dataSource: that.getDataSource({}),
                groupable: false,
                sortable: true,
                scrollable: false,
                exportToExcel:false,
                pageable: {
                    refresh: false,
                    pageSizes: false,
                    buttonCount: 1
                },
                columns: [
                    {
                        title: "~{UserName}~",
                        field: "EmployeeUserName",
                        width: "50%"
                    }, {
                        title: "~{Name}~",
                        field: "EmployeeName",
                        width: "50%"
                    }
                ],
                title: "~{ManagedUsers}~",
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
                        that.DeleteEmployeesFromUser([data]);
                    });
                });
            },
        };
        $(that.options.gridViewSelector).kendoCollapseGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

AccountManagedEmployeesGrid.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 5;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = { managerUserId: that.options.managerUserId, IsTopLevelOnly: true };
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetManagerUsers",
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

AccountManagedEmployeesGrid.prototype.dataSourceOpts = {};