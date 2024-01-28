const base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"

export const apikey = {
    getKey: function(){
        return localStorage.NCBI_KEY;
    },
    setKey: function(key){
        localStorage.NCBI_KEY = key
    }
};

export const eutils={
    toolEmail: "",
    toolName: "",
    webEnv:"",
    lastCall: new Date(0),

    waitASec: async function(ms){
        if (!ms){
            ms = apikey.getKey()?100:333
        }
        let tdiff = (new Date()-this.lastCall);

        if (tdiff<=ms){
            await new Promise(resolve => {
                setTimeout(() => resolve(true), ms);
            });
        }
    },
    esearch: async function(database,query){
        this.waitASec()
        query = preprocessQuery(query)
        const url = `${base_url}esearch.fcgi?db=${database}&term=${query}${this.webEnv}&usehistory=y`
        const results = await callGetAPI(url)
        this.lastCall=new Date();
        if (!this.webEnv) {
            this.webEnv=`&WebEnv=${results.esearchresult.webenv}`
            console.log(`set webEnv to ${this.webEnv}`)
        }
        // modify the results to hold the db we queried against...
        results.database = database

        return results
    },
    esummary: async function(searchResults){
        this.waitASec()
        const url = `${base_url}esummary.fcgi?db=${searchResults.database}&query_key=${searchResults.esearchresult.querykey}&WebEnv=${searchResults.esearchresult.webenv}`
        const results = await callGetAPI(url)
        this.lastCall = new Date();
        return results
    }
};


window.apikey=apikey
window.eutils=eutils

function createSearchParams(paramsArray){
    let searchResults = new URLSearchParams()
    paramsArray.forEach(param => {
        if (param.value) searchResults.append(param.key,param.value)
    });
    return searchResults;
}
window.createSearchParams=createSearchParams;

async function callGetAPI(url) {
    let params= createSearchParams( [
        {key:"retmode",value:"json"},
        {key:"api_key",value:apikey.getKey()},
        {key:"email",value:eutils.toolEmail},
        {key:"tool",value:eutils.toolName}
    ] )
    url = params.size>0?`${url}&${params.toString()}`:url
    console.log(url)

    let response = await fetch(`${url}`)
    response = await response.json()
    console.log(response)
    return response;
}



// page 24 of Entrez Programming Utilities Help
function preprocessQuery(query){
    return query
}