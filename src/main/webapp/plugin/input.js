(function ($) {
	$(document).on("keyup", "input:text[numberOnly]", function () {
		if ($(this).val().match(/[^0-9]/gi, "")) {
			$(this).val($(this).val().replace(/[^0-9]/gi, ""));
		}
	});
	$(document).on("blur", "input:text[numberOnly]", function () {
		$(this).val($(this).val().replace(/[^0-9]/gi, ""));
	});
	$(document).on("keyup", "input:text[datetimeOnly]", function () {
		$(this).val($(this).val().replace(/[^0-9:\-]/gi, ""));
	});
	$(document).on("keyup", "input:text[uriOnly]", function (e) {
		if ((e.ctrlKey) && (e.keyCode == 86)) {
			if ($(this).val().match(/[ㄱ-ㅎㅏ-ㅣ가-힣\ ]/gi)) {
				alert(def_msg.msg_alert);
				$(this).val($(this).val().replace(/[^\v]/gi, ""));
			}
		} else {
			$(this).val($(this).val().replace(/[ㄱ-ㅎㅏ-ㅣ가-힣\ ]/gi, ""));
		}
	});

	$(document).on("blur", "input:text[noKor]", function () {
		$(this).val($(this).val().replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|]/gi, ""));
	});

	$(document).on("blur", "input:text[lowerCase]", function () {
		$(this).val($(this).val().toLowerCase());
	});

	$(document).on("blur", "input:text[trim]", function () {
		$(this).val($(this).val().trim());
	});


	$(document).on("keyup", "input:text[noKor]", function () {
		if ($(this).val().match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/gi)) {
			$(this).val($(this).val().replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/gi, ""));
		}
	});

	$(document).on("keyup", "input:text[engOnly]", function (e) {
		if ($(this).val().match(/[^A-Za-z]/gi)) {
			$(this).val($(this).val().replace(/[^A-Za-z]/gi, ""));
		}
	});

	$(document).on("keyup", "input:text[noSpace]", function () {
		if ($(this).val().match(/[\s]/gi)) {
			$(this).val($(this).val().replace(/[\s]/gi, ""));
		}
	});

	$(document).on("keyup", "input:text[noChar]", function () {
		if ($(this).val().match(/[\{\}\[\]\/?/.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi)) {
			$(this).val($(this).val().replace(/[\{\}\[\]\/?/.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi, ""));
		}
	});

	$(document).on("keyup", "input:text[noCharCustom]", function () {
		if ($(this).val().match(/[\{\}\[\]\/?/.,;:|\)*~`!^\-+<>$%&\\\=\(\'\"]/gi)) {
			$(this).val($(this).val().replace(/[\{\}\[\]\/?/.,;:|\)*~`!^\-+<>$%&\\\=\(\'\"]/gi, ""));
		}
	});

	//@@EXP (첫과 끝 엔터지우기)
	$(document).on("blur", "textarea[trimEnter]", function () {
		while ($(this).val().match(/^\n/g)) {
			$(this).val($(this).val().replace("\n", ""));
		}
		while ($(this).val().match(/\n$/g)) {
			$(this).val($(this).val().replace(/\n$/g, ""));
		}
	});
})(jQuery);