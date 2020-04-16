/**
 * Combat object takes two arrays of Character objects, the player's party and the enemy's party.
 * @param config: an object literal with properties playerParty (array of Characters controlled by player) and enemyParty (array of Characters controlled by computer).
 */
export class Combat {
	constructor() {
		this.playerParty = config.playerParty;
        console.log("in Combat ctor, playerParty[0].name says " + this.playerParty[0].name);
        this.enemyParty = config.enemyParty;
        
        // metadata about what state the player's turn is in.  This is necessary to help route the UI around the various actions a human player will need to input
        this.playerTurnState = Combat.PlayerTurnState.selectAbility;
        this.enemyTurnState = Combat.EnemyTurnState.runAI;
        this.combatResult = Combat.CombatResultEnum.pending;

        // tracks the currently selected player ability
        this.currentSelectedAbility = undefined;

        // tracks the turn as either player or enemy group
        this.turnGroup = "player";

        // tracks the actual character id whose turn it is
        this.turnOwner = "player";

        // tracks the currently selected ability for the current turn owner
        this.abilityName = "";

        // tracks the target of the current ability
        this.currentTargetCharacter = undefined;

        // the text feedback to the user re: the state of combat
        this.combatLogContent = "What will " + playerParty[this.turnOwner].name + " do?";
	}
	/**
	 * Selects an ability name pseudo-randomly based on the given probability weights
	 * @param probConfigObj an object literal with ability name string keys paired with 
	 * 	 	  floating point percentage values e.g. 0.3 => 30%.  These should total 1.
	 * @return the string name of the ability chosen, as specified in the input probConfigObj
	 */
	chooseRandomAbility(probConfigObj) {
		  // determine ranges of a d100 roll appropriate for each ability based on weights
		  // track where our range has raised to, starting from 0% and ending at 100%
		  var currentFloor = 0.0;
		  rangesObj = {};
		  for (let probKey in probConfigObj) {
		    // transform a probability like 0.3 into the range 0,30 
		    rangesObj[probKey] = [currentFloor, currentFloor + probConfigObj[probKey] * 100];
		    // raise the floor now that more range has been allocated by the amount allocated
		    currentFloor += rangesObj[probKey][1] - rangesObj[probKey][0];
		  }
		  console.log(JSON.stringify(rangesObj));
		  var roll = this.rollPercentage();
		  // look up match
		  for (let range in rangesObj) {
		    if (roll >= rangesObj[range][0] && roll <= rangesObj[range][1]) {
		      return "" + range;
		    }
		  }
		  throw "chooseRandomAbility exception: range not found for roll " + roll + " in range table " + JSON.stringify(rangesObj);
		}
	/**
	 * Choose and return a character participating in this combat at random
	 */
	randomCombatantExcept(exceptCharacter) {
        var combatants = this.enemyParty.concat(this.playerParty);
        var eligibleCombatants = combatants.filter(combatant => combatant.id != exceptCharacter.id);
        var unluckyIndex = Math.floor(Math.random() * eligibleCombatants.length);
        return eligibleCombatants[unluckyIndex];

    }
    /**
     * Concat the enemy and player party arrays, and return result
     */
    getAllCombatants() {
        return this.enemyParty.concat(this.playerParty);
    }
	/**
     * Handle upkeep related to a new round beginning (i.e. top of the round to ye!)
     */
	processRoundTop() {
        // tick down status effects
        for (let enemyChar of this.enemyParty) {
            var enemyCharacter = State.variables.characters[enemyChar.id];
            for (let effect of enemyCharacter.statusEffects) {
                if (enemyCharacter.living) {
                    // process top of stateffects with variable or triggered effects per round
                    if (effect.id === "terror") {
                        // terror's effect will roll percentage, with 35% to skip this turn
                        if (effect.effect()) {
                            enemyCharacter.combatFlags |= window.Character.CombatFlags.FLAG_SKIP_TURN;
                        }
                    }
                    else if (effect.id === "poison") {
                        enemyCharacter.stats["hp"] -= enemyCharacter.stats["maxHP"] * 0.1;
                    }
                    else if (effect.id === "regen") {
                        window.statusEffectsDict["regen"].effect(enemyCharacter);
                    }


                    effect.tickDown();
                    if (effect.ticks <= 0) {
                        // reverse the effect now that it is over
                        effect.reverseEffect(enemyCharacter);
                        // reset the ticks count to duration in case we
                        // want to re-use this statuseffect instance
                        effect.ticks = effect.duration;
                        // remove the status effect from the character
                        window.removeStatusEffect(enemyCharacter, effect);
                    }
                } else {
                    // reverse the effect now that char is dead
                    effect.reverseEffect(enemyCharacter);
                    // reset the ticks count to duration in case we
                    // want to re-use this statuseffect instance
                    effect.ticks = effect.duration;
                    // remove the status effect from the character
                    window.removeStatusEffect(enemyCharacter, effect);
                }
            }
        }
        for (let playerChar of this.playerParty) {
            var playerCharacter = State.variables.characters[playerChar.id];
            for (let effect of playerCharacter.statusEffects) {
                if (playerCharacter.living) {
                    // process top of stateffects with variable effects per round
                    if (effect.id === "terror") {
                        // terror's effect will roll percentage, with 35% to skip this turn
                        if (effect.effect()) {
                            playerCharacter.combatFlags |= window.Character.CombatFlags.FLAG_SKIP_TURN;
                        }
                    }
                    else if (effect.id === "regen") {
                        window.statusEffectsDict["regen"].effect(playerCharacter);
                    }

                    effect.tickDown();
                    if (effect.ticks <= 0) {
                        // reverse the effect now that it is over
                        effect.reverseEffect(playerCharacter);
                        // reset the ticks count to duration in case we
                        // want to re-use this statuseffect instance
                        effect.ticks = effect.duration;
                        // remove the status effect from the character
                        window.removeStatusEffect(playerCharacter, effect);
                    }
                } else {
                    // reverse the effect now that character is dead
                    effect.reverseEffect(playerCharacter);
                    // reset the ticks count to duration in case we
                    // want to re-use this statuseffect instance
                    effect.ticks = effect.duration;
                    // remove the status effect from the character
                    window.removeStatusEffect(playerCharacter, effect);
                }
            }
        }
    }// end processRoundTop fn
	/**
	 * Process the end of a combat round
	 */
	processRoundBottom() {
        var dedEnemies = 0;
        var dedPlayers = 0;
        for (let enemyChar of this.enemyParty) {
            var enemyCharacter = State.variables.characters[enemyChar.id];
            for (let effect of enemyCharacter.statusEffects) {
                // process bottom of stateffects with variable effects per round
                if (effect.id === "terror") {
                    // clear the FLAG_SKIP_TURN flag
                    enemyCharacter.combatFlags &= ~window.Character.CombatFlags.FLAG_SKIP_TURN;
                }
            }

            // check for death
            if (enemyCharacter.stats.hp <= 0) {
                dedEnemies++;
            }
        }
        for (let playerChar of this.playerParty) {
            // extract Character object from $characters
            var playerCharacter = State.variables.characters[playerChar.id];
            for (let effect of playerCharacter.statusEffects) {
                // process bottom of stateffects with variable effects per round
                if (effect.id === "terror") {
                    // clear the FLAG_SKIP_TURN flag
                    playerCharacter.combatFlags &= ~window.Character.CombatFlags.FLAG_SKIP_TURN;
                }
            }

            // check for death
            if (playerCharacter.stats.hp <= 0) {
                dedPlayers++;
            }
        }

        // check victory conditions -- if one is met, we do not need another turn so return false.  Else, combat continues so we return true.
        // todo: need a way to clear conditions and/or reset stats as desired at end of combat
        console.log("Dead players: " + dedPlayers + ", dead enemies: " + dedEnemies);
        if (dedEnemies >= this.enemyParty.length) {
            this.combatResult = Combat.CombatResultEnum.playerVictory;
            return false;
        } else if (dedPlayers >= this.playerParty.length) {
            this.combatResult = Combat.CombatResultEnum.enemyVictory;
            return false;
        } else {
            return true;
        }
    }// end processRoundBottom()
} // end Combat class
Combat.PlayerTurnState = Object.freeze(
	{
	    	selectAbility: 1
	}
);
Combat.EnemyTurnState = Object.freeze(
	{
    		runAI: 1
    }
);
Combat.CombatResultEnum = Object.freeze(
	{
    		pending: 1,
    		playerVictory: 2,
    		enemyVictory: 3
	}
);