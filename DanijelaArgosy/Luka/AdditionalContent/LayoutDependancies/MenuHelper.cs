using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
//using Argosy.BusinessLogic.Enums;
using Argosy.BusinessLogic.Extensions;
//using Argosy.BusinessLogic.FrontEnd.Managers;
using Argosy.BusinessLogic.FrontEnd.Security;
//using ArgosyModel;
//using Argosy.Common.Contracts.Core.Extensions;

namespace Argosy.Web.FrontEnd.Core.Helpers
{
    public class MenuHelper
    {
        private readonly UrlHelper _helper;
        //private readonly List<CompanyUserPageManager.CompanyUserPage> _pages;

        public MenuHelper()
        {
            var userId = FrontEndSession.Instance.UserId.GetValueOrDefault(0);
            //_helper = new UrlHelper(context);
            //_pages = new CompanyUserPageManager().Search(new CompanyUserPageManager.CompanyUserPageSearch { Take = 999, UserId = userId, IsEnabled = true }).Data;
        }

        public List<MenuItem> GetMenu()
        {
            var menu = new List<MenuItem>();
            AddAccountMenu(menu);
            AddAccountMenu(menu);
            AddAccountMenu(menu);
            AddSearchMenu(menu);
            AddSearchMenu(menu);
            AddSearchMenu(menu);
            return menu;
        }

        private static void AddSearchMenu(List<MenuItem> menu)
        {
            menu.Add(new MenuItem()
            {
                ListClass = "menu-right search-box",
                Html = "<div class='top-search active'><div class='input-wrap'><input type='text' id='searchFor' style='background: #fff' name='searchFor' class='inner-input topNavSearch' placeholder='~{Search}~'>" +
                       "</div><span class='icon-magnifier'><button type='submit' class='btn search-icon-btn fa fa-search topNavSearch'></button></span></div>"
            });
        }


        private void AddAccountMenu(ICollection<MenuItem> menu)
        {
            if (FrontEndSession.Instance.IsGuest) return;

 
                menu.Add(new MenuItem
                {
                    ListClass = "menu-right has-sub",
                    CssClass = "select-account-menu ",
                    Text = "~{Account}~",
                   
                });
     
        }

       
        

        


    }
}
