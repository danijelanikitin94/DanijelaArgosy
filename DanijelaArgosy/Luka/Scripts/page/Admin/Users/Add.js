function addUser() {
    var btnClicked = false;
    var message = {
        question: "Do you want to add new user details?",
        button: "add",
        type: "warning",
        yes: function (e) {
            if (!btnClicked) {
                $("form.add-user")[0].submit();
                $.fancybox.close();
                btnClicked = true;
            }
        }
    };
    prompt.alert(message);
}