import React, { useState, useEffect } from "react";

interface Drug {
  name: string;
  price: number;
}

interface Location {
  name: string;
  drugs: Drug[];
}

const initialDrugs: Drug[] = [
  { name: "Lust Forge", price: 0 },
  { name: "Euphoria Hit", price: 0 },
  { name: "Rage X", price: 0 },
  { name: "Trauma Flush", price: 0 },
  { name: "Scent Heaven", price: 0 },
  { name: "Life Loop", price: 0 },
];

const locations: string[] = [
  "Bangalore",
  "New York",
  "Bangkok",
  "Singapore",
  "San Francisco",
];

const getRandomPrice = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateDrugPrices = (): Drug[] => {
  return initialDrugs.map((drug) => ({
    ...drug,
    price: getRandomPrice(
      drug.name === "Lust Forge"
        ? 300
        : drug.name === "Euphoria Hit"
        ? 150
        : drug.name === "Rage X"
        ? 10
        : drug.name === "Trauma Flush"
        ? 400
        : drug.name === "Scent Heaven"
        ? 600
        : 1500,
      drug.name === "Lust Forge"
        ? 800
        : drug.name === "Euphoria Hit"
        ? 650
        : drug.name === "Rage X"
        ? 150
        : drug.name === "Trauma Flush"
        ? 1500
        : drug.name === "Scent Heaven"
        ? 2000
        : 6000
    ),
  }));
};

const App: React.FC = () => {
  const [cash, setCash] = useState(5000);
  const [inventory, setInventory] = useState<{ [key: string]: number }>({
    "Lust Forge": 0,
    "Euphoria Hit": 0,
    "Rage X": 0,
    "Trauma Flush": 0,
    "Scent Heaven": 0,
    "Life Loop": 0,
  });
  const [currentLocation, setCurrentLocation] = useState(locations[0]);
  const [drugPrices, setDrugPrices] = useState<Drug[]>(generateDrugPrices());
  const [day, setDay] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [eventMessage, setEventMessage] = useState<string | null>(null);

  const handleBuy = (drug: Drug) => {
    if (cash >= drug.price) {
      setCash(cash - drug.price);
      setInventory({ ...inventory, [drug.name]: inventory[drug.name] + 1 });
    }
  };

  const handleSell = (drug: Drug) => {
    if (inventory[drug.name] > 0) {
      setCash(cash + drug.price);
      setInventory({ ...inventory, [drug.name]: inventory[drug.name] - 1 });
    }
  };

  const handleTravel = (location: string) => {
    setCurrentLocation(location);
    setDrugPrices(generateDrugPrices());
    setDay(day + 1);

    if (Math.random() < 0.3) {
      const events = [
        {
          message: "Government Crackdown! You lost some inventory.",
          effect: () => setInventory({ ...inventory, "Lust Forge": 0 }),
        },
        {
          message: "Addict Overdose! You lost some cash.",
          effect: () => setCash(cash - 500),
        },
        {
          message: "Tech Glitch! You lost some cash.",
          effect: () => setCash(cash - 300),
        },
      ];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setEventMessage(randomEvent.message);
      randomEvent.effect();
    }

    if (day >= 30) {
      setGameOver(true);
    }
  };

  const handleRestart = () => {
    setCash(5000);
    setInventory({
      "Lust Forge": 0,
      "Euphoria Hit": 0,
      "Rage X": 0,
      "Trauma Flush": 0,
      "Scent Heaven": 0,
      "Life Loop": 0,
    });
    setCurrentLocation(locations[0]);
    setDrugPrices(generateDrugPrices());
    setDay(1);
    setGameStarted(false);
    setGameOver(false);
    setEventMessage(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min- bg-gray-900 text-white p-4">
      {!gameStarted ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to AI Addiction Network!
          </h1>
          <p className="mb-8">
            In a world where virtual experiences rule, you're an underground
            trader dealing in addictive AI simulations.
          </p>
          <p className="mb-8">
            Buy low in one location, sell high in another. And avoid government
            crackdowns as you race to amass the ultimate fortune!
          </p>
          <p className="mb-8">
            Can you dominate the black market and become the AI Tycoon?
          </p>
          <button
            onClick={() => setGameStarted(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Start Game
          </button>
        </div>
      ) : gameOver ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Game Over!</h1>
          <p className="mb-8">
            You earned ${cash.toLocaleString()} - AI Drug Tycoon!
          </p>
          <button
            onClick={handleRestart}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Restart Game
          </button>
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <div className="flex justify-between mb-8">
            <div>
              <p>Cash: ${cash.toLocaleString()}</p>
              <p>Day: {day}/30</p>
            </div>
            <p>Current Location: {currentLocation}</p>
          </div>
          <table className="w-full mb-8">
            <thead>
              <tr>
                <th className="text-left">Drug</th>
                <th className="text-left">Price</th>
                <th className="text-left">Inventory</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drugPrices.map((drug, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="py-2">{drug.name}</td>
                  <td className="py-2">${drug.price.toLocaleString()}</td>
                  <td className="py-2">{inventory[drug.name]}</td>
                  <td className="py-2">
                    <button
                      onClick={() => handleBuy(drug)}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mr-2"
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => handleSell(drug)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                    >
                      Sell
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between">
            <p>Travel to:</p>
            {locations
              .filter((location) => location !== currentLocation)
              .map((location, index) => (
                <button
                  key={index}
                  onClick={() => handleTravel(location)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                >
                  {location}
                </button>
              ))}
          </div>
          {eventMessage && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
              <div className="bg-gray-800 p-8 rounded">
                <p className="mb-4">{eventMessage}</p>
                <button
                  onClick={() => setEventMessage(null)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
