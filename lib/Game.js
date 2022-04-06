const inquirer = require('inquirer');
const Enemy = require('./Enemy');
const Player = require('./Player');


function Game() {
    this.roundNumber = 0;
    this.isPlayerTurn = false;
    this.enemies = [];
    this.currentEnemy;
    this.player;
}

Game.prototype.initializeGame = function () {
    this.enemies.push(new Enemy('goblin', 'sword'));
    this.enemies.push(new Enemy('orc', 'baseball bat'));
    this.enemies.push(new Enemy('skeleton', 'axe'));

    this.currentEnemy = this.enemies[0];

    inquirer
        .prompt({
            type: 'text',
            name: 'name',
            message: 'What is your name?'
        })
        // destructure name from the prompt object
        .then(({ name }) => {
            this.player = new Player(name);

            // call start new battle function
            this.startNewBattle();
        });
};

Game.prototype.startNewBattle = function () {
    if (this.player.agility > this.currentEnemy.agility) {
        this.isPlayerTurn = true;
    }
    else {
        this.isPlayerTurn = false;
    }
    console.log("Your stats are as follows:");
    console.table(this.player.getStats());
    console.log(this.currentEnemy.getDescription());

    // call start new battle round function
    this.battle();
};

Game.prototype.battle = function () {
    // if player's turn
    if (this.isPlayerTurn) {
        // prompt user to attack or use a potion
        inquirer
            .prompt({
                type: 'list',
                message: 'What would you like to do?',
                name: 'action',
                choices: ['Attack', 'Use potion']
            })
            .then(({ action }) => {
                // if using a potion
                if (action === 'Use potion') {
                    // check if inventory is empty
                    if (!this.player.getInventory()) {
                        console.log("You don't have any potions!");
                        return this.checkEndOfBattle();
                    }

                    // if inventory has at least one potion in it, display list of potion objects to user & ask which they want to use
                    inquirer
                        .prompt({
                            type: 'list',
                            message: 'Which potion would you like to use?',
                            name: 'action',
                            choices: this.player.getInventory().map((item, index) => `${index + 1}: ${item.name}`)
                        })
                        .then(({ action }) => {
                            const potionDetails = action.split(': ');

                            this.player.usePotion(potionDetails[0] - 1);
                            console.log(`You used a ${potionDetails[1]} potion.`);
                            this.checkEndOfBattle();
                        });

                    // apply selected potion effect to player

                }
                // if attacking
                else {
                    // subtract health from the enemy based on player attack value
                    const damage = this.player.getAttackValue();
                    this.currentEnemy.reduceHealth(damage);

                    console.log(`You attacked the ${this.currentEnemy.name}`);
                    console.log(this.currentEnemy.getHealth());
                    this.checkEndOfBattle();
                }
            });
    }
    // if enemy's turn
    else {
        // subtract health from the player based on enemy attack value
        const damage = this.currentEnemy.getAttackValue();
        this.player.reduceHealth(damage);

        console.log(`You were attacked by the ${this.currentEnemy.name}`);
        console.log(this.player.getHealth());
        this.checkEndOfBattle();
    }
};

Game.prototype.checkEndOfBattle = function () {
    // check if both player & enemy are still alive, and if so, switch the turn
    if (this.player.isAlive() && this.currentEnemy.isAlive()) {
        this.isPlayerTurn = !this.isPlayerTurn;
        this.battle();
    }
    else if (this.player.isAlive() && !this.currentEnemy.isAlive()) {
        console.log(`You've defeated the ${this.currentEnemy.name}`);

        this.player.addPotion(this.currentEnemy.potion);
        console.log(`${this.player.name} found a ${this.currentEnemy.potion.name} potion`);

        this.roundNumber++;

        if (this.roundNumber < this.enemies.length) {
            this.currentEnemy = this.enemies[this.roundNumber];
            this.startNewBattle();
        } else {
            console.log('You win!');
        }
    }
    else {
        console.log("You've been defeated!");
    }
};





module.exports = Game;