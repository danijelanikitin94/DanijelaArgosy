function ApproveAll() {
    alert("Approve All");
};
function ApprovePricing() {
    alert("Approve Pricing");
};
function ApproveArtwork() {

    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function (e) {
            $.fancybox.close();
            $(document).trigger(argosyEvents.START_LOADING, { element: $('#wrapcontainer'), message: "~{MsgApprovingArtWork}~" });
            var revisionId = $("input:hidden[name='RevisionId']").val();
            var params = { revisionId: revisionId };
            $.ajax({
                url: '/Tools/ProjectRevisions/ApproveArtWork',
                type: "POST",
                data: JSON.stringify(params),
                dataType: "json",
                traditional: true,
                contentType: "application/json; charset=utf-8",
                success: function (result) {
                    if (!result.IsError) {
                        $(document).trigger(argosyEvents.END_LOADING, { element: $('#wrapcontainer'), message: "~{MsgApprovingArtWork}~" });
                        prompt.notify(result.Message);
                        $("#_projectRevForm").attr("action", "/Projects/GetRevision");
                        if ($("#_projectRevForm").validate()) {
                            $("#_projectRevForm").submit();
                        }
                    } else {
                        prompt.clientResponseError(result.Message);
                    }
                }
            });
        }
    };
    message.question = "Are you sure you want to approve artwork?";
    message.button = "Approve";
    prompt.alert(message);
};

function ApprovePricing() {

    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function (e) {
            $.fancybox.close();
            $(document).trigger(argosyEvents.START_LOADING, { element: $('#wrapcontainer'), message: "~{MsgApprovingPricing}~" });
            var revisionId = $("input:hidden[name='RevisionId']").val();
            var params = { revisionId: revisionId };
            $.ajax({
                url: '/Tools/ProjectRevisions/ApprovePricing',
                type: "POST",
                data: JSON.stringify(params),
                dataType: "json",
                traditional: true,
                contentType: "application/json; charset=utf-8",
                success: function (result) {
                    if (!result.IsError) {
                        $(document).trigger(argosyEvents.END_LOADING, { element: $('#wrapcontainer'), message: "~{MsgApprovingPricing}~" });
                        prompt.notify(result.Message);
                        $("#_projectRevForm").attr("action", "/Projects/GetRevision");
                        if ($("#_projectRevForm").validate()) {
                            $("#_projectRevForm").submit();
                        }
                    } else {
                        prompt.clientResponseError(result.Message);
                    }
                }
            });
        }
    };
    message.question = "Are you sure you want to approve revision pricing?";
    message.button = "Approve";
    prompt.alert(message);
};

function ApproveAll() {

    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function (e) {
            $.fancybox.close();
            $(document).trigger(argosyEvents.START_LOADING, { element: $('#wrapcontainer'), message: "~{MsgApprovingRevision}~" });
            var revisionId = $("input:hidden[name='RevisionId']").val();
            var params = { revisionId: revisionId };
            $.ajax({
                url: '/Tools/ProjectRevisions/ApproveAll',
                type: "POST",
                data: JSON.stringify(params),
                dataType: "json",
                traditional: true,
                contentType: "application/json; charset=utf-8",
                success: function (result) {
                    if (!result.IsError) {
                        $(document).trigger(argosyEvents.END_LOADING, { element: $('#wrapcontainer'), message: '~{MsgApprovingRevision}~' });
                        prompt.notify(result.Message);
                        $("#_projectRevForm").attr("action", "/Projects/GetRevision");
                        if ($("#_projectRevForm").validate()) {
                            $("#_projectRevForm").submit();
                        }
                    } else {
                        prompt.clientResponseError(result.Message);
                    }
                }
            });
        }
    };
    message.question = "Are you sure you want to approve revision?";
    message.button = "Approve";
    prompt.alert(message);
};

function saveUserComment(btn) {
    $(document).trigger(argosyEvents.START_LOADING, { element: $('#wrapcontainer'), message: "~{MsgAddingComments}~" });
    var revisionId = $(btn).attr("Revisionid");
    var comment = $("#newComment").val();
    if (comment != '') {
        var params = { comment: comment, lastRevision: revisionId };
        $.ajax({
            url: '/Tools/Projects/AddComment',
            type: "POST",
            data: JSON.stringify(params),
            dataType: "json",
            traditional: true,
            contentType: "application/json; charset=utf-8",
            success: function(result) {
                if (result.ReturnCode == ReturnCode.Success) {
                    $("#newComment").val("");
                    prompt.notify({
                        question: "Your comment was " + (!this.Value ? "" : "not") + " successfully added.",
                        type: (!this.Value ? "success" : "error")
                    });
                    $.fancybox.close();
                } else {
                    prompt.clientResponseError(result);
                    $.fancybox.close();
                }
                var grid = $("table[data-argosy-view=ProjectRevisionCommentsGridView]").getKendoGrid();
                grid.dataSource.read();
                grid.refresh(true);
                $(document).trigger(argosyEvents.END_LOADING, { element: $('#wrapcontainer'), message: "~{MsgAddingComments}~" });
            }
        });
    } else {
        prompt.notify({
            question: "~{MsgWriteComment}~",
            type: "error"
        });
    }

}

function CancelProject() {
    var message = {
        question: "",
        description: "",
        button: "",
        type: "warning",
        yes: function (e) {
            $.fancybox.close();
            $(document).trigger(argosyEvents.START_LOADING, { element: $('#wrapcontainer') });
            var projectId = $("input:hidden[name='ProjectId']").val();
            $.ajax({
                url: '/Tools/Projects/CancelProject',
                type: "POST",
                data: JSON.stringify({ projectId: projectId }),
                dataType: "json",
                traditional: true,
                contentType: "application/json; charset=utf-8",
                success: function (result) {
                    if (!result.IsError) {
                        $(document).trigger(argosyEvents.END_LOADING, { element: $('#wrapcontainer') });
                        window.location = "/Tools/Projects"
                    } else {
                        prompt.clientResponseError(result.Message);
                    }
                }
            });
        },
        no: function (e) {
            $.fancybox.close();
        } 
    };
    message.question = "Are you sure you want to cancel this project?";
    message.button = "Cancel";
    prompt.alert(message);
}
