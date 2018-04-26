$(document).ready(function () {
    if ($("#resultado").val() != '') {
        prompt.notify({
            question: $("#resultado").val(),
            type: $("#resultado").val().indexOf("error") == -1 ? "success" : "error"
        });
    }
});

function userGroupUpdate() {
    var message = {
        question: "~{msgUpdateUG}~",
        //description: "For now you can update just the name and description",
        button: "~{Update}~",
        type: "warning",
        yes: function (e) {
            if ((typeof (e.preventDefault) === "function")) {
                $("form.update-usergroup")[0].submit();
                $.fancybox.close();
            }
        }
    };
    prompt.alert(message);
};

function showAddUserToUserGroupModal() {
    $.fancybox({
        href: "#AddUserToUserGroup"
    });
};


function showAddPartCategoryToUserGroup() {
    $.fancybox({
        href: "#AddPartCategoryToUserGroup"
    });
};

function addUserToUserGroup(userGroup, div) {
    var selected = this.getSelectedRecords(div);
    if (selected.length != 0) {
        var params = { users:selected, userGroupId: userGroup };
        $.ajax({
            url: '/Admin/Users/AddUsersToUserGroup',
            type: "POST",
            data: JSON.stringify(params),
            dataType: "json",
            traditional: true,
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                if (result.ReturnCode == ReturnCode.Success) {
                    prompt.notify({
                        question: "The users were " + (!this.Value ? "" : "not") + " successfully added to the Group.",
                        type: (!this.Value ? "success" : "error")
                    });
                } else {
                    prompt.clientResponseError(result);
                }
                var grid = $("div[data-argosy-view=UserGroupUsersGrid]").find(".k-collapse-grid").getKendoGrid();
                grid.dataSource.read();
                grid.refresh(true);
                var grid02 = $("div[data-argosy-view=AddUserToUserGroupGridView]").getKendoGrid();
                grid02.dataSource.read();
                grid02.refresh(true);
            }
        });
    }
    else {
        prompt.notify({
            question: "~{msgSelectUser}~",
            type: "error"
        });
    }
    $.fancybox.close();
};

function addPartCategoryToUserGroup(userGroup, div) {
    var selected = this.getSelectedRecords(div);
    if (selected.length != 0) {
        var params = { groupId:userGroup, partCategories:selected };
        $.ajax({
            url: '/Admin/UserGroups/AddPartCategoryTopUserGroup',
            type: "POST",
            data: JSON.stringify(params),
            dataType: "json",
            traditional: true,
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                if (result.ReturnCode == ReturnCode.Success) {
                    prompt.notify({
                        question: "The Part Categories were " + (!this.Value ? "" : "not") + " successfully added to the Group.",
                        type: (!this.Value ? "success" : "error")
                    });
                } else {
                    prompt.clientResponseError(result);
                }
                var grid = $("div[data-argosy-view=UserGroupPartCategoriesGrid]").find(".k-collapse-grid").getKendoGrid();
                grid.dataSource.read();
                grid.refresh(true);
                var grid02 = $("div[data-argosy-view=AddPartCategoryToUserGroupGridView]").getKendoGrid();
                grid02.dataSource.read();
                grid02.refresh(true);
            }
        });
    }
    else {
        prompt.notify({
            question: "~{msgSelectUser}~",
            type: "error"
        });
    }
    $.fancybox.close();
};

function getSelectedRecords(div) {
    var selectedRecords = [];
    //var kendoGrid = $("div[data-argosy-view=AddUserToUserGroupGridView]").getKendoGrid();
    var kendoGrid = $("div[data-argosy-view="+div+"]").getKendoGrid();

    $(kendoGrid.select()).each(function (i) {
        selectedRecords.push(kendoGrid.dataItem(this));
    });

    return selectedRecords;
};
function closeCommentModal() {
    $.fancybox.close();
}