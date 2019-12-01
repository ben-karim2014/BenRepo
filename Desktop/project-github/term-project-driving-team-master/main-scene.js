
window.Final_Project_Scene = window.classes.Final_Project_Scene =
class Final_Project_Scene extends Scene_Component
  { 
    constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 
          //look_at (eye,at, up)

/*
          this.eye = Vec.of(0,5,15);
          this.at = Vec.of(0,5,0);
          this.up = Vec.of(0,1,0);
          context.globals.graphics_state.camera_transform = Mat4.look_at( this.eye, this.at, this.up );
*/
          //checking 

          this.eye = Vec.of(50,600,100);
          this.at = Vec.of(50,-600,90);
          this.up = Vec.of(0,1,0);
          context.globals.graphics_state.camera_transform = Mat4.look_at( this.eye, this.at, this.up );

          this.initial_camera_location = Mat4.inverse( context.globals.graphics_state.camera_transform );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        const shapes = { torus:  new Torus( 15, 15 ),
                         box: new Cube(), 
                         rect: new Rectangle(),       
                         torus2: new ( Torus.prototype.make_flat_shaded_version() )( 15, 15 ),
                         planet: new Subdivision_Sphere (4),
                         square: new Square(),
                         sky:  new Subdivision_Sphere (4),
                         trape: new Trapezoid(),
                         car: new Shape_From_File("assets/car2.obj"),
                         tree: new Shape_From_File("assets/tree.obj"),
                         power: new Shape_From_File("assets/heart.obj")
                        
                       }

        this.submit_shapes( context, shapes );

        this.go = 0; 
        this.speed = 1; 
        this.turn = 0; 
        this.gameStart = false;
        this.gameOver = true;
        this.wall_hit =0;
        this.power =0;
        

        this.s = new Audio("car1.mp3");
        this.s.loop = false;


        this.car_model_transform = Mat4.identity().times(Mat4.translation( Vec.of(0,1,0)  ));  
        this.car_model_transform = this.car_model_transform.times(Mat4.scale( Vec.of(2,2,2))); 
        this.car_location = this.car_model_transform.times(Vec.of(0,0,0,1));  
        this.car_model_transform = this.car_model_transform.times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0) )); 
        this.car_location = this.car_model_transform.times(Vec.of(0,0,0,1));  

        
        this.shadow_model_transform = Mat4.identity().times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0) ));
        this.shadow_model_transform = this.shadow_model_transform.times(Mat4.translation( Vec.of(0,1,0)  ));
        this.shadow_model_transform =  this.shadow_model_transform.times(Mat4.scale( Vec.of(2,2,2)));
        this.shadow_model_transform = this.shadow_model_transform.times(Mat4.rotation(Math.PI/2, Vec.of(1,0,0) )); 
        this.map_model_transform = Mat4.identity();
        this.sky_model_transform = Mat4.identity();
        this.road_model_transform = Mat4.identity();

        this.road_mt_stack = [];
        this.power_stack =[];

    
        this.materials =
          {  grasses: context.get_instance( Phong_Shader ).material( (Color.of( 0,0,0,1 ) ),{ambient: 1, texture: context.get_instance( "assets/grass.png", false )}) ,
             phong1: context.get_instance( Phong_Shader ).material( (Color.of( 0,0,0,1 ) ),{ambient: 1, texture: context.get_instance( "assets/eye.png", false )}) ,
             white: context.get_instance( Phong_Shader ).material( (Color.of( 0,0,0,1 ) ),{ambient: 1, texture: context.get_instance( "assets/fav.ico", false )}) ,
             phong2: context.get_instance( Phong_Shader ).material( (Color.of( 0,0,0,1 ) ),{ambient: 1, texture: context.get_instance( "assets/meteor.png", false )}) ,
             phong3: context.get_instance( Phong_Shader ).material( (Color.of( 0,0,0,1 ) ),{ambient: 1, texture: context.get_instance( "assets/crab_nebular.png", false )}) ,   
             sky: context.get_instance( Phong_Shader ).material( (Color.of( 0,0,0,1 ) ),{ambient: 1, texture: context.get_instance( "assets/sky.png", false )}) ,   
             road: context.get_instance( Phong_Shader ).material( (Color.of( 0,0,0,1 ) ),{ambient: 1, texture: context.get_instance( "assets/road1.png", false )}) ,   
            
            sun:      context.get_instance( Phong_Shader ).material( Color.of( 1 ,0, 1 ,1 ), { ambient: 1 } ),
            planet1:  context.get_instance( Phong_Shader ).material( Color.of( 218/225, 228/225, 222/225, 1 ),{ambient: 0}, {diffusivity: .1}),
            planet2:  context.get_instance( Phong_Shader ).material( Color.of( 163/225, 174/225, 126/225, 1 ),{ambient: 0}, {diffusivity: .1}, {specularity: 1} ),
            planet2_gourad:  context.get_instance( Phong_Shader ).material( Color.of( 163/225, 174/225, 126/225, 1 ),{ambient: 0}, {diffusivity: .1}, {specularity: 1}, {gourad: 1} ),            
            planet3:  context.get_instance( Phong_Shader ).material( Color.of( 169/255, 132/255, 79/255, 1), {ambient: 0}, {diffusivity: 1}, {specularity: 1} ),
            planet4:  context.get_instance( Phong_Shader ).material( Color.of( 173/255, 216/255, 230/255, 1), {ambient: 0}, {specularity: .9} ),
            moon:     context.get_instance( Phong_Shader ).material( Color.of( 218/225, 228/225, 222/225, 1 ),{ambient: 0}, {diffusivity: .1}),
            car: context.get_instance( Phong_Shader ).material(Color.of( 218/225, 228/225, 222/225, 1 ),{ambient: 0}, {diffusivity: .1}),
            tree: context.get_instance( Phong_Shader ).material(Color.of( 0,0,0,1 ),{ambient: 0.8, texture: context.get_instance( "/assets/leaves.png", false )}),
            power: context.get_instance( Phong_Shader ).material( Color.of( 1 ,0, 1 ,1 ), { ambient: 1 } ),
            shadow:  context.get_instance( Shadow_Shader ).material(Color.of( 0,0,0,1 ),{ambient: 1, texture: context.get_instance( "/assets/car2.obj", true )}),
           
          } 

        this.lights = [ new Light( Vec.of( 0, 10, 6 ,1 ), Color.of( 1, 1, 1, 1 ), 1000 ) ];
        this.test_falg = 0;
      }


      make_control_panel() {
        this.key_triggered_button ("Go", ["i"], () => { 
            this.go = 1;
            this.speed += 0.3;
           this.s.play();
            
             
        });
                this.key_triggered_button ("stop", ["u"], () => { 
            
            this.speed = 0; 
            this.turn =0;
        });
        this.key_triggered_button ("Break", ['k'], () => {
            this.speed -= 0.3; } );

        this.key_triggered_button ("Turn Left", ["j"], () => {this.turn += 0.1;} );
        this.key_triggered_button ("Turn Right", ["l"], () => {this.turn -= 0.1;} );
        this.key_triggered_button ("test" , ["t"], () => {   this.test_falg = 1;
           // console.log(this.road_mt_stack[0]);

        } );
        this.key_triggered_button( "Restart (when dead)", ["v"], () => {this.start()});
        this.key_triggered_button ("BGM", ["1"], () => {        this.audio = new Audio("bgm.mp3")
        this.audio.loop = true
        this.audio.volume = 0.5
	this.audio.play()} );
      }

    //inRegion(location, region_x, region_z)
    collision(){
        //function setRegion_square( location, road_mt_stack )
        if (inRegion_square(this.car_location, this.road_mt_stack) == false ){

            this.speed *= -1.3;
            this.wall_hit = this.wall_hit +1;
        }else{
            this.speed = this.speed;
        }
    }
  draw_tree(graphics_state){

  this.tree_model_transform = Mat4.identity();
  this.tree_model_transform = this.tree_model_transform.times(Mat4.translation( Vec.of(-7,5, 0)));
  this.tree_model_transform = this.tree_model_transform.times(Mat4.scale( Vec.of(2,2,2)));
  this.tree_location = this.tree_model_transform.times(Vec.of(0,0,0,1)); 
  this.shapes.tree.draw(graphics_state, this.tree_model_transform, this.materials.tree);
  this.shapes.tree.draw(graphics_state, this.tree_model_transform, this.materials.shadow);
  this.tree_model_transform = this.tree_model_transform.times(Mat4.translation( Vec.of(-1,0, 8)));
  this.tree_model_transform = this.tree_model_transform.times(Mat4.scale( Vec.of(2,2,2)));
  this.shapes.tree.draw(graphics_state, this.tree_model_transform, this.materials.tree);
 
 
  this.tree_model_transform = Mat4.identity();
  this.tree_model_transform = this.tree_model_transform.times(Mat4.translation( Vec.of(-7,5, 0)));
  this.tree_model_transform = this.tree_model_transform.times(Mat4.translation( Vec.of(25,0, 25)));
  this.tree_model_transform = this.tree_model_transform.times(Mat4.scale( Vec.of(2,2,2)));
  this.shapes.tree.draw(graphics_state, this.tree_model_transform, this.materials.tree);
  this.shapes.tree.draw(graphics_state, this.tree_model_transform, this.materials.shadow);

  this.tree_model_transform = Mat4.identity();
  this.tree_model_transform = this.tree_model_transform.times(Mat4.translation( Vec.of(-7,5, 0)));
  this.tree_model_transform = this.tree_model_transform.times(Mat4.translation( Vec.of(35,0, 25)));
  this.tree_model_transform = this.tree_model_transform.times(Mat4.scale( Vec.of(2,2,2)));
  this.shapes.tree.draw(graphics_state, this.tree_model_transform, this.materials.tree);
  this.shapes.tree.draw(graphics_state, this.tree_model_transform, this.materials.shadow);

  this.tree_model_transform = Mat4.identity();
  this.tree_model_transform = this.tree_model_transform.times(Mat4.translation( Vec.of(-7,5, 0)));
  this.tree_model_transform = this.tree_model_transform.times(Mat4.translation( Vec.of(45,0, 25)));
  this.tree_model_transform = this.tree_model_transform.times(Mat4.scale( Vec.of(2,2,2)));
  this.shapes.tree.draw(graphics_state, this.tree_model_transform, this.materials.tree);
  this.shapes.tree.draw(graphics_state, this.tree_model_transform, this.materials.shadow);

  this.tree_model_transform = Mat4.identity();
  this.tree_model_transform = this.tree_model_transform.times(Mat4.translation( Vec.of(-7,5, 0)));
  this.tree_model_transform = this.tree_model_transform.times(Mat4.translation( Vec.of(45,0, 15)));
  this.tree_model_transform = this.tree_model_transform.times(Mat4.scale( Vec.of(2,2,2)));
  this.shapes.tree.draw(graphics_state, this.tree_model_transform, this.materials.tree);
  this.shapes.tree.draw(graphics_state, this.tree_model_transform, this.materials.shadow);

  this.tree_model_transform = Mat4.identity();
  this.tree_model_transform = this.tree_model_transform.times(Mat4.translation( Vec.of(-7,5, 0)));
  this.tree_model_transform = this.tree_model_transform.times(Mat4.translation( Vec.of(45,0, 10)));
  this.tree_model_transform = this.tree_model_transform.times(Mat4.scale( Vec.of(2,2,2)));
  this.shapes.tree.draw(graphics_state, this.tree_model_transform, this.materials.tree);
this.shapes.tree.draw(graphics_state, this.tree_model_transform, this.materials.shadow);

  this.tree_model_transform = Mat4.identity();
  this.tree_model_transform = this.tree_model_transform.times(Mat4.translation( Vec.of(-7,5, 0)));
  this.tree_model_transform = this.tree_model_transform.times(Mat4.translation( Vec.of(45,0, 5)));
  this.tree_model_transform = this.tree_model_transform.times(Mat4.scale( Vec.of(2,2,2)));
  this.shapes.tree.draw(graphics_state, this.tree_model_transform, this.materials.tree);
  this.shapes.tree.draw(graphics_state, this.tree_model_transform, this.materials.shadow);

  this.tree_model_transform = Mat4.identity();
  this.tree_model_transform = this.tree_model_transform.times(Mat4.translation( Vec.of(-7,5, 0)));
  this.tree_model_transform = this.tree_model_transform.times(Mat4.translation( Vec.of(38,0, 25)));
  this.tree_model_transform = this.tree_model_transform.times(Mat4.scale( Vec.of(2,2,2)));
  this.shapes.tree.draw(graphics_state, this.tree_model_transform, this.materials.tree);
  this.shapes.tree.draw(graphics_state, this.tree_model_transform, this.materials.shadow);


  this.tree_model_transform = this.tree_model_transform.times(Mat4.translation( Vec.of(45,0, 20)));
  this.tree_model_transform = this.tree_model_transform.times(Mat4.scale( Vec.of(2,2,2)));
  this.shapes.tree.draw(graphics_state, this.tree_model_transform, this.materials.tree);
  this.shapes.tree.draw(graphics_state, this.tree_model_transform, this.materials.shadow);

  this.tree_model_transform = this.tree_model_transform.times(Mat4.translation( Vec.of(-7,5, 0)));
  this.tree_model_transform = this.tree_model_transform.times(Mat4.translation( Vec.of(0,0, 10)));
  this.tree_model_transform = this.tree_model_transform.times(Mat4.scale( Vec.of(2,2,2)));
  this.shapes.tree.draw(graphics_state, this.tree_model_transform, this.materials.shadow);
}



    draw_box(graphics_state, dt)
    {
      //this.car_model_transform = this.car_model_transform.times(Mat4.rotation(Math.PI/2, Vec.of(1,1,0) ));
       if(this.go == 1){
                this.collision();
                this.power_collision();
                var distance = dt * -1 * this.speed;
                
                this.car_model_transform = this.car_model_transform.times(Mat4.rotation(dt * this.turn, Vec.of(0,1,0)  ));
                this.car_model_transform = this.car_model_transform.times(Mat4.translation( [distance,0,0 ]));

                this.shadow_model_transform = this.shadow_model_transform.times(Mat4.rotation(dt * this.turn, Vec.of(0,1,0)  ));
                this.shadow_model_transform = this.shadow_model_transform.times(Mat4.translation( [distance,0,0 ]));
                //this.car_model_transform = this.car_model_transform.times(Mat4.rotation(Math.PI/2, Vec.of(1,0,0) ));

                //catch the camera 
                var desired = Mat4.inverse(this.car_model_transform.times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0) ))
                                                                   .times(Mat4.translation([0,2.5,10])) );
                graphics_state.camera_transform = desired;

            }

      //update the car location 
      //this.car_model_transform = Mat4.identity();
    
      //this.car_model_transform = this.car_model_transform.times(Vec.of(0,0,0,1));
      this.car_location = this.car_model_transform.times(Vec.of(0,0,0,1)); 
      this.shapes.car.draw(graphics_state, this.car_model_transform, this.materials.car);
      this.shapes.car.draw(graphics_state,this.car_model_transform,this.materials.shadow);
   
      
    }

    draw_map(graphics_state)
    {
      this.map_model_transform = Mat4.identity().times(Mat4.rotation(Math.PI/2, Vec.of(1,0,0) ))
                                                .times(Mat4.scale(Vec.of(40,40,40)));
      for (var v=0; v<34; v++){
          for (var h=0; h<34; h++){
              this.shapes.square.draw(graphics_state, this.map_model_transform, this.materials.grasses);    
              this.map_model_transform = this.map_model_transform.times(Mat4.translation(Vec.of(2,0,0) ));
              
          }
          this.map_model_transform = this.map_model_transform.times(Mat4.translation(Vec.of(-2*h,2,0) ));
      }
    }

    draw_road(graphics_state)
    {
      this.road_mt_stack = [];
      this.road_model_transform = Mat4.identity().times(Mat4.translation(Vec.of(1,0,1)));
      this.road_model_transform = this.road_model_transform                                                                                               
                                                .times(Mat4.rotation(Math.PI/2, Vec.of(1,0,0) ))        
                                                .times(Mat4.scale(Vec.of(8,8,1)))
                                                .times(Mat4.rotation(Math.PI/-2, Vec.of(0,0,1)))
                                             //   .times(Mat4.rotation(Math.PI/12, Vec.of(0,0,1)))
                                                .times(Mat4.translation(Vec.of(0,0,-0.1)))  
                                                ;                        
      
      this.road_model_transform = this.road_model_transform
                                                 .times(Mat4.rotation(Math.PI/-2, Vec.of(0,0,1) ));
      
                                              
    
      for (var h=0; h<5; h++){
          //this.shapes.power.draw(graphics_state, this.road_model_transform, this.materials.power);
          this.shapes.square.draw(graphics_state, this.road_model_transform, this.materials.road);
          this.road_mt_stack.push(this.road_model_transform);
          this.road_model_transform = this.road_model_transform.times(Mat4.translation(Vec.of(0,-2,0) ));   
      }
        
            
      this.road_model_transform = this.road_model_transform
                                            .times(Mat4.translation(Vec.of(-0.5,0,0)))
                                            .times(Mat4.shear(Vec.of(0,0.5,0), Vec.of(0,0,0), Vec.of(0,0,0)))                                              
                                            ;  
      this.shapes.square.draw(graphics_state, this.road_model_transform, this.materials.road);
      this.road_mt_stack.push(this.road_model_transform);
      

      this.road_model_transform = this.road_model_transform
                                    .times(Mat4.translation(Vec.of(0,-2,0)))
                                    .times(Mat4.translation(Vec.of(-0.2,0,0)))
                                    .times(Mat4.shear(Vec.of(0,0.2,0), Vec.of(0,0,0), Vec.of(0,0,0)))                                              
                                    ;  
      this.shapes.square.draw(graphics_state, this.road_model_transform, this.materials.road);
      this.road_mt_stack.push(this.road_model_transform);


      this.road_model_transform = this.road_model_transform
                                    .times(Mat4.translation(Vec.of(0,-2,0)))
                                    .times(Mat4.translation(Vec.of(0.7,0,0)))
                                    .times(Mat4.shear(Vec.of(0,-0.7,0), Vec.of(0,0,0), Vec.of(0,0,0)))                                              
                                    ;  
      this.shapes.square.draw(graphics_state, this.road_model_transform, this.materials.road);
      this.road_mt_stack.push(this.road_model_transform);

     
     // drawing tunning, TOFIX, replave rectangle region with the trape region 

      for (var i=1; i<=9; i++){
          this.road_model_transform = this.road_model_transform
                                .times(Mat4.translation(Vec.of(0,-2,0)))
                                .times(Mat4.translation(Vec.of(0,1,0)))
                                .times(Mat4.rotation( i==1? -0.2 : -0.4,Vec.of(0,0,1)))
                                .times(Mat4.translation(Vec.of(0,-1,0)))

                                ;  
          this.shapes.trape.draw(graphics_state, this.road_model_transform, this.materials.road);
          this.road_mt_stack.push(this.road_model_transform);
      }

      // straight road again 
      this.road_model_transform = this.road_model_transform
                            .times(Mat4.translation(Vec.of(0,-2,0)))
                            .times(Mat4.translation(Vec.of(0,1,0)))
                            .times(Mat4.rotation( i= -0.2,Vec.of(0,0,1)))
                            .times(Mat4.translation(Vec.of(0,-1,0)))
                        ;

      this.shapes.square.draw(graphics_state, this.road_model_transform, this.materials.road);
      this.road_mt_stack.push(this.road_model_transform);

      for (var i=0; i<2; i++){
            this.road_model_transform = this.road_model_transform
                        .times(Mat4.translation(Vec.of(0,-2,0)))
                    ;

          this.shapes.square.draw(graphics_state, this.road_model_transform, this.materials.road);
          this.road_mt_stack.push(this.road_model_transform);

      }

    //tunning again 

      for (var i=1; i<=1; i++){
          this.road_model_transform = this.road_model_transform
                                .times(Mat4.translation(Vec.of(0,i==1? -2 : 2,0)))
                                .times(Mat4.rotation(Math.PI, Vec.of(0,0,1)))
                                .times(Mat4.translation(Vec.of(0,-1,0)))
                                .times(Mat4.rotation( i==1? 0.2 : 0.4,Vec.of(0,0,1)))
                                .times(Mat4.translation(Vec.of(0,1,0)))

                                ;  
          this.shapes.trape.draw(graphics_state, this.road_model_transform, this.materials.road);
          this.road_mt_stack.push(this.road_model_transform);

      }

      for (var i=2; i<=5; i++){
          this.road_model_transform = this.road_model_transform
                                .times(Mat4.translation(Vec.of(0,i==1? -2 : 2,0)))
                              //  .times(Mat4.rotation(Math.PI, Vec.of(0,0,1)))
                                .times(Mat4.translation(Vec.of(0,-1,0)))
                                .times(Mat4.rotation( i==1? 0.2 : 0.4,Vec.of(0,0,1)))
                                .times(Mat4.translation(Vec.of(0,1,0)))

                                ;  
          this.shapes.trape.draw(graphics_state, this.road_model_transform, this.materials.road);
          this.road_mt_stack.push(this.road_model_transform);

      }


    // straight again
      this.road_model_transform = this.road_model_transform
                            .times(Mat4.translation(Vec.of(0,2,0)))
                            .times(Mat4.translation(Vec.of(0,-1,0)))
                            .times(Mat4.rotation( i= 0.2,Vec.of(0,0,1)))
                            .times(Mat4.translation(Vec.of(0,1,0)))
                        ;

      this.shapes.square.draw(graphics_state, this.road_model_transform, this.materials.road);
      this.road_mt_stack.push(this.road_model_transform);

      for (var i=0; i<2; i++){
            this.road_model_transform = this.road_model_transform
                        .times(Mat4.translation(Vec.of(0,2,0)))
                    ;

          this.shapes.square.draw(graphics_state, this.road_model_transform, this.materials.road);
          this.road_mt_stack.push(this.road_model_transform);

      }

      //turn again 
      for (var i=1; i<=5; i++){
          this.road_model_transform = this.road_model_transform
                                .times(Mat4.translation(Vec.of(0,2,0)))
                         //       .times(Mat4.rotation(Math.PI, Vec.of(0,0,1)))
                                .times(Mat4.translation(Vec.of(0,-1,0)))
                                .times(Mat4.rotation( i==1? 0.2 : 0.4,Vec.of(0,0,1)))
                                .times(Mat4.translation(Vec.of(0,1,0)))

                                ;  
          this.shapes.trape.draw(graphics_state, this.road_model_transform, this.materials.road);
          this.road_mt_stack.push(this.road_model_transform);

      }

       //straight again 
      this.road_model_transform = this.road_model_transform
                            .times(Mat4.translation(Vec.of(0,2,0)))
                            .times(Mat4.translation(Vec.of(0,-1,0)))
                            .times(Mat4.rotation( i= 0.2,Vec.of(0,0,1)))
                            .times(Mat4.translation(Vec.of(0,1,0)))
                        ;

      this.shapes.square.draw(graphics_state, this.road_model_transform, this.materials.road);
      this.road_mt_stack.push(this.road_model_transform);

      for (var i=0; i<2; i++){
            this.road_model_transform = this.road_model_transform
                        .times(Mat4.translation(Vec.of(0,2,0)))
                    ;

          this.shapes.square.draw(graphics_state, this.road_model_transform, this.materials.road);
          this.road_mt_stack.push(this.road_model_transform);

      }

      //turn again 
            for (var i=1; i<=1; i++){
          this.road_model_transform = this.road_model_transform
                                .times(Mat4.translation(Vec.of(0,2,0)))
                         //       .times(Mat4.rotation(Math.PI, Vec.of(0,0,1)))
                                .times(Mat4.translation(Vec.of(0,-1,0)))
                                .times(Mat4.rotation( i==1? 0.2 : 0.4,Vec.of(0,0,1)))
                                .times(Mat4.translation(Vec.of(0,1,0)))

                                ;  
          this.shapes.trape.draw(graphics_state, this.road_model_transform, this.materials.road);
          this.road_mt_stack.push(this.road_model_transform);

      }

             //straight again 
      this.road_model_transform = this.road_model_transform
                            .times(Mat4.translation(Vec.of(0,2,0)))
                            .times(Mat4.translation(Vec.of(0,-1,0)))
                            .times(Mat4.rotation( i= 0.2,Vec.of(0,0,1)))
                            .times(Mat4.translation(Vec.of(0,1,0)))
                        ;

      this.shapes.square.draw(graphics_state, this.road_model_transform, this.materials.road);
      this.road_mt_stack.push(this.road_model_transform);

      for (var i=0; i<5; i++){
            this.road_model_transform = this.road_model_transform
                        .times(Mat4.translation(Vec.of(0,2,0)))
                    ;

          this.shapes.square.draw(graphics_state, this.road_model_transform, this.materials.road);
          this.road_mt_stack.push(this.road_model_transform);

      }

      //turn again 
            for (var i=1; i<=2; i++){
          this.road_model_transform = this.road_model_transform
                                .times(Mat4.translation(Vec.of(0,2,0)))
                         //       .times(Mat4.rotation(Math.PI, Vec.of(0,0,1)))
                                .times(Mat4.translation(Vec.of(0,-1,0)))
                                .times(Mat4.rotation( i==1? 0.2 : 0.4,Vec.of(0,0,1)))
                                .times(Mat4.translation(Vec.of(0,1,0)))

                                ;  
          this.shapes.trape.draw(graphics_state, this.road_model_transform, this.materials.road);
          this.road_mt_stack.push(this.road_model_transform);

      }

             //straight again 
      this.road_model_transform = this.road_model_transform
                            .times(Mat4.translation(Vec.of(0,2,0)))
                            .times(Mat4.translation(Vec.of(0,-1,0)))
                            .times(Mat4.rotation( i= 0.2,Vec.of(0,0,1)))
                            .times(Mat4.translation(Vec.of(0,1,0)))
                        ;

      this.shapes.square.draw(graphics_state, this.road_model_transform, this.materials.road);
      this.road_mt_stack.push(this.road_model_transform);

      for (var i=0; i<2; i++){
            this.road_model_transform = this.road_model_transform
                        .times(Mat4.translation(Vec.of(0,2,0)))
                    ;

          this.shapes.square.draw(graphics_state, this.road_model_transform, this.materials.road);
          this.road_mt_stack.push(this.road_model_transform);

      }

      //turn again 
            for (var i=1; i<=1; i++){
          this.road_model_transform = this.road_model_transform
                                .times(Mat4.translation(Vec.of(0,2,0)))
                                .times(Mat4.rotation(Math.PI, Vec.of(0,0,1)))
                            //    .times(Mat4.rotation(Math.PI, Vec.of(0,0,1)))
                                .times(Mat4.translation(Vec.of(0,1,0)))
                                .times(Mat4.rotation( i==1? -0.2 : -0.4,Vec.of(0,0,1)))
                                .times(Mat4.translation(Vec.of(0,-1,0)))

                                ;  
          this.shapes.trape.draw(graphics_state, this.road_model_transform, this.materials.road);
          this.road_mt_stack.push(this.road_model_transform);

      }

            for (var i=2; i<=9; i++){
          this.road_model_transform = this.road_model_transform
                                .times(Mat4.translation(Vec.of(0,-2,0)))
                            //    .times(Mat4.rotation(Math.PI, Vec.of(0,0,1)))
                            //    .times(Mat4.rotation(Math.PI, Vec.of(0,0,1)))
                                .times(Mat4.translation(Vec.of(0,1,0)))
                                .times(Mat4.rotation( i==1? -0.2 : -0.4,Vec.of(0,0,1)))
                                .times(Mat4.translation(Vec.of(0,-1,0)))

                                ;  
          this.shapes.trape.draw(graphics_state, this.road_model_transform, this.materials.road);
          this.road_mt_stack.push(this.road_model_transform);

      }

             //straight again 
      this.road_model_transform = this.road_model_transform
                            .times(Mat4.translation(Vec.of(0,-2,0)))
                            .times(Mat4.translation(Vec.of(0,1,0)))
                            .times(Mat4.rotation( i= -0.2,Vec.of(0,0,1)))
                            .times(Mat4.translation(Vec.of(0,-1,0)))
                        ;

      this.shapes.square.draw(graphics_state, this.road_model_transform, this.materials.road);
      this.road_mt_stack.push(this.road_model_transform);

      for (var i=0; i<6; i++){
            this.road_model_transform = this.road_model_transform
                        .times(Mat4.translation(Vec.of(0,-2,0)))
                    ;

          this.shapes.square.draw(graphics_state, this.road_model_transform, this.materials.road);
          this.road_mt_stack.push(this.road_model_transform);

      }


        //turn again 
      for (var i=1; i<=1; i++){
          this.road_model_transform = this.road_model_transform
                                .times(Mat4.translation(Vec.of(0,-2,0)))
                                .times(Mat4.rotation(Math.PI, Vec.of(0,0,1)))
                            //    .times(Mat4.rotation(Math.PI, Vec.of(0,0,1)))
                                .times(Mat4.translation(Vec.of(0,-1,0)))
                                .times(Mat4.rotation( i==1? 0.2 : 0.4,Vec.of(0,0,1)))
                                .times(Mat4.translation(Vec.of(0,1,0)))

                                ;  
          this.shapes.trape.draw(graphics_state, this.road_model_transform, this.materials.road);
          this.road_mt_stack.push(this.road_model_transform);

      }

                  //turn again 
    for (var i=2; i<=5; i++){
          this.road_model_transform = this.road_model_transform
                                .times(Mat4.translation(Vec.of(0,2,0)))
                            //    .times(Mat4.rotation(Math.PI, Vec.of(0,0,1)))
                            //    .times(Mat4.rotation(Math.PI, Vec.of(0,0,1)))
                                .times(Mat4.translation(Vec.of(0,-1,0)))
                                .times(Mat4.rotation( i==1? 0.2 : 0.4,Vec.of(0,0,1)))
                                .times(Mat4.translation(Vec.of(0,1,0)))

                                ;  
          this.shapes.trape.draw(graphics_state, this.road_model_transform, this.materials.road);
          this.road_mt_stack.push(this.road_model_transform);

      }

       //straight again 
      this.road_model_transform = this.road_model_transform
                            .times(Mat4.translation(Vec.of(0,2,0)))
                            .times(Mat4.translation(Vec.of(0,-1,0)))
                            .times(Mat4.rotation( i= 0.2,Vec.of(0,0,1)))
                            .times(Mat4.translation(Vec.of(0,1,0)))
                        ;

      this.shapes.square.draw(graphics_state, this.road_model_transform, this.materials.road);
      this.road_mt_stack.push(this.road_model_transform);

      this.power_model_transform= Mat4.identity().times(Mat4.translation( Vec.of(0,2, 35)));
      this.power_model_transform= this.power_model_transform.times(Mat4.scale( Vec.of(1,1,1)));
      this.shapes.power.draw(graphics_state, this.power_model_transform, this.materials.power);
      this.shapes.power.draw(graphics_state, this.power_model_transform, this.materials.shadow);
      this.power_stack.push(this.power_model_transform);

      for (var i=0; i<2; i++){
            this.road_model_transform = this.road_model_transform
                        .times(Mat4.translation(Vec.of(0,2,0)))
                    ;
                    this.power_model_transform= Mat4.identity().times(Mat4.translation( Vec.of(4,2, 15)));
                    this.power_model_transform= this.power_model_transform.times(Mat4.scale( Vec.of(1,1,1)));
                    this.shapes.power.draw(graphics_state, this.power_model_transform, this.materials.power);
                    this.power_stack.push(this.power_model_transform);
          this.shapes.square.draw(graphics_state, this.road_model_transform, this.materials.road);
          this.road_mt_stack.push(this.road_model_transform);

      }

    

    }
    

    draw_sky(graphics_state)
    {

      this.sky_model_transform = Mat4.identity().times(Mat4.scale(Vec.of(470,470,470)));
      //this.sky_model_transform = this.sky_model_transform.times(Vec.of(0,0,0,1));
      this.shapes.sky.draw(graphics_state, this.sky_model_transform, this.materials.sky);

      // this.sky_model_transform = Mat4.identity()
      //                                           .times(Mat4.translation(Vec.of(0, 20, 0)))
      //                                           .times(Mat4.rotation(Math.PI/2, Vec.of(1,0,0) ))
      //                                           .times(Mat4.scale(Vec.of(50,50,10)))
      //                                           ;
      // for (var v=0; v<10; v++){
      //     for (var h=0; h<10; h++){
      //         this.shapes.square.draw(graphics_state, this.sky_model_transform, this.materials.sky);    
      //         this.sky_model_transform = this.sky_model_transform.times(Mat4.translation(Vec.of(2,0,0) ));
      //     }
      //     this.sky_model_transform = this.sky_model_transform.times(Mat4.translation(Vec.of(-2*h,2,0) ));
      // }
    }
    power_collision(){
        //function setRegion_square( location, road_mt_stack )
       //function setRegion_square( location, road_mt_stack )
       if (this.inRegion_power(this.car_location, this.power_stack) == true ){

        this.power += 1;
        return;
        
    }else{
        this.power = this.power;
    }

    }

    inRegion_power( location, road_mt_stack ){
      for (var i=0; i<road_mt_stack.length; i++){
        var point = Mat4.inverse(road_mt_stack[i]).times(location);
        var x = point[2];
        var y = point[0];
        if (!( x < -1 || x > 1 ||  y < -1.1 || y > 1.1 )){ //not outside the square, inside the square
          return true;
        }
        if (i == road_mt_stack.length){
          return false;
        } 
      }   
      return false; 
    }
    
  draw_power(){

}


    display( graphics_state )
      {

        graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;


        this.draw_sky(graphics_state);  
        this.draw_map(graphics_state);  
        this.draw_box(graphics_state, dt);   
        this.draw_tree(graphics_state);
        this.draw_road(graphics_state);
        this.displayUI();
        //this.draw_power(graphics_state);

      }
     
      start(){
          var element = document.getElementById("startScreen");
             element. parentNode.removeChild(element);
             this.go = 1;
            //this.speed += 0.3; 
      }
    

      displayUI()
      {
            var score = document.getElementById("score");
            score.innerHTML = this.wall_hit;
            var speed = document.getElementById("health");
            for (var i=120; i>0; i=i-5){
            var temp = Math.abs(Math.round(this.speed) +i);
            speed.innerHTML =  Math.min(120, Math.max(0, temp));
          
          }
          var power = document.getElementById("power");
            power.innerHTML = this.power;


           // var gameOver = document.getElementById("gameover");
           // var health = document.getElementById("health");
           // health.style.color = "#FF0000";
          //  health.innerHTML = '<img src="assets/img/full_heart.png"> </img>'.repeat(this.health);
          //  health.innerHTML += '<img src="assets/img/empty_heart.png"> </img>'.repeat(3-this.health);
            //if(this.gameOver)
          //  {
                  
               //   gameOver.innerHTML = "Game Over. Press (p) to restart";
        //    }
        //    else
        //    {
                //  gameOver.innerHTML = "";
        //    }

      }


      
  }

  
