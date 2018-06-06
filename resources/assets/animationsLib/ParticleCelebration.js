/***
  @file Particle system to show behind the success popup
  @author Nicolas Laudo
  @version 1.0
*/

/***
  @class ParticleCelebration
**/
class ParticleCelebration{

  /***
      The constructor is kept simple to limit the overhead until we actually need to initialise the animation
      @constructor
      @param {Phaser.Game} game - current game instance
  **/
  constructor(game){
    this.game = game;

    this.events = new Phaser.Events(this);
    this.events.onCelebrationReady = new Phaser.Signal();
    //this.events.onParticleStarted = new Phaser.Signal();
  }

  /***
      The actual initialisation of the transition.
      Based only on cache names so that it can instanciate and place elements when needed.

      @method ParticleCelebration#init
      @param {string} particleCacheName - The name in cache of the image to be used as particle
      @fires {Phaser.Signal} onCelebrationReady - Dispatched when the animation `start` can be called
  **/
  init(particleCacheName){
    this.particleName = particleCacheName;

    this.emitter = this.game.add.emitter(game.world.centerX, game.world.centerY, 50000);
    this.emitter.makeParticles(this.particleName)
    this.emitter.width = 100;
    this.emitter.height = 400;
    this.emitter.setXSpeed(-1000, 1000);
    this.emitter.setYSpeed(-1000, 1000);
    this.emitter.maxParticleScale = 1.2;
    this.emitter.minParticleScale = 0.6;
    this.emitter.gravity = 5;

    this.emitter.minRotation = 0;
    this.emitter.maxRotation = 360;


    var tints = [0xff0000, 0x00ff00, 0x0000ff];

    this.emitter.forEach(function(particle) {
      //particle.tint = Phaser.ArrayUtils.getRandomItem(tints);
      particle.tint = Math.floor((Math.random() * 0xffffff)+1);
    });
    this.events.onCelebrationReady.dispatch();
  }
  /***
      Starts the transition
      Do NOT call before `onCelebrationReady` was dispatched. This might lead to bugs and unexpected behaviors.

      @method ParticleCelebration#start
  **/
  start(){
        this.emitter.start(false, 10000, 5, 500, true);
        this.emitter.start(false, 50000, 1, 0, false);
        //this.game.camera.shake(0.01, 300);
        this.game.camera.flash(0xffffff, 100)
  }
  /***
      Destroys all elements created by the celebration

      @method ParticleCelebration#destroy
  **/
  destroy(){
    this.emitter.destroy();
  }
}
