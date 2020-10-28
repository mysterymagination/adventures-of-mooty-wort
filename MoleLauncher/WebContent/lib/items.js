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
	/**
	 * Handles using this Item on the target object identified by the given string
	 * @param story the ViewController object for the story
	 * @param targetString string ID of the in-universe object we're using this Item on
	 */
	useOn(story, targetString) {
		// todo: parse descriptor and look for a useOn attr, and then match the input targetString to a regex string key in the useOn array of possible matches. Finally call the relevant functions of this Item that were found mapped to matching regex key strings.
		// todo: gonna need some kind of story ViewController abstraction, unless we don't mind tying this class to Undum; I'm thinking the flow here will be: {determine functions to call -> pass in story -> endpoint specific Item functions modify story state and/or print story text}.  With Undum, that could be something like system.doLink(target situation id) but ideally everyone here in lib that doesn't have Undum in the title should stand alone as libifels for any JS interactive fiction.
	}
}
/**
 * An Item that runs an effect function when it is equipped to a character whose effects stay active until
 * it is unequipped
 */
export class Equipment extends Item {
	constructor(configObj) {
		super(configObj);
	}
	/**
	 * Modifies stats etc. upon equip action
	 */
	equipEffect(equippedCharacter) {
		console.log(this.name+" seems to have no effect when equipped by "+equippedCharacter.name);
	}
	/**
	 * Reverses the stat etc. modification applied by equipEffect()
	 */
	unequipEffect(unequippedCharacter) {
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
	onAttackEffect(attackingCharacter, defendingCharacter) {
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
	onDefendEffect(attackingCharacter, defendingCharacter) {
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
			"descriptor": {}
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
	onAttackEffect(attackingCharacter, defendingCharacter) {
		this.acidDmg = attackingCharacter.stats.pwr * 3;
		defendingCharacter.stats.hp -= this.acidDmg;
		return this.acidDmg;
	} 
	/**
	 * Effect that equipping this item has on the character
	 */
	equipEffect(equippedCharacter) {
		equippedCharacter.stats.atk += this.atkBuf;
	}
	/**
	 * Effect that removing this equipped item has on the character
	 */
	unequipEffect(unequippedCharacter) {
		unequippedCharacter.stats.atk -= this.atkBuf;
	}
}
export class OdditineObol extends Equipment {
	constructor() {
		var configObj = {
			"id": "odditine_obol",
			"name": "Odditine Obol",
			"descriptor": {}
		}
		super(configObj);
		this.resBuf = 2;
	}
	/**
	 * Effect that equipping this item has on the character
	 */
	equipEffect(equippedCharacter) {
		equippedCharacter.stats.res *= this.resBuf;
	}
	/**
	 * Effect that removing this equipped item has on the character
	 */
	unequipEffect(unequippedCharacter) {
		unequippedCharacter.stats.res /= this.resBuf;
	}
}
export class PulsatingFuzz extends Item {
	constructor() {
		var configObj = {
			"id": "pulsating_fuzz",
			"name": "gently_pulsating_fuzz",
			"descriptor": {
				"useOn": [
					{
						"nakedest molerat": this.tickle
					}
				]
			}
		}
		super(configObj);
	}
	/**
	 * Tickle the Nakedest Molerat out of his reverie
	 * @param story the ViewController for the story
	 */
	tickle(story) {
		// todo: communicate the state change of the molerat and/or a text string announcing same
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