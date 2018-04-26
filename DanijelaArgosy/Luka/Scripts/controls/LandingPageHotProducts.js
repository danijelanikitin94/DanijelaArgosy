function LandingPageHotProducts(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();

    controlLoader.loadControl("ModalProductDetail", {}, function (control) {
        that.productDetailControl = control;
    });
    controlLoader.loadControl("ModalProductUsage", {}, function (control) {
        that.productUsageControl = control;
    });
    controlLoader.loadControl("ModalProductViewingRights", {}, function (control) {
        that.productViewingRightsControl = control;
    });
    controlLoader.loadControl("ModalPartConfiguration", {}, function (control) {
        that.productConfigurationControl = control;
    });
    controlLoader.loadTemplate("LandingPageHotProducts", function (template) {
        if ($(that.options.carouselViewTemplate).length === 0) {
            $(document.body).append(template);
        }
        that.setupEventListeners();
        that.loadCarousels();
        addArgosyActions(that.getElement());

        $(document).trigger(that.EVENT_TEMPLATE_LOADED);
    });
}

LandingPageHotProducts.prototype._initialized = false;
LandingPageHotProducts.prototype.options = {
    featuredParts: "featuredParts",
    hotParts: "hotParts",
    newParts: "newParts"
};
LandingPageHotProducts.prototype.baseOptions = {
    carouselViewTemplate: "#_carouselTemplateView",
    controlHref: "div[data-argosy-view=MvcHotProductsView]",
    productListViewTemplate: "#_ProductListViewProductPanel",
    slideViewTemplate: "#_carouselSlideTemplateView",
    masonryViewTemplateWrapper: "#_masonryTemplateViewWrapper",
    masonryViewTemplatePanel: "#_masonryTemplateView",
    isCarousel: true
};
LandingPageHotProducts.prototype.searchDataForPartId = function (partId, parts) {
    var that = this,
        length = parts.length,
        part = null;
    for (var i = 0; i < length; i++) {
        var item = parts[i];
        if (item.PartId === partId) {
            part = item;
            break;
        }
    }
    return part;
};
LandingPageHotProducts.prototype.setupEventListeners = function () {
    var that = this;

    $(document).bind(argosyEvents.SHOW_PART_USAGE_MODAL, function (e, data) {
        if (that.productUsageControl != null) {
            that.productUsageControl.show(parseInt(data.partId));
            $(that.options.historyTitleElment).html(data.partName + "<br/>Usage History");
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
        console.log(part);
        showPartQuantityModal(part);
    });
}
LandingPageHotProducts.prototype.getPart = function (partId) {
    var that = this,
        data = that.getDataSource(),
        part;

    part = that.searchDataForPartId(partId, data.hotParts);
    if (part !== null) {
        return part;
    }
    part = that.searchDataForPartId(partId, data.featuredParts);
    if (part !== null) {
        return part;
    }
    part = that.searchDataForPartId(partId, data.newParts);
    if (part !== null) {
        return part;
    }
    return part;

};
LandingPageHotProducts.prototype.EVENT_TEMPLATE_LOADED = "TEMPLATE_HOT_PRODUCTS_LOADED";
LandingPageHotProducts.prototype.loadCarousels = function () {
    var that = this,
    data = that.getDataSource(), hotProductsViewModel = kendo.observable({
        carouselHref: "#hotParts_carousel",
        parts: new kendo.data.ObservableArray(data.hotParts),
        slideModel: { index: 0, type: "hotParts", active: "active", title: "Hot Products" }
    }),
    featuredPartsViewModel = kendo.observable({
        carouselHref: "#featuredParts_carousel",
        parts: new kendo.data.ObservableArray(data.featuredParts),
        slideModel: { index: 0, type: "featuredParts", active: "active", title: "Featured Products" }
    }),
    newPartsViewModel = kendo.observable({
        carouselHref: "#newParts_carousel",
        parts: new kendo.data.ObservableArray(data.newParts),
        slideModel: { index: 0, type: "newParts", active: "active", title: "New Products" }
    });
    if (!that._initialized) {
        that.createSlidesFor(hotProductsViewModel);
        that.createSlidesFor(featuredPartsViewModel);
        that.createSlidesFor(newPartsViewModel);
        that._initialized = true;
        $(".next")
            .click(function () {
                var controlId = $(this).data("control");
                var owl = $("#" + controlId).data('owlCarousel');
                owl.next();
            });
        $(".prev")
            .click(function () {
                var controlId = $(this).data("control");
                var owl = $("#" + controlId).data('owlCarousel');
                owl.prev();
            });
    }
};
LandingPageHotProducts.prototype.loadMasonry = function () {
    var that = this,
        data = that.getDataSource();

    //Curently killed...
    if (!that._initialized) {
        data.allParts = [];
        $(data.hotParts).each(function (e) {
            data.allParts.push(this);
        });
        $(data.featuredParts).each(function (e) {
            data.allParts.push(this);
        });
        $(data.newParts).each(function (e) {
            data.allParts.push(this);
        });

        if (data.allParts.length > 0) {
            that.getElement().show();
        }

        var template = kendo.template($(that.options.masonryViewTemplateWrapper).html());
        $(that.options.controlHref).append(template(data));

        $(that.options.controlHref).find(".masonry-grid").masonry({
            itemSelector: ".masonry-panel",
            percentPosition: true
        });

        addArgosyActions(that.options.controlHref);
        that._initialized = true;
    }
};
LandingPageHotProducts.prototype.createSlidesFor = function (viewModel) {
    var that = this,
        carouselOptions = {
            items: 6,
            itemsCustom: [
       [0, 1],
       [300, 2],
       [500, 3],    
       [780, 4],
       [900, 4],
       [1100, 5],
       [1200, 6],
     
            ],
            pagination: false,
            autoPlay: false,
            stopOnHover: true
        },
        slideIndex = 0,
        controlDiv = $(that.options.controlHref);

    if (viewModel.parts.length <= 0) {
        return;
    }

    var template = $(that.options.carouselViewTemplate),
        carouselHtml = kendo.Template.compile(template.html())(viewModel.slideModel);
    controlDiv.append(carouselHtml);

    $(viewModel.parts).each(function (index, part) {
        var slideHtml = kendo.Template.compile($(that.options.slideViewTemplate).html())(viewModel.slideModel);
        $(viewModel.carouselHref).append(slideHtml);
        var foundSlide = $("." + viewModel.slideModel.type + "_" + slideIndex);
        var partToAddHtml = kendo.Template.compile($(that.options.productListViewTemplate).html())(part);
        foundSlide.append(partToAddHtml);
        slideIndex++;
        viewModel.slideModel.index = slideIndex;
    });
    $(viewModel.carouselHref).owlCarousel(carouselOptions);
};
LandingPageHotProducts.prototype.getDataSource = function (dataSourceOpts) {
    var that = this,
        data = {};
    data.hotParts = window[that.options.hotParts];
    data.featuredParts = window[that.options.featuredParts];
    data.newParts = window[that.options.newParts];
    return data;

};

LandingPageHotProducts.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};
