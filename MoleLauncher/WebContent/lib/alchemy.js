import {Libifels} from "./libifels.js"

/**
 * A StatusEffect performs some behavior each round for a set duration in rounds.
 */
export class StatusEffect {
	constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.duration = config.duration;
        this.ticks = config.duration;
        this.isBuff = true;
        this.descriptors = [];
    } // end new instance ctor
	tickDown() {
		this.ticks--;
	}
	effect(afflictedCharacter) {
		console.log("status effect effect() unset for "+this.id);
	}
	reverseEffect(afflictedChar) {
        console.log("status effect reverseEffect() unset for "+this.id);
    }
} // end StatusEffect class def

/**
Defended increases a character's defensive attributes for 1 round 
*/
export class Defended extends StatusEffect {
	constructor() {
		super({id:"defended", name: "Defended", duration: 1});
		this.isBuff = true;
		this.descriptors.push("buff", "defense");
		Defended.prototype.imageUrl = 'images/status_effects/defended_effect.png';
	}
	effect(targetChar) {
	    targetChar.stats["def"] *= 2;
	    targetChar.stats["res"] *= 2;
	}
	reverseEffect(targetChar) {
	    targetChar.stats["def"] = targetChar.coreStats.def;
	    targetChar.stats["res"] = targetChar.coreStats.res;
	}
}

/**
 * Woolily Shielded increases a character's physical defense and magic resistance massively for 3 rounds 
 */
export class WoolilyShielded extends StatusEffect {
	/**
	 * @param sourceCharacter the character whose power is making the effected character woolily shielded
	 */
	constructor(sourceCharacter) {
		super({id:"woolily_shielded", name: "Woolily Shielded", duration: 3});
		this.isBuff = true;
		this.descriptors.push("buff", "defense", "resistance");
		this.sourceCharacter = sourceCharacter;
		WoolilyShielded.prototype.imageUrl = 'images/status_effects/woolilyshielded_effect.png';
	}
	effect(targetChar) {
	    targetChar.stats["def"] += Libifels.prettyDarnRound(
    		Math.max(Math.max(this.sourceCharacter.stats["def"], this.sourceCharacter.stats["res"]), 1) * 2
    	);
	    targetChar.stats["res"] += Libifels.prettyDarnRound(
	    	Math.max(Math.max(this.sourceCharacter.stats["def"], this.sourceCharacter.stats["res"]), 1) * 2
	    );
	}
	reverseEffect(targetChar) {
	    targetChar.stats["def"] = targetChar.coreStats.def;
	    targetChar.stats["res"] = targetChar.coreStats.res;
	}
}

/**
Defenseless halves a character's defensive attributes 
*/
export class Defenseless extends StatusEffect {
	constructor() {
		super({id:"defenseless", name: "Defenseless", duration: 3});
		this.isBuff = false;
		this.descriptors.push("debuff", "defense");
		Defenseless.prototype.imageUrl = 'images/status_effects/defenseless_effect.png';
	}
	effect(targetChar) {
	    targetChar.stats["def"] *= 0.5;
	    targetChar.stats["res"] *= 0.5;
	}
	reverseEffect(targetChar) {
	    targetChar.stats["def"] = targetChar.coreStats.def;
	    targetChar.stats["res"] = targetChar.coreStats.res;
	}
}

/**
Temper provides a simple ATK*2 for 3 turns
*/
export class Temper extends StatusEffect {
	constructor() {
		super({id:"temper", name: "Temper", duration: 3});
		this.isBuff = true;
		this.descriptors.push("buff", "offense");
		Temper.prototype.imageUrl = 'images/status_effects/temper_effect.png';
	}
	effect(targetChar) {
	    targetChar.stats["atk"] *= 2;
	}
	reverseEffect(targetChar) {
	    targetChar.stats["atk"] = targetChar.coreStats.atk;
	}
}

/**
Focus provides a simple PWR*2 for 3 turns
*/
export class Focus extends StatusEffect {
	constructor() {
		super({id:"focus", name:"Focus", duration: 3});
		this.isBuff = true;
		this.descriptors.push("buff", "offense");
		Focus.prototype.imageUrl = 'images/status_effects/focus_effect.png';
	}
	effect(targetChar) {
	    targetChar.stats["pwr"] *= 2;
	}
	reverseEffect(targetChar) {
	    targetChar.stats["pwr"] = targetChar.coreStats.pwr;
	}
}

/**
Third Eye provides a PWR*4 at cost of ATK/2 and DEF/2 for 3 turns
*/
export class ThirdEye extends StatusEffect {
	constructor() {
		super({id: "third_eye", name: "Third Eye", duration: 3});
		this.isBuff = true;
		this.descriptors.push("buff", "offense");
		ThirdEye.prototype.imageUrl = 'images/status_effects/thirdeye_effect.png';
	}
	effect(targetChar) {
	    targetChar.stats["pwr"] *= 4;
	    targetChar.stats["atk"] *= 0.5;
	    targetChar.stats["def"] *= 0.5;
	}
	reverseEffect(targetChar) {
	    targetChar.stats["pwr"] = targetChar.coreStats.pwr;
	    targetChar.stats["atk"] = targetChar.coreStats.atk;
	    targetChar.stats["def"] = targetChar.coreStats.def;
	}
}

/**
Regen heals a character by their RES each turn
*/
export class Regen extends StatusEffect {
	constructor() {
		super({id: "regen", name: "Regen", duration: 3});
		this.isBuff = true;
		this.descriptors.push("buff", "health");
		Regen.prototype.imageUrl = 'images/status_effects/regen_effect.png';
	}
	effect(targetChar) {
	    targetChar.stats["hp"] += targetChar.stats["res"];
	}
	reverseEffect(targetChar) {}

}

/**
Bloodlust quadruples STR in exchange for halving all mental attributes
*/
export class Bloodlust extends StatusEffect {
	constructor() {
		super({id: "bloodlust", name: "Bloodlust", duration: 2});
		this.isBuff = true;
		this.descriptors.push("buff", "offense");
		Bloodlust.prototype.imageUrl = 'images/status_effects/bloodlust_effect.png';
	}
	effect(targetChar) {
	    targetChar.stats["atk"] *= 4;
	    targetChar.stats["pwr"] *= 0.5;
	    targetChar.stats["res"] *= 0.5;
	    targetChar.stats["def"] *= 0.5;
	}
	reverseEffect(targetChar) {
		// restore stats BUT cycle 'em to keep things spiiiiiicy!
	    targetChar.stats["atk"] = targetChar.coreStats.def;
	    targetChar.stats["pwr"] = targetChar.coreStats.atk;
	    targetChar.stats["res"] = targetChar.coreStats.pwr;
	    targetChar.stats["def"] = targetChar.coreStats.res;
	}
}

/**
 * Frozen status immobilizes the player for 3 rounds, and each round the player can choose to burst out at the cost of a penalty to physical stats.  Mechanically, we treat the effect like poison except it only applies if the player chooses to break out; else the player's turn is skipped. 
 */
export class Frozen extends StatusEffect {
	constructor() {
		super({id: "frozen", name: "Frozen", duration: 3});
		this.isBuff = false;
		this.descriptors.push("debuff", "physical", "atk", "def");
		this.isBurst = false;
		Frozen.prototype.imageUrl = 'images/status_effects/frozen_effect.png';
	}
	/**
	 * Frozen's effect divides atk and def by whatever duration
	 * remains +1 for whatever duration remains iff the afflicted chooses to burst out.
	 * e.g. breaking out with...
	 * 3 turns remaining => atk and def reduced to 1/4
	 * 2 turns remaining => ... 1/3
	 * 1 turn remaining => ... 1/2
	 */
	effect(targetChar) {
		// record that afflicted char chose to burst out
		this.isBurst = true;
	    targetChar.stats["atk"] *= 0.5;
	    targetChar.stats["def"] *= 0.5;
	}
	reverseEffect(targetChar) {
		// only restore stats if we modded them due to burst
		if(this.isBurst) {
			targetChar.stats["atk"] = targetChar.coreStats.atk;
			targetChar.stats["def"] = targetChar.coreStats.def;
		}
	}
}

/**
Poison deals dmg each turn and halves atk/def stats
*/
export class Poison extends StatusEffect {
	constructor() {
		super({id: "poison", name: "Poison", duration: 3});
		this.isBuff = false;
		this.descriptors.push("debuff", "health");
		this.psnDmg = 0;
		Poison.prototype.imageUrl = 'images/status_effects/poison_effect.png';
	}
	effect(targetChar) {
	    targetChar.stats["atk"] *= 0.5;
	    targetChar.stats["def"] *= 0.5;
	}
	reverseEffect(targetChar) {
	    targetChar.stats["atk"] = targetChar.coreStats.atk;
	    targetChar.stats["def"] = targetChar.coreStats.def;
	}
}
/**
 * Burn deals dmg each turn and drops atk to 1/4
 */
export class Burn extends StatusEffect {
	constructor() {
		super({id: "burn", name: "Burn", duration: 3});
		this.isBuff = false;
		this.descriptors.push("debuff", "health", "elemental,fire");
		this.brnDmg = 0;
		Burn.prototype.imageUrl = 'images/status_effects/burn_effect.png';
	}
	effect(targetChar) {
	    targetChar.stats["atk"] *= 0.25;
	}
	reverseEffect(targetChar) {
	    targetChar.stats["atk"] = targetChar.coreStats.atk;
	}
}
/**
 * Stun causes the afflicted to miss their next turn
 */
export class Stun extends StatusEffect {
	constructor() {
		super({id: "stun", name: "Stun", duration: 2});
		this.isBuff = false;
		this.descriptors.push("debuff", "turns", "elemental:lightning");
		Stun.prototype.imageUrl = 'images/status_effects/stun_effect.png';
	}
}
// todo: initial vs. ongoing effect() methods?