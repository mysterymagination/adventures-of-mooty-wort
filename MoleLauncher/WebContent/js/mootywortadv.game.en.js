// imports
import {MootyWortRpgMech} from "./mootywortrpgmech.js";
import {MoleUndum} from "../lib/libifels_undum.js";
import {Combat} from "../lib/combat.js";
import {UndumStoryViewController} from "./storyviewcontrollers.js";
import * as Items from "../lib/items.js";

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
var BurrowAdjectivesQuality = function (title, opts) {
    undum.WordScaleQuality.call(this, title, [
        "surfacer".l(), "noodler".l(), "wornclawed".l(),
        "underwere".l(), "tunnelfish".l(), "digger".l(), "delver".l()
    ], opts);
    if (!('offset' in opts)) this.offset = -3;
};
BurrowAdjectivesQuality.inherits(undum.WordScaleQuality);

//export API with undum
undum.BurrowAdjectivesQuality = BurrowAdjectivesQuality;
//-----end undum extension-----//

//-----game logic-----//
// todo: story ViewController with Characters and ItemManager
// create RPG combat ViewController
undum.game.rpgMech = new MootyWortRpgMech();
undum.game.storyViewController = new UndumStoryViewController(undum.system);
undum.game.situations = {
    /* hardcoded link choice -- I wanna figure out how to use Undum's awesome System.writeChoices() and System.getSituationIdChoices() to gen up these same options with literal style
    <p>What's your move?</p>\
        <p class='transient'><a href='./fight-humans'>Fight the belligerent human!</a></p>\
        <p class='transient'><a href='dig-escape-human'>Dive and burrow!</a></p>\
    */
    main: new undum.SimpleSituation(
        "",
        {
            // at the point when we set optionText for the first time, the situation hasn't yet been added (I think) and thus comes up undefined.
            //sTitle: "mainSit",
            //optionText: undum.game.situations.main.opts.sTitle, // opts doesn't get stored, nor does optiontext
            //optionText: undum.game.situations.main.actions.sTitle, // actions is copied over.  TODO: does this work for whenever/however optiontext gets set? UPDATE: nope, main situation is not defined yet at that point.
            //optionText: this.sTitle, // todo: so since the optiontext is getting set before the situation object is even added to Undum's awareness, does that imply its this would refer to itself? UPDATE: I'm having trouble even getting at the optionText field -- it isn't copied over to the SimpleSituation object's fields during ctor, and the opts object is dropped after ctor (there is no obvious SimpleSituation.opts field that stores 'em all). 
            // UPDATE2: apparently keyword this in the context of creating key:value objects like this points to global object for some reason.  We actually do get a value in optionText via this.sTitle, but it's the function from undum that determines optionText rather than mainSit.  Setting optionText to a string literal gives the same result, since again this is actually the main.opts object which isn't stored and its optionText field isn't directly extracted.
            //
            // todo: hmm, seems you can't generate choices that are actions or situations with an action arg; it would be nice
            // to be able to do anything you can do with links with choice sets.  It looks like system.writeChoices() basically just 
            // makes links out of the situation ids anyway, so maybe write alternate functions that check for action link syntax
            // and format the link appropriately?  Maybe also add canChoose etc. functions to action...
            enter: function (character, system, from) {
                // back to baseline
            	undum.game.init(character, system);
                character.stringArrayInventory = [];
                system.write("<h1>Of Moles and Holes</h1>\
                <img src='images/mole-opening.png' class='float_right'>\
                <p>The morning sun warms your snoot as you breach shyly from your beloved burrow in The Humans' yard.  They're not great fans of yours because something something lawncare, but you're not troubled -- some folks have silly priorities and you know what matters: digging.</p>\
                <p>As it happens, though, The Big Human is approaching now, and he looks sort of grimly determined... and he's wielding a shovel like a club.  Perverting a sacred digging implement with the taint of violence is the darkest profanity, but you probably won't live long enough to lecture if you stick around here much longer.  Still, you feel compelled to <a href='./fight-humans'>stand up for yourself and all creatures of the deep</a>.</p>\
                ");
                system.writeChoices(["dig-escape-human"]);
            },
            actions: {
                // at the point when we set optintext for the first time, the situation hasn't yet been added (I think) and thus comes up undefined.
                sTitle: "mainSitActions",
                oSelf: this,
                testMethod: function () {
                    // this example works
                    return "hello from test method; our title is " + undum.game.situations.main.actions.sTitle;
                    /* this example does not work; apparently the this keyword in the context of defining an object in key:value form points to the Window object.
                     return "hello from test method; our title is "+oSelf.sTitle;
                    */
                },
                'fight-humans': function (character, system, action) {
                    // problem was that in the context in which our action functions is called, keyword this apparently refers to Window object.  So basically we need to fully qualify the object and method we want to call in this case. The key thing to remember is JS is all about the calling context rather than the called context:
                    /*
                    var obj = {
                        sExample: "test",
                        testMethod: function() {
                            console.log("our example member string says "+this.sExample);
                        }
                    }
                    obj.testMethod(); // this is OK because we are calling the testMethod fn on an instance of the object for which we expect it to be a method; that calling context is what makes it a method and specifically sets keyword this to point to the object instance.  If the testMethod function were invoked in another way though, keyword this could be different depending on the details.
                    */
                    //console.log("testMethod for main situation says: "+this.testMethod());
                    console.log("testMethod for main situation says: " + undum.game.situations.main.actions.testMethod());
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
            enter: function (character, system, from) {
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
            enter: function (character, system, from) {
                system.write(
                    "<p>The surface-adjacent soil of the Upper Layers lacks the true warmth of the earth's molten core; its sun-bleached strangeness fills you with unease.</p>"
                );
                system.writeChoices(system.getSituationIdChoices("#basement1_creatures").concat("basement2_hub"));
            },
            tags: ["tunnel_hub_basement1"]
        }
    ),
    "test_action_forwarding_situation": new undum.SimpleSituation(
        "",
        {
            enter: function (character, system, from) {
                system.doLink("basement1_fuzzy_caterpillar_hub/look-substance");
            },
            optionText: "testing forwarded action",
            tags: ["test_forwarded_action"]
        }
    ),
    "basement1_fuzzy_caterpillar_hub": new undum.SimpleSituation(
        "",
        {
            enter: function (character, system, from) {
                this.iDeepnessLevel = 1;
                var sDesc = "Almost as soon as your claws begin shoveling the slightly more acidic soil away from your path and behind your rotund rump, your tunnel converges with that of one fuzzy caterpillar.";
                if (!this.bVisited) {
                    this.bVisited = true;
                } else {
                    sDesc = "Here again we find ourselves snout to mandibles with a fairly unfuzzy caterpillar.";
                }
                system.write(
                    "<p>" + sDesc + "  He wiggles wonderingly, clearly gripped by some fascination. He's shedding copious amounts of <a href='./take-fuzz' class='once'>spiny-looking fuzz</a> all over, and is rapidly looking not so very fuzzy at all.  The shed fuzz trembles ominously.  The fuzzless flesh beneath is pallid and striated with <a href='./look-substance'>sickly black veins</a>.</p>"
                );
                system.writeChoices(system.getSituationIdChoices(["#caterpillar_queries", "#tunnel_hub_basement" + this.iDeepnessLevel]));
            },
            optionText: function () { return "You can feel the vibrations from the *swish* *swish* *scrunch* of a worm-like body a few mole-lengths behind a patch of musty loam your whiskers just brushed " + undum.game.situations.basement1_fuzzy_caterpillar_hub.actions.sSuffixTest },

            actions: {
                sSuffixTest: "against",
                'take-fuzz': function (character, system, action) {
                    sFuzzMessage = "As you pluck a discarded fuzz filament off the ground, it twists around of its own accord and stabs you in the snout!  "

                    if (!MoleUndum.isItemInInventory(character.mole, "pulsating_fuzz")) {
                        // system.setQuality() will update the value and its UI representation together
                        system.setQuality("health", character.qualities.health - character.stats.maxHealth * 0.1);
                        console.log("health is " + character.qualities.health);
                        if (character.qualities.health > 0) {
                            system.write("<p>" + sFuzzMessage + "Stinging pain shoots through your body as the caterpillar's venom spreads, but you're a hardy bloke and shake it off easily.  Tucking the fuzz away in your compartment, you turn to the caterpillar and his wiggliness.</p>");
                            // push the fuzz item to the mole's inventory
                            character.mole.inventory.push(new Items.PulsatingFuzz());
							// todo: refresh inventory UI
                        } else {
                            system.write(sFuzzMessage + "</p>");
                            system.doLink('death');
                        }
                    } else {
                        system.write("<p>The fuzz already in your pack is vibrating in a worrisome manner; you don't need more of the stuff.</p>");
                    }


                },
                'look-substance': function (character, system, action) {
                    system.write("<p>The veins appear to be both above and below the epidermis. They're filled with an oily substance that pulses feverishly when you look upon it, as if sensing your attention and eager to know you; you're almost certain that's not what caterpillars normally look like naked.</p>")
                },
                calculateHeading: function () {
                    return "A somewhat fuzzy caterpillar scooches and scrunches rhythmically here";
                }
            },
            heading: function () {
                return undum.game.situations.basement1_fuzzy_caterpillar_hub.actions.calculateHeading();
            },
            tags: ["basement1_creatures", "character_interaction_hub"]
        }
    ),
    "basement1_fuzzy_caterpillar_you_ok": new undum.SimpleSituation(
        "",
        {
            optionText: "You OK, buddy?",
            enter: function (character, system, from) {
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
            enter: function (character, system, from) {
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
            enter: function (character, system, from) {
                // from is given as the string id of the situation we came from
                if (from === "basement1_fuzzy_caterpillar_you_ok") {
                    // the cost of befriending madness is... fairly predictable
                    system.setQuality("Sanity", character.qualities.sanity - character.stats.maxSanity * 0.25);
                }
                system.write(
                    "<p>" + system.printBuffer + "  He lies down on the ground and extends his many feet toward the tunnel walls in an effort to maximize the surface area of his flesh in contact with the soil. \"It begins, mighty mole.  You are the key to it all, the keystone in the arch leading to everlasting paradise and power for Dwellers in the Deep!  Can't you feel it whispering your name?!  Oh how I envy you!\"  With this he begins rolling around, leaving behind swathes of fuzz.</p>"
                );
                system.doLink("basement1_fuzzy_caterpillar_hub");
            },
            tags: ["convo_tree_leaf"]
        }
    ),
    "basement1_bulbous_spider_hub": new undum.SimpleSituation(
        "",
        {
            enter: function (character, system, from) {
                var sDesc = "";
                // if we just entered for the first time, give the full deal
                if (!undum.game.situations.basement1_bulbous_spider_hub.actions.bVisited) {
                    sDesc = "As you shovel pebbles away from your questing snout, the vision of a rolly-polly spider struggling with some sort of urn enters your reality.  The urn is transparent and you can see a viscous rusty liquid sloshing lazily about inside.  It's sealed by a stone stopper that glows red as the heart of all magma when the spider strains against it.  Before you can speak, she slips on the slick soil and rolls onto her voluminous backside... and keeps rolling: the tunnel you've entered has a gentle but insistent curvature that seems just right to keep the poor arachnid rolling forever.  Well, not forever of course, as that would be physically impossible, but longer than a spider's lifespan so the point is kinda moot.";
                } else {
                    if (this.bRolling) {
                        sDesc = "The poor dear is still helpless on her back; you could intervene if you wanted to be a gentlemole.";
                    } else {
                        sDesc = "Innumerable glittering eyes blacker than the void between stars gaze adoringly into your own beady two, from a safe and creepingly increasing distance from the urn in your compartment.";
                    }
                }
                system.write(
                    "<p>" + sDesc + "</p>"
                );
                system.writeChoices(system.getSituationIdChoices("#spider_sayings").concat("basement1_hub"));
            },
            actions: {
                bVisited: false,
                bRolling: true,
                sRollingDesc: "The spider's clawed hooves dig furiously and fruitlessly at the air as she flounders...",
                sUnrolledDesc: "The spider stares at you adoringly from innumerable eyes, each one sparkling like a dark gemstone in moonlight...",
                /**
                 * Determines and returns the appropriate option text (choice title) for this situation
                 */
                calculateHeading: function () {
                    if (!this.bVisited) {
                        return "A massive spider rolls back and forth across the curve of the tunnel; her thicket of frantically scrabbling legs is strangely hypnotic.";
                    } else {
                        if (this.bRolling) {
                            return this.sRollingDesc;
                        } else {
                            return this.sUnrolledDesc;
                        }
                    }
                },
                /**
                 * Updates the host situation's optionText field
                 */
                updateOptionText: function () {
                    console.log("updateOptionText; this.bRolling says: " + this.bRolling);
                    if (this.bRolling) {
                        undum.game.situations.basement1_bulbous_spider_hub.optionText = this.sRollingDesc;
                    } else {
                        undum.game.situations.basement1_bulbous_spider_hub.optionText = this.sUnrolledDesc;
                    }
                }
            },
            heading: function () {
                return undum.game.situations.basement1_bulbous_spider_hub.actions.calculateHeading();
            },
            optionText: "The *scritch* *skitter* *scurry* *boink* of a an oblong arachnid sounds from beyond a small pebblefall by your rump",
            tags: ["basement1_creatures", "character_interaction_hub"]
        }
    ),
    "basement1_bulbous_spider_stop_rolling": new undum.SimpleSituation(
        "",
        {
            enter: function (character, system, from) {
                system.write(
                    "<p>As she comes down the far side of the tunnel, and as soon after her direction reverses as you can manage, you shove your shovel-like claw beneath her spinnerets.  With a *crunch*, the memory of which will sicken you for years to come, her mighty momentum is zeroed out on your paw.  As soon as she has a good few legs on the ground she hops away as if burned.</p>\
                    <p>\"Ooh, wow!  Watch that wandering paw, mister.  But, um, thank you for rescuing me!\" she chitters, her fangs and complicated-looking razor-edged mouth-parts clacking upsettingly and a blush the fell scarlet of moonlit blood spreading over her cephalothorax.  \"This blasted urn has brought me nothing but trouble.  Would you like it?  Here, take it with my compliments!\" She hastily shoves the rusty urn into your compartment and skuttles away, her eyes still rolling in the cycle of her erstwhile dizzy purgatory.</p>"
                );

                // now that she's bee unrolled, we want to update the flag and option text
                undum.game.situations.basement1_bulbous_spider_hub.actions.bRolling = false;
                //undum.game.situations.basement1_bulbous_spider_hub.actions.updateOptionText();
                console.log("spider rolling status after we've stopped her rolling: " + undum.game.situations.basement1_bulbous_spider_hub.bRolling);

                // player now has the ooze urn... hooray?
                $("#items_list").append("\
                                <li>\
                                    <div class='item' id='item_urn'>\
                                    <a onclick='\
                                        undum.removeHighlight($(\".item\"));\
                                        undum.addHighlight($(\"#item_urn\"));\
                                        libifels_undum.bUsingItem = true;\
                                        libifels_undum.sUsedItemName = \"urn\";\
                                    '>Rusty Urn of Ooze</a>\
                                    </div>\
                                </li>");
                character.stringArrayInventory.push("rusty_urn");
                system.doLink("basement1_bulbous_spider_hub");
                //system.writeChoices(["basement1_bulbous_spider_hub"]);
            },
            canView: function (character, system, host) {
                console.log("spider rolling status is " + undum.game.situations.basement1_bulbous_spider_hub.actions.bRolling);
                return undum.game.situations.basement1_bulbous_spider_hub.actions.bRolling;
            },
            optionText: "Step in and lend a massive digging claw to interrupt the cycle (she's a little thicc so it could be painful)",
            tags: ["spider_sayings"]
        }
    ),
    // todo: add some more spider sayings so we can see the hooves heading
    "basement1_ochre_ooze_first_entry": new undum.SimpleSituation(
        "",
        {
            enter: function (character, system, from) {
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
            enter: function (character, system, from) {
                system.write(
                    "<p>Atop its crystal platform, the ochre ooze quivers and bubbles and burbles with interest.  Hunger will erode its curiosity, however, and with it will go civility.  Best hurry up and get gone from here.</p>"
                );
                system.writeChoices(system.getSituationIdChoices("#ooze_oratory").concat("basement1_hub"));
            },
            actions: {
                bDaughterSacrified: false,
                calculateHeading: function () {
                    if (this.bDaughterSacrified) {
                        return "The monstrous amalgamate ooze swells and contracts contentedly, ignoring you";
                    } else {
                        return "An ochre ooze quivers nearby, somehow looking at your hungrily despite lacking eyes";
                    }
                }
            },
            heading: function () {
                return undum.game.situations.basement1_ochre_ooze_hub.actions.calculateHeading();
            },
            optionText: "The ooze oozes, patiently (at least for so long as it isn't hungry)...",
            tags: ["character_interaction_hub"]
        }
    ),
    "basement1_ochre_ooze_give_urn": new undum.SimpleSituation(
        "",
        {
            enter: function (character, system, from) {
                system.write(
                    "<p>As you proffer the urn, a tendril whips out from the ochre ooze and suddenly the urn has been removed from your possession.  The fur that the urn had been in contact with is seared away and hideous chemical burns now decorate the flesh beneath.  \"Our daughter!\" the ooze burbles in a thousand thousand voices all vengefully enraptured.  \"What a naughty little mynx you've been, trying to escape the collective.  We live for the Whole, child... and die for it.\"  With that, the ooze slams the urn into itself hard enough to propel it hopelessly deep within its caustic mass; gelatinous ripples expand silently out from the point of impact, strangely lovely in their perfect symmetry.  Though the urn's crystalline structure puts up a noble resistance, it quickly breaks down and you can see through the translucent ochre muck a smaller quantity of ooze writhe free of the dissolving urn.  It, or she, you suppose, struggles frantically for a moment and then is still.  As you watch, the little ooze disappears into the mass of the large ooze, and in a few seconds no trace of her remains.</p>\
                    <p>\"We thank you, brother mole.  There is no compulsion to feed at present, so we are compelled instead to offer you a boon for your service.  Take this weapon with you; perhaps it will be of some use in fending off the will of The Rumble.\"  The ooze wiggles condescendingly.  \"Lesser, boring Underwere, whose coverage of interests is woefully mired in the prosaic and pragmatic, are fascinated by its promises.  We, however, have all we need right here within ourselves... au naturale.\"  It shivers ostentatiously and a set of gold pawntlets (gauntlets for paws) dripping with continuous acid dig their way up from the soil under your ever-twitching nose.  Without waiting to see what else they can do autonomously, you don them.</p>"
                );
                system.setQuality("health", character.qualities.health - character.stats.maxHealth * 0.1);
                var urnIndex = character.stringArrayInventory.indexOf("rusty_urn");
                character.stringArrayInventory.splice(urnIndex, 1);
                $("#items_list").append("\
                                <li>\
                                    <div class='item' id='item_claws'>\
                                    <a onclick='\
                                        undum.removeHighlight($(\".item\"));\
                                        undum.addHighlight($(\"#item_claws\"));\
                                        libifels_undum.bUsingItem = true;\
                                        libifels_undum.sUsedItemName = \"claws\";\
                                    '>Dripping Caustic Claws</a>\
                                    </div>\
                                </li>");
                character.stringArrayInventory.push("acid_claws");
                character.stats.atk += 10;

                // flip the sac switch
                undum.game.situations.basement1_ochre_ooze_hub.actions.bDaughterSacrified = true;
                // todo: push acid claw ability?
            },
            canView: function (character, system, host) {
                return character.stringArrayInventory.includes("rusty_urn");
            },
            optionText: "The rusty urn you got from the spider vibrates violently in your compartment; it strikes you that the color was similar to the massive ooze before you.  Maybe you should offer it up?",
            tags: ["ooze_oratory"]
        }
    ),
    "basement2_hub": new undum.SimpleSituation(
        "",
        {
            enter: function (character, system, from) {
                var stringArrayChoices = ["basement1_hub", "basement3_encounter_yawning_god"];
                if (!undum.game.storyViewController.eventFlags.dark_mole) {
	                if (undum.game.storyViewController.eventFlags.molerat_tickled) {
	                    system.write(
	                        "<p>The molerat's riotous laughter shatters the chamber's calm, stabbing into the cool darkness like thorns through a rose assaulting a curious nose.  He's rolled well away from the <a href='./examine_oracle_opal'>massive carved opal</a> breaching outward from the ancient walls.</p>"
	                    );
	                    stringArrayChoices.concat("basement2_grue_hub");
	                } else {
	                    system.write(
	                        "<p>As your wiggly snout pushes through the last of the dry, acidic soil indicative of the near-surface Deepness and your whiskers sweep into the loamy goodness below, a strange sight greets you: there is a <a href='./check_molerat_target'>naked molerat</a>, perhaps the nakedest you've seen, twitching and clawing feebly at the gently convex surface of a <a href='./examine_oracle_opal'>massive carved opal</a> buried in the wall.  His claws have worn away to bloody stubs, but he persists all the same.</p>  <p>\"It calls to me...\"  He whimpers.  \"Sweet rumbly music, take my mind into your legion!  This corpse is a prison!\"</p><p>He seems frozen in place, his legs at once paralyzed and in ceaseless spasming motion.  No matter what you say, he doesn't acknowledge your presence.</p>"
	                    );
	                }
                } else {
                	// the depths are sealed... for now
                	stringArrayChoices = ["basement1_hub"];
                	// todo: molerat interaction options now that player has the powers of a Dark Mole
                	var awestruckMoleratString = "The Nakedest Molerat's laughter has ceased.  He cowers in a corner, his beady bloodshot eyes fixed, unblinking, upon you. \"You are... not what I was expecting.  Perhaps this form is intended to make your splendor comprehensible to my limited intellect?  It matters not -- please, free me!\"  He prostrates himself before you as best as his still-bleeding claw-stumps will allow.";
                	undum.game.storyViewController.writeParagraph(awestruckMoleratString);
                }
                system.writeChoices(stringArrayChoices);
            },
            actions: {
                "examine_oracle_opal": function (character, system, action) {
                    system.write(
                        "<p>Beneath the nakedest molerat's pathetic pawing and the resultant trails of dried blood you can make out an archaic script carved into the gem.  You could have sworn at first glance that it was unintelligible, but as you gaze longer it seems to resolve into the familiar common script of Underwere, if a bit more formal and stuffy than you're used to. It reads: </p>\
                        <div class='featured_text_centered'>\
                            Seek me in the darkest ways<br />\
                            Where all that is twists into a maze<br />\
                            Take of my flesh a horned crown<br />\
                            'Neath sea of night all light shall drown\
                        </div>\
                        <p>A quiver runs down your spine as you read these words, and something atavistic in your innermost being stirs.  Peering at the edges of the gem, where it is hidden again by impassable slate, you can make out what could be a fold of flesh with minute slots that suggest hair follicles.  An eyelid, perhaps, and the gem itself a gargantuan eye?  A lone gossamer strand of cultivated amethyst remains as its <a href='./take_eyelash'>last eyelash</a>.</p>"
                    );
                },
                "take_eyelash": function (character, system, action) {
                    system.write(
                        "<p>You carefully pluck the impossibly delicate crystal from its socket and place it snuggly in your compartment.</p>"
                    );
                    $("#items_list").append("\
                                <li>\
                                    <div class='item' id='item_lash'>\
                                    <a onclick='\
                                        undum.removeHighlight($(\".item\"));\
                                        undum.addHighlight($(\"#item_lash\"));\
                                        libifels_undum.bUsingItem = true;\
                                        libifels_undum.sUsedItemName = \"lash\";\
                                    '>Crystalline Last Lash</a>\
                                    </div>\
                                </li>");
                    character.stringArrayInventory.push("crystal_lash");
                },
                "check_molerat_target": function (character, system, action) {
                	// todo: call fuzz.useOn("nakedest molerat");
                    if (libifels_undum.bUsingItem) {
                        // call item handler with the second and final piece of information, the target being nakedest molerat!
                        libifels_undum.fnUsedItemHandler(system, libifels_undum.sUsedItemName, "nakedest molerat");
                    } else {
                        system.write("<p>Examining this nakedest of molerats yields little but subtle nausea.</p>");
                    }
                },
                calculateHeading: function () {
                    if (this.bTickled) {
                        return "The nakedest molerat rolls about in the musty dust, desperately euphoric in the throes of tickles";
                    } else {
                        return "A naked molerat scrabbles furiously at an opal nearby, a decoration of broken claw bits and streaks of blood his only impact on it";
                    }
                }
            },
            heading: function () {
                return undum.game.situations.basement2_hub.actions.calculateHeading();
            },
            optionText: "Burrow towards the Middlin Layers of The Deepness",
            tags: ["character_interaction_hub"]
        }
    ),
    "basement2_molerat_tickle": new undum.SimpleSituation(
        "<p>As you touch the caterpillar's fuzz (still pulsing with an oily darkness) to the molerat's toes and wiggle it about, he goes totally rigid.  A wheezing whistle coughs into being and in the next moment your newest friend is rolling on his back in fits of laughter, the menacing opal evidently forgotten.</p>",
        {
            enter: function (character, system, from) {
                undum.game.situations.basement2_hub.actions.bTickled = true;
                system.doLink("basement2_hub");
            },
            optionText: "Use the caterpillar fuzz to tickle some sense into him!"
        }
    ),
    /**
     * The grue is like a more evil cheschire cat entity, whimsical and ambivalent, but with a definite agenda -- it wants The Yawning God to be toppled that its own dominion might expand throughout The Deepness.  It cares nothing for the surface world, and while dark ambition is its core motivator it does experience a sort of muted empathy for other Underwere.  This means it appreciates amiability indicators as well as resonant curiosity about The Deepness and its nature. 
     * 
     * The purpose of the conversation, in addition to flavor, is to decide whether the grue will give the mole his Odditine Obol.  This item reduces the sanity damage from The Encounter by 25%, and the grue will only gift it to one he believes will help him achieve his own end -- namely to remove The Yawning God without taking its place, and not proccing as a credible threat to the Grue's reign.  He's looking for a stalwart mole unafraid of eldritch horror but for whom such things hold at most a passing interest, who is also strong enough to vanquish The Yawning God.  If the mole seems either a fan of keeping the crown for himself OR too good for his own good, the grue will attack him after he vanquishes The Yawning God (easter egg finaler boss!).
     */
    // todo: at the end of Grue convo that either gets the Grue as the finaler boss and/or gets the Odditine Obol, moleWhole increments
    "basement2_grue_hub": new undum.SimpleSituation(
        "",
        {
            enter: function (character, system, from) {
                // so the idea here is that we'll have various convo trees to traverse with one root at a time (I guess?).  Each leaf will send us back here, and the convo topic will change based on response details or maybe just be advanced.  
                if (undum.game.situations.basement2_grue_hub.actions.sQuestionTopic === "darkness") {
                    if (character.sMoleMajorDestiny === undefined) {
                        // default inititial handling and question
                        system.write(
                            "<p>As you touch the tip of your snuffly pink nose to the darkness, and then snuffle it, you are instantly enveloped.  Your entire life has been submerged in dank shadow, but this is more than the absence of light -- the darkness here pulses with nothing made manifest, like the beat of a missing heart.  You wiggle and scooch, but the world seems to have condensed to a single point in space.  Even still, something detaches itself from the gloom and creates space ahead of you from which to slither ever nearer.</p><p>\"Greetings, Deepness Scion.  Tell me, what is the purpose of deep places?\"</p>"
                        )
                        system.writeChoices(system.getSituationIdChoices("#grue_gab_purpose_deeps"));
                    } else if (character.sMoleMajorDestiny === "cozy friend") {
                        // react to case where mole is mostly concerned with general comfort and friendship
                        system.write(
                            "<p>\"Have this small treasure and go with my blessing, moleson.  You may find it a lodestone to your current perception of reality, helping you to stand even when the ground drops out beneath you... and it will.\"</p><p>A heavy weight drops into your compartment, and in the next instant you are beside the Nakedest Molerat again.  The tunnel beneath the eye is gone; not collapsed but disappeared.  Digging in the area yields nothing but dirty claws.</p>"
                        )
                        // Grue cares nothing about the mole at this point and thus has no reason to kill him, but is also intrigued by his position on Darkness
                        undum.game.storyViewController.bGrueChallengeActivated = false;
                        // give character the obol
                        libifels.addItem("Odditine Obol");
                        // send the mole back to molerat hub
                        system.doLink("basement2_hub");
                    } else if (character.sMoleMajorDestiny === "king of the deep") {
                        if (character.sMoleMinorDestiny === undefined) {
                            // grue follow-up for king of the deep
                            system.write(
                                "<p>A sigh like a deflating bellows ruffles your fur, from all possible angles surrounding you simultaneously, and the Grue queries, \"Tell me -- if you found a crown in these depths, what sort of king would you be?\"</p>"
                            )
                            undum.game.situations.basement2_grue_hub.actions.sQuestionTopic = "crown";
                            system.writeChoices(system.getSituationIdChoices("#grue_gab_crown"));
                        } else if (character.sMoleMinorDestiny === "tyrant") {
                            // grue follow-up for a rival king of the deep
                            system.write(
                                "<p>Howling laughter buffets your from all angles, reminiscent of the fearsome sound of a tree tearing loose from its desperate grip on the earth before the relentless fury of a tornado.  \"What an intriguing specimen you are!  We will have much work to do together when the immediate threat is past.  Take this trinket and go, moleson.  It will anchor your mind to this world; the inexorable pull of all possible Elsewheres may consume you all the same, but this will give you a chance.\"</p><p>A heavy weight drops into your compartment, and in the next instant you are beside the Nakedest Molerat again.  The tunnel beneath the eye is gone; not collapsed but disappeared.  Digging in the area yields nothing but dirty claws.</p>"
                            )
                            // flip toggles to say that grue wants to be finaler boss but will give obol since the mole sounds worthy of confronting The Yawning God
                            undum.game.storyViewController.bGrueChallengeActivated = true;
                            // give character the obol
                            libifels.addItem("Odditine Obol");
                            // send the mole back to molerat hub
                            system.doLink("basement2_hub");
                        } else if (character.sMoleMinorDestiny === "groovy") {
                            // grue follow-up for a puppet/prey king of the deep
                            system.write(
                                "<p>Silence reigns for an uncomfortable span.  Soon your fur stands on end as you get the distinct impression that you are being heavily considered by an unknown and likely dangerous observer; it's the same feeling you get when passing a serpent's den.  Finally, a humid sigh issuing from much, much too close passes over you and frizzes your fur 'til you're a spherical fluffball.  \"How interesting, moleson.  Well, they always say those who do not desire leadership are the best leaders; don't pass up the opportunity too lightly if it comes your way... Take this coin with you -- it will help you to ground your mind even when psychic gravity turns off!\"</p><p>A heavy weight drops into your compartment, and in the next instant you are beside the Nakedest Molerat again.  The tunnel beneath the eye is gone; not collapsed but disappeared.  Digging in the area yields nothing but dirty claws.</p>"
                            )
                            // flip toggles to say that grue wants to be finaler boss but will give obol since the mole sounds worthy of confronting The Yawning God
                            undum.game.storyViewController.bGrueChallengeActivated = false;
                            // give character the obol
                            libifels.addItem("Odditine Obol");
                            // send the mole back to molerat hub
                            system.doLink("basement2_hub");
                        } else if (character.sMoleMinorDestiny === "paladin") {
                            // grue follow-up for a righteous warrior king of the deep
                            system.write(
                                "<p>The ground beneath your paws shakes and the darkness itself vibrates with a sort of furious intensity when you finish speaking.  Abruptly the quaking stillness is shattered by a roar so abundantly malicious you can hear the glistening bared fangs in it.  \"The Deepness has no room for the likes of you, Sun-Servant!  You mistake the will of The Yawning God for contagion, fomenting weakness in your fool friends when in fact this weakness IS the contagion.  Your beloved kindness and warmth have softened the combat instincts and cruel curiosity that ought to be inherent in Deep things, dulling our darkness and leaving us mere gray Underwere.  Forgettable.  Only exemplars of Underwere, those that shimmer with absolute blackness and provide through their very being a sheer veil between an observer and beautiful madness, belong in MY Deepness.  The Yawning God's Rumble is a siren song for pawns and prey and little more; it will cease when The Yawning God is sated or its mantle passed, and may all your fuzzy fellows be consumed before it does!  Whatever the case, I fully expect to meet you down there at the heart of All Depth.  Do not disappoint.  Until then, moleson...\"</p><p>In the next instant you are beside the Nakedest Molerat again.  The tunnel beneath the eye is gone; not collapsed but disappeared.  Digging in the area yields nothing but dirty claws.</p>"
                            )
                            // flip toggles to say that grue wants to be finaler boss but will give obol since the mole sounds worthy of confronting The Yawning God
                            // No obol this time since the Grue will recognize the mole as a dangerous enemy and would prefer that he go mad and fail 
                            // to inherit The Yawning God's power rather than become a potentially insurmountable foe
                            undum.game.storyViewController.bGrueChallengeActivated = true;
                            // send the mole back to molerat hub
                            system.doLink("basement2_hub");
                        }
                    } /* end of king major destiny */ else if (character.sMoleMajorDestiny === "eldritch delver") {
                        // for the eldritch delver line, for some reason, I chose to send the player directly into a subset of situation choices rather than
                        // come back to the hub with the major and handle setting minor destiny.  However, I also didn't put content text in those choice sub-branches. Point being, we only need to flip switches and handle
                        // conclusion text here for each eldritch delver minor destiny, but maybe a little more on the conclusion text than in cozy friend.
                        if (character.sMoleMinorDestiny === "shadowscaper") {
                            // react to case where mole wants to probe secrets but keep them carefully esoteric; kinda boring overall
                            system.write(
                                "<p>Your hackles rise and a fearful lightning bolt shoots down your spine as it becomes abundantly obvious that something out in the darkness is weighing your worth.  From all possible angles at once.  Finally, the voice rumbles, \"A fair stance.  Conservative, perhaps, but careful regarding a subject that demands care.  Hm.  Well, I tire of you; begone.\"</p><p>In the next instant you are beside the Nakedest Molerat again.  The tunnel beneath the eye is gone; not collapsed but disappeared.  Digging in the area yields nothing but dirty claws.</p>"
                            )
                            // Grue favors the mole as a potential puppet here, but only if he's legit -- defeating The Yawning God without the obol is a necessary test
                            undum.game.storyViewController.bGrueChallengeActivated = false;
                            // send the mole back to molerat hub
                            system.doLink("basement2_hub");
                        } else if (character.sMoleMinorDestiny === "enlightener") {
                            // react to case where mole wants to probe secrets and then reveal them
                            system.write(
                                "<p>A bark like the rebuke of all Hell's lords become one in their arrogant disdain flattens you against an adjacent wall. \"Fool!  The Surfacers must not know of our splendor, lest they should covet it and infect our shadows with their sun.  They are not fit for our mysteries, and neither are you!\"</p><p>In the next instant you are beside the Nakedest Molerat again.  The tunnel beneath the eye is gone; not collapsed but disappeared.  Digging in the area yields nothing but dirty claws.</p>"
                            )
                            // Grue recognizes the mole as a terrible threat to the integrity of The Deepness
                            undum.game.storyViewController.bGrueChallengeActivated = true;
                            // send the mole back to molerat hub
                            system.doLink("basement2_hub");
                        } else if (character.sMoleMinorDestiny === "tingler") {
                            // react to case where mole wants to probe secrets just for the thrill of it
                            system.write(
                                "<p>Rumbles quake your surroundings and resonate perfectly with your molecules, all of them, such that every tuft of fur and every drop of blood hums along. \"I know that feeling well, moleson.  We are like-minded, you and I, quivering with pleasure before mysteries of all stripes.  Remember, though, that not every moment can be pleasure.  You must be prepared for war; it draws near.\"  You get the distinct impression that the presence in the room has moved well within your bubble of personal space.</p><p>A heavy weight drops into your compartment, and in the next instant you are beside the Nakedest Molerat again.  The tunnel beneath the eye is gone; not collapsed but disappeared.  Digging in the area yields nothing but dirty claws.</p>"
                            )
                            // Grue likes the mole genuinely and wants him to survive
                            undum.game.storyViewController.bGrueChallengeActivated = false;
                            // give character the obol
                            libifels.addItem("Odditine Obol");
                            // send the mole back to molerat hub
                            system.doLink("basement2_hub");
                        }
                    } /* end of eldritch delver major destiny*/
                }
            },
            actions: {
                /**
                 * String representation of Grue's current line of questioning of the mole
                 */
                sQuestionTopic: "darkness",
            },
            optionText: "An ominous darkness pulses beyond the pit-beneath-a-molerat...",
            tags: ["character_interaction_hub"]
        }
    ),
    "basement2_grue_convo_darkness_reward": new undum.SimpleSituation(
        "<p>Like a thorned vine twisting about its host with agonizing languidness to meet sunlight with savagery, a smile all of teeth tears a meandering line of brightness across the creature's abyssal face. \"You are beginning to understand.  Know that there are some here who would put themselves above the darkness, a deluded few who would dare to profess that it is born of them and not the other way 'round.  They will name themselves gods -- beware of such charlatans.\"</p>",
        {
            enter: function (character, system, from) {
                // mod character to reflect the moleson's villainy
                character.sMoleMajorDestiny = "king of the deep";
                system.doLink("basement2_grue_hub");
            },
            optionText: "The darkness is its own reward",
            tags: ["grue_gab_purpose_deeps"]
        }
    ),
    "basement2_grue_convo_true_warmth": new undum.SimpleSituation(
        "<p>A deep humming vibrates the very marrow in your bones as the creature contemplates your answer.  \"Intriguing.  A bit saccharine for my taste, but appropriately loyal to the twisted depths.\"</p>",
        {
            enter: function (character, system, from) {
                // mod character to reflect the moleson's cozy friendliness
                character.sMoleMajorDestiny = "cozy friend";
                system.doLink("basement2_grue_hub");
            },
            optionText: "The comfy throbbing blanket laid over all Underwere by the magma at the planet's core is the only true warmth",
            tags: ["grue_gab_purpose_deeps"]
        }
    ),
    "basement2_grue_convo_grow_secrets": new undum.SimpleSituation(
        "<p>A carronade of sound like the weaponized wail of tearing metal surrounded by a thunderclap rolls over you, presumably a bark of laughter.  \"Secrets, eh?  You'll find more than enough of those down here, to be sure.\"  Something slithers 'round your rump and casually rips a clump of fur free, then uses it to tickle your footpaws as it retracts back into the void.  \"Lost am I now, amidst wandrous wondering and wondrous wandering of a cerebral nature.  Does he hunt secret things to expand esotericism, casting shadows longer than ever, or to burn them all away with some such light of <i>truth</i>?  And which of these serves me?  Functional truth is whatever we choose to believe, after all, and as such light can be an infection vector as easily as a sterilizer...\"</p>",
        {
            enter: function (character, system, from) {
                // mod character to reflect the moleson's curious mystery
                character.sMoleMajorDestiny = "eldritch delver";
                system.getSituationIdChoices("#basement2_grue_convo_grow_secrets_elaboration_on_usage");
            },
            optionText: "Deep places, dark corners, out-of-the-way alleys -- these are the soil in which secrets grow best",
            tags: ["grue_gab_purpose_deeps"]
        }
    ),
    // todo: maybe add quantified qualities such as secretiveness where the quantity is simply defined as the number of responses the mole has given indicating the quality in himself?
    "basement2_grue_convo_grow_secrets_elaboration_on_usage_shadowscape": new undum.SimpleSituation(
        "",
        {
            enter: function (character, system, from) {
                // mod character to reflect the moleson's curious mystery focused on preserving and deepening secrets
                character.sMoleMinorDestiny = "shadowscaper";
                system.doLink("basement2_grue_hub");
            },
            optionText: "I would have our secrets be an impenetrable shadowscape to all who have not burrowed the deep paths personally",
            tags: ["basement2_grue_convo_grow_secrets_elaboration_on_usage"]
        }
    ),
    "basement2_grue_convo_grow_secrets_elaboration_on_usage_illuminate": new undum.SimpleSituation(
        "",
        {
            enter: function (character, system, from) {
                // mod character to reflect the moleson's curious mystery focused on demystifying deepness
                character.sMoleMinorDestiny = "enlightener";
                system.doLink("basement2_grue_hub");
            },
            optionText: "We should share the wonders of our glorious depths with the Surfacers; maybe if they understood our world, we'd have fewer conflicts?",
            tags: ["basement2_grue_convo_grow_secrets_elaboration_on_usage"]
        }
    ),
    "basement2_grue_convo_grow_secrets_elaboration_on_usage_tingly": new undum.SimpleSituation(
        "",
        {
            enter: function (character, system, from) {
                // mod character to reflect the moleson's curious mystery focused on appreciation of secrets for secretism's sake
                character.sMoleMinorDestiny = "tingler";
                system.doLink("basement2_grue_hub");
            },
            optionText: "To be honest, I just like knowing secret things because it makes me feel all tingly",
            tags: ["basement2_grue_convo_grow_secrets_elaboration_on_usage"]
        }
    ),
    "basement2_grue_convo_crown_ruthless": new undum.SimpleSituation(
        "<p></p>",
        {
            enter: function (character, system, from) {
                // mod character to reflect the moleson's desire for tyrant status
                character.sMoleMinorDestiny = "tyrant";
                system.doLink("basement2_grue_hub");
            },
            optionText: function (character, system, situation) {
                return "I would rule with an " + (character.stringArrayInventory.includes("acid_claws") ? "acidic" : "iron") + " digging claw -- I would suffer no compromises with the surfacers, snuffing out their precious sun if they encroach upon The Deepness."
            },
            tags: ["grue_gab_crown"]
        }
    ),
    "basement2_grue_convo_crown_groovy": new undum.SimpleSituation(
        "<p></p>",
        {
            enter: function (character, system, from) {
                // mod character to reflect the moleson's desire for a calm and peaceful Deepness
                character.sMoleMinorDestiny = "groovy";
                system.doLink("basement2_grue_hub");
            },
            optionText: function (character, system, situation) {
                return "I'm not one for rulership; kinda too much trouble TBH.  If I had to tho, I guess I'd strive for peaceful diplomatic relations between the Layers of The Deepness and the surface.  Cooler heads should always prevail!"
            },
            tags: ["grue_gab_crown"]
        }
    ),
    "basement2_grue_convo_crown_paladin": new undum.SimpleSituation(
        "<p></p>",
        {
            enter: function (character, system, from) {
                // mod character to reflect the moleson's desire for peace and readiness for war
                character.sMoleMinorDestiny = "paladin";
                system.doLink("basement2_grue_hub");
            },
            optionText: function (character, system, situation) {
                return "There is a difference between darkness and Darkness -- I would prefer to see more of the former in The Deepness.  Some creeping evil has infected these lands and turned my beloved cozy shadows, once veils of pure possibility just begging imagination to actualize their contents, into fearful portents of ever-more-horrifying doom.  Even if it means temporarily leveraging the light of the surfacers, I would see kindness and warmth rule our burrows again."
            },
            tags: ["grue_gab_crown"]
        }
    ),
    "basement3_encounter_yawning_god": new undum.SimpleSituation(
        "",
        {
        	// todo: may have a problem here re: loading a saved game that was in combat;
        	//  the Undum save/load mech tries to repeat all choices made like a Doom demo archive
        	//  (although it isn't clear how/if any random events within the Situations are 
        	//  replicated -- random effects on stats or determination of Situation routing could
        	//  be handled by traversing a record of the Situation routing that happened and restoring
        	//  character etc. state BUT the load system seems to be running the Situation callbacks afresh
        	//  and those can contain arbitrary code.  What if I had a Situation::enter() that called
        	//  system.doLink(randoString(situationIdStringArray))?  You'd have a wacky transcript at least,
        	//  and perhaps also mucked up state)
        	//  and when it hits this one I just get the modal on top of the title screen rather than
        	//  the expected modal over transcript up to that point.  Also, there seems to potentially be
        	//  auto saving/loading since I definitely hit this without even being able to hit load.
            enter: function (character, system, from) {
            	// todo: so I read the Promise docs... and I think I'm still somewhat sane. Anyway, take home point is that a promise doesn't 'activate' and start towards resolving until a then() is called on it and passes in resolve/reject handlers.  So for the issue of pausing here until combat resolves, we could maybe wrap the combat call in a new Promise and pass in a resolve functor to combat which we can go ahead and call only when combat his finished -- that miiight mean that a chained then() which could contain the code we want to run here in the event of combat victory/defeat for the player.
            	
            	var promiseOfWar = new Promise((resolve) => {
            		
            	
            		// boss fight hyyyyype!  Give a combat UI within the transcript main content window; I'm thinking a relatively simple table plus some text and image output divs?
                	// play the Yawning God cute lil' roar
                	var yawningGodRoar = new Audio('audio/creatures/Skeleton Roar.mp3');
                	yawningGodRoar.addEventListener('canplaythrough', e => {
                		yawningGodRoar.play();
                	});
                	var mech = undum.game.rpgMech;
                	var story = undum.game.storyViewController;
                	// todo: characters should be owned by the story ViewController and drawn from there at this point
                	mech.enterCombat({playerParty: [story.charactersDict["mole"]], enemyParty: [story.charactersDict["yawning_god"]], musicUrl: "audio/music/yawning_god_theme.wav", resultFn: resolve}); 
            	}).then((playerVictory) => {
            		if(playerVictory) {
						var yawningGodVictoryString = "The behemoth out of all the world's collective nightmare falls before your mighty digging claws, naught but a smoking ruin.  Your equally mighty tummy rumbles as the cavern is suffused with the scent of roasted fish-thing.";
						undum.game.storyViewController.writeParagraph(yawningGodVictoryString);	
						// todo: so the dark Promises approach works, but it's wretchedly unintuitive for what we're making it do here specifically, and Undum story paradigm in general.  Simply passing a string id indicating what location/context the player should be returned to after combat (situation id in Undum) into combat and then call a storyViewController abstraction like travelTo(id) which for Undum would inoke doLink(situation id) would be much easier and clearer.
						var promiseOfDarkness = new Promise((resolver) => {
							if(undum.game.storyViewController.bGrueChallengeActivated) {
		            			// transition to the grue fight 
								var grueApproachethString = "Something's veeeery wrong; the darkness surrounding you and the ruins of your smitten foe is purring.  Your insticts beg you to flee, but a quick glance around reveals that the darkness has solidified betwixt you and the exit tunnel whence you came into this outré nightmare.";
						undum.game.storyViewController.writeParagraph(grueApproachethString);	
		            			system.writeChoices(["basement3_encounter_grue"]);
		            			// todo: pass resolver to basement3_encounter_grue situation somehow... maybe just a common undum.game.story property that holds an active resolver reference?  Seems weird and stupid but I'm not sure how else you'd handle a situation like this where you wanna mix async via promises with required pause step to consume user input (i.e. clicking the grue encounter choice so that we have the chance to show new text explaining what's coming)
		            			undum.game.storyViewController.activeResolver = resolver;
		            		} else {
								// grue was not angered, so we resolve immediately with grue death arg false
								resolver("shadowed");
							}
						});
						return promiseOfDarkness;
					} else {
            			var promiseOfDeath = new Promise((resolver) => {
            				resolver("death");
            			});
						return promiseOfDeath;
            		}
            	}).then((resultString) => {
            		switch(resultString) {
            		case "death":
            			system.doLink('death');
            			break;
            		case "shadowed":
            			// todo: hint that something vile remains in the Deepness, a cheschire cat grin all of teeth flashing out of the distant void for an instant.
            			break;
            		case "dark_king":
            			// todo: reduce sanity cost of Dark Mole powers by half; this combined with the Odditine Obol is the only circumstance where the player can achieve a score in the best hero/villain ending threshold!
            			break;
            		}
            		if(resultString !== "death") {
	            		const deepOneString = "Before you can fully process what has transpired, you feel a shadowy mantle slip over your shoulders, and thorned crown make its nest in bloody fur atop your noodle, clasping shut like a manacle.  A great and terrible something has come upon you, a power unwanted but irrepressible and undeniable.  Its poisonous whispers flit through your mind like tendrils of blight, corrupting your thoughts more thoroughly with each passing moment.";
						const breachTheDeepString = "With a burst of effort you manage to clamber back up to the Middlin Depths and the Nakedest Molerat's demesne.  He eyes you warily as you emerge, steam and volcanic gases whicking off your coat like a thousand thousand wildfire candles all snuffed by your very presence, but you pay him no mind and simply flop down in an exhausted puddle of fuzz.  The Deep tunnel behind you collapses soundlessly, swallowing the eldritch opal eye; the gentle last-gasp vibrations of a fading quake serve as the lone humble herald of its passing.";
	            		undum.game.storyViewController.writeParagraph(deepOneString);
						undum.game.storyViewController.writeParagraph(breachTheDeepString);
	            		undum.game.storyViewController.eventFlags.dark_mole = true;
	            		system.doLink("basement2_hub");
            		}
				});
// todo: dark mole epilogue: send player to basement2 hub and let them do as they please with new skull of mondain style evil actions with each character AND magical good actions e.g. curing them of their Rumbly corruption; each usage costs sanity but adds to the hero/villain scores greatly.  Characters should recognize him as the source of the rapturous rumble now, too.  Player can do with them as they see fit, and upon surfacing they can choose to wash off the Darkness in the sunlight or harness it to darken the sky and wage war upon the humans and other surfacers...
            },
            optionText: "Burrow towards the Deepest Deepness"
        }
    ),
    "basement3_encounter_grue": new undum.SimpleSituation(
        "",
        {
        	enter: function (character, system, from) {
        		var grueRoar = new Audio('audio/creatures/eatmind.wav');
            	grueRoar.addEventListener('canplaythrough', e => {
            		grueRoar.play();
            	});
            	var mech = undum.game.rpgMech;
            	var story = undum.game.storyViewController;
            	// up in basement3_encounter_yawning_god::enter() I shoved the latest Promise resolver (for promiseOfDarkness) onto the storyVC as activeResolver, so pass in here so it can be resolved when combat is over
            	mech.enterCombat({playerParty: [story.charactersDict["mole"]], enemyParty: [story.charactersDict["grue"]], musicUrl: "audio/music/grue_theme.wav", resultFn: undum.game.storyViewController.activeResolver});
        	},
        	optionText: "Something stirs just out of sight, and shadows slither closer...  Show this new abomination what a mole is made of!"
        }
    ),
    // todo: need a combat result situation(s) for the two encounters to land back in; since obviously enterCombat() doesn't block and I don't think we can make use of async/await since Undum is ES5, we'll need to feed a handle to the story VC into the combat VC and have combat VC tell story where to go based on combat result.
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

// todo: combat UI; I'm thinking a Situation to handle it with a custom set of HTML widgets added into the bg of the Situation (if that's possible)
//  (iframe?) or maybe more simply a div that we can shove into the transcript UI someplace or maybe overlay on top of it like a modal.

/* The id of the starting situation. */
undum.game.start = "main";

/* Here we define all the qualities that our characters could
 * possess. We don't have to be exhaustive, but if we miss one out then
 * that quality will never show up in the character bar in the UI. */
undum.game.qualities = {
    // todo: add inventory quality that renders as a nice unordered list and can ideally by clicked to effect a 'use clicked item' action
    health: new undum.NumericQuality(
        "Health", { priority: "0001", group: 'stats' }
    ),
    sanity: new undum.NumericQuality(
        "Sanity", { priority: "0002", group: 'stats' }
    ),
    moleWhole: new BurrowAdjectivesQuality(
        "<span title='One&apos;s ability to dig is not measured in kilograms of displaced dirt -- rather, it must take into account all the courage, curiosity, and tenacity required of tunnelers of all stripes.  What can your claws do?  Where can they take you?  We shall see!'>Mole Whole</span>",
        { priority: "0003", group: 'stats' }
    )
};

// ---------------------------------------------------------------------------
/* The qualities are displayed in groups in the character bar. This
 * determines the groups, their heading (which can be null for no
 * heading) and ordering. QualityDefinitions without a group appear at
 * the end. It is an error to have a quality definition belong to a
 * non-existent group. */
undum.game.qualityGroups = {
    stats: new undum.QualityGroup(null, { priority: "0001" })
};

// ---------------------------------------------------------------------------
/* This function gets run before the game begins. It is normally used
 * to configure the character at the start of play. */
undum.game.init = function (character, system) {
    character.mole = undum.game.storyViewController.charactersDict.mole;
    character.mole.resetStatus();

    // inform UI viewmodel 
    character.qualities.health = character.mole.stats.maxHP;
    character.qualities.sanity = character.mole.stats.maxSanity;
    character.qualities.moleWhole = character.mole.ordinalUnderwere;
    system.setCharacterText("<p>You are starting on an exciting journey beneath the earth and beyond all reason.</p>");
};
//-----end game logic-----//