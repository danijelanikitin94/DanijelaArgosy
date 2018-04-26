function PartGroupCategoriesGrid(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.setupGrid({});
}
PartGroupCategoriesGrid.prototype.options = {};
PartGroupCategoriesGrid.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=PartGroupCategoriesGrid]",
};
PartGroupCategoriesGrid.prototype.searchCriteria = {
    //Sku: null
};

PartGroupCategoriesGrid.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            dataSource: that.getDataSource({}),
            groupable: false,
            editable: false,
            autobind:true,
            sortable: true,
            scrollable: false,
            exportToExcel: false,
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
                    title: "~{CategoryName}~",
                    field: "GroupName"
                },
                {
                    title: "~{Description}~",
                    field: "GroupDescrip"
                }],
            title: "~{PartCategories}~",
            toolbar: [
                { name: "addedit", text: " ~{Add}~", 'class': "fa fa-plus" }
            ],
            addedit: function (e) {
                showAddPartCategoryModal();
            },
            dataBinding: function (e) {
            },
            dataBound: function (e) {
                var gridElement = $(e.sender.element);
                var grid = gridElement.getKendoGrid();

                gridElement.find("tbody tr[role=row]").each(function () {
                    var data = grid.dataItem(this);
                    var deleteBtn = $(this).find(".fa.la.fa-times").parent();
                    deleteBtn.unbind("click");
                    deleteBtn.click(function () {
                        that.showDeletePartCategoryModal(data);
                    });
                });
            }
        };
        $(that.options.gridViewSelector).kendoCollapseGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};
PartGroupCategoriesGrid.prototype.showDeletePartCategoryModal = function (data) {
    var that = this;
    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function (e) {
            // this is what will happen when they click the confirm button
            if (typeof (e.preventDefault) === "function") {
                that.deletePartCategoriesFromPart(data);
            }
        },
        no: function () {
            $.fancybox().close();
        }
    };
    message.question = "~{WantToRemove}~" + "?";
    message.description = "";
    message.button = "~{Remove}~";
        
    prompt.alert(message);
};

PartGroupCategoriesGrid.prototype.deletePartCategoriesFromPart = function (partCat) {
    var that = this;
    var params = { partGroup: partCat };
    $.ajax({
        url: '/Admin/Parts/DeletePartCategoryFromPart',
        type: "POST",
        data: JSON.stringify(params),
        dataType : "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            var grid = $(that.options.gridViewSelector).find(".k-collapse-grid").getKendoGrid();
            if (result.ReturnCode == ReturnCode.Success) {
                $(result.Records).each(function () {
                    prompt.notify({
                        question: this.Key + " was " + (!this.Value ? "" : "not") + " successfully deleted.",
                        type: (!this.Value ? "success" : "error")
                    });
                });
                grid.dataSource.read();
            } else {
                prompt.clientResponseError(result);
            }
            grid.dataSource.read();
            grid.refresh(true);
            var grid02 = $("div[data-argosy-view=CompanyCategoriesGridView]").getKendoGrid();
            grid02.dataSource.read();
            grid02.refresh(true);
        }
    });
    $.fancybox.close();
};

PartGroupCategoriesGrid.prototype.getDataSource = function (dataSourceOpts) {
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

PartGroupCategoriesGrid.prototype.dataSourceOpts = {};
