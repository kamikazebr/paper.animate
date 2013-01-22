// paper.animate.js v0.1.0

paper.Item.prototype.animate = function(duration, chain) {
	return new PaperAnimate.AnimationProxy(duration, chain||true, this);
};

var PaperAnimate = {};

// Animation Proxy

PaperAnimate.AnimationProxy = (function() {
	var duration, retVal;

	function AnimationProxy(_duration, chain, item) {
		this.item = item;
		this.modifiers = [];
		retVal = (chain == false) ? item : this;
		duration = _duration || 1000;
	}
	
	AnimationProxy.prototype.update = function(e) {
		for (var i = 0; i < this.modifiers.length; i++) {
			this.modifiers[i].update(e);
		}
	};
	
	AnimationProxy.prototype.removeModifier = function(modifier) {
		var index = this.modifiers.indexOf(modifier);
		if (index >= 0) {
			this.modifiers.splice(index, 1);
		}
	};
	
	AnimationProxy.prototype.scale = function() {
		PaperAnimate.utils.selectOverload(
			this, arguments,
			[{
				params: ["Number","Point"],
				fn: function(scale, center) {
					this.modifiers.push(new PaperAnimate.modifiers.ScaleModifier(scale, scale, center, duration, this));
				}
			},
			{
				params: ["Number","Number","Point"],
				fn: function(hor, ver, center) {
					this.modifiers.push(new PaperAnimate.modifiers.ScaleModifier(hor, ver, center, duration, this));
				}
			}]
		);
		return retVal;
	};
	
	AnimationProxy.prototype.translate = function(point) {
		this.modifiers.push(new PaperAnimate.modifiers.TranslateModifier(point, duration, this));
		return retVal;
	};
	
	AnimationProxy.prototype.rotate = function(angle, center) {
		this.modifiers.push(new PaperAnimate.modifiers.RotateModifier(angle, center, duration, this));
		return retVal;
	};
	
	AnimationProxy.prototype.shear = function() {
		PaperAnimate.utils.selectOverload(
			this, arguments,
			[{
				params: ["Point","Point"],
				fn: function(point, center) {
					this.modifiers.push(new PaperAnimate.modifiers.ShearModifier({point:point}, center, duration, this));
				}
			},
			{
				params: ["Number","Number","Point"],
				fn: function(hor, ver, center) {
					this.modifiers.push(new PaperAnimate.modifiers.ShearModifier({hor:hor,ver:ver}, center, duration, this));
				}
			}]
		);
		return retVal;
	};
	
	return AnimationProxy;
})();

// Modifiers

PaperAnimate.modifiers = {};

PaperAnimate.modifiers.ScaleModifier = (function() {
	function ScaleModifier(_hor, _ver, _center, _duration, _proxy) {
		this.hor = _hor;
		this.ver = _ver;
		this.center = _center;
		this.duration = _duration;
		this.proxy = _proxy;
		
		var clone = _proxy.item.clone();
		console.log(clone);
		clone.remove();
	}
	
	ScaleModifier.prototype.update = function(e) {
		if (this.duration <= 0) { this.proxy.removeModifier(this); return; }
		this.duration -= e.delta;
	};
	
	return ScaleModifier;
})();


PaperAnimate.modifiers.TranslateModifier = (function() {
		
	function TranslateModifier(_point, _duration, _proxy) {
		this.point = _point;
		this.duration = _duration;
		this.proxy = _proxy;
	}
	
	TranslateModifier.prototype.update = function(e) {
		if (this.duration <= 0) { this.proxy.removeModifier(this); return; }
		var updatePoint = PaperAnimate.utils.multiplyPoint(this.point, e.delta / this.duration);
		this.proxy.item.translate(updatePoint);
		this.point = new paper.Point(this.point.x - updatePoint.x, this.point.y - updatePoint.y);
		this.duration -= e.delta;
	};
	
	return TranslateModifier;
	
})();

PaperAnimate.modifiers.RotateModifier = (function() {
	function RotateModifier(_angle, _center, _duration, _proxy) {
		this.angle = _angle/_duration;
		this.duration = _duration;
		this.center = _center;
		this.proxy = _proxy;
	}
	
	RotateModifier.prototype.update = function(e) {
		if (this.duration <= 0) { this.proxy.removeModifier(this); return; }
		this.proxy.item.rotate(this.angle*e.delta, this.center);
		this.duration -= e.delta;
	};
	
	return RotateModifier;
})();

PaperAnimate.modifiers.ShearModifier = (function() {
	function ShearModifier(_options, _center, _duration, _proxy) {
		this.center = _center;
		this.duration = _duration;
		this.proxy = _proxy;
		
		if (this.point !== undefined) {
			this.point = PaperAnimate.utils.dividePoint(_options.point, _duration);
		} else {
			this.hor = _options.hor / _duration;
			this.ver = _options.ver / _duration;
		}
	}
	
	ShearModifier.prototype.update = function(e) {
		if (this.duration <= 0) { this.proxy.removeModifier(this); return; }
		if (this.point !== undefined) {
			this.proxy.item.shear(PaperAnimate.utils.multiplyPoint(this.point, e.delta), this.center);
		} else {
			this.proxy.item.shear(this.hor * e.delta, this.ver * e.delta, this.center);
		}
		this.duration -= e.delta;
	};
	
	return ShearModifier;
})();

// Utils

PaperAnimate.utils = (function() {
	return {
		subtractPoint: function(a, b) {
			return this.newPointOp(function(x,y) { return x - y; }, a, b);
		},
		multiplyPoint: function(a, b) {
			return this.newPointOp(function(x,y) { return x * y; }, a, b);
		},
		newPointOp: function(fn, a, b) {
			return new paper.Point(
				fn(this.getX(a), this.getX(b)),
				fn(this.getY(a), this.getY(b))
			);
		},
		getX: function(val) { return this.get(val, "x"); },
		getY: function(val) { return this.get(val, "y"); },
		get: function(val, prop) { return val[prop] !== undefined ? val[prop] : val; },
		selectOverload: function(that, args, overloads) {
			var types = {
				Number: function(val) { return !isNaN(parseFloat(val)) && isFinite(val); },
				Point: function(val) { return val.x !== undefined && val.y !== undefined; }
			};
			for (var o = 0; o < overloads.length; o++) {
				var overload = overloads[o],
					matches = true;
				if (args.length > overloads[o].params.length) continue;
				for (var a = 0; a < args.length; a++) {
					if (!types[overload.params[a]](args[a])) {
						matches = false;
						break;
					};
				}
				if (matches) { return overload.fn.apply(that, args); }
			}
		}
	}
})();;