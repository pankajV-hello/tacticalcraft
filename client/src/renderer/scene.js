import * as THREE from 'three';

// ── Scene, camera, renderer ────────────────────────────────────────────────
export const scene    = new THREE.Scene();
export const camera   = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 220);
export const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Sky shader
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  vertexShader: `
    varying vec3 vP;
    void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }
  `,
  fragmentShader: `
    varying vec3 vP;
    void main(){
      float h=normalize(vP).y;
      vec3 top=vec3(.10,.08,.22), mid=vec3(.20,.24,.36), hor=vec3(.40,.48,.56);
      vec3 c=h>0.?mix(mid,top,clamp(h*2.,0.,1.)):mix(hor,mid,clamp(-h*5.+1.,0.,1.));
      gl_FragColor=vec4(c,1.);
    }
  `,
});
scene.add(new THREE.Mesh(new THREE.SphereGeometry(180, 10, 10), skyMat));
scene.fog = new THREE.Fog(0x4a5878, 55, 160);

// Lighting
const sun = new THREE.DirectionalLight(0xfff0d0, 1.2);
sun.position.set(50, 80, 30);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far  = 200;
sun.shadow.camera.left = sun.shadow.camera.bottom = -80;
sun.shadow.camera.right = sun.shadow.camera.top   =  80;
scene.add(sun);
scene.add(new THREE.AmbientLight(0x6070c0, 0.9));
const fill = new THREE.DirectionalLight(0x8090b0, 0.5);
fill.position.set(-30, 40, -20);
scene.add(fill);

// Block highlight
export const hlMesh = new THREE.Mesh(
  new THREE.BoxGeometry(1.03, 1.03, 1.03),
  new THREE.MeshBasicMaterial({ color: 0x00C97A, wireframe: true, transparent: true, opacity: 0.6 })
);
hlMesh.visible = false;
scene.add(hlMesh);

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

export function render() {
  renderer.render(scene, camera);
}
