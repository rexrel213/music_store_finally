from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.routers import register, auth, adminpanel, product, order, favorite, brand, supplies, sold
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import logging
import os


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)







# --- ВСТАВЬТЕ ОБРАБОТЧИК ИСКЛЮЧЕНИЙ ЗДЕСЬ ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    logging.error(f"Unhandled exception: {exc}\n{traceback.format_exc()}")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )
# --------------------------------------------

app.include_router(sold.router)
app.include_router(register.router)
app.include_router(auth.router) 
app.include_router(adminpanel.router) 
app.include_router(product.router) 
app.include_router(order.router) 
app.include_router(favorite.router) 
app.include_router(brand.router) 
app.include_router(supplies.router) 


@app.get("/")
async def root():
    return {"message": "Hello from FastAPI backend!"}


