function MessageCenterGridView(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    $(document).bind(argosyEvents.SEARCH_PAGE_GRID, function (e, data) {
        that.refineSearch(data);
    });
    that.refineSearch();
};

MessageCenterGridView.prototype.options = {};
MessageCenterGridView.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=MessageCenterGridView]"
};
MessageCenterGridView.prototype.searchCriteria = {};
MessageCenterGridView.prototype.refineSearch = function (data) {
    var that = this;
    that.searchCriteria = data;
    that.setupGrid();
};

MessageCenterGridView.prototype.setupGrid = function () {
    var that = this;
    var grid = $(that.options.gridViewSelector);
    if (grid.getKendoGrid() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            exportToExcel: false,
            pageable: {
                refresh: true,
                pageSizes: [50, 100, 500],
                buttonCount: 5
            },
            columns: [{
                title: "~{Date}~",
                field: "DateCreated",
                template: "${kendo.toString(kendo.parseDate(DateCreated),\"MM/dd/yyyy\")}",
                width: "10%"
            }, {
                title: "~{Priority}~",
                field: "Importance",
                template: "<div class='text-center'>\
                               #if (Importance == ' ' || Importance == 'L') {#\
                                   <i class='fa la fa-flag co-good'></i>\
                               #} else if(Importance == 'M') {#\
                                   <i class='fa la fa-flag co-caution'></i>\
                               #} else if(Importance == 'H') {#\
                                   <i class='fa la fa-flag co-warning'></i>\
                               #} else if(Importance == 'P') {#\
                                   <i class='fa la fa-exclamation-triangle'></i>\
                               #} else {#\
                                   <i class='fa la fa-flag'></i>\
                               #}#\
                           </div>",
                width: "5%"
            }, {
                title: "~{Subject}~",
                field: "Subject",
                template: "<a onclick='showMessage(this); return false;' href=''\
                              data-title='${Subject}'\
                              data-description='${Description}'\
                              data-sender='${FirstName} ${LastName}'\
                              data-message-id='${CreatedBy}'\
                              data-date='${kendo.toString(kendo.parseDate(DateCreated),\"MM/dd/yyyy\")}'>${Subject}</a>",
                width: "50%%"
            }, {
                title: "~{From}~",
                template: "${FirstName} ${LastName}",
                width: "30%%"
            }],
            search: [
                { name: "MessageKeywords", type: "text", placeholder: "~{SearchBySubjectContentSender}~", toolbar: true }
            ]
        };
        if (that.options.adminGridView === true) {
            opts.selectable = "multiple, row";
            opts.columns.push({
                title: " ",
                template: "<div class='text-center'><i class='fa la fa-trash-o'></i></div>",
                width: "5%"
            });
            opts.checkboxes = true;
            opts.dataBound = function(e) {
                var gridElement = $(e.sender.element);
                var grid = gridElement.getKendoGrid();
                gridElement.find("tbody tr[role=row]").each(function() {
                    var data = grid.dataItem(this);
                    $(this).find(".fa.la.fa-trash-o").parent().unbind("click").click(function() {
                        that.DeleteMessageModal([data]);
                    });
                    $(this).find(".fa.la.fa-envelope").parent().unbind("click").click(function() {
                        showMessage(data);
                    });
                });
                gridElement.find(".k-button.k-button-icontext.k-grid-deleteMessage").unbind("click").click(function() {
                    that.DeleteMessageModal(that.getSelectedItems());
                });
            };
            opts.toolbar = [
                { name: "deleteMessage", text: "<i class='fa fa-trash-o'></i><span class='resp-hidden'> ~{Remove}~</span>" }
            ];
        } else {
            opts.selectable = false;
            opts.checkboxes = false;
            opts.dataBound = function() {
                $("div[data-argosy-view=MessageCenterGridView] th:eq(4) ,div[data-argosy-view=MessageGridView]  tr td:nth-child(5)").addClass("hidden-sm hidden-xs");
            };
        }
        grid.kendoArgosyGrid(opts);
    } else {
        grid.getKendoGrid().dataSource.read();
    }
};

MessageCenterGridView.prototype.DeleteMessageModal = function (userMessages) {
    var that = this;
    var btnClicked = false;
    var message = {
        question: "~{WantToRemoveSelection}~",
        description: "~{CanNotRestoreDeletedMessages}~.",
        button: "Delete",
        type: "warning",
        yes: function () {
            if (!btnClicked) {
                that.DeleteMessage(userMessages);
                btnClicked = true;
            }
        }
    };
    prompt.alert(message);
};

MessageCenterGridView.prototype.DeleteMessage = function (messages) {
    var that = this;
    var params = {
        messages: messages
    };
    $.ajax({
        url: "/Admin/Messages/Delete/",
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result.ReturnCode === ReturnCode.Success) {
                $(result.Records).each(function () {
                    prompt.notify({
                        question: "Message " + this.Key + " was " + (!this.Value ? "" : "not") + " successfully deleted.",
                        type: (!this.Value ? "success" : "error")
                    });
                });
            } else {
                prompt.clientResponseError(result);
            }
            $(that.options.gridViewSelector).getKendoGrid().dataSource.read();
        }
    });
    $.fancybox.close();
}

MessageCenterGridView.prototype.getSelectedItems = function () {
    var that = this;
    var selectedItems = [];
    var grid = $(that.options.gridViewSelector).getKendoGrid();
    $(grid.select()).each(function () {
        selectedItems.push(grid.dataItem(this));
    });
    return selectedItems;
};

MessageCenterGridView.prototype.getDataSource = function (dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function (options) {
            var search = {};
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria, that.options);
            $.ajax({
                url: "/DataView/GetMessages",
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
    return new kendo.data.DataSource(that.dataSourceOpts);
};

MessageCenterGridView.prototype.dataSourceOpts = {};

MessageCenterGridView.prototype.getStatus = function () {
};
