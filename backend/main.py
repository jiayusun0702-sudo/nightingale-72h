from fastapi import FastAPI
from database import engine, Base
import models

# 自动生成数据库表
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Nightingale Care Note API")

@app.get("/")
def read_root():
    return {"message": "Nightingale API Engine & Database Ready"}
