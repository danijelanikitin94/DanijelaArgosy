$(document).ready(function () {
    if ($("#resultado").val() !== '') {
        prompt.notify({
            question: $("#resultado").val(),
            type: $("#resultado").val().indexOf("error") == -1 ? "success" : "error"
        });
    }
});

function aUUpdate(id) {
    
    var question = "~{msgAUUpdate}~";
        var buttonText = "update";
        if (id === 0) {
            question = "~{msgAUCreate}~";
            buttonText = "create";
        }
        var message = {
            question: question,
            button: buttonText,
            type: "warning",
            yes: function(e) {
                if (typeof (e.preventDefault) === "function") {
                    $(".update-AccountingUnit").submit();
                    $.fancybox.close();
                }
            }
        };
        prompt.alert(message);
    
}

function showAddUsersModal() {
    $.fancybox({
        href: "#Users"
    });
}

function showAddUserGroupsModal() {
    $.fancybox({
        href: "#UserGroups"
    });
}

function closeModal() {
    $.fancybox.close();
}

function addUsers() {
    $(document).trigger(argosyEvents.START_LOADING);
    var selected = this.getSelectedRecords();
    if (selected.length != 0) {
        var params = { accountUnitId: $("#AccountingUnitId").val(), users: selected };

        $.ajax({
            url: '/Admin/AccountUnit/AddUsersToAccountingUnit',
            type: "POST",
            data: JSON.stringify(params),
            dataType: "json",
            traditional: true,
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                if (result.ReturnCode == ReturnCode.Success) {
                    prompt.notify({
                        question: "The users were successfully added.",
                        type: "success"
                    });
                    $.fancybox.close();
                } else {
                    prompt.clientResponseError(result);
                    $.fancybox.close();
                }
                var grid = $("div[data-argosy-view=AccountingUnitUsersGrid]").find(".k-collapse-grid").getKendoGrid();
                grid.dataSource.read();
                grid.refresh(true);
                var grid02 = $("div[data-argosy-view=AddUserToAccountUnitGridView]").getKendoGrid();
                grid02.dataSource.read();
                grid02.refresh(true);
                $(document).trigger(argosyEvents.END_LOADING);
            }
        });
    }
    else {
        prompt.notify({
            question: "~{msgSelectUser}~",
            type: "error"
        });
    }
}

function addUserGroups() {
    var userGroupsCollpaseGrid = $("div[data-argosy-control='AccountingUnitUserGroupsGrid']").data("kendoCollapseGrid"),
        userGroupsGrid = userGroupsCollpaseGrid.getKendoGrid(),
        addUserGroupGrid = $("div[data-argosy-control='AddUserGroupToAccountUnitGrid']").data("kendoGrid"),
        userGroupIds = [];
    $.each(addUserGroupGrid.select(), function (i, row) {
        var userGroup = addUserGroupGrid.dataItem(row);
        userGroupIds.push(userGroup.UserGroupId);
    });
    if (userGroupIds.length > 0) {
            $.ajax({
        url: "/Admin/AccountUnit/AddUserGroupsToAccountingUnit",
            type: "POST",
            data: kendo.stringify({
                accountUnitId: $("#AccountingUnitId").val(),
                userGroupIds: userGroupIds
            }),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                if (result.ReturnCode === ReturnCode.Success) {
                    prompt.notify({
                        question: "The items(s) were successfully added.",
                        type: "success"
                    });
                    $.fancybox.close();
                } else {
                    prompt.clientResponseError(result);
                    $.fancybox.close();
                }
                userGroupsGrid.dataSource.read();
                addUserGroupGrid.dataSource.read();
            }
        });
    }
    else {
        prompt.notify({
            question: "~{DynamicUserGroupLabel}~",
            type: "error"
        });
    }
}

function getSelectedRecords () {
    var that = this;
    var selectedRecords = [];
    var kendoGrid = $("div[data-argosy-view=AddUserToAccountUnitGridView]").getKendoGrid();

    $(kendoGrid.select()).each(function (i) {
        selectedRecords.push(kendoGrid.dataItem(this));
    });

    return selectedRecords;
};