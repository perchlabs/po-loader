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

### Simple async simple example:

``` javascript
import Jed from 'jed'

// The Locale consists of a language and territory.
const language = langParts[0]
const territory = langParts[1].toUpperCase()

// Set complete
const locale = multipart ? language + '_' + territory : language

let i18n = null

export default {
  async init() {
    const langRaw = window.navigator.userLanguage || window.navigator.language
    const langParts = langRaw.replace('-', '_').split('_')

    const language = langParts[0]
    const country = langParts.length > 1 ? '_' + langParts[1].toUpperCase() : ''
    const locale = `${language}${country}`

    let localeData

    try {
      localeData = await getLocaleData(locale)
    } catch {
      localeData = await getLocaleData(LOCALE_DEFAULT)
    }

    i18n = new Jed(localeData)
  },
  gettext(message) {
    return i18n.gettext(message)
  },
  ngettext(msg1, msg2, n) {
    return i18n.ngettext(msg1, msg2, n)
  },
}

// A runtime exception will be throw every time that the requested locale file cannot be found.
// Webpack uses a regular expression to build all locales as separate bundles.
async function getLocaleData(locale) {
  return import(`${LOCALE_ROOT}/${locale}/LC_MESSAGES/messages.po`)
}
```

### Javascript with language fallback example:

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

let i18n
let localeConfig

export default {
  async init() {
    const localeConfig = await import(`${LOCALE_ROOT}/config`)

    const localeDefault = localeConfig['default']
    const map           = localeConfig['map']

    const langRaw = window.navigator.userLanguage || window.navigator.language
    const langParts = langRaw.replace('-', '_').split('_')

    const language = langParts[0]
    const country = langParts.length > 1 ? '_' + langParts[1].toUpperCase() : ''
    const locale = `${language}${country}`

    let localeData

    try {
      localeData = await getLocaleData(locale)
    } catch {
      const localeNext = map.hasOwnProperty(language) ? map[language] : localeDefault
      localeData = await getLocaleData(localeNext)
    }

    i18n = new Jed(localeData)
  },
  gettext(message) {
    return i18n.gettext(message)
  },
  ngettext(msg1, msg2, n) {
    return i18n.ngettext(msg1, msg2, n)
  },
}

// A runtime exception will be throw every time that the requested locale file cannot be found.
// Webpack uses a regular expression to build all locales as separate bundles.
async function getLocaleData(locale) {
  return import(`${LOCALE_ROOT}/${locale}/LC_MESSAGES/messages.po`)
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
