using Argosy.Web.FrontEnd.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Luka.Areas.Tools.Controllers
{
    public class UserBudgetsController : Controller
    {
        //private readonly IMediator _mediator;
        //public UserBudgetsController(IMediator mediator)
        //{
        //    _mediator = mediator;
        //}

        public ActionResult Index()
        {
            ViewBag.Navigation = new List<NavigationAction>();
            return View();
        }

        //[HttpGet]
        //public ActionResult Edit(int id)
        //{
        //    var model = new CompUserGroupManager.CompUserGroup();
        //    if (id <= 0)
        //    {

        //    }
        //    else
        //    {
        //        model = _mediator.Send(new GetCompUserGroupCommand(id));
        //        if (model == null)
        //        {
        //            //todo: acormier needs to make a universal 404 not found handler
        //            return View("Index");
        //        }
        //    }
        //    return View(model);
        //}
    }
}