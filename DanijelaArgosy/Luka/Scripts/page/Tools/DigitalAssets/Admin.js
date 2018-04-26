$(document).ready(function (e) {
    kendo.bind($("[data-role]"));
    setupSplitter();
    setupTabs();
});

function setupTabs() {
    
}

function setupSplitter() {
    var splitter = $("[data-role=splitter]").getKendoSplitter();
    var height = $(document.body).height() - 55;
    height -= $("header").height();
    height -= $("nav").height();
    height -= $("footer").height();
    splitter.wrapper.height(height);
    splitter.resize();
}