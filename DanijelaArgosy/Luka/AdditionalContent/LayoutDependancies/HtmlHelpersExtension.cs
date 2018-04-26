using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;
using System.Web.Mvc.Html;
using System.Web.UI;
using Argosy.Common.Contracts.Contract;
//using Argosy.Web.FrontEnd.Areas.Store.Models;
using Argosy.Web.FrontEnd.Core.Helpers;
//using Cerqa.Common.V5;
//using Cerqa.Common.V5.Structs;
using static System.String;

namespace Argosy.Web.FrontEnd.Core.Extensions
{
    public static class HtmlHelperExtensions
    {

        public static MvcHtmlString BasicCheckBoxFor<T>(this HtmlHelper<T> html,
                                                Expression<Func<T, bool>> expression,
                                                object htmlAttributes = null)
        {
            var originalCheckbox = html.CheckBoxFor(expression, htmlAttributes);
            const string pattern = @"<input name=""[^""]+"" type=""hidden"" value=""false"" />";
            var single = Regex.Replace(originalCheckbox.ToString(), pattern, "");
            return MvcHtmlString.Create(single);
        }
        public static MvcHtmlString EditorLabelFor<T>(this HtmlHelper<T> html,
                                                Expression<Func<T, string>> expression,
                                                object htmlAttributes = null)
        {
            //var baseLabel = "<label for='" + html.ViewData.ModelMetadata.PropertyName + "'>" + html.ViewData.ModelMetadata.GetDisplayName() + "</label>";
            var baseLabel = html.LabelFor(expression, htmlAttributes).ToString();
            if (html.ViewData.ModelMetadata.IsRequired)
            {
                baseLabel += "<b class='co-warning'>*</b>";
            }
            return MvcHtmlString.Create(baseLabel);
        }

        public static MvcHtmlString RenderMenu(this List<MenuItem> items, string id = "")
        {
            if (items != null && items.Any())
            {
                var format = "<ul id='{0}'>{1}</ul>";
                var itemString = "";
                foreach (var item in items)
                {
                    itemString += RenderListItem(item);
                }
                return MvcHtmlString.Create(Format(format, id, itemString));
            }
            return MvcHtmlString.Empty;
        }

        public static MvcHtmlString RenderListItem(this MenuItem item)
        {
            var hrefFormat = "<li class='{0}'><a {1} style='display:block' class='{2}' href='{3}'>{4}</a>{5}</li>";
            var baseFormat = "<li class='{0}'><a {1} style='display:block' class='{2}'>{3}</a>{4}</li>";
            var rawHtmlFormat = "<li class='{0}'>{1}</li>";
            var attributes = GenerateAttributes(item.Attributes);
            var generatedHtml = "";
            if (item.IsRawHtml)
            {
                generatedHtml = Format(rawHtmlFormat, item.ListClass, item.Html);
            }
            else if (item.IsHref)
            {
                generatedHtml = Format(hrefFormat, item.ListClass, attributes, item.CssClass, item.Href, item.Text, RenderMenu(item.Children));
            }
            else
            {
                generatedHtml = Format(baseFormat, item.ListClass, attributes, item.CssClass, item.Text, RenderMenu(item.Children));
            }
            return MvcHtmlString.Create(generatedHtml);
        }

        private static string GenerateAttributes(Dictionary<string, string> attributes)
        {
            var results = "";
            var attributeFormat = "{0}='{1}' ";
            if (attributes != null && attributes.Any())
            {
                results = attributes.Aggregate(results, (current, attribute) => current + Format(attributeFormat, attribute.Key, new HtmlString(attribute.Value)));
            }
            return " " + results;
        }

        

        public static string RenderRazorViewToString(this ControllerContext context, string viewName, object model, ModelStateDictionary modelState = null)
        {
            if (IsNullOrEmpty(viewName))
                viewName = context.RouteData.GetRequiredString("action");

            var viewData = new ViewDataDictionary(model);
            if (modelState != null)
            {
                //viewData.ModelState
                foreach (var state in modelState)
                {
                    viewData.ModelState.Add(state.Key, state.Value);
                }
            }

            using (var sw = new StringWriter())
            {
                var viewResult = ViewEngines.Engines.FindPartialView(context, viewName);
                var viewContext = new ViewContext(context, viewResult.View, viewData, new TempDataDictionary(), sw);
                viewResult.View.Render(viewContext, sw);

                return sw.GetStringBuilder().ToString();
            }
        }

        public static MvcHtmlString EditorForDictionary<TModel, TIn, TOut>(this HtmlHelper<TModel> htmlHelper, Expression<Func<TModel, IDictionary<TIn, TOut>>> expression)
        {
            return EditorForDictionary(htmlHelper, expression, null);
        }

        public static MvcHtmlString EditorForDictionary<TModel, TIn, TOut>(this HtmlHelper<TModel> htmlHelper, Expression<Func<TModel, IDictionary<TIn, TOut>>> expression, object htmlAttributes)
        {
            return EditorForDictionary(htmlHelper, expression, HtmlHelper.AnonymousObjectToHtmlAttributes(htmlAttributes));
        }

        public static MvcHtmlString EditorForDictionary<TModel, TIn, TOut>(this HtmlHelper<TModel> htmlHelper, Expression<Func<TModel, IDictionary<TIn, TOut>>> expression, IDictionary<string, object> htmlAttributes)
        {
            var metadata = ModelMetadata.FromLambdaExpression(expression, htmlHelper.ViewData);
            return EditorHelper(htmlHelper,
                metadata,
                (IDictionary<TIn, TOut>)metadata.Model,
                ExpressionHelper.GetExpressionText(expression),
                htmlAttributes);
        }

        private static MvcHtmlString EditorHelper<TIn, TOut>(HtmlHelper htmlHelper, ModelMetadata metadata, IDictionary<TIn, TOut> values, string expression, IDictionary<string, object> htmlAttributes)
        {
            return InputHelper(htmlHelper, metadata, InputType.Text, values, expression, htmlAttributes);
        }

        private static MvcHtmlString InputHelper<TIn, TOut>(HtmlHelper htmlHelper, ModelMetadata metadata, InputType inputType, IDictionary<TIn, TOut> values, string expression, IDictionary<string, object> htmlAttributes)
        {
            return new MvcHtmlString(Join("\n", values.Select((kv, i) => InputHelperIndexed(htmlHelper, metadata, inputType, kv, i, expression, htmlAttributes).ToHtmlString())));
        }

        private static MvcHtmlString InputHelperIndexed<TIn, TOut>(HtmlHelper htmlHelper, ModelMetadata metadata, InputType inputType, KeyValuePair<TIn, TOut> keyValuePair, int index, string expression, IDictionary<string, object> htmlAttributes)
        {
            var fullName = htmlHelper.ViewContext.ViewData.TemplateInfo.GetFullHtmlFieldName(expression);
            if (IsNullOrEmpty(fullName))
            {
                throw new ArgumentException("Field name is null or empty.");
            }

            var strings = new List<string>(2) {InputHelperForKey(htmlHelper, metadata, expression, fullName, index, keyValuePair.Key),
                InputHelperForValue(htmlHelper, metadata, inputType, expression, htmlAttributes, fullName, index, keyValuePair.Value)};

            return new MvcHtmlString(Join("\n", strings));
        }

        private static string InputHelperForKey<TIn>(HtmlHelper htmlHelper, ModelMetadata metadata, string expression, string fullName, int index, TIn key)
        {
            return InputTagHelper(htmlHelper, metadata, InputType.Hidden, expression, null, fullName, index, "Key", key.ToString());
        }

        private static string InputHelperForValue<TOut>(HtmlHelper htmlHelper, ModelMetadata metadata, InputType inputType, string expression, IDictionary<string, object> htmlAttributes, string fullName, int index, TOut value)
        {
            return InputTagHelper(htmlHelper, metadata, inputType, expression, htmlAttributes, fullName, index, "Value", value.ToString());
        }

        private static string InputTagHelper(HtmlHelper htmlHelper, ModelMetadata metadata, InputType inputType, string expression, IDictionary<string, object> htmlAttributes, string fullName, int index, string fieldType, string val)
        {
            var tagBuilder = new TagBuilder("input");
            tagBuilder.MergeAttributes(htmlAttributes);
            tagBuilder.MergeAttribute("type", HtmlHelper.GetInputTypeString(inputType));
            tagBuilder.MergeAttribute("name", $"{fullName}[{index}].{fieldType}", true);
            tagBuilder.MergeAttribute("value", val);

            tagBuilder.GenerateId($"{fullName}_{index}_{fieldType}");

            ModelState modelState;

            if (htmlHelper.ViewData.ModelState.TryGetValue(fullName, out modelState))
            {
                if (modelState.Errors.Count > 0)
                {
                    tagBuilder.AddCssClass(HtmlHelper.ValidationInputCssClassName);
                }
            }

            if (metadata != null)
            {
                tagBuilder.MergeAttributes(htmlHelper.GetUnobtrusiveValidationAttributes(expression, metadata));
            }

            return tagBuilder.ToString(TagRenderMode.SelfClosing);
        }
    }
}
