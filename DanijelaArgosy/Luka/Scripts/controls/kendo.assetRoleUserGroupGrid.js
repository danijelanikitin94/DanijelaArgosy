(function ($) {
    // shorten references to variables. this is better for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget;

    var AssetRoleUserGroupGrid = Widget.extend({
        init: function (element, options) {
            // base call to initialize widget
            Widget.fn.init.call(this, element, options);
            this._initialize();
        },
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "AssetRoleUserGroupGrid",
            dataSource: {},
            assetRoleId: 0
        },
        removeUserGroup: function (data, grid) {
            var that = this;
            $.ajax({
                url: "/Tools/DigitalAssets/RemoveUserGroupFromRole",
                dataType: "json",
                data: {
                    userGroupId: data.UserGroupId,
                    assetRoleId: that.options.assetRoleId
                },
                success: function (result) {
                    if (result.ReturnCode === ReturnCode.Failed) {
                        prompt.clientResponseError(result);
                    } else {
                        that.options.dataSource.read();
                        grid.refresh();
                    }
                }
            });
        },
        _initialize: function () {
            var that = this;
            var removeRecord = function (e) {
                var table = e.currentTarget.closest(".k-widget");
                var grid = $(table).getKendoGrid();
                var tr = e.currentTarget.closest("tr");
                var data = grid.dataItem(tr);
                that.removeUserGroup(data, grid);
            };
            var opts = {
                dataSource: that._getDataSource(),
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
                    { name: "addUserGroups", text: " Add User Groups", 'class': "fa fa-plus", 'data-id': that.options.assetRoleId}
                ],
                addUserGroups: function (e) {
                    var assetId = $(e.currentTarget).data("id");
                    $(document).trigger(argosyEvents.SEARCH_PAGE_GRID, {
                        ExcludeAssetRoleIds: JSON.stringify([assetId])
                    });
                    $.fancybox({ href: "#_DamUserGroupSelect" });
                }
            };
            $(document).bind(argosyEvents.EVENT_RELOAD_ASSET_USERGROUPS, function (e, data) {
                if (data.assetRoleId == that.options.assetRoleId) {
                    var grid = that.element.find(".k-grid").getKendoGrid();
                    grid.dataSource.read();
                    grid.refresh();
                }
            });
            that.element.kendoCollapseGrid(opts);
        },
        _getDataSource: function () {
            var that = this;
            $.extend(true, that.options.dataSource, _defaultDataSourceConfig, {});
            that.options.dataSource.transport = {
                read: function (options) {
                    var search = {
                        IsActive: true,
                        AssetRoleId: that.options.assetRoleId
                    };
                    $.extend(true, search, kendoOptionsToObject(options), {});
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
            that.options.dataSource.serverFiltering = true;
            that.options.dataSource = new kendo.data.DataSource(that.options.dataSource);
            return that.options.dataSource;
        }
    });
    ui.plugin(AssetRoleUserGroupGrid);
})(jQuery);