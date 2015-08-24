var U = SmartHomeUI.init();

/* 서버에 따른 URL 분기(모바일 링크를 사용해야 오류가 안남 - 실명인증과 결제가 모바일 URL로 협의됨.
 || urlInfo.indexOf('localhost') > 0  이 조건을 transaction과 아래에 추가해야 로컬 소스로 dev/stg 결제 테스트 가능함.	*/
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

//아이핀 실명인증 팝업 호출	rnmCertYn 실명인증 결과 업데이트 필요!!!(jsp에서?)
function realNmIpin() {
	window.open(urlpay+'auth/ipin?authToken='+UserCertTknValPay+'&osType=W&kindCd=002','Ipin','width=420,height=420,toolbar=no,menubar=no,location=no,status=no,scrollbars=no,noresize');
}

//휴대폰 본인인증(실명인증) 팝업 호출
function realNmHphone() {
	window.open(urlpay+'auth/impay?authToken='+UserCertTknValPay+'&osType=W','Phone','width=450,height=650,toolbar=no,menubar=no,location=no,status=no,scrollbars=no,noresize');
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
            //console.log('실패 - ', xhr);
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

	//사용중인 이용권 정보
	var params = {}, url='v1/payment/pay', type='GET', dataType = 'json';
	var userCnt;
	startUseTicketTransaction(url, type, dataType, function(payNo,userCnt,prodNm,prodNum,svcEndDtm){
			if(userCnt) {	//사용중인 이용권이 존재하면 버튼 링크 교체(dialog-ticket-purchase-in-used) 
				$('.voucher-card-buttons').remove()
				var outputChg='';
				var outputF='';
				var outputO='';
				var $ticketChgContainer = $('.voucher-cards');

			outputF += '<div class="voucher-card-buttons">';
			outputF += '	<button class="bt-purchase-credit" type="button" onclick=ticketPopup("ticketUsed","","'+encodeURIComponent(prodNm)+'","","","")>신용카드 결제</button>';
			outputF += '	<button class="bt-purchase-cell" type="button" onclick=ticketPopup("ticketUsed","","'+encodeURIComponent(prodNm)+'","","","")>휴대폰 결제</button>';	
			outputF += '</div>';

			outputO += '<div class="voucher-card-buttons">';
			outputO += '	<button class="bt-purchase-credit" type="button" onclick=ticketPopup("ticketUsed","","'+encodeURIComponent(prodNm)+'","","","")>신용카드 결제</button>';
			outputO += '	<button class="bt-purchase-cell" type="button" onclick=ticketPopup("ticketUsed","","'+encodeURIComponent(prodNm)+'","","","")>휴대폰 결제</button>';							
			outputO += '</div>';

			//msgId,payNo,prodNm,userCnt
			outputChg += '<div class="voucher-card-buttons">';					
			outputChg += '	<button class="bt-purchase-credit" type="button" onclick=ticketPopup("ticketChange","'+payNo+'","'+encodeURIComponent(prodNm)+'","'+userCnt+'","'+prodNum+'","'+svcEndDtm+'")>신용카드 결제</button>';
			outputChg += '	<button class="bt-purchase-cell" type="button" onclick=ticketPopup("ticketChange","'+payNo+'","'+encodeURIComponent(prodNm)+'","'+userCnt+'","'+prodNum+'","'+svcEndDtm+'")>휴대폰 결제</button>';							
			outputChg += '</div>';

				//$ticketChgContainer.html(outputChg);
				if ($ticketChgContainer.children().length > 0) {
					if(userCnt > 1) {
			     		$('.voucher-type.familly').prepend($(outputF));
			     		$('.voucher-type.one-man').prepend($(outputChg));				     		
			     	} else if(userCnt == 1) {
			     		$('.voucher-type.one-man').prepend($(outputO));	
			     		$('.voucher-type.familly').prepend($(outputChg));				     						     					     	
			     	} else {
			     		$('.voucher-card-content').prepend($(outputChg));
			     	}	

			    } else {
			     	$ticketChgContainer.append($(outputChg));
			    }
			}
	});	

	var rnmCertYn = getCookieInfo("rnmCertYn");

	for (var i=0; i<dataList.length; i++) {
		if (kind == 'UP') { // 구매 가능 이용권

 		var hphoneHref = [];
			hphoneHref[i] = urlpay+'pay/run?authToken='+encodeURIComponent(UserCertTknVal)+'&osType=W'+'&prodNo='+dataList[i].prodNo+'&prodNm='+encodeURIComponent(dataList[i].prodNm)+'&salePrc='+dataList[i].salePrc;
		var cardHref = [];
			cardHref[i] = urlpay+'pay/iniRun?authToken='+encodeURIComponent(UserCertTknVal)+'&osType=W'+'&prodNo='+dataList[i].prodNo+'&prodNm='+encodeURIComponent(dataList[i].prodNm)+'&salePrc='+dataList[i].salePrc;

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
				// output += '			<button class="bt-purchase-credit" type="button" onclick=payPopupFail("realName")>신용카드 결제</button>';
				// output += '			<button class="bt-purchase-cell" type="button" onclick=payPopupFail("realName")>휴대폰 결제</button>';	기
				output += '			<button class="bt-purchase-credit" type="button" onclick=retryRealNm("'+cardHref[i]+'","CD")>신용카드 결제</button>';
				output += '			<button class="bt-purchase-cell" type="button" onclick=retryRealNm("'+hphoneHref[i]+'","HP")>휴대폰 결제</button>';					
			} else {

				if(dataList[i].dvcRegYn !='Y') {	//등록된 기기가 없으면
					output += '		<button class="bt-purchase-credit" type="button" onclick=guidePopup("haveDevice")>신용카드 결제</button>';
					output += '		<button class="bt-purchase-cell" type="button" onclick=guidePopup("haveDevice")>휴대폰 결제</button>';	
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

function startUseTicketTransaction(url, type, dataType, callback) {
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

        	var rsUseProdList = response.useProdList;

			if (rsUseProdList && rsUseProdList.length > 0) {
				for(var i=0; i<rsUseProdList.length; i++) {
					var userCnt = rsUseProdList[i].userCnt;
					var payNo = rsUseProdList[i].payNo;
					var prodNm = rsUseProdList[i].prodNm;
					var prodNum = rsUseProdList[i].prodNo;
					var svcEndDtm = rsUseProdList[i].svcEndDtm;
				}			
            	callback(payNo,userCnt,prodNm,prodNum,svcEndDtm);
			}

        },
        error: function(xhr, textStatus, errorThrown) {
            //console.log('실패 - ', xhr);
        }
    });
}

//사용권 결제 시도 시 팝업 : 다른 포맷 
function ticketPopup(msgId,payNo,prodNm,userCnt,prodNum,svcEndDtm) {

	var templateId;	

		switch (msgId) {
			case 'ticketUsed': templateId = 'dialog-ticket-purchase-in-used';	//이용권 결제 시도 시 확인 팝업 : 이미 사용중 
				break;	
			case 'ticketChange': templateId = 'dialog-template-confirm-change-coupon';	//이용권 결제 시도 시 확인 팝업 : 변경 안내 팝업
				break;		
			default:
		}	

	U.dialog({
		templateId: templateId,
		onOpen: function(context) {

			var $js_prodNm = $('#js_prodNm');
			var $js_chgProdNm = $('#js_chgProdNm');
			var $js_prodNmUse = $('#js_prodNmUse');

			var chgProdNm = (userCnt > 1)?"1인 이용권":"가족 이용권 (5인)";	
			var prodNmDp = "["+decodeURIComponent(prodNm)+"]을 사용중입니다.";
			var chgProdNmDp = "["+chgProdNm+"]으로 변경하시겠습니까?";

			$js_prodNm.html(prodNmDp);	
			$js_chgProdNm.html(chgProdNmDp);
			
			$js_prodNmUse.html(decodeURIComponent(prodNm));				

			if(templateId == 'dialog-ticket-purchase-in-used') {
				$(context).find('.bt-confirm').on('click', function() {
					U.dialog();
				});	
			} else {
				$(context).find('.bt-cancel').on('click', function() {
					U.dialog();
				});	
				$(context).find('.bt-change').on('click', function() {
					ticketChangePopup(userCnt,payNo,prodNum,svcEndDtm);
				});	
			}
		}
	})
}

function payPopupFail(msgId) {

	var templateId;

	//실명인증 여부를 다시 조회하기 
	if(msgId == 'realName') {

	}

		switch (msgId) {
			case 'realName': templateId = 'dialog-name-verify-info';	//실명 인증 안내
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

				realPopup(msgId);
					
			});
			$(context).find('.bt-cancel').on('click', function() {
				//팝업 취소
				U.closeDialog();
			});				
		}
	})
}

//실명인증 여부를 다시 조회
function retryRealNm(pgLink,pgType) {
	var params = {}, url='v1/member/info', type='GET', dataType = 'json';
	startMyInfoTransaction(url, type, dataType, function(response){
		parseRealNmTransaction(response,pgLink,pgType);		
	});	
}

function parseRealNmTransaction(response,pgLink,pgType) {
	if (response.resultCd && response.resultMsg) {
		if (response.resultCd == '1' && response.resultMsg == '성공') {
			var rnmCertYn = response.rnmCertYn;
			setRealNmCertYn(rnmCertYn);

			if(rnmCertYn != 'Y') {
				payPopupFail("realName");
			} else {
				//결제 팝업 띄우기
				if(pgType == 'CD') {
					window.open(pgLink,"카드결제","width=450,height=620,toolbar=no,menubar=no,location=no,status=no,scrollbars=no,resizable=no");
				} else {
					window.open(pgLink,"휴대폰결제","width=480,height=750,toolbar=no,menubar=no,location=no,status=no,scrollbars=no,resizable=no");				
				}
			}
		} else {
		}
	} else {
	}
}

//기기 등록 안내, 자동결제 완료 확인 팝업 : 비슷한 포맷 
function guidePopup(msgId) {

	var templateId;	
		switch (msgId) {
			case 'haveDevice': templateId = 'dialog-register-devices';	//등록 기기 안내
				break;	
			case 'AutoPayCancel': templateId = 'dialog-payment-cancel-complete';	//자동결제 완료 확인 팝업
				break;	
			case '1301': templateId = 'dialog-coupon-expired';	//유효기간 만료 : 쿠폰 바로 사용 처리 시
				break;					
			case '1302': templateId = 'dialog-register-devices-coupon';	//등록 기기 없음 : 쿠폰 바로 사용 처리 시
				break;		
			case '1303': templateId = 'dialog-register-devices-name';	//등록된 기기의 기.기.명. 이 없음 : 쿠폰 바로 사용 처리 시
				break;	
			case '1304': templateId = 'dialog-register-devices-coupon-use';	//동일 기기 쿠폰이 이미 사용중임 : 쿠폰 바로 사용 처리 시
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

//결제 완료 확인 팝업  
function pgFinishPopup(payNo) {

	var templateId = 'dialog-ticket-pg';	

	ticketChangeProc(payNo, function(prodNm, payWayCdDp, salePrc, svcStartDtm, svcEndDtm){
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
			});		
		}
	})
}

//쿠폰 등록
function couponReg() {
	var $couponNum = $('#coupon-reg-input');
	var agreeYn = '';
	var params = {}, url='v1/payment/regCoupon', type='POST', dataType = 'json';

	params = {					
		cpnPubNo:$couponNum.val(),
		useAgrYn:agreeYn
	};
	startCouponRegTransaction(url, params, type, dataType, function(response){
		parseCouponRegTransaction(response);
	});

 }

// 쿠폰 등록 요청(이용동의 전)
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
            //console.log('실패 - ', xhr);
        }
    });
}

// 쿠폰 등록 요청 파싱(이용동의 전)
function parseCouponRegTransaction(response) {
	if (response.resultCd && response.resultMsg) {
		if (response.resultCd == '1' && response.resultMsg == '성공') {
				//사용중인 쿠폰 유무 조회
				var params = {}, url='v1/payment/pay', type='GET', dataType = 'json';
					startUseCouponRegTransaction(response);					
		} else {
			//console.log("쿠폰 등록 실패 사유 :"+response.resultCd);
			couponRegFail(response.resultCd);
		}
	} else {
			//console.log("쿠폰 등록 System Fail");
	}
}

// 쿠폰 등록 요청(이용동의 후)
function startCouponAgreeOkTransaction(url, params, type, dataType, callback) {
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
            //console.log('실패 - ', xhr);
        }
    });
}

// 쿠폰 등록 요청 파싱(이용동의 후)
function parseCouponAgreeOkTransaction(response,couponPubNum,haveCpnYn) {
	if (response.resultCd && response.resultMsg) {
		if (response.resultCd == '1' && response.resultMsg == '성공') {
			confirmPopup(haveCpnYn,couponPubNum,response);					
		} else {
			couponRegFail(response.resultCd);
		}
	} else {
			//console.log("쿠폰 등록 처리 System Fail");
	}
}

//등록된 쿠폰 사용 유무 확인해서 동의 팝업창 호출
function startUseCouponRegTransaction(response) {

	if (response.resultCd && response.resultMsg) {

		var haveCpnYn;
		var couponPubNum = response.cpnPubNo;

		if (response.resultCd == '1' && response.resultMsg == '성공') {
			if(this.useTicket == 'Y' || this.useCoupon =='Y') {
				haveCpnYn = 'Y'
			} else {
				haveCpnYn = 'N'
			}
			couponAgreePopup(haveCpnYn,couponPubNum,response);							
		} else {

		}
	} else {

	}
}

//쿠폰 등록 시 동의 팝업
function couponAgreePopup(haveCpnYn,couponPubNum,response) {

	var templateId;

	if(response.usePeriCd == '999') {
		templateId = 'dialog-coupon-register-user-agreement';
	} else {
		templateId = 'dialog-coupon-register-user-agreement-24';
	}	

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

			var $js_coupon_title = $('#title');
			var $js_coupon_peri = $('#peri');			
			var $js_coupon_contents = $('#contents');
			var $js_coupon_expiry = $('#expiry');

			var userCntInfo;
			var cnt = response.userCnt;
			var fCnt = response.userCnt-1;

			if(cnt > 1) {
				userCntInfo = cnt+"인용 (정회원 1인 + 가족회원 "+fCnt+"인)";
			} else {
				userCntInfo = "1인용 (정회원 1인)";
			}

			var peri = response.usePeriCd;
			var periDp;
			if(peri == '999') {
				periDp = '무제한';
			} else if (peri == '006') {
				periDp = '6 개월';
			} else if (peri == '012') {
				periDp = '12 개월';
			} else if (peri == '024') {
				periDp = '24 개월';
			} else {
				periDp = '';
			}

			$js_coupon_title.html(response.cpnNm);
			$js_coupon_peri.html(periDp+' 이용 쿠폰');			
			$js_coupon_contents.html(userCntInfo);
			//무기한 예외처리, 20150831 형태임 , 
			if(response.usePeriCd == '999') {
				$js_coupon_expiry.html("사용 유효기한 "+response.regValidEndDay+"까지");
			} else {
				$js_coupon_expiry.html("사용 유효기한 : 무제한");				
			}	

			$(context).find('.bt-next').on('click', function() {				
				
				//약관 동의 시 다시 한번 등록 시도.(동의 취소 시엔 등록이 안됨) > 확인 팝업으로
				var agreeYn = 'Y';
				var params = {}, url='v1/payment/regCoupon', type='POST', dataType = 'json';

				params = {					
					cpnPubNo:couponPubNum,
					useAgrYn:agreeYn
				};
				startCouponAgreeOkTransaction(url, params, type, dataType, function(response){
					parseCouponAgreeOkTransaction(response,couponPubNum, haveCpnYn);					
				});

				U.dialog();
			});
			$(context).find('.bt-prev').on('click', function() {
				//팝업 취소 
				U.closeDialog();
			});				
		}
	})
}

//쿠폰 등록 사용 확인 팝업(바로 사용 / 쿠폰 내역 확인)
function confirmPopup(msgId,cpnPubNum,response) {

	var templateId = msgId;

		switch (msgId) {
			case 'Y': templateId = 'dialog-coupon-register-success';	//쿠폰 등록 성공 후 사용중인 쿠폰/이용권이 존재할 때 팝업
				break;
			case 'N': templateId = 'dialog-coupon-register-now-use';	//쿠폰 등록 성공 후 사용중인 쿠폰/이용권이 없을 때 바로 사용 팝업
				break;				
			default:
		}

	U.dialog({
		templateId: templateId,
		onOpen: function(context) {

			var $js_coupon_title = $('#title');
			var $js_coupon_peri = $('#peri');						
			var $js_coupon_contents = $('#contents');
			var $js_coupon_expiry = $('#expiry');

			var userCntInfo;
			var cnt = response.userCnt;
			var fCnt = response.userCnt-1;

			if(cnt > 1) {
				userCntInfo = cnt+"인용 (정회원 1인 + 가족회원 "+fCnt+"인)";
			} else {
				userCntInfo = "1인용 (정회원 1인)";
			}

			var peri = response.usePeriCd;
			var periDp;
			if(peri == '999') {
				periDp = '무제한';
			} else if (peri == '006') {
				periDp = '6 개월';
			} else if (peri == '012') {
				periDp = '12 개월';
			} else if (peri == '024') {
				periDp = '24 개월';
			} else {
				periDp = '';
			}

			$js_coupon_title.html(response.cpnNm);
			$js_coupon_peri.html(periDp+' 이용 쿠폰');	
			$js_coupon_contents.html(userCntInfo);
			if(response.usePeriCd != '999') {
				$js_coupon_expiry.html("사용 유효기한 "+response.regValidEndDay+"까지");
			} else {
				$js_coupon_expiry.html("사용 유효기한 : 무기한");
			}

			if(templateId == 'dialog-coupon-register-success') {
				$(context).find('.bt-dialog-coupon-confirm').on('click', function() {
					U.dialog();		
					location.replace('/html/account.html');	
				});
				$(context).find('.bt-close').on('click', function() {
					//팝업 취소
					U.closeDialog();
				});				
			} else {
				$(context).find('.bt-now').on('click', function() {
					U.dialog();	
					//지금 사용 선택
					couponRegproc(cpnPubNum);
				});
				$(context).find('.bt-after').on('click', function() {
					//팝업 취소
					U.closeDialog();
				});	
			}
		}
	})
}

//내 정보 관리에서 쿠폰사용 버튼 클릭해서 들어오는 경우)
function couponUsePopup(cpnPubNo) {

	var templateId = 'dialog-template-confirm-use-coupon';	//해당 쿠폰을 사용하시겠습니까? 확인 팝업

	U.dialog({
		templateId: templateId,
		onOpen: function(context) {
			$(context).find('.bt-confirm').on('click', function() {
				U.dialog();
				couponRegproc(cpnPubNo);
			});
			$(context).find('.bt-cancel').on('click', function() {
				//팝업 취소 
				U.closeDialog();
			});						
		}
	})	
}

//쿠폰 등록 후 사용 처리  
function couponRegproc(cpnPubNum) {
	
	var params = {}, url='v1/payment/coupon', type='POST', dataType = 'json';

	params = {					
		cpnPubNo: cpnPubNum
	};

	startCouponRegProcTransaction(url, params, type, dataType, function(response){
		parseCouponRegProcTransaction(response);
	});

 }

// 쿠폰 등록 요청 / 쿠폰 사용 버튼 클릭 후 바로 사용 요청
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
            //console.log('실패 - ', xhr);
        }
    });
}

// 쿠폰 등록 요청 / 쿠폰 사용 버튼 클 후 바로 사용 파싱 
function parseCouponRegProcTransaction(response) {
	if (response.resultCd && response.resultMsg) {
		if (response.resultCd == '1' && response.resultMsg == '성공') {
				//부모창 새로고침하기 위해 다시 리다이렉.
				var goHref = location.href;
				location.replace(goHref);						
		} else {
			//console.log("실패 사유 :"+response.resultCd);
			//기기 등록 후 사용 안내 팝업 
				guidePopup(response.resultCd);
		}
	} else {
			//console.log("System Fail");
	}
}

//이용권 변경(1인 <-> 가족) 
function ticketChangePopup(userCnt,payNumber,prodNum,svcEndDtm) {

	var templateId;
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
            //console.log('실패 - ', xhr);
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
			//console.log("실패 :"+response.resultCd);
				}
	} else {
			//console.log("System Fail");
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
            //console.log('실패 - ', xhr);
        }
    });
}

//이용권 변경 처리 후 파싱 
function parseTicketChangeDoTransaction(response, userCnt, payNo) {
	if (response.resultCd && response.resultMsg) {
		if (response.resultCd == '1' && response.resultMsg == '성공') {
			finishPopup(userCnt, payNo)
		} else {
			//console.log("실패 :"+response.resultCd);
		}
	} else {
			//console.log("System Fail");
	}
}

/*결제 완료 후 결과 조회 */
function ticketChangeProc(payNumber,callback) {
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
            //console.log('실패 - ', xhr);
        }
    });
 }

//이용권 변경 완료 확인 팝업 : ticketChangeProc > 결제한 이용권 결과만 나와서 수정 필요함.
function finishPopup(msgId, payNo) {

	var templateId = 'dialog-ticket-payment';	
	var userCnt = msgId;

	ticketChangeProc(payNo, function(prodNm, payWayCdDp, salePrc, svcStartDtm, svcEndDtm){
		var $js_result = $('.result'); 		 
		var $js_sub_result = $('.sub-result'); 	 
		var $js_expiry = $('.expiry');	 

		//천단위 ,콤마
		var numComma = function(num){
		   num = String(num);
		   return num.replace(/(\d)(?=(?:\d{3})+(?!\d))/g,"$1,");
		};

		var rst, subRst, expiry;
			//rst = prodNm;
			//subRst = "자동결제 <span>|</span> "+payWayCdDp+" 결제 ("+numComma(salePrc)+"원/월)";
			if(userCnt > 1) {	//조회한 이용권 정보에 맞게 분기 처리
				rst = "가족 이용권 (5인)";
				subRst = "자동결제 <span>|</span> "+payWayCdDp+" 결제 (2,200원/월)";
			} else {
				rst = "1인 이용권";
				subRst = "자동결제 <span>|</span> "+payWayCdDp+" 결제 (1,100원/월)";				
			}
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
				//부모창 새로고침하기 위해 다시 리다이렉.
				var goHref = location.href;
				location.replace(goHref);
			});		
		}
	})
}

//자동결제 해지요청 팝업 
function ticketAutoPayStopPopup() {

	var templateId = 'dialog-payment-cancel';

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
            //console.log('실패 - ', xhr);
        }
    });
}

//자동결제 해지 처리 후 파싱 
function parseAutoPayCancelTransaction(response) {
	if (response.resultCd && response.resultMsg) {
		if (response.resultCd == '1' && response.resultMsg == '성공') {
			//부모창 새로고침하기 위해 다시 리다이렉.
			var goHref = location.href;
			location.replace(goHref);	
			//결과 팝업				
			AutoPayCancelPopup('AutoPayCancel');
		} else {
			//console.log("실패 :"+response.resultCd);
		}
	} else {
			//console.log("System Fail");
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
				//부모창 새로고침하기 위해 다시 리다이렉.
				var goHref = location.href;
				location.replace(goHref);				
			});		
		}
	})
}

function couponRegFail(msgId) {

	var templateId;

		switch (msgId) {
			case '8000': templateId = 'dialog-coupon-invalid-number';	//빈값 입력 시(버튼 비활성화로 차단됨)
				break;				
			case '1302': templateId = 'dialog-coupon-invalid-number';	//유효하지 않은 쿠폰 번호
				break;			
			case '1303': templateId = 'dialog-coupon-duplicated';	//중복된 쿠폰 번호
				break;
			case '1304': templateId = 'dialog-coupon-expired';		//만료된 쿠폰 번호
				break;
			case 'USE': templateId = 'dialog-template-disable-in-used-duration';		//이용권이나 다른 쿠폰 사용중인 경우 불가 안내 
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
            //console.log('실패 - ', xhr);
        }
    });
}

// 이용내역 요청 파싱
function parseUseCouponHistoryTransaction(response) {
	if (response.resultCd && response.resultMsg) {
		if (response.resultCd == '1' && response.resultMsg == '성공') {
			if(response.resultList.length > 0) {
				$('#has-usage').addClass('has-usage');

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
					var j = dataList.length;
					var k = j - i;
					if(k < 10) {
						k = '0'+k;	
					}
					
					var diffMonth;
					if(dataList[i].svcEndDtm == '9999') {
						diffMonth = "(무기한)";
					} else {
						diffMonth = diff_month(dataList[i].svcStartDtm,dataList[i].svcEndDtm);
						if(diffMonth < 2) {
							diffMonth = '';
						} else {
							diffMonth = "("+diffMonth+"개월)";
						}
					}

					var payWayCdDp = (dataList[i].payWayCd != 'CPN')?"(자동결제)":"";
					var payMsg = (dataList[i].payWayCd != 'CPN')?" 결제":" 이용";

					output += '<tbody>';
					output += '<tr>';
					output += '<td class="usage-grid-data dt-num">'+k+'</td>';
					output += '<td class="usage-grid-data dt-coupon">'+dataList[i].prodNm+' '+diffMonth+'</td>';
					output += '<td class="usage-grid-data dt-settling-day">'+dataList[i].payDtm+'</td>';
					output += '<td class="usage-grid-data dt-payment">'+numComma(dataList[i].payAmt)+'원</td>';
					output += '<td class="usage-grid-data dt-payment-option">'+dataList[i].payWayCdNm+' '+payMsg+' '+payWayCdDp+' </td>';
					if(dataList[i].svcEndDtm == '9999') {
						output += '<td class="usage-grid-data dt-usage-expiration">무기한</td>';		
					} else {	
						output += '<td class="usage-grid-data dt-usage-expiration">'+dataList[i].svcStartDtm+'~'+dataList[i].svcEndDtm+'</td>';
					}
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
			//console.log("실패 사유 :"+response.resultMsg);
		}
	} else {
			//console.log("System Fail");
	}
}

//이용권 변경 완료 팝업에서 창닫고 내 정보 관리페이지로 이동 
function goMyinfo() {
	U.dialog();
	var goHref = "account.html";
	location.replace(goHref);	
}
