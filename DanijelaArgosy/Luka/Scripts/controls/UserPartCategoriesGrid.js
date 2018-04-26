function UserPartCategoriesGrid(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.setupGrid({});
}
UserPartCategoriesGrid.prototype.options = {};
UserPartCategoriesGrid.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=UserPartCategoriesGrid]",
};
UserPartCategoriesGrid.prototype.searchCriteria = {
    //Sku: null
};

UserPartCategoriesGrid.prototype.setupGrid = function () {
    var that = this;
    if (that.kendoGrid == null) {
        var opts = {
            dataSource: that.getDataSource({}),
            groupable: false,
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
                { name: "addPartCat", text: " ~{Add}~", 'class': "fa fa-plus" }
            ],
            addPartCat: function (e) {
                var returnvalue = showAddPartCategoryModal();
            },
            dataBinding: function (e) {
            },
            dataBound: function (e) {
                var gridElement = $(e.sender.element);

                gridElement.find("tbody tr[role=row]").each(function () {
                    var data = that.kendoGrid.dataItem(this);
                    var deleteBtn = $(this).find(".fa.la.fa-times").parent();
                    deleteBtn.unbind("click");
                    deleteBtn.click(function () {
                        that.showDeletePartCategoryFromUser(data);
                    });
                });
            },
        };
        $(that.options.gridViewSelector).kendoCollapseGrid(opts);
        that.kendoGrid = $(that.options.gridViewSelector).getKendoCollapseGrid().getKendoGrid();
    } else {
        that.kendoGrid.dataSource.read();
        that.kendoGrid.refresh();
    }
};
UserPartCategoriesGrid.prototype.showDeletePartCategoryFromUser = function (data) {
    var that = this;
    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function (e) {
            if (typeof (e.preventDefault) === "function") {
                that.deletePartCategoriesFromUser(data);
            }
          
        }
    };
    message.question = "~{WantToRemove}~";
    message.description = "";
    message.button = "~{Remove}~";

    prompt.alert(message);
};

UserPartCategoriesGrid.prototype.deletePartCategoriesFromUser = function (partCat) {
    var that = this;
    var params = { userPartCategory: partCat };
    $.ajax({
        url: '/Admin/Users/DeletePartCategoryFromUser',
        type: "POST",
        data: JSON.stringify(params),
        dataType : "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            var grid = $(that.options.gridViewSelector).find(".k-collapse-grid").getKendoGrid();
            if (result.ReturnCode === ReturnCode.Success) {
                $(result.Records).each(function () {
                    prompt.notify({
                        question: "Category was " + (!this.Value ? "" : "not") + " successfully removed.",
                        type: (!this.Value ? "success" : "error")
                    });
                });
            } else {
                prompt.clientResponseError(result);
            }
            grid.dataSource.read();
            grid.refresh(true);
            var grid02 = $("div[data-argosy-view=PartCategoryModalGridView]").getKendoGrid();
            grid02.dataSource.read();
            grid02.refresh(true);
        }
    });
    $.fancybox.close();
};

UserPartCategoriesGrid.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 5;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            // can't reference that.searchCriteria the other way
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetUserPartGroups",
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

UserPartCategoriesGrid.prototype.dataSourceOpts = {};
