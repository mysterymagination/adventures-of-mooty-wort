import {Libifels} from "./libifels.js";
import {Ability} from "./spellbook.js";
import {PassStunned} from "./spellbook.js";

/**
 * Combat object takes two arrays of Character objects, the player's party and the enemy's party.
 * @param config: an object literal with properties playerParty (array of Characters controlled by player) and enemyParty (array of Characters controlled by computer).
 */
export class Combat {
	constructor(config) {
		this.playerParty = config.playerParty;
        this.enemyParty = config.enemyParty;
        if(!config.persistStats) {
        	this.resetPartyStatuses();
        }
        this.controllerState = Combat.ControllerState.beginNewRound;
        this.combatResult = undefined;
        
        // tracks the currently selected player and enemy abilities
        this.playerSelectedAbility = undefined;
        this.currentAISelectedAbility = undefined;

        // tracks the turn as either player or enemy group
        this.turnGroup = "player";

        // tracks the actual character whose turn it is
        this.currentTurnOwner = this.playerParty[0]; // todo: support for speed based and other turn orders 

        // tracks the target of the current ability
        this.currentTargetCharacter = undefined;

        // the text feedback to the user re: the state of combat
        this.combatLogContent = "What will " + this.currentTurnOwner.name + " do?";
        /**
         * The integer number of rounds that have passed in this combat so far; incremented at the top of each round
         */
        this.roundCount = 0;
	}
	resetPartyStatuses() {
		for(let character of this.playerParty.concat(this.enemyParty)) {
			character.resetCombatStatus();
		}
	}
	/**
	 * Searches player and enemy parties for the character given by characterId
	 * @param characterId string id of the character we're looking for
	 * @return the identified Character object if one could be found in this combat, else undefined
	 */
	findCombatant(characterId) {
		return Libifels.findCharacterById(this.playerParty.concat(this.enemyParty), characterId);
	}
	/**
	 * Selects an ability name pseudo-randomly based on the given probability weights
	 * @param probConfigObj an object literal with ability name string keys paired with 
	 * 	 	  floating point percentage values e.g. 0.3 => 30%.  These should total 1.
	 * @return the string name of the ability chosen, as specified in the input probConfigObj
	 */
	static chooseRandomAbility(probConfigObj) {
	    // determine ranges of a d100 roll appropriate for each ability based on weights
	    // track where our range has raised to, starting from 0% and ending at 100%
		var currentFloor = 0.0;
		var rangesObj = {};
		for (let probKey in probConfigObj) {
			// transform a probability like 0.3 into the range 0,30 
			rangesObj[probKey] = [currentFloor, currentFloor + probConfigObj[probKey] * 100];
			// raise the floor now that more range has been allocated by the amount allocated
			currentFloor += rangesObj[probKey][1] - rangesObj[probKey][0];
		}
		var roll = Libifels.rollPercentage();
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
		this.currentAISelectedAbility = undefined;
		this.roundCount++;
        // tick down and process status effects for enemy party
		// todo: death processing from status effects 
		// todo: populate combatLogContent with report re: status effects
		// todo: frozen status processing, specifically graying out command UI if the player is frozen
		//  and adding a command option to break out
        for (let enemyCharacter of this.enemyParty) {
            for (let effect of enemyCharacter.statusEffects) {
                if (enemyCharacter.stats.hp > 0) {
                    // apply next-turn chip damage effects
                	// todo: subclass of damage over time effects with a common chipDmg field would eliminate these if chains
                	if (effect.id === "poison") {
                        enemyCharacter.stats["hp"] -= effect.psnDmg;
                    } else if (effect.id === "burn") {
                    	enemyCharacter.stats["hp"] -= effect.brnDmg;
                    } 
                	
                    effect.tickDown();
                    console.log("ticking down "+enemyCharacter.name+"'s "+effect.name+" to "+effect.ticks);
                    // lt 0 because we don't want to count the turn in which the effect is applied
                    if (effect.ticks <= 0) {
                        // reverse the effect now that it is over
                        effect.reverseEffect(enemyCharacter);
                    } else {
                    	// apply same-turn interrupts etc.
                    	if (effect.id === "stun") {
                        	console.log(enemyCharacter.name+" takes no action due to "+enemyCharacter.getPronoun_possessive()+" limbs being paralyzed by corruscating electricity!");
                        	this.currentAISelectedAbility = new PassStunned();
                        }
                    }
                } else {
                    // reverse the effect now that char is dead
                    effect.reverseEffect(enemyCharacter);
                }
            }
        }
        // tick down and process status effects for player party
        for (let playerCharacter of this.playerParty) {
            for (let effect of playerCharacter.statusEffects) {
                if (playerCharacter.stats.hp > 0) {
                	// todo: frozen processing: player needs to choose whether to break free
                	// todo: stun processing: player needs to be informed they are unable to act due to stun
                	if (effect.id === "poison") {
                		playerCharacter.stats["hp"] -= effect.psnDmg;
                    } else if (effect.id === "burn") {
                    	playerCharacter.stats["hp"] -= effect.brnDmg;
                    }

                    effect.tickDown();
                    console.log("ticking down "+playerCharacter.name+"'s "+effect.name+" to "+effect.ticks);
                    if (effect.ticks <= 0) {
                        // reverse the effect now that it is over
                        effect.reverseEffect(playerCharacter);
                    }
                } else {
                    // reverse the effect now that character is dead
                    effect.reverseEffect(playerCharacter);
                }
            }
        }
        // check for victory/defeat condition
        this.checkTerminalConditions();
        
        if(this.combatResult !== undefined) {
			// we have a combat result, so tell the viewcontroller to process it
        	// todo: check for serial combat gauntlet e.g. moving mole onto Grue from Yawning God if necessary
        	//  and healing him up for the next round!
        	return Combat.ControllerState.processCombatResult;
        } else {
        	// todo: check for any status effects that might prevent enemy from acting
        	for(let enemy of this.enemyParty) {
        		// skip AI abl determination if something has already determined the action, e.g. paralysis
        		if(!this.currentAISelectedAbility) {
        			// todo: support for multiple enemies
        			this.currentAISelectedAbility = enemy.runAI(this, "enemy");	
        		}
        	}
        	// tell viewcontroller we're moving on to player input
        	return Combat.ControllerState.playerInput;
        }
    }// end processRoundTop fn
	/**
	 * @return a pseudorandom string telegraphing what the AI is going to do, in the spirit of Lunar 
	 */
	telegraphAction(ability) {
		return ability.generateRandomTelegraph();
	}
	
	/**
	 * Step through player party and enemy party to look for fully dead parties.
	 * If a terminal condition is detected, this method sets the combatResult field accordingly.
	 * @return true if we have a combat result, false otherwise
	 */
	checkTerminalConditions() {
		var dedEnemies = 0;
        var dedPlayers = 0;
        for (let playerCharacter of this.playerParty) {
            // check for death
            if (playerCharacter.stats.hp <= 0) {
                dedPlayers++;
            }
        }
        for (let enemyCharacter of this.enemyParty) {
            // check for death
            if (enemyCharacter.stats.hp <= 0) {
                dedEnemies++;
            }
        }
		// check victory conditions 
        var bPlayersDefeated = false;
        var bEnemiesDefeated = false;
        if (dedEnemies >= this.enemyParty.length) {
        	bEnemiesDefeated = true;
        } 
        if (dedPlayers >= this.playerParty.length) {
        	bPlayersDefeated = true;
        } 
        if(bPlayersDefeated && bEnemiesDefeated) {
        	this.combatResult = Combat.CombatResultEnum.draw;
        } else if(bPlayersDefeated) {
        	this.combatResult = Combat.CombatResultEnum.enemyVictory;
        } else if(bEnemiesDefeated) {
        	this.combatResult = Combat.CombatResultEnum.playerVictory;
        }
        
        if(this.combatResult) {
        	return true;
        }
	}
} // end Combat class
Combat.ControllerState = Object.freeze(
	{
		beginNewRound: 1,
		processCombatResult: 2,
		playerInput: 3,
		runEnemy: 4
	}
)
Combat.CombatResultEnum = Object.freeze(
	{
    		playerVictory: 1,
    		enemyVictory: 2,
    		draw: 3
	}
);