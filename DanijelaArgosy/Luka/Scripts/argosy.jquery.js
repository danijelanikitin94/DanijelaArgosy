// Create a closure
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}
(function () {
	var originalAddClassMethod = jQuery.fn.addClass;
	var originalRemoveClassMethod = jQuery.fn.removeClass;
	var originalShow = jQuery.fn.show;
	var originalHide = jQuery.fn.hide;


	jQuery.fn.addClass = function () {
		// trigger a custom event
		jQuery(this).trigger('beforeAddCssClass', arguments);

		// Execute the original method.
		var result = originalAddClassMethod.apply(this, arguments);

		// trigger a custom event
		jQuery(this).trigger('afterAddCssClass', arguments);

		// return the original result
		return result;
	};

	jQuery.fn.removeClass = function () {
		// trigger a custom event
		jQuery(this).trigger('beforeRemoveCssClass', arguments);
		// Execute the original method.
		var result = originalRemoveClassMethod.apply(this, arguments);

		// trigger a custom event
		jQuery(this).trigger('afterRemoveCssClass', arguments);

		// return the original result
		return result;
	};

	var originalVal = jQuery.fn.val;
	jQuery.fn.val = function () {
		var prev;
		if (arguments.length > 0) {
			prev = originalVal.apply(this, []);
		}
		var result = originalVal.apply(this, arguments);
		if (arguments.length > 0 && prev != originalVal.apply(this, [])) {
			jQuery(this).change();
		}
		return result;
	};

	jQuery.fn.show = function (speed, easing, oldCallback) {
		var that = this;
		return jQuery(that).each(function () {
			var obj = jQuery(this);
			var newCallback = function () {
				if (jQuery.isFunction(oldCallback)) {
					oldCallback.apply(obj);
				}
				obj.trigger('afterShow');
			};

			// you can trigger a before show if you want
			obj.trigger('beforeShow');

			// now use the old function to show the element passing the new callback
		    if (obj.hasClass("hide")) {
		        obj.removeClass("hide").addClass("show");
		    } else {
		        originalShow.apply(obj, [speed, easing, newCallback]);
		    }
		});
	};

	jQuery.fn.hide = function (speed, easing, oldCallback) {
		var that = this;
		return jQuery(that).each(function () {
			var obj = jQuery(this);
			var newCallback = function () {
				if (jQuery.isFunction(oldCallback)) {
					oldCallback.apply(obj);
				}
				obj.trigger('afterHide');
			};

			// you can trigger a before show if you want
			obj.trigger('beforeHide');

			if (obj.hasClass("show")) {
			    obj.removeClass("show").addClass("hide");
			} else {
			    originalHide.apply(obj, [speed, easing, newCallback]);
			}
			// now use the old function to show the element passing the new callback
		});
    };

    jQuery.fn.center = function () {
        this.css("position", "absolute");
        this.css("top", ($(window).height() - this.height()) / 2 + $(window).scrollTop() + "px");
        this.css("left", ($(window).width() - this.width()) / 2 + $(window).scrollLeft() + "px");
        return this;
    }

	jQuery.fn.outerHtml = function () {
		return jQuery('<div />').append(this.eq(0).clone()).html();
	};

	jQuery.parseProperty = function (data, propertyName) {
		var results = [];
		$(data).each(function(e) {
			results.push(this[propertyName]);
		});
		return results;
	};

	jQuery.getGuid = function () {
	    var d = new Date().getTime();
	    var uuid = 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
	        var r = (d + Math.random() * 16) % 16 | 0;
	        d = Math.floor(d / 16);
	        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
	    });
	    return uuid;
	};

	jQuery.cachedScript = function (url, success) {
	    // Allow user to set any option except for dataType, cache, and url
	    var options = {
	        dataType: "script",
            cache: true,
	        url: url,
	        success: success
	    };

	    // Use $.ajax() since it is more flexible than $.getScript
	    // Return the jqXHR object so we can chain callbacks
	    return jQuery.ajax(options);
    };
    jQuery.noCacheScript = function (url, success) {
	    // Allow user to set any option except for dataType, cache, and url
	    var options = {
	        dataType: "script",
            cache: false,
	        url: url,
	        success: success
	    };

	    // Use $.ajax() since it is more flexible than $.getScript
	    // Return the jqXHR object so we can chain callbacks
	    return jQuery.ajax(options);
	};


	jQuery.addChangeEvent = function (input) {
	    var changeEvent = function (e) {
	        var currentInput = $((e.currentTarget == null ? e.sender.element : e.currentTarget));
	        var dataLink = currentInput.attr("data-link");
	        var value = currentInput.val();
	        $("*[data-link=" + dataLink + "]").each(function(e) {
	            var currentItem = $(this);
	            if (currentItem.is("input") || currentItem.is("select") || currentItem.is("textarea")) {
	                $.updateValue(currentItem, value);
	            } else {
	                currentItem.html(value);
	            }
	        });
	    };
	    var previousOnInput = null;
	    if ($.isKendo(input)) {
	        var kendoName = $.kendoType(input);
	        var kendoObject = $(input).data(kendoName);
	        if (kendoObject != null) {
	            kendoObject.bind("change", changeEvent);
	            kendoObject.bind("select", changeEvent);
	        }
	    } else {
	        if (e.currentTarget.oninput != null) {
	            previousOnInput = e.currentTarget.oninput;
	        }
	        this.oninput = function (e) {
	            changeEvent(e);
	            if (previousOnInput != null) {
	                previousOnInput(e);
	            }
	        };
	    }
	};


	jQuery.updateValue = function (input, value) {
	    if ($.isKendo(input)) {
	        var kendoName = $.kendoType(input);
	        var kendoObject = $(input).data(kendoName);
	        if (kendoObject != null && kendoObject.value != null && kendoObject.value() != value) {
	            kendoObject.value(value);
	        }
	    } else {
	        $(input).val(value);
	    }
	};

	jQuery.isKendo = function (input) {
	    var data = $(input).data();
	    var isKendo = false;
	    if (data != null) {
	        $.each(data, function (name, value) {
	            if (name.indexOf("kendo") > -1) {
	                isKendo = true;
	            }
	        });
	    }
	    return isKendo;
	}

	jQuery.kendoType = function (input) {
	    var data = $(input).data();
	    var kendoName = null;
	    if (data != null) {
	        $.each(data, function (name, value) {
	            if (name.indexOf("kendo") > -1) {
	                kendoName = name;
	            }
	        });
	    }
	    return kendoName;
	}

	jQuery.getKendoControl = function (input) {
	    var kendoObject = null;
	    if ($.isKendo(input)) {
	        var kendoType = "get" + $.capitalizeFirstLetter($.kendoType(input));
	        kendoObject = input[kendoType]();
	    }
	    return kendoObject;
	}

	jQuery.capitalizeFirstLetter = function (value) {
	    return value.charAt(0).toUpperCase() + value.slice(1);
	}

	jQuery.submitAsForm = function (submitUrl, data, parameter) {
        if ($.type(data) != "string") {
            data = JSON.stringify(data);
        }
        if (parameter == null) {
            parameter = "FormData";
        }
	    var form = $("<form />", {
	        action: submitUrl,
	        'class': "hide",
	        method: "post",
	        enctype: "multipart/form-data"
	    });
	    var jsonData = $("<input />", {
	        value: data,
	        id: parameter,
	        name: parameter,
            type: "hidden"
	    });
	    var submitButton = $("<input />", {
	        type: "submit",
	        value: "Submit Form"
	    });
	    form.append(jsonData);
	    form.append(submitButton);
	    form.appendTo("body").submit();
    }

    jQuery.waitFor = function (selector, onComplete, timeout) {
        console.log("Waiting on " + selector + " to exist...");
        var checkExist = setInterval(function () {
            var element = $(selector);
            if (element.length) {
                console.log(selector + "Exists!");
                clearInterval(checkExist);
                onComplete(element);
            }
        }, timeout);
    }
})();