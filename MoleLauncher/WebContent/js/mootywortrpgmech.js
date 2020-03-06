// imports
import Libifels from '../lib/libifels.js';

function MootWortRpgMech() {
	// instantiate library
	var lib = new Libifels();
	this.characters = {
	        "mole": new Player({ id: "mole", name: "Mooty Wort" }),
	        "thegod": new Character({ id: "thegod", name: "The God" }),
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
    Doubt halves a character's attributes that are driven by presence and self-confidence: STR and CHA.
    */
    var doubtStatusEffect = this.statusEffectsDict["doubt"];
    doubtStatusEffect.isBuff = false;
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

    // public spells

    // from Splinter of Serpentarius
    /**
    Debilitate lowers all defensive attributes of the target, and inflicts currHp*0.1 dmg
    */
    var debilitate = lib.spellsDict["debilitate"];
    debilitate.targetType = lib.Ability.TargetTypesEnum.singleEnemy;
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
    var pierceSpell = lib.spellsDict["pierce"];
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

    var toxinSpell = lib.spellsDict["toxin"];
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
    var shadowFormSpell = lib.spellsDict["shadowform"];
    shadowFormSpell.targetType = window.Ability.TargetTypesEnum.allAllies; // actually self-only, but this will have the same effect in the UI
    shadowFormSpell.cost = { "mp": 30 };
    shadowFormSpell.effect = function (sourceChar, targetChar) {
        lib.addUniqueStatusEffect(sourceChar, shadowStatusEffect);

        // MP cost
        this.processCost(sourceChar);
    }
    shadowFormSpell.generateFlavorText = function (sourceChar, targetChar) {
        return "Shadows dance free of their source lights, and embrace " + sourceChar.name + " warmly.  Velvet darkness spreads over " + sourceChar.getPronoun_gen() + " body, and " + sourceChar.getPronoun_nom() + " relaxes into oneness with the infinite possibilities of undefinition; " + sourceChar.getPronoun_nom() + " seems almost ethereal now.";
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
    Savage Sympathy deals more damage the greater the difference between the wielder and the target's ATK, and heals the wielder
    */
    var savageSympathySpell = lib.spellsDict["savage_sympathy"];
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

    var puckChar = lib.characters["puck"];
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
    puckChar.entity = new this.Entity({ name: "Vicious Mockery" });
    var rapierWit = new this.Spell({ id: "rapier_wit", name: "Rapier Wit" });
    rapierWit.cost = { "mp": 15 };
    rapierWit.generateFlavorText = function (sourceChar, targetChar) {
        if (targetChar) {
            // todo: randomly selected insults based on descriptor tags

            var percentage = this.rollPercentage();
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
    rapierWit.targetType = this.Ability.TargetTypesEnum.singleEnemy;
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

    var rainOfRadiance = new this.Spell({ id: "rain_of_radiance", name: "Rain of Radiance" });
    rainOfRadiance.cost = { "mp": 50 };
    rainOfRadiance.generateFlavorText = function (sourceChar, targetChars) {
        return sourceChar.name + " thrusts a hand towards the heavens, muscles quivering with equal parts strain and anticipation.  The first few glittering droplets of liquid blue-white starlight are beautiful, but their virtue is quickly eclipsed by a tide of agony that grips the entire party as their flesh/fur is scorched/singed by celestial fire!  " + this.dmg + " horrifically burning damages to the whole party!";
    }
    rainOfRadiance.targetType = this.Ability.TargetTypesEnum.allEnemies;
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
}
export {MootyWortRpgMech};