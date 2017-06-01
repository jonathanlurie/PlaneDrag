

class PlaneShifter {
  
  /**
  * @param {THREE.Object3D} planeContainer - an object that contains 3 orthogonal planes
  */
  constructor( planeContainer, camera ){
    // contains the three planes
    this._planeContainer = planeContainer;
    
    // camera we use to cast rays
    this._camera = camera;
    
    // will be refreshed with the mousemove event
    this._mouse = new THREE.Vector2(Infinity, Infinity);
    
    // 3D position (world) of the clicking
    this._pointClicked3D = null;
    
    // equivalent to _pointClicked3D but in screen coordinates
    this._pointClicked2D = null;
    
    // to cast rays
    this._raycaster = new THREE.Raycaster();
    
    // keep track of what keyboard/mouse key is pressed. In the form {"KeyT": true, "mouse": false} 
    this._keyPressed = {};
    
    this._shiftConfig = {
      follow: false,
      originalObjectPosition: null,
      hitPoint3D: null,
      hitPoint2D: null,

    }
    
    this._initEvents();
  }
  
  
  _initEvents(){
    window.addEventListener( 'mousemove', this._onMouseMove.bind(this), false );
    window.addEventListener( 'mousedown', this._onMouseDown.bind(this), false );
    window.addEventListener( 'mouseup', this._onMouseUp.bind(this), false );
    window.addEventListener( 'keyup', this._onKeyUp.bind(this), false );
    window.addEventListener( 'keydown', this._onKeyDown.bind(this), false );
  }
  
  
  _onMouseMove( evt ){
    this._mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this._mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
    this._follow();
  }
  
  
  _onMouseDown( evt ){
    this._keyPressed.mouse = true;
    
    this._raycast();
  }
  
  
  _onMouseUp( evt ){
    this._keyPressed.mouse = false;
    
    this._shiftConfig.follow = false;
  }
  
  
  _onKeyUp( evt ){
    this._keyPressed[ evt.code ] = false;
  }
  
  
  _onKeyDown( evt ){
    this._keyPressed[ evt.code ] = true;
  }
  
  
  _getScreenCoord(coord3D){
    var tempVector =  coord3D.clone();
    tempVector.project( camera );
    return new THREE.Vector2(tempVector.x, tempVector.y);
  }
  
  
  _raycast(){
    this._raycaster.setFromCamera( this._mouse, this._camera );
    var intersects = this._raycaster.intersectObject( this._planeContainer, true );
    
    console.log( intersects );
    
    if( intersects && intersects.length ){
      var intersectPlane = intersects[0].object;

      this._shiftConfig.follow = true;
      this._shiftConfig.originalObjectPosition = null;
      this._shiftConfig.hitPoint3D = intersects[0].point.clone();
      this._shiftConfig.hitPoint2D = null;

      }
      
      
    }
    
  }
  

  _follow(){
    if( ! this._shiftConfig.follow )
      return;
    

    
  }
  
  
  /**
  * TODO
  * Update the normal position on the screen as long as they are moving because their projections are changing during the shift.
  * Does not require a raycaster
  */ 
  _updateConfig(){

    
  }
  
} /* END of class PlaneShifter */
