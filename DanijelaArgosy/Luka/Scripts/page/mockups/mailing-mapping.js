function placeholder(element) {
    return $("<li class='list-item' id='placeholder'>Drop Here!</li>");
}

$("#btnSample").on('click', function () {
    $("#divSampleData").show("slow");
    $("#btnSample").hide();
});

$(document).ready(function () {
    $("#sortable-list_FullName").kendoSortable({
        connectWith: "#sortable-list_Unmapped, #sortable-list_Company, #sortable-list_Address1, #sortable-list_Address2, #sortable-list_Address3, #sortable-list_City, #sortable-list_State, #sortable-list_ZipCode, #sortable-list_Interest",
        placeholder: placeholder
    });

    $("#sortable-list_Company").kendoSortable({
        connectWith: "#sortable-list_Unmapped, #sortable-list_FullName, #sortable-list_Address1, #sortable-list_Address2, #sortable-list_Address3, #sortable-list_City, #sortable-list_State, #sortable-list_ZipCode, #sortable-list_Interest",
        placeholder: placeholder
    });

    $("#sortable-list_Address1").kendoSortable({
        connectWith: "#sortable-list_Unmapped, #sortable-list_FullName, #sortable-list_Company, #sortable-list_Address2, #sortable-list_Address3, #sortable-list_City, #sortable-list_State, #sortable-list_ZipCode, #sortable-list_Interest",
        placeholder: placeholder
    });

    $("#sortable-list_Address2").kendoSortable({
        connectWith: "#sortable-list_Unmapped, #sortable-list_FullName, #sortable-list_Company, #sortable-list_Address1, #sortable-list_Address3, #sortable-list_City, #sortable-list_State, #sortable-list_ZipCode, #sortable-list_Interest",
        placeholder: placeholder
    });

    $("#sortable-list_Address3").kendoSortable({
        connectWith: "#sortable-list_Unmapped, #sortable-list_FullName, #sortable-list_Company, #sortable-list_Address1, #sortable-list_Address2, #sortable-list_City, #sortable-list_State, #sortable-list_ZipCode, #sortable-list_Interest",
        placeholder: placeholder
    });

    $("#sortable-list_City").kendoSortable({
        connectWith: "#sortable-list_Unmapped, #sortable-list_FullName, #sortable-list_Company, #sortable-list_Address1, #sortable-list_Address2, #sortable-list_Address3, #sortable-list_State, #sortable-list_ZipCode, #sortable-list_Interest",
        placeholder: placeholder
    });

    $("#sortable-list_State").kendoSortable({
        connectWith: "#sortable-list_Unmapped, #sortable-list_FullName, #sortable-list_Company, #sortable-list_Address1, #sortable-list_Address2, #sortable-list_Address3, #sortable-list_City, #sortable-list_ZipCode, #sortable-list_Interest",
        placeholder: placeholder
    });

    $("#sortable-list_ZipCode").kendoSortable({
        connectWith: "#sortable-list_Unmapped, #sortable-list_FullName, #sortable-list_Company, #sortable-list_Address1, #sortable-list_Address2, #sortable-list_Address3, #sortable-list_City, #sortable-list_State, #sortable-list_Interest",
        placeholder: placeholder
    });
    $("#sortable-list_Interest").kendoSortable({
        connectWith: "#sortable-list_Unmapped, #sortable-list_FullName, #sortable-list_Company, #sortable-list_Address1, #sortable-list_Address2, #sortable-list_Address3, #sortable-list_City, #sortable-list_State",
        placeholder: placeholder
    });
    $("#sortable-list_Unmapped").kendoSortable({
        connectWith: "#sortable-list_FullName, #sortable-list_Company, #sortable-list_Address1, #sortable-list_Address2, #sortable-list_Address3, #sortable-list_City, #sortable-list_State, #sortable-list_ZipCode, #sortable-list_Interest",
        placeholder: placeholder
    });
});

$("#grid_sample").kendoGrid({
    dataSource: {
        type: "odata",
        transport: {
            read: "https://demos.telerik.com/kendo-ui/service/Northwind.svc/Customers"
        },
        pageSize: 5
    },
    groupable: false,
    sortable: true,
    selectable: true,
    scrollable: false,
    pageable: false,
    columns: [{
        template: "Brian",
        title: "First Name"
    }, {
        template: "L.",
        title: "Middle Initial"
    }, {
        template: "Smith",
        title: "Last Name"
    }, {
        template: "ABC Company",
        title: "Company"
    }, {

        template: "2400 Main Street",
        title: "Address"

    }, {

        template: "Townsville",
        title: "City"
    }, {

        template: "TX",
        title: "State"

    }, {

        template: "54321",
        title: "Zip"

    }, {
        template: "Football",
    title: "Customer Hobby"
}]
});