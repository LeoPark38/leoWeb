package com.example.controller.board;

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
	        JSONObject dataJo = boardService.getBoardList(param);
	        List<JSONObject> data2 = boardService.getSelectedAirQualityData();

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
			System.out.println("map : "+map);
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
	
	/**
	 * 게시글 조회수 업데이트
	 * @param HashMap<String, Object> @return HashMap<String, Object>
	 */	
	@RequestMapping(value = "/updateViewCnt")
	public @ResponseBody HashMap<String, Object> updateViewCnt(@RequestBody HashMap<String, Object> param) throws Exception {
	    HashMap<String, Object> map = new HashMap<>();
	    System.out.println("#### updateViewCnt ####");
	    try {
			map = boardService.updateViewCnt(param);
	    } catch (Exception e) {
	        map.put("sError", "댓글 정보를 가져올 수 없습니다");
	        System.out.println("sError" + e);
	    }
	    
	    return map;
	}		
	
	/**
	 * 게시글 좋아요 중복체크
	 * @param HashMap<String, Object> @return HashMap<String, Object>
	 */	
	@RequestMapping(value = "/LikeCheck")
	public @ResponseBody HashMap<String, Object> LikeCheck(@RequestBody HashMap<String, Object> param) throws Exception {
	    HashMap<String, Object> map = new HashMap<>();
	    System.out.println("#### LikeCheck ####");
	    try {
			map = boardService.LikeCheck(param);
	    } catch (Exception e) {
	        map.put("sError", "댓글 정보를 가져올 수 없습니다");
	        System.out.println("sError" + e);
	    }
	    
	    return map;
	}
	
	/**
	 * 게시글 좋아요 업데이트
	 * TODO 길이가 1만건 이상일시에는 leo_user인덱스에서 관리하는 좋아요값을 따로 인덱스를 빼야할 필요성이있다.
	 * @param HashMap<String, Object> @return HashMap<String, Object>
	 */	
	@RequestMapping(value = "/updateLike")
	public @ResponseBody HashMap<String, Object> updateLike(@RequestBody HashMap<String, Object> param) throws Exception {
	    HashMap<String, Object> map = new HashMap<>();
	    System.out.println("#### updateLike ####");
	    String type = (String) param.get("type");
	    try {
	    	if(type.equals("up")) {
				map = boardService.updateLikeUp(param);
	    	}else {
				map = boardService.updateLikeDown(param);
	    	}

	    } catch (Exception e) {
	        map.put("sError", "댓글 정보를 가져올 수 없습니다");
	        System.out.println("sError" + e);
	    }
	    
	    return map;
	}	
	
	/**
	 * 사용자의 좋아하는 게시글 리스트 가져오기
	 * @param HashMap<String, Object> @return HashMap<String, Object>
	 */	
	@RequestMapping(value = "/likedBoard")
	public @ResponseBody HashMap<String, Object> likedBoard(@RequestBody HashMap<String, Object> param) throws Exception {
	    HashMap<String, Object> map = new HashMap<>();
	    System.out.println("#### likedBoard ####");
	    String type = (String) param.get("type");
	    try {
	    	map = boardService.likedBoard(param);
	    } catch (Exception e) {
	        map.put("sError", "댓글 정보를 가져올 수 없습니다");
	        System.out.println("sError" + e);
	    }
	    
	    return map;
	}		
}
