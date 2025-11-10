// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform( positionX, positionY, rotation, scale )
{
	radians = rotation*Math.PI/180;

	Scale_Matrix = Array(scale, 0, 0, 0, scale, 0, 0, 0, 1);
	Rotation_Matrix = Array(radians, 0, 0, 0, radians, 0, 0, 0, 1);
	Translation_Matrix = Array(1, 0, positionX, 1, 0, positionY, 0, 0, 1);ù
	
	result = Translation_Matrix*Rotation_Matrix*Scale_Matrix

	return result;
}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform( trans1, trans2 )
{
	return trans2*trans1;
}
