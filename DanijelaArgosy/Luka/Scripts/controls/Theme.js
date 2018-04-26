function Theme(opts) {
    var that = this;
    var controlLoader = new ControlLoader();
    $.extend(true, that.options, opts);
    controlLoader.loadTemplate("Theme", function (template) {
        $(document.body).append(template);
    });
    $(document)
        .bind(argosyEvents.SHOW_THEME, function (e, themeId) {
            that.showTheme(themeId);
        })
        .bind(argosyEvents.SHOW_STANDARD_THEMES, function () {
            that.showStandardThemes();
        });
}

Theme.prototype.options = {
    themeTemplate: "#_ThemeTemplate"
};

Theme.prototype.showStandardThemes = function() {
    $.fancybox({
        content: $("#show_standard_themes"),
        minWidth: 350
    });
};

Theme.prototype.showTheme = function (themeId) {
    var that = this,
        themeTemplate = $(that.options.themeTemplate);
    $(document).trigger(argosyEvents.START_LOADING);
    $.ajax({
        url: "/DataView/GetTheme",
        type: "POST",
        dataType: "json",
        data: {
            themeId: themeId
        },
        success: function (result) {
            that.theme = result;
            var buildThemeDiv = $("#divBuildTheme"),
                content = kendo.Template.compile(themeTemplate.html())(that.theme),
                viewModel = kendo.observable({
                    theme: that.theme,
                    createdThemes: $("#CreatedThemes"),
                    colorPickerSelect: function (e) {
                        var span = $(e.sender.element.parent().parent().children()[1]);
                        span.text(e.value.toUpperCase()).removeClass("hidden");
                    },
                    showExistingThemes: function () {
                        $("#divBuildTheme").hide();
                        $("#divExistingThemes").show();
                        $("#btnBackToEditTheme").show();
                        $("#chooseTheme").show();
                    },
                    updateListItem: function (item, theme) {
                        var vm = this,
                            radio = item.find("[name=themegroup]"),
                            primary = item.find("[name=primary]"),
                            secondary = item.find("[name=secondary]"),
                            tertiary = item.find("[name=tertiary]"),
                            nameElement = item.find(".tc-name"),
                            editLink = item.find("a");
                        item.prop("id", theme.Id);
                        editLink.attr("data-argosy-dataid", theme.Id);
                        var editLinkIcon = editLink.find("i");
                        editLinkIcon.attr("data-id", theme.Id);
                        editLinkIcon.click(function () {
                            $(document).trigger(argosyEvents.SHOW_THEME, theme.Id);
                        });
                        radio.prop("value", theme.Id);
                        radio.prop("id", theme.Id);
                        radio.attr("onclick", "changeCSS('/Style/ChangeCss?id=" + theme.Id + "');");
                        primary.css("background-color", theme.PrimaryColor);
                        secondary.css("background-color", theme.SecondaryColor);
                        tertiary.css("background-color", theme.TertiaryColor);
                        nameElement.text(theme.Name);
                        nameElement.attr("for", theme.Id);
                        vm.showExistingThemes();
                    },
                    editTheme: function () {
                        var vm = this,
                            showUpdatedTheme = function (theme) {
                                changeCSS("/Style/ChangeCss?id=" + theme.Id);
                                var updatedItem = $(vm.createdThemes).find("li[id='" + theme.Id + "']");
                                vm.updateListItem(updatedItem, theme);
                                $("#btnBackToEditTheme").hide();
                                vm.swapCheckboxes(theme);
                            };
                        vm.setupTheme();
                        $.ajax({
                            url: "/Admin/Theme/Update",
                            contentType: "application/json; charset=utf-8",
                            datatype: "json",
                            data: JSON.stringify(that.theme),
                            method: "POST",
                            success: function (response) {
                                showUpdatedTheme(response.Data);
                                $(document).trigger(argosyEvents.END_LOADING);
                            }
                        });
                    },
                    swapCheckboxes: function (theme) {
                        var currentSelectedTheme = $("input:radio[name='themegroup']:checked"),
                            newSelectedTheme = $("input:radio[value='" + theme.Id + "']");
                        currentSelectedTheme.prop("checked", false);
                        newSelectedTheme.prop("checked", true);
                    },
                    getSelectors: function () {
                        var selectors = {};
                        $("[data-theme-group]").each(function () {
                            $(this).find("[data-style]").each(function () {
                                var style = $(this),
                                    stylesToUpdate = $.grep(that.theme.ThemeStyles, function (themeStyle) {
                                        return themeStyle.ThemeStyleId === style.data("themeStyleId");
                                    }),
                                    styleToUpdate = stylesToUpdate[0],
                                    role = style.data("role"),
                                    selector = style.data("selector");
                                if (styleToUpdate !== null && styleToUpdate !== undefined) {
                                    if (selectors[selector] === null) {
                                        selectors[selector] = [];
                                    }
                                    switch (role) {
                                        case "imageeditor":
                                            var imageEditor = style.getKendoImageEditor();
                                            if (imageEditor !== null && imageEditor !== undefined) {
                                                var backgroundImageValue = imageEditor.value();
                                                if (backgroundImageValue !== "none") {
                                                    styleToUpdate.Value = "url(" + backgroundImageValue + ")";
                                                } else {
                                                    styleToUpdate.Value = backgroundImageValue;
                                                }
                                            }
                                            break;
                                        case "dropdownlist":
                                            var dropDownList = style.getKendoDropDownList();
                                            if (dropDownList !== null && dropDownList !== undefined) {
                                                var themeOptionId = parseInt(dropDownList.value());
                                                $.each(styleToUpdate.ThemeOptions, function (i, option) {
                                                    if (option.ThemeOptionId === themeOptionId) {
                                                        styleToUpdate.Value = option.Value;
                                                        option.IsSelected = true;
                                                    } else {
                                                        option.IsSelected = false;
                                                    };
                                                });
                                            }
                                            break;
                                        case "colorpicker":
                                            var colorPicker = style.getKendoColorPicker();
                                            if (colorPicker !== null && colorPicker !== undefined) {
                                                var value = colorPicker.value();
                                                styleToUpdate.Value = value;
                                            }
                                            break;
                                    }
                                    if (styleToUpdate.IsPrimary) {
                                        that.theme.PrimaryColor = styleToUpdate.Value;
                                    }
                                    else if (styleToUpdate.IsSecondary) {
                                        that.theme.SecondaryColor = styleToUpdate.Value;
                                    }
                                    else if (styleToUpdate.IsTertiary) {
                                        that.theme.TertiaryColor = styleToUpdate.Value;
                                    }
                                    if (selectors[selector] === null || selectors[selector] === undefined) {
                                        selectors[selector] = [];
                                    }
                                    selectors[selector].push(styleToUpdate);
                                }
                            });
                        });
                        return selectors;
                    },
                    generateStyleSheet: function (selectors) {
                        var stylesheet = "";
                        $.each(selectors, function (i, selector) {
                            $.each(selector, function (j, style) {
                                if (j === 0) {
                                    stylesheet += style.Selector + " {\r\n";
                                }
                                stylesheet += "    " + style.Name + ": " + style.Value + ";\r\n";
                            });
                            stylesheet += "}\r\n\r\n";
                        });
                        return stylesheet;
                    },
                    setupTheme: function () {
                        $(document).trigger(argosyEvents.START_LOADING);
                        var selectors = this.getSelectors(),
                            styleSheet = this.generateStyleSheet(selectors);
                        that.theme.Name = $("#_themeName").val();
                        that.theme.StyleSheet = styleSheet; 
                    },
                    deleteTheme: function () {
                        var vm = this;
                        $(document).trigger(argosyEvents.START_LOADING);
                        $.ajax({
                            url: "/Admin/Theme/Delete",
                            contentType: "application/json; charset=utf-8",
                            datatype: "json",
                            data: JSON.stringify(that.theme),
                            method: "POST",
                            success: function (response) {
                                $(document).trigger(argosyEvents.END_LOADING);
                                if (!response.IsError) {
                                    prompt.alert({
                                        question: response.Message,
                                        description: "",
                                        type: "success"
                                    });
                                    $("li[id='" + that.theme.Id + "']").remove();
                                    vm.showExistingThemes();
                                    var userThemeId = userSettings.ThemeId;
                                    $("input:radio[value='" + userThemeId + "']").prop("checked", true);
                                    $("#btnBackToEditTheme").hide();
                                    changeCSS("/Style/ChangeCss?id=" + userThemeId);
                                } else {
                                    prompt.alert({
                                        question: response.Message,
                                        description: "",
                                        type: "warning"
                                    });
                                }
                            }
                        });
                    },
                    createTheme: function () {
                        var vm = this,
                            showNewTheme = function (theme) {
                                changeCSS("/Style/ChangeCss?id=" + theme.Id);
                                $("#createdThemesDiv").show();
                                var listItemHtml =
                                    "<li class='tc-item' id=''>\n" +
                                       "<div class='input-style'>\n" +
                                         "<input name='themegroup' value='' class='bootstrap-toggle' type='radio' id='' onclick=''/>\n" +
                                           "<label class='tc-name' for=''></label>\n" +
                                       "</div>\n" +
                                       "<div class='label-style'>\n" +
                                         "<span class='tc-color' name='primary' style='background-color: ''></span>\n" +
                                         "<span class='tc-color' name='secondary' style='background-color: ''></span>\n" +
                                         "<span class='tc-color' name='tertiary' style='background-color: ''></span>\n" +
                                         "<span class='marl10'>\n" +
                                           "<a data-argosy-dataid='' data-argosy-action='editTheme' id='showBuildTheme'>\n" +
                                             "<i title='Edit this Theme' class='fa fa-pencil' data-id=''></i>\n" +
                                           "</a>\n" +
                                         "</span>\n" +
                                       "</div>\n" +
                                     "</li>";
                                vm.createdThemes.append(listItemHtml);
                                var newItem = vm.createdThemes.children().last();
                                vm.updateListItem(newItem, theme);
                                $("#btnBackToEditTheme").hide();
                                vm.swapCheckboxes(theme);
                            };
                        vm.setupTheme();
                        $.ajax({
                            url: "/Admin/Theme/Create",
                            contentType: "application/json; charset=utf-8",
                            datatype: "json",
                            data: JSON.stringify(that.theme),
                            method: "POST",
                            success: function (response) {
                                showNewTheme(response.Data);
                                $(document).trigger(argosyEvents.END_LOADING);
                            }
                        });

                    },
                    previewTheme: function () {
                        $(document).trigger(argosyEvents.START_LOADING);
                        var selectors = this.getSelectors(),
                            styleSheet = this.generateStyleSheet(selectors);
                        this.swapCheckboxes(that.theme);
                        $("#theme-stylesheet").attr("href", "");
                        $("#temp-stylesheet").remove();
                        $("#theme-stylesheet").after($("<style />",
                        {
                            id: "temp-stylesheet",
                            type: "text/css"
                        }));
                        $("#temp-stylesheet").html(styleSheet);
                        $(document).trigger(argosyEvents.END_LOADING);
                    }
                });
            buildThemeDiv.html(content);
            kendo.bind(buildThemeDiv, viewModel);
            setCorrespondingValues();
            $("#divExistingThemes").hide();
            $(".gt-accordion h4").each(function () {
                var tis = $(this),
                    state = false,
                    answer = tis.next("div").slideUp();
                tis.click(function () {
                    state = !state;
                    answer.slideToggle(state);
                    tis.toggleClass("active", state);
                });
            });
            $.fancybox.close();
            $("#chooseTheme").hide();
            buildThemeDiv.show();
            $(document).trigger(argosyEvents.END_LOADING);
        }
    });
};
