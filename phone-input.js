/**
 * @license
 * Copyright (C) 2015 Michael Kuryshev.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview  Blah Blah Blah
 *
 * @author Michael Kuryshev
 */

var phoneInput = {};

goog.require('goog.array');
goog.require('goog.json');
goog.require('goog.proto2.ObjectSerializer');
goog.require('i18n.phonenumbers.AsYouTypeFormatter');
goog.require('i18n.phonenumbers.PhoneNumberUtil');

var cloneCountryNames = function () {
  var _new = {},
      keys = Object.keys(countryNames);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i],
        cur = countryNames[key],
        a = {
          name: countryNames[key].name
        };
    if (cur.normalName) a.normalName = cur.normalName;
    _new[key] = a;
  }
  return _new;
};

var getCountryVisibleName = function (country) {
  if (country['localizedName']) {
    return country['localizedName'];
  }
  return country['name'];
};

var matchCountry = function (country, str) {
  var matched = false,
      f = function (a, b) { return a.toLowerCase()
                            .indexOf(b.toLowerCase()) !== -1; };
  //console.log('localizedName', country.localizedName);
  if (country.localizedName) {
    matched = f(country.localizedName, str);
  }
  if (matched) return matched;
  //console.log('name', country.name);
  if (country.name) {
    matched = f(country['name'], str);
  }
  if (matched) return matched;
  if (country.index) {
    matched = f(country.index, str);
  }
  if (matched) return matched;
  if (country.normalName) {
    matched = f(country.normalName, str);
  }
  if (matched) return matched;
  if (country.localizedVariations) {
    goog.array.forEach(country.localizedVariations, function (variation) {
      matched = matched || f(variation, str);
    });
  }
  return matched;
};

var countryCompare = function (a, b) {
  //console.log('a = ', a);
  switch (true) {
  case a.name === b.name:
    return 0;
  case a.name > b.name:
    return 1;
  default:
    return -1;
  }
};

/**
 * A mapping from ISO 3166-1 2-character region code to UN country designation
 * for that country.
 * @dict
 * @type {!Object.<string, {name: string, normalName: ?string}>}
 */
var countryNames = {
  'AC': { name: 'Ascension Island' }, /* exceptional reservation, as defined at
    https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Exceptional_reservations */
  'AD': { name: 'Andorra' },
  'AE': { name: 'United Arab Emirates' },
  'AF': { name: 'Afghanistan' },
  'AG': { name: 'Antigua and Barbuda' },
  'AI': { name: 'Anguilla' },
  'AL': { name: 'Albania' },
  'AM': { name: 'Armenia' },
  'AO': { name: 'Angola' },
  // AQ: { name: 'Antarctica' }, (not present in libphonenumber database)
  'AR': { name: 'Argentina' },
  'AS': { name: 'American Samoa' },
  'AT': { name: 'Austria' },
  'AU': { name: 'Australia' },
  'AW': { name: 'Aruba' },
  'AX': { name: 'Åland Islands', normalName: 'Aland Islands' },
  'AZ': { name: 'Azerbaijan' },
  'BA': { name: 'Bosnia and Herzegovina' },
  'BB': { name: 'Barbados' },
  'BD': { name: 'Bangladesh' },
  'BE': { name: 'Belgium' },
  'BF': { name: 'Burkina Faso' },
  'BG': { name: 'Bulgaria' },
  'BH': { name: 'Bahrain' },
  'BI': { name: 'Burundi' },
  'BJ': { name: 'Benin' },
  'BL': { name: 'Saint Barthélemy', normalName: 'Saint Barthelemy' },
  'BM': { name: 'Bermuda' },
  'BN': { name: 'Brunei Darussalam' },
  'BO': { name: 'Bolivia, Plurinational State of' },
  'BQ': { name: 'Bonaire, Sint Eustatius and Saba' },
  'BR': { name: 'Brazil' },
  'BS': { name: 'Bahamas' },
  'BT': { name: 'Bhutan' },
  // BV: { name: 'Bouvet Island' }, (not present in libphonenumber database)
  'BW': { name: 'Botswana' },
  'BY': { name: 'Belarus' },
  'BZ': { name: 'Belize' },
  'CA': { name: 'Canada' },
  'CC': { name: 'Cocos (Keeling) Islands' },
  'CD': { name: 'Congo, the Democratic Republic of the' },
  'CF': { name: 'Central African Republic' },
  'CG': { name: 'Congo' },
  'CH': { name: 'Switzerland' },
  'CI': { name: 'Côte d\'Ivoire', normalName: 'Cote d\'Ivoire' },
  'CK': { name: 'Cook Islands' },
  'CL': { name: 'Chile' },
  'CM': { name: 'Cameroon' },
  'CN': { name: 'China' },
  'CO': { name: 'Colombia' },
  'CR': { name: 'Costa Rica' },
  'CU': { name: 'Cuba' },
  'CV': { name: 'Cabo Verde' },
  'CW': { name: 'Curaçao', normalName: 'Curacao' },
  'CX': { name: 'Christmas Island' },
  'CY': { name: 'Cyprus' },
  'CZ': { name: 'Czech Republic' },
  'DE': { name: 'Germany' },
  'DJ': { name: 'Djibouti' },
  'DK': { name: 'Denmark' },
  'DM': { name: 'Dominica' },
  'DO': { name: 'Dominican Republic' },
  'DZ': { name: 'Algeria' },
  'EC': { name: 'Ecuador' },
  'EE': { name: 'Estonia' },
  'EG': { name: 'Egypt' },
  'EH': { name: 'Western Sahara' },
  'ER': { name: 'Eritrea' },
  'ES': { name: 'Spain' },
  'ET': { name: 'Ethiopia' },
  'FI': { name: 'Finland' },
  'FJ': { name: 'Fiji' },
  'FK': { name: 'Falkland Islands (Malvinas)' },
  'FM': { name: 'Micronesia, Federated States of' },
  'FO': { name: 'Faroe Islands' },
  'FR': { name: 'France' },
  'GA': { name: 'Gabon' },
  'GB': { name: 'United Kingdom of Great Briatin and Northern Ireland' },
  'GD': { name: 'Grenada' },
  'GE': { name: 'Georgia' },
  'GF': { name: 'French Guiana' },
  'GG': { name: 'Guernsey' },
  'GH': { name: 'Ghana' },
  'GI': { name: 'Gibraltar' },
  'GL': { name: 'Greenland' },
  'GM': { name: 'Gambia' },
  'GN': { name: 'Guinea' },
  'GP': { name: 'Guadeloupe' },
  'GQ': { name: 'Equatorial Guinea' },
  'GR': { name: 'Greece' },
  // GS: { name: 'South Georgia and the South Sandwich Islands' },
  //                      (not present in libphonenumber database)
  'GT': { name: 'Guatemala' },
  'GU': { name: 'Guam' },
  'GW': { name: 'Guinea-Bissau' },
  'GY': { name: 'Guyana' },
  'HK': { name: 'China, Hong Kong Special Administrative Region' },
  // HM: 'Heard Island and McDonald Islands',
  // (not present in libphonenumber database)
  'HN': { name: 'Honduras' },
  'HR': { name: 'Croatia' },
  'HT': { name: 'Haiti' },
  'HU': { name: 'Hungary' },
  'ID': { name: 'Indonesia' },
  'IE': { name: 'Ireland' },
  'IL': { name: 'Israel' },
  'IM': { name: 'Isle of Man' },
  'IN': { name: 'India' },
  'IO': { name: 'British Indian Ocean Territory' },
  'IQ': { name: 'Iraq' },
  'IR': { name: 'Iran, Islamic Republic of' },
  'IS': { name: 'Iceland' },
  'IT': { name: 'Italy' },
  'JE': { name: 'Jersey' },
  'JM': { name: 'Jamaica' },
  'JO': { name: 'Jordan' },
  'JP': { name: 'Japan' },
  'KE': { name: 'Kenya' },
  'KG': { name: 'Kyrgyzstan' },
  'KH': { name: 'Cambodia' },
  'KI': { name: 'Kiribati' },
  'KM': { name: 'Comoros' },
  'KN': { name: 'Saint Kitts and Nevis' },
  'KP': { name: 'Korea, Democratic People\'s Republic of' },
  'KR': { name: 'Korea, Republic of' },
  'KW': { name: 'Kuwait' },
  'KY': { name: 'Cayman Islands' },
  'KZ': { name: 'Kazakhstan' },
  'LA': { name: 'Lao People\'s Democratic Republic' },
  'LB': { name: 'Lebanon' },
  'LC': { name: 'Saint Lucia' },
  'LI': { name: 'Liechtenstein' },
  'LK': { name: 'Sri Lanka' },
  'LR': { name: 'Liberia' },
  'LS': { name: 'Lesotho' },
  'LT': { name: 'Lithuania' },
  'LU': { name: 'Luxembourg' },
  'LV': { name: 'Latvia' },
  'LY': { name: 'Libya' },
  'MA': { name: 'Morocco' },
  'MC': { name: 'Monaco' },
  'MD': { name: 'Moldova, Republic of' },
  'ME': { name: 'Montenegro' },
  'MF': { name: 'Saint Martin (French part)' },
  'MG': { name: 'Madagascar' },
  'MH': { name: 'Marshall Islands' },
  'MK': { name: 'Macedonia, the former Yugoslav Republic of' },
  'ML': { name: 'Mali' },
  'MM': { name: 'Myanmar' },
  'MN': { name: 'Mongolia' },
  'MO': { name: 'China, Macao Special Administrative Region' },
  'MP': { name: 'Northern Mariana Islands' },
  'MQ': { name: 'Martinique' },
  'MR': { name: 'Mauritania' },
  'MS': { name: 'Montserrat' },
  'MT': { name: 'Malta' },
  'MU': { name: 'Mauritius' },
  'MV': { name: 'Maldives' },
  'MW': { name: 'Malawi' },
  'MX': { name: 'Mexico' },
  'MY': { name: 'Malaysia' },
  'MZ': { name: 'Mozambique' },
  'NA': { name: 'Namibia' },
  'NC': { name: 'New Caledonia' },
  'NE': { name: 'Niger' },
  'NF': { name: 'Norfolk Island' },
  'NG': { name: 'Nigeria' },
  'NI': { name: 'Nicaragua' },
  'NL': { name: 'Netherlands' },
  'NO': { name: 'Norway' },
  'NP': { name: 'Nepal' },
  'NR': { name: 'Nauru' },
  'NU': { name: 'Niue' },
  'NZ': { name: 'New Zealand' },
  'OM': { name: 'Oman' },
  'PA': { name: 'Panama' },
  'PE': { name: 'Peru' },
  'PF': { name: 'French Polynesia' },
  'PG': { name: 'Papua New Guinea' },
  'PH': { name: 'Philippines' },
  'PK': { name: 'Pakistan' },
  'PL': { name: 'Poland' },
  'PM': { name: 'Saint Pierre and Miquelon' },
  // PN: { name: 'Pitcairn' }, (not present in libphonenumber database)
  'PR': { name: 'Puerto Rico' },
  'PS': { name: 'Palestine, State of' },
  'PT': { name: 'Portugal' },
  'PW': { name: 'Palau' },
  'PY': { name: 'Paraguay' },
  'QA': { name: 'Qatar' },
  'RE': { name: 'Réunion', normalName: 'Reunion' },
  'RO': { name: 'Romania' },
  'RS': { name: 'Serbia' },
  'RU': { name: 'Russian Federation' },
  'RW': { name: 'Rwanda' },
  'SA': { name: 'Saudi Arabia' },
  'SB': { name: 'Solomon Islands' },
  'SC': { name: 'Seychelles' },
  'SD': { name: 'Sudan' },
  'SE': { name: 'Sweden' },
  'SG': { name: 'Singapore' },
  'SH': { name: 'Saint Helena' }, /* At this moment defined in ISO 3166-1 as
                                   "Saint Helena, Ascension and Tristan da Cunha"
                                   though Ascension and Tristan da Cunha aren't
                                   dependencies of Saint Helena since 2009. */
  'SI': { name: 'Slovenia' },
  'SJ': { name: 'Svalbard and Jan Mayen Islands' },
  'SK': { name: 'Slovakia' },
  'SL': { name: 'Sierra Leone' },
  'SM': { name: 'San Marino' },
  'SN': { name: 'Senegal' },
  'SO': { name: 'Somalia' },
  'SR': { name: 'Suriname' },
  'SS': { name: 'South Sudan' },
  'ST': { name: 'Sao Tome and Principe' },
  'SV': { name: 'El Salvador' },
  'SX': { name: 'Sint Maarten' },
  'SY': { name: 'Syrian Arab Republic' },
  'SZ': { name: 'Swaziland' },
  'TA': { name: 'Tristan da Cunha' }, // exceptional reservation
  'TC': { name: 'Turks and Caicos Islands' },
  'TD': { name: 'Chad' },
  // TF: { name: 'French Southern Territories' },
  //     (not present in libphonenumber database)
  'TG': { name: 'Togo' },
  'TH': { name: 'Thailand' },
  'TJ': { name: 'Tajikistan' },
  'TK': { name: 'Tokelau' },
  'TL': { name: 'Timor-Leste' },
  'TM': { name: 'Turkmenistan' },
  'TN': { name: 'Tunisia' },
  'TO': { name: 'Tonga' },
  'TR': { name: 'Turkey' },
  'TT': { name: 'Trinidad and Tobago' },
  'TV': { name: 'Tuvalu' },
  'TW': { name: 'Taiwan, Province of China', index: 'Taiwan' },
  'TZ': { name: 'Tanzania, United Republic of' },
  'UA': { name: 'Ukraine' },
  'UG': { name: 'Uganda' },
  // UM: { name: 'United States Minor Outlying Islands' },
  //              (not present in libphonenumber database)
  'US': { name: 'United States of America' },
  'UY': { name: 'Uruguay' },
  'UZ': { name: 'Uzbekistan' },
  'VA': { name: 'Holy See', index: 'Vatican' },
  'VC': { name: 'Saint Vincent and the Grenadines' },
  'VE': { name: 'Venezuela, Bolivarian Republic of' },
  'VG': { name: 'Virgin Islands, British' },
  'VI': { name: 'Virgin Islands, U.S.' },
  'VN': { name: 'Viet Nam', index: 'Vietnam' },
  'VU': { name: 'Vanuatu' },
  'WF': { name: 'Wallis and Futuna' },
  'WS': { name: 'Samoa' },
  'YE': { name: 'Yemen' },
  'YT': { name: 'Mayotte' },
  'ZA': { name: 'South Africa' },
  'ZM': { name: 'Zambia' },
  'ZW': { name: 'Zimbabwe' }
};

var searchByCountryName = function (countryName) {
  var acc = [];
  if (!countryName) {
    return acc;
  }
  countryName = countryName.toLowerCase();
  var keys = Object.keys(countryNames);
  for (var i = 0; i < keys.length; i++) {
    var c = countryNames[keys[i]];
    if (c.normalName && c.normalName.toLowerCase().indexOf(countryName) !== -1) {
      acc.push(keys[i]);
      continue;
    }
    if (c.name.toLowerCase().indexOf(countryName) !== -1) {
      acc.push(keys[i]);
      continue;
    }
  }
  return acc;
};

var regionCodeToCountry = function (countryCode) {
  if (!countryNames[countryCode]) {
    return null;
  }

  var countryMetadata = countryList_[countryCode],
      a = {
        name: countryNames[countryCode].name,
        code: countryCode,
        phoneCode: countryMetadata.phoneCode
      };
  if (countryCodeToRegionCodeMap[a.phoneCode].length === 1) {
    // country doesn't share it's phone code with anyone else
    a.onlyCountryForCode = true;
  } else {
    if (countryMetadata.mainCountryForCode) a.mainCountryForCode = true;
  }
  return a;
};

var phoneUtil = i18n.phonenumbers.PhoneNumberUtil.getInstance(),
    countryMetadata = i18n.phonenumbers.metadata.countryToMetadata,
    countryCodeToRegionCodeMap = i18n.phonenumbers.metadata.countryCodeToRegionCodeMap,
    regionList = Object.keys(countryMetadata),
    countryList_ = {};

for (var i = 0; i < regionList.length; i++) {
  var country = phoneUtil.getMetadataForRegion(regionList[i]);
  if (country.getId() === '001') {
    // This is not actually a country, but a non-geographical entity, which
    // represents "World" in the UN M.49 standard.
  } else {
    var a = {
      code: country.getId(),
      phoneCode: country.getCountryCode()
    };
    if (country.getMainCountryForCode())
      a.mainCountryForCode = true;
    countryList_[a.code] = a;
  }
}

phoneInput['analyze'] = function (phonenumberRaw) {
  var res = {};
  try {
    var an = {};
    var phonenumber = phoneUtil.parseAndKeepRawInput(phonenumberRaw, 'ZZ');
                                         // ZZ - code for an unknown region
    var j = new goog.proto2.ObjectSerializer(
      goog.proto2.ObjectSerializer.KeyOption.NAME
    ).serialize(phonenumber);
    an['isPossible'] = phoneUtil.isPossibleNumber(phonenumber);
    if (!an['isPossible']) {
      var PNV = i18n.phonenumbers.PhoneNumberUtil.ValidationResult;
      switch (phoneUtil.isPossibleNumberWithReason(phonenumber)) {
      case PNV.INVALID_COUNTRY_CODE:
        an['possibleReason'] = 'INVALID_COUNTRY_CODE';
        break;
      case PNV.TOO_SHORT:
        an['possibleReason'] = 'TOO_SHORT';
        break;
      case PNV.TOO_LONG:
        an['possibleReason'] = 'TOO_LONG';
      }
    }
    an['isValid'] = phoneUtil.isValidNumber(phonenumber);
    var region = phoneUtil.getRegionCodeForNumber(phonenumber);
    if (region) {
      an['region'] = region;
    }
    res['analyze'] = an;
    var formatter = new i18n.phonenumbers.AsYouTypeFormatter('ZZ'),
        formatted;
    for (var i = 0; i < phonenumberRaw.length; i++) {
      formatted = formatter.inputDigit(phonenumberRaw.charAt(i));
    }
    res['formatted'] = formatted;
  } catch (e) {
    res['analyzeError'] = e;
  }
  return res;
};

phoneInput['whichCountry'] = function (phonenumberRaw, properRegion) {
  properRegion = regionCodeToCountry(properRegion);
  if (properRegion) return properRegion;
  if (typeof phonenumberRaw !== 'string' || !phonenumberRaw.match(/^\+\d+$/)) {
    return null;
  }
  var acc = '',
      regionCodes;
  phonenumberRaw = phonenumberRaw.slice(1); // cut off plus sign
  for (var i = 0; i < phonenumberRaw.length; i++) {
    acc += phonenumberRaw.charAt(i);
    regionCodes = i18n.phonenumbers.metadata.countryCodeToRegionCodeMap[parseInt(acc, 10)];
    if (regionCodes !== undefined) break;
  }
  if (!regionCodes) return null;
  regionCodes = goog.array.filter(regionCodes, function (el) {
    return el !== '001';
  });
  if (regionCodes.length === 0) return null;
  return goog.array.find(
    goog.array.map(regionCodes, regionCodeToCountry),
    function (country) { return country.onlyCountryForCode ||
                                country.mainCountryForCode; }
  );
};

phoneInput['countries'] = {};
phoneInput['countries']['getInstance'] = function () {
  return cloneCountryNames();
};

phoneInput['countries']['setLocale'] = function (countryList, localizedList) {
  var codesList = Object.keys(localizedList);
  for (var i = 0; i < codesList.length; i++) {
    var code = codesList[i];
    countryList[code].localizedName = localizedList[code]['name'];
    if (localizedList[code]['variations']) countryList[code].localizedVariations = localizedList[code]['variations'];
  }
};

phoneInput['countries']['filter'] = function (countryList, str, localeCompareArgs) {
  var localeCompareSupport = false;
  if (localeCompareArgs && typeof String.prototype.localeCompare === 'function') {
    localeCompareSupport = true;
  }
  var countries = goog.array.map(Object.keys(countryList), function (regionCode) {
    return {
      country: countryList[regionCode],
      code: countryList_[regionCode].phoneCode,
      regionCode: regionCode
    };
  });
  //console.log('countries[0]: ', countries[0]);
  var a = goog.array.filter(countries, function (country) {
    return matchCountry(country.country, str);
  });
  //console.log('filtered: ', a);
  if (a.length === 0) return null;
  var res = goog.array.map(a, function (item) {
    var obj = phoneInput['countries']['get'](countryList, item.regionCode);
    obj['regionCode'] = item.regionCode;
    return obj;
  });
  goog.array.sort(res, countryCompare);
  return res;
};

phoneInput['countries']['get'] = function (countryList, regionCode) {
  if (!countryList_[regionCode]) return null;
  var name = countryList[regionCode].localizedName ? countryList[regionCode].localizedName : countryList[regionCode]['name'];
  return {
    name: name,
    code: countryList_[regionCode].phoneCode
  };
};

goog.exportSymbol('phoneInput', phoneInput);
