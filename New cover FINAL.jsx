//Nick's amazing automatic cover maker
//Last updated 23 October 2009


//User variables:
//var myFlap = 100;		//This sets the flap width
var myFlapWrap = 10;	//This sets the amount of wraparound for the flaps on the dustwrapper
var myAllowance = 3;	//This sets the board allowance
//End of user variables


var myDialog = app.dialogs.add({name:"Nick's new cover script", canCancel:true}); //New dialog

with(myDialog) {
	with(dialogColumns.add()) {
		with(borderPanels.add()) {
			with(dialogColumns.add()) {
				staticTexts.add({staticLabel:"Height:"});
				staticTexts.add({staticLabel:"Width:"});
				staticTexts.add({staticLabel:"Spine:"});
				staticTexts.add({staticLabel:"Flap width:"});
			}
			with(dialogColumns.add()) {
				var myHeightField = realEditboxes.add();
				var myWidthField = realEditboxes.add(); 
				var mySpineField = realEditboxes.add();
				var myFlapField = realEditboxes.add(); 
			}
			with(dialogColumns.add()) {
				var myHeightUnitsMenu = dropdowns.add({stringList:
				["mm", "in", "pt"], selectedIndex:0});
				var myWidthUnitsMenu = dropdowns.add({stringList:
				["mm", "in", "pt"], selectedIndex:0});
				var mySpineUnitsMenu = dropdowns.add({stringList:
				["mm", "in", "pt"], selectedIndex:0});
				var myFlapUnitsMenu = dropdowns.add({stringList:
				["mm", "in", "pt"], selectedIndex:0});
			}
		}
		with(borderPanels.add()) {
			with(dialogColumns.add()) {
				var myradiobuttonGroup = radiobuttonGroups.add();
				with(myradiobuttonGroup) {
					var myRadioButton0 =radiobuttonControls.add({staticLabel:"Paperback cover", checkedState:true});
					var myRadioButton1 =radiobuttonControls.add({staticLabel:"Roundback dustwrapper (use TPS measurements)"});
					var myRadioButton2 =radiobuttonControls.add({staticLabel:"Squareback dustwrapper (like MoTP)"});
					var myRadioButton3 =radiobuttonControls.add({staticLabel:"MM PLC"});
					var myRadioButton4 =radiobuttonControls.add({staticLabel:"Roundback PLC (use TPS measurements)"});
					var myRadioButton5 =radiobuttonControls.add({staticLabel:"Squareback PLC (use TPS measurements)"});
				}
			}
		}
	}
}

if(myDialog.show() == true) {
	
	var myHeight = myHeightField.editValue;
	var myWidth = myWidthField.editValue;
	var mySpine = mySpineField.editValue;
	var myFlap = myFlapField.editValue;
	var myType = myradiobuttonGroup.selectedButton;
	//$.writeln(myType);
	var myBleed;
	var mySlug;
	if(myType == 3) { //Sets large bleed for Multiligual Matters PLCs
		myBleed = 15;
		mySlug = 20;
	}
	else if(myType == 4 || myType == 5) { //Standard PLC bleeds
		myBleed = 15;
		mySlug = 18;
	}
	else { //Normal Bleed and Slug
		myBleed = 3;
		mySlug = 6;
	}

	
	//This part converts all user input measurements to millimetres
	if(myHeightUnitsMenu.selectedIndex == 0) {
		;
	}
	else if(myHeightUnitsMenu.selectedIndex == 1) {
		myHeight *= 25.4;
	}
	else {
		myHeight *= 0.35278;
	}

	if(myWidthUnitsMenu.selectedIndex == 0) {
		;
	}
	else if(myWidthUnitsMenu.selectedIndex == 1) {
		myWidth *= 25.4;
	}
	else {
		myWidth *= 0.35278;
	}

	if(mySpineUnitsMenu.selectedIndex == 0) {
		;
	}
	else if(mySpineUnitsMenu.selectedIndex == 1) {
		mySpine *= 25.4;
	}
	else {
		mySpine *=  0.35278;
	}

	if(myFlapUnitsMenu.selectedIndex == 0) {
		;
	}
	else if(myFlapUnitsMenu.selectedIndex == 1) {
		myFlap *= 25.4;
	}
	else {
		myFlap *=  0.35278;
	}
	
	



	switch(myType) {
	case 0: // If paperback cover
		var myPageWidth = myWidth * 2 + mySpine;
		break;
	case 1: // If Dustwrapper
		myWidth += myAllowance; // Add board allowance (roundback only has board allowance on outside edge)
		myHeight += myAllowance * 2; // Add board allowance
		var myPageWidth = (myWidth * 2) + mySpine + myFlap * 2;
		break;
	case 2: // If squareback dustwrapper
		myWidth += myAllowance * 2; // Add board allowance
		myHeight += myAllowance * 2; // Add board allowance
		var myPageWidth = (myWidth * 2) + mySpine + myFlap * 2;
		break;
	case 3: //MM PLC
		var myPageWidth = (myWidth * 2) + mySpine;
		break;
	case 4: //Roundback PLC
		myWidth += myAllowance;
		myWidth += 2; //extra 2mm either side for shoulder
		myHeight += myAllowance * 2;
		var myPageWidth = (myWidth * 2) + mySpine;
		break;
	case 5: //Squareback PLC
		myWidth += myAllowance * 2; // adds allowance for overhang and board on spine
		myWidth += 2; //extra 2mm either side for shoulder
		myHeight += myAllowance * 2;
		var myPageWidth = (myWidth * 2) + mySpine;
		break;
	default:
		break;
	}
		

	var myDocument = app.documents.add();

	with(myDocument.pages.item(0).marginPreferences) {
		//Set margins to 0
		bottom = 0;
		top = 0;
		left = 0;
		right = 0;
		
		columnCount = 2;
		columnGutter = mySpine;
	}
	
	with(myDocument.viewPreferences){ //Set units to mm for ease of calculations
		horizontalMeasurementUnits = MeasurementUnits.millimeters;
		verticalMeasurementUnits = MeasurementUnits.millimeters;
	}
		
	with(myDocument.documentPreferences){
		pageHeight = myHeight;
		pageWidth = myPageWidth;
		documentBleedUniformSize = true;
		documentSlugUniformSize = true;
		documentBleedTopOffset = myBleed;
		slugTopOffset = mySlug;
		facingPages = false;
	}

	myDocument.layers.add({name:"Trim marks"});
	
	//These marks are in the same place regardless of type
	myDrawLines(-myBleed, 0, -mySlug, 0); //Top-left horizontal
	myDrawLines(0, -myBleed, 0, -mySlug); //Top-left vertical
	myDrawLines(-myBleed, myHeight, -mySlug, myHeight); //Bottom-left horizontal
	myDrawLines(0, myHeight + myBleed, 0, myHeight + mySlug); //Bottom-left vertical
	
	if(myType == 1 || myType == 2) { //These are marks for dustwrapper
		//Marks for top
		myDrawLines(myFlap, -myBleed, myFlap, -mySlug); //Top left flap
		myDrawLines(myFlap + myWidth, -myBleed, myFlap + myWidth, -mySlug); //Top spine-left
		myDrawLines(myFlap + myWidth + mySpine, -myBleed, myFlap + myWidth + mySpine, -mySlug); //Top spine-right
		myDrawLines(myFlap + myWidth * 2 + mySpine, -myBleed, myFlap + myWidth * 2 + mySpine, -mySlug); //Top right flap
		myDrawLines(myFlap * 2 + myWidth * 2 + mySpine, -myBleed, myFlap * 2 + myWidth * 2 + mySpine, -mySlug); //Top-right vertical
		myDrawLines(myFlap * 2 + myWidth * 2 + mySpine + myBleed, 0, myFlap * 2 + myWidth * 2 + mySpine + mySlug, 0); //Top-right horizontal
		//Marks for bottom
		myDrawLines(myFlap, myHeight + myBleed, myFlap, myHeight + mySlug); //Bottom left flap
		myDrawLines(myFlap + myWidth, myHeight + myBleed, myFlap + myWidth, myHeight + mySlug); //Bottom spine-left
		myDrawLines(myFlap + myWidth + mySpine, myHeight + myBleed, myFlap + myWidth + mySpine, myHeight + mySlug); //Bottom spine-right
		myDrawLines(myFlap + myWidth * 2 + mySpine, myHeight + myBleed, myFlap + myWidth * 2 + mySpine, myHeight + mySlug); //Bottom right flap
		myDrawLines(myFlap * 2 + myWidth * 2 + mySpine, myHeight + myBleed, myFlap * 2 + myWidth * 2 + mySpine, myHeight + mySlug); //Bottom-right vertical
		myDrawLines(myFlap * 2 + myWidth * 2 + mySpine + myBleed, myHeight, myFlap * 2 + myWidth * 2 + mySpine + mySlug, myHeight); //Bottom-right horizontal
	}
	
	else { //These are marks for non-dustwrapper
		myDrawLines(myWidth, -myBleed, myWidth, -mySlug); //Top spine-left
		myDrawLines(myWidth + mySpine, -myBleed, myWidth + mySpine, -mySlug); //Top spine-right
		myDrawLines(myWidth * 2 + mySpine, -myBleed, myWidth * 2 + mySpine, -mySlug); //Top-right vertical
		myDrawLines(myWidth * 2 + mySpine + myBleed, 0, myWidth * 2 + mySpine + mySlug, 0); //Top-right horizontal
		myDrawLines(myWidth, myHeight + myBleed, myWidth, myHeight + mySlug); //Bottom spine-left
		myDrawLines(myWidth + mySpine, myHeight + myBleed, myWidth + mySpine, myHeight + mySlug); //Bottom spine-right
		myDrawLines(myWidth * 2 + mySpine, myHeight + myBleed, myWidth * 2 + mySpine, myHeight + mySlug); //Bottom-right vertical
		myDrawLines(myWidth * 2 + mySpine + myBleed, myHeight, myWidth * 2 + mySpine + mySlug, myHeight); //Bottom-right horizontal
	}

	with(myDocument.layers.item("Trim marks").graphicLines) {
		for(var i = 0; i < count(); i++) { //loop through all graphicLines making them registration and 0.5pt
			myDocument.layers.item("Trim marks").graphicLines.item(i).strokeColor = "Registration";
			myDocument.layers.item("Trim marks").graphicLines.item(i).strokeWeight = "0.5pt";
		}
	}

	if(myType == 1 || myType == 2) {	// For dustwrappers, add guides at flaps and wraparounds
		myDrawGuide(myFlap - myFlapWrap);
		myDrawGuide(myFlap);
		myDrawGuide(myPageWidth - myFlap + myFlapWrap);
		myDrawGuide(myPageWidth - myFlap);
	}
	if(myType == 4 || myType == 5) { // For PLCs, draw guides showing extent of shoulder
		myDrawGuide(myWidth - 9);
		myDrawGuide(myWidth + mySpine + 9);
	}
	
	myDocument.layers.item("Trim marks").locked = true; //Now we're done with Trim marks layer, lock it
	
	//The following two lines are because I couldn't work out how to make layer 1 active, so had to make a new layer and delete original one
	var newLayer = myDocument.layers.add({name:"Main layer"}) ; //Make new layer
	myDocument.layers.item(2).remove(); //Get rid of original layer
	
	
	myDialog.destroy(); //Remove dialog from memory
}

else { //User clicked cancel
	myDialog.destroy();
}

function myDrawLines(x1, y1, x2, y2) { //Does what it says on the tin
	with(myDocument.pages.item(0).graphicLines.add().paths.item(0)) {
		with(pathPoints.item(0)) {
			anchor = [x1, y1];
		}
		with(pathPoints.item(1)) {
			anchor = [x2, y2];
		}
	}
}

function myDrawGuide(myGuideLocation){ //Does what it says on the tin
	with(app.activeWindow.activeSpread){	
		with (guides.add()){
			orientation=HorizontalOrVertical.vertical;
			location=myGuideLocation;
		}
	}
}