export class Item {
	contructor(configObj) {
		this.id = configObj.id;
		this.name = configObj.name;
		/**
		 * An object literal containing string tags and functional relationship hints to be used by a Puzzlio system, or possibly something as simple as a useOn -> literal expected target name -> behavior fn.  Probably just the simple case for now; puzzlio is sort of an antipattern sort of thing since its notion of arbitrary input -> arbitrary context and solve condition -> arbitrary output possibly using only text and regex is pretty far-fetched and better approached with context-specific simulation (e.g. physics and ray-tracing) of reality and puzzles built around said simulation systems.
		 * e.g. 
		 * A magic mattock's desc might be
		 * {
		 *  "equipment": true,
		 * 	"weight": "heavy",
		 * 	"useOn": [
		 * 				{
		 * 					"*wall *": breakWallFn // for any sort of wall target story object, run breakWallFn()
		 * 				}
		 * 			 ]
		 * }
		 */
		this.descriptor = configObj.descriptor;
	}
}
export class Equipment extends Item {
	constructor(configObj) {
		super(configObj);
	}
	equipEffect(equippedCharacter){
		console.log(this.name+" seems to have no effect when equipped by "+equippedCharacter.name);
	}
	unequipEffect(unequippedCharacter){
		console.log(this.name+" seems to have no effect when unequipped by "+unequippedCharacter.name);
	}
}
/**
 * An equippable Item which may run an effect when striking something
 */
export class Weapon extends Equipment {
	constructor(configObj) {
		super(configObj)
	}
	/**
	 * An effect to be run when striking a target with this weapon
	 * @param attackingCharacter the attacking Character object
	 * @param defendingCharacter the attacked Character object
	 */
	onAttackEffect(attackingCharacter, defendingCharacter){
		console.log("There is no effect other than the usual splitting pain inflicted by "+this.name);
	}
}
/**
 * An equippable Item which may run an effect when stricken by something
 */
export class Armor extends Equipment {
	constructor(configObj) {
		super(configObj)
	}
	/**
	 * An effect to be run when the source character wearing this armor is stricken by the target character
	 * @param attackingCharacter the attacking Character object
	 * @param defendingCharacter the attacked Character object
	 */
	onDefendEffect(attackingCharacter, defendingCharacter){
		console.log(this.name+" refuses to even so much as shout back at "+attackingCharacter.name+", but it does soften "+attackingCharacter.getPronoun_possessive()+" blows a bit... I suppose.");
	}
}
/**
 * A pair of acid-dripping claws acquired from a mighty Ochre Ooze
 */
export class CausticClaws extends Weapon {
	constructor() {
		var configObj = {
			"id": "caustic_claws",
			"name": "Caustic Claws",
			"descriptor": {
				"equipment": {
					"equipEffect": this.equipEffect,
					"unequipEffect": this.unequipEffect,
					"onAttack": this.acidEffect
				}
			}
		}
		super(configObj);
		this.atkBuf = 25;
		this.acidDmg = 0;
	}
	/**
	 * Deals extra acid damage based on the attacker's pwr stat
	 * @param attackingCharacter the attacking Character object
	 * @param defendingCharacter the attacked Character object
	 * @return the number of acid damage dealt
	 */
	onAttackEffect(attackingCharacter, defendingCharacter){
		this.acidDmg = attackingCharacter.stats.pwr * 3;
		defendingCharacter.stats.hp -= this.acidDmg;
		return this.acidDmg;
	} 
	/**
	 * Effect that equipping this item has on the character
	 */
	equipEffect(equippedCharacter){
		equippedCharacter.stats.atk += this.atkBuf;
	}
	/**
	 * Effect that removing this equipped item has on the character
	 */
	unequipEffect(unequippedCharacter){
		unequippedCharacter.stats.atk -= this.atkBuf;
	}
}
export class ItemManager {
	constructor() {
		/**
		 * The item that the player has started using
		 */
		this.activeItem = null;
		/**
		 * Associative mapping of item id strings to corresponding Item objects
		 */
		this.itemsMap = {};
	}
}