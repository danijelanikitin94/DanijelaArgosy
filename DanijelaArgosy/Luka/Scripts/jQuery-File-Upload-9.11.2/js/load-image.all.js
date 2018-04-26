﻿!function(e) {
    "use strict";
    var t = function(e, i, a) {
            var o, r, n = document.createElement("img");
            if (n.onerror = i, n.onload = function() { !r || a && a.noRevoke || t.revokeObjectURL(r), i && i(t.scale(n, a)) }, t.isInstanceOf("Blob", e) || t.isInstanceOf("File", e)) o = r = t.createObjectURL(e), n._type = e.type;
            else {
                if ("string" != typeof e) return !1;
                o = e, a && a.crossOrigin && (n.crossOrigin = a.crossOrigin)
            }
            return o ? (n.src = o, n) : t.readFile(e, function(e) {
                var t = e.target;
                t && t.result ? n.src = t.result : i && i(e)
            })
        },
        i = window.createObjectURL && window || window.URL && URL.revokeObjectURL && URL || window.webkitURL && webkitURL;
    t.isInstanceOf = function(e, t) { return Object.prototype.toString.call(t) === "[object " + e + "]" }, t.transformCoordinates = function() {}, t.getTransformedOptions = function(e, t) {
        var i, a, o, r, n = t.aspectRatio;
        if (!n) return t;
        i = {};
        for (a in t) t.hasOwnProperty(a) && (i[a] = t[a]);
        return i.crop = !0, o = e.naturalWidth || e.width, r = e.naturalHeight || e.height, o / r > n ? (i.maxWidth = r * n, i.maxHeight = r) : (i.maxWidth = o, i.maxHeight = o / n), i
    }, t.renderImageToCanvas = function(e, t, i, a, o, r, n, s, d, l) { return e.getContext("2d").drawImage(t, i, a, o, r, n, s, d, l), e }, t.hasCanvasOption = function(e) { return e.canvas || e.crop || e.aspectRatio }, t.scale = function(e, i) {
        i = i || {};
        var a, o, r, n, s, d, l, c, u, g = document.createElement("canvas"), f = e.getContext || t.hasCanvasOption(i) && g.getContext, h = e.naturalWidth || e.width, m = e.naturalHeight || e.height, p = h, S = m,
            b = function() {
                var e = Math.max((r || p) / p, (n || S) / S);
                e > 1 && (p *= e, S *= e)
            },
            x = function() {
                var e = Math.min((a || p) / p, (o || S) / S);
                1 > e && (p *= e, S *= e)
            };
        return f && (i = t.getTransformedOptions(e, i), l = i.left || 0, c = i.top || 0, i.sourceWidth ? (s = i.sourceWidth, void 0 !== i.right && void 0 === i.left && (l = h - s - i.right)) : s = h - l - (i.right || 0), i.sourceHeight ? (d = i.sourceHeight, void 0 !== i.bottom && void 0 === i.top && (c = m - d - i.bottom)) : d = m - c - (i.bottom || 0), p = s, S = d), a = i.maxWidth, o = i.maxHeight, r = i.minWidth, n = i.minHeight, f && a && o && i.crop ? (p = a, S = o, u = s / d - a / o, 0 > u ? (d = o * s / a, void 0 === i.top && void 0 === i.bottom && (c = (m - d) / 2)) : u > 0 && (s = a * d / o, void 0 === i.left && void 0 === i.right && (l = (h - s) / 2))) : ((i.contain || i.cover) && (r = a = a || r, n = o = o || n), i.cover ? (x(), b()) : (b(), x())), f ? (g.width = p, g.height = S, t.transformCoordinates(g, i), t.renderImageToCanvas(g, e, l, c, s, d, 0, 0, p, S)) : (e.width = p, e.height = S, e)
    }, t.createObjectURL = function(e) { return i ? i.createObjectURL(e) : !1 }, t.revokeObjectURL = function(e) { return i ? i.revokeObjectURL(e) : !1 }, t.readFile = function(e, t, i) {
        if (window.FileReader) {
            var a = new FileReader;
            if (a.onload = a.onerror = t, i = i || "readAsDataURL", a[i]) return a[i](e), a
        }
        return !1
    }, "function" == typeof define && define.amd ? define(function() { return t }) : "object" == typeof module && module.exports ? module.exports = t : e.loadImage = t
}(window), function(e) {
    "use strict";
    "function" == typeof define && define.amd ? define(["load-image"], e) : e("object" == typeof module && module.exports ? require("./load-image") : window.loadImage)
}(function(e) {
    "use strict";
    if (window.navigator && window.navigator.platform && /iP(hone|od|ad)/.test(window.navigator.platform)) {
        var t = e.renderImageToCanvas;
        e.detectSubsampling = function(e) {
            var t, i;
            return e.width * e.height > 1048576 ? (t = document.createElement("canvas"), t.width = t.height = 1, i = t.getContext("2d"), i.drawImage(e, -e.width + 1, 0), 0 === i.getImageData(0, 0, 1, 1).data[3]) : !1
        }, e.detectVerticalSquash = function(e, t) {
            var i, a, o, r, n, s = e.naturalHeight || e.height, d = document.createElement("canvas"), l = d.getContext("2d");
            for (t && (s /= 2), d.width = 1, d.height = s, l.drawImage(e, 0, 0), i = l.getImageData(0, 0, 1, s).data, a = 0, o = s, r = s; r > a;) n = i[4 * (r - 1) + 3], 0 === n ? o = r : a = r, r = o + a >> 1;
            return r / s || 1
        }, e.renderImageToCanvas = function(i, a, o, r, n, s, d, l, c, u) {
            if ("image/jpeg" === a._type) {
                var g, f, h, m, p = i.getContext("2d"), S = document.createElement("canvas"), b = 1024, x = S.getContext("2d");
                if (S.width = b, S.height = b, p.save(), g = e.detectSubsampling(a), g && (o /= 2, r /= 2, n /= 2, s /= 2), f = e.detectVerticalSquash(a, g), g || 1 !== f) {
                    for (r *= f, c = Math.ceil(b * c / n), u = Math.ceil(b * u / s / f), l = 0, m = 0; s > m;) {
                        for (d = 0, h = 0; n > h;) x.clearRect(0, 0, b, b), x.drawImage(a, o, r, n, s, -h, -m, n, s), p.drawImage(S, 0, 0, b, b, d, l, c, u), h += b, d += c;
                        m += b, l += u
                    }
                    return p.restore(), i
                }
            }
            return t(i, a, o, r, n, s, d, l, c, u)
        }
    }
}), function(e) {
    "use strict";
    "function" == typeof define && define.amd ? define(["load-image"], e) : e("object" == typeof module && module.exports ? require("./load-image") : window.loadImage)
}(function(e) {
    "use strict";
    var t = e.hasCanvasOption, i = e.transformCoordinates, a = e.getTransformedOptions;
    e.hasCanvasOption = function(i) { return t.call(e, i) || i.orientation }, e.transformCoordinates = function(t, a) {
        i.call(e, t, a);
        var o = t.getContext("2d"), r = t.width, n = t.height, s = a.orientation;
        if (s && !(s > 8))
            switch (s > 4 && (t.width = n, t.height = r), s) {
            case 2:
                o.translate(r, 0), o.scale(-1, 1);
                break;
            case 3:
                o.translate(r, n), o.rotate(Math.PI);
                break;
            case 4:
                o.translate(0, n), o.scale(1, -1);
                break;
            case 5:
                o.rotate(.5 * Math.PI), o.scale(1, -1);
                break;
            case 6:
                o.rotate(.5 * Math.PI), o.translate(0, -n);
                break;
            case 7:
                o.rotate(.5 * Math.PI), o.translate(r, -n), o.scale(-1, 1);
                break;
            case 8:
                o.rotate(-.5 * Math.PI), o.translate(-r, 0)
            }
    }, e.getTransformedOptions = function(t, i) {
        var o, r, n = a.call(e, t, i), s = n.orientation;
        if (!s || s > 8 || 1 === s) return n;
        o = {};
        for (r in n) n.hasOwnProperty(r) && (o[r] = n[r]);
        switch (n.orientation) {
        case 2:
            o.left = n.right, o.right = n.left;
            break;
        case 3:
            o.left = n.right, o.top = n.bottom, o.right = n.left, o.bottom = n.top;
            break;
        case 4:
            o.top = n.bottom, o.bottom = n.top;
            break;
        case 5:
            o.left = n.top, o.top = n.left, o.right = n.bottom, o.bottom = n.right;
            break;
        case 6:
            o.left = n.top, o.top = n.right, o.right = n.bottom, o.bottom = n.left;
            break;
        case 7:
            o.left = n.bottom, o.top = n.right, o.right = n.top, o.bottom = n.left;
            break;
        case 8:
            o.left = n.bottom, o.top = n.left, o.right = n.top, o.bottom = n.right
        }
        return n.orientation > 4 && (o.maxWidth = n.maxHeight, o.maxHeight = n.maxWidth, o.minWidth = n.minHeight, o.minHeight = n.minWidth, o.sourceWidth = n.sourceHeight, o.sourceHeight = n.sourceWidth), o
    }
}), function(e) {
    "use strict";
    "function" == typeof define && define.amd ? define(["load-image"], e) : e("object" == typeof module && module.exports ? require("./load-image") : window.loadImage)
}(function(e) {
    "use strict";
    var t = window.Blob && (Blob.prototype.slice || Blob.prototype.webkitSlice || Blob.prototype.mozSlice);
    e.blobSlice = t && function() {
        var e = this.slice || this.webkitSlice || this.mozSlice;
        return e.apply(this, arguments)
    }, e.metaDataParsers = { jpeg: { 65505: [] } }, e.parseMetaData = function(t, i, a) {
        a = a || {};
        var o = this, r = a.maxMetaDataSize || 262144, n = {}, s = !(window.DataView && t && t.size >= 12 && "image/jpeg" === t.type && e.blobSlice);
        (s || !e.readFile(e.blobSlice.call(t, 0, r), function(t) {
            if (t.target.error) return console.log(t.target.error), void i(n);
            var r, s, d, l, c = t.target.result, u = new DataView(c), g = 2, f = u.byteLength - 4, h = g;
            if (65496 === u.getUint16(0)) {
                for (; f > g && (r = u.getUint16(g), r >= 65504 && 65519 >= r || 65534 === r);) {
                    if (s = u.getUint16(g + 2) + 2, g + s > u.byteLength) {
                        console.log("Invalid meta data: Invalid segment size.");
                        break
                    }
                    if (d = e.metaDataParsers.jpeg[r]) for (l = 0; l < d.length; l += 1) d[l].call(o, u, g, s, n, a);
                    g += s, h = g
                }
                !a.disableImageHead && h > 6 && (c.slice ? n.imageHead = c.slice(0, h) : n.imageHead = new Uint8Array(c).subarray(0, h))
            } else console.log("Invalid JPEG file: Missing JPEG marker.");
            i(n)
        }, "readAsArrayBuffer")) && i(n)
    }
}), function(e) {
    "use strict";
    "function" == typeof define && define.amd ? define(["load-image", "load-image-meta"], e) : "object" == typeof module && module.exports ? e(require("./load-image"), require("./load-image-meta")) : e(window.loadImage)
}(function(e) {
    "use strict";
    e.ExifMap = function() { return this }, e.ExifMap.prototype.map = { Orientation: 274 }, e.ExifMap.prototype.get = function(e) { return this[e] || this[this.map[e]] }, e.getExifThumbnail = function(e, t, i) {
        var a, o, r;
        if (!i || t + i > e.byteLength) return void console.log("Invalid Exif data: Invalid thumbnail data.");
        for (a = [], o = 0; i > o; o += 1) r = e.getUint8(t + o), a.push((16 > r ? "0" : "") + r.toString(16));
        return "data:image/jpeg,%" + a.join("%")
    }, e.exifTagTypes = { 1: { getValue: function(e, t) { return e.getUint8(t) }, size: 1 }, 2: { getValue: function(e, t) { return String.fromCharCode(e.getUint8(t)) }, size: 1, ascii: !0 }, 3: { getValue: function(e, t, i) { return e.getUint16(t, i) }, size: 2 }, 4: { getValue: function(e, t, i) { return e.getUint32(t, i) }, size: 4 }, 5: { getValue: function(e, t, i) { return e.getUint32(t, i) / e.getUint32(t + 4, i) }, size: 8 }, 9: { getValue: function(e, t, i) { return e.getInt32(t, i) }, size: 4 }, 10: { getValue: function(e, t, i) { return e.getInt32(t, i) / e.getInt32(t + 4, i) }, size: 8 } }, e.exifTagTypes[7] = e.exifTagTypes[1], e.getExifValue = function(t, i, a, o, r, n) {
        var s, d, l, c, u, g, f = e.exifTagTypes[o];
        if (!f) return void console.log("Invalid Exif data: Invalid tag type.");
        if (s = f.size * r, d = s > 4 ? i + t.getUint32(a + 8, n) : a + 8, d + s > t.byteLength) return void console.log("Invalid Exif data: Invalid data offset.");
        if (1 === r) return f.getValue(t, d, n);
        for (l = [], c = 0; r > c; c += 1) l[c] = f.getValue(t, d + c * f.size, n);
        if (f.ascii) {
            for (u = "", c = 0; c < l.length && (g = l[c], "\x00" !== g); c += 1) u += g;
            return u
        }
        return l
    }, e.parseExifTag = function(t, i, a, o, r) {
        var n = t.getUint16(a, o);
        r.exif[n] = e.getExifValue(t, i, a, t.getUint16(a + 2, o), t.getUint32(a + 4, o), o)
    }, e.parseExifTags = function(e, t, i, a, o) {
        var r, n, s;
        if (i + 6 > e.byteLength) return void console.log("Invalid Exif data: Invalid directory offset.");
        if (r = e.getUint16(i, a), n = i + 2 + 12 * r, n + 4 > e.byteLength) return void console.log("Invalid Exif data: Invalid directory size.");
        for (s = 0; r > s; s += 1) this.parseExifTag(e, t, i + 2 + 12 * s, a, o);
        return e.getUint32(n, a)
    }, e.parseExifData = function(t, i, a, o, r) {
        if (!r.disableExif) {
            var n, s, d, l = i + 10;
            if (1165519206 === t.getUint32(i + 4)) {
                if (l + 8 > t.byteLength) return void console.log("Invalid Exif data: Invalid segment size.");
                if (0 !== t.getUint16(i + 8)) return void console.log("Invalid Exif data: Missing byte alignment offset.");
                switch (t.getUint16(l)) {
                case 18761:
                    n = !0;
                    break;
                case 19789:
                    n = !1;
                    break;
                default:
                    return void console.log("Invalid Exif data: Invalid byte alignment marker.")
                }
                if (42 !== t.getUint16(l + 2, n)) return void console.log("Invalid Exif data: Missing TIFF marker.");
                s = t.getUint32(l + 4, n), o.exif = new e.ExifMap, s = e.parseExifTags(t, l, l + s, n, o), s && !r.disableExifThumbnail && (d = { exif: {} }, s = e.parseExifTags(t, l, l + s, n, d), d.exif[513] && (o.exif.Thumbnail = e.getExifThumbnail(t, l + d.exif[513], d.exif[514]))), o.exif[34665] && !r.disableExifSub && e.parseExifTags(t, l, l + o.exif[34665], n, o), o.exif[34853] && !r.disableExifGps && e.parseExifTags(t, l, l + o.exif[34853], n, o)
            }
        }
    }, e.metaDataParsers.jpeg[65505].push(e.parseExifData)
}), function(e) {
    "use strict";
    "function" == typeof define && define.amd ? define(["load-image", "load-image-exif"], e) : "object" == typeof module && module.exports ? e(require("./load-image"), require("./load-image-exif")) : e(window.loadImage)
}(function(e) {
    "use strict";
    e.ExifMap.prototype.tags = { 256: "ImageWidth", 257: "ImageHeight", 34665: "ExifIFDPointer", 34853: "GPSInfoIFDPointer", 40965: "InteroperabilityIFDPointer", 258: "BitsPerSample", 259: "Compression", 262: "PhotometricInterpretation", 274: "Orientation", 277: "SamplesPerPixel", 284: "PlanarConfiguration", 530: "YCbCrSubSampling", 531: "YCbCrPositioning", 282: "XResolution", 283: "YResolution", 296: "ResolutionUnit", 273: "StripOffsets", 278: "RowsPerStrip", 279: "StripByteCounts", 513: "JPEGInterchangeFormat", 514: "JPEGInterchangeFormatLength", 301: "TransferFunction", 318: "WhitePoint", 319: "PrimaryChromaticities", 529: "YCbCrCoefficients", 532: "ReferenceBlackWhite", 306: "DateTime", 270: "ImageDescription", 271: "Make", 272: "Model", 305: "Software", 315: "Artist", 33432: "Copyright", 36864: "ExifVersion", 40960: "FlashpixVersion", 40961: "ColorSpace", 40962: "PixelXDimension", 40963: "PixelYDimension", 42240: "Gamma", 37121: "ComponentsConfiguration", 37122: "CompressedBitsPerPixel", 37500: "MakerNote", 37510: "UserComment", 40964: "RelatedSoundFile", 36867: "DateTimeOriginal", 36868: "DateTimeDigitized", 37520: "SubSecTime", 37521: "SubSecTimeOriginal", 37522: "SubSecTimeDigitized", 33434: "ExposureTime", 33437: "FNumber", 34850: "ExposureProgram", 34852: "SpectralSensitivity", 34855: "PhotographicSensitivity", 34856: "OECF", 34864: "SensitivityType", 34865: "StandardOutputSensitivity", 34866: "RecommendedExposureIndex", 34867: "ISOSpeed", 34868: "ISOSpeedLatitudeyyy", 34869: "ISOSpeedLatitudezzz", 37377: "ShutterSpeedValue", 37378: "ApertureValue", 37379: "BrightnessValue", 37380: "ExposureBias", 37381: "MaxApertureValue", 37382: "SubjectDistance", 37383: "MeteringMode", 37384: "LightSource", 37385: "Flash", 37396: "SubjectArea", 37386: "FocalLength", 41483: "FlashEnergy", 41484: "SpatialFrequencyResponse", 41486: "FocalPlaneXResolution", 41487: "FocalPlaneYResolution", 41488: "FocalPlaneResolutionUnit", 41492: "SubjectLocation", 41493: "ExposureIndex", 41495: "SensingMethod", 41728: "FileSource", 41729: "SceneType", 41730: "CFAPattern", 41985: "CustomRendered", 41986: "ExposureMode", 41987: "WhiteBalance", 41988: "DigitalZoomRatio", 41989: "FocalLengthIn35mmFilm", 41990: "SceneCaptureType", 41991: "GainControl", 41992: "Contrast", 41993: "Saturation", 41994: "Sharpness", 41995: "DeviceSettingDescription", 41996: "SubjectDistanceRange", 42016: "ImageUniqueID", 42032: "CameraOwnerName", 42033: "BodySerialNumber", 42034: "LensSpecification", 42035: "LensMake", 42036: "LensModel", 42037: "LensSerialNumber", 0: "GPSVersionID", 1: "GPSLatitudeRef", 2: "GPSLatitude", 3: "GPSLongitudeRef", 4: "GPSLongitude", 5: "GPSAltitudeRef", 6: "GPSAltitude", 7: "GPSTimeStamp", 8: "GPSSatellites", 9: "GPSStatus", 10: "GPSMeasureMode", 11: "GPSDOP", 12: "GPSSpeedRef", 13: "GPSSpeed", 14: "GPSTrackRef", 15: "GPSTrack", 16: "GPSImgDirectionRef", 17: "GPSImgDirection", 18: "GPSMapDatum", 19: "GPSDestLatitudeRef", 20: "GPSDestLatitude", 21: "GPSDestLongitudeRef", 22: "GPSDestLongitude", 23: "GPSDestBearingRef", 24: "GPSDestBearing", 25: "GPSDestDistanceRef", 26: "GPSDestDistance", 27: "GPSProcessingMethod", 28: "GPSAreaInformation", 29: "GPSDateStamp", 30: "GPSDifferential", 31: "GPSHPositioningError" }, e.ExifMap.prototype.stringValues = { ExposureProgram: { 0: "Undefined", 1: "Manual", 2: "Normal program", 3: "Aperture priority", 4: "Shutter priority", 5: "Creative program", 6: "Action program", 7: "Portrait mode", 8: "Landscape mode" }, MeteringMode: { 0: "Unknown", 1: "Average", 2: "CenterWeightedAverage", 3: "Spot", 4: "MultiSpot", 5: "Pattern", 6: "Partial", 255: "Other" }, LightSource: { 0: "Unknown", 1: "Daylight", 2: "Fluorescent", 3: "Tungsten (incandescent light)", 4: "Flash", 9: "Fine weather", 10: "Cloudy weather", 11: "Shade", 12: "Daylight fluorescent (D 5700 - 7100K)", 13: "Day white fluorescent (N 4600 - 5400K)", 14: "Cool white fluorescent (W 3900 - 4500K)", 15: "White fluorescent (WW 3200 - 3700K)", 17: "Standard light A", 18: "Standard light B", 19: "Standard light C", 20: "D55", 21: "D65", 22: "D75", 23: "D50", 24: "ISO studio tungsten", 255: "Other" }, Flash: { 0: "Flash did not fire", 1: "Flash fired", 5: "Strobe return light not detected", 7: "Strobe return light detected", 9: "Flash fired, compulsory flash mode", 13: "Flash fired, compulsory flash mode, return light not detected", 15: "Flash fired, compulsory flash mode, return light detected", 16: "Flash did not fire, compulsory flash mode", 24: "Flash did not fire, auto mode", 25: "Flash fired, auto mode", 29: "Flash fired, auto mode, return light not detected", 31: "Flash fired, auto mode, return light detected", 32: "No flash function", 65: "Flash fired, red-eye reduction mode", 69: "Flash fired, red-eye reduction mode, return light not detected", 71: "Flash fired, red-eye reduction mode, return light detected", 73: "Flash fired, compulsory flash mode, red-eye reduction mode", 77: "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected", 79: "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected", 89: "Flash fired, auto mode, red-eye reduction mode", 93: "Flash fired, auto mode, return light not detected, red-eye reduction mode", 95: "Flash fired, auto mode, return light detected, red-eye reduction mode" }, SensingMethod: { 1: "Undefined", 2: "One-chip color area sensor", 3: "Two-chip color area sensor", 4: "Three-chip color area sensor", 5: "Color sequential area sensor", 7: "Trilinear sensor", 8: "Color sequential linear sensor" }, SceneCaptureType: { 0: "Standard", 1: "Landscape", 2: "Portrait", 3: "Night scene" }, SceneType: { 1: "Directly photographed" }, CustomRendered: { 0: "Normal process", 1: "Custom process" }, WhiteBalance: { 0: "Auto white balance", 1: "Manual white balance" }, GainControl: { 0: "None", 1: "Low gain up", 2: "High gain up", 3: "Low gain down", 4: "High gain down" }, Contrast: { 0: "Normal", 1: "Soft", 2: "Hard" }, Saturation: { 0: "Normal", 1: "Low saturation", 2: "High saturation" }, Sharpness: { 0: "Normal", 1: "Soft", 2: "Hard" }, SubjectDistanceRange: { 0: "Unknown", 1: "Macro", 2: "Close view", 3: "Distant view" }, FileSource: { 3: "DSC" }, ComponentsConfiguration: { 0: "", 1: "Y", 2: "Cb", 3: "Cr", 4: "R", 5: "G", 6: "B" }, Orientation: { 1: "top-left", 2: "top-right", 3: "bottom-right", 4: "bottom-left", 5: "left-top", 6: "right-top", 7: "right-bottom", 8: "left-bottom" } }, e.ExifMap.prototype.getText = function(e) {
        var t = this.get(e);
        switch (e) {
        case "LightSource":
        case "Flash":
        case "MeteringMode":
        case "ExposureProgram":
        case "SensingMethod":
        case "SceneCaptureType":
        case "SceneType":
        case "CustomRendered":
        case "WhiteBalance":
        case "GainControl":
        case "Contrast":
        case "Saturation":
        case "Sharpness":
        case "SubjectDistanceRange":
        case "FileSource":
        case "Orientation":
            return this.stringValues[e][t];
        case "ExifVersion":
        case "FlashpixVersion":
            return String.fromCharCode(t[0], t[1], t[2], t[3]);
        case "ComponentsConfiguration":
            return this.stringValues[e][t[0]] + this.stringValues[e][t[1]] + this.stringValues[e][t[2]] + this.stringValues[e][t[3]];
        case "GPSVersionID":
            return t[0] + "." + t[1] + "." + t[2] + "." + t[3]
        }
        return String(t)
    }, function(e) {
        var t, i = e.tags, a = e.map;
        for (t in i) i.hasOwnProperty(t) && (a[i[t]] = t)
    }(e.ExifMap.prototype), e.ExifMap.prototype.getAll = function() {
        var e, t, i = {};
        for (e in this) this.hasOwnProperty(e) && (t = this.tags[e], t && (i[t] = this.getText(t)));
        return i
    }
});
//# sourceMappingURL=load-image.all.min.js.map