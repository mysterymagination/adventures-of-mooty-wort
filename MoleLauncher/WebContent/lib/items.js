import {Libifels} from "./libifels.js";
import {CombatViewController} from "../js/combatviewcontrollers.js";

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
	 * @param itemManager item wrangler with handles to viewcontrollers
	 * @param targetString string ID of the in-universe object we're using this Item on
	 * @return true if we matched the targetString with our regex keys and could run useOn behavior; otherwise false
	 */
	useOn(itemManager, targetString) {
		// parse descriptor and look for a useOn attr, and then match the input targetString to a regex string key in the useOn array of possible matches. Finally call the relevant functions of this Item that were found mapped to matching regex key strings.
		if(this.descriptor.useOn) {
			for(const matcherObj of this.descriptor.useOn) {
				for(const [keyRegex, effectFn] of Object.entries(matcherObj)) {
					if(targetString.match(new RegExp(keyRegex, 'i'))) {
						effectFn.call(this, itemManager);
						return true;
					}
				}
			}
		}
		// we want to hit stuff up above as the success exit condition; if we get here, we didn't find a match or couldn't search for one so just return false
		return false;
	}
	/**
	 * Print out the item's description 
	 */
	describe(itemManager) {
		itemManager.describeItem(this);
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
		this.name = "Dripping Caustic Claws";
		this.descriptor = {
				"useOn": [
					{
						"vault": this.rendPhantasmalloy
					}
				],
				"descriptionString": "The "+this.name+" gleam brilliantly, caustic green slime dripping languidly from each claw tip."
		};
		this.atkBuf = 25;
		this.acidDmg = 0;
	}
	/**
	 * Rends the phantasmalloy vault asunder and reveals its treasure to the mole
	 * @param itemManager the ItemManager object directing our usage
	 */
	rendPhantasmalloy(itemManager) {
		const story = itemManager.storyViewController;
		story.writeParagraph("The "+this.name+" rend the vault's indefatigable structure asunder like a hot knife slices through butter, oddly creating exactly the same sort of delicious molten gold drizzle.  Inside there is a small velvet cushion with a glass vial resting on it.  Inside the vial is a blindingly beautiful liquid rainbow -- just gazing upon it thrills you endlessly!");
		itemManager.addItem(story.charactersDict.mole, new FontOManaPotion());
		story.eventFlags.phantasmalloy_vault_opened = true;
	}
	// todo: need mech for un/re/equipping
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
					"nakedest.*molerat": this.tickleMolerat
				},
				{
					"character": this.ticklePlayer
				},
				{
					"\s+mole\s+": this.ticklePlayer
				},
				{
					"mooty.*wort": this.ticklePlayer
				}
			],
			"descriptionString": "This "+this.name+" wiggles enthusiastically in your compartment.  It's a bit jagged, but soft at certain angles; given the hairless nature of your compartment, you have to keep shifting it to avoid being poked or being tickled into a fit of giggles."
		}	
	}
	/**
	 * Tickle the Nakedest Molerat out of his reverie
	 * @param item wrangler with handles to viewcontrollers
	 */
	tickleMolerat(itemManager) {
		switch(itemManager.feedbackContext) {
		case "story":
			// write item use feedback
			itemManager.storyViewController.writeParagraph("You reach out and wiggle the fuzz playfully over your molerat friend's snoot; he tries to resist an upwelling of mirth that threatens to fracture his zealous persona, but no will can resist the captivating grip of the tickle monster -- as the molerat laughs merrily, hugging his roly-poly belly with his bloody paw stumps, he rolls away from the opal eye.  Beneath it, you can now see a small tunnel filled with an oddly beckoning darkness.  Something inside purrs, its bass rumbling turning from barest whisper to veritably roaring contentment as you draw near.");
			itemManager.storyViewController.writeParagraph("A crimson flash catches your eye as you search about the molerat's erstwhile territory; brushing some dust away with your wiggly snoot, you uncover a boiling potion vial of velvety red gel, which you pocket.");
			itemManager.addItem(itemManager.storyViewController.charactersDict.mole, new MinorHealthPotion());
			// modify story state to reflect tickled molerat
			itemManager.storyViewController.eventFlags.molerat_tickled = true;
			// add grue hub access to the array of choices the player currently has in the story,
			// to be printed as the specific story paradigm directs
			itemManager.storyViewController.appendChoice("basement2_grue_hub");
			itemManager.storyViewController.showChoices();
		}
	}
	ticklePlayer(itemManager) {
		const tickleString = "*^_^* You giggle merrily as you tickle your snoot with the fuzz; sometimes one simply must step out of the moment and appreciate the little joys in life!";
	
		switch(itemManager.feedbackContext) {
		case "combat":
			CombatViewController.combatLogPrint(tickleString, CombatViewController.MessageCat.CAT_ABILITY_HINT);
		case "story":
		default:
			itemManager.storyViewController.writeParagraph(tickleString);
		}
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
					"\s+mole\s+": this.partVeil
				},
				{
					"mooty.*wort": this.partVeil
				}
			],
			"descriptionString": this.name+" is a brilliant amethyst eyelash from a gargantuan statue.  The air shimmers around it, and through it you can glimpse undreamt-of alien vistas.  It vibrates with a sort of crystalline anticipation when you bring it anywhere near your head and a hundred whispers just beyond hearing flood your mind."
		}	
	}
	/**
	 * Parts the veil for the mole permanently, increasing his magical power and also the amount of sanity damage taken.  It may also yield further insight into the mysteries of the Deepness.
	 * @param item wrangler with handles to viewcontrollers
	 */
	partVeil(itemManager) {
		const paraSnoot = "As you touch the tip of the Last Lash to your snoot to take a careful snufful, every fiber of fur over your entire body suddenly stands rigidly on end -- power surges through you, and in a bloody flash a mystic third eye has ripped through your forehead fuzz!  This eye imparts sight beyond sight and knowledge that no mortal creature's brain was ever meant to host to your velvety little body.";
		const paraClarity = "Everything is clearer now, despite your vision being obscured by bloody fuzz and forehead bits.  The very air seems to whisper unfathomable secrets, and the mysteries of the shadows are more addictively alluring than ever before.  The Last Lash crumbles to dust, its job done.";
		const paraVioletEyes = "Catching sight of yourself in a nearby puddle, you note that your once earth-brown eyes have turned an electric shade of violet; the new third eye is oscillating through all possible colors (and a few impossible ones) rapidly.  Its vertical pupil darts restlessly about of its own volition, dilating and contracting continuously as if devouring all that you behold.";
		const story = itemManager.storyViewController;
		switch(itemManager.feedbackContext) {
		case "story":
			// write item use feedback
			story.writeParagraph(paraSnoot);
			story.writeParagraph(paraClarity);
			story.writeParagraph(paraVioletEyes);
			break;
		case "combat":
			CombatViewController.combatLogPrint(paraSnoot, CombatViewController.MessageCat.CAT_PLAYER_ACTION);
			CombatViewController.combatLogPrint(paraClarity, CombatViewController.MessageCat.CAT_ABILITY_HINT);
			CombatViewController.combatLogPrint(paraVioletEyes, CombatViewController.MessageCat.CAT_ABILITY_HINT);
			break;
		}
		// modify story state to reflect parted veil
		story.eventFlags.veil_parted = true;
		// modify mole stats, doubling base and current pwr and halving base and current res
		story.charactersDict.mole.stats.pwr *= 2;
		story.charactersDict.mole.coreStats.pwr *= 2;
		story.charactersDict.mole.stats.res /= 2;
		story.charactersDict.mole.coreStats.res /= 2;
		// last lash is one-time use, so remove from inventory
		itemManager.removeItem(story.charactersDict.mole, this);
	}
}
/**
 * Minor Health Potion restores 50% HP
 */
export class MinorHealthPotion extends Item {
	constructor() {
		super();
		this.id = "minor_health_potion";
		this.name = "Minor Health Potion";
		this.descriptor = {
			"useOn": [
				{
					"character": this.restoreHealth
				}
			],
			"descriptionString": "The "+this.name+" is a viscous cozy scarlet, the gentle waves within resembling a soothing ocean of velvety blankets."
		}	
	}
	/**
	 * Restores 50% HP to the player character
	 * @param itemManager itemtastic wrangler of the ViewControllers
	 */
	restoreHealth(itemManager) {
		const paraImbibe = "As you imbibe the potion your wounds knit themselves shut and wave of ecstatic elemental love washes over you!";
		const story = itemManager.storyViewController;
		story.addToCharacterQuality("health", 0.5 * story.charactersDict.mole.stats.maxHP);
		switch(itemManager.feedbackContext) {
		case "story":
			// write item use feedback
			story.writeParagraph(paraImbibe);
			break;
		case "combat":
			CombatViewController.combatLogPrint(paraImbibe, CombatViewController.MessageCat.CAT_PLAYER_ACTION);
			const combatVC = itemManager.combatViewController;
			combatVC.updateCharacterData(combatVC.combatDriver);
			break;
		}
		itemManager.removeItem(story.charactersDict.mole, this);
	}
}
/**
 * Minor Mana Potion restores 25% MP
 */
export class PuddleOManaPotion extends Item {
	constructor() {
		super();
		this.id = "minor_mana_potion";
		this.name = "Puddle o' Mana Potion";
		this.descriptor = {
			"useOn": [
				{
					"character": this.restoreMana
				}
			],
			"descriptionString": "The "+this.name+" is a lovely shimmering sapphire hue, and the actual diamond dust within glitters brilliantly."
		}	
	}
	/**
	 * Restores 25% MP to the player character
	 * @param item wrangler with handles to viewcontrollers
	 */
	restoreMana(itemManager) {
		// write item use feedback
		const paraImbibe = "As you imbibe the potion your heartbeat quickens and mystic power swells!";
		const story = itemManager.storyViewController;
		story.addToCharacterQuality("mana", 0.25 * story.charactersDict.mole.stats.maxMP);
		switch(itemManager.feedbackContext) {
		case "story":
			// write item use feedback
			story.writeParagraph(paraImbibe);
			break;
		case "combat":
			CombatViewController.combatLogPrint(paraImbibe, CombatViewController.MessageCat.CAT_PLAYER_ACTION);
			const combatVC = itemManager.combatViewController;
			combatVC.updateCharacterData(combatVC.combatDriver);
			break;
		}
		itemManager.removeItem(story.charactersDict.mole, this);
	}
}
/**
 * Major Mana Potion restores 100% MP
 */
export class FontOManaPotion extends Item {
	constructor() {
		super();
		this.id = "major_mana_potion";
		this.name = "Font o' Mana Potion";
		this.descriptor = {
			"useOn": [
				{
					"character": this.restoreMana
				}
			],
			"descriptionString": "The "+this.name+" seems to be a bottled-up liquid rainbow!  Every particle of it seems to be a unique and ever-changing fractal, infinite in depth and complexity.  It's wonderfully warm to the touch and fills you with a sense of serene wonder whenever you so much as glance at it."
		}	
	}
	/**
	 * Restores 100% MP to the player character
	 * @param item wrangler with handles to viewcontrollers
	 */
	restoreMana(itemManager) {
		// write item use feedback
		const paraImbibe = "As you imbibe the liquid rainbow potion your eyes glow with radiant fervor and mystic power sets all your nerves aflame!  Purple lightning arcs between the innumerable tips of your fuzz, which is presently standing on end like you're some sort of land-sea urchin.";
		const story = itemManager.storyViewController;
		story.addToCharacterQuality("mana", story.charactersDict.mole.stats.maxMP);
		switch(itemManager.feedbackContext) {
		case "story":
			// write item use feedback
			story.writeParagraph(paraImbibe);
			break;
		case "combat":
			CombatViewController.combatLogPrint(paraImbibe, CombatViewController.MessageCat.CAT_PLAYER_ACTION);
			const combatVC = itemManager.combatViewController;
			combatVC.updateCharacterData(combatVC.combatDriver);
			break;
		}
		itemManager.removeItem(story.charactersDict.mole, this);
	}
}
/**
 * This urn contains the daughter of the terrible ochre ooze; it wants her back, but she does not wish to return.
 */
export class RustyUrn extends Item {
	constructor() {
		super();
		this.id = "rusty_urn";
		this.name = "The Rusty Urn";
		this.descriptor = {
			"useOn": [
				{
					"ochre.*ooze": this.deliverDaughterOoze
				},
				{
					"character": this.daughterOozeConvo
				},
				{
					"\s+mole\s+": this.daughterOozeConvo
				},
				{
					"mooty.*wort": this.daughterOozeConvo
				}
			],
			"descriptionString": this.name+" wiggles gently when left to its own devices and sloshes worryingly when touched."
		}	
	}
	/**
	 * The mole can talk with the daughter ooze and get closer to her... but he probably shouldn't if he wants those claws!
	 * @param item wrangler with handles to viewcontrollers
	 */
	daughterOozeConvo(itemManager) {
		let cuteConvoText = "";
		const roll = Libifels.rollDie(4);
		switch(roll) {
		case 1:
			cuteConvoText += "You carefully open the urn and peer in at the viscous rust-colored gel inside.  Presently, it forms a pair of wide eyes to peer right back and a whisper from unseen lips (?) says \"Hoi! ^_^  My name is Gel (hard G).  Do you love me?  I love you!\"";
			break;
		case 2:
			cuteConvoText += "Tipping the urn experimentally, you see the gel inside frantically clamber towards the bottom and increase its viscosity.  \"Please don't pour me out -- it's cozy in here!  Can we go on adventures together?  I love you, you know.\"";
			break;
		case 3:
			cuteConvoText += "Tapping a digging claw on the side of the urn, you start back as a pair of emerald eyes sparkling with curiosity appear, gazing out at you.  A pair of scarlet-lacquered lips form a bit below the eyes, smile sweetly, and kiss the inside of the urn where you touched it.  Abruptly, both eyes and lips disappear, and the ooze inside appears several shades pinker for a minute.  You can hear a faint giggling on the wind.";
			break;
		case 4:
			cuteConvoText += "As you examine the transparent urn, your snoot pressed up against it, the ooze inside forms into a small humanoid woman wearing a flowy sundress.  She waves merrily and performs a graceful wiggly twirl.  You grin and clack your mighty claws together in appreciation, and she abruptly disappears into a shy blushy puddle.";
			break;
		}
		const eventCount = itemManager.storyViewController.eventCount;
		eventCount.daughter_ooze_conversations++;
		if(eventCount.daughter_ooze_conversations >= 4 && !itemManager.storyViewController.eventFlags.daughter_ooze_gift) {
			cuteConvoText += "<p>She gloops up against the wall of the urn to ensure she has your attention.  \"Have I mentioned yet that I love you more than anything?\"  She blinks beamingly up at you and when you wink back at her she literally melts into a happy pool of neon pink ripples.  Where her erect mass had been, there now stands a pulsing scarlet vial.  You take it greatfully.</p>"
			itemManager.addItem(itemManager.storyViewController.charactersDict.mole, new MinorHealthPotion());
			itemManager.storyViewController.eventFlags.daughter_ooze_gift = true;
		}
		switch(itemManager.feedbackContext) {
		case "story":
			itemManager.storyViewController.writeParagraph(cuteConvoText);
			break;
		case "combat":
			CombatViewController.combatLogPrint(cuteConvoText, CombatViewController.MessageCat.CAT_ABILITY_HINT);
			break;
		}
	}
	/**
	 * Condemns the daughter ooze to doom and wins the fleeting favor of her parent.
	 * @param item wrangler with handles to viewcontrollers
	 */
	deliverDaughterOoze(itemManager) {
		const paraUrnProfferance = "As you proffer the urn, a tendril whips out from the ochre ooze and suddenly the urn has been removed from your possession.  The fur that the urn had been in contact with is seared away and hideous chemical burns now decorate the flesh beneath.  \"Our daughter!\" the ooze burbles in a thousand thousand voices all vengefully enraptured.  \"What a naughty little mynx you've been, trying to escape the collective.  We live for the Whole, child... and die for it.\"  With that, the ooze slams the urn into itself hard enough to propel it hopelessly deep within its caustic mass; gelatinous ripples expand silently out from the point of impact, strangely lovely in their perfect symmetry.  Though the urn's crystalline structure puts up a noble resistance, it quickly breaks down and you can see through the translucent ochre muck a smaller quantity of ooze writhe free of the dissolving urn.  It, or she, you suppose, struggles frantically for a moment and then is still.  As you watch, the little ooze disappears into the mass of the large ooze, and in a few seconds no trace of her remains.";
		const paraKThxMole = "We thank you, brother mole.  There is no compulsion to feed at present, so we are compelled instead to offer you blessings for your service.  Take this weapon and tonic with you; perhaps they will be of some use in fending off the will of The Rumble.\"  The ooze wiggles condescendingly.  \"Lesser, boring Underwere, whose coverage of interests is woefully mired in the prosaic and pragmatic, are fascinated by its promises.  We, however, have all we need right here within ourselves... au naturale.\"";
		const paraGifts = "It shivers ostentatiously and a set of gold clawntlets (gauntlets for paws with claws) dripping with continuous acid dig their way up from the soil under your ever-twitching nose.  Gripped carefully in the left clawntlet is a delicate vial glowing with eery blue-green light.  As you watch wonderingly, the clawnlet artfully flips the vial up between its foreclaws and offers it up to you.  Without waiting to see what else these weapons can do autonomously, you tuck the vial away in your compartment and don them.  They sting and stab you a smidge, but you're certain they will do more to any who would stand against you!";
		switch(itemManager.feedbackContext) {
		case "story":
			const story = itemManager.storyViewController;
			// write item use feedback
			story.writeParagraph(paraUrnProfferance);
			story.writeParagraph(paraKThxMole);
			story.writeParagraph(paraGifts);
			// modify story state to reflect daughter slaughter
			story.eventFlags.daughter_ooze_sacrificed = true;
			// sting and stab
			story.subtractFromCharacterQuality("health", story.charactersDict.mole.stats.maxHP * 0.1);
			// sting and stab, mentally; the more the mole has bonded with her, the worse it hurts
			story.subtractFromCharacterQuality("sanity", story.charactersDict.mole.stats.maxSanity * Math.max(story.eventCount.daughter_ooze_conversations / 10.0, 0.1));
			// add Caustic Claws to mole equipment
			itemManager.addEquipment(story.charactersDict.mole, new CausticClaws());
			// add a minor mana potion
			itemManager.addItem(story.charactersDict.mole, new PuddleOManaPotion());
			// she's gone forever... RIP cute slime girl
			itemManager.removeItem(story.charactersDict.mole, this);
			break;
		}
	}
}
/**
 * The Dark Mantle represents the primal clawing mad power of the Depths, which is essential as a force of nature but corrosive to the sapient psyche; it was not meant to be worn by mortals.
 */
export class DarkMantle extends Item {
	constructor() {
		super();
		this.id = "dark_mantle";
		this.name = "A Dark Passenger"; // shoutout to Dexter :)
		this.descriptor = {
			"useOn": [
				{
					"character": this.gazeIntoAbyss
				},
				{
					"nakedest.*molerat": this.moleratAbsolution
				},
				{
					"spider": this.spiderSeduction
				},
				{
					"ochre.*ooze": this.oozeAbsorb
				},
				{
					"caterpillar": this.caterpillarFuzz
				}
			],
			"descriptionString": this.name+" is with you now, watching and waiting, eager to unleash the infinite power of chaos itself at your direction."
		}	
	}
	/**
	 * The mole has chosen to address the mantle directly, and must then choose whether to embrace it fully or give it up.
	 * @param itemManager the item wrangler
	 */
	gazeIntoAbyss(itemManager) {
		// todo: so for each of these dark mantle usages, we want to present the player with two or more choices; paragon/renegade and all that at least.  Doing so via Undum Situations (via StoryViewController abstraction) is the obvious route, but that could be a bit awkward?  Maybe not, but having the choice generation here and then having to go to the situation to find out what actually happens is a little annoying.  Alternative would be to gen up my own HTML/CSS UI elements for choices in a new modal or something and promises etc. could then let the code appear to be synchronously all here.
		itemManager.storyViewController.appendChoices(["mole_dark_mantle_accept", "mole_dark_mantle_reject"]);
		itemManager.storyViewController.showChoices();
	}
}
export class ItemManager {
	constructor() {
		/**
		 * The Item object that the player has started using
		 */
		this.activeItem = null;
		/**
		 * Associative mapping of item id strings to corresponding Item objects
		 */
		this.itemsMap = {};
		/**
		 * Handle to the story transcript viewcontroller
		 */
		this.storyViewController = null;
		/**
		 * Handle to the combat UI viewcontroller
		 */
		this.combatViewController = null;
		/**
		 * A string indicating which visual context the user is in, story or combat, which modifies the UI elements story changes are printed to.  
		 */
		this.feedbackContext = "story";
	}
	/**
	 * Adds the given item to the given character's inventory in model and view
	 * @param character the Character object who should be receiving the Item
	 * @param item the Item object we want to add to the Character
	 */
	addItem(character, item) {
		// todo: check that they don't already have something with this id
		const listItemTag = document.createElement('li');
		listItemTag.id = item.id;
		listItemTag.onclick = () => {
			this.activateItem(item);
		}
		const anchorTag = document.createElement('a');
		const textNode = document.createTextNode(item.name);
		anchorTag.appendChild(textNode);
		listItemTag.appendChild(anchorTag);
		const listTag = document.getElementById('items_list');
		listTag.appendChild(listItemTag);
		character.inventory.push(item);
	}
	/**
	 * Removes the given Item object from the given Character's inventory
	 * @param character Character whose inventory we want to modify
	 * @param item Item object to match and remove from the inventory
	 */
	removeItem(character, item) {
		// todo: check if the character actually has an item with this id
		const listItemTag = document.getElementById(item.id);
		while (listItemTag.firstChild) {
			listItemTag.removeChild(listItemTag.lastChild);
		}
		listItemTag.remove();
		if(this.activeItem.id === item.id) {
			this.activeItem = null;
		}
		Libifels.removeItemFromInventory(character, item.id);
	}
	/**
	 * Adds a piece of Equipment to the character's inventory and also equips it to them
	 * @param character the Character object who should be receiving the Item
	 * @param equipment the Equipment object we want to equip to the Character
	 */
	addEquipment(character, equipment) {
		this.addItem(character, equipment);
		this.equipItem(character, equipment);
	}
	/**
	 * Removes a piece of Equipment from the character's inventory and also unequips it from them
	 * @param character the Character object who should be receiving the Item
	 * @param equipment the Equipment object we want to equip to the Character
	 */
	removeEquipment(character, equipment) {
		this.removeItem(character, equipment);
		this.unequipItem(character, equipment);
	}
	/**
	 * Equips an item to a character and updates the model and view accordingly
	 * @param character Character object to equip
	 * @param equipment Equipment object in question
	 */
	equipItem(character, equipment) {
		// view
		const listItemTag = document.createElement('li');
		listItemTag.id = equipment.id;
		const textNode = document.createTextNode(equipment.name);
		listItemTag.appendChild(textNode);
		const listTag = document.getElementById('equipment_list');
		listTag.appendChild(listItemTag);
		// model
		equipment.equipEffect(character);
	}
	/**
	 * Unequips equipment from a character and updates the model and view accordingly
	 * @param character Character object to equip
	 * @param equipment Equipment object in question
	 */
	unequipItem(character, equipment) {
		// view
		const listItemTag = document.getElementById(equipment.id);
		while (listItemTag.firstChild) {
			listItemTag.removeChild(listItemTag.lastChild);
		}
		listItemTag.remove();
		// model
		equipment.unequipEffect(character);
	}
	/**
	 * Marks an item as the active item in use in ItemManager and highlights it in the UI
	 * @param item the Item object we want to activate
	 */
	activateItem(item) {
		this.activeItem = item;
		const listItemTag = document.getElementById(item.id);
		listItemTag.className = 'highlight_simple';
		// install a new onclick which prints descriptor; effectively a useon -> self/double click sort of thing for the item desc UX
		listItemTag.onclick = () => {
			this.describeItem(item);
		};
	}
	/**
	 * Uses the active item on the given string target
	 * @param targetString a text string from the story that is to be the target Y of a 'use X on Y' scenario
	 * @return true if we were able to try use th ative item (if any) on this targetString and there was handling for it; false otherwise. 
	 */
	activeItemUseOn(targetString) {
		if(this.activeItem) {
			const listItemTag = document.getElementById(this.activeItem.id);
			// since we're coming down from using the already activated item, reinstall its activation behavior so it can be used again (if it remains in inventory after its useOn)
			// need to use a new item ref so that we don't literally try to hook back into the activeItem handle, which we're about to nullify
			const item = this.activeItem;
			listItemTag.onclick = () => {
				this.activateItem(item);
			};
			listItemTag.classList.remove('highlight_simple');
			const invItem = Libifels.findInventoryItem(this.storyViewController.charactersDict.mole, item.id);
			// store whether our useOn fn matched the targetString with its regex key
			let matchedUseOn = false;
			if(invItem) {
				matchedUseOn = invItem.useOn(this, targetString);
			} 
			this.activeItem = null;
			return matchedUseOn;
		} else {
			return false;
		}
	}
	/**
	 * Write out the item's description
	 */
	describeItem(item) {
		switch(this.feedbackContext) {
		case "combat":
			CombatViewController.combatLogPrint(item.descriptor.descriptionString, CombatViewController.MessageCat.CAT_ABILITY_HINT);
			break;
		case "story":
		default:
			this.storyViewController.writeParagraph(item.descriptor.descriptionString);	
			break;
		}
		// reinstall activateItem as onclick behavior and remove highlight
		const listItemTag = document.getElementById(item.id);
		listItemTag.onclick = () => {
			this.activateItem(item);
		};
		listItemTag.classList.remove('highlight_simple');
		// remove active item handle as we've effectively made use of the outgoing activation status by rendering the description
		this.activeItem = null;
	}
}