import {Libifels} from "./libifels.js";
import * as Spells from "./spellbook.js";
import {Combat} from "./combat.js";

export class Character {
	constructor(config) {
		Character.prototype.battleSpritePath = "images/characters/battle";
		this.id = config.id;
        this.name = config.name;
        this.gender = "";
        this.level = 10;
        /**
         * Multipliers for elemental damage; no special affinity is 1, strong weakness is high positive and strong resistance/absorption is low negative
         */
        this.elemAffinities = {
        	"shadow": 1,
        	"fire": 1,
        	"lightning": 1,
        	"ice": 1,
        	"acid": 1
        }

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
        // todo: we should really be handling stat mods by accounting for modifiers tracked back to
        //   a unique source, e.g. "caustic_claws": {"stat" : "atk", "value": 25} such that we don't run into
        //   non-commutative issues when stats mods can stack OR the alternative problem of simply returning
        //   to core stats and effectively ending a competing effect prematurely.
        this.coreStats = {};
        Object.assign(this.coreStats, this.stats);
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
	 * Reset this character instance's combat fields
	 */
	resetCombatStatus() {
		this.stats.maxHP = this.coreStats.maxHP;
		this.stats.hp = this.coreStats.maxHP;
		this.stats.maxMP = this.coreStats.maxMP;
		this.stats.mp = this.coreStats.maxMP;
		this.stats.atk = this.coreStats.atk;
		this.stats.def = this.coreStats.def;
		this.stats.pwr = this.coreStats.pwr;
		this.stats.res = this.coreStats.res;
		this.stats.spd = this.coreStats.spd;
		this.combatFlags = 0;
		this.statusEffects = [];
	}
	/**
	 * Return Character stats, status effects, inventory, and equipment to baseline
	 */
	resetStatus() {
		this.resetCombatStatus();
		
		// reset associations and (potentially) non-combat fields
		this.affinities = new Map();
        this.inventory = [];
        this.equipment = [];
        this.statusEffects = [];
        this.inductive_bias = [];
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
	/**
	 * Changes the index of the battle sprite we're loading for this character
	 * @param index is the 0-based number indicating the index of battleSprites we should be pointing at with spriteIdx 
	 */
	advanceBattleImage(index) {
		// base sprite stepping
		if(this.battleSprites) {
			if(this.battleSprites.length-1 >= index) {
				this.spriteIdx = index;
			}
		}
		// overlay stepping
		if(this.battleOverlaySprites) {
			if(this.battleOverlaySprites.length-1 >= index) {
				this.overlaySpriteIdx = index;
			}
		}
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
		this.stats["shovelry"] = 0; // every mole is shovelrous, but we're talking real hero stuff
        Object.assign(this.coreStats, this.stats);
		this.entity = new Spells.Burrower();
		this.spriteIdx = 0;
		this.baseOpacity = 0.85;
		this.battleSprites = [this.battleSpritePath+"/mole/stoic_determination.jpg"];
	}
	/**
	 * Reset this player character instance's combat fields and player specific stats like sanity
	 */
	resetStatus() {
		super.resetStatus();
		this.stats["maxSanity"] = this.coreStats["maxSanity"];
		this.stats["sanity"] = this.coreStats["maxSanity"];
		this.stats["shovelry"] = 0;
	}
}

export class Grue extends Character {
	constructor() {
		super({ id: "grue", name: "Grue" });
		this.gender = "male";
	    this.stats["maxHP"] = 350;
	    this.stats["maxMP"] = 500;
	    this.stats["hp"] = this.stats["maxHP"];
	    this.stats["mp"] = this.stats["maxMP"];
	    this.stats["atk"] = 25;
	    this.stats["def"] = 15;
	    this.stats["pwr"] = 32;
	    this.stats["res"] = 25; 
	    this.stats["spd"] = 0; // inevitability need not rush
	    Object.assign(this.coreStats, this.stats);
	    Grue.prototype.entity = new Spells.HeartOfDarkness();
	    this.spriteIdx = 0;
	    this.overlaySpriteIdx = 0; 
	    this.baseOpacity = 0.5;
	    this.overlayOpacity = 1.0;
	    /**
	     * Grue absorbs shadow for double the damage that would have been dealt
	     */
	    this.elemAffinities.shadow = -0.1;
	    this.battleSprites = [
	    	this.battleSpritePath+"/grue/grue.png"
	    ];
	    /**
	     * *sigh* the glowy eyes weren't glowy ENOUGH with transparency applied, but I needed the ghostly whisperyness to the rest of 'im... so I'm making a whole new layer for the *drumroll* nightglo eyes!
	     */
	    this.battleOverlaySprites = [
	    	this.battleSpritePath+"/grue/nightglo0.png",
	    	this.battleSpritePath+"/grue/nightglo1.png",
	    	this.battleSpritePath+"/grue/nightglo2.png",
	    	this.battleSpritePath+"/grue/nightglo3.png",
	    	this.battleSpritePath+"/grue/nightglo4.png",
	    	this.battleSpritePath+"/grue/nightglo5.png"
	    ];
	    /**
	     * Every 2 consecutive uses of Consume require  a 1d4 turn timeout before it can be used again
	     */
	    this.consumeTimeout = 0;
	    /**
	     * Contiguous turns Consume has been used; for balance purposes, the Grue can't use it more than two turns in a row.
	     */
	    this.consumeTurns = 0;
	    /**
	     * Each use of Brass Lantern starts a timeout turn clock of 1d4 rounds such that he never super spams it
	     */
	    this.brassLanterTimeout = 0;
	    /**
	     * Flag indicating we're in the first turn of a consume timeout, signaling the Grue to use touch of void
	     */
	    this.firstConsumeTimeoutTurn = false;
	}
	/**
	 * Uses an input ability id string -> weight factor number that represents a percentage chance config object
	 * in concert with character-specific limiter and tactics logic to determine what ability should be used.
	 * @param combat the current Combat model
	 * @param ablProbsConfig an object literal of abl IDs keys mapped to percentage chance floats 
	 */
	chooseAbility(ablProbsConfig) {
		let chosenAbility = this.entity.spellsDict[
        	Combat.chooseRandomAbility(ablProbsConfig)
        ];
        
        // special abl usage limiting
        if(chosenAbility.id === "brass_lantern") {
        	if(this.brassLanternTimeout > 0) {
        		// reassign to touch of void since we're in brass lantern timeout
        		chosenAbility = this.entity.spellsDict["chill_beyond"];
        	} else {
        		// brass lantern is happening, so put him in timeout
        		this.brassLanternTimeout = Libifels.rollNDM(1, 4);
        	}
        } else if(chosenAbility.id === "consume") {
        	if(this.consumeTimeout <= 0) {
            	if(this.consumeTurns >= 2) {
            		// reassign to chill_beyond since we've consumed twice in a row
            		chosenAbility = this.entity.spellsDict["chill_beyond"];
            		// since he hit it twice in a row, give the player a break
            		this.consumeTimeout = Libifels.rollNDM(1, 4);
            		this.firstConsumeTimeoutTurn = true;
            	} else {
            		this.consumeTurns++;
            	}
        	} else {
        		if(this.firstConsumeTimeoutTurn) {
        			// reassign to touch_of_void to take advantage of the fact that
        			// we will have just been redirected to chill_beyond and put defenseless on the target
            		chosenAbility = this.entity.spellsDict["touch_of_void"];
            		this.firstConsumeTimeoutTurn = false;
        		} else {
        			// reassign to chill_beyond since we're still in timeout, but it's not the first turn this timeout session
        			chosenAbility = this.entity.spellsDict["chill_beyond"];
        		}
        	}
        }
        
        // tick down limiters
        if(this.brassLanterTimeout > 0) {
        	this.brassLanternTimeout--;
        }
        if(this.consumeTimeout > 0) {
        	this.consumeTimeout--;
        }
        if(chosenAbility.id !== "consume") {
        	this.consumeTurns = 0;
        }
        return chosenAbility;
	}
	/**
	 * Run the Grue's automated combat gamelogic
	 * @param combat the current Combat model
	 * @param role string role the Grue is to fulfill; currently just 'enemy' is handled here.
	 */
	runAI(combat, role) {
        if (role) {
            if (role === "enemy") {
                // defaults for action to be taken
                var chosenAbility = undefined;
                var chosenTarget = undefined;

                // defaults for outliers and statistical points of interest
                var playerLeastDefense = combat.playerParty[0];
                var playerLeastHP = combat.playerParty[0];
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
                	"touch_of_void": 0.1,
                	"brass_lantern": 0.3,
                	"chill_beyond": 0.55,
                	"consume": 0.05
                }
                if(this.stats.hp <= this.stats.maxHP * 0.75 && 
                		this.stats.hp > this.stats.maxHP * 0.5) {
                	// now we wanna increase chances of freezing player
                	ablProbsConfig["touch_of_void"] = 0.3;
                	ablProbsConfig["brass_lantern"] = 0.2;
                	ablProbsConfig["chill_beyond"] = 0.45;
                	ablProbsConfig["consume"] = 0.05;
                } else if (this.stats.hp <= this.stats.maxHP * 0.5 &&
                		this.stats.hp > this.stats.maxHP * 0.25) {
                	// never mind the fondling and maybe freezing further, just burn!
                	ablProbsConfig["touch_of_void"] = 0.3;
                	ablProbsConfig["brass_lantern"] = 0.4;
                	ablProbsConfig["chill_beyond"] = 0.1;
                	ablProbsConfig["consume"] = 0.2;
                } else if (this.stats.hp <= this.stats.maxHP * 0.25) {
                	// F E A S T
                	ablProbsConfig["touch_of_void"] = 0.3;
                	ablProbsConfig["brass_lantern"] = 0.1;
                	ablProbsConfig["chill_beyond"] = 0.0;
                	ablProbsConfig["consume"] = 0.6;
                }
                
                // weighted rando choice
                chosenAbility = this.chooseAbility(ablProbsConfig);
                
                // make sure we can afford the cost, else use MP steal
                if(!this.canAffordCost(chosenAbility)) {
                	chosenAbility = this.entity.spellsDict["touch_of_void"];
                }
                
                /// install target if necessary ///
                if(chosenAbility.targetType === Spells.Ability.TargetTypesEnum.singleTarget) {    
                    if(chosenAbility.id === "touch_of_void") {
                    	// this one's all about mage draining
                    	chosenTarget = combat.playerParty[0];
                    	for(let character of combat.playerParty) {
                    		if(character.stats.mp > chosenTarget.stats.mp) {
                    			chosenTarget = character;
                    		}
                    	}
                    } else {
                    	// todo: add more intelligent targeting via abl descriptor tag that indicates what sort of defense
                        //  the ability targets e.g. "hits_res" or "hits_def"
                    	// the Grue targets whoever's worst off because he's a butt
                    	chosenTarget = playerLeastHP;
                    }
                    // todo: support for small chance of random target selection instead so that player with
                    //  least def isn't pummeled too much and the player can't kite the AI as easily 
                } // end if abl needs a target
                /// end target installation block ///

                combat.currentAISelectedAbility = chosenAbility;
                combat.currentTargetCharacter = chosenTarget
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
		this.stats["atk"] = 15;
		this.stats["def"] = 10;
		this.stats["pwr"] = 10;
		this.stats["res"] = 1; // as a being of madness, the Yawning God's mind is not well guarded
		this.stats["spd"] = 5;
		Object.assign(this.coreStats, this.stats);
	    YawningGod.prototype.entity = new Spells.EldritchHorror();
	    this.spriteIdx = 0;
	    this.baseOpacity = 0.5;
	    this.battleSprites = [
	    	this.battleSpritePath+"/yawning_god/yawning_god_mk4.jpg"
	    ];
	}
	runAI(combat, role) {
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
                	// set our mole handle
                	if(player.id === "mole") {
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
                
                var randoAbilityId = Combat.chooseRandomAbility(ablProbsConfig);
                chosenAbility = this.entity.spellsDict[
                	randoAbilityId
                ];
                
                // check for redundant status mod application and modify chosen abl accordingly
                // todo: make this general by adding ability descriptor tags
                //  such as "status_effect_add:<id of status effect we add>"
                if(chosenAbility.id === "primordial_mandate") {
                	if (Libifels.hasStatusEffect(this, "bloodlust")) {
                		// todo: logic for reselection?
                		chosenAbility = this.entity.spellsDict["dummy_attack"];
                    }
                }
                
                // prior to targeting, check if the YG can actually afford the abl he wants to use.
                //  if not, make him consider a few MP restoring moves
                if(!this.canAffordCost(chosenAbility)) {
                	chosenAbility = this.entity.spellsDict["manyfold_embrace"];
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
                combat.currentAISelectedAbility = chosenAbility;
                combat.currentTargetCharacter = chosenTarget;
                return chosenAbility;
            }// if role is enemy
        }// if role is defined
    }//end The Yawning God AI def
}// end Yawning God class def