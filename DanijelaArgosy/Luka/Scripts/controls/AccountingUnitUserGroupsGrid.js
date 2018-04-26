function AccountingUnitUserGroupsGrid(opts) {
    var that = this;

    $.extend(true, that.options, that.baseOptions, opts);
    that.setupGrid({});
}

AccountingUnitUserGroupsGrid.prototype.options = {};

AccountingUnitUserGroupsGrid.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-control=AccountingUnitUserGroupsGrid]"
};

AccountingUnitUserGroupsGrid.prototype.searchCriteria = {
};

AccountingUnitUserGroupsGrid.prototype.setupGrid = function () {
    var that = this,
        userGroupsCollpaseGrid = $("div[data-argosy-control='AccountingUnitUserGroupsGrid']").data("kendoCollapseGrid"),
        userGroupsGrid;
    if (userGroupsCollpaseGrid != null) {
        userGroupsGrid = userGroupsCollpaseGrid.getKendoGrid();
    };
    if (userGroupsGrid == null) {
        var opts = {
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            scrollable: false,
            exportToExcel: false,
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
                    title: "~{UserGroupName}~",
                    field: "UserGroupName",
                    width: "80%"
                }, {
                    title: "<div class='text-center'>~{Default}~</div>",
                    template: "<div class=' text-center '>#if (IsDefault) {#<span>YES</span>#} else {#<span>NO</span>#}#</div>",
                    width: "10%"
                }],
            title: "~{UserGroups}~",
            toolbar: [
                { name: "addUserGroups", text: " ~{Add}~", 'class': "fa fa-plus" }
            ],
            addUserGroups: function () {
                showAddUserGroupsModal();
            },
            dataBound: function (e) {
                e.sender.items().each(function (i, item) {
                    $(item).find(".fa.la.fa-times").parent().click(function () {
                        that.showDeleteUserFromAccountUnit(e.sender.dataItem(item));
                    });
                });
            }
        };
        $(that.options.gridViewSelector).kendoCollapseGrid(opts);
    } else {
        userGroupsGrid.dataSource.read();
    }
};

AccountingUnitUserGroupsGrid.prototype.showDeleteUserFromAccountUnit = function (userGroup) {
    var that = this;
    prompt.alert({
        question: "Are you sure you want to remove this User Group?",
        description: "",
        button: "Remove",
        type: "warning",
        yes: function (e) {
            if (typeof (e.preventDefault) === "function") {
                that.deleteUserGroupsFromAU(userGroup);
            }
        }
    });
};

AccountingUnitUserGroupsGrid.prototype.deleteUserGroupsFromAU = function (userGroup) {
    $.ajax({
        url: "/Admin/AccountUnit/DeleteUserGroupFromAccountingUnit",
        type: "POST",
        data: JSON.stringify({
            userGroup: userGroup
        }),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result.ReturnCode === ReturnCode.Success) {
                    prompt.notify({
                        question: "Items(s) were successfully deleted.",
                        type: "success"
                    });
            } else {
                prompt.clientResponseError(result);
            }
            var userGroupsCollpaseGrid = $("div[data-argosy-control='AccountingUnitUserGroupsGrid']").data("kendoCollapseGrid"),
                userGroupsGrid = userGroupsCollpaseGrid.getKendoGrid(),
                addUserGroupGrid = $("div[data-argosy-control='AddUserGroupToAccountUnitGrid']").data("kendoGrid");
            userGroupsGrid.dataSource.read();
            addUserGroupGrid.dataSource.read();
        },
        complete: function (e) {
            $.fancybox.close();
        }
    });
};

AccountingUnitUserGroupsGrid.prototype.getDataSource = function () {
    var that = this;
    that.dataSourceOpts.pageSize = 5;
    that.dataSourceOpts.serverPaging = true;
    that.dataSourceOpts.serverFiltering = true;
    that.dataSourceOpts.serverSorting = true;
    that.dataSourceOpts.transport = {
        read: {
            url: "/DataView/GetAccountingUnitUserGroups",
            contentType: "application/json",
            dataType: "json",
            data: {
                AccountingUnitId: that.options.accountingUnitId,
                UserGroups: true
            }
        }
    };
    that.dataSourceOpts.schema = {
        data: function (response) {
            return response.Records;
        },
        total: function (response) {
            return response.TotalRecords;
        }
    };
    return new kendo.data.DataSource(that.dataSourceOpts);
};

AccountingUnitUserGroupsGrid.prototype.dataSourceOpts = {};