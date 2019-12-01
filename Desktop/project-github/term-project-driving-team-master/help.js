//inRegion(location, region_x, region_z)
/*
function inRegion(location, region_x, region_z){
  let x = location[0];
  let z = location[2];

  if((x > -10.1 && x < region_x-10) && (z > -10.1 && z < region_z-10) ){
    return true; 
  }

  return false; 
}
*/
//in region testing.
//return true if the location is in the region of the stack of the raods
//retur false else.  

//var desired = Mat4.inverse(this.car_model_transform.times(Mat4.translation([0,4,15])));
function inRegion_square( location, road_mt_stack ){
  for (var i=0; i<road_mt_stack.length; i++){
    var point = Mat4.inverse(road_mt_stack[i]).times(location);
    var x = point[0];
    var y = point[1];
    if (!( x < -1 || x > 1 ||  y < -1.1 || y > 1.1 )){ //not outside the square, inside the square
      return true;
    }
    if (i == road_mt_stack.length){
      return false;
    } 
  }   
  return false; 
}
  

/*

  //this is the origin 
function inRegion(location, region_x, region_z){
  let x = location[0];
  let z = location[2];

  if((x > -0.1 && x < region_x) && (z > -0.1 && z < region_z) ){
    return true; 
  }

  return false; 
}
*/