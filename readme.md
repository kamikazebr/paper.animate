paper.animate
=============

For easier animated transformations with paper.js

Usage
-----

paper.animate.js has been designed to integrate easily with existing paper.js code. Simply prefix a transform command with `animate(duration, updater, chain)` / `animate(duration, chain)`. This returns a proxy object, `PaperAnimate.AnimationProxy`, with overloads for all the transform methods found on `paper.Item`. To run the animations, call the `update()` method of the proxy from the paper.js view `onFrame` event handler. It's easiest to use the `PaperAnimate.Updater` to make this easier and to automatically clear up any finished animations (more info below).

    var shape = ...
    var updater = new PaperAnimate.Updater();
    
    function onFrame(e) { // paper.js onFrame event
        updater.update(e);
    }
    
    // Translate
    shape.translate(new Point(100, 50); // paper.js
    shape.animate(1, updater).translate(new Point(100, 50)); // paper.animate.js
    
    // Rotate
    shape.rotate(90); // paper.js
    shape.animate(4, updater).rotate(90); // paper.animate.js
    
    // Chaining
    shape.animate(2, updater, true) // 2 secs, chained = true
         .scale(2)
         .shear(0.1, 0.3);
    
    // Animate Shape (paper.animate.js only)
    shape.animate(2, updater).replaceShape(differentShape);
    
	
    // Not using PaperAnimate.Updater
    var anim = shape.animate(1).rotate(45);
    function onFrame(e) {
        anim.update(e);
    }
    
Params
------

`animate(duration[, updater, chain])` or `animate(duration[, chain])`

- **duration (Number):** Specifies, in seconds, the duration of the animation. If unspecified then defaults to 1 second
- **updater (PaperAnimate.Updater):** Makes it simple to work with and update many animations
- **chain (Boolean):** Allows chaining commands by returning `PaperAnimate.AnimationProxy` object rather than original `paper.Item`. Defaults false, in keeping with paper.js api (returning item)

Supported Transformations
-------------------------

paper.animate.js supports all the transformations currently implemented by paper.js:

- scale(scale[, center])
- scale(hor, ver[, center])
- translate(delta)
- rotate(angle[, center])
- shear(point[, center])
- shear(hor, ver[, center])
- transform(matrix, flags)
- fitBounds(rectangle[, fill])

PaperAnimate.Updater
--------------------

The updater is simply an easy way to manage animations. Rather than having to maintain a list of all the animation proxies returned every time `animate()` is called, simply pass in the reference to the updater and then call `update()` only on that. Additionally, the updater will remove animations when they have completed