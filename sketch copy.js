 // Setup
 

 var scene = new THREE.Scene();
 var camera = new THREE.OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000);
 camera.position.z = 1;
 var renderer = new THREE.WebGLRenderer();
 renderer.setSize(window.innerWidth, window.innerHeight);
 document.body.appendChild(renderer.domElement);

 // Particles
 var geometry = new THREE.BufferGeometry();
 var vertices = [];
 for (var i = 0; i < 10000; i++) {
   vertices.push((Math.random() - 0.5) * window.innerWidth);
   vertices.push((Math.random() - 0.5) * window.innerHeight);
   vertices.push(0);
 }
 geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
 var material = new THREE.PointsMaterial({ size: 1, sizeAttenuation: false });
 var particlesMesh = new THREE.Points(geometry, material);
 scene.add(particlesMesh);

 var particles = [];
 for (var i = 0; i < 10000; i++) {
   particles.push(new Particle());
 }

 // Flow field
 var inc = 0.1;
 var scl = 20;
 var cols = Math.floor(window.innerWidth / scl);
 var rows = Math.floor(window.innerHeight / scl);
 var zoff = 0;

 var flowfield = new Array(cols * rows);
 for (var i = 0; i < flowfield.length; i++) {
   flowfield[i] = new THREE.Vector2();
 }

 // Particle class
 function Particle() {
   this.pos = new THREE.Vector2(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
   this.vel = new THREE.Vector2(0, 0);
   this.acc = new THREE.Vector2(0, 0);
   this.maxspeed = 4;
   this.prevPos = this.pos.clone();
  this.lineGeometry = new THREE.BufferGeometry().setFromPoints([this.pos.clone(), this.prevPos.clone()]);
  this.line = new THREE.Line(this.lineGeometry, new THREE.LineBasicMaterial({ color: 0xC8C8C8 }));
  scene.add(this.line);
  this.updatePrev = function() {
    this.prevPos.copy(this.pos);
    this.lineGeometry.setFromPoints([this.pos.clone(), this.prevPos.clone()]);
};
   this.update = function() {
     this.vel.add(this.acc);
     this.vel.clampScalar(-this.maxspeed, this.maxspeed);
     this.pos.add(this.vel);
     this.acc.multiplyScalar(0);
     this.updatePrev();
   };
   
   this.follow = function(vectors) {
    var x = Math.floor(this.pos.x / scl);
    var y = Math.floor(this.pos.y / scl);
    if (x < 0 || x >= cols || y < 0 || y >= rows) {
      return; // Exit the function if x or y is out of bounds
    }
    var index = x + y * cols;
    var force = vectors[index];
    this.applyForce(force);
  };
  

   this.applyForce = function(force) {
     this.acc.add(force);
   };

   this.edges = function() {
    if (this.pos.x > window.innerWidth) {
      this.pos.x = 0;
      this.updatePrev();
    }
    if (this.pos.x < 0) {
      this.pos.x = window.innerWidth;
      this.updatePrev();
    }
    if (this.pos.y > window.innerHeight) {
      this.pos.y = 0;
      this.updatePrev();
    }
    if (this.pos.y < 0) {
      this.pos.y = window.innerHeight;
      this.updatePrev();
    }
  };
 }
 // Noise generator
 var noise = new SimplexNoise();

 // Animation
 function animate() {
   requestAnimationFrame(animate);

   // Update flow field
   var yoff = 0;
   for (var y = 0; y < rows; y++) {
     var xoff = 0;
     for (var x = 0; x < cols; x++) {
       var index = x + y * cols;
       var angle = noise.noise3D(xoff, yoff, zoff) * Math.PI * 2 * 4;
       flowfield[index].set(Math.cos(angle), Math.sin(angle));
       xoff += inc;
     }
     yoff += inc;
     zoff += 0.00008;
   }

   for (var i = 0; i < particles.length; i++) {
    particles[i].follow(flowfield);
    particles[i].update();
    particles[i].edges();
    particlesMesh.geometry.attributes.position.array[i * 3] = particles[i].pos.x;
    particlesMesh.geometry.attributes.position.array[i * 3 + 1] = particles[i].pos.y;
    particles[i].line.geometry.setFromPoints([particles[i].pos.clone(), particles[i].prevPos.clone()]);
    particles[i].line.geometry.attributes.position.needsUpdate = true;
  }
  particlesMesh.geometry.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
}
  animate();
  
  
 
 
