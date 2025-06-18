package com.example.controller.air;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/monitoring")
public class AirMonitoringCtl {

	private static String user_index = "leo_air_data";
	
	@Autowired
	private AirMonitoringService airMonitoring;
	
	/**
	 * 오늘하루 각구의 대기 확인
	 * @param HashMap<String, String> @return HashMap<String, Object>
	 */		
	@RequestMapping(value = "/getAirList")
	public @ResponseBody HashMap<String, Object> getAirList(@RequestParam HashMap<String, String> param) throws Exception {
	    HashMap<String, Object> map = new HashMap<>();
	    System.out.println("#### getAirList ####");
	    try {
	        // Elasticsearch 쿼리 결과 가져오기
	        JSONObject dataJo = airMonitoring.getAirList(param);

	        // 결과를 Map에 넣기
	        map.put("data", ((JSONObject) dataJo.get("data")).toMap());

	    } catch (Exception e) {
	        map.put("sError", "보드 리스트를 가져올 수 없습니다");
	        System.out.println("[e] : " + e);
	    }
	    
	    return map;
	}	
	
	/**
	 * 선택한 구의 대기 보기 
	 * @param HashMap<String, String> @return HashMap<String, Object>
	 */			
	@PostMapping("/getAirRow")
	public @ResponseBody HashMap<String, Object> getAirRow(@RequestBody HashMap<String, String> param)
			throws Exception {
		System.out.println("#### getAirRow ####");
		HashMap<String, Object> map = new HashMap();
		try {
			map = airMonitoring.getAirRow(param);
		} catch (Exception e) {
			map.put("sError", "보드 상세정보를 가져올 수 없습니다");
			System.out.println("[e] : "+e);
		}
		return map;
	}		

	/**
	 * 오늘 하루 각구별 대기질 집계
	 * @param HashMap<String, String> @return HashMap<String, Object>
	 */			
	@PostMapping("/avgKhaiValue")
	public @ResponseBody HashMap<String, Object> avgKhaiValue(@RequestBody HashMap<String, String> param)
			throws Exception {
		System.out.println("#### avgKhaiValue ####");
		HashMap<String, Object> map = new HashMap<>();
		JSONObject data = new JSONObject();
		try {
			data = airMonitoring.avgKhaiValue();
			map.put("data", data.toMap());
		} catch (Exception e) {
			map.put("sError", "상세정보를 가져올 수 없습니다");
			System.out.println("[e] : "+e);
		}
		return map;
	}		
	
	/**
	 * 오늘 하루 대기등급 집계
	 * @param HashMap<String, String> @return HashMap<String, Object>
	 */			
	@PostMapping("/avgKhaiGrade")
	public @ResponseBody HashMap<String, Object> avgKhaiGrade(@RequestBody HashMap<String, String> param)
			throws Exception {
		System.out.println("#### avgKhaiGrade ####");
		HashMap<String, Object> map = new HashMap<>();
		JSONObject data = new JSONObject();
		try {
			data = airMonitoring.avgKhaiGrade();
			map.put("data", data.toMap());
		} catch (Exception e) {
			map.put("sError", "보드 상세정보를 가져올 수 없습니다");
			System.out.println("[e] : "+e);
		}
		return map;
	}	
	
	/**
	 * 선택한 지역의 x6 데이터 
	 * @param HashMap<String, String> @return HashMap<String, Object>
	 */			
	@PostMapping("/x6Data")
	public @ResponseBody HashMap<String, Object> x6Data(@RequestBody HashMap<String, String> param)
			throws Exception {
		System.out.println("#### x6Data ####");
		HashMap<String, Object> map = new HashMap<>();

		try {
			map =airMonitoring.x6Data(param);
		} catch (Exception e) {
			map.put("sError", "보드 상세정보를 가져올 수 없습니다");
			System.out.println("[e] : "+e);
		}
		return map;
	}	
	
	/**
	 * 이상 데이터 사고 등록 처리
	 * @param HashMap<String, Object> @return HashMap<String, Object>
	 */		
	@RequestMapping(value = "saveWrongData")
	public @ResponseBody HashMap<String, Object> saveWrongData(@RequestBody HashMap<String, Object> param) throws Exception {
		System.out.println("##### saveWrongData #####");
		HashMap<String, Object> map = new HashMap();
		
		try {
			// leo_wrong_data에 추가
			airMonitoring.saveWrongData(param);
			// leo_air_data 에서 isResistWrong 값 변경
			airMonitoring.changeAirData(param);
			map.put("sOk", "ok");
		} catch (Exception e) {
			map.put("sError", e.getMessage());
			System.out.println("[e] : "+e);
		}
		return map;
	}	
	
	
	
}
