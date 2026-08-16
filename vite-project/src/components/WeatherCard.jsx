function WeatherCard() {

    return (
        <section className="weather-card">

            <h2>
                Today's Weather
            </h2>

            <div className="weather-info">

                <div>

                    <p className="temperature">
                        82°F
                    </p>

                    <p>
                        ☀️ Sunny
                    </p>

                </div>


                <div>

                    <strong>
                        Garden Tip
                    </strong>

                    <p>
                        Check soil moisture
                        before watering.
                    </p>

                </div>

            </div>

        </section>
    );

}


export default WeatherCard;