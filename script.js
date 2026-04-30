const grid = document.getElementById("grid")
const ctx = grid.getContext("2d")
const grid_type_select = document.getElementById("grid-type")
const reset_drawing_button = document.getElementById("reset_drawing_button")
const step_button = document.getElementById("step_button")
const jump_button = document.getElementById("jump_button")
const rotate_button = document.getElementById("rotate_button")
const run_button = document.getElementById("run_button")
const stop_button = document.getElementById("stop_button")
const iterate_button = document.getElementById("iterate_button")
const iterations_speed_input = document.getElementById("iterations_speed")
const manual_mode_input = document.getElementById("manual_mode")
const code_textarea = document.getElementById("cod")
const advanced_quickcode = document.getElementById("advanced_quickcode")
const instructions_button = document.getElementById("instructions_button")
const instructions_dialog = document.getElementById("instructions")
const columns_input_label = document.getElementById("columns_input_label")
const columns_input = document.getElementById("columns_input")
const rows_input_label = document.getElementById("rows_input_label")
const rows_input = document.getElementById("rows_input")
const rings_input_label = document.getElementById("rings_input_label")
const rings_input = document.getElementById("rings_input")
const segments_input_label = document.getElementById("segments_input_label")
const segments_input = document.getElementById("segments_input")
const cangurElement = document.getElementById("cangur")

const tilesize = 28
const discRingSize = 32
const allowedConditions = new Set([
   "E_MARGINE",
   "NU E_MARGINE",
   "E_LINIE",
   "NU E_LINIE",
])
const advanced_controls = Array.from(
   advanced_quickcode.querySelectorAll("button, input, select")
)

let cangur = { x: 0, y: 0, rotation: 0, segment: 0, ring: 0 }
let drawn_edges = new Set()
let line_positions = new Set()
let is_line = false
let is_edge = false
let program_runtime = null
let program_interval_id = null

function isDiscMode() {
   return grid_type_select.value === "disc"
}

function getColumns() {
   return Number(columns_input.value)
}

function getRows() {
   return Number(rows_input.value)
}

function getRings() {
   return Number(rings_input.value)
}

function getSegments() {
   return Math.max(1, Number(segments_input.value))
}

function normalizeSegment(segment) {
   const segments = getSegments()
   return ((segment % segments) + segments) % segments
}

function cloneCangur(state = cangur) {
   return {
      x: state.x,
      y: state.y,
      rotation: state.rotation,
      segment: state.segment,
      ring: state.ring,
   }
}

function updateGridTypeInputs() {
   if (isDiscMode()) {
      columns_input_label.style.setProperty("display", "none")
      rows_input_label.style.setProperty("display", "none")
      rings_input_label.style.setProperty("display", "initial")
      segments_input_label.style.setProperty("display", "initial")
      cangurElement.classList.add("disc")
   } else {
      columns_input_label.style.setProperty("display", "initial")
      rows_input_label.style.setProperty("display", "initial")
      rings_input_label.style.setProperty("display", "none")
      segments_input_label.style.setProperty("display", "none")
      cangurElement.classList.remove("disc")
   }
}

function getCurrentPositionKey(state = cangur) {
   if (isDiscMode()) {
      if (state.ring === 0) {
         return "disc:center"
      }

      return `disc:${state.ring}:${normalizeSegment(state.segment)}`
   }

   return `grid:${state.x}:${state.y}`
}

function isFacingEdge(state = cangur) {
   if (isDiscMode()) {
      if (state.rotation === 0) {
         return state.ring >= getRings()
      }

      if (state.rotation === 0.5) {
         return state.ring <= 0
      }

      return false
   }

   if (state.rotation === 0) {
      return state.x >= getColumns()
   }

   if (state.rotation === 0.25) {
      return state.y >= getRows()
   }

   if (state.rotation === 0.5) {
      return state.x <= 0
   }

   return state.y <= 0
}

function updateStateFlags() {
   is_edge = isFacingEdge()
   is_line = line_positions.has(getCurrentPositionKey())
}

function drawCangur() {
   if (isDiscMode()) {
      cangur.segment = normalizeSegment(cangur.segment)
      cangurElement.style.setProperty(
         "transform",
         `rotate(${cangur.segment * (360 / getSegments())}deg) translateX(${cangur.ring * discRingSize}px)`
      )
   } else {
      cangurElement.style.setProperty(
         "transform",
         `translate(${cangur.x * tilesize}px,${cangur.y * tilesize}px)`
      )
   }

   cangurElement.classList.remove("right", "down", "left", "up")

   let newdir = "right"

   switch (cangur.rotation) {
      case 0:
         newdir = "right"
         break
      case 0.25:
         newdir = "down"
         break
      case 0.5:
         newdir = "left"
         break
      case 0.75:
         newdir = "up"
         break
   }

   cangurElement.classList.add(newdir)
}

function getDiscCenter() {
   return grid.width / 2 + 0.5
}

function getDiscPoint(ring, segment) {
   const center = getDiscCenter()

   if (ring === 0) {
      return { x: center, y: center }
   }

   const angle = normalizeSegment(segment) * (Math.PI * 2 / getSegments())
   const radius = ring * discRingSize

   return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
   }
}

function registerDrawnEdge(edgeKey, startKey, endKey) {
   if (drawn_edges.has(edgeKey)) {
      return
   }

   drawn_edges.add(edgeKey)
   line_positions.add(startKey)
   line_positions.add(endKey)
}

function getGridEdgeKey(start, end) {
   const a = `${start.x},${start.y}`
   const b = `${end.x},${end.y}`
   return a < b ? `grid:${a}|${b}` : `grid:${b}|${a}`
}

function getDiscEdgeKey(start, end) {
   if (start.ring !== end.ring) {
      const radialSegment =
         start.ring === 0 ? normalizeSegment(end.segment) : normalizeSegment(start.segment)
      const minRing = Math.min(start.ring, end.ring)
      const maxRing = Math.max(start.ring, end.ring)
      return `disc:radial:${radialSegment}:${minRing}:${maxRing}`
   }

   const a = normalizeSegment(start.segment)
   const b = normalizeSegment(end.segment)
   const low = Math.min(a, b)
   const high = Math.max(a, b)
   return `disc:arc:${start.ring}:${low}:${high}`
}

function drawMovementTrace(start, end) {
   ctx.strokeStyle = "black"
   ctx.lineWidth = 2
   ctx.setLineDash([])

   if (!isDiscMode()) {
      ctx.beginPath()
      ctx.moveTo(start.x * tilesize + 0.5, start.y * tilesize + 0.5)
      ctx.lineTo(end.x * tilesize + 0.5, end.y * tilesize + 0.5)
      ctx.stroke()

      registerDrawnEdge(
         getGridEdgeKey(start, end),
         getCurrentPositionKey(start),
         getCurrentPositionKey(end)
      )
      return
   }

   if (start.ring !== end.ring) {
      const startPoint = getDiscPoint(start.ring, start.segment)
      const endPoint = getDiscPoint(end.ring, end.segment)

      ctx.beginPath()
      ctx.moveTo(startPoint.x, startPoint.y)
      ctx.lineTo(endPoint.x, endPoint.y)
      ctx.stroke()

      registerDrawnEdge(
         getDiscEdgeKey(start, end),
         getCurrentPositionKey(start),
         getCurrentPositionKey(end)
      )
      return
   }

   if (start.ring === 0) {
      return
   }

   const radius = start.ring * discRingSize
   const angleStep = Math.PI * 2 / getSegments()
   const startAngle = normalizeSegment(start.segment) * angleStep
   const endAngle = normalizeSegment(end.segment) * angleStep
   const counterclockwise = cangur.rotation === 0.75

   ctx.beginPath()
   ctx.arc(getDiscCenter(), getDiscCenter(), radius, startAngle, endAngle, counterclockwise)
   ctx.stroke()

   registerDrawnEdge(
      getDiscEdgeKey(start, end),
      getCurrentPositionKey(start),
      getCurrentPositionKey(end)
   )
}

function getNextState(state = cangur) {
   const next = cloneCangur(state)

   if (isDiscMode()) {
      switch (state.rotation) {
         case 0:
            next.ring += 1
            break
         case 0.25:
            next.segment = normalizeSegment(next.segment + 1)
            break
         case 0.5:
            next.ring -= 1
            break
         case 0.75:
            next.segment = normalizeSegment(next.segment - 1)
            break
      }

      return next
   }

   switch (state.rotation) {
      case 0:
         next.x += 1
         break
      case 0.25:
         next.y += 1
         break
      case 0.5:
         next.x -= 1
         break
      case 0.75:
         next.y -= 1
         break
   }

   return next
}

function moveCangur({ drawTrace }) {
   if (isFacingEdge()) {
      window.alert("Cangurul nu poate trece dincolo de marginea grilei.")
      updateStateFlags()
      return false
   }

   const start = cloneCangur()
   const end = getNextState(start)

   if (drawTrace) {
      drawMovementTrace(start, end)
   }

   cangur = end
   drawCangur()
   updateStateFlags()
   return true
}

function jump() {
   return moveCangur({ drawTrace: false })
}

function step() {
   return moveCangur({ drawTrace: true })
}

function rotate() {
   cangur.rotation = (cangur.rotation + 0.25) % 1
   drawCangur()
   updateStateFlags()
}

function lineInit() {
   ctx.strokeStyle = "yellow"
   ctx.lineWidth = 1
   ctx.setLineDash([5, 3])
}

function stopProgram() {
   if (program_interval_id !== null) {
      clearInterval(program_interval_id)
      program_interval_id = null
   }

   program_runtime = null
   run_button.style.setProperty("display", "initial")
   iterate_button.style.setProperty("display", "initial")
   stop_button.style.setProperty("display", "none")
   stop_button.disabled = true
   code_textarea.style.setProperty("display", "block")
}

function resetDrawing() {
   stopProgram()

   if (typeof ctx.reset === "function") {
      ctx.reset()
   } else {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, grid.width, grid.height)
   }

   drawn_edges = new Set()
   line_positions = new Set()
   cangur = { x: 0, y: 0, rotation: 0, segment: 0, ring: 0 }
   updateGridTypeInputs()

   if (isDiscMode()) {
      const rings = getRings()
      const segments = getSegments()

      grid.width = rings * discRingSize * 2 + 2
      grid.height = rings * discRingSize * 2 + 2

      const center = getDiscCenter()
      const radius = rings * discRingSize + 0.5

      lineInit()

      for (let i = 1; i <= rings; i += 1) {
         ctx.beginPath()
         ctx.arc(center, center, i * discRingSize, 0, 2 * Math.PI)
         ctx.stroke()
      }

      const segment_angle = Math.PI * 2 / segments

      for (let i = 0; i < segments; i += 1) {
         const angle = segment_angle * i

         ctx.beginPath()
         ctx.moveTo(
            center + Math.cos(angle) * discRingSize,
            center + Math.sin(angle) * discRingSize
         )
         ctx.lineTo(
            center + Math.cos(angle) * radius,
            center + Math.sin(angle) * radius
         )
         ctx.stroke()
      }
   } else {
      const width = getColumns()
      const height = getRows()

      grid.width = (width + 1) * tilesize
      grid.height = (height + 1) * tilesize

      lineInit()

      for (let x = 0; x <= width; x += 1) {
         ctx.beginPath()
         ctx.moveTo(x * tilesize + 0.5, 0)
         ctx.lineTo(x * tilesize + 0.5, grid.height - tilesize)
         ctx.stroke()
      }

      for (let y = 0; y <= height; y += 1) {
         ctx.beginPath()
         ctx.moveTo(0, y * tilesize + 0.5)
         ctx.lineTo(grid.width - tilesize, y * tilesize + 0.5)
         ctx.stroke()
      }
   }

   drawCangur()
   updateStateFlags()
   syncManualModeUI()
}

function insertCodeAtCursor(text) {
   if (manual_mode_input.checked || code_textarea.disabled) {
      return
   }

   const start = code_textarea.selectionStart ?? code_textarea.value.length
   const end = code_textarea.selectionEnd ?? code_textarea.value.length

   code_textarea.value =
      code_textarea.value.slice(0, start) + text + code_textarea.value.slice(end)

   const caret = start + text.length
   code_textarea.focus()
   code_textarea.setSelectionRange(caret, caret)
   program_runtime = null
}

function getAdvancedTemplate(button) {
   const template = button.dataset.template

   if (template === "repeat") {
      const count = button.querySelector("input")?.value || "1"
      return `REPETA ${count} ORI\n PAS\nSFIRSITUL REPETARII\n`
   }

   if (template === "procedure") {
      const name = button.querySelector("input")?.value.trim() || "procedura_noua"
      return `PROCEDURA ${name}\n PAS\nSFIRSITUL PROCEDURII\n`
   }

   if (template === "execute") {
      const name = button.querySelector("input")?.value.trim() || "procedura_noua"
      return `EXECUTA ${name}\n`
   }

   if (template === "while") {
      const condition = button.querySelector("select")?.value || "E_MARGINE"
      return `CIT ${condition}\n PAS\nSFIRSITUL CICLULUI\n`
   }

   const condition = button.querySelector("select")?.value || "E_MARGINE"
   return `DACA ${condition} ATUNCI\n PAS\nALTFEL\n ROTIRE\n`
}

function syncManualModeUI() {
   const manualMode = manual_mode_input.checked

   for (const control of advanced_controls) {
      control.disabled = manualMode
   }

   code_textarea.disabled = manualMode
}

function normalizeCondition(condition, lineNumber) {
   const normalized = condition.trim().replace(/\s+/g, " ").toUpperCase()

   if (!allowedConditions.has(normalized)) {
      throw new Error(`Conditie necunoscuta la linia ${lineNumber}: ${condition}`)
   }

   return normalized
}

function parseProgram(source) {
   const rawLines = source
      .replace(/\r/g, "")
      .replace(/\[/g, "\n[\n")
      .replace(/\]/g, "\n]\n")
      .split("\n")
   const lines = []

   for (let index = 0; index < rawLines.length; index += 1) {
      const text = rawLines[index].trim()

      if (text) {
         lines.push({ text, lineNumber: index + 1 })
      }
   }

   const parser = { lines, index: 0 }
   const procedures = new Map()
   let main = null

   while (!isAtEnd(parser)) {
      const current = peek(parser)

      if (current.text === "[") {
         if (main !== null) {
            throw new Error(`Exista deja un bloc principal inainte de linia ${current.lineNumber}.`)
         }

         advance(parser)
         const statements = parseBlock(parser, new Set(["]"]), "Lipseste ] pentru blocul principal.")
         expect(parser, "]", "Lipseste ] pentru blocul principal.")
         advance(parser)
         main = { type: "block", statements, lineNumber: current.lineNumber }
         continue
      }

      if (/^PROCEDURA\s+/i.test(current.text)) {
         const match = current.text.match(/^PROCEDURA\s+(.+)$/i)
         const name = match?.[1]?.trim()

         if (!name) {
            throw new Error(`Numele procedurii lipseste la linia ${current.lineNumber}.`)
         }

         if (procedures.has(name)) {
            throw new Error(`Procedura ${name} este definita de mai multe ori.`)
         }

         advance(parser)
         const body = parseBlock(
            parser,
            new Set(["SFIRSITUL PROCEDURII"]),
            `Lipseste SFIRSITUL PROCEDURII pentru procedura ${name}.`
         )
         expect(
            parser,
            "SFIRSITUL PROCEDURII",
            `Lipseste SFIRSITUL PROCEDURII pentru procedura ${name}.`
         )
         advance(parser)
         procedures.set(name, {
            type: "procedure",
            name,
            body: { type: "block", statements: body, lineNumber: current.lineNumber },
            lineNumber: current.lineNumber,
         })
         continue
      }

      throw new Error(`Comanda necunoscuta la linia ${current.lineNumber}: ${current.text}`)
   }

   if (main === null) {
      throw new Error("Lipseste blocul principal delimitat cu [ si ].")
   }

   validateProcedureCalls(main, procedures)

   for (const procedure of procedures.values()) {
      validateProcedureCalls(procedure.body, procedures)
   }

   return { procedures, main }
}

function isAtEnd(parser) {
   return parser.index >= parser.lines.length
}

function peek(parser) {
   return parser.lines[parser.index]
}

function advance(parser) {
   const line = parser.lines[parser.index]
   parser.index += 1
   return line
}

function expect(parser, expectedText, errorMessage) {
   if (isAtEnd(parser) || peek(parser).text !== expectedText) {
      throw new Error(errorMessage)
   }
}

function parseBlock(parser, endTokens, missingEndMessage) {
   const statements = []

   while (!isAtEnd(parser) && !endTokens.has(peek(parser).text)) {
      statements.push(parseStatement(parser))
   }

   if (isAtEnd(parser)) {
      throw new Error(missingEndMessage)
   }

   return statements
}

function parseStatement(parser) {
   if (isAtEnd(parser)) {
      throw new Error("Programul se termina inainte de o instructiune completa.")
   }

   const current = peek(parser)
   const text = current.text

   if (text === "PAS" || text === "SALT" || text === "ROTIRE") {
      advance(parser)
      return { type: "action", action: text, lineNumber: current.lineNumber }
   }

   if (/^EXECUTA\s+/i.test(text)) {
      const match = text.match(/^EXECUTA\s+(.+)$/i)
      const name = match?.[1]?.trim()

      if (!name) {
         throw new Error(`Lipseste numele procedurii la linia ${current.lineNumber}.`)
      }

      advance(parser)
      return { type: "call", name, lineNumber: current.lineNumber }
   }

   if (/^REPETA\s+/i.test(text)) {
      const match = text.match(/^REPETA\s+(\d+)\s+ORI$/i)

      if (!match) {
         throw new Error(`Sintaxa invalida pentru REPETA la linia ${current.lineNumber}.`)
      }

      advance(parser)
      const body = parseBlock(
         parser,
         new Set(["SFIRSITUL REPETARII"]),
         `Lipseste SFIRSITUL REPETARII pentru REPETA de la linia ${current.lineNumber}.`
      )
      expect(
         parser,
         "SFIRSITUL REPETARII",
         `Lipseste SFIRSITUL REPETARII pentru REPETA de la linia ${current.lineNumber}.`
      )
      advance(parser)

      return {
         type: "repeat",
         count: Number(match[1]),
         body: { type: "block", statements: body, lineNumber: current.lineNumber },
         lineNumber: current.lineNumber,
      }
   }

   if (/^CIT\s+/i.test(text)) {
      const match = text.match(/^CIT\s+(.+)$/i)
      const condition = normalizeCondition(match?.[1] || "", current.lineNumber)

      advance(parser)
      const body = parseBlock(
         parser,
         new Set(["SFIRSITUL CICLULUI"]),
         `Lipseste SFIRSITUL CICLULUI pentru CIT de la linia ${current.lineNumber}.`
      )
      expect(
         parser,
         "SFIRSITUL CICLULUI",
         `Lipseste SFIRSITUL CICLULUI pentru CIT de la linia ${current.lineNumber}.`
      )
      advance(parser)

      return {
         type: "while",
         condition,
         body: { type: "block", statements: body, lineNumber: current.lineNumber },
         lineNumber: current.lineNumber,
      }
   }

   if (/^DACA\s+/i.test(text)) {
      const match = text.match(/^DACA\s+(.+)\s+ATUNCI$/i)

      if (!match) {
         throw new Error(`Sintaxa invalida pentru DACA la linia ${current.lineNumber}.`)
      }

      const condition = normalizeCondition(match[1], current.lineNumber)
      advance(parser)
      const thenBranch = parseStatement(parser)
      let elseBranch = null

      if (!isAtEnd(parser) && peek(parser).text === "ALTFEL") {
         advance(parser)
         elseBranch = parseStatement(parser)
      }

      return {
         type: "if",
         condition,
         thenBranch,
         elseBranch,
         lineNumber: current.lineNumber,
      }
   }

   if (text === "ALTFEL") {
      throw new Error(`ALTFEL fara DACA la linia ${current.lineNumber}.`)
   }

   if (
      text === "SFIRSITUL PROCEDURII" ||
      text === "SFIRSITUL REPETARII" ||
      text === "SFIRSITUL CICLULUI" ||
      text === "]"
   ) {
      throw new Error(`Inchidere neasteptata la linia ${current.lineNumber}: ${text}`)
   }

   throw new Error(`Comanda necunoscuta la linia ${current.lineNumber}: ${text}`)
}

function validateProcedureCalls(node, procedures) {
   if (!node) {
      return
   }

   if (node.type === "block") {
      for (const statement of node.statements) {
         validateProcedureCalls(statement, procedures)
      }
      return
   }

   if (node.type === "call") {
      if (!procedures.has(node.name)) {
         throw new Error(`Procedura necunoscuta la linia ${node.lineNumber}: ${node.name}`)
      }
      return
   }

   if (node.type === "repeat" || node.type === "while") {
      validateProcedureCalls(node.body, procedures)
      return
   }

   if (node.type === "if") {
      validateProcedureCalls(node.thenBranch, procedures)
      validateProcedureCalls(node.elseBranch, procedures)
   }
}

function evaluateCondition(condition) {
   switch (condition) {
      case "E_MARGINE":
         return is_edge
      case "NU E_MARGINE":
         return !is_edge
      case "E_LINIE":
         return is_line
      case "NU E_LINIE":
         return !is_line
      default:
         throw new Error(`Conditie necunoscuta la executie: ${condition}`)
   }
}

function* runBlock(block, program, callStack = []) {
   for (const statement of block.statements) {
      yield* runStatement(statement, program, callStack)
   }
}

function* runStatement(statement, program, callStack = []) {
   if (statement.type === "action") {
      yield statement
      return
   }

   if (statement.type === "repeat") {
      for (let iteration = 0; iteration < statement.count; iteration += 1) {
         yield* runBlock(statement.body, program, callStack)
      }
      return
   }

   if (statement.type === "while") {
      while (evaluateCondition(statement.condition)) {
         yield* runBlock(statement.body, program, callStack)
      }
      return
   }

   if (statement.type === "if") {
      if (evaluateCondition(statement.condition)) {
         yield* runStatement(statement.thenBranch, program, callStack)
      } else if (statement.elseBranch) {
         yield* runStatement(statement.elseBranch, program, callStack)
      }
      return
   }

   if (statement.type === "call") {
      if (callStack.includes(statement.name)) {
         throw new Error(`Recursia nu este suportata pentru procedura ${statement.name}.`)
      }

      const procedure = program.procedures.get(statement.name)

      if (!procedure) {
         throw new Error(`Procedura necunoscuta la executie: ${statement.name}`)
      }

      yield* runBlock(procedure.body, program, [...callStack, statement.name])
   }
}

function executePrimitive(statement) {
   if (statement.action === "PAS") {
      step()
      return
   }

   if (statement.action === "SALT") {
      jump()
      return
   }

   rotate()
}

function advanceRuntime() {
   if (!program_runtime) {
      return false
   }

   try {
      const result = program_runtime.iterator.next()

      if (result.done) {
         stopProgram()
         return false
      }

      executePrimitive(result.value)
      return true
   } catch (error) {
      stopProgram()
      window.alert(error instanceof Error ? error.message : String(error))
      return false
   }
}

function initializeRuntime() {
   try {
      const program = parseProgram(code_textarea.value)
      resetDrawing()
      program_runtime = {
         program,
         iterator: runBlock(program.main, program),
      }
      return true
   } catch (error) {
      window.alert(error instanceof Error ? error.message : String(error))
      return false
   }
}

function startProgram() {
   if (!initializeRuntime()) {
      return
   }

   run_button.style.setProperty("display", "none")
   iterate_button.style.setProperty("display", "none")
   stop_button.style.setProperty("display", "initial")
   stop_button.disabled = false
   code_textarea.style.setProperty("display", "none")

   const delay = Number(iterations_speed_input.value)
   program_interval_id = setInterval(advanceRuntime, delay)
}

function iterateProgram() {
   if (!program_runtime && !initializeRuntime()) {
      return
   }

   advanceRuntime()
}

function openInstructions() {
   if (instructions_dialog.open) {
      return
   }

   if (typeof instructions_dialog.showModal === "function") {
      instructions_dialog.showModal()
      return
   }

   instructions_dialog.setAttribute("open", "")
}

grid_type_select.addEventListener("input", () => {
   updateGridTypeInputs()
   resetDrawing()
})

for (const input of [
   columns_input,
   rows_input,
   rings_input,
   segments_input,
]) {
   input.addEventListener("input", resetDrawing)
}

reset_drawing_button.addEventListener("click", resetDrawing)

step_button.addEventListener("click", () => {
   if (manual_mode_input.checked) {
      step()
      return
   }

   insertCodeAtCursor(`${step_button.dataset.code}\n`)
})

jump_button.addEventListener("click", () => {
   if (manual_mode_input.checked) {
      jump()
      return
   }

   insertCodeAtCursor(`${jump_button.dataset.code}\n`)
})

rotate_button.addEventListener("click", () => {
   if (manual_mode_input.checked) {
      rotate()
      return
   }

   insertCodeAtCursor(`${rotate_button.dataset.code}\n`)
})

for (const button of advanced_quickcode.querySelectorAll("button")) {
   button.addEventListener("click", event => {
      event.preventDefault()
      insertCodeAtCursor(getAdvancedTemplate(button))
   })
}

for (const control of advanced_quickcode.querySelectorAll("input, select")) {
   control.addEventListener("click", event => {
      event.stopPropagation()
   })
}

manual_mode_input.addEventListener("input", syncManualModeUI)
code_textarea.addEventListener("input", () => {
   program_runtime = null
})
instructions_button.addEventListener("click", openInstructions)
instructions_dialog.addEventListener("click", event => {
   if (event.target === instructions_dialog) {
      instructions_dialog.close()
   }
})
run_button.addEventListener("click", startProgram)
stop_button.addEventListener("click", stopProgram)
iterate_button.addEventListener("click", iterateProgram)
window.addEventListener("beforeunload", event => {
   event.preventDefault()
   event.returnValue = ""
})

updateGridTypeInputs()
resetDrawing()
