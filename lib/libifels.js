/*
libifels, as in lib Interactive Fiction Entity Logic System, provides utility functions and classes for Interactive Fiction in JS
*/

/**
 * exported API of libifels for Undum and hypertext adventure framework elements for Undum
 */
libifels = {
    /**
     * Adds the given element to an array iff its string rep is not present in the array yet
     * @param array the array we're modifying
     * @param element the string (or object whose string rep) will be searched for using Array.prototype.includes()
     */
    addUniqueStringToArray: function (array, element) {
        if (!array.includes(element)) {
            array.push(element);
        }
    },

    /**
     * Adds an object to an array, but only if it would be unique
     * @param array the array we're modifying
     * @param element the candidate to be pushed to the array
     * @param filterFn the boolean function used by Array.prototype.some() as the criterion in determining if any current elements of the array already match the incoming element
     */
    addUniqueToArray: function (array, element, filterFn) {
        if (!array.some(filterFn)) {
            array.push(element);
        }
    },

    /**
    Get a random Character object from an array of Character objects that can't have the given Character ID
    */
    randoCharacterFromArrayExceptId: function (characterArray, exceptCharacterId) {
        var eligibleCharacters = characterArray.filter(characterUnderTest => characterUnderTest.id != exceptCharacterId);
        var unluckyIndex = Math.floor(Math.random() * eligibleCharacters.length);
        return eligibleCharacters[unluckyIndex];

    },

    /**
    Applies the combat status effect to the given character, adding it to their list of statuses and triggering its effect fn
    @param character the recipient of the effect
    @param effect the status effect to apply
    */
    addUniqueStatusEffect: function (character, effect) {
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
    addUniqueStatusEffectWithSource: function (sourceCharacter, targetCharacter, effect) {
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
    hasStatusEffect: function (character, effect) {
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
    getStatusEffectById: function (character, effectId) {
        var statuses = character.statusEffects;
        return statuses.find(effectUnderTest => effectId === effectUnderTest.id);
    },

    // find index of a particular character id in a character array
    findCharacterIndex: function (characterArray, characterID) {
        return characterArray.findIndex(function (character) {
            return character.id === characterID;
        });
    },

    /**
    Adds this character to the $party iff they are not already a member
    @param character Character object to be added
    */
    addUniqueCharacterToParty: function (character) {
        var party = State.variables.party;
        if (!party.some(characterUnderTest => character.id === characterUnderTest.id)) {
            party.push(character);
        }
    },

    /**
    Returns a Character object from the array whose id matches the given id
    */
    findCharacterInArrayById: function (characterId, array) {
        return array.find(characterUnderTest => characterId === characterUnderTest.id);
    },

    /**
    Returns true if any Character object from the array has an id that matches the given id
    */
    isCharacterWithIdInArray: function (characterId, array) {
        return array.some(characterUnderTest => characterId === characterUnderTest.id);
    },

    /**
    Removes a Character from an array of Characters using splice()
    @parm character the Character to be removed from the array
    @param characterArray the array of Characters
    */
    removeCharacterFromArray: function (character, characterArray) {
        // find the index of the target character in the array
        var index = window.findCharacterIndex(characterArray, character.id);
        // splice the character out of the array; this modified the given array
        characterArray.splice(index, 1);
    },
                                                                   
    findCurrentPlayerCharacterIndex: function () {
        return State.variables.combatArena.playerParty.findIndex(function (character) {
            console.log("finding current player char index -- checking character " + character.id + " against turn owner " + State.variables.combatArena.turnOwner);
            return character.id === State.variables.combatArena.turnOwner;
        });
    },

    findLastLivingCharacter: function (characterArray) {
        var index = 0;
        for (index = characterArray.length - 1; index >= 0; index--) {
            var fullCharacter = State.variables.characters[characterArray[index].id];
            console.log("findLastLivingCharacter; character with id " + characterArray[index].id + " is " + (fullCharacter.living ? "living" : "dead"));
            if (fullCharacter.living) {
                return fullCharacter;
            }
        }
    },

    findFirstLivingCharacter: function (characterArray) {
        var index = 0;
        for (index = 0; index < characterArray.length; index++) {
            var fullCharacter = State.variables.characters[characterArray[index].id];
            console.log("findFirstLivingCharacter; character with id " + characterArray[index].id + " is " + (fullCharacter.living ? "living" : "dead"));
            if (fullCharacter.living) {
                return fullCharacter;
            }
        }
    },

    findNextLivingCharacter: function (characterArray, startingIndex) {
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
    rollD20: function () {
        return Math.floor(Math.random() * 20) + 1;
    },

    // simulate a dN roll, where N is given by sides param
    rollDie: function (sides) {
        return Math.floor(Math.random() * sides) + 1;
    },

    // simulate a d% roll
    rollPercentage: function () {
        return Math.floor(Math.random() * 100) + 1;
    },
    
    removeStatusEffect: function (character, effect) {
        var effectIndex = character.statusEffects.findIndex(function (element) {
            return element.id === effect.id;
        });
        character.statusEffects.splice(effectIndex, 1);
    },
    
    StatusEffect: function StatusEffect(config) {
        if (config.hasOwnProperty('buffity')) {
            // copy the own properties automatically, for simplicity.
            Object.keys(config).forEach(function (propertyName) {
                // clone() is a sugarcube built-in that returns a deep copy of the given object
                this[propertyName] = clone(config[propertyName]);
            }, this);
        }// end cc
        else {
            this.id = config.id;
            this.name = config.name;
            this.duration = config.duration;
            this.ticks = config.duration;
            /** 
            boon or bane (or y'know the industry standard buff and debuff) would have made more sense, but I was tired and now I like buffins/bluffins.  Anyway, this property identifies a StatusEffect as positive or negative for the afflicted Character where buffins is good and bluffins is bad.  Fight me codereview SE.
            */
            this.buffity = "buffins";
            this.descriptors = [];
        }// end new instance ctor
    }, // end StatusEffect class def

    // StatusEffect class prototype def
    StatusEffect.prototype.tickDown: function() {
        this.ticks--;
    }
        StatusEffect.prototype.effect: function(afflictedChar) {
        console.log("status effect unset");
    }
        StatusEffect.prototype.reverseEffect: function(afflictedChar) {
        console.log("status effect reversal unset");
    },
    
    Ability: function Ability(config) {
        if (config.hasOwnProperty('cost')) {
            // copy the own properties automatically, for simplicity.
            Object.keys(config).forEach(function (propertyName) {
                // clone() is a sugarcube built-in that returns a deep copy of the given object
                this[propertyName] = clone(config[propertyName]);
            }, this);
        }// end cc
        else {


            this.id = config.id;
            this.name = config.name;

            // metadata about who the ability targets, namely you, all allies, one enemy, or all enemies.
            this.targetType = window.Ability.TargetTypesEnum.singleEnemy;

            /**
            The friendly property describes whether an ability is considered hostile or beneficial to its target
            */
            this.friendly = false;

            // cached value of last calculated dmg
            this.dmg = 0;

            /**
            The cost of using using the ability to the user.  It is given as
            an object map with keys that correspond to mutable resource stats associated with integer values.  The given value should be subtracted from the corresponding stat resource pool.
            */
            this.cost = { "mp": 0 };

            // effect can be defined when Ability instance is defined, but usual behavior will generally be target character's HP reduced by calcDmg().  Default behavior will be to simply log a noop like the other default functions
            this.effect = function (sourceChar, targetChar) { console.log("no effect from " + this.name) };
            this.calcDC = function (user, modifyingAttr) {
                return 10;
            }// end calcDC()
            // lambda stub - dmg formula will be defined when Ability instance is defined
            this.calcDmg = function (sourceChar, targetChar) { console.log("no dmg from " + this.name) }
            this.generateFlavorText = function (sourceChar, targetChar) { console.log("flavor text undefined for " + this.name) }

        }// end new instance ctor

    }, // end Ability def

    // static Ability class members
    Ability.TargetTypesEnum: Object.freeze(
        {
            singleEnemy: 1,
            allEnemies: 2,
            singleAlly: 3,
            allAllies: 4
        }),
    // Ability class prototype members
    /**
        Process the cost of the ability, parsing the cost object map
        */
    Ability.prototype.processCost: function(character) {
        for (let statCost in this.cost) {
            character.stats[statCost] -= this.cost[statCost];
        }
    }
    /**
        Formats the total cost as a string and returns it
        */
        Ability.prototype.printCost: function() {
        var costString = "";
        var costKeys = Object.keys(this.cost);
        for (let index = 0; index < costKeys.length - 1; index++) {
            // for all but the last element...
            costString += costKeys[index] + " : " + this.cost[costKeys[index]];
            costString += ", "
        }
        // final cost element, no comma needed
        costString += costKeys[costKeys.length - 1] + " : " + this.cost[costKeys[costKeys.length - 1]];
        return costString;
    }
    
    Spell: function Spell(config) {
        // Spell inherits from Ability
        Ability.call(this, config);

    }
    // establish window.Spell.prototype as a proto link extending the Character proto chain

    /*
     * Object.create(object) creates an object with a prototype of the
     * passed in object, so it can be used to create a new link in the prototype chain 
    */
    Spell.prototype = Object.create(Ability.prototype);
    /*
     * If we didn't reset the prototype's constructor
     * attribute, it would look like any Spell objects
     * were constructed with an Ability constructor
     */
    Spell.prototype.constructor = Spell;

    // Character object definition
    Character: function Character(config) {
        if (config.hasOwnProperty('attributes')) {
            // copy the own properties automatically, for simplicity.
            Object.keys(config).forEach(function (propertyName) {
                // clone() is a sugarcube built-in that returns a deep copy of the given object
                this[propertyName] = clone(config[propertyName]);
            }, this);
        }// end cc
        else {
            this.id = config.id;
            this.name = config.name;
            this.gender = "";
            this.level = 10;

            // simple object map of categorical descriptor arrays,
            // e.g. descriptors.body = ["fur","curvacious"]
            this.descriptors = {
                body: {
                    size: "average",
                    hair: [],
                    appendages: {
                        arms: {
                            name: "arms"
                        },
                        hands: {
                            name: "hands"
                        }
                    }
                }
            }

            // basic stats, representing character vitality as resources.
            // In the absence of clear classes, went with ~ avg d10s for level 10
            // TODO: at least some of these and other consumeable resources should show in a HUD drawer
            this.stats = {
                "hp": 50,
                "maxHP": 50,
                "mp": 50,
                "maxMP": 50,
                // standard jRPG stuff; I'm thinking these will be used as modifiers in dmg formulae, and will be modified by inherent attributes plus equipment
                "atk": this.attributes["strength"],
                "def": this.attributes["constitution"],
                "pwr": this.getMagicAttributeScore(),
                "res": this.getMagicAttributeScore()
            }

            // a character's spells is an object-map of 'magic' ability names to Spell objects that define their effects/cost etc. The available spells are based
            // on inherent Entity, or that have been learned by the human
            this.spells = {};

            // a character's Entity is their inherent set of talents re: Spell.  Only the human can learn Spells from any Entity.
            this.entity = new window.Entity({ name: "unset" });

            this.abilities = {
                "attack": new window.Ability({ id: "attack", name: "Attack" }),
                "defend": new window.Ability({ id: "defend", name: "Defend" }),
                "run": new window.Ability({ id: "run", name: "Run" })
            }
            this.abilities["defend"].targetType = window.Ability.TargetTypesEnum.singleAlly;
            this.abilities["run"].targetType = window.Ability.TargetTypesEnum.allAllies;

            // todo: should boilerplate functions attached to abilities, which will have to be own properties as they are subject to change from one instance to the next, somehow be on the prototype?  Maybe something like each instance has this.abl["attack"].calcDmg = this.prototype.defaultCalcDmg?
            this.abilities["attack"].calcDmg = function (sourceCharacter, targetCharacter) {
                // favor the STR since the attacker is the leading participant
                // todo: yeesh, balance.  I've mixed inspiration from D&D and jRPGs in the stat blocks, and it's starting to shoooow.  Well anyway, CON is a fair stand-in for a DQ style DEF stat.
                // todo: atk is essentially useless against Puck b/c he has 500 HP and will be taking 5 damage from someone with average STR simply because his CON is average.  Recall that our STR etc. atrributes are based on D&D numbers, and D&D does NOT use same for determining base damage (only modifier).  Base damage D&D-style is a whole other thing I don't wanna get into for this demo.  For demo porpoises, I'd say fudge factors of 2 for STR and 0.25 for CON should be okay.  That way we're looking at 17-ish damage to Puck and 13-ish from him. 
                /*
                return sourceCharacter.attributes["strength"]*2 - targetCharacter.attributes["constitution"]/4;
                */
                return sourceCharacter.stats["atk"] * 2 - targetCharacter.stats["def"] / 4 + Math.random() * 10;
            };
            this.abilities["attack"].effect = function (sourceCharacter, targetCharacter) {
                this.dmg = this.calcDmg(sourceCharacter, targetCharacter);
                console.log(this.dmg + " dealt by Attack to " + targetCharacter.name);
                // todo: AC? Any other miss chance?
                targetCharacter.stats.hp -= this.dmg; // what's multithreading, anyway? lol
                // possible player death processing
                if (targetCharacter.stats.hp <= 0) {
                    console.log("Attack killed " + targetCharacter.name);
                    targetCharacter.living = false;
                }
            };
            this.abilities["attack"].generateFlavorText = function (sourceCharacter, targetCharacter) {
                // todo: clearing cached dmg after it is read to flavor text? 
                return sourceCharacter.name + " strikes " + targetCharacter.name + " a mighty blow, dealing " + this.dmg + " damages!";
            };
            this.abilities["defend"].effect = function (sourceCharacter, targetCharacter) {
                /*
                TODO: obviously this is borken af, but since Defend is traditionally useless and this is a demo, I like the irony of making it an OP move.  A better impl would be a status buff like Defended or similar that can only be added once instead of stacking endlessly.
                */
                targetCharacter.stats["def"] += sourceCharacter.stats["def"];
            };
            this.abilities["defend"].generateFlavorText = function (sourceCharacter, targetCharacter) {
                return sourceCharacter.name + " hops in front of " + targetCharacter.name + ", valiantly using " + sourceCharacter.getPronoun_gen() + " own flesh to protect " + targetCharacter.getPronoun_obj() + "!";
            };
            this.abilities["run"].generateFlavorText = function (playerParty) {
                console.log("run::generateFlavorText -- The player party consists of " + playerParty);
                var flavorText = "";
                for (let i = 0; i < playerParty.length; i++) {
                    if (i < playerParty.length - 1) {
                        flavorText += playerParty[i].name + ", ";
                    } else {
                        flavorText += "and " + playerParty[i].name;
                    }
                }
                return flavorText + " bravely attempt to turn tail and flee, but they cannot escape!";
            };

            // affinities will be a simple String character name key -> integer affinity value mapping
            // that reflects how a given character feels about this character.
            // 0 is defined as totally neutral, negative values are bad and
            // positive values are good.  
            this.affinities = new Map();

            // a character's inventory reflects the items in the world that it is
            // currently carrying and can access.
            this.inventory = [];

            // a character's equipment represents weapons, armor, etc. that they are actively wearing
            this.equipment = [];

            // combat status effects; these are temporary and only relevant to combat
            this.statusEffects = [];

            /**
            Boolean flag indicating whether or not the character is alive for the purposes of combat
            */
            this.living = true;

            // arbitrary PoT bitfield used to raise/lower various combat-related flags for this Character
            this.combatFlags = 0;

            // a simple array of keyword/phrases that indicate behavior mod in certain contexts, e.g. targetCharacter.name+"_is_digger_good"
            // to indicate that targetCharacter is as good as mole, wombats, and
            // other simple lovely creatures that happily burrow and build all their
            // lives, peaceful, passionate, and productive.
            this.inductive_bias = [];

        }// end new instance ctor
    }// end Character class def

    // Character class prototype def
    
    Character.prototype.getPronoun_gen: function() {
        if (this.gender === "female") {
            return "her";
        }
        else if (this.gender === "male") {
            return "his";
        }
        else {
            return "their";
        }
    }
        Character.prototype.getPronoun_nom: function() {
        if (this.gender === "female") {
            return "she";
        }
        else if (this.gender === "male") {
            return "he";
        }
        else {
            return "they";
        }
    }
        Character.prototype.getPronoun_obj: function() {
        if (this.gender === "female") {
            return "her";
        }
        else if (this.gender === "male") {
            return "him";
        }
        else {
            return "them";
        }
    }

        /**
        Check whether the resource stat pools are in sufficient supply to feed a given ability
        */
        Character.prototype.canAffordCost: function(ability) {
        for (let costElement in ability.cost) {
            if (this.stats[costElement] < ability.cost[costElement]) {
                // found a cost that cannot be satisfied, so return false
                return false;
            }
        }

        // if we made it here without hitting any costs we couldn't cover
        // we're good!
        return true;
    }

        /**
        Makes the character act autonomously according to its role
        @param combat: the current combat context
        @param role: could be as simple as player or enemy, but could be configurable to something like player:assist if a guided auto-battle system gets implemented someday
        */
        Character.prototype.runAI: function(combat, role) {
        console.log("AI behavior unset");
    }

    // Character class static members
    Character.CombatFlags = Object.freeze(
        {
            FLAG_SKIP_TURN: 1,
            FLAG_WONDER_WALLED: 2
        });

    /**
    Combat object takes two arrays of Character objects, the player's
    party and the enemy's party.
    @param config: either an existing Combat object to be used with a copy-constructor or an object sack with parameterized fields playerParty Character array, enemyParty Character array, and destPassageName String (passage to which player should be returned after combat).
    */
    Combat: function Combat(config) {
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
    Combat.prototype.randoCombatantExcept: function(exceptCharacter) {
        var combatants = this.enemyParty.concat(this.playerParty);
        var eligibleCombatants = combatants.filter(combatant => combatant.id != exceptCharacter.id);
        var unluckyIndex = Math.floor(Math.random() * eligibleCombatants.length);
        return eligibleCombatants[unluckyIndex];

    }
        /**
        Concat the enemy and player party arrays, and return result
        */
        Combat.prototype.getAllCombatants: function() {
        return this.enemyParty.concat(this.playerParty);
    }

        /**
        Handle upkeep related to a new round beginning (i.e. top of the round to ye!)
        */
        Combat.prototype.processRoundTop: function() {
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
        Combat.prototype.processRoundBottom: function() {
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





    /// begin global story state dicts ///

    // Global Object mapping of prefab Characters
    characters = {
        "mole": new Player({ id: "mole", name: "Mooty Wort" }),
        "thegod": new Character({ id: "thegod", name: "The God" }),
        "grue": new Character({ id: "grue", name: "Grue" })
    }

    // Global Object mapping of prefab StatusEffects
    statusEffectsDict = {
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
        Defenseless reduces the target's defensive stats by half for 3 turns
        */
        "defenseless": new window.StatusEffect({ id: "defenseless", name: "Defenseless", duration: 3 })
    }

    /**
    Global dictionary object of public spells.  Since The Human can learn any Spell, all the Spells should be indexed here
    TODO: move the inline definitions of Spells from within Character configs to here, and then reference this dict in said configs.
    */
    spellsDict: {
        // from Splinter of Serpentarius
        "debilitate": new window.Spell({ id: "debilitate", name: "Debilitate" }),
        "pierce": new window.Spell({ id: "pierce", name: "Pierce" }),
        "toxin": new window.Spell({ id: "toxin", name: "Toxin" }),
        // from Splinter of Violet
        "shadowform": new window.Spell({ id: "shadowform", name: "Shadowform" }),
        "perfect_stillness": new window.Spell({ id: "perfect_stillness", name: "Perfect Stillness" }),
        "savage_sympathy": new window.Spell({ id: "savage_sympathy", name: "Savage Sympathy" }),
        // from Splinter of Snugg-lor
        "warmest_hug": new window.Spell({ id: "warmest_hug", name: "Warmest Hug" }),
        "woolly_shield": new window.Spell({ id: "woolly_shield", name: "Woolly Shield" }),
        "maenad_frenzy": new window.Spell({ id: "maenad_frenzy", name: "Maenad Frenzy" }),
    }

    /// end global dicts ///

    // establish Player party
    party: [characters["mole"]];


    /**
    Main program init function.  Configures and fleshes out global objects
    */
    function init(){
    // status effects
    /**
    Defenseless halves a character's defensive attributes 
    */
    var defenselessStatusEffect = window.statusEffectsDict["defenseless"];
    defenselessStatusEffect.buffity = "bluffins";
    defenselessStatusEffect.descriptors.push("debuff", "defense");
    defenselessStatusEffect.effect = function (targetChar) {
        this.cachedDef = targetChar.stats["def"];
        this.cachedRes = targetChar.stats["res"]
        targetChar.stats["def"] *= 0.5;
        targetChar.stats["res"] *= 0.5;
    }
    defenselessStatusEffect.reverseEffect = function (targetChar) {
        targetChar.stats["def"] = this.cachedDef;
        targetChar.stats["res"] = this.cachedRes;
    }

    /**
    Temper provides a simple ATK*2 for 3 turns
    */
    var temperStatusEffect = window.statusEffectsDict["temper"];
    temperStatusEffect.buffity = "buffins";
    temperStatusEffect.descriptors.push("buff", "offense");
    temperStatusEffect.effect = function (targetChar) {
        targetChar.stats["atk"] *= 2;
    }
    temperStatusEffect.reverseEffect = function (targetChar) {
        targetChar.stats["atk"] *= 0.5;
    }

    /**
    Focus provides a simple PWR*2 for 3 turns
    */
    var focusStatusEffect = window.statusEffectsDict["focus"];
    focusStatusEffect.buffity = "buffins";
    focusStatusEffect.descriptors.push("buff", "offense");
    focusStatusEffect.effect = function (targetChar) {
        targetChar.stats["pwr"] *= 2;
    }
    focusStatusEffect.reverseEffect = function (targetChar) {
        targetChar.stats["pwr"] *= 0.5;
    }

    /**
    Third Eye provides a PWR*4 at cost of ATK/2 and DEF/2 for 3 turns
    */
    var thirdEyeStatusEffect = window.statusEffectsDict["third_eye"];
    thirdEyeStatusEffect.buffity = "buffins";
    thirdEyeStatusEffect.descriptors.push("buff", "offense");
    thirdEyeStatusEffect.effect = function (targetChar) {
        targetChar.stats["pwr"] *= 4;
        targetChar.stats["atk"] *= 0.5;
        targetChar.stats["def"] *= 0.5;
    }
    thirdEyeStatusEffect.reverseEffect = function (targetChar) {
        targetChar.stats["pwr"] *= 0.25;
        targetChar.stats["atk"] *= 2;
        targetChar.stats["def"] *= 2;
    }

    /**
    Regen heals a character by their RES each turn
    */
    var regenStatusEffect = window.statusEffectsDict["regen"];
    regenStatusEffect.buffity = "buffins";
    regenStatusEffect.descriptors.push("buff", "health");
    regenStatusEffect.effect = function (targetChar) {
        console.log("Wounds close and gaping wounds knit themselves shut as " + targetChar.name + " regenerates " + targetChar.stats["res"] + " HP!");
        targetChar.stats["hp"] += targetChar.stats["res"];
    }
    regenStatusEffect.reverseEffect = function (targetChar) { }

    /**
    Doubt halves a character's attributes that are driven by presence and self-confidence: STR and CHA.
    */
    var doubtStatusEffect = window.statusEffectsDict["doubt"];
    doubtStatusEffect.buffity = "bluffins";
    doubtStatusEffect.descriptors.push("debuff", "offense");
    doubtStatusEffect.effect = function (targetChar) {
        targetChar.stats["atk"] *= 0.5;
        targetChar.stats["pwr"] *= 0.5;
    }
    doubtStatusEffect.reverseEffect = function (targetChar) {
        targetChar.stats["atk"] *= 2;
        targetChar.stats["pwr"] *= 2;
    }

    /**
    Bloodlust quadruples STR in exchange for halving all mental attributes
    */
    var bloodlustStatusEffect = window.statusEffectsDict["bloodlust"];
    bloodlustStatusEffect.buffity = "buffins";
    bloodlustStatusEffect.descriptors.push("buff", "offense");
    bloodlustStatusEffect.effect = function (targetChar) {
        targetChar.stats["atk"] *= 4;
        targetChar.stats["pwr"] *= 0.5;
        targetChar.stats["res"] *= 0.5;
    }
    bloodlustStatusEffect.reverseEffect = function (targetChar) {
        targetChar.stats["atk"] *= 0.25;
        targetChar.stats["pwr"] *= 2;
        targetChar.stats["res"] *= 2;
    }


    /**
    Poison deals dmg each turn and halves atk/def stats
    */
    var poisonStatusEffect = window.statusEffectsDict["poison"];
    poisonStatusEffect.buffity = "debuff";
    poisonStatusEffect.descriptors.push("debuff", "health");
    poisonStatusEffect.effect = function (targetChar) {
        targetChar.stats["atk"] *= 0.5;
        targetChar.stats["def"] *= 0.5;
    }
    poisonStatusEffect.reverseEffect = function (targetChar) {
        targetChar.stats["atk"] *= 2;
        targetChar.stats["def"] *= 2;
    }

    // public spells

    // from Splinter of Serpentarius
    /**
    Debilitate lowers all defensive attributes of the target, and inflicts currHp*0.1 dmg
    */
    var debilitate = window.spellsDict["debilitate"];
    debilitate.targetType = window.Ability.TargetTypesEnum.singleEnemy;
    debilitate.cost = { "mp": 25 };
    debilitate.calcDmg = function (sourceChar, targetChar) {
        return targetChar.stats.hp * 0.1;
    }
    debilitate.effect = function (sourceChar, targetChar) {
        window.addUniqueStatusEffect(targetChar, defenselessStatusEffect);

        // MP cost
        this.processCost(sourceChar);
    }
    debilitate.generateFlavorText = function (sourceChar, targetChar) {
        return sourceChar.name + " narrows " + sourceChar.getPronoun_gen() + " eyes, shining with cruel malice, at " + targetChar.name + ".  Space distorts mildly, constricting around and through " + targetChar.name + ", and " + targetChar.getPronoun_gen() + " presence seems to diminish substantially!";
    }
    /**
    Pierce is a physical strike for which atk bypasses def
    */
    var pierceSpell = window.spellsDict["pierce"];
    pierceSpell.targetType = window.Ability.TargetTypesEnum.singleEnemy;
    pierceSpell.cost = { "hp": 10 };
    pierceSpell.calcDmg = function (sourceChar, targetChar) {
        return sourceChar.stats["atk"] * 2 + Math.random() * 10;
    }
    pierceSpell.effect = function (sourceChar, targetChar) {
        this.dmg = this.calcDmg(sourceChar, targetChar);
        targetChar.stats["hp"] -= this.dmg;

        // HP cost
        this.processCost(sourceChar);
    }
    pierceSpell.generateFlavorText = function (sourceChar, targetChar) {
        return sourceChar.name + " smoothly reaches directly into " + targetChar.name + "'s soul, and just kinda... fiddles around a little.  " + targetChar.name + " does not appreciate this, emphatically, to the tune of " + this.dmg + " delicious damages!";
    }

    var toxinSpell = window.spellsDict["toxin"];
    toxinSpell.targetType = window.Ability.TargetTypesEnum.singleEnemy;
    toxinSpell.cost = { "mp": 15 };
    toxinSpell.calcDmg = function (sourceChar, targetChar) {
        return sourceChar.stats["pwr"] - targetChar.stats["res"];
    }
    toxinSpell.effect = function (sourceChar, targetChar) {
        this.dmg = this.calcDmg(sourceChar, targetChar);
        targetChar.stats["hp"] -= this.dmg;
        window.addUniqueStatusEffect(targetChar, poisonStatusEffect);

        // MP cost
        this.processCost(sourceChar);
    }
    toxinSpell.generateFlavorText = function (sourceChar, targetChar) {
        return "An aura of gleaming electric purple light, striated with the cheerily deadly greenish glow of radioactivity, surrounds " + sourceChar.name + " as " + sourceChar.getPronoun_gen() + " fevered will infects " + targetChar.name + ".  The insidious infection quickly overwhelms " + targetChar.name + "'s immune system totally, dealing " + this.dmg + " damage, and promising more...";
    }

    // from Splinter of Violet
    /**
    Shadowform makes the character immune to physical damage.  
    TODO: add a physical/magic damage typing system.  For now, we'll just make def infinite.
    */
    var shadowFormSpell = window.spellsDict["shadowform"];
    shadowFormSpell.targetType = window.Ability.TargetTypesEnum.allAllies; // actually self-only, but this will have the same effect in the UI
    shadowFormSpell.cost = { "mp": 30 };
    shadowFormSpell.effect = function (sourceChar, targetChar) {
        window.addUniqueStatusEffect(sourceChar, shadowStatusEffect);

        // MP cost
        this.processCost(sourceChar);
    }
    shadowFormSpell.generateFlavorText = function (sourceChar, targetChar) {
        return "Shadows dance free of their source lights, and embrace " + sourceChar.name + " warmly.  Velvet darkness spreads over " + sourceChar.getPronoun_gen() + " body, and " + sourceChar.getPronoun_nom() + " relaxes into oneness with the infinite possibilities of undefinition; " + sourceChar.getPronoun_nom() + " seems almost ethereal now.";
    }

    /**
    Perfect Stillness deals mild cold damage to the wielder and massive cold damage to the target
    */
    var perfectStillnessSpell = window.spellsDict["perfect_stillness"];
    perfectStillnessSpell.targetType = window.Ability.TargetTypesEnum.singleEnemy;
    // by the time the HP cost is being evaluated, the selfDmg property should have been set in effect().  Would this be bound to perfectStillnessSpell inside the newly inline cost object map?
    perfectStillnessSpell.cost = { "mp": 15 };//,"hp":perfectStillnessSpell.selfDmg};
    perfectStillnessSpell.calcDmg = function (sourceChar, targetChar) {
        return 5 * sourceChar.stats["pwr"] - targetChar.stats["res"] / 4;
    }
    perfectStillnessSpell.effect = function (sourceChar, targetChar) {
        this.dmg = this.calcDmg(sourceChar, targetChar);
        this.selfDmg = this.calcDmg(sourceChar, sourceChar);
        targetChar.stats["hp"] -= this.dmg;
        sourceChar.stats["hp"] -= this.selfDmg / 5; // todo: move to cost so that it is transparent to user via UI display of abl costs; make sure calcDmg() can peek at the dmg from that point

        // MP cost
        this.processCost(sourceChar);
    }
    perfectStillnessSpell.generateFlavorText = function (sourceChar, targetChar) {
        return sourceChar.name + " extends " + sourceChar.getPronoun_gen() + " arms slowly towards " + targetChar.name + ", almost as if inviting a hug.  Suddenly, a rolling torrent of absolute serenity and silence, so profoundly vaccuous that it forces all in attendance to take a step back as from an overwhelming physical force, explodes forth from " + sourceChar.getPronoun_obj() + ".  Both folks are rocked by the violence of the peace, and " + targetChar.name + " is driven to " + targetChar.getPronoun_nom() + " knees by " + this.dmg + " chilling damage!";
    }

    /**
    Savage Sympathy deals more damage the greater the difference between the wielder and the target's ATK, and heals the wielder
    */
    var savageSympathySpell = window.spellsDict["savage_sympathy"];
    savageSympathySpell.targetType = window.Ability.TargetTypesEnum.singleEnemy;
    savageSympathySpell.cost = { "mp": 20 };
    savageSympathySpell.calcDmg = function (sourceChar, targetChar) {
        return Math.abs(targetChar.stats["atk"] - sourceChar.stats["atk"]) * 2;
    }
    savageSympathySpell.effect = function (sourceChar, targetChar) {
        this.dmg = this.calcDmg(sourceChar, targetChar);
        targetChar.stats["hp"] -= this.dmg;
        sourceChar.stats["hp"] += this.dmg / 2;

        // MP cost
        this.processCost(sourceChar);
    }
    savageSympathySpell.generateFlavorText = function (sourceChar, targetChar) {
        return sourceChar.name + " is no fan of natural privilege.  In fact, " + sourceChar.getPronoun_nom() + " takes ecstatic pleasure in balancing the old scales, with blood if necessary.  To wit, blood from " + targetChar.name + "'s orificeses begins slowly spiraling through the air and into " + sourceChar.name + "'s snarling mouth.  This gruesome spectacle illustrates a whopping " + this.dmg + " damage!";
    }

    // from Splinter of Snugg-lor
    /**
    Warmest hug heals self and other with ATK
    */
    var warmestHugSpell = window.spellsDict["warmest_hug"];
    warmestHugSpell.targetType = window.Ability.TargetTypesEnum.singleAlly;
    warmestHugSpell.cost = { "mp": 20 };
    warmestHugSpell.calcDmg = function (sourceChar, targetChar) {
        return sourceChar.stats["atk"];
    }
    warmestHugSpell.effect = function (sourceChar, targetChar) {
        this.dmg = this.calcDmg(sourceChar, targetChar);
        targetChar.stats["hp"] += this.dmg;
        sourceChar.stats["hp"] += this.dmg;

        // MP cost
        this.processCost(sourceChar);
    }
    warmestHugSpell.generateFlavorText = function (sourceChar, targetChar) {
        return sourceChar.name + " embraces " + sourceChar.getPronoun_gen() + " friend " + targetChar.name + " fondly, a soft golden glow surrounding them both.  The glow heals " + targetChar.name + " of " + this.dmg + " damage.";
    }

    /**
    Woolly Shield raises target's DEF by wielder's RES+DEF
    */
    var woollyShieldSpell = window.spellsDict["woolly_shield"];
    woollyShieldSpell.targetType = window.Ability.TargetTypesEnum.singleAlly;
    woollyShieldSpell.cost = { "mp": 30 };
    woollyShieldSpell.calcDmg = function (sourceChar, targetChar) {
        return sourceChar.stats["def"] + sourceChar.stats["res"];
    }
    woollyShieldSpell.effect = function (sourceChar, targetChar) {
        this.dmg = this.calcDmg(sourceChar, targetChar);
        targetChar.stats["def"] += this.dmg;

        // MP cost
        this.processCost(sourceChar);
    }
    woollyShieldSpell.generateFlavorText = function (sourceChar, targetChar) {
        return sourceChar.name + " puffs out " + sourceChar.getPronoun_gen() + " hair, approximating thick wool as best " + sourceChar.getPronoun_nom() + " can, and jumps in front of " + targetChar.name + ", intent on protecting " + targetChar.getPronoun_obj() + " with " + sourceChar.getPronoun_gen() + " woolly life!";
    }

    /**
    Maenad Frenzy deals ATK+CHA to self and (ATK+CHA)*2 to target
    */
    var maenadFrenzySpell = window.spellsDict["maenad_frenzy"];
    maenadFrenzySpell.targetType = window.Ability.TargetTypesEnum.singleEnemy;
    maenadFrenzySpell.cost = { "mp": 10 };//,"hp":maenadFrenzySpell.dmg/2}; // todo: interesting idea, but won't work without proper abl I/O, since we'd need source and target char for calcDmg() to get an accurate readout
    maenadFrenzySpell.calcDmg = function (sourceChar, targetChar) {
        return 2 * (sourceChar.stats["atk"] + sourceChar.attributes["charisma"]);
    }
    maenadFrenzySpell.effect = function (sourceChar, targetChar) {
        this.dmg = this.calcDmg(sourceChar, targetChar);
        targetChar.stats["hp"] -= this.dmg;
        sourceChar.stats["hp"] -= this.dmg / 4;

        // MP cost
        this.processCost(sourceChar);
    }
    maenadFrenzySpell.generateFlavorText = function (sourceChar, targetChar) {
        return "A manic gleam shines in " + sourceChar.name + "'s eyes as they reflect the brilliant light of the lunatic moon suddenly huge in the sky above.  " + sourceChar.getPronoun_nom() + " embraces " + targetChar.name + " with a violent longing, pleasure driven through to pain before the fires of wild need.  " + targetChar.getPronoun_nom() + " wriggles and tries to escape as " + sourceChar.name + " squeezes " + targetChar.getPronoun_obj() + ", but there is no way out.  The embrace tightens and the whipcrack of snapping bone makes the night itself cower.  " + this.dmg + " damage is dealt around the world's unhappiest hug.";
    }

    var puckChar = State.variables.characters["puck"];
    puckChar.gender = "male";
    puckChar.attributes["strength"] = 4;
    puckChar.attributes["dexterity"] = 20;
    puckChar.attributes["constitution"] = 10;
    puckChar.attributes["intelligence"] = 22;
    puckChar.attributes["wisdom"] = 6;
    puckChar.attributes["charisma"] = 20;
    puckChar.stats["hp"] = 200;
    puckChar.stats["mp"] = Infinity;
    puckChar.stats["maxHP"] = 150;
    puckChar.stats["maxMP"] = Infinity;
    // todo: these assignments could be replaced with a recompute fn
    puckChar.stats["atk"] = puckChar.attributes["strength"];
    puckChar.stats["def"] = puckChar.attributes["constitution"];
    puckChar.stats["pwr"] = puckChar.getMagicAttributeScore();
    puckChar.stats["res"] = puckChar.getMagicAttributeScore();
    // todo: equip Puck?
    puckChar.entity = new window.Entity({ name: "Vicious Mockery" });
    var rapierWit = new window.Spell({ id: "rapier_wit", name: "Rapier Wit" });
    rapierWit.cost = { "mp": 15 };
    rapierWit.generateFlavorText = function (sourceChar, targetChar) {
        if (targetChar) {
            // todo: randomly selected insults based on descriptor tags

            var percentage = window.rollPercentage();
            var flavorText = "";
            if (targetChar.gender === "female") {
                if (percentage <= 20) {
                    var hairWord = "hair";
                    if (targetChar.descriptors.body.hair.includes("fur")) {
                        hairWord = "fur";
                    }
                    flavorText = sourceChar.name + " accuses " + targetChar.name + " of having " + hairWord + " extensions!  She blushes and bristles with unnatural incapacitating rage, the engineered emotion practically coruscating with Spell.";
                }// end 1-20%
                else if (percentage > 20 && percentage <= 70) {
                    flavorText = "Looking down " + (sourceChar.gender === "female" ? "her" : "his") + " nose at " + targetChar.name + ", " + sourceChar.name + " sniffs and conjectures that the once-sinuous curves of her body have become somewhat oblong... and lumpy!  She reels in bizarre anguish as the taunt burrows into her psyche.";
                }//end 21-70%
                else if (percentage > 70 && percentage <= 100) {
                    flavorText = sourceChar.name + " sniffs the air and then wrinkles " + (sourceChar.gender === "female" ? "her" : "his") + " nose in disgust, accusing " + targetChar.name + " of stinking like a bog.  Incarnate self-consciousness floods her neurons and she can't be sure of herself!"
                }//end 71-100%
            } else if (targetChar.gender === "male") {
                if (percentage <= 50) {
                    flavorText = sourceChar.name + " sizes up " + targetChar.name + " and smirks, informing " + targetChar.name + " that his musculature is reminiscent of a doddering and decrepit elder.  His eyes burn cherry-red as Incarnate rage strangles his mind.";
                } else {
                    flavorText = sourceChar.name + " takes a long hard look below " + targetChar.name + "'s belt and then scoffs, clearly underwhelmed.  Venemous doubt Incarnate seeps into the cracks of his self-image and harden there, shattering it!";
                }
            } else {
                flavorText = sourceChar.name + " points and laughs in a literally cutting fashion!";
            }
            return flavorText + "  The terrible insult leaves tangible scars upon " + targetChar.name + "'s poor soul to the tune of " + this.dmg + " damage!";
        }// end if a targetChar is given
        else {
            return sourceChar.name + " points and laughs in a literally cutting fashion!"
        }


    }
    rapierWit.targetType = window.Ability.TargetTypesEnum.singleEnemy;
    rapierWit.calcDmg = function (sourceChar, targetChar) {
        // highly variable damage sourced from source CHA and resisted slightly by target CHA
        return window.rollDie(6) * window.calcMod(sourceChar.attributes["charisma"]) - window.calcMod(targetChar.attributes["charisma"]);
    }
    rapierWit.effect = function (sourceChar, targetChar) {
        this.dmg = this.calcDmg(sourceChar, targetChar);
        targetChar.stats.hp -= this.dmg;
        window.addUniqueStatusEffect(targetChar, window.statusEffectsDict["doubt"]);

        // possible player death processing
        // todo: move this and similar common abl processes to a common abl I/O
        if (targetChar.stats.hp <= 0) {
            targetChar.living = false;
        }

        // MP cost
        this.processCost(sourceChar);
    }
    puckChar.spells["rapier_wit"] = rapierWit;

    var rainOfRadiance = new window.Spell({ id: "rain_of_radiance", name: "Rain of Radiance" });
    rainOfRadiance.cost = { "mp": 50 };
    rainOfRadiance.generateFlavorText = function (sourceChar, targetChars) {
        return sourceChar.name + " thrusts a hand towards the heavens, muscles quivering with equal parts strain and anticipation.  The first few glittering droplets of liquid blue-white starlight are beautiful, but their virtue is quickly eclipsed by a tide of agony that grips the entire party as their flesh/fur is scorched/singed by celestial fire!  " + this.dmg + " horrifically burning damages to the whole party!";
    }
    rainOfRadiance.targetType = window.Ability.TargetTypesEnum.allEnemies;
    rainOfRadiance.calcDmg = function (sourceChar, targetChar) {
        // 'starlight dmg' cuts through defenses and thus cannot be reduced by targetChar attrs... sure.
        var sourcePower = sourceChar.stats["pwr"];
        //alert(sourceChar.name+"'s pwr is "+sourcePower);
        console.log("Power of " + sourceChar.name + " is " + sourcePower);
        return 5 * window.calcMod(sourcePower);
    }
    /**
    Rain of Radiance expects an array of target chars since it hits all enemies
    */
    rainOfRadiance.effect = function (sourceChar, targetChars) {
        // note: most of the time you can't have a single dmg calculated for a group abl since usually the source and target char are taken into account in the calcDmg().  Not for this one, though!
        this.dmg = this.calcDmg(sourceChar, targetChars);
        for (let target of targetChars) {
            target.stats.hp -= this.dmg;
            console.log(this.dmg + " damage dealt to " + target.name);
            // possible player death processing
            if (target.stats.hp <= 0) {
                target.living = false;
            }
        }

        // mp cost
        this.processCost(sourceChar);
    }
    puckChar.spells["rain_of_radiance"] = rainOfRadiance;

    var swordsDance = new window.Spell({ id: "swords_dance", name: "Swords Dance" });
    swordsDance.cost = { "mp": 15 };
    swordsDance.generateFlavorText = function (sourceChar, targetChar) {
        var flavorString = "Cruel cold light gleams in " + targetChar.name + "'s eyes as warrior spirits torn directly from the savagery of the Wild Hunt meld with " + (targetChar.gender === "female" ? "her" : "his") + " spirit!";
        if (targetChar.descriptors.body.size === "fun_sized") {
            flavorString += "  You didn't think such a petite individual could strike terror in your heart with mere physical presence, but it seems you were wrong."
        } else if (targetChar.descriptors.body.size === "party_sized") {
            flavorString += "  You didn't think " + (targetChar.gender === "female" ? "her" : "his") + " physical presence could loom any larger, but it seems you were wrong."
        }

        return flavorString;
    }
    swordsDance.targetType = window.Ability.TargetTypesEnum.singleAlly;
    swordsDance.effect = function (sourceChar, targetChar) {
        window.addUniqueStatusEffect(targetChar, window.statusEffectsDict["bloodlust"]);

        // mp cost
        this.processCost(sourceChar);
    }
    theGodChar.spells["swords_dance"] = swordsDance;

    theGodChar.runAI = function (combat, role) {
        console.log("reached The God runAI fn... have fn!");
        if (role) {
            if (role === "enemy") {
                var chosenAbility = undefined;
                var chosenTarget = undefined;

                /* todo: The God enemy AI behavior	
                     
                */

                var playerParty = [];
                for (let playerCharacter of combat.playerParty) {
                    playerParty.push(State.variables.characters[playerCharacter.id]);
                    console.log("attempting to add character with id " + playerCharacter.id);
                    console.log("added " + State.variables.characters[playerCharacter.id].name + " to playerParty");
                }
                // playerParty[0] = State.variables.characters["player"]; // draw out the PLayer from Characters dictionary to see if that makes a difference in UI showing damage from Puck abls UPDATE: yup, that did it for some reason.
                var enemyParty = [];
                for (let enemyCharacter of combat.enemyParty) {
                    enemyParty.push(State.variables.characters[enemyCharacter.id]);
                }

                // outliers and statistical points of interest
                var playerLeastDefense = State.variables.characters["player"];
                var playerLeastHP = State.variables.characters["player"];
                var playerWithTargetBuff = undefined;
                var anyPlayerOffenseBuffed = false;
                var maxHealth = true; // assume true and let contradiction flip it

                /// begin gathering data and potentially exiting to Rapier Wit on any buffed player character ///
                for (let player of playerParty) {

                    // overwrite player with least defense if applicable
                    if (player.stats["def"] < playerLeastDefense.stats["def"]) {
                        playerLeastDefense = player;
                    }

                    // overwrite player with least HP if applicable
                    if (player.stats.hp < playerLeastHP.stats.hp) {
                        playerLeastHP = player;
                    }

                    if (player.statusEffects.length > 0) {
                        var statuses = player.statusEffects;
                        for (let status of statuses) {
                            if (status.buffity === "buffins") {
                                // buff discovered on this player!  Get 'im!
                                // todox: consider removing or deprioritizing this exit cond since it trumps the story scenario checks currently and those can't be moved above basic data gathering


                                if (status.descriptors.includes("offense")) {
                                    anyPlayerOffenseBuffed = true;
                                    if (!window.hasStatusEffect(player, window.statusEffectsDict["doubt"])) {
                                        playerWithTargetBuff = player;
                                    }
                                }
                            }
                        }// end for each status on current player char
                    }// end if current player has statuses

                    // check for max health scenario flip
                    if (player.stats.hp < player.stats.maxHP) {
                        maxHealth = false;
                    }

                }// end for each player
                /// end gathering data + maybe buff balancing ///

                /// begin story scenario modifier processing ///
                if (State.variables.godling_strat_chosen === window.godling_strat_viral_violence) {
                    if (playerLeastDefense.stats.hp < playerLeastDefense.stats.maxHP / 2) {
                        // if the player char with least def is bloodied...
                        if (window.hasStatusEffect(this, window.statusEffectsDict["bloodlust"])) {
                            // if Puck already has bloodlust, go ahead and clobber the poor sucker with lowest defense and HP < 50%

                            chosenAbility = this.abilities["attack"];
                            chosenTarget = playerLeastDefense;
                        } else {
                            // Puck doesn't have bloodlust yet, so get it!

                            chosenAbility = this.spells["swords_dance"];
                            chosenTarget = this;
                        }
                    }
                } else if (State.variables.godling_strat_chosen === window.godling_strat_surgical_system) {
                    // hit the latest player with a buff with debuff to balance the ol' scales
                    if (playerWithTargetBuff) {
                        if (!window.hasStatusEffect(playerWithTargetBuff, window.statusEffectsDict["doubt"])) {


                            chosenAbility = this.spells["rapier_wit"];
                            chosenTarget = playerWithTargetBuff;
                        }// end if player with target buff does not already have doubt
                        else if (anyPlayerOffenseBuffed) {
                            // presumably in this case every character with an offensive buff already has doubt.  With our scale balancing work done, just fry 'em with Rain of Radiance!


                            chosenAbility = this.spells["rain_of_radiance"];
                            chosenTarget = playerParty;
                        }
                    }
                } else if (State.variables.godling_strat_chosen === window.godling_strat_diplomancy) {
                    // if everyone is at max HP, use Rain of Radiance to fix that little problem
                    if (maxHealth) {


                        chosenAbility = this.spells["rain_of_radiance"];
                        chosenTarget = playerParty;
                    }
                }

                /// end story scenario mod proc ///

                /// begin defaults block -- at this point in the script, if Puck has not already picked an abl he will either do one mostly at random OR spam Rain of Radiance if his health is below 50% ///
                if (chosenAbility === undefined && chosenTarget === undefined) {
                    if (this.stats.hp > this.stats.maxHP / 2) {
                        // rando time!
                        var percentageRandoAbl = window.rollPercentage();

                        // choose a player party index randomly and pull the poor person from it for targeting
                        var playerRandoTarget = playerParty[Math.floor(Math.random() * playerParty.length)];

                        if (percentageRandoAbl <= 35) {
                            // todo: maybe consider targeting player with least HP if the least HPness is relatively greater than the least defenseness (relative standing)?

                            /*					this.abilities["attack"].effect(this,playerLeastDefense);
                                                combat.combatLogContent = this.abilities["attack"].generateFlavorText();
                                                return;
                                                */
                            chosenAbility = this.abilities["attack"];
                            chosenTarget = playerLeastDefense;
                        } else if (percentageRandoAbl > 35 && percentageRandoAbl <= 65) {

                            /*					this.spells["rapier_wit"].effect(this,playerRandoTarget);
                                                combat.combatLogContent = this.spells["rapier_wit"].generateFlavorText();
                                                return;
                                                */
                            chosenAbility = this.spells["rapier_wit"];
                            chosenTarget = playerRandoTarget;
                        } else if (percentageRandoAbl > 65 && percentageRandoAbl <= 85) {

                            if (!window.hasStatusEffect(this, window.statusEffectsDict["bloodlust"])) {

                                chosenAbility = this.spells["swords_dance"];
                                chosenTarget = this;
                            } else {

                                // Puck already has Bloodlust, so do the atk strat


                                chosenAbility = this.abilities["attack"];
                                chosenTarget = playerLeastDefense;
                            }
                        } else {


                            chosenAbility = this.spells["rain_of_radiance"];
                            chosenTarget = playerParty;
                        }// end rando time
                    }// end Puck HP > 50%
                    else {
                        // being severely injured, Puck now starts to spam Rain of Radiance if no earlier behaviors were proced
                        chosenAbility = this.spells["rain_of_radiance"];
                        chosenTarget = playerParty;
                    }
                } // end if abl and target are not yet chosen, landing us in defaults
                /// end defaults block ///

                // todo: consider finding a way to wrap specific AI in common AI handling, such that confusion/charm etc. handling like this can be common to all characters' AI scripts.

                // todo: if confused, reassign chosenTarget with 50% self-target and 50% original target(s)
                // todo: this reassignment would ideally take ability target types into account
                if (window.hasStatusEffect(this, window.statusEffectsDict["confuse"])) {

                    // confuse's effect is to roll percentage and return true if value is > 50, basically the pokemon card game version of confusion :)
                    if (window.getStatusEffect(this, "confuse").effect()) {
                        chosenTarget = this;
                    }
                }
                else if (window.hasStatusEffect(this, window.statusEffectsDict["charm"])) {
                    var charmStatusInstance = window.getStatusEffect(this, "charm");
                    var charmingCharacterId = charmStatusInstance.sourceCharacterId;
                    if (chosenTarget.id === charmingCharacterId) {
                        // rando reassign to someone other than charming character
                        chosenTarget = randoCharacterFromArrayExceptId(combat.getAllCombatants(), charmingCharacterId);
                    }
                }

                // todo: how should individual potential target combat flags work together with abilities whose effect API expects an entire party of targets?  One target with wonder wall should not stop the abl from hitting others on the one hand, and on the other the walled character needs to not have the abl effect applied to them and should proc the wall of wonder reprisal.
                // UPDATE: create a set of chosen targets, even if only one.  Then step through and check for wall of wonder protection.  If found, remove the walled character from the set of targets and apply wall reprisal.  After iteration is complete, send the remaining target set into the chosen ability.
                // since chosen target could be one or more, create an array if there is only one and then we can still just iterate over it
                var targets = undefined;
                if (chosenAbility.targetType === window.Ability.TargetTypesEnum.allEnemies) {
                    console.log("setting AI targets to array " + chosenTarget + " which starts with " + chosenTarget[0].name);
                    targets = chosenTarget;
                } else {
                    // in this case there is only one target, but by wrapping it in an array we can proceed with equivalent loop code below
                    console.log("setting AI target to array wrapping the single target " + chosenTarget + " with name " + chosenTarget.name);
                    targets = [chosenTarget];
                }

                // process combat flags on the chosen target(s)
                for (let target of targets) {
                    if (target.combatFlags & window.Character.CombatFlags.FLAG_WONDER_WALLED === window.Character.CombatFlags.FLAG_WONDER_WALLED) {
                        // lower the wonder wall flag
                        target.combatFlags &= ~window.Character.CombatFlags.FLAG_WONDER_WALLED;

                        // the combat log content should reflect the bounce off the wall and any and all reprisals concatenated
                        combat.combatLogContent = "BZZzzzrrr--SHING!\n";

                        // remove the walled character from the chosenTarget array
                        window.removeCharacterFromArray(target, targets);

                        // generate a random effect, dmg or status, to direct back at Puck
                        var spellKeys = Object.keys(window.spellsDict);
                        var randoSpellIndex = Math.floor(Math.random() * spellKeys.length);

                        // apply the effect to Puck
                        var randoReprisalAbility = window.spellsDict[spellKeys[randoSpellIndex]];
                        randoReprisalAbility.effect(this);
                        // todo: need support for abilities going off without a caster/target.  For the demo, simply saying Miss Fortune for wielder and Puck for target of rando wall of wonder effect is fine.
                        combat.combatLog += randoReprisalAbility.generateFlavorText(new Character({ id: "miss_fortune", name: "Miss Fortune" }), this);

                    }// end wall of wonder flag processing
                }// end combat flag processing loop for target(s)

                console.log("AI chose the ability " + chosenAbility.name);
                // todo: easiest way to have cost still applied to the ability even if there are now 0 targets is to fire off the effect over an empty array.  Trouble is that most abl effect functions were not written expecting an array of targets, and even those that do don't check for an empty array explicitly which might matter depending on how we use the array in effect().  May want to re-write those APIs to make it a standard array of target chars, but for the moment simply sourcing the target type of the chosen ability should suffice.  However, that still procs undefined ref errors since effect() doesn't check for undefined target(s).  Way around that is to apply the cost of the ability separately and then skip the effect() call and the usual flavor text if the targets array is empty.
                if (targets.length > 0) {
                    // there are still targets, so go forward with them as per usual
                    if (chosenAbility.targetType === window.Ability.TargetTypesEnum.allEnemies) {

                        // multi-target attack, expects an array of chars as target	
                        chosenAbility.effect(this, targets);
                        combat.combatLogContent = chosenAbility.generateFlavorText(this, targets);

                        for (let targetKey in targets[0]) {
                            console.log("target " + targets[0] + " with name " + targets[0].name + " has prop: " + targetKey);
                        }

                        console.log(targets[0].name + "'s hp is now " + targets[0].stats.hp + " and specifically the human's HP is " + State.variables.characters["player"].stats.hp);

                    } else {
                        // single target attack, expects only single character as target
                        chosenAbility.effect(this, targets[0]);
                        combat.combatLogContent = chosenAbility.generateFlavorText(this, targets[0]);

                        for (let targetKey in targets[0]) {
                            console.log("target " + targets[0] + " with name " + targets[0].name + " has prop: " + targetKey);
                        }

                        console.log(targets[0].name + "'s hp is now " + targets[0].stats.hp + " and specifically the human's HP is " + State.variables.characters["player"].stats.hp);
                    }
                } else {
                    // abl cost is an object map with keys that match the mutable resource stats... completely on purpose and by design, that was.
                    for (costElement in chosenAbility.cost) {
                        this.stats[costElement] -= chosenAbility.cost[costElement];
                    }
                }// end if no targets left after flag processing, so only abl cost is applied

                console.log("Puck's chosen abl is " + chosenAbility.name + " with first target named " + targets[0].name);
            }// if role is enemy
        }// if role is defined
    }//end Puck AI def

    var mootyChar = State.variables.characters["mooty"];
    mootyChar.gender = "male";
    mootyChar.stats["hp"] = 65;
    mootyChar.stats["mp"] = 50;
    mootyChar.stats["maxHP"] = 65;
    mootyChar.stats["maxMP"] = 50;
    mootyChar.attributes["strength"] = 18;
    mootyChar.attributes["dexterity"] = 8;
    mootyChar.attributes["constitution"] = 14;
    mootyChar.attributes["intelligence"] = 12;
    mootyChar.attributes["wisdom"] = 20;
    mootyChar.attributes["charisma"] = 13;
    mootyChar.stats["atk"] = mootyChar.attributes["strength"];
    mootyChar.stats["def"] = mootyChar.attributes["constitution"];
    mootyChar.stats["pwr"] = mootyChar.getMagicAttributeScore();
    mootyChar.stats["res"] = mootyChar.getMagicAttributeScore();
    mootyChar.entity = new window.Entity({ name: "Burrower" });





}// end defining init()

/// begin init ///
init();
}
export {libifels};