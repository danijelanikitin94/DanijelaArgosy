(function ($) {
    // shorten references to variables. this is better for uglification
    var kendo = window.kendo,
        ui = kendo.ui,
        Widget = ui.Widget;

    var StatementBuilder = Widget.extend({
        wrapper: null,
        currentStatement: "",
        init: function (element, options) {
            var that = this;
            // base call to initialize widget
            Widget.fn.init.call(this, element, options);
            that.wrapper = that.element;
            that._getData();
        },
        options: {
            // the name is what it will appear as off the kendo namespace(i.e. kendo.ui.MyWidget).
            // The jQuery plugin would be jQuery.fn.kendoMyWidget.
            name: "StatementBuilder",
            disabled: false,
            required: false,
            variableId: null,
            controlType: null,
            displayName: null,
            variableName: null,
            defaultStatementId: null,
            statementGroupId: null,
            fancyboxHref: null,
            templates: {
                statementWrapper: "#_StatementBuilderWrapper",
            }
        },
        getStatement: function() {
            
        },
        value: function (data) {
            var that = this;
            if (data == null) {
                return that.currentStatement;
            } else {
                // set the initial statement to the statementId passed in the data
            }
        },
        _getData: function () {
            var that = this;
            $.ajax({
                url: "/Store/Proofing/GetStatementGroup/" + that.options.statementGroupId,
                dataType: "json",
                success: function (data) {
                    that._initialize(data);
                }
            });
        },
        _initialize: function (data) {
            var that = this;
            that.data = data;
            that.element.empty();
            that.element.append(kendo.Template.compile("<a>Build ${Name}</a>")(data));
            that.element.find("a").click(function(e) {
                that.showModal();
            });
        },
        showModal: function() {
            var that = this;
            that.loadTemplates();
        },
        loadTemplates: function () {
            var that = this;
            if ($(that.options.templates.statementWrapper).length == 0) {
                controlLoader.loadTemplate("StatementBuilder",
                    function(template) {
                        if ($(that.options.templates.statementWrapper).length == 0) {
                            $(document.body).append(template);
                            that.createModal();
                        }
                    });
            } else {
                that.createModal();
            }
        },
        createModal: function() {
            var that = this;
            $(that.data.Statements).each(function(i) {
                $(this.Pieces).each(function (z) {
                    if (this.JsonValue != null) {
                        this.DataSource = eval(this.JsonValue);
                        if (this.DataSource != null && this.DataSource.length > 0 && !this.IsRequired) {
                            this.DataSource.splice(0, 0, "");
                        }
                    } else {
                        this.DataSource = null;
                    }
                });
            });
            var viewModel = kendo.observable({
                group: that.data,
                onSelectDataBound: function (e) {
                    setTimeout(function(z) {
                        var dropdownlist = e.sender;
                        dropdownlist.list.width("auto");
                        dropdownlist.element.closest(".k-dropdown").width("auto");
                        dropdownlist.select(0);
                    }, 250);
                },
                onInputChange: function (e) {
                    if (e.data.IsRequired) {
                        var val = e.sender.value();
                        if (val.toString().length > 0) {
                            e.sender.element.closest(".input-group").removeClass("has-error").addClass("has-success");
                            e.sender.element.closest(".input-group").find(".glyphicon-remove").hide();
                            e.sender.element.closest(".input-group").find(".glyphicon-ok").show();
                        } else {
                            e.sender.element.closest(".input-group").removeClass("has-success").addClass("has-error");
                            e.sender.element.closest(".input-group").find(".glyphicon-ok").hide();
                            e.sender.element.closest(".input-group").find(".glyphicon-remove").show();
                        }
                    }
                },
                getValue: function(input) {
                    var val = input.val();
                    if ($.isKendo(input)) {
                        var control = $.getKendoControl(input);
                        if (control.options.format != null) {
                            val = kendo.toString(control.value(), control.options.format);
                            if (val.substring(".00") > -1) {
                                val = val.substring(0, val.length - val.indexOf(".00"));
                            }
                        }
                    }
                    return val;
                },
                onSelectStatment: function(e) {
                    var inputs = $(e.currentTarget).closest("[data-statement-id]").find("[data-statement-input]"),
                        statement = "",
                        isError = false,
                        model = this;
                    $(inputs).each(function (i, input) {
                        input = $(input);
                        var isRequired = input.attr("data-required") === "true",
                            val = model.getValue(input);
                        if (!isError) {
                            if (isRequired && val !== null && val.trim().length > 0) {
                                statement += " " + val.trim();
                            } else if (isRequired) {
                                isError = true;
                            } else if (val != null && val.trim().length > 0) {
                                statement += " " + val.trim();
                            }
                        }
                    });
                    if (!isError) {
                        $(e.currentTarget).closest("[data-statement-id]").find(".text-danger").hide();
                        that.currentStatement = statement.trim();
                        that.element.find("a").text(that.currentStatement);
                        if (that.options.fancyboxHref != null && that.options.fancyboxHref.trim().length > 0) {
                            $.fancybox({
                                href: that.options.fancyboxHref
                            });
                        }
                    } else {
                        $(e.currentTarget).closest("[data-statement-id]").find(".text-danger").show()
                            .text("Missing required fields to use this statement.");
                    }
                }
            });
            var content = kendo.Template.compile($(that.options.templates.statementWrapper).html())(that.data);
            $.fancybox({
                content: content,
                beforeShow: function (e) {
                    var element = this.inner;
                    kendo.bind(element, viewModel);
                }
            });
        }
    });
    ui.plugin(StatementBuilder);
})(jQuery);