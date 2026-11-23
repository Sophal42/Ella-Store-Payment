from ellastore.catalog import all_games


def test_home_renders_placeholder(client):
    r = client.get("/")
    assert r.status_code == 200
    assert "ELLASTORE" in r.get_data(as_text=True)


def test_every_game_page_boots(client):
    for game in all_games():
        assert client.get(f"/game/{game.id}").status_code == 200


def test_unknown_game_is_404(client):
    r = client.get("/game/nope")
    assert r.status_code == 404
    assert "Page not found" in r.get_data(as_text=True)
