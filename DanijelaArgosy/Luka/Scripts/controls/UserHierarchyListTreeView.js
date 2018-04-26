function UserHierarchyListTreeView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SHOW_USER_HIERARCHY_MODAL, function(e, data) {
        that.show(data.href);
    });
}

UserHierarchyListTreeView.prototype.options = {};

UserHierarchyListTreeView.prototype.baseOptions = {
    menuSelector: "div[data-argosy-view=UserHierarchyListTreeView]",
};


UserHierarchyListTreeView.prototype.show = function (fancyboxHref) {
    var that = this;
    that.setupMenu(fancyboxHref);
}


UserHierarchyListTreeView.prototype.setupMenu = function (fancyboxHref) {
    var that = this;
    if ($(that.options.menuSelector).getKendoTreeView() == null) {
        var opts = {
            autoBind: true,
            dragAndDrop: true,
            dataTextField: "DisplayName",
            dataSource: that.MenuItemsLazyLoaded(),
            dataBound: function(e) {
                $.fancybox({
                    href: fancyboxHref
                });
            },
            drop: function (e) {
                
                var kendoTreeView = $(that.options.menuSelector).getKendoTreeView();
                var originDataItem = kendoTreeView.dataItem(e.sourceNode);
                var destinationDataItem = kendoTreeView.dataItem(e.destinationNode);
                if (destinationDataItem) {
                    var destinationNodeId = destinationDataItem.CompanyUserId;
                    var dropPosition = e.dropPosition;
                    var parentDataItem = $(that.options.menuSelector)
                        .data("kendoTreeView")
                        .parent(kendoTreeView.findByText(destinationDataItem.DisplayName));
                    var hasParent = parentDataItem.length;

                    if (hasParent == 0 && dropPosition !== "over") {
                        destinationNodeId = 0;
                        e.setValid(false);
                    }
                    that.updateUserHierarchy(destinationNodeId,
                        originDataItem.CompanyUserId,
                        originDataItem.ManagerUserId);
                }
            }
        };
        $(that.options.menuSelector).kendoTreeView(opts);
    } else {
        var tree = $(that.options.menuSelector).getKendoTreeView();
        tree.dataSource.read();
        
    }
};


UserHierarchyListTreeView.prototype.updateUserHierarchy = function (newManagerId, userId, oldManagerId) {
    var that = this;
    var params = { newManagerId: newManagerId, userId: userId, oldManagerId: oldManagerId };
    $.ajax({
        url: '/Admin/Users/UpdateUserManager',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        async: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (!result.IsError) {
                    prompt.notify({
                        question: result.Message,
                        type: (!this.Value ? "success" : "error")
                    });
                that.setupMenu();
            } else {
                prompt.clientResponseError(result);
            }
        }
    });
};

UserHierarchyListTreeView.prototype.MenuItemsLazyLoaded = function () {
    var dataSource = new kendo.data.HierarchicalDataSource({
        transport: {
            read: {
                url: "/DataView/GetUsersHierarchyLazyLoad",
                dataType: "json"
            }
        },
        schema: {
            model: {
                id: "CompanyUserId",
                hasChildren: "HasEmployees",
            }
        }
    });
    return dataSource;
};

UserHierarchyListTreeView.prototype.MenuItems = function () {
    var menuItems;
    $.ajax(
    {
        type: "POST",
        url: "/DataView/GetUsersHierarchy",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(),
        dataType: "json",
        async: false,
        success: function (result) {

            if (result.ReturnCode == ReturnCode.Failed) {
                alert("Error: " + ReturnCode.Failed);
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


UserHierarchyListTreeView.prototype.convertToMenu = function (data) {
    var that = this;
    var menu = [];

    $(data).each(function (i) {
        menu.push({
            text: this.EmployeeName + " - " + ((this.EmployeeSpendingLimit == null || this.EmployeeSpendingLimit == "") ? "Users" : this.EmployeeSpendingLimit),
            encoded: false,
            ManagerCompanyUserId: this.ManagerCompanyUserId,
            EmployeeCompanyUserId: this.EmployeeCompanyUserId,
            HierarchyId: this.HierarchyId,
            EmployeeName:this.EmployeeName,
            items: ((this.Employees == null || this.Employees.length > 0) ? that.convertToMenu(this.Employees) : null),
        });
    });

    return menu;
};