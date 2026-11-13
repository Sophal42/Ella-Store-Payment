## Run

```powershell
py -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements-dev.txt
.\.venv\Scripts\python run.py          # http://127.0.0.1:5000
.\.venv\Scripts\python -m pytest       # tests
```

`FLASK_DEBUG=1` enables auto-reload, `PORT` changes the port, `TOPUP_DB` changes the SQLite file (default `instance/topup.db`).
