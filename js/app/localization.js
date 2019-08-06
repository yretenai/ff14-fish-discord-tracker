const _ = require('underscore');
const moment = require('moment');
const twix = require('twix');

const __p = require('./localization.js');

const LANGUAGES = {
  English: "_en",
  Japanese: "_ja",
  German: "_de",
  French: "_fr",
  Korean: "_ko"
};

class LocalizationHelper {

  constructor() {
    // Default to English (_en).
    this.language_suffix = LANGUAGES.English;
  }

  getLocalizedProperty(obj, name) {
    return obj[name + this.language_suffix];
  }

  getLocalizedDataObject(obj) {
    // This function creates a /clone/ of the object, substituting all i18n
    // fields with their specific language.
    var tmp = _(obj).chain()
      .pairs()
      .partition((x) => _(LANGUAGES).any((l) => x[0].endsWith(l)))
      .value();
    return _(tmp[0]).chain()
      .filter((x) => x[0].endsWith(this.language_suffix))
      .map((x) => [x[0].slice(0, this.language_suffix.length), x[1]])
      .object()
      .extend(_(tmp[1].object()))
      .value();
  }

  getLanguage() {
    return this.language_suffix.slice(1);
  }
}

let localizationHelper = new LocalizationHelper();
module.exports = _.bind(localizationHelper.getLocalizedProperty, localizationHelper);
