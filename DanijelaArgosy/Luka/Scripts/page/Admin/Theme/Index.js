$(document).ready(function () {
    $("#btnBackToEditTheme").hide();

    var addExtraStylingToGrid = function () {
        $(".k-grid table tbody tr").hover(
            function () {
                $(this).toggleClass("k-grid k-state-hover");
            }
          );
        $("table.k-focusable tbody tr").hover(
          function () {
              $(this).toggleClass("k-state-hover");
          }
        );
    };
    $("#sample_grid").kendoGrid({
        dataSource: {
            type: "odata",
            transport: {
                read: "https://demos.telerik.com/kendo-ui/service/Northwind.svc/Customers"
            },
            pageSize: 4
        },
        groupable: false,
        sortable: true,
        selectable: true,
        scrollable: false,
        dataBound: addExtraStylingToGrid,
        pageable: {
            refresh: false,
            pageSizes: false,
            buttonCount: 3
        },
        columns: [{

            title: "<div class='textl'>Date</div>",
            template: "<div class='textl'>10/25/2014</div>"
        }, {
            title: "Order #",
            template: "<div><a>DMO-2314</a></div>"
        }, {
            field: "ContactName",
            title: "User"
        }, {
            title: "Status",
            template: "<b>Open</b>"
        }, {
            title: "<div class='textr'>Total</div>",
            template: "<div class='grid-price'>$120.45</div>"

        }],

        toolbar: [
          { name: "excel", text: "<i class='fa fa-file-excel-o'></i><span class='resp-hidden'> Grid Button</span>" },

        ],
        search: [
            { name: "Order Tag", type: "text", placeholder: "Order Tag", toolbar: false },
            { name: "Keyword", type: "text", placeholder: "Search by Order Number, User or Status", toolbar: true },
            {
                name: "Status", type: "select", placeholder: "-- Status --", toolbar: true, data:
                    [

                            { value: "Y", text: "Approval Denied" },
                            { value: "N", text: "Approval Pending" },
                            { value: "", text: "Awaiting Payment" },
                            { value: "", text: "Awaiting Payment Authorization" },
                            { value: "", text: "Awaiting Shipment" },
                            { value: "", text: "Awaiting Serial Capture" },
                            { value: "", text: "Back Ordered" },
                            { value: "", text: "Batch Processing" },
                            { value: "", text: "Canceled" },
                            { value: "", text: "Closed" },
                            { value: "", text: "Consolidated" },
                            { value: "", text: "Fast Pick Pack" },
                            { value: "", text: "Fast Pick Pack Not Printed" },
                            { value: "", text: "Firmed" },
                            { value: "", text: "Invoiced" },
                            { value: "", text: "On Hold" },
                            { value: "", text: "Picking" },
                            { value: "", text: "Pre Close" },
                            { value: "", text: "Saved" },
                            { value: "", text: "Shipping" },
                            { value: "", text: "Waved" },

                    ]
            },
            { name: "Start", type: "text", placeholder: "From", toolbar: false },
            { name: "Finish", type: "text", placeholder: "To", toolbar: false },
            {
                name: "Active", type: "select", placeholder: "-- User --", toolbar: false, data:
                      [

                              { value: "Y", text: "Content" },
                              { value: "N", text: "Content" },
                      ]
            },
              {
                  name: "Active", type: "select", placeholder: "-- User Group --", toolbar: false, data:
                      [

                              { value: "Y", text: "Content" },
                              { value: "N", text: "Content" },
                      ]
              },
               { name: "IsRetail", type: "checkbox", placeholder: "Include Retail Parts", toolbar: false, checked: false },

                 { name: "Order Tag", type: "text", placeholder: "Product", toolbar: false },
                 { name: "Order Tag", type: "text", placeholder: "SKU", toolbar: false },
                 { name: "Order Tag", type: "text", placeholder: "Custom", toolbar: false },
                 { name: "Order Tag", type: "text", placeholder: "Contact", toolbar: false },
                 { name: "Order Tag", type: "text", placeholder: "Company", toolbar: false },
                 { name: "Order Tag", type: "text", placeholder: "Address", toolbar: false },
                 { name: "Order Tag", type: "text", placeholder: "City", toolbar: false },
                 {
                     name: "State", type: "select", placeholder: "-- State --", toolbar: false, data:
                            [
                                                          { value: "AL", text: "Alabama" },
                                                          { value: "AK", text: "Alaska" },
                                                          { value: "AZ", text: "Arizona" },
                                                          { value: "AR", text: "Arkansas" },
                                                          { value: "CA", text: "California" },
                                                          { value: "CO", text: "Colorado" },
                                                          { value: "CT", text: "Connecticut" },
                                                          { value: "DE", text: "Delaware" },
                                                          { value: "DC", text: "Dist of Columbia" },
                                                          { value: "FL", text: "Florida" },
                                                          { value: "GA", text: "Georgia" },
                                                          { value: "HI", text: "Hawaii" },
                                                          { value: "ID", text: "Idaho" },
                                                          { value: "IL", text: "Illinois" },
                                                          { value: "IN", text: "Indiana" },
                                                          { value: "IA", text: "Iowa" },
                                                          { value: "KS", text: "Kansas" },
                                                          { value: "KY", text: "Kentucky" },
                                                          { value: "LA", text: "Louisiana" },
                                                          { value: "ME", text: "Maine" },
                                                          { value: "MD", text: "Maryland" },
                                                          { value: "MA", text: "Massachusetts" },
                                                          { value: "MI", text: "Michigan" },
                                                          { value: "MN", text: "Minnesota" },
                                                          { value: "MS", text: "Mississippi" },
                                                          { value: "MO", text: "Missouri" },
                                                          { value: "MT", text: "Montana" },
                                                          { value: "NE", text: "Nebraska" },
                                                          { value: "NV", text: "Nevada" },
                                                          { value: "NH", text: "New Hampshire" },
                                                          { value: "NJ", text: "New Jersey" },
                                                          { value: "NM", text: "New Mexico" },
                                                          { value: "NY", text: "New York" },
                                                          { value: "NC", text: "North Carolina" },
                                                          { value: "ND", text: "North Dakota" },
                                                          { value: "OH", text: "Ohio" },
                                                          { value: "OK", text: "Oklahoma" },
                                                          { value: "OR", text: "Oregon" },
                                                          { value: "PA", text: "Pennsylvania" },
                                                          { value: "RI", text: "Rhode Island" },
                                                          { value: "SC", text: "South Carolina" },
                                                          { value: "SD", text: "South Dakota" },
                                                          { value: "TN", text: "Tennessee" },
                                                          { value: "TX", text: "Texas" },
                                                          { value: "UT", text: "Utah" },
                                                          { value: "VT", text: "Vermont" },
                                                          { value: "VA", text: "Virginia" },
                                                          { value: "WA", text: "Washington" },
                                                          { value: "WV", text: "West Virginia" },
                                                          { value: "WI", text: "Wisconsin" },
                                                          { value: "WY", text: "Wyoming" },
                            ]
                 },
                        { name: "Order Tag", type: "text", placeholder: "Zip", toolbar: false },
                               {
                                   name: "State", type: "select", placeholder: "-- Country --", toolbar: false, data:
                              [
                                                            { value: "AL", text: "United States" },
                                                            { value: "AK", text: "India" },
                                                            { value: "AZ", text: "Mexico" },
                                                            { value: "AR", text: "Canada" },
                                                            { value: "CA", text: "Dubai" },
                                                            { value: "CO", text: "Pakistan" },
                                                            { value: "CT", text: "China" },
                                                            { value: "DE", text: "Spain" },

                              ]
                               },
                       { name: "Order Tag", type: "text", placeholder: "Phone", toolbar: false },

        ]


    });
});

function backToBuildTheme() {
    $("#divExistingThemes").hide();
    $("#divBuildTheme").show();
    $("#chooseTheme").hide();
}

function setCorrespondingValues() {
    var primaryInput = $("input[data-primary-color='true']");
    var secondaryInput = $("input[data-secondary-color='true']");
    var tertiaryInput = $("input[data-tertiary-color='true']");
    var primarySpan = $("span[data-primary-color='true']");
    var secondarySpan = $("span[data-secondary-color='true']");
    var tertiarySpan = $("span[data-tertiary-color='true']");
    var primaryColorInput = $("input[id='_primaryColor']");
    var secondaryColorInput = $("input[id='_secondaryColor']");
    var tertiaryColorInput = $("input[id='_tertiaryColor']");
    primaryInput.change(function () {
        var changeValue = primaryInput.getKendoColorPicker().value();
        primaryColorInput.getKendoColorPicker().value(changeValue);
    });
    primaryColorInput.change(function () {
        var changeValue = primaryColorInput.getKendoColorPicker().value();
        primaryInput.getKendoColorPicker().value(changeValue);
        primarySpan.text(changeValue);
    });
    secondaryInput.change(function () {
        var changeValue = secondaryInput.getKendoColorPicker().value();
        secondaryColorInput.getKendoColorPicker().value(changeValue);
    });
    secondaryColorInput.change(function () {
        var changeValue = secondaryColorInput.getKendoColorPicker().value();
        secondaryInput.getKendoColorPicker().value(changeValue);
        secondarySpan.text(changeValue);
    });
    tertiaryInput.change(function () {
        var changeValue = tertiaryInput.getKendoColorPicker().value();
        tertiaryColorInput.getKendoColorPicker().value(changeValue);
    });
    tertiaryColorInput.change(function () {
        var changeValue = tertiaryColorInput.getKendoColorPicker().value();
        tertiaryInput.getKendoColorPicker().value(changeValue);
        tertiarySpan.text(changeValue);
    });
}

function updateSessionTheme() {
    var themeId = $("input:radio[name ='themegroup']:checked").val();
    $.ajax({
        url: "/Admin/Theme/UpdateSessionTheme?id=" + themeId,
        method: "GET",
        success: function (result) {
            //changeCSS(result);
        }
    });
}

function updateCompanyTheme() {
    var themeId = $("input:radio[name='themegroup']:checked").val();
    var themeName = $("label[for='" + themeId + "']").text().trim().replace("(default)", "");
    var currentTheme = $("#currentTheme");
    $.ajax({
        url: "/Admin/Theme/UpdateCompanyTheme?id=" + themeId,
        method: "GET",
        success: function (result) {
            //changeCSS(result);
            currentTheme.text(themeName);
        }
    });
}

function changeCSS(url) {
    $("#temp-stylesheet").remove();
    $("#theme-stylesheet").attr("href", url);
}
