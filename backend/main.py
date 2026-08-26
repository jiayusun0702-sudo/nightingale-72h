from fastapi import FastAPI

app = FastAPI(title="Nightingale Care Note API")

@app.get("/")
def read_root():
    return {"message": "Nightingale API Engine Online"}

