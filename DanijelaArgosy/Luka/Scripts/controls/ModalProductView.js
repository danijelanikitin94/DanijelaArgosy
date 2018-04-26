function ModalProductView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    //that.dataSource = that.getDataSource();
    //that.setupGridView();
}


ModalProductView.prototype.baseOptions = {
    skip: 0,
    take: 50,
    pagerHref: "div[data-argosy-view=ModalProductViewPager]",
};
ModalProductView.prototype.options = {
    currentSearch: {}
};
ModalProductView.prototype.gridViewHref = "div[data-argosy-view=ModalProductView]";
ModalProductView.prototype.ModalContainer = "#ModalProductDetailsContainer";
ModalProductView.prototype.gridView = {};
ModalProductView.prototype.dataSourceOpts = {
    pageSize: 100
};
ModalProductView.prototype.recordCount = null;
ModalProductView.prototype.dataSource = null;
ModalProductView.prototype.pager = null;

ModalProductView.prototype.setupListView = function () {
    var that = this;
    that.dataSource = that.getDataSource();
    that.listView = $(that.gridViewHref).kendoListView({
        dataSource: that.dataSource,
        template: $("#_ProductListViewPanelTemplate").html(),
        autoBind: false,
        selectable: false,
        pageable: true
    }).getKendoListView();
    that.setupPagerView();
    that.read();
    $.fancybox($(that.ModalContainer), {
        autoSize: false,
        width: "700",
    });
}

ModalProductView.prototype.setupPagerView = function () {
    var that = this;
    that.pager = $(that.baseOptions.pagerHref).kendoPager({
        dataSource: that.dataSource,
        messages: {
            empty: ""
        },
        autoBind: false
    }).getKendoPager();
}

ModalProductView.prototype.read = function (pageNumber) {
    var that = this;
    if (pageNumber != null) {
        that.dataSource.page(pageNumber);
    } else {
        that.dataSource.read(1);
    }
    that.listView.refresh();
    that.pager.refresh();
};


ModalProductView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    
    that.dataSourceOpts.transport = {
        read: function (options) {
            var searchCriteria = {
                ExcludedKitIds: that.baseOptions.ExcludedKitIds,
                Types: that.baseOptions.searchTerm.split(","),
                ExcludeKit: that.baseOptions.ExcludeKit,
                ExcludeAttributeParts: that.baseOptions.ExcludeAttributeParts,
                ExcludeConfiguredParts: that.baseOptions.ExcludeConfiguredParts
            };
            $.extend(true, that.options.currentSearch, kendoOptionsToObject(options), searchCriteria);
            $.ajax({
                url: "/api/LuceneSearch/Parts",
                dataType: "json",
                method: "POST",
                data: that.options.currentSearch,
                success: function (result) {
                    if (result.Records != null && result.Records.length > 0) {
                        $.each(result.Records, function (key, item) {
                            item.id = item.PartId;
                            item.ButtonAction = "AddToKit";
                            item.AddToKitAction = "KitBuilder.prototype.AddComponentToKit('" + item.PartId + "')";
                            item.IsRequired = false;
                            item.Disabled = false;
                        });

                        addParts(result.Records);
                    }
                    if (result.ReturnResponse != null) {
                        var data = $.parseJSON(result.ReturnResponse.PostJsonData);
                    }
                    options.success(result);
                    $(document).trigger(argosyEvents.END_LOADING, { name: that.constructor.name });
                },
                error: function (result) {
                    $(document).trigger(argosyEvents.END_LOADING, { name: that.constructor.name });
                    options.error(result);
                }
            });
        }
    };
    that.dataSourceOpts.pageSize = 25;
    that.dataSourceOpts.serverPaging = true;
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