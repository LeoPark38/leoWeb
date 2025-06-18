package com.example.controller.stats;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import com.example.controller.util.CmnUt;
import com.example.controller.util.EsRest;

@Service
public class statsService {
	
	private static String widget_index = "leo_widget";
	private static String air_index = "leo_air_data";
	
	// 위젯 저장  
    public HashMap<String, Object> saveWidget(HashMap<String, Object> param) throws Exception {
        HashMap<String, Object> result = new HashMap<>();
        
        EsRest es = new EsRest();
        Date now = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ssZ");

        List<Map<String, Object>> widgetList = (List<Map<String, Object>>) param.get("data");

        for (Map<String, Object> widget : widgetList) {
        	HashMap<String, Object> widgetData = new HashMap<>();
        	String userId = (String) param.get("userId");
            String id = (String) widget.get("I");
            String title = (String) widget.get("TITLE");
            String type = (String) widget.get("TYPE");
            int x = (int) widget.get("X");
            int y = (int) widget.get("Y");
            int w = (int) widget.get("W");
            int h = (int) widget.get("H");

			/*
			 * Map<String, Object> options = (Map<String, Object>) widget.get("OPTIONS"); if
			 * (options == null) { options = new HashMap<>(); }
			 */
            widgetData.put("USER_ID", userId);
            widgetData.put("WIDGET_ID", id);
            widgetData.put("WIDGET_TITLE", title);
            widgetData.put("WIDGET_TYPE", type);
            widgetData.put("I", id);
            widgetData.put("X", x);
            widgetData.put("Y", y);
            widgetData.put("W", w);
            widgetData.put("H", h);    
			/*
			 * if (!options.isEmpty()) { widgetData.put("OPTIONS", options); }
			 */
            widgetData.put("WIDGET_MK_DT", formatter.format(now));
            widgetData.put("WIDGET_UPD_DT", formatter.format(now));
            
            es.update(widget_index + "/_doc", userId+"_widget_"+id, widgetData);
        }
   
        
        result.put("sOk", "ok");
        return result;
    }
    
	// 해당유저의 위젯 정보 가져오기
	public JSONObject savedWidget(String id) throws Exception {
	    EsRest es = new EsRest();
	    JSONObject dataList = new JSONObject();

	    try {
	        // 1. 검색용 쿼리
	    	StringBuilder searchBody = new StringBuilder();
	    	searchBody.append("{");
	    	searchBody.append("\"size\": 1000,");
	    	searchBody.append("\"query\": {\"bool\": {\"filter\": [");
	    	searchBody.append("{\"term\": {\"USER_ID\": \""+id+"\"}}");
	    	searchBody.append("]}}");
	    	searchBody.append("}");

	        // 게시글 리스트 가져오기
	        dataList = es.searchByBody(widget_index, new JSONObject(searchBody.toString()));

	        // 결과를 합쳐서 반환
	        JSONObject result = new JSONObject();
	        result.put("data", dataList.toMap());

	        return result;

	    } catch (Exception e) {
	        System.out.println("[e] : " + e);
	        return new JSONObject();
	    }
	}    
    
	
	// gage데이터 불러오기
	public JSONObject getGageData(HashMap<String, Object> param) throws Exception {
	    EsRest es = new EsRest();
	    JSONObject dataList = new JSONObject();
	    
	    String type = (String) param.get("type");
	    String stationName = CmnUt.getAreaByType(type);
	    
	    String today = (String) param.get("days");
        // 파싱 포맷 지정
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ssZ");
        // 문자열을 ZonedDateTime으로 파싱
        ZonedDateTime dateTime = ZonedDateTime.parse(today, formatter);
        // 같은 날 마지막 시간
        ZonedDateTime endOfDay = dateTime.withHour(23).withMinute(59).withSecond(0);
        


	    try {
	        // 1. 검색용 쿼리
	    	StringBuilder searchBody = new StringBuilder();
	    	searchBody.append("{");
	    	searchBody.append("\"size\": 0,");
	    	searchBody.append("\"query\": {");
	    	searchBody.append("\"bool\": {");
	    	searchBody.append("\"must\": [");
	    	searchBody.append("{\"term\": {\"stationName\": \"" + stationName + "\"}},");
	    	searchBody.append("{\"range\": {\"dataTime\": {");
	    	searchBody.append("\"gte\": \"" + dateTime.format(formatter) + "\",");
	    	searchBody.append("\"lte\": \"" + endOfDay.format(formatter) + "\"");
	    	searchBody.append("}}}");
	    	searchBody.append("]");
	    	searchBody.append("}");
	    	searchBody.append("},");
	    	searchBody.append("\"aggs\": {");
	    	searchBody.append("\"avg_khaiValue\": {");
	    	searchBody.append("\"avg\": {");
	    	searchBody.append("\"field\": \"khaiValue\"");
	    	searchBody.append("}");
	    	searchBody.append("}");
	    	searchBody.append("}");
	    	searchBody.append("}");

	        dataList = es.searchByBody(air_index, new JSONObject(searchBody.toString()));

	        JSONObject result = new JSONObject();
	        result.put("data", dataList.toMap());

	        return result;

	    } catch (Exception e) {
	        System.out.println("[e] : " + e);
	        return new JSONObject();
	    }
	}     
    
    // 위젯 삭제
    public JSONObject deleteWidget(HashMap<String, Object> param) throws Exception {
    	EsRest esRest = new EsRest();
    	JSONObject rs = new JSONObject();
    	String widgetId = (String) param.get("widgetId");
    	String userId = (String) param.get("userId");
        try {
        	rs = esRest.delete(widget_index, userId+"_widget_"+widgetId);
        } catch (Exception e) {
	        System.out.println("[e] : " + e);
	        return new JSONObject();
        }

        return rs;
    } 
    
	// pie데이터 불러오기
	public JSONObject getPieData(HashMap<String, Object> param) throws Exception {
	    EsRest es = new EsRest();
	    JSONObject dataList = new JSONObject();
	    
	    String type = (String) param.get("type");
	    String stationName = CmnUt.getAreaByType(type);
	    
	    String today = (String) param.get("days");
        // 파싱 포맷 지정
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ssZ");
        // 문자열을 ZonedDateTime으로 파싱
        ZonedDateTime dateTime = ZonedDateTime.parse(today, formatter);
        // 같은 날 마지막 시간
        ZonedDateTime endOfDay = dateTime.withHour(23).withMinute(59).withSecond(0);
        


	    try {
	        // 1. 검색용 쿼리
	    	StringBuilder searchBody = new StringBuilder();
	    	searchBody.append("{");
	    	searchBody.append("\"size\": 1000,");
	    	searchBody.append("\"query\": {");
	    	searchBody.append("\"bool\": {");
	    	searchBody.append("\"must\": [");
	    	searchBody.append("{\"term\": {\"stationName\": \"" + stationName + "\"}},");
	    	searchBody.append("{\"range\": {\"dataTime\": {");
	    	searchBody.append("\"gte\": \"" + dateTime.format(formatter) + "\",");
	    	searchBody.append("\"lte\": \"" + endOfDay.format(formatter) + "\"");
	    	searchBody.append("}}}");
	    	searchBody.append("]");
	    	searchBody.append("}");
	    	searchBody.append("}");
	    	searchBody.append("}");
	    	
			List<String> columnList = new ArrayList<String>();
			columnList.add("stationName");
			columnList.add("khaiValue");
			columnList.add("khaiGrade");
			columnList.add("dataTime");
			
	        dataList = es.searchBody(air_index, searchBody,columnList);

	        JSONObject result = new JSONObject();
	        result.put("data", dataList.toMap());

	        return result;

	    } catch (Exception e) {
	        System.out.println("[e] : " + e);
	        return new JSONObject();
	    }
	}       
    
	// line데이터 불러오기
	public JSONObject getLineData(HashMap<String, Object> param) throws Exception {
	    EsRest es = new EsRest();
	    JSONObject dataList = new JSONObject();
	    
	    String type = (String) param.get("type");
	    String stationName = CmnUt.getAreaByType(type);
	    
	    String today = (String) param.get("days");
        // 파싱 포맷 지정
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ssZ");
        // 문자열을 ZonedDateTime으로 파싱
        ZonedDateTime dateTime = ZonedDateTime.parse(today, formatter);
        // 같은 날 마지막 시간
        ZonedDateTime endOfDay = dateTime.withHour(23).withMinute(59).withSecond(0);
        

	    try {
	        // 1. 검색용 쿼리
	    	StringBuilder searchBody = new StringBuilder();
	    	searchBody.append("{");
	    	searchBody.append("\"size\": 1000,");
	    	searchBody.append("\"query\": {");
	    	searchBody.append("\"bool\": {");
	    	searchBody.append("\"must\": [");
	    	searchBody.append("{\"term\": {\"stationName\": \"" + stationName + "\"}},");
	    	searchBody.append("{\"range\": {\"dataTime\": {");
	    	searchBody.append("\"gte\": \"" + dateTime.format(formatter) + "\",");
	    	searchBody.append("\"lte\": \"" + endOfDay.format(formatter) + "\"");
	    	searchBody.append("}}}");
	    	searchBody.append("]");
	    	searchBody.append("}");
	    	searchBody.append("},");
	    	searchBody.append("\"sort\":[{\"dataTime\":{\"order\":\"asc\"}}]");
	    	searchBody.append("}");
	    	
			List<String> columnList = new ArrayList<String>();
			columnList.add("stationName");
			columnList.add("pm10Value");
			columnList.add("pm10Grade");
			columnList.add("pm25Value");
			columnList.add("pm25Grade");
			columnList.add("o3Value");
			columnList.add("o3Grade");
			columnList.add("dataTime");
			
	        // 게시글 리스트 가져오기
	        dataList = es.searchBody(air_index, searchBody,columnList);

	        // 결과를 합쳐서 반환
	        JSONObject result = new JSONObject();
	        result.put("data", dataList.toMap());

	        return result;

	    } catch (Exception e) {
	        System.out.println("[e] : " + e);
	        return new JSONObject();
	    }
	}         
    
	// bar데이터 불러오기
	public JSONObject getBarData(HashMap<String, Object> param) throws Exception {
	    EsRest es = new EsRest();
	    JSONObject dataList = new JSONObject();

	    String today = (String) param.get("days");
        // 파싱 포맷 지정
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ssZ");
        // 문자열을 ZonedDateTime으로 파싱
        ZonedDateTime dateTime = ZonedDateTime.parse(today, formatter);
        // 같은 날 마지막 시간
        ZonedDateTime endOfDay = dateTime.withHour(23).withMinute(59).withSecond(0);
        

	    try {
	        // 1. 검색용 쿼리
	    	StringBuilder searchBody = new StringBuilder();
	    	searchBody.append("{");
	    	searchBody.append("\"size\": 1000,");
	    	searchBody.append("\"query\": {");
	    	searchBody.append("\"bool\": {");
	    	searchBody.append("\"must\": [");
	    	searchBody.append("{\"range\": {\"dataTime\": {");
	    	searchBody.append("\"gte\": \"" + dateTime.format(formatter) + "\",");
	    	searchBody.append("\"lte\": \"" + endOfDay.format(formatter) + "\"");
	    	searchBody.append("}}}");
	    	searchBody.append("]");
	    	searchBody.append("}");
	    	searchBody.append("},");
	    	searchBody.append("\"sort\":[{\"dataTime\":{\"order\":\"asc\"}}]");
	    	searchBody.append("}");
	    	
			List<String> columnList = new ArrayList<String>();
			columnList.add("stationName");
			columnList.add("khaiGrade");
			columnList.add("o3Grade");
			columnList.add("pm10Grade");
			columnList.add("pm25Grade");
			columnList.add("dataTime");
			
	        // 게시글 리스트 가져오기
	        dataList = es.searchBody(air_index, searchBody,columnList);

	        // 결과를 합쳐서 반환
	        JSONObject result = new JSONObject();
	        result.put("data", dataList.toMap());

	        return result;

	    } catch (Exception e) {
	        System.out.println("[e] : " + e);
	        return new JSONObject();
	    }
	}        
	
	// line데이터 불러오기
	public JSONObject getRadarData(HashMap<String, Object> param) throws Exception {
	    EsRest es = new EsRest();
	    JSONObject dataList = new JSONObject();

	    String today = (String) param.get("days");
        // 파싱 포맷 지정
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ssZ");
        // 문자열을 ZonedDateTime으로 파싱
        ZonedDateTime dateTime = ZonedDateTime.parse(today, formatter);
        // 같은 날 마지막 시간
        ZonedDateTime endOfDay = dateTime.withHour(23).withMinute(59).withSecond(0);
        

	    try {
	        // 1. 검색용 쿼리
	    	StringBuilder searchBody = new StringBuilder();
	    	searchBody.append("{");
	    	searchBody.append("\"size\": 1000,");
	    	searchBody.append("\"query\": {");
	    	searchBody.append("\"bool\": {");
	    	searchBody.append("\"must\": [");
	    	searchBody.append("{\"range\": {\"dataTime\": {");
	    	searchBody.append("\"gte\": \"" + dateTime.format(formatter) + "\",");
	    	searchBody.append("\"lte\": \"" + endOfDay.format(formatter) + "\"");
	    	searchBody.append("}}}");
	    	searchBody.append("]");
	    	searchBody.append("}");
	    	searchBody.append("},");
	    	searchBody.append("\"sort\":[{\"dataTime\":{\"order\":\"asc\"}}]");
	    	searchBody.append("}");
	    	
			List<String> columnList = new ArrayList<String>();
			columnList.add("stationName");
			columnList.add("khaiGrade");
			columnList.add("o3Grade");
			columnList.add("pm10Grade");
			columnList.add("pm25Grade");
			columnList.add("dataTime");
			
	        dataList = es.searchBody(air_index, searchBody,columnList);

	        JSONObject result = new JSONObject();
	        result.put("data", dataList.toMap());

	        return result;

	    } catch (Exception e) {
	        System.out.println("[e] : " + e);
	        return new JSONObject();
	    }
	}     
	
	
	
	
    
    
    
}
