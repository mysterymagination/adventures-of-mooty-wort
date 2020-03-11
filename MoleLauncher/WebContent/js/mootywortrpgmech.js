// imports
import Libifels from '../lib/libifels.js';

function MootyWortRpgMech() {
	// instantiate library
	var lib = new Libifels();
	this.characters = {
	        "mole": new Player({ id: "mole", name: "Mooty Wort" }),
	        "the_god": new Character({ id: "the_god", name: "The God" }),
	        "grue": new Character({ id: "grue", name: "Grue" })
	}
	// establish Player party
    this.party = [this.characters["mole"]];


    /**
    Defenseless halves a character's defensive attributes 
    */
    var defenselessStatusEffect = this.statusEffectsDict["defenseless"];
    defenselessStatusEffect.isBuff = false;
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
    var temperStatusEffect = this.statusEffectsDict["temper"];
    temperStatusEffect.isBuff = true;
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
    var focusStatusEffect = this.statusEffectsDict["focus"];
    focusStatusEffect.isBuff = true;
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
    var thirdEyeStatusEffect = this.statusEffectsDict["third_eye"];
    thirdEyeStatusEffect.isBuff = true;
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
    var regenStatusEffect = this.statusEffectsDict["regen"];
    regenStatusEffect.isBuff = true;
    regenStatusEffect.descriptors.push("buff", "health");
    regenStatusEffect.effect = function (targetChar) {
        console.log("Wounds close and gaping wounds knit themselves shut as " + targetChar.name + " regenerates " + targetChar.stats["res"] + " HP!");
        targetChar.stats["hp"] += targetChar.stats["res"];
    }
    regenStatusEffect.reverseEffect = function (targetChar) { }

    /**
    Bloodlust quadruples STR in exchange for halving all mental attributes
    */
    var bloodlustStatusEffect = this.statusEffectsDict["bloodlust"];
    bloodlustStatusEffect.isBuff = true;
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
    var poisonStatusEffect = this.statusEffectsDict["poison"];
    poisonStatusEffect.isBuff = false;
    poisonStatusEffect.descriptors.push("debuff", "health");
    poisonStatusEffect.effect = function (targetChar) {
        targetChar.stats["atk"] *= 0.5;
        targetChar.stats["def"] *= 0.5;
    }
    poisonStatusEffect.reverseEffect = function (targetChar) {
        targetChar.stats["atk"] *= 2;
        targetChar.stats["def"] *= 2;
    }
    
    var toxinSpell = lib.spellsDict["toxin"];
    toxinSpell.targetType = lib.Ability.TargetTypesEnum.singleEnemy;
    toxinSpell.cost = { "mp": 15 };
    toxinSpell.calcDmg = function (sourceChar, targetChar) {
        return sourceChar.stats["pwr"] - targetChar.stats["res"];
    }
    toxinSpell.effect = function (sourceChar, targetChar) {
        this.dmg = this.calcDmg(sourceChar, targetChar);
        targetChar.stats["hp"] -= this.dmg;
        lib.addUniqueStatusEffect(targetChar, poisonStatusEffect);

        // MP cost
        this.processCost(sourceChar);
    }
    toxinSpell.generateFlavorText = function (sourceChar, targetChar) {
        return "An aura of gleaming electric purple light, striated with the cheerily deadly greenish glow of radioactivity, surrounds " + sourceChar.name + " as " + sourceChar.getPronoun_gen() + " fevered will infects " + targetChar.name + ".  The insidious infection quickly overwhelms " + targetChar.name + "'s immune system totally, dealing " + this.dmg + " damage, and promising more...";
    }

    /**
    Perfect Stillness deals mild cold damage to the wielder and massive cold damage to the target
    */
    var perfectStillnessSpell = lib.spellsDict["perfect_stillness"];
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
    Warmest hug heals self and other with ATK
    */
    var warmestHugSpell = lib.spellsDict["warmest_hug"];
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
    var woollyShieldSpell = lib.spellsDict["woolly_shield"];
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
    var maenadFrenzySpell = lib.spellsDict["maenad_frenzy"];
    maenadFrenzySpell.targetType = lib.Ability.TargetTypesEnum.singleEnemy;
    maenadFrenzySpell.cost = { "mp": 10, "hp":maenadFrenzySpell.dmg/2}; 
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
    
    // todo: gear up mole character for battle
    var mootyChar = this.characters["mole"];
    mootyChar.gender = "male";
    mootyChar.stats["maxHP"] = 65;
    mootyChar.stats["maxMP"] = 50;
    mootyChar.stats["hp"] = mootyChar.stats["maxHP"];
    mootyChar.stats["mp"] = mootyChar.stats["maxMP"];
    mootyChar.stats["atk"] = 10;
    mootyChar.stats["def"] = 10;
    mootyChar.stats["pwr"] = 10;
    mootyChar.stats["res"] = 10;
    mootyChar.entity = new window.Entity({ name: "Burrower" });

    var theGodChar = this.characters["the_god"];
    theGodChar.gender = "male";
    theGodChar.stats["maxHP"] = 500;
    theGodChar.stats["maxMP"] = 100;
    theGodChar.stats["hp"] = theGodChar.stats["maxHP"];
    theGodChar.stats["mp"] = theGodChar.stats["maxMP"];
    theGodChar.stats["atk"] = 100;
    theGodChar.stats["def"] = 50;
    theGodChar.stats["pwr"] = 100;
    theGodChar.stats["res"] = 50;
    theGodChar.entity = new this.Entity({ name: "Eldritch Horror" });
    
    /**
    Manyfold Embrace damages the user slightly but combines their ATK and PWR to generate massive damage to the enemy
    */
    var manyFoldEmbraceSpell = new lib.Spell({ id: "manyfold_embrace", name: "Manyfold Embrace" });
    manyFoldEmbraceSpell.targetType = lib.Ability.TargetTypesEnum.singleEnemy;
    manyFoldEmbraceSpell.cost = { "mp": 20, "hp": 50};//manyFoldEmbraceSpell.dmg/2}; // todo: trouble with this is that we haven't set the dmg yet when this obj literal is defined; we'd need to put a lambda here instead and have provisions to call it in processCost?
    manyFoldEmbraceSpell.calcDmg = function (sourceChar, targetChar) {
        // idea is the source is transforming tentacles into mighty spiked cudgels
    	// using magic and then buffeting the target with them
    	return 1.5 * (sourceChar.stats["atk"] + sourceChar.attributes["pwr"]) 
        	   - 0.5 * targetChar.stats["def"];
    }
    manyFoldEmbraceSpell.effect = function (sourceChar, targetChar) {
        this.dmg = this.calcDmg(sourceChar, targetChar);
        targetChar.stats["hp"] -= this.dmg;

        // MP cost
        this.processCost(sourceChar);
    }
    manyFoldEmbraceSpell.generateFlavorText = function (sourceChar, targetChar) {
        return "An oily blackness like the surface of an unfathomable lake on a moonless night oozes over The God's spongy fishbelly-white flesh, and in a blinding flash of electric purple a series of serrated spikes have materialized in its wake!  With all the looming inevitability of death itself, he descends upon "+targetChar.name+" and wraps  his innumerable tentacles about "+targetChar.getPronoun_obj()+" in a crushing embrace."; 
    }
    // todo: define putrefaction spell (mid MP cost for low damage and poison status)
    /**
    Pestilence damages all enemies and has 50% to poison each
    */
    var pestilenceSpell = new lib.Spell({ id: "pestilence", name: "Pestilence" });
    pestilenceSpell.targetType = lib.Ability.TargetTypesEnum.allEnemies;
    pestilenceSpell.cost = { "mp": 50 };
    pestilenceSpell.calcDmg = function (sourceChar, targetChar) {
    	return sourceChar.attributes["pwr"] - 0.5 * targetChar.stats["res"];
    }
    pestilenceSpell.effect = function (sourceChar, targetChars) {
        for(let index = 0; index < targetChars.length; index++) {
        	// apply damage to target
        	this.dmg = this.calcDmg(sourceChar, targetChars[index]);
        	targetChars[index].stats["hp"] -= this.dmg;
        	// possibly apply poison
        	let roll = lib.rollPercentage();
        	if(roll >= 50) {
        		lib.addUniqueStatusEffect(targetChars[index], poisonStatusEffect);
        	}
        }

        // MP cost
        this.processCost(sourceChar);
    }
    pestilenceSpell.generateFlavorText = function (sourceChar, targetChar) {
        return "With a tortured wailing wheeze, The God draws in a mighty breath; the resulting vortex whipping the parties hair and fur and whiskers into a frazzled chaos that seems to sustain him.  When the hurricane winds calm at last, silence reigns for a moment before a deafening roar quashes the quiet out of existence: plumes of putrescent purple and bruised black smoke snake their way out of The God's maw, their very presence infecting the air with malice, and encompass everyone in choking fog!"; 
    }
    // todo: define primordial_mandate (MP cost, basically just grants bloodlust status)
    // todo: define dark_star (high MP cost for big damage)

    theGodChar.runAI = function (combat, role) {
        console.log("reached The God runAI fn... have fn!");
        if (role) {
            if (role === "enemy") {
                var chosenAbility = undefined;
                var chosenTarget = this.characters["mole"];

                var playerParty = [];
                for (let playerCharacter of combat.playerParty) {
                    playerParty.push(this.characters[playerCharacter.id]);
                    console.log("attempting to add character with id " + playerCharacter.id);
                    console.log("added " + this.characters[playerCharacter.id].name + " to playerParty");
                }
                // playerParty[0] = this.characters["mole"]; // draw out the PLayer from Characters dictionary to see if that makes a difference in UI showing damage from Puck abls UPDATE: yup, that did it for some reason.
                var enemyParty = [];
                for (let enemyCharacter of combat.enemyParty) {
                    enemyParty.push(this.characters[enemyCharacter.id]);
                }

                // outliers and statistical points of interest
                var playerLeastDefense = this.characters["mole"];
                var playerLeastHP = this.characters["mole"];
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
                        // being severely injured, The God now starts to spam Dark Star if no earlier behaviors were proced
                        chosenAbility = this.spells["dark_star"];
                        chosenTarget = playerParty;
                    }
                } // end if abl and target are not yet chosen, landing us in defaults
                /// end defaults block ///

                // normalize input chosen targets to array form
                var targets = undefined;
                if (chosenAbility.targetType === window.Ability.TargetTypesEnum.allEnemies) {
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
    }//end The God AI def
}
export {MootyWortRpgMech};