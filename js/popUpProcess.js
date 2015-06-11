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
								chkObj.prop("checked",false);
							}
						});	


						$(context).find('form').first().on('submit', function() {

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
						var $context = $(context);
						var $form = $context.find('form').last().on('submit', function() {
							goStep3();
							return false;
						});
						setTimeout(function() {
							U.invalidate($form.find('input').first(), '테스트 에러 메시지');
							setTimeout(function() {
								U.invalidate($form.find('input').first());
							}, 1500);
						}, 1500);
						$context.find('.bt-prev').on('click', function() {
							goStep1();
							return false;
						});
					}
				});
			}

			function goStep3() {
				U.dialog({
					templateId: 'dialog-template-sign-up-step3',
					onOpen: function(context) {
						var $context = $(context);

					//U.validate($context.find('form').first().find('input').first());
						var $form = $context.find('form');
						//var $form = $context.find('form').last().on('submit', function() {
						$context.find('.bt-next').on('click', function() {

							var params = {}, url='/v1/member/registerMember', type='GET', dataType = 'json';

							var pattern = /^[a-z]+[a-z0-9_]*$/;
							var num = /[0-9]/;

							var uname = $.trim($('#name').val());
							var uemail = $.trim($('#email').val()); 
							var upass = $.trim($('#pass').val()); 
							var upassre = $.trim($('#passre').val()); 						

							if(uname == "") {
								U.invalidate($('#name'), '이름을 입력해 주세요.');
								$('#name').focus();	
								return false;						
							} else {
								U.invalidate($('#name'));	
							}

							if(uemail == "") {
								U.invalidate($('#email'), '이메일을 입력해 주세요.');
								$('#email').focus();		
								return false;						
							} else {
								U.invalidate($('#email'));	
							}

							if(upass == "") {
								U.invalidate($('#pass'), '비밀번호를 입력해 주세요.');
								$('#pass').focus();	
								return false;						
							} else {
								U.invalidate($('#pass'));		
							}	
							
							if(upassre == "") {
								U.invalidate($('#passre'), '비밀번호 확인을 입력해 주세요.');
								$('#passre').focus();		
								return false;						
							} else {
								U.invalidate($('#passre'));	
							}
								

							if(uname != "" && uemail != "" && upass != "" && upassre != "") { 

								var ip = "<?=$_SERVER[REMOTE_ADDR]?>";

								alert(ip);

								params = {				
									usrname:uname,
									usremail:uemail,
									usrpass:upass,
									pushTknVal:'',
									dvcTknVal:ip,
									dvcOsNm:'WEB'
								};						

								// 마지막 단계 Dialog로 진입합니다.
								goFinish();
								return false;
							} else {
								console.log(uname+"/"+uemail+"/"+upass+"/"+upassre);
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

				$context.find('#myPass').keydown( function(){
					if (event.keyCode == 13) {
						loginCheckForm($context);
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

					$context.find('form').last().on('submit', function() {
						U.dialog({
							templateId: 'dialog-template-find-id-success',
							onOpen: function(context) {
								var $context = $(context);

								// 서버로부터 가져온 email 목록을 추가합니다.
								var results = [
									'aaaa@bbbbb.com',
									'cccc@ddddd.com',
									'eeee@fffff.com',
									'gggg@hhhhh.com',
									'iiii@jjjjj.com'
								];

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
					});
				}
			});
			break;
		case 'password':
			U.dialog({
				templateId: 'dialog-template-find-password-form',
				onOpen: function(context) {
					var $context = $(context);

					$context.find('.bt-find-id').on('click', function() {
						findIdOrPassword('id');
					});

					$context.find('form').last().on('submit', function() {
						U.dialog({
							templateId: 'dialog-template-find-password-success',
							onOpen: function(context) {
								var $context = $(context);

								$context.find('.bt-confirm').on('click', function() {
									U.dialog();
								});
							}
						})
					});
				}
			});
			break;
		default:
			// NO DEFAULT
		}
	}
	//-- home과 겹치는 부분 종료
});