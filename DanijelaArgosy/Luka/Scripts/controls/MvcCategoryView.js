function MvcCategoryView(opts) {
    var that = this;
    that.setupEventListeners();
    $.extend(true, that.options, that.baseOptions, opts);
    that.dataSource = that.getDataSource();
    that.setupListView();
    that.read();
    that.loaded = true;
}

MvcCategoryView.prototype.options = {
    groupId: 0
};

MvcCategoryView.prototype.baseOptions = {
    listViewHref: "div[data-argosy-view=MvcCategoryGridView]",
    categoryListViewTemplateHref: "#_CategoryListViewTemplate"
};

MvcCategoryView.prototype.EVENT_LISTENERS_LOADED = "CATEGORY_VIEW_LISTENERS_LOADED";

MvcCategoryView.prototype.loaded = false;
MvcCategoryView.prototype.TotalCount = 0;
MvcCategoryView.prototype.listView = null;
MvcCategoryView.prototype.read = function () {
    var that = this;
    that.dataSource.read();
};

MvcCategoryView.prototype.setupEventListeners = function () {
    var that = this;
    $(document).bind(argosyEvents.PART_CATEGORY_CHANGE, function (e, partCategory) {
        var control = that;
        control.options.groupId = partCategory.id;
        if (control.loaded) {
            control.read();
        } else {
            $(document).bind(control.EVENT_TEMPLATE_LOADED, function (e) {
                control.read();
            });
        }
    });
};
MvcCategoryView.prototype.setupListView = function () {
    var that = this,
        listViewDiv = $(that.options.listViewHref),
        template = $(that.options.categoryListViewTemplateHref);

    that.listView = listViewDiv.kendoListView({
        dataSource: that.dataSource,
        template: template.html(),
        dataBound: function (e) {
            addArgosyActions(that.options.listViewHref);
        },
        autoBind: false,
        selectable: true,
    }).getKendoListView();
}

MvcCategoryView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            $(document).trigger(argosyEvents.START_LOADING, { name: that.constructor.name });
            $.extend(true, that.options.currentSearch, kendoOptionsToObject(options), that.searchCriteria);
            var data = {};
            data.ParentGroupId = that.options.groupId;
            $.ajax({
                url: "/DataView/GetPartCategoryHierachyView",
                dataType: "json",
                data: data,
                success: function (result) {
                    that.TotalCount = result.TotalRecords;
                    options.success(result);
                    $(document).trigger(argosyEvents.END_LOADING, { name: that.constructor.name });
                    $(document).trigger(argosyEvents.PART_CATEGORY_VIEW_CHANGE);
                },
                error: function (result) {
                    options.error(result);
                }
            });
        }
    };
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

MvcCategoryView.prototype.dataSourceOpts = {
    pageSize: 20
};