function UserCoopFundsGrid(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    var controlLoader = new ControlLoader();
    
    that.options.element = $("*[data-argosy-uuid='" + that.options.uuid + "']");
    controlLoader.loadControl("ModalCoopBucketDetail", {}, function (control) {
        that.bucketDetailControl = control;
    });
    controlLoader.loadTemplate("UserCoopFunds", function (template) {
        $(document.body).append(template);
        that.setupViewModel();
        var html = $(that.options.baseTemplate).html();
        that.options.element.append(kendo.template(html));
        kendo.bind($(that.options.bindContainer), that.options.viewModel);
    });
}

UserCoopFundsGrid.prototype.options = {
    element: null,
    companyId: 0,
    userId: 0,
    userGroupId: null,
    viewModel: null,
    isAdmin: false,
    controllerName: "",
    actionName : ""
};

UserCoopFundsGrid.prototype.baseOptions = {
    baseTemplate: "#_userCoopFundsMainTemplate",
    bindContainer: "#_userCoopFundsContainer",
    toolbar: "#_userCoopFundsToolbar",
    gridViewSelector: "div[data-argosy-view=UserCoopFundsGrid]",
    keyword: "#_coopFundsKeyword",
    toolbarTemplate: "#toolbarTemplate",
    userBalance: ""
};

UserCoopFundsGrid.prototype.bucketDetailControl = null;

UserCoopFundsGrid.prototype.searchCriteria = {
    userId: 0,
    userGroupId: 0,
    companyId: 0,
    bucketId: null,
    keyword: ""
};

UserCoopFundsGrid.prototype.setupViewModel = function() {
    var that = this;

    that.options.viewModel = kendo.observable({
        userId: that.options.userId,
        userGroupId: that.options.userGroupId,
        companyId: that.options.companyId,
        currentBucket: new kendo.data.ObservableObject({
            Name: "",
            Id: null,
            Details: [],
            PartIds: []
        }),
        keyword: "",
        transactions: new kendo.data.DataSource({
            pageSize: 50,
            schema: {
                data: function (response) {
                    return response.Records;
                },
                total: function (response) {
                    return response.TotalRecords;
                }
            },
            serverFiltering: true,
            serverSorting: true,
            serverPaging: true,
            transport: {
                read: {
                    url: "/DataView/GetFunds",
                    contentType: "application/json",
                    dataType: "json",
                    method: "POST"
                },
                parameterMap: function (data) {

                    data = kendoOptionsToObject(data);
                    data.UserId = that.options.viewModel.get("userId");
                    data.UserGroupId = that.options.viewModel.get("userGroupId");
                    data.BucketId = that.options.viewModel.currentBucket.get("Id");
                    data.Keyword = that.options.viewModel.get("keyword");
                    return JSON.stringify(data);
                }
            }
        }),
        buckets: new kendo.data.DataSource({
            pageSize: 25,
            schema: {
                data: function (response) {
                    return response.Records;
                },
                total: function (response) {
                    return response.TotalRecords;
                },
                model: {
                    id: "Id"
                }
            },
            serverFiltering: true,
            serverSorting: true,
            serverPaging: true,
            transport: {
                read: {
                    url: "/coop/GetAvailableBuckets",
                    contentType: "application/json",
                    dataType: "json"
                },
                parameterMap: function (data) {
                    data = kendoOptionsToObject(data);
                    data.CompanyId = that.options.viewModel.get("companyId");
                    return data;
                }
            }
        }),
        funds: new kendo.data.DataSource({
            pageSize: 25,
            schema: {
                data: function (response) {
                    return response.Records;
                },
                total: function (response) {
                    return response.TotalRecords;
                },
                model: {
                    id: "Id"
                }
            },
            serverFiltering: true,
            serverSorting: true,
            serverPaging: true,
            transport: {
                read: {
                    url: "/DataView/GetUserBalances",
                    contentType: "application/json",
                    dataType: "json"
                },
                parameterMap: function (data) {

                    data = kendoOptionsToObject(data);
                    data.UserId = that.options.viewModel.get("userId");
                    data.UserGroupId = that.options.viewModel.get("userGroupId");
                    return data;
                }
            }
        }),
        transactionsDataBound: function (e) {
            kendo.bind($(that.options.toolbar), e.data);
        },
        searchCoopFunds: function (e) {
            e.data.transactions.read();
        },
        toolbarText: function() {
            var text;

            if (that.options.viewModel.currentBucket != null) {
                text = that.options.viewModel.currentBucket.get("Name") + " <b>" +
                    kendo.toString(that.options.viewModel.currentBucket.get("BalanceForUser"), "c") + "</b> ";
            } else {
                text = that.options.userBalance;
            };
            text += " <a class='marl10' data-bind='events: { click: viewAllDetails }'><i class='fa fa-eye'></i> View details</a>";
            var parts = window.location.pathname.split("/");
            if ((userSettings.IsAdmin && parts[1].toLowerCase() === "admin") || parts[2].toLowerCase() === "employees") {
                text += "<a class='marl10' data-bind='events: { click: addCoopFunds }'><i class='fa fa-plus'></i> ~{AddCoopFunds}~</a>";
            };
            return text;
        },
        viewAllDetails: function () {
            $.fancybox({
                href: "#_userCoopBucketDetails",
                maxWidth: 400
            });
        },
        addCoopFunds: function() {
            showAddCoOpFundsModal();
        },
        showBucketDetails: function (e) {
            var bucket = $(e.currentTarget),
                bucketId = bucket.data("id");

            that.bucketDetailControl.show(bucketId);
        },
        showSearch: function () {
            switch(that.options.actionName) {
                case "Edit":
                    return false;
                case "CoopDollars":
                    return true;
                default:
                    return false;
            }
        }
    });
};

UserCoopFundsGrid.prototype.dataSourceOpts = {};