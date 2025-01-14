import React, { useState, useEffect } from "react";
import { getLeaderboard, addScore } from './api/leaderboard';

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
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [quantity, setQuantity] = useState<number | string>(1);
  const [isBuying, setIsBuying] = useState(false);
  const [inventoryCapacity, setInventoryCapacity] = useState(100);
  const [inventoryUpgradeCount, setInventoryUpgradeCount] = useState(0);
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{name: string, score: number}[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  
  // Load leaderboard on mount
  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLeaderboardLoading(true);
        setLeaderboardError(null);
        const data = await getLeaderboard();
        console.log('Initial leaderboard data:', data);
        setLeaderboard(data || []);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
        setLeaderboardError('Failed to load leaderboard. Please try again later.');
        setLeaderboard([]);
      } finally {
        setLeaderboardLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  const handleBuy = (drug: Drug) => {
    setSelectedDrug(drug);
    setIsBuying(true);
  };

  const handleSell = (drug: Drug) => {
    setSelectedDrug(drug);
    setIsBuying(false);
  };

  const handleConfirm = () => {
    if (selectedDrug) {
      const qty = quantity === "" ? 0 : Number(quantity);
      if (isBuying) {
        const totalCost = selectedDrug.price * qty;
        const totalStash = Object.values(stash).reduce((acc, curr) => acc + curr, 0);
        if (cash >= totalCost && totalStash + qty <= inventoryCapacity) {
          setCash(Math.max(0, cash - totalCost));
          setStash({ ...stash, [selectedDrug.name]: stash[selectedDrug.name] + qty });
        } else if (totalStash + qty > inventoryCapacity) {
          setEventMessage("Inventory limit reached! You cannot buy more drugs.");
        } else {
          setEventMessage("Not enough cash to buy this quantity.");
        }
      } else {
        if (stash[selectedDrug.name] >= qty) {
          setCash(cash + selectedDrug.price * qty);
          setStash({ ...stash, [selectedDrug.name]: stash[selectedDrug.name] - qty });
        } else {
          setEventMessage("Not enough stash to sell this quantity.");
        }
      }
    }
    setSelectedDrug(null);
    setQuantity(1);
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
            setCash(Math.max(0, cash - penalty));
          },
        },
        {
          message: "Tech Glitch! You lost some cash.",
          effect: () => {
            const penalty = Math.floor(Math.random() * 300) + 1;
            setCash(Math.max(0, cash - penalty));
          },
        },
        {
          message: `${initialDrugs[Math.floor(Math.random() * initialDrugs.length)].name} is selling at crazy low rates!`,
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
          message: `Addicts in ${locations.filter(loc => loc !== location)[Math.floor(Math.random() * (locations.filter(loc => loc !== location).length))]} will pay anything for ${initialDrugs[Math.floor(Math.random() * initialDrugs.length)].name}!`,
          effect: () => {
            const randomDrug = initialDrugs[Math.floor(Math.random() * initialDrugs.length)].name;
            const availableLocations = locations.filter(loc => loc !== location);
            const randomLocation = availableLocations[Math.floor(Math.random() * availableLocations.length)];
            setSpecialEvent({ drug: randomDrug, location: randomLocation });
            setEventMessage(`Addicts in ${randomLocation} will pay anything for ${randomDrug}!`);
          },
        },
        {
          message: `Go to ${locations.filter(loc => loc !== location)[Math.floor(Math.random() * (locations.filter(loc => loc !== location).length))]} for cheap ${initialDrugs[Math.floor(Math.random() * initialDrugs.length)].name}. Limited stash!`,
          effect: () => {
            const randomDrug = initialDrugs[Math.floor(Math.random() * initialDrugs.length)].name;
            const availableLocations = locations.filter(loc => loc !== location);
            const randomLocation = availableLocations[Math.floor(Math.random() * availableLocations.length)];
            setCheapDrugEvent({ drug: randomDrug, location: randomLocation });
            setEventMessage(`Go to ${randomLocation} for cheap ${randomDrug}. Limited stash!`);
          },
        },
                {
                  message: `Do you want to pay ${Math.floor(Math.random() * (800 - 250 + 1)) + 250} to increase your inventory capacity by 50 units?`,
                  effect: () => {
                    if (inventoryUpgradeCount < 3) {
                      const amount = Math.floor(Math.random() * (800 - 250 + 1)) + 250;                  
                      if (cash >= amount) {
                        setEventMessage(`Do you want to pay $${amount} to increase your inventory capacity by 50 units?`);
                        setSpecialEvent({ drug: "Inventory Upgrade", location: "" });
                        setCheapDrugEvent({ drug: "Inventory Upgrade", location: "" });
                        setSelectedDrug({ name: "Inventory Upgrade", price: amount });
                      }
                    }
                  },
                },
      ];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setEventMessage(randomEvent.message);
      randomEvent.effect();
    }

    if (day >= 30) {
      setGameOver(true);
      // Check if score qualifies for leaderboard
      if (leaderboard.length < 10 || cash > leaderboard[leaderboard.length - 1].score) {
        setShowNameInput(true);
      }
    }
  };

  const handleRestart = async () => {
    // Reset game state
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
    setInventoryCapacity(100);
    setInventoryUpgradeCount(0);
    
    // Refresh leaderboard
    try {
      setLeaderboardLoading(true);
      setLeaderboardError(null);
      const data = await getLeaderboard();
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Failed to refresh leaderboard:', error);
      setLeaderboardError('Failed to refresh leaderboard. Please try again later.');
    } finally {
      setLeaderboardLoading(false);
    }
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

  const totalStash = Object.values(stash).reduce((acc, curr) => acc + curr, 0);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 font-mono">
      {!gameStarted ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Welcome to AI Addiction Network!
          </h1>
          <p className="mb-4 text-gray-300">
            💉 In a world where virtual experiences rule, you're an underground trader dealing in addictive AI simulations aka Virtual Drugs. 💊
          </p>
          <p className="mb-4 text-gray-300">
            🤑 Buy low in one location, sell high in another. Avoid government crackdowns as you race to amass the ultimate fortune.
          </p>
          <p className="mb-4 text-gray-300">
           💰 You have 30 days to dominate the black market and make as much money as possible! 💲
          </p>
          <p className="mb-8 text-gray-300">Can you become the next AI Drug Tycoon?</p>
          <div className="mb-8">
            <table className="w-full border-separate border-spacing-0 border border-purple-500 rounded-lg overflow-hidden rounded-lg">
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
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-2xl py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 mb-1"
          >
            Start Game
          </button>
        </div>
      ) : gameOver ? (
        <div className="text-center w-full px-4">
          <h1 className="text-4xl md:text-6xl uppercase font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            GAME OVER!
          </h1>
          <p className="mb-8 text-gray-300 text-lg md:text-base">You earned ${cash.toLocaleString()}, AI Drug Tycoon!</p>

          {showNameInput ? (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
              <div className="bg-purple-900 p-8 rounded-lg">
                <p className="mb-4 text-gray-300">👑 You made the top 10! Enter your name:</p>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full p-2 mb-4 bg-purple-800 text-white rounded"
                  maxLength={20}
                />
                <button
                  onClick={async () => {
                    if (!playerName.trim()) {
                      setEventMessage('Please enter your name');
                      return;
                    }
                    
                    try {
                      await addScore(playerName, cash);
                      // Refresh leaderboard with retry logic
                      let retries = 3;
                      while (retries > 0) {
                        try {
                          const updatedLeaderboard = await getLeaderboard();
                          if (updatedLeaderboard) {
                            setLeaderboard(updatedLeaderboard);
                            setShowNameInput(false);
                            setEventMessage('Score submitted successfully!');
                            break;
                          }
                        } catch (error) {
                          console.error('Failed to fetch leaderboard:', error);
                        }
                        retries--;
                        await new Promise(resolve => setTimeout(resolve, 500));
                      }
                    } catch (error) {
                      console.error('Failed to save score:', error);
                      setEventMessage('Failed to submit score. Please try again.');
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 transform hover:scale-105"
                >
                  Submit
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                👑 Leaderboard
                </h2>
                <table className="w-full border-separate border-spacing-0 border border-purple-500 rounded-lg overflow-hidden rounded-lg">
                  <thead>
                    <tr className="bg-purple-900">
                      <th className="p-2 border border-purple-500">Rank</th>
                      <th className="p-2 border border-purple-500">Name</th>
                      <th className="p-2 border border-purple-500">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                  {leaderboardError ? (
                    <tr>
                      <td colSpan={3} className="p-2 border border-purple-500 text-center text-red-400">
                        {leaderboardError}
                      </td>
                    </tr>
                  ) : leaderboard.length > 0 ? (
                    leaderboard.map((entry, index) => (
                      <tr key={index} className="border-b border-purple-500">
                        <td className="p-2 border border-purple-500">
                          {index === 0 ? '👑 #1' : `#${index + 1}`}
                        </td>
                        <td className="p-2 border border-purple-500">{entry.name}</td>
                        <td className="p-2 border border-purple-500">${entry.score.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-2 border border-purple-500 text-center">
                        No scores yet!
                      </td>
                    </tr>
                  )}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap gap-4 w-full px-4 justify-center">
                <button
                  onClick={handleRestart}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg w-full sm:w-[200px] transition-all duration-300 transform hover:scale-105 text-center"
                  style={{ height: '48px' }}
                >
                  Restart Game
                </button>
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg w-full sm:w-[200px] transition-all duration-300 transform hover:scale-105 text-center"
                  style={{ height: '48px' }}
                  onClick={async () => {
                    try {
                      setLeaderboardLoading(true);
                      setLeaderboardError(null);
                      const data = await getLeaderboard();
                      if (!data) {
                        throw new Error('No data received');
                      }
                      setLeaderboard(data);
                      setEventMessage('Leaderboard updated successfully!');
                    } catch (error) {
                      console.error('Failed to refresh leaderboard:', error);
                      setLeaderboardError('Failed to refresh leaderboard. Please try again later.');
                      setEventMessage('Failed to refresh leaderboard');
                    } finally {
                      setLeaderboardLoading(false);
                    }
                  }}
                  disabled={leaderboardLoading}
                >
                  {leaderboardLoading ? 'Refreshing...' : 'Refresh Leaderboard'}
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <h1 
            className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleRestart}
          >
            AI Addiction Network
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-gray-300">
            <div className="bg-purple-800 p-4 rounded">
              <p className="text-sm text-purple-300">Cash</p>
              <p className="text-lg font-bold">${cash.toLocaleString()}</p>
            </div>
            <div className="bg-purple-800 p-4 rounded">
              <p className="text-sm text-purple-300">Day</p>
              <p className="text-lg font-bold">{day}/30</p>
            </div>
            <div className="bg-purple-800 p-4 rounded">
              <p className="text-sm text-purple-300">Inventory</p>
              <p className="text-lg font-bold">{totalStash}/{inventoryCapacity}</p>
            </div>
            <div className="bg-purple-800 p-4 rounded">
              <p className="text-sm text-purple-300">Location</p>
              <p className="text-lg font-bold">{currentLocation}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full mb-8 border-separate border-spacing-0 border border-purple-500 rounded-lg overflow-hidden rounded-lg">
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
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg flex-1 text-center transition-all duration-300 transform hover:scale-105"
                >
                  {location}
                </button>
              ))}
          </div>
          {eventMessage && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
              <div className="bg-purple-900 p-8 rounded-lg">
                <p className="mb-4 text-gray-300">{eventMessage}</p>
                {selectedDrug && selectedDrug.name === "Inventory Upgrade" ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setCash(cash - selectedDrug.price);
                        setInventoryCapacity(inventoryCapacity + 50);
                        setInventoryUpgradeCount(inventoryUpgradeCount + 1);
                        setEventMessage(null);
                        setSelectedDrug(null);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 transform hover:scale-105"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => {
                        setEventMessage(null);
                        setSelectedDrug(null);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 transform hover:scale-105"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEventMessage(null)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 transform hover:scale-105"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          )}
          {selectedDrug && selectedDrug.name !== "Inventory Upgrade" && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
              <div className="bg-purple-900 p-8 rounded">
                <p className="mb-4 text-gray-300">Available Cash: ${cash.toLocaleString()}</p>
                <p className="mb-4 text-gray-300">{isBuying ? "Buy" : "Sell"} {selectedDrug.name} at ${selectedDrug.price.toLocaleString()} each</p>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full p-2 mb-4 bg-purple-800 text-white rounded"
                  min="1"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirm}
                    className={`${isBuying ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white font-bold py-2 px-4 rounded transition-all duration-300 transform hover:scale-105`}
                  >
                    {isBuying ? "Buy" : "Sell"}
                  </button>
                  <button
                    onClick={() => setSelectedDrug(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 transform hover:scale-105"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    <div className="w-full py-4 flex flex-col items-center bg-gray-900 mt-auto">
      <a 
        href="https://ko-fi.com/gogoi" 
        target="_blank" 
        rel="noopener noreferrer"
        className="bg-[#f5f5f5] hover:bg-[#e0e0e0] text-gray-800 font-bold py-2 px-4 rounded-lg shadow-md flex items-center gap-2 transition-colors duration-300"
      >
      <img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="Ko-fi" className="w-6 h-6" />
      Buy Me a Coffee
      </a>
      <p className="text-gray-400 text-sm mt-2">© ajitesh gogoi</p>
    </div>
    </>
  );
};

export default App;
