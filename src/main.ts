import './style.scss';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ShaderMaterial, Shading } from 'three';
import { gsap } from "gsap";
import * as dat from 'dat.gui';

let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let clock = new THREE.Clock();
let timer = 0
let obj_lst = [{}];
let flat_cube_lst = [{}];
let sphere_lst = [{}];

let cube_length = 2;
var tl = gsap.timeline({autoRemoveChildren: true});

let lightAmbient: THREE.AmbientLight;
let lightPoint: THREE.PointLight;
let x = -100;
let z = -100;
let controls: OrbitControls;
let stats: any;
let sphere: THREE.Mesh;
let cube: THREE.Mesh;
let cylinder: THREE.Mesh;
let cone : THREE.Mesh;
let plane : THREE.Mesh;
let group: THREE.Group;
let standModel: THREE.Object3D;
let exampleTexture: THREE.Texture;

import vertexShader from '../resources/shaders/shader.vert?raw';
import fragmentShader from '../resources/shaders/shader.frag?raw';
let shaderMat: ShaderMaterial;

let controller = {
    left : 0,           //controll on what is being spawned
    left_speed: 1,      //speed at the rate of spawn
    left_delay: 1,      //delay between spawns ??
    left_counter: 1,    //counter for index 
    left_duration:10,   //durration of anamation 
    right :1,
    right_speed:1,
    right_delay:-3,
    right_counter:1,
    right_duration:10,
    top : 0,
    top_speed: 0,
    top_delay:0,
    top_counter:1,
    top_duration:10,
    bottom : 0,
    bottom_speed:0,
    bottom_delay:0,
    bottom_counter:1,
    bot_duration :10
}

class Movers {
    xpos: number;
    ypos: number;
    zpos: number;
    rotation : number;
    constructor(xpos: number, ypos: number, zpos:number, rotation:number ){
        this.xpos = xpos;
        this.ypos = ypos;
        this.zpos = zpos;
        this.rotation = rotation;
    }
}

class Cube1 extends Movers {    
    geometryBox : any;
    materialBox : any;
    width: number;
    height: number;
    depth : number;
    constructor(xpos: number, ypos: number, zpos:number, rotation:number, width:number, height:number, depth:number){
        super(xpos, ypos, zpos, rotation);   
        this.width = width;
        this.height = height; 
        this.depth= depth;
        this.geometryBox = new THREE.BoxGeometry(this.width,this.height, this.depth);//random cube size length 
        this.materialBox = new THREE.MeshPhongMaterial({ color: 0x456789 });
    }      
}
class Sphere1 extends Movers{
    geometrySphere : any;
    materialSphere : any;
    radius:number;
       constructor(xpos: number, ypos: number, zpos:number, rotation:number,radius:number){
        super(xpos, ypos, zpos, rotation);   
        this.geometrySphere = new THREE.SphereGeometry();
        this.materialSphere = new THREE.MeshPhongMaterial({ color: 0x710B0B });
        this.radius = radius;
    }  
}

class Cylinder1 extends Movers{
    geometryCylinder : any;
    materialCylinder : any;
    radiusTop : number;
    radiusBot : number;
    height : number;
    radialSegments : number;
    constructor(xpos: number, ypos: number, zpos:number, rotation:number,radiusTop : number,radiusBot : number,height : number, radialSegments : number){
        super(xpos, ypos, zpos, rotation);   
        this.radiusTop = radiusTop;
        this.radiusBot = radiusBot;
        this.height = height;
        this.radialSegments = radialSegments;
        this.geometryCylinder = new THREE.CylinderGeometry(this.radiusTop, this.radiusBot, this.height, this.radialSegments  );
        this.materialCylinder = new THREE.MeshPhongMaterial({ color: 0x710B0B });
    }      
}
class Cone1 extends Movers {
    geometryCone : any;
    materialCone : any;
    radius: number;
    height : number;
    radialSegments : number;
    constructor(xpos: number, ypos: number, zpos:number, rotation:number,radius : number,height : number, radialSegments : number){
        super(xpos, ypos, zpos, rotation);   
        this.radius = radius;
        this.height = height;
        this.radialSegments = radialSegments;
        this.geometryCone = new THREE.ConeGeometry(this.radius, this.height, this.radialSegments  );
        this.materialCone = new THREE.MeshPhongMaterial({ color: 0x710B0B });
    }
}

class Plane1 extends Movers{
    geometryPlane : any;
    materialPlane : any;
    height :number;
    width : number;
    constructor(xpos: number, ypos: number, zpos:number, rotation:number,height : number, width:number){
        super(xpos, ypos, zpos, rotation);   
        this.height = height;
        this.width = width;
        this.geometryPlane = new THREE.PlaneGeometry( this.height, this.width );
        this.materialPlane = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    }
}



function main() {
    initScene();
    initStats();
    initListeners();
}

function initStats() {
    stats = new (Stats as any)();
    document.body.appendChild(stats.dom);
}

function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 5;
    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    controls = new OrbitControls(camera, renderer.domElement);
    lightAmbient = new THREE.AmbientLight(0x333333);
    scene.add(lightAmbient);


    const shadowIntensity = 0.25;

    lightPoint = new THREE.PointLight(0xffffff);
    lightPoint.position.set(-0.5, 0.5, 4);
    lightPoint.castShadow = true;
    lightPoint.intensity = shadowIntensity;
    scene.add(lightPoint);

	lightPoint = new THREE.PointLight(0xffffff)
	lightPoint.position.set(-0.5, 0.5, 4)
	lightPoint.castShadow = true;
	lightPoint.intensity = shadowIntensity;
	scene.add(lightPoint)

    const lightPoint2 = lightPoint.clone();
    lightPoint2.intensity = 1 - shadowIntensity;
    lightPoint2.castShadow = false;
    scene.add(lightPoint2);

    const mapSize = 1024; // Default 512
    const cameraNear = 0.5; // Default 0.5
    const cameraFar = 500; // Default 500
    lightPoint.shadow.mapSize.width = mapSize;
    lightPoint.shadow.mapSize.height = mapSize;
    lightPoint.shadow.camera.near = cameraNear;
    lightPoint.shadow.camera.far = cameraFar;


    const gui = new dat.GUI()
    let left_gui = gui.addFolder("Left")
    left_gui.add(controller,"left",0,1)

    let right_gui = gui.addFolder("Right")
    right_gui.add(controller,"right",0,1)


    
    
    for(let i=0; i < 7; i++){   //each cube will have a length 5 longer than the last one, 6 total 
        let temp = new Cube1(0,0,i-100,0,3,3,cube_length) // x,y,z,rotationg,legth,width,height   ///now i can create a whole bnch of diffrent types of cube objs, just have to know their index     
        obj_lst.push(temp);
        cube_length += 5;
    }
    cube_length = 5;
    for(let i=0; i < 7; i++){   //each cube will have a length 5 longer than the last one, 6 total 
        let temp = new Cube1(0,0,i-100,0,10,1,cube_length) // x,y,z,rotationg,legth,width,height   ///now i can create a whole bnch of diffrent types of cube objs, just have to know their index     
        flat_cube_lst.push(temp);
        cube_length += 5;
    }
    //let sphere_length = 10;
    for(let i=0; i < 7; i++){   
        let temp = new Sphere1(0,0,i-100,0,1)  //x,y,z,rotation, raidus 
        sphere_lst.push(temp);
        
    }

    // // load a texture and add created model
    // // Add a plane
    const geometryPlane = new THREE.PlaneBufferGeometry(10, 10, 10, 10);
    const materialPlane = new THREE.MeshPhongMaterial({ 
		color: 0x110011, 
		side: THREE.DoubleSide,
		flatShading: true		
	});

    const uniforms = {
        u_time: { type: 'f', value: 1.0 },
        u_resolution: { type: 'v2', value: new THREE.Vector2(800,800) },
        // u_mouse: { type: 'v2', value: new THREE.Vector2() },
    };
    // shaderMat = new THREE.ShaderMaterial({
    //     uniforms: uniforms,
    //     vertexShader: vertexShader,
    //     fragmentShader: fragmentShader,
    // });/
	shaderMat = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: vertexShader,
		fragmentShader: fragmentShader,
		side: THREE.DoubleSide
	})
    // // Init animation
    animate();
}

function initListeners() {
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('keydown', (event) => {
        const { key } = event;
        switch (key) {
            case 'e':
                const win = window.open('', 'Canvas Image');
                const { domElement } = renderer;
                // Makse sure scene is rendered.
                renderer.render(scene, camera);
                const src = domElement.toDataURL();
                if (!win) return;
                win.document.write(`<img src='${src}' width='${domElement.width}' height='${domElement.height}'>`);
                break;
            case 'y':
               controller.right = 0
            default:
                break;
        }
    });
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(() => {
        animate();  
    });
    //scene.background = new THREE.Color(0xffffff);   customize background color 

    x+=0.5
    timer += 1   
    if ((timer % 50) == 0){  //customizable speed up spawn rate 
        rightControl()
    } 
    if ((timer % 50) == 0){
        leftControl()
    }  
    if ((timer % 50) == 0){
        topControl()
    }  
    if ((timer % 50) == 0){
        bottomControl()
    }     
        
    let delta = clock.getDelta();
    renderer.render(scene, camera);
}

function placeCube(x: {}){
    if (x.zpos < 10){
        cube = new THREE.Mesh(x.geometryBox, x.materialBox);
        cube.castShadow = true;
        cube.position.set(x.xpos,x.ypos,x.zpos);
        cube.scale.set(.5,.5,.5)
        cube.rotateY(x.rotation)
        scene.add(cube);
    }
    else{
        scene.remove(cube)   //not working
    }
}
function placeSphere(x: {}){
    sphere = new THREE.Mesh(x.geometrySphere, x.materialSphere);
    sphere.castShadow=true;
    sphere.position.set(x.xpos,x.ypos,x.zpos)
    //sphere.scale.set(.2,.2,.2)
    scene.add(sphere);
}

function placeCylinder(x:{}){
    cylinder = new THREE.Mesh( x.geometryCylinder, x.materialCylinder );
    scene.add( cylinder ); 
}
function placeCone(x:{}){
    cone = new THREE.Mesh( x.geometryCone, x.materialCone );
    scene.add( cone );
} 

function placePlane(x:{}){
    plane = new THREE.Mesh( x.geometryPlane, x.materialPlane );
    scene.add( plane );
}
function clear(){
  //  scene.remove(cube)  //not working 
}



function leftControl(){
    placeCube(obj_lst[controller.left_counter])
    gsap.fromTo(cube.position,{x:-4},{x:-4,z:50,duration: controller.left_duration, onComplete: clear})
    if (controller.left_counter == obj_lst.length -1 ){
        controller.left_counter = 1;
    }else {
        controller.left_counter+=1;
    }
}

function rightControl(){
    switch (controller.right) {
        case 0:   //customizable shape spawned 
            placeCube(obj_lst[controller.right_counter])
            gsap.fromTo(cube.position,{x:4},{x:4,z:50,duration: controller.right_duration, onComplete: clear})   //customizable left and right spacing 
            if (controller.right_counter == obj_lst.length -1 ){
                controller.right_counter = 1;
            }else {
                controller.right_counter+=1;
            } 
            break;
        case 1:  //could do dromto / tofrom for  a reverse mode 
            placeSphere(sphere_lst[controller.right_counter])
            gsap.fromTo(sphere.position,{x:4},{x:4,z:50,duration: controller.right_duration, onComplete: clear})   //customizable left and right spacing 
            if (controller.right_counter == sphere_lst.length -1 ){
                controller.right_counter = 1;
            }else {
                controller.right_counter+=1;
            } 
            break;
        default:
            break;
    }

}

function topControl(){    
    placeCube(flat_cube_lst[controller.left_counter])
    gsap.fromTo(cube.position,{y:2},{y:2,z:50,duration: controller.left_duration, onComplete: clear})  //customizable top and bottom spacing 
    if (controller.left_counter == obj_lst.length -1 ){
        controller.left_counter = 1;
    }else {
        controller.left_counter+=1;
    }
}

function bottomControl(){
    placeCube(flat_cube_lst[controller.left_counter])
    gsap.fromTo(cube.position,{y:-2},{y:-2,z:50,duration: controller.left_duration, onComplete: clear})
    if (controller.left_counter == obj_lst.length -1 ){
        controller.left_counter = 1;
    }else {
        controller.left_counter+=1;
    }

}
function placeTest(){
    placeCube(obj_lst[0])
    placeCube(obj_lst[1])
    placeCube(obj_lst[2])
    placeCube(obj_lst[3])
    placeCube(obj_lst[4])
    placeCube(obj_lst[5])

}
main()
//randomize colors when creating shapes 
//add more shapes ?


//custmoizable features added 
    // -through gui 
    // -add as many as possible 
//background options 
    // -change color 
    // -add anamations ?
    //     -spehers in background floatin aorund ?
    //     -wall of rects 
//add more shapes 