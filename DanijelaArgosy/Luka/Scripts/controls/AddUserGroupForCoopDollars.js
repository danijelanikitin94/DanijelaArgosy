function AddUserGroupForCoopDollars(opts) {
    $.extend(true, this.options, opts);
    this.setupGrid();
}

AddUserGroupForCoopDollars.prototype.options = {};

AddUserGroupForCoopDollars.prototype.setupGrid = function() {
    var that = this,
        grid = $("div[data-argosy-view='AddUserGroupForCoopDollars']").data("kendoGrid");
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
                    title: "~{UserGroup}~",
                    field: "GroupName",
                    width: "90%"
                }
            ],
            dataBound: function(e) {
                $.each(e.sender.items(),
                    function(i, item) {
                        $(item).find("._deleteMeRow").parent().click(function() {
                            that.deleteUserGroup(e.sender.dataItem(item));
                        });
                    });
                var selectedUsersGrid = $("div[data-argosy-view='AddUserForCoopDollars']").data("kendoGrid");
                if (e.sender.dataSource.total() < 1 && (selectedUsersGrid == null || selectedUsersGrid.dataSource.total() < 1)) {
                    $("#addUsersMessage").show();
                    $("button[data-bind$='saveAdjustment']").attr("disabled", true);
                } else {
                    $("#addUsersMessage").hide();
                    $("button[data-bind$='saveAdjustment']").attr("disabled", false);
                };
            }
        };
        $("div[data-argosy-view='AddUserGroupForCoopDollars']").kendoGrid(opts);
    } else {
        grid.dataSource.read();
    }
};

AddUserGroupForCoopDollars.prototype.deleteUserGroup = function(userGroup) {
    $(document).trigger(argosyEvents.START_LOADING);
    var addUserGroupsGrid = $("div[data-argosy-view='AddUserGroupToAdjustment']").data("kendoGrid"),
        selectedUserGroupsGrid = $("div[data-argosy-view='AddUserGroupForCoopDollars']").data("kendoGrid"),
        index = AddUserGroupToAdjustment.prototype.options.excludeUserGroupIds.indexOf(userGroup.UserGroupId);
    if (index >= 0) {
        AddUserGroupToAdjustment.prototype.options.excludeUserGroupIds.splice(index, 1);
    };
    addUserGroupsGrid.dataSource.read();
    selectedUserGroupsGrid.dataSource.remove(userGroup);
    $(document).trigger(argosyEvents.END_LOADING);
};

AddUserGroupForCoopDollars.prototype.addUserGroupsToAdjustment = function() {
    $(document).trigger(argosyEvents.START_LOADING);
    var addUserGroupsGrid = $("div[data-argosy-view='AddUserGroupToAdjustment']").data("kendoGrid"),
        selectedUserGroupsGrid = $("div[data-argosy-view='AddUserGroupForCoopDollars']").data("kendoGrid");

    if (addUserGroupsGrid.select().length > 0) {
        $.each(addUserGroupsGrid.select(),
            function(i, userGroup) {
                userGroup = addUserGroupsGrid.dataItem(userGroup);
                selectedUserGroupsGrid.dataSource.add(userGroup);
                AddUserGroupToAdjustment.prototype.options.excludeUserGroupIds.push(userGroup.UserGroupId);
            });
        addUserGroupsGrid.dataSource.read();
        $.fancybox.close();
    };
    $(document).trigger(argosyEvents.END_LOADING);
};