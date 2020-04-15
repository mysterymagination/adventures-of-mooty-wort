/**
 * Libifels, as in lib Interactive Fiction Entity Logic System, provides utility functions and classes for Interactive Fiction in JS
 */
class Libifels {
	constructor() {
		/**
		 * Selects an ability name pseudo-randomly based on the given probability weights
		 * @param probConfigObj an object literal with ability name string keys paired with 
		 * 	 	  floating point percentage values e.g. 0.3 => 30%.  These should total 1.
		 * @return the string name of the ability chosen, as specified in the input probConfigObj
		 */
		this.chooseRandomAbility(probConfigObj) {
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
     * Adds the given element to an array iff its string rep is not present in the array yet
     * @param array the array we're modifying
     * @param element the string (or object whose string rep) will be searched for using Array.prototype.includes()
     */
    this.addUniqueStringToArray = function (array, element) {
        if (!array.includes(element)) {
            array.push(element);
        }
    }
    /**
     * Adds an object to an array, but only if it would be unique
     * @param array the array we're modifying
     * @param element the candidate to be pushed to the array
     * @param filterFn the boolean function used by Array.prototype.some() as the criterion in determining if any current elements of the array already match the incoming element
     */
    this.addUniqueToArray = function (array, element, filterFn) {
        if (!array.some(filterFn)) {
            array.push(element);
        }
    }
    /**
    Get a random Character object from an array of Character objects that can't have the given Character ID
    */
    this.randoCharacterFromArrayExceptId = function (characterArray, exceptCharacterId) {
        var eligibleCharacters = characterArray.filter(characterUnderTest => characterUnderTest.id != exceptCharacterId);
        var unluckyIndex = Math.floor(Math.random() * eligibleCharacters.length);
        return eligibleCharacters[unluckyIndex];

    }
    /**
    Applies the combat status effect to the given character, adding it to their list of statuses and triggering its effect fn
    @param character the recipient of the effect
    @param effect the status effect to apply
    */
    this.addUniqueStatusEffect: function (character, effect) {
        var statuses = character.statusEffects;
        if (!statuses.some(effectUnderTest => effect.id === effectUnderTest.id)) {
            statuses.push(effect);
            effect.effect(character);
        }
    },

    /**
    Applies the combat status effect to the given target character, adding it to their list of statuses and triggering its effect fn.
    The source character is the one who inflicted the status; this function should be used when a status effect's effect depends on the inflicting character.
    @param sourceCharacter the one who inflicted the status
    @param targetCharacter the recipient of the effect
    @param effect the status effect to apply
    */
    this.addUniqueStatusEffectWithSource: function (sourceCharacter, targetCharacter, effect) {
        var statuses = targetCharacter.statusEffects;
        if (!statuses.some(effectUnderTest => effect.id === effectUnderTest.id)) {
            statuses.push(effect);
            effect.effect(sourceCharacter, targetCharacter);
        }
    },

    /**
    Checks a given character for a given statyus effect
    @param character the Character under test
    @param effect the StatusEffect we're looking for
    @return true if the status effect is found, false otherwise
    */
    this.hasStatusEffect: function (character, effect) {
        var statuses = character.statusEffects;
        if (statuses.some(effectUnderTest => effect.id === effectUnderTest.id)) {
            return true;
        } else {
            return false;
        }
    },

    /**
    Checks a given character for a given status effect and returns the discovered status effect instance
    @param character the Character under test
    @param effectId the ID of the StatusEffect we're looking for
    @return the status effect instance if found, otherwise undefined
    */
    this.getStatusEffectById: function (character, effectId) {
        var statuses = character.statusEffects;
        return statuses.find(effectUnderTest => effectId === effectUnderTest.id);
    },

    // find index of a particular character id in a character array
    this.findCharacterIndex: function (characterArray, characterID) {
        return characterArray.findIndex(function (character) {
            return character.id === characterID;
        });
    },

    /**
    Adds this character to the $party iff they are not already a member
    @param character Character object to be added
    */
    this.addUniqueCharacterToParty: function (character) {
        var party = State.variables.party;
        if (!party.some(characterUnderTest => character.id === characterUnderTest.id)) {
            party.push(character);
        }
    },

    /**
    Returns a Character object from the array whose id matches the given id
    */
    this.findCharacterInArrayById: function (characterId, array) {
        return array.find(characterUnderTest => characterId === characterUnderTest.id);
    },

    /**
    Returns true if any Character object from the array has an id that matches the given id
    */
    this.isCharacterWithIdInArray: function (characterId, array) {
        return array.some(characterUnderTest => characterId === characterUnderTest.id);
    },

    /**
    Removes a Character from an array of Characters using splice()
    @parm character the Character to be removed from the array
    @param characterArray the array of Characters
    */
    this.removeCharacterFromArray: function (character, characterArray) {
        // find the index of the target character in the array
        var index = window.findCharacterIndex(characterArray, character.id);
        // splice the character out of the array; this modified the given array
        characterArray.splice(index, 1);
    },
                                                                   
    this.findCurrentPlayerCharacterIndex: function () {
        return State.variables.combatArena.playerParty.findIndex(function (character) {
            console.log("finding current player char index -- checking character " + character.id + " against turn owner " + State.variables.combatArena.turnOwner);
            return character.id === State.variables.combatArena.turnOwner;
        });
    },

    this.findLastLivingCharacter: function (characterArray) {
        var index = 0;
        for (index = characterArray.length - 1; index >= 0; index--) {
            var fullCharacter = State.variables.characters[characterArray[index].id];
            console.log("findLastLivingCharacter; character with id " + characterArray[index].id + " is " + (fullCharacter.living ? "living" : "dead"));
            if (fullCharacter.living) {
                return fullCharacter;
            }
        }
    },

    this.findFirstLivingCharacter: function (characterArray) {
        var index = 0;
        for (index = 0; index < characterArray.length; index++) {
            var fullCharacter = State.variables.characters[characterArray[index].id];
            console.log("findFirstLivingCharacter; character with id " + characterArray[index].id + " is " + (fullCharacter.living ? "living" : "dead"));
            if (fullCharacter.living) {
                return fullCharacter;
            }
        }
    },

    this.findNextLivingCharacter: function (characterArray, startingIndex) {
        var index = 0;
        for (index = startingIndex; index < characterArray.length; index++) {
            var fullCharacter = State.variables.characters[characterArray[index].id];
            console.log("findNextLivingCharacter; character with id " + characterArray[index].id + " is " + (fullCharacter.living ? "living" : "dead"));
            if (fullCharacter.living) {
                return fullCharacter;
            }
        }
    },

    // simulate a d20 roll
    this.rollD20: function () {
        return Math.floor(Math.random() * 20) + 1;
    },

    // simulate a dN roll, where N is given by sides param
    this.rollDie: function (sides) {
        return Math.floor(Math.random() * sides) + 1;
    },

    // simulate a d% roll
    this.rollPercentage: function () {
        return Math.floor(Math.random() * 100) + 1;
    },
    
    this.removeStatusEffect: function (character, effect) {
        var effectIndex = character.statusEffects.findIndex(function (element) {
            return element.id === effect.id;
        });
        character.statusEffects.splice(effectIndex, 1);
    },

    /**
    Combat object takes two arrays of Character objects, the player's
    party and the enemy's party.
    @param config: either an existing Combat object to be used with a copy-constructor or an object sack with parameterized fields playerParty Character array, enemyParty Character array, and destPassageName String (passage to which player should be returned after combat).
    */
    this.Combat: function Combat(config) {
        if (config.hasOwnProperty('playerTurnState')) {
            // here we were given an old instance of Combat to cc with

            // copy the own properties automatically, for simplicity.
            Object.keys(config).forEach(function (propertyName) {
                // clone() is a sugarcube built-in that returns a deep copy of the given object
                this[propertyName] = clone(config[propertyName]);
            }, this);

        }// end if copy ctor
        else {
            // here we're creating a new instance of Combat from a config property bag

            // parameterized properties
            this.playerParty = config.playerParty;
            console.log("in Combat ctor, playerParty[0].name says " + this.playerParty[0].name);
            this.enemyParty = config.enemyParty;
            this.destPassageName = config.destPassageName;

            // metadata about what state the player's turn is in.  This is necessary to help route the UI around the various actions a human player will need to input
            this.playerTurnState = window.Combat.PlayerTurnState.selectAbility;
            this.enemyTurnState = window.Combat.EnemyTurnState.runAI;
            this.combatResult = window.Combat.CombatResultEnum.pending;

            // tracks the currently selected player ability
            this.currentSelectedAbility = new window.Ability({ id: "unset", name: "unset" });

            // tracks the turn as either player or enemy group
            this.turnGroup = "player";

            // tracks the actual character id whose turn it is
            this.turnOwner = "player";

            // tracks the currently selected ability for the current turn owner
            this.abilityName = "";

            // tracks the target of the current ability
            this.currentTargetCharacter = new window.Character({ id: "unset", name: "unset" });

            // the text feedback to the user re: the state of combat
            this.combatLogContent = "What will " + State.variables.characters[this.turnOwner].name + " do?";
        }// end if new instance w/ prop bag


    }// end Combat instance def


    // Combat prototype methods - these have common behavior throughout all Combat instances, but depend on a given instance which is passed in implicitly based on calling object
    this.Combat.prototype.randoCombatantExcept: function(exceptCharacter) {
        var combatants = this.enemyParty.concat(this.playerParty);
        var eligibleCombatants = combatants.filter(combatant => combatant.id != exceptCharacter.id);
        var unluckyIndex = Math.floor(Math.random() * eligibleCombatants.length);
        return eligibleCombatants[unluckyIndex];

    }
        /**
        Concat the enemy and player party arrays, and return result
        */
    this.Combat.prototype.getAllCombatants: function() {
        return this.enemyParty.concat(this.playerParty);
    }

        /**
        Handle upkeep related to a new round beginning (i.e. top of the round to ye!)
        */
    this.Combat.prototype.processRoundTop: function() {
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
        Process the bottom of a combat round.  
        */
    this.Combat.prototype.processRoundBottom: function() {
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
            this.combatResult = window.Combat.CombatResultEnum.playerVictory;
            return false;
        } else if (dedPlayers >= this.playerParty.length) {
            this.combatResult = window.Combat.CombatResultEnum.enemyVictory;
            return false;
        } else {
            return true;
        }

    }// end processRoundBottom()

    /// begin lib dicts ///
    // Global Object mapping of prefab StatusEffects
    this.statusEffectsDict = {
    	/**
    	 * Mage armored raises DEF by RES
    	 */	
    	"mage_armor": new this.StatusEffect	({id: "mage_armor", name: "Mage Armor", duration: 3})
        /**
        Bloodlust raises STR at the expense of all mental attributes
        */
        "bloodlust": new window.StatusEffect({ id: "bloodlust", name: "Bloodlust", duration: 3 }),
        /**
        Doubt halves all confidence based attributes (STR and CHA)
        */
        "doubt": new window.StatusEffect({ id: "doubt", name: "Doubt", duration: 3 }),
        /**
        Terror gives a 35% chance to do nothing but shiver in fear
        */
        "terror": new window.StatusEffect({ id: "terror", name: "Terror", duration: 5 }),
        /**
        Poison inflicts 5% health dmg each turn, and helaves atk/def
        */
        "poison": new window.StatusEffect({ id: "poison", name: "Poison", duration: 3 }),
        /**
        Shadow makes the affected character immune to physical dmg
        */
        "shadow": new window.StatusEffect({ id: "shadow", name: "Shadow", duration: 3 }),
        /**
        Regen heals each turn
        */
        "regen": new window.StatusEffect({ id: "regen", name: "Regen", duration: 3 }),
        /**
        Confuse causes the AI to 50% redirct its chosen abl at itself
        */
        "confuse": new window.StatusEffect({ id: "confuse", name: "Confusion", duration: 3 }),
        /**
        Charm causes the afflicted character to be unable to target the character who charmed them with harmful abilities
        */
        "charm": new window.StatusEffect({ id: "charm", name: "Charm", duration: 3 }),
        /**
        Temper doubles physical attack power for 3 turns
        */
        "temper": new window.StatusEffect({ id: "temper", name: "Temper", duration: 3 }),
        /**
        Focus doubles magic attack power for 3 turns
        */
        "focus": new window.StatusEffect({ id: "focus", name: "Focus", duration: 3 }),
        /**
        Third Eye quadruples magic attack power for 3 turns at the expense of halved physical attack and defense
        */
        "third_eye": new window.StatusEffect({ id: "third_eye", name: "Third Eye", duration: 3 }),
        /**
         * Burn deals damage over time (slightly less than poison) and halves the afflicted Character's str
         */
        "burn": new this.StatusEffect({id: "burn", name: "Burn", duration: 3}),
        /**
         * Stun causes a Character in Combat to miss its next turn
         */
        "stun": new this.StatusEffect({id: "stun", name: "Stun", duration: 1}),
        /**
        Defenseless reduces the target's defensive stats by half for 3 turns
        */
        "defenseless": new window.StatusEffect({ id: "defenseless", name: "Defenseless", duration: 3 })
    }
    /// end lib dicts ///

    
}
export {Libifels};