function UserGroupUsersGrid(opts) {
    var that = this;

    $.extend(true, that.options, that.baseOptions, opts);
    that.setupGrid({});
}

UserGroupUsersGrid.prototype.options = {};

UserGroupUsersGrid.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=UserGroupUsersGrid]"
};

UserGroupUsersGrid.prototype.searchCriteria = {
    UserGroupId: null//674
};

UserGroupUsersGrid.prototype.setupGrid = function () {
    var that = this,
        grid = $(that.options.gridViewSelector).getKendoGrid();
    if (grid == null) {
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
                    //template: "<a  href='/mockups/admin-part-details.html'><i class='fa la fa-times'></i></a>",
                    template: "<i class='fa la fa-times'></i>",
                    width: "10%"
                },
                {
                    title: "~{UserName}~",
                    field: "Username",
                    width: "40%"
                },{
                    title: "~{Name}~",
                    template: "${FirstName} ${LastName}",
                    width: "40%"
                }, {
                    title: "<div class='text-center'>Admin</div>",
                    template: "<div class=' text-center '>#if (AdminAccess == true) {#<span>YES</span>#} else {#<span>NO</span>#}#</div>",
                    width: "10%"
                }],
            title: "~{UsersInGroup}~",
            toolbar: [
                { name: "addedit", text: " ~{AddEdit}~ ", 'class': "fa fa-plus" }
            ],
            addedit: function() {
                showAddUserToUserGroupModal();
            },
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

UserGroupUsersGrid.prototype.showDeleteUserModal = function (data) {
    var that = this;
    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function (e) {
            if (typeof (e.preventDefault) === "function") {
                that.DeleteUserFromUserGroup(data);
            };
        }
    };
    message.question = "~{msgRemoveUserFromUserGroup}~";
    message.button = "~{Remove}~";
    prompt.alert(message);
};

UserGroupUsersGrid.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 5;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetUserGroupUsers",
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
    return new kendo.data.DataSource(that.dataSourceOpts);
};

UserGroupUsersGrid.prototype.DeleteUserFromUserGroup = function (user) {
    var that = this;
    var params = { user: user, userGroupId: 0 };
    $.ajax({
        url: "/Admin/Users/DeleteUsersFromUserGroup",
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
            $("div[data-argosy-view=AddUserToUserGroupGridView]").getKendoGrid().dataSource.read();
        }
    });
    $.fancybox.close();
};

UserGroupUsersGrid.prototype.dataSourceOpts = {};