package com.example.controller.util;

import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.impl.nio.client.HttpAsyncClientBuilder;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.ssl.SSLContexts;
import org.apache.http.util.EntityUtils;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.impl.nio.reactor.IOReactorConfig;
import org.elasticsearch.client.*;

import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpUriRequest;


import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;

import java.security.cert.X509Certificate;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import javax.net.ssl.X509TrustManager;

import org.json.JSONArray;
import org.json.JSONObject;
import org.apache.http.HttpEntity;
import org.apache.http.nio.entity.NStringEntity;
import org.apache.http.entity.ContentType;
import java.nio.charset.Charset;
import java.io.InputStreamReader;
import java.net.URLEncoder;

public class EsRest {

	private static RestClient restClient;
	private static final Object LOCK = new Object();
	private Map m1 = Collections.<String, String>emptyMap();

	private static final String[] HOSTS = { "52.78.84.97" }; // ES IP
	private static final int ES_PORT = 9200;
	private static final String USERNAME = "elastic";
	private static final String PASSWORD = "#ruqtkf$$dpdj12";

	public static synchronized RestClient getInstance() {
		if (restClient == null) {
			synchronized (LOCK) {
				if (restClient == null) {
					List<HttpHost> hosts = Arrays.stream(HOSTS).map(host -> new HttpHost(host, ES_PORT, "http"))
							.collect(Collectors.toList());

					restClient = RestClient.builder(hosts.toArray(new HttpHost[0]))
							.setHttpClientConfigCallback(httpClientBuilder -> {
								setupSSL(httpClientBuilder);
								setupAuth(httpClientBuilder);
								return httpClientBuilder;
							}).setRequestConfigCallback(requestConfigBuilder -> requestConfigBuilder
									.setConnectTimeout(5000).setSocketTimeout(120000))
							.build();
				}
			}
		}
		return restClient;
	}

	private static void setupSSL(HttpAsyncClientBuilder httpClientBuilder) {
		try {
			final SSLContext sslContext = SSLContext.getInstance("SSL");
			sslContext.init(null, new TrustManager[] { new X509TrustManager() {
				public void checkClientTrusted(X509Certificate[] xcs, String string) {
				}

				public void checkServerTrusted(X509Certificate[] xcs, String string) {
				}

				public X509Certificate[] getAcceptedIssuers() {
					return null;
				}
			} }, new SecureRandom());

			httpClientBuilder.setSSLContext(sslContext).setSSLHostnameVerifier((hostname, session) -> true);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private static void setupAuth(HttpAsyncClientBuilder httpClientBuilder) {
		CredentialsProvider credentialsProvider = new BasicCredentialsProvider();
		credentialsProvider.setCredentials(AuthScope.ANY, new UsernamePasswordCredentials(USERNAME, PASSWORD));
		httpClientBuilder.setDefaultCredentialsProvider(credentialsProvider);
	}

	public static final RequestOptions COMMON_OPTIONS;

	static {
		RequestOptions.Builder builder = RequestOptions.DEFAULT.toBuilder();
		builder.setHttpAsyncResponseConsumerFactory(
				new HttpAsyncResponseConsumerFactory.HeapBufferedResponseConsumerFactory(200 * 1024 * 1024));
		COMMON_OPTIONS = builder.build();
	}
	// #=========================== Get Statu ==============================#
	public JSONObject getAdminApi(String endpoint) throws Exception {
	    RestClient rc = getInstance();
	    Request request = new Request("GET", endpoint);
	    request.setOptions(COMMON_OPTIONS);
	    return toResJson(rc.performRequest(request).getEntity().getContent());
	}
	
	// #=========================== Get Row ==============================#
	public JSONObject row(String index, String id, List<String> column_list) throws Exception {
		return row(index, id, column_list, "");
	}

	public JSONObject row(String index, String id, List<String> column_list, String option) throws Exception {
	    if (index != null && id != null) {
	        RestClient rc = getInstance();
	        
	        // column_list가 비어 있지 않으면 해당 필드들만 선택
	        StringBuilder column = new StringBuilder();
	        if (column_list != null && !column_list.isEmpty()) {
	            for (String data : column_list) {
	                column.append(URLEncoder.encode(data, "UTF-8")).append(",");
	            }
	            column.setLength(column.length() - 1); // 마지막 쉼표 제거
	        }

	        // 기본 요청 URL 설정
	        String url = "/" + index + "/_doc/" + id;

	        // _source_includes가 있을 때 쿼리 파라미터 추가
	        if (column.length() > 0) {
	            url += "?_source_includes=" + column.toString();
	        }

	        // option이 있으면 추가
	        if (option != null && !option.isEmpty()) {
	            url += (column.length() > 0 ? "&" : "?") + option;
	        }

	        // 요청 생성
	        Request request = new Request("GET", url);
	        request.setOptions(COMMON_OPTIONS);

	        // 결과 반환
	        return toResJson(rc.performRequest(request).getEntity().getContent());
	    } else {
	        return toResJson(null);
	    }
	}
	// #========================= Get count ==============================#

	public int count(String table, String query, StringBuilder requestBody) throws Exception {
		int cnt = 0;

		if (table != null) {
			RestClient rc = EsRest.getInstance();
			JSONObject rs;

			Request request;

			if (requestBody == null) {
				// Lucene 쿼리 방식
				String encodedQuery = URLEncoder.encode(query, "UTF-8");
				request = new Request("GET", "/" + table + "/_count?q=" + encodedQuery + "&lenient=true");
			} else {
				// JSON DSL 방식 (POST로 바디 전달)
				request = new Request("POST", "/" + table + "/_count");
				HttpEntity entity = new NStringEntity(requestBody.toString(), ContentType.APPLICATION_JSON);
				request.setEntity(entity);
			}

			request.setOptions(EsRest.COMMON_OPTIONS);
			rs = toResJson(rc.performRequest(request).getEntity().getContent());
			cnt = Integer.parseInt(rs.get("count").toString());
		}

		return cnt;
	}

	// #========================= Get search ==============================#
	public JSONObject searchByBody(String index, JSONObject query) throws Exception {
	    if (index != null && query != null) {
	        RestClient rc = getInstance();

	        String requestBody = query.toString();
	        HttpEntity entity = new NStringEntity(requestBody, ContentType.APPLICATION_JSON);

	        // 요청 생성
	        Request request = new Request("GET", "/" + index + "/_search");
	        request.setEntity(entity);

	        // 요청 보내기
	        return toResJson(rc.performRequest(request).getEntity().getContent());
	    } else {
	        return toResJson(null);
	    }
	}
	public JSONObject searchBody(String table, StringBuilder requestBody, List<String> column_list) throws Exception {
		if (table != null && requestBody != null) {
			RestClient rc = EsRest.getInstance();

			HttpEntity entity = new NStringEntity(requestBody.toString(), ContentType.APPLICATION_JSON);

			if (column_list != null) {
				String column = "";
				for (String data : column_list) {
					column += data + ",";
				}
				column = column.substring(0, column.length() - 1);
				
				
			   String url = table + "/_search" 
	                    + "?&_source_includes=" + column
	                    + "&filter_path=took,hits.total,hits.hits._id,hits.hits._index,hits.hits._source";
		        Map<String, String> params = new HashMap<>();

		        // 요청 객체 생성
		        Request request = new Request("POST", url);
		        request.setEntity(entity);
			
		        return toResJson(rc.performRequest(request).getEntity().getContent());
			} else {
				Request request = new Request("POST", table + "/_search");
		        request.setEntity(entity);
		        return toResJson(rc.performRequest(request).getEntity().getContent());
			}
		} else {
			return toResJson(null);
		}

	}
	
	public JSONObject searchBody(String table, StringBuilder requestBody, int from, int size, String sort) throws Exception {
	    // Elasticsearch 쿼리를 보내기 전에 유효성 검사를 수행합니다.
	    if (table != null && requestBody != null) {
	        // Elasticsearch RestClient 인스턴스를 얻어옵니다.
	        RestClient rc = EsRest.getInstance();

	        // from, size, 정렬(순서) 정보 추가
	        requestBody.append(",\"from\" : ").append(from).append(", \"size\" : ").append(size).append(",");
	        requestBody.append("\"sort\": [").append(sort).append("] ");
	        requestBody.append("}");

	        // 요청 바디를 JSON 형식으로 변환
	        HttpEntity entity = new NStringEntity(requestBody.toString(), ContentType.APPLICATION_JSON);

	        // 모든 필드를 반환하기 위해 _source 필터링을 하지 않음
	        Request request = new Request("GET", table + "/_search");
	        request.setEntity(entity);

	        // 요청 보내기
	        return toResJson(rc.performRequest(request).getEntity().getContent());
	    } else {
	        // table 또는 requestBody가 null일 경우 null을 반환
	        return toResJson(null);
	    }
	}
	
	// 인덱스로 해당 정보 다 가져오기.
	public JSONArray searchByBodyToArray(String index, String query) throws Exception {
	    JSONArray jsonData = new JSONArray();
	    System.out.println("## searchByBodyToArray ##");
	    if (index != null && query != null && !query.isEmpty()) {
	        RestClient rc = getInstance();

	        // 문자열 쿼리를 JSONObject로 변환
	        JSONObject queryObj = new JSONObject(query);

	        String requestBody = queryObj.toString();
	        HttpEntity entity = new NStringEntity(requestBody, ContentType.APPLICATION_JSON);

	        Request request = new Request("GET", "/" + index + "/_search");
	        request.setEntity(entity);

	        JSONObject response = toResJson(rc.performRequest(request).getEntity().getContent());

	        // hits 배열 추출
	        JSONObject hitsObject = response.getJSONObject("hits");
	        JSONArray hitsArray = hitsObject.getJSONArray("hits");

	        for (int i = 0; i < hitsArray.length(); i++) {
	            JSONObject hit = hitsArray.getJSONObject(i);
	            JSONObject source = hit.getJSONObject("_source");
	            source.put("_id", hit.getString("_id"));
	            jsonData.put(source);
	        }
	    }

	    return jsonData;
	}

	// #========================= insert ==============================#
	public JSONObject insert(String index, String id, JSONObject data) throws Exception {
		if (index != null && data != null) {
			RestClient rc = getInstance();
			HttpEntity entity = new NStringEntity(data.toString(), ContentType.APPLICATION_JSON);
			if (id == null) {
				Request request = new Request("POST", "/" + index + "/_doc");
				request.setEntity(entity);
				return toResJson(rc.performRequest(request).getEntity().getContent());
			} else {
				Request request = new Request("POST", "/" + index + "/_doc/" + id);
				request.setEntity(entity);
				return toResJson(rc.performRequest(request).getEntity().getContent());
			}
		} else {
			return toResJson(null);
		}
	}	
	// #========================= update ==============================#
	public JSONObject update(String table, String id, Map<String, Object> data) throws Exception {
		if (table != null && data != null && id != null) {
			RestClient rc = EsRest.getInstance();

			
			HttpEntity entity = new NStringEntity(toJsonStr(data), ContentType.APPLICATION_JSON);

	        Request request = new Request("PUT", table + "/" + id);
	        request.setEntity(entity);
	        return toResJson(rc.performRequest(request).getEntity().getContent());
	        
			//return toResJson(rc.performRequest("PUT", table + "/" + id, m1, entity).getEntity().getContent());
		} else {
			return toResJson(null);
		}
	}
	public JSONObject updateDoc(String index, String _id, JSONObject params) throws Exception {
		if (index != null && _id != null && params != null) {
			RestClient rc = getInstance();

			JSONObject updateInfo = new JSONObject();

			updateInfo.put("doc", params);

			HttpEntity entity = new NStringEntity(updateInfo.toString(), ContentType.APPLICATION_JSON);
			Request request = new Request("POST", "/" + index + "/_update/" + _id);
			request.setEntity(entity);
			return toResJson(rc.performRequest(request).getEntity().getContent());
		} else {
			return toResJson(null);
		}
	}	
	// 스크립트용 업데이트
	public JSONObject updateScript(String index, String _id, String script, Map<String, Object> params) throws Exception {
		if (index != null && _id != null && script != null) {
			RestClient rc = getInstance();

			JSONObject scriptObj = new JSONObject();
			scriptObj.put("source", script);
			scriptObj.put("params", params);

			JSONObject updateInfo = new JSONObject();
			updateInfo.put("script", scriptObj);

			HttpEntity entity = new NStringEntity(updateInfo.toString(), ContentType.APPLICATION_JSON);
			Request request = new Request("POST", "/" + index + "/_update/" + _id);
			request.setEntity(entity);
			return toResJson(rc.performRequest(request).getEntity().getContent());
		} else {
			return toResJson(null);
		}
	}
	// #========================= delete ==============================#	
	public JSONObject delete(String table, String id) throws Exception {
		if (table != null && id != null) {
			RestClient rc = EsRest.getInstance();

			Request request = new Request("DELETE", "/" + table + "/_doc/" + id);
		    request.setOptions(EsRest.COMMON_OPTIONS);  // 옵션 설정이 있다면 추가

		    return toResJson(rc.performRequest(request).getEntity().getContent());
		} else {
			return toResJson(null);
		}
	}	
	
	public JSONObject deleteAll(String index) throws Exception {
	    if (index != null) {
	        RestClient rc = EsRest.getInstance();

	        // match_all 쿼리로 전체 문서 삭제
	        JSONObject matchAll = new JSONObject();
	        matchAll.put("match_all", new JSONObject());

	        JSONObject query = new JSONObject();
	        query.put("query", matchAll);

	        HttpEntity entity = new NStringEntity(query.toString(), ContentType.APPLICATION_JSON);

	        Request request = new Request("POST", "/" + index + "/_delete_by_query");
	        request.setEntity(entity);
	        request.setOptions(EsRest.COMMON_OPTIONS);

	        return toResJson(rc.performRequest(request).getEntity().getContent());
	    } else {
	        return toResJson(null);
	    }
	}
	
	// #========================= bulk ==============================#		
	public JSONObject updateBulk(StringBuilder bulkData) throws Exception {
		if (bulkData != null) {
			RestClient rc = EsRest.getInstance();
			HttpEntity entity = new NStringEntity(bulkData.toString(), ContentType.APPLICATION_JSON);
			
	        Request request = new Request("POST", "/_bulk");
	        request.setEntity(new NStringEntity(bulkData.toString(), ContentType.APPLICATION_JSON));

	        // 요청 실행
	        return toResJson(rc.performRequest(request).getEntity().getContent());
			
		} else {
			return toResJson(null);
		}
	}
	// #========================= query검색 관련 ==============================#		
	public String url(String method, String url, String query) throws Exception {
	    RestClient rc = EsRest.getInstance();

	    if ("undefined".equals(query)) {
	        query = "";
	    }

	    try {
	        Request request = new Request(method, url);
	        request.setEntity(new NStringEntity(query, ContentType.APPLICATION_JSON));
	        request.setOptions(EsRest.COMMON_OPTIONS); // 필요시

	        Response response = rc.performRequest(request);
	        return EntityUtils.toString(response.getEntity());
	    } catch (ResponseException e) {
	        if (e.getResponse().getStatusLine().getStatusCode() == 404) {
	            return EntityUtils.toString(e.getResponse().getEntity());
	        } else {
	            throw e;
	        }
	    }
	}	
	
	public String querySearch(String method, String url, String query) throws Exception {
	    RestClient rc = EsRest.getInstance();
	    if ("undefined".equals(query)) {
	        query = "";
	    }
	    String result = "";
	    try {
	        Request request = new Request(method.toUpperCase(), url);

	        // ⚠️ GET 메서드는 body 설정하면 안됨
	        if (query != null && !query.isEmpty()) {
	            request.setEntity(new NStringEntity(query, ContentType.APPLICATION_JSON));
	        }

	        request.setOptions(EsRest.COMMON_OPTIONS);

	        Response response = rc.performRequest(request);
	        result = EntityUtils.toString(response.getEntity());

	    } catch (ResponseException e) {
	        if (e.getResponse().getStatusLine().getStatusCode() == 404) {
	            result = EntityUtils.toString(e.getResponse().getEntity());
	        } else {
	            throw e;
	        }
	    }
	    return result;
	}

	// #========================= id 존재 여부 확인  ==============================#	
	public boolean exists(String index, String id) throws Exception {
	    if (index == null || id == null) return false;

	    RestClient rc = EsRest.getInstance();
	    Request request = new Request("GET", "/" + index + "/_doc/" + id);
	    request.setOptions(EsRest.COMMON_OPTIONS);

	    try {
	        Response response = rc.performRequest(request);
	        return response.getStatusLine().getStatusCode() == 200;
	    } catch (ResponseException e) {
	        if (e.getResponse().getStatusLine().getStatusCode() == 404) {
	            // 404는 "없는 문서" → false 반환
	            return false;
	        } else {
	            // 404 외의 예외는 그대로 터뜨림
	            throw e;
	        }
	    }
	}
	
	private String toJsonStr(Map<String, Object> hm) {
		StringBuilder sb = new StringBuilder();

		Iterator<String> keys = hm.keySet().iterator();
		sb.append("{");
		while (keys.hasNext()) {
			String key = keys.next();

			sb.append("\"");
			sb.append(key);
			sb.append("\"");
			sb.append(":");
			if (hm.get(key) == null) {
				System.out.println("//## Null Data : " + key);
			}
			if (!hm.get(key).equals("") & hm.get(key).toString().matches("^\\[\".*\"\\]$")) {
				sb.append(hm.get(key));
			} else if (!hm.get(key).equals("") & hm.get(key).toString().matches("^\\[\\{.*\\}\\]$")) {
				sb.append(hm.get(key));
			} else if (!hm.get(key).equals("") & hm.get(key).toString().matches("^\\{\".*\"\\}$")
					|| !hm.get(key).equals("") & hm.get(key).toString().matches("^\\{\".*null\\}$")
					|| !hm.get(key).equals("") & hm.get(key).toString().matches("^\\{\".*\\}$")) {
				sb.append(hm.get(key));
			} else {
				if (!hm.get(key).equals("null")) {
					if (hm.get(key).equals("[]")) {
						sb.append(hm.get(key));
					} else {
						sb.append("\"");
						sb.append(hm.get(key));
						sb.append("\"");
					}
				} else {
					sb.append(hm.get(key));
				}
			}

			if (keys.hasNext()) {
				sb.append(",");
			}
		}
		sb.append("}");

		return sb.toString();
	}
	
	private JSONObject toResJson(InputStream is) {
		JSONObject jsonObject = null;
		try {
			if (is == null) {
				jsonObject = new JSONObject();
			} else {
				BufferedReader streamReader = new BufferedReader(new InputStreamReader(is, Charset.forName("UTF-8")));
				StringBuilder responseStrBuilder = new StringBuilder();

				String inputStr;
				while ((inputStr = streamReader.readLine()) != null) {
					responseStrBuilder.append(inputStr);
				}
				jsonObject = new JSONObject(responseStrBuilder.toString());
			}
		} catch (Exception e) {
			jsonObject = new JSONObject();
		}
		return jsonObject;
	}

}
