paper.Item.prototype.animate = function(duration) {
	return new PaperAnimate.AnimationProxy(duration, this);
};

var PaperAnimate = {};

// Animation Proxy

PaperAnimate.AnimationProxy = (function() {
	var duration;

	function AnimationProxy(_duration, item) {
		this.item = item;
		this.modifiers = [];
		duration = _duration || 1000;
	}
	
	AnimationProxy.prototype.update = function(e) {
		for (var i = 0; i < this.modifiers.length; i++) {
			this.modifiers[i].update(e);
		}
	}
	
	AnimationProxy.prototype.removeModifier = function(modifier) {
		var index = this.modifiers.indexOf(modifier);
		if (index >= 0) {
			this.modifiers.splice(index, 1);
		}
	}
	
	AnimationProxy.prototype.translate = function(point, _duration) {
		this.modifiers.push(new PaperAnimate.modifiers.TranslateModifier(point, _duration || duration, this));
		return this;
	}
	
	AnimationProxy.prototype.rotate = function(angle, center, _duration) {
		this.modifiers.push(new PaperAnimate.modifiers.RotateModifier(angle, center, _duration || duration, this));
		return this;
	}
	
	return AnimationProxy;
})();

// Modifiers

PaperAnimate.modifiers = {};

PaperAnimate.modifiers.TranslateModifier = (function() {
		
	function TranslateModifier(_point, _duration, _proxy) {
		this.point = _point;
		this.duration = _duration;
		this.proxy = _proxy;
	}
	
	TranslateModifier.prototype.update = function(e) {
		if (this.duration <= 0) { this.proxy.removeModifier(this); return; }
		var updatePercentage = e.delta / this.duration,
			updatePoint = PaperAnimate.utils.multiplyPoint(this.point, updatePercentage);
		this.proxy.item.translate(updatePoint);
		this.point = new paper.Point(this.point.x - updatePoint.x, this.point.y - updatePoint.y);
		this.duration -= e.delta;
	}
	
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
	}
	
	return RotateModifier;
})();

// Utils

PaperAnimate.utils = {
	subtractPoint: function(a, b) {
		return PaperAnimate.utils.newPointOp(function(x,y) { return x - y; }, a, b);
	},
	multiplyPoint: function(a, b) {
		return PaperAnimate.utils.newPointOp(function(x,y) { return x * y; }, a, b);
	},
	newPointOp: function(fn, a, b) {
		return new paper.Point(
			fn(PaperAnimate.utils.getX(a), PaperAnimate.utils.getX(b)),
			fn(PaperAnimate.utils.getY(a), PaperAnimate.utils.getY(b))
		);
	},
	getX: function(val) { return val.x !== undefined ? val.x : val; },
	getY: function(val) { return val.y !== undefined ? val.y : val; }
};