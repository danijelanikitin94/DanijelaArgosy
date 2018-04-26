function UserGroupPartCategoriesGrid(opts) {
    var that = this;

    $.extend(true, that.options, that.baseOptions, opts);
    that.setupGrid({});
}

UserGroupPartCategoriesGrid.prototype.options = {};

UserGroupPartCategoriesGrid.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=UserGroupPartCategoriesGrid]"

};

UserGroupPartCategoriesGrid.prototype.searchCriteria = {
};

UserGroupPartCategoriesGrid.prototype.setupGrid = function () {
    var that = this,
        grid = $(that.options.gridViewSelector).getKendoGrid();
    if (grid == null) {
        var opts = {
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            scrollable: false,
            pageable: {
                refresh: false,
                pageSizes: false,
                buttonCount: 1
            },
            columns: [
                {
                    template: "<i class='fa la fa-times'></i>",
                    width: "10%"
                },
                {
                    title: "~{GroupName}~",
                    field: "GroupName",
                    width: "30%"
                },
                {
                    title: "~{GroupDescription}~",
                    field: "GroupDescrip",
                    width: "70%"
                }
            ],
            title: "~{PartCategoriesGroup}~",
            toolbar: [
                { name: "addEditPartCat", text: " ~{AddEdit}~ ", 'class': "fa fa-plus" }
            ],
            addEditPartCat: function () { showAddPartCategoryToUserGroup(); },
            dataBound: function (e) {
                var gridElement = $(e.sender.element);
               
                gridElement.find("tbody tr[role=row]").each(function () {
                    var data = e.sender.dataItem(this);
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
        grid.dataSource.read();
    }
};

UserGroupPartCategoriesGrid.prototype.showDeletePartCategoryModal = function (data) {
    var that = this;
    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function (e) {
            if (typeof (e.preventDefault) === "function") {
                that.deletePartCategoriesFromUserGroup(data);
            };
        }
    };
    message.question = "~{msgRemoveCatFromUserGroup}~";
    message.button = "~{Remove}~";
    prompt.alert(message);
};

UserGroupPartCategoriesGrid.prototype.deletePartCategoriesFromUserGroup = function (partCat) {
    var that = this;
    var params = { partCategory: partCat };
    $.ajax({
        url: "/Admin/UserGroups/DeletePartCategoryFromPart",
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result.ReturnCode === ReturnCode.Success) {
                $(result.Records).each(function () {
                    prompt.notify({
                        question: "Part(s) successfully removed.",
                        type: "success"
                    });
                });
            } else {
                prompt.clientResponseError(result);
            }
            $(that.options.gridViewSelector).find(".k-collapse-grid").getKendoGrid().dataSource.read();
            $("div[data-argosy-view=AddPartCategoryToUserGroupGridView]").getKendoGrid().dataSource.read();
        }
    });
    $.fancybox.close();
};

UserGroupPartCategoriesGrid.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
     $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 5;
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetUserGroupPartCategories",
                dataType: "json",
                data: search,
                success: function (result) {
                    if (result.ReturnCode === ReturnCode.Failed) {
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

UserGroupPartCategoriesGrid.prototype.dataSourceOpts = {};