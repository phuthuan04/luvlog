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