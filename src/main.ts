import './style.scss';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { BoxGeometry, Color, MeshPhongMaterial, ShaderMaterial, Shading } from 'three';
import { gsap } from "gsap";
import * as dat from 'dat.gui';

let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let clock = new THREE.Clock();
let timer = 0
let obj_lst : Cube1[]= [];
let flat_cube_lst : Cube1[] = [];
let sphere_lst : Sphere1[] = [];
let cylinder_lst : Cylinder1[]= [];
let cone_lst : Cone1[] = [];
let plane_lst : Plane1[] = []
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

let colorsarray :Color[] = [ ];

let controller = {
    render_distance : 50,
    left : 0,           //controll on what is being spawned
    left_spawn_rate: 75,      //speed at the rate of spawn
    left_delay: 1,      //delay between spawns ??
    left_counter: 1,    //counter for index 
    left_duration:10,   //durration of anamation 
    left_rotation :90,
    left_position : 4,

    right :0,
    right_spawn_rate:75,
    right_delay:-3,
    right_counter:1,
    right_duration:10,
    right_rotation: 0,
    right_position : 4,


    top : 0,
    top_spawn_rate: 75,
    top_delay:0,
    top_counter:1,
    top_duration:10,
    top_rotation : 0,
    top_position : 2,

    bottom : 0,
    bottom_spawn_rate:75,
    bottom_delay:0,
    bottom_counter:1,
    bottom_duration :10,
    bottom_rotation : 0,
    bottom_position: 2
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
    geometryBox : BoxGeometry;
    materialBox : MeshPhongMaterial;
    width: number;
    height: number;
    depth : number;
    constructor(xpos: number, ypos: number, zpos:number, rotation:number, width:number, height:number, depth:number){
        super(xpos, ypos, zpos, rotation);   
        this.width = width;
        this.height = height; 
        this.depth= depth;
        this.geometryBox = new THREE.BoxGeometry(this.width,this.height, this.depth);//random cube size length 
        this.materialBox = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
    }      
}

class Sphere1 extends Movers{
    geometrySphere : any;
    materialSphere : any;
    radius:number;
       constructor(xpos: number, ypos: number, zpos:number, rotation:number,radius:number){
        super(xpos, ypos, zpos, rotation);   
    
        this.geometrySphere = new THREE.SphereGeometry();
        this.materialSphere = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
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
        super(xpos, ypos, zpos, rotation);                                                                  //xpos ypos zpos rotation raidus:top radius:bot  height radialsegments
        this.radiusTop = radiusTop;
        this.radiusBot = radiusBot;
        this.height = height;
        this.radialSegments = radialSegments;
        this.geometryCylinder = new THREE.CylinderGeometry(this.radiusTop, this.radiusBot, this.height, this.radialSegments  );
        this.materialCylinder = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
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
        this.materialCone = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
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
        this.materialPlane = new THREE.MeshBasicMaterial( {color: Math.random() * 0xffffff, side: THREE.DoubleSide} );
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
    let universal = gui.addFolder("Universal")
    universal.add(controller,"render_distance",25,150,25)



    let left_gui = gui.addFolder("Left")
    left_gui.add(controller,"left",0,5,1)
    left_gui.add(controller,"left_spawn_rate",50,200,25)
    left_gui.add(controller,"left_duration",5,20)
    left_gui.add(controller,"left_rotation",0,360,1)
    left_gui.add(controller,"left_position",0,8,1)



    let right_gui = gui.addFolder("Right")
    right_gui.add(controller,"right",0,5,1)
    right_gui.add(controller,"right_spawn_rate",25,150,25)
    right_gui.add(controller,"right_duration",5,20)
    right_gui.add(controller,"right_rotation",0,360,1)
    right_gui.add(controller,"right_position",0,8,1)




    let top_gui = gui.addFolder("Top")
    top_gui.add(controller,"top",0,5,1)
    top_gui.add(controller,"top_spawn_rate",25,150,25)
    top_gui.add(controller,"top_duration",5,20)
    top_gui.add(controller,"top_rotation",0,360,1)
    top_gui.add(controller,"top_position",0,8,1)



    let bottom_gui = gui.addFolder("Bottom")
    bottom_gui.add(controller,"bottom",0,5,1)
    bottom_gui.add(controller,"bottom_spawn_rate",25,150,25)
    bottom_gui.add(controller,"bottom_duration",5,20)
    bottom_gui.add(controller,"bottom_rotation",0,360,1)
    bottom_gui.add(controller,"bottom_position",0,8,1)


    const geometry = new THREE.PlaneGeometry( 30, 30 );
    const material = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( geometry, material );
    plane.position.z = 10
    scene.add( plane );

    
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

    for(let i=0; i < 7; i++){   
        let temp = new Cylinder1(0,0,i-100,0,2,2,1,20)   //xpos ypos zpos rotation raidus:top radius:bot  height radialsegments
        cylinder_lst.push(temp); 
    }

    for(let i=0; i < 7; i++){   
        let temp = new Cylinder1(0,0,i-100,0,2,2,1,20)   //xpos ypos zpos rotation raidus:top radius:bot  height radialsegments
        cylinder_lst.push(temp); 
    }

    for(let i=0; i < 7; i++){       //xpos: number, ypos: number, zpos:number, rotation:number,radius : number,height : number, radialSegments : number
        let temp = new Cone1(0,0,i-100,2,2,2,20)   
        
        cone_lst.push(temp); 
    }

    for(let i=0; i < 7; i++){   
        let temp = new Plane1(0,0,i-100,0,2,2)   //xpos: number, ypos: number, zpos:number, rotation:number,height : number, width:number)
        plane_lst.push(temp); 
    }

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

	shaderMat = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: vertexShader,
		fragmentShader: fragmentShader,
		side: THREE.DoubleSide
	})

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

    timer += 1   
    if ((timer % controller.right_spawn_rate) == 0){  //customizable speed up spawn rate 
        rightControl()
    } 
    if ((timer % controller.left_spawn_rate) == 0){
        leftControl()
    }  
    if ((timer % controller.top_spawn_rate) == 0){
        topControl()
    }  
    if ((timer % controller.bottom_spawn_rate) == 0){
        bottomControl()
    }     
        
    let delta = clock.getDelta();
    renderer.render(scene, camera);
}

function placeCube(x: Cube1, rotation:number){
    if (x.zpos < 10){
        cube = new THREE.Mesh(x.geometryBox, x.materialBox);
        cube.castShadow = true;
        cube.position.set(x.xpos,x.ypos,x.zpos);
        cube.scale.set(.5,.5,.5)
        cube.rotateY(x.rotation)
        cube.rotateZ(rotation * (Math.PI/180))

        scene.add(cube);
    }
    else{
        scene.remove(cube)   //not working
    }
}
function placeSphere(x: Sphere1){
    sphere = new THREE.Mesh(x.geometrySphere, x.materialSphere);
    sphere.castShadow=true;
    sphere.position.set(x.xpos,x.ypos,x.zpos)
    //sphere.scale.set(.2,.2,.2)
    scene.add(sphere);
}

function placeCylinder(x:Cylinder1, rotation:number){
    cylinder = new THREE.Mesh( x.geometryCylinder, x.materialCylinder );
    cylinder.position.set(x.xpos,x.ypos,x.zpos)
    cylinder.rotateX(1.5708)
    cylinder.rotateZ(rotation * (Math.PI/180))

    scene.add( cylinder ); 
}
function placeCone(x:Cone1, rotation:number){
    cone = new THREE.Mesh( x.geometryCone, x.materialCone );
    cone.rotateZ(rotation * (Math.PI/180))
    cone.position.set(x.xpos,x.ypos,x.zpos)

    scene.add( cone );
} 

function placePlane(x:Plane1, rotation:number){
    plane = new THREE.Mesh( x.geometryPlane, x.materialPlane );
    plane.position.set(x.xpos,x.ypos,x.zpos)
    plane.rotateZ(rotation * (Math.PI/180))

    scene.add( plane );
}
function clear(){
  //  scene.remove(cube)  //not working 
}
function leftControl(){
    switch (controller.left) {
        case 0:
            placeCube(obj_lst[controller.left_counter],controller.left_rotation)
            gsap.fromTo(cube.position,{x:-(controller.left_position), z: -controller.render_distance},{x:-(controller.left_position),z:50,duration: controller.left_duration, onComplete: clear})
            if (controller.left_counter == obj_lst.length -1 ){
                controller.left_counter = 1;
                controller.render_distance * -1
            }else {
                controller.left_counter+=1;
                controller.render_distance *-1
            }
            break;
        case 1:
            placeSphere(sphere_lst[controller.left_counter])
            gsap.fromTo(sphere.position,{x:-(controller.left_position), z: -controller.render_distance},{x:-(controller.left_position),z:50,duration: controller.left_duration, onComplete: clear})
            if (controller.left_counter == sphere_lst.length -1 ){
                controller.left_counter = 1;
            }else {
                controller.left_counter+=1;
            }
            break;
        default:
            break;
            case 2:  //could do dromto / tofrom for  a reverse mode 
            placeCylinder(cylinder_lst[controller.left_counter],controller.left_rotation)
            gsap.fromTo(cylinder.position,{x:-(controller.left_position), z: -controller.render_distance},{x:-(controller.left_position),z:50,duration: controller.left_duration, onComplete: clear})   //customizable left and right spacing 
            if (controller.left_counter == cylinder_lst.length -1 ){
                controller.left_counter = 1;
            }else {
                controller.left_counter+=1;
            } 
            break;
        
        case 3:  //could do dromto / tofrom for  a reverse mode 
            placeCone(cone_lst[controller.left_counter],controller.left_rotation)
            gsap.fromTo(cone.position,{x:-(controller.left_position), z: -controller.render_distance},{x:-(controller.left_position),z:50,duration: controller.left_duration, onComplete: clear})   //customizable left and right spacing 
            if (controller.left_counter == cone_lst.length -1 ){
                controller.left_counter = 1;
            }else {
                controller.left_counter+=1;
            } 
            break;
        
        case 4:  //could do dromto / tofrom for  a reverse mode 
            placePlane(plane_lst[controller.left_counter],controller.left_rotation)  
            gsap.fromTo(plane.position,{x:-(controller.left_position), z: -controller.render_distance},{x:-(controller.left_position),z:50,duration: controller.left_duration, onComplete: clear})   //customizable left and right spacing 
            if (controller.left_counter == sphere_lst.length -1 ){
                controller.left_counter = 1;
            }else {
                controller.left_counter+=1;
            } 
            break;
        case 5: 

            break;
    }
   }

function rightControl(){
    switch (controller.right) {
        case 0:   //customizable shape spawned 
            placeCube(obj_lst[controller.right_counter],controller.right_rotation)
            gsap.fromTo(cube.position,{x:controller.right_position, z:-controller.render_distance},{x:controller.right_position,z:50,duration: controller.right_duration, onComplete: clear})   //customizable left and right spacing 
            if (controller.right_counter == obj_lst.length -1 ){
                controller.right_counter = 1;
            }else {
                controller.right_counter+=1;
            } 
            break;
        
        case 1:  //could do dromto / tofrom for  a reverse mode 
            placeSphere(sphere_lst[controller.right_counter])
            gsap.fromTo(sphere.position,{x:controller.right_position, z:-controller.render_distance},{x:controller.right_position,z:50,duration: controller.right_duration, onComplete: clear})   //customizable left and right spacing 
            if (controller.right_counter == sphere_lst.length -1 ){
                controller.right_counter = 1;
            }else {
                controller.right_counter+=1;
            } 
            break;
        
        case 2:  //could do dromto / tofrom for  a reverse mode 
            placeCylinder(cylinder_lst[controller.right_counter],controller.right_rotation)
            gsap.fromTo(cylinder.position,{x:controller.right_position, z:-controller.render_distance},{x:controller.right_position,z:50,duration: controller.right_duration, onComplete: clear})   //customizable left and right spacing 
            if (controller.right_counter == cylinder_lst.length -1 ){
                controller.right_counter = 1;
            }else {
                controller.right_counter+=1;
            } 
            break;
        
        case 3:  //could do dromto / tofrom for  a reverse mode 
            placeCone(cone_lst[controller.right_counter],controller.right_rotation)
            gsap.fromTo(cone.position,{x:controller.right_position, z:-controller.render_distance},{x:controller.right_position,z:50,duration: controller.right_duration, onComplete: clear})   //customizable left and right spacing 
            if (controller.right_counter == cone_lst.length -1 ){
                controller.right_counter = 1;
            }else {
                controller.right_counter+=1;
            } 
            break;
        
        case 4:  //could do dromto / tofrom for  a reverse mode 
            placePlane(plane_lst[controller.right_counter],controller.right_rotation)  
            gsap.fromTo(plane.position,{x:controller.right_position, z:-controller.render_distance},{x:controller.right_position,z:50,duration: controller.right_duration, onComplete: clear})   //customizable left and right spacing 
            if (controller.right_counter == sphere_lst.length -1 ){
                controller.right_counter = 1;
            }else {
                controller.right_counter+=1;
            } 
            break;
        case 5: 

            break;
        default:
            break;
    }

}

function topControl(){    
    switch (controller.top) {
        case 0:   //customizable shape spawned 
            placeCube(flat_cube_lst[controller.top_counter],controller.top_rotation)
            gsap.fromTo(cube.position,{y:controller.top_position, z:-controller.render_distance},{y:controller.top_position,z:50,duration: controller.top_duration, onComplete: clear})   //customizable left and right spacing 
            if (controller.top_counter == flat_cube_lst.length -1 ){
                controller.top_counter = 1;
            }else {
                controller.top_counter+=1;
            } 
            break;
        
        case 1:  //could do dromto / tofrom for  a reverse mode 
            placeSphere(sphere_lst[controller.top_counter])
            gsap.fromTo(sphere.position,{y:controller.top_position, z:-controller.render_distance},{y:controller.top_position,z:50,duration: controller.top_duration, onComplete: clear})   //customizable left and right spacing 
            if (controller.top_counter == sphere_lst.length -1 ){
                controller.top_counter = 1;
            }else {
                controller.top_counter+=1;
            } 
            break;
        
        case 2:  //could do dromto / tofrom for  a reverse mode 
            placeCylinder(cylinder_lst[controller.top_counter],controller.top_rotation)
            gsap.fromTo(cylinder.position,{y:controller.top_position, z:-controller.render_distance},{y:controller.top_position,z:50,duration: controller.top_duration, onComplete: clear})   //customizable left and right spacing 
            if (controller.top_counter == cylinder_lst.length -1 ){
                controller.top_counter = 1;
            }else {
                controller.top_counter+=1;
            } 
            break;
        
        case 3:  //could do dromto / tofrom for  a reverse mode 
            placeCone(cone_lst[controller.top_counter],controller.top_rotation)
            gsap.fromTo(cone.position,{y:controller.top_position, z:-controller.render_distance},{y:controller.top_position,z:50,duration: controller.top_duration, onComplete: clear})   //customizable left and right spacing 
            if (controller.top_counter == cone_lst.length -1 ){
                controller.top_counter = 1;
            }else {
                controller.top_counter+=1;
            } 
            break;
        
        case 4:  //could do dromto / tofrom for  a reverse mode 
            placePlane(plane_lst[controller.top_counter],controller.top_rotation)  
            gsap.fromTo(plane.position,{y:controller.top_position, z:-controller.render_distance},{y:controller.top_position,z:50,duration: controller.top_duration, onComplete: clear})   //customizable left and right spacing 
            if (controller.top_counter == sphere_lst.length -1 ){
                controller.top_counter = 1;
            }else {
                controller.top_counter+=1;
            } 
            break;
        case 5: 

            break;
        default:
            break;
    }
}

function bottomControl(){

    switch (controller.bottom) {
        case 0:   //customizable shape spawned 
            placeCube(flat_cube_lst[controller.bottom_counter],controller.bottom_rotation)
            gsap.fromTo(cube.position,{y:-(controller.bottom_position), z:-controller.render_distance},{y:-(controller.bottom_position),z:50,duration: controller.bottom_duration, onComplete: clear})   //customizable left and right spacing 
            if (controller.bottom_counter == flat_cube_lst.length -1 ){
                controller.bottom_counter = 1;
            }else {
                controller.bottom_counter+=1;
            } 
            break;
        
        case 1:  //could do dromto / tofrom for  a reverse mode 
            placeSphere(sphere_lst[controller.bottom_counter])
            gsap.fromTo(sphere.position,{y:-(controller.bottom_position), z:-controller.render_distance},{y:-(controller.bottom_position),z:50,duration: controller.bottom_duration, onComplete: clear})   //customizable left and right spacing 
            if (controller.bottom_counter == sphere_lst.length -1 ){
                controller.bottom_counter = 1;
            }else {
                controller.bottom_counter+=1;
            } 
            break;
        
        case 2:  //could do dromto / tofrom for  a reverse mode 
            placeCylinder(cylinder_lst[controller.bottom_counter],controller.bottom_rotation)
            gsap.fromTo(cylinder.position,{y:-(controller.bottom_position), z:-controller.render_distance},{y:-(controller.bottom_position),z:50,duration: controller.bottom_duration, onComplete: clear})   //customizable left and right spacing 
            if (controller.bottom_counter == cylinder_lst.length -1 ){
                controller.bottom_counter = 1;
            }else {
                controller.bottom_counter+=1;
            } 
            break;
        
        case 3:  //could do dromto / tofrom for  a reverse mode 
            placeCone(cone_lst[controller.bottom_counter],controller.bottom_rotation)
            gsap.fromTo(cone.position,{y:--(controller.bottom_position), z:-controller.render_distance},{y:-(controller.bottom_position),z:50,duration: controller.bottom_duration, onComplete: clear})   //customizable left and right spacing 
            if (controller.bottom_counter == cone_lst.length -1 ){
                controller.bottom_counter = 1;
            }else {
                controller.bottom_counter+=1;
            } 
            break;
        
        case 4:  //could do dromto / tofrom for  a reverse mode 
            placePlane(plane_lst[controller.bottom_counter],controller.bottom_rotation)  
            gsap.fromTo(plane.position,{y:-(controller.bottom_position), z:-controller.render_distance},{y:-(controller.bottom_position),z:50,duration: controller.bottom_duration, onComplete: clear})   //customizable left and right spacing 
            if (controller.bottom_counter == sphere_lst.length -1 ){
                controller.bottom_counter = 1;
            }else {
                controller.bottom_counter+=1;
            } 
            break;
        case 5: 

            break;
        default:
            break;
    }
}

main()

//custmoizable features added 
    // -through gui 
    // -add as many as possible 
//background options 
    // -change color 
    // -add anamations ?
    //     -spehers in background floatin aorund ?
    //     -wall of rects 
