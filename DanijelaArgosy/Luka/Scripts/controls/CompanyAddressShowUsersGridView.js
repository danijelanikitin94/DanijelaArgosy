function CompanyAddressShowUsersGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.dataSource = that.getDataSource();
    that.dataSource.read();
    that.setupGrid({});
}

CompanyAddressShowUsersGridView.prototype.options = {};

CompanyAddressShowUsersGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=CompanyAddressShowUsersGridView]"
};

CompanyAddressShowUsersGridView.prototype.searchCriteria = {};

CompanyAddressShowUsersGridView.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            autoBind: false,
            dataSource: that.dataSource,
            groupable: false,
            editable: false,
            sortable: true,
            scrollable: false,
            exportToExcel: false,
            pageable: {
                pageSize: 5,
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
                    title: "~{UserName}~",
                    field: "FullName"
                }],
            title: "~{AddressUsers}~",
            toolbar: [
                { name: "addUsers", text: " ~{Add}~", 'class': "fa fa-plus" }
            ],
            addUsers: function () {
                showAddUsersModal();
            },
            dataBound: function (e) {
                var gridElement = $(e.sender.element);
                var grid = gridElement.getKendoGrid();

                gridElement.find("tbody tr[role=row]").each(function () {
                    var data = grid.dataItem(this);
                    var deleteBtn = $(this).find(".fa.la.fa-times").parent();
                    deleteBtn.unbind("click");
                    deleteBtn.click(function () {
                        that.showDeleteUserModal(data);
                    });
                });
            }
        };
        $(document).trigger(argosyEvents.START_LOADING, { name: that.constructor.name });
        $(that.options.gridViewSelector).kendoCollapseGrid(opts);
        $(document).trigger(argosyEvents.END_LOADING);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoCollapseGrid();
        grid.dataSource.read();
    }
};

CompanyAddressShowUsersGridView.prototype.showDeleteUserModal = function (data) {
    var that = this;
    var message = {
        question: "Are you sure you want to remove " + data.FullName + " from this Address?",
        button: "Remove",
        type: "warning",
        yes: function (e) {
            if (typeof (e.preventDefault) === "function") {
                that.deleteAddressUser(data);
            }
        }
    };
    prompt.alert(message);
};

CompanyAddressShowUsersGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 5;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/Admin/AddressBook/GetUsers",
                dataType: "json",
                data: search,
                success: function (result) {
                    if (result.ReturnCode === ReturnCode.Failed) {
                        handleDataSourceException(result);
                    } else {
                        $(document).trigger(argosyEvents.ADDRESS_USERS_LOADED, { users: result });
                        options.success(result);
                    }
                }
            });
        }
    };
    return new kendo.data.DataSource(that.dataSourceOpts);
};

CompanyAddressShowUsersGridView.prototype.deleteAddressUser = function (user) {
    var that = this;
    var params = {
        userId: user.UserId,
        addressId: that.options.addressId
    };
    $(document).trigger(argosyEvents.START_LOADING, { name: that.constructor.name });
    $.ajax({
        url: "/Admin/AddressBook/DeleteAddressUser",
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            var grid = $(that.options.gridViewSelector).find(".k-collapse-grid").getKendoGrid();
            if (result.ReturnCode === ReturnCode.Success) {
                $(result.Records).each(function () {
                    prompt.notify({
                        question: this.Key + " was removed from this Address.",
                        type: ("success")
                    });
                });
                grid.dataSource.read();
            } else {
                prompt.clientResponseError(result);
            }
        }
    });
    $(document).trigger(argosyEvents.END_LOADING);
    $.fancybox.close();
};

CompanyAddressShowUsersGridView.prototype.dataSourceOpts = {};
