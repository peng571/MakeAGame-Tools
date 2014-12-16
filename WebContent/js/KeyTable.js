function  KeyTable(keyMaps){
	this.loop = false;
	this.keyMaps = keyMaps || [];
}
	
function sort(keyMaps){
	for(var i in keyMaps){
		keyMaps[i].value.sort(function(a, b){ console.log("sort"); console.log(a);console.log(b);return a.pos - b.pos } );
	}
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
	
	var keyMaps = keyTable.keyMaps;
	// 找出在時間中間的一對key pair
	for(var i in keyMaps){
		var data = keyMaps[i];
		if(current <= data.value[0].pos) {
			before[data.key] = data.value[0] ;
			after[data.key] = data.value[0];
		} else if(current >= data.value[data.value.length-1].pos) {
			before[data.key] = data.value[data.value.length-1] ;
			after[data.key] = data.value[data.value.length-1];
		} else {
			for(mapIndex = 0; mapIndex < data.value.length - 1; mapIndex++) {
				if(data.value[mapIndex].pos <=  current && data.value[mapIndex+1 ].pos >= current) {
					before[data.key] = data.value[mapIndex];
					after[data.key] = data.value[mapIndex +1];
					break;
				}
			}
		}
	}
	
	// 開始進行最重要的內插動作
	var result = [];
	for(var i in keyMaps){
		var data = keyMaps[i];
		var key1 = before[data.key];
		var key2 = after[data.key];
		// 如果 key1 和 key2的位置相同 表示之前或是之後都沒有其他keypoint
		// 自然也就無法進行內插
		if (key1.pos == key2.pos) {
			result[data.key] = key1.value;
		} else {
			// 對 key1, key2 進行內插
			// 已 key2.interp 所指定的內插方法為準
			result[data.key] = interpolation(key1, key2, current, key2.interp );
		}
	}
	return result;
}

function Key(p, v, i){
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

