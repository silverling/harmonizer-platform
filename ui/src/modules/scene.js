import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ConvexHull } from "three/examples/jsm/math/ConvexHull";
import emitter from "./emitter";

export default class Scene {
  canvas;
  name;

  scene;
  camera;
  renderer;
  controls;
  raycaster;
  convexhull;

  width;
  height;
  origin; // in screen space (world space)
  scale;
  offset;

  model;
  lightPivot;
  plane;

  isIntersected;
  isControlsEnabled;
  lastMove = Date.now();
  ready = false;

  pane;
  params = {
    enableLight: true,
    angleY: 90,
    angleZ: 30,
    opacity: 0.5,
    rotateX: 0,
    rotateZ: 0,
  };

  constructor(el) {
    this.canvas = el;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.origin = { x: this.width / 2, y: this.height / 2 };
    this.scale = 1.0;

    this.init();
  }

  init() {
    this.setScene();
    this.setCamera();
    this.setRenderer();
    this.setLight();
    this.setControls();
  }

  animate = () => {
    if (this.controls) this.controls.update();
    this.render();
    window.requestAnimationFrame(this.animate);
  };

  render() {
    this.light.castShadow = this.params.enableLight;
    this.lightPivot.rotation.y = (this.params.angleY / 180) * Math.PI;
    this.lightPivot.rotation.z = (this.params.angleZ / 180) * Math.PI;
    this.modelPivot.rotation.x = (this.params.rotateX / 180) * Math.PI;
    this.modelPivot.rotation.z = (this.params.rotateZ / 180) * Math.PI;

    this.plane.material.opacity = this.params.opacity;
    this.renderer.render(this.scene, this.camera);
  }

  setScene() {
    this.scene = new THREE.Scene();
  }

  setCamera() {
    this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(1, 1, 1);
    this.scene.add(this.camera);
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  setModel(file) {
    new GLTFLoader().parse(file.dataUrl, "", gltf => {
      if (this.modelPivot) {
        this.scene.remove(this.modelPivot);
        this.model.traverse(node => {
          if (node.isMesh) {
            node.geometry.dispose();
            node.material.dispose();
          }
        });
      }
      this.name = file.name;
      this.model = gltf.scene.children[0];
      const box = new THREE.Box3().setFromObject(this.model);
      const autoScale = 1 / Math.max(...box.getSize(new THREE.Vector3()));
      this.model.scale.set(autoScale, autoScale, autoScale);

      this.model.traverse(node => {
        if (node.isMesh) node.castShadow = true;
      });

      // add plane to receive shadow
      this.plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.ShadowMaterial());
      this.plane.rotateX(-Math.PI / 2);
      this.plane.receiveShadow = true;

      this.modelPivot = new THREE.Object3D();
      this.modelPivot.add(this.model);
      this.modelPivot.add(this.plane);
      this.scene.add(this.modelPivot);

      this.setRaycaster();
      this.setConvexhull();
      this.animate();
      this.ready = true;
      emitter.emit("threeReady");

      console.log("loaded model");
    });
  }

  setLight() {
    const directionLight = new THREE.DirectionalLight(0xffffff, 2);
    directionLight.position.set(10, 0, 0);
    directionLight.target.position.set(0, 0, 0);
    directionLight.castShadow = true;
    directionLight.shadow.mapSize.width = 4096;
    directionLight.shadow.mapSize.height = 4096;
    directionLight.shadow.bias = -0.00001;
    directionLight.shadow.camera.near = 0.00001;
    directionLight.shadow.camera.far = 100;
    // directionLight.shadow.camera.left = 10;
    // directionLight.shadow.camera.right = -10;
    // directionLight.shadow.camera.top = 10;
    // directionLight.shadow.camera.bottom = -10;

    // const helper = new THREE.CameraHelper(directionLight.shadow.camera);
    // this.scene.add(helper);

    this.light = directionLight;
    this.lightPivot = new THREE.Object3D();
    this.lightPivot.add(this.light);
    this.scene.add(this.lightPivot);

    const sky = new THREE.HemisphereLight(0xffffbb, 0x080820, 2);
    this.scene.add(sky);
  }

  setControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableZoom = false;
    this.controls.enablePan = false;

    this.controls.mouseButtons.LEFT = "";
    this.controls.mouseButtons.MIDDLE = THREE.MOUSE.ROTATE;
    this.controls.mouseButtons.RIGHT = "";

    this.controls.enabled = false;
    this.isControlsEnabled = false;
  }

  setRaycaster() {
    this.raycaster = new THREE.Raycaster();
    this.canvas.addEventListener("mousemove", e => this.checkIntersection(e));
  }

  setConvexhull() {
    this.convexhull = new ConvexHull();
    this.convexhull.setFromObject(this.model);
  }

  // helper functions
  translate(delta) {
    if (!this.ready) return;

    this.origin.x += delta.x;
    this.origin.y += delta.y;

    this.offset = this.getOffset();
    this.camera.setViewOffset(this.width, this.height, this.offset.x, this.offset.y, this.width, this.height);
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

    this.camera.zoom = this.scale;
    this.offset = this.getOffset();
    this.camera.setViewOffset(this.width, this.height, this.offset.x, this.offset.y, this.width, this.height);
  }

  getOffset() {
    return {
      x: this.width / 2 - this.origin.x,
      y: this.height / 2 - this.origin.y,
    };
  }

  checkIntersection(event) {
    if (event.buttons > 0) return; // disbale checking when controlling
    if (Date.now() - this.lastMove < 20) return;
    this.lastMove = Date.now();

    const pointer = {
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: -(event.clientY / window.innerHeight) * 2 + 1,
    };

    this.raycaster.setFromCamera(pointer, this.camera);
    this.isIntersected = this.convexhull.intersectsRay(this.raycaster.ray);
    this.controls.enabled = this.isIntersected || this.isControlsEnabled;
  }

  exportFrame() {
    this.camera.zoom = 0.5;
    this.camera.setViewOffset(this.width, this.height, 0, 0, this.width, this.height);
    this.camera.updateProjectionMatrix();
    this.render();

    const dataUrl = this.canvas.toDataURL();

    this.camera.zoom = this.scale;
    this.camera.setViewOffset(this.width, this.height, this.offset.x, this.offset.y, this.width, this.height);
    this.camera.updateProjectionMatrix();
    this.render();

    return {
      origin: this.origin,
      scale: this.scale * 2,
      data: dataUrl,
    };
  }
}
