package com.example.controller.air;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import com.example.controller.util.CmnUt;
import com.example.controller.util.EsRest;

@Service
public class AirBoardService {

	private static String index = "leo_wrong_data";
	
	// 게시글 리스트
	public JSONObject getBoardList(HashMap<String, String> param) throws Exception {
	    EsRest es = new EsRest();
	    JSONObject dataList = new JSONObject();
	    Integer totalCount = 0;

	    try {
	        // 1. 검색용 쿼리
	    	StringBuilder searchBody = new StringBuilder();
	    	searchBody.append("{");
	    	searchBody.append("\"size\": 1000,");
	    	searchBody.append("\"query\": {\"bool\": {\"filter\": [");

	    	String type = param.get("boardType") != null ? param.get("boardType").toString() : "";
	    	if (!type.equals("") && !type.equals("전체")) {
	    	    String chatType = CmnUt.getAreaByType(type);
	    	    searchBody.append("{\"term\": {\"stationName\": \"" + chatType + "\"}}");
	    	}

	    	String text = param.get("boardText") != null ? param.get("boardText").toString() : "";
	    	if (!text.equals("")) {
	    	    if (!type.equals("") && !type.equals("전체")) searchBody.append(",");
	    	    searchBody.append("{\"bool\": {\"should\": [");
	    	    searchBody.append("{\"wildcard\": {\"pm10Grade\": {\"value\": \"*" + text + "*\"}}},");
	    	    searchBody.append("{\"wildcard\": {\"pm25Grade\": {\"value\": \"*" + text + "*\"}}},");
	    	    searchBody.append("{\"wildcard\": {\"o3Grade\": {\"value\": \"*" + text + "*\"}}}");
	    	    searchBody.append("], \"minimum_should_match\": 1}}");
	    	}

	    	searchBody.append("]}}");
	    	searchBody.append("}");

	        // 2. 카운트용 쿼리
	    	StringBuilder countBody = new StringBuilder();
	    	countBody.append("{");
	    	countBody.append("\"query\": { \"match_all\": {} }");
	    	countBody.append("}");

	        
	        // 게시글 리스트 가져오기
	        dataList = es.searchByBody(index, new JSONObject(searchBody.toString()));
	        // 게시글 카운트 가져오기
	        totalCount = es.count(index, null, countBody);


	        
	        // 결과를 합쳐서 반환
	        JSONObject result = new JSONObject();
	        result.put("data", dataList.toMap());
	        result.put("recordsTotal", totalCount);
	        result.put("recordsFiltered", totalCount);

	        return result;

	    } catch (Exception e) {
	        System.out.println("[e] : " + e);
	        return new JSONObject();
	    }
	}
	
	// 보드 가져오기
    public HashMap<String, Object> getRowBoard(HashMap<String, String> param) throws Exception {
        HashMap<String, Object> map = new HashMap<>();
        EsRest es = new EsRest();
        // 컬럼 리스트 정의
        List<String> column_list = new ArrayList<>();
        column_list.add("pm10Value");
        column_list.add("pm10Grade");
        column_list.add("pm10Flag");
        column_list.add("pm25Value");
        column_list.add("pm25Grade");
        column_list.add("pm25Flag");
        column_list.add("o3Value");
        column_list.add("o3Grade");
        column_list.add("o3Flag");
        column_list.add("khaiValue");
        column_list.add("khaiGrade");
        column_list.add("type");
        column_list.add("stationName");
        column_list.add("desc");
        column_list.add("dataTime");

        try {
            // Elasticsearch에서 사용자 데이터 가져오기
            JSONObject job = es.row(index, param.get("_id"), column_list);
            map.put("row", job.toMap());
        } catch (Exception e) {
            map.put("sError", "사용자 상세정보를 가져올 수 없습니다");
            throw new Exception("Elasticsearch 호출 오류", e);
        }

        return map;
    }	
	
	
	
	
	
	
	
}
