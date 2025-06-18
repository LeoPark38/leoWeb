package com.example.controller.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.commons.io.IOUtils;
import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Row;
import org.json.JSONArray;
import org.json.JSONObject;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.BorderStyle;

import org.apache.poi.xssf.streaming.SXSSFCell;
import org.apache.poi.xssf.streaming.SXSSFRow;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;

import com.example.controller.util.CmnUt;

public class ExcelUt {

//----- 사용자 엑셀 다운로드
	public static void userExcelDownload(String mode, JSONArray data_obj, HttpServletResponse response)
			throws Exception {
		String excelName = "사용자 일괄 다운로드";
		SXSSFWorkbook workbook = null;
		SXSSFSheet sheet = null;
		OutputStream os = null;

		int iRow = -1;

		Row row = null;
		Cell cell = null;

		// 엑셀 문서 생성.
		workbook = new SXSSFWorkbook();
		// 워크시트 생성.
		sheet = workbook.createSheet(excelName);
		// Cell 스타일
		// cellStyle: 가운데정렬, 세로가운데정렬, 배경색, 테두리, 자동줄바꿈
		// cellStyle2: 가운데정렬, 세로가운데정렬, 테두리
		// dataCellStyle: 가운데정렬, 자동줄바꿈


		CellStyle cellStyle = workbook.createCellStyle();
		cellStyle.setWrapText(true);
		cellStyle.setAlignment(HorizontalAlignment.CENTER);
		cellStyle.setVerticalAlignment(org.apache.poi.ss.usermodel.VerticalAlignment.CENTER);
		cellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
		cellStyle.setFillForegroundColor(IndexedColors.SEA_GREEN.getIndex());
		cellStyle.setBorderBottom(BorderStyle.THIN);
		cellStyle.setBorderTop(BorderStyle.THIN);
		cellStyle.setBorderLeft(BorderStyle.THIN);
		cellStyle.setBorderRight(BorderStyle.THIN);

		CellStyle dataCellStyle = workbook.createCellStyle();
		dataCellStyle.setAlignment(HorizontalAlignment.CENTER);
		dataCellStyle.setWrapText(true);
		

		// 엑셀 설명 문구
		HashMap<Integer, String> exp = new HashMap();
		exp.put(0, "[ 작성 방법 ]");
		exp.put(1, " ");
		exp.put(2, "1. 사용자 ID는 영문(소문자), 숫자만 입력 가능합니다. 최소 6글자 최대 15글자");
		exp.put(3, "2. 비밀번호는 영문+숫자+특수문자 포함 최소 8글자");
		exp.put(3, "3. 비밀번호는 암호화된상태로 확인됩니다.");
		exp.put(4, "4. 사용자명에 특수문자는 들어갈 수 없습니다. 최대 10글자(필수입력)");
		exp.put(6, "5. 사용자 휴대폰번호는 -를 포함하여 휴대폰번호 형식에 맞춰 입력해주세요(필수입력)");
		exp.put(7, "6. AIR 사용여부는 대문자 O 또는 X 를 입력해주세요");
		exp.put(8, "7. Query 사용여부는 대문자 O 또는 X 를 입력해주세요");
		exp.put(9, "8. 기타 사용여부는 대문자 O 또는 X 를 입력해주세요");
		exp.put(10, "9. ID 사용여부는 대문자 O 또는 X 를 입력해주세요");
		exp.put(11, " ");
		exp.put(12, "[ 주의 사항 ]");
		exp.put(13, " - 19번 줄 부터 입력해주시기 바랍니다.");
		exp.put(14, " - 입력할 정보가 없어 공백으로 작성하는 부분에 스페이스바 기입 금지( 업로드 중 오류가 발생할 수 있음)");
		exp.put(15, " ");

		for (int i = 0; i < exp.size(); i++) {
			row = sheet.createRow(i);
			cell = row.createCell(0);
			cell.setCellValue(exp.get(i));
		}
		// 입력 테이블 생성
		row = sheet.createRow(16);

		sheet.addMergedRegion(new CellRangeAddress(16, 17, 0, 0));
		cell = row.createCell(0);
		cell.setCellValue("1.사용자 ID");
		cell.setCellStyle(cellStyle);

		sheet.addMergedRegion(new CellRangeAddress(16, 17, 1, 1));
		cell = row.createCell(1);
		cell.setCellValue("2.비밀번호");
		cell.setCellStyle(cellStyle);

		sheet.addMergedRegion(new CellRangeAddress(16, 17, 2, 2));
		cell = row.createCell(2);
		cell.setCellValue("3.사용자 명");
		cell.setCellStyle(cellStyle);

		sheet.addMergedRegion(new CellRangeAddress(16, 17, 3, 3));
		cell = row.createCell(3);
		cell.setCellValue("4.휴대폰번호");
		cell.setCellStyle(cellStyle);

		sheet.addMergedRegion(new CellRangeAddress(16, 17, 4, 4));
		cell = row.createCell(4);
		cell.setCellValue("5.AIR 사용여부");
		cell.setCellStyle(cellStyle);

		sheet.addMergedRegion(new CellRangeAddress(16, 17, 5, 5));
		cell = row.createCell(5);
		cell.setCellValue("6.QUERY 사용여부");
		cell.setCellStyle(cellStyle);

		sheet.addMergedRegion(new CellRangeAddress(16, 17, 6, 6));
		cell = row.createCell(6);
		cell.setCellValue("7.기타 사용여부");
		cell.setCellStyle(cellStyle);

		sheet.addMergedRegion(new CellRangeAddress(16, 17, 7, 7));
		cell = row.createCell(7);
		cell.setCellValue("8.아이디 사용여부");
		cell.setCellStyle(cellStyle);


		row = sheet.createRow(17);
		cell = row.createCell(0);
		cell.setCellStyle(cellStyle);
		cell = row.createCell(1);
		cell.setCellStyle(cellStyle);
		cell = row.createCell(2);
		cell.setCellStyle(cellStyle);
		cell = row.createCell(3);
		cell.setCellStyle(cellStyle);
		cell = row.createCell(4);
		cell.setCellStyle(cellStyle);
		cell = row.createCell(5);
		cell.setCellStyle(cellStyle);
		cell = row.createCell(6);
		cell.setCellStyle(cellStyle);
		cell = row.createCell(7);
		cell.setCellStyle(cellStyle);

		// 컬럽 넓이 설정
		sheet.setColumnWidth(0, 4550); // 1 사용자 ID
		sheet.setColumnWidth(1, 6550); // 2 비밀번호
		sheet.setColumnWidth(2, 5550); // 3 사용자 명
		sheet.setColumnWidth(3, 5550); // 4 휴대폰 번호
		sheet.setColumnWidth(4, 4550); // 5 AIR 사용여부
		sheet.setColumnWidth(5, 4550); // 6 Query 사용여부
		sheet.setColumnWidth(6, 4550); // 7 기타 사용여부
		sheet.setColumnWidth(7, 4550); // 8 아이디 사용여부

		// @@ ts_user 데이터 엑셀에 넣기
		if ("list".equals(mode)) {
			try {
				JSONObject obj = new JSONObject();
				int data_col_num = 18; // 엑셀에 데이터가 들어가기 시작하는 위치
				System.out.println("엑셀 시작");
				for (int i = 0; i < data_obj.length(); i++) {
					obj = (JSONObject) data_obj.get(i);
					row = sheet.createRow(data_col_num);
					// 사용자 ID
					cell = row.createCell(0);
					if (obj.get("USER_ID") != null) {
						cell.setCellValue(obj.get("USER_ID").toString());
					} else {
						cell.setCellValue("");
					}
					// 사용자 비밀번호
					cell = row.createCell(1);
					if (obj.get("USER_PW") != null) {
						cell.setCellValue(obj.get("USER_PW").toString());
					} else {
						cell.setCellValue("");
					}
					cell.setCellStyle(dataCellStyle);
					// 사용자명
					cell = row.createCell(2);
					if (obj.get("USER_NAME") != null) {
						cell.setCellValue(obj.get("USER_NAME").toString());
					} else {
						cell.setCellValue("");
					}
					cell.setCellStyle(dataCellStyle);
					// 사용자 휴대폰번호
					cell = row.createCell(3);
					if (obj.get("USER_PHONE") != null) {
						cell.setCellValue(obj.get("USER_PHONE").toString());
					} else {
						cell.setCellValue("");
					}
					cell.setCellStyle(dataCellStyle);
					
					// 사용자 AIR 사용여부
					cell = row.createCell(4);
					if (obj.get("IS_AIR_USE") != null) {
						String is_air_use = "";
						switch (obj.get("IS_AIR_USE").toString()) {
						case "true":
							is_air_use = "O";
							break;
						case "false":
							is_air_use = "X";
							break;
						}
						cell.setCellValue(is_air_use);
					} else {
						cell.setCellValue("");
					}
					// 사용자 쿼리 사용여부
					cell = row.createCell(5);
					if (obj.get("IS_QUERY_USE") != null) {
						String is_query_use = "";
						switch (obj.get("IS_QUERY_USE").toString()) {
						case "true":
							is_query_use = "O";
							break;
						case "false":
							is_query_use = "X";
							break;
						}
						cell.setCellValue(is_query_use);
					} else {
						cell.setCellValue("");
					}
					// 사용자 기타 사용여부
					cell = row.createCell(6);
					if (obj.get("IS_ETC_USE") != null) {
						String is_etc_use = "";
						switch (obj.get("IS_ETC_USE").toString()) {
						case "true":
							is_etc_use = "O";
							break;
						case "false":
							is_etc_use = "X";
							break;
						}
						cell.setCellValue(is_etc_use);
					} else {
						cell.setCellValue("");
					}
					// 사용자 사용여부
					cell = row.createCell(7);
					if (obj.get("IS_USE") != null) {
						String is_use = "";
						switch (obj.get("IS_USE").toString()) {
						case "true":
							is_use = "O";
							break;
						case "false":
							is_use = "X";
							break;
						}
						cell.setCellValue(is_use);
					} else {
						cell.setCellValue("");
					}
					cell.setCellStyle(dataCellStyle);

					data_col_num++;
				}
			}catch (Exception e) {
				System.out.println("[e] : "+e);
			}
		}
		try {

			excelName = excelName + ".xlsx";
			excelName = new String(excelName.getBytes("UTF-8"), "ISO-8859-1");
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}

		// 엑셀 설정
		response.setContentType("aplication/vnd.ms-excel");
		response.setHeader("Content-Disposition", "attachment; Filename=" + excelName);

		try {
			// 엑셀 다운로드.
			os = response.getOutputStream();
			workbook.write(os);

		} catch (IOException e) {
			System.out.println(e.getMessage());
		} finally {

			if (workbook != null) {
				try {
					workbook.close();
				} catch (IOException e) {
					System.out.println("워크북을 닫는 중 오류가 발생하였습니다");
				}
			}

		}
		System.out.println("엑셀 다운로드 완료");
	}

	
//----- 사용자 엑셀 업로드
	public static HashMap<String, Object> userExcelUploard(MultipartFile file, HttpServletRequest request, HttpSession session) throws Exception {
		HashMap<String, Object> map = new HashMap();
		EsRest esRest = new EsRest();
		String index = "leo_user";
		
		EsRest rs = new EsRest();
		try {
			if (file != null && file.getSize() > 0) {

				File upFile = File.createTempFile("upfile" + CmnUt.getDateTime("yyMMdd_HHmmss"), ".tmp");
				upFile.deleteOnExit();

				try (FileOutputStream out = new FileOutputStream(upFile)) {
					IOUtils.copy(file.getInputStream(), out);
				}

				Date today = new Date();
				SimpleDateFormat smf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ssZ");

				FileInputStream fis = new FileInputStream(upFile);
				int rowindex = 0;
				int columnindex = 0;
				XSSFWorkbook workbook = new XSSFWorkbook(fis);
				XSSFSheet sheet = workbook.getSheetAt(0);

				int rows = sheet.getPhysicalNumberOfRows();

				// ip 정규식
				String id_reg = "[a-z0-9]{6,15}$";
				String pw_reg = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*()\\-_=+{};:,<.>]).{5,20}$";
				String nm_reg = "[a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣0-9]{1,16}$";
				String hp_reg = "^(?:(010-\\d{4})|(01[1|6|7|8|9]-\\d{3,4}))-(\\d{4})$";

				// 오류 문구
				boolean result = true;
				String err_msg = "";
				String err_msg1 = "\n------ 1번 항목 오류 ------\n사용자 ID는 영문, 숫자만 입력 가능합니다. 최소 6글자 최대 15글자 \n";
				boolean msg1 = false;
				String err_msg2 = "\n------ 2번 항목 오류 ------\n비밀번호는 영문,숫자,특수문자 포함 최소 5글자 최대 20글자 입니다. \n";
				boolean msg2 = false;
				String err_msg3 = "\n------ 3번 항목 오류 ------\n사용자명에 특수문자는 들어갈 수 없습니다. 최대 16글자 \n";
				boolean msg3 = false;
				String err_msg4 = "\n------ 4번 항목 오류 ------\n사용자 휴대폰번호는 -를 포함하여 휴대폰번호 형식에 맞춰 입력해주세요(필수입력)\n";
				boolean msg4 = false;
				String err_msg5 = "\n------ 5번 항목 오류 ------\nAIR 사용여부는 O,X만 입력해주세요. \n";
				boolean msg5 = false;
				String err_msg6 = "\n------ 6번 항목 오류 ------\nQuery 사용여부는 O,X만 입력해주세요. \n";
				boolean msg6 = false;
				String err_msg7 = "\n------ 7번 항목 오류 ------\n기타 사용여부는 O,X만 입력해주세요. \n";
				boolean msg7 = false;
				String err_msg8 = "\n------ 8번 항목 오류 ------\nAIR 사용여부는 O,X만 입력해주세요. \n";
				boolean msg8 = false;


				XSSFRow info = sheet.getRow(18);
				if (info == null) {
					fis.close();
					workbook.close();
					return map;
				}

				// 데이터를 넣은 HashMap 선언
				HashMap<Integer, Object> setDataArr = new HashMap();
				int set_num = 0;
				Set<String> userIdSet = new HashSet<>(); // 중복 체크용
				// 입력된 데이터 부분 읽기
				for (rowindex = 18; rowindex <= rows; rowindex++) {
					JSONObject setData = new JSONObject();
					XSSFRow row = sheet.getRow(rowindex);
					
					if (row != null) {
						int cells = row.getPhysicalNumberOfCells();

						// 각셀 데이터 읽기
						XSSFCell USER_ID = row.getCell(0);
						XSSFCell USER_PW = row.getCell(1);
						XSSFCell USER_NM = row.getCell(2);
						XSSFCell USER_PHONE = row.getCell(3);
						XSSFCell IS_AIR_USE = row.getCell(4);
						XSSFCell IS_QUERY_USE = row.getCell(5);
						XSSFCell IS_ETC_USE = row.getCell(6);
						XSSFCell IS_USE = row.getCell(7);

						// 데이터 String으로 변환
						String user_id = USER_ID == null ? "" : USER_ID.toString().trim();
						String user_pw = USER_PW == null ? "" : USER_PW.toString().trim();
						String user_nm = USER_NM == null ? "" : USER_NM.toString().trim();
						String user_phone = USER_PHONE == null ? "" : USER_PHONE.toString().trim();
						String is_air = IS_AIR_USE == null ? "" : IS_AIR_USE.toString().trim();
						String is_query = IS_QUERY_USE == null ? "" : IS_QUERY_USE.toString().trim();
						String is_etc = IS_ETC_USE == null ? "" : IS_ETC_USE.toString().trim();
						String is_use = IS_USE == null ? "" : IS_USE.toString().trim();

						if ("".equals(user_id) && "".equals(user_nm)) {
							break;
						}

						// @@사용자 ID
						if (!Pattern.matches(id_reg, user_id)) {
							result = false;
							err_msg1 += "예상 오류 라인 : " + (rowindex + 1) + "\n";
							msg1 = true;
							setData.put("USER_ID", user_id);
						} else {
						    if (!userIdSet.add(user_id)) {
						        // 이미 있는 USER_ID → 중복
						        result = false;
						        err_msg1 += "[중복된 ID] 예상 오류 라인 : " + (rowindex + 1) + "\n";
						        msg1 = true;
						        continue; // 중복이니 이 데이터는 넘김
						    }
						    setData.put("USER_ID", user_id);
						}
						
						// @@ 비밀번호
						if (!Pattern.matches(pw_reg, user_pw)) {
							result = false;
							err_msg2 += "예상 오류 라인 : " + (rowindex + 1) + "\n";
							msg2 = true;
						} else {
				            String encryptedPassword = CmnUt.encryptSHA256(user_pw);
							setData.put("USER_PW", encryptedPassword);
						}
						// @@ 사용자명
						if (!Pattern.matches(nm_reg, user_nm)) {
							result = false;
							err_msg3 += "예상 오류 라인 : " + (rowindex + 1) + "\n";
							msg3 = true;
						} else {
							setData.put("USER_NAME", user_nm);
						}

						// @@ 휴대폰 번호 
						if (!Pattern.matches(hp_reg, user_phone)) {
							result = false;
							err_msg4 += "예상 오류 라인 : " + (rowindex + 1) + "\n";
							msg4 = true;
						} else {
							setData.put("USER_PHONE", user_phone);
						}

						// @@ AIR 사용 여부
						if ("".equals(is_air) || (!"O".equals(is_air) && !"X".equals(is_air))) {
							result = false;
							err_msg5 += "예상 오류 라인 : " + (rowindex + 1) + "\n";
							msg5 = true;
						} else {
							String airRs = "";
							switch (is_air) {
							case "O":
								airRs = "true";
								break;
							case "X":
								airRs = "false";
								break;
							}
							setData.put("IS_AIR_USE", airRs);
						}
						
						// @@ 쿼리 사용 여부
						if ("".equals(is_query) || (!"O".equals(is_query) && !"X".equals(is_query))) {
							result = false;
							err_msg6 += "예상 오류 라인 : " + (rowindex + 1) + "\n";
							msg6 = true;
						} else {
							String qRs = "";
							switch (is_query) {
							case "O":
								qRs = "true";
								break;
							case "X":
								qRs = "false";
								break;
							}
							setData.put("IS_QUERY_USE", qRs);
						}
						
						// @@ ETC 사용 여부
						if ("".equals(is_etc) || (!"O".equals(is_etc) && !"X".equals(is_etc))) {
							result = false;
							err_msg7 += "예상 오류 라인 : " + (rowindex + 1) + "\n";
							msg7 = true;
						} else {
							String etcRs = "";
							switch (is_etc) {
							case "O":
								etcRs = "true";
								break;
							case "X":
								etcRs = "false";
								break;
							}
							setData.put("IS_ETC_USE", etcRs);
						}
						
						// @@ 사용여부
						if ("".equals(is_use) || (!"O".equals(is_use) && !"X".equals(is_use))) {
							result = false;
							err_msg8 += "예상 오류 라인 : " + (rowindex + 1) + "\n";
							msg8 = true;
						} else {
							String isRs = "";
							switch (is_use) {
							case "O":
								isRs = "true";
								break;
							case "X":
								isRs = "false";
								break;
							}
							setData.put("IS_USE", isRs);
						}


// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------					
						setData.put("USER_MK_DT", smf.format(today));
						setData.put("USER_UPD_DT", smf.format(today));
						setData.put("USER_LOGIN_DT", smf.format(today));
						setDataArr.put(set_num, setData);
						set_num++;
					}
				}
				JSONObject data = new JSONObject();
				if (result) {
					//사용자 데이터 삭제
					rs.deleteAll(index);
					// 사용자 등록
					StringBuilder bulk = new StringBuilder();
					for (int i = 0; i < setDataArr.size(); i++) {
					    data = (JSONObject) setDataArr.get(i);
					    
					    bulk.append("{\"index\": {\"_index\":\"leo_user\",\"_id\":\"")
					        .append(data.get("USER_ID").toString())
					        .append("\"}}\n");
					    bulk.append(data.toString()).append("\n");
					}

					if (bulk.length() != 0) {
						System.out.println("사용자 일괄 업로드:" + rs.updateBulk(bulk).toString());
					}
					map.put("sOk", "ok");
				} else {
					if (msg1) {
						err_msg += err_msg1;
					}
					if (msg2) {
						err_msg += err_msg2;
					}
					if (msg3) {
						err_msg += err_msg3;
					}
					if (msg4) {
						err_msg += err_msg4;
					}
					if (msg5) {
						err_msg += err_msg5;
					}
					if (msg6) {
						err_msg += err_msg6;
					}
					if (msg7) {
						err_msg += err_msg7;
					}

					map.put("sError", err_msg);
				}
			}
		} catch (Exception e) {
			System.out.println(e.getMessage());
			map.put("sError", "다시 시도해주기바랍니다.");
		}

		return map;
	}
	    

	
}
