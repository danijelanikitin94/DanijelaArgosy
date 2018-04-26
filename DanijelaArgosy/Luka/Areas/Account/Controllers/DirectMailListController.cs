using Argosy.Web.FrontEnd.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Luka.Areas.Account.Controllers
{
    public class DirectMailListController : Controller
    {
        // GET: Account/DirectMailList
        public ActionResult Index()
        {
            /* DirectMailListManager.AssetListSearch search = new DirectMailListManager.AssetListSearch();
            search.CompanyId = FrontEndSession.Instance.CompanyId.GetValueOrDefault(0);
            search.UserId = FrontEndSession.Instance.UserId.GetValueOrDefault(0);
            search.Skip = 0;
            search.Take = 9999;
            var results = new DirectMailListManager().Search(search).Data;
            var totalLists = results.Select(l => l.Name).Count();
            var totalRecords = results.Sum(s => s.TotalRecords);

            ViewBag.Lists = totalLists;
            ViewBag.Records = totalRecords;*/
            ViewBag.Lists = 10;
            ViewBag.Records = 50;
            ViewBag.Navigation = new List<NavigationAction>();
            return View();
        }
    }
}