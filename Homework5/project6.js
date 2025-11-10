var raytraceFS = `
struct Ray {
	vec3 pos;
	vec3 dir;
};

struct Material {
	vec3  k_d;	// diffuse coefficient
	vec3  k_s;	// specular coefficient
	float n;	// specular exponent
};

struct Sphere {
	vec3     center;
	float    radius;
	Material mtl;
};

struct Light {
	vec3 position;
	vec3 intensity;
};

struct HitInfo {
	float    t;
	vec3     position;
	vec3     normal;
	Material mtl;
};

uniform Sphere spheres[ NUM_SPHERES ];
uniform Light  lights [ NUM_LIGHTS  ];
uniform samplerCube envMap;
 
bool IntersectRay( inout HitInfo hit, Ray ray );

// Shades the given point and returns the computed color.
vec3 Shade( Material mtl, vec3 position, vec3 normal, vec3 view )
{
	vec3 color = vec3(0,0,0);

	for ( int i=0; i<NUM_LIGHTS; ++i ) {
		vec3 lightDirection = normalize(lights[i].position - position);
		vec3 halfVector = normalize(lightDirection + view);
		float diffAng = max(0.0, dot(normal, lightDirection));
		float specAng = max(0.0, dot(normal, halfVector));

		// TO-DO: Check for shadows 
		Ray shadowRay;
		shadowRay.pos = position + normal * 0.00001;
		shadowRay.dir = normalize(lights[i].position - shadowRay.pos);
		HitInfo shadowHit;
		bool inShadow = IntersectRay(shadowHit, shadowRay) && shadowHit.t < length(lights[i].position - shadowRay.pos);
		
		// TO-DO: If not shadowed, perform shading using the Blinn model
		if (!inShadow) {
			vec3 diffuse = mtl.k_d * lights[i].intensity * diffAng;
			vec3 specular = mtl.k_s * lights[i].intensity * pow(specAng, mtl.n);

			color += diffuse + specular;
		}
	}
	return color;
}

// Intersects the given ray with all spheres in the scene
// and updates the given HitInfo using the information of the sphere
// that first intersects with the ray.
// Returns true if an intersection is found.
bool IntersectRay( inout HitInfo hit, Ray ray )
{
	hit.t = 1e30;
	bool foundHit = false;
	for ( int i=0; i<NUM_SPHERES; ++i ) {
		// TO-DO: Test for ray-sphere intersection
        vec3 oc = ray.pos - spheres[i].center;
		float a = dot(ray.dir, ray.dir);
        float b = 2.0 * dot(ray.dir, oc);
        float c = dot(oc, oc) - spheres[i].radius * spheres[i].radius;
        float discriminant = b * b - 4.0 * a * c;

		// TO-DO: If intersection is found, update the given HitInfo
        if (discriminant >= 0.0) {
            float sqrtDiscriminant = sqrt(discriminant);
            float t = (-b - sqrtDiscriminant) / (2.0 * a);
			if (t > 0.00001 && t < hit.t) {
                hit.t = t;
                hit.position = ray.pos + hit.t * ray.dir;
                hit.normal = normalize(hit.position - spheres[i].center);
                hit.mtl = spheres[i].mtl;
                foundHit = true;
            }
        }
	}
	return foundHit;
}

// Given a ray, returns the shaded color where the ray intersects a sphere.
// If the ray does not hit a sphere, returns the environment color.
vec4 RayTracer( Ray ray )
{
	HitInfo hit;
	if ( IntersectRay( hit, ray ) ) {
		vec3 view = normalize( -ray.dir );
		vec3 clr = Shade( hit.mtl, hit.position, hit.normal, view );
		
		// Compute reflections
		vec3 k_s = hit.mtl.k_s;
		for ( int bounce=0; bounce<MAX_BOUNCES; ++bounce ) {
			if ( bounce >= bounceLimit ) break;
			if ( hit.mtl.k_s.r + hit.mtl.k_s.g + hit.mtl.k_s.b <= 0.0 ) break;
			
			Ray r;	// this is the reflection ray
			HitInfo h;	// reflection hit info
			
			// TO-DO: Initialize the reflection ray
			r.pos = hit.position + hit.normal * 0.00001;
			r.dir = reflect(ray.dir, hit.normal);
			

			// il problema è che lui riflette solo se trova una sfera, ma il pavimento non è una sfera, quindi quando la dir va a terra e a terra c'e l'ombra lui non la vede e non la riflette, quindi la sfera, nella semiparte sotto è colorata quando dovrebbe essere nera
			if ( IntersectRay( h, r ) ) {
				// clr = vec3(1,1,1);
				// TO-DO: Hit found, so shade the hit point
				clr += k_s * Shade(h.mtl, h.position, h.normal, normalize(-r.dir));
				// TO-DO: Update the loop variables for tracing the next reflection ray
				ray = r;
				hit = h;
				k_s *= hit.mtl.k_s;

			} else {
				// The refleciton ray did not intersect with anything,
				// so we are using the environment color
				clr += k_s * textureCube( envMap, r.dir.xzy ).rgb;
				break;	// no more reflections
			}
		}
		return vec4( clr, 1 );	// return the accumulated color, including the reflections
	} 
	else {
		return vec4( textureCube( envMap, ray.dir.xzy ).rgb, 1 );	// return the environment color
	}
}
`;