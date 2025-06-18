package com.example.controller.air;

import java.text.SimpleDateFormat;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import org.json.JSONObject;
import org.springframework.stereotype.Service;

import com.example.controller.util.EsRest;

@Service
public class AirManageService {

	private static String index = "leo_x6";
	
	// airList 가져오기 
	public JSONObject testSearch(HashMap<String, Object> param) throws Exception {
		//System.out.println("@@@ getAirList");
		EsRest es = new EsRest();
		String index = "test_index";
		
		JSONObject response = new JSONObject();
		JSONObject query = new JSONObject();
		JSONObject body = new JSONObject();
		JSONObject paramObj = new JSONObject();
		
		body.put("air", paramObj);
		


		try {
			query.put("query", new JSONObject());
			response = es.searchByBody(index,  new JSONObject());
		}catch (Exception e) {
			System.out.println("[e] : "+e);
		}
		return response; 
	}
	
	// x6 이름 중복체크
    public String checkX6Id(String userId) throws Exception {
    	EsRest esRest = new EsRest();
        String result = "Y";  // 기본값은 사용 가능한 ID ("Y"는 사용 가능)

        StringBuilder requestBody = new StringBuilder();
        requestBody.append("{");
        requestBody.append("\"query\" : {");
        requestBody.append("\"bool\" : {");
        requestBody.append("\"must\":{");
        requestBody.append("\"term\":{").append("\"X6_ID\" : \"").append(userId).append("\"}");
        requestBody.append("}");
        requestBody.append("}");
        requestBody.append("}");
        requestBody.append("}");

        try {
            // Elasticsearch에서 해당 ID를 찾는 쿼리 실행
            int chk = esRest.count(index, null, requestBody);
            if (chk == 1) {
                result = "N";  // 중복된 ID가 존재하는 경우
            } else if (chk == 0) {
                result = "Y";  // 중복된 ID가 없을 경우
            }
        } catch (Exception e) {
            throw new Exception("ID 체크 오류: " + e.getMessage());
        }

        return result;
    }
    
	// X6 저장
	public JSONObject saveAir(HashMap<String, Object> param) throws Exception {
		EsRest es = new EsRest();
		JSONObject response = new JSONObject();
		JSONObject paramObj = new JSONObject();
        Date today = new Date();
        SimpleDateFormat smf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ssZ");

		try {
			String x6_id = (param.get("id")).toString();
			String x6_name = (param.get("X6_NM")).toString();
			String x6_is_use = (param.get("IS_USE")).toString();
			Boolean is_use = Boolean.parseBoolean(x6_is_use);
			String x6_graph = (param.get("GRAPH")).toString();
			String x6_type = (param.get("TYPE")).toString();
			String x6_desc = (param.get("DESC")).toString();
			
			String id = "x6_"+x6_id; 

			paramObj.put("X6_ID", x6_id);
			paramObj.put("X6_NM", x6_name);
			paramObj.put("X6_STRUCTURE", x6_graph);
			paramObj.put("X6_TYPE", x6_type);
			paramObj.put("X6_MK_DT", smf.format(today));
			paramObj.put("X6_UPD_DT", smf.format(today));			
			paramObj.put("IS_USE", is_use);
			paramObj.put("X6_DESC", x6_desc);

			response = es.insert(index,id, paramObj);


		}catch (Exception e) {
			response.put("sOk", "no");
			System.out.println("[e] : "+e);
		}
		return response;
	}	    
    
	// AirList 가져오기 
	public JSONObject getAirList() throws Exception {
		//System.out.println("@@@ getAirList");
		EsRest es = new EsRest();
		JSONObject response = new JSONObject();
	
		String type = "";
		
		try {
			StringBuilder query = new StringBuilder();
			query.append("{ \"query\": { \"match_all\": {} } }");
			
			
			List<String> columnList = new ArrayList<String>();
			columnList.add("X6_ID");
			columnList.add("X6_NM");
			columnList.add("X6_USER_ID");
			columnList.add("X6_TYPE");
			columnList.add("X6_MK_DT");
			columnList.add("IS_USE");
			
			response = es.searchBody(index, query, columnList);

		}catch (Exception e) {
			System.out.println("[e] : "+e);
		}
		return response; 
	}    
    
    
	// getDetail 가져오기 
	public JSONObject getDetail(HashMap<String, Object> param) throws Exception {
		//System.out.println("@@@ getAirList");
		EsRest es = new EsRest();
		JSONObject response = new JSONObject();
		
		String _id ="";
	
		try {
			_id = (param.get("id")).toString();
			response = es.row(index, _id, null);
			
		}catch (Exception e) {
			System.out.println("[e] : "+e);
		}
		return response; 
	}    
    
    
    
    
    
    
}
