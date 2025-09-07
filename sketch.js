/* To Dos
- add "bar color switcher"
*/

// math functions
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice(a) {
  let random_index = randInt(0, a.length - 1);
  return a[random_index];
}

function randSubset(a, n) {
  if (n > a.length) {
    throw new Error("More elements requested than there are in the array.");
  }
  return shuffle(a).slice(0, n);
}

function equalRGB(a, b) {
  let color_a = color(a);
  let color_b = color(b);

  let r1 = color_a._getRed();
  let g1 = color_a._getGreen();
  let b1 = color_a._getBlue();

  let r2 = color_b._getRed();
  let g2 = color_b._getGreen();
  let b2 = color_b._getBlue();

  return r1 == r2 && g1 == g2 && b1 == b2;
}

function weightedRandom(items, weights) {
    let i;

    for (i = 1; i < weights.length; i++)
        weights[i] += weights[i - 1];
    
    let r = Math.random() * weights[weights.length - 1];
    
    for (i = 0; i < weights.length; i++)
        if (weights[i] > r)
            break;
    
    return items[i];
}

function triangleUP(x, y, s) {
  triangle(
    x - s / 2,
    y + s / 2 / sqrt(3),
    x,
    y - s / sqrt(3),
    x + s / 2,
    y + s / 2 / sqrt(3)
  );
}

function triangleDOWN(x, y, s) {
  triangle(
    x - s / 2,
    y - s / 2 / sqrt(3),
    x,
    y + s / sqrt(3),
    x + s / 2,
    y - s / 2 / sqrt(3)
  );
}

// set screen setting
let w = 600;
let h = w*2;
let barw = w * 0.45;
let barh = barw * 0.333;

// Ball functions

function addBall() {
  let zero_or_one = Math.random() < 0.5;
  //? 0 : 1
  
  let square_ball = {
    catch_score: 10,
    slip_score: -10,
    draw_func: square,
  };

  let round_ball = {
    catch_score: 5,
    slip_score: -2,
    draw_func: circle,
  };
  let tri_up_ball = {
    catch_score: 15,
    slip_score: -2,
    draw_func: triangleUP,
  };

  let tri_dn_ball = {
    catch_score: 2,
    slip_score: -15,
    draw_func: triangleDOWN,
  };
  
  
  let new_ball = round_ball;
  
  let ball_types = [round_ball,square_ball,tri_up_ball,tri_dn_ball]
  
  let weights_150= [75,15,5,5]
  let weights_100 = [75,15, 0,0]
  
  // select ball type
  if (score > 250) {
    new_ball = weightedRandom(ball_types, weights_150)
  } else if (score> 150){
    new_ball = weightedRandom(ball_types, weights_100)
  }

  ball_prop = 0.5 + score * 0.002;
  ball_prop = constrain(ball_prop, 0.5, 0.75);
  for (let x of [w * 0.25, w * 0.75]) {
    if (Math.random() < ball_prop) {
      let ball = {
        color: choice(game_colors),
        strokecol: fgcol,
        size: 48 * (w/300),
        x: x,
        y: randInt(-100 * (w/300), -25 * (w/300)),
        caugth: false,
        slipped: false,
        catch_score: new_ball.catch_score,
        slip_score: new_ball.slip_score,
        draw_func: new_ball.draw_func,
      };
      balls.push(ball);
    }
  }
}

function removeOldThings() {
  balls = balls.filter((b) => b.y < h * 1.5);
  bars = bars.filter((b) => b.y < h);
}

function drawBall(b) {
  push();

  strokeWeight(4 * (w/300));
  stroke(b.strokecol);
  fill(b.color);

  if (b.caugth) {
    fill(transparant_color);
    noStroke();
  }

  b.draw_func(b.x, b.y, b.size);
  pop();
}

/*
starting from score 0
balls +5 / -2

from 100 points
squares +10 / -10

from 150 points
triangleUP  +15 / -2
triangleDN  +2  / -15
*/

function catchBalls() {
  for (let ball of balls) {
    for (let bar of [lbar, rbar]) {
      let same_color = equalRGB(ball.color, bar.color);

      if (
        // caught right color
        ball.x == bar.x &&
        ball.y > h * 0.83 &&
        ball.y < h * 0.87 &&
        same_color &&
        bar.pressed &&
        !ball.caugth
      ) {
        score += ball.catch_score;
        ball.caugth = true;
        catchtime = millis();
        catchcolor = ball.color;
        catchscore = "+" + ball.catch_score;
      }

      if (
        //caught wrong color
        ball.x == bar.x &&
        ball.y > h * 0.83 &&
        ball.y < h * 0.87 &&
        !same_color &&
        bar.pressed
      ) {
        game_over = true;
      }

      if (
        // caught right color
        ball.x == bar.x &&
        ball.y > h * 0.83 &&
        ball.y < h * 0.87 &&
        same_color &&
        !bar.pressed &&
        !ball.slipped
      ) {
        score += ball.slip_score;
        ball.slipped = true;
        sliptime = millis();
        slipcolor = ball.color;
        slipscore = "" + ball.slip_score;
      }
    }
  }
}

function drawAllBalls() {
  for (let ball of balls) {
    drawBall(ball);
  }
}

function decsendAllThings() {
  // make the speed score dependent
  speed = 5 * (w/300) + score * 0.02;

  // clip speed between 2 and 15
  speed = constrain(speed, 2 * (w/300), 20 * (w/300));

  for (let b of balls) {
    b.y += speed;
  }
  for (let b of bars) {
    b.y += speed * !b.main;
  }
}

function drawCaught() {
  //  for (let b of balls) {
  let t = millis();
  let y = map(t - catchtime, 0, 500, 115 * (w/300), 90 * (w/300));
  if (t < catchtime + 500) {
    push();
    textSize(35 * (w/300));
    fill(catchcolor);
    stroke(0);
    strokeWeight(2 * (w/300));
    text(catchscore, w / 2, y);
    pop();
  }
  // }
}

function drawSlipped() {
  let t = millis();
  let y = map(t - sliptime, 0, 500, 175 * (w/300), 200 * (w/300));
  if (millis() < sliptime + 500) {
    push();
    textSize(35 * (w/300));
    fill(slipcolor);
    stroke(0);
    strokeWeight(2 * (w/300));
    text(slipscore, w / 2, y);
    pop();
  }
}

// bars functions

let bary = h * 0.85;

let lbar = {
  sf: 0.8,
  pressed: false,
  x: w * 0.25,
  y: bary,
  main: true,
};

let rbar = {
  sf: 0.8,
  pressed: false,
  x: w * 0.75,
  y: bary,
  main: true,
};

let bars = [lbar, rbar];

function drawBars() {
  for (let bar of bars) {
    //left bar
    push();
    stroke(bar.strokecol);
    strokeWeight(5 * (w/300));
    fill(bar.color);
    if (bar.y > bary) {
      fill(transparant_color);
      noStroke();
    }
    rect(bar.x, bar.y, barw * bar.sf, barh * bar.sf, 5 * (w/300));
    pop();
  }
}

function setBarTouches() {
  for (let bar of bars.slice(0, 2)) {
    bar.pressed = false;
  }

  // four touchscreens
  for (let touch of touches) {
    if (touch.x < w / 2) {
      lbar.pressed = true;
    }
    if (touch.x > w / 2) {
      rbar.pressed = true;
    }
  }

  // for keyboards
  if (keyIsDown(LEFT_ARROW)) {
    lbar.pressed = true;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    rbar.pressed = true;
  }

  for (let bar of bars.slice(0, 2)) {
    if (bar.pressed) {
      bar.strokecol = active_stroke_col;
      bar.sf = 1.05;
      bar.color.setAlpha(255);
    } else {
      bar.strokecol = inactive_stroke_col;
      bar.sf = 0.8;
      bar.color.setAlpha(180);
    }
  }
}

function addBar() {
  let bar = {
    color: color(choice(game_colors)),
    sf: 0.6,
    strokecol: fgcol,
    x: w * (0.25 + 0.5 * (Math.random() < 0.5)),
    y: randInt(-100 * (w/300), -25 * (w/300)),
    replaced: false,
    main: false,
  };
  bars.push(bar);
  setTimeout(addBar, randInt(3000, 10000));
}

function replaceBar() {
  for (let bar of bars) {
    if (
      // caught right color
      !bar.main &&
      bar.y >= h * 0.83 &&
      !bar.replaced
    ) {
      bar.replaced = true;
      if (bar.x == lbar.x) {
        lbar.color = bar.color;
      } else {
        rbar.color = bar.color;
      }
    }
  }
}

// scoring points
let score = 0;
let high_score = 0;
let catchscore, slipscore;
function drawScore() {
  high_score = max(score, high_score);
  push();
  textSize(50 * (w/300));
  fill(bgcol);
  stroke(fgcol);
  strokeWeight(4 * (w/300));
  text(score, w / 2, 150 * (w/300));
  pop();

  push();
  textAlign(LEFT, TOP);
  textSize(17 * (w/300));
  fill(bgcol);
  stroke(fgcol);
  strokeWeight(1 * (w/300));
  text("High score: " + high_score, 10 * (w/300), 10 * (w/300));
  pop();
}

function drawGameOver() {
  push();
  textSize(50 * (w/300));
  fill(fgcol);
  strokeWeight(0);
  text("Game over!", w / 2, h * 0.4);
  pop();
}

function drawPlayAgain() {
  push();
  textSize(30 * (w/300));
  fill(fgcol);
  stroke(fgcol);
  strokeWeight(0);
  text("Play Again!", w / 2, h * 0.11);
  pop();
  push();
  stroke(fgcol);
  strokeWeight(4 * (w/300));
  line(0, h * 0.14, w, h * 0.14);
}

function restart() {
  balls = [];
  score = 0;
  bars = bars.slice(0, 2);
}

function touchStarted() {}

// initalize variables

let balls = [];

let game_over = false;
let transparant_color;
let speed;
let catchtime = -Infinity,
  catchcolor;
let sliptime = -Infinity,
  slipcolor;
let fgcol, bgocl;
let inactive_stroke_col;
let active_stroke_col;

let darkmode = true;
let go_drawn = false;

let game_colors;
let ball_prop;
let cnv
function setup() {
  
  cnv=createCanvas(w,h);
  // print(img.width,img.height);
  let newCanvasX = (windowWidth- w)/2;
  let newCanvasY = 0;
  cnv.position(newCanvasX,newCanvasY)
  rectMode(CENTER);
  textAlign(CENTER);

  setInterval(addBall, 400);
  setInterval(removeOldThings, 50);
  setTimeout(addBar, 10000);

  if (darkmode) {
    fgcol = color("##8b8b8b");
    bgcol = color("#282828");
  } else {
    fgcol = color("black");
    bgcol = color("white");
  }

  game_colors = ["#D81B60", "#1E88E5", "#FFC107"];

  let [lbar_col, rbar_col] = randSubset(game_colors, 2);
  lbar.color = color(lbar_col);
  rbar.color = color(rbar_col);

  inactive_stroke_col = "#808080";
  active_stroke_col = fgcol;

  for (let bar of bars.slice(0, 2)) {
    bar.strokecol = inactive_stroke_col;
  }
  transparant_color = color(0);
  transparant_color.setAlpha(0);
  /*  testing stuff
  let arr=[{a:1,b:2},{c:3,d:4}]
  for (let o of arr.slice(0,1)){
    o.a = 9
  }
  print (arr)
  */
}

function drawFrameRateAndVersion(){
  let fps = Math.round(frameRate());
  push()
  fill(fgcol)
  noStroke()
  textSize(12*(w/300))
  textAlign(RIGHT,TOP)
  text(fps+"\nv2.3.1", w, 3*(w/300));
  pop()
}

function draw() {
  frameRate(60);

  if (!game_over) {
    background(bgcol);
    setBarTouches();
    decsendAllThings();
    replaceBar();
    catchBalls();

    drawAllBalls();
    drawBars();
    drawScore();
    drawCaught();
    drawSlipped();
  } else {
    if (!go_drawn) {
      let c1 = 255 * !darkmode;
      background(color(c1, c1, c1, 200));
      go_drawn = true;

      drawGameOver();
      drawScore();
      drawPlayAgain();
    }
    // frameRate(0);
    // while (game_over){
    for (let touch of touches) {
      if (touch.y < h * 0.14) {
        restart();
        game_over = false;
        go_drawn = false;
      }
      // }
    }
  }
  drawFrameRateAndVersion()
}
  
