[[DEMO]](http://me.jonathanlurie.fr/PlaneShifter/examples/index.html)  
[[DEMO using external mouse reference]](http://me.jonathanlurie.fr/PlaneShifter/examples/externalMouse.html)  
[[DEMO using events]](http://me.jonathanlurie.fr/PlaneShifter/examples/usingEvents.html)  
[[DEMO of error when no THREEjs]](http://me.jonathanlurie.fr/PlaneShifter/examples/bad.html)  
[[DOC]](http://me.jonathanlurie.fr/PlaneShifter/doc/index.html)

Translation of an object that contains planes, along the normal of the selected plane. It also work with rotations.

## Create a compatible object
First, you need a `THREE.Object3D` with 3 planes inside that cross in an orthogonal way. In the example, we use that:  

```javascript
var container = new THREE.Object3D();

var geometry = new THREE.PlaneGeometry( 10, 10, 1 );
var material = new THREE.MeshBasicMaterial( {side: THREE.DoubleSide} );

var planeX = new THREE.Mesh( geometry, material.clone() );
planeX.rotateY( Math.PI / 2 );
planeX.material.color.set( 0xff8888 );
planeX.name = "planeX";
//planeX.normalV = new THREE.Vector3(1, 0, 0);

var planeY = new THREE.Mesh( geometry, material.clone() );
planeY.rotateX( Math.PI / 2);
planeY.material.color.set( 0xccffcc );
planeY.name = "planeY";
//planeY.normalV = new THREE.Vector3(0, 1, 0);

var planeZ = new THREE.Mesh( geometry, material.clone() );
planeZ.material.color.set( 0x8888ff );
planeZ.name = "planeZ";
//planeZ.normalV = new THREE.Vector3(0, 0, 1);

container.add( planeX );
container.add( planeY );
container.add( planeZ );
```

## Instanciation of PlaneShifter
PlaneShifter's constructor needs at least two arguments:  
- the **container** of the planes (what we called `container` in the example above)
- the **camera** instance

Here is the minimal setup:  
```javascript
var planeShifter = new PlaneShifter.PlaneShifter( container, camera );
```

In addition to that, it's very possible that your application uses something like `THREE.OrbitControls`, then you have to pass it to the constructor as an option so that PlaneShifter can lock/unlock the controls according to the interaction:  

```javascript
var controls = new THREE.OrbitControls( camera, renderer.domElement );
var planeShifter = new PlaneShifter.PlaneShifter( container , camera, {controls: controls} );
```

## Other options
In addition to setting the `controls`, PlaneShifter also accepts:  
- **mouse** an instance of `THREE.Vector2` to pass as a reference if you prefere to compute the mouse position outside (in [-1, 1]). In this case, no need to set the mouse after the constructor since it's a reference.
- **rotationKey** is the `event.key` string from the `keydown` event (default: `"KeyR"`)
- **translationKey** is the `event.key` string from the `keydown` event (default: `"KeyT"`)

Example:  
```javascript
var mouse = new THREE.Vector2(Infinity, Infinity);
...
planeShifter = new PlaneShifter.PlaneShifter( container , camera, {controls: controls, mouse: mouse, rotationKey: "Space"} );
...
```

## Methods
- `.setBoundingBox( b )` where `b` is a `THREE.Box3`. This is used to limit the translation capability to a certain box.
- `.setCameraFollowObject( b )` where `b` is a `Boolean`. When `true`, the camera follows the center of the box while moving it.
- `.enable( b )` where `b` is a `Boolean`. When `false`, the instance or PlaneShifter no longer rotate/translate or emit events.

## Events
Different kinds of events are possible:
- `startInteraction` when the user presses the key for rotation or translation key.
- `stopInteraction` when the user releases the key for rotation or translation key.
- `rotation` when rotating, called for every little bit of rotation
- `translation` when translating, called for every little bit of translation

These events have some characteristics:  
- The related callbacks will be called with **no** argument.
- There can be multiple callbacks for each events and they will all be called
- Events callbacks can be set using the method `.on( eventName, function)`

**Examples**  
```javascript
var planeShifter = new PlaneShifter.PlaneShifter( container , camera, {controls: controls} );
...

planeShifter.on("startInteraction", function(){
  console.log("Let's start some interaction :)");
});

planeShifter.on("startInteraction", function(){
  console.log("This is a second callback for when we start the interaction!");
});

planeShifter.on("stopInteraction", function(){
  console.log("No more interaction :(");
});

planeShifter.on("rotation", function(){
  console.log("rotaaaaate!");
});

planeShifter.on("translation", function(){
  console.log("translaaaate!");
});
```


## License
MIT
