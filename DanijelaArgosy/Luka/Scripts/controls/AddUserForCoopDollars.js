function AddUserForCoopDollars(opts) {
    $.extend(true, this.options, opts);
    this.setupGrid();
}

AddUserForCoopDollars.prototype.options = {};

AddUserForCoopDollars.prototype.setupGrid = function() {
    var that = this,
        grid = $("div[data-argosy-view='AddUserForCoopDollars']").data("kendoGrid");
    if (grid == null) {
        var opts = {
            dataSource: new kendo.data.DataSource({ pageSize: 5 }),
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
                    template: "<i class='fa la fa-times _deleteMeRow'></i>",
                    width: "10%"
                }, {
                    title: "~{UserName}~",
                    field: "Username",
                    width: "45%"
                }, {
                    title: "~{FullName}~",
                    template: "${FirstName} ${LastName}",
                    width: "45%"
                }
            ],
            title: "~{AssignToUsers}~",
            dataBound: function(e) {
                $.each(e.sender.items(),
                    function(i, item) {
                        $(item).find("._deleteMeRow").parent().click(function() {
                            that.deleteUser(e.sender.dataItem(item));
                        });
                    });
                var selectedUserGroupsGrid = $("div[data-argosy-view='AddUserGroupForCoopDollars']").data("kendoGrid");
                if (e.sender.dataSource.total() < 1 && (selectedUserGroupsGrid == null || selectedUserGroupsGrid.dataSource.total() < 1)) {
                    $("#addUsersMessage").show();
                    $("button[data-bind$='saveAdjustment']").attr("disabled", true);
                } else {
                    $("#addUsersMessage").hide();
                    $("button[data-bind$='saveAdjustment']").attr("disabled", false);
                };
            }
        };
        $("div[data-argosy-view='AddUserForCoopDollars']").kendoGrid(opts);
    } else {
        grid.dataSource.read();
    }
};

AddUserForCoopDollars.prototype.deleteUser = function(user) {
    $(document).trigger(argosyEvents.START_LOADING);
    var addUsersGrid = $("div[data-argosy-view='AddUserToAdjustment']").data("kendoGrid"),
        selectedUsersGrid = $("div[data-argosy-view='AddUserForCoopDollars']").data("kendoGrid"),
        index = AddUserToAdjustment.prototype.options.excludeUserIds.indexOf(user.UserId);
    if (index >= 0) {
        AddUserToAdjustment.prototype.options.excludeUserIds.splice(index, 1);
    };
    addUsersGrid.dataSource.read();
    selectedUsersGrid.dataSource.remove(user);
    $(document).trigger(argosyEvents.END_LOADING);
};

AddUserForCoopDollars.prototype.addUsersToAdjustment = function() {
    $(document).trigger(argosyEvents.START_LOADING);
    var addUsersGrid = $("div[data-argosy-view='AddUserToAdjustment']").data("kendoGrid"),
        selectedUsersGrid = $("div[data-argosy-view='AddUserForCoopDollars']").data("kendoGrid");

    if (addUsersGrid.select().length > 0) {
        $.each(addUsersGrid.select(),
            function(i, user) {
                user = addUsersGrid.dataItem(user);
                selectedUsersGrid.dataSource.add(user);
                AddUserToAdjustment.prototype.options.excludeUserIds.push(user.UserId);
            });
        addUsersGrid.dataSource.read();
        $.fancybox.close();
    };
    $(document).trigger(argosyEvents.END_LOADING);
};