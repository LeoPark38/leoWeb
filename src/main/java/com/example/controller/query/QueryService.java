package com.example.controller.query;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import org.json.JSONObject;
import org.springframework.stereotype.Service;

import com.example.controller.util.EsRest;

@Service
public class QueryService {

	private static String index = "leo_query";
	
	// ex)
	public JSONObject testSearch(HashMap<String, Object> param) throws Exception {
		//System.out.println("@@@ getSirList");
		EsRest es = new EsRest();
		String index = "test_index";
		
		JSONObject response = new JSONObject();
		JSONObject query = new JSONObject();
		JSONObject body = new JSONObject();
		JSONObject paramObj = new JSONObject();
		
		body.put("sir", paramObj);
		


		try {
			query.put("query", new JSONObject());
			response = es.searchByBody(index,  new JSONObject());
		}catch (Exception e) {
			System.out.println("[e] : "+e);
		}
		return response; 
	}
	
	public String setQuery(HashMap<String, Object> param) throws Exception {
		EsRest es = new EsRest();
		JSONObject docData = new JSONObject();
		String rs  ="";
		Date today = new Date();
		SimpleDateFormat smf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ssZ");
		try {
			if ("ins".equals(param.get("type"))) {
				docData.put("QUERY_TITLE", param.get("query_title"));
				docData.put("QUERY_METHOD", param.get("query_method"));
				docData.put("QUERY_INDEX", param.get("query_index"));
				docData.put("QUERY_USER_ID", "작성자 이름(현재테스트중)");	
				docData.put("QUERY_CONTENT", param.get("query_content"));
				docData.put("QUERY_MK_DT", smf.format(today));
				docData.put("QUERY_UPD_DT", smf.format(today));
				es.insert(index, null, docData);
				rs="저장되었습니다.";
	
			} else if ("upd".equals(param.get("type"))) {
				docData.put("QUERY_TITLE", param.get("query_title"));
				docData.put("QUERY_METHOD", param.get("methhod"));
				docData.put("QUERY_INDEX", param.get("query_index"));
				docData.put("QUERY_USER_ID", "작성자 이름(현재테스트중)");	
				docData.put("QUERY_CONTENT", param.get("query_content"));
				//docData.put("QUERY_MK_DT", smf.format(today));
				docData.put("QUERY_UPD_DT", smf.format(today));
				es.updateDoc(index, param.get("_id").toString(), docData);
				rs="수정되었습니다.";
	
			} else {
				es.delete(index, param.get("_id").toString());
				rs="삭제되었습니다.";
			}

		}catch (Exception e) {
			System.out.println("[e] : "+e);
		}
		return rs; 
	}
	
	public JSONObject getListQuery() throws Exception {
		//System.out.println("@@@ getSirList");
		EsRest es = new EsRest();
		JSONObject response = new JSONObject();
		StringBuilder query = new StringBuilder();
		query.append("{ \"query\": { \"match_all\": {} } }");

		List<String> columnList = new ArrayList<String>();
		columnList.add("QUERY_TITLE");
		columnList.add("QUERY_METHOD");
		columnList.add("QUERY_USER_ID");
		columnList.add("QUERY_MK_DT");
		
		try {
			response = es.searchBody(index, query, columnList);
		}catch (Exception e) {
			System.out.println("[e] : "+e);
		}
		return response; 
	}

	public JSONObject getRowQuery(String id) throws Exception {
		//System.out.println("@@@ getSirList");
		EsRest es = new EsRest();
		JSONObject response = new JSONObject();
		String _id =id;
		
		List<String> columnList = new ArrayList<String>();
		columnList.add("QUERY_TITLE");
		columnList.add("QUERY_CONTENT");
		columnList.add("QUERY_METHOD");
		columnList.add("QUERY_INDEX");
		columnList.add("QUERY_USER_ID");
		columnList.add("QUERY_UPD_DT");
		columnList.add("QUERY_MK_DT");
		
		try {
			response = es.row(index, _id, columnList);
		}catch (Exception e) {
			System.out.println("[e] : "+e);
		}
		return response; 
	}
	
}
