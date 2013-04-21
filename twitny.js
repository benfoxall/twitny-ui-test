// drawing the globe thing, requires Sylvester and `data` (the lng/lat list)
;(function(data){

    var mouseDown = false;
    var lastMouseX = null;
    var lastMouseY = null;
    var drawn = false;

    var RotationMatrix = Matrix.I(3),
    	oldRotationMatrix = Matrix.I(3);

    function handleMouseDown(event) {
        mouseDown = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
        oldRotationMatrix = RotationMatrix;
    }


    function handleMouseUp(event) {
        mouseDown = false;
    }


    function handleMouseMove(event) {
        if (!mouseDown) {
            return;
        }
        var newX = event.clientX;
        var newY = event.clientY;

        var deltaX = newX - lastMouseX
        var a = Matrix.RotationY(-deltaX / 100);

        var deltaY = newY - lastMouseY;
        var b = Matrix.RotationX(deltaY / 100);

        var M = Matrix.I(3);
        M = a.x(b);

        RotationMatrix = M.x(oldRotationMatrix);

        // lastMouseX = newX
        // lastMouseY = newY;

        drawn = false;
    }

	window.addEventListener("mousedown",  handleMouseDown, false);
	window.addEventListener("mouseup",	  handleMouseUp, false);
	window.addEventListener("mousemove",  handleMouseMove, false);
	// window.addEventListener("touchmove",  handlers.touch, false);
	// window.addEventListener("touchstart", handlers.touch, false);


	// map the lat/lngs into cartesian coords and the
	// extend of the hist bar
	var vectors = data.map(function(point){
		var rho = 200;
		var phi = (point.lat + 90) * (Math.PI/180);
		var theta = (point.lng + 90) * (Math.PI/180);

		var x = rho * Math.sin(phi) * Math.cos(theta);
		var y = rho * Math.sin(phi) * Math.sin(theta);
		var z = rho * Math.cos(phi);

		return {
			v: $V([x,y,z]),
			v2: $V([x,y,z]).x(1.02 + (point.count/6000)),
			count: point.count
		};
	});




	// shim layer with setTimeout fallback
	window.requestAnimFrame = (function(){
	  return  window.requestAnimationFrame       || 
	          window.webkitRequestAnimationFrame || 
	          window.mozRequestAnimationFrame    || 
	          window.oRequestAnimationFrame      || 
	          window.msRequestAnimationFrame     || 
	          function( callback ){
	            window.setTimeout(callback, 1000 / 60);
	          };
	})();


	// set up the drawing/animation
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');


	(function animloop(){
		requestAnimFrame(animloop);

		// only draw if the transform matrix has changed
		if(drawn) return;
		drawn = true;


		// clear / setup the canvas
		canvas.width = canvas.width;
		context.translate(300,300);
		context.strokeStyle = 'rgba(0,0,0,0.3);';
		context.beginPath();

		vectors.forEach(function(vector, i){

			// transform to the current view
			var v = RotationMatrix.x(vector.v);

			// skip backface points
			if(v.elements[2] > 0) return;

			var v2 = RotationMatrix.x(vector.v2);

			context.moveTo(v.elements[0],v.elements[1]);
			context.lineTo(v2.elements[0],v2.elements[1]);

		});

		context.closePath();
		context.stroke();
	})();

})(data);