export class Item {
	contructor() {
		this.id = null;
		this.name = null;
		/**
		 * An object literal containing string tags and functional relationship hints to be used by a Puzzlio system, or possibly something as simple as a useOn -> literal expected target name -> behavior fn.  Probably just the simple case for now; puzzlio is sort of an antipattern sort of thing since its notion of arbitrary input -> arbitrary context and solve condition -> arbitrary output possibly using only text and regex is pretty far-fetched and better approached with context-specific simulation (e.g. physics and ray-tracing) of reality and puzzles built around said simulation systems.
		 * e.g. 
		 * A magic mattock's desc might be
		 * {
		 *  "equipment": true,
		 * 	"weight": "heavy",
		 * 	"useOn": {
		 * 				"/wall/i": breakWallFn // for any sort of wall target story object, run breakWallFn()
		 * 			 }
		 * 			 
		 * }
		 */
		this.descriptor = null;
	}
	/**
	 * Handles using this Item on the target object identified by the given string
	 * @param story the ViewController object for the story
	 * @param targetString string ID of the in-universe object we're using this Item on
	 */
	useOn(story, targetString) {
		// parse descriptor and look for a useOn attr, and then match the input targetString to a regex string key in the useOn array of possible matches. Finally call the relevant functions of this Item that were found mapped to matching regex key strings.
		if(this.descriptor.useOn) {
			for(const matcherObj of this.descriptor.useOn) {
				for(const [keyRegex, effectFn] of Object.entries(matcherObj)) {
					if(targetString.match(new RegExp(keyRegex, 'i'))) {
						effectFn.call(this, story);
					}
				}
			}
		}
	}
	/**
	 * Print out the item's description 
	 */
	describe(story) {
		story.writeParagraph(this.descriptor.descriptionString);
	}
}
/**
 * An Item that runs an effect function when it is equipped to a character whose effects stay active until
 * it is unequipped
 */
export class Equipment extends Item {
	constructor() {
		super();
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
	constructor() {
		super();
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
	constructor() {
		super();
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
		super();
		this.id = "caustic_claws";
		this.name = "Caustic Claws";
		this.descriptor = {};
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
		super();
		this.id = "odditine_obol";
		this.name = "Odditine Obol";
		this.descriptor = {}
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
/**
 * The PulsatingFuzz serves to distract any creature whose flesh it can reach
 */
export class PulsatingFuzz extends Item {
	constructor() {
		super();
		this.id = "pulsating_fuzz";
		this.name = "Gently Pulsating Fuzz";
		this.descriptor = {
			"useOn": [
				{
					"nakedest.*molerat": this.tickle
				}
			],
			"descriptionString": "This "+this.name+" wiggles enthusiastically in your compartment.  It's a bit jagged, but soft at certain angles; given the hairless nature of your compartment, you have to keep shifting it to avoid being poked or being tickled into a fit of giggles."
		}	
	}
	/**
	 * Tickle the Nakedest Molerat out of his reverie
	 * @param story the ViewController for the story
	 */
	tickle(story) {
		// write item use feedback
		story.writeParagraph("You reach out and wiggle the fuzz playfully over your molerat friend's snoot; he tries to resist an upwelling of mirth that threatens to fracture his zealous persona, but no will can resist the captivating grip of the tickle monster -- as the molerat laughs merrily, hugging his roly-poly belly with his bloody paw stumps, he rolls away from the opal eye.  Beneath it, you can now see a small tunnel filled with an oddly beckoning darkness.  Something inside purrs, its bass rumbling turning from barest whisper to veritably roaring contentment as you draw near.");
		// modify story state to reflect tickled molerat
		story.eventFlags.molerat_tickled = true;
		// add grue hub access to the array of choices the player currently has in the story,
		// to be printed as the specific story paradigm directs
		story.appendChoice("basement2_grue_hub");
	}
}
/**
 * The mighty amethyst LastLash e  be used on the mole to permanently open his third eye, doubling his magical prowess permanently at the cost of the madness that comes of protracted sight beyond the veil.
 */
export class LastLash extends Item {
	constructor() {
		super();
		this.id = "last_lash";
		this.name = "The Last Lash";
		this.descriptor = {
			"useOn": [
				{
					"character": this.partVeil
				},
				{
					"mole": this.partVeil
				},
				{
					"mooty.*wort": this.partVeil
				}
			],
			"descriptionString": this.name+" is a brilliant amethyst eyelash from a gargantuan statue.  The air shimmers around it, and through it you can glimpse undreamt-of alien vistas.  It vibrates with a sort of crystalline anticipation when you bring it anywhere near your head and a hundred whispers just beyond hearing flood your mind."
		}	
	}
	/**
	 * Parts the veil for the mole permanently, increasing his magical power and also the amount of sanity damage taken.  It may also yield futher insight into the mysteries of the Deepness.
	 * @param story the ViewController for the story
	 */
	partVeil(story) {
		// write item use feedback
		story.writeParagraph("As you touch the tip of the Last Lash to your forehead, every fiber of fur over your entire body suddenly stands rigidly on end -- power surges through you, and in a bloody flash a mystic third eye has ripped through your forehead fuzz!  This eye imparts sight beyond sight and knowledge that no mortal creature's brain was ever meant to host to your velvety little body.  Everything is clearer now, though your vision is obscured by bloody fuzz and forehead bits.  The very air seems to whisper unfamthomable secrets, and the mysteries of the shadows are more addictively alluring than ever before.  The Last Lash crumbles to dust, it's job done.");
		// modify story state to reflect parted veil
		story.eventFlags.veil_parted = true;
		// modify mole stats, doubling base and current pwr and halving base and current res
		story.charactersDict.mole.stats.pwr *= 2;
		story.charactersDict.mole.coreStats.pwr *= 2;
		story.charactersDict.mole.stats.res /= 2;
		story.charactersDict.mole.coreStats.res /= 2;
		// last lash is one-time use, so remove from inventory
		story.removeItem(story.charactersDict.mole, this);
	}
}
export class ItemManager {
	constructor() {
		/**
		 * The string item id of the Item that the player has started using
		 */
		this.activeItemId = null;
		/**
		 * Associative mapping of item id strings to corresponding Item objects
		 */
		this.itemsMap = {};
	}
}