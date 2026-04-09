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
function resetDrawing(){
   function lineInit(){
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 3]);/*dashes are 5px and spaces are 3px*/
   }
   ctx.reset()
   if(grid_type_select.value=="square"){
      const width = Number(columns_input.value);
      const height = Number(rows_input.value);
      grid.width = width*64
      grid.height = height*64
      ctx.beginPath();
      ctx.moveTo(0,0.5);
      ctx.lineTo(400, 0.5);
      ctx.stroke();
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
reset_drawing_button.addEventListener("click",resetDrawing)