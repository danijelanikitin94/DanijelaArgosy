function MvcCompanyLinks(opts) {
    var that = this;
    $(document).bind(argosyEvents.COMPANY_LINKS_HIDE, function (e) {
        $("#linksContainer").hide();
        var icon = $("a[data-argosy-view=MvcProductPageLinkViewSelector]").find("i");
        icon.removeClass("fa-caret-square-o-right").addClass("fa-caret-square-o-left");
        if (!$("#filtersContainer").is(":visible")) {
            $("#mainbrowse").removeClass("col-sm-10").addClass("col-sm-12");
        }
    });
    $(document).bind(argosyEvents.COMPANY_LINKS_SHOW, function (e) {
        $("#linksContainer").show();
        var filtersContainer = $("#filtersContainer");
        var icon = $("a[data-argosy-view=MvcProductPageLinkViewSelector]").find("i");
        icon.removeClass("fa-caret-square-o-left").addClass("fa-caret-square-o-right");
        if (filtersContainer.length > 0 && filtersContainer.is(":visible")) {
            $(document).trigger(argosyEvents.COMPANY_FILTER_HIDE);
        }
        $("#mainbrowse").removeClass("col-sm-12").addClass("col-sm-10");
    });
};