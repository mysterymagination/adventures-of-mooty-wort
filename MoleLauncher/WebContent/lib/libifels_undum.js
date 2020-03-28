import Libifels from './libifels.js';
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
	}
}

/**
 * A class representing The Mole character
 */
MoleUndum.MoleCharacter = class MoleCharacter extends Libifels.Character {
	constructor() {
		/**
		 * Gender of the mole
		 */
		this.gender = "male";
		/**
		 * The mole's secondary type, a lesser destiny that modifies the primary
		 */
		this.sMoleMinorDestiny = "";
		/**
		 * The mole's primary type, and destiny he must fulfill
		 */
		this.sMoleMajorDestiny = "";
		/**
		 * String array of item names comprising the mole's inventory
		 */
		this.stringArrayInventory = [];
		/**
		 * An ordinal label describing the mole's categorical caliber as an Underwere:
		 * -3 -> "surfacer", one who really shouldn't be under anyplace much less Underwere. 
		 * -2 -> "noodler", one who dabbles in delving without much skill.
		 * -1 -> "wornclawed", one who is experienced (although experience does not equate to skill) in dabbling at delving and has learned from MANY mistakes. 
		 * 0 -> "underwere", a competent traveler of the Deepness.
		 * 1 -> "tunnelfish", one who is naturally at home burrowing.
		 * 2 -> "digger", a true artisan of burrows; one who is both skilled at digging and understands the philosophy of delving deep dwellings.
		 * 3 -> "delver", a subterranean adventurer extraordinaire!
		 */
		this.ordinalUnderwere = 0;
		
		// rpg mech props
		this.stats["maxHP"] = 100;
		this.stats["maxMP"] = 100;
		this.stats["maxSanity"] = 100;
		this.stats["hp"] = this.stats["maxHP"];
		this.stats["mp"] = this.stats["maxMP"];
		this.stats["sanity"] = this.stats["maxSanity"];
		this.stats["atk"] = 10;
		this.stats["def"] = 10;
		this.stats["pwr"] = 10;
		this.stats["res"] = 10;
		this.entity = new Libifels.Entity({ name: "Burrower" });
	}
	
}

export {MoleUndum};