//-----undum config-----//
/**
 * IFID
 * 
 * UUID://AD73E1D4-B6EF-4876-9099-BF0EDAF0B842//
 */
undum.game.id = "AD73E1D4-B6EF-4876-9099-BF0EDAF0B842";

/* A string indicating what version of the game this is. Versions are
 * used to control saved-games. If you change the content of a game,
 * the saved games are unlikely to work. Changing this version number
 * prevents Undum from trying to load the saved-game and crashing. */
undum.game.version = "1.0";

/* A variable that changes the fade out speed of the option text on
 * a mobile. */
undum.game.mobileHide = 2000

/* A variable that changes the options fade out speed. */
undum.game.fadeSpeed = 1500

/* A variable that changes the slide up speed after clicking on an
 * option. */
undum.game.slideUpSpeed = 500
//-----end undum config-----//

//-----undum extension-----//
/* A specialization of WordScaleQuality that uses the standard mole burrowing ordinal 
    * adjective scale (from 'surfacer' at -3 to 'delver' at +3). 
    */
   var BurrowAdjectivesQuality = function(title, opts) {
    undum.WordScaleQuality.call(this, title, [
        "surfacer".l(), "noodler".l(), "wornclawed".l(),
        "porpoise of the earth".l(), "tunnelfish".l(), "digger".l(), "delver".l()
    ], opts);
    if (!('offset' in opts)) this.offset = -3;
};
BurrowAdjectivesQuality.inherits(undum.WordScaleQuality);

//export API with undum
undum.BurrowAdjectivesQuality = BurrowAdjectivesQuality;
//-----end undum extension-----//

//-----game logic-----//
undum.game.situations = {
    main: new undum.SimpleSituation(
        "<h1>Of Moles and Holes</h1>\
        <img src='media/img/mole-opening.png' class='float_right'>\
        <p>The morning sun warms your snoot wonderfully as you breach shyly from your beloved burrow in The Humans' yard.  They're not great fans of yours because something something lawncare, but you're not troubled -- some folks have silly priorities and you know what matters: digging.  As it happens, though, The Big Human is approaching now, and he looks sort of grimly determined... and he's wielding a shovel like a club.  Perverting a sacred digging implement with the taint of violence is the darkest profanity, but you probably won't live long enough to lecture if you stick around here much longer.</p>\
        <p>What's your move?\
        <ul>\
            <li><a href='./fightHumans'>Fight the belligerent human!</a></li>\
            <li><a href='digEscapeHuman'>Dive and burrow!</a></li>\
        </ul>\
        </p>\
        ",
        {
            actions: {
                'fightHumans': "<p>With all the fury a gram velvety-fuzzed body can muster, you leap directly at The Human.  Of course, all animals have the firmware necessary to calculate the most efficient vector to a Human face for face-offs such as this, and you take his sight with your great digging claws before he pulls you off and smashes you to squelchy flinders on the merciless pavement of his driveway.</p>"
            }
        }
    ),
    digEscapeHuman: new undum.SimpleSituation(
        "<p>Tunnel for all you're worth!</p>"
    ),
    credits: new undum.SimpleSituation(
        "<ul>\
            <li>undum: https://github.com/idmillington/undum</li>\
            <li>mole-opening.png: https://pixabay.com/users/Beeki-2666/</li>\
        </ul>"
    )
}

/* The Id of the starting situation. */
undum.game.start = "main";

/* Here we define all the qualities that our characters could
 * possess. We don't have to be exhaustive, but if we miss one out then
 * that quality will never show up in the character bar in the UI. */
undum.game.qualities = {
    health: new undum.NumericQuality(
        "Health", {priority:"0001", group:'stats'}
    ),
    stamina: new undum.NumericQuality(
        "Stamina", {priority:"0002", group:'stats'}
    ),
    moleWhole: new BurrowAdjectivesQuality( 
        "<span title='One&apos;s ability to dig is not measured in kilograms of displaced dirt -- rather, it must take into account all the courage, curiosity, and tenacity required of tunnelers of all stripes.  What can your claws do?  Where can they take you?  We shall see!'>Mole Whole</span>",
        {priority:"0003", group:'stats'}
    )
};

// ---------------------------------------------------------------------------
/* The qualities are displayed in groups in the character bar. This
 * determines the groups, their heading (which can be null for no
 * heading) and ordering. QualityDefinitions without a group appear at
 * the end. It is an error to have a quality definition belong to a
 * non-existent group. */
undum.game.qualityGroups = {
    stats: new undum.QualityGroup(null, {priority:"0001"})
};

// ---------------------------------------------------------------------------
/* This function gets run before the game begins. It is normally used
 * to configure the character at the start of play. */
undum.game.init = function(character, system) {
    character.qualities.health = 10;
    character.qualities.stamina = 10;
    character.qualities.moleWhole = 0;
    system.setCharacterText("<p>You are starting on an exciting journey beneath the earth and beyond all reason.</p>");
};
//-----end game logic-----//