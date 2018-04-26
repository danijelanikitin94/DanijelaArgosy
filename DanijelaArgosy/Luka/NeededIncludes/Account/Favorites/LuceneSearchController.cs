using System.Web.Http;
//using Argosy.BusinessLogic.Dam.Managers;
//using Argosy.BusinessLogic.Elastic.Impl;
//using Argosy.BusinessLogic.FrontEnd.Managers;
//using Argosy.BusinessLogic.FrontEnd.Security;
//using Argosy.Common.Contracts.Contract;
//using AssetManager = Argosy.BusinessLogic.Elastic.Impl.AssetManager;
//using PartManager = Argosy.BusinessLogic.FrontEnd.Managers.PartManager;
//using Newtonsoft.Json;
//using System.Collections.Generic;
//using Argosy.BusinessLogic.Elastic.Model;
//using Argosy.Web.FrontEnd.Core.Filters;
//using Argosy.Common.Contracts.Core.Extensions;

namespace Argosy.Web.FrontEnd.Controllers
{
    //[WebApiAuthorization]
    public class LuceneSearchController : ApiController
    {
        // POST api/LuceneSearch/PartSearch  --we are not following the default convention of API controllers or we could only have one POST Action per controller
        [HttpPost, HttpGet]
        public string Parts()
        {
            //if (search == null)
            //{
            //    search = new PartManager.PartSearch();
            //}
            //var manager = new BusinessLogic.Elastic.Impl.PartManager();
            //SetupPartFiltersFromSession(search);
            //return manager.Search(search);
            return "da";
        }

        // POST api/LuceneSearch/PartSearch  --we are not following the default convention of API controllers or we could only have one POST Action per controller
        //    [HttpPost, HttpGet]
        //    public List<PartManager.Part> PartsById(List<int> partIds)
        //    {
        //        var search = new PartManager.PartSearch();
        //        var manager = new BusinessLogic.Elastic.Impl.PartManager();
        //        SetupPartFiltersFromSession(search);
        //        search.Skip = 0;
        //        search.Take = partIds.Count;
        //        search.AllowedPartIds = partIds;
        //        return manager.Search(search)?.Data;
        //    }

        //    public static void SetupPartFiltersFromSession(PartManager.PartSearch search)
        //    {
        //        search.SiteId = FrontEndSession.Instance.SiteId.GetValueOrDefault(0);
        //        search.CompanyId = FrontEndSession.Instance.CompanyId.GetValueOrDefault(0);
        //        search.UserId = FrontEndSession.Instance.UserId.GetValueOrDefault(0);
        //        search.PartGroupIsDistributionPush = false;
        //        search.PartGroupIsOrderTemplate = false;
        //        search.PartGroupActive = true;
        //        search.IsRetail = false;
        //        search.Active = "Y";
        //        search.SessionId = FrontEndSession.Instance.SessionId;
        //        search.PriceListId = FrontEndSession.Instance.PriceListId;
        //        search.AllowedCategories = PartCategoryHierarchyManager.GetUserAllowedPartGroups(FrontEndSession.Instance.UserId.GetValueOrDefault(0));
        //        if (search.AllowedCategories.IsNullOrEmpty())
        //        {
        //            search.AllowedCategories = new List<int>() { -9999 };
        //        }
        //        search.ExcludedCategories = PartCategoryHierarchyManager.GetUserExcludedCategories(search.AllowedCategories, FrontEndSession.Instance.CompanyId.GetValueOrDefault(0));
        //        search.InclusionTags = FrontEndSession.Instance.UserSettings.InclusionTags;
        //        search.ExclusionTags = FrontEndSession.Instance.UserSettings.ExclusionTags;
        //        if (!string.IsNullOrWhiteSpace(search.AggregationsJson))
        //        {
        //            search.Aggregations = JsonConvert.DeserializeObject<List<KeyValuePair<string, string>>>(search.AggregationsJson);
        //        }
        //    }

        //    [HttpGet]
        //    public List<string> PartTypeAhead(string prefix)
        //    {
        //        var manager = new BusinessLogic.Elastic.Impl.PartManager();
        //        var search = new PartManager.PartSearch();
        //        SetupPartFiltersFromSession(search);
        //        search.Keyword = prefix;
        //        return manager.QueryTypeAhead(search);
        //    }

        //    [HttpPost]
        //    public PagedClientResponse<AssetItem> Assets([FromBody]AssetItemSearch search)
        //    {
        //        var manager = new AssetManager();
        //        var securityManager = new AssetSecurityManager();
        //        var assetRoleId = FrontEndSession.Instance.AssetRoleId.GetValueOrDefault();
        //        search.CompanyId = FrontEndSession.Instance.CompanyId.GetValueOrDefault();
        //        search.AllowedGroupIds = securityManager.GetViewableAssetGroupIds(assetRoleId, true);
        //        if (search.AssetGroupId.HasValue && search.AssetGroupId.Value > 0)
        //        {
        //            search.AllowedGroupIds.Add(search.AssetGroupId.Value);
        //        }
        //        return manager.Search(search);
        //}
    }
}