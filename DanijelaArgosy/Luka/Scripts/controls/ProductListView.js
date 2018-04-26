function ProductListView(opts) {
    var that = this;
    $(that).one(that.EVENT_TEMPLATE_LOADED, function (e) {
        $.extend(true, that.options, that.baseOptions, opts);
        that.dataSource = that.getDataSource();
        $(that.options.listHref).kendoListView({
            dataSource: that.dataSource,
            template: that.TEMPLATE.find("#listItem").html(),
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
    controlLoader.loadTemplate("ProductListView", function (template) {
        that.TEMPLATE = $(template);
        $(that).trigger(that.EVENT_TEMPLATE_LOADED);
    });

}

ProductListView.prototype.EVENT_TEMPLATE_LOADED = "PRODUCT_LIST_VIEW_LOADED";
ProductListView.prototype.options = {};
ProductListView.prototype.TEMPLATE = "";

ProductListView.prototype.baseOptions = {
    listHref: "div[data-argosy-view=ProductListView]",
    pagerHref: "div[data-argosy-view=ProductListViewPager]",
    titleHref: "h2[data-argosy-view=ProductListViewTitle]",
    category: "unknown",
    showPricing: true,
    showEstShop: true
};


ProductListView.prototype.getDataSource = function() {
    var that = this;
    /*return new kendo.data.DataSource({
        data: [
            { id: 1, SKUimage: "/content/images/placeholder/product8.png", title: "Product A", price: that.getRandomPrice(), isConfigurable: false, isKit: true, isBundle: false, isCustomizeable: false, isSale: true, isNew: false, isRapidOrder: false, isNote: false },
            { id: 2, SKUimage: "/content/images/placeholder/product1.png", title: "Product B Long Name that Wraps", price: that.getRandomPrice(), isConfigurable: false, isKit: false, isBundle: true, isCustomizeable: false, isSale: false, isNew: false, isRapidOrder: true, isNote: true },
            { id: 3, SKUimage: "/content/images/placeholder/product2.png", title: "Product C", price: that.getRandomPrice(), isConfigurable: false, isKit: false, isBundle: false, isCustomizeable: true, isSale: false, isNew: true, isRapidOrder: false, isNote: false },
            { id: 4, SKUimage: "/content/images/placeholder/product3.png", title: "Product D Long Name that Wraps", price: that.getRandomPrice(), isConfigurable: false, isKit: false, isBundle: false, isCustomizeable: false, isSale: false, isNew: false, isRapidOrder: true, isNote: false },
            { id: 5, SKUimage: "/content/images/placeholder/product4.png", title: "Product E", price: that.getRandomPrice(), isConfigurable: false, isKit: false, isBundle: true, isCustomizeable: false, isSale: false, isNew: false, isRapidOrder: false, isNote: false },
            { id: 6, SKUimage: "/content/images/placeholder/product5.png", title: "Product F", price: that.getRandomPrice(), isConfigurable: false, isKit: true, isBundle: false, isCustomizeable: false, isSale: false, isNew: false, isRapidOrder: false, isNote: true },
            { id: 7, SKUimage: "/content/images/placeholder/product6.png", title: "Product G Long Name that Wraps", price: that.getRandomPrice(), isConfigurable: true, isKit: false, isBundle: false, isCustomizeable: false, isSale: false, isNew: false, isRapidOrder: true, isNote: false },
            { id: 8, SKUimage: "/content/images/placeholder/product10.png", title: "Product H", price: that.getRandomPrice(), isConfigurable: false, isKit: false, isBundle: true, isCustomizeable: false, isSale: false, isNew: false, isRapidOrder: false, isNote: false },
            { id: 9, SKUimage: "/content/images/placeholder/product8.png", title: "Product I", price: that.getRandomPrice(), isConfigurable: false, isKit: false, isBundle: false, isCustomizeable: true, isSale: false, isNew: true, isRapidOrder: false, isNote: false },
            { id: 10, SKUimage: "/content/images/placeholder/product9.png", title: "Product J", price: that.getRandomPrice(), isConfigurable: true, isKit: false, isBundle: false, isCustomizeable: false, isSale: false, isNew: false, isRapidOrder: false, isNote: false },
            { id: 11, SKUimage: "/content/images/placeholder/product1.png", title: "Product K", price: that.getRandomPrice(), isConfigurable: false, isKit: false, isBundle: true, isCustomizeable: false, isSale: true, isNew: false, isRapidOrder: false, isNote: false },
            { id: 12, SKUimage: "/content/images/placeholder/product7.png", title: "Product L", price: that.getRandomPrice(), isConfigurable: false, isKit: false, isBundle: false, isCustomizeable: false, isSale: false, isNew: false, isRapidOrder: false, isNote: false }
        ],
        pageSize: 8
    });*/

    return new kendo.data.DataSource({
        type: "odata",
        serverFiltering: true,
        serverPaging: true,
        serverSorting: true,
        pageSize: 20,
        transport: {
            read: {
                url: "/Services/ViewService.svc/ViewBrowseProducts"
            },
        },
        schema: {
            data: function(data) {
                return data.value;
            },
            total: function(data) {
                return data['odata.count'];

            },
        }
    });
};

ProductListView.prototype.getRandomPrice = function() {
    return Math.round((Math.random() * 100) * (Math.random()));
};

$(document).ready(function () {
    $(".fancybox").fancybox();
});