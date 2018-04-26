function saveGlobalProfile() {
    var clicked = false;
    var message = {
        question: "~{SaveGlobalProfile}~",
        button: "~{Save}~",
        type: "warning",
        yes: function (e) {
            if (!clicked) {
                GlobalFormsDataStructView.prototype.saveGlobalProfileDetails();
            }
            clicked = true;
            $.fancybox.close();
        }
    };
    prompt.alert(message);
}

function showNewGlobalProfileModal() {
    $.fancybox({
        href: "#NewGlobalProfileModal"
    });
}