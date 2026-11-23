"""HTML pages."""

from flask import Blueprint, abort, jsonify, render_template, request

from ..catalog import all_games, get_game

bp = Blueprint("pages", __name__)


@bp.route("/")
def home():
    q = request.args.get("q", "").strip()
    games = all_games()
    if q:
        games = [g for g in games if q.lower() in g.name.lower()]
    return render_template("pages/home.html", games=games, query=q)


@bp.route("/game/<game_id>")
def topup(game_id):
    game = get_game(game_id)
    if game is None:
        abort(404)
    return render_template("pages/topup.html", game=game)


@bp.app_errorhandler(404)
def not_found(_err):
    if request.path.startswith("/api/"):
        return jsonify({"ok": False, "error": "Not found"}), 404
    return render_template("pages/404.html"), 404
