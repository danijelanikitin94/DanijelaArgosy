function submitEditAddressForm() {
    $("form.update-address").submit();
}

function showAddUsersModal() {
    $.fancybox({
        href: "#divAddUsers"
    });
}

function showAddUserGroupsModal() {
    $.fancybox({
        href: "#divAddUserGroups"
    });
}

function addUsersToAddress() {
    var users = this.getSelectedUsers();
    $(document).trigger(argosyEvents.START_LOADING, { name: this.constructor.name });
    if (users.length > 0) {
        var params = {
            addressId: parseInt($("#AddressId").val()),
            users: users
    };
        $.ajax({
            url: "/Admin/AddressBook/AddAddressUsers",
            type: "POST",
            data: JSON.stringify(params),
            dataType: "json",
            traditional: true,
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                if (result.ReturnCode === ReturnCode.Success) {
                    for (var i = 0; i < result.Records.length; i++) {
                        prompt.notify({
                            question: result.Records[i].Key + " was successfully added to the Address.",
                            type: ("success")
                        });
                    };
                } else {
                    prompt.clientResponseError(result);
                };
                var grid = $("div[data-argosy-view=CompanyAddressShowUsersGridView]").find(".k-collapse-grid").getKendoGrid();
                grid.options.dataSource.read();
            }
        });
    } else {
        prompt.notify({
            question: "No items selected.",
            type: "error"
        });
    }
    $(document).trigger(argosyEvents.END_LOADING);
    $.fancybox.close();
};

function addUserGroupsToAddress() {
    var userGroups = this.getSelectedUserGroups();
    $(document).trigger(argosyEvents.START_LOADING, { name: this.constructor.name });
    if (userGroups.length > 0) {
        var params = {
            addressId: parseInt($("#AddressId").val()),
            userGroups: userGroups
        };
        $.ajax({
            url: "/Admin/AddressBook/AddAddressUserGroups",
            type: "POST",
            data: JSON.stringify(params),
            dataType: "json",
            traditional: true,
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                if (result.ReturnCode === ReturnCode.Success) {
                    for (var i = 0; i < result.Records.length; i++) {
                        prompt.notify({
                            question: result.Records[i].Key + " was successfully added to the Address.",
                            type: ("success")
                        });
                    };
                } else {
                    prompt.clientResponseError(result);
                };
                var grid = $("div[data-argosy-view=CompanyAddressShowUserGroupsGridView]").find(".k-collapse-grid").getKendoGrid();
                grid.options.dataSource.read();
            }
        });
    } else {
        prompt.notify({
            question: "No items selected.",
            type: "error"
        });
    }
    $(document).trigger(argosyEvents.END_LOADING);
    $.fancybox.close();
};

function getSelectedUsers() {
    var selectedUsers = [];
    var kendoGrid = $("div[data-argosy-view=CompanyAddressAddUsersGridView]").getKendoGrid();
    $(kendoGrid.select()).each(function () {
        selectedUsers.push(kendoGrid.dataItem(this));
    });
    return selectedUsers;
};

function getSelectedUserGroups() {
    var selectedUserGroups = [];
    var kendoGrid = $("div[data-argosy-view=CompanyAddressAddUserGroupsGridView]").getKendoGrid();
    $(kendoGrid.select()).each(function () {
        selectedUserGroups.push(kendoGrid.dataItem(this));
    });
    return selectedUserGroups;
};
