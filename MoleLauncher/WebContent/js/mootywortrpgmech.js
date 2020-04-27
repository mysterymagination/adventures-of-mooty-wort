// imports
import MoleUndum from '../lib/libifels_undum.js';
import * as Characters from '../lib/characters.js';
import Combat from '../lib/combat.js';
/*
 * todo: Add Lunar inspired telegraph hint (1:many, but not all) and induction (many similar:1) systems:
 * 1. (hint) "The grue sharpens its claws in a sliver of moonlight" -> he might use Quicksilver Cut, Shadow Slash, or Rake.
 * 2. (induction) "Crystalline shadow swirls around the grue", "Jagged amethyst thrusts through the grue's flesh, flashing in the firelight", and "Frost and stone come together to form a complicated lattice structure around the grue, which pulses ominously" -> these all mean that he's about to use Diamond Dust.
 * 
 * I love the Lunar 1:1 situation where one animation always indicates one ability, but a little uncertainty and/or complexity could really add to it.  Probably best place to shove this system into our current combat model would be at the top of a new round, after the Ai has decided what it's doing and before we process player input such that player can see the telegraph text before choosing their action.
 * todo: might be best as far as this is concerned to just have fixed turn order of player action followed by enemy action instead of speed since we don't have any speed modding abilities and that would complicate strats related to telegraphed moves.
 */

/**
 * Class responsible for defining the RPG mechanics of the Mooty Wort adventure and running combat
 */
class MootyWortRpgMech {
	constructor() {
		// instantiate library
		var lib = new MoleUndum();
		this.characters = {
		        "mole": new Characters.Mole(),
		        "yawning_god": new Characters.YawningGod(),
		        "grue": new Characters.Grue()
		}
		// establish Player party
	    this.party = [this.characters["mole"]];
		/**
		 * Current combat encounter manager
		 */
		this.combatArena = undefined;
	}
	
	/**
	 * Combat flow:
	 * 1. viewcontroller.enterCombat() sets up the Combat object
	 * 2. viewcontroller.stepCombat() in init state Combat.ControllerState.beginNewRound:
	 * 		1. state = combat.processRoundTop(): 
	 * 			1. status effects are processed and we check for victory/defeat condition
	 * 			2. iff the enemy can act, runAI() determines the enemy's action
	 * 			x3. the enemy's telegraph is printed to combat logx (update: probly don't want this here at model level, since it would require a handle to the view or viewcontroller and pollute the model's scope with view-specific ops)
	 * 			x4. the player's command UI is populated with available actions (frozen etc. status effect will gray normal ones out and add others)x (update: see above) 
	 * 		2. if state is not Combat.ControllerState.processCombatResult
	 * 			1. combat.telegraphAction(enemychosenAbility) returns a telegraph string and we print to combat log
	 * 			2. populate player's command UI with available actions (frozen etc. status effect will gray normal ones out and add others, and things the player can't afford should be grayed out as well) 
	 * 			3. define onclick() cb functions for available command UI
	 * 				1. commands with sub command menus should display and populate child commands
	 * 				2. leaf node command elements should:
	 * 					1. analyze the relevant ability:
	 * 						1. if the selected ability is singleTarget:
	 * 							1. the command listitem onclick() will define onclick() for possible targets that runs the ability and advances combat
	 * 							2. the player selects a target image:
	 * 								1. run the ability on selected target
	 * 								2. print result
	 * 								3. set controller state to Combat.ControllerState.runEnemy
	 * 								4. call viewcontroller.stepCombat() 
	 * 						2. otherwise:
	 * 							1. run the ability on appropriate target group
	 * 							2. print result
	 * 							3. set controller state to Combat.ControllerState.runEnemy
	 * 							4. call viewcontroller.stepCombat() 
	 * 		3. if state is Combat.ControllerState.runEnemy:
	 * 			1. if the enemy is still alive and able to perform its selected ability:
	 * 				1. run enemy selected ability on selected target(s)
	 * 				2. print results
	 * 			2. otherwise: print that the enemy struggles futiley in some appropriate manner
	 * 			3. set controller state to Combat.ControllerState.beginNewRound
	 * 			4. call viewcontroller.stepCombat() todo: recursion?  maybe call an async fn who runs stepCombat, just so we can pop off the callstack and wait for event loop to hit us up again? 
	 * 		4. if state is Combat.ControllerState.processCombatResult: display victory/defeat message and put exit combat element in UI 
	 */
	
	/**
	 * Prepares combat UI and manages Combat object
	 * @param configObj an object literal of the form
	 * {playerParty: [playerCharacter1, playerCharacter2...], enemyParty: [enemyCharacter1, enemyCharacter2...]}
	 * 
	 */
	enterCombat(configObj) {
		// gamelogic
		var combatDriver = new Combat(configObj.playerParty, configObj.enemyParty);
		combatDriver.turnOwner = "mole";
		// kick off combat 
		combatDriver.processRoundTop();
		// UI setup
		populatePlayerCommandList();
	}
	/**
	 * Populate the command list UI with player command strings
	 */
	populatePlayerCommandList() {
		// todo: check for frozen status and mod ui accordingly
		// todo: check for poison status and log any damage taken during processRoundTop()
		// todo: check for death (e.g. by poison) after top of the round effects are processed
		var combatCommandList = document.getElementById("combatCommandList");
		for(let command in this.characters["mole"].commands) {
			var commandListItem = document.createElement("li");
			commandListItem.className = "commandButton";
			commandListItem.onclick = () => {
				switch(command) {
				case "Attack":
					// todo: at this point we want the UI to direct the player to choose a target
					//  That could entail making another text list to choose through, but it would be
					//  preferable to just let them click on an enemy graphic; the gfx could have its own onclick
					//  that informs combat a target selection has been made iff combat is in a state waiting for target selection.
					// todo: indicate player turn complete
					break;
				case "Magic":
					swapElementDisplayVisibility(combatCommandList.id, "combatSpellsList");
					populatePlayerSpellList();
					break;
				case "Defend":
					// todo: run defend effect
					// todo: indicate player turn complete
					break;
				case "Run":
					combatLogPrint("There is no escape!");
					break;
				}
			}
			var commandText = document.createTextNode(command);
			commandListItem.appendChild(commandText);
			combatCommandList.appendChild(commandListItem);
		}
	}
	/**
	 * Populate the spells list UI with the player's spell names
	 */
	populatePlayerSpellList() {
		var combatSpellsList = document.getElementById("combatSpellsList");
		var playerSpells = this.characters["mole"].entity.spellsDict;
		for(const [spellId, spell] of playerSpells) {
			var spellListItem = document.createElement("li");
			spellListItem.className = "commandButton";
			spellListItem.onclick = () => {
				// todo: allow player to choose target if appropriate
				// todo: trigger spell effect with source and target as appropriate
				//spell.effect(this.characters["mole"], targetCharacter);
				// todo: display flavor text in combat log
			}
			var spellText = document.createTextNode(spell.name);
			spellListItem.appendChild(spellText);
			combatSpellsList.appendChild(spellListItem);
		}
	}
	/**
	 * Creates a new \<p\> tag, puts the given text in it, and appends it to the combat log
	 * @param logString a string to append to the log
	 */
	combatLogPrint(logString) {
		var combatLog = document.getElementById("combatLog");
		var logContainer = document.createElement("p");
		var logText = document.createTextNode(logString);
		logContainer.appendChild(logText);
		combatLog.appendChild(logContainer);
	}
	/**
	 * Display victory or defeat message and provide battle exit UI
	 */
	handleCombatResult(enumCombatResult) {
    	// combat over scenario
		switch(enumCombatResult) {
        case Combat.CombatResultEnum.playerVictory:
        	// todo: display player victory message and battle exit UI
        	break;
        case Combat.CombatResultEnum.enemyVictory:
        	// todo: display player defeat message and game over UI
        	break;
        case Combat.CombatResultEnum.draw:
        	// todo: display draw message and battle exit UI
        	break;
        default:
        	throw "handleCombatResult called with unrecognized result enum "+enumCombatResult;
        	break;
        }
	}
	/**
	 * Hides one element and makes another visible by setting
	 * their style.display properties to none and block respectively.
	 * @param hideElementId the id of the element to hide
	 * @param showElementId the id of the element to show
	 */
	swapElementDisplayVisibility(hideElementId, showElementId) {
		var hideElement = document.getElementById(hideElementId);
		hideElement.style.display = none;
		var showElement = document.getElementById(showElementId);
		showElement.style.display = "block";
	}
}
export {MootyWortRpgMech};