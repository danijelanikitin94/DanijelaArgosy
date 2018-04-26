function CollapseBox(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);
    that.element = $("*[data-argosy-uuid=" + opts.uuid + "]");
    that.setupCollapseBox();
    that.setupAnimation();
    if (that.options.open) {
        that.show();
    } else {
        that.hide();
    }
}

CollapseBox.prototype.options = {
};

CollapseBox.prototype.baseOptions = {
    title: "No Title",
    open: false
};

CollapseBox.prototype.setupCollapseBox = function () {
    var that = this;
    that.element.addClass("summary-information");
    that.setupTitle();
};

CollapseBox.prototype.setupTitle = function () {
    var that = this;
    var headerDiv = $("<div />", {
       'class': 'collapse-box-title' 
    });
    headerDiv.append($('<h3 class="nopad"><i class="fa fa-minus-circle"></i> ' + that.options.title + '</h3>'));
    that.element.prepend(headerDiv);
};


CollapseBox.prototype.show = function () {
    var that = this;
    that.button.removeClass("fa-plus-circle").addClass("fa-minus-circle");
    $(that.element.children()).each(function () {
        var item = $(this);
        if (!item.hasClass("collapse-box-title")) {
            item.show();
        }
    });
}

CollapseBox.prototype.hide = function () {
    var that = this;
    that.button.removeClass("fa-minus-circle").addClass("fa-plus-circle");
    $(that.element.children()).each(function () {
        var item = $(this);
        if (!item.hasClass("collapse-box-title")) {
            item.hide();
        }
    });
}

CollapseBox.prototype.setupAnimation = function () {
    var that = this;
    that.button = that.element.find(".fa-minus-circle");
    that.button.unbind("click");
    that.button.click(function (e) {
        if (that.button.hasClass("fa-minus-circle")) {
            // collapse
            that.hide();
        } else {
            // show
            that.show();
        }
    });
};