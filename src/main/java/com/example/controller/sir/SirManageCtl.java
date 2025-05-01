package com.example.controller.sir;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/x6")
public class SirManageCtl {

	@Autowired
	private SirManageService sirManageService;
	
    @GetMapping("/test")
    public Map<String, String> getMessage() {
    	System.out.println("------ test");

		int rs = 0;
		JSONObject rs2 = new JSONObject();

		HashMap<String, Object> param = new HashMap<String, Object>();
		
		try {
			rs2 = sirManageService.testSearch(param);
			
			System.out.println("rs2 : "+rs2);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

        Map<String, String> response = new HashMap<>();
        response.put("message", "testing!");
        return response;
    }
    
// X6 아이디 중복 체크   
    @RequestMapping(method = RequestMethod.POST, value = "/checkX6")
    public HashMap<String, Object> checkX6(@RequestBody HashMap<String, String> param) throws Exception{
    	System.out.println("##### checkX6 #####");
    	HashMap<String, Object> map = new HashMap();
    	String result = "Y";
    	String id = param.get("id");
    	result = sirManageService.checkX6Id(id);
    	
    	map.put("data", result);
    	
        return map;
    }
    
// X6 저장/수정/삭제   
	@RequestMapping(value = "setSir")
	public @ResponseBody HashMap<String, Object> setNtmDetectRul(HttpSession session,
			@RequestParam(value = "DRULE_FILE", required = false) MultipartFile file1,
			@RequestParam HashMap<String, Object> param) throws Exception {
		System.out.println("##### setSir #####");
		HashMap<String, Object> map = new HashMap();
		
		SimpleDateFormat orgFormatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ");
		SimpleDateFormat newFormatter = new SimpleDateFormat("yyyy-MM-dd HH:mm");
		
		try {
			if (param.get("GRAPH") != null) {
				param.put("GRAPH", param.get("GRAPH").toString());
			}
			if ("ins".equals(param.get("state"))) {// 추가
				param.put("STATE", "ins");
				sirManageService.saveSir(param);

			}else if ("upd".equals(param.get("state"))) {// 수정
				String DRULE_UPD_DT = (String) param.get("DRULE_UPD_DT");
				Date orgUpdDt = orgFormatter.parse(DRULE_UPD_DT);
				String newUpdDt = newFormatter.format(orgUpdDt);
				
				param.put("UPD_DATE", newUpdDt);
				param.put("STATE", "upd");
				//sirManageService.updateSir(param);
				
			} else if ("del".equals(param.get("state"))) {// 삭제
				param.put("STATE", "del");
				//sirManageService.delSir(param);
			}
			map.put("sOk", "ok");
		} catch (Exception e) {
			map.put("sError", e.getMessage());
			System.out.println("[e] "+e);
		}
		return map;
	}
	
	@RequestMapping(value = "getSirList", method = RequestMethod.POST)
	public @ResponseBody HashMap<String, Object> getSirList(@RequestBody HashMap<String, Object> param) throws Exception {
		HashMap<String, Object> map = new HashMap<>();
		JSONObject response = new JSONObject();
		System.out.println("##### getSirList #####");
		try {
			response = sirManageService.getSirList();

			map.put("data", response.toMap());
			map.put("sOk", "ok");
		} catch (Exception e) {
			System.out.println("[e] ctrl "+e);
		}
		return map;
	}		
	
	// sir detail 가져오기
	@RequestMapping(value = "getDetail", method = RequestMethod.POST)
	public @ResponseBody HashMap<String, Object> getDetail(@RequestBody HashMap<String, Object> param) throws Exception {
		HashMap<String, Object> returnMap = new HashMap<>();
		JSONObject response = new JSONObject();

		try {
			response = sirManageService.getDetail(param);

			returnMap.put("data", response.toMap());
			returnMap.put("sOk", "ok");
		} catch (Exception e) {
			returnMap.put("sError", "error");
		}
		return returnMap;
	}		
	
	
	
	
	
	
	
	
}
