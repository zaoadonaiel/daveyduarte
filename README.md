# daveyduarte.com

Static personal profile site. No build step, no framework.

```
index.html
form-handler.php      contact form → info@thexdigital.com
css/style.css
js/main.js
images/               portrait, venture icons, ornaments, placeholders
```

---

## 1. The contact form

The form posts to `form-handler.php`, which emails **info@thexdigital.com**.
It submits over `fetch` when JavaScript is on (inline success/error message, no
page reload) and falls back to a normal POST + redirect when it is off.

**Requires PHP on the host.** On WordPress hosting, cPanel, or any LAMP stack it
works as-is — drop the whole folder in and go.

Open `form-handler.php` and check the settings block at the top:

| Setting | What to check |
|---|---|
| `$TO` | `info@thexdigital.com` — already set |
| `$FROM_ADDRESS` | Must be on a domain the server is allowed to send from. Keep it on `daveyduarte.com`, not the visitor's address, or SPF/DKIM will fail |
| `$THANKS_URL` / `$ERROR_URL` | Only used in the no-JavaScript fallback |

Protections already in: honeypot field, header-injection stripping on every
input, length caps, `FILTER_VALIDATE_EMAIL`, and `Reply-To` set to the sender so
you can hit reply.

### No PHP on the host?

Two lines change. Point the form at a form service and the JS keeps working
unchanged — both return the JSON shape `js/main.js` expects:

```html
<!-- Formspree -->
<form ... action="https://formspree.io/f/YOUR_ID" data-ajax="1">

<!-- or Web3Forms — add a hidden access key field -->
<form ... action="https://api.web3forms.com/submit" data-ajax="1">
  <input type="hidden" name="access_key" value="YOUR_KEY">
```

Set the destination address to `info@thexdigital.com` in that service's
dashboard, and delete `form-handler.php`.

---

## 2. Images

**Real artwork, ready to ship:**

- `davey-portrait.jpg` — your headshot, resized to 720px and re-encoded (42 KB)
- `venture-*.svg` — seven line icons, one per venture, drawn on a 48px grid
- `logo-mark.svg` — DD monogram in the nav
- `ornament.svg` — the gold rule in the ministry block
- `favicon.svg`, `texture-grain.svg` — icon and the hero's film-grain overlay

**Two slots waiting on your photography:**

- `placeholder-about.svg` → About section
- `placeholder-ministry.svg` → Ministry section

Both are marked "REPLACE WITH YOUR PHOTO" so nothing looks broken in the
meantime. Drop a JPG in `images/`, change the one `src` in `index.html` (search
for `SWAP:`), and update the `alt` text. Portrait-ish crops around 800×1000 fit
the frames best. You shoot for a living — these two will lift the page more than
anything else on this list.

---

## 3. Notes before it goes live

- **The stats band** (20+ years / 1,000+ projects / 100+ clients / 8 ventures)
  came from what you've told me, not from the old site. Worth a sanity check.
- **Zao Adonai El** was pulled out of the venture grid into its own Ministry
  section, and the duplicate Copyright Records card on the current site is gone.
- **Venture copy** is verbatim from daveyduarte.com; the bio is too.
- `og:image` and the canonical URL assume the site is at `https://daveyduarte.com/`.

## 4. Under the hood

Mobile-first CSS, breakpoints at 640px and 980px. Sticky nav with a drawer under
980. Scroll reveals via `IntersectionObserver`, disabled under
`prefers-reduced-motion`. Skip link, focus-visible rings, 44px minimum tap
targets, `aria-live` form status. JSON-LD `Person` schema with all eight domains
in `sameAs`. Fonts: Instrument Serif + Jost from Google Fonts — self-host them if
you want to drop the third-party request.
