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
	var tagName = "BulletListItem";
	var parentTagName = "BulletList";
	var elementIds = [];
	
	function addReturns() {
		this.name = "addReturns";
		this.xpath = "//" + tagName;
		this.apply = function (ele, rule_processor) {
			var doc = app.documents.item(0);
			
			elementIds.push(ele.id);
			
			return true;
		}

	}

	if (app.documents.length != 0) {
		var doc = app.documents.item(0);
		var rule_set = [new addReturns];
		var elements = doc.xmlElements;
		__processRuleSet(elements.item(0), rule_set);
	}
	else {
		alert('no open document');
	}



	var doc = app.documents.item(0);
	var xmlElements= app.documents.item(0).xmlElements;

	var allElements = [];
	traverse(xmlElements[0], function (element) {
		if (elementIds.has(element.id)) {
			allElements.push(element);
		}
	});

	var groupedIds = group(elementIds);
	var groupedElements = groupBy(allElements, function (item) { return item.id; });
	for (var i = 0; i < groupedIds.length; i++) {
		$.writeln(groupedIds[i]);
	}
	//groupedElements is an array of arrays. Each sub-array is a list of consecutive list elements.
	//All we need to do now is make a parent for each sub-array of elements and add the elements to this parent. Shimples!
	
}
	

main();

