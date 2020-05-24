// imports
import {MoleUndum} from "../lib/libifels_undum.js";
import * as Characters from "../lib/characters.js";
import {Combat} from "../lib/combat.js";
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
		this.charactersDict = {
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
		/**
		 * Object literal association of player Character ids to associated UI objects sack
		 */
		this.playerCharacterUIDict = {
		/* e.g.
				"mole": {
					"characterObj": this.charactersDict["mole"],
					"imageElement": undefined, 
					"nameElement": undefined,
					"hpElement": undefined,
					"maxHPElement": undefined,
					"hpProgressElement": undefined,
					"mpElement": undefined,
					"maxMPElement": undefined,
					"mpProgressElement": undefined
				}
		*/
		};
		/**
		 * Object literal association of enemy Character ids to associated UI objects sack
		 */
		this.enemyCharacterUIDict = {
		/* e.g.
				"yawning_god": {
					"characterObj": this.charactersDict["yawning_god"],
					"imageElement": undefined, 
					"nameElement": undefined,
					"hpProgressElement": undefined
				}
		*/
		};
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
		// setup UI
		initBattleUi(combatDriver);
		// set init turn owner to player, the mole
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
			let postStatusState = combatModel.processRoundTop();
			// print anything that happened during top o' the round
			combatLogPrint(combatModel.combatLogContent);
			combatModel.combatLogContent = "";
			// update character portraits with status info
			populateCharacterBattleImages(combatModel);
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
					)
			);
			// command selection subphase of player input phase
			populatePlayerCommandList(combatModel);
		} else if(state === Combat.ControllerState.runEnemy) {
			// todo: check enemy status effects for anything that would prevent the use of their
			// chosen ability
			let selectedAbility = combatModel.enemySelectedAbility;
			// check if currently active enemy can still afford their chosen abl
			if(combatModel.turnOwner.canAffordCost(selectedAbility)) {
				// apply ability effect
				switch(selectedAbility.targetType) {
				case Ability.TargetTypesEnum.personal:
					selectedAbility.effect(combatModel.turnOwner);
					combatModel.combatLogContent = selectedAbility.generateFlavorText(combatModel.turnOwner);
					break;
				case Ability.TargetTypesEnum.allAllies:
					selectedAbility.effect(combatModel.enemyParty);
					combatModel.combatLogContent = selectedAbility.generateFlavorText(combatModel.enemyParty);
					break;
				case Ability.TargetTypesEnum.allEnemies:
					selectedAbility.effect(combatModel.playerParty);
					combatModel.combatLogContent = selectedAbility.generateFlavorText(combatModel.playerParty);
					break;
				case Ability.TargetTypesEnum.singleTarget:
					selectedAbility.effect(combatModel.turnOwner, combatModel.currentTargetCharacter);
					combatModel.combatLogContent = selectedAbility.generateFlavorText(combatModel.turnOwner, combatModel.currentTargetCharacter);
					break;
				}
			} else {
				combatModel.combatLogContent = combatModel.turnOwner.name + " feebly attempts to enact " + combatModel.enemySelectedAbility.name + " but falters in " + combatMode.currentTurnOwner.getPronoun_possessive() + " exhaustion!";
			}
			// complete this enemy character's turn
			handleEnemyTurnComplete();
		}
		// print out whatever happened this step
		combatLogPrint(combatModel.combatLogContent);
		return combatModel.controllerState;
	}
	/**
	 * Render the gfx for an ability 
	 * @param ability the Ability whose associated gfx should render
	 * @param sourceCharacter the Character who is using the given ability
	 * @param targetCharacter the Character who is targeted by the given ability
	 */
	playAbilityAnimation(ability, sourceCharacter, targetCharacter) {
		// todo: load animation/graphic/effect an ability calls for re: generation and deployment 
		// centered on the sourceCharacter's and targetCharacter's sprites in the UI respectively
	}
	/**
	 * Render the gfx for Character damage suffered
	 * @param targetCharacter the Character who is being damaged
	 */
	playCharacterPainAnimation(targetCharacter) {
		// todo: load animation indicating the targetCharacter was damaged
		// todo: iff the targetCharacter is now dead, play death animation and then remove their sprite from UI
	}
	/**
	 * Set up the battle UI, associating character objects with their associated HTML elements 
	 * @param combatModel the current COmbat object
	 */
	initBattleUi(combatModel) {
		// player party UI 
		var playerView_Div = document.getElementById("playerView");
		for(let playerCharacter in combatModel.playerParty) {
			let playerCharacter_Div = document.createElement("div");
			
			let playerCharacterSprite_Img = document.createElement("img");
			playerCharacterSprite_Img.src = playerCharacter.battleSprites[0];
			playerCharacter_Div.appendChild(playerCharacterSprite_Img);
			
			let playerCharacterName_P = document.createElement("p");
			playerCharacterName_Text = document.createTextNode(playerCharacter.name);
			playerCharacterName_P.appendChild(playerCharacterName_Text);
			playerCharacter_Div.appendChild(playerCharacterName_P);
			
			let playerCharacterHp_Div = document.createElement("div");
			let playerCharacterCurrentHp_P = document.createElement("p");
			let playerCharacterCurrentHp_Text = document.createTextNode(playerCharacter.stats["hp"]);
			playerCharacterCurrentHp_P.appendChild(playerCharacterCurrentHp_Text);
			playerCharacterHp_Div.appendChild(playerCurrentHp_P);
			let playerCharacterHp_Progress = document.createElement("progress");
			playerCharacterHp_Progress.value = playerCharacter.stats["hp"];
			playerCharacterHp_Div.appendChild(playerCharacterHp_Progress);
			let playerCharacterMaxHp_P = document.createElement("p");
			let playerCharacterMaxHp_Text = document.createTextNode(playerCharacter.stats["maxHp"]);
			playerCharacterMaxHp_P.appendChild(playerCharacterMaxHp_Text);
			playerCharacterHp_Div.appendChild(playerCharacterMaxHp_P);
			playerCharacter_Div.appendChild(playerCharacterHp_Div);
			
			let playerCharacterMp_Div = document.createElement("div");
			let playerCharacterCurrentMp_P = document.createElement("p");
			let playerCharacterCurrentMp_Text = document.createTextNode(playerCharacter.stats["mp"]);
			playerCharacterCurrentMp_P.appendChild(playerCharacterCurrentMp_Text);
			playerCharacterMp_Div.appendChild(playerCharacterCurrentMp_P);
			let playerCharacterMp_Progress = document.createElement("progress");
			playerCharacterMp_Progress.value = playerCharacter.stats["mp"];
			playerCharacterMp_Div.appendChild(playerCharacterMp_Progress);
			let playerCharacterMaxMp_P = document.createElement("p");
			let playerCharacterMaxMp_Text = document.createTextNode(playerCharacter.stats["maxMp"]);
			playerCharacterMaxMp_P.appendChild(playerCharacterMaxMp_Text);
			playerCharacterMp_Div.appendChild(playerCharacterMaxMp_P);
			playerCharacter_Div.appendChild(playerCharacterMp_Div);
			
			playerView_Div.appendChild(playerCharacter_Div);
			this.playerCharacterUiDict[playerCharacter.id] = {
					"characterObj": playerCharacter,
					"imageElement": playerCharacterSprite_Img, 
					"nameElement": playerCharacterName_P,
					"hpElement": playerCharacterCurrentHp_P,
					"maxHPElement": playerCharacterMaxHp_P,
					"hpProgressElement": playerCharacterHp_Progress,
					"mpElement": playerCharacterCurrentMp_P,
					"maxMPElement": playerCharacterMaxMp_P,
					"mpProgressElement": playerCharacterMp_Progress
			}
		}
		// enemy party UI from player perspective
		let enemyView_Div = document.getElementById("enemyView");
		for(let enemyCharacter in combatModel.enemyParty) {
			let enemyCharacter_Div = document.createElement("div");
			
			let enemyCharacterSprite_Img = document.createElement("img");
			enemyCharacterSprite_Img.src = enemyCharacter.battleSprites[0];
			enemyCharacter_Div.appendChild(enemyCharacterSprite_Img);
			
			let enemyCharacterHp_Div = document.createElement("div");
			let enemyCharacterHp_Progress = document.createElement("progress");
			enemyCharacterHp_Progress.value = enemyCharacter.stats["hp"];
			enemyCharacterHp_Div.appendChild(enemyCharacterHp_Progress);
			enemyCharacter_Div.appendChild(enemyCharacterHp_Div);
			
			enemyView_Div.appendChild(enemyCharacter_Div);
			this.enemyCharacterUiDict[enemyCharacter.id] = {
					"characterObj": enemyCharacter,
					"imageElement": enemyCharacterSprite_Img, 
					"hpProgressElement": enemyCharacterHp_Progress
			}
		}
	}
	
	/**
	 * Update the Character sprites based on combat data
	 * @param combatModel current Combat object
	 */
	updateCharacterBattleImages(combatModel) {
		// todo: load up player and enemy sprites appropriate for current state of combat,
		// e.g. darkened eyes of Grue as it takes damage, hide HTML elements for dead characters
	}
	/**
	 * Populate the command list UI with player command strings
	 * @param combatModel our current Combat object
	 */
	populatePlayerCommandList(combatModel) {
		// todo: check for frozen status and mod ui accordingly
		var combatCommandList = document.getElementById("combatCommandList");
		for(const [ablId, abl] of Object.entries(combatModel.currentTurnOwner.entity.spellsDict)) {
			var commandListItem = document.createElement("li");
			commandListItem.className = "commandButton";
			commandListItem.onclick = () => {
				if(abl.targetType === Ability.TargetTypesEnum.singleTarget) {
					for(let [targetCharacter, imgElement] of Object.entries(this.characterImageDict)) {
						imgElement.onclick = () => {
							let sourceCharacter = combatModel.currentTurnOwner;
							abl.effect(sourceCharacter, targetCharacter);
							playAbilityAnimation(abl, sourceCharacter, targetCharacter);
							combatLogPrint(abl.generateFlavorText(sourceCharacter, targetCharacter));
							handlePlayerTurnEnd(combatModel);
							// clear onclicks now that we've used them
							this.removeAttribute("onclick");
							commandListItem.removeAttribute("onclick");
						}
					}
				} else {
					let sourceCharacter = undefined;
					let targetCharacters = undefined;
					switch(abl.targetType) {
					case Ability.TargetTypesEnum.personal:
						sourceCharacter = combatModel.currentTurnOwner;
						targetCharacters = [sourceCharacter];
						abl.effect(sourceCharacter);
						playAbilityAnimation(abl, sourceCharacter, targetCharacters[0]);
						combatLogPrint(abl.generateFlavorText(sourceCharacter));
						break;
					case Ability.TargetTypesEnum.allEnemies:
						sourceCharacter = combatModel.currentTurnOwner;
						targetCharacters = combatModel.enemyParty;
						abl.effect(sourceCharacter, targetCharacters);
						playAbilityAnimation(abl, sourceCharacter, targetCharacters);
						combatLogPrint(abl.generateFlavorText(sourceCharacter, targetCharacters));
						break;
					case Ability.TargetTypesEnum.allAllies:
						sourceCharacter = combatModel.currentTurnOwner;
						targetCharacters = combatModel.playerParty;
						abl.effect(sourceCharacter, targetCharacters);
						playAbilityAnimation(abl, sourceCharacter, targetCharacters);
						combatLogPrint(abl.generateFlavorText(sourceCharacter, targetCharacters));
						break;
					}
					handlePlayerTurnEnd(combatModel);
					// clear onclick now that we've used it
					this.removeAttribute("onclick");
				}
			}
			
			var commandText = document.createTextNode(abl.name);
			commandListItem.appendChild(commandText);
			combatCommandList.appendChild(commandListItem);
		}
	}
	/**
	 * Completes an enemy AI's turn, activating next living enemy or telling controller 
	 * we're ready for a new round if all enemies' turns are complete. 
	 * @param combatModel current Combat object
	 */
	handleEnemyTurnComplete(combatModel) {
		// set state to beginNewRound iff there are no more enemies to process
		// otherwise, advance turn owner to next enemy
		if(MoleUndum.findLastLivingCharacter(combatModel.enemyParty) !== combatModel.currentTurnOwner) {
			combatModel.currentTurnOwner = 
				MoleUndum.findFirstLivingCharacter(
						combatModel.enemyParty, 
						MoleUndum.findCharacterIndex(combatModel.enemyParty, combatModel.currentTurnOwner.id)
				);
		} else {
			combatModel.controllerState = Combat.ControllerState.beginNewRound;
		}
		combatLoop(combatModel);
	}
	/**
	 * Completes a player's turn, advancing control to the next living player or to enemy phase
	 * if all players' turns are complete.
	 * @param combatModel current Combat object
	 */
	handlePlayerTurnComplete(combatModel) {
		// set state to runEnemy iff there are no more players to process
		// otherwise, advance turn owner to next player
		if(MoleUndum.findLastLivingCharacter(combatModel.playerParty) !== combatModel.currentTurnOwner) {
			combatModel.currentTurnOwner = 
				MoleUndum.findFirstLivingCharacter(
						combatModel.playerParty, 
						MoleUndum.findCharacterIndex(combatModel.playerParty, combatModel.currentTurnOwner.id)
				);
		} else {
			combatModel.controllerState = Combat.ControllerState.runEnemy;
		}
		combatLoop(combatModel);
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