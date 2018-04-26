
using System;
using System.Collections.Generic;
//using System.Data.Entity;
//using System.Linq;
//using Argosy.BusinessLogic.CompanyUser;
//using Argosy.BusinessLogic.Enums;
//using Argosy.BusinessLogic.FrontEnd.Managers;
//using Argosy.BusinessLogic.FrontEnd.Managers.OrderProcessing.Impl;
//using Argosy.BusinessLogic.FrontEnd.Managers.OrderProcessing.Interfaces;
//using Argosy.BusinessLogic.V5;
//using Argosy.BusinessLogic.V5.CompanyUser;
//using Argosy.Common.Config;
//using Argosy.Common.Contracts.Core.Enum;
//using Argosy.Common.Enums;
//using Argosy.Common.Extensions;
using ArgosyModel;
//using Cerqa.Common.V5;
//using Cerqa.Common.V5.ArgosyFile;
//using Cerqa.Common.V5.Security;
using System.Net;
using Argosy.Common.Contracts.Core.Interfaces;
//using Cerqa.Common.V5.ErrorHandling;
using System.IO;
using System.Linq.Expressions;
//using System.ServiceModel.Security;
//using Argosy.BusinessLogic.FrontEnd.Managers.CoopDollars;
//using Argosy.Common.Contracts.Core.Extensions;
//using Argosy.DataAccess.Core;
//using Cerqa.Common.V5.Data;
//using OrderStatus = Argosy.Common.Contracts.Core.Enum.OrderStatus;

namespace Argosy.BusinessLogic.Extensions
{
    public static class CompUserExtensions
    {
        public static DateTime GetDateModified(this ESM_COMP_USERS user)
        {
            if (user.DATEMODIFIED.HasValue && user.DATEMODIFIED.Value != DateTime.MinValue)
            {
                return user.DATEMODIFIED.Value;
            }
            return DateTime.Now;
        }
        //public static string GetSiteWhiteLabel(this ESM_COMP_USERS user)
        //{
        //    var label = AppSetting.DefaultWhiteLabel;
        //    if (!string.IsNullOrWhiteSpace(user.ESM_COMPANY?.WHITE_LABEL))
        //    {
        //        label = user.ESM_COMPANY?.WHITE_LABEL ?? label;
        //    }
        //    else if (!string.IsNullOrWhiteSpace(user.ESM_SITE?.SITE_LABEL))
        //    {
        //        label = user.ESM_SITE.SITE_LABEL ?? label;
        //    }
        //    return label;
        //}

        //public static UserManager.User GetApprovingManager(this ESM_COMP_USERS user)
        //{
        //    UserManager.User approvingManager = null;
        //    var managerId = user.GetUserManager();
        //    if (managerId.HasValue)
        //    {
        //        var result = new UserManager().Read(managerId.Value);
        //        if (!result.IsError)
        //        {
        //            approvingManager = result.Data;
        //        }
        //    }
        //    return approvingManager;
        //}

        //public static void UploadUserImage(this UserManager.User user, string image, Action<UserManager.User, IFileInfo, bool> action, bool userPhoto, bool isTempImage)
        //{
        //    if (!string.IsNullOrWhiteSpace(image))
        //    {
        //        try
        //        {
        //            var finalImage = isTempImage
        //                ? FileFactory.GetInstance(FileLocations.TempStorage, Guid.NewGuid().ToString() + Path.GetExtension(image))
        //                : FileFactory.GetUserProfileFileName(user.CompanyId, user.UserId, Path.GetExtension(image), userPhoto ? "_user_photo" : "_logo_photo");
        //            using (var client = new WebClient())
        //            {
        //                client.DownloadFile(image, finalImage.FullName);
        //                action(user, finalImage, isTempImage);
        //            }
        //        }
        //        catch (Exception err)
        //        {
        //            ErrorHandlingRepositoryFactory.Instance.HandleError(err, "Failed to load User image.", new { user, image, userPhoto, isTempImage });
        //        }
        //    }
        //}

        //public static void MoveUserImage(this UserManager.User user, UserManager manager, Func<UserManager.User, bool> shouldMove, Action<int, IFileInfo, UserManager> update, bool isUserPhoto)
        //{
        //    try
        //    {
        //        if (shouldMove(user))
        //        {
        //            var tempFile = FileFactory.GetInstance(FileLocations.TempStorage, isUserPhoto ? user.Photo : user.DefaultLogo);

        //            if (tempFile.Exists)
        //            {
        //                var userPhoto = FileFactory.GetUserProfileFileName(user.CompanyId, user.UserId, tempFile.Extension, isUserPhoto ? "_user_photo" : "_logo_photo");
        //                tempFile.CopyTo(userPhoto);
        //                update(user.UserId, userPhoto, manager);
        //            }
        //        }
        //    }
        //    catch (Exception err)
        //    {
        //        ErrorHandlingRepositoryFactory.Instance.HandleError(err, "Failed to map user photo", new { user });
        //    }
        //}

        //public static List<int> GetChildUserIds(this UserManager.User user)
        //{
        //    return new HierarchyManager().GetChildUsers(user.UserId).Select(y => y.COMP_USER_ID).ToList();
        //}
        //public static CompUserGroupManager.CompUserGroup GetUserGroup(this ESM_COMP_USERS user)
        //{
        //    CompUserGroupManager.CompUserGroup group = null;
        //    if (user?.COMP_USERGROUP_ID != null)
        //    {
        //        var result = new CompUserGroupManager().Read(user.COMP_USERGROUP_ID.Value);
        //        if (!result.IsError)
        //        {
        //            group = result.Data;
        //        }
        //    }
        //    return group;
        //}
        //public static bool IsWhiteLabelSite(this ESM_COMP_USERS user)
        //{
        //    if (user.ESM_SITE?.SYS_SITE_LIC_PLAN != null)
        //    {
        //        var license = user.ESM_SITE.SYS_SITE_LIC_PLAN.FirstOrDefault();
        //        return license != null && license.ALLOW_WHITELABLE.GetValueOrDefault(false);
        //    }
        //    if (user.ESM_COMPANY?.ESM_SITE?.SYS_SITE_LIC_PLAN != null)
        //    {
        //        var license = user.ESM_COMPANY.ESM_SITE.SYS_SITE_LIC_PLAN.FirstOrDefault();
        //        return license != null && license.ALLOW_WHITELABLE.GetValueOrDefault(false);
        //    }
        //    // enables white labeling at the company level.
        //    return user.ESM_COMPANY?.ESM_SITE != null && user.ESM_COMPANY.ESM_SITE.FLAG_ALLOW_COMPANY_WHITE_LABEL;
        //}

        //public static bool IsUserGroupManager(this ESM_COMP_USERS user)
        //{
        //    return new ArgosyManager<ESM_COMP_USERGROUP>().Any(f => f.GROUP_MANAGER_ID == user.COMP_USER_ID);
        //}

        //public static List<int> GetFavoriteParts(this ESM_COMP_USERS user)
        //{
        //    return user.ESM_CART_QUICK.Select(e => e.PART_ID).ToList();
        //}

        //public static bool IsFavoritePart(this ESM_COMP_USERS user, int partId)
        //{
        //    return user.ESM_CART_QUICK.Any(e => e.PART_ID == partId);
        //}

        public static string GetFullName(this ESM_COMP_USERS user)
        {
            if (string.IsNullOrWhiteSpace(user.FIRST_NAME) && string.IsNullOrWhiteSpace(user.LAST_NAME))
            {
                return user.USERNAME;
            }
            return (user.FIRST_NAME + " " + user.LAST_NAME).Trim();
        }

        //public static string GetFullName(this UserManager.User user)
        //{
        //    if (string.IsNullOrWhiteSpace(user.FirstName) && string.IsNullOrWhiteSpace(user.LastName))
        //    {
        //        return user.Username;
        //    }
        //    return (user.FirstName + " " + user.LastName).Trim();
        //}

        //public static ESM_COMP_PRICELIST GetDefaultPriceList(this ESM_COMP_USERS user)
        //{
        //    if (user.COMP_USERGROUP_ID.HasValue && user.ESM_COMP_USERGROUP.PRICELISTID.HasValue)
        //    {
        //        return new ArgosyManager<ESM_COMP_PRICELIST>().Get(user.ESM_COMP_USERGROUP.PRICELISTID.Value);
        //    }
        //    return user.ESM_COMPANY.ESM_COMP_PRICELIST.FirstOrDefault(p => p.ISDEFAULT);
        //}

        //public static int GetDefaultPriceListId(this ESM_COMP_USERS user)
        //{
        //    if (user.COMP_USERGROUP_ID.HasValue && user.ESM_COMP_USERGROUP?.PRICELISTID != null)
        //    {
        //        return user.ESM_COMP_USERGROUP.PRICELISTID.Value;
        //    }
        //    if (user.COMP_USERGROUP_ID.HasValue && user.ESM_COMP_USERGROUP == null)
        //    {
        //        var manager = new ArgosyManager<ESM_COMP_USERGROUP>();
        //        var userGroup = manager.Get(user.COMP_USERGROUP_ID.Value);

        //        if (userGroup?.PRICELISTID != null)
        //        {
        //            return userGroup.PRICELISTID.Value;
        //        }
        //    }
        //    ESM_COMP_PRICELIST priceList = null;
        //    if (user.ESM_COMPANY != null)
        //    {
        //        priceList = user.ESM_COMPANY.ESM_COMP_PRICELIST.FirstOrDefault(p => p.ISDEFAULT);
        //    }
        //    else if (user.COMPANY_ID > 0)
        //    {
        //        var manager = new ArgosyManager<ESM_COMPANY>();
        //        var company = manager.Get(user.COMPANY_ID);

        //        if (company != null && company.ESM_COMP_PRICELIST.Any())
        //        {
        //            priceList = company.ESM_COMP_PRICELIST.FirstOrDefault(p => p.ISDEFAULT);
        //        }
        //    }
        //    return priceList?.COMPPRICELIST_ID ?? 0;
        //}

        public static string GetFullNameWithUserName(this ESM_COMP_USERS user)
        {
            var userName = string.Empty;
            if (string.IsNullOrWhiteSpace(user.FIRST_NAME) && string.IsNullOrWhiteSpace(user.LAST_NAME))
            {
                userName = user.USERNAME;
            }
            else
            {
                userName = (user.FIRST_NAME + " " + user.LAST_NAME).Trim() + " (" + user.USERNAME + ")";
            }

            return userName;
        }

        //private static decimal GetCoopDollarBalance(int userId, int? userGroupId)
        //{
        //    return new ViewCoopDollarBalanceManager().GetUserTotalBalance(userId, userGroupId);
        //}

        //public static decimal GetCoopDollarsWithoutBuckets(this ESM_COMP_USERS user)
        //{
        //    return GetCoopDollarsWithoutBuckets(user.COMP_USER_ID, user.COMP_USERGROUP_ID);
        //}

        //public static decimal GetCoopDollarsWithoutBuckets(this IUser user)
        //{
        //    return GetCoopDollarsWithoutBuckets(user.Id, user.UserGroupId);
        //}

        //private static decimal GetCoopDollarsWithoutBuckets(int userId, int? userGroupId)
        //{
        //    return new ViewCoopDollarBalanceManager().GetUserTotalUnassignedBalance(userId, userGroupId);
        //}

        public static decimal GetCoopDollars(this ESM_COMP_USERS user)
        {
            return 400;//GetCoopDollarBalance(user.COMP_USER_ID, user.COMP_USERGROUP_ID);
        }

        //public static decimal GetCoopDollars(this UserManager.User user)
        //{
        //    return GetCoopDollarBalance(user.UserId, user.UserGroupId);
        //}

        //public static decimal GetCoopDollars(this IUser user)
        //{
        //    return GetCoopDollarBalance(user.Id, user.UserGroupId);
        //}


        //public static int GetNewMessageCount(this ESM_COMP_USERS user)
        //{
        //    return user.ESM_MSGUSER.Count(m => m.MSGREAD == "N"); //APM: based on v4, Read messages are marked as 'Y'
        //}

        //public static int? GetUserManager(this ESM_COMP_USERS user)
        //{
        //    var manager = new ArgosyManager<ESM_HIERARCHY>();
        //    var userManager = manager.FirstOrDefault(u => u.COMP_USER_ID == user.COMP_USER_ID);
        //    int? mgrId = null;

        //    if (userManager != null)
        //    {
        //        mgrId = userManager.MGR_USER_ID;
        //    }

        //    return mgrId;
        //}

        //public static string GetApprovingManagerName(this UserManager.User user)
        //{
        //    var name = "N/A";
        //    if (user.ApprovingManagerId.HasValue)
        //    {
        //        name = new ArgosyManager<ESM_COMP_USERS>().GetQuery().FirstOrDefault(a => a.COMP_USER_ID == user.Id).GetFullName() ?? "N/A";
        //    }
        //    return name;
        //}

        //public static bool IsEstimatedShipDateVisible(this ESM_COMP_USERS user)
        //{
        //    bool isShipDateVisible = false;

        //    if (user.COMP_USERGROUP_ID.HasValue && user.COMP_USERGROUP_ID > 0)
        //    {
        //        isShipDateVisible = user.ESM_COMP_USERGROUP.ESTIMATEDSHIPPINGDATE.HasValue && user.ESM_COMP_USERGROUP.ESTIMATEDSHIPPINGDATE.Value;
        //    }
        //    else
        //    {
        //        isShipDateVisible = user.ESM_COMPANY.FLAG_ESTIMATE_SHIP_DATE.ToUpper() == "Y";
        //    }

        //    return isShipDateVisible;
        //}

        //public static bool ispriceinformationvisible(this esm_comp_users user)
        //{
        //    bool ispriceinformationvisible = false;

        //    if (user.comp_usergroup_id.hasvalue && user.comp_usergroup_id > 0)
        //    {
        //        ispriceinformationvisible = user.esm_comp_usergroup.showprice.hasvalue && user.esm_comp_usergroup.showprice.value;
        //    }
        //    else
        //    {
        //        ispriceinformationvisible = user.esm_company.flag_show_price.toupper() == "y";
        //    }

        //    return ispriceinformationvisible;
        //}

        public static bool HasAdminAccess(this ESM_COMP_USERS user)
        {
            var hasAdminAccess = user.ADMIN_ACCESS.ToUpper() == "Y";
            return hasAdminAccess;
        }


        //public static bool IsCustomFieldVisible(this ESM_COMP_USERS user)
        //{
        //    bool isCustomFieldVisible = false;

        //    if (user.COMP_USERGROUP_ID.HasValue && user.COMP_USERGROUP_ID > 0)
        //    {
        //        isCustomFieldVisible = user.ESM_COMP_USERGROUP.FLAG_INCLUDE_CUSTOM_FIELDS.ToUpper() == "Y";
        //    }
        //    else
        //    {
        //        isCustomFieldVisible = user.ESM_COMPANY.FLAG_INCLUDE_CUSTOM_FIELDS.ToUpper() == "Y";
        //    }

        //    return isCustomFieldVisible;
        //}

        //public static string GetFullNameAppManager(this ESM_ACCOUNTING_UNIT_APPROVAL user)
        //{
        //    if (string.IsNullOrWhiteSpace(user?.ESM_COMP_USERS?.FIRST_NAME) && string.IsNullOrWhiteSpace(user?.ESM_COMP_USERS?.LAST_NAME))
        //    {
        //        return user?.ESM_COMP_USERS?.USERNAME ?? "";
        //    }
        //    return (user.ESM_COMP_USERS.FIRST_NAME + " " + user.ESM_COMP_USERS.LAST_NAME).Trim();
        //}

        //public static List<int> GetChildUserIds(this ESM_COMP_USERS user)
        //{
        //    var result = new HierarchyManager().GetChildUsers(user.COMP_USER_ID).ToList();

        //    var userIds = new List<int>();
        //    if (result.Any())
        //    {
        //        userIds.AddRange(result.Select(u => u.COMP_USER_ID));
        //    }
        //    return userIds;
        //}

        //public static DayOfWeek? GetEstimatedShippingDay(this ESM_COMP_USERS user)
        //{
        //    DayOfWeek dayOfWeek;

        //    if (!string.IsNullOrWhiteSpace(user.ESM_COMP_USERGROUP?.SHIPPING_DAY) && Enum.TryParse(user.ESM_COMP_USERGROUP.SHIPPING_DAY, true, out dayOfWeek))
        //    {
        //        return dayOfWeek;
        //    }
        //    if (!string.IsNullOrWhiteSpace(user.ESM_COMPANY.SHIPPING_DAY) && Enum.TryParse(user.ESM_COMPANY.SHIPPING_DAY, true, out dayOfWeek))
        //    {
        //        return dayOfWeek;
        //    }

        //    return null;
        //}

        //public static int? GetDefaultWarehouseId(this ESM_COMP_USERS user)
        //{
        //    return user.ESM_COMP_USERGROUP.WAREHOUSE_ID.HasValue ? user.ESM_COMP_USERGROUP.WAREHOUSE_ID : user.ESM_COMPANY.WAREHOUSE_ID;
        //}
        //public static OrderStatus GetDefaultOrderStatus(this ESM_COMP_USERS user)
        //{
        //    return user.ESM_COMP_USERGROUP.ORDERSTATUS.StringToBool() ? OrderStatus.Released : OrderStatus.Firmed;
        //}
        //public static UserSettings GetUserSettings(this ESM_COMP_USERS user)
        //{
        //    return new UserSettings(user);
        //}

        //public static bool IsSpendingLimitExceeded(this IUser userToApprove, decimal totalCost)
        //{
        //    if (totalCost == 0) return false;
        //    if (userToApprove.Settings.CompanyTimeInterval != TimeInterval.None)
        //    {
        //        DateUtility.GetIntervalDates(userToApprove.Settings.CompanyTimeInterval, out var intervalStartDate, out var intervalEndDate);
        //        var manager = new ArgosyManager<VW_ORDER_PRICING_INFO>();
        //        var query = manager.GetQuery();
        //        query =
        //            query.Where(
        //                o =>
        //                    o.COMP_USER_ID == userToApprove.Id &&
        //                    o.ORDER_DATE <= intervalEndDate && o.ORDER_DATE >= intervalStartDate);
        //        decimal amountSpent = 0;
        //        if (query.Any())
        //        {
        //            var sum = query.Sum(o => o.ORDER_TOTAL);
        //            if (sum != null)
        //            {
        //                amountSpent = (decimal)sum;
        //            }
        //        }
        //        return amountSpent + totalCost > userToApprove.SpendingLimit;
        //    }

        //    return totalCost > userToApprove.SpendingLimit;
        //}

        //public static bool IsApprovalRouting(this IUser user)
        //{
        //    var manager = new ArgosyManager<ESM_APPROVAL_ROUTING>();
        //    var query = manager.GetQuery();
        //    if (user.UserGroup != null)
        //    {
        //        query = query.Where(a => a.USER_GROUP_ID == user.UserGroupId.Value).OrderBy(e => e.APPROVING_AMOUNT_THRESHOLD);
        //    }
        //    if (!query.Any())
        //    {
        //        query = query.Where(a => a.COMPANY_ID == user.CompanyId).OrderBy(e => e.APPROVING_AMOUNT_THRESHOLD);
        //    }
        //    return query.Any();
        //}

        //public static bool AccountingUnitHasApprovingManager(this IUser user)
        //{
        //    var manager = new ArgosyManager<ESM_ACCOUNTING_UNIT_APPROVAL>();
        //    if (user.AccountingUnitId.HasValue)
        //    {
        //        return manager.Any(a => a.ACCOUNTING_UNIT_ID == user.AccountingUnitId.Value);
        //    }
        //    return false;
        //}

        //public static string SetDefaultPasswordIfNull(this UserManager.User user)
        //{
        //    return user.Password.IsNullOrWhiteSpace() ? UserPasswordManager.Encrypt("wElcome2Prop@go!") : user.Password;
        //}

        //public static void SetDefaultsForNewUser(this UserManager.User user)
        //{
        //    user.PhoneNumber = user.PhoneNumber.CleanPhoneNumber();
        //    user.PhoneNumber2 = user.PhoneNumber2.CleanPhoneNumber();
        //    user.PhoneNumber3 = user.PhoneNumber3.CleanPhoneNumber();
        //    user.FullName = user.GetFullName();
        //    user.Fax = user.Fax.CleanPhoneNumber();

        //    user.PhoneNumber = user.PhoneNumber.IsNullOrEmpty() ? string.Empty : user.PhoneNumber;
        //    user.PhoneNumber2 = user.PhoneNumber2.IsNullOrEmpty() ? string.Empty : user.PhoneNumber2;
        //    user.PhoneNumber3 = user.PhoneNumber3.IsNullOrEmpty() ? string.Empty : user.PhoneNumber3;
        //    user.Photo = user.Photo.IsNullOrEmpty() ? string.Empty : user.Photo;
        //    user.UserTitle = user.UserTitle.IsNullOrEmpty() ? string.Empty : user.UserTitle;
        //    user.Title2 = user.Title2.IsNullOrEmpty() ? string.Empty : user.Title2;
        //    user.DefaultLogo = user.DefaultLogo.IsNullOrEmpty() ? string.Empty : user.DefaultLogo;
        //    user.ExtIdentifier = user.ExtIdentifier.IsNullOrEmpty() ? string.Empty : user.ExtIdentifier;
        //    user.ExternalId = user.ExternalId.IsNullOrEmpty() ? string.Empty : user.ExternalId;
        //    user.DivisionName = user.DivisionName.IsNullOrEmpty() ? string.Empty : user.DivisionName;
        //    user.RfqModuleAccess = user.RfqModuleAccess;
        //    user.BillingAccess = user.BillingAccess;
        //    user.Name = user.Name.IsNullOrEmpty() ? string.Empty : user.Name;
        //    user.ProjectRevisionAccess = user.ProjectRevisionAccess;
        //    user.EmailDistr = user.EmailDistr;
        //    user.Fax = user.Fax.IsNullOrEmpty() ? string.Empty : user.Fax;
        //    user.IsStore = user.IsStore;

        //    user.CompanyName = user.CompanyName.IsNullOrEmpty() ? string.Empty : user.CompanyName;
        //    user.SpendingLimit = user.SpendingLimit;
        //    user.Website = user.Website.IsNullOrEmpty() ? string.Empty : user.Website;

        //    user.Address1 = user.Address1.IsNullOrEmpty() ? string.Empty : user.Address1;
        //    user.City = user.City.IsNullOrEmpty() ? string.Empty : user.City;
        //    user.ZipCode = user.ZipCode.IsNullOrEmpty() ? string.Empty : user.ZipCode;
        //    user.UserGuid = Guid.NewGuid();
        //}

        //public static void EncryptPassword(this UserManager.User user)
        //{
        //    user.Password = UserPasswordManager.Encrypt(user.Password.IsNullOrWhiteSpace() ? "wElcome2Prop@go!" : user.Password);
        //}
        //public static void EncryptPassword(this ESM_COMP_USERS user)
        //{
        //    user.PASSWORD = UserPasswordManager.Encrypt(user.PASSWORD.IsNullOrWhiteSpace() ? "wElcome2Prop@go!" : user.PASSWORD);
        //}

        //public static string GetUserProfilePhotoFromDb(this ESM_COMP_USERS user)
        //{
        //    var photoUrl = "";
        //    if (user?.COMPANY_ID != null && !string.IsNullOrEmpty(user.USER_PHOTO) && !user.USER_PHOTO.Contains("/"))
        //    {
        //        var photoInfo = FileFactory.GetInstance(FileLocations.CustomerLogo, user.USER_PHOTO, null,
        //            user.COMPANY_ID);

        //        photoUrl = photoInfo.Uri.AbsoluteUri;
        //    }
        //    return photoUrl;
        //}
        //public static string GetUserProfilePhotoToDb(this string filePath)
        //{
        //    var logoUrl = FileUtility.GetFileNameForFileUrl(filePath);
        //    return logoUrl;
        //}
        //public static string GetUserCompanyLogoFromDb(this ESM_COMP_USERS user)
        //{
        //    var logoUrl = "";
        //    if (user?.COMPANY_ID != null && !string.IsNullOrEmpty(user.DEFAULT_LOGO) && !user.DEFAULT_LOGO.Contains("/"))
        //    {
        //        var logoInfo = FileFactory.GetInstance(FileLocations.CustomerLogo, user.DEFAULT_LOGO, null,
        //            user.COMPANY_ID);

        //        logoUrl = logoInfo.Uri.AbsoluteUri;
        //    }
        //    return logoUrl;
        //}

        //public static string GetUserCompanyLogoToDb(this string filePath)
        //{
        //    var logoUrl = FileUtility.GetFileNameForFileUrl(filePath);
        //    return logoUrl;
        //}

        //public static string GetDefaultLoginUrl(this ESM_COMP_USERS user)
        //{
        //    var company = user.ESM_COMPANY ?? (user.COMPANY_ID.HasValue ? new ArgosyManager<ESM_COMPANY>().Get(user.COMPANY_ID.Value) : null);
        //    return company.GetCompanyLoginPath(user.SITE_ID.GetValueOrDefault(0));
        //}

        //public static StateManager.State GetState(this ESM_COMP_USERS user)
        //{
        //    var stateManager = new V5.Managers.StateManager();
        //    if (user.STATE.HasValue)
        //    {
        //        return stateManager.GetState(user.STATE.Value).ToMappedModel<ESM_STATES, StateManager.State>();
        //    }
        //    return null;
        //}

        //public static CountryManager.Country GetCountry(this UserManager.User user)
        //{
        //    return user.State?.Country;
        //}

        //public static int? GetCountryId(this ESM_COMP_USERS user)
        //{
        //    if (user.STATE.HasValue && user.ESM_STATES != null)
        //    {
        //        return user.ESM_STATES.COUNTRY_ID;
        //    }
        //    return null;

        //}

        //public static IContactAddress ToContactAddress(this UserManager.User user, AddressType type, bool isEdelivery = false)
        //{
        //    return new ContactAddress
        //    {
        //        State = isEdelivery && type == AddressType.Shipping ? null : user.State,
        //        Country = isEdelivery && type == AddressType.Shipping ? null : user.Country,
        //        Name = user.CompanyName,
        //        AddressLine1 = isEdelivery && type == AddressType.Shipping ? "Electronic Delivery" : user.Address1,
        //        AddressLine2 = isEdelivery && type == AddressType.Shipping ? user.Email : user.Address2,
        //        AddressLine3 = isEdelivery && type == AddressType.Shipping ? "" : user.Address3,
        //        City = isEdelivery && type == AddressType.Shipping ? "" : user.City,
        //        ZipCode = "",
        //        Email = user.Email,
        //        PhoneNumber = ""
        //    };
        //}

        //public static List<ESM_REPNEW_VIEWS> GetPublicReportsUserHasAccessTo(this ESM_COMP_USERS user)
        //{
        //    var publicReports = new List<ESM_REPNEW_VIEWS>();

        //    if (user != null)
        //    {
        //        var reortViewManager = new ArgosyManager<ESM_REPNEW_VIEWS>();
        //        string userId = user.COMP_USER_ID.ToString();
        //        var reports = reortViewManager.Find(r => ((r.COMP_USER_ID == user.COMP_USER_ID || r.VIEW_USER_IDS.Contains(userId)) && r.FLAG_IS_REPORT_PUBLIC == "Y") && r.REPORT_TYPE != "B");
        //        if (reports.Any())
        //        {
        //            publicReports.AddRange(reports);
        //        }
        //    }

        //    return publicReports;
        //}

        //public static List<ESM_REPNEW_VIEWS> GetUserReports(this ESM_COMP_USERS user)
        //{
        //    var publicReports = new List<ESM_REPNEW_VIEWS>();

        //    if (user != null)
        //    {
        //        var reortViewManager = new ArgosyManager<ESM_REPNEW_VIEWS>();
        //        string userId = user.COMP_USER_ID.ToString();
        //        var reports = reortViewManager.Find(r => (r.COMP_USER_ID == user.COMP_USER_ID || (r.COMPANY_ID == user.COMPANY_ID && r.FLAG_IS_REPORT_PUBLIC == "Y")) && r.REPORT_TYPE != "B");
        //        if (reports.Any())
        //        {
        //            publicReports.AddRange(reports);
        //        }
        //    }

        //    return publicReports;
        //}

        //public static bool IsApprovingManager(this ESM_COMP_USERS user, int orderUserId, bool isAdmin, int orderId, bool isApprovalWorkflow)
        //{
        //    if (isAdmin || user.COMP_USER_ID == orderUserId)
        //    {
        //        return true;
        //    }
        //    if (isApprovalWorkflow)
        //    {
        //        return new ArgosyManager<ESM_ORDER_APPROVER_WORKFLOW>().Any(a => a.ORDER_ID == orderId && a.COMP_USER_ID == user.COMP_USER_ID && a.ESM_APPROVALS == null);
        //    }
        //    else
        //    {
        //        var manager = new ArgosyManager<ESM_HIERARCHY>();
        //        var result = manager.FirstOrDefault(u => u.COMP_USER_ID == orderUserId);
        //        var loadedManagerIds = new List<int>();
        //        if (result != null)
        //        {
        //            loadedManagerIds.Add(result.MGR_USER_ID.GetValueOrDefault());
        //        }

        //        while (result != null)
        //        {
        //            if (result.MGR_USER_ID == user.COMP_USER_ID)
        //            {
        //                return true;
        //            }
        //            var managerId = result.MGR_USER_ID.GetValueOrDefault();
        //            if (!loadedManagerIds.Contains(managerId))
        //            {
        //                result = manager.FirstOrDefault(u => u.COMP_USER_ID == managerId);
        //                loadedManagerIds.Add(managerId);
        //            }
        //            else
        //            {
        //                //stop the case where ESM_HIERARCHY gets a circular refrence.
        //                return false;
        //            }
        //        }

        //        var isApprovingManager = false;
        //        using (var entities = new ArgosyEntities())
        //        {
        //            var response = entities.SP_GET_ORDER_APPROVING_MANAGER(orderId).FirstOrDefault();
        //            if (response.HasValue)
        //            {
        //                isApprovingManager = user.COMP_USER_ID == response.Value;
        //            }
        //        }
        //        return isApprovingManager;
        //    }
        //}

        //public static ESM_COMP_USERS GetBaseUserEntity(this UserManager.User user)
        //{
        //    var now = DateTime.Now;
        //    var stateId = 0;
        //    if (user.StateId.HasValue && user.StateId > 0)
        //    {
        //        stateId = user.StateId.Value;
        //    }
        //    else if (user.State != null)
        //    {
        //        stateId = user.State.StateId;
        //    }
        //    var newUser = new ESM_COMP_USERS
        //    {
        //        USERNAME = user.Username,
        //        ACTIVE = "Y",
        //        SITE_ID = user.SiteId,
        //        EMAIL = user.Email,
        //        DATECREATED = now,
        //        DATEMODIFIED = now,
        //        FIRST_NAME = user.FirstName ?? string.Empty,
        //        LAST_NAME = user.LastName ?? string.Empty,
        //        PASSWORD = user.Password,
        //        ADDRESS1 = user.Address1 ?? string.Empty,
        //        ADDRESS2 = user.Address2.IsNullOrEmpty() ? string.Empty : user.Address2,
        //        ADDRESS3 = user.Address3.IsNullOrEmpty() ? string.Empty : user.Address3,
        //        CITY = user.City ?? string.Empty,
        //        STATE = stateId,
        //        ZIP = user.ZipCode ?? string.Empty,
        //        PHONE_NUMBER = user.PhoneNumber ?? string.Empty,
        //        PHONE_NUMBER2 = user.PhoneNumber2 ?? string.Empty,
        //        PHONE_NUMBER3 = user.PhoneNumber3 ?? string.Empty,
        //        COMP_USERGROUP_ID = user.UserGroupId,
        //        USER_PHOTO = user.Photo ?? string.Empty,
        //        TITLE = user.UserTitle ?? string.Empty,
        //        TITLE2 = user.Title2 ?? string.Empty,
        //        COMPANY_ID = user.CompanyId,
        //        CUSTOM01 = user.Custom01,
        //        CUSTOM02 = user.Custom02,
        //        CUSTOM03 = user.Custom03,
        //        DEFAULT_LOGO = user.DefaultLogo.GetUserCompanyLogoToDb(),
        //        EXT_IDENTIFIER = user.ExtIdentifier ?? string.Empty,
        //        DIVISION_NAME = user.DivisionName ?? string.Empty,
        //        FLAG_RFQ_MODULE = user.RfqModuleAccess.BoolToString(),
        //        BILLING_ACCESS = user.BillingAccess.BoolToString(),
        //        NAME = user.Name ?? string.Empty,
        //        COMP_USER_GUID = user.UserGuid,
        //        PROJECT_REVISION_ACCESS = user.ProjectRevisionAccess.BoolToString(),
        //        EMAIL_DISTR = user.EmailDistr.BoolToString(),
        //        ADMIN_ACCESS = user.AdminAccess.BoolToString(),
        //        POWER_BUYER = user.PowerBuyer.BoolToString(),
        //        PRINT_ORDERS = user.PrintOrders.BoolToString(),
        //        FAX = user.Fax.StringToNullableDecimal(),
        //        FLAG_ALLOW_BULK_ORDER_PLACEMENT = user.AllowBulkOrder,
        //        FLAG_EMAIL_ORDER_PLACED = user.OrderPlaced,
        //        IS_STORE = user.IsStore,
        //        FLAG_EMAIL_ORDER_SHIPPED = user.OrderShipped,
        //        USRAGR_COMPANY = user.CompanyName,
        //        SPENDING_LIMIT = user.SpendingLimit,
        //        WEBSITE = user.Website ?? string.Empty,
        //        ACCOUNTING_UNIT_ID = user.AccountingUnitId,
        //        EXTERNAL_ID = user.ExternalId,
        //        INCLUSION_TAGS = user.InclusionTags,
        //        EXCLUSION_TAGS = user.ExclusionTags,
        //        IS_SSO = user.IsSSOUser,
        //        IS_GENERIC_USER = user.IsGenericUser,

        //    };
        //    return newUser;
        //}

        ///// <summary>
        ///// Used for SSO integrations such as SAML and cXML, will concatenate username with a suffix by default.
        ///// If addSuffixRegardless is set to false it will only add suffix if the username exists already.
        ///// Also will trim the username to 100 character limit of the database.
        ///// </summary>
        ///// <param name="user"></param>
        ///// <param name="suffix"></param>
        ///// <param name="addSuffixRegardless"></param>
        //public static void SetUsernameForSSO(this UserManager.User user, string suffix, bool addSuffixRegardless = true)
        //{
        //    user.Username = GetUsernameForSSO(user.Username);
        //    if (user.IsUserNameExists(user.SiteId) || addSuffixRegardless)
        //    {
        //        user.Username += suffix;
        //    }
        //}

        ///// <summary>
        ///// Used for SSO integrations such as SAML and cXML, will concatenate username with a suffix by default.
        ///// If addSuffixRegardless is set to false it will only add suffix if the username exists already.
        ///// Also will trim the username to 100 character limit of the database.
        ///// </summary>
        ///// <param name="user"></param>
        ///// <param name="suffix"></param>
        ///// <param name="addSuffixRegardless"></param>
        //public static void SetUsernameForSSO(this ESM_COMP_USERS user, string suffix, bool addSuffixRegardless = true)
        //{
        //    user.USERNAME = GetUsernameForSSO(user.USERNAME);
        //    if (user.IsUserNameExists(user.SITE_ID ?? 0) || addSuffixRegardless)
        //    {
        //        user.USERNAME += suffix;
        //    }
        //}

        //private static string GetUsernameForSSO(string username)
        //{
        //    username = username.CheckForLength(100).Trim();
        //    return username;
        //}

        //public static bool DoesUserNameExist(string username, int siteId)
        //{
        //    var manager = new ArgosyManager<ESM_COMP_USERS>();

        //    var doseExist = siteId > 0 ? manager.Any(c => c.USERNAME.Trim().Equals(username.Trim(), StringComparison.InvariantCultureIgnoreCase) && c.SITE_ID == siteId)
        //                               : manager.Any(c => c.USERNAME.Trim().Equals(username.Trim(), StringComparison.InvariantCultureIgnoreCase));

        //    return doseExist;
        //}

        //public static bool IsUserNameExists(this UserManager.User user, int siteId = 0)
        //{
        //    return DoesUserNameExist(user.Username, siteId);
        //}

        //public static bool IsUserNameExists(this ESM_COMP_USERS user, int siteId = 0)
        //{
        //    return DoesUserNameExist(user.USERNAME, siteId);
        //}

        //public static void CopyGuestCartToUserCart(this UserManager.User user, int originalUserId, string sessionId)
        //{
        //    CartManager.MigrateUserCart(originalUserId, sessionId, user.UserId);
        //    AssetManager.MigrateUserCart(originalUserId, user.UserId);
        //}
        //public static void CopyGuestCartToUserCart(this ESM_COMP_USERS user, int originalUserId, string sessionId)
        //{
        //    CartManager.MigrateUserCart(originalUserId, sessionId, user.COMP_USER_ID);
        //    AssetManager.MigrateUserCart(originalUserId, user.COMP_USER_ID);
        //}

        //public static void UpdateInclusionTags(this UserManager.User user)
        //{
        //    user.InclusionTags = user.InclusionArray != null
        //        ? string.Join(",", user.InclusionArray.Distinct())
        //        : null;
        //    new ArgosyManager<ESM_COMP_USERS>().Update(x => { x.INCLUSION_TAGS = user.InclusionTags; },
        //        x => x.COMP_USER_ID == user.UserId);
        //}

        //public static void UpdateExclusionTags(this UserManager.User user)
        //{
        //    user.ExclusionTags = user.ExclusionArray != null
        //        ? string.Join(",", user.ExclusionArray.Distinct())
        //        : null;
        //    new ArgosyManager<ESM_COMP_USERS>().Update(x => { x.EXCLUSION_TAGS = user.ExclusionTags; },
        //        x => x.COMP_USER_ID == user.UserId);
        //}

        //public static List<string> GetInclusionArray(this ESM_COMP_USERS user)
        //{
        //    return user.INCLUSION_TAGS?.Split(',').ToList() ?? new List<string>();
        //}

        //public static List<string> GetExclusionArray(this ESM_COMP_USERS user)
        //{
        //    return user.EXCLUSION_TAGS?.Split(',').ToList() ?? new List<string>();
        //}

        //public static IEnumerable<BucketManager.Bucket> GetBucketsForPartId(this IUser user, int partId)
        //{
        //    var bucketParts = new ViewCoopBucketPartManager().GetCompanyBucketParts(user.CompanyId, partId);
        //    var buckets = new List<BucketManager.Bucket>();
        //    Expression<Func<ViewCoopBucketPart, bool>>
        //        userGroupCondition = x =>
        //            x.COMP_USERGROUP_ID.HasValue && user.UserGroupId.HasValue && x.COMP_USERGROUP_ID.Value == user.UserGroupId.Value &&
        //            (!x.COMP_USER_ID.HasValue || x.COMP_USER_ID.Value == 0) && x.BALANCE.HasValue && x.BALANCE.Value > 0,
        //        userCondition = x =>
        //            x.COMP_USER_ID.HasValue && x.COMP_USER_ID.Value == user.Id &&
        //            !x.COMP_USERGROUP_ID.HasValue && x.BALANCE.HasValue && x.BALANCE.Value > 0;
        //    if (bucketParts != null)
        //    {
        //        if (bucketParts.Any(userGroupCondition))
        //        {
        //            var userGroupBucketParts = bucketParts.Where(userGroupCondition).AsEnumerable();
        //            buckets.AddRange(userGroupBucketParts.GroupBy(x => x.BUCKET_ID, (bucketId, bucketInfo) =>
        //            {
        //                var bucketList = bucketInfo.ToList();
        //                var bucket = bucketList.First();
        //                var bucketItem = new BucketManager.Bucket
        //                {
        //                    Id = bucketId,
        //                    UserGroupAmountAvailable = bucket.BALANCE,
        //                    UserGroupAmountUsed = 0m,
        //                    Balance = bucket.BALANCE,
        //                    Name = bucket.BUCKET_NAME,
        //                    PartIds = bucketList.Select(x => x.PART_ID).ToList()
        //                };
        //                return bucketItem;
        //            }));
        //        }
        //        if (bucketParts.Any(userCondition))
        //        {
        //            var userBucketParts = bucketParts.Where(userCondition).AsEnumerable();
        //            buckets.AddRange(userBucketParts.GroupBy(x => x.BUCKET_ID, (bucketId, bucketInfo) =>
        //            {
        //                var bucketList = bucketInfo.ToList();
        //                var bucket = bucketList.First();
        //                var bucketItem = new BucketManager.Bucket
        //                {
        //                    Id = bucketId,
        //                    UserAmountAvailable = bucket.BALANCE,
        //                    UserAmountUsed = 0m,
        //                    Balance = bucket.BALANCE,
        //                    Name = bucket.BUCKET_NAME,
        //                    PartIds = bucketList.Select(x => x.PART_ID).ToList()
        //                };
        //                return bucketItem;
        //            }));
        //        }
        //    }
        //    return buckets.OrderBy(a => a.Name);
        //}

        //public static bool HasAvailableBillingAddresses(this ESM_COMP_USERS user)
        //{
        //    return CompanyAddressManager.HasAvailableBillingAddresses(user.COMP_USER_ID, user.COMPANY_ID.GetValueOrDefault());
        //}

        //public static CompanyAddressManager.Address GetAddress(this UserManager.User user, bool isEdeliveryOnly = false, bool isMailingListOnly = false)
        //{
        //    CompanyAddressManager.Address address;
        //    if (isMailingListOnly)
        //    {
        //        address = new CompanyAddressManager.Address
        //        {
        //            AddressLine1 = "Mailing List Delivery",
        //            AddressLine2 = string.Empty,
        //            AddressLine3 = string.Empty,
        //            Name = "Multiple Receipients",
        //            Company = string.Empty,
        //            City = string.Empty,
        //            Country = null,
        //            Email = string.Empty,
        //            PhoneNumber = string.Empty,
        //            State = null,
        //            ZipCode = string.Empty
        //        };
        //    }
        //    else
        //    {
        //        address = new CompanyAddressManager.Address
        //        {
        //            AddressLine1 = isEdeliveryOnly ? "Electronic Delivery" : user.Address1,
        //            AddressLine2 = isEdeliveryOnly ? user.Email : user.Address2,
        //            AddressLine3 = isEdeliveryOnly ? "" : user.Address3,
        //            Name = user.FirstName + " " + user.LastName,
        //            Company = user.DivisionName,
        //            City = isEdeliveryOnly ? "NA" : user.City,
        //            Country = isEdeliveryOnly ? null : user.Country,
        //            Email = user.Email,
        //            PhoneNumber = user.PhoneNumber,
        //            State = isEdeliveryOnly ? null : user.State,
        //            StateId = user.StateId ?? 0,
        //            CountryId = user.CountryId,
        //            ZipCode = user.ZipCode
        //        };
        //    }
        //    return address;
        //}
    }
}
