var jsUt;

(function (factory) {
	if (typeof define === 'function' && define.amd && define.amd.jQuery) {
		jsUt = factory();
	} else {
		jsUt = factory();
	}
}(function () {
	return {
		unescapeHtml: function(html){
			const temp = document.createElement("textarea");
  			temp.innerHTML = html;
  			return temp.value;
		},
		unescapeBoardContent: function(content){
			return this.unescapeHtml(content)
					.replace(/\\n/g, '\n')
					.replace(/\\"/g, '"');
		},
		delocalStorage : function(key, value) {
		    var rt = this.localStorage(key);
		    if (!rt) {
		      rt = this.localStorage(key, value);
		    }
		
		    return rt;
		},
		localStorage: function(key, value) {
		    if (value !== undefined) {
		      value = JSON.stringify(value);
		
		      localStorage[key] = value;   
		    }
		
		    if (localStorage[key] !== undefined) {
		      return JSON.parse(localStorage[key]);
		    }
		},
		getDistrictLabel: function(v){
			const districtMap = {
			    KNA: "강남구",
			    KDA: "강동구",
			    KBA: "강북구",
			    KSA: "강서구",
			    NWA: "노원구",
			    DBA: "도봉구",
			    SCA: "서초구",
			    SPA: "송파구",
			    YGA: "영등포구",
			    JRA: "종로구",
			    JGA: "중구"
  			};

  			return districtMap[v] || '';			
		},
		formatDateWithOffset: function(date) {
		  const pad = (n) => n.toString().padStart(2, '0');
		
		  const year = date.getFullYear();
		  const month = pad(date.getMonth() + 1);
		  const day = pad(date.getDate());
		  const hours = pad(date.getHours());
		  const minutes = pad(date.getMinutes());
		  const seconds = pad(date.getSeconds());
		
		  // 타임존 오프셋 계산
		  const offset = -date.getTimezoneOffset(); // 분 단위
		  const sign = offset >= 0 ? '+' : '-';
		  const offsetHours = pad(Math.floor(Math.abs(offset) / 60));
		  const offsetMinutes = pad(Math.abs(offset) % 60);
		
		  const timezone = `${sign}${offsetHours}${offsetMinutes}`;
		
		  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}${timezone}`;
		},
		result: function (rs, rsDataSet) {
		    const rsData = [];
		    let hits;
		
		    if (rs?.data?.[rsDataSet]?.hits?.hits) {
		        hits = rs.data[rsDataSet].hits.hits;
		    } else if (rs?.[rsDataSet]?.hits?.hits) {
		        hits = rs[rsDataSet].hits.hits;
		    }
		
		    // hits 없으면 빈 배열 반환
		    if (!hits) return rsData;
		
		    for (const hit of hits) {
		        const item = {
		            ...hit._source,
		            _id: hit._id,
		            _index: hit._index
		        };
		        rsData.push(item);
		    }
		
		    return rsData;
		},
		resultOne: function (rs, rsDataSet) {
		    const raw = rs?.data?.[rsDataSet];
		
		    if (!raw || !raw._source) return null;
		
		    // 안전하게 복사 후 _id 병합
		    const result = { ...raw._source, _id: raw._id };
		
		    return result;
		},
		resultNum: function (rs, rsDataSet, table) {
		    var rsData = [];
		    var hits;
		
		    if (rs?.data?.[rsDataSet]?.hits?.hits) {
		        hits = rs.data[rsDataSet].hits.hits;
		    } else if (rs?.[rsDataSet]?.hits?.hits) {
		        hits = rs[rsDataSet].hits.hits;
		    }
		
		    // 유효한 hits 없으면 빈 배열 반환
		    if (!hits) return rsData;
		
		    const start = table.page.info().start;
		
		    for (let i = 0; i < hits.length; i++) {
		        const hit = hits[i];
		        const item = hit._source;
		        item._index = hit._index;
		        item._id = hit._id;
		        item.num = rs.recordsFiltered - (start + i);
		        rsData.push(item);
		    }
		
		    return rsData;
		}
	};
}));
