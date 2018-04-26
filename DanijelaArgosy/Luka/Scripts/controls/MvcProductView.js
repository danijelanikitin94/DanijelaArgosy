
function MvcProductView(opts) {

    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();
    controlLoader.loadControl("ModalProductUsage", {}, function (control) {
        that.productUsageControl = control;
    });
    controlLoader.loadControl("ModalProductViewingRights", {}, function (control) {
        that.productViewingRightsControl = control;
    });
    controlLoader.loadControl("ModalPartConfiguration", {}, function (control) {
        that.productConfigurationControl = control;
    });

    that.setupEventListeners();
    controlLoader.loadTemplate("MvcProductView", function (template) {
        $(document.body).append(template);
        $("*[data-argosy-uuid='" + that.options.uuid + "']").append($(that.options.productViewTemplateHref).html());

        that.dataSource = that.getDataSource();
        that.setupLoadingAttributes();
        that.setupListView();
        that.setupGridView();
        that.setupPagerView();
        that.setupSortDropDown();
        that.setupViewButtons();
        that.updateTitle();
        if (!that.options.waitForCategoryLoad && window.location.hash.length === 0) {
            that.read();
        }
        that.loaded = true;
        //WAY Hacky need to figure out time issue 
        $(function () {
            setTimeout(function() {
                $(document).trigger(that.EVENT_TEMPLATE_LOADED);
                },
                300);
            
        });


    });
}

MvcProductView.prototype.options = {
    currentSearch: {
        ExcludePartIds: []
    }
};

MvcProductView.prototype.recordCount = null;

MvcProductView.prototype.baseOptions = {
    passedSku: getQuerystring("sku", null),
    listViewHref: "div[data-argosy-view=MvcProductListView]",
    gridViewHref: "div[data-argosy-view=MvcProductGridView]",
    masonryViewHref: "div[data-argosy-view=MvcProductMasonryView]",
    categoryViewHref: "div[data-argosy-view=MvcCategoryGridView]",
    hotPartsViewHref: "div[data-argosy-view=MvcHotProductsView]",
    pagerHref: "div[data-argosy-view=MvcProductViewPager]",
    headerHref: "#_productContainerHeader",
    sortBySelector: "select[data-argosy-view=MvcProductViewSort]",
    sortByTextSelector: "select[data-argosy-view=MvcProductViewSortText]",
    showGridViewSelector: "a[data-argosy-view=MvcProductGridViewSelector]",
    showListViewSelector: "a[data-argosy-view=MvcProductListViewSelector]",
    showPageLinksSelector: "a[data-argosy-view=MvcProductPageLinkViewSelector]",
    showCompanyFilterSelector: "a[data-argosy-view=MvcProductCompanyLinkViewSelector]",
    showMasonryViewSelector: "a[data-argosy-view=MvcProductMasonryViewSelector]",
    titleHref: "*[data-argosy-view=MvcProductViewTitle]",
    commentHref: "*[data-argosy-view=MvcProductViewComments]",
    showDetailsHref: "*[data-argosy-view=MvcProductViewShowDetails]",
    productViewTemplateHref: "#_ProductViewTemplate",
    availabilityTemplate: "#_ProductAvailabilityTemplate",
    onHandTemplate: "#_ProductOnHandTemplate",
    keywordSearchSelector: "input.search",
    historyTitleElment: "[rel='historyTitleElement']",
    category: "",
    categoryComments: "",
    showHeader: true,
    showTopCategoriesOnly: false,
    showCategoryThumbnails: false,
    showGridView: true,
    showPricing: true,
    showEstShip: true,
    showTitle: true,
    showCategoryComments: true,
    showSort: true,
    showDescription: true,
    showCompanyLinks: true,
    openCompanyLinks: false,
    waitForCategoryLoad: false,
    showHotProductsLander: false,
    initalLoad: true,
    currentKeywordSearch: "",
    currentSearch: {
        Active: "Y",
        PartGroupId: 0,
        Keyword: decodeURIComponent(getQuerystring("searchFor", "")),
        Sku: "",
        PartName: "",
        Description: "",
        FormNo: "",
        Code: "",
        Type: "",
        Plant: "",
        Manufacturer: "",
        VendorSku: "",
        InternalPartId: "",
        SortOption: "rank",
        ShowTopCategoriesOnly: false
    }
};

MvcProductView.prototype.EVENT_TEMPLATE_LOADED = argosyEvents.MVC_VIEW_PRODUCTS_CONTROL_LOADED;
MvcProductView.prototype.EVENT_LISTENERS_LOADED = "PRODUCT_VIEW_LISTENERS_LOADED";
MvcProductView.prototype.productDetailControl = null;
MvcProductView.prototype.productUsageControl = null;
MvcProductView.prototype.productViewingRightsControl = null;
MvcProductView.prototype.productConfigurationControl = null;
MvcProductView.prototype.landingPageHotProductsControl = null;
MvcProductView.prototype.categoryViewControl = null;
MvcProductView.prototype.loaded = false;
MvcProductView.prototype.loadConfigFromQueryString = function() {
    var that = this;
    
    if (that.options.passedSku !== null) {
        var part = that.getPartBySku(that.options.passedSku);
        that.options.passedSku = null;
        if (that.productConfigurationControl != null && part !== null) {
            that.productConfigurationControl.show(part);
        } 
       
    }
};
MvcProductView.prototype.updateTitle = function () {
    var that = this;

    $(that.options.titleHref).html(decodeURIComponent(that.options.category));
    $(that.options.commentHref).html(decodeURIComponent(that.options.categoryComments));
    if (!that.options.showTitle) {
        $(that.options.titleHref).hide();
    }
    if (!that.options.showCategoryComments) {
        $(that.options.commentHref).hide();
    }

    else if (!that.options.showGridView) {
        $(that.options.showGridViewSelector).trigger('click');
    } else {
        $(that.options.showListViewSelector).trigger('click');
    }
};

MvcProductView.prototype.setupLoadingAttributes = function () {
    var that = this;
    var mainElement = $("*[data-argosy-uuid='" + that.options.uuid + "']");
    appendLoadingAttribute(mainElement, that.constructor.name);
    mainElement.attr("data-argosy-loading-message", "~{MsgLoadingYourProducts}~");
    appendLoadingAttribute($("*[data-argosy-control='MvcProductCategories']"), that.constructor.name, true);
};

MvcProductView.prototype.setupEventListeners = function () {
    var that = this;
    $(document).bind(argosyEvents.PART_CATEGORY_CHANGE, function (e, partCategory) {
        var control = that;
        $("#menu").data("kendoMenu").close();
        control.options.category = partCategory.name;
        control.options.currentSearch.PartGroupId = partCategory.id;
        control.options.categoryDesc = partCategory.desc;
        control.options.categoryComments = partCategory.comments;
        control.options.showGridView = partCategory.showGridView;
        control.options.aggs = null;
        if (control.loaded) {
            control.updateTitle();
            control.read(1);
        } else {
            $(document).bind(control.EVENT_TEMPLATE_LOADED, function (e) {
                control.updateTitle();
                control.read(1);
            });
        }

        $.ajax({
            url: "/Store/Browse/GetCategoryBreadcrumbs?id=" + partCategory.id,
            method: "GET",
            success: function (result) {
                var wrapper = $("ol.breadcrumb");
                wrapper.find(".k-category-name").remove();
                $(result).each(function (i) {
                    var last = i == result.length - 1;
                    var link = $("<a />", {
                        href: this.PageName != null ? "/Store/Browse/Page/" + this.PageName : "/Store#Category:" + this.GroupId + ":" + this.GroupName,
                        html: this.GroupName
                    });
                    var li = $("<li />", {
                        "class": "k-category-name",
                        html: last ? this.GroupName : ""
                    });
                    if (!last) {
                        li.append(link);
                    }
                    wrapper.append(li);
                });
            }
        });
    });


    $(document).bind(argosyEvents.EVENT_FILTER_AGGREGATE_SEARCH, function (e, data) {
        var control = that;
        var aggs = [];
        if (data != null && data.button) {
            $.each($("#filtersContainer").find("a.btn-primary"), function (i, element) {
                element = $(element);
                aggs.push({
                    Key: element.attr("data-group"),
                    Value: element.attr("data-value")
                });
            });
        } else {
            $.each($("#filtersContainer").find("input[type=checkbox]:checked"), function (i, element) {
                element = $(element);
                aggs.push({
                    Key: element.attr("data-group"),
                    Value: element.val()
                });
            });
        }
        control.options.aggs = aggs;
        control.read(1);
    });

    $(document).bind(argosyEvents.EVENT_TOGGLE_COMPANY_FILTERS, function (e, data) {
        var element = $("#filtersContainer");
        if (element.length > 0) {
            if (element.is(":visible")) {
                $(document).trigger(argosyEvents.COMPANY_FILTER_HIDE);
            } else {
                $(document).trigger(argosyEvents.COMPANY_FILTER_SHOW);
            }
        }
    });

    $(document).bind(argosyEvents.FULL_TEXT_SEARCH, function (e, search) {
        var control = that;
        control.options.aggs = null;
        control.options.currentSearch = search.currentPartSearch;
        control.options.currentSearch.AggregationsJson = null;
        if (control.loaded) {
            if (search.read) {
                control.read(1);
            }
        } else {
            $(document).bind(control.EVENT_TEMPLATE_LOADED, function (e) {
                if (search.read) {
                    control.read(1);
                }
            });
        }
    });
    $(document).bind(argosyEvents.SHOW_KIT_INVENTORY_DETAILS_MODAL, function (e, partId) {
        if (productDetailControl != null) {
            var part = that.getPart(parseInt(partId));
            $(document).trigger(argosyEvents.START_LOADING, { name: that.constructor.name });
            productDetailControl.show(part,true,true);
        }
    });

    $(document).bind(argosyEvents.SHOW_PART_USAGE_MODAL, function (e, data) {
        if (that.productUsageControl != null) {
            that.productUsageControl.show(parseInt(data.partId));
            $(that.options.historyTitleElment).html(data.partName + " - Part History");
        }
    });

    $(document).bind(argosyEvents.SHOW_VIEWING_RIGHTS_MODAL, function (e, data) {
        if (that.productViewingRightsControl != null) {
            that.productViewingRightsControl.init(data);
        }
    });

    $(document).bind(argosyEvents.SHOW_PART_CONFIGURATION_MODAL, function (e, partId) {
        if (that.productConfigurationControl != null) {
            var part = that.getPart(partId);
            that.productConfigurationControl.show(part);
        }
    });

    $(document).bind(argosyEvents.SHOW_PART_QUANTITY_MODAL, function (e, partId) {
        var part = that.getPart(partId);
        showPartQuantityModal(part);
    });

    $(document).bind(argosyEvents.PART_CATEGORY_VIEW_CHANGE, function (e, data) {
        if (that.categoryViewControl.TotalCount <= 0) {
            if (that.options.showHotProductsLander) {
                return;
            }
            if (!that.options.showGridView) {
                $(that.options.showGridViewSelector).trigger('click');
            } else {
                $(that.options.showListViewSelector).trigger('click');
            }
        }
    });

    $(document).bind(argosyEvents.EVENT_FAVORITES_ADDED_REMOVED, function (e, data) {
       if(that.options.allowedPartIds != undefined && that.options.allowedPartIds.length > 0) {
           that.options.currentSearch.allowedPartIds = jQuery.grep(that.options.currentSearch.allowedPartIds, function (value) {
               return value !== data;
           });
           that.options.currentSearch.ExcludePartIds.push(data);
           if (!that.options.showGridView) {
               var listView = $(that.options.listViewHref).getKendoListView();
               listView.dataSource.read();
               listView.refresh();
           } else {
               var grid = $(that.options.gridViewHref).getKendoGrid();
               grid.dataSource.read();
               grid.refresh();
           }
        }
    });

    $(document).trigger(that.EVENT_LISTENERS_LOADED);
};

MvcProductView.prototype.getPart = function (partId) {
    var that = this,
        part = null;

    if (that.dataSource != null) {
        var length = that.dataSource.data().length;
        for (var i = 0; i < length; i++) {
            var item = that.dataSource.data()[i];
            if (item.PartId === partId) {
                part = item;
                break;
            }
        }
    }
    if (part === null) {
        part = that.landingPageHotProductsControl.getPart(partId);
    }
    return part;
};
MvcProductView.prototype.getPartBySku = function (sku) {
    var that = this,
        part = null;

    if (that.dataSource != null) {
        var length = that.dataSource.data().length;
        for (var i = 0; i < length; i++) {
            var item = that.dataSource.data()[i];
            
            if (item.Sku === sku) {
                part = item;
                break;
            }
        }
    }
    return part;
};

MvcProductView.prototype.setupSortDropDown = function () {
    var that = this;
    var sortSelector = $(that.options.sortBySelector);
    if (that.options.showSort) {
        sortSelector.change(function (e) {
            var sortBy = $(e.currentTarget[e.currentTarget.selectedIndex]).attr("data-argosy-sort");
            that.options.currentSearch.SortOption = sortBy;
            that.read();
        });
    } else {
        sortSelector.hide();
        $(that.options.sortByTextSelector).hide();
    }
};

MvcProductView.prototype.setupViewButtons = function () {
    var that = this;
    var showListView = $(that.options.showListViewSelector);
    var showGridView = $(that.options.showGridViewSelector);
    var showCompanyLinks = $(that.options.showPageLinksSelector);
    var showCompanyFilters = $(that.options.showCompanyFilterSelector);

    if (!that.options.showCompanyLinks) {
        showCompanyLinks.hide();
    }

    if (!that.options.showCompanyFilters) {
        showCompanyFilters.hide();
    }

    showListView.unbind("click");
    showGridView.unbind("click");
    showCompanyLinks.unbind("click");

    showListView.click(function (e) {
        that.updateView(false, true);
    });

    showGridView.click(function (e) {
        that.updateView(true, false);
    });

    showCompanyLinks.click(function (e) {
        that.displayCompanyLinks();
    });

    if (showGridView.hasClass("selected")) {
        that.updateView(true, false);
    }else {
        that.updateView(false, true);
    }

    if (that.options.openCompanyLinks && that.options.showCompanyLinks) {
        showCompanyLinks.click();
    }
}

MvcProductView.prototype.showFavoritePartsOnly = function () {
    var that = this;
    if (that.options.allowedPartIds != undefined && that.options.allowedPartIds.length > 0) {
        that.options.currentSearch.allowedPartIds = $.parseJSON(that.options.allowedPartIds);
    }
};

MvcProductView.prototype.showTopCategoriesOnly = function () {
    var that = this;
    if (that.options.showTopCategoriesOnly) {
        that.options.currentSearch.ShowTopCategoriesOnly = that.options.showTopCategoriesOnly;
    }
};

MvcProductView.prototype.displayCompanyLinks = function () {
    var that = this;
    var showCompanyLinks = $(that.options.showPageLinksSelector);
    var expand = showCompanyLinks.find("i").hasClass("fa-caret-square-o-left");
    if (expand) {
        $(document).trigger(argosyEvents.COMPANY_LINKS_SHOW);
    } else {
        $(document).trigger(argosyEvents.COMPANY_LINKS_HIDE);
    }
};

MvcProductView.prototype.updateView = function (showGrid, showList) {
    var that = this,
        gridView = $(that.options.gridViewHref),
        listView = $(that.options.listViewHref),
        showListView = $(that.options.showListViewSelector),
        showGridView = $(that.options.showGridViewSelector),
        header = $(that.options.headerHref),
        pager = $(that.options.pagerHref);
    if (showGrid) {
        gridView.show();
        showGridView.addClass("selected");
    } else {
        gridView.hide();
        showGridView.removeClass("selected");
    }
    if (showList) {
        listView.show();
        showListView.addClass("selected");
    } else {
        listView.hide();
        showListView.removeClass("selected");
    }
    if (!that.options.showHeader) {
        header.hide();
    } else {
        header.show();
    }
    pager.show();
}
MvcProductView.prototype.setupListView = function () {
    var that = this;
    that.listView = $(that.options.listViewHref).kendoListView({
        dataSource: that.dataSource,
        template: $("#_ProductListViewPanelTemplate").html(),
        dataBound: function (e) {
            addArgosyActions(that.options.listViewHref);
            $(".fancybox").fancybox();
            if (that.recordCount != null && that.recordCount == 0) {
                $(that.listView.element).append(loadEmptyGridTemplate("~{NoPartsReturned}~"));
            }
        },
        autoBind: false,
        selectable: false,
    }).getKendoListView();
}

MvcProductView.prototype.setupGridView = function () {
    var that = this;
    var gridOptions = {
        dataSource: that.dataSource,
        rowTemplate: kendo.template($("#_ProductGridViewTemplate").html()),
        columns: [
            {
                title: ""
            },
            {
                title: "~{Product}~"
            

            },
            {
                     title: "~{Ship}~",
                headerAttributes: {
                    "class": "center hidden-sm hidden-xs"
                }
            },
            {
                title: "",
                headerAttributes: {
                    "class": "textr"
                },
            }
        ],
        sortable: true,
        scrollable: false,
        dataBound: function (e) {
            addArgosyActions(that.options.gridViewHref);
            $(".fancybox").fancybox();
            if (that.recordCount != null && that.recordCount == 0) {
                var colCount = that.gridView.columns.length;
                $(that.gridView.wrapper)
                    .find('tbody')
                    .append('<tr class="kendo-data-row"><td colspan="' + colCount + '" class="no-data">' + loadEmptyGridTemplate("~{NoPartsReturned}~") + '</td></tr>');
            }
            $("div[data-argosy-view=MvcProductView] th:eq(3),div[data-argosy-view=MvcProductView]  tr td:nth-child(4)").addClass("hidden-sm hidden-xs");
            $("div[data-argosy-view=MvcProductView] th:eq(4),div[data-argosy-view=MvcProductView]  tr td:nth-child(5)").addClass("hidden-sm hidden-xs");
            $("div[data-argosy-view=MvcProductView] th:eq(5),div[data-argosy-view=MvcProductView]  tr td:nth-child(6)").addClass("hidden-sm hidden-xs");
        },
        autoBind: false
    };
    if (userSettings.IsInventoryInformationVisible) {
        gridOptions.columns.splice(2, 0, {
            title: "~{Available}~",
            headerAttributes: {
                "class": "globals-qtyavailable center hidden-sm hidden-xs"
            }
        },
            {
                title: "~{OnHand}~",
                headerAttributes: {
                    "class": "center hidden-sm hidden-xs"
                }
            });
    };
    that.gridView = $(that.options.gridViewHref).kendoGrid(gridOptions).getKendoGrid();
}

MvcProductView.prototype.setupPagerView = function () {
    var that = this;
    that.pager = $(that.options.pagerHref).kendoPager({
        dataSource: that.dataSource,
        messages: {
            empty: ""
        },
        autoBind: false
    }).getKendoPager();
}

MvcProductView.prototype.read = function (pageNumber) {
    var that = this;
    if (pageNumber != null) {
        that.dataSource.page(pageNumber);
    } else {
        that.dataSource.read();
    }
    that.gridView.refresh();
    that.listView.refresh();
    that.pager.refresh();
};

MvcProductView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.showFavoritePartsOnly();
    that.showTopCategoriesOnly();
    that.dataSourceOpts.transport = {
        read: function (options) {
            $(document).trigger(argosyEvents.START_LOADING, { name: that.constructor.name });
            // can't reference that.searchCriteria the other way
            if (that.options.aggs != null) {
                that.options.currentSearch.AggregationsJson = JSON.stringify(that.options.aggs);
            } else {
                that.options.currentSearch.AggregationsJson = null;
            }
            $.extend(true, that.options.currentSearch, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/api/LuceneSearch/Parts",
                dataType: "json",
                method: "POST",
                data: that.options.currentSearch,
                success: function (result) {
                    if (result.Records != null && result.Records.length > 0) {
                        addParts(result.Records);
                    }
                    if (result.ReturnResponse != null) {
                        var data = $.parseJSON(result.ReturnResponse.PostJsonData);
                        if (that.options.currentSearch.AggregationsJson == null) {
                            that.showAggregates(data.Aggregations);
                        } else {
                            that.options.aggs = null;
                        }
                    }
                    options.success(result);
                    that.loadConfigFromQueryString();
                    $(document).trigger(argosyEvents.END_LOADING, { name: that.constructor.name });
                },
                error: function (result) {
                    $(document).trigger(argosyEvents.END_LOADING, { name: that.constructor.name });
                    options.error(result);
                }
            });
        }
    };
    that.dataSourceOpts.requestStart = function(e) {
        $(that.gridView.wrapper).find('tbody').empty();
        $(that.listView.element).empty();
    };
    that.dataSourceOpts.requestEnd = function(e) {
        that.recordCount = e.response.TotalRecords;
    };
    that.dataSourceOpts.pageSize = 100;
    that.dataSourceOpts.schema = {
        data: function (response) {
            return response.Records;
        },
        total: function (response) {
            return response.TotalRecords;
        }
    };
    return new kendo.data.DataSource(that.dataSourceOpts);
};

MvcProductView.prototype.showAggregates = function(data) {
    var restructured = [];
    for (var property in data) {
        if (data.hasOwnProperty(property)) {
            if (data[property].buckets.length > 0) {
                restructured.push({
                    Name: property,
                    Values: data[property].buckets
                });
            }
        }
    }
    if ($("#filtersContainer").length > 0) {
        $("#filtersContainer").html(kendo.Template.compile($('#_CompanyFiltersTemplate').html())(restructured));
        $("#filtersContainer").find("a.btn").click(function (e) {
            var btn = $(e.currentTarget);
            if (btn.hasClass("btn-danger")) {
                btn.removeClass("btn-danger").addClass("btn-primary")
            } else {
                btn.removeClass("btn-primary").addClass("btn-danger")
            }
            $(document).trigger(argosyEvents.EVENT_FILTER_AGGREGATE_SEARCH, { button: true })
        })
    }
    if (restructured.length == 0) {
        $(document).trigger(argosyEvents.COMPANY_FILTER_HIDE);
        $(".fa-filter").closest("a").hide();
    } else {
        $(document).trigger(argosyEvents.COMPANY_FILTER_SHOW);
        $(".fa-filter").closest("a").show();
    }
};

MvcProductView.prototype.dataSourceOpts = {
    pageSize: 100
};