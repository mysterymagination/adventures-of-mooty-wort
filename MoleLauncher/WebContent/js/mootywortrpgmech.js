// imports
import {MoleUndum} from "../lib/libifels_undum.js";
import * as Characters from "../lib/characters.js";
import {Combat} from "../lib/combat.js";
import {Ability} from "../lib/spellbook.js";
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
		};
		// establish Player party
	    this.party = [this.charactersDict["mole"]];
		/**
		 * Current combat encounter manager
		 */
		this.combatArena = undefined;
		/**
		 * Object literal association of player Character ids to associated UI objects sack
		 */
		this.playerCharacterUiDict = {
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
		this.enemyCharacterUiDict = {
		/* e.g.
				"yawning_god": {
					"characterObj": this.charactersDict["yawning_god"],
					"imageElement": undefined, 
					"nameElement": undefined,
					"hpProgressElement": undefined
				}
		*/
		};
		/**
		 * Object literal pairing a spell FX spritesheet id (same as associated ability id)
		 * with spritesheet properties necessary for parsing
		 */
		this.spellFXDict = {
			/*
			 e.g. "test_spritesheet": {
			    "image": this,
	            "columns": 3,
	            "rows": 4,
	            "frameWidthPx": 16,
	            "frameHeightPx": 18,
	            "frameCount": 12
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
		var combatDriver = new Combat(configObj);
		// setup UI
		this.initBattleUi(combatDriver);
		// kick off combat 
		this.combatLoop(combatDriver);
	}
	/**
	 * Call stepCombat() async so we can establish a loop that can loopback at any point from any place without
	 * risking stack overflow
	 */
	async combatLoop(combatModel) {
		return this.stepCombat(combatModel);
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
			this.combatLogPrint(combatModel.combatLogContent);
			combatModel.combatLogContent = "";
			// update character portraits with status info
			this.updateCharacterBattleImages(combatModel);
			if(postStatusState === Combat.ControllerState.processCombatResult) {
				this.handleCombatResult(combatModel.combatResult);
			} else if(postStatusState === Combat.ControllerState.playerInput) {
				// we're done with the opening phase of combat and there's more
				// to go, so Q up another loop
				combatModel.controllerState = postStatusState;
				this.combatLoop(combatModel);
			} else {
				throw "unexpected combat controller state return from processRoundTop: "+postStatusState;
			}
		} else if(state === Combat.ControllerState.playerInput) {
			// Lunar-inspired hyyype!
			this.combatLogPrint(
				combatModel.telegraphAction(
					combatModel.currentSelectedAbility
				)
			);
			// command selection subphase of player input phase
			this.populatePlayerCommandList(combatModel);
		} else if(state === Combat.ControllerState.runEnemy) {
			// todo: check enemy status effects for anything that would prevent the use of their
			// chosen ability
			// todo: probably at least some of this should be moved to Combat model class
			let selectedAbility = combatModel.currentSelectedAbility;
			// check if currently active enemy can still afford their chosen abl
			if(combatModel.currentTurnOwner.canAffordCost(selectedAbility)) {
				// apply ability effect
				switch(selectedAbility.targetType) {
				case Ability.TargetTypesEnum.personal:
					selectedAbility.effect(combatModel.currentTurnOwner);
					combatModel.combatLogContent = selectedAbility.generateFlavorText(combatModel.currentTurnOwner);
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
					selectedAbility.effect(combatModel.currentTurnOwner, combatModel.currentTargetCharacter);
					combatModel.combatLogContent = selectedAbility.generateFlavorText(combatModel.currentTurnOwner, combatModel.currentTargetCharacter);
					break;
				}
			} else {
				combatModel.combatLogContent = combatModel.currentTurnOwner.name + " feebly attempts to enact " + combatModel.currentSelectedAbility.name + " but falters in " + combatModel.currentTurnOwner.getPronoun_possessive() + " exhaustion!";
			}
			// complete this enemy character's turn
			this.handleEnemyTurnComplete();
		}
		// print out whatever happened this step
		this.combatLogPrint(combatModel.combatLogContent);
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
	   * Draws a single frame from the given sprite sheet over the entire canvas, scaling automatically
	   * @param spriteSheetId the id of an object literal containing an Image object whose src property should be a loaded sprite sheet as well as related metadata
	   * @param frameIdx the 0-based index of the frame we want to extract from the spritesheet
	   * @param canvas the Canvas we want to draw on
	   */
	  drawFrame(spriteSheetId, frameIdx, canvas) {
	    var spriteSheetData = this.spellFXDict[spriteSheetId];
	    console.log("drawFrame; looked up " + spriteSheetData.columns + "x" + spriteSheetData.rows + " sprite sheet");
	    var context2d = canvas.getContext('2d');
	    // clear frame
	    context2d.clearRect(0, 0, canvas.width, canvas.height);
	    // determine image frame dimens
	    var srcX = frameIdx % spriteSheetData.columns * spriteSheetData.frameWidthPx;
	    var srcY = Math.floor(frameIdx / spriteSheetData.columns) * spriteSheetData.frameHeightPx;
	    var srcWidth = spriteSheetData.frameWidthPx;
	    var srcHeight = spriteSheetData.frameHeightPx;
	    var dstWidth = canvas.offsetWidth;
	    var dstHeight = canvas.offsetHeight;
	    // draw the image frame
	    context2d.drawImage(
	      spriteSheetData.image,
	      srcX,
	      srcY,
	      srcWidth,
	      srcHeight,
	      0,
	      0,
	      dstWidth,
	      dstHeight
	    );
	    console.log("sourcing from " + srcX + "x" + srcY + " out to " + (srcX + srcWidth) + "x" + (srcY + srcHeight) + ".  Destination is 0x0 out to " + dstWidth + "x" + dstHeight);
	  }
	/**
	 * Set up the battle UI, associating character objects with their associated HTML elements 
	 * @param combatModel the current COmbat object
	 */
	initBattleUi(combatModel) {
		// show the combat mode modal
		var combatUI = document.getElementById("combatModal");
		combatUI.style.display = "flex";
		
		// resource loading
		// load up spell effect spritesheets
	    var testSheet = new Image();
	    testSheet.src = 'https://opengameart.org/sites/default/files/Green-Cap-Character-16x18.png';
	    var rpgMechHandle = this;
	    testSheet.addEventListener('load', function() {
	        rpgMechHandle.spellFXDict.test = {
	          "image": this,
	          "columns": 3,
	          "rows": 4,
	          "frameWidthPx": 16,
	          "frameHeightPx": 18,
	          "frameCount": 12
	        }
	        console.log("test spritesheet is loaded");
	      }, false);
	    
		// player party UI 
		var playerView_Div = document.getElementById("playerView");
		var playerCharacterImageContainer_Div = document.getElementById("playerSpritesContainer");
		var playerCharacterDataContainer_Div = document.getElementById("playerDataContainer");
		for(let playerCharacter of combatModel.playerParty) {
			// player character sprites
			let playerCharacterSprite_Span = document.createElement("span");
			let playerCharacterSprite_Canvas = document.createElement("canvas");
			playerCharacterSprite_Canvas.className = "character-image";
			// need an HTML Image whose load cb will draw itself on the Canvas
			var playerCharacterSprite_Image = new Image(); // Create new Image element
			playerCharacterSprite_Image.addEventListener('load', function() {
				// execute drawImage statements now that image has loaded
				playerCharacterSprite_Canvas.width = 256;//this.width;
				playerCharacterSprite_Canvas.height = 256;//this.height;
				playerCharacterSprite_Canvas.getContext('2d').drawImage(this, 0, 0, playerCharacterSprite_Canvas.width, playerCharacterSprite_Canvas.height);
		        console.log("player "+playerCharacter.name+"'s canvas dimens are "+playerCharacterSprite_Canvas.width+"x"+playerCharacterSprite_Canvas.height);
		    }, false);
			playerCharacterSprite_Image.src = playerCharacter.battleSprites[0];
			playerCharacterSprite_Span.appendChild(playerCharacterSprite_Canvas);
			playerCharacterImageContainer_Div.appendChild(playerCharacterSprite_Span);
			
			// player character data
			let playerCharacterData_Div = document.createElement("div");
			let playerCharacterName_Div = document.createElement("div");
			playerCharacterName_Div.className = "player-name";
			let playerCharacterName_Text = document.createTextNode(playerCharacter.name);
			playerCharacterName_Div.appendChild(playerCharacterName_Text);
			playerCharacterData_Div.appendChild(playerCharacterName_Div);
			let playerCharacterHpLabel_Span = document.createElement("span");
			let playerCharacterHpLabel_Text = document.createTextNode("HP: ");
			playerCharacterHpLabel_Span.appendChild(playerCharacterHpLabel_Text);
			playerCharacterData_Div.appendChild(playerCharacterHpLabel_Span);
			let playerCharacterCurrentHp_Span = document.createElement("span");
			let playerCharacterCurrentHp_Text = document.createTextNode(playerCharacter.stats["hp"]+" ");
			playerCharacterCurrentHp_Span.appendChild(playerCharacterCurrentHp_Text);
			playerCharacterData_Div.appendChild(playerCharacterCurrentHp_Span);
			let playerCharacterHp_Progress = document.createElement("progress");
			playerCharacterHp_Progress.value = playerCharacter.stats["hp"]/playerCharacter.stats["maxHP"];
			playerCharacterData_Div.appendChild(playerCharacterHp_Progress);
			let playerCharacterDataDivider_Div = document.createElement("div");
			playerCharacterData_Div.appendChild(playerCharacterDataDivider_Div);
			let playerCharacterMpLabel_Span = document.createElement("span");
			let playerCharacterMpLabel_Text = document.createTextNode("MP: ");
			playerCharacterMpLabel_Span.appendChild(playerCharacterMpLabel_Text);
			playerCharacterData_Div.appendChild(playerCharacterMpLabel_Span);
			let playerCharacterCurrentMp_Span = document.createElement("span");
			playerCharacterCurrentMp_Span.className = "player-stat-value";
			let playerCharacterCurrentMp_Text = document.createTextNode(playerCharacter.stats["mp"]+" ");
			playerCharacterCurrentMp_Span.appendChild(playerCharacterCurrentMp_Text);
			playerCharacterData_Div.appendChild(playerCharacterCurrentMp_Span);
			let playerCharacterMp_Progress = document.createElement("progress");
			playerCharacterMp_Progress.value = playerCharacter.stats["mp"]/playerCharacter.stats["maxMP"];
			playerCharacterData_Div.appendChild(playerCharacterMp_Progress);
			playerCharacterDataContainer_Div.appendChild(playerCharacterData_Div);
			
			// associate elements with keys in UI dict
			this.playerCharacterUiDict[playerCharacter.id] = {
					"characterObj": playerCharacter,
					"canvasElement": playerCharacterSprite_Canvas, 
					"nameElement": playerCharacterName_Div,
					"hpElement": playerCharacterCurrentHp_Span,
					"hpProgressElement": playerCharacterHp_Progress,
					"mpElement": playerCharacterCurrentMp_Span,
					"mpProgressElement": playerCharacterMp_Progress
			};
		}
		// enemy party UI from player perspective
		var enemyCharacterImageContainer_Div = document.getElementById("enemySpritesContainer");
		var enemyCharacterData_Div = document.getElementById("enemyDataContainer");
		for(let enemyCharacter of combatModel.enemyParty) {
			let enemyCharacterSprite_Span = document.createElement("span");
			enemyCharacterImageContainer_Div.appendChild(enemyCharacterSprite_Span);
			let enemyCharacterSprite_Canvas = document.createElement("canvas");
			enemyCharacterSprite_Canvas.id = enemyCharacter.id;
			enemyCharacterSprite_Canvas.className = "character-image";
			// need an HTML Image whose load cb will draw itself on the Canvas
			var enemyCharacterSprite_Image = new Image(); // Create new Image element
			enemyCharacterSprite_Image.addEventListener('load', function() {
				// execute drawImage statements now that image has loaded
				enemyCharacterSprite_Canvas.width = 256;//this.width;
				enemyCharacterSprite_Canvas.height = 256;//this.height;
				enemyCharacterSprite_Canvas.getContext('2d').drawImage(this, 0, 0, enemyCharacterSprite_Canvas.width, enemyCharacterSprite_Canvas.height);
		        console.log("enemy "+enemyCharacter.name+"'s canvas dimens are "+enemyCharacterSprite_Canvas.width+"x"+enemyCharacterSprite_Canvas.height);
		    }, false);
			enemyCharacterSprite_Image.src = enemyCharacter.battleSprites[0];
			enemyCharacterSprite_Span.appendChild(enemyCharacterSprite_Canvas);
			
			let enemyCharacterName_Span = document.createElement("span");
			enemyCharacterName_Span.innerHTML = enemyCharacter.name;
			enemyCharacterData_Div.appendChild(enemyCharacterName_Span);
			let enemyCharacterHp_Progress = document.createElement("progress");
			// progress element value expects a ration expressed as value between 0 and 1, 
			// so set it to our stat ratio directly
			enemyCharacterHp_Progress.value = 
				enemyCharacter.stats["hp"]/enemyCharacter.stats["maxHP"];
			enemyCharacterData_Div.appendChild(enemyCharacterHp_Progress);
			
			this.enemyCharacterUiDict[enemyCharacter.id] = {
					"characterObj": enemyCharacter,
					"canvasElement": enemyCharacterSprite_Canvas, 
					"hpProgressElement": enemyCharacterHp_Progress
			};
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
							this.playAbilityAnimation(abl, sourceCharacter, targetCharacter);
							this.combatLogPrint(abl.generateFlavorText(sourceCharacter, targetCharacter));
							this.handlePlayerTurnEnd(combatModel);
							// clear onclicks now that we've used them
							this.removeAttribute("onclick");
							commandListItem.removeAttribute("onclick");
						};
					}
				} else {
					let sourceCharacter = undefined;
					let targetCharacters = undefined;
					switch(abl.targetType) {
					case Ability.TargetTypesEnum.personal:
						sourceCharacter = combatModel.currentTurnOwner;
						targetCharacters = [sourceCharacter];
						abl.effect(sourceCharacter);
						this.playAbilityAnimation(abl, sourceCharacter, targetCharacters[0]);
						this.combatLogPrint(abl.generateFlavorText(sourceCharacter));
						break;
					case Ability.TargetTypesEnum.allEnemies:
						sourceCharacter = combatModel.currentTurnOwner;
						targetCharacters = combatModel.enemyParty;
						abl.effect(sourceCharacter, targetCharacters);
						this.playAbilityAnimation(abl, sourceCharacter, targetCharacters);
						this.combatLogPrint(abl.generateFlavorText(sourceCharacter, targetCharacters));
						break;
					case Ability.TargetTypesEnum.allAllies:
						sourceCharacter = combatModel.currentTurnOwner;
						targetCharacters = combatModel.playerParty;
						abl.effect(sourceCharacter, targetCharacters);
						this.playAbilityAnimation(abl, sourceCharacter, targetCharacters);
						this.combatLogPrint(abl.generateFlavorText(sourceCharacter, targetCharacters));
						break;
					}
					this.handlePlayerTurnEnd(combatModel);
					// clear onclick now that we've used it
					this.removeAttribute("onclick");
				}
			};
			
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
		this.combatLoop(combatModel);
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
			this.combatModel.controllerState = Combat.ControllerState.runEnemy;
		}
		this.combatLoop(combatModel);
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
        	console.log("evil is vaniquished and the Deepndess saved for all time!");
        	break;
        case Combat.CombatResultEnum.enemyVictory:
        	// todo: display player defeat message and game over UI
        	console.log("and with the mole's death, darkness swept o'er all the land...");
        	break;
        case Combat.CombatResultEnum.draw:
        	// todo: display draw message and battle exit UI
        	console.log("it's a draw!");
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
		hideElement.style.display = "none";
		var showElement = document.getElementById(showElementId);
		showElement.style.display = "block";
	}
}
export {MootyWortRpgMech};