# 2018.winnipegelection.ca (static archive)

Static HTML copy of **2018.winnipegelection.ca**, Open Democracy Manitoba's guide to the 2018 Winnipeg municipal election. It ran on WordPress 5.9.19, with the ElectionData-V2 theme supplied by the OpenDemocracyPlugin-master plugin. It was crawled from olddroplet (`odm-nginx-ruby-php-2018`, 159.203.24.194) on 2026-10-24, before the server was retired.

* `site/` holds the crawl: 1,393 files, after the transform commit described below.
* `transform.py` is the script that made the second commit.
* `crawl.log.gz` holds the wget log.

The WordPress source, the DB dump (`2018_winnipegelection_ca`) and the nginx vhost are in the private repo `OpenDemocracyManitoba/archive-2018.winnipegelection.ca`.

## How it was crawled

The crawl ran from a workstation against the origin directly (an `/etc/hosts` entry, bypassing Cloudflare). wp-cron was disabled and the site was frozen first.

```
wget --mirror --page-requisites --adjust-extension --restrict-file-names=windows \
     --no-host-directories --directory-prefix=site \
     -e robots=off --wait=0.1 --user-agent='ODM-archiver/1.0' \
     --reject-regex='(/wp-json|[?&]rest_route=|xmlrpc\.php|wp-login\.php|/wp-admin|[?&]replytocom=|/feed/?$|/trackback/?$|[?&]s=|/candidates/[^/]+/[0-9]+/|[?&]p=[0-9]+)' \
     -o crawl.log https://2018.winnipegelection.ca/
```

* It ran on 2026-10-24, 11:44–11:51 CDT, and downloaded 1,426 files. wget exited 8 because some URLs returned 404.
* The last two reject patterns skip a crawler trap and WordPress `/?p=N` shortlinks:
  * `/candidates/<slug>/<N>/` is WordPress's path form of a paged candidate page, and each one has its own pager. See the 2016 archive for the details.
  * `/?p=N` shortlinks are duplicates of pages saved at their real paths, so they aren't archived (owner decision, 2026-10-24).
* There is no `--convert-links`, so the saved HTML keeps its original absolute `https://2018.winnipegelection.ca/…` hrefs. The pager uses root-relative ones.

Four files are referenced only where wget doesn't look, so they were copied in from the source tree:

* `wp-content/uploads/2018/07/cropped-favicon-1024-270x270.png` (icon `<meta>` tags);
* `wp-content/uploads/2018/07/winnipeg_skyline.jpg` (CSS);
* `wp-includes/js/wp-emoji-release.min.js` (inline JS);
* `wp-content/themes/ElectionData/ElectionData-V2/js/html5.js` (an IE conditional comment).

On the server, `wp-content/themes/ElectionData` is a symlink to `wp-content/plugins/OpenDemocracyPlugin-master/theme/`.

## Changes made on the live site before the crawl

The DB wasn't modified. The private archive repo has the untouched source and dump.

* **wp-cron disabled** (`DISABLE_WP_CRON`, and nginx returns 403 for `/wp-cron.php`). This stopped the news scraper.
* **Candidate news paging fixed.** Candidate pages link to `?page=N#news`, but WordPress 5.9 301'd every `?page=N` back to page 1 (`redirect_canonical`, and `WP::handle_404` before it). The mu-plugin `wp-content/mu-plugins/odm-archive-candidate-paging.php` turns both off for `ed_candidates` with `page` > 1.
* **Jetpack's image/asset CDN turned off.** The site served images and core CSS/JS from `i0.wp.com` / `c0.wp.com` (Jetpack modules `photon`, `photon-cdn`), which wget doesn't fetch. The mu-plugin `odm-archive-no-jetpack-cdn.php` drops those modules. The crawl has no `wp.com` CDN references.
* **WP-Super-Cache:** its cache was moved aside, so the crawl saw freshly rendered pages. The cache comments in the HTML come from the crawl itself.

## Completeness

|Check|Result|
|-|-|
|Candidate pages|174 of 174 published `ed_candidates`. `candidates/3336/` is a real candidate (Tracey Drexler) whose slug is a number.|
|Paginated candidates|37, with 270 extra news pages. None missing, none identical to page 1.|
|News|1,397 of the 1,405 approved news articles appear on some page (details below)|
|Questionnaire answers|490 question/answer pairs on 101 candidate pages. The DB has 476 non-empty `ed_answers` out of 870, the rest being empty placeholders.|
|Uploads|854 referenced, 2 missing (below). The crawl holds 852 of the 1,510 files in the source uploads tree; the rest aren't linked from any page.|
|Asset CDNs|no `i0.wp.com` / `c0.wp.com` references|

**News.** There is no paginated news archive on this site: `news_articles.html` shows the latest 90 items, and older news is reachable only through the candidate pages.

The plugin moderates news, and only `approved` articles were ever shown. Of the 2,504 published articles, 1,405 are approved; 981 are `rejected` and 118 are `new`.

1,397 of the approved articles appear in the crawl. The other 8 couldn't be reached on the live site either. The cause is in the theme's `display_news_summaries()`, and **it's archived as is** (owner decision, 2026-10-24):

* 2 mention only Steph Meilleur, whose candidate page isn't published.
* The pager computes `total = round(count / 10)`, so a candidate's last page is never linked when it would hold fewer than 5 articles. For example, Garth Steek has 33 articles but 3 pages; Matt Allard has 103 but 10 pages.
* An article with no summary for that candidate is skipped, so some pages show 9 items.
* Some articles were scraped twice under two post IDs, so they appear twice in a list.

The candidate pages carry the theme's notice "Showing news articles published after May 1st 2018". That's only text: `get_news()` has no date filter. All but one approved article are from May 2018 or later anyway.

**404s:**

* `wp-content/themes/ElectionData/ElectionData-V2/ipad4/arrow.gif` and `arrowl.gif`: referenced by the theme CSS, and missing on the live site too.
* `wp-content/uploads/2018/09/Downtown-Winnipeg-BIZ-Mayoral-Forum-Candidate-Survey-Answers-1.pdf` and `wp-content/uploads/2018/10/KeyIssuesWinnipeg-web.pdf`: linked from content, but not on the server.

## Links to other hosts

4 files (`frequently-asked-questions/`, `about-open-democracy-manitoba/` and their slashless copies) link to `http://www.manitobaelection.ca/frequently-asked-questions/#news`, the "news gathering process" explanation on the provincial site. That's a real cross-site link, left as it is.

There were no references to `upcoming.manitobaelection.ca` or `159.203.24.194`.

## wget quirk, left as is

`frequently-asked-questions.html`, `news_articles.html`, `press-mentions.html`, `press-releases.html` and `who-constituency.html` at the root are wget's saves of slashless links (e.g. `/news_articles`). The server 301'd each one to the slash form, and wget saved the redirect target under the slashless name. Static hosting with `auto-trailing-slash` serves `/news_articles` from `news_articles.html`.

## Commits and URL mapping

The repo has two commits:

1. **Raw crawl.** `--restrict-file-names=windows` saved each URL's `?` as `@`.
2. **Path-based URLs** (owner decision, 2026-10-24), made by `python3 -I transform.py 2018.winnipegelection.ca --apply`:

|Old URL (live site)|Crawl file (commit 1)|Now|
|-|-|-|
|`/candidates/<slug>/?page=N#news`|`candidates/<slug>/index.html@page=N.html`|`candidates/<slug>/page/N/index.html` (270 files; 37 candidates)|
|`/candidates/<slug>/?page=1#news`|`candidates/<slug>/index.html@page=1.html` (37 files)|dropped: identical to `candidates/<slug>/index.html`, apart from cache comments|
|`/candidates/<slug>/<N>/` (canonical of a paged candidate page)|(crawler trap, not fetched)|canonicals now point at `…/page/N/` (270)|
|`<file>?ver=X`|`<file>@ver=X`, `<file>@ver=X.css`|`<file>` (12 files; no plain copy existed)|
|`we2018address/address_lookup.css?3`, `address_lookup.js?17`|`address_lookup.css@3.css`, `address_lookup.js@17`|`address_lookup.css`, `address_lookup.js`. These were the owner's hand-added cache-busters (owner decision, 2026-10-24).|

The transform also rewrote the links in the HTML:
* 3,092 pager links: `?page=N` → `page/N/`, keeping `#news`, and `?page=1` → the bare candidate path.
* 5,671 cache-buster query strings stripped, including the JSON-escaped emoji-loader URL and the two relative links on `we2018address/`.
* 16 `<link rel='shortlink'>` tags removed.

Only the external Font Awesome stylesheet keeps a `?ver=`. The transform only rewrites a link when its new target is in `site/`, and it never overwrites a file.

**No `@` files are left.** An internal-link check finds **0 unresolved out of 36,416**. It covers every `https://2018.winnipegelection.ca/…`, root-relative or `url()` reference, ignores the blocked `/wp-json` and `xmlrpc.php` links, and counts `/foo` → `foo.html` as resolved.

**For the hosting phase:** 301 `?page=N` to `…/page/N/` (`N=1` → the bare path), and `/candidates/<slug>/<N>/` to `…/page/N/`. Query strings on assets need no rule.

## External dependencies mirrored

In Phase B of the olddroplet migration (R4, 2026-10-24), the stylesheets every page needs to render were copied into `site/_ext/` by `python3 -I mirror_deps.py 2018.winnipegelection.ca --apply`, and the pages now load the copies (root-relative links):

* `https://use.fontawesome.com/releases/v5.1.1/css/all.css` → `/_ext/use.fontawesome.com/releases/v5.1.1/css/all.css` (507 HTML files), with its webfonts, byte-identical
* `https://fonts.googleapis.com/css?family=Libre+Franklin%3A400%2C700` → `/_ext/fonts.googleapis.com/css/libre-franklin-400-700.css` (508 HTML files), with its `woff2` files; the CSS (fetched as a current Chrome) points at the copies under `/_ext/fonts.gstatic.com/`
* the `dns-prefetch` hints for `fonts.googleapis.com` and `use.fontawesome.com` were removed (507 HTML files)

Font Awesome Free is under the Font Awesome Free License (fonts SIL OFL 1.1, CSS MIT); Libre Franklin is under the SIL OFL 1.1. Other third-party scripts and embeds were left as they were.

## Analytics removed

Google Tag Manager / Google Analytics (and the Google Ads tag that rides on `gtag.js`) were removed in Phase B of the olddroplet migration (owner decision D7, 2026-10-24) by `python3 -I strip_analytics.py 2018.winnipegelection.ca --apply`. Files changed: 507 HTML files. IDs: `AW-798203154`. Each loader went together with its inline block and the comment around it. Other third-party scripts (fonts, embeds, Jetpack stats) were left as they were.

Snippet shapes removed (IDs and whitespace normalised):

* 507 ×

  ```html
  <!-- Global site tag (gtag.js) - Google Ads: 798203154 --> <script async src="https://www.googletagmanager.com/gtag/js?id=<ID>"></script> <script> if (typeof conversioned === "undefined") { window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '<ID>'); } </script>
  ```

* 1 ×

  ```html
  <!-- Event snippet for Address Search conversion page --><br /> <script> var conversioned = true; window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '<ID>'); gtag('event', 'conversion', {'send_to': '<ID>/d_2QCLXMu48BEJK6zvwC'}); </script>
  ```

## Hosting

Served from **Cloudflare Workers static assets** (Phase B of the olddroplet migration). `wrangler.jsonc`, `worker.js`, `.gitignore`, `site/404.html` and this section are written by `hosting.py` (`python3 -I hosting.py 2018.winnipegelection.ca <preview|routed|final>`).

* **Worker:** `static-2018-winnipegelection-ca`, account `Stungeye@gmail.com's Account`.
* **Deploy:** `npx wrangler@4.148.0 deploy` from the repo root. Only `site/` is uploaded.
* **Routes:** `2018.winnipegelection.ca/*` on zone `winnipegelection.ca`, over the existing proxied DNS record.
* **workers.dev:** off (R11). Per-version preview URLs are off (`preview_urls: false`).
* **Serving:** `html_handling: auto-trailing-slash` (`/foo` serves `foo.html`, `/foo/` serves `foo/index.html`; the other forms 307 to those) and `not_found_handling: 404-page` (`site/404.html`, a minimal page added in Phase B).
* **Worker script** (`worker.js`, runs only for `/candidates/*` and `/parties/*`): `?page=N` / `?pagenum=N` 301 to `…/page/N/` (`N` ≤ 1 → the bare path; other query parameters are dropped; a page past the end → the bare path), and `/candidates/<slug>/<N>/` 301s to `…/page/N/`. Everything else falls through to the assets.
* **http → https:** the zone setting "Always Use HTTPS" (301 at Cloudflare's edge).
* **Redirect rules:** none.
* **Rollback:** while the old origin is up, remove `routes` from `wrangler.jsonc` and deploy (or delete the route in the dashboard); the origin serves again at once. A bad version can be rolled back with `npx wrangler@4.148.0 rollback`.

## Secret scan

The Phase A §7.2 scan was run over `site/` and found nothing. It checks for:

* no `.git`, `.env`, `.ftpconfig`, `.htpasswd`, `debug.log`, `*.php` or `*.sql*` files;
* no `DB_PASSWORD`, `AUTH_KEY`, `SECURE_AUTH`, private keys, `phpinfo()` or `mysql(i)_connect` in any text file;
* no `*.php.html` pages.
