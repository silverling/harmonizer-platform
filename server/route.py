from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from . import handler
from .classes import Frame

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/ui", StaticFiles(directory="./ui/dist/", html=True))


@app.get("/")
def root():
    return RedirectResponse("/ui/")


@app.post("/api/merge")
async def merge(frame: Frame):
    return {"message": "yes", "image": handler.get_merge(frame)}


@app.post("/api/mask")
async def mask(frame: Frame):
    return {"message": "yes", "image": handler.get_mask(frame)}


@app.post("/api/harmony")
async def harmony(frame: Frame):
    return {"message": "yes", "image": handler.get_harmony(frame)}
