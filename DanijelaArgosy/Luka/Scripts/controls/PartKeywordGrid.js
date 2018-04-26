function PartKeywordGrid(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.setupGrid({});
}

PartKeywordGrid.prototype.options = {};
PartKeywordGrid.prototype.baseOptions = {
    gridViewSelector: "div[data-argosy-view=PartKeywordGrid]",
    partId: null
};
PartKeywordGrid.prototype.setupGrid = function() {
    var that = this;
    if ($(that.options.gridViewSelector).getKendoListView() == null) {
        var opts = {
            scrollable: false,
            editable: false,
            autoBind: true,
            dataSource: that.getDataSource({}),
            groupable: false,
            sortable: true,
            exportToExcel: false,
            toolbar: [
                { name: "addKeyword", input: "text", placeholder: "~{EnterKeyword}~", text: " ~{Add}~", 'class': "fa fa-plus" }
            ],
            labelProperty: "keyword",
            title: "~{ManageKeywords}~",
            type: "list",
            remove: function (e) {
                
                that.showAddDeleteKeywordModal(e.data.keyword, that.options.partId, false);
                
            },
            addKeyword: function (e) {
                var newKeyword = $(".k-command-input-element").val();
                if (newKeyword == null || newKeyword == "") {
                    prompt.notify({
                        question: "~{InputKeywordToAdd}~",
                        type: "error"
                    });

                    $(".k-command-input-element").focus();
                    return;
                }

                 that.showAddDeleteKeywordModal(newKeyword, that.options.partId, true);
            }
        };
        $(that.options.gridViewSelector).kendoCollapseGrid(opts);
    } else {
        var grid = $(that.options.gridViewSelector).getKendoListView();
        grid.dataSource.read();
        grid.refresh();
    }
};

PartKeywordGrid.prototype.showAddDeleteKeywordModal = function (keyword, partId, addKeyword) {
    var that = this;
    var btnClicked = false;
    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function(e) {
            // this is what will happen when they click the confirm button
            if (!btnClicked) {
                that.addDeleteKeyword(keyword, partId, addKeyword);
                btnClicked = true;
            }
        },
        no:function(e) {
            $.fancybox.close();
        }
    };
    if (!addKeyword) {
        message.question = "~{WantToRemove}~ '" + keyword + "'?";
        message.description = "~{CanNotRecoverDeletedKeywords}~";
        message.button = "~{Remove}~";
        message.buttonNoHidden = false;
    } else {

        message.question = "~{WantToAddKeyword}~ '" + keyword + "'?";
        message.description = "~{KeywordWillBeAdded}~";
        message.button = "~{Add}~";
        message.buttonNoHidden = false;
    }
    prompt.alert(message);
};


PartKeywordGrid.prototype.addDeleteKeyword = function (keyword, partId, addKeyword) {
    var that = this;
    var params = { keyword: keyword, partId: partId, addKeyword: addKeyword };
    $.ajax({
        url: '/Admin/Parts/DeletePartKeyword',
        type: "POST",
        data: JSON.stringify(params),
        dataType: "json",
        traditional: true,
        contentType: "application/json; charset=utf-8",
        success: function(result) {
            if (result.ReturnCode == ReturnCode.Success) {
                $(result.Records).each(function() {
                    prompt.notify({
                        question: this.Key + " was " + (!this.Value ? "" : "not") + " successfully " + (addKeyword ? "Added" : "Deleted") + ".",
                        type: (!this.Value ? "success" : "error")
                    });
                });
                var keywords = "",
                    grid = $("div[data-argosy-control='PartKeywordGrid']").data("kendoCollapseGrid"),
                    listView = grid.getKendoListView(),
                    item;
                if (addKeyword) {
                    listView.dataSource.add({ keyword: result.Records[0].Key });
                } else {
                    $(listView.dataItems()).each(function (i, dataItem) {
                        if (dataItem.keyword === result.Records[0].Key) {
                            item = dataItem;
                        };
                    });
                    listView.dataSource.remove(item);
                };
                $.each(listView.dataItems(), function(i, dataItem) {
                    keywords += "," + dataItem.keyword;
                });
                $("#Keywords").val(keywords);
            } else {
                prompt.clientResponseError(result);
            }
            $(".k-command-input-element").val("");
        }
    });
    $.fancybox.close();
};

PartKeywordGrid.prototype.getDataSource = function(dataSourceOpts) {
    var that = this;
    $.extend(true, that.dataSourceOpts, _defaultDataSourceConfig, dataSourceOpts);
    that.dataSourceOpts.transport = {
        read: function(options) {
            var search = {
                partId: that.options.partId
            };
            // can't reference that.searchCriteria the other way
            $.extend(true, search, kendoOptionsToObject(options), that.searchCriteria);
            $.ajax({
                url: "/DataView/GetPartKeyword",
                dataType: "json",
                data: search,
                success: function (result) {
                    if (result.ReturnCode == ReturnCode.Success) {
                        options.success(result);
                    } else {
                        prompt.clientResponseError(result);
                    }
                }
            });
        }
    };
    that.dataSourceOpts.schema = {
        data: function (response) {
            var keywordObject = [];
            $(response.Records[0].Keywords).each(function(i) {
                keywordObject.push({ keyword: this });
            });
            return keywordObject;
        },
        total: function (response) {
            return response.TotalRecords;
        }
    }
    that.dataSourceOpts.pageSize = 5;
    return new kendo.data.DataSource(that.dataSourceOpts);
};

PartKeywordGrid.prototype.dataSourceOpts = {};