$(".fancybox").fancybox();


$(document).ready(function () {
    var crudServiceBaseUrl = "http://demos.telerik.com/kendo-ui/service",
        dataSource = new kendo.data.DataSource({
            transport: {
                read: {
                    url: crudServiceBaseUrl + "/MailID",
                    dataType: "jsonp"
                },
                update: {
                    url: crudServiceBaseUrl + "/MailID/Update",
                    dataType: "jsonp"
                },
                destroy: {
                    url: crudServiceBaseUrl + "/MailID/Destroy",
                    dataType: "jsonp"
                },
                create: {
                    url: crudServiceBaseUrl + "/MailID/Create",
                    dataType: "jsonp"
                },
                parameterMap: function (options, operation) {
                    if (operation !== "read" && options.models) {
                        return { models: kendo.stringify(options.models) };
                    }
                }
            },
            batch: true,
            pageSize: 20,
            schema: {
                model: {
                    id: "MailID",
                    fields: {
                        RowID: { editable: false, nullable: true },
                        FullName: {  },
                        AddressLine1: {  },
                        AddressLine2: { },
                        City: {   },
                        State: {   },
                        ZipCode: {  }
                    }
                }
            }
        });

    $("#grid").kendoGrid({
        dataSource: dataSource,
        scrollable: false,
        pageable: true,
        toolbar: ["create"],
        columns: [
            "FullName",
            { field: "AddressLine1", title: "Address Line 1"},
            { field: "AddressLine2", title: "Address Line 2"},
            { field: "City", title: "City"},
            { field: "State", title: "State"},
            { field: "ZipCode", title: "ZIP Code"},
            { command: ["edit", "destroy"], title: "&nbsp;", width: "200px" }],
        editable: "inline"
    });
});
