/**
 * Abstract class extended by anyone concerned with pushing data to and controlling behavior of views
 */
export class ViewController {
	/**
	 * Writes a given text string out to the text feedback UI for this ViewController; what this means and exactly
	 * how it works will be determined by the current ViewController subclass's override
	 * of this function and what its text display paradigm is.
	 * @param passageString a chunk of story text to write within a paragraph
	 */
	writeParagraph(passageString) {
		console.log("We don't know how to write out the passage string \""+passageString+"\"");
	}
}