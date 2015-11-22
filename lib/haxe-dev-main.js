(function (console, $hx_exports, $global) { "use strict";
$hx_exports.promhx = $hx_exports.promhx || {};
var $hxClasses = {},$estr = function() { return js_Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
$hxClasses["EReg"] = EReg;
EReg.__name__ = ["EReg"];
EReg.prototype = {
	match: function(s) {
		if(this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,matched: function(n) {
		if(this.r.m != null && n >= 0 && n < this.r.m.length) return this.r.m[n]; else throw new js__$Boot_HaxeError("EReg::matched");
	}
	,__class__: EReg
};
var HaxeDevMain = function() { };
$hxClasses["HaxeDevMain"] = HaxeDevMain;
HaxeDevMain.__name__ = ["HaxeDevMain"];
HaxeDevMain.main = function() {
	console.log(platform_atom_Log.format("Starting HaxeDev plugin..."));
	module.exports = HaxeDevMain;
	context_State.init();
};
HaxeDevMain.activate = function(state) {
	HaxeDevMain.subscriptions = new atom_CompositeDisposable();
	HaxeDevMain.subscriptions.add(atom.commands.add("atom-workspace",{ 'haxe-dev:toggle' : HaxeDevMain.toggle}));
	HaxeDevMain.register_command("set-hxml-file",new commands_SetHXMLFileFromTreeView({ }));
};
HaxeDevMain.deactivate = function(state) {
	HaxeDevMain.subscriptions.dispose();
};
HaxeDevMain.serialize = function() {
	return { };
};
HaxeDevMain.register_command = function(name,command,module) {
	if(module == null) module = "atom-workspace";
	HaxeDevMain.subscriptions.add(atom.commands.add(name,module + ":" + name,function(opts) {
		context_State.get_state().get_main_worker().run_command(command);
		return null;
	}));
};
HaxeDevMain.toggle = function() {
	console.log(platform_atom_Log.format("HaxeDev was toggled!"));
};
var HxOverrides = function() { };
$hxClasses["HxOverrides"] = HxOverrides;
HxOverrides.__name__ = ["HxOverrides"];
HxOverrides.strDate = function(s) {
	var _g = s.length;
	switch(_g) {
	case 8:
		var k = s.split(":");
		var d = new Date();
		d.setTime(0);
		d.setUTCHours(k[0]);
		d.setUTCMinutes(k[1]);
		d.setUTCSeconds(k[2]);
		return d;
	case 10:
		var k1 = s.split("-");
		return new Date(k1[0],k1[1] - 1,k1[2],0,0,0);
	case 19:
		var k2 = s.split(" ");
		var y = k2[0].split("-");
		var t = k2[1].split(":");
		return new Date(y[0],y[1] - 1,y[2],t[0],t[1],t[2]);
	default:
		throw new js__$Boot_HaxeError("Invalid date format : " + s);
	}
};
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
};
HxOverrides.indexOf = function(a,obj,i) {
	var len = a.length;
	if(i < 0) {
		i += len;
		if(i < 0) i = 0;
	}
	while(i < len) {
		if(a[i] === obj) return i;
		i++;
	}
	return -1;
};
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
};
var List = function() {
	this.length = 0;
};
$hxClasses["List"] = List;
List.__name__ = ["List"];
List.prototype = {
	add: function(item) {
		var x = [item];
		if(this.h == null) this.h = x; else this.q[1] = x;
		this.q = x;
		this.length++;
	}
	,pop: function() {
		if(this.h == null) return null;
		var x = this.h[0];
		this.h = this.h[1];
		if(this.h == null) this.q = null;
		this.length--;
		return x;
	}
	,isEmpty: function() {
		return this.h == null;
	}
	,__class__: List
};
Math.__name__ = ["Math"];
var Reflect = function() { };
$hxClasses["Reflect"] = Reflect;
Reflect.__name__ = ["Reflect"];
Reflect.field = function(o,field) {
	try {
		return o[field];
	} catch( e ) {
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
};
Reflect.callMethod = function(o,func,args) {
	return func.apply(o,args);
};
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(f != "__id__" && f != "hx__closures__" && hasOwnProperty.call(o,f)) a.push(f);
		}
	}
	return a;
};
Reflect.isFunction = function(f) {
	return typeof(f) == "function" && !(f.__name__ || f.__ename__);
};
Reflect.deleteField = function(o,field) {
	if(!Object.prototype.hasOwnProperty.call(o,field)) return false;
	delete(o[field]);
	return true;
};
var Std = function() { };
$hxClasses["Std"] = Std;
Std.__name__ = ["Std"];
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
};
Std.parseFloat = function(x) {
	return parseFloat(x);
};
var StringBuf = function() {
	this.b = "";
};
$hxClasses["StringBuf"] = StringBuf;
StringBuf.__name__ = ["StringBuf"];
StringBuf.prototype = {
	add: function(x) {
		this.b += Std.string(x);
	}
	,__class__: StringBuf
};
var StringTools = function() { };
$hxClasses["StringTools"] = StringTools;
StringTools.__name__ = ["StringTools"];
StringTools.endsWith = function(s,end) {
	var elen = end.length;
	var slen = s.length;
	return slen >= elen && HxOverrides.substr(s,slen - elen,elen) == end;
};
StringTools.isSpace = function(s,pos) {
	var c = HxOverrides.cca(s,pos);
	return c > 8 && c < 14 || c == 32;
};
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) r++;
	if(r > 0) return HxOverrides.substr(s,r,l - r); else return s;
};
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,l - r - 1)) r++;
	if(r > 0) return HxOverrides.substr(s,0,l - r); else return s;
};
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
};
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
};
StringTools.fastCodeAt = function(s,index) {
	return s.charCodeAt(index);
};
var ValueType = $hxClasses["ValueType"] = { __ename__ : ["ValueType"], __constructs__ : ["TNull","TInt","TFloat","TBool","TObject","TFunction","TClass","TEnum","TUnknown"] };
ValueType.TNull = ["TNull",0];
ValueType.TNull.toString = $estr;
ValueType.TNull.__enum__ = ValueType;
ValueType.TInt = ["TInt",1];
ValueType.TInt.toString = $estr;
ValueType.TInt.__enum__ = ValueType;
ValueType.TFloat = ["TFloat",2];
ValueType.TFloat.toString = $estr;
ValueType.TFloat.__enum__ = ValueType;
ValueType.TBool = ["TBool",3];
ValueType.TBool.toString = $estr;
ValueType.TBool.__enum__ = ValueType;
ValueType.TObject = ["TObject",4];
ValueType.TObject.toString = $estr;
ValueType.TObject.__enum__ = ValueType;
ValueType.TFunction = ["TFunction",5];
ValueType.TFunction.toString = $estr;
ValueType.TFunction.__enum__ = ValueType;
ValueType.TClass = function(c) { var $x = ["TClass",6,c]; $x.__enum__ = ValueType; $x.toString = $estr; return $x; };
ValueType.TEnum = function(e) { var $x = ["TEnum",7,e]; $x.__enum__ = ValueType; $x.toString = $estr; return $x; };
ValueType.TUnknown = ["TUnknown",8];
ValueType.TUnknown.toString = $estr;
ValueType.TUnknown.__enum__ = ValueType;
var Type = function() { };
$hxClasses["Type"] = Type;
Type.__name__ = ["Type"];
Type.getClassName = function(c) {
	var a = c.__name__;
	if(a == null) return null;
	return a.join(".");
};
Type.getEnumName = function(e) {
	var a = e.__ename__;
	return a.join(".");
};
Type.resolveClass = function(name) {
	var cl = $hxClasses[name];
	if(cl == null || !cl.__name__) return null;
	return cl;
};
Type.resolveEnum = function(name) {
	var e = $hxClasses[name];
	if(e == null || !e.__ename__) return null;
	return e;
};
Type.createEmptyInstance = function(cl) {
	function empty() {}; empty.prototype = cl.prototype;
	return new empty();
};
Type.createEnum = function(e,constr,params) {
	var f = Reflect.field(e,constr);
	if(f == null) throw new js__$Boot_HaxeError("No such constructor " + constr);
	if(Reflect.isFunction(f)) {
		if(params == null) throw new js__$Boot_HaxeError("Constructor " + constr + " need parameters");
		return Reflect.callMethod(e,f,params);
	}
	if(params != null && params.length != 0) throw new js__$Boot_HaxeError("Constructor " + constr + " does not need parameters");
	return f;
};
Type.getEnumConstructs = function(e) {
	var a = e.__constructs__;
	return a.slice();
};
Type["typeof"] = function(v) {
	var _g = typeof(v);
	switch(_g) {
	case "boolean":
		return ValueType.TBool;
	case "string":
		return ValueType.TClass(String);
	case "number":
		if(Math.ceil(v) == v % 2147483648.0) return ValueType.TInt;
		return ValueType.TFloat;
	case "object":
		if(v == null) return ValueType.TNull;
		var e = v.__enum__;
		if(e != null) return ValueType.TEnum(e);
		var c = js_Boot.getClass(v);
		if(c != null) return ValueType.TClass(c);
		return ValueType.TObject;
	case "function":
		if(v.__name__ || v.__ename__) return ValueType.TObject;
		return ValueType.TFunction;
	case "undefined":
		return ValueType.TNull;
	default:
		return ValueType.TUnknown;
	}
};
var atom_CompositeDisposable = require("atom").CompositeDisposable;
var utils_Command = function(params) {
	this.id = utils_Command.next_id++;
	this.params = params;
};
$hxClasses["utils.Command"] = utils_Command;
utils_Command.__name__ = ["utils","Command"];
utils_Command.prototype = {
	get_id: function() {
		return this.id;
	}
	,internal_execute: function(resolve,reject) {
		var _g = this;
		try {
			this.execute(function(r) {
				_g.result = r;
				resolve(_g);
			},reject);
		} catch( e ) {
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			reject(e);
		}
	}
	,execute: function(resolve,reject) {
	}
	,toString: function() {
		return js_Boot.getClass(this).__name__[1] + "#" + this.get_id();
	}
	,__class__: utils_Command
};
var commands_SetHXMLFileFromTreeView = function(params) {
	utils_Command.call(this,params);
};
$hxClasses["commands.SetHXMLFileFromTreeView"] = commands_SetHXMLFileFromTreeView;
commands_SetHXMLFileFromTreeView.__name__ = ["commands","SetHXMLFileFromTreeView"];
commands_SetHXMLFileFromTreeView.__super__ = utils_Command;
commands_SetHXMLFileFromTreeView.prototype = $extend(utils_Command.prototype,{
	execute: function(resolve,reject) {
		context_State.get_state().set_consumer({ name : "default", hxml_cwd : "", hxml_content : "", hxml_file : ""});
		context_State.get_state().synchronize();
		resolve(true);
	}
	,__class__: commands_SetHXMLFileFromTreeView
});
var commands_SynchronizeState = function(params) {
	utils_Command.call(this,params);
};
$hxClasses["commands.SynchronizeState"] = commands_SynchronizeState;
commands_SynchronizeState.__name__ = ["commands","SynchronizeState"];
commands_SynchronizeState.__super__ = utils_Command;
commands_SynchronizeState.prototype = $extend(utils_Command.prototype,{
	execute: function(resolve,reject) {
		context_State.get_state().assign_values(this.params.values);
		resolve(true);
	}
	,__class__: commands_SynchronizeState
});
var context_HaxeService = function() { };
$hxClasses["context.HaxeService"] = context_HaxeService;
context_HaxeService.__name__ = ["context","HaxeService"];
context_HaxeService.set_consumer = function(consumer) {
	context_State.get_state().set_consumer(consumer);
};
var context_MainState = function() { };
$hxClasses["context.MainState"] = context_MainState;
context_MainState.__name__ = ["context","MainState"];
context_MainState.prototype = {
	set_consumer: function(consumer) {
		return this.consumer = consumer;
	}
	,__class__: context_MainState
};
var context_State = function() {
	var has_parent_process = false;
	has_parent_process = platform_atom_ParentProcess.has_parent_process();
	if(has_parent_process) {
		this.background_worker = new utils_Worker({ process_kind : 0});
		this.main_worker = new utils_Worker({ process_kind : 2, current_worker : this.get_background_worker()});
	} else {
		this.main_worker = new utils_Worker({ process_kind : 0});
		this.background_worker = new utils_Worker({ process_kind : 1, current_worker : this.get_main_worker()});
	}
};
$hxClasses["context.State"] = context_State;
context_State.__name__ = ["context","State"];
context_State.get_state = function() {
	return context_State.state;
};
context_State.init = function() {
	context_State.state = new context_State();
};
context_State.__super__ = context_MainState;
context_State.prototype = $extend(context_MainState.prototype,{
	get_main_worker: function() {
		return this.main_worker;
	}
	,get_background_worker: function() {
		return this.background_worker;
	}
	,get_current_worker: function() {
		if(this.get_background_worker().get_process_kind() == 0) return this.get_background_worker(); else return this.get_main_worker();
	}
	,get_other_worker: function() {
		if(this.get_background_worker().get_process_kind() == 0) return this.get_main_worker(); else return this.get_background_worker();
	}
	,synchronize: function() {
		var values = { };
		values.hxml_data = this.hxml_data;
		this.get_other_worker().run_command(new commands_SynchronizeState({ values : values})).then(function(command) {
			command.params.values;
		});
	}
	,assign_values: function(values) {
		this.hxml_data = values.hxml_data;
	}
	,__class__: context_State
});
var haxe_StackItem = $hxClasses["haxe.StackItem"] = { __ename__ : ["haxe","StackItem"], __constructs__ : ["CFunction","Module","FilePos","Method","LocalFunction"] };
haxe_StackItem.CFunction = ["CFunction",0];
haxe_StackItem.CFunction.toString = $estr;
haxe_StackItem.CFunction.__enum__ = haxe_StackItem;
haxe_StackItem.Module = function(m) { var $x = ["Module",1,m]; $x.__enum__ = haxe_StackItem; $x.toString = $estr; return $x; };
haxe_StackItem.FilePos = function(s,file,line) { var $x = ["FilePos",2,s,file,line]; $x.__enum__ = haxe_StackItem; $x.toString = $estr; return $x; };
haxe_StackItem.Method = function(classname,method) { var $x = ["Method",3,classname,method]; $x.__enum__ = haxe_StackItem; $x.toString = $estr; return $x; };
haxe_StackItem.LocalFunction = function(v) { var $x = ["LocalFunction",4,v]; $x.__enum__ = haxe_StackItem; $x.toString = $estr; return $x; };
var haxe_CallStack = function() { };
$hxClasses["haxe.CallStack"] = haxe_CallStack;
haxe_CallStack.__name__ = ["haxe","CallStack"];
haxe_CallStack.getStack = function(e) {
	if(e == null) return [];
	var oldValue = Error.prepareStackTrace;
	Error.prepareStackTrace = function(error,callsites) {
		var stack = [];
		var _g = 0;
		while(_g < callsites.length) {
			var site = callsites[_g];
			++_g;
			if(haxe_CallStack.wrapCallSite != null) site = haxe_CallStack.wrapCallSite(site);
			var method = null;
			var fullName = site.getFunctionName();
			if(fullName != null) {
				var idx = fullName.lastIndexOf(".");
				if(idx >= 0) {
					var className = HxOverrides.substr(fullName,0,idx);
					var methodName = HxOverrides.substr(fullName,idx + 1,null);
					method = haxe_StackItem.Method(className,methodName);
				}
			}
			stack.push(haxe_StackItem.FilePos(method,site.getFileName(),site.getLineNumber()));
		}
		return stack;
	};
	var a = haxe_CallStack.makeStack(e.stack);
	Error.prepareStackTrace = oldValue;
	return a;
};
haxe_CallStack.callStack = function() {
	try {
		throw new Error();
	} catch( e ) {
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		var a = haxe_CallStack.getStack(e);
		a.shift();
		return a;
	}
};
haxe_CallStack.toString = function(stack) {
	var b = new StringBuf();
	var _g = 0;
	while(_g < stack.length) {
		var s = stack[_g];
		++_g;
		b.b += "\nCalled from ";
		haxe_CallStack.itemToString(b,s);
	}
	return b.b;
};
haxe_CallStack.itemToString = function(b,s) {
	switch(s[1]) {
	case 0:
		b.b += "a C function";
		break;
	case 1:
		var m = s[2];
		b.b += "module ";
		if(m == null) b.b += "null"; else b.b += "" + m;
		break;
	case 2:
		var line = s[4];
		var file = s[3];
		var s1 = s[2];
		if(s1 != null) {
			haxe_CallStack.itemToString(b,s1);
			b.b += " (";
		}
		if(file == null) b.b += "null"; else b.b += "" + file;
		b.b += " line ";
		if(line == null) b.b += "null"; else b.b += "" + line;
		if(s1 != null) b.b += ")";
		break;
	case 3:
		var meth = s[3];
		var cname = s[2];
		if(cname == null) b.b += "null"; else b.b += "" + cname;
		b.b += ".";
		if(meth == null) b.b += "null"; else b.b += "" + meth;
		break;
	case 4:
		var n = s[2];
		b.b += "local function #";
		if(n == null) b.b += "null"; else b.b += "" + n;
		break;
	}
};
haxe_CallStack.makeStack = function(s) {
	if(s == null) return []; else if(typeof(s) == "string") {
		var stack = s.split("\n");
		if(stack[0] == "Error") stack.shift();
		var m = [];
		var rie10 = new EReg("^   at ([A-Za-z0-9_. ]+) \\(([^)]+):([0-9]+):([0-9]+)\\)$","");
		var _g = 0;
		while(_g < stack.length) {
			var line = stack[_g];
			++_g;
			if(rie10.match(line)) {
				var path = rie10.matched(1).split(".");
				var meth = path.pop();
				var file = rie10.matched(2);
				var line1 = Std.parseInt(rie10.matched(3));
				m.push(haxe_StackItem.FilePos(meth == "Anonymous function"?haxe_StackItem.LocalFunction():meth == "Global code"?null:haxe_StackItem.Method(path.join("."),meth),file,line1));
			} else m.push(haxe_StackItem.Module(StringTools.trim(line)));
		}
		return m;
	} else return s;
};
var haxe_IMap = function() { };
$hxClasses["haxe.IMap"] = haxe_IMap;
haxe_IMap.__name__ = ["haxe","IMap"];
var haxe__$Int64__$_$_$Int64 = function(high,low) {
	this.high = high;
	this.low = low;
};
$hxClasses["haxe._Int64.___Int64"] = haxe__$Int64__$_$_$Int64;
haxe__$Int64__$_$_$Int64.__name__ = ["haxe","_Int64","___Int64"];
haxe__$Int64__$_$_$Int64.prototype = {
	__class__: haxe__$Int64__$_$_$Int64
};
var haxe_Serializer = function() {
	this.buf = new StringBuf();
	this.cache = [];
	this.useCache = haxe_Serializer.USE_CACHE;
	this.useEnumIndex = haxe_Serializer.USE_ENUM_INDEX;
	this.shash = new haxe_ds_StringMap();
	this.scount = 0;
};
$hxClasses["haxe.Serializer"] = haxe_Serializer;
haxe_Serializer.__name__ = ["haxe","Serializer"];
haxe_Serializer.prototype = {
	toString: function() {
		return this.buf.b;
	}
	,serializeString: function(s) {
		var x = this.shash.get(s);
		if(x != null) {
			this.buf.b += "R";
			if(x == null) this.buf.b += "null"; else this.buf.b += "" + x;
			return;
		}
		this.shash.set(s,this.scount++);
		this.buf.b += "y";
		s = encodeURIComponent(s);
		if(s.length == null) this.buf.b += "null"; else this.buf.b += "" + s.length;
		this.buf.b += ":";
		if(s == null) this.buf.b += "null"; else this.buf.b += "" + s;
	}
	,serializeRef: function(v) {
		var vt = typeof(v);
		var _g1 = 0;
		var _g = this.cache.length;
		while(_g1 < _g) {
			var i = _g1++;
			var ci = this.cache[i];
			if(typeof(ci) == vt && ci == v) {
				this.buf.b += "r";
				if(i == null) this.buf.b += "null"; else this.buf.b += "" + i;
				return true;
			}
		}
		this.cache.push(v);
		return false;
	}
	,serializeFields: function(v) {
		var _g = 0;
		var _g1 = Reflect.fields(v);
		while(_g < _g1.length) {
			var f = _g1[_g];
			++_g;
			this.serializeString(f);
			this.serialize(Reflect.field(v,f));
		}
		this.buf.b += "g";
	}
	,serialize: function(v) {
		{
			var _g = Type["typeof"](v);
			switch(_g[1]) {
			case 0:
				this.buf.b += "n";
				break;
			case 1:
				var v1 = v;
				if(v1 == 0) {
					this.buf.b += "z";
					return;
				}
				this.buf.b += "i";
				if(v1 == null) this.buf.b += "null"; else this.buf.b += "" + v1;
				break;
			case 2:
				var v2 = v;
				if(isNaN(v2)) this.buf.b += "k"; else if(!isFinite(v2)) if(v2 < 0) this.buf.b += "m"; else this.buf.b += "p"; else {
					this.buf.b += "d";
					if(v2 == null) this.buf.b += "null"; else this.buf.b += "" + v2;
				}
				break;
			case 3:
				if(v) this.buf.b += "t"; else this.buf.b += "f";
				break;
			case 6:
				var c = _g[2];
				if(c == String) {
					this.serializeString(v);
					return;
				}
				if(this.useCache && this.serializeRef(v)) return;
				switch(c) {
				case Array:
					var ucount = 0;
					this.buf.b += "a";
					var l = v.length;
					var _g1 = 0;
					while(_g1 < l) {
						var i = _g1++;
						if(v[i] == null) ucount++; else {
							if(ucount > 0) {
								if(ucount == 1) this.buf.b += "n"; else {
									this.buf.b += "u";
									if(ucount == null) this.buf.b += "null"; else this.buf.b += "" + ucount;
								}
								ucount = 0;
							}
							this.serialize(v[i]);
						}
					}
					if(ucount > 0) {
						if(ucount == 1) this.buf.b += "n"; else {
							this.buf.b += "u";
							if(ucount == null) this.buf.b += "null"; else this.buf.b += "" + ucount;
						}
					}
					this.buf.b += "h";
					break;
				case List:
					this.buf.b += "l";
					var v3 = v;
					var _g1_head = v3.h;
					var _g1_val = null;
					while(_g1_head != null) {
						var i1;
						_g1_val = _g1_head[0];
						_g1_head = _g1_head[1];
						i1 = _g1_val;
						this.serialize(i1);
					}
					this.buf.b += "h";
					break;
				case Date:
					var d = v;
					this.buf.b += "v";
					this.buf.add(d.getTime());
					break;
				case haxe_ds_StringMap:
					this.buf.b += "b";
					var v4 = v;
					var $it0 = v4.keys();
					while( $it0.hasNext() ) {
						var k = $it0.next();
						this.serializeString(k);
						this.serialize(__map_reserved[k] != null?v4.getReserved(k):v4.h[k]);
					}
					this.buf.b += "h";
					break;
				case haxe_ds_IntMap:
					this.buf.b += "q";
					var v5 = v;
					var $it1 = v5.keys();
					while( $it1.hasNext() ) {
						var k1 = $it1.next();
						this.buf.b += ":";
						if(k1 == null) this.buf.b += "null"; else this.buf.b += "" + k1;
						this.serialize(v5.h[k1]);
					}
					this.buf.b += "h";
					break;
				case haxe_ds_ObjectMap:
					this.buf.b += "M";
					var v6 = v;
					var $it2 = v6.keys();
					while( $it2.hasNext() ) {
						var k2 = $it2.next();
						var id = Reflect.field(k2,"__id__");
						Reflect.deleteField(k2,"__id__");
						this.serialize(k2);
						k2.__id__ = id;
						this.serialize(v6.h[k2.__id__]);
					}
					this.buf.b += "h";
					break;
				case haxe_io_Bytes:
					var v7 = v;
					var i2 = 0;
					var max = v7.length - 2;
					var charsBuf = new StringBuf();
					var b64 = haxe_Serializer.BASE64;
					while(i2 < max) {
						var b1 = v7.get(i2++);
						var b2 = v7.get(i2++);
						var b3 = v7.get(i2++);
						charsBuf.add(b64.charAt(b1 >> 2));
						charsBuf.add(b64.charAt((b1 << 4 | b2 >> 4) & 63));
						charsBuf.add(b64.charAt((b2 << 2 | b3 >> 6) & 63));
						charsBuf.add(b64.charAt(b3 & 63));
					}
					if(i2 == max) {
						var b11 = v7.get(i2++);
						var b21 = v7.get(i2++);
						charsBuf.add(b64.charAt(b11 >> 2));
						charsBuf.add(b64.charAt((b11 << 4 | b21 >> 4) & 63));
						charsBuf.add(b64.charAt(b21 << 2 & 63));
					} else if(i2 == max + 1) {
						var b12 = v7.get(i2++);
						charsBuf.add(b64.charAt(b12 >> 2));
						charsBuf.add(b64.charAt(b12 << 4 & 63));
					}
					var chars = charsBuf.b;
					this.buf.b += "s";
					if(chars.length == null) this.buf.b += "null"; else this.buf.b += "" + chars.length;
					this.buf.b += ":";
					if(chars == null) this.buf.b += "null"; else this.buf.b += "" + chars;
					break;
				default:
					if(this.useCache) this.cache.pop();
					if(v.hxSerialize != null) {
						this.buf.b += "C";
						this.serializeString(Type.getClassName(c));
						if(this.useCache) this.cache.push(v);
						v.hxSerialize(this);
						this.buf.b += "g";
					} else {
						this.buf.b += "c";
						this.serializeString(Type.getClassName(c));
						if(this.useCache) this.cache.push(v);
						this.serializeFields(v);
					}
				}
				break;
			case 4:
				if(js_Boot.__instanceof(v,Class)) {
					var className = Type.getClassName(v);
					this.buf.b += "A";
					this.serializeString(className);
				} else if(js_Boot.__instanceof(v,Enum)) {
					this.buf.b += "B";
					this.serializeString(Type.getEnumName(v));
				} else {
					if(this.useCache && this.serializeRef(v)) return;
					this.buf.b += "o";
					this.serializeFields(v);
				}
				break;
			case 7:
				var e = _g[2];
				if(this.useCache) {
					if(this.serializeRef(v)) return;
					this.cache.pop();
				}
				if(this.useEnumIndex) this.buf.b += "j"; else this.buf.b += "w";
				this.serializeString(Type.getEnumName(e));
				if(this.useEnumIndex) {
					this.buf.b += ":";
					this.buf.b += Std.string(v[1]);
				} else this.serializeString(v[0]);
				this.buf.b += ":";
				var l1 = v.length;
				this.buf.b += Std.string(l1 - 2);
				var _g11 = 2;
				while(_g11 < l1) {
					var i3 = _g11++;
					this.serialize(v[i3]);
				}
				if(this.useCache) this.cache.push(v);
				break;
			case 5:
				throw new js__$Boot_HaxeError("Cannot serialize function");
				break;
			default:
				throw new js__$Boot_HaxeError("Cannot serialize " + Std.string(v));
			}
		}
	}
	,__class__: haxe_Serializer
};
var haxe_Timer = function(time_ms) {
	var me = this;
	this.id = setInterval(function() {
		me.run();
	},time_ms);
};
$hxClasses["haxe.Timer"] = haxe_Timer;
haxe_Timer.__name__ = ["haxe","Timer"];
haxe_Timer.prototype = {
	run: function() {
	}
	,__class__: haxe_Timer
};
var haxe_Unserializer = function(buf) {
	this.buf = buf;
	this.length = buf.length;
	this.pos = 0;
	this.scache = [];
	this.cache = [];
	var r = haxe_Unserializer.DEFAULT_RESOLVER;
	if(r == null) {
		r = Type;
		haxe_Unserializer.DEFAULT_RESOLVER = r;
	}
	this.setResolver(r);
};
$hxClasses["haxe.Unserializer"] = haxe_Unserializer;
haxe_Unserializer.__name__ = ["haxe","Unserializer"];
haxe_Unserializer.initCodes = function() {
	var codes = [];
	var _g1 = 0;
	var _g = haxe_Unserializer.BASE64.length;
	while(_g1 < _g) {
		var i = _g1++;
		codes[haxe_Unserializer.BASE64.charCodeAt(i)] = i;
	}
	return codes;
};
haxe_Unserializer.prototype = {
	setResolver: function(r) {
		if(r == null) this.resolver = { resolveClass : function(_) {
			return null;
		}, resolveEnum : function(_1) {
			return null;
		}}; else this.resolver = r;
	}
	,get: function(p) {
		return this.buf.charCodeAt(p);
	}
	,readDigits: function() {
		var k = 0;
		var s = false;
		var fpos = this.pos;
		while(true) {
			var c = this.buf.charCodeAt(this.pos);
			if(c != c) break;
			if(c == 45) {
				if(this.pos != fpos) break;
				s = true;
				this.pos++;
				continue;
			}
			if(c < 48 || c > 57) break;
			k = k * 10 + (c - 48);
			this.pos++;
		}
		if(s) k *= -1;
		return k;
	}
	,readFloat: function() {
		var p1 = this.pos;
		while(true) {
			var c = this.buf.charCodeAt(this.pos);
			if(c >= 43 && c < 58 || c == 101 || c == 69) this.pos++; else break;
		}
		return Std.parseFloat(HxOverrides.substr(this.buf,p1,this.pos - p1));
	}
	,unserializeObject: function(o) {
		while(true) {
			if(this.pos >= this.length) throw new js__$Boot_HaxeError("Invalid object");
			if(this.buf.charCodeAt(this.pos) == 103) break;
			var k = this.unserialize();
			if(!(typeof(k) == "string")) throw new js__$Boot_HaxeError("Invalid object key");
			var v = this.unserialize();
			o[k] = v;
		}
		this.pos++;
	}
	,unserializeEnum: function(edecl,tag) {
		if(this.get(this.pos++) != 58) throw new js__$Boot_HaxeError("Invalid enum format");
		var nargs = this.readDigits();
		if(nargs == 0) return Type.createEnum(edecl,tag);
		var args = [];
		while(nargs-- > 0) args.push(this.unserialize());
		return Type.createEnum(edecl,tag,args);
	}
	,unserialize: function() {
		var _g = this.get(this.pos++);
		switch(_g) {
		case 110:
			return null;
		case 116:
			return true;
		case 102:
			return false;
		case 122:
			return 0;
		case 105:
			return this.readDigits();
		case 100:
			return this.readFloat();
		case 121:
			var len = this.readDigits();
			if(this.get(this.pos++) != 58 || this.length - this.pos < len) throw new js__$Boot_HaxeError("Invalid string length");
			var s = HxOverrides.substr(this.buf,this.pos,len);
			this.pos += len;
			s = decodeURIComponent(s.split("+").join(" "));
			this.scache.push(s);
			return s;
		case 107:
			return NaN;
		case 109:
			return -Infinity;
		case 112:
			return Infinity;
		case 97:
			var buf = this.buf;
			var a = [];
			this.cache.push(a);
			while(true) {
				var c = this.buf.charCodeAt(this.pos);
				if(c == 104) {
					this.pos++;
					break;
				}
				if(c == 117) {
					this.pos++;
					var n = this.readDigits();
					a[a.length + n - 1] = null;
				} else a.push(this.unserialize());
			}
			return a;
		case 111:
			var o = { };
			this.cache.push(o);
			this.unserializeObject(o);
			return o;
		case 114:
			var n1 = this.readDigits();
			if(n1 < 0 || n1 >= this.cache.length) throw new js__$Boot_HaxeError("Invalid reference");
			return this.cache[n1];
		case 82:
			var n2 = this.readDigits();
			if(n2 < 0 || n2 >= this.scache.length) throw new js__$Boot_HaxeError("Invalid string reference");
			return this.scache[n2];
		case 120:
			throw new js__$Boot_HaxeError(this.unserialize());
			break;
		case 99:
			var name = this.unserialize();
			var cl = this.resolver.resolveClass(name);
			if(cl == null) throw new js__$Boot_HaxeError("Class not found " + name);
			var o1 = Type.createEmptyInstance(cl);
			this.cache.push(o1);
			this.unserializeObject(o1);
			return o1;
		case 119:
			var name1 = this.unserialize();
			var edecl = this.resolver.resolveEnum(name1);
			if(edecl == null) throw new js__$Boot_HaxeError("Enum not found " + name1);
			var e = this.unserializeEnum(edecl,this.unserialize());
			this.cache.push(e);
			return e;
		case 106:
			var name2 = this.unserialize();
			var edecl1 = this.resolver.resolveEnum(name2);
			if(edecl1 == null) throw new js__$Boot_HaxeError("Enum not found " + name2);
			this.pos++;
			var index = this.readDigits();
			var tag = Type.getEnumConstructs(edecl1)[index];
			if(tag == null) throw new js__$Boot_HaxeError("Unknown enum index " + name2 + "@" + index);
			var e1 = this.unserializeEnum(edecl1,tag);
			this.cache.push(e1);
			return e1;
		case 108:
			var l = new List();
			this.cache.push(l);
			var buf1 = this.buf;
			while(this.buf.charCodeAt(this.pos) != 104) l.add(this.unserialize());
			this.pos++;
			return l;
		case 98:
			var h = new haxe_ds_StringMap();
			this.cache.push(h);
			var buf2 = this.buf;
			while(this.buf.charCodeAt(this.pos) != 104) {
				var s1 = this.unserialize();
				h.set(s1,this.unserialize());
			}
			this.pos++;
			return h;
		case 113:
			var h1 = new haxe_ds_IntMap();
			this.cache.push(h1);
			var buf3 = this.buf;
			var c1 = this.get(this.pos++);
			while(c1 == 58) {
				var i = this.readDigits();
				h1.set(i,this.unserialize());
				c1 = this.get(this.pos++);
			}
			if(c1 != 104) throw new js__$Boot_HaxeError("Invalid IntMap format");
			return h1;
		case 77:
			var h2 = new haxe_ds_ObjectMap();
			this.cache.push(h2);
			var buf4 = this.buf;
			while(this.buf.charCodeAt(this.pos) != 104) {
				var s2 = this.unserialize();
				h2.set(s2,this.unserialize());
			}
			this.pos++;
			return h2;
		case 118:
			var d;
			if(this.buf.charCodeAt(this.pos) >= 48 && this.buf.charCodeAt(this.pos) <= 57 && this.buf.charCodeAt(this.pos + 1) >= 48 && this.buf.charCodeAt(this.pos + 1) <= 57 && this.buf.charCodeAt(this.pos + 2) >= 48 && this.buf.charCodeAt(this.pos + 2) <= 57 && this.buf.charCodeAt(this.pos + 3) >= 48 && this.buf.charCodeAt(this.pos + 3) <= 57 && this.buf.charCodeAt(this.pos + 4) == 45) {
				var s3 = HxOverrides.substr(this.buf,this.pos,19);
				d = HxOverrides.strDate(s3);
				this.pos += 19;
			} else {
				var t = this.readFloat();
				var d1 = new Date();
				d1.setTime(t);
				d = d1;
			}
			this.cache.push(d);
			return d;
		case 115:
			var len1 = this.readDigits();
			var buf5 = this.buf;
			if(this.get(this.pos++) != 58 || this.length - this.pos < len1) throw new js__$Boot_HaxeError("Invalid bytes length");
			var codes = haxe_Unserializer.CODES;
			if(codes == null) {
				codes = haxe_Unserializer.initCodes();
				haxe_Unserializer.CODES = codes;
			}
			var i1 = this.pos;
			var rest = len1 & 3;
			var size;
			size = (len1 >> 2) * 3 + (rest >= 2?rest - 1:0);
			var max = i1 + (len1 - rest);
			var bytes = haxe_io_Bytes.alloc(size);
			var bpos = 0;
			while(i1 < max) {
				var c11 = codes[StringTools.fastCodeAt(buf5,i1++)];
				var c2 = codes[StringTools.fastCodeAt(buf5,i1++)];
				bytes.set(bpos++,c11 << 2 | c2 >> 4);
				var c3 = codes[StringTools.fastCodeAt(buf5,i1++)];
				bytes.set(bpos++,c2 << 4 | c3 >> 2);
				var c4 = codes[StringTools.fastCodeAt(buf5,i1++)];
				bytes.set(bpos++,c3 << 6 | c4);
			}
			if(rest >= 2) {
				var c12 = codes[StringTools.fastCodeAt(buf5,i1++)];
				var c21 = codes[StringTools.fastCodeAt(buf5,i1++)];
				bytes.set(bpos++,c12 << 2 | c21 >> 4);
				if(rest == 3) {
					var c31 = codes[StringTools.fastCodeAt(buf5,i1++)];
					bytes.set(bpos++,c21 << 4 | c31 >> 2);
				}
			}
			this.pos += len1;
			this.cache.push(bytes);
			return bytes;
		case 67:
			var name3 = this.unserialize();
			var cl1 = this.resolver.resolveClass(name3);
			if(cl1 == null) throw new js__$Boot_HaxeError("Class not found " + name3);
			var o2 = Type.createEmptyInstance(cl1);
			this.cache.push(o2);
			o2.hxUnserialize(this);
			if(this.get(this.pos++) != 103) throw new js__$Boot_HaxeError("Invalid custom data");
			return o2;
		case 65:
			var name4 = this.unserialize();
			var cl2 = this.resolver.resolveClass(name4);
			if(cl2 == null) throw new js__$Boot_HaxeError("Class not found " + name4);
			return cl2;
		case 66:
			var name5 = this.unserialize();
			var e2 = this.resolver.resolveEnum(name5);
			if(e2 == null) throw new js__$Boot_HaxeError("Enum not found " + name5);
			return e2;
		default:
		}
		this.pos--;
		throw new js__$Boot_HaxeError("Invalid char " + this.buf.charAt(this.pos) + " at position " + this.pos);
	}
	,__class__: haxe_Unserializer
};
var haxe_ds_IntMap = function() {
	this.h = { };
};
$hxClasses["haxe.ds.IntMap"] = haxe_ds_IntMap;
haxe_ds_IntMap.__name__ = ["haxe","ds","IntMap"];
haxe_ds_IntMap.__interfaces__ = [haxe_IMap];
haxe_ds_IntMap.prototype = {
	set: function(key,value) {
		this.h[key] = value;
	}
	,remove: function(key) {
		if(!this.h.hasOwnProperty(key)) return false;
		delete(this.h[key]);
		return true;
	}
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key | 0);
		}
		return HxOverrides.iter(a);
	}
	,__class__: haxe_ds_IntMap
};
var haxe_ds_ObjectMap = function() {
	this.h = { };
	this.h.__keys__ = { };
};
$hxClasses["haxe.ds.ObjectMap"] = haxe_ds_ObjectMap;
haxe_ds_ObjectMap.__name__ = ["haxe","ds","ObjectMap"];
haxe_ds_ObjectMap.__interfaces__ = [haxe_IMap];
haxe_ds_ObjectMap.prototype = {
	set: function(key,value) {
		var id = key.__id__ || (key.__id__ = ++haxe_ds_ObjectMap.count);
		this.h[id] = value;
		this.h.__keys__[id] = key;
	}
	,keys: function() {
		var a = [];
		for( var key in this.h.__keys__ ) {
		if(this.h.hasOwnProperty(key)) a.push(this.h.__keys__[key]);
		}
		return HxOverrides.iter(a);
	}
	,__class__: haxe_ds_ObjectMap
};
var haxe_ds_Option = $hxClasses["haxe.ds.Option"] = { __ename__ : ["haxe","ds","Option"], __constructs__ : ["Some","None"] };
haxe_ds_Option.Some = function(v) { var $x = ["Some",0,v]; $x.__enum__ = haxe_ds_Option; $x.toString = $estr; return $x; };
haxe_ds_Option.None = ["None",1];
haxe_ds_Option.None.toString = $estr;
haxe_ds_Option.None.__enum__ = haxe_ds_Option;
var haxe_ds_StringMap = function() {
	this.h = { };
};
$hxClasses["haxe.ds.StringMap"] = haxe_ds_StringMap;
haxe_ds_StringMap.__name__ = ["haxe","ds","StringMap"];
haxe_ds_StringMap.__interfaces__ = [haxe_IMap];
haxe_ds_StringMap.prototype = {
	set: function(key,value) {
		if(__map_reserved[key] != null) this.setReserved(key,value); else this.h[key] = value;
	}
	,get: function(key) {
		if(__map_reserved[key] != null) return this.getReserved(key);
		return this.h[key];
	}
	,setReserved: function(key,value) {
		if(this.rh == null) this.rh = { };
		this.rh["$" + key] = value;
	}
	,getReserved: function(key) {
		if(this.rh == null) return null; else return this.rh["$" + key];
	}
	,keys: function() {
		var _this = this.arrayKeys();
		return HxOverrides.iter(_this);
	}
	,arrayKeys: function() {
		var out = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) out.push(key);
		}
		if(this.rh != null) {
			for( var key in this.rh ) {
			if(key.charCodeAt(0) == 36) out.push(key.substr(1));
			}
		}
		return out;
	}
	,__class__: haxe_ds_StringMap
};
var haxe_io_Bytes = function(data) {
	this.length = data.byteLength;
	this.b = new Uint8Array(data);
	this.b.bufferValue = data;
	data.hxBytes = this;
	data.bytes = this.b;
};
$hxClasses["haxe.io.Bytes"] = haxe_io_Bytes;
haxe_io_Bytes.__name__ = ["haxe","io","Bytes"];
haxe_io_Bytes.alloc = function(length) {
	return new haxe_io_Bytes(new ArrayBuffer(length));
};
haxe_io_Bytes.prototype = {
	get: function(pos) {
		return this.b[pos];
	}
	,set: function(pos,v) {
		this.b[pos] = v & 255;
	}
	,__class__: haxe_io_Bytes
};
var haxe_io_Error = $hxClasses["haxe.io.Error"] = { __ename__ : ["haxe","io","Error"], __constructs__ : ["Blocked","Overflow","OutsideBounds","Custom"] };
haxe_io_Error.Blocked = ["Blocked",0];
haxe_io_Error.Blocked.toString = $estr;
haxe_io_Error.Blocked.__enum__ = haxe_io_Error;
haxe_io_Error.Overflow = ["Overflow",1];
haxe_io_Error.Overflow.toString = $estr;
haxe_io_Error.Overflow.__enum__ = haxe_io_Error;
haxe_io_Error.OutsideBounds = ["OutsideBounds",2];
haxe_io_Error.OutsideBounds.toString = $estr;
haxe_io_Error.OutsideBounds.__enum__ = haxe_io_Error;
haxe_io_Error.Custom = function(e) { var $x = ["Custom",3,e]; $x.__enum__ = haxe_io_Error; $x.toString = $estr; return $x; };
var haxe_io_FPHelper = function() { };
$hxClasses["haxe.io.FPHelper"] = haxe_io_FPHelper;
haxe_io_FPHelper.__name__ = ["haxe","io","FPHelper"];
haxe_io_FPHelper.i32ToFloat = function(i) {
	var sign = 1 - (i >>> 31 << 1);
	var exp = i >>> 23 & 255;
	var sig = i & 8388607;
	if(sig == 0 && exp == 0) return 0.0;
	return sign * (1 + Math.pow(2,-23) * sig) * Math.pow(2,exp - 127);
};
haxe_io_FPHelper.floatToI32 = function(f) {
	if(f == 0) return 0;
	var af;
	if(f < 0) af = -f; else af = f;
	var exp = Math.floor(Math.log(af) / 0.6931471805599453);
	if(exp < -127) exp = -127; else if(exp > 128) exp = 128;
	var sig = Math.round((af / Math.pow(2,exp) - 1) * 8388608) & 8388607;
	return (f < 0?-2147483648:0) | exp + 127 << 23 | sig;
};
haxe_io_FPHelper.i64ToDouble = function(low,high) {
	var sign = 1 - (high >>> 31 << 1);
	var exp = (high >> 20 & 2047) - 1023;
	var sig = (high & 1048575) * 4294967296. + (low >>> 31) * 2147483648. + (low & 2147483647);
	if(sig == 0 && exp == -1023) return 0.0;
	return sign * (1.0 + Math.pow(2,-52) * sig) * Math.pow(2,exp);
};
haxe_io_FPHelper.doubleToI64 = function(v) {
	var i64 = haxe_io_FPHelper.i64tmp;
	if(v == 0) {
		i64.low = 0;
		i64.high = 0;
	} else {
		var av;
		if(v < 0) av = -v; else av = v;
		var exp = Math.floor(Math.log(av) / 0.6931471805599453);
		var sig;
		var v1 = (av / Math.pow(2,exp) - 1) * 4503599627370496.;
		sig = Math.round(v1);
		var sig_l = sig | 0;
		var sig_h = sig / 4294967296.0 | 0;
		i64.low = sig_l;
		i64.high = (v < 0?-2147483648:0) | exp + 1023 << 20 | sig_h;
	}
	return i64;
};
var js__$Boot_HaxeError = function(val) {
	Error.call(this);
	this.val = val;
	this.message = String(val);
	if(Error.captureStackTrace) Error.captureStackTrace(this,js__$Boot_HaxeError);
};
$hxClasses["js._Boot.HaxeError"] = js__$Boot_HaxeError;
js__$Boot_HaxeError.__name__ = ["js","_Boot","HaxeError"];
js__$Boot_HaxeError.__super__ = Error;
js__$Boot_HaxeError.prototype = $extend(Error.prototype,{
	__class__: js__$Boot_HaxeError
});
var js_Boot = function() { };
$hxClasses["js.Boot"] = js_Boot;
js_Boot.__name__ = ["js","Boot"];
js_Boot.getClass = function(o) {
	if((o instanceof Array) && o.__enum__ == null) return Array; else {
		var cl = o.__class__;
		if(cl != null) return cl;
		var name = js_Boot.__nativeClassName(o);
		if(name != null) return js_Boot.__resolveNativeClass(name);
		return null;
	}
};
js_Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str2 = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i1 = _g1++;
					if(i1 != 2) str2 += "," + js_Boot.__string_rec(o[i1],s); else str2 += js_Boot.__string_rec(o[i1],s);
				}
				return str2 + ")";
			}
			var l = o.length;
			var i;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js_Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js_Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0;
		var _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js_Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js_Boot.__interfLoop(cc.__super__,cl);
};
js_Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Array:
		return (o instanceof Array) && o.__enum__ == null;
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) return true;
				if(js_Boot.__interfLoop(js_Boot.getClass(o),cl)) return true;
			} else if(typeof(cl) == "object" && js_Boot.__isNativeObj(cl)) {
				if(o instanceof cl) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
};
js_Boot.__nativeClassName = function(o) {
	var name = js_Boot.__toStr.call(o).slice(8,-1);
	if(name == "Object" || name == "Function" || name == "Math" || name == "JSON") return null;
	return name;
};
js_Boot.__isNativeObj = function(o) {
	return js_Boot.__nativeClassName(o) != null;
};
js_Boot.__resolveNativeClass = function(name) {
	return $global[name];
};
var js_html_compat_ArrayBuffer = function(a) {
	if((a instanceof Array) && a.__enum__ == null) {
		this.a = a;
		this.byteLength = a.length;
	} else {
		var len = a;
		this.a = [];
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			this.a[i] = 0;
		}
		this.byteLength = len;
	}
};
$hxClasses["js.html.compat.ArrayBuffer"] = js_html_compat_ArrayBuffer;
js_html_compat_ArrayBuffer.__name__ = ["js","html","compat","ArrayBuffer"];
js_html_compat_ArrayBuffer.sliceImpl = function(begin,end) {
	var u = new Uint8Array(this,begin,end == null?null:end - begin);
	var result = new ArrayBuffer(u.byteLength);
	var resultArray = new Uint8Array(result);
	resultArray.set(u);
	return result;
};
js_html_compat_ArrayBuffer.prototype = {
	slice: function(begin,end) {
		return new js_html_compat_ArrayBuffer(this.a.slice(begin,end));
	}
	,__class__: js_html_compat_ArrayBuffer
};
var js_html_compat_DataView = function(buffer,byteOffset,byteLength) {
	this.buf = buffer;
	if(byteOffset == null) this.offset = 0; else this.offset = byteOffset;
	if(byteLength == null) this.length = buffer.byteLength - this.offset; else this.length = byteLength;
	if(this.offset < 0 || this.length < 0 || this.offset + this.length > buffer.byteLength) throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
};
$hxClasses["js.html.compat.DataView"] = js_html_compat_DataView;
js_html_compat_DataView.__name__ = ["js","html","compat","DataView"];
js_html_compat_DataView.prototype = {
	getInt8: function(byteOffset) {
		var v = this.buf.a[this.offset + byteOffset];
		if(v >= 128) return v - 256; else return v;
	}
	,getUint8: function(byteOffset) {
		return this.buf.a[this.offset + byteOffset];
	}
	,getInt16: function(byteOffset,littleEndian) {
		var v = this.getUint16(byteOffset,littleEndian);
		if(v >= 32768) return v - 65536; else return v;
	}
	,getUint16: function(byteOffset,littleEndian) {
		if(littleEndian) return this.buf.a[this.offset + byteOffset] | this.buf.a[this.offset + byteOffset + 1] << 8; else return this.buf.a[this.offset + byteOffset] << 8 | this.buf.a[this.offset + byteOffset + 1];
	}
	,getInt32: function(byteOffset,littleEndian) {
		var p = this.offset + byteOffset;
		var a = this.buf.a[p++];
		var b = this.buf.a[p++];
		var c = this.buf.a[p++];
		var d = this.buf.a[p++];
		if(littleEndian) return a | b << 8 | c << 16 | d << 24; else return d | c << 8 | b << 16 | a << 24;
	}
	,getUint32: function(byteOffset,littleEndian) {
		var v = this.getInt32(byteOffset,littleEndian);
		if(v < 0) return v + 4294967296.; else return v;
	}
	,getFloat32: function(byteOffset,littleEndian) {
		return haxe_io_FPHelper.i32ToFloat(this.getInt32(byteOffset,littleEndian));
	}
	,getFloat64: function(byteOffset,littleEndian) {
		var a = this.getInt32(byteOffset,littleEndian);
		var b = this.getInt32(byteOffset + 4,littleEndian);
		return haxe_io_FPHelper.i64ToDouble(littleEndian?a:b,littleEndian?b:a);
	}
	,setInt8: function(byteOffset,value) {
		if(value < 0) this.buf.a[byteOffset + this.offset] = value + 128 & 255; else this.buf.a[byteOffset + this.offset] = value & 255;
	}
	,setUint8: function(byteOffset,value) {
		this.buf.a[byteOffset + this.offset] = value & 255;
	}
	,setInt16: function(byteOffset,value,littleEndian) {
		this.setUint16(byteOffset,value < 0?value + 65536:value,littleEndian);
	}
	,setUint16: function(byteOffset,value,littleEndian) {
		var p = byteOffset + this.offset;
		if(littleEndian) {
			this.buf.a[p] = value & 255;
			this.buf.a[p++] = value >> 8 & 255;
		} else {
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p] = value & 255;
		}
	}
	,setInt32: function(byteOffset,value,littleEndian) {
		this.setUint32(byteOffset,value,littleEndian);
	}
	,setUint32: function(byteOffset,value,littleEndian) {
		var p = byteOffset + this.offset;
		if(littleEndian) {
			this.buf.a[p++] = value & 255;
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p++] = value >> 16 & 255;
			this.buf.a[p++] = value >>> 24;
		} else {
			this.buf.a[p++] = value >>> 24;
			this.buf.a[p++] = value >> 16 & 255;
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p++] = value & 255;
		}
	}
	,setFloat32: function(byteOffset,value,littleEndian) {
		this.setUint32(byteOffset,haxe_io_FPHelper.floatToI32(value),littleEndian);
	}
	,setFloat64: function(byteOffset,value,littleEndian) {
		var i64 = haxe_io_FPHelper.doubleToI64(value);
		if(littleEndian) {
			this.setUint32(byteOffset,i64.low);
			this.setUint32(byteOffset,i64.high);
		} else {
			this.setUint32(byteOffset,i64.high);
			this.setUint32(byteOffset,i64.low);
		}
	}
	,__class__: js_html_compat_DataView
};
var js_html_compat_Uint8Array = function() { };
$hxClasses["js.html.compat.Uint8Array"] = js_html_compat_Uint8Array;
js_html_compat_Uint8Array.__name__ = ["js","html","compat","Uint8Array"];
js_html_compat_Uint8Array._new = function(arg1,offset,length) {
	var arr;
	if(typeof(arg1) == "number") {
		arr = [];
		var _g = 0;
		while(_g < arg1) {
			var i = _g++;
			arr[i] = 0;
		}
		arr.byteLength = arr.length;
		arr.byteOffset = 0;
		arr.buffer = new js_html_compat_ArrayBuffer(arr);
	} else if(js_Boot.__instanceof(arg1,js_html_compat_ArrayBuffer)) {
		var buffer = arg1;
		if(offset == null) offset = 0;
		if(length == null) length = buffer.byteLength - offset;
		if(offset == 0) arr = buffer.a; else arr = buffer.a.slice(offset,offset + length);
		arr.byteLength = arr.length;
		arr.byteOffset = offset;
		arr.buffer = buffer;
	} else if((arg1 instanceof Array) && arg1.__enum__ == null) {
		arr = arg1.slice();
		arr.byteLength = arr.length;
		arr.byteOffset = 0;
		arr.buffer = new js_html_compat_ArrayBuffer(arr);
	} else throw new js__$Boot_HaxeError("TODO " + Std.string(arg1));
	arr.subarray = js_html_compat_Uint8Array._subarray;
	arr.set = js_html_compat_Uint8Array._set;
	return arr;
};
js_html_compat_Uint8Array._set = function(arg,offset) {
	var t = this;
	if(js_Boot.__instanceof(arg.buffer,js_html_compat_ArrayBuffer)) {
		var a = arg;
		if(arg.byteLength + offset > t.byteLength) throw new js__$Boot_HaxeError("set() outside of range");
		var _g1 = 0;
		var _g = arg.byteLength;
		while(_g1 < _g) {
			var i = _g1++;
			t[i + offset] = a[i];
		}
	} else if((arg instanceof Array) && arg.__enum__ == null) {
		var a1 = arg;
		if(a1.length + offset > t.byteLength) throw new js__$Boot_HaxeError("set() outside of range");
		var _g11 = 0;
		var _g2 = a1.length;
		while(_g11 < _g2) {
			var i1 = _g11++;
			t[i1 + offset] = a1[i1];
		}
	} else throw new js__$Boot_HaxeError("TODO");
};
js_html_compat_Uint8Array._subarray = function(start,end) {
	var t = this;
	var a = js_html_compat_Uint8Array._new(t.slice(start,end));
	a.byteOffset = start;
	return a;
};
var js_node_ChildProcess = require("child_process");
var js_node_buffer_Buffer = require("buffer").Buffer;
var lib_atom_MessagePanelView = require("atom-message-panel").MessagePanelView;
var lib_atom_PlainMessageView = require("atom-message-panel").PlainMessageView;
var platform_atom_ChildProcess = function() {
	this.killed = false;
	this.ready = false;
	this.queued_messages = [];
	this.got_node_enoent_error = false;
	this.message_handlers = [];
	this.start_proc();
};
$hxClasses["platform.atom.ChildProcess"] = platform_atom_ChildProcess;
platform_atom_ChildProcess.__name__ = ["platform","atom","ChildProcess"];
platform_atom_ChildProcess.prototype = {
	on_message: function(callback) {
		this.message_handlers.push(callback);
	}
	,post_message: function(message) {
		if(!this.ready) {
			this.queued_messages.push(message);
			return;
		}
		this.proc.send({ kind : 0, data : message});
	}
	,kill: function() {
		this.killed = true;
		if(this.proc == null) return;
		try {
			this.proc.kill("SIGTERM");
		} catch( ex ) {
			if (ex instanceof js__$Boot_HaxeError) ex = ex.val;
			console.error(platform_atom_Log.format("Failed to kill child process."));
			platform_atom_MessagePanel.message(3,"Failed to kill child process.");
		}
		this.proc = null;
	}
	,start_proc: function() {
		var _g1 = this;
		var spawn_env;
		if(process.platform == "linux") spawn_env = Object.create(process.env); else spawn_env = { };
		spawn_env.ATOM_SHELL_INTERNAL_RUN_AS_NODE = "1";
		var node = process.execPath;
		var jsfile = __filename;
		if(StringTools.endsWith(jsfile,"-plugin.js")) jsfile = jsfile.substring(0,jsfile.length - 10) + "-worker.js";
		this.proc = js_node_ChildProcess.spawn(node,[jsfile,"has_parent_process"],{ cwd : process.cwd(), env : spawn_env, stdio : ["ipc"]});
		this.proc.on("message",function(message) {
			var _g = message.kind;
			switch(_g) {
			case 0:
				var _g2 = 0;
				var _g3 = _g1.message_handlers;
				while(_g2 < _g3.length) {
					var handler = _g3[_g2];
					++_g2;
					handler(message.data);
				}
				break;
			case 2:
				console.log(platform_atom_Log.format(message.data));
				break;
			case 3:
				platform_atom_Log.info(message.data,message.display);
				break;
			case 4:
				platform_atom_Log.warn(message.data,message.display);
				break;
			case 5:
				platform_atom_Log.error(message.data,message.display);
				break;
			case 1:
				_g1.ready = true;
				var messages = _g1.queued_messages;
				_g1.queued_messages = [];
				var _g21 = 0;
				while(_g21 < messages.length) {
					var message1 = messages[_g21];
					++_g21;
					_g1.post_message(message1);
				}
				break;
			}
		});
		this.proc.on("error",function(error) {
			if(error.code == "ENOENT" && error.path == node) _g1.got_node_enoent_error = true;
			console.error(platform_atom_Log.format(error));
			platform_atom_MessagePanel.message(3,error);
			_g1.proc = null;
		});
		this.proc.stdout.on("data",function(data) {
			console.log(platform_atom_Log.format(data));
		});
		this.proc.stderr.on("data",function(data1) {
			console.error(platform_atom_Log.format(data1));
			platform_atom_MessagePanel.message(3,data1);
		});
		this.proc.on("close",function(code) {
			if(_g1.killed) return;
			if(code == 100) _g1.start_proc(); else if(_g1.got_node_enoent_error) {
				console.error(platform_atom_Log.format("Cannot start child process because of ENOENT error."));
				platform_atom_MessagePanel.message(3,"Cannot start child process because of ENOENT error.");
			} else {
				platform_atom_Log.warn("Restarting child process. Don't know why it stopped with code: " + code,null);
				_g1.start_proc();
			}
		});
	}
	,__class__: platform_atom_ChildProcess
};
var platform_atom_Exec = function() { };
$hxClasses["platform.atom.Exec"] = platform_atom_Exec;
platform_atom_Exec.__name__ = ["platform","atom","Exec"];
platform_atom_Exec.run = function(cmd,args,options,ondataout,ondataerr) {
	return new utils_Promise(function(resolve,reject) {
		var total_err = "";
		var total_out = "";
		var spawn_options = { cwd : process.cwd()};
		if(options != null) {
			if(options.cwd != null) spawn_options.cwd = options.cwd;
		}
		if(process.platform == "darwin") {
			var prev_cmd = cmd;
			cmd = "/bin/bash";
			args = ["-l","-c"].concat(args);
		} else if(process.platform == "linux") {
			var prev_cmd1 = cmd;
			cmd = "/bin/bash";
			args = ["-c"].concat(args);
		}
		var proc = js_node_ChildProcess.spawn(cmd,args,spawn_options);
		proc.stdout.on("data",function(data) {
			var s = Std.string(data);
			total_out += s;
			if(ondataout != null) ondataout(s);
		});
		proc.stderr.on("data",function(data1) {
			var s1 = Std.string(data1);
			total_err += s1;
			if(ondataerr != null) ondataerr(s1);
		});
		proc.on("close",function(code) {
			resolve({ out : total_out, err : total_err, code : code});
		});
	});
};
var platform_atom_Log = function() { };
$hxClasses["platform.atom.Log"] = platform_atom_Log;
platform_atom_Log.__name__ = ["platform","atom","Log"];
platform_atom_Log.debug = function(data) {
	console.log(platform_atom_Log.format(data));
};
platform_atom_Log.info = function(data,display) {
	if(display == null) display = true;
	console.debug(platform_atom_Log.format(data));
	if(display) platform_atom_MessagePanel.message(1,data);
};
platform_atom_Log.warn = function(data,display) {
	if(display == null) display = true;
	console.warn(platform_atom_Log.format(data));
	if(display) platform_atom_MessagePanel.message(2,data);
};
platform_atom_Log.error = function(data,display) {
	if(display == null) display = true;
	console.error(platform_atom_Log.format(data));
	if(display) platform_atom_MessagePanel.message(3,data);
};
platform_atom_Log.format = function(data) {
	if(js_Boot.__instanceof(data,js_node_buffer_Buffer)) data = Std.string(data);
	return data;
};
var platform_atom_MessagePanel = function() { };
$hxClasses["platform.atom.MessagePanel"] = platform_atom_MessagePanel;
platform_atom_MessagePanel.__name__ = ["platform","atom","MessagePanel"];
platform_atom_MessagePanel.init = function() {
	platform_atom_MessagePanel.view = new lib_atom_MessagePanelView({ title : "Haxe"});
	platform_atom_MessagePanel.visible = false;
};
platform_atom_MessagePanel.show = function() {
	platform_atom_MessagePanel.view.attach();
	platform_atom_MessagePanel.visible = true;
};
platform_atom_MessagePanel.hide = function() {
	platform_atom_MessagePanel.view.close();
	platform_atom_MessagePanel.visible = false;
};
platform_atom_MessagePanel.clear = function() {
	platform_atom_MessagePanel.view.clear();
};
platform_atom_MessagePanel.toggle = function() {
	if(platform_atom_MessagePanel.visible) platform_atom_MessagePanel.hide(); else platform_atom_MessagePanel.show();
};
platform_atom_MessagePanel.message = function(kind,content) {
	content = utils_HtmlEscape.escape(content);
	platform_atom_MessagePanel.view.add(new lib_atom_PlainMessageView({ message : content, raw : true}));
	platform_atom_MessagePanel.view.body.scrollTop(1e10);
	platform_atom_MessagePanel.show();
};
var platform_atom_ParentProcess = function() { };
$hxClasses["platform.atom.ParentProcess"] = platform_atom_ParentProcess;
platform_atom_ParentProcess.__name__ = ["platform","atom","ParentProcess"];
platform_atom_ParentProcess.has_parent_process = function() {
	return (function($this) {
		var $r;
		var _this = process.argv;
		$r = HxOverrides.indexOf(_this,"has_parent_process",0);
		return $r;
	}(this)) != -1;
};
platform_atom_ParentProcess.on_message = function(callback) {
	platform_atom_ParentProcess.initialize_if_needed();
	platform_atom_ParentProcess.message_handlers.push(callback);
};
platform_atom_ParentProcess.post_message = function(message) {
	platform_atom_ParentProcess.initialize_if_needed();
	process.send({ kind : 0, data : message});
};
platform_atom_ParentProcess.initialize_if_needed = function() {
	if(!platform_atom_ParentProcess.has_parent_process()) {
		console.error(platform_atom_Log.format("Invalid call of ParentProcess: there is no parent process to send/receive message."));
		platform_atom_MessagePanel.message(3,"Invalid call of ParentProcess: there is no parent process to send/receive message.");
		return;
	}
	platform_atom_ParentProcess.keep_alive();
	process.on("message",function(message) {
		if(message.kind == 0) {
			var _g = 0;
			var _g1 = platform_atom_ParentProcess.message_handlers;
			while(_g < _g1.length) {
				var handler = _g1[_g];
				++_g;
				handler(message.data);
			}
		}
	});
	process.send({ kind : 1});
};
platform_atom_ParentProcess.keep_alive = function() {
	if(platform_atom_ParentProcess.is_kept_alive) return;
	console.log(platform_atom_Log.format("Keep child process alive."));
	platform_atom_ParentProcess.keep_alive_timer = new haxe_Timer(1000);
	platform_atom_ParentProcess.keep_alive_timer.run = function() {
		if(!process.connected) {
			platform_atom_ParentProcess.is_kept_alive = false;
			process.exit(ChildProcessExitCode.EXIT_ORPHAN);
		}
	};
	platform_atom_ParentProcess.is_kept_alive = true;
};
var promhx_base_AsyncBase = function(d) {
	this.id = promhx_base_AsyncBase.id_ctr += 1;
	this._resolved = false;
	this._pending = false;
	this._errorPending = false;
	this._fulfilled = false;
	this._update = [];
	this._error = [];
	this._errored = false;
	if(d != null) promhx_base_AsyncBase.link(d,this,function(x) {
		return x;
	});
};
$hxClasses["promhx.base.AsyncBase"] = promhx_base_AsyncBase;
promhx_base_AsyncBase.__name__ = ["promhx","base","AsyncBase"];
promhx_base_AsyncBase.link = function(current,next,f) {
	current._update.push({ async : next, linkf : function(x) {
		next.handleResolve(f(x));
	}});
	promhx_base_AsyncBase.immediateLinkUpdate(current,next,f);
};
promhx_base_AsyncBase.immediateLinkUpdate = function(current,next,f) {
	if(current._errored && !current._errorPending && !(current._error.length > 0)) next.handleError(current._errorVal);
	if(current._resolved && !current._pending) try {
		next.handleResolve(f(current._val));
	} catch( e ) {
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		next.handleError(e);
	}
};
promhx_base_AsyncBase.linkAll = function(all,next) {
	var cthen = function(arr,current,v) {
		if(arr.length == 0 || promhx_base_AsyncBase.allFulfilled(arr)) {
			var vals;
			var _g = [];
			var $it0 = $iterator(all)();
			while( $it0.hasNext() ) {
				var a = $it0.next();
				_g.push(a == current?v:a._val);
			}
			vals = _g;
			next.handleResolve(vals);
		}
		null;
		return;
	};
	var $it1 = $iterator(all)();
	while( $it1.hasNext() ) {
		var a1 = $it1.next();
		a1._update.push({ async : next, linkf : (function(f,a11,a2) {
			return function(v1) {
				f(a11,a2,v1);
				return;
			};
		})(cthen,(function($this) {
			var $r;
			var _g1 = [];
			var $it2 = $iterator(all)();
			while( $it2.hasNext() ) {
				var a21 = $it2.next();
				if(a21 != a1) _g1.push(a21);
			}
			$r = _g1;
			return $r;
		}(this)),a1)});
	}
	if(promhx_base_AsyncBase.allFulfilled(all)) next.handleResolve((function($this) {
		var $r;
		var _g2 = [];
		var $it3 = $iterator(all)();
		while( $it3.hasNext() ) {
			var a3 = $it3.next();
			_g2.push(a3._val);
		}
		$r = _g2;
		return $r;
	}(this)));
};
promhx_base_AsyncBase.pipeLink = function(current,ret,f) {
	var linked = false;
	var linkf = function(x) {
		if(!linked) {
			linked = true;
			var pipe_ret = f(x);
			pipe_ret._update.push({ async : ret, linkf : $bind(ret,ret.handleResolve)});
			promhx_base_AsyncBase.immediateLinkUpdate(pipe_ret,ret,function(x1) {
				return x1;
			});
		}
	};
	current._update.push({ async : ret, linkf : linkf});
	if(current._resolved && !current._pending) try {
		linkf(current._val);
	} catch( e ) {
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		ret.handleError(e);
	}
};
promhx_base_AsyncBase.allResolved = function($as) {
	var $it0 = $iterator($as)();
	while( $it0.hasNext() ) {
		var a = $it0.next();
		if(!a._resolved) return false;
	}
	return true;
};
promhx_base_AsyncBase.allFulfilled = function($as) {
	var $it0 = $iterator($as)();
	while( $it0.hasNext() ) {
		var a = $it0.next();
		if(!a._fulfilled) return false;
	}
	return true;
};
promhx_base_AsyncBase.prototype = {
	catchError: function(f) {
		this._error.push(f);
		return this;
	}
	,errorThen: function(f) {
		this._errorMap = f;
		return this;
	}
	,isResolved: function() {
		return this._resolved;
	}
	,isErrored: function() {
		return this._errored;
	}
	,isErrorHandled: function() {
		return this._error.length > 0;
	}
	,isErrorPending: function() {
		return this._errorPending;
	}
	,isFulfilled: function() {
		return this._fulfilled;
	}
	,isPending: function() {
		return this._pending;
	}
	,handleResolve: function(val) {
		this._resolve(val);
	}
	,_resolve: function(val) {
		var _g = this;
		if(this._pending) promhx_base_EventLoop.enqueue((function(f,a1) {
			return function() {
				f(a1);
			};
		})($bind(this,this._resolve),val)); else {
			this._resolved = true;
			this._pending = true;
			promhx_base_EventLoop.queue.add(function() {
				_g._val = val;
				var _g1 = 0;
				var _g2 = _g._update;
				while(_g1 < _g2.length) {
					var up = _g2[_g1];
					++_g1;
					try {
						up.linkf(val);
					} catch( e ) {
						if (e instanceof js__$Boot_HaxeError) e = e.val;
						up.async.handleError(e);
					}
				}
				_g._fulfilled = true;
				_g._pending = false;
			});
			promhx_base_EventLoop.continueOnNextLoop();
		}
	}
	,handleError: function(error) {
		this._handleError(error);
	}
	,_handleError: function(error) {
		var _g = this;
		var update_errors = function(e) {
			if(_g._error.length > 0) {
				var _g1 = 0;
				var _g2 = _g._error;
				while(_g1 < _g2.length) {
					var ef = _g2[_g1];
					++_g1;
					ef(e);
				}
			} else if(_g._update.length > 0) {
				var _g11 = 0;
				var _g21 = _g._update;
				while(_g11 < _g21.length) {
					var up = _g21[_g11];
					++_g11;
					up.async.handleError(e);
				}
			} else {
				console.log("Call Stack: " + haxe_CallStack.toString(haxe_CallStack.callStack()));
				throw new js__$Boot_HaxeError(e);
			}
			_g._errorPending = false;
		};
		if(!this._errorPending) {
			this._errorPending = true;
			this._errored = true;
			this._errorVal = error;
			promhx_base_EventLoop.queue.add(function() {
				if(_g._errorMap != null) try {
					_g._resolve(_g._errorMap(error));
				} catch( e1 ) {
					if (e1 instanceof js__$Boot_HaxeError) e1 = e1.val;
					update_errors(e1);
				} else update_errors(error);
			});
			promhx_base_EventLoop.continueOnNextLoop();
		}
	}
	,then: function(f) {
		var ret = new promhx_base_AsyncBase();
		promhx_base_AsyncBase.link(this,ret,f);
		return ret;
	}
	,unlink: function(to) {
		var _g = this;
		promhx_base_EventLoop.queue.add(function() {
			_g._update = _g._update.filter(function(x) {
				return x.async != to;
			});
		});
		promhx_base_EventLoop.continueOnNextLoop();
	}
	,isLinked: function(to) {
		var updated = false;
		var _g = 0;
		var _g1 = this._update;
		while(_g < _g1.length) {
			var u = _g1[_g];
			++_g;
			if(u.async == to) return true;
		}
		return updated;
	}
	,__class__: promhx_base_AsyncBase
};
var promhx_Deferred = $hx_exports.promhx.Deferred = function() {
	promhx_base_AsyncBase.call(this);
};
$hxClasses["promhx.Deferred"] = promhx_Deferred;
promhx_Deferred.__name__ = ["promhx","Deferred"];
promhx_Deferred.__super__ = promhx_base_AsyncBase;
promhx_Deferred.prototype = $extend(promhx_base_AsyncBase.prototype,{
	resolve: function(val) {
		this.handleResolve(val);
	}
	,throwError: function(e) {
		this.handleError(e);
	}
	,promise: function() {
		return new promhx_Promise(this);
	}
	,stream: function() {
		return new promhx_Stream(this);
	}
	,publicStream: function() {
		return new promhx_PublicStream(this);
	}
	,__class__: promhx_Deferred
});
var promhx_Promise = $hx_exports.promhx.Promise = function(d) {
	promhx_base_AsyncBase.call(this,d);
	this._rejected = false;
};
$hxClasses["promhx.Promise"] = promhx_Promise;
promhx_Promise.__name__ = ["promhx","Promise"];
promhx_Promise.whenAll = function(itb) {
	var ret = new promhx_Promise();
	promhx_base_AsyncBase.linkAll(itb,ret);
	return ret;
};
promhx_Promise.promise = function(_val) {
	var ret = new promhx_Promise();
	ret.handleResolve(_val);
	return ret;
};
promhx_Promise.__super__ = promhx_base_AsyncBase;
promhx_Promise.prototype = $extend(promhx_base_AsyncBase.prototype,{
	isRejected: function() {
		return this._rejected;
	}
	,reject: function(e) {
		this._rejected = true;
		this.handleError(e);
	}
	,handleResolve: function(val) {
		if(this._resolved) {
			var msg = "Promise has already been resolved";
			throw new js__$Boot_HaxeError(promhx_error_PromiseError.AlreadyResolved(msg));
		}
		this._resolve(val);
	}
	,then: function(f) {
		var ret = new promhx_Promise();
		promhx_base_AsyncBase.link(this,ret,f);
		return ret;
	}
	,unlink: function(to) {
		var _g = this;
		promhx_base_EventLoop.queue.add(function() {
			if(!_g._fulfilled) {
				var msg = "Downstream Promise is not fullfilled";
				_g.handleError(promhx_error_PromiseError.DownstreamNotFullfilled(msg));
			} else _g._update = _g._update.filter(function(x) {
				return x.async != to;
			});
		});
		promhx_base_EventLoop.continueOnNextLoop();
	}
	,handleError: function(error) {
		this._rejected = true;
		this._handleError(error);
	}
	,pipe: function(f) {
		var ret = new promhx_Promise();
		promhx_base_AsyncBase.pipeLink(this,ret,f);
		return ret;
	}
	,errorPipe: function(f) {
		var ret = new promhx_Promise();
		this.catchError(function(e) {
			var piped = f(e);
			piped.then($bind(ret,ret._resolve));
		});
		this.then($bind(ret,ret._resolve));
		return ret;
	}
	,__class__: promhx_Promise
});
var promhx_Stream = $hx_exports.promhx.Stream = function(d) {
	promhx_base_AsyncBase.call(this,d);
	this._end_deferred = new promhx_Deferred();
	this._end_promise = this._end_deferred.promise();
};
$hxClasses["promhx.Stream"] = promhx_Stream;
promhx_Stream.__name__ = ["promhx","Stream"];
promhx_Stream.foreach = function(itb) {
	var s = new promhx_Stream();
	var $it0 = $iterator(itb)();
	while( $it0.hasNext() ) {
		var i = $it0.next();
		s.handleResolve(i);
	}
	s.end();
	return s;
};
promhx_Stream.wheneverAll = function(itb) {
	var ret = new promhx_Stream();
	promhx_base_AsyncBase.linkAll(itb,ret);
	return ret;
};
promhx_Stream.concatAll = function(itb) {
	var ret = new promhx_Stream();
	var $it0 = $iterator(itb)();
	while( $it0.hasNext() ) {
		var i = $it0.next();
		ret.concat(i);
	}
	return ret;
};
promhx_Stream.mergeAll = function(itb) {
	var ret = new promhx_Stream();
	var $it0 = $iterator(itb)();
	while( $it0.hasNext() ) {
		var i = $it0.next();
		ret.merge(i);
	}
	return ret;
};
promhx_Stream.stream = function(_val) {
	var ret = new promhx_Stream();
	ret.handleResolve(_val);
	return ret;
};
promhx_Stream.__super__ = promhx_base_AsyncBase;
promhx_Stream.prototype = $extend(promhx_base_AsyncBase.prototype,{
	then: function(f) {
		var ret = new promhx_Stream();
		promhx_base_AsyncBase.link(this,ret,f);
		this._end_promise.then(function(x) {
			ret.end();
		});
		return ret;
	}
	,detachStream: function(str) {
		var filtered = [];
		var removed = false;
		var _g = 0;
		var _g1 = this._update;
		while(_g < _g1.length) {
			var u = _g1[_g];
			++_g;
			if(u.async == str) removed = true; else filtered.push(u);
		}
		this._update = filtered;
		return removed;
	}
	,first: function() {
		var s = new promhx_Promise();
		this.then(function(x) {
			if(!s._resolved) s.handleResolve(x);
		});
		return s;
	}
	,handleResolve: function(val) {
		if(!this._end && !this._pause) this._resolve(val);
	}
	,pause: function(set) {
		if(set == null) set = !this._pause;
		this._pause = set;
	}
	,pipe: function(f) {
		var ret = new promhx_Stream();
		promhx_base_AsyncBase.pipeLink(this,ret,f);
		this._end_promise.then(function(x) {
			ret.end();
		});
		return ret;
	}
	,errorPipe: function(f) {
		var ret = new promhx_Stream();
		this.catchError(function(e) {
			var piped = f(e);
			piped.then($bind(ret,ret._resolve));
			piped._end_promise.then(($_=ret._end_promise,$bind($_,$_._resolve)));
		});
		this.then($bind(ret,ret._resolve));
		this._end_promise.then(function(x) {
			ret.end();
		});
		return ret;
	}
	,handleEnd: function() {
		if(this._pending) {
			promhx_base_EventLoop.queue.add($bind(this,this.handleEnd));
			promhx_base_EventLoop.continueOnNextLoop();
		} else if(this._end_promise._resolved) return; else {
			this._end = true;
			var o;
			if(this._resolved) o = haxe_ds_Option.Some(this._val); else o = haxe_ds_Option.None;
			this._end_promise.handleResolve(o);
			this._update = [];
			this._error = [];
		}
	}
	,end: function() {
		promhx_base_EventLoop.queue.add($bind(this,this.handleEnd));
		promhx_base_EventLoop.continueOnNextLoop();
		return this;
	}
	,endThen: function(f) {
		return this._end_promise.then(f);
	}
	,filter: function(f) {
		var ret = new promhx_Stream();
		this._update.push({ async : ret, linkf : function(x) {
			if(f(x)) ret.handleResolve(x);
		}});
		promhx_base_AsyncBase.immediateLinkUpdate(this,ret,function(x1) {
			return x1;
		});
		return ret;
	}
	,concat: function(s) {
		var ret = new promhx_Stream();
		this._update.push({ async : ret, linkf : $bind(ret,ret.handleResolve)});
		promhx_base_AsyncBase.immediateLinkUpdate(this,ret,function(x) {
			return x;
		});
		this._end_promise.then(function(_) {
			s.pipe(function(x1) {
				ret.handleResolve(x1);
				return ret;
			});
			s._end_promise.then(function(_1) {
				ret.end();
			});
		});
		return ret;
	}
	,merge: function(s) {
		var ret = new promhx_Stream();
		this._update.push({ async : ret, linkf : $bind(ret,ret.handleResolve)});
		s._update.push({ async : ret, linkf : $bind(ret,ret.handleResolve)});
		promhx_base_AsyncBase.immediateLinkUpdate(this,ret,function(x) {
			return x;
		});
		promhx_base_AsyncBase.immediateLinkUpdate(s,ret,function(x1) {
			return x1;
		});
		return ret;
	}
	,__class__: promhx_Stream
});
var promhx_PublicStream = $hx_exports.promhx.PublicStream = function(def) {
	promhx_Stream.call(this,def);
};
$hxClasses["promhx.PublicStream"] = promhx_PublicStream;
promhx_PublicStream.__name__ = ["promhx","PublicStream"];
promhx_PublicStream.publicstream = function(val) {
	var ps = new promhx_PublicStream();
	ps.handleResolve(val);
	return ps;
};
promhx_PublicStream.__super__ = promhx_Stream;
promhx_PublicStream.prototype = $extend(promhx_Stream.prototype,{
	resolve: function(val) {
		this.handleResolve(val);
	}
	,throwError: function(e) {
		this.handleError(e);
	}
	,update: function(val) {
		this.handleResolve(val);
	}
	,__class__: promhx_PublicStream
});
var promhx_base_EventLoop = function() { };
$hxClasses["promhx.base.EventLoop"] = promhx_base_EventLoop;
promhx_base_EventLoop.__name__ = ["promhx","base","EventLoop"];
promhx_base_EventLoop.enqueue = function(eqf) {
	promhx_base_EventLoop.queue.add(eqf);
	promhx_base_EventLoop.continueOnNextLoop();
};
promhx_base_EventLoop.set_nextLoop = function(f) {
	if(promhx_base_EventLoop.nextLoop != null) throw new js__$Boot_HaxeError("nextLoop has already been set"); else promhx_base_EventLoop.nextLoop = f;
	return promhx_base_EventLoop.nextLoop;
};
promhx_base_EventLoop.queueEmpty = function() {
	return promhx_base_EventLoop.queue.isEmpty();
};
promhx_base_EventLoop.finish = function(max_iterations) {
	if(max_iterations == null) max_iterations = 1000;
	var fn = null;
	while(max_iterations-- > 0 && (fn = promhx_base_EventLoop.queue.pop()) != null) fn();
	return promhx_base_EventLoop.queue.isEmpty();
};
promhx_base_EventLoop.clear = function() {
	promhx_base_EventLoop.queue = new List();
};
promhx_base_EventLoop.f = function() {
	var fn = promhx_base_EventLoop.queue.pop();
	if(fn != null) fn();
	if(!promhx_base_EventLoop.queue.isEmpty()) promhx_base_EventLoop.continueOnNextLoop();
};
promhx_base_EventLoop.continueOnNextLoop = function() {
	if(promhx_base_EventLoop.nextLoop != null) promhx_base_EventLoop.nextLoop(promhx_base_EventLoop.f); else setImmediate(promhx_base_EventLoop.f);
};
var promhx_error_PromiseError = $hxClasses["promhx.error.PromiseError"] = { __ename__ : ["promhx","error","PromiseError"], __constructs__ : ["AlreadyResolved","DownstreamNotFullfilled"] };
promhx_error_PromiseError.AlreadyResolved = function(message) { var $x = ["AlreadyResolved",0,message]; $x.__enum__ = promhx_error_PromiseError; $x.toString = $estr; return $x; };
promhx_error_PromiseError.DownstreamNotFullfilled = function(message) { var $x = ["DownstreamNotFullfilled",1,message]; $x.__enum__ = promhx_error_PromiseError; $x.toString = $estr; return $x; };
var utils_CommandValidator = function() { };
$hxClasses["utils.CommandValidator"] = utils_CommandValidator;
utils_CommandValidator.__name__ = ["utils","CommandValidator"];
var utils_HaxeParsingUtils = function() { };
$hxClasses["utils.HaxeParsingUtils"] = utils_HaxeParsingUtils;
utils_HaxeParsingUtils.__name__ = ["utils","HaxeParsingUtils"];
utils_HaxeParsingUtils.parse_composed_type = function(raw_composed_type,ctx) {
	var info = { };
	var len = raw_composed_type.length;
	var current_item = "";
	var items = [];
	var item_params = [];
	var item;
	var c;
	var sub_item;
	var params;
	if(ctx == null) ctx = { i : 0, stop : null};
	while(ctx.i < len) {
		c = raw_composed_type.charAt(ctx.i);
		if(c == "(") {
			ctx.i++;
			if(current_item.length > 0 && current_item.charAt(current_item.length - 1) == ":") {
				item = { name : current_item.substring(0,current_item.length - 1), composed_type : utils_HaxeParsingUtils.parse_composed_type(raw_composed_type,ctx)};
				if(item.name.charAt(0) == "?") {
					item.optional = true;
					item.name = item.name.substring(1);
				}
				items.push(item);
			} else items.push(utils_HaxeParsingUtils.parse_composed_type(raw_composed_type,ctx));
			current_item = "";
		} else if(c == "<") {
			ctx.i++;
			params = [];
			do params.push(utils_HaxeParsingUtils.parse_composed_type(raw_composed_type,ctx)); while(ctx.stop == ",");
			if(current_item.length > 0) {
				item = utils_HaxeParsingUtils.parse_composed_type(current_item);
				item.composed_type = { params : params};
				if(item.type != null) item.composed_type.type = item.type;
				if(item.composed_type != null) item.composed_type.composed_type = item.composed_type;
				items.push(item);
			}
			item_params.push([]);
			current_item = "";
		} else if(c == "{") {
			if(current_item.length > 0 && current_item.charAt(current_item.length - 1) == ":") {
				item = { name : current_item.substring(0,current_item.length - 1), composed_type : utils_HaxeParsingUtils.parse_structure_type(raw_composed_type,ctx)};
				if(item.name.charAt(0) == "?") {
					item.optional = true;
					item.name = item.name.substring(1);
				}
				items.push(item);
			} else items.push(utils_HaxeParsingUtils.parse_structure_type(raw_composed_type,ctx));
			current_item = "";
		} else if(c == ")") {
			ctx.i++;
			ctx.stop = ")";
			break;
		} else if(c == ">") {
			ctx.i++;
			ctx.stop = ">";
			break;
		} else if(c == ",") {
			ctx.i++;
			ctx.stop = ",";
			break;
		} else if(c == "-" && raw_composed_type.charAt(ctx.i + 1) == ">") {
			if(current_item.length > 0) items.push(utils_HaxeParsingUtils.parse_composed_type(current_item));
			current_item = "";
			ctx.i += 2;
		} else if(StringTools.trim(c) == "") ctx.i++; else {
			current_item += c;
			ctx.i++;
		}
	}
	if(ctx.i >= len) ctx.stop = null;
	if(current_item.length > 0) {
		if(current_item.indexOf("->") != -1) items.push(utils_HaxeParsingUtils.parse_composed_type(current_item)); else items.push(utils_HaxeParsingUtils.parse_type(current_item));
	}
	if(items.length > 1) {
		info.args = [].concat(items);
		info.composed_type = info.args.pop();
		if(info.args.length == 1 && info.args[0].type == "Void") info.args = [];
	} else if(items.length == 1) info = items[0];
	return info;
};
utils_HaxeParsingUtils.parse_structure_type = function(raw_structure_type,ctx) {
	var item_b = "";
	var len = raw_structure_type.length;
	var number_of_lts = 0;
	var c;
	if(ctx == null) ctx = { i : 0};
	while(ctx.i < len) {
		c = raw_structure_type.charAt(ctx.i);
		if(c == "{") {
			number_of_lts++;
			ctx.i++;
			if(c == null) item_b += "null"; else item_b += "" + c;
		} else if(c == "}") {
			number_of_lts--;
			ctx.i++;
			if(c == null) item_b += "null"; else item_b += "" + c;
			if(number_of_lts <= 0) break;
		} else if(StringTools.trim(c) == "") ctx.i++; else if(number_of_lts == 0) {
			item_b += "{}";
			break;
		} else {
			if(c == null) item_b += "null"; else item_b += "" + c;
			ctx.i++;
		}
	}
	return { type : item_b};
};
utils_HaxeParsingUtils.parse_type = function(raw_type) {
	var parts = raw_type.split(":");
	var result = { };
	if(parts.length == 2) {
		result.type = parts[1];
		result.name = parts[0];
	} else result.type = parts[0];
	if(result.name != null && result.name.charAt(0) == "?") {
		result.optional = true;
		result.name = result.name.substring(1);
	}
	return result;
};
utils_HaxeParsingUtils.string_from_parsed_type = function(parsed_type) {
	if(parsed_type == null) return "";
	var result;
	if(parsed_type.args != null) {
		var str_args;
		if(parsed_type.args.length > 0) {
			var arg_items = [];
			var str_arg;
			var i = 0;
			while(i < parsed_type.args.length) {
				str_arg = utils_HaxeParsingUtils.string_from_parsed_type(parsed_type.args[i]);
				if(parsed_type.args[i].args != null && parsed_type.args[i].args.length == 1) str_arg = "(" + str_arg + ")";
				arg_items.push(str_arg);
				i++;
			}
			str_args = arg_items.join("->");
		} else str_args = "Void";
		if(parsed_type.composed_type != null) {
			if(parsed_type.composed_type.args != null) result = str_args + "->(" + utils_HaxeParsingUtils.string_from_parsed_type(parsed_type.composed_type) + ")"; else result = str_args + "->" + utils_HaxeParsingUtils.string_from_parsed_type(parsed_type.composed_type) + "";
		} else result = str_args + "->" + parsed_type.type;
	} else if(parsed_type.composed_type != null) result = utils_HaxeParsingUtils.string_from_parsed_type(parsed_type.composed_type); else result = parsed_type.type;
	if(parsed_type.params != null && parsed_type.params.length > 0) {
		var params = [];
		var i1 = 0;
		while(i1 < parsed_type.params.length) {
			params.push(utils_HaxeParsingUtils.string_from_parsed_type(parsed_type.params[i1]));
			i1++;
		}
		result += "<" + params.join(",") + ">";
	}
	return result;
};
utils_HaxeParsingUtils.parse_partial_signature = function(original_text,index,options) {
	var text = utils_HaxeParsingUtils.code_with_empty_comments_and_strings(original_text.substring(0,index));
	if(options == null) options = { };
	var i = index - 1;
	var number_of_args = 0;
	var number_of_parens = 0;
	var number_of_braces = 0;
	var number_of_lts = 0;
	var number_of_brackets = 0;
	var number_of_unclosed_parens = 0;
	var number_of_unclosed_braces = 0;
	var number_of_unclosed_lts = 0;
	var number_of_unclosed_brackets = 0;
	var signature_start = -1;
	var did_extract_used_keys = false;
	var c;
	var arg;
	var partial_arg = null;
	var can_set_colon_index = !options.parse_declaration;
	var colon_index = -1;
	var key_path = [];
	var used_keys = [];
	var partial_key = null;
	while(i > 0) {
		c = text.charAt(i);
		if(c == "\"" || c == "'") while(i >= 0) {
			i--;
			if(text.charAt(i) == c) {
				i--;
				break;
			}
		} else if(c == ",") {
			if(number_of_parens == 0 && number_of_braces == 0 && number_of_lts == 0 && number_of_brackets == 0) {
				can_set_colon_index = false;
				number_of_args++;
				if(partial_arg == null) partial_arg = StringTools.ltrim(original_text.substring(i + 1,index));
			}
			i--;
		} else if(c == ")") {
			number_of_parens++;
			i--;
		} else if(c == "}") {
			number_of_braces++;
			i--;
		} else if(c == "]") {
			number_of_brackets++;
			i--;
		} else if(c == ":") {
			if(can_set_colon_index && number_of_braces == 0 && number_of_parens == 0 && number_of_lts == 0) {
				colon_index = i;
				can_set_colon_index = false;
			}
			i--;
		} else if(c == "{") {
			if(number_of_braces == 0) {
				number_of_args = 0;
				number_of_unclosed_braces++;
				if(!options.parse_declaration) {
					can_set_colon_index = true;
					if(!did_extract_used_keys) {
						used_keys = utils_HaxeParsingUtils.extract_used_keys_in_structure(text.substring(i + 1));
						did_extract_used_keys = true;
					}
					if(colon_index != -1) {
						if(utils_HaxeParsingUtils.REGEX_ENDS_WITH_KEY.match(text.substring(0,colon_index + 1))) key_path.unshift(utils_HaxeParsingUtils.REGEX_ENDS_WITH_KEY.matched(1));
					} else if(key_path.length == 0) {
						if(utils_HaxeParsingUtils.REGEX_ENDS_WITH_ALPHANUMERIC.match(text.substring(0,index))) partial_key = utils_HaxeParsingUtils.REGEX_ENDS_WITH_ALPHANUMERIC.matched(1); else partial_key = "";
					}
				}
			} else number_of_braces--;
			i--;
		} else if(c == "(") {
			if(number_of_parens > 0) {
				number_of_parens--;
				i--;
			} else if(!options.parse_declaration && utils_HaxeParsingUtils.REGEX_ENDS_WITH_BEFORE_CALL_CHAR.match(text.substring(0,i)) || options.parse_declaration && utils_HaxeParsingUtils.REGEX_ENDS_WITH_BEFORE_SIGNATURE_CHAR.match(text.substring(0,i))) {
				if(utils_HaxeParsingUtils.REGEX_ENDS_WITH_FUNCTION_DEF.match(text.substring(0,i))) {
					if(!options.parse_declaration) return null;
				} else if(options.parse_declaration) return null;
				number_of_args++;
				signature_start = i;
				if(partial_arg == null) partial_arg = StringTools.ltrim(original_text.substring(i + 1,index));
				break;
			} else {
				number_of_args = 0;
				if(!options.parse_declaration) {
					can_set_colon_index = true;
					colon_index = -1;
				}
				number_of_unclosed_parens++;
				i--;
			}
		} else if(number_of_parens == 0 && c == ">" && text.charAt(i - 1) != "-") {
			number_of_lts++;
			i--;
		} else if(number_of_parens == 0 && c == "<") {
			if(number_of_lts > 0) number_of_lts--; else {
				number_of_args = 0;
				can_set_colon_index = true;
				colon_index = -1;
				number_of_unclosed_lts++;
			}
			i--;
		} else if(c == "[") {
			if(number_of_brackets > 0) number_of_brackets--; else {
				number_of_args = 0;
				can_set_colon_index = true;
				colon_index = -1;
				number_of_unclosed_brackets++;
			}
			i--;
		} else i--;
	}
	if(signature_start == -1) return null;
	var result = { signature_start : signature_start, number_of_args : number_of_args};
	if(!options.parse_declaration && number_of_unclosed_braces > 0) {
		result.key_path = key_path;
		result.partial_key = partial_key;
		result.used_keys = used_keys;
	}
	if(partial_arg != null && partial_arg.length > 0 && StringTools.trim(partial_arg).length == partial_arg.length) result.partial_arg = partial_arg;
	return result;
};
utils_HaxeParsingUtils.code_with_empty_comments_and_strings = function(input) {
	var i = 0;
	var output = "";
	var len = input.length;
	var is_in_single_line_comment = false;
	var is_in_multiline_comment = false;
	var k;
	while(i < len) if(is_in_single_line_comment) {
		if(input.charAt(i) == "\n") {
			is_in_single_line_comment = false;
			output += "\n";
		} else output += " ";
		i++;
	} else if(is_in_multiline_comment) {
		if(HxOverrides.substr(input,i,2) == "*/") {
			is_in_multiline_comment = false;
			output += "  ";
			i += 2;
		} else {
			if(input.charAt(i) == "\n") output += "\n"; else output += " ";
			i++;
		}
	} else if(HxOverrides.substr(input,i,2) == "//") {
		is_in_single_line_comment = true;
		output += "  ";
		i += 2;
	} else if(HxOverrides.substr(input,i,2) == "/*") {
		is_in_multiline_comment = true;
		output += "  ";
		i += 2;
	} else if(input.charAt(i) == "'" || input.charAt(i) == "\"") {
		if(utils_HaxeParsingUtils.REGEX_BEGINS_WITH_STRING.match(input.substring(i))) {
			var match_len = utils_HaxeParsingUtils.REGEX_BEGINS_WITH_STRING.matched(0).length;
			output += "\"";
			k = 0;
			while(k < match_len - 2) {
				output += " ";
				k++;
			}
			output += "\"";
			i += match_len;
		} else while(i < len) {
			output += " ";
			i++;
		}
	} else {
		output += input.charAt(i);
		i++;
	}
	return output;
};
utils_HaxeParsingUtils.extract_used_keys_in_structure = function(cleaned_text) {
	var i = 0;
	var len = cleaned_text.length;
	var number_of_braces = 0;
	var number_of_parens = 0;
	var number_of_lts = 0;
	var number_of_brackets = 0;
	var c;
	var used_keys = [];
	while(i < len) {
		c = cleaned_text.charAt(i);
		if(c == "{") {
			number_of_braces++;
			i++;
		} else if(c == "}") {
			number_of_braces--;
			i++;
		} else if(c == "(") {
			number_of_parens++;
			i++;
		} else if(c == ")") {
			number_of_parens--;
			i++;
		} else if(c == "[") {
			number_of_brackets++;
			i++;
		} else if(c == "]") {
			number_of_brackets--;
			i++;
		} else if(c == "<") {
			number_of_lts++;
			i++;
		} else if(c == ">" && cleaned_text.charAt(i - 1) != "-") {
			number_of_lts--;
			i++;
		} else if(number_of_braces == 0 && number_of_parens == 0 && number_of_lts == 0 && number_of_brackets == 0) {
			if(utils_HaxeParsingUtils.REGEX_BEGINS_WITH_KEY.match(cleaned_text.substring(i))) {
				i += utils_HaxeParsingUtils.REGEX_BEGINS_WITH_KEY.matched(0).length;
				used_keys.push(utils_HaxeParsingUtils.REGEX_BEGINS_WITH_KEY.matched(0));
			} else i++;
		} else i++;
	}
	return used_keys;
};
var utils_HtmlEscape = function() { };
$hxClasses["utils.HtmlEscape"] = utils_HtmlEscape;
utils_HtmlEscape.__name__ = ["utils","HtmlEscape"];
utils_HtmlEscape.escape = function(input) {
	return StringTools.replace(StringTools.replace(StringTools.replace(StringTools.replace(StringTools.replace(input,"&","&amp;"),"\"","&quot;"),"'","&#39;"),"<","&lt;"),">","&gt;");
};
var utils_HxmlUtils = function() { };
$hxClasses["utils.HxmlUtils"] = utils_HxmlUtils;
utils_HxmlUtils.__name__ = ["utils","HxmlUtils"];
utils_HxmlUtils.parse_hxml_args = function(raw_hxml) {
	var args = [];
	var i = 0;
	var len = raw_hxml.length;
	var current_arg = "";
	var prev_arg = null;
	var number_of_parens = 0;
	var c;
	var m0;
	while(i < len) {
		c = raw_hxml.charAt(i);
		if(c == "(") {
			if(prev_arg == "--macro") number_of_parens++;
			current_arg += c;
			i++;
		} else if(number_of_parens > 0 && c == ")") {
			number_of_parens--;
			current_arg += c;
			i++;
		} else if(c == "\"" || c == "'") {
			if(utils_HxmlUtils.REGEX_BEGINS_WITH_STRING.match(HxOverrides.substr(raw_hxml,i,null))) {
				m0 = utils_HxmlUtils.REGEX_BEGINS_WITH_STRING.matched(0);
				current_arg += m0;
				i += m0.length;
			} else {
				current_arg += c;
				i++;
			}
		} else if(StringTools.trim(c) == "") {
			if(number_of_parens == 0) {
				if(current_arg.length > 0) {
					prev_arg = current_arg;
					current_arg = "";
					args.push(prev_arg);
				}
			} else current_arg += c;
			i++;
		} else {
			current_arg += c;
			i++;
		}
	}
	if(current_arg.length > 0) args.push(current_arg);
	return args;
};
var utils_Promise = function(executor) {
	if(executor == null) return;
	this._deferred = new promhx_Deferred();
	this._promise = new promhx_Promise(this._deferred);
	executor(($_=this._deferred,$bind($_,$_.resolve)),($_=this._promise,$bind($_,$_.reject)));
};
$hxClasses["utils.Promise"] = utils_Promise;
utils_Promise.__name__ = ["utils","Promise"];
utils_Promise.reject = function(reason) {
	return new utils_Promise(function(ok,no) {
		no(reason);
	});
};
utils_Promise.resolve = function(val) {
	return new utils_Promise(function(ok,no) {
		ok(val);
	});
};
utils_Promise.all = function(list) {
	return new utils_Promise(function(ok,no) {
		var current = 0;
		var total = list.length;
		var fulfill_result = [];
		var reject_result = null;
		var all_state = 0;
		var single_ok = function(index,val) {
			if(all_state != 0) return;
			current++;
			fulfill_result[index] = val;
			if(total == current) {
				all_state = 1;
				ok(fulfill_result);
			}
		};
		var single_err = function(val1) {
			if(all_state != 0) return;
			all_state = 2;
			reject_result = val1;
			no(reject_result);
		};
		var index1 = 0;
		var _g = 0;
		while(_g < list.length) {
			var promise = list[_g];
			++_g;
			promise.then((function(f,a1) {
				return function(a2) {
					f(a1,a2);
				};
			})(single_ok,index1)).error(single_err);
			index1++;
		}
	});
};
utils_Promise.race = function(list) {
	return new utils_Promise(function(ok,no) {
		var settled = false;
		var single_ok = function(val) {
			if(settled) return;
			settled = true;
			ok(val);
		};
		var single_err = function(val1) {
			if(settled) return;
			settled = true;
			no(val1);
		};
		var _g = 0;
		while(_g < list.length) {
			var promise = list[_g];
			++_g;
			promise.then(single_ok).error(single_err);
		}
	});
};
utils_Promise.prototype = {
	get_length: function() {
		return 1;
	}
	,error: function(on_rejected) {
		this._promise.catchError(on_rejected);
		return this;
	}
	,then: function(on_fulfilled,on_rejected) {
		if(on_fulfilled == null) on_fulfilled = function(val) {
			return null;
		};
		var prom = this._promise.then(on_fulfilled);
		if(on_rejected != null) this._promise.catchError(on_rejected);
		var ret = new utils_Promise(null);
		ret._promise = prom;
		return ret;
	}
	,__class__: utils_Promise
};
var utils_Worker = function(options) {
	this.awaiting_command_callbacks = new haxe_ds_IntMap();
	this.id = utils_Worker.next_worker_id++;
	this.process_kind = options.process_kind;
	utils_Worker.workers_by_id.h[this.id] = this;
	if(this.process_kind != 0) {
		if(options.current_worker != null) this.main_worker = options.current_worker; else throw new js__$Boot_HaxeError("Option `current_worker` is required on workers of kind CHILD or PARENT");
	} else if(options.current_worker != null) throw new js__$Boot_HaxeError("Option `current_worker` is forbidden on worker of kind CURRENT");
	if(this.process_kind == 1) {
		this.child_process = new platform_atom_ChildProcess();
		this.child_process.on_message($bind(this,this.on_process_message));
	} else if(this.process_kind == 2) platform_atom_ParentProcess.on_message($bind(this,this.on_process_message));
};
$hxClasses["utils.Worker"] = utils_Worker;
utils_Worker.__name__ = ["utils","Worker"];
utils_Worker.prototype = {
	get_id: function() {
		return this.id;
	}
	,get_process_kind: function() {
		return this.process_kind;
	}
	,run_command: function(command) {
		var _g = this;
		return new utils_Promise(function(resolve,reject) {
			if(_g.process_kind == 1) {
				_g.await_command_response(command.get_id(),resolve,reject);
				var serializer = new haxe_Serializer();
				serializer.serialize(2);
				serializer.serialize(command);
				_g.child_process.post_message(serializer.toString());
			} else if(_g.process_kind == 2) {
				_g.await_command_response(command.get_id(),resolve,reject);
				var serializer1 = new haxe_Serializer();
				serializer1.serialize(2);
				serializer1.serialize(command);
				platform_atom_ParentProcess.post_message(serializer1.toString());
			} else command.internal_execute(resolve,reject);
		});
	}
	,destroy: function() {
		if(this.child_process != null) {
			this.child_process.kill();
			this.child_process = null;
		}
	}
	,await_command_response: function(command_id,resolve,reject) {
		this.awaiting_command_callbacks.h[command_id] = { resolve : resolve, reject : reject};
	}
	,on_process_message: function(message) {
		var _g = this;
		var unserializer = new haxe_Unserializer(message);
		var message_kind = unserializer.unserialize();
		if(message_kind == 2) {
			var command = unserializer.unserialize();
			this.main_worker.run_command(command).then(function(result) {
				var serializer = new haxe_Serializer();
				serializer.serialize(0);
				serializer.serialize(command);
				if(_g.process_kind == 2) platform_atom_ParentProcess.post_message(serializer.toString()); else if(_g.process_kind == 1) _g.child_process.post_message(serializer.toString());
			}).error(function(error) {
				var serializer1 = new haxe_Serializer();
				serializer1.serialize(1);
				serializer1.serialize(command);
				serializer1.serialize(error);
				if(_g.process_kind == 2) platform_atom_ParentProcess.post_message(serializer1.toString()); else if(_g.process_kind == 1) _g.child_process.post_message(serializer1.toString());
			});
		} else if(message_kind == 0) {
			var command1 = unserializer.unserialize();
			if(!this.awaiting_command_callbacks.h.hasOwnProperty(command1.id)) throw new js__$Boot_HaxeError("Cannot resolve command " + Std.string(command1) + " because it is not running.");
			var callbacks = this.awaiting_command_callbacks.h[command1.id];
			this.awaiting_command_callbacks.remove(command1.id);
			callbacks.resolve(command1);
		} else if(message_kind == 1) {
			var command2 = unserializer.unserialize();
			if(!this.awaiting_command_callbacks.h.hasOwnProperty(command2.id)) throw new js__$Boot_HaxeError("Cannot reject command " + Std.string(command2) + " because it is not running.");
			var callbacks1 = this.awaiting_command_callbacks.h[command2.id];
			this.awaiting_command_callbacks.remove(command2.id);
			var error1 = unserializer.unserialize();
			callbacks1.reject(error1);
		}
	}
	,__class__: utils_Worker
};
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; }
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
if(Array.prototype.indexOf) HxOverrides.indexOf = function(a,o,i) {
	return Array.prototype.indexOf.call(a,o,i);
};
$hxClasses.Math = Math;
String.prototype.__class__ = $hxClasses.String = String;
String.__name__ = ["String"];
$hxClasses.Array = Array;
Array.__name__ = ["Array"];
Date.prototype.__class__ = $hxClasses.Date = Date;
Date.__name__ = ["Date"];
var Int = $hxClasses.Int = { __name__ : ["Int"]};
var Dynamic = $hxClasses.Dynamic = { __name__ : ["Dynamic"]};
var Float = $hxClasses.Float = Number;
Float.__name__ = ["Float"];
var Bool = $hxClasses.Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = $hxClasses.Class = { __name__ : ["Class"]};
var Enum = { };
if(Array.prototype.filter == null) Array.prototype.filter = function(f1) {
	var a1 = [];
	var _g11 = 0;
	var _g2 = this.length;
	while(_g11 < _g2) {
		var i1 = _g11++;
		var e = this[i1];
		if(f1(e)) a1.push(e);
	}
	return a1;
};
var __map_reserved = {}
var ArrayBuffer = $global.ArrayBuffer || js_html_compat_ArrayBuffer;
if(ArrayBuffer.prototype.slice == null) ArrayBuffer.prototype.slice = js_html_compat_ArrayBuffer.sliceImpl;
var DataView = $global.DataView || js_html_compat_DataView;
var Uint8Array = $global.Uint8Array || js_html_compat_Uint8Array._new;
utils_Command.next_id = 0;
haxe_Serializer.USE_CACHE = false;
haxe_Serializer.USE_ENUM_INDEX = false;
haxe_Serializer.BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%:";
haxe_Unserializer.DEFAULT_RESOLVER = Type;
haxe_Unserializer.BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%:";
haxe_ds_ObjectMap.count = 0;
haxe_io_FPHelper.i64tmp = (function($this) {
	var $r;
	var x = new haxe__$Int64__$_$_$Int64(0,0);
	$r = x;
	return $r;
}(this));
js_Boot.__toStr = {}.toString;
js_html_compat_Uint8Array.BYTES_PER_ELEMENT = 1;
platform_atom_ParentProcess.is_kept_alive = false;
platform_atom_ParentProcess.message_handlers = [];
promhx_base_AsyncBase.id_ctr = 0;
promhx_base_EventLoop.queue = new List();
utils_HaxeParsingUtils.REGEX_BEGINS_WITH_STRING = new EReg("^(?:\"(?:[^\"\\\\]*(?:\\\\.[^\"\\\\]*)*)\"|'(?:[^']*(?:''[^']*)*)')","");
utils_HaxeParsingUtils.REGEX_ENDS_WITH_BEFORE_CALL_CHAR = new EReg("[a-zA-Z0-9_\\]\\)]\\s*$","");
utils_HaxeParsingUtils.REGEX_ENDS_WITH_BEFORE_SIGNATURE_CHAR = new EReg("[a-zA-Z0-9_>]\\s*$","");
utils_HaxeParsingUtils.REGEX_ENDS_WITH_KEY = new EReg("([a-zA-Z0-9_]+)\\s*:$","");
utils_HaxeParsingUtils.REGEX_ENDS_WITH_ALPHANUMERIC = new EReg("([a-zA-Z0-9_]+)$","");
utils_HaxeParsingUtils.REGEX_BEGINS_WITH_KEY = new EReg("^([a-zA-Z0-9_]+)\\s*:","");
utils_HaxeParsingUtils.REGEX_PACKAGE = new EReg("^package\\s*([a-zA-Z0-9_]*(\\.[a-zA-Z0-9_]+)*)","");
utils_HaxeParsingUtils.REGEX_ENDS_WITH_FUNCTION_DEF = new EReg("[^a-zA-Z0-9_]function(?:\\s+[a-zA-Z0-9_]+)?(?:<[a-zA-Z0-9_<>, ]+>)?$","");
utils_HaxeParsingUtils.REGEX_IMPORT = new EReg("import\\s*([a-zA-Z0-9_]+(?:\\.[a-zA-Z0-9_]+)*)(?:\\s+(?:in|as)\\s+([a-zA-Z0-9_]+))?","g");
utils_HxmlUtils.REGEX_BEGINS_WITH_STRING = new EReg("^(?:\"(?:[^\"\\\\]*(?:\\\\.[^\"\\\\]*)*)\"|'(?:[^']*(?:''[^']*)*)')","");
utils_Worker.workers_by_id = new haxe_ds_IntMap();
utils_Worker.next_worker_id = 0;
HaxeDevMain.main();
})(typeof console != "undefined" ? console : {log:function(){}}, typeof window != "undefined" ? window : exports, typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : this);

//# sourceMappingURL=haxe-dev-main.js.map