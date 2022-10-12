const abash = {
	startUp() {
		console.log("wangBu loaded successfully");
		
		// declare namespace variables
		var currentArea = "";
		var prioList = {};

		// In case of package reset, unsubscribe from all associated events
		eventBus.unsubscribe('denizenSlain', 'denSlain');
		eventBus.unsubscribe('affRemProne', 'attackReady');
		eventBus.unsubscribe('affRemParalysis', 'attackReady');
		eventBus.unsubscribe('affRemBound', 'attackReady');
		eventBus.unsubscribe('affRemEntangled', 'attackReady');
		eventBus.unsubscribe('affRemTransfixation', 'attackReady');
		eventBus.unsubscribe('affRemWebbed', 'attackReady');
		eventBus.unsubscribe('affRemStunned', 'attackReady');
		eventBus.unsubscribe('onEq', 'attackReady');
		eventBus.unsubscribe('onBal', 'attackReady');

		if(!nexusclient.variables().get("basharrrPrioList")) {
			nexusclient.display_notice("There's no bashing prio list!!!", "red");
			abash.prioList = {};
			nexusclient.variables().set("basharrrPrioList", abash.prioList);
		} else {
			abash.prioList = nexusclient.variables().get("basharrrPrioList");
			nexusclient.display_notice("Bashing Prio List loaded into repo!", "green");
		}

		// Trigger: When a denizen is slain

		const denSlain = function(denizen) {
			var slainDenizen = denizen;
			abash.currentArea = nexusclient.datahandler().GMCP.Location.areaname;
			var prioList = nexusclient.variables().get("basharrrPrioList");

			if(abash.prioList[abash.currentArea]) {
				// Area already exists in prio list
				var denizenList = abash.prioList[abash.currentArea];
				console.log(denizenList);
				if(!denizenList.includes(slainDenizen)) {
					nexusclient.display_notice("|WANGBU| New denizen added", "yellow");
					denizenList.push(slainDenizen);
					abash.prioList[abash.currentArea] = denizenList;
					nexusclient.variables().set("basharrrPrioList", abash.prioList);
				}
			} else {
				// Area does not exist in prio list
				var denizenList = [];
				denizenList.push(slainDenizen);
				abash.prioList[abash.currentArea] = denizenList;
				console.log(abash.prioList);
				nexusclient.variables().set("basharrrPrioList", abash.prioList);
				nexusclient.display_notice("|WANGBU| New area added", "yellow");
				nexusclient.display_notice("|WANGBU| New denizen added", "yellow");
			}

			abash.attackThings();
		}
		eventBus.subscribe('denizenSlain', denSlain, 'denSlain');

		// Trigger: Main attack trigger
		const attackReady = function() {
			abash.commitAttack();
		}
		eventBus.subscribe('affRemProne', attackReady, 'attackReady');
		eventBus.subscribe('affRemParalysis', attackReady, 'attackReady');
		eventBus.subscribe('affRemBound', attackReady, 'attackReady');
		eventBus.subscribe('affRemEntangled', attackReady, 'attackReady');
		eventBus.subscribe('affRemTransfixation', attackReady, 'attackReady');
		eventBus.subscribe('affRemWebbed', attackReady, 'attackReady');
		eventBus.subscribe('affRemStunned', attackReady, 'attackReady');
		eventBus.subscribe('onEq', attackReady, 'attackReady');
		eventBus.subscribe('onBal', attackReady, 'attackReady');

	}, // End startUp()
	
	attackThings() {
		// nexusclient.display_notice("Running attackThings function!", "yellow");
		var roomItems = nexusclient.datahandler().GMCP.Items.room;
		abash.prioList = nexusclient.variables().get("basharrrPrioList");
		abash.currentArea = nexusclient.datahandler().GMCP.Location.areaname;
		var enemyList = abash.prioList[abash.currentArea];
		var enemyFound = false;
		//nexusclient.display_notice("enemyFound = false", "yellow");
		var myClass = nexusclient.datahandler().GMCP.Status.class;
		//nexusclient.display_notice(myClass, "yellow");
                //   if(myClass == "Runewarden") {
                //      myClass = nexusclient.datahandler().GMCP.CharStats[2];
                //   }
		var tempPrep = "";
		var tempAttack = "";
		var bashing = nexusclient.variables().get("bashing");
		var tar = nexusclient.variables().get("tar");
		//nexusclient.display_notice(bashing, "yellow");

		//tempPrep = "";
		//tempAttack = "tide clobber";
		
		switch (myClass) {
			case "Tidesage":
				tempPrep = "tide hightide";
				tempAttack = "tide clobber";
				break;
		//	case "Red Dragon":
		//		tempAttack = "gut";
		//		break;
		//	case "Depthswalker":
		//		tempAttack = "shadow reap";
		//		break;
		//	case "Druid":
		//		tempAttack = "maul";
		//		break;
		//	case "earth Elemental Lord":
		//		tempAttack = "terran pulverise";
		//		break;
		//	case "Jester":
		//		tempAttack = "bop";
		//		break;
			default:
				tempAttack = "kill";
				break;
                }
   
  		nexusclient.variables().set("atkPrep", tempPrep);
		nexusclient.variables().set("atkCommand", tempAttack);

		roomItems.forEach(function(el) {
			if(enemyList && enemyFound == false) {
				enemyList.forEach(function(el2) {
					if(el.name == el2) {
						enemyFound = true;
						nexusclient.display_notice("|WANGBU| target sighted!", "green");
						nexusclient.datahandler().send_command("st " + el.id);
					}
				});
			}
		});

		if (enemyFound == false) {
			if (tar) {
				nexusclient.display_notice("|WANGBU| manual target", "yellow");
				nexusclient.variables().set("bashing", true);
				nexusclient.datahandler().send_command(tempPrep);
				nexusclient.datahandler().send_command(tempAttack);
			} else {
				nexusclient.display_notice("|WANGBU| No targets found", "yellow");
				//nexusclient.datahandler().send_command("st none");
				nexusclient.variables().set("bashing", false);
			}			
		} else if (bashing == false) {
			nexusclient.variables().set("bashing", true);
			nexusclient.datahandler().send_command(tempPrep);
			nexusclient.datahandler().send_command(tempAttack);
		}
	}, // End attackThings()

	stopattackThings() {
		// nexusclient.display_notice("Running stopattackThings function!", "yellow");
		var roomItems = nexusclient.datahandler().GMCP.Items.room;
		abash.prioList = nexusclient.variables().get("basharrrPrioList");
		abash.currentArea = nexusclient.datahandler().GMCP.Location.areaname;
		var enemyList = abash.prioList[abash.currentArea];
		var enemyFound = false;
		// nexusclient.display_notice("enemyFound = false", "yellow");
		var tempPrep = "";
		var tempAttack = "";
		var bashing = nexusclient.variables().get("bashing");

		nexusclient.display_notice("|WANGBU| Stop attacking!", "green");
		//nexusclient.datahandler().send_command("st none");
		nexusclient.variables().set("bashing", false);
		
	}, // End stopattackThings()

        runCommand(suffix) {
                var command = suffix;
		
		if (command.startsWith("remove prio")) {
			var enemyRemoval = command.slice(12);
			abash.currentArea = nexusclient.datahandler().GMCP.Location.areaname;
			var enemyList = abash.prioList[abash.currentArea];
			var enemyFound = false;
			
			enemyList.forEach(function(el) {
				if(el == enemyRemoval) {
					enemyFound = true;
				}
			})
			
			if (enemyFound) {
				var enemyIndex = enemyList.indexOf(enemyRemoval);
				if (enemyIndex !== -1) {
  					enemyList.splice(enemyIndex, 1);
					abash.prioList[abash.currentArea] = enemyList;
					nexusclient.display_notice("|WANGBU| Enemy removed from prio list", "green");
				}
			} else {
				nexusclient.display_notice("|WANGBU| Enemy not found in this area.", "red");
			}
		} else {

	                switch (command) {
				
				case "help":
					nexusclient.display_notice("ABash Help", "white");
					nexusclient.display_notice("-----------------", "white");
					nexusclient.display_notice("abash show prios here - list prio denizens in current area", "white");
					nexusclient.display_notice(" - click on red X to remove a denizen from the prio list", "white");
					break;
				case "show prios here":
					abash.currentArea = nexusclient.datahandler().GMCP.Location.areaname;
					var enemyList = abash.prioList[abash.currentArea];
					var str = "<span style='color:white'>Area: " + abash.currentArea + "</span>\n";
					str += "<span style='color:white'>-----------------</span>\n";
					enemyList.forEach(function(el) {
						str += "<span style='white'>[</span><span style='color:red' onClick='(function() { abash.runCommand(\"remove prio " + el + "\") })();'> X </span><span style='color:white'>] " + el + "</span>\n";
					});
					str += "<span style='color:white'>-----------------</span>\n";
					nexusclient.add_html_line(str);
					break;
				default:
					nexusclient.display_notice("Command not recognized.", "white");
			}
                }

        },

	commitAttack() {
		var bashing = nexusclient.variables().get("bashing");

		if(bashing) {
			//var atkCommand = "gut";
			var atkPrep = nexusclient.variables().get("atkPrep");
			var atkCommand = nexusclient.variables().get("atkCommand");

			nexusclient.datahandler().send_command(atkPrep);
			nexusclient.datahandler().send_command(atkCommand);
		}
	} // End commitAttack()

} // End of namespace

window.abash = abash;
