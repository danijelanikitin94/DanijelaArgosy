using System;

namespace Argosy.BusinessLogic.CompanyUser
{
    [Serializable]
    public class UserSettings
    {
        public string LandingPageUrl
        {
            get;set;
        }
        
        public bool AllowSystemDollar
        {
            get;set;
        }

        public string CustomUrlPath
        {
            get;set;
        }

        public string CompanyLogo
        {
            get; set;
        }

        public bool IsAdmin
        {
            get;set;
        }

        public string FooterHtml
        {
            get;set;
        }
    }
}
