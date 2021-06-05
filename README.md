List of HTTP codes as constants
===============================

This is a simple list, to avoid magic numbers in the code as well as add a bit
of safety when using TypeScript.

The list of codes is taken from the IANA.

Installation
------------

This is on [npmjs](https://www.npmjs.com/package/@cley_faye/http-codes-consts):

```bash
npm install @cley_faye/http-codes-consts
```

Usage
-----
Constants are available as the default export:

```JavaScript
import HttpCodes from "@cley_faye/http-codes-consts";
console.log(HttpCodes.NotFound); // Output 404
console.log(HttpCodes.NOT_FOUND); // Output 404
```

Names are available in both camel-case and uppercase separated with an
underline.

Caveats
-------
Unfortunately, as this is generated from a "serious" CSV source, the "I'm a
Teapot" error is not available.
