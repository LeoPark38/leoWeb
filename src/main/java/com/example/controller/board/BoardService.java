package com.example.controller.board;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import com.example.controller.util.CmnUt;
import com.example.controller.util.EsRest;

@Service
public class BoardService {
	
	private static String board_index = "leo_board";
	private static String comment_index = "leo_comment";
	
	
	// 사용자 리스트
	public JSONObject getBoardList() throws Exception {
	    EsRest esRest = new EsRest();
	    JSONObject dataList = new JSONObject();
	    Integer totalCount = 0;

	    try {
	        // 1. 검색용 쿼리
	        StringBuilder searchBody = new StringBuilder();
	        searchBody.append("{");
	        searchBody.append("\"size\": 1000,");
	        searchBody.append("\"query\": {\"bool\": {\"filter\": [");
	        searchBody.append("{\"term\": {\"BOARD_STATUS\": \"ACTIVE\"}}");
	        searchBody.append("]}}");
	        searchBody.append("}");
	        // 2. 카운트용 쿼리
	        StringBuilder countBody = new StringBuilder();
	        countBody.append("{");
	        countBody.append("\"query\": {\"bool\": {\"filter\": [");
	        countBody.append("{\"term\": {\"BOARD_STATUS\": \"ACTIVE\"}}");
	        countBody.append("]}}");
	        countBody.append("}");
	        
	        // 사용자 리스트 가져오기
	        dataList = esRest.searchByBody(board_index, new JSONObject(searchBody.toString()));

	        // 사용자 카운트 가져오기
	        totalCount = esRest.count(board_index, null, countBody);

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
	
// 보드 가져오기
    public HashMap<String, Object> getRowBoard(HashMap<String, String> param) throws Exception {
        HashMap<String, Object> map = new HashMap<>();
        EsRest es = new EsRest();
        // 컬럼 리스트 정의
        List<String> column_list = new ArrayList<>();
        column_list.add("BOARD_TYPE");
        column_list.add("BOARD_TITLE");
        column_list.add("BOARD_CONTENT");
        column_list.add("BOARD_USER_ID");
        column_list.add("BOARD_STATUS");
        //column_list.add("BOARD_CATEGORY");
        column_list.add("BOARD_VIEW_CNT");
        column_list.add("BOARD_LIKE_CNT");
        column_list.add("BOARD_MK_DT");
        column_list.add("BOARD_UPD_DT");
        //column_list.add("BOARD_ALARM");
        column_list.add("BOARD_SEQ");

        try {
            // Elasticsearch에서 사용자 데이터 가져오기
            JSONObject job = es.row(board_index, param.get("_id"), column_list);
            map.put("row", job.toMap());
        } catch (Exception e) {
            map.put("sError", "사용자 상세정보를 가져올 수 없습니다");
            throw new Exception("Elasticsearch 호출 오류", e);
        }

        return map;
    }	

 // 보드 저장  
    public HashMap<String, Object> saveBoard(HashMap<String, Object> param) throws Exception {
        HashMap<String, Object> result = new HashMap<>();
        HashMap<String, Object> boardData = new HashMap<>();
        EsRest es = new EsRest();
        Date now = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ssZ");
        
        // 1. 현재 가장 큰 BOARD_SEQ 조회
		List<String> column_list = new ArrayList<String>();
		column_list.add("BOARD_SEQ");
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\"size\":1,");
        sb.append("\"query\":{\"match_all\":{}},");
        sb.append("\"sort\":[{\"BOARD_SEQ\":{\"order\":\"desc\"}}]");
        sb.append("}");
        
        JSONObject seqResult = es.searchBody(board_index, sb, column_list);
        
        int nextBoardSeq = 1; // 기본값
        JSONArray hits = seqResult.getJSONObject("hits").getJSONArray("hits");
        if (hits.length() > 0) {
            JSONObject firstHit = hits.getJSONObject(0);
            JSONObject source = firstHit.getJSONObject("_source");
            nextBoardSeq = source.getInt("BOARD_SEQ") + 1;
        }
        String documentId = String.valueOf(nextBoardSeq);

        String original = param.get("BOARD_CONTENT").toString();  // ex: "한 줄\n두 줄"
        String escaped = original.replace("\n", "\\\\n");    // → "한 줄\\n두 줄"
        
        // 2. 새 게시글 데이터 구성
        boardData.put("BOARD_TITLE", param.get("BOARD_TITLE"));
        boardData.put("BOARD_TYPE", param.get("BOARD_TYPE"));
        boardData.put("BOARD_CONTENT", escaped);
        boardData.put("BOARD_USER_ID", "testUser01");  // TODO: 로그인 사용자로 변경
        boardData.put("BOARD_STATUS", "ACTIVE");
        boardData.put("BOARD_VIEW_CNT", 0);
        boardData.put("BOARD_LIKE_CNT", 0);
        boardData.put("BOARD_MK_DT", formatter.format(now));
        boardData.put("BOARD_UPD_DT", formatter.format(now));
        boardData.put("BOARD_SEQ", nextBoardSeq);
        // TODO: BOARD_CATEGORY, BOARD_ALARM 같은 필드도 필요시 추가

        // 3. Elasticsearch 저장
        es.update(board_index + "/_doc", documentId, boardData);

        result.put("sOk", "ok");
        return result;
    }
   
    // 보드 삭제
    public HashMap<String, Object> deleteBoard(String id) throws Exception {
    	EsRest esRest = new EsRest();
    	HashMap<String, Object> map = new HashMap<>();
        try {
        	esRest.delete(board_index, id);
        	map.put("sOk", "ok");
        } catch (Exception e) {
            map.put("sError", "삭제에 실패하였습니다.");
        }

        return map;
    }    
 
    // 보드 저장  
    public HashMap<String, Object> updateBoard(HashMap<String, Object> param) throws Exception {
        HashMap<String, Object> result = new HashMap<>();
        HashMap<String, Object> boardData = new HashMap<>();
        EsRest es = new EsRest();
        Date now = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ssZ");
        String id = (String) param.get("_id");

        String original = param.get("BOARD_CONTENT").toString();  // ex: "한 줄\n두 줄"
        String escaped = original.replace("\n", "\\\\n");    // → "한 줄\\n두 줄"
  
        
        boardData.put("BOARD_TITLE", param.get("BOARD_TITLE"));
        boardData.put("BOARD_TYPE", param.get("BOARD_TYPE"));
        boardData.put("BOARD_CONTENT", escaped);
        boardData.put("BOARD_USER_ID", param.get("BOARD_USER_ID"));  // TODO: 로그인 사용자로 변경
        boardData.put("BOARD_STATUS", param.get("BOARD_STATUS"));
        boardData.put("BOARD_VIEW_CNT", param.get("BOARD_VIEW_CNT"));
        boardData.put("BOARD_LIKE_CNT", param.get("BOARD_LIKE_CNT"));
        boardData.put("BOARD_MK_DT", param.get("BOARD_MK_DT"));
        boardData.put("BOARD_UPD_DT", formatter.format(now));
        boardData.put("BOARD_SEQ", param.get("BOARD_SEQ"));
        // TODO: BOARD_CATEGORY, BOARD_ALARM 같은 필드도 필요시 추가

        es.update(board_index + "/_doc", id, boardData);

        result.put("sOk", "ok");
        return result;
    }
    
    // 댓글 저장  
    public HashMap<String, Object> saveComment(HashMap<String, Object> param) throws Exception {
        HashMap<String, Object> result = new HashMap<>();
        HashMap<String, Object> boardData = new HashMap<>();
        EsRest es = new EsRest();
        Date now = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ssZ");
        String id = (String) param.get("_id");
        
        // 1. 현재 가장 큰 comment ID 조회
		List<String> column_list = new ArrayList<String>();
		column_list.add("COMMENT_ID");
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\"size\":1,");
        sb.append("\"query\":{\"match_all\":{}},");
        sb.append("\"sort\":[{\"COMMENT_ID\":{\"order\":\"desc\"}}]");
        sb.append("}");
        
        JSONObject seqResult = es.searchBody(comment_index, sb, column_list);
        JSONArray hits = seqResult.getJSONObject("hits").optJSONArray("hits");
        if (hits == null) hits = new JSONArray();

        int nextCommentID = 1;
        if (hits.length() > 0) {
            JSONObject firstHit = hits.getJSONObject(0);
            JSONObject source = firstHit.getJSONObject("_source");
            String commentIdStr = source.getString("COMMENT_ID"); 
            nextCommentID = Integer.parseInt(commentIdStr) + 1;
        }
        String documentId = String.valueOf(nextCommentID);

        String original = param.get("comment").toString();  // ex: "한 줄\n두 줄"
        String escaped = original.replace("\n", "\\\\n");    // → "한 줄\\n두 줄"

        // 2. 데이터 셋팅
        boardData.put("COMMENT_ID", nextCommentID);
        boardData.put("COMMENT_CONTENT", escaped);
        boardData.put("COMMENT_USER_ID", "testUser01");
        boardData.put("COMMENT_BOARD_ID", id);
        boardData.put("COMMENT_MK_DT", formatter.format(now));
        boardData.put("COMMENT_UPD_DT", formatter.format(now));
        boardData.put("COMMENT_STATUS", "ACTIVE");
        boardData.put("COMMENT_LIKE_CNT", 0);
        boardData.put("COMMENT_PARENT_ID", "");
        System.out.println("param : "+param);
        es.update(comment_index + "/_doc", documentId, boardData);

        result.put("sOk", "ok");
        return result;
    }    
    // 댓글 가져오기
    public HashMap<String, Object> getComment(HashMap<String, Object> param) throws Exception {
        HashMap<String, Object> map = new HashMap<>();
        EsRest es = new EsRest();
        String id = param.get("_id").toString();
        
        // 날릴 쿼리
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\"size\":1000,");
        sb.append("\"query\":{\"term\":{\"COMMENT_BOARD_ID\":{\"value\":\"").append(id).append("\"}}},");
        sb.append("\"sort\":[{\"COMMENT_MK_DT\":{\"order\":\"asc\"}}]");
        sb.append("}");

        // 컬럼 리스트 정의
        List<String> column_list = new ArrayList<>();
        column_list.add("COMMENT_ID");
        column_list.add("COMMENT_CONTENT");
        column_list.add("COMMENT_USER_ID");
        column_list.add("COMMENT_BOARD_ID");
        column_list.add("COMMENT_MK_DT");
        column_list.add("COMMENT_UPD_DT");
        column_list.add("COMMENT_STATUS");
        column_list.add("COMMENT_LIKE_CNT");
        column_list.add("COMMENT_PARENT_ID");

        try {
            // Elasticsearch에서 사용자 데이터 가져오기
            JSONObject job = es.searchBody(comment_index, sb, column_list);
            map.put("row", job.toMap());
        } catch (Exception e) {
            map.put("sError", "사용자 상세정보를 가져올 수 없습니다");
            throw new Exception("Elasticsearch 호출 오류", e);
        }

        return map;
    }	
 
    // 대댓글 저장  
    public HashMap<String, Object> saveChildComment(HashMap<String, Object> param) throws Exception {
        HashMap<String, Object> result = new HashMap<>();
        HashMap<String, Object> boardData = new HashMap<>();
        EsRest es = new EsRest();
        Date now = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ssZ");
        System.out.println("param : "+param);
        String id = (String) param.get("_id");
        
        // 1. 현재 가장 큰 comment ID 조회
		List<String> column_list = new ArrayList<String>();
		column_list.add("COMMENT_ID");
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\"size\":1,");
        sb.append("\"query\":{\"match_all\":{}},");
        sb.append("\"sort\":[{\"COMMENT_ID\":{\"order\":\"desc\"}}]");
        sb.append("}");
        
        JSONObject seqResult = es.searchBody(comment_index, sb, column_list);
        JSONArray hits = seqResult.getJSONObject("hits").optJSONArray("hits");
        if (hits == null) hits = new JSONArray();
        System.out.println("seqResult : "+seqResult);
        int nextCommentID = 1;
        if (hits.length() > 0) {
            JSONObject firstHit = hits.getJSONObject(0);
            JSONObject source = firstHit.getJSONObject("_source");
            String commentIdStr = source.getString("COMMENT_ID"); 
            nextCommentID = Integer.parseInt(commentIdStr) + 1;
        }
        String documentId = String.valueOf(nextCommentID);
        
        String original = param.get("comment").toString();  // ex: "한 줄\n두 줄"
        String escaped = original.replace("\n", "\\\\n");    // → "한 줄\\n두 줄"

        // 2. 데이터 셋팅
        boardData.put("COMMENT_ID", nextCommentID);
        boardData.put("COMMENT_CONTENT", escaped);
        boardData.put("COMMENT_USER_ID", "testUser01");
        boardData.put("COMMENT_BOARD_ID", id);
        boardData.put("COMMENT_MK_DT", formatter.format(now));
        boardData.put("COMMENT_UPD_DT", formatter.format(now));
        boardData.put("COMMENT_STATUS", "ACTIVE");
        boardData.put("COMMENT_LIKE_CNT", 0);
        boardData.put("COMMENT_PARENT_ID", param.get("parentId"));
        System.out.println("param : "+param);
        es.update(comment_index + "/_doc", documentId, boardData);

        result.put("sOk", "ok");
        return result;
    }    
    

	
}
