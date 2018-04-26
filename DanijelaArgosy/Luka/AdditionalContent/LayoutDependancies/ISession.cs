using System;
using System.Collections.Generic;
using Argosy.BusinessLogic.CompanyUser;
//using Argosy.BusinessLogic.FrontEnd.Managers;
//using Argosy.BusinessLogic.FrontEnd.Managers.OrderProcessing;
using ArgosyModel;

namespace Argosy.BusinessLogic.FrontEnd.Security
{
    public interface ISession
    {
        string Message { get; set; }
        bool PersistentMessageAvailable { get; set; }
        bool SkipPasswordCheck { get; set; }
        bool PersistentMessageViewed { get; set; }
        int? PersistentMessageId { get; set; }
        string GoogleAnalyticsCode { get; set; }
        string ZendeskUrl { get; set; }
        bool IsGuest { get; set; }
        string SiteName { get; set; }
        string CustomerName { get; set; }
        string LoginPath { get; set; }
        string CXmlBuyerCookie { get; set; }
        string CXmlBrowserFormPost { get; set; }
        string CXmlToIdentity { get; set; }
        bool CXmlPostUsingUrlEncoded { get; set; }
        bool IsAuthenticated { get; }
        Dictionary<string, string> UserLocalizationDictionary { get; set; }
        Dictionary<string, string> PersistSearch { get; set; }
        Dictionary<string, string> VisitedPages { get; set; }
        List<int> FavoritePartIds { get; set; }
        List<string> AllowedPages { get; set; }
        List<string> AllowedPaths { get; set; }
        int? UserId { get; set; }
        int? AssetRoleId { get; set; }
        //ASSET_ROLE AssetRole { get; set; }
        ESM_COMP_USERS User { get; set; }
        int CartCount { get; set; }
        UserSettings UserSettings { get; set; }
        int? SiteId { get; set; }
        int? CompanyId { get; set; }
        string SessionId { get; }
        DateTime Expiration { get; }
        string InitialPartCategory { get; set; }
        int? ImpersonaterUserId { get; set; }
        int PriceListId { get; set; }
        int CompanyUserGroupId { get; set; }
        string SiteWhiteLabel { get; set; }
        string CustomRegistrationUrl { get; set; }
        string CustomEditGlobalProfileUrl { get; set; }
        int? CustomGlobalFormsId { get; set; }
        string FavoriteIcon { get; set; }
        string LoadingImage { get; set; }
        string AuthorizationToken { get; set; }
        string SessionToken { get; set; }
        string Culture { get; set; }
        string CurrencyCode { get; set; }
        int? OriginalUserId { get; set; }
        bool IsWhiteLabel { get; set; }
        bool IsTemporarySession { get; set; }
        string ContactUsUrl { get; set; }
        bool IsUseable { get; }
        string ValidationKey { get; }
        double ExpiresInSeconds { get; }
        string LandingPageUrl { get; }
        string LoginRedirectUrl { get; }
        bool IsFinalCalculation { get; set; }
        string ThemeId { get; }
        bool IsAdmin { get; }
        bool IsTemporarySessionPage { get; }
        string HashedUserId { get; }
        string HashedCompanyId { get; }
        string HashedSiteId { get; }
        string HashedCompanyUserGroupId { get; }
        //List<string> IgnorePathsForPasswordReset { get; }
        //List<CompanyUserPageManager.CompanyUserPage> NonVisiblePages { get; set; }
        void AddCurrentPage();
        string GetUsersFullName();
        void PersistReturnUrl(string url);
        string GetPersistedReturnUrl(string returnUrl = null);
        void PersistLoginRedirect(string url);
        string GetPersistedLoginRedirectUrl();
        void UpdateTheme(int? themeId);
        void ClearSession(bool clearForms = true, bool resetSessionId = false);
        //ShoppingCart GetShoppingCart(bool useBaseCart = false);
        string AvalaraWarning { get; set; }
        //List<KeyValuePair<int, string>> CustomFields { get; set; }


    }
}