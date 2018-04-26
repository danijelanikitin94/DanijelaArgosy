using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Argosy.BusinessLogic.CompanyUser;
using Argosy.BusinessLogic.FrontEnd.Security;
using ArgosyModel;
namespace Luka.Dodato
{
    public class SessionPrimer : ISession
    {
        public string Message { get; set; }
        public bool PersistentMessageAvailable { get; set; }
        public bool SkipPasswordCheck { get; set; }
        public  bool PersistentMessageViewed { get; set; }
        public int? PersistentMessageId { get; set; }
        public string GoogleAnalyticsCode { get; set; }
        public string ZendeskUrl { get; set; }
        public bool IsGuest { get; set; }
        public string SiteName { get; set; }
        public string CustomerName { get; set; }
        public string LoginPath { get; set; }
        public string CXmlBuyerCookie { get; set; }
        public string CXmlBrowserFormPost { get; set; }
        public string CXmlToIdentity { get; set; }
        public bool CXmlPostUsingUrlEncoded { get; set; }
        public bool IsAuthenticated { get; }
        public Dictionary<string, string> UserLocalizationDictionary { get; set; }
        public  Dictionary<string, string> PersistSearch { get; set; }
        public Dictionary<string, string> VisitedPages { get; set; }
        public  List<int> FavoritePartIds { get; set; }
        public List<string> AllowedPages { get; set; }
        public List<string> AllowedPaths { get; set; }
        public  int? UserId { get; set; }
        public int? AssetRoleId { get; set; }
        //ASSET_ROLE AssetRole { get; set; }
        //ESM_COMP_USERS User { get; set; }
        public int CartCount { get; set; }
        public UserSettings UserSettings { get; set; }
        public int? SiteId { get; set; }
        public int? CompanyId { get; set; }
        public string SessionId { get; }
        public DateTime Expiration { get; }
        public string InitialPartCategory { get; set; }
        public int? ImpersonaterUserId { get; set; }
        public int PriceListId { get; set; }
        public int CompanyUserGroupId { get; set; }
        public string SiteWhiteLabel { get; set; }
        public string CustomRegistrationUrl { get; set; }
        public string CustomEditGlobalProfileUrl { get; set; }
        public  int? CustomGlobalFormsId { get; set; }
        public string FavoriteIcon { get; set; }
        public string LoadingImage { get; set; }
        public string AuthorizationToken { get; set; }
        public string SessionToken { get; set; }
        public string Culture { get; set; }
        public string CurrencyCode { get; set; }
        public int? OriginalUserId { get; set; }
        public bool IsWhiteLabel { get; set; }
        public bool IsTemporarySession { get; set; }
        public string ContactUsUrl { get; set; }
        public bool IsUseable { get; set; }
        public string ValidationKey { get; }
        public double ExpiresInSeconds { get; }
        public string LandingPageUrl { get; set;  }
        public string LoginRedirectUrl { get; }
        public bool IsFinalCalculation { get; set; }
        public string ThemeId { get; }
        public  bool IsAdmin { get; }
        public bool IsTemporarySessionPage { get; }
        public string HashedUserId { get; }
        public string HashedCompanyId { get; }
        public string HashedSiteId { get; }
        public string HashedCompanyUserGroupId { get; }
        public List<string> IgnorePathsForPasswordReset { get; }
        //List<CompanyUserPageManager.CompanyUserPage> NonVisiblePages { get; set; }
        public void AddCurrentPage()
        {

        }
        public string GetUsersFullName()
        {
            return this.User.FIRST_NAME + " " + this.User.LAST_NAME;
        }
        public void PersistReturnUrl(string url)
        {
           
        }
        public string GetPersistedReturnUrl(string returnUrl = null)
        {
            return "";
        }
        public void PersistLoginRedirect(string url)
        {

        }
        public string GetPersistedLoginRedirectUrl()
        {
            return "";
        }
        public void UpdateTheme(int? themeId)
        {

        }
        public void ClearSession(bool clearForms = true, bool resetSessionId = false)
        {

        }
        //ShoppingCart GetShoppingCart(bool useBaseCart = false);
        public string AvalaraWarning { get; set; }
        List<KeyValuePair<int, string>> CustomFields { get; set; }

        public ESM_COMP_USERS User { get; set;  }
    }
}