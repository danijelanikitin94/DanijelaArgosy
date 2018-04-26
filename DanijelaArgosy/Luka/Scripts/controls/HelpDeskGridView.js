function HelpDeskGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch({});
}

HelpDeskGridView.prototype.options = {};

HelpDeskGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=HelpDeskGridView]"
};

HelpDeskGridView.prototype.searchCriteria = {
    HdStatus: null
};

HelpDeskGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};
 
HelpDeskGridView.prototype.setupGrid = function () {
    var that = this;
    var controller = that.options.controller;
    if ($(that.options.gridViewSelector).getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            exportToExcel:false,
            pageable: {
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 5
            },
            columns: [
                {
                    title: "~{TicketNumber}~",
                    field: "TicketId"
                },
                {
                    title: "~{Date}~",
                    field: "HdDateCreated",
                    template: "${kendo.toString(kendo.parseDate(HdDateCreated),\"MM/dd/yyyy\")}",

                }, {
                    title: "~{Subject}~",
                    field: "Subject",
                    template: "<div><a href='/"+controller+"/HelpDesk/Edit/${TicketId}'>${Subject}</a></div>"
                }, {
                    title: "<div class='text-center'>~{Status}~</div>",
                    field: "HdStatus",
                    template: "<div class='bold text-center'>${HdStatus}</div>"
                },
                {
                    title: "~{IssueType}~",
                    field: "HdProbelmType"
                },
                {
                    title: "~{Priority}~",
                    field: "HdPriority",
                    template: "#switch (HdPriority) {" +
                        "case 1: #High# break;" +
                        "case 2: #Medium# break;" +
                        "case 3: #Low# break;" +
                        "}#"
                },
                {
                    title: "~{CreatedBy}~",
                    field: "CreatedByUser"
                }
            ],
            dataBinding: function (e) {
            },
            dataBound: function (e) {
                $("div[data-argosy-view=HelpDeskGridView] th:eq(1) ,div[data-argosy-view=HelpDeskGridView]  tr td:nth-child(2)").addClass("hidden-sm hidden-xs");
                $("div[data-argosy-view=HelpDeskGridView] th:eq(5) ,div[data-argosy-view=HelpDeskGridView]  tr td:nth-child(6)").addClass("hidden-sm hidden-xs");
                $("div[data-argosy-view=HelpDeskGridView] th:eq(6) ,div[data-argosy-view=HelpDeskGridView]  tr td:nth-child(7)").addClass("hidden-sm hidden-xs");
                $("div[data-argosy-view=HelpDeskGridView] th:eq(7) ,div[data-argosy-view=HelpDeskGridView]  tr td:nth-child(8)").addClass("hidden-sm hidden-xs");
            },
            toolbar: [

               // { name: "delete", text: "<i class='fa fa-trash-o'></i> <span class='resp-hidden'>Delete</span>" }
            ],
            search: [
                { name: "Subject", type: "text", placeholder: "~{Subject}~", toolbar: false },
                { name: "TicketNo", type: "text", placeholder: "~{TicketNumber}~", toolbar: false },
                { name: "Keyword", type: "text", placeholder: "~{SearchBySubjectStatusPriority}~", toolbar: true },
                {
                    name: "HdStatusId", type: "select", toolbar: true, autoSubmit: true, data: HDTicketStatuses
                },
                {
                    name: "HdProblemTypeId", type: "select", toolbar: true, autoSubmit: true, data: HDIssueTypes
                },
                { name: "HdUserName", type: "text", placeholder: "~{CreatedBy}~", toolbar: false },
                { name: "TicketCreatedDateStart", type: "date", placeholder: "~{From}~", toolbar: false },
                { name: "TicketCreatedDateEnd", type: "date", placeholder: "~{To}~", toolbar: false }
                
            ]
        };
        $(that.options.gridViewSelector).kendoArgosyGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoGrid();
        grid.dataSource.read();
        grid.refresh();
    }
};

HelpDeskGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = that.options;
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetHelpDeskTickets",
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

HelpDeskGridView.prototype.dataSourceOpts = {};

HelpDeskGridView.prototype.getStatus = function () {
};
