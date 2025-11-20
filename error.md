[plugin:vite:css] [postcss] Cannot find module 'daisyui/src/theming/themes'
Require stack:
- D:\laragon\www\ApaPesan\tailwind.config.js
D:/laragon/www/ApaPesan/resources/css/app.css:undefined:null
    at Function._resolveFilename (node:internal/modules/cjs/loader:1225:15)
    at Function.resolve (node:internal/modules/helpers:146:19)
    at _resolve (D:\laragon\www\ApaPesan\node_modules\tailwindcss\node_modules\jiti\dist\jiti.js:1:246378)
    at jiti (D:\laragon\www\ApaPesan\node_modules\tailwindcss\node_modules\jiti\dist\jiti.js:1:249092)
    at D:\laragon\www\ApaPesan\tailwind.config.js:91:24
    at evalModule (D:\laragon\www\ApaPesan\node_modules\tailwindcss\node_modules\jiti\dist\jiti.js:1:251913)
    at jiti (D:\laragon\www\ApaPesan\node_modules\tailwindcss\node_modules\jiti\dist\jiti.js:1:249841)
    at D:\laragon\www\ApaPesan\node_modules\tailwindcss\lib\lib\load-config.js:52:26
    at loadConfig (D:\laragon\www\ApaPesan\node_modules\tailwindcss\lib\lib\load-config.js:62:6)
    at getTailwindConfig (D:\laragon\www\ApaPesan\node_modules\tailwindcss\lib\lib\setupTrackingContext.js:71:116)
    at D:\laragon\www\ApaPesan\node_modules\tailwindcss\lib\lib\setupTrackingContext.js:100:92
    at D:\laragon\www\ApaPesan\node_modules\tailwindcss\lib\processTailwindFeatures.js:46:11
    at plugins (D:\laragon\www\ApaPesan\node_modules\tailwindcss\lib\plugin.js:38:69)
    at LazyResult.runOnRoot (D:\laragon\www\ApaPesan\node_modules\postcss\lib\lazy-result.js:361:16)
    at LazyResult.runAsync (D:\laragon\www\ApaPesan\node_modules\postcss\lib\lazy-result.js:290:26)
    at LazyResult.async (D:\laragon\www\ApaPesan\node_modules\postcss\lib\lazy-result.js:192:30)
    at LazyResult.then (D:\laragon\www\ApaPesan\node_modules\postcss\lib\lazy-result.js:436:17)
Click outside, press Esc key, or fix the code to dismiss.
You can also disable this overlay by setting server.hmr.overlay to false in vite.config.js.