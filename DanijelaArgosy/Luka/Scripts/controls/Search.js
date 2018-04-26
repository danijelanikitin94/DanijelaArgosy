function Search(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.addSearchFeatures();
    that.addSearchStyling();
    that.addSearchEvents();
}

Search.prototype.options = {};

Search.prototype.baseOptions = {
    searchContainerSelector: "div[data-argosy-control=Search]"
};

Search.prototype.setFormSubmit = function (event) {
    var that = this;
    if (event.keyCode == 13) {
        $(document).trigger(argosyEvents.SEARCH_PAGE_GRID, that.getSearchObject());
        if (event.preventDefault()) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    }
    event.returnValue = true;
}

Search.prototype.addSearchFeatures = function () {
    var that = this;
    var searchContainer = $(that.options.searchContainerSelector);
    var inputControls = searchContainer.find("*[data-argosy-search]");
    var showAdvancedSearch = false;
    $(inputControls).each(function(i) {
        var item = $(this);
        if (!showAdvancedSearch && item.attr("data-argosy-type") === "advanced") {
            showAdvancedSearch = true;
        }
    });
    searchContainer.before(that.buildShowSearchLink());
    searchContainer.prepend(that.buildSearchHeader());
    searchContainer.after(that.buildHideSearchLink());
    searchContainer.after(that.buildSearchButton());
    searchContainer.find("div:last").after(that.buildAdvancedSearchLink(showAdvancedSearch));
    searchContainer.find("div:last").after(that.buildBasicSearchLink(inputControls));
};
Search.prototype.buildSearchHeader = function () {
    var that = this;
    var h4 = $("<h4 />", {
        'class': "text-center",
        text: "~{Search}~"
    });
    return h4;
};
Search.prototype.buildAdvancedSearchLink = function (showAdvancedSearch) {
    var that = this;
    var showHideState = showAdvancedSearch ? "show" : "hide";
    var div = $("<div />", {
        'class': "padb5 showAdvancedSearch finger " + showHideState
    });
    var link = $("<a />", {
        html: "<i class='fa fa-chevron-circle-down'></i> ~{AdvancedSearch}~"
    });
    div.append(link);
    return div;
};
Search.prototype.buildBasicSearchLink = function () {
    var that = this;
    var div = $("<div />", {
        'class': "padb5 hideAdvancedSearch finger hide"
    });
    var link = $("<a />", {
        html: "<i class='fa fa-chevron-circle-up'></i> Basic Search"
    });
    div.append(link);
    return div;
};
Search.prototype.buildSearchButton = function () {
    var that = this;
    var div = $("<div />", {
        'class': "search-grid-btn finger"
    });
    var link = $("<a />", {
        'class': "btn btn-primary btn-block",
        text: "~{Search}~"
    });
    div.append(link);
    return div;
};
Search.prototype.buildHideSearchLink = function () {
    var that = this;
    var div = $("<div />", {
        'class': "padu10 hideSearchCriteria finger show"
    });
    var link = $("<a />", {
        html: "<i class='fa fa-chevron-circle-left'></i> ~{HideSearchCriteria}~"
    });
    div.append(link);
    return div;
};
Search.prototype.buildShowSearchLink = function () {
    var that = this;
    var div = $("<div />", {
        'class': "padu10 hide finger showSearchCriteria"
    });
    var link = $("<a />", {
        html: "<i class='fa fa-chevron-circle-right'></i> ~{ShowSearchCriteria}~"
    });
    div.append(link);
    return div;
};
Search.prototype.addSearchStyling = function () {
    var that = this;
    var searchContainer = $(that.options.searchContainerSelector);
    var inputControls = searchContainer.find("*[data-argosy-search]");
    searchContainer.addClass("search-grid");
    $(inputControls).each(function(i) {
        var item = $(this);
        // add submit action
        item.unbind("keypress");
        item.keypress(function (e) {
            that.setFormSubmit(e);
        });
        var div = item.parent();
        if (i == 0) {
            div.addClass("padu10");
        }
        if (item.attr("data-argosy-type") === "advanced") {
            div.hide();
        }
        div.addClass("padb5");
    });
};
Search.prototype.addSearchEvents = function () {
    var that = this;
    var searchContainer = $(that.options.searchContainerSelector);
    var searchButton = searchContainer.parent().find(".search-grid-btn");
    var inputControls = searchContainer.find("*[data-argosy-search]");
    var showButton = searchContainer.parent().find(".showSearchCriteria");
    var hideButton = searchContainer.parent().find(".hideSearchCriteria");
    var showAdvancedButton = searchContainer.parent().find(".showAdvancedSearch");
    var hideAdvancedButton = searchContainer.parent().find(".hideAdvancedSearch");
    searchButton.click(function (e) {
        $(document).trigger(argosyEvents.SEARCH_PAGE_GRID, that.getSearchObject());
    });

    showAdvancedButton.on('click', function () {
        $(inputControls).each(function (e) {
            var item = $(this);
            var div = item.parent();
            if (item.attr("data-argosy-type") === "advanced") {
                div.show();
            }
        });
        showAdvancedButton.hide();
        hideAdvancedButton.show();
    });

    hideAdvancedButton.on('click', function () {
        $(inputControls).each(function (e) {
            var item = $(this);
            var div = item.parent();
            if (item.attr("data-argosy-type") === "advanced") {
                div.hide();
            }
        });
        showAdvancedButton.show();
        hideAdvancedButton.hide();
    });

    hideButton.click(function(e) {
        searchContainer.hide();
        showButton.show();
        hideButton.hide();
        searchButton.hide();
        searchContainer.parent().parent().find(".col-sm-10").removeClass("col-sm-10 padl20").addClass("col-sm-12");
    });

    showButton.click(function(e) {
        searchContainer.show("slow");
        hideButton.show();
        showButton.hide();
        searchButton.show();
        searchContainer.parent().parent().find(".col-sm-12").removeClass("col-sm-12").addClass("col-sm-10 padl20");
    });
};
Search.prototype.getSearchObject = function () {
    var that = this;
    var searchContainer = $(that.options.searchContainerSelector);
    var inputControls = searchContainer.find("*[data-argosy-search]");
    var searchObject = {};
    $(inputControls).each(function (i) {
        var item = $(this);
        var property = item.attr("data-argosy-search");
        searchObject[property] = that.getInputData(item);
    });
    return searchObject;
};
Search.prototype.getInputData = function (input) {
    var returnVal = null;
    if (input.getKendoDatePicker() != null) {
        var val = input.getKendoDatePicker().value();
        if (val != null) {
            returnVal = val.toJSON();
        }
    } else {
        var type = "";
        if (input.is("input")) {
            type = input.attr('type').toLowerCase();
        }
        switch (type) {
            case "checkbox":
            case "radio":
                returnVal = input.is(":checked");
                break;
            default:
                var elementVal = input.val();
                if (input.data("getValue") != undefined) {
                    elementVal = input.data("getValue")();
                }
                if (elementVal != "" && elementVal != null) {
                    returnVal = elementVal;
                }
                break;
        }
    }
    if (returnVal != null && (typeof returnVal) == "string" && returnVal.toLowerCase() == "null") {
        returnVal = null;
    }
    return returnVal;
};