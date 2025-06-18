package com.example.controller.login;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpSession;

import org.json.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.controller.util.CmnUt;
import com.example.controller.util.EsRest;

@RestController
@RequestMapping(value = "/login")
public class LogInCtl {
	
	private static String user_index = "leo_user";
	
    @RequestMapping(value = "/login")
    public HashMap<String, Object> login(@RequestBody HashMap<String, Object> param, HttpSession session) throws Exception {
    	HashMap<String, Object> rs = new HashMap<>();
        HashMap<String, Object> user_map = new HashMap();
        EsRest es = new EsRest();
        int chk = 0;
        String id = param.get("id").toString();
        String pw = param.get("pw").toString();
        String encryptedPassword = CmnUt.encryptSHA256(pw);

        // id, pw 체크
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\"query\": {");
        sb.append("\"bool\": {");
        sb.append("\"must\": [");
        sb.append("{ \"term\": { \"USER_ID\": \"").append(id).append("\" } },");
        sb.append("{ \"term\": { \"USER_PW\": \"").append(encryptedPassword).append("\" } }");
        sb.append("]");
        sb.append("}");
        sb.append("}");
        sb.append("}");

		chk = es.count(user_index, null, sb);
     
		if(chk == 1) {
			// 체크한 id 정보 가져오기
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
	        column_list.add("USER_LIKE_BOARD");
	        try {
	            // Elasticsearch에서 사용자 데이터 가져오기
	            JSONObject job = es.row(user_index, id, column_list);
	            JSONObject data = job.getJSONObject("_source");
	            user_map.put("user_id", data.get("USER_ID"));
	            user_map.put("user_name", data.get("USER_NAME"));
	            user_map.put("user_login_dt", data.get("USER_LOGIN_DT"));
	            user_map.put("user_query_use", data.get("IS_QUERY_USE"));
	            user_map.put("user_etc_use", data.get("IS_ETC_USE"));
	            user_map.put("user_air_use", data.get("IS_AIR_USE"));
	            user_map.put("user_is_use", data.get("IS_USE"));
	            user_map.put("user_mk_dt", data.get("USER_MK_DT"));
	            user_map.put("user_like_board", data.get("USER_LIKE_BOARD"));
 
	            session.setAttribute("userInfo", user_map);

	            rs.put("sOk", "ok");
	            rs.put("user_map", user_map);
	            rs.put("redirectUrl", "/sas/views/board/board.html");
	        } catch (Exception e) {
	            throw new Exception("Elasticsearch 호출 오류", e);
	        }
		}else {
			rs.put("sOk", "no");
		}
		return rs;
    }
    
	/**
	 * session 가져옴
	 *
	 * @param HashMap<String, String>
	 * @return HashMap<String, Object>
	 */
	@SuppressWarnings("unchecked")
	@PostMapping("/getSession")
	public @ResponseBody HashMap<String, Object> getSession(@RequestBody HashMap<String, String> param, HttpSession session)
			throws Exception {
		System.out.println("#### getSession ####");
		HashMap<String, Object> map = new HashMap<String, Object>();
		
		map = (HashMap<String, Object>) session.getAttribute("userInfo");
		
		return map;
	}

	/**
	 * logout
	 *
	 * @param HashMap<String, String>
	 * @return HashMap<String, Object>
	 */
	@PostMapping("/logout")
	public @ResponseBody String logout(HttpSession session)
			throws Exception {
		System.out.println("#### logout ####");
		session.invalidate();
		return "redirect:/login";
	}
	
}
