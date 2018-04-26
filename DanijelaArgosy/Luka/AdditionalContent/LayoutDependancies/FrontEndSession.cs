using System.Web;
using Luka.Dodato;
using ArgosyModel;
namespace Argosy.BusinessLogic.FrontEnd.Security
{
    public static class FrontEndSession
    {
        public const string ExpiredSessionQueryString = "sessionTimeOut";
        private const string SessionStoreKey = "SessionStoreKey";

        public static bool IsUseable => Instance != null && Instance.IsUseable;

        public static ISession Instance
        {
            get
            {
                return new SessionPrimer
                {
                    Culture = "EN-US",
                    IsUseable = true,
                    LandingPageUrl = "http://www.facebook.com",
                    UserSettings = new CompanyUser.UserSettings
                    {
                        CompanyLogo = "https://s3-eu-west-1.amazonaws.com/tpd/logos-domain/4becdb9c00006400050b67a8/255x0.png",
                        AllowSystemDollar = true,


                    },
                    SiteWhiteLabel = "Argosy Development Team",
                    IsWhiteLabel = true,
                    ContactUsUrl = "www.facebook.com",
                    SessionToken = "0422ac99-163b-48f0-800f-b0034e97bc9f",
                    IsGuest = false,
                    User = new ESM_COMP_USERS
                    {
                        FIRST_NAME = "Luka",
                        LAST_NAME = "Lukic"
                    },
                    ZendeskUrl = "http://www.zendesk.com"
                };
            }
        }
    }
}