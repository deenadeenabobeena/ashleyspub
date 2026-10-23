import csv
import io

import requests


def _find_column(fieldnames, wanted):
    for name in fieldnames or []:
        if name and name.strip().lower() == wanted:
            return name
    return None


def load_shelves(csv_url, allowed_labels=None):
    """Download the published shelf spreadsheet and return {bgg_id: shelf}.

    The sheet needs the columns "BGG ID" and "Shelf" (a "Game" column is fine
    too and is ignored). Rows with an empty shelf are skipped. If the download
    fails or the columns are missing, this raises an error on purpose: the
    weekly update rewrites every game record, so quietly continuing without
    shelves would erase every shelf label from the search index.
    """
    response = requests.get(csv_url, timeout=30)
    response.raise_for_status()

    text = response.content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))

    id_column = _find_column(reader.fieldnames, "bgg id")
    shelf_column = _find_column(reader.fieldnames, "shelf")
    if not id_column or not shelf_column:
        raise ValueError(
            "The shelf spreadsheet needs columns named 'BGG ID' and 'Shelf', "
            f"but found: {reader.fieldnames}. Is the sheet published to the web "
            "as CSV, and is csv_url in config.json the published link?"
        )

    # Map lower-case label -> label exactly as written in config.json, so
    # "War" and "war" in the sheet both end up as the same shelf.
    allowed = {label.strip().lower(): label.strip() for label in (allowed_labels or [])}
    shelves = {}
    unknown_labels = set()

    for row in reader:
        game_id = (row.get(id_column) or "").strip()
        shelf = (row.get(shelf_column) or "").strip()
        if not game_id or not shelf:
            continue
        if allowed:
            if shelf.lower() in allowed:
                shelf = allowed[shelf.lower()]
            else:
                unknown_labels.add(shelf)
        shelves[game_id] = shelf

    if unknown_labels:
        print(
            "Warning: shelf labels not in config.json 'labels': "
            + ", ".join(sorted(unknown_labels))
        )

    return shelves


MAX_PICK_NOTE_LENGTH = 100


def load_picks(csv_url):
    """Download the published spreadsheet and return {bgg_id: {"by": name, "note": text}}.

    Uses the optional column "recc" (a bartender's name; "Picked by" also
    works) and the optional column "Pick note". A game is a staff pick when
    "recc" has a name; a note is not required. Long notes are shortened so
    they fit on the game card. If the "recc" column is missing, this prints a
    note and returns no picks, so a sheet without the column never stops the
    shelf labels from updating.
    """
    response = requests.get(csv_url, timeout=30)
    response.raise_for_status()

    text = response.content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))

    id_column = _find_column(reader.fieldnames, "bgg id")
    # The picker's name column is called "recc" in the sheet ("Picked by" also works)
    by_column = (_find_column(reader.fieldnames, "recc")
                 or _find_column(reader.fieldnames, "picked by"))
    note_column = _find_column(reader.fieldnames, "pick note")
    if not id_column or not by_column:
        print("Note: no 'recc' column in the spreadsheet, so there are no staff picks.")
        return {}

    picks = {}
    for row in reader:
        game_id = (row.get(id_column) or "").strip()
        picked_by = (row.get(by_column) or "").strip()
        if not game_id or not picked_by:
            continue
        note = (row.get(note_column) or "").strip() if note_column else ""
        if len(note) > MAX_PICK_NOTE_LENGTH:
            print(f"Warning: the pick note for game {game_id} is over "
                  f"{MAX_PICK_NOTE_LENGTH} characters and was shortened.")
            note = note[:MAX_PICK_NOTE_LENGTH - 1].rstrip() + "\u2026"
        picks[game_id] = {"by": picked_by, "note": note}

    return picks
