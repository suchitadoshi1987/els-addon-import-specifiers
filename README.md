# els-addon-import-specifiers

![els-addon-import-specifiers](els-addon.gif)

### An ELS addon that allows jumping to the import specifiers directly

For example:

```js
import { getFooData } from 'bar/utils/blah/foo'
```
On clicking on `getFooData`, you will be able to jump to the actual line of `foo.js` where `getFooData` is exported.

#### How do I use it?

Add `els-addon-import-specifiers` as a dev dependency in your app's package.json and thats it!

* If using yarn, run: `yarn add -D els-addon-import-specifiers`
* If using npm, run: `npm install --save-dev els-addon-import-specifiers`

