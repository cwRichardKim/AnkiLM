from fastapi import FastAPI
import tempfile
import os
import zipfile
from anki.collection import Collection
from anki.importing.apkg import AnkiPackageImporter

app = FastAPI()

@app.get("/healthz")
async def health():
    return {"status": "healthy"}

@app.get("/version")
async def version():
    return {"version": "0.0.1"}

@app.post("/import")
async def import_apkg(request: dict):
    """Import a hardcoded local APKG file and return real parsed data."""
    
    file_path = "./test_decks/Programming.apkg"
    # Test if we can create and open a simple collection
    
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            col_path = os.path.join(tmpdir, "collection.anki2")
            col = Collection(col_path)
            
            try:
                # Extract the collection manually to bypass media validation
                with zipfile.ZipFile(file_path, 'r') as z:
                    # Try the newer format first, fallback to older
                    try:
                        collection_data = z.read('collection.anki21b')
                        print("Using collection.anki21b (newer format)")
                    except KeyError:
                        collection_data = z.read('collection.anki2')
                        print("Using collection.anki2 (older format)")
                    
                    # Write the collection data to our temp collection
                    with open(col_path, 'wb') as f:
                        f.write(collection_data)
                
                # Now open the collection directly (bypasses import validation)
                col = Collection(col_path)
                print("Successfully opened collection directly")
                
                # Extract the data we need
                stats = {
                    "notesAdded": 0,  # We can't get this from direct collection access
                    "notesUpdated": 0,
                    "skipped": 0,
                    "mediaAdded": 0  # We're ignoring media for now
                }
                
                # Extract notetypes
                notetypes = []
                for model in col.models.all():
                    notetypes.append({
                        "guid": str(model["id"]),
                        "name": model["name"],
                        "fields": [f["name"] for f in model["flds"]],
                        "templates": [
                            {
                                "name": t["name"],
                                "qfmt": t["qfmt"],
                                "afmt": t["afmt"]
                            } for t in model["tmpls"]
                        ]
                    })
                
                # Extract decks
                decks = []
                for deck_id, deck in col.decks.all_decks_and_child_name_ids():
                    decks.append({"path": deck["name"]})
                
                # Extract notes
                notes = []
                for note_id in col.find_notes(""):
                    note = col.get_note(note_id)
                    notes.append({
                        "guid": note.guid,
                        "notetypeGuid": str(note.mid),
                        "fields": note.fields,
                        "tags": note.tags
                    })
                
                # Extract cards
                cards = []
                for card_id in col.find_cards(""):
                    card = col.get_card(card_id)
                    note = col.get_note(card.nid)
                    deck = col.decks.get(card.did)
                    cards.append({
                        "noteGuid": note.guid,
                        "ord": card.ord,
                        "deckPath": deck["name"]
                    })
                
                print(f"Extracted {len(notes)} notes, {len(cards)} cards, {len(decks)} decks")
                
                return {
                    "stats": stats,
                    "notetypes": notetypes,
                    "decks": decks,
                    "notes": notes,
                    "cards": cards,
                    "mediaMap": {},  # Empty for now
                    "importerVersion": {
                        "anki": "25.9",
                        "service": "0.0.1"
                    }
                }
                
            except Exception as e:
                print(f"Error: {e}")
                return {
                    "error": str(e),
                    "error_type": str(type(e)),
                    "file_path": file_path
                }
            finally:
                col.close()
                
    except Exception as e:
        print(f"Outer error: {e}")
        return {
            "error": str(e),
            "error_type": str(type(e)),
            "file_path": file_path
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=4000)