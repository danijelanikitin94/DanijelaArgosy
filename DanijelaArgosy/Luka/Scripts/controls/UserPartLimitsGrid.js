function UserPartLimitsGrid(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.setupGrid({});
}
UserPartLimitsGrid.prototype.options = {};
UserPartLimitsGrid.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=UserPartLimitsGrid]",
};
UserPartLimitsGrid.prototype.searchCriteria = {
};

UserPartLimitsGrid.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
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
                    title: "~{SKU}~",
                    field: "Sku"
                },
                {
                    title: "<span class='floatr textr'>~{LimitQty}~</span>",
                    template: "<div class='floatr textr'>#:kendo.toString(LimitQuantity,'n0')#</div>"
                },
                {
                    title: "<span class=''>~{TimeFrame}~</span>",
                    template: "<div class=''>${TimeFrame}</div>"
                },
                {
                    title: "<div class='text-center'>~{Active}~</div>",
                    field: "Enabled",
                    template: "<div class=' text-center '>#if (Active == 1) {#<span>YES</span>#} else {#<span>NO</span>#}#</div>"
                }

            ],
            title: "~{ProductLimits}~",
            toolbar: [
                { name: "addedit", text: " ~{AddEdit}~", 'class': "fa fa-plus" }
            ],
            addedit: function(e) {
                showAddEditProductLimitsModal();
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
                        that.showDeletePartLimitModal(data);
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
UserPartLimitsGrid.prototype.showDeletePartLimitModal = function (data) {
    var that = this;
    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function (e) {
            // this is what will happen when they click the confirm button
            that.DeletePartLimitFromUser(data);
        }
    };
    message.question = "~{WantToRemoveSelection}~";
    message.description = "~{CanNotRecoverProductLimit}~";
    message.button = "~{Remove}~";

    prompt.alert(message);
};

UserPartLimitsGrid.prototype.DeletePartLimitFromUser = function (partLimit) {
    var that = this;
    var params = { partLimit: partLimit };
    $.ajax({
        url: '/Admin/Users/DeleteUserPartLimit',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            
            if (result.ReturnCode == ReturnCode.Success) {
                $(result.Records).each(function () {
                    prompt.notify({
                        question: "Part Limit for "+this.Key + " was " + (!this.Value ? "" : "not") + " successfully deleted.",
                        type: (!this.Value ? "success" : "error")
                    });
                });
            } else {
                prompt.clientResponseError(result);
            }
            var grid = $(that.options.gridViewSelector).find(".k-collapse-grid").getKendoGrid();
            grid.dataSource.read();
            grid.refresh(true);

            var grid1 = $("div[data-argosy-view=UserEditAddPartLimits]").getKendoGrid();
            grid1.dataSource.read();
            grid1.refresh(true);
        }
    });
    $.fancybox.close();
};

UserPartLimitsGrid.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 5;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            // can't reference that.searchCriteria the other way
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetPartLimits",
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
UserPartLimitsGrid.prototype.dataSourceOpts = {};
