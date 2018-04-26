using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Argosy.Web.FrontEnd.Models;
using Argosy.BusinessLogic.FrontEnd.Security;

namespace Luka.Areas.Account.Controllers
{
    public class PrviController : Controller
    {
        // GET: Account/Home
        public ActionResult Index()
        {
            var instance = FrontEndSession.Instance;
            ViewBag.Navigation = new List<NavigationAction>();
            return View();
        }
    }
}