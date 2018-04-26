function PersonalizedProofCollectionDetails(opts) {
    var that = this;
    var controlLoader = new ControlLoader();
    $.extend(true, that.options, that.baseOptions, opts);
    controlLoader.loadTemplate("PersonalizedProofCollectionDetails", function (template) {
        $(document.body).append(template);
    });
    if (!that.options.templateLoaded) {
        $("*[data-argosy-uuid=" + that.options.uuid + "]").append($(that.options.templates.baseTemplate).html());
        that.options.templateLoaded = true;
    };
    $(document)
        .bind(argosyEvents.SELECT_ALL_PERSONALIZED_PROOF_COLLECTION_ITEMS, function (e, data) {
            that.selectAll(data);
        })
        .bind(argosyEvents.REORDER_SELECTED_PERSONALIZED_PROOF_COLLECTION_ITEMS, function () {
            that.reorderSelectedOrderPartGroupItems();
        })
        .bind(argosyEvents.SHOW_PERSONALIZED_PROOF_COLLECTION_DETAILS, function (e, obj) {
            that.show(obj.partNumber,obj.customMsg);
        });
}

PersonalizedProofCollectionDetails.prototype.options = {
    viewModel: null
};

PersonalizedProofCollectionDetails.prototype.baseOptions = {
    templateLoaded: false,
    templates: {
        baseTemplate: "#_PersonalizedProofCollectionDetailsModal",
        innerTemplate: "#_PersonalizedProofCollectionDetails"
    }
};

PersonalizedProofCollectionDetails.prototype.show = function (partNumber,customMsg) {
    var that = this;
    getPart(parseInt(partNumber), function (part) {
        var locations = location.pathname.split("/"),
            controller = locations[2],
            html = $(that.options.templates.baseTemplate).html();
        if (controller === "Library") {
            html = html.replace('data-selectable="single"', 'data-selectable="false"');
        };
      
        var combinedPart =_.assign({'CustomMsg':customMsg},part);
        var fancyContent = kendo.Template.compile(html)(combinedPart);
        $.fancybox({
            content: fancyContent,
            beforeShow: function () {
                $(document).trigger(argosyEvents.START_LOADING, { name: that.constructor.name });
                that.options.viewModel = kendo.observable({
                    keyword: "",
                    dataSource: new kendo.data.DataSource({
                        error: function (e) {
                            console.log("Error in datasource see below:");
                            console.log(e);
                        },
                        schema: {
                            data: function (response) {
                              return response.Records;
                            },
                            total: function (response) {
                                if (response.Records === null) return 0;
                                return response.Records.length;
                            }
                        },
                        transport: {
                            read: {
                                url: "/DataView/GetPersonalizedProofCollectionDetails",
                                dataType: "json",
                                type: "GET",
                                data: function () {
                                    return {
                                        Keyword: that.options.viewModel.keyword,
                                        PartNumber: part.PartId
                                    };
                                }
                            }
                        },
                        requestEnd: function (e) {
                            setTimeout(function () {
                                addArgosyActions($("*[data-argosy-uuid=" + that.options.uuid + "]"));
                            }, 250);
                            $(document).trigger(argosyEvents.END_LOADING);
                        }
                    }),
                    searchPersonalizedProofCollectionDetails: function () {
                        $(document).trigger(argosyEvents.START_LOADING, { name: that.constructor.name });
                        this.dataSource.read();
                        $(document).trigger(argosyEvents.END_LOADING);
                    },
                    selectAll: function (data) {
                        var checked = $(data.currentTarget).is(':checked');
                        if (checked) {
                            $("input:checkbox").each(function () {
                                this.checked = true;
                            });
                        } else {
                            $("input:checkbox").each(function () {
                                this.checked = false;
                            });
                        }
                    },
                    reorderSelectedPersonalizedProofCollectionItems: function () {
                        var that = this,
                            url = "/Account/Library/ReorderSelectedPersonalizedProofCollectionItems",
                            successfulReorder = false,
                            lineIds = [],
                            dataSource = that.get("dataSource");
                        $("#personalizedProofCollectionItems input:checked").each(function () {
                            for (var i = 0; i < dataSource._data.length; i++) {
                                if (this.id === dataSource._data[i].uid) {
                                    lineIds.push(dataSource._data[i].LastLine);
                                }
                            }
                        });
                        $(document).trigger(argosyEvents.START_LOADING, { name: that.constructor.name });
                        block(null, "~{MsgReorderingProof}~");
                        $.ajax({
                            url: url,
                            dataType: "json",
                            data: JSON.stringify({ lineIds: lineIds }),
                            type: "POST",
                            contentType: "application/json; charset=utf-8",
                            success: function (e) {
                                var success = e.IsError === false,
                                    message = "~{Success}~",
                                    type = "success";
                                if (!success) {
                                    message = e.Message;
                                    type = "error";
                                } else {
                                    window.location = e.Data;
                                }
                                var promptData = {
                                    message: message,
                                    type: type
                                };
                                successfulReorder = success;
                                $(document).trigger(argosyEvents.PROMPT_NOTIFY, promptData);
                            },
                            error: function () {
                                var promptData = {
                                    message: "Unable to re-order at this time.",
                                    type: "error"
                                };
                                $(document).trigger(argosyEvents.PROMPT_NOTIFY, promptData);
                            },
                            complete: function () {
                                if (successfulReorder) {
                                    block(null, "~{MsgTransferToCart}~ ");
                                } else {
                                    unblock();
                                }
                                $(document).trigger(argosyEvents.END_LOADING);
                            }
                        });
                    },
                    dataBound: function(e) {
                        var button = $("button[data-id='selectedButton']");
                        switch (controller) {
                            case "Library":
                                button.text("~{ReorderSelected}~");
                                break;
                            case "Proofing":
                                $("label[data-id='selectAllItemsLabel']").hide();
                                $("#personalizedProofs").find("input[type='checkbox']").hide();
                                button.text("Use Selected Proof").unbind("click").click(function () {
                                    if (e.sender.select().length > 0) {
                                        var item = e.sender.select(),
                                            dataItem = e.sender.dataItem(item);
                                        $(document).trigger(argosyEvents.EVENT_UPDATE_VARIABLES_BY_LINE_ID, {orderLineId: dataItem.LastLine});
                                    };
                                });
                                break;
                        };
                        $.fancybox.update();
                    }
                });
                kendo.bind(this.wrap, that.options.viewModel);
            }
        });
    });
};