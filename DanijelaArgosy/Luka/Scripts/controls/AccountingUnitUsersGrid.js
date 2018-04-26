function AccountingUnitUsersGrid(opts) {
    var that = this;

    $.extend(true, that.options, that.baseOptions, opts);
    that.setupGrid({});
}

AccountingUnitUsersGrid.prototype.options = {};

AccountingUnitUsersGrid.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=AccountingUnitUsersGrid]",
};

AccountingUnitUsersGrid.prototype.searchCriteria = {
};

AccountingUnitUsersGrid.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            scrollable: false,
            exportToExcel: false,

            //APM
            selectable: "multiple, row",

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
                    title: "~{UserName}~",
                    field: "Username",
                    width: "40%"
                }, {
                    title: "~{FullName}~",
                    template: "${FirstName} ${LastName}",
                    width: "40%"
                }, {
                    title: "<div class='text-center'>~{Default}~</div>",
                    template: "<div class=' text-center '>#if (IsDefault) {#<span>YES</span>#} else {#<span>NO</span>#}#</div>",
                    width: "10%"
                }],
            title: "~{Users}~",
            toolbar: [
                { name: "addusers",    text: " ~{Add}~",    'class': "fa fa-plus" }
            ],
            addusers: function(e) {
                showAddUsersModal();
            },
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
                        that.showDeleteUserFromAccountUnit(data);
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

AccountingUnitUsersGrid.prototype.showDeleteUserFromAccountUnit = function (data) {
    var that = this;
    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function (e) {
            if (typeof (e.preventDefault) === "function") {
                that.deleteUsersFromAU(data);
            }
        }
    };
    message.question = "Are you sure you want to remove this User?";
    message.button = "Remove";
    prompt.alert(message);
};

AccountingUnitUsersGrid.prototype.deleteUsersFromAU = function (user) {
    var that = this;
        var params = { user:user };
        $.ajax({
            url: '/Admin/AccountUnit/DeleteUsersFromAccountingUnit',
            type: "POST",
            data: JSON.stringify(params),
            dataType: "json",
            traditional: true,
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                if (result.ReturnCode == ReturnCode.Success) {
                    $(result.Records).each(function () {
                        prompt.notify({
                            question: "User " + this.Key + " was " + (!this.Value ? "" : "not") + " successfully deleted.",
                            type: (!this.Value ? "success" : "error")
                        });
                    });
                } else {
                    prompt.clientResponseError(result);
                }
                var grid = $(that.options.gridViewSelector).find(".k-collapse-grid").getKendoGrid();
                grid.dataSource.read();
                grid.refresh(true);
            }
        });
        $.fancybox.close();
};

AccountingUnitUsersGrid.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 5;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            search.Users = true;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetAccountingUnitUsers",
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

AccountingUnitUsersGrid.prototype.dataSourceOpts = {};