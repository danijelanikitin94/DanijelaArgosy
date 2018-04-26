(function ($) {
    // shorten references to variables. this is better for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget;

    var AssetRoleUserGrid = Widget.extend({
        init: function (element, options) {
            // base call to initialize widget
            Widget.fn.init.call(this, element, options);
            this._initialize();
        },
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "AssetRoleUserGrid",
            dataSource: {},
            assetRoleId: 0
        },
        removeUser: function (data, grid) {
            var that = this;
            $.ajax({
                url: "/Tools/DigitalAssets/RemoveUserFromRole",
                dataType: "json",
                data: {
                    userId: data.UserId,
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
                that.removeUser(data, grid);
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
                    { name: "addUsers", text: " Add User", 'class': "fa fa-plus", 'data-id': that.options.assetRoleId}
                ],
                addUsers: function (e) {
                    var assetId = $(e.currentTarget).data("id");
                    $(document).trigger(argosyEvents.SEARCH_PAGE_GRID, {
                        
                        ExcludeAssetRoleIds: JSON.stringify([assetId])
                    });
                    $.fancybox({ href: "#_DamUserSelect" });
                }
            };
            $(document).bind(argosyEvents.EVENT_RELOAD_ASSET_USERS, function (e, data) {
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
                        url: "/DataView/GetUsers",
                        dataType: "json",
                        data: search,
                        method: "POST",
                        type: "POST",
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
    ui.plugin(AssetRoleUserGrid);
})(jQuery);