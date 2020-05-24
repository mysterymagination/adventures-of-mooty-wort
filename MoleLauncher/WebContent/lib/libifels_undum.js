import {Libifels} from "./libifels.js";
/**
 * exported API of Libifels for Undum containing both generic IF structures and hypertext adventure framework elements specific to Undum
 */
export class MoleUndum extends Libifels{
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