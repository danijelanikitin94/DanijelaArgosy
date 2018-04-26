$(document).ready(function () {

    $("#grid_cass").kendoGrid({
        dataSource: {
            type: "odata",
            transport: {
                read: "https://demos.telerik.com/kendo-ui/service/Northwind.svc/Customers"
            },
            pageSize: 5
        },
        groupable: false,
        sortable: true,
        selectable: false,
        scrollable: false,
        pageable: false,
        columns: [{
            template: "Anna Jackson",
            title: "Full Name"
        }, {

            template: "123 Any Street Street<br />Suite 123<br />Townsville Texas 54321",
            title: "Uploaded Address"

        }, {

            template: "123 Any Street ST<br />Ste 123<br />Townsville TX 54321-0123",
            title: "Corrected Address"

        }, {

            template: "<a id='checkbox_click'><i id='checkbox_status' class='fa fa-square-o'></i><a>",
            width: "150px",
            title: "Keep Original"

        }],
    });

   

    $("#checkbox_click").on('click', function (e) {
      
        if ($("#checkbox_status").hasClass("fa-square-o")) {
            $("#checkbox_status").removeClass("fa-square-o").addClass('fa-check-square-o');
        }
        else {
            $("#checkbox_status").removeClass("fa-check-square-o").addClass("fa-square-o");
        }
    });
});
