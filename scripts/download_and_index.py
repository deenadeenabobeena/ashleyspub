import os
import json

from mybgg.downloader import Downloader
from mybgg.indexer import Indexer
from mybgg.shelves import load_picks, load_shelves
from setup_logging import setup_logging

def main(args):
    SETTINGS = json.load(open(args.config, "rb"))

    downloader = Downloader(
        project_name=SETTINGS["project"]["name"],
        cache_bgg=args.cache_bgg,
        debug=args.debug,
        bgg_token=args.bgg_token,
    )
    collection = downloader.collection(
        user_name=SETTINGS["boardgamegeek"]["user_name"],
        extra_params=SETTINGS["boardgamegeek"]["extra_params"],
    )
    num_games = len(collection)
    num_expansions = sum([len(game.expansions) for game in collection])
    print(f"Imported {num_games} games and {num_expansions} expansions from boardgamegeek.")

    if not len(collection):
        assert False, "No games imported, is the boardgamegeek part of config.json correctly set?"

    # Shelf labels from the staff spreadsheet (optional: skipped when no csv_url is set)
    shelves = None
    picks = None
    shelf_settings = SETTINGS.get("shelves", {})
    if shelf_settings.get("csv_url"):
        shelves = load_shelves(shelf_settings["csv_url"], shelf_settings.get("labels"))
        collection_ids = {str(game.id) for game in collection}
        with_shelf = len(collection_ids & set(shelves))
        not_in_collection = len(set(shelves) - collection_ids)
        print(f"Read {len(shelves)} shelf labels; {with_shelf} games have a shelf, "
              f"{len(collection_ids) - with_shelf} do not.")
        if not_in_collection:
            print(f"Note: {not_in_collection} sheet rows are not in the collection and were ignored.")

        # Staff picks from the same spreadsheet (optional columns)
        picks = load_picks(shelf_settings["csv_url"])
        picks_in_collection = len(collection_ids & set(picks))
        print(f"Read {len(picks)} staff picks; {picks_in_collection} are in the collection.")

    if not args.no_indexing:
        hits_per_page = SETTINGS["algolia"].get("hits_per_page", 48)
        indexer = Indexer(
            app_id=SETTINGS["algolia"]["app_id"],
            apikey=args.apikey,
            index_name=SETTINGS["algolia"]["index_name"],
            hits_per_page=hits_per_page,
        )
        indexer.add_objects(collection, shelves=shelves, picks=picks)
        indexer.delete_objects_not_in(collection)

        print(f"Indexed {num_games} games and {num_expansions} expansions in algolia, and removed everything else.")
    else:
        print("Skipped indexing.")


if __name__ == '__main__':
    import argparse

    setup_logging()

    parser = argparse.ArgumentParser(description='Download and index some boardgames')
    parser.add_argument(
        '--apikey',
        type=str,
        required=True,
        help='The admin api key for your algolia site'
    )
    parser.add_argument(
        '--bgg_token',
        type=str,
        required=True,
        help='The BoardGameGeek API authorization token'
    )
    parser.add_argument(
        '--no_indexing',
        action='store_true',
        help=(
            "Skip indexing in algolia. This is useful during development"
            ", when you want to fetch data från BGG over and over again, "
            "and don't want to use up your indexing quota with Algolia."
        )
    )
    parser.add_argument(
        '--cache_bgg',
        action='store_true',
        help=(
            "Enable a cache for all BGG calls. This makes script run very "
            "fast the second time it's run."
        )
    )
    parser.add_argument(
        '--debug',
        action='store_true',
        help="Print debug information, such as requests made and responses received."
    )
    parser.add_argument(
        '--config',
        type=str,
        required=False,
        default="config.json",
        help="Path to the config file (default: config.json from the working directory)."
    )

    args = parser.parse_args()

    main(args)
