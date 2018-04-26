(function($) {

    // shorten references to variables. this is better for uglification var kendo = window.kendo,
    var ui = kendo.ui;
    var Widget = ui.Widget;

    var CustomGrid = Widget.extend({
        init: function (element, options) {
            var that = this;
            // base call to widget initialization
            Widget.fn.init.call(this, element, options);
            that.setupCheckBoxes(options);
            that.setupDataBoundEvent(options);
            that.setupChangeEvent(options);
            $(element).kendoGrid(options);
            that.kendoGrid = $(element).getKendoGrid();
            that.overrideSelectFunctionality();
        }, 

        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "CustomGrid",
            // other options go here
        }, 

        setupCheckBoxes: function (options) {
            var that = this;
            if (options.checkboxes) {
                var checkBoxColumn = {
                    template: that.rowCheckboxTemplate,
                    headerTemplate: that.headerCheckboxTemplate,
                    width: 4
                };
                options.columns.splice(0, 0, checkBoxColumn);
            }
        },

        overrideSelectFunctionality: function() {
            var that = this;
            if (that.kendoGrid.selectable != undefined) {
                that.kendoGrid.selectable.userEvents.unbind("start");
                that.kendoGrid.selectable.userEvents.unbind("move");
                that.kendoGrid.selectable.userEvents.unbind("end");
                that.kendoGrid.selectable.userEvents.unbind("select");
            }
        },

        setupChangeEvent: function (options) {
            var that = this;
            var originalChangeEvent = null;
            if (options.change != null) {
                originalChangeEvent = options.change;
            }

            options.change = function (e) {
                that.updateSelectAllCheckbox(e);
                if (originalChangeEvent != null) {
                    originalChangeEvent(e);
                }
            };
        },

        setupDataBoundEvent: function (options) {
            var that = this;
            var originalDataBoundEvent = null;
            if (options.dataBound != null) {
                originalDataBoundEvent = options.dataBound;
            }

            options.dataBound = function (e) {
                that.configureSelectAllCheckbox();
                that.configureSelectRowCheckbox();
                if (originalDataBoundEvent != null) {
                    originalDataBoundEvent(e);
                }
            };
        },

        configureSelectRowCheckbox: function () {
            var that = this;
        },

        handleRowChangeEvent: function (event) {
        },
        updateSelectAllCheckbox: function (event) {
            var that = this;
            var selectAllElement = that.kendoGrid.thead.find("i.grid-select-all");
            if (selectAllElement.is(":visible")) {
                var allSelected = true;
                that.kendoGrid.tbody.find("tr[role=row]").each(function (i) {
                    if (!$(this).hasClass("k-state-selected")) {
                        allSelected = false;
                    }
                });
                if (allSelected && !selectAllElement.hasClass("fa-check-square-o")) {
                    selectAllElement.addClass("fa-check-square-o");
                    selectAllElement.removeClass("fa-square-o");
                } else if (!allSelected && selectAllElement.hasClass("fa-check-square-o")) {
                    selectAllElement.removeClass("fa-check-square-o");
                    selectAllElement.addClass("fa-square-o");
                }
            }
        },

        configureSelectAllCheckbox: function () {
            var that = this;
            var selectAllElement = that.kendoGrid.thead.find("i.grid-select-all");
            if (that.kendoGrid.options != null && that.kendoGrid.options.selectable != null) {
                if (that.kendoGrid.options.selectable.toString().toLowerCase().indexOf("multiple") > -1) {
                    selectAllElement.unbind("click");
                    selectAllElement.click(function(e) {
                        var element = $(this);
                        if (element.hasClass("fa-square-o")) {
                            element.addClass("fa-check-square-o");
                            element.removeClass("fa-square-o");
                            that.kendoGrid.tbody.find("tr[role=row]").each(function(i) {
                                if (!$(this).hasClass("k-state-selected")) {
                                    that.kendoGrid.select(this);
                                }
                            });
                        } else {
                            element.removeClass("fa-check-square-o");
                            element.addClass("fa-square-o");
                            that.kendoGrid.clearSelection();
                        }
                    });
                } else {
                    selectAllElement.hide();
                }
            }
        },

        rowCheckboxTemplate: '<i class="fa fa-square-o grid-select-row"></i>',
        headerCheckboxTemplate: '<i class="fa fa-square-o grid-select-all"></i>'
        });

    ui.plugin(CustomGrid);
    })(jQuery);