var urlHeader = 'http://mobiledev.sktsmarthome.com:9002/';

// 로그인 트랜잭션 시작
function startLoginTransaction(url, params, type, dataType, callback) {
	var that = this;
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

// 로그인 결과 파싱
function parseLoginTransaction(response) {
	console.log('parseLoginTransaction : ' + response);
	if (response.resultCd && response.resultMsg) {
		if (response.resultCd == '1' && response.resultMsg == '성공') {
			loginComplete(response);
		} else {
			loginFail(response);
		}
	} else {
		loginFail(response);
	}
}

// 본인 확인 인증 번호 요청
function startAuthRequestTransaction(url, params, type, dataType, callback) {
	var that = this;
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

// 본인 확인 인증 번호 요청 파싱
function parseAuthRequestTransaction(response, $context) {
	// U.getRemainedTimeDisplay();
	timeLimitCheck($context);
	console.log('parseAuthRequestTransaction : ' + response);
}

// 본인 확인 인증 번호 송신
function startAuthNumTransaction(url, params, type, dataType, callback) {
	var that = this;
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

// 본인 확인 인증 번호 송신 후 파싱
function parseAuthNumTransaction(response, kind) {
	console.log('parseAuthNumTransaction : ' + response);
	// 처리해야 하는 내용
	// 1. 인증번호가 맞을 경우 resultCd, resultMsg
	//	1-1. 아이디 검색 트랜잭션을 바로 태운다.
	// 2. 인증번호가 맞지 않을 경우
	//	2-1. 에러 메시지를 화면에 노출하고
	//	2-2. 필드값 초기화
	var resultCd = response.resultCd, resultMsg = response.resultMsg;
	var $js_cellPhone = $('#js_cellPhone');
	var params = {}, url='v1/member/searchLoginId', type='GET', dataType = 'json';

	params = {				
		mobileNo: $js_cellPhone.val()
	};

	if (resultCd && resultMsg && resultCd == 1 && resultMsg == '성공') {
		if (kind == 'findID') { // 아이디 찾
			startFindIDTransaction (url, params, type, dataType, function(response){
				parseFindIDTransaction(response);
			});
		} else if (kind == 'findPwd') { // 비밀번호 찾기

		} else { // 회원가입시

		}
	} else {
		// TODO 본인 인증 번호 송신 결과 실패일 경우
	}
}

// 본인 확인 인증 번호 송신 후 인증 성공 시 아이디 조회
function startFindIDTransaction(url, params, type, dataType, callback) {
	var that = this;
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

function parseJoinTransaction(response, callback) {
	console.log('parseJoinTransaction : ' + response);
	if (response.resultCd && response.resultMsg) {
		if (response.resultCd == '1' && response.resultMsg == '성공') {
			callback(true);
		} else {
			callback(false);
		}
	} else {
		callback(false);
	}
}

// 회원가입
function startJoinTransaction(url, params, type, dataType, callback) {
	var that = this;
    $.ajax({
        url: urlHeader+url,
        data: JSON.stringify(params),
        type: type,
        dataType: dataType,
	    contentType : "application/json;charset=UTF-8", 
        success: function(response) {
            callback(response);
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log('실패 - ', xhr);
        }
    });
}

// 본인 확인 인증 번호 송신 후 인증 성공 시 아이디 조회 후 파힝 노출
function parseFindIDTransaction(response) {
	var resultCd = response.resultCd, resultMsg = response.resultMsg;
	// 입력한 휴대전화 정보가 맞다면 
	if (resultCd && resultMsg && resultCd == 1 && resultMsg == '성공') {
		findIdOrPasswordResult(response);
	} else {
		// TODO 아이디 조회 실패일 경우.
	}
}
