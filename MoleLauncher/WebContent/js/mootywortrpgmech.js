// imports
import MoleUndum from '../lib/libifels_undum.js';
import * as Characters from '../lib/characters.js';
import Combat from '../lib/combat.js';
/*
 * todo: Add Lunar inspired telegraph hint (1:many, but not all) and induction (many similar:1) systems:
 * 1. (hint) "The grue sharpens its claws in a sliver of moonlight" -> he might use Quicksilver Cut, Shadow Slash, or Rake.
 * 2. (induction) "Crystalline shadow swirls around the grue", "Jagged amethyst thrusts through the grue's flesh, flashing in the firelight", and "Frost and stone come together to form a complicated lattice structure around the grue, which pulses ominously" -> these all mean that he's about to use Diamond Dust.
 * 
 * I love the Lunar 1:1 situation where one animation always indicates one ability, but a little uncertainty and/or complexity could really add to it.  Probably best place to shove this system into our current combat model would be at the top of a new round, after the Ai has decided what it's doing and before we process player input such that player can see the telegraph text before choosing their action.
 * todo: might be best as far as this is concerned to just have fixed turn order of player action followed by enemy action instead of speed since we don't have any speed modding abilities and that would complicate strats related to telegraphed moves.
 */

/**
 * Class responsible for defining the RPG mechanics of the Mooty Wort adventure and running combat
 */
class MootyWortRpgMech {
	constructor() {
		// instantiate library
		var lib = new MoleUndum();
		this.characters = {
		        "mole": new Characters.Mole(),
		        "yawning_god": new Characters.YawningGod(),
		        "grue": new Characters.Grue()
		}
		// establish Player party
	    this.party = [this.characters["mole"]];
		/**
		 * Current combat encounter manager
		 */
		this.combatArena = undefined;
	}
	// todo: combat and other setup
}
export {MootyWortRpgMech};