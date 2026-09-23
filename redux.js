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


const movies = [
    { id: 1, title: 'The Shawshank Redemption', year: 1994 },
    { id: 2, title: 'The Godfather', year: 1972 },
    { id: 3, title: 'The Dark Knight', year: 2008 },
    { id: 4, title: 'Pulp Fiction', year: 1994 },
    { id: 5, title: 'The Lord of the Rings: The Return of the King', year: 2003 },]

    console.log(Object.groupBy(movies, movie=>movie.year));
    // Output:
    // {
    //   1994: [
    //     { id: 1, title: 'The Shawshank Redemption', year: 1994 },
    //     { id: 4, title: 'Pulp Fiction', year: 1994 }
    //   ],
    //   1972: [
    //     { id: 2, title: 'The Godfather', year: 1972 }
    //   ],
    //   2008: [
    //     { id: 3, title: 'The Dark Knight', year: 2008 }
    //   ],
    //   2003: [
    //     { id: 5, title: 'The Lord of the Rings: The Return of the King', year: 2003 }
    //   ]
    // }


 