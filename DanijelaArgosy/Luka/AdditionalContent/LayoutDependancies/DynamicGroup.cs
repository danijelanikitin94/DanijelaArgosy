using Argosy.Common.Contracts.Core.Interfaces;

namespace Argosy.Common.Contracts.Contract
{
    public class DynamicGroup : IDynamicGroup
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public int SiteId { get; set; }
        public string DisplayName { get; set; }
        public string GroupName { get; set; }
        public string DisplayImage { get; set; }
        public string Description { get; set; }
    }
}
namespace Argosy.Common.Contracts.Core.Interfaces
{
    public interface IDynamicGroup
    {
        int Id { get; set; }
        int CompanyId { get; set; }
        string DisplayName { get; set; }
        string DisplayImage { get; set; }
        string Description { get; set; }
        string GroupName { get; set; }
    }
}