import os
import requests
from repositories import media_repo, suggestion_repo
from models import Movie, Book

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
GOOGLE_BOOKS_API_KEY = os.getenv("GOOGLE_BOOKS_API_KEY")

def search_movies(query: str):
    resp = requests.get(
        "https://api.themoviedb.org/3/search/movie",
        params={"api_key": TMDB_API_KEY, "query": query, "language": "vi-VN"},
        timeout=5,
    )
    resp.raise_for_status()
    results = []
    for item in resp.json().get("results", [])[:10]:
        poster = item.get("poster_path")
        results.append({
            "title": item.get("title"),
            "cover_url": f"https://image.tmdb.org/t/p/w300{poster}" if poster else "",
            "year": (item.get("release_date") or "")[:4],
            "external_id": str(item.get("id")),
            "category": ",".join(str(g) for g in item.get("genre_ids", [])),
        })
    return results

def search_books(query: str):
    resp = requests.get(
        "https://www.googleapis.com/books/v1/volumes",
        params={"q": query, "key": GOOGLE_BOOKS_API_KEY, "maxResults": 10},
        timeout=5,
    )
    resp.raise_for_status()
    results = []
    for item in resp.json().get("items", []):
        info = item.get("volumeInfo", {})
        results.append({
            "title": info.get("title"),
            "cover_url": info.get("imageLinks", {}).get("thumbnail", ""),
            "authors": ", ".join(info.get("authors", [])),
            "external_id": item.get("id"),
            "category": ", ".join(info.get("categories", [])),
        })
    return results

def get_similar_movies(movie_id: str, limit: int = 5):
    resp = requests.get(
        f"https://api.themoviedb.org/3/movie/{movie_id}/similar",
        params={"api_key": TMDB_API_KEY, "language": "vi-VN"},
        timeout=5,
    )
    resp.raise_for_status()
    results = []
    for item in resp.json().get("results", [])[:limit]:
        poster = item.get("poster_path")
        results.append({
            "title": item.get("title"),
            "cover_url": f"https://image.tmdb.org/t/p/w300{poster}" if poster else "",
            "external_id": str(item.get("id")),
            "category": ",".join(str(g) for g in item.get("genre_ids", [])),
        })
    return results

def get_books_by_category(category: str, limit: int = 5):
    if not category:
        return []
    first_category = category.split(",")[0].strip()
    resp = requests.get(
        "https://www.googleapis.com/books/v1/volumes",
        params={"q": f"subject:{first_category}", "key": GOOGLE_BOOKS_API_KEY, "maxResults": limit},
        timeout=5,
    )
    resp.raise_for_status()
    results = []
    for item in resp.json().get("items", []):
        info = item.get("volumeInfo", {})
        results.append({
            "title": info.get("title"),
            "cover_url": info.get("imageLinks", {}).get("thumbnail", ""),
            "external_id": item.get("id"),
            "category": ", ".join(info.get("categories", [])),
        })
    return results

def crawl_movie_suggestions(db):
    added = 0
    seed = media_repo.get_random_high_rated(db, Movie)
    if seed and seed.external_id:
        for m in get_similar_movies(seed.external_id):
            exists = media_repo.title_exists(db, Movie, m["title"]) or suggestion_repo.title_exists_in_suggestions(db, "movies", m["title"])
            if not exists:
                suggestion_repo.create_suggestion(db, "movies", m["title"], m["cover_url"], m["external_id"], m["category"], seed.title)                
                added += 1
    return added

def crawl_book_suggestions(db):
    added = 0
    seed = media_repo.get_random_high_rated(db, Book)
    if seed and seed.category:
        for b in get_books_by_category(seed.category):
            exists = media_repo.title_exists(db, Book, b["title"]) or suggestion_repo.title_exists_in_suggestions(db, "books", b["title"])
            if not exists:
                suggestion_repo.create_suggestion(db, "books", b["title"], b["cover_url"], b["external_id"], b["category"], seed.title)
                added += 1
    return added



OMDB_API_KEY = os.getenv("OMDB_API_KEY")

def get_movie_detail(external_id: str, title: str):
    overview = ""
    imdb_id = None
    if external_id:
        try:
            resp = requests.get(
                f"https://api.themoviedb.org/3/movie/{external_id}",
                params={"api_key": TMDB_API_KEY, "language": "vi-VN"},
                timeout=5,
            )
            resp.raise_for_status()
            overview = resp.json().get("overview", "")
        except requests.RequestException:
            pass
        try:
            resp2 = requests.get(
                f"https://api.themoviedb.org/3/movie/{external_id}/external_ids",
                params={"api_key": TMDB_API_KEY},
                timeout=5,
            )
            resp2.raise_for_status()
            imdb_id = resp2.json().get("imdb_id")
        except requests.RequestException:
            pass

    imdb, tomatometer = None, None
    try:
        params = {"apikey": OMDB_API_KEY, "i": imdb_id} if imdb_id else {"apikey": OMDB_API_KEY, "t": title}
        resp = requests.get("http://www.omdbapi.com/", params=params, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        if data.get("Response") != "False":
            imdb = data.get("imdbRating")
            tomatometer = next((r["Value"] for r in data.get("Ratings", []) if r["Source"] == "Rotten Tomatoes"), None)
    except requests.RequestException:
        pass

    return {"overview": overview or "Chưa có tóm tắt.", "imdb": imdb, "tomatometer": tomatometer}