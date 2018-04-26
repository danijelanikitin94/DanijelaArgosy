using System.Web.Http;
//using System.Web.Http.OData.Extensions;
//using Argosy.BusinessLogic.Web;
//using Argosy.Web.FrontEnd.DependencyResolution;
using Newtonsoft.Json;

namespace Argosy.Web.FrontEnd {
    public static class WebApiConfig {
        public static string UrlPrefix { get { return "api"; } }
        public static string UrlPrefixRelative { get { return "~/api"; } }

        public static void Register(HttpConfiguration config) {
            //SetResolver(config);
            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{action}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
            // Uncomment the following line of code to enable query support for actions with an IQueryable or IQueryable<T> return type.
            // To avoid processing unexpected or malicious queries, use the validation settings on QueryableAttribute to validate incoming queries.
            // For more information, visit http://go.microsoft.com/fwlink/?LinkId=279712.
            //config.AddODataQueryFilter();
        }

        //private static void SetResolver(HttpConfiguration config) {
        //    var container = UnityConfig.GetConfiguredContainer();
        //    config.DependencyResolver = new UnityResolver(container);
        //}
    }
}