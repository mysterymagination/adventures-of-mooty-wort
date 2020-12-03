const characters = require('../MoleLauncher/WebContent/lib/characters.js');
const battle = require('../MoleLauncher/WebContent/lib/combat.js');

test('Grue.chooseAbility() Consume Spam Switch Test ', () => {
	// todo: test whether grue switches over to chill_beyond after using consume 2x in a row
	// 1. create ablprobs obj that has consume at 1.0 
	// 2. call chooseAbility and ensure choice is consume
	// 3. call chooseAbility and ensure choice is consume
	// 4. call chooseAbility and ensure choice has failed over to chill_beyond
	const probs = {
		"consume": 1.0
	}
	const testGrue = new characters.Grue();
	const expectedResult1 = "consume";
	const expectedResult2 = "consume";
	const expectedResult3 = "chill_beyond";	
	
	// first choice should be consume
	const actualResult1 = testGrue.chooseAbility(probs);
	console.log("Grue.chooseAbility() Spam Switch test; actual result 1 is {"+actualResult1.id+"}");
	expect(actualResult1.id).toBe(expectedResult1);
	
	// second choice should be consume as well
	const actualResult2 = testGrue.chooseAbility(probs);
	console.log("Grue.chooseAbility() Spam Switch test; actual result 2 is {"+actualResult2.id+"}");
	expect(actualResult2.id).toBe(expectedResult2);
	
	// third choice should switch to chill_beyond
	const actualResult3 = testGrue.chooseAbility(probs);
	console.log("Grue.chooseAbility() Spam Switch test; actual result 3 is {"+actualResult3.id+"}");
	expect(actualResult3.id).toBe(expectedResult3);
});

/*
test('Grue.chooseAbility() Consume Spam Switch-Back Test ', () => {
	// todo: test whether the grue's consume timeout is ending as expected :
	// 1. create ablprobs obj that has consume at 1.0
	// 2. Hack the Grue so that his consumeTimeout field is at 2
	// 3. Hack the Grue so that his firstConsumeTimeoutTurn field is true
	// 4. run chooseAbility and ensure that touch_of_void is chosen
	// 5. run chooseAbility and ensure that chill_beyond is chosen
	// 6. run chooseAbility again and ensure consume is chosen
	var testDesc = new spellbook.Description();
	var expectedResult = "this desc is weird because it is a placeholder test telegraph tag replacement string";
	var testStringTemplate = "this desc is weird because [test_phrase]";	
	var actualResult = testDesc.parseTags(testStringTemplate);
	console.log("Description.parseTags() test; actual result is {"+actualResult+"}");
	expect(actualResult).toBe(expectedResult);
});
*/