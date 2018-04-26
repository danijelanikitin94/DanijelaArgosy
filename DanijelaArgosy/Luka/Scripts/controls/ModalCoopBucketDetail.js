function ModalCoopBucketDetail(opts) {
    var that = this;
    $.extend(true, that.options, that.baseOptions, opts);

    var controlLoader = new ControlLoader();
    controlLoader.loadTemplate("ModalCoopBucketDetail", function (template) {
        $(document.body).append(template);
        $(document.body).append($("#_ModalBucketDetailContainerTemplate").html());
        $(that).trigger(that.EVENT_TEMPLATE_LOADED);
    });
   
}

ModalCoopBucketDetail.prototype.options = {
};
ModalCoopBucketDetail.prototype.baseOptions = {
    templateSelector: "#_ModalBucketDetail",
    fancyboxDiv: "#_ModalBucketDetailContainer",
};

ModalCoopBucketDetail.prototype.EVENT_TEMPLATE_LOADED = "TEMPLATE_MODAL_BUCKET_DETAIL_LOADED";
ModalCoopBucketDetail.prototype.TEMPLATE = null;


ModalCoopBucketDetail.prototype.show = function (bucketId) {
    var that = this;
    $.ajax({
        url: "/admin/coop/GetBucket?bucketId=" + bucketId,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        method: "GET",
        success: function (result) {
            var html = kendo.Template.compile($(that.options.templateSelector).html())(result);
            $(that.options.fancyboxDiv).html(html);
            var parts = [],
                itemTypes = [];
            $(result.Details).each(function() {
                var detail = this;
                if (detail.ItemType !== null) {
                    itemTypes.push(detail);
                } else {
                    parts.push(detail);
                }
            });
            var viewModel = kendo.observable({
                parts: new kendo.data.DataSource({
                    data: parts,
                    pageSize: 10
                }),
                itemTypes: new kendo.data.DataSource({
                    data: itemTypes,
                    pageSize: 10
                })
            });
            $.fancybox({
                href: that.options.fancyboxDiv,
                afterShow: function() {
                    var fancybox = this.wrap;
                    kendo.bind(fancybox, viewModel);
                }
            });
        },
        error: function (result) {
            
        }
    });
}