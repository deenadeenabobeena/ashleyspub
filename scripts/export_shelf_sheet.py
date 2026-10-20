#!/usr/bin/env python3
"""Export the pub's game list to a CSV for assigning shelf labels.

Reads the Algolia settings from config.json (the same public search-only key
the website already uses), fetches every game in the index, and writes a CSV
with three columns: BGG ID, Game, Shelf. The Shelf column is left blank on
purpose so the bartenders can fill in every game themselves.

Usage (from the repo folder, with Python 3 installed; no extra packages):
    python scripts/export_shelf_sheet.py
    python scripts/export_shelf_sheet.py --config config.json --out shelf_sheet.csv

Then in Google Sheets: File > Import > Upload shelf_sheet.csv, and add a
dropdown to the Shelf column (Data > Data validation).
"""
import argparse
import csv
import json
import os
import sys
import urllib.request

# Algolia's search API will not return more than this many hits for one query.
SEARCH_HIT_LIMIT = 1000


def fetch_page(app_id, api_key, index_name, page, hits_per_page):
    url = f"https://{app_id}-dsn.algolia.net/1/indexes/{index_name}/query"
    body = json.dumps({
        "params": (
            f"query=&page={page}&hitsPerPage={hits_per_page}"
            "&attributesToRetrieve=id,name"
        )
    }).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=body,
        headers={
            "X-Algolia-Application-Id": app_id,
            "X-Algolia-API-Key": api_key,
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def fetch_all_games(settings, fetch=fetch_page):
    algolia = settings["algolia"]
    app_id = algolia["app_id"]
    api_key = algolia["api_key_search_only"]
    index_name = algolia["index_name"]

    games = {}
    page = 0
    while True:
        data = fetch(app_id, api_key, index_name, page, 200)
        for hit in data["hits"]:
            games[hit["id"]] = hit["name"]
        if page + 1 >= data["nbPages"]:
            break
        page += 1

    if data["nbHits"] >= SEARCH_HIT_LIMIT:
        print(
            f"Warning: the index has {data['nbHits']} games and Algolia search "
            f"returns at most {SEARCH_HIT_LIMIT}. Some games may be missing.",
            file=sys.stderr,
        )
    return games


def write_csv(games, out_path):
    rows = sorted(games.items(), key=lambda item: item[1].casefold())
    # utf-8-sig so Excel and Google Sheets read accented titles correctly.
    with open(out_path, "w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.writer(handle)
        writer.writerow(["BGG ID", "Game", "Shelf"])
        for game_id, name in rows:
            writer.writerow([game_id, name, ""])
    return len(rows)


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--config",
        default=os.path.join(here, "..", "config.json"),
        help="Path to config.json (default: ../config.json next to this script).",
    )
    parser.add_argument(
        "--out",
        default="shelf_sheet.csv",
        help="Where to write the CSV (default: shelf_sheet.csv).",
    )
    args = parser.parse_args()

    with open(args.config, "r", encoding="utf-8") as handle:
        settings = json.load(handle)

    games = fetch_all_games(settings)
    count = write_csv(games, args.out)
    print(f"Wrote {count} games to {args.out}")


if __name__ == "__main__":
    main()
