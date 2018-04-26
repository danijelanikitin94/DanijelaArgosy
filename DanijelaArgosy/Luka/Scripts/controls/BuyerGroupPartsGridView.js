function BuyerGroupPartsGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.setupGrid();
}
BuyerGroupPartsGridView.prototype.options = {};
BuyerGroupPartsGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=BuyerGroupPartsGridView]"
};
BuyerGroupPartsGridView.prototype.setupGrid = function () {
    var that = this,
        grid = $(that.options.gridViewSelector).getKendoGrid();
    if (grid == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            pageable: {
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 5
            },
            columns: [
                {
                    template: "<i class='fa la fa-times'></i>",
                    width: "10%"
                },
                {
                    title: "~{SKU}~",
                    field: "Sku"
                },
                {
                    title: "~{Product}~",
                    template: "<div>#if (PartName != null && PartName.trim().length > 0) {#   #= PartName # #}else{# #= Sku # #}#   </div>",
                    width: "20%"
                },
                {
                    title: "~{Description}~",
                    field: "Description",
                    width: "50%"
                }
            ],
            toolbar: [
                { name: "addPart", text: " ~{AddEdit}~", 'class': "fa fa-plus" }
            ],
            addPart: function () {
                showAddPartToBuyerGroupModal();
            },
            title: "~{PartsForBuyerGroup}~",
            dataBound: function (e) {
                var gridElement = $(e.sender.element);

                gridElement.find("tbody tr[role=row]").each(function () {
                    var data = e.sender.dataItem(this);
                    var deleteBtn = $(this).find(".fa.la.fa-times").parent();
                    deleteBtn.unbind("click");
                    deleteBtn.click(function () {
                        that.showDeletePartModal(data);
                    });
                });
            }
        };
        $(that.options.gridViewSelector).kendoCollapseGrid(opts);
    } else {
        grid.dataSource.read();
    }
};

BuyerGroupPartsGridView.prototype.showDeletePartModal = function (data) {
    var that = this;
    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function (e) {
            if (typeof (e.preventDefault) === "function") {
                that.deletePartFromBuyerGroup(data);
            };
        }
    };
    message.question = "~{WantToRemoveSelection}~";
    message.button = "~{Remove}~";
    prompt.alert(message);
};

BuyerGroupPartsGridView.prototype.deletePartFromBuyerGroup = function (data) {
    var that = this;
    var params = { parts: [data], buyerGroupId: null };
    $.ajax({
        url: "/Admin/Parts/UpdateBuyerGroup",
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
            $("div[data-argosy-view=AddPartToBuyerGroup]").getKendoGrid().dataSource.read();
        }
    });
    $.fancybox.close();
};

//BuyerGroupPartsGridView.prototype.showUpdatePartStateModal = function (parts, activate) {
//    var that = this;
//    var message = {
//        question: "",
//        description: "",
//        button: "",
//        type: "warning",
//        yes: function () {
//            // this is what will happen when they click the confirm button
//            that.updatePartState(parts, activate);
//        }
//    };
//
//    if (activate) {
//        message.question = "Are you sure you want to activate these parts?";
//        message.description = "Parts that are already active will be ignored.";
//        message.button = "Activate";
//    } else {
//        message.question = "Are you sure you want to deactivate these parts?";
//        message.description = "Parts that are already inactive will be ignored.";
//        message.button = "Deactivate";
//    }
//    prompt.alert(message);
//};
//BuyerGroupPartsGridView.prototype.updatePartState = function (parts, activate) {
//    var params = { parts: parts, activate: activate };
//    $.ajax({
//        url: 'Parts/Index',
//        type: "POST",
//        data: JSON.stringify(params),
//        dataType: "json",
//        traditional: true,
//        contentType: "application/json; charset=utf-8",
//        success: function (result) {
//            window.location = result.Url;
//        }
//    });
//    $.fancybox.close();
//};
BuyerGroupPartsGridView.prototype.getSelectedRecords = function () {
    var that = this;
    var selectedRecords = [];
    var kendoGrid = $(that.options.gridViewSelector).getKendoGrid();

    $(kendoGrid.select()).each(function () {
        selectedRecords.push(kendoGrid.dataItem(this));
    });

    return selectedRecords;
};

BuyerGroupPartsGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            // can't reference that.searchCriteria the other way
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetParts",
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
    that.dataSourceOpts.pageSize = 5;
    return new kendo.data.DataSource(that.dataSourceOpts);
};

BuyerGroupPartsGridView.prototype.dataSourceOpts = {};