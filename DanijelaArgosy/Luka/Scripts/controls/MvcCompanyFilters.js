function MvcCompanyFilters(opts) {
    var that = this;
    $(document).bind(argosyEvents.COMPANY_FILTER_HIDE, function (e) {
        $("#filtersContainer").hide();
        if (!$("#linksContainer").is(":visible")) {
            $("#mainbrowse").removeClass("col-sm-10").addClass("col-sm-12");
        }
    });
    $(document).bind(argosyEvents.COMPANY_FILTER_SHOW, function (e) {
        $("#filtersContainer").show();
        var linkContainer = $("#linksContainer");
        if (linkContainer.length > 0 && linkContainer.is(":visible")) {
            $(document).trigger(argosyEvents.COMPANY_LINKS_HIDE);
        }
        $("#mainbrowse").removeClass("col-sm-12").addClass("col-sm-10");
    });
};

