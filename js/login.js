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

// 로그인 여부 체크
function isLoginCheck() {

}

// 로그 아웃
function logOut() {

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
}

// 로그인 실패.
// 1. 로그인 팝업 commed button 상단에 실패 사유를 노출한다.
// 2. 아이디 / 패스워드 필드를 초기와 한다.
// 3. 아이디 필드에 포커싱.
function loginFail(response) {
	console.log('response = ' + response);
}

// 로그인 성공시 쿠키 정보 세팅
function setCookieInfo(cookieData) {
	var exdate = new Date();
    
    exdate.setDate(exdate.getDate() + 1);

	for (var key in cookieData) {
        document.cookie = key + "=" + (escape(cookieData[key]) + "; expires=" + exdate.toGMTString());
	}
}

// 로그아웃 성공시 쿠키 정보 삭제
function deleteCookieInfo() {
	var exdate = new Date();
    var cookies = document.cookie.split(";");	
    
    exdate.setDate(exdate.getDate() - 1);

	for (var key in cookies) {
        document.cookie = key + "=" + (escape(cookies[key]) + "; expires=Thu, 01 Jan 1970 00:00:00 GMT");
	}
}

// 로그인 전후 Updagte
function setLoginBeforeAfterUpdate() {

}

