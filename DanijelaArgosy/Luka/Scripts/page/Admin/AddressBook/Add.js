function addAddress() {
    var btnClicked = false;
    var message = {
        question: "Do you want to add new Address?",
        button: "add",
        type: "warning",
        yes: function () {
            if (!btnClicked) {
                $("form.add-address")[0].submit();
                $.fancybox.close();
                btnClicked = true;
            }
        }
    };
    prompt.alert(message);
}

function verifyAddress() {
    if (userSettings.VerifyAddress) {
        if (parseInt($("input[id='CountryId']").val()) === 219) { // USA addresses only
            $(document).trigger(argosyEvents.VERIFY_ADDRESS);
        } else {
            addAddress();
        }
    } else {
        addAddress();
    }
}
