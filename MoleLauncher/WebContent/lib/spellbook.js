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
 * Shuffling his little paws rapidly, the mole generates a bolt of static electricity; the density of his fur is quite shocking!  This deal light electric damage and also inflicts Stun.
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
    