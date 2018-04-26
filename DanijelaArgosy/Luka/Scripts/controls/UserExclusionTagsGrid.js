function UserExclusionTagsGrid(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.options.exclusionTags = JSON.parse(that.options.exclusionTags);
    that.options.setExclusionTagsDataSource();
    that.options.userDataSource.add({
        UserId: that.options.userId,
        CompanyId: that.options.companyId,
        ExclusionArray: that.options.exclusionTags
    });
    that.setupExclusionTagsCollapseGrid();
    that.setupExclusionTagsGrid();
};

UserExclusionTagsGrid.prototype.options = {
    companyId: 0,
    userId: 0,
    exclusionTags: [],
    exclusionTagsDataSource: new kendo.data.DataSource(),
    userDataSource: new kendo.data.DataSource({
        transport: {
            update: {
                url: "/Admin/Users/UpdateExclusionTags",
                type: "post",
                dataType: "json",
                contentType: "application/json; charset=utf-8"
            },
            parameterMap: function (data) {
                return kendo.stringify(data);
            }
        },
        schema: {
            model: { id: "UserId" }
        },
        requestEnd: function (e) {
            if (e.response != null) {
                UserExclusionTagsGrid.prototype.options.mapUserResponse(e.response);
            };
        }
    }),
    mapUserResponse: function (response) {
        if (response.Records.ExclusionArray == null) {
            this.exclusionTags = [];
        } else {
            this.exclusionTags = response.Records.ExclusionArray;    
        };
        $("#ExclusionTags").val(response.Records.ExclusionTags);
        this.setExclusionTagsDataSource();
        this.typeAheadDataSource.read();
    },
    setExclusionTagsDataSource: function () {
        var that = this,
            currentItems = [];
        $.each(that.exclusionTagsDataSource.data(), function (i, exclusionTag) {
            currentItems.push(exclusionTag);
        });
        $.each(currentItems, function (i, exclusionTag) {
            that.exclusionTagsDataSource.remove(exclusionTag);
        });
        $.each(that.exclusionTags, function (i, exclusionTag) {
            that.exclusionTagsDataSource.add({ name: exclusionTag });
        });
    },
    typeAheadDataSource: new kendo.data.DataSource({
        sort: [
            { field: "name", dir: "asc" }
        ],
        transport: {
            read: {
                url: "/DataView/GetTypeAheads",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: function (data) {
                    data.companyId = UserExclusionTagsGrid.prototype.options.companyId;
                    data.tags = UserExclusionTagsGrid.prototype.options.exclusionTags.join(",");
                    data.type = 2; // PartExclusionTag
                    return data;
                }
            }
        },
        pageSize: 5,
        schema: {
            model: {
                id: "id",
                fields: {
                    id: {
                        type: "number"
                    },
                    name: {
                        type: "string"
                    }
                }
            },
            parse: function (data) {
                $.each(data.Records, function (i, record) {
                    data.Records[i] = { id: i, name: record };
                });
                return data;
            },
            data: function (data) {
                return data.Records;
            },
            total: function (data) {
                return data.TotalRecords;
            }
        }
    })
};

UserExclusionTagsGrid.prototype.baseOptions = {
    exclusionTagsCollapseGrid: "#exclusionTagsCollapseGrid",
    exclusionTagsGrid: "#exclusionTagsGrid"
};

UserExclusionTagsGrid.prototype.setupExclusionTagsCollapseGrid = function () {
    var that = this;
    $(that.options.exclusionTagsCollapseGrid).kendoCollapseGrid({
        scrollable: false,
        editable: false,
        dataSource: that.options.exclusionTagsDataSource,
        groupable: false,
        sortable: true,
        exportToExcel: false,
        toolbar: [
            { name: "showExclusionTags", text: " ~{Add}~", 'class': "fa fa-plus" }
        ],
        labelProperty: "name",
        title: "~{ExclusionTags}~",
        type: "list",
        remove: function (e) {
            that.showRemovePrompt(e.data);
        },
        showExclusionTags: function () {
            $.fancybox({
                href: "#exclusionTagsGrid"
            });
        }
    });
};

UserExclusionTagsGrid.prototype.setupExclusionTagsGrid = function () {
    var that = this,
        grid = $(that.options.exclusionTagsGrid).data("kendoGrid");
    if (grid == null) {
        var opts = {
            dataSource: that.options.typeAheadDataSource,
            groupable: false,
            editable: false,
            sortable: true,
            autoBind: true,
            scrollable: false,
            exportToExcel: false,
            selectable: "multiple, row",
            pageable: { refresh: true, pageSizes: false, buttonCount: 1 },
            columns: [
                { title: "Exclusion Tag", field: "name" }
            ],
            title: "~{ExclusionTags}~",
            toolbar: [
                { name: "addExclusionTags", text: "Add Selected Tags", 'class': "fa fa-plus" }
            ],
            dataBound: function (e) {
                var addButton = $(e.sender.element).find(".k-grid-addExclusionTags"),
                    selectedTags = [];
                addButton.click(function () {
                    if (e.sender.select().length > 0) {
                        $.each(e.sender.select(), function (i, inclusionTag) {
                            selectedTags.push(e.sender.dataItem(inclusionTag).name);
                        });
                        UserExclusionTagsGrid.prototype.showAddPrompt(selectedTags);
                    }
                });
            }
        };
        $(that.options.exclusionTagsGrid).kendoCustomGrid(opts);
    } else {
        grid.dataSource.read();
    }
};

UserExclusionTagsGrid.prototype.showAddPrompt = function (exclusionTags) {
    var that = this,
        message = {
            buttonNoHidden: false,
            no: function () {
                $.fancybox.close();
            },
            type: "warning",
            yes: function (e) {
                if (typeof (e.preventDefault) === "function") {
                    that.addExclusionTags(exclusionTags);
                };
            },
            question: "~{WantToAddTag}~ '" + exclusionTags.join(", ") + "'?",
            description: "~{TagWillBeAdded}~",
            button: "~{Add}~"
        };
    prompt.alert(message);
};

UserExclusionTagsGrid.prototype.showRemovePrompt = function (exclusionTag) {
    var that = this,
        message = {
            buttonNoHidden: false,
            no: function () {
                $.fancybox.close();
            },
            type: "warning",
            yes: function (e) {
                if (typeof (e.preventDefault) === "function") {
                    that.removeExclusionTag(exclusionTag);
                };
            },
            question: "~{WantToRemove}~ '" + exclusionTag.name + "'?",
            description: "~{CanNotRecoverDeletedTags}~",
            button: "~{Remove}~"
        };
    prompt.alert(message);
};

UserExclusionTagsGrid.prototype.removeExclusionTag = function (exclusionTag) {
    var exclusionArray = this.options.userDataSource.data()[0].ExclusionArray,
        index = exclusionArray.indexOf(exclusionTag.name);
    exclusionArray.splice(index, 1);
    this.options.userDataSource.sync();
    $.fancybox.close();
};

UserExclusionTagsGrid.prototype.addExclusionTags = function (exclusionTags) {
    var exclusionArray = this.options.userDataSource.data()[0].ExclusionArray;
    $.each(exclusionTags, function (i, inclusionTag) {
        exclusionArray.push(inclusionTag);
    });
    this.options.userDataSource.data()[0].ExclusionTags = exclusionArray.join(",");
    this.options.userDataSource.sync();
    $.fancybox.close();
};