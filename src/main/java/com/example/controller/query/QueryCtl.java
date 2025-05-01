package com.example.controller.query;

import java.io.BufferedReader;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.http.util.EntityUtils;
import org.elasticsearch.client.ResponseException;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.controller.query.QueryService;
import com.example.controller.util.EsRest;

@RestController
@RequestMapping("/query")
public class QueryCtl {

	@Autowired
	private QueryService queryService;
	
    @RequestMapping(method = RequestMethod.POST, value = "/list")
    public HashMap<String, Object> checkX6(@RequestBody HashMap<String, String> param) throws Exception{
    	System.out.println("##### checkX6 #####");
    	HashMap<String, Object> map = new HashMap();
    	String result = "Y";
    	String id = param.get("id");
    	//result = sirManageService.checkX6Id(id);
    	
    	map.put("data", result);
    	
        return map;
    }
    

	@RequestMapping(value = "/elastic/getListQuery")
	public HashMap<String, Object> getListQuery(@RequestParam HashMap<String, String> paramMap) throws Exception {
		HashMap<String, Object> returnMap = new HashMap();

		JSONObject obj = queryService.getListQuery();
		returnMap.put("data", obj.toMap());

		return returnMap;
	}
	
    // 엘라스틱 상태 확인
	@RequestMapping(value = "/elastic/getClusterState")
	public @ResponseBody HashMap<String, Object> getClusterCondition(HttpSession session) throws Exception {
		System.out.println("##### elastic/getClusterState #####");
		EsRest es = new EsRest();

		HashMap<String, Object> map = new HashMap<String, Object>();

		try {
			map.put("cc", es.getAdminApi("/_cluster/health").toMap());
			System.out.println("map : "+map);
		} catch (Exception e) {
			System.out.println("e : "+e);
		}

		return map;
	}
	// 엘라스틱 인덱스리스트 가져오기
	@RequestMapping(value = "/elastic/getIndexList", method = RequestMethod.GET)
	public @ResponseBody List<String> getIndexList() throws Exception {
		System.out.println("##### elastic/getIndexList #####");
	    EsRest es = new EsRest();
	    String json = es.url("GET", "/_cat/indices?h=index&format=json", "");

	    JSONArray arr = new JSONArray(json);
	    List<String> result = new ArrayList<>();
	    for (int i = 0; i < arr.length(); i++) {
	        JSONObject o = arr.getJSONObject(i);
	        result.add(o.getString("index"));
	    }
	    return result;
	}
	// 쿼리검색 -> 엘라스틱 쿼리 검색
	@RequestMapping(method = RequestMethod.POST, value = "/elastic/query", produces = "application/text;charset=UTF-8")
	public @ResponseBody String query_post(HttpServletRequest request) {
		System.out.println("##### elastic/query #####");
		EsRest rs = new EsRest();
		try {
			StringBuilder sb = new StringBuilder();
			String line;
			BufferedReader b_reader = request.getReader();
			while ((line = b_reader.readLine()) != null) {
				sb.append(line);
			}

			org.json.JSONObject reqObj = new org.json.JSONObject(sb.toString());
			System.out.println("reqObj : "+reqObj);
			String type = reqObj.getString("method");
			String data = "GET".equals(type) ? null :  reqObj.getString("data");
			System.out.println("data : "+data);
			
			String call = rs.querySearch(reqObj.getString("method"), reqObj.getString("url"),data);
			call = call.replaceAll("<", "&lt;");
			call = call.replaceAll(">", "&gt;");
			System.out.println("call : "+call);
			return call;
		} catch (ResponseException res_e) {
			try {
				return EntityUtils.toString(res_e.getResponse().getEntity());
			} catch (Exception e) {
				System.out.println("e : "+e);
			}
		} catch (JSONException j_e) {
			return "{\"error\": \"" + j_e.getMessage().replaceAll("\"", "'") + "\"}";
		} catch (Exception e) {
			System.out.println("e : "+e);
		}

		return "";
	}	
	
	
    @RequestMapping(method = RequestMethod.POST, value = "/elastic/setQuery")
    public HashMap<String, Object> setQuery(@RequestBody HashMap<String, Object> param) throws Exception{		
		System.out.println("##### elastic/setQuery #####");
		HashMap<String, Object> returnMap = new HashMap();
		try {
			String rs = queryService.setQuery(param);
			returnMap.put("sMeg", rs);
			returnMap.put("sOk", "ok");
		} catch (Exception e) {
			returnMap.put("sOk", "no");
			System.out.println("e : "+e);
		}

		return returnMap;
	}


    @RequestMapping(method = RequestMethod.POST, value = "/elastic/getRowQuery")
    public HashMap<String, Object> getRowQuery(@RequestBody HashMap<String, Object> param) throws Exception{	
		HashMap<String, Object> returnMap = new HashMap();
		JSONObject obj = new JSONObject();
		String id = param.get("_id").toString();
		
		obj = queryService.getRowQuery(id);
		returnMap.put("data", obj.toMap());

		return returnMap;
	}
	
}
