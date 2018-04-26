function GlobalProfilesGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch({});
}

GlobalProfilesGridView.prototype.options = {};
GlobalProfilesGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=GlobalProfilesGridView]",
    adminGridView: false,
    customGlobalFormsId: 0,
    customProfileUrl:"",
};


GlobalProfilesGridView.prototype.searchCriteria = {
    Username: null
};

GlobalProfilesGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    if ($(that.options.gridViewSelector).getKendoGrid() != null) {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.page(1);
    }
    that.setupGrid();
};

GlobalProfilesGridView.prototype.setupGrid = function () {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
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
                buttonCount: 5
            },
            columns: [
                {
                    title: "~{ProfileName}~",
                    field: "Name",
                    template: "#if(GlobalFormsId ==" + that.options.customGlobalFormsId + "){#<a href='" + (that.options.adminGridView ?String(that.options.customProfileUrl).replace("account","admin"): that.options.customProfileUrl)  +"/${Id}'>${Name}</a> #}else{# <a href='/" + (that.options.adminGridView ? "Admin" : "Account") + "/GlobalProfiles/Edit/${Id}'>${Name}</a> #}#",
                }, {
                    title: "~{FormName}~",
                    field: "GlobalFormName",
                }, {
                    title: "~{LastModified}~",
                    field: "DateModified",
                    template: "${kendo.toString(kendo.parseDate(DateModified),\"MM/dd/yyyy\")}"
                },
                {
                    title: "~{Status}~",
                    field: "IsActive",
                    template: "#if (IsActive == true) {#<b>Active</b>#} else {# In-Active #}#"
                }
            ],
            dataBound: function (e) {
                var grid = e.sender,
                    gridElement = $(grid.element);

                var activateButton = gridElement.find(".k-button.k-button-icontext.k-grid-activate");
                var deactivateButton = gridElement.find(".k-button.k-button-icontext.k-grid-deactivate");

                activateButton.unbind("click");
                deactivateButton.unbind("click");

                activateButton.click(function (clickEvent) {
                    that.showUpdateProfileModal(that.getSelectedRecords(), true);
                });
                deactivateButton.click(function (clickEvent) {
                    that.showUpdateProfileModal(that.getSelectedRecords(), false);
                });
                $("div[data-argosy-view=GlobalProfilesGridView] th:eq(3) ,div[data-argosy-view=GlobalProfilesGridView]  tr td:nth-child(4)").addClass("hidden-sm hidden-xs");
            },
            toolbar: [

                { name: "deactivate", text: "<i class='fa fa-close'></i><span class='resp-hidden'> ~{Deactivate}~</span>" },
                { name: "activate", text: "<i class='fa fa-check'></i><span class='resp-hidden'> ~{Activate}~</span>" }
            ],
            checkboxes: true,
            search: [
            { name: "Keyword", type: "text", placeholder: "~{SearchByProfileFormName}~", toolbar: true },
            { name: "Name", type: "text", placeholder: "~{ProfileName}~", toolbar: false },
            { name: "CompanyUserGroupId", type: "argosy", 'data-argosy-control': "GlobalUserGroupDropDown" },
            { name: "CompanyUserId", type: "select", toolbar: false, data: [{ value: "", text: "All" }] },
            { name: "DateModifiedStart", type: "date", placeholder: "From", toolbar: false },
            { name: "DateModifiedEnd", type: "date", placeholder: "To", toolbar: false },
            { name: "IsGlobalFormsProfileActive", type: "select", toolbar: true, data: [
                        { value: true, text: "~{Active}~", selected: true },
                        { value: false, text: "~{Inactive}~" }]
            }
            ]
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
    }
};

GlobalProfilesGridView.prototype.showUpdateProfileModal = function (profiles, activate) {
    var that = this;
    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function (e) {
            that.updateProfile(profiles, activate);
        }
    };

    if (activate) {
        message.question = "~{WantToActivateSelection}~";
        message.description = "~{ActiveProfilesIgnored}~";
        message.button = "~{Activate}~";
    } else {
        message.question = "~{WantToDeactivateSelection}~";
        message.description = " ~{InactiveProfilesIgnored}~ ";
        message.button = "~{Deactivate}~";
    }
    prompt.alert(message);
};

GlobalProfilesGridView.prototype.updateProfile = function (profiles, activate) {
    var that = this;
    var params = { profiles: profiles, activate: activate };
    $.ajax({
        url: '/DataView/UpdateGlobalProfilesStatus',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result.ReturnCode == ReturnCode.Success) {
                $(result.Records).each(function () {
                    prompt.notify({
                        question: "Global Profile " + this.Key + " was " + (!this.Value ? "" : "not") + " successfully " + (activate ? "activated." : "deactivated."),
                        type: (!this.Value ? "success" : "error")
                    });
                });
            } else {
                prompt.clientResponseError(result);
            }
            var grid = $(that.options.gridViewSelector).getKendoGrid();
            grid.dataSource.read();
            grid.refresh(true);
        }
    });
    $.fancybox.close();
};

GlobalProfilesGridView.prototype.getSelectedRecords = function () {
    var that = this;
    var selectedRecords = [];
    var kendoGrid = $(that.options.gridViewSelector).getKendoGrid();

    $(kendoGrid.select()).each(function (i) {
        selectedRecords.push(kendoGrid.dataItem(this));
    });

    return selectedRecords;
};

GlobalProfilesGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $(document).trigger(argosyEvents.START_LOADING);
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetGlobalFormProfiles",
                dataType: "json",
                data: search,
                success: function (result) {
                    $(document).trigger(argosyEvents.END_LOADING);
                    if (result.ReturnCode == ReturnCode.Failed) {
                        handleDataSourceException(result);
                    } else {
                        options.success(result);
                    }
                }
            });
        }
    };
    return new kendo.data.DataSource(that.dataSourceOpts);
};

GlobalProfilesGridView.prototype.dataSourceOpts = {};

GlobalProfilesGridView.prototype.getStatus = function () {
};
