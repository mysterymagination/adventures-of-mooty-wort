import * as Lib from "./libifels_undum.js";
import * as Spells from "./spellbook.js";

export class Character {
	constructor(config) {
		Character.prototype.battleSpritePath = "images/characters/battle";
		this.id = config.id;
        this.name = config.name;
        this.gender = "";
        this.level = 10;

        // simple object map of categorical descriptor arrays,
        // e.g. descriptors.body = ["fur","spherical"]
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
        /** 
         * a character's Entity is their Spell load-out.
         */
        Character.prototype.entity = undefined;
        /**
         * String array of command presented to the player in the combat UI
         */
        this.commands = [
            "Attack",
            "Magic",
            "Defend",
            "Run"
        ]

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
	 * Runs NPC combat AI to determine what it should do based on current combat variable
	 * @param combat current Combat model
	 * @param role string value representing the role the NPC is playing wrt the player e.g. "enemy" or "ally"
	 * @return an Ability object representing the action the NPC has chosen to take 
	 */
    /**
     * Makes the character act autonomously according to its role
     * @param combat: the current combat context via Combat model object
     * @param role: could be as simple as ally or enemy wrt the player, but 
     *        could be configurable to something like player:assist if a 
     *        guided auto-battle system gets implemented someday
     * @return an Ability object representing the action the automated Character has chosen to take 
     */
	runAI(combat, role) {
		throw "runAI; AI behavior unset -- Character subclasses should override this method";
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
		this.entity = new Spells.Burrower();
		this.battleSprites = [this.battleSpritePath+"/mole/stoic_determination.jpg"];
	}
}

export class Grue extends Character {
	constructor() {
		super({ id: "grue", name: "Grue" });
		this.gender = "male";
	    this.stats["maxHP"] = 250;
	    this.stats["maxMP"] = 500;
	    this.stats["hp"] = this.stats["maxHP"];
	    this.stats["mp"] = this.stats["maxMP"];
	    this.stats["atk"] = 75;
	    this.stats["def"] = 100;
	    this.stats["pwr"] = 100;
	    this.stats["res"] = 25;
	    Grue.prototype.entity = new Spells.HeartOfDarkness();
	    this.battleSprites = [
	    	this.battleSpritePath+"/grue/grue_nightmare_0.png",
	    	this.battleSpritePath+"/grue/grue_nightmare_1.png",
	    	this.battleSpritePath+"/grue/grue_nightmare_2.png",
	    	this.battleSpritePath+"/grue/grue_nightmare_3.png",
	    	this.battleSpritePath+"/grue/grue_nightmare_4.png",
	    	this.battleSpritePath+"/grue/grue_nightmare_5.png",
	    	this.battleSpritePath+"/grue/grue_nightmare_6.png"
	    	];
	}
	runAI(combat, role) {
        console.log("reached grue runAI fn... have fn!");
        if (role) {
            if (role === "enemy") {
                // defaults for action to be taken
                var chosenAbility = undefined;
                var chosenTarget = undefined;

                // defaults for outliers and statistical points of interest
                var playerLeastDefense = chosenTarget;
                var playerLeastHP = chosenTarget;
                var playerWithTargetBuff = undefined;
                var anyPlayerOffenseBuffed = false;
                var maxHealth = true; // assume true and let contradiction flip it

                /// begin gathering data ///
                for (let player of combat.playerParty) {

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

                
                // set abl probabilities as floating point percentages; default to mostly buffing and hugging to death
                var ablProbsConfig = {
                	"touch_of_the_void": 0.5,
                	"brass_lantern": 0.3,
                	"chill_beyond": 0.15,
                	"consume": 0.05
                }
                if(this.stats.hp <= this.stats.maxHP * 0.75 && 
                		this.stats.hp > this.stats.maxHP * 0.5) {
                	// now we wanna increase chances of freezing player
                	ablProbsConfig["touch_of_the_void"] = 0.2;
                	ablProbsConfig["brass_lantern"] = 0.35;
                	ablProbsConfig["chill_beyond"] = 0.4;
                	ablProbsConfig["consume"] = 0.05;
                } else if (this.stats.hp <= this.stats.maxHP * 0.5 &&
                		this.stats.hp > this.stats.maxHP * 0.25) {
                	// never mind the fondling and maybe freezing further, just burn!
                	ablProbsConfig["touch_of_the_void"] = 0.0;
                	ablProbsConfig["brass_lantern"] = 0.6;
                	ablProbsConfig["chill_beyond"] = 0.2;
                	ablProbsConfig["consume"] = 0.2;
                } else if (this.stats.hp <= this.stats.maxHP * 0.25) {
                	// F E A S T
                	ablProbsConfig["touch_of_the_void"] = 0.0;
                	ablProbsConfig["brass_lantern"] = 0.4;
                	ablProbsConfig["chill_beyond"] = 0.0;
                	ablProbsConfig["consume"] = 0.6;
                }
                
                // todo: particular mole attributes or status effects we wanna sniff for?
                // only actually the one player in this case
                chosenAbility = this.entity.spellsDict[
                	combat.chooseRandomAbility(ablProbsConfig)
                ];
                
                /// install target if necessary ///
                if(chosenAbility.targetType === Spells.Ability.TargetTypesEnum.singleTarget) {   
                    // todo: add more intelligent targeting via abl descriptor tag that indicates what sort of defense
                    //  the ability targets e.g. "hits_res" or "hits_def"
                	// the Grue targets whoever's worst off because he's a butt
                    chosenTarget = playerLeastHP;
                    // todo: support for small chance of random target selection instead so that player with
                    //  least def isn't pummeled too much and the player can't kite the AI as easily 
                } // end if abl needs a target
                /// end target installation block ///

                combat.currentSelectedAbility = chosenAbility;
                combatModel.currentTargetCharacter = chosenTarget
                console.log("The Grue's chosen abl is " + chosenAbility.name
                		+ (chosenTarget ? ", targetting "+chosenTarget.name : ""));
                return chosenAbility;
            }// if role is enemy
        }// if role is defined
    }//end grue AI def
} // end Grue class def

export class YawningGod extends Character {
	constructor() {
		super({ id: "yawning_god", name: "The Yawning God" });
		this.gender = "male";
		this.stats["maxHP"] = 500;
		this.stats["maxMP"] = 100;
		this.stats["hp"] = this.stats["maxHP"];
		this.stats["mp"] = this.stats["maxMP"];
		this.stats["atk"] = 100;
		this.stats["def"] = 50;
		this.stats["pwr"] = 100;
		this.stats["res"] = 50;
	    YawningGod.prototype.entity = new Spells.EldritchHorror();
	    this.battleSprites = [
	    	this.battleSpritePath+"/yawning_god/yawning_god_mk4.jpg"
	    ];
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
                
                var randoAbilityId = combat.chooseRandomAbility(ablProbsConfig);
                chosenAbility = this.entity.spellsDict[
                	randoAbilityId
                ];
                
                // check for redundant status mod application and modify chosen abl accordingly
                // todo: make this general by adding ability descriptor tags
                //  such as "status_effect_add:<id of status effect we add>"
                if(chosenAbility.id === "primordial_mandate") {
                	if (Lib.MoleUndum.hasStatusEffect(this, "bloodlust")) {
                		// todo: logic for reselection?
                		chosenAbility = this.entity.spellsDict["attack"];
                    }
                }
                
                /// install target if necessary ///
                // todo: particular mole attributes or status effects we wanna sniff for?
                if(chosenAbility.targetType === Spells.Ability.TargetTypesEnum.singleTarget) {   
                    // all The God's special abilities are pretty punishing, so make basic atk most probable
                    // todo: add more intelligent targeting via abl descriptor tag that indicates what sort of defense
                    //  the ability targets e.g. "hits_res" or "hits_def"
                    chosenTarget = playerLeastDefense;
                    // todo: support for small chance of random target selection instead so that player with
                    //  least def isn't pummeled too much and the player can't kite the AI as easily 
                } // end if abl needs a target
                /// end target installation block ///
                
                console.log("The Yawning God's chosen abl is " + chosenAbility.name
                		+ (chosenTarget ? ", targeting "+chosenTarget.name : ""));
                combat.currentSelectedAbility = chosenAbility;
                combat.currentTargetCharacter = chosenTarget;
                return chosenAbility;
            }// if role is enemy
        }// if role is defined
    }//end The Yawning God AI def
}// end Yawning God class def