package com.example.controller.user;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.json.JSONObject;
import org.springframework.stereotype.Service;

import com.example.controller.util.CmnUt;
import com.example.controller.util.EsRest;

@Service
public class UserService {
	
	private static String user_index = "leo_user";

	// 사용자 리스트
	public JSONObject getUserList() throws Exception {
	    StringBuilder searchBody = new StringBuilder();
	    EsRest esRest = new EsRest();
	    JSONObject dataList = new JSONObject();
	    Integer totalCount = 0;

	    try {
	        // Elasticsearch 쿼리 생성
	        searchBody.append("{\"query\": {\"bool\": {\"filter\": [");
	        searchBody.append("{\"term\": {\"IS_USE\": \"true\"}},");
	        searchBody.append("{\"match_all\": {}}");
	        searchBody.append("]}}}");

	        // 사용자 리스트 가져오기
	        dataList = esRest.searchByBody(user_index, new JSONObject(searchBody.toString()));

	        // 사용자 카운트 가져오기
	        totalCount = esRest.count(user_index, null, searchBody);

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
	
	// 사용자 가져오기
    public HashMap<String, Object> getRowUser(HashMap<String, String> param) throws Exception {
        HashMap<String, Object> map = new HashMap<>();
        EsRest esRest = new EsRest();
        // 컬럼 리스트 정의
        List<String> column_list = new ArrayList<>();
        column_list.add("USER_ID");
        column_list.add("USER_NAME");
        column_list.add("USER_AUTH");
        column_list.add("USER_PHONE");
        column_list.add("IS_USE");
        column_list.add("IS_AIR_USE");
        column_list.add("IS_QUERY_USE");
        column_list.add("IS_ETC_USE");
        column_list.add("USER_MK_DT");
        column_list.add("USER_UPD_DT");
        column_list.add("USER_LOGIN_DT");
        column_list.add("USER_PW");

        try {
            // Elasticsearch에서 사용자 데이터 가져오기
            JSONObject job = esRest.row(user_index, param.get("_id"), column_list);
            map.put("row", job.toMap());
        } catch (Exception e) {
            map.put("sError", "사용자 상세정보를 가져올 수 없습니다");
            throw new Exception("Elasticsearch 호출 오류", e);
        }

        return map;
    }
    
    // 아이디 중복 체크
    public String checkUserId(String userId) throws Exception {
    	EsRest esRest = new EsRest();
        String result = "Y";  // 기본값은 사용 가능한 ID ("Y"는 사용 가능)

        StringBuilder requestBody = new StringBuilder();
        requestBody.append("{");
        requestBody.append("\"query\" : {");
        requestBody.append("\"bool\" : {");
        requestBody.append("\"must\":{");
        requestBody.append("\"term\":{").append("\"USER_ID\" : \"").append(userId).append("\"}");
        requestBody.append("}");
        requestBody.append("}");
        requestBody.append("}");
        requestBody.append("}");

        try {
            // Elasticsearch에서 해당 ID를 찾는 쿼리 실행
            int chk = esRest.count(user_index, null, requestBody);
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
    
    // 아이디와 비밀번호 체크
    public String checkUserPass(HashMap<String, Object> param) throws Exception {
    	EsRest esRest = new EsRest();
        String result = "Y";  // 기본값은 사용 가능한 ID ("Y"는 사용 가능)
        CmnUt CmnUt = new CmnUt();

        List<String> column_list = new ArrayList<>();
        column_list.add("USER_ID");
        column_list.add("USER_NAME");
        column_list.add("USER_AUTH");
        column_list.add("USER_PHONE");
        column_list.add("IS_USE");
        column_list.add("IS_AIR_USE");
        column_list.add("IS_QUERY_USE");
        column_list.add("IS_ETC_USE");
        column_list.add("USER_MK_DT");
        column_list.add("USER_UPD_DT");
        column_list.add("USER_LOGIN_DT");
        column_list.add("USER_PW");
        
        String id = param.get("_id").toString();

        try {
            // Elasticsearch에서 해당 ID를 찾는 쿼리 실행
        	JSONObject job = esRest.row(user_index, id, column_list);
        	// 저장된 pw
        	String savedPassword = job.getJSONObject("_source").getString("USER_PW");
        	// 입력한 pw
            String password = (String) param.get("USER_PW");
            String encryptedPassword = CmnUt.encryptSHA256(password);
            // 각각 비교
            if(savedPassword.equals(encryptedPassword)) {
            	result="Y";
            }else {
            	result="N";
            }

        } catch (Exception e) {
            throw new Exception("ID 체크 오류: " + e.getMessage());
        }

        return result;
    }
    
// 사용자 저장   
    public HashMap<String, Object> saveUser(HashMap<String, Object> param) throws Exception {
        HashMap<String, Object> map = new HashMap<>();
        CmnUt CmnUt = new CmnUt();
        EsRest esRest = new EsRest();
        Date today = new Date();
        SimpleDateFormat smf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ssZ");

        // 중복확인 로직 (예: 이미 등록된 사용자 ID가 있는지 확인)
        int chk = 0;
        
        if (chk == 0) {  // 중복 확인
            param.remove("mode");
            param.remove("_id");
            param.remove("USER_PW_HIDDEN");
            param.put("USER_MK_DT", smf.format(today));
            param.put("USER_UPD_DT", smf.format(today));
            param.put("USER_LOGIN_DT", smf.format(today));
            param.put("USER_LIKE_BOARD", new ArrayList<String>());
            
            // 비밀번호 암호화
            String password = (String) param.get("USER_PW");
            if ("".equals(password)) {
                param.replace("USER_PW", "null");
            } else {
                String encryptedPassword = CmnUt.encryptSHA256(password);
                param.replace("USER_PW", encryptedPassword);
            }

            Set<String> booleanFields = Set.of("IS_USE", "IS_AIR_USE", "IS_ETC_USE", "IS_QUERY_USE");

            for (Map.Entry<String, Object> entry : param.entrySet()) {
                String key = entry.getKey();
                Object value = entry.getValue();

                if (booleanFields.contains(key) && value instanceof String) {
                    String strVal = ((String) value).toLowerCase();

                    if (strVal.equals("true") || strVal.equals("false")) {
                        param.put(key, Boolean.parseBoolean(strVal));
                    }
                }
            }

            // Elasticsearch에 사용자 정보 저장
            esRest.update(user_index+"/_doc", param.get("USER_ID").toString(), param); 
            map.put("sOk", "ok");
        } else {
            map.put("sError", "이미 등록되어 있는 사용자ID 입니다. \n다시 작성해 주시기 바랍니다.");
            map.put("sOk", "no");
        }
        
        return map;
    }
    
    // 사용자 삭제
    public HashMap<String, Object> deleteUser(String id) throws Exception {
    	EsRest esRest = new EsRest();
    	HashMap<String, Object> map = new HashMap<>();
        try {
        	esRest.delete(user_index, id);
        	map.put("sOk", "ok");
        } catch (Exception e) {
            map.put("sError", "삭제에 실패하였습니다.");
        }

        return map;
    }
    
    
}
