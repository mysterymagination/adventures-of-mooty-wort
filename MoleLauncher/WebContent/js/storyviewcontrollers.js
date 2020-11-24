import * as Items from "../lib/items.js";
import * as Characters from "../lib/characters.js";
import {Libifels} from "../lib/libifels.js";

export class StoryViewController {
	constructor(configObj) {
		this.name = configObj.name;
		this.itemManager = new Items.ItemManager();
		this.charactersDict = {
			"mole": new Characters.Mole(),
			"yawning_god": new Characters.YawningGod(),
			"grue": new Characters.Grue()
		};
		/**
		 * Boolean flags regarding game switches e.g. molerat_tickled: true
		 */
		this.eventFlags = {};
		/**
		 * An array of strings representing choices available to the player
		 */
		this.choiceStringArray = [];
	}
	/**
	 * Writes a given text string out to the story text; what this means and exactly
	 * how it works will be determined by the current StoryViewController subclass's override
	 * of this function and what its story text display paradigm is.
	 * @param passageString a chunk of story text to write within a paragraph
	 */
	writeParagraph(passageString) {
		console.log("We don't know how to write out the passage string \""+passageString+"\"");
	}
	/**
	 * Append a choice to the player's game context
	 * @param choiceString string describing the new choice
	 */
	appendChoice(choiceString) {
		this.choiceStringArray.push(choiceString);
	}
	/**
	 * Adds the given item to the given character's inventory in model and view
	 * @param character the Character object who should be receiving the Item
	 * @param item the Item object we want to add to the Character
	 */
	addItem(character, item) {
		const listItemTag = document.createElement('li');
		listItemTag.id = item.id;
		listItemTag.onclick = () => {
			this.activateItem(item.id);
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
		const listItemTag = document.getElementById(item.id);
		while (listItemTag.firstChild) {
			listItemTag.removeChild(listItemTag.lastChild);
		}
		listItemTag.remove();
		if(this.itemManager.activeItemId === item.id) {
			this.itemManager.activeItemId = null;
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
	 * @param itemId the id string of the item we want to activate
	 */
	activateItem(itemId) {
		this.itemManager.activeItemId = itemId;
		const listItemTag = document.getElementById(itemId);
		listItemTag.className = 'highlight_simple';
	}
	/**
	 * Uses the active item on the given string target
	 * @param targetString a text string from the story that is to be the target Y of a 'use X on Y' scenario
	 */
	activeItemUseOn(targetString) {
		const activeItemId = this.itemManager.activeItemId;
		if(activeItemId) {
			const listItemTag = document.getElementById(activeItemId);
			listItemTag.classList.remove('highlight_simple');
			Libifels.findInventoryItem(this.charactersDict.mole, activeItemId).useOn(this, targetString);
			this.itemManager.activeItemId = null;
		}
	}
}
/**
 * StoryViewController subclass for writing story text passages into an Undum transcript
 */
export class UndumStoryViewController extends StoryViewController {
	constructor(undumSystem) {
		super({name: "UndumStoryViewController"});
		this.undumSystem = undumSystem;
	}
	writeParagraph(passageString) {
		this.undumSystem.write("<p>"+passageString+"</p>");
	}
	appendChoice(choiceString) {
		super.appendChoice(choiceString);
		this.undumSystem.writeChoices(this.choiceStringArray);
	}
}