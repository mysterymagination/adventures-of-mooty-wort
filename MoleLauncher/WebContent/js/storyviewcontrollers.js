import * as Items from "../lib/items.js";
import * as Characters from "../lib/characters.js";
import {Libifels} from "../lib/libifels.js";

export class StoryViewController {
	constructor(configObj) {
		this.name = configObj.name;
		this.itemManager = new Items.ItemManager();
		/**
		 * A string indicating which visual context the user is in, story or combat, which modifies the UI elements story changes are printed to.  
		 * todo: this blends story and combat VC a bit, but not too badly.  Moving a lot fo the item handlers up to ItemManager and having handles to our storyVC and combatVC in ItemManager along with a flag dictating how/to whom item usage should be reported might be better. 
		 */
		this.feedbackContext = "story";
		this.charactersDict = {
			"mole": new Characters.Mole(),
			"yawning_god": new Characters.YawningGod(),
			"grue": new Characters.Grue()
		};
		/**
		 * Boolean flags regarding simple game switches e.g. molerat_tickled: true
		 */
		this.eventFlags = {};
		/**
		 * String event ids mapped to the number of times they have occurred
		 */
		this.eventCount = {
			"daughter_ooze_conversations": 0
		};
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
		// todo: check that they don't already have something with this id
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
		// todo: check if the character actually has an item with this id
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
	/**
	 * Adds the value to a character quality in the story viewmodel
	 * @param qualityId string id of a character quality to change
	 * @param value number value to add to the quality
	 */
	addToCharacterQuality(qualityId, value) {
		console.log("There is no known way to add to character quality "+qualityId+" by "+value);
	}
	/**
	 * Subtracts the value from a character quality in the story viewmodel
	 * @param qualityId string id of a character quality to change
	 * @param value number value to subtract from the quality
	 */
	subtractFromCharacterQuality(qualityId, value) {
		console.log("There is no known way to subtract from character quality "+qualityId+" by "+value);
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
		// todo: add support for writing to story transcript or combat log depending on which view is active... would be better to have items that work both in and out of combat maybe take both story and combat viewcontrollers?  Maybe it would make sense to do like an item use content string in ItemManager and install a combat viewcontroller alongside the story viewcontroller in ItemManager?  Oh wait, ItemManager doesn't have VCs, rather the StoryViewController has an ItemManager currently.  Cleanest approach might be to refactor a bunch of the addItem/useActiveItem... function in StoryVC to be in ItemManager and then have ItemManager have a context field that controls whether its item mod functions visually apply to story and/or combat VC.  That could be a major refactor tho... I'm thinkin the path of least resistance, which is simply to have our endpoint impl boi here check for some inCombat flag I guess on the storyVC and then call static Combat.printCombatLog() stuff in that case instead of system.write()?
		switch(this.feedbackContext) {
		case "combat":
			break;
		case "story":
			default:
			this.undumSystem.write("<p>"+passageString+"</p>");
			break;
		}
	}
	appendChoice(choiceString) {
		super.appendChoice(choiceString);
		this.undumSystem.writeChoices(this.choiceStringArray);
	}
	addToCharacterQuality(qualityId, value) {
		switch(qualityId) {
		case "health":
			this.charactersDict.mole.stats.hp += value; 
			this.undumSystem.setQuality("health", story.charactersDict.mole.stats.hp);
			break;
		case "sanity":
			this.charactersDict.mole.stats.sanity += value; 
			this.undumSystem.setQuality("sanity", story.charactersDict.mole.stats.sanity);
			break;
		}
	}
	subtractFromCharacterQuality(qualityId, value) {
		switch(qualityId) {
		case "health":
			this.charactersDict.mole.stats.hp -= value; 
			this.undumSystem.setQuality("health", this.charactersDict.mole.stats.hp);
			break;
		case "sanity":
			this.charactersDict.mole.stats.sanity -= value; 
			this.undumSystem.setQuality("sanity", this.charactersDict.mole.stats.sanity);
			break;
		}
	}
}