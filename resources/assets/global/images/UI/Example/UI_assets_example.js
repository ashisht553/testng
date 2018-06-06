var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create });

function preload() {

    game.load.atlasJSONHash('UI', 'UI_assets.png', 'UI_assets.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);

}

function create() {

  game.stage.backgroundColor = '#36eb78';

  var home = game.add.sprite(100, 100,'UI', 'btn_home');
  home.anchor.setTo(0.1, 0.1);
  home.inputEnabled = true;
  home.events.onInputDown.add(onBtnClick, this);
  home.events.onInputUp.add(onBtnClick, this);


  var next = game.add.sprite(200, 100,'UI', 'btn_next');
  next.anchor.setTo(0.1, 0.1);
  next.inputEnabled = true;
  next.events.onInputDown.add(onBtnClick, this);
  next.events.onInputUp.add(onBtnClick, this);

  var starBar = game.add.sprite(110, 240, 'UI', 'star_bar');
  starBar.width = 500;
  starBar.height = 120;

  var star1 = game.add.sprite(200, 300,'UI', 'star_slot');
  star1.anchor.setTo(0.5, 0.5);
  var star2 = game.add.sprite(350, 300,'UI', 'star_slot');
  star2.anchor.setTo(0.5, 0.5);
  var star3 = game.add.sprite(500, 300,'UI', 'star_slot');
  star3.anchor.setTo(0.5, 0.5);
  game.time.events.loop(500, onStarTimer, this, [star1, star2, star3]);


  var up = game.add.sprite(700, 350,'UI', 'up_arrow');
  up.anchor.setTo(0.5, 0.5);
  up.inputEnabled = true;
  up.events.onInputDown.add(onBtnClick, this);
  up.events.onInputUp.add(onBtnClick, this);
  var down = game.add.sprite(700, 450,'UI', 'down_arrow');
  down.anchor.setTo(0.5, 0.5);
  down.inputEnabled = true;
  down.events.onInputDown.add(onBtnClick, this);
  down.events.onInputUp.add(onBtnClick, this);

  var bench_up = game.add.sprite(200, 400,'UI', 'bench_arrow_up');
  bench_up.anchor.setTo(0.5, 0.5);
  bench_up.inputEnabled = true;
  bench_up.events.onInputDown.add(onBtnClick, this);
  bench_up.events.onInputUp.add(onBtnClick, this);
  var bench_down = game.add.sprite(200, 470,'UI', 'bench_arrow_down');
  bench_down.anchor.setTo(0.5, 0.5);
  bench_down.inputEnabled = true;
  bench_down.events.onInputDown.add(onBtnClick, this);
  bench_down.events.onInputUp.add(onBtnClick, this);


  var grade = game.add.sprite(600, 100,'UI', 'grade');
  grade.anchor.setTo(0.5, 0.5);
  var style = { font: "24px Impact", fill: "#C05353", wordWrap: false, wordWrapWidth: grade.width, align: "left", backgroundColor: "#ffff00" };
  text = game.add.text(600, 100, "Grade 1", style);
  text.anchor.set(0.5);

}
function onBtnClick(obj)
{
  console.log(obj.frameName)
  if (obj.frameName == "btn_home"){
    obj.frameName = "btn_home_press";
    //Go to map
  }
  else if (obj.frameName == "btn_home_press"){
    obj.frameName = "btn_home";
  }
  else if (obj.frameName == "btn_next"){
    obj.frameName = "btn_next_press";
    //Go to next lvl
  }
  else if (obj.frameName == "btn_next_press"){
    obj.frameName = "btn_next";
  }
  else if (obj.frameName == "up_arrow"){
    obj.frameName = "press_arrow";
  }
  else if (obj.frameName == "down_arrow") {
    obj.angle = 180;
    obj.frameName = "press_arrow";
  }
  else if (obj.frameName == "press_arrow") {
    if(obj.angle == 180 || obj.angle == -180){
        obj.angle = 0;
        obj.frameName = "down_arrow";
    }
    else{
        obj.frameName = "up_arrow";
    }
  }
  else if (obj.frameName == "bench_arrow_up"){
    obj.frameName = "bench_arrow_press";
  }
  else if (obj.frameName == "bench_arrow_down"){
    obj.angle = 180;
    obj.frameName = "bench_arrow_press";
  }
  else if (obj.frameName == "bench_arrow_press"){
    if(obj.angle == 180 || obj.angle == -180){
        obj.angle = 0;
        obj.frameName = "bench_arrow_down";
    }
    else{
      obj.frameName = "bench_arrow_up";
    }
  }
}

function onStarTimer(stars){
  for (var star of stars) {
    if (star.frameName == "star_slot") {
      star.frameName = "star";
      return;
    }
  }
  for (var star of stars) {
    star.frameName = "star_slot";
  }


}
