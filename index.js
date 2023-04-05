const recognition = new webkitSpeechRecognition();
var final_transcript = "";

function speechToText (options, callback) {
    recognition.interimResults = options.interimResults
    recognition.lang = options.lang
    recognition.continuous = options.continuous


    recognition.onresult = (event) => {
        let interim_transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
                callback(final_transcript)
            } else {
                interim_transcript += event.results[i][0].transcript;
                callback(interim_transcript)
            }
        }
    }
}

function startListening () {
    final_transcript = "";
    recognition.start();
}

function stopListening () {
    recognition.abort();
}

export { speechToText, startListening, stopListening }