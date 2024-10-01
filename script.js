document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');

    let isDrawing = false;
    let isErasing = false;
    let isFilling = false;
    let currentColor = '#000000';
    let currentTool = 'pencil';
    let currentShape = 'none';
    let lineWidth = 5;
    let startX, startY;

    // Initialize state tracking
    let states = [];
    let currentStateIndex = -1;

    function saveState() {
        // Trim the states array if necessary
        if (currentStateIndex < states.length - 1) {
            states = states.slice(0, currentStateIndex + 1);
        }
        states.push(canvas.toDataURL());
        currentStateIndex++;
    }

    function restoreState(index) {
        const img = new Image();
        img.src = states[index];
        img.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (currentStateIndex >= 0) {
            restoreState(currentStateIndex);
        }
    }

    // Set initial canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    document.getElementById('undo').addEventListener('click', function() {
        if (currentStateIndex > 0) {
            currentStateIndex--;
            restoreState(currentStateIndex);
        }
    });

    document.getElementById('redo').addEventListener('click', function() {
        if (currentStateIndex < states.length - 1) {
            currentStateIndex++;
            restoreState(currentStateIndex);
        }
    });

    document.getElementById('pencil').addEventListener('click', function() {
        currentTool = 'pencil';
        isErasing = false;
        isFilling = false;
        currentShape = 'none';
    });

    document.getElementById('eraser').addEventListener('click', function() {
        currentTool = 'eraser';
        isErasing = true;
        isFilling = false;
        currentShape = 'none';
    });

    document.getElementById('fill').addEventListener('click', function() {
        currentTool = 'fill';
        isErasing = false;
        isFilling = true;
        currentShape = 'none';
    });

    document.getElementById('shapeSelector').addEventListener('change', function(e) {
        currentShape = e.target.value;
        isFilling = false;
        isErasing = false;
        currentTool = 'shape';
    });

    document.getElementById('colorPicker').addEventListener('input', function(e) {
        currentColor = e.target.value;
    });

    document.getElementById('brushSize').addEventListener('input', function(e) {
        lineWidth = e.target.value;
    });

    document.getElementById('clear').addEventListener('click', function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        states = [];  // Reset states array
        currentStateIndex = -1;  // Reset state index
        saveState();  // Save blank state
    });

    document.getElementById('save').addEventListener('click', function() {
        const link = document.createElement('a');
        link.download = 'drawing.png';
        link.href = canvas.toDataURL();
        link.click();
    });

    document.getElementById('load').addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function(e) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.src = event.target.result;
                img.onload = function() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    saveState();
                };
            };
            reader.readAsDataURL(file);
        };
        input.click();
    });

    canvas.addEventListener('mousedown', function(e) {
        isDrawing = true;
        startX = e.clientX - canvas.offsetLeft;
        startY = e.clientY - canvas.offsetTop;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
    });

    canvas.addEventListener('mousemove', function(e) {
        if (!isDrawing) return;

        if (currentTool === 'pencil') {
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = currentColor;
            ctx.lineCap = 'round';
            ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
            ctx.stroke();
        } else if (currentTool === 'eraser') {
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = '#ffffff';
            ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
            ctx.stroke();
        }
    });

    canvas.addEventListener('mouseup', function(e) {
        if (!isDrawing) return;
        isDrawing = false;

        if (currentTool === 'shape' && currentShape !== 'none') {
            let endX = e.clientX - canvas.offsetLeft;
            let endY = e.clientY - canvas.offsetTop;
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = lineWidth;

            if (currentShape === 'rectangle') {
                ctx.rect(startX, startY, endX - startX, endY - startY);
            } else if (currentShape === 'square') {
                let side = Math.min(Math.abs(endX - startX), Math.abs(endY - startY));
                ctx.rect(startX, startY, side, side);
            } else if (currentShape === 'circle') {
                let radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)) / 2;
                ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
            }

            ctx.stroke();
            if (isFilling) {
                ctx.fillStyle = currentColor;
                ctx.fill();
            }
        }

        saveState();  // Save state after drawing
    });
});