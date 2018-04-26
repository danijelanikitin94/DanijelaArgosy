$(function() {
    $(document).bind(argosyEvents.REGISTRATION_FIRED, function (e) {
        block($('#userRegForm'), "Registering....");
    });
});