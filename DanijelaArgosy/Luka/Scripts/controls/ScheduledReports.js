function ScheduledReports(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
	that.CompanyId = that.options.companyId;
	that.SiteId = that.options.siteId;
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch();

}
ScheduledReports.prototype.options = {};
ScheduledReports.prototype.Init = false;
ScheduledReports.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=ScheduledReports]"
};
ScheduledReports.prototype.CompanyId = null;
ScheduledReports.prototype.SiteId = null;
ScheduledReports.prototype.searchCriteria = {

};
ScheduledReports.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

ScheduledReports.prototype.properties = {
    SelectedUserIds: [],
    SelectedReportIds: [],
    AdditionalEmails: []
}


ScheduledReports.prototype.setupGrid = function () {
    var that = this;
    if (!that.Init) {
        that.getScheduleDropDowns();
        that.Init = true;
    }
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            selectable: "multiple, row",
            exportToExcel: false,
            pageable: {
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 5
            },
            columns: [
                {
                    title: " ",
                    template: "<div class='text-center'><a title='Remove'><i class='fa fa-trash-o'></i></a></div>"
                },
                {
                    title: " ",
                    template: "<div class='text-center'><a title='Edit'><i class='fa fa-edit'></a></i></div>"
                },
                {
                    title: " ",
                    template: "<div id='RunSchedule' class='textl'>#if(Active){#<a><b><i id='IconRunning' class='fa fa-pause' title='Stop'></i></b></a>#}else{# <a><b><i id='IconRunning' class='fa fa-play' title='Start'></i></b></a> #}#</div>"
                },
                {

                    template: "<div id='ScheduleStatus' class='textl'>#if(Active){#<b>Running <i id='IconRunning' class='fa fa-refresh fa-spin'></i></b>#}else{# <b>~{Stopped}~ <i id='IconRunning' class='fa fa-refresh fa-stop'></i></b> #}#</div>"
                },
                {
                    title: "~{Name}~",
                    template: "<a class='reportSchedule'>${ReportScheduleName}</a>"
                },
                {
                    title: "~{Frequency}~",
                    template: "#= Frequency=='D'?'~{Daily}~':Frequency=='M'?'~{Monthly}~':'~{Weekly}~' #"
                },
                {
                    title: "~{TimeToRun}~",
                    template: "#= TimeToRun=='M'?'~{Morning}~':TimeToRun=='A'?'~{Afternoon}~':'~{Evening}~' #"
                },
                {
                    title: "~{DayOfMonth}~",
                    template: "<div > #if(DayOfMonth > 0) {#   #= DayOfMonth # #}else{# - #}#  </div>"
                },
                {
                    title: "~{LastRunDate}~",
                    field: "LastRunDate",
                    template: "#= (LastRunDate!=null) ? kendo.toString(kendo.parseDate(LastRunDate), 'MM/dd/yyyy') : 'Never Ran'#",
                    width: "150px"
                },
                {
                    title: "~{DateCreated}~",
                    field: "DateCreated",
                    template: "${kendo.toString(kendo.parseDate(DateCreated),\"MM/dd/yyyy\")}",
                    width: "150px"
                }
            ],
            checkboxes: false,
            dataBinding: function (e) {
            },
            dataBound: function (e) {
                var gridElement = $(e.sender.element);
                var createSchedule = gridElement.find(".k-button.k-button-icontext.k-grid-createSchedule");
                var grid = gridElement.getKendoGrid();
                createSchedule.unbind("click");
                createSchedule.click(function (clickEvent) {
                    that.clearControls();
                    $.fancybox({
                        href: "#createScheduleModal",
                        autoSize: true
                    });
                });

                gridElement.find("tbody tr[role=row]").each(function () {
                    var data = grid.dataItem(this);
                    var deleteBtn = $(this).find(".fa.fa-trash-o").parent();
                    deleteBtn.unbind("click");
                    deleteBtn.click(function () {
                        that.DeleteReportScheduleModal(data);
                    });

                    var playBtn = $(this).find(".fa.fa-play").parent();
                    playBtn.unbind("click");
                    playBtn.click(function () {
                        that.StartReport(data);
                    });

                    var pauseBtn = $(this).find(".fa.fa-pause").parent();
                    pauseBtn.unbind("click");
                    pauseBtn.click(function () {
                        that.StopReport(data);
                    });

                    var editBtn = $(this).find(".fa.fa-edit").parent();
                    editBtn.unbind("click");
                    editBtn.click(function () {
                        that.ShowEditReportScheduleModal(data);
                    });

                    var reportScheduleBtn = $(this).find(".reportSchedule").parent();
                    reportScheduleBtn.unbind("click");
                    reportScheduleBtn.click(function () {
                        that.ShowReportScheduleDetailModal(data);
                    });


                });
                $("div[data-argosy-view=ScheduledReports] th:eq(5) ,div[data-argosy-view=ScheduledReports]  tr td:nth-child(6)").addClass(" hidden-xs");
                $("div[data-argosy-view=ScheduledReports] th:eq(6) ,div[data-argosy-view=ScheduledReports]  tr td:nth-child(7)").addClass("hidden-xs");
                $("div[data-argosy-view=ScheduledReports] th:eq(7),div[data-argosy-view=ScheduledReports]  tr td:nth-child(8)").addClass("hidden-sm hidden-xs");
                $("div[data-argosy-view=ScheduledReports] th:eq(8),div[data-argosy-view=ScheduledReports]  tr td:nth-child(9)").addClass("hidden-sm hidden-xs");
                $("div[data-argosy-view=ScheduledReports] th:eq(9),div[data-argosy-view=ScheduledReports]  tr td:nth-child(10)").addClass("hidden-sm hidden-xs");
                $("div[data-argosy-view=ScheduledReports] th:eq(10),div[data-argosy-view=ScheduledReports]  tr td:nth-child(11)").addClass("hidden-sm hidden-xs");
            },
            toolbar: [
                { name: "createSchedule", text: "<i class='fa fa-plus'></i><span class='resp-hidden'> ~{CreateSchedule}~</span>" }
            ]
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

ScheduledReports.prototype.DeleteReportScheduleModal = function (reportSchedule) {
    var that = this;
    var btnClicked = false;
    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function (e) {
            if (!btnClicked) {
                that.DeleteReportSchedule(reportSchedule);
                btnClicked = true;
            }
        }
    };

    message.question = "Do you want to delete the selected report ?";
    message.description = "Deleted Report cannot be restored.";
    message.button = "Delete";

    prompt.alert(message);
};

ScheduledReports.prototype.DeleteReportSchedule = function (reportSchedule) {
    var that = this;
    var params = {
        reportSchedule: reportSchedule
    };
    $.ajax({
        url: '/Admin/Reports/DeleteScheduledReport',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result.ReturnCode == ReturnCode.Success) {
                $(result.Records).each(function () {
                    prompt.notify({
                        question: "Report " + this.Key + " was " + (!this.Value ? "" : "not") + " successfully deleted.",
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
}

ScheduledReports.prototype.StartReport = function (reportSchedule) {
    var that = this;
    reportSchedule.Active = true;
    var params = {
        reportSchedule: reportSchedule
    };
    $.ajax({
        url: '/Admin/Reports/UpdateReportSchedule',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result.ReturnCode == ReturnCode.Success) {
                prompt.notify({
                    question: "Report schedule was successfully started.",
                    type: "success"
                });
            } else {
                prompt.clientResponseError(result);
            }
            var grid = $(that.options.gridViewSelector).getKendoGrid();
            grid.dataSource.read();
            grid.refresh(true);
        }
    });
};

ScheduledReports.prototype.StopReport = function (reportSchedule) {
    var that = this;
    reportSchedule.Active = false;
    var params = {
        reportSchedule: reportSchedule
    };
    $.ajax({
        url: '/Admin/Reports/UpdateReportSchedule',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result.ReturnCode == ReturnCode.Success) {
                prompt.notify({
                    question: "Report schedule was successfully stopped.",
                    type: "success"
                });
            } else {
                prompt.clientResponseError(result);
            }
            var grid = $(that.options.gridViewSelector).getKendoGrid();
            grid.dataSource.read();
            grid.refresh(true);
        }
    });
};

ScheduledReports.prototype.getSelectedItems = function () {
    var that = this;
    var selectedItems = [];
    var kendoGrid = $(that.options.gridViewSelector).getKendoGrid();

    $(kendoGrid.select()).each(function (i) {
        selectedItems.push(kendoGrid.dataItem(this));
    });
    return selectedItems;
};

ScheduledReports.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {};
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetScheduledReports",
                dataType: "json",
                data: search,
                success: function (result) {
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

ScheduledReports.prototype.dataSourceOpts = {};

ScheduledReports.prototype.getScheduleDropDowns = function () {
    var timeOfDay = [
                    { value: "M", text: "Morning" },
                    { value: "A", text: "Afternoon" },
                    { value: "E", text: "Evening" }
    ];

    var frequency = [
        { value: "M", text: "Monthly" },
        { value: "W", text: "Weekly" },
        { value: "D", text: "Daily" }
    ];

    var days = [
        { value: "1", text: "1" },
        { value: "2", text: "2" },
        { value: "3", text: "3" },
        { value: "4", text: "4" },
        { value: "5", text: "5" },
        { value: "6", text: "6" },
        { value: "7", text: "7" },
        { value: "8", text: "8" },
        { value: "9", text: "9" },
        { value: "10", text: "10" },
        { value: "11", text: "11" },
        { value: "12", text: "12" },
        { value: "13", text: "13" },
        { value: "14", text: "14" },
        { value: "15", text: "15" },
        { value: "16", text: "16" },
        { value: "17", text: "17" },
        { value: "18", text: "18" },
        { value: "19", text: "19" },
        { value: "20", text: "20" },
        { value: "21", text: "21" },
        { value: "22", text: "22" },
        { value: "23", text: "23" },
        { value: "24", text: "24" },
        { value: "25", text: "25" },
        { value: "26", text: "26" },
        { value: "27", text: "27" },
        { value: "28", text: "28" },
        { value: "29", text: "29" },
        { value: "30", text: "30" },
        { value: "31", text: "31" }
    ];

    var weekDays = [
        { value: "1", text: "Monday" },
        { value: "2", text: "Tuesday" },
        { value: "3", text: "Wednesday" },
        { value: "4", text: "Thursday" },
        { value: "5", text: "Friday" },
        { value: "6", text: "Saturday" },
        { value: "7", text: "Sunday" }
    ];

    var supressYesNo = [
        { value: "Yes", text: "Yes" },
        { value: "No", text: "No" }
    ];

    $("#ddlFrequency").kendoDropDownList({
        optionLabel: "Select Frequency",
        dataTextField: "text",
        dataValueField: "value",
        dataSource: frequency,
        change: function () {
            if (this.value() == "M") {
                $("#divDayOftheMonth").removeClass("hide");
                $("#divDayOftheWeek").addClass("hide");
            } else if (this.value() == "W") {
                $("#divDayOftheWeek").removeClass("hide");
                $("#divDayOftheMonth").addClass("hide");
            } else {
                $("#divDayOftheMonth").addClass("hide");
                $("#divDayOftheWeek").addClass("hide");
            }
        }
    });

    $("#ddlTimeOfDay").kendoDropDownList({
        optionLabel: "Select Time of the Day",
        dataTextField: "text",
        dataValueField: "value",
        dataSource: timeOfDay
    });

    $("#ddlDayOfMonth").kendoDropDownList({
        optionLabel: "Select Day of the Month",
        dataTextField: "text",
        dataValueField: "value",
        dataSource: days
    });

    $("#ddlWeekDays").kendoDropDownList({
        optionLabel: "Select Day of the Week",
        dataTextField: "text",
        dataValueField: "value",
        dataSource: weekDays
    });

    $("#ddlSupressReports").kendoDropDownList({
        dataTextField: "text",
        dataValueField: "value",
        dataSource: supressYesNo
    });


};

ScheduledReports.prototype.continueToReports = function () {
    var that = this;
    that.loadReports();
    $.fancybox({
        href: "#selectReportModal"
    });
}

ScheduledReports.prototype.loadReports = function () {
    var that = this;
    var multiSelectDataSource = new kendo.data.DataSource({
        serverPaging: true,
        serverFiltering: true,
        pageSize: 5,
        schema: {
            data: "Records",
            total: "TotalRecords"
        },
        transport: {
            read: {
                url: "/Admin/Reports/GetReportsToSchedule",
                type: "POST",
                contentType: 'application/json'
            },
            parameterMap: function (options) {
                var search = new Object();
                if (options.filter != null) {
                    search.Keyword = options.filter.filters[0].value;
                }
                if (that.properties.SelectedReportIds.length > 0) {
                    search.ReportConfigIds = that.properties.SelectedReportIds;
				}
				
                search.Take = 20;
                options.search = search;
                return JSON.stringify(options);
            }
        }
    });
    var reports;
    if ($("#grdReports").getKendoMultiSelect() == null || $("#grdReports").getKendoMultiSelect == undefined) {
        reports = $("#grdReports").kendoMultiSelect({
            placeholder: "Search By Report Name...",
            dataTextField: "ReportViewName",
            dataValueField: "ReportConfigId",
            headerTemplate: '<div class="dropdown-header k-widget k-header bkg-gray row">' +
              '<div class="col-sm-4 upcase">' +
              '<center><b>Report View</b></center>' +
              '</div>' +
              '<div class="col-sm-8 upcase">' +
              '<center><b>Report Name</b></center>' +
              '</div>' +
              '</div>',
            itemTemplate: '<div class="row clear clearfix">' +
                '<div class="k-state-default col-sm-4">' +
                '<b>#: data.ReportName #</b>' +
                '</div>' +
                '<div class"col-sm-8">' +
                '#: data.ReportViewName #' +
                '</div>',
            tagTemplate: '<span class="selected-value"></span><span>#:data.ReportName# (#: data.ReportViewName #)</span>',
            autoWidth: true,
            dataSource: multiSelectDataSource,
            filter: "startswith",
            minLength: 3,
            value: that.properties.SelectedReportIds,
            change: function () {
                that.properties.SelectedReportIds = [];
                var values = this._old;
                $.each(values, function (i) {
                    if (this != null && this != "" && this > 0) {
                        that.properties.SelectedReportIds.push(values[i]);
                    }
                    i++;
                });

            }

        });

    } else {
        reports = $("#grdReports").data("kendoMultiSelect");
        reports.setDataSource(multiSelectDataSource);
        reports.value(that.properties.SelectedReportIds);

    }
}

ScheduledReports.prototype.continueToReportSchedule = function () {
    var that = this;
    $.fancybox({
        href: "#createScheduleModal"
    });
}

ScheduledReports.prototype.loadUsers = function () {
    var that = this;

    var userMultiSelectDataSource = new kendo.data.DataSource({
        serverPaging: true,
        serverFiltering: true,
        pageSize: 5,
        schema: {
            data: "Records",
            total: "TotalRecords"
        },
        transport: {
            read: {
                url: "/Admin/Users/GetCompanyUsers",
                type: "POST",
                contentType: 'application/json'
            },
            parameterMap: function (options) {
                var search = new Object();
                search.Active = "Y";
                search.Take = 20;
                if (that.properties.SelectedUserIds.length > 0) {
                    search.IncludeUserIds = that.properties.SelectedUserIds;
                }
                if (options.filter != null && options.filter.filters[0] != null) {
					search.FullName = options.filter.filters[0].value;
                }
                options.search = search;
                return JSON.stringify(options);
            }
        }
    });
    var users;
    if ($("#grdUsers").getKendoMultiSelect() == null || $("#grdUsers").getKendoMultiSelect == undefined) {

        users = $("#grdUsers").kendoMultiSelect({
            placeholder: "Search User By First, Last or Username...",
            dataTextField: "FullName",
            dataValueField: "UserId",
            headerTemplate: '<div class="dropdown-header k-widget k-header">' +
                '<span>Full Name</span>' +
                '<span>Username</span>' +
                '</div>',
            itemTemplate: '<span class="k-state-default"><h3>#: data.FullName #</h3><p>#: data.Username #</p></span>',
            tagTemplate: '<span class="selected-value"></span><span>#:data.FullName#(#: data.Username #)</span>',
            dataSource: userMultiSelectDataSource,
            filter: "startswith",
            minLength: 3,
            value: that.properties.SelectedUserIds,
            change: function () {
                that.properties.SelectedUserIds = [];
                var values = this._old;
                $.each(values, function (i) {
                    if (this != null && this != "" && this > 0) {
                        that.properties.SelectedUserIds.push(values[i]);
                    }
                    i++;
                });

            }

        });

    } else {
        users = $("#grdUsers").data("kendoMultiSelect");
        users.setDataSource(userMultiSelectDataSource);
        users.value(that.properties.SelectedUserIds);
    }

}

ScheduledReports.prototype.continueToUserSelection = function () {
    var that = this;
    that.loadUsers();
    $.fancybox({
        href: "#selectUserModal"
    });
}

ScheduledReports.prototype.continueToAdditionalEmail = function () {
    var that = this;
    if ($("#grdAdditionalEmails").getKendoGrid() == null || $("#grdAdditionalEmails").getKendoGrid() == undefined) {
        var opts = {
            dataSource: {
                data: that.properties.AdditionalEmails,
                schema: {
                    id: "id",
                    model: {
                        fields: { Email: { type: "string" } }
                    }
                }
            },
            columns: [
                {
                    field: "Email",
                    title: "Email(s)"
                }
            ],
            scrollable: false,
            sortable: false,
            dataBound: function (e) {
                $.fancybox({
                    href: "#additionalEmailModal"
                });

                var grid = e.sender;
                if (grid.dataSource.total() == 0) {
                    var colCount = grid.columns.length;
                    $(e.sender.wrapper)
                        .find('tbody')
                        .append('<tr class="kendo-data-row"><td colspan="' + colCount + '" class="no-data">No Email Address Found</td></tr>');
                }
            }
        }

        $("#grdAdditionalEmails").kendoGrid(opts);

    } else {
        var grid = $("#grdAdditionalEmails").getKendoGrid();
        grid.dataSource.data(that.properties.AdditionalEmails);
        grid.refresh();
    }


}

ScheduledReports.prototype.saveAdditionalEmails = function (email) {
    var that = this;
    var count = that.properties.AdditionalEmails.length + 1;
    that.properties.AdditionalEmails.push({ id: count, Email: email });
    var grid = $("#grdAdditionalEmails").getKendoGrid();
    grid.dataSource.data(that.properties.AdditionalEmails);
    grid.refresh();
}

ScheduledReports.prototype.saveReportSchedule = function () {
    var that = this;
    var reportSchedule = new Object();
    
    //Step 1 Data: Schedule Information
    reportSchedule.ReportScheduleName = $("#txtScheduleName").val();
    reportSchedule.ReportScheduleId = $("#txtScheduleName").attr("ReportScheduleId");
    reportSchedule.Frequency = $("#ddlFrequency").getKendoDropDownList().value();
    reportSchedule.TimeToRun = $("#ddlTimeOfDay").getKendoDropDownList().value();

    if (reportSchedule.Frequency == "M") {
        reportSchedule.DayOfMonth = $("#ddlDayOfMonth").getKendoDropDownList().value();
    } else if (reportSchedule.Frequency == "W") {
        reportSchedule.DayOfMonth = $("#ddlWeekDays").getKendoDropDownList().value();
    }

    reportSchedule.FlagSendEmptyReport = $("#ddlSupressReports").getKendoDropDownList().value() == "Yes";

    //Step 2 Data: Get Selected Reports
    if (that.properties.SelectedReportIds.length > 0) {
        reportSchedule.ReportConfigIds = that.properties.SelectedReportIds;
    } else { reportSchedule.ReportConfigIds = [] }

    //Step 3 Data: Get Selected Users
    if (that.properties.SelectedUserIds.length > 0) {
        reportSchedule.RecepientUserIds = that.properties.SelectedUserIds.join(", ");
    } else {
        reportSchedule.RecepientUserIds = "";
    }

    //Step 4 Data: Get Additional Emails
    if (that.properties.AdditionalEmails.length > 0) {
        reportSchedule.RecepientEmailAddresses = $.map(that.properties.AdditionalEmails, function (val) {
            return val.Email;
        }).join(", ");
    } else {
        reportSchedule.RecepientEmailAddresses = "";
    }

    var params = { reportSchedule: reportSchedule };

    $.ajax({
        url: "/Admin/ReportSchedules/SaveReportSchedule",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(params),
        cache: false,
        processData: false,
        success: function (result) {
            if (result.ReturnCode == ReturnCode.Success) {
                prompt.notify({
                    question: "Report schedule '" + result.Records.Key + "' saved successfully.",
                    type: (!result.Records.Value ? "success" : "error")
                });
                var grid = $(that.options.gridViewSelector).getKendoGrid();
                grid.dataSource.read();
                grid.refresh();
            } else {
                prompt.alert({
                    question: result.Message,
                    description: "Ref: " + result.Guid,
                    type: "warning",
                    yes: function (e) {
                        $.fancybox.close();
                    }
                });
            }
            $.fancybox.close();

        }
    });

}

ScheduledReports.prototype.clearControls = function () {
    var that = this;

    $("#txtScheduleName").val('');
    if ($("#ddlFrequency").getKendoDropDownList() != null || $("#ddlFrequency").getKendoDropDownList() != undefined) {
        $("#ddlFrequency").getKendoDropDownList().value('');
    }
    if ($("#ddlTimeOfDay").getKendoDropDownList() != null || $("#ddlTimeOfDay").getKendoDropDownList() != undefined) {
        $("#ddlTimeOfDay").getKendoDropDownList().value('');
    }
    if ($("#ddlDayOfMonth").getKendoDropDownList() != null || $("#ddlDayOfMonth").getKendoDropDownList() != undefined) {
        $("#ddlDayOfMonth").getKendoDropDownList().value('');
    }
    if ($("#ddlWeekDays").getKendoDropDownList() != null || $("#ddlWeekDays").getKendoDropDownList() != undefined) {
        $("#ddlWeekDays").getKendoDropDownList().value('');
    }
    if ($("#ddlSupressReports").getKendoDropDownList() != null || $("#ddlSupressReports").getKendoDropDownList() != undefined) {
        $("#ddlSupressReports").getKendoDropDownList().value('Yes');
    }
    if ($("#grdReports").getKendoMultiSelect() != null | $("#grdReports").getKendoMultiSelect() != undefined) {
        $("#grdReports").getKendoMultiSelect().dataSource.data([]);
    }
    if ($("#grdUsers").getKendoMultiSelect() != null | $("#grdUsers").getKendoMultiSelect() != undefined) {
        $("#grdUsers").getKendoMultiSelect().dataSource.data([]);
    }
    if ($("#grdAdditionalEmails").getKendoGrid() != null | $("#grdAdditionalEmails").getKendoGrid() != undefined) {
        $("#grdAdditionalEmails").getKendoGrid().dataSource.data([]);
    }

    that.properties.SelectedUserIds = [];
    that.properties.SelectedReportIds = [];
    that.properties.AdditionalEmails = [];

}

ScheduledReports.prototype.ShowEditReportScheduleModal = function (schedule) {
    var that = this;
    that.clearControls();
    that.loadControls(schedule);
    $.fancybox({
        href: "#createScheduleModal"
    });

}

ScheduledReports.prototype.loadControls = function (data) {
    var that = this,
        ddlTimeOfDay = $("#ddlTimeOfDay").getKendoDropDownList(),
        ddlFrequency = $("#ddlFrequency").getKendoDropDownList(),
        txtScheduleName = $("#txtScheduleName"),
        ddlDayOfMonth = $("#ddlDayOfMonth").getKendoDropDownList(),
        divDayOftheWeek = $("#divDayOftheWeek"),
        divDayOfTheMonth = $("#divDayOftheMonth"),
        ddlWeekDays = $("#ddlWeekDays").getKendoDropDownList(),
        ddlSupressReports = $("#ddlSupressReports").getKendoDropDownList();

    txtScheduleName.val(data.ReportScheduleName).attr("ReportScheduleId", data.ReportScheduleId);
    
    
    if (ddlFrequency != null || ddlFrequency != undefined) {
        ddlFrequency.value(data.Frequency);
    }
    
    if (ddlTimeOfDay != null || ddlTimeOfDay != undefined) {
        ddlTimeOfDay.value(data.TimeToRun);
    }
    

    if (data.Frequency == "M" && (ddlDayOfMonth != null || ddlDayOfMonth != undefined)) {
        ddlDayOfMonth.value(data.DayOfMonth);
        divDayOftheWeek.addClass("hide");
        divDayOfTheMonth.removeClass("hide");
    }
    
    if (data.Frequency == "W" && (ddlWeekDays != null || ddlWeekDays != undefined)) {
        ddlWeekDays.value(data.DayOfMonth);
        divDayOftheWeek.removeClass("hide");
        divDayOfTheMonth.addClass("hide");
    }
    
    if (ddlSupressReports != null || ddlSupressReports != undefined) {
        ddlSupressReports.value(data.FlagSendEmptyReport ? "Yes" : "No");
    }

    if (data.ReportConfigIds != null && data.ReportConfigIds.length > 0) {
        if (data.ReportConfigIds.length > 0) {
            $.each(data.ReportConfigIds, function (i) {
                that.properties.SelectedReportIds.push(data.ReportConfigIds[i]);
            });
        }
    }

    if (data.RecepientUserIds != null && data.RecepientUserIds != '') {
        var userIds = data.RecepientUserIds.split(',');
        if (userIds.length > 0) {
            $.each(userIds, function (i) {
                that.properties.SelectedUserIds.push(userIds[i]);
            });
        }
    }
    if (data.RecepientEmailAddresses != null && data.RecepientEmailAddresses != '') {
        var userEmails = data.RecepientEmailAddresses.split(',');
        if (userEmails.length > 0) {
            $.each(userEmails, function (i) {
                that.properties.AdditionalEmails.push({ id: i + 1, Email: userEmails[i] });
            });
        }
    }
}
ScheduledReports.prototype.ShowReportScheduleDetailModal = function (data) {
    var that = this;
  
    if ($("#grdUsersInSchedule").find(".k-collapse-grid").getKendoGrid() != null && $("#grdUsersInSchedule").find(".k-collapse-grid").getKendoGrid() != undefined) {
        $("#grdUsersInSchedule").find(".k-collapse-grid").getKendoGrid().destroy();
        $('#grdUsersInSchedule').empty();
    }
    if ($("#grdAdditionalEmailsInSchedule").find(".k-collapse-grid").getKendoGrid() != null && $("#grdAdditionalEmailsInSchedule").find(".k-collapse-grid").getKendoGrid() != undefined) {
        $("#grdAdditionalEmailsInSchedule").find(".k-collapse-grid").getKendoGrid().destroy();
        $('#grdAdditionalEmailsInSchedule').empty();
    }
    if ($("#grdReportInSchedule").find(".k-collapse-grid").getKendoGrid() != null && $("#grdReportInSchedule").find(".k-collapse-grid").getKendoGrid() != undefined) {
        $("#grdReportInSchedule").find(".k-collapse-grid").getKendoGrid().destroy();
        $('#grdReportInSchedule').empty();
    }

    $("#lblScheduleName").html(data.ReportScheduleName);

    var frequency = data.Frequency == "M" ? "Monthly" : (data.Frequency == "D" ? "Daily" : "Weekly");
    $("#lblFrequency").html(frequency);

    var timeToRun = data.TimeToRun == "M" ? "Morning" : (data.TimeToRun == "A" ? "Afternoon" : "Evening");
    $("#lblTimeOfDay").html(timeToRun);

    if (data.Frequency == "M") {
        $("#lblDayOfMonth").html(data.DayOfMonth);
        $("#divLblDayOftheMonth").removeClass("hide");
    } else {
        $("#divLblDayOftheMonth").addClass("hide");
    }

    if (data.Frequency == "W") {
        $("#lblDayOfWeek").html(data.DayOfMonth);
        $("#divLblDayOftheWeek").removeClass("hide");
    } else {
        $("#divLblDayOftheWeek").addClass("hide");
    }
    var sendEmptyReport = data.FlagSendEmptyReport ? "Yes" : "No";
    $("#lblSuppressReports").html(sendEmptyReport);

    var lastRunDate = data.LastRunDate == null ? "Never Ran" : kendo.toString(kendo.parseDate(data.LastRunDate), "MM/dd/yyyy h:mm:ss tt");
    $("#lblLastRunDate").html(lastRunDate);

    var dateCreated = kendo.toString(kendo.parseDate(data.DateCreated), "MM/dd/yyyy h:mm:ss tt");
    $("#lblDateCreated").html(dateCreated);

    //Addiotnal EMails
    var emails = [];
    if (data.RecepientEmailAddresses != null && data.RecepientEmailAddresses != "") {
        var addEmails = data.RecepientEmailAddresses.split(",");

        $.each(addEmails, function (i) {
            emails.push({ id: i + 1, Email: addEmails[i] });
        });

    }

    var emailDataSource = new kendo.data.DataSource({
        data: emails,
        pageSize: 5,
        schema: {
            id: "id",
            model: {
                fields: { Email: { type: "string" } }
            }
        }
    });

    if ($("#grdAdditionalEmailsInSchedule").find(".k-collapse-grid").getKendoGrid() == null || $("#grdAdditionalEmailsInSchedule").find(".k-collapse-grid").getKendoGrid() == undefined) {
        var opts = {
            scrollable: false,
            editable: false,
            exportToExcel: false,
            dataSource: emailDataSource,
            columns: [
                {
                    field: "Email",
                    title: "Email"
                }
            ],
            groupable: false,
            sortable: false,
            pageable: {
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 5
            },
            title: "Additional Emails"
        };
        $("#grdAdditionalEmailsInSchedule").kendoCollapseGrid(opts);
    } else {
        var grid = $("#grdAdditionalEmailsInSchedule").find(".k-collapse-grid").getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
  
    var reportInScheduleDataSource = new kendo.data.DataSource({
        serverPaging: true,
        pageSize: 5,
        schema: {
            data: "Records",
            total: "TotalRecords"
        },
        transport: {
            read: {
                url: "/Admin/Reports/GetReportsByConfigIds",
                type: "POST",
                contentType: 'application/json'
            },
            parameterMap: function (options) {
                var search = new Object();
                if (data.ReportConfigIds.length > 0) {
                    search.ReportConfigIds = data.ReportConfigIds;
                }
                search.Take = 5;
                options.search = search;
                return JSON.stringify(options);
            }
        }
    });
    
    if ($("#grdReportInSchedule").find(".k-collapse-grid").getKendoGrid() == null || $("#grdReportInSchedule").find(".k-collapse-grid").getKendoGrid() == undefined) {
        var opts1 = {
            scrollable: false,
            editable: false,
            exportToExcel: false,
            dataSource: reportInScheduleDataSource,
            
            columns: [
                {
                    field: "ReportViewName",
                    title: "Report Name"
                }
            ],
            groupable: false,
            sortable: true,
            pageable: {
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 5
            },
            title: "Reports in Schedule"
        };
        $("#grdReportInSchedule").kendoCollapseGrid(opts1);
    } else {
        var grid1 = $("#grdReportInSchedule").find(".k-collapse-grid").getKendoGrid();
        grid1.dataSource.read();
        grid1.refresh();
    }

    var userIds = [];

    if (data.RecepientUserIds.length > 0) {
        var compUserIds = data.RecepientUserIds.split(",");
        $.each(compUserIds, function(j) {
            if (compUserIds[j].trim() != "") {
                userIds.push(compUserIds[j]);
            }
        });
    }

    var usersInScheduleDataSource = new kendo.data.DataSource({
        serverPaging: true,
        pageSize: 5,
        schema: {
            data: "Records",
            total: "TotalRecords"
        },
        transport: {
            read: {
                url: "/Admin/Users/GetReportScheduleUsers",
                type: "POST",
                contentType: 'application/json'
            },
            parameterMap: function (options) {
                var search = new Object();
                search.Active = "Y";
                search.Take = 5;
                if (userIds.length > 0) {
                    search.IncludeUserIds = userIds;
                }
                options.search = search;
                return JSON.stringify(options);
            }
        }
    });

    if ($("#grdUsersInSchedule").find(".k-collapse-grid").getKendoGrid() == null || $("#grdUsersInSchedule").find(".k-collapse-grid").getKendoGrid() == undefined) {
        var opts2 = {
            scrollable: false,
            editable: false,
            exportToExcel: false,
            dataSource: usersInScheduleDataSource,

            columns: [
                {
                    field: "FullName",
                    title: "Name"
                }
            ],
            groupable: false,
            sortable: true,
            pageable: {
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 5
            },
            title: "Distribution List Users"
        };
        $("#grdUsersInSchedule").kendoCollapseGrid(opts2);
    } else {
        var grid2 = $("#grdReportInSchedule").find(".k-collapse-grid").getKendoGrid();
        grid2.dataSource.read();
        grid2.refresh();
    }
   

    $.fancybox({
        href: "#scheduleDetailModal"
    });
}


