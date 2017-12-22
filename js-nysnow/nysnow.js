function NYSnow(container, _cfg, async) {
	var _this = this;
	container = container || document.body;
	var stepCounter = 0;
	var cfg = {
		particleCount: 300,
		safeEdge: 10,
		wind: 0.2,
		chaos: 0.1,
		gravity: 9.8 * 0.1,
		windChange: 0.1,
		windChangeZ: 0,
	};
	if (typeof _cfg == 'object') {
		for (var k in _cfg)
			cfg[k] = _cfg[k];
	}
	this.cfg = cfg;
	
	this.canvas = document.createElement('canvas');
	this.canvas.style.position = 'fixed';
	this.canvas.style.left = '0px';
	this.canvas.style.top = '0px';
	this.canvas.style.width = '100%';
	this.canvas.style.height = '100%';
	this.canvas.style.zIndex = 9999;
	this.canvas.style.pointerEvents = 'none';
	container.appendChild(this.canvas);
	
	this.ctx = this.canvas.getContext('2d');
	
	this.particles = [];
	
	this.bornParticle = function (fromStart, particle) {
		if (!particle) {
			particle = {
				x: 0, y: 0, z: 0,
				img: this.generateTemplateImage(this.particles.length - 1),
			};
			this.particles.push(particle);
		}
		
		particle.x = Math.random() * (100 + 2*cfg.safeEdge) - cfg.safeEdge;
		particle.y = !fromStart || particle.x <= 0 || particle.x >= 100
			? Math.random() * 100
			: (cfg.gravity > 0 ? -cfg.safeEdge : 100 + cfg.safeEdge); // place at the edge
		
		if (!particle.z) {
			particle.z = Math.random() * Math.random() * Math.random() * Math.random() * Math.random() * Math.random() * Math.random() * 180 + 2;
			particle.z = Math.max(particle.z, 2);
		}
		
		return particle;
	};
	
	this.step = function () {
		var W = this.canvas.width = this.canvas.clientWidth;
		var H = this.canvas.height = this.canvas.clientHeight;
		
		stepCounter++;
		var particle;
		var d;
		var r;
		var dx;
		var wind = cfg.wind;
		if (cfg.windChange)
			wind *= Math.cos(stepCounter / 180 * cfg.windChange);
		
		for (var i = this.particles.length - 1; i > -1; i--) {
			particle = this.particles[i];
			if (particle.x > 100+cfg.safeEdge || particle.x < -cfg.safeEdge || particle.y > 100+cfg.safeEdge || particle.y < -cfg.safeEdge) {
				if (this.particles.length <= cfg.particleCount)
					this.bornParticle(true, particle);
				else {
					this.particles.splice(i, 1);
				}
				continue;
			}
			
			d = particle.z * particle.z;
			dx = wind + (Math.random() * wind - wind / 2) / 2;
			
			if (cfg.chaos)
				dx = dx * (1 - cfg.chaos) + (Math.sin(Math.sqrt(particle.z - 2) / 5.47) - 0.5) * cfg.chaos; // 5.47 is sqrt(60)
			particle.x += (dx * d) / 100;
			particle.y += (cfg.gravity * d) / 100;
			
			r = particle.z * 3;
			if (cfg.windChangeZ)
				r += Math.cos(stepCounter / 90 * cfg.windChangeZ);
			
			this.ctx.drawImage(particle.img, particle.x/100 * W - r, particle.y/100 * H - r, r*2, r*2);
		}
		
		if (this.particles.length < cfg.particleCount) {
			this.bornParticle(true);
		}
	};
	
	this.generateTemplateImage = function (index) {
		var canvas = document.createElement('canvas');
		canvas.width = 32;
		canvas.height = 32;
		var blur = canvas.width / 10;
		var ctx = canvas.getContext('2d');
		ctx.translate(canvas.width / 2, canvas.height / 2);
		
		ctx.fillStyle = 'white';
		
		ctx.rotate(Math.random() * Math.PI);
		ctx.filter = 'blur(' + blur + 'px)';
		var char = 'DGHMNOUWXY80#@%&';
		char = char[index % char.length] || 'X';
		ctx.font = 'bold ' + (canvas.width - blur * 4) + 'px monospace';
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'center';
		ctx.fillText(char, 0, 0);
		
		var img = new Image();
		img.src = canvas.toDataURL();
		return img;
	};
	
	var draw = function () {
		_this.step();
		if (draw)
			requestAnimationFrame(draw);
	};
	
	this.destroy = function () {
		draw = null;
		this.canvas.parentElement.removeChild(this.canvas);
	};
	
	if (!async) {
		while (this.particles.length < cfg.particleCount) {
			this.bornParticle();
		}
	}
	
	draw();
}
