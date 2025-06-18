package com.example.controller.stats;

import java.util.HashMap;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping(value = "/stats")
public class statsController {

	private static String board_index = "leo_board";
	@Autowired
	private statsService statsService;
	
	/**
	 * 위젯  저장하기 
	 * @param HashMap<String, Object> @return HashMap<String, Object>
	 */		
	@RequestMapping(value = "/saveWidget")
	public @ResponseBody HashMap<String, Object> saveWidget(@RequestBody HashMap<String, Object> param) throws Exception {
	    HashMap<String, Object> map = new HashMap<>();
	    System.out.println("#### saveWidget ####");
	    try {
	    	map = statsService.saveWidget(param);
	    } catch (Exception e) {
	        map.put("sError", "위젯 리스트를 가져올 수 없습니다");
	        System.out.println("sError" + e);
	    }
	    
	    return map;
	}	
	
	/**
	 * 저장된 위젯 불러오기
	 * @param HashMap<String, Object> @return HashMap<String, Object>
	 */		
	@RequestMapping(value = "/savedWidget")
	public @ResponseBody HashMap<String, Object> savedWidget(@RequestBody HashMap<String, Object> param) throws Exception {
	    HashMap<String, Object> map = new HashMap<>();
	    System.out.println("#### savedWidget ####");
	    String id = (String) param.get("userId");
	    try {
	    	JSONObject data = statsService.savedWidget(id);
	    	map.put("data", data.toMap());
	    } catch (Exception e) {
	        map.put("sError", "위젯 리스트를 가져올 수 없습니다");
	        System.out.println("sError" + e);
	    }
	    
	    return map;
	}		
	
	/**
	 * 위젯 삭제
	 * @param HashMap<String, Object> @return HashMap<String, Object>
	 */		
	@RequestMapping(value = "/deleteWidget")
	public @ResponseBody HashMap<String, Object> deleteWidget(@RequestBody HashMap<String, Object> param) throws Exception {
	    HashMap<String, Object> map = new HashMap<>();
	    System.out.println("#### deleteWidget ####");
	    try {
	    	JSONObject data = statsService.deleteWidget(param);
	    	map.put("data", data.toMap());
	    } catch (Exception e) {
	        map.put("sError", "위젯 리스트를 가져올 수 없습니다");
	        System.out.println("sError" + e);
	    }
	    
	    return map;
	}	
		
	/**
	 * Gage 위젯 데이터 가져오기
	 * @param HashMap<String, Object> @return HashMap<String, Object>
	 */		
	@RequestMapping(value = "/getGageData")
	public @ResponseBody HashMap<String, Object> getGageData(@RequestBody HashMap<String, Object> param) throws Exception {
	    HashMap<String, Object> map = new HashMap<>();
	    System.out.println("#### getGageData ####");
	    try {
	    	JSONObject data = statsService.getGageData(param);
	    	map.put("data", data.toMap());
	    } catch (Exception e) {
	        map.put("sError", "위젯 리스트를 가져올 수 없습니다");
	        System.out.println("sError" + e);
	    }
	    
	    return map;
	}	

	/**
	 * Pie 위젯 데이터 가져오기
	 * @param HashMap<String, Object> @return HashMap<String, Object>
	 */		
	@RequestMapping(value = "/getPieData")
	public @ResponseBody HashMap<String, Object> getPieData(@RequestBody HashMap<String, Object> param) throws Exception {
	    HashMap<String, Object> map = new HashMap<>();
	    System.out.println("#### getPieData ####");
	    try {
	    	JSONObject data = statsService.getPieData(param);
	    	map.put("data", data.toMap());
	    } catch (Exception e) {
	        map.put("sError", "위젯 리스트를 가져올 수 없습니다");
	        System.out.println("sError" + e);
	    }
	    
	    return map;
	}		
	
	/**
	 * Line 위젯 데이터 가져오기
	 * @param HashMap<String, Object> @return HashMap<String, Object>
	 */		
	@RequestMapping(value = "/getLineData")
	public @ResponseBody HashMap<String, Object> getLineData(@RequestBody HashMap<String, Object> param) throws Exception {
	    HashMap<String, Object> map = new HashMap<>();
	    System.out.println("#### getLineData ####");
	    try {
	    	JSONObject data = statsService.getLineData(param);
	    	map.put("data", data.toMap());
	    } catch (Exception e) {
	        map.put("sError", "위젯 리스트를 가져올 수 없습니다");
	        System.out.println("sError" + e);
	    }
	    
	    return map;
	}		
	
	/**
	 * Bar 위젯 데이터 가져오기
	 * @param HashMap<String, Object> @return HashMap<String, Object>
	 */		
	@RequestMapping(value = "/getBarData")
	public @ResponseBody HashMap<String, Object> getBarData(@RequestBody HashMap<String, Object> param) throws Exception {
	    HashMap<String, Object> map = new HashMap<>();
	    System.out.println("#### getBarData ####");
	    try {
	    	JSONObject data = statsService.getBarData(param);
	    	map.put("data", data.toMap());
	    } catch (Exception e) {
	        map.put("sError", "위젯 리스트를 가져올 수 없습니다");
	        System.out.println("sError" + e);
	    }
	    
	    return map;
	}		

	/**
	 * Bar 위젯 데이터 가져오기
	 * @param HashMap<String, Object> @return HashMap<String, Object>
	 */		
	@RequestMapping(value = "/getRadarData")
	public @ResponseBody HashMap<String, Object> getRadarData(@RequestBody HashMap<String, Object> param) throws Exception {
	    HashMap<String, Object> map = new HashMap<>();
	    System.out.println("#### getRadarData ####");
	    try {
	    	JSONObject data = statsService.getRadarData(param);
	    	map.put("data", data.toMap());
	    } catch (Exception e) {
	        map.put("sError", "위젯 리스트를 가져올 수 없습니다");
	        System.out.println("sError" + e);
	    }
	    
	    return map;
	}	
	
}
