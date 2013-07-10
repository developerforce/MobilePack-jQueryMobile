//SObjectData
//abstraction layer for SmartStore.js
//requires smartsync.js

function SObjectData(stype,fields) {
	this.dataArray = new Array();
	this.dataObject = null;
	this.cacheConfig = {
		cache : null,
		cacheMode : Force.CACHE_MODE.SERVER_ONLY
	}
	
	this.SObjectType = stype;
	this.fields = fields;
	
}

//override for custom error handling
SObjectData.prototype.errorHandler = function(error) {
	console.log(error);
}

SObjectData.prototype.record = function() {
	return this.dataObject;
}

SObjectData.prototype.data = function(records) {
console.log('IN DATA :'+Object.prototype.toString.call( records ));
console.log(records);

if(records == null) {
console.log('DATA GET');
		return this.dataArray;
} else {
console.log('DATA SET');
console.log(records.length)

	if(records.length > 0) {
		console.log('setting array');
		this.dataArray = records;
		this.dataObject = records[0];
		this.SObjectType = records[0].attributes.type;
		this.fields = [];
		for(strName in records[0])
		{
		   if(strName != 'attributes') {
			this.fields.push(strName);
			}
		}
	} else {
		console.log('setting null');
		this.dataObject = null;
		this.dataArray = [];
		this.fields = [];
	}
	
}
console.log('End Data Set');
console.log(this.dataObject);
console.log(this.dataArray);

}

SObjectData.prototype.create = function(stype,fields) {
	var sobject = {};
	
	if(stype == null && fields == null) {
		sobject.attributes = {
			'type': this.SObjectType
		}
		for(strName in this.fields)
		{
		   sobject[strName] = "";
		}
		
		return sobject;
	}
	
	if(typeof stype === 'string') {
		this.SObjectType = stype;
	} else {
		fields = stype;
	}
	
	//fields is an single dimensional array (Id, FirstName, LastName, etc)
	if(Object.prototype.toString.call( fields ) === '[object Array]') {
		for(field in fields)
		{
		   sobject[field] = null;
		} 
	} else {
		//fields is a multi dimensional array/object ({Id: blah, FirstName: blah})
		console.log('logging object with fields')
		sobject = fields;
		this.fields = [];
		for(strName in sobject)
		{
		   if(strName != 'attributes') {
			this.fields.push(strName);
			}
		}
	}
	
	sobject.attributes = {
		'type': this.SObjectType
	}
	
	if(this.dataArray.length > 0) { //array exists, let's add it
		this.dataArray.push(sobject);
	} else if (this.dataObject == null) { //neither array or object exits, this is our object
		this.dataObject = sobject;
	} else { //object pre-exists - add both to array
		this.dataArray.push(this.dataObject);
		this.dataArray.push(sobject);
		this.dataObject = null;
	}
	
	return sobject;
}

//WTF???
SObjectData.prototype.fetch = function(type,query,callback) {
	var _SObjectData = this;
	
	Force.fetchSObjects(
		{'type':type,'query':query}
		).then(function(response){
			console.log('In SOBJECT CALLBACK');
			console.log(response.records);
			_SObjectData.data(response.records);
			if(callback != null) { callback(response); }
		},
		function(error){
			_SObjectData.errorHandler(error);
		});
}

SObjectData.prototype.remove = function(pointer,callback) {
	this.sync(pointer,callback,true);
}

SObjectData.prototype.sync = function(pointer,callback,_isDelete) {
	var _SObjectData = this;
	var _record;
	var method = 'create';
	var index;
	console.log('SObjectData->');
	console.log(this);
	
	console.log('POINTER->');
	console.log(pointer);
	console.log(pointer.attributes);
	
	if(pointer % 1 === 0) { 
		console.log('pointer is an index');
		_record = this.dataArray[pointer];
		} 
	else if(pointer.attributes != null) {
		console.log('pointer is a record');
		_record = pointer;
	} else {
		console.log('no attributes on pointer, assume dataObject');
		_record = this.dataObject;
		if(pointer != null) { callback = pointer; } //pointer is our callback function
		console.log(callback);
	}
	console.log('RECORD->');
	console.log(_record);	
	//Force.syncSObject = function(method, sobjectType, id, attributes, fieldlist, cache, cacheMode, info) 
	if(_record.Id != null) {method = 'update';}
	if(_isDelete != null && _isDelete == true) { method = 'delete'; }
	console.log(method);
	
	var attributes = []
	for(strName in _record)
	{
	   if(strName.toLowerCase() != 'id') {
		attributes[strName] = _record[strName];
		}
	}
	console.log('Ready to call Force');	
	console.log(this);
	Force.syncSObject(method,this.SObjectType,_record.Id,
		attributes,this.fields,this.cacheConfig.cache,this.cacheConfig.cacheMode).then(function(response){
			if(method == 'create') {_record.Id = response.Id;}
			if(callback != null) {
				callback(response);
			}
		},
		function(error){
			_SObjectData.errorHandler(error);
		});
}

SObjectData.prototype.findRecordById = function(id) {
	for(var i = 0; i < this.dataArray.length; i++) {
		if(this.dataArray[i].Id == id) {
			return this.dataArray[i];
		}
	}	
	return null;	
}

SObjectData.prototype.findIndexById = function(id) {
	for(var i = 0; i < this.dataArray.length; i++) {
		if(this.dataArray[i].Id == id) {
			return i;
		}
	}	
	return null;	
}
