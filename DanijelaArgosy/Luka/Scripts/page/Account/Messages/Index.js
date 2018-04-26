function showMessage(message) {
    message = $(message);
    $("#messageTitle").text(message.data("title"));
    $("#messageContent").html(message.data("description"));
    $("#messageSender").text(message.data("sender"));
    $("#lblMessageDate").text(message.data("date"));
    $.fancybox({
        href: "#ShowMessage"
    });
};
