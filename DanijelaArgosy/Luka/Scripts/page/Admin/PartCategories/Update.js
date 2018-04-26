function submitPartCategoryForm() {
    $("form.update-partcategory")[0].submit();
}

function showAddPartsModal() {
    $.fancybox({
        href: "#divAddParts"
    });
};

function closeCommentModal() {
    $.fancybox.close();
};

function addPartsToGroup(groupId) {
    var parts = this.getSelectedParts();
    console.log(parts);
    if (parts.length != 0) {
        var params = { parts: parts, groupId: groupId };
        console.log(params);
        $.ajax({
            url: "/Admin/PartCategories/AddPartToGroup",
            type: "POST",
            data: JSON.stringify(params),
            dataType: "json",
            traditional: true,
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                if (result.ReturnCode === ReturnCode.Success) {
                    prompt.notify({
                        question: "The Parts were " + (!this.Value ? "" : "not") + " successfully added to the Group.",
                        type: (!this.Value ? "success" : "error")
                    });
                } else {
                    prompt.clientResponseError(result);
                }
                var grid = $("div[data-argosy-view=PartCategoryPartsGridView]").getKendoGrid();
                grid.dataSource.read();
                grid.refresh();
                var grid02 = $("div[data-argosy-view=CompanyPartsGridView]").getKendoGrid();
                grid02.dataSource.read();
                grid02.refresh();
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


function getSelectedParts() {
    var selectedParts = [];
    var kendoGrid = $("div[data-argosy-view=CompanyPartsGridView]").getKendoGrid();
    $(kendoGrid.select()).each(function (i) {
        selectedParts.push(kendoGrid.dataItem(this));
    });
    return selectedParts;
};