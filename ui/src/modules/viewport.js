import { postData, saveDataUrl } from "./utils";

const Buttons = {
  Left: 1,
  Middle: 2,
  Right: 3,
};

export default class Viewport {
  el;
  three;
  konva;

  pointer;

  scaleFactor = 1.05;

  isMoving; // 平移画面
  isRotating; // 旋转模型
  isDraging; // 平移模型

  constructor(el, three, konva) {
    this.el = el;
    this.three = three;
    this.konva = konva;

    this.init();
  }

  init() {
    this.el.addEventListener("contextmenu", e => e.preventDefault());
    this.el.addEventListener("wheel", e => this.onWheel(e), { passive: true });
    this.el.addEventListener("mousedown", e => this.onMouseDown(e));
    this.el.addEventListener("mouseup", e => this.onMouseUp(e));
    this.el.addEventListener("mousemove", e => this.onMouseMove(e));
    this.reset();
  }

  reset() {
    this.isMoving = false; // 平移画面
    this.isRotating = false; // 旋转模型
    this.isDraging = false; // 平移模型
  }

  onMouseDown(event) {
    this.pointer = { x: event.x, y: event.y };

    if (event.which == Buttons.Left && this.three.isIntersected) {
      this.isDraging = true;
    }
    if (event.which == Buttons.Middle) {
      this.three.isControlsEnabled = this.three.isIntersected;
      this.isRotating = this.three.isIntersected;
    }
    if (event.which == Buttons.Right) {
      this.isMoving = true;
    }
  }

  onMouseUp(event) {
    this.reset();
    this.three.isControlsEnabled = false;
  }

  onMouseMove(event) {
    if (event.button != 0) return; // disbale when no buttons down
    if (this.three.isControlsEnabled) return; // disbale when orbit controlling
    if (!this.pointer) return;

    const deltaX = event.x - this.pointer.x;
    const deltaY = event.y - this.pointer.y;

    this.pointer = { x: event.x, y: event.y };

    if (this.isMoving) {
      this.konva.translate({ x: deltaX, y: deltaY });
      this.three.translate({ x: deltaX, y: deltaY });
    } else if (this.isDraging) {
      this.three.translate({ x: deltaX, y: deltaY });
    }
  }

  onWheel(event) {
    if (event.buttons > 0) return;
    const delta = event.deltaY < 0 ? this.scaleFactor : 1 / this.scaleFactor;

    this.pointer = { x: event.x, y: event.y };
    if (this.three.isIntersected) {
      this.three.scaleAtPointer(this.pointer, delta);
    } else {
      this.konva.scaleAtPointer(this.pointer, delta);
      this.three.scaleAtPointer(this.pointer, delta);
    }
  }

  async exportMerge() {
    if (!(this.konva.ready && this.three.ready)) return;
    const frame = await this.exportFrame();
    const res = await postData("http://127.0.0.1:8000/api/merge", frame);
    console.log("export merge image");
    saveDataUrl(res.image, `${this.konva.name}_merge.jpg`);
  }

  async exportMask() {
    if (!(this.konva.ready && this.three.ready)) return;
    const frame = await this.exportFrame();
    const res = await postData("http://127.0.0.1:8000/api/mask", frame);
    console.log("export mask image");
    saveDataUrl(res.image, `${this.konva.name}_mask.jpg`);
  }

  async exportHarmony() {
    if (!(this.konva.ready && this.three.ready)) return;
    const frame = await this.exportFrame();
    const res = await postData("http://127.0.0.1:8000/api/harmony", frame);
    console.log("export harmony image");
    saveDataUrl(res.image, `${this.konva.name}_harmony.jpg`);
  }

  async exportFrame() {
    const konvaFrame = this.konva.exportFrame();
    const threeFrame = this.three.exportFrame();
    const frame = {
      konva: konvaFrame,
      three: threeFrame,
    };
    return frame;
  }
}
