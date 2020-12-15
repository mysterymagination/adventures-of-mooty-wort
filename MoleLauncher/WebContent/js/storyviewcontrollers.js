import * as Items from "../lib/items.js";
import * as Characters from "../lib/characters.js";
import {Libifels} from "../lib/libifels.js";

export class StoryViewController {
	constructor(configObj) {
		this.name = configObj.name;
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
	 * Append an array of choice strings to the player's game context
	 * @param choiceStringArray string array of new choices
	 */
	appendChoices(choiceStringArray) {
		this.choiceStringArray.concat(choiceStringArray);
	}
	/**
	 * Displays the current choice string array to the player in a manner dictated by the specific story paradigm
	 */
	showChoices() {
		console.log("No known way to display current choices: "+this.choiceStringArray);
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
	/**
	 * Writes the given string in a paragraph to either the story transcript or the combat log, depending on the current feedback context
	 * @param passageString the text to print
	 */
	writeParagraph(passageString) {
		this.undumSystem.write("<p>"+passageString+"</p>");
	}
	/**
	 * Uses the Undum System.writeChoices() API to write out this.choiceStringArray (which is expected to be an array of Situation ID strings)
	 */
	showChoices() {
		this.undumSystem.writeChoices(this.choiceStringArray);
	}
	addToCharacterQuality(qualityId, value) {
		switch(qualityId) {
		case "health":
			this.charactersDict.mole.stats.hp += value; 
			this.undumSystem.setQuality("health", this.charactersDict.mole.stats.hp);
			break;
		case "mana":
			this.charactersDict.mole.stats.mp += value; 
			this.undumSystem.setQuality("mana", this.charactersDict.mole.stats.mp);
			break;
		case "sanity":
			this.charactersDict.mole.stats.sanity += value; 
			this.undumSystem.setQuality("sanity", this.charactersDict.mole.stats.sanity);
			break;
		}
	}
	subtractFromCharacterQuality(qualityId, value) {
		switch(qualityId) {
		case "health":
			this.charactersDict.mole.stats.hp -= value; 
			this.undumSystem.setQuality("health", this.charactersDict.mole.stats.hp);
			break;
		case "mana":
			this.charactersDict.mole.stats.mp -= value; 
			this.undumSystem.setQuality("mana", this.charactersDict.mole.stats.mp);
			break;
		case "sanity":
			this.charactersDict.mole.stats.sanity -= value; 
			this.undumSystem.setQuality("sanity", this.charactersDict.mole.stats.sanity);
			break;
		}
	}
}