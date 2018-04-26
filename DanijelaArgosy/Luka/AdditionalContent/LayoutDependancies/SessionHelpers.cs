namespace Argosy.Web.FrontEnd.Core.Extensions
{
    public static class SessionHelpers
    {
        public static string AddHiddenClassIf(bool hideItem)
        {
            return (hideItem ? "hidden" : "");
        }
    }
}