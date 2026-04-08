   // const type = "grid"
const width = 9;
const height = 9;
const grid = document.getElementById("grid")
const ctx = grid.getContext("2d")
function lineInit(){
   ctx.strokeStyle = "yellow";
   ctx.lineWidth = 1;
   ctx.setLineDash([5, 3]);/*dashes are 5px and spaces are 3px*/
}
grid.width = width*64
grid.height = height*64
ctx.beginPath();
ctx.moveTo(0,0.5);
ctx.lineTo(400, 0.5);
ctx.stroke();
// ctx.imageSmoothingEnabled = false;
// circular
ctx.reset()
const rings = 4;
const segments = 12;
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