function DamAssetView() {
    
}

DamAssetView.prototype.options = {};

DamAssetView.prototype.baseOptions = {
	listViewHref: "div[data-argosy-view=MvcAssetListView]",
};

DamAssetView.prototype.EVENT_TEMPLATE_LOADED = "TEMPLATE_ASSET_VIEW_LOADED";
DamAssetView.prototype.EVENT_LISTENERS_LOADED = "ASSET_VIEW_LISTENERS_LOADED";
DamAssetView.prototype.EVENT_DATABOUND = "ASSET_VIEW_DATABOUND";
DamAssetView.prototype.assetDetailControl = null;
DamAssetView.prototype.assetUsageControl = null;
DamAssetView.prototype.assetShareControl = null;
DamAssetView.prototype.loaded = false;