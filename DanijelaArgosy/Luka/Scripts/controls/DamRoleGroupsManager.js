function DamRoleGroupsManager(opts) {
    var that = this,
        controlLoader = new ControlLoader();
    $.extend(true, that.options, that.baseOptions, opts);
    controlLoader.loadTemplate("DamRoleGroupsManager", function (template) {
        $(document.body).append(template);
        that.setupTemplate();
        that.setupEventListeners();
        that.initialize();
    });
}

DamRoleGroupsManager.prototype.options = {};

DamRoleGroupsManager.prototype.baseOptions = {
    assetRoleId: 0,
    title: "",
    templateLoaded: false,
    templates: {
        baseTemplate: "#_DamRoleGroupsManagerBaseTemplate"
    }
};

DamRoleGroupsManager.prototype.searchCriteria = {
};

DamRoleGroupsManager.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};

DamRoleGroupsManager.prototype.setupEventListeners = function () {
    var that = this;
}

DamRoleGroupsManager.prototype.setupTemplate = function () {
    var that = this;
    if (!that.options.templateLoaded) {
        that.getElement().append($(that.options.templates.baseTemplate).html());
        that.options.templateLoaded = true;
    }
}

DamRoleGroupsManager.prototype.initialize = function () {
    var that = this;
    var removeRecord = function(e) {

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
        columns: [
            {
                title: "Group",
                field: "GroupName",
                width: "80%"
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
        title: "User Groups",
        toolbar: [
            { text: "Add User Group" }
        ]
    };
    that.getElement()
        .find("*[data-role=collapsegrid]")
        .kendoCollapseGrid(opts);
}

DamRoleGroupsManager.prototype.dataSourceOpts = {};
DamRoleGroupsManager.prototype.getDataSource = function () {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, {});
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {
                IsActive: true,
                AssetRoleId: that.options.assetRoleId
            };
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetUserGroups",
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
    that.dataSourceOpts.pageSize = 10;
    that.dataSourceOpts.serverFiltering = true;
    return that.dataSourceOpts;
}