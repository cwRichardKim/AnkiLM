from fastapi import FastAPI

app = FastAPI()

@app.get("/healthz")
async def health():
    return {"status": "healthy"}

@app.get("/version")
async def version():
    return {"version": "0.0.1"}

@app.get("/import")
async def import_apkg(request: dict):
    return {"status": "imported"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=4000)