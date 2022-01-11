window.onload = function () {
    console.log("START EXTENSION");
    var types = {
        GetQuestions: 'valearn-getquestions',
        SendQuestions: 'valearn-sendquestions',
        SearchQuestion: 'valearn-searchquestions',
		CourceName: 'valearn-courcename'
    };

    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
        switch (request.message) {
        case types.GetQuestions:
            readQuestions();
            break;
		case types.SearchQuestion:
			searchQuestion();
			break;
        }
    });
	
	function searchQuestion(){
		sendVaMessage(types.CourceName, '');
	}
	
    function getQuestions() {
        var str = "";
        var d = [];
        var $questions = $(".media.question.correct_media");
        if ($questions.length === 0) {
            var $iframe = $('iframe');
            $questions = $(".media.question.correct_media", $iframe.contents());
        }

        for (var i = 0; i < $questions.length; i++) {
            var $q = $questions.eq(i);
            var questionString = $q.find(".media-body .mt-0").html();
            var qd = {
                q: questionString,
                a: []
            };
            str += "Câu :" + questionString + "\n";
            var $answers = $q.find(".input-group .icheck-item");
            for (var j = 0; j < $answers.length; j++) {
                var $a = $answers.eq(j);
                var lb = $a.find(".stt").text();
                var isCheck = $a.find(".iradio_square-blue").hasClass("checked");
                var answerString = $a.find(".question-option").html();
                if (isCheck) {
                    str += "[" + lb + "]: " + answerString
                } else {
                    str += lb + ": " + answerString
                }

                qd.a.push({
                    isCheck: isCheck,
                    answer: answerString
                });
                str += "\n"
            }
            d.push(qd);
        }
        return d;
    }

    function readQuestions() {
        var q = getQuestions();
        sendVaMessage(types.SendQuestions, q);
    }
	
	function getCourceName(){
		var courceName = $("#testTitle .caption-subject").text() || "";
		if (courceName.length === 0){
			var $iframe = $('iframe');
			courceName = $("#testTitle .caption-subject", $iframe.contents()).text() || "";
		}
		
		return courceName;
	}
	
    function sendVaMessage(type, data) {
        chrome.runtime.sendMessage({
            message: type,
            data: data,
            cource: getCourceName()
        }, function (response) {
            console.log("Done");
            console.log(response);
        });
    }
}