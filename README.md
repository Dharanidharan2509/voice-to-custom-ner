# voice-to-speech

convert voice to form filling

## Install

`npm i voice-to-form`

## Description

Voice to Form package is a software tool that converts spoken language into text and fills out digital forms, streamlining data entry and reducing user effort.

## Usage

```
import { createCustomNERProject, SpeechService, CustomEntityProject } from 'voice-to-form'

var speechToForm = new SpeechService(callback, endPoint, projectName, subscriptionKey, apiVersion, deploymentName)

speechToForm.startListening()

speechToForm.stopListening()

speechToForm.abortListening()
```

### Parameters

- ***callback*** - callback function where you get the speech to text result while speaking
- ***endPoint*** - Endpoint provided by azure storage account to make api calls
- ***projectName*** - name of the project
- ***subscriptionKey*** - subscriptionKey provided by azure storage account to make api calls
- ***apiVersion*** - supported api version that listed in azure to make api calls
- ***deploymentName*** - Deployment name for that particular project

### Methods

- ***.startListening()*** - Starts to listen for voice input
- ***.stopListening()*** - stops the listening service and submits the voice data and return the extracted result
- ***.abortListening()*** - aborts the listening service and will not be submitted