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

## Structure

```
run.py                       entry point (create_app())
ellastore/
  __init__.py                application factory
  catalog.py                 Game / Product dataclasses + the game list   <- edit games & prices here
  content.py                 site copy: slides, features, payment methods, footer
  db.py                      SQLite connection + schema
  services/                  business logic (no Flask/HTTP)
    players.py  coupons.py  orders.py  subscribers.py
  routes/
    pages.py                 HTML pages:  /  and  /game/<id>
    api.py                   JSON API:    /api/...
  admin/                     admin blueprint (/admin): auth.py (login, CSRF), views.py
  services/reports.py        dashboard aggregates
  cli.py                     init-admin, seed-demo
  templates/admin/           admin layout, pages and components.html (stat_tile, panel,
                             status_badge, orders_table, revenue_chart, game_bars, pagination)
  templates/
    base.html                layout
    partials/                header.html, footer.html
    pages/                   home.html, topup.html, 404.html
    components/              reusable Jinja macros (see below)
  static/
    css/style.css
    js/main.js               entry: shared components + current page
    js/lib/                  dom.js, api.js
    js/components/           one module per interactive component
    js/pages/                home.js, topup.js
tests/                       pytest: pages + API
```
