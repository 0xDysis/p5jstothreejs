// Setup
var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / -2, window.innerHeight / 2, 1, 1000);
camera.position.z = 1;

var renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1); // Set canvas color to black
// Append renderer to the specific div
var container = document.getElementById('threeCanvas');
container.appendChild(renderer.domElement);

// Flow field
var inc = 0.1;
var scl = 20;
var cols = Math.floor(window.innerWidth / scl);
var rows = Math.floor(window.innerHeight / scl);
var zoff = 0.00008;
var flowfield = new Array(cols * rows);

// Initialize flowfield
for (var i = 0; i < flowfield.length; i++) {
  flowfield[i] = new THREE.Vector2();
}

// Noise generator
var noise = new SimplexNoise();

// Particle class
function Particle() {
  this.pos = new THREE.Vector2(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
  this.vel = new THREE.Vector2(0, 0);
  this.acc = new THREE.Vector2(0, 0);
  this.maxspeed = 4;
  this.prevPos = this.pos.clone();

  this.material = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 1 });
  this.geometry = new THREE.BufferGeometry();
  var maxPositions = 100000; // Adjust this value based on the maximum number of positions you expect
  this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxPositions * 3), 3));
  this.geometry.setDrawRange(0, 0);
  this.points = new THREE.Points(this.geometry, this.material);
  scene.add(this.points);

  this.follow = function(vectors) {
    var x = Math.floor(this.pos.x / scl);
    var y = Math.floor(this.pos.y / scl);
    var index = x + y * cols;
    var force = vectors[index];
    if (force) {
      this.applyForce(force);
    }
  };

  this.applyForce = function(force) {
    this.acc.add(force);
  };

  this.update = function() {
    this.vel.add(this.acc);
    this.vel.clampScalar(-this.maxspeed, this.maxspeed);
    this.pos.add(this.vel);
    this.acc.multiplyScalar(0);
  };

  this.show = function() {
    var positions = this.geometry.attributes.position.array;
    var index = this.geometry.drawRange.count * 3;
    positions[index] = this.pos.x;
    positions[index + 1] = this.pos.y;
    positions[index + 2] = 0;
    this.geometry.setDrawRange(0, this.geometry.drawRange.count + 1);
    this.geometry.attributes.position.needsUpdate = true;
    this.prevPos.copy(this.pos);
  };

  this.edges = function() {
    if (this.pos.x > window.innerWidth) {
      this.pos.x = 0;
      this.prevPos.copy(this.pos);
    }
    if (this.pos.x < 0) {
      this.pos.x = window.innerWidth;
      this.prevPos.copy(this.pos);
    }
    if (this.pos.y > window.innerHeight) {
      this.pos.y = 0;
      this.prevPos.copy(this.pos);
    }
    if (this.pos.y < 0) {
      this.pos.y = window.innerHeight;
      this.prevPos.copy(this.pos);
    }
  };
}

// Particles
var particles = [];
for (var i = 0; i < 800; i++) {
  particles[i] = new Particle();
}

// Animation
function animate() {
  requestAnimationFrame(animate);

 // Update flow field
var yoff = 0;
for (var y = 0; y < rows; y++) {
  var xoff = 0;
  for (var x = 0; x < cols; x++) {
    var index = x + y * cols;
    var angle = noise.noise3D(xoff, yoff, zoff) * Math.PI * 2 * 8; // Use the noise function to generate an angle
    var force = new THREE.Vector2(Math.cos(angle), Math.sin(angle));
    force.normalize();
    flowfield[index] = force;
    xoff += inc;
  }
  yoff += inc;
  zoff += 0.00008;
}


  // Update particles
  for (var i = 0; i < particles.length; i++) {
    particles[i].follow(flowfield);
    particles[i].update();
    particles[i].edges();
    particles[i].show();
  }

  renderer.render(scene, camera);
}

animate();

// Resize event listener
window.addEventListener('resize', function() {
  // Update camera aspect ratio and projection matrix
  camera.left = window.innerWidth / -2;
  camera.right = window.innerWidth / 2;
  camera.top = window.innerHeight / 2;
  camera.bottom = window.innerHeight / -2;
  camera.updateProjectionMatrix();

  // Update renderer size
  renderer.setSize(window.innerWidth, window.innerHeight);
});



  
  
 
 
