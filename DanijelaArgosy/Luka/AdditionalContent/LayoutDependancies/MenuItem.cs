using System.Collections.Generic;
using System.Linq;

namespace Argosy.Web.FrontEnd.Core.Helpers
{
    public class MenuItem
    {
        public MenuItem()
        {
            Attributes = new Dictionary<string, string>();
        }
        public string CssClass { get; set; }
        public Dictionary<string, string> Attributes { get; set; }
        public string Text { get; set; }
        public bool IsHref
        {
            get { return !string.IsNullOrWhiteSpace(Href); }
        }
        public string Href { get; set; }
        public bool HasChildren
        {
            get { return Children != null && Children.Any(); }
        }
        public List<MenuItem> Children { get; set; }

        public bool IsRawHtml
        {
            get { return !string.IsNullOrWhiteSpace(Html); }
        }
        public string Html { get; set; }
        private string _listClass;

        public string ListClass
        {
            get { return _listClass + (Children != null && Children.Any() ? " has-sub" : ""); }
            set { _listClass = value; }
        }
    }
}