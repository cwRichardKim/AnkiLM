# CLAUDE.md - Staged APKG Importer Implementation Guide

Note: this CLAUDE.md file is not perfect, I created it with a couple of back and forth sessions while on my phone and am mostly including it here to preserve context. The general idea is to keep the importing code separate (and easily upgradeable) while staging the approach so that I can still work on other pieces and avoid over-engineering the import implementation

## Project Overview

Building a local-first prototype importer for Anki .apkg packages that will evolve into a production-ready, containerized Rust sidecar microservice for AnkiLM.

**Core Principle**: Freeze a stable JSON contract early and keep the Next.js web app fully decoupled from Anki internals.

-----

## Stage 0 - Local Proof of Concept (Hardcoded Path)

### Goals

- `/import` works with hardcoded local file path (no upload needed)
- Returns contract-valid JSON response
- Response includes: `stats`, `notetypes`, `decks`, `notes`, `cards`, `mediaMap`, `importerVersion`
- Notes keyed by GUID, decks by path, notetypes by GUID/ID
- `/version` returns pinned Anki version
- **No upload system, no security checks** - just prove the APKG → JSON transformation works

### Identity Policy

**This is critical to get right from the start:**

- Notes upsert by Anki note GUID
- Deck identity is by deckPath (using `::` separator)
- Notetypes prefer GUID, fallback to ID if needed
- Persist a SourceMap table for mapping external IDs to internal IDs

### Response Contract

```typescript
interface ImportResponse {
  stats: {
    notesAdded: number
    notesUpdated: number
    skipped: number
    mediaAdded: number
  }
  notetypes: Array<{
    guid: string
    name: string
    fields: string[]  // field names in order
    templates: Array<{
      name: string
      qfmt: string  // question format
      afmt: string  // answer format
    }>
  }>
  decks: Array<{
    path: string  // e.g. "Parent::Child::Grandchild"
  }>
  notes: Array<{
    guid: string
    notetypeGuid: string
    fields: string[]  // field values (may contain HTML/MathJax)
    tags: string[]
  }>
  cards: Array<{
    noteGuid: string
    ord: number
    deckPath: string
  }>
  mediaMap: Record<string, string>  // keys are stringified integers
  importerVersion: {
    anki: string
    service: string
  }
}
```

### Implementation

**requirements.txt**:

```
anki
fastapi
uvicorn
python-multipart
```
TODO: pin these versions once you move to production-ready stages

**main.py** (Stage 0 - Parse Real Data):

```python
from fastapi import FastAPI
from anki.collection import Collection
from anki.importing.apkg import AnkiPackageImporter
import tempfile
import os

app = FastAPI()

@app.post("/import")
async def import_apkg(request: dict):
    """Import a hardcoded local APKG file and return real parsed data."""
    
    # Stage 0: Hardcoded path - change this as needed for testing
    file_path = "/Users/richard/Decks/foo.apkg"
    # file_path = "./fixtures/basic-qa.apkg"  # Alternative for testing
    
    # Create temporary collection to import into
    with tempfile.TemporaryDirectory() as tmpdir:
        col_path = os.path.join(tmpdir, "collection.anki2")
        col = Collection(col_path)
        
        try:
            # Use Anki's native importer
            importer = AnkiPackageImporter(col, file_path)
            importer.run()
            
            # Extract real stats
            stats = {
                "notesAdded": importer.added_notes,
                "notesUpdated": importer.updated_notes,
                "skipped": importer.skipped_notes,
                "mediaAdded": len(importer.media_map)
            }
            
            # Extract notetypes with GUIDs
            notetypes = []
            for model in col.models.all():
                notetypes.append({
                    "guid": str(model["id"]),  # Use ID as GUID
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
            
            # Extract notes with GUIDs
            notes = []
            for note_id in col.find_notes(""):
                note = col.get_note(note_id)
                notes.append({
                    "guid": note.guid,
                    "notetypeGuid": str(note.mid),
                    "fields": note.fields,
                    "tags": note.tags
                })
            
            # Extract cards linked by note GUID
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
            
            return {
                "stats": stats,
                "notetypes": notetypes,
                "decks": decks,
                "notes": notes,
                "cards": cards,
                "mediaMap": importer.media_map,
                "importerVersion": {
                    "anki": "2.1.66",
                    "service": "0.0.1"
                }
            }
        finally:
            col.close()

@app.get("/version")
async def version():
    """Return version information."""
    import sys
    return {
        "service": "0.0.1",
        "anki": "2.1.66",
        "python": sys.version
    }

@app.get("/healthz")
async def health():
    return {"status": "healthy"}
```

**Next.js Integration**:

```typescript
// app/api/import/route.ts
export async function POST(request: Request) {
    const body = await request.json();
    
    const response = await fetch('http://localhost:4000/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    
    if (!response.ok) {
        return Response.json(await response.json(), { status: response.status });
    }
    
    return Response.json(await response.json());
}
```

### Testing Stage 0

```bash
# Start the service
cd importer
pip install -r requirements.txt
uvicorn main:app --reload --port 4000

# Test import (request body is ignored in Stage 0)
curl -X POST localhost:4000/import \
  -H "Content-Type: application/json" \
  -d '{}'

# Returns real parsed data from your hardcoded file:
# {
#   "stats": {"notesAdded": 10, "notesUpdated": 0, ...},
#   "notetypes": [{"guid": "1234", "name": "Basic", "fields": [...]}],
#   "decks": [{"path": "Default"}],
#   "notes": [{"guid": "abc123", "fields": ["Front text", "Back text"], ...}],
#   "cards": [{"noteGuid": "abc123", "ord": 0, "deckPath": "Default"}],
#   "mediaMap": {"0": "image1.jpg", "1": "audio.mp3"},
#   "importerVersion": {"anki": "2.1.66", "service": "0.0.1"}
# }

# To test different files, just change the hardcoded path in main.py and restart
```

### Definition of Done for Stage 0

- ✅ `/import` returns **real parsed data** from the hardcoded .apkg file
- ✅ All fields populated: notes, cards, decks, notetypes, media
- ✅ Uses actual Anki library to parse the file
- ✅ `/version` shows pinned Anki version
- ✅ API contract established with real data

-----

## Stage 1 - Add Upload System

### Goals

- Add `/upload` endpoint that accepts .apkg files
- Return `uploadId` (never expose file paths)
- Update `/import` to use uploaded files
- Add basic safety checks (file size, zip validation)

### Implementation

```python
from fastapi import FastAPI, HTTPException, UploadFile, File
import uuid
import os
from typing import Dict

# Add to existing main.py

# Simple in-memory upload cache
upload_cache: Dict[str, dict] = {}

# Basic safety limits
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB
MAX_COMPRESSION_RATIO = 100  # Zip bomb check

@app.post("/upload")
async def upload_apkg(file: UploadFile = File(...)):
    """Handle file upload and return upload ID."""
    
    # Read and check size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(400, {"error": {"message": f"File too large"}})
    
    # Generate secure upload ID
    upload_id = str(uuid.uuid4())
    
    # Save to temp location
    temp_path = f"/tmp/anki_upload_{upload_id}.apkg"
    with open(temp_path, "wb") as f:
        f.write(content)
    
    # Basic zip validation
    try:
        with zipfile.ZipFile(temp_path, 'r') as z:
            # Quick zip bomb check
            total_uncompressed = sum(f.file_size for f in z.filelist)
            total_compressed = sum(f.compress_size for f in z.filelist)
            ratio = total_uncompressed / max(total_compressed, 1)
            
            if ratio > MAX_COMPRESSION_RATIO:
                os.unlink(temp_path)
                raise HTTPException(400, {"error": {"message": "Suspicious compression ratio"}})
                
    except zipfile.BadZipFile:
        os.unlink(temp_path)
        raise HTTPException(400, {"error": {"message": "Invalid zip file"}})
    
    # Store in cache
    upload_cache[upload_id] = {
        "path": temp_path,
        "filename": file.filename
    }
    
    return {"uploadId": upload_id}

# Update import to use uploads
@app.post("/import")
async def import_apkg(request: dict):
    source = request.get("source", {})
    
    if source.get("kind") == "upload":
        upload_id = source.get("uploadId")
        if not upload_id or upload_id not in upload_cache:
            raise HTTPException(400, {"error": {"message": "Invalid upload ID"}})
        
        file_path = upload_cache[upload_id]["path"]
    else:
        # Fallback to hardcoded for backwards compatibility
        file_path = "/Users/richard/Decks/foo.apkg"
    
    # Rest of import logic remains the same...
```

### Definition of Done for Stage 1

- ✅ `/upload` accepts files and returns `uploadId`
- ✅ `/import` works with uploaded files
- ✅ Never exposes file paths to client
- ✅ Basic safety validation in place

-----

## Stage 2 - Frontend Integration

### Goals

- Add drag-and-drop UI component
- Wire up to upload + import flow
- Display parsed results in UI
- Handle errors gracefully

### Implementation

```tsx
// components/ApkgUploader.tsx
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';

export default function ApkgUploader() {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    
    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'application/apkg': ['.apkg'] },
        maxSize: 500 * 1024 * 1024,
        onDrop: async (files) => {
            setError(null);
            
            try {
                // Upload
                const formData = new FormData();
                formData.append('file', files[0]);
                
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                
                if (!uploadRes.ok) {
                    throw await uploadRes.json();
                }
                
                const { uploadId } = await uploadRes.json();
                
                // Import
                const importRes = await fetch('/api/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        source: { kind: 'upload', uploadId }
                    })
                });
                
                if (!importRes.ok) {
                    throw await importRes.json();
                }
                
                setResult(await importRes.json());
                
            } catch (err) {
                setError(err.error?.message || 'Import failed');
            }
        }
    });
    
    return (
        <div>
            <div {...getRootProps()} className="dropzone">
                <input {...getInputProps()} />
                <p>Drag & drop an .apkg file here</p>
            </div>
            
            {error && <div className="error">{error}</div>}
            
            {result && (
                <div className="result">
                    <h3>Import Complete</h3>
                    <p>Notes: {result.notes.length}</p>
                    <p>Cards: {result.cards.length}</p>
                    <p>Media files: {Object.keys(result.mediaMap).length}</p>
                    
                    <h4>Sample Note:</h4>
                    {result.notes[0] && (
                        <pre>{JSON.stringify(result.notes[0], null, 2)}</pre>
                    )}
                </div>
            )}
        </div>
    );
}
```

### Definition of Done for Stage 2

- ✅ Users can drag-and-drop .apkg files
- ✅ Real parsed data displayed in UI
- ✅ Upload + import flow works end-to-end
- ✅ Errors shown to user

-----

## SourceMap Table (for your app)

```sql
CREATE TABLE source_map (
    id SERIAL PRIMARY KEY,
    source VARCHAR(50) NOT NULL,        -- 'anki'
    kind VARCHAR(50) NOT NULL,          -- 'note', 'notetype', 'deck'
    external_id VARCHAR(255) NOT NULL,  -- GUID from Anki
    internal_id UUID NOT NULL,          -- Your app's UUID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(source, kind, external_id)
);
```

-----

## Future Stages (Outline Only)

### Stage 3 - S3 Support

- Add `source: {kind: "s3", url: "..."}` support
- Download to temp file before importing
- Keep local upload as primary path

### Stage 4 - Containerization

- Dockerfile for Python service
- docker-compose for local dev
- Health checks and monitoring

### Stage 5 - Rust Sidecar

- Reimplement in Rust using `anki` crate
- Match exact JSON contract
- Performance improvements

-----

## Running the Project

```bash
# Stage 0-2: Local development
cd importer
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 4000

# In another terminal
npm run dev

# Test it
curl -X POST -F "file=@test.apkg" localhost:4000/upload
```

-----

## Key Decisions

- **Upload ID indirection**: Prevents path traversal attacks, established from day 1
- **GUID-based identity**: Stable across imports, no reliance on internal IDs
- **Pinned Anki version**: Reproducible behavior, explicit in `/version`
- **Simple error format**: Just `{error: {message: string}}` for now
- **Local-first**: No containers/S3/concurrency until actually needed

-----

## What We’re NOT Doing Yet

- Full OpenAPI schemas (overkill for prototype)
- Detailed error codes/enums (add when needed)
- Containerization (Stage 4+)
- Concurrency control (not needed locally)
- Progress tracking (can add later)
- Authentication (handle at app level)
