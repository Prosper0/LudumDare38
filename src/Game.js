
BasicGame.Game = function (game) {

    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    //this.background = null;
    this.backgroundSky = null;
    this.backgroundGround = null;
    this.heroCannon = null;

    this.cursors = null;
    this.fireKey = null;

    this.bullets = null;
    this.fireRate = 100;
    this.nextFire = 0;

    this.enemies = null;
    this.enemiesTotal = 0;
    this.enemiesAlive = 0;
    this.spawnEnemyAllowed = false;
    this.enemiesSpawnTime = 0;
    this.lastSpawnTime = 0;
    this.emitter = null;

    this.game;      //  a reference to the currently running game (Phaser.Game)
    this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera;    //  a reference to the game camera (Phaser.Camera)
    this.cache;     //  the game cache (Phaser.Cache)
    this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    this.load;      //  for preloading assets (Phaser.Loader)
    this.math;      //  lots of useful common math operations (Phaser.Math)
    this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage;     //  the game stage (Phaser.Stage)
    this.time;      //  the clock (Phaser.Time)
    this.tweens;    //  the tween manager (Phaser.TweenManager)
    this.state;     //  the state manager (Phaser.StateManager)
    this.world;     //  the game world (Phaser.World)
    this.particles; //  the particle manager (Phaser.Particles)
    this.physics;   //  the physics manager (Phaser.Physics)
    this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)

    //  You can use any of these from any function within this State.
    //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

};

BasicGame.Game.prototype = {

    create: function () {

        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        //this.background = this.add.sprite(0, 0, 'gameBackground');
        this.backgroundSky = this.add.sprite(0, 0, 'gameBackgroundSky');
        this.backgroundGround = this.add.sprite(0, 0, 'gameBackgroundGround');
        this.backgroundSky.x = 0;
        this.backgroundSky.y = 0;
        this.backgroundGround.x = 0;
        this.backgroundGround.y = 0;
        this.backgroundSky.scale.setTo(3, 3);
        this.backgroundGround.scale.setTo(3, 3);
        this.game.physics.enable(this.backgroundSky, Phaser.Physics.ARCADE);
        this.game.physics.enable(this.backgroundGround, Phaser.Physics.ARCADE);
        this.backgroundSky.body.immovable = true;
        this.backgroundSky.body.moves = false;
        /*this.background.height = this.game.height;
        this.background.width = this.game.width;
        this.background.smoothed = false;*/
        //this.background.anchor.setTo(0.5, 0.5);

        this.bullets = this.game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

        this.bullets.createMultiple(50, 'bullet');
        this.bullets.setAll('checkWorldBounds', true);
        this.bullets.setAll('outOfBoundsKill', true);

        this.heroCannon = this.add.sprite(480, 720, 'heroWeaponCannon');
        this.game.physics.enable(this.heroCannon, Phaser.Physics.ARCADE);
        this.heroCannon.anchor.setTo(0.5, 0.5);
        this.heroCannon.scale.setTo(3, 3);

        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.fireKey = this.game.input.keyboard.addKey(Phaser.Keyboard.Z);

        //  Create some aliens
        this.enemies = [];
        this.enemiesSpawnTime = this.game.rnd.integerInRange(2500, 5000);
        this.lastSpawnTime = this.game.time.time;
        this.spawnEnemyAllowed = true;

    },

    update: function () {

        if (this.cursors.left.isDown)
        {
            this.heroCannon.angle -= 2;
        }
        else if (this.cursors.right.isDown)
        {
            this.heroCannon.angle += 2;
        }

        if (this.fireKey.isDown)
        {
            this.fireBullet();
        }

        if(this.spawnEnemyAllowed == true)
        {
            var current_time = this.game.time.time;
            if(current_time - this.lastSpawnTime > this.enemiesSpawnTime){
                this.enemiesSpawnTime = this.game.rnd.integerInRange(2500, 5000);
                this.lastSpawnTime = current_time;
                this.createEnemy();
            }
        }

        /*if (this.cursors.up.isDown)
        {
            this.game.world.rotation += 0.05;
        }
        else if (this.cursors.down.isDown)
        {
            this.game.world.rotation -= 0.05;
        }*/

        for (var i = 0; i < this.enemies.length; i++)
        {
            this.game.physics.arcade.overlap(this.bullets, this.enemies[i].enemyBody, this.bulletHitEnemy, null, this);
        }

        this.bullets.forEachAlive( this.killIfBulletIsOutOfWorld, this ); // function(box) {  if(box.y < 300) { box.kill(); }  }

    },

    quitGame: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

    },

    render: function () {

        //this.game.debug.text('Active Bullets: ' + this.bullets.countLiving() + ' / ' + this.bullets.total, 32, 32);
        //this.game.debug.spriteInfo(this.heroCannon, 32, 400);

    },

    fireBullet: function () {

        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
        {
            this.nextFire = this.game.time.now + this.fireRate;

            /*
            var bullet = this.bullets.getFirstDead();
            var bulletOffset = 10 * Math.sin(this.game.math.degToRad(this.heroCannon.angle));
            var newx = this.heroCannon.x + bulletOffset - 20;
            this.game.debug.text('BulletOffset: ' + bulletOffset, 32, 60);
            bullet.reset(newx, this.heroCannon.y + bulletOffset);
            bullet.angle = this.heroCannon.angle;
            */
            var bullet = this.bullets.getFirstDead();
            bullet.scale.setTo(1, 1);
            bullet.reset(this.heroCannon.x - 10, this.heroCannon.y);
            bullet.angle = this.heroCannon.angle;

            this.add.tween(bullet.scale).to({ x: 0.2, y: 0.2 }, 1000, Phaser.Easing.Quadratic.Out, true, 100);

            //this.game.physics.arcade.moveToPointer(bullet, 300);

            //this.bullet.body.velocity.y = -300;
            //this.game.physics.arcade.velocityFromAngle(this.heroCannon.angle, 300, sprite.body.velocity);
            this.game.physics.arcade.velocityFromRotation(this.heroCannon.rotation - Math.PI/2, 400, bullet.body.velocity);
            //this.game.physics.arcade.velocityFromRotation(this.heroCannon.rotation - Math.PI/2, 400, bullet.body.velocity);
            //bulletTime = game.time.now + 250;
        }

    },

    createEnemy: function () {

        /*
        var enemy1 = this.add.sprite(this.game.world.randomX, 180, 'enemy1');
        enemy1.anchor.setTo(0.5, 0.5);
        this.game.physics.enable(enemy1, Phaser.Physics.ARCADE);
        this.game.physics.arcade.moveToObject(enemy1, this.heroCannon, 100, 3000);
        this.add.tween(enemy1.scale).to({ x: 2.5, y: 2.5 }, 3000, Phaser.Easing.Quadratic.Out, true, 100);

        for (var i = 0; i < 1; i++)
        {
            this.enemies.push(enemy1);
        }*/

        this.enemiesTotal = this.enemiesTotal + 1;
        //this.enemies.push(new AlienEnemy("enemy1", this.enemiesTotal, this.game, this.heroCannon));
        this.enemies.push(new EnemyUfo(this.enemiesTotal, this.game, this.heroCannon));
        this.enemiesTotal = this.enemiesTotal + 1;
        //this.enemies.push(new AlienEnemy("enemy1", this.enemiesTotal, this.game, this.heroCannon));
        this.enemies.push(new EnemyFrog(this.enemiesTotal, this.game, this.heroCannon));

    },

    bulletHitEnemy: function (enemy, bullet) {

        bullet.kill();

        //var destroyed = this.enemies[enemy.name].damage();
        var enemyObj = this.enemies.filter(function ( obj ) {
            return obj.name === enemy.name;
        })[0];

        var destroyed = enemyObj.damage();
        //var destroyed = enemy.damage();

        if (destroyed)
        {
            console.log('Enemy dead:' + enemy.name + " x:" + enemy.x);
            this.emitter = this.game.add.emitter(enemy.x, enemy.y, 200);
            this.emitter.makeParticles('deadlyparticle');//, 0, 250, false, false);
            //this.emitter.gravity = 200;
            //this.emitter.bounce.setTo(0.5, 0.5);
            this.emitter.start(true, 4000, null, 10);
            //this.particleBurst(enemy.x, enemy.y);
            //var explosionAnimation = explosions.getFirstExists(false);
            //explosionAnimation.reset(tank.x, tank.y);
            //explosionAnimation.play('kaboom', 30, false, true);
            //enemy.kill();
            /*for (var i =0; i < enemies.length; i++) {
                if (enemies[i].name === enemy.name) {
                    enemies.splice(i, 1);
                    break;
                }
            }*/
        }

    },

    killIfBulletIsOutOfWorld: function (bullet) {

        var hej = this.game.height;
        var distanceToCannon = this.game.height - bullet.y;
        var offs = Math.abs(20 * Math.sin(this.game.math.degToRad(this.heroCannon.angle)));
        offs = offs * 5;
        var dist2 = Phaser.Math.distance(this.heroCannon.x , this.heroCannon.y , bullet.x , bullet.y);
        //if (this.game.physics.arcade.distanceBetween(bullet, this.heroCannon) > 450)
        if(offs > 10 && offs < 64)
            offs = 10;

        if(dist2 > (430 + offs))
        { 
            bullet.kill(); 
        }

    },

    particleBurst: function (pointerx, pointery) {

        this.emitter.x = pointerx;
        this.emitter.y = pointery;

        this.emitter.start(true, 4000, null, 10);

        this.game.time.events.add(2000, this.destroyEmitter, this);
    },

    destroyEmitter: function() {

        //emitter.destroy();

    }

};

var AlienEnemy = function AlienEnemy(enemyType, enemyId, game, playerHero) { //enemyType, 

    this.game = game;
    this.playerHero = playerHero;

    //var x = this.game.world.randomX;
    var yPos = [350, 300, 280, 310, 370];
    var xPos = [100, 300, 500, 700, 900];
    var randI = Math.floor(Math.random() * yPos.length);
    var y = yPos[randI];
    var x = xPos[randI];

    this.alive = true;

    // TODO Based on enemytype
    this.enemyType = enemyType;
    /*this.health = 1;
    this.damagePoints = 1;
    this.enemySpeed = 100;
    this.enemySpeedTime = 3000;*/
    this.enemySprite = enemyType;

    this.enemyBody = this.game.add.sprite(x, y, this.enemySprite);
    this.enemyBody.animations.add('moving');
    this.enemyBody.animations.play('moving', 5, true);

    this.enemyBody.anchor.setTo(0.5, 0.5);
    this.enemyBody.scale.setTo(0.2, 0.2);
    game.physics.enable(this.enemyBody, Phaser.Physics.ARCADE);
    //game.physics.arcade.moveToObject(this.enemyBody, this.playerHero, this.enemySpeed, this.enemySpeedTime);
    game.physics.arcade.moveToXY(this.enemyBody, this.playerHero.x, this.playerHero.y, this.enemySpeed, this.enemySpeedTime);
    /*
    this.game.add.tween(this.enemyBody).to({ y: this.game.height },
        this.enemySpeedTime, Phaser.Easing.Linear.InOut, true, 0, Number.POSITIVE_INFINITY);

    this.game.add.tween(this.enemyBody).to({ x: this.playerHero.x },
        this.enemySpeedTime, Phaser.Easing.Sinusoidal.Out, true, 0, Number.POSITIVE_INFINITY);*/
    //this.enemyBody.body.acceleration.x = -1000;

    this.game.add.tween(this.enemyBody.scale).to({ x: 2.5, y: 2.5 }, this.enemySpeedTime, Phaser.Easing.Quadratic.Out, true, this.enemySpeed);
    
    this.enemyBody.name = this.enemyType + enemyId.toString();
    this.name = this.enemyType + enemyId.toString();

}

AlienEnemy.prototype.damage = function() {

    this.health -= 1;

    if (this.health <= 0)
    {
        this.alive = false;
        this.enemyBody.kill();
        return true;
    }

    return false;

}

AlienEnemy.prototype.update = function() {

    if (this.game.physics.arcade.distanceBetween(this.enemyBody, this.playerHero) < 300)
    {
        // Start screaming when closing in?
    }

};

// -------------
var EnemyUfo = function (index, game, playerHero) {

    this.enemyType = "enemyUfo";
    this.health = 1;
    this.damagePoints = 1;
    this.enemySpeed = 100;
    this.enemySpeedTime = 3000;
    AlienEnemy.call(this, this.enemyType, index, game, playerHero);

}

EnemyUfo.prototype.constructor = EnemyUfo;
EnemyUfo.prototype = Object.create(AlienEnemy.prototype);

// ----------------
var EnemyFrog = function (index, game, playerHero) {

    this.enemyType = "enemy1";
    this.health = 1;
    this.damagePoints = 1;
    this.enemySpeed = 100;
    this.enemySpeedTime = 3000;
    AlienEnemy.call(this, this.enemyType, index, game, playerHero);

}

EnemyFrog.prototype.constructor = EnemyFrog;
EnemyFrog.prototype = Object.create(AlienEnemy.prototype);