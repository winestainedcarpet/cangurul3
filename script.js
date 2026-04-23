const grid = document.getElementById("grid")
const ctx = grid.getContext("2d")
const grid_type_select = document.getElementById("grid-type")
const reset_drawing_button = document.getElementById("reset_drawing_button")
const columns_input_label = document.getElementById("columns_input_label")
const columns_input = document.getElementById("columns_input")
const rows_input_label = document.getElementById("rows_input_label")
const rows_input = document.getElementById("rows_input")
const rings_input_label = document.getElementById("rings_input_label")
const rings_input = document.getElementById("rings_input")
const segments_input_label = document.getElementById("segments_input_label")
const segments_input = document.getElementById("segments_input")
grid_type_select.addEventListener("input",()=>{
   if(grid_type_select.value=="square"){
      columns_input_label.style.setProperty("display","initial")
      rows_input_label.style.setProperty("display","initial")
      rings_input_label.style.setProperty("display","none")
      segments_input_label.style.setProperty("display","none")
   }else if(grid_type_select.value=="disc"){
      columns_input_label.style.setProperty("display","none")
      rows_input_label.style.setProperty("display","none")
      rings_input_label.style.setProperty("display","initial")
      segments_input_label.style.setProperty("display","initial")
   }
})
const tilesize = 28
function resetDrawing(){
   function lineInit(){
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 3]);/*dashes are 5px and spaces are 3px*/
   }
   ctx.reset()
   if(grid_type_select.value=="square"){
      const width = Number(columns_input.value)+1;
      const height = Number(rows_input.value)+1;
      grid.width = width*tilesize
      grid.height = height*tilesize
      lineInit()
      for (let i = 0; i < width; i++) {
         ctx.beginPath();
         ctx.moveTo(i*tilesize+0.5,0);
         ctx.lineTo(i*tilesize+0.5, grid.height-tilesize);
         ctx.stroke();
      }
      for (let i = 0; i < height; i++) {
         ctx.beginPath();
         ctx.moveTo(0,i*tilesize+0.5);
         ctx.lineTo(grid.width-tilesize, i*tilesize+0.5);
         ctx.stroke();
      }
   }else if(grid_type_select.value=="disc"){
      const rings = Number(rings_input.value);
      const segments = Number(segments_input.value);
      grid.width = rings*64+2
      grid.height = rings*64+2
      const center = grid.width/2
      lineInit()
      const radius = rings*32
      for (let i = 1; i <= rings; i++) {
         ctx.beginPath();
         ctx.arc(center, center, i*32, 0, 2 * Math.PI);
         ctx.stroke();
      }
      const segment_angle = Math.PI*2/segments
      for (let i = 0; i < segments; i++) {
         ctx.beginPath();
         ctx.moveTo(grid.width/2,grid.width/2);
         const angle = segment_angle*i
         ctx.lineTo(center + Math.sin(angle)*radius, center + Math.cos(angle)*radius);
         ctx.stroke();
      }
   }
}
;[reset_drawing_button,grid_type_select].forEach(
   input=>input.addEventListener("click",resetDrawing)
)
resetDrawing()
let cangur = {x:0,y:0,rotation:0}
const cangurElement = document.getElementById("cangur")
function drawCangur(){
   cangurElement.style.setProperty(`transform`,`translate(${cangur.x*tilesize}px,${cangur.y*tilesize}px) rotate(${cangur.rotation}turn)`)
}
function jump(){
   switch(cangur.rotation){
      case 0: cangur.x++; break;
      case 0.25: cangur.y++; break;
      case 0.5: cangur.x--; break;
      case 0.75: cangur.y--; break;
   }
   drawCangur()
}
function step(){
      ctx.strokeStyle = "black";
      ctx.lineWidth = 1;ctx.setLineDash([])
         ctx.beginPath();
         ctx.moveTo(cangur.x*tilesize+0.5,cangur.y*tilesize+0.5);
         jump()
         ctx.lineTo(cangur.x*tilesize+0.5,cangur.y*tilesize+0.5);
         ctx.stroke();
   drawCangur()
}
function rotate(){
   cangur.rotation = (cangur.rotation+0.25)%1
   drawCangur()
}
   drawCangur()
step_button.addEventListener("click",step)
jump_button.addEventListener("click",jump)
rotate_button.addEventListener("click",rotate)