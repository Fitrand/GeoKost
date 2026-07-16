from app.routers.kost import router as kost_router
from app.routers.kampus import router as kampus_router
from app.routers.recommend import router as recommend_router
from app.routers.predict import router as predict_router
from app.routers.mitra import router as mitra_router
from app.routers.booking import router as booking_router
from app.routers.favorit import router as favorit_router
from app.routers.review import router as review_router

__all__ = ["kost_router", "kampus_router", "recommend_router", "predict_router", "mitra_router", "booking_router", "favorit_router", "review_router"]
