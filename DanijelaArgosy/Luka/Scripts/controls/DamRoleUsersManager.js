function DamRoleUsersManager(opts) {
    var that = this,
        controlLoader = new ControlLoader();
    $.extend(true, that.options, that.baseOptions, opts);
    controlLoader.loadTemplate("DamRoleUsersManager", function (template) {
        $(document.body).append(template);
        that.setupTemplate();
        that.setupEventListeners();
        that.initialize();
    });
}

DamRoleUsersManager.prototype.options = {};

DamRoleUsersManager.prototype.baseOptions = {
    assetRoleId: 0,
    title: "",
    templateLoaded: false,
    templates: {
        baseTemplate: "#_DamUserRoleManagerBaseTemplate"
    }
};

DamRoleUsersManager.prototype.searchCriteria = {
};

DamRoleUsersManager.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};

DamRoleUsersManager.prototype.setupEventListeners = function () {
    var that = this;
}

DamRoleUsersManager.prototype.setupTemplate = function () {
    var that = this;
    if (!that.options.templateLoaded) {
        that.getElement().append($(that.options.templates.baseTemplate).html());
        that.options.templateLoaded = true;
    }
}

DamRoleUsersManager.prototype.initialize = function () {
    var that = this;
    var removeRecord = function (e) {

    };
    var opts = {
        dataSource: that.getDataSource(),
        groupable: false,
        sortable: true,
        scrollable: false,
        exportToExcel: false,
        rows: 10,
        pageable: {
            refresh: false,
            pageSizes: false,
            buttonCount: 1
        },
        pageSize: 10,
        columns: [
            {
                title: "User",
                field: "Username",
                width: "40%"
            },
            {
                title: "Name",
                field: "FullName",
                width: "40%"
            },
            {
                command: {
                    text: "Remove",
                    click: removeRecord
                },
                title: " ",
                width: "20%"
            }
        ],
        title: "Users",
        toolbar: [
            { text: "Add User" }
        ]
    };
    that.getElement()
        .find("*[data-role=collapsegrid]")
        .kendoCollapseGrid(opts);
}

DamRoleUsersManager.prototype.dataSourceOpts = {};
DamRoleUsersManager.prototype.getDataSource = function () {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, {});
    that.dataSourceOpts.transport = {
        read: function(options) {
            var search = {
                IsActive: true,
                AssetRoleId: that.options.assetRoleId
            };
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetUsers",
                dataType: "json",
                method: "POST",
                type: "POST",
                data: search,
                success: function(result) {
                    if (result.ReturnCode === ReturnCode.Failed) {
                        handleDataSourceException(result);
                    } else {
                        options.success(result);
                    }
                }
            });
        }
    };
    that.dataSourceOpts.pageSize = 10;
    that.dataSourceOpts.serverFiltering = true;
    return that.dataSourceOpts;
}