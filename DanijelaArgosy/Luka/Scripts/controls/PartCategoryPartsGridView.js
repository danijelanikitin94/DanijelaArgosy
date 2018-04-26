function PartCategoryPartsGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch({});
}
PartCategoryPartsGridView.prototype.options = {};
PartCategoryPartsGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=PartCategoryPartsGridView]",
};
PartCategoryPartsGridView.prototype.searchCriteria = {
};

PartCategoryPartsGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

PartCategoryPartsGridView.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            dataSource: that.getDataSource({}),
            groupable: false,
            editable: false,
            autobind: true,
            sortable: true,
            scrollable: false,
            pageable: {
                refresh: true,
                pageSizes: false,
                buttonCount: 1
            },
            columns: [
                {
                    template: "<i class='fa la fa-times'></i>",
                    width: "10%"
                },
                {
                    title: "~{Name}~",
                    field:"PartName",
                    template: "<div> #if (PartName != null && PartName.trim().length > 0) {#   #= PartName # #}else{# #= Sku # #}# </div>",
                },
                {
                    title: "~{Description}~",
                    field: "PartDescription"
                }],
            title: "~{Products}~",
            toolbar: [
                { name: "addedit", text: " ~{Add}~", 'class': "fa fa-plus" }
            ],
            dataBinding: function (e) {
            },
            dataBound: function (e) {
                var gridElement = $(e.sender.element);
                var addEditButton = gridElement.find(".k-button.k-button-icontext.k-grid-addedit");
                var grid = gridElement.getKendoGrid();

                addEditButton.unbind("click");
                addEditButton.click(function (clickEvent) {
                    showAddPartsModal();
                });

                gridElement.find("tbody tr[role=row]").each(function () {
                    var data = grid.dataItem(this);
                    var deleteBtn = $(this).find(".fa.la.fa-times").parent();
                    deleteBtn.unbind("click");
                    deleteBtn.click(function () {
                        that.showDeletePartModal(data);
                    });
                });
            }
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};
PartCategoryPartsGridView.prototype.showDeletePartModal = function (data) {
    var that = this;
    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function (e) {
            that.deletePartFromPartCategory(data);
        }
    };
    message.question = "~{WantToRemoveSelection}~";
    message.description = "~{CanNotRecoverParts}~";
    message.button = "~{Remove}~";

    prompt.alert(message);
};

PartCategoryPartsGridView.prototype.deletePartFromPartCategory = function (partCat) {
    var that = this;
    var params = { partGroup: partCat };
    $.ajax({
        url: '/Admin/Parts/DeletePartCategoryFromPart',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result.ReturnCode == ReturnCode.Success) {
                $(result.Records).each(function () {
                    prompt.notify({
                        question: this.Key + " was " + (!this.Value ? "" : "not") + " successfully deleted.",
                        type: (!this.Value ? "success" : "error")
                    });
                });
            } else {
                prompt.clientResponseError(result);
            }
            var grid = $(that.options.gridViewSelector).getKendoGrid();
            grid.dataSource.read();
            grid.refresh(true);
        }
    });
    $.fancybox.close();
};

PartCategoryPartsGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 5;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetPartGroups",
                dataType: "json",
                data: search,
                success: function (result) {
                    if (result.ReturnCode == ReturnCode.Failed) {
                        handleDataSourceException(result);
                    } else {
                        options.success(result);
                    }
                }
            });
        }
    };
    return new kendo.data.DataSource(that.dataSourceOpts);
};

PartCategoryPartsGridView.prototype.dataSourceOpts = {};
