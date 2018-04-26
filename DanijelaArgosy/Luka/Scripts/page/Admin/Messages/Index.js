function addNewMessage() {
    $.fancybox({
        href: "#CreateMessage"
    });
};

function sendMessage() {
    var params = {
        subject: $("#txtSubject").val(),
        body: $("#txtMessage").val(),
        priority: $("#ddlPriority").val()
    };
    $.ajax({
        url: "/Admin/Messages/Create/",
        type: "POST",
        dataType: "json",
        traditional: true,
        data: JSON.stringify(params),
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            if (result.ReturnCode === ReturnCode.Success) {
                $(result.Data).each(function () {
                    prompt.notify({
                        question: "The message was " + (!this.Value ? "" : "not") + " successfully sent.",
                        type: (!this.Value ? "success" : "error")
                    });
                });
            } else {
                prompt.clientResponseError(result);
            }
            $("div[data-argosy-view=MessageCenterGridView]").getKendoGrid().dataSource.read();
        }
    });
    $.fancybox.close();
}

function showMessage(message) {
    message = $(message);
    $("#messageTitle").text(message.data("title"));
    $("#messageContent").text(message.data("description"));
    $("#messageSender").text(message.data("sender"));
    $("#lblMessageDate").text(message.data("date"));
    $.fancybox({
        href: "#ShowMessage"
    });
};