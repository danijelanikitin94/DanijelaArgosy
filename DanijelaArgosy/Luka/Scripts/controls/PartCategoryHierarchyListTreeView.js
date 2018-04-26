function PartCategoryHierarchyListTreeView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.setupMenu();
}

PartCategoryHierarchyListTreeView.prototype.options = {};

PartCategoryHierarchyListTreeView.prototype.baseOptions = {
    menuSelector: "div[data-argosy-view=PartCategoryHierarchyListTreeView]",
};


PartCategoryHierarchyListTreeView.prototype.setupMenu = function () {
    var that = this;
    if ($(that.options.menuSelector).getKendoTreeView() == null) {
        var opts = {
            autoBind: true,
            dragAndDrop: true,
            dataTextField:"GroupName",
            dataSource: that.MenuItems(),
            drop: function (e) {
                var kendoTreeView = $(that.options.menuSelector).getKendoTreeView();
                var originDataItem = kendoTreeView.dataItem(e.sourceNode);
                var originNodeId = originDataItem.GroupId;
                var destinationDataItem = kendoTreeView.dataItem(e.destinationNode);
                if (destinationDataItem) {
                    var destinationNodeId = destinationDataItem.GroupId;
                    var dropPosition = e.dropPosition;


                    var parentDataItem = $(that.options.menuSelector)
                        .data("kendoTreeView")
                        .parent(kendoTreeView.findByText(destinationDataItem.text));
                    var hasParent = parentDataItem.length;

                    if (hasParent == 0 && dropPosition !== "over") {
                        destinationNodeId = 0;
                    }
                    that.updatePartCategoryHierarchy(originNodeId, destinationNodeId);
                }
            }
        };
        $(that.options.menuSelector).kendoTreeView(opts);
    } else {
        var tree = $(that.options.menuSelector).getKendoTreeView();
        tree.dataSource.read();
        tree.refresh();
     }
};
PartCategoryHierarchyListTreeView.prototype.updatePartCategoryHierarchy = function (partCategories, option) {
    alert(partCategories + " " + option);
    var that = this;
	var params = { partCategories: partCategories, parentGroupId: option };
    $.ajax({
		url: '/Admin/PartCategories/UpdatePartCategoryParentGroupId',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        async: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            var treeView = $(that.options.menuSelector).getKendoTreeView();
            if (result.ReturnCode == ReturnCode.Success) {
                $(result.Records).each(function () {
                    prompt.notify({
                        question: this.Key + " was " + (!this.Value ? "" : "not") + " successfully  changed.",
                        type: (!this.Value ? "success" : "error")
                    });
                    //var data = grid.find(this.Key, "Sku");
                    /*if (!this.Value) {
                        grid.update(this.Key, "Sku", activate, "Active");
                    }*/
                });
            } else {
                prompt.clientResponseError(result);
            }
            //treeView.dataSource.read();
        }
    });
};
PartCategoryHierarchyListTreeView.prototype.MenuItems2 = function () {
    var menuItems;
    $.ajax(
    {
        type: "POST",
        url: "/DataView/GetPartCategoryHierarchy",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(),
        dataType: "json",
        async: false,
        success: function (result) {
            if (result.ReturnCode == ReturnCode.Failed) {
                handleDataSourceException(result);
            } else {
                menuItems = (result.Records);
            }
        },
        error: function (err) {
            alert("Error.");
        }
    });
    var allItems = this.convertToMenu(menuItems);
    return allItems;
};
PartCategoryHierarchyListTreeView.prototype.MenuItems = function () {
    var dataSource = new kendo.data.HierarchicalDataSource({
        transport: {
            read: {
                url: "/DataView/GetPartCategoryHierarchyLazyLoad",
                dataType: "json"
            }
        },
        schema: {
            model: {
                id: "GroupId",
                hasChildren: "HasChildren",
            }
        }
    });
    return dataSource;
};


PartCategoryHierarchyListTreeView.prototype.convertToMenu = function (data) {
    var that = this;
    var menu = [];

    $(data).each(function (i) {
        menu.push({
            text: this.GroupName,
            encoded: false,
            GroupId:this.GroupId,
            items: ((this.ChildPartCategories == null || this.ChildPartCategories.length > 0) ? that.convertToMenu(this.ChildPartCategories) : null),
        });
    });

    return menu;
};