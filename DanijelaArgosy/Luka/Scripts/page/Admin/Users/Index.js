$(document).ready(function (e) {
});



function showUsersHierarchyModal() {
    $(document).trigger(argosyEvents.SHOW_USER_HIERARCHY_MODAL, {
        href: "#UsersHierarchyModal"
    });
}