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
	 * Empties the boolean eventFlags map and resets the counts of everything in eventCount
	 */
	resetStoryEvents() {
		this.eventFlags = {};
		for(const eventId in this.eventCount) {
			this.eventCount[eventId] = 0;
		}
	}
	/**
	 * Resets the state of all Characters in charactersDict
	 */
	resetStoryCharacters() {
		for(const [characterId, character] of Object.entries(this.charactersDict)) {
			this.charactersDict[characterId].resetStatus();
		}
	}
	/**
	 * Resets all story object models and views in preparation for a new game session
	 */
	resetStory() {
		this.resetStoryEvents();
		this.resetStoryCharacters();
		this.choiceStringArray = [];
		this.syncPlayerQualities();
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
	 * @param additionalChoicesArray string array of new choices
	 */
	appendChoices(additionalChoicesArray) {
		this.choiceStringArray = this.choiceStringArray.concat(additionalChoicesArray);
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
	/**
	 * Warps player to the given location
	 * @param locationString string identifying a location
	 */
	travelTo(locationString) {
		console.log("There is no known way to travel to "+locationString);
	}
	/**
	 * Ensures the player character stats views are up to date with its data model
	 */
	syncPlayerQualities() {
		console.log("There is no known way to sync player quality views");
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
	/**
	 * Adds the given value to the given player quality id string via Undum's System.setQuality, which will update the character side panel
	 * @param qualityId the quality id string
	 * @param value a number to be added to the named quality
	 */ 
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
		case "moleWhole":
			this.charactersDict.mole.stats.shovelry += value;
			// every 10 points of shovelry increases moleWhole by 1 rank
			this.undumSystem.setQuality("moleWhole", Math.floor(this.charactersDict.mole.stats.shovelry/10.0));
			break;
		}
	}
	/**
	 * Subtracts the given value from the given player quality id string via Undum's System.setQuality, which will update the character side panel
	 * @param qualityId the quality id string
	 * @param value a number to be subtracted from the named quality
	 * @return true if a terminal condition has been met after the subtraction, false otherwise
	 */
	subtractFromCharacterQuality(qualityId, value) {
		switch(qualityId) {
		case "health":
			this.charactersDict.mole.stats.hp -= value; 
			this.undumSystem.setQuality("health", this.charactersDict.mole.stats.hp);
			return this.checkTerminals();
		case "mana":
			this.charactersDict.mole.stats.mp -= value; 
			this.undumSystem.setQuality("mana", this.charactersDict.mole.stats.mp);
			return false;
		case "sanity":
			// madness mail halves sanity damage
			if(this.eventFlags.madness_mail) {
				value /= 2;
			}
			this.charactersDict.mole.stats.sanity -= value; 
			this.undumSystem.setQuality("sanity", this.charactersDict.mole.stats.sanity);
			return this.checkTerminals();
		case "moleWhole":
			this.charactersDict.mole.stats.shovelry -= value;
			// every 10 points of shovelry lost decreases moleWhole by 1 rank
			this.undumSystem.setQuality("moleWhole", Math.floor(this.charactersDict.mole.stats.shovelry/10.0));
			return false;
		}
	}
	/**
	 * Invokes Undum's system.doLink(location)
	 * @param locationString Situation id string 
	 */
	travelTo(locationString) {
		this.undumSystem.doLink(locationString);
	}
	/**
	 * Calls Undum System.setQuality() on health, mana, and sanity to keep us in sync with combat
	 */
	syncPlayerQualities() {
		const stats = this.charactersDict.mole.stats;
		this.undumSystem.setQuality("health", Math.ceil(stats.hp));
		this.undumSystem.setQuality("mana", Math.ceil(stats.mp));
		this.undumSystem.setQuality("sanity", Math.ceil(stats.sanity));
		this.checkTerminals();
	}
	/**
	 * Checks to see if player character qualities health and/or sanity have reached their terminal level, ending the game in death
	 * @return true if a terminal quality condition is met, false otherwise
	 */
	checkTerminals() {
		// story death/madness processing
		/**
		 * *sigh* good ol' tech debt... this is much easier than trying to marshal my calls to updateCharacterData in the combat VC more carefully.
		 * todo: look into removing the call to updateCharacterData in the bottom of enemy spell VFX proc since we know we'll be proceeding to new round state anyway? 
		 */
		if(!this.eventFlags.terminal_message_printed) {
			if(this.charactersDict.mole.stats.hp <= 0) {
				this.writeParagraph("Your lifeblood has run out...");
				this.travelTo("death");
				this.eventFlags.terminal_message_printed = true;
			} else if(this.charactersDict.mole.stats.sanity <= 0) {
				this.writeParagraph("There's an audible *SNAP* as your mind breaks apart in a fractal pattern of ruination...");
				this.travelTo("death");
				this.eventFlags.terminal_message_printed = true;
			}
		}
		// coerce to bool
		return !!this.eventFlags.terminal_message_printed;
	}
}