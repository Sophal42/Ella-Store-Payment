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

The frontend was removed so it can be rebuilt from scratch. What is left:

| File | Purpose |
|---|---|
| `ellastore/templates/stub.html` | plain placeholder page every HTML route renders |
| `ellastore/templates/admin/login.html` | minimal working admin sign-in form |

There is no `static/` folder any more - add `ellastore/static/` back when you build the new UI.
Page routes (`ellastore/routes/pages.py`) and the admin views (`ellastore/admin/views.py`)
call `render_template("stub.html", ...)` with a `title`, `message` and optional `data`;
replace those calls with your own templates.

The JSON API, the service layer, the database and the admin report queries are unchanged,
so you can drive the backend from the API while you rebuild the pages.

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
  templates/
    stub.html                placeholder page
    admin/login.html         admin sign-in
tests/                       pytest: pages + API
```

`content.py` still holds the old banner/feature/payment copy, ready to reuse.

## Adding a game

Add a `Game(...)` to `GAMES` in `ellastore/catalog.py`. It appears automatically in the menu data,
`/game/<id>`, and the API.

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
