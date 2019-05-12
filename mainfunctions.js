
$( document ).ready(function() {

	// init stuff
	isLand();
	resTab();

	// global variable for last clicked/hovered spot on map
	var clickedspot = "";
	var hoveredspot = "";

	// tooptips on build menu
	$('.tooltipcl').mouseover(function() {
		var tooltiptext = $(this).attr('data-tooltip');
		var position = $(this).offset();
		$('#maintooltip').css({"top": (position.top + 3), "left": (position.left + 50)});
		$('#maintooltip').text(tooltiptext);
		$('#maintooltip').show();
	}).mouseout(function () {
		$('#maintooltip').text('').hide();
	});


	// land and water buttons in topbar
	$('#watermap').click(function () {
		isWater();
	});
	$('#landmap').click(function () {
		isLand();
	});


	// yellow hover effect on map
	$('#cityholder td').mouseover(function () {
		if ( $('#cityholder').hasClass('landlocked') && $(this).hasClass('la') ) {
			$(this).css("background-color","rgba(246,221,149,0.2)");
		}
		if ( $('#cityholder').hasClass('waterside') && $(this).hasClass('wa') ) {
			$(this).css("background-color","rgba(246,221,149,0.2)");
		}
	}).mouseout(function () {
			$(this).css("background-color","transparent");
	});


	// updating clickedspot, and opening build menu, on click
	$('#cityholder td').click(function () {
		$('td.activetd').removeClass('activetd');
		if ( $('#cityholder').hasClass('landlocked') && $(this).hasClass('la') ) {
			clickedspot = $( $(this).children('div') ).attr('ID');
			$(this).addClass('activetd');
			$('#selectabuildingmenu').show();
		}
		if ( $('#cityholder').hasClass('waterside') && $(this).hasClass('wa') ) {
			clickedspot = $( $(this).children('div') ).attr('ID');
			$(this).addClass('activetd');
			$('#selectabuildingmenu').show();
		}
	});
	// when a building on the build menu gets clicked, place the building on the map
	$('.b').click(function() {
		placeBuildingFromMenu(clickedspot, this);
		$('#selectabuildingmenu').hide();
		$( $("#" + clickedspot).parent() ).removeClass('activetd');
		clickedspot = '';
	});

	// updating hoveredspot, on mouseover
	$('#cityholder td').mouseover(function () {

		if (hoveredspot == "") {
			if ( $('#cityholder').hasClass('landlocked') && $(this).hasClass('la') ) {
				hoveredspot = $( $(this).children('div') ).attr('ID');
			}
			if ( $('#cityholder').hasClass('waterside') && $(this).hasClass('wa') ) {
				hoveredspot = $( $(this).children('div') ).attr('ID');
			}
		} else {}

		optimalBuilding(hoveredspot);

	}).mouseout(function () {
		hideoptBuilding();
		hoveredspot = '';
	});;


	// x button to close build menu
	$('#xbselmenu').click(function () {
		$('#selectabuildingmenu').hide();
	});

	// when a hotkey is pressed, if clickedspot or hoveredspot have values, then place the building on the map
	$(document).keydown(function(e) {
		if (clickedspot.length > 0) {
			placeBuildingFromHotkey(clickedspot, e);
			$( $("#" + clickedspot).parent() ).removeClass('activetd');
			clickedspot = '';
		} else if (hoveredspot.length > 0) {
			placeBuildingFromHotkey(hoveredspot, e);
			hoveredspot = '';
		}

		else {}
	});

	// opening and closing the import/export window
	$('#importmap').click(function () {
		loadMapStrings();
		$('#cotgsharestringb').addClass('activebttn');
		$('#importexportwindow').show();
	});
	$('#impexpclose').click(function () {
		$('#importexportwindow').hide();
	});


	// error window x button
	$('#errorwindowclose').click(function () {
		$('#errorwindow').hide();
	});


	// changing sharestring tabs
	$('#cotgsharestringb').click(function () {
		$('#cotgsharestringb').addClass('activebttn');
		$('#lousharestringb').removeClass('activebttn');
		$('#sharestringinputlou').hide();
		$('#sharestringinputcotg').show();
		$('#loadloustringbutton').hide();
		$('#loadcotgstringbutton').show();
	});
	$('#lousharestringb').click(function () {
		$('#cotgsharestringb').removeClass('activebttn');
		$('#lousharestringb').addClass('activebttn');
		$('#sharestringinputcotg').hide();
		$('#sharestringinputlou').show();
		$('#loadcotgstringbutton').hide();
		$('#loadloustringbutton').show();
	});

	//switching between res tab and mil tab
	$('#resourcetabbutton').click(function () {
		resTab();
	});
	$('#militarytabbutton').click(function () {
		milTab();
	});


	$('#loadcotgstringbutton').click(function () {
		var thesharestring = $('#sharestringinputcotg').val();
		loadCotGSharestring(thesharestring);
	});


});

// load info to res tab (initially, and when res tab button is clicked)
function resTab () {

	$('#resourcetabbutton').addClass('activebttn');
	$('#militarytabbutton').removeClass('activebttn');
	$('#restab').show();
	$('#miltab').hide();
	updateCityRes();
}

// load info to mil tab (when mil tab button is clicked)
function milTab () {

	$('#militarytabbutton').addClass('activebttn');
	$('#resourcetabbutton').removeClass('activebttn');
	$('#restab').hide();
	$('#miltab').show();

}

// making the map strings in the import/export menu
function loadMapStrings () {
	var numberspots = $('#cityholder').find('div');
	var longmaplink = "http://cotgoptimizer.com/?map=";
	var sharestringtext = "[ShareString.1.3]";

	if ($('#cityholder').hasClass('waterside')) {
		longmaplink += 'W';
		sharestringtext += ";";
	} else {
		longmaplink += 'L';
		sharestringtext += ":";
	}

	var i;
	for (i = 0; i < numberspots.length; i++) { 
		var thisdiv = numberspots[i];
		var thistd = $(thisdiv).parent();
		if  ($(thisdiv).hasClass("buildingmap")) { // regular buildings
			var building = $(thisdiv).attr('data-building');
			var finalkey = buildingsobject[building]['key'].toUpperCase();;
			longmaplink += finalkey;
			sharestringtext += finalkey;
		}
		else if ($(thisdiv).attr("ID") == "b11-11") { // basilica
			longmaplink += "D";
			sharestringtext += "D";
		}
		else if ( $(thistd).hasClass('ws') && $('#cityholder').hasClass('waterside')) { // open special spots (waterside)
			sharestringtext += "_";
		}
		else if ( $(thistd).hasClass('wa') && $('#cityholder').hasClass('waterside')) { // open spots (waterside)
			longmaplink += "0";
			sharestringtext += "-";
		}
		else if ( $(thistd).hasClass('la') && $('#cityholder').hasClass('landlocked')) { // open spots (landlocked)
			longmaplink += "0";
			sharestringtext += "-";
		}
		else if (!$(thisdiv).hasClass("buildingmap")) {
			longmaplink += "0";
			sharestringtext += "#";
		}
		else {}
	}

	sharestringtext += "[/ShareString]";

	$('#inpexplonglink').val(longmaplink);
	$('#sharestringinputcotg').text(sharestringtext);
}

// loading in an external cotg sharestring
function loadCotGSharestring (string) {
	var removest = string.replace('[ShareString.1.3]','').replace('[/ShareString]','');
	var watercheck = removest.substring(0, 1);
	var finalstring = removest.replace(':','').replace(';','');
	var numberspots = $('#cityholder').find('div');

	if (finalstring.length == numberspots.length) {

		if (watercheck == ";") {
			isWater();
		}
		else if (watercheck == ":") {
			isLand();
		}
		else {
			errorMessage("Invalid ShareString");
		}

		var i;
		for (i = 0; i < numberspots.length; i++) { 
			var thisdiv = numberspots[i];
			var building = finalstring[i];

			if (building == "-") {} 
			else if (building == "#") {}
			else if (building == "_") {}
			else if (building == "D") {} //basilica
			else {					     // normal buildings
				var buildkey = building.toLowerCase();
				if (hotkeys.hasOwnProperty(buildkey)) {
					var matchingbuilding = hotkeys[buildkey];
					$(thisdiv).removeClass().removeAttr('data-building').addClass(matchingbuilding).addClass('buildingmap').attr('data-building', matchingbuilding);
				}
			}
		}

	} else {
		errorMessage("Invalid ShareString");
	}

	updateCityRes();
}

// adding text to error window popup
function errorMessage (text) {
	$('#errorwindow').show();
	$('#errormessage').text(text);
}

// place the building on the map using the left-hand menu
function placeBuildingFromMenu (clickedspot, building) {
	var buildtype = $( $(building).children('div') ).attr('ID');
	$("#" + clickedspot).removeClass().removeAttr('data-building').addClass(buildtype).addClass('buildingmap').attr('data-building', buildtype);
	$( $("#" + clickedspot).parent() ).removeClass('activetd');
	clickedspot = '';
	updateCityRes();
}

// place the building on the map using the hotkeys
function placeBuildingFromHotkey (clickedspot, e) {

	var key = e.key;

	// regular hotkeys
	if(hotkeys.hasOwnProperty(key)) {
		var matchingbuilding = hotkeys[key];
		$("#" + clickedspot).removeClass().removeAttr('data-building').addClass(matchingbuilding).addClass('buildingmap').attr('data-building', matchingbuilding);
		$('#selectabuildingmenu').hide();
	}

	// spacebar for lock
	if (e.code == 'Space') {
		e.preventDefault();
		matchingbuilding = 'maplock';
		$("#" + clickedspot).addClass(matchingbuilding).addClass('buildingmap').attr('data-building', matchingbuilding);
		$('#selectabuildingmenu').hide();
	} else {}

	// remove building
	if (e.code == 'Delete' || e.code == 'Backspace' || e.key == '0') {
		$("#" + clickedspot).removeClass().removeAttr('data-building');
	} else {}

	$( $("#" + clickedspot).parent() ).removeClass('activetd');
	clickedspot = '';
	updateCityRes();
}

//changing map to landlocked
function isLand () {
	$('#cityholder').addClass('landlocked').removeClass('waterside');
	$('.wa').css("border","none");
	$('.la').css("border","1px solid #414141");
}

//changing map to waterside
function isWater () {
	$('#cityholder').addClass('waterside').removeClass('landlocked');
	$('.la').css("border","none");
	$('.wa').css("border","1px solid #414141");
}


