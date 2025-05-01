/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.example.controller.util;

import java.util.Iterator;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 *
 * @author dev_11
 */
public class JsonUt {

	public static JSONObject makeTermLevelQuery(String type, String key, Object value) {
		JSONObject result = new JSONObject();
		JSONObject component = new JSONObject();
		component.put(key, value);
		result.put(type, component);

		return result;
	}

	public static JSONObject makeSimpleJsonObject(String key, Object value) {
		JSONObject result = new JSONObject();
		result.put(key, value);
		return result;
	}

	public static JSONObject makeTplQuery(String query, JSONObject params) {
		JSONObject tpl_query = new JSONObject();

		tpl_query.put("source", query);
		tpl_query.put("params", params);

		return tpl_query;
	}

	public static JSONObject makeReplaceQuery(String query, JSONObject params) {
		JSONObject rep_query = new JSONObject(replaceParam(query, params));
		return rep_query;
	}

	public static String replaceParam(String query, JSONObject params) {
		String str = query;

		Iterator<String> keys = params.keySet().iterator();
		String key = null;
		Object value = null;
		while (keys.hasNext()) {
			key = keys.next();
			value = params.get(key);
			if (value instanceof String) {
				value = java.util.regex.Matcher.quoteReplacement((String) value);
				str = str.replaceAll("\\{\\{" + key + "\\}\\}", String.valueOf(value));
			} else if(value instanceof JSONArray){
				String parsedValue = java.util.regex.Matcher.quoteReplacement(String.valueOf(value));
				str = str.replaceAll("\\{\\{\\#toJson\\}\\}"+key+"\\{\\{\\/toJson\\}\\}", parsedValue);
			} else {
				str = str.replaceAll("\"\\{\\{" + key + "\\}\\}\"", String.valueOf(value));
			}
		}

		return str;
	}

}
