$(document).ready(function () {
});

function userUpdate() {
    var btnClicked = false;
    var message = {
        question: "~{msgDetailsUpdate}~",
        //description: "",
        button: "update",
        type: "warning",
        yes: function (e) {
            if (!btnClicked) {
                $("form.update-user")[0].submit();
                $.fancybox.close();
            }
        }
    };
    prompt.alert(message);
}