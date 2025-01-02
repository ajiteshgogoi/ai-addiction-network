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
  const random = Math.random();
  const bias = random < 0.5 ? Math.pow(random, 2) : 1 - Math.pow(1 - random, 2);
  return Math.floor(bias * (max - min + 1)) + min;
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
  const [cash, setCash] = useState(2500);
  const [stash, setStash] = useState<{ [key: string]: number }>({
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
  const [specialEvent, setSpecialEvent] = useState<{ drug: string; location: string } | null>(null);
  const [cheapDrugEvent, setCheapDrugEvent] = useState<{ drug: string; location: string } | null>(null);

  const handleBuy = (drug: Drug) => {
    if (cash >= drug.price) {
      setCash(cash - drug.price);
      setStash({ ...stash, [drug.name]: stash[drug.name] + 1 });
    }
  };

  const handleSell = (drug: Drug) => {
    if (stash[drug.name] > 0) {
      setCash(cash + drug.price);
      setStash({ ...stash, [drug.name]: stash[drug.name] - 1 });
    }
  };

  const handleTravel = (location: string) => {
    setCurrentLocation(location);
    setDay(day + 1);

    if (specialEvent && location === specialEvent.location) {
      const drugPriceRange = drugPriceRanges.find(range => range.name === specialEvent.drug);
      if (drugPriceRange) {
        const newPrice = drugPriceRange.max * 1.5; // 50% higher than the maximum price
        setDrugPrices(prevPrices => prevPrices.map(drug =>
          drug.name === specialEvent.drug ? { ...drug, price: newPrice } : drug
        ));
      }
      setSpecialEvent(null);
    } else if (cheapDrugEvent && location === cheapDrugEvent.location) {
      const drugPriceRange = drugPriceRanges.find(range => range.name === cheapDrugEvent.drug);
      if (drugPriceRange) {
        const newPrice = Math.floor(drugPriceRange.min * 0.5); // 50% of the minimum price
        setDrugPrices(prevPrices => prevPrices.map(drug =>
          drug.name === cheapDrugEvent.drug ? { ...drug, price: newPrice } : drug
        ));
      }
      setCheapDrugEvent(null);
    } else {
      setDrugPrices(generateDrugPrices());
    }

    if (Math.random() < 0.3) {
      const events = [
        {
          message: "Government Crackdown! You lost some stash.",
          effect: () => {
            const randomDrug = initialDrugs[Math.floor(Math.random() * initialDrugs.length)].name;
            const penalty = Math.floor(Math.random() * 5) + 1;
            setStash({ ...stash, [randomDrug]: Math.max(0, stash[randomDrug] - penalty) });
          },
        },
        {
          message: "Addict Overdose! You lost some cash.",
          effect: () => {
            const penalty = Math.floor(Math.random() * 300) + 1;
            setCash(cash - penalty);
          },
        },
        {
          message: "Tech Glitch! You lost some cash.",
          effect: () => {
            const penalty = Math.floor(Math.random() * 300) + 1;
            setCash(cash - penalty);
          },
        },
        {
          message: "<Drug Name> is selling at crazy low rates!",
          effect: () => {
            const randomDrug = initialDrugs[Math.floor(Math.random() * initialDrugs.length)];
            const drugPriceRange = drugPriceRanges.find(range => range.name === randomDrug.name);
            if (drugPriceRange) {
              const newPrice = Math.floor(drugPriceRange.min * 0.5); // 50% of the minimum price
              setDrugPrices(prevPrices => prevPrices.map(drug =>
                drug.name === randomDrug.name ? { ...drug, price: newPrice } : drug
              ));
              setEventMessage(`${randomDrug.name} is selling at crazy low rates!`);
            }
          },
        },
        {
          message: `Addicts in <Location Name> will pay anything for <Drug Name>!`,
          effect: () => {
            const randomDrug = initialDrugs[Math.floor(Math.random() * initialDrugs.length)].name;
            const randomLocation = locations[Math.floor(Math.random() * locations.length)];
            setSpecialEvent({ drug: randomDrug, location: randomLocation });
            setEventMessage(`Addicts in ${randomLocation} will pay anything for ${randomDrug}!`);
          },
        },
        {
          message: `Go to <Location Name> for cheap <Drug Name>. Limited stash!`,
          effect: () => {
            const randomDrug = initialDrugs[Math.floor(Math.random() * initialDrugs.length)].name;
            const randomLocation = locations[Math.floor(Math.random() * locations.length)];
            setCheapDrugEvent({ drug: randomDrug, location: randomLocation });
            setEventMessage(`Go to ${randomLocation} for cheap ${randomDrug}. Limited stash!`);
          },
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
    setCash(2500);
    setStash({
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
    setSpecialEvent(null);
    setCheapDrugEvent(null);
  };

  const drugPriceRanges = [
    { name: "Lust Forge", min: 300, max: 800 },
    { name: "Euphoria Hit", min: 150, max: 650 },
    { name: "Rage X", min: 10, max: 150 },
    { name: "Trauma Flush", min: 400, max: 1500 },
    { name: "Scent Heaven", min: 600, max: 2000 },
    { name: "Life Loop", min: 1500, max: 6000 },
  ];

  const sortedDrugPriceRanges = [...drugPriceRanges].sort((a, b) => b.min - a.min);
  const sortedDrugPrices = [...drugPrices].sort((a, b) => b.price - a.price);

  return (
    <div className="flex flex-col items-center justify-center min- bg-gray-900 text-white p-4 font-mono">
      {!gameStarted ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Welcome to AI Addiction Network!
          </h1>
          <p className="mb-8 text-gray-300">
            💉 In a world where virtual experiences rule, you're an underground trader dealing in addictive AI simulations aka Virtual Drugs. 💊
          </p>
          <p className="mb-8 text-gray-300">
            🤑 Buy low in one location, sell high in another. And avoid government crackdowns as you race to amass the ultimate fortune!
          </p>
          <p className="mb-8 text-gray-300">Can you dominate the black market in 30 days and become the next AI Tycoon?</p>
          <div className="mb-8">
            <table className="w-full border-collapse border border-purple-500">
              <thead>
                <tr className="bg-purple-900">
                  <th className="p-2 border border-purple-500">Drug</th>
                  <th className="p-2 border border-purple-500">Price Range</th>
                </tr>
              </thead>
              <tbody>
                {sortedDrugPriceRanges.map((drug, index) => (
                  <tr key={index} className="border-b border-purple-500">
                    <td className="p-2 border border-purple-500">{drug.name}</td>
                    <td className="p-2 border border-purple-500">${drug.min} - ${drug.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => setGameStarted(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 transform hover:scale-105"
          >
            Start Game
          </button>
        </div>
      ) : gameOver ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Game Over!
          </h1>
          <p className="mb-8 text-gray-300">You earned ${cash.toLocaleString()}, AI Drug Tycoon!</p>
          <button
            onClick={handleRestart}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 transform hover:scale-105"
          >
            Restart Game
          </button>
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            AI Addiction Network
          </h1>
          <div className="flex justify-between mb-8 text-gray-300">
            <div>
              <p>Cash: ${cash.toLocaleString()}</p>
              <p>Day: {day}/30</p>
            </div>
            <p>Current Location: {currentLocation}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full mb-8 border-collapse border border-purple-500">
              <thead>
                <tr className="bg-purple-900">
                  <th className="p-2 border border-purple-500 text-left">Drug</th>
                  <th className="p-2 border border-purple-500 text-left">Price</th>
                  <th className="p-2 border border-purple-500 text-left">Stash</th>
                  <th className="p-2 border border-purple-500 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedDrugPriceRanges.map((range, index) => {
                  const drug = drugPrices.find(d => d.name === range.name);
                  return drug ? (
                    <tr key={index} className="border-b border-purple-500">
                      <td className="p-2 border border-purple-500">{drug.name}</td>
                      <td className="p-2 border border-purple-500">${drug.price.toLocaleString()}</td>
                      <td className="p-2 border border-purple-500">{stash[drug.name]}</td>
                      <td className="p-2 border border-purple-500">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => handleBuy(drug)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2 rounded transition-all duration-300 transform hover:scale-105"
                          >
                            Buy
                          </button>
                          <button
                            onClick={() => handleSell(drug)}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded transition-all duration-300 transform hover:scale-105"
                          >
                            Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : null;
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <p className="w-full text-gray-300">Travel to:</p>
            {locations
              .filter((location) => location !== currentLocation)
              .map((location, index) => (
                <button
                  key={index}
                  onClick={() => handleTravel(location)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded flex-1 sm:flex-none transition-all duration-300 transform hover:scale-105"
                >
                  {location}
                </button>
              ))}
          </div>
          {eventMessage && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
              <div className="bg-purple-900 p-8 rounded">
                <p className="mb-4 text-gray-300">{eventMessage}</p>
                <button
                  onClick={() => setEventMessage(null)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 transform hover:scale-105"
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