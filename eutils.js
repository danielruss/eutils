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
    webEnv:"",
    waitASec: async function(ms=1000){
        await new Promise(resolve => {
            setTimeout(() => resolve(true), ms);
        }); 
    },
    esearch: async function(database,query){
        const url = `${base_url}esearch.fcgi?db=${database}&term=${query}${this.webEnv}&usehistory=y`
        const results = await callGetAPI(url)
        if (!this.webEnv) {
            this.webEnv=`&WebEnv=${results.esearchresult.webenv}`
            console.log(`set webEnv to ${this.webEnv}`)
        }
        // modify the results to hold the db we queried against...
        results.database = database

        return results
    },
    esummary: async function(searchResults){
        const url = `${base_url}esummary.fcgi?db=${searchResults.database}&query_key=${searchResults.esearchresult.querykey}&WebEnv=${searchResults.esearchresult.webenv}`
        const results = await callGetAPI(url)
        return results
    }
};
window.apikey=apikey
window.eutils=eutils

async function callGetAPI(url){
    console.log(url)
   let response = await fetch(`${url}&retmode=json`)
   response = await response.json()
   console.log(response)
   return response;
}
