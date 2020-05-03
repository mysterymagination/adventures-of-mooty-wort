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
        this.combatResult = undefined;

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
			} else if(this.playerTurnState === Combat.PlayerTurnState.selectTarget) {
				// here we should be coming from having bopped a target image in the UI
				//  so we ready to display results
				this.playerTurnState = Combat.PlayerTurnState.displayResults;
			} else if(this.playerTurnState === Combat.PlayerTurnState.displayResults) {
				// reset player turn state
				this.playerTurnState = Combat.PlayerTurnState.selectAbility;
				
				/*
				 * since there's no interaction for the enemy AI, we can just
				 * execute the action and update UI with the results without stepping through
				 * any enemy turn group states.
				 
				// move along to enemy group, where we actually process the AI's chosen action
				// assuming they can still perform it
				this.turnGroup = "enemy";
				*/
				
				// without needing enemy turn states, we'll just move along to processRoundBottom(),
				// where enemy action chosen in processRoundTop() will be executed iff it is still viable.
				this.processRoundBottom();
			}
		} // end turn group player 
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
		// todo: death processing from status effects 
		// todo: combat log report re: status effects
		// todo: frozen status processing, specifically graying out command UI if the player is frozen
		//  and adding a command option to break out
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
        // check for victory/defeat condition
        checkTerminalConditions();
        /*
        if(this.combatResult !== undefined) {
        	handleCombatResult();
        } else {
        	// todo: check for any status effects that might prevent enemy from acting
        	for(let enemy in this.enemyParty) {
        		let chosenAbility = enemy.runAI();
        		
        		
        	}
        }
        */
        if(this.combatResult !== undefined) {
			// we have a combat result, so tell the viewcontroller to process it
        	return Combat.ControllerState.processCombatResult;
        } else {
        	// todo: check for any status effects that might prevent enemy from acting
        	for(let enemy in this.enemyParty) {
        		// todo: support for multiple enemies
        		this.enemySelectedAbility = enemy.runAI();	
        	}
        	// tell viewcontroller we need to begin a new round
        	return Combat.ControllerState.beginNewRound;
        }
    }// end processRoundTop fn
	/**
	 * @return a pseudorandom string telegraphing what the AI is going to do, in the spirit of Lunar 
	 */
	telegraphAction(ability) {
		/* todo: check ability id and desc for suitable telegraph message, ideally with some
		  topical pseudo-randomness e.g. abl.id === "dark_star" with abl.desc of {fx: ["explosion", "energy", "shadow"], envrmnt: ["night", "stars"]}
		  => <because dark_star, always something about all the lights on yawning god's body going out and a vicious rumbling shaking his form.  Because of
		     night and stars, spin up pseudorandom template phrase about surroundings being swallowed by shadow and flaring pinpricks of omnipresent light too
		     far away to warm but always watching>.  The idea is to generate telegraphs that are unique to each ability BUT
		     only in their particular combination -- there shouldn't be just three different things
		     we ever say when we see abl.id of dark_star, for instance, such that the rest doesn't matter and it's only a memory matching minigame
		     for the player; I'm hoping for real deduction based on rando telegraph and what actuall happens!
		*/
		return "placeholder telegraph!";
	}
	/**
	 * Process the end of a combat round
	 */
	/* this is probably redundant since we have to check for terminal conditions in processRoundTop after status effects are applied
	processRoundBottom() {
		checkTerminalConditions();
        /* instead of calling these directly, this method should return information about the next step to calling viewcontroller
		if(this.combatResult !== undefined) {
        	handleCombatResult();
        } else {
        	// begin a new round
        	processRoundTop();
        }
        */
		/*
		if(this.combatResult !== undefined) {
			// we have a combat result, so tell the viewcontroller to process it
        	return Combat.ControllerState.processCombatResult;
        } else {
        	// tell viewcontroller we need to begin a new round
        	return Combat.ControllerState.beginNewRound;
        }
		
    }// end processRoundBottom()
	*/
	/* since this is mostly UI work, it belongs in the viewcontroller
	handleCombatResult() {
		if(this.combatResult !== undefined) {
        	// combat over scenario
			switch(this.combatResult) {
	        case Combat.CombatResultEnum.playerVictory:
	        	// todo: display player victory message and battle exit UI
	        	break;
	        case Combat.CombatResultEnum.enemyVictory:
	        	// todo: display player defeat message and game over UI
	        	break;
	        case Combat.CombatResultEnum.draw:
	        	// todo: display draw message and battle exit UI
	        	break;
	        }
        } else {
        	throw "handleCombatResult called with undefined combatResult";
        }
	}
	*/
	/**
	 * Step through player party and enemy party to look for fully dead parties
	 */
	checkTerminalConditions() {
		var dedEnemies = 0;
        var dedPlayers = 0;
        for (let playerChar of this.playerParty) {
            // check for death
            if (playerCharacter.stats.hp <= 0) {
                dedPlayers++;
            }
        }
        for (let enemyChar of this.enemyParty) {
            // check for death
            if (enemyCharacter.stats.hp <= 0) {
                dedEnemies++;
            }
        }
		// check victory conditions 
        console.log("Dead players: " + dedPlayers + ", dead enemies: " + dedEnemies);
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
	}
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