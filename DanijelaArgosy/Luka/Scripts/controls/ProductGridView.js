function ProductGridView(opts) {
    var that = this;
    $(that).one(that.EVENT_TEMPLATE_LOADED, function (e) {
        $.extend(true, that.options, that.baseOptions, opts);
        that.dataSource = that.getDataSource();
        $(that.options.listHref).kendoListView({
            dataSource: that.dataSource,
            template: that.TEMPLATE.find("#GridItem").html(),
            dataBound: function (e) {
                addArgosyActions(that.options.listHref);
            }
        });
        $(that.options.pagerHref).kendoPager({
            dataSource: that.dataSource,
        });
        $(that.options.titleHref).html(that.options.category);
    });

    var controlLoader = new ControlLoader();
    controlLoader.loadTemplate("ProductGridView", function (template) {
        that.TEMPLATE = $(template);
        $(that).trigger(that.EVENT_TEMPLATE_LOADED);
    });

}

ProductGridView.prototype.EVENT_TEMPLATE_LOADED = "PRODUCT_GRID_VIEW_LOADED";
ProductGridView.prototype.options = {};
ProductGridView.prototype.TEMPLATE = "";

ProductGridView.prototype.baseOptions = {
    listHref: "tr[data-argosy-view=ProductGridView]",
    pagerHref: "div[data-argosy-view=ProductGridViewPager]",
    titleHref: "h2[data-argosy-view=ProductGridViewTitle]",
    category: "unknown",
    showPricing: true,
    showEstShop: true
};


ProductGridView.prototype.getDataSource = function() {
    var that = this;
    /*return new kendo.data.DataSource({
        data: [
            { id: 1, title: "Product A", price: that.getRandomPrice(), isKit: true, isBundle: false, isCustomizeable: false, isSale: true, isNew: false, isRapidOrder: false },
            { id: 2, title: "Product B", price: that.getRandomPrice(), isKit: false, isBundle: true, isCustomizeable: false, isSale: false, isNew: false, isRapidOrder: true },
            { id: 3, title: "Product C", price: that.getRandomPrice(), isKit: false, isBundle: false, isCustomizeable: true, isSale: false, isNew: true, isRapidOrder: true },
            { id: 4, title: "Product D", price: that.getRandomPrice(), isKit: false, isBundle: false, isCustomizeable: false, isSale: false, isNew: false, isRapidOrder: false },
            { id: 5, title: "Product E", price: that.getRandomPrice(), isKit: false, isBundle: true, isCustomizeable: false, isSale: false, isNew: false, isRapidOrder: false },
            { id: 6, title: "Product F", price: that.getRandomPrice(), isKit: true, isBundle: false, isCustomizeable: false, isSale: false, isNew: false, isRapidOrder: false },
            { id: 7, title: "Product G", price: that.getRandomPrice(), isKit: false, isBundle: false, isCustomizeable: false, isSale: false, isNew: false, isRapidOrder: true },
            { id: 8, title: "Product H", price: that.getRandomPrice(), isKit: false, isBundle: true, isCustomizeable: false, isSale: false, isNew: false, isRapidOrder: false },
            { id: 9, title: "Product I", price: that.getRandomPrice(), isKit: false, isBundle: false, isCustomizeable: true, isSale: false, isNew: true, isRapidOrder: false },
            { id: 10, title: "Product J", price: that.getRandomPrice(), isKit: false, isBundle: false, isCustomizeable: false, isSale: false, isNew: false, isRapidOrder: false },
            { id: 11, title: "Product K", price: that.getRandomPrice(), isKit: false, isBundle: true, isCustomizeable: false, isSale: true, isNew: false, isRapidOrder: true },
            { id: 12, title: "Product L", price: that.getRandomPrice(), isKit: false, isBundle: false, isCustomizeable: false, isSale: false, isNew: false, isRapidOrder: false }
        ],
        pageSize: 10
    });*/

    return new kendo.data.DataSource({
        type: "odata",
        serverFiltering: true,
        serverPaging: true,
        serverSorting: true,
        pageSize: 20,
        transport: {
            read: {
                url: "/Services/ViewServices.svc/ViewBrowseProducts"
            },
        },
    });
};

ProductGridView.prototype.getRandomPrice = function() {
    return Math.round((Math.random() * 100) * (Math.random()));
};

$(document).ready(function () {
    $(".fancybox").fancybox();
});