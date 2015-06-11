function startLoginTransaction(url, params, type, dataType, callback) {
	var that = this;
	var urlHeader = "http://mobiledev.sktsmarthome.com:9002/";
    $.ajax({
        url: urlHeader+url,
        data: params,
        type: type,
        dataType: dataType,
        success: function(response) {
            callback(response);
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log('실패 - ', xhr);
        }
    });
}

function parseLoginTransaction(response) {
	console.log('parseLoginTransaction : ' + response);
	if (response.resultCd && response.resultMsg) {
		if (response.resultCd == '1' && response.resultMsg == '성공') {
			// 1. 로그인 팝업을 닫는다.
			// 2. 쿠키에 정보를 저장한다.
			//	2-1. 아이디
			//	2-2. 닉네임
			// 3. 로그인 전 후의 엘리먼트를 제어한다.
			// 	3-1. 상단 로그인 전후의 정보 Update.
			loginComplete(response);
		} else {
			// 로그인 실패.
			// 1. 로그인 팝업 commed button 상단에 실패 사유를 노출한다.
			// 2. 아이디 / 패스워드 필드를 초기와 한다.
			// 3. 아이디 필드에 포커싱.
			loginFail(response);
		}
	} else {
		// 로그인 실패.
	}
}