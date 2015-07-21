var urlInfo = window.location.href;
var urlHeader;

/* 서버에 따른 API분기*/
//개발 서버
if( urlInfo.indexOf('dev') > 0 || urlInfo.indexOf('61.250.21.156') > 0 || urlInfo.indexOf('localhost') > 0) {
	urlHeader = 'http://mobiledev.sktsmarthome.com:9002/';
//스테이징 서버	
} else if( urlInfo.indexOf('stg') > 0 || urlInfo.indexOf('61.250.21.180') > 0 ) {
	urlHeader = 'https://mobilestg.sktsmarthome.com:9002/';
//상용 서버
} else {
	urlHeader = 'https://mobile.sktsmarthome.com:9002/';
}

// 서버에 따른 분기가 가능하기 전까지는 서버에 맞게 수정하여 빌드해야 함.
//DEV 서버
//urlHeader = 'http://mobiledev.sktsmarthome.com:9002/';
//STG 서버
//urlHeader = 'https://mobilestg.sktsmarthome.com:9002/';
//상용 서버
//urlHeader = 'https://mobile.sktsmarthome.com:9002/';

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
	console.log ('본인 확인 인증번호 요청 : '+type);
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
function parseAuthRequestTransaction(response, $context, type, callback) {
	// U.getRemainedTimeDisplay();
	console.log('[인증 번호 요청 후 결과 처리] type : ' + type);
	if (type == 'pass') {
		callback(response, $context, type);
	} else {
		timeLimitCheck(response, $context, type);
	}
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
function parseAuthNumTransaction(response, kind, callback) {
	console.log('parseAuthNumTransaction : ' + response);
	// 처리해야 하는 내용
	// 1. 인증번호가 맞을 경우 resultCd, resultMsg
	//	1-1. 아이디 검색 트랜잭션을 바로 태운다.
	// 2. 인증번호가 맞지 않을 경우
	//	2-1. 에러 메시지를 화면에 노출하고
	//	2-2. 필드값 초기화
	var resultCd = response.resultCd, resultMsg = response.resultMsg;
	var $js_authNumber = $('#js_authNumber');
	var $js_cellPhone = $('#js_cellPhone');
	var params = {}, url='v1/member/searchLoginId', type='GET', dataType = 'json';

	params = {				
		userMobileNo: $js_cellPhone.val()
	};

	if (resultCd && resultMsg && resultCd == 1 && resultMsg == '성공') {
		if (kind == 'findID') { // 아이디 찾
			startFindIDTransaction (url, params, type, dataType, function(response){
				callback(response);
			});
		} else if (kind == 'findPWD') { // 비밀번호 찾기
			startFindPWDTransaction (url, params, type, dataType, function(response){
				callback(response);
			});
		} else { // 회원가입시
			//TODO 회원 가입시 
			startJoinNextStepTransaction (url, params, type, dataType, function(response){
				callback(response);
			});
		}
	} else {
		authResponseFail($js_authNumber, resultMsg);
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

// 본인 확인 인증 번호 송신 후 인증 성공 시 아이디 조회
function startFindPWDTransaction(url, params, type, dataType, callback) {
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

// 본인 확인 인증 번호 송신 후 인증 성공 시 아이디 조회
function startJoinNextStepTransaction(url, params, type, dataType, callback) {
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

function parseJoinTransaction(response, callback) {
	console.log('parseJoinTransaction : ' + response);
	if (response.resultCd && response.resultMsg) {
		if (response.resultCd == '1' && response.resultMsg == '성공') {
			callback(true, response);
		} else {
			callback(false, response);
		}
	} else {
		callback(false, response);
	}
}

function parseMyInfoTransaction(response) {
	console.log('parseMyInfoTransaction : ' + response);
	if (response.resultCd && response.resultMsg) {
		if (response.resultCd == '1' && response.resultMsg == '성공') {
			// userAuthCd		EXP 체험회원 / GEN 일반회원 / HST 호스트회원 / SUB 서브회원
			// userNickNm		사용자 명
			// svrfileUrl		사용자 프로필 이미지 URL
			// rsdcLatLoca		거주지 위도위치
			// rsdcLongLoca		거주지 경도위치
			// rsdcDefltAddr	거주지 기본주소
			// rsdcDetailAddr	거주지 상세주소
			// rnmCertYn		실명인증 여부(Y , N)
			// dvcChgMsg		기기변경메시지
			// userMobileNo		이동전화 번호('-'없음)
			// expEndDay		체험회원 남은 일수
			// modeSer			귀가모드일련번호
			// notifSetYn		#알림_설정_여부 귀가모드 - 귀가 알림 여부(Y : N)
			var rsMemType = response.userAuthCd;
			var rsAddress = response.rsdcDefltAddr ? response.rsdcDefltAddr : '' + ' ' + response.rsdcDetailAddr ? response.rsdcDetailAddr : '';
			var rsMemHPhone = response.userMobileNo;

			switch (rsMemType) {
				case 'EXP': rsMemType = '체험회원';
					break;
				case 'GEN': rsMemType = '일반회원';
					break;
				case 'HST': rsMemType = '호스트회원';
					break;
				case 'SUB': rsMemType = '서브회원';
					break;
				default:
			}

			rsMemHPhone = rsMemHPhone.substr(0, 3) + '-' + rsMemHPhone.substr(3, 4) + '-' + rsMemHPhone.substr(7, 4)

			var $js_mem_type = $('#js_mem_type'); 		// userAuthCd
			var $js_mem_address = $('#js_mem_address'); 	// rsdcDefltAddr + rsdcDetailAddr
			var $js_mem_hphone = $('#js_mem_hphone');	// userMobileNo

			if(!rsAddress) {
				rsAddress =	"스마트홈 에서 등록 가능합니다.";
			}

			$js_mem_type.html(rsMemType);
			$js_mem_address.html(rsAddress);
			$js_mem_hphone.html(rsMemHPhone);


		} else {
			// TODO : 계정관리 통신 오류 시 처리할 예외 상황
		}
	} else {
		// TODO : 계정관리 통신 오류 시 처리할 예외 상황

	}
}

// 현재 패스워드 유효성 체크
function startChkNowPasswordTransaction(url, params, type, dataType, callback) {
	var that = this;
    $.ajax({
        url: urlHeader+url,
        data: params,
        type: type,
        dataType: dataType,
        headers: {
            "Authorization":getCookieInfo('userCertTknVal')
        },
	    contentType : "application/json;charset=UTF-8", 
        success: function(response) {
            callback(response);
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log('실패 - ', xhr);
        }
    });
}

// 현제 패스워드 유효성 체크 결과
function parseChkNowPasswordTransaction(response, url, params, type, dataType, $nowPass, $newPass) {
	if (response.resultCd && response.resultMsg) {
		if (response.resultCd == '1' && response.resultMsg == '성공') {
			console.log('parseChkNowPasswordTransaction : ' + response.resultMsg);
				startChangPasswordTransaction(url, params, type, dataType, function(response){
					parseChangePasswordTransaction(response, $newPass);
				});
		} else {			
			chkNowPasswordFail(false, $nowPass, response);
		}
	} else {
		chkNowPasswordFail(false, $nowPass, response);
	}
}

function startChangPasswordTransaction(url, params, type, dataType, callback) {
	var that = this;
    $.ajax({
        url: urlHeader+url,
        data: JSON.stringify(params),
        type: type,
        dataType: dataType,
        headers: {
            "Authorization":getCookieInfo('userCertTknVal')
        },
	    contentType : "application/json;charset=UTF-8", 
        success: function(response) {
            callback(response);
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log('실패 - ', xhr);
        }
    });
}

function parseChangePasswordTransaction(response, $el) {
	if (response.resultCd && response.resultMsg) {
		if (response.resultCd == '1' && response.resultMsg == '성공') {
			console.log('parseChangePasswordTransaction : ' + response.resultMsg);
			U.dialog();
		} else {			
			changePasswordFail(false, $el, response);
		}
	} else {
		changePasswordFail(false, $el, response);
	}
}

function startUseCouponTransction(url, type, dataType, callback) {
	var that = this;
    $.ajax({
        url: urlHeader+url,
        data: '',
        type: type,
        dataType: dataType,
        headers: {
            "Authorization":getCookieInfo('userCertTknVal')
        },
	    contentType: "application/json;charset=UTF-8", 
        success: function(response) {
            callback(response);
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log('실패 - ', xhr);
        }
    });
}

function parseUseCouponTransaction(response) {
	if (response.resultCd && response.resultMsg) {
		var rsUseProdList = response.useProdList;	// 사용중인 이용권 리스트
		var rsRegCpnList = response.regCpnList;		// 등록한 쿠폰 리스트
		var rsUseCpnList = response.useCpnList;		// 사용중인 쿠폰 리스트

		var rsRegCpnCnt = response.regCpnList.length;		// 등록한 쿠폰 갯수
		var $jsRegCouponCounter = $('#jsRegCouponCounter');
			$jsRegCouponCounter.html(rsRegCpnCnt);

		if (response.resultCd == '1' && response.resultMsg == '성공') {
			console.log('parseUseCouponTransaction : ' + response.resultMsg);
			if (rsUseProdList && rsUseProdList.length > 0) {
				//for(var i=0; i<rsUseProdList.length; i++) {
					setCouponList(rsUseProdList, 'UP');
				//}
			}

			if (rsRegCpnList && rsRegCpnList.length > 0) {
				//for(var i=0; i<rsRegCpnList.length; i++) {
					setCouponList(rsRegCpnList, 'RC');
				//}
			}

			if (rsUseCpnList && rsUseCpnList.length > 0) {
				//for(var i=0; i<rsUseCpnList.length; i++) {
					setCouponList(rsUseCpnList, 'UC');
				//}
			} else {
				console.log("사용중인 쿠폰이 없습니다.");
			}

			if (!rsUseProdList && !rsRegCpnList && !rsRegCpnList || rsUseProdList.length == 0 && rsRegCpnList.length == 0 && rsRegCpnList.length == 0) {
				setEmptyCouponList();
			}
		} else {
			// TODO : 계정관리 통신 오류 시 처리할 예외 상황에 대한 시나리오가 없어 '사용가능한 이용권/쿠폰이 없습니다'로 처리
			setEmptyCouponList();
		}
	} else {
		// TODO : 계정관리 통신 오류 시 처리할 예외 상황에 대한 시나리오가 없어 '사용가능한 이용권/쿠폰이 없습니다'로 처리
		setEmptyCouponList();
	}
}

function setEmptyCouponList() {	
	// var output = '';
	// var $emptyCouponContainer = $('.coupons-holder');

	// output += '<div class="no-coupon"><p class="coupon-empty">사용 가능한 이용권/쿠폰이 없습니다.</p></div>';
 //    $couponContainer.html(output);
 	$('body').removeClass('has-coupon');
}

function setCouponList(dataList, kind) {	
	var output = '';
	var $couponContainer = $('.coupons.h-bar');
	// $.each(dataList, function() {

		// cpnAmt: 0
		// cpnNm: "위닉스 쿠폰(24개월)"
		// cpnNo: "CPN0000009"
		// cpnPubNo: "tmndywsnryy9rq14"
		// cpnQty: 0
		// cpnUseYn: "N"
		// dvcCd: "DVC0000031"
		// dvcNm: "위닉스제습기(개발)"
		// grpUserCnt: 0
		// regValidEndDay: "2015.08.30"
		// userCnt: 5

	for (var i=0; i<dataList.length; i++) {
		if (kind == 'UP') { // 사용중인 이용권
			var autoPay = dataList[i].autopayStatCd == '001' ? '자동 결제' : '자동 결제 취소'
			var payWayCd = dataList[i].payWayCd;
			var payWayCdDp;
			if (payWayCd == 'CPN') {
				payWayCdDp = '쿠폰';
			} else if (payWayCd == 'CPN') {
				payWayCdDp = '신용카드';
			} else if (payWayCd == 'MOB') {
				payWayCdDp = '모바일';
			}

			//천단위 ,콤마
			var numComma = function(num){
			   num = String(num);
			   return num.replace(/(\d)(?=(?:\d{3})+(?!\d))/g,"$1,");
			};

			output += '<li class="coupon h-item">';
			output += '	<div class="coupon-holder">';
			output += '		<p class="coupon-title">'+dataList[i].prodNm+'</p>';
			output += '		<p class="coupon-payment">'+ autoPay +'<span>|</span>'+ payWayCdDp +'('+numComma(dataList[i].salePrc)+'원/월, VAT포함)';
			output += '		<br>정회원 '+ dataList[i].userCnt +'인</p>';
			output += '		<p class="coupon-status">';
			output += '			<span class="coupon-usable">사용중</span>';
			output += '			<span class="coupon-duration">결제예정일 : 2015.03.15</span>';
			output += '		</p>';
			output += '	</div>';
			output += '</li>';
		} else if (kind == 'RC') { // 등록한 쿠폰
			output += '<li class="coupon h-item">';
			output += '	<div class="coupon-holder has-coupon-ribbon">';
			output += '		<p class="coupon-title">'+dataList[i].cpnNm+'</p>';
			output += '		<p class="coupon-payment">'+dataList[i].userCnt+'인용(Host 회원 '+dataList[i].userCnt+'인 + Sub 회원 '+dataList[i].grpUserCnt+'인)</p>';
			output += '		<p class="coupon-status">';
			output += '			<span class="coupon-duration">사용 유효기간 : '+dataList[i].regValidEndDay+'까지</span>';
			output += '		</p>';
			output += '	</div>';
			output += '</li>';
		} else {				// 사용중인 쿠폰
			output += '<li class="coupon h-item">';
			output += '	<div class="coupon-holder has-coupon-ribbon">';
			output += '		<p class="coupon-title">'+dataList[i].cpnNm+'</p>';
			output += '		<p class="coupon-payment">'+dataList[i].userCnt+'인용</p>';
			output += '		<p class="coupon-status">';
			output += '			<span class="coupon-usable">'+dataList[i].cpnUseYn+'</span>';
			output += '			<span class="coupon-duration">'+dataList[i].regValidStartDay +'~'+ dataList[i].regValidEndDay+'</span>';
			output += '		</p>';
			output += '	</div>';
			output += '</li>';
		}
    };
	// $couponContainer.html(output);
	if ($couponContainer.children().length > 0) {
    	$couponContainer.children().last().after($(output));
    } else {
    	$couponContainer.append($(output));
    }
}

function startMyInfoTransction(url, type, dataType, callback) {
	var that = this;
    $.ajax({
        url: urlHeader+url,
        data: '',
        type: type,
        dataType: dataType,
        headers: {
            "Authorization":getCookieInfo('userCertTknVal')
        },
	    contentType: "application/json;charset=UTF-8", 
        success: function(response) {
            callback(response);
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log('실패 - ', xhr);
            if(xhr.status == 401) {
            	//타 단말에서 로그인 시 쿠키 정보 삭제하고 재로그인, 쿠키 정보 만료(60분 초과)
            	alert('로그인이 정보가 만료되어 재로그인이 필요합니다.');
            	deleteCookieInfo();
            	reLogin();
            }
        }
    });
}

// 회원탈퇴
function startWithDrawTransaction(url, type, dataType, callback) {
	var that = this;
    $.ajax({
        url: urlHeader+url,
        data: '',
        type: type,
        dataType: dataType,
        headers: {
            "Authorization":getCookieInfo('userCertTknVal')
        },
	    contentType: "application/json;charset=UTF-8", 
        success: function(response) {
            callback(response);
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log('실패 - ', xhr);
        }
    });
}

function parseWithDrawTransaction(response, callback) {
	console.log('parseWithDrawTransaction : ' + response);
	if (response.resultCd && response.resultMsg) {
		if (response.resultCd == '1' && response.resultMsg == '성공') {
			logOut();
			callback(true, response);
		} else {
			callback(false, response);
		}
	} else {
		callback(false, response);
	}
}

// 본인 확인 인증 번호 송신 후 인증 성공 시 아이디 조회 후 파힝 노출
function parseFindIDTransaction(response, callback) {
	var resultCd = response.resultCd, resultMsg = response.resultMsg;
	callback(response);
}

// 본인 확인 인증 번호 송신 후 인증 성공 시 다음 단계로 이동
function parseJoinNextStepTransaction(response, callback) {
	var resultCd = response.resultCd, resultMsg = response.resultMsg;
	callback(response);
}

