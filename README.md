## Run

```powershell
py -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements-dev.txt
.\.venv\Scripts\python run.py          # http://127.0.0.1:5000
.\.venv\Scripts\python -m pytest       # tests
```

`FLASK_DEBUG=1` enables auto-reload, `PORT` changes the port, `TOPUP_DB` changes the SQLite file (default `instance/topup.db`).

## Admin panel

```powershell
.\.venv\Scripts\flask --app ellastore init-admin          # set username/password (writes instance/config.py)
.\.venv\Scripts\flask --app ellastore seed-demo --count 90 # optional: fake orders for development
```
Open http://127.0.0.1:5000/admin and sign in with the default login **admin / admin123**.
To change it, run `init-admin` and restart the server.

## Frontend

Server-rendered Jinja templates with plain CSS and one JS module - no build step, no CDN framework.

| File | Purpose |
|---|---|
| `templates/base.html` | store layout: header, search, game menu, footer, toast |
| `templates/pages/home.html` | hero + game grid; search is server-side via `?q=` |
| `templates/pages/topup.html` | player check, product picker, payment method, coupon, totals |
| `templates/pages/404.html` | not-found page |
| `templates/admin/base.html` | admin shell with sidebar, flashes and logout |
| `templates/admin/components.html` | macros: `status_badge`, `orders_table`, `pagination` |
| `templates/admin/dashboard.html` | KPI tiles, 14-day revenue chart, top games, recent orders |
| `templates/admin/orders.html` | status tabs, filters, paged table |
| `templates/admin/order_detail.html` | order facts, totals, status form |
| `templates/admin/subscribers.html` | newsletter list + CSV export |
| `templates/admin/games.html` | catalog table with per-game revenue |
| `templates/admin/login.html` | admin sign-in |
| `static/css/style.css` | storefront styles |
| `static/css/admin.css` | admin styles |
| `static/js/app.js` | player check, coupon, live totals, order creation, subscribe |

Selection state is expressed with `:has(input:checked)` and `data-state` attributes, so the JS only
calls the API and updates text/classes. The browser total is cosmetic - the server recomputes it.

## Structure

```
run.py                       entry point (create_app())
ellastore/
  __init__.py                application factory
  catalog.py                 Game / Product dataclasses + the game list   <- edit games & prices here
  content.py                 site copy: slides, features, payment methods, footer
  db.py                      SQLite connection + schema
  services/                  business logic (no Flask/HTTP)
    players.py  coupons.py  orders.py  subscribers.py  reports.py
  routes/
    pages.py                 HTML pages:  /  and  /game/<id>
    api.py                   JSON API:    /api/...
  admin/                     admin blueprint (/admin): auth.py (login, CSRF), views.py
  cli.py                     init-admin, seed-demo
  templates/                 store and admin templates (see above)
  static/                    css + js
tests/                       pytest: pages + API
```

`content.py` still holds the old banner/feature/payment copy if you want to reuse it.

## Adding a game

Add a `Game(...)` to `GAMES` in `ellastore/catalog.py`. It appears automatically in the menu,
the home grid, `/game/<id>`, and the API.

## API

| Method | Path | Body |
|---|---|---|
| GET | `/api/games`, `/api/games/<id>` | |
| POST | `/api/player/check` | `{game_id, uid, server}` |
| POST | `/api/coupon` | `{code}` |
| POST | `/api/orders` | `{game_id, uid, server, item, pay, coupon}` |
| GET | `/api/orders/<id>` | |
| POST | `/api/subscribe` | `{email}` |

Prices and discounts are computed on the server; the client total is never trusted.
The player lookup is still a mock (`services/players.py:lookup_name`) and no payment gateway is connected;
orders are saved with status `pending_payment`.
