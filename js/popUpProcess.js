jQuery(function($) {
	// home과 겹치는 부분은 home.html을 참고바랍니다.
	var U = SmartHomeUI.init();

	// home과 겹치는 부분 시작
	$('.bt-sign-up').on('click', function() {
		signUp(true);
	});

	$('.bt-log-out').on('click', function() {
		logOut();
	});
	
	$('.bt-change-password').on('click', function() {
		changePassword();
	});

	//회원 탈퇴
	$('.bt-withdraw').on('click', function() {
		withDraw();
	});

	//회원탈퇴 취소
	$('.bt-cancel').on('click', function() {
		history.back();
	});

	//제휴문의 
	$('.bt-alliance').on('click', function() {
		parent.location='mailto:join_smarthome@sk.com';
	});

	function withDraw() {
		U.dialog({
			templateId: 'dialog-template-withdraw-confirm',
			onOpen: function(context) {
				$(context).find('.bt-confirm').on('click', function() {
					// 회원 탈퇴 버튼 클릭 시 탈퇴 트랜잭션을 실행한다.
					var url='v1/member/drop', type='POST', dataType = 'json';
					
					startWithDrawTransaction(url, type, dataType, function(response){
						parseWithDrawTransaction(response, function(rt, response) {
							if (rt) {
								dropSuccess();
							} else {

							}
						});
					});
				});
				$(context).find('.bt-cancel').on('click', function() {
					//회원탈퇴 팝업 취소
					U.closeDialog();
				});				
			}
		});
		return false;
	}

	function dropSuccess() {
		U.dialog({
			templateId: 'dialog-template-withdraw-success',
			onOpen: function(context) {
				$(context).find('.bt-confirm').on('click', function() {
					U.dialog();
				});
			}
		})
	}

	function changePassword() {
		U.dialog({
			templateId: 'dialog-template-change-password',
			onOpen: function(context) {
				var $context = $(context);
				$context.find('.bt-save').on('click', function() {
					// U.dialog();
					// return false;
					changPasswordCheckForm($context);
				});
			}
		});
		return false;
	}

	function signUp() { 

		// 회원가입을 시작합니다.
		goStep1();

		function goStep1() {

			/**
			 * Dialog를 여는 함수입니다.
			 * templateId는 필수, onOpen과 onClose는 선택입니다.
			 */
			U.dialog({
				/**
				 * 위 text/x-dialog-template를 type으로 가지는 script element의 id입니다.
				 * 필요한 template을 찾아 이 함수를 호출하면 Dialog가 화면에 나타납니다.
				 * */
				templateId: 'dialog-template-sign-up-step1',
				/**
				 * Dialog가 생성되고 DOM에 추가된 후, 사용자에게 보여지기 전에 호출됩니다.
				 * context로 .dialog의 DOM Element가 전달됩니다.
				 * 이를 통해 내부에 event listener 등을 추가할 수 있습니다.
				 * */
				onOpen: function(context) {
					var $context = $(context);

					$('.bt-next').prop("disabled", true);

					$('#agree-all').change(function() {

						var checkObj = $("input[type='checkbox']");
						//console.log("//input"+$("input[type='checkbox']:checked").length);

						if(checkObj.length - 1 == $("input[type='checkbox']:checked").length) {
							checkObj.prop("checked",false);
						} else {
							checkObj.prop("checked",true);								
						}

					});

					$("input[type='checkbox']").change(function() {
						var chkObj = $("input[id='agree-all']");
							//console.log("//chk:"+$("input[type='checkbox']:checked").length+"L:"+$("input[id='agree-all']:checked").length);
						if($("input[id='agree-service']:checked").length > 0 && $("input[id='agree-geolocation']:checked").length > 0 && $("input[id='agree-privacy']:checked").length > 0 && $("input[id='agree-children']:checked").length > 0) {
							chkObj.prop("checked",true);
							$('.bt-next').prop("disabled", false);								
						} else {
							$('.bt-next').prop("disabled", true);	
							chkObj.prop("checked",false);
						}
					});	


					$context.find('.bt-next').on('click', function() {

						/**
						 * 필요한 validation check를 할 수 있습니다.
						 * 또 필요한 테이터를 다른 곳에 저장해 둘 수 있습니다.
						 */

						if($("input[id='agree-all']:checked").length > 0) { 
							// 두째 단계 Dialog로 진입합니다.
							goStep2();

							return false;
						} else {
							//alert('체크필요!');
							$('.bt-next').prop("disabled", true);
						}
					});
				},
				/**
				 * Dialog가 사용자에게 사라지기 전에 호출됩니다.
				 * context로 .dialog의 DOM Element가 전달됩니다.
				 * 이를 통해 Dialog가 닫히기 전에 필요한 동작을 할 수 있습니다.
				 * 이 함수가 실행되었다고 해서, 실제로 Dialog가 닫히지는 않습니다.
				 * 실제로 Dialog를 닫으려면 콜백함수인 finish 호출합니다.
				 * onClose를 생략했다면 바로 Dialog를 닫습니다.
				 * */
				onClose: function(context, finish) {

					// 여기서는 특별한 처리 없이 바로 finish()를 호출합니다.
					finish();
				}
			});
		}

		function goStep2() {
			U.dialog({
				templateId: 'dialog-template-sign-up-step2',
				onOpen: function(context) {

					//버튼 비활성화 
					$('.bt-send-number').prop("disabled", true);
					$('.bt-next').prop("disabled", true);
					$('#authnum').prop("disabled", true);

				    var $context = $(context);
					var $form = $context.find('form');

					// U.getRemainedTimeDisplay().show();
					// U.getRemainedTimeDisplay().setTime(0200);

					$(document).on("keyup", "input:text[numberOnly]", function() {
						//$(this).val($(this).val().replace(/[^0-9]/gi,""));
						//U.invalidate($('#hphone'));	
						//$('.bt-send-number').prop("disabled", false);
					});

					$context.find('#hphone').keyup(function() {						
						$(this).val($(this).val().replace(/[^0-9]/gi,""));

						if($('#hphone').val().length >= 10) {
							U.validate($('#hphone'));	
							$('.bt-send-number').prop("disabled", false);
						}

						if (this.value == '' || this.value.length == 0) {
							U.invalidate($(this));
						}
					});

					//인증번호 전송
					$context.find('.bt-send-number').on('click', function() {

						var $addTxt = $('.err-Txt');
						removeAddTxt($addTxt);

						if($('#hphone').val() == "" || $('#hphone').val().length < 10) {
							U.invalidate($('#hphone'), '올바른 휴대폰 번호를 입력 하세요.');
							$('#hphone').focus();																				
							return false;
						} else {
							U.validate($('#hphone'));	
						}	
						
						var hphone = $.trim($('#hphone').val());
						var params = {}, url='v1/member/certification', type='GET', dataType = 'json';

						params = {
							mobileNo : hphone
						};

						startAuthRequestTransaction(url, params, type, dataType, function(response){
							parseAuthRequestTransaction(response, $context, '');
						});
					});

					$('#authnum').keyup(function() {
						console.log('$(#authnum).val().length : '+$('#authnum').val().length)
						if($('#authnum').val().length >= 6) {
							$('.bt-next').prop("disabled", false);
							U.validate($('#authnum'));	
						}

						if (this.value == '' || this.value.length == 0) {
							U.invalidate($(this));
						}
					});						

					//다음 단계로 
					$context.find('.bt-next').on('click', function() {

						var authnum = $.trim($('#authnum').val());	
						var params = {}, url='v1/member/userCertification', type='GET', dataType = 'json';						

						if(authnum == "") {
							U.invalidate($('#authnum'), '인증번호를 입력해 주세요.');
							$('#authnum').focus();																				
							return false;									
						} else if($.isNumeric(authnum) != true) {
							U.invalidate($('#authnum'), '숫자만 입력해 주세요.');
							$('#authnum').focus();	
							return false;																																											
						} else {
							// U.validate($('#authnum'));		

							// if($('#hphone').val().length >= 10 && $.isNumeric($('#hphone').val()) == true && authnum.length >= 6 && $.isNumeric(authnum) == true) {
							 	var userInfo = {userPhone : $('#hphone').val(), userCertNo : $('#authnum').val()}

							// 	goStep3(userInfo);
							// 	return false;	
							// } else {
							// 	U.invalidate($('#authnum'), '입력하신 값이 올바르지 않습니다.');
							// 	$('#authnum').focus();
							// }	
							
							joinNextStepCheckForm($context, function(response, id){
								if (response.resultCd == 1) {
								 	goStep3(userInfo);
								} else {
									U.invalidate_txt(true, $('#authnum'), response.resultMsg);
								}
							});
						}
					});

					$context.find('.bt-prev').on('click', function() {
						goStep1();
						return false;
					});

				}
			});
		}

		function goStep3(userInfo) {
			U.dialog({
				templateId: 'dialog-template-sign-up-step3',
				onOpen: function(context) {
					var $context = $(context);
					var $form = $context.find('form');

					$context.find('#name').keyup( function() {
						chkValidate($('#name'));

						if (this.value == '' || this.value.length == 0) {
							U.invalidate($(this));
						}
					});

					$context.find('#email').keyup( function() {
						if (isEmailIDCheck($('#email'))) {
							chkValidate($('#email'));
						}

						if (this.value == '' || this.value.length == 0) {
							U.invalidate($(this));
						}
					});

					$context.find('#pass').keyup( function() {
						if (isPasswordCheck($('#pass'))) {
							chkValidate($('#pass'));
						}

						if (this.value == '' || this.value.length < 8) {
							U.invalidate($(this));
						}
					});

					$context.find('#passre').keyup( function() {
						if ($('#pass').val() == $('#passre').val()) {
							if (event.keyCode == 13) {
								gotoJoinTransaction();
							} else {
								if (isPasswordCheck($('#passre'))) {
									chkValidate($('#passre'));
								}
							}
						} else {
							U.invalidate($(this));
						}

						if (this.value == '' || this.value.length < 8) {
							U.invalidate($(this));
						}
					});

					$context.find('.bt-next').on('click', function() {
						var $addTxt = $('.err-Txt');
						var $leng = $addTxt.length;

						if ($leng > 0) {
							removeAddTxt($addTxt);
						}
						var uname = $.trim($('#name').val());
						var uemail = $.trim($('#email').val()); 
						var upass = $.trim($('#pass').val()); 
						var upassre = $.trim($('#passre').val()); 						

						if(uname == "") {
							U.invalidate($('#name'), '이름을 입력해 주세요.');
							$('#name').focus();	
							return false;										
						} else {
							// U.invalidate($('#name'));
							U.validate($('#name'));	
						}

						if(uemail == "") {
							U.invalidate($('#email'), '이메일을 입력해 주세요.');
							$('#email').focus();		
							return false;	
						} else if (!isEmailIDCheck($('#email'))) {
							U.invalidate($('#email'), '스마트홈 계정 (이메일)을 형식에 맞게 입력하세요.'); 								
							return false;			
						} else {
							U.validate($('#email'));
						}

						if(upass == "") {
							U.invalidate($('#pass'), '비밀번호를 입력해 주세요.');
							$('#pass').focus();	
							return false;	
						} else if(upass.length < 8) {
							U.invalidate($('#pass'), '비밀번호를 8자 이상 입력해 주세요.');
							$('#pass').focus();	
							return false;													
						} else {
							U.validate($('#pass'));		
						}	
						
						if(upassre == "") {
							U.invalidate($('#passre'), '비밀번호 확인을 입력해 주세요.');
							$('#passre').focus();		
							return false;			
						} else if($('#pass').val() != $('#passre').val()) {
							U.invalidate($('#passre'), '비밀번호와 재입력한 비밀번호가 맞지 않습니다.');
							$('#passre').val('');										
							$('#passre').focus();		
							return false;												
						} else {
							U.validate($('#passre'));	
						}

						if (!isPasswordCheck($('#pass'))) {
							U.invalidate($('#pass'), '입력하신 비밀번호 형식이 올바르지 않습니다. (영문, 숫자 포함 8자 이상)');
							return false;
						} else {
							U.validate($('#pass'));
						}
							
						if(uname != "" && uemail != "" && upass != "" && upassre != "") { 
							gotoJoinTransaction();
						} else {
							console.log(uname+"/"+uemail+"/"+upass+"/"+upassre);
						}

						function gotoJoinTransaction () {
							//API 통신을 위한 파라미터 값
							var params = {}, url='v1/member/registerMember', type='POST', dataType = 'json';
							// var params = {}, url='v2/member/registerMember', type='GET', dataType = 'json';										
							var ip = "127.0.0.1"; // 접속 IP구하여 대체해야 함.

							params = {				
								userNickNm:uname,
								loginId:uemail,
								loginPwd:upass,
								userMobileNo:userInfo.userPhone,
								pushTknVal:'',
								dvcTknVal:ip,
								dvcOsNm:'WEB',
								certNo:userInfo.userCertNo
								// loginId : "goodman@btb.com",
								// loginPwd : "1010qpqp",
								// userNickNm : "이종",
								// userMobileNo : "01098877181",
								// pushTknVal : "12345",
								// dvcTknVal : "123456",
								// dvcOsNm : "WEB",
								// fileNm : '',
								// certNo: "111111"							
							};

							var $addTxt = $('.err-Txt');
							removeAddTxt($addTxt);

							startJoinTransaction(url, params, type, dataType, function(response){
								parseJoinTransaction(response, function(rt, response) {
									if (rt) {
										goFinish();
									} else {
										var $elPassre = $('#passre');
										joinFail(false, $elPassre, response);
										console.log('실패 : ' + response);
									}
								});
							});				
						}
						
					});

					//$context.find('form').last().on('submit', function() {

						/**
						 * 최종 성공 화면으로 진입합니다.
						 * 실패했을 때는 dialog-temlate-signup-failure를
						 * templateId로 사용하시면 됩니다.
						 */
 
						//goFinish();
						//return false;
					//});

					$context.find('.bt-prev').on('click', function() {

						// 이전단계로 이동합니다.
						goStep2();
						return false;
					});
				}
			});
		}

		function goFinish() {
			U.dialog({
				templateId: 'dialog-template-sign-up-success',
				onOpen: function(context) {
					$(context).find('.bt-confirm').on('click', function() {
						U.dialog();
						return false;
					});
				},
				onClose: function(context, finish) {
					finish();
				}
			});
		}

		return false;
	}

	$('.bt-log-in').on('click', login);

	function login() {
		U.dialog({
			templateId: 'dialog-template-log-in',
			onOpen: function(context) {
				var $context = $(context);

				$context.find('.bt-sign-up').on('click', function() {
					signUp(true);
				});

				$context.find('.bt-find-id-and-password').on('click', function() {
					findIdOrPassword('id');
				});

				$context.find('#myId').keyup( function(){
					if (isEmailIDCheck($('#myId'))) {
						chkValidate($('#myId'));
					}

					if (this.value == '' || this.value.length == 0) {
						U.invalidate($(this));
					}
				});

				$context.find('#myPass').keyup( function(){
					if (event.keyCode == 13) {
						loginCheckForm($context);
					} else {
						if (isPasswordCheck($('#myPass'))) {
							chkValidate($('#myPass'));
						}
					}

					if (this.value == '' || this.value.length == 0) {
						U.invalidate($(this));
					}
				});

				$context.find('.bt-log-out').on('click', function() {
					logOut();
				});

				$('button').click(function(){
					if(this.className == 'bt-log-in') {
						loginCheckForm($context);
					}
				});
			}
		});
	}

	function findIdOrPassword(target) {

		switch (target) {
		case 'id':
			U.dialog({
				templateId: 'dialog-template-find-id-form',
				onOpen: function(context) {
					var $context = $(context);

					$context.find('.bt-find-password').on('click', function() {
						findIdOrPassword('password');
					});	

					var $js_cellPhone = $('#js_cellPhone');
					var $js_auth = $('#js_authNumber');
					var $js_btn = $('#js_bt-send-number');
					
					$js_cellPhone.focus();
					$js_btn.prop("disabled", true);
					//$js_auth.prop("disabled", true);

					$js_cellPhone.keyup( function() {
						if (event.keyCode == 13) {
							findIDCheckForm($context);
						} else {
							if (this.value.length >= 10) {
								$js_btn.prop("disabled", false);
								chkValidate($js_cellPhone);
							}
						}

						if (this.value == '' || this.value.length == 0) {
							U.invalidate($(this));
						}
					});

					$js_auth.keyup( function() {
						if (event.keyCode == 13) {
							findIDCheckForm($context, function(response, id){
								parseAuthNumTransaction(response, id, function(rt1){
									parseFindIDTransaction(rt1, function(rt2){
										if (rt2.resultCd == 1) {
											findIdOrPasswordResult(rt2, 'id');
										} else {
											findIdOrPasswordResultFail();
										}
									});
								});
							});
						} else {
							isAuthCheck($js_auth);
							if (this.value.length == 6) {
								chkValidate($js_auth);
							}
						}

						if (this.value == '' || this.value.length == 0) {
							U.invalidate($(this));
						}
					});

					$js_cellPhone.focus( function() {
						if (this.value != '') {
							$js_btn.prop("disabled", false);
							chkValidate($js_cellPhone);
						}
					});

					$js_btn.on('click', function() {
						findIDCheckCellPhone($context);
					});

					$('button').click( function() {
						if (this.id == 'js_bt-confirm') {
							findIDCheckForm($context, function(response, id){
								parseAuthNumTransaction(response, id, function(rt1){
									parseFindIDTransaction(rt1, function(rt2){
										if (rt2.resultCd == 1) {
											findIdOrPasswordResult(rt2, 'id');
										} else {
											findIdOrPasswordResultFail();
										}
									});
								});
							});
						} 
					});
				}
			});
			break;
		case 'password':
			U.dialog({
				templateId: 'dialog-template-find-password-form',
				onOpen: function(context) {
					var $context = $(context);
					var $elID = $('#js_userId');
					var $elAuth = $('#js_authNumber');
					var $elCellPhone = $('#js_cellPhone');
					var $sendNumberBtn = $('.bt-send-number');

					$context.find('.bt-find-id').on('click', function() {
						findIdOrPassword('id');
					});

					$elID.focus();
					$sendNumberBtn.prop("disabled", true);
					$elAuth.prop("disabled", true);

					$elID.keyup( function(){
						if (isEmailIDCheck($elID)) {
							chkValidate($elID);
						}

						if (this.value == '' || this.value.length == 0) {
							U.invalidate($(this));
						}
					});
					
					$elCellPhone.keyup( function() {
						if (event.keyCode == 13) {
							goAuthNumberRequest();
						} else {
							if (this.value.length >= 10) {
								$sendNumberBtn.prop("disabled", false);	
								chkValidate($elCellPhone);
							}
						}

						if (this.value == '' || this.value.length == 0) {
							U.invalidate($(this));
						}
					});

					$elAuth.keyup( function() {
						if (event.keyCode == 13) {
							findPWDCheckForm($context, function(response, id){
								parseAuthNumTransaction(response, id, function(rt1){
									parseFindIDTransaction(rt1, function(rt2){
										if (rt2.resultCd == 1) {
											findIdOrPasswordResult(rt2, 'password', $elID.val());
										} else {
											findIdOrPasswordResultFail();
										}
									});
								});
							});
						} else {
							if (this.value.length == 6) {
								chkValidate($elAuth);
							} 
						}

						if (this.value == '' || this.value.length == 0) {
							U.invalidate($(this));
						}
					});

					// 패스워드 분실 인증 번호 요청시 정보가 일치할 경우만 인증번호가 전송 될 경우 사용
					$sendNumberBtn.on('click', function() {
						goAuthNumberRequest();
					});

					function goAuthNumberRequest() {
						var $addTxt = $('.err-Txt');
						removeAddTxt($addTxt);

						findPWDCheckCellPhone($context, function(rt1, $rtEl1, type){
							parseAuthRequestTransaction(rt1, $rtEl1, 'pass', function(rt2, $rtEl2, type){
								if (rt2.resultCd == 1) {
									timeLimitCheck(rt2, $rtEl2, type);
								} else {								
									passwordFindFail(true, $elAuth, rt2);
								}
							})
						});
					}


					// 패스워드 분실 인증 번호 요청시 정보가 일치하지 않아도 인증번호가 전송 될 경우 사용
					// $context.find('.bt-send-number').on('click', function() {
					// 	findPWDCheckCellPhone($context);
					// });

					$('button').click( function() {
						if (this.className == 'bt-confirm') {
							findPWDCheckForm($context, function(response, id){
								parseAuthNumTransaction(response, id, function(rt1){
									parseFindIDTransaction(rt1, function(rt2){
										if (rt2.resultCd == 1) {
											findIdOrPasswordResult(rt2, 'password', $elID.val());
										} else {
											findIdOrPasswordResultFail();
										}
									});
								});
							});
						} 
					});
				}
			});
			break;
		default:
			// NO DEFAULT
		}
	}

	function findIdOrPasswordResult(response, target, $elID) {
		// 아이디 검색 결과에 쓰일 부분
		// $context.find('form').last().on('submit', function() {

		switch (target) {
		case 'id':
			U.dialog({
				templateId: 'dialog-template-find-id-success',
				onOpen: function(context) {
					var $context = $(context);

					// 서버로부터 가져온 email 목록을 추가합니다.
					var results = [];
					var responseList = response.resultList;

					if (responseList && responseList.length > 0) {
						for(var i=0; i<responseList.length; i++) {
							results.push(responseList[i].loginId);
						}
					}

					results = $.map(results, function(v) {
						return '<li>' + v + '</li>';
					});

					$context.find('.ids').html(results.join(''));
					//-- END

					$context.find('.bt-find-password').on('click', function() {
						findIdOrPassword('password');
					});

					$context.find('.bt-log-in').on('click', login);
				}
			});
			break;
		case 'password':
			U.dialog({
				templateId: 'dialog-template-find-password-success',
				onOpen: function(context) {
					var $context = $(context);
					var resultMsg = '임시 비밀번호를 아래의 메일 주소로 발송하였습니다. <br>	<strong>'+$elID+'</strong>';

					$context.find('.result').html(resultMsg);

					$context.find('.bt-confirm').on('click', U.closeDialog);
				}
			});
			break;
		default:
			// NO DEFAULT
		}
		// });
	}

	function findIdOrPasswordResultFail(response) {
		// 아이디 검색 결과에 쓰일 부분
		// $context.find('form').last().on('submit', function() {
			U.dialog({
				templateId: 'dialog-template-find-id-failure',
				onOpen: function(context) {
					var $context = $(context);

					$context.find('.bt-find-password').on('click', function() {
						findIdOrPassword('password');
					});

					$context.find('.bt-log-in').on('click', login);
				}
			});
		// });
	}
	//-- home과 겹치는 부분 종료
});