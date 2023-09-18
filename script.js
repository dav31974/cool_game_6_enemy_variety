window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 800;

    class Game {
        constructor(ctx, width, height) {
            this.ctx = ctx;
            this.width = width;
            this.height = height;
            this.enemies = [];
            this.enemyInterval = 500;
            this.enemyTimer = 0;
            this.enemyTypes = ['worm', 'ghost', 'spider'];
        }
        update(deltaTime) {
            // fonction filter - selectionne les objets markedForDeletion
            this.enemies = this.enemies.filter(object => !object.markedForDeletion); // remove enemy if markedForDeletion
            if (this.enemyTimer > this.enemyInterval) {
                this.#addNewEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }
            this.enemies.forEach(object => object.update(deltaTime));

        }
        draw() {
            this.enemies.forEach(object => object.draw(this.ctx));
        }
        #addNewEnemy() {
            const randomEnemy = this.enemyTypes[Math.floor(Math.random() * this.enemyTypes.length)];
            if (randomEnemy == "worm") this.enemies.push(new Worm(this));
            if (randomEnemy == "ghost") this.enemies.push(new Ghost(this));
            if (randomEnemy == "spider") this.enemies.push(new Spider(this));
            // trie les element en fonction de leur axe y (sert a faire passer les enemies plus eloignés dèrriere ceux plus proches)
            // this.enemies.sort(function (a, b) {
            //     return a.y - b.y;
            // });
        }
    }

    class Enemy {
        constructor(game) {
            this.game = game;
            this.markedForDeletion = false;
            this.frameX = 0;
            this.maxFrame = 5; // nombre de colonne sur l'image en partant de 0
            this.frameInterval = 100;
            this.frameTimer = 0;
        }
        update(deltaTime) {
            this.x -= this.speedVx * deltaTime;
            // remove enemy
            if (this.x < 0 - this.width) this.markedForDeletion = true;
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX < this.maxFrame) this.frameX++;
                else this.frameX = 0;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
        }
        draw(ctx) {
            ctx.drawImage(this.image, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        }
    }

    class Worm extends Enemy {
        constructor(game) {
            super(game);
            this.spriteWidth = 229;
            this.spriteHeight = 171;
            this.width = this.spriteWidth / 2;
            this.height = this.spriteHeight / 2;
            this.x = this.game.width;
            this.y = this.game.height - this.height;
            this.image = worm; // fait peu connu: tou element créé dans le dom AVEC un attribut id est automatiquement ajouté à l'environement d'execution de javascript en tant que variable globale (pas besoin d'un getElementById)
            this.speedVx = Math.random() * 0.2 + 0.1;
        }
    }

    class Ghost extends Enemy {
        constructor(game) {
            super(game);
            this.spriteWidth = 261;
            this.spriteHeight = 209;
            this.width = this.spriteWidth / 2;
            this.height = this.spriteHeight / 2;
            this.x = this.game.width;
            this.y = Math.random() * this.game.height * 0.6; // pour que les ghost occupent 60% de l'espace en partant du haut
            this.image = ghost; // fait peu connu: tou element créé dans le dom AVEC un attribut id est automatiquement ajouté à l'environement d'execution de javascript en tant que variable globale (pas besoin d'un getElementById)
            this.speedVx = Math.random() * 0.1 + 0.1;
            this.angle = 0;
            this.curve = Math.random() * 3;
        }
        update(deltaTime) {
            super.update(deltaTime);
            this.y += Math.sin(this.angle) * this.curve; // this.curve permet de varier l'angle
            this.angle += 0.02;
        }
        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = 0.5; // ghost opacity
            super.draw(ctx);
            ctx.restore(); // return origin opacity
        }
    }

    class Spider extends Enemy {
        constructor(game) {
            super(game);
            this.spriteWidth = 310;
            this.spriteHeight = 175;
            this.width = this.spriteWidth / 2;
            this.height = this.spriteHeight / 2;
            this.x = Math.random() * this.game.width;
            this.y = 0 - this.height;
            this.image = spider; // fait peu connu: tou element créé dans le dom AVEC un attribut id est automatiquement ajouté à l'environement d'execution de javascript en tant que variable globale (pas besoin d'un getElementById)
            this.speedVx = 0;
            this.speedVy = Math.random() * 0.1 + 0.2;
            this.maxDown = Math.random() * this.game.height;
        }
        update(deltaTime) {
            super.update(deltaTime);
            if (this.y < 0 - this.height * 2) this.markedForDeletion = true;
            this.y += this.speedVy * deltaTime;
            if (this.y > this.maxDown) this.speedVy *= -1;

        }
        draw(ctx) {
            ctx.beginPath();
            // dessine le fil
            ctx.moveTo(this.x + this.width / 2, 0);
            ctx.lineTo(this.x + this.width / 2, this.y + 10);
            ctx.stroke();
            super.draw(ctx);
        }
    }


    const game = new Game(ctx, canvas.width, canvas.height);
    let lastTime = 1;

    function animate(timeStamp) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;

        game.update(deltaTime);
        game.draw();

        requestAnimationFrame(animate);
    }
    animate(0);
});