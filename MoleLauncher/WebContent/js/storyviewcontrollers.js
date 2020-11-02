import * as Items from "../lib/items.js";
export class StoryViewController {
	constructor(configObj) {
		this.name = configObj.name;
		this.itemManager = new Items.ItemManager();
		this.charactersDict = {
			"mole": new Characters.Mole(),
			"yawning_god": new Characters.YawningGod(),
			"grue": new Characters.Grue()
		};
	}
	/**
	 * Writes a given text string out to the story text; what this means and exactly
	 * how it works will be determined by the current StoryViewController subclass's override
	 * of this function and what its story text display paradigm is.
	 */
	writeParagraph(passageString) {
		console.log("We don't know how to write out the passage string \""+passageString+"\"");
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
}