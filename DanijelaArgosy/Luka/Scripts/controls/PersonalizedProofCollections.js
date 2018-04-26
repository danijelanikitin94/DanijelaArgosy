function PersonalizedProofCollections(opts) {
    var that = this;
    var controlLoader = new ControlLoader();
    $.extend(true, that.options, that.baseOptions, opts);
    controlLoader.loadTemplate("PersonalizedProofCollections", function (template) {
        $(document.body).append(template);
        that.options.templateLoaded = true;
        that.init();
    });
}

PersonalizedProofCollections.prototype.init = function () {
    var that = this;
    $(document).trigger(argosyEvents.START_LOADING);
    var viewModel = kendo.observable({
        keyword: "",
        dataSource: new kendo.data.DataSource({
            error: function (e) {
                console.log("Error in datasource see below:");
                console.log(e);
            },
            schema: {
                data: function (response) {
                    var data = [];
                    $.each(response.Records,function () {
                        data.push(_.assign({'CustomMsg':that.options.customMsg},this));
                    });
                    return data;
                },
                total: function (response) {
                    if (response.Records === null) return 0;
                    return response.Records.length;
                }
            },
            transport: {
                read: {
                    url: "/DataView/GetPersonalizedProofCollections",
                    dataType: "json",
                    type: "GET",
                    data: function () {
                        return {
                            Keyword: viewModel.keyword
                        };
                    }
                }
            },
            requestEnd: function () {
                setTimeout(function () {
                    addArgosyActions(that.getElement());
                }, 250);
                $(document).trigger(argosyEvents.END_LOADING);
            }
        }),
        searchPersonalizedProofCollections: function () {
            this.dataSource.read();
        }
    });
    that.getElement().append($(that.options.templates.baseTemplate).html());
    kendo.bind(that.getElement(), viewModel);
};

PersonalizedProofCollections.prototype.getElement = function () {
    var that = this;
    return $("*[data-argosy-uuid=" + that.options.uuid + "]");
};

PersonalizedProofCollections.prototype.options = {
    customMsg:''
};

PersonalizedProofCollections.prototype.baseOptions = {
    templateLoaded: false,
    templates: {
        baseTemplate: "#_PersonalizedProofCollectionsTemplate",
        innerTemplate: "#_PersonalizedProofCollections"
    }
};
