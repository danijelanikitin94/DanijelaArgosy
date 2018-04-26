var OrderStatuses = [
                          { value: "Open", text: "All Open", selected: true },
                          { value: "", text: "All" },
                          { value: "D", text: "Approval Denied" },
                          { value: "W", text: "Approval Pending" },
                          { value: "A", text: "Awaiting Shipment" },
                          { value: "S", text: "Back Ordered" },
                          { value: "N", text: "Batch Processing" },
                          { value: "X", text: "Canceled" },
                          { value: "C", text: "Closed" },
                          { value: "J", text: "Consolidated" },
                          { value: "Y", text: "Fast Pick Pack" },
                          { value: "U", text: "Fast Pick Pack Not Printed" },
                          { value: "F", text: "Firmed" },
                          { value: "I", text: "Invoiced" },
                          { value: "B", text: "On Hold" },
                          { value: "P", text: "Picking" },
                          { value: "E", text: "Pre Close" },
                          { value: "O", text: "Quick Ship" },
                          { value: "R", text: "Released" },
                          { value: "V", text: "Saved" },
                          { value: "Z", text: "Shipping" },
                          { value: "T", text: "Waved" }
];
var MaskedOrderStatuses = [
                          { value: "Open", text: "All Open", selected: true },
                          { value: "working", text: "Working" },
                          { value: "C", text: "Closed" },
                          { value: "D", text: "Denied" },
                          { value: "X", text: "Canceled" },
                          { value: "W", text: "Pending Approval" },
                          { value: "all", text: "All"}
];
var RMAStatuses = [
                          { value: "1", text: "Processing", selected: true },
                          { value: "2", text: "Complete" },
                          { value: "0", text: "All" }
];

var ActiveStates = [
                          { value: "Y", text: "Active", selected: true },
                          { value: "N", text: "Inactive" },
                          { value: "", text: "All" }
];

var HDTicketStatuses = [
                          { value: "1", text: "Open", selected: true },
                          { value: "2", text: "On-Hold" },
                          { value: "3", text: "Being Researched" },
                          { value: "4", text: "Close" },
                          { value: "0", text: "All" }
];
var HDIssueTypes = [
                          { value: "1", text: "Order Questions" },
                          { value: "2", text: "Report Request" },
                          { value: "3", text: "Functionality Request" },
                          { value: "4", text: "Other" },
                          { value: "5", text: "Shipping Questions" },
                          { value: "0", text: "All", selected: true }
];
var HDTicketPriority = [
                            { value: "1", text: "High" },
                            { value: "2", text: "Medium" },
                            { value: "3", text: "Low" }
];
var ProjectStatuses = [
                          { value: "0", text: "All Projects" },
                          { value: "8", text: "All Open" },
                          { value: "7", text: "All Approved" },
                          { value: "1", text: "Released" },
                          { value: "2", text: "Change Requested" },
                          { value: "3", text: "Awaiting Clients Approval" },
                          { value: "5", text: "Need Pricing Approval" },
                          { value: "6", text: "Need Artwork Approval" },
                          { value: "4", text: "Closed" }

];
var InputExtensions = [
    {value: "", text: "All"},
    { value: "32", text: ".ai" },
    { value: "2", text: ".bmp" },
    { value: "25", text: ".docx" },
    { value: "33", text: ".eps" },
    { value: "3", text: ".gif" },
    { value: "1", text: ".jpg" },
    { value: "20", text: ".mp3" },
    { value: "17", text: ".mp4" },
    { value: "7", text: ".pdf" },
    { value: "5", text: ".png" },
    { value: "29", text: ".pptx" },
    { value: "34", text: ".psd" },
    { value: "31", text: ".tif" },
    { value: "38", text: ".zip" }
];
var OutputExtensions = [
    { value: "", text: "All" },
    //{ value: "32", text: ".ai" },
    //{ value: "2", text: ".bmp" },
    { value: "25", text: ".docx" },
    { value: "33", text: ".eps" },
    //{ value: "3", text: ".gif" },
    { value: "1", text: ".jpg" },
    { value: "20", text: ".mp3" },
    { value: "17", text: ".mp4" },
    { value: "7", text: ".pdf" },
    { value: "5", text: ".png" },
    { value: "29", text: ".pptx" },
    //{ value: "34", text: ".psd" },
    //{ value: "31", text: ".tif" },
    { value: "38", text: ".zip" }
];