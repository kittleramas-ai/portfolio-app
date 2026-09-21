const abortController = new AbortController()

const endpoint = 'https://api.openai.com/v1/chat/completions';


useEffect(() => {
    async function fetchData(){
        try{
            const res = await fetch(endpoint,{signal:abortController.signal});
            const data = await res.json();
            console.log(data)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    fetchData();
    return () => {
        abortController.abort();
    }
},[])