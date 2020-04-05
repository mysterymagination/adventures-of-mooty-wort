import * as Alchemy from "./alchemy.js";

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
		allAllies: 4
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
        this.addUniqueStatusEffect(targetChar, poisonStatusEffect);

        // MP cost
        this.processCost(sourceChar);
    }
	generateFlavorText(sourceChar, targetChar) {
        return "Not many realize that moles are venomous, because, being peaceful and lovey creatures, they so often choose not to employ it.  Most are willing even to risk death rather than risk becoming a killer, and thus will not use venom when fighting back against predators and similar common foebeasts.  When the sanctity of The Deepness is threatened and the ancient things from dark corners of mole memory stir, however...  In a flash and with a violent violet flourish, you flick out your veneom spurs and bury them deeply in the flesh of " + targetChar.name;
    }
}

    