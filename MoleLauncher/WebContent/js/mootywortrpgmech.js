// imports
import {MoleUndum} from "../lib/libifels_undum.js";
import * as Characters from "../lib/characters.js";
import {Combat} from "../lib/combat.js";
import {Ability} from "../lib/spellbook.js";
/*
 * Lunar inspired telegraph hint (1:many, but not all) and induction (many similar:1) systems:
 * 1. (hint) "The grue sharpens its claws in a sliver of moonlight" -> he might use Quicksilver Cut, Shadow Slash, or Rake.
 * 2. (induction) "Crystalline shadow swirls around the grue", "Jagged amethyst thrusts through the grue's flesh, flashing in the firelight", and "Frost and stone come together to form a complicated lattice structure around the grue, which pulses ominously" -> these all mean that he's about to use Diamond Dust.
 * 
 * I love the Lunar 1:1 situation where one animation always indicates one ability, but a little uncertainty and/or complexity could really add to it.  Probably best place to shove this system into our current combat model would be at the top of a new round, after the Ai has decided what it's doing and before we process player input such that player can see the telegraph text before choosing their action. 
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
		 * Object literal association of Character ids to associated UI objects sack
		 */
		this.characterUiDict = {
		/* e.g.
				"mole": {
					"characterObj": playerCharacter, // would be this.charactersDict["mole"]
					"canvasElement": playerCharacterSprite_Canvas, 
					"canvasContainerElement": layerCharacterSprite_Span
					"nameElement": playerCharacterName_Div,
					"hpElement": playerCharacterCurrentHp_Span,
					"hpProgressElement": playerCharacterHp_Progress,
					"mpElement": playerCharacterCurrentMp_Span,
					"mpProgressElement": playerCharacterMp_Progress
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
		this.openBattleUi(combatDriver);
		// kick off combat 
		this.combatLoop(combatDriver);
	}
	/**
	 * Call stepCombat() async so we can establish a loop that can loopback at any point from any place without
	 * risking stack overflow
	 * @return the next state after our eventual call to stepCombat() here
	 */
	async combatLoop(combatModel) {
		// await is necessary to pop us off the call stack and get enqueued in the message Q
		// todo: how come await stepCombat() didn't work?  
		// todo: am I right that async (plus, I guess await) puts you in a message Q which is processed on the main
		//  and only JS thread and therefore
		//  the code in/after await will happen deterministically after the rest of the code in the function
		//  that called combatLoop() has finished executing?
		await 1;
		return this.stepCombat(combatModel);
	}
	/**
	 * Combat controller function that serves as the combat main() loop
	 * @param combatModel the current Combat object
	 * @return the current combat controller state
	 */
	stepCombat(combatModel) {
		// todo: add numeric results after effects affecting stats go off,
		//  e.g. don't say that the enemy used dark_star but do say the mole suffered
		//  N damage; that way it's more clear when abilities actually fire and the player
		//  doesn't have to do their own arithmetic after the fact to figure out how effective 
		//  something was.
		var state = combatModel.controllerState;
		if(state === Combat.ControllerState.beginNewRound) {
			// clear out any existing targeted functions
			this.clearTargetedHandlers();
			// close out the old round and open the new one
			if(combatModel.roundCount > 0) {
				this.combatRoundPrint(combatModel, false);
			}
			let postStatusState = combatModel.processRoundTop();
			this.combatRoundPrint(combatModel, true);
			// print anything that happened during top o' the round
			this.combatLogPrint(combatModel.combatLogContent, MootyWortRpgMech.MessageCat.CAT_INFO);
			combatModel.combatLogContent = "";
			// update character portraits with status info
			this.updateCharacterBattleImages(combatModel);
			// sync character stat display with data model
			this.updateCharacterData(combatModel);
			this.updateCharacterStatusStacks(combatModel);
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
				),
				MootyWortRpgMech.MessageCat.CAT_ENEMY_TELEGRAPH
			);
			// command selection subphase of player input phase
			this.populatePlayerCommandList(combatModel);
		} else if(state === Combat.ControllerState.runEnemy) {
			// todo: check enemy status effects for anything that would prevent the use of their
			// chosen ability
			// todo: probably at least some of this should be moved to Combat model class
			let selectedAbility = combatModel.currentSelectedAbility;
			let sourceCharacter = combatModel.currentTurnOwner;
			let targetCharacters = undefined;
			// check if currently active enemy can still afford their chosen abl
			if(combatModel.currentTurnOwner.canAffordCost(selectedAbility)) {
				// apply ability effect
				switch(selectedAbility.targetType) {
				case Ability.TargetTypesEnum.personal:
					targetCharacters = [sourceCharacter];
					selectedAbility.effect(sourceCharacter);
					combatModel.combatLogContent = selectedAbility.generateFlavorText(combatModel.currentTurnOwner);
					break;
				case Ability.TargetTypesEnum.allAllies:
					targetCharacters = combatModel.enemyParty;
					selectedAbility.effect(combatModel.currentTurnOwner, targetCharacters);
					combatModel.combatLogContent = selectedAbility.generateFlavorText(combatModel.enemyParty);
					break;
				case Ability.TargetTypesEnum.allEnemies:
					targetCharacters = combatModel.playerParty;
					selectedAbility.effect(combatModel.currentTurnOwner, targetCharacters);
					combatModel.combatLogContent = selectedAbility.generateFlavorText(combatModel.playerParty);
					break;
				case Ability.TargetTypesEnum.singleTarget:
					targetCharacters = [combatModel.currentTargetCharacter];
					selectedAbility.effect(combatModel.currentTurnOwner, combatModel.currentTargetCharacter);
					combatModel.combatLogContent = selectedAbility.generateFlavorText(combatModel.currentTurnOwner, combatModel.currentTargetCharacter);
					break;
				}
				this.combatLogPrint(combatModel.combatLogContent, MootyWortRpgMech.MessageCat.CAT_ENEMY_ACTION);
				this.showSpellEffect(sourceCharacter, targetCharacters, selectedAbility.id, () => {
					this.updateCharacterData(combatModel);
					this.handleEnemyTurnComplete(combatModel);
				});
			} else {
				this.combatLogPrint(
					combatModel.currentTurnOwner.name + " feebly attempts to enact " + combatModel.currentSelectedAbility.name + " but falters in " + combatModel.currentTurnOwner.getPronoun_possessive() + " exhaustion!",
					MootyWortRpgMech.MessageCat.CAT_ENEMY_ACTION
				);
				this.handleEnemyTurnComplete(combatModel);
			}
		}
		// reset combat log content at the bottom of the step
		combatModel.combatLogContent = "";
		return combatModel.controllerState;
	}
	/**
	 * Scrolls the combat log div to the bottom of its current total content
	 */
	scrollCombatLog() {
		var combatLog = document.getElementById("combatLog");
		combatLog.scrollTo(0, combatLog.scrollHeight);
	}
	/**
	 * Sets the onclick function back to null for each character's canvas element
	 */
	clearTargetedHandlers() {
		for(let [targetCharacterId, uiEntry] of Object.entries(this.characterUiDict).concat(Object.entries(this.characterUiDict))) {
			uiEntry.canvasElement.onclick = null;
		}
	}
	/**
	 * Makes the spell FX overlay canvas visible and populates it with
	 * the FX data associated with the given spellId available on the given character
	 * @param sourceCharacter the Character object casting the spell, in whose Entity.spellDict 
	 *        the spell object and its FX data can be found
	 * @param targetCharacters an array of one or more Character objects who are the target(s) of the spell;
	 *        The targetCharacters are used to id the canvas that should display the pain state anim
	 *        after the spell FX anim completes. 
	 * @param spellId the string id of the spell whose FX should render
	 * @param callbackFunction no-arg function to be called when the animation is complete
	 */
	showSpellEffect(sourceCharacter, targetCharacters, spellId, callbackFunction) {
		var rpgMechHandle = this;
		var overlayCanvas = this.showSpellEffectOverlay();
		
		// XMLHTTPRequest on up our json fx data file, and put the usage of its data in a lambda
		//  that'll get called once the file is loaded 
		var spell = sourceCharacter.entity.spellsDict[spellId];
		var request = new XMLHttpRequest();
		request.open('GET', spell.fxDataFileName);
		request.responseType = 'json';
		request.onload = function() {
			// since we indicated responseType json, our response should already by a JS object defining our FX data
			var fxData = request.response;
			var fxType = fxData.type;
			var sheetDataArray = undefined;
			if(fxType === "spritesheet") {
				sheetDataArray = [fxData];
			} else if(fxType === "spritesheet_array") {
				sheetDataArray = fxData.resArray;
			}
			var sheetDataIdx = 0;
			for(let sheetData of sheetDataArray) {
				let fps = sheetData.frameRate;
				// load spritesheet image file
				let fxImage = new Image();
				fxImage.addEventListener('load', function() {
					// show spell anim in overlay
					let frameSkipCount = 0;
					let frameIdx = 0;
					let sheetAnimFn = function(elapsedTime) {
						if (frameSkipCount == 0) {
							// action frame!
							rpgMechHandle.drawSpellFxFrame(fxImage, sheetData, frameIdx, overlayCanvas);
							frameIdx++;
						}
	
						if (frameIdx < sheetData.frameCount) {
							window.requestAnimationFrame(sheetAnimFn);
						} else {
							// inc sheet count and only hide overlay/forward cb
							// once we're done with all spritesheets we need to anim
							sheetDataIdx++;
							if(sheetDataIdx === sheetDataArray.length) {
								rpgMechHandle.hideSpellEffectOverlay();
								// forward our cb to the next anim
								rpgMechHandle.playPainAnimation(
									targetCharacters, callbackFunction
								);
							}
						}
	
						frameSkipCount++;
						// skip a number of frames equal to the frames/second we're likely to get from
						// requestAnimationFrame() (60fps) minus the desired frames/second for this particular
						// animation
						if(frameSkipCount >= 60 - fps) {
							frameSkipCount = 0;
						}
					}
					window.requestAnimationFrame(sheetAnimFn);
				}, false);
				fxImage.src = sheetData.resName;
			}
		}
		request.send();
	}
	/**
	 * Shows the spell FX overlay over the entire modal, but doesn't load and
	 * spell FX; useful for overlaying messages over the whole combat UI
	 * @return the revealed spell effect overlay canvas element
	 */
	showSpellEffectOverlay() {
		var overlayCanvas = document.getElementById("effectsOverlayCanvas");
		overlayCanvas.style.width = "100%";
		overlayCanvas.style.height = "100%";
		overlayCanvas.width = overlayCanvas.offsetWidth;
		overlayCanvas.height = overlayCanvas.offsetHeight;
		return overlayCanvas;
	}
	/**
	 * Makes the spell FX overlay canvas invisible
	 * @return the hidden spell effect overlay canvas element
	 */
	hideSpellEffectOverlay() {
		var overlayCanvas = document.getElementById("effectsOverlayCanvas");
		overlayCanvas.style.width = "0px";
		overlayCanvas.style.height = "0px";
		overlayCanvas.width = overlayCanvas.offsetWidth;
		overlayCanvas.height = overlayCanvas.offsetHeight;
		return overlayCanvas;
	}
	/**
	 * Draws a spell FX spritesheet animation, scaling automatically to cover the given canvas with each frame
	 * @param spriteSheetImage Image object that already has its src loaded from the given spriteSheetData.resName
	 * @param spriteSheetData object literal containing a spritesheet image location and data re: how to draw it
	 * @param frameIdx integer 0-based index of the animation frame we want to draw 
	 * @param canvas the Canvas we want to draw on
	 */
	drawSpellFxFrame(spriteSheetImage, spriteSheetData, frameIdx, canvas) {
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
				spriteSheetImage,
				srcX,
				srcY,
				srcWidth,
				srcHeight,
				0,
				0,
				dstWidth,
				dstHeight
		);
	}
	/**
	 * Draws targeting reticle over the given canvas
	 */
	drawTarget(canvas) {
		var context2d = canvas.getContext('2d');
		var reticleImage = new Image();
		reticleImage.addEventListener('load', () => {
			// draw the image frame
			context2d.drawImage(
				reticleImage,
				0,
				0,
				canvas.width,
				canvas.height
			);
		});
		reticleImage.src = "images/reticle.png";
	}
	/**
	 * Restores the character image as its only canvas content
	 */
	refreshCharacterCanvas(uiEntry) {
		// redraw sprite 
		var context2d = uiEntry.canvasElement.getContext('2d');
		var characterImage = new Image();
		characterImage.addEventListener('load', function() {
			context2d.clearRect(0, 0, uiEntry.canvasElement.width, uiEntry.canvasElement.height);
			context2d.drawImage(characterImage, 0, 0);
		});
		characterImage.src = uiEntry.characterObj.battleSprites[uiEntry.characterObj.spriteIdx];
	}
	/**
	 * Restores all character images as each canvas's only content
	 */
	refreshCharacterCanvases() {
		for(let [characterId, uiEntry] of Object.entries(this.characterUiDict)) {
			this.refreshCharacterCanvas(uiEntry);
		}
	}
	/**
	 * Plays out the pain state wiggle and flash red animation
	 * on the given character UI data's canvas
	 * @param characters an array of Character objects whose ids can be used to lookup UI data
	 * @param callbackFunction no-arg function to be called when the animation completes
	 */
	playPainAnimation(characters, callbackFunction) {
		// track completed animations
		var completedAnimationsCounter = 0;
		
		for(character of characters) {
			// show hurt anim on target sprite
			var characterUiData = this.characterUiDict[character.id];
			var characterCanvas = characterUiData.canvasElement;
			var context2d = characterCanvas.getContext("2d");
			var alphaPerc = 1.0;
			var lastFrameTime = undefined;
			var frameCount = 0;
			var characterImage = new Image();
			characterImage.addEventListener('load', function() {
				console.log("character sprite loaded");
				// ok, we've got our sprite image ref afresh
				// start shake anim
				characterCanvas.style.animation = "shake 0.5s";
				characterCanvas.style.animationIterationCount = "infinite";
	
				// define animation loop
				var painAnimFn = function(frameTimestamp) {
					// init assign
					if (lastFrameTime === undefined) {
						lastFrameTime = frameTimestamp;
					}
					// measure time since last frame (initially 0)
					var elapsedTimeSinceLastFrame = frameTimestamp - lastFrameTime;
					frameCount++;
	
					// redraw sprite 
					context2d.drawImage(characterImage, 0, 0);
					// draw increasingly translucent red over the sprite
					context2d.fillStyle = "rgba(255, 0, 0, " + alphaPerc + ")";
					context2d.fillRect(0, 0, characterCanvas.width, characterCanvas.height);
					if (frameCount >= 5 && alphaPerc > 0) {
						// decrease opacity
						alphaPerc -= elapsedTimeSinceLastFrame / 100;
						frameCount = 0;
					}
					if (alphaPerc == 0) {
						// end anim and call cb iff all animations have completed
						characterCanvas.style.animation = "";
						characterCanvas.style.animationIterationCount = "";
						completedAnimationsCounter++;
						if(completedAnimationsCounter == characters.length && callbackFunction) {
							callbackFunction();
						}
					} else {
						if (alphaPerc < 0) {
							// we underflowed; set 0 and let one more frame go by to give us the unfiltered image as the final render
							alphaPerc = 0;
						}
						window.requestAnimationFrame(painAnimFn);
					}
					// update lastFrametime now that this frame is processed 
					lastFrameTime = frameTimestamp;
				}
				// kick off animation
				window.requestAnimationFrame(painAnimFn);
			}, false);
			// set image src to kick off loading
			var character = characterUiData.characterObj;
			characterImage.src = character.battleSprites[character.spriteIdx];
		}
	}
	/**
	 * Tear down the battle UI, bringing back Undum story page
	 * @param combatModel the current Combat object
	 */
	closeCombatUi(combatModel) {
		// hide the combat mode modal
		var combatUI = document.getElementById("combatModal");
		combatUI.style.display = "none";
		// show the normal Undum UI
		var undumPage = document.getElementById("page");
		undumPage.style.display = "block";
		// todo: update Undum page with/based on results
	}
	/**
	 * Processes (displays or removes) a status effect icon stack on the afflicted character's portrait;
	 * if the status effect stack is empty and removed, the status effect object is removed from the
	 * character
	 * @param character the afflicted Character object
	 * @param statusEffect the status effect causing the affliction
	 * @param tickedOffEffectIds an array to be filled with the IDs any status effects whose duration has ended and whose
	 *        icon stack has been removed
	 */
	processStatusEffectStack(character, statusEffect, tickedOffEffectIds) {
		var targetCanvasContainer = this.characterUiDict[character.id].canvasContainerElement;
		var stackId = character.id+'_'+statusEffect.id+'_icon_stack';
		var stackDiv = document.getElementById(stackId);
		if(stackDiv) {
			stackDiv.remove();
		}
		// only bother with icon images if remaining duration is gt 0; else we'll just remove the stack
		// and do nothing more
		if(statusEffect.ticks > 0) {
			// create the DIV that will be our stack column
			stackDiv = document.createElement('div');
			stackDiv.id = character.id+'_'+statusEffect.id+'_icon_stack';
			stackDiv.className = 'character-status-effect-stack';
			
			// load up the image icon; it's dupped for each icon in the stack, so we only need
			// the one resource
			var effectImage = new Image();
			effectImage.addEventListener('load', () => {
				targetCanvasContainer.appendChild(stackDiv);
				console.log("status stack; adding stackdiv with offset dimens "+stackDiv.offsetWidth+"x"+stackDiv.offsetHeight+
						" to targetcanvascontainer with offset dimens "+targetCanvasContainer.offsetWidth+"x"+targetCanvasContainer.offsetHeight);
				// offset stack div from left by its index in the character's status effect array
				var effectIndex = character.statusEffects.findIndex(element => {
		            return element.id === statusEffect.id;
		        });
				stackDiv.style.left = (stackDiv.offsetWidth * effectIndex)+'px';
				for(let durationIdx = 0; durationIdx < statusEffect.ticks; durationIdx++) {
					// create our icon canvasi tag and set its src to the Image we loaded earlier
					let icon = document.createElement('canvas');
					icon.className = 'character-status-effect-stack-image';
					// append to parent so our offset dimens are applied
					stackDiv.appendChild(icon);
					// gradually offset up from the bottom to simulate dropping icons in a stack
					icon.style.bottom = (durationIdx * icon.offsetHeight) + 'px';
					// now that we have offset dimens, define canvas raw dimens and draw
					icon.width = icon.offsetWidth;
					icon.height = icon.offsetHeight;
					icon.getContext('2d').drawImage(effectImage, 0, 0, icon.offsetWidth, icon.offsetHeight);
					console.log("status stack; adding icon canvas with dimens "+icon.width+"x"+icon.height+
							" and offset dimens "+icon.offsetWidth+"x"+icon.offsetHeight);
					console.log("status stack; icon canvas added to stackdiv with offset dimens "+stackDiv.offsetWidth+"x"+stackDiv.offsetHeight);
				}
			});
			effectImage.src = statusEffect.imageUrl;
		} else {
			tickedOffEffectIds.push(statusEffect.id);
		}
	}
	/**
	 * Set up the battle UI, associating character objects with their associated HTML elements 
	 * @param combatModel the current Combat object
	 */
	openBattleUi(combatModel) {
		// hide the normal Undum UI
		var undumPage = document.getElementById("page");
		undumPage.style.display = "none";
		// show the combat mode modal
		var combatUI = document.getElementById("combatModal");
		combatUI.style.display = "flex";
	    
		// player party UI 
		var playerView_Div = document.getElementById("playerView");
		var playerCharacterImageContainer_Div = document.getElementById("playerSpritesContainer");
		var playerCharacterDataContainer_Div = document.getElementById("playerDataContainer");
		for(let playerCharacter of combatModel.playerParty) {
			// player character sprites
			let playerCharacterSprite_Span = document.createElement("span");
			playerCharacterSprite_Span.className = 'character-image-player-span';
			let playerCharacterSprite_Canvas = document.createElement("canvas");
			playerCharacterSprite_Canvas.className = "character-image-player";
			// need an HTML Image whose load cb will draw itself on the Canvas
			var playerCharacterSprite_Image = new Image(); // Create new Image element
			playerCharacterSprite_Image.addEventListener('load', function() {
				// execute drawImage statements now that image has loaded
				playerCharacterSprite_Canvas.width = this.width;
				playerCharacterSprite_Canvas.height = this.height;
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
			this.characterUiDict[playerCharacter.id] = {
					"characterObj": playerCharacter,
					"canvasElement": playerCharacterSprite_Canvas, 
					"canvasContainerElement": playerCharacterSprite_Span,
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
			enemyCharacterSprite_Span.className = 'character-image-enemy-span';
			enemyCharacterImageContainer_Div.appendChild(enemyCharacterSprite_Span);
			let enemyCharacterSprite_Canvas = document.createElement("canvas");
			enemyCharacterSprite_Canvas.id = enemyCharacter.id;
			enemyCharacterSprite_Canvas.className = "character-image-enemy";
			// need an HTML Image whose load cb will draw itself on the Canvas
			var enemyCharacterSprite_Image = new Image(); // Create new Image element
			enemyCharacterSprite_Image.addEventListener('load', function() {
				// execute drawImage statements now that image has loaded
				enemyCharacterSprite_Canvas.width = this.width;
				enemyCharacterSprite_Canvas.height = this.height;
				enemyCharacterSprite_Canvas.getContext('2d').drawImage(this, 0, 0, enemyCharacterSprite_Canvas.width, enemyCharacterSprite_Canvas.height);
				console.log("enemy "+enemyCharacter.name+"'s canvas dimens are "+enemyCharacterSprite_Canvas.width+"x"+enemyCharacterSprite_Canvas.height);
		    }, false);
			enemyCharacterSprite_Image.src = enemyCharacter.battleSprites[0];
			enemyCharacterSprite_Span.appendChild(enemyCharacterSprite_Canvas);
			
			let enemyCharacterName_Span = document.createElement("span");
			enemyCharacterName_Span.className = "enemy-name";
			enemyCharacterName_Span.innerHTML = enemyCharacter.name + " ";
			enemyCharacterData_Div.appendChild(enemyCharacterName_Span);
			let enemyCharacterHp_Progress = document.createElement("progress");
			// progress element value expects a ration expressed as value between 0 and 1, 
			// so set it to our stat ratio directly
			enemyCharacterHp_Progress.value = 
				enemyCharacter.stats["hp"]/enemyCharacter.stats["maxHP"];
			enemyCharacterData_Div.appendChild(enemyCharacterHp_Progress);
			
			this.characterUiDict[enemyCharacter.id] = {
					"characterObj": enemyCharacter,
					"canvasElement": enemyCharacterSprite_Canvas, 
					"canvasContainerElement": enemyCharacterSprite_Span,
					"hpProgressElement": enemyCharacterHp_Progress
			};
		}
		
		// now that modal content is loaded, do centering calc
		// todo: call this from window resize events
		this.centerElementInWindow(combatUI);
		// center the center of combat log vertically
		this.alignByElementCenterOnY(document.getElementById("combatLog"));
	}
	
	/**
	 * Translates the element on Y by -0.5*offsetHeight to account for the fact that
	 * origin point aligns with upper left corner of the element rather than its center
	 * and therefore top: 50% style can lead to very 'bottom-heavy' elements if the element's height
	 * is non-trivial
	 */
	alignByElementCenterOnY(element) {
		var nudgeUp = -0.5 * element.offsetHeight;
		console.log("alignByElementCenterOnY; nudging "+element.id+" up by "+nudgeUp+" pixels");
		element.style.transform = "translateY("+nudgeUp+"px)";
	}
	
	/**
	 * Centers the element
	 * @param element the DOM element to be centered
	 */
	centerElementInWindow(element) {
        var elementWidth = element.offsetWidth;
        // todo: why is offsetHeight not accounting for the height 75% constraint?
        var elementHeight = element.offsetHeight;
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        element.style.top = ((windowHeight - elementHeight) / 2 + window.pageYOffset) + "px";
        if(parseInt(element.style.top, 10) < 0) {
        	element.style.top = "0px";
        }
        element.style.left = ((windowWidth - elementWidth) / 2 + window.pageXOffset) + "px";
        if(parseInt(element.style.left, 10) < 0) {
        	element.style.left = "0px";
        }
        console.log("centerElement; window height is "+windowHeight+" and elem height is "+elementHeight+", and pageYOffset is "+window.pageYOffset+
        		", so we're going to set top to "+element.style.top);
    }
	/**
	 * Update the Character stat display based on combat data model
	 * @param combatModel current Combat object
	 */
	updateCharacterData(combatModel) {
		for(const player of combatModel.playerParty) {
			let uiHandle = this.characterUiDict[player.id];
			uiHandle.hpElement.innerHTML = Math.ceil(player.stats["hp"]);
			uiHandle.hpProgressElement.value = player.stats["hp"] / player.stats["maxHP"];
			uiHandle.mpElement.innerHTML = Math.ceil(player.stats["mp"]);
			uiHandle.mpProgressElement.value = player.stats["mp"] / player.stats["maxMP"]
		}
		for(const enemy of combatModel.enemyParty) {
			let uiHandle = this.characterUiDict[enemy.id];
			uiHandle.hpProgressElement.value = enemy.stats["hp"] / enemy.stats["maxHP"];
		}
	}
	/**
	 * Update the Character status effects image stacks
	 * @param combatModel current Combat object
	 */
	updateCharacterStatusStacks(combatModel) {
		var tickedOffEffectIds = [];
		for(const player of combatModel.playerParty) {
			for(const statusEffect of player.statusEffects) {
				this.processStatusEffectStack(player, statusEffect, tickedOffEffectIds);
			}
			for(const id of tickedOffEffectIds) {
				// we're done with this status effect in the ui, so go ahead and remove from model
				MoleUndum.removeStatusEffectById(player, id);
			}
			tickedOffEffectIds.splice(0, tickedOffEffectIds.length);
		}
		for(const enemy of combatModel.enemyParty) {
			for(const statusEffect of enemy.statusEffects) {
				this.processStatusEffectStack(enemy, statusEffect, tickedOffEffectIds);
			}
			for(const id of tickedOffEffectIds) {
				// we're done with this status effect in the ui, so go ahead and remove from model
				MoleUndum.removeStatusEffectById(enemy, id);
			}
			tickedOffEffectIds.splice(0, tickedOffEffectIds.length);
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
		var combatCommandList = document.getElementById("combatCommands");
		// clear current command list
		combatCommandList.innerHTML = "";
		var colCount = 0;
		for(const [ablId, abl] of Object.entries(combatModel.currentTurnOwner.entity.spellsDict)
				.sort((a, b) => a[1].name.localeCompare(b[1].name))) {
			if(colCount == 0) {
				let commandRow = document.createElement("tr");
				combatCommandList.appendChild(commandRow);
			}
			if(colCount < 3) {
				let commandCell = document.createElement("td");
				commandCell.className = "command-button";
				// todo: check if we can afford the cost here instead of in onclick, and if not then gray-out the button and don't install onclick
				let longClickTimerFn;
				let longClicked = false;
				let touchDown = e => { 
					longClickTimerFn = window.setTimeout(() => {
						this.combatLogPrint(abl.getHint(), MootyWortRpgMech.MessageCat.CAT_ABILITY_HINT);
						longClicked = true;
					}, 500);
				};
				let touchUp = e => {
					window.clearTimeout(longClickTimerFn);
					// don't want to block the onclick handler if we didn't wait 
					// requisite time for longpress
					if(longClicked) {
						longClicked = false;
					} else {
						commandCell.customClickHandler();
					}
				};
				commandCell.addEventListener('mousedown', touchDown);
				commandCell.addEventListener('mouseup', touchUp);
				commandCell.addEventListener('touchstart', touchDown);
				commandCell.addEventListener('touchend', touchUp);
				commandCell.customClickHandler = () => {
					if(combatModel.currentTurnOwner.canAffordCost(abl)) {
						// we can afford the cost of the chosen abl, so go ahead with targeting etc.
						if(abl.targetType === Ability.TargetTypesEnum.singleTarget) {
							for(let [targetCharacterId, uiEntry] of Object.entries(this.characterUiDict).concat(Object.entries(this.characterUiDict))) {
								this.drawTarget(uiEntry.canvasElement);
								uiEntry.canvasElement.onclick = () => {
									this.refreshCharacterCanvases();
									let sourceCharacter = combatModel.currentTurnOwner;
									let targetCharacter = combatModel.findCombatant(targetCharacterId);
									abl.effect(sourceCharacter, targetCharacter);
									this.showSpellEffect(sourceCharacter, [targetCharacter], abl.id, () => {
										this.combatLogPrint(abl.generateFlavorText(sourceCharacter, targetCharacter), MootyWortRpgMech.MessageCat.CAT_PLAYER_ACTION);
										this.updateCharacterData(combatModel);
										this.handlePlayerTurnComplete(combatModel);
										console.log("command list item onclick closure; this is "+this+" with own props "+Object.entries(this));
										// clear onclicks now that we've used them
										uiEntry.canvasElement.onclick = null;
										commandCell.onclick = null;
									});
								}
							}
						} else {
							// gotta refresh portraits in case we started 
							// targeting someone and then changed to a diff abl
							this.refreshCharacterCanvases();
							let sourceCharacter = combatModel.currentTurnOwner;
							let targetCharacters = undefined;
							switch(abl.targetType) {
							case Ability.TargetTypesEnum.personal:
								targetCharacters = [sourceCharacter];
								abl.effect(sourceCharacter);
								this.combatLogPrint(abl.generateFlavorText(sourceCharacter), MootyWortRpgMech.MessageCat.CAT_PLAYER_ACTION);
								break;
							case Ability.TargetTypesEnum.allEnemies:
								targetCharacters = combatModel.enemyParty;
								abl.effect(sourceCharacter, targetCharacters);
								this.combatLogPrint(abl.generateFlavorText(sourceCharacter, targetCharacters), MootyWortRpgMech.MessageCat.CAT_PLAYER_ACTION);
								break;
							case Ability.TargetTypesEnum.allAllies:
								targetCharacters = combatModel.playerParty;
								abl.effect(sourceCharacter, targetCharacters);
								this.combatLogPrint(abl.generateFlavorText(sourceCharacter, targetCharacters), MootyWortRpgMech.MessageCat.CAT_PLAYER_ACTION);
								break;
							}
							this.showSpellEffect(sourceCharacter, targetCharacters, abl.id, () => {
								this.updateCharacterData(combatModel);
								this.handlePlayerTurnComplete(combatModel);
								// clear onclick now that we've used it
								commandCell.onclick = null;
							});
						}
					} else {
						// tell user to pick something else
						this.combatLogPrint(
							""+combatModel.currentTurnOwner.name+" lacks the reserves to manage "+abl.name+"; try something else.  Remember that your heroic attacks can revitalize your mana!",
							MootyWortRpgMech.MessageCat.CAT_PLAYER_ACTION
						);
					}
					
				};
				
				var commandText = document.createTextNode(abl.name);
				commandCell.appendChild(commandText);
				combatCommandList.appendChild(commandCell);
				
				// inc col count and check for col cap
				colCount++;
				if(colCount >= 3) {
					colCount = 0;
				} 
			}
		}
	}
	/**
	 * Completes an enemy AI's turn, activating next living enemy or telling controller 
	 * we're ready for a new round if all enemies' turns are complete. 
	 * @param combatModel current Combat object
	 */
	handleEnemyTurnComplete(combatModel) {
		// set state to beginNewRound iff there are no more living enemies to process
		// otherwise, advance turn owner to next enemy
		var nextLivingEnemy = MoleUndum.findFirstLivingCharacter(
				combatModel.enemyParty, 
				MoleUndum.findCharacterIndex(combatModel.enemyParty, combatModel.currentTurnOwner.id)
		);
		if(nextLivingEnemy !== undefined) {
			combatModel.currentTurnOwner = nextLivingEnemy;
		} else {
			// hand off back to first player character
			combatModel.currentTurnOwner = combatModel.playerParty[0];
			// indicate we're starting a new round
			combatModel.controllerState = Combat.ControllerState.beginNewRound;
		}
		
		// todo: ideally we'd be calling this updateCharacterStatusStacks outside of the beginNewRound state
		//  up in stepCombat if we just added a status effect, so we could e.g. have relevant abilities' effect()
		//  return a status effect if one was applied? 
		
		// update status stacks 
		this.updateCharacterStatusStacks(combatModel);
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
		var nextLivingPlayer = MoleUndum.findFirstLivingCharacter(
				combatModel.playerParty, 
				MoleUndum.findCharacterIndex(combatModel.playerParty, combatModel.currentTurnOwner.id)
		);
		if(nextLivingPlayer !== undefined) {
			combatModel.currentTurnOwner = nextLivingPlayer; 
		} else {
			// hand off control to first enemy since we're doing fixed turn order
			combatModel.currentTurnOwner = combatModel.enemyParty[0];
			// put us in runEnemy state so the next loop will start processing AI decision
			combatModel.controllerState = Combat.ControllerState.runEnemy;
		}
		// update status stacks 
		this.updateCharacterStatusStacks(combatModel);
		this.combatLoop(combatModel);
	}
	/**
	 * Prints the current combat round to the console
	 * @param combatModel the current Combat object
	 * @param openRound boolean indicating whether we're opening or closing a round
	 */
	combatRoundPrint(combatModel, openRound) {
		var combatLog = document.getElementById("combatLog");
		combatLog.appendChild(document.createElement('br'));
		var logTextNode = document.createTextNode("<"+(openRound ? "" : "/")+"Round "+combatModel.roundCount+">");
		combatLog.appendChild(logTextNode);
	}
	/**
	 * Creates a new \<p\> tag, puts the given text in it, and appends it to the combat log
	 * @param logString a string to append to the log
	 * @param category enum ordinal from MootyWortRpgMech.MessageCat indicating what sort of message we're printing
	 */
	combatLogPrint(logString, category) {
		// no need to print anything if we've received nothing
		if(logString) {
			var combatLog = document.getElementById("combatLog");
			combatLog.appendChild(document.createElement("br"));
			var catImg = document.createElement("img");
			catImg.style.display = "inline";
			catImg.style.position = "relative";
			catImg.style.width = "32px";
			catImg.style.height = "32px";
			var arrowTextNode = document.createTextNode("----------->");
			combatLog.appendChild(catImg);
			combatLog.appendChild(arrowTextNode);
			var logTextNode = document.createTextNode(logString);
			combatLog.appendChild(logTextNode);
			switch(category) {
				case MootyWortRpgMech.MessageCat.CAT_PLAYER_ACTION:
					catImg.src = "images/mole_icon.png";
					// scroll to current bottom of combat log so player's eye lands on the first
					// event after they input a command, the outcome of that command
					this.scrollCombatLog();
					break;
				case MootyWortRpgMech.MessageCat.CAT_ABILITY_HINT:
					catImg.src = "images/info_icon.svg";
					// scroll to current bottom of combat log so player's eye lands on the 
					// ability hint text
					this.scrollCombatLog();
					break;
				case MootyWortRpgMech.MessageCat.CAT_ENEMY_ACTION:
					catImg.src = "images/skull_icon.jpg";
					break;
				case MootyWortRpgMech.MessageCat.CAT_ENEMY_TELEGRAPH:
					catImg.src = "images/Apport_logo.svg";
					break;
				case MootyWortRpgMech.MessageCat.CAT_INFO:
					catImg.src = "images/info_icon.svg";
					break;
			}
		}
	}
	/**
	 * Hides the combat UI and draws the combat result message on the spell FX overlay canvas
	 * @param resultString a string to replace the UI with
	 */ 
	displayResult(resultString) {
		// prepare overlay and hide combat UI
		this.showSpellEffectOverlay();
		this.hideModalContent();
		var overlayCanvas = document.getElementById('effectsOverlayCanvas');
		var context2d = overlayCanvas.getContext('2d');
		// write text message in center of overlay
		context2d.font = "30px Arial";
		context2d.fillStyle = "purple";
		context2d.textAlign = "center";
		this.multiLineFillText(overlayCanvas, 30, resultString);
		// draw exit door image at the bottom center of the overlay canvas
		var exitDoorImage = new Image();
		exitDoorImage.addEventListener('load', () => {
			var doorWidth = overlayCanvas.width/3;
			var doorHeight = overlayCanvas.height/3;
			var doorDestX = overlayCanvas.width/2 - doorWidth/2;
			var doorDestY = overlayCanvas.height - doorHeight;
			context2d.drawImage(
				exitDoorImage,
				doorDestX,
				doorDestY,
				doorWidth,
				doorHeight
			);
			// install onclick handler in the door image that hides div combatModal and shows div page
			overlayCanvas.onclick = (clickEvent) => {
				if(clickEvent.clientX >= doorDestX && clickEvent.clientX <= doorDestX + doorWidth &&
						clickEvent.clientY >= doorDestY && clickEvent.clientY <= doorDestY+doorHeight) {
					var combatModal = document.getElementById('combatModal');
					combatModal.style.display = 'none';
					var undumPage = document.getElementById('page');
					undumPage.style.display = 'block';
				}
			};
		});
		exitDoorImage.src = 'images/cave_exit.png';
	}
	/**
	 * Calls fillText() multiple times on the given canvas' context2d until the complete
	 * string has been printed without overrunning horizontally
	 * @param canvas the Canvas object on which we wish to render text over potentially multiple lines
	 * @param heightPx the height of the characters in the given string
	 * @param bigString the string that may need multiple lines to avoid running off the canvas horizontally
	 * todo: vertical overflow support?
	 */
	multiLineFillText(canvas, heightPx, bigString) {
		var context2d = canvas.getContext('2d');
		var totalWidth = context2d.measureText(bigString).width;
		var characterWidth = totalWidth/bigString.length;
		var charactersPerLine = Math.floor(canvas.width/characterWidth);
		var numLines = Math.ceil(totalWidth/canvas.width);
		var remainderChars = 0;
		for(let lineIdx = 0; lineIdx < numLines; lineIdx++) {
			// offset to the character that should correspond to the current line
			let startCharacterIndex = lineIdx*charactersPerLine;
			// the potential end character index is the end character index derived simply from
			// how many characters we can fit, without taking word breaks into account
			let endCharacterIndex = startCharacterIndex + charactersPerLine;
			let subStr = bigString.substring(startCharacterIndex, endCharacterIndex);
			// redefine our substring as remainder chars from the last line break + actual next substring
			// so we'll respect word breaks as well
			subStr = bigString.substring(startCharacterIndex - remainderChars, startCharacterIndex) + subStr;
			// now that we've got our final substring, we want to redefine end character index
			// in reference to it in order to do (correct) arithmetic on it later
			endCharacterIndex = subStr.length-1;
			// assume we won't have any word break to worry about at all
			let lastWhitespaceIndex = endCharacterIndex;
			// only need to worry about word breaks if there's going to be another line break
			if(lineIdx !== numLines - 1) {
				// for the actual end character index we find the last whitespace char
				// to facilitate respecting word breaks
				lastWhitespaceIndex = subStr.lastIndexOf(' ')
				if(lastWhitespaceIndex !== -1) {
					// after remainder chars has been consume this iteration, figure out how many non-whitespace 
					// characters we skipped if any; they'll be consumed by the next iteration
					remainderChars = endCharacterIndex - lastWhitespaceIndex;
					// -1 since we don't care to make room for the whitespace itself at the end of this line
					endCharacterIndex = lastWhitespaceIndex - 1;
				}
			}
			context2d.fillText(
				subStr.substring(0, endCharacterIndex+1), 
				canvas.width/2, canvas.height/2 + lineIdx*heightPx
			);
		}
	}
	/**
	 * Reset the display style property of combatModalContent to inline-block
	 */
	showModalContent() {
		var modalContentDiv = document.getElementById('combatModalContent');
		modalContentDiv.style.display = 'inline-block';
	}
	/**
	 * Set the display style property of combatModalContent to none
	 */
	hideModalContent() {
		var modalContentDiv = document.getElementById('combatModalContent');
		modalContentDiv.style.display = 'none';
	}
	/**
	 * Display victory or defeat message and provide battle exit UI 
	 */
	handleCombatResult(enumCombatResult) {
    	// combat over scenario
		switch(enumCombatResult) {
        case Combat.CombatResultEnum.playerVictory:
        	// display player victory message and battle exit UI
        	this.displayResult("🦔 evil is vanquished and the Deepness saved for all time🦉!", MootyWortRpgMech.MessageCat.CAT_PLAYER_ACTION);
        	break;
        case Combat.CombatResultEnum.enemyVictory:
        	// display player defeat message and game over UI, ideally a dark soulsy 'you died'
        	this.displayResult("💀...and with the mole's death, darkness swept o'er all the land...💀");
        	break;
        case Combat.CombatResultEnum.draw:
        	// display draw message and battle exit UI
        	this.displayResult("💥the titanic clash of the mole and the mighty devil from the depths consumes them both in a conflagration quenched only by the tsunami of shed blood💥");
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

/**
 * Enum of combat log message categories
 */
MootyWortRpgMech.MessageCat = Object.freeze(
    {
    	/**
    	 * A message regarding player action
    	 */
        CAT_PLAYER_ACTION: 1,
        /**
         * A message regarding enemy action
         */
        CAT_ENEMY_ACTION: 2,
        /**
         * A message regarding enemy telegraph
         */
        CAT_ENEMY_TELEGRAPH: 3,
        /**
         * A message regarding general info
         */
        CAT_INFO: 4
    }
);
export {MootyWortRpgMech};