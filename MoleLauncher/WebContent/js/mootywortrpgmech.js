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
		combatLoop(combatDriver);
	}
	/**
	 * Call stepCombat() async so we can establish a loop that can loopback at any point from any place without
	 * risking stack overflow
	 */
	async combatLoop(combatModel) {
		return stepCombat(combatModel);
	}
	/**
	 * Combat controller function that serves as the combat main() loop
	 * @param combatModel the current Combat object
	 * @return the current combat controller state
	 */
	stepCombat(combatModel) {
		var state = combatModel.controllerState;
		if(state === Combat.ControllerState.beginNewRound) {
			let postStatusState = processRoundTop();
			if(postStatusState === Combat.ControllerState.processCombatResult) {
				handleCombatResult(combatModel.combatResult);
			} else if(postStatusState === Combat.ControllerState.playerInput) {
				// we're done with the opening phase of combat and there's more
				// to go, so Q up another loop
				combatModel.controllerState = postStatusState;
				combatLoop(combatModel);
			} else {
				throw "unexpected combat controller state return from processRoundTop: "+postStatusState;
			}
		} else if(state === Combat.ControllerState.playerInput) {
			// Lunar-inspired hyyype!
			displayTelegraph(
					combatModel.telegraphAction(
							combatModel.enemySelectedAbility
					);
			);
			// todo: command selection subphase of player input phase
			populatePlayerCommandList(combatModel);
		} else if(state === Combat.ControllerState.runEnemy) {
			// todo stub
			// todo: check enemy status effects for anything that would prevent the use of their
			// chosen ability
			// check if currently active enemy can still afford their chosen abl
			if(combatModel.turnOwner.canAffordCost(combatModel.enemySelectedAbility)) {
				// apply ability effect
				switch(combatModel.enemySelectedAbility.targetType) {
				case Ability.TargetTypesEnum.personal:
					combatModel.enemySelectedAbility.effect(combatModel.turnOwner);
					combatModel.combatLogContent = combatModel.enemySelectedAbility.generateFlavorText(combatModel.turnOwner);
					break;
				case Ability.TargetTypesEnum.allAllies:
					combatModel.enemySelectedAbility.effect(combatModel.enemyParty);
					combatModel.combatLogContent = combatModel.enemySelectedAbility.generateFlavorText(combatModel.enemyParty);
					break;
				case Ability.TargetTypesEnum.allEnemies:
					combatModel.enemySelectedAbility.effect(combatModel.playerParty);
					combatModel.combatLogContent = combatModel.enemySelectedAbility.generateFlavorText(combatModel.playerParty);
					break;
				case Ability.TargetTypesEnum.singleTarget:
					combatModel.enemySelectedAbility.effect(combatModel.turnOwner, combatModel.currentTargetCharacter);
					combatModel.combatLogContent = combatModel.enemySelectedAbility.generateFlavorText(combatModel.turnOwner, combatModel.currentTargetCharacter);
					break;
				}
			} else {
				combatModel.combatLogContent = combatModel.turnOwner.name + " feebly attempts to enact " + combatModel.enemySelectedAbility.name + " but falters in " + combatMode.currentTurnOwner.getPronoun_possessive() + " exhaustion!";
			}
			// todo: set state to beginNewRound iff there are no more enemies to process
			combatModel.controllerState = Combat.ControllerState.beginNewRound;
			combatLoop(combatModel);
		}
		// print out whatever happened this step
		combatLogPrint(combatModel.combatLogContent);
		return combatModel.controllerState;
	}
	/**
	 * Populate the command list UI with player command strings
	 * @param combatModel our current Combat object
	 */
	populatePlayerCommandList(combatModel) {
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