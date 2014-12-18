function KeyTable(keyMaps){
	this.loop = false;
	this.keyMaps = [];
	this.attrMap = [];
	this.posMap = [];
	setMap (this, keyMaps);	
}
	
function setMap(tables, keyMaps){
	tables.keyMaps = keyMaps || [];
	tables.attrMap = sortByPos(getByAttr(tables));
	//console.log("setMap");
	//console.log(tables.attrMap);
}


function getByAttr(table, attr){
	var hashMap = [];
	var aMap  = [];
	for(var i in table.keyMaps){
		var key = table.keyMaps[i];
		if(typeof hashMap[key.attr] == 'undefined'){
			hashMap[key.attr] = aMap.length;
			aMap[aMap.length] = {label:key.attr, value:new Array(key)};
		}else{
			aMap[hashMap[key.attr]].value.push(key);
		}
	}
	
	if(typeof attr == 'undefined'){
		return aMap;
	}else{
		return aMap[attr];
	}
}

/*
function getByPos(pos){
	var pMap = [];
	for(var i in keyMaps){
		var key = keyMaps[i];
		if(typeof pMap[key.pos] == 'undefined'){
			pMap[key.pos] = new Array(key);
		}else{
			pMap[key.pos].put(key);
		}
	}
	
	if(typeof pos == 'undefined'){
		return pMap;
	}else{
		return pMap[pos];
	}
}
*/

function sortByPos(keyMaps){
	for(var i in keyMaps){
		keyMaps[i].value.sort(function(a, b){return a.pos - b.pos } );
	}
	return keyMaps;
}

function getApplyList(keyTable, current){
	
	var mapIndex = 0;
	var before =[] , after = [];
	
	// 當設定循環播放時, current 應該被取餘數 
	if (keyTable.loop) {
		// 先算出整個 keytable 的長度
		var min = keys[0].pos;
		var max = keys[keys.length - 1].pos;
		current = min + current % (max-min);
	}
	
	var keyMaps = keyTable.attrMap;
	// 找出在時間中間的一對key pair
	for(var i in keyMaps){
		var data = keyMaps[i];
		if(current <= data.value[0].pos) {
			before[data.label] = data.value[0] ;
			after[data.label] = data.value[0];
		} else if(current >= data.value[data.value.length-1].pos) {
			before[data.label] = data.value[data.value.length-1] ;
			after[data.label] = data.value[data.value.length-1];
		} else {
			for(mapIndex = 0; mapIndex < data.value.length - 1; mapIndex++) {
				if(data.value[mapIndex].pos <=  current && data.value[mapIndex+1 ].pos >= current) {
					before[data.label] = data.value[mapIndex];
					after[data.label] = data.value[mapIndex +1];
					break;
				}
			}
		}
	}
	
	// 開始進行最重要的內插動作
	var result = [];
	for(var i in keyMaps){
		var data = keyMaps[i];
		var key1 = before[data.label];
		var key2 = after[data.label];
		// 如果 key1 和 key2的位置相同 表示之前或是之後都沒有其他keypoint
		// 自然也就無法進行內插
		if (key1.pos == key2.pos) {
			result[data.label] = key1.value;
		} else {
			// 對 key1, key2 進行內插
			// 已 key2.interp 所指定的內插方法為準
			result[data.label] = interpolation(key1, key2, current, key2.interp );
		}
	}
	return result;
}

function Key(a, p, v, i){
	this.attr = a ||'';
	this.pos = p || 0;
	this.value = v;
	this.interp = i ||  INT_NORMAL;
}


function interpolation(k1,  k2,  current, intMethod) {
	return	intMethod(k1, k2, current);
}


var INT_NORMAL = function(k1,  k2,  current) {
	return k1.value;
}

var INT_LINEAR = function  (k1,  k2,  current) {
	return k1.value + ( k2.value - k1.value) * ((current - k1.pos)/ (k2.pos - k1.pos));
}

