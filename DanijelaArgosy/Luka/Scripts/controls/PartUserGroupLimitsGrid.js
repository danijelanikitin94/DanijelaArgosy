function PartUserGroupLimitsGrid(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.setupGrid();
}
PartUserGroupLimitsGrid.prototype.options = {};
PartUserGroupLimitsGrid.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=PartUserGroupLimitsGrid]"
};
PartUserGroupLimitsGrid.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
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
                    title: "~{Name}~",
                    field: "GroupName"
                },
                {
                    title: "<span class='floatr textr'>~{LimitQty}~</span>",
                    template: "<div class='floatr textr'>#:kendo.toString(LimitQuantity,'n0')#</div>"
                },
                {
                    title: "~{AllowApproval}~",
                    template: "#if (GotoApprovalIfOverLimit===true) {#<span>YES</span>#} else {#<span>NO</span>#}#",
                    width: "20%"
                },
                {
                    title: "~{TimeFrame}~",
                    field: "TimeFrame",
                    width: "20%"
                },
                {
                    title: "~{Enabled}~",
                    template: "#if (Active==true) {#<span>YES</span>#} else {#<span>NO</span>#}#",
                    width: "20%"
                }
            ],
            dataBound: function (e) {
                var gridElement = $(e.sender.element);
                var grid = gridElement.getKendoGrid();

                gridElement.find("tbody tr[role=row]").each(function () {
                    var data = grid.dataItem(this);
                    var deleteBtn = $(this).find(".fa.la.fa-times").parent();
                    deleteBtn.unbind("click");
                    deleteBtn.click(function () {
                        that.showDeletePartUserGroupLimitModal(data);
                    });
                });
            },
            toolbar: [
                { name: "addUserGroupPart", text: " ~{AddEdit}~", 'class': "fa fa-plus" }
            ],
            addUserGroupPart: function (e) { showAddUserGroupLimitModal(); },
            title: "~{UserGroupProductLimits}~",
        };
        $(that.options.gridViewSelector).kendoCollapseGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};
PartUserGroupLimitsGrid.prototype.showDeletePartUserGroupLimitModal = function (data) {
    var that = this;
    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function (e) {
            // this is what will happen when they click the confirm button
            that.deletePartUserGroupLimit(data);
        }
    };
    message.question = "~{WantToRemoveSelection}~";
    message.description = "~{CanNotRecoverUserGroupLimit }~";
    message.button = "~{Remove}~";

    prompt.alert(message);
};
PartUserGroupLimitsGrid.prototype.deletePartUserGroupLimit = function (partCat) {
    var that = this;
    var params = { partLimit: partCat };
    
    $.ajax({
        url: '/Admin/Parts/DeletePartUserGroupLimit',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result.ReturnCode == ReturnCode.Success) {
                $(result.Records).each(function () {
                    prompt.notify({
                        question: "Part Limit for User Group("+this.Key + ") was " + (!this.Value ? "" : "not") + " successfully deleted.",
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

PartUserGroupLimitsGrid.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetUserGroupsPartLimits",
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
    that.dataSourceOpts.pageSize = 5;
    return new kendo.data.DataSource(that.dataSourceOpts);
};

PartUserGroupLimitsGrid.prototype.dataSourceOpts = {};