import {Libifels} from "./libifels.js";
/**
 * exported API of Libifels for Undum containing both generic IF structures and hypertext adventure framework elements specific to Undum
 */
export class MoleUndum extends Libifels{
	constructor() {
		// todo: add an equipment div horizontally opposite the inventory div for semblance of symmetry
		// todo: need Item and ItemManager data model classes to track the functionality of an item, its applicable targets, and which item is currently 'in use'
		// todo: need a util function handleItemUse() here that basically takes in the story ViewController (mootywortadv.game.en.js) and a clicked item entry string; this function will be called in response to onclick on the item anchor tag text nodes.  The handleItemUse() function will lookup the input item name in a map owned by ItemManager (who is owned by the story ViewModel) and call its onReady() fn, essentially meaning that the mole has pulled out the item from his compartment which may or may not do anything.  The handleItemUse will set the clicked item object as the activeItem in ItemManager.
		// todo: need util function handleItemUsedOn() that takes the story ViewModel object and a string identifying the in-story object that the user is trying to use the active item on.  This function will look up the active Item from ItemManager (from the story ViewModel) and run its onUse() fn with the target object string passed in.  From there... maybe switch over the exact string?  Some sort of descriptor thing that we could parse through more intelligently and even have kinda sorta generative gameplay out of e.g. you use the rubber ball on a hard surface => it bounces could be cool.
	}
}