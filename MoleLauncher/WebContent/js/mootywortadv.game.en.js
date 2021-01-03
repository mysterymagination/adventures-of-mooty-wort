//imports
import {CombatViewController} from "./combatviewcontrollers.js";
import {Libifels} from "../lib/libifels.js";
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
		"Crawling Chaos".l(), "Darkness Beyond".l(), "Eldritch Entity".l(),
		"Plain Underwere".l(), "Mighty Digger".l(), "Burrow Master".l(), "Eldritch Delver".l()
		], opts);
	if (!('offset' in opts)) this.offset = -3;
};
BurrowAdjectivesQuality.inherits(undum.WordScaleQuality);

// export API with undum
undum.BurrowAdjectivesQuality = BurrowAdjectivesQuality;
//-----end undum extension-----//

//-----game logic-----//
// create RPG combat ViewController and transcript story ViewController
undum.game.storyViewController = new UndumStoryViewController(undum.system);
// dealing with Undum's stubborn refusal to scroll the transcript upon showing/hiding menu in mobile view
document.addEventListener('scroll', (e) => {
	if(document.getElementById('content_wrapper').style.display === 'block') {
		if(undum.game.itemManager.feedbackContext === "story") {
			undum.game.storyViewController.saveStoryYPos();
		}
	}
});
undum.game.storyViewController.transcriptMutationObserver = new window.MutationObserver(() => {undum.game.storyViewController.checkTranscriptDisplay()});
undum.game.storyViewController.transcriptMutationObserver.observe(document.getElementById('content_wrapper'), {
  attributes: true,
  attributeFilter: ['style', 'class']
});
undum.game.combatViewController = new CombatViewController(undum.game.storyViewController);
undum.game.itemManager = new Items.ItemManager();
undum.game.itemManager.storyViewController = undum.game.storyViewController;
undum.game.itemManager.combatViewController = undum.game.combatViewController;
undum.game.situations = {
		main: new undum.SimpleSituation(
				"",
				{
					// todo: hmm, seems you can't generate choices that are actions or situations with an action arg; it would be nice to be able to do anything you can do with links with choice sets.  It looks like system.writeChoices() basically just makes links out of the situation ids anyway, so maybe write alternate functions that check for action link syntax and format the link appropriately?  Maybe also add canChoose etc. functions to action...
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
						'fight-humans': function (character, system, action) {
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
						const story = undum.game.storyViewController;
						story.choiceStringArray = [];
						if(story.eventFlags.caterpillar_entombed_forever) {
							story.writeParagraph("The butterfly wriggles and cringes as cramped confinement asserts itself.  This is a pain that shall linger.");
						} else if(story.eventFlags.caterpillar_wyrm) {
							story.writeParagraph("Your worm wyrm servitor bows his head in salute to your magnificence, as is right and proper.  You should have a saddle rigged up so that he might serve as a burrowing mount...");
						} else if(story.eventFlags.caterpillar_woolly) {
							story.writeParagraph("The caterpillar wiggles his tail-end at you fondly, grateful for your help.  He continues the struggle to find himself in the shrouded mist that the Rumble left blanketing his mind, but with your moleful encouragement he's hopeful!");
						} else {
							let sEntryDesc = "";
							if (!story.eventFlags.caterpillar_visited) {
								sEntryDesc = "Almost as soon as your claws begin shoveling the slightly more acidic soil away from your path and behind your rotund rump, your tunnel converges with that of one fuzzy caterpillar."
								story.eventFlags.caterpillar_visited = true;
							} else {
								sEntryDesc = "Here again we find ourselves snout to mandibles with a fairly unfuzzy caterpillar.";
							}
							system.write(
									"<p>" + sEntryDesc + "  He wiggles wonderingly, clearly gripped by some fascination. He's shedding copious amounts of <a href='./take-fuzz' class='once'>spiny-looking fuzz</a> all over, and is rapidly looking not so very fuzzy at all.  The shed fuzz trembles ominously.  The fuzzless flesh beneath is pallid and striated with <a href='./look-substance'>sickly black veins</a>.</p>"
							);
							story.appendChoices(system.getSituationIdChoices(["#caterpillar_queries"]));
						}
						story.appendChoice("basement1_hub");
						story.showChoices();
					},
					optionText: function () { return "You can feel the vibrations from the *swish* *swish* *scrunch* of a worm-like body a few mole-lengths behind a patch of musty loam your whiskers just brushed against." },

					actions: {
						'take-fuzz': function (character, system, action) {
							// so apparently Undum's SimpleSituation.prototype.act() will try to just print whatever the value paired with the action key string is if an exception is thrown trying to execute same... any exception.  The thinking, I guess, was that a raw string will throw an exception (TypeError: <insert string here> is not a function) if you try operator call on it, so with that hack you can have either a string or a callable function as the action value.  Trouble is that if you've got a function that is bugged and throws an uncaught exception of its own, Undum will swallow the error AND try to write out the whole function as a string with its own markup magic which leads to very strrrrrange errors.  Point is, wrap your Undum action functions in try/catch to avoid tears.
							try {
								// action links of CSS class 'once' apparently have their function executed twice, once with real character, system, action args and once from jQuery with unrelated/undefined args?  Anyway, checking for real action arg saves us from exploding over unexpected character object type.
								if(action) {
									const sFuzzMessage = "As you pluck a discarded fuzz filament off the ground, it twists around of its own accord and stabs you in the snout!";

									if (!Libifels.isItemInInventory(character.mole, "pulsating_fuzz")) {
										undum.game.storyViewController.subtractFromCharacterQuality("health", character.mole.stats.maxHP * 0.1);
										console.log("health is " + character.qualities.health);
										if (character.qualities.health > 0) {
											system.write("<p>" + sFuzzMessage + "Stinging pain shoots through your body as the caterpillar's venom spreads, but you're a hardy bloke and shake it off easily.  Tucking the fuzz away in your compartment, you turn to the caterpillar and his wiggliness.</p>");
											// push the fuzz item to the mole's inventory
											undum.game.itemManager.addItem(undum.game.storyViewController.charactersDict.mole, new Items.PulsatingFuzz());                     
										} else {
											system.write(sFuzzMessage + "</p>");
											system.doLink('death');
										}
									} else {
										system.write("<p>The fuzz already in your pack is vibrating in a worrisome manner; you don't need more of the stuff.</p>");
									}
									undum.game.storyViewController.jumpToNewContent();
								}
							} catch(err) {
								console.log("take-fuzz action error says: "+err);
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
						const story = undum.game.storyViewController;
						story.writeParagraph("The caterpillar stops wiggling when you speak and his head twisssssts ever so slowly around to face you... 270 degrees.  He's an invertebrate and all, but that's not really a thing caterpillars usually do, right?  \"Greetings, moleson.  I am better than ever before, for today I know the glory of the Rapturous Rumble!\"");
						if(!story.eventFlags.caterpillar_concern_mana_pot_got) {
							story.writeParagraph("He tilts his head slowly and jerkily, studying you from every extant angle as well as some invented ones that shouldn't be.  Your eyes have trouble following his physically incongruous undulations.  \"I do greatly appreciate the concern of the scion, tho; take this, and may it help you realize your destiny!\"  A vial of irridescent glowing liquid appears from somewhere with a troubling squelch, and he proffers it to you.  It's only a little drippy, and the smell will probably go away.");
							undum.game.itemManager.addItem(character.mole, new Items.PuddleOManaPotion());
							story.eventFlags.caterpillar_concern_mana_pot_got = true;
						}
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
						undum.game.storyViewController.writeParagraph("\"Why the rumbliest rumbly rumble, of course!  Can't you feel it calling? The Rapturous Rumble is calling us all, but it wants you most of all.  You must feel the scintillating harmonics!\"  The caterpillar taps several dozen feet in time with some sort you cannot hear and clacks his mandibles at you in a smile that suggests murderous envy.");

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
							undum.game.storyViewController.subtractFromCharacterQuality("sanity", character.mole.stats.maxSanity * 0.25);
						}
						system.write(
								"<p>He lies down on the ground and extends his many feet toward the tunnel walls in an effort to maximize the surface area of his flesh in contact with the soil. \"It begins, mighty mole.  You are the key to it all, the keystone in the arch leading to everlasting paradise and power for Dwellers in the Deep!  Can't you feel it whispering your name?!  Oh how I envy you!\"  With this he begins rolling around, leaving behind swathes of fuzz.</p>"
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
						const story = undum.game.storyViewController;
						// todo: respond to darkmantle story switches
						var sDesc = "";
						// if we just entered for the first time, give the full deal
						const actionsObj = undum.game.situations.basement1_bulbous_spider_hub.actions;
						if (!actionsObj.bVisited) {
							sDesc = "As you shovel pebbles away from your questing snout, the vision of a rolly-polly spider struggling with some sort of urn enters your reality.  The urn is transparent and you can see a viscous rusty liquid sloshing lazily about inside.  It's sealed by a stone stopper that glows red as the heart of all magma when the spider strains against it.  Before you can speak, she slips on the slick soil and rolls onto her voluminous backside... and keeps rolling: the tunnel you've entered has a gentle but insistent curvature that seems just right to keep the poor arachnid rolling forever.  Well, not forever of course, as that would be physically impossible, but longer than a spider's lifespan so the point is kinda moot.";
							actionsObj.bVisited = true;
						} else {
							// dark mantle cases
							if(story.eventFlags.spider_flashed) {
								sDesc = "Your erstwhile arachnid ladyfriend has been reduced to a gibbering shell of her former self, having beheld your terrible magnificence.  You have no further use for her.";
							} else if(story.eventFlags.spider_rejected) {
								sDesc = "The spider winces gently as she catches sight of you and offers only a furtive nod before she skuttles off, determinedly busying herself with other things.";
							} else if(story.eventFlags.spider_loved) {
								sDesc = "Your new best girlfriend fairly pounces on you as you enter her demesne, snuggling her infinite staring moleful eyes right up against your two soulful ones and tickling your noodle with her fangs.  She purrs (somehow) as you cuddle her close.";
							} else {
								// normal action details cases
								if (actionsObj.bRolling) {
									sDesc = "The poor dear is still helpless on her back; you could intervene if you wanted to be a gentlemole.";
								} else {
									sDesc = "Innumerable glittering eyes blacker than the void between stars gaze adoringly into your own beady two and the <a href='./check_spider'>giant spider</a> seems to creep closer without actually moving, as if drawn directly by your raw animal magnetism.  For a smoldery velvet fellow like yourself, this can be an issue with the ladies.";
								}
							} 
						}
						system.write(
								"<p>" + sDesc + "</p>"
						);
						if(!story.eventFlags.phantasmalloy_vault_opened) {
							story.writeParagraph("There's a shimmer of silvery white like crystallized moonlight in the center of the floor; shoveling a bit of soil away reveals the top of a mostly <a href='./check_phantasmalloy_vault'>buried vault</a>.  It's smallish, but ghastly heavy.  The material appears to be phantasmalloy, a seamless blend of metal and magic from beyond the common cosmos.  There seems to be no door on it, either -- your claws may be mighty, but they're not quite up to rending magic-infused metal.");
						} else {
							story.writeParagraph("The phantasmalloy vault is a shredded ruin now, a majestic empty shell.");
						}
						system.writeChoices(system.getSituationIdChoices("#spider_sayings").concat("basement1_hub"));
					},
					actions: {
						bVisited: false,
						bRolling: true,
						sRollingDesc: "The spider's clawed hooves dig furiously and fruitlessly at the air as she flounders...",
						sUnrolledDesc: "The spider stares at you adoringly from innumerable eyes, each one sparkling like a dark gemstone in moonlight...",
						sGibberingHeading: "The spider stares at nothing now, her world reduced to the memory of your mind-searing visage looming ever on the abyssal void's infinite horizon.",
						sAwkwardHeading: "Like a shy shadow, the spider melts into obscurity the moment she catches sight of you.",
						sLoveyDoveyHeading: "A tidal wave of chiton, fang, and enthusiasm crash into you, wrapping you in an exponential hug!",
						check_spider: function(character, system, action) {
							try {
								console.log("check_spider; the action says "+action);
								if(action) {
									const itemManager = undum.game.itemManager;
									if(!itemManager.activeItemUseOn("giant spider")) {
										undum.game.storyViewController.writeParagraph("She's really quite cute despite all the terribly varied and razor-sharp multitudinous mouthparts... no, because of them!  She would definitely be an interesting kisser.  Also her moonlit-blood blush.  And those leeeegs for daaaays, eight times over!  Plus it's hard to even mention That Abdomen in polite conversation.  Ooh ooh, and her spinnerets would be wonder itself to tease!");
									}
									undum.game.storyViewController.jumpToNewContent();
								}
							} catch (err) {
								console.log("checking spider failed with: "+err);
							}
						},
						check_phantasmalloy_vault: function(character, system, action) {
							try {
								if(action) {
									const story = undum.game.storyViewController;
									if(!story.eventFlags.phantasmalloy_vault_opened) {
										const itemManager = undum.game.itemManager;
										// if we did hit with useOn, the item specific handling will report the story.  We just need to handle default failure case here.
										if(!itemManager.activeItemUseOn("buried vault")) {
											story.writeParagraph("The phantasmalloy vault remains a stubbornly impenetrable enigma.");
										}
									} else {
										story.writeParagraph("The phantasmalloy vault is a shredded ruin now, a majestic empty shell.");
									}
									undum.game.storyViewController.jumpToNewContent();
								}
							} catch(err) {
								console.log("error during phantasmalloy check: "+err);
							}
						},
						/**
						 * Determines and returns the appropriate option text (choice title) for this situation
						 */
						calculateHeading: function () {
							const actionsObj = undum.game.situations.basement1_bulbous_spider_hub.actions;
							if (!actionsObj.bVisited) {
								return "A massive spider rolls back and forth across the curve of the tunnel; her thicket of frantically scrabbling legs is strangely hypnotic.";
							} else {
								if(undum.game.storyViewController.eventFlags.spider_flashed) {
									return this.sGibberingHeading;
								} else if(undum.game.storyViewController.eventFlags.spider_rejected) {
									return this.sAwkwardHeading;
								} else if(undum.game.storyViewController.eventFlags.spider_loved) {
									return this.sLoveyDoveyHeading;
								} else {
									if (actionsObj.bRolling) {
										return this.sRollingDesc;
									} else {
										return this.sUnrolledDesc;
									}
								}
							}
						},
						/**
						 * Updates the host situation's optionText field
						 */
						updateOptionText: function () {
							const actionsObj = undum.game.situations.basement1_bulbous_spider_hub.actions;
							console.log("updateOptionText; bRolling says: " + actionsObj.bRolling);
							if (actionsObj.bRolling) {
								undum.game.situations.basement1_bulbous_spider_hub.optionText = actionsObj.sRollingDesc;
							} else {
								undum.game.situations.basement1_bulbous_spider_hub.optionText = actionsObj.sUnrolledDesc;
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
								<p>\"Ooh, wow!  Watch that wandering paw, mister.  But, um, thank you for rescuing me!\" she chitters, her fangs and complicated-looking razor-edged mouth-parts clacking upsettingly and a blush the fell scarlet of moonlit blood spreading over her cephalothorax.  \"This blasted urn has brought me nothing but trouble.  Would you like it?  Here, take it with my compliments!\" She hastily shoves the rusty urn into your compartment, taking liberties with her frisking of your svelte potato morphology on the way.  Before you can speak, she squeals shyly and skuttles away, her eyes still rolling in the cycle of her erstwhile dizzy purgatory.  With her face buried in four of her legs, she continues staring at you in fascination from the shadows despite her embarrassment; specifically, at your muscular rump.</p>"
						);
						// need to wrap post-unrolled behavior in a possible death block as damage is dealt
						if(!undum.game.storyViewController.subtractFromCharacterQuality("health", character.mole.stats.maxHP * 0.4)) {

							// now that she's been unrolled, we want to update the flag and option text
							undum.game.situations.basement1_bulbous_spider_hub.actions.bRolling = false;
							//undum.game.situations.basement1_bulbous_spider_hub.actions.updateOptionText();
							console.log("spider rolling status after we've stopped her rolling: " + undum.game.situations.basement1_bulbous_spider_hub.bRolling);
	
							// player now has the ooze urn... hooray?
							undum.game.itemManager.addItem(undum.game.storyViewController.charactersDict.mole, new Items.RustyUrn());
							character.stringArrayInventory.push("rusty_urn");
							system.doLink("basement1_bulbous_spider_hub");
						}
					},
					canView: function (character, system, host) {
						console.log("spider rolling status is " + undum.game.situations.basement1_bulbous_spider_hub.actions.bRolling);
						return undum.game.situations.basement1_bulbous_spider_hub.actions.bRolling;
					},
					optionText: "Step in and lend a massive digging claw to interrupt the cycle (she's a little thicc so it could be painful)",
					tags: ["spider_sayings"]
				}
		),
		"basement1_ochre_ooze_hub": new undum.SimpleSituation(
				"",
				{
					enter: function (character, system, from) {
						const story = undum.game.storyViewController;
						if(story.eventFlags.ooze_prisoner) {
							story.writeParagraph("The ooze continues its fruitless struggle against the star system sealing it for all time.");
						} else if(story.eventFlags.ooze_devoured) {
							story.writeParagraph("The crystal plinth stands empty now, and the memory of its former royal inhabitant conjures nothing more than mild indigestion from you.");
						} else if(story.eventFlags.curvy_gel) {
							story.writeParagraph("\"Hoi ~ヾ(＾∇＾)\", Gel shouts as you enter, waving several of her flagella in your general direction.  The underground will be a much friendlier place with her in oozey power!");
						} else {
							if(!story.eventFlags.ooze_visited) {
								story.writeParagraph("<p>As you snuffle at the cracks to calculate their stability, the point rapidly renders itself moot when the floor collapses!  You tumble gracefully as a subterranean ballerina into a large cavern, landing solidly on your mighty rump and seamlessly rolling down onto all fours ready for action.  It seems you've dropped into the antechamber of an ooze warren; these creatures are notorious amongst Underwere for being voracious and none-too-particular about their diet.  Kind of eat first and consider indigestion-adjacent consequences later sort of fellows.  Lucky for you, this warren is mostly deserted, save for one massive blob of an ochre ooze bubbling away idly atop a dais of sorts made of pulsing rainbow crystal.  Considering the fact that you're still alive, it's likely this one isn't terribly hungry at the moment.</p>");
								story.eventFlags.ooze_visited = true;
							} else {
								system.write(
										"<p>Atop its crystal platform, the <a href='./sacrifice_ooze_daughter'>ochre ooze</a> quivers and bubbles and burbles with interest.  Hunger will erode its curiosity, however, and with it will go civility.  Best hurry up and get gone from here.</p>"
								);
								if(Libifels.isItemInInventory(character.mole, "rusty_urn")) {
									undum.game.storyViewController.writeParagraph("The rusty urn you got from the spider vibrates violently in your compartment; its frantic vibrations seem to be tugging you away from the writhing monstrous mass and you're almost certain you hear a smol voice whispering \"Please, no!\".");
								}
							}
							system.writeChoices(system.getSituationIdChoices("#ooze_oratory").concat("basement1_hub"));
						}
					},
					actions: {
						sacrifice_ooze_daughter : function(character, system, action) {
							if (action) {
								try {
									const itemManager = undum.game.itemManager;
									if(!itemManager.activeItemUseOn("ochre ooze")) {
										undum.game.storyViewController.writeParagraph("The massive ooze wiggles condescendingly at the world in general.  You do note several tendrils sweeping out around at its base, however, that seem to be searching for something...");
									}
									undum.game.storyViewController.jumpToNewContent();
								} catch (err) {
									console.log("error processing ooze daughter slaughter: "+err);
								}
							}
						},
						calculateHeading: function () {
							const story = undum.game.storyViewController;
							if(story.eventFlags.ooze_prisoner) {
								return "The monstrous ooze flails pathetically in its prison.";
							} else if(story.eventFlags.ooze_devoured) {
								return "The ooze's throne stands empty, forevermore.";
							} else if(story.eventFlags.curvy_gel) {
								return "Gel wiggles wonderingly as she explores the infinite dimensions of her new morphology.";
							} else { 
								if (undum.game.storyViewController.eventFlags.daughter_ooze_sacrificed) {
									return "The monstrous amalgamate ooze swells and contracts contentedly, ignoring you";
								} else {
									return "An ochre ooze quivers nearby, somehow looking at your hungrily despite lacking eyes";
								}
							}
						}
					},
					heading: function () {
						return undum.game.situations.basement1_ochre_ooze_hub.actions.calculateHeading();
					},
					optionText: () => {
						const story = undum.game.storyViewController;
						if(!story.eventFlags.ooze_prisoner && !story.eventFlags.ooze_devoured && !story.eventFlags.curvy_gel) {
							return "With a *squelch* and a *fizz*, an ooze creature of some sort bubbles ponderously on the far side of some cracks in the soil beneath your paws."
						} else {
							return "The conquered ooze chamber lies beyond, significantly friendlier now!";
						}
					},
					tags: ["character_interaction_hub", "basement1_creatures"]
				}
		),
		"basement2_hub": new undum.SimpleSituation(
				"",
				{
					enter: function (character, system, from) {
						const story = undum.game.storyViewController;
						story.choiceStringArray = ["basement1_hub", "basement3_encounter_yawning_god"];
						if (!story.eventFlags.dark_mole) {
							if (story.eventFlags.molerat_tickled) {
								system.write(
										"<p>The molerat's riotous laughter shatters the chamber's calm, stabbing into the cool darkness like thorns through a rose assaulting a curious nose.  He's rolled well away from the <a href='./examine_oracle_opal'>massive carved opal</a> breaching outward from the ancient walls.</p>"
								);
							} else {
								system.write(
										"<p>As your wiggly snout pushes through the last of the dry, acidic soil indicative of the near-surface Deepness and your whiskers sweep into the loamy goodness below, a strange sight greets you: there is a <a href='./check_molerat_target'>naked molerat</a>, perhaps the nakedest you've seen, twitching and clawing feebly at the gently convex surface of a <a href='./examine_oracle_opal'>massive carved opal</a> buried in the wall.  His claws have worn away to bloody stubs, but he persists all the same.</p>  <p>\"It calls to me...\"  He whimpers.  \"Sweet rumbly music, take my mind into your legion!  This corpse is a prison!\"</p><p>He seems frozen in place, his legs at once paralyzed and in ceaseless spasming motion.  No matter what you say, he doesn't acknowledge your presence.</p>"
								);
							}
						} else {
							// the depths are sealed... for now
							story.choiceStringArray = ["basement1_hub"];
							if(story.eventFlags.molerat_devotee) {
								story.writeParagraph("The molerat is feverishly busy writing what he imagines are your commandments on the walls in his own blood; a fine show of support from your first disciple.");
							} else if(story.eventFlags.molerat_actualized) {
								story.writeParagraph("The molerat tips his snout to you politely, then returns to exploring the simple pleasures abundant in basic grooming and self-care.");
							} else {
								var awestruckMoleratString = "The <a href='./check_molerat_target'>Nakedest Molerat's</a> laughter has ceased.  He cowers in a corner, his beady bloodshot eyes fixed, unblinking, upon you. \"You are... not what I was expecting.  Perhaps this form is intended to make your splendor comprehensible to my limited intellect?  It matters not -- please, free me!\"  He prostrates himself before you as best as his still-bleeding claw-stumps will allow.";
								story.writeParagraph(awestruckMoleratString);
							}
						}
						story.showChoices();
					},
					actions: {
						"examine_oracle_opal": function (character, system, action) {
							try {
								if(action) {
									system.write(
											"<p>Beneath the nakedest molerat's pathetic pawing and the resultant trails of dried blood you can make out an archaic script carved into the gem.  You could have sworn at first glance that it was unintelligible, but as you gaze longer it seems to resolve into the familiar common script of Underwere, if a bit more formal and stuffy than you're used to. It reads: </p>\
											<div class='featured_text_centered'>\
											Seek me in the darkest ways<br />\
											Where all that is twists into a maze<br />\
											Take of my flesh a horned crown<br />\
											'Neath sea of night all light shall drown\
											</div>\
											<p>A quiver runs down your spine as you read these words, and something atavistic in your innermost being stirs.  Peering at the edges of the gem, where it is hidden again by impassable slate, you can make out what could be a fold of flesh with minute slots that suggest hair follicles.  An eyelid, perhaps, and the gem itself a gargantuan eye?</p>"
											); 
									if(!undum.game.storyViewController.eventFlags.last_lash_taken) {
										system.write(
											"<p>A lone gossamer strand of cultivated amethyst remains as its <a href='./take_eyelash'>last eyelash</a>.</p>"
										);
									}
									undum.game.storyViewController.jumpToNewContent();
								}
							} catch(err) {
								console.log("examine_oracle_opal; error occurred: "+err);
							}
						},
						"take_eyelash": function (character, system, action) {
							try {
								if(action) {
									system.write(
											"<p>You carefully pluck the impossibly delicate crystal from its socket and place it snuggly in your compartment.</p>"
									);
									undum.game.itemManager.addItem(character.mole, new Items.LastLash());
									undum.game.storyViewController.eventFlags.last_lash_taken = true;
									undum.game.storyViewController.jumpToNewContent();
								}
							} catch(err) {
								console.log("error taking Last Lash: "+err);
							}
						},
						"check_molerat_target": function (character, system, action) {
							if(action) {
								try {
									const itemManager = undum.game.itemManager;
									if (!itemManager.activeItemUseOn("nakedest molerat")) {
										system.write("<p>Examining this nakedest of molerats yields little but subtle nausea and an appreciation for the fortitude of female molerats.</p>");
									}
									undum.game.storyViewController.jumpToNewContent();
								} catch(err) {
									console.log(err);
								}
							}
						},
						calculateHeading: function () {
							const story = undum.game.storyViewController;
							if(story.eventFlags.molerat_devotee) {
								return "Brandishing a freshly gashed paw-stump, the Nakedest Molerat scrawls your praises upon the earth"
							} else if(story.eventFlags.molerat_actualized) {
								return "Calmness and an air of introspection has chased away the desperate fervor of the Nakedest Molerat's lair";
							} else {
								if(story.eventFlags.dark_mole) {
									return "The Nakedest Molerat stands in awe of your whole mole presence";
								} else {
									if (story.eventFlags.molerat_tickled) {
										return "The nakedest molerat rolls about in the musty dust, desperately euphoric in the throes of Tickles";
									} else {
										return "A naked molerat scrabbles furiously at an opal nearby, a decoration of broken claw bits and streaks of blood his only impact on it";
									}
								}
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
								undum.game.storyViewController.eventFlags.grue_challenge_activated = false;
								// give character the obol
								undum.game.itemManager.addItem(character.mole, new Items.OdditineObol());
								// send the mole back to molerat hub
								system.doLink("basement2_hub");
							} else if (character.sMoleMajorDestiny === "king of the deep") {
								if (character.sMoleMinorDestiny === undefined) {
									// grue follow-up for king of the deep
									system.write(
											"<p>A sigh like a deflating bellows ruffles your fur, from all possible angles surrounding you simultaneously, and the Grue queries, \"Tell me -- if you found a crown in these depths, what sort of king would you be?\"</p>"
									)
									
									system.writeChoices(system.getSituationIdChoices("#grue_gab_crown"));
								} else if (character.sMoleMinorDestiny === "tyrant") {
									// grue follow-up for a rival king of the deep
									system.write(
											"<p>Howling laughter buffets your from all angles, reminiscent of the fearsome sound of a tree tearing loose from its desperate grip on the earth before the relentless fury of a tornado.  \"What an intriguing specimen you are!  We will have much work to do together when the immediate threat is past.  Take this trinket and go, moleson.  It will anchor your mind to this world; the inexorable pull of all possible Elsewheres may consume you all the same, but this will give you a chance.\"</p><p>A heavy weight drops into your compartment, and in the next instant you are beside the Nakedest Molerat again.  The tunnel beneath the eye is gone; not collapsed but disappeared.  Digging in the area yields nothing but dirty claws.</p>"
									)
									// flip toggles to say that grue wants to be finaler boss but will give obol since the mole sounds worthy of confronting The Yawning God
									undum.game.storyViewController.eventFlags.grue_challenge_activated = true;
									// give character the obol
									// todo: creating items on the fly like this that are supposed to be unique is sloppy; it should be the case that we can only reach this gameplay path once, but the item instance sanity shouldn't depend on that.
									undum.game.itemManager.addItem(character.mole, new Items.OdditineObol());
									// send the mole back to molerat hub
									system.doLink("basement2_hub");
								} else if (character.sMoleMinorDestiny === "groovy") {
									// grue follow-up for a puppet/prey king of the deep
									system.write(
											"<p>Silence reigns for an uncomfortable span.  Soon your fur stands on end as you get the distinct impression that you are being heavily considered by an unknown and likely dangerous observer; it's the same feeling you get when passing a serpent's den.  Finally, a humid sigh issuing from much, much too close passes over you and frizzes your fur 'til you're a spherical fluffball.  \"How interesting, moleson.  Well, they always say those who do not desire leadership are the best leaders; don't pass up the opportunity too lightly if it comes your way... Take this coin with you -- it will help you to ground your mind even when psychic gravity turns off!\"</p><p>A heavy weight drops into your compartment, and in the next instant you are beside the Nakedest Molerat again.  The tunnel beneath the eye is gone; not collapsed but disappeared.  Digging in the area yields nothing but dirty claws.</p>"
									)
									// flip toggles to say that grue wants to be finaler boss but will give obol since the mole sounds worthy of confronting The Yawning God
									undum.game.storyViewController.eventFlags.grue_challenge_activated = false;
									// give character the obol
									undum.game.itemManager.addItem(character.mole, new Items.OdditineObol());
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
									undum.game.storyViewController.eventFlags.grue_challenge_activated = true;
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
									undum.game.storyViewController.eventFlags.grue_challenge_activated = false;
									// send the mole back to molerat hub
									system.doLink("basement2_hub");
								} else if (character.sMoleMinorDestiny === "enlightener") {
									// react to case where mole wants to probe secrets and then reveal them
									system.write(
											"<p>A bark like the rebuke of all Hell's lords become one in their arrogant disdain flattens you against an adjacent wall. \"Fool!  The Surfacers must not know of our splendor, lest they should covet it and infect our shadows with their sun.  They are not fit for our mysteries, and neither are you!\"</p><p>In the next instant you are beside the Nakedest Molerat again.  The tunnel beneath the eye is gone; not collapsed but disappeared.  Digging in the area yields nothing but dirty claws.</p>"
									)
									// Grue recognizes the mole as a terrible threat to the integrity of The Deepness
									undum.game.storyViewController.eventFlags.grue_challenge_activated = true;
									// send the mole back to molerat hub
									system.doLink("basement2_hub");
								} else if (character.sMoleMinorDestiny === "tingler") {
									// react to case where mole wants to probe secrets just for the thrill of it
									system.write(
											"<p>Rumbles quake your surroundings and resonate perfectly with your molecules, all of them, such that every tuft of fur and every drop of blood hums along. \"I know that feeling well, moleson.  We are like-minded, you and I, quivering with pleasure before mysteries of all stripes.  Remember, though, that not every moment can be pleasure.  You must be prepared for war; it draws near.\"  You get the distinct impression that the presence in the room has moved well within your bubble of personal space.</p><p>A heavy weight drops into your compartment, and in the next instant you are beside the Nakedest Molerat again.  The tunnel beneath the eye is gone; not collapsed but disappeared.  Digging in the area yields nothing but dirty claws.</p>"
									)
									// Grue likes the mole genuinely and wants him to survive
									undum.game.storyViewController.eventFlags.grue_challenge_activated = false;
									// give character the obol
									undum.game.itemManager.addItem(character.mole, new Items.OdditineObol());
									// send the mole back to molerat hub
									system.doLink("basement2_hub");
								}
							} /* end of eldritch delver major destiny*/				
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
				"",
				{
					enter: function (character, system, from) {
						system.write(
								"<p>A carronade of sound like the weaponized wail of tearing metal surrounded by a thunderclap rolls over you, presumably a bark of laughter.  \"Secrets, eh?  You'll find more than enough of those down here, to be sure.\"  Something slithers 'round your rump and casually rips a clump of fur free, then uses it to tickle your footpaws as it retracts back into the void.  \"Lost am I now, amidst wandrous wondering and wondrous wandering of a cerebral nature.  Does he hunt secret things to expand esotericism, casting shadows longer than ever, or to burn them all away with some such light of <i>truth</i>?  And which of these serves me?  Functional truth is whatever we choose to believe, after all, and as such light can be an infection vector as easily as a sterilizer...\"</p>"
						);
						// mod character to reflect the moleson's curious mystery
						character.sMoleMajorDestiny = "eldritch delver";
						system.writeChoices(system.getSituationIdChoices("#basement2_grue_convo_grow_secrets_elaboration_on_usage"));
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
				"",
				{
					enter: function (character, system, from) {
						// mod character to reflect the moleson's desire for tyrant status
						character.sMoleMinorDestiny = "tyrant";
						system.doLink("basement2_grue_hub");
					},
					optionText: function (character, system, situation) {
						return "I would rule with an " + (Libifels.isItemInInventory(character.mole, "caustic_claws") ? "acidic" : "iron") + " digging claw -- I would suffer no compromises with the surfacers, snuffing out their precious sun if they encroach upon The Deepness."
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
						var promiseOfWar = new Promise((resolve) => {


							// boss fight hyyyyype!  Give a combat UI within the transcript main content window; I'm thinking a relatively simple table plus some text and image output divs?
							// play the Yawning God cute lil' roar
							var yawningGodRoar = new Audio('audio/creatures/Skeleton Roar.mp3');
							yawningGodRoar.addEventListener('canplaythrough', e => {
								yawningGodRoar.play();
							});
							var mech = undum.game.combatViewController;
							var story = undum.game.storyViewController;
							undum.game.itemManager.feedbackContext = "combat";
							mech.enterCombat({playerParty: [story.charactersDict["mole"]], enemyParty: [story.charactersDict["yawning_god"]], musicUrl: "audio/music/yawning_god_theme.wav", persistStats: true, resultFn: resolve}); 
						}).then((playerVictory) => {
							console.log("thenning PromiseOfWar; playerVictory is "+playerVictory);
							undum.game.itemManager.feedbackContext = "story";
							if(playerVictory) {
								var yawningGodVictoryString = "The behemoth out of all the world's collective nightmare falls before your mighty digging claws, naught but a smoking ruin.  Your equally mighty tummy rumbles as the cavern is suffused with the scent of roasted fish-thing.";
								undum.game.storyViewController.writeParagraph(yawningGodVictoryString);	
								var promiseOfDarkness = new Promise((resolver) => {
									if(undum.game.storyViewController.eventFlags.grue_challenge_activated) {
										// scroll us to the latest transcript pos after the last fight
										undum.game.storyViewController.restoreStoryYPos();
										// transition to the grue fight 
										var grueApproachethString = "Something's veeeery wrong; the darkness surrounding you and the ruins of your smitten foe is purring.  Your insticts beg you to flee, but a quick glance around reveals that the darkness has solidified betwixt you and the exit tunnel whence you came into this outré nightmare.";
										undum.game.storyViewController.writeParagraph(grueApproachethString);	
										system.writeChoices(["basement3_encounter_grue"]);
										// todo: does this actually keep the promise from being resolved until the resolver is called?  There's some very weird behavior in the docs re: automatic promise resolving when a behavior function exits in certain cases...
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
							console.log("thenning PromiseOfDarkness; resultString is "+resultString);
							switch(resultString) {
							case "death":
								//system.doLink('death'); // we'll link up to death in the health quality processing over in UndumStoryViewController
								break;
							case "shadowed":
								// hint that something vile remains in the Deepness, a cheschire cat grin all of teeth flashing out of the distant void for an instant.
								undum.game.storyViewController.writeParagraph("The threat is neutralized, but you feel an almost overwhelming sense of dread still hanging in the air... in every shadow you see a glimmer of glittering fangs bared in a rictus grin, just for an instant.  You're almost certain you're not insane, though upon checking you never find anything there.  Well, these things will happen in the Deep places of the world.");
								break;
							case "dark_king":
								// reduce sanity cost of Dark Mole powers by half; this combined with the Odditine Obol is the only circumstance where the player can achieve a score in the best hero/villain ending threshold!
								undum.game.storyViewController.eventFlags.madness_mail = true;
								break;
							}
							if(resultString !== "death") {
								const deepOneString = "Before you can fully process what has transpired, you feel a shadowy mantle slip over your shoulders, and thorned crown make its nest in bloody fur atop your noodle, clasping shut like a manacle.  A great and terrible something has come upon you, a power unwanted but irrepressible and undeniable.  Its poisonous whispers flit through your mind like tendrils of blight, corrupting your thoughts more thoroughly with each passing moment.";
								const breachTheDeepString = "With a burst of effort you manage to clamber back up to the Middlin Depths and the Nakedest Molerat's demesne.  He eyes you warily as you emerge, steam and volcanic gases whicking off your coat like a thousand thousand wildfire candles all snuffed by your very presence, but you pay him no mind and simply flop down in an exhausted puddle of fuzz.  The Deep tunnel behind you collapses soundlessly, swallowing the eldritch opal eye; the gentle last-gasp vibrations of a fading quake serve as the lone humble herald of its passing.";
								undum.game.storyViewController.writeParagraph(deepOneString);
								undum.game.storyViewController.writeParagraph(breachTheDeepString);
								undum.game.storyViewController.eventFlags.dark_mole = true;
								undum.game.itemManager.addItem(character.mole, new Items.DarkMantle());
								system.writeChoices(["basement2_return_from_depths"]);
							}
							// now that our transcript is visible again, scroll to top of new content pos
							undum.game.storyViewController.restoreStoryYPos();
						});
//						todo: dark mole epilogue: send player to basement2 hub and let them do as they please with new skull of mondain style evil actions with each character AND magical good actions e.g. curing them of their Rumbly corruption; each usage costs sanity but adds to the hero/villain scores greatly.  Characters should recognize him as the source of the rapturous rumble now, too.  Player can do with them as they see fit, and upon surfacing they can choose to wash off the Darkness in the sunlight or harness it to darken the sky and wage war upon the humans and other surfacers...
					},
					optionText: "Burrow towards the Deepest Deepness"
				}
		),
		"basement2_return_from_depths": new undum.SimpleSituation(
				"",
				{
					enter: function(character, system, from) {
						system.doLink("basement2_hub");
					},
					optionText: "Shake off the dust of the depths..."
				}
		),
		"basement3_encounter_grue": new undum.SimpleSituation(
				"",
				{
					enter: function (character, system, from) {
						new Promise((combatResolver) => {
							var grueRoar = new Audio('audio/creatures/eatmind.wav');
							grueRoar.addEventListener('canplaythrough', e => {
								grueRoar.play();
							});
							var mech = undum.game.combatViewController;
							var story = undum.game.storyViewController;
							undum.game.itemManager.feedbackContext = "combat";
							// up in basement3_encounter_yawning_god::enter() I shoved the latest Promise resolver (for promiseOfDarkness) onto the storyVC as activeResolver, so pass in here so it can be resolved when combat is over
							mech.enterCombat({playerParty: [story.charactersDict["mole"]], enemyParty: [story.charactersDict["grue"]], musicUrl: "audio/music/grue_theme.wav", resultFn: combatResolver});
						}).then((combatResult) => {
							undum.game.itemManager.feedbackContext = "story";
							const terminusResolver = undum.game.storyViewController.activeResolver;
							// if we won, call terminres over 'dark_king', else call it with 'death'. 'shadowed' happened up above because we never got into the grue fight in that eventuality.
							if(combatResult) {
								terminusResolver('dark_king');
							} else {
								terminusResolver('death');
							}
						});
					},
					optionText: "Something stirs just out of sight, and shadows slither closer...  Show this new abomination what a mole is made of!"
				}
		),
		dark_mantle_spider_gentle_no_thx: new undum.SimpleSituation(
				"",
				{
					enter: function(character, system, from) {
						const story = undum.game.storyViewController;
						story.writeParagraph("You tap into your newfound power just enough to cast a gentle shroud of suggested indifference re: moleflesh upon your admirer as she gazes longingly at you, hoping to dull her passion before you let her down.  \"Sorry miss, I'm flattered but not interested in romance.  Let's exchange soilphone numbers, tho, for sure!  You're fun and I wanna keep in touch.\"  She blinks in a lidless and mildly dejected manner, but bounces back quickly; she takes your number down and assures you she'll text you later so you have hers.  What an odd protocol we conform to for the Rejection Dance.");
						story.eventFlags.spider_rejected = true;
						story.addToCharacterQuality("moleWhole", 2.5);
						story.subtractFromCharacterQuality("sanity", 15);
						system.doLink("basement1_bulbous_spider_hub");
					},
					optionText: "She looks a teensy bit wildly enraptured, like she might get bitey if you turn her down... Maybe just sorta nudge her brain into a more chill place and then let her down gently?"
				}
		),
		dark_mantle_spider_manyfold_embrace: new undum.SimpleSituation(
				"",
				{
					enter: function(character, system, from) {
						const story = undum.game.storyViewController;
						story.writeParagraph("You lean in close and nuzzle your muzzle against her venom-drenched mandibles, very carefully, and rumbly-purr, \"I'm so into you... I wish I had, um, even half as many eyes as you do so I could look at you from myriad angles all at once.\"  You wanted to mention the exact number of her eyes to make the comment smoother, but you can't count that high.  She clacks her mandibles rapidly to produce a disturbing chittering vibration, which you hope is her version of a smile.");
						story.writeParagraph("In the next instant you find yourself wrapped up in a forest of sleek chitony legs a bit like shadowy sexy stockings slid over jagged obsidian.  With no runs!  Her venom proves to actually be quite an interesting cocktail of aphrodisiac and narcotic at just the right dose, delivered by a bitey kiss!  You revel and cavort in this manyfold embrace with her for a bit, and the details are best left to the tortured lanes of unbidden imagination.");
						story.eventFlags.spider_loved = true;
						story.addToCharacterQuality("moleWhole", 5);
						story.subtractFromCharacterQuality("health", 10);
						story.subtractFromCharacterQuality("sanity", 10);
						system.doLink("basement1_bulbous_spider_hub");
					},
					optionText: "Oh fuzz, forget the eldritch thingamajig and just kiss the girl!  Kiss her!  She's only a little pointy and terrifying, it'll be fine.  This is fine."
				}
		),
		dark_mantle_spider_flash: new undum.SimpleSituation(
				"",
				{
					enter: function(character, system, from) {
						const story = undum.game.storyViewController;
						story.writeParagraph("You stalk towards the blushing spider and she shies away, sensing more aggression than she anticipated from one of your woolly ilk.  There is no escape from inevitability itself, however, and a chittering shriek escapes her quivering fangs as you activate the Dark Mantle and bear your newly realized true form to her.");
						story.writeParagraph("Mind-bending angles, impossible polyhedra, and a nest of hook-beaked tentacles writhing in a multitude to shame any earthly cephalopod fill her sight, and the flash of fiery magnificence wreathing the lot burns away her many staring eyes.  Incidentally, most spiders don't have tear ducts, or the emotional capacity to make use of them, but this special lady did.  It's worth noting because they've now been cauterized -- judging by the hissing steam rising from them now as if from volcanic wounds, if she could be weeping at once with transcendent joy and infinite despair, she would be.");  
						story.writeParagraph("The glimpse she caught of your majesty has shattered her mind to bouncing razor-edged fragments, rending her to bits from the inside out.  You don your mole-y disguise once more and leave her to her suffering.");
						story.eventFlags.spider_flashed = true;
						// massive renegade hit & sanity crush
						story.subtractFromCharacterQuality("moleWhole", 10);
						story.subtractFromCharacterQuality("sanity", 40);
						system.doLink("basement1_bulbous_spider_hub");
					},
					optionText: "She is clearly infatuated with you, and rightly so, but the poor little lustful mortal dear can't know the power she's flirting with... Enlighten her!"
				}
		),
		dark_mantle_ooze_devour: new undum.SimpleSituation(
				"",
				{
					enter: function(character, system, from) {
						const story = undum.game.storyViewController;
						story.writeParagraph("Noting your staring lack of genuflection, the ooze wobbles as it roars, \"Who goes there?  What manner of beast stands before my wiggly magnificence when kings with gods for mounts make it a habit to kneel?  I wonder what such brazen arrogance tastes like...\"");
						story.writeParagraph("Not bothering to waste your precious breath on this filth, you silently tap into your dark inheritance and coerce a pair of eyes onto the creature's hide; you want it to see what comes next.  The ooze howls in rage and confusion as its form is forcefully mutated, but this wailing is mere gentle humming to the symphony of despair you crave.  Transforming into your true form, one of lashing shadow tendrils at once black as night and blindingly, searing bright, you grin at the ooze.  The countless mismatched teeth this action bares from the mouths that cover nearly every square centimeter of your body seem to upset your quarry.");
						story.writeParagraph("In a moment that feels like a serrated eternity wrapped in the boundless voidscape of forever, you rend the ooze asunder.  You toss every drop of its amorphous mass into the air playfully before snapping it down.  Each bead of wild life has a different flavor and you allow each to roll languidly down your many, many barbed tongues like molten gemdrops of honey.  Before you can blink any of your innumerable eye-like constructs, the ooze is no more than a lingering stench in its erstwhile cave; a lonely wind whispers over the dais upon which it sat in wobbledy sovereignty, a symphony of glorious emptiness.");
						story.writeParagraph("You feel renewed power flood your vitals as the ooze's essence is digested, though blood also flows freely from your snout -- this may relate to the relentless thunderbolts of pain now raging through your brain.");
						story.eventFlags.ooze_devoured = true;
						story.addToCharacterQuality("health", character.mole.stats.maxHP);
						story.subtractFromCharacterQuality("sanity", 25);
						story.subtractFromCharacterQuality("moleWhole", 5);
						system.doLink("basement1_ochre_ooze_hub");
					},
					optionText: "The natural order has been shaken -- prove it by devouring this apex predator and taking the power of its myriad absorbed prey souls into yourself!"
				}
		), 
		
		dark_mantle_ooze_gel_inverse_resurrection: new undum.SimpleSituation(
			"",
			{
				enter: function(character, system, from) {
					const story = undum.game.storyViewController;
					story.writeParagraph("You can sense Gel inside the ooze.  Her constituent atoms, actually, but you're confident you can stitch her back together just as she was, probably, from the ooze's mass.  Maybe you could even make her the dominant personality.  With a wiggle of your snoot and a whisper of whiskers you mark all the bits of Gel within the ooze and smash them together!");
					story.writeParagraph("With utmost care, of course.  You knew her well and can (now) perfectly map out her neural network and the state it was in when she died.  Memories, feelings, personality -- you can see each facet of her being, written in the complexities of neurochemistry that you suddenly have at your beckon call.  It's alarmingly simple to reassemble her body and soul, while the ooze shrieks in agony.");
					story.writeParagraph("The ooze exhibits a curious inversion: it depletes into a tiny droplet as you wave your whiskers and claws about, directing its bits through the air like the conductor of a surgical symphony, and slowly starts to expand again as you rewrite it to the tune of Gel.  Expanding her brain to span the ooze's entire mass is simplicity itself since ooze neurogenics scale gracefully, especially if you're not concerned with preserving the existing consciousness.");
					story.writeParagraph("In short order the ooze is reformed with Gel alive and well and at the conn!  \"What happened?\" she asks, surprise rippling across her morphology.  \"My progenitor consumed me and I... I was in pain, then everything went dark!  I should be dead.  How am I here?  And why am I so big?\"  She forms a pair of eyestalks and examines herself, wiggling and waggling experimentally.  \"Wowie, now those are geodesic curves!  Now I know why they're called GREAT circle arcs.\"  She blushes neon pink through-and-through, and shivery quivers of pleasure have her practically vibrating.");
					story.writeParagraph("You give her a grin, tap your noodle respectfully, and toddle off without further comment.  There's only a minor twinge as the opposed force generated by a reality that stubbornly fought your whimsy before bending to it rebounds endlessly inside your skull.");
					story.eventFlags.curvy_gel = true;
					story.subtractFromCharacterQuality("sanity", 10);
					story.addToCharacterQuality("moleWhole", 5);
					system.doLink("basement1_ochre_ooze_hub");
				},
				optionText: "With your new Awareness, you can sense that your wiggly jiggly galpal Gel is still inside the ooze, albeit in pieces.  Maybe you could bring her back..."
			}
		),
		dark_mantle_ooze_gel_merciful_prison: new undum.SimpleSituation(
				"",
				{
					enter: function(character, system, from) {
						const story = undum.game.storyViewController;
						story.writeParagraph("Setting aside your rage and dredging up mercy for the sake of your beloved Gel, you tear your eyes away from the vile and vulnerable ooze.  With a flourish of mighty digging claws, you cast a shimmering forcefield around the ooze's throne.  The field forms a beautiful swirling starscape mesh, far more glorious a prison than this vermin deserves, but still it rails and rages against its confines the instant they appear.");
						story.writeParagraph("Not even the power of the legendary ooze can shake your cosmic construction, however, so in short order the ooze collapses into a blue puddle of defeat. \"Release me, mole!  You have no right to imprison a force of nature, a primal god such as we!\"  You turn your back on it disdainfully, and grin as its quaking tantrum resumes.  It will never starve, but hunger will gnaw at its core until the end of time.  Gel performs a wobbledy twirl in thanks, but seems a bit subdued as she catches sight of your glee.");
						story.eventFlags.ooze_prisoner = true;
						story.subtractFromCharacterQuality("sanity", 10);
						story.addToCharacterQuality("moleWhole", 10);
						system.doLink("basement1_ochre_ooze_hub");
					},
					optionText: "Gel wobbles in her urn, piping up, \"It is ruthless and voracious, true, but the ooze is still my parent.  Could we spare it and maybe just lock it up, please?  Regardless, I love you *^_^*!\""
				}
		),
		dark_mantle_molerat_worship: new undum.SimpleSituation(
				"",
				{
					enter: function(character, system, from) {
						const story = undum.game.storyViewController;
						story.writeParagraph("\"I will free you from your mundane prison, molerat.  In return, you will serve as my Voice among the Deep Folk.  You will spread the Word of Mole, as you shall hear it spoken in your brain presently!\"  With this impromptu proclamation and no particular plan, you transform into your true form.");
						story.writeParagraph("The nakedest molerat cowers away from your magnificence at first, but then crawls nearer to bask in your outré grandeur.  Innumerable wings dripping liquid shadow unfold from your amorphous form, beating at the air in supercilious indifference.  The molerat's cheeks flap as you buffet him with eldritch winds, and he glories in your presence.");
						story.writeParagraph("Shooting four of your tendrils directly into his brain, you communicate the myriad visions of alien majesty and the secrets of unknowable dimensions.  His eyes go wide and his jaw slackens, and you hum gently in pleasure.  When his glimpse of the wild new reality following you like the wake of a tsunami threatens to melt his mind, you disengage.  Returning to moleform, you pat the molerat on the head with a heavy claw, assuring him that his reverence will be rewarded in the new order.");
						story.eventFlags.molerat_devotee = true;
						story.subtractFromCharacterQuality("sanity", 25);
						story.subtractFromCharacterQuality("moleWhole", 10);
						system.doLink("basement2_hub");
					},
					optionText: "Show this pathetic little creature the majesty he yearns for!"
				}
		),
		dark_mantle_molerat_clarity: new undum.SimpleSituation(
				"",
				{
					enter: function(character, system, from) {
						const story = undum.game.storyViewController;
						story.writeParagraph("You sit the molerat down and gently start bandaging his paws. \"Feels good, no?  What do you think about that?\" you ask him, leadingly.");
						story.writeParagraph("He huffs and turns his quivering snout away from yours. \"Yes it feels fine, but what does any of it matter?!  You're no god at all, are you?  There never was one!  The Rumble is already fading... I can't even remember its glory.  What greater power is there for we lowly worthless crawling critters of the earth to venorate now?  And in the absence of Something Greater to serve, what reason have we to continue struggling on?  Existence is pain and noiseome fury, and I am so very weary.\"");
						story.writeParagraph("He collapses, sobbing, against your woolly stout shoulder, lamenting the dearth of esoteric magic in his life.  You pat his head soothingly, and in time his grief abates somewhat.  Rushing in to fill its place, of course, comes the dreadful calm of existential emptiness that presages true tragedy.  Recognizing the rising scourge, you plant yourself steadfastly between the molerat and oblivion's hungry grasp. \"Easy now, friend.  Feel my paw, listen to my heartbeat.  Being healed and comforted by a friend feels good.  Snacking with a friend feels good.\"");
						story.writeParagraph("You draw a juicy grub from your compartment and break off a segment for the molerat, chowing down on the slime-dripping remainder yourself.  \"This may seem axiomatic and therefore, perhaps, pointless, but the fundamental pleasant truth of these everyday experiential treasures is their magic!  Using these wonderful little quanta as building blocks, we can construct grand soaring cathedral matrices of meaning; love and family and precious friendship in arbitrary abundance, whatever we're willing to work for together!  So, toss your notions of what sort of eldritch grandeur from beyond a thing requires to be worthwhile, and explore the magic we have to work with all around us.  Start with a big ol' hug, and carry on wherever that takes you!  Adventure!\"");
						story.writeParagraph("Driving your point home, you wrap the molerat up in a bonecrushing embrace, tweak the snout at the end of his confused-but-thoughtful face fondly, and then waddle on off to continue your own adventure.");
						story.eventFlags.molerat_actualized = true;
						story.addToCharacterQuality("moleWhole", 10);
						system.doLink("basement2_hub");
					},
					optionText: "Whatever has come upon you, you remain a mere mole -- explain your normalcy to the molerat, and teach him that everyday wonders are those most worthy of worship."
				}
		),
		dark_mantle_caterpillar_worm_to_wyrm: new undum.SimpleSituation(
				"",
				{
					enter: function(character, system, from) {
						const story = undum.game.storyViewController;
						story.writeParagraph("With a twist of your mind that reality is forced to warp to accommodate, the last of the fuzz is torn from the now fuzzless caterpillar's form.  He shrieks in agony as heavily scaled carapace replaces it, thoughtfully articulated to capitalize on his limitless flexibility while turning him into a crawling tank.  In the space of a few moments, the transformation is complete and the newly formed Crawl Wyrm before you shakes its mighty fanged head to clarify his perception of an abruptly new reality.  You nod to your very own living weapon, indicating that he should ready himself for war.");
						story.eventFlags.caterpillar_wyrm = true;
						story.subtractFromCharacterQuality("moleWhole", 10);
						story.subtractFromCharacterQuality("sanity", 25);
						system.doLink("basement1_fuzzy_caterpillar_hub");
					},
					optionText: "His useless fuzz is almost gone... finish what the Yawning God began and help the caterpillar realize his jagged destiny!"
				}
		), 
		dark_mantle_caterpillar_fuzzy: new undum.SimpleSituation(
				"",
				{
					enter: function(character, system, from) {
						const story = undum.game.storyViewController;
						// describe restoring the caterpillar to his old sunny, fuzzy self
						story.writeParagraph("With a little push and a few stitches in the fabric of spacetime, reality spins off on a friendlier vector: the caterpillar gasps as the black veins beneath his bald flesh recede and a clamness settles over his being.  Fuzz in alternating strips of cool autumn auburn and cozy-hearth warm gold cover his segments, in fuller proportions than ever before!  He wraps his entire length around you in The Woolliest Hug, and plants a grateful kiss on your brow.");
						story.eventFlags.caterpillar_woolly = true;
						story.addToCharacterQuality("moleWhole", 5);
						story.subtractFromCharacterQuality("sanity", 20);
						system.doLink("basement1_fuzzy_caterpillar_hub");
					},
					optionText: "What once was fuzzy can be made so again - bring peace to your scrunchedy fren and restore his wonderful woolly worm form!"
				}
		), 
		dark_mantle_caterpillar_entombed_flight: new undum.SimpleSituation(
				"",
				{
					enter: function(character, system, from) {
						const story = undum.game.storyViewController;
						// describe how the whole butterfly kick doesn't work well underground, and this butterfly in particular is all sharp edges and dripping venom that seems to burn its own body
						story.writeParagraph("\"No, it's too soon!  Not here!\" the caterpillar howls as his flesh rapidly melts away.  Two spiny wings dripping with venom explode in a shower of blood and ichor from his back; the acidic venom burns the surrounding soil and the caterpillar's hide alike.  The wings are covered in gorgeous scales spanning a gradient of velvety midnight blue to soothing mystery purple.  Six spear-like legs thrust forth from his underbelly, each tipped with a complex serrated pincer apparatus.");
						story.writeParagraph("The newly forged butterfly groans in agony, giving his wings an experimental flap.  There's not even enough room in the cavern to fully unfurl them, and he screams as they're bent by the entombing earth.  \"What've you done, mole?!  I can't escape this place with these wings.  I'll wither to nothing but pain locked away in here!\"");						
						// slight hit to shovelry since the player should have realized this would not be great underground AND is, as stated, a blighted transformation
						story.subtractFromCharacterQuality("moleWhole", 2);
						story.subtractFromCharacterQuality("sanity", 10);
						system.writeChoices(["dark_mantle_caterpillar_entombed_flight_observation", "dark_mantle_caterpillar_entombed_flight_liberation"]);
					},
					optionText: "Perhaps you should nudge along his Becoming -- help him out of his blighted miserable molt by accelerating his transformation, after which he can fly free!"
				}
		),
		dark_mantle_caterpillar_entombed_flight_liberation: new undum.SimpleSituation(
				"",
				{
					enter: function(character, system, from) {
						const story = undum.game.storyViewController;
						// describe mole frenziedly fixing his mistake
						story.writeParagraph("\"Sorry sorry sorry sorry!\" you chant as you quickly suss out the quantum wave functions that must be collapsed to shove your friend into a timeline where you didn't turn him into a butterfly underground.");
						story.addToCharacterQuality("moleWhole", 5);
						system.doLink("dark_mantle_caterpillar_fuzzy");
					},
					optionText: "Fixitfixitfixitfixit!  Fixitfixitfixitfixit!"
				}
		), 
		dark_mantle_caterpillar_entombed_flight_observation: new undum.SimpleSituation(
				"",
				{
					enter: function(character, system, from) {
						const story = undum.game.storyViewController;
						// describe mole deriving perverse pleasure from watching butterfly entombed, purposefully leaving him that way even after witnessing the consequences
						story.writeParagraph("You watch, a rictus grin spreading from ear to ear, as the butterfly struggles.  He will be trapped here forever, as he predicted, though the pain will be worse than her realizes -- those wings will continue to grow until he can't avoid having them uncrumpled by his prison.  It will be torment everlasting, and your dark soul quivers at the power you will syphon from his suffering.");
						story.eventFlags.caterpillar_entombed_forever = true;
						story.subtractFromCharacterQuality("moleWhole", 10);
						system.doLink("basement1_fuzzy_caterpillar_hub");
					},
					optionText: "Watch him flap and flounder for a bit; you enjoy osmotic feeding on the suffering of others, especially when you are the architect thereof."
				}
		), 
		death: new undum.SimpleSituation(
				"<strong>💀 IT IS A SAD THING THAT YOUR ADVENTURES HAVE ENDED HERE 💀</strong> <div class='transient'><a href='main'>Oh, Mother of Moles!  Try Again?</a></div>"
		),
		credits: new undum.SimpleSituation(
				"<ul>\
				<li>undum: https://github.com/idmillington/undum</li>\
				<li>mole-opening.png: https://pixabay.com/users/Beeki-2666/</li>\
				</ul>"
		)
}

/* The id of the starting situation. */
undum.game.start = "main";

/* Here we define all the qualities that our characters could
 * possess. We don't have to be exhaustive, but if we miss one out then
 * that quality will never show up in the character bar in the UI. */
undum.game.qualities = {
		health: new undum.NumericQuality(
				"Health", { priority: "0001", group: 'stats' }
		),
		mana: new undum.NumericQuality(
				"Mana", { priority: "0002", group: 'stats' }
		),
		sanity: new undum.NumericQuality(
				"Sanity", { priority: "0003", group: 'stats' }
		),
		moleWhole: new BurrowAdjectivesQuality(
				"<span title='One&apos;s ability to dig is not measured in kilograms of displaced dirt -- rather, it must take into account all the courage, curiosity, and tenacity required of tunnelers of all stripes.  What can your claws do?  Where can they take you?  We shall see!'>Mole Whole</span>",
				{ priority: "0004", group: 'stats' }
		)
};

//---------------------------------------------------------------------------
/* The qualities are displayed in groups in the character bar. This
 * determines the groups, their heading (which can be null for no
 * heading) and ordering. QualityDefinitions without a group appear at
 * the end. It is an error to have a quality definition belong to a
 * non-existent group. */
undum.game.qualityGroups = {
		stats: new undum.QualityGroup(null, { priority: "0001" })
};

//---------------------------------------------------------------------------
/* This function gets run before the game begins. It is normally used
 * to configure the character at the start of play. */
undum.game.init = function (character, system) {
	character.mole = undum.game.storyViewController.charactersDict.mole;
	// todo: currently need to reset items before resetting character models because we've got some items (e.g. CausticClaws modifying the character core stats)
	undum.game.itemManager.resetItems();
	undum.game.storyViewController.resetStory();
	system.setCharacterText("<p>You are starting on an exciting journey beneath the earth and beyond all reason.</p>");
};
//-----end game logic-----//