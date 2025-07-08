function rand(max) {
  return Math.floor(Math.random() * max);
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function changeBrightness(factor, sprite) {
  var virtCanvas = document.createElement("canvas");
  virtCanvas.width = 500;
  virtCanvas.height = 500;
  var context = virtCanvas.getContext("2d");
  context.drawImage(sprite, 0, 0, 500, 500);

  var imgData = context.getImageData(0, 0, 500, 500);

  for (let i = 0; i < imgData.data.length; i += 4) {
    imgData.data[i] *= factor;
    imgData.data[i + 1] *= factor;
    imgData.data[i + 2] *= factor;
  }
  context.putImageData(imgData, 0, 0);

  var spriteOutput = new Image();
  spriteOutput.src = virtCanvas.toDataURL();
  virtCanvas.remove();
  return spriteOutput;
}

function displayVictoryMess(moves) {
  document.getElementById("moves").innerHTML = "You Moved " + moves + " Steps.";
  toggleVisablity("Message-Container");
}

function toggleVisablity(id) {
  const elem = document.getElementById(id);
  elem.style.visibility = elem.style.visibility === "visible" ? "hidden" : "visible";
}

function Maze(Width, Height) {
  var mazeMap;
  var width = Width;
  var height = Height;
  var startCoord, endCoord;
  var dirs = ["n", "s", "e", "w"];
  var modDir = {
    n: { y: -1, x: 0, o: "s" },
    s: { y: 1, x: 0, o: "n" },
    e: { y: 0, x: 1, o: "w" },
    w: { y: 0, x: -1, o: "e" }
  };

  this.map = () => mazeMap;
  this.startCoord = () => startCoord;
  this.endCoord = () => endCoord;

  function genMap() {
    mazeMap = new Array(height);
    for (let y = 0; y < height; y++) {
      mazeMap[y] = new Array(width);
      for (let x = 0; x < width; ++x) {
        mazeMap[y][x] = {
          n: false,
          s: false,
          e: false,
          w: false,
          visited: false,
          priorPos: null
        };
      }
    }
  }

  function defineMaze() {
    var isComp = false;
    var move = false;
    var cellsVisited = 1;
    var numLoops = 0;
    var maxLoops = 0;
    var pos = { x: 0, y: 0 };
    var numCells = width * height;
    while (!isComp) {
      move = false;
      mazeMap[pos.x][pos.y].visited = true;

      if (numLoops >= maxLoops) {
        shuffle(dirs);
        maxLoops = Math.round(rand(height / 8));
        numLoops = 0;
      }
      numLoops++;
      for (let index = 0; index < dirs.length; index++) {
        var direction = dirs[index];
        var nx = pos.x + modDir[direction].x;
        var ny = pos.y + modDir[direction].y;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          if (!mazeMap[nx][ny].visited) {
            mazeMap[pos.x][pos.y][direction] = true;
            mazeMap[nx][ny][modDir[direction].o] = true;
            mazeMap[nx][ny].priorPos = pos;
            pos = { x: nx, y: ny };
            cellsVisited++;
            move = true;
            break;
          }
        }
      }

      if (!move) {
        pos = mazeMap[pos.x][pos.y].priorPos;
      }
      if (numCells === cellsVisited) {
        isComp = true;
      }
    }
  }

  function defineStartEnd() {
    startCoord = { x: 0, y: 0 };
    endCoord = { x: height - 1, y: width - 1 };
  }

  genMap();
  defineStartEnd();
  defineMaze();
}

function DrawMaze(Maze, ctx, cellsize, endSprite = null) {
  var map = Maze.map();
  var cellSize = cellsize;
  var drawEndMethod;
  ctx.lineWidth = cellSize / 40;

  this.redrawMaze = function (size) {
    cellSize = size;
    ctx.lineWidth = cellSize / 50;
    drawMap();
    drawEndMethod();
  };

  function drawCell(xCord, yCord, cell) {
    var x = xCord * cellSize;
    var y = yCord * cellSize;

    if (!cell.n) {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y); ctx.stroke();
    }
    if (!cell.s) {
      ctx.beginPath(); ctx.moveTo(x, y + cellSize); ctx.lineTo(x + cellSize, y + cellSize); ctx.stroke();
    }
    if (!cell.e) {
      ctx.beginPath(); ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize); ctx.stroke();
    }
    if (!cell.w) {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + cellSize); ctx.stroke();
    }
  }

  function drawMap() {
    for (let x = 0; x < map.length; x++) {
      for (let y = 0; y < map[x].length; y++) {
        drawCell(x, y, map[x][y]);
      }
    }
  }

  function drawEndSprite() {
    var coord = Maze.endCoord();
    var offsetLeft = cellSize / 50;
    var offsetRight = cellSize / 25;
    ctx.drawImage(endSprite, 2, 2, endSprite.width, endSprite.height,
      coord.x * cellSize + offsetLeft,
      coord.y * cellSize + offsetLeft,
      cellSize - offsetRight,
      cellSize - offsetRight
    );
  }

  function clear() {
    var canvasSize = cellSize * map.length;
    ctx.clearRect(0, 0, canvasSize, canvasSize);
  }

  drawEndMethod = drawEndSprite;
  clear();
  drawMap();
  drawEndMethod();
}

function Player(maze, c, _cellsize, onComplete, sprite = null) {
  var ctx = c.getContext("2d");
  var drawSprite = drawSpriteImg;
  var moves = 0;
  var map = maze.map();
  var cellCoords = { x: maze.startCoord().x, y: maze.startCoord().y };
  var cellSize = _cellsize;
  var halfCellSize = cellSize / 2;
  var player = this;

  this.redrawPlayer = function (_cellsize) {
    cellSize = _cellsize;
    drawSpriteImg(cellCoords);
  };

  function drawSpriteImg(coord) {
    var offsetLeft = cellSize / 50;
    var offsetRight = cellSize / 25;
    ctx.drawImage(
      sprite, 0, 0, sprite.width, sprite.height,
      coord.x * cellSize + offsetLeft,
      coord.y * cellSize + offsetLeft,
      cellSize - offsetRight,
      cellSize - offsetRight
    );
    if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) {
      onComplete(moves);
      player.unbindKeyDown();
    }
  }

  function removeSprite(coord) {
    var offsetLeft = cellSize / 50;
    var offsetRight = cellSize / 25;
    ctx.clearRect(
      coord.x * cellSize + offsetLeft,
      coord.y * cellSize + offsetLeft,
      cellSize - offsetRight,
      cellSize - offsetRight
    );
  }

  function check(e) {
    var cell = map[cellCoords.x][cellCoords.y];
    moves++;
    switch (e.keyCode) {
      case 65: case 37: if (cell.w) { removeSprite(cellCoords); cellCoords.x--; drawSprite(cellCoords); } break;
      case 87: case 38: if (cell.n) { removeSprite(cellCoords); cellCoords.y--; drawSprite(cellCoords); } break;
      case 68: case 39: if (cell.e) { removeSprite(cellCoords); cellCoords.x++; drawSprite(cellCoords); } break;
      case 83: case 40: if (cell.s) { removeSprite(cellCoords); cellCoords.y++; drawSprite(cellCoords); } break;
    }
  }

  this.bindKeyDown = function () {
    window.addEventListener("keydown", check, false);
    $("#view").swipe({
      swipe: function (event, direction) {
        switch (direction) {
          case "up": check({ keyCode: 38 }); break;
          case "down": check({ keyCode: 40 }); break;
          case "left": check({ keyCode: 37 }); break;
          case "right": check({ keyCode: 39 }); break;
        }
      },
      threshold: 0
    });
  };

  this.unbindKeyDown = function () {
    window.removeEventListener("keydown", check, false);
    $("#view").swipe("destroy");
  };

  drawSprite(maze.startCoord());
  this.bindKeyDown();
}

// ====== MAIN SETUP ======
var mazeCanvas = document.getElementById("mazeCanvas");
var ctx = mazeCanvas.getContext("2d");
var sprite, finishSprite;
var maze, draw, player;
var cellSize;
var difficulty;

window.onload = function () {
  let viewWidth = $("#view").width();
  let viewHeight = $("#view").height();
  let size = Math.min(viewWidth, viewHeight) - Math.min(viewWidth, viewHeight) / 100;
  ctx.canvas.width = size;
  ctx.canvas.height = size;

  let completeOne = false, completeTwo = false;
  let isComplete = () => {
    if (completeOne && completeTwo) {
      setTimeout(() => makeMaze(), 500);
    }
  };

  sprite = new Image();
  sprite.src = "./key.png?" + new Date().getTime();
  sprite.setAttribute("crossOrigin", " ");
  sprite.onload = function () {
    sprite = changeBrightness(1.2, sprite);
    completeOne = true;
    isComplete();
  };

  finishSprite = new Image();
  finishSprite.src = "./home.png?" + new Date().getTime();
  finishSprite.setAttribute("crossOrigin", " ");
  finishSprite.onload = function () {
    finishSprite = changeBrightness(1.1, finishSprite);
    completeTwo = true;
    isComplete();
  };
};

window.onresize = function () {
  let viewWidth = $("#view").width();
  let viewHeight = $("#view").height();
  let size = Math.min(viewWidth, viewHeight) - Math.min(viewWidth, viewHeight) / 100;
  ctx.canvas.width = size;
  ctx.canvas.height = size;
  cellSize = mazeCanvas.width / difficulty;
  if (player) {
    draw.redrawMaze(cellSize);
    player.redrawPlayer(cellSize);
  }
};

function makeMaze() {
  if (player) {
    player.unbindKeyDown();
    player = null;
  }

  difficulty = 10; // EASY ONLY
  cellSize = mazeCanvas.width / difficulty;

  maze = new Maze(difficulty, difficulty);
  draw = new DrawMaze(maze, ctx, cellSize, finishSprite);
  player = new Player(maze, mazeCanvas, cellSize, displayVictoryMess, sprite);

  document.getElementById("mazeContainer").style.opacity = "100";
}
