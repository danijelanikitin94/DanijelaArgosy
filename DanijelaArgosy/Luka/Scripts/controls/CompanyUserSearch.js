function CompanyUserSearch(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();
    $(document).bind(argosyEvents.CLEAR_SELECTED_USER, function (e) {
        if (that.options.userSearchViewModel) {
            that.options.userSearchViewModel.clearSelectedUser();
        }
    });
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
       if ($("#_CompanySearchModal").css('display') !== "none" || that.options.initialLoad === true) {
            that.refineSearch(data);
          }
    });

    controlLoader.loadTemplate("CompanyUserSearch", function (template) {
        $(document.body).append(template);
        $("*[data-argosy-uuid='" + that.options.uuid + "']").append($(that.options.viewTemplate).html());
        that.refineSearch({});
        that.loaded = true;
        $(document).trigger(that.EVENT_TEMPLATE_LOADED);
    });

}
CompanyUserSearch.prototype.EVENT_TEMPLATE_LOADED = "COMPANY_USER_SEARCH_TEMPLATES_LOADED";
CompanyUserSearch.prototype.options = {};
CompanyUserSearch.prototype.baseOptions = {
    viewTemplate: "#_CompanyUserSearchViewTemplate",
    gridViewSelector: "div[data-argosy-view=CompanyUserSearch]",
    modelBindSelector: "#_CompanyUserBindContainer",
    valueSelector: "#_hiddenUserId",
    userSearchViewModel: null,
    addBtn: "#addUserBtn",
    clearBtn: "#clearUserBtn",
    searchBtn: "#searchUserBtn",
    UserNameLabel: "#UsersFullName",
    initialLoad:true
};
CompanyUserSearch.prototype.searchCriteria = {
    Keyword: null,
};

CompanyUserSearch.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};
CompanyUserSearch.prototype.updateBtns = function (userIsSelected) {
    var that = this;
    if (userIsSelected === true) {
        $(that.options.clearBtn + "," + that.options.searchBtn).removeClass('hidden');
        $(that.options.addBtn).addClass('hidden');
    } else {
        $(that.options.clearBtn + "," + that.options.searchBtn).addClass('hidden');
        $(that.options.addBtn).removeClass('hidden');
    }
};
CompanyUserSearch.prototype.setupGrid = function () {
    $('#_CompanySearchAlert').addClass('hidden');
    var that = this;
    that.options.userSearchViewModel = kendo.observable({
            clearSelectedUser:function(e) {
                $(that.options.UserNameLabel).html('');
                that.updateBtns(false);
                $(that.options.valueSelector).val(0);
                if ($("#SessionUserId")) {
                    getUser($("#SessionUserId").val(), function (user) {
                        $(document).trigger(argosyEvents.SELECTED_USER, user);
                    });
                }
            },
            addUsers: function (e) {
                var selectedUser = null;
                var kendoGrid = $(that.options.gridViewSelector).getKendoGrid();
                $(kendoGrid.select()).each(function (i) {
                    selectedUser = kendoGrid.dataItem(this);
                });
                if (selectedUser !== null) {
                    that.updateBtns(true);
                    $(document).trigger(argosyEvents.SELECTED_USER, selectedUser);
                    $(that.options.valueSelector).val(selectedUser.UserId);
                    $(that.options.UserNameLabel).html(selectedUser.FullName);
                    $.fancybox.close();
                } else {
                    $("#_CompanySearchAlert").removeClass('hidden');
                }
            }
        });

    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            groupable: false,
            exportToExcel: false,
            sortable: true,
            selectable: "single, row",

            pageable: {
                refresh: false,
                pageSizes: false,
                buttonCount: 1
            },
            columns: [
                {
                    title: "~{UserName}~",
                    field: "Username"
                },
                {
                    title: "~{FirstName}~",
                    field: "FirstName"
                },
                {
                    title: "~{LastName}~",
                    field: "LastName"
                }
            ],
            checkboxes: true,
            search: [
                { name: "Keyword", type: "text", placeholder: "~{SearchByUsernameFirstLast}~", toolbar: true }
            ],
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
        kendo.bind($(that.options.modelBindSelector), that.options.userSearchViewModel);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }

};

CompanyUserSearch.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.pageSize = 5;

    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetFullUsers",
                dataType: "json",
                data: search,
                success: function (result) {
                    if (result.ReturnCode === ReturnCode.Failed) {
                        handleDataSourceException(result);
                    } else {
                        that.options.initialLoad = false;
                        options.success(result);
                    }
                }
            });
        }
    };
    return new kendo.data.DataSource(that.dataSourceOpts);
};

CompanyUserSearch.prototype.dataSourceOpts = {};
