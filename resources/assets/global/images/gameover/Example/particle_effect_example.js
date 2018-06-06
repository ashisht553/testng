var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create });

var emitter;

function preload() {

    game.load.image('confetti', 'assets/referee_test/confetti.png');

}

function create() {

    game.stage.backgroundColor = '#337799';

    var emitter = this.game.add.emitter(game.world.centerX, -32, 30000);
    emitter.makeParticles('confetti')
    emitter.x = game.world.centerX;
    emitter.y = 0;
    emitter.width = game.world.width * 1.5;
    emitter.maxParticleScale = 0.6;
    emitter.minParticleScale = 0.3;
    emitter.gravity = 60;

    emitter.minRotation = 0;
    emitter.maxRotation = 360;


    var tints = [0xff0000, 0x00ff00, 0x0000ff];

    emitter.forEach(function(particle) {
      //particle.tint = Phaser.ArrayUtils.getRandomItem(tints);
      particle.tint = Math.floor((Math.random() * 0xffffff)+1);
    });

    emitter.start(false, 8000, 10, 500);
}
