import Libifels from "./libifels.js";
import Ability from "./spellbook.js"

/**
 * Combat object takes two arrays of Character objects, the player's party and the enemy's party.
 * @param config: an object literal with properties playerParty (array of Characters controlled by player) and enemyParty (array of Characters controlled by computer).
 */
export class Combat {
	constructor(config) {
		this.playerParty = config.playerParty;
        console.log("in Combat ctor, playerParty[0].name says " + this.playerParty[0].name);
        this.enemyParty = config.enemyParty;
        
        // metadata about what state the player's turn is in.  This is necessary to help route the UI around the various actions a human player will need to input
        this.playerTurnState = Combat.PlayerTurnState.selectAbility;
        this.enemyTurnState = Combat.EnemyTurnState.runAI;
        this.combatResult = Combat.CombatResultEnum.pending;

        // tracks the currently selected player ability id
        this.currentSelectedAbilityId = "";

        // tracks the turn as either player or enemy group
        this.turnGroup = "player";

        // tracks the actual character id whose turn it is
        this.turnOwner = "player";

        // tracks the target of the current ability
        this.currentTargetCharacter = undefined;

        // the text feedback to the user re: the state of combat
        this.combatLogContent = "What will " + playerParty[this.turnOwner].name + " do?";
	}
	/**
	 * Process current state and advance Combat state machine; this method will be called
	 * multiple times by various actors, including user interaction handler functions.  As such,
	 * its behavior is entirely dependent on the current Combat instance state.
	 */
	battleStateMachine() {
		// todo: since we want the combat log to show the enemy telegraphing before the player chooses their move, 
		//  we'll need to call runAI() at the top of a combat round, I guess?
		// todo: where should processRoundTop() and processRoundBottom() be called?
		//  I guess it should be at origin and terminal nodes of combat, i.e. call
		//  processRoundTop() when we first create combat and after calling processRoundBottom when we transition from
		//  running Combat.EnemyTurnState.displayResults into Combat.PlayerTurnState.selectAbility?
		// todo: follow example of Fuzziolump PlayerCombatDisplay passage for state machine handlinmg
		if(this.turnGroup === "player") {
			if(this.playerTurnState === Combat.PlayerTurnState.selectAbility) {
				let characterHandle = Libifels.findCharacterById(this.playerParty, this.turnOwner);
				// in this state we should be coming here from having selected an ability,
				//  this means that we just need to advance to state selectTarget iff the abl
				//  is singleTarget, else go on to displayResults
				let selectedAbility = characterHandle.entity.spellsDict[this.currentSelectedAbilityId];
				if(selectedAbility.targetType === Ability.TargetTypesEnum.singleTarget) {
					this.playerTurnState = Combat.PlayerTurnState.selectTarget;
				} else {
					this.playerTurnState = Combat.PlayerTurnState.displayResults;
				}
			}
		}
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
        // tick down and process status effects for enemy party
        for (let enemyChar of this.enemyParty) {
            for (let effect of enemyCharacter.statusEffects) {
                if (enemyCharacter.living) {
                    if (effect.id === "poison") {
                        enemyCharacter.stats["hp"] -= effect.psnDmg;
                    }

                    effect.tickDown();
                    if (effect.ticks <= 0) {
                        // reverse the effect now that it is over
                        effect.reverseEffect(enemyCharacter);
                        // reset the ticks count to duration in case we
                        // want to re-use this statuseffect instance
                        effect.ticks = effect.duration;
                        // remove the status effect from the character
                        Libifels.removeStatusEffect(enemyCharacter, effect);
                    }
                } else {
                    // reverse the effect now that char is dead
                    effect.reverseEffect(enemyCharacter);
                    // reset the ticks count to duration in case we
                    // want to re-use this statuseffect instance
                    effect.ticks = effect.duration;
                    // remove the status effect from the character
                    Libifels.removeStatusEffect(enemyCharacter, effect);
                }
            }
        }
        // tick down and process status effects for player party
        for (let playerChar of this.playerParty) {
            for (let effect of playerCharacter.statusEffects) {
                if (playerCharacter.living) {
                	// todo: frozen processing: player needs to choose whether to break free
                	if (effect.id === "poison") {
                        playerCharacter.stats["hp"] -= effect.psnDmg;
                    }

                    effect.tickDown();
                    if (effect.ticks <= 0) {
                        // reverse the effect now that it is over
                        effect.reverseEffect(playerCharacter);
                        // reset the ticks count to duration in case we
                        // want to re-use this statuseffect instance
                        effect.ticks = effect.duration;
                        // remove the status effect from the character
                        Libifels.removeStatusEffect(playerCharacter, effect);
                    }
                } else {
                    // reverse the effect now that character is dead
                    effect.reverseEffect(playerCharacter);
                    // reset the ticks count to duration in case we
                    // want to re-use this statuseffect instance
                    effect.ticks = effect.duration;
                    // remove the status effect from the character
                    Libifels.removeStatusEffect(playerCharacter, effect);
                }
            }
        }
        // todo: run enemy party AI such that they have chosen their moves but NOT executed them
    }// end processRoundTop fn
	// todo: processRoundMiddle fn where the player gets info about the enemies' stances which suggests what they will do
	//  Once player input is received, we'll process the player moves first and then the enemy moves (checking if the enemy can still
	//  perform the action after suffering the player's wrath of course)
	/**
	 * Process the end of a combat round
	 */
	processRoundBottom() {
        var dedEnemies = 0;
        var dedPlayers = 0;
        for (let enemyChar of this.enemyParty) {
            // check for death
            if (enemyCharacter.stats.hp <= 0) {
                dedEnemies++;
            }
        }
        for (let playerChar of this.playerParty) {
            for (let effect of playerCharacter.statusEffects) {
                // process bottom of stateffects with variable effects per round
                // todo: frozen
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
		selectAbility: 1,
		selectTarget: 2, 
		displayResults: 3
	}
);
Combat.EnemyTurnState = Object.freeze(
	{
		runAI: 1, 
		displayResults: 2
    }
);
Combat.CombatResultEnum = Object.freeze(
	{
    		pending: 1,
    		playerVictory: 2,
    		enemyVictory: 3
	}
);