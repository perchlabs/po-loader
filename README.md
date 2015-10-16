# PO loader for webpack

## Usage

[Documentation: Using loaders](http://webpack.github.io/docs/using-loaders.html)

``` javascript
// Use it explicitly
var messages = require("json!po!./locale/en_US/LC_MESSAGES/messages.po");

// Or add a loader into your webpack.config.js
loaders: [
   {test: /\.po$/, loader: 'json!po'}
]

// And then require it like this
var messages = require("./locale/en_US/LC_MESSAGES/messages.po");
```

See [po2json](https://github.com/mikeedwards/po2json) for a list of possible options. Use the `format` option to change the output format, e.g. `json!po?format=jed` or `json!po?format=jed1.x` for the latest Jed format.

#### Coffeescript async simple example:

``` coffeescript
'use strict'

Jed = require 'jed'

langRaw = window.navigator.userLanguage || window.navigator.language
langParts = langRaw.replace('-', '_').split('_')
multipart = (langParts.length > 1)
# The Locale consists of a language and territory
language = langParts[0]
territory = if multipart then langParts[1].toUpperCase()
# Set full
locale = if multipart then "#{language}_#{territory}" else language


# There is only one variable here and it Webpack expands its search using a regex
# to find all of the messages. The constant LOCALE_ROOT is evaluated at compile time
getLangLoader = (locale) ->
  bundleLoader = require "bundle!#{LOCALE_ROOT}/#{locale}/LC_MESSAGES/messages.po"
  return bundleLoader


i18n = null
module.exports =
  gettext: (message) -> i18n.gettext message
  ngettext: (msg1, msg2, n) -> i18n.ngettext msg1, msg2, n

  init: (loadApp) ->
    # Try to load the locale specified by the browser. Webpack will throw an exception
    # if it does not exist since it has been required with a regex. Then if the
    # locale has both both parts then try to load the base language without a territory
    # code (ex. 'es', 'en').  If this fails then load the default language (ex.
    # 'en_US'). If the locale is not multipart then just fallback to the default
    # language. This allows for a single base language to be used without territories
    # or with incomplete coverage for all territories.
    try
      waitForLangChunk = getLangLoader locale
    catch eLocale
      if multipart
        try
          waitForLangChunk = getLangLoader language
        catch eLanguage
          waitForLangChunk = getLangLoader LOCALE_DEFAULT
      else
        waitForLangChunk = getLangLoader LOCALE_DEFAULT

    waitForLangChunk (messages) ->
      i18n = new Jed
        domain: 'messages'
        locale_data:
          messages: messages

      console.log 'messages:', messages
      loadApp()

```

### Javascript ES6/ES2015 async advanced example:

Language fallback map stored at `${LOCALE_ROOT}/config`:

```yaml
---
default: en_US
map:
  en: en_US
  ru: ru_RU
  uk: ru_RU
  de: de_DE
...
```

`locale` module:

```javascript
'use strict';
import Jed from 'jed';

// LOCALE_ROOT is a constant defined in webpack config and is evaluated at build time
let localeConfig = require(`${LOCALE_ROOT}/config`);

let i18n;
export default {
  init: function() {
    return new Promise(initExecutor);
  },
  gettext: function(message) {
    return i18n.gettext(message);
  },
  ngettext: function(msg1, msg2, n) {
    return i18n.ngettext(msg1, msg2, n);
  }
};

function initExecutor(resolve, reject) {
  let localeDefault = localeConfig['default'];
  let map           = localeConfig['map'];

  let langRaw = window.navigator.userLanguage || window.navigator.language;
  let langParts = langRaw.replace('-', '_').split('_');

  let language = langParts[0];
  let country = langParts.length > 1 ? '_' + langParts[1].toUpperCase() : '';
  let locale = `${language}${country}`;

  let waitForLangChunk;
  try {
    waitForLangChunk = getLangLoader(locale);
  } catch (eLocale) {
    let localeNext = map.hasOwnProperty(language) ? map[language] : localeDefault;
    waitForLangChunk = getLangLoader(localeNext);
  }
  waitForLangChunk(function(messages) {
    i18n = new Jed(messages);
    resolve();
  });
}

function getLangLoader(locale) {
  // An runtime exception will be throw every time that the requested locale file
  // cannot be found. Webpack uses a regular expression to build all locales as
  // separate bundles.
  let bundleLoader = require(`bundle!${LOCALE_ROOT}/${locale}/LC_MESSAGES/messages.po`);
  return bundleLoader;
};
```

Create a globally accessible `init` module to glue the common bundle and entry module:

```javascript
'use strict';

let promise;
export default function(iterable) {
  if (iterable) {
    if (promise) {
        throw 'Promise is already set.';
    }

    promise = Promise.all(iterable);
  }

  return promise;
}
```

Then in your common shared code:

```javascript
let localePromise = locale.init();
let documentPromise = new Promise(function(resolve, reject) {
  document.addEventListener('DOMContentLoaded', resolve, false);
});

init([localePromise, documentPromise])

```

Finally in your entry code:

```javascript
'use strict';
import init from 'init';

init().then(function() {
  console.log('The locale module is now ready.');
});



```


## License

MIT (http://www.opensource.org/licenses/mit-license.php)
