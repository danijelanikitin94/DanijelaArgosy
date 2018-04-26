function showNewGlobalProfileModal() {
    $.fancybox({
        href: "#NewGlobalProfileModal"
    });
}

function submitForm() {
    var ddl = $("select[data-argosy-view=CompanyGlobalFormsDropDown]").getKendoDropDownList();

    if ($("#Name").val() == "") {
        prompt.notify({
            question: "~{msgGPProfileName}~",
            type: "error"
        });
        $("#Name").focus();
        return;
    }

    if (ddl != null && ddl.value() != "") {
        $("#GlobalFormsId").val(ddl.value());
    } else {
        prompt.notify({
            question: "~{msgGPSelectForm}~",
            type: "error"
        });

        return;
    }

    $("form.add-globalprofile")[0].submit();
}