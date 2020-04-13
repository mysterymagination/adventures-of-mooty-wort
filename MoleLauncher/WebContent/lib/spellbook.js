import * as Alchemy from "./alchemy.js";
import * as Lib from "./libifels_undum.js"
/**
 * Class representing a capability of a character, e.g. attacking or casting a
 * spell. It takes a config object literal of the form
 * {id:"my_id",name:"my_name"}
 */
export class Ability {
	constructor(configObj) {
		this.id = configObj.id;
		this.name = configObj.name;

		// metadata about who the ability targets, namely you, all allies,
		// one enemy, or all enemies.
		this.targetType = window.Ability.TargetTypesEnum.singleEnemy;

		/**
		 * The friendly property describes whether an ability is considered
		 * hostile or beneficial to its target
		 */
		this.friendly = false;

		// cached value of last calculated dmg
		this.dmg = 0;

		/**
		 * The cost of using using the ability to the user. It is given as
		 * an object map with keys that correspond to mutable resource stats
		 * associated with integer values. The given value should be
		 * subtracted from the corresponding stat resource pool.
		 */
		this.cost = { "mp": 0 };

		// effect can be defined when Ability instance is defined, but usual
		// behavior will generally be target character's HP reduced by
		// calcDmg(). Default behavior will be to simply log a noop like the
		// other default functions
		this.effect = function (sourceChar, targetChar) { console.log("no effect from " + this.name) };
		this.calcDC = function (user, modifyingAttr) {
			return 10;
		}// end calcDC()
		// lambda stub - dmg formula will be defined when Ability instance
		// is defined
		this.calcDmg = function (sourceChar, targetChar) { console.log("no dmg from " + this.name) }
		this.generateFlavorText = function (sourceChar, targetChar) { console.log("flavor text undefined for " + this.name) }
		function processCost(character) {
			for (let statCost in this.cost) {
				character.stats[statCost] -= this.cost[statCost];
			}
		}
		function printCost() {
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
	}// end new instance ctor
}
Ability.TargetTypesEnum = Object.freeze(
	{
		singleEnemy: 1,
		allEnemies: 2,
		singleAlly: 3,
		allAllies: 4,
		personal: 5
	}
)
export class Spell extends Ability {
	constructor(configObj) {
		super(configObj);
	}
}
/**
 * Mole Venom inflicts mild magic damage and poisons the target
 */
export class MoleVenom extends Spell {
	// anything in the constructor is part of your object instance
	constructor() {
		super({id:"mole_venom", name: "Mole Venom"});
		// these fields are meant to be identical across all instances of Mole Venom,
		// so stick 'em on the prototype
		MoleVenom.prototype.targetType = Ability.TargetTypesEnum.singleEnemy;
		MoleVenom.prototype.cost = { "mp": 15 };
	}
	// methods are placed on the object prototype and shared between all instances
	calcDmg(sourceChar, targetChar) {
        return Math.max(sourceChar.stats["pwr"] - targetChar.stats["res"], 1);
    }
	effect(sourceChar, targetChar) {
        this.dmg = this.calcDmg(sourceChar, targetChar);
        targetChar.stats["hp"] -= this.dmg;
        // mix up our poison...
        var poisonStatusEffect = new Alchemy.Poison();
        poisonStatusEffect.psnDmg = sourceChar.stats["pwr"] * 0.5;
        Lib.addUniqueStatusEffect(targetChar, poisonStatusEffect);

        // MP cost
        this.processCost(sourceChar);
    }
	generateFlavorText(sourceChar, targetChar) {
        return "Not many realize that moles are venomous, because, being peaceful and lovey creatures, they so often choose not to employ it.  Most are willing even to risk death rather than risk becoming a killer, and thus will not use venom when fighting back against predators and similar common foebeasts.  When the sanctity of The Deepness is threatened and the ancient things from dark corners of mole memory stir, however... it is a time to kill.  In a flash and with a violent violet flourish, you flick out your veneom spurs and bury them deeply in the flesh of " + targetChar.name;
    }
}

/**
Warmest hug heals self (or self and other) with ATK; if healing a target other than self, the healing is divided by 2 amongst each party.
*/
export class WarmestHug extends Spell {
	constructor() {
		super({id: "warmest_hug", name: "Warmest Hug"});
		WarmestHug.prototype.targetType = Ability.TargetTypesEnum.singleAlly;
		WarmestHug.prototype.cost = { "mp": 20 };
	}
	calcDmg(sourceChar, targetChar) {
	    return sourceChar.stats["atk"];
	}
	effect(sourceChar, targetChar) {
	    this.dmg = this.calcDmg(sourceChar, targetChar);
	    if(sourceChar === targetChar) {
	    	sourceChar.stats["hp"] += this.dmg;
	    } else {
	    	targetChar.stats["hp"] += this.dmg * 0.5;
	    	sourceChar.stats["hp"] += this.dmg * 0.5;
	    }

	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return sourceChar.name + " embraces " + sourceChar.getPronoun_gen() + " friend " + targetChar.name + " fondly, a soft golden glow surrounding them.  The glow heals " + targetChar.name + " of " + this.dmg + " damage total.";
	}
}

/**
Woolly Shield raises target's DEF by wielder's RES+DEF
*/
export class WoollyShield extends Spell {
	constructor() {
		super({id: "woolly_shield", name: "Woolly Shield"});
		WoollyShield.prototype.targetType = Ability.TargetTypesEnum.singleAlly;
		WoollyShield.prototype.cost = { "mp": 30 };
	}
	calcDmg(sourceChar, targetChar) {
	    return sourceChar.stats["def"] + sourceChar.stats["res"];
	}
	effect(sourceChar, targetChar) {
	    this.dmg = this.calcDmg(sourceChar, targetChar);
	    targetChar.stats["def"] += this.dmg;

	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return sourceChar.name + " puffs out " + sourceChar.getPronoun_gen() + " hair, approximating thick wool as best " + sourceChar.getPronoun_nom() + " can, and jumps in front of " + targetChar.name + ", intent on protecting " + targetChar.getPronoun_obj() + " with " + sourceChar.getPronoun_gen() + " woolly life!";
	}
}

/**
 * With a fuzzily furrowed brow, the mole grants himself the Temper status
 */
export class BurrowFurrow extends Spell {
	constructor() {
		super({ id: "burrow_furrow", name: "Burrow Furrowed Brow" });
		BurrowFurrow.prototype.targetType = Ability.TargetTypesEnum.personal;
		BurrowFurrow.prototype.cost = { "mp": 10 };
	}
	effect(sourceChar) {
		Lib.addUniqueStatusEffect(sourceChar, new Alchemy.Temper());

	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return sourceChar.name + " furrows " + sourceChar.getPronoun_gen() + " fuzzy brow in concentration, and resolutely resolves to go all out against all " + sourceChar.getPronoun_gen() + "foebeasts!";
	}
}

/**
 * By considering the complexities of The Deepness, the mole is able to grant himself Third Eye status
 */
export class DeepMeditation extends Spell {
	constructor() {
		super({ id: "deep_meditation", name: "Meditation Upon The Deepness" });
		DeepMeditation.prototype.targetType = Ability.TargetTypesEnum.personal;
		DeepMeditation.prototype.cost = { "mp": 25 };
	}
	effect(sourceChar) {
		Lib.addUniqueStatusEffect(sourceChar, new Alchemy.ThirdEye());

	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return sourceChar.name + " takes a moment to separate " + sourceChar.getPronoun_gen() + " consciousness from the chaotic here and now, meditating upon the unknowable complexities of The Deepness. As " + sourceChar.getPronoun_nom() + " does so, the fuzzy flesh of " + sourceChar.getPronoun_gen() + " forehead tears and through a fine veil of blood there appears a mystical third eye!";
	}
}
// todo: mod the mole's basic attack abl to restore 10% MP
/**
 * Calling upon all the wisdom of his forebears, who were moles of course and not bears, the mole lashes out with an evocation of fiery darkness from The Pit's shapely bottom!  High cost spell that deals moderate fire damage based on the mole's pwr and lowers the target's res.
 */
export class ShadowFlare extends Spell {
	constructor() {
		super({ id: "shadowflare", name: "Shadowflare" });
		ShadowFlare.prototype.targetType = Ability.TargetTypesEnum.singleEnemy;
		ShadowFlare.prototype.cost = { "mp": 50 };
	}
	calcDmg(sourceChar, targetChar) {
	    return 2 * sourceChar.stats["pwr"];
	}
	effect(sourceChar, targetChar) {
	    this.dmg = this.calcDmg(sourceChar, targetChar);
	    targetChar.stats["hp"] -= this.dmg;
	    targetChar.stats["res"] -= 10;

	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return "Calling upon all the wisdom of his forebears, who were moles of course and not bears, the mole lashes out with an evocation of fiery darkness from The Pit's shapely bottom!  The subtle conflagration is so overwhelming that "+targetChar.name+"'s very meta-magical field crumbles slightly, unraveling the threads of "+targetChar.getPronoun_obj()+" existance.";
	}
}
/**
 * Thrusting his mighty digging claw into the earth and calling out for aid with all his spirit, the mole summons up a wash of magma from the planet's molten core to engulf his foe.  This spell light fire damage based on mole's pwr and burns the target.
 */
export class MagmaBlast extends Spell {
	constructor() {
		super({ id: "magma_blast", name: "Magma Blast" });
		MagmaBlast.prototype.targetType = Ability.TargetTypesEnum.singleEnemy;
		MagmaBlast.prototype.cost = { "mp": 25 };
	}
	calcDmg(sourceChar, targetChar) {
	    return sourceChar.stats["pwr"];
	}
	effect(sourceChar, targetChar) {
	    this.dmg = this.calcDmg(sourceChar, targetChar);
	    targetChar.stats["hp"] -= this.dmg;
	    var burnEffect = new Alchemy.Burn();
	    burnEffect.brnDmg = this.dmg * 0.5;
	    Lib.addUniqueStatusEffect(targetChar, burnEffect);

	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return "Thrusting his mighty digging claw into the earth and calling out for aid with all his spirit, the mole summons up a wash of magma from the planet's molten core to engulf his foe!";
	}
}
/**
 * Shuffling his little paws rapidly, the mole generates a bolt of static electricity; the density of his fur is quite shocking!  This deals light electric damage and also inflicts Stun.
 */
export class StaticBolt extends Spell {
	constructor() {
		super({ id: "static_bolt", name: "Static Bolt" });
		StaticBolt.prototype.targetType = Ability.TargetTypesEnum.singleEnemy;
		StaticBolt.prototype.cost = { "mp": 30 };
	}
	calcDmg(sourceChar, targetChar) {
	    return sourceChar.stats["pwr"];
	}
	effect(sourceChar, targetChar) {
	    this.dmg = this.calcDmg(sourceChar, targetChar);
	    targetChar.stats["hp"] -= this.dmg;
	    Lib.addUniqueStatusEffect(targetChar, new Alchemy.Stun());

	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return "Shuffling his little paws rapidly, the mole generates a bolt of static electricity; the density of his fur is quite shocking!  With a righteous squeak, he hurls at "+targetChar.name+", disrupting "+targetChar.getPronoun_gen()+" systems with wild current.";
	}
}

/// begin Grue abilities block ///
/**
 * Touch of the Void deals moderate HP and MP damage if the target has any MP remaining, and the MP is absorbed by Grue. Else, it deals heavy HP damage.  Only usable once every 3-5 turns, and there's a tell in the log when it recharges.
 */
export class TouchVoid extends Spell {
	constructor() {
		super({ id: "touch_of_the_void", name: "Touch of the Void" });
		TouchVoid.prototype.targetType = Ability.TargetTypesEnum.singleEnemy;
		TouchVoid.prototype.cost = { "mp": 0, "hp": 15 };
	}
	/**
	 * Calculate the damage to HP or MP to the given target character
	 * @param sourceChar the source of the spell
	 * @param targetChar the target of the spell
	 * @param isMagic true if we're calculating the magical aspect of this spell's damage, false otherwise
	 */
	calcDmg(sourceChar, targetChar, isMagic) {
		var aspectDamage = 0.0;
		if(isMagic) {
			aspectDamage = sourceChar.attributes["pwr"] - 0.5 * targetChar.stats["res"];
		} else {
			aspectDamage = sourceChar.stats["atk"] - 0.5 * targetChar.stats["def"];
		}
		return aspectDamage;
	}
	effect(sourceChar, targetChar) {
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
	generateFlavorText(sourceChar, targetChar) {
	    return "Somehow the darkness near your rump becomes material and seizes you!  Cold infects your being as all the warmth and joy of life bleeds away, slaking the implacable thirst of Darkness.";
	}
}

/**
 * Insatiable Consumption is an instant kill if the mole is below 50% HP and otherwise drops him to 50% HP
 */
export class Consume extends Spell {
	constructor() {
		super({ id: "consume", name: "Insatiable Consumption" });
		Consume.prototype.targetType = Ability.TargetTypesEnum.singleEnemy;
		Consume.prototype.cost = { "mp": 25 };
	}
	effect(sourceChar, targetChar) {
	    var currentHP = targetChar.stats["hp"];
	    var maxHP = targetChar.stats["maxHP"]
		if(currentHP <= 0.5 * maxHP) {
			targetChar.stats["hp"] = 0;
		} else {
			targetChar.stats["hp"] = maxHP * 0.5;
		}

	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return "A thunderclap of malevolent intent momentarily deafens you; in the midst of that silence, when the wave of emptiness in your surroundings seems to reach its peak, a lightning flash of fangs manifests out of nothing in a rictus grin.  Jaws spreading wide, it chomps down and attempts to swallow you whole!  "+(targetChar["hp"] <= 0 ? "Your bloodsoaked fur helps ease your way on in and down, and in an instant the champion of Deepness is consumed." : "Your bulk and mighty constitution prevent you from sliding down the creature's gullet, but the fangs are still able to tear into your flesh."); 
	}
}

/**
 * Brass Lantern uses the target's raw magic power to deal damage to it, ignoring defense.  
 * It then doubles target's magic power such that subsequent hits will be worse.   
 */
export class BrassLantern extends Spell {
	constructor() {
		super({ id: "brass_lantern", name: "Brass Lantern" });
		BrassLantern.prototype.targetType = lib.Ability.TargetTypesEnum.singleEnemy;
		BrassLantern.prototype.cost = { "mp": 10 };
	}
	effect(sourceChar, targetChar) {
		
		// deal damage equal to current mag pwr
	    targetChar["hp"] -= targetChar["pwr"];
	    // increase mag pwr as the mystic inferno infuses target's soul
	    targetChar["pwr"] *= 2;
	    	
	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return "A fierce gold light burns its way out of the darkness, revealing a small brass lantern.  Inside, a flame flickers violently, tauntingly, before flaring into a raging inferno that rolls over you like a blanket of elemental destruction!  You can feel thoughts and emotions swirl in your mind as you burn, dreams flitting past your mind's eye and feeding the conflagration.  "+(targetChar["hp"] > 0 ? "As the flames roll over you, through the crippling agony you feel a resonant power welling up ever higher..." : ""); 
	}
}

/**
 * Chill of the Beyond deals minor cold damage and freezes the target 
 */
export class ChillBeyond extends Spell {
	constructor() {
		super({ id: "chill_beyond", name: "Chill of the Beyond" });
		ChillBeyond.prototype.targetType = Ability.TargetTypesEnum.allEnemies;
		ChillBeyond.prototype.cost = { "mp": 50 };
	}
	calcDmg(sourceChar, targetChar) {
		return sourceChar.stats["pwr"] 
	    	   - 0.5 * targetChar.stats["res"];
	}
	effect(sourceChar, targetChar) {
		
		// apply damage to target
		this.dmg = this.calcDmg(sourceChar, targetChar);
		targetChar.stats["hp"] -= this.dmg;
	    
		// apply Freeze status
		Lib.addUniqueStatusEffect(targetChar, freezeStatusEffect);

	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return "While the darkness in your beloved Deepness gets warmer as it closes in thanks to the proximity to magma, the darkness of the infinite Void beyond all worlds is a place of unfathomable cold.  With all the gentleness and decorum of a voratious graveworm, this alien darkness wriggles into the comforting blanket of blackness surrounding you.  Its inception robs your world of warmth entirely and in an instant you are frozen solid!  Refracted through the glacial translucence is a rictus grin bursting with fangs..."; 
	}
}
/// end Grue abilities block ///

/// begin Yawning God abilities block ///
/**
 * Manyfold Embrace damages the user slightly but combines their ATK and PWR to generate massive damage to the enemy
 */
export class ManyFoldEmbrace extends Spell {
	constructor() {
		super({ id: "manyfold_embrace", name: "Manyfold Embrace" });
		ManyFoldEmbrace.prototype.targetType = Ability.TargetTypesEnum.singleEnemy;
		ManyFoldEmbrace.prototype.cost = { "mp": 20 };
		// default this instance's cost to the common element
		this.cost = Object.assign(this.cost, ManyFoldEmbrace.prototype.cost);
	}
	calcDmg(sourceChar, targetChar) {
	    // idea is the source is transforming tentacles into mighty spiked cudgels
		// using magic and then buffeting the target with them
		return 1.5 * (sourceChar.stats["atk"] + sourceChar.attributes["pwr"]) 
	    	   - 0.5 * targetChar.stats["def"];
	}
	effect(sourceChar, targetChar) {
	    this.dmg = this.calcDmg(sourceChar, targetChar);
	    // now that we have calc'd damage, we can determine the rest of the cost
	    this.cost["hp"] = this.dmg * 0.5;
	    console.log(this.cost);
	    targetChar.stats["hp"] -= this.dmg;

	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return "An oily blackness like the surface of an unfathomable lake on a moonless night oozes over The God's spongy fishbelly-white flesh, and in a blinding flash of electric purple a series of serrated spikes have materialized in its wake!  With all the looming inevitability of death itself, he descends upon "+targetChar.name+" and wraps  his innumerable tentacles about "+targetChar.getPronoun_obj()+" in a crushing embrace."; 
	}
}

/**
 * Pestilence moderately damages all enemies and has 50% to poison each
 */
export class Pestilence extends Spell {
	constructor() {
		super({ id: "pestilence", name: "Pestilence" });
		Pestilence.prototype.targetType = Ability.TargetTypesEnum.allEnemies;
		Pestilence.prototype.cost = { "mp": 50 };
	}
	calcDmg(sourceChar, targetChar) {
		return sourceChar.attributes["pwr"] - 0.5 * targetChar.stats["res"];
	}
	effect(sourceChar, targetChars) {
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
	generateFlavorText(sourceChar, targetChar) {
	    return "With a tortured wailing wheeze, The God draws in a mighty breath; the resulting vortex whipping the parties hair and fur and whiskers into a frazzled chaos that seems to sustain him.  When the hurricane winds calm at last, silence reigns for a moment before a deafening roar quashes the quiet out of existence: plumes of putrescent purple and bruised black smoke snake their way out of The God's maw, their very presence infecting the air with malice, and encompass everyone in choking fog!"; 
	}
}

/**
 * Primordial Mandate grants the Bloodlust status to the target
 */
export class PrimordialMandate extends Spell {
	constructor() {
		super({ id: "primordial_mandate", name: "Primordial Mandate" });
		PrimordialMandate.prototype.targetType = Ability.TargetTypesEnum.singleAlly;
		PrimordialMandate.prototype.cost = { "mp": 15 };
	}
	effect(sourceChar, targetChar) {
	    // bloodlust on target
	    lib.addUniqueStatusEffect(targetChar, bloodlustStatusEffect);
	    	
	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return "The God thrusts his tentacles into the earth and the ground begins to quake.  A deep rumble like the visceral warning growl of an intractable force of nature resonates with your spirit, awakening atavistic awe.  Auras of pulsing magma and wild verdancy course up and down The God's flesh in a violently unstoppable current, infusing every fiber of his being with all the might of this world!  The eyes of The God roll wildly, as if even the boundaries of his conception of all realities is being harshly tested by overwhelming new horizons."; 
	}
}

/**
 * Dark Star deals massive non-elemental damage to all enemies
 */
export class DarkStar extends Spell {
	constructor() {
		super({ id: "dark_star", name: "Dark Star" });
		DarkStar.prototype.targetType = Ability.TargetTypesEnum.allEnemies;
		DarkStar.prototype.cost = { "mp": 25 };
	}
	calcDmg(sourceChar, targetChar) {
		return 2 * sourceChar.stats["pwr"] 
	    	   - 0.5 * targetChar.stats["res"];
	}
	effect(sourceChar, targetChars) {
		for(let index = 0; index < targetChars.length; index++) {
	    	// apply damage to target
	    	this.dmg = this.calcDmg(sourceChar, targetChars[index]);
	    	targetChars[index].stats["hp"] -= this.dmg;
	    }

	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return "The burning chill of moonless midnight wrapped in Lady Winter's empty embrace casts a pall of hoarfrost over your fur as the light drains out of the world.  When all is naught but silence and dark, a muted gray pinprick of light appears before you; an offering of hope.  Unable to help yourself, you reach out to it -- the very instant you give over the focus of your mind to its power, it explodes into a blinding nova whose insatiable devouring flames crawl into and over every atom of your being!"; 
	}
}
/// end yawning god abilities block ///
    