function createCustomNERProject (endPoint, subscriptionKey, config) {
    if (config && config.projectName && config.containerName) {
        let url = `${endPoint}language/authoring/analyze-text/projects/${config.projectName}/:import?api-version=${config.apiVersion}`
        let model = {
            "projectFileVersion": config.apiVersion,
            "stringIndexType": "Utf16CodeUnit",
            "metadata": {
                "projectName": config.projectName,
                "projectKind": "CustomEntityRecognition",
                "description": config.projectDescription,
                "language": "en",
                "multilingual": config.multilingual,
                "storageInputContainerName": config.containerName,
                "settings": {}
            },
            "assets": {
                "projectKind": "CustomEntityRecognition",
                "entities": config.entities,
                "documents": config.documents
            }
        }
        api({ method: 'post', url, headers: { "Ocp-Apim-Subscription-Key": subscriptionKey, "Content-Type": "application/json" }, model: JSON.stringify(model)})
            .then(data => {
                console.log(data)
            })
            .catch(err => {
                console.log(err)
            })
    }
}

class customEntityProject {
    constructor (endPoint, name, key, apiVersion) {
        this.endPoint = endPoint
        this.projectName = name
        this.headers = { "Ocp-Apim-Subscription-Key": key }
        this.apiVersion = apiVersion
        this.baseURL = `${this.endPoint}language/authoring/analyze-text/projects/${this.projectName}/`
    }

    // Train your model
    trainModel (modelName, trainingConfigVersion) {
        const url = `${this.baseURL}:train?api-version=${this.apiVersion}`
        let model = {
            "modelLabel": modelName,
            "trainingConfigVersion": trainingConfigVersion,
            "evaluationOptions": {
                "kind": "percentage",
                "trainingSplitPercentage": 80,
                "testingSplitPercentage": 20
            }
        }
        model = JSON.stringify(model)
        api({ method: 'post', url, headers: { ...this.headers, ...{ "Content-Type": "application/json" } }, model, returnJob: true})
            .then(res => {
                console.log(res)
            })
            .catch(err => {
                console.log(err)
            })
    }

    // Get training job status
    trainStatus (jobid) {
        let url = `${this.baseURL}train/jobs/${jobid}?api-version=${this.apiVersion}`
        api({ method: 'get', url, headers: this.headers})
            .then(data => {
                console.log(data)
            })
            .catch(err => {
                console.log(err)
            })
    }

    // Deploy your model
    deployModel (modelName, deploymentName) {
        let url = `${this.baseURL}deployments/${deploymentName}?api-version=${this.apiVersion}`
        let model = {
            trainedModelLabel: modelName
        }
        model = JSON.stringify(model)
        api({ method: 'put', url, headers: { ...this.headers, ...{ "Content-Type": "application/json" } }, model, returnJob: true})
            .then(data => {
                console.log(data)
            })
            .catch(err => {
                console.log(err)
            })
    }

    // Get deployment job status
    deployStatus (deploymentName, jobid) {
        let url = `${this.baseURL}deployments/${deploymentName}/jobs/${jobid}?api-version=${this.apiVersion}`
        api({ method: 'get', url, headers: this.headers})
            .then(data => {
                console.log(data)
            })
            .catch(err => {
                console.log(err)
            })
    }

    // Submit the text and get the result
    submitTextToAnalyze (deploymentName, text) {
        return new Promise((resolve, reject) => {
            const url = `${this.endPoint}language/analyze-text/jobs?api-version=${this.apiVersion}`
            let model = {
                "displayName": "Extracting entities",
                "analysisInput": {
                  "documents": [
                    {
                      "language": "en",
                              "id": 1,
                      "text": text
                    }
                  ]
                },
                "tasks": [
                   {
                    "kind": "CustomEntityRecognition",
                    "taskName": "Entity Recognition",
                    "parameters": {
                      "projectName": this.projectName,
                      "deploymentName": deploymentName
                    }
                  }
                ]
              }
            model = JSON.stringify(model)
            api({ method: 'post', url, headers: { ...this.headers, ...{ "Content-Type": "application/json" } }, model, returnJob: true})
                .then(data => {
                    resolve(data)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }
    
    // Get the result of the submitted text
    getSubmittedResult (jobID) {
        return new Promise((resolve,reject) => {
            const url = `${this.endPoint}language/analyze-text/jobs/${jobID}?api-version=${this.apiVersion}`
            api({ method: 'get', url, headers: this.headers, statusCode: 200 })
                .then(data => {
                    resolve(data.tasks)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    // Delete a project
    deleteProject () {
        let url = `${this.baseURL}?api-version=${this.apiVersion}`
        api({ method: 'delete', url, headers: this.headers})
            .then(data => {
                console.log(data)
            })
            .catch(err => {
                console.log(err)
            })
    }
}

// api method
function api ({method, url, headers, model, returnJob, statusCode}) {
    // console.log(method, url, model)
    return new Promise((resolve, reject) => {
        const http = new XMLHttpRequest()
        http.open(method, url)
        Object.keys(headers).forEach(header => {
            http.setRequestHeader(header, headers[header])
        })
        http.send(model)
        http.onreadystatechange = function () {
            if (http.readyState === 4) {
                if (http.status === (statusCode || 202)) {
                    // console.log(http)
                    let response = returnJob ? extractJobID(http) : {}
                    if (http.responseText) response = { ...response, ...(JSON.parse(http.responseText)) }
                    resolve(response)
                } else {
                    // console.log(http)
                    let response = http.responseText ? JSON.parse(http.responseText) : { status: http.status }
                    reject({ ...response, ...{ status: http.status }})
                }
            }
        }
    })
}

function extractJobID (http) {
    const url = http.getResponseHeader('operation-location')
    const regex = /jobs\/(.+?)\?/
    const match = url.match(regex)
    return { jobID: match[1] }
}

// function speechToText () {
// }

function getResult (id) {
    obj.getSubmittedResult(id).then(res => {
        if (res.inProgress === 0) {
            console.log(res)
            console.log(res.items[0].results.documents)
            // displayResultToBrowser(res.items[0].results.documents)
        } else {
            setTimeout(() => {
                getResult(id)
            }, 400);
        }
    })
}


function displayResultToBrowser (resultData) {
    console.log('inside')
    const data = resultData[0]
    data.entities.forEach(res => {
        let paragraph = document.createElement('p')
        let text = document.createTextNode(`${res.category}: ${res.text} confidence: ${res.confidenceScore}`)
        paragraph.appendChild(text)
        document.getElementById('output-content').appendChild(paragraph)
    })
}

class SpeechService {
    constructor (callback, endPoint, projectName, subscriptionKey, apiVersion, deploymentName) {
        this.deploymentName = deploymentName
        this.model = new customEntityProject(endPoint, projectName, subscriptionKey, apiVersion)
        this.recognition = new webkitSpeechRecognition();
        this.final_transcript = "";
        // const grammar = "#JSGF V1.0; grammar fields; public <field> = start | syfol | end | date | assigned to | members | status | priority | estimated | hours | description | end date ;";
        // const speechRecognitionList = new webkitSpeechGrammarList();
        // speechRecognitionList.addFromString(grammar, 1);
        // recognition.grammars = speechRecognitionList;

        this.recognition.interimResults = true
        this.recognition.lang = 'en'
        this.recognition.continuous = true
        let = interim_transcript = '';
        this.recognition.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    this.final_transcript += event.results[i][0].transcript;
                    callback(this.final_transcript)
                }
                else {
                    callback(event.results[i][0].transcript)
                }
            }
        }

        this.recognition.onerror = (err) => {
            console.log(err);
        }
    }
    startListening () {
        this.final_transcript = "";
        this.recognition.start();
    }
    
    stopListening () {
        console.log(this.final_transcript)
        this.recognition.abort();
        this.model.submitTextToAnalyze(this.deploymentName, this.final_transcript).then(res => {
            setTimeout(() => {
                getResult(res.jobID)
            }, 500);
        })
        this.final_transcript = ""
    }
}