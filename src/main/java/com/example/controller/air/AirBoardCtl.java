package com.example.controller.air;

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
@RequestMapping(value = "/airboard")
public class AirBoardCtl {

	@Autowired
	private AirBoardService airService;
	
	/**
	 * 게시글 불러오기
	 * @param HashMap<String, String> @return HashMap<String, Object>
	 */		
	@RequestMapping(value = "/getBoardList")
	public @ResponseBody HashMap<String, Object> getListUser(@RequestParam HashMap<String, String> param) throws Exception {
	    HashMap<String, Object> map = new HashMap<>();
	    System.out.println("#### getBoardList ####");
	    try {
	        // Elasticsearch 쿼리 결과 가져오기
	        JSONObject dataJo = airService.getBoardList(param);

	        // 결과를 Map에 넣기
	        map.put("data", ((JSONObject) dataJo.get("data")).toMap());
	        map.put("recordsTotal", dataJo.get("recordsTotal"));
	        map.put("recordsFiltered", dataJo.get("recordsFiltered"));

	    } catch (Exception e) {
	        map.put("sError", "보드 리스트를 가져올 수 없습니다");
	        System.out.println("[e] :" + e);
	    }
	    
	    return map;
	}
	
	/**
	 * 단일 게시글 불러오기
	 * @param HashMap<String, String> @return HashMap<String, Object>
	 */			
	@PostMapping("/getRowBoard")
	public @ResponseBody HashMap<String, Object> getRowUser(@RequestBody HashMap<String, String> param)
			throws Exception {
		System.out.println("#### getRowBoard ####");
		HashMap<String, Object> map = new HashMap();
		try {
			map = airService.getRowBoard(param);
		} catch (Exception e) {
			map.put("sError", "보드 상세정보를 가져올 수 없습니다");
			System.out.println("[e] :"+e);
		}
		return map;
	}	
	
	
	
}
