package com.example.controller.util;

import java.lang.reflect.Field;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.text.DateFormat;

public class CmnUt {

	// 현재 날짜(yyyy-MM-dd)를 (yyyy-MM-dd HH:mm:ssZ)형식으로 시작일, 종료일을 return해준다
	// @param : is start (true, false)
	// @return : yyyy-MM-dd 00:00:00Z, yyyy-MM-dd 23:59:59Z
	public static String getDateToDateTimeZone(String date, boolean isStart) {
		String result = null;

		DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("yyyy-MM-dd");

		DateTimeFormatter resultFormat = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ssZ");
		LocalDate localDate = LocalDate.parse(date, dateFormat);

		if (isStart) {
			result = localDate.atTime(0, 0, 0).atZone(ZoneId.of("Asia/Seoul")).format(resultFormat);
		} else {
			result = localDate.atTime(23, 59, 59).atZone(ZoneId.of("Asia/Seoul")).format(resultFormat);
		}

		return result;
	}
	
	//String -> hex
	public static String stringToHex(String param){
		String result = "";
		for(int j=0; j<param.length(); j++){
			result += String.format("%02X", (int) param.charAt(j));
		}
		
		return result;
	}

	public static long ipToLong(String ipAddress) {
		String[] ipAddressInArray = ipAddress.split("\\.");

		long result = 0;
		for (int i = 0; i < ipAddressInArray.length; i++) {
			int power = 3 - i;
			int ip = Integer.parseInt(ipAddressInArray[i]);
			result += ip * Math.pow(256, power);
		}
		return result;
	}

	public static boolean isDateValid(String dateString, String pattern) {
		try {
			SimpleDateFormat sdf = new SimpleDateFormat(pattern);
			if (sdf.format(sdf.parse(dateString)).equals(dateString)) {
				return true;
			}
		} catch (ParseException pe) {
		
		}

		return false;
	}

	public static String loadQuery(String query_path) throws Exception {
		String query_path_split[] = query_path.split("\\.");
		if (query_path_split.length != 2) {
			throw new Exception("query_path split exception:" + query_path);
		}
		String className = query_path_split[0];
		String fieldName = query_path_split[1];
		
		Class queryClass = Class.forName("edu.security.sas.query." + className);
		Object c = queryClass.newInstance();
		String result = "";
		Field setField;

		try {
			setField = queryClass.getDeclaredField(fieldName);
		} catch (NoSuchFieldException ex) {
			setField = null;
			throw new Exception("no such query field exception:" + ex.getMessage());
		}
		
		if (setField != null) {
			result = setField.get(c).toString();
		}

		return result;
	}
	
	public static void writeSetLog(String clientIp, String menu, String content, String content_detail) {
		HashMap<String, Object> param = new HashMap();
		Calendar cld = Calendar.getInstance();
		EsRest elsRest = new EsRest();
		Date today = new Date();
		try {

			String menu_list[];
			menu_list = menu.split("\\.");
			StringBuilder menu_result = new StringBuilder();
			for (int i = 0; i < menu_list.length; i++) {
				if (i == menu_list.length - 1) {
					menu_result.append(menu_list[i]);
				} else {
					menu_result.append(menu_list[i]);
					menu_result.append(" > ");
				}
			}
			SimpleDateFormat smf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ssZ");
			param.put("AH_ACT_DT", smf.format(today));
			param.put("AH_ACT_MENU", menu_result.toString());
			param.put("AH_ACT_CONTENT", content);
			param.put("AH_ACT_CONTENT_DETAIL", content_detail);
			param.put("AH_ACT_DATA_PREV", "null");
			param.put("AH_ACT_DATA_NEW", "null");
			param.put("USER_ID", content_detail);
			param.put("USER_IP", clientIp);

			//elsRest.insert("/ts_audit_log-" + cld.get(Calendar.YEAR) + "/doc", param);
		} catch (Exception e) {
		
		}
	}
	
	public String escapeBackSlash(String param) {
		String result;

		result = param.replaceAll("\\\\", "\\\\\\\\");
		result = result.replaceAll("&", "&amp;");
		result = result.replaceAll("<", "&lt;");
		result = result.replaceAll(">", "&gt;");
		result = result.replaceAll("\"", "&quot;");
		result = result.replaceAll("\\?", "\\\\\\\\?");
		result = result.replaceAll("\\t", "    ");
		return result;
	}
	
	public static String encryptSHA256(String str) throws Exception {

		String sha = "";

		try {
			MessageDigest sh = MessageDigest.getInstance("SHA-256");
			sh.update(str.getBytes());
			byte byteData[] = sh.digest();
			StringBuffer sb = new StringBuffer();
			for (int i = 0; i < byteData.length; i++) {
				sb.append(Integer.toString((byteData[i] & 0xff) + 0x100, 16).substring(1));
			}

			sha = sb.toString();

		} catch (NoSuchAlgorithmException e) {
			//log.error(e.getMessage()); 
			System.out.println("Encrypt Error - NoSuchAlgorithmException");
			sha = null;
		}

		return sha;
	}

	
	
	
	public static String getDateTime(String format) {
		DateFormat dateFormat = new SimpleDateFormat(format);
		Date date = new Date();

		return dateFormat.format(date);
	}
	public static String getDateTime() {

		return getDateTime("yyyy/MM/dd HH:mm:ss");
	}
}
