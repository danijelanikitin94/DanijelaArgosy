function showCreateScheduleModal() {
    $.fancybox({
        href: "#createScheduleModal"
    });
}

function continueToReportSelection() {
    if ($("#txtScheduleName").val().trim() == "") {
        prompt.notify({
            question: "~{SelectOneItem}~",
            type: "error"
        });
        $("#txtScheduleName").focus();
        return;
    }

    if ($("#ddlFrequency").getKendoDropDownList().value() == "") {
        prompt.notify({
            question: "~{msgRepFreq}~",
            type: "error"
        });
        $("#ddlFrequency").focus();
        return;
    }

    if ($("#ddlTimeOfDay").getKendoDropDownList().value() == "") {
        prompt.notify({
            question: "~{msgRepTime}~",
            type: "error"
        });
        $("#ddlTimeOfDay").focus();
        return;
    }

    if (!$("#divDayOftheMonth").hasClass("hide") && $("#ddlDayOfMonth").getKendoDropDownList().value() == "") {
        prompt.notify({
            question: "~{msgRepMonth}~",
            type: "error"
        });
        $("#ddlDayOfMonth").focus();
        return;
    }

    if (!$("#divDayOftheWeek").hasClass("hide") && $("#ddlWeekDays").getKendoDropDownList().value() == "") {
        prompt.notify({
            question: "~{msgRepWeek}~",
            type: "error"
        });
        $("#ddlWeekDays").focus();
        return;
    }

    ScheduledReports.prototype.continueToReports();
}

function continueToReportSchedule() {
    ScheduledReports.prototype.continueToReportSchedule();
}

function continueToUserSelection() {
    ScheduledReports.prototype.continueToUserSelection();
}

function continueToAdditionalEmail() {
    ScheduledReports.prototype.continueToAdditionalEmail();
}

function saveReportSchedule() {
    ScheduledReports.prototype.saveReportSchedule();
}

function addEmails() {
    var txtUserEmail = $("#txtUserEmail").val();
    var isValidEmail = isValidEmailAddress(txtUserEmail);

    if (!isValidEmail) {
        prompt.notify({
            question: "~{msgValidEmail}~",
            type: "error"
        });
        $("#txtUserEmail").focus();
        return;
    }
    ScheduledReports.prototype.saveAdditionalEmails(txtUserEmail);
    $("#txtUserEmail").val('');
}