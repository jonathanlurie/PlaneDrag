

class PlaneShifter {
  
  /**
  * @param {THREE.Object3D} planeContainer - an object that contains 3 orthogonal planes
  */
  constructor( planeContainer, camera, control = null ){
    // contains the three planes
    this._planeContainer = planeContainer;
    
    // camera we use to cast rays
    this._camera = camera;
    
    // orbit control or trackball control
    this._control = control;
    
    // will be refreshed with the mousemove event
    this._mouse = new THREE.Vector2(Infinity, Infinity);
    
    // 3D position (world) of the clicking
    this._pointClicked3D = null;
    
    // equivalent to _pointClicked3D but in screen coordinates
    this._pointClicked2D = null;
    
    // to cast rays
    this._raycaster = new THREE.Raycaster();
    
    // if true, the camera will follow the center of the container
    this._cameraFollowObject = false;
    
    // keep track of what keyboard/mouse key is pressed. In the form {"KeyT": true, "mouse": false} 
    this._keyPressed = {};
    
    // distance from the plane container to the camera
    this._originalDistanceToCam = this._camera.position.clone().sub( this._planeContainer.position ).length();
    
    // for the picker AND the shift. default is from -Infinity to +Infinity
    this._boundingBox = new THREE.Box3( new THREE.Vector3(-Infinity, -Infinity, -Infinity), new THREE.Vector3(Infinity, Infinity, Infinity));
    
    // values involved in the rotation
    this._shiftConfig = {
      originalObjectPosition: null,
      hitPoint3D: null,
      hitPoint2D: null,
      topPoint3D: null,
      topPoint2D: null,
      planeNormalWorld3D: null,
      planeNormal2D: null
    }
    
    // list of possible states
    this._states = {IDLE:0, TRANSLATION: 1, ROTATION:2}
    
    // current state
    this._activeState = this._states.IDLE;
    
    // keys associated with states
    this._keysStates = {
      'KeyT': this._states.TRANSLATION,
      'KeyR': this._states.ROTATION,
    }
    
    this._initNormals();
    this._initEvents();
  }
  
  
  /**
  * Define a boundingbox to restrict the raycasting and the shift
  * @param {THREE.Box3} b - bounding box
  */
  setBoundingBox( b ){
    this._boundingBox = b.clone();
  }
  
  
  /**
  * [PRIVATE]
  * initialize a normal vector for each plane
  */
  _initNormals(){
    this._planeContainer.children.forEach( function(plane){
      plane.normalV = new THREE.Vector3(0, 0, 1).applyQuaternion(plane.quaternion).normalize();
    })
  }
  
  
  /**
  * [PRIVATE]
  * Initialize all the mouse/keyboard events
  */
  _initEvents(){
    window.addEventListener( 'mousemove', this._onMouseMove.bind(this), false );
    window.addEventListener( 'mousedown', this._onMouseDown.bind(this), false );
    window.addEventListener( 'mouseup', this._onMouseUp.bind(this), false );
    window.addEventListener( 'keyup', this._onKeyUp.bind(this), false );
    window.addEventListener( 'keydown', this._onKeyDown.bind(this), false );
  }
  
  
  /**
  * [PRIVATE - EVENT]
  * when mouse is moving, refreshes the internal normalized mouse position
  */
  _onMouseMove( evt ){
    this._mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this._mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
    this._followInteraction();
  }
  
  
  /**
  * [PRIVATE - EVENT]
  * when mouse is clicked, cast a ray if the right keyboard key is maintained pushed
  */
  _onMouseDown( evt ){
    this._keyPressed.mouse = true;
      
    if( this._activeState != this._states.IDLE )
      this._raycast();
  }
  
  
  /**
  * [PRIVATE - EVENT]
  * when mouse is releasing
  */
  _onMouseUp( evt ){
    this._keyPressed.mouse = false;
    this._interacting = false;
  }
  
  
  /**
  * [PRIVATE]
  * tell if a key from the keyboard is pressed
  * @param {String} keycode - the keycode of the keypressed
  * @return {Boolean} true if yes, false if not
  */
  _isKeyPressed( keycode ){
    return ((keycode in this._keyPressed ) && this._keyPressed[keycode]);
  }
  
  
  /**
  * [PRIVATE - EVENT]
  * when a key from the keyboard is pressed. Refreshes the current state
  */
  _onKeyUp( evt ){
    this._keyPressed[ evt.code ] = false;
    this._evaluateCurentState();
  }
  
  
  /**
  * [PRIVATE - EVENT]
  * when a key from the keyboard is released. Refreshes the current state
  */
  _onKeyDown( evt ){
    this._keyPressed[ evt.code ] = true;
    this._evaluateCurentState();
  }


  /**
  * [PRIVATE]
  * Evaluate the current state and enable or disable the control upon this state
  */
  _evaluateCurentState(){
    this._activeState = this._states.IDLE;
    
    var listOfKeys = Object.keys( this._keysStates )
    
    for(var i=0; i<listOfKeys.length; i++){
      if( listOfKeys[i] in this._keyPressed ){
        if( this._keyPressed[ listOfKeys[i] ] ){
          this._activeState = this._keysStates[ listOfKeys[i] ]
          break;
        }
      }
    }  
    
    if( this._activeState == this._states.IDLE ){
      this._enableControl();
    }else{
      this._disableControl();
    }  
  }
  
  
  /**
  * Whether or not the camera should follow the object
  * @param {Boolean} b - true to follow, false to not follow
  */
  setCameraFollowObject(b){
    this._cameraFollowObject = b;
  }
  
  
  /**
  * [PRIVATE]
  * Get screen coordinates of a 3D position
  * @param {THREE.Vector3} coord3D - 3D position.
  * Note: the project method is not reliable when the point is out of screen
  */
  _getScreenCoord(coord3D){
    var tempVector =  coord3D.clone();
    tempVector.project( this._camera );
    return new THREE.Vector2(tempVector.x, tempVector.y);
  }
  
  
  /**
  * [PRIVATE]
  * Performs a raycasting on the children of the plane container, then based on the
  * active state, take a decision of what to do.
  */
  _raycast(){
    this._raycaster.setFromCamera( this._mouse, this._camera );
    var intersects = this._raycaster.intersectObject( this._planeContainer, true );
    
    for(var i=0; i<intersects.length; i++){
      if( this._boundingBox.containsPoint( intersects[i].point) ){

        switch (this._activeState) {
          case this._states.TRANSLATION :
            this._castedRayForTranslation( intersects[i] );
            break;
            
          case this._states.ROTATION :
            console.log("soon, rotation");
            break
            
          default:
            
        }
        
        break;
      }
    }
    
  }
  
  
  /**
  * [PRIVATE]
  * Deals with an intersection in the context of a translation
  * @param {Object} intersect - result from a THREE.Raycaster.intersectObject
  * (not the array, but rather the single object)
  */
  _castedRayForTranslation( intersect ){
    this._interacting = true;
    var intersectPlane = intersect.object;
    this._shiftConfig.originalObjectPosition = this._planeContainer.position.clone();
    
    this._shiftConfig.hitPoint3D = intersect.point.clone();
    this._shiftConfig.hitPoint2D = this._mouse.clone();  //this._getScreenCoord( this._shiftConfig.hitPoint3D );
    this._shiftConfig.planeNormalInternal3D = intersectPlane.normalV.clone();
    this._shiftConfig.planeNormalWorld3D = intersectPlane.normalV.clone().applyQuaternion(this._planeContainer.quaternion).normalize();
    this._shiftConfig.topPoint3D = this._shiftConfig.hitPoint3D.clone().add( this._shiftConfig.planeNormalWorld3D );
    this._shiftConfig.topPoint2D = this._getScreenCoord( this._shiftConfig.topPoint3D );
    
    // this one is not normalized in 2D because we need the real projection from the normalized 3D vector
    this._shiftConfig.planeNormal2D = new THREE.Vector2( 
      this._shiftConfig.topPoint2D.x - this._shiftConfig.hitPoint2D.x,
      this._shiftConfig.topPoint2D.y - this._shiftConfig.hitPoint2D.y )
    
    this._shiftConfig.hitPoint3DInternal = this._planeContainer.worldToLocal( intersect.point.clone() );
  }
  
  
  /**
  * [PRIVATE]
  * Continue the interaction (but mostly decide which kind and delegate the work)
  */
  _followInteraction(){
    if( ! this._interacting )
      return;
      
    switch (this._activeState) {
      case this._states.TRANSLATION :
        this._followTranslation()
        break;
        
      case this._states.ROTATION :
        console.log("soon, rotation (follow)");
        break
        
      default:
        
    }
  }


  /**
  * [PRIVATE]
  * When a translation has started, this method keep updating the position of the
  * shifting plane.
  */
  _followTranslation(){

    // the 2D shift performed by the mouse since the last hit  
    var mouseShift = new THREE.Vector2(
      this._mouse.x - this._shiftConfig.hitPoint2D.x,
      this._mouse.y - this._shiftConfig.hitPoint2D.y
    )
    
    // we are weighting the shift by the the camera distance ratio compared to the initial camera distance
    var newContainerToCamDistance = this._camera.position.clone().sub( this._planeContainer.position ).length();

    var normal2DLengthOnScreen = this._shiftConfig.planeNormal2D.length();
    var normalFactor = mouseShift.dot( this._shiftConfig.planeNormal2D.clone().normalize() ) / normal2DLengthOnScreen;/** distanceRatio;*/
    var shift3D = this._shiftConfig.planeNormalWorld3D.clone().multiplyScalar( normalFactor );
    
    var newPosition = new THREE.Vector3(
      this._shiftConfig.originalObjectPosition.x + shift3D.x,
      this._shiftConfig.originalObjectPosition.y + shift3D.y,
      this._shiftConfig.originalObjectPosition.z + shift3D.z
    )
    
    if(this._boundingBox.containsPoint( newPosition ) ){
      this._planeContainer.position.set(
        this._shiftConfig.originalObjectPosition.x + shift3D.x,
        this._shiftConfig.originalObjectPosition.y + shift3D.y,
        this._shiftConfig.originalObjectPosition.z + shift3D.z
      )
    }
    
    if( this._cameraFollowObject ){
      this._camera.lookAt( this._planeContainer.position )
    }
    
  }
  
  
  /**
  * [PRIVATE]
  * Disable the orbit/trackball control
  */
  _disableControl(){
    if(!this._control)
      return;
      
    if(this._control.enabled){
      this._saveOrbitData();
    }
      
    this._control.enabled = false;
  }
  
  
  /**
  * [PRIVATE]
  * enable the orbit/trackball control
  */
  _enableControl(){
    if(!this._control)
      return;
      
    // if already enables
    if( this._control.enabled )
      return;
      
    this._control.enabled = true;
    this._restoreOrbitData()
      
  }
  
  
  /**
  * [PRIVATE]
  * Helper method to call before disabling the controls
  */
  _saveOrbitData(){
    this._orbitData = {
      target: new THREE.Vector3(),
      position: new THREE.Vector3(),
      zoom: this._control.object.zoom
    }

    this._orbitData.target.copy(this._control.target);
    this._orbitData.position.copy(this._control.object.position);
  }


  /**
  * [PRIVATE]
  * Helper method to call before re-enabling the controls
  */
  _restoreOrbitData(){
    this._control.position0.copy(this._orbitData.position);
    
    if(this._cameraFollowObject){
      this._control.target0.copy(this._planeContainer.position)
    }else{
      this._control.target0.copy(this._orbitData.target);
    }
    
    this._control.zoom0 = this._orbitData.zoom;
    this._control.reset();
  }
  
  
} /* END of class PlaneShifter */
