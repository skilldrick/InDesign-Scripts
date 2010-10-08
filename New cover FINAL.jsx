//Nick's amazing automatic cover maker
//Rewritten 8 October


var bleeds = {
    pb: 3,
    rb_dw: 3,
    sb_dw: 3,
    mm_plc: 15,
    rb_plc: 15,
    sb_plc: 15
};

var slugs = {
    pb: 6,
    rb_dw: 6,
    sb_dw: 6,
    mm_plc: 20,
    rb_plc: 18,
    sb_plc: 18
};

var flapWraparound = 10; //How much wraparound needed for flaps
var boardAllowance = 3;

function DrawLine(doc) {
    return function (x1, y1, x2, y2) {
        with (doc.pages.item(0).graphicLines.add().paths.item(0)) {
	    with (pathPoints.item(0)) {
	        anchor = [x1, y1];
	    }
	    with (pathPoints.item(1)) {
	        anchor = [x2, y2];
	    }
        }
    }
}

function DrawGuide(doc) {
    return function (myGuideLocation) {
        with (app.activeWindow.activeSpread) {	
	    with (guides.add()) {
	        orientation = HorizontalOrVertical.vertical;
	        location = myGuideLocation;
	    }
        }
    }
}

function showDialog() {
    var dimensionStrings = {height: "Height", width: "Width", spine: "Spine", flap: "Flap width"};
    var fields = {};
    var units = {};

    var dimensions = {};
    var dimensionUnits = {};

    var coverTypeStrings = {
        pb: "Paperback cover",
        rb_dw: "Roundback dustwrapper (use TPS measurements)",
        sb_dw: "Squareback dustwrapper (like MoTP)",
        mm_plc: "MM PLC",
        rb_plc: "Roundback PLC (use TPS measurements)",
        sb_plc: "Squareback PLC (use TPS measurements)"
    }

    var dialog = app.dialogs.add({name:"Nick's new cover script", canCancel:true});
    var outerColumn = dialog.dialogColumns.add();
    var borderPanelTop = outerColumn.borderPanels.add();
    var labelsColumn = borderPanelTop.dialogColumns.add();
    var editboxColumn = borderPanelTop.dialogColumns.add();
    var dropdownColumn = borderPanelTop.dialogColumns.add();

    var borderPanelBottom = outerColumn.borderPanels.add();
    var radioColumn = borderPanelBottom.dialogColumns.add();
    var radioGroup = radioColumn.radiobuttonGroups.add();


    for (var dimension in dimensionStrings) {
        if (dimensionStrings.hasOwnProperty(dimension)) {
            labelsColumn.staticTexts.add(
                {staticLabel: dimensionStrings[dimension] + ":"}
            );
            fields[dimension] = editboxColumn.realEditboxes.add();
            units[dimension] = dropdownColumn.dropdowns.add({
                stringList: ["mm", "in", "pt"],
                selectedIndex: 0
            });
        }
    }

    var coverTypeArray = [];
    for (var type in coverTypeStrings) {
        if (coverTypeStrings.hasOwnProperty(type)) {
            coverTypeArray.push(type);
            radioGroup.radiobuttonControls.add({
                staticLabel: coverTypeStrings[type]
            });
        }
        radioGroup.radiobuttonControls[0].checkedState = true;
    }

    if (dialog.show()) {
        for (var field in fields) {
            if (fields.hasOwnProperty(field)) {
                var unit = units[field].stringList[units[field].selectedIndex];
                dimensions[field] = [fields[field].editValue, unit];
            }
        }
        var coverType = coverTypeArray[radioGroup.selectedButton];
        return {dimensions: dimensions, coverType: coverType};
    }
    else {
        return false;
    }
}

function normalise(dimensions) {
    normalised = {};
    for (var field in dimensions) {
        if (dimensions.hasOwnProperty(field)) {
            var dimension = dimensions[field][0];
            var as_mm;
            var unit = dimensions[field][1];
            switch (unit) {
            case 'mm':
                as_mm = dimension;
                break;
            case 'in':
                as_mm = dimension * 25.4;
                break;
            case 'pt':
                as_mm = dimension * 0.35278;
                break;
            default:
                var errorString = 'Error - unexpected unit: ' + unit;
                $.writeln(errorString);
                throw errorString;
            }

            normalised[field] = as_mm;
        }
    }
    return normalised;
}

function calculateDimensions(unNormalisedDimensions, coverType) {
    for (var field in unNormalisedDimensions) {
        $.writeln(unNormalisedDimensions[field]);
    }

    dimensions = normalise(unNormalisedDimensions);
    switch (coverType) {
    case 'pb':
        dimensions['doc_width'] = (dimensions['width'] * 2) + dimensions['spine'];
        break;
    case 'rb_dw':
        dimensions['width'] += boardAllowance;
        dimensions['height'] += boardAllowance * 2;
        dimensions['doc_width'] = (dimensions['width'] * 2) + dimensions['spine'] +
            (dimensions['flap'] * 2);
        break;
    case 'sb_dw':
        dimensions['width'] += boardAllowance * 2;
        dimensions['height'] += boardAllowance * 2;
        dimensions['doc_width'] = (dimensions['width'] * 2) + dimensions['spine'] +
            (dimensions['flap'] * 2);
        break;
    case 'mm_plc':
        dimensions['doc_width'] = (dimensions['width'] * 2) + dimensions['spine'];
        break;
    case 'rb_plc':
        dimensions['width'] += boardAllowance + 2; //extra 2mm for shoulder
        dimensions['height'] += boardAllowance * 2;
        dimensions['doc_width'] = (dimensions['width'] * 2) + dimensions['spine'];
        break;
    case 'sb_plc':
        dimensions['width'] += (boardAllowance * 2) + 2; //extra 2mm for shoulder
        dimensions['height'] += (boardAllowance * 2);
        dimensions['doc_width'] = (dimensions['width'] * 2) + dimensions['spine'];
        break;
    default:
        var errorString = 'Error - unexpected cover type: ' + coverType;
        $.writeln(errorString);
        throw errorString;
    }

    dimensions['bleed'] = bleeds[coverType];
    dimensions['slug'] = slugs[coverType];

    return dimensions;
}

function makeCover(dimensions, coverType) {
    var bleed = dimensions['bleed'];
    var slug = dimensions['slug'];
    var width = dimensions['width'];
    var doc_width = dimensions['doc_width'];
    var height = dimensions['height'];
    var flap = dimensions['flap'];
    var spine = dimensions['spine'];
    
    var doc = app.documents.add();
    m_prefs = doc.pages.item(0).marginPreferences;
    m_prefs.bottom = 0;
    m_prefs.top = 0;
    m_prefs.left = 0;
    m_prefs.right = 0;
    m_prefs.columnCount = 2;
    m_prefs.columnGutter = dimensions['spine'];

    v_prefs = doc.viewPreferences;
    v_prefs.horizontalMeasurementUnits = MeasurementUnits.millimeters;
    v_prefs.verticalMeasurementUnits = MeasurementUnits.millimeters;


    doc_prefs = doc.documentPreferences;
    doc_prefs.pageHeight = height;
    doc_prefs.pageWidth = doc_width;
    doc_prefs.documentBleedUniformSize = true;
    doc_prefs.documentSlugUniformSize = true;
    doc_prefs.documentBleedTopOffset = bleed;
    doc_prefs.slugTopOffset = slug;
    doc_prefs.facingPages = false;

    doc.layers.add({name: "Trim marks"});

    var drawLine = DrawLine(doc);
    var drawGuide = DrawGuide(doc);
    //Corner trim marks
    drawLine(-bleed, 0, -slug, 0);
    drawLine(0, -bleed, 0, -slug);
    drawLine(-bleed, height, -slug, height);
    drawLine(0, height + bleed, 0, height + slug);
    drawLine(doc_width + bleed, 0, doc_width + slug, 0);
    drawLine(doc_width, -bleed, doc_width, -slug);
    drawLine(doc_width + bleed, height, doc_width + slug, height);
    drawLine(doc_width, height + bleed, doc_width, height + slug);

    if (coverType === 'rb_dw' || coverType === 'sb_dw') { //dustwrappers
	//Marks for top
	drawLine(flap, -bleed, flap, -slug); //Top left flap
	drawLine(flap + width, -bleed, flap + width, -slug); //Top spine-left
	drawLine(flap + width + spine, -bleed, flap + width + spine, -slug); //Top spine-right
	drawLine(flap + width * 2 + spine, -bleed, flap + width * 2 + spine, -slug); //Top right flap
	drawLine(flap * 2 + width * 2 + spine, -bleed, flap * 2 + width * 2 + spine, -slug); //Top-right vertical
	drawLine(flap * 2 + width * 2 + spine + bleed, 0, flap * 2 + width * 2 + spine + slug, 0); //Top-right horizontal
	//Marks for bottom
	drawLine(flap, height + bleed, flap, height + slug); //Bottom left flap
	drawLine(flap + width, height + bleed, flap + width, height + slug); //Bottom spine-left
	drawLine(flap + width + spine, height + bleed, flap + width + spine, height + slug); //Bottom spine-right
	drawLine(flap + width * 2 + spine, height + bleed, flap + width * 2 + spine, height + slug); //Bottom right flap
	drawLine(flap * 2 + width * 2 + spine, height + bleed, flap * 2 + width * 2 + spine, height + slug); //Bottom-right vertical
	drawLine(flap * 2 + width * 2 + spine + bleed, height, flap * 2 + width * 2 + spine + slug, height); //Bottom-right horizontal
        drawLine(flap, -bleed, flap, -slug);
    }
    else { //non-dustwrappers
	drawLine(width, -bleed, width, -slug); //Top spine-left
	drawLine(width + spine, -bleed, width + spine, -slug); //Top spine-right
	drawLine(width * 2 + spine, -bleed, width * 2 + spine, -slug); //Top-right vertical
	drawLine(width * 2 + spine + bleed, 0, width * 2 + spine + slug, 0); //Top-right horizontal
	drawLine(width, height + bleed, width, height + slug); //Bottom spine-left
	drawLine(width + spine, height + bleed, width + spine, height + slug); //Bottom spine-right
	drawLine(width * 2 + spine, height + bleed, width * 2 + spine, height + slug); //Bottom-right vertical
	drawLine(width * 2 + spine + bleed, height, width * 2 + spine + slug, height); //Bottom-right horizontal
    }

    var marks = doc.layers.item("Trim marks").graphicLines;
    for (var i = 0; i < marks.count(); i++) {
        marks.item(i).strokeColor = "Registration";
        marks.item(i).strokeWeight = "0.5pt";
    }

    if (coverType === 'rb_dw' || coverType === 'sb_dw') { //dustwrappers: add guides at flaps and wraparounds
        drawGuide(flap - flapWraparound);
        drawGuide(flap);
        drawGuide(doc_width - flap + flapWraparound);
        drawGuide(doc_width - flap);
    }
    else if (coverType === 'rb_plc' || coverType === 'sb_plc') { //PLCS: draw guides showing extent of shoulder
	drawGuide(width - 9);
	drawGuide(width + spine + 9);
    }

    doc.layers.item("Trim marks").locked = true;

    //The following two lines are because I couldn't work out how to make layer 1 active, so had to make a new layer and delete original one
    var newLayer = doc.layers.add({name:"Main layer"}) ; //Make new layer
    doc.layers.item(2).remove(); //Get rid of original layer
    
        
}

var results = showDialog();

if (results) {
    var coverType = results.coverType;
    var dimensions = calculateDimensions(results.dimensions, coverType);

    makeCover(dimensions, coverType);
}

