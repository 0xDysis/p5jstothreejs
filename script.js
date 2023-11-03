

var sketch = function(p) {
    var inc = 0.1;
    var scl = 20;
    var cols, rows;
    var zoff = 0;
    var particles = [];
    var flowfield = [];
  
    p.setup = function() {
      var canvas = p.createCanvas(p.windowWidth, p.windowHeight);
      canvas.parent('myCanvas');
      canvas.position(0, 0);
      canvas.style('z-index', '-1');
    
      cols = p.floor(p.width / scl);
      rows = p.floor(p.height / scl);
  
      flowfield = new Array(cols * rows);
  
      for (var i = 0; i < 800; i++) {
        particles[i] = new Particle(p);
      }
      p.background(2);
    };
  
    p.draw = function() {
      var yoff = 0;
      for (var y = 0; y < rows; y++) {
        var xoff = 0;
        for (var x = 0; x < cols; x++) {
          var index = x + y * cols;
          var angle = p.noise(xoff, yoff, zoff) * p.TWO_PI * 4;
          var v = p.createVector(p.cos(angle), p.sin(angle));
          v.setMag(1);
          flowfield[index] = v;
          xoff += inc;
        }
        yoff += inc;
        zoff += 0.00008;
        
      }
  
      for (var i = 0; i < particles.length; i++) {
        particles[i].follow(flowfield);
        particles[i].update();
        particles[i].edges();
        particles[i].show();
      }
    };
  
    function Particle(p) {
      this.pos = p.createVector(p.random(p.width), p.random(p.height));
      this.vel = p.createVector(0, 0);
      this.acc = p.createVector(0, 0);
      this.maxspeed = 4;
  
      this.prevPos = this.pos.copy();
  
      this.update = function() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxspeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
      };
  
      this.follow = function(vectors) {
        var x = p.floor(this.pos.x / scl);
        var y = p.floor(this.pos.y / scl);
        var index = x + y * cols;
        var force = vectors[index];
        this.applyForce(force);
      };
  
      this.applyForce = function(force) {
        this.acc.add(force);
      };
  
      this.show = function() {
        p.stroke(200, 100);
        this.updatePrev();
        p.line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
      };
  
      this.updatePrev = function() {
        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;
      };
  
      this.edges = function() {
        if (this.pos.x > p.width) {
          this.pos.x = 0;
          this.updatePrev();
        }
        if (this.pos.x < 0) {
          this.pos.x = p.width;
          this.updatePrev();
        }
        if (this.pos.y > p.height) {
          this.pos.y = 0;
          this.updatePrev();
        }
        if (this.pos.y < 0) {
          this.pos.y = p.height;
          this.updatePrev();
        }
      };
    }
  };
  window.onload = function() {
    new p5(sketch);
  };
 

