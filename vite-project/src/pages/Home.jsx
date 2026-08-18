import Header
    from "../components/Header";

import WeatherCard
    from "../components/WeatherCard";

import GardenProfile
    from "../components/GardenProfile";

import MyGardenPlants
    from "../components/MyGardenPlants";

import WateringReminder
    from "../components/WateringReminder";

import TaskForm
    from "../components/TaskForm";

import TaskList
    from "../components/TaskList";

import SustainabilityScore
    from "../components/SustainabilityScore";

import BottomNav
    from "../components/BottomNav";


function Home({
    tasks,
    onAddTask,
    onToggleTask,
    sustainabilityScore,
    gardenProfile,
    gardenPlants,
    onRemoveGardenPlant,
    wateringRecords,
    onMarkPlantWatered
}) {

    return (

        <div className="app-container">


            <Header />


            <WeatherCard />


            <GardenProfile
                gardenProfile={
                    gardenProfile
                }
            />


            <MyGardenPlants
                gardenPlants={
                    gardenPlants
                }

                onRemoveGardenPlant={
                    onRemoveGardenPlant
                }
            />


            <WateringReminder
                gardenPlants={
                    gardenPlants
                }

                wateringRecords={
                    wateringRecords
                }

                onMarkPlantWatered={
                    onMarkPlantWatered
                }
            />


            <TaskForm
                onAddTask={
                    onAddTask
                }
            />


            <TaskList
                tasks={
                    tasks
                }

                onToggle={
                    onToggleTask
                }
            />


            <SustainabilityScore
                score={
                    sustainabilityScore
                }
            />


            <BottomNav />


        </div>

    );

}


export default Home;