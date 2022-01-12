var types = {
    GetQuestions: 'valearn-getquestions',
    SendQuestions: 'valearn-sendquestions',
	SearchQuestion: 'valearn-searchquestions',
	CourceName: 'valearn-courcename'
};

console.log('open popup');

const scriptURL = 'https://script.google.com/macros/s/AKfycby36krxuiq89Glvq5FBukGkVRzWs4ohsnZc2hGQGSPCRTytoZx0dnIATukTW9Yq8KJNFw/exec';
const form = document.forms['google-sheet'];

var $resultTemplate = $(".valearn-item");
$(".valearn-results").empty();

function sendToGoogleSheet(){
	var $results = $(".valearn-results");
	$results.empty();
	$('button').prop('disabled', true);
	return fetch(scriptURL, { method: 'POST', body: new FormData(form)}).then(response => {
		$('button').prop('disabled', false);
		return response.json();
	});
}

async function insertQuestion(data, courceCode){
	var $form = $("form[name='google-sheet']");
	$form.find("[name='cource']").val(courceCode);
	$form.find("[name='action']").val("insert");
	$form.find("[name='question']").val(data.q || "");
	var idxCorrect = '';
	for (var i = 0; i < 7; i++){
		var answer = '';
		if (i < data.a.length){
			answer = data.a[i].answer;
			if (data.a[i].isCheck){
				idxCorrect = idxCorrect + ' ' + i;
			}
		}
		$form.find("[name='answer" + (i + 1) + "']").val(answer);
	}
	console.log("insert q:" + data.q || "");
	$form.find("[name='correct']").val(idxCorrect.trim());
	await sendToGoogleSheet();
	console.log("success q:" + data.q || "");
}

async function insertQuestions(list, courceCode){
	for (var i = 0; i < list.length; i++){
		await insertQuestion(list[i], courceCode);
	}
	
	$(".valearn-results").append('<p>Success: '+ list.length +'</p>')
}

function search(q, courceCode){
	var $form = $("form[name='google-sheet']");
	$form.find("[name='cource']").val(courceCode);
	$form.find("[name='action']").val("search");
	$form.find("[name='question']").val(q || "");
	var idxCorrect = -1;
	for (var i = 0; i < 7; i++){
		$form.find("[name='answer" + i + "']").val('');
	}
	
	$form.find("[name='correct']").val('');
	sendToGoogleSheet()
	.then(data => {
		console.log(data);
		var $results = $(".valearn-results");
		if (data.data.length === 0){
			$results.append('<p>Không tìm thấy</p>');
			return;
		}

		for (var i = 0; i< data.data.length; i++){
			var $item = $resultTemplate.clone();
			$item.find(".valearn-item-question").html('Câu ' + (i + 1) + ' : ' + data.data[i][0]);
			var cr = '';
			var idxCr = (data.data[i][1] + '').split(' ');
			for (var j = 0; j < idxCr.length; j++){
				var jint = parseInt(idxCr[j]);
				if (jint >= 0 && jint <= 8){
					cr += '<br />['+ (j + 1) +']' + data.data[i][jint + 2];
				}
			}
			
			$item.find(".valearn-answer-correct").html('Đáp án: ' + cr);
			$results.append($item);
		}
	});
}

function getCourceCode(courceName){
	if ((courceName || "").length === 0) return 'khac';
	if (courceName.indexOf('Bài thi thử Năng lực cốt lõi dành cho nhân viên; Văn hóa VNPT; Giao tiếp khách hàng') >= 0){
		return 'vanhoavnpt'; 
	}
	if (courceName.indexOf('Bài thi thử An toàn bảo mật thông tin (cơ bản)') >=0 ){
		return 'attt'; 
	}
	if (courceName.indexOf('Bài thi thử Kiến thức về kỹ thuật lập trình') >=0 ){
		return 'laptrinh'; 
	}
	if (courceName.indexOf('Bài thi thử Xu hướng công nghệ 4.0 và công nghệ AI, Blockchain, BigData, CloudComputing') >=0 ){
		return 'congnghe40'; 
	}
	if (courceName.indexOf('Bài thi thử Quy trình cung cấp sản phẩm dịch vụ CNTT') >=0 ){
		return 'dichvucntt'; 
	}
	if (courceName.indexOf('Bài thi thử Các hệ điều hành cho máy chủ Windows server, Linux (hệ CSDL Orcele, SQL Server, MySQL)') >=0 ){
		return 'hedieuhanh'; 
	}
	if (courceName.indexOf('Bài thi thử Các SP – DV Viễn thông và CNTT của VNPT') >=0 ){
		return 'spdvcntt'; 
	}
	if (courceName.indexOf('Bài thi thử Kiến thức về Cơ sở dữ liệu Oracle') >=0 ){
		return 'csdloracle'; 
	}
	return 'khac';
}

function searchQuestions(){
	var q = $("#valearn-search-box").val();
	if ((q ||"").length > 0){
		var courceCode = $("#valearn-cource-box").val();
		search(q, courceCode);
	}
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
    console.log(request);
    switch (request.message) {
    case types.SendQuestions:
		insertQuestions(request.data, getCourceCode(request.cource));
        console.log("SendQuestions");
        sendResponse("Done SendQuestions");
        break;
	case types.CourceName: 
		$("#valearn-cource-box").val(getCourceCode(request.cource));
		sendResponse("Done Get cource name");
		break;
	}
		
});

function sendMessageToPage(type){
	chrome.tabs.query({
			currentWindow: true,
			active: true
		}, function (tabs) {
			var activeTab = tabs[0];
			chrome.tabs.sendMessage(activeTab.id, {
				"message": type
			});
		});
}
$("#valearn-btn-search").click(function(){
	var q = $("#valearn-search-box").val();
	if ((q ||"").length > 0){
		searchQuestions();
	}
});

$("#valearn-btn-learn").click(function () {
	sendMessageToPage(types.GetQuestions);
});

sendMessageToPage(types.SearchQuestion);