const spellbook = require('../MoleLauncher/WebContent/lib/spellbook.js');

/* todo: maybe hit these specific leaf node guys laaaater
test('Telegraph Darkstar', () => {
	var darkStarTele = new spellbook.DarkStarTelegraph();
	// todo: handle other string template possibilities
	// todo: ideally check for all possible tag replacement substrings as well;
	//  effectively checking for all combinations discounting ordering of anything
	expect(darkStarTele.telegraphString).toContain("The crooked snaggle-dagger-teeth of the Yawning God are surely intimidating, but what lies beyond is far worse");
});
*/

test('Description.parseTags() Simple Single Tag Test ', () => {
	// check that a super simple string template gets its single 
	//  tag replaced by a known single possibility replacement string.
	var testDesc = new spellbook.Description();
	var expectedResult = "this desc is weird because it is a placeholder test telegraph tag replacement string";
	var testStringTemplate = "this desc is weird because [test]";	
	var actualResult = testDesc.parseTags(testStringTemplate);
	console.log("Description.parseTags() test; actual result is {"+actualResult+"}");
	expect(actualResult).toBe(expectedResult);
});

test('Description.parseTags() Triple Tag Test ', () => {
	// check that a simple string template gets its three 
	//  tags replaced by a known single possibility replacement string.
	var testDesc = new spellbook.Description();
	var expectedResult = "this it is a placeholder test telegraph tag replacement string desc it is a placeholder test telegraph tag replacement string is weird because it is a placeholder test telegraph tag replacement string";
	var testStringTemplate = "this [test] desc [test] is weird because [test]";	
	var actualResult = testDesc.parseTags(testStringTemplate);
	console.log("Description.parseTags() triple tag test; actual result is {"+actualResult+"}");
	expect(actualResult).toBe(expectedResult);
});