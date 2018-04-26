function ModalProductViewingRights(opts) {
    $.extend(true, this.options, this.baseOptions, opts);
    var that = this,
        controlLoader = new ControlLoader();
    controlLoader.loadTemplate("ModalViewingRights", function (template) {
        $(document.body).append(template);
        $(that).trigger(that.EVENT_TEMPLATE_LOADED);
    });
}

ModalProductViewingRights.prototype.options = {
};

ModalProductViewingRights.prototype.baseOptions = {
    html: "#_ViewingRights",
    modal: "#_ViewingRightsModal",
    title: "#_ViewingRightsTitle",
    userGroups: "#_UserGroups",
    userGroupsList: "#_UserGroupsList",
    inclusionTags: "#_InclusionTags",
    inclusionTagsList: "#_InclusionTagsList",
    exclusionTags: "#_ExclusionTags",
    exclusionTagsList: "#_ExclusionTagsList"
};

ModalProductViewingRights.prototype.EVENT_TEMPLATE_LOADED = "TEMPLATE_MODAL_PRODUCT_VIEWING_RIGHTS_LOADED";

ModalProductViewingRights.prototype.init = function (part) {
    var that = this;
    $(document).trigger(argosyEvents.START_LOADING);
    $.ajax({
        url: "/Admin/Parts/GetUserGroupNames",
        data: {
            partId: part.partId,
            companyId: part.companyId
        },
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            var userGroupsList = $(that.options.userGroupsList),
                userGroups = $(that.options.userGroups),
                inclusionTagsList = $(that.options.inclusionTagsList),
                inclusionTags = $(that.options.inclusionTags),
                exlusionTagsList = $(that.options.exclusionTagsList),
                exclusionTags = $(that.options.exclusionTags);
            userGroupsList.empty();
            inclusionTagsList.empty();
            exlusionTagsList.empty();
            $(that.options.title).html(part.partName);
            if (result.length > 0) {
                userGroups.show();
                userGroupsList.text(result.join(", "));
            } else {
                userGroups.hide();
            };
            if (part.inclusionTags !== null && part.inclusionTags !== "") {
                inclusionTags.show();
                inclusionTagsList.text(part.inclusionTags);
            } else {
                inclusionTags.hide();
            };
            if (part.exclusionTags !== null && part.exclusionTags !== "") {
                exclusionTags.show();
                exlusionTagsList.text(part.exclusionTags);
            } else {
                exclusionTags.hide();
            };
            $.fancybox({
                content: $(that.options.html).html()
            });
            $(document).trigger(argosyEvents.END_LOADING);
        }
    });
}
