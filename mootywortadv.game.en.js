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
    /* hardcoded link choice -- I wanna figure out how to use Undum's awesome System.writeChoices() and System.getSituationIdChoices() to gen up these same options with literal style
    <p>What's your move?</p>\
        <p class='transient'><a href='./fight-humans'>Fight the belligerent human!</a></p>\
        <p class='transient'><a href='dig-escape-human'>Dive and burrow!</a></p>\
    */
    main: new undum.SimpleSituation(
        "",
        {
            // todo: hmm, seems you can't generate choices that are actions or situations with an action arg; it would be nice
            // to be able to do anything you can do with links with choice sets.  It looks like system.writeChoices() basically just 
            // makes links out of the situation ids anyway, so maybe write alternate functions that check for action link syntax
            // and format the link appropriately?  Maybe also add canChoose etc. functions to action...
            enter: function(character, system, from) {
                character.stringArrayInventory = [];
                system.write("<h1>Of Moles and Holes</h1>\
                <img src='media/img/mole-opening.png' class='float_right'>\
                <p>The morning sun warms your snoot as you breach shyly from your beloved burrow in The Humans' yard.  They're not great fans of yours because something something lawncare, but you're not troubled -- some folks have silly priorities and you know what matters: digging.</p>\
                <p>As it happens, though, The Big Human is approaching now, and he looks sort of grimly determined... and he's wielding a shovel like a club.  Perverting a sacred digging implement with the taint of violence is the darkest profanity, but you probably won't live long enough to lecture if you stick around here much longer.  Still, you feel compelled to <a href='./fight-humans'>stand up for yourself and all creatures of the deep</a>.</p>\
                ");
                system.writeChoices(["dig-escape-human"]);
            },
            actions: {
                'fight-humans': function(character, system, action) {
                    system.write(
                        "<p>You cock your snout at the approaching human questioningly, crossing your little paws with their giant claws in a peaceful but steadfast manner.  As the human reaches you and raises his shovel to strike, you realize he cares nothing for diplomacy and is intent on bringing violence to your non-violent protest. You must defend yourself!</p>\
                        <p>With all the fury a 100g velvety-fuzzed body can muster, you leap directly at The Human.  Of course, all animals have the firmware necessary to calculate the most efficient vector to a human face for face-offs such as this, and you take his sight with your great digging claws before he pulls you off and smashes you to squelchy flinders on the merciless pavement of his driveway.</p>"
                    );
                    system.doLink('death');
                }
            }
        }
    ),
    "dig-escape-human": new undum.SimpleSituation(
        "",
        {
            enter: function(character, system, from) {
                system.write(
                    "<p>Tunnel for all you're worth!  Fast as a bolt of velvety black lightning and three times as smooth, you turn 'round and disappear into your burrow before the human can attack.  The sound of curses and the smashing of a shovel upon dirt chase you down, and the light from the surface abruptly vanishes.  This severance of light and the tether to surface matters (mundane but usually safe) that it represents is no problem for you; your people, the Underwere, are built for the darkness that suffuses the deep places of this and all worlds.  The Deepness.  The humans can keep their familiar sunny routines -- yours is a destiny of discovery!</p>"
                    );
                    system.writeChoices(["basement1_hub"]);
            },
            optionText: "Dig, dig! Escape!"
        }
    ),
    "basement1_hub": new undum.SimpleSituation(
        "",
        {
            optionText: "Burrow towards the Upper Layers of The Deepness",
            enter: function(character, system, from) {
                system.write(
                    "<p>The surface-adjacent soil of the Upper Layers lacks the true warmth of the earth's molten core; its sun-bleached strangeness fills you with unease.</p>"
                );
                system.writeChoices(system.getSituationIdChoices("#basement1_creatures"));
            },
            tags: ["tunnel_hub_basement1"]
        }
    ),
    "test_action_forwarding_situation": new undum.SimpleSituation(
        "",
        {
            enter: function(character, system, from) {
                system.doLink("basement1_fuzzy_caterpillar/look-substance");
            },
            optionText: "testing forwarded action",
            tags: ["test_forwarded_action"]
        }
    ),
    "basement1_fuzzy_caterpillar": new undum.SimpleSituation(
        "",
        {
            enter: function(character, system, from) {
                this.iDeepnessLevel = 1;
                var sDesc = "Almost as soon as your claws begin shoveling the slightly more acidic soil away from your path and behind your rotund rump, your tunnel converges with that of one fuzzy caterpillar.";
                if(!this.bVisited) {
                    this.bVisited = true;
                } else {
                    sDesc = "Here again we find ourselves snout to mandibles with a fairly unfuzzy caterpillar.";
                }
                system.write(
                    "<p>" + sDesc + "  He wiggles wonderingly, clearly gripped by some fascination. He's shedding copious amounts of <a href='./take-fuzz' class='once'>spiny-looking fuzz</a> all over, and is rapidly looking not so very fuzzy at all.  The shed fuzz trembles ominously.  The fuzzless flesh beneath is pallid and striated with <a href='./look-substance'>sickly black veins</a>.</p>"
                );
                system.writeChoices(system.getSituationIdChoices(["#caterpillar_queries", "#tunnel_hub_basement"+this.iDeepnessLevel, "#test_forwarded_action"]));
            },
            optionText: "You can feel the vibrations from the *swish* *swish* *scrunch* of a worm-like body a few mole-lengths behind a patch of musty loam your whiskers just brushed against",

            actions: {
                'take-fuzz': function(character, system, action) {
                    sFuzzMessage = "As you pluck a discarded fuzz filament off the ground, it twists around of its own accord and stabs you in the snout!  "
                    
                    // system.setQuality() will update the value and its UI representation together
                    system.setQuality("health", character.qualities.health - character.qualities.maxHealth * 0.1);
                    console.log("health is "+character.qualities.health);
                    if(!character.stringArrayInventory.includes("fuzz")) {
                        if(character.qualities.health > 0) {
                            system.write("<p>" + sFuzzMessage + "Stinging pain shoots through your body as the caterpillar's venom spreads, but you're a hardy bloke and shake it off easily.  Tucking the fuzz away in your compartment, you turn to the caterpillar and his wiggliness.</p>");
                            
                            character.stringArrayInventory.push("fuzz");
                        } else {
                            system.write(sFuzzMessage+"</p>");
                            system.doLink('death');
                        }
                    } else {
                        system.write("<p>The fuzz already in your pack is vibrating in a worrisome manner; you don't need more of the stuff.</p>");
                    }

                    
                },
                'look-substance': function(character, system, action) {
                    system.write("<p>The veins appear to be both above and below the epidermis. They're filled with an oily substance that pulses feverishly when you look upon it, as if sensing your attention and eager to know you; you're almost certain that's not what caterpillars normally look like naked.</p>")
                }
            },
            tags: ["basement1_creatures", "character_interaction_hub"]
        }
    ),
    "basement1_fuzzy_caterpillar_you_ok": new undum.SimpleSituation(
        "",
        {
            optionText: "You OK, buddy?",
            enter: function(character, system, from) {
                system.printBuffer = "The caterpillar stops wiggling when you speak and his head twisssssts ever so slowly around to face you... 270 degrees.  He's an invertebrate and all, but that's not really a thing caterpillars usually do, right?  \"Greetings, moleson.  I am better than ever before, for today I know the glory of the Rapturous Rumble!\"";
                /* so the problem with this is that I wanna say similar stuff in multiple branches of questioning.  Best way to handle that is to fork at diffs and then merge back into a mainline when the situation becomes common again.  If we write out at each point however, our formatting will be awful so I'm going to see how annoying using a printBuffer in the system object is.
                system.write(
                    "<p>The caterpillar stops wiggling when you speak and his head twisssssts ever so slowly around to face you... 270 degrees.  He's an invertebrate and all, but that's not really a thing caterpillars usually do, right?  \"Greetings, moleson.  I am better than ever before, for today I know the glory of the Rapturous Rumble!\"  He lies down on the ground and extends his many feet toward the tunnel walls in an effort to maximize the surface area of his flesh in contact with the soil. \"It begins, mighty mole.  You are the key to it all, the keystone in the arch leading to everlasting paradise and power for Dwellers in the Deep!  Can't you feel it whispering your name?!  Oh how I envy you!\"  With this he begins rolling around, leaving behind swathes of fuzz.</p>"
                );
                */

                // in this case, since it's really sort of a forked helper situation that has no standalone capabilities and is short, it makes sense to hop right over to the merge point
                system.doLink("basement1_fuzzy_caterpillar_rapture");
            },
            tags: ["caterpillar_queries"]
        }
    ),
    "basement1_fuzzy_caterpillar_whats_so_interesting": new undum.SimpleSituation(
        "",
        {
            optionText: "Heya.  What's so interesting?",
            enter: function(character, system, from) {
                system.printBuffer = "\"Why the rumbliest rumbly rumble, of course!  Can't you feel it calling? The Rapturous Rumble is calling us all, but it wants you most of all.  You must feel the scintillating harmonics!\"  The caterpillar taps several dozen feet in time with some sort you cannot hear and clacks his mandibles at you in a smile that suggests murderous envy.";

                // in this case, since it's really sort of a forked helper situation that has no standalone capabilities and is short, it makes sense to hop right over to the merge point
                system.doLink("basement1_fuzzy_caterpillar_rapture");
            },
            tags: ["caterpillar_queries"]
        }
    ),
    "basement1_fuzzy_caterpillar_rapture": new undum.SimpleSituation(
        "",
        {
            enter: function(character, system, from) {
                system.write(
                    "<p>"+system.printBuffer+"  He lies down on the ground and extends his many feet toward the tunnel walls in an effort to maximize the surface area of his flesh in contact with the soil. \"It begins, mighty mole.  You are the key to it all, the keystone in the arch leading to everlasting paradise and power for Dwellers in the Deep!  Can't you feel it whispering your name?!  Oh how I envy you!\"  With this he begins rolling around, leaving behind swathes of fuzz.</p>"
                );
                system.doLink("basement1_fuzzy_caterpillar");
            },
            tags: ["convo_tree_leaf"]
        }
    ),
    "basement1_bulbous_spider_first_entry": new undum.SimpleSituation(
        "",
        {
            enter: function(character, system, from) {
                system.write(
                    "<p>As you shovel pebbles away from your questing snout, the vision of a rolly-polly spider struggling with some sort of urn enters your reality.  The urn is transparent and you can see a viscous rusty liquid sloshing lazily about inside.  It's sealed by a stone stopper that glows red as the heart of all magma when the spider strains against it.  Before you can speak, she slips on the slick soil and rolls onto her voluminous backside... and keeps rolling: the tunnel you've entered has a gentle but insistent curvature that seems just right to keep the poor arachnid rolling forever.  Well, not forever of course, as that would be physically impossible, but longer than a spider's lifespan so the point is kinda moot.  Her thicket of frantically scrabbling legs is strangely hypnotic.</p>"
                );
                system.writeChoices(system.getSituationIdChoices("#spider_sayings"));
            },
            optionText: "The *scritch* *skitter* *scurry* *boink* of a an oblong arachnid sounds from beyond a small pebblefall by your rump",
            tags: ["basement1_creatures"]
        }
    ),
    "basement1_bulbous_spider_hub": new undum.SimpleSituation(
        "",
        {
            bVisited: false,
            bRolling: true,
            /**
             * Determines and returns the appropriate option text (choice title) for this situation
             */
            getOptionText: function() {
                if(this.bRolling) {
                    return "The spider's clawed hooves dig furiously and fruitlessly at the air as she flounders...";
                } else {
                    return "The spider stares at you adoringly from innumerable eyes, each one sparkling like a dark gemstone in moonlight...";
                }
            },
            enter: function(character, system, from) {
                var sDesc = "";
                if(this.bRolling) {
                    sDesc = "The poor dear is still helpless on her back; you could intervene if you wanted to be a gentlemole.";
                } else {
                    sDesc = "Innumerable glittering eyes blacker than the void between stars gaze adoringly into your own beady two, from a safe and creepingly increasing distance from the urn in your compartment.";
                }
                system.write(
                    "<p>"+sDesc+"</p>"
                );
                system.writeChoices(system.getSituationIdChoices("#spider_sayings").concat("basement1_hub"));
            },
            optionText: getOptionText(),
            tags: ["character_interaction_hub"]
        }
    ),
    "basement1_bulbous_spider_stop_rolling": new undum.SimpleSituation(
        "",
        {
            enter: function(character, system, from) {
                system.write(
                    "<p>As she comes down the far side of the tunnel, and as far before the apex of her descent as you can manage, you shove your shovel-like claw beneath her spinnerets.  With a *crunch*, the memory of which will sicken you for years to come, her mighty momentum is zeroed out on your paw.  As soon as she has a good few legs on the ground she hops away as if burned.  \"Ooh, wow!  Watch that wandering paw, mister.  But, um, thank you for resucing me!\" she chitters, her fangs and complicated-looking mandibles clacking upsettingly and a blush the fell scarlet of moonlit blood spreading over her cephalothorax.  \"This blasted urn has brought me nothing but trouble.  Would you like it?  Here, take it with my compliments!\" She hastily shoves the rusty urn into your compartment and skuttles away, her eyes still rolling in the cycle of her erstwhile dizzy purgatory.</p>"
                );
                character.stringArrayInventory.push("rusty_urn");
                system.doLink("basement1_bulbous_spider_hub");
            },
            canView: function(character, system, host) {
                return undum.game.situations.basement1_bulbous_spider_hub.bRolling;
            },
            optionText: "Step in and lend a massive digging claw to interrupt the cycle (she's a little thicc so it could be painful)",
            tags: ["spider_sayings"]
        }
    ),
    "basement1_ochre_ooze_first_entry": new undum.SimpleSituation(
        "",
        {
            enter: function(character, system, from) {
                system.write(
                    "<p>As you snuffle at the cracks to calculate their stability, the point rapidly renders itself moot when the floor collapses!  You tumble gracefully as a subterranean ballerina into a large cavern, landing solidly on your mighty rump and seamlessly rolling down onto all fours ready for action.  It seems you've dropped into the antechamber of an ooze warren; these creatures are notorious amongst Underwere for being voracious and none-too-particular about their diet.  Kind of eat first and consider indigestion-adjacent consequences later sort of fellows.  Lucky for you, this warren is mostly deserted, save for one massive blob of an ochre ooze bubbling away idly atop a dais of sorts made of pulsing rainbow crystal.  Considering the fact that you're still alive, it's likely this one isn't terribly hungry at the moment.</p>"
                );
                system.doLink("basement1_ochre_ooze_hub");
            },
            optionText: "With a *squelch* and a *fizz*, an ooze creature of some sort bubbles ponderously on the far side of some cracks in the soil beneath your paws",
            tags: ["basement1_creatures"]
        }
    ),
    "basement1_ochre_ooze_hub": new undum.SimpleSituation(
        "",
        {
            enter: function(character, system, from) {
                system.write(
                    "<p>Atop its crystal platform, the ochre ooze quivers and bubbles with interest.  Hunger will erode its curiosity, however, and with it will go civility.  Best hurry up and get gone from here.</p>"
                );
                system.writeChoices(system.getSituationIdChoices("#ooze_oratory").concat("basement1_hub"));
            },
            optionText: "The ooze oozes, patiently (at least for so long as it isn't hungry)...",
            tags: ["character_interaction_hub"]
        }
    ),
    "basement1_ochre_ooze_give_urn": new undum.SimpleSituation(
        "",
        {
            enter: function(character, system, from) {
                system.write(
                    "<p>As you proffer the urn, a tendril whips out from the ochre ooze and suddenly the urn has been removed from your possession.  The fur that the urn had been in contact with is seared away and hideous chemical burns now decorate the flesh beneath.  \"Our daughter!\" the ooze burbles in a thousand thousand voices all vengefully enraptured.  \"What a naughty little mynx you've been, trying to escape the collective.  We live for the Whole, child... and die for it.\"  With that, the ooze slams the urn into itself hard enough to propel it hopelessly deep within its caustic mass.  Though the urn's crystalline structure puts up a noble resistance, it quickly breaks down and you can see through the translucent ochre muck a smaller quantity of ooze wiggly free of the dissolving urn.  It, or she, you suppose, struggles frantically for a moment and then is still.  As you watch, the little ooze disappears into the mass of the large ooze, and in a few seconds no trace of her remains.</p>\
                    <p>\"We thank you, brother mole.  There is no compulsion to feed at present, so we are compelled instead to offer you a boon for your service.  Take this weapon with you; perhaps it will be of some use in fending off the will of The Rumble.\"  The ooze wiggles condescendingly.  \"Lesser, boring Underwere are fascinated by its promises, but we have all we need right here.\"  It shivers and a set of gold pawntlets (gauntlets for paws) dripping with continuous acid dig their way up from the soil under your ever-twitching nose.  Without waiting to see what else they can do autonomously, you don them.</p>"
                );
                system.setQuality("health", character.qualities.health - character.qualities.maxHealth * 0.1);
                var urnIndex = character.stringArrayInventory.indexOf("rusty_urn");
                character.stringArrayInventory.splice(urnIndex, 1);
            },
            canView: function(character, system, host) {
                return character.stringArrayInventory.includes("rusty_urn");
            },
            optionText: "The rusty urn you got from the spider vibrates violently in your compartment; it strikes you that the color was similar to the massive ooze before you.  Maybe you should offer it up?",
            tags: ["ooze_oratory"]
        }
    ),
    death: new undum.SimpleSituation(
        "<strong>💀 IT IS A SAD THING THAT YOUR ADVENTURES HAVE ENDED HERE 💀</strong>\
        <div class='transient'><a href='main'>Oh, Mother of Moles!  Try Again?</a></div>\
        "
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
    // todo: add inventory quality that renders as a nice unordered list and can ideally by clicked to effect a 'use clicked item' action
    health: new undum.NumericQuality(
        "Health", {priority:"0001", group:'stats'}
    ),
    sanity: new undum.NumericQuality(
        "Sanity", {priority:"0002", group:'stats'}
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
    character.qualities.maxHealth = 100;
    character.qualities.maxSanity = 100;
    character.qualities.health = character.qualities.maxHealth;
    character.qualities.sanity = character.qualities.maxSanity;
    character.qualities.moleWhole = 0;
    system.setCharacterText("<p>You are starting on an exciting journey beneath the earth and beyond all reason.</p>");
};
//-----end game logic-----//