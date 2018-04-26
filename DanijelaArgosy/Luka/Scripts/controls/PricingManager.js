function PricingManager() {
}

PricingManager.prototype.getPartPricing = function(partId, quantity, callback) {
    $.ajax({
        url: "/DataView/GetPartPricing",
        dataType: "json",
        method: "POST",
        data: { partId: partId, quantity: quantity },
        success: function(result) {
            if (callback != null) {
                callback(result);
            }
        },
        error: function(result) {
            if (callback != null) {
                callback(null);
            }
        }
    });
};
PricingManager.prototype.getPartPricingWithPart = function(part, quantity, callback) {

    var data = {};
    data.part = part;
    data.quantity = quantity;
    $.ajax({
        url: "/DataView/GetPartPricingWithPart",
        dataType: "json",
        method: "POST",
        async: true,
        processData: false,
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(data),
        success: function(result) {
            if (callback != null) {
                callback(result);
            }
        },
        error: function(result) {
            if (callback != null) {
                callback(null);
            }
        }
    });
};
PricingManager.prototype.GetDynamicKitPricing = function (cartline, callback) {

    var data = {};
    data.part = cartline.Part;
    data.quantity = cartline.Quantity;
    var kitParts = [];
    
    $(cartline.ChildCartLines).each(function() {
        var line = this;
        kitParts.push({Key:line.PartId,Value:line.Quantity});
    });
    data.kitParts = kitParts;

    $.ajax({
        url: "/DataView/GetDynamicKitPricing",
        dataType: "json",
        method: "POST",
        async: true,
        processData: false,
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(data),
        success: function(result) {
            if (callback != null) {
                callback(result);
            }
        },
        error: function(result) {
            if (callback != null) {
                callback(null);
            }
        }
    });
};
PricingManager.prototype.getKitPricing = function(kitViewModel, quantity, callback) {
    var parts = [];
    var data = {
        kitId: kitViewModel.Kit.PartId,
        quantity: quantity
    };
    $(kitViewModel.KitParts).each(function(i) {
        if (!this.Disabled) {
            parts.push({
                partId: this.ChildPartId,
                quantity: this.Quantity
            });
        }
    });
    data.kitParts = JSON.stringify(parts);
    $.ajax({
        url: "/DataView/GetKitPricing",
        dataType: "json",
        method: "POST",
        data: data,
        success: function(result) {
            if (callback != null) {
                callback(result);
            }
        },
        error: function(result) {
            if (callback != null) {
                callback(null);
            }
        }
    });
};