from pydantic import BaseModel


class Origin(BaseModel):
    x: float
    y: float


class Layer(BaseModel):
    origin: Origin
    scale: float
    data: str


class Frame(BaseModel):
    # name: str
    konva: Layer
    three: Layer
