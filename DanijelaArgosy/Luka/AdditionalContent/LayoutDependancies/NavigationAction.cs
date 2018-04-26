namespace Argosy.Web.FrontEnd.Models
{
    public class NavigationAction
    {
        public string Name { get; set; }
        public int Order { get; set; }
        public string OuterClass { get; set; }
        public string InnerClass { get; set; }
        public string JavaScript { get; set; }
        public string Controller { get; set; }
        public string Action { get; set; }
        public string Area { get; set; }
        public string Hash { get; set; }
        public string Parameter { get; set; }
    }
}