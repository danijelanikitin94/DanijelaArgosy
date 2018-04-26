function MvcCompanyFiltersHorizontal(opts) {
    var that = this;
    $(document).bind(argosyEvents.COMPANY_FILTER_HIDE, function (e) {
        $("#filtersContainer").hide();
        filterPadding();
    });
    $(document).bind(argosyEvents.COMPANY_FILTER_SHOW, function (e) {
        $("#filtersContainer").slideDown(function () {
            filterPadding();
        });

    });
};

function filterPadding() {
    var filterContainer = $("nav");
    var filterHeight = filterContainer.height();
    if (filterContainer.css("display") === "none") {
        filterHeight = 0;
    }
    $("#product-container").css("paddingTop", filterHeight + 15 + "px");
}