function MvcProductCategories(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(window).on('hashchange', function (e) {
        var oldHash = e.originalEvent.oldURL.replace(window.location.origin + window.location.pathname, "");
        var newHash = e.originalEvent.newURL.replace(window.location.origin + window.location.pathname, "");
        if (that.hasHashChanged(oldHash, newHash)) {
            that.triggerChangeEvent(newHash);
        }
    });
    that.setupMenu();
}

MvcProductCategories.prototype.options = {};

MvcProductCategories.prototype.baseOptions = {
    menuSelector: "ul[data-argosy-view=MvcProductCategoryList]",
    initialLoadComplete: false
};

MvcProductCategories.prototype.triggerChangeEvent = function (hashString) {
    
    var that = this;
    var hash = that.getCategoryHash(hashString);
    var item = $("span[data-argosy-categoryName='" + hash.value + "']");
    item.parent().parent().parent().find(".k-state-active").each(function(i) {
        $(this).removeClass("k-state-active");
    });
    item.parent().parent().addClass("k-state-active");
    var categoryId = parseInt(item.data("argosyCategoryid"));
    var categoryName = hash.value;
    var categoryDesc = item.data("argosyCategorydesc");
    var categoryComments = item.data("argosyCategorycomments");
    var showGridView = item.data('argosyCategoryshowgridview');
    var partCat = {};
    partCat.id = categoryId;
    partCat.name = categoryName;
    partCat.desc = categoryDesc;
    partCat.comments = categoryComments;
    partCat.showGridView = showGridView;
    $(document).trigger(argosyEvents.PART_CATEGORY_CHANGE, partCat);
}

MvcProductCategories.prototype.hasHashChanged = function (oldHash, newHash) {
    var that = this;
    var oldCategory = that.getCategoryHash(oldHash);
    var newCategory = that.getCategoryHash(newHash);
    return oldCategory.value.toLowerCase() != newCategory.value.toLowerCase();
}

MvcProductCategories.prototype.getCategoryHash = function (hash) {
    var that = this;
    var pieces = hash.split('/');
    var categoryHash = {
        type: "Category",
        value: ""
    };
    for (var i = 0; i < pieces.length; i++) {
        var piece = pieces[i];
        if (piece.indexOf("Category") > -1 || piece.indexOf("category") > -1) {
            categoryHash.value = piece.split(":")[1];
            break;
        }
    }
    return categoryHash;
}

MvcProductCategories.prototype.setupMenu = function () {
    var that = this;
    if ($(that.options.menuSelector).getKendoMenu() == null) {
        $.ajax({
            url: "/DataView/GetPartCategoryHierachyView",
            dataType: "json",
            data: {ParentGroupId: 0},
            success: function (result) {
                if (result.ReturnCode == ReturnCode.Failed) {
                    handleDataSourceException(result);
                } else {
                    $(that.options.menuSelector).kendoMenu({
                        orientation: "vertical",
                        dataSource: that.convertToMenu(result.Records),
                        select: function (e) {
                            var item = $(e.item).find("span[data-argosy-categoryid]");
                            var categoryName = item.attr("data-argosy-categoryName");
                            window.location.hash = '#Category:' + categoryName;
                            if (window.location.pathname.toLowerCase().indexOf("store") < 0) {
                                window.location = "/Store#Category:" + categoryName;
                            }
                        }
                    });

                    var initialHash = that.getCategoryHash(window.location.hash);
                    if (initialHash.value != "") {
                        that.triggerChangeEvent(window.location.hash);
                    } else {
                        that.triggerChangeEvent('#Category:' + that.DefaultPartCategory.GroupName);
                    }
                }
            }
        });
    }
};

MvcProductCategories.prototype.convertToMenu = function (data) {
    var that = this,
        menu = [];

    $(data).each(function (i) {
        var desc = "",
            comments="";

        if (this.Description !== this.GroupName) {
            desc = this.Description;
        }

        if (i === 0 && that.DefaultPartCategory == null) {
            that.DefaultPartCategory = this;
        }
        if (this.CategoryComments) {
            comments = $.trim(this.CategoryComments);
        }
        
        menu.push({
            text: "<span data-argosy-categoryShowgridview='" + this.ShowGridView + "' data-argosy-categoryComments='" + comments + "' data-argosy-categoryId='" + this.GroupId + "' data-argosy-categoryName='" + $.trim(this.GroupName) + "' data-argosy-categoryDesc='" + desc + "'>" + this.GroupName + "</span>",
            encoded: false,
            items: ((this.ChildPartCategories == null || this.ChildPartCategories.length > 0) ? that.convertToMenu(this.ChildPartCategories) : null),
        });
    });

    return menu;
};