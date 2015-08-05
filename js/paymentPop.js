var U = SmartHomeUI.init();

/* 서버에 따른 URL 분기(모바일 링크를 사용해야 오류가 안남 - 실명인증과 결제가 모바일 URL로 되어 있음 */
var urlIp;
//개발 서버
if( urlInfo.indexOf('dev') > 0 || urlInfo.indexOf('61.250.21.156') > 0 ) {
	urlpay = 'http://61.250.21.156:9002/';
//스테이징 서버	
} else if( urlInfo.indexOf('stg') > 0 || urlInfo.indexOf('61.250.21.180') > 0 || urlInfo.indexOf('localhost') > 0 ) {
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
					setTicketList(bargainousTicketList, 'UP');
			}

			if (!bargainousTicketList && bargainousTicketList.length == 0 ) {
			}
		} else {

		}
	} else {

	}
}

function setTicketList(dataList, kind) {	
	var output = '';
	var $ticketContainer = $('.voucher-cards');

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
				if(dataList[i].dvcRegYn !='Y') {	//등록된 기기가 없으면 
					output += '		<button class="bt-purchase-credit" type="button" onclick=payPopupFail("haveDevice")>신용카드 결제</button>';
					output += '		<button class="bt-purchase-cell" type="button" onclick=payPopupFail("haveDevice")>휴대폰 결제</button>';	
				} else {				
					output += '		<button class="bt-purchase-credit" type="button" onclick=window.open("'+cardHref[i]+'","카드결제","width=450,height=620,toolbar=no,menubar=no,location=no,status=no,scrollbars=no,resizable=no")>신용카드 결제</button>';
					output += '		<button class="bt-purchase-cell" type="button" onclick=window.open("'+hphoneHref[i]+'","휴대폰결제","width=480,height=750,toolbar=no,menubar=no,location=no,status=no,scrollbars=no,resizable=no")>휴대폰 결제</button>';				
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
					guidePopup(msgId);
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

//기기 등록 안내, 자동결제 완료 확인 팝업 : 비슷한 포맷 
function guidePopup(msgId) {

	var templateId = 'dialog-register-devices';	

		switch (msgId) {
			case 'haveDevice': templateId = 'dialog-register-devices';	//등록 기기 안내
				break;	
			case 'AutoPayCancel': templateId = 'dialog-payment-cancel-complete';	//자동결제 완료 확인 팝업
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
	if (response.resultCd && response.resultMsg) {
		if (response.resultCd == '1' && response.resultMsg == '성공') {
			console.log("쿠폰 등록 성공"+response.resultMsg);
				//사용중인 쿠폰 유무 조회
				var params = {}, url='v1/payment/pay', type='GET', dataType = 'json';
				startUseCouponTransaction(url, type, dataType, function(response){
					parseUseCouponRegTransaction(response);					
				});					
		} else {
			console.log("쿠폰 등록 실패 사유 :"+response.resultCd);
			couponRegFail(response.resultCd);
		}
	} else {
			console.log("쿠폰 등록 System Fail");
	}
}

//등록된 쿠폰 사용 유무 파싱
function parseUseCouponRegTransaction(response) {
	if (response.resultCd && response.resultMsg) {
		var rsUseCpnList = response.useCpnList;		// 사용중인 쿠폰 리스트

		var haveCpnYn;
		var couponNum = response.cpnNo;

		if (response.resultCd == '1' && response.resultMsg == '성공') {
			if (rsUseCpnList && rsUseCpnList.length > 0) {
				haveCpnYn = 'Y'
				console.log("사용중인 쿠폰이 존재합니다.");
				couponRegOk(haveCpnYn,couponNum);
			} else {
				haveCpnYn = 'N'
				console.log("사용중인 쿠폰이 없습니다.");
				couponRegOk(aveCpnYn,couponNum);				
			}
		} else {

		}
	} else {

	}
}

function couponRegOk(msgId, cpnNum) {

	var templateId;

		switch (msgId) {
			case 'Y': templateId = 'dialog-coupon-register-success';	//쿠폰 등록 성공 후 사용중인 쿠폰이 존재할 때 팝업
				break;
			case 'N': templateId = 'dialog-coupon-register-now-use';	//쿠폰 등록 성공 후 사용중인 쿠폰이 없을 때 바로 사용 팝업
				break;				
			default:
		}	

	U.dialog({
		templateId: templateId,
		onOpen: function(context) {
			$(context).find('.bt-confirm').on('click', function() {
				U.dialog();

				if(msgId == 'Y') {
					confirmPopup(templateId,cpnNum);
				} else {	
					confirmPopup(templateId,cpnNum);
				}	
			});
			$(context).find('.bt-cancel').on('click', function() {
				//팝업 취소
				U.closeDialog();
			});				
		}
	})
}

//쿠폰 등록 사용 확인 팝업
function confirmPopup(msgId,cpnNum) {

	var templateId = msgId;

	U.dialog({
		templateId: templateId,
		onOpen: function(context) {

			if(msgId == 'dialog-coupon-register-success') {
				$(context).find('.bt-dialog-coupon-confirm').on('click', function() {
					U.dialog();					
				});
				$(context).find('.bt-cancel').on('click', function() {
					//팝업 취소
					U.closeDialog();
				});				
			} else {
				$(context).find('.bt-now').on('click', function() {
					U.dialog();	
					//지금 사용 팝업
					couponAgreePopup(cpnNum);			
				});
				$(context).find('.bt-after').on('click', function() {
					//팝업 취소
					U.closeDialog();
				});	
			}
		}
	})
}

//쿠폰 사용 이용동의 팝업(쿠폰 등록 후 바로 호출하는 경우와 쿠폰리스트에서 쿠폰 사용 클릭 분리 필요 : 현재는 리스트에서 들어오는 경우)
function couponAgreePopup(couponInfo) {

	var templateId;
		templateId = 'dialog-coupon-register-user-agreement';

	U.dialog({
		templateId: templateId,
		onOpen: function(context) {

		//동의 체크여부 확인 필요, 버튼 비활성화  
		$('.bt-next').prop("disabled", true);

			$("input[type='checkbox']").change(function() {
				var chkObj = $("input[id='agree-service-coupon']");
				if($("input[id='agree-service-coupon']:checked").length > 0) {
					chkObj.prop("checked",true);
					$('.bt-next').prop("disabled", false);								
				} else {
					$('.bt-next').prop("disabled", true);	
					chkObj.prop("checked",false);
				}
			});	

			//넘어온 정보를 분리하기
			var cpnInfo = couponInfo.split('^');
			var cpnNo = cpnInfo[0];
			var title = cpnInfo[1];
			var cnt = cpnInfo[2];
			var endDate = cpnInfo[3];

			var cpnName = decodeURIComponent(title);

			var $js_coupon_title = $('#title');
			var $js_coupon_contents = $('#contents');
			var $js_coupon_expiry = $('#expiry');

			var userCntInfo;
			var fCnt = cnt-1;
			if(cnt > 1) {
				userCntInfo = cnt+"인용 (정회원 1인 + 가족회원 "+fCnt+"인)";
			} else {
				userCntInfo = "1인용 (정회원 1인)";
			}

			$js_coupon_title.html(cpnName);
			$js_coupon_contents.html(userCntInfo);
			$js_coupon_expiry.html("사용 유효기한 "+endDate);

			$(context).find('.bt-next').on('click', function() {				
				//약관 동의 후 바로 사용 처리 			
				U.dialog();
				couponRegproc(cpnNo);
			});
			$(context).find('.bt-prev').on('click', function() {
				//팝업 취소 
				U.closeDialog();
			});				
		}
	})
}

//쿠폰 등록 후 사용 처리  
function couponRegproc(cpnNum) {
	
	var params = {}, url='v1/payment/coupon', type='POST', dataType = 'json';

	params = {					
		cpnPubNo: cpnNum
	};

	console.log("CPN:"+cpnNum);
	startCouponRegProcTransaction(url, params, type, dataType, function(response){
		parseCouponRegProcTransaction(response);
	});

 }

// 쿠폰 등록 요청 후 바로 사용 요청
function startCouponRegProcTransaction(url, params, type, dataType, callback) {
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

// 쿠폰 등록 요청 후 바로 사용 파싱 
function parseCouponRegProcTransaction(response) {
	if (response.resultCd && response.resultMsg) {
		if (response.resultCd == '1' && response.resultMsg == '성공') {
			console.log("쿠폰 바로 사용 처리 성공"+response.resultMsg);			
		} else {
			console.log("실패 사유 :"+response.resultCd);
		}
	} else {
			console.log("System Fail");
	}
}

//날짜 차이 
function diff_day(value2){

	var dt;
    dt = new Date();
    dt = dt.getFullYear() + "." + (dt.getMonth() + 1) + "." + dt.getDate();

	var arr1 = dt.split('.');
	var arr2 = value2.split('.');

	var dt1 = new Date(arr1[0], arr1[1], arr1[2]);
	var dt2 = new Date(arr2[0], arr2[1], arr2[2]);

	var diff = dt2 - dt1;
	var day = 1000 * 60 * 60 *  24;
	var month = day * 30;

	//console.log("차이 일수 : " + (parseInt(diff/day)));
    return (parseInt(diff/day));
	//console.log("차이 월수 : " + parseInt(diff/month));

	// document.write("차이 년수 : " + parseInt(diff/year));
}

//이용권 리스트에서 버튼 클래스 bt-coupon-item coupon-bt-type-chg(쿠폰변경)  bt-coupon-item coupon-bt-type-chg-cancel(자동결제 해지)  
//bt-coupon-item coupon-bt-type-chg-use(쿠폰사용)  agree-service-right(동의)

//이용권 변경(1인 <-> 가족)
function ticketChangePopup(userCntPayNo) {

	var templateId;

		/*넘어온 정보를 분리하기 : 이용권 번호로 트랜잭션 */
		//현재 사용중인 이용권 정보
		var userCntPayInfo = userCntPayNo.split(',');
		var userCnt = userCntPayInfo[0];
		var payNumber = userCntPayInfo[1];
		var prodNum = userCntPayInfo[2];	
		var svcEndDtm = userCntPayInfo[3];
		var diffDay = diff_day(svcEndDtm);

		var $msgPanel = $('.dialog-content-panel'); 

		if (userCnt > 1) {
			templateId =  'dialog-ticket-change';	//1인 이용권 변경 팝업
		} else {
			templateId = 'dialog-family-ticket-change';	//가족 이용권 변경 팝업 
		}

	U.dialog({
		templateId: templateId,
		onOpen: function(context) {		

			//잔여일		
			$(context).find('#js_n_day').html(diffDay);

			//동의 체크여부 확인 필요, 버튼 비활성화  
				$('.bt-confirm').prop("disabled", true);
				$("input[type='checkbox']").change(function() {
					if (userCnt > 1) {
						var chkObj = $("input[id='agree-service-right']");
						if($("input[id='agree-service-right']:checked").length > 0) {
							chkObj.prop("checked",true);
							$('.bt-confirm').prop("disabled", false);	
						} else {
							$('.bt-confirm').prop("disabled", true);	
							chkObj.prop("checked",false);
						}	
					} else {
						var chkObj = $("input[id='agree-ticket-change']");
						if($("input[id='agree-ticket-change']:checked").length > 0) {
							chkObj.prop("checked",true);
							$('.bt-confirm').prop("disabled", false);
						} else {
							$('.bt-confirm').prop("disabled", true);	
							chkObj.prop("checked",false);
						}											
					}	

					//변경할 이용권번호, 사용자 수
					var prodNumber;
					var usrCnt;

					//이용권 변경 조회(변경할 수 있는 이용권 조회 : 결제 번호로 조회)
						var payNo = payNumber;
						var params = {}, url='v1/payment/changeProd', type='GET', dataType = 'json';

						params = {					
							payNo:payNo
						};

						startTicketChangeProcTransaction(url, params, type, dataType, userCnt, function(response){
							parseTicketChangeProcTransaction(response, userCnt, function(response, prodNumber, usrCnt) {
							});  		
						});

				});				

			$(context).find('.bt-confirm').on('click', function() {
				var agreeVal = 'Y';

				//1인 <-> 가족 이용권으로 변경 처리
				ticketChangeDo(payNumber,prodNumber,agreeVal,usrCnt);

				U.dialog();
	
			});
		}
	})
}

//이용권 변경 조회 요청
function startTicketChangeProcTransaction(url, params, type, dataType, userCnt, callback) {
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

//이용권 변경 조회 요청 후 파싱 
function parseTicketChangeProcTransaction(response, userCnt, callback) {
	if (response.resultCd && response.resultMsg) {
		if (response.resultCd == '1' && response.resultMsg == '성공') {

			prodNumber = response.resultList[0].prodNo;
		    usrCnt = response.resultList[0].userCnt;

		    //현재 가족 이용권 사용중이면, 조회한 이용권이 1인 이용권 선택 
		    if(userCnt > 1 ) {
		    	if(response.resultList[0].userCnt == 1) {
					prodNumber = response.resultList[0].prodNo;
				    usrCnt = response.resultList[0].userCnt;
				} else { 
					prodNumber = response.resultList[1].prodNo;
				    usrCnt = response.resultList[1].userCnt;				
				}    
			//현재 1인 이용권 사용중이면, 조회한 이용권은 가족 이용권 선택 
		    } else {
		    	if(response.resultList[0].userCnt > 1) {
					prodNumber = response.resultList[0].prodNo;
				    usrCnt = response.resultList[0].userCnt;
				} else { 
					prodNumber = response.resultList[1].prodNo;
				    usrCnt = response.resultList[1].userCnt;				
				}  
		    }
	
			callback(response, usrCnt, prodNumber);

		} else {
			console.log("실패 :"+response.resultCd);
				}
	} else {
			console.log("System Fail");
	}
} 

//이용권 변경 처리 
function ticketChangeDo(payNumber,prodNum,chgAgrYn,userCnt) {
	var payNo = payNumber;
	var prodNo = prodNum;
	var chgAgrYn = chgAgrYn;

	var params = {}, url='v1/payment/doChangeProd', type='POST', dataType = 'json';

	params = {					
		payNo:payNo,
		prodNo:prodNo,
		chgAgrYn:chgAgrYn
	};

	startTicketChangeDoTransaction(url, params, type, dataType, function(response){
		parseTicketChangeDoTransaction(response,userCnt,payNo);
	});

 } 

//이용권 변경 처리 요청
function startTicketChangeDoTransaction(url, params, type, dataType, callback) {
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

//이용권 변경 처리 후 파싱 
function parseTicketChangeDoTransaction(response, userCnt, payNo) {
	if (response.resultCd && response.resultMsg) {
		if (response.resultCd == '1' && response.resultMsg == '성공') {
			console.log("성공 :"+response.resultMsg);		
			finishPopup(userCnt, payNo)
		} else {
			console.log("실패 :"+response.resultCd);
		}
	} else {
			console.log("System Fail");
	}
}

/*이용권 변경 후 결제 결과 조회 : 이용권 변경 완료 후 조회*/
function ticketChangeProc(payNumber,userCnt,callback) {
	var payNo = payNumber;
	var params = {}, url='v1/payment/payResultInfo', type='GET', dataType = 'json';

	params = {					
		payNo:payNo
	};

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

/*
grpUserCnt: 0
payAmt: 2200
payNo: "PAY00000002947"
payWayCd: "MOB"
payWayInfo: "01054668390"
prodNm: "가족 이용권 (5인)"
prodNo: "PRD0000002"
resultCd: "1"
resultMsg: "성공"
salePrc: 2200
svcEndDtm: "2015.09.04"
svcStartDtm: "2015.08.04"
userCnt: 5
*/
			var prodNm,payWayCd,salePrc,svcStartDtm,svcEndDtm,payWayCdDp;
			prodNm = response.prodNm;
			payWayCd = response.payWayCd;
			salePrc = response.salePrc;
			svcStartDtm = response.svcStartDtm;
			svcEndDtm = response.svcEndDtm;

			if (payWayCd == 'CPN') {
				payWayCdDp = '쿠폰';
			} else if (payWayCd == 'CRD') {
				payWayCdDp = '신용카드';
			} else if (payWayCd == 'MOB') {
				payWayCdDp = '모바일';
			}

            callback(prodNm, payWayCdDp, salePrc, svcStartDtm, svcEndDtm);          
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log('실패 - ', xhr);
        }
    });
 }

//이용권 변경 완료 확인 팝업  
function finishPopup(msgId, payNo) {

	var templateId = 'dialog-ticket-payment';	
	var userCnt = msgId;

	ticketChangeProc(payNo, userCnt, function(prodNm, payWayCdDp, salePrc, svcStartDtm, svcEndDtm){
		var $js_result = $('.result'); 		 
		var $js_sub_result = $('.sub-result'); 	 
		var $js_expiry = $('.expiry');	 

		//천단위 ,콤마
		var numComma = function(num){
		   num = String(num);
		   return num.replace(/(\d)(?=(?:\d{3})+(?!\d))/g,"$1,");
		};

		var rst, subRst, expiry;
			rst = prodNm;
			subRst = "자동결제 <span>|</span> "+payWayCdDp+" 결제 ("+numComma(salePrc)+"원/월)";
			expiry = "이용 유효기간 "+svcStartDtm+" ~ "+svcEndDtm;

		$js_result.html(rst);
		$js_sub_result.html(subRst);
		$js_expiry.html(expiry);
	}); 

	U.dialog({
		templateId: templateId,
		onOpen: function(context) {
			$(context).find('.bt-confirm').on('click', function() {
				U.dialog();
				//부모창 새로고침 추가 
				//window.opener.location.reload();
			});		
		}
	})
}

//자동결제 해지요청 팝업 
function ticketAutoPayStopPopup() {

	var templateId;
		templateId = 'dialog-payment-cancel';

	U.dialog({
		templateId: templateId,
		onOpen: function(context) {
			$(context).find('.bt-confirm').on('click', function() {
				U.dialog();
				//해지 처리 진행
				autoPayCancel();
			});
			$(context).find('.bt-cancel').on('click', function() {
				//팝업 취소 
				U.closeDialog();
			});				
		}
	})
}

//자동결제 해지 
function autoPayCancel() {
	
	var params = {}, url='v1/payment/autoPay', type='POST', dataType = 'json';

	startAutoPayCancelTransaction(url, type, dataType, function(response){
		parseAutoPayCancelTransaction(response);
	});

 }

//자동결제 해지 처리 요청
function startAutoPayCancelTransaction(url, type, dataType, callback) {
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

//자동결제 해지 처리 후 파싱 
function parseAutoPayCancelTransaction(response) {
	if (response.resultCd && response.resultMsg) {
		if (response.resultCd == '1' && response.resultMsg == '성공') {
			console.log("성공 :"+response.resultMsg);		
			AutoPayCancelPopup('AutoPayCancel');
		} else {
			console.log("실패 :"+response.resultCd);
		}
	} else {
			console.log("System Fail");
	}
}

//자동결제 해지 처리 완료 / 이미 처리된 경우 확인 팝업  
function AutoPayCancelPopup(msgId) {

	var templateId;

		switch (msgId) {
			case 'AutoPayCancel': templateId = 'dialog-payment-cancel-complete';	//자동결제 해지 처리 완료 팝업
				break;
			case 'AutoPayCancelAleady': templateId = 'dialog-payment-cancel-aleady';	//이미 처리된 경우 확인 팝업
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

function couponRegFail(msgId) {

	var templateId;

		switch (msgId) {
			case '1302': templateId = 'dialog-coupon-invalid-number';	//유효하지 않은 쿠폰 번호
				break;
			case '8000': templateId = 'dialog-coupon-invalid-number';	//빈값 입력 시(버튼 비활성화로 차단됨)
				break;				
			case '1303': templateId = 'dialog-coupon-duplicated';	//중복된 쿠폰 번호
				break;
			case '1304': templateId = 'dialog-coupon-expired';		//만료된 쿠폰 번호
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
	if (response.resultCd && response.resultMsg) {
		if (response.resultCd == '1' && response.resultMsg == '성공') {
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
					

				//숫자 두자리 맞추기	00
				var leadingZeros = function (strL, num) {
					 var zero = '';
					 strL = strL.toString();
					
					 if (strL.length < num) {
					  for (i = 0; i < num - strL.length; i++)
					   zero += '0';
					 }
					 return zero + strL;
				}
				//console.log("숫자 자리수"+leadingZeros(7,2));

				for (var i=0; i<dataList.length; i++) {

					var j=i+1;
					var jj= leadingZeros(j,2);

					output += '<tbody>';
					output += '<tr>';
					output += '<td class="usage-grid-data dt-num">'+jj+'</td>';
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
