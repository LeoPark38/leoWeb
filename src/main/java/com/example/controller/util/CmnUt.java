package com.example.controller.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.text.DateFormat;

public class CmnUt {
	// HTML 파싱
	public static String escapeHtml(String input) {
	    return input.replace("&", "&amp;")
	                .replace("<", "&lt;")
	                .replace(">", "&gt;")
	                .replace("\"", "&quot;")
	                .replace("'", "&#x27;")
	                .replace("/", "&#x2F;");
	}
	// SHA 암호화
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

	// 지역을 type으로
    public static String getTypeByArea(String area) {
        String type;

        switch (area) {
            case "강남구":
                type = "KNA";
                break;
            case "강동구":
                type = "KDA";
                break;
            case "강북구":
                type = "KBA";
                break;
            case "강서구":
                type = "KSA";
                break;
            case "노원구":
                type = "NWA";
                break;
            case "도봉구":
                type = "DBA";
                break;
            case "서초구":
                type = "SCA";
                break;
            case "송파구":
                type = "SPA";
                break;
            case "영등포구":
                type = "YGA";
                break;
            case "종로구":
                type = "JRA";
                break;
            case "중구":
                type = "JGA";
                break;
            default:
                type = "UNKNOWN";
                break;
        }

        return type;
    }	
    // type을 지역으로
    public static String getAreaByType(String type) {
        String area;

        switch (type) {
            case "KNA":
                area = "강남구";
                break;
            case "KDA":
                area = "강동구";
                break;
            case "KBA":
                area = "강북구";
                break;
            case "KSA":
                area = "강서구";
                break;
            case "NWA":
                area = "노원구";
                break;
            case "DBA":
                area = "도봉구";
                break;
            case "SCA":
                area = "서초구";
                break;
            case "SPA":
                area = "송파구";
                break;
            case "YGA":
                area = "영등포구";
                break;
            case "JRA":
                area = "종로구";
                break;
            case "JGA":
                area = "중구";
                break;
            default:
                area = "알수없음";
                break;
        }

        return area;
    }

	// airData 추가시 사용
    public static Integer parseIntOrZero(String val) {
	    try {
	        if (val == null || val.trim().isEmpty() || "-".equals(val)) {
	            return 0; // ✅ 강제로 0
	        }
	        return Integer.parseInt(val);
	    } catch (NumberFormatException e) {
	        return 0; // ✅ 파싱 실패해도 0
	    }
	}
    // airData 추가시 사용
    public static Float parseFloatOrZero(String val) {
	    try {
	        if (val == null || val.trim().isEmpty() || "-".equals(val)) {
	            return 0.0f;
	        }
	        return Float.parseFloat(val);
	    } catch (NumberFormatException e) {
	        return 0.0f;
	    }
	}	
	
	
	
}
