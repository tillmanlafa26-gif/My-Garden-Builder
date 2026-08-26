export const hardinessZones = [

    "1a",
    "1b",

    "2a",
    "2b",

    "3a",
    "3b",

    "4a",
    "4b",

    "5a",
    "5b",

    "6a",
    "6b",

    "7a",
    "7b",

    "8a",
    "8b",

    "9a",
    "9b",

    "10a",
    "10b",

    "11a",
    "11b",

    "12a",
    "12b",

    "13a",
    "13b"

];


export const hardinessTemperatureRanges = {

    "1a": "-60°F to -55°F",
    "1b": "-55°F to -50°F",

    "2a": "-50°F to -45°F",
    "2b": "-45°F to -40°F",

    "3a": "-40°F to -35°F",
    "3b": "-35°F to -30°F",

    "4a": "-30°F to -25°F",
    "4b": "-25°F to -20°F",

    "5a": "-20°F to -15°F",
    "5b": "-15°F to -10°F",

    "6a": "-10°F to -5°F",
    "6b": "-5°F to 0°F",

    "7a": "0°F to 5°F",
    "7b": "5°F to 10°F",

    "8a": "10°F to 15°F",
    "8b": "15°F to 20°F",

    "9a": "20°F to 25°F",
    "9b": "25°F to 30°F",

    "10a": "30°F to 35°F",
    "10b": "35°F to 40°F",

    "11a": "40°F to 45°F",
    "11b": "45°F to 50°F",

    "12a": "50°F to 55°F",
    "12b": "55°F to 60°F",

    "13a": "60°F to 65°F",
    "13b": "65°F to 70°F"

};


export function getWholeHardinessZone(
    zone
) {

    if (
        !zone
    ) {

        return null;

    }


    const number =
        Number.parseInt(
            zone,
            10
        );


    if (
        Number.isNaN(
            number
        ) ||

        number < 1 ||

        number > 13
    ) {

        return null;

    }


    return number;

}