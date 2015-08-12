var urlInfo = window.location.href;
var urlHeader;

//http프로토콜 접속 시 https로 리다이렉트(IE9.0이하 크로스 도메인 오류문제로)
if (document.location.protocol !== 'https:') {
	 var sHref = location.href;
	 console.log('HTTP접속: ' + sHref);
	 var goUrl = sHref.replace('http','https')
	 console.log('HTTP접속변경주소: ' + goUrl);
	 //location.replace(goUrl);

} else {
	console.log('HTTPS 접속중');
}

//IE9 이하 크로스 도메인 문제 해결 jQuery
$.support.cors = true;

/* 서버에 따른 API분기*/
//개발 서버
if( urlInfo.indexOf('dev') > 0 || urlInfo.indexOf('61.250.21.156') > 0 ) {
	urlHeader = 'https://webdev.sktsmarthome.com:9002/';
//스테이징 서버	
} else if( urlInfo.indexOf('stg') > 0 || urlInfo.indexOf('61.250.21.180') > 0 || urlInfo.indexOf('localhost') > 0 ) {
	urlHeader = 'https://webstg.sktsmarthome.com:9002/';
//상용 서버
} else {
	urlHeader = 'https://www.sktsmarthome.com:9002/';
}

/**** Cros Domain 해결 
1) 서버에서 크로스도메인 허용
2) 도메인 호스트명 일치시킴(webdev, webstg)
3) jQuery 허용  $.support.cors = true;
4) SSL적용((IE9 이하 크로스 도메인 문제 해결 : 프로토콜 일치 시킴) ****/

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
function parseAuthRequestTransaction(response, $context, type, callback) {
	// U.getRemainedTimeDisplay();
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
			// dvcOsNm			가입 기기
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

			if(!rsAddress && response.dvcOsNm == 'WEB') {
				rsAddress =	"스마트홈 앱에서 등록 가능합니다.";
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
			U.dialog();
		} else {			
			changePasswordFail(false, $el, response);
		}
	} else {
		changePasswordFail(false, $el, response);
	}
}

function startUseCouponTransaction(url, type, dataType, callback) {
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

		var diffDay;	

		if (response.resultCd == '1' && response.resultMsg == '성공') {
			if (rsUseProdList && rsUseProdList.length > 0) {
				for(var i=0; i<rsUseProdList.length; i++) {
					var endDtm = diff_day(rsUseProdList[i].svcEndDtm);
					var userCnt = rsUseProdList[i].userCnt;
					if(endDtm > -1) {
						diffDay = 'Y';
					}
				}					
				setCouponList(rsUseProdList, 'UP');
					//기간이 유효한 이용권이 남아 있는 경우 
					if(diffDay == 'Y') {
					console.log("사용중인 유효 이용권이 존재합니다."+endDtm+'일 남음');	
						this.useTicket = 'Y';
					}	
			}

			if (rsRegCpnList && rsRegCpnList.length > 0) {
				for(var i=0; i<rsRegCpnList.length; i++) {
					var endDtm = rsRegCpnList[i].regValidEndDay;
					if(endDtm = '9999') {
						diffDay = 'Y';
					} else {
						endDtm = diff_day(rsUseCpnList[i].regValidEndDay);
						if(endDtm > -1) {
							diffDay = 'Y';
						}	
					}	
					var userCnt = rsRegCpnList[i].userCnt;
				}
				setCouponList(rsRegCpnList, 'RC');
					if(diffDay == 'Y') {
					console.log("등록된 유효 쿠폰이 존재합니다."+endDtm+'일 남음');	
						this.useRegCoupon = 'Y';
					}
			}

			if (rsUseCpnList && rsUseCpnList.length > 0) {
				for(var i=0; i<rsUseCpnList.length; i++) {
					var endDtm = rsUseCpnList[i].regValidEndDay;
					if(endDtm = '9999') {
						diffDay = 'Y';
					} else {
						endDtm = diff_day(rsUseCpnList[i].regValidEndDay);
						if(endDtm > -1) {
							diffDay = 'Y';
						}	
					}		
					var userCnt = rsUseCpnList[i].userCnt;
				}
				setCouponList(rsUseCpnList, 'UC');
					if(diffDay == 'Y') {
					console.log("사용중인 유효 쿠폰이 존재합니다."+endDtm+'일 남음');	
						this.useCoupon = 'Y';
					}				
			} else {
				console.log("사용중인 유효 쿠폰이 없습니다.");
			}

			if (this.useTicket != 'Y' && this.useRegCoupon != 'Y' && this.useCoupon != 'Y' && rsUseProdList.length == 0 && rsRegCpnList.length == 0 && rsUseCpnList.length == 0 && rsRegCpnList.length == 0) {
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

//천단위 ,콤마
function numComma(num){
   num = String(num);
   return num.replace(/(\d)(?=(?:\d{3})+(?!\d))/g,"$1,");
};	

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

		//가족회원 수 
		var fUserCnt = dataList[i].userCnt-1;

		if (kind == 'UP') { // 사용중인 이용권
			var autoPay = dataList[i].autopayStatCd == '001' ? '자동 결제' : '자동 결제 취소'
			var payWayCd = dataList[i].payWayCd;
			var payWayCdDp;
			if (payWayCd == 'CPN') {
				payWayCdDp = '쿠폰';
			} else if (payWayCd == 'CRD') {
				payWayCdDp = '신용카드';
			} else if (payWayCd == 'MOB') {
				payWayCdDp = '모바일';
			}
    		var liCnt1 = dataList.length;   			

			output += '<li class="coupon h-item">';
			output += '	<div class="coupon-holder has-coupon-active">';
			output += '		<div class="coupon-status-sign">사용중</div>';
			output += '		<p class="coupon-title">'+dataList[i].prodNm+'</p>';
			output += '		<p class="coupon-payment">'+ autoPay +'<span>|</span>'+ payWayCdDp +'('+numComma(dataList[i].salePrc)+'원/월, VAT포함)';
			if(dataList[i].userCnt > 1) {
				output += '		<p class="coupon-payment">'+dataList[i].userCnt+'인용(정회원 1인 + 가족회원 '+fUserCnt+'인)</p>';
			} else {
				output += '		<p class="coupon-payment">'+dataList[i].userCnt+'인용(정회원 1인)</p>';				
			}			
			output += '		<p class="coupon-status">';
			output += '			<span class="coupon-duration">결제예정일 : '+dataList[i].svcEndDtm+'</span>';
			output += '		</p>';
			output += '		<div class="bt-coupon-holder has-bt-group">';								
			output += '			<button class="bt-coupon-item coupon-bt-type-chg" type="button" onclick=ticketChangePopup("'+dataList[i].userCnt+'","'+dataList[i].payNo+'","'+dataList[i].prodNo+'","'+dataList[i].svcEndDtm+'")>이용권 변경</button>';
			if(dataList[i].autopayStatCd == '001') {
				output += '			<button class="bt-coupon-item coupon-bt-type-cancel" type="button" onclick=ticketAutoPayStopPopup()>자동결제 해지</button>';
			} else {
				output += '			<button class="bt-coupon-item coupon-bt-type-cancel" type="button" onclick=AutoPayCancelPopup("AutoPayCancelAleady")>자동결제 해지</button>';	
			}
			output += '		</div>';
			output += '	</div>';
			output += '</li>';

		} else if (kind == 'RC') { // 등록한 쿠폰
			//기간이 지난 경우 노출하지 않도록 추가
			var endDtm = (dataList[i].regValidEndDay == '9999')?"":diff_day(dataList[i].regValidEndDay);
			if(dataList[i].regValidEndDay == '9999' || endDtm > -1) {
    		var liCnt2 = dataList.length;   			
				output += '<li class="coupon h-item">';
				output += '	<div class="coupon-holder has-coupon-ribbon">';
				//output += '		<div class="coupon-status-sign">사용중</div>';		
				output += '		<p class="coupon-title">'+dataList[i].cpnNm+'</p>';
				if(dataList[i].userCnt > 1) {
					output += '		<p class="coupon-payment">'+dataList[i].userCnt+'인용(정회원 1인 + 가족회원 '+fUserCnt+'인)</p>';
				} else {
					output += '		<p class="coupon-payment">'+dataList[i].userCnt+'인용(정회원 1인)</p>';				
				}
				output += '		<p class="coupon-status">';
				if(dataList[i].regValidEndDay != '9999') {
					output += '			<span class="coupon-duration">사용 유효기간 : '+dataList[i].regValidEndDay+'까지</span>';
				} else {
					output += '			<span class="coupon-duration">사용 유효기간 : 무기한</span>';							
				}	
				output += '		</p>';
				output += '		<div class="bt-coupon-holder">';
				//이용권이 먼저 사용 중이면 쿠폰 사용 불가, 반대는 가능함.
				if(this.useTicket == 'Y' || this.useCoupon =='Y') {
					output += '			<button class="bt-coupon-item coupon-bt-type-use" type="button" onclick=couponRegFail("USE")>쿠폰 사용</button>';	
				} else {	
				//output += '			<button class="bt-coupon-item coupon-bt-type-use" type="button" onclick=couponUsePopup("'+dataList[i].cpnPubNo+'^'+encodeURIComponent(dataList[i].cpnNm)+'^'+dataList[i].userCnt+'^'+dataList[i].regValidEndDay+'")>쿠폰 사용</button>';
					output += '			<button class="bt-coupon-item coupon-bt-type-use" type="button" onclick=couponUsePopup("'+dataList[i].cpnPubNo+'")>쿠폰 사용</button>';
				}
				output += '		</div>';				
				output += '	</div>';
				output += '</li>';
			}	

		} else if(kind == 'UC') {				// 사용중인 쿠폰
			//기간이 지난 경우 노출하지 않도록 추가
			var endDtm = (dataList[i].regValidEndDay == '9999')?"":diff_day(dataList[i].regValidEndDay);
			if(dataList[i].regValidEndDay == '9999' || endDtm > -1) {
    		var liCnt3 = dataList.length;   							
				output += '<li class="coupon h-item">';
				output += '	<div class="coupon-holder has-coupon-ribbon has-coupon-active">';
				output += '		<div class="coupon-status-sign">사용중</div>';
				output += '		<p class="coupon-title">'+dataList[i].cpnNm+'</p>';
				if(dataList[i].userCnt > 1) {
					output += '		<p class="coupon-payment">'+dataList[i].userCnt+'인용(정회원 1인 + 가족회원 '+fUserCnt+'인)</p>';
				} else {
					output += '		<p class="coupon-payment">'+dataList[i].userCnt+'인용(정회원 1인)</p>';				
				}			
				output += '		<p class="coupon-status">';
				//output += '			<span class="coupon-usable">'+dataList[i].cpnUseYn+'</span>';
				if(dataList[i].regValidEndDay != '9999') {
				output += '			<span class="coupon-duration">'+dataList[i].regValidStartDay +'~'+ dataList[i].regValidEndDay+'</span>';
				} else {
				output += '			<span class="coupon-duration">사용 유효기간 : 무기한</span>';			
				}
				output += '		</p>';	
				output += '	</div>';
				output += '</li>';
			}
	    	var liCnt3 = dataList.length; 	
		}
    };

    	var liCnt = (liCnt1)?liCnt1:0+(liCnt2)?liCnt2:0+(liCnt3)?liCnt3:0;    	
		var j = (liCnt<3)?3-(liCnt):liCnt%3;

		if (liCnt > 0) {
			for (var i=0; i < j; i++) {
				output += '<li class="coupon h-item">';
					output += '<div class="coupon-holder is-placeholder">';
					output += '</div>';
				output += '</li>';
			}
		}
    	console.log("Size: "+liCnt+", j:"+j+" ,"+output);
	// $couponContainer.html(output);
	if ($couponContainer.children().length > 0) {
    	$couponContainer.children().last().after($(output));
    } else {
    	$couponContainer.append($(output));
    }   	
}

function startMyInfoTransaction(url, type, dataType, callback) {
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
            	//alert('로그인이 정보가 만료되어 재로그인이 필요합니다.');
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

//FAQ 요청
function startFaqListTransaction(url, type, dataType, callback) {
	var that = this;
    $.ajax({
        url: urlHeader+url,
        data: '',
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

// FAQ 요청 파싱
function parseFaqListTransaction(response) {
	if (response.resultCd && response.resultMsg) {
		if (response.resultCd == '1' && response.resultMsg == '성공') {
			if(response.resultList.length > 0) {
				var output = '';
				var $faqContainer = $('.faqs.expandable');
				var dataList = response.resultList;

				for (var i=0; i<dataList.length; i++) {

					output += '<li class="faq expandable-item">';
					output += '	<h2 class="question expandable-handle"><span>'+dataList[i].title+'</span></h2>';
					output += '	<div class="answer-holder expandable-content">';
					output += '		<p>'+dataList[i].content+'</p>';
					output += '	</div>';
					output += '</li>';
				}	

				 //$faqContainer.html(output);
				if ($faqContainer.children().length > 0) {
			    	$faqContainer.children().last().after($(output));
			    } else {
			    	$faqContainer.append($(output));
			    }


			} else {

			}
		} else {
			console.log("실패 사유 :"+response.resultMsg);
		}
	} else {
			console.log("System Fail");
	}
}
