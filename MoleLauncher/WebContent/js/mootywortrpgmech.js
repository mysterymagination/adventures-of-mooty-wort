// imports
import MoleUndum from '../lib/libifels_undum.js';

/*
 * todo: Add Lunar inspired telegraph hint (1:many, but not all) and induction (many similar:1) systems:
 * 1. (hint) "The grue sharpens its claws in a sliver of moonlight" -> he might use Quicksilver Cut, Shadow Slash, or Rake.
 * 2. (induction) "Crystalline shadow swirls around the grue", "Jagged amethyst thrusts through the grue's flesh, flashing in the firelight", and "Frost and stone come together to form a complicated lattice structure around the grue, which pulses ominously" -> these all mean that he's about to use Diamond Dust.
 * 
 * I love the Lunar 1:1 situation where one animation always indicates one ability, but a little uncertainty and/or complexity could really add to it.  Probably best place to shove this system into our current combat model would be at the top of a new round, after the Ai has decided what it's doing and before we process player input such that player can see the telegraph text before choosing their action.
 */

/**
 * Class responsible for defining the RPG mechanics of the Mooty Wort adventure
 */
class MootyWortRpgMech {
	
	constructor() {
	// instantiate library
	var lib = new MoleUndum();
	this.characters = {
	        "mole": new MoleUndum.MoleCharacter({ id: "mole", name: "Mooty Wort" }),
	        "yawning_god": new Character({ id: "yawning_god", name: "The Yawning God" }),
	        "grue": new Character({ id: "grue", name: "Grue" })
	}
	// establish Player party
    this.party = [this.characters["mole"]];
	
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
    
    
    var grueChar = this.characters["grue"];
    grueChar.gender = "male";
    grueChar.stats["maxHP"] = 250;
    grueChar.stats["maxMP"] = 500;
    grueChar.stats["hp"] = grueChar.stats["maxHP"];
    grueChar.stats["mp"] = grueChar.stats["maxMP"];
    grueChar.stats["atk"] = 75;
    grueChar.stats["def"] = 100;
    grueChar.stats["pwr"] = 100;
    grueChar.stats["res"] = 25;
    grueChar.entity = new lib.Entity({ name: "Heart of Darkness" });
    
    /**
    Touch of the Void deals moderate HP and MP damage if the target has any MP remaining, and the MP is absorbed by Grue. Else, it deals heavy HP damage.  Only usable once every 3-5 turns, and there's a tell in the log when it recharges.
    */
    var touchVoidSpell = new lib.Spell({ id: "touch_of_the_void", name: "Touch of the Void" });
    touchVoidSpell.targetType = lib.Ability.TargetTypesEnum.singleEnemy;
    touchVoidSpell.cost = { "mp": 0, "hp": 15 };
    /**
     * Calculate the damage to HP or MP to the given target character
     * @param sourceChar the source of the spell
     * @param targetChar the target of the spell
     * @param isMagic true if we're calculating the magical aspect of this spell's damage, false otherwise
     */
    touchVoidSpell.calcDmg = function (sourceChar, targetChar, isMagic) {
    	let aspectDamage = 0.0;
    	if(isMagic) {
    		aspectDamage = sourceChar.attributes["pwr"] - 0.5 * targetChar.stats["res"];
    	} else {
    		aspectDamage = sourceChar.stats["atk"] - 0.5 * targetChar.stats["def"];
    	}
    	return aspectDamage;
    }
    touchVoidSpell.effect = function (sourceChar, targetChar) {
        if(targetChar.stats["mp"] > 0) {
        	// target has MP to steal so apply damage to HP and MP, and source's MP is healed
        	this.dmg = this.calcDmg(sourceChar, targetChar, true);
            targetChar.stats["mp"] -= this.dmg;
            sourceChar.stats["mp"] += this.dmg;
            this.dmg = this.calcDmg(sourceChar, targetChar, false);
            targetChar.stats["hp"] -= this.dmg;
        } else {
        	// apply double damage to target HP, no one is healed
        	this.dmg = this.calcDmg(sourceChar, targetChar, false);
            targetChar.stats["hp"] -= 2 * this.dmg;
        }

        // MP cost
        this.processCost(sourceChar);
    }
    touchVoidSpell.generateFlavorText = function (sourceChar, targetChar) {
        return "Somehow the darkness near your rump becomes material and seizes you!  Cold infects your being as all the warmth and joy of life bleeds away, slaking the implacable thirst of Darkness.";
    
    /**
     * Insatiable Consumption is an instant kill if the mole is below 50% HP and otherwise drops him to 50% HP
     */
    var consumeSpell = new lib.Spell({ id: "consume", name: "Insatiable Consumption" });
    consumeSpell.targetType = lib.Ability.TargetTypesEnum.singleEnemy;
    consumeSpell.cost = { "mp": 25 };
    consumeSpell.effect = function (sourceChar, targetChar) {
        let currentHP = targetChar.stats["hp"];
        let maxHP = targetChar.stats["maxHP"]
    	if(currentHP < 0.5 * maxHP) {
    		targetChar.stats["hp"] = 0;
    	} else {
    		targetChar.stats["hp"] = maxHP * 0.5;
    	}

        // MP cost
        this.processCost(sourceChar);
    }
    consumeSpell.generateFlavorText = function (sourceChar, targetChar) {
        return "A thunderclap of malevolent intent momentarily deafens you; in the midst of that silence, when the wave of emptiness in your surroundings seems to reach its peak, a lightning flash of fangs manifests out of nothing in a rictus grin.  Jaws spreading wide, it chomps down and attempts to swallow you whole!  "+(targetChar["hp"] <= 0 ? "Your bloodsoaked fur helps ease your way on in and down, and in an instant the champion of Deepness is consumed." : "Your bulk and mighty constitution prevent you from sliding down the creature's gullet, but the fangs are still able to tear into your flesh."); 
    }
    
    /**
     * Brass Lantern uses the target's raw magic power to deal damage to it, ignoring defense.  
     * It then doubles target's magic power such that subsequent hits will be worse.   
     */
    var brassLanternSpell = new lib.Spell({ id: "brass_lantern", name: "Brass Lantern" });
    brassLanternSpell.targetType = lib.Ability.TargetTypesEnum.singleEnemy;
    brassLanternSpell.cost = { "mp": 10 };
    brassLanternSpell.effect = function (sourceChar, targetChar) {
    	
    	// deal damage equal to current mag pwr
        targetChar["hp"] -= targetChar["pwr"];
        // increase mag pwr as the mystic inferno infuses target's soul
        targetChar["pwr"] *= 2;
        	
        // MP cost
        this.processCost(sourceChar);
    }
    brassLanternSpell.generateFlavorText = function (sourceChar, targetChar) {
        return "A fierce gold light burns its way out of the darkness, revealing a small brass lantern.  Inside, a flame flickers violently, tauntingly, before flaring into a raging inferno that rolls over you like a blanket of elemental destruction!  You can feel thoughts and emotions swirl in your mind as you burn, dreams flitting past your mind's eye and feeding the conflagration.  "+(targetChar["hp"] > 0 ? "As the flames roll over you, through the crippling agony you feel a resonant power welling up ever higher..." : ""); 
    }
    
    /**
     * Chill of the Beyond deals minor cold damage and freezes the target 
     */
    var chillBeyondSpell = new lib.Spell({ id: "chill_beyond", name: "Chill of the Beyond" });
    chillBeyondSpell.targetType = lib.Ability.TargetTypesEnum.allEnemies;
    chillBeyondSpell.cost = { "mp": 50 };
    chillBeyondSpell.calcDmg = function (sourceChar, targetChar) {
    	return sourceChar.stats["pwr"] 
        	   - 0.5 * targetChar.stats["res"];
    }
    chillBeyondSpell.effect = function (sourceChar, targetChar) {
    	
    	// apply damage to target
    	this.dmg = this.calcDmg(sourceChar, targetChar);
    	targetChar.stats["hp"] -= this.dmg;
        
    	// apply Freeze status
    	lib.addUniqueStatusEffect(targetChar, freezeStatusEffect);

        // MP cost
        this.processCost(sourceChar);
    }
    chillBeyondSpell.generateFlavorText = function (sourceChar, targetChar) {
        return "While the darkness in your beloved Deepness gets warmer as it closes in thanks to the proximity to magma, the darkness of the infinite Void beyond all worlds is a place of unfathomable cold.  With all the gentleness and decorum of a voratious graveworm, this alien darkness wriggles into the comforting blanket of blackness surrounding you.  Its inception robs your world of warmth entirely and in an instant you are frozen solid!  Refracted through the glacial translucence is a rictus grin bursting with fangs..."; 
    }
    
    // todo: these flavor texts really need some random variations to keep things interesting

    grueChar.runAI = function (combat, role) {
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
    
    var theYawningGodChar = this.characters["yawning_god"];
    theYawningGodChar.gender = "male";
    theYawningGodChar.stats["maxHP"] = 500;
    theYawningGodChar.stats["maxMP"] = 100;
    theYawningGodChar.stats["hp"] = theYawningGodChar.stats["maxHP"];
    theYawningGodChar.stats["mp"] = theYawningGodChar.stats["maxMP"];
    theYawningGodChar.stats["atk"] = 100;
    theYawningGodChar.stats["def"] = 50;
    theYawningGodChar.stats["pwr"] = 100;
    theYawningGodChar.stats["res"] = 50;
    theYawningGodChar.entity = new this.Entity({ name: "Eldritch Horror" });
    
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
    // define pestilence spell (mid MP cost for low damage and poison status)
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
    // define primordial_mandate (MP cost, basically just grants bloodlust status)
    /**
    Primordial Mandate grants the Bloodlust status to the target
    */
    var primordialMandateSpell = new lib.Spell({ id: "primordial_mandate", name: "Primordial Mandate" });
    primordialMandateSpell.targetType = lib.Ability.TargetTypesEnum.singleAlly;
    primordialMandateSpell.cost = { "mp": 15 };
    primordialMandateSpell.effect = function (sourceChar, targetChar) {
        // bloodlust on target
        lib.addUniqueStatusEffect(targetChar, bloodlustStatusEffect);
        	
        // MP cost
        this.processCost(sourceChar);
    }
    primordialMandateSpell.generateFlavorText = function (sourceChar, targetChar) {
        return "The God thrusts his tentacles into the earth and the ground begins to quake.  A deep rumble like the visceral warning growl of an intractable force of nature resonates with your spirit, awakening atavistic awe.  Auras of pulsing magma and wild verdancy course up and down The God's flesh in a violently unstoppable current, infusing every fiber of his being with all the might of this world!  The eyes of The God roll wildly, as if even the boundaries of his conception of all realities is being harshly tested by overwhelming new horizons."; 
    }
    // define dark_star (high MP cost for big damage)
    /**
    Dark Star deals massive non-elemental damage to all enemies
    */
    var darkStarSpell = new lib.Spell({ id: "dark_star", name: "Dark Star" });
    darkStarSpell.targetType = lib.Ability.TargetTypesEnum.allEnemies;
    darkStarSpell.cost = { "mp": 25 };
    darkStarSpell.calcDmg = function (sourceChar, targetChar) {
    	return 2 * sourceChar.stats["pwr"] 
        	   - 0.5 * targetChar.stats["res"];
    }
    darkStarSpell.effect = function (sourceChar, targetChars) {
    	for(let index = 0; index < targetChars.length; index++) {
        	// apply damage to target
        	this.dmg = this.calcDmg(sourceChar, targetChars[index]);
        	targetChars[index].stats["hp"] -= this.dmg;
        }

        // MP cost
        this.processCost(sourceChar);
    }
    darkStarSpell.generateFlavorText = function (sourceChar, targetChar) {
        return "The burning chill of moonless midnight wrapped in Lady Winter's empty embrace casts a pall of hoarfrost over your fur as the light drains out of the world.  When all is naught but silence and dark, a muted gray pinprick of light appears before you; an offering of hope.  Unable to help yourself, you reach out to it -- the very instant you give over the focus of your mind to its power, it explodes into a blinding nova whose insatiable devouring flames crawl into and over every atom of your being!"; 
    }

    theYawningGodChar.runAI = function (combat, role) {
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
    }//end The God AI def
    }
}
export {MootyWortRpgMech};