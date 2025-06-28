package com.example.controller.board;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import javax.servlet.http.HttpSession;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import com.example.controller.util.CmnUt;
import com.example.controller.util.EsRest;

@Service
public class BoardService {
	
	private static String user_index = "leo_user";
	private static String board_index = "leo_board";
	private static String comment_index = "leo_comment";
	
	
	// 게시글 리스트
	public JSONObject getBoardList(HashMap<String, String> param) throws Exception {
	    EsRest es = new EsRest();
	    JSONObject dataList = new JSONObject();
	    Integer totalCount = 0;
	    JSONObject commentCntAggs = new JSONObject();

	    try {
	        // 1. 검색용 쿼리
	    	StringBuilder searchBody = new StringBuilder();
	    	searchBody.append("{");
	    	searchBody.append("\"size\": 1000,");
	    	searchBody.append("\"query\": {\"bool\": {\"filter\": [");
	    	searchBody.append("{\"term\": {\"BOARD_STATUS\": \"ACTIVE\"}}");

	    	String type = param.get("boardType") != null ? param.get("boardType").toString() : "";
	    	if (!type.equals("") && !type.equals("전체")) {
	    	    searchBody.append(", {\"term\": {\"BOARD_TYPE\": \"" + type + "\"}}");
	    	}
	    	String text = param.get("boardText") != null ? param.get("boardText").toString() : "";
	    	if (!text.equals("")) {
	    	    searchBody.append(", {\"wildcard\": {\"BOARD_TITLE\": {\"value\": \"*" + text + "*\"}}}");
	    	}
	    	// 👉 likeOnly가 true일 때만 BOARD_SEQ terms 필터 추가
	    	String likeOnly = param.get("likeOnly");
	    	String likedBoardList = param.get("likedBoardList");
	    	if ("true".equals(likeOnly) && likedBoardList != null && !likedBoardList.isEmpty()) {
	    	    JSONArray arr = new JSONArray(likedBoardList); // JSON 배열로 파싱
	    	    searchBody.append(", {\"terms\": {\"BOARD_SEQ\": ").append(arr.toString()).append("}}");
	    	}

	    	searchBody.append("]}}");
	    	searchBody.append("}");

	        // 2. 카운트용 쿼리
	        StringBuilder countBody = new StringBuilder();
	        countBody.append("{");
	        countBody.append("\"query\": {\"bool\": {\"filter\": [");
	        countBody.append("{\"term\": {\"BOARD_STATUS\": \"ACTIVE\"}}");
	        countBody.append("]}}");
	        countBody.append("}");
	        
	        // 3. 댓글 집계 쿼리
	        StringBuilder commentCntaggs = new StringBuilder();
	        commentCntaggs.append("{");
	        commentCntaggs.append("\"size\": 0,");
	        commentCntaggs.append("\"aggs\": {");
	        commentCntaggs.append("  \"comments\": {");
	        commentCntaggs.append("    \"terms\": {");
	        commentCntaggs.append("      \"field\": \"COMMENT_BOARD_ID\",");
	        commentCntaggs.append("      \"size\": 1000");
	        commentCntaggs.append("    }");
	        commentCntaggs.append("  }");
	        commentCntaggs.append("}");
	        commentCntaggs.append("}");
	        //System.out.println("@searchBody : "+searchBody);
	        // 게시글 리스트 가져오기
	        dataList = es.searchByBody(board_index, new JSONObject(searchBody.toString()));
	        //System.out.println("@dataList 1: "+dataList);
	        // 게시글 카운트 가져오기
	        totalCount = es.count(board_index, null, countBody);
	        // 댓글 집계 쿼리 
	        commentCntAggs = es.searchByBody(comment_index, new JSONObject(commentCntaggs.toString()));	        

	        // 게시글 리스트당 댓글 집계 추가
	        JSONArray boardHits = dataList.getJSONObject("hits").getJSONArray("hits");
	        Map<String, Integer> commentCountMap = new HashMap<>();
	        JSONArray buckets = commentCntAggs.getJSONObject("aggregations").getJSONObject("comments").getJSONArray("buckets");
	        for (int i = 0; i < buckets.length(); i++) {
	            JSONObject bucket = buckets.getJSONObject(i);
	            String key = bucket.getString("key"); // BOARD_SEQ
	            int count = bucket.getInt("doc_count");
	            commentCountMap.put(key, count);
	        }
	        for (int i = 0; i < boardHits.length(); i++) {
	            JSONObject hit = boardHits.getJSONObject(i);
	            JSONObject source = hit.getJSONObject("_source");

	            String boardSeq = source.get("BOARD_SEQ").toString(); // key 일치 위해 문자열로
	            int commentCount = commentCountMap.getOrDefault(boardSeq, 0);

	            source.put("COMMENT_COUNT", commentCount);
	        }
	        
	        // 결과를 합쳐서 반환
	        JSONObject result = new JSONObject();
	        //System.out.println("@dataList 2: "+dataList);
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
		HashMap<String, Object> map = new HashMap<String, Object>();
		String userId = (String) param.get("userId");
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
        JSONObject hitsObj = seqResult.optJSONObject("hits");
        JSONArray hits = null;
        if (hitsObj != null && hitsObj.has("hits")) {
            hits = hitsObj.getJSONArray("hits");
        }

        int nextBoardSeq = 1;
        if (hits != null && hits.length() > 0) {
            JSONObject firstHit = hits.getJSONObject(0);
            JSONObject source = firstHit.getJSONObject("_source");
            nextBoardSeq = source.getInt("BOARD_SEQ") + 1;
        }
        String documentId = String.valueOf(nextBoardSeq);

        String original = param.get("BOARD_CONTENT").toString();// ex: "한 줄\n두 줄"
        String sanitized = CmnUt.escapeHtml(original).replace("\n", "\\\\n");

        // 2. 새 게시글 데이터 구성
        boardData.put("BOARD_TITLE", param.get("BOARD_TITLE"));
        boardData.put("BOARD_TYPE", param.get("BOARD_TYPE"));
        boardData.put("BOARD_CONTENT", sanitized);
        boardData.put("BOARD_USER_ID", userId);  // TODO: 로그인 사용자로 변경
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
 
    // 보드 업데이트
    public HashMap<String, Object> updateBoard(HashMap<String, Object> param) throws Exception {
        HashMap<String, Object> result = new HashMap<>();
        HashMap<String, Object> boardData = new HashMap<>();
        EsRest es = new EsRest();
        Date now = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ssZ");
        String id = (String) param.get("_id");

        String original = param.get("BOARD_CONTENT").toString();  // ex: "한 줄\n두 줄"
        String escaped = CmnUt.escapeHtml(original).replace("\n", "\\\\n");    // → "한 줄\\n두 줄"
  
        
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
        System.out.println("id : "+id);
        System.out.println("boardData : "+boardData);
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
        String userId = (String) param.get("userId");
        
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

        String original = param.get("comment").toString();// ex: "한 줄\n두 줄"
        String sanitized = CmnUt.escapeHtml(original).replace("\n", "\\\\n");
        
        // 2. 데이터 셋팅
        boardData.put("COMMENT_ID", nextCommentID);
        boardData.put("COMMENT_CONTENT", sanitized);
        boardData.put("COMMENT_USER_ID", userId);
        boardData.put("COMMENT_BOARD_ID", id);
        boardData.put("COMMENT_MK_DT", formatter.format(now));
        boardData.put("COMMENT_UPD_DT", formatter.format(now));
        boardData.put("COMMENT_STATUS", "ACTIVE");
        boardData.put("COMMENT_LIKE_CNT", 0);
        boardData.put("COMMENT_PARENT_ID", "");
        
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
        
        String id = (String) param.get("_id");
        String userId = (String) param.get("userId");
        
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
        
        String original = param.get("comment").toString();// ex: "한 줄\n두 줄"
        String sanitized = CmnUt.escapeHtml(original).replace("\n", "\\\\n");
        
        // 2. 데이터 셋팅
        boardData.put("COMMENT_ID", nextCommentID);
        boardData.put("COMMENT_CONTENT", sanitized);
        boardData.put("COMMENT_USER_ID", userId);
        boardData.put("COMMENT_BOARD_ID", id);
        boardData.put("COMMENT_MK_DT", formatter.format(now));
        boardData.put("COMMENT_UPD_DT", formatter.format(now));
        boardData.put("COMMENT_STATUS", "ACTIVE");
        boardData.put("COMMENT_LIKE_CNT", 0);
        boardData.put("COMMENT_PARENT_ID", param.get("parentId"));

        es.update(comment_index + "/_doc", documentId, boardData);

        result.put("sOk", "ok");
        return result;
    }    
    
    // 조회수 업데이트 
    public HashMap<String, Object> updateViewCnt(HashMap<String, Object> param) throws Exception {
        HashMap<String, Object> result = new HashMap<>();
        HashMap<String, Object> boardData = new HashMap<>();
        JSONObject docData = new JSONObject();
        EsRest es = new EsRest();

        String id = (String) param.get("_id");
        try {
            // 1. 현재 게시글 조회수 조회
    		List<String> column_list = new ArrayList<String>();
    		column_list.add("BOARD_VIEW_CNT");

            JSONObject seqResult = es.row(board_index, id, column_list);
            JSONObject _source = seqResult.getJSONObject("_source");
  
            int cnt = _source.getInt("BOARD_VIEW_CNT");
     
            // 2. 데이터 셋팅
            docData.put("BOARD_VIEW_CNT", cnt+1);

    		es.updateDoc(board_index, id, docData);   
    		result.put("sOk", "ok");
        }catch (Exception e) {
        	System.out.println("[e] : "+e);
        	result.put("sOk", "no");
		}

        
        return result;
    }  

    // 게시글 좋아요 체크 관련
    public HashMap<String, Object> LikeCheck(HashMap<String, Object> param) throws Exception {
        HashMap<String, Object> result = new HashMap<>();
        EsRest es = new EsRest();
        String user_id = "";
        String board_id = "";
        try {
            user_id = (String) param.get("userId");
            board_id = (String) param.get("_id");
            
            StringBuilder sb = new StringBuilder();
            sb.append("{");
            sb.append("\"query\": {");
            sb.append("\"bool\": {");
            sb.append("\"must\": [");
            sb.append("{ \"term\": { \"_id\": \"" + user_id + "\" } },");
            sb.append("{ \"term\": { \"USER_LIKE_BOARD\": \"" + board_id + "\" } }");
            sb.append("]");
            sb.append("}");
            sb.append("}");
            sb.append("}");
            
            Integer LikeCheck = es.count(user_index, null, sb);

            result.put("cnt", LikeCheck);
    		result.put("sOk", "ok");
        }catch (Exception e) {
        	System.out.println("[e] : "+e);
        	result.put("sOk", "no");
		}

        return result;
    }  
    
    // 게시글 좋아요 UP 관련
    public HashMap<String, Object> updateLikeUp(HashMap<String, Object> param) throws Exception {
        HashMap<String, Object> result = new HashMap<>();
        JSONObject docData = new JSONObject();
        EsRest es = new EsRest();
        String user_id = "";
        String board_id = "";
        try {
            user_id = (String) param.get("userId");
            board_id = (String) param.get("_id");
            
            // 사용자에 좋아요한 게시글 아이디 추가
        	String script = ""
        	    + "if (ctx._source.USER_LIKE_BOARD == null) { "
        	    + "  ctx._source.USER_LIKE_BOARD = [params.boardId]; "
        	    + "} else if (!ctx._source.USER_LIKE_BOARD.contains(params.boardId)) { "
        	    + "  ctx._source.USER_LIKE_BOARD.add(params.boardId); "
        	    + "}";

        	Map<String, Object> params = new HashMap<>();
        	params.put("boardId", board_id);

        	es.updateScript(user_index, user_id, script, params);  
        	
            // 해당 게시글에 좋아요 카운트 up
    		List<String> column_list = new ArrayList<String>();
    		column_list.add("BOARD_LIKE_CNT");

            JSONObject seqResult = es.row(board_index, board_id, column_list);
            JSONObject _source = seqResult.getJSONObject("_source");

            int cnt = _source.getInt("BOARD_LIKE_CNT");

            docData.put("BOARD_LIKE_CNT", cnt+1);

    		es.updateDoc(board_index, board_id, docData);         	
   	
        	
    		result.put("sOk", "ok");
        }catch (Exception e) {
        	System.out.println("[e] : "+e);
        	result.put("sOk", "no");
		}

        return result;
    }  	
    
    // 게시글 좋아요 Down 관련
    public HashMap<String, Object> updateLikeDown(HashMap<String, Object> param) throws Exception {
        HashMap<String, Object> result = new HashMap<>();
        JSONObject docData = new JSONObject();
        EsRest es = new EsRest();
        String user_id = "";
        String board_id = "";
        try {
            user_id = (String) param.get("userId");
            board_id = (String) param.get("_id");
            
         // 사용자에 좋아요한 게시글 아이디 제거
            String script = ""
            	    + "if (ctx._source.USER_LIKE_BOARD != null) { "
            	    + "ctx._source.USER_LIKE_BOARD.removeIf(item -> item.equals(params.boardId)); "
            	    + "}";

        	Map<String, Object> params = new HashMap<>();
        	params.put("boardId", board_id);

            // 해당 게시글에 좋아요 카운트 down
    		List<String> column_list = new ArrayList<String>();
    		column_list.add("BOARD_LIKE_CNT");

            JSONObject seqResult = es.row(board_index, board_id, column_list);
            JSONObject _source = seqResult.getJSONObject("_source");
            
            int cnt = _source.getInt("BOARD_LIKE_CNT");

            docData.put("BOARD_LIKE_CNT", cnt-1);

    		es.updateDoc(board_index, board_id, docData);    
        	
        	

        	es.updateScript(user_index, user_id, script, params);  
    		result.put("sOk", "ok");
        }catch (Exception e) {
        	System.out.println("[e] : "+e);
        	result.put("sOk", "no");
		}

        return result;
    }      
    
    // 사용자의 좋아요 리스트
    public HashMap<String, Object> likedBoard(HashMap<String, Object> param) throws Exception {
        HashMap<String, Object> result = new HashMap<>();
        JSONObject job = new JSONObject();
        EsRest es = new EsRest();
        String user_id = "";
        try {
            user_id = (String) param.get("userId");
    		List<String> column_list = new ArrayList<String>();
    		column_list.add("USER_LIKE_BOARD");

    		job = es.row(user_index, user_id, column_list);
    		
    		result.put("data", job.toMap());
    		result.put("sOk", "ok");
        }catch (Exception e) {
        	System.out.println("[e] : "+e);
        	result.put("sOk", "no");
		}

        return result;
    }   
    
    public List<JSONObject> getSelectedAirQualityData() throws Exception {
        String serviceKey = "7H53BDkZckVrpi+EW04DXSB/js8S1PmGlJcVC+rezSi45FmMfPfXhFqwx9XiKNn7+89PaqDADyTNezWfGc02Yg==";
        String baseUrl = "https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty";
        String sidoName = URLEncoder.encode("서울", "UTF-8");
        EsRest es = new EsRest();
        String urlStr = baseUrl
                + "?serviceKey=" + URLEncoder.encode(serviceKey, "UTF-8")
                + "&returnType=json"
                + "&numOfRows=100"
                + "&pageNo=1"
                + "&sidoName=" + sidoName
                + "&ver=1.0";

        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");

        if (conn.getResponseCode() == 200) {
            BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                response.append(line);
            }
            br.close();
            JSONObject json = new JSONObject(response.toString());
            JSONArray items = json.getJSONObject("response")
                                  .getJSONObject("body")
                                  .getJSONArray("items");

            // ✅ 대표 구 목록
            Set<String> selectedGuSet = new HashSet<>(Arrays.asList(
            		"강남구", "서초구", "송파구", "강서구", "강북구", "종로구", "중구", "영등포구", "노원구", "도봉구", "강동구"
            ));

            // ✅ 결과 저장 리스트
            List<JSONObject> result = new ArrayList<>();

            for (int i = 0; i < items.length(); i++) {
                JSONObject station = items.getJSONObject(i);
                String name = station.getString("stationName");

                if (selectedGuSet.contains(name)) {
                    DateTimeFormatter inputFormat = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

                    // ② LocalDateTime으로 파싱
                    LocalDateTime ldt = LocalDateTime.parse(station.getString("dataTime"), inputFormat);

                    // ③ 서울 시간대로 ZonedDateTime으로 변환
                    ZonedDateTime zdt = ldt.atZone(ZoneId.of("Asia/Seoul"));

                    // ④ 원하는 출력 형식 (초 + 타임존 오프셋 포함)
                    DateTimeFormatter outputFormat = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ssZ");

                    // ⑤ 최종 문자열
                    String date = zdt.format(outputFormat);
                    
                    // 필수 값만 추출하여 새로운 JSONObject 구성 (선택)
                    JSONObject simplified = new JSONObject();
                    simplified.put("stationName", name);
                    simplified.put("dataTime", date);
                    simplified.put("pm10Value", station.optString("pm10Value", "-")); // 미세먼지
                    simplified.put("pm10Grade", station.optString("pm10Value", "-")); 
                    simplified.put("pm10Flag", station.optString("pm10Flag", "-")); 
                    simplified.put("pm25Value", station.optString("pm25Value", "-")); // 초미세먼지
                    simplified.put("pm25Grade", station.optString("pm25Value", "-")); 
                    simplified.put("pm25Flag", station.optString("pm25Flag", "-")); 
                    simplified.put("o3Value", station.optString("o3Value", "-")); // 오존
                    simplified.put("o3Grade", station.optString("o3Grade", "-"));
                    simplified.put("o3Flag", station.optString("o3Flag", "-"));
                    simplified.put("khaiValue", station.optString("khaiValue", "-"));
                    simplified.put("khaiGrade", station.optString("khaiGrade", "-"));

                    result.add(simplified);
                    //es.insert("leo_air_data", null, simplified);
                }
            }
            return result;
        } else {
            throw new RuntimeException("API 요청 실패: " + conn.getResponseCode());
        }
    }
  
    // 댓글 삭제
    public HashMap<String, Object> deleteComment(String id) throws Exception {
    	EsRest esRest = new EsRest();
    	HashMap<String, Object> map = new HashMap<>();
    	 System.out.println("##@@ deleteComment ##@@");
        try {
        	//해당 댓글 삭제
        	esRest.delete(comment_index, id);
        	
            StringBuilder sb = new StringBuilder();
            sb.append("{");
            sb.append("\"query\": {");
            sb.append("\"match\": {");
            sb.append(" \"COMMENT_PARENT_ID\": \"" + id + "\" ");
            sb.append("}");
            sb.append("}");
            sb.append("}");
        	System.out.println("sb : "+sb);
        	//해당 댓글의 대댓글 삭제
        	esRest.deleteByQuery(comment_index, sb);

        	map.put("sOk", "ok");
        } catch (Exception e) {
            map.put("sError", "삭제에 실패하였습니다.");
        }

        return map;
    }  
    
}
