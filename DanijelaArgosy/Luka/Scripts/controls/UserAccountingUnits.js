function UserAccountingUnits(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.setupGrid({});
}
UserAccountingUnits.prototype.options = {};
UserAccountingUnits.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=UserAccountingUnits]",
   
};
UserAccountingUnits.prototype.searchCriteria = {
};

UserAccountingUnits.prototype.setupGrid = function () {
    var that = this;
    if (that.kendoGrid == null) {
        var opts = {
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            scrollable: false,
            exportToExcel: false,
            pageable: {
                refresh: true,
                pageSizes: false,
                buttonCount: 1
            },
            columns: [
                 {
                     template: "<i class='fa la fa-times'></i>",
                     width: "10%"
                 },
                {
                    title: "~{AccountingUnit}~",
                    field: "AccountingUnit"
                },
                {
                    title: "~{Default}~",
                    template: "<input class='bootstrap-toggle' type='radio'  id='rb_${AccountingUnitUserId}' name='optDefault' />"
                }],
            title: "~{AccountingUnit}~",
            toolbar: [
               { name: "addUnits", text: " ~{Add}~", 'class': "fa fa-plus" }
            ],
            addUnits: function (e) {
                that.showAddUnitsModal();
            },
            dataBinding: function (e) {
            },
            dataBound: function (e) {
                var gridElement = $(e.sender.element);
                var grid = gridElement.getKendoGrid();

                gridElement.find("tbody tr[role=row]").each(function () {
                    var updateBtn = $(this).find(".bootstrap-toggle");
                    var data = grid.dataItem(this);
                    if (data.IsDefault) {
                        updateBtn.attr("checked", "checked");
                    }
                    updateBtn.unbind("click");
                    updateBtn.click(function () {
                        that.updateUserDefaultAccountingUnit(data);
                    });
                    var deleteBtn = $(this).find(".fa.la.fa-times").parent();
                    deleteBtn.unbind("click");
                    deleteBtn.click(function () {
                        that.showDeleteUserFromAccountUnit(data);
                    });
                });
            },
        };
        $(that.options.gridViewSelector).kendoCollapseGrid(opts);
    } else {
        that.kendoGrid.dataSource.read();
        that.kendoGrid.refresh();
    }
};

UserAccountingUnits.prototype.showAddUnitsModal = function (data) {
    $.fancybox({
        href: "#AddAccountingUnits"
    });
};
UserAccountingUnits.prototype.showDeleteUserFromAccountUnit = function (data) {
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
    message.question = "~{WantToRemoveSelection}~";
    message.button = "~{Remove}~";
    prompt.alert(message);
};

UserAccountingUnits.prototype.deleteUsersFromAU = function (user) {
    var that = this;
    var params = { user: user };
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
UserAccountingUnits.prototype.updateUserDefaultAccountingUnit = function (user) {
    var that = this;
   
    var params = { user: user };
    $.ajax({
        url: '/Admin/Users/UpdateUserDefaultAccountingUnit',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            var grid = $(that.options.gridViewSelector).find(".k-collapse-grid").getKendoGrid();
            if (result.ReturnCode == ReturnCode.Success) {
                $("#AccountingUnitId").val(user.AccountingUnitId);
                prompt.notify({
                    question: result.Message,
                    type: (result.ReturnCode == 200 ? "success" : "error")
                });
            } else {
                prompt.clientResponseError(result);
            }
            grid.dataSource.read();
            grid.refresh(true);
            var grid02 = $("div[data-argosy-view=PartCategoryModalGridView]").getKendoGrid();
            grid02.dataSource.read();
            grid02.refresh(true);
        }
    });
};

UserAccountingUnits.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 5;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            // can't reference that.searchCriteria the other way
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetUserAccountUnits",
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

UserAccountingUnits.prototype.dataSourceOpts = {};
