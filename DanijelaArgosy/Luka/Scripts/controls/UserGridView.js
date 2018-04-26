function UserGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID,
        function(e, data) {
            that.refineSearch(data);
        });
    if (opts.showEmployees != null) {
        that.searchCriteria.ShowEmployees = opts.showEmployees;
    }
    that.refineSearch({});
}

UserGridView.prototype.options = {
    editPath: "/Admin/Users/Edit/"
};

UserGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=UserGridView]"
};

UserGridView.prototype.searchCriteria = {
    Active: null,
    Keyword: null,
    Username: null,
    FirstName: null,
    LastName: null,
    Email: null,
    Title: null,
    PhoneNumber: null,
    DivisionName: null,
    IsStore: null,
    Custom01: null,
    Custom02: null,
    Custom03: null,
    RecordSizeCategory: 0,
    ShowEmployees: null
};

UserGridView.prototype.refineSearch = function(data) {
    var that = this;
    $.extend(true, that.searchCriteria, data);
    that.setupGrid();
};

UserGridView.prototype.setupGrid = function() {
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
            selectable: "multiple, row",
            pageable: {
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 2
            },
            columns: [
                {
                    title: "~{UserName}~",
                    field: "Username",
                    template: "<a href='" + that.options.editPath + "${UserId}'>${Username}<a>"
                },
                {
                    title: "~{Name}~",
                    field: "LastName",
                    template: "${FirstName} ${LastName}"
                },
                {
                    title: "~{Email}~",
                    field: "Email"
                },
                {
                    title: "<div class='text-center'>~{Admin}~</div>",
                    field: "AdminAccess",
                    template:
                        "<div class='text-center'>#if (AdminAccess == true) {#<span>YES</span>#} else {#<span>NO</span>#}#</div>",
                    width: "10%"
                },
                {
                    title: "<div class='text-center'>~{Restock}~</div>",
                    field: "PrintOrders",
                    template:
                        "<div class='text-center'>#if (PrintOrders == true) {#<span>YES</span>#} else {#<span>NO</span>#}#</div>",
                    width: "10%"
                },
                {
                    title: "<div class='text-center'>~{PowerBuyer}~</div>",
                    field: "PowerBuyer",
                    template:
                        "<div class='text-center'>#if (PowerBuyer == true) {#<span>YES</span>#} else {#<span>NO</span>#}#</div>",
                    width: "10%"
                },
                {
                    title: "<div class='text-center'>~{Active}~</div>",
                    field: "Active",
                    template:
                        "<div class='bold text-center'>#if (Active == true) {#<span>YES</span>#} else {#<span>NO</span>#}#</div>",
                    width: "10%"
                }
            ],
            checkboxes: true,
            dataBound: function(e) {
                var gridElement = $(e.sender.element);
                gridElement
                    .find(".k-button.k-button-icontext.k-grid-activate")
                    .unbind("click")
                    .click(function() {
                        that.showUpdateUserModal(that.getSelectedRecords(), true);
                    });
                gridElement
                    .find(".k-button.k-button-icontext.k-grid-deactivate")
                    .unbind("click")
                    .click(function() {
                        that.showUpdateUserModal(that.getSelectedRecords(), false);
                    });
                $("div[data-argosy-view=UserGridView] th:eq(3),div[data-argosy-view=UserGridView]  tr td:nth-child(4)")
                    .addClass("hidden-sm hidden-xs");
                $("div[data-argosy-view=UserGridView] th:eq(4),div[data-argosy-view=UserGridView]  tr td:nth-child(5)")
                    .addClass("hidden-sm hidden-xs");
                $("div[data-argosy-view=UserGridView] th:eq(5),div[data-argosy-view=UserGridView]  tr td:nth-child(6)")
                    .addClass("hidden-sm hidden-xs");
            },
            toolbar: [
                {
                    name: "deactivate",
                    text: "<i class='fa fa-close'></i><span class='resp-hidden'> ~{Deactivate}~</span>"
                },
                { name: "activate", text: "<i class='fa fa-check'></i><span class='resp-hidden'> ~{Activate}~</span>" }
            ],
            search: [
                { name: "Username", type: "text", placeholder: "Username", toolbar: false },
                { name: "FirstName", type: "text", placeholder: "First Name", toolbar: false },
                { name: "LastName", type: "text", placeholder: "Last Name", toolbar: false },
                { name: "Keyword", type: "text", placeholder: "~{SearchByUsernameFirstLast}~", toolbar: true },
                {
                    name: "Active",
                    type: "select",
                    toolbar: true,
                    data:
                    [
                        { value: "true", text: "~{Active}~", selected: true },
                        { value: "false", text: "~{Inactive}~" },
                        { value: "", text: "~{All}~" }
                    ]
                },
                { name: "Email", type: "text", placeholder: "Email", toolbar: false },
                { name: "Title", type: "text", placeholder: "Title", toolbar: false },
                { name: "PhoneNumber", type: "text", placeholder: "Phone", toolbar: false },
                { name: "DivisionName", type: "text", placeholder: "Division", toolbar: false },
                { name: "IsStore", type: "checkbox", placeholder: "Include Retail Stores", toolbar: false },
                { name: "Custom01", type: "text", placeholder: "Custom 1", toolbar: false },
                { name: "Custom02", type: "text", placeholder: "Custom 2", toolbar: false },
                { name: "Custom03", type: "text", placeholder: "Custom 3", toolbar: false }
            ]
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        grid.dataSource.read();
    }
};

UserGridView.prototype.showUpdateUserModal = function(users, activate) {
    var that = this,
        message = {
            question: "",
            description: "",
            button: "",
            type: "warning",
            yes: function(e) {
                if (typeof (e.preventDefault) === "function") {
                    that.updateUserState(users, activate);
                }
            }
        };
    if (activate) {
        message.question = "~{WantToActivateSelection}~";
        message.description = "~{ActiveUsersIgnored}~";
        message.button = "~{Activate}~";
    } else {
        message.question = "~{WantToDeactivateSelection}~";
        message.description = "~{InactiveUsersIgnored}~";
        message.button = "~{Deactivate}~";
    }
    prompt.alert(message);
};

UserGridView.prototype.updateUserState = function(users, activate) {
    var that = this,
        params = { users: users, activate: activate };
    $(document).trigger(argosyEvents.START_LOADING);
    $.ajax({
        url: "/Admin/Users/UpdateUserStatus",
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function(result) {
            $(document).trigger(argosyEvents.END_LOADING);
            if (result.ReturnCode === ReturnCode.Success) {
                prompt.notify({
                    question: "User(s) successfully updated.",
                    type: "success"
                });
            } else {
                prompt.clientResponseError(result);
            }
            $(that.options.gridViewSelector).getKendoGrid().dataSource.read();
        }
    });
    $.fancybox.close();
};

UserGridView.prototype.getSelectedRecords = function() {
    var that = this,
        selectedRecords = [],
        kendoGrid = $(that.options.gridViewSelector).getKendoGrid();
    $(kendoGrid.select()).each(function() {
        selectedRecords.push(kendoGrid.dataItem(this));
    });
    return selectedRecords;
};

UserGridView.prototype.getDataSource = function(dataSourceOpts) {
    var that = this;
    $(document).trigger(argosyEvents.START_LOADING);
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function(options) {
            var search = {
                Active: null
            };
            // can't reference that.searchCriteria the other way
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetUsers",
                dataType: "json",
                data: search,
                success: function(result) {
                    $(document).trigger(argosyEvents.END_LOADING);
                    if (result.ReturnCode === ReturnCode.Failed) {
                        handleDataSourceException(result);
                    } else {
                        options.success(result);
                    }
                }
            });
        },
        serverSorting: true
    };
    return new kendo.data.DataSource(that.dataSourceOpts);
};

UserGridView.prototype.dataSourceOpts = {};