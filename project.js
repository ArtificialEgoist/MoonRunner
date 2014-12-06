/*
 * @author: Nathan Tung
 * @comments: 
 * 
 */

window.onload = function init() {

	// initialize canvas
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

	// set up event listener on the keyboard for color cycling, toggling crosshair, navigating, and resetting
	initEventListener();
	
	// set up world, specifying the viewport, enabling depth buffer, and clearing color buffer
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);
	
	// use program with shaders
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

	// loading a texture image into buffer for texture mapping
	// set up texture image using nearest neighbor filtering
	texture = gl.createTexture();
    texture.image = new Image();
    texture.image.onload = function(){
		gl.bindTexture(gl.TEXTURE_2D, texture); // bind texture as current texture to use
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image); // upload texture image to GPU
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // parameters for scaling up
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // parameters for scaling down
		gl.bindTexture(gl.TEXTURE_2D, null);
    }
	texture.image.src = "./Images/snow.jpg";

	texture2 = gl.createTexture();
    texture2.image = new Image();
    texture2.image.onload = function(){
		gl.bindTexture(gl.TEXTURE_2D, texture2); // bind texture as current texture to use
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture2.image); // upload texture image to GPU
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // parameters for scaling up
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // parameters for scaling down
		gl.bindTexture(gl.TEXTURE_2D, null);
    }
	texture2.image.src = "./Images/brick.jpg";

	heartTexture = gl.createTexture();
    heartTexture.image = new Image();
    heartTexture.image.onload = function(){
		gl.bindTexture(gl.TEXTURE_2D, heartTexture); // bind texture as current texture to use
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, heartTexture.image); // upload texture image to GPU
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // parameters for scaling up
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // parameters for scaling down
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // prevent wrapped s coordinates (repeating)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // prevent wrapped t coordinates
		gl.bindTexture(gl.TEXTURE_2D, null);
    }
	heartTexture.image.src = "./Images/heart.jpg";

	slopeVertices = [
		vec3(length, 0, length),
		vec3(length, 0, -length),
		vec3(-length, 0, -length),
		vec3(-length, 0, length)
	];
	
	// generate slope arrays
    slope(slopeVertices, pointsArray, normalsArray, uvArray);	

    // generate blocks
    Cube(vertices, cubePoints, cubeNormals, cubeUv);

    for (var i = 0; i < 10; i++)
    {
    	positionX[i] = Math.floor(Math.random()*4) + 0;
    	positionX[i] *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
    	positionZ[i] = Math.floor(Math.random()*10) + 6;
    	positionZ[i] *= -1;
    }
    positionX[0] = 0;
    positionZ[0] = -7;


    /*
    
	// bind and set up position buffer
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
	// bind and set up normal buffer
	normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
	
	// bind and set up texture coordinate buffer
	uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(uvArray), gl.STATIC_DRAW);

    */
	
// enable bound shader position/normal attributes
	
    attribute_position = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(attribute_position);

    attribute_normal = gl.getAttribLocation(program, "vNormal");
    gl.enableVertexAttribArray(attribute_normal);
	
	attribute_UV = gl.getAttribLocation(program, "vTextureCoordinates");
    gl.enableVertexAttribArray(attribute_UV);

    /*

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(attribute_position, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(attribute_normal, 3, gl.FLOAT, false, 0, 0);	

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.vertexAttribPointer(attribute_UV, 2, gl.FLOAT, false, 0, 0);	

    */
	
	// set variables for all the other uniform variables in shader
    uniform_mvMatrix = gl.getUniformLocation(program, "mvMatrix");
    uniform_pMatrix = gl.getUniformLocation(program, "pMatrix");
    uniform_lightPosition = gl.getUniformLocation(program, "lightPosition");
    uniform_shininess = gl.getUniformLocation(program, "shininess");
	uniform_sampler = gl.getUniformLocation(program, "uSampler");
	
	// set camera position and perspective such that both cubes are in view
    viewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(90, 1, 0.001, 1000);

	// set light position
	mvLightMatrix = viewMatrix;
	uniform_mvLightMatrix = gl.getUniformLocation(program, "mvLightMatrix");
	gl.uniformMatrix4fv(uniform_mvLightMatrix, false, flatten(mvLightMatrix));
	
	// reset timer and enable depth buffer before rendering
    timer.reset();	
    gl.enable(gl.DEPTH_TEST);
	    
    render();
}

function Cube(vertices, points, normals, uv){
    Quad(vertices, points, normals, uv, 0, 1, 2, 3, vec3(0, 0, 1));
    Quad(vertices, points, normals, uv, 4, 0, 6, 2, vec3(0, 1, 0));
    Quad(vertices, points, normals, uv, 4, 5, 0, 1, vec3(1, 0, 0));
    Quad(vertices, points, normals, uv, 2, 3, 6, 7, vec3(1, 0, 1));
    Quad(vertices, points, normals, uv, 6, 7, 4, 5, vec3(0, 1, 1));
    Quad(vertices, points, normals, uv, 1, 5, 3, 7, vec3(1, 1, 0 ));
}

function Quad( vertices, points, normals, uv, v1, v2, v3, v4, normal){

    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);

    uv.push(vec2(0,0));
    uv.push(vec2(1,0));
    uv.push(vec2(1,1));
    uv.push(vec2(0,0));
    uv.push(vec2(1,1));
    uv.push(vec2(0,1));

    points.push(vertices[v1]);
    points.push(vertices[v3]);
    points.push(vertices[v4]);
    points.push(vertices[v1]);
    points.push(vertices[v4]);
    points.push(vertices[v2]);
}


function render() {
		
	// clear buffers and update time based on timer
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    time += timer.getElapsedTime() / 1000;
    // scrollZ += 0.01;
    if (life > 0)
    {
    	score += 1;
    }

    $('#score').html(score);
	
	viewMatrix = lookAt(eye, at, up);

	// set projection matrix
	gl.uniformMatrix4fv(uniform_pMatrix, false, flatten(projectionMatrix));
	
	// set light position
	gl.uniform3fv(uniform_lightPosition,  flatten(lightPosition));
    gl.uniform1f(uniform_shininess,  shininess);

	
// slope


	positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(attribute_position, 3, gl.FLOAT, false, 0, 0);

    normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(attribute_normal, 3, gl.FLOAT, false, 0, 0);	

    uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(uvArray), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.vertexAttribPointer(attribute_UV, 2, gl.FLOAT, false, 0, 0);	

    
    // scrolling of texture
    // apply relative translational positioning to uvArray (x and y components are additively increased by those values on each render)
    var translateX = textureScrollSpeed*Math.cos(toRadians(textureDegree));
    var translateY = -textureScrollSpeed*Math.sin(toRadians(textureDegree));
    translateUV(uvArray, translateX, translateY);
	// apply transformation via binding
	gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(uvArray), gl.STATIC_DRAW);

    // rotation of texture
	// make a copy of uvArray
	var uvArrayTemp = uvArray.slice();
	// apply absolute rotational positioning to copy of uvArray
	// absolute in the sense that the x and y components of uvArrayTemp are calculated anew each time, from 0 degrees to time*360 degrees
	rotateUV(uvArrayTemp, textureDegree);		
	// apply transformation via binding
	gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(uvArrayTemp), gl.STATIC_DRAW);

	// bind the normal texture coordinates
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.vertexAttribPointer(attribute_UV, 2, gl.FLOAT, false, 0, 0);

	// set up model-view matrix and bind
	mvMatrix = viewMatrix;
	mvMatrix = mult(mvMatrix, translate(vec3(x,y,z)));
	mvMatrix = mult(mvMatrix, translate(vec3(0, 0.9, 0)));
	mvMatrix = mult(mvMatrix, scale(vec3(5, 5, 5)));
    gl.uniformMatrix4fv(uniform_mvMatrix, false, flatten(mvMatrix));
	
	// bind to first texture (normal, nearest neighbor)
	gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uniform_sampler, 0)

	gl.drawArrays(gl.TRIANGLES, 0, 6);



	//Blocks

	positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubePoints), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    attribute_position = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(attribute_position);
    gl.vertexAttribPointer(attribute_position, 3, gl.FLOAT, false, 0, 0);

    normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeNormals), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    attribute_normal = gl.getAttribLocation(program, "vNormal");
    gl.enableVertexAttribArray(attribute_normal);
    gl.vertexAttribPointer(attribute_normal, 3, gl.FLOAT, false, 0, 0);	

    uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeUv), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    attribute_UV = gl.getAttribLocation(program, "vTextureCoordinates");
    gl.enableVertexAttribArray(attribute_UV);
    gl.vertexAttribPointer(attribute_UV, 2, gl.FLOAT, false, 0, 0);	


	for(var i = 0; i < 10; i++)
	{
		positionZ[i] += 0.01;
		mvMatrix = viewMatrix;
		mvMatrix = mult(mvMatrix, translate(vec3(x,y,z)));
		mvMatrix = mult(mvMatrix, translate(vec3(positionX[i] + scrollX, 1, positionZ[i])));
		if (-0.15 < (positionX[i] + scrollX) && (positionX[i] + scrollX) < 0.15)
		{
			if (-0.005 < (positionZ[i]) && (positionZ[i]) < 0.005)
			{
				life--;
				smash.play();
			}
		} 
		mvMatrix = mult(mvMatrix, scale(vec3(0.25, 0.5, 0.05)));
   		gl.uniformMatrix4fv(uniform_mvMatrix, false, flatten(mvMatrix));

   		gl.activeTexture(gl.TEXTURE0);
	    gl.bindTexture(gl.TEXTURE_2D, texture2);
	    gl.uniform1i(uniform_sampler, 0)

	    if (positionZ[i] > -5) {
			gl.drawArrays(gl.TRIANGLES, 0, 36);
		}
	}




    // Life HUD
	positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubePoints), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    attribute_position = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(attribute_position);
    gl.vertexAttribPointer(attribute_position, 3, gl.FLOAT, false, 0, 0);

    normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeNormals), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    attribute_normal = gl.getAttribLocation(program, "vNormal");
    gl.enableVertexAttribArray(attribute_normal);
    gl.vertexAttribPointer(attribute_normal, 3, gl.FLOAT, false, 0, 0);	

    uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeUv), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    attribute_UV = gl.getAttribLocation(program, "vTextureCoordinates");
    gl.enableVertexAttribArray(attribute_UV);
    gl.vertexAttribPointer(attribute_UV, 2, gl.FLOAT, false, 0, 0);	

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, heartTexture);
    gl.uniform1i(uniform_sampler, 0)

    for (var i = 0; i < life; i++) {
	    orthoProjectionMatrix = ortho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);
	    mvMatrix = orthoProjectionMatrix;
	    mvMatrix = mult(mvMatrix, scale(vec3(0.1, 0.1, 1)));
	    // mvMatrix = mult(mvMatrix, translate(vec3(-4.5, 4.5, 0)));
	    mvMatrix = mult(mvMatrix, translate(heartPositions[i]));
	    gl.uniformMatrix4fv(uniform_mvMatrix, false, flatten(mvMatrix));
    	gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    window.requestAnimFrame(render);
}

function slope(vertices, points, normals, uv) {
	normals.push(vec3(0, 1, 0));
	normals.push(vec3(0, 1, 0));
	normals.push(vec3(0, 1, 0));
	normals.push(vec3(0, 1, 0));
	normals.push(vec3(0, 1, 0));
	normals.push(vec3(0, 1, 0));
	
    uv.push(vec2(0,0));
    uv.push(vec2(1,0));
    uv.push(vec2(1,1));
    uv.push(vec2(0,0));
    uv.push(vec2(1,1));
    uv.push(vec2(0,1));
    
    points.push(vertices[0]);
    points.push(vertices[1]);
    points.push(vertices[2]);
    points.push(vertices[0]);
    points.push(vertices[2]);
    points.push(vertices[3]);
}

//given a 2D matrix of rows comprising vec2 of texture coordinates, transform each vec2 to be rotated by theta
function rotateUV(matrix, theta) {

	var rad = theta*Math.PI/180;

	for(var i=0; i<matrix.length; i++) {
		var tempX = matrix[i][0];
		var tempY = matrix[i][1];
		
		// texture rotates at an axis located at the corner of the cube
		// we need to translate the texture coordinates there first (a diagonal of 0.5 units, as it's a unit cube)
		tempX = tempX-0.5;
		tempY = tempY-0.5;
		
		// apply the rotation
		var newX = tempX*Math.cos(rad) + tempY*Math.sin(rad);
		var newY = -tempX*Math.sin(rad) + tempY*Math.cos(rad);
		
		// then translate texture back to original position
		newX = newX+0.5;
		newY = newY+0.5;
		
		// make changes to the matrix
		matrix[i] = [newX, newY];
	}
}

// given a 2D matrix of rows comprising vec2 of texture coordinates, transform each vec2 to be translated by distance (separated by x and y components)
function translateUV(matrix, distanceX, distanceY) {
		for(var i=0; i<matrix.length; i++) {
		// take x and y components of the vec2 and translate them
		var newX = matrix[i][0]+distanceX;
		var newY = matrix[i][1]+distanceY;
		
		// make changes to the matrix
		matrix[i] = [newX, newY];
	}
}

function toRadians(theta) {
	return theta*Math.PI/180;
}