import os
import requests

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
        })
    return results