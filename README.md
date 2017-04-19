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

### Javascript async simple example:

``` javascript
var Jed = require('jed');

var langRaw = window.navigator.userLanguage || window.navigator.language;
var langParts = langRaw.replace('-', '_').split('_');
var multipart = langParts.length > 1;
// The Locale consists of a language and territory.
var language = langParts[0];
var territory = langParts[1].toUpperCase();
// Set complete
var locale = (multipart) ? language + '_' + territory : language;

var i18n = null;
module.exports = {
  gettext: function(message) {
    return i18n.gettext(message);
  },
  ngettext: function(msg1, msg2, n) {
    return i18n.ngettext(msg1, msg2, n);
  },
  init: function(loadApp) {
    var eLanguage, eLocale, waitForLangChunk;
    try {
      waitForLangChunk = getLangLoader(locale);
    } catch (error) {
      eLocale = error;
      if (multipart) {
        try {
          waitForLangChunk = getLangLoader(language);
        } catch (error) {
          eLanguage = error;
          waitForLangChunk = getLangLoader(LOCALE_DEFAULT);
        }
      } else {
        waitForLangChunk = getLangLoader(LOCALE_DEFAULT);
      }
    }
    return waitForLangChunk(function(messages) {
      i18n = new Jed({
        domain: 'messages',
        locale_data: {
          messages: messages
        }
      });
      console.log('messages:', messages);
      return loadApp();
    });
  }
};

// There is only one variable here and it Webpack expands its search using a regex
// to find all of the messages. The constant LOCALE_ROOT is evaluated at compile time.
function getLangLoader(locale) {
  return require("bundle!" + LOCALE_ROOT + "/" + locale + "/LC_MESSAGES/messages.po");
};
```

### Javascript ES2015+ async advanced example:

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
import Jed from 'jed'

// LOCALE_ROOT is a constant defined in webpack config and is evaluated at build time
const localeConfig = require(`${LOCALE_ROOT}/config`)

let i18n
export default {
  init() {
    return new Promise(initExecutor)
  },
  gettext(message) {
    return i18n.gettext(message)
  },
  ngettext(msg1, msg2, n) {
    return i18n.ngettext(msg1, msg2, n)
  }
}

function initExecutor(resolve, reject) {
  const localeDefault = localeConfig['default']
  const map           = localeConfig['map']

  const langRaw = window.navigator.userLanguage || window.navigator.language
  const langParts = langRaw.replace('-', '_').split('_')

  const language = langParts[0]
  const country = langParts.length > 1 ? '_' + langParts[1].toUpperCase() : ''
  const locale = `${language}${country}`

  let waitForLangChunk
  try {
    waitForLangChunk = getLangLoader(locale)
  } catch (eLocale) {
    const localeNext = map.hasOwnProperty(language) ? map[language] : localeDefault
    waitForLangChunk = getLangLoader(localeNext)
  }
  waitForLangChunk(function(messages) {
    i18n = new Jed(messages)
    resolve()
  })
}

function getLangLoader(locale) {
  // A runtime exception will be throw every time that the requested locale file
  // cannot be found. Webpack uses a regular expression to build all locales as
  // separate bundles.
  return require(`bundle!${LOCALE_ROOT}/${locale}/LC_MESSAGES/messages.po`)
}
```

Create a globally accessible `init` module to glue the common bundle and entry module:

```javascript
let promise
export default function(iterable) {
  if (iterable) {
    if (promise) {
        throw 'Promise is already set.'
    }

    promise = Promise.all(iterable)
  }

  return promise
}
```

Then in your common shared code:

```javascript
const localePromise = locale.init()
const documentPromise = new Promise(function(resolve, reject) {
  document.addEventListener('DOMContentLoaded', resolve, false)
})

init([localePromise, documentPromise])

```

Finally in your entry code:

```javascript
import init from 'init'

init().then(function() {
  console.log('The locale module is now ready.')
})
```


## License

MIT (http://www.opensource.org/licenses/mit-license.php)
