// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {

    let transl = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, translationX, translationY, translationZ, 1];

    let rotX = [
        1, 0, 0, 0,
        0, Math.cos(rotationX), Math.sin(rotationX), 0,
        0, -Math.sin(rotationX), Math.cos(rotationX), 0,
        0, 0, 0, 1];

    let rotY = [
        Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
        0, 1, 0, 0,
        Math.sin(rotationY), 0, Math.cos(rotationY), 0,
        0, 0, 0, 1];

    let res = MatrixMult(rotX, rotY);
    res = MatrixMult(transl, res);
    res = MatrixMult(projectionMatrix, res);

    return res;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer {
    // The constructor is a good place for taking care of the necessary initializations.
    constructor() {
        let vertSh = `
        attribute vec4 pos;
        attribute vec2 texCoord;
        
        uniform mat4 mvp;
        uniform mat4 yzSwapMat;
        
        varying vec2 v_texcoord;
        
        void main() {
        // Multiply the position by the matrix.
        gl_Position = mvp * yzSwapMat * pos;
        
        // Pass the texcoord to the fragment shader.
        v_texcoord = texCoord;
        }
        `;
    
        let fragSh = `
            precision mediump float;
            
            // Passed in from the vertex shader.
            varying vec2 v_texcoord;
            
            // The texture.
            uniform sampler2D u_texture;
            
            void main() {
                gl_FragColor = texture2D(u_texture, v_texcoord);
            }
            `;
            this.prog = InitShaderProgram(vertSh, fragSh);
            
            this.mvp = gl.getUniformLocation(this.prog, 'mvp');
            this.yzSwapLoc = gl.getUniformLocation(this.prog, 'yzSwapMat');
            
            this.vertPos = gl.getAttribLocation(this.prog, 'pos');
            this.texPos = gl.getAttribLocation(this.prog, 'texCoord');
            
            // Create the buffer objects
            this.vertBuffer = gl.createBuffer();

            this.texBuffer = gl.createBuffer();
            
            this.vertexCount = 0;

            // creating a default texture
            this.defaultTexture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.defaultTexture);
            const defaultWhiteImage = new Uint8Array([255, 255, 255, 255]); // RGBA bianco
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, defaultWhiteImage);
            const sampler = gl.getUniformLocation(this.prog, 'u_texture');
            gl.uniform1i(sampler, 0);

            // creating a texture
            this.texture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.texture)
            
            
            this.yzSwapMat = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    // This method is called every time the user opens an OBJ file.
    // The arguments of this function is an array of 3D vertex positions
    // and an array of 2D texture coordinates.
    // Every item in these arrays is a floating point value, representing one
    // coordinate of the vertex position or texture coordinate.
    // Every three consecutive elements in the vertPos array forms one vertex
    // position and every three consecutive vertex positions form a triangle.
    // Similarly, every two consecutive elements in the texCoords array
    // form the texture coordinate of a vertex.
    // Note that this method can be called multiple times.
    setMesh(vertPos, texCoords) {
        // [TO-DO] Update the contents of the vertex buffer objects.
        this.vertexCount = vertPos.length / 3;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
    }

    // This method is called when the user changes the state of the
    // "Swap Y-Z Axes" checkbox.
    // The argument is a boolean that indicates if the checkbox is checked.
    swapYZ(swap) {
        // [TO-DO] Set the unaiform parameter(s) of the vertex shader
        this.yzSwapMat = swap ? new Float32Array([
            1, 0, 0, 0,
            0, 0, 1, 0,
            0, 1, 0, 0,
            0, 0, 0, 1
        ]) : new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);

        gl.useProgram(this.prog);
        gl.uniformMatrix2fv(this.yzSwapLoc, false, this.yzSwapMat);
    }

    // This method is called to draw the triangular mesh.
    // The argument is the transformation matrix, the same matrix returned
    // by the GetModelViewProjection function above.
    draw(trans) {
        // [TO-DO] Complete the WebGL initializations before drawing
        gl.useProgram(this.prog);
        gl.uniformMatrix4fv(this.mvp, false, trans);
        gl.uniformMatrix4fv(this.yzSwapLoc, false, this.yzSwapMat)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
        gl.vertexAttribPointer(this.vertPos, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vertPos);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
        gl.enableVertexAttribArray(this.texPos);
        gl.vertexAttribPointer(this.texPos, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
    }

    // This method is called to set the texture of the mesh.
    // The argument is an HTML IMG element containing the texture data.
    setTexture(img) {
        // [TO-DO] Bind the texture
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        // You can set the texture image data using the following command.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);

        gl.generateMipmap(gl.TEXTURE_2D);

        
        // [TO-DO] Now that we have a texture, it might be a good idea to set
        // some uniform parameter(s) of the fragment shader, so that it uses the texture.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        
    }
    
    // This method is called when the user changes the state of the
    // "Show Texture" checkbox.
    // The argument is a boolean that indicates if the checkbox is checked.
    showTexture(show) {

        // [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
        
        gl.useProgram(this.prog);
        gl.unifrom1i(this.sampler, show ? 1 : 0);

        
    }

}