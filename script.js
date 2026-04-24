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
const cangurElement = document.getElementById("cangur")
let cangur = {x:0,y:0,rotation:0,segment:0,ring:0}
function drawCangur(){
   if(grid_type_select.value=="disc"){
      cangurElement.style.setProperty(`transform`,`rotate(${cangur.segment*(360/Number(segments_input.value))}deg) translateX(${cangur.ring*32}px)`)
      console.log(`rotate(${cangur.segment*(360/Number(segments_input.value))}deg) translateX(${cangur.ring*32}px)`)
   }else
      cangurElement.style.setProperty(`transform`,`translate(${cangur.x*tilesize}px,${cangur.y*tilesize}px)`)
   cangurElement.classList.remove("right","down","left","up")
   let newdir = "right";
   switch(cangur.rotation){
      case 0: newdir="right"; break;
      case 0.25: newdir="down"; break;
      case 0.5: newdir="left"; break;
      case 0.75: newdir="up"; break;
   }
   cangurElement.classList.add(newdir)
}
function jump(){
   switch(cangur.rotation){
      case 0: cangur.x++; cangur.ring++; break;
      case 0.25: cangur.y++;cangur.segment++; break;
      case 0.5: cangur.x--;cangur.ring--; break;
      case 0.75: cangur.y--;cangur.segment--; break;
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
function resetDrawing(){
   function lineInit(){
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 3]);/*dashes are 5px and spaces are 3px*/
   }
   ctx.reset()
   cangur = {x:0,y:0,rotation:0,segment:0,ring:0}
   if(grid_type_select.value=="square"){
      cangurElement.classList.remove("disc")
      const width = Number(columns_input.value);
      const height = Number(rows_input.value);
      grid.width = (width+1)*tilesize
      grid.height = (height+1)*tilesize
      lineInit()
      for (let i = 0; i <= width; i++) {
         ctx.beginPath();
         ctx.moveTo(i*tilesize+0.5,0);
         ctx.lineTo(i*tilesize+0.5, grid.height-tilesize);
         ctx.stroke();
      }
      for (let i = 0; i <= height; i++) {
         ctx.beginPath();
         ctx.moveTo(0,i*tilesize+0.5);
         ctx.lineTo(grid.width-tilesize, i*tilesize+0.5);
         ctx.stroke();
      }
   }else if(grid_type_select.value=="disc"){
      cangurElement.classList.add("disc")
      const rings = Number(rings_input.value);
      const segments = Number(segments_input.value);
      grid.width = rings*64+2
      grid.height = rings*64+2
      const center = grid.width/2+0.5
      lineInit()
      const radius = rings*32+0.5
      for (let i = 1; i <= rings; i++) {
         ctx.beginPath();
         ctx.arc(center, center, i*32, 0, 2 * Math.PI);
         ctx.stroke();
      }
      const segment_angle = Math.PI*2/segments
      for (let i = 0; i < segments; i++) {
         ctx.beginPath();
         ctx.moveTo(center,center);
         const angle = segment_angle*i
         ctx.lineTo(center + Math.sin(angle+0.5*Math.PI)*radius, center + Math.cos(angle+0.5*Math.PI)*radius);
         ctx.stroke();
      }
   }
   drawCangur()
}
;[reset_drawing_button,grid_type_select,rings_input,segments_input].forEach(
   input=>input.addEventListener("click",resetDrawing)
)
resetDrawing()
drawCangur()