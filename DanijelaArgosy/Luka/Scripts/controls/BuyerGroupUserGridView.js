function BuyerGroupUserGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.setupGrid();
};
BuyerGroupUserGridView.prototype.options = {};
BuyerGroupUserGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=BuyerGroupUserGridView]"
};
BuyerGroupUserGridView.prototype.setupGrid = function () {
    var that = this,
        grid = $(that.options.gridViewSelector).getKendoGrid();
    if (grid == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            pageable: {
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 5
            },
            columns: [
                {
                    template: "<i class='fa la fa-times'></i>",
                    width: "10%"
                },
                {
                    title: "~{UserName}~",
                    field: "UserName"
                },
                {
                    title: "<div class='text-center'>~{FirstName}~</div>",
                    field: "FirstName"
                }, {
                    title: "<div class='text-center'>~{LastName}~</div>",
                    field: "LastName"
                }
            ],
            toolbar: [
                { name: "addUser", text: " ~{AddEdit}~", 'class': "fa fa-plus" }
            ],
            addUser: function () {
                showAddUserToBuyerGroupModal();
            },
            title: "~{UsersBuyerGroup}~",
            dataBound: function (e) {
                var gridElement = $(e.sender.element);

                gridElement.find("tbody tr[role=row]").each(function () {
                    var data = e.sender.dataItem(this);
                    var deleteBtn = $(this).find(".fa.la.fa-times").parent();
                    deleteBtn.unbind("click");
                    deleteBtn.click(function () {
                        that.showDeleteUserModal(data);
                    });
                });
            }
        };
        $(that.options.gridViewSelector).kendoCollapseGrid(opts);
    } else {
        grid.dataSource.read();
    }
};

BuyerGroupUserGridView.prototype.showDeleteUserModal = function (data) {
    var that = this;
    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function (e) {
            if (typeof (e.preventDefault) === "function") {
                that.deleteUserFromBuyerGroup(data);
            };
        }
    };
    message.question = "~{WantToRemoveSelection}~";
    message.button = "~{Remove}~";
    prompt.alert(message);
};

BuyerGroupUserGridView.prototype.deleteUserFromBuyerGroup = function (data) {
    var that = this;
    var params = { buyerGroupUser: data };
    $.ajax({
        url: "/Admin/BuyerGroups/DeleteBuyerGroupUser",
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result.ReturnCode === ReturnCode.Success) {
                $(result.Records).each(function () {
                    prompt.notify({
                        question: "User(s) successfully removed.",
                        type: "success"
                    });
                });
            } else {
                prompt.clientResponseError(result);
            }
            $(that.options.gridViewSelector).find(".k-collapse-grid").getKendoGrid().dataSource.read();
            $("div[data-argosy-view=AddUserToBuyerGroupGridView]").getKendoGrid().dataSource.read();
        }
    });
    $.fancybox.close();
};

BuyerGroupUserGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            // can't reference that.searchCriteria the other way
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetBuyerGroupUsers",
                dataType: "json",
                data: search,
                success: function (result) {
                    if (result.ReturnCode === ReturnCode.Failed) {
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

BuyerGroupUserGridView.prototype.dataSourceOpts = {};
