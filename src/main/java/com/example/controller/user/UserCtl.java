package com.example.controller.user;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.controller.util.EsRest;
import com.example.controller.util.ExcelUt;

@RestController
@RequestMapping(value = "/user")
public class UserCtl  {

	private static String user_index = "leo_user";
	@Autowired
	private UserService userService;


	/**
	 * 사용자 리스트를 가지고옴
	 *
	 * @param HashMap<String, String>
	 * @return HashMap<String, Object>
	 */
	@RequestMapping(value = "/getListUser")
	public @ResponseBody HashMap<String, Object> getListUser(@RequestParam HashMap<String, String> param) throws Exception {
	    HashMap<String, Object> map = new HashMap<>();
	    System.out.println("#### getListUser ####");
	    
	    try {
	        // Elasticsearch 쿼리 결과 가져오기
	        JSONObject dataJo = userService.getUserList();

	        // 결과를 Map에 넣기
	        map.put("data", ((JSONObject) dataJo.get("data")).toMap());
	        map.put("recordsTotal", dataJo.get("recordsTotal"));
	        map.put("recordsFiltered", dataJo.get("recordsFiltered"));

	    } catch (Exception e) {
	        map.put("sError", "사용자 리스트를 가져올 수 없습니다");
	        System.out.println("sError" + e);
	    }
	    
	    return map;
	}



	/**
	 * 한 사용자의 정보를 가져옴
	 *
	 * @param HashMap<String, String>
	 * @return HashMap<String, Object>
	 */
	@PostMapping("/getRowUser")
	public @ResponseBody HashMap<String, Object> getRowUser(@RequestBody HashMap<String, String> param)
			throws Exception {
		System.out.println("#### getRowUser ####");
		HashMap<String, Object> map = new HashMap();
		try {
			map = userService.getRowUser(param);
		} catch (Exception e) {
			map.put("sError", "사용자 상세정보를 가져올 수 없습니다");
			System.out.println("sError"+e);
		}
		return map;
	}

	/**
	 * 사용자 등록, 수정
	 *
	 * @param HashMap<String, Object>
	 * @return HashMap<String, Object>
	 */
	@RequestMapping(method = RequestMethod.POST, value = "/saveUser")
	public @ResponseBody HashMap<String, Object> saveUser(HttpSession session,@RequestBody HashMap<String, Object> param) throws Exception {
		HashMap<String, Object> map = new HashMap();
		System.out.println("## saveUser ##");
		try {
			// ins
			if(param.get("mode").equals("ins")) {
				String idDoubleCheck = userService.checkUserId(param.get("USER_ID").toString());
				// 중복체크후 다시 아이디 바꿔서 저장하는 경우 대비.
				if (idDoubleCheck == "Y") {
					map = userService.saveUser(param);
				} else {
					map.put("sError", "이미 등록되어 있는 사용자ID 입니다. \n다시 작성해 주시기 바랍니다.");
					map.put("sOk", "no");
				}
				
			// upd
			}else if(param.get("mode").equals("upd")){
				String passCheck = userService.checkUserPass(param);
				
				// 중복체크후 다시 아이디 바꿔서 저장하는 경우 대비.
				if (passCheck == "Y") {
					map = userService.saveUser(param);
				} else {
					map.put("sError", "비밀번호가 같지 않습니다.");
					map.put("sOk", "no");
				}
				
			// del
			}else if(param.get("mode").equals("del")) {
				String id = param.get("_id").toString();
				map = userService.deleteUser(id);
			}
			
		} catch (Exception e) {
			map.put("sError", "사용자를 저장할수 없습니다.");
			System.out.println("sError"+e);
		}

		return map;
	}

	/**
	 * 사용자 등록 시 ID중복확인
	 *
	 * @param HashMap<String, String>
	 * @return HashMap<String, Object>
	 */
	@RequestMapping(method = RequestMethod.POST, value = "/getRowIdCheck")
	public @ResponseBody HashMap<String, Object> getRowIdCheck(@RequestBody HashMap<String, String> param)
			throws Exception {
		HashMap<String, Object> map = new HashMap();
		System.out.println("#### getRowIdCheck ####");

	       try {
	            // 서비스 메서드를 호출하여 ID 중복 여부 체크
	            String result = userService.checkUserId(param.get("USER_ID"));
	            map.put("result", result);
	        } catch (Exception e) {
	            map.put("sError", e.getMessage());
	            System.out.println("sError"+e);
	        }
		return map;
	}

	/**
	 * 사용자 관리 엑셀 다운
	 *
	 * @param params
	 * @param request
	 * @param response
	 */
	@RequestMapping(method = RequestMethod.POST, value = "/getExcelDownUser")
	public void getExcelDownUser(@RequestParam HashMap<String, Object> params, HttpServletRequest request,
			HttpServletResponse response, HttpSession session) {
		System.out.println("#### getExcelDownUser ####");
		try {
			EsRest elsRest = new EsRest();

			String query = "{ \"query\": { \"match_all\": {} } }";
			JSONArray myData = elsRest.searchByBodyToArray(user_index, query);

			ExcelUt.userExcelDownload(params.get("mode").toString(), myData, response);

		} catch (Exception e) {
			System.out.println("sError"+e);
		}

	}

	/**
	 * 엑셀파일 사용자 일괄등록 기능
	 *
	 * @param HashMap<String, Object>
	 * @return HashMap<String, Object>
	 */
	//@RequestMapping(value = "/setUserExcelUpload")
	@PostMapping("/setUserExcelUpload")
	public @ResponseBody HashMap<String, Object> setUserExcelUpload(
			@RequestParam(value = "excelFile", required = true) MultipartFile file, HttpServletRequest request,
			HttpSession session) throws Exception {
		System.out.println("#### setUserExcelUpload ####");
		HashMap<String, Object> map = new HashMap();

		map = ExcelUt.userExcelUploard(file, request, session);
		
		return map;
	}
	

}
