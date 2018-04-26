function HdTicketPriorityDropDown(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.setUpDropDown();
}
HdTicketPriorityDropDown.prototype.options = {};

HdTicketPriorityDropDown.prototype.baseOptions = {
    ddlViewSelector: "select[data-argosy-view=HdTicketPriorityDropDown]"
};

HdTicketPriorityDropDown.prototype.setUpDropDown = function () {
    var that = this;
    if ($(that.options.ddlViewSelector).getKendoDropDownList() == null) {

        $(that.options.ddlViewSelector).kendoDropDownList({
            dataSource: { data: HDTicketPriority },
            dataTextField: "text",
            dataValueField: "value"
        });

        $(that.options.ddlViewSelector).getKendoDropDownList().value(2);
    }

};
