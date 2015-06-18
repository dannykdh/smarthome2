var U = SmartHomeUI.init();

// 이메일 아이디 유효성 체크
function isEmailIDCheck ($id) {
	var regex=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;   
	  
	if(regex.test($id.val()) === false) { 
	    return false;  
	} else {  
	    return true;
	}  
}

function loginCheckForm($context) {
	var $myId = $('#myId');
	var $myPass = $('#myPass');
	var params = {}, url='v1/member/login', type='GET', dataType = 'json';
	var $elId = $context.find('form').find('input[type=text]');
	var $elPwd = $context.find('form').find('input[type=password]');

	if ($myId.val().length == 0) {
		U.invalidate($elId, '스마트홈 계정 (이메일)을 입력하세요.'); 
		$myId.focus();
		return false;
	} else {
		U.invalidate($elId);
	}

	if (!isEmailIDCheck($myId)) {
		U.invalidate($elId, '스마트홈 계정 (이메일)을 형식에 맞게 입력하세요.'); 
		return;
	}

	if ($myPass.val().length == 0) {
		U.invalidate($elPwd, '비밀번호를 입력하세요');
		$myPass.focus();
		return false;
	} else {
		U.invalidate($elPwd);
	}


	params = {				
		loginId:$myId.val(),
		loginPwd:$myPass.val(),
		pushTknVal: '',
		dvcTknVal:'172.16.1.151',
		dvcOsNm:'WEB'
	};
	startLoginTransaction(url, params, type, dataType, function(response){
		parseLoginTransaction(response);
	});

}

// 로그인 실패.
// 1. 로그인 팝업 commed button 상단에 실패 사유를 노출한다.
// 2. 아이디 / 패스워드 필드를 초기와 한다.
// 3. 아이디 필드에 포커싱.
function loginFail(response) {
	var $myPass = $('#myPass');
	var $elPwd = $('.dialog.dialog-log-in').find('form').find('input[type=password]');

	if (response.resultCd != '1' || response.resultMsg != '성공') {
		U.invalidate($elPwd, response.resultMsg);
		$myPass.focus();
		return false;
	} 
}

// 로그인 성공
function loginComplete(response) {
	// 쿠키에 담을 정보를 세팅한다.
	/*
		expEndDay: ""
		loginId: "btb@btb.com"
		modeSer: ""				: 
		notifSetYn: ""			: 알림설정여부
		resultCd: "1"			: 로그인 결과 코드
		resultMsg: "성공"			: 로그인 결과 메세지
		rnmCertYn: "N"			: 실명인증 여부
		rsdcDefltAddr: null		: 거주지 상세주소
		rsdcDetailAddr: null
		rsdcLatLoca: null
		rsdcLongLoca: null
		svrfileUrl: "1"
		userAuthCd: "GEN"
		userCertTknVal: "vBVbrb88bK6Ns0EaKsTnPkYxoB3mG4U3HUlSZptaMMzqs1QGUXyrOmRbI5fFQ0cN"
		userIdEncoded: "e1ygX943/2Wi0eb7NOoxC7AosV+r6FI8"
		userMobileNo: "01032853908"
		userNickNm: "비티비테스트"
	*/
	var loginId = response.loginId			// 이메일 아이디
	var userNickNm = response.userNickNm		// 사용자 닉네임		
	var userCertTknVal = response.userCertTknVal	// 인증토큰
	var userAuthCd = response.userAuthCd		// 회원 종류 ("EXP 체험회원, GEN 일반회원, HST 호스트회원, SUB 서브회원")
	var userMobileNo = response.userMobileNo	// 사용자 휴대전화 번호
	var rnmCertYn = response.rnmCertYn		// 실명인증여부
	var cookieData = {
		loginId: loginId, 
		userNickNm: userNickNm, 
		userCertTknVal: userCertTknVal, 
		userAuthCd: userAuthCd, 
		userMobileNo: userMobileNo, 
		rnmCertYn: rnmCertYn
	};

	setCookieInfo(cookieData);
	setLoginBeforeAfterUpdate();
	//팝업 닫기
	U.closeDialog();
}

// 로그인 성공시 쿠키 정보 세팅
function setCookieInfo(cookieData) {
	var exdate = new Date();
    
    exdate.setDate(exdate.getDate() + 1);

	for (var key in cookieData) {
        document.cookie = key + "=" + (escape(cookieData[key]) + "; expires=" + exdate.toGMTString());
	}
}

// 로그인 여부 체크
function isLoginCheck() {
	var isUserCertTknVal = getCookieInfo('userCertTknVal');
	if (isUserCertTknVal) {
		return true;
	} else {
		return false;
	}
	return false;
}

// 로그인후 세팅된 쿠키 값을 가져온다.
function getCookieInfo(cookieName) {
	var search = cookieName + "=";
	var cookies = document.cookie;

	if (cookies.length > 0) {
		startIndex = cookies.indexOf( cookieName );
		if (startIndex != -1) {
			startIndex += cookieName.length;
			endIndex = cookies.indexOf( ";", startIndex );
			if( endIndex == -1) endIndex = cookies.length;
			return unescape( cookies.substring( startIndex + 1, endIndex ) );
		} else {
			// 쿠키 내에 해당 쿠키가 존재하지 않을 경우
			return false;
		}
	} else {
		// 쿠키 자체가 없을 경우
		return false;
	}
}

// 로그 아웃
function logOut() {
	deleteCookieInfo();
	setLoginBeforeAfterUpdate();
}

// 로그아웃 성공시 쿠키 정보 삭제
function deleteCookieInfo() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        name = name.trim();
        
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    }
}

// 로그인 전후 Updagte.
function setLoginBeforeAfterUpdate() {
	// 상단 헤더 영역 로그인 / 아웃 Update
	var $account_for_guest = $('.account-for-guest.h-bar');; 
	var $account_for_user = $('.account-for-user.h-bar');;
	if (isLoginCheck()) {
		$account_for_guest.hide();
		$account_for_user.show();

		$account_for_user.find('.gnb-user-name').html(getCookieInfo('userNickNm') + '님')
	} else {
		$account_for_guest.show();
		$account_for_user.hide();
	}
}

// 아이디 찾기 인증번호 요청
function findIDCheckCellPhone($context) {
	var $js_cellPhone = $('#js_cellPhone');
	var params = {}, url='v1/member/certification', type='GET', dataType = 'json';
	var $elPhone = $context.find('form').find('input[type=text]').eq(0);

	if ($js_cellPhone.val().length == 0) {
		U.invalidate($elPhone, '휴대폰 번호를 입력하세요.'); 
		$elPhone.focus();
		return false;
	} else {
		U.invalidate($elPhone);
	}

	params = {				
		mobileNo:$js_cellPhone.val()
	};

	startAuthRequestTransaction(url, params, type, dataType, function(response){
		parseAuthRequestTransaction(response, $context);
	});
}

// 아이디 찾기 유효성 검사
function findIDCheckForm($context) {
	var $js_cellPhone = $('#js_cellPhone');
	var $js_authNumber = $('#js_authNumber');
	var params = {}, url='v1/member/userCertification', type='GET', dataType = 'json';
	var $elPhone = $context.find('form').find('input[type=text]').eq(0);
	var $elAuth = $context.find('form').find('input[type=text]').eq(1);


	if ($js_cellPhone.val().length == 0) {
		U.invalidate($elPhone, '휴대폰 번호를 입력하세요.'); 
		$elPhone.focus();
		return false;
	} else {
		U.invalidate($elPhone);
	}

	if ($js_authNumber.val().length == 0) {
		U.invalidate($elAuth, '인증번호를 입력하세요'); 
		$elAuth.focus();
		return false;
	} else {
		U.invalidate($elAuth);
	}

	params = {				
		mobileNo: $js_cellPhone.val(),
		certNo: $js_authNumber.val()
	};

	startAuthNumTransaction(url, params, type, dataType, function(response){
		parseAuthNumTransaction(response, 'findID');
	});
	
}

// 입력 폼 초기화 및 버튼 비 활성
function inputBoxReset($context) {
	var $js_cellPhone = $('#js_cellPhone');
	var $js_authNumber = $('#js_authNumber');
	var $elPhone = $context.find('form').find('input[type=text]').eq(0);
	var $elAuth = $context.find('form').find('input[type=text]').eq(1);
	
	$('#js_bt-send-number').prop("disabled", true);	
	$elAuth.prop("disabled", true);

	$elPhone.val('');
	$elAuth.val('');
	$elPhone.focus();
}

// 인증번호 전송 시 부터 출력되는 유효시간
function timeLimitCheck($context) {
	/**
	*  남은 시간을 표시하는 예제입니다.
	*  편의 상 현재 분/초를 zero-leading없이 표시합니다.
	*/
	var $elAuth = $context.find('form').find('input[type=text]').eq(1);
	var $btnAuth = $context.find('#js_bt-send-number').val() ? $context.find('#js_bt-send-number') : $context.find('.bt-send-number');
	
	$btnAuth.prop("disabled", false);	
	$btnAuth.val('재전송');
	$elAuth.prop("disabled", false);
	$elAuth.focus();

	var timeLeft = 120;

	var num = function(str) {
		if (str < 0) {
			return '0' + str;
		} else {
			return str;
		}		
	}

	var timeDisplay = U.getRemainedTimeDisplay($context);
	var date = new Date();

	// timeDisplay.show().setTime(date.getMinutes() + ':' + date.getSeconds());

	interval = setInterval(function() {
		timeLeft = (timeLeft <= 0) ? 0 : --timeLeft;

		var hours = num(Math.floor(timeLeft / 3600));
		var minuts = num(Math.floor((timeLeft - 3600 * hours) / 60));
		var seconds = num(timeLeft % 60);
		timeDisplay.show().setTime(minuts + ':' + seconds);

		if (minuts == 0 && seconds == 0) {
			// 에러 메시지 노출
			U.invalidate_txt($elAuth, '인증시간이 초과되었습니다. 인증번호를 재전송 하세요.');

			// 입력 폼 초기화
			inputBoxReset($context);

			// 남은 시간 초기화
			timeDisplay.hide();

			clearInterval(interval);
		}
	}, 1000);
	//-- 남은 시간 표시 예제 종료
}

// 로그인 여부에 따른 gnb-holder Update
$(document).ready(function() {
	setLoginBeforeAfterUpdate();
});

