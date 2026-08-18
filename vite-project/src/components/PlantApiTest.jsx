import {
    useState
} from "react";


import {
    searchPlants
} from "../services/plantApi";


function PlantApiTest() {

    const [
        results,
        setResults
    ] = useState(
        []
    );


    const [
        loading,
        setLoading
    ] = useState(
        false
    );


    const [
        error,
        setError
    ] = useState(
        ""
    );


    async function testApi() {

        try {

            setLoading(
                true
            );


            setError(
                ""
            );


            const data =
                await searchPlants(
                    "tomato"
                );


            console.log(
                "Perenual response:",
                data
            );


            setResults(
                data.plants
            );

        } catch (error) {

            console.error(
                error
            );


            setError(
                error.message
            );

        } finally {

            setLoading(
                false
            );

        }

    }


    return (

        <section
            style={{
                padding: "20px"
            }}
        >

            <h2>
                Plant API Test
            </h2>


            <button
                type="button"
                onClick={
                    testApi
                }
            >

                Test Tomato Search

            </button>


            {
                loading && (

                    <p>
                        Loading...
                    </p>

                )
            }


            {
                error && (

                    <p>
                        {error}
                    </p>

                )
            }


            {
                results.map(
                    (plant) => (

                        <div
                            key={
                                plant.id
                            }
                        >

                            <strong>

                                {
                                    plant.name
                                }

                            </strong>


                            {
                                plant.scientificName && (

                                    <p>

                                        {
                                            plant.scientificName
                                        }

                                    </p>

                                )
                            }


                            {
                                plant.image && (

                                    <img
                                        src={
                                            plant.image
                                        }

                                        alt={
                                            plant.name
                                        }

                                        width="150"
                                    />

                                )
                            }

                        </div>

                    )
                )
            }


        </section>

    );

}


export default PlantApiTest;