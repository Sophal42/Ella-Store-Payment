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
