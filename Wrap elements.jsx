#include "glue code.jsx";
var k = 0;
function traverse(node, callback) {
    callback(node);
    try {
	var children = node.xmlElements;
	for (var i = 0; i < children.length; i++) {
	    traverse(children[i], callback);
	}
    }
    catch(error) {
	//
    }
}

Array.prototype.has=function(v){
    for (i=0; i<this.length; i++){
	if (this[i]==v) return true;
    }
    return false;
}

function group(arr) {
    return groupBy(arr, function (item) {
	return item;
    });
}

function groupBy(arr, callback) {
    ret = [];
    pos = 0;
    for (var i = 0; i < arr.length; i++) {
	if (i == 0) {
	    //make new sub-array if this is first element
	    ret[pos] = [];
	}
	else if (callback(arr[i]) !== callback(arr[i-1]) - 1) { 
	    pos++;
	    //make new sub-array if values not consecutive
	    ret[pos] = [];
	}
	//append the current value to the current sub-array of ret
	ret[pos].push(arr[i]);
    }
    return ret;
}

function main() {
    var doc = app.documents.item(0);
    var rootElement = app.documents.item(0).xmlElements[0];

    var tag = doc.xmlTags.item('BulletList');
    var lastWasBullet = false;
    var currentListElement;
    traverse(rootElement, function (element) {
        if (element.markupTag.name == 'BulletListItem') {
            if (!lastWasBullet) {
                currentListElement = element.add(tag);
                currentListElement = currentListElement.move(LocationOptions.BEFORE, element);
                element.move(LocationOptions.AT_END, currentListElement);
            }
            else {
                element.move(LocationOptions.AT_END, currentListElement);
            }
            lastWasBullet = true;
        }
        else {
            lastWasBullet = false;
        }
    });
/*
  var tag = doc.xmlTags.item('BulletList');
    for (var i = 0; i < groupedElements.length; i++) {
        var firstListItem = groupedElements[i][0];
        var parentTag = firstListItem.parent.markupTag.name;
        if (parentTag === 'BulletList') {
            continue;
        }
        try {
            var list = firstListItem.xmlElements.add(tag);
            var newlist = list.move(LocationOptions.BEFORE, firstListItem);
            for (var j = 0; j < groupedElements[0].length; j++) {
                groupedElements[i][j].move(LocationOptions.AT_END, newlist);
            }
        }
        catch (err) {
            $.writeln(err);
        }
    }

    */
}


main();

