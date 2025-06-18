package com.example.controller.scheduler;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.json.JSONArray;
import org.json.JSONObject;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.example.controller.util.CmnUt;
import com.example.controller.util.EsRest;

public class DataJob implements Job {
	@Override
	public void execute(JobExecutionContext context) throws JobExecutionException {
		System.out.println("🌀 job실행 🌀");
		try {
			String serviceKey = "7H53BDkZckVrpi+EW04DXSB/js8S1PmGlJcVC+rezSi45FmMfPfXhFqwx9XiKNn7+89PaqDADyTNezWfGc02Yg==";
			String baseUrl = "https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty";
			String sidoName = URLEncoder.encode("서울", "UTF-8");
			EsRest es = new EsRest();
			String urlStr = baseUrl + "?serviceKey=" + URLEncoder.encode(serviceKey, "UTF-8") + "&returnType=json"
					+ "&numOfRows=100" + "&pageNo=1" + "&sidoName=" + sidoName + "&ver=1.0";

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
				JSONArray items = json.getJSONObject("response").getJSONObject("body").getJSONArray("items");

				Set<String> selectedGuSet = new HashSet<>(
						Arrays.asList("강남구", "서초구", "송파구", "강서구", "강북구", "종로구", "중구", "영등포구", "노원구", "도봉구", "강동구"));

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

						simplified.put("pm10Value", CmnUt.parseIntOrZero(station.optString("pm10Value", null)));
						simplified.put("pm10Grade", station.optString("pm10Grade", "-"));
						simplified.put("pm10Flag", station.optString("pm10Flag", "-"));

						simplified.put("pm25Value", CmnUt.parseIntOrZero(station.optString("pm25Value", null)));
						simplified.put("pm25Grade", station.optString("pm25Grade", "-"));
						simplified.put("pm25Flag", station.optString("pm25Flag", "-"));

						simplified.put("o3Value", CmnUt.parseFloatOrZero(station.optString("o3Value", null)));
						simplified.put("o3Grade", station.optString("o3Grade", "-"));
						simplified.put("o3Flag", station.optString("o3Flag", "-"));

						simplified.put("khaiValue", CmnUt.parseIntOrZero(station.optString("khaiValue", null)));
						simplified.put("khaiGrade", station.optString("khaiGrade", "-"));
						
						simplified.put("isResistWrong", false);
						
						result.add(simplified);
						es.insert("leo_air_data", null, simplified);
					}
				}
			}
		}catch (JobExecutionException e) { 
			System.out.println("air_data API 호출 에러 " +e); 
		}catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

}