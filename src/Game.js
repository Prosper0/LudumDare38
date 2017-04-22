
BasicGame.Game = function (game) {

    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.background = null;
    this.heroCannon = null;

    this.cursors = null;
    this.fireKey = null;

    this.bullets = null;
    this.fireRate = 100;
    this.nextFire = 0;

    this.enemies = null;
    this.createEnemyAllowed = false;

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

        //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
        this.background = this.add.sprite(0, 0, 'gameBackground');
        this.background.x = 0;
        this.background.y = 0;
        this.background.height = this.game.height;
        this.background.width = this.game.width;
        this.background.smoothed = false;
        //this.background.anchor.setTo(0.5, 0.5);

        this.bullets = this.game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

        this.bullets.createMultiple(50, 'bullet');
        this.bullets.setAll('checkWorldBounds', true);
        this.bullets.setAll('outOfBoundsKill', true);

        this.heroCannon = this.add.sprite(320, 470, 'heroWeaponCannon');
        this.game.physics.enable(this.heroCannon, Phaser.Physics.ARCADE);
        this.heroCannon.anchor.setTo(0.5, 0.5);
        this.heroCannon.scale.setTo(2, 2);

        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.fireKey = this.game.input.keyboard.addKey(Phaser.Keyboard.Z);

        //  Create some baddies to waste :)
        this.enemies = [];

    },

    update: function () {

        if (this.cursors.left.isDown)
        {
            this.heroCannon.angle -= 1;
        }
        else if (this.cursors.right.isDown)
        {
            this.heroCannon.angle += 1;
        }

        if (this.fireKey.isDown)
        {
            this.fireBullet();
        }

        if(this.createEnemyAllowed == false)
        {
            this.createEnemyAllowed = true;
            this.createEnemy();
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
            this.game.physics.arcade.overlap(this.bullets, this.enemies[i], this.bulletHitEnemy, null, this);
        }

    },

    quitGame: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

    },

    render: function () {

        this.game.debug.text('Active Bullets: ' + this.bullets.countLiving() + ' / ' + this.bullets.total, 32, 32);
        this.game.debug.spriteInfo(this.heroCannon, 32, 400);

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

        var enemy1 = this.add.sprite(this.game.world.randomX, 180, 'enemy1');
        enemy1.anchor.setTo(0.5, 0.5);
        this.game.physics.enable(enemy1, Phaser.Physics.ARCADE);
        this.game.physics.arcade.moveToObject(enemy1, this.heroCannon, 100, 3000);
        this.add.tween(enemy1.scale).to({ x: 2.5, y: 2.5 }, 3000, Phaser.Easing.Quadratic.Out, true, 100);

        for (var i = 0; i < 1; i++)
        {
            this.enemies.push(enemy1);
        }

    },

    bulletHitEnemy: function (enemy, bullet) {

        bullet.kill();

        //var destroyed = enemies[tank.name].damage();
        var destroy = true;

        if (destroy)
        {
            //var explosionAnimation = explosions.getFirstExists(false);
            //explosionAnimation.reset(tank.x, tank.y);
            //explosionAnimation.play('kaboom', 30, false, true);
            enemy.kill();
        }

    }

};
