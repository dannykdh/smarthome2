var U = SmartHomeUI.init();

/* 서버에 따른 URL 분기(모바일 링크를 사용해야 오류가 안남 - 실명인증과 결제가 모바일 URL로 되어 있음 */
var urlIp;
//개발 서버
if( urlInfo.indexOf('dev') > 0 || urlInfo.indexOf('61.250.21.156') > 0 || urlInfo.indexOf('localhost') > 0) {
	urlpay = 'http://61.250.21.156:9002/';
//스테이징 서버	
} else if( urlInfo.indexOf('stg') > 0 || urlInfo.indexOf('61.250.21.180') > 0 ) {
	urlpay = 'https://mobilestg.sktsmarthome.com:9002/';
//상용 서버
} else {
	urlpay = 'https://mobile.sktsmarthome.com:9002/';
}


//사용자 토큰 정보 
var UserCertTknVal = getCookieInfo('userCertTknVal');
var UserCertTknValPay = encodeURIComponent(UserCertTknVal);

//본인인증 연동 도메인 - transation.js에서 분기 필요

//아이핀 실명인증 팝업 호출	rnmCertYn 실명인증 결과 업데이트 필요!!!(jsp에서?)
function realNmIpin() {
	window.open(urlpay+'auth/ipin?authToken='+UserCertTknValPay+'&osType=W&kindCd=002','Ipin','width=40%,height=90%,toolbar=no,menubar=no,location=no,status=no,scrollbars=no,noresize');
}

//휴대폰 본인인증(실명인증) 팝업 호출
function realNmHphone() {
	window.open(urlpay+'auth/impay?authToken='+UserCertTknValPay+'&osType=W','Phone','width=450,height=620,toolbar=no,menubar=no,location=no,status=no,scrollbars=no,noresize');
}

		// dvcRegYn: "Y"
		// grpUserCnt: 1
		// prodKindCd: "001"
		// prodNm: "1인 이용권"
		// prodNo: "PRD0000001"
		// prodTypeCd: "001"
		// salePrc: 1100
		// userCnt: 1

		// dvcRegYn: "Y"
		// grpUserCnt: 1
		// prodKindCd: "002"
		// prodNm: "가족 이용권 (5인)"
		// prodNo: "PRD0000002"
		// prodTypeCd: "001"
		// salePrc: 2200
		// userCnt: 5	

//구매 가능한 쿠폰
function startBargainousTicketTransaction(url, type, dataType, callback) {
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

function parseBargainousTicketTransaction(response) {
	if (response.resultCd && response.resultMsg) {
		var bargainousTicketList = response.resultList;	//구매 가능한 이용권 리스트

		if (response.resultCd == '1' && response.resultMsg == '성공') {
			console.log('parseBargainousTicketTransaction : ' + response.resultMsg);
			if (bargainousTicketList && bargainousTicketList.length > 0) {
				//for(var i=0; i<rsUseProdList.length; i++) {
					setTicketList(bargainousTicketList, 'UP');
				//}
			}

			if (!bargainousTicketList && bargainousTicketList.length == 0 ) {
				//setEmptyTicketList();
			}
		} else {
			// TODO : 계정관리 통신 오류 시 처리할 예외 상황에 대한 시나리오가 없어 '사용가능한 이용권/쿠폰이 없습니다'로 처리
			//setEmptyTicketList();
		}
	} else {
		// TODO : 계정관리 통신 오류 시 처리할 예외 상황에 대한 시나리오가 없어 '사용가능한 이용권/쿠폰이 없습니다'로 처리
		//setEmptyTicketList();
	}
}

function setEmptyTicketList() {	
	// var output = '';
	// var $emptyCouponContainer = $('.coupons-holder');

	// output += '<div class="no-coupon"><p class="coupon-empty">사용 가능한 이용권/쿠폰이 없습니다.</p></div>';
 //    $couponContainer.html(output);
 //임시테스트	$('body').removeClass('has-coupon');
}

function setTicketList(dataList, kind) {	
	var output = '';
	//임시테스트 var $ticketContainer = $('.coupons.h-bar');
	var $ticketContainer = $('.voucher-cards');
	// $.each(dataList, function() {

		// dvcRegYn: "Y"
		// grpUserCnt: 1
		// prodKindCd: "001"
		// prodNm: "1인 이용권"
		// prodNo: "PRD0000001"
		// prodTypeCd: "001"
		// salePrc: 1100
		// userCnt: 1

		// dvcRegYn: "Y"
		// grpUserCnt: 1
		// prodKindCd: "002"
		// prodNm: "가족 이용권 (5인)"
		// prodNo: "PRD0000002"
		// prodTypeCd: "001"
		// salePrc: 2200
		// userCnt: 5		


	//천단위 ,콤마
	var numComma = function(num){
	   num = String(num);
	   return num.replace(/(\d)(?=(?:\d{3})+(?!\d))/g,"$1,");
	};

	for (var i=0; i<dataList.length; i++) {
		if (kind == 'UP') { // 구매 가능 이용권

 		var hphoneHref = [];
			hphoneHref[i] = urlpay+'pay/run?authToken='+encodeURIComponent(UserCertTknVal)+'&osType=W'+'&prodNo='+dataList[i].prodNo+'&prodNm='+encodeURIComponent(dataList[i].prodNm)+'&salePrc='+dataList[i].salePrc;
		var cardHref = [];
			cardHref[i] = urlpay+'pay/iniRun?authToken='+encodeURIComponent(UserCertTknVal)+'&osType=W'+'&prodNo='+dataList[i].prodNo+'&prodNm='+encodeURIComponent(dataList[i].prodNm)+'&salePrc='+dataList[i].salePrc;

		var msg = "등록된 기기가 없어 이용권을 결제할 수 없습니다. 스마트홈 앱에서 기기를 먼저 등록해 주세요.";

		var rnmCertYn = getCookieInfo("rnmCertYn");
			console.log("실명인증 여부: "+rnmCertYn);

			if(i==0) {
			output += '<div class="voucher-card" style="margin-right: 21px;">';
			} else {
			output += '<div class="voucher-card">';
			}
			output += '		<div class="voucher-card-content">';
			if(dataList[i].prodKindCd == '002') {
			output += '			<div class="voucher-type familly">';
			output += '				<p class="voucher-payment">자동결제 ('+numComma(dataList[i].salePrc)+'원 / 월, VAT포함)</p>';
			output += '				<p class="voucher-info">정회원 1인 + 가족회원 '+ (dataList[i].userCnt - 1) +'인</p>';
			} else {
			output += '			<div class="voucher-type one-man">';
			output += '				<p class="voucher-payment">자동결제 ('+numComma(dataList[i].salePrc)+'원 / 월, VAT포함)</p>';
			output += '				<p class="voucher-info">정회원 1인</p>';
			}
			output += '			</div>';
			output += '		</div>';
			output += '		<div class="voucher-card-buttons">';
			if(rnmCertYn != "Y") {	//실명인증 전이면
			output += '			<button class="bt-purchase-credit" type="button" onclick=payPopupFail("realName")>신용카드 결제</button>';
			output += '			<button class="bt-purchase-cell" type="button" onclick=payPopupFail("realName")>휴대폰 결제</button>';	
			} else {
				if(dataList[i].dvcRegYn !='N') {	//등록된 기기가 없으면 
					output += '		<button class="bt-purchase-credit" type="button" onclick=payPopupFail("haveDevice")>신용카드 결제</button>';
					output += '		<button class="bt-purchase-cell" type="button" onclick=payPopupFail("haveDevice")>휴대폰 결제</button>';	
				} else {				
					output += '		<button class="bt-purchase-credit" type="button" onclick=window.open("'+cardHref[i]+'","카드결제","width=450,height=620,toolbar=no,menubar=no,location=no,status=no,scrollbars=no,resizable=no")>신용카드 결제</button>';
					output += '		<button class="bt-purchase-cell" type="button" onclick=window.open("'+hphoneHref[i]+'","휴대폰결제","width=480,height=720,toolbar=no,menubar=no,location=no,status=no,scrollbars=no,resizable=no")>휴대폰 결제</button>';				
				}
			}
			output += '		</div>';
			output += '</div>';			
		} 
    };

	//$ticketContainer.html(output);
	if ($ticketContainer.children().length > 0) {
    	$ticketContainer.children().last().after($(output));
    } else {
    	$ticketContainer.append($(output));
    }
}

function payPopupFail(msgId) {

	var templateId;

		switch (msgId) {
			case 'realName': templateId = 'dialog-name-verify-info';	//실명 인증 안내
				break;
			case 'haveDevice': templateId = 'dialog-register-devices';	//등록 기기 안내
				break;	
			case 'realNamePop': templateId = 'dialog-name-verify';	//실명 인증 선택 팝업
				break;							
			default:
		}	

	U.dialog({
		templateId: templateId,
		onOpen: function(context) {
			$(context).find('.bt-confirm').on('click', function() {
				U.dialog();

				if(msgId == 'haveDevice') {
					devicePopup(msgId);
				} else {	
					realPopup(msgId);
				}	
			});
			$(context).find('.bt-cancel').on('click', function() {
				//팝업 취소
				U.closeDialog();
			});				
		}
	})
}

//기기 등록 안내 팝업
function devicePopup(msgId) {

	var templateId = 'dialog-register-devices';	

	U.dialog({
		templateId: templateId,
		onOpen: function(context) {
			$(context).find('.bt-confirm').on('click', function() {
				U.dialog();
			});		
		}
	})
}

//실명 인증
function realPopup(msgId) {

	var templateId = 'dialog-name-verify';	

	U.dialog({
		templateId: templateId,
		onOpen: function(context) {
			$(context).find('.verify-ipin').on('click', function() {
				U.dialog();
				realNmIpin();
			});
			$(context).find('.verify-mobile').on('click', function() {
				U.dialog();
				realNmHphone();
			});				
		}
	})
}

//비회원 결제 시도 시 
function payLoginPopup() {

	var templateId = 'dialog-ticket-purchase-info';	

	U.dialog({
		templateId: templateId,
		onOpen: function(context) {
			$(context).find('.bt-confirm').on('click', function() {
				U.dialog();
				reLogin();
			});
			$(context).find('.bt-cancel').on('click', function() {
				U.dialog();
			});				
		}
	})
}

/* 테스트 휴대폰 소액 결제 팝업 호출 prodNo	prodNm	salePrc
function pgHphone(href) {
	console.log(href);
	window.open(href);
}

//신용카드 결제 팝업 호출 prodNo	prodNm	salePrc
function pgCard(href) {
	console.log(href);
	window.open(href);
}

//테스트 결제 정보
	var prodNo = "PRD0000001";
	var prodNm = "1인 이용권";
	var salePrc = "1100";

//휴대폰 소액 결제 팝업 호출 테스트 prodNo	prodNm	salePrc
function pgHp() {
	var href = urlHeader+'pay/run?authToken='+UserCertTknVal+'&osType=W'+'&prodNo='+prodNo+'&prodNm='+prodNm+'&salePrc='+salePrc;
	console.log(href);
	window.open(href);
}

//신용카드 결제 팝업 호출 테스트 prodNo	prodNm	salePrc
function pgCd() {
	console.log(urlHeader+'pay/iniRun?authToken='+UserCertTknVal+'&osType=W'+'&prodNo='+prodNo+'&prodNm='+prodNm+'&salePrc='+salePrc);
	window.open(urlHeader+'pay/iniRun?authToken='+UserCertTknVal+'&osType=W'+'&prodNo='+prodNo+'&prodNm='+prodNm+'&salePrc='+salePrc);
}
*/


//쿠폰 등록
function couponReg() {
	var $couponNum = $('#coupon-reg-input');
	var agreeYn = 'Y';
	var params = {}, url='v1/payment/regCoupon', type='POST', dataType = 'json';

	params = {					
		cpnPubNo:$couponNum.val(),
		useAgrYn:agreeYn
	};
	startCouponRegTransaction(url, params, type, dataType, function(response){
		parseCouponRegTransaction(response);
	});

 }

// 쿠폰 등록 요청
function startCouponRegTransaction(url, params, type, dataType, callback) {
	console.log ('쿠폰 등록 요청 : '+type);
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

// 쿠폰 등록 요청 파싱
function parseCouponRegTransaction(response) {
	// U.getRemainedTimeDisplay();
	console.log('[쿠폰 등록 요청 후 결과 처리]');
	if (response.resultCd && response.resultMsg) {
		if (response.resultCd == '0' && response.resultMsg == '성공') {
			console.log("쿠폰 등록 성공"+response.resultMsg);
				//사용중인 쿠폰 유무 조회
				var params = {}, url='v1/payment/pay', type='GET', dataType = 'json';
				startUseCouponTransaction(url, type, dataType, function(response){
					parseUseCouponTransaction(response);		
				});					
		} else {
			console.log("쿠폰 등록 실패 사유 :"+response.resultMsg);
			couponRegFail(response.resultCd);
		}
	} else {
			console.log("쿠폰 등록 System Fail");
	}
}

function couponRegFail(resultCd) {

	var templateId;

		switch (resultCd) {
			case '1302': templateId = 'dialog-coupon-invalid-number';
				break;
			case '8000': templateId = 'dialog-coupon-invalid-number';	//빈값 입력 시 (버튼 비활성화로 막음)
				break;				
			case '1303': templateId = 'dialog-coupon-duplicated';
				break;
			case '1304': templateId = 'dialog-coupon-expired';
				break;
			default:
		}	

	U.dialog({
		templateId: templateId,
		onOpen: function(context) {
			$(context).find('.bt-confirm').on('click', function() {
				U.dialog();
			});
		}
	})
}

// 이용내역 요청
function startUseCouponHistoryTransaction(url, type, dataType, callback) {
	console.log ('이용내역 : '+type);
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

// 이용내역 요청 파싱
function parseUseCouponHistoryTransaction(response) {
	console.log('[이용내역 리스트]');
	if (response.resultCd && response.resultMsg) {
		if (response.resultCd == '1' && response.resultMsg == '성공') {
			console.log("조회 성공 :"+response.resultMsg);			
			if(response.resultList.length > 0) {
				$('#has-usage').addClass('has-usage');
				console.log(response.resultList.length);

				var output = '';
				var $couponContainer = $('.usage-grid-list');
				var dataList = response.resultList;

				/*				
					dvcNm: ""
					grpUserCnt: 0
					payAmt: 1100
					payDtm: "2015.07.03"
					payWayCd: "MOB"
					payWayCdNm: "모바일"
					prodNm: "1인 이용권"
					salePrc: 0
					svcEndDtm: "2015.08.03"
					svcStartDtm: "2015.07.03"
					userCnt: 1

					*/

				for (var i=0; i<dataList.length; i++) {

					var j=i+1;
					output += '<tbody>';
					output += '<tr>';
					output += '<td class="usage-grid-data dt-num">'+j+'</td>';
					output += '<td class="usage-grid-data dt-coupon">'+dataList[i].prodNm+'</td>';
					output += '<td class="usage-grid-data dt-settling-day">'+dataList[i].payDtm+'</td>';
					output += '<td class="usage-grid-data dt-payment">'+dataList[i].salePrc+'원</td>';
					output += '<td class="usage-grid-data dt-payment-option">'+dataList[i].payWayCdNm+'</td>';
					output += '<td class="usage-grid-data dt-usage-expiration">'+dataList[i].svcStartDtm+'~'+dataList[i].svcEndDtm+'</td>';
					output += '</tr>';
					output += '</tbody>';
				}	

				 //$couponContainer.html(output);
				if ($couponContainer.children().length > 0) {
			    	$couponContainer.children().last().after($(output));
			    } else {
			    	$couponContainer.append($(output));
			    }


			} else {
				$('#has-usage').removeClass('has-usage');
			}
		} else {
			console.log("실패 사유 :"+response.resultMsg);
		}
	} else {
			console.log("System Fail");
	}
}





					
						function goPayTransaction() {
							//API 통신을 위한 파라미터 값
							var params = {}, url='pay/run', type='get', dataType = 'json';

							var UserCertTknVal = getCookieInfo('userCertTknVal');

							params = {				
								authToken : UserCertTknVal,
								osType : 'W',
								prodNo :"PRD0000001",
								prodNm : "1인 이용권",
								salePrc : "1100"						
							};

							startPopTransaction(url, params, type, dataType, function(response){

							});				
						}

						function startPopTransaction(url, params, type, dataType, callback) {
							var that = this;
							urlpay = 'http://61.250.21.156:9002/';

						    $.ajax({
						        url: urlpay+url,
						        //data: JSON.stringify(params),
				                data: params,
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
