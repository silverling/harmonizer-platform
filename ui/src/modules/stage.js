import Konva from "konva";
import emitter from "./emitter";

export default class Stage {
  container;
  name;

  stage;
  layer;
  image;
  _dataUrl;

  origin; // in screen space
  scale;

  ready = false;

  constructor(el) {
    this.container = el;
    this.origin = { x: 0, y: 0 };
    this.scale = 1;
    this.init();
  }

  init() {
    this.setStage();
    this.setLayer();
  }

  setStage() {
    this.stage = new Konva.Stage({
      container: this.container.id,
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }

  setLayer() {
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
  }

  setImage(file) {
    Konva.Image.fromURL(file.dataUrl, image => {
      if (this.image != undefined) this.image.destroy();
      this.name = file.name;
      this._dataUrl = file.dataUrl;
      this.image = image;
      this.image.scale({ x: this.scale, y: this.scale });
      this.image.position(this.origin);
      this.layer.add(this.image);
      this.ready = true;
      emitter.emit("konvaReady");
    });
  }

  translate(delta) {
    if (!this.ready) return;

    this.origin.x += delta.x;
    this.origin.y += delta.y;

    this.image.position(this.origin);
  }

  scaleAtPointer(pointer, delta) {
    if (!this.ready) return;

    let pointerRel = {
      x: (pointer.x - this.origin.x) / this.scale,
      y: (pointer.y - this.origin.y) / this.scale,
    };
    this.scale *= delta;
    this.origin = {
      x: pointer.x - pointerRel.x * this.scale,
      y: pointer.y - pointerRel.y * this.scale,
    };

    this.image.scale({ x: this.scale, y: this.scale });
    this.image.position(this.origin);
  }

  exportFrame() {
    return {
      origin: this.origin,
      scale: this.scale,
      data: this._dataUrl,
    };
  }
}
