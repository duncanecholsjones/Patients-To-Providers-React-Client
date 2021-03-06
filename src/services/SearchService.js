// Duncan Echols-Jones
// 2/18/2021
// REST API endpoints for Search. Uses Symptom Checker API 
// (https://rapidapi.com/priaid/api/symptom-checker/)
// For all data on conditions

export const getConditions = () =>
    fetch("https://priaid-symptom-checker-v1.p.rapidapi.com/issues?language=en-gb", {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "priaid-symptom-checker-v1.p.rapidapi.com",
            "x-rapidapi-key": process.env.REACT_APP_CONDITIONS_API_KEY
        }
    })
        .then(response => {
            return response.json();
        })
        .catch(err => {
            console.log(err);
        });

export const getConditionDetails = (conditionId) =>
    fetch(`https://priaid-symptom-checker-v1.p.rapidapi.com/issues/${conditionId}/info?language=en-gb`, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "priaid-symptom-checker-v1.p.rapidapi.com",
            "x-rapidapi-key": process.env.REACT_APP_CONDITIONS_DETAILS_API_KEY
        }
    })
        .then(response => {
            return response.json();
        })
        .catch(err => {
            console.log(err);
        });


export default {
    getConditions,
    getConditionDetails
}