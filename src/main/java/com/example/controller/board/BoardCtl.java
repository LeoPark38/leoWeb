package com.example.controller.board;

import java.util.ArrayList;
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

import com.example.controller.util.EsRest;


@RestController
@RequestMapping(value = "/board")
public class BoardCtl {

	private static String board_index = "leo_board";
	@Autowired
	private BoardService boardService;
	
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
	        JSONObject dataJo = boardService.getBoardList();

	        // 결과를 Map에 넣기
	        map.put("data", ((JSONObject) dataJo.get("data")).toMap());
	        map.put("recordsTotal", dataJo.get("recordsTotal"));
	        map.put("recordsFiltered", dataJo.get("recordsFiltered"));

	    } catch (Exception e) {
	        map.put("sError", "보드 리스트를 가져올 수 없습니다");
	        System.out.println("sError" + e);
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
			map = boardService.getRowBoard(param);
		} catch (Exception e) {
			map.put("sError", "보드 상세정보를 가져올 수 없습니다");
			System.out.println("sError"+e);
		}
		return map;
	}	
	
	/**
	 * 게시글  저장
	 * @param HashMap<String, Object> @return HashMap<String, Object>
	 */		
	@RequestMapping(value = "/saveBoard")
	public @ResponseBody HashMap<String, Object> saveBoard(@RequestBody HashMap<String, Object> param) throws Exception {
	    HashMap<String, Object> map = new HashMap<>();
	    System.out.println("#### saveBoard ####");
	    System.out.println("para : "+param);
	    try {
			// ins
			if(param.get("mode").equals("ins")) {
				map = boardService.saveBoard(param);
			// upd
			}else if(param.get("mode").equals("upd")){
				map = boardService.updateBoard(param);
			// del
			}else if(param.get("mode").equals("del")) {
				String id = param.get("_id").toString();
				map = boardService.deleteBoard(id);
			}

	    } catch (Exception e) {
	        map.put("sError", "보드 리스트를 가져올 수 없습니다");
	        System.out.println("sError" + e);
	    }
	    
	    return map;
	}	

	/**
	 * 댓글 저장
	 * @param HashMap<String, Object> @return HashMap<String, Object>
	 */	
	@RequestMapping(value = "/saveComment")
	public @ResponseBody HashMap<String, Object> saveComment(@RequestBody HashMap<String, Object> param) throws Exception {
	    HashMap<String, Object> map = new HashMap<>();
	    System.out.println("#### saveComment ####");
	    try {
			map = boardService.saveComment(param);
	    } catch (Exception e) {
	        map.put("sError", "댓글 정보를 가져올 수 없습니다");
	        System.out.println("sError" + e);
	    }
	    
	    return map;
	}	
	
	/**
	 * 댓글 불러오기
	 * @param HashMap<String, Object> @return HashMap<String, Object>
	 */	
	@RequestMapping(value = "/getComment")
	public @ResponseBody HashMap<String, Object> getComment(@RequestBody HashMap<String, Object> param) throws Exception {
	    HashMap<String, Object> map = new HashMap<>();
	    System.out.println("#### getComment ####");
	    try {
			map = boardService.getComment(param);
			map.put("sOk", "ok");
	    } catch (Exception e) {
	        map.put("sError", "댓글 정보를 가져올 수 없습니다");
	        System.out.println("sError" + e);
	    }
	    
	    return map;
	}
	
	/**
	 * 대댓글 저장
	 * @param HashMap<String, Object> @return HashMap<String, Object>
	 */	
	@RequestMapping(value = "/saveChildComment")
	public @ResponseBody HashMap<String, Object> saveChildComment(@RequestBody HashMap<String, Object> param) throws Exception {
	    HashMap<String, Object> map = new HashMap<>();
	    System.out.println("#### saveChildComment ####");
	    try {
			map = boardService.saveChildComment(param);
	    } catch (Exception e) {
	        map.put("sError", "댓글 정보를 가져올 수 없습니다");
	        System.out.println("sError" + e);
	    }
	    
	    return map;
	}	
	
	
	
	
	
	
}
