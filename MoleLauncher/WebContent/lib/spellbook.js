import * as Alchemy from "./alchemy.js";
import {Libifels} from "./libifels.js"

export class Description {
	constructor() {
		this.descString = "placeholder desc";
		// todo: would it be useful at all to subdivide this dict by cat?  That's mostly a usage concern, but maybe not entirely.
		Description.prototype.telegraphTagAssocDict = {
				"test_phrase": [
					"it is a placeholder test telegraph tag replacement string"
				],
				"test_one": [
					"1"
				],
				"test_two": [
					"2"
				],
				"test_three": [
					"3"
				],
				"explosion": [ 
					"in a bludgeoning tide of heat and light",
					"heralded by fantastic technicolor pyrotechnics",
					"preceded by a rolling rumble that rises to a roar of deafeningly dissonant chaos",
					"heat washing outward in wild waves", 
					"a blinding nova preceding molten sparks coruscating over the surface of your world"
				],
				"energy": [
					"a torrent of coruscating charge",
					"with a tangible pulse like the beating of a manic heart",
					"awash in irrepressible current"
				],
				"shadow": [
					"a grip of suffocating inky blackness",
					"a rolling landscape of infinite possibility, all of it bleak",
					"with nightmare figures suggested in the infinitely continuous facets of its smoothly jet-black surface"
				],
				"night": [
					"wings of twilight goading you to rest and allow dream to take you",
					"the deep and troubling promise of this dreamscape presenting haunting possibilities",
					"a cold tide of loneliness born upon a sea of velvet void"
				],
				"stars": [
					"winking eyes in a portrait of nothingness",
					"an all-consuming white fire that only underscores the cold with its ambivalent distance",
					"sparkling quintessence and the very eyes of creation -- all turned upon you and gleaming with malice",
					"flaring pinpricks of omnipresent light too far away to warm but always watching"
				],
				"quake": [
					"amidst a vicious rumbling of reality that promises to leave all things familiar in ruin",
					"rocked by undulations of the earth itself, heaving in the throes of whatever madness may infect stone and soil",
					"your paws scrabbling and your fuzzy little body tumbling about, just another spot of debris in a torrent of ruinous chaos"
				],
				"visceral": [
					"soul-deep power thrumming with irrepressible need, terrifying in its natural familiarity",
					"insatiable instinct buried deep within the molten depths of the self",
					"like shuddering shards of spirit, raw and radiant"
				], 
				"aura": [
					"a mist swirls about the structure like an ephemeral serpent, pulsing like a heartbeat with blinding pearlescent light",
					"fire and flickering shadow clinging to it like desperate lovers",
					"fuzzily refracted light swirls over it, blurring and distorting its morphology, a cryptic prism of phantasmagoria"
				],  
				"berserk": [
					"blind rage driving destruction indescriminate",
					"eyes flashing the furious crimson of boiling blood",
					"tactics, rationale, and any semblance of mercy forsaken for raw power"
				],
				"primordial": [
					"unformed potential, vibrating with the violence required to inflict itself upon reality",
					"quaking like the molten core of the world",
					"born forth in cataclysmic cold from a time before anything perverted the emptiness of the void"
				], 
				"atavistic": [
					"primal, raw, and unrelenting",
					"like claws of ancient stone upthrust through an untold infinity of the forgotten and into your reality",
					"bearing the undeniable gravity of fundamental need at the center of all being"
				],
				"cavern": [
					"echoing endlessly down to the core of everything",
					"slow, steady, horrible, and unstoppable -- like the growth of a stalactite aligned to impale the very eye of the world",
					"a deafening shriek of winds rushing all 'round, their howling highlighting the abounding emptiness suffocating you with space"
				],
				"midden": [
					"a suffocating ambience of waste and corruption",
					"rot and ruin permeating the air",
					"flush with the putrid heady scent of the lost and forgotten"
				],
				"mist": [
					"cold fog grips at your fur, glittering gossamer wisps like desperate diamonds gasping their last",
					"the clawing chill in the air leeching warmth from your body like a vampiric blanket... the anti-blanket!",
					"surrounding mist rendering everything through a filter of desolate obscurity"
				],
				"venom": [
					"bubbling with toxic intent",
					"fairly boiling with anticipation at the prospect of fulfilling its promise of virulent cruelty",
					"sneaking, searching, stabbing through everything in reach, like a curious and voracious serpent"
				],
				"massive": [
					"hulking form and crushing presence",
					"casting shadows that could eclipse the sun itself if necessary, such that drowning your hope in darkness is simple",
					"a cyclopean monument to the primordial forces that could only squeeze themselves into the first moments of time"
				],
				"oily": [
					"dripping slick with viscous filth",
					"drenched in a thick coat of sticky poison",
					"the smell of it being repellent enough, but the real kicker is how it's terribly... *moist*."
				],
				"cold": [
					"biting winds leeching life",
					"frozen crystal of infinite facets, beautiful and deadly",
					"with bitterly chill breath that threatens to steal away your own"
				],
				"empty": [
					"nothingness and void",
					"howling void, a relentless vacuum pulling the very breath from you",
					"reducing reality to naught but insubstance drawn straight from the heart of a black hole"
				],
				"isolation": [
					"utterly alone in darkest darkness",
					"the world robbed of life and warmth, of friend and foe alike, leaving only nothing",
					"suffocating silence"
				],
				"heat": [
					"smoldering embers searing all flesh within radiant reach",
					"roiling flares arc around and through an approaching point of strange gravity, like circling predators",
					"pulsing with sullen light like veins of magma through blasted stone",
					"combustion booms outward with a raptorial roar of rolling thunder"
				],
				"mystic": [
					"obscured and mysterious, unsensed but perceived",
					"reality twisting into convoluted chaos",
					"steeped in neon confusion, highlighting curiosities and drowning mundane details in lambent luster"
				],
				"light": [
					"emitting a blinding blaze",
					"blooms of explosive radiation, violet and violent",
					"all cooled color swirls, a poisoned rainbow"
				],
				"thunder": [
					"roaring like the sky itself has become predatory",
					"heralded by deafening concussive booms that strangle your very heartbeat",
					"surrounded by a cacophony of chaotic crashing sounds, like the heavens are pulling apart at the seams, lost to the madness which you struggle to endure"
				],
				"claustrophobic": [
					"walls all around, crushing and suffocating",
					"fear closes in around your heart as unyielding oubliette walls close upon everything else",
					"as freedom of movement lessens, so too does breath quicken, pulse race, and hope erode"
				]
		}
	}
	generateRandomDescription() {
		var letterIndexFrom = Math.floor(Math.random() * Math.floor(this.descString.length));
		var letterIndexTo = Math.floor(Math.random() * Math.floor(this.descString.length));
		var charArray = this.descString.split('');
		charArray.splice(letterIndexFrom, 1, '');
		charArray.splice(letterIndexTo, 0, this.descString[letterIndexFrom]);
		return charArray.join('');
	}
	/**
	 * Parses out tag placeholders where we want to insert random substrings associated with the discovered/selected tag
	 * @param descStringTemplate the primary string whose gaps we're filling in with randomly selected substrings informed by tag data
	 * @return a completed description string
	 */
	parseTags(descStringTemplate) {
		var currentTagIndex = descStringTemplate.indexOf('[');
		var currentTagEndIndex = -1;
		while(currentTagIndex != -1) {
			currentTagEndIndex = descStringTemplate.indexOf(']', currentTagIndex);
			// process tag content, selecting an actual tag string if necessary, and then replacing the placeholder with appropriate generated substring.
			let tagString = descStringTemplate.slice(currentTagIndex + 1, currentTagEndIndex);
			if(tagString[0] === '?') {
				// randomly pick a tag from the given cat
				tagString = tagString.slice(1, currentTagEndIndex);
				let tagArray = this[tagString + "TagArray"];
				tagString = tagArray[Math.floor(Math.random() * tagArray.length)];
			}
			// generate the tag-derived substring we want to replace our placeholder with
			let tagReplacementString = this.generateRandomTagString(tagString);
			// write the replacement substring in by bolting on everything before our current tag chunk to the head of the replacement string and everything after the current tag chunk onto its tail
			descStringTemplate = descStringTemplate.slice(0, currentTagIndex) + tagReplacementString + descStringTemplate.slice(currentTagEndIndex+1);
			// update tag index to next tag chunk, if any
			currentTagIndex = descStringTemplate.indexOf('[', currentTagIndex);
		}
		// now all the tags should be replaced with rando related phrases
		return descStringTemplate;
	}
	/**
	 * Selects at random a prefabricated string associated with the given tag
	 * @param tag the tag string from which we will select an appropriate description substring
	 * @return a description substring associated with the given tag
	 * todo: could we construct this string based on affect/intent-centric impact tags, like tag: "explosion", impact: "stunning", "fear", "overwhelm", "blind", "deafen" => something focusing on destructive aspects of an explosion, meant to startle the reader.
	 * todo: context-generative meta-tags could be useful to, like specific modifications to the desc if the boss is at critical health, poisoned, etc.  
	 * todo: add support for wordcrafting meta-tags that tell use what part of a sentence we're injecting a substring into, which may need to modify articles, parts of speech etc.
	 */
	generateRandomTagString(tag) {
		var replacementArray = this.telegraphTagAssocDict[tag];
		var randoIndex = Math.floor(Math.random() * replacementArray.length);
		return replacementArray[randoIndex];
	}
}

export class Telegraph extends Description {
	constructor() {
		super();
		Telegraph.prototype.telegraphTemplateStringArray = [];
	}
	/**
	 * Generates a random description string based on the given array of telegraph template strings
	 * @param telegraphTemplateStringArray an array of telegraph template string with some static text and placeholders containing tags that are to be replaced with random string data associated with the given tag e.g. [explosion] => "an irrepressible torrent of heat and light"
	 * @return a random Ability description string for use in telegraphs
	 */
	generateRandomTelegraph(telegraphTemplateStringArray) {
		var randoBaseStringIndex = Math.floor(Math.random() * telegraphTemplateStringArray.length);
		return this.parseTags(telegraphTemplateStringArray[randoBaseStringIndex]);
	}
	/**
	 * Generates a random description string based on the prototype chain tail's telegraph template strings
	 * @return a random Ability description string for use in telegraphs
	 */
	generateRandomTelegraph() {
		if(this.telegraphTemplateStringArray && this.telegraphTemplateStringArray.length > 0) {
			var randoBaseStringIndex = Math.floor(Math.random() * this.telegraphTemplateStringArray.length);
			return this.parseTags(this.telegraphTemplateStringArray[randoBaseStringIndex]);
		} else {
			throw "generateRandomTelegraph called on Telegraph instance with no template string array";
		}
	}
}

/**
 * Class representing a capability of a character, e.g. attacking or casting a
 * spell. It takes a config object literal of the form
 * {id:"my_id",name:"my_name"}
 */
export class Ability {
	constructor(configObj) {
		this.id = configObj.id;
		this.name = configObj.name;
		/**
		 * The string name of the FX data JSON file for this ability
		 */
		this.fxDataFileName = "data/fx/"+this.id+".json";

		// metadata about who the ability targets, namely you, all allies,
		// one enemy, or all enemies.
		Ability.prototype.targetType = Ability.TargetTypesEnum.singleTarget;

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
		Ability.prototype.cost = {};
		Ability.prototype.telegraph = new Telegraph();
	}// end new instance ctor
	/**
	 * Appends the cost of this ability to its name
	 */
	displayCostInName() {
		var prettyCostString = '';
		for(const [resource, amount] of Object.entries(this.cost)){
			prettyCostString += amount+' '+resource+'; ';
		}
		this.name += ': '+prettyCostString;
	}
	generateRandomTelegraph() {
		return this.telegraph.generateRandomTelegraph();
	}
	effect(sourceChar, targetChar) { 
		console.log("no effect from " + this.name); 
	}
	calcDmg(sourceChar, targetChar) { 
		console.log("no dmg from " + this.name); 
	}
	generateFlavorText(sourceChar, targetChar) { 
		console.log("flavor text undefined for " + this.name); 
	}
	processCost(character) {
		for (let statCost in this.cost) {
			character.stats[statCost] -= this.cost[statCost];
		}
	}
	printCost() {
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
	getHint() {
		return "default ability hint";
	}
}
Ability.TargetTypesEnum = Object.freeze(
	{
		singleTarget: 1,
		allEnemies: 2,
		allAllies: 3,
		personal: 4
	}
)

export class Attack extends Ability {
	constructor() {
		super({id: "attack", name: "Attack"});
		this.targetType = Ability.TargetTypesEnum.singleTarget;
	}
	calcDmg(sourceCharacter, targetCharacter) {
        // favor the STR since the attacker is the leading participant
        return Libifels.prettyDarnRound(
        			Math.max(sourceCharacter.stats["atk"] * 2 - targetCharacter.stats["def"] / 4 + Math.random() * 10, 1)
        		);
    };
    effect(sourceCharacter, targetCharacter) {
        this.dmg = this.calcDmg(sourceCharacter, targetCharacter);
        targetCharacter.stats.hp -= this.dmg;
    }
    generateFlavorText(sourceCharacter, targetCharacter) {
        return sourceCharacter.name + " strikes " + targetCharacter.name + " a mighty blow, dealing " + this.dmg + " damages!";
    };
    getHint() {
		return "Performs a basic physical attack against a single target";
	}
}

export class DummyAttack extends Ability {
	constructor() {
		super({id: "dummy_attack", name: "Attack"});
		this.targetType = Ability.TargetTypesEnum.singleTarget;
		DummyAttack.prototype.telegraph = new DummyAttackTelegraph();
	}
	calcDmg(sourceCharacter, targetCharacter) {
        return Libifels.prettyDarnRound(
        			Math.max(sourceCharacter.stats["atk"] * 0.5 - targetCharacter.stats["def"] / 4 + Math.random() * 10, 1)
        		);
    };
    effect(sourceCharacter, targetCharacter) {
        this.dmg = this.calcDmg(sourceCharacter, targetCharacter);
        targetCharacter.stats.hp -= this.dmg;
    }
    generateFlavorText(sourceCharacter, targetCharacter) {
        return sourceCharacter.name + " strikes " + targetCharacter.name + " a middlin blow, dealing " + this.dmg + " damages!";
    };
    getHint() {
		return "Performs a weak physical attack against a single target";
	}
}

/**
 * Telegraphs a basic attack, purposefully weaker than player Attack abl
 */
class DummyAttackTelegraph extends Telegraph {
	constructor() {
		super();
		DummyAttackTelegraph.prototype.fxTagArray = ["berserk", "quake", "visceral"];
		DummyAttackTelegraph.prototype.telegraphTemplateStringArray = [
			"A [berserk] light gleams in your enemy's eye.",
			"[quake] rumbles as the monstrous foes ready their weapons.",
			"Dread simultaneously exestential and visceral floods your spirit as your enemies' weapons gleam, highlighted by the encroaching abyss, [visceral]."
		];
		this.telegraphString = this.generateRandomTelegraph(this.telegraphTemplateStringArray);
	}
}

/**
 * Special version of Attack that restores some MP for player characters
 */
export class HeroAttack extends Attack {
	constructor() {
		super();
		// override id and related data
		this.id = "hero_attack";
		this.name = "Hero Attack";
		this.fxDataFileName = "data/fx/"+this.id+".json";
		// todo: should this value derive from something?
		this.mpBonusCoefficient = 0.1;
		this.dmg = 1;
		this.mpBonus = 0.0;
	}
	effect(sourceCharacter, targetCharacter) {
        this.dmg = this.calcDmg(sourceCharacter, targetCharacter);
        this.mpBonus = this.mpBonusCoefficient * sourceCharacter.stats.maxMP;
        sourceCharacter.stats.mp += this.mpBonus; 
        targetCharacter.stats.hp -= this.dmg;
    }
	getHint() {
		return "Performs a basic physical attack against a single target, and restores some of the hero's MP";
	}
}
/**
 * Ability that adds the Defended status effect, increasing def and res
 */
export class Defend extends Ability {
	constructor() {
		super({id: "defend", name: "Defend"});
		this.targetType = Ability.TargetTypesEnum.personal;
		this.mpBonusCoefficient = 0.25;
		this.mpBonus = 0;
	}
    effect(sourceCharacter) {
    	this.mpBonus = this.mpBonusCoefficient * sourceCharacter.stats.maxMP;
    	sourceCharacter.stats.mp += this.mpBonus;
    	Libifels.addUniqueStatusEffect(
        	sourceCharacter, 
        	new Alchemy.Defended()
        );
    }
    generateFlavorText(sourceCharacter, targetCharacter) {
        return sourceCharacter.name + " hunkers on down to defend " + sourceCharacter.getPronoun_personal_object()+"self!";
    }
    getHint() {
		return "Doubles physical defense and magical resistance for one round";
	}
}

export class Run extends Ability {
	constructor() {
		super({id: "run", name: "Run"});
	}
	isSuccess(playerParty) {
		// todo: something something check party spd against enemy spd to determine if they escaped successfully?
		return false;
	}
	generateFlavorText(playerParty) {
        var flavorText = "";
        for (let i = 0; i < playerParty.length; i++) {
            if (i < playerParty.length - 1) {
                flavorText += playerParty[i].name + ", ";
            } else {
                flavorText += "and " + playerParty[i].name;
            }
        }
        return flavorText + " bravely attempt to turn tail and flee, but they cannot escape!";
    }
	getHint() {
		return "There is no escape!";
	}
}
/**
 * Subclass of Ability for magical spells
 * todo: any reason to have this differentiation?
 */
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
		MoleVenom.prototype.targetType = Ability.TargetTypesEnum.singleTarget;
		MoleVenom.prototype.cost = { "mp": 15 };
		this.displayCostInName();
	}
	// methods are placed on the object prototype and shared between all instances
	calcDmg(sourceChar, targetChar) {
        return Libifels.prettyDarnRound(
        			Math.max(sourceChar.stats["pwr"] - targetChar.stats["res"], 1)
        	   );
    }
	effect(sourceChar, targetChar) {
        this.dmg = this.calcDmg(sourceChar, targetChar);
        targetChar.stats["hp"] -= this.dmg;
        // mix up our poison...
        var poisonStatusEffect = new Alchemy.Poison();
        poisonStatusEffect.psnDmg = sourceChar.stats["pwr"] * 0.5;
        Libifels.addUniqueStatusEffect(targetChar, poisonStatusEffect);

        // MP cost
        this.processCost(sourceChar);
    }
	generateFlavorText(sourceChar, targetChar) {
        return "Not many realize that moles are venomous, because, being peaceful and lovey creatures, they so often choose not to employ it.  Most are willing even to risk death rather than risk becoming a killer, and thus will not use venom when fighting back against predators and similar common foebeasts.  When the sanctity of The Deepness is threatened and the ancient things from dark corners of mole memory stir, however... it is a time to kill.  In a flash and with a violent violet flourish, you flick out your veneom spurs and bury them deeply in the flesh of " + targetChar.name +", dealing "+this.dmg+" points of damage directly and flooding "+targetChar.getPronoun_possessive()+" veins with "+Libifels.getStatusEffectById("poison").psnDmg+" poison points per round!";
    }
	getHint() {
		return "Deals magical acid damage to a single target and leaves a corrosive poison that festers in their bloodstream for 3 rounds";
	}
}

/**
Warmest hug heals self (or self and other) with ATK; if healing a target other than self, the healing is divided by 2 amongst each party.
*/
export class WarmestHug extends Spell {
	constructor() {
		super({id: "warmest_hug", name: "Warmest Hug"});
		WarmestHug.prototype.targetType = Ability.TargetTypesEnum.singleTarget;
		WarmestHug.prototype.cost = { "mp": 15 };
		this.displayCostInName();
	}
	calcDmg(sourceChar, targetChar) {
	    return Math.max(Libifels.prettyDarnRound(sourceChar.stats["atk"] * 2, 1));
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
	    return sourceChar.name + " embraces " + sourceChar.getPronoun_possessive() + " friend " + targetChar.name + " fondly, a soft golden glow surrounding them.  The glow heals " + targetChar.name + " of " + this.dmg + " damage total.";
	}
	getHint() {
		return "Heals a single target and the user for an amount of health based on the user's attack stat; if the user targets themselves, they receive double healing!";
	}
}

/**
 * Woolly Shield raises target's DEF by double the greater of wielder's RES or DEF (min 1)
 */
export class WoollyShield extends Spell {
	constructor() {
		super({id: "woolly_shield", name: "Woolly Shield"});
		WoollyShield.prototype.targetType = Ability.TargetTypesEnum.singleTarget;
		WoollyShield.prototype.cost = { "mp": 30 };
		this.displayCostInName();
	}
	effect(sourceChar, targetChar) {
		Libifels.addUniqueStatusEffect(targetChar, new Alchemy.WoolilyShielded(sourceChar));

	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return sourceChar.name + " puffs out " + sourceChar.getPronoun_possessive() + " hair, approximating thick wool as best " + sourceChar.getPronoun_personal_subject() + " can, and jumps in front of " + targetChar.name + ", intent on protecting " + targetChar.getPronoun_personal_object() + " with " + sourceChar.getPronoun_possessive() + " woolly life!";
	}
	getHint() {
		return "Shields a single target for 3 rounds, raising their defense by an amount derived from the user's highest defensive stat";
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
		this.displayCostInName();
	}
	effect(sourceChar) {
		Libifels.addUniqueStatusEffect(sourceChar, new Alchemy.Temper());

	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return sourceChar.name + " furrows " + sourceChar.getPronoun_possessive() + " fuzzy brow in concentration, and resolutely resolves to go all out against all " + sourceChar.getPronoun_possessive() + "foebeasts!";
	}
	getHint() {
		return "Raises the user's physical strength for 3 rounds";
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
		this.displayCostInName();
	}
	effect(sourceChar) {
		Libifels.addUniqueStatusEffect(sourceChar, new Alchemy.ThirdEye());

	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return sourceChar.name + " takes a moment to separate " + sourceChar.getPronoun_possessive() + " consciousness from the chaotic here and now, meditating upon the unknowable complexities of The Deepness. As " + sourceChar.getPronoun_personal_subject() + " does so, the fuzzy flesh of " + sourceChar.getPronoun_possessive() + " forehead tears and through a fine veil of blood there appears a mystical third eye!";
	}
	getHint() {
		return "Raises the user's attack stat for 3 rounds";
	}
	getHint() {
		return "Raises the user's magical strength for 3 rounds";
	}
}

/**
 * Calling upon all the wisdom of his forebears, who were moles of course and not bears, the mole lashes out with an evocation of fiery darkness from The Pit's shapely bottom!  High cost spell that deals moderate fire damage based on the mole's pwr and lowers the target's res.
 */
export class ShadowFlare extends Spell {
	constructor() {
		super({ id: "shadowflare", name: "Shadow Flare" });
		ShadowFlare.prototype.targetType = Ability.TargetTypesEnum.singleTarget;
		ShadowFlare.prototype.cost = { "mp": 50 };
		this.displayCostInName();
		this.element = "shadow";
	}
	calcDmg(sourceChar, targetChar) {
	    return Math.max(
	    		Libifels.prettyDarnRound(
	    				10 * sourceChar.stats["pwr"] + 
	    				Libifels.rollNDM(4,10)
	    			), 
	    		1);
	}
	effect(sourceChar, targetChar) {
	    this.dmg = this.calcDmg(sourceChar, targetChar);
	    targetChar.stats["hp"] -= this.dmg * targetChar.elemAffinities[this.element];
	    // ensure we didn't heal the Grue up to an impossible value... todo: should be clamping on stats everywhere
	    targetChar.stats["hp"] = Libifels.clampInRange(targetChar.stats["hp"], 0, targetChar.stats["maxHP"]);
	    console.log(targetChar.name+" hp is now "+targetChar.stats["hp"]+" after clamping");
	    targetChar.stats["res"] -= 10;

	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return "Calling upon all the wisdom of his forebears, who were moles of course and not bears, the mole lashes out with an evocation of fiery darkness from The Pit's shapely bottom!  The subtle conflagration is so overwhelming that "+targetChar.name+"'s very meta-magical field crumbles slightly, unraveling the threads of "+targetChar.getPronoun_possessive()+" existence.  "+targetChar.getPronoun_personal_subject()+" appears somewhat less substantial afterwards, as if "+targetChar.getPronoun_possessive()+" form longs to be as one with the aether.  As it happens, this hurts exactly as much as "+this.dmg+" damage!";
	}
	getHint() {
		return "Deals heavy magical damage to a single target, and permanently lowers its magical resistance";
	}
}
/**
 * Thrusting his mighty digging claw into the earth and calling out for aid with all his spirit, the mole summons up a wash of magma from the planet's molten core to engulf his foe.  This spell light fire damage based on mole's pwr and burns the target.
 */
export class MagmaBlast extends Spell {
	constructor() {
		super({ id: "magma_blast", name: "Magma Blast" });
		MagmaBlast.prototype.targetType = Ability.TargetTypesEnum.singleTarget;
		MagmaBlast.prototype.cost = { "mp": 25 };
		this.displayCostInName();
	}
	calcDmg(sourceChar, targetChar) {
	    return Math.max(Libifels.prettyDarnRound(sourceChar.stats["pwr"] + Math.random() * 21 + 10), 1);
	}
	effect(sourceChar, targetChar) {
	    this.dmg = this.calcDmg(sourceChar, targetChar);
	    targetChar.stats["hp"] -= this.dmg;
	    var burnEffect = new Alchemy.Burn();
	    burnEffect.brnDmg = this.dmg * 0.5;
	    Libifels.addUniqueStatusEffect(targetChar, burnEffect);

	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return "Thrusting his mighty digging claw into the earth and calling out for aid with all his spirit, the mole summons up a wash of magma from the planet's molten core to engulf his foe in "+this.dmg+" fiery damage!";
	}
	getHint() {
		return "Deals magical fire damage to a single target and inflicts a debilitating burn that lingers for 3 rounds";
	}
}
/**
 * Shuffling his little paws rapidly, the mole generates a bolt of static electricity; the density of his fur is quite shocking!  This deals light electric damage and also inflicts Stun.
 */
export class StaticBolt extends Spell {
	constructor() {
		super({ id: "static_bolt", name: "Static Bolt" });
		StaticBolt.prototype.targetType = Ability.TargetTypesEnum.singleTarget;
		StaticBolt.prototype.cost = { "mp": 40 };
		this.displayCostInName();
	}
	calcDmg(sourceChar, targetChar) {
	    return Math.max(Libifels.prettyDarnRound(sourceChar.stats["pwr"] + Libifels.rollD20()), 1);
	}
	effect(sourceChar, targetChar) {
	    this.dmg = this.calcDmg(sourceChar, targetChar);
	    targetChar.stats["hp"] -= this.dmg;
	    Libifels.addUniqueStatusEffect(targetChar, new Alchemy.Stun());

	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return "Shuffling his little paws rapidly, the mole generates a bolt of static electricity; the density of his fur is quite shocking!  With a righteous squeak, he hurls at "+targetChar.name+", disrupting "+targetChar.getPronoun_possessive()+" systems with "+this.dmg+" damage points of wild current.";
	}
	getHint() {
		return "Shocks a single target with magical lightning, stunning them into inaction for 1 round";
	}
}

/// begin Grue abilities block ///
/**
 * Touch of the Void deals moderate HP and MP damage if the target has any MP remaining, and the MP is absorbed by Grue. Else, it deals heavy HP damage.  Only usable once every 3-5 turns, and there's a tell in the log when it recharges.
 */
export class TouchVoid extends Spell {
	constructor() {
		super({ id: "touch_of_void", name: "Touch of the Void" });
		TouchVoid.prototype.targetType = Ability.TargetTypesEnum.singleTarget;
		TouchVoid.prototype.cost = { "mp": 0, "hp": 15 };
		TouchVoid.prototype.telegraph = new TouchVoidTelegraph();
		/**
		 * Flag indicating that the target's lack of mana pool has driven The Grue into a rage,
		 * and it inflicts all its fury upon the target's corporeal shell instead
		 */
		this.rendFlesh = false;
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
			aspectDamage = 1.2*sourceChar.stats["pwr"] - 0.5 * targetChar.stats["res"];
		} else {
			aspectDamage = 1.2*sourceChar.stats["atk"] - 0.5 * targetChar.stats["def"];
		}
		return Math.max(Libifels.prettyDarnRound(aspectDamage), 1);
	}
	effect(sourceChar, targetChar) {
	    if(targetChar.stats["mp"] > 0) {
	    	// target has MP to steal so apply damage to HP and MP, and source's MP is healed
	    	this.dmg = this.calcDmg(sourceChar, targetChar, true);
	        targetChar.stats["mp"] -= Math.ceil(this.dmg/2);
	        // negative MP situation is just death on wheels... also stupid
	        targetChar.stats["mp"] = Libifels.clampInRange(targetChar.stats["mp"], 0 ,targetChar.stats["maxMP"]);
	        sourceChar.stats["mp"] += this.dmg/2;
	        this.dmg = this.calcDmg(sourceChar, targetChar, false);
	        targetChar.stats["hp"] -= Math.ceil(this.dmg);
	        sourceChar.stats["hp"] += this.dmg;
	    } else {
	    	// apply double damage to target HP, and all healing goes to user's HP
	    	this.dmg = this.calcDmg(sourceChar, targetChar, false);
	        targetChar.stats["hp"] -= 2 * this.dmg;
	        sourceChar.stats["hp"] += 2 * this.dmg;
	        this.rendFlesh = true;
	    }

	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return "Somehow the darkness near your rump becomes material and seizes you!  Cold infects your being as all the warmth and joy of life bleeds away, slaking the implacable thirst of Darkness.  "+(this.rendFlesh ? "Finding "+targetChar.name+" devoid of magical substance, "+sourceChar.name+" inflicts "+sourceChar.getPronoun_possessive()+" full rage upon "+targetChar.getPronoun_personal_object()+" corporeal shell to the tune of "+(2*this.dmg)+" flesh-rendery damages!" : sourceChar.name+" sips lightly from the cup of life and spirit that is "+targetChar.name+" to "+sourceChar.getPronoun_personal_object()+", slurping down "+this.dmg+" damage points worth of blood, bone, and brains in an instant!");
	}
}
/**
 * Telegraphs the incoming and ever-bad touch of the void!
 */
class TouchVoidTelegraph extends Telegraph {
	constructor() {
		super();
		TouchVoidTelegraph.prototype.fxTagArray = ["cold", "shadow"];
		TouchVoidTelegraph.prototype.envTagArray = ["night", "claustrophobic"];
		TouchVoidTelegraph.prototype.telegraphTemplateStringArray = [
			"Walls of [night] close in all around, crushing your world into [claustrophobic].",
			"A swirling of utmost [?fx] begins to creep over you; withing the suddenly [claustrophobic] confines, your breathing becomes labored.",
			"With a rapidly growing sense of [claustrophobic], you warily watch as tendrils of [shadow] weave a cage of unyielding [night] around your tiny corner of the world."
		];
		this.telegraphString = this.generateRandomTelegraph(this.telegraphTemplateStringArray);
	}
}

/**
 * Insatiable Consumption is an instant kill if the mole is at or below 25% HP.  If HP > 50%, drop to 50%. If 25% < HP <= 50% drops him to 25% HP.
 */
export class Consume extends Spell {
	constructor() {
		super({ id: "consume", name: "Insatiable Consumption" });
		Consume.prototype.targetType = Ability.TargetTypesEnum.singleTarget;
		Consume.prototype.cost = { "mp": 25 };
		Consume.prototype.telegraph = new ConsumeTelegraph();
	}
	effect(sourceChar, targetChar) {
	    var currentHP = targetChar.stats["hp"];
	    var maxHP = targetChar.stats["maxHP"]
		if(currentHP <= 0.25 * maxHP) {
			targetChar.stats["hp"] = 0;
		} else if (0.25 * maxHP < currentHP && currentHP <= 0.5 * maxHP){
			targetChar.stats["hp"] = 0.25 * maxHP;
		} else {
			targetChar.stats["hp"] = 0.5 * maxHP;
		}

	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return "A thunderclap of malevolent intent momentarily deafens you; in the midst of that silence, when the wave of emptiness in your surroundings seems to reach its peak, a lightning flash of fangs manifests out of nothing in a rictus grin.  Jaws spreading wide, it chomps down and attempts to swallow you whole!  "+(targetChar["hp"] <= 0 ? "Your bloodsoaked fur helps ease your way on in and down, and in an instant the champion of Deepness is consumed." : "Your bulk and mighty constitution prevent you from sliding down the creature's gullet, but the fangs are still able to tear into "+(targetChar.stats.maxHP * 0.5)+" damages' worth of your flesh."); 
	}
}
/**
 * Telegraphs the creaking joints of a rapidly gaping maw
 */
class ConsumeTelegraph extends Telegraph {
	constructor() {
		super();
		ConsumeTelegraph.prototype.fxTagArray = ["visceral", "thunder"];
		ConsumeTelegraph.prototype.envTagArray = ["isolation", "primordial"];
		ConsumeTelegraph.prototype.telegraphTemplateStringArray = [
			"An ominous silence stretches on for long moments of [isolation]. A [visceral] dread urgently warns you that death approaches on wings of [thunder]... the oubliette of dagger shaped silver-sheen shadows growing ever larger is also a good hint.",
			"With a start and a squeal of pain, you note that the cavern seems to be growing new stalactites and stalagmites.  Rapidly.  A sulphurous wind, [primordial], ruffles your fur in the wake of a growl like rolling [thunder].",
			"A distant and deep creak like [?env] [thunder] suggests that the joints of an enormous maw are being stretched beyond their limits."
			];
		this.telegraphString = this.generateRandomTelegraph(this.telegraphTemplateStringArray);
	}
}

/**
 * Brass Lantern uses the target's raw magic power to deal damage to it, ignoring defense.  
 * It then doubles target's magic power such that subsequent hits will be worse.   
 */
export class BrassLantern extends Spell {
	constructor() {
		super({ id: "brass_lantern", name: "Brass Lantern" });
		BrassLantern.prototype.targetType = Ability.TargetTypesEnum.singleTarget;
		BrassLantern.prototype.cost = { "mp": 10 };
		BrassLantern.prototype.telegraph = new BrassLanternTelegraph();
	}
	effect(sourceChar, targetChar) {
		// deal damage equal to target's current mag pwr
	    targetChar.stats["hp"] -= targetChar.stats["pwr"];
	    // increase mag pwr as the mystic inferno infuses target's soul
	    targetChar.stats["pwr"] *= 2;
	    	
	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return "A fierce gold light burns its way out of the darkness, revealing a small brass lantern.  Inside, a flame flickers violently, tauntingly, before flaring into a raging inferno that rolls over "+targetChar.name+" like a blanket of elemental destruction!  "+targetChar.name+" can feel thoughts and emotions swirl in "+targetChar.getPronoun_possessive()+" mind as "+targetChar.getPronoun_personal_subject()+" burns, dreams flitting past "+targetChar.getPronoun_possessive()+" mind's eye and feeding the conflagration.  "+(targetChar.stats["hp"] > 0 ? "As "+(targetChar.stats.pwr)+" damage of flames roll over "+targetChar.getPronoun_personal_object()+", through the crippling agony "+targetChar.name+" feels a resonant power welling up ever higher..." : ""); 
	}
}

/**
 * Telegraphs the agonizing flare of power that will be inflicted by the Brass Lantern
 */
class BrassLanternTelegraph extends Telegraph {
	constructor() {
		super();
		BrassLanternTelegraph.prototype.fxTagArray = ["light", "heat", "energy"];
		BrassLanternTelegraph.prototype.envTagArray = ["mystic"];
		BrassLanternTelegraph.prototype.telegraphTemplateStringArray = [
			"A fierce glittering spark ignites in the void, spreading blinding [light].  Rather than illuminating, its light warps reality into [mystic] confusion.",
			"Fire, ghostly and [mystic], springs to life through a metal grate in the distance; its [heat] and gluttonous growth put you in mind of a demon's fanged maw.",
			"The comforting darkness is shattered as gathering [energy] and [mystic] [?fx] overwhelm your senses!"
			];
		this.telegraphString = this.generateRandomTelegraph(this.telegraphTemplateStringArray);
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
		ChillBeyond.prototype.telegraph = new ChillBeyondTelegraph();
	}
	calcDmg(sourceChar, targetChar) {
		return Libifels.prettyDarnRound(
					Math.max(sourceChar.stats["pwr"] - 0.5 * targetChar.stats["res"], 1)
				);
	}
	effect(sourceChar, targetChars) {
		
		// apply damage to all targets
		for(const targetChar of targetChars) {
			this.dmg = this.calcDmg(sourceChar, targetChar);
			targetChar.stats["hp"] -= this.dmg;
		    
			// apply Freeze status
			Libifels.addUniqueStatusEffect(targetChar, new Alchemy.Defenseless());
		}

	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChars) {
	    return "While the darkness in your beloved Deepness gets warmer as it closes in thanks to the proximity to magma, the darkness of the infinite Void beyond all worlds is a place of unfathomable cold.  With all the gentleness and decorum of a voratious graveworm, this alien darkness wriggles into the comforting blanket of blackness surrounding you.  Its inception robs your world of warmth entirely and in an instant you are frozen solid!  Refracted through the infinite facets of the glacial translucence is a rictus grin bursting with fangs... this is quite terrifying, as is the "+this.dmg+" points of damage it brings!"; 
	}
}
/**
 * Telegraphs the incipient grip of the frozen insanity voidscape far far beyond the stars
 */
class ChillBeyondTelegraph extends Telegraph {
	constructor() {
		super();
		ChillBeyondTelegraph.prototype.fxTagArray = ["shadow", "cold", "empty"];
		ChillBeyondTelegraph.prototype.envTagArray = ["isolation"];
		ChillBeyondTelegraph.prototype.telegraphTemplateStringArray = [
			"Hateful daggers of [?fx] frost stab into your flesh from a thousand thousand angles as all [cold] closes in, gouging out vitality and leaving [isolation].",
			"A [cold] wind whisks away all the comfort of the once-cozy darkness, leaving it [empty]; something fell approaches wreathed in [shadow].",
			"Howling winds whistle through the caverns, underscoring your [isolation], leaving your spirit [?fx]."
			];
		this.telegraphString = this.generateRandomTelegraph(this.telegraphTemplateStringArray);
	}
}
/// end Grue abilities block ///

/// begin Yawning God abilities block ///
/**
 * Manyfold Embrace damages the user slightly but combines their ATK and PWR to generate massive damage to the enemy
 */
export class ManyfoldEmbrace extends Spell {
	constructor() {
		super({ id: "manyfold_embrace", name: "Manyfold Embrace" });
		ManyfoldEmbrace.prototype.targetType = Ability.TargetTypesEnum.singleTarget;
		ManyfoldEmbrace.prototype.cost = {/*see effect()*/};
		// default this instance's cost to the common element
		this.cost = Object.assign(this.cost, ManyfoldEmbrace.prototype.cost);
		ManyfoldEmbrace.prototype.telegraph = new ManyfoldEmbraceTelegraph();
	}
	calcDmg(sourceChar, targetChar) {
	    // idea is the source is transforming tentacles into mighty spiked cudgels
		// using magic and then buffeting the target with them
		return Math.max(
				Libifels.prettyDarnRound(
					sourceChar.stats["atk"] + 0.5*sourceChar.stats["pwr"]
					- 0.5*targetChar.stats["def"]), 1
				);
	}
	effect(sourceChar, targetChar) {
	    this.dmg = this.calcDmg(sourceChar, targetChar);
	    // now that we have calc'd damage, we can determine the rest of the cost
	    this.cost["hp"] = this.dmg * 0.25;
	    targetChar.stats["hp"] -= this.dmg;
	    // regain some MP from our good ol' huggle
	    sourceChar.stats.mp += this.dmg * 0.5;
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return "An oily blackness like the surface of an unfathomable lake on a moonless night oozes over The God's spongy fishbelly-white flesh, and in a blinding flash of electric purple a series of serrated spikes have materialized in its wake!  With all the looming inevitability of death itself, he descends upon "+targetChar.name+" and wraps  his innumerable tentacles about "+targetChar.getPronoun_personal_object()+" in a crushing embrace.  "+this.dmg+" damage points' worth of "+targetChar.getPronoun_possessive()+" bones are crushed!"; 
	}
}

/**
 * Telegraphs the manner in which the wielder's many, many appendages are about to inflict affection upon a target
 */
class ManyfoldEmbraceTelegraph extends Telegraph {
	constructor() {
		super();
		ManyfoldEmbraceTelegraph.prototype.fxTagArray = ["massive", "venom", "oily"];
	ManyfoldEmbraceTelegraph.prototype.telegraphTemplateStringArray = [
			"The [oily] tendrils of the Yawning God, [massive] and innumerable, rise up ominously.",
			"Dripping with toxins, [venom], your vision is filled with a writhing hive of [massive] serpentine columns.",
			"A sound like reluctantly ripping roots being torn from a substrate of sucking sudden muck heralds the rising of [massive] serpentine shadows from all across the hide of the Yawning God, [oily]."
			];
		this.telegraphString = this.generateRandomTelegraph(this.telegraphTemplateStringArray);
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
		Pestilence.prototype.telegraph = new PestilenceTelegraph();
	}
	calcDmg(sourceChar, targetChar) {
		return Math.max(
				Libifels.prettyDarnRound(
					sourceChar.stats["pwr"] - 0.5 * targetChar.stats["res"]), 1
				);
	}
	effect(sourceChar, targetChars) {
		// mix up our poison...
        var poisonStatusEffect = new Alchemy.Poison();
        poisonStatusEffect.psnDmg = sourceChar.stats["pwr"] * 0.5;
	    for(let index = 0; index < targetChars.length; index++) {
		    	// apply damage to target
		    	this.dmg = this.calcDmg(sourceChar, targetChars[index]);
		    	targetChars[index].stats["hp"] -= this.dmg;
		    	// possibly apply poison
		    	let roll = Libifels.rollPercentage();
		    	if(roll >= 50) {
		    		Libifels.addUniqueStatusEffect(targetChars[index], poisonStatusEffect);
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
 * Telegraphs the manner in which the wielder's breath of disease incarnate will ruin all life in the their path
 */
class PestilenceTelegraph extends Telegraph {
	constructor() {
		super();
		PestilenceTelegraph.prototype.fxTagArray = ["mist", "venom"];
		PestilenceTelegraph.prototype.envTagArray = ["midden"];
		PestilenceTelegraph.prototype.telegraphTemplateStringArray = [
			"Puffs of [mist] black smoke ooze from the nostrils of the Yawning God, [venom] purple lightning crackling within...",
			"Pouring forth a wave of rotten stench like the [midden] of a charnel house, the Yawning God's jaw parts ever so slightly.  Visible wisps of its breath roll out, [venom] [mist]",
			"The great beast's nostrils flare and crack as a destructive [mist] issues forth, the breath of a ruinous [midden] promise."
			];
		this.telegraphString = this.generateRandomTelegraph(this.telegraphTemplateStringArray);
	}
}

/**
 * Primordial Mandate grants the Bloodlust status to the target
 */
export class PrimordialMandate extends Spell {
	constructor() {
		super({ id: "primordial_mandate", name: "Primordial Mandate" });
		PrimordialMandate.prototype.targetType = Ability.TargetTypesEnum.personal;
		PrimordialMandate.prototype.cost = { "mp": 15 };
		PrimordialMandate.prototype.telegraph = new PrimordialMandateTelegraph();
	}
	effect(sourceChar) {
	    // bloodlust on self
		Libifels.addUniqueStatusEffect(sourceChar, new Alchemy.Bloodlust());
	    	
	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return "The God thrusts his tentacles into the earth and the ground begins to quake.  A deep rumble like the visceral warning growl of an intractable force of nature resonates with your spirit, awakening atavistic awe.  Auras of pulsing magma and wild verdancy course up and down The God's flesh in a violently unstoppable current, infusing every fiber of his being with all the might of this world!  The eyes of The God roll wildly, as if even the boundaries of his conception of all realities is being harshly tested by overwhelming new horizons."; 
	}
}
/**
 * Telegraphs the manner in which ancient power and bloodlust of all predators through the eons floods through the caster
 */
class PrimordialMandateTelegraph extends Telegraph {
	constructor() {
		super();
		PrimordialMandateTelegraph.prototype.fxTagArray = ["visceral", "aura", "energy", "berserk"];
		PrimordialMandateTelegraph.prototype.envTagArray = ["primordial", "atavistic", "cavern"];
		PrimordialMandateTelegraph.prototype.telegraphTemplateStringArray = [
			"With a low rumbly roar like the [berserk] fangs of a sky-rending storm clashing with the [visceral] claws of a lava-blooded quake, the Yawning God flexes its jaw.",
			"A growl born of ancient instinct, [primordial], burbles forth and poisons the air with [berserk] madness.",
			"Rippling muscles beneath a fluid rainbow of scales, swirling with [aura], promise incipient pain.  Beneath a pall of [atavistic] dread, you watch fangs like sabers click and clack in insatiable hunger."
			];
		this.telegraphString = this.generateRandomTelegraph(this.telegraphTemplateStringArray);
	}
}

/**
 * PassedStunned is the placeholder action the enemy takes when afflicted with the Stun status effect 
 */
export class PassStunned extends Ability {
	constructor() {
		super({ id: "pass_stunned", name: "Pass turn due to Stun" });
		PassStunned.prototype.targetType = Ability.TargetTypesEnum.personal;
		PassStunned.prototype.telegraph = new PassStunnedTelegraph();
	}
	effect(sourceChar) {}
	generateFlavorText(sourceChar, targetChar) {
	    return ""+sourceChar.name+" struggles against the forces binding "+sourceChar.getPronoun_personal_object()+", but remains paralyzed!"; 
	}
}
/**
 * Reminds the player that the AI character is stunned this round
 */
class PassStunnedTelegraph extends Telegraph {
	constructor() {
		super();
		PassStunnedTelegraph.prototype.fxTagArray = ["aura", "energy", "quake"];
		PassStunnedTelegraph.prototype.telegraphTemplateStringArray = [
			"Bolts of coruscating lightning flash along the paralyzed body of your foe, [aura].",
			"Strangled frustration, [quake], is all your foe can manage through its bonds.",
			"Rippling muscles strain to no avail against unyielding fetters, [energy]."
			];
		this.telegraphString = this.generateRandomTelegraph(this.telegraphTemplateStringArray);
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
		DarkStar.prototype.telegraph = new DarkStarTelegraph();
		/**
		 * Associates damage most recently dealt with the id of the character it was dealt to
		 */
		this.characterDamageDict = {};
	}
	calcDmg(sourceChar, targetChar) {
		return Math.max(
				Libifels.prettyDarnRound(
					2 * sourceChar.stats["pwr"] - 0.5 * targetChar.stats["res"] + Libifels.rollD20()), 1
				);
	}
	effect(sourceChar, targetChars) {
		for(let index = 0; index < targetChars.length; index++) {
	    	// apply damage to target
	    	let dmg = this.calcDmg(sourceChar, targetChars[index]);
	    	targetChars[index].stats["hp"] -= dmg;
	    	this.characterDamageDict[targetChars[index].id] = dmg;
	    }

	    // MP cost
	    this.processCost(sourceChar);
	}
	generateFlavorText(sourceChar, targetChar) {
	    return "The burning chill of moonless midnight wrapped in Lady Winter's empty embrace casts a pall of hoarfrost over your fur as the light drains out of the world.  When all is naught but silence and dark, a muted gray pinprick of light appears before you; an offering of hope.  Unable to help yourself, you reach out to it -- the very instant you give over the focus of your mind to its power, it explodes into a blinding nova whose insatiable devouring flames crawl into and over every atom of your being!  Searing light tears into your party as follows: "+Object.entries(this.characterDamageDict); 
	}
}

class DarkStarTelegraph extends Telegraph {
	constructor() {
		super();
		DarkStarTelegraph.prototype.fxTagArray = ["explosion", "quake", "energy", "shadow"];
		DarkStarTelegraph.prototype.envTagArray = ["night", "stars"];
		DarkStarTelegraph.prototype.telegraphTemplateStringArray = [
			"All the lights on the Yawning God's pulsing and quivering carapace go out as one, [explosion].  Your claws scrabble for purchase as the strange void that is your reality at the moment, [quake], begins to rumble viciously.  [energy] flares, as [night] suffused with [shadow] and beneath [stars]; this is no place for a little mole!",
			"The dead eyes of the Yawning God bulge as its sprawling form convulses, [?env] a mere backdrop for [?fx].  A deeper darkness than any you've yet known blooms from beneath its scales, and all semblance of recognizable form vanishes in rumbling [shadow] that creeps towards you like a predatory [quake].",
			"The crooked snaggle-dagger-teeth of the Yawning God are surely intimidating, but what lies beyond is far worse: [shadow] upon a hopeless landscape of [night].  As you watch, your fur bristling with apprehension, this darkness begins pulsing with promises of [explosion]."
			];
		this.telegraphString = this.generateRandomTelegraph(this.telegraphTemplateStringArray);
	}
}
/// end yawning god abilities block ///

export class Entity {
	constructor(configObj) {
		this.id = configObj.id;
		this.name = configObj.name;
		Entity.prototype.spellsDict = {
			"defend": new Defend()
		}
	}
}

/**
 * Entity associated with the stalwart tenacity of adventuresome and benevolent explorers!
 */
export class Burrower extends Entity {
	constructor() {
		super({id: "burrower", name: "Burrower"});
		Burrower.prototype.spellsDict = {
			"warmest_hug": new WarmestHug(),
			"woolly_shield": new WoollyShield(),
			"burrow_furrow": new BurrowFurrow(),
			"deep_meditation": new DeepMeditation(),
			"shadowflare": new ShadowFlare(),
			"magma_blast": new MagmaBlast(),
			"static_bolt": new StaticBolt()
		}
		Object.assign(Burrower.prototype.spellsDict, Entity.prototype.spellsDict);
		// redefine mole's attack to restore MP
		Burrower.prototype.spellsDict["hero_attack"] = new HeroAttack();
	}
}

/**
 * An Entity associated with the unfathomable alienness of that which dwells in the darkness between stars above or in the molten depths of stone below.
 */
export class EldritchHorror extends Entity {
	constructor() {
		super({id: "eldritch_horror", name: "Eldritch Horror"});
		EldritchHorror.prototype.spellsDict = {
				"manyfold_embrace": new ManyfoldEmbrace(),
				"primordial_mandate": new PrimordialMandate(),
				"pestilence": new Pestilence(),
				"dark_star": new DarkStar(),
				"dummy_attack": new DummyAttack(),
				"pass_stunned": new PassStunned()
		}
	}
}

/**
 * An Entity associated with the evil things our fear insists lurk in the endless possibilities of nightscape
 */
export class HeartOfDarkness extends Entity {
	constructor() {
		super({id: "heart_of_darkness", name: "Heart of Darkness"});
		HeartOfDarkness.prototype.spellsDict = {
				"touch_of_void": new TouchVoid(),
				"consume": new Consume(),
				"brass_lantern": new BrassLantern(),
				"chill_beyond": new ChillBeyond(),
				"pass_stunned": new PassStunned()
		}
		Object.assign(HeartOfDarkness.prototype.spellsDict, Entity.prototype.spellsDict);
	}
}
    