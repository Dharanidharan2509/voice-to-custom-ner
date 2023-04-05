# voice-to-speech
convert voice to text

## Install
npm i voice-to-text-javascript

## Description
This simple library converts voice into text

## Usage
import { speechToText, startListening, stopListening } from 'voice-to-text-javascript'

function initialVoiceToSpeech () {
    speechToText({
        interimResults: true,
        lang: 'en',
        continuous: true
    }, callback, onError)
}

function start() {
    startListening()
}

function stop() {
    startListening()
}

interimResults - Does not wait for the user to complete finished speaking
lang - Specifies the language
continuous - Continue to listen for the user speech and will not stop listening
callback - Function where the text will be returned
onError - Function to handle error
