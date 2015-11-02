(function (console) { "use strict";
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
};
var HaxeDev = function() { };
HaxeDev.main = function() {
	module.exports = HaxeDev;
};
HaxeDev.activate = function(state) {
	HaxeDev.subscriptions = new atom_CompositeDisposable();
	HaxeDev.subscriptions.add(atom.commands.add("atom-workspace",{ 'haxe-dev:toggle' : HaxeDev.toggle}));
};
HaxeDev.deactivate = function(state) {
	HaxeDev.modalPanel.destroy();
	HaxeDev.subscriptions.dispose();
};
HaxeDev.serialize = function() {
	return { };
};
HaxeDev.toggle = function() {
	window.console.log("HaxeDev was toggled!");
	if(HaxeDev.modalPanel.isVisible()) HaxeDev.modalPanel.hide(); else HaxeDev.modalPanel.show();
};
var HxOverrides = function() { };
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
var StringTools = function() { };
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
var atom_CompositeDisposable = require("atom").CompositeDisposable;
var js__$Boot_HaxeError = function(val) {
	Error.call(this);
	this.val = val;
	this.message = String(val);
	if(Error.captureStackTrace) Error.captureStackTrace(this,js__$Boot_HaxeError);
};
js__$Boot_HaxeError.__super__ = Error;
js__$Boot_HaxeError.prototype = $extend(Error.prototype,{
});
var utils_parsing_HaxeParsingUtils = function() { };
utils_parsing_HaxeParsingUtils.parse_composed_type = function(raw_composed_type,ctx) {
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
				item = { name : current_item.substring(0,current_item.length - 1), composed_type : utils_parsing_HaxeParsingUtils.parse_composed_type(raw_composed_type,ctx)};
				if(item.name.charAt(0) == "?") {
					item.optional = true;
					item.name = item.name.substring(1);
				}
				items.push(item);
			} else items.push(utils_parsing_HaxeParsingUtils.parse_composed_type(raw_composed_type,ctx));
			current_item = "";
		} else if(c == "<") {
			ctx.i++;
			params = [];
			do params.push(utils_parsing_HaxeParsingUtils.parse_composed_type(raw_composed_type,ctx)); while(ctx.stop == ",");
			if(current_item.length > 0) {
				item = utils_parsing_HaxeParsingUtils.parse_composed_type(current_item);
				item.composed_type = { params : params};
				if(item.type != null) item.composed_type.type = item.type;
				if(item.composed_type != null) item.composed_type.composed_type = item.composed_type;
				items.push(item);
			}
			item_params.push([]);
			current_item = "";
		} else if(c == "{") {
			if(current_item.length > 0 && current_item.charAt(current_item.length - 1) == ":") {
				item = { name : current_item.substring(0,current_item.length - 1), composed_type : utils_parsing_HaxeParsingUtils.parse_structure_type(raw_composed_type,ctx)};
				if(item.name.charAt(0) == "?") {
					item.optional = true;
					item.name = item.name.substring(1);
				}
				items.push(item);
			} else items.push(utils_parsing_HaxeParsingUtils.parse_structure_type(raw_composed_type,ctx));
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
			if(current_item.length > 0) items.push(utils_parsing_HaxeParsingUtils.parse_composed_type(current_item));
			current_item = "";
			ctx.i += 2;
		} else if(StringTools.trim(c) == "") ctx.i++; else {
			current_item += c;
			ctx.i++;
		}
	}
	if(ctx.i >= len) ctx.stop = null;
	if(current_item.length > 0) {
		if(current_item.indexOf("->") != -1) items.push(utils_parsing_HaxeParsingUtils.parse_composed_type(current_item)); else items.push(utils_parsing_HaxeParsingUtils.parse_type(current_item));
	}
	if(items.length > 1) {
		info.args = [].concat(items);
		info.composed_type = info.args.pop();
		if(info.args.length == 1 && info.args[0].type == "Void") info.args = [];
	} else if(items.length == 1) info = items[0];
	return info;
};
utils_parsing_HaxeParsingUtils.parse_structure_type = function(raw_structure_type,ctx) {
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
utils_parsing_HaxeParsingUtils.parse_type = function(raw_type) {
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
utils_parsing_HaxeParsingUtils.string_from_parsed_type = function(parsed_type) {
	if(parsed_type == null) return "";
	var result;
	if(parsed_type.args != null) {
		var str_args;
		if(parsed_type.args.length > 0) {
			var arg_items = [];
			var str_arg;
			var i = 0;
			while(i < parsed_type.args.length) {
				str_arg = utils_parsing_HaxeParsingUtils.string_from_parsed_type(parsed_type.args[i]);
				if(parsed_type.args[i].args != null && parsed_type.args[i].args.length == 1) str_arg = "(" + str_arg + ")";
				arg_items.push(str_arg);
				i++;
			}
			str_args = arg_items.join("->");
		} else str_args = "Void";
		if(parsed_type.composed_type != null) {
			if(parsed_type.composed_type.args != null) result = str_args + "->(" + utils_parsing_HaxeParsingUtils.string_from_parsed_type(parsed_type.composed_type) + ")"; else result = str_args + "->" + utils_parsing_HaxeParsingUtils.string_from_parsed_type(parsed_type.composed_type) + "";
		} else result = str_args + "->" + parsed_type.type;
	} else if(parsed_type.composed_type != null) result = utils_parsing_HaxeParsingUtils.string_from_parsed_type(parsed_type.composed_type); else result = parsed_type.type;
	if(parsed_type.params != null && parsed_type.params.length > 0) {
		var params = [];
		var i1 = 0;
		while(i1 < parsed_type.params.length) {
			params.push(utils_parsing_HaxeParsingUtils.string_from_parsed_type(parsed_type.params[i1]));
			i1++;
		}
		result += "<" + params.join(",") + ">";
	}
	return result;
};
utils_parsing_HaxeParsingUtils.parse_partial_signature = function(original_text,index,options) {
	var text = utils_parsing_HaxeParsingUtils.code_with_empty_comments_and_strings(original_text.substring(0,index));
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
						used_keys = utils_parsing_HaxeParsingUtils.extract_used_keys_in_structure(text.substring(i + 1));
						did_extract_used_keys = true;
					}
					if(colon_index != -1) {
						if(utils_parsing_HaxeParsingUtils.REGEX_ENDS_WITH_KEY.match(text.substring(0,colon_index + 1))) key_path.unshift(utils_parsing_HaxeParsingUtils.REGEX_ENDS_WITH_KEY.matched(1));
					} else if(key_path.length == 0) {
						if(utils_parsing_HaxeParsingUtils.REGEX_ENDS_WITH_ALPHANUMERIC.match(text.substring(0,index))) partial_key = utils_parsing_HaxeParsingUtils.REGEX_ENDS_WITH_ALPHANUMERIC.matched(1); else partial_key = "";
					}
				}
			} else number_of_braces--;
			i--;
		} else if(c == "(") {
			if(number_of_parens > 0) {
				number_of_parens--;
				i--;
			} else if(!options.parse_declaration && utils_parsing_HaxeParsingUtils.REGEX_ENDS_WITH_BEFORE_CALL_CHAR.match(text.substring(0,i)) || options.parse_declaration && utils_parsing_HaxeParsingUtils.REGEX_ENDS_WITH_BEFORE_SIGNATURE_CHAR.match(text.substring(0,i))) {
				if(utils_parsing_HaxeParsingUtils.REGEX_ENDS_WITH_FUNCTION_DEF.match(text.substring(0,i))) {
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
utils_parsing_HaxeParsingUtils.code_with_empty_comments_and_strings = function(input) {
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
		if(utils_parsing_HaxeParsingUtils.REGEX_BEGINS_WITH_STRING.match(input.substring(i))) {
			var match_len = utils_parsing_HaxeParsingUtils.REGEX_BEGINS_WITH_STRING.matched(0).length;
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
utils_parsing_HaxeParsingUtils.extract_used_keys_in_structure = function(cleaned_text) {
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
			if(utils_parsing_HaxeParsingUtils.REGEX_BEGINS_WITH_KEY.match(cleaned_text.substring(i))) {
				i += utils_parsing_HaxeParsingUtils.REGEX_BEGINS_WITH_KEY.matched(0).length;
				used_keys.push(utils_parsing_HaxeParsingUtils.REGEX_BEGINS_WITH_KEY.matched(0));
			} else i++;
		} else i++;
	}
	return used_keys;
};
utils_parsing_HaxeParsingUtils.REGEX_BEGINS_WITH_STRING = new EReg("^(?:\"(?:[^\"\\\\]*(?:\\\\.[^\"\\\\]*)*)\"|'(?:[^']*(?:''[^']*)*)')","");
utils_parsing_HaxeParsingUtils.REGEX_ENDS_WITH_BEFORE_CALL_CHAR = new EReg("[a-zA-Z0-9_\\]\\)]\\s*$","");
utils_parsing_HaxeParsingUtils.REGEX_ENDS_WITH_BEFORE_SIGNATURE_CHAR = new EReg("[a-zA-Z0-9_>]\\s*$","");
utils_parsing_HaxeParsingUtils.REGEX_ENDS_WITH_KEY = new EReg("([a-zA-Z0-9_]+)\\s*:$","");
utils_parsing_HaxeParsingUtils.REGEX_ENDS_WITH_ALPHANUMERIC = new EReg("([a-zA-Z0-9_]+)$","");
utils_parsing_HaxeParsingUtils.REGEX_BEGINS_WITH_KEY = new EReg("^([a-zA-Z0-9_]+)\\s*:","");
utils_parsing_HaxeParsingUtils.REGEX_PACKAGE = new EReg("^package\\s*([a-zA-Z0-9_]*(\\.[a-zA-Z0-9_]+)*)","");
utils_parsing_HaxeParsingUtils.REGEX_ENDS_WITH_FUNCTION_DEF = new EReg("[^a-zA-Z0-9_]function(?:\\s+[a-zA-Z0-9_]+)?(?:<[a-zA-Z0-9_<>, ]+>)?$","");
utils_parsing_HaxeParsingUtils.REGEX_IMPORT = new EReg("import\\s*([a-zA-Z0-9_]+(?:\\.[a-zA-Z0-9_]+)*)(?:\\s+(?:in|as)\\s+([a-zA-Z0-9_]+))?","g");
HaxeDev.main();
})(typeof console != "undefined" ? console : {log:function(){}});

//# sourceMappingURL=haxe-dev.js.map