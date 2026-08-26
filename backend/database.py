from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 使用轻量级 SQLite 数据库文件
SQLALCHEMY_DATABASE_URL = "sqlite:///./nightingale.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# 数据库 Session 依赖项
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

