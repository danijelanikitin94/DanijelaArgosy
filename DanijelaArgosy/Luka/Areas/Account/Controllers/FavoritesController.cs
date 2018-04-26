using Argosy.Web.FrontEnd.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Luka.Areas.Account.Controllers
{
    public class FavoritesController : Controller
    {
        // GET: Account/Favorites
        public ActionResult Index()
        {
            ViewBag.Navigation = new List<NavigationAction>();
            return View();
        }
    }
}