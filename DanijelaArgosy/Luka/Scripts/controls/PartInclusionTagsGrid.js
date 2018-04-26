function PartInclusionTagsGrid(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.options.inclusionTags = JSON.parse(that.options.inclusionTags);
    that.options.setInclusionTagsDataSource();
    that.options.partDataSource.add({
        PartId: that.options.partId,
        CompanyId: that.options.companyId,
        InclusionArray: that.options.inclusionTags
    });
    that.setupInclusionTagsCollapseGrid();
    that.setupInclusionTagsGrid();
};

PartInclusionTagsGrid.prototype.options = {
    companyId: 0,
    partId: 0,
    inclusionTags: [],
    inclusionTagsDataSource: new kendo.data.DataSource(),
    partDataSource: new kendo.data.DataSource({
        transport: {
            update: {
                url: "/Admin/Parts/UpdateInclusionTags",
                type: "post",
                dataType: "json",
                contentType: "application/json; charset=utf-8"
            },
            parameterMap: function (data) {
                return kendo.stringify(data);
            }
        },
        schema: {
            model: { id: "PartId" }
        },
        requestEnd: function (e) {
            if (e.response != null) {
                PartInclusionTagsGrid.prototype.options.mapPartResponse(e.response);
            };
        }
    }),
    mapPartResponse: function (response) {
        this.inclusionTags = response.Records.InclusionArray;
        $("#InclusionTags").val(response.Records.InclusionTags);
        this.setInclusionTagsDataSource();
        this.typeAheadDataSource.read();
    },
    setInclusionTagsDataSource: function () {
        var that = this,
            currentItems = [];
        $.each(that.inclusionTagsDataSource.data(), function (i, inclusionTag) {
            currentItems.push(inclusionTag);
        });
        $.each(currentItems, function (i, inclusionTag) {
            that.inclusionTagsDataSource.remove(inclusionTag);
        });
        $.each(that.inclusionTags, function (i, inclusionTag) {
            that.inclusionTagsDataSource.add({ name: inclusionTag });
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
                    data.companyId = PartInclusionTagsGrid.prototype.options.companyId;
                    data.tags = PartInclusionTagsGrid.prototype.options.inclusionTags.join(",");
                    data.type = 1;
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

PartInclusionTagsGrid.prototype.baseOptions = {
    inclusionTagsCollapseGrid: "#inclusionTagsCollapseGrid",
    inclusionTagsGrid: "#inclusionTagsGrid"
};

PartInclusionTagsGrid.prototype.setupInclusionTagsCollapseGrid = function () {
    var that = this;
    $(that.options.inclusionTagsCollapseGrid).kendoCollapseGrid({
        scrollable: false,
        editable: false,
        dataSource: that.options.inclusionTagsDataSource,
        groupable: false,
        sortable: true,
        exportToExcel: false,
        toolbar: [
            { name: "showInclusionTags", text: " ~{Add}~", 'class': "fa fa-plus" }
        ],
        labelProperty: "name",
        title: "~{InclusionTags}~",
        type: "list",
        remove: function (e) {
            that.showRemovePrompt(e.data);
        },
        showInclusionTags: function () {
            $.fancybox({
                href: "#inclusionTagsGrid"
            });
        }
    });
};

PartInclusionTagsGrid.prototype.setupInclusionTagsGrid = function () {
    var that = this,
        grid = $(that.options.inclusionTagsGrid).data("kendoGrid");
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
                { title: "Inclusion Tag", field: "name" }
            ],
            title: "~{InclusionTags}~",
            toolbar: [
                { name: "addInclusionTags", text: "Add Selected Tags", 'class': "fa fa-plus" }
            ],
            dataBound: function (e) {
                var addButton = $(e.sender.element).find(".k-grid-addInclusionTags"),
                    selectedTags = [];
                addButton.click(function () {
                    if (e.sender.select().length > 0) {
                        $.each(e.sender.select(), function (i, inclusionTag) {
                            selectedTags.push(e.sender.dataItem(inclusionTag).name);
                        });
                        PartInclusionTagsGrid.prototype.showAddPrompt(selectedTags);
                    }
                });
            }
        };
        $(that.options.inclusionTagsGrid).kendoCustomGrid(opts);
    } else {
        grid.dataSource.read();
    }
};

PartInclusionTagsGrid.prototype.showAddPrompt = function (inclusionTags) {
    var that = this,
        message = {
            buttonNoHidden: false,
            no: function () {
                $.fancybox.close();
            },
            type: "warning",
            yes: function (e) {
                if (typeof (e.preventDefault) === "function") {
                    that.addInclusionTags(inclusionTags);
                };
            },
            question: "~{WantToAddTag}~ '" + inclusionTags.join(", ") + "'?",
            description: "~{TagWillBeAdded}~",
            button: "~{Add}~"
        };
    prompt.alert(message);
};

PartInclusionTagsGrid.prototype.showRemovePrompt = function (inclusionTag) {
    var that = this,
        message = {
            buttonNoHidden: false,
            no: function () {
                $.fancybox.close();
            },
            type: "warning",
            yes: function (e) {
                if (typeof (e.preventDefault) === "function") {
                    that.removeInclusionTag(inclusionTag);
                };
            },
            question: "~{WantToRemove}~ '" + inclusionTag.name + "'?",
            description: "~{CanNotRecoverDeletedTags}~",
            button: "~{Remove}~"
        };
    prompt.alert(message);
};

PartInclusionTagsGrid.prototype.removeInclusionTag = function (inclusionTag) {
    var inclusionArray = this.options.partDataSource.data()[0].InclusionArray,
        index = inclusionArray.indexOf(inclusionTag.name);
    inclusionArray.splice(index, 1);
    this.options.partDataSource.sync();
    $.fancybox.close();
};

PartInclusionTagsGrid.prototype.addInclusionTags = function (inclusionTags) {
    var inclusionArray = this.options.partDataSource.data()[0].InclusionArray;
    $.each(inclusionTags, function (i, inclusionTag) {
        inclusionArray.push(inclusionTag);
    });
    this.options.partDataSource.sync();
    $.fancybox.close();
};