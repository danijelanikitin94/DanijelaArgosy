using System.Web;
using System.Web.Optimization;

namespace Luka
{
    public class BundleConfig
    {
        // For more information on bundling, visit https://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {

            bundles.Add(new StyleBundle("~/Content/maincss").Include(
                    "~/Content/kendo.argosy.common.css",
                    "~/Content/bootstrap.css",
                    "~/Content/custom-bootstrap.css",
                    "~/Content/jquery.fancybox.css",
                    "~/Content/font-awesome.css",
                    "~/Content/argosy.bundles.fix.css",
                    "~/Content/argosy.common.css",
                    "~/Content/responsive.css",
                    "~/Content/responsive-custom.css",
                    "~/Content/jquery.jcrop.css",
                    "~/Content/cropper.css",
                    "~/Content/owl-carousel/owl.carousel.css",
                    "~/Content/owl-carousel/owl.theme.css",
                    "~/Content/simple-sidebar.css",
                    "~/Content/MultiSelect/bootstrap-select.css"));

            var controls = new Bundle("~/bundles/controls")
                .IncludeDirectory("~/Scripts/controls", "*.js");
            bundles.Add(controls);

            var argosyLibs = new Bundle("~/bundles/argosyLib")
                .Include("~/Scripts/ControlLoader.js")
                .Include("~/Scripts/argosy.jquery.js")
                .Include("~/Scripts/argosy.events.js")
                .Include("~/Scripts/argosy.static.js")
                .Include("~/Scripts/argosy.common.js");
            bundles.Add(argosyLibs);

            var jQueryLibs = new Bundle("~/bundles/jQueryLib")
                .Include("~/Scripts/jquery-3.2.1.js")
                .Include("~/Scripts/jquery.unobtrusive-ajax.js")
                .Include("~/Scripts/jquery.validate.js")
                .Include("~/Scripts/jquery.validate.unobtrusive.js")
                .Include("~/Scripts/jquery.fancybox.pack.js")
                .Include("~/Scripts/jquery.blockUI.js")
                .Include("~/Scripts/jquery.jcrop.js");

            bundles.Add(jQueryLibs);

            var uiLibs = new Bundle("~/bundles/uILib")
                .Include("~/Scripts/cropper.js")
                .Include("~/Scripts/date.js")
                .Include("~/Scripts/bootstrap.js")
                .Include("~/Scripts/response.js")
                .Include("~/Scripts/jszip.2.4.0.js")
                .Include("~/Scripts/owl-carousel/owl.carousel.js")
                .Include("~/Scripts/MultiSelect/bootstrap-select.js")
                .Include("~/Scripts/lodash.js");
            bundles.Add(uiLibs);
            //bundles.Add(new ScriptBundle("~/bundles/scripts")
            //.IncludeDirectory("~/Scripts", "*.js", true));

            //bundles.Add(new Bundle("~/bundles/scripts")
            //.Include("~/Scripts/controls.min.js"));
        }
    }
}
