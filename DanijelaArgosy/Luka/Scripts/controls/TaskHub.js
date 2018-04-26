function TaskHub(update, complete, error) {
    var that = this;
    var initialize = function () {
        // Reference the auto-generated proxy for the hub.  
        that.taskProcessor = $.connection.taskHub;
        that.taskProcessor.connection.qs = {
            "siteId": siteId,
            "userId": userId,
            "companyId": companyId,
            "companyUserGroupId": companyUserGroupId,
            "txt_customizationStateId": getQuerystring("customizationStateId", 0)
        }
        that.taskProcessor.client.update = function(task) {
            that.update(task);
            if (update != null) {
                update(task);
            }
        };
        that.taskProcessor.client.complete = function (task) {
            that.complete(task);
            if (complete != null) {
                complete(task);
            }
        };
        that.taskProcessor.client.error = function (task) {
            that.error(task);
            if (error != null) {
                error(task);
            }
        };

        // Start the connection.
        $.connection.hub.start().done(function() {
            that.options.initialized = true;
            $(document).trigger("TaskHub-Initialized");
        });
        
        window.onbeforeunload = function (e) {
            $.connection.hub.stop();
        };
    };
    
    if ($("script[src='/signalr/hubs']").length == 0) {
        $.noCacheScript("/signalr/hubs", function (e) {
            initialize();
        });
    } else {
        initialize();
    }
    
}

TaskHub.prototype.options = {
    initialized: false
};
TaskHub.prototype.templates = {
    content: "<div class='task-wrapper text-center padl40 padr40'>" +
           "<h3 class='task-title nowrap text-center'>${Message}</h3>" +
           "<h4 class='task-state nowrap text-center padb40'>${State}</h4>" +
           "#if (ErrorGuid != null && ErrorGuid != '') {#<h4 class='task-state text-danger nowrap text-center'>Error: ${ErrorGuid}</h4>#}#" +
           "<div class='nowrap text-center task-progress'><i class='fa fa-cog fa-spin'></i> <span id='taskMessage'>~{Processing}~ ${Executions} of ${Count}.</span></div>" +
           "</div>"
};
TaskHub.prototype.update = function (task) {
    var that = this;
    that.showProcessingModal(task);
};
TaskHub.prototype.complete = function (task) {
    var that = this;
    that.showProcessingModal(task);
};
TaskHub.prototype.error = function (task) {
    var that = this;
    that.showProcessingModal(task);
};

TaskHub.prototype.showProcessingModal = function (task) {
    var that = this;
    var content = kendo.Template.compile(that.templates.content)(task);
    if (task.State == "Created") {
        $.fancybox({
            content: content
        });
    } else {
        $(".fancybox-inner").find(".task-wrapper").replaceWith(content);
    }
    $.fancybox.update();
};

TaskHub.prototype.transformList = function (listPath, mappingData) {
    var that = this;
    if (!that.options.initialized) {
        $(document).one("TaskHub-Initialized", function (e) {
            that.transformList(listPath);
        });
    } else {
        var task = that.getBaseTask("ListTransform", { listPath: listPath, mappingData: mappingData }, "Starting your list transformation...", "List Transform");
        that.showProcessingModal(task);
        that.taskProcessor.server.processTask(task);
    }
};

TaskHub.prototype.generateListPreview = function (listPath, numberOfRows) {
    var that = this;
    if (!that.options.initialized) {
        $(document).one("TaskHub-Initialized", function (e) {
            that.generateListPreview(listPath, numberOfRows);
        });
    } else {
        var task = that.getBaseTask("ListPreview", { listPath: listPath, numberOfRows: numberOfRows }, "Generating your list preview...", "List Preview");
        that.showProcessingModal(task);
        that.taskProcessor.server.processTask(task);
    }
};

TaskHub.prototype.deduplicateList = function (listPath, addressColumns) {
    var that = this;
    if (!that.options.initialized) {
        $(document).one("TaskHub-Initialized", function (e) {
            that.deduplicateList(listPath, addressColumns);
        });
    } else {
        var task = that.getBaseTask("ListDeduplication", { listPath: listPath, addressColumns: addressColumns }, "Starting your list deduplication...", "List Deduplication");
        that.showProcessingModal(task);
        that.taskProcessor.server.processTask(task);
    }
};

TaskHub.prototype.removeDuplicatesFromList = function (listPath, rowsToRemove) {
    var that = this;
    if (!that.options.initialized) {
        $(document).one("TaskHub-Initialized", function (e) {
            that.removeDuplicatesFromList(listPath, rowsToRemove);
        });
    } else {
        var task = that.getBaseTask("ListDeduplicationRemoval", { listPath: listPath, rowsToRemove: rowsToRemove }, "Removing your duplicates...", "List Deduplication");
        that.showProcessingModal(task);
        that.taskProcessor.server.processTask(task);
    }
};


TaskHub.prototype.removeBadAddresses = function (listPath, rowsToRemove) {
    var that = this;
    if (!that.options.initialized) {
        $(document).one("TaskHub-Initialized", function (e) {
            that.removeBadAddresses(listPath, rowsToRemove);
        });
    } else {
        var data = { listPath: listPath, rowsToRemove: rowsToRemove }
        var task = that.getBaseTask("ListBadAddressRemoval", data, "Removing bad addresses...", "List Address Removal");
        that.showProcessingModal(task);
        that.taskProcessor.server.processTask(task);
    }
};

TaskHub.prototype.generateDynamicDataGlobalProfile = function (name, globalFormsId, identifier, projectId, globalProfileData, globalProfileId) {
    var that = this;
    if (!that.options.initialized) {
        $(document).one("TaskHub-Initialized", function (e) {
            that.generateDynamicDataGlobalProfile(name, globalFormsId, identifier, projectId, globalProfileData);
        });
    } else {
        var data = { name: name, globalFormsId: globalFormsId, identifier: identifier, projectId: projectId, globalProfileData: globalProfileData, globalProfileId: globalProfileId };
        var task = that.getBaseTask("GenerateDynamicDataGlobalProfile", data, "~{GeneratingYourProfile}~", "Temporary Global Profile.");
        that.showProcessingModal(task);
        that.taskProcessor.server.processTask(task);
    }
};



TaskHub.prototype.verifyAddressList = function (name, globalFormsId, identifier, projectId, globalProfileData) {
    var that = this;
    if (!that.options.initialized) {
        $(document).one("TaskHub-Initialized", function (e) {
            that.verifyAddressList(listPath, addressColumns);
        });
    } else {
        var data = { name: name, globalFormsId: globalFormsId, identifier: identifier, projectId: projectId, globalProfileData: globalProfileData };
        var task = that.getBaseTask("ListAddressVerification", data, "~{StartingYourAddressVerification}~", "Address Verification");
        that.showProcessingModal(task);
        that.taskProcessor.server.processTask(task);
    }
};



TaskHub.prototype.verifyAddressList = function (listPath, addressColumns) {
    var that = this;
    if (!that.options.initialized) {
        $(document).one("TaskHub-Initialized", function (e) {
            that.verifyAddressList(listPath, addressColumns);
        });
    } else {
        var task = that.getBaseTask("ListAddressVerification", { listPath: listPath, addressColumns: addressColumns }, "~{StartingYourAddressVerification}~", "Address Verification");
        that.showProcessingModal(task);
        that.taskProcessor.server.processTask(task);
    }
};

TaskHub.prototype.getBaseTask = function (taskType, data, message, name) {
   
    return {
        Name: name,
        Type: taskType,
        State: "Created",
        Uid: kendo.guid(),
        Message: message,
        Executions: 0,
        Count: 0,
        Data: data,
        ErrorGuid: null
    }
};

TaskHub.prototype.generateBundles = function (sku, variables, priceListId, proofName) {
    var that = this;
    if (!that.options.initialized) {
        $(document).one("TaskHub-Initialized", function (e) {
            that.generateBundles(sku, variables, priceListId, proofName);
        });
    } else {
        var data = {
            sku: sku,
            variables: variables,
            priceListId: priceListId,
            proofName: proofName
        };
        var task = that.getBaseTask("GenerateBundle", data, "Finding parts...", "Bundle Creation");
        that.showProcessingModal(task);
        that.taskProcessor.server.processTask(task);
    }
};

TaskHub.prototype.updateForRaymondJames = function (personId, userId,companyId,siteId) {
    var that = this;
    if (!that.options.initialized) {
        $(document).one("TaskHub-Initialized", function (e) {
            that.updateForRaymondJames(personId,userId,companyId,siteId);
        });
    } else {
        var data = {
            personId: personId,
            userId:userId,
            companyId:companyId, 
            siteId:siteId
        };
        var task = that.getBaseTask("UpdateProfilesForRaymondJames", data, "Fetching updates...", "Update Profiles and Accounting Units");
        that.showProcessingModal(task);
        that.taskProcessor.server.processTask(task);
    }
};