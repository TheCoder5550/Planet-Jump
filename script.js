var c = new GameCanvas('gc');
c.hideScrollBar();
c.lockScrollOnIpad();
c.setSize(window.innerWidth, window.innerHeight);

var circleImg = document.getElementById("circleImg");

var paused = false;
var gameState = "MENU";

//Menu Vars
var menuClickedOutside = false;
var menuClickedInside = false;
var menuNewClick = false;
var playScale = 1;

//Game Vars
var player = {
  x: 0,
  y: 0,
  size: 25,
  color: "red",
  angle: 0,
  vAngle: 0,
  currentCircle: -1,
  moveSpeed: 13
};
var circles = [];
var transY = 0;
var playerIsMoving = false;
var score = 0;
var deadCountdown = 0;
var dead = false;
var savedTransY = 0;
var stars = [];
var highscore = 0;

for (var i = 0; i < 1000; i++) {
  (i > 5 && c.random(0, 4) == 1) ? moveSpeed = (c.random(5, 10)/100) : moveSpeed = 0;
  var x = c.random(100, c.width-100);
  
  circles.push({
    x: x,
    startX: x,
    y: c.height -100 - i * 250,
    size: c.random(40 - Math.min(i/10, 10), 50 - Math.min(i/10, 10)) * 1.5,
    color: "hsla(" + (300 + i*3) + ", 100%, 30%, 0.5)",
    moveSpeed: moveSpeed,
    vAngle: moveSpeed > 0 ? c.random(0, 360) : 0,
    moveDist: c.random(50, 150)
  });
}

for (var i = 0; i < 200; i++) {
  var x = c.random(0, c.width);
  var y = c.random(0, c.height);
  
  stars.push({
    x: x,
    startY: y,
    y: y,
    lastY: y,
    size: c.random(1, 3)/2
  });
}

player.x = circles[0].x;
player.y = circles[0].y;
player.currentCircle = 0;

if (!c.getCookie("highscore"))
  c.setCookie("highscore", 0, 365*25);
else
  highscore = parseInt(c.getCookie("highscore"));

loop();
function loop() {
  c.updateFPS();
  c.background("rgba(25, 25, 25, 1)");
  
  if (!paused)
    updateGame();
  renderGame();
  
  if (window.innerHeight < window.innerWidth || window.matchMedia("(orientation: landscape)").matches || window.innerWidth < window.innerHeight/2) {
    if (!paused)
      paused = true;
    waitForPortrait();
  }
  else
    paused = false;
  
  //c.text(100, 100, 20, c.fpsScaler, "red");
  
  requestAnimationFrame(loop);
}

function updateGame() {
  if (gameState == "MENU") {
    var w = c.width * 0.34;
    var h = w / 2;

    if (c.mouse.x > c.width/2 - w / 2 && c.mouse.x < c.width/2 + w / 2 &&
        c.mouse.y > c.height/4 * 3 - h / 2 && c.mouse.y < c.height/4 * 3 + h / 2 &&
        c.mouse.click) {
      playScale = 0.95;
    }
    else {
      playScale = 1;
    }

    if (c.mouse.click) {
      if (c.mouse.x > c.width/2 - w / 2 && c.mouse.x < c.width/2 + w / 2 &&
          c.mouse.y > c.height/4 * 3 - h / 2 && c.mouse.y < c.height/4 * 3 + h / 2 &&
          !menuClickedOutside) {
        menuClickedInside = true;
        menuClickedOutside = false;
      }
      else {
        menuClickedOutside = true;
        menuClickedInside = false;
      }
      menuNewClick = false;
    }
    else {
      if (menuClickedInside && !menuClickedOutside && !menuNewClick) {
        gameState = "PLAY";
        menuNewClick = true;
        menuClickedOutside = false;
      }
      menuClickedOutside = false;
    }
  }
  else if (gameState == "PLAY") {
    if (!playerIsMoving) {
      player.vAngle += (0.05 + score/1000 * c.fpsScaler);

      var a = c.angle(player.x, player.y, circles[player.currentCircle + 1].startX, circles[player.currentCircle + 1].y);
      player.angle = a + Math.sin(player.vAngle) * 35;
    }
    else {
      player.x += Math.cos(player.angle * Math.PI / 180) * player.moveSpeed * c.fpsScaler;
      player.y += Math.sin(player.angle * Math.PI / 180) * player.moveSpeed * c.fpsScaler;
      
      if (c.distance(player.x, player.y, circles[player.currentCircle + 1].x, circles[player.currentCircle + 1].y) < circles[player.currentCircle + 1].size + player.size/2) {
        player.x = circles[player.currentCircle + 1].x;
        player.y = circles[player.currentCircle + 1].y;
        player.currentCircle++;
        playerIsMoving = false;
        score++;
        
        if (score > highscore) {
          highscore = score;
          c.setCookie("highscore", highscore, 365*25);
        }
      }
      
      if (c.distance(player.x, player.y, circles[player.currentCircle].x, circles[player.currentCircle ].y) > c.distance(circles[player.currentCircle ].x, circles[player.currentCircle].y, circles[player.currentCircle + 1].x, circles[player.currentCircle + 1].y) * 1.5) {
        dead = true;
      }
    }
    
    if (dead) {
      deadCountdown += 1 * c.fpsScaler;
      
      if (deadCountdown >= 75) {
        dead = false;
        playerIsMoving = false;
        deadCountdown = 0;
        gameState = "MENU";
        score = 0;
        transY = 0;
        stars = [];
        for (var i = 0; i < 200; i++) {
          var x = c.random(0, c.width);
          var y = c.random(0, c.height);

          stars.push({
            x: x,
            startY: y,
            y: y,
            lastY: y,
            size: c.random(1, 3)/2
          });
        }
        
        circles = [];
        for (var i = 0; i < 1000; i++) {
          (i > 5 && c.random(0, 4) == 1) ? moveSpeed = (c.random(5, 10)/100) : moveSpeed = 0;
          var x = c.random(100, c.width-100);

          circles.push({
            x: x,
            startX: x,
            y: c.height -100 - i * 250,
            size: c.random(40 - Math.min(i/10, 10), 50 - Math.min(i/10, 10)) * 1.5,
            color: "hsla(" + (300 + i*3) + ", 100%, 30%, 0.5)",
            moveSpeed: moveSpeed,
            vAngle: moveSpeed > 0 ? c.random(0, 360) : 0,
            moveDist: c.random(50, 150)
          });
        }
        
        player.x = circles[0].x;
        player.y = circles[0].y;
        player.currentCircle = 0;
      }
    }
    
    if (c.mouse.click && !playerIsMoving) {
      playerIsMoving = true;
    }
    
    for (var i = 0; i < circles.length; i++) {
      var ci = circles[i];
      if (player.currentCircle != i)
        ci.vAngle += ci.moveSpeed * c.fpsScaler;
      ci.x = ci.startX + Math.sin(ci.vAngle) * ci.moveDist;
    }
    
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.y = (s.startY - transY / 5);
      
      if (s.y > c.height) {
        s.x = c.random(0, c.width);
        s.y = 0;
        s.startY = 0 + transY;
        s.lastY = 0;
        s.size = c.random(1, 3)/2;
      }
    }
    
    if (!dead)
      transY -= Math.abs((player.y - c.height + 100) - transY) / 8 * c.fpsScaler;
  }
}

function renderGame() {
  if (gameState == "MENU") {
    var w = c.width/1.5;
    var h = w * 0.6;
    
    c.ctx.textAlign = "center";
    c.textMode("bold");
    c.text(c.width/2, c.height/4, 150, "PLANET", "white");
    c.text(c.width/2, c.height/4+150, 150, "JUMP", "white");
    c.textMode();
    
    c.ctx.textAlign = "center";
    c.text(c.width/2, c.height/8*7, 50, "HIGHSCORE", "white");
    c.text(c.width/2, c.height/8*7+50, 50, highscore, "white");
    
    c.ctx.strokeStyle = "rgb(199,21,133)";
    c.ctx.lineWidth = Math.round(c.width * 0.011) / 2;
    var w = c.width * 0.34 * playScale;
    var h = w / 2;
    roundRect(Math.round(c.width/2 - w / 2), Math.round(c.height/4*3 - h / 2), w, h, 5);
    w *= 0.93;
    h *= 0.85;
    c.ctx.strokeStyle = "rgb(255,20,147)";
    roundRect(Math.round(c.width/2 - w / 2), Math.round(c.height/4*3 - h / 2), w, h, 5);
    
    c.ctx.textAlign = "center";
    c.ctx.textBaseline = "middle";
    c.textMode("bold");
    c.text(c.width/2, c.height/4*3, w/3.5, "PLAY", "rgb(255,105,180)");
    c.textMode();
    c.ctx.textAlign = "left";
    c.ctx.textBaseline = "alfabetic";
  }
  else if (gameState == "PLAY") {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      c.circle(s.x, s.y, s.size, "white");
      c.line(s.x, s.y, s.x, s.lastY, s.size*2, "white");
      s.lastY = s.y;
    }
    
    for (var i = 0; i < circles.length; i++) {
      var ci = circles[i];
      if (ci.y + ci.size - transY > 0 && ci.y - ci.size - transY < c.height) {
        c.ctx.drawImage(circleImg, ci.x - ci.size, ci.y - ci.size - transY, ci.size * 2, ci.size * 2);
        c.circle(ci.x, ci.y - transY, ci.size, ci.color);
      }
    }
    
    c.circle(player.x, player.y - transY, player.size, player.color);
    
    if (!playerIsMoving)
      c.line(player.x, player.y - transY, player.x + Math.cos(player.angle * Math.PI / 180) * 100, player.y + Math.sin(player.angle * Math.PI / 180) * 100 - transY, 2, "red");
    
    c.ctx.textAlign = "center";
    c.textMode("bold");
    c.text(c.width/2, c.height/6, 70, "SCORE", "white");
    c.text(c.width/2, c.height/6+70, 70, score, "white");
    c.textMode();
  }
}

function waitForPortrait() {
  c.rect(0, 0, c.width, c.height, "rgba(0, 0, 0, 0.25)");
  
  c.ctx.textAlign = "center";
  c.ctx.textBaseline = "middle";
  c.text(c.width/2, c.height/2, 50, "Please turn your device", "white");
  c.ctx.textAlign = "left";
  c.ctx.textBaseline = "alfabetic";
}

function roundRect(x, y, width, height, radius) {
  radius = {tl: radius, tr: radius, br: radius, bl: radius};
  c.ctx.beginPath();
  c.ctx.moveTo(x + radius.tl, y);
  c.ctx.lineTo(x + width - radius.tr, y);
  c.ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  c.ctx.lineTo(x + width, y + height - radius.br);
  c.ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  c.ctx.lineTo(x + radius.bl, y + height);
  c.ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  c.ctx.lineTo(x, y + radius.tl);
  c.ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  c.ctx.closePath();
  c.ctx.stroke();
}

function onResize() {
  c.setSize(window.innerWidth, window.innerHeight);
}

document.addEventListener('touchmove', function (event) {
  if (event.scale !== 1) { event.preventDefault(); }
}, false);

document.addEventListener('contextmenu', event => event.preventDefault());