/**
 * Libifels, as in lib Interactive Fiction Entity Logic System, provides utility functions and classes for Interactive Fiction in JS
 */
export class Libifels {
    /**
     * Adds the given element to an array iff its string rep is not present in the array yet
     * @param array the array we're modifying
     * @param element the string (or object whose string rep) will be searched for using Array.prototype.includes()
     */
	static addUniqueStringToArray(array, element) {
        if (!array.includes(element)) {
            array.push(element);
        }
    }
    /**
     * Adds an object to an array, but only if it would be unique
     * @param array the array we're modifying
     * @param element the candidate to be pushed to the array
     * @param filterFn the boolean function used by Array.prototype.some() as the criterion in determining if any current elements of the array already match the incoming element
     */
    static addUniqueToArray(array, element, filterFn) {
        if (!array.some(filterFn)) {
            array.push(element);
        }
    }
    /**
    Get a random Character object from an array of Character objects that can't have the given Character ID
    */
    static randoCharacterFromArrayExceptId(characterArray, exceptCharacterId) {
        var eligibleCharacters = characterArray.filter(characterUnderTest => characterUnderTest.id != exceptCharacterId);
        var unluckyIndex = Math.floor(Math.random() * eligibleCharacters.length);
        return eligibleCharacters[unluckyIndex];

    }
    /**
    Applies the combat status effect to the given character, adding it to their list of statuses and triggering its effect fn
    @param character the recipient of the effect
    @param effect the status effect to apply
    */
    static addUniqueStatusEffect(character, effect) {
        var statuses = character.statusEffects;
        if (!statuses.some(effectUnderTest => effect.id === effectUnderTest.id)) {
            statuses.push(effect);
            effect.effect(character);
        }
    }
    /**
    Applies the combat status effect to the given target character, adding it to their list of statuses and triggering its effect fn.
    The source character is the one who inflicted the status; this function should be used when a status effect's effect depends on the inflicting character.
    @param sourceCharacter the one who inflicted the status
    @param targetCharacter the recipient of the effect
    @param effect the status effect to apply
    */
    static addUniqueStatusEffectWithSource(sourceCharacter, targetCharacter, effect) {
        var statuses = targetCharacter.statusEffects;
        if (!statuses.some(effectUnderTest => effect.id === effectUnderTest.id)) {
            statuses.push(effect);
            effect.effect(sourceCharacter, targetCharacter);
        }
    }
    /**
    Checks a given character for a given status effect
    @param character the Character under test
    @param effectId the string id of the StatusEffect we're looking for
    @return true if the status effect is found, false otherwise
    */
    static hasStatusEffect(character, effectId) {
        return character.statusEffects.some(effectUnderTest => effectId === effectUnderTest.id);
    }
    /**
    Checks a given character for a given status effect and returns the discovered status effect instance
    @param character the Character under test
    @param effectId the ID of the StatusEffect we're looking for
    @return the status effect instance if found, otherwise undefined
    */
    static getStatusEffectById(character, effectId) {
        var statuses = character.statusEffects;
        return statuses.find(effectUnderTest => effectId === effectUnderTest.id);
    }
    /** 
     * find index of a particular character id in a character array
     * @param characterArray an array of Character objects
     * @param characterID the string id of a searched-for Character object
     */
    static findCharacterIndex(characterArray, characterID) {
        return characterArray.findIndex(character => character.id === characterID);
    }
    /** 
     * find a particular Character by id in a Character array
     * @param characterArray an array of Character objects
     * @param characterID the string id of a searched-for Character object
     * @return the first Character object whose id matched the input characterID, or undefined if none match
     */
    static findCharacterById(characterArray, characterID) {
        return characterArray.find(character => character.id === characterID);
    }
    /**
    Adds this character to the $party iff they are not already a member
    @param character Character object to be added
    */
    static addUniqueCharacterToParty(character) {
        var party = State.variables.party;
        if (!party.some(characterUnderTest => character.id === characterUnderTest.id)) {
            party.push(character);
        }
    }
    /**
    Returns a Character object from the array whose id matches the given id
    */
    static findCharacterInArrayById(characterId, array) {
        return array.find(characterUnderTest => characterId === characterUnderTest.id);
    }
    /**
    Returns true if any Character object from the array has an id that matches the given id
    */
    static isCharacterWithIdInArray(characterId, array) {
        return array.some(characterUnderTest => characterId === characterUnderTest.id);
    }
    /**
    Removes a Character from an array of Characters using splice()
    @param character the Character to be removed from the array
    @param characterArray the array of Characters
    */
    static removeCharacterFromArray(character, characterArray) {
        // find the index of the target character in the array
        var index = this.findCharacterIndex(characterArray, character.id);
        // splice the character out of the array; this modified the given array
        characterArray.splice(index, 1);
    }
    /**
     * Finds the last living character in the given array (first living character starting from back of the array)
     * @param characterArray array of Character objects
     */
    static findLastLivingCharacter(characterArray) {
        for (let index = characterArray.length - 1; index >= 0; index--) {
        	let currentCharacter = characterArray[index];
            console.log("findLastLivingCharacter; character with id " + currentCharacter.id + " is " + (currentCharacter.stats.hp > 0 ? "living" : "dead"));
            if (currentCharacter.stats.hp > 0) {
                return currentCharacter;
            }
        }
    }
    /**
     * Finds the first living character in the given array (first living character starting from front of the array)
     * @param characterArray array of Character objects
     * @return the first living character, or undefined if there are none
     */
    static findFirstLivingCharacter(characterArray) {
        for (let index = 0; index < characterArray.length; index++) {
            let currentCharacter = characterArray[index];
            console.log("findFirstLivingCharacter; character with id " + currentCharacter.id + " is " + (currentCharacter.stats.hp > 0 ? "living" : "dead"));
            if (currentCharacter.stats.hp > 0) {
                return currentCharacter;
            }
        }
        return undefined;
    }
    /**
     * Finds the first living character in the given array subsequent to index afterIndex 
     * @param characterArray array of Character objects
     * @param afterIndex the index after which we will look for a living character
     * @return the first living character subsequent to afterIndex, or undefined if there are none
     */
    static findFirstLivingCharacter(characterArray, afterIndex) {
        // ensure there is something at the afterIndex + 1, accounting for 0-based index
    	if(characterArray.length >= afterIndex+2) {
	    	for (let index = startingIndex+1; index < characterArray.length; index++) {
	            let currentCharacter = characterArray[index];
	            console.log("findFirstLivingCharacter; character with id " + currentCharacter.id + " is " + (currentCharacter.stats.hp > 0 ? "living" : "dead"));
	            if (currentCharacter.stats.hp > 0) {
	                return currentCharacter;
	            }
	        }
    	} 
    	return undefined;
    }
    /**
     * simulate a d20 roll
     */ 
    static rollD20() {
        return Math.floor(Math.random() * 20) + 1;
    }
    /** 
     * simulate a dN roll, where N is given by sides param
     * @param sides an integer number of dice sides e.g. 20 for a d20
     */
    static rollDie(sides) {
        return Math.floor(Math.random() * sides) + 1;
    }
    /** 
     * simulate a dM roll N times
     * @param numDice the number of dM to be rolled (N)
     * @param sides an integer number of dice sides e.g. 20 for a d20 (M)
     * e.g. 3d6
     * @return the aggregate total from all N dice rolls
     */
    static rollNDM(numDice, sides) {
    	var total = 0;
    	for(let i = 0; i < numDice; i++) {
    		total += this.rollDie(sides);
    	}
    	return total;
    }
    /** 
     * simulate a d% roll
     */
    static rollPercentage() {
        return Math.floor(Math.random() * 100) + 1;
    }
    /**
     * Removes the given status effect from the given character iff they are afflicted by it
     * @param character a Character object from whom the given status is to be removed
     * @param effect a StatusEffect object to remove from the given character
     */
    static removeStatusEffect(character, effect) {
        var effectIndex = character.statusEffects.findIndex(element => {
            return element.id === effect.id;
        });
        character.statusEffects.splice(effectIndex, 1);
    }
    /**
     * Approximately rounds the given floating point number to two decimal points of precision
     * @param floatingNum the floating point number that needs to be rounded
     * @return a floating point approximately rounded to 2 decimal places e.g. 1.34567 -> 1.35
     */
    static prettyDarnRound(floatingNum) {
    	return Math.round((floatingNum + Number.EPSILON) * 100) / 100;
    }
}