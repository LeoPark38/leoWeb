package com.example.controller.air;

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
public class AirMonitoringService {

	private static String user_index = "leo_air_data";
	
	// air 리스트
	public JSONObject getAirList(HashMap<String, String> param) throws Exception {
	    EsRest es = new EsRest();
	    JSONObject dataList = new JSONObject();
	    JSONObject result = new JSONObject();
	    
	    try {
	        // 1. 검색용 쿼리
	    	String searchText = param.get("searchText"); // 측정위치

	    	ZoneId zone = ZoneId.of("Asia/Seoul");
	    	ZonedDateTime today = LocalDate.now().atStartOfDay(zone);
	    	ZonedDateTime tomorrow = today.plusDays(1);

	    	DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ssZ");
	    	String todayStr = formatter.format(today);
	    	String tomorrowStr = formatter.format(tomorrow);

	    	// 쿼리 시작
	    	StringBuilder sb = new StringBuilder();
	    	sb.append("{");
	    	sb.append("  \"query\": {");
	    	sb.append("    \"bool\": {");
	    	sb.append("      \"must\": [");
	    	sb.append("        {");
	    	sb.append("          \"range\": {");
	    	sb.append("            \"dataTime\": {");
	    	sb.append("              \"gte\": \"" + todayStr + "\",");
	    	sb.append("              \"lt\": \"" + tomorrowStr + "\"");
	    	sb.append("            }");
	    	sb.append("          }");
	    	sb.append("        },");
	    	sb.append("        {");
	    	sb.append("          \"term\": {");
	    	sb.append("            \"isResistWrong\": false");
	    	sb.append("          }");
	    	sb.append("        }");
	    	if (searchText != null && !searchText.isEmpty()) {
	    	    sb.append(","); // 쉼표 추가
	    	    sb.append("        {");
	    	    sb.append("          \"match\": {");
	    	    sb.append("            \"stationName\": \"" + searchText + "\"");
	    	    sb.append("          }");
	    	    sb.append("        }");
	    	}
	    	sb.append("      ]");
	    	sb.append("    }");
	    	sb.append("  },");
	    	sb.append("  \"sort\": [");
	    	sb.append("    {");
	    	sb.append("      \"dataTime\": { \"order\": \"desc\" }");
	    	sb.append("    }");
	    	sb.append("  ],");
	    	sb.append("\"size\":1000");
	    	sb.append("}");

	    	String queryString = sb.toString();

	        dataList = es.searchByBody(user_index, new JSONObject(queryString));

	        result.put("data", dataList.toMap());

	        return result;

	    } catch (Exception e) {
	        System.out.println("[e] : " + e);
	        return new JSONObject();
	    }
	}
	
	// 보드 가져오기
    public HashMap<String, Object> getAirRow(HashMap<String, String> param) throws Exception {
        HashMap<String, Object> map = new HashMap<>();
        EsRest es = new EsRest();
        // 컬럼 리스트 정의
        List<String> column_list = new ArrayList<>();
        column_list.add("pm10Flag");
        column_list.add("pm10Value");
        column_list.add("pm10Grade");
        column_list.add("pm25Flag");
        column_list.add("pm25Grade");
        column_list.add("pm25Value");
        column_list.add("o3Flag");
        column_list.add("o3Value");
        column_list.add("o3Grade");
        column_list.add("khaiGrade");
        column_list.add("khaiValue");
        column_list.add("dataTime");
        column_list.add("stationName");

        try {
            // Elasticsearch에서 사용자 데이터 가져오기
            JSONObject job = es.row(user_index, param.get("_id"), column_list);
            map.put("row", job.toMap());
        } catch (Exception e) {
            map.put("sError", "사용자 상세정보를 가져올 수 없습니다");
            throw new Exception("Elasticsearch 호출 오류", e);
        }

        return map;
    }	
	
	
	// air 집계
	public JSONObject avgKhaiValue() throws Exception {
	    EsRest es = new EsRest();
	    JSONObject dataList = new JSONObject();
	    JSONObject result = new JSONObject();
	    
	    try {
	    	ZoneId zone = ZoneId.of("Asia/Seoul");
	    	ZonedDateTime today = LocalDate.now().atStartOfDay(zone);
	    	ZonedDateTime tomorrow = today.plusDays(1);

	    	DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ssZ");
	    	String todayStr = formatter.format(today);
	    	String tomorrowStr = formatter.format(tomorrow);

	    	// 쿼리 시작
	    	StringBuilder sb = new StringBuilder();
	    	sb.append("{\n");
	    	sb.append("  \"size\": 0,\n");
	    	sb.append("  \"query\": {\n");
	    	sb.append("    \"range\": {\n");
	    	sb.append("      \"dataTime\": {\n");
	    	sb.append("        \"gte\": \"" + todayStr + "\",\n");
	    	sb.append("        \"lt\": \"" + tomorrowStr + "\"\n");
	    	sb.append("      }\n");
	    	sb.append("    }\n");
	    	sb.append("  },\n");
	    	sb.append("  \"aggs\": {\n");
	    	sb.append("    \"by_station\": {\n");
	    	sb.append("      \"terms\": {\n");
	    	sb.append("        \"field\": \"stationName\",\n");
	    	sb.append("        \"size\": 20\n");
	    	sb.append("      },\n");
	    	sb.append("      \"aggs\": {\n");
	    	sb.append("        \"avg_khai\": {\n");
	    	sb.append("          \"avg\": {\n");
	    	sb.append("            \"field\": \"khaiValue\"\n");
	    	sb.append("          }\n");
	    	sb.append("        }\n");
	    	sb.append("      }\n");
	    	sb.append("    }\n");
	    	sb.append("  }\n");
	    	sb.append("}");

	    	String queryString = sb.toString();
	        dataList = es.searchByBody(user_index, new JSONObject(queryString));
	        result.put("data", dataList.toMap());

	        return result;

	    } catch (Exception e) {
	        System.out.println("[e] : " + e);
	        return new JSONObject();
	    }
	}	
	
	public JSONObject avgKhaiGrade() throws Exception {
	    EsRest es = new EsRest();
	    JSONObject dataList = new JSONObject();
	    JSONObject result = new JSONObject();
	    
	    try {
	    	ZoneId zone = ZoneId.of("Asia/Seoul");
	    	ZonedDateTime today = LocalDate.now().atStartOfDay(zone);
	    	ZonedDateTime tomorrow = today.plusDays(1);

	    	DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ssZ");
	    	String todayStr = formatter.format(today);
	    	String tomorrowStr = formatter.format(tomorrow);

	    	// 쿼리 시작
	    	StringBuilder sb = new StringBuilder();
	    	sb.append("{\n");
	    	sb.append("  \"size\": 0,\n");
	    	sb.append("  \"query\": {\n");
	    	sb.append("    \"range\": {\n");
	    	sb.append("      \"dataTime\": {\n");
	    	sb.append("        \"gte\": \"" + todayStr + "\",\n");
	    	sb.append("        \"lt\": \"" + tomorrowStr + "\"\n");
	    	sb.append("      }\n");
	    	sb.append("    }\n");
	    	sb.append("  },\n");
	    	sb.append("  \"aggs\": {\n");
	    	sb.append("    \"grade_dist\": {\n");
	    	sb.append("      \"terms\": {\n");
	    	sb.append("        \"field\": \"khaiGrade\",\n");
	    	sb.append("        \"size\": 10\n");
	    	sb.append("      }\n");
	    	sb.append("    }\n");
	    	sb.append("  }\n");
	    	sb.append("}");

	    	String queryString = sb.toString();

	        dataList = es.searchByBody(user_index, new JSONObject(queryString));

	        result.put("data", dataList.toMap());

	        return result;

	    } catch (Exception e) {
	        System.out.println("[e] : " + e);
	        return new JSONObject();
	    }
	}	
	
	// X6 데이터 가져오기
    public HashMap<String, Object> x6Data(HashMap<String, String> param) throws Exception {
        HashMap<String, Object> map = new HashMap<>();
        EsRest es = new EsRest();
        String area = param.get("area");
        String type = CmnUt.getTypeByArea(area);
        String id = "x6_"+type;
        
        // 컬럼 리스트 정의
        List<String> column_list = new ArrayList<>();
        column_list.add("X6_NM");
        column_list.add("X6_MK_DT");
        column_list.add("X6_STRUCTURE");
        column_list.add("X6_DESC");
        column_list.add("X6_TYPE");
        column_list.add("IS_USE");
        column_list.add("X6_ID");
        column_list.add("X6_UPD_DT");

        try {

            // 문서 존재 여부 확인
            if (!es.exists("leo_x6", id)) {
                map.put("sError", "해당 ID의 X6 데이터가 존재하지 않습니다.");
                return map;
            }
            
            JSONObject job = es.row("leo_x6", id, column_list);
            map.put("row", job.toMap());
        } catch (Exception e) {
            map.put("sError", "해당 X6데이터를 가져올 수 없습니다");
            throw new Exception("Elasticsearch 호출 오류", e);
        }

        return map;
    }		
	// 이상데이터등록으로인한 기존 air_data의 값변경
	public JSONObject changeAirData(HashMap<String, Object> param) throws Exception {
		EsRest es = new EsRest();
		JSONObject response = new JSONObject();
		JSONObject docData = new JSONObject();
 
 		try {
			String id = (String) param.get("_id");
			docData.put("isResistWrong", true);
	   		es.updateDoc("leo_air_data", id, docData);         	
		}catch (Exception e) {
			response.put("sOk", "no");
			System.out.println("[e] : "+e);
		}
		return response;
	}		
	
	// 이상데이터 등록
	public JSONObject saveWrongData(HashMap<String, Object> param) throws Exception {
		EsRest es = new EsRest();
		JSONObject response = new JSONObject();
        Date today = new Date();
        SimpleDateFormat smf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ssZ");
 
 		try {
			JSONObject station = new JSONObject(param); // param이 Map<String, String>이라면 JSONObject로 래핑

			JSONObject simplified = new JSONObject();
			simplified.put("stationName", station.optString("stationName"));
			simplified.put("dataTime", station.optString("dataTime"));

			simplified.put("pm10Value", CmnUt.parseIntOrZero(station.optString("pm10Value", null)));
			simplified.put("pm10Grade", station.optString("pm10Grade", "-"));
			simplified.put("pm10Flag", station.optString("pm10Flag", "-"));

			simplified.put("pm25Value", CmnUt.parseIntOrZero(station.optString("pm25Value", null)));
			simplified.put("pm25Grade", station.optString("pm25Grade", "-"));
			simplified.put("pm25Flag", station.optString("pm25Flag", "-"));

			simplified.put("o3Value", CmnUt.parseFloatOrZero(station.optString("o3Value", null)));
			simplified.put("o3Grade", station.optString("o3Grade", "-"));
			simplified.put("o3Flag", station.optString("o3Flag", "-"));

			simplified.put("khaiValue", CmnUt.parseIntOrZero(station.optString("khaiValue", null)));
			simplified.put("khaiGrade", station.optString("khaiGrade", "-"));

			simplified.put("desc", station.optString("desc", "-"));
			simplified.put("type", "air");
			System.out.println("## simplified : "+simplified);
			
			response = es.insert("leo_wrong_data",null, simplified);
			

		}catch (Exception e) {
			response.put("sOk", "no");
			System.out.println("[e] "+e);
		}
		return response;
	}		
	
	
	
	
	
	
}
