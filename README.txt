FAVOURITE KITCHEN - HOW TO DEPLOY

1. Put these files in ONE folder together with your existing pictures
   (1000314915.jpg, 1000314930.jpg, 1000314935.jpg, 1000318728.jpg,
   1000318730.jpg, 1000314961.jpg).
2. The admin back end needs Netlify Functions, so deploy with Git
   (GitHub -> Netlify "Import project") or the Netlify CLI: netlify deploy --prod
   Drag-and-drop does NOT run functions.
3. In Netlify: Site settings > Environment variables > add
   ADMIN_PASSWORD = (choose a strong password), then redeploy.
4. Open yoursite.netlify.app/admin.html, log in, edit prices/dishes/contact, Save.

UPGRADE (orders, accounts, chat)
New/changed files: index.html (replace), shop.js, orders.html, netlify/functions/shop.mjs
Netlify variables: ADMIN_PASSWORD (already set), ANTHROPIC_API_KEY (for the AI assistant)
Orders page: yoursite.netlify.app/orders.html
Human chat: sign up free at tawk.to, then put your chat id in shop.js (TAWK). Until then, "Talk to a person" opens WhatsApp.
