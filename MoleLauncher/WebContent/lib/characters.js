import * as Lib from "./libifels_undum.js"

export class Character {
	constructor(config) {
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
        this.stats = {
            "hp": 50,
            "maxHP": 50,
            "mp": 50,
            "maxMP": 50,
            // standard jRPG stuff
            "atk": 10,
            "def": 10,
            "pwr": 10,
            "res": 10,
            "spd": 10
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
        /**
         * his, hers, their
         */
        this.possessivePronoun = undefined;
        /**
         * he, she, they
         */
        this.personalPronoun_subject = undefined;
        /**
         * him, her, them
         */
        this.personalPronoun_object = undefined;
	}
	getPronoun_possessive() {
		if(this.possessivePronoun) {
			return this.possessivePronoun;
		} else {
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
	}
	getPronoun_personal_subject() {
		if(this.personalPronoun_subject) {
			return this.personalPronoun_subject;
		} else {
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
	}
	getPronoun_personal_object() {
		if(this.personalPronoun_object) {
			return this.personalPronoun_object;
		} else {
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
	}
	/**
     * Check whether the resource stat pools are in sufficient supply to feed a given ability
     */
	canAffordCost(ability) {
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
     * Makes the character act autonomously according to its role
     * @param combat: the current combat context
     * @param role: could be as simple as player or enemy, but could be configurable to something like player:assist if a guided auto-battle system gets implemented someday
     */
	runAI(combat, role) {
		console.log("AI behavior unset");
	}
} // end Character class def

Character.CombatFlags = Object.freeze(
    {
        FLAG_SKIP_TURN: 1,
        FLAG_WONDER_WALLED: 2
    }
);

/**
 * A class representing The Mole character
 */
export class Mole extends Character {
	constructor() {
		super({ id: "mole", name: "Mooty Wort" });
		/**
		 * Gender of the mole
		 */
		this.gender = "male";
		/**
		 * The mole's secondary type, a lesser destiny that modifies the primary
		 */
		this.sMoleMinorDestiny = "";
		/**
		 * The mole's primary type, and destiny he must fulfill
		 */
		this.sMoleMajorDestiny = "";
		/**
		 * String array of item names comprising the mole's inventory
		 */
		this.stringArrayInventory = [];
		/**
		 * An ordinal label describing the mole's categorical caliber as an Underwere:
		 * -3 -> "surfacer", one who really shouldn't be under anyplace much less Underwere. 
		 * -2 -> "noodler", one who dabbles in delving without much skill.
		 * -1 -> "wornclawed", one who is experienced (although experience does not equate to skill) in dabbling at delving and has learned from MANY mistakes. 
		 * 0 -> "underwere", a competent traveler of the Deepness.
		 * 1 -> "tunnelfish", one who is naturally at home burrowing.
		 * 2 -> "digger", a true artisan of burrows; one who is both skilled at digging and understands the philosophy of delving deep dwellings.
		 * 3 -> "delver", a subterranean adventurer extraordinaire!
		 */
		this.ordinalUnderwere = 0;
		
		// rpg mech props
		this.stats["maxHP"] = 100;
		this.stats["maxMP"] = 100;
		this.stats["maxSanity"] = 100;
		this.stats["hp"] = this.stats["maxHP"];
		this.stats["mp"] = this.stats["maxMP"];
		this.stats["sanity"] = this.stats["maxSanity"];
		this.stats["atk"] = 15;
		this.stats["def"] = 8;
		this.stats["pwr"] = 5;
		this.stats["res"] = 20; // eldritch things know better than to mess with moles
		this.stats["spd"] = 1; // the mole is not fast
		this.entity = new Libifels.Entity({ name: "Burrower" });
		
		// todo: adapt to Entity w/ abls paradigm
		// loadout of spells and abilities
		this.incarnations["warmest_hug"] = this.libHandle.spellsDict["warmest_hug"];
		this.incarnations["woolly_shield"] = this.libHandle.spellsDict["woolly_shield"];
		this.incarnations["burrow_furrow"] = this.libHandle.spellsDict["burrow_furrow"];
		this.incarnations["deep_meditation"] = this.libHandle.spellsDict["deep_meditation"];
		this.incarnations["shadowflare"] = this.libHandle.spellsDict["shadowflare"];
		this.incarnations["magma_blast"] = this.libHandle.spellsDict["magma_blast"];
		this.incarnations["static_bolt"] = this.libHandle.spellsDict["static_bolt"];
	}
	
}

export class Grue extends Character {
	constructor() {
		super({ id: "grue", name: "Grue" });
		this.gender = "male";
	    this.stats["maxHP"] = 250;
	    this.stats["maxMP"] = 500;
	    this.stats["hp"] = grueChar.stats["maxHP"];
	    this.stats["mp"] = grueChar.stats["maxMP"];
	    this.stats["atk"] = 75;
	    this.stats["def"] = 100;
	    this.stats["pwr"] = 100;
	    this.stats["res"] = 25;
	    Grue.prototype.entity = new Lib.Entity({ name: "Heart of Darkness" });
	}
	runAI(combat, role) {
        console.log("reached grue runAI fn... have fn!");
        if (role) {
            if (role === "enemy") {
                var playerParty = [];
                for (let playerCharacter of combat.playerParty) {
                    playerParty.push(this.characters[playerCharacter.id]);
                    console.log("attempting to add character with id " + playerCharacter.id);
                    console.log("added " + this.characters[playerCharacter.id].name + " to playerParty");
                }
            
                var enemyParty = [];
                for (let enemyCharacter of combat.enemyParty) {
                    enemyParty.push(this.characters[enemyCharacter.id]);
                }
                
                // defaults for action to be taken
                var chosenAbility = undefined;
                var chosenTarget = playerParty[0];

                // defaults for outliers and statistical points of interest
                var playerLeastDefense = chosenTarget;
                var playerLeastHP = chosenTarget;
                var playerWithTargetBuff = undefined;
                var anyPlayerOffenseBuffed = false;
                var maxHealth = true; // assume true and let contradiction flip it

                /// begin gathering data ///
                for (let player of playerParty) {

                    // overwrite player with least defense if applicable
                    if (player.stats["def"] < playerLeastDefense.stats["def"]) {
                        playerLeastDefense = player;
                    }

                    // overwrite player with least HP if applicable
                    if (player.stats.hp < playerLeastHP.stats.hp) {
                        playerLeastHP = player;
                    }

                    // check for max health scenario flip
                    if (player.stats.hp < player.stats.maxHP) {
                        maxHealth = false;
                    }

                }// end for each player
                /// end gathering data + maybe buff balancing ///

                /// begin story scenario modifier processing ///
                // todo: check mole type and maybe modify attack choice accordingly
                /// end story scenario mod proc ///

                // begin defaults block -- at this point in the script, 
                // if The God has not already picked an abl he will either 
                // do one mostly at random OR spam Dark Star if his health is below 25%
                if (chosenAbility === undefined && chosenTarget === undefined) {
                    if (this.stats.hp > this.stats.maxHP * 0.25) {
                        var percentageRandoAbl = lib.rollPercentage();
                        // choose a player party index randomly and pull the poor person from it for targeting
                        var playerRandoTarget = playerParty[Math.floor(Math.random() * playerParty.length)];
                        // all The God's special abilities are pretty punishing, so make basic atk most probably
                        if (percentageRandoAbl <= 35) {
                        	// basic attack
                            chosenAbility = this.abilities["attack"];
                            chosenTarget = playerLeastDefense;
                        } else if (percentageRandoAbl > 36 && percentageRandoAbl <= 60) {
                        	// hug if possible for maximum damage output
                        	if(this.canAffordCost(this.spells["manyfold_embrace"])) {
                        		chosenAbility = this.spells["manyfold_embrace"];
                        	} else {
                        		chosenAbility = this.abilities["attack"];
                        	}
                            chosenTarget = playerRandoTarget;
                        } else if (percentageRandoAbl > 61 && percentageRandoAbl <= 85) {
                        	// either apply bloodlust to increase attack, or attack to benefit from it
                        	if (!lib.hasStatusEffect(this, lib.statusEffectsDict["bloodlust"])) {
                        		chosenAbility = this.spells["primordial_mandate"];
                                chosenTarget = this;
                            } else {
                            	// hug if possible for maximum damage output
                            	if(this.canAffordCost(this.spells["manyfold_embrace"])) {
                            		chosenAbility = this.spells["manyfold_embrace"];
                            	} else {
                            		chosenAbility = this.abilities["attack"];
                            	}
                            	// regardless, hit the weakest opponent
                                chosenTarget = playerLeastDefense;
                            }
                        } else {
                        	chosenAbility = this.spells["putrefaction"];
                            chosenTarget = playerParty;
                        }// end rando block
                    }// end The God HP > 25%
                    else {
                        // being severely injured, The God now starts to spam Dark Star if no earlier behaviors were proced and he can afford it
                    	if(theYawningGodChar.canAffordCost(darkStarSpell)) {
                    		chosenAbility = this.spells["dark_star"];
                    		chosenTarget = playerParty;
                    	} else {
                    		chosenAbility = this.abilities["attack"];
                    		chosenTarget = playerLeastDefense;
                    	}
                    }
                } // end if abl and target are not yet chosen, landing us in defaults
                /// end defaults block ///

                // normalize input chosen targets to array form
                var targets = undefined;
                if (chosenAbility.targetType === lib.Ability.TargetTypesEnum.allEnemies) {
                    console.log("setting AI targets to array " + chosenTarget + " which starts with " + chosenTarget[0].name);
                    targets = chosenTarget;
                } else {
                    // in this case there is only one target, but by wrapping it in an array we can proceed with equivalent loop code used for multi-target scenario
                    console.log("setting AI target to array wrapping the single target " + chosenTarget + " with name " + chosenTarget.name);
                    targets = [chosenTarget];
                }

                console.log("AI chose the ability " + chosenAbility.name);
                if (targets.length > 0) {
                    // there are still targets, so go forward with them as per usual
                    if (chosenAbility.targetType === lib.Ability.TargetTypesEnum.allEnemies) {

                        // multi-target attack, expects an array of chars as target	
                        chosenAbility.effect(this, targets);
                        combat.combatLogContent = chosenAbility.generateFlavorText(this, targets);

                        for (let targetKey in targets[0]) {
                            console.log("target " + targets[0] + " with name " + targets[0].name + " has prop: " + targetKey);
                        }

                        console.log(targets[0].name + "'s hp is now " + targets[0].stats.hp + " and specifically the human's HP is " + this.characters["mole"].stats.hp);

                    } else {
                        // single target attack, expects only single character as target
                        chosenAbility.effect(this, targets[0]);
                        combat.combatLogContent = chosenAbility.generateFlavorText(this, targets[0]);

                        for (let targetKey in targets[0]) {
                            console.log("target " + targets[0] + " with name " + targets[0].name + " has prop: " + targetKey);
                        }

                        console.log(targets[0].name + "'s hp is now " + targets[0].stats.hp + " and specifically the human's HP is " + this.characters["mole"].stats.hp);
                    }
                } else {
                    // abl cost is an object map with keys that match the mutable resource stats... completely on purpose and by design, that was.
                    for (costElement in chosenAbility.cost) {
                        this.stats[costElement] -= chosenAbility.cost[costElement];
                    }
                }// end if no targets left after flag processing, so only abl cost is applied

                console.log("The God's chosen abl is " + chosenAbility.name + " with first target named " + targets[0].name);
            }// if role is enemy
        }// if role is defined
    }//end grue AI def
} // end Grue class def

export class YawningGod extends Lib.Character {
	constructor() {
		super({ id: "yawning_god", name: "The Yawning God" });
		this.gender = "male";
		this.stats["maxHP"] = 500;
		this.stats["maxMP"] = 100;
		this.stats["hp"] = theYawningGodChar.stats["maxHP"];
		this.stats["mp"] = theYawningGodChar.stats["maxMP"];
		this.stats["atk"] = 100;
		this.stats["def"] = 50;
		this.stats["pwr"] = 100;
		this.stats["res"] = 50;
	    YawningGod.prototype.entity = new Lib.Entity({ name: "Eldritch Horror" });
	}
	runAI(combat, role) {
        console.log("reached The Yawning God runAI fn... have fn!");
        if (role) {
            if (role === "enemy") {
                // defaults for targeting and ability
            	var moleHandle = undefined;
                var chosenAbility = undefined;
                var chosenTarget = undefined;

                // defaults for outliers and statistical points of interest
                var playerLeastDefense = combat.playerParty[0];
                var playerLeastRes = combat.playerParty[0];
                var playerLeastHP = combat.playerParty[0];
                var playerGreatestPwr = combat.playerParty[0];
                var anyPlayerOffenseBuffed = false;
                var maxHealth = true; // assume true and let contradiction flip it

                /// begin gathering player data ///
                for (let player of combat.playerParty) {
                	
                	console.log("looking at player character with id " + player.id);
                    // set our mole handle
                	if(player.id === "mole") {
                		console.log("the mole snuffles off to undefined...");
                    	moleHandle = player;
                    }

                    // overwrite player with least defense if applicable
                    if (player.stats["def"] < playerLeastDefense.stats["def"]) {
                        playerLeastDefense = player;
                    }
                    
                    // overwrite player with least resistance if applicable
                    if (player.stats["res"] < playerLeastRes.stats["res"]) {
                        playerLeastRes = player;
                    }
                    
                    // overwrite player with greatest power if applicable
                    if (player.stats["pwr"] > playerGreatestPwr.stats["pwr"]) {
                        playerGreatestPwr = player;
                    }

                    // overwrite player with least HP if applicable
                    if (player.stats.hp < playerLeastHP.stats.hp) {
                        playerLeastHP = player;
                    }

                    // check for max health scenario flip, wherein any player is at less than max
                    if (player.stats.hp < player.stats.maxHP) {
                        maxHealth = false;
                    }

                }// end for each player
                
                // ensure we found our mole friend
                if(!moleHandle) {
                	throw "Exception running Yawning God AI: where's the mole?  You can't have a game without a mole!";
                }
                /// end gathering player data ///
        
                // set abl probabilities as floating point percentages; default to mostly buffing and hugging to death
                var ablProbsConfig = {
                	"primordial_mandate": 0.3,
                	"manyfold_embrace": 0.4,
                	"pestilence": 0.2,
                	"dark_star": 0.1
                }
                if(this.stats.hp <= this.stats.maxHP * 0.75 && 
                		this.stats.hp > this.stats.maxHP * 0.5) {
                	// now we wanna increase chances pestilence
                	ablProbsConfig["primordial_mandate"] = 0.2;
                	ablProbsConfig["manyfold_embrace"] = 0.3;
                	ablProbsConfig["pestilence"] = 0.3;
                	ablProbsConfig["dark_star"] = 0.2;
                } else if (this.stats.hp <= this.stats.maxHP * 0.5 &&
                		this.stats.hp > this.stats.maxHP * 0.25) {
                	// never mind buffing, just hit hard
                	ablProbsConfig["primordial_mandate"] = 0.0;
                	ablProbsConfig["manyfold_embrace"] = 0.3;
                	ablProbsConfig["pestilence"] = 0.4;
                	ablProbsConfig["dark_star"] = 0.3;
                } else if (this.stats.hp <= this.stats.maxHP * 0.25) {
                	// PANIC!1!
                	ablProbsConfig["primordial_mandate"] = 0.0;
                	ablProbsConfig["manyfold_embrace"] = 0.4;
                	ablProbsConfig["pestilence"] = 0.0;
                	ablProbsConfig["dark_star"] = 0.6;
                }
                
                // todo: particular mole attributes or status effects we wanna sniff for?
                // only actually the one player in this case
                chosenTarget = combat.playerParty[0];
                chosenAbility = lib.chooseRandomAbility(ablProbsConfig)
                
                /// defaults block ///
                if (chosenAbility === undefined && chosenTarget === undefined) {
                    if (this.stats.hp > this.stats.maxHP * 0.25) {
                        var percentageRandoAbl = lib.rollPercentage();
                        // choose a player party index randomly and pull the poor person from it for targeting
                        var playerRandoTarget = playerParty[Math.floor(Math.random() * playerParty.length)];
                        // all The God's special abilities are pretty punishing, so make basic atk most probably
                        if (percentageRandoAbl <= 35) {
                        	// basic attack
                            chosenAbility = this.abilities["attack"];
                            chosenTarget = playerLeastDefense;
                        } else if (percentageRandoAbl > 36 && percentageRandoAbl <= 60) {
                        	// hug if possible for maximum damage output
                        	if(this.canAffordCost(this.spells["manyfold_embrace"])) {
                        		chosenAbility = this.spells["manyfold_embrace"];
                        	} else {
                        		chosenAbility = this.abilities["attack"];
                        	}
                            chosenTarget = playerRandoTarget;
                        } else if (percentageRandoAbl > 61 && percentageRandoAbl <= 85) {
                        	// either apply bloodlust to increase attack, or attack to benefit from it
                        	if (!lib.hasStatusEffect(this, lib.statusEffectsDict["bloodlust"])) {
                        		chosenAbility = this.spells["primordial_mandate"];
                                chosenTarget = this;
                            } else {
                            	// hug if possible for maximum damage output
                            	if(this.canAffordCost(this.spells["manyfold_embrace"])) {
                            		chosenAbility = this.spells["manyfold_embrace"];
                            	} else {
                            		chosenAbility = this.abilities["attack"];
                            	}
                            	// regardless, hit the weakest opponent
                                chosenTarget = playerLeastDefense;
                            }
                        } else {
                        	chosenAbility = this.spells["putrefaction"];
                            chosenTarget = playerParty;
                        }// end rando block
                    }// end The God HP > 25%
                    else {
                        // being severely injured, The Yawning God now starts to spam Dark Star if no earlier behaviors were proced and he can afford it,
                    	// with a 35% chance of variance to simple attack so that the player has a little breathing room
                    	if(theYawningGodChar.canAffordCost(darkStarSpell) &&
                    			lib.rollPercentage() > 35) {
                    		chosenAbility = this.spells["dark_star"];
                    		chosenTarget = playerParty;
                    	} else {
                    		chosenAbility = this.abilities["attack"];
                    		chosenTarget = playerLeastDefense;
                    	}
                    }
                } // end if abl and target are not yet chosen, landing us in defaults
                /// end defaults block ///
                
                // todo: refactor to have this fn return a chosen move and target for the enemy
                // which will be performed at a later stage -- I want the combat manager to
                // generate a prompt for the user suggesting what the enemy plans to do and then
                // once player has chosen their action spd stat will determine what happens when.

                // normalize input chosen targets to array form
                var targets = undefined;
                if (chosenAbility.targetType === lib.Ability.TargetTypesEnum.allEnemies) {
                    console.log("setting AI targets to array " + chosenTarget + " which starts with " + chosenTarget[0].name);
                    targets = chosenTarget;
                } else {
                    // in this case there is only one target, but by wrapping it in an array we can proceed with equivalent loop code used for multi-target scenario
                    console.log("setting AI target to array wrapping the single target " + chosenTarget + " with name " + chosenTarget.name);
                    targets = [chosenTarget];
                }

                console.log("AI chose the ability " + chosenAbility.name);
                if (targets.length > 0) {
                    // there are still targets, so go forward with them as per usual
                    if (chosenAbility.targetType === lib.Ability.TargetTypesEnum.allEnemies) {

                        // multi-target attack, expects an array of chars as target	
                        chosenAbility.effect(this, targets);
                        combat.combatLogContent = chosenAbility.generateFlavorText(this, targets);

                        for (let targetKey in targets[0]) {
                            console.log("target " + targets[0] + " with name " + targets[0].name + " has prop: " + targetKey);
                        }

                        console.log(targets[0].name + "'s hp is now " + targets[0].stats.hp + " and specifically the human's HP is " + this.characters["mole"].stats.hp);

                    } else {
                        // single target attack, expects only single character as target
                        chosenAbility.effect(this, targets[0]);
                        combat.combatLogContent = chosenAbility.generateFlavorText(this, targets[0]);

                        for (let targetKey in targets[0]) {
                            console.log("target " + targets[0] + " with name " + targets[0].name + " has prop: " + targetKey);
                        }

                        console.log(targets[0].name + "'s hp is now " + targets[0].stats.hp + " and specifically the human's HP is " + this.characters["mole"].stats.hp);
                    }
                } else {
                    // abl cost is an object map with keys that match the mutable resource stats... completely on purpose and by design, that was.
                    for (costElement in chosenAbility.cost) {
                        this.stats[costElement] -= chosenAbility.cost[costElement];
                    }
                }// end if no targets left after flag processing, so only abl cost is applied

                console.log("The God's chosen abl is " + chosenAbility.name + " with first target named " + targets[0].name);
            }// if role is enemy
        }// if role is defined
    }//end The Yawning God AI def
}// end Yawning God class def