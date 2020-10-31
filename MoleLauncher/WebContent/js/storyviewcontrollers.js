import * as Items from "../lib/items.js";
export class StoryViewController {
	constructor() {
		this.itemManager = new Items.ItemManager();
	}
	// todo: generic interface functions
}
export class UndumStoryViewController extends StoryViewController {
	// todo: undum specific story text control fns
}