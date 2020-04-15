import Libifels from './libifels.js';
import * as Spellbook from "./spellbook.js"
/**
 * exported API of Libifels for Undum containing both generic IF structures and hypertext adventure framework elements specific to Undum
 */
class MoleUndum extends Libifels{
	constructor() {
	     // todo: this global function handler business is weird and (I'm fairly certain) unnecessary.  Might be cleaner make a custom Item class in JS that derives from something that can be the content of an anchor tag (HTML text element?) and has a name property and an onUse handler function, and then add those to the item_list ul.  Alternatively, maybe just shove a handler function into the li or div containing the text describing an item.  Regardless, we'd at least need a global CSS ID selector value for the currently active item, but otherwise could lose the weird global stuff here as well as ability to cleanly package up a particular item's behavior in an object instance so that items can be removed and re-added without having to copy-paste a mostly boilerplate handler function each time or naming a hundred different global handler functions that new item instances would refer back to.  Actually, said unique ID could be used as the key in a simple object map of string item name : item handler function data model to back the UI, and then the actual UI list items could just stay on their side of the bed; only 'disadvantage' there is that to add/remove items we'd need to hit both UI and data model separately, but then sep of data and view is desired anyway.  It'd be easy to write a util function here that hits both view and model for common add/remove ops.
	    /**
	     * Boolean flag to be set when the user clicks an item, indicating that a usage on something is pending
	     */
	    this.bUsingItem = false,
	    /**
	     * The string name of the last item activated
	     */
	    this.sUsedItemName = "",
	    /**
	     * Item usage handler function; it gets installed when the player clicks on an item to activate it (and bUsingItem flag is raised and sUsedItemName is set), and gets called on this libifels object when the target of the item usage is selected (meaning we have all the info we need) with the activated item name (retrieved from sUsedItemName here) and the target name we just learned 
	     * @param {string} itemName the item the player is trying to use
	     * @param {string} targetName the object the player is trying to use the item on
	     */
	    this.fnUsedItemHandler = function (itemName, targetName) {
	        system.write("<p>You can't use " + itemName + " on " + targetName + "</p>");
	    }
	    // todo: add actual spell definitions
	    this.spellsDict = {
	    	/**
	    	 * Not many realize that mole are venomous, because, being peaceful and lovey creatures, they so often choose not to employ it.  Most are willing even to die rather than risk killing, and thus will not use venom when fighting back against predators and similar common foebeasts.  When the sanctity of The Deepness is threatened and the ancient things from dark corners of mole memory stir, however...   
	    	 */
	        "mole_venom": new Spellbook.MoleVenom(),
	        /**
	         * It can do a body good to hug itself.  Go on, try it now.  This spell heals the mole by his 20+(1.5*pwr)
	         */
	        "warmest_hug": new Spellbook.WarmestHug(),
	        /**
	         * By bunching up his fur and concentrating so hard on its fundamental protections that it actually become armor, the mole is able to grant himself Mage Armor
	         */
	        "woolly_shield": new Spellbook.WoollyShield(),
	        /**
	         * With a fuzzily furrowed brow, the mole grants himself the Temper status
	         */
	        "burrow_furrow": new Spellbook.BurrowFurrow(),
	        /**
	         * By considering the complexities of The Deepness, the mole is able to grant himself Third Eye status
	         */
	        "deep_meditation": new this.Spell(),
	        /**
	         * Calling upon all the wisdom of his forebears, who were moles of course and not bears, the mole lashes out with an evocation of fiery darkness from The Pit's shapely bottom!  High cost spell that deals moderate fire damage based on the mole's pwr and lowers the target's res.
	         */
	        "shadowflare": new this.Spell({ id: "shadowflare", name: "Shadowflare" }),
	        /**
	         * Thrusting his mighty digging claw into the earth and calling out for aid with all his spirit, the mole summons up a wash of magma from the planet's molten core to engulf his foe.  This spell light fire damage based on mole's pwr and burns the target.
	         */
	        "magma_blast": new this.Spell({ id: "magma_blast", name: "Magma Blast" }),
	        /**
	         * Shuffling his little paws rapidly, the mole generates a bolt of static electricity; the density of his fur is quite shocking!  This deal light electric damage and also inflicts Stun.
	         */
	        "static_bolt": new this.Spell({ id: "static_bolt", name: "Static Bolt" }),
	    }
	}
}

export {MoleUndum};